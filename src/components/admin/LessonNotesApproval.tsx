import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { LessonNoteSubmission } from '../../types';
import {
  FileCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Search,
  Filter,
  Eye,
  Award,
  Download,
  FileCode,
  FileDown,
  X,
  Send,
  UserCheck,
  Building,
  RotateCcw,
  Check,
  ThumbsDown,
} from 'lucide-react';

export const LessonNotesApproval: React.FC = () => {
  const {
    currentUser,
    lessonNotes,
    approveLessonNote,
    requestRevisionLessonNote,
    rejectLessonNote,
    classes,
    subjects,
    addToast,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterClass, setFilterClass] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedNote, setSelectedNote] = useState<LessonNoteSubmission | null>(null);

  // Review modal form state
  const [reviewAction, setReviewAction] = useState<'approve' | 'revise' | 'reject'>('approve');
  const [reviewerRemarks, setReviewerRemarks] = useState<string>('');
  const [customEndorsementName, setCustomEndorsementName] = useState<string>(
    currentUser?.name || 'Rev. Dr. Emmanuel Addo'
  );

  // Filter submissions
  const filteredSubmissions = lessonNotes.filter((note) => {
    if (filterStatus !== 'all' && note.status !== filterStatus) return false;
    if (filterClass !== 'all' && note.classLevel !== filterClass) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTeacher = note.teacherName.toLowerCase().includes(q);
      const matchSubject = note.subject.toLowerCase().includes(q);
      const matchTopic = note.topic.toLowerCase().includes(q);
      if (!matchTeacher && !matchSubject && !matchTopic) return false;
    }
    return true;
  });

  const pendingCount = lessonNotes.filter((n) => n.status === 'submitted').length;
  const approvedCount = lessonNotes.filter((n) => n.status === 'approved').length;
  const revisionCount = lessonNotes.filter((n) => n.status === 'needs_revision').length;

  const handleOpenReview = (note: LessonNoteSubmission) => {
    setSelectedNote(note);
    setReviewAction(note.status === 'needs_revision' ? 'revise' : 'approve');
    setReviewerRemarks(
      note.status === 'approved'
        ? note.reviewerComments || 'Exemplary lesson preparation aligned with NaCCA standards.'
        : note.reviewerComments || ''
    );
    setCustomEndorsementName(currentUser?.name || 'Rev. Dr. Emmanuel Addo');
  };

  const handleExecuteReview = () => {
    if (!selectedNote) return;

    if (reviewAction === 'approve') {
      approveLessonNote(
        selectedNote.id,
        customEndorsementName || 'Rev. Dr. Emmanuel Addo',
        reviewerRemarks || 'Approved by Headmaster for weekly instruction.'
      );
    } else if (reviewAction === 'revise') {
      if (!reviewerRemarks.trim()) {
        addToast('Feedback Required', 'Please specify what needs to be revised before submitting.', 'alert');
        return;
      }
      requestRevisionLessonNote(
        selectedNote.id,
        customEndorsementName || 'Rev. Dr. Emmanuel Addo',
        reviewerRemarks
      );
    } else if (reviewAction === 'reject') {
      if (!reviewerRemarks.trim()) {
        addToast('Reason Required', 'Please provide a reason for rejecting the lesson note.', 'alert');
        return;
      }
      rejectLessonNote(
        selectedNote.id,
        customEndorsementName || 'Rev. Dr. Emmanuel Addo',
        reviewerRemarks
      );
    }

    setSelectedNote(null);
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Headmaster Academic Authority Banner */}
      <div className="p-6 bg-slate-900 text-white rounded-3xl border border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 text-white flex items-center justify-center font-bold text-lg shadow-md shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                Office of the Headmaster &amp; Academic Director
              </span>
              <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                Official Certification
              </span>
            </div>
            <h2 className="text-xl font-bold font-heading text-white mt-0.5">
              Lesson Notes Vetting &amp; Endorsement Console
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Review weekly teacher curriculum submissions, verify Ghana NaCCA standards, and issue official school endorsement seals.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-slate-800/80 border border-slate-700/80 px-4 py-2.5 rounded-2xl shrink-0">
          <img
            src={currentUser?.avatar || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150'}
            alt="Headmaster"
            referrerPolicy="no-referrer"
            className="w-10 h-10 rounded-full object-cover ring-2 ring-amber-500/50"
          />
          <div>
            <p className="text-xs font-bold text-white leading-tight">
              {currentUser?.name || 'Rev. Dr. Emmanuel Addo'}
            </p>
            <p className="text-[10px] text-amber-300/90 font-medium mt-0.5">
              {currentUser?.title || 'Headmaster & Academic Principal'}
            </p>
          </div>
        </div>
      </div>

      {/* KPI Overview Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-white rounded-2xl border border-slate-200">
          <span className="text-[11px] font-semibold text-slate-500">Total Submissions</span>
          <p className="text-2xl font-bold font-mono text-slate-900 mt-1">{lessonNotes.length}</p>
          <span className="text-[10px] text-slate-400">All faculty records</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200">
          <span className="text-[11px] font-semibold text-amber-600 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>Awaiting Review</span>
          </span>
          <p className="text-2xl font-bold font-mono text-amber-700 mt-1">{pendingCount}</p>
          <span className="text-[10px] text-slate-400">Pending Headmaster sign-off</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200">
          <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Endorsed with Seal</span>
          </span>
          <p className="text-2xl font-bold font-mono text-emerald-700 mt-1">{approvedCount}</p>
          <span className="text-[10px] text-slate-400">Certified for instruction</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200">
          <span className="text-[11px] font-semibold text-rose-600 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Revision Required</span>
          </span>
          <p className="text-2xl font-bold font-mono text-rose-700 mt-1">{revisionCount}</p>
          <span className="text-[10px] text-slate-400">Returned with feedback</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search teacher, subject, or topic..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-900 focus:outline-none"
            />
          </div>

          {/* Dropdown Filters */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Class Filter */}
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-900 focus:outline-none"
            >
              <option value="all">All Classes</option>
              <option value="Basic 7">Basic 7 (JHS 1)</option>
              <option value="Basic 8">Basic 8 (JHS 2)</option>
              <option value="Basic 9">Basic 9 (JHS 3)</option>
              <option value="Basic 4">Basic 4</option>
              <option value="Basic 5">Basic 5</option>
              <option value="Basic 6">Basic 6</option>
            </select>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-900 focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="submitted">Pending Review</option>
              <option value="approved">Approved</option>
              <option value="needs_revision">Needs Revision</option>
              <option value="rejected">Rejected</option>
              <option value="draft">Drafts</option>
            </select>
          </div>
        </div>
      </div>

      {/* Submissions Review Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Faculty / Teacher</th>
                <th className="py-3 px-4">Class &amp; Subject</th>
                <th className="py-3 px-4">Week &amp; Topic</th>
                <th className="py-3 px-4">Documents</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Submitted</th>
                <th className="py-3 px-4 text-right">Review Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSubmissions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <FileCheck className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-medium text-slate-700">No Lesson Notes Found</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      No submissions matching the selected filters.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredSubmissions.map((note) => {
                  const isApproved = note.status === 'approved';
                  const isNeedsRevision = note.status === 'needs_revision';
                  const isSubmitted = note.status === 'submitted';
                  const isDraft = note.status === 'draft';

                  return (
                    <tr key={note.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Teacher */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={
                              note.teacherAvatar ||
                              'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
                            }
                            alt={note.teacherName}
                            referrerPolicy="no-referrer"
                            className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200 shrink-0"
                          />
                          <div>
                            <p className="font-bold text-slate-900 leading-tight">{note.teacherName}</p>
                            <p className="text-[10px] text-slate-400 font-mono">
                              {note.teacherId || 'Faculty'}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Class & Subject */}
                      <td className="py-3 px-4">
                        <span className="font-bold text-blue-900 block">{note.classLevel}</span>
                        <span className="text-slate-500 text-[11px]">{note.subject}</span>
                      </td>

                      {/* Week & Topic */}
                      <td className="py-3 px-4 max-w-xs">
                        <span className="text-[10px] font-mono text-slate-500 font-bold block">
                          Week {note.weekNumber} · {note.term}
                        </span>
                        <p className="font-bold text-slate-900 truncate leading-snug">{note.topic}</p>
                      </td>

                      {/* Documents / Attachments */}
                      <td className="py-3 px-4">
                        {note.attachments && note.attachments.length > 0 ? (
                          <div className="flex items-center gap-1.5">
                            {note.attachments.some(
                              (a) =>
                                a.type.includes('word') ||
                                a.name.endsWith('.docx') ||
                                a.name.endsWith('.doc')
                            ) && (
                              <span
                                className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-800 font-mono text-[10px] font-bold flex items-center gap-1"
                                title="Microsoft Word Attachment"
                              >
                                <FileCode className="w-3 h-3 text-blue-700" />
                                <span>DOCX</span>
                              </span>
                            )}
                            {note.attachments.some((a) => a.name.endsWith('.pdf')) && (
                              <span
                                className="px-1.5 py-0.5 rounded bg-rose-50 text-rose-800 font-mono text-[10px] font-bold flex items-center gap-1"
                                title="Adobe PDF Attachment"
                              >
                                <FileDown className="w-3 h-3 text-rose-700" />
                                <span>PDF</span>
                              </span>
                            )}
                            <span className="text-[10px] text-slate-400">({note.attachments.length})</span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">Form only</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        {isApproved && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Approved</span>
                          </span>
                        )}
                        {isNeedsRevision && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full">
                            <AlertTriangle className="w-3 h-3 text-rose-600" />
                            <span>Needs Revision</span>
                          </span>
                        )}
                        {isSubmitted && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
                            <Clock className="w-3 h-3 text-amber-600" />
                            <span>Pending Review</span>
                          </span>
                        )}
                        {isDraft && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full">
                            <span>Draft</span>
                          </span>
                        )}
                      </td>

                      {/* Submission Date */}
                      <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">
                        {note.submittedAt ? note.submittedAt.slice(0, 10) : note.createdAt.slice(0, 10)}
                      </td>

                      {/* Review Button */}
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleOpenReview(note)}
                          className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all shadow-2xs flex items-center gap-1.5 ml-auto cursor-pointer ${
                            isSubmitted
                              ? 'bg-amber-600 hover:bg-amber-700 text-white animate-pulse-slow'
                              : isApproved
                              ? 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                              : 'bg-blue-900 hover:bg-blue-800 text-white'
                          }`}
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>{isSubmitted ? 'Inspect & Vetting' : 'Review Plan'}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* =====================================================================
          MODAL: HEADMASTER INSPECTION, VETTING & ENDORSEMENT DRAWER
      ===================================================================== */}
      {selectedNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs" onClick={() => setSelectedNote(null)} />
          <div className="relative z-50 w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-left my-auto animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                      Headmaster Lesson Note Vetting
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">Week {selectedNote.weekNumber}</span>
                  </div>
                  <h3 className="text-base font-bold font-heading">{selectedNote.topic}</h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedNote(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 overflow-y-auto text-xs text-slate-700">
              {/* Teacher & Curriculum Summary Strip */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <span className="text-slate-400 font-medium block text-[10px]">Submitted By</span>
                  <p className="font-bold text-slate-900 text-xs">{selectedNote.teacherName}</p>
                  <span className="text-slate-500 text-[10px] font-mono">{selectedNote.teacherId}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block text-[10px]">Subject &amp; Class</span>
                  <p className="font-bold text-blue-900 text-xs">{selectedNote.classLevel}</p>
                  <span className="text-slate-600 text-[11px]">{selectedNote.subject}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block text-[10px]">Instruction Dates</span>
                  <p className="font-mono text-slate-800 text-xs">
                    {selectedNote.startDate} to {selectedNote.endDate}
                  </p>
                  <span className="text-slate-500 text-[10px]">Term {selectedNote.term}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block text-[10px]">Current Status</span>
                  <span
                    className={`inline-block font-bold px-2 py-0.5 rounded text-[10px] uppercase tracking-wider mt-0.5 ${
                      selectedNote.status === 'approved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : selectedNote.status === 'needs_revision'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {selectedNote.status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Existing Endorsement Certificate if already approved */}
              {selectedNote.status === 'approved' && selectedNote.principalEndorsement && (
                <div className="p-4 bg-emerald-50 border-2 border-emerald-300 rounded-2xl flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full border-2 border-emerald-600 flex items-center justify-center bg-white text-emerald-700 shrink-0 font-heading font-black text-xs text-center p-1 leading-none shadow-xs">
                    OFFICIAL SEAL
                  </div>
                  <div className="flex-1 text-xs">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-emerald-950 text-sm">
                        Approved &amp; Certified by Headmaster
                      </h4>
                      <span className="font-mono text-xs font-bold text-emerald-800 bg-white px-2 py-0.5 rounded border border-emerald-200">
                        {selectedNote.principalEndorsement.endorsementCode}
                      </span>
                    </div>
                    <p className="text-emerald-900 mt-1 italic leading-relaxed">
                      "{selectedNote.reviewerComments}"
                    </p>
                    <div className="mt-2 text-[10px] text-emerald-700 flex items-center justify-between border-t border-emerald-200 pt-1.5">
                      <span>Endorsed by: {selectedNote.principalEndorsement.headmasterName}</span>
                      <span>Date: {selectedNote.principalEndorsement.date}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Ghana NaCCA Standards Breakdown */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider">
                  Ghana NaCCA Curriculum Alignment
                </h4>
                <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-2 text-xs">
                  <div>
                    <span className="font-bold text-slate-700">Strand: </span>
                    <span className="text-slate-900">{selectedNote.strand || 'General Strand'}</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-700">Sub-Strand: </span>
                    <span className="text-slate-900">{selectedNote.subStrand || 'Applied Practice'}</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-700">Content Standard (CS): </span>
                    <span className="text-slate-900 font-medium">
                      {selectedNote.contentStandard || 'NaCCA standard code'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Performance Indicators */}
              {selectedNote.indicators && selectedNote.indicators.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                    Performance Indicators &amp; Objectives
                  </span>
                  <ul className="list-disc pl-5 space-y-1 text-slate-700 text-xs">
                    {selectedNote.indicators.map((ind, i) => (
                      <li key={i}>{ind}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 3-Phase Teaching Sequence */}
              <div className="space-y-3 pt-2 border-t border-slate-200">
                <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider">
                  Instructional Execution Phases
                </h4>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <span className="font-bold text-blue-950 block">Phase 1: Starter (Hook &amp; Diagnostic Question)</span>
                  <p className="whitespace-pre-line text-slate-700 leading-relaxed">
                    {selectedNote.phase1Starter || 'No starter description.'}
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <span className="font-bold text-blue-950 block">
                    Phase 2: Main Teaching &amp; Learning Activities (Montessori Tactile Scaffolding)
                  </span>
                  <p className="whitespace-pre-line text-slate-700 leading-relaxed">
                    {selectedNote.phase2MainActivities || 'No main activities description.'}
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <span className="font-bold text-blue-950 block">Phase 3: Reflection, Plenary &amp; Assessment</span>
                  <p className="whitespace-pre-line text-slate-700 leading-relaxed">
                    {selectedNote.phase3Reflection || 'No reflection description.'}
                  </p>
                </div>
              </div>

              {/* Attached Word or PDF Documents */}
              {selectedNote.attachments && selectedNote.attachments.length > 0 && (
                <div className="pt-2 border-t border-slate-200 space-y-2">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Attached Lesson Documents ({selectedNote.attachments.length})
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedNote.attachments.map((att) => {
                      const isDoc =
                        att.type.includes('word') ||
                        att.name.endsWith('.docx') ||
                        att.name.endsWith('.doc');
                      return (
                        <div
                          key={att.id}
                          className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-3 shadow-2xs"
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            {isDoc ? (
                              <FileCode className="w-5 h-5 text-blue-700 shrink-0" />
                            ) : (
                              <FileDown className="w-5 h-5 text-rose-600 shrink-0" />
                            )}
                            <div className="truncate">
                              <p className="font-bold text-slate-900 truncate">{att.name}</p>
                              <span className="text-[10px] text-slate-400 font-mono">
                                {formatBytes(att.size)} · Uploaded {att.uploadedAt}
                              </span>
                            </div>
                          </div>
                          <a
                            href={att.dataUrl}
                            download={att.name}
                            className="px-3 py-1.5 text-xs font-bold text-blue-900 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors flex items-center gap-1 shrink-0"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Download</span>
                          </a>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* =====================================================================
                  HEADMASTER DECISION GATEWAY (APPROVE / REVISE / REJECT)
              ===================================================================== */}
              <div className="pt-4 border-t-2 border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-blue-900" />
                    <span>Headmaster Review Verdict &amp; Administrative Seal</span>
                  </h4>
                  <span className="text-[11px] text-slate-500">Sign-off as {customEndorsementName}</span>
                </div>

                {/* Verdict Choice Buttons */}
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setReviewAction('approve')}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      reviewAction === 'approve'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold ring-2 ring-emerald-500/20'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
                    <span className="text-xs">Approve &amp; Endorse</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setReviewAction('revise')}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      reviewAction === 'revise'
                        ? 'bg-amber-50 border-amber-500 text-amber-950 font-bold ring-2 ring-amber-500/20'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <RotateCcw className="w-4 h-4 text-amber-600 mx-auto mb-1" />
                    <span className="text-xs">Request Revision</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setReviewAction('reject')}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      reviewAction === 'reject'
                        ? 'bg-rose-50 border-rose-500 text-rose-950 font-bold ring-2 ring-rose-500/20'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <ThumbsDown className="w-4 h-4 text-rose-600 mx-auto mb-1" />
                    <span className="text-xs">Reject Note</span>
                  </button>
                </div>

                {/* Reviewer Remarks Textarea */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    {reviewAction === 'approve'
                      ? 'Headmaster Commendations & Notes (Optional)'
                      : reviewAction === 'revise'
                      ? 'Instructions & Revision Guidance for Teacher *'
                      : 'Reason for Rejection *'}
                  </label>
                  <textarea
                    rows={3}
                    placeholder={
                      reviewAction === 'approve'
                        ? 'e.g. Well organized lesson plan with clear Montessori tactile links. Approved for instruction.'
                        : reviewAction === 'revise'
                        ? 'e.g. Mr. Mensah, please expand Phase 2 with more differentiated support for struggling students before Monday.'
                        : 'e.g. The objectives do not align with the prescribed NaCCA syllabus strand.'
                    }
                    value={reviewerRemarks}
                    onChange={(e) => setReviewerRemarks(e.target.value)}
                    className="w-full p-3 text-xs bg-white border border-slate-300 rounded-xl focus:border-blue-900 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
              <button
                type="button"
                onClick={() => setSelectedNote(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleExecuteReview}
                className={`px-5 py-2 text-xs font-bold text-white rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer ${
                  reviewAction === 'approve'
                    ? 'bg-emerald-700 hover:bg-emerald-800'
                    : reviewAction === 'revise'
                    ? 'bg-amber-600 hover:bg-amber-700'
                    : 'bg-rose-700 hover:bg-rose-800'
                }`}
              >
                {reviewAction === 'approve' ? (
                  <>
                    <Award className="w-4 h-4" />
                    <span>Apply Official Headmaster Endorsement</span>
                  </>
                ) : reviewAction === 'revise' ? (
                  <>
                    <RotateCcw className="w-4 h-4" />
                    <span>Dispatch Revision Feedback</span>
                  </>
                ) : (
                  <>
                    <ThumbsDown className="w-4 h-4" />
                    <span>Confirm Rejection</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
