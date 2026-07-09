// Test program for the Forward Education Neopixel Module.
// Connect the module to a micro:bit via Jacdac cable.

// ── Strip / ring ──────────────────────────────────────────────
fwdNeopixel.setPixelCount(10)
fwdNeopixel.setMaxPower(450)
fwdNeopixel.setBrightness(30)

// Light up the first three pixels in red, green, blue
fwdNeopixel.setPixelColor(0, 0xFF0000)
fwdNeopixel.setPixelColor(1, 0x00FF00)
fwdNeopixel.setPixelColor(2, 0x0000FF)
basic.pause(2000)
fwdNeopixel.clear()

// Built-in animation via the dropdown block
fwdNeopixel.showAnimation(NeoAnimation.Rainbow, 2000)

// ── Matrix ────────────────────────────────────────────────────
fwdNeopixel.setupMatrix(8, 8, MatrixLayout.Progressive)
fwdNeopixel.setMatrixPixel(0, 0, 0xFF0000)
fwdNeopixel.fillRect(2, 2, 3, 3, 0x0000FF)
basic.pause(1500)
fwdNeopixel.scrollText("HI", 0x00FF00, 80)
fwdNeopixel.scrollNumber(42, 0xFF00FF, 80)
fwdNeopixel.matrixRainbow(2, 40)

// ── Circular matrix (round 256-LED panel, STM32C031) ──────────
fwdNeopixel.setupCircleMatrix()
fwdNeopixel.setAllPixels(0x001000)          // whole disc dim green
fwdNeopixel.setMatrixPixel(0, 8, 0xFF0000)  // top-center red
fwdNeopixel.fillRect(6, 6, 6, 6, 0x0000FF)  // blue block through the middle
basic.pause(1500)
fwdNeopixel.scrollText("HI", 0xFFFFFF, 80)
