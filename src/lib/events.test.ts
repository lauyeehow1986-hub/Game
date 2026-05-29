import { describe, it, expect, vi } from 'vitest';
import { bus, Events } from './events';

describe('bus', () => {
  it('delivers an emit to a subscriber', () => {
    const fn = vi.fn();
    bus.on('test:a', fn);
    bus.emit('test:a', { x: 1 });
    expect(fn).toHaveBeenCalledWith({ x: 1 });
    bus.off('test:a', fn);
  });

  it('off() removes a subscriber', () => {
    const fn = vi.fn();
    bus.on('test:b', fn);
    bus.off('test:b', fn);
    bus.emit('test:b', { x: 1 });
    expect(fn).not.toHaveBeenCalled();
  });

  it('returns an unsubscribe function from on()', () => {
    const fn = vi.fn();
    const unsub = bus.on('test:c', fn);
    unsub();
    bus.emit('test:c', null);
    expect(fn).not.toHaveBeenCalled();
  });

  it('delivers to multiple subscribers of the same event', () => {
    const a = vi.fn();
    const b = vi.fn();
    bus.on('test:d', a);
    bus.on('test:d', b);
    bus.emit('test:d', 1);
    expect(a).toHaveBeenCalledTimes(1);
    expect(b).toHaveBeenCalledTimes(1);
    bus.off('test:d', a);
    bus.off('test:d', b);
  });

  it('emit on an unused event does not throw', () => {
    expect(() => bus.emit('test:nobody-listening', { x: 1 })).not.toThrow();
  });
});

describe('Events constants', () => {
  it('have unique values', () => {
    const values = Object.values(Events);
    expect(new Set(values).size).toBe(values.length);
  });

  it('all values are strings shaped like domain:event', () => {
    for (const v of Object.values(Events)) {
      expect(typeof v).toBe('string');
      expect(v).toMatch(/^[a-z]+:[a-z-]+$/);
    }
  });
});
