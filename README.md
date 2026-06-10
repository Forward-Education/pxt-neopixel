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
- `set max power to [n] mA` — current budget for auto-dimming (see Power below)

## Power — important!

The Jacdac LED Strip service `max_power` register is in **milliamps (mA)**.
The module auto-dims the strip whenever the calculated current draw would
exceed this limit. Each WS2812B pixel draws up to ~60 mA at full white.

### Bus-powered (default)

When the strip's power comes from the Jacdac bus through the screw terminal,
keep `max power` at **450 mA or below**. Setting it higher than the bus can
actually supply will cause voltage sag and **reset the module** (status LED
turns red, animations stop).

```blocks
fwdNeopixel.setPixelCount(10)
fwdNeopixel.setMaxPower(450)
fwdNeopixel.setBrightness(30)
basic.forever(function () {
    fwdNeopixel.showRainbow()
    basic.pause(1000)
})
```

### External 5V supply

For longer strips, power the strip directly from an external 5V supply and
route only the data and ground through the module. Then raise `max power` to
match the supply:

| External supply | max power setting |
|----------------|-------------------|
| 1 A | 1000 mA |
| 2 A | 2000 mA |
| 5 A | 5000 mA |

```blocks
fwdNeopixel.setPixelCount(60)
fwdNeopixel.setMaxPower(2000)
fwdNeopixel.setBrightness(80)
basic.forever(function () {
    fwdNeopixel.showRainbow()
    basic.pause(500)
})
```

When using an external supply, connect the supply's ground to the module's
GND terminal so the data signal has a return path.

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

The firmware default for `max_power` is **450 mA** (bus-safe). It is a
writable register, so programs can raise it when an external supply is used.

## API notes

This extension wraps the Jacdac LED Strip client from
[pxt-jacdac](https://github.com/microsoft/pxt-jacdac). The client API
methods (`setPixelColor`, `setAll`, `show`, `setBrightness`, `setNumPixels`,
`setMaxPower`, `runEncoded`) should be verified against the current pxt-jacdac
release when first testing in MakeCode, as the auto-generated client API may
evolve.

