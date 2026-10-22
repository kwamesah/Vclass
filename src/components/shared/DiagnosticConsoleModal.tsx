import React, { useState, useEffect } from 'react';
import { logger, LogEntry } from '../../utils/logger';
import {
  Bug,
  X,
  Trash2,
  Copy,
  Check,
  Download,
  ShieldCheck,
  Activity,
  Terminal,
} from 'lucide-react';

export const DiagnosticConsoleModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filterLevel, setFilterLevel] = useState<'all' | 'error' | 'warn' | 'info'>('all');
  const [filterSource, setFilterSource] = useState<string>('all');
  const [copied, setCopied] = useState<boolean>(false);
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);

  useEffect(() => {
    setLogs(logger.getLogs());
    const unsubscribe = logger.subscribe(() => {
      setLogs(logger.getLogs());
    });
    return () => {
      unsubscribe();
    };
  }, []);

  if (!isOpen) return null;

  const sources = Array.from(new Set(logs.map((l) => l.source)));

  const filteredLogs = logs.filter((l) => {
    if (filterLevel !== 'all' && l.level !== filterLevel) return false;
    if (filterSource !== 'all' && l.source !== filterSource) return false;
    return true;
  });

  const handleCopyReport = () => {
    const reportStr = logger.exportDiagnosticReport();
    navigator.clipboard?.writeText(reportStr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadReport = () => {
    const reportStr = logger.exportDiagnosticReport();
    const blob = new Blob([reportStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Salem_Diagnostic_Report_${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSimulateTestError = () => {
    try {
      throw new Error('Test Error triggered from Diagnostic Console to verify error detection.');
    } catch (e: any) {
      logger.log('error', 'ConsoleTest', e.message, { testUser: 'Developer' }, e.stack);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 font-sans select-none">
      <div className="bg-slate-900 text-slate-100 rounded-2xl max-w-4xl w-full border border-slate-800 shadow-2xl overflow-hidden flex flex-col h-[85vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold">
              <Bug className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>System Error &amp; Diagnostic Console</span>
                <span className="text-[10px] bg-blue-950 text-blue-300 border border-blue-800 px-2 py-0.5 rounded font-mono">
                  {logs.length} Logs Logged
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Real-time exception tracking, media device permission audits, and React component stack traces.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filters & Actions Bar */}
        <div className="p-3 bg-slate-950/60 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs shrink-0">
          <div className="flex items-center gap-2 overflow-x-auto">
            {/* Level Filter */}
            <div className="flex items-center bg-slate-900 p-0.5 rounded-lg border border-slate-800">
              <button
                type="button"
                onClick={() => setFilterLevel('all')}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold cursor-pointer ${
                  filterLevel === 'all' ? 'bg-blue-900 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                All ({logs.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterLevel('error')}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold cursor-pointer ${
                  filterLevel === 'error' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Errors ({logs.filter((l) => l.level === 'error').length})
              </button>
              <button
                type="button"
                onClick={() => setFilterLevel('warn')}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold cursor-pointer ${
                  filterLevel === 'warn' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Warnings ({logs.filter((l) => l.level === 'warn').length})
              </button>
            </div>

            {/* Source Filter */}
            {sources.length > 0 && (
              <select
                value={filterSource}
                onChange={(e) => setFilterSource(e.target.value)}
                className="bg-slate-900 text-slate-200 text-[11px] px-2.5 py-1 rounded-lg border border-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
              >
                <option value="all">All Sources</option>
                {sources.map((src) => (
                  <option key={src} value={src}>
                    {src}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={handleSimulateTestError}
              className="px-2.5 py-1 bg-purple-950/80 hover:bg-purple-900 border border-purple-800 text-purple-300 rounded-lg text-[11px] font-bold cursor-pointer transition-colors"
              title="Trigger a test error entry to verify diagnostic logging"
            >
              Test Error Log
            </button>

            <button
              type="button"
              onClick={handleCopyReport}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-blue-400" />}
              <span>{copied ? 'Copied' : 'Copy Report'}</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadReport}
              className="px-2.5 py-1 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>JSON</span>
            </button>

            <button
              type="button"
              onClick={() => logger.clearLogs()}
              className="p-1 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded cursor-pointer transition-colors"
              title="Clear All Logs"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Logs List & Inspector Split View */}
        <div className="flex-1 min-h-0 flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-slate-800 overflow-hidden">
          {/* Left: Log Stream */}
          <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-2">
            {filteredLogs.length === 0 ? (
              <div className="text-center py-16 space-y-2 text-slate-500 text-xs">
                <ShieldCheck className="w-10 h-10 text-emerald-500 mx-auto" />
                <p className="font-bold text-slate-300">No diagnostic error logs found</p>
                <p className="text-[11px]">System is healthy or logs match current filters.</p>
              </div>
            ) : (
              filteredLogs.slice().reverse().map((entry) => {
                const isSelected = selectedLog?.id === entry.id;
                const isError = entry.level === 'error';
                const isWarn = entry.level === 'warn';

                return (
                  <div
                    key={entry.id}
                    onClick={() => setSelectedLog(entry)}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-blue-950/80 border-blue-500 shadow-md ring-1 ring-blue-500'
                        : isError
                        ? 'bg-rose-950/30 border-rose-900/60 hover:bg-rose-950/50'
                        : isWarn
                        ? 'bg-amber-950/20 border-amber-900/40 hover:bg-amber-950/40'
                        : 'bg-slate-950/60 border-slate-800 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-1.5 py-0.2 rounded font-bold text-[9px] uppercase ${
                            isError
                              ? 'bg-rose-600 text-white'
                              : isWarn
                              ? 'bg-amber-500 text-slate-950'
                              : 'bg-blue-900 text-blue-200'
                          }`}
                        >
                          {entry.level}
                        </span>

                        <span className="font-bold text-white text-[11px] font-mono">
                          {entry.source}
                        </span>
                      </div>

                      <span className="text-[9px] text-slate-500 font-mono">
                        {new Date(entry.timestamp).toLocaleTimeString()}
                      </span>
                    </div>

                    <p className="font-mono text-[11px] text-slate-200 line-clamp-2 leading-relaxed">
                      {entry.message}
                    </p>
                  </div>
                );
              })
            )}
          </div>

          {/* Right: Detailed Inspector Panel */}
          <div className="w-full md:w-96 shrink-0 bg-slate-950/90 p-4 overflow-y-auto space-y-3 text-xs border-t md:border-t-0 border-slate-800">
            {selectedLog ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="font-bold text-white text-xs flex items-center gap-1.5">
                    <Terminal className="w-4 h-4 text-amber-400" /> Log Inspector
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedLog(null)}
                    className="text-slate-400 hover:text-white text-xs cursor-pointer"
                  >
                    Close
                  </button>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 font-semibold uppercase">Source Component:</label>
                  <p className="font-mono text-xs text-blue-300 font-bold mt-0.5">{selectedLog.source}</p>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 font-semibold uppercase">Message:</label>
                  <p className="font-mono text-xs text-rose-300 font-bold mt-0.5 break-words">{selectedLog.message}</p>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 font-semibold uppercase">Timestamp:</label>
                  <p className="font-mono text-[11px] text-slate-300 mt-0.5">{selectedLog.timestamp}</p>
                </div>

                {selectedLog.details && (
                  <div>
                    <label className="text-[10px] text-slate-400 font-semibold uppercase">Additional Details:</label>
                    <pre className="p-2.5 bg-black border border-slate-800 rounded-lg font-mono text-[10px] text-emerald-300 overflow-auto whitespace-pre-wrap mt-1">
                      {typeof selectedLog.details === 'object'
                        ? JSON.stringify(selectedLog.details, null, 2)
                        : selectedLog.details}
                    </pre>
                  </div>
                )}

                {selectedLog.componentStack && (
                  <div>
                    <label className="text-[10px] text-slate-400 font-semibold uppercase">React Component Stack:</label>
                    <pre className="p-2.5 bg-black border border-slate-800 rounded-lg font-mono text-[10px] text-amber-300 overflow-auto max-h-40 whitespace-pre-wrap mt-1">
                      {selectedLog.componentStack.trim()}
                    </pre>
                  </div>
                )}

                {selectedLog.stack && (
                  <div>
                    <label className="text-[10px] text-slate-400 font-semibold uppercase">Error Stack Trace:</label>
                    <pre className="p-2.5 bg-black border border-slate-800 rounded-lg font-mono text-[10px] text-slate-300 overflow-auto max-h-40 whitespace-pre-wrap mt-1">
                      {selectedLog.stack.trim()}
                    </pre>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500 space-y-2">
                <Activity className="w-8 h-8 text-slate-700 mx-auto" />
                <p className="font-semibold text-slate-400 text-xs">Select any log entry to inspect full stack trace and source location.</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-[11px] text-slate-400 shrink-0">
          <span>Salem Montessori Error Detection Framework</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-semibold cursor-pointer"
          >
            Close Console
          </button>
        </div>
      </div>
    </div>
  );
};
