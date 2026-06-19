import { describe, it, expect } from 'vitest';
import { surfacePlacement, type SurfaceSpot } from './space';

const surf = (auto: boolean): SurfaceSpot => ({ x: 0, z: -7.5, y: 1.0, yaw: Math.PI / 2, auto });

describe('surfacePlacement', () => {
  it('returns null when the scene has no surface', () => {
    expect(surfacePlacement(undefined, 'collapsed', true)).toBeNull();
  });
  it('returns null for a non-collapsed pose', () => {
    expect(surfacePlacement(surf(true), 'stand', true)).toBeNull();
  });
  it('auto surface snaps any collapsed patient', () => {
    expect(surfacePlacement(surf(true), 'collapsed', false)).toEqual({ x: 0, z: -7.5, y: 1.0, yaw: Math.PI / 2 });
  });
  it('non-auto surface needs the beat to opt in', () => {
    expect(surfacePlacement(surf(false), 'collapsed', false)).toBeNull();
    expect(surfacePlacement(surf(false), 'collapsed', true)).toEqual({ x: 0, z: -7.5, y: 1.0, yaw: Math.PI / 2 });
  });
});
