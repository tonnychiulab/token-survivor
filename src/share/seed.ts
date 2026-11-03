export function getSeedFromUrl(): number {
  if (typeof window === 'undefined') return 123456;
  const match = window.location.hash.match(/#seed=(\d+)/);
  if (match) return parseInt(match[1], 10);
  const gen = Math.floor(100000 + Math.random() * 900000);
  window.location.hash = `#seed=${gen}`;
  return gen;
}

export function setUrlSeed(seed: number): void {
  if (typeof window === 'undefined') return;
  window.location.hash = `#seed=${seed}`;
}
