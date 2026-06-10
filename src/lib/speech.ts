/**
 * Thin wrapper around the Web Speech SpeechSynthesis API.
 *
 * Pure narration for accessibility + immersion — reads the current
 * patient/caregiver/staff framing aloud when the player asks. Honoured
 * preference is persisted via a localStorage key separate from the
 * decision-chime mute so audio-impaired and audio-enthusiast users can
 * configure independently.
 */

const KEY = 'sg-pathway-narration-v1';

export function isSpeechSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export function isNarrationEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem(KEY) === '1';
}

export function setNarrationEnabled(v: boolean): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(KEY, v ? '1' : '0');
  if (!v) cancelSpeech();
}

/**
 * Stops any utterance currently being voiced. Safe to call when nothing
 * is speaking. Idempotent.
 */
export function cancelSpeech(): void {
  if (!isSpeechSupported()) return;
  window.speechSynthesis.cancel();
}

/**
 * Speak a string in the given BCP-47 lang code. Caller should respect the
 * isNarrationEnabled() flag — this function does NOT auto-mute, so unit
 * tests can drive it deterministically.
 */
export function speak(text: string, lang: string = 'en-SG'): void {
  if (!isSpeechSupported() || !text) return;
  // Cancel any queued utterance so rapid framing changes (e.g. clicking
  // through perspectives) don't pile up.
  window.speechSynthesis.cancel();
  const u = new window.SpeechSynthesisUtterance(text);
  u.lang = lang;
  // Slightly slower than default — clinical text reads better paced.
  u.rate = 0.95;
  u.pitch = 1;
  window.speechSynthesis.speak(u);
}

export function localeToBcp47(locale: 'en' | 'zh' | 'ms' | 'ta'): string {
  switch (locale) {
    case 'zh':
      return 'zh-CN';
    case 'ms':
      return 'ms-MY';
    case 'ta':
      return 'ta-IN';
    case 'en':
    default:
      return 'en-SG';
  }
}

/**
 * Voice availability for a language. Platform voice coverage varies wildly —
 * most desktop/mobile stacks ship en + zh voices, but ms and especially ta
 * voices are frequently absent. Narration UIs should check this before
 * promising audio in the active locale.
 *
 *  - 'native':   at least one installed voice matches the language subtag.
 *  - 'fallback': speech synthesis works but no voice matches — speaking the
 *                text would use a wrong-language default voice, so callers
 *                should narrate the English fallback text instead.
 *  - 'none':     no speech synthesis at all (or SSR).
 */
export type VoiceSupport = 'native' | 'fallback' | 'none';

export function getVoiceSupport(bcp47: string): VoiceSupport {
  if (!isSpeechSupported()) return 'none';
  const primary = bcp47.toLowerCase().split('-')[0];
  const voices = window.speechSynthesis.getVoices() ?? [];
  const match = voices.some(
    (v) => (v.lang ?? '').toLowerCase().split(/[-_]/)[0] === primary,
  );
  return match ? 'native' : 'fallback';
}

/**
 * Chrome populates `getVoices()` asynchronously — the first call commonly
 * returns an empty list and a `voiceschanged` event fires once the real
 * list lands. Subscribe to be re-notified; returns an unsubscribe handle.
 * No-ops (returns a dummy unsubscriber) when speech is unsupported.
 */
export function subscribeVoicesChanged(cb: () => void): () => void {
  if (!isSpeechSupported()) return () => {};
  const synth = window.speechSynthesis;
  if (typeof synth.addEventListener === 'function') {
    synth.addEventListener('voiceschanged', cb);
    return () => synth.removeEventListener('voiceschanged', cb);
  }
  return () => {};
}
