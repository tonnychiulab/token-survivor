/**
 * Vector Icon Paths & Canvas Drawing Helpers
 * Inspired by AllSVGIcons / Lucide minimal brutalist aesthetics.
 */

// Safe Path2D constructor helper for environments where Path2D might be mocked
function createPath(d: string): Path2D | null {
  if (typeof Path2D !== 'undefined') {
    try {
      return new Path2D(d);
    } catch {
      return null;
    }
  }
  return null;
}

export const PATHS = {
  // 24x24 viewBox: Downward crash arrow (Silent Nerf)
  trendingDown: createPath('M23 18l-9.5-9.5-5 5L1 6 M17 18h6v-6'),

  // 24x24 viewBox: Security shield with alert (Safety Refusal Wall)
  shieldAlert: createPath('M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z M12 8v4 M12 16h.01'),

  // 24x24 viewBox: Isometric 3D box (Open Weights)
  boxIsometric: createPath(
    'M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z M3.27 6.96L12 12.01l8.73-5.05 M12 22.08V12'
  ),

  // 24x24 viewBox: Brutalist Key (API Key)
  apiKey: createPath(
    'M21 2l-2 2m-1.5 1.5L14 9l-1.5-1.5L11 9l-1.5-1.5L8 9l-1.5-1.5L5 9 M13 15.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z'
  ),
};

/**
 * Draw 429 Boulder: Brutalist faceted rock with brutalist shadow & 429 badge
 */
export function drawBoulder(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number): void {
  ctx.save();
  ctx.translate(x, y);

  // 1. Hard brutalist drop shadow
  ctx.fillStyle = '#111111';
  ctx.beginPath();
  const shadowOffset = 3.5;
  const sides = 7;
  for (let i = 0; i < sides; i++) {
    const angle = (i * 2 * Math.PI) / sides - Math.PI / 2;
    const r = radius * (0.88 + 0.16 * ((i * 3) % 4));
    const px = Math.cos(angle) * r + shadowOffset;
    const py = Math.sin(angle) * r + shadowOffset;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();

  // 2. Faceted Boulder Body (Danger Red)
  ctx.fillStyle = '#e60000';
  ctx.beginPath();
  for (let i = 0; i < sides; i++) {
    const angle = (i * 2 * Math.PI) / sides - Math.PI / 2;
    const r = radius * (0.88 + 0.16 * ((i * 3) % 4));
    const px = Math.cos(angle) * r;
    const py = Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = '#111111';
  ctx.stroke();

  // 3. Facet Crease lines
  ctx.lineWidth = 1.2;
  ctx.strokeStyle = 'rgba(17, 17, 17, 0.4)';
  for (let i = 0; i < sides; i += 2) {
    const angle = (i * 2 * Math.PI) / sides - Math.PI / 2;
    const r = radius * (0.88 + 0.16 * ((i * 3) % 4));
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
    ctx.stroke();
  }

  // 4. White Stark "429" pill badge
  const bw = radius * 1.5;
  const bh = radius * 0.75;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(-bw / 2, -bh / 2, bw, bh);
  ctx.lineWidth = 1.8;
  ctx.strokeStyle = '#111111';
  ctx.strokeRect(-bw / 2, -bh / 2, bw, bh);

  ctx.fillStyle = '#111111';
  ctx.font = '900 11px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('429', 0, 1);

  ctx.restore();
}

/**
 * Draw Silent Nerf Missile: Dark capsule with trending down SVG path
 */
export function drawNerfBeam(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number): void {
  ctx.save();
  ctx.translate(x, y);

  // Hard shadow
  ctx.fillStyle = '#111111';
  ctx.beginPath();
  ctx.arc(2, 2, radius, 0, Math.PI * 2);
  ctx.fill();

  // Capsule Body
  ctx.fillStyle = '#111111';
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#e60000';
  ctx.stroke();

  // Vector Trending Down path
  if (PATHS.trendingDown) {
    ctx.save();
    const scale = (radius * 1.3) / 24;
    ctx.scale(scale, scale);
    ctx.translate(-12, -12);
    ctx.lineWidth = 2.8;
    ctx.strokeStyle = '#d4ff00'; // Acid yellow for high contrast
    ctx.stroke(PATHS.trendingDown);
    ctx.restore();
  } else {
    ctx.fillStyle = '#d4ff00';
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('📉', 0, 0);
  }

  ctx.restore();
}

/**
 * Draw Safety Refusal Wall: Checkpoint banner with caution stripes & disclaimer text
 */
export function drawSafetyWall(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  label: string
): void {
  ctx.save();

  // 1. Brutalist hard drop shadow
  ctx.fillStyle = '#111111';
  ctx.fillRect(x + 3, y + 3, w, h);

  // 2. White Paper Wall Base
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x, y, w, h);
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#111111';
  ctx.strokeRect(x, y, w, h);

  // 3. Top Danger Caution Stripe
  const stripeH = 4;
  ctx.fillStyle = '#e60000';
  ctx.fillRect(x, y, w, stripeH);

  // 4. Shield Alert Icon on the left
  if (PATHS.shieldAlert) {
    ctx.save();
    ctx.translate(x + 14, y + h / 2);
    const s = 14 / 24;
    ctx.scale(s, s);
    ctx.translate(-12, -12);
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#e60000';
    ctx.stroke(PATHS.shieldAlert);
    ctx.restore();
  }

  // 5. Preachy Safety Label Text
  ctx.fillStyle = '#111111';
  ctx.font = 'bold 9.5px sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, x + 26, y + h / 2 + 1);

  ctx.restore();
}

/**
 * Draw Open Weights: Isometric 3D box vector with Klein Blue
 */
export function drawOpenWeights(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  bobY: number = 0
): void {
  ctx.save();
  ctx.translate(x, y + bobY);

  // Hard shadow
  ctx.fillStyle = 'rgba(0, 34, 255, 0.2)';
  ctx.beginPath();
  ctx.arc(2, 2, radius, 0, Math.PI * 2);
  ctx.fill();

  // Circular Badge
  ctx.fillStyle = '#0022ff';
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#111111';
  ctx.stroke();

  // Isometric Box Vector
  if (PATHS.boxIsometric) {
    ctx.save();
    const s = (radius * 1.25) / 24;
    ctx.scale(s, s);
    ctx.translate(-12, -12);
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke(PATHS.boxIsometric);
    ctx.restore();
  } else {
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('📦', 0, 1);
  }

  // Floating label
  ctx.fillStyle = '#111111';
  ctx.font = 'bold 9px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('權重 [W]', 0, -radius - 5);

  ctx.restore();
}

/**
 * Draw Leaked API Key: Brutalist Key Vector with Overclock Pulsing Aura
 */
export function drawApiKey(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  pulse: number = 0
): void {
  ctx.save();
  ctx.translate(x, y);

  // Pulsing Overclock Ring
  ctx.strokeStyle = `rgba(230, 0, 0, ${0.3 + 0.3 * Math.sin(pulse)})`;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, radius + 4 + 2 * Math.sin(pulse), 0, Math.PI * 2);
  ctx.stroke();

  // Base Badge
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#111111';
  ctx.stroke();

  // Key Vector
  if (PATHS.apiKey) {
    ctx.save();
    const s = (radius * 1.3) / 24;
    ctx.scale(s, s);
    ctx.translate(-12, -12);
    ctx.lineWidth = 2.2;
    ctx.strokeStyle = '#e60000';
    ctx.stroke(PATHS.apiKey);
    ctx.restore();
  } else {
    ctx.fillStyle = '#e60000';
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🔑', 0, 1);
  }

  // Floating label
  ctx.fillStyle = '#e60000';
  ctx.font = '900 9px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('KEY (5s)', 0, -radius - 5);

  ctx.restore();
}
