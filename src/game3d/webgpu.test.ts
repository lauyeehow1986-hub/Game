import { describe, it, expect, afterEach } from 'vitest';
import {
  isWebGPUOptedIn,
  isWebGPUSupported,
  probeWebGPU,
  resolveBackend,
  setWebGPUOptedIn,
} from './webgpu';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const g = globalThis as any;

afterEach(() => {
  delete g.navigator;
  delete g.window;
});

describe('resolveBackend (pure)', () => {
  it('only ever returns webgpu when both opted-in AND supported', () => {
    expect(resolveBackend(true, true)).toBe('webgpu');
    expect(resolveBackend(true, false)).toBe('webgl');
    expect(resolveBackend(false, true)).toBe('webgl');
    expect(resolveBackend(false, false)).toBe('webgl');
  });
});

describe('isWebGPUSupported', () => {
  it('false without a navigator (SSR / tests)', () => {
    expect(isWebGPUSupported()).toBe(false);
  });
  it('false when navigator has no gpu', () => {
    g.navigator = {};
    expect(isWebGPUSupported()).toBe(false);
  });
  it('true when navigator.gpu exists', () => {
    g.navigator = { gpu: {} };
    expect(isWebGPUSupported()).toBe(true);
  });
});

describe('probeWebGPU', () => {
  it('false when unsupported', async () => {
    expect(await probeWebGPU()).toBe(false);
  });
  it('true when an adapter is granted', async () => {
    g.navigator = { gpu: { requestAdapter: async () => ({}) } };
    expect(await probeWebGPU()).toBe(true);
  });
  it('false when the adapter request returns null', async () => {
    g.navigator = { gpu: { requestAdapter: async () => null } };
    expect(await probeWebGPU()).toBe(false);
  });
  it('false when the adapter request throws', async () => {
    g.navigator = { gpu: { requestAdapter: async () => { throw new Error('nope'); } } };
    expect(await probeWebGPU()).toBe(false);
  });
});

describe('opt-in persistence', () => {
  it('defaults to false and round-trips through localStorage', () => {
    const store = new Map<string, string>();
    g.window = {
      localStorage: {
        getItem: (k: string) => store.get(k) ?? null,
        setItem: (k: string, v: string) => store.set(k, v),
      },
    };
    expect(isWebGPUOptedIn()).toBe(false);
    setWebGPUOptedIn(true);
    expect(isWebGPUOptedIn()).toBe(true);
    setWebGPUOptedIn(false);
    expect(isWebGPUOptedIn()).toBe(false);
  });

  it('never throws without a window', () => {
    expect(() => setWebGPUOptedIn(true)).not.toThrow();
    expect(isWebGPUOptedIn()).toBe(false);
  });
});
