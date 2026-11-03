export interface ShareCardData {
  duration: string;
  tokens: string;
  nerfsCount: number;
  reason: string;
  rank: string;
  url: string;
}

export function copyResultToClipboard(data: ShareCardData): Promise<string> {
  const text = 
`💀【我的 AI 模型被巨獸榨乾了！】
⏱️ 存活時間：${data.duration} (${data.rank})
🔥 燃燒 Tokens：${data.tokens}
📉 遭受降智次數：${data.nerfsCount} 次
🪦 致命死因：${data.reason}

你能在 429 限流與靜默降智中撐過 1 分鐘嗎？
挑戰同一盤面 👉 ${data.url}`;

  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(text).then(() => text);
  }
  return Promise.resolve(text);
}
