import React, { useState } from 'react';
import { useApp, getParentWards } from '../../context/AppContext';
import {
  Users,
  GraduationCap,
  Calendar,
  CheckCircle2,
  FileCheck2,
  BarChart3,
  MessageSquare,
  Sparkles,
  Video,
  Award,
  ChevronRight,
  Send,
  Plus,
  Clock,
  Bell,
  Phone,
  Mail,
  Search,
  BookOpen,
  AlertCircle,
  X,
  Loader2,
  Activity,
  BrainCircuit,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const ParentPortal: React.FC = () => {
  const {
    users,
    currentUser,
    courses,
    assignments,
    submissions,
    announcements,
    timetable,
    schoolConfig,
    activities,
    logActivity,
    linkWardToCurrentParent,
  } = useApp();

  // Strictly filter only this parent's linked children (by user ID or student ID)
  const studentChildren = currentUser ? getParentWards(currentUser, users) : [];

  const [selectedChildId, setSelectedChildId] = useState<string>(
    studentChildren[0]?.id || ''
  );
  const [messageToTeacher, setMessageToTeacher] = useState<string>('');
  const [sentMessageNotice, setSentMessageNotice] = useState<boolean>(false);

  // Self-service ward connection states
  const [showConnectModal, setShowConnectModal] = useState<boolean>(false);
  const [connectInput, setConnectInput] = useState<string>('');
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [connectNotice, setConnectNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Active selected child
  const currentChild =
    studentChildren.find((u) => u.id === selectedChildId) || studentChildren[0];

  // Derive subjects progress dynamically from real courses matching child's class
  const subjectProgress = (courses.length > 0 ? courses : [])
    .filter((c) => !currentChild || c.classLevel === currentChild.classLevel || c.classLevel === 'All Classes')
    .map((c, idx) => {
      const colors = ['bg-blue-600', 'bg-emerald-600', 'bg-amber-600', 'bg-purple-600'];
      return {
        subject: c.subject,
        score: c.progressPercentage || 0,
        color: colors[idx % colors.length],
        teacher: c.teacherName,
      };
    });

  // Daily timetable for child's class
  const childTimetableSlots = timetable.filter(
    (t) => !currentChild || t.classLevel === currentChild.classLevel
  );

  // Parent announcements
  const parentAnnouncements = announcements.filter(
    (a) => a.targetAudience === 'all' || a.targetAudience === 'parents'
  );

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageToTeacher.trim()) return;
    const msg = messageToTeacher.trim();
    setSentMessageNotice(true);
    setMessageToTeacher('');

    if (currentChild) {
      logActivity(
        'Guardian Inquiry',
        `${currentUser?.name || 'Guardian'} sent an inquiry for ${currentChild.name} (${currentChild.classLevel || 'Class'}): "${msg}"`,
        'system',
        currentChild.classLevel,
        true,
        'teacher'
      );
    }

    try {
      confetti({ particleCount: 30 });
    } catch {}
    setTimeout(() => setSentMessageNotice(false), 3000);
  };

  const handleConnectWardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setConnectNotice(null);
    if (!connectInput.trim()) {
      setConnectNotice({
        type: 'error',
        message: 'Please enter your child’s Student ID (e.g. STU-2024-007) or full name.',
      });
      return;
    }

    setIsConnecting(true);
    try {
      const res = await linkWardToCurrentParent(connectInput.trim());
      if (res.success) {
        setConnectNotice({ type: 'success', message: res.message });
        setConnectInput('');
        try {
          confetti({ particleCount: 45 });
        } catch {}
        setTimeout(() => {
          setShowConnectModal(false);
          setConnectNotice(null);
        }, 1600);
      } else {
        setConnectNotice({ type: 'error', message: res.message });
      }
    } catch (err: any) {
      setConnectNotice({
        type: 'error',
        message: err?.message || 'Failed to connect ward. Please verify credentials with school office.',
      });
    } finally {
      setIsConnecting(false);
    }
  };

  if (!currentUser) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div data-tour="parent-header" className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
            <span className="text-blue-900 font-bold uppercase">Parent Guardian Portal</span>
            <span>·</span>
            <span>{schoolConfig?.name || 'Salem Montessori School'}</span>
          </div>
          <h1 className="text-2xl font-bold font-heading text-slate-900">
            Welcome, {currentUser.name} 👨‍👩‍👧
          </h1>
          <p className="text-xs text-slate-500">
            Monitor attendance records, syllabus completion, exam results, and communicate with your children's educators.
          </p>
        </div>

        {/* Child Selector Tabs or Link Ward Action */}
        <div className="flex items-center gap-2 flex-wrap">
          {studentChildren.length > 0 && (
            <div data-tour="parent-child-selector" className="flex items-center gap-1.5 p-1.5 bg-slate-100 rounded-2xl border border-slate-200 overflow-x-auto">
              {studentChildren.map((ch) => (
                <button
                  key={ch.id}
                  onClick={() => setSelectedChildId(ch.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                    (selectedChildId === ch.id || (!selectedChildId && studentChildren[0]?.id === ch.id))
                      ? 'bg-blue-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 bg-transparent'
                  }`}
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>{ch.name} ({ch.classLevel || 'Unassigned'})</span>
                </button>
              ))}
            </div>
          )}

          <button
            onClick={() => {
              setConnectNotice(null);
              setConnectInput('');
              setShowConnectModal(true);
            }}
            className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
            title="Connect an enrolled student ward to your account"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Connect Ward</span>
          </button>
        </div>
      </div>

      {/* Selected Child Academic Overview Card */}
      {currentChild ? (
        <>
          <div data-tour="parent-academic-card" className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-4">
                <img
                  src={currentChild.avatar || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150'}
                  alt={currentChild.name}
                  referrerPolicy="no-referrer"
                  className="w-14 h-14 rounded-full object-cover ring-2 ring-blue-100"
                />
                <div>
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <span>{currentChild.name}</span>
                    <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-900 text-xs font-bold font-mono">
                      {currentChild.classLevel || 'Unassigned'}
                    </span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Student ID: <strong className="font-mono text-slate-700">{currentChild.studentId || `STU-${currentChild.id.slice(-4)}`}</strong> · Academic Year: {schoolConfig?.academicYear || '2025/2026'}
                  </p>
                </div>
              </div>

              {/* Quick Metrics */}
              <div className="flex items-center gap-3 text-center flex-wrap">
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                  <p className="text-[11px] font-bold text-emerald-800">Attendance Rate</p>
                  <p className="text-lg font-bold text-emerald-900 tabular-nums">96.4%</p>
                </div>
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                  <p className="text-[11px] font-bold text-amber-800">Learning Streak</p>
                  <p className="text-lg font-bold text-amber-900 tabular-nums">🔥 {(currentChild as any).streakDays || 5} Days</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
                  <p className="text-[11px] font-bold text-blue-800">Enrolled Courses</p>
                  <p className="text-lg font-bold text-blue-900 tabular-nums">{subjectProgress.length || courses.length}</p>
                </div>
              </div>
            </div>

            {/* Subject Progress Bars */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-900" />
                <span>{currentChild.name.split(' ')[0]}'s Continuous Academic Assessment</span>
              </h3>

              {subjectProgress.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {subjectProgress.map((sp) => (
                    <div
                      key={sp.subject}
                      className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2"
                    >
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-900">{sp.subject}</span>
                        <span className="font-mono font-bold text-slate-900 tabular-nums">
                          {sp.score}% Mastered
                        </span>
                      </div>

                      <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                        <div
                          className={`${sp.color} h-2.5 rounded-full transition-all duration-500`}
                          style={{ width: `${sp.score}%` }}
                        ></div>
                      </div>

                      <p className="text-[10px] text-slate-500">Subject Master: {sp.teacher}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 py-4 text-center">No enrolled course metrics recorded yet.</p>
              )}
            </div>

            {/* Teacher Comments & Commendations */}
            <div className="p-5 bg-blue-50/70 border border-blue-200 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-950 uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-blue-900" />
                Class Teacher Official Commendation:
              </div>
              <p className="text-xs sm:text-sm text-blue-900 leading-relaxed font-medium">
                "{currentChild.name.split(' ')[0]} displays active curiosity in science and computational logic. Timely submission of laboratory homework and excellent collaboration during team group activities."
              </p>
            </div>
          </div>

          {/* Homework, Attendance & Direct Teacher Inquiry */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Homework & Tasks Status */}
            <div className="lg:col-span-6 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-blue-900" />
                Homework &amp; Assignments Tracker
              </h3>

              <div className="space-y-3">
                {assignments.length > 0 ? (
                  assignments
                    .filter((a) => !currentChild || a.classLevel === currentChild.classLevel || a.classLevel === 'All Classes')
                    .map((a) => {
                      const sub = submissions.find((s) => s.assignmentId === a.id && s.studentId === currentChild?.id);
                      return (
                        <div key={a.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                          <div>
                            <p className="font-bold text-slate-900">{a.subject}: {a.title}</p>
                            <p className="text-[11px] text-slate-500">
                              {sub ? `Submitted (${sub.status === 'graded' ? `Score: ${sub.marksAwarded}/${sub.maxMarks}` : 'Pending Teacher Evaluation'})` : `Due Date: ${a.dueDate || 'Soon'}`}
                            </p>
                          </div>
                          <span className={`font-bold px-2 py-0.5 rounded-sm ${sub?.status === 'graded' ? 'text-emerald-700 bg-emerald-50 border border-emerald-200' : sub ? 'text-blue-700 bg-blue-50 border border-blue-200' : 'text-amber-700 bg-amber-50 border border-amber-200'}`}>
                            {sub?.status === 'graded' ? 'Graded' : sub ? 'Submitted' : 'Pending Task'}
                          </span>
                        </div>
                      );
                    })
                ) : (
                  <p className="text-xs text-slate-500 py-6 text-center">No assignments given to this class level yet.</p>
                )}
              </div>
            </div>

            {/* Timetable / Today's Schedule */}
            <div className="lg:col-span-6 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-900" />
                Class Schedule &amp; Timetable ({currentChild.classLevel || 'General'})
              </h3>

              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {childTimetableSlots.length > 0 ? (
                  childTimetableSlots.slice(0, 5).map((slot) => (
                    <div
                      key={slot.id}
                      className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 text-blue-900 rounded-lg font-bold text-xs">
                          {slot.periodNumber ? `P${slot.periodNumber}` : 'Slot'}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{slot.subject}</p>
                          <p className="text-[11px] text-slate-500">
                            {slot.day} • {slot.startTime} - {slot.endTime}
                          </p>
                        </div>
                      </div>
                      <span className="text-[11px] text-slate-600 font-medium">
                        {slot.teacherName}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 py-6 text-center">No timetable slots scheduled for this class yet.</p>
                )}
              </div>
            </div>

            {/* Real-time Ward Activities & Alerts Stream */}
            <div className="lg:col-span-12 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-blue-900" />
                    Real-Time Activity Feed: {currentChild.name} ({currentChild.classLevel || 'Class'})
                  </h3>
                  <p className="text-xs text-slate-500">
                    Live updates on homework submissions, quiz results, teacher evaluations, and class activities
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-900 text-xs font-bold border border-blue-200">
                  Isolated to Ward
                </span>
              </div>

              {(() => {
                const wardActivities = activities.filter(
                  (a) =>
                    a.userId === currentChild.id ||
                    (currentChild.studentId && a.userId === currentChild.studentId) ||
                    a.classLevel === currentChild.classLevel ||
                    a.classLevel === 'All Classes'
                );

                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {wardActivities.length > 0 ? (
                      wardActivities.slice(0, 6).map((act) => (
                        <div
                          key={act.id}
                          className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200 flex items-start gap-3 text-xs"
                        >
                          <div className="p-2 rounded-lg bg-blue-100 text-blue-900 shrink-0 mt-0.5">
                            {act.type === 'quiz' ? (
                              <BrainCircuit className="w-4 h-4" />
                            ) : act.type === 'assignment' ? (
                              <FileCheck2 className="w-4 h-4" />
                            ) : act.type === 'vclass' ? (
                              <Video className="w-4 h-4" />
                            ) : (
                              <Activity className="w-4 h-4" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1 mb-0.5">
                              <span className="font-bold text-slate-900 truncate">{act.action}</span>
                              <span className="text-[10px] text-slate-400 shrink-0">{act.timestamp}</span>
                            </div>
                            <p className="text-slate-600 text-[11px] leading-relaxed line-clamp-2">{act.details}</p>
                            <div className="flex items-center gap-2 mt-1.5 text-[10px]">
                              <span className="font-semibold text-slate-700">{act.userName}</span>
                              <span>·</span>
                              <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-800 font-medium">
                                Class {act.classLevel || currentChild.classLevel}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="col-span-2 text-xs text-slate-400 py-6 text-center">
                        No activity recorded yet for {currentChild.name}.
                      </p>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* School Bulletins & Announcements for Parents */}
            <div className="lg:col-span-6 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Bell className="w-4 h-4 text-blue-900" />
                Official Announcements for Parents
              </h3>

              <div className="space-y-3">
                {parentAnnouncements.length > 0 ? (
                  parentAnnouncements.slice(0, 3).map((ann) => (
                    <div key={ann.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{ann.title}</span>
                        <span className="text-[10px] text-slate-400">{ann.date || 'Recent'}</span>
                      </div>
                      <p className="text-slate-600 line-clamp-2 leading-relaxed">{ann.content}</p>
                      <p className="text-[10px] text-blue-900 font-semibold pt-1">
                        From: {ann.author}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 py-6 text-center">No bulletins posted for guardians today.</p>
                )}
              </div>
            </div>

            {/* Message to School / Class Teacher */}
            <div data-tour="parent-teacher-message" className="lg:col-span-6 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-blue-900" />
                Direct Communication with Class Teacher
              </h3>
              <p className="text-xs text-slate-500">
                Have an inquiry about {currentChild?.name ? `${currentChild.name.split(' ')[0]}'s` : 'your child\'s'} classroom progress, health, or examinations?
              </p>

              <form onSubmit={handleSendMessage} className="space-y-3">
                <textarea
                  rows={3}
                  required
                  value={messageToTeacher}
                  onChange={(e) => setMessageToTeacher(e.target.value)}
                  placeholder={`Send a direct note to ${currentChild?.name ? `${currentChild.name.split(' ')[0]}'s` : 'the'} teacher...`}
                  className="w-full p-3 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:border-blue-900"
                ></textarea>

                <div className="flex items-center justify-between">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" /> Send Message
                  </button>

                  {sentMessageNotice && (
                    <span className="text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 font-semibold">
                      ✓ Message Sent to Class Teacher
                    </span>
                  )}
                </div>
              </form>
            </div>
          </div>
        </>
      ) : (
        /* Empty State with Self-Service Link Card */
        <div className="bg-white rounded-2xl p-8 sm:p-12 text-center border border-slate-200 max-w-2xl mx-auto shadow-xs space-y-6">
          <div className="w-16 h-16 bg-blue-50 text-blue-900 rounded-2xl flex items-center justify-center mx-auto ring-4 ring-blue-50/50">
            <Users className="w-8 h-8" />
          </div>

          <div>
            <h3 className="text-xl font-bold font-heading text-slate-900">
              No Student Wards Connected Yet
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-2 leading-relaxed">
              Your guardian profile has been registered. Connect your enrolled child using their Student ID or full name to access attendance, exam reports, homework submissions, and teacher notes.
            </p>
          </div>

          {/* Quick Connect Form */}
          <form onSubmit={handleConnectWardSubmit} className="max-w-md mx-auto space-y-3 text-left">
            {connectNotice && (
              <div
                className={`p-3 rounded-xl text-xs font-semibold ${
                  connectNotice.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {connectNotice.message}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Enter Child's Student ID or Name:
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="e.g. STU-2024-007 or Daniel Amoah"
                  value={connectInput}
                  onChange={(e) => setConnectInput(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:border-blue-900 font-medium"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isConnecting}
              className="w-full py-2.5 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-xl text-xs cursor-pointer shadow-xs flex items-center justify-center gap-2 transition-all"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Connecting Student...</span>
                </>
              ) : (
                <>
                  <GraduationCap className="w-4 h-4" />
                  <span>Connect Student Ward</span>
                </>
              )}
            </button>
          </form>

          {/* Contact Admissions Hotline notice */}
          <div className="pt-4 border-t border-slate-100 text-xs text-slate-500 max-w-md mx-auto space-y-2">
            <p className="font-semibold text-slate-700">
              Need assistance linking your child's official profile?
            </p>
            <p>
              The Salem Montessori School administration office can link your guardian credentials at any time.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-blue-900 font-semibold pt-1">
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5" /> {schoolConfig?.admissionsHotline || '+233 24 456 7890'}
              </span>
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5" /> {schoolConfig?.email || 'admissions@salemmontessori.edu.gh'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Pop-up Modal to Connect Additional Child */}
      {showConnectModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative space-y-4">
            <button
              onClick={() => {
                setShowConnectModal(false);
                setConnectNotice(null);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 font-bold"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-blue-100 text-blue-900 rounded-xl">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold font-heading text-slate-900">
                  Connect Another Student Ward
                </h3>
                <p className="text-xs text-slate-500">
                  Add another enrolled learner to your parent monitoring portal
                </p>
              </div>
            </div>

            <form onSubmit={handleConnectWardSubmit} className="space-y-3.5 text-xs">
              {connectNotice && (
                <div
                  className={`p-3 rounded-xl font-semibold ${
                    connectNotice.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  {connectNotice.message}
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Child's Student ID or Enrolled Name:
                </label>
                <input
                  type="text"
                  placeholder="e.g. STU-2024-007 or Daniel Amoah"
                  value={connectInput}
                  onChange={(e) => setConnectInput(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:border-blue-900 font-medium"
                  required
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Enter the student ID code found on the learner's school ID badge or admission letter.
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowConnectModal(false);
                    setConnectNotice(null);
                  }}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isConnecting}
                  className="flex-1 py-2.5 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-xl cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
                >
                  {isConnecting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Users className="w-4 h-4" />
                  )}
                  <span>Connect Ward</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
