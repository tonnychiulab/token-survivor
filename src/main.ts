import { createGameEngine } from './engine/engine.js';
import { createAudioController } from './audio/synthesizer.js';
import { CanvasRenderer } from './renderer/canvas.js';
import { generatePostMortemImage } from './share/card-generator.js';
import { copyResultToClipboard } from './share/clipboard.js';
import { getSeedFromUrl } from './share/seed.js';

// Setup Deterministic Seed
const currentSeed = getSeedFromUrl();

// Browser Identity Elements
const faviconEl = document.getElementById('app-favicon') as HTMLLinkElement;
const normalFavicon = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' fill='%23f5f4ef' rx='4' stroke='%23111111' stroke-width='3'/%3E%3Ctext x='16' y='21' font-family='monospace' font-weight='900' font-size='16' fill='%230022ff' text-anchor='middle'%3E%E2%9D%AF_%3C/text%3E%3C/svg%3E";
const deadFavicon = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' fill='%23e60000' rx='4' stroke='%23111111' stroke-width='3'/%3E%3Ctext x='16' y='21' font-family='monospace' font-weight='900' font-size='14' fill='%23ffffff' text-anchor='middle'%3E429%3C/text%3E%3C/svg%3E";

function updateBrowserIdentity(status: 'idle' | 'playing' | 'gameover', contextPct = 100): void {
  if (!faviconEl) return;
  if (status === 'playing') {
    document.title = `❯_ [${Math.round(contextPct)}%] TOKEN SURVIVOR`;
    faviconEl.href = normalFavicon;
  } else if (status === 'gameover') {
    document.title = `💀 [429] TOKEN SURVIVOR - 崩潰結算`;
    faviconEl.href = deadFavicon;
  } else {
    document.title = `❯_ TOKEN SURVIVOR | 巨獸限流生存戰`;
    faviconEl.href = normalFavicon;
  }
}

// Audio & Canvas Initialization
const audio = createAudioController();
const container = document.getElementById('game-container') as HTMLElement;
const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
const renderer = new CanvasRenderer(canvas);

// DOM Elements
const contextBar = document.getElementById('context-bar') as HTMLElement;
const contextPctEl = document.getElementById('context-pct') as HTMLElement;
const tokensBurnedEl = document.getElementById('tokens-burned') as HTMLElement;
const seedBadge = document.getElementById('seed-badge') as HTMLElement;
const muteBtn = document.getElementById('mute-btn') as HTMLElement;
const toast = document.getElementById('toast') as HTMLElement;

const startOverlay = document.getElementById('start-overlay') as HTMLElement;
const gameoverOverlay = document.getElementById('gameover-overlay') as HTMLElement;
const deathReasonText = document.getElementById('death-reason-text') as HTMLElement;
const resTime = document.getElementById('res-time') as HTMLElement;
const resTokens = document.getElementById('res-tokens') as HTMLElement;
const resNerfs = document.getElementById('res-nerfs') as HTMLElement;
const resRank = document.getElementById('res-rank') as HTMLElement;

if (seedBadge) seedBadge.textContent = `SEED #${currentSeed}`;
if (muteBtn) muteBtn.textContent = audio.isMuted() ? '🔇' : '🔊';

let width = 0;
let height = 0;

function resize(): void {
  if (!container) return;
  const rect = container.getBoundingClientRect();
  width = rect.width;
  height = rect.height;
  renderer.resize(width, height);
}
window.addEventListener('resize', resize);
resize();

// Create Headless Engine
const engine = createGameEngine({ seed: currentSeed, width, height });

// Pointer Input tracking
function handlePointer(clientX: number, clientY: number): void {
  const rect = canvas.getBoundingClientRect();
  const x = clientX - rect.left;
  const y = clientY - rect.top;
  engine.setInput(x, y);
}

window.addEventListener('mousemove', (e) => handlePointer(e.clientX, e.clientY));
window.addEventListener('touchmove', (e) => {
  if (e.touches[0]) handlePointer(e.touches[0].clientX, e.touches[0].clientY);
}, { passive: true });
window.addEventListener('touchstart', (e) => {
  audio.init();
  if (e.touches[0]) handlePointer(e.touches[0].clientX, e.touches[0].clientY);
}, { passive: true });

function startGame(): void {
  audio.init();
  engine.reset(currentSeed);
  renderer.particles.clear();
  renderer.tags.clear();

  startOverlay.classList.add('hidden');
  gameoverOverlay.classList.add('hidden');
  updateBrowserIdentity('playing', 100);
}

function handleGameOver(state: ReturnType<typeof engine.getState>): void {
  audio.playGameOver();
  updateBrowserIdentity('gameover');

  const durationSec = Math.floor(state.elapsedTime);
  const mins = String(Math.floor(durationSec / 60)).padStart(2, '0');
  const secs = String(durationSec % 60).padStart(2, '0');

  deathReasonText.textContent = state.deathReason || '「Token 耗盡，請綁定信用卡。」';
  resTime.textContent = `${mins}:${secs}`;
  resTokens.textContent = state.tokensBurned.toLocaleString();
  resNerfs.textContent = `${state.nerfsCount} 次`;

  let rank = "Top 45% 開發者";
  if (durationSec > 70) rank = "Top 3% 傳奇架構師";
  else if (durationSec > 50) rank = "Top 12% 資深工程師";
  else if (durationSec > 30) rank = "Top 28% 技術專家";
  resRank.textContent = rank;

  gameoverOverlay.classList.remove('hidden');
}

// Main Animation Loop
let lastTime = performance.now();

function loop(timestamp: number): void {
  const dt = Math.min(0.1, (timestamp - lastTime) / 1000);
  lastTime = timestamp;

  const stateBefore = engine.getState();
  if (stateBefore.isRunning && !stateBefore.isGameOver) {
    engine.tick(dt);
    const state = engine.getState();

    // Consume transient events emitted from Engine (Eliminating Feature Envy!)
    const events = engine.consumeEvents();
    for (const ev of events) {
      switch (ev.type) {
        case 'collision_boulder':
          audio.playHit();
          renderer.particles.explode(ev.x, ev.y, '#e60000', 14);
          renderer.tags.add('-20% 上下文 (429)', ev.x, ev.y - 25, '#e60000');
          break;
        case 'collision_nerf':
          audio.playNerf();
          renderer.particles.explode(ev.x, ev.y, '#111111', 8);
          renderer.tags.add('📉 偷偷降智! 減速 40%', ev.x, ev.y - 25, '#111111');
          break;
        case 'collision_wall':
          renderer.particles.explode(ev.x, ev.y, '#666666', 8);
          renderer.tags.add('道德審查阻礙!', ev.x, ev.y - 25, '#666666');
          break;
        case 'pickup_weight':
          audio.playPickup();
          renderer.particles.explode(ev.x, ev.y, '#0022ff', 12);
          renderer.tags.add('+25% 開源權重!', ev.x, ev.y - 25, '#0022ff');
          break;
        case 'pickup_key':
          audio.playOverclock();
          renderer.tags.add('⚡ 5秒超頻無敵!', ev.x, ev.y - 35, '#0022ff');
          break;
        case 'smash_hazard':
          renderer.particles.explode(ev.x, ev.y, '#0022ff', 10);
          break;
        case 'game_over':
          handleGameOver(state);
          break;
      }
    }

    // HUD Updates
    contextBar.style.width = `${state.contextWindow}%`;
    contextPctEl.textContent = `${Math.round(state.contextWindow)}%`;
    tokensBurnedEl.textContent = state.tokensBurned.toLocaleString();
    updateBrowserIdentity('playing', state.contextWindow);

    if (state.isGameOver && gameoverOverlay.classList.contains('hidden')) {
      handleGameOver(state);
    }
  }

  renderer.render(engine.getState(), dt, width, height);
  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);

// DOM Event Listeners
document.getElementById('start-btn')?.addEventListener('click', startGame);
document.getElementById('restart-btn')?.addEventListener('click', startGame);

muteBtn?.addEventListener('click', () => {
  const isM = audio.toggleMute();
  muteBtn.textContent = isM ? '🔇' : '🔊';
});

// Share Text to Clipboard
document.getElementById('share-btn')?.addEventListener('click', () => {
  const state = engine.getState();
  copyResultToClipboard({
    duration: resTime.textContent || '00:00',
    tokens: resTokens.textContent || '0',
    nerfsCount: state.nerfsCount,
    reason: deathReasonText.textContent || '',
    rank: resRank.textContent || '',
    url: window.location.href,
  }).then(() => {
    toast.textContent = "已複製戰績到剪貼簿！";
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2000);
  });
});

// Download 9:16 Image Card
document.getElementById('download-card-btn')?.addEventListener('click', () => {
  const state = engine.getState();
  generatePostMortemImage({
    survivalTime: resTime.textContent || '00:00',
    tokensBurned: resTokens.textContent || '0',
    nerfsCount: state.nerfsCount,
    rank: resRank.textContent || '',
    deathReason: state.deathReason || 'Token 耗盡',
    seed: currentSeed,
  }).then((dataUrl) => {
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `TokenSurvivor_Seed_${currentSeed}.png`;
    a.click();

    toast.textContent = "戰績圖卡已下載！";
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2000);
  });
});
