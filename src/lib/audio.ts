/**
 * Minimal WebAudio chime utility. Generates short tones at runtime so we
 * don't bundle audio files. Honours a localStorage mute flag.
 */

let ctx: AudioContext | null = null;
const MUTE_KEY = 'sg-pathway-mute';

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (ctx) return ctx;
  const Klass = window.AudioContext ?? (window as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Klass) return null;
  try {
    ctx = new Klass();
  } catch {
    ctx = null;
  }
  return ctx;
}

export function isMuted(): boolean {
  if (typeof window === 'undefined') return true;
  return localStorage.getItem(MUTE_KEY) === '1';
}

export function setMuted(m: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(MUTE_KEY, m ? '1' : '0');
}

function playTone(frequency: number, durationMs: number, gainPeak = 0.08): void {
  if (isMuted()) return;
  const c = getCtx();
  if (!c) return;
  // Resume on first user gesture if needed.
  if (c.state === 'suspended') c.resume();
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = 'sine';
  osc.frequency.value = frequency;
  gain.gain.setValueAtTime(0, c.currentTime);
  gain.gain.linearRampToValueAtTime(gainPeak, c.currentTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + durationMs / 1000);
  osc.connect(gain).connect(c.destination);
  osc.start();
  osc.stop(c.currentTime + durationMs / 1000 + 0.01);
}

/** Short chime when a decision is committed. */
export function chimeDecision(): void {
  playTone(660, 180);
}

/** Two-note chime when a case completes. */
export function chimeCaseComplete(): void {
  playTone(523, 220);
  setTimeout(() => playTone(784, 280), 180);
}

/** Soft tick when the patient sprite arrives at a new department. */
export function chimeArrive(): void {
  playTone(880, 90, 0.04);
}
