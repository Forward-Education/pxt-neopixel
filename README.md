# Forward Education Neopixel Module — MakeCode Extension

MakeCode extension for the Forward Education Jacdac Neopixel Module. Provides
student-friendly blocks for controlling WS2812B neopixel strips connected via
the module's screw terminal.

## Usage

### Import the extension

In MakeCode for micro:bit (V2):
1. Open **Extensions** in the toolbox
2. Paste `https://github.com/Forward-Education/pxt-neopixel`
3. The **neopixel** category appears in the toolbox

### Connect the hardware

1. Connect the Jacdac Neopixel module to the micro:bit via a Jacdac cable
2. Wire a WS2812B neopixel strip to the module's screw terminal:
   - Pin 1 (VCC) → strip 5V
   - Pin 2 (DIN) → strip data in
   - Pin 3 (GND) → strip GND

### Blocks

**Pixels**
- `set pixel [n] to [color]` — set one pixel by index
- `set all pixels to [color]` — fill the entire strip
- `show pixels` — push the current buffer to the strip
- `clear all pixels` — turn off all pixels

**Matrix**
- `set up matrix [rows] rows [columns] columns` — configure the strip as a 2-D grid; also sets the pixel count automatically. An optional *serpentine* toggle handles zigzag wiring (default: on)
- `set matrix pixel row [r] column [c] to [color]` — set one pixel by row and column
- `set row [r] to [color]` — fill an entire row
- `set column [c] to [color]` — fill an entire column
- `fill area row [r] column [c] width [w] height [h] with [color]` — fill a rectangular region
- `scroll [text] in [color] on matrix` — scroll a text string across the matrix (A–Z, 0–9, space); optional *delay* slider controls speed
- `scroll number [n] in [color] on matrix` — scroll a number across the matrix
- `scroll rainbow on matrix [n] times` — animate a hue-cycling rainbow across the columns

**Animations**
- `show rainbow` — rainbow cycle (firmware animation)
- `show sparkle` — sparkle effect (firmware animation)
- `rotate pixels` — shift the pixel pattern forward by one step
- `color wipe [color]` — fill the strip pixel-by-pixel; optional *delay* slider controls speed

**Configuration**
- `set brightness to [n] %` — global brightness (0–100)
- `set pixel count to [n]` — number of pixels on the strip
- `set max power to [n] mW` — power budget for auto-dimming

> **Note:** `show pixels` must be called after matrix blocks to make changes
> visible, just as with strip blocks.

### Example: bus-powered strip (10 pixels)

```blocks
neopixel.setPixelCount(10)
neopixel.setBrightness(30)
basic.forever(function () {
    neopixel.showRainbow()
    basic.pause(1000)
})
```

### Example: 5×10 matrix with scrolling text

```blocks
neopixel.setupMatrix(5, 10, true)
neopixel.setBrightness(30)
basic.forever(function () {
    neopixel.showString("HELLO", 0xff0000)
    neopixel.scrollMatrixRainbow(2)
})
```

### Example: external 5V supply (60 pixels)

When you power the neopixel strip from an external 5V supply (instead of the
Jacdac bus), raise the max power limit to match your supply:

```blocks
neopixel.setPixelCount(60)
neopixel.setMaxPower(10000)
neopixel.setBrightness(80)
basic.forever(function () {
    neopixel.showRainbow()
    basic.pause(500)
})
```

## Matrix wiring

A matrix maps a single continuous strip onto a 2-D grid. Two wiring styles are
supported via the *serpentine* option in `setupMatrix`:

| Style | Description |
|---|---|
| **Serpentine** (default) | Odd rows run right-to-left. Common for dense LED panels. |
| **Grid** | Every row runs left-to-right. Less common but simpler to wire. |

Pixel index formula:
- Grid: `index = row × columns + column`
- Serpentine: same, but odd rows count from the right

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
