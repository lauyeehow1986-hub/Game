import { describe, it, expect } from 'vitest';
import { chestPainTriageCase as C } from './cases/chest-pain-triage';
import { pickNextNode, applyFlagEffects } from '../lib/pathway';
import { bestPath } from '../lib/best-path';

/**
 * Proves the v3.1 branching engine end-to-end: the triage decision forks to
 * three distinct branch nodes by option.nextNode + route flags, and every
 * branch reconverges at the shared `disposition` node.
 */

function routeFrom(optionId: string): string[] {
  const triage = C.pathway.find((n) => n.id === 'triage')!;
  const opt = triage.decision!.options.find((o) => o.id === optionId)!;
  const visited: string[] = ['triage'];
  let flags = applyFlagEffects(new Set<string>(), opt.effects);
  let node = pickNextNode(C, 'triage', opt.effects, opt.nextNode, flags);
  let guard = 0;
  while (node && guard++ < 20) {
    visited.push(node.id);
    if (node.id === 'disposition') break;
    // Take each branch's first option (all of which nextNode -> disposition).
    const o = node.decision!.options[0];
    flags = applyFlagEffects(flags, o.effects);
    node = pickNextNode(C, node.id, o.effects, o.nextNode, flags);
  }
  return visited;
}

describe('chest-pain-triage branching', () => {
  it('STEMI route goes triage -> stemi-path -> disposition', () => {
    const r = routeFrom('route-stemi');
    expect(r).toEqual(['triage', 'stemi-path', 'disposition']);
  });

  it('observation route goes triage -> obs-path -> disposition', () => {
    const r = routeFrom('route-obs');
    expect(r).toEqual(['triage', 'obs-path', 'disposition']);
  });

  it('discharge route goes triage -> discharge-path -> disposition', () => {
    const r = routeFrom('route-discharge');
    expect(r).toEqual(['triage', 'discharge-path', 'disposition']);
  });

  it('a branch never leaks into a sibling branch node', () => {
    const stemi = routeFrom('route-stemi');
    expect(stemi).not.toContain('obs-path');
    expect(stemi).not.toContain('discharge-path');
  });

  it('best-path takes the STEMI fork (highest-scoring) and reaches disposition', () => {
    const steps = bestPath(C);
    const nodeIds = steps.map((s) => s.nodeId);
    expect(nodeIds[0]).toBe('triage');
    expect(nodeIds).toContain('stemi-path');
    expect(nodeIds).toContain('disposition');
    expect(nodeIds).not.toContain('obs-path');
  });
});
