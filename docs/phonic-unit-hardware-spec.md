# Phonic Unit Scrap-Build Concept and Design Specification

## Solar-Powered, Self-Contained Community Language Learning Station

**Version 1.0 — May 2026**
**Kayuwawa Properties Ltd**

> **⚠️ NOTE:** The canonical hardware specification is [phonic-unit-hardware-spec.docx](./phonic-unit-hardware-spec.docx) (Timothy's original Word document). This Markdown version is a quick-reference summary — refer to the .docx for the full BOM, assembly walkthrough, power budget calculations, and field deployment protocol.

---

## 1. Design Philosophy

The Phonic Unit is built on three principles:

1. **Use what exists.** Every component should be available in a typical Jinja or Kampala hardware/electronics shop, or salvaged from e-waste. No bespoke manufacturing.
2. **Survive the field.** The unit must withstand dust, heat, bumpy transport on a boda, and use by 50+ children in a single day without failure.
3. **Make the child forget the machine.** The button, the voice, the stars — the technology disappears behind the game.

---

## 2. System Overview

```
┌────────────────────────────────────────────────────┐
│                   PHONIC UNIT                        │
│                                                      │
│   ┌─────────────────────────────┐                    │
│   │     Laptop (Refurbished)    │    ← Main compute   │
│   │  • 4GB RAM, 128GB SSD       │                     │
│   │  • Lubuntu / Linux Mint     │                     │
│   │  • Chrome browser (PWA)     │                     │
│   │  • Pre-loaded word packs    │                     │
│   └──────────┬──────────────────┘                    │
│              │                                        │
│   ┌──────────┴──────────┐  ┌────────────────────┐    │
│   │  USB Hub (4-port)   │  │  Solar Controller  │    │
│   └────┬─────┬─────┬────┘  └─────────┬──────────┘    │
│        │     │     │                 │                │
│   ┌────┴┐ ┌──┴──┐ ┌┴────────┐  ┌────┴─────┐          │
│   │Mic  │ │Buzz │ │Speaker  │  │ Battery  │          │
│   │USB  │ │USB  │ │USB      │  │ 12V 20Ah │          │
│   └─────┘ └─────┘ └─────────┘  └──────────┘          │
│                                                      │
│   ┌──────────────────────────────────────────┐       │
│   │   Carrying Case (Plastic Toolbox)        │       │
│   │   • Everything fits inside               │       │
│   │   • Foam inserts for component homes     │       │
│   │   • Lid becomes stand/platform           │       │
│   └──────────────────────────────────────────┘       │
└──────────────────────────────────────────────────────┘
```

---

## 3. Component Specifications

### 3.1 Compute: Refurbished Laptop

| Attribute | Requirement | Notes |
|-----------|-------------|-------|
| RAM | Minimum 4GB | 8GB preferred for smoother Gemini API operations |
| Storage | Minimum 120GB SSD | HDD acceptable but SSD strongly preferred for durability |
| CPU | Intel Core i3 (5th gen or newer) or equivalent | Or AMD Ryzen 3 / Celeron N-series |
| OS | Linux (Lubuntu or Linux Mint XFCE) | Lightweight, no license cost, stable |
| Screen | 14" minimum, 1366×768+ | 15.6" preferred for classroom visibility |
| Battery | Must hold charge for 2+ hours minimum | Solar backup covers longer sessions |
| WiFi | Optional (for initial setup only) | Not required for gameplay |
| USB | At least 2 USB-A ports | 3 ports preferred (mic + buzzer + speaker) |
| Estimated cost | UGX 350,000–450,000 | Refurbished business laptop from Kampala |

**Recommended sourcing:**
- Computer Point, Wandegeya (Kampala)
- Local repair shops in Jinja
- Corporate surplus auctions

### 3.2 Audio: USB Microphone

| Attribute | Requirement | Notes |
|-----------|-------------|-------|
| Type | Condenser or dynamic, USB plug-and-play | No drivers needed for Linux |
| Cable | Minimum 1.5m | Rugged, braided preferred |
| Stand | Desk stand or clip included | Must stay stable on a desk |
| Noise rejection | Cardioid polar pattern preferred | Reduces classroom background noise |
| Estimated cost | UGX 50,000–80,000 | Available at any computer accessory shop |

**Recommended models:**
- Trust GXT 232+ (budget, widely available)
- Fifine K669B (slightly better quality)
- Generic USB desktop mic from computer shop (test before buying)

### 3.3 Interaction: Big Red Buzzer Button

| Attribute | Requirement | Notes |
|-----------|-------------|-------|
| Type | Arcade-style push button, momentary switch | Normally open |
| Size | 60mm+ diameter | Big enough to slap, not press |
| Actuation | Satisfying click or tactile bump | Child needs to feel the action |
| Connection | USB (via USB game controller encoder or direct solder to USB keyboard PCB) | See section 4 for build detail |
| Color | Bright red (with lit ring if possible) | Must be visually exciting |
| Estimated cost | UGX 30,000–50,000 | Salvaged or new |

**Build options from cheapest to most satisfying:**

1. **Salvaged arcade button:** Find broken arcade machines, old game controllers. Wire button to a cheap USB keyboard PCB (gut a UGX 5,000 keyboard).
2. **AliExpress arcade kit:** UGX 25,000 for button + USB encoder board. 2–3 week shipping.
3. **DIY big button:** Large momentary switch from hardware shop, mounted in a plastic food container lid, wired to keyboard PCB.
4. **No buzzer (fallback):** Space bar on keyboard. Works but less fun.

### 3.4 Audio Output: USB Speaker

| Attribute | Requirement | Notes |
|-----------|-------------|-------|
| Type | USB-powered single speaker or small 2.0 | No separate power cable needed |
| Volume | Must be audible to a class of 40+ | 5W minimum |
| Portability | Small enough to fit in box | |
| Estimated cost | UGX 40,000–60,000 | Any computer speaker |

### 3.5 Power: Solar System

| Component | Spec | Estimated Cost (UGX) |
|-----------|------|---------------------|
| Solar panel | 100W polycrystalline, portable/foldable | 200,000–300,000 |
| Charge controller | PWM 10A (simple, cheap, reliable) | 40,000–60,000 |
| Battery | Deep-cycle 12V 20Ah (lead-acid or LiFePO4) | 150,000–200,000 |
| Cables + connectors | MC4 to alligator clips + USB adapter | 30,000–50,000 |
| **Total solar system** | | **420,000–610,000** |

**Alternative if grid power is available at school:**
- Skip solar. Buy a 10m extension cable. Laptop runs on its own charger. Cost: UGX 30,000.

### 3.6 Case: Plastic Toolbox

| Attribute | Requirement |
|-----------|-------------|
| Size | 50–60cm length, 30–40cm width, 25–35cm depth |
| Material | Hard plastic (polypropylene), weather-resistant |
| Features | Lockable, carry handle, removable tray |
| Foam inserts | 2.5–5cm high-density foam, cut to shape of each component |
| Estimated cost | UGX 30,000–50,000 |

---

## 4. Buzzer Button Build Guide

### 4.1 Method A: USB Keyboard PCB Conversion (Recommended)

**Parts needed:**
- 1 x large momentary push button (arcade button or hardware switch) — UGX 10,000–30,000
- 1 x cheap USB keyboard (to gut) — UGX 5,000–8,000
- Soldering iron + solder — UGX 15,000 (repair shop might do it for 5,000)
- Wire (2-core, 1m) — UGX 2,000
- Heatshrink or tape — UGX 1,000

**Steps:**
1. Gut the cheap USB keyboard. Remove the membrane/rubber mat. Access the PCB.
2. Find the two contact points for the SPACE BAR key (test with multimeter or by shorting the contacts).
3. Solder two wires to the space bar contact points.
4. Connect the other ends of the wires to the momentary switch terminals.
5. Mount the switch in a sturdy housing (plastic food container lid, mdf box, salvaged tin).
6. Close keyboard casing (or discard it). Plug keyboard PCB into USB hub.
7. Test: pressing the button should register as Space Bar press.

### 4.2 Method B: Arcade Button + USB Encoder (Simplest)

**Parts:**
- 1 x arcade button with microswitch (60mm+) — UGX 25,000
- 1 x Zero Delay USB Encoder board — UGX 15,000

**Steps:**
1. Wire microswitch terminals (NO and COM) to the encoder board.
2. Plug board into USB hub.
3. OS detects as game controller. Map button to SPACE BAR via Python script (provided below).

```python
# rumble_button_mapper.py
# Maps arcade button (detected as joystick) to SPACE bar
# Run on boot: add to ~/.config/autostart/

import evdev
from evdev import UInput, ecodes as e
import subprocess
import os

# Find the game controller device
devices = [evdev.InputDevice(path) for path in evdev.list_devices()]
controller = None
for dev in devices:
    if 'gamepad' in dev.name.lower() or 'joystick' in dev.name.lower() or 'zero delay' in dev.name.lower():
        controller = dev
        break

if not controller:
    print("No controller found. Button will NOT work.")
    exit(1)

print(f"Found controller: {controller.name}")

# Create virtual keyboard to emit SPACE
ui = UInput({e.EV_KEY: [e.KEY_SPACE]}, name="phonic-rumble-mapper")

for event in controller.read_loop():
    if event.type == e.EV_KEY and event.code == e.BTN_SOUTH:
        if event.value == 1:  # Pressed
            ui.write(e.EV_KEY, e.KEY_SPACE, 1)  # Space down
            ui.syn()
        elif event.value == 0:  # Released
            ui.write(e.EV_KEY, e.KEY_SPACE, 0)  # Space up
            ui.syn()
```

---

## 5. Software Setup Guide

### 5.1 Base OS

| Step | Action |
|------|--------|
| 1 | Install Lubuntu 24.04 LTS or Linux Mint XFCE |
| 2 | Enable auto-login for fast startup |
| 3 | Install Google Chrome (`sudo apt install google-chrome-stable`) |
| 4 | Install Chromium if Chrome unavailable |
| 5 | Create desktop shortcut that opens Phonic Pals in fullscreen kiosk mode |

**Kiosk launcher script (`/home/phonic/launch-phonic.sh`):**
```bash
#!/bin/bash
# Launch Phonic Pals in fullscreen kiosk mode
# Called from .config/autostart/ or desktop shortcut

/usr/bin/google-chrome \
  --kiosk \
  --no-first-run \
  --disable-translate \
  --disable-extensions \
  --disable-sync \
  --no-default-browser-check \
  --disable-features=TranslateUI \
  --allow-file-access-from-files \
  --disable-component-update \
  --disable-background-networking \
  /home/phonic/phonic-pals/index.html
```

### 5.2 Word Packs

Word packs are JSON files stored locally in `/home/phonic/phonic-pals/wordpacks/`.

**Structure:**
```json
{
  "pack": "animals",
  "language": "Lusoga",
  "words": [
    {
      "english": "cow",
      "translation": "ente",
      "image": "cow.svg",
      "audio_en": "cow.mp3",
      "audio_local_ref": null
    }
  ]
}
```

Packs are built during Phase 0 (see Project Proposal). The PWA loads packs from the local filesystem via file:// protocol or a bundled HTTP server (Python's `http.server` or `serve`).

### 5.3 Data Export

After each session, an assistant/teacher runs:
```bash
# Copy IndexedDB data to USB stick
python3 /home/phonic/export-data.py /media/usb/phonic-session-$(date +%Y%m%d-%H%M).json
```

Export script pulls recordings from IndexedDB via Playwright/Chromium DevTools Protocol.

---

## 6. Carrying Case Layout

```
┌──────────────────────────────────────────────────────┐
│  ┌────────────┐  ┌────────────┐  ┌────────────────┐  │
│  │  Laptop    │  │  Toolbox   │  │  Battery       │  │
│  │  (in       │  │  (screws,  │  │  (12V 20Ah)    │  │
│  │  padded    │  │  cables,   │  │                │  │
│  │  sleeve)   │  │  tape)     │  │                │  │
│  ├────────────┤  ├────────────┤  ├────────────────┤  │
│  │  Mic +     │  │  Solar     │  │  USB Hub +     │  │
│  │  Buzzer    │  │  Panel     │  │  Speaker       │  │
│  │  (foam     │  │  (folded)  │  │  (foam homes)  │  │
│  │  cutouts)  │  │            │  │                │  │
│  └────────────┘  └────────────┘  └────────────────┘  │
│                                                      │
│  ┌──────────────────────────────────────────────┐    │
│  │   Removable Tray (cables, charger, adaptor)  │    │
│  └──────────────────────────────────────────────┘    │
│                                                      │
│  Lid interior: printed quick-start guide + photo     │
│  of fully set-up unit                                 │
└──────────────────────────────────────────────────────┘
```

---

## 7. Field Checklist

### Setup (15 minutes)
- [ ] Open case, remove components
- [ ] Place laptop on case lid (lid acts as raised platform)
- [ ] Plug hub into laptop
- [ ] Plug mic, buzzer, speaker into hub
- [ ] Connect solar panel → charge controller → battery
- [ ] Connect battery → laptop charger (if laptop battery low)
- [ ] Boot laptop, launch Phonic Pals (auto-starts in kiosk mode)
- [ ] Test: speak into mic, press buzzer, verify audio

### During Session
- [ ] Child sits at laptop (supervised)
- [ ] Teacher handles Umpire screen (phone or second device)
- [ ] Field officer manages queue (4 groups of 10)
- [ ] Videographer captures reactions, buzzer slaps, star moments

### Pack Down (10 minutes)
- [ ] Export session data to USB
- [ ] Close Phonic Pals (Alt+F4 from kiosk)
- [ ] Shut down laptop
- [ ] Disconnect solar/battery
- [ ] Pack components into case
- [ ] Verify all tools accounted for
- [ ] Lock case

---

## 8. Budget Summary: One Complete Phonic Unit

| Component | Low Estimate (UGX) | High Estimate (UGX) |
|-----------|-------------------|-------------------|
| Laptop (refurbished) | 350,000 | 450,000 |
| USB Microphone | 50,000 | 80,000 |
| Buzzer Button (DIY) | 10,000 | 30,000 |
| Buzzer Button (arcade kit) | 25,000 | 50,000 |
| USB Speaker | 40,000 | 60,000 |
| USB Hub (4-port) | 15,000 | 25,000 |
| Solar Panel (100W) | 200,000 | 300,000 |
| Charge Controller (10A PWM) | 40,000 | 60,000 |
| Battery (12V 20Ah) | 150,000 | 200,000 |
| Cables + Connectors | 30,000 | 50,000 |
| Toolbox Case | 30,000 | 50,000 |
| Foam inserts, tools, solder | 20,000 | 35,000 |
| **Total (with solar)** | **960,000** | **1,390,000** |
| **Total (without solar, grid power)** | **515,000** | **695,000** |

---

## 9. Durability & Field Repair

| Failure | Fix | Spare to Carry |
|---------|-----|----------------|
| Mic stops working | Swap USB mic. Any USB mic works. | 1 spare microphone |
| Buzzer button fails | Space bar on keyboard works as fallback | None (Space bar = fallback) |
| Laptop battery dead | Run on solar/solar + AC charger | Extension cable |
| Laptop OS crash | Reboot. Auto-loads Phonic Pals. | USB boot stick with Lubuntu |
| Hub fails | Plug mic + buzzer directly into laptop | 1 spare USB hub |
| Speaker fails | Laptop built-in speaker (quieter but works) | None (built-in = fallback) |
| Screen cracked | Deployment cancelled | Handle transport with care |

**Recommended spare kit for field:**
- 1 x cheap USB microphone
- 1 x 4-port USB hub
- 1 x extension cable (10m)
- 1 x packaged Ubuntu USB installer stick

---

## 10. Future Versions

| Version | Enhancement | When |
|---------|-------------|------|
| v1.1 | Raspberry Pi 5 compute (lower cost, lower power) | After Phase 2 scale verified — need to test WebGL/AI performance |
| v1.2 | Built-in rechargeable battery (laptop battery repurposed) | After solar experience informs battery sizing |
| v1.5 | Local Whisper model for fully offline pronunciation assessment | After Phase 2 data pipeline proves concept |
| v2.0 | Purpose-built PCB with buzzer, mic preamp, speaker amp on single board | If mass production of 100+ units is funded |

---

*This document is part of the Phonic Pals partnership proposal between Kayuwawa Properties Ltd and Tech Reach Africa. Published as open hardware documentation.*
