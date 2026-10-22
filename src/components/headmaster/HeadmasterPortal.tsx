import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { LessonNotesApproval } from '../admin/LessonNotesApproval';
import {
  Award,
  ShieldCheck,
  FileText,
  Users,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Building2,
  Calendar,
  BarChart3,
  Bell,
  Check,
  Search,
  BookOpen,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

export const HeadmasterPortal: React.FC = () => {
  const { currentUser, lessonNotes, users, classes, announcements, addAnnouncement, addToast } = useApp();

  const [activeTab, setActiveTab] = useState<'vetting' | 'faculty' | 'announcements' | 'metrics'>('vetting');

  // Announcement modal state
  const [showNoticeModal, setShowNoticeModal] = useState<boolean>(false);
  const [noticeTitle, setNoticeTitle] = useState<string>('');
  const [noticeMessage, setNoticeMessage] = useState<string>('');
  const [noticeTargetClass, setNoticeTargetClass] = useState<string>('All Classes');

  const pendingCount = lessonNotes.filter((n) => n.status === 'submitted').length;
  const approvedCount = lessonNotes.filter((n) => n.status === 'approved').length;
  const revisionCount = lessonNotes.filter((n) => n.status === 'needs_revision').length;

  const handlePostNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeTitle.trim() || !noticeMessage.trim()) {
      addToast('Missing Information', 'Please provide both title and notice message.', 'alert');
      return;
    }
    addAnnouncement({
      title: noticeTitle.trim(),
      content: noticeMessage.trim(),
      priority: 'urgent',
      targetAudience: 'all',
      author: currentUser?.name || 'Rev. Dr. Emmanuel Addo',
    });
    addToast('Official Directive Posted', 'Broadcast dispatched to faculty and school community.', 'success');
    setNoticeTitle('');
    setNoticeMessage('');
    setShowNoticeModal(false);
  };

  const teachersList = users.filter((u) => u.role === 'teacher');

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-20">
      {/* Executive Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white px-6 py-8 shadow-xl border-b border-indigo-900/50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/10">
              <ShieldCheck className="w-9 h-9 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-400/30">
                  Office of the Headmaster & Principal
                </span>
                <span className="text-xs text-indigo-200">ID: {currentUser?.staffId || 'HDM-SALEM-01'}</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight mt-1 font-serif">
                {currentUser?.name || 'Rev. Dr. Emmanuel Addo'}
              </h1>
              <p className="text-sm text-indigo-200 mt-0.5">
                Salem Montessori School Executive Vetting & Academic Governance Portal
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('vetting')}
              className={`px-4 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 transition-all ${
                activeTab === 'vetting'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/20'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <FileText className="w-4 h-4" />
              Lesson Notes Vetting
              {pendingCount > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-xs font-bold bg-rose-600 text-white rounded-full animate-pulse">
                  {pendingCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('faculty')}
              className={`px-4 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 transition-all ${
                activeTab === 'faculty'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/20'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <Users className="w-4 h-4" />
              Faculty Oversight
            </button>
            <button
              onClick={() => setActiveTab('announcements')}
              className={`px-4 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 transition-all ${
                activeTab === 'announcements'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/20'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <Bell className="w-4 h-4" />
              School Directives
            </button>
          </div>
        </div>

        {/* Quick Stats Bar */}
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-indigo-900/50">
          <div className="bg-white/5 rounded-xl p-4 border border-white/10 flex items-center gap-3">
            <div className="p-3 rounded-xl bg-amber-500/20 text-amber-300">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-indigo-200">Pending Review</p>
              <p className="text-xl font-bold text-white">{pendingCount} Submissions</p>
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-4 border border-white/10 flex items-center gap-3">
            <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-300">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-indigo-200">Officially Endorsed</p>
              <p className="text-xl font-bold text-white">{approvedCount} Notes</p>
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-4 border border-white/10 flex items-center gap-3">
            <div className="p-3 rounded-xl bg-amber-600/20 text-amber-400">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-indigo-200">Revision Requested</p>
              <p className="text-xl font-bold text-white">{revisionCount} Notes</p>
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-4 border border-white/10 flex items-center gap-3">
            <div className="p-3 rounded-xl bg-blue-500/20 text-blue-300">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-indigo-200">Active Faculty</p>
              <p className="text-xl font-bold text-white">{teachersList.length} Teachers</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 mt-8">
        {activeTab === 'vetting' && (
          <div className="space-y-6">
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-amber-500 text-slate-950 rounded-xl shadow-md">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 font-serif">
                    Headmaster's Lesson Notes Vetting & Digital Seal Hub
                  </h2>
                  <p className="text-sm text-slate-600 mt-0.5">
                    Review weekly teacher lesson notes prepared under NaCCA standards. Approved notes receive an official digital endorsement seal and stamp code.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowNoticeModal(true)}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-medium text-sm flex items-center gap-2 shadow-md transition-all whitespace-nowrap"
              >
                <Bell className="w-4 h-4 text-amber-400" />
                Broadcast Faculty Notice
              </button>
            </div>

            {/* Embedded Lesson Notes Approval Component */}
            <LessonNotesApproval />
          </div>
        )}

        {activeTab === 'faculty' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900 font-serif">Faculty Roster & Teaching Staff</h2>
                <p className="text-sm text-slate-600">Overview of Salem Montessori teachers and their assigned classes.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teachersList.map((teacher) => {
                const teacherNotes = lessonNotes.filter((n) => n.teacherId === teacher.id);
                const approvedNotesCount = teacherNotes.filter((n) => n.status === 'approved').length;
                return (
                  <div key={teacher.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-4">
                        <img
                          src={teacher.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                          alt={teacher.name}
                          className="w-14 h-14 rounded-2xl object-cover border-2 border-amber-400/50 shadow-md"
                        />
                        <div>
                          <h3 className="font-bold text-slate-900">{teacher.name}</h3>
                          <p className="text-xs text-slate-500 font-mono">{teacher.staffId || 'SALEM-TEA'}</p>
                          <span className="inline-block mt-1 px-2.5 py-0.5 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium">
                            {teacher.classLevel || 'General Faculty'}
                          </span>
                        </div>
                      </div>

                      <div className="mt-6 pt-4 border-t border-slate-100 space-y-2 text-sm text-slate-600">
                        <div className="flex justify-between">
                          <span>Email:</span>
                          <span className="font-medium text-slate-900">{teacher.email}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total Submissions:</span>
                          <span className="font-bold text-indigo-600">{teacherNotes.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Endorsed Notes:</span>
                          <span className="font-bold text-emerald-600">{approvedNotesCount}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Active Staff
                      </span>
                      <span className="text-xs text-slate-500 font-mono">{teacher.phone || '+233 30 222 4455'}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'announcements' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900 font-serif">Headmaster's Official Directives & Broadcasts</h2>
                <p className="text-sm text-slate-600">Issue official circulars and academic guidelines to teachers and staff.</p>
              </div>
              <button
                onClick={() => setShowNoticeModal(true)}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-sm flex items-center gap-2 shadow-md transition-all"
              >
                <Bell className="w-4 h-4" /> Post New Directive
              </button>
            </div>

            <div className="space-y-4">
              {announcements.map((ann) => (
                <div key={ann.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-lg text-xs font-bold uppercase tracking-wider">
                        Headmaster Circular
                      </span>
                      <span className="text-xs text-slate-400">{ann.date}</span>
                    </div>
                    <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg font-medium capitalize">
                      Target: {ann.targetAudience}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">{ann.title}</h3>
                  <p className="text-slate-600 text-sm whitespace-pre-line">{ann.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Broadcast Notice Modal */}
      {showNoticeModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-amber-100 text-amber-800 rounded-2xl">
                  <Bell className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 font-serif">Post Official Headmaster Directive</h3>
                  <p className="text-sm text-slate-500">Dispatches an instant academic notice to all faculty dashboards.</p>
                </div>
              </div>
              <button
                onClick={() => setShowNoticeModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handlePostNotice} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Directive Title
                </label>
                <input
                  type="text"
                  value={noticeTitle}
                  onChange={(e) => setNoticeTitle(e.target.value)}
                  placeholder="e.g., Mandatory Submission Deadline for Week 6 Lesson Notes"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Target Audience
                </label>
                <select
                  value={noticeTargetClass}
                  onChange={(e) => setNoticeTargetClass(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="All Classes">All Teachers & Faculty</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name} Teachers
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Notice Body & Instructions
                </label>
                <textarea
                  rows={5}
                  value={noticeMessage}
                  onChange={(e) => setNoticeMessage(e.target.value)}
                  placeholder="Enter detailed academic guidelines, curriculum reminders, or meeting schedules..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNoticeModal(false)}
                  className="px-5 py-2.5 border border-slate-200 text-slate-700 rounded-xl font-medium text-sm hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-sm shadow-md transition-all"
                >
                  Broadcast Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
