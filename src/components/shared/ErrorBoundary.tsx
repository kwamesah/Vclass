import React, { Component, ErrorInfo, ReactNode } from 'react';
import { logger } from '../../utils/logger';
import { AlertTriangle, RefreshCw, Copy, Check, FileText, Bug } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackName?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  copied: boolean;
  showDetails: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    copied: false,
    showDetails: false,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });

    // Log to global logger with source location and component stack
    logger.log(
      'error',
      `ReactBoundary:${this.props.fallbackName || 'App'}`,
      error.message || 'React component render crash',
      { errorName: error.name },
      error.stack,
      errorInfo.componentStack || undefined
    );
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      copied: false,
    });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  private handleCopyDiagnostics = () => {
    const report = {
      timestamp: new Date().toISOString(),
      fallbackName: this.props.fallbackName || 'MainApp',
      errorName: this.state.error?.name,
      errorMessage: this.state.error?.message,
      errorStack: this.state.error?.stack,
      componentStack: this.state.errorInfo?.componentStack,
      fullDiagnosticLogs: logger.getLogs(),
    };

    navigator.clipboard?.writeText(JSON.stringify(report, null, 2));
    this.setState({ copied: true });
    setTimeout(() => this.setState({ copied: false }), 2500);
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[360px] w-full p-6 bg-slate-950 text-white rounded-2xl border border-rose-900/60 shadow-2xl flex flex-col justify-between my-4 font-sans select-none">
          <div className="space-y-4">
            {/* Header Badge */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-950 border border-rose-800 flex items-center justify-center text-rose-400 shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white flex items-center gap-2">
                    <span>Component Error Intercepted</span>
                    <span className="text-[10px] bg-rose-950 text-rose-300 border border-rose-800 px-2 py-0.5 rounded font-mono">
                      {this.props.fallbackName || 'Component'}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Our diagnostic error boundary caught a runtime exception. The rest of your application remains safe.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => this.setState({ showDetails: !this.state.showDetails })}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Bug className="w-3.5 h-3.5 text-amber-400" />
                <span>{this.state.showDetails ? 'Hide Stack' : 'Show Stack'}</span>
              </button>
            </div>

            {/* Error Summary */}
            <div className="p-4 bg-slate-900/90 rounded-xl border border-rose-900/40 text-xs space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="font-semibold text-rose-400 uppercase tracking-wider text-[10px]">
                  Error Message
                </span>
                <span className="font-mono text-[10px]">
                  {this.state.error?.name || 'Error'}
                </span>
              </div>
              <p className="font-mono text-xs font-bold text-rose-200 break-words">
                {this.state.error?.message || 'An unexpected rendering error occurred.'}
              </p>
            </div>

            {/* Collapsible Stack Trace & Component Location Details */}
            {this.state.showDetails && (
              <div className="space-y-3 pt-2 text-xs">
                {this.state.errorInfo?.componentStack && (
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                      Component Location Stack Trace:
                    </label>
                    <pre className="p-3 bg-black/90 border border-slate-800 rounded-xl font-mono text-[11px] text-amber-300/90 overflow-auto max-h-40 whitespace-pre-wrap">
                      {this.state.errorInfo.componentStack.trim()}
                    </pre>
                  </div>
                )}

                {this.state.error?.stack && (
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                      JavaScript Error Stack Trace:
                    </label>
                    <pre className="p-3 bg-black/90 border border-slate-800 rounded-xl font-mono text-[11px] text-slate-300 overflow-auto max-h-36 whitespace-pre-wrap">
                      {this.state.error.stack.trim()}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <span className="text-[11px] text-slate-400">
              Salem Diagnostic Tracker • Global Error Detection Active
            </span>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={this.handleCopyDiagnostics}
                className="flex-1 sm:flex-initial px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                {this.state.copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-300">Report Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-blue-400" />
                    <span>Copy Diagnostic Report</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={this.handleReset}
                className="flex-1 sm:flex-initial px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-lg transition-transform active:scale-95"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reset Component</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
