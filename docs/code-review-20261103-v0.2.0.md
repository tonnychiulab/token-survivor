# 程式碼審查報告 (Code Review Report)

**專案名稱**: Token Survivor (AI 巨獸限流生存戰)  
**版本**: `v0.2.0`  
**審查日期**: `2026-11-03`  
**審查模式**: 雙軌並行子代理人審查 (Two-Axis Parallel Review: Standards + Spec)

---

## Standards

### 1. Documented Standard 違反處 (依據 `GLOSSARY.md`)

- **Prompt Node (`GLOSSARY.md - Player & Resources`)**
  - **標準規範**：核心玩家角色必須使用 `Prompt Node`，明確要求 _Avoid: Character, Ship, Player, Avatar_。
  - **違規位置**：
    - `src/engine/types.ts:4, 50` 定義 `export interface Player` 及 `readonly player: Readonly<Player>`。
    - `src/engine/engine.ts:37` 宣告 `const player: Player = ...`。
    - `src/renderer/canvas.ts:36` 註解寫 `// 2. Prompt Node Player`，資料結構皆直稱 `player`。
- **429 Boulder (`GLOSSARY.md - Hazards & Corporate Enemies`)**
  - **標準規範**：定義為 `429 Boulder`，明確要求 _Avoid: Obstacle, Rock, Hazard_。
  - **違規位置**：`src/engine/types.ts:1, 13, 51` 與 `src/engine/engine.ts:46` 全面採用 `HazardType`、`Hazard`、`hazards: ReadonlyArray<Hazard>` 作為型別與集合名稱。
- **Leaked API Key (`GLOSSARY.md - Player & Resources`)**
  - **標準規範**：稀有道具為 `Leaked API Key`，明確要求 _Avoid: Power-up, Star, Super mode_。
  - **違規位置**：`src/main.ts:160` 標籤文字為 `"⚡ 5秒超頻無敵!"`（涉入 Super mode 語義）；`src/engine/types.ts:2` 簡化為 `'key'` 偏離領域術語。

### 2. Fowler Code Smells 檢測

- **Duplicated Code (硬性違規)**
  - 專案存在版本遷移殘留的死代碼：根目錄 `src/audio.ts` 與 `src/audio/synthesizer.ts`、`src/card-generator.ts` 與 `src/share/card-generator.ts` 完全重複。
  - `src/audio/synthesizer.ts:68-83, 107-122`：`playHit` 與 `playNerf` 中 Oscillator/Gain 的建置、連接、ramp 排程形狀完全相同，未抽取共用音訊節點建立工廠。
- **Repeated Switches (硬性違規)**
  - `src/engine/engine.ts:230-250` 與 `src/renderer/canvas.ts:77-104` 針對 `h.type === 'boulder' | 'beam' | 'wall'` 重複進行 if-cascade，渲染與碰撞應依型態多型分派。
- **Feature Envy (依戀情結 - 評判性氣味)**
  - `src/main.ts:141-165`：主迴圈比對 `stateBefore` 與當前 `state` 的 `contextWindow`、`isSlowed` 差值以觸發粒子與音效，過度刺探 Engine 內部資料，應改由 Engine 事件發布機制告知。
- **Shotgun Surgery (散彈式修改 - 評判性氣味)**
  - 新增任何企業阻礙需散彈式修改 `types.ts`、`engine.ts` (計時/生成/碰撞)、`canvas.ts`、`main.ts`。
- **Middle Man (中間人轉發 - 評判性氣味)**
  - `src/engine.ts:1-3` 僅作為 `./engine/*` 的轉發中介，其他模組均已直接參照內部子模組。

---

## Spec

### 1. 遺漏或未完全實現之規格 (Missing / Partial)

- **Engine Seam 缺乏瞬態事件發送**：
  - 規格 Line 68：`- Emits transient event flags (onCollision, onPickup, onGameOver).`
  - 現況：`src/engine/engine.ts` 與 `types.ts` 未輸出事件旗標；`src/main.ts:141` 改在主迴圈對 `contextWindow` 差值進行 dirty-diff 判斷，破壞了單一高層 Seam 的規格承諾。
- **社群複製文字遺漏降智次數**：
  - 規格 Line 37-38：「...calculate survival time, burned virtual tokens, number of nerfs endured... formats my stats... into rich text」
  - 現況：`src/share/clipboard.ts:10-17` 的戰績文字缺少 `nerfsCount` 統計項目。

### 2. 規格外行為 (Scope Creep)

- **超頻撞怪額外獎勵 Token**：
  - 規格 Line 33：「...smashing through corporate hazards...」
  - 現況：`src/engine/engine.ts:226` 於無敵狀態撞毀障礙物時額外累加 `tokensBurned += 50000`，規格並未提及此加分機制。
- **OG Meta Tag 文字漂移**：
  - 規格 Line 112-113：`og:title`: `Token Survivor - 巨獸限流生存戰`、`og:description`: 結尾為 `...超過 60 秒嗎？`
  - 現況：`index.html:11-12` `og:title` 變為符號夾帶款，`og:description` 擅自追加「挑戰我的戰績！」。

### 3. 實作有誤或潛在 Bug (Wrong / Buggy)

- **降智射線數值錯誤且引發誤擊判斷**：
  - 規格 Line 30：「Silent Nerf Beams to slow my movement by 40% for 2.5 seconds」
  - 現況：`src/engine/engine.ts:164` 乘上 `0.55`（即減速 45% 而非 40%）；且 Line 237 扣除 8% Context，導致 `main.ts:141` 因差值大於 5 而錯誤噴出 `-20% 上下文 (429)` 標籤與音效。
- **道德審查牆額外造成血量損害**：
  - 規格 Line 31：「Safety Refusal Walls... forced to find navigating gaps around corporate disclaimers.」
  - 現況：`src/engine/engine.ts:246` 撞牆直接扣除 12% Context，將避障機制實作為傷害碰撞體。

---

## 審查總結 (Review Summary)

- **Standards Axis**: 發現 **3 項** 領域標準違規（`PromptNode` / `Hazard` 命名漂移）、**5 項** 程式碼異味（最嚴重為殘留重複檔案 `Duplicated Code` 與主迴圈刺探狀態 `Feature Envy`）。
- **Spec Axis**: 發現 **2 項** 規格遺漏、**2 項** 規格外蔓延、**2 項** 實作錯誤（最嚴重為 `Engine` 未發送瞬態事件導致 `main.ts` 誤判觸發 429 浮動標籤）。
