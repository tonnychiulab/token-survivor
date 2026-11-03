export type HazardType = 'boulder' | 'beam' | 'wall';
export type CollectibleType = 'weight' | 'key';

/**
 * Domain-aligned Prompt Node interface (GLOSSARY: Prompt Node)
 */
export interface PromptNode {
  x: number;
  y: number;
  radius: number;
  targetX: number;
  targetY: number;
  speed: number;
}

// Backward-compatible alias
export type Player = PromptNode;

export interface Hazard {
  readonly id: number;
  readonly type: HazardType;
  x: number;
  y: number;
  readonly radius: number;
  readonly w?: number;
  readonly h?: number;
  readonly speed: number;
  readonly label: string;
  readonly color: string;
}

export interface Collectible {
  readonly id: number;
  readonly type: CollectibleType;
  x: number;
  y: number;
  readonly radius: number;
  readonly speed: number;
  readonly label: string;
  readonly color: string;
}

/**
 * Transient engine events emitted during state transitions
 * Decouples engine logic from audio and particle presentation
 */
export type EngineEvent =
  | { type: 'collision_boulder'; damage: number; x: number; y: number }
  | { type: 'collision_nerf'; damage: number; slowDuration: number; x: number; y: number }
  | { type: 'collision_wall'; damage: number; x: number; y: number }
  | { type: 'pickup_weight'; restoreAmount: number; x: number; y: number }
  | { type: 'pickup_key'; invulnerableDuration: number; x: number; y: number }
  | { type: 'smash_hazard'; bonusTokens: number; x: number; y: number }
  | { type: 'game_over'; reason: string };

export interface GameState {
  readonly seed: number;
  readonly width: number;
  readonly height: number;
  readonly isRunning: boolean;
  readonly isGameOver: boolean;
  readonly elapsedTime: number;
  readonly contextWindow: number; // 0 to 100
  readonly tokensBurned: number;
  readonly nerfsCount: number;
  readonly isSlowed: boolean;
  readonly slowTimer: number;
  readonly invulnerableTimer: number;
  readonly player: Readonly<PromptNode>;
  readonly promptNode: Readonly<PromptNode>;
  readonly hazards: ReadonlyArray<Hazard>;
  readonly collectibles: ReadonlyArray<Collectible>;
  readonly deathReason: string | null;
}

export interface GameEngineConfig {
  seed: number;
  width?: number;
  height?: number;
}

export interface GameEngine {
  tick(dt: number): void;
  setInput(x: number, y: number): void;
  getState(): Readonly<GameState>;
  consumeEvents(): EngineEvent[];
  reset(newSeed?: number): void;
}
