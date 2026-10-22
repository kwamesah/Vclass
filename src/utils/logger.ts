/**
 * Global App Diagnostic Logger
 * Captures React errors, window error events, unhandled promise rejections,
 * and media device permission events with exact component stacks and timestamps.
 */

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  source: string; // e.g. 'VClassStudio', 'MediaDevices', 'WindowError', 'UnhandledRejection', 'ReactBoundary'
  message: string;
  details?: string | Record<string, any>;
  stack?: string;
  componentStack?: string;
}

const LOG_STORAGE_KEY = 'salem_diagnostic_logs_v1';
const MAX_LOG_ENTRIES = 100;

class DiagnosticLogger {
  private logs: LogEntry[] = [];
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.loadLogs();
    this.setupGlobalListeners();
  }

  private loadLogs() {
    try {
      const saved = localStorage.getItem(LOG_STORAGE_KEY);
      if (saved) {
        this.logs = JSON.parse(saved);
      }
    } catch {
      this.logs = [];
    }
  }

  private saveLogs() {
    try {
      localStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(this.logs.slice(-MAX_LOG_ENTRIES)));
    } catch {
      // LocalStorage full or blocked
    }
  }

  private setupGlobalListeners() {
    if (typeof window === 'undefined') return;

    // 1. Capture uncaught script errors (window.onerror)
    window.addEventListener('error', (event) => {
      this.log('error', 'WindowError', event.message || 'Uncaught runtime error', {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        errorName: event.error?.name,
      }, event.error?.stack);
    });

    // 2. Capture unhandled Promise rejections (window.onunhandledrejection)
    window.addEventListener('unhandledrejection', (event) => {
      const reason = event.reason;
      const message =
        typeof reason === 'string'
          ? reason
          : reason?.message || reason?.name || 'Unhandled Promise Rejection';
      
      this.log('error', 'UnhandledRejection', message, {
        reasonType: typeof reason,
        reasonObj: typeof reason === 'object' ? JSON.stringify(reason) : reason,
      }, reason?.stack);
    });
  }

  public log(
    level: 'info' | 'warn' | 'error',
    source: string,
    message: string,
    details?: any,
    stack?: string,
    componentStack?: string
  ) {
    const entry: LogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      level,
      source,
      message,
      details: typeof details === 'object' ? details : details ? String(details) : undefined,
      stack,
      componentStack,
    };

    this.logs.push(entry);
    if (this.logs.length > MAX_LOG_ENTRIES) {
      this.logs.shift();
    }

    this.saveLogs();
    this.notifyListeners();

    // Also output formatted message to browser dev console for developers
    const consolePrefix = `[SalemDiag][${source}]`;
    if (level === 'error') {
      console.error(consolePrefix, message, details || '', stack || '');
    } else if (level === 'warn') {
      console.warn(consolePrefix, message, details || '');
    } else {
      console.log(consolePrefix, message, details || '');
    }
  }

  public getLogs(): LogEntry[] {
    return [...this.logs];
  }

  public clearLogs() {
    this.logs = [];
    localStorage.removeItem(LOG_STORAGE_KEY);
    this.notifyListeners();
  }

  public subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners() {
    this.listeners.forEach((fn) => {
      try {
        fn();
      } catch {}
    });
  }

  public exportDiagnosticReport() {
    const report = {
      appName: 'Salem Montessori Virtual School',
      exportedAt: new Date().toISOString(),
      environment: {
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
        platform: typeof navigator !== 'undefined' ? navigator.platform : 'unknown',
        screen: typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : 'unknown',
        mediaDevicesAvailable: typeof navigator !== 'undefined' && Boolean(navigator.mediaDevices?.getUserMedia),
      },
      logCount: this.logs.length,
      logs: this.logs,
    };

    return JSON.stringify(report, null, 2);
  }
}

export const logger = new DiagnosticLogger();
