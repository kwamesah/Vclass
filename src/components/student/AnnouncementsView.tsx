import React from 'react';
import { useApp } from '../../context/AppContext';
import { Bell, Sparkles, AlertCircle } from 'lucide-react';

export const AnnouncementsView: React.FC = () => {
  const { announcements } = useApp();

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
          <Bell className="w-4 h-4 text-blue-900" />
          <span>Official Broadcast Board</span>
        </div>
        <h1 className="text-2xl font-bold font-heading text-slate-900">
          School Announcements &amp; Term Notices
        </h1>
        <p className="text-xs text-slate-500">
          Important academic schedules, examination dates, and PTA bulletins from Salem Montessori administration.
        </p>
      </div>

      <div className="space-y-4">
        {announcements.length > 0 ? (
          announcements.map((ann) => (
            <div
              key={ann.id}
              className={`p-6 rounded-2xl border transition-all space-y-2 ${
                ann.priority === 'urgent'
                  ? 'bg-rose-50/70 border-rose-200'
                  : 'bg-white border-slate-200 shadow-xs'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200/60">
                <div className="flex items-center gap-2">
                  {ann.priority === 'urgent' && (
                    <span className="px-2 py-0.5 rounded-sm bg-rose-600 text-white text-[10px] font-bold">
                      URGENT
                    </span>
                  )}
                  <h3 className="text-base font-bold text-slate-900">{ann.title}</h3>
                </div>
                <span className="text-xs text-slate-400">{ann.date}</span>
              </div>

              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                {ann.content}
              </p>

              <div className="flex items-center justify-between pt-2 text-[11px] text-slate-500">
                <span>Published by: <strong>{ann.author}</strong></span>
                <span className="capitalize">Target: {ann.targetAudience}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
            <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900">No Announcements Posted</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              School notices, holiday reminders, and administration bulletins will be published here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
