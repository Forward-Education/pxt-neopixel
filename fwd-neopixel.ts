/**
 * Forward Education Neopixel Module — MakeCode Extension
 *
 * Student-friendly blocks for controlling WS2812B neopixel strips connected
 * via the Forward Education Jacdac Neopixel module.
 *
 * Wraps the Jacdac LED Strip client (modules.LedStripClient) from pxt-jacdac.
 * Verified against pxt-jacdac master (led-strip/client.ts).
 */

//% color="#FF6600" icon="\uf0eb" weight=90
//% groups="['Pixels', 'Animations', 'Configuration']"
namespace fwdNeopixel {
    const strip = new modules.LedStripClient("fwd neopixel")

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
        strip.setPixel(pixel, color)
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
        strip.setAll(color)
    }

    /**
     * Turn off all pixels.
     */
    //% block="clear all pixels"
    //% group="Pixels"
    //% weight=85
    export function clear(): void {
        strip.setAll(0x000000)
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
        strip.setBrightness(brightness)
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
        strip.setNumPixels(count)
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
