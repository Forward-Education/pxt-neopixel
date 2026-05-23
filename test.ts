// Test program for the Forward Education Neopixel Module.
// Connect the module to a micro:bit via Jacdac cable.

// ── Strip mode ────────────────────────────────────────────────────
neopixel.setPixelCount(10)
neopixel.setBrightness(30)

neopixel.setPixelColor(0, 0xFF0000)
neopixel.setPixelColor(1, 0x00FF00)
neopixel.setPixelColor(2, 0x0000FF)
neopixel.show()

basic.pause(2000)

// ── Matrix mode (5 rows × 10 columns, serpentine wiring) ──────────
neopixel.setupMatrix(5, 10, true)
neopixel.setBrightness(30)

// Light the top-left pixel red
neopixel.setMatrixPixel(0, 0, 0xFF0000)

// Fill the second row green
neopixel.setRow(1, 0x00FF00)

// Fill the third column blue
neopixel.setColumn(2, 0x0000FF)

// Fill a 3×3 block starting at row 2, column 4 with white
neopixel.fillRect(2, 4, 3, 3, 0xFFFFFF)

neopixel.show()

basic.pause(2000)

// Run rainbow animation across all pixels
basic.forever(function () {
    neopixel.showRainbow()
    basic.pause(500)
})
