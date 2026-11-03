# 05: Post-Mortem Share Card & URL Seed Challenge System

**What to build:**
The viral sharing pipeline. Generates a cynical Post-Mortem Report on game over with survival statistics and death quotes. Supports one-click rich text clipboard copy and client-side 9:16 Canvas PNG image export. Reads/writes `#seed=XXXX` in URL to allow friends to challenge the exact same obstacle seed.

**Blocked by:**
04: Synthesized Web Audio Engine & Mute Control

**Status:**
completed

**Acceptance criteria:**
- [x] Post-Mortem Card displays survival time, tokens burned, nerfs endured, death reason, and percentile rank
- [x] "Copy Result" copies formatted text with emojis, stats, and challenge URL to user clipboard
- [x] "Download Card" renders and exports a crisp 9:16 Brutalist PNG image directly to user's device
- [x] Opening URL with `#seed=XXXX` initializes game with that exact seed, ensuring deterministic challenge for friends
- [x] Restart button resets state cleanly without page reload
