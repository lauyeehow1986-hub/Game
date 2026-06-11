// Ad-hoc per-case locale coverage report (dev tool, run with vite-node).
import { listCases } from '../src/content/index.ts';
import { caseLocaleStats, contentCoverage } from '../src/lib/case-locale-coverage.ts';

const locales = ['zh', 'ms', 'ta'];
const cases = listCases();
for (const loc of locales) {
  const cov = contentCoverage(cases, loc);
  console.log(`\n=== ${loc} — cases ${cov.localisedCases}/${cov.cases}, strings ${(cov.stringRatio * 100).toFixed(1)}% ===`);
  for (const c of cases) {
    const s = caseLocaleStats(c, loc);
    if (s.localised < s.total) {
      console.log(`  ${c.id}: ${s.localised}/${s.total}`);
    }
  }
}
