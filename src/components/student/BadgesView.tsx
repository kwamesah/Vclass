import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Award, Flame, Sparkles, CheckCircle2, Trophy, Star } from 'lucide-react';
import confetti from 'canvas-confetti';

export const BadgesView: React.FC = () => {
  const { currentUser, badges } = useApp();

  if (!currentUser) return null;

  const handleCelebrate = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white rounded-2xl p-6 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-200 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-100" />
            <span>Salem Montessori Gamification &amp; Milestones</span>
          </div>
          <h1 className="text-2xl font-bold font-heading">
            {currentUser.name.split(' ')[0]}'s Honors &amp; Learning Badges
          </h1>
          <p className="text-xs text-amber-100">
            Celebrating consistent inquiry, curiosity, and mastery across virtual &amp; hands-on modules.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleCelebrate}
            className="px-4 py-2.5 bg-white text-slate-900 rounded-xl text-xs font-bold shadow-xs hover:bg-amber-50 transition-transform hover:scale-105 cursor-pointer flex items-center gap-2"
          >
            <Trophy className="w-4 h-4 text-amber-600" /> Celebrate Achievements
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center text-2xl">
            🔥
          </div>
          <div>
            <p className="text-xs text-slate-500">Learning Streak</p>
            <p className="text-xl font-bold text-slate-900 tabular-nums">
              {currentUser.streakDays || 5} Consecutive Days
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center text-2xl">
            ⭐
          </div>
          <div>
            <p className="text-xs text-slate-500">Montessori Points</p>
            <p className="text-xl font-bold text-slate-900 tabular-nums">
              {currentUser.points || 580} Points Earned
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-2xl">
            🏆
          </div>
          <div>
            <p className="text-xs text-slate-500">Badges Unlocked</p>
            <p className="text-xl font-bold text-emerald-800 tabular-nums">
              {badges.filter((b) => b.unlocked).length} of {badges.length} Badges
            </p>
          </div>
        </div>
      </div>

      {/* Badges Showcase Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {badges.map((b) => (
          <div
            key={b.id}
            className={`p-6 rounded-2xl border transition-all text-center space-y-3 ${
              b.unlocked
                ? 'bg-white border-amber-300 shadow-xs'
                : 'bg-slate-50 border-slate-200 opacity-60'
            }`}
          >
            <div className="text-5xl">{b.icon}</div>
            <div>
              <h3 className="text-base font-bold text-slate-900">{b.name}</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">{b.description}</p>
            </div>
            {b.unlocked ? (
              <span className="inline-block text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                Unlocked on {b.earnedDate}
              </span>
            ) : (
              <span className="inline-block text-xs font-medium text-slate-500 bg-slate-200 px-2.5 py-1 rounded-full">
                Locked: In Progress
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
