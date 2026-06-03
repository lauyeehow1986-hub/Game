import { describe, expect, it } from 'vitest';
import { personalBestRef, renderPersonalBestHtml } from './personal-best-print';

describe('personal-best-print', () => {
  it('personalBestRef is stable for the same (caseId, at)', () => {
    expect(personalBestRef('case-a', 1717420000000)).toBe(personalBestRef('case-a', 1717420000000));
  });

  it('personalBestRef differs when timestamp shifts', () => {
    const a = personalBestRef('case-a', 1717420000000);
    const b = personalBestRef('case-a', 1717420000001);
    expect(a).not.toBe(b);
  });

  it('renders English HTML with the score and case title', () => {
    const html = renderPersonalBestHtml({
      caseTitle: 'Acute stroke',
      caseCategory: 'acute',
      ratioPct: 92,
      score: 27.5,
      max: 30,
      at: 1717420000000,
      ref: 'ABCDEFG',
      learnerName: 'Dr. X',
    });
    expect(html).toMatch(/Acute stroke/);
    expect(html).toMatch(/92%/);
    expect(html).toMatch(/Dr\. X/);
    expect(html).toMatch(/ABCDEFG/);
  });

  it('escapes injected HTML in user-controlled fields', () => {
    const html = renderPersonalBestHtml({
      caseTitle: '<script>evil()</script>',
      caseCategory: 'acute',
      ratioPct: 80,
      score: 8,
      max: 10,
      at: Date.now(),
      ref: 'AAA',
      learnerName: '"><img>',
    });
    expect(html).not.toMatch(/<script>evil/);
    expect(html).toMatch(/&lt;script&gt;/);
    expect(html).not.toMatch(/"><img>/);
  });

  it('renders Chinese labels when locale=zh', () => {
    const html = renderPersonalBestHtml({
      caseTitle: '急性中风',
      caseCategory: '急性',
      ratioPct: 88,
      score: 22,
      max: 25,
      at: Date.now(),
      ref: 'BBB',
      learnerName: '医生',
      locale: 'zh',
    });
    expect(html).toMatch(/个人最佳证书/);
    expect(html).toMatch(/急性中风/);
  });
});
