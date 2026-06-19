/**
 * Forward Education Neopixel Module — MakeCode Extension
 *
 * Student-friendly blocks for controlling WS2812B neopixel strips, rings, and
 * matrices connected via the Forward Education Jacdac Neopixel module.
 *
 * Wraps the Jacdac LED Strip client (modules.LedStripClient) from pxt-jacdac.
 *
 * Brightness is applied in software (RGB scaling). Fills/clear use a single
 * atomic `setall`; matrix frames are pushed as chunked multi-`setone` programs.
 */

/**
 * Built-in strip/ring animations (run on the module firmware).
 */
enum NeoAnimation {
    //% block="rainbow"
    Rainbow,
    //% block="comet"
    Comet,
    //% block="sparkle"
    Sparkle,
    //% block="running lights"
    RunningLights,
    //% block="color wipe"
    ColorWipe,
    //% block="theater chase"
    TheaterChase,
    //% block="firefly"
    Firefly
}

/**
 * How a matrix's LEDs are wired (the order pixels 0,1,2… run through it).
 */
enum MatrixLayout {
    //% block="rows, left to right"
    Progressive,
    //% block="rows, zig-zag"
    Serpentine,
    //% block="columns, top to bottom"
    Columns,
    //% block="columns, zig-zag"
    ColumnsSerpentine
}

//% color="#FF6600" icon="" weight=90 block="Neopixel"
//% groups="['Pixels', 'Matrix', 'Animations', 'Configuration']"
namespace fwdNeopixel {
    const strip = new modules.LedStripClient("fwd neopixel")

    // ── Internal state ────────────────────────────────────────────
    let _brightness = 30                 // 0–100, percent (software scaling)
    let _pixels: number[] = []           // logical (un-scaled) RGB per pixel
    let _uniform = false                 // whole strip is one color (_fillColor)
    let _fillColor = 0
    let _initialized = false

    // Matrix layout (0 = not configured as a matrix)
    let _rows = 0
    let _cols = 0
    let _layout = MatrixLayout.Progressive
    let _dirty = false                   // matrix buffer changed, needs a flush

    const SEND_GAP = 6                   // ms between sends

    // Start the client and wait for the module to connect before the first
    // command — commands sent during bus enumeration are dropped. Also start a
    // background flusher that pushes the matrix buffer as a single batched frame
    // shortly after any draw, so a loop of draws shows "all at once" (fast) and
    // reliably, instead of one slow packet per pixel.
    function ensureInit(): void {
        if (_initialized) return
        _initialized = true
        strip.setBrightness(100)         // firmware at full; we scale in software
        pauseUntil(() => strip.isConnected(), 3000)
        pause(50)
        control.runInParallel(() => {
            for (;;) {
                if (_dirty) {
                    _dirty = false
                    pushFrame(_pixels, true)
                }
                pause(15)
            }
        })
    }

    // Scale an RGB color by the current software brightness.
    function dim(color: number): number {
        const r = Math.idiv(((color >> 16) & 0xff) * _brightness, 100)
        const g = Math.idiv(((color >> 8) & 0xff) * _brightness, 100)
        const b = Math.idiv((color & 0xff) * _brightness, 100)
        return (r << 16) | (g << 8) | b
    }

    // Send one light program twice (Run commands are unacknowledged; a second
    // copy covers an occasional drop). lightEncode consumes args via shift(),
    // so each copy gets its own slice().
    function send(prog: string, args?: number[]): void {
        strip.runEncoded(prog, args ? args.slice() : undefined)
        pause(SEND_GAP)
        strip.runEncoded(prog, args ? args.slice() : undefined)
        pause(SEND_GAP)
    }

    // Re-send every stored pixel at the current brightness (mixed colors).
    function refresh(): void {
        for (let i = 0; i < _pixels.length; i++) {
            send("setone % # wait 1", [i, dim(_pixels[i])])
        }
    }

    // Fill the whole strip with one color (0 clears) in a single atomic command.
    function fill(color: number): void {
        for (let i = 0; i < _pixels.length; i++) _pixels[i] = color
        _uniform = true
        _fillColor = color
        send("setall # wait 1", [dim(color)])
    }

    // Send one chunk (a multi-`setone` program). `reliable` sends it twice to
    // cover a dropped packet (used for static draws; animation frames self-heal
    // on the next frame, so they send once).
    function sendChunk(prog: string, args: number[], reliable: boolean): void {
        strip.runEncoded(prog, args.slice())
        pause(SEND_GAP)
        if (reliable) {
            strip.runEncoded(prog, args.slice())
            pause(SEND_GAP)
        }
    }

    // Push a full frame of raw RGB colors as chunked multi-`setone` programs
    // (kept under the Jacdac packet size) — the whole frame in a handful of
    // packets instead of one per pixel.
    function pushFrame(frame: number[], reliable = false): void {
        let prog = ""
        let args: number[] = []
        let n = 0
        for (let i = 0; i < frame.length; i++) {
            prog += "setone % # "
            args.push(i)
            args.push(dim(frame[i]))
            n++
            if (n >= 25) {               // flush a chunk (~150 bytes)
                sendChunk(prog + "wait 1", args, reliable)
                prog = ""
                args = []
                n = 0
            }
        }
        if (n > 0) sendChunk(prog + "wait 1", args, reliable)
        _uniform = false
    }

    // (row, col) → flat pixel index for the configured wiring; -1 if off-grid.
    function matrixIndex(row: number, col: number): number {
        if (_rows <= 0 || _cols <= 0) return -1
        if (row < 0 || row >= _rows || col < 0 || col >= _cols) return -1
        if (_layout == MatrixLayout.Progressive) return row * _cols + col
        if (_layout == MatrixLayout.Serpentine) {
            const c = (row % 2 == 1) ? _cols - 1 - col : col   // odd rows reversed
            return row * _cols + c
        }
        if (_layout == MatrixLayout.Columns) return col * _rows + row
        // ColumnsSerpentine: odd columns run bottom-to-top
        const r = (col % 2 == 1) ? _rows - 1 - row : row
        return col * _rows + r
    }

    // ── Pixel Control ─────────────────────────────────────────────

    /**
     * Set a single pixel to a color. Applies immediately.
     * @param pixel the pixel index (starting from 0)
     * @param color the RGB color value
     */
    //% block="set pixel $pixel to $color"
    //% group="Pixels"
    //% pixel.min=0 pixel.defl=0
    //% color.shadow="colorNumberPicker"
    //% weight=100
    export function setPixelColor(pixel: number, color: number): void {
        ensureInit()
        while (_pixels.length <= pixel) _pixels.push(0)
        _pixels[pixel] = color
        _uniform = false
        send("setone % # wait 1", [pixel, dim(color)])
    }

    /**
     * Set all pixels to the same color. Applies immediately.
     * @param color the RGB color value
     */
    //% block="set all pixels to $color"
    //% group="Pixels"
    //% color.shadow="colorNumberPicker"
    //% weight=95
    export function setAllPixels(color: number): void {
        ensureInit()
        fill(color)
    }

    /**
     * Turn off all pixels.
     */
    //% block="clear all pixels"
    //% group="Pixels"
    //% weight=85
    export function clear(): void {
        ensureInit()
        fill(0)
    }

    // ── Matrix ────────────────────────────────────────────────────

    /**
     * Set the color of one pixel in the matrix.
     * @param row the row (0 = top)
     * @param column the column (0 = left)
     * @param color the RGB color value
     */
    //% block="set matrix pixel row $row column $column to $color"
    //% group="Matrix"
    //% row.min=0 row.defl=0
    //% column.min=0 column.defl=0
    //% color.shadow="colorNumberPicker"
    //% weight=84
    export function setMatrixPixel(row: number, column: number, color: number): void {
        ensureInit()
        const i = matrixIndex(row, column)
        if (i >= 0) {
            _pixels[i] = color
            _uniform = false
            _dirty = true                // shown by the background flusher
        }
    }

    /**
     * Set all pixels in a row to the same color.
     * @param row the row index (0 = top)
     * @param color the RGB color value
     */
    //% block="set row $row to $color"
    //% group="Matrix"
    //% row.min=0 row.defl=0
    //% color.shadow="colorNumberPicker"
    //% weight=83
    export function setRow(row: number, color: number): void {
        for (let c = 0; c < _cols; c++) setMatrixPixel(row, c, color)
    }

    /**
     * Set all pixels in a column to the same color.
     * @param column the column index (0 = left)
     * @param color the RGB color value
     */
    //% block="set column $column to $color"
    //% group="Matrix"
    //% column.min=0 column.defl=0
    //% color.shadow="colorNumberPicker"
    //% weight=82
    export function setColumn(column: number, color: number): void {
        for (let r = 0; r < _rows; r++) setMatrixPixel(r, column, color)
    }

    /**
     * Fill a rectangular area of the matrix with a color.
     * @param row top-left row
     * @param column top-left column
     * @param width number of columns to fill
     * @param height number of rows to fill
     * @param color the RGB color value
     */
    //% block="fill area row $row column $column width $width height $height with $color"
    //% group="Matrix"
    //% row.min=0 row.defl=0
    //% column.min=0 column.defl=0
    //% width.min=1 width.defl=3
    //% height.min=1 height.defl=3
    //% color.shadow="colorNumberPicker"
    //% weight=81
    export function fillRect(row: number, column: number, width: number, height: number, color: number): void {
        for (let r = row; r < row + height; r++)
            for (let c = column; c < column + width; c++)
                setMatrixPixel(r, c, color)
    }

    // 5-tall × 3-wide pixel font. Each row is a 3-bit mask: bit2=left, bit0=right.
    // Index 0 = space, 1–10 = '0'–'9', 11–36 = 'A'–'Z'.
    const FONT_DATA = [
        0, 0, 0, 0, 0,   // space
        7, 5, 5, 5, 7,   // 0
        2, 6, 2, 2, 7,   // 1
        7, 1, 7, 4, 7,   // 2
        7, 1, 7, 1, 7,   // 3
        5, 5, 7, 1, 1,   // 4
        7, 4, 7, 1, 7,   // 5
        7, 4, 7, 5, 7,   // 6
        7, 1, 1, 1, 1,   // 7
        7, 5, 7, 5, 7,   // 8
        7, 5, 7, 1, 7,   // 9
        7, 5, 7, 5, 5,   // A
        6, 5, 6, 5, 6,   // B
        3, 4, 4, 4, 3,   // C
        6, 5, 5, 5, 6,   // D
        7, 4, 7, 4, 7,   // E
        7, 4, 7, 4, 4,   // F
        3, 4, 5, 5, 3,   // G
        5, 5, 7, 5, 5,   // H
        7, 2, 2, 2, 7,   // I
        1, 1, 1, 5, 7,   // J
        5, 6, 4, 6, 5,   // K
        4, 4, 4, 4, 7,   // L
        7, 5, 5, 5, 5,   // M
        6, 5, 5, 5, 5,   // N
        2, 5, 5, 5, 2,   // O
        7, 5, 7, 4, 4,   // P
        2, 5, 5, 6, 3,   // Q
        7, 5, 7, 6, 5,   // R
        7, 4, 2, 1, 7,   // S
        7, 2, 2, 2, 2,   // T
        5, 5, 5, 5, 7,   // U
        5, 5, 5, 5, 2,   // V
        5, 5, 5, 7, 5,   // W
        5, 5, 2, 5, 5,   // X
        5, 5, 7, 2, 2,   // Y
        7, 1, 2, 4, 7    // Z
    ]

    function fontIndex(ch: number): number {
        if (ch == 32) return 0
        if (ch >= 48 && ch <= 57) return ch - 47          // 0–9
        if (ch >= 65 && ch <= 90) return ch - 54          // A–Z
        if (ch >= 97 && ch <= 122) return ch - 86         // a–z → A–Z
        return 0
    }

    function hueToRgb(hue: number): number {
        hue = hue % 360
        const hi = Math.idiv(hue, 60)
        const f = Math.idiv((hue % 60) * 255, 60)
        const q = 255 - f
        if (hi == 0) return (255 << 16) | (f << 8)
        if (hi == 1) return (q << 16) | (255 << 8)
        if (hi == 2) return (255 << 8) | f
        if (hi == 3) return (q << 8) | 255
        if (hi == 4) return (f << 16) | 255
        return (255 << 16) | q
    }

    /**
     * Scroll text across the matrix from right to left.
     * The font auto-scales to the matrix height and is centered vertically.
     * @param text the text to display (A–Z, 0–9, space)
     * @param color the pixel color
     * @param speed milliseconds per scroll step
     */
    //% block="scroll text $text in $color||speed $speed ms"
    //% group="Matrix"
    //% text.defl="HELLO"
    //% color.shadow="colorNumberPicker"
    //% speed.min=20 speed.max=500 speed.defl=80
    //% expandableArgumentMode="toggle"
    //% weight=78
    export function scrollText(text: string, color: number, speed = 80): void {
        ensureInit()
        if (_rows < 1 || _cols < 1) return
        _dirty = false                   // we drive frames directly here
        // Integer-scale the 3x5 font to fit the matrix height, and center it.
        const sc = Math.max(1, Math.idiv(_rows, 5))        // 5-tall -> 1x, 10 -> 2x …
        const rowOff = Math.max(0, Math.idiv(_rows - 5 * sc, 2))
        const advance = 4 * sc                             // 3 glyph + 1 spacer, scaled
        const totalCols = text.length * advance
        const frame: number[] = []
        for (let i = 0; i < _rows * _cols; i++) frame.push(0)
        for (let s = 0; s <= _cols + totalCols; s++) {
            for (let i = 0; i < frame.length; i++) frame[i] = 0
            for (let m = 0; m < _cols; m++) {
                const cc = m - _cols + s                   // virtual (scaled) column
                if (cc < 0 || cc >= totalCols) continue
                const charIdx = Math.idiv(cc, advance)
                const fcol = Math.idiv(cc % advance, sc)   // 0–2 glyph, 3 = spacer
                if (charIdx >= text.length || fcol >= 3) continue
                const fi = fontIndex(text.charCodeAt(charIdx))
                for (let r = 0; r < _rows; r++) {
                    const vr = r - rowOff                   // position within scaled glyph
                    if (vr < 0 || vr >= 5 * sc) continue
                    const frow = Math.idiv(vr, sc)          // 0–4
                    if (((FONT_DATA[fi * 5 + frow] >> (2 - fcol)) & 1) == 1) {
                        const idx = matrixIndex(r, m)
                        if (idx >= 0) frame[idx] = color
                    }
                }
            }
            pushFrame(frame)
            basic.pause(speed)
        }
        clear()
    }

    /**
     * Scroll a number across the matrix from right to left.
     * @param value the number to display
     * @param color the pixel color
     * @param speed milliseconds per scroll step
     */
    //% block="scroll number $value in $color||speed $speed ms"
    //% group="Matrix"
    //% value.defl=0
    //% color.shadow="colorNumberPicker"
    //% speed.min=20 speed.max=500 speed.defl=80
    //% expandableArgumentMode="toggle"
    //% weight=77
    export function scrollNumber(value: number, color: number, speed = 80): void {
        scrollText("" + Math.round(value), color, speed)
    }

    /**
     * Animate a rainbow sweeping across the matrix columns.
     * @param cycles how many full color cycles to run
     * @param speed milliseconds between frames
     */
    //% block="matrix rainbow $cycles times||speed $speed ms"
    //% group="Matrix"
    //% cycles.min=1 cycles.max=20 cycles.defl=3
    //% speed.min=10 speed.max=200 speed.defl=40
    //% expandableArgumentMode="toggle"
    //% weight=76
    export function matrixRainbow(cycles: number, speed = 40): void {
        ensureInit()
        if (_rows < 1 || _cols < 1) return
        _dirty = false                   // we drive frames directly here
        const frame: number[] = []
        for (let i = 0; i < _rows * _cols; i++) frame.push(0)
        const steps = cycles * 72            // 72 steps per hue cycle (360 / 5°)
        for (let step = 0; step < steps; step++) {
            const offset = (step * 5) % 360
            for (let r = 0; r < _rows; r++) {
                for (let c = 0; c < _cols; c++) {
                    const hue = (Math.idiv(c * 360, _cols) + offset) % 360
                    const idx = matrixIndex(r, c)
                    if (idx >= 0) frame[idx] = hueToRgb(hue)
                }
            }
            pushFrame(frame)
            basic.pause(speed)
        }
        clear()
    }

    // ── Animations ────────────────────────────────────────────────

    /**
     * Show a built-in animation for a duration. Works on strips and rings.
     * @param animation which animation to play
     * @param duration how long to run, in milliseconds
     */
    //% block="show $animation for $duration ms"
    //% group="Animations"
    //% duration.shadow="timePicker"
    //% duration.defl=2000
    //% weight=80
    export function showAnimation(animation: NeoAnimation, duration: number): void {
        ensureInit()
        let a: modules.ledPixelAnimations.Animation = null
        switch (animation) {
            case NeoAnimation.Rainbow: a = modules.ledPixelAnimations.rainbowCycle; break
            case NeoAnimation.Comet: a = modules.ledPixelAnimations.comet; break
            case NeoAnimation.Sparkle: a = modules.ledPixelAnimations.sparkle; break
            case NeoAnimation.RunningLights: a = modules.ledPixelAnimations.runningLights; break
            case NeoAnimation.ColorWipe: a = modules.ledPixelAnimations.colorWipe; break
            case NeoAnimation.TheaterChase: a = modules.ledPixelAnimations.theatherChase; break
            case NeoAnimation.Firefly: a = modules.ledPixelAnimations.firefly; break
        }
        if (a) strip.showAnimation(a, duration)
        _uniform = false
    }

    // ── Configuration ─────────────────────────────────────────────

    /**
     * Set how bright the strip is.
     * @param brightness percent from 0 (off) to 100 (max)
     */
    //% block="set brightness to $brightness \\%"
    //% group="Configuration"
    //% brightness.min=0 brightness.max=100 brightness.defl=30
    //% weight=60
    export function setBrightness(brightness: number): void {
        ensureInit()
        _brightness = Math.max(0, Math.min(100, brightness))
        // Re-apply to already-lit pixels so the change is visible immediately.
        if (_uniform) fill(_fillColor)        // strip/ring filled with one color
        else if (_rows > 0) _dirty = true     // matrix: re-push buffer via flusher
        else refresh()                        // strip with individually-set pixels
    }

    /**
     * Set how many pixels are on the strip (or ring).
     * @param count the number of pixels
     */
    //% block="set pixel count to $count"
    //% group="Configuration"
    //% count.min=1 count.max=300 count.defl=30
    //% weight=55
    export function setPixelCount(count: number): void {
        ensureInit()
        _rows = 0                         // leaving matrix mode
        _cols = 0
        strip.setNumPixels(count)
        const next: number[] = []
        for (let i = 0; i < count; i++) next.push(i < _pixels.length ? _pixels[i] : 0)
        _pixels = next
    }

    /**
     * Set up a ring with the given number of pixels.
     * A ring uses the same pixel and animation blocks as a strip.
     * @param count the number of pixels on the ring
     */
    //% block="set up ring with $count pixels"
    //% group="Configuration"
    //% count.min=1 count.max=300 count.defl=24
    //% weight=54
    export function setupRing(count: number): void {
        setPixelCount(count)
    }

    /**
     * Set up a matrix of the given size. Enables the Matrix blocks.
     * Pick the layout that matches how your panel is wired (see the Matrix
     * section of the README, or test with `set matrix pixel`).
     * @param rows number of rows (height)
     * @param columns number of columns (width)
     * @param layout how the LEDs are wired through the panel
     */
    //% block="set up matrix $rows rows by $columns columns wired by $layout"
    //% group="Configuration"
    //% rows.min=1 rows.defl=8
    //% columns.min=1 columns.defl=8
    //% layout.defl=MatrixLayout.Progressive
    //% weight=53
    export function setupMatrix(rows: number, columns: number, layout: MatrixLayout = MatrixLayout.Progressive): void {
        ensureInit()
        _rows = rows
        _cols = columns
        _layout = layout
        strip.setNumPixels(rows * columns)
        const next: number[] = []
        for (let i = 0; i < rows * columns; i++) next.push(0)
        _pixels = next
    }

    /**
     * Set the maximum current the strip is allowed to draw (in milliamps).
     * The module auto-dims brightness if the strip would exceed this limit.
     *
     * Keep the default (450 mA) when powering neopixels from the Jacdac bus.
     * Raise this only when you supply external 5V power directly to the strip:
     *   - 1A supply  -> 1000 mA
     *   - 2A supply  -> 2000 mA
     *   - 5A supply  -> 5000 mA
     *
     * @param milliamps current budget in milliamps
     */
    //% block="set max power to $milliamps mA"
    //% group="Configuration"
    //% milliamps.min=100 milliamps.max=10000 milliamps.defl=450
    //% weight=50
    export function setMaxPower(milliamps: number): void {
        strip.setMaxPower(milliamps)
    }
}
