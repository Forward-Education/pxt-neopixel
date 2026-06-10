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
- `set pixel [n] to [color]` — set one pixel (applies immediately)
- `set all pixels to [color]` — fill the strip (applies immediately)
- `clear all pixels` — turn off all pixels

**Animations** (each runs for a duration in milliseconds)
- `show rainbow for [n] ms`
- `show sparkle for [n] ms`
- `show comet for [n] ms`

**Configuration**
- `set brightness to [n] %` — global brightness (0–100)
- `set pixel count to [n]` — number of pixels on the strip
- `set max power to [n] mA` — current budget for auto-dimming (see Power below)

> Note: pixel and animation commands apply immediately — there is no separate
> "show" step. This matches the Jacdac LED Strip service model, where commands
> are streamed to the module.

## Power — important!

The Jacdac LED Strip service `max_power` register is in **milliamps (mA)**.
The module auto-dims the strip whenever the calculated current draw would
exceed this limit. Each WS2812B pixel draws up to ~60 mA at full white.

### Bus-powered (default)

When the strip's power comes from the Jacdac bus through the screw terminal,
keep `max power` at **450 mA or below**.

Note that the `max_power` limit controls *average* current via auto-dimming,
but it cannot suppress the brief current *inrush* when many pixels switch on
at once during an animation. If the module resets during animations (status
LED turns red), add a **1000 µF capacitor** across the strip's 5V and GND at
the screw terminal — this absorbs the inrush and is the standard neopixel
fix. A static (non-animated) frame does not have this problem.

```blocks
fwdNeopixel.setPixelCount(10)
fwdNeopixel.setMaxPower(450)
fwdNeopixel.setBrightness(30)
basic.forever(function () {
    fwdNeopixel.showRainbow(2000)
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
    fwdNeopixel.showRainbow(2000)
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

This extension wraps `modules.LedStripClient` from
[pxt-jacdac](https://github.com/microsoft/pxt-jacdac) (`led-strip/client.ts`).
Method mapping used by this extension:

| Block | Client method |
|-------|---------------|
| set pixel | `setPixel(index, rgb)` |
| set all pixels | `setAll(rgb)` |
| brightness | `setBrightness(0..100)` |
| pixel count | `setNumPixels(n)` |
| max power | `setMaxPower(mA)` |
| animations | `showAnimation(animation, durationMs)` |

Animations use the built-in `modules.ledPixelAnimations` objects
(`rainbowCycle`, `sparkle`, `comet`, and others).

## License

MIT
