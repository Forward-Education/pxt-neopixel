// Test program for the Forward Education Neopixel Module.
// Connect the module to a micro:bit via Jacdac cable.

// ── Strip mode ────────────────────────────────────────────────────
fwdNeopixel.setPixelCount(10)
fwdNeopixel.setBrightness(30)

fwdNeopixel.setPixelColor(0, 0xFF0000)
fwdNeopixel.setPixelColor(1, 0x00FF00)
fwdNeopixel.setPixelColor(2, 0x0000FF)
fwdNeopixel.show()

basic.pause(2000)

// ── Matrix mode (5 rows × 10 columns, serpentine wiring) ──────────
fwdNeopixel.setupMatrix(5, 10, true)
fwdNeopixel.setBrightness(30)

// Light the top-left pixel red
fwdNeopixel.setMatrixPixel(0, 0, 0xFF0000)

// Fill the second row green
fwdNeopixel.setRow(1, 0x00FF00)

// Fill the third column blue
fwdNeopixel.setColumn(2, 0x0000FF)

// Fill a 3×3 block starting at row 2, column 4 with white
fwdNeopixel.fillRect(2, 4, 3, 3, 0xFFFFFF)

fwdNeopixel.show()

basic.pause(2000)

// Run rainbow animation across all pixels
basic.forever(function () {
    fwdNeopixel.showRainbow()
    basic.pause(500)
})
