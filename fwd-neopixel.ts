/**
 * Forward Education Neopixel Module — MakeCode Extension
 *
 * Provides student-friendly blocks for controlling WS2812B neopixel strips
 * connected via the Forward Education Jacdac Neopixel module.
 *
 * Wraps the Jacdac LED Strip client from pxt-jacdac.
 */

//% color="#FF6600" icon="\uf0eb" weight=90
//% groups="['Pixels', 'Matrix', 'Animations', 'Configuration']"
namespace neopixel {
    const strip = new modules.LedStripClient("fwd neopixel")

    // \u2500\u2500 Matrix state \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
    let _matrixRows = 0
    let _matrixCols = 0
    let _matrixSerpentine = true
    let _pixelCount = 0

    // Maps (row, col) \u2192 flat pixel index; returns -1 when out of bounds.
    function matrixIndex(row: number, col: number): number {
        if (_matrixRows === 0 || _matrixCols === 0) return -1
        if (row < 0 || row >= _matrixRows || col < 0 || col >= _matrixCols) return -1
        // Serpentine: odd rows run right-to-left.
        const c = (_matrixSerpentine && row % 2 === 1) ? _matrixCols - 1 - col : col
        return row * _matrixCols + c
    }

    // ── Pixel Control ─────────────────────────────────────────────

    /**
     * Set the color of a single pixel.
     * @param pixel the pixel index (starting from 0)
     * @param color the RGB color value
     */
    //% block="set pixel $pixel to $color"
    //% group="Pixels"
    //% pixel.min=0 pixel.defl=0
    //% color.shadow="colorNumberPicker"
    //% weight=100
    export function setPixelColor(pixel: number, color: number): void {
        strip.setPixelColor(pixel, color)
    }

    /**
     * Set all pixels to the same color.
     * @param color the RGB color value
     */
    //% block="set all pixels to $color"
    //% group="Pixels"
    //% color.shadow="colorNumberPicker"
    //% weight=95
    export function setAllPixels(color: number): void {
        strip.setAll(color)
    }

    /**
     * Push the current pixel buffer to the strip so changes become visible.
     */
    //% block="show pixels"
    //% group="Pixels"
    //% weight=90
    export function show(): void {
        strip.show()
    }

    /**
     * Turn off all pixels.
     */
    //% block="clear all pixels"
    //% group="Pixels"
    //% weight=85
    export function clear(): void {
        strip.setAll(0x000000)
        strip.show()
    }

    // ── Matrix Control ────────────────────────────────────────────

    /**
     * Configure the strip as a 2-D matrix.
     * Also sets the pixel count to rows × columns automatically.
     * Call this once at the start of your program before using any matrix blocks.
     * @param rows number of rows
     * @param columns number of columns
     * @param serpentine true if rows alternate direction (zigzag wiring)
     */
    //% block="set up matrix $rows rows $columns columns||serpentine $serpentine"
    //% group="Matrix"
    //% rows.min=1 rows.max=20 rows.defl=5
    //% columns.min=1 columns.max=20 columns.defl=10
    //% serpentine.defl=true
    //% expandableArgumentMode="toggle"
    //% weight=99
    export function setupMatrix(rows: number, columns: number, serpentine = true): void {
        _matrixRows = rows
        _matrixCols = columns
        _matrixSerpentine = serpentine
        _pixelCount = rows * columns
        strip.setNumPixels(rows * columns)
    }

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
    //% weight=95
    export function setMatrixPixel(row: number, column: number, color: number): void {
        const i = matrixIndex(row, column)
        if (i >= 0) strip.setPixelColor(i, color)
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
    //% weight=90
    export function setRow(row: number, color: number): void {
        for (let c = 0; c < _matrixCols; c++) {
            const i = matrixIndex(row, c)
            if (i >= 0) strip.setPixelColor(i, color)
        }
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
    //% weight=85
    export function setColumn(column: number, color: number): void {
        for (let r = 0; r < _matrixRows; r++) {
            const i = matrixIndex(r, column)
            if (i >= 0) strip.setPixelColor(i, color)
        }
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
    //% weight=80
    export function fillRect(row: number, column: number, width: number, height: number, color: number): void {
        for (let r = row; r < row + height; r++) {
            for (let c = column; c < column + width; c++) {
                const i = matrixIndex(r, c)
                if (i >= 0) strip.setPixelColor(i, color)
            }
        }
    }

    // ── Matrix Font helpers ───────────────────────────────────────
    // 5-tall × 3-wide pixel font. Each row = 3-bit mask: bit2=left, bit1=mid, bit0=right.
    // Layout: index 0=space, 1–10='0'–'9', 11–36='A'–'Z'
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
        7, 1, 2, 4, 7,   // Z
    ]

    function fontIndex(ch: number): number {
        if (ch === 32) return 0
        if (ch >= 48 && ch <= 57) return ch - 47
        if (ch >= 65 && ch <= 90) return ch - 54
        if (ch >= 97 && ch <= 122) return ch - 86
        return 0
    }

    function hueToRgb(hue: number): number {
        hue = hue % 360
        const hi = Math.idiv(hue, 60)
        const f = Math.idiv((hue % 60) * 255, 60)
        const q = 255 - f
        if (hi === 0) return (255 << 16) | (f << 8)
        if (hi === 1) return (q << 16) | (255 << 8)
        if (hi === 2) return (255 << 8) | f
        if (hi === 3) return (q << 8) | 255
        if (hi === 4) return (f << 16) | 255
        return (255 << 16) | q
    }

    // ── Matrix Text & Animation ───────────────────────────────────

    /**
     * Scroll a text string across the matrix from right to left.
     * Matrix must be at least 5 rows tall for the font to display fully.
     * @param text the text to display (A–Z, 0–9, space)
     * @param color the pixel color
     * @param delay milliseconds per scroll step
     */
    //% block="scroll $text in $color on matrix||delay $delay ms"
    //% group="Matrix"
    //% text.defl="Hello"
    //% color.shadow="colorNumberPicker"
    //% delay.min=20 delay.max=500 delay.defl=80
    //% expandableArgumentMode="toggle"
    //% weight=75
    export function showString(text: string, color: number, delay = 80): void {
        if (_matrixRows < 1 || _matrixCols < 1) return
        const rows = Math.min(_matrixRows, 5)
        const totalCols = text.length * 4  // 3 px wide + 1 spacer per char
        for (let s = 0; s < _matrixCols + totalCols; s++) {
            for (let m = 0; m < _matrixCols; m++) {
                const cc = m - _matrixCols + s
                for (let r = 0; r < rows; r++) {
                    let lit = false
                    if (cc >= 0 && cc < totalCols) {
                        const charIdx = Math.idiv(cc, 4)
                        const colInChar = cc % 4
                        if (charIdx < text.length && colInChar < 3) {
                            const fi = fontIndex(text.charCodeAt(charIdx))
                            lit = ((FONT_DATA[fi * 5 + r] >> (2 - colInChar)) & 1) === 1
                        }
                    }
                    const idx = matrixIndex(r, m)
                    if (idx >= 0) strip.setPixelColor(idx, lit ? color : 0)
                }
            }
            strip.show()
            basic.pause(delay)
        }
    }

    /**
     * Scroll a number across the matrix from right to left.
     * Matrix must be at least 5 rows tall.
     * @param n the number to display
     * @param color the pixel color
     * @param delay milliseconds per scroll step
     */
    //% block="scroll number $n in $color on matrix||delay $delay ms"
    //% group="Matrix"
    //% n.defl=0
    //% color.shadow="colorNumberPicker"
    //% delay.min=20 delay.max=500 delay.defl=80
    //% expandableArgumentMode="toggle"
    //% weight=70
    export function showNumber(n: number, color: number, delay = 80): void {
        showString("" + Math.round(n), color, delay)
    }

    /**
     * Animate a scrolling rainbow across the matrix columns.
     * @param cycles how many full color cycles to run
     * @param delay milliseconds between animation frames
     */
    //% block="scroll rainbow on matrix $cycles times||delay $delay ms"
    //% group="Matrix"
    //% cycles.min=1 cycles.max=20 cycles.defl=3
    //% delay.min=10 delay.max=200 delay.defl=30
    //% expandableArgumentMode="toggle"
    //% weight=65
    export function scrollMatrixRainbow(cycles: number, delay = 30): void {
        if (_matrixRows === 0 || _matrixCols === 0) return
        const steps = cycles * 72  // 72 steps per full hue cycle (360 / 5°)
        for (let step = 0; step < steps; step++) {
            const offset = (step * 5) % 360
            for (let r = 0; r < _matrixRows; r++) {
                for (let c = 0; c < _matrixCols; c++) {
                    const hue = (Math.idiv(c * 360, _matrixCols) + offset) % 360
                    const i = matrixIndex(r, c)
                    if (i >= 0) strip.setPixelColor(i, hueToRgb(hue))
                }
            }
            strip.show()
            basic.pause(delay)
        }
    }

    // ── Animations ────────────────────────────────────────────────

    /**
     * Run a rainbow animation across the strip.
     */
    //% block="show rainbow"
    //% group="Animations"
    //% weight=80
    export function showRainbow(): void {
        strip.runEncoded("rainbow")
    }

    /**
     * Run a sparkle animation.
     */
    //% block="show sparkle"
    //% group="Animations"
    //% weight=75
    export function showSparkle(): void {
        strip.runEncoded("sparkle")
    }

    /**
     * Rotate the pixel pattern forward by one step.
     */
    //% block="rotate pixels"
    //% group="Animations"
    //% weight=70
    export function rotatePixels(): void {
        strip.runEncoded("rotfwd 1")
    }

    /**
     * Fill the strip one pixel at a time with a color (wipe effect).
     * Call setPixelCount first to set the strip length.
     * @param color the fill color
     * @param delay milliseconds between each pixel
     */
    //% block="color wipe $color||delay $delay ms"
    //% group="Animations"
    //% color.shadow="colorNumberPicker"
    //% delay.min=10 delay.max=500 delay.defl=50
    //% expandableArgumentMode="toggle"
    //% weight=65
    export function showColorWipe(color: number, delay = 50): void {
        for (let i = 0; i < _pixelCount; i++) {
            strip.setPixelColor(i, color)
            strip.show()
            basic.pause(delay)
        }
    }

    // ── Configuration ─────────────────────────────────────────────

    /**
     * Set how bright the strip is.
     * @param brightness percent from 0 (off) to 100 (max)
     */
    //% block="set brightness to $brightness \\%"
    //% group="Configuration"
    //% brightness.min=0 brightness.max=100 brightness.defl=50
    //% weight=60
    export function setBrightness(brightness: number): void {
        strip.setBrightness(brightness / 100)
    }

    /**
     * Set how many pixels are on the strip.
     * @param count the number of pixels
     */
    //% block="set pixel count to $count"
    //% group="Configuration"
    //% count.min=1 count.max=300 count.defl=30
    //% weight=55
    export function setPixelCount(count: number): void {
        _pixelCount = count
        strip.setNumPixels(count)
    }

    /**
     * Set the maximum power the strip is allowed to draw (in milliwatts).
     * The module auto-dims brightness if the strip would exceed this limit.
     *
     * Use the default (1500 mW) when powering neopixels from the Jacdac bus.
     * Raise this when you supply external 5V power directly to the strip.
     *
     * @param milliwatts power budget in milliwatts
     */
    //% block="set max power to $milliwatts mW"
    //% group="Configuration"
    //% milliwatts.min=500 milliwatts.max=50000 milliwatts.defl=1500
    //% weight=50
    export function setMaxPower(milliwatts: number): void {
        strip.setMaxPower(milliwatts)
    }
}
