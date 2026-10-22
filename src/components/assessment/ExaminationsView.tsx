import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  GraduationCap,
  Calendar,
  Clock,
  Award,
  Plus,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Play,
  FileText,
  RotateCcw,
  Sparkles,
  Search,
} from 'lucide-react';
import { Assessment, Question } from '../../types';
import { AssessmentTaker } from './AssessmentTaker';

export const ExaminationsView: React.FC = () => {
  const {
    assessments,
    activeAssessmentId,
    setActiveAssessmentId,
    quizResults,
    currentUser,
    currentRole,
    addAssessment,
    classes,
    subjects,
    setActiveNav,
  } = useApp();

  const [takingExam, setTakingExam] = useState<boolean>(false);
  const [activeExamTab, setActiveExamTab] = useState<'term_exams' | 'mock_tests'>('term_exams');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Teacher assignment defaults
  const teacherClasses =
    currentRole === 'teacher'
      ? currentUser?.assignedClasses && currentUser.assignedClasses.length > 0
        ? currentUser.assignedClasses
        : ['B7']
      : classes.map((c) => c.classLevel);

  const teacherSubjects =
    currentRole === 'teacher'
      ? currentUser?.assignedSubjects && currentUser.assignedSubjects.length > 0
        ? currentUser.assignedSubjects
        : [currentUser?.assignedSubjects?.[0] || 'Computing & ICT']
      : subjects.map((s) => s.name);

  // Form states for new exam
  const [examTitle, setExamTitle] = useState('');
  const [examSubject, setExamSubject] = useState(teacherSubjects[0] || 'Computing & ICT');
  const [examClass, setExamClass] = useState(teacherClasses[0] || 'B7');
  const [examDuration, setExamDuration] = useState(60);
  const [examMarks, setExamMarks] = useState(50);
  const [examTerm, setExamTerm] = useState('Term 1 Final Examination');

  const canCreate = currentRole === 'teacher' || currentRole === 'admin';

  // Filter exams strictly isolated:
  // - Students only see exams for their own class level
  // - Teachers only see exams for their assigned classes & subjects (or authored by them)
  // - Admin can see all exams
  const roleFilteredAssessments = assessments.filter((a) => {
    if (currentRole === 'student') {
      return a.classLevel === currentUser?.classLevel || a.classLevel === 'All Classes';
    }
    if (currentRole === 'teacher') {
      const isAuthor =
        a.teacherId === currentUser?.id ||
        a.teacherName?.toLowerCase() === currentUser?.name?.toLowerCase();
      const isAssigned =
        currentUser?.assignedSubjects?.includes(a.subject) &&
        currentUser?.assignedClasses?.includes(a.classLevel);
      return isAuthor || isAssigned;
    }
    return true;
  });

  const displayedExams = roleFilteredAssessments.filter(
    (e) =>
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.classLevel.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleStartExam = (examId: string) => {
    setActiveAssessmentId(examId);
    setTakingExam(true);
  };

  const handleCreateExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!examTitle.trim()) return;

    const sampleQuestions: Question[] = [
      {
        id: `q-exam-${Date.now()}-1`,
        type: 'mcq',
        prompt: `Which of the following best describes the core standard of ${examSubject} in ${examClass}?`,
        options: ['Analytical comprehension', 'Practical methodology', 'Theoretical foundations', 'All of the above'],
        correctAnswer: 3,
        marks: 10,
      },
      {
        id: `q-exam-${Date.now()}-2`,
        type: 'true_false',
        prompt: `The primary objective of this term curriculum in ${examSubject} is self-directed exploratory inquiry.`,
        options: ['True', 'False'],
        correctAnswer: 0,
        marks: 10,
      },
      {
        id: `q-exam-${Date.now()}-3`,
        type: 'mcq',
        prompt: `What is the standard procedure when verifying system output in laboratory examinations?`,
        options: ['Automated unit validation', 'Peer review audit', 'Supervised teacher sign-off', 'Instant feedback scoring'],
        correctAnswer: 2,
        marks: 10,
      },
    ];

    addAssessment({
      title: examTitle.trim(),
      subject: examSubject,
      classLevel: examClass,
      teacherId: currentUser?.id,
      teacherName: currentUser?.name || 'Class Teacher',
      type: 'exam',
      durationMinutes: examDuration,
      totalMarks: examMarks,
      term: examTerm,
      questions: sampleQuestions,
      dueDate: '2026-11-20',
    });

    setShowAddModal(false);
    setExamTitle('');
  };

  // If currently taking an examination paper
  if (takingExam) {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => setTakingExam(false)}
          className="text-xs font-bold text-blue-900 hover:text-blue-700 flex items-center gap-1.5 cursor-pointer bg-white px-3 py-1.5 rounded-lg border border-slate-200"
        >
          ← Return to Examinations Hall
        </button>
        <AssessmentTaker />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-900 uppercase tracking-wider mb-1">
            <GraduationCap className="w-4 h-4" />
            <span>Academic Assessments &amp; Official Papers</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-slate-900">
            Examinations Hall
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            End of Term examinations, mid-term testing, automated marking, and certified grade transcripts.
          </p>
        </div>

        {canCreate && (
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 cursor-pointer self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Create Examination Paper</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search exam papers by title, subject, or class level..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-900"
          />
        </div>
        <div className="flex items-center gap-2 text-xs">
          <button
            type="button"
            onClick={() => setActiveExamTab('term_exams')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
              activeExamTab === 'term_exams'
                ? 'bg-blue-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Term Exams ({displayedExams.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveExamTab('mock_tests')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
              activeExamTab === 'mock_tests'
                ? 'bg-blue-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Past Papers &amp; Mocks
          </button>
        </div>
      </div>

      {/* Examinations Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayedExams.map((exam) => {
          const userResult = quizResults.find(
            (r) => r.quizId === exam.id && r.studentId === currentUser?.id
          );

          return (
            <div
              key={exam.id}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                {/* Meta Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-900 font-bold text-[10px] uppercase">
                        {exam.type === 'exam' ? 'Official Exam' : 'Continuous Quiz'}
                      </span>
                      <span className="text-slate-400">·</span>
                      <span className="font-bold text-xs text-slate-700">{exam.classLevel}</span>
                      <span className="text-slate-400">·</span>
                      <span className="text-xs text-slate-500">{exam.subject}</span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 leading-snug">{exam.title}</h3>
                  </div>

                  {userResult && (
                    <span className="px-2.5 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 shrink-0">
                      Grade {userResult.grade}
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-500 line-clamp-2">
                  {exam.term || 'First Term'} · Comprehensive curriculum knowledge verification paper.
                </p>

                {/* Details Pills */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-blue-600" />
                    <span>Duration: <strong>{exam.durationMinutes}m</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-amber-600" />
                    <span>Total Marks: <strong>{exam.totalMarks}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5 col-span-2">
                    <FileText className="w-3.5 h-3.5 text-purple-600" />
                    <span>Questions: <strong>{exam.questions.length}</strong> questions</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div>
                {userResult ? (
                  <button
                    type="button"
                    onClick={() => handleStartExam(exam.id)}
                    className="w-full py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl border border-emerald-200 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Completed ({userResult.score}/{userResult.totalMarks}) · Review Script</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleStartExam(exam.id)}
                    className="w-full py-2.5 bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Play className="w-4 h-4" />
                    <span>Start Examination Paper</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {displayedExams.length === 0 && (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <GraduationCap className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900">No examination papers found</h3>
          <p className="text-xs text-slate-500 mt-1">
            {canCreate ? 'Create your first terminal exam paper.' : 'Examination papers will appear here once scheduled by faculty.'}
          </p>
        </div>
      )}

      {/* CREATE EXAM MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative space-y-4">
            <h3 className="text-lg font-bold font-heading text-slate-900">
              Schedule New Examination Paper
            </h3>
            <form onSubmit={handleCreateExam} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Examination Title:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. End of Term 1 Computing Examination"
                  value={examTitle}
                  onChange={(e) => setExamTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Subject:</label>
                  <select
                    value={examSubject}
                    onChange={(e) => setExamSubject(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-900"
                  >
                    {teacherSubjects.map((subName) => (
                      <option key={subName} value={subName}>
                        {subName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Class Level:</label>
                  <select
                    value={examClass}
                    onChange={(e) => setExamClass(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-900"
                  >
                    {teacherClasses.map((cls) => (
                      <option key={cls} value={cls}>
                        Class {cls}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Duration (Mins):</label>
                  <input
                    type="number"
                    min="10"
                    max="180"
                    value={examDuration}
                    onChange={(e) => setExamDuration(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Total Marks:</label>
                  <input
                    type="number"
                    min="10"
                    max="100"
                    value={examMarks}
                    onChange={(e) => setExamMarks(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Academic Term:</label>
                <input
                  type="text"
                  value={examTerm}
                  onChange={(e) => setExamTerm(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-900"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Publish Paper
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
