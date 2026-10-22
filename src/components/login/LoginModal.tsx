import React from 'react';
import { useApp } from '../../context/AppContext';
import { X, Video } from 'lucide-react';
import { Login } from './Login';

export const LoginModal: React.FC = () => {
  const { showLoginModal, setShowLoginModal } = useApp();

  if (!showLoginModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Dimmed Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity"
        onClick={() => setShowLoginModal(false)}
        aria-hidden="true"
      />

      {/* Modal Dialog Card */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-login-title"
        className="relative z-50 w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-left my-auto animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Modal Top Bar */}
        <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <Video className="w-3.5 h-3.5" />
            </div>
            <span id="modal-login-title" className="text-xs font-bold text-white tracking-wide">
              Salem VClass Portal Sign In
            </span>
          </div>

          <button
            type="button"
            onClick={() => setShowLoginModal(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close login dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Embedded Full Credentials Form */}
        <div className="max-h-[85vh] overflow-y-auto">
          <Login />
        </div>
      </div>
    </div>
  );
};
