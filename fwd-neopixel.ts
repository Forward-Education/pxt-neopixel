/**
 * Forward Education Neopixel Module — MakeCode Extension
 *
 * Student-friendly blocks for controlling WS2812B neopixel strips connected
 * via the Forward Education Jacdac Neopixel module.
 *
 * Wraps the Jacdac LED Strip client (modules.LedStripClient) from pxt-jacdac.
 * Verified against pxt-jacdac master (led-strip/client.ts).
 *
 * Brightness is applied in software (RGB scaling), and solid fills use the
 * `setall` light-program command — see the notes in setBrightness/setAllPixels.
 */

//% color="#FF6600" icon="\uf0eb" weight=90
//% groups="['Pixels', 'Animations', 'Configuration']"
namespace fwdNeopixel {
    const strip = new modules.LedStripClient("fwd neopixel")

    // ── Internal state ────────────────────────────────────────────
    // Brightness is applied in software (we scale each pixel's RGB before
    // sending) because the module firmware does not honor the Jacdac
    // brightness register. We keep the firmware register pinned at full so
    // it can never dim on top of our scaling.
    let _brightness = 30                 // 0–100, percent
    let _pixels: number[] = []           // logical (un-scaled) RGB per pixel
    let _uniform = false                 // whole strip is one color (_fillColor)
    let _fillColor = 0
    let _initialized = false

    const SEND_GAP = 6                   // ms between the two copies of a command

    // Start the client and wait until the module is actually connected before
    // the first command — commands sent during bus enumeration are dropped
    // (this is why a cold first press only lit the last pixel or two).
    function ensureInit(): void {
        if (_initialized) return
        _initialized = true
        strip.setBrightness(100)         // also calls start() internally
        pauseUntil(() => strip.isConnected(), 3000)
        pause(50)                        // small settle after connect
    }

    // Scale an RGB color by the current software brightness.
    function dim(color: number): number {
        const r = Math.idiv(((color >> 16) & 0xff) * _brightness, 100)
        const g = Math.idiv(((color >> 8) & 0xff) * _brightness, 100)
        const b = Math.idiv((color & 0xff) * _brightness, 100)
        return (r << 16) | (g << 8) | b
    }

    // Send one light program twice (Run commands are unacknowledged; a second
    // copy covers an occasional drop without flooding the bus). Single-command
    // strings only — chaining commands in one string can make lightEncode throw.
    // lightEncode consumes args via shift(), so each copy gets its own slice().
    function send(prog: string, args?: number[]): void {
        strip.runEncoded(prog, args ? args.slice() : undefined)
        pause(SEND_GAP)
        strip.runEncoded(prog, args ? args.slice() : undefined)
        pause(SEND_GAP)
    }

    // Re-send every stored pixel at the current brightness (used only when the
    // strip is NOT a single uniform color — uniform re-apply uses one setall).
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
        const c = dim(color)
        if (c == 0) {
            // `setall #000000` is a no-op on this module's firmware. Zero every
            // pixel via the multiply path instead (`mult 0` = multiply by 0),
            // which is a single fast command on a different firmware code path.
            send("mult 0 wait 1")
        } else {
            send("setall # wait 1", [c])
        }
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

    // ── Animations ────────────────────────────────────────────────

    /**
     * Show a rainbow animation for a duration.
     * @param duration how long to run, in milliseconds
     */
    //% block="show rainbow for $duration ms"
    //% group="Animations"
    //% duration.shadow="timePicker"
    //% duration.defl=2000
    //% weight=80
    export function showRainbow(duration: number): void {
        strip.showAnimation(modules.ledPixelAnimations.rainbowCycle, duration)
    }

    /**
     * Show a sparkle animation for a duration.
     * @param duration how long to run, in milliseconds
     */
    //% block="show sparkle for $duration ms"
    //% group="Animations"
    //% duration.shadow="timePicker"
    //% duration.defl=2000
    //% weight=75
    export function showSparkle(duration: number): void {
        strip.showAnimation(modules.ledPixelAnimations.sparkle, duration)
    }

    /**
     * Show a comet animation for a duration.
     * @param duration how long to run, in milliseconds
     */
    //% block="show comet for $duration ms"
    //% group="Animations"
    //% duration.shadow="timePicker"
    //% duration.defl=2000
    //% weight=70
    export function showComet(duration: number): void {
        strip.showAnimation(modules.ledPixelAnimations.comet, duration)
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
        // Uniform strip → one fast fill; mixed pixels → per-pixel re-apply.
        if (_uniform) fill(_fillColor)
        else refresh()
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
        ensureInit()
        strip.setNumPixels(count)
        // Resize the logical buffer, preserving existing colors.
        const next: number[] = []
        for (let i = 0; i < count; i++) next.push(i < _pixels.length ? _pixels[i] : 0)
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
     * Each WS2812B pixel draws up to ~60 mA at full white.
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
