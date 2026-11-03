# 02: Collision Detection, Damage & Debuff Reducer

**What to build:**
Circle-to-circle and circle-to-box collision detection between Prompt Node and all active entities. Handles 429 Boulder impact (-20% context), Silent Nerf Beam (-8% context + 40% slow debuff for 2.5s), Safety Refusal Wall obstacles, Open Weights pickup (+25% context), and Leaked API Key (5s invulnerability + resource magnetism).

**Blocked by:**
01: Deterministic Headless Game Engine & PRNG

**Status:**
completed

**Acceptance criteria:**
- [x] 429 collision reduces context window and knocks back or triggers damage event
- [x] Nerf beam collision sets `isSlowed = true` and dampens player speed by 40% for exactly 2.5s
- [x] Open Weights pickup restores +25% context without exceeding 100%
- [x] Leaked API Key activates invulnerability; colliding with hazards during invulnerability destroys hazards and awards bonus tokens
- [x] Context window reaching 0% triggers `isGameOver = true` with calculated statistics
- [x] Automated integration tests verify collision calculations and state transitions
