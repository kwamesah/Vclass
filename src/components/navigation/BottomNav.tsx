import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Home,
  BookOpen,
  Video,
  CheckSquare,
  Menu,
  X,
  Shapes,
  Library,
  BrainCircuit,
  GraduationCap,
  BarChart3,
  Award,
  Bell,
  UserCheck,
  User,
  LogOut,
  ChevronRight,
  Sparkles,
  Building,
  Calendar,
} from 'lucide-react';

export const BottomNav: React.FC = () => {
  const {
    activeNav,
    setActiveNav,
    isPublicWebsite,
    currentUser,
    currentRole,
    announcements,
    logoutToWebsite,
  } = useApp();

  const [showMoreSheet, setShowMoreSheet] = useState<boolean>(false);

  if (isPublicWebsite || !currentUser) return null;

  const handleSelectNav = (id: string) => {
    setActiveNav(id);
    setShowMoreSheet(false);
  };

  return (
    <>
      {/* 1. Mobile Bottom Bar */}
      <nav
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 py-2 flex items-center justify-around shadow-lg"
      >
        <button
          type="button"
          onClick={() => handleSelectNav('dashboard')}
          className={`flex flex-col items-center gap-1 text-[11px] font-semibold transition-colors min-w-[56px] py-1 cursor-pointer ${
            activeNav === 'dashboard' ? 'text-blue-900' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Home className="w-5 h-5" />
          <span>Home</span>
        </button>

        <button
          type="button"
          onClick={() => handleSelectNav('courses')}
          className={`flex flex-col items-center gap-1 text-[11px] font-semibold transition-colors min-w-[56px] py-1 cursor-pointer ${
            activeNav === 'courses' ? 'text-blue-900' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <BookOpen className="w-5 h-5" />
          <span>Courses</span>
        </button>

        {/* Center Live VClass Stage Button with Elevated Glow */}
        <button
          type="button"
          onClick={() => handleSelectNav('vclass')}
          className={`flex flex-col items-center gap-1 text-[11px] font-bold transition-transform active:scale-95 cursor-pointer relative -mt-3`}
        >
          <div className="w-12 h-12 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-lg shadow-rose-600/30 ring-4 ring-white">
            <Video className="w-6 h-6" />
            <span className="absolute top-0 right-1 w-3 h-3 bg-white rounded-full flex items-center justify-center">
              <span className="w-2 h-2 bg-rose-600 rounded-full animate-ping" />
            </span>
          </div>
          <span className="text-rose-600 font-extrabold text-[10px] mt-0.5">VClass</span>
        </button>

        <button
          type="button"
          onClick={() => handleSelectNav('assignments')}
          className={`flex flex-col items-center gap-1 text-[11px] font-semibold transition-colors min-w-[56px] py-1 cursor-pointer ${
            activeNav === 'assignments' ? 'text-blue-900' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <CheckSquare className="w-5 h-5" />
          <span>Tasks</span>
        </button>

        {/* More Sub-Menu Drawer Trigger */}
        <button
          type="button"
          onClick={() => setShowMoreSheet(true)}
          className={`flex flex-col items-center gap-1 text-[11px] font-semibold transition-colors min-w-[56px] py-1 cursor-pointer relative ${
            showMoreSheet ? 'text-blue-900' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className="relative">
            <Menu className="w-5 h-5" />
            {announcements.length > 0 && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-500 rounded-full" />
            )}
          </div>
          <span>More</span>
        </button>
      </nav>

      {/* 2. Mobile More & Sub-Menus Quick Action Sheet */}
      {showMoreSheet && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setShowMoreSheet(false)}
          />

          {/* Sheet Body */}
          <div className="relative bg-white rounded-t-3xl shadow-2xl max-h-[85vh] overflow-y-auto z-50 p-5 space-y-5 animate-in slide-in-from-bottom duration-200">
            {/* Grab Handle & Close */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-900" />
                <h3 className="text-sm font-bold font-heading text-slate-900">All Modules & Sub-Menus</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowMoreSheet(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sub-menu Section 1: Academics & Learning */}
            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Learning & Practice
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleSelectNav('courses')}
                  className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-colors cursor-pointer ${
                    activeNav === 'courses' ? 'bg-blue-50 border-blue-200 text-blue-900' : 'bg-slate-50 border-slate-100 text-slate-700'
                  }`}
                >
                  <BookOpen className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold">Courses</p>
                    <p className="text-[10px] text-slate-400">Strands & slides</p>
                  </div>
                </button>

                {currentRole === 'student' && (
                  <button
                    type="button"
                    onClick={() => handleSelectNav('montessori')}
                    className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-colors cursor-pointer ${
                      activeNav === 'montessori' ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-slate-50 border-slate-100 text-slate-700'
                    }`}
                  >
                    <Shapes className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold">Montessori Lab</p>
                      <p className="text-[10px] text-slate-400">Sensory math apparatus</p>
                    </div>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleSelectNav('library')}
                  className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-colors cursor-pointer ${
                    activeNav === 'library' ? 'bg-purple-50 border-purple-200 text-purple-900' : 'bg-slate-50 border-slate-100 text-slate-700'
                  }`}
                >
                  <Library className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold">Digital Library</p>
                    <p className="text-[10px] text-slate-400">Books & notes</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectNav('quizzes')}
                  className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-colors cursor-pointer ${
                    activeNav === 'quizzes' ? 'bg-blue-50 border-blue-200 text-blue-900' : 'bg-slate-50 border-slate-100 text-slate-700'
                  }`}
                >
                  <BrainCircuit className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold">Quizzes & Tests</p>
                    <p className="text-[10px] text-slate-400">Auto-scored</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Sub-menu Section 2: Assessment & Records */}
            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Assessments & Progress
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleSelectNav('assignments')}
                  className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-colors cursor-pointer ${
                    activeNav === 'assignments' ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-slate-50 border-slate-100 text-slate-700'
                  }`}
                >
                  <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold">Assignments</p>
                    <p className="text-[10px] text-slate-400">Submit homework</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectNav('examinations')}
                  className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-colors cursor-pointer ${
                    activeNav === 'examinations' ? 'bg-blue-50 border-blue-200 text-blue-900' : 'bg-slate-50 border-slate-100 text-slate-700'
                  }`}
                >
                  <GraduationCap className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold">Examinations</p>
                    <p className="text-[10px] text-slate-400">Term papers</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectNav('results')}
                  className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-colors cursor-pointer ${
                    activeNav === 'results' ? 'bg-blue-50 border-blue-200 text-blue-900' : 'bg-slate-50 border-slate-100 text-slate-700'
                  }`}
                >
                  <BarChart3 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold">My Results</p>
                    <p className="text-[10px] text-slate-400">Gradebook report</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectNav('attendance')}
                  className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-colors cursor-pointer ${
                    activeNav === 'attendance' ? 'bg-blue-50 border-blue-200 text-blue-900' : 'bg-slate-50 border-slate-100 text-slate-700'
                  }`}
                >
                  <UserCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold">Attendance</p>
                    <p className="text-[10px] text-slate-400">Daily presence</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Sub-menu Section 3: School Community & Profile */}
            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Community & Schedule
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleSelectNav('classes')}
                  className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-colors cursor-pointer ${
                    activeNav === 'classes' ? 'bg-blue-50 border-blue-200 text-blue-900' : 'bg-slate-50 border-slate-100 text-slate-700'
                  }`}
                >
                  <Building className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold">Classes & Rooms</p>
                    <p className="text-[10px] text-slate-400">Classrooms & roster</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectNav('timetable')}
                  className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-colors cursor-pointer ${
                    activeNav === 'timetable' ? 'bg-blue-50 border-blue-200 text-blue-900' : 'bg-slate-50 border-slate-100 text-slate-700'
                  }`}
                >
                  <Calendar className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold">Timetable</p>
                    <p className="text-[10px] text-slate-400">Daily routine</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectNav('announcements')}
                  className={`p-3 rounded-xl border text-left flex items-start justify-between transition-colors cursor-pointer ${
                    activeNav === 'announcements' ? 'bg-blue-50 border-blue-200 text-blue-900' : 'bg-slate-50 border-slate-100 text-slate-700'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <Bell className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold">Notices</p>
                      <p className="text-[10px] text-slate-400">Bulletins</p>
                    </div>
                  </div>
                  {announcements.length > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-slate-200 text-[10px] font-bold text-slate-700">
                      {announcements.length}
                    </span>
                  )}
                </button>

                {currentRole === 'student' && (
                  <button
                    type="button"
                    onClick={() => handleSelectNav('badges')}
                    className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-colors cursor-pointer ${
                      activeNav === 'badges' ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-slate-50 border-slate-100 text-slate-700'
                    }`}
                  >
                    <Award className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold">Badges</p>
                      <p className="text-[10px] text-slate-400">Achievements</p>
                    </div>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleSelectNav('profile')}
                  className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-colors cursor-pointer ${
                    activeNav === 'profile' ? 'bg-blue-50 border-blue-200 text-blue-900' : 'bg-slate-50 border-slate-100 text-slate-700'
                  }`}
                >
                  <User className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold">Profile</p>
                    <p className="text-[10px] text-slate-400">Settings</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowMoreSheet(false);
                    logoutToWebsite();
                  }}
                  className="p-3 rounded-xl border border-rose-100 bg-rose-50 text-rose-700 text-left flex items-start gap-2.5 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold">Sign Out</p>
                    <p className="text-[10px] text-rose-500">Exit portal</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
