import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { LessonNoteSubmission, LessonNoteAttachment } from '../../types';
import { generateLessonPlanWithAI } from '../../utils/geminiLessonPlanner';
import {
  FileText,
  Sparkles,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Eye,
  Plus,
  Trash2,
  FileCheck,
  Send,
  Download,
  FileDown,
  Layers,
  BookOpen,
  HelpCircle,
  X,
  FileCode,
  Award,
} from 'lucide-react';

export const LessonNotesStudio: React.FC = () => {
  const {
    currentUser,
    lessonNotes,
    addLessonNote,
    updateLessonNote,
    deleteLessonNote,
    submitLessonNote,
    classes,
    subjects,
    addToast,
  } = useApp();

  const [activeView, setActiveView] = useState<'list' | 'editor'>('list');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [previewingNote, setPreviewingNote] = useState<LessonNoteSubmission | null>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState<boolean>(false);
  const [showAiModal, setShowAiModal] = useState<boolean>(false);

  // AI Prompt State
  const [aiPromptTopic, setAiPromptTopic] = useState<string>('');
  const [aiPromptSubject, setAiPromptSubject] = useState<string>('Computing & ICT');
  const [aiPromptClass, setAiPromptClass] = useState<string>('Basic 7');
  const [aiPromptWeek, setAiPromptWeek] = useState<number>(4);
  const [aiPromptFocus, setAiPromptFocus] = useState<string>('');

  // Form State
  const [formData, setFormData] = useState({
    subject: 'Computing & ICT',
    classLevel: 'Basic 7',
    weekNumber: 4,
    term: 'Term 1' as 'Term 1' | 'Term 2' | 'Term 3',
    academicYear: '2026/2027',
    startDate: '2026-10-26',
    endDate: '2026-10-30',
    topic: '',
    strand: '',
    subStrand: '',
    contentStandard: '',
    indicators: [''],
    coreCompetencies: ['Digital Literacy (DL)', 'Critical Thinking and Problem Solving (CP)'],
    learningMaterials: ['Salem VClass Interactive Lab', 'Approved NaCCA Course Guide'],
    phase1Starter: '',
    phase2MainActivities: '',
    phase3Reflection: '',
    assessmentRemarks: '',
    attachments: [] as LessonNoteAttachment[],
  });

  // Filter notes belonging to current teacher
  const teacherNotes = lessonNotes.filter((n) =>
    currentUser?.role === 'admin' ? true : n.teacherId === currentUser?.id || n.teacherName === currentUser?.name
  );

  const filteredNotes = teacherNotes.filter((n) => {
    if (filterStatus === 'all') return true;
    return n.status === filterStatus;
  });

  const handleOpenNewNote = () => {
    setEditingNoteId(null);
    const teacherSub = currentUser?.assignedSubjects?.[0] || 'Computing & ICT';
    const teacherCls = currentUser?.assignedClasses?.[0] || 'Basic 7';

    setFormData({
      subject: teacherSub,
      classLevel: teacherCls,
      weekNumber: 4,
      term: 'Term 1',
      academicYear: '2026/2027',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
      topic: '',
      strand: '',
      subStrand: '',
      contentStandard: '',
      indicators: [''],
      coreCompetencies: ['Critical Thinking and Problem Solving (CP)', 'Digital Literacy (DL)'],
      learningMaterials: ['Salem VClass Digital Lab', 'Approved NaCCA Course Companion'],
      phase1Starter: '',
      phase2MainActivities: '',
      phase3Reflection: '',
      assessmentRemarks: '',
      attachments: [],
    });
    setAiPromptSubject(teacherSub);
    setAiPromptClass(teacherCls);
    setActiveView('editor');
  };

  const handleEditNote = (note: LessonNoteSubmission) => {
    setEditingNoteId(note.id);
    setFormData({
      subject: note.subject,
      classLevel: note.classLevel,
      weekNumber: note.weekNumber,
      term: note.term,
      academicYear: note.academicYear,
      startDate: note.startDate,
      endDate: note.endDate,
      topic: note.topic,
      strand: note.strand,
      subStrand: note.subStrand,
      contentStandard: note.contentStandard,
      indicators: note.indicators.length > 0 ? note.indicators : [''],
      coreCompetencies: note.coreCompetencies.length > 0 ? note.coreCompetencies : [],
      learningMaterials: note.learningMaterials.length > 0 ? note.learningMaterials : [],
      phase1Starter: note.phase1Starter,
      phase2MainActivities: note.phase2MainActivities,
      phase3Reflection: note.phase3Reflection,
      assessmentRemarks: note.assessmentRemarks,
      attachments: note.attachments || [],
    });
    setActiveView('editor');
  };

  // Document Upload Handler (Word & PDF)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      // Validate file format (Word or PDF)
      const isWord = file.name.endsWith('.doc') || file.name.endsWith('.docx') || file.type.includes('word');
      const isPdf = file.name.endsWith('.pdf') || file.type.includes('pdf');

      if (!isWord && !isPdf) {
        addToast('Invalid File Type', 'Please upload Microsoft Word (.doc, .docx) or PDF (.pdf) documents.', 'alert');
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        const newAttachment: LessonNoteAttachment = {
          id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          name: file.name,
          size: file.size,
          type: file.type || (isPdf ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'),
          dataUrl,
          uploadedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
        };

        setFormData((prev) => ({
          ...prev,
          attachments: [...prev.attachments, newAttachment],
        }));
        addToast('File Attached', `Attached "${file.name}" to lesson note.`, 'success');
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const handleRemoveAttachment = (attId: string) => {
    setFormData((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((a) => a.id !== attId),
    }));
  };

  // AI Generation Trigger
  const handleGenerateWithAI = async () => {
    if (!aiPromptTopic.trim()) {
      addToast('Topic Required', 'Please enter a lesson topic for Gemini to draft.', 'alert');
      return;
    }

    setIsGeneratingAI(true);
    try {
      const generated = await generateLessonPlanWithAI({
        subject: aiPromptSubject,
        classLevel: aiPromptClass,
        weekNumber: aiPromptWeek,
        topic: aiPromptTopic.trim(),
        curriculumFocus: aiPromptFocus.trim(),
      });

      setFormData((prev) => ({
        ...prev,
        subject: aiPromptSubject,
        classLevel: aiPromptClass,
        weekNumber: aiPromptWeek,
        topic: generated.topic || aiPromptTopic,
        strand: generated.strand,
        subStrand: generated.subStrand,
        contentStandard: generated.contentStandard,
        indicators: generated.indicators && generated.indicators.length > 0 ? generated.indicators : prev.indicators,
        coreCompetencies: generated.coreCompetencies && generated.coreCompetencies.length > 0 ? generated.coreCompetencies : prev.coreCompetencies,
        learningMaterials: generated.learningMaterials && generated.learningMaterials.length > 0 ? generated.learningMaterials : prev.learningMaterials,
        phase1Starter: generated.phase1Starter,
        phase2MainActivities: generated.phase2MainActivities,
        phase3Reflection: generated.phase3Reflection,
        assessmentRemarks: generated.assessmentRemarks,
      }));

      setShowAiModal(false);
      addToast('NaCCA Lesson Draft Generated', 'Structured lesson plan generated successfully with Gemini AI.', 'success');
    } catch (err: any) {
      addToast('Generation Failed', err?.message || 'Could not draft note.', 'alert');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Save as Draft
  const handleSaveDraft = () => {
    if (!formData.topic.trim()) {
      addToast('Topic Required', 'Please provide a topic title before saving.', 'alert');
      return;
    }

    if (editingNoteId) {
      updateLessonNote(editingNoteId, {
        ...formData,
        indicators: formData.indicators.filter((i) => i.trim()),
        coreCompetencies: formData.coreCompetencies.filter((c) => c.trim()),
        learningMaterials: formData.learningMaterials.filter((m) => m.trim()),
        status: 'draft',
      });
    } else {
      addLessonNote({
        teacherId: currentUser?.id || 'user-tea-mensah',
        teacherName: currentUser?.name || 'Mr. Kwame Mensah',
        teacherAvatar: currentUser?.avatar,
        ...formData,
        indicators: formData.indicators.filter((i) => i.trim()),
        coreCompetencies: formData.coreCompetencies.filter((c) => c.trim()),
        learningMaterials: formData.learningMaterials.filter((m) => m.trim()),
        status: 'draft',
      });
    }
    setActiveView('list');
  };

  // Submit to Headmaster
  const handleSubmitToHeadmaster = () => {
    if (!formData.topic.trim()) {
      addToast('Topic Required', 'Please provide a topic title before submitting.', 'alert');
      return;
    }

    if (editingNoteId) {
      updateLessonNote(editingNoteId, {
        ...formData,
        indicators: formData.indicators.filter((i) => i.trim()),
        coreCompetencies: formData.coreCompetencies.filter((c) => c.trim()),
        learningMaterials: formData.learningMaterials.filter((m) => m.trim()),
      });
      submitLessonNote(editingNoteId);
    } else {
      const created = addLessonNote({
        teacherId: currentUser?.id || 'user-tea-mensah',
        teacherName: currentUser?.name || 'Mr. Kwame Mensah',
        teacherAvatar: currentUser?.avatar,
        ...formData,
        indicators: formData.indicators.filter((i) => i.trim()),
        coreCompetencies: formData.coreCompetencies.filter((c) => c.trim()),
        learningMaterials: formData.learningMaterials.filter((m) => m.trim()),
        status: 'draft',
      });
      submitLessonNote(created.id);
    }
    setActiveView('list');
  };

  // Helper formatting for file size
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold font-heading text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-900" />
            <span>Lesson Notes & AI Curriculum Planner</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Ghana NaCCA & Montessori standards-based weekly lesson preparation, Word/PDF file attachments, and Headmaster approval tracking.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {activeView === 'list' ? (
            <>
              <button
                type="button"
                onClick={() => {
                  setAiPromptTopic('');
                  setShowAiModal(true);
                }}
                className="px-3.5 py-2 text-xs font-semibold text-purple-900 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                <span>AI Lesson Generator</span>
              </button>

              <button
                type="button"
                onClick={handleOpenNewNote}
                className="px-3.5 py-2 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-xl transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>New Lesson Note</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setActiveView('list')}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              Back to Submissions
            </button>
          )}
        </div>
      </div>

      {/* =====================================================================
          VIEW 1: SUBMISSIONS LIST & STATUS DASHBOARD
      ===================================================================== */}
      {activeView === 'list' && (
        <div className="space-y-6">
          {/* Status Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 bg-white rounded-2xl border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500">Total Notes</span>
              <p className="text-2xl font-bold font-mono text-slate-900 mt-1">{teacherNotes.length}</p>
              <span className="text-[10px] text-slate-400">All terms recorded</span>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200">
              <span className="text-[11px] font-semibold text-amber-600 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>Pending Approval</span>
              </span>
              <p className="text-2xl font-bold font-mono text-amber-700 mt-1">
                {teacherNotes.filter((n) => n.status === 'submitted').length}
              </p>
              <span className="text-[10px] text-slate-400">Awaiting Headmaster</span>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200">
              <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Approved & Endorsed</span>
              </span>
              <p className="text-2xl font-bold font-mono text-emerald-700 mt-1">
                {teacherNotes.filter((n) => n.status === 'approved').length}
              </p>
              <span className="text-[10px] text-slate-400">Certified with seal</span>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200">
              <span className="text-[11px] font-semibold text-rose-600 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Action / Revision</span>
              </span>
              <p className="text-2xl font-bold font-mono text-rose-700 mt-1">
                {teacherNotes.filter((n) => n.status === 'needs_revision').length}
              </p>
              <span className="text-[10px] text-slate-400">Feedback provided</span>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white rounded-xl border border-slate-200">
            <div className="flex items-center gap-1 overflow-x-auto py-1">
              {[
                { id: 'all', label: 'All Notes' },
                { id: 'submitted', label: 'Pending Review' },
                { id: 'approved', label: 'Approved' },
                { id: 'needs_revision', label: 'Needs Revision' },
                { id: 'draft', label: 'Drafts' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFilterStatus(tab.id)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                    filterStatus === tab.id
                      ? 'bg-blue-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <span className="text-xs text-slate-500 font-medium">
              Showing {filteredNotes.length} of {teacherNotes.length} notes
            </span>
          </div>

          {/* Notes Cards Grid */}
          {filteredNotes.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8">
              <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">No Lesson Notes Found</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-5">
                Prepare your weekly lesson plan according to the Ghana NaCCA syllabus and submit to the Headmaster for official review.
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowAiModal(true)}
                  className="px-4 py-2 text-xs font-semibold text-purple-900 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  <span>Draft with Gemini AI</span>
                </button>
                <button
                  type="button"
                  onClick={handleOpenNewNote}
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-xl transition-colors cursor-pointer"
                >
                  Create Manually
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredNotes.map((note) => {
                const isApproved = note.status === 'approved';
                const isNeedsRevision = note.status === 'needs_revision';
                const isSubmitted = note.status === 'submitted';
                const isDraft = note.status === 'draft';

                return (
                  <div
                    key={note.id}
                    className="p-5 bg-white rounded-2xl border border-slate-200 hover:border-slate-300 transition-all shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Metadata Strip */}
                      <div className="flex items-start justify-between gap-3 mb-2.5">
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <span className="font-bold text-blue-900">{note.classLevel}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-medium text-slate-700">{note.subject}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono text-slate-600">Week {note.weekNumber}</span>
                        </div>

                        {/* Status Label */}
                        <div>
                          {isApproved && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Approved</span>
                            </span>
                          )}
                          {isNeedsRevision && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full">
                              <AlertTriangle className="w-3 h-3 text-rose-600" />
                              <span>Revision Needed</span>
                            </span>
                          )}
                          {isSubmitted && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
                              <Clock className="w-3 h-3 text-amber-600" />
                              <span>Under Review</span>
                            </span>
                          )}
                          {isDraft && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full">
                              <span>Draft</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Topic Title */}
                      <h4 className="text-base font-bold text-slate-900 mb-1 leading-snug">{note.topic}</h4>

                      {/* Strand / Content Standard Preview */}
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-3">
                        {note.contentStandard || note.strand || 'Ghana NaCCA syllabus weekly instruction plan.'}
                      </p>

                      {/* Official Endorsement Stamp Box if Approved */}
                      {isApproved && note.principalEndorsement && (
                        <div className="mb-4 p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl text-xs space-y-1">
                          <div className="flex items-center justify-between text-emerald-900 font-bold">
                            <span className="flex items-center gap-1.5">
                              <Award className="w-4 h-4 text-emerald-700" />
                              <span>Headmaster Endorsement Certified</span>
                            </span>
                            <span className="font-mono text-[10px] text-emerald-700">
                              {note.principalEndorsement.endorsementCode}
                            </span>
                          </div>
                          <p className="text-[11px] text-emerald-800 italic">"{note.reviewerComments}"</p>
                          <div className="text-[10px] text-emerald-700 pt-1 flex items-center justify-between">
                            <span>Signed: {note.principalEndorsement.headmasterName}</span>
                            <span>Date: {note.principalEndorsement.date}</span>
                          </div>
                        </div>
                      )}

                      {/* Review Feedback if Revision Needed */}
                      {isNeedsRevision && note.reviewerComments && (
                        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs space-y-1">
                          <p className="font-bold text-rose-900 flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                            <span>Headmaster Remarks & Instructions:</span>
                          </p>
                          <p className="text-[11px] text-rose-800 leading-relaxed italic">"{note.reviewerComments}"</p>
                        </div>
                      )}

                      {/* Attached Documents Tags */}
                      {note.attachments && note.attachments.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2 mb-4">
                          {note.attachments.map((att) => {
                            const isDoc = att.type.includes('word') || att.name.endsWith('.docx') || att.name.endsWith('.doc');
                            return (
                              <div
                                key={att.id}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-lg text-xs text-slate-700"
                              >
                                {isDoc ? (
                                  <FileCode className="w-3.5 h-3.5 text-blue-700" />
                                ) : (
                                  <FileDown className="w-3.5 h-3.5 text-rose-600" />
                                )}
                                <span className="font-medium truncate max-w-[150px]">{att.name}</span>
                                <span className="text-[10px] text-slate-400">({formatBytes(att.size)})</span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Card Actions Bottom Strip */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <button
                        type="button"
                        onClick={() => setPreviewingNote(note)}
                        className="text-blue-900 hover:text-blue-700 font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect Plan</span>
                      </button>

                      <div className="flex items-center gap-2">
                        {/* Edit Button if not approved */}
                        {!isApproved && (
                          <button
                            type="button"
                            onClick={() => handleEditNote(note)}
                            className="px-2.5 py-1 text-slate-700 hover:bg-slate-100 rounded-lg font-medium transition-colors cursor-pointer"
                          >
                            Edit
                          </button>
                        )}

                        {/* Submit Button if Draft or Needs Revision */}
                        {(isDraft || isNeedsRevision) && (
                          <button
                            type="button"
                            onClick={() => submitLessonNote(note.id)}
                            className="px-3 py-1 bg-blue-900 hover:bg-blue-800 text-white font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <Send className="w-3 h-3" />
                            <span>{isNeedsRevision ? 'Resubmit' : 'Submit'}</span>
                          </button>
                        )}

                        {/* Delete draft */}
                        {isDraft && (
                          <button
                            type="button"
                            onClick={() => deleteLessonNote(note.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                            title="Delete draft"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* =====================================================================
          VIEW 2: LESSON NOTE EDITOR & NaCCA STRUCTURE BUILDER
      ===================================================================== */}
      {activeView === 'editor' && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
          {/* Editor Header Bar */}
          <div className="px-6 py-4 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                Ghana NaCCA & Montessori Curriculum Scheme
              </span>
              <h3 className="text-base font-bold font-heading">
                {editingNoteId ? 'Update Lesson Note' : 'Draft New Weekly Lesson Note'}
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setAiPromptTopic(formData.topic);
                  setShowAiModal(true);
                }}
                className="px-3 py-1.5 text-xs font-semibold text-purple-900 bg-purple-100 hover:bg-purple-200 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-700" />
                <span>Auto-Fill with Gemini AI</span>
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Meta Row 1: Class, Subject, Week, Term */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Class / Grade Level</label>
                <select
                  value={formData.classLevel}
                  onChange={(e) => setFormData({ ...formData, classLevel: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:border-blue-900 focus:outline-none"
                >
                  <option value="Basic 7">Basic 7 (JHS 1)</option>
                  <option value="Basic 8">Basic 8 (JHS 2)</option>
                  <option value="Basic 9">Basic 9 (JHS 3)</option>
                  <option value="Basic 4">Basic 4</option>
                  <option value="Basic 5">Basic 5</option>
                  <option value="Basic 6">Basic 6</option>
                  <option value="Primary 1">Primary 1</option>
                  <option value="Primary 2">Primary 2</option>
                  <option value="Primary 3">Primary 3</option>
                  <option value="Montessori Nursery">Montessori Nursery</option>
                  <option value="Montessori Kindergarten">Montessori Kindergarten</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Subject</label>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:border-blue-900 focus:outline-none"
                >
                  <option value="Computing & ICT">Computing &amp; ICT</option>
                  <option value="Integrated Science">Integrated Science</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="English Language">English Language</option>
                  <option value="Social Studies">Social Studies</option>
                  <option value="Religious & Moral Education">Religious &amp; Moral Education</option>
                  <option value="French">French</option>
                  <option value="Career Technology">Career Technology</option>
                  <option value="Creative Arts & Design">Creative Arts &amp; Design</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Instructional Week</label>
                <input
                  type="number"
                  min={1}
                  max={16}
                  value={formData.weekNumber}
                  onChange={(e) => setFormData({ ...formData, weekNumber: parseInt(e.target.value, 10) || 1 })}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:border-blue-900 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Academic Term</label>
                <select
                  value={formData.term}
                  onChange={(e) => setFormData({ ...formData, term: e.target.value as any })}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:border-blue-900 focus:outline-none"
                >
                  <option value="Term 1">Term 1 (First Term)</option>
                  <option value="Term 2">Term 2 (Second Term)</option>
                  <option value="Term 3">Term 3 (Third Term)</option>
                </select>
              </div>
            </div>

            {/* Topic & Strand */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Lesson Topic *</label>
                <input
                  type="text"
                  placeholder="e.g. Introduction to Computer Software & Operating Systems"
                  value={formData.topic}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:border-blue-900 focus:outline-none font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">NaCCA Strand</label>
                <input
                  type="text"
                  placeholder="e.g. Computing Systems"
                  value={formData.strand}
                  onChange={(e) => setFormData({ ...formData, strand: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:border-blue-900 focus:outline-none"
                />
              </div>
            </div>

            {/* Sub-strand & Content Standard */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Sub-strand</label>
                <input
                  type="text"
                  placeholder="e.g. Operating Systems & System Software"
                  value={formData.subStrand}
                  onChange={(e) => setFormData({ ...formData, subStrand: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:border-blue-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Content Standard (CS)</label>
                <input
                  type="text"
                  placeholder="e.g. B7.1.2.1: Demonstrate understanding of operating systems..."
                  value={formData.contentStandard}
                  onChange={(e) => setFormData({ ...formData, contentStandard: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:border-blue-900 focus:outline-none"
                />
              </div>
            </div>

            {/* Performance Indicators */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Performance Indicators &amp; Behavioral Objectives
                </label>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, indicators: [...formData.indicators, ''] })}
                  className="text-xs text-blue-900 hover:text-blue-700 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" /> Add Indicator
                </button>
              </div>
              <div className="space-y-2">
                {formData.indicators.map((ind, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-slate-400 w-5 text-right">{idx + 1}.</span>
                    <input
                      type="text"
                      placeholder={`Indicator ${idx + 1} (e.g. B7.1.2.1.1: Describe core OS functions)`}
                      value={ind}
                      onChange={(e) => {
                        const next = [...formData.indicators];
                        next[idx] = e.target.value;
                        setFormData({ ...formData, indicators: next });
                      }}
                      className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:border-blue-900 focus:outline-none"
                    />
                    {formData.indicators.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          const next = formData.indicators.filter((_, i) => i !== idx);
                          setFormData({ ...formData, indicators: next });
                        }}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 3-PHASE TEACHING SEQUENCE */}
            <div className="pt-4 border-t border-slate-200 space-y-4">
              <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider">
                Ghana NaCCA 3-Phase Teaching &amp; Learning Flow
              </h4>

              {/* Phase 1 */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Phase 1: Starter (Introduction, Hook &amp; Prior Knowledge)
                </label>
                <textarea
                  rows={2}
                  placeholder="Warm-up activity, guiding diagnostic questions, and activating previous knowledge..."
                  value={formData.phase1Starter}
                  onChange={(e) => setFormData({ ...formData, phase1Starter: e.target.value })}
                  className="w-full p-3 text-xs bg-white border border-slate-300 rounded-xl focus:border-blue-900 focus:outline-none"
                />
              </div>

              {/* Phase 2 */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Phase 2: Main Teaching &amp; Learning Activities (Montessori Tactile &amp; Paired Tasks)
                </label>
                <textarea
                  rows={4}
                  placeholder="Step-by-step teacher facilitation, student group exploration, tactile Montessori aids, and exercises..."
                  value={formData.phase2MainActivities}
                  onChange={(e) => setFormData({ ...formData, phase2MainActivities: e.target.value })}
                  className="w-full p-3 text-xs bg-white border border-slate-300 rounded-xl focus:border-blue-900 focus:outline-none"
                />
              </div>

              {/* Phase 3 */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Phase 3: Reflection, Summary &amp; Plenary
                </label>
                <textarea
                  rows={2}
                  placeholder="Student wrap-up, formative recap questions, homework assignment, and next lesson preview..."
                  value={formData.phase3Reflection}
                  onChange={(e) => setFormData({ ...formData, phase3Reflection: e.target.value })}
                  className="w-full p-3 text-xs bg-white border border-slate-300 rounded-xl focus:border-blue-900 focus:outline-none"
                />
              </div>
            </div>

            {/* DOCUMENT UPLOADER: WORD & PDF */}
            <div className="pt-4 border-t border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Upload className="w-4 h-4 text-blue-900" />
                    <span>Attach Word (.docx, .doc) or PDF (.pdf) Documents</span>
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Upload your formatted school lesson notes, handouts, or slide guides for the Headmaster to inspect.
                  </p>
                </div>
              </div>

              {/* Drop Area */}
              <div className="relative border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-6 text-center transition-colors bg-slate-50/50">
                <input
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/pdf"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center justify-center pointer-events-none">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-900 flex items-center justify-center mb-2">
                    <Upload className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-semibold text-slate-800">
                    Click or Drag and Drop Word &amp; PDF files here
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Supports .docx, .doc, and .pdf documents (Max 10MB per file)
                  </p>
                </div>
              </div>

              {/* Uploaded Files List */}
              {formData.attachments.length > 0 && (
                <div className="mt-3 space-y-2">
                  <span className="text-[11px] font-bold text-slate-700">Attached Files ({formData.attachments.length}):</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {formData.attachments.map((att) => {
                      const isDoc = att.type.includes('word') || att.name.endsWith('.docx') || att.name.endsWith('.doc');
                      return (
                        <div
                          key={att.id}
                          className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-3 shadow-2xs"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                                isDoc ? 'bg-blue-100 text-blue-800' : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {isDoc ? <FileCode className="w-4 h-4" /> : <FileDown className="w-4 h-4" />}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-900 truncate">{att.name}</p>
                              <p className="text-[10px] text-slate-400 font-mono">
                                {formatBytes(att.size)} · {att.uploadedAt}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <a
                              href={att.dataUrl}
                              download={att.name}
                              className="p-1.5 text-slate-500 hover:text-blue-900 hover:bg-slate-100 rounded-lg transition-colors"
                              title="Download document"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </a>
                            <button
                              type="button"
                              onClick={() => handleRemoveAttachment(att.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Remove file"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setActiveView('list')}
                className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  className="flex-1 sm:flex-none px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                >
                  Save as Draft
                </button>

                <button
                  type="button"
                  onClick={handleSubmitToHeadmaster}
                  className="flex-1 sm:flex-none px-5 py-2 text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 rounded-xl transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit to Headmaster</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL: GEMINI AI ASSISTANT PROMPT DIALOG
      ===================================================================== */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs" onClick={() => setShowAiModal(false)} />
          <div className="relative z-50 w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-left animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="px-5 py-4 bg-purple-950 text-white flex items-center justify-between border-b border-purple-900">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold font-heading">AI Lesson Plan Generator</h4>
                  <p className="text-[10px] text-purple-200">Grounded in Ghana NaCCA &amp; Montessori standard curriculum</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAiModal(false)}
                className="p-1 rounded-lg text-purple-300 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Lesson Topic *</label>
                <input
                  type="text"
                  placeholder="e.g. Living Cells, Linear Equations, Software Engineering, or Parts of Speech"
                  value={aiPromptTopic}
                  onChange={(e) => setAiPromptTopic(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:border-purple-600 focus:outline-none font-medium"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Subject</label>
                  <select
                    value={aiPromptSubject}
                    onChange={(e) => setAiPromptSubject(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:border-purple-600 focus:outline-none"
                  >
                    <option value="Computing & ICT">Computing &amp; ICT</option>
                    <option value="Integrated Science">Integrated Science</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="English Language">English Language</option>
                    <option value="Social Studies">Social Studies</option>
                    <option value="Religious & Moral Education">Religious &amp; Moral Education</option>
                    <option value="French">French</option>
                    <option value="Career Technology">Career Technology</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Grade Level</label>
                  <select
                    value={aiPromptClass}
                    onChange={(e) => setAiPromptClass(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:border-purple-600 focus:outline-none"
                  >
                    <option value="Basic 7">Basic 7 (JHS 1)</option>
                    <option value="Basic 8">Basic 8 (JHS 2)</option>
                    <option value="Basic 9">Basic 9 (JHS 3)</option>
                    <option value="Basic 4">Basic 4</option>
                    <option value="Basic 5">Basic 5</option>
                    <option value="Basic 6">Basic 6</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Instructional Week</label>
                  <input
                    type="number"
                    min={1}
                    max={16}
                    value={aiPromptWeek}
                    onChange={(e) => setAiPromptWeek(parseInt(e.target.value, 10) || 1)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:border-purple-600 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Special Pedagogical Focus</label>
                  <input
                    type="text"
                    placeholder="e.g. Tactile puzzles, differentiated practice..."
                    value={aiPromptFocus}
                    onChange={(e) => setAiPromptFocus(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:border-purple-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="p-3 bg-purple-50 border border-purple-100 rounded-xl text-[11px] text-purple-900 space-y-1">
                <p className="font-bold flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-purple-600" />
                  <span>Gemini AI Auto-Generates:</span>
                </p>
                <p className="text-purple-800 leading-relaxed">
                  Official Content Standard code, behavioural indicators, 21st-century core competencies, learning materials, and full Phase 1-3 teaching sequences.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAiModal(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isGeneratingAI}
                  onClick={handleGenerateWithAI}
                  className="px-4 py-2 text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 disabled:opacity-50 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  {isGeneratingAI ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Drafting Curriculum...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Generate Full Lesson Plan</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL: INSPECT LESSON PLAN DETAILS
      ===================================================================== */}
      {previewingNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs" onClick={() => setPreviewingNote(null)} />
          <div className="relative z-50 w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-left my-auto animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
              <div>
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                  Lesson Note Inspection · {previewingNote.classLevel}
                </span>
                <h3 className="text-base font-bold font-heading">{previewingNote.topic}</h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewingNote(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="p-6 space-y-5 overflow-y-auto text-xs text-slate-700">
              {/* Official Seal if Approved */}
              {previewingNote.status === 'approved' && previewingNote.principalEndorsement && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3">
                  <Award className="w-6 h-6 text-emerald-700 shrink-0 mt-0.5" />
                  <div className="flex-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-emerald-950">Official Headmaster Endorsement</span>
                      <span className="font-mono text-[10px] text-emerald-800 font-bold">
                        {previewingNote.principalEndorsement.endorsementCode}
                      </span>
                    </div>
                    <p className="text-emerald-900 mt-1 italic leading-relaxed">
                      "{previewingNote.reviewerComments}"
                    </p>
                    <div className="mt-2 text-[10px] text-emerald-700 flex items-center justify-between border-t border-emerald-200 pt-1.5">
                      <span>Certified by: {previewingNote.principalEndorsement.headmasterName}</span>
                      <span>Date: {previewingNote.principalEndorsement.date}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Revision remarks if needed */}
              {previewingNote.status === 'needs_revision' && previewingNote.reviewerComments && (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs space-y-1">
                  <p className="font-bold text-rose-900 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span>Headmaster Action Remarks:</span>
                  </p>
                  <p className="text-rose-800 italic leading-relaxed">"{previewingNote.reviewerComments}"</p>
                </div>
              )}

              {/* Meta Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px]">
                <div>
                  <span className="text-slate-400 font-medium block">Teacher</span>
                  <span className="font-bold text-slate-800">{previewingNote.teacherName}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">Subject</span>
                  <span className="font-bold text-slate-800">{previewingNote.subject}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">Week &amp; Term</span>
                  <span className="font-bold text-slate-800">
                    Week {previewingNote.weekNumber} · {previewingNote.term}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">Dates</span>
                  <span className="font-mono text-slate-800">
                    {previewingNote.startDate} to {previewingNote.endDate}
                  </span>
                </div>
              </div>

              {/* Curriculum Standards */}
              <div className="space-y-2">
                <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px] block">
                  Ghana NaCCA Curriculum Alignment
                </span>
                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1.5 text-xs">
                  <div>
                    <span className="font-bold text-slate-700">Strand: </span>
                    <span className="text-slate-800">{previewingNote.strand || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-700">Sub-Strand: </span>
                    <span className="text-slate-800">{previewingNote.subStrand || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-700">Content Standard: </span>
                    <span className="text-slate-800 font-medium">{previewingNote.contentStandard || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Behavioral Indicators */}
              {previewingNote.indicators && previewingNote.indicators.length > 0 && (
                <div>
                  <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px] block mb-1">
                    Indicators &amp; Exemplars
                  </span>
                  <ul className="list-disc pl-5 space-y-1 text-slate-700">
                    {previewingNote.indicators.map((ind, i) => (
                      <li key={i}>{ind}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 3-Phase Breakdown */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px] block">
                  Instructional Execution Phases
                </span>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="font-bold text-blue-900 block mb-1">Phase 1: Starter &amp; Hook</span>
                  <p className="whitespace-pre-line leading-relaxed text-slate-700">
                    {previewingNote.phase1Starter || 'No starter details.'}
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="font-bold text-blue-900 block mb-1">
                    Phase 2: Main Teaching &amp; Learning Activities (Montessori/Tactile)
                  </span>
                  <p className="whitespace-pre-line leading-relaxed text-slate-700">
                    {previewingNote.phase2MainActivities || 'No main activities details.'}
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="font-bold text-blue-900 block mb-1">Phase 3: Reflection &amp; Plenary</span>
                  <p className="whitespace-pre-line leading-relaxed text-slate-700">
                    {previewingNote.phase3Reflection || 'No reflection details.'}
                  </p>
                </div>
              </div>

              {/* Attachments */}
              {previewingNote.attachments && previewingNote.attachments.length > 0 && (
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px] block">
                    Attached Lesson Notes &amp; Handouts ({previewingNote.attachments.length})
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {previewingNote.attachments.map((att) => {
                      const isDoc = att.type.includes('word') || att.name.endsWith('.docx') || att.name.endsWith('.doc');
                      return (
                        <div
                          key={att.id}
                          className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-2"
                        >
                          <div className="flex items-center gap-2 truncate">
                            {isDoc ? (
                              <FileCode className="w-4 h-4 text-blue-700 shrink-0" />
                            ) : (
                              <FileDown className="w-4 h-4 text-rose-600 shrink-0" />
                            )}
                            <span className="font-semibold truncate">{att.name}</span>
                          </div>
                          <a
                            href={att.dataUrl}
                            download={att.name}
                            className="px-2.5 py-1 text-[11px] font-bold text-blue-900 bg-white border border-slate-200 rounded-lg hover:bg-blue-50 transition-colors shrink-0 flex items-center gap-1"
                          >
                            <Download className="w-3 h-3" />
                            <span>Download</span>
                          </a>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
              <span className="text-[11px] text-slate-500 font-mono">ID: {previewingNote.id}</span>
              <button
                type="button"
                onClick={() => setPreviewingNote(null)}
                className="px-4 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
