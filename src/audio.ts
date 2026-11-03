export interface AudioController {
  init(): void;
  playHit(): void;
  playPickup(): void;
  playOverclock(): void;
  playNerf(): void;
  playGameOver(): void;
  toggleMute(): boolean;
  isMuted(): boolean;
}

export function createAudioController(): AudioController {
  let ctx: AudioContext | null = null;
  let muted = false;

  try {
    muted = localStorage.getItem('token_survivor_muted') === 'true';
  } catch {
    muted = false;
  }

  function getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        ctx = new AudioCtx();
      }
    }
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    return ctx;
  }

  function init(): void {
    getContext();
  }

  function playTone(freq: number, type: OscillatorType, duration: number, startGain = 0.15): void {
    if (muted) return;
    const ac = getContext();
    if (!ac) return;

    try {
      const osc = ac.createOscillator();
      const gain = ac.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ac.currentTime);

      gain.gain.setValueAtTime(startGain, ac.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + duration);

      osc.connect(gain);
      gain.connect(ac.destination);

      osc.start();
      osc.stop(ac.currentTime + duration);
    } catch {
      // AudioContext safety
    }
  }

  function playHit(): void {
    if (muted) return;
    const ac = getContext();
    if (!ac) return;

    try {
      const osc = ac.createOscillator();
      const gain = ac.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, ac.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, ac.currentTime + 0.25);

      gain.gain.setValueAtTime(0.2, ac.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.25);

      osc.connect(gain);
      gain.connect(ac.destination);

      osc.start();
      osc.stop(ac.currentTime + 0.25);
    } catch {}
  }

  function playPickup(): void {
    if (muted) return;
    playTone(523.25, 'sine', 0.08, 0.15); // C5
    setTimeout(() => playTone(659.25, 'sine', 0.12, 0.15), 70); // E5
  }

  function playOverclock(): void {
    if (muted) return;
    playTone(440.00, 'square', 0.08, 0.12);
    setTimeout(() => playTone(554.37, 'square', 0.08, 0.12), 70);
    setTimeout(() => playTone(659.25, 'square', 0.08, 0.12), 140);
    setTimeout(() => playTone(880.00, 'square', 0.25, 0.15), 210);
  }

  function playNerf(): void {
    if (muted) return;
    const ac = getContext();
    if (!ac) return;

    try {
      const osc = ac.createOscillator();
      const gain = ac.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, ac.currentTime);
      osc.frequency.linearRampToValueAtTime(160, ac.currentTime + 0.3);

      gain.gain.setValueAtTime(0.18, ac.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.3);

      osc.connect(gain);
      gain.connect(ac.destination);

      osc.start();
      osc.stop(ac.currentTime + 0.3);
    } catch {}
  }

  function playGameOver(): void {
    if (muted) return;
    playTone(392.00, 'sawtooth', 0.18, 0.15); // G4
    setTimeout(() => playTone(349.23, 'sawtooth', 0.18, 0.15), 180); // F4
    setTimeout(() => playTone(311.13, 'sawtooth', 0.22, 0.15), 360); // Eb4
    setTimeout(() => playTone(261.63, 'sawtooth', 0.45, 0.18), 560); // C4
  }

  function toggleMute(): boolean {
    muted = !muted;
    try {
      localStorage.setItem('token_survivor_muted', String(muted));
    } catch {}
    return muted;
  }

  function isMuted(): boolean {
    return muted;
  }

  return {
    init,
    playHit,
    playPickup,
    playOverclock,
    playNerf,
    playGameOver,
    toggleMute,
    isMuted,
  };
}
