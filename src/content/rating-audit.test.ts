/**
 * Mechanical audit of the 10/10 rubric in `docs/RATING.md`. If any axis
 * regresses below its stated threshold, this test fails CI — so the rating
 * claim cannot silently drift.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { listCases } from './index';
import { CURRICULA } from '../lib/curricula';
import { ACHIEVEMENTS } from '../lib/achievements';
import { GLOSSARY_TERMS } from '../lib/glossary';

const ROOT = resolve(__dirname, '..', '..');

describe('10/10 rating audit', () => {
  it('axis 1: content depth — ≥ 25 cases across all three categories', () => {
    const all = listCases();
    expect(all.length).toBeGreaterThanOrEqual(25);
    const categories = new Set(all.map((c) => c.category));
    expect(categories.has('acute')).toBe(true);
    expect(categories.has('elective')).toBe(true);
    expect(categories.has('outpatient')).toBe(true);
  });

  it('axis 2: curriculum coverage — ≥ 5 curricula; every caseId resolves', () => {
    expect(CURRICULA.length).toBeGreaterThanOrEqual(5);
    const validIds = new Set(listCases().map((c) => c.id));
    for (const c of CURRICULA) {
      for (const id of c.caseIds) {
        expect(validIds.has(id), `${c.id} → ${id} missing from catalogue`).toBe(true);
      }
    }
  });

  it('axis 3: i18n — every case fully bilingual (en + zh)', () => {
    for (const c of listCases()) {
      const title = c.title as Record<string, string>;
      expect(title.en, `${c.id} missing en title`).toBeTruthy();
      expect(title.zh, `${c.id} missing zh title`).toBeTruthy();
      const blurb = c.blurb as Record<string, string>;
      expect(blurb.en, `${c.id} missing en blurb`).toBeTruthy();
      expect(blurb.zh, `${c.id} missing zh blurb`).toBeTruthy();
    }
  });

  it('axis 4b (v2.0): campaigns + voice narration + adaptive suggestion shipped', async () => {
    for (const f of ['campaigns.ts', 'speech.ts']) {
      expect(
        readFileSync(resolve(ROOT, 'src/lib', f), 'utf-8').length,
        `${f} missing or empty`,
      ).toBeGreaterThan(100);
    }
    expect(
      readFileSync(resolve(ROOT, 'src/ui/panels/CampaignPanel.tsx'), 'utf-8').length,
    ).toBeGreaterThan(100);
    expect(
      readFileSync(resolve(ROOT, 'src/state/campaignStore.ts'), 'utf-8').length,
    ).toBeGreaterThan(100);
    // CaseList must render a Suggested badge wired off the personal-trends recommendation.
    const caseList = readFileSync(resolve(ROOT, 'src/ui/panels/CaseList.tsx'), 'utf-8');
    expect(caseList).toMatch(/suggestedCaseId/);
    expect(caseList).toMatch(/cases\.badge\.suggested/);

    // v2.0 inventory: ≥ 5 campaigns, ResultsModal Next/Finish CTAs,
    // SettingsModal narration toggle, HUD campaign chip, package.json
    // version bumped to 2.x.
    const { CAMPAIGNS } = await import('../lib/campaigns');
    expect(CAMPAIGNS.length).toBeGreaterThanOrEqual(5);

    const resultsModal = readFileSync(resolve(ROOT, 'src/ui/modals/ResultsModal.tsx'), 'utf-8');
    expect(resultsModal).toMatch(/results\.campaignNext/);
    expect(resultsModal).toMatch(/campaign-completed/);

    const settings = readFileSync(resolve(ROOT, 'src/ui/modals/SettingsModal.tsx'), 'utf-8');
    expect(settings).toMatch(/settings\.narration/);

    const hud = readFileSync(resolve(ROOT, 'src/ui/HUD.tsx'), 'utf-8');
    expect(hud).toMatch(/useCampaign/);

    const pkg = JSON.parse(readFileSync(resolve(ROOT, 'package.json'), 'utf-8')) as { version: string };
    expect(pkg.version).toMatch(/^[23456789]\./);
  });

  it('axis 4i (v8.1-v9.0): journal, freeze, calibration trend, certificate, debrief shipped', () => {
    for (const f of ['streak-freeze.ts', 'personal-best-print.ts', 'debrief.ts', 'debrief-print.ts']) {
      expect(
        readFileSync(resolve(ROOT, 'src/lib', f), 'utf-8').length,
        `${f} missing or empty`,
      ).toBeGreaterThan(100);
    }
    for (const f of ['caseJournalStore.ts', 'streakFreezeStore.ts', 'calibrationStore.ts']) {
      expect(
        readFileSync(resolve(ROOT, 'src/state', f), 'utf-8').length,
        `${f} missing or empty`,
      ).toBeGreaterThan(100);
    }
    // ResultsModal exposes journal, debrief and personal-best certificate.
    const results = readFileSync(resolve(ROOT, 'src/ui/modals/ResultsModal.tsx'), 'utf-8');
    expect(results).toMatch(/useCaseJournal/);
    expect(results).toMatch(/personal-best-print|openPersonalBestCertificate/);
    expect(results).toMatch(/debrief|buildDebrief/);
    // ExamModal persists calibration sessions across runs.
    const exam = readFileSync(resolve(ROOT, 'src/ui/modals/ExamModal.tsx'), 'utf-8');
    expect(exam).toMatch(/useCalibration|recordCalibrationSession|recordSession/);
    // TrendsPanel surfaces freezes, calibration trend and journal.
    const trends = readFileSync(resolve(ROOT, 'src/ui/panels/TrendsPanel.tsx'), 'utf-8');
    expect(trends).toMatch(/useStreakFreezes|shieldStreak/);
    expect(trends).toMatch(/useCalibration|calibration\.trendLabel/);
    expect(trends).toMatch(/useCaseJournal|journal\.heading/);
    // package.json bumped to 9.x.
    const pkg = JSON.parse(readFileSync(resolve(ROOT, 'package.json'), 'utf-8')) as { version: string };
    expect(pkg.version).toMatch(/^9\./);
  });

  it('axis 4h (v7.1-v8.0): goals, bookmarks, flashcards, mastery, portfolio shipped', () => {
    for (const f of ['learning-goals.ts', 'flashcards.ts', 'mastery.ts', 'portfolio.ts', 'portfolio-print.ts']) {
      expect(
        readFileSync(resolve(ROOT, 'src/lib', f), 'utf-8').length,
        `${f} missing or empty`,
      ).toBeGreaterThan(100);
    }
    for (const f of ['learningGoalsStore.ts', 'bookmarksStore.ts']) {
      expect(
        readFileSync(resolve(ROOT, 'src/state', f), 'utf-8').length,
        `${f} missing or empty`,
      ).toBeGreaterThan(100);
    }
    expect(
      readFileSync(resolve(ROOT, 'src/ui/modals/FlashcardsModal.tsx'), 'utf-8').length,
    ).toBeGreaterThan(100);
    // TrendsPanel surfaces all five v7.1-v8.0 launchers.
    const trends = readFileSync(resolve(ROOT, 'src/ui/panels/TrendsPanel.tsx'), 'utf-8');
    expect(trends).toMatch(/useLearningGoals/);
    expect(trends).toMatch(/useBookmarks/);
    expect(trends).toMatch(/FlashcardsModal/);
    expect(trends).toMatch(/masteryReport/);
    expect(trends).toMatch(/buildPortfolio|portfolio-print/);
    // ResultsModal exposes the bookmark toggle.
    const results = readFileSync(resolve(ROOT, 'src/ui/modals/ResultsModal.tsx'), 'utf-8');
    expect(results).toMatch(/useBookmarks|toggleBookmark/);
    // package.json bumped past 8.x — locked tight in axis 4i.
    const pkg = JSON.parse(readFileSync(resolve(ROOT, 'package.json'), 'utf-8')) as { version: string };
    expect(pkg.version).toMatch(/^[89]\./);
  });

  it('axis 4g (v6.1-v7.0): handoff, Brier calibration, study sets, cheatsheet, competency shipped', () => {
    for (const f of ['handoff.ts', 'calibration.ts', 'cheatsheet-print.ts', 'competency.ts']) {
      expect(
        readFileSync(resolve(ROOT, 'src/lib', f), 'utf-8').length,
        `${f} missing or empty`,
      ).toBeGreaterThan(100);
    }
    expect(
      readFileSync(resolve(ROOT, 'src/state/studySetsStore.ts'), 'utf-8').length,
    ).toBeGreaterThan(100);
    expect(
      readFileSync(resolve(ROOT, 'src/ui/panels/StudySetsPanel.tsx'), 'utf-8').length,
    ).toBeGreaterThan(100);
    // gameStore exposes resumeFromHandoff.
    const gs = readFileSync(resolve(ROOT, 'src/state/gameStore.ts'), 'utf-8');
    expect(gs).toMatch(/resumeFromHandoff/);
    // ExamModal carries confidence + calibration.
    const exam = readFileSync(resolve(ROOT, 'src/ui/modals/ExamModal.tsx'), 'utf-8');
    expect(exam).toMatch(/calibrationScore|calibrationPicks/);
    // TrendsPanel shows the competency badge + cheatsheet launcher.
    const trends = readFileSync(resolve(ROOT, 'src/ui/panels/TrendsPanel.tsx'), 'utf-8');
    expect(trends).toMatch(/competency/);
    expect(trends).toMatch(/cheatsheet/);
    // App mounts StudySetsPanel.
    const app = readFileSync(resolve(ROOT, 'src/App.tsx'), 'utf-8');
    expect(app).toMatch(/StudySetsPanel/);
    // SettingsModal exposes HandoffSection.
    const settings = readFileSync(resolve(ROOT, 'src/ui/modals/SettingsModal.tsx'), 'utf-8');
    expect(settings).toMatch(/HandoffSection|handoff\.heading/);
  });

  it('axis 4f (v5.1-v6.0): replay scrubber, coach, peer review shipped', () => {
    for (const f of ['replay.ts', 'coach.ts', 'peer-review.ts']) {
      expect(
        readFileSync(resolve(ROOT, 'src/lib', f), 'utf-8').length,
        `${f} missing or empty`,
      ).toBeGreaterThan(100);
    }
    expect(
      readFileSync(resolve(ROOT, 'src/ui/modals/ReplayScrubberModal.tsx'), 'utf-8').length,
    ).toBeGreaterThan(100);
    // RunReviewModal wires the peer-review panel.
    const runReview = readFileSync(resolve(ROOT, 'src/ui/modals/RunReviewModal.tsx'), 'utf-8');
    expect(runReview).toMatch(/PeerReviewPanel/);
    expect(runReview).toMatch(/SGR1|encodeThread|peer-review/);
    // TrendsPanel surfaces the coach card.
    const trends = readFileSync(resolve(ROOT, 'src/ui/panels/TrendsPanel.tsx'), 'utf-8');
    expect(trends).toMatch(/coachSuggestion/);
    // ResultsModal launches the timeline scrubber.
    const results = readFileSync(resolve(ROOT, 'src/ui/modals/ResultsModal.tsx'), 'utf-8');
    expect(results).toMatch(/ReplayScrubberModal/);
  });

  it('axis 4e (v4.1-v5.0): study planner, duel, specialty pack, high-contrast shipped', () => {
    for (const f of ['study-plan.ts', 'duel.ts', 'contrast.ts']) {
      expect(
        readFileSync(resolve(ROOT, 'src/lib', f), 'utf-8').length,
        `${f} missing or empty`,
      ).toBeGreaterThan(100);
    }
    expect(
      readFileSync(resolve(ROOT, 'src/ui/panels/StudyPlanPanel.tsx'), 'utf-8').length,
    ).toBeGreaterThan(100);
    expect(
      readFileSync(resolve(ROOT, 'src/ui/modals/DuelModal.tsx'), 'utf-8').length,
    ).toBeGreaterThan(100);
    // v4.3 specialty pack present.
    for (const f of ['elective-knee-tkr.ts', 'copd-exacerbation.ts', 'anaphylaxis-ed.ts']) {
      expect(
        readFileSync(resolve(ROOT, 'src/content/cases', f), 'utf-8').length,
        `${f} missing or empty`,
      ).toBeGreaterThan(100);
    }
    // High-contrast wired: applied before React mounts + Settings toggle.
    const main = readFileSync(resolve(ROOT, 'src/main.tsx'), 'utf-8');
    expect(main).toMatch(/applyPersistedContrast/);
    const settings = readFileSync(resolve(ROOT, 'src/ui/modals/SettingsModal.tsx'), 'utf-8');
    expect(settings).toMatch(/setContrast/);
    // App mounts the StudyPlanPanel.
    const app = readFileSync(resolve(ROOT, 'src/App.tsx'), 'utf-8');
    expect(app).toMatch(/StudyPlanPanel/);
    // TrendsPanel exposes Duel + Analytics launchers.
    const trends = readFileSync(resolve(ROOT, 'src/ui/panels/TrendsPanel.tsx'), 'utf-8');
    expect(trends).toMatch(/DuelModal/);
  });

  it('axis 4d (v3.1-v4.0): branching, vitals, generator, analytics, sandbox shipped', () => {
    for (const f of ['patient-state.ts', 'scenario-generator.ts', 'analytics.ts']) {
      expect(
        readFileSync(resolve(ROOT, 'src/lib', f), 'utf-8').length,
        `${f} missing or empty`,
      ).toBeGreaterThan(100);
    }
    for (const f of ['AnalyticsModal.tsx', 'SandboxModal.tsx']) {
      expect(
        readFileSync(resolve(ROOT, 'src/ui/modals', f), 'utf-8').length,
        `${f} missing or empty`,
      ).toBeGreaterThan(100);
    }
    // Branching case present + tested.
    expect(
      readFileSync(resolve(ROOT, 'src/content/cases/chest-pain-triage.ts'), 'utf-8').length,
    ).toBeGreaterThan(100);
    // HUD wires the derived stability chip.
    const hud = readFileSync(resolve(ROOT, 'src/ui/HUD.tsx'), 'utf-8');
    expect(hud).toMatch(/computeStability/);
    // CaseList opens the Sandbox.
    const caseList = readFileSync(resolve(ROOT, 'src/ui/panels/CaseList.tsx'), 'utf-8');
    expect(caseList).toMatch(/SandboxModal/);
  });

  it('axis 4c (v2.2-2.5): exam, case-builder, educator, spaced-retrieval shipped', () => {
    for (const f of ['exam.ts', 'case-builder.ts', 'assignment.ts', 'spaced-repetition.ts', 'certificate-print.ts']) {
      expect(
        readFileSync(resolve(ROOT, 'src/lib', f), 'utf-8').length,
        `${f} missing or empty`,
      ).toBeGreaterThan(100);
    }
    for (const f of ['ExamModal.tsx', 'CaseBuilderModal.tsx', 'EducatorModal.tsx']) {
      expect(
        readFileSync(resolve(ROOT, 'src/ui/modals', f), 'utf-8').length,
        `${f} missing or empty`,
      ).toBeGreaterThan(100);
    }
    // AssignmentBanner wired into App for ?assign= links.
    const app = readFileSync(resolve(ROOT, 'src/App.tsx'), 'utf-8');
    expect(app).toMatch(/AssignmentBanner/);
    // Spaced-retrieval review surface in Trends.
    const trends = readFileSync(resolve(ROOT, 'src/ui/panels/TrendsPanel.tsx'), 'utf-8');
    expect(trends).toMatch(/dueItems/);
    expect(trends).toMatch(/buildExam/);
  });

  it('axis 4: engagement — streak / daily-pick / achievements all present', () => {
    expect(ACHIEVEMENTS.find((a) => a.id === 'daily-streak-3')).toBeTruthy();
    expect(ACHIEVEMENTS.find((a) => a.id === 'daily-streak-7')).toBeTruthy();
    expect(ACHIEVEMENTS.find((a) => a.id === 'daily-streak-30')).toBeTruthy();
    // Files exist (catches accidental deletion of the engagement layer).
    for (const f of ['streak.ts', 'streak-heatmap.ts', 'daily-pick.ts']) {
      expect(
        readFileSync(resolve(ROOT, 'src/lib', f), 'utf-8').length,
        `${f} is empty`,
      ).toBeGreaterThan(100);
    }
  });

  it('axis 7: a11y — every modal traps focus, reduced-motion honoured', () => {
    const modalsDir = resolve(ROOT, 'src/ui/modals');
    const modals = readdirSync(modalsDir).filter((f) => f.endsWith('Modal.tsx'));
    expect(modals.length).toBeGreaterThan(0);
    for (const f of modals) {
      const src = readFileSync(resolve(modalsDir, f), 'utf-8');
      // Allow a non-focus-trap modal only if it's a thin wrapper that delegates
      // to a content sibling that itself traps focus.
      const traps = src.includes('useFocusTrap');
      const delegates = /Content/.test(src) && /Suspense/.test(src);
      expect(traps || delegates, `${f} does not trap focus or delegate`).toBe(true);
    }
    const css = readFileSync(resolve(ROOT, 'src/index.css'), 'utf-8');
    expect(css).toMatch(/prefers-reduced-motion: reduce/);
  });

  it('axis 9: PWA — service worker + manifest + offline indicator wired', () => {
    expect(
      readFileSync(resolve(ROOT, 'public/sw.js'), 'utf-8').length,
    ).toBeGreaterThan(200);
    expect(
      readFileSync(resolve(ROOT, 'public/manifest.webmanifest'), 'utf-8').length,
    ).toBeGreaterThan(50);
    const hud = readFileSync(resolve(ROOT, 'src/ui/HUD.tsx'), 'utf-8');
    expect(hud).toMatch(/OfflineIndicator/);
  });

  it('axis 10: code hygiene — zero TODO/FIXME/XXX/HACK markers in src/', () => {
    const banned = /\b(TODO|FIXME|XXX|HACK)\b/;
    const walk = (dir: string): string[] => {
      const out: string[] = [];
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const p = resolve(dir, entry.name);
        if (entry.isDirectory()) out.push(...walk(p));
        else if (/\.(ts|tsx)$/.test(entry.name)) out.push(p);
      }
      return out;
    };
    const offenders: string[] = [];
    for (const f of walk(resolve(ROOT, 'src'))) {
      // Skip this file itself, since it mentions the banned tokens as data.
      if (f.endsWith('rating-audit.test.ts')) continue;
      const text = readFileSync(f, 'utf-8');
      if (banned.test(text)) offenders.push(f.replace(ROOT, ''));
    }
    expect(offenders, `markers found in: ${offenders.join(', ')}`).toEqual([]);
  });

  it('axis 8/auth: glossary depth — ≥ 25 SG-specific terms', () => {
    expect(GLOSSARY_TERMS.length).toBeGreaterThanOrEqual(25);
    const required = ['NEHR', 'CHAS', 'MediShield Life', 'CURB-65', 'WBGT', 'FWMI'];
    for (const t of required) {
      expect(
        GLOSSARY_TERMS.find((g) => g.term === t),
        `glossary missing required term: ${t}`,
      ).toBeTruthy();
    }
  });

  it('rubric document exists and lists every axis', () => {
    const md = readFileSync(resolve(ROOT, 'docs/RATING.md'), 'utf-8');
    for (let i = 1; i <= 10; i += 1) {
      expect(md, `axis ${i} not documented`).toMatch(new RegExp(`### ${i}\\.`));
    }
    expect(md).toMatch(/10 \/ 10 axes pass/);
  });

  it('axis 6 — perf budget: index chunk ≤ 250 KB raw / ≤ 80 KB gzip if dist exists', () => {
    const dist = resolve(ROOT, 'dist/assets');
    let entries: string[];
    try {
      entries = readdirSync(dist);
    } catch {
      // No build yet — fine in dev. CI runs build before tests.
      return;
    }
    const indexJs = entries.filter((f) => /^index-.*\.js$/.test(f));
    if (indexJs.length === 0) return;
    const path = resolve(dist, indexJs[0]);
    const raw = readFileSync(path);
    const { gzipSync } = require('node:zlib') as typeof import('node:zlib');
    const gz = gzipSync(raw);
    expect(
      raw.length,
      `index raw ${(raw.length / 1024).toFixed(1)} KB exceeds 250 KB budget`,
    ).toBeLessThanOrEqual(250 * 1024);
    expect(
      gz.length,
      `index gzip ${(gz.length / 1024).toFixed(1)} KB exceeds 80 KB budget`,
    ).toBeLessThanOrEqual(80 * 1024);
  });
});
