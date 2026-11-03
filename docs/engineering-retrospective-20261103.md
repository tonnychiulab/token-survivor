# 🚀 Token Survivor：AI 輔助原生研發全週期時間軸與技術覆盤報告
> **"Planning and Implementation is a Continuous Loop." —— 規劃與實作，是一個持續前進的循環**

- **研發日期**：2026-11-03
- **時間跨度**：17:17 ~ 20:36 (UTC+8) · **總歷時：3 小時 19 分鐘**
- **專案代號**：`Token Survivor (token-survivor)`
- **產出成果**：一個具備確定性種子、0KB 額外音效、CSP 縱深防禦、60Hz/120Hz 跨刷新率物理公平性的純前端生存遊戲，並開源部署於 GitHub Pages。

---

## 📊 一、 資源消耗與核心數據量化 (Metrics & Footprint)

| 維度 | 數據 | 備註說明 |
| :--- | :---: | :--- |
| **會話總步驟 (Steps)** | **803 次** | 包含規劃、提問、指令執行、檔案編寫、編譯驗證與部署。 |
| **輸入 Tokens (Input)** | **2,717,108** (~2.72M) | 專案規格、程式碼與審查歷史上下文注入。 |
| **輸出 Tokens (Output)** | **324,822** (~325K) | 程式碼編寫、重構、文檔撰寫與雙軸報告產出。 |
| **快取讀取 (Cache Read)** | **46,757,500** (~46.76M) | 藉由 Antigravity 提示快取機制，大幅降低即時推理延遲。 |
| **總處理 Tokens** | **49,799,430** (~49.8M) | 歷經 3 小時高強度結對編程之總吞吐量。 |
| **子代理召喚次數** | **4 次** | 兩輪雙軸平行審查（Standards 規範軸 + Spec 規格軸）。 |
| **自動化測試通過率** | **100% (10/10)** | Vitest 單元測試全部通過，涵蓋跨刷新率模擬。 |
| **TypeScript 型別驗證** | **0 Errors** | `tsc --noEmit` 完全型別安全。 |

---

## 🤖 二、 採用模型與技能體系 (Models & Skills Matrix)

### 1. 採用模型 (Models Used)
- **主代理（編程與對話主腦）**：`Gemini 3.8 Flash (Medium)`
  - 承擔日常架構重構、程式碼撰寫、指令操作與文檔產出。
- **子代理（Subagents）**：
  - 共啟動 4 個並行子代理（Round 1 與 Round 2 各一對 Standards / Spec Reviewers）。
  - **執行現況**：採用 `Model: 'inherit'` 繼承主代理權重（此即本次覆盤深入檢討之「裁判兼球員」盲區，已促成後續「A + C 雙重鎖定」升級為 `Model: 'pro'`）。

### 2. 深度啟用的技能體系 (Skills Activated)
1. **`ask-matt`**：以 Matt Pocock 頂級開源軟體工程哲學為骨幹，引導「概念 → 規格 → 測試 → 實作 → 審查」的完整主幹流（Main Flow）。
2. **`grill-with-docs` / `grilling`**：高強度無情追問（Grilling），在動工前磨利概念，消除模糊需求，建立 ADR 與 `GLOSSARY.md` 領域詞彙表。
3. **`prototype`**：快速建立拋棄式概念原型，低成本驗證 Prompt Node 閃避巨獸手感。
4. **`to-spec`**：將粗略想法收斂為嚴謹的敏捷規格書 [`docs/SPEC.md`](./docs/SPEC.md)（18 個 User Stories）。
5. **`tdd`**：測試驅動開發，建立 Headless Engine Seam 隔離核心物理邏輯與 Canvas 渲染。
6. **`code-review`**：Standards 規範軸與 Spec 規格軸雙視角並行審查，產出存檔報告。
7. **`security-audit`**：6 階段全方位資安稽核（Full Audit Mode），驗證 URL Hash 注入、DoS 與 CSP 縱深防禦。

---

## ⏱️ 三、 研發時間軸全景 (Chronological Timeline)

```mermaid
timeline
    title Token Survivor 研發全生命週期 (2026-11-03)
    17:17 - 17:35 : 概念碰撞與領域建模 : /ask-matt 啟動，Grilling 無情追問，建立 GLOSSARY.md 與 ADR
    17:35 - 17:50 : 拋棄式原型與規格收斂 : /prototype 驗證手感，/to-spec 產出 18 個敏捷規格書 (SPEC.md)
    17:50 - 18:25 : TDD 核心實作 : Headless Engine、Mulberry32 PRNG、0KB Web Audio、9:16 戰績體檢卡
    18:25 - 18:45 : Vite 模組化工程重構 : 拆分 engine/, renderer/, audio/, share/ 目錄
    18:45 - 19:15 : 第 1 次 Code Review 與修復 : 雙軸審查揪出 Feature Envy 與減速比例錯誤，補齊事件總線
    19:15 - 19:40 : 向量資產升級與 CI/CD 部署 : 整合 AllSVGIcons Path2D，配置 GitHub Actions 自動發布
    19:40 - 20:00 : 全階段資安稽核 (Security Audit) : 6 階段完整審查，實作 CSP 與 Referrer-Policy 縱深防禦
    20:00 - 20:15 : 第 2 次 Code Review (關鍵轉折) : 揪出致命 Delta Time 物理幀率相依性 Bug
    20:15 - 20:25 : 物理修正與《審查契約》創立 : 60Hz/120Hz 等速校準，建立 CODE_REVIEW_CONTRACT.md 二輪上限
    20:25 - 20:36 : 開源發布門面補齊與深度覆盤 : 補全 About、MIT 授權、向量展示圖，確立「A + C 雙重鎖定」
```

---

## 🔍 四、 程式碼審查深度歷程與重大收穫 (Code Review Insights)

### 1. 第 1 次審查（v0.2.0 - 宏觀骨架期）
- **報告**：[`docs/code-review-20261103-v0.2.0.md`](./docs/code-review-20261103-v0.2.0.md)
- **發現之問題**：
  - **Feature Envy**：`main.ts` 直接翻弄 Engine 內部私有狀態判斷碰撞，缺乏事件機制。
  - **規格偏離**：降智射線減速本應為 40%（0.6x），代碼誤寫為減速至 40%（0.4x）。
  - **代碼重複**：Web Audio 模組中 Oscillator 與 Gain 節點建立缺乏共用工廠。
- **修復行動**：重構為 Event-Driven 瞬態事件流，修正減速常數。

### 2. 第 2 次審查（v0.2.1 - 微觀深水期）
- **報告**：[`docs/code-review-20261103-v0.2.1.md`](./docs/code-review-20261103-v0.2.1.md)
- **🚨 揪出致命物理 Bug（Frame-Rate Dependency Bug）**：
  - 巨石與道具位移代碼裸寫 `h.y += h.speed`，**漏乘 `dt`**！
  - **後果**：60Hz 螢幕與 120Hz/144Hz 電競/旗艦手機的下落速度暴差 2 倍以上，徹底摧毀跨設備 Time Trial 公平性！
- **修復行動**：
  - 位移全面基於 60fps 基準時鐘乘上 `dt * 60` 歸一化。
  - 編寫 `60Hz vs 120Hz` 跨刷新率自動單元測試，達成 100% 物理一致性。

---

## 🛡️ 五、 安全審查與程式碼審查的雙軌搭配 (Security & Code Review Synergy)

在軟體工程中，**程式碼審查（Code Review）**與**資安稽核（Security Audit）**如同兩道不同光譜的 X 光：

1. **職責切分**：
   - **Code Review（規格與品質）**：看的是業務邏輯對不對、手感好不好、設計模式（Design Patterns）純不純、可維護性高不高。
   - **Security Audit（邊界與信任）**：假設環境是惡意的、輸入是帶毒的、瀏覽器可能遭到注入，專注於威脅建模（Threat Modeling）與防禦縱深。
2. **本次雙軌聯動範例**：
   - Code Review 確保了「URL Hash Seed」能被遊戲引擎確定性還原。
   - Security Audit 則對該 Hash 進行注入與溢位測試，證明無 XSS 風險，並進一步要求在 `<head>` 加入嚴格的 **Content-Security-Policy (CSP)** 與 **Referrer-Policy**，並在 GitHub Actions 鎖定最小權限。
   - **結論**：Code Review 解決「產品能正確運作」，Security Audit 確保「產品在惡意情境下不會被攻破」。

---

## 🥊 六、 破局思考：為什麼第 1 次審查沒看出來？「裁判兼球員」之解法

本次覆盤最寶貴的哲學收穫，莫過於回答了使用者的提問：
> *「第一次審查為何沒看出來？審查子代理用同一個模型，這是不是裁判兼球員？」*

### 1. 漏查根源剖析
- **局部對比盲區**：`tick` 函式中到處都是 `* dt`，大腦與 LLM 產生了「時間步長已被全局處理」的確認偏誤。
- **測試盲點掩蓋**：初始測試用固定步長 `0.1` 測試，即使位移漏乘 `dt`，每次移動量依然相同，掩蓋了刷新率不一致。
- **同模型認知重疊**：主代理與審查代理同屬一個權重系列，共享相似的 Inductive Bias。

### 2. 「A + C 雙重鎖定」正式落地
為徹底根絕此問題，專案確立了業界首創的 AI 雙重鎖定防線：
- **方案 C（制度鎖定）**：在 [`docs/CODE_REVIEW_CONTRACT.md`](./docs/CODE_REVIEW_CONTRACT.md) 明訂**「二輪審查封頂」**與**「審查獨立性不變量」**，硬性規定審查代理嚴禁繼承編寫模型。
- **方案 A（執行鎖定）**：審查代理強制升級指定為 **`Model: 'pro'`**（或外部異構模型），以高推理預算進行冷眼對抗性審查。

---

## 💡 七、 結語：規劃與實作的動態循環 (The Continuous Loop)

從 17:17 到 20:36，這 3 個多小時的實踐證明：
* **規劃不是一次性的瀑布文檔**：需求在 Prototype 中被具象，在 SPEC 中被規範，在 TDD 中被驗證。
* **實作反哺規劃**：重構帶來了結構純淨，但也帶來了 Shim 檔案與物理 bug；透過 Security Audit 與 Code Review，又推動了《審查契約》與「A + C 雙重鎖定」的制度建立。

這正是一場兼具**工程美學、嚴格紀律與哲學思考**的 AI-Native 現代軟體開發示範！
