# SPEC-001: Token Survivor (AI 巨獸限流生存戰)

**Status**: Ready for Review / Ready for Tickets  
**Primary Seam**: Headless Game Engine State Machine (`createGameEngine`)  
**Design Reference**: Brutalist Silicon Style (Variant B)

---

## Problem Statement

現代開發者與技術社群日常高度依賴各大 AI 巨獸模型，但頻繁遭遇「429 Too Many Requests」、無預警「靜默降智（Silent Nerf）」、重置時間遙遙無期、以及過度保守的「道歉與道德審查」。開發者對市面上各家誇大宣傳的模型感到疲勞與無奈，需要一個能引起強烈共鳴、充滿自嘲與幽默感、且摩擦力極低（秒開、零後端依賴、可即時複製戰績）的瀏覽器小遊戲來宣洩壓力並在社群中快速分享傳播。

---

## Solution

打造一款純前端、零安裝、支援手機與桌面操作的諷刺風格瀏覽器生存遊戲 **《Token Survivor》**。
玩家操控一個小小的 Prompt 運算節點，在隨時間不斷消耗的「上下文視窗（Context Window）」壓力下，靈活閃避巨獸投擲的 429 巨石、靜默降智射線與道德審查阻礙牆，並搶吃開源權重與外流 API Key 維持運轉。

視覺上採用極具衝擊力的「粗獷主義矽谷文檔（Brutalist Silicon）」風格（白底、黑墨、克萊因藍與硬邊框）；傳播上支援「URL 確定性種子（Deterministic Seed）」以供好友挑戰同一盤面，以及一鍵生成「Post-Mortem 體檢報告」文字與 9:16 社群圖片卡。

---

## User Stories

1. As a player on mobile, I want to control the Prompt Node by dragging anywhere on the screen with one finger, so that I can play comfortably with one hand.
2. As a player on desktop, I want to control the Prompt Node using mouse movement, so that I have precise and responsive dodging control.
3. As a player, I want to see my Context Window deplete steadily over time, so that I feel constant urgency to survive and collect resources.
4. As a player, I want 429 Boulders to deal substantial damage (20%) when hit, so that I prioritize dodging corporate rate-limit obstacles.
5. As a player, I want Silent Nerf Beams to slow my movement by 40% for 2.5 seconds when struck, so that I experience the comical frustration of AI models being secretly throttled.
6. As a player, I want Safety Refusal Walls displaying preachy apology quotes to drift down the screen, so that I am forced to find navigating gaps around corporate disclaimers.
7. As a player, I want Open Weights packages to drop periodically and restore +25% Context Window, so that I can sustain my survival run.
8. As a player, I want rare Leaked API Keys to drop and grant 5 seconds of Overclock Invulnerability plus resource magnetism, so that I experience exhilarating power moments smashing through corporate hazards.
9. As a player, I want audio sound effects synthesized natively via the Web Audio API without downloading external audio assets, so that the game loads instantaneously (< 1 second) even on slow mobile connections.
10. As a player, I want an easily accessible audio mute toggle, so that I can play silently at work or in public transit.
11. As a player whose Context Window hits 0%, I want the game to halt and display a detailed Post-Mortem Report card, so that I understand my cause of death and performance metrics.
12. As a player, I want the Post-Mortem Card to calculate survival time, burned virtual tokens, number of nerfs endured, and a tongue-in-cheek engineer percentile rank, so that I can benchmark myself against peers.
13. As a player, I want a "Copy Result" button that formats my stats and a challenge URL into rich text with emojis on my clipboard, so that I can paste it directly into Twitter/X, Threads, Discord, or LINE.
14. As a player, I want a "Save Image" button that exports a high-contrast 9:16 brutalist screenshot card, so that I can post visual stories on social platforms.
15. As a player opening a link with a `#seed=XXXX` parameter, I want the hazard spawn timeline and item drops to be 100% deterministic, so that I can compete fairly with friends on the exact same challenge.
16. As a player, I want the game layout to be fully responsive and prevent unwanted browser scrolling or pull-to-refresh gestures, so that gameplay is uninterrupted on mobile devices.

---

## Implementation Decisions

### 1. Architectural Seam & Modularity

The application is decoupled into three distinct layers around **one single high-level seam**:

```
[ Web Audio Synthesizer ]     [ Canvas & DOM Renderer ]
           ▲                             ▲
           │                             │
   (Sound Event Triggers)         (State Snapshots)
           │                             │
     ┌─────────────────────────────────────────┐
     │  Game Engine (Headless State Machine)   │  ◄── PRIMARY TESTABLE SEAM
     └─────────────────────────────────────────┘
                         ▲
                         │
             (Time Delta & Input Events)
```

- **Core Engine (`engine.ts`)**:
  - Headless state machine, completely independent of DOM, Canvas, or Web Audio.
  - Exposes `tick(dt: number)`, `setInput(x: number, y: number)`, and `getState(): Readonly<GameState>`.
  - Emits transient event flags (`onCollision`, `onPickup`, `onGameOver`).
- **PRNG / Seed Engine (`random.ts`)**:
  - Linear Congruential Generator (LCG) or Mulberry32 algorithm ensuring identical pseudo-random sequence given the same integer seed.
- **Audio Synthesizer (`audio.ts`)**:
  - Pure Web Audio API (`OscillatorNode` + `GainNode`), synthesizing 8-bit chip tunes and impact noise bursts.
- **Renderer & Visual System (`renderer.ts` & `card-generator.ts`)**:
  - Variant B Brutalist Silicon aesthetic: high-contrast black borders, `#f5f4ef` parchment background, International Klein Blue (`#0022ff`) accents, and red warnings.
  - Post-Mortem Card export using offscreen Canvas rendering.

### 2. State Shape (Decision-Rich Prototype Snippet)

```typescript
export interface GameState {
  readonly seed: number;
  readonly isRunning: boolean;
  readonly isGameOver: boolean;
  readonly elapsedTime: number;
  readonly contextWindow: number; // 0 to 100
  readonly tokensBurned: number;
  readonly nerfsCount: number;
  readonly isSlowed: boolean;
  readonly slowTimer: number;
  readonly invulnerableTimer: number;
  readonly player: { x: number; y: number; radius: number };
  readonly hazards: ReadonlyArray<Hazard>;
  readonly collectibles: ReadonlyArray<Collectible>;
  readonly deathReason: string | null;
}
```

---

## Browser Identity & Meta Consistency Specification

To ensure total brand and sensory consistency across browser tabs, bookmarks, and social media unfurling (Twitter/X, Threads, LINE, Discord), the following assets and behaviors must strictly align:

1. **Favicon (`favicon.svg`)**:
   - High-contrast SVG favicon featuring the Prompt Node glyph `❯_` in International Klein Blue (`#0022ff`) on white/black background.
   - Dynamic favicon state: Flashes or shifts to red `429` on Game Over.
2. **Page Title Lifecycle**:
   - Idle / Start Screen: `❯_ TOKEN SURVIVOR | 巨獸限流生存戰`
   - Playing / Active: `❯_ [92%] TOKEN SURVIVOR` (shows Context Window percentage in real-time)
   - Game Over: `💀 [429] TOKEN SURVIVOR - 崩潰結算`
3. **Open Graph & Meta Tags**:
   - `og:title`: `Token Survivor - 巨獸限流生存戰`
   - `og:description`: `你能從 AI 巨獸的 429 限流、道德審查與靜默降智中存活超過 60 秒嗎？`
   - `theme-color`: `#f5f4ef` (matching Variant B Brutalist paper tone)
   - `twitter:card`: `summary_large_image`

---

## Testing Decisions

- **What makes a good test**: Tests must verify user-observable behavior through the `GameEngine` seam, never private implementation variables.
- **Test Suite Scope**:
  1. **Determinism Test**: Two engine instances initialized with the same seed and fed identical inputs must produce identical hazard sequences and identical final scores.
  2. **Context Window Depletion Test**: Advancing time ticks drains the context window according to the calibrated burn rate.
  3. **Collision & Debuff Test**: Simulating an obstacle at player coordinates inflicts correct context damage and activates slow debuff timers.
  4. **Item Pickup Test**: Colliding with Open Weights restores context; colliding with Leaked Key activates invulnerability and extends timers.
  5. **Game Over Transition**: Depleting context to 0 triggers game over with a valid satirical death reason.
- **Prior Art / Test Runner**: Vitest (pure headless execution in < 1 second).

---

## Out of Scope

- Centralized global database / backend leaderboard (retains zero-server architecture; seed competition via client URL).
- Complex physics engine / 3D WebGL (keeps bundle size < 150KB and initial load < 500ms).
- Multiplayer WebSocket real-time networking.

---

## Further Notes

- Target deployment: Static single-page application compatible with GitHub Pages, Cloudflare Pages, or direct file execution.
- Accessibility: High contrast black-on-white text ensures excellent daylight readability on mobile displays.
