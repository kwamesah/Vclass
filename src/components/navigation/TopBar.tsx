import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Video,
  Bell,
  LogOut,
  Sparkles,
  BookOpen,
  Trash2,
  ChevronRight,
  ChevronDown,
  Menu,
  X,
  Compass,
  Layers,
  Award,
  User,
  GraduationCap,
  Shapes,
  Library,
  FileCheck2,
  BrainCircuit,
  BarChart3,
  UserCheck,
  Bug,
  HelpCircle,
  Building,
  Building2,
  ClipboardList,
  MessageSquare,
  Sliders,
  Calendar,
  Share2,
  ExternalLink,
  Globe,
} from 'lucide-react';
import { DiagnosticConsoleModal } from '../shared/DiagnosticConsoleModal';
import { ShareVClassModal } from '../shared/ShareVClassModal';

export const TopBar: React.FC = () => {
  const {
    currentUser,
    currentRole,
    isPublicWebsite,
    setIsPublicWebsite,
    activeNav,
    setActiveNav,
    vclasses,
    setActiveVClassId,
    announcements,
    openLoginModal,
    logoutToWebsite,
    notifications,
    unreadNotificationsCount,
    markNotificationAsRead,
    clearAllNotifications,
    startTour,
    resetTourStatus,
    isTourActive,
    schoolConfig,
  } = useApp();

  const [showNotifMenu, setShowNotifMenu] = useState<boolean>(false);
  const [showTourMenu, setShowTourMenu] = useState<boolean>(false);
  const [showMobileDrawer, setShowMobileDrawer] = useState<boolean>(false);
  const [showDiagConsole, setShowDiagConsole] = useState<boolean>(false);
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [activeDropdown, setActiveDropdown] = useState<'learning' | 'assessments' | 'campus' | 'explore' | null>(null);

  const handleEnterVClassQuick = () => {
    setIsPublicWebsite(false);
    setActiveNav('vclass');
    setShowMobileDrawer(false);
    if (currentUser?.role === 'teacher') {
      const myLive = vclasses.find(
        (v) =>
          (v.teacherId === currentUser.id || v.teacherName?.toLowerCase() === currentUser.name?.toLowerCase()) &&
          (v.isLive || v.status === 'live')
      );
      const myScheduled = vclasses.find(
        (v) => v.teacherId === currentUser.id || v.teacherName?.toLowerCase() === currentUser.name?.toLowerCase()
      );
      if (myLive) {
        setActiveVClassId(myLive.id);
      } else if (myScheduled) {
        setActiveVClassId(myScheduled.id);
      }
    } else if (currentUser?.role === 'student') {
      const classLevel = currentUser.classLevel || 'B7';
      const classLive = vclasses.find(
        (v) => (v.classLevel === classLevel || v.classLevel === 'All Classes') && (v.isLive || v.status === 'live')
      );
      const classScheduled = vclasses.find(
        (v) => v.classLevel === classLevel || v.classLevel === 'All Classes'
      );
      if (classLive) {
        setActiveVClassId(classLive.id);
      } else if (classScheduled) {
        setActiveVClassId(classScheduled.id);
      }
    } else {
      const liveSession = vclasses.find((v) => v.isLive || v.status === 'live');
      if (liveSession) {
        setActiveVClassId(liveSession.id);
      } else if (vclasses[0]) {
        setActiveVClassId(vclasses[0].id);
      }
    }
  };

  const handleNavClick = (navId: string) => {
    setActiveNav(navId);
    setActiveDropdown(null);
    setShowMobileDrawer(false);
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3 sm:gap-4">
        {/* Zone 1: Single Wordmark & Mobile Drawer Trigger */}
        <div className="flex items-center gap-3">
          {/* Mobile Hamburger Button */}
          {!isPublicWebsite && currentUser && (
            <button
              type="button"
              data-tour="mobile-nav-trigger"
              onClick={() => setShowMobileDrawer(!showMobileDrawer)}
              className="md:hidden p-2 -ml-1 text-slate-700 hover:text-blue-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {showMobileDrawer ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          )}

          <button
            onClick={() => {
              if (isPublicWebsite || !currentUser) {
                setActiveNav('home');
              } else {
                setActiveNav('dashboard');
              }
            }}
            className="text-left group cursor-pointer focus:outline-hidden flex items-center gap-2"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-900 text-white flex items-center justify-center font-bold text-sm shrink-0 overflow-hidden shadow-xs">
              {schoolConfig.logoUrl ? (
                <img src={schoolConfig.logoUrl} alt={schoolConfig.shortName} className="w-full h-full object-cover" />
              ) : (
                <span>{(schoolConfig.shortName || 'SM').slice(0, 2).toUpperCase()}</span>
              )}
            </div>
            <div>
              <span className="text-base sm:text-lg font-bold font-heading tracking-tight text-slate-900 group-hover:text-blue-900 transition-colors block leading-tight">
                {schoolConfig.shortName || 'Salem VClass'}
              </span>
              <span className="text-[10px] text-slate-400 hidden sm:block leading-none truncate max-w-[200px]">
                {schoolConfig.name || 'Montessori Virtual Learning'}
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Simplified Desktop Navigation with Proper Sub-Menus */}
        <nav className="hidden md:flex items-center gap-5 text-xs font-semibold text-slate-600">
          {isPublicWebsite || !currentUser ? (
            <>
              <button
                type="button"
                onClick={() => handleNavClick('home')}
                className={`transition-colors hover:text-slate-900 cursor-pointer ${
                  activeNav === 'home' ? 'text-blue-900 font-bold' : ''
                }`}
              >
                Home
              </button>
              <button
                type="button"
                onClick={() => handleNavClick('about')}
                className={`transition-colors hover:text-slate-900 cursor-pointer ${
                  activeNav === 'about' ? 'text-blue-900 font-bold' : ''
                }`}
              >
                About Us
              </button>
              <button
                type="button"
                onClick={() => handleNavClick('academics')}
                className={`transition-colors hover:text-slate-900 cursor-pointer ${
                  activeNav === 'academics' ? 'text-blue-900 font-bold' : ''
                }`}
              >
                Academics
              </button>

              {/* Public Sub-menu */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setActiveDropdown(activeDropdown === 'explore' ? null : 'explore')}
                  className="flex items-center gap-1 transition-colors hover:text-slate-900 cursor-pointer py-1"
                >
                  <span>Campus Life</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>

                {activeDropdown === 'explore' && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setActiveDropdown(null)} />
                    <div className="absolute left-0 top-8 w-48 bg-white rounded-xl shadow-xl border border-slate-200 z-50 p-1 animate-in fade-in slide-in-from-top-1">
                      <button
                        type="button"
                        onClick={() => handleNavClick('facilities')}
                        className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-blue-900 rounded-lg flex items-center gap-2 cursor-pointer"
                      >
                        <Building2Icon className="w-3.5 h-3.5 text-slate-400" />
                        <span>Facilities & Grounds</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleNavClick('library')}
                        className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-blue-900 rounded-lg flex items-center gap-2 cursor-pointer"
                      >
                        <Library className="w-3.5 h-3.5 text-slate-400" />
                        <span>Digital Library</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <>
              {/* Primary Direct Links */}
              <button
                type="button"
                onClick={() => handleNavClick('dashboard')}
                className={`transition-colors hover:text-slate-900 cursor-pointer ${
                  activeNav === 'dashboard' ? 'text-blue-900 font-bold' : ''
                }`}
              >
                Dashboard
              </button>

              <button
                type="button"
                onClick={() => handleNavClick('vclass')}
                className={`transition-colors hover:text-slate-900 cursor-pointer flex items-center gap-1.5 ${
                  activeNav === 'vclass' ? 'text-rose-600 font-bold' : ''
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                <span>Live Studio</span>
              </button>

              {/* Sub-menu 1: Learning Hub */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setActiveDropdown(activeDropdown === 'learning' ? null : 'learning')}
                  className={`flex items-center gap-1 transition-colors hover:text-slate-900 cursor-pointer py-1 ${
                    ['courses', 'montessori', 'library'].includes(activeNav) ? 'text-blue-900 font-bold' : ''
                  }`}
                >
                  <span>Learning Hub</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>

                {activeDropdown === 'learning' && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setActiveDropdown(null)} />
                    <div className="absolute left-0 top-8 w-56 bg-white rounded-xl shadow-xl border border-slate-200 z-50 p-1.5 animate-in fade-in slide-in-from-top-1 space-y-0.5">
                      <button
                        type="button"
                        onClick={() => handleNavClick('courses')}
                        className={`w-full text-left px-3 py-2 text-xs rounded-lg flex items-center gap-2.5 cursor-pointer ${
                          activeNav === 'courses' ? 'bg-blue-50 text-blue-900 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <BookOpen className="w-4 h-4 text-blue-600" />
                        <div>
                          <p className="font-medium">Curriculum Courses</p>
                          <p className="text-[10px] text-slate-400">Strands & slide decks</p>
                        </div>
                      </button>

                      {currentRole === 'student' && (
                        <button
                          type="button"
                          onClick={() => handleNavClick('montessori')}
                          className={`w-full text-left px-3 py-2 text-xs rounded-lg flex items-center gap-2.5 cursor-pointer ${
                            activeNav === 'montessori' ? 'bg-blue-50 text-blue-900 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <Shapes className="w-4 h-4 text-amber-500" />
                          <div>
                            <p className="font-medium">Montessori Lab</p>
                            <p className="text-[10px] text-slate-400">Sensory math apparatus</p>
                          </div>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleNavClick('library')}
                        className={`w-full text-left px-3 py-2 text-xs rounded-lg flex items-center gap-2.5 cursor-pointer ${
                          activeNav === 'library' ? 'bg-blue-50 text-blue-900 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <Library className="w-4 h-4 text-purple-600" />
                        <div>
                          <p className="font-medium">Digital Library</p>
                          <p className="text-[10px] text-slate-400">E-books & lesson notes</p>
                        </div>
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Sub-menu 2: Assessments */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setActiveDropdown(activeDropdown === 'assessments' ? null : 'assessments')}
                  className={`flex items-center gap-1 transition-colors hover:text-slate-900 cursor-pointer py-1 ${
                    ['assignments', 'quizzes', 'examinations', 'results'].includes(activeNav)
                      ? 'text-blue-900 font-bold'
                      : ''
                  }`}
                >
                  <span>Assessments</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>

                {activeDropdown === 'assessments' && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setActiveDropdown(null)} />
                    <div className="absolute left-0 top-8 w-56 bg-white rounded-xl shadow-xl border border-slate-200 z-50 p-1.5 animate-in fade-in slide-in-from-top-1 space-y-0.5">
                      <button
                        type="button"
                        onClick={() => handleNavClick('assignments')}
                        className={`w-full text-left px-3 py-2 text-xs rounded-lg flex items-center gap-2.5 cursor-pointer ${
                          activeNav === 'assignments' ? 'bg-blue-50 text-blue-900 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <FileCheck2 className="w-4 h-4 text-emerald-600" />
                        <div>
                          <p className="font-medium">Assignments & Tasks</p>
                          <p className="text-[10px] text-slate-400">Homework submissions</p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleNavClick('quizzes')}
                        className={`w-full text-left px-3 py-2 text-xs rounded-lg flex items-center gap-2.5 cursor-pointer ${
                          activeNav === 'quizzes' ? 'bg-blue-50 text-blue-900 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <BrainCircuit className="w-4 h-4 text-amber-600" />
                        <div>
                          <p className="font-medium">Quizzes & Tests</p>
                          <p className="text-[10px] text-slate-400">Interactive assessments</p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleNavClick('results')}
                        className={`w-full text-left px-3 py-2 text-xs rounded-lg flex items-center gap-2.5 cursor-pointer ${
                          activeNav === 'results' ? 'bg-blue-50 text-blue-900 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <BarChart3 className="w-4 h-4 text-blue-600" />
                        <div>
                          <p className="font-medium">Performance & Gradebook</p>
                          <p className="text-[10px] text-slate-400">Reports and scores</p>
                        </div>
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Sub-menu 3: Campus & Community */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setActiveDropdown(activeDropdown === 'campus' ? null : 'campus')}
                  className={`flex items-center gap-1 transition-colors hover:text-slate-900 cursor-pointer py-1 ${
                    ['announcements', 'badges', 'attendance'].includes(activeNav) ? 'text-blue-900 font-bold' : ''
                  }`}
                >
                  <span>Campus</span>
                  {announcements.length > 0 && (
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  )}
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>

                {activeDropdown === 'campus' && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setActiveDropdown(null)} />
                    <div className="absolute left-0 top-8 w-56 bg-white rounded-xl shadow-xl border border-slate-200 z-50 p-1.5 animate-in fade-in slide-in-from-top-1 space-y-0.5">
                      <button
                        type="button"
                        onClick={() => handleNavClick('announcements')}
                        className={`w-full text-left px-3 py-2 text-xs rounded-lg flex items-center justify-between cursor-pointer ${
                          activeNav === 'announcements' ? 'bg-blue-50 text-blue-900 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Bell className="w-4 h-4 text-blue-600" />
                          <div>
                            <p className="font-medium">School Notices</p>
                            <p className="text-[10px] text-slate-400">Official bulletins</p>
                          </div>
                        </div>
                        {announcements.length > 0 && (
                          <span className="px-1.5 py-0.5 rounded-full bg-slate-100 text-[10px] font-bold text-slate-700">
                            {announcements.length}
                          </span>
                        )}
                      </button>

                      {currentRole === 'student' && (
                        <button
                          type="button"
                          onClick={() => handleNavClick('badges')}
                          className={`w-full text-left px-3 py-2 text-xs rounded-lg flex items-center gap-2.5 cursor-pointer ${
                            activeNav === 'badges' ? 'bg-blue-50 text-blue-900 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <Award className="w-4 h-4 text-amber-500" />
                          <div>
                            <p className="font-medium">Badges & Streaks</p>
                            <p className="text-[10px] text-slate-400">Merits & milestones</p>
                          </div>
                        </button>
                      )}

                      {currentRole && ['teacher', 'parent', 'admin'].includes(currentRole) && (
                        <button
                          type="button"
                          onClick={() => handleNavClick('attendance')}
                          className={`w-full text-left px-3 py-2 text-xs rounded-lg flex items-center gap-2.5 cursor-pointer ${
                            activeNav === 'attendance' ? 'bg-blue-50 text-blue-900 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <UserCheck className="w-4 h-4 text-emerald-600" />
                          <div>
                            <p className="font-medium">Class Attendance</p>
                            <p className="text-[10px] text-slate-400">Attendance register</p>
                          </div>
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </nav>

        {/* Zone 3: Primary Actions & User Status */}
        <div className="flex items-center gap-2 sm:gap-3">
          {isPublicWebsite || !currentUser ? (
            <div className="flex items-center gap-2">
              <a
                href={schoolConfig.websiteUrl || 'https://salemmontessori.edu.gh'}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden md:inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-blue-900 hover:bg-slate-100 rounded-lg transition-colors"
                title="Visit official school website"
              >
                <Globe className="w-3.5 h-3.5 text-amber-500" />
                <span>School Website</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
              <button
                type="button"
                onClick={() => setShowShareModal(true)}
                className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-blue-900 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Share VClass Link with school crest"
              >
                <Share2 className="w-3.5 h-3.5 text-amber-500" />
                <span className="hidden sm:inline">Share</span>
              </button>
              <button
                type="button"
                onClick={() => startTour('guest')}
                className="hidden lg:inline-flex px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-blue-900 hover:bg-slate-100 rounded-lg transition-colors items-center gap-1.5 cursor-pointer"
                title="Take an interactive tour of the platform"
              >
                <Compass className="w-3.5 h-3.5 text-blue-900" />
                <span>Tour</span>
              </button>
              <button
                onClick={() => {
                  if (currentUser) {
                    setIsPublicWebsite(false);
                    setActiveNav('dashboard');
                  } else {
                    openLoginModal();
                  }
                }}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-lg transition-colors shadow-xs flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
              >
                <Video className="w-3.5 h-3.5" />
                <span>Enter Portal</span>
              </button>
            </div>
          ) : (
            <>
              {/* Guided Platform Tour Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  data-tour="topbar-tour-btn"
                  onClick={() => setShowTourMenu(!showTourMenu)}
                  title="Interactive Onboarding & Platform Tour"
                  className={`p-2 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                    showTourMenu || isTourActive
                      ? 'bg-blue-100 text-blue-900 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Compass className="w-4 h-4 text-amber-500 animate-spin-slow" />
                  <span className="hidden xl:inline text-xs font-semibold">Tour</span>
                </button>

                {showTourMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowTourMenu(false)} />
                    <div className="absolute right-0 top-12 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 p-2 space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-150 text-xs">
                      <div className="px-3 py-2 border-b border-slate-100">
                        <p className="font-bold text-slate-900 flex items-center gap-1.5">
                          <Compass className="w-4 h-4 text-amber-500" />
                          <span>Platform Orientation</span>
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Interactive step-by-step guides
                        </p>
                      </div>

                      {/* Launch Current Role Tour */}
                      <button
                        type="button"
                        onClick={() => {
                          setShowTourMenu(false);
                          startTour();
                        }}
                        className="w-full text-left p-2.5 rounded-xl bg-blue-50 text-blue-900 font-bold hover:bg-blue-100 transition-colors flex items-center justify-between cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-amber-500" />
                          <span className="capitalize">{currentRole} Portal Tour</span>
                        </div>
                        <span className="text-[10px] bg-blue-900 text-white px-2 py-0.5 rounded-full font-bold">
                          Start
                        </span>
                      </button>

                      <div className="pt-1 border-t border-slate-100 px-1">
                        <button
                          type="button"
                          onClick={() => {
                            resetTourStatus();
                            setShowTourMenu(false);
                          }}
                          className="w-full py-1 text-center text-[10px] text-slate-400 hover:text-slate-700 cursor-pointer"
                        >
                          Reset Tour Progress
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Notification Bell */}
              <div className="relative">
                <button
                  data-tour="topbar-notifications"
                  onClick={() => setShowNotifMenu(!showNotifMenu)}
                  title="Notifications & Alerts"
                  className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  <Bell className="w-4 h-4" />
                  {unreadNotificationsCount > 0 ? (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white animate-pulse" />
                  ) : announcements.length > 0 ? (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-full" />
                  ) : null}
                </button>

                {showNotifMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowNotifMenu(false)} />
                    <div className="absolute right-0 top-12 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="p-3.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold font-heading text-slate-900">Notifications</h4>
                          {unreadNotificationsCount > 0 && (
                            <span className="px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold">
                              {unreadNotificationsCount} new
                            </span>
                          )}
                        </div>
                        {notifications.length > 0 && (
                          <button
                            onClick={clearAllNotifications}
                            className="text-[11px] text-slate-500 hover:text-slate-800 font-medium flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" /> Clear
                          </button>
                        )}
                      </div>

                      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 text-xs">
                        {notifications.length === 0 ? (
                          <div className="p-6 text-center text-slate-400">
                            <Bell className="w-6 h-6 mx-auto mb-2 text-slate-300" />
                            <p>No new notifications</p>
                          </div>
                        ) : (
                          notifications.map((n) => (
                            <div
                              key={n.id}
                              onClick={() => {
                                markNotificationAsRead(n.id);
                                if (n.actionNav) setActiveNav(n.actionNav);
                                setShowNotifMenu(false);
                              }}
                              className={`p-3.5 hover:bg-slate-50 transition-colors cursor-pointer flex items-start gap-3 ${
                                !n.read ? 'bg-blue-50/40' : ''
                              }`}
                            >
                              <div className="mt-0.5 shrink-0">
                                {n.type === 'vclass' ? (
                                  <div className="w-6 h-6 rounded-md bg-rose-100 text-rose-600 flex items-center justify-center">
                                    <Video className="w-3.5 h-3.5" />
                                  </div>
                                ) : n.type === 'assignment' ? (
                                  <div className="w-6 h-6 rounded-md bg-amber-100 text-amber-700 flex items-center justify-center">
                                    <BookOpen className="w-3.5 h-3.5" />
                                  </div>
                                ) : (
                                  <div className="w-6 h-6 rounded-md bg-blue-100 text-blue-900 flex items-center justify-center">
                                    <Bell className="w-3.5 h-3.5" />
                                  </div>
                                )}
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-1 mb-0.5">
                                  <div className="flex items-center gap-1.5 min-w-0">
                                    <p className={`font-semibold truncate text-[11px] ${!n.read ? 'text-slate-900 font-bold' : 'text-slate-700'}`}>
                                      {n.title}
                                    </p>
                                    {n.classLevel && n.classLevel !== 'All Classes' && (
                                      <span className="px-1.5 py-0.2 rounded bg-blue-100 text-blue-900 font-bold text-[9px] shrink-0">
                                        {n.classLevel}
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[10px] text-slate-400 shrink-0">{n.time}</span>
                                </div>
                                <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                                  {n.message}
                                </p>
                              </div>

                              {!n.read && (
                                <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0 mt-1.5" />
                              )}
                            </div>
                          ))
                        )}
                      </div>

                      <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
                        <button
                          onClick={() => {
                            setActiveNav('announcements');
                            setShowNotifMenu(false);
                          }}
                          className="text-[11px] font-semibold text-blue-900 hover:text-blue-700 flex items-center justify-center gap-1 w-full cursor-pointer"
                        >
                          View School Noticeboard <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Student Points Pill */}
              {currentRole === 'student' && currentUser && (
                <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200/70 rounded-lg text-xs font-semibold text-amber-900">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>{currentUser.points || 450} pts</span>
                  <span className="text-amber-400">·</span>
                  <span>🔥 {currentUser.streakDays || 5}d</span>
                </div>
              )}

              {/* Share VClass Action Button */}
              <button
                type="button"
                onClick={() => setShowShareModal(true)}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
                title="Share VClass Link with official school crest"
              >
                <Share2 className="w-3.5 h-3.5 text-amber-500" />
                <span className="hidden md:inline">Share</span>
              </button>

              {/* Official School Website Link */}
              <a
                href={schoolConfig.websiteUrl || 'https://salemmontessori.edu.gh'}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden xl:inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors whitespace-nowrap"
                title="Visit official school website"
              >
                <Globe className="w-3.5 h-3.5 text-blue-900" />
                <span>School Web</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>

              {/* Quick Join Live VClass CTA */}
              <button
                type="button"
                data-tour="topbar-live-btn"
                onClick={handleEnterVClassQuick}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs cursor-pointer whitespace-nowrap"
              >
                <Video className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Join Live</span>
                <span className="sm:hidden">Live</span>
              </button>

              {/* User Avatar & Info */}
              <button
                type="button"
                data-tour="topbar-user-profile"
                onClick={() => setActiveNav('profile')}
                className="hidden sm:flex items-center gap-2 p-1 pl-2 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors text-left"
              >
                <img
                  src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                  alt={currentUser?.name || 'User'}
                  referrerPolicy="no-referrer"
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-slate-200"
                />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[100px]">
                    {currentUser?.name.split(' ')[0]}
                  </p>
                  <p className="text-[10px] text-slate-500 capitalize leading-none mt-0.5">
                    {currentUser?.classLevel || currentUser?.role}
                  </p>
                </div>
              </button>

              {/* Logout button */}
              <button
                type="button"
                onClick={logoutToWebsite}
                title="Sign Out"
                className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* MOBILE SLIDE-OUT NAVIGATION DRAWER */}
      {showMobileDrawer && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setShowMobileDrawer(false)}
          />

          {/* Drawer Body */}
          <div className="relative w-80 max-w-[85vw] bg-white h-full shadow-2xl flex flex-col justify-between z-50 animate-in slide-in-from-left duration-200">
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Navigation Menu</span>
                <button
                  type="button"
                  onClick={() => setShowMobileDrawer(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {currentUser && (
                <div className="flex items-center gap-3">
                  <img
                    src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                    alt={currentUser.name}
                    referrerPolicy="no-referrer"
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-blue-100 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-slate-900 truncate">{currentUser.name}</p>
                    <p className="text-xs text-slate-500 capitalize">{currentUser.role} • {currentUser.classLevel || 'Montessori'}</p>
                    {currentRole === 'student' && (
                      <p className="text-[11px] text-amber-700 font-medium mt-0.5">
                        ✨ {currentUser.points || 450} pts · 🔥 {currentUser.streakDays || 5}d streak
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Categorized Sub-menus for Mobile - Filtered Strictly by Current User Role */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs font-medium">
              {/* ADMIN ROLE */}
              {currentRole === 'admin' && (
                <>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider px-2">Administrative Center</p>
                    <button
                      type="button"
                      onClick={() => handleNavClick('dashboard')}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                        activeNav === 'dashboard' ? 'bg-blue-900 text-white font-semibold' : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <Compass className="w-4 h-4 text-slate-400" />
                      <span>Admin Dashboard</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleNavClick('configure_school')}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors ${
                        activeNav === 'configure_school' ? 'bg-blue-900 text-white font-semibold' : 'text-blue-900 bg-blue-50/70 hover:bg-blue-100'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Building2 className="w-4 h-4 text-amber-500" />
                        <span className="font-bold">Configure School</span>
                      </div>
                      <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-sm bg-amber-400 text-slate-950">
                        SETUP
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleNavClick('classes')}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                        activeNav === 'classes' ? 'bg-blue-900 text-white font-semibold' : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <ClipboardList className="w-4 h-4 text-blue-600" />
                      <span>Classes & Terms</span>
                    </button>
                  </div>

                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider px-2">School Community</p>
                    <button
                      type="button"
                      onClick={() => handleNavClick('pupils')}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                        activeNav === 'pupils' ? 'bg-blue-900 text-white font-semibold' : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <GraduationCap className="w-4 h-4 text-purple-600" />
                      <span>Manage Pupils</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleNavClick('teachers')}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                        activeNav === 'teachers' ? 'bg-blue-900 text-white font-semibold' : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <UserCheck className="w-4 h-4 text-emerald-600" />
                      <span>Manage Teachers</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleNavClick('attendance')}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                        activeNav === 'attendance' ? 'bg-blue-900 text-white font-semibold' : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <Calendar className="w-4 h-4 text-amber-600" />
                      <span>School Attendance</span>
                    </button>
                  </div>

                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider px-2">Curriculum & Delivery</p>
                    <button
                      type="button"
                      onClick={() => handleNavClick('courses')}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                        activeNav === 'courses' ? 'bg-blue-900 text-white font-semibold' : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <BookOpen className="w-4 h-4 text-blue-600" />
                      <span>Courses & Curricula</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleNavClick('timetable')}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                        activeNav === 'timetable' ? 'bg-blue-900 text-white font-semibold' : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <Calendar className="w-4 h-4 text-purple-600" />
                      <span>Master Timetable</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleEnterVClassQuick}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors ${
                        activeNav === 'vclass' ? 'bg-rose-600 text-white font-semibold' : 'text-rose-700 bg-rose-50/70 hover:bg-rose-100'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Video className="w-4 h-4 text-rose-600" />
                        <span>Live VClasses</span>
                      </div>
                      <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-sm bg-rose-500 text-white animate-pulse">
                        LIVE
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleNavClick('library')}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                        activeNav === 'library' ? 'bg-blue-900 text-white font-semibold' : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <Library className="w-4 h-4 text-purple-600" />
                      <span>Digital Library</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleNavClick('announcements')}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors ${
                        activeNav === 'announcements' ? 'bg-blue-900 text-white font-semibold' : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Bell className="w-4 h-4 text-slate-500" />
                        <span>Broadcast Notices</span>
                      </div>
                      {announcements.length > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full bg-slate-200 text-[10px] font-bold text-slate-700">
                          {announcements.length}
                        </span>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleNavClick('profile')}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                        activeNav === 'profile' ? 'bg-blue-900 text-white font-semibold' : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <User className="w-4 h-4 text-slate-500" />
                      <span>Admin Profile</span>
                    </button>
                  </div>
                </>
              )}

              {/* TEACHER ROLE */}
              {currentRole === 'teacher' && (
                <>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider px-2">Teaching Hub</p>
                    <button
                      type="button"
                      onClick={() => handleNavClick('dashboard')}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                        activeNav === 'dashboard' ? 'bg-blue-900 text-white font-semibold' : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <Compass className="w-4 h-4 text-slate-400" />
                      <span>Teacher Dashboard</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleEnterVClassQuick}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors ${
                        activeNav === 'vclass' ? 'bg-rose-600 text-white font-semibold' : 'text-rose-700 bg-rose-50/70 hover:bg-rose-100'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Video className="w-4 h-4 text-rose-600" />
                        <span>VClass Host Studio</span>
                      </div>
                      <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-sm bg-rose-500 text-white animate-pulse">
                        HOST
                      </span>
                    </button>
                  </div>

                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider px-2">Curriculum & Studio</p>
                    <button
                      type="button"
                      onClick={() => handleNavClick('courses')}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                        activeNav === 'courses' ? 'bg-blue-900 text-white font-semibold' : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <BookOpen className="w-4 h-4 text-blue-600" />
                      <span>Course Builder</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleNavClick('library')}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                        activeNav === 'library' ? 'bg-blue-900 text-white font-semibold' : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <Library className="w-4 h-4 text-purple-600" />
                      <span>Resource Library</span>
                    </button>
                  </div>

                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider px-2">Classroom & Records</p>
                    <button
                      type="button"
                      onClick={() => handleNavClick('classes')}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                        activeNav === 'classes' ? 'bg-blue-900 text-white font-semibold' : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <Building className="w-4 h-4 text-blue-600" />
                      <span>Classrooms & Rosters</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleNavClick('attendance')}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                        activeNav === 'attendance' ? 'bg-blue-900 text-white font-semibold' : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <UserCheck className="w-4 h-4 text-emerald-600" />
                      <span>Class Attendance</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleNavClick('timetable')}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                        activeNav === 'timetable' ? 'bg-blue-900 text-white font-semibold' : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <Calendar className="w-4 h-4 text-purple-600" />
                      <span>Teaching Schedule</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleNavClick('assignments')}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                        activeNav === 'assignments' ? 'bg-blue-900 text-white font-semibold' : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <FileCheck2 className="w-4 h-4 text-emerald-600" />
                      <span>Mark Assignments</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleNavClick('announcements')}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors ${
                        activeNav === 'announcements' ? 'bg-blue-900 text-white font-semibold' : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Bell className="w-4 h-4 text-slate-500" />
                        <span>Send Notices</span>
                      </div>
                      {announcements.length > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full bg-slate-200 text-[10px] font-bold text-slate-700">
                          {announcements.length}
                        </span>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleNavClick('profile')}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                        activeNav === 'profile' ? 'bg-blue-900 text-white font-semibold' : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <User className="w-4 h-4 text-slate-500" />
                      <span>Teacher Profile</span>
                    </button>
                  </div>
                </>
              )}

              {/* STUDENT ROLE */}
              {currentRole === 'student' && (
                <>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider px-2">Core & Live Hub</p>
                    <button
                      type="button"
                      onClick={() => handleNavClick('dashboard')}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                        activeNav === 'dashboard' ? 'bg-blue-900 text-white font-semibold' : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <Compass className="w-4 h-4 text-slate-400" />
                      <span>Dashboard</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleEnterVClassQuick}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors ${
                        activeNav === 'vclass' ? 'bg-rose-600 text-white font-semibold' : 'text-rose-700 bg-rose-50/70 hover:bg-rose-100'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Video className="w-4 h-4 text-rose-600" />
                        <span>VClass Live Studio</span>
                      </div>
                      <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-sm bg-rose-500 text-white animate-pulse">
                        LIVE
                      </span>
                    </button>
                  </div>

                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider px-2">Learning & Practice</p>
                    <button
                      type="button"
                      onClick={() => handleNavClick('courses')}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                        activeNav === 'courses' ? 'bg-blue-900 text-white font-semibold' : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <BookOpen className="w-4 h-4 text-blue-600" />
                      <span>My Courses</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleNavClick('montessori')}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                        activeNav === 'montessori' ? 'bg-blue-900 text-white font-semibold' : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <Shapes className="w-4 h-4 text-amber-500" />
                      <span>Montessori Lab</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleNavClick('library')}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                        activeNav === 'library' ? 'bg-blue-900 text-white font-semibold' : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <Library className="w-4 h-4 text-purple-600" />
                      <span>Digital Library</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleNavClick('timetable')}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                        activeNav === 'timetable' ? 'bg-blue-900 text-white font-semibold' : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <Calendar className="w-4 h-4 text-purple-600" />
                      <span>Timetable Schedule</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleNavClick('attendance')}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                        activeNav === 'attendance' ? 'bg-blue-900 text-white font-semibold' : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <UserCheck className="w-4 h-4 text-emerald-600" />
                      <span>Daily Attendance</span>
                    </button>
                  </div>

                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider px-2">Assessment & Grades</p>
                    <button
                      type="button"
                      onClick={() => handleNavClick('assignments')}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                        activeNav === 'assignments' ? 'bg-blue-900 text-white font-semibold' : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <FileCheck2 className="w-4 h-4 text-emerald-600" />
                      <span>Assignments & Tasks</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleNavClick('quizzes')}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                        activeNav === 'quizzes' ? 'bg-blue-900 text-white font-semibold' : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <BrainCircuit className="w-4 h-4 text-amber-600" />
                      <span>Quizzes & Tests</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleNavClick('results')}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                        activeNav === 'results' ? 'bg-blue-900 text-white font-semibold' : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <BarChart3 className="w-4 h-4 text-blue-600" />
                      <span>My Results</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleNavClick('badges')}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                        activeNav === 'badges' ? 'bg-blue-900 text-white font-semibold' : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <Award className="w-4 h-4 text-amber-500" />
                      <span>Badges & Streaks</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleNavClick('announcements')}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors ${
                        activeNav === 'announcements' ? 'bg-blue-900 text-white font-semibold' : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Bell className="w-4 h-4 text-slate-500" />
                        <span>School Notices</span>
                      </div>
                      {announcements.length > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full bg-slate-200 text-[10px] font-bold text-slate-700">
                          {announcements.length}
                        </span>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleNavClick('profile')}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                        activeNav === 'profile' ? 'bg-blue-900 text-white font-semibold' : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <User className="w-4 h-4 text-slate-500" />
                      <span>My Profile & Settings</span>
                    </button>
                  </div>
                </>
              )}

              {/* PARENT ROLE */}
              {currentRole === 'parent' && (
                <>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider px-2">Family & Children</p>
                    <button
                      type="button"
                      onClick={() => handleNavClick('dashboard')}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                        activeNav === 'dashboard' ? 'bg-blue-900 text-white font-semibold' : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <Compass className="w-4 h-4 text-slate-400" />
                      <span>Parent Dashboard</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleNavClick('attendance')}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                        activeNav === 'attendance' ? 'bg-blue-900 text-white font-semibold' : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <UserCheck className="w-4 h-4 text-emerald-600" />
                      <span>Attendance Record</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleNavClick('timetable')}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                        activeNav === 'timetable' ? 'bg-blue-900 text-white font-semibold' : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <Calendar className="w-4 h-4 text-purple-600" />
                      <span>Class Timetable</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleNavClick('announcements')}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors ${
                        activeNav === 'announcements' ? 'bg-blue-900 text-white font-semibold' : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Bell className="w-4 h-4 text-slate-500" />
                        <span>School Notices</span>
                      </div>
                      {announcements.length > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full bg-slate-200 text-[10px] font-bold text-slate-700">
                          {announcements.length}
                        </span>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleNavClick('profile')}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                        activeNav === 'profile' ? 'bg-blue-900 text-white font-semibold' : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <User className="w-4 h-4 text-slate-500" />
                      <span>Guardian Profile</span>
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 space-y-2">
              <button
                type="button"
                onClick={() => {
                  setShowMobileDrawer(false);
                  setShowDiagConsole(true);
                }}
                className="w-full flex items-center justify-center gap-2 py-2 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 rounded-lg transition-colors cursor-pointer"
              >
                <Bug className="w-3.5 h-3.5 text-slate-500" />
                <span>System Diagnostics</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowMobileDrawer(false);
                  logoutToWebsite();
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Diagnostics Console Modal */}
      {showDiagConsole && (
        <DiagnosticConsoleModal isOpen={showDiagConsole} onClose={() => setShowDiagConsole(false)} />
      )}

      {/* Share VClass & Preview Modal */}
      <ShareVClassModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        defaultTarget="portal"
      />
    </header>
  );
};

function Building2Icon(props: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={props.className}
    >
      <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
      <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
      <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
      <path d="M10 6h4" />
      <path d="M10 10h4" />
      <path d="M10 14h4" />
      <path d="M10 18h4" />
    </svg>
  );
}
