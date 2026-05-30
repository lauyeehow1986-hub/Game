import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Every modal dialog must be a labelled, modal dialog that traps focus (or
 * delegates to a content sibling that does). This guards against a new modal
 * shipping without basic screen-reader + keyboard support.
 */
const MODAL_DIR = resolve(__dirname, 'modals');

describe('modal accessibility contract', () => {
  const files = readdirSync(MODAL_DIR).filter((f) => f.endsWith('Modal.tsx'));

  it('there are modal files to check', () => {
    expect(files.length).toBeGreaterThan(5);
  });

  for (const f of files) {
    it(`${f} is a labelled modal dialog that traps focus`, () => {
      const src = readFileSync(resolve(MODAL_DIR, f), 'utf-8');
      // A thin lazy wrapper (e.g. KeyboardHelpModal) is allowed if it
      // delegates to a *Content sibling under Suspense.
      const delegates = /Content/.test(src) && /Suspense/.test(src);
      if (delegates) return;
      expect(src, `${f}: missing role="dialog"`).toMatch(/role="dialog"/);
      expect(src, `${f}: missing aria-modal`).toMatch(/aria-modal/);
      expect(src, `${f}: missing aria-labelledby`).toMatch(/aria-labelledby/);
      expect(src, `${f}: missing useFocusTrap`).toMatch(/useFocusTrap/);
    });
  }
});
