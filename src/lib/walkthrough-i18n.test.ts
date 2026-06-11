import { describe, it, expect } from 'vitest';
import {
  localiseWalkthrough,
  walkthroughI18nCoverage,
  WALKTHROUGH_I18N_PACKS,
  type WalkthroughI18nPack,
} from './walkthrough-i18n';
import { sepsisWalkthrough } from './walkthrough-sepsis';
import { sepsisI18nPack } from './walkthrough-sepsis.i18n';
import type { Walkthrough } from './walkthrough';

const tiny: Walkthrough = {
  id: 'tiny-v1',
  title: 'Tiny',
  startChapterId: 'a',
  actors: { hero: { id: 'hero', role: 'Hero', team: 'patient', bio: '' } },
  chapters: {
    a: {
      id: 'a',
      title: 'Chapter A',
      durationSec: 10,
      location: 'Here',
      defaultNextChapterId: 'b',
      beats: [{ at: 0, actorId: 'hero', action: 'Does a thing.' }],
    },
    b: {
      id: 'b',
      title: 'Chapter B',
      durationSec: 8,
      beats: [{ at: 0, actorId: 'hero', action: 'Does another thing.' }],
      branchPoint: {
        prompt: 'Pick one?',
        options: [
          { label: 'Left', hint: 'go left', nextChapterId: 'a' },
          { label: 'Right', nextChapterId: 'a' },
        ],
      },
    },
  },
};

const tinyPack: WalkthroughI18nPack = {
  walkthroughId: 'tiny-v1',
  machineAssisted: true,
  locales: {
    zh: {
      title: '小小',
      actors: { hero: { role: '英雄' } },
      chapters: {
        a: { title: '第一章', location: '这里', beats: ['做一件事。'] },
        b: {
          title: '第二章',
          beats: ['做另一件事。'],
          branchPrompt: '选一个?',
          branchOptions: [{ label: '左', hint: '向左走' }, { label: '右' }],
        },
      },
    },
  },
};

describe('localiseWalkthrough', () => {
  it('returns the input unchanged for English', () => {
    expect(localiseWalkthrough(tiny, tinyPack, 'en')).toBe(tiny);
  });

  it('returns the input unchanged when no pack is supplied', () => {
    expect(localiseWalkthrough(tiny, null, 'zh')).toBe(tiny);
  });

  it('returns the input unchanged when the pack id does not match', () => {
    const wrong = { ...tinyPack, walkthroughId: 'other-v1' };
    expect(localiseWalkthrough(tiny, wrong, 'zh')).toBe(tiny);
  });

  it('swaps title, chapter titles, locations, beats, branch prompt + options', () => {
    const lw = localiseWalkthrough(tiny, tinyPack, 'zh');
    expect(lw.title).toBe('小小');
    expect(lw.actors.hero.role).toBe('英雄');
    expect(lw.chapters.a.title).toBe('第一章');
    expect(lw.chapters.a.location).toBe('这里');
    expect(lw.chapters.a.beats[0].action).toBe('做一件事。');
    expect(lw.chapters.b.branchPoint!.prompt).toBe('选一个?');
    expect(lw.chapters.b.branchPoint!.options[0].label).toBe('左');
    expect(lw.chapters.b.branchPoint!.options[0].hint).toBe('向左走');
    expect(lw.chapters.b.branchPoint!.options[1].label).toBe('右');
  });

  it('preserves structural fields (ids, durations, nextChapterId, at)', () => {
    const lw = localiseWalkthrough(tiny, tinyPack, 'zh');
    expect(lw.id).toBe('tiny-v1');
    expect(lw.startChapterId).toBe('a');
    expect(lw.chapters.a.durationSec).toBe(10);
    expect(lw.chapters.a.defaultNextChapterId).toBe('b');
    expect(lw.chapters.b.branchPoint!.options[0].nextChapterId).toBe('a');
    expect(lw.chapters.a.beats[0].at).toBe(0);
  });

  it('does not mutate the source walkthrough', () => {
    const before = JSON.stringify(tiny);
    localiseWalkthrough(tiny, tinyPack, 'zh');
    expect(JSON.stringify(tiny)).toBe(before);
  });

  it('falls back per-string for a missing locale in the pack', () => {
    // tinyPack has no 'ms' entry → unchanged.
    expect(localiseWalkthrough(tiny, tinyPack, 'ms')).toBe(tiny);
  });
});

describe('walkthroughI18nCoverage', () => {
  it('reports full coverage for the tiny pack in zh', () => {
    const cov = walkthroughI18nCoverage(tiny, tinyPack, 'zh');
    expect(cov.ratio).toBe(1);
    expect(cov.localised).toBe(cov.total);
  });

  it('reports zero for a locale absent from the pack', () => {
    const cov = walkthroughI18nCoverage(tiny, tinyPack, 'ta');
    expect(cov.localised).toBe(0);
    expect(cov.ratio).toBe(0);
  });

  it('English is always full', () => {
    const cov = walkthroughI18nCoverage(tiny, tinyPack, 'en');
    expect(cov.ratio).toBe(1);
  });
});

describe('sepsis pack — shape parity with the walkthrough', () => {
  it('is registered for lazy loading', () => {
    expect(WALKTHROUGH_I18N_PACKS['sepsis-pathway-v1']).toBeTypeOf('function');
  });

  it('targets the sepsis walkthrough and is flagged machine-assisted', () => {
    expect(sepsisI18nPack.walkthroughId).toBe(sepsisWalkthrough.id);
    expect(sepsisI18nPack.machineAssisted).toBe(true);
  });

  for (const locale of ['zh', 'ms', 'ta'] as const) {
    it(`${locale}: every translated chapter exists and beat arrays do not overrun`, () => {
      const tr = sepsisI18nPack.locales[locale]!;
      expect(tr).toBeTruthy();
      for (const [id, ct] of Object.entries(tr.chapters ?? {})) {
        const chapter = sepsisWalkthrough.chapters[id];
        expect(chapter, `pack references unknown chapter ${id}`).toBeTruthy();
        if (ct.beats) {
          expect(
            ct.beats.length,
            `chapter ${id} ${locale} has more beat translations than beats`,
          ).toBeLessThanOrEqual(chapter!.beats.length);
        }
        if (ct.branchOptions) {
          expect(chapter!.branchPoint, `chapter ${id} has branchOptions but no branchPoint`).toBeTruthy();
          expect(ct.branchOptions.length).toBeLessThanOrEqual(chapter!.branchPoint!.options.length);
        }
      }
    });

    it(`${locale}: every translated actor key exists in the walkthrough`, () => {
      const tr = sepsisI18nPack.locales[locale]!;
      for (const key of Object.keys(tr.actors ?? {})) {
        expect(sepsisWalkthrough.actors[key], `pack references unknown actor ${key}`).toBeTruthy();
      }
    });

    it(`${locale}: achieves high coverage of the sepsis walkthrough`, () => {
      const cov = walkthroughI18nCoverage(sepsisWalkthrough, sepsisI18nPack, locale);
      // Full chrome + beats translated; allow a small slack for actor bios
      // (intentionally left English — long, low display priority).
      expect(cov.ratio).toBeGreaterThan(0.6);
    });
  }
});
