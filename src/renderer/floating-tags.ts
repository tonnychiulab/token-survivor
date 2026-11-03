export interface FloatingTag {
  text: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  life: number;
}

export class FloatingTagManager {
  private tags: FloatingTag[] = [];

  add(text: string, x: number, y: number, color: string): void {
    let targetY = y;
    for (let i = this.tags.length - 1; i >= 0; i--) {
      const other = this.tags[i];
      if (other.life > 0.4 && Math.abs(other.x - x) < 90) {
        targetY = Math.min(targetY, other.y - 24);
      }
    }

    const vx = (Math.random() - 0.5) * 24;
    this.tags.push({
      text,
      x,
      y: targetY,
      vx,
      vy: -34,
      color,
      life: 1.3,
    });
  }

  clear(): void {
    this.tags = [];
  }

  update(dt: number): void {
    for (let i = this.tags.length - 1; i >= 0; i--) {
      const t = this.tags[i];
      t.x += t.vx * dt;
      t.y += t.vy * dt;
      t.vy += 12 * dt;
      t.vx *= 0.95;
      t.life -= dt * 0.85;

      if (t.life <= 0) {
        this.tags.splice(i, 1);
      }
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    for (let i = 0; i < this.tags.length; i++) {
      const t = this.tags[i];
      ctx.save();
      ctx.globalAlpha = Math.min(1.0, t.life * 1.6);
      ctx.font = '900 11px monospace';

      const tw = ctx.measureText(t.text).width;
      const boxW = tw + 14;
      const boxH = 20;
      const boxX = t.x - boxW / 2;
      const boxY = t.y - boxH / 2;

      // Brutalist 2px hard shadow
      ctx.fillStyle = '#111111';
      ctx.fillRect(boxX + 2, boxY + 2, boxW, boxH);

      // Physical paper background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(boxX, boxY, boxW, boxH);
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#111111';
      ctx.strokeRect(boxX, boxY, boxW, boxH);

      // Label text
      ctx.fillStyle = t.color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(t.text, t.x, t.y + 1);
      ctx.restore();
    }
  }
}
