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

// Haptic Vibration helper
function triggerVibrate(pattern: number | number[]): void {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch (_) {
      // Ignore vibration errors if restricted by browser security policies
    }
  }
}

// Pointer Input tracking (Mouse: direct coordinate tracking)
function handlePointer(clientX: number, clientY: number): void {
  const rect = canvas.getBoundingClientRect();
  const x = clientX - rect.left;
  const y = clientY - rect.top;
  engine.setInput(x, y);
}

window.addEventListener('mousemove', (e) => handlePointer(e.clientX, e.clientY));

// Touch Input tracking (Mobile: Relative Drag to eliminate thumb occlusion)
let lastTouchX: number | null = null;
let lastTouchY: number | null = null;

window.addEventListener('touchstart', (e) => {
  audio.init();
  if (e.touches.length > 0) {
    lastTouchX = e.touches[0].clientX;
    lastTouchY = e.touches[0].clientY;
  }
}, { passive: true });

window.addEventListener('touchmove', (e) => {
  if (e.touches.length > 0 && lastTouchX !== null && lastTouchY !== null) {
    const touch = e.touches[0];
    const dx = touch.clientX - lastTouchX;
    const dy = touch.clientY - lastTouchY;
    lastTouchX = touch.clientX;
    lastTouchY = touch.clientY;

    const currentPrompt = engine.getState().promptNode;
    engine.setInput(currentPrompt.targetX + dx, currentPrompt.targetY + dy);
  }
}, { passive: true });

window.addEventListener('touchend', (e) => {
  if (e.touches.length > 0) {
    // Re-anchor to the remaining finger on screen
    lastTouchX = e.touches[0].clientX;
    lastTouchY = e.touches[0].clientY;
  } else {
    lastTouchX = null;
    lastTouchY = null;
  }
}, { passive: true });

window.addEventListener('touchcancel', () => {
  lastTouchX = null;
  lastTouchY = null;
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

  const current = engine.getState();
  if (current.isRunning && !current.isGameOver) {
    engine.tick(dt);
    const state = engine.getState();

    // Consume transient events emitted from Engine (Eliminating Feature Envy!)
    const events = engine.consumeEvents();
    for (const ev of events) {
      switch (ev.type) {
        case 'collision_boulder':
          audio.playHit();
          triggerVibrate([40, 25, 40]);
          renderer.particles.explode(ev.x, ev.y, '#e60000', 14);
          renderer.tags.add('-20% 上下文 (429)', ev.x, ev.y - 25, '#e60000');
          break;
        case 'collision_nerf':
          audio.playNerf();
          triggerVibrate(35);
          renderer.particles.explode(ev.x, ev.y, '#111111', 8);
          renderer.tags.add('📉 偷偷降智! 減速 40%', ev.x, ev.y - 25, '#111111');
          break;
        case 'collision_wall':
          audio.playHit();
          triggerVibrate(30);
          renderer.particles.explode(ev.x, ev.y, '#666666', 8);
          renderer.tags.add('道德審查阻礙!', ev.x, ev.y - 25, '#666666');
          break;
        case 'pickup_weight':
          audio.playPickup();
          triggerVibrate(20);
          renderer.particles.explode(ev.x, ev.y, '#0022ff', 12);
          renderer.tags.add('+25% 開源權重!', ev.x, ev.y - 25, '#0022ff');
          break;
        case 'pickup_key':
          audio.playOverclock();
          triggerVibrate([30, 20, 30]);
          renderer.tags.add('⚡ 5秒超頻無敵!', ev.x, ev.y - 35, '#0022ff');
          break;
        case 'smash_hazard':
          triggerVibrate(15);
          renderer.particles.explode(ev.x, ev.y, '#0022ff', 10);
          break;
        case 'game_over':
          triggerVibrate([80, 40, 80, 40, 120]);
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

// PWA Service Worker & In-App Update Banner
function initPWA(): void {
  // Only register Service Worker under HTTP/HTTPS and skip on standalone HTML file
  if (
    'serviceWorker' in navigator &&
    window.location.protocol.startsWith('http') &&
    !window.location.pathname.endsWith('standalone.html')
  ) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').then((reg) => {
        // If an update is waiting to activate, show prompt
        if (reg.waiting) {
          promptUpdate(reg.waiting);
          return;
        }

        reg.addEventListener('updatefound', () => {
          const installing = reg.installing;
          if (!installing) return;
          installing.addEventListener('statechange', () => {
            if (installing.state === 'installed' && navigator.serviceWorker.controller) {
              promptUpdate(installing);
            }
          });
        });
      }).catch((err) => {
        console.warn('[PWA] Service Worker registration skipped:', err);
      });

      let refreshing = false;
      const hadPreviousController = !!navigator.serviceWorker.controller;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        // Only auto-reload if an active worker was already controlling (meaning this is a version update, not cold start)
        if (hadPreviousController && !refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });
    });
  }
}

function promptUpdate(waitingWorker: ServiceWorker): void {
  const pwaToast = document.getElementById('pwa-toast');
  const refreshBtn = document.getElementById('pwa-refresh-btn');
  const dismissBtn = document.getElementById('pwa-dismiss-btn');

  if (!pwaToast || !refreshBtn || !dismissBtn) return;
  pwaToast.classList.remove('hidden');

  refreshBtn.onclick = () => {
    waitingWorker.postMessage({ type: 'SKIP_WAITING' });
    pwaToast.classList.add('hidden');
  };

  dismissBtn.onclick = () => {
    pwaToast.classList.add('hidden');
  };
}

initPWA();

