import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  BookOpen,
  Presentation,
  CheckCircle2,
  HelpCircle,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Eye,
  Upload,
  Play,
  Sparkles,
  Layers,
  ChevronLeft,
  ChevronRight,
  Video,
  ListPlus,
  FileText,
  Award,
  Check,
  ExternalLink,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Course, Lesson, SlideItem, Question, Assessment } from '../../types';
import { YouTubePlayer } from '../common/YouTubePlayer';
import { isValidYouTubeUrl } from '../../utils/youtube';

interface DraftSlide {
  id: string;
  title: string;
  content: string;
  bullets: string[];
  diagramLabel?: string;
  teacherNote?: string;
}

interface DraftQuestion {
  id: string;
  type: 'mcq' | 'true_false' | 'theory';
  prompt: string;
  options: string[];
  correctAnswer: string;
  marks: number;
  explanation: string;
}

export const LessonAuthoringStudio: React.FC = () => {
  const {
    currentUser,
    courses,
    addLesson,
    deleteLesson,
    addAssessment,
    addAnnouncement,
    addToast,
  } = useApp();

  // Active Authoring Tab: 'basics' | 'slides' | 'quiz' | 'manage'
  const [activeStep, setActiveStep] = useState<'basics' | 'slides' | 'quiz' | 'manage'>('basics');

  // Course & Strand Target
  const [selectedCourseId, setSelectedCourseId] = useState<string>(courses[0]?.id || '');
  const targetCourse = courses.find((c) => c.id === selectedCourseId) || courses[0];

  // 1. LESSON BASICS
  const [lessonTitle, setLessonTitle] = useState<string>('Introduction to Motherboard Architecture & CPU Sockets');
  const [lessonWeek, setLessonWeek] = useState<number>(4);
  const [objectivesList, setObjectivesList] = useState<string[]>([
    'Identify primary components attached directly to the system motherboard.',
    'Distinguish between Northbridge high-speed buses and Southbridge peripheral controllers.',
    'Apply proper electrostatic discharge precautions when handling silicon chipsets.',
  ]);
  const [newObjectiveInput, setNewObjectiveInput] = useState<string>('');
  const [lessonNotesText, setLessonNotesText] = useState<string>(
    `The motherboard is the master printed circuit board (PCB) connecting all core computing subsystems. Every component, from the central processor to high-speed NVMe storage drives, interfaces through dedicated copper traces and chipset controllers.\n\nIn modern personal computers, CPU sockets feature Land Grid Array (LGA) or Pin Grid Array (PGA) pins to communicate with DDR4/DDR5 system memory and PCIe expansion slots.`
  );
  const [youtubeUrl, setYoutubeUrl] = useState<string>('https://www.youtube.com/watch?v=AkFi90lZmXA');
  const [videoTitle, setVideoTitle] = useState<string>('Masterclass: PC Motherboards & Bus Systems');

  // 2. SLIDE DECK COMPOSER
  const [slides, setSlides] = useState<DraftSlide[]>([
    {
      id: 'slide-1',
      title: 'Motherboard Fundamentals & Subsystems',
      content: 'The central printed circuit board that establishes communication between the CPU, RAM, and storage.',
      bullets: [
        'Form Factors: ATX, Micro-ATX, and Mini-ITX standards',
        'Power Delivery: 24-pin ATX main power and 8-pin EPS CPU rail',
        'Chipset: Coordinates high-speed I/O and peripheral lane arbitration',
      ],
      diagramLabel: 'LGA Socket, VRM Heat Sink, PCIe x16 Gen 5, and M.2 NVMe Slots',
      teacherNote: 'Highlight that static electricity can destroy sensitive surface-mount CMOS transistors.',
    },
    {
      id: 'slide-2',
      title: 'Memory Channels & Bus Topology',
      content: 'Dual-channel and quad-channel memory architectures double effective bandwidth to the processor.',
      bullets: [
        'DIMM Slots: Synchronous Dynamic RAM interfaces',
        'Clock Cycles: DDR transfers data on both rising and falling edges',
        'Cache Coherency: Fast L1/L2/L3 caches minimize memory latency',
      ],
      diagramLabel: 'Memory Controller Hub (Integrated IMC) directly linked to DIMM A2/B2 slots',
      teacherNote: 'Demonstrate installing RAM sticks until retaining latches click into locked position.',
    },
  ]);

  // Slide Deck Interactive Preview State
  const [previewSlideIdx, setPreviewSlideIdx] = useState<number>(0);

  // 3. ATTACHED QUIZ COMPOSER
  const [attachQuiz, setAttachQuiz] = useState<boolean>(true);
  const [quizDurationMinutes, setQuizDurationMinutes] = useState<number>(10);
  const [questions, setQuestions] = useState<DraftQuestion[]>([
    {
      id: 'q-1',
      type: 'mcq',
      prompt: 'Which motherboard component is directly responsible for voltage regulation and clean power delivery to the CPU?',
      options: [
        'Voltage Regulator Module (VRM)',
        'Southbridge I/O Controller',
        'CMOS Backup Battery',
        'Front Panel Audio Header',
      ],
      correctAnswer: 'Voltage Regulator Module (VRM)',
      marks: 5,
      explanation: 'The VRM steps down 12V from the power supply to the low voltage (approx 1.2V–1.4V) required by modern processors.',
    },
    {
      id: 'q-2',
      type: 'true_false',
      prompt: 'Modern desktop computers utilize Northbridge chips on the motherboard, whereas memory controllers remain separate.',
      options: ['True', 'False'],
      correctAnswer: 'False',
      marks: 5,
      explanation: 'False. Modern processors have integrated memory controllers (IMC) and PCIe lanes directly on the CPU die itself.',
    },
  ]);

  // Submission / Success State
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [publishedLessonId, setPublishedLessonId] = useState<string | null>(null);

  // Objectives handlers
  const handleAddObjective = () => {
    if (!newObjectiveInput.trim()) return;
    setObjectivesList((prev) => [...prev, newObjectiveInput.trim()]);
    setNewObjectiveInput('');
  };

  const handleRemoveObjective = (index: number) => {
    setObjectivesList((prev) => prev.filter((_, i) => i !== index));
  };

  // Slide composer handlers
  const handleAddSlide = (templateType: 'concept' | 'diagram' | 'summary') => {
    const newSlideNo = slides.length + 1;
    let newSlide: DraftSlide;

    if (templateType === 'diagram') {
      newSlide = {
        id: `slide-${Date.now()}`,
        title: `Technical Diagram & Architectural Flow (Slide ${newSlideNo})`,
        content: 'Visual examination of system traces, bus lanes, and peripheral interconnects.',
        bullets: ['Label primary headers', 'Trace signal paths from source to sink', 'Document maximum bandwidth limits'],
        diagramLabel: 'Block Diagram of Interconnect Hierarchy',
        teacherNote: 'Ask pupils to identify which component experiences the highest temperature.',
      };
    } else if (templateType === 'summary') {
      newSlide = {
        id: `slide-${Date.now()}`,
        title: `Key Takeaways & Review Exercises (Slide ${newSlideNo})`,
        content: 'Summary of critical concepts covered in today\'s lecture module.',
        bullets: [
          'Mastered definitions and primary component classifications',
          'Understood real-world maintenance and safety precautions',
          'Completed knowledge check questions',
        ],
        diagramLabel: undefined,
        teacherNote: 'Assign homework practice in the school workbook.',
      };
    } else {
      newSlide = {
        id: `slide-${Date.now()}`,
        title: `Core Concept & Analysis (Slide ${newSlideNo})`,
        content: 'Detailed discussion of theoretical mechanisms and practical laboratory applications.',
        bullets: ['Point 1: Key operational principle', 'Point 2: Component specification', 'Point 3: Common diagnostic errors'],
        diagramLabel: undefined,
        teacherNote: 'Pause for classroom questions before proceeding.',
      };
    }

    setSlides((prev) => [...prev, newSlide]);
    setPreviewSlideIdx(slides.length);
  };

  const handleUpdateSlide = (id: string, updates: Partial<DraftSlide>) => {
    setSlides((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const handleRemoveSlide = (id: string) => {
    if (slides.length <= 1) return;
    setSlides((prev) => prev.filter((s) => s.id !== id));
    setPreviewSlideIdx((prev) => Math.max(0, prev - 1));
  };

  const handleMoveSlide = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= slides.length) return;
    setSlides((prev) => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[targetIdx];
      copy[targetIdx] = temp;
      return copy;
    });
    setPreviewSlideIdx(targetIdx);
  };

  // Question composer handlers
  const handleAddQuestion = (type: 'mcq' | 'true_false') => {
    const newQ: DraftQuestion = {
      id: `q-${Date.now()}`,
      type,
      prompt: type === 'true_false' ? 'State whether the following claim is True or False:' : 'Enter question prompt here...',
      options: type === 'true_false' ? ['True', 'False'] : ['Option A', 'Option B', 'Option C', 'Option D'],
      correctAnswer: type === 'true_false' ? 'True' : 'Option A',
      marks: 5,
      explanation: 'Explanation of why this answer is academically correct.',
    };
    setQuestions((prev) => [...prev, newQ]);
  };

  const handleUpdateQuestion = (id: string, updates: Partial<DraftQuestion>) => {
    setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, ...updates } : q)));
  };

  const handleRemoveQuestion = (id: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  // Final Publish Handler
  const handlePublishMasterLesson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetCourse) return;
    setIsSubmitting(true);

    const targetStrand = targetCourse.strands[0] || {
      id: `strand-${Date.now()}`,
      name: 'Curriculum Core',
      strandNumber: 1,
      weeks: [],
    };

    // 1. Format pptSlides
    const formattedSlides: SlideItem[] = slides.map((s, idx) => ({
      slideNo: idx + 1,
      title: s.title,
      content: s.content,
      bullets: s.bullets,
      diagramLabel: s.diagramLabel,
    }));

    // 2. Prepare Quiz ID if attached
    let generatedQuizId: string | undefined = undefined;
    if (attachQuiz && questions.length > 0) {
      generatedQuizId = `quiz-${Date.now()}`;
      const totalMarks = questions.reduce((sum, q) => sum + q.marks, 0);

      const formattedQuestions: Question[] = questions.map((q) => ({
        id: q.id,
        type: q.type,
        prompt: q.prompt,
        options: q.options,
        correctAnswer: q.correctAnswer,
        marks: q.marks,
        explanation: q.explanation,
      }));

      const newAssessment: Omit<Assessment, 'id'> = {
        title: `${lessonTitle} Knowledge Check`,
        subject: targetCourse.subject,
        classLevel: targetCourse.classLevel,
        type: 'quiz',
        durationMinutes: quizDurationMinutes,
        totalMarks,
        term: targetCourse.term,
        questions: formattedQuestions,
      };

      addAssessment(newAssessment);
    }

    // 3. Create Lesson in AppContext
    const lessonData: Omit<Lesson, 'id' | 'strandId' | 'weekNumber' | 'isCompleted'> = {
      title: lessonTitle,
      objectives: objectivesList,
      lessonNotes: lessonNotesText,
      youtubeUrl: youtubeUrl.trim() || undefined,
      videoTitle: videoTitle || `${lessonTitle} Video Masterclass`,
      videoDuration: '16 mins',
      pptSlides: formattedSlides,
      quizId: generatedQuizId,
    };

    addLesson(targetCourse.id, targetStrand.id, lessonWeek, lessonData);

    // 4. Notify Students
    addAnnouncement({
      title: `New Lesson Published: ${lessonTitle}`,
      content: `Mr. ${currentUser?.name || 'Mensah'} has published Week ${lessonWeek} lecture notes, interactive slide deck (${formattedSlides.length} slides), and knowledge check for ${targetCourse.title}.`,
      priority: 'normal',
      targetAudience: 'students',
      author: currentUser?.name || 'Subject Teacher',
    });

    addToast(
      'Lesson & Slide Deck Published',
      `"${lessonTitle}" is now live in ${targetCourse.title} syllabus!`,
      'success'
    );

    confetti({ particleCount: 70, spread: 65 });
    setIsSubmitting(false);
    setPublishedLessonId(lessonTitle);

    setTimeout(() => {
      setPublishedLessonId(null);
    }, 4000);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Studio Header & Tab Navigation */}
      <div className="p-6 bg-slate-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-bold uppercase tracking-wider">
              Faculty Studio Suite
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs text-slate-300 font-medium">Interactive Curriculum Authoring</span>
          </div>
          <h3 className="text-xl font-bold font-heading text-white mt-1">
            Lesson, Slide Deck &amp; Quiz Authoring Studio
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Assemble multi-slide presentation decks, rich lesson prose, in-app video lectures, and auto-scoring quizzes.
          </p>
        </div>

        {/* Step Navigation Tabs */}
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs shrink-0">
          <button
            type="button"
            onClick={() => setActiveStep('basics')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeStep === 'basics' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>1. Lesson Notes</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveStep('slides')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeStep === 'slides' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Presentation className="w-3.5 h-3.5" />
            <span>2. Slide Deck ({slides.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveStep('quiz')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeStep === 'quiz' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>3. Quiz ({questions.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveStep('manage')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeStep === 'manage' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Syllabus Review</span>
          </button>
        </div>
      </div>

      {publishedLessonId && (
        <div className="p-4 bg-emerald-50 border-b border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>Success:</strong> Published "{publishedLessonId}" with {slides.length} slides and auto-scoring quiz!
            </span>
          </div>
          <button
            type="button"
            onClick={() => setActiveStep('manage')}
            className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg font-bold cursor-pointer"
          >
            View in Syllabus
          </button>
        </div>
      )}

      {/* STEP 1: LESSON BASICS & OBJECTIVES */}
      {activeStep === 'basics' && (
        <div className="p-6 space-y-5 max-w-4xl mx-auto">
          {/* Target Course & Week Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Target Curriculum Course:</label>
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs font-semibold focus:outline-none focus:border-blue-900"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title} ({c.classLevel} · {c.subject})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Academic Week Number:</label>
              <select
                value={lessonWeek}
                onChange={(e) => setLessonWeek(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs font-semibold focus:outline-none focus:border-blue-900"
              >
                <option value={1}>Week 1</option>
                <option value={2}>Week 2</option>
                <option value={3}>Week 3</option>
                <option value={4}>Week 4 (Current Module)</option>
                <option value={5}>Week 5</option>
                <option value={6}>Week 6</option>
              </select>
            </div>
          </div>

          {/* Lesson Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Lesson Topic &amp; Unit Title:</label>
            <input
              type="text"
              required
              value={lessonTitle}
              onChange={(e) => setLessonTitle(e.target.value)}
              placeholder="e.g. Memory Hierarchy and Storage Controllers"
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm font-semibold focus:outline-none focus:border-blue-900"
            />
          </div>

          {/* Learning Objectives List Composer */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800">
                Core Learning Objectives (Displayed to Pupils as Competency Checklist):
              </label>
              <span className="text-[11px] text-slate-500 font-semibold">{objectivesList.length} objectives</span>
            </div>

            <div className="space-y-2">
              {objectivesList.map((obj, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between gap-2 p-2 bg-white rounded-xl border border-slate-200 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-900 font-bold flex items-center justify-center text-[10px] shrink-0">
                      {i + 1}
                    </span>
                    <span className="text-slate-800">{obj}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveObjective(i)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                value={newObjectiveInput}
                onChange={(e) => setNewObjectiveInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddObjective();
                  }
                }}
                placeholder="Type learning objective and press Add..."
                className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-900"
              />
              <button
                type="button"
                onClick={handleAddObjective}
                className="px-3 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Add Objective
              </button>
            </div>
          </div>

          {/* Teacher's Comprehensive Lesson Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Teacher's Academic Notes (Formatted Prose for Student Study &amp; Text-to-Speech):
            </label>
            <textarea
              rows={6}
              value={lessonNotesText}
              onChange={(e) => setLessonNotesText(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs leading-relaxed focus:outline-none focus:border-blue-900"
            />
          </div>

          {/* YouTube Video Lecture Link */}
          <div className="p-4 bg-slate-900 text-white rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold flex items-center gap-2 text-white">
                <span className="px-1.5 py-0.5 rounded bg-rose-600 text-[10px] font-bold">YouTube</span>
                <span>Video Lecture Link (Embeds directly in lesson notes &amp; plays in-app):</span>
              </label>
              <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-500/30">
                Safe In-App Playback
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <input
                  type="url"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
              </div>
              <div>
                <input
                  type="text"
                  value={videoTitle}
                  onChange={(e) => setVideoTitle(e.target.value)}
                  placeholder="Display Title (e.g. Masterclass)"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            {isValidYouTubeUrl(youtubeUrl) && (
              <div className="mt-2 pt-2 border-t border-slate-800 space-y-1.5">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                  <Eye className="w-3 h-3" /> Live In-App Playback Preview:
                </span>
                <YouTubePlayer url={youtubeUrl} title={videoTitle} className="w-full" autoPlay={false} />
              </div>
            )}
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={() => setActiveStep('slides')}
              className="px-5 py-2.5 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer transition-colors"
            >
              <span>Continue to Slide Deck Composer</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: PRESENTATION SLIDE DECK COMPOSER */}
      {activeStep === 'slides' && (
        <div className="p-6 space-y-6 max-w-5xl mx-auto">
          {/* Header Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
            <div>
              <h4 className="text-base font-bold text-slate-900">
                Interactive Slide Deck Builder ({slides.length} Slides)
              </h4>
              <p className="text-xs text-slate-500">
                Craft classroom PowerPoint slides that pupils can study independently or present on the VClass Stage.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleAddSlide('concept')}
                className="px-3 py-1.5 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Concept Slide
              </button>
              <button
                type="button"
                onClick={() => handleAddSlide('diagram')}
                className="px-3 py-1.5 bg-purple-900 hover:bg-purple-800 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" /> Diagram Slide
              </button>
              <button
                type="button"
                onClick={() => handleAddSlide('summary')}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Check className="w-3.5 h-3.5" /> Summary Slide
              </button>
            </div>
          </div>

          {/* Interactive Slide Deck Live Carousel Preview */}
          <div className="bg-slate-950 text-white rounded-2xl p-6 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-amber-400 text-slate-950 font-bold text-[10px]">
                  Slide {previewSlideIdx + 1} of {slides.length}
                </span>
                <span className="text-xs text-slate-400">Live Student Experience Preview</span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={previewSlideIdx === 0}
                  onClick={() => setPreviewSlideIdx((prev) => Math.max(0, prev - 1))}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 cursor-pointer"
                  title="Previous Slide"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-mono text-slate-400">
                  {previewSlideIdx + 1} / {slides.length}
                </span>
                <button
                  type="button"
                  disabled={previewSlideIdx === slides.length - 1}
                  onClick={() => setPreviewSlideIdx((prev) => Math.min(slides.length - 1, prev + 1))}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 cursor-pointer"
                  title="Next Slide"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Slide Preview Content Card */}
            {(() => {
              const currentSlide = slides[previewSlideIdx] || slides[0];
              return (
                <div className="min-h-[220px] flex flex-col justify-between py-2 space-y-4">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black text-white font-heading">
                      {currentSlide.title}
                    </h3>
                    <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                      {currentSlide.content}
                    </p>

                    {currentSlide.bullets.length > 0 && (
                      <ul className="space-y-2 mt-4">
                        {currentSlide.bullets.map((b, i) => (
                          <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 shrink-0"></span>
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {currentSlide.diagramLabel && (
                      <div className="mt-4 p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-amber-300">
                        <span className="font-bold block mb-0.5">Architecture / Diagram Focus:</span>
                        <p className="text-slate-300">{currentSlide.diagramLabel}</p>
                      </div>
                    )}
                  </div>

                  {currentSlide.teacherNote && (
                    <div className="pt-3 border-t border-slate-800/80 text-xs text-slate-400">
                      💡 <strong>Faculty Pacing Note:</strong> {currentSlide.teacherNote}
                    </div>
                  )}
                </div>
              );
            })()}
          </div>

          {/* Slide Cards Editor Organizer */}
          <div className="space-y-4 pt-2">
            <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Edit Individual Slides:
            </h5>

            {slides.map((s, idx) => (
              <div
                key={s.id}
                className={`p-5 rounded-2xl border transition-all ${
                  previewSlideIdx === idx
                    ? 'bg-blue-50/50 border-blue-400 shadow-sm'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-blue-900 text-white font-bold text-[10px]">
                      Slide #{idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => setPreviewSlideIdx(idx)}
                      className="text-xs font-bold text-blue-900 hover:underline cursor-pointer"
                    >
                      {s.title || `Untitled Slide ${idx + 1}`}
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMoveSlide(idx, 'up')}
                      className="p-1 text-slate-500 hover:text-slate-900 disabled:opacity-30 rounded hover:bg-slate-100 cursor-pointer"
                      title="Move Up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === slides.length - 1}
                      onClick={() => handleMoveSlide(idx, 'down')}
                      className="p-1 text-slate-500 hover:text-slate-900 disabled:opacity-30 rounded hover:bg-slate-100 cursor-pointer"
                      title="Move Down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={slides.length <= 1}
                      onClick={() => handleRemoveSlide(s.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 disabled:opacity-30 rounded hover:bg-rose-50 cursor-pointer ml-1"
                      title="Delete Slide"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 text-xs">
                  <div className="space-y-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Slide Title:</label>
                      <input
                        type="text"
                        value={s.title}
                        onChange={(e) => handleUpdateSlide(s.id, { title: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-semibold focus:outline-none focus:border-blue-900"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Slide Main Paragraph:</label>
                      <textarea
                        rows={2}
                        value={s.content}
                        onChange={(e) => handleUpdateSlide(s.id, { content: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-900"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Bullet Points (One per line):
                      </label>
                      <textarea
                        rows={3}
                        value={s.bullets.join('\n')}
                        onChange={(e) =>
                          handleUpdateSlide(s.id, {
                            bullets: e.target.value.split('\n').filter((b) => b.trim().length > 0),
                          })
                        }
                        className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-900"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Diagram Focus:</label>
                        <input
                          type="text"
                          value={s.diagramLabel || ''}
                          onChange={(e) => handleUpdateSlide(s.id, { diagramLabel: e.target.value || undefined })}
                          placeholder="e.g. LGA socket pinout"
                          className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Teacher Pacing Note:</label>
                        <input
                          type="text"
                          value={s.teacherNote || ''}
                          onChange={(e) => handleUpdateSlide(s.id, { teacherNote: e.target.value || undefined })}
                          placeholder="e.g. Pause for questions"
                          className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setActiveStep('basics')}
              className="px-4 py-2 border border-slate-300 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 cursor-pointer"
            >
              Back to Lesson Notes
            </button>
            <button
              type="button"
              onClick={() => setActiveStep('quiz')}
              className="px-5 py-2.5 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer transition-colors"
            >
              <span>Continue to Quiz Creator</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: ATTACHED QUIZ & ASSESSMENT COMPOSER */}
      {activeStep === 'quiz' && (
        <div className="p-6 space-y-6 max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
            <div>
              <h4 className="text-base font-bold text-slate-900">
                Interactive Knowledge Check &amp; Quiz Builder
              </h4>
              <p className="text-xs text-slate-500">
                Attach self-scoring questions that evaluate pupil comprehension with instant grading feedback.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                <input
                  type="checkbox"
                  checked={attachQuiz}
                  onChange={(e) => setAttachQuiz(e.target.checked)}
                  className="rounded text-blue-900 focus:ring-blue-900"
                />
                <span>Attach Quiz to Lesson</span>
              </label>
            </div>
          </div>

          {attachQuiz ? (
            <div className="space-y-5">
              {/* Quiz Settings */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Timer Duration (Minutes):</label>
                  <input
                    type="number"
                    min={3}
                    max={60}
                    value={quizDurationMinutes}
                    onChange={(e) => setQuizDurationMinutes(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Total Marks Tally:</label>
                  <div className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-blue-900 font-bold font-mono">
                    {questions.reduce((sum, q) => sum + q.marks, 0)} Marks ({questions.length} Questions)
                  </div>
                </div>
              </div>

              {/* Questions List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Questions ({questions.length})
                  </h5>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleAddQuestion('mcq')}
                      className="px-3 py-1.5 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Multiple Choice
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddQuestion('true_false')}
                      className="px-3 py-1.5 bg-purple-900 hover:bg-purple-800 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> True / False
                    </button>
                  </div>
                </div>

                {questions.map((q, qIdx) => (
                  <div
                    key={q.id}
                    className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3 text-xs"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-blue-900 text-white font-bold flex items-center justify-center text-[10px]">
                          {qIdx + 1}
                        </span>
                        <span className="font-bold text-slate-800 uppercase tracking-wider text-[10px]">
                          {q.type === 'mcq' ? 'Multiple Choice' : 'True or False'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-slate-500 font-semibold">Marks:</span>
                        <input
                          type="number"
                          min={1}
                          max={20}
                          value={q.marks}
                          onChange={(e) => handleUpdateQuestion(q.id, { marks: Number(e.target.value) })}
                          className="w-14 px-2 py-0.5 border border-slate-300 rounded font-bold font-mono text-center"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveQuestion(q.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer ml-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Question Prompt:</label>
                      <input
                        type="text"
                        value={q.prompt}
                        onChange={(e) => handleUpdateQuestion(q.id, { prompt: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-semibold"
                      />
                    </div>

                    {/* Options with Radio Selector for Correct Answer */}
                    <div className="space-y-2 pt-1">
                      <label className="block font-bold text-slate-700">
                        Answer Options (Select the correct answer):
                      </label>
                      {q.options.map((opt, optIdx) => (
                        <div key={optIdx} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name={`correct-${q.id}`}
                            checked={q.correctAnswer === opt}
                            onChange={() => handleUpdateQuestion(q.id, { correctAnswer: opt })}
                            className="cursor-pointer text-blue-900 focus:ring-blue-900"
                          />
                          <input
                            type="text"
                            value={opt}
                            onChange={(e) => {
                              const newOpts = [...q.options];
                              newOpts[optIdx] = e.target.value;
                              const isCurrentCorrect = q.correctAnswer === opt;
                              handleUpdateQuestion(q.id, {
                                options: newOpts,
                                correctAnswer: isCurrentCorrect ? e.target.value : q.correctAnswer,
                              });
                            }}
                            className={`flex-1 px-3 py-1.5 rounded-lg border text-xs ${
                              q.correctAnswer === opt
                                ? 'bg-emerald-50 border-emerald-400 font-semibold text-emerald-900'
                                : 'bg-slate-50 border-slate-300 text-slate-900'
                            }`}
                          />
                          {q.correctAnswer === opt && (
                            <span className="text-[10px] text-emerald-600 font-bold shrink-0">
                              ✓ Correct Answer
                            </span>
                          )}
                        </div>
                      ))}
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Explanation &amp; Feedback (Shown to pupils upon grading):
                      </label>
                      <input
                        type="text"
                        value={q.explanation}
                        onChange={(e) => handleUpdateQuestion(q.id, { explanation: e.target.value })}
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-700"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-xs text-slate-500">
              <HelpCircle className="w-8 h-8 mx-auto text-slate-400 mb-2" />
              <p className="font-bold text-slate-700">No Quiz Attached to this Lesson</p>
              <p className="text-slate-500 mt-1">Pupils will only study the lesson prose and slide deck.</p>
            </div>
          )}

          {/* Final Publish Bar */}
          <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => setActiveStep('slides')}
              className="px-4 py-2 border border-slate-300 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 cursor-pointer"
            >
              Back to Slide Deck
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={handlePublishMasterLesson}
              className="w-full sm:w-auto px-8 py-3.5 bg-blue-900 hover:bg-blue-800 disabled:opacity-40 text-white font-extrabold rounded-xl shadow-md transition-transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer text-xs"
            >
              <Upload className="w-4 h-4" />
              <span>Publish Lesson, Slides &amp; Quiz to Syllabus</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: SYLLABUS REVIEW & LESSONS MANAGER */}
      {activeStep === 'manage' && (
        <div className="p-6 space-y-6 max-w-4xl mx-auto">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <h4 className="text-base font-bold text-slate-900">
                Published Syllabus Lessons in {targetCourse?.title}
              </h4>
              <p className="text-xs text-slate-500">
                View published modules, inspect attached slide decks, and manage curriculum records.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setActiveStep('basics')}
              className="px-3 py-1.5 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Author New Lesson
            </button>
          </div>

          {(() => {
            const allPublishedLessons = targetCourse
              ? targetCourse.strands.flatMap((s) => s.weeks.flatMap((w) => w.lessons))
              : [];

            if (allPublishedLessons.length === 0) {
              return (
                <div className="text-center py-12 text-slate-400 text-xs">
                  <BookOpen className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  <p>No published lessons found in this course yet.</p>
                </div>
              );
            }

            return (
              <div className="space-y-3">
                {allPublishedLessons.map((l) => (
                  <div
                    key={l.id}
                    className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-900 text-sm">{l.title}</span>
                        <span className="px-2 py-0.2 rounded-full bg-blue-100 text-blue-900 text-[10px] font-bold">
                          Week {l.weekNumber}
                        </span>
                        {l.pptSlides && l.pptSlides.length > 0 && (
                          <span className="px-2 py-0.2 rounded-full bg-purple-100 text-purple-900 text-[10px] font-bold flex items-center gap-1">
                            <Presentation className="w-3 h-3" /> {l.pptSlides.length} Slides
                          </span>
                        )}
                        {l.quizId && (
                          <span className="px-2 py-0.2 rounded-full bg-emerald-100 text-emerald-900 text-[10px] font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Attached Quiz
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-1">
                        {l.lessonNotes ? l.lessonNotes.slice(0, 120) + '...' : 'No notes available'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {l.youtubeUrl && (
                        <a
                          href={l.youtubeUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Open YouTube Link"
                        >
                          <Play className="w-4 h-4" />
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`Delete lesson "${l.title}" from syllabus?`)) {
                            deleteLesson(targetCourse.id, l.id);
                          }
                        }}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete Lesson"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};
