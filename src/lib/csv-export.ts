import type { CaseDefinition, DecisionLogEntry, RunHistoryEntry } from './types';

/**
 * Pure CSV generator for the player's runHistory. One row per recorded
 * decision; each row carries the case + decision + the picked option's
 * weighted score so an educator can pivot the file in any spreadsheet.
 *
 * Pre-v16 history entries (no decision log) emit a single summary row
 * with the case-total score so they aren't silently lost.
 */
export function exportRunHistoryCsv(
  runHistory: Record<string, RunHistoryEntry[]>,
  catalogue: CaseDefinition[],
  resolveText: (v: unknown) => string,
): string {
  const rows: string[][] = [
    [
      'caseId',
      'caseTitle',
      'category',
      'runAt',
      'runScore',
      'runMax',
      'decisionId',
      'decisionPrompt',
      'optionId',
      'optionLabel',
      'scoreEarned',
      'maxScore',
    ],
  ];

  for (const [caseId, entries] of Object.entries(runHistory)) {
    const c = catalogue.find((x) => x.id === caseId);
    const title = c ? resolveText(c.title) : caseId;
    const category = c?.category ?? '';
    for (const entry of entries) {
      const runAt = new Date(entry.at).toISOString();
      if (!entry.log || entry.log.length === 0) {
        rows.push([
          caseId,
          title,
          category,
          runAt,
          String(entry.score),
          String(entry.max),
          '',
          '',
          '',
          '',
          '',
          '',
        ]);
        continue;
      }
      for (const e of entry.log as DecisionLogEntry[]) {
        const node = c?.pathway.find((n) => n.decision?.id === e.decisionId);
        const prompt = node?.decision ? resolveText(node.decision.prompt) : e.decisionId;
        const option = node?.decision?.options.find((o) => o.id === e.optionId);
        const label = option ? resolveText(option.label) : e.optionId;
        rows.push([
          caseId,
          title,
          category,
          runAt,
          String(entry.score),
          String(entry.max),
          e.decisionId,
          prompt,
          e.optionId,
          label,
          String(e.scoreEarned),
          String(e.maxScore),
        ]);
      }
    }
  }

  return rows.map((r) => r.map(csvEscape).join(',')).join('\n');
}

/**
 * RFC 4180-ish escape: wrap in quotes if the value contains a comma,
 * quote, or newline; double up embedded quotes.
 */
function csvEscape(value: string): string {
  if (/[",\n\r]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}
