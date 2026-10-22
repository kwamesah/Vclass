import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  BookOpen,
  Video,
  FileCheck2,
  BrainCircuit,
  GraduationCap,
  Library,
  Bell,
  UserCheck,
  Shapes,
  Sparkles,
  ClipboardList,
  Calendar,
  MessageSquare,
  BarChart3,
  Award,
  ChevronDown,
  ChevronRight,
  PanelLeftClose,
  PanelLeft,
  User,
  Compass,
  Layers,
  GraduationCap as AcademyIcon,
  Building,
  Building2,
  FileText,
} from 'lucide-react';

export interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  count?: number;
  highlight?: boolean;
  hint?: string;
}

export interface NavGroup {
  id: string;
  title: string;
  icon?: React.ComponentType<{ className?: string }>;
  items: NavItem[];
}

export const Sidebar: React.FC = () => {
  const { currentRole, activeNav, setActiveNav, announcements, currentUser, startTour, schoolConfig } = useApp();
  const [isCompact, setIsCompact] = useState<boolean>(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  if (!currentUser) return null;

  const toggleGroup = (groupId: string) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  const getNavGroups = (): NavGroup[] => {
    switch (currentRole) {
      case 'student':
        return [
          {
            id: 'core',
            title: 'Core & Live Hub',
            icon: Compass,
            items: [
              { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, hint: 'Daily Schedule' },
              { id: 'vclass', label: 'VClass Live', icon: Video, badge: 'LIVE', hint: 'Interactive Studio' },
            ],
          },
          {
            id: 'academics',
            title: 'Learning & Practice',
            icon: BookOpen,
            items: [
              { id: 'courses', label: 'My Courses', icon: BookOpen, hint: 'Curriculum Strands' },
              { id: 'classes', label: 'My Class', icon: Building, hint: 'Classroom & Roster' },
              { id: 'timetable', label: 'Timetable', icon: Calendar, hint: 'Daily Schedule' },
              { id: 'attendance', label: 'Attendance', icon: UserCheck, hint: 'Roll Call Record' },
              { id: 'montessori', label: 'Montessori Lab', icon: Shapes, highlight: true, hint: 'Sensory Apparatus' },
              { id: 'library', label: 'Digital Library', icon: Library, hint: 'E-Books & Media' },
            ],
          },
          {
            id: 'assessments',
            title: 'Assessment & Grades',
            icon: Layers,
            items: [
              { id: 'assignments', label: 'Assignments', icon: FileCheck2, hint: 'Homework Tasks' },
              { id: 'quizzes', label: 'Quizzes & Tests', icon: BrainCircuit, hint: 'Knowledge Checks' },
              { id: 'examinations', label: 'Examinations', icon: GraduationCap, hint: 'Term Exams' },
              { id: 'results', label: 'My Results', icon: BarChart3, hint: 'Performance & GPA' },
            ],
          },
          {
            id: 'community',
            title: 'Campus & Milestones',
            icon: Award,
            items: [
              { id: 'badges', label: 'Badges & Streaks', icon: Award, hint: 'Achievements' },
              { id: 'announcements', label: 'Announcements', icon: Bell, count: announcements.length, hint: 'School Notices' },
              { id: 'profile', label: 'My Profile', icon: User, hint: 'Account & Settings' },
            ],
          },
        ];

      case 'teacher':
        return [
          {
            id: 'core',
            title: 'Teaching Hub',
            icon: Compass,
            items: [
              { id: 'dashboard', label: 'Teacher Dashboard', icon: LayoutDashboard, hint: 'Daily Classes' },
              { id: 'vclass', label: 'VClass Host Studio', icon: Video, badge: 'HOST', hint: 'Live Stage' },
            ],
          },
          {
            id: 'curriculum',
            title: 'Curriculum & Studio',
            icon: BookOpen,
            items: [
              { id: 'lesson_notes', label: 'Lesson Notes & AI', icon: FileText, highlight: true, hint: 'NaCCA & Submissions' },
              { id: 'courses', label: 'Course Builder', icon: BookOpen, hint: 'Lesson & Slides' },
              { id: 'library', label: 'Resource Library', icon: Library, hint: 'Teaching Assets' },
            ],
          },
          {
            id: 'classroom',
            title: 'Classroom & Records',
            icon: UserCheck,
            items: [
              { id: 'classes', label: 'Classrooms & Rosters', icon: Building, hint: 'Assigned Classes' },
              { id: 'attendance', label: 'Class Attendance', icon: UserCheck, hint: 'Daily Register' },
              { id: 'timetable', label: 'Teaching Schedule', icon: Calendar, hint: 'Timetable Slots' },
              { id: 'results', label: 'Pupil Performance', icon: BarChart3, hint: 'Gradebook' },
            ],
          },
          {
            id: 'evaluation',
            title: 'Assessments & Notices',
            icon: Layers,
            items: [
              { id: 'assignments', label: 'Mark Assignments', icon: FileCheck2, hint: 'Rubric Grading' },
              { id: 'examinations', label: 'Examinations Hall', icon: GraduationCap, hint: 'Term Papers' },
              { id: 'quizzes', label: 'Question Bank', icon: BrainCircuit, hint: 'Exams & Quizzes' },
              { id: 'announcements', label: 'Send Notices', icon: Bell, count: announcements.length, hint: 'School Bulletins' },
              { id: 'profile', label: 'Teacher Profile', icon: User, hint: 'Faculty Record' },
            ],
          },
        ];

      case 'parent':
        return [
          {
            id: 'family',
            title: 'Family & Children',
            icon: Compass,
            items: [
              { id: 'dashboard', label: 'Parent Dashboard', icon: LayoutDashboard, hint: 'Child Overview' },
              { id: 'children', label: 'My Children', icon: GraduationCap, hint: 'Pupil Portfolios' },
            ],
          },
          {
            id: 'progress',
            title: 'Academic Progress',
            icon: Layers,
            items: [
              { id: 'attendance', label: 'Attendance Record', icon: UserCheck, hint: 'Class Presence' },
              { id: 'assignments', label: 'Homework & Tasks', icon: FileCheck2, hint: 'Due Work' },
              { id: 'results', label: 'Term Assessment', icon: BarChart3, hint: 'Report Cards' },
            ],
          },
          {
            id: 'connect',
            title: 'School Connect',
            icon: Bell,
            items: [
              { id: 'vclass', label: 'Upcoming VClasses', icon: Video, hint: 'Timetable Sessions' },
              { id: 'announcements', label: 'School Notices', icon: Bell, count: announcements.length, hint: 'Official Bulletins' },
              { id: 'messages', label: 'Teacher Contact', icon: MessageSquare, hint: 'Direct Messages' },
              { id: 'profile', label: 'Guardian Profile', icon: User, hint: 'Contact Details' },
            ],
          },
        ];

      case 'admin':
        return [
          {
            id: 'admin_core',
            title: 'Administrative Center',
            icon: Compass,
            items: [
              { id: 'dashboard', label: 'Admin Dashboard', icon: LayoutDashboard, hint: 'School Metrics' },
              { id: 'lesson_notes_approval', label: 'Lesson Notes Vetting', icon: Award, highlight: true, hint: 'Headmaster Approval' },
              { id: 'configure_school', label: 'Configure School', icon: Building2, hint: 'Identity & Terms' },
              { id: 'classes', label: 'Classes & Terms', icon: ClipboardList, hint: 'Structure' },
            ],
          },
          {
            id: 'people',
            title: 'School Community',
            icon: UserCheck,
            items: [
              { id: 'pupils', label: 'Manage Pupils', icon: GraduationCap, hint: 'Enrollment' },
              { id: 'teachers', label: 'Manage Teachers', icon: UserCheck, hint: 'Faculty Roster' },
              { id: 'attendance', label: 'School Attendance', icon: Calendar, hint: 'Daily Log' },
            ],
          },
          {
            id: 'academics_admin',
            title: 'Curricula & Media',
            icon: BookOpen,
            items: [
              { id: 'courses', label: 'Courses & Curricula', icon: BookOpen, hint: 'Syllabi' },
              { id: 'examinations', label: 'Examinations Hall', icon: GraduationCap, hint: 'Official Papers' },
              { id: 'results', label: 'Terminal Reports', icon: BarChart3, hint: 'Transcripts' },
              { id: 'timetable', label: 'Master Timetable', icon: Calendar, hint: 'All Schedules' },
              { id: 'vclass', label: 'Live VClasses', icon: Video, hint: 'Active Sessions' },
              { id: 'library', label: 'Digital Library', icon: Library, hint: 'Content Depot' },
              { id: 'announcements', label: 'Broadcast Notices', icon: Bell, count: announcements.length, hint: 'Whole School' },
              { id: 'profile', label: 'Admin Profile', icon: User, hint: 'System Settings' },
            ],
          },
        ];

      default:
        return [];
    }
  };

  const navGroups = getNavGroups();

  return (
    <aside
      className={`shrink-0 hidden md:flex flex-col justify-between bg-white border-r border-slate-200 transition-all duration-300 min-h-[calc(100vh-64px)] ${
        isCompact ? 'w-20 p-2' : 'w-72 p-4'
      }`}
    >
      <div className="flex-1 overflow-y-auto pr-1">
        {/* Profile Card snippet in sidebar */}
        <div
          data-tour="sidebar-profile"
          onClick={() => setActiveNav('profile')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setActiveNav('profile');
            }
          }}
          className={`p-3 bg-slate-50 hover:bg-slate-100/80 rounded-xl mb-4 border border-slate-200/60 transition-colors cursor-pointer ${
            isCompact ? 'flex justify-center p-2' : 'flex items-center gap-3'
          }`}
          title={isCompact ? `${currentUser.name} (${currentUser.role})` : undefined}
        >
          <img
            src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
            alt={currentUser?.name || 'User'}
            referrerPolicy="no-referrer"
            className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-100 shrink-0"
          />
          {!isCompact && (
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-900 truncate">{currentUser.name}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[11px] text-slate-500 capitalize truncate">
                  {currentUser.role === 'admin'
                    ? 'Administrator'
                    : currentUser.role === 'teacher'
                    ? 'Class Teacher'
                    : currentUser.role === 'parent'
                    ? 'Parent / Guardian'
                    : `${currentUser.classLevel} Pupil`}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Categorized Sub-menus */}
        <nav data-tour="sidebar-nav" className="space-y-4">
          {navGroups.map((group) => {
            const isGroupCollapsed = !!collapsedGroups[group.id];
            const hasActiveItem = group.items.some((i) => i.id === activeNav);

            return (
              <div key={group.id} className="space-y-1">
                {/* Sub-menu Group Header */}
                {!isCompact ? (
                  <button
                    type="button"
                    onClick={() => toggleGroup(group.id)}
                    className="w-full flex items-center justify-between px-2.5 py-1.5 text-[11px] font-bold text-slate-400 hover:text-slate-700 uppercase tracking-wider rounded-md transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-1.5">
                      {group.icon && <group.icon className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600" />}
                      <span className={hasActiveItem ? 'text-blue-900 font-extrabold' : ''}>{group.title}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-slate-400 font-normal group-hover:text-slate-600">
                        {group.items.length}
                      </span>
                      {isGroupCollapsed ? (
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                      )}
                    </div>
                  </button>
                ) : (
                  <div className="w-full h-px bg-slate-200 my-2" />
                )}

                {/* Sub-menu Items */}
                {(!isGroupCollapsed || isCompact) && (
                  <div className={`space-y-1 ${!isCompact ? 'pl-1' : ''}`}>
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeNav === item.id;

                      return (
                        <button
                          key={item.id}
                          data-tour={`nav-${item.id}`}
                          type="button"
                          onClick={() => setActiveNav(item.id)}
                          title={isCompact ? `${item.label} - ${item.hint || ''}` : undefined}
                          className={`w-full flex items-center justify-between rounded-lg transition-all cursor-pointer text-left ${
                            isCompact ? 'p-2.5 justify-center' : 'px-3 py-2 text-xs font-medium'
                          } ${
                            isActive
                              ? 'bg-blue-900 text-white font-semibold shadow-xs'
                              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                          }`}
                        >
                          <div className={`flex items-center gap-2.5 min-w-0 ${isCompact ? 'justify-center' : ''}`}>
                            <Icon
                              className={`shrink-0 transition-colors ${
                                isCompact ? 'w-5 h-5' : 'w-4 h-4'
                              } ${
                                isActive
                                  ? 'text-white'
                                  : item.highlight
                                  ? 'text-amber-500'
                                  : 'text-slate-500'
                              }`}
                            />
                            {!isCompact && (
                              <div className="min-w-0 flex-1">
                                <span className="truncate block">{item.label}</span>
                              </div>
                            )}
                          </div>

                          {!isCompact && (
                            <div className="flex items-center gap-1 shrink-0 ml-1.5">
                              {item.badge && (
                                <span
                                  className={`px-1.5 py-0.5 text-[10px] font-bold rounded-sm ${
                                    item.badge === 'LIVE'
                                      ? 'bg-rose-500 text-white animate-pulse'
                                      : 'bg-blue-100 text-blue-900'
                                  }`}
                                >
                                  {item.badge}
                                </span>
                              )}

                              {item.count !== undefined && item.count > 0 && (
                                <span
                                  className={`px-1.5 py-0.5 text-[10px] font-semibold rounded-full ${
                                    isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-800'
                                  }`}
                                >
                                  {item.count}
                                </span>
                              )}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* Footer Controls & Compact Toggle */}
      <div className="pt-3 border-t border-slate-200 mt-3 space-y-2">
        {/* Onboarding Tour Launcher */}
        <button
          type="button"
          data-tour="sidebar-tour-btn"
          onClick={() => startTour()}
          className={`w-full flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer bg-gradient-to-r from-blue-900 to-indigo-950 text-white shadow-xs hover:from-blue-800 hover:to-indigo-900 active:scale-98 ${
            isCompact ? 'px-1' : 'px-3'
          }`}
          title="Start interactive platform tour"
        >
          <Compass className="w-4 h-4 text-amber-400 animate-spin-slow shrink-0" />
          {!isCompact && <span>Platform Tour</span>}
        </button>

        {/* Toggle Compact / Expanded View */}
        <button
          type="button"
          onClick={() => setIsCompact(!isCompact)}
          className={`w-full flex items-center justify-center gap-2 py-1.5 text-xs text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer ${
            isCompact ? 'px-1' : 'px-3'
          }`}
          title={isCompact ? 'Expand Sidebar' : 'Collapse Sidebar to Simple Icons'}
        >
          {isCompact ? (
            <PanelLeft className="w-4 h-4 text-slate-600" />
          ) : (
            <>
              <PanelLeftClose className="w-4 h-4 text-slate-500" />
              <span className="font-medium text-[11px]">Simple Sidebar Mode</span>
            </>
          )}
        </button>

        {/* Montessori Philosophy Footer Quote */}
        {!isCompact && (
          <div className="px-2 text-slate-400 text-[11px] leading-relaxed">
            <p className="font-semibold text-slate-600 flex items-center gap-1.5 text-[11px] truncate">
              <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
              <span className="truncate">{schoolConfig.shortName || 'Salem VClass'}</span>
            </p>
            <p className="italic text-[10px] text-slate-400 truncate">"{schoolConfig.motto || 'Learn. Explore. Grow.'}"</p>
          </div>
        )}
      </div>
    </aside>
  );
};
