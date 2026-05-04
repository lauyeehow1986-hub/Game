/**
 * Cross-layer event bus shared between Phaser scenes and React UI.
 * Phaser emits domain events ("patient-arrived"); React subscribes and
 * dispatches into zustand stores.
 */
type Handler = (payload: unknown) => void;

class TinyEmitter {
  private handlers = new Map<string, Set<Handler>>();

  on(event: string, fn: Handler): () => void {
    if (!this.handlers.has(event)) this.handlers.set(event, new Set());
    this.handlers.get(event)!.add(fn);
    return () => this.off(event, fn);
  }

  off(event: string, fn: Handler): void {
    this.handlers.get(event)?.delete(fn);
  }

  emit(event: string, payload?: unknown): void {
    this.handlers.get(event)?.forEach((fn) => fn(payload));
  }
}

export const bus = new TinyEmitter();

export const Events = {
  CaseStart: 'case:start',
  CaseAdvance: 'case:advance',
  CaseDecisionRequested: 'case:decision-requested',
  CaseDecisionResolved: 'case:decision-resolved',
  CaseCompleted: 'case:completed',
  CaseReset: 'case:reset',
  PatientMoveTo: 'patient:move-to',
  PatientArrived: 'patient:arrived',
  FacilityChanged: 'facility:changed',
  TimeAdvance: 'time:advance',
} as const;

export type EventName = (typeof Events)[keyof typeof Events];
