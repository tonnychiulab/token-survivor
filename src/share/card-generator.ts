export interface PostMortemStats {
  survivalTime: string;
  tokensBurned: string;
  nerfsCount: number;
  rank: string;
  deathReason: string;
  seed: number;
}

export function generatePostMortemImage(stats: PostMortemStats): Promise<string> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext('2d')!;

    // Background - Parchment paper
    ctx.fillStyle = '#f5f4ef';
    ctx.fillRect(0, 0, 1080, 1920);

    // Outer brutalist border
    ctx.lineWidth = 16;
    ctx.strokeStyle = '#111111';
    ctx.strokeRect(40, 40, 1000, 1840);

    // Header classification bar
    ctx.fillStyle = '#e60000';
    ctx.fillRect(48, 48, 984, 90);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('⚠ TOP SECRET // AI CORPORATE EXPOSURE REPORT', 540, 106);

    // Title Section
    ctx.fillStyle = '#111111';
    ctx.font = '900 84px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('TOKEN SURVIVOR', 540, 240);

    ctx.font = 'bold 36px monospace';
    ctx.fillStyle = '#0022ff';
    ctx.fillText('❯_ AI 巨獸限流生存戰 · 體檢報告', 540, 305);

    // Horizontal divider
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#111111';
    ctx.beginPath();
    ctx.moveTo(80, 350);
    ctx.lineTo(1000, 350);
    ctx.stroke();

    // Death Reason Callout Box
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(80, 400, 920, 280);
    ctx.strokeRect(80, 400, 920, 280);

    ctx.fillStyle = '#e60000';
    ctx.font = 'bold 32px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('🪦 致命死因 (CAUSE OF SYSTEM FAILURE):', 120, 460);

    ctx.fillStyle = '#111111';
    ctx.font = 'bold 38px sans-serif';
    const words = stats.deathReason;
    ctx.fillText(words.slice(0, 24), 120, 530);
    if (words.length > 24) {
      ctx.fillText(words.slice(24, 48), 120, 590);
    }

    // Stat Grid (4 large brutalist boxes)
    const statsData = [
      { label: '⏱️ 存活時間 (SURVIVAL)', val: stats.survivalTime },
      { label: '🔥 燃燒虛擬 TOKENS', val: stats.tokensBurned },
      { label: '📉 遭受靜默降智次數', val: `${stats.nerfsCount} 次` },
      { label: '🏆 工程師實力排名', val: stats.rank },
    ];

    const boxW = 440;
    const boxH = 240;
    const coords = [
      { x: 80, y: 730 },
      { x: 560, y: 730 },
      { x: 80, y: 1010 },
      { x: 560, y: 1010 },
    ];

    statsData.forEach((s, idx) => {
      const pos = coords[idx];
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(pos.x, pos.y, boxW, boxH);
      ctx.lineWidth = 6;
      ctx.strokeStyle = '#111111';
      ctx.strokeRect(pos.x, pos.y, boxW, boxH);

      ctx.fillStyle = '#666666';
      ctx.font = 'bold 28px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(s.label, pos.x + 30, pos.y + 60);

      ctx.fillStyle = '#0022ff';
      ctx.font = '900 50px monospace';
      ctx.fillText(s.val, pos.x + 30, pos.y + 150);
    });

    // Challenge Seed Section
    ctx.fillStyle = '#111111';
    ctx.fillRect(80, 1310, 920, 180);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`CHALLENGE SEED: #${stats.seed}`, 540, 1380);
    ctx.font = '28px sans-serif';
    ctx.fillStyle = '#d4ff00';
    ctx.fillText('點開專屬連結挑戰同一盤面，你能超越我的紀錄嗎？', 540, 1440);

    // Footer
    ctx.fillStyle = '#111111';
    ctx.font = 'bold 32px monospace';
    ctx.fillText('TOKEN SURVIVOR // 100% CLIENT-SIDE // NO SERVERS HARMED', 540, 1720);

    ctx.font = '24px monospace';
    ctx.fillStyle = '#888888';
    ctx.fillText('Generated natively via HTML5 Canvas · Free & Open Source', 540, 1780);

    resolve(canvas.toDataURL('image/png'));
  });
}
