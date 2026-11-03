import { describe, it, expect } from 'vitest';
import { createGameEngine } from '../src/engine.js';

describe('GameEngine - Collision Detection & Debuffs (Ticket 02)', () => {
  it('should reduce context window by 20% on 429 Boulder collision and emit collision_boulder event', () => {
    const engine = createGameEngine({ seed: 12345, width: 400, height: 700 });
    
    let boulderHit = false;
    for (let i = 0; i < 60; i++) {
      const state = engine.getState();
      const boulder = state.hazards.find(h => h.type === 'boulder');
      if (boulder) {
        engine.setInput(boulder.x, boulder.y);
      }
      engine.tick(0.1);
      const events = engine.consumeEvents();
      if (events.some(e => e.type === 'collision_boulder')) {
        boulderHit = true;
        const nextState = engine.getState();
        expect(nextState.contextWindow).toBeLessThan(85);
        break;
      }
    }
    expect(boulderHit).toBe(true);
  });

  it('should apply 40% slow debuff and emit collision_nerf event on Nerf Beam collision', () => {
    const engine = createGameEngine({ seed: 12345, width: 400, height: 700 });
    
    let nerfHit = false;
    for (let i = 0; i < 80; i++) {
      const state = engine.getState();
      const beam = state.hazards.find(h => h.type === 'beam');
      if (beam) {
        engine.setInput(beam.x, beam.y);
      }
      engine.tick(0.1);
      const events = engine.consumeEvents();
      if (events.some(e => e.type === 'collision_nerf')) {
        nerfHit = true;
        const nextState = engine.getState();
        expect(nextState.isSlowed).toBe(true);
        expect(nextState.slowTimer).toBeGreaterThan(0);
        expect(nextState.nerfsCount).toBeGreaterThanOrEqual(1);
        break;
      }
    }
    expect(nerfHit).toBe(true);
  });

  it('should restore context window by 25% (up to 100%) on Open Weights pickup and emit pickup_weight event', () => {
    const engine = createGameEngine({ seed: 12345, width: 400, height: 700 });
    
    // Burn down context first
    for (let i = 0; i < 15; i++) engine.tick(1.0);
    const lowContext = engine.getState().contextWindow;
    expect(lowContext).toBeLessThan(90);

    let weightCollected = false;
    for (let i = 0; i < 120; i++) {
      const state = engine.getState();
      const weight = state.collectibles.find(c => c.type === 'weight');
      if (weight) {
        engine.setInput(weight.x, weight.y);
      }
      engine.tick(0.1);
      const events = engine.consumeEvents();
      if (events.some(e => e.type === 'pickup_weight')) {
        weightCollected = true;
        expect(engine.getState().contextWindow).toBeGreaterThan(lowContext);
        break;
      }
    }
    expect(weightCollected).toBe(true);
  });

  it('should activate 5s invulnerability on Leaked API Key pickup and emit pickup_key event', () => {
    const engine = createGameEngine({ seed: 12345, width: 400, height: 700 });
    
    let keyCollected = false;
    for (let i = 0; i < 250; i++) {
      const state = engine.getState();
      const key = state.collectibles.find(c => c.type === 'key');
      if (key) {
        engine.setInput(key.x, key.y);
      }
      engine.tick(0.1);
      const events = engine.consumeEvents();
      if (events.some(e => e.type === 'pickup_key')) {
        keyCollected = true;
        expect(engine.getState().invulnerableTimer).toBeGreaterThan(4.0);
        break;
      }
    }
    expect(keyCollected).toBe(true);
  });

  it('should trigger game over when context window drops to 0 and emit game_over event', () => {
    const engine = createGameEngine({ seed: 12345, width: 400, height: 700 });
    
    let gameOverEmitted = false;
    for (let i = 0; i < 120; i++) {
      engine.tick(1.0);
      const events = engine.consumeEvents();
      if (events.some(e => e.type === 'game_over')) {
        gameOverEmitted = true;
        break;
      }
    }

    const state = engine.getState();
    expect(gameOverEmitted).toBe(true);
    expect(state.isGameOver).toBe(true);
    expect(state.contextWindow).toBe(0);
    expect(state.deathReason).not.toBeNull();
  });
});
