/**
 * High-contrast theme toggle — persisted in localStorage, applied as a
 * data-contrast attribute on <html>. Reads + writes are pure DOM/Storage so
 * the helper has no React dependency and can be called from main.tsx before
 * React mounts to avoid a flash.
 */

const KEY = 'sg-pathway-contrast-v1';

export type Contrast = 'normal' | 'high';

export function getContrast(): Contrast {
  if (typeof window === 'undefined') return 'normal';
  return window.localStorage.getItem(KEY) === 'high' ? 'high' : 'normal';
}

export function setContrast(c: Contrast): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(KEY, c);
  if (c === 'high') {
    document.documentElement.setAttribute('data-contrast', 'high');
  } else {
    document.documentElement.removeAttribute('data-contrast');
  }
}

export function applyPersistedContrast(): void {
  if (typeof window === 'undefined') return;
  if (getContrast() === 'high') {
    document.documentElement.setAttribute('data-contrast', 'high');
  }
}
