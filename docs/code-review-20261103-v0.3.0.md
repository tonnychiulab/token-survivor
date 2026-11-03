# 程式碼審查報告 (Code Review Report) - v0.3.0 (Round 1)

**專案名稱**: Token Survivor (AI 巨獸限流生存戰)  
**審查版本**: `v0.3.0`  
**審查輪次**: `Round 1: 宏觀架構與規格審查`  
**審查日期**: `2026-11-03`  
**審查依據**: 《程式碼審查契約》(`docs/CODE_REVIEW_CONTRACT.md`)  
**審查代理**: 獨立高階程式碼審查員 (Independent Code Reviewer, Model: `pro`)

---

## 🎯 一、 審查總覽與結論判定 (Executive Summary & Verdict)

依據專案《程式碼審查契約》(CODE_REVIEW_CONTRACT.md) 之退出標準，本次 v0.3.0 改版（包含 PWA 離線機制、Service Worker 註冊與更新通知、相對位移觸控拖曳、Web Vibration 震動回饋、以及單檔解耦建置）經由「Standards 規範軸」與「Spec 規格軸」雙軌獨立審核，並完成自動化測試驗證：

- **自動化測試**: Vitest 10 項單元測試全數通過（含 60Hz vs 120Hz 物理頻率無關性驗證）。
- **型別檢查**: `tsc --noEmit` 0 警告、0 錯誤。
- **打包建置**: Vite 打包正常，`scripts/build-standalone.js` 產出之純單檔 HTML 正常。
- **瑕疵統計**: **P0: 0 項 | P1: 0 項 | P2: 3 項 | P3: 1 項**

### 🏁 最終判定結論
> ### **【PASS (簽核放行)】**
> 本次改版**無任何 P0 阻斷性缺陷與 P1 重大瑕疵**，核心物理不變量、安全不變量與單檔獨立性皆完全遵守。所列 3 項 P2 次要瑕疵與 1 項 P3 微型優化依契約規定**不阻擋發布**，簽核放行進入發布程序，並登記至技術債清單（Tech Debt Backlog）。

---

## 🔍 二、 專案不變量硬性檢核清單 (Invariant Checklist)

| 檢核項目 | 標準定義 | 檢核結果 | 說明 |
| :--- | :--- | :---: | :--- |
| **1. 物理與時間步長不變量** | 位移乘上 `dt`；磁吸具幀率無關性；具備 60Hz vs 120Hz 跨頻率自動測試 | **PASS** | `src/engine/engine.ts` 中實體下落與平滑位移均由 `dt` 驅動；`tests/engine.test.ts` 包含 60Hz 與 120Hz 跨刷新率數值對比測試。 |
| **2. 模組重構純淨度不變量** | 無根目錄舊 Shim 轉接檔；`engine/` 嚴禁反向依賴渲染器或音訊 | **PASS** | 根目錄乾淨，無殘留轉發中介；`src/engine/` 僅依賴 PRNG 與型別定義，維持 100% Headless 純淨度。 |
| **3. 行動端與瀏覽器相容不變量** | 主頁面宣告 `overscroll-behavior: none;`；畫布容器宣告 `touch-action: none;` 與 `user-select: none;` | **PASS** | `styles/base.css` 已完整宣告 `overscroll-behavior: none`、`touch-action: none` 與 `-webkit-user-select: none`。 |
| **4. 縱深防禦與安全不變量** | HTML 內嵌嚴格 CSP 與 Referrer-Policy；CI/CD 宣告最小權限 | **PASS** | `index.html` 具備 CSP 與 Referrer-Policy；GitHub Actions workflow 宣告最小 `contents: read`、`pages: write`、`id-token: write`。 |
| **5. 審查獨立性不變量** | 獨立高階推理審查者，非編碼代理繼承 | **PASS** | 由指派之獨立審查員審查，貫徹雙重鎖定。 |

---

## 🔬 三、 四大專項檢驗 (Deep-Dive Focus Checks)

### 1. Service Worker 是否會干擾 local file:// 或造成無窮重新整理迴圈？
- **檢驗結果**：**安全無干擾，無無窮迴圈**。
- **分析詳情**：
  1. **`file://` 與單檔防護**：`src/main.ts` 中的 `initPWA()` 明確檢查 `window.location.protocol.startsWith('http')` 與 `!window.location.pathname.endsWith('standalone.html')`。當玩家於本機透過 `file://` 開啟 `index.html` 或雙擊開啟 `token-survivor-standalone.html` 時，`protocol` 為 `'file:'`，完全不會調用 Service Worker 註冊。
  2. **Service Worker 內部防禦**：`public/sw.js` 的 `fetch` 攔截器中包含 `if (!request.url.startsWith('http')) return;`，防止非 HTTP(S) 請求被錯誤快取。
  3. **重新整理迴圈檢驗**：在 `src/main.ts` 中，`controllerchange` 監聽器設有 `refreshing` 閉包鎖標記（`let refreshing = false`），當收到新版本跳過等待信號後僅重整一次。重整後新 SW 已處於控制狀態，不會再度觸發 `activate` 或 `controllerchange`，因此**不存在無窮重整迴圈**。

### 2. Relative Drag 觸控計算在邊界或多指觸控時是否有異常或未重置狀態？
- **檢驗結果**：**邊界計算優良無延遲死區；多指觸控存在邊界未重新錨定狀態 (P2)**。
- **分析詳情**：
  1. **邊界控制 (Boundary Response)**：`src/main.ts` 透過 `const currentPrompt = engine.getState().promptNode; engine.setInput(currentPrompt.targetX + dx, ...)` 傳遞相對位移，而 `engine.setInput()` 會在引擎內部將座標嚴格 Clamp 在視窗邊界內。當玩家在邊緣反向拉動時，因基底是已被 Clamp 的真實坐標，**反向移動立即可察覺，沒有虛擬坐標超界累積所造成的延遲死區 (Zero Boundary Lag)**。
  2. **多指觸控邊界狀態**：見後述 P2-3。

### 3. CSP (Content Security Policy) 是否允許 Service Worker 與 Manifest 正常工作？
- **檢驗結果**：**符合規範，完全相容**。
- **分析詳情**：
  1. **Manifest 載入**：在 CSP Level 3 規範中，`<link rel="manifest">` 由 `manifest-src` 管轄，未宣告時自動 fallback 至 `default-src 'self'`。由於 Manifest 檔 `manifest.webmanifest` 位於同源，完全合法。
  2. **Service Worker 註冊**：`navigator.serviceWorker.register()` 由 `worker-src` 管轄，未宣告時依序 fallback 至 `child-src`、`script-src 'self'`。現有 CSP 中 `script-src` 含有 `'self'`，各主流瀏覽器（Chrome, Safari, Firefox）均可順暢註冊。
  3. **資源與圖示**：Cache-First 機制之內部網路請求符合 `connect-src 'self'`；SVG 圖示符合 `img-src 'self' data:`。

### 4. 是否有任何阻斷發布的 P0/P1 問題？
- **檢驗結果**：**無任何 P0/P1 缺陷**。

---

## 📋 四、 雙軸審查細節與發現 (Findings by Severity)

### 【Standards 規範軸】
- **TypeScript 型別安全性**：通過。全域無 `any` 擴散，所有新增 API（如 Service Worker 事件、Vibration Helper、Touch 座標）皆符合嚴格型別定義。
- **CSS 規範一致性**：`styles/overlays.css` 中新增的 `#pwa-toast` 與 `.pwa-toast-card` 完美延續了 Retro Terminal / Neo-brutalism 黑框與字體風格。

### 【Spec 規格軸】
- **功能完整性**：
  - PWA Web App Manifest 完整配置名、圖示、展示模式與直向鎖定。
  - Service Worker 實現 Cache-First 靜態資源快取、Network-First 導航回退與主動更新對話框。
  - 行動端改為 Relative Drag 相對拖曳，有效解決拇指遮擋 Prompt Node 的人機工學問題。
  - 整合 Web Vibration API，在 7 大核心戰鬥事件中提供微震動體感。
  - Standalone 單檔建置腳本已將 external manifest 剝離，保障離線獨立運作。

---

## 🚦 五、 瑕疵條列與改進建議 (Detailed Findings)

### 🔴 P0 (阻斷發布 - Blocker)
- **無**

### 🟠 P1 (重大瑕疵 - Major)
- **無**

### 🟡 P2 (次要瑕疵 - Minor)

#### 1. [P2-1] Service Worker 首次冷啟動時 `controllerchange` 觸發非預期重整風險
- **位置**：`src/main.ts:309-315`
- **現況**：
  ```typescript
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!refreshing) {
      refreshing = true;
      window.location.reload();
    }
  });
  ```
- **分析**：在使用者首次造訪網站（冷啟動）時，頁面加載當下並無控制器（`navigator.serviceWorker.controller === null`）。當 Service Worker 安裝並激活（調用 `self.clients.claim()`）時，Chromium/Firefox 亦會對無控制器的客戶端分發 `controllerchange` 事件。若未判斷初始是否已有控制器，可能導致新玩家剛點擊開始遊戲 1~2 秒內遭遇一次突發性重新載入。
- **建議修正**：
  在監聽前記錄初始控制器狀態：
  ```typescript
  let hasController = !!navigator.serviceWorker.controller;
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!hasController) {
      hasController = true;
      return; // 首次安裝認領不重整頁面
    }
    if (!refreshing) {
      refreshing = true;
      window.location.reload();
    }
  });
  ```

#### 2. [P2-2] `public/sw.js` 導航離線 Fallback 運算子缺少 `await`
- **位置**：`public/sw.js:58-62`
- **現況**：
  ```javascript
  .catch(async () => {
    const match = await caches.match(request);
    if (match) return match;
    return caches.match('./') || caches.match('./index.html');
  })
  ```
- **分析**：`caches.match()` 回傳 `Promise`。在 JavaScript 中物件皆為 truthy，因此 `caches.match('./') || caches.match('./index.html')` 在 Promise 未解析前進行短路求值，永遠只會回傳第一個 Promise（`caches.match('./')`）。若 `./` 未命中快取，該 Promise 解析為 `undefined`，進而引發 `FetchEvent.respondWith` 拋出 TypeError。
- **建議修正**：
  ```javascript
  .catch(async () => {
    const match = await caches.match(request);
    if (match) return match;
    return (await caches.match('./')) || (await caches.match('./index.html'));
  })
  ```

#### 3. [P2-3] Relative Drag 於多指觸控時放開單指將重置狀態致使另一指失效
- **位置**：`src/main.ts:117-124`
- **現況**：
  ```typescript
  window.addEventListener('touchend', () => {
    lastTouchX = null;
    lastTouchY = null;
  }, { passive: true });
  ```
- **分析**：目前直接讀取 `e.touches[0]`。當玩家以雙指接觸螢幕（如一手輔助或誤觸），一旦放開第一隻手指，`touchend` 會直接將 `lastTouchX/Y` 設為 `null`。即使第二隻手指仍在螢幕上，接下來的 `touchmove` 也會因 `lastTouchX === null` 而停止更新，直到玩家將所有手指全數抬起重新接觸。
- **建議修正**：
  ```typescript
  window.addEventListener('touchend', (e) => {
    if (e.touches.length > 0) {
      lastTouchX = e.touches[0].clientX;
      lastTouchY = e.touches[0].clientY;
    } else {
      lastTouchX = null;
      lastTouchY = null;
    }
  }, { passive: true });
  ```

---

### 🟢 P3 (微型優化 - Trivial)

#### 1. [P3-1] CSP Meta 標籤顯式補齊 `worker-src` 與 `manifest-src`
- **位置**：`index.html:17`
- **建議**：雖然目前靠 `script-src 'self'` 與 `default-src 'self'` 可以 fallback 正常運作，但在 CSP meta 宣告中明確加入 `worker-src 'self'; manifest-src 'self';` 能提供更佳的自我文件化與最嚴格的瀏覽器防護。

---

## 📌 六、 審查簽核 (Sign-Off)

- **審查結論**: **PASS**
- **發布建議**: 建議放行 v0.3.0 合併與部署。所列 3 項 P2 瑕疵與 1 項 P3 優化已登記，建議於 v0.3.1 小改版中進行針對性微調。

---
*本報告依據《程式碼審查契約》由獨立高階程式碼審查員存檔產出。*
