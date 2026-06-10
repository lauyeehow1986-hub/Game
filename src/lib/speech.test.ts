import { describe, it, expect, afterEach } from 'vitest';
import { getVoiceSupport, localeToBcp47, subscribeVoicesChanged } from './speech';

describe('localeToBcp47', () => {
  it('maps each supported locale to a real BCP-47 tag', () => {
    expect(localeToBcp47('en')).toBe('en-SG');
    expect(localeToBcp47('zh')).toBe('zh-CN');
    expect(localeToBcp47('ms')).toBe('ms-MY');
    expect(localeToBcp47('ta')).toBe('ta-IN');
  });
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const g = globalThis as any;

function mockSynth(voiceLangs: string[], withEvents = true) {
  const listeners = new Set<() => void>();
  const synth = {
    getVoices: () => voiceLangs.map((lang) => ({ lang })),
    cancel: () => {},
    speak: () => {},
    addEventListener: withEvents
      ? (_: string, cb: () => void) => listeners.add(cb)
      : undefined,
    removeEventListener: withEvents
      ? (_: string, cb: () => void) => listeners.delete(cb)
      : undefined,
  };
  g.window = { speechSynthesis: synth };
  return { listeners };
}

afterEach(() => {
  delete g.window;
});

describe('getVoiceSupport', () => {
  it("returns 'none' when speech synthesis is unavailable (SSR / old browser)", () => {
    expect(getVoiceSupport('ta-IN')).toBe('none');
  });

  it("returns 'native' when an installed voice matches the language subtag", () => {
    mockSynth(['en-US', 'ta-IN', 'zh-CN']);
    expect(getVoiceSupport('ta-IN')).toBe('native');
    expect(getVoiceSupport('zh-CN')).toBe('native');
  });

  it('matches on the primary subtag only (region-agnostic)', () => {
    mockSynth(['ms-BN']); // Brunei Malay voice still counts for ms-MY
    expect(getVoiceSupport('ms-MY')).toBe('native');
  });

  it('tolerates underscore-style voice tags some platforms emit', () => {
    mockSynth(['ta_IN']);
    expect(getVoiceSupport('ta-IN')).toBe('native');
  });

  it("returns 'fallback' when speech works but no voice matches", () => {
    mockSynth(['en-US', 'en-GB']);
    expect(getVoiceSupport('ta-IN')).toBe('fallback');
    expect(getVoiceSupport('ms-MY')).toBe('fallback');
  });

  it("returns 'fallback' while the async voice list is still empty", () => {
    mockSynth([]);
    expect(getVoiceSupport('ms-MY')).toBe('fallback');
  });
});

describe('subscribeVoicesChanged', () => {
  it('subscribes and unsubscribes from voiceschanged', () => {
    const { listeners } = mockSynth(['en-US']);
    let fired = 0;
    const off = subscribeVoicesChanged(() => {
      fired += 1;
    });
    expect(listeners.size).toBe(1);
    [...listeners][0]();
    expect(fired).toBe(1);
    off();
    expect(listeners.size).toBe(0);
  });

  it('no-ops safely without speech synthesis', () => {
    const off = subscribeVoicesChanged(() => {});
    expect(() => off()).not.toThrow();
  });

  it('no-ops safely when the synth lacks addEventListener', () => {
    mockSynth(['en-US'], false);
    const off = subscribeVoicesChanged(() => {});
    expect(() => off()).not.toThrow();
  });
});
