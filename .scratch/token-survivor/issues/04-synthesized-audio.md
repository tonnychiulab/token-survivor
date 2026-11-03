# 04: Synthesized Web Audio Engine & Mute Control

**What to build:**
A zero-dependency audio synthesizer built on the browser's native Web Audio API. Synthesizes retro 8-bit sound effects entirely in code without downloading external audio files. Generates sound triggers on pickup, 429 collision, nerf beam debuff, invulnerability activation, and game over.

**Blocked by:**
03: Brutalist Silicon Canvas Renderer & Touch Controls

**Status:**
completed

**Acceptance criteria:**
- [x] Zero external audio file requests (0 KB network payload for sound)
- [x] Produces distinct synthesized sounds for: item collection, damage hit, slow debuff, and invulnerability mode
- [x] Safe initialization upon first user interaction to comply with modern browser autoplay policies
- [x] Persistent mute/unmute toggle in the HUD stored in `localStorage`
