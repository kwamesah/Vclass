import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  BrainCircuit,
  GraduationCap,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  RotateCcw,
  Award,
  ChevronRight,
  ChevronLeft,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { QuizResult } from '../../types';

export const AssessmentTaker: React.FC = () => {
  const {
    assessments,
    activeAssessmentId,
    setActiveAssessmentId,
    submitAssessment,
    deleteQuizResult,
    quizResults,
    currentUser,
  } = useApp();

  // Enforce class isolation: students only see assessments for their class level
  const classAssessments = assessments.filter((a) => {
    if (currentUser?.role === 'student') {
      return a.classLevel === currentUser.classLevel || a.classLevel === 'All Classes';
    }
    return true;
  });

  const currentAssessment =
    classAssessments.find((a) => a.id === activeAssessmentId) || classAssessments[0];

  // Ongoing test states
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, any>>({});
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [activeResult, setActiveResult] = useState<QuizResult | null>(null);

  if (!currentUser) return null;

  if (!currentAssessment) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
        <BrainCircuit className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-900">No Assessments Configured</h3>
        <p className="text-xs text-slate-500 mt-1">
          Quizzes and examinations can be created from the Administrator Console or Faculty Studio.
        </p>
      </div>
    );
  }

  // Check if current user already has completed this assessment
  const existingResult = quizResults.find(
    (r) => r.quizId === currentAssessment.id && r.studentId === currentUser.id
  );

  const currentQuestion = currentAssessment.questions[currentQuestionIndex] || currentAssessment.questions[0];

  const handleSelectAnswer = (ans: any) => {
    setUserAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: ans,
    }));
  };

  const handleFinishAssessment = () => {
    let earnedMarks = 0;
    currentAssessment.questions.forEach((q) => {
      const selected = userAnswers[q.id];
      if (selected !== undefined && selected === q.correctAnswer) {
        earnedMarks += q.marks;
      }
    });

    const res = submitAssessment(
      currentAssessment.id,
      earnedMarks,
      currentAssessment.totalMarks,
      userAnswers
    );
    setActiveResult(res);
    setIsSubmitted(true);

    if (res.percentage >= 80) {
      confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });
    }
  };

  const handleRetake = () => {
    setUserAnswers({});
    setCurrentQuestionIndex(0);
    setIsSubmitted(false);
    setActiveResult(null);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <span className="text-blue-900 font-bold uppercase">{currentAssessment.type}</span>
            <span>·</span>
            <span>{currentAssessment.classLevel}</span>
            <span>·</span>
            <span>{currentAssessment.subject}</span>
            <span>·</span>
            <span>{currentAssessment.term}</span>
          </div>

          <h1 className="text-2xl font-bold font-heading text-slate-900">
            {currentAssessment.title}
          </h1>
          <p className="text-xs text-slate-500">
            Total Marks: <strong className="text-slate-900">{currentAssessment.totalMarks}</strong> · Duration: {currentAssessment.durationMinutes} mins · Automated Instant Grading
          </p>
        </div>

        {/* Assessment Switcher */}
        <div className="flex items-center gap-2">
          {classAssessments.map((ass) => (
            <button
              key={ass.id}
              onClick={() => {
                setActiveAssessmentId(ass.id);
                handleRetake();
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                currentAssessment.id === ass.id
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {ass.type === 'exam' ? '📝 Term Exam' : '🧠 Unit Quiz'}
            </button>
          ))}
        </div>
      </div>

      {/* RESULT CARD: If completed */}
      {(isSubmitted || (existingResult && !activeResult && Object.keys(userAnswers).length === 0)) ? (
        (() => {
          const displayRes = activeResult || existingResult!;
          return (
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-xs space-y-6 text-center">
              <div className="max-w-md mx-auto space-y-3">
                <div
                  className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center text-3xl font-bold shadow-md ${
                    displayRes.grade === 'A'
                      ? 'bg-emerald-100 text-emerald-800'
                      : displayRes.grade === 'B'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  Grade {displayRes.grade}
                </div>

                <h2 className="text-2xl font-bold font-heading text-slate-900">
                  Assessment Completed!
                </h2>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-xs text-slate-500">Total Score</p>
                    <p className="text-xl font-bold text-slate-900 tabular-nums">
                      {displayRes.score}/{displayRes.totalMarks}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Percentage</p>
                    <p className="text-xl font-bold text-emerald-700 tabular-nums">
                      {displayRes.percentage}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Final Grade</p>
                    <p className="text-xl font-bold text-blue-900">
                      {displayRes.grade} (Passed)
                    </p>
                  </div>
                </div>

                <p className="text-xs text-slate-600">
                  Completed by <strong>{currentUser.name}</strong> · Saved to official Salem Montessori Gradebook.
                </p>

                <div className="pt-2 flex justify-center gap-3">
                  <button
                    onClick={handleRetake}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Retake Assessment
                  </button>
                </div>
              </div>

              {/* Detailed Question Review */}
              <div className="pt-6 border-t border-slate-200 text-left max-w-2xl mx-auto space-y-4">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Automated Question-by-Question Marking Review
                </h4>

                <div className="space-y-4">
                  {currentAssessment.questions.map((q, idx) => {
                    const studentAns = displayRes.answers[q.id];
                    const isCorrect = studentAns === q.correctAnswer;
                    return (
                      <div
                        key={q.id}
                        className={`p-4 rounded-xl border text-xs space-y-2 ${
                          isCorrect
                            ? 'bg-emerald-50/50 border-emerald-200'
                            : 'bg-rose-50/50 border-rose-200'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-semibold text-slate-900">
                            {idx + 1}. {q.prompt}
                          </p>
                          <span
                            className={`font-bold shrink-0 ${
                              isCorrect ? 'text-emerald-700' : 'text-rose-700'
                            }`}
                          >
                            {isCorrect ? `✓ ${q.marks}/${q.marks} marks` : `0/${q.marks} marks`}
                          </span>
                        </div>

                        {q.options && (
                          <div className="space-y-1 text-slate-700 pl-2">
                            {q.options.map((opt, oIdx) => (
                              <div
                                key={oIdx}
                                className={`flex items-center gap-2 p-1.5 rounded-md ${
                                  oIdx === q.correctAnswer
                                    ? 'bg-emerald-100/70 font-semibold text-emerald-950'
                                    : oIdx === studentAns
                                    ? 'bg-rose-100/70 text-rose-950'
                                    : ''
                                }`}
                              >
                                <span>{String.fromCharCode(65 + oIdx)}.</span>
                                <span>{opt}</span>
                                {oIdx === q.correctAnswer && <span className="text-emerald-700">✅ (Correct)</span>}
                                {oIdx === studentAns && oIdx !== q.correctAnswer && (
                                  <span className="text-rose-700">❌ (Your choice)</span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {q.explanation && (
                          <p className="text-[11px] text-slate-500 italic pt-1 border-t border-slate-200/60">
                            💡 Teacher Explanation: {q.explanation}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })()
      ) : (
        /* QUESTION TAKER VIEWPORT */
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          {/* Progress Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <span className="text-xs font-bold text-blue-900 uppercase tracking-wider">
              Question {currentQuestionIndex + 1} of {currentAssessment.questions.length}
            </span>
            <span className="text-xs text-slate-500 font-mono">
              Worth: {currentQuestion.marks} Marks
            </span>
          </div>

          {/* Question Prompt */}
          <div className="space-y-4">
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
              {currentQuestion.prompt}
            </h3>

            {/* If question contains visual image/diagram */}
            {currentQuestion.imageVisual && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center text-center">
                {currentQuestion.imageVisual === 'cpu_chip' && (
                  <div className="p-4 bg-slate-900 text-amber-300 rounded-xl font-mono text-xs shadow-md">
                    <p className="text-2xl mb-1">🔲</p>
                    <p className="font-bold text-white">INTEL CORE i7 / ARM V8 ARCHITECTURE</p>
                    <p className="text-[10px] text-slate-400">Integrated Arithmetic Logic &amp; Control Unit</p>
                  </div>
                )}
                {currentQuestion.imageVisual === 'printer' && (
                  <div className="p-4 bg-slate-900 text-emerald-300 rounded-xl font-mono text-xs shadow-md">
                    <p className="text-2xl mb-1">🖨️</p>
                    <p className="font-bold text-white">LASER JET HIGH-PRECISION PRINTER</p>
                    <p className="text-[10px] text-slate-400">Hard-copy Paper Generation Unit</p>
                  </div>
                )}
              </div>
            )}

            {/* Answer Options */}
            <div className="space-y-2.5 pt-2">
              {currentQuestion.options?.map((opt, idx) => {
                const isSelected = userAnswers[currentQuestion.id] === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectAnswer(idx)}
                    className={`w-full p-4 rounded-xl border text-left text-xs sm:text-sm font-medium transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-blue-50 border-blue-900 text-blue-950 font-semibold shadow-xs'
                        : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          isSelected ? 'bg-blue-900 text-white' : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span>{opt}</span>
                    </div>

                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        isSelected ? 'border-blue-900' : 'border-slate-300'
                      }`}
                    >
                      {isSelected && <div className="w-2 h-2 rounded-full bg-blue-900" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Stepper Controls */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-200">
            <button
              disabled={currentQuestionIndex === 0}
              onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
              className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-40 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>

            {currentQuestionIndex < currentAssessment.questions.length - 1 ? (
              <button
                onClick={() =>
                  setCurrentQuestionIndex((prev) =>
                    Math.min(currentAssessment.questions.length - 1, prev + 1)
                  )
                }
                className="px-5 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleFinishAssessment}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" /> Submit for Grading
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
