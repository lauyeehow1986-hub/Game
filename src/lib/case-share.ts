import type { CaseDefinition, DecisionLogEntry } from './types';
import { serialiseCase, validateCase } from './case-schema';
import { validateCurriculum, type CurriculumBundle } from './curriculum-schema';

export interface RunSnapshot {
  caseId: string;
  log: DecisionLogEntry[];
  elapsedGameMin: number;
  totalCostSGD: number;
  /** Optional caregiver-burden snapshot. */
  burden?: {
    timeOffWorkHours: number;
    financialWorry: number;
    sleepDebt: number;
  };
  /** Patient profile summary for replay context. */
  profile?: {
    name: string;
    wardClass: string;
    chasTier: string;
    hasIntegratedShield: boolean;
  };
  /** Ordered node ids the patient visited. Lets reviewers see the same
   *  clinical narrative the original player saw, not just the decisions. */
  journey?: string[];
}

/**
 * Pack/unpack a case to/from a base64url string for URL sharing via
 * ?case=... — kept short by skipping pretty-printing.
 */

// btoa / atob exist in Node ≥ 16 and every modern browser; no need to gate.
function utf8ToBase64Url(s: string): string {
  const bytes = new TextEncoder().encode(s);
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  const b64 = btoa(bin);
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlToUtf8(s: string): string {
  const padded = s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4);
  const bin = atob(padded);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

export function encodeCaseToUrl(c: CaseDefinition, base?: string): string {
  const json = JSON.stringify(c);
  const b64 = utf8ToBase64Url(json);
  const origin = base ?? (typeof window !== 'undefined' ? window.location.origin + window.location.pathname : '');
  return `${origin}?case=${b64}`;
}

export function tryDecodeCaseFromHref(href: string): CaseDefinition | null {
  try {
    const url = new URL(href);
    const q = url.searchParams.get('case');
    if (!q) return null;
    const json = base64UrlToUtf8(q);
    const parsed = JSON.parse(json);
    const v = validateCase(parsed);
    return v.ok ? v.case : null;
  } catch {
    return null;
  }
}

export function encodeRunToUrl(run: RunSnapshot, base?: string): string {
  const json = JSON.stringify(run);
  const b64 = utf8ToBase64Url(json);
  const origin =
    base ?? (typeof window !== 'undefined' ? window.location.origin + window.location.pathname : '');
  return `${origin}?run=${b64}`;
}

export function tryDecodeRunFromHref(href: string): RunSnapshot | null {
  try {
    const url = new URL(href);
    const q = url.searchParams.get('run');
    if (!q) return null;
    const json = base64UrlToUtf8(q);
    const parsed = JSON.parse(json);
    if (typeof parsed !== 'object' || parsed === null) return null;
    if (typeof parsed.caseId !== 'string' || !Array.isArray(parsed.log)) return null;
    // Defensive shape check on optional nested fields — a malicious URL can
    // serve any JSON shape; downstream UI must not see surprises.
    if (parsed.journey !== undefined) {
      if (!Array.isArray(parsed.journey) || !parsed.journey.every((x: unknown) => typeof x === 'string')) {
        return null;
      }
    }
    if (parsed.burden !== undefined) {
      const b = parsed.burden;
      if (
        typeof b !== 'object' || b === null ||
        typeof b.timeOffWorkHours !== 'number' ||
        typeof b.financialWorry !== 'number' ||
        typeof b.sleepDebt !== 'number'
      ) return null;
    }
    if (parsed.profile !== undefined) {
      const p = parsed.profile;
      if (
        typeof p !== 'object' || p === null ||
        typeof p.name !== 'string' ||
        typeof p.wardClass !== 'string' ||
        typeof p.chasTier !== 'string' ||
        typeof p.hasIntegratedShield !== 'boolean'
      ) return null;
    }
    return parsed as RunSnapshot;
  } catch {
    return null;
  }
}

export function encodeCurriculumToUrl(b: CurriculumBundle, base?: string): string {
  const json = JSON.stringify(b);
  const b64 = utf8ToBase64Url(json);
  const origin =
    base ?? (typeof window !== 'undefined' ? window.location.origin + window.location.pathname : '');
  return `${origin}?curr=${b64}`;
}

export function tryDecodeCurriculumFromHref(href: string): CurriculumBundle | null {
  try {
    const url = new URL(href);
    const q = url.searchParams.get('curr');
    if (!q) return null;
    const json = base64UrlToUtf8(q);
    const parsed = JSON.parse(json);
    const v = validateCurriculum(parsed);
    return v.ok ? v.bundle : null;
  } catch {
    return null;
  }
}

export function downloadCurriculumJson(b: CurriculumBundle): void {
  if (typeof document === 'undefined') return;
  const blob = new Blob([JSON.stringify(b, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${b.id}.curriculum.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Trigger a browser file download of the case as JSON.
 */
export function downloadCaseJson(c: CaseDefinition): void {
  if (typeof document === 'undefined') return;
  const blob = new Blob([serialiseCase(c)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${c.id}.case.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
