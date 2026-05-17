import { useEffect, useRef } from 'react';

/**
 * Trap keyboard focus inside the returned ref while `active` is true.
 *
 * On mount: remember the previously-focused element, move focus into the
 * container (preferring the element marked `data-autofocus`, falling back
 * to the first focusable child). On unmount: return focus to whoever had
 * it before. Tab / Shift+Tab cycle inside the container.
 *
 * Lets every modal share one consistent keyboard contract without each
 * one rolling its own listener.
 */
export function useFocusTrap<T extends HTMLElement>(active: boolean) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    if (!active) return;
    const node = ref.current;
    if (!node || typeof document === 'undefined') return;

    const previouslyFocused = document.activeElement as HTMLElement | null;

    const focusFirst = () => {
      const auto = node.querySelector<HTMLElement>('[data-autofocus]');
      if (auto) {
        auto.focus();
        return;
      }
      const focusables = focusableChildren(node);
      if (focusables.length > 0) focusables[0].focus();
      else node.focus();
    };
    focusFirst();

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const focusables = focusableChildren(node);
      if (focusables.length === 0) {
        e.preventDefault();
        return;
      }
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement as HTMLElement | null;
      if (e.shiftKey) {
        if (active === first || !node.contains(active)) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (active === last || !node.contains(active)) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      previouslyFocused?.focus?.();
    };
  }, [active]);

  return ref;
}

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), [tabindex]:not([tabindex="-1"]), details > summary';

function focusableChildren(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (el) => !el.hasAttribute('disabled') && el.offsetParent !== null,
  );
}
