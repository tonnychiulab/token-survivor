import { GameState } from '../engine/types.js';
import { ParticleManager } from './particles.js';
import { FloatingTagManager } from './floating-tags.js';
import {
  drawBoulder,
  drawNerfBeam,
  drawSafetyWall,
  drawOpenWeights,
  drawApiKey,
} from './vector-icons.js';

export class CanvasRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private time: number = 0;
  readonly particles = new ParticleManager();
  readonly tags = new FloatingTagManager();

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
  }

  resize(width: number, height: number): void {
    this.canvas.width = width * window.devicePixelRatio;
    this.canvas.height = height * window.devicePixelRatio;
    this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  }

  render(state: GameState, dt: number, width: number, height: number): void {
    this.time += dt;
    const ctx = this.ctx;
    ctx.clearRect(0, 0, width, height);

    // 1. Dot matrix paper background (Silicon Memo grid)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.04)';
    for (let x = 12; x < width; x += 24) {
      for (let y = 12; y < height; y += 24) {
        ctx.fillRect(x, y, 2, 2);
      }
    }

    if (!state.isRunning) return;

    // 2. Prompt Node Player
    ctx.save();
    ctx.translate(state.player.x, state.player.y);

    // Drop shadow
    ctx.fillStyle = '#111111';
    ctx.beginPath();
    ctx.arc(2.5, 2.5, state.player.radius, 0, Math.PI * 2);
    ctx.fill();

    // Body
    ctx.beginPath();
    ctx.arc(0, 0, state.player.radius, 0, Math.PI * 2);
    ctx.fillStyle = state.invulnerableTimer > 0 ? '#d4ff00' : (state.isSlowed ? '#666666' : '#0022ff');
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#111111';
    ctx.stroke();

    // Player Terminal glyph / icon
    ctx.fillStyle = state.invulnerableTimer > 0 ? '#111111' : '#ffffff';
    ctx.font = '900 12px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(state.invulnerableTimer > 0 ? '⚡' : (state.isSlowed ? '📉' : '❯_'), 0, 1);
    ctx.restore();

    // 3. Collectibles with vector graphics
    for (const c of state.collectibles) {
      if (c.type === 'weight') {
        const bobY = Math.sin(this.time * 5 + c.x) * 2.5;
        drawOpenWeights(ctx, c.x, c.y, c.radius, bobY);
      } else if (c.type === 'key') {
        drawApiKey(ctx, c.x, c.y, c.radius, this.time * 6);
      }
    }

    // 4. Hazards with vector graphics
    for (const h of state.hazards) {
      if (h.type === 'boulder') {
        drawBoulder(ctx, h.x, h.y, h.radius);
      } else if (h.type === 'beam') {
        drawNerfBeam(ctx, h.x, h.y, h.radius);
      } else if (h.type === 'wall' && h.w && h.h) {
        drawSafetyWall(ctx, h.x, h.y, h.w, h.h, h.label);
      }
    }

    // 5. Particles & Anti-overlap Floating Tags
    this.particles.update(dt);
    this.particles.render(ctx);

    this.tags.update(dt);
    this.tags.render(ctx);
  }
}
