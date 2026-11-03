export type HazardType = 'boulder' | 'beam' | 'wall';
export type CollectibleType = 'weight' | 'key';

export interface Player {
  x: number;
  y: number;
  radius: number;
  targetX: number;
  targetY: number;
  speed: number;
}

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
  readonly player: Readonly<Player>;
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
  reset(newSeed?: number): void;
}
