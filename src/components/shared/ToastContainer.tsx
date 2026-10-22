import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-2 sm:px-0">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto p-4 rounded-xl border shadow-xl flex items-start gap-3 transition-all animate-in slide-in-from-top-3 fade-in duration-300 bg-white/95 backdrop-blur-md ${
            toast.type === 'success'
              ? 'border-emerald-200 text-emerald-950'
              : toast.type === 'alert'
              ? 'border-rose-200 text-rose-950'
              : 'border-blue-200 text-blue-950'
          }`}
        >
          <div className="shrink-0 mt-0.5">
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            ) : toast.type === 'alert' ? (
              <AlertCircle className="w-5 h-5 text-rose-600" />
            ) : (
              <Info className="w-5 h-5 text-blue-600" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold font-heading leading-tight">{toast.title}</h4>
            <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">{toast.message}</p>
          </div>

          <button
            onClick={() => dismissToast(toast.id)}
            className="shrink-0 text-slate-400 hover:text-slate-700 p-0.5 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
