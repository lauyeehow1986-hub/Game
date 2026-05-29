import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * Top-level error boundary. If anything in the React tree throws — a
 * corrupted persisted store, a bad lazy chunk, a Phaser regression —
 * the user sees a recoverable fallback instead of a white screen. The
 * fallback offers Reload (last-ditch) and Reset everything (drops all
 * localStorage and reloads — useful when persisted state is the cause).
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // No telemetry — log to console so developer can inspect via DevTools.
    // eslint-disable-next-line no-console
    console.error('SG Pathway crashed:', error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="fixed inset-0 grid place-items-center bg-clinical-bg p-6">
        <div className="bg-clinical-panel border border-clinical-danger/50 rounded-lg max-w-md w-full p-6 space-y-4">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-clinical-danger font-semibold">
              Something went wrong
            </div>
            <h2 className="text-base font-semibold text-white mt-1">
              SG Pathway hit an unexpected error.
            </h2>
          </div>
          <p className="text-[12px] text-white/85 leading-relaxed">
            Your case progress is stored locally, so a reload usually recovers. If the
            error keeps coming back the persisted state may be corrupted — Reset everything
            clears every locally-stored bit on this device and reloads.
          </p>
          <details className="text-[11px] text-clinical-subtle">
            <summary className="cursor-pointer">Technical detail</summary>
            <pre className="mt-2 p-2 bg-clinical-bg border border-clinical-border rounded text-[10px] overflow-x-auto whitespace-pre-wrap">
              {String(this.state.error?.stack ?? this.state.error?.message ?? this.state.error)}
            </pre>
          </details>
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              onClick={() => {
                try {
                  localStorage.clear();
                } catch {
                  /* ignore */
                }
                location.reload();
              }}
              className="px-3 py-1.5 rounded border border-clinical-danger/50 text-clinical-danger hover:bg-clinical-danger/10 text-xs"
            >
              Reset everything
            </button>
            <button
              onClick={() => location.reload()}
              className="px-4 py-1.5 rounded bg-clinical-accent text-white text-xs font-semibold hover:brightness-110"
            >
              Reload
            </button>
          </div>
        </div>
      </div>
    );
  }
}
