# 程式碼審查報告 (Code Review Report) - 第 2 次審查

**專案名稱**: Token Survivor (AI 巨獸限流生存戰)  
**版本**: `v0.2.1` (commit `73664e0`)  
**審查日期**: `2026-11-03`  
**審查模式**: 雙軌並行子代理人審查 (Two-Axis Parallel Review: Standards + Spec)

---

## Standards

### 1. Documented Standard 違反處 (Hard Violations)

- **Prompt Node 命名漂移 (`GLOSSARY.md: Player & Resources - Avoid: Player`)**:
  - `src/engine/types.ts:17, 69` 仍保留 `export type Player` 與 `readonly player: Readonly<PromptNode>` 相容別名。
  - `src/engine/engine.ts:325` 狀態返回保留 `player: { ...promptNode }`。
  - `src/renderer/canvas.ts:47-64` 仍直接存取 `state.player.x / y / radius` 並註解 `// 2. Prompt Node Player`。
- **429 Boulder 術語違規 (`GLOSSARY.md: Hazards - Avoid: Hazard`)**:
  - `src/engine/types.ts:1, 19, 71` 及 `src/engine/engine.ts:54`、`src/renderer/canvas.ts:83` 全域仍以 `HazardType`、`Hazard`、`hazards` 為核心型別與屬性名。
- **Leaked API Key 語義漂移 (`GLOSSARY.md: Leaked API Key - Avoid: Super mode`)**:
  - `src/main.ts:158` 仍輸出 `"⚡ 5秒超頻無敵!"`；`src/engine/types.ts:2` 簡化為字串字面量 `'key'`。
- **OG Meta Tag 規格偏離 (`docs/SPEC.md:112-113`)**:
  - `index.html:11-12` `og:title` 仍含符號 `❯_ `，`og:description` 尾端多出「挑戰我的戰績！」。

### 2. Baseline Code Smells 檢測

- **Duplicated Code & Middle Man (硬性氣味)**:
  - 根目錄殘留未清理之舊檔：`src/audio.ts`、`src/card-generator.ts`、`src/random.ts`、`src/types.ts` 與子目錄檔案完全重疊。
  - `src/engine.ts:1-3` 仍為純轉發中介（Middle Man），僅測試檔依賴。
- **Duplicated Code (判定性氣味 / Heuristic)**:
  - `src/audio/synthesizer.ts:68-84, 107-122`：`playHit` 與 `playNerf` 重複 Oscillator/Gain 連接與 ramp 樣板，未抽取工廠函式。
- **Repeated Switches (判定性氣味 / Heuristic)**:
  - `src/engine/engine.ts:244-268` 與 `src/renderer/canvas.ts:84-90` 重複對 `'boulder' | 'beam' | 'wall'` 進行 if-cascade。

### 3. 前次審查追蹤 (Resolution Tracking)

- **Feature Envy (已解決)**: 已實作 `engine.consumeEvents()` 解耦狀態刺探；惟 `src/main.ts:128` 仍留有未使用的 `stateBefore` 變數宣告。
- **40% 減速 (已解決)**: `src/engine/engine.ts:175` 已修正為 `* 0.6`，確認完全符合規格。
- **戰績卡片 nerfsCount (已解決)**: 9:16 卡片與剪貼簿分享均已納入遭受降智次數統計。

---

## Spec

### 1. 遺漏或未完全實現之規格 (Missing / Partial)

- **OG 與 Meta 標籤未精確吻合**:
  - **Spec (L112-113)**: `og:title: Token Survivor - 巨獸限流生存戰`、`og:description: 你能從 AI 巨獸的 429 限流、道德審查與靜默降智中存活超過 60 秒嗎？`
  - **現況**: `index.html` (L11-12) 之 `og:title` 為 `❯_ TOKEN SURVIVOR | 巨獸限流生存戰`，`og:description` 尾端多出 `挑戰我的戰績！`，未精確對齊規格文本。
- **行動端防下拉刷新 (Pull-to-refresh) 不完全**:
  - **Spec (L41, US16)**: "prevent unwanted browser scrolling or pull-to-refresh gestures"
  - **現況**: `styles/base.css` 僅設定 `touch-action: none`，缺少 `overscroll-behavior: none`，在特定行動瀏覽器（如 iOS Safari / Chrome Android）上仍可能被觸發手勢回彈或頁面重新整理。

### 2. 未被要求的行為 (Scope Creep)

- **無敵撞毀障礙額外贈送 50,000 Tokens**:
  - **Spec (L33, US8)**: "5 seconds of Overclock Invulnerability plus resource magnetism, so that I experience exhilarating power moments smashing through corporate hazards."
  - **現況**: `src/engine/engine.ts` (L239-240) 在無敵撞碎障礙時累計 `tokensBurned += 50000` 並發送 `bonusTokens`，規格未要求撞碎障礙加分行為。

### 3. 看似已實現但實作有誤 (Wrong Implementation)

- **障礙與補給位移未乘以 `dt`（非幀率無關，致命物理 Bug）**:
  - **Spec (L67, L121)**: "Exposes tick(dt: number)" 與確定性規範。
  - **現況**: `src/engine/engine.ts` (L215, L280) 執行 `h.y += h.speed` 與 `c.y += c.speed` 時漏乘 `dt`（磁吸 L283-284 亦同），而 Context 燃燒與玩家移動皆乘 `dt`。這會導致在 120Hz 螢幕下下落速度比 60Hz 螢幕慢一倍（每秒執行 120 次每幀位移），徹底破壞跨裝置與跨幀率下的時間確定性！
- **URL Seed 限制純十進制數字**:
  - **Spec (L40, US15)**: "link with a #seed=XXXX parameter"
  - **現況**: `src/share/seed.ts` (L3) 僅採用 `/#seed=(\d+)/`，若外部挑戰連結傳入十六進制或英數字 (Hex/Alphanumeric)，會解析失敗直接隨機重抽。

---

## 審查總結與最嚴重問題摘要

- **Standards 軸向**: 發現 4 項規範用語漂移與 3 項程式碼壞味道；其中最需處理的是 **根目錄殘留之重複死檔案（Duplicated Code）**。
- **Spec 軸向**: 發現 2 項規格部分落差、1 項超出規格行為與 2 項實作瑕疵；其中最致命的是 **物理位移未乘 `dt`（導致 60Hz vs 120Hz 下落速度差一倍，破壞確定性）**。
