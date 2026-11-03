import {
  GameEngine,
  GameEngineConfig,
  GameState,
  Hazard,
  Collectible,
  PromptNode,
  EngineEvent
} from './types.js';
import { createPRNG } from './prng.js';

const SAFETY_PHRASES = [
  "「為了保障用戶安全...」",
  "「該提示詞包含潛在敏感詞」",
  "「我無法提供可能有害的建議」",
  "「我們重視負責任的 AI 架構」"
];

const DEATH_QUOTES = [
  "「很抱歉，身為一個大型語言模型，我無法協助您存活下去。」",
  "「429 Too Many Requests: 您已達到每 3 小時 40 則訊息上限，重置時間未定。」",
  "「內部異常：思考鏈（Chain of Thought）太長導致上下文視窗溢出爆炸。」",
  "「突發更新：官方宣布該端點已被棄用（Deprecated），請遷移至最新版本。」",
  "「遭遇靜默降智（Silent Nerf）：模型已無法維持基本邏輯。」",
  "「伺服器冒煙：由於全球流量過大，目前已關閉免費用戶存取權限。」"
];

export function createGameEngine(config: GameEngineConfig): GameEngine {
  const width = config.width ?? 400;
  const height = config.height ?? 700;
  let seed = config.seed >>> 0;
  let random = createPRNG(seed);

  let isRunning = true;
  let isGameOver = false;
  let elapsedTime = 0;
  let contextWindow = 100;
  let tokensBurned = 0;
  let nerfsCount = 0;
  let isSlowed = false;
  let slowTimer = 0;
  let invulnerableTimer = 0;
  let deathReason: string | null = null;

  const promptNode: PromptNode = {
    x: width / 2,
    y: height - 120,
    radius: 17,
    targetX: width / 2,
    targetY: height - 120,
    speed: 13,
  };

  let hazards: Hazard[] = [];
  let collectibles: Collectible[] = [];
  let events: EngineEvent[] = [];
  let nextEntityId = 1;

  let spawnTimers = {
    boulder: 0,
    nerf: 0,
    wall: 0,
    weight: 0,
    key: 0,
  };

  function spawnBoulder(): void {
    const baseSpeed = 1.8 + random() * 1.0 + (elapsedTime * 0.025);
    hazards.push({
      id: nextEntityId++,
      type: 'boulder',
      x: random() * (width - 60) + 30,
      y: -40,
      radius: 20,
      speed: baseSpeed,
      label: '429',
      color: '#e60000',
    });
  }

  function spawnNerf(): void {
    const baseSpeed = 3.5 + random() * 1.0 + (elapsedTime * 0.03);
    hazards.push({
      id: nextEntityId++,
      type: 'beam',
      x: random() * (width - 40) + 20,
      y: -30,
      radius: 11,
      speed: baseSpeed,
      label: '📉 Nerf',
      color: '#111111',
    });
  }

  function spawnWall(): void {
    const phraseIdx = Math.floor(random() * SAFETY_PHRASES.length);
    hazards.push({
      id: nextEntityId++,
      type: 'wall',
      x: random() * (width - 160) + 10,
      y: -50,
      radius: 12,
      w: 150,
      h: 24,
      speed: 1.4 + (elapsedTime * 0.015),
      label: SAFETY_PHRASES[phraseIdx],
      color: '#666666',
    });
  }

  function spawnWeight(): void {
    collectibles.push({
      id: nextEntityId++,
      type: 'weight',
      x: random() * (width - 40) + 20,
      y: -20,
      radius: 14,
      speed: 1.6,
      label: '📦 權重',
      color: '#0022ff',
    });
  }

  function spawnKey(): void {
    collectibles.push({
      id: nextEntityId++,
      type: 'key',
      x: random() * (width - 40) + 20,
      y: -20,
      radius: 14,
      speed: 1.8,
      label: '🔑 Key',
      color: '#e60000',
    });
  }

  function triggerGameOver(reason?: string): void {
    if (isGameOver) return;
    isGameOver = true;
    isRunning = false;
    contextWindow = 0;
    deathReason = reason || DEATH_QUOTES[Math.floor(random() * DEATH_QUOTES.length)];
    events.push({ type: 'game_over', reason: deathReason });
  }

  function setInput(x: number, y: number): void {
    promptNode.targetX = Math.max(promptNode.radius, Math.min(width - promptNode.radius, x));
    promptNode.targetY = Math.max(promptNode.radius + 60, Math.min(height - promptNode.radius - 20, y));
  }

  function tick(dt: number): void {
    if (!isRunning || isGameOver) return;

    elapsedTime += dt;

    // Context natural burn
    const burnRate = 0.9 + (elapsedTime * 0.03);
    contextWindow = Math.max(0, contextWindow - burnRate * dt);

    // Tokens burned
    tokensBurned += Math.floor(dt * (12000 + elapsedTime * 800));

    // Timers
    if (invulnerableTimer > 0) {
      invulnerableTimer = Math.max(0, invulnerableTimer - dt);
    }
    if (slowTimer > 0) {
      slowTimer = Math.max(0, slowTimer - dt);
      isSlowed = true;
    } else {
      isSlowed = false;
    }

    // Spec compliance: 40% speed reduction when slowed (0.6x speed)
    const currentSpeed = isSlowed ? promptNode.speed * 0.6 : promptNode.speed;
    promptNode.x += (promptNode.targetX - promptNode.x) * (currentSpeed * dt);
    promptNode.y += (promptNode.targetY - promptNode.y) * (currentSpeed * dt);

    // Spawners
    spawnTimers.boulder += dt;
    spawnTimers.nerf += dt;
    spawnTimers.wall += dt;
    spawnTimers.weight += dt;
    spawnTimers.key += dt;

    const boulderInterval = Math.max(0.9, 2.2 - elapsedTime * 0.02);
    if (spawnTimers.boulder > boulderInterval) {
      spawnBoulder();
      spawnTimers.boulder = 0;
    }

    if (spawnTimers.nerf > Math.max(2.5, 4.5 - elapsedTime * 0.03)) {
      spawnNerf();
      spawnTimers.nerf = 0;
    }

    if (spawnTimers.wall > 7.0) {
      spawnWall();
      spawnTimers.wall = 0;
    }

    if (spawnTimers.weight > 5.5) {
      spawnWeight();
      spawnTimers.weight = 0;
    }

    if (spawnTimers.key > 14.0) {
      spawnKey();
      spawnTimers.key = 0;
    }

    // Update hazards & detect collisions
    for (let i = hazards.length - 1; i >= 0; i--) {
      const h = hazards[i];
      // Frame-rate independent displacement calibrated to 60fps base speed
      h.y += h.speed * dt * 60;

      let collided = false;
      if (h.type === 'wall' && h.w && h.h) {
        if (
          promptNode.x > h.x - promptNode.radius &&
          promptNode.x < h.x + h.w + promptNode.radius &&
          promptNode.y > h.y - promptNode.radius &&
          promptNode.y < h.y + h.h + promptNode.radius
        ) {
          collided = true;
        }
      } else {
        const dist = Math.hypot(promptNode.x - h.x, promptNode.y - h.y);
        if (dist < promptNode.radius + h.radius) {
          collided = true;
        }
      }

      if (collided) {
        hazards.splice(i, 1);

        // Invulnerable mode destroys hazard
        if (invulnerableTimer > 0) {
          tokensBurned += 50000;
          events.push({ type: 'smash_hazard', bonusTokens: 50000, x: promptNode.x, y: promptNode.y });
          continue;
        }

        if (h.type === 'boulder') {
          contextWindow = Math.max(0, contextWindow - 20);
          events.push({ type: 'collision_boulder', damage: 20, x: promptNode.x, y: promptNode.y });
          if (contextWindow <= 0) {
            triggerGameOver("「429 Too Many Requests: 您的 Prompt 被巨獸無情砸毀。」");
            return;
          }
        } else if (h.type === 'beam') {
          contextWindow = Math.max(0, contextWindow - 8);
          slowTimer = 2.5;
          isSlowed = true;
          nerfsCount++;
          events.push({ type: 'collision_nerf', damage: 8, slowDuration: 2.5, x: promptNode.x, y: promptNode.y });
          if (contextWindow <= 0) {
            triggerGameOver("「遭遇全面性靜默降智，模型已無法維持基本邏輯。」");
            return;
          }
        } else if (h.type === 'wall') {
          contextWindow = Math.max(0, contextWindow - 10);
          events.push({ type: 'collision_wall', damage: 10, x: promptNode.x, y: promptNode.y });
          if (contextWindow <= 0) {
            triggerGameOver("「踩中道德安全審查地雷：該請求已被直接封殺。」");
            return;
          }
        }
        continue;
      }

      if (h.y > height + 60) {
        hazards.splice(i, 1);
      }
    }

    // Update collectibles & detect pickups
    for (let i = collectibles.length - 1; i >= 0; i--) {
      const c = collectibles[i];
      // Frame-rate independent displacement calibrated to 60fps base speed
      c.y += c.speed * dt * 60;

      if (invulnerableTimer > 0) {
        c.x += (promptNode.x - c.x) * (0.08 * dt * 60);
        c.y += (promptNode.y - c.y) * (0.08 * dt * 60);
      }

      const dist = Math.hypot(promptNode.x - c.x, promptNode.y - c.y);
      if (dist < promptNode.radius + c.radius) {
        collectibles.splice(i, 1);
        if (c.type === 'weight') {
          contextWindow = Math.min(100, contextWindow + 25);
          events.push({ type: 'pickup_weight', restoreAmount: 25, x: promptNode.x, y: promptNode.y });
        } else if (c.type === 'key') {
          invulnerableTimer = 5.0;
          events.push({ type: 'pickup_key', invulnerableDuration: 5.0, x: promptNode.x, y: promptNode.y });
        }
        continue;
      }

      if (c.y > height + 40) {
        collectibles.splice(i, 1);
      }
    }

    // Natural context exhaustion
    if (contextWindow <= 0) {
      triggerGameOver("「Token 耗盡：您的免費額度已被全部燒光，請綁定信用卡。」");
    }
  }

  function getState(): Readonly<GameState> {
    return {
      seed,
      width,
      height,
      isRunning,
      isGameOver,
      elapsedTime,
      contextWindow,
      tokensBurned,
      nerfsCount,
      isSlowed,
      slowTimer,
      invulnerableTimer,
      player: { ...promptNode },
      promptNode: { ...promptNode },
      hazards: [...hazards],
      collectibles: [...collectibles],
      deathReason,
    };
  }

  function consumeEvents(): EngineEvent[] {
    const pending = events;
    events = [];
    return pending;
  }

  function reset(newSeed?: number): void {
    if (newSeed !== undefined) {
      seed = newSeed >>> 0;
    }
    random = createPRNG(seed);
    isRunning = true;
    isGameOver = false;
    elapsedTime = 0;
    contextWindow = 100;
    tokensBurned = 0;
    nerfsCount = 0;
    isSlowed = false;
    slowTimer = 0;
    invulnerableTimer = 0;
    deathReason = null;
    hazards = [];
    collectibles = [];
    events = [];
    promptNode.x = width / 2;
    promptNode.y = height - 120;
    promptNode.targetX = width / 2;
    promptNode.targetY = height - 120;
    spawnTimers = { boulder: 0, nerf: 0, wall: 0, weight: 0, key: 0 };
  }

  return {
    tick,
    setInput,
    getState,
    consumeEvents,
    reset,
  };
}
