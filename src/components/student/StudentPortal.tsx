import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  BookOpen,
  Video,
  Play,
  FileCheck2,
  BrainCircuit,
  Award,
  Sparkles,
  ArrowRight,
  Flame,
  Volume2,
  VolumeX,
  Shapes,
  CheckCircle,
  Clock,
  ChevronRight,
  Radio,
  Calendar,
  Activity,
  Bell,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { getClassTimetable, getCurrentSchoolDay, isSlotActiveNow } from '../../utils/timetable';

export const StudentPortal: React.FC = () => {
  const {
    currentUser,
    courses,
    vclasses,
    timetable,
    activities,
    notifications,
    setActiveCourseId,
    setActiveLessonId,
    setActiveNav,
    setActiveVClassId,
    setActiveActivityId,
    setActiveAssessmentId,
    speakText,
    isSpeaking,
    stopSpeaking,
    badges,
  } = useApp();

  if (!currentUser) return null;

  const [showCertificate, setShowCertificate] = useState<boolean>(false);

  const studentClassLevel = currentUser.classLevel || 'B7';
  const studentClassVClasses = vclasses.filter(
    (v) => v.classLevel === studentClassLevel || v.classLevel === 'All Classes'
  );
  const activeClassLiveVClass = studentClassVClasses.find((v) => v.isLive || v.status === 'live');

  const triggerCelebration = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  const handleContinueLesson = () => {
    if (studentCourses.length > 0) {
      setActiveCourseId(studentCourses[0].id);
      const firstLesson = studentCourses[0].strands?.[0]?.weeks?.[0]?.lessons?.[0];
      if (firstLesson) {
        setActiveLessonId(firstLesson.id);
      }
    }
    setActiveNav('courses');
  };

  const readDashboardAloud = () => {
    if (isSpeaking) {
      stopSpeaking();
    } else {
      speakText(
        `Good morning, ${currentUser.name}! You are in ${currentUser.classLevel}. Review your enrolled courses, assignments, quizzes, and live classrooms with your teachers.`
      );
    }
  };

  // Dynamically compute student's activities today based on actual system records
  const todayActivities: Array<{
    id: string;
    title: string;
    subject: string;
    type: string;
    actionLabel: string;
    statusClass: string;
    action: () => void;
  }> = [];

  // 1. Live VClass if available
  if (activeClassLiveVClass) {
    todayActivities.push({
      id: `act-live-${activeClassLiveVClass.id}`,
      title: `Live Class: ${activeClassLiveVClass.title}`,
      subject: activeClassLiveVClass.subject,
      type: 'live',
      actionLabel: '🔴 Join Live Stage',
      statusClass: 'text-rose-700 bg-rose-50 hover:bg-rose-100 font-bold animate-pulse',
      action: () => {
        setActiveVClassId(activeClassLiveVClass.id);
        setActiveNav('vclass');
      },
    });
  } else if (studentClassVClasses.length > 0) {
    const nextSession = studentClassVClasses[0];
    todayActivities.push({
      id: `act-vclass-${nextSession.id}`,
      title: `Scheduled VClass: ${nextSession.title}`,
      subject: nextSession.subject,
      type: 'live',
      actionLabel: '📅 View Session',
      statusClass: 'text-blue-700 bg-blue-50 hover:bg-blue-100 font-semibold',
      action: () => {
        setActiveVClassId(nextSession.id);
        setActiveNav('vclass');
      },
    });
  }

  // 2. Active Course lessons
  const studentCourses = courses.filter(
    (c) => c.classLevel === studentClassLevel || c.classLevel === 'All Classes'
  );
  if (studentCourses.length > 0) {
    const firstCourse = studentCourses[0];
    const firstLesson = firstCourse.strands?.[0]?.weeks?.[0]?.lessons?.[0];
    todayActivities.push({
      id: `act-course-${firstCourse.id}`,
      title: firstLesson ? `Lesson: ${firstLesson.title}` : `Study: ${firstCourse.title}`,
      subject: firstCourse.subject,
      type: 'lesson',
      actionLabel: '▶ Start Lesson',
      statusClass: 'text-blue-900 bg-blue-50 hover:bg-blue-100',
      action: () => {
        setActiveCourseId(firstCourse.id);
        if (firstLesson) setActiveLessonId(firstLesson.id);
        setActiveNav('courses');
      },
    });
  }

  // 3. Quizzes / Assessments
  const studentAssessments = useApp().assessments.filter(
    (a) => a.classLevel === studentClassLevel || a.classLevel === 'All Classes'
  );
  if (studentAssessments.length > 0) {
    const targetQuiz = studentAssessments[0];
    todayActivities.push({
      id: `act-quiz-${targetQuiz.id}`,
      title: targetQuiz.title,
      subject: targetQuiz.subject,
      type: 'quiz',
      actionLabel: '📝 Take Quiz',
      statusClass: 'text-amber-700 bg-amber-50 hover:bg-amber-100',
      action: () => {
        setActiveAssessmentId(targetQuiz.id);
        setActiveNav('quizzes');
      },
    });
  }

  // 4. Assignments
  const studentAssignments = useApp().assignments.filter(
    (a) => a.classLevel === studentClassLevel || a.classLevel === 'All Classes'
  );
  if (studentAssignments.length > 0) {
    const targetAssign = studentAssignments[0];
    todayActivities.push({
      id: `act-asg-${targetAssign.id}`,
      title: targetAssign.title,
      subject: targetAssign.subject,
      type: 'assignment',
      actionLabel: '⏳ Due Soon',
      statusClass: 'text-purple-700 bg-purple-50 hover:bg-purple-100',
      action: () => {
        setActiveNav('assignments');
      },
    });
  }

  return (
    <div className="space-y-8">
      {/* 🔴 ISOLATED LIVE CLASS IN PROGRESS BANNER (Strictly for Student's Class) */}
      {activeClassLiveVClass && (
        <div data-tour="dashboard-live-banner" className="bg-gradient-to-r from-rose-950 via-rose-900 to-slate-900 border-2 border-rose-500 rounded-2xl p-5 sm:p-6 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-rose-600 text-white font-bold text-xs flex items-center gap-1.5 animate-pulse">
                <Radio className="w-3.5 h-3.5" /> LIVE CLASS IN SESSION
              </span>
              <span className="text-rose-200 text-xs font-semibold">
                Class {activeClassLiveVClass.classLevel} · {activeClassLiveVClass.subject}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold font-heading text-white">
              {activeClassLiveVClass.title}
            </h2>
            <p className="text-xs text-rose-200 flex flex-wrap items-center gap-3">
              <span>Teacher: <strong className="text-white">{activeClassLiveVClass.teacherName}</strong></span>
              <span>·</span>
              <span>Duration: {activeClassLiveVClass.durationMinutes} mins</span>
              <span>·</span>
              <span>Topic: {activeClassLiveVClass.meetingTopic || activeClassLiveVClass.title}</span>
            </p>
          </div>

          <button
            onClick={() => {
              setActiveVClassId(activeClassLiveVClass.id);
              setActiveNav('vclass');
            }}
            className="px-6 py-3.5 bg-white hover:bg-rose-50 text-rose-900 font-bold text-xs sm:text-sm rounded-xl shadow-lg transition-transform transform hover:scale-105 flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            <Video className="w-4 h-4 text-rose-600" />
            Join Class {studentClassLevel} Live Stage →
          </button>
        </div>
      )}

      {/* Friendly Student Greeting & Streak Banner */}
      <div data-tour="dashboard-greeting" className="bg-gradient-to-r from-blue-950 via-slate-900 to-blue-900 rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-semibold backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Salem Montessori Pupil Portal • {currentUser.classLevel}
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-heading">
              Good Morning, {currentUser.name.split(' ')[0]} 👋
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-xl">
              Ready for today's hands-on learning? You are currently on a{' '}
              <span className="text-amber-300 font-semibold">{currentUser.streakDays || 5}-day learning streak</span>!
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Audio Read-Aloud Button for Montessori accessibility */}
            <button
              data-tour="read-aloud"
              onClick={readDashboardAloud}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-xs flex items-center gap-2 transition-colors cursor-pointer"
            >
              {isSpeaking ? (
                <>
                  <VolumeX className="w-4 h-4 text-amber-300 animate-pulse" />
                  <span>Stop Voice</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4 text-amber-300" />
                  <span>Read Page Aloud</span>
                </>
              )}
            </button>

            {/* Streak & Points display */}
            <div className="bg-amber-400 text-slate-950 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs">
              <Flame className="w-4 h-4 text-orange-600 fill-orange-500" />
              <span>{currentUser.streakDays || 5} Days Streak</span>
              <span className="text-slate-400">|</span>
              <span>⭐ {currentUser.points || 580} pts</span>
            </div>
          </div>
        </div>
      </div>

      {/* Continue Learning Spotlight */}
      <div data-tour="continue-learning" className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs relative overflow-hidden">
        {studentCourses.length > 0 ? (
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-xl">
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-900 uppercase tracking-wider">
                <BookOpen className="w-4 h-4 text-blue-900" />
                Continue Learning ({currentUser.classLevel})
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                📚 {studentCourses[0].title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {studentCourses[0].description || 'Explore lesson topics and interactive materials.'}
              </p>

              {/* Progress Bar */}
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between text-xs font-medium text-slate-600">
                  <span>Course Completion</span>
                  <span className="font-bold text-slate-900 tabular-nums">{studentCourses[0].progressPercentage || 0}% Completed</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-emerald-600 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${studentCourses[0].progressPercentage || 0}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => {
                  setActiveCourseId(studentCourses[0].id);
                  setActiveNav('courses');
                }}
                className="px-5 py-3 bg-blue-900 hover:bg-blue-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                Continue Lesson →
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-50 text-blue-900 rounded-xl">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">No Enrolled Courses for Class {currentUser.classLevel}</h3>
                <p className="text-xs text-slate-500">Subject courses assigned to your class will appear here.</p>
              </div>
            </div>
            <button
              onClick={() => setActiveNav('courses')}
              className="px-4 py-2 bg-blue-900 text-white text-xs font-semibold rounded-xl hover:bg-blue-800 transition-colors cursor-pointer self-start sm:self-auto"
            >
              Browse Courses
            </button>
          </div>
        )}
      </div>

      {/* Grid: Today's Activities & My Classes */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Today's Activities Table */}
        <div data-tour="today-activities" className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-900" />
                Today's Activities
              </h3>
              <p className="text-xs text-slate-500">Your scheduled tasks, lectures, and live classes</p>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {todayActivities.length > 0 ? (
              todayActivities.map((act) => (
                <div
                  key={act.id}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 p-2 rounded-xl transition-colors"
                >
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-slate-900">{act.title}</p>
                    <p className="text-[11px] text-slate-500 flex items-center gap-2">
                      <span className="font-medium text-slate-700">{act.subject}</span>
                      <span>·</span>
                      <span className="capitalize">{act.type}</span>
                    </p>
                  </div>
                  <button
                    onClick={act.action}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer self-start sm:self-auto whitespace-nowrap ${act.statusClass}`}
                  >
                    {act.actionLabel}
                  </button>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-slate-500 space-y-1">
                <p className="text-xs font-medium text-slate-700">No scheduled activities for today.</p>
                <p className="text-[11px] text-slate-400">All caught up! Check back later for new assignments or live classes.</p>
              </div>
            )}
          </div>
        </div>

        {/* My Classes */}
        <div data-tour="enrolled-classes" className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-900" />
              My Classes
            </h3>
            <button
              onClick={() => setActiveNav('courses')}
              className="text-xs font-semibold text-blue-900 hover:text-blue-700"
            >
              View All
            </button>
          </div>

          <div className="space-y-2.5">
            {studentCourses.length > 0 ? (
              studentCourses.map((course) => (
                <div
                  key={course.id}
                  onClick={() => {
                    setActiveCourseId(course.id);
                    setActiveNav('courses');
                  }}
                  className="p-3 rounded-xl border border-slate-200/80 hover:border-blue-900 hover:bg-blue-50/30 transition-all cursor-pointer flex items-center justify-between group"
                >
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-900">
                      {course.title}
                    </h4>
                    <p className="text-[11px] text-slate-500">{course.teacherName} · Class {course.classLevel}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-700 tabular-nums">
                      {course.progressPercentage}%
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-900 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              ))
            ) : (
              <p className="py-6 text-center text-xs text-slate-500">No active courses enrolled for Class {currentUser.classLevel}.</p>
            )}
          </div>
        </div>
      </div>

      {/* Class-Isolated Student Activity & Alerts Stream */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-900" />
              Class {currentUser.classLevel} Activity Stream &amp; Updates
            </h3>
            <p className="text-xs text-slate-500">
              Verified activities and milestones isolated to you and your classmates in {currentUser.classLevel}
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-900 text-xs font-bold border border-blue-200">
            {activities.length} Recorded
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {activities.slice(0, 6).map((act) => (
            <div
              key={act.id}
              className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/70 hover:bg-slate-100/60 transition-colors flex items-start gap-3 text-xs"
            >
              <div className="p-2 rounded-lg bg-blue-100/60 text-blue-900 shrink-0 mt-0.5">
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
                    {act.classLevel || currentUser.classLevel}
                  </span>
                </div>
              </div>
            </div>
          ))}
          {activities.length === 0 && (
            <div className="col-span-2 py-8 text-center text-slate-400">
              <Activity className="w-6 h-6 mx-auto mb-2 text-slate-300" />
              <p className="text-xs">No recent activities recorded for Class {currentUser.classLevel}.</p>
            </div>
          )}
        </div>
      </div>

      {/* Gamification & Badges Section */}
      <div data-tour="badges-awards" className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
              ⭐ Montessori Gamification &amp; Awards
            </span>
            <h3 className="text-lg font-bold text-amber-950 mt-0.5">
              Great Job, {currentUser.name.split(' ')[0]}!
            </h3>
            <p className="text-xs text-amber-800">
              You completed 5 lessons this week with flying colors. Keep exploring!
            </p>
          </div>
          <button
            onClick={() => {
              triggerCelebration();
              setShowCertificate(true);
            }}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer self-start sm:self-auto flex items-center gap-2"
          >
            <Award className="w-4 h-4" />
            View Certificate of Excellence
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {badges.map((b) => (
            <div
              key={b.id}
              className={`p-3 rounded-xl border text-center transition-all ${
                b.unlocked
                  ? 'bg-white border-amber-300 shadow-xs'
                  : 'bg-amber-100/40 border-amber-200/50 opacity-60'
              }`}
            >
              <div className="text-2xl mb-1">{b.icon}</div>
              <p className="text-[11px] font-bold text-slate-900 truncate">{b.name}</p>
              <p className="text-[10px] text-slate-500 line-clamp-2 mt-0.5">{b.description}</p>
              {b.unlocked && (
                <span className="inline-block mt-1 text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-sm">
                  Earned
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Certificate Modal */}
      {showCertificate && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-8 shadow-2xl relative border-8 border-amber-100 text-center space-y-4">
            <button
              onClick={() => setShowCertificate(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 font-bold"
            >
              ✕
            </button>

            <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto text-3xl">
              🏆
            </div>

            <p className="text-xs font-bold text-amber-700 uppercase tracking-widest">
              SALEM MONTESSORI SCHOOL • ACCRA
            </p>

            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900">
              Certificate of Academic Excellence
            </h2>

            <p className="text-xs text-slate-500">This honor is proudly awarded to:</p>
            <p className="text-xl sm:text-2xl font-bold text-blue-950 underline decoration-amber-400 decoration-2 underline-offset-4">
              {currentUser.name} ({currentUser.classLevel})
            </p>

            <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
              For demonstrating exceptional self-directed inquiry, consistent on-time attendance, and
              mastery of Computer Hardware architectures during First Term 2026/2027.
            </p>

            <div className="pt-6 border-t border-slate-200 flex justify-around text-xs text-slate-500">
              <div>
                <p className="font-semibold text-slate-800">Mr. Kwame Mensah</p>
                <p className="text-[10px]">Lead Computing Teacher</p>
              </div>
              <div>
                <p className="font-semibold text-slate-800">Mrs. Margaret Osei</p>
                <p className="text-[10px]">Head of School</p>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => {
                  triggerCelebration();
                  window.print();
                }}
                className="px-4 py-2 bg-blue-900 text-white rounded-lg text-xs font-semibold hover:bg-blue-800 transition-colors"
              >
                Print / Save Certificate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
