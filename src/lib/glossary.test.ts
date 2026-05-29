import { describe, it, expect } from 'vitest';
import { scanGlossary } from './glossary';

describe('scanGlossary', () => {
  it('returns a single text token when no terms appear', () => {
    const tokens = scanGlossary('Just a sentence.');
    expect(tokens).toEqual([{ kind: 'text', text: 'Just a sentence.' }]);
  });

  it('marks a single term with text on either side', () => {
    const tokens = scanGlossary('Records flow through NEHR overnight.');
    expect(tokens.map((t) => t.kind)).toEqual(['text', 'term', 'text']);
    const term = tokens.find((t) => t.kind === 'term');
    expect(term?.text).toBe('NEHR');
    expect(term?.def).toMatch(/National Electronic Health Record/);
  });

  it('prefers the longest match (MediShield Life over MediShield)', () => {
    const tokens = scanGlossary('MediShield Life covers inpatient.');
    expect(tokens[0].kind).toBe('term');
    expect(tokens[0].text).toBe('MediShield Life');
  });

  it('handles multiple terms in the same sentence', () => {
    const tokens = scanGlossary('NEHR, CHAS, and MediSave are local.');
    const terms = tokens.filter((t) => t.kind === 'term').map((t) => t.text);
    expect(terms).toEqual(['NEHR', 'CHAS', 'MediSave']);
  });

  it('is case-insensitive but preserves the source casing', () => {
    const tokens = scanGlossary('Check nehr quickly.');
    const term = tokens.find((t) => t.kind === 'term');
    expect(term?.text).toBe('nehr');
  });

  it('rejects matches inside a longer word', () => {
    const tokens = scanGlossary('preNEHRish'); // not a word boundary
    expect(tokens.every((t) => t.kind === 'text')).toBe(true);
  });

  it('treats punctuation as a word boundary', () => {
    const tokens = scanGlossary('NEHR, CHAS.');
    const terms = tokens.filter((t) => t.kind === 'term').map((t) => t.text);
    expect(terms).toEqual(['NEHR', 'CHAS']);
  });

  it('handles empty input', () => {
    expect(scanGlossary('')).toEqual([]);
  });

  it('handles a string that is exactly a term', () => {
    const tokens = scanGlossary('DORSCON');
    expect(tokens).toEqual([
      expect.objectContaining({ kind: 'term', text: 'DORSCON' }),
    ]);
  });

  it('recognises the v2.88 SG-specific terms', () => {
    for (const t of ['CURB-65', 'WBGT', 'FWMI', 'NAIS', 'NSF', 'RTU', 'WICA', 'MHCTA', 'SOC', 'NS1']) {
      const tokens = scanGlossary(`Discuss ${t} now.`);
      const found = tokens.find((tk) => tk.kind === 'term' && tk.text === t);
      expect(found, `expected ${t} to be in the glossary`).toBeTruthy();
      expect(found?.def).toBeTruthy();
    }
  });
});
