import { describe, it, expect } from 'vitest';
import { createGameEngine } from '../src/engine/engine.js';

describe('GameEngine - Deterministic Core & Context Drain (Ticket 01)', () => {
  it('should initialize with default state and full context window', () => {
    const engine = createGameEngine({ seed: 12345, width: 400, height: 700 });
    const state = engine.getState();

    expect(state.seed).toBe(12345);
    expect(state.contextWindow).toBe(100);
    expect(state.isRunning).toBe(true);
    expect(state.isGameOver).toBe(false);
    expect(state.elapsedTime).toBe(0);
    expect(state.tokensBurned).toBe(0);
  });

  it('should drain context window steadily over time ticks', () => {
    const engine = createGameEngine({ seed: 12345, width: 400, height: 700 });
    
    // Advance 10 seconds in 1-second ticks
    for (let i = 0; i < 10; i++) {
      engine.tick(1.0);
    }

    const state = engine.getState();
    expect(state.elapsedTime).toBeCloseTo(10, 1);
    expect(state.contextWindow).toBeLessThan(100);
    expect(state.contextWindow).toBeGreaterThan(80); // Based on ~0.9%-1.2%/s rate
    expect(state.tokensBurned).toBeGreaterThan(0);
  });

  it('should generate identical hazard sequences for identical seeds (Determinism)', () => {
    const engine1 = createGameEngine({ seed: 8888, width: 400, height: 700 });
    const engine2 = createGameEngine({ seed: 8888, width: 400, height: 700 });

    // Advance both engines by 5 seconds
    for (let i = 0; i < 50; i++) {
      engine1.tick(0.1);
      engine2.tick(0.1);
    }

    const state1 = engine1.getState();
    const state2 = engine2.getState();

    expect(state1.hazards.length).toBeGreaterThan(0);
    expect(state1.hazards.length).toBe(state2.hazards.length);

    for (let i = 0; i < state1.hazards.length; i++) {
      expect(state1.hazards[i].type).toBe(state2.hazards[i].type);
      expect(state1.hazards[i].x).toBeCloseTo(state2.hazards[i].x, 2);
      expect(state1.hazards[i].y).toBeCloseTo(state2.hazards[i].y, 2);
    }
  });

  it('should update player position towards input target within boundary bounds', () => {
    const engine = createGameEngine({ seed: 12345, width: 400, height: 700 });
    
    // Set target input near top-left
    engine.setInput(50, 150);
    
    // Advance half a second
    engine.tick(0.5);

    const state = engine.getState();
    expect(state.player.x).toBeLessThan(200); // Moved from center towards 50
    expect(state.player.y).toBeLessThan(580); // Moved from bottom towards 150
  });

  it('should maintain frame-rate independence between 60Hz and 120Hz simulations', () => {
    const engine60 = createGameEngine({ seed: 9999, width: 400, height: 700 });
    const engine120 = createGameEngine({ seed: 9999, width: 400, height: 700 });

    // Simulate 3.0 seconds
    for (let i = 0; i < 180; i++) {
      engine60.tick(1 / 60);
    }
    for (let i = 0; i < 360; i++) {
      engine120.tick(1 / 120);
    }

    const state60 = engine60.getState();
    const state120 = engine120.getState();

    expect(state60.hazards.length).toBeGreaterThan(0);
    expect(state60.hazards.length).toBe(state120.hazards.length);
    for (let i = 0; i < state60.hazards.length; i++) {
      expect(state60.hazards[i].y).toBeCloseTo(state120.hazards[i].y, 0);
    }
  });
});
