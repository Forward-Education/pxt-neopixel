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

**Required firmware change (clearing / black):** the LED-strip service skips
transmitting an all-black frame and instead cuts the strip power pin — intended
to save power when everything is off. This module has no such power switch, so
the all-black frame is never sent and the pixels stay latched on their last
color (clear / set-to-black appears to do nothing). Two coordinated changes fix
it:

1. `targets/fwd-neopixel/board.h`: set `#define PIN_PWR -1` (no power pin).
2. `jacdac-c/services/ledstrip.c`: guard the all-black skip so it only runs
   when there is a real power pin:

```c
#if PIN_PWR >= 0
    if (is_empty((uint32_t *)state->pxbuffer, PX_WORDS(state->numpixels))) {
        jd_power_enable(0);
        return;
    } else {
        jd_power_enable(1);
    }
#endif
```

(Newer upstream `jacdac-c` already has this `#if PIN_PWR >= 0` guard; older
vendored copies run the skip unconditionally.)

Build with `make TARGET=fwd-neopixel`.

The firmware default for `max_power` is **450 mA** (bus-safe). It is a
writable register, so programs can raise it when an external supply is used.

## API notes

This extension wraps `modules.LedStripClient` from
[pxt-jacdac](https://github.com/microsoft/pxt-jacdac) (`led-strip/client.ts`).
Method mapping used by this extension:

| Block | Implementation |
|-------|----------------|
| set pixel | `setPixel(index, rgb)` (RGB scaled by software brightness) |
| set all pixels | `runEncoded("setall #", [rgb])` (RGB scaled by software brightness) |
| clear all pixels | `runEncoded("setall #000000")` |
| brightness | software RGB scaling (0–100); firmware register pinned at max |
| pixel count | `setNumPixels(n)` |
| max power | `setMaxPower(mA)` |
| animations | `showAnimation(animation, durationMs)` |

> Brightness is applied in software because the module firmware does not honor
> the Jacdac `brightness` register. The extension scales each pixel's RGB value
> and keeps a logical pixel buffer so changing brightness re-applies to
> already-lit pixels. Solid fills use the `setall` light-program command rather
> than the client's `setAll()` (which emits `fade`, a gradient command that does
> not reliably produce a solid color — especially black).

Animations use the built-in `modules.ledPixelAnimations` objects
(`rainbowCycle`, `sparkle`, `comet`, and others).

## License

MIT
