# 01: Deterministic Headless Game Engine & PRNG

**What to build:**
A pure, headless game simulation core driven by a deterministic Mulberry32 pseudo-random number generator (PRNG). Accepts time delta (`tick(dt)`) and player input (`setInput(x, y)`), tracks player position, updates Context Window drain, and handles deterministic hazard/item spawning schedules.

**Blocked by:**
None (can start immediately)

**Status:**
completed

**Acceptance criteria:**
- [x] Initializing engine with identical integer seeds produces identical sequence of hazard spawn coordinates and timestamps
- [x] Context window depletes steadily across ticks according to calibrated burn rate
- [x] Player position updates smoothly towards target coordinates respecting boundary limits
- [x] Engine exposes clean `getState()` snapshot without any DOM or Canvas dependencies
- [x] Comprehensive unit tests passing in Vitest
