import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  BookOpen,
  ChevronRight,
  CheckCircle2,
  FileText,
  Video,
  Presentation,
  Play,
  Pause,
  BrainCircuit,
  FileCheck2,
  Shapes,
  Volume2,
  VolumeX,
  Sparkles,
  Download,
  RotateCcw,
  Check,
  Edit2,
  Trash2,
  Plus,
  X,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { YouTubePlayer } from '../common/YouTubePlayer';
import { extractYouTubeUrlsFromText } from '../../utils/youtube';

export const CourseView: React.FC = () => {
  const {
    courses,
    activeCourseId,
    setActiveCourseId,
    activeLessonId,
    setActiveLessonId,
    markLessonComplete,
    setActiveAssessmentId,
    setActiveNav,
    setActiveActivityId,
    speakText,
    isSpeaking,
    stopSpeaking,
    updateCourse,
    deleteCourse,
    addCourse,
    currentRole,
    currentUser,
    classes,
    subjects,
  } = useApp();

  // Filter courses based on role & permissions:
  // - Teachers: can ONLY access and view their own courses (assigned to or authored by them)
  // - Students: can ONLY access courses for their enrolled classLevel (or All Classes)
  // - Admin: can view all school courses
  const availableCourses = courses.filter((c) => {
    if (currentRole === 'teacher') {
      const isAuthor =
        c.teacherId === currentUser?.id ||
        c.teacherName?.toLowerCase() === currentUser?.name?.toLowerCase();
      const teachesSubject = currentUser?.assignedSubjects?.includes(c.subject);
      const teachesClass = currentUser?.assignedClasses?.includes(c.classLevel);
      return isAuthor || (teachesSubject && teachesClass);
    }
    if (currentRole === 'student') {
      return c.classLevel === currentUser?.classLevel || c.classLevel === 'All Classes';
    }
    return true; // admin and parents can view
  });

  const currentCourse =
    availableCourses.find((c) => c.id === activeCourseId) || availableCourses[0];

  if (!currentCourse) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-4">
        <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
        <div>
          <h3 className="text-base font-bold text-slate-900">
            {currentRole === 'teacher'
              ? 'No Curriculum Courses Authored Yet'
              : 'No Courses Enrolled for Your Class'}
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            {currentRole === 'teacher'
              ? `As a ${currentUser?.assignedSubjects?.join(', ') || 'faculty'} teacher, courses you author for ${currentUser?.assignedClasses?.join(', ') || 'your classes'} will be isolated here.`
              : `Your teachers will publish interactive syllabus units and lessons for ${currentUser?.classLevel || 'your class'} soon.`}
          </p>
        </div>
        {currentRole === 'teacher' && (
          <button
            type="button"
            onClick={() => {
              setCourseFormData({
                title: `${currentUser?.assignedClasses?.[0] || 'B7'} ${currentUser?.assignedSubjects?.[0] || 'Subject'} Core Syllabus`,
                subject: currentUser?.assignedSubjects?.[0] || subjects[0]?.name || 'Computing',
                classLevel: currentUser?.assignedClasses?.[0] || classes[0]?.classLevel || 'B7',
                teacherName: currentUser?.name || 'Assigned Faculty',
                term: 'Term 1',
                academicYear: '2026/2027',
                description: 'Comprehensive curriculum strand notes, lesson slides, and interactive reviews.',
              });
              setCourseModalMode('create');
            }}
            className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" /> Create Course for My Class
          </button>
        )}
      </div>
    );
  }

  // Active tab within the lesson: 'notes' | 'video' | 'slides' | 'exercise'
  const [activeTab, setActiveTab] = useState<'notes' | 'video' | 'slides' | 'exercise'>('notes');
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState<boolean>(false);
  const [exerciseAnswer, setExerciseAnswer] = useState<string>('');
  const [isExerciseSubmitted, setIsExerciseSubmitted] = useState<boolean>(false);

  // Find active lesson or default to B7 Computing Week 4 Lesson 1
  let activeLesson = currentCourse.strands
    .flatMap((s) => s.weeks)
    .flatMap((w) => w.lessons)
    .find((l) => l.id === activeLessonId);

  if (!activeLesson && currentCourse.strands.length > 0) {
    const allLessons = currentCourse.strands.flatMap((s) => s.weeks).flatMap((w) => w.lessons);
    if (allLessons.length > 0) {
      activeLesson = allLessons[allLessons.length - 1]; // active current lesson
    }
  }

  const handleLessonCompletion = (lessonId: string) => {
    markLessonComplete(currentCourse.id, lessonId);
    confetti({
      particleCount: 60,
      spread: 60,
      origin: { y: 0.7 },
    });
  };

  const handleReadLessonNotes = () => {
    if (!activeLesson) return;
    if (isSpeaking) {
      stopSpeaking();
    } else {
      speakText(`${activeLesson.title}. Objectives: ${activeLesson.objectives.join('. ')}. Notes: ${activeLesson.lessonNotes}`);
    }
  };

  // Course Management State & Handlers
  const [courseModalMode, setCourseModalMode] = useState<'create' | 'edit' | null>(null);
  const [courseFormData, setCourseFormData] = useState({
    title: '',
    subject: '',
    classLevel: '',
    teacherName: '',
    term: 'Term 1',
    academicYear: '2026/2027',
    description: '',
  });

  const canManageCourse = currentRole === 'admin' || currentRole === 'teacher';

  const openEditModal = () => {
    setCourseFormData({
      title: currentCourse.title,
      subject: currentCourse.subject,
      classLevel: currentCourse.classLevel,
      teacherName: currentCourse.teacherName,
      term: currentCourse.term || 'Term 1',
      academicYear: currentCourse.academicYear || '2026/2027',
      description: currentCourse.description || '',
    });
    setCourseModalMode('edit');
  };

  const openCreateModal = () => {
    setCourseFormData({
      title: '',
      subject:
        (currentRole === 'teacher' ? currentUser?.assignedSubjects?.[0] : null) ||
        subjects[0]?.name ||
        'Computing',
      classLevel:
        (currentRole === 'teacher' ? currentUser?.assignedClasses?.[0] : null) ||
        classes[0]?.classLevel ||
        'B7',
      teacherName: currentUser?.name || 'Assigned Faculty',
      term: 'Term 1',
      academicYear: '2026/2027',
      description: '',
    });
    setCourseModalMode('create');
  };

  const handleSaveCourseForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseFormData.title.trim()) return;

    if (courseModalMode === 'edit') {
      updateCourse(currentCourse.id, {
        title: courseFormData.title.trim(),
        subject: courseFormData.subject.trim(),
        classLevel: courseFormData.classLevel.trim(),
        teacherName: courseFormData.teacherName.trim(),
        term: courseFormData.term.trim(),
        academicYear: courseFormData.academicYear.trim(),
        description: courseFormData.description.trim(),
      });
    } else if (courseModalMode === 'create') {
      addCourse({
        title: courseFormData.title.trim(),
        subject: courseFormData.subject.trim(),
        classLevel: courseFormData.classLevel.trim(),
        teacherName: courseFormData.teacherName.trim(),
        teacherId: currentUser?.id || 'tea-faculty',
        teacherAvatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150',
        term: courseFormData.term.trim(),
        academicYear: courseFormData.academicYear.trim(),
        description: courseFormData.description.trim(),
      });
    }
    setCourseModalMode(null);
  };

  const handleDeleteCourse = () => {
    if (window.confirm(`Are you sure you want to delete course "${currentCourse.title}"? This will remove all associated strands and lessons.`)) {
      deleteCourse(currentCourse.id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Course Switcher Sub-Menu Bar */}
      {availableCourses.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0 mr-1">
            Enrolled Subjects:
          </span>
          {availableCourses.map((c) => {
            const isSelected = c.id === currentCourse.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  setActiveCourseId(c.id);
                  const firstLesson = c.strands?.[0]?.weeks?.[0]?.lessons?.[0];
                  if (firstLesson) setActiveLessonId(firstLesson.id);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-blue-900 text-white shadow-xs ring-1 ring-blue-900'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 shadow-2xs'
                }`}
              >
                <span>{c.subject}</span>
                <span className={`text-[10px] ${isSelected ? 'text-blue-200' : 'text-slate-400'}`}>
                  ({c.progressPercentage}%)
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Course Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
              <span className="text-blue-900 font-bold">{currentCourse.academicYear}</span>
              <span>·</span>
              <span>{currentCourse.term}</span>
              <span>·</span>
              <span className="text-slate-800 font-bold">{currentCourse.classLevel}</span>
              <span>·</span>
              <span>{currentCourse.subject}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold font-heading text-slate-900">
              {currentCourse.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl">
              {currentCourse.description}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <img
                  src={currentCourse.teacherAvatar}
                  alt={currentCourse.teacherName}
                  referrerPolicy="no-referrer"
                  className="w-6 h-6 rounded-full object-cover"
                />
                <span>Course Instructor: <strong className="text-slate-900">{currentCourse.teacherName}</strong></span>
              </div>

              {canManageCourse && (
                <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200">
                  <button
                    type="button"
                    onClick={openEditModal}
                    className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-900 rounded-lg text-xs font-bold flex items-center gap-1 border border-blue-200 cursor-pointer transition-colors"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Edit Course</span>
                  </button>
                  <button
                    type="button"
                    onClick={openCreateModal}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold flex items-center gap-1 border border-slate-200 cursor-pointer transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    <span>New Course</span>
                  </button>
                  {courses.length > 1 && (
                    <button
                      type="button"
                      onClick={handleDeleteCourse}
                      className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-bold flex items-center gap-1 border border-rose-200 cursor-pointer transition-colors"
                      title="Delete Course"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Course Progress Widget */}
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl min-w-[240px] space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-700">Course Progress</span>
              <span className="font-bold text-emerald-700 text-sm tabular-nums">
                {currentCourse.progressPercentage}%
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-emerald-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${currentCourse.progressPercentage}%` }}
              ></div>
            </div>
            <p className="text-[11px] text-slate-500">
              {currentCourse.progressPercentage >= 100
                ? 'All term strands completed! 🎉'
                : 'Current Unit: Week 4 Computer Hardware'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Course Workspace Layout: Left Sidebar Tree + Right Lesson Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Curriculum Navigator (Strand -> Week -> Lesson) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-900" />
              Course Curriculum
            </h3>

            <div className="space-y-4">
              {currentCourse.strands.map((strand) => (
                <div key={strand.id} className="space-y-2">
                  <div className="text-xs font-bold text-blue-950 uppercase tracking-wide bg-blue-50/70 p-2 rounded-lg">
                    {strand.name}
                  </div>

                  <div className="space-y-3 pl-2">
                    {strand.weeks.map((week) => (
                      <div key={week.id} className="space-y-1.5">
                        <p className="text-[11px] font-semibold text-slate-500">
                          {week.title}
                        </p>

                        <div className="space-y-1">
                          {week.lessons.map((lesson) => {
                            const isCurrent = activeLesson?.id === lesson.id;
                            return (
                              <button
                                key={lesson.id}
                                onClick={() => setActiveLessonId(lesson.id)}
                                className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left text-xs transition-all cursor-pointer ${
                                  isCurrent
                                    ? 'bg-blue-900 text-white font-semibold shadow-xs'
                                    : 'hover:bg-slate-100 text-slate-700'
                                }`}
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  {lesson.isCompleted ? (
                                    <CheckCircle2
                                      className={`w-4 h-4 shrink-0 ${
                                        isCurrent ? 'text-emerald-300' : 'text-emerald-600'
                                      }`}
                                    />
                                  ) : (
                                    <div
                                      className={`w-2 h-2 rounded-full shrink-0 ${
                                        isCurrent ? 'bg-amber-300' : 'bg-slate-300'
                                      }`}
                                    />
                                  )}
                                  <span className="truncate">{lesson.title}</span>
                                </div>
                                <ChevronRight
                                  className={`w-3.5 h-3.5 shrink-0 ${
                                    isCurrent ? 'text-white' : 'text-slate-400'
                                  }`}
                                />
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Course Switcher for Other Enrolled Classes */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Other Enrolled Classes
            </h4>
            <div className="space-y-1.5">
              {courses
                .filter((c) => c.id !== currentCourse.id)
                .map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setActiveCourseId(c.id);
                      setActiveLessonId(null);
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-100 hover:text-blue-900 transition-colors text-left"
                  >
                    <span>{c.title}</span>
                    <span className="text-slate-400 font-normal">{c.progressPercentage}%</span>
                  </button>
                ))}
            </div>
          </div>
        </div>

        {/* Right Active Lesson Content Deck */}
        <div className="lg:col-span-8 space-y-6">
          {activeLesson ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              {/* Lesson Top Bar & Objectives */}
              <div className="p-6 border-b border-slate-200 bg-slate-50/50">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
                  <div>
                    <span className="text-xs font-bold text-blue-900 uppercase tracking-wider">
                      Week {activeLesson.weekNumber} Lesson
                    </span>
                    <h2 className="text-xl sm:text-2xl font-bold font-heading text-slate-900 mt-0.5">
                      {activeLesson.title}
                    </h2>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleReadLessonNotes}
                      className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-white text-xs font-medium text-slate-700 flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      {isSpeaking ? (
                        <>
                          <VolumeX className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
                          <span>Stop Voice</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3.5 h-3.5 text-blue-900" />
                          <span>Read Aloud</span>
                        </>
                      )}
                    </button>

                    {activeLesson.isCompleted ? (
                      <span className="px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5" /> Completed
                      </span>
                    ) : (
                      <button
                        onClick={() => activeLesson && handleLessonCompletion(activeLesson.id)}
                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Mark Completed
                      </button>
                    )}
                  </div>
                </div>

                {/* Learning Objectives Box */}
                {activeLesson.objectives.length > 0 && (
                  <div className="bg-blue-50/60 border border-blue-200/60 rounded-xl p-3.5 mt-2">
                    <p className="text-xs font-bold text-blue-950 mb-1.5">🎯 Learning Objectives:</p>
                    <ul className="space-y-1 text-xs text-blue-900 list-disc list-inside">
                      {activeLesson.objectives.map((obj, i) => (
                        <li key={i}>{obj}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Lesson Media Tabs */}
              <div className="flex items-center gap-1 px-6 pt-3 border-b border-slate-200 bg-white overflow-x-auto">
                <button
                  onClick={() => setActiveTab('notes')}
                  className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                    activeTab === 'notes'
                      ? 'border-blue-900 text-blue-900'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  📄 Lesson Notes
                </button>

                {activeLesson.videoDuration && (
                  <button
                    onClick={() => setActiveTab('video')}
                    className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                      activeTab === 'video'
                        ? 'border-blue-900 text-blue-900'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Video className="w-3.5 h-3.5" />
                    🎥 Video Lesson ({activeLesson.videoDuration})
                  </button>
                )}

                {activeLesson.pptSlides && activeLesson.pptSlides.length > 0 && (
                  <button
                    onClick={() => setActiveTab('slides')}
                    className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                      activeTab === 'slides'
                        ? 'border-blue-900 text-blue-900'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Presentation className="w-3.5 h-3.5" />
                    📊 PowerPoint Slides ({activeLesson.pptSlides.length})
                  </button>
                )}

                {activeLesson.exercisePrompt && (
                  <button
                    onClick={() => setActiveTab('exercise')}
                    className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                      activeTab === 'exercise'
                        ? 'border-blue-900 text-blue-900'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <FileCheck2 className="w-3.5 h-3.5" />
                    📝 Class Exercise
                  </button>
                )}
              </div>

              {/* Tab Contents */}
              <div className="p-6">
                {/* 1. LESSON NOTES */}
                {activeTab === 'notes' && (
                  <div className="space-y-5">
                    {/* Embedded YouTube Video in Lesson Notes if present */}
                    {(() => {
                      const youtubeUrl = activeLesson.youtubeUrl || (extractYouTubeUrlsFromText(activeLesson.lessonNotes)[0]);
                      if (!youtubeUrl) return null;
                      return (
                        <div className="space-y-2 bg-gradient-to-br from-slate-900 to-slate-950 p-4 sm:p-5 rounded-2xl border border-slate-800 shadow-lg text-white">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="p-1.5 rounded-lg bg-rose-600/30 text-rose-400 border border-rose-500/30">
                                <Video className="w-4 h-4" />
                              </span>
                              <div>
                                <h4 className="font-bold text-xs sm:text-sm text-white flex items-center gap-2">
                                  <span>Attached Video Lecture</span>
                                  <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white font-bold text-[9px] uppercase tracking-wider">
                                    In-App Playback
                                  </span>
                                </h4>
                                <p className="text-[11px] text-slate-400">
                                  Plays within Salem VClass without leaving this page
                                </p>
                              </div>
                            </div>
                            <span className="text-[11px] font-semibold text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-full border border-amber-400/20 hidden sm:inline-flex items-center gap-1">
                              <Sparkles className="w-3 h-3" /> Interactive
                            </span>
                          </div>

                          <YouTubePlayer
                            url={youtubeUrl}
                            title={activeLesson.videoTitle || `${activeLesson.title} — Lecture Video`}
                            className="w-full mt-2"
                          />
                        </div>
                      );
                    })()}

                    <div className="prose prose-slate max-w-none text-xs sm:text-sm leading-relaxed text-slate-800 whitespace-pre-line bg-slate-50 p-5 rounded-xl border border-slate-200 shadow-2xs">
                      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
                        <span className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5" /> Teacher's Lesson Study Notes
                        </span>
                        <span className="text-[11px] text-slate-500 font-medium">
                          Week {activeLesson.weekNumber} · {currentCourse.classLevel}
                        </span>
                      </div>
                      {activeLesson.lessonNotes}
                    </div>

                    {/* Integrated Interactive Action Links */}
                    <div className="pt-4 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {activeLesson.interactiveActivityId && (
                        <button
                          onClick={() => {
                            if (activeLesson?.interactiveActivityId) {
                              setActiveActivityId(activeLesson.interactiveActivityId);
                            }
                            setActiveNav('montessori');
                          }}
                          className="p-3 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 transition-colors text-left group cursor-pointer shadow-2xs"
                        >
                          <p className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                            <Shapes className="w-4 h-4 text-amber-600" />
                            Montessori Lab
                          </p>
                          <p className="text-[11px] text-amber-700 mt-1">
                            Interactive tactile object classification
                          </p>
                        </button>
                      )}

                      {activeLesson.quizId && (
                        <button
                          onClick={() => {
                            if (activeLesson?.quizId) {
                              setActiveAssessmentId(activeLesson.quizId);
                            }
                            setActiveNav('quizzes');
                          }}
                          className="p-3 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 transition-colors text-left group cursor-pointer shadow-2xs"
                        >
                          <p className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
                            <BrainCircuit className="w-4 h-4 text-blue-900" />
                            Lesson Quiz
                          </p>
                          <p className="text-[11px] text-blue-700 mt-1">
                            5 questions with instant auto-grading
                          </p>
                        </button>
                      )}

                      {activeLesson.assignmentId && (
                        <button
                          onClick={() => setActiveNav('assignments')}
                          className="p-3 rounded-xl border border-purple-200 bg-purple-50 hover:bg-purple-100 transition-colors text-left group cursor-pointer shadow-2xs"
                        >
                          <p className="text-xs font-bold text-purple-950 flex items-center gap-1.5">
                            <FileCheck2 className="w-4 h-4 text-purple-700" />
                            Unit Assignment
                          </p>
                          <p className="text-[11px] text-purple-700 mt-1">
                            20 marks • Due Friday
                          </p>
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* 2. VIDEO LESSON PLAYER */}
                {activeTab === 'video' && (
                  <div className="space-y-4">
                    {activeLesson.youtubeUrl || extractYouTubeUrlsFromText(activeLesson.lessonNotes)[0] ? (
                      <div className="space-y-3">
                        <YouTubePlayer
                          url={activeLesson.youtubeUrl || extractYouTubeUrlsFromText(activeLesson.lessonNotes)[0]}
                          title={activeLesson.videoTitle || `${activeLesson.title} — Lecture Video`}
                          autoPlay={false}
                        />
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <p className="font-semibold text-slate-900">{activeLesson.videoTitle || activeLesson.title}</p>
                            <p className="text-[11px] text-slate-500">
                              Integrated within Salem Montessori VClass Player • Term 1 2026/2027
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setActiveTab('notes')}
                            className="text-blue-900 font-semibold hover:underline flex items-center gap-1 text-xs cursor-pointer"
                          >
                            <FileText className="w-3.5 h-3.5" /> Read Lesson Notes
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="relative aspect-video rounded-xl bg-slate-950 overflow-hidden flex flex-col items-center justify-center text-white border border-slate-800 shadow-md">
                          <div className="text-center p-6 space-y-3 z-10">
                            <div className="w-16 h-16 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md flex items-center justify-center mx-auto transition-transform hover:scale-105 cursor-pointer">
                              <button
                                onClick={() => setIsVideoPlaying(!isVideoPlaying)}
                                className="text-amber-400 focus:outline-hidden"
                              >
                                {isVideoPlaying ? (
                                  <Pause className="w-8 h-8 fill-amber-400" />
                                ) : (
                                  <Play className="w-8 h-8 fill-amber-400 translate-x-0.5" />
                                )}
                              </button>
                            </div>
                            <h4 className="text-base font-bold font-heading">
                              {activeLesson.videoTitle || 'Salem Montessori Classroom Recording'}
                            </h4>
                            <p className="text-xs text-slate-300">
                              {isVideoPlaying ? '▶ Playing high-definition lesson stream (480p/720p/1080p)' : 'Click play to start video lecture'}
                            </p>
                          </div>

                          {/* Video Player Controls Bar */}
                          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 flex items-center justify-between text-xs">
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => setIsVideoPlaying(!isVideoPlaying)}
                                className="text-white hover:text-amber-400 transition-colors cursor-pointer"
                              >
                                {isVideoPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                              </button>
                              <span className="text-slate-300 tabular-nums">04:15 / {activeLesson.videoDuration || '15:00 min'}</span>
                            </div>
                            <div className="w-1/2 bg-white/20 rounded-full h-1.5 overflow-hidden">
                              <div className="bg-amber-400 h-1.5 rounded-full" style={{ width: '30%' }}></div>
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-slate-300">
                              <span className="bg-white/20 px-1.5 py-0.5 rounded-xs">1.0x</span>
                              <span className="bg-blue-600 px-1.5 py-0.5 rounded-xs text-white font-bold">HD</span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
                          <p>Recorded at Salem Montessori Laboratory Studio • Term 1 2026/2027</p>
                          <button className="text-blue-900 font-semibold hover:underline flex items-center gap-1 cursor-pointer">
                            <Download className="w-3.5 h-3.5" /> Download Offline Video
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 3. POWERPOINT SLIDES VIEWER */}
                {activeTab === 'slides' && activeLesson.pptSlides && (
                  <div className="space-y-4">
                    {/* Slide Projection Canvas */}
                    <div className="aspect-[16/10] bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white p-8 rounded-2xl shadow-lg border border-slate-800 flex flex-col justify-between relative overflow-hidden">
                      {/* Slide Header */}
                      <div className="flex items-center justify-between border-b border-white/10 pb-3">
                        <span className="text-xs uppercase tracking-wider text-amber-400 font-bold">
                          Salem Montessori • B7 Computing Lecture Slides
                        </span>
                        <span className="text-xs text-slate-300 tabular-nums font-mono">
                          Slide {currentSlideIndex + 1} of {activeLesson.pptSlides.length}
                        </span>
                      </div>

                      {/* Active Slide Body */}
                      <div className="py-4 space-y-4 max-w-2xl">
                        <h3 className="text-xl sm:text-2xl font-bold font-heading text-white">
                          {activeLesson.pptSlides[currentSlideIndex].title}
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                          {activeLesson.pptSlides[currentSlideIndex].content}
                        </p>

                        {activeLesson.pptSlides[currentSlideIndex].bullets && (
                          <ul className="space-y-2 text-xs sm:text-sm text-amber-200/90 list-disc list-inside pt-2">
                            {activeLesson.pptSlides[currentSlideIndex].bullets?.map((b, i) => (
                              <li key={i}>{b}</li>
                            ))}
                          </ul>
                        )}

                        {activeLesson.pptSlides[currentSlideIndex].diagramLabel && (
                          <div className="mt-3 p-3 bg-white/10 rounded-lg border border-white/20 text-xs text-amber-300 flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-amber-400" />
                            <span>Architecture Diagram: {activeLesson.pptSlides[currentSlideIndex].diagramLabel}</span>
                          </div>
                        )}
                      </div>

                      {/* Slide Footer */}
                      <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
                        <span>{currentCourse.teacherName} • {currentCourse.subject}</span>
                        <span>{currentCourse.classLevel} {currentCourse.subject}</span>
                      </div>
                    </div>

                    {/* Slide Navigation Controls */}
                    <div className="flex items-center justify-between">
                      <button
                        disabled={currentSlideIndex === 0}
                        onClick={() => setCurrentSlideIndex((prev) => Math.max(0, prev - 1))}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-800 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                      >
                        ← Previous Slide
                      </button>

                      <div className="flex items-center gap-1.5">
                        {activeLesson.pptSlides.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => setCurrentSlideIndex(idx)}
                            className={`w-3 h-3 rounded-full transition-all ${
                              idx === currentSlideIndex
                                ? 'bg-blue-900 scale-125'
                                : 'bg-slate-300 hover:bg-slate-400'
                            }`}
                          />
                        ))}
                      </div>

                      <button
                        disabled={currentSlideIndex === activeLesson.pptSlides.length - 1}
                        onClick={() =>
                          setCurrentSlideIndex((prev) =>
                            Math.min((activeLesson.pptSlides?.length || 1) - 1, prev + 1)
                          )
                        }
                        className="px-4 py-2 bg-blue-900 hover:bg-blue-800 disabled:opacity-40 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                      >
                        Next Slide →
                      </button>
                    </div>
                  </div>
                )}

                {/* 4. CLASS EXERCISE */}
                {activeTab === 'exercise' && activeLesson.exercisePrompt && (
                  <div className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 space-y-3">
                      <h4 className="text-xs font-bold text-blue-950 uppercase tracking-wider">
                        Quick Classroom Exercise
                      </h4>
                      <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
                        {activeLesson.exercisePrompt}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-semibold text-slate-700">
                        Your Exercise Response:
                      </label>
                      <textarea
                        rows={4}
                        value={exerciseAnswer}
                        onChange={(e) => setExerciseAnswer(e.target.value)}
                        placeholder="Type your brief answers here for teacher review..."
                        className="w-full p-3 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:border-blue-900 focus:bg-white"
                      ></textarea>
                    </div>

                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => {
                          if (exerciseAnswer.trim()) {
                            setIsExerciseSubmitted(true);
                            confetti({ particleCount: 40, spread: 50 });
                          }
                        }}
                        className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
                      >
                        Submit Response
                      </button>

                      {isExerciseSubmitted && (
                        <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5" /> Response recorded for {currentCourse.teacherName}!
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center text-slate-500">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-semibold">Select a lesson from the curriculum sidebar to begin.</p>
            </div>
          )}
        </div>
      </div>

      {/* COURSE CREATE & EDIT MODAL */}
      {courseModalMode && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative space-y-4">
            <button
              type="button"
              onClick={() => setCourseModalMode(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-900">
                {courseModalMode === 'create' ? 'Curriculum Authoring' : 'Modify Course Track'}
              </span>
              <h2 className="text-xl font-bold font-heading text-slate-900">
                {courseModalMode === 'create' ? 'Create New Course' : 'Edit Course Details'}
              </h2>
            </div>

            <form onSubmit={handleSaveCourseForm} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Course Title:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Basic 7 Computing & Information Systems"
                  value={courseFormData.title}
                  onChange={(e) => setCourseFormData({ ...courseFormData, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Subject:</label>
                  <select
                    value={courseFormData.subject}
                    onChange={(e) => setCourseFormData({ ...courseFormData, subject: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-900"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Class Level:</label>
                  <select
                    value={courseFormData.classLevel}
                    onChange={(e) => setCourseFormData({ ...courseFormData, classLevel: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-900"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.classLevel}>
                        {c.name} ({c.classLevel})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Academic Term:</label>
                  <input
                    type="text"
                    value={courseFormData.term}
                    onChange={(e) => setCourseFormData({ ...courseFormData, term: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Academic Year:</label>
                  <input
                    type="text"
                    value={courseFormData.academicYear}
                    onChange={(e) => setCourseFormData({ ...courseFormData, academicYear: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Assigned Instructor:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mr. Kwame Mensah"
                  value={courseFormData.teacherName}
                  onChange={(e) => setCourseFormData({ ...courseFormData, teacherName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Course Description:</label>
                <textarea
                  rows={3}
                  value={courseFormData.description}
                  onChange={(e) => setCourseFormData({ ...courseFormData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-900"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setCourseModalMode(null)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  {courseModalMode === 'create' ? 'Create Course' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
