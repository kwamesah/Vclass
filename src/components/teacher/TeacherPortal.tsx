import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  School,
  Video,
  FileCheck2,
  UserCheck,
  Plus,
  CheckCircle2,
  Calendar,
  Clock,
  Sparkles,
  BookOpen,
  Send,
  MessageSquare,
  BarChart3,
  Award,
  HelpCircle,
  FileText,
  Presentation,
  Upload,
  Edit2,
  Trash2,
  X,
  Layers,
  Eye,
  Radio,
  AlertTriangle,
  Play,
  Check,
  ExternalLink,
  ShieldAlert,
  Info,
  LayoutDashboard,
  ChevronDown,
  ChevronRight,
  Activity,
  BrainCircuit,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { AttendanceRecord, Lesson, Question, RubricCriterion, Course, Assignment, Assessment, TimetableSlot } from '../../types';
import {
  getTeacherTimetable,
  getTeacherTodaySlots,
  getTeacherActiveSlotNow,
  verifyTeacherCanGoLive,
  getCurrentSchoolDay,
  isSlotActiveNow,
} from '../../utils/timetable';
import { YouTubePlayer } from '../common/YouTubePlayer';
import { isValidYouTubeUrl } from '../../utils/youtube';
import { LessonAuthoringStudio } from './LessonAuthoringStudio';
import { LessonNotesStudio } from './LessonNotesStudio';

export const TeacherPortal: React.FC = () => {
  const {
    currentUser,
    users,
    courses,
    assignments,
    submissions,
    timetable,
    activities,
    gradeSubmission,
    gradeSubmissionWithRubric,
    recordAttendanceBulk,
    scheduleVClass,
    startVClass,
    updateVClass,
    deleteVClass,
    setActiveNav,
    setActiveVClassId,
    addAssignment,
    updateAssignment,
    deleteAssignment,
    addLesson,
    updateLesson,
    deleteLesson,
    assessments,
    addAssessment,
    updateAssessment,
    deleteAssessment,
    vclasses,
    addAnnouncement,
    activeNav,
  } = useApp();

  // Active tab within teacher view: 'overview' | 'grading' | 'attendance' | 'schedule' | 'new_assignment' | 'lesson_builder' | 'question_bank' | 'gradebook' | 'lesson_notes'
  const [activeTab, setActiveTab] = useState<
    'overview' | 'grading' | 'attendance' | 'schedule' | 'new_assignment' | 'lesson_builder' | 'question_bank' | 'gradebook' | 'lesson_notes'
  >('overview');

  useEffect(() => {
    if (activeNav === 'attendance') setActiveTab('attendance');
    else if (activeNav === 'assignments') setActiveTab('grading');
    else if (activeNav === 'results') setActiveTab('gradebook');
    else if (activeNav === 'schedule') setActiveTab('schedule');
    else if (activeNav === 'quizzes') setActiveTab('question_bank');
    else if (activeNav === 'lesson_builder') setActiveTab('lesson_builder');
    else if (activeNav === 'lesson_notes') setActiveTab('lesson_notes');
    else if (activeNav === 'dashboard') setActiveTab('overview');
  }, [activeNav]);

  // Grading state
  const [selectedSubId, setSelectedSubId] = useState<string>(submissions[2]?.id || submissions[0]?.id);
  const [marksInput, setMarksInput] = useState<number>(18);
  const [feedbackInput, setFeedbackInput] = useState<string>(
    'Well presented work. Clear understanding of input devices and memory storage concepts!'
  );
  const [gradeSuccess, setGradeSuccess] = useState<boolean>(false);

  // Rubric evaluation criteria state with live tallying
  const [rubricCriteria, setRubricCriteria] = useState<RubricCriterion[]>([
    {
      id: 'rc-1',
      name: 'Conceptual Mastery & Logic',
      maxScore: 5,
      score: 5,
      description: 'Understanding of hardware components, processing cycles, and volatile vs. non-volatile memory.',
    },
    {
      id: 'rc-2',
      name: 'Accuracy & Identification',
      maxScore: 5,
      score: 4,
      description: 'Precise classification of motherboard chipsets, input sensors, and peripheral interfaces.',
    },
    {
      id: 'rc-3',
      name: 'Practical Application & Context',
      maxScore: 5,
      score: 5,
      description: 'Real-world Ghanaian computing context and school laboratory application.',
    },
    {
      id: 'rc-4',
      name: 'Technical Clarity & Structure',
      maxScore: 5,
      score: 4,
      description: 'Well-structured explanations, legible diagrams, and correct technical computing vocabulary.',
    },
  ]);

  const handleUpdateRubricScore = (criterionId: string, newScore: number) => {
    setRubricCriteria((prev) => {
      const updated = prev.map((c) => (c.id === criterionId ? { ...c, score: newScore } : c));
      const total = updated.reduce((acc, c) => acc + c.score, 0);
      setMarksInput(total);
      return updated;
    });
  };

  // Dynamic teacher specialization & active timetable slot lookup
  const teacherTimetableSlots = getTeacherTimetable(timetable, currentUser?.id, currentUser?.name);
  const teacherTodaySlots = getTeacherTodaySlots(timetable, currentUser?.id, currentUser?.name);
  const activeSlotNow = getTeacherActiveSlotNow(timetable, currentUser?.id, currentUser?.name);

  // Priority: 1. Assigned classes and subjects from user profile, 2. Timetable slot, 3. Defaults
  const teacherAssignedClasses =
    currentUser?.assignedClasses && currentUser.assignedClasses.length > 0
      ? currentUser.assignedClasses
      : [currentUser?.classLevel || 'B7'];

  const teacherAssignedSubjects =
    currentUser?.assignedSubjects && currentUser.assignedSubjects.length > 0
      ? currentUser.assignedSubjects
      : [
          currentUser?.name?.includes('Grace')
            ? 'Mathematics (Montessori)'
            : currentUser?.name?.includes('Rebecca')
            ? 'English Language'
            : currentUser?.name?.includes('Okyere')
            ? 'Integrated Science'
            : currentUser?.name?.includes('Jean-Paul') || currentUser?.name?.includes('Kouassi')
            ? 'French Language'
            : 'Computing & ICT',
        ];

  const teacherDefaultSubject =
    teacherAssignedSubjects[0] || activeSlotNow?.subject || 'Computing & ICT';

  const teacherDefaultClass =
    currentUser?.isClassTeacherOf || teacherAssignedClasses[0] || 'B7';

  // Daily attendance state filtered strictly to teacher's assigned classes
  const [todayAttendance, setTodayAttendance] = useState<{
    id: string;
    studentName: string;
    studentId: string;
    classLevel: string;
    status: 'present' | 'absent' | 'late';
  }[]>(() => {
    return users
      .filter((u) => u.role === 'student' && teacherAssignedClasses.includes(u.classLevel || ''))
      .map((u) => ({
        id: `att-${u.id}`,
        studentName: u.name,
        studentId: u.id,
        classLevel: u.classLevel || 'B7',
        status: 'present' as const,
      }));
  });

  // Schedule VClass form state
  const [vclassTitle, setVclassTitle] = useState<string>(
    () => `${teacherDefaultClass} ${teacherDefaultSubject} Live Masterclass`
  );
  const [vclassSubject, setVclassSubject] = useState<string>(teacherDefaultSubject);
  const [vclassClassLevel, setVclassClassLevel] = useState<string>(teacherDefaultClass);
  const [vclassDate, setVclassDate] = useState<string>(() => `Today, ${getCurrentSchoolDay()}`);
  const [vclassTime, setVclassTime] = useState<string>(
    () => (activeSlotNow ? `${activeSlotNow.startTime} - ${activeSlotNow.endTime}` : '09:55 AM')
  );
  const [vclassDuration, setVclassDuration] = useState<number>(45);
  const [vclassAgenda, setVclassAgenda] = useState<string>(
    `Live interactive lecture for ${teacherDefaultClass} ${teacherDefaultSubject} with real-time video, slides, student Q&A, and interactive whiteboard.`
  );
  const [vclassGoLiveImmediate, setVclassGoLiveImmediate] = useState<boolean>(false);
  const [selectedTimetableSlotId, setSelectedTimetableSlotId] = useState<string | null>(
    activeSlotNow?.id || teacherTodaySlots[0]?.id || null
  );
  const [selectedScheduleDay, setSelectedScheduleDay] = useState<string>(
    getCurrentSchoolDay() || 'Monday'
  );

  // Timetable Verification & Restriction Modal State
  const [timetableModal, setTimetableModal] = useState<{
    show: boolean;
    reason: string;
    subject: string;
    classLevel: string;
    targetSessionId?: string;
    scheduledSlotToday?: TimetableSlot | null;
  }>({
    show: false,
    reason: '',
    subject: teacherDefaultSubject,
    classLevel: teacherDefaultClass,
    scheduledSlotToday: null,
  });

  // Video preview modal for teachers
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);

  // New assignment form state
  const [newAssignTitle, setNewAssignTitle] = useState<string>(`Assignment: ${teacherDefaultSubject} Core Application`);
  const [newAssignClass, setNewAssignClass] = useState<string>(teacherDefaultClass);
  const [newAssignSubject, setNewAssignSubject] = useState<string>(teacherDefaultSubject);
  const [newAssignDue, setNewAssignDue] = useState<string>('Next Monday, 26 October');
  const [newAssignPrompt, setNewAssignPrompt] = useState<string>(
    `Explain 3 core concepts covered in this week's ${teacherDefaultSubject} lesson and illustrate with real-world examples.`
  );

  // Lesson Builder Form State with YouTube video support
  const [lessonTitle, setLessonTitle] = useState<string>(
    `Lesson 3: Introduction to ${teacherDefaultSubject} Core Curriculum`
  );
  const [lessonWeek, setLessonWeek] = useState<number>(4);
  const [lessonObjectives, setLessonObjectives] = useState<string>(
    '1. Understand fundamental principles and definitions.\n2. Trace practical applications in Ghanaian context.'
  );
  const [lessonNotesText, setLessonNotesText] = useState<string>(
    `In this unit, we explore foundational concepts of ${teacherDefaultSubject}. Students are required to study these notes, watch the embedded video lecture, and attempt the interactive exercises.`
  );
  const [lessonYoutubeUrl, setLessonYoutubeUrl] = useState<string>('https://www.youtube.com/watch?v=AkFi90lZmXA');
  const [lessonVideoTitle, setLessonVideoTitle] = useState<string>(`${teacherDefaultClass} ${teacherDefaultSubject} Video Lecture`);
  const [lessonPptSlidesTitle, setLessonPptSlidesTitle] = useState<string>(`${teacherDefaultSubject} Presentation Deck`);
  const [lessonSuccess, setLessonSuccess] = useState<boolean>(false);

  // Question Bank Creator State
  const [qBankTitle, setQBankTitle] = useState<string>(`${teacherDefaultClass} ${teacherDefaultSubject}: Comprehensive Assessment Quiz`);
  const [qPrompt, setQPrompt] = useState<string>('What is the primary function of this concept in real-world application?');
  const [qType, setQType] = useState<'mcq' | 'true_false' | 'theory'>('mcq');
  const [qOptA, setQOptA] = useState<string>('Primary standard definition and execution');
  const [qOptB, setQOptB] = useState<string>('Secondary auxiliary function');
  const [qOptC, setQOptC] = useState<string>('Temporary storage cache');
  const [qOptD, setQOptD] = useState<string>('External communication channel');
  const [qCorrect, setQCorrect] = useState<number>(0);
  const [qMarks, setQMarks] = useState<number>(5);
  const [qSuccess, setQSuccess] = useState<boolean>(false);

  const [qClass, setQClass] = useState<string>(teacherDefaultClass);
  const [qSubject, setQSubject] = useState<string>(teacherDefaultSubject);
  const [attendanceClassLevel, setAttendanceClassLevel] = useState<string>(teacherDefaultClass);

  // Strictly isolated teacher activities (courses, assignments, assessments, vclasses)
  const myCourses = courses.filter(
    (c) =>
      c.teacherId === currentUser?.id ||
      c.teacherName?.toLowerCase() === currentUser?.name?.toLowerCase() ||
      (currentUser?.assignedSubjects?.includes(c.subject) &&
        currentUser?.assignedClasses?.includes(c.classLevel))
  );

  const myAssignments = assignments.filter(
    (a) =>
      a.teacherId === currentUser?.id ||
      a.teacherName?.toLowerCase() === currentUser?.name?.toLowerCase() ||
      (currentUser?.assignedSubjects?.includes(a.subject) &&
        currentUser?.assignedClasses?.includes(a.classLevel))
  );

  const myAssessments = assessments.filter(
    (a) =>
      a.teacherId === currentUser?.id ||
      a.teacherName?.toLowerCase() === currentUser?.name?.toLowerCase() ||
      (currentUser?.assignedSubjects?.includes(a.subject) &&
        currentUser?.assignedClasses?.includes(a.classLevel))
  );

  const myVClasses = vclasses.filter(
    (v) =>
      v.teacherId === currentUser?.id ||
      v.teacherName?.toLowerCase() === currentUser?.name?.toLowerCase()
  );

  const mySubmissions = submissions.filter(
    (s) =>
      myAssignments.some((a) => a.id === s.assignmentId) ||
      teacherAssignedClasses.includes(s.studentClass)
  );

  // Function to load a timetable slot into the Live Launcher
  const loadTimetableSlotIntoForm = (slot: TimetableSlot) => {
    setSelectedTimetableSlotId(slot.id);
    setVclassSubject(slot.subject);
    setVclassClassLevel(slot.classLevel);
    setVclassTitle(`${slot.classLevel} ${slot.subject} Live (Period ${slot.periodNumber})`);
    setVclassTime(`${slot.startTime} - ${slot.endTime}`);
    setVclassAgenda(`Official Period ${slot.periodNumber} Teaching Session in ${slot.room || 'VClass Studio'}`);
  };

  // Gradebook Data - strictly filtered to teacher's assigned classes
  const gradebookData = users
    .filter(
      (u) =>
        u.role === 'student' &&
        (teacherAssignedClasses.includes(u.classLevel || '') || teacherAssignedClasses.length === 0)
    )
    .map((u, idx) => {
      const studentSubs = mySubmissions.filter((s) => s.studentId === u.id);
      const gradedSubs = studentSubs.filter((s) => s.status === 'graded');
      const totalMarks = gradedSubs.reduce((sum, s) => sum + (s.marksAwarded || 0), 0);
      const maxPossible = gradedSubs.reduce((sum, s) => sum + (s.maxMarks || 20), 0);
      const pct = maxPossible > 0 ? Math.round((totalMarks / maxPossible) * 100) : 0;
      return {
        id: `gb-${u.id}`,
        name: u.name,
        idNum: u.studentId || `STU-${u.id.slice(-4)}`,
        classScore: totalMarks,
        examScore: maxPossible,
        total: pct,
        grade: pct >= 80 ? 'A' : pct >= 70 ? 'B' : pct >= 60 ? 'C' : pct >= 50 ? 'D' : 'E',
        rank: `${idx + 1}`,
        remarks: pct >= 80 ? 'Exceptional' : pct >= 60 ? 'Good' : 'In Progress',
      };
    });

  const handleSaveGrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubId) return;
    gradeSubmissionWithRubric(selectedSubId, marksInput, feedbackInput, rubricCriteria);
    setGradeSuccess(true);
    confetti({ particleCount: 50, spread: 60 });
    setTimeout(() => setGradeSuccess(false), 3000);
  };

  const handleToggleAttendance = (studentId: string, newStatus: 'present' | 'absent' | 'late') => {
    setTodayAttendance((prev) =>
      prev.map((r) => (r.studentId === studentId ? { ...r, status: newStatus } : r))
    );
  };

  const handleSaveDailyRegister = () => {
    const records: AttendanceRecord[] = todayAttendance.map((r) => ({
      id: `att-${r.studentId}-${Date.now()}`,
      date: '2026-10-05',
      classLevel: r.classLevel,
      studentId: r.studentId,
      studentName: r.studentName,
      status: r.status,
      timeRecorded: '08:00 AM',
    }));
    recordAttendanceBulk(records);
    confetti({ particleCount: 40, spread: 50 });
  };

  const executeCreateAndBroadcast = (isEmergencyOverride = false) => {
    const shouldGoLive = vclassGoLiveImmediate || isEmergencyOverride;
    const newSession = scheduleVClass({
      title: vclassTitle,
      subject: vclassSubject,
      classLevel: vclassClassLevel,
      teacherName: currentUser?.name || 'Class Teacher',
      teacherAvatar:
        currentUser?.avatar ||
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      teacherId: currentUser?.id || 'tea-default',
      date: vclassDate,
      time: vclassTime,
      durationMinutes: vclassDuration,
      isLive: shouldGoLive,
      status: shouldGoLive ? 'live' : 'scheduled',
      materials: [{ name: `${vclassSubject}_Lecture_Deck.pdf`, type: 'PDF', size: '2.4 MB' }],
      meetingTopic: vclassAgenda || vclassTitle,
    });
    confetti({ particleCount: 60, spread: 70 });

    if (shouldGoLive && newSession) {
      startVClass(newSession.id);
      setActiveVClassId(newSession.id);
      setActiveNav('vclass');
    } else {
      setActiveTab('schedule');
    }
  };

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (vclassGoLiveImmediate) {
      const verification = verifyTeacherCanGoLive(
        timetable,
        currentUser?.id,
        currentUser?.name,
        vclassSubject,
        vclassClassLevel
      );
      if (!verification.allowed) {
        setTimetableModal({
          show: true,
          reason: verification.reason,
          subject: vclassSubject,
          classLevel: vclassClassLevel,
          scheduledSlotToday: verification.scheduledSlotToday,
        });
        return;
      }
    }
    executeCreateAndBroadcast();
  };

  const handleGoLiveForSession = (session: { id: string; subject: string; classLevel: string; title: string }) => {
    const verification = verifyTeacherCanGoLive(
      timetable,
      currentUser?.id,
      currentUser?.name,
      session.subject,
      session.classLevel
    );
    if (!verification.allowed) {
      setTimetableModal({
        show: true,
        reason: verification.reason,
        subject: session.subject,
        classLevel: session.classLevel,
        targetSessionId: session.id,
        scheduledSlotToday: verification.scheduledSlotToday,
      });
      return;
    }
    startVClass(session.id);
    setActiveVClassId(session.id);
    setActiveNav('vclass');
  };

  const [selectedCourseIdForLesson, setSelectedCourseIdForLesson] = useState<string>(
    courses[0]?.id || ''
  );
  const [editingAssignmentId, setEditingAssignmentId] = useState<string | null>(null);

  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingAssignmentId) {
      updateAssignment(editingAssignmentId, {
        title: newAssignTitle,
        classLevel: newAssignClass,
        subject: newAssignSubject,
        dueDate: newAssignDue,
        prompt: newAssignPrompt,
      });
      setEditingAssignmentId(null);
    } else {
      addAssignment({
        title: newAssignTitle,
        classLevel: newAssignClass,
        subject: newAssignSubject,
        dueDate: newAssignDue,
        totalMarks: 20,
        prompt: newAssignPrompt,
        instructions: 'Submit typed responses or upload handwritten PDF sheets.',
        teacherName: currentUser?.name || 'Class Teacher',
        teacherId: currentUser?.id,
      });
    }
    confetti({ particleCount: 60, spread: 60 });
    setNewAssignTitle('');
    setNewAssignPrompt('');
  };

  const openEditAssignment = (ass: Assignment) => {
    setEditingAssignmentId(ass.id);
    setNewAssignTitle(ass.title);
    setNewAssignClass(ass.classLevel);
    setNewAssignSubject(ass.subject);
    setNewAssignDue(ass.dueDate);
    setNewAssignPrompt(ass.prompt);
    setActiveTab('new_assignment');
  };

  const handleDeleteAssignment = (id: string, title: string) => {
    if (window.confirm(`Delete assignment "${title}"?`)) {
      deleteAssignment(id);
    }
  };

  const handlePublishLesson = (e: React.FormEvent) => {
    e.preventDefault();
    const targetCourse = courses.find((c) => c.id === selectedCourseIdForLesson) || courses[0];
    if (!targetCourse) return;
    const targetStrand = targetCourse.strands[0] || {
      id: `strand-${Date.now()}`,
      name: 'Curriculum Core',
      strandNumber: 1,
      weeks: [],
    };

    addLesson(targetCourse.id, targetStrand.id, lessonWeek, {
      title: lessonTitle,
      objectives: lessonObjectives.split('\n').filter((o) => o.trim().length > 0),
      lessonNotes: lessonNotesText,
      youtubeUrl: lessonYoutubeUrl.trim() || undefined,
      videoTitle: lessonVideoTitle || (lessonYoutubeUrl.trim() ? `${lessonTitle} (Video Lecture)` : undefined),
      videoDuration: '14 mins',
      pptSlides: lessonPptSlidesTitle
        ? [{ slideNo: 1, title: lessonTitle, content: lessonNotesText.slice(0, 100) }]
        : undefined,
    });

    setLessonSuccess(true);
    confetti({ particleCount: 60, spread: 60 });
    setTimeout(() => {
      setLessonSuccess(false);
      setLessonTitle('');
      setLessonNotesText('');
    }, 2000);
  };

  const handleDeleteLesson = (courseId: string, lessonId: string, title: string) => {
    if (window.confirm(`Remove lesson "${title}" from course syllabus?`)) {
      deleteLesson(courseId, lessonId);
    }
  };

  const handleAddQuestionToBank = (e: React.FormEvent) => {
    e.preventDefault();
    const newQuestion: Question = {
      id: `q-${Date.now()}`,
      type: qType === 'true_false' ? 'true_false' : 'mcq',
      prompt: qPrompt,
      options: qType === 'true_false' ? ['True', 'False'] : [qOptA, qOptB, qOptC, qOptD].filter(Boolean),
      correctAnswer:
        qType === 'true_false'
          ? 'True'
          : qCorrect === 0
          ? qOptA
          : qCorrect === 1
          ? qOptB
          : qCorrect === 2
          ? qOptC
          : qOptD,
      marks: qMarks,
    };

    const existingAss = assessments.find(
      (a) =>
        a.title.toLowerCase() === qBankTitle.trim().toLowerCase() &&
        (a.teacherId === currentUser?.id || a.teacherName?.toLowerCase() === currentUser?.name?.toLowerCase())
    );
    if (existingAss) {
      updateAssessment(existingAss.id, {
        questions: [...existingAss.questions, newQuestion],
        totalMarks: existingAss.totalMarks + qMarks,
      });
    } else {
      addAssessment({
        title: qBankTitle.trim(),
        subject: qSubject,
        classLevel: qClass,
        teacherId: currentUser?.id,
        teacherName: currentUser?.name || 'Subject Teacher',
        type: 'quiz',
        durationMinutes: 20,
        totalMarks: qMarks,
        term: 'Term 1',
        questions: [newQuestion],
      });
    }

    setQSuccess(true);
    confetti({ particleCount: 40 });
    setTimeout(() => {
      setQSuccess(false);
      setQPrompt('');
    }, 2500);
  };

  const handleDeleteAssessment = (id: string, title: string) => {
    if (window.confirm(`Delete assessment "${title}"?`)) {
      deleteAssessment(id);
    }
  };

  const handleDeleteVClass = (id: string, title: string) => {
    if (window.confirm(`Cancel and remove live VClass "${title}"?`)) {
      deleteVClass(id);
    }
  };

  const selectedSubmission = mySubmissions.find((s) => s.id === selectedSubId) || mySubmissions[0];

  // Attendance stats
  const presentCount = todayAttendance.filter((a) => a.status === 'present').length;
  const lateCount = todayAttendance.filter((a) => a.status === 'late').length;
  const absentCount = todayAttendance.filter((a) => a.status === 'absent').length;
  const attendanceRate = Math.round(((presentCount + lateCount) / todayAttendance.length) * 100);

  if (!currentUser) return null;

  return (
    <div className="space-y-6">
      {/* Teacher Welcome Header */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              Salem Montessori Faculty Studio
            </span>
            <h1 className="text-2xl font-bold font-heading">
              Welcome, {currentUser.name}
            </h1>
            <p className="text-xs text-slate-300">
              Assigned Classes: Basic 7 Computing &amp; Integrated Science • Academic Year 2026/2027
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setActiveVClassId('vclass-comp-live');
                setActiveNav('vclass');
              }}
              className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Video className="w-4 h-4" /> Launch Live VClass Studio
            </button>
          </div>
        </div>
      </div>

      {/* Teacher Navigation: Categorized Sub-Menus & Mobile Adaptive Switcher */}
      <div className="space-y-2">
        {/* Mobile View Dropdown (< 640px) */}
        <div className="sm:hidden">
          <label htmlFor="teacher-tab-select" className="sr-only">Select Teaching Section</label>
          <div className="relative">
            <select
              id="teacher-tab-select"
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value as any)}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 shadow-xs appearance-none pr-9 focus:outline-hidden focus:ring-2 focus:ring-blue-900"
            >
              <optgroup label="Classroom & Live">
                <option value="overview">Teaching Overview</option>
                <option value="schedule">Schedule Live Class</option>
                <option value="attendance">Attendance Register</option>
              </optgroup>
              <optgroup label="Curriculum Studio">
                <option value="lesson_builder">Lesson & Presentation Deck Studio</option>
                <option value="question_bank">Quiz & Question Bank</option>
              </optgroup>
              <optgroup label="Evaluation & Grading">
                <option value="grading">
                  Mark Assignments ({mySubmissions.filter((s) => s.status === 'pending').length} Pending)
                </option>
                <option value="gradebook">Class Gradebook</option>
                <option value="new_assignment">Create Assignment</option>
              </optgroup>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-3 pointer-events-none" />
          </div>
        </div>

        {/* Desktop View Grouped Sub-Menus (>= 640px) */}
        <div className="hidden sm:block space-y-2">
          {/* Level 1: Primary Category Tabs */}
          {(() => {
            const currentCat = ['overview', 'schedule', 'attendance'].includes(activeTab)
              ? 'classroom'
              : ['lesson_builder', 'question_bank'].includes(activeTab)
              ? 'studio'
              : 'grading';

            return (
              <div data-tour="teacher-portal-tabs" className="bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/80 space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setActiveTab('overview')}
                    className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      currentCat === 'classroom'
                        ? 'bg-white text-blue-900 shadow-xs ring-1 ring-slate-200/50'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                    }`}
                  >
                    <School className="w-3.5 h-3.5" />
                    <span>Classroom & Live</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('lesson_builder')}
                    className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      currentCat === 'studio'
                        ? 'bg-white text-blue-900 shadow-xs ring-1 ring-slate-200/50'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Curriculum Studio</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('grading')}
                    className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      currentCat === 'grading'
                        ? 'bg-white text-blue-900 shadow-xs ring-1 ring-slate-200/50'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                    }`}
                  >
                    <FileCheck2 className="w-3.5 h-3.5" />
                    <span>Evaluation & Grading</span>
                    {mySubmissions.filter((s) => s.status === 'pending').length > 0 && (
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                    )}
                  </button>
                </div>

                {/* Level 2: Sub-Menu Pills for the Active Category */}
                <div className="flex items-center gap-1 pt-1 border-t border-slate-200/60 overflow-x-auto">
                  {currentCat === 'classroom' && (
                    <>
                      <button
                        type="button"
                        onClick={() => setActiveTab('overview')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                          activeTab === 'overview'
                            ? 'bg-blue-900 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
                        }`}
                      >
                        <LayoutDashboard className="w-3.5 h-3.5" />
                        <span>Teaching Overview</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab('schedule')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                          activeTab === 'schedule'
                            ? 'bg-blue-900 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
                        }`}
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>Schedule Live VClass</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab('attendance')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                          activeTab === 'attendance'
                            ? 'bg-blue-900 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
                        }`}
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Attendance Register</span>
                      </button>
                    </>
                  )}

                  {currentCat === 'studio' && (
                    <>
                      <button
                        type="button"
                        onClick={() => setActiveTab('lesson_builder')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                          activeTab === 'lesson_builder'
                            ? 'bg-blue-900 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
                        }`}
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Interactive Lesson & Slide Deck Studio</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab('lesson_notes')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                          activeTab === 'lesson_notes'
                            ? 'bg-blue-900 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
                        }`}
                      >
                        <FileText className="w-3.5 h-3.5 text-amber-500" />
                        <span>Lesson Notes &amp; AI Planner</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab('question_bank')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                          activeTab === 'question_bank'
                            ? 'bg-blue-900 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
                        }`}
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>Quiz &amp; Question Bank</span>
                      </button>
                    </>
                  )}

                  {currentCat === 'grading' && (
                    <>
                      <button
                        type="button"
                        onClick={() => setActiveTab('grading')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                          activeTab === 'grading'
                            ? 'bg-blue-900 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
                        }`}
                      >
                        <FileCheck2 className="w-3.5 h-3.5" />
                        <span>Mark Assignments ({mySubmissions.filter((s) => s.status === 'pending').length} Pending)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab('gradebook')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                          activeTab === 'gradebook'
                            ? 'bg-blue-900 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
                        }`}
                      >
                        <BarChart3 className="w-3.5 h-3.5" />
                        <span>Class Gradebook</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab('new_assignment')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                          activeTab === 'new_assignment'
                            ? 'bg-blue-900 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
                        }`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Create Assignment</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* 1. TEACHING OVERVIEW */}
      {activeTab === 'overview' && (() => {
        const myPupilsCount = users.filter(
          (u) => u.role === 'student' && teacherAssignedClasses.includes(u.classLevel || '')
        ).length;
        const myPendingCount = submissions.filter(
          (s) => s.status === 'pending' && (myAssignments.some((a) => a.id === s.assignmentId) || teacherAssignedClasses.includes(s.studentClass))
        ).length;
        const activeCourseUnit = myCourses[0] || courses[0];
        const activeWeek = activeCourseUnit?.strands?.[0]?.weeks?.[0];

        return (
          <div className="space-y-6">
            <div data-tour="teacher-metrics" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <p className="text-xs text-slate-500">Active Pupils Taught</p>
                <p className="text-2xl font-bold text-slate-900 mt-1 tabular-nums">{myPupilsCount || 28}</p>
                <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                  Classes: {teacherAssignedClasses.join(', ')}
                </p>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <p className="text-xs text-slate-500">Submissions to Mark</p>
                <p className="text-2xl font-bold text-amber-600 mt-1 tabular-nums">
                  {myPendingCount}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">Needs evaluation</p>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <p className="text-xs text-slate-500">Class Attendance Today</p>
                <p className="text-2xl font-bold text-emerald-700 mt-1 tabular-nums">
                  {attendanceRate}%
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">{presentCount} present, {lateCount} late</p>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <p className="text-xs text-slate-500">Scheduled VClasses</p>
                <p className="text-2xl font-bold text-blue-900 mt-1 tabular-nums">{myVClasses.length}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Isolated to you</p>
              </div>
            </div>

            <div data-tour="teacher-curriculum" className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900">
                  Current Curriculum Unit: {activeCourseUnit ? `${activeCourseUnit.classLevel} ${activeCourseUnit.subject} – ${activeWeek?.title || 'Active Week'}` : `${teacherDefaultClass} ${teacherDefaultSubject}`}
                </h3>
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-sm">
                  Active Week
                </span>
              </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-center">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-2xl">📄</span>
                <p className="text-xs font-bold text-slate-900 mt-1">Lesson Notes</p>
                <p className="text-[10px] text-slate-500">Published</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-2xl">🎥</span>
                <p className="text-xs font-bold text-slate-900 mt-1">Video Lesson</p>
                <p className="text-[10px] text-slate-500">14:20 min HD</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-2xl">📊</span>
                <p className="text-xs font-bold text-slate-900 mt-1">PowerPoint</p>
                <p className="text-[10px] text-slate-500">5 Slides Deck</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-2xl">📝</span>
                <p className="text-xs font-bold text-slate-900 mt-1">Class Exercise</p>
                <p className="text-[10px] text-slate-500">Active</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-2xl">🧠</span>
                <p className="text-xs font-bold text-slate-900 mt-1">Quiz</p>
                <p className="text-[10px] text-slate-500">Auto-Marked</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-2xl">📚</span>
                <p className="text-xs font-bold text-slate-900 mt-1">Assignment</p>
                <p className="text-[10px] text-slate-500">Active</p>
              </div>
            </div>
          </div>

          {/* Class Activities & Student Updates Stream */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-900" />
                  Assigned Classes Activity Stream ({teacherAssignedClasses.join(', ')})
                </h3>
                <p className="text-xs text-slate-500">
                  Real-time submissions, assessments, attendance, and interactions across your teaching classes
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
                {activities.length} Events
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {activities.length > 0 ? (
                activities.slice(0, 6).map((act) => (
                  <div
                    key={act.id}
                    className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80 hover:bg-slate-100/70 transition-colors flex items-start gap-3 text-xs"
                  >
                    <div className="p-2 rounded-lg bg-blue-100/70 text-blue-900 shrink-0 mt-0.5">
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
                          Class {act.classLevel || 'General'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="col-span-2 text-xs text-slate-400 py-6 text-center">
                  No activity recorded for your assigned classes yet today.
                </p>
              )}
            </div>
          </div>

          {/* 1.B MY DAILY TEACHING TIMETABLE & LESSONS */}
          <div data-tour="teacher-schedule-today" className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-blue-100 text-blue-900 font-bold">
                    <Calendar className="w-4 h-4" />
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 font-heading">
                    My Teaching Schedule Today ({getCurrentSchoolDay()})
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {teacherTodaySlots.length} period{teacherTodaySlots.length === 1 ? '' : 's'} assigned today · {teacherTimetableSlots.length} total weekly lessons configured by administration
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('schedule')}
                  className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-900 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1"
                >
                  <span>View Full Schedule</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {teacherTodaySlots.length === 0 ? (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center text-xs text-slate-500">
                <p>No teaching periods scheduled for you on {getCurrentSchoolDay()}. You have {teacherTimetableSlots.length} lessons assigned on other days of the week.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {teacherTodaySlots.map((slot) => {
                  const isActive = isSlotActiveNow(slot);
                  return (
                    <div
                      key={slot.id}
                      className={`p-3.5 rounded-xl border transition-all text-xs ${
                        isActive
                          ? 'bg-emerald-50 border-emerald-300 ring-1 ring-emerald-400'
                          : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="px-2 py-0.5 rounded-md bg-blue-900 text-white font-bold text-[10px]">
                          Period {slot.periodNumber}
                        </span>
                        {isActive ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white font-bold text-[10px] animate-pulse">
                            ACTIVE NOW
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-500 font-semibold">
                            {slot.startTime} – {slot.endTime}
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm truncate">{slot.subject}</h4>
                      <p className="text-[11px] text-slate-500 flex items-center justify-between mt-1">
                        <span>Class: <strong className="text-slate-800">{slot.classLevel}</strong></span>
                        <span>{slot.room || 'Room 201'}</span>
                      </p>
                      {isActive && (
                        <button
                          type="button"
                          onClick={() => {
                            loadTimetableSlotIntoForm(slot);
                            setActiveTab('schedule');
                            setVclassGoLiveImmediate(true);
                          }}
                          className="w-full mt-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[11px] flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Radio className="w-3 h-3 text-amber-300" />
                          <span>Go Live Now</span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      );
    })()}

      {/* 2. LESSON BUILDER (Interactive Lesson, Slide Deck & Quiz Authoring Suite) */}
      {activeTab === 'lesson_builder' && (
        <LessonAuthoringStudio />
      )}

      {/* 2B. LESSON NOTES & AI PLANNER (Ghana NaCCA, Word/PDF & Headmaster Approvals) */}
      {activeTab === 'lesson_notes' && (
        <LessonNotesStudio />
      )}

      {/* 3. MARK ASSIGNMENTS */}
      {activeTab === 'grading' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Student Submissions ({mySubmissions.length})
            </h3>

            <div className="space-y-2">
              {mySubmissions.length === 0 ? (
                <div className="p-4 text-center bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500">
                  No submissions pending for your assigned classes.
                </div>
              ) : (
                mySubmissions.map((sub) => {
                const isSelected = selectedSubmission?.id === sub.id;
                return (
                  <div
                    key={sub.id}
                    onClick={() => {
                      setSelectedSubId(sub.id);
                      setMarksInput(sub.marksAwarded || 17);
                      setFeedbackInput(sub.teacherFeedback || '');
                    }}
                    className={`p-3 rounded-xl border transition-all cursor-pointer text-xs ${
                      isSelected
                        ? 'bg-blue-50 border-blue-900 shadow-xs'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{sub.studentName}</span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded-sm ${
                          sub.status === 'graded'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {sub.status === 'graded' ? `${sub.marksAwarded}/${sub.maxMarks}` : 'Pending'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      {sub.assignmentTitle}
                    </p>
                  </div>
                );
              }))}
            </div>
          </div>

          <div className="lg:col-span-8 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
            {selectedSubmission ? (
              <form onSubmit={handleSaveGrade} className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      {selectedSubmission.studentName} ({selectedSubmission.studentClass})
                    </h3>
                    <p className="text-xs text-slate-500">
                      Submitted: {selectedSubmission.submittedAt}
                    </p>
                  </div>

                  <span className="text-xs text-slate-500">
                    Max Marks: <strong>{selectedSubmission.maxMarks}</strong>
                  </span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Pupil's Submission Content:
                  </label>
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs leading-relaxed text-slate-800 whitespace-pre-line max-h-60 overflow-y-auto">
                    {selectedSubmission.content}
                  </div>
                </div>

                {selectedSubmission.attachmentName && (
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs flex items-center justify-between">
                    <span>Attached: <strong>{selectedSubmission.attachmentName}</strong></span>
                    <button type="button" className="text-blue-900 font-semibold hover:underline">
                      Download Attachment
                    </button>
                  </div>
                )}

                {/* Structured Marking Rubric & Live Score Tally */}
                <div className="space-y-3 pt-2 border-t border-slate-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-bold font-heading text-slate-900 flex items-center gap-1.5">
                        <Award className="w-4 h-4 text-amber-600" />
                        Teacher Marking Rubric (Criterion-Based Tally)
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Adjust individual criterion scores below to automatically tally the pupil's total grade.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-blue-50 border border-blue-200 rounded-lg text-xs font-mono font-bold text-blue-900 tabular-nums">
                        Total: {marksInput} / {selectedSubmission.maxMarks} ({Math.round((marksInput / selectedSubmission.maxMarks) * 100)}%)
                      </span>
                      <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${
                        marksInput >= 16 ? 'bg-emerald-100 text-emerald-800' :
                        marksInput >= 14 ? 'bg-blue-100 text-blue-800' :
                        marksInput >= 12 ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        Grade {marksInput >= 16 ? 'A' : marksInput >= 14 ? 'B' : marksInput >= 12 ? 'C' : 'D'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {rubricCriteria.map((c) => (
                      <div
                        key={c.id}
                        className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <p className="font-bold text-slate-900 text-xs">{c.name}</p>
                          <span className="text-[11px] font-mono font-bold text-slate-600">
                            {c.score} / {c.maxScore} pts
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-snug">{c.description}</p>
                        <div className="flex items-center gap-1.5 pt-1">
                          {[1, 2, 3, 4, 5].map((val) => (
                            <button
                              key={val}
                              type="button"
                              onClick={() => handleUpdateRubricScore(c.id, val)}
                              className={`flex-1 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                                c.score === val
                                  ? 'bg-blue-900 text-white shadow-xs'
                                  : 'bg-white hover:bg-slate-200 text-slate-700 border border-slate-200'
                              }`}
                            >
                              {val}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Teacher Qualitative Remarks &amp; Feedback:
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={feedbackInput}
                      onChange={(e) => setFeedbackInput(e.target.value)}
                      placeholder="e.g. Excellent explanation of RAM volatility and motherboard chipsets..."
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:border-blue-900 leading-relaxed"
                    ></textarea>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
                  >
                    Save Grade &amp; Return Feedback
                  </button>

                  {gradeSuccess && (
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" /> Marks &amp; Feedback saved to gradebook!
                    </span>
                  )}
                </div>
              </form>
            ) : (
              <p className="text-xs text-slate-500">Select a pupil submission from the left.</p>
            )}
          </div>
        </div>
      )}

      {/* 4. QUESTION BANK & QUIZ CREATOR */}
      {activeTab === 'question_bank' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs max-w-3xl mx-auto space-y-6">
          <div>
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
              Examination &amp; Assessment Engine
            </span>
            <h3 className="text-lg font-bold font-heading text-slate-900 mt-0.5">
              Add Question to Salem Question Bank
            </h3>
            <p className="text-xs text-slate-500">
              Create multiple choice, True/False, or Theory questions for automated marking or manual evaluation.
            </p>
          </div>

          {qSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Question successfully saved to the active examination pool!</span>
            </div>
          )}

          <form onSubmit={handleAddQuestionToBank} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">Target Quiz / Exam:</label>
                <input
                  type="text"
                  required
                  value={qBankTitle}
                  onChange={(e) => setQBankTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Class:</label>
                <select
                  value={qClass}
                  onChange={(e) => setQClass(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-bold"
                >
                  {teacherAssignedClasses.map((cls) => (
                    <option key={cls} value={cls}>
                      Class {cls}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Subject:</label>
                <select
                  value={qSubject}
                  onChange={(e) => setQSubject(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-bold truncate"
                >
                  {teacherAssignedSubjects.map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Question Type:</label>
                <select
                  value={qType}
                  onChange={(e) => setQType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                >
                  <option value="mcq">Multiple Choice (MCQ)</option>
                  <option value="true_false">True / False</option>
                  <option value="theory">Theory / Short Answer</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Question Prompt:</label>
              <textarea
                rows={3}
                required
                value={qPrompt}
                onChange={(e) => setQPrompt(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium"
              ></textarea>
            </div>

            {qType === 'mcq' && (
              <div className="space-y-2.5 pt-1">
                <label className="block font-semibold text-slate-700">Options &amp; Correct Answer:</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-500">A.</span>
                    <input
                      type="text"
                      required
                      value={qOptA}
                      onChange={(e) => setQOptA(e.target.value)}
                      className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-500">B.</span>
                    <input
                      type="text"
                      required
                      value={qOptB}
                      onChange={(e) => setQOptB(e.target.value)}
                      className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-500">C.</span>
                    <input
                      type="text"
                      required
                      value={qOptC}
                      onChange={(e) => setQOptC(e.target.value)}
                      className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-500">D.</span>
                    <input
                      type="text"
                      required
                      value={qOptD}
                      onChange={(e) => setQOptD(e.target.value)}
                      className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <span className="font-semibold text-slate-700">Select Correct Option:</span>
                  <div className="flex items-center gap-2">
                    {['A', 'B', 'C', 'D'].map((letter, idx) => (
                      <button
                        type="button"
                        key={letter}
                        onClick={() => setQCorrect(idx)}
                        className={`w-7 h-7 rounded-lg font-bold cursor-pointer transition-colors ${
                          qCorrect === idx ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {letter}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Marks Weight:</label>
              <input
                type="number"
                min={1}
                max={20}
                required
                value={qMarks}
                onChange={(e) => setQMarks(Number(e.target.value))}
                className="w-32 px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-bold"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Add Question to Bank
            </button>
          </form>

          {/* List of existing Assessments for THIS Teacher */}
          <div className="pt-6 border-t border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                My Configured Quizzes &amp; Examinations ({myAssessments.length})
              </h4>
              <span className="text-[11px] text-slate-500 font-medium">
                Isolated to {currentUser?.name}
              </span>
            </div>
            {myAssessments.length === 0 ? (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center text-slate-500 text-xs">
                You have not created any quizzes yet for your assigned classes ({teacherAssignedClasses.join(', ')}).
              </div>
            ) : (
              <div className="space-y-2">
                {myAssessments.map((a) => (
                  <div
                    key={a.id}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{a.title}</span>
                        <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-900 font-bold text-[10px]">
                          {a.classLevel}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        {a.subject} · {a.questions.length} questions · {a.totalMarks} marks · {a.durationMinutes} mins
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleDeleteAssessment(a.id, a.title)}
                        title="Delete Assessment"
                        className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. CLASS GRADEBOOK & PERFORMANCE MATRIX */}
      {activeTab === 'gradebook' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Official Term 1 Gradebook: Basic 7 Computing
              </h3>
              <p className="text-xs text-slate-500">
                Continuous Assessment (30%) + Terminal Examination (70%) = Total 100%
              </p>
            </div>

            <button
              onClick={() => window.print()}
              className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Print Class Gradebook
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Rank</th>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">ID Number</th>
                  <th className="py-3 px-4 text-center">Class Score (30%)</th>
                  <th className="py-3 px-4 text-center">Exam Score (70%)</th>
                  <th className="py-3 px-4 text-center">Total (100%)</th>
                  <th className="py-3 px-4 text-center">Grade</th>
                  <th className="py-3 px-4">Teacher Remark</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {gradebookData.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/50">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{row.rank}</td>
                    <td className="py-3.5 px-4 font-bold text-blue-950">{row.name}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-500">{row.idNum}</td>
                    <td className="py-3.5 px-4 text-center tabular-nums">{row.classScore}/30</td>
                    <td className="py-3.5 px-4 text-center tabular-nums">{row.examScore}/70</td>
                    <td className="py-3.5 px-4 text-center font-bold tabular-nums text-slate-900">
                      {row.total}%
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-sm font-bold text-[11px] ${
                          row.grade === 'A'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {row.grade}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">{row.remarks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. CLASS ATTENDANCE REGISTER */}
      {activeTab === 'attendance' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  Daily Class Attendance Register: {teacherDefaultClass}
                </h3>
                {currentUser?.isClassTeacherOf && (
                  <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 font-bold text-[10px]">
                    ★ Class Teacher of {currentUser.isClassTeacherOf}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                Date: Monday, 12 October 2026 • Teacher: {currentUser?.name || 'Class Master'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                {presentCount} Present
              </span>
              <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                {lateCount} Late
              </span>
              <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
                {absentCount} Absent
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Class</th>
                  <th className="py-3 px-4">Current Status</th>
                  <th className="py-3 px-4 text-center">Toggle Attendance Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {todayAttendance.map((pupil) => (
                  <tr key={pupil.studentId} className="hover:bg-slate-50/50">
                    <td className="py-3.5 px-4 font-semibold text-slate-900">{pupil.studentName}</td>
                    <td className="py-3.5 px-4 text-slate-500">{pupil.classLevel}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          pupil.status === 'present'
                            ? 'bg-emerald-50 text-emerald-800'
                            : pupil.status === 'late'
                            ? 'bg-amber-50 text-amber-800'
                            : 'bg-rose-50 text-rose-800'
                        }`}
                      >
                        {pupil.status === 'present' && '🟢 Present'}
                        {pupil.status === 'late' && '🟡 Late'}
                        {pupil.status === 'absent' && '🔴 Absent'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                        <button
                          type="button"
                          onClick={() => handleToggleAttendance(pupil.studentId, 'present')}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                            pupil.status === 'present'
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          Present
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleAttendance(pupil.studentId, 'late')}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                            pupil.status === 'late'
                              ? 'bg-amber-500 text-slate-950 shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          Late
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleAttendance(pupil.studentId, 'absent')}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                            pupil.status === 'absent'
                              ? 'bg-rose-600 text-white shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          Absent
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end pt-3 border-t border-slate-200">
            <button
              onClick={handleSaveDailyRegister}
              className="px-5 py-2.5 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" /> Save Official Daily Register
            </button>
          </div>
        </div>
      )}

      {/* 7. SCHEDULE LIVE CLASS */}
      {activeTab === 'schedule' && (
        <div className="space-y-6 max-w-4xl mx-auto">
          {/* A. MY OFFICIAL TIMETABLE & TEACHING PERIODS TODAY */}
          <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 rounded-2xl p-5 sm:p-6 text-white border border-blue-900/60 shadow-lg space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/10">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-amber-400 text-slate-950 font-bold">
                    <Calendar className="w-4 h-4" />
                  </span>
                  <h3 className="text-base font-bold font-heading text-white">
                    My Teaching Timetable Schedule ({getCurrentSchoolDay()})
                  </h3>
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  Assigned lecture slots for <strong className="text-amber-300">{currentUser?.name}</strong>. Live classroom broadcasts must follow your official school teaching periods.
                </p>
              </div>

              {activeSlotNow ? (
                <span className="px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1.5 animate-pulse self-start sm:self-auto">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  Teaching Period Active: Period {activeSlotNow.periodNumber} ({activeSlotNow.subject})
                </span>
              ) : (
                <span className="px-3 py-1.5 rounded-full bg-white/10 text-slate-300 border border-white/10 text-xs font-medium self-start sm:self-auto">
                  ⏰ Next slot follows master timetable
                </span>
              )}
            </div>

            {/* Day Selector Tabs for Weekly Schedule */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-white/10">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] as const).map((day) => {
                  const isToday = day === getCurrentSchoolDay();
                  const isSelected = day === selectedScheduleDay;
                  const dayCount = teacherTimetableSlots.filter((s) => s.day === day).length;

                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => setSelectedScheduleDay(day)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-amber-400 text-slate-950 shadow-sm'
                          : 'bg-white/10 text-white hover:bg-white/20'
                      }`}
                    >
                      <span>{day}</span>
                      <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                        isSelected ? 'bg-slate-900 text-white' : 'bg-white/20 text-slate-200'
                      }`}>
                        {dayCount}
                      </span>
                      {isToday && (
                        <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-slate-950' : 'bg-emerald-400'}`} />
                      )}
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => setActiveNav('timetable')}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-amber-300 text-xs font-semibold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                title="View full school routine"
              >
                <span>Master Timetable View</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* List of Periods for the Selected Day */}
            {(() => {
              const selectedDaySlots = teacherTimetableSlots
                .filter((s) => s.day === selectedScheduleDay)
                .sort((a, b) => a.periodNumber - b.periodNumber);

              if (selectedDaySlots.length === 0) {
                return (
                  <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-xs text-slate-300 flex flex-col sm:flex-row items-center justify-between gap-2">
                    <p>No lectures scheduled for you on {selectedScheduleDay}. You have {teacherTimetableSlots.length} weekly periods assigned across other days of the week.</p>
                    <span className="text-[11px] text-amber-300 font-semibold shrink-0">Teacher: {currentUser?.name}</span>
                  </div>
                );
              }

              return (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {selectedDaySlots.map((slot) => {
                    const isActive = isSlotActiveNow(slot);
                    const isSelected = selectedTimetableSlotId === slot.id;
                    return (
                      <div
                        key={slot.id}
                        onClick={() => loadTimetableSlotIntoForm(slot)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer text-xs relative ${
                          isActive
                            ? 'bg-emerald-950/60 border-emerald-500 ring-2 ring-emerald-400/40 shadow-md'
                            : isSelected
                            ? 'bg-blue-900/60 border-amber-400 shadow-xs'
                            : 'bg-white/5 border-white/10 hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="px-2 py-0.5 rounded-md bg-white/10 text-amber-300 font-bold text-[11px]">
                            Period {slot.periodNumber}
                          </span>
                          {isActive ? (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-bold text-[10px] animate-pulse">
                              ACTIVE NOW
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-400 font-medium">
                              {slot.startTime} - {slot.endTime}
                            </span>
                          )}
                        </div>

                        <h4 className="font-bold text-white text-sm truncate">{slot.subject}</h4>
                        <p className="text-[11px] text-slate-300 mt-0.5 flex items-center justify-between">
                          <span>Class: <strong className="text-white">{slot.classLevel}</strong></span>
                          <span>{slot.room || 'Room 301'}</span>
                        </p>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            loadTimetableSlotIntoForm(slot);
                            setVclassGoLiveImmediate(true);
                          }}
                          className={`w-full mt-3 py-1.5 rounded-lg font-bold text-[11px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                            isActive
                              ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                              : 'bg-white/10 hover:bg-white/20 text-white'
                          }`}
                        >
                          <Radio className="w-3 h-3 text-amber-300" />
                          <span>{isActive ? 'Go Live for Period' : 'Select Period Slot'}</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>

          {/* B. SCHEDULE / LAUNCH VCLASS FORM */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Broadcast Launcher: {currentUser?.name}
                </h3>
                <p className="text-xs text-slate-500">
                  Launch an isolated live classroom stage for your assigned subject and enrolled pupils.
                </p>
              </div>
              <span className="px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5" /> Isolated Studio
              </span>
            </div>

            <form onSubmit={handleScheduleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Class Topic &amp; Title:</label>
                <input
                  type="text"
                  required
                  value={vclassTitle}
                  onChange={(e) => setVclassTitle(e.target.value)}
                  placeholder="e.g. Basic 7 Integrated Science: Cell Biology & Microscopes"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-900 font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Teaching Subject:</label>
                  <select
                    value={vclassSubject}
                    onChange={(e) => setVclassSubject(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-900 font-medium"
                  >
                    <option value="Computing">Computing</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Integrated Science">Integrated Science</option>
                    <option value="English Language">English Language</option>
                    <option value="French">French</option>
                    <option value="Social Studies">Social Studies</option>
                    <option value="Creative Arts">Creative Arts</option>
                    <option value="Montessori Practical Life">Montessori Practical Life</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Class Level (Isolated to Pupils in this Class):</label>
                  <select
                    value={vclassClassLevel}
                    onChange={(e) => setVclassClassLevel(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-900 font-medium"
                  >
                    <option value="B7">Basic 7 (JHS 1)</option>
                    <option value="B8">Basic 8 (JHS 2)</option>
                    <option value="B9">Basic 9 (JHS 3)</option>
                    <option value="B4">Basic 4 (Primary)</option>
                    <option value="B5">Basic 5 (Primary)</option>
                    <option value="B6">Basic 6 (Primary)</option>
                    <option value="KG1">KG 1 (Kindergarten)</option>
                    <option value="KG2">KG 2 (Kindergarten)</option>
                    <option value="All Classes">All School Enrolled Pupils</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Date:</label>
                  <input
                    type="text"
                    required
                    value={vclassDate}
                    onChange={(e) => setVclassDate(e.target.value)}
                    placeholder="e.g. Today, 12 Oct"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Teaching Time / Period:</label>
                  <input
                    type="text"
                    required
                    value={vclassTime}
                    onChange={(e) => setVclassTime(e.target.value)}
                    placeholder="e.g. 09:55 AM - 10:45 AM"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Duration (Minutes):</label>
                  <input
                    type="number"
                    min={15}
                    max={120}
                    required
                    value={vclassDuration}
                    onChange={(e) => setVclassDuration(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Meeting Agenda &amp; Key Concepts:</label>
                <textarea
                  rows={2}
                  value={vclassAgenda}
                  onChange={(e) => setVclassAgenda(e.target.value)}
                  placeholder="Overview of topics and questions to be tackled during the live class..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 resize-none"
                />
              </div>

              <div className="flex items-center gap-2 p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl">
                <input
                  type="checkbox"
                  id="goliveImmediate"
                  checked={vclassGoLiveImmediate}
                  onChange={(e) => setVclassGoLiveImmediate(e.target.checked)}
                  className="w-4 h-4 accent-blue-900 rounded cursor-pointer"
                />
                <label htmlFor="goliveImmediate" className="font-semibold text-blue-950 cursor-pointer text-xs flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-rose-600" />
                  <span>Go Live Immediately (Verify Timetable Period &amp; Launch Live Studio)</span>
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2 text-xs sm:text-sm"
              >
                <Calendar className="w-4 h-4 text-amber-400" />
                {vclassGoLiveImmediate ? 'Verify Timetable & Launch Live Stage' : 'Schedule & Broadcast VClass'}
              </button>
            </form>

            {/* List of Scheduled VClasses for THIS Teacher */}
            {(() => {
              const myVClasses = vclasses.filter(
                (v) =>
                  v.teacherId === currentUser?.id ||
                  v.teacherName?.toLowerCase() === currentUser?.name?.toLowerCase()
              );
              return (
                <div className="pt-6 border-t border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      My Scheduled &amp; Active VClasses ({myVClasses.length})
                    </h4>
                    <span className="text-[11px] text-slate-500 font-medium">
                      Isolated to {currentUser?.name}
                    </span>
                  </div>

                  {myVClasses.length === 0 ? (
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center text-slate-500 text-xs">
                      <p>You have no active or scheduled VClasses yet. Select a timetable period above to go live or schedule.</p>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {myVClasses.map((v) => (
                        <div
                          key={v.id}
                          className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition-all ${
                            v.isLive || v.status === 'live'
                              ? 'bg-rose-50/70 border-rose-300 shadow-xs'
                              : 'bg-slate-50 border-slate-200'
                          }`}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              {v.isLive || v.status === 'live' ? (
                                <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white font-bold text-[10px] animate-pulse flex items-center gap-1">
                                  <Radio className="w-3 h-3" /> LIVE NOW
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-semibold text-[10px]">
                                  Scheduled
                                </span>
                              )}
                              <span className="font-bold text-slate-900">{v.title}</span>
                            </div>
                            <p className="text-[11px] text-slate-500 flex flex-wrap items-center gap-2">
                              <span className="font-semibold text-blue-900">{v.subject}</span>
                              <span>·</span>
                              <span>Target: <strong>Class {v.classLevel}</strong></span>
                              <span>·</span>
                              <span>{v.date} at {v.time}</span>
                              <span>·</span>
                              <span>{v.durationMinutes} mins</span>
                              <span>·</span>
                              <span>{v.attendeesCount || 0} enrolled pupils</span>
                            </p>
                          </div>

                          <div className="flex items-center gap-2 self-start sm:self-auto">
                            {v.isLive || v.status === 'live' ? (
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveVClassId(v.id);
                                  setActiveNav('vclass');
                                }}
                                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                              >
                                <Video className="w-3.5 h-3.5" />
                                Enter My Live Stage
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleGoLiveForSession(v)}
                                className="px-3 py-1.5 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
                              >
                                <Radio className="w-3.5 h-3.5 text-amber-400" />
                                Go Live Now
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => handleDeleteVClass(v.id, v.title)}
                              title="Cancel VClass"
                              className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* 8. CREATE & MANAGE ASSIGNMENTS */}
      {activeTab === 'new_assignment' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs max-w-2xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {editingAssignmentId ? 'Edit Class Assignment' : 'Create New Class Assignment'}
              </h3>
              <p className="text-xs text-slate-500">
                {editingAssignmentId ? 'Update prompt and deadlines.' : 'Publish coursework or project homework to students.'}
              </p>
            </div>
            {editingAssignmentId && (
              <button
                type="button"
                onClick={() => {
                  setEditingAssignmentId(null);
                  setNewAssignTitle('');
                  setNewAssignPrompt('');
                }}
                className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" /> Cancel Edit
              </button>
            )}
          </div>

          <form onSubmit={handleCreateAssignment} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Assignment Title:</label>
              <input
                type="text"
                required
                value={newAssignTitle}
                onChange={(e) => setNewAssignTitle(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Class:</label>
                <select
                  value={newAssignClass}
                  onChange={(e) => setNewAssignClass(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-bold"
                >
                  {teacherAssignedClasses.map((cls) => (
                    <option key={cls} value={cls}>
                      Class {cls}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Subject:</label>
                <select
                  value={newAssignSubject}
                  onChange={(e) => setNewAssignSubject(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-bold"
                >
                  {teacherAssignedSubjects.map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Due Date:</label>
                <input
                  type="text"
                  required
                  value={newAssignDue}
                  onChange={(e) => setNewAssignDue(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Assignment Questions / Prompt:</label>
              <textarea
                rows={4}
                required
                value={newAssignPrompt}
                onChange={(e) => setNewAssignPrompt(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              {editingAssignmentId ? 'Save Assignment Changes' : 'Publish Assignment to Pupils'}
            </button>
          </form>

          {/* List of Existing Assignments */}
          <div className="pt-6 border-t border-slate-200 space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Published Course Assignments ({myAssignments.length})
            </h4>
            <div className="space-y-2">
              {myAssignments.length === 0 ? (
                <div className="p-4 text-center bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500">
                  No assignments published yet for your classes.
                </div>
              ) : (
                myAssignments.map((ass) => (
                <div
                  key={ass.id}
                  className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-900">{ass.title}</span>
                    <p className="text-[11px] text-slate-500">
                      {ass.classLevel} · {ass.subject} · Due: {ass.dueDate} · {ass.totalMarks} Marks · {ass.submissionsCount} submissions
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openEditAssignment(ass)}
                      title="Edit Assignment"
                      className="p-1.5 text-slate-500 hover:text-blue-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteAssignment(ass.id, ass.title)}
                      title="Delete Assignment"
                      className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )))}
            </div>
          </div>
        </div>
      )}

      {/* TIMETABLE RESTRICTION & AUTHORIZATION MODAL */}
      {timetableModal.show && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-amber-100 text-amber-800 shrink-0">
                <ShieldAlert className="w-6 h-6 text-amber-700" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900 font-heading">
                  Timetable Period Check
                </h3>
                <p className="text-xs text-slate-600">
                  {timetableModal.reason}
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2 text-xs">
              <p className="font-bold text-amber-950 flex items-center gap-1.5">
                <Info className="w-4 h-4 text-amber-700" /> School Live Broadcast Policy:
              </p>
              <p className="text-amber-900 leading-relaxed">
                Live sessions are strictly scheduled in accordance with the school master timetable to prevent pupil lecture collisions across simultaneous subjects.
              </p>

              {timetableModal.scheduledSlotToday && (
                <div className="mt-2 p-2.5 bg-white rounded-lg border border-amber-300 flex items-center justify-between text-[11px]">
                  <div>
                    <p className="font-bold text-slate-900">Official Slot Today: Period {timetableModal.scheduledSlotToday.periodNumber}</p>
                    <p className="text-slate-500">{timetableModal.scheduledSlotToday.startTime} - {timetableModal.scheduledSlotToday.endTime} ({timetableModal.scheduledSlotToday.subject} - {timetableModal.scheduledSlotToday.classLevel})</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (timetableModal.scheduledSlotToday) {
                        loadTimetableSlotIntoForm(timetableModal.scheduledSlotToday);
                      }
                      setTimetableModal({ show: false, reason: '', subject: '', classLevel: '' });
                    }}
                    className="px-2.5 py-1 bg-blue-900 text-white font-bold rounded-md hover:bg-blue-800 cursor-pointer"
                  >
                    Select Slot
                  </button>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setTimetableModal({ show: false, reason: '', subject: '', classLevel: '' })}
                className="w-full sm:w-auto px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs cursor-pointer"
              >
                Return to Timetable
              </button>

              <button
                type="button"
                onClick={() => {
                  const targetId = timetableModal.targetSessionId;
                  setTimetableModal({ show: false, reason: '', subject: '', classLevel: '' });
                  if (targetId) {
                    startVClass(targetId);
                    setActiveVClassId(targetId);
                    setActiveNav('vclass');
                  } else {
                    executeCreateAndBroadcast(true);
                  }
                }}
                className="w-full sm:w-auto px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-xl text-xs cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Radio className="w-3.5 h-3.5 text-amber-400" />
                Conduct Authorized Makeup Lecture
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIDEO PREVIEW MODAL */}
      {videoPreviewUrl && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-950 rounded-2xl max-w-2xl w-full p-4 sm:p-6 shadow-2xl border border-slate-800 space-y-3 relative text-white">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h4 className="font-bold text-sm text-white flex items-center gap-2">
                <Video className="w-4 h-4 text-rose-500" />
                <span>Lesson Video Lecture (In-App Player)</span>
              </h4>
              <button
                type="button"
                onClick={() => setVideoPreviewUrl(null)}
                className="text-slate-400 hover:text-white p-1 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <YouTubePlayer
              url={videoPreviewUrl}
              title="Classroom Video Lecture"
              autoPlay={true}
              className="w-full"
            />

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setVideoPreviewUrl(null)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold cursor-pointer"
              >
                Close Player
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
