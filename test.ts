// Test program for the Forward Education Neopixel Module.
// Connect the module to a micro:bit via Jacdac cable.

// Configure the strip — bus-powered safe defaults
fwdNeopixel.setPixelCount(10)
fwdNeopixel.setBrightness(30)
fwdNeopixel.setMaxPower(450)

// Light up first three pixels in red, green, blue
fwdNeopixel.setPixelColor(0, 0xFF0000)
fwdNeopixel.setPixelColor(1, 0x00FF00)
fwdNeopixel.setPixelColor(2, 0x0000FF)
fwdNeopixel.show()

basic.pause(2000)

// Run rainbow animation
basic.forever(function () {
    fwdNeopixel.showRainbow()
    basic.pause(500)
})
