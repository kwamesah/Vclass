import React, { useState, useEffect, useRef } from 'react';
import {
  Timer,
  Play,
  Pause,
  RotateCcw,
  Plus,
  Minus,
  Dices,
  Trophy,
  Sparkles,
  Award,
  X,
  Volume2,
  CheckCircle2,
  Star,
  Users,
  Maximize2,
  Minimize2,
  Radio,
  PenTool,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { User } from '../../types';

export interface ParticipantUser {
  id: string;
  name: string;
  role: 'teacher' | 'student' | 'admin' | string;
  avatar: string;
  isCameraOn?: boolean;
  isCamera?: boolean;
  isMicOn?: boolean;
  isMuted?: boolean;
  hand?: boolean;
  hasWhiteboardAccess?: boolean;
}

interface ClassroomGadgetsProps {
  isHost: boolean;
  currentUser: User;
  participants: ParticipantUser[];
  onGrantWhiteboard?: (studentId: string) => void;
  onSendChatMessage?: (text: string, isAnnouncement?: boolean) => void;
  onAwardPoints?: (studentId: string, points: number, reason: string) => void;
  safeBroadcast?: (msg: any) => void;
}

export const ClassroomGadgets: React.FC<ClassroomGadgetsProps> = ({
  isHost,
  currentUser,
  participants,
  onGrantWhiteboard,
  onSendChatMessage,
  onAwardPoints,
  safeBroadcast,
}) => {
  // Active gadget modal tab: null | 'timer' | 'picker' | 'award'
  const [activeGadget, setActiveGadget] = useState<'timer' | 'picker' | 'award' | null>(null);

  // Floating Minimized Timer Widget on Stage
  const [isTimerDocked, setIsTimerDocked] = useState<boolean>(true);

  // --- 1. COUNTDOWN TIMER & STOPWATCH STATE ---
  const [timerMode, setTimerMode] = useState<'countdown' | 'stopwatch'>('countdown');
  const [initialDuration, setInitialDuration] = useState<number>(180); // default 3 mins
  const [secondsRemaining, setSecondsRemaining] = useState<number>(180);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [timerAlertActive, setTimerAlertActive] = useState<boolean>(false);

  // Sound Synthesizer via Web Audio API
  const playSynthesizedChime = (type: 'timer' | 'tick' | 'award') => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      if (type === 'timer') {
        // High crisp double chime on expiry
        const now = ctx.currentTime;
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(659.25, now); // E5
        osc1.frequency.setValueAtTime(880, now + 0.25); // A5
        gain1.gain.setValueAtTime(0.25, now);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start(now);
        osc1.stop(now + 0.8);
      } else if (type === 'tick') {
        // Soft blip during random selector cycling
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440 + Math.random() * 200, now);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.05);
      } else if (type === 'award') {
        // Multi-frequency celebration fanfare
        const now = ctx.currentTime;
        [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + i * 0.08);
          gain.gain.setValueAtTime(0.2, now + i * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.4);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + i * 0.08);
          osc.stop(now + i * 0.08 + 0.45);
        });
      }
    } catch {
      // Audio autoplay restrictions fallback
    }
  };

  // Timer Tick Interval
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        if (timerMode === 'countdown') {
          setSecondsRemaining((prev) => {
            if (prev <= 1) {
              clearInterval(interval);
              setIsTimerRunning(false);
              setTimerAlertActive(true);
              playSynthesizedChime('timer');
              confetti({ particleCount: 40, spread: 50 });
              if (safeBroadcast) {
                safeBroadcast({ type: 'GADGET_TIMER_EXPIRED' });
              }
              return 0;
            }
            return prev - 1;
          });
        } else {
          // Stopwatch counts up
          setSecondsRemaining((prev) => prev + 1);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerMode]);

  const handleStartTimer = (duration?: number) => {
    if (duration !== undefined) {
      setInitialDuration(duration);
      setSecondsRemaining(duration);
    }
    setTimerAlertActive(false);
    setIsTimerRunning(true);
    if (safeBroadcast) {
      safeBroadcast({
        type: 'GADGET_TIMER_START',
        duration: duration || secondsRemaining,
        mode: timerMode,
      });
    }
  };

  const handlePauseTimer = () => {
    setIsTimerRunning(false);
    if (safeBroadcast) {
      safeBroadcast({ type: 'GADGET_TIMER_PAUSE' });
    }
  };

  const handleResetTimer = () => {
    setIsTimerRunning(false);
    setTimerAlertActive(false);
    setSecondsRemaining(timerMode === 'countdown' ? initialDuration : 0);
    if (safeBroadcast) {
      safeBroadcast({ type: 'GADGET_TIMER_RESET', initial: initialDuration });
    }
  };

  const adjustTimerSeconds = (delta: number) => {
    setSecondsRemaining((prev) => Math.max(10, prev + delta));
    setInitialDuration((prev) => Math.max(10, prev + delta));
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // --- 2. STUDENT TURN SELECTOR WHEEL STATE ---
  const eligibleStudents = participants.filter((p) => p.role === 'student');
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [selectedStudent, setSelectedStudent] = useState<ParticipantUser | null>(null);
  const [candidateIndex, setCandidateIndex] = useState<number>(0);
  const spinTimerRef = useRef<any>(null);

  const handleSpinStudentPicker = () => {
    if (eligibleStudents.length === 0 || isSpinning) return;
    setIsSpinning(true);
    setSelectedStudent(null);

    let speed = 60; // initial rapid cycle (ms)
    let cycles = 0;
    const maxCycles = 28 + Math.floor(Math.random() * 8);

    const step = () => {
      setCandidateIndex((prev) => (prev + 1) % eligibleStudents.length);
      playSynthesizedChime('tick');
      cycles++;

      if (cycles < maxCycles) {
        speed += 12; // decelerate smoothly
        spinTimerRef.current = setTimeout(step, speed);
      } else {
        const finalStudent = eligibleStudents[(candidateIndex + 1) % eligibleStudents.length];
        setSelectedStudent(finalStudent);
        setIsSpinning(false);
        playSynthesizedChime('award');
        confetti({ particleCount: 50, spread: 60 });

        if (onSendChatMessage) {
          onSendChatMessage(`🎯 Spotlight Turn: ${finalStudent.name} has been selected for oral recitation!`, true);
        }

        if (safeBroadcast) {
          safeBroadcast({
            type: 'GADGET_STUDENT_SELECTED',
            student: finalStudent,
          });
        }
      }
    };

    spinTimerRef.current = setTimeout(step, speed);
  };

  // --- 3. MERIT TROPHY & REWARD EMITTER STATE ---
  const [targetStudentId, setTargetStudentId] = useState<string>(
    eligibleStudents[0]?.id || ''
  );
  const [awardType, setAwardType] = useState<string>('star');
  const [awardNote, setAwardNote] = useState<string>('Superb reasoning and clear contribution!');
  const [recentCelebration, setRecentCelebration] = useState<{
    studentName: string;
    badgeTitle: string;
    points: number;
    avatar: string;
  } | null>(null);

  const REWARD_PRESETS = [
    {
      id: 'star',
      title: 'Star of Participation',
      points: 10,
      icon: Star,
      color: 'text-amber-400 bg-amber-400/20 border-amber-400/40',
      description: 'Active voice & enthusiastic classroom engagement',
    },
    {
      id: 'excellence',
      title: 'Montessori Academic Trophy',
      points: 25,
      icon: Trophy,
      color: 'text-yellow-400 bg-yellow-400/20 border-yellow-400/40',
      description: 'Mastery of subject concept and thorough explanation',
    },
    {
      id: 'insight',
      title: 'Critical Inquiry & Logic',
      points: 15,
      icon: Sparkles,
      color: 'text-cyan-400 bg-cyan-400/20 border-cyan-400/40',
      description: 'Posing sharp questions & analytical problem-solving',
    },
    {
      id: 'teamwork',
      title: 'Leadership & Collaboration',
      points: 20,
      icon: Award,
      color: 'text-emerald-400 bg-emerald-400/20 border-emerald-400/40',
      description: 'Supporting peers and fostering constructive dialogue',
    },
  ];

  const handleGrantAward = () => {
    const student = participants.find((p) => p.id === targetStudentId);
    if (!student) return;

    const selectedPreset = REWARD_PRESETS.find((r) => r.id === awardType) || REWARD_PRESETS[0];

    // Trigger celebration effects
    playSynthesizedChime('award');
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });

    setRecentCelebration({
      studentName: student.name,
      badgeTitle: selectedPreset.title,
      points: selectedPreset.points,
      avatar: student.avatar,
    });

    // Notify student & room
    if (onAwardPoints) {
      onAwardPoints(student.id, selectedPreset.points, selectedPreset.title);
    }

    if (onSendChatMessage) {
      onSendChatMessage(
        `🏆 Merit Award: ${student.name} received the "${selectedPreset.title}" (+${selectedPreset.points} pts) from ${currentUser.name}! "${awardNote}"`,
        true
      );
    }

    if (safeBroadcast) {
      safeBroadcast({
        type: 'GADGET_MERIT_AWARD',
        studentId: student.id,
        studentName: student.name,
        badgeTitle: selectedPreset.title,
        points: selectedPreset.points,
        note: awardNote,
      });
    }

    setTimeout(() => {
      setRecentCelebration(null);
    }, 4500);
  };

  return (
    <>
      {/* 1. FLOATING STAGE BANNER CELEBRATION (When Award Granted) */}
      {recentCelebration && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-in fade-in zoom-in slide-in-from-top-4 duration-300">
          <div className="bg-slate-900/95 border-2 border-amber-400/80 shadow-2xl shadow-amber-500/20 text-white px-5 py-3 rounded-2xl flex items-center gap-3 backdrop-blur-md">
            <div className="w-12 h-12 rounded-full border-2 border-amber-400 overflow-hidden shrink-0">
              <img
                src={recentCelebration.avatar}
                alt={recentCelebration.studentName}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                  Merit Award Conferred!
                </span>
                <span className="px-1.5 py-0.2 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-200 text-[10px] font-mono font-bold">
                  +{recentCelebration.points} PTS
                </span>
              </div>
              <p className="text-sm font-extrabold text-white">
                {recentCelebration.studentName}
              </p>
              <p className="text-xs text-slate-300">
                {recentCelebration.badgeTitle}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 2. DOCKED FLOATING COUNTDOWN TIMER WIDGET (Always visible on stage when running or pinned) */}
      {(isTimerRunning || isTimerDocked || timerAlertActive) && (
        <div
          className={`fixed bottom-20 left-4 z-30 transition-all ${
            timerAlertActive ? 'animate-bounce' : ''
          }`}
        >
          <div
            className={`p-2 rounded-2xl shadow-xl backdrop-blur-md border transition-all flex items-center gap-2.5 ${
              timerAlertActive
                ? 'bg-rose-950/95 border-rose-500 text-rose-100 ring-4 ring-rose-500/40'
                : isTimerRunning
                ? 'bg-slate-900/90 border-blue-500/50 text-white'
                : 'bg-slate-900/80 border-slate-700/60 text-slate-300'
            }`}
          >
            {/* Timer Icon & Indicator */}
            <button
              type="button"
              onClick={() => setActiveGadget('timer')}
              className={`p-1.5 rounded-xl cursor-pointer ${
                timerAlertActive
                  ? 'bg-rose-600 text-white animate-pulse'
                  : isTimerRunning
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
              title="Open Full Timer Controls"
            >
              <Timer className="w-4 h-4" />
            </button>

            {/* Digits Display */}
            <div
              onClick={() => setActiveGadget('timer')}
              className="cursor-pointer select-none"
            >
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block leading-none">
                {timerMode === 'countdown' ? 'Class Timer' : 'Stopwatch'}
              </span>
              <span
                className={`text-base font-extrabold font-mono tabular-nums tracking-tight ${
                  timerAlertActive
                    ? 'text-rose-400'
                    : isTimerRunning
                    ? 'text-amber-400'
                    : 'text-slate-200'
                }`}
              >
                {formatTime(secondsRemaining)}
              </span>
            </div>

            {/* Quick Play/Pause/Reset Controls (If Host) */}
            {isHost && (
              <div className="flex items-center gap-1 border-l border-slate-700/60 pl-2">
                {isTimerRunning ? (
                  <button
                    type="button"
                    onClick={handlePauseTimer}
                    className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 transition-colors cursor-pointer"
                    title="Pause"
                  >
                    <Pause className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleStartTimer()}
                    className="p-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors cursor-pointer"
                    title="Start"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleResetTimer}
                  className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  title="Reset"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() => setIsTimerDocked(false)}
              className="p-1 text-slate-500 hover:text-slate-300 rounded cursor-pointer"
              title="Minimize pill"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* 3. CLASSROOM GADGETS TOOLBAR LAUNCHER BUTTON (Embedded in Stage Controls) */}
      <div className="relative inline-flex items-center">
        <div className="flex items-center gap-1 bg-slate-800/90 border border-slate-700/80 p-0.5 rounded-xl text-xs">
          <button
            type="button"
            onClick={() => setActiveGadget(activeGadget === 'timer' ? null : 'timer')}
            className={`px-2.5 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeGadget === 'timer'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
            }`}
            title="Classroom Countdown Timer & Stopwatch"
          >
            <Timer className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden xl:inline">Timer</span>
          </button>

          {isHost && (
            <>
              <button
                type="button"
                onClick={() => setActiveGadget(activeGadget === 'picker' ? null : 'picker')}
                className={`px-2.5 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeGadget === 'picker'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
                }`}
                title="Random Student Turn Selector Wheel"
              >
                <Dices className="w-3.5 h-3.5 text-purple-400" />
                <span className="hidden xl:inline">Picker</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveGadget(activeGadget === 'award' ? null : 'award')}
                className={`px-2.5 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeGadget === 'award'
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
                }`}
                title="Award Montessori Merit Trophy & Stars"
              >
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden xl:inline">Trophies</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* 4. MODAL DIALOGS FOR ACTIVE GADGET */}
      {activeGadget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {activeGadget === 'timer' && <Timer className="w-4 h-4 text-blue-400" />}
                {activeGadget === 'picker' && <Dices className="w-4 h-4 text-purple-400" />}
                {activeGadget === 'award' && <Trophy className="w-4 h-4 text-amber-400" />}
                <h3 className="text-sm font-bold text-white">
                  {activeGadget === 'timer' && 'Classroom Timer & Stopwatch'}
                  {activeGadget === 'picker' && 'Random Student Turn Selector'}
                  {activeGadget === 'award' && 'Award Montessori Merit Trophy'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveGadget(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body: TIMER GADGET */}
            {activeGadget === 'timer' && (
              <div className="p-5 space-y-5 text-white">
                {/* Mode Selector */}
                <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setTimerMode('countdown');
                      setSecondsRemaining(initialDuration);
                      setIsTimerRunning(false);
                    }}
                    className={`flex-1 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                      timerMode === 'countdown' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Countdown Challenge
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTimerMode('stopwatch');
                      setSecondsRemaining(0);
                      setIsTimerRunning(false);
                    }}
                    className={`flex-1 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                      timerMode === 'stopwatch' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Stopwatch Mode
                  </button>
                </div>

                {/* Big Clock Display */}
                <div className="py-6 px-4 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col items-center justify-center relative overflow-hidden">
                  <div
                    className={`text-5xl font-black font-mono tabular-nums tracking-wider transition-colors ${
                      timerAlertActive ? 'text-rose-500 animate-pulse' : 'text-amber-400'
                    }`}
                  >
                    {formatTime(secondsRemaining)}
                  </div>
                  <span className="text-[11px] text-slate-400 mt-2 font-medium">
                    {timerAlertActive
                      ? '⏰ Time Expired! Exercise Complete.'
                      : isTimerRunning
                      ? 'Live synchronizing with all pupils'
                      : 'Paused'}
                  </span>

                  {/* Preset Buttons for Quick Classroom Intervals */}
                  {timerMode === 'countdown' && !isTimerRunning && (
                    <div className="grid grid-cols-4 gap-2 mt-4 w-full">
                      {[60, 180, 300, 600].map((durationSec) => (
                        <button
                          key={durationSec}
                          type="button"
                          onClick={() => {
                            setInitialDuration(durationSec);
                            setSecondsRemaining(durationSec);
                          }}
                          className={`py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                            initialDuration === durationSec
                              ? 'bg-blue-600/30 border-blue-500 text-blue-300'
                              : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          {durationSec / 60} min
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Manual +/- 30s adjustment */}
                  {timerMode === 'countdown' && !isTimerRunning && (
                    <div className="flex items-center gap-2 mt-3 text-xs">
                      <button
                        type="button"
                        onClick={() => adjustTimerSeconds(-30)}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Minus className="w-3 h-3" /> 30s
                      </button>
                      <button
                        type="button"
                        onClick={() => adjustTimerSeconds(30)}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" /> 30s
                      </button>
                    </div>
                  )}
                </div>

                {/* Primary Action Controls */}
                <div className="flex items-center gap-3">
                  {isTimerRunning ? (
                    <button
                      type="button"
                      onClick={handlePauseTimer}
                      className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer text-xs"
                    >
                      <Pause className="w-4 h-4 fill-slate-950" /> Pause Timer
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleStartTimer()}
                      className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer text-xs"
                    >
                      <Play className="w-4 h-4 fill-white" /> Start Timer
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleResetTimer}
                    className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition-colors cursor-pointer"
                    title="Reset to default duration"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Keep docked on stage:</span>
                  <button
                    type="button"
                    onClick={() => setIsTimerDocked(!isTimerDocked)}
                    className={`px-2 py-0.5 rounded-full font-semibold cursor-pointer ${
                      isTimerDocked ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {isTimerDocked ? 'Docked' : 'Hidden'}
                  </button>
                </div>
              </div>
            )}

            {/* Body: STUDENT TURN SELECTOR GADGET */}
            {activeGadget === 'picker' && (
              <div className="p-5 space-y-4 text-white">
                <p className="text-xs text-slate-400">
                  Fair recitation selector: pick a pupil at random for oral reading, problem solving, or board presentation.
                </p>

                {/* Candidate Reel Card */}
                <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800 text-center relative overflow-hidden flex flex-col items-center justify-center min-h-[160px]">
                  {eligibleStudents.length === 0 ? (
                    <div className="text-slate-500 text-xs">
                      <Users className="w-8 h-8 mx-auto mb-2 text-slate-700" />
                      <p>No students currently logged into this session.</p>
                    </div>
                  ) : (
                    <>
                      {/* Active Candidate Display */}
                      {(() => {
                        const candidate = eligibleStudents[candidateIndex] || eligibleStudents[0];
                        const isFinal = selectedStudent !== null && !isSpinning;
                        return (
                          <div className={`transition-all ${isSpinning ? 'scale-95 blur-[0.5px]' : 'scale-100'}`}>
                            <div className="w-16 h-16 rounded-full border-2 border-purple-500/80 mx-auto overflow-hidden shadow-xl mb-3 relative">
                              <img
                                src={candidate.avatar}
                                alt={candidate.name}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover"
                              />
                              {isFinal && (
                                <div className="absolute inset-0 bg-purple-500/20 flex items-center justify-center">
                                  <Sparkles className="w-6 h-6 text-amber-300 animate-spin" />
                                </div>
                              )}
                            </div>
                            <h4 className="text-base font-extrabold text-white">
                              {candidate.name}
                            </h4>
                            <span className="text-[11px] text-purple-300 font-semibold">
                              {isFinal ? '🎉 Selected for Recitation Turn!' : isSpinning ? 'Cycling pupils...' : 'Ready to Spin'}
                            </span>
                          </div>
                        );
                      })()}
                    </>
                  )}
                </div>

                {/* Spin Action */}
                <div className="space-y-2">
                  <button
                    type="button"
                    disabled={isSpinning || eligibleStudents.length === 0}
                    onClick={handleSpinStudentPicker}
                    className="w-full py-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white font-bold rounded-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer text-xs"
                  >
                    <Dices className={`w-4 h-4 ${isSpinning ? 'animate-spin' : ''}`} />
                    <span>{isSpinning ? 'Selecting...' : 'Spin / Pick Pupil'}</span>
                  </button>

                  {/* Actions for Selected Student */}
                  {selectedStudent && (
                    <div className="pt-2 flex items-center gap-2">
                      {onGrantWhiteboard && (
                        <button
                          type="button"
                          onClick={() => {
                            onGrantWhiteboard(selectedStudent.id);
                            setActiveGadget(null);
                          }}
                          className="flex-1 py-2 bg-blue-900 hover:bg-blue-800 text-blue-200 border border-blue-700/60 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <PenTool className="w-3.5 h-3.5 text-blue-300" />
                          <span>Grant Whiteboard</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setTargetStudentId(selectedStudent.id);
                          setActiveGadget('award');
                        }}
                        className="flex-1 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Trophy className="w-3.5 h-3.5 text-amber-400" />
                        <span>Award Trophy</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Body: MERIT REWARDS GADGET */}
            {activeGadget === 'award' && (
              <div className="p-5 space-y-4 text-white">
                <p className="text-xs text-slate-400">
                  Reinforce constructive Montessori participation by conferring merit stars and academic reward trophies.
                </p>

                {/* Recipient Selector */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Select Pupil:
                  </label>
                  <select
                    value={targetStudentId}
                    onChange={(e) => setTargetStudentId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                  >
                    {eligibleStudents.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Award Type Selector Grid */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    Award Category & Points:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {REWARD_PRESETS.map((rp) => {
                      const Icon = rp.icon;
                      const isSel = awardType === rp.id;
                      return (
                        <button
                          key={rp.id}
                          type="button"
                          onClick={() => setAwardType(rp.id)}
                          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                            isSel
                              ? 'bg-amber-500/20 border-amber-400 text-white ring-1 ring-amber-400'
                              : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <Icon className="w-4 h-4 text-amber-400" />
                            <span className="text-[10px] font-mono font-bold text-amber-300">
                              +{rp.points} PTS
                            </span>
                          </div>
                          <p className="text-xs font-bold leading-tight truncate">{rp.title}</p>
                          <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{rp.description}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Praise Note */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Commendation Feedback (Broadcast in Class Stream):
                  </label>
                  <input
                    type="text"
                    value={awardNote}
                    onChange={(e) => setAwardNote(e.target.value)}
                    placeholder="e.g. Excellent articulation of computing hardware principles!"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>

                {/* Emit Reward Button */}
                <button
                  type="button"
                  disabled={!targetStudentId}
                  onClick={() => {
                    handleGrantAward();
                    setActiveGadget(null);
                  }}
                  className="w-full py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-extrabold rounded-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer text-xs"
                >
                  <Trophy className="w-4 h-4 fill-slate-950" />
                  <span>Confer Merit Award</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
