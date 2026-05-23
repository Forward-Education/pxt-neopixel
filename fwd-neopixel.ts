/**
 * Forward Education Neopixel Module — MakeCode Extension
 *
 * Provides student-friendly blocks for controlling WS2812B neopixel strips
 * connected via the Forward Education Jacdac Neopixel module.
 *
 * Wraps the Jacdac LED Strip client from pxt-jacdac.
 */

//% color="#FF6600" icon="\uf0eb" weight=90
//% groups="['Pixels', 'Animations', 'Configuration']"
namespace fwdNeopixel {
    const strip = new modules.LedStripClient("fwd neopixel")

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
