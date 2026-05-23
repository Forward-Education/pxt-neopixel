# Forward Education Neopixel Module — MakeCode Extension

MakeCode extension for the Forward Education Jacdac Neopixel Module. Provides
student-friendly blocks for controlling WS2812B neopixel strips connected via
the module's screw terminal.

## Usage

### Import the extension

In MakeCode for micro:bit (V2):
1. Open **Extensions** in the toolbox
2. Paste `https://github.com/Forward-Education/pxt-neopixel`
3. The **Fwd Neopixel** category appears in the toolbox

### Connect the hardware

1. Connect the Jacdac Neopixel module to the micro:bit via a Jacdac cable
2. Wire a WS2812B neopixel strip to the module's screw terminal:
   - Pin 1 (VCC) → strip 5V
   - Pin 2 (DIN) → strip data in
   - Pin 3 (GND) → strip GND

### Blocks

**Pixels**
- `set pixel [n] to [color]` — set one pixel
- `set all pixels to [color]` — fill the strip
- `show pixels` — push changes to the strip
- `clear all pixels` — turn off all pixels

**Animations**
- `show rainbow` — rainbow cycle
- `show sparkle` — sparkle effect
- `rotate pixels` — shift pattern by one

**Configuration**
- `set brightness to [n] %` — global brightness (0–100)
- `set pixel count to [n]` — number of pixels on the strip
- `set max power to [n] mW` — power budget for auto-dimming

### Example: bus-powered strip (10 pixels)

```blocks
fwdNeopixel.setPixelCount(10)
fwdNeopixel.setBrightness(30)
basic.forever(function () {
    fwdNeopixel.showRainbow()
    basic.pause(1000)
})
```

### Example: external 5V supply (60 pixels)

When you power the neopixel strip from an external 5V supply (instead of the
Jacdac bus), raise the max power limit to match your supply:

```blocks
fwdNeopixel.setPixelCount(60)
fwdNeopixel.setMaxPower(10000)
fwdNeopixel.setBrightness(80)
basic.forever(function () {
    fwdNeopixel.showRainbow()
    basic.pause(500)
})
```

## Hardware

The module uses a Forward Education Jacdac PCB with:
- STM32G030F6Px MCU running Jacdac LED Strip firmware
- SN74LVC1T45 level shifter (3.3V → 5V) on the data line
- 3-pin 3.5mm-pitch screw terminal (VCC, DIN, GND)

### Firmware

The module firmware lives in the `fwd-neopixel` target of the
[firmware](https://github.com/Forward-Education/firmware) repository.

**Required firmware change:** the Jacdac STM32 platform code needs a one-line
addition to `jacdac-stm32x0/stm32/spidef.h` (line 44) to support PA12 as an
SPI1 MOSI pin:

```c
// Before:
STATIC_ASSERT(PIN_AMOSI == PA_7 || PIN_AMOSI == PA_2);

// After:
STATIC_ASSERT(PIN_AMOSI == PA_7 || PIN_AMOSI == PA_2 || PIN_AMOSI == PA_12);
```

Build with `make TARGET=fwd-neopixel`.

## API notes

This extension wraps the Jacdac LED Strip client from
[pxt-jacdac](https://github.com/microsoft/pxt-jacdac). The client API
methods (`setPixelColor`, `setAll`, `show`, `setBrightness`, `setNumPixels`,
`setMaxPower`, `runEncoded`) should be verified against the current pxt-jacdac
release when first testing in MakeCode, as the auto-generated client API may
evolve.

## License

MIT
