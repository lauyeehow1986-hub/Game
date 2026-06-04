import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  SceneBackground,
  defaultStagePos,
  depthScale,
  GroundShadow,
  STAGE_W,
  STAGE_H,
  HORIZON_Y,
  type SceneId,
} from './scenery';

const ALL_SCENES: SceneId[] = [
  'kopitiam', 'street', 'resus', 'cathlab', 'imaging',
  'counsel', 'ward', 'pharmacy', 'rehab', 'clinic', 'backhouse',
];

describe('scenery — backgrounds', () => {
  it('renders a non-trivial <g> for every scene id', () => {
    for (const scene of ALL_SCENES) {
      const svg = renderToStaticMarkup(<SceneBackground scene={scene} />);
      expect(svg, `scene ${scene} did not render a <g>`).toMatch(/^<g/);
      // Each environment is substantial — guard against an empty/stub scene.
      expect(svg.length, `scene ${scene} looks too small`).toBeGreaterThan(400);
    }
  });

  it('every scene renders deterministically', () => {
    for (const scene of ALL_SCENES) {
      const a = renderToStaticMarkup(<SceneBackground scene={scene} />);
      const b = renderToStaticMarkup(<SceneBackground scene={scene} />);
      expect(a, `scene ${scene} not deterministic`).toBe(b);
    }
  });

  it('the kopitiam carries its hawker-stall signage', () => {
    const svg = renderToStaticMarkup(<SceneBackground scene="kopitiam" />);
    expect(svg).toContain('KOPI');
    expect(svg).toContain('CHICKEN RICE');
  });

  it('GroundShadow is an ellipse flatter than it is wide', () => {
    const svg = renderToStaticMarkup(<GroundShadow x={10} y={20} rx={12} />);
    expect(svg).toMatch(/<ellipse/);
    expect(svg).toContain('rx="12"');
    expect(svg).toContain('ry="3.84"'); // rx * 0.32
  });
});

describe('scenery — staging maths', () => {
  it('defaultStagePos keeps actors within the stage bounds', () => {
    for (let count = 1; count <= 9; count += 1) {
      for (let i = 0; i < count; i += 1) {
        const p = defaultStagePos(i, count);
        expect(p.x).toBeGreaterThanOrEqual(0);
        expect(p.x).toBeLessThanOrEqual(STAGE_W);
        expect(p.y).toBeGreaterThanOrEqual(HORIZON_Y);
        expect(p.y).toBeLessThanOrEqual(STAGE_H);
      }
    }
  });

  it('a single actor is centred', () => {
    expect(defaultStagePos(0, 1).x).toBe(STAGE_W / 2);
  });

  it('defaultStagePos is deterministic', () => {
    expect(defaultStagePos(2, 5)).toEqual(defaultStagePos(2, 5));
  });

  it('depthScale grows from the horizon toward the foreground', () => {
    const back = depthScale(HORIZON_Y);
    const front = depthScale(STAGE_H);
    expect(back).toBeCloseTo(0.7, 5);
    expect(front).toBeCloseTo(1.3, 5);
    expect(front).toBeGreaterThan(back);
  });

  it('depthScale clamps above the horizon to the minimum', () => {
    expect(depthScale(0)).toBeCloseTo(0.7, 5);
    expect(depthScale(HORIZON_Y - 50)).toBeCloseTo(0.7, 5);
  });
});
