# Token Survivor (AI 巨獸限流生存戰)

[![Tests](https://img.shields.io/badge/tests-9%20passed-brightgreen.svg)]()
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)]()
[![Zero-Dependency](https://img.shields.io/badge/dependencies-0-success.svg)]()

> 一款純前端、零伺服器依賴、秒開秒玩、支援社群戰績挑戰的 AI 諷刺生存小遊戲。  
> 專為飽受各大 AI 巨獸「429 限流」、「無預警降智」、「重置遙遙無期」折磨的工程師與開發者打造。

---

## 🎮 快速開始

### 立即體驗
- 在 Windows 檔案總管中直接雙擊開啟：  
  `D:\wsl\Arch-Dev\token-survivor\index.html`
- 或透過任意靜態網頁伺服器託管（例如 GitHub Pages、Cloudflare Pages、Vercel）。

---

## ⚡ 遊戲玩法

| 項目 | 說明 |
| :--- | :--- |
| **Prompt Node** | 玩家操控的核心節點 `❯_`。支援手機單指觸控拖曳與滑鼠精準操控。 |
| **Context Window** | 玩家的「上下文視窗（血條）」。隨時間因 Token 洩漏而自然下降，歸零時觸發 Game Over。 |
| **429 巨石** | 巨獸限流直接重擊，扣除 20% Context Window。 |
| **📉 靜默降智** | 高速穿梭射線，擊中後模型思考遲鈍（移動減速 40%，持續 2.5 秒）並扣除 8% Context。 |
| **道德審查牆** | 橫向巨木障礙物，印有「身為大型語言模型...」的經典拒絕台詞。 |
| **📦 開源權重** | 拾取道具，大幅回補 +25% Context Window。 |
| **🔑 外流 API Key** | 稀有道具，提供 5 秒超頻無敵狀態與資源強力磁鐵，直接粉碎巨獸障礙！ |

---

## 🌟 核心工程與傳播特色

1. **瀏覽器圖示與標題動態一致性（Browser Identity Consistency）**
   - 內建高對比 SVG Favicon（平常為克萊因藍 `❯_`，Game Over 瞬間切換為紅底白字 `429`）。
   - 網頁標題即時反映存活狀態：`❯_ [92%] TOKEN SURVIVOR` -> `💀 [429] TOKEN SURVIVOR - 崩潰結算`。
   - 完整 Open Graph 與 Twitter Card 標籤，社群預覽卡片完美對齊。

2. **確定性種子對決（Deterministic URL Seed Engine）**
   - 網址自帶 `#seed=XXXXXX`，保證所有障礙物與道具下落的時間軸與順序 **100% 相同**。
   - 分享連結給同事或朋友，即是「挑戰同一局盤面」，公平較量存活秒數。

3. **純代碼合成音效（Web Audio Synthesizer）**
   - **0 KB 額外音效檔下載**！使用原生 Web Audio API 即時運算 8-bit 波形，包含受傷、拾取、無敵與 Game Over 哀嚎。
   - 支援持久化靜音開關（狀態自動儲存於 `localStorage`）。

4. **一鍵雙軌社群分享（Viral Sharing）**
   - **文字卡片**：一鍵複製格式化 Emoji 戰績與挑戰網址至剪貼簿。
   - **9:16 Brutalist 戰績圖卡**：純前端 Canvas 即時渲染一張 1080x1920 的矽谷機密文檔風格海報，一鍵下載發到社群！

---

## 🧪 測試驅動開發 (TDD)

本專案完全遵循 Matt Pocock 的 TDD 規範與單一核心測試縫（Headless Engine Seam）：

```bash
# 執行自動化測試 (Vitest)
npm test
```
