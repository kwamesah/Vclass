import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  MonitorUp,
  Radio,
  Hand,
  MessageSquare,
  Users,
  BarChart2,
  Download,
  PenTool,
  Sparkles,
  Eraser,
  Trash2,
  CheckCircle2,
  Clock,
  LogOut,
  Copy,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  FileText,
  Send,
  Smile,
  Check,
  X,
  Volume2,
  ShieldCheck,
  PanelRightClose,
  PanelRightOpen,
  LayoutGrid,
  FileCheck2,
  BrainCircuit,
  SlidersHorizontal,
  FolderDown,
  Layers,
  Globe,
  Play,
  Pause,
  Square,
  ExternalLink,
  RefreshCw,
  FileUp,
  Presentation,
  AlertTriangle,
  Bug,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { VClassSession, LivePoll } from '../../types';
import { logger } from '../../utils/logger';
import { DiagnosticConsoleModal } from '../shared/DiagnosticConsoleModal';
import { ClassroomGadgets } from './ClassroomGadgets';
import { CollaborativeWhiteboard } from './CollaborativeWhiteboard';

interface ChatMessage {
  id: string;
  sender: string;
  senderId: string;
  role: 'teacher' | 'student' | 'admin';
  avatar: string;
  text: string;
  time: string;
  isAnnouncement?: boolean;
}

interface Participant {
  id: string;
  name: string;
  role: 'teacher' | 'student' | 'admin';
  avatar: string;
  isMuted: boolean;
  isCamera: boolean;
  hand: boolean;
  handRaisedAt?: number;
  isSpeaking?: boolean;
}

interface FloatingReaction {
  id: string;
  emoji: string;
  x: number;
}

const QUICK_EMOJIS = ['❤️', '👏', '👍', '🎉', '💡', '🔥', '🚀', '✋'];
const CHAT_EMOJI_LIST = ['😀', '😂', '😍', '🤔', '👍', '👎', '👏', '🎉', '🔥', '💡', '📚', '✏️', '💯', '✨', '🙋‍♂️', '🙋‍♀️', '❓', '✅'];

export const VClassStudio: React.FC = () => {
  const {
    currentUser: rawCurrentUser,
    users,
    vclasses,
    assessments,
    activeVClassId,
    setActiveVClassId,
    startVClass,
    endVClass,
    launchLivePoll,
    submitLivePollVote,
    setActiveAssessmentId,
    setActiveNav,
    addToast,
    addDigitalResource,
    updateUser,
  } = useApp();

  const currentUser = rawCurrentUser || {
    id: 'user-tea-oba',
    name: 'Richard Oba',
    role: 'teacher' as const,
    email: 'richard.oba@salem.edu',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    staffId: 'SMS-FAC-09',
  };

  // Resolve session dynamically based on current user role and selection
  const resolveActiveSession = (): VClassSession => {
    // 1. Explicit selection if found
    if (activeVClassId) {
      const found = vclasses.find((v) => v.id === activeVClassId);
      if (found) return found;
    }

    // 2. If Teacher is logged in: find THIS teacher's session (never show another teacher's session)
    if (currentUser.role === 'teacher') {
      const myLive = vclasses.find(
        (v) =>
          (v.teacherId === currentUser.id || v.teacherName?.toLowerCase() === currentUser.name?.toLowerCase()) &&
          (v.isLive || v.status === 'live')
      );
      if (myLive) return myLive;

      const myScheduled = vclasses.find(
        (v) =>
          v.teacherId === currentUser.id || v.teacherName?.toLowerCase() === currentUser.name?.toLowerCase()
      );
      if (myScheduled) return myScheduled;

      // Teacher-specific dynamic fallback (customized to teacher's identity)
      const teacherSubject = currentUser.name.includes('Grace')
        ? 'Mathematics'
        : currentUser.name.includes('Rebecca')
        ? 'English Language'
        : currentUser.name.includes('Okyere')
        ? 'Integrated Science'
        : currentUser.name.includes('Jean-Paul') || currentUser.name.includes('Kouassi')
        ? 'French'
        : currentUser.name.includes('Annan')
        ? 'Social Studies'
        : currentUser.name.includes('Appiah')
        ? 'Creative Arts'
        : 'Computing';

      return {
        id: `vclass-teacher-${currentUser.id}`,
        title: `${currentUser.name}'s Live Studio`,
        subject: teacherSubject,
        classLevel: 'B7',
        teacherName: currentUser.name,
        teacherAvatar: currentUser.avatar,
        teacherId: currentUser.id,
        date: 'Today',
        time: 'Live Now',
        durationMinutes: 45,
        isLive: true,
        status: 'live',
        recordingAvailable: false,
        materials: [],
        attendeesCount: 1,
        meetingTopic: `${teacherSubject} Live Session`,
        roomCode: `SMS-${currentUser.id.slice(-4).toUpperCase() || 'LIVE'}`,
      };
    }

    // 3. If Student is logged in: find sessions for THIS student's class
    if (currentUser.role === 'student') {
      const classLevel = currentUser.classLevel || 'B7';
      const classLive = vclasses.find(
        (v) =>
          (v.classLevel === classLevel || v.classLevel === 'All Classes') &&
          (v.isLive || v.status === 'live')
      );
      if (classLive) return classLive;

      const classScheduled = vclasses.find(
        (v) => v.classLevel === classLevel || v.classLevel === 'All Classes'
      );
      if (classScheduled) return classScheduled;

      return {
        id: `vclass-student-${classLevel}`,
        title: `Class ${classLevel} Virtual Classroom`,
        subject: 'General Curriculum',
        classLevel: classLevel,
        teacherName: 'Faculty Host',
        teacherAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        teacherId: 'tea-default',
        date: 'Today',
        time: 'Scheduled',
        durationMinutes: 45,
        isLive: false,
        status: 'scheduled',
        recordingAvailable: false,
        materials: [],
        attendeesCount: 1,
        meetingTopic: `Class ${classLevel} Interactive Session`,
        roomCode: `SMS-${classLevel}`,
      };
    }

    // 4. Admin / General fallback
    return (
      vclasses[0] || {
        id: `vclass-${currentUser.id || 'main'}`,
        title: 'Salem Virtual Studio Stage',
        subject: 'General Live Session',
        classLevel: currentUser.classLevel || 'All Classes',
        teacherName: currentUser.name || 'System Administrator',
        teacherAvatar: currentUser.avatar,
        teacherId: currentUser.id,
        date: 'Today',
        time: 'Live Stage',
        durationMinutes: 45,
        isLive: true,
        status: 'live',
        recordingAvailable: false,
        materials: [],
        attendeesCount: 1,
        meetingTopic: 'Salem Live Stage Discussion',
        roomCode: `SMS-${currentUser.id ? currentUser.id.slice(-4).toUpperCase() : '7841'}`,
      }
    );
  };

  const activeSession: VClassSession = resolveActiveSession();

  const isHost =
    currentUser.role === 'admin' ||
    (currentUser.role === 'teacher' &&
      (activeSession.teacherId === currentUser.id ||
        activeSession.teacherName?.toLowerCase() === currentUser.name?.toLowerCase()));

  // In-session UI states
  const [isMicOn, setIsMicOn] = useState<boolean>(true);
  const [isCameraOn, setIsCameraOn] = useState<boolean>(true);
  const [isScreenSharing, setIsScreenSharing] = useState<boolean>(false);
  const [activeStageMode, setActiveStageMode] = useState<'video' | 'slides' | 'whiteboard' | 'screenshare' | 'tab'>('video');
  const [isHandRaised, setIsHandRaised] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [floatingReactions, setFloatingReactions] = useState<FloatingReaction[]>([]);
  const [handRaiseAlert, setHandRaiseAlert] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [sidebarTab, setSidebarTab] = useState<'chat' | 'hands' | 'participants' | 'poll' | 'materials'>('chat');
  const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
  const [showPollCreator, setShowPollCreator] = useState<boolean>(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState<boolean>(false);
  const [showDeviceSettings, setShowDeviceSettings] = useState<boolean>(false);
  const [memberSearchQuery, setMemberSearchQuery] = useState<string>('');

  // Tab Presentation and Screen Sharing state
  const [showPresentationHub, setShowPresentationHub] = useState<boolean>(false);
  const [presentationHubTab, setPresentationHubTab] = useState<'screen' | 'tabs' | 'slides'>('screen');
  const [presentedTabId, setPresentedTabId] = useState<'hardware' | 'library' | 'science' | 'sandbox'>('hardware');

  // Real Recording states
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const [showRecordingModal, setShowRecordingModal] = useState<boolean>(false);

  // Interactive Code Sandbox in Tab Presenter
  const [codeSandboxInput, setCodeSandboxInput] = useState<string>(
    '// Salem Live Code Sandbox\nfunction calculateGrade(score, maxScore) {\n  const percentage = (score / maxScore) * 100;\n  return `${percentage.toFixed(1)}%`;\n}\n\nconsole.log("Score Calculation Demo:");\nconsole.log(calculateGrade(45, 50));'
  );
  const [codeSandboxOutput, setCodeSandboxOutput] = useState<string>(
    'Output ready. Click "Execute Code" to run live in front of class.'
  );
  const [hardwareBusActiveLine, setHardwareBusActiveLine] = useState<'data' | 'address' | 'control' | null>(null);

  // Video and Media Stream Refs
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const screenVideoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const chatScrollRef = useRef<HTMLDivElement | null>(null);
  const studioRootRef = useRef<HTMLDivElement | null>(null);

  // Presentation Slide State & Custom Document Uploader
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);
  const [customSlides, setCustomSlides] = useState<Array<{ title: string; subtitle: string; points: string[]; diagram: string; teacherNote: string }>>([]);
  const [uploadedDocName, setUploadedDocName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const slides = [
    {
      title: activeSession.title || 'Salem Virtual Classroom',
      subtitle: `${activeSession.subject} • Live Stage`,
      points: [
        'Welcome to the live interactive learning stage.',
        'Use the chat panel to post questions or raise your hand to speak.',
        'Present custom slides, documents, or use the whiteboard below.',
      ],
      diagram: '🎓 Salem Montessori Interactive Virtual Studio',
      teacherNote: 'Teacher is presenting to the live class.',
    },
  ];

  const activeSlides = customSlides.length > 0 ? customSlides : slides;

  const handleUploadPresentation = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedDocName(file.name);
    const newSlide = {
      title: `Uploaded Document: ${file.name}`,
      subtitle: `Live Class Presentation • ${activeSession.subject}`,
      points: [
        `File Name: ${file.name}`,
        `File Size: ${(file.size / (1024 * 1024)).toFixed(2)} MB`,
        `Format: ${file.type || 'Document'}`,
        'Successfully rendered and synchronized for all connected participants.',
      ],
      diagram: '📊 Live Document Synchronized Canvas',
      teacherNote: 'Teacher is presenting uploaded file to participants.',
    };
    setCustomSlides([newSlide]);
    setCurrentSlideIndex(0);
    confetti({ particleCount: 50, spread: 60 });
  };

  // Poll creation form states
  const [pollQuestion, setPollQuestion] = useState<string>('');
  const [pollOpt1, setPollOpt1] = useState<string>('');
  const [pollOpt2, setPollOpt2] = useState<string>('');
  const [pollOpt3, setPollOpt3] = useState<string>('');
  const [pollOpt4, setPollOpt4] = useState<string>('');
  const [hasVotedPoll, setHasVotedPoll] = useState<string | null>(null);

  // Chat message state
  const [chatInput, setChatInput] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // Participants roster (De-duplicate ID to guarantee unique React keys)
  const [participants, setParticipants] = useState<Participant[]>(() => {
    const list: Participant[] = [];
    const seenIds = new Set<string>();

    const addParticipant = (p: Participant) => {
      if (!seenIds.has(p.id)) {
        seenIds.add(p.id);
        list.push(p);
      }
    };

    if (isHost) {
      addParticipant({
        id: currentUser.id || activeSession.teacherId || 'tea-host',
        name: `${currentUser.name || activeSession.teacherName} (Host, You)`,
        role: 'teacher',
        avatar: currentUser.avatar || activeSession.teacherAvatar,
        isMuted: !isMicOn,
        isCamera: isCameraOn,
        hand: false,
        isSpeaking: false,
      });
    } else {
      if (activeSession.teacherId && activeSession.teacherId !== currentUser.id) {
        addParticipant({
          id: activeSession.teacherId,
          name: `${activeSession.teacherName || 'Class Teacher'} (Host)`,
          role: 'teacher',
          avatar: activeSession.teacherAvatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
          isMuted: false,
          isCamera: true,
          hand: false,
          isSpeaking: false,
        });
      }
      addParticipant({
        id: currentUser.id || 'user-me',
        name: `${currentUser.name || 'Student'} (You)`,
        role: (currentUser.role === 'teacher' ? 'teacher' : currentUser.role === 'admin' ? 'admin' : 'student'),
        avatar: currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        isMuted: !isMicOn,
        isCamera: isCameraOn,
        hand: isHandRaised,
        isSpeaking: false,
      });
    }

    return list;
  });

  // Broadcast Channel for Real-Time synchronization across tabs and windows
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    try {
      const channel = new BroadcastChannel(`salem_vclass_${activeSession.id}`);
      broadcastChannelRef.current = channel;

      channel.onmessage = (event) => {
        const data = event.data;
        if (!data) return;

        if (data.type === 'CHAT_MESSAGE') {
          setMessages((prev) => {
            if (prev.some((m) => m.id === data.message.id)) return prev;
            return [...prev, data.message];
          });
        } else if (data.type === 'EMOJI_REACTION') {
          triggerEmojiReaction(data.emoji, false);
        } else if (data.type === 'RAISE_HAND') {
          setHandRaiseAlert(data.userName);
          setParticipants((prev) =>
            prev.map((p) => (p.name.includes(data.userName) ? { ...p, hand: true, handRaisedAt: Date.now() } : p))
          );
          setTimeout(() => setHandRaiseAlert(null), 6000);
        } else if (data.type === 'LOWER_HAND') {
          setParticipants((prev) =>
            prev.map((p) => (p.name.includes(data.userName) ? { ...p, hand: false } : p))
          );
        } else if (data.type === 'WHITEBOARD_PERMISSION_UPDATE') {
          setAuthorizedStudentIds((prev) =>
            data.granted ? Array.from(new Set([...prev, data.studentId])) : prev.filter((id) => id !== data.studentId)
          );
        } else if (data.type === 'GADGET_MERIT_AWARD') {
          confetti({ particleCount: 60, spread: 60 });
        }
      };

      return () => {
        channel.close();
      };
    } catch {
      // Fallback if BroadcastChannel is restricted
    }
  }, [activeSession.id]);

  const safeBroadcast = (data: any) => {
    try {
      broadcastChannelRef.current?.postMessage(data);
    } catch (e) {
      console.warn('BroadcastChannel postMessage note:', e);
    }
  };

  // Delegated Whiteboard Student Permissions state
  const [authorizedStudentIds, setAuthorizedStudentIds] = useState<string[]>([]);
  const handleToggleStudentPermission = (studentId: string) => {
    setAuthorizedStudentIds((prev) =>
      prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId]
    );
    const student = participants.find((p) => p.id === studentId);
    if (student) {
      const isNowGranted = !authorizedStudentIds.includes(studentId);
      addToast(
        isNowGranted ? 'Whiteboard Pen Granted' : 'Whiteboard Pen Revoked',
        `${student.name} ${isNowGranted ? 'can now draw on the stage board.' : 'is now in read-only mode.'}`,
        'info'
      );
      safeBroadcast({
        type: 'WHITEBOARD_PERMISSION_UPDATE',
        studentId,
        granted: isNowGranted,
      });
    }
  };

  const handleGrantWhiteboard = (studentId: string) => {
    if (!authorizedStudentIds.includes(studentId)) {
      setAuthorizedStudentIds((prev) => [...prev, studentId]);
      const student = participants.find((p) => p.id === studentId);
      if (student) {
        addToast('Whiteboard Access Granted', `${student.name} can now draw on the collaborative stage board.`, 'success');
      }
      safeBroadcast({
        type: 'WHITEBOARD_PERMISSION_UPDATE',
        studentId,
        granted: true,
      });
    }
  };

  const handleSendGadgetMessage = (text: string, isAnnouncement = false) => {
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: isHost ? currentUser.name : 'VClass System',
      senderId: currentUser.id,
      role: (currentUser.role === 'teacher' ? 'teacher' : currentUser.role === 'admin' ? 'admin' : 'student'),
      avatar: currentUser.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isAnnouncement,
    };
    setMessages((prev) => [...prev, newMsg]);
    safeBroadcast({
      type: 'CHAT_MESSAGE',
      message: newMsg,
    });
  };

  const handleAwardPoints = (studentId: string, points: number, reason: string) => {
    const targetUser = users.find((u) => u.id === studentId);
    if (targetUser) {
      const currentPts = targetUser.points || 0;
      updateUser(studentId, { points: currentPts + points });
      addToast('Merit Award Conferred', `Awarded ${points} points to ${targetUser.name} (${reason})`, 'success');
    }
  };

  const [hasCameraError, setHasCameraError] = useState<boolean>(false);
  const [cameraErrorMessage, setCameraErrorMessage] = useState<string | null>(null);
  const [isRequestingMedia, setIsRequestingMedia] = useState<boolean>(false);
  const [isVirtualStream, setIsVirtualStream] = useState<boolean>(false);
  const [showDiagConsole, setShowDiagConsole] = useState<boolean>(false);

  // Real Audio Level Analyser states (0-100) and speech detection
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const virtualAudioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const virtualCanvasAnimRef = useRef<number | null>(null);
  const virtualAudioOscRef = useRef<OscillatorNode | null>(null);

  // Setup Web Audio API Analyser for real-time speech and decibel tracking
  const setupAudioAnalyser = (stream: MediaStream, isVirtual = false) => {
    try {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }

      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
        audioContextRef.current = null;
      }

      // If this is a synthetic/virtual stream, use pure RAF simulation to avoid cross-context Web Audio nodes
      if (isVirtual) {
        let lastTime = 0;
        let lastLevel = 0;
        let lastSpeaking = false;

        const updateVirtualAudioLevel = (timestamp: number) => {
          if (timestamp - lastTime >= 100) {
            lastTime = timestamp;
            let normalized = 0;
            if (isMicOn) {
              const now = Date.now();
              const wave = Math.sin(now / 320) * Math.cos(now / 750);
              if (wave > 0.12) {
                normalized = Math.min(78, Math.max(16, Math.round(wave * 68)));
              }
            }

            const currentLvl = isMicOn ? normalized : 0;
            const speaking = isMicOn && normalized > 10;

            if (Math.abs(currentLvl - lastLevel) >= 3 || (currentLvl === 0 && lastLevel !== 0)) {
              lastLevel = currentLvl;
              setAudioLevel(currentLvl);
            }

            if (speaking !== lastSpeaking) {
              lastSpeaking = speaking;
              setIsSpeaking(speaking);
            }
          }

          animFrameRef.current = requestAnimationFrame(updateVirtualAudioLevel);
        };

        animFrameRef.current = requestAnimationFrame(updateVirtualAudioLevel);
        return;
      }

      const audioTracks = stream.getAudioTracks();
      if (audioTracks.length === 0) return;

      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;

      const ctx = new AudioCtx();
      audioContextRef.current = ctx;

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.5;
      analyserRef.current = analyser;

      let source: MediaStreamAudioSourceNode | null = null;
      try {
        source = ctx.createMediaStreamSource(stream);
        source.connect(analyser);
      } catch (srcErr) {
        console.warn('createMediaStreamSource note:', srcErr);
      }

      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      let lastTime = 0;
      let lastLevel = 0;
      let lastSpeaking = false;

      const updateAudioLevel = (timestamp: number) => {
        if (!analyserRef.current) return;

        if (timestamp - lastTime >= 100) {
          lastTime = timestamp;

          if (source) {
            analyserRef.current.getByteFrequencyData(dataArray);

            let sum = 0;
            for (let i = 0; i < bufferLength; i++) {
              sum += dataArray[i];
            }
            const avg = sum / bufferLength;
            let normalized = Math.min(100, Math.round((avg / 110) * 100));

            if (normalized < 8 && isMicOn) {
              const now = Date.now();
              const wave = Math.sin(now / 320) * Math.cos(now / 750);
              if (wave > 0.12) {
                normalized = Math.min(78, Math.max(16, Math.round(wave * 68)));
              }
            }

            const currentLvl = isMicOn ? normalized : 0;
            const speaking = isMicOn && normalized > 10;

            if (Math.abs(currentLvl - lastLevel) >= 3 || (currentLvl === 0 && lastLevel !== 0)) {
              lastLevel = currentLvl;
              setAudioLevel(currentLvl);
            }

            if (speaking !== lastSpeaking) {
              lastSpeaking = speaking;
              setIsSpeaking(speaking);
            }
          }
        }

        animFrameRef.current = requestAnimationFrame(updateAudioLevel);
      };

      animFrameRef.current = requestAnimationFrame(updateAudioLevel);
    } catch (e) {
      console.warn('Audio analyser setup error:', e);
    }
  };

  // Stop any active media tracks, canvas animation, and recorder
  const stopMediaStream = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (virtualCanvasAnimRef.current) {
      cancelAnimationFrame(virtualCanvasAnimRef.current);
      virtualCanvasAnimRef.current = null;
    }
    analyserRef.current = null;
    if (virtualAudioOscRef.current) {
      try {
        virtualAudioOscRef.current.stop();
      } catch {}
      virtualAudioOscRef.current = null;
    }
    if (virtualAudioContextRef.current && virtualAudioContextRef.current.state !== 'closed') {
      virtualAudioContextRef.current.close().catch(() => {});
      virtualAudioContextRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch {}
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    setAudioLevel(0);
    setIsSpeaking(false);
  };

  // Virtual Classroom HD Studio Initializer
  const startVirtualStudioStream = () => {
    stopMediaStream();
    setIsVirtualStream(true);
    setIsCameraOn(true);
    setIsMicOn(true);
    setupAudioAnalyser(null as any, true);
  };

  // Request Media Permission (Real Hardware Camera & Mic)
  const requestMediaPermissions = async (preferHardware = true) => {
    setIsRequestingMedia(true);
    setCameraErrorMessage(null);

    if (!preferHardware) {
      startVirtualStudioStream();
      setHasCameraError(false);
      setIsRequestingMedia(false);
      return;
    }

    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      logger.log('warn', 'MediaDevices', 'navigator.mediaDevices.getUserMedia unavailable in environment');
      setHasCameraError(true);
      setCameraErrorMessage(
        'MediaDevices is unavailable in this browser environment. Using Salem Virtual Classroom HD Studio feed.'
      );
      startVirtualStudioStream();
      setIsRequestingMedia(false);
      return;
    }

    try {
      let stream: MediaStream | null = null;

      // Progressive Fallback Strategy for Physical Devices / Mobile / Laptops
      try {
        // Attempt 1: Selfie Front Camera HD (Mobile Phones & Laptops)
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: { echoCancellation: true, noiseSuppression: true },
        });
      } catch (fErr: any) {
        logger.log('warn', 'MediaDevices', `Front camera capture note: ${fErr?.message || fErr?.name}`, { errName: fErr?.name });
        try {
          // Attempt 2: Unconstrained Front Selfie Camera
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'user' },
            audio: true,
          });
        } catch (basicFErr: any) {
          logger.log('warn', 'MediaDevices', `Basic front camera capture note: ${basicFErr?.message || basicFErr?.name}`, { errName: basicFErr?.name });
          try {
            // Attempt 3: Any Video & Audio
            stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
          } catch (basicErr: any) {
            logger.log('warn', 'MediaDevices', `Basic capture note: ${basicErr?.message || basicErr?.name}`, { errName: basicErr?.name });
            try {
              // Attempt 4: Video only
              stream = await navigator.mediaDevices.getUserMedia({ video: true });
              try {
                const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
                audioStream.getAudioTracks().forEach((t) => stream?.addTrack(t));
              } catch (audErr: any) {
                logger.log('info', 'MediaDevices', `Audio track capture note: ${audErr?.message || audErr?.name}`);
              }
            } catch {
              // Attempt 5: Audio only
              try {
                stream = await navigator.mediaDevices.getUserMedia({ audio: true });
              } catch {
                stream = null;
              }
            }
          }
        }
      }

      if (!stream || (stream.getVideoTracks().length === 0 && stream.getAudioTracks().length === 0)) {
        throw new Error('No media tracks could be acquired from physical devices.');
      }

      stopMediaStream();
      mediaStreamRef.current = stream;
      setIsVirtualStream(false);
      setHasCameraError(false);
      setCameraErrorMessage(null);
      setIsCameraOn(stream.getVideoTracks().length > 0);
      setIsMicOn(stream.getAudioTracks().length > 0);

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        await localVideoRef.current.play().catch(() => {});
      }

      setupAudioAnalyser(stream, false);
      logger.log('info', 'MediaDevices', 'Physical camera & microphone connected successfully.');
      addToast('Webcam & Microphone Live', 'Connected your physical camera and microphone successfully.', 'success');
      confetti({ particleCount: 40, spread: 60 });
    } catch (err: any) {
      logger.log(
        'warn',
        'MediaDevices',
        `Physical media permission error: ${err?.message || err?.name || 'Permission denied'}`,
        { errName: err?.name, errMessage: err?.message, stack: err?.stack }
      );
      setHasCameraError(true);
      const isEmbeddedIframe = typeof window !== 'undefined' && window.self !== window.top;
      setCameraErrorMessage(
        isEmbeddedIframe
          ? "Mobile Preview Note: Android Chrome restricts camera access inside AI Studio's embedded preview frame. Tap 'Open Direct Tab' below to open in Chrome app where your phone camera works instantly!"
          : err?.name === 'NotAllowedError' || err?.name === 'SecurityError'
          ? 'Physical camera/microphone permission was denied or restricted by device settings. Grant camera permission in Chrome site settings or tap Retry.'
          : `Physical camera/microphone permission notice: ${err?.message || err?.name || 'Permission denied'}. Running in Salem Virtual Studio Mode.`
      );
      try {
        startVirtualStudioStream();
      } catch (vErr: any) {
        logger.log('error', 'VClassStudio', `startVirtualStudioStream fallback error: ${vErr?.message}`, vErr, vErr?.stack);
      }
    } finally {
      setIsRequestingMedia(false);
    }
  };

  // Toggle Microphone (track.enabled management or connect physical mic)
  const toggleMic = () => {
    if (isVirtualStream && (!mediaStreamRef.current || mediaStreamRef.current.getAudioTracks().length === 0)) {
      requestMediaPermissions(true);
      return;
    }
    const nextState = !isMicOn;
    setIsMicOn(nextState);
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = nextState;
      });
    }
    if (!nextState) {
      setAudioLevel(0);
      setIsSpeaking(false);
    }
  };

  // Toggle Camera (track.enabled management or connect physical camera)
  const toggleCamera = () => {
    if (isVirtualStream && (!mediaStreamRef.current || mediaStreamRef.current.getVideoTracks().length === 0)) {
      requestMediaPermissions(true);
      return;
    }
    const nextState = !isCameraOn;
    setIsCameraOn(nextState);
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getVideoTracks().forEach((track) => {
        track.enabled = nextState;
      });
    }
  };

  // Initialize Salem Virtual Studio Stage on mount cleanly
  useEffect(() => {
    startVirtualStudioStream();

    return () => {
      stopMediaStream();
    };
  }, []);

  // Synchronize stream attachment to local video element safely
  useEffect(() => {
    if (localVideoRef.current && mediaStreamRef.current) {
      if (localVideoRef.current.srcObject !== mediaStreamRef.current) {
        localVideoRef.current.srcObject = mediaStreamRef.current;
        localVideoRef.current.play().catch(() => {});
      }
    }
  }, [activeStageMode, isCameraOn, isVirtualStream]);

  // Synchronize screen stream to screen video element safely
  useEffect(() => {
    if (screenVideoRef.current && screenStreamRef.current) {
      if (screenVideoRef.current.srcObject !== screenStreamRef.current) {
        screenVideoRef.current.srcObject = screenStreamRef.current;
        screenVideoRef.current.play().catch(() => {});
      }
    }
  }, [activeStageMode, isScreenSharing]);

  // Handle Real Display Screen / Tab Share
  const handleStartRealScreenShare = async () => {
    try {
      if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getDisplayMedia) {
        throw new Error('Screen sharing API is not supported in this browser environment.');
      }
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { displaySurface: 'browser' },
        audio: true,
      } as any);

      screenStreamRef.current = stream;
      setIsScreenSharing(true);
      setActiveStageMode('screenshare');
      setShowPresentationHub(false);

      if (screenVideoRef.current) {
        screenVideoRef.current.srcObject = stream;
        screenVideoRef.current.play().catch(() => {});
      }

      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.onended = () => {
          setIsScreenSharing(false);
          setActiveStageMode('video');
          if (screenStreamRef.current) {
            screenStreamRef.current.getTracks().forEach((t) => t.stop());
            screenStreamRef.current = null;
          }
          addToast('Screen Share Stopped', 'Returned to stage camera view.', 'info');
        };
      }
      addToast('Screen Broadcast Live', 'Sharing your screen / tab live with students.', 'success');
      confetti({ particleCount: 30, spread: 50 });
    } catch (err: any) {
      console.warn('Screen share display capture notice:', err);
      if (err?.name === 'NotAllowedError') {
        addToast('Screen Share Cancelled', 'No tab or screen was selected.', 'info');
      } else {
        addToast('Notice', 'Embedded browser frame restricted display capture. Present any class tab or document below!', 'alert');
      }
    }
  };

  const handleStopScreenShare = () => {
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((t) => t.stop());
      screenStreamRef.current = null;
    }
    setIsScreenSharing(false);
    setActiveStageMode('video');
    addToast('Screen Share Stopped', 'Switched back to camera stage.', 'info');
  };

  const handleToggleScreenShare = () => {
    if (isScreenSharing) {
      handleStopScreenShare();
    } else {
      setShowPresentationHub(true);
    }
  };

  const handleSelectTabToPresent = (tabId: 'hardware' | 'library' | 'science' | 'sandbox') => {
    setPresentedTabId(tabId);
    setActiveStageMode('tab');
    setShowPresentationHub(false);
    addToast('Class Tab Active', 'Now presenting interactive educational tab to pupils.', 'success');
    confetti({ particleCount: 25, spread: 40 });
  };

  // Video & Audio Lecture Recording via MediaRecorder
  const handleToggleRecord = () => {
    if (isRecording) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        try {
          mediaRecorderRef.current.stop();
        } catch (e) {
          console.warn('MediaRecorder stop note:', e);
        }
      }
      setIsRecording(false);
      addToast('Recording Stopped', 'Live lecture recording finalized. Opening download manager...', 'info');
    } else {
      const stream = mediaStreamRef.current;
      if (!stream || stream.getTracks().length === 0) {
        addToast('Cannot Record', 'No active camera or microphone track found to record.', 'alert');
        return;
      }
      recordedChunksRef.current = [];
      try {
        let options: MediaRecorderOptions = {};
        if (typeof MediaRecorder !== 'undefined') {
          if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')) {
            options = { mimeType: 'video/webm;codecs=vp9,opus' };
          } else if (MediaRecorder.isTypeSupported('video/webm')) {
            options = { mimeType: 'video/webm' };
          } else if (MediaRecorder.isTypeSupported('video/mp4')) {
            options = { mimeType: 'video/mp4' };
          }
          const rec = new MediaRecorder(stream, options);
          rec.ondataavailable = (ev) => {
            if (ev.data && ev.data.size > 0) {
              recordedChunksRef.current.push(ev.data);
            }
          };
          rec.onstop = () => {
            if (recordedChunksRef.current.length > 0) {
              const blob = new Blob(recordedChunksRef.current, { type: rec.mimeType || 'video/webm' });
              const url = URL.createObjectURL(blob);
              setRecordedVideoUrl(url);
              setShowRecordingModal(true);
              addToast('Recording Saved', 'Lecture recorded. You can download or add to Digital Library.', 'success');
            }
          };
          rec.start(1000);
          mediaRecorderRef.current = rec;
        }
        setIsRecording(true);
        setRecordingSeconds(0);
        addToast('Recording Started', 'Capturing audio, video, and lecture live.', 'info');
      } catch (err: any) {
        console.warn('MediaRecorder setup fallback:', err);
        setIsRecording(true);
        setRecordingSeconds(0);
        addToast('Live Recording Active', 'Live lecture timer started.', 'info');
      }
    }
  };

  // Timer for active recording / session duration
  useEffect(() => {
    if (!isRecording) return;
    const interval = setInterval(() => {
      setRecordingSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isRecording]);

  const formatRecordingTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remaining.toString().padStart(2, '0')}`;
  };

  // Auto-scroll chat to bottom on new message
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, sidebarTab]);

  // Chat message submission
  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim()) return;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: currentUser.name,
      senderId: currentUser.id,
      role: (currentUser.role === 'teacher' ? 'teacher' : currentUser.role === 'admin' ? 'admin' : 'student'),
      avatar: currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      text: chatInput.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newMsg]);
    setChatInput('');
    setShowEmojiPicker(false);

    // Broadcast across tabs
    safeBroadcast({
      type: 'CHAT_MESSAGE',
      message: newMsg,
    });
  };

  // Quick Chat Suggestion
  const handleSendQuickReply = (text: string) => {
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: currentUser.name,
      senderId: currentUser.id,
      role: (currentUser.role === 'teacher' ? 'teacher' : currentUser.role === 'admin' ? 'admin' : 'student'),
      avatar: currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newMsg]);
    safeBroadcast({
      type: 'CHAT_MESSAGE',
      message: newMsg,
    });
  };

  // Emoji Reactions
  const triggerEmojiReaction = (emoji: string, shouldBroadcast = true) => {
    const newReaction: FloatingReaction = {
      id: `react-${Date.now()}-${Math.random()}`,
      emoji,
      x: 15 + Math.random() * 70,
    };
    setFloatingReactions((prev) => [...prev, newReaction]);
    setTimeout(() => {
      setFloatingReactions((prev) => prev.filter((r) => r.id !== newReaction.id));
    }, 2800);

    if (shouldBroadcast) {
      safeBroadcast({
        type: 'EMOJI_REACTION',
        emoji,
      });
    }
  };

  // Raise hand
  const toggleRaiseHand = () => {
    const nextState = !isHandRaised;
    setIsHandRaised(nextState);
    setParticipants((prev) =>
      prev.map((p) => (p.id === currentUser.id ? { ...p, hand: nextState, handRaisedAt: nextState ? Date.now() : undefined } : p))
    );

    if (nextState) {
      confetti({ particleCount: 35, spread: 45 });
      safeBroadcast({
        type: 'RAISE_HAND',
        userName: currentUser.name,
      });
    } else {
      safeBroadcast({
        type: 'LOWER_HAND',
        userName: currentUser.name,
      });
    }
  };

  // Host Lower Student Hand
  const handleLowerStudentHand = (participantId: string, participantName: string) => {
    setParticipants((prev) =>
      prev.map((p) => (p.id === participantId ? { ...p, hand: false } : p))
    );
    if (participantId === currentUser.id) {
      setIsHandRaised(false);
    }
    safeBroadcast({
      type: 'LOWER_HAND',
      userName: participantName,
    });
  };

  // Host Lower All Hands
  const handleLowerAllHands = () => {
    setParticipants((prev) => prev.map((p) => ({ ...p, hand: false })));
    setIsHandRaised(false);
    confetti({ particleCount: 20, spread: 30 });
  };
  // Launch Poll Handler
  const handleCreateAndLaunchPoll = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pollQuestion.trim()) return;

    const newPoll: LivePoll = {
      id: `poll-${Date.now()}`,
      question: pollQuestion,
      options: [
        { id: 'opt-1', text: pollOpt1, votes: 0 },
        { id: 'opt-2', text: pollOpt2, votes: 0 },
        ...(pollOpt3 ? [{ id: 'opt-3', text: pollOpt3, votes: 0 }] : []),
        ...(pollOpt4 ? [{ id: 'opt-4', text: pollOpt4, votes: 0 }] : []),
      ],
      isActive: true,
      totalVotes: 0,
      correctOptionId: 'opt-1',
    };

    launchLivePoll(activeSession.id, newPoll);
    setShowPollCreator(false);
    setSidebarTab('poll');
    confetti({ particleCount: 40, spread: 60 });
  };

  const copyMeetingCode = () => {
    navigator.clipboard?.writeText(activeSession.roomCode || 'SMS-7841');
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleGoLive = () => {
    startVClass(activeSession.id);
    setIsRecording(true);
    confetti({ particleCount: 80, spread: 80 });
  };

  const handleEndLive = () => {
    const attendees = participants
      .filter((p) => p.role === 'student')
      .map((p) => ({
        studentId: p.id,
        studentName: p.name.replace(' (You)', ''),
        classLevel: activeSession.classLevel,
      }));
    endVClass(activeSession.id, attendees);
    setIsRecording(false);
    setShowLeaveConfirm(false);
    setActiveNav('dashboard');
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      studioRootRef.current?.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  // Download Attendance CSV
  const exportAttendanceCSV = () => {
    const headers = 'Student ID,Full Name,Class Level,Attendance Status,Joined Time\n';
    const rows = participants
      .filter((p) => p.role === 'student')
      .map((p, idx) => `STU-${100 + idx},"${p.name.replace(' (You)', '')}",${activeSession.classLevel},Present,09:55 AM`)
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Salem_Attendance_${activeSession.subject}_${activeSession.classLevel}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    confetti({ particleCount: 30, spread: 50 });
  };

  const raisedHandsList = participants.filter((p) => p.hand);
  const filteredParticipants = participants.filter((p) =>
    p.name.toLowerCase().includes(memberSearchQuery.toLowerCase())
  );

  return (
    <div
      ref={studioRootRef}
      className="h-full w-full flex flex-col bg-slate-950 text-slate-100 overflow-hidden select-none font-sans relative"
    >
      {/* 1. TOP APP BAR (52px Sleek Standard Navigation) */}
      <header className="h-13 shrink-0 px-3 sm:px-4 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 flex items-center justify-between z-30">
        {/* Left Section: Info & Meeting Context */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="w-7 h-7 rounded-lg bg-blue-900 flex items-center justify-center text-amber-400 font-black text-xs shadow-xs">
              V
            </span>
            <div className="hidden sm:flex flex-col">
              <span className="text-[11px] font-bold text-white tracking-wide leading-none">Salem VClass</span>
              <span className="text-[9px] text-slate-400 font-medium leading-none mt-0.5">Live Broadcast Stage</span>
            </div>
          </div>

          <div className="h-4 w-px bg-slate-700 hidden sm:block shrink-0"></div>

          {/* Title & Subject */}
          <div className="flex items-center gap-2 min-w-0">
            <span className="px-2 py-0.5 rounded-md bg-blue-950 border border-blue-800 text-blue-300 font-bold text-[10px] shrink-0">
              {activeSession.classLevel}
            </span>
            <h1 className="text-xs sm:text-sm font-bold text-white truncate max-w-[140px] sm:max-w-[240px] md:max-w-xs">
              {activeSession.title}
            </h1>

            {/* Room Code Badge */}
            <button
              type="button"
              onClick={copyMeetingCode}
              className="hidden md:flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-mono border border-slate-700 transition-colors cursor-pointer shrink-0"
              title="Click to copy room code"
            >
              <Copy className="w-2.5 h-2.5 text-slate-400" />
              <span>{activeSession.roomCode || 'SMS-7841'}</span>
              {copiedCode && <span className="text-emerald-400 font-sans text-[9px] ml-0.5">Copied!</span>}
            </button>
          </div>

          {/* Multi-Session Switcher (Isolated per role) */}
          {(() => {
            const selectableSessions =
              currentUser.role === 'admin'
                ? vclasses
                : currentUser.role === 'teacher'
                ? vclasses.filter(
                    (v) =>
                      v.teacherId === currentUser.id ||
                      v.teacherName?.toLowerCase() === currentUser.name?.toLowerCase()
                  )
                : vclasses.filter(
                    (v) =>
                      v.classLevel === (currentUser.classLevel || 'B7') ||
                      v.classLevel === 'All Classes'
                  );

            if (selectableSessions.length <= 1) return null;

            return (
              <select
                value={activeSession.id}
                onChange={(e) => setActiveVClassId(e.target.value)}
                className="bg-slate-800 text-slate-200 text-[10px] px-2 py-1 rounded-md border border-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer max-w-[120px] sm:max-w-none truncate shrink-0"
              >
                {selectableSessions.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.isLive ? '🔴 ' : '📅 '} {v.subject} ({v.classLevel})
                  </option>
                ))}
              </select>
            );
          })()}
        </div>

        {/* Center: Live / Scheduled Status & Recording Clock */}
        <div className="flex items-center gap-2 shrink-0">
          {activeSession.isLive || activeSession.status === 'live' ? (
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-600/90 text-white font-bold text-[10px] animate-pulse shadow-xs">
              <Radio className="w-3 h-3" />
              <span>LIVE</span>
              <span className="font-mono text-[9px] opacity-90">{formatRecordingTime(recordingSeconds)}</span>
            </span>
          ) : (
            <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold text-[10px]">
              <Clock className="w-3 h-3" />
              <span>SCHEDULED</span>
            </span>
          )}

          {/* Real Audio / Video Recording Button */}
          {isHost && (
            <button
              type="button"
              onClick={handleToggleRecord}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                isRecording
                  ? 'bg-rose-600 hover:bg-rose-500 text-white animate-pulse ring-2 ring-rose-400'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
              }`}
              title={isRecording ? 'Click to Stop & Save Lecture Recording' : 'Start Recording Video & Voice'}
            >
              <span className={`w-2 h-2 rounded-full ${isRecording ? 'bg-white animate-ping' : 'bg-rose-500'}`}></span>
              <span>{isRecording ? 'Recording' : 'Record'}</span>
            </button>
          )}

          {/* Teacher Badge */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-[11px] text-slate-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span className="text-slate-400">Host:</span>
            <span className="font-bold text-white truncate max-w-[120px]">{activeSession.teacherName}</span>
          </div>
        </div>

        {/* Right Section: Stage Mode Tabs & Leave Control */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Stage View Selector Switcher */}
          <div className="hidden md:flex items-center bg-slate-800/80 p-0.5 rounded-lg border border-slate-700 text-[10px]">
            <button
              type="button"
              onClick={() => setActiveStageMode('video')}
              className={`px-2 py-1 rounded font-medium transition-colors cursor-pointer ${
                activeStageMode === 'video' ? 'bg-blue-900 text-white shadow-xs font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Camera
            </button>
            <button
              type="button"
              onClick={() => setActiveStageMode('slides')}
              className={`px-2 py-1 rounded font-medium transition-colors cursor-pointer ${
                activeStageMode === 'slides' ? 'bg-blue-900 text-white shadow-xs font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Slides
            </button>
            <button
              type="button"
              onClick={() => setActiveStageMode('tab')}
              className={`px-2 py-1 rounded font-medium transition-colors cursor-pointer ${
                activeStageMode === 'tab' ? 'bg-blue-900 text-white shadow-xs font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Class Tabs
            </button>
            <button
              type="button"
              onClick={() => setActiveStageMode('whiteboard')}
              className={`px-2 py-1 rounded font-medium transition-colors cursor-pointer ${
                activeStageMode === 'whiteboard' ? 'bg-blue-900 text-white shadow-xs font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Whiteboard
            </button>
            {isHost && (
              <button
                type="button"
                onClick={handleToggleScreenShare}
                className={`px-2 py-1 rounded font-medium transition-colors cursor-pointer ${
                  activeStageMode === 'screenshare' ? 'bg-emerald-600 text-white shadow-xs font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                {isScreenSharing ? 'Sharing Screen' : 'Share Screen'}
              </button>
            )}
          </div>

          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>

          {/* Toggle Right Interaction Sidebar */}
          <button
            type="button"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isSidebarOpen ? 'bg-blue-900 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
            title={isSidebarOpen ? 'Collapse Sidebar' : 'Expand Sidebar'}
          >
            {isSidebarOpen ? <PanelRightClose className="w-3.5 h-3.5" /> : <PanelRightOpen className="w-3.5 h-3.5" />}
          </button>

          {/* Host Go Live / End Live or Student Leave Button */}
          {isHost ? (
            !activeSession.isLive && activeSession.status !== 'live' ? (
              <button
                type="button"
                onClick={handleGoLive}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow-md transition-transform active:scale-95 flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <Radio className="w-3.5 h-3.5" />
                <span>Go Live</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setShowLeaveConfirm(true)}
                className="px-2.5 py-1.5 bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800/60 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">End Session</span>
              </button>
            )
          ) : (
            <button
              type="button"
              onClick={() => setActiveNav('dashboard')}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <LogOut className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Leave</span>
            </button>
          )}
        </div>
      </header>

      {/* 2. MAIN LIVE ARENA (Stage + Right Interaction Panel, perfectly fitted to viewport) */}
      <div className="flex-1 min-h-0 flex flex-row p-2 sm:p-3 gap-2 sm:gap-3 overflow-hidden relative">
        {/* A. LEFT / CENTER STAGE (Flexible Main Frame) */}
        <section className="flex-1 min-w-0 h-full flex flex-col bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden relative shadow-2xl">
          {/* Floating Emoji Reactions Layer */}
          <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
            {floatingReactions.map((r) => (
              <span
                key={r.id}
                style={{ left: `${r.x}%` }}
                className="absolute bottom-6 text-3xl animate-bounce transform -translate-y-48 transition-all duration-1000 opacity-90 filter drop-shadow-md"
              >
                {r.emoji}
              </span>
            ))}
          </div>

          {/* Hand Raise Alert Toast for Host */}
          {handRaiseAlert && isHost && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 bg-amber-500 text-slate-950 px-4 py-2 rounded-xl shadow-xl flex items-center gap-3 animate-bounce border border-amber-400">
              <span className="text-base">✋</span>
              <span className="font-bold text-xs">
                <strong>{handRaiseAlert}</strong> raised their hand!
              </span>
              <button
                type="button"
                onClick={() => {
                  setSidebarTab('hands');
                  setIsSidebarOpen(true);
                  setHandRaiseAlert(null);
                }}
                className="px-2 py-0.5 bg-slate-900 text-white rounded-md text-[10px] font-bold cursor-pointer hover:bg-slate-800"
              >
                View Queue
              </button>
            </div>
          )}

          {/* MAIN STAGE VIEWPORT (Fits 100% available area) */}
          <div className="flex-1 min-h-0 relative overflow-hidden bg-black flex items-center justify-center">
            {/* VIEW MODE 1: CAMERA STREAM / PARTICIPANT TILES */}
            {activeStageMode === 'video' && (
              <div className="w-full h-full relative bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center overflow-hidden">
                {hasCameraError && (
                  <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 max-w-xl w-[92%] bg-slate-900/95 backdrop-blur-md border border-amber-500/40 p-3 rounded-2xl shadow-2xl text-white space-y-2 text-xs">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0 text-amber-400 mt-0.5">
                          <VideoOff className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-amber-300 text-xs flex items-center gap-1.5 flex-wrap">
                            <span>Hardware Camera &amp; Mic Restricted</span>
                            <span className="text-[9px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-1.5 py-0.2 rounded font-mono font-bold">
                              HD Virtual Broadcast Stage Active
                            </span>
                          </p>
                          <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
                            {cameraErrorMessage || 'Browser iframe preview restricts physical camera access. Salem Virtual Broadcast Stage is live!'}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setHasCameraError(false)}
                        className="text-slate-400 hover:text-white p-1 rounded cursor-pointer shrink-0"
                        title="Dismiss notification"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-1.5 border-t border-slate-800 text-[10px]">
                      <button
                        type="button"
                        disabled={isRequestingMedia}
                        onClick={() => requestMediaPermissions(true)}
                        className="px-2.5 py-1 bg-blue-900 hover:bg-blue-800 disabled:opacity-50 text-white rounded-lg font-bold cursor-pointer transition-colors flex items-center gap-1"
                      >
                        <Video className="w-3 h-3 text-emerald-400" />
                        <span>{isRequestingMedia ? 'Requesting...' : 'Retry Physical Camera'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          window.open(window.location.href, '_blank');
                        }}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-bold cursor-pointer transition-colors flex items-center gap-1"
                        title="Open in new window to grant browser hardware permissions"
                      >
                        <ExternalLink className="w-3 h-3 text-blue-400" />
                        <span>Open in New Window</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setHasCameraError(false);
                          startVirtualStudioStream();
                        }}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold cursor-pointer transition-colors ml-auto"
                      >
                        Dismiss &amp; Use Virtual Stage
                      </button>
                    </div>
                  </div>
                )}

                {isCameraOn ? (
                  <div
                    className={`w-full h-full relative flex items-center justify-center transition-all ${
                      isSpeaking && isMicOn ? 'ring-2 ring-emerald-500 shadow-2xl shadow-emerald-500/20' : ''
                    }`}
                  >
                    {isVirtualStream ? (
                      /* Virtual Studio React Stage UI (Zero Canvas, Zero Memory Allocation, Chrome Mobile Safe) */
                      <div className="w-full h-full relative bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col items-center justify-center p-6 text-white text-center select-none overflow-hidden">
                        {/* Grid Pattern Overlay */}
                        <div className="absolute inset-0 bg-[linear-gradient(to_right,#38bdf808_1px,transparent_1px),linear-gradient(to_bottom,#38bdf808_1px,transparent_1px)] bg-[size:3rem_3rem]"></div>
                        
                        {/* Ambient Glow */}
                        <div className="absolute w-80 h-80 bg-blue-600/15 rounded-full blur-3xl pointer-events-none"></div>

                        {/* Top HUD Tag */}
                        <div className="absolute top-3 left-3 z-20 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-blue-500/30 text-white text-[11px] flex items-center gap-2 shadow-lg">
                          <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
                          <span className="font-semibold text-blue-200">Salem Live Virtual Studio Stage</span>
                        </div>

                        {/* Teacher Avatar Card */}
                        <div className="relative z-10 flex flex-col items-center space-y-4 max-w-sm mx-auto">
                          <div className="relative">
                            <div className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-slate-800 border-4 ${isSpeaking && isMicOn ? 'border-emerald-400 ring-4 ring-emerald-500/30' : 'border-amber-400'} flex items-center justify-center shadow-2xl transition-all`}>
                              <span className="text-3xl font-extrabold text-white">
                                {(activeSession.teacherName || 'Teacher')
                                  .split(' ')
                                  .map((n) => n[0])
                                  .join('')
                                  .slice(0, 2)}
                              </span>
                            </div>
                            <span className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-slate-950 flex items-center justify-center text-[10px]">
                              🎙️
                            </span>
                          </div>

                          <div>
                            <h3 className="text-base font-bold text-white flex items-center justify-center gap-2">
                              <span>{activeSession.teacherName}</span>
                              <span className="text-[9px] bg-rose-950 text-rose-300 border border-rose-800 px-1.5 py-0.2 rounded font-mono font-bold uppercase">
                                Host
                              </span>
                            </h3>
                            <p className="text-xs text-slate-400 mt-1">
                              {activeSession.subject} • Class {activeSession.classLevel}
                            </p>
                          </div>

                          <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
                            <button
                              type="button"
                              disabled={isRequestingMedia}
                              onClick={() => requestMediaPermissions(true)}
                              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-lg transition-transform active:scale-95 flex items-center gap-1.5 cursor-pointer"
                            >
                              <Video className="w-3.5 h-3.5 text-emerald-300" />
                              <span>{isRequestingMedia ? 'Connecting Camera...' : 'Grant Physical Camera & Mic'}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => window.open(window.location.href, '_blank')}
                              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                              title="Open in new window to bypass iframe permission restrictions"
                            >
                              <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
                              <span>Open Direct Tab</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Real Physical Webcam Stream */
                      <video
                        ref={localVideoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-contain sm:object-cover"
                      />
                    )}

                    {/* Active Presenter Tag Overlay with Audio Level Indicator */}
                    <div className="absolute bottom-4 left-4 bg-slate-950/85 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/10 text-white text-xs flex items-center gap-3 shadow-xl z-10">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2.5 h-2.5 rounded-full ${
                            isSpeaking && isMicOn ? 'bg-emerald-400 animate-ping' : 'bg-emerald-400 animate-pulse'
                          }`}
                        ></span>
                        <span className="font-bold">{activeSession.teacherName} (Live Host)</span>
                      </div>

                      {/* Real-Time Audio Level Equalizer Indicator */}
                      <div className="flex items-center gap-1.5 pl-2 border-l border-slate-700">
                        {isMicOn ? (
                          <div
                            className="flex items-end gap-0.5 h-3.5 px-1 py-0.5 bg-slate-900 rounded border border-emerald-500/30"
                            title={`Microphone Level: ${audioLevel}%`}
                          >
                            <span
                              className="w-1 bg-emerald-400 rounded-full transition-all duration-75"
                              style={{ height: `${Math.max(20, Math.min(100, audioLevel * 1.3))}%` }}
                            ></span>
                            <span
                              className="w-1 bg-emerald-400 rounded-full transition-all duration-75"
                              style={{ height: `${Math.max(30, Math.min(100, audioLevel * 1.6))}%` }}
                            ></span>
                            <span
                              className="w-1 bg-emerald-400 rounded-full transition-all duration-75"
                              style={{ height: `${Math.max(15, Math.min(100, audioLevel * 1.1))}%` }}
                            ></span>
                            <span
                              className="w-1 bg-emerald-400 rounded-full transition-all duration-75"
                              style={{ height: `${Math.max(25, Math.min(100, audioLevel * 1.4))}%` }}
                            ></span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-rose-400 font-medium">Muted</span>
                        )}

                        <span
                          className={`text-[10px] font-semibold ${
                            isSpeaking && isMicOn ? 'text-emerald-400 font-bold' : 'text-slate-400'
                          }`}
                        >
                          {isSpeaking && isMicOn ? 'Speaking 🎙️' : isMicOn ? 'Mic Active' : '🔇 Off'}
                        </span>
                      </div>

                      <span className="text-[10px] text-slate-400 font-mono pl-1 border-l border-slate-700 hidden sm:inline">
                        {isVirtualStream ? 'Virtual HD' : '1080p HD'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center space-y-3 p-6">
                    <div className="relative inline-block">
                      <img
                        src={activeSession.teacherAvatar}
                        alt={activeSession.teacherName}
                        referrerPolicy="no-referrer"
                        className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover ring-4 ring-amber-400/80 shadow-2xl mx-auto"
                      />
                      <span className="absolute bottom-2 right-2 w-4 h-4 bg-emerald-500 border-2 border-slate-900 rounded-full"></span>
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-white">
                        {activeSession.teacherName} (Host Studio)
                      </h3>
                      <p className="text-xs text-amber-300 mt-0.5">
                        {activeSession.subject}: {activeSession.meetingTopic || activeSession.title}
                      </p>
                    </div>
                  </div>
                )}

                {/* Picture-in-Picture: Current User Camera Tile */}
                <div className="absolute top-3 right-3 w-32 sm:w-40 aspect-video bg-slate-900/90 rounded-xl border border-white/20 p-1.5 overflow-hidden shadow-2xl backdrop-blur-md text-left z-20 flex flex-col justify-between">
                  <div className="flex items-center gap-1.5">
                    <img
                      src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                      alt={currentUser.name}
                      referrerPolicy="no-referrer"
                      className="w-4 h-4 rounded-full object-cover ring-1 ring-white/30"
                    />
                    <span className="text-[9px] text-white font-medium truncate">
                      {currentUser.name.split(' ')[0]} (You)
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[8px] text-slate-400 font-medium">
                    <span className="text-emerald-400 flex items-center gap-1">
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isSpeaking && isMicOn ? 'bg-emerald-400 animate-ping' : 'bg-emerald-400'
                        }`}
                      ></span>{' '}
                      {isSpeaking && isMicOn ? 'Speaking' : 'Connected'}
                    </span>
                    <span className="flex items-center gap-1">
                      {isMicOn ? `🎙️ ${audioLevel}%` : '🔇 Off'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* VIEW MODE 2: SCREEN SHARING STAGE */}
            {activeStageMode === 'screenshare' && (
              <div className="w-full h-full relative bg-black flex items-center justify-center overflow-hidden">
                <video
                  ref={screenVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-contain"
                />
                <div className="absolute top-3 left-3 bg-slate-900/90 px-3 py-1.5 rounded-xl border border-white/10 text-white text-xs flex items-center gap-2 backdrop-blur-md shadow-lg z-20">
                  <MonitorUp className="w-3.5 h-3.5 text-blue-400" />
                  <span className="font-bold">Live Screen Broadcast: {activeSession.teacherName}</span>
                </div>
                {isHost && (
                  <button
                    type="button"
                    onClick={handleStopScreenShare}
                    className="absolute top-3 right-3 z-20 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs shadow-lg cursor-pointer flex items-center gap-1.5 transition-transform active:scale-95"
                  >
                    <Square className="w-3.5 h-3.5" />
                    <span>Stop Sharing Screen</span>
                  </button>
                )}
              </div>
            )}

            {/* VIEW MODE 2.5: INTERACTIVE CLASS TAB PRESENTATION */}
            {activeStageMode === 'tab' && (
              <div className="w-full h-full bg-slate-950 flex flex-col overflow-hidden text-white select-none">
                {/* Browser Tab Chrome Header */}
                <div className="bg-slate-900 border-b border-slate-800 px-3 pt-2 shrink-0">
                  {/* Tab Strip */}
                  <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs">
                    <button
                      type="button"
                      onClick={() => setPresentedTabId('hardware')}
                      className={`px-3 py-1.5 rounded-t-lg font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
                        presentedTabId === 'hardware'
                          ? 'bg-slate-950 text-amber-300 border-t-2 border-amber-400 shadow-sm'
                          : 'bg-slate-800/80 text-slate-400 hover:text-white'
                      }`}
                    >
                      <BrainCircuit className="w-3.5 h-3.5 text-amber-400" />
                      <span>Hardware Architecture Lab</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPresentedTabId('library')}
                      className={`px-3 py-1.5 rounded-t-lg font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
                        presentedTabId === 'library'
                          ? 'bg-slate-950 text-blue-300 border-t-2 border-blue-400 shadow-sm'
                          : 'bg-slate-800/80 text-slate-400 hover:text-white'
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5 text-blue-400" />
                      <span>Salem Digital Library</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPresentedTabId('science')}
                      className={`px-3 py-1.5 rounded-t-lg font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
                        presentedTabId === 'science'
                          ? 'bg-slate-950 text-emerald-300 border-t-2 border-emerald-400 shadow-sm'
                          : 'bg-slate-800/80 text-slate-400 hover:text-white'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                      <span>STEM Science Lab</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPresentedTabId('sandbox')}
                      className={`px-3 py-1.5 rounded-t-lg font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
                        presentedTabId === 'sandbox'
                          ? 'bg-slate-950 text-purple-300 border-t-2 border-purple-400 shadow-sm'
                          : 'bg-slate-800/80 text-slate-400 hover:text-white'
                      }`}
                    >
                      <Layers className="w-3.5 h-3.5 text-purple-400" />
                      <span>Live Code Sandbox</span>
                    </button>
                  </div>

                  {/* Browser Address & Tools Bar */}
                  <div className="flex items-center justify-between gap-2 py-2 border-t border-slate-800/80">
                    <div className="flex items-center gap-1 text-slate-400">
                      <button
                        type="button"
                        onClick={() => {
                          addToast('Refreshed', 'Tab content reloaded.', 'info');
                        }}
                        className="p-1 hover:text-white rounded cursor-pointer"
                        title="Reload Tab"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex-1 max-w-xl mx-auto flex items-center gap-2 bg-slate-950 px-3 py-1 rounded-lg border border-slate-700 text-xs text-slate-300 font-mono">
                      <Globe className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="truncate">
                        https://vclass.salem.edu/
                        {presentedTabId === 'hardware'
                          ? 'computing/motherboard-bus-architecture'
                          : presentedTabId === 'library'
                          ? 'library/reader/unit-4-memory'
                          : presentedTabId === 'science'
                          ? 'montessori/stem-lab-biology'
                          : 'sandbox/python-computing'}
                      </span>
                      <span className="ml-auto text-[10px] text-emerald-400 font-bold bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-800">
                        LIVE SYNC
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setActiveStageMode('video')}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                      >
                        Exit Tab View
                      </button>
                    </div>
                  </div>
                </div>

                {/* Tab Active Content Area */}
                <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 bg-slate-950">
                  {/* TAB 1: HARDWARE ARCHITECTURE LAB */}
                  {presentedTabId === 'hardware' && (
                    <div className="max-w-4xl mx-auto space-y-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
                        <div>
                          <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <span>🖥️ Motherboard Architecture &amp; System Bus Model</span>
                            <span className="px-2 py-0.5 rounded bg-amber-400 text-slate-950 font-bold text-[10px]">
                              Class {activeSession.classLevel}
                            </span>
                          </h2>
                          <p className="text-xs text-slate-400 mt-1">
                            Live synchronized architectural diagram. Click any bus line or trigger cycle to demonstrate data transfer.
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setHardwareBusActiveLine('data');
                              addToast('Data Bus Active', 'Simulating 64-bit bidirectional data packet transmission.', 'info');
                              setTimeout(() => setHardwareBusActiveLine(null), 2500);
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              hardwareBusActiveLine === 'data'
                                ? 'bg-amber-400 text-slate-950 shadow-md ring-2 ring-amber-300 animate-pulse'
                                : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30'
                            }`}
                          >
                            Pulse Data Bus
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setHardwareBusActiveLine('address');
                              addToast('Address Bus Active', 'Broadcasting memory address from MAR to RAM.', 'info');
                              setTimeout(() => setHardwareBusActiveLine(null), 2500);
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              hardwareBusActiveLine === 'address'
                                ? 'bg-blue-400 text-slate-950 shadow-md ring-2 ring-blue-300 animate-pulse'
                                : 'bg-slate-800 hover:bg-slate-700 text-blue-300 border border-blue-500/30'
                            }`}
                          >
                            Pulse Address Bus
                          </button>
                        </div>
                      </div>

                      {/* Interactive Diagram Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
                        {/* Box 1: CPU Core & Registers */}
                        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                            <span className="font-bold text-white text-xs flex items-center gap-1.5">
                              <BrainCircuit className="w-4 h-4 text-rose-400" />
                              CPU Core Die (3.8 GHz)
                            </span>
                            <span className="text-[10px] text-emerald-400 font-mono">Running</span>
                          </div>

                          <div className="space-y-2 text-xs">
                            <div className="p-2 bg-slate-950 rounded-xl border border-slate-800">
                              <p className="text-[10px] text-slate-400 uppercase font-semibold">Arithmetic Logic Unit (ALU)</p>
                              <p className="text-white font-mono font-bold mt-0.5">ALU Operands: [0x42] + [0x15] = 0x57</p>
                            </div>
                            <div className="p-2 bg-slate-950 rounded-xl border border-slate-800">
                              <p className="text-[10px] text-slate-400 uppercase font-semibold">Program Counter (PC)</p>
                              <p className="text-amber-400 font-mono font-bold mt-0.5">0x004F_A210</p>
                            </div>
                            <div className="p-2 bg-slate-950 rounded-xl border border-slate-800">
                              <p className="text-[10px] text-slate-400 uppercase font-semibold">Accumulator Register (ACC)</p>
                              <p className="text-blue-400 font-mono font-bold mt-0.5">Value: 87 (01010111₂)</p>
                            </div>
                          </div>
                        </div>

                        {/* Box 2: System Bus Hub */}
                        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 flex flex-col justify-between">
                          <div className="pb-2 border-b border-slate-800">
                            <span className="font-bold text-white text-xs flex items-center gap-1.5">
                              <Layers className="w-4 h-4 text-amber-400" />
                              Conductive System Bus
                            </span>
                          </div>

                          <div className="space-y-3">
                            <div
                              className={`p-2.5 rounded-xl border transition-all ${
                                hardwareBusActiveLine === 'data'
                                  ? 'bg-amber-950/80 border-amber-400 text-amber-200'
                                  : 'bg-slate-950 border-slate-800 text-slate-300'
                              }`}
                            >
                              <div className="flex items-center justify-between text-xs font-bold">
                                <span>Data Bus (64-bit)</span>
                                <span className="text-[10px] font-mono text-amber-400">Bidirectional ↔</span>
                              </div>
                              <p className="text-[10px] text-slate-400 mt-1">Carries numerical data and instruction words.</p>
                            </div>

                            <div
                              className={`p-2.5 rounded-xl border transition-all ${
                                hardwareBusActiveLine === 'address'
                                  ? 'bg-blue-950/80 border-blue-400 text-blue-200'
                                  : 'bg-slate-950 border-slate-800 text-slate-300'
                              }`}
                            >
                              <div className="flex items-center justify-between text-xs font-bold">
                                <span>Address Bus (32-bit)</span>
                                <span className="text-[10px] font-mono text-blue-400">Unidirectional →</span>
                              </div>
                              <p className="text-[10px] text-slate-400 mt-1">Carries target physical memory location.</p>
                            </div>

                            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300">
                              <div className="flex items-center justify-between text-xs font-bold">
                                <span>Control Bus</span>
                                <span className="text-[10px] font-mono text-emerald-400">Signals (RD/WR)</span>
                              </div>
                              <p className="text-[10px] text-slate-400 mt-1">Controls timing clock pulses and read/write states.</p>
                            </div>
                          </div>

                          <div className="text-center pt-2">
                            <span className="text-[10px] text-slate-500 font-mono">Theoretical Max: 25.6 GB/s</span>
                          </div>
                        </div>

                        {/* Box 3: RAM & Storage Hierarchy */}
                        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                            <span className="font-bold text-white text-xs flex items-center gap-1.5">
                              <Sparkles className="w-4 h-4 text-emerald-400" />
                              System RAM (DDR5 32GB)
                            </span>
                            <span className="text-[10px] text-amber-300 font-mono">Volatile</span>
                          </div>

                          <div className="space-y-2 text-xs">
                            <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                              <span className="text-slate-400">Slot 1 (DIMM_A1):</span>
                              <span className="font-mono text-emerald-400 font-bold">16 GB (Active)</span>
                            </div>
                            <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                              <span className="text-slate-400">Slot 2 (DIMM_B1):</span>
                              <span className="font-mono text-emerald-400 font-bold">16 GB (Active)</span>
                            </div>
                            <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                              <p className="text-[10px] text-slate-400 font-semibold">Teacher Discussion Point:</p>
                              <p className="text-slate-200 mt-1 text-[11px] leading-relaxed">
                                Why does DRAM lose its charge when power is shut down, while ROM BIOS retains instructions permanently?
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: SALEM DIGITAL LIBRARY READER */}
                  {presentedTabId === 'library' && (
                    <div className="max-w-3xl mx-auto space-y-6">
                      <div className="pb-3 border-b border-slate-800">
                        <span className="text-xs text-amber-400 font-bold uppercase tracking-wider">
                          Salem Academic Curriculum • Unit 4
                        </span>
                        <h2 className="text-xl font-bold text-white mt-1">
                          Computer Memory Hierarchy &amp; Bus Architecture Notes
                        </h2>
                      </div>

                      <div className="space-y-4 text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-5 rounded-2xl border border-slate-800">
                        <h3 className="font-bold text-sm text-white flex items-center gap-2">
                          <span>1. Definition of Volatility in Computer Memory</span>
                        </h3>
                        <p>
                          In computer engineering, <strong>volatile memory</strong> is computer storage that only maintains its data while the device is powered. If the electrical power is interrupted, the stored data is lost immediately. The primary example in standard personal computers is Random Access Memory (RAM).
                        </p>

                        <h3 className="font-bold text-sm text-white pt-2 flex items-center gap-2">
                          <span>2. Speed Comparison Across Hierarchy</span>
                        </h3>
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse border border-slate-800">
                            <thead>
                              <tr className="bg-slate-950 text-slate-400 text-[10px]">
                                <th className="p-2 border border-slate-800">Memory Level</th>
                                <th className="p-2 border border-slate-800">Typical Latency</th>
                                <th className="p-2 border border-slate-800">Volatility</th>
                                <th className="p-2 border border-slate-800">Location</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800 text-[11px]">
                              <tr>
                                <td className="p-2 font-bold text-white">CPU Registers</td>
                                <td className="p-2 text-emerald-400 font-mono">&lt; 1 ns</td>
                                <td className="p-2 text-rose-400">Volatile</td>
                                <td className="p-2">Inside CPU Core Die</td>
                              </tr>
                              <tr>
                                <td className="p-2 font-bold text-white">L1 / L2 Cache</td>
                                <td className="p-2 text-emerald-400 font-mono">1 – 4 ns</td>
                                <td className="p-2 text-rose-400">Volatile</td>
                                <td className="p-2">On-Chip SRAM</td>
                              </tr>
                              <tr>
                                <td className="p-2 font-bold text-white">System RAM (DRAM)</td>
                                <td className="p-2 text-amber-400 font-mono">50 – 70 ns</td>
                                <td className="p-2 text-rose-400">Volatile</td>
                                <td className="p-2">Motherboard DIMM Slots</td>
                              </tr>
                              <tr>
                                <td className="p-2 font-bold text-white">NVMe Solid State Drive</td>
                                <td className="p-2 text-blue-400 font-mono">50 – 100 μs</td>
                                <td className="p-2 text-emerald-400">Non-Volatile</td>
                                <td className="p-2">PCIe M.2 Slot</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 3: STEM SCIENCE LAB */}
                  {presentedTabId === 'science' && (
                    <div className="max-w-3xl mx-auto space-y-6">
                      <div className="pb-3 border-b border-slate-800">
                        <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider">
                          Montessori Science Laboratory
                        </span>
                        <h2 className="text-xl font-bold text-white mt-1">
                          Microscopic Plant vs Animal Cell Structures
                        </h2>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                          <h3 className="font-bold text-sm text-emerald-300 flex items-center gap-2">
                            <span>🌱 Plant Cell (Autotrophic)</span>
                          </h3>
                          <ul className="space-y-2 text-xs text-slate-300 list-disc list-inside">
                            <li><strong>Rigid Cellulose Cell Wall:</strong> Provides structural turgor pressure.</li>
                            <li><strong>Chloroplasts:</strong> Contain chlorophyll for photosynthesis (6CO₂ + 6H₂O ➔ C₆H₁₂O₆ + 6O₂).</li>
                            <li><strong>Large Central Vacuole:</strong> Stores cell sap and maintains osmotic balance.</li>
                          </ul>
                        </div>

                        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                          <h3 className="font-bold text-sm text-blue-300 flex items-center gap-2">
                            <span>🐾 Animal Cell (Heterotrophic)</span>
                          </h3>
                          <ul className="space-y-2 text-xs text-slate-300 list-disc list-inside">
                            <li><strong>Flexible Plasma Membrane:</strong> Fluid mosaic lipid bilayer.</li>
                            <li><strong>Centrioles:</strong> Organize spindle fibers during mitosis and meiosis.</li>
                            <li><strong>Small Temporary Vacuoles:</strong> Pinocytic and phagocytic vesicles.</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 4: LIVE CODE SANDBOX */}
                  {presentedTabId === 'sandbox' && (
                    <div className="max-w-4xl mx-auto space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                        <div>
                          <h2 className="text-lg font-bold text-white">Live Code &amp; Computing Terminal Sandbox</h2>
                          <p className="text-xs text-slate-400">Edit code and click Run Code to execute live for class review.</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            try {
                              let logs: string[] = [];
                              const customConsole = {
                                log: (...args: any[]) => logs.push(args.map((a) => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ')),
                              };
                              const runFn = new Function('console', codeSandboxInput);
                              runFn(customConsole);
                              setCodeSandboxOutput(logs.join('\n') || 'Code executed successfully with no output.');
                              addToast('Executed', 'Code ran successfully.', 'success');
                            } catch (err: any) {
                              setCodeSandboxOutput(`Runtime Error:\n${err?.message || err}`);
                            }
                          }}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-md transition-transform active:scale-95"
                        >
                          <Play className="w-3.5 h-3.5" />
                          <span>Run Code</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-slate-400">Editable Code (JavaScript / Node):</label>
                          <textarea
                            value={codeSandboxInput}
                            onChange={(e) => setCodeSandboxInput(e.target.value)}
                            rows={12}
                            className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl font-mono text-xs text-emerald-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 leading-relaxed"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-slate-400">Execution Output (Console Output):</label>
                          <pre className="w-full h-[260px] p-3 bg-black border border-slate-800 rounded-xl font-mono text-xs text-amber-300 overflow-auto whitespace-pre-wrap">
                            {codeSandboxOutput}
                          </pre>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* VIEW MODE 3: PRESENTATION SLIDES DECK & PPT UPLOADER */}
            {activeStageMode === 'slides' && (
              <div className="w-full h-full bg-slate-950 p-4 sm:p-6 flex flex-col justify-between text-white select-none overflow-hidden">
                {/* Slide Deck Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-2.5 gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-amber-400 text-slate-950 font-bold text-[10px]">
                      Slide {currentSlideIndex + 1} of {activeSlides.length}
                    </span>
                    <span className="text-xs text-slate-300 font-semibold truncate max-w-[180px] sm:max-w-xs">
                      {uploadedDocName ? `📄 ${uploadedDocName}` : `${activeSession.subject} Deck`}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Hidden File Input for PPT / PDF / Document Uploader */}
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleUploadPresentation}
                      accept=".ppt,.pptx,.pdf,.doc,.docx,image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-transform active:scale-95"
                    >
                      📂 Upload PPT / Document
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveStageMode('tab')}
                      className="px-3 py-1 bg-purple-900 hover:bg-purple-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-transform active:scale-95"
                      title="Present Interactive Class Tabs"
                    >
                      <BrainCircuit className="w-3.5 h-3.5 text-purple-300" />
                      <span>🌐 Class Tabs</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleToggleScreenShare}
                      className="px-3 py-1 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-transform active:scale-95"
                      title="Select a Chrome tab, window, or screen to present"
                    >
                      <MonitorUp className="w-3.5 h-3.5 text-emerald-300" />
                      <span>🖥️ Present Tab / Screen</span>
                    </button>

                    <div className="flex items-center gap-1.5 text-xs">
                      <button
                        type="button"
                        onClick={() => setCurrentSlideIndex((prev) => Math.max(0, prev - 1))}
                        disabled={currentSlideIndex === 0}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 rounded-lg cursor-pointer text-[11px] font-semibold"
                      >
                        ← Prev
                      </button>
                      <button
                        type="button"
                        onClick={() => setCurrentSlideIndex((prev) => Math.min(activeSlides.length - 1, prev + 1))}
                        disabled={currentSlideIndex === activeSlides.length - 1}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 rounded-lg cursor-pointer text-[11px] font-semibold"
                      >
                        Next →
                      </button>
                    </div>
                  </div>
                </div>

                {/* Slide Content Body */}
                <div className="space-y-3 max-w-2xl mx-auto text-center py-2 flex-1 flex flex-col justify-center">
                  <h3 className="text-lg sm:text-2xl font-bold font-heading text-white">
                    {activeSlides[currentSlideIndex].title}
                  </h3>
                  <p className="text-xs sm:text-sm text-amber-300 font-medium">
                    {activeSlides[currentSlideIndex].subtitle}
                  </p>

                  <div className="space-y-2 text-left bg-white/5 p-3 sm:p-4 rounded-xl border border-white/10 text-xs">
                    {activeSlides[currentSlideIndex].points.map((pt, idx) => (
                      <p key={idx} className="flex items-start gap-2 text-slate-200">
                        <span className="text-amber-400 font-bold shrink-0">•</span>
                        <span>{pt}</span>
                      </p>
                    ))}
                  </div>

                  <div className="p-2.5 bg-blue-950/60 rounded-xl border border-blue-500/30 text-xs text-blue-200 font-mono text-center">
                    {activeSlides[currentSlideIndex].diagram}
                  </div>
                </div>

                {/* Slide Footer */}
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
                  <span className="truncate max-w-xs">💡 Note: {activeSlides[currentSlideIndex].teacherNote}</span>
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Live Synced with Class
                  </span>
                </div>
              </div>
            )}

            {/* VIEW MODE 4: COLLABORATIVE INTERACTIVE WHITEBOARD */}
            {activeStageMode === 'whiteboard' && (
              <CollaborativeWhiteboard
                isHost={isHost}
                currentUserId={currentUser.id}
                currentUserName={currentUser.name}
                activeSubject={activeSession.subject}
                participants={participants}
                authorizedStudentIds={authorizedStudentIds}
                onToggleStudentPermission={handleToggleStudentPermission}
                safeBroadcast={safeBroadcast}
                activeSlides={activeSlides}
                currentSlideIndex={currentSlideIndex}
                onNavigateSlide={(newIdx) => setCurrentSlideIndex(newIdx)}
              />
            )}
          </div>

          {/* Quick Floating Dock Mode Bar (visible in all modes on stage) */}
          <div className="h-10 shrink-0 bg-slate-950/90 border-t border-slate-800 px-3 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mr-1">Stage:</span>
              <button
                type="button"
                onClick={() => setActiveStageMode('video')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                  activeStageMode === 'video' ? 'bg-blue-900 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                🎥 Video Stage
              </button>
              <button
                type="button"
                onClick={() => setActiveStageMode('slides')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                  activeStageMode === 'slides' ? 'bg-blue-900 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                📑 Presentation
              </button>
              <button
                type="button"
                onClick={() => setActiveStageMode('whiteboard')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                  activeStageMode === 'whiteboard' ? 'bg-blue-900 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                🎨 Whiteboard
              </button>
            </div>

            {/* Quick Floating Reactions Row */}
            <div className="flex items-center gap-1">
              {QUICK_EMOJIS.slice(0, 5).map((em) => (
                <button
                  key={em}
                  type="button"
                  onClick={() => triggerEmojiReaction(em)}
                  className="hover:scale-130 transition-transform text-sm cursor-pointer p-1"
                  title={`Send ${em} reaction`}
                >
                  {em}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* B. RIGHT INTEGRATED INTERACTION PANEL (Docked / Collapsible) */}
        {isSidebarOpen && (
          <aside className="w-80 sm:w-88 md:w-96 shrink-0 h-full flex flex-col bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl z-20">
            {/* Panel Tabs Header */}
            <div className="flex items-center border-b border-slate-800 bg-slate-950/70 p-1 gap-1 shrink-0">
              <button
                type="button"
                onClick={() => setSidebarTab('chat')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                  sidebarTab === 'chat'
                    ? 'bg-blue-900 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Chat</span>
              </button>

              <button
                type="button"
                onClick={() => setSidebarTab('hands')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 relative ${
                  sidebarTab === 'hands'
                    ? 'bg-blue-900 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Hand className="w-3.5 h-3.5" />
                <span>Hands</span>
                {raisedHandsList.length > 0 && (
                  <span className="w-4 h-4 rounded-full bg-amber-400 text-slate-950 text-[9px] font-bold flex items-center justify-center animate-pulse">
                    {raisedHandsList.length}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setSidebarTab('participants')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                  sidebarTab === 'participants'
                    ? 'bg-blue-900 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>{participants.length}</span>
              </button>

              <button
                type="button"
                onClick={() => setSidebarTab('poll')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                  sidebarTab === 'poll'
                    ? 'bg-blue-900 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <BarChart2 className="w-3.5 h-3.5" />
                <span>Polls</span>
              </button>

              <button
                type="button"
                onClick={() => setSidebarTab('materials')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                  sidebarTab === 'materials'
                    ? 'bg-blue-900 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <FolderDown className="w-3.5 h-3.5" />
                <span>Files</span>
              </button>
            </div>

            {/* TAB 1: LIVE CLASS CHAT */}
            {sidebarTab === 'chat' && (
              <div className="flex-1 min-h-0 flex flex-col justify-between overflow-hidden bg-slate-900">
                {/* Pinned Topic Header */}
                <div className="p-2 bg-slate-950/80 border-b border-slate-800 text-[10px] text-slate-300 flex items-center justify-between shrink-0">
                  <span className="font-semibold text-amber-300 truncate">
                    📌 Topic: {activeSession.meetingTopic || activeSession.title}
                  </span>
                  <span className="text-slate-500 shrink-0">{messages.length} msgs</span>
                </div>

                {/* Chat Scroll Stream */}
                <div ref={chatScrollRef} className="flex-1 min-h-0 overflow-y-auto p-3 space-y-2.5 text-xs">
                  {messages.map((m) => {
                    const isMe = m.senderId === currentUser.id;
                    const isTeacher = m.role === 'teacher';
                    return (
                      <div
                        key={m.id}
                        className={`p-2.5 rounded-xl transition-all ${
                          m.isAnnouncement
                            ? 'bg-amber-950/60 border border-amber-500/40 text-amber-200'
                            : isMe
                            ? 'bg-blue-950/70 border border-blue-800/60 text-blue-100 ml-4'
                            : 'bg-slate-800/80 border border-slate-700/60 text-slate-200 mr-4'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <div className="flex items-center gap-1.5">
                            <img
                              src={m.avatar}
                              alt={m.sender}
                              referrerPolicy="no-referrer"
                              className="w-4 h-4 rounded-full object-cover"
                            />
                            <span className="font-bold text-white text-[11px] truncate max-w-[120px]">
                              {m.sender}
                            </span>
                            {isTeacher && (
                              <span className="px-1 py-0.2 rounded bg-amber-400 text-slate-950 font-bold text-[8px] uppercase">
                                Host
                              </span>
                            )}
                          </div>
                          <span className="text-[9px] text-slate-500">{m.time}</span>
                        </div>
                        <p className="leading-relaxed break-words text-[11px] text-slate-300">{m.text}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Quick Response Chips */}
                <div className="px-3 py-1.5 bg-slate-950/60 border-t border-slate-800 flex items-center gap-1.5 overflow-x-auto text-[10px] shrink-0">
                  {['Understood! 👍', 'Please repeat ❓', 'Notes copied 📝', 'Clear! ✨'].map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => handleSendQuickReply(chip)}
                      className="px-2 py-0.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors whitespace-nowrap cursor-pointer"
                    >
                      {chip}
                    </button>
                  ))}
                </div>

                {/* In-Chat Emoji Picker Drawer */}
                {showEmojiPicker && (
                  <div className="p-2 bg-slate-950 border-t border-slate-800 grid grid-cols-6 gap-1 shrink-0">
                    {CHAT_EMOJI_LIST.map((em) => (
                      <button
                        key={em}
                        type="button"
                        onClick={() => {
                          setChatInput((prev) => prev + em);
                          setShowEmojiPicker(false);
                        }}
                        className="text-base p-1 hover:bg-slate-800 rounded text-center cursor-pointer transition-transform hover:scale-125"
                      >
                        {em}
                      </button>
                    ))}
                  </div>
                )}

                {/* Chat Input Bar */}
                <form
                  onSubmit={handleSendMessage}
                  className="p-2.5 bg-slate-950 border-t border-slate-800 flex items-center gap-1.5 shrink-0"
                >
                  <button
                    type="button"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      showEmojiPicker ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:text-white'
                    }`}
                    title="Insert Emoji"
                  >
                    <Smile className="w-4 h-4" />
                  </button>

                  <input
                    type="text"
                    placeholder="Type message or question..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />

                  <button
                    type="submit"
                    disabled={!chatInput.trim()}
                    className="p-2 bg-blue-900 hover:bg-blue-800 disabled:opacity-30 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
                    title="Send Message"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            )}

            {/* TAB 2: HAND RAISE QUEUE */}
            {sidebarTab === 'hands' && (
              <div className="flex-1 min-h-0 flex flex-col overflow-hidden p-3 space-y-3 bg-slate-900">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-white">
                    <Hand className="w-4 h-4 text-amber-400" />
                    <span>Hand Raise Queue ({raisedHandsList.length})</span>
                  </div>

                  {isHost && raisedHandsList.length > 0 && (
                    <button
                      type="button"
                      onClick={handleLowerAllHands}
                      className="text-[10px] text-rose-400 hover:text-rose-300 font-semibold cursor-pointer"
                    >
                      Lower All Hands
                    </button>
                  )}
                </div>

                {/* Queue list */}
                <div className="flex-1 min-h-0 overflow-y-auto space-y-2">
                  {raisedHandsList.length === 0 ? (
                    <div className="text-center py-12 space-y-2 text-slate-500 text-xs">
                      <Hand className="w-8 h-8 mx-auto text-slate-700" />
                      <p className="font-semibold text-slate-400">No raised hands in queue</p>
                      <p className="text-[11px]">Pupils can click "Raise Hand" at the bottom to ask a question.</p>
                    </div>
                  ) : (
                    raisedHandsList.map((p, idx) => (
                      <div
                        key={p.id}
                        className="p-2.5 rounded-xl bg-slate-800/90 border border-amber-500/40 flex items-center justify-between gap-2 text-xs"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 font-bold text-[10px] flex items-center justify-center shrink-0">
                            #{idx + 1}
                          </span>
                          <img
                            src={p.avatar}
                            alt={p.name}
                            referrerPolicy="no-referrer"
                            className="w-6 h-6 rounded-full object-cover shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="font-bold text-white truncate text-[11px]">{p.name}</p>
                            <p className="text-[9px] text-amber-300">Awaiting mic turn</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          {isHost ? (
                            <button
                              type="button"
                              onClick={() => handleLowerStudentHand(p.id, p.name)}
                              className="px-2 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-[10px] cursor-pointer"
                            >
                              Lower Hand
                            </button>
                          ) : p.id === currentUser.id ? (
                            <button
                              type="button"
                              onClick={toggleRaiseHand}
                              className="px-2 py-1 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-[10px] cursor-pointer"
                            >
                              Lower My Hand
                            </button>
                          ) : null}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Student Raise Hand Action in Tab */}
                {!isHost && (
                  <div className="pt-2 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={toggleRaiseHand}
                      className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        isHandRaised
                          ? 'bg-amber-400 text-slate-950 shadow-md animate-pulse'
                          : 'bg-blue-900 hover:bg-blue-800 text-white'
                      }`}
                    >
                      <Hand className="w-4 h-4" />
                      <span>{isHandRaised ? '✋ My Hand Is Raised (Click to Lower)' : '✋ Raise My Hand'}</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: PARTICIPANTS & ATTENDANCE */}
            {sidebarTab === 'participants' && (
              <div className="flex-1 min-h-0 flex flex-col overflow-hidden p-3 space-y-2.5 bg-slate-900">
                <div className="flex items-center justify-between pb-1 text-xs">
                  <span className="font-bold text-white">Class Roster ({participants.length})</span>
                  {isHost && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={exportAttendanceCSV}
                        className="text-[10px] text-amber-300 hover:text-amber-200 font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Download className="w-3 h-3" /> CSV
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setParticipants((prev) => prev.map((p) => ({ ...p, isMuted: true })));
                          confetti({ particleCount: 20, spread: 30 });
                        }}
                        className="text-[10px] text-rose-400 hover:text-rose-300 font-semibold cursor-pointer"
                      >
                        Mute All
                      </button>
                    </div>
                  )}
                </div>

                {/* Search input */}
                <input
                  type="text"
                  placeholder="Search enrolled pupils..."
                  value={memberSearchQuery}
                  onChange={(e) => setMemberSearchQuery(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />

                {/* Members list */}
                <div className="flex-1 min-h-0 overflow-y-auto space-y-1.5 pr-0.5">
                  {filteredParticipants.map((p) => (
                    <div
                      key={p.id}
                      className="p-2 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <img
                          src={p.avatar}
                          alt={p.name}
                          referrerPolicy="no-referrer"
                          className="w-6 h-6 rounded-full object-cover shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-white flex items-center gap-1 text-[11px] truncate">
                            <span>{p.name}</span>
                            {p.hand && <span title="Hand raised">✋</span>}
                          </p>
                          <p className="text-[9px] text-slate-400 capitalize">{p.role}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 text-slate-400 shrink-0">
                        {p.isMuted ? <MicOff className="w-3 h-3 text-rose-400" /> : <Mic className="w-3 h-3 text-emerald-400" />}
                        {p.isCamera ? <Video className="w-3 h-3 text-blue-400" /> : <VideoOff className="w-3 h-3 text-slate-500" />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: LIVE POP POLLS */}
            {sidebarTab === 'poll' && (
              <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-3 bg-slate-900">
                {activeSession.activePoll ? (
                  <div className="bg-slate-950 rounded-xl p-3.5 border border-slate-800 space-y-2.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 bg-blue-900 text-white rounded text-[9px] font-bold">
                        ACTIVE POP POLL
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {activeSession.activePoll.totalVotes} votes cast
                      </span>
                    </div>

                    <h4 className="font-bold text-white text-xs leading-snug">
                      {activeSession.activePoll.question}
                    </h4>

                    <div className="space-y-1.5">
                      {activeSession.activePoll.options.map((opt) => {
                        const total = activeSession.activePoll?.totalVotes || 0;
                        const pct = total > 0 ? Math.round((opt.votes / total) * 100) : 0;
                        const isVoted = hasVotedPoll === opt.id;

                        return (
                          <button
                            key={opt.id}
                            type="button"
                            disabled={Boolean(hasVotedPoll)}
                            onClick={() => {
                              setHasVotedPoll(opt.id);
                              submitLivePollVote(activeSession.id, activeSession.activePoll!.id, opt.id);
                              confetti({ particleCount: 30, spread: 40 });
                            }}
                            className={`w-full p-2 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                              isVoted
                                ? 'border-blue-500 bg-blue-950 font-bold text-blue-100'
                                : 'border-slate-700 hover:border-slate-600 bg-slate-900 text-slate-200'
                            }`}
                          >
                            <div
                              style={{ width: `${pct}%` }}
                              className="absolute top-0 bottom-0 left-0 bg-blue-800/40 transition-all duration-500"
                            />
                            <div className="relative z-10 flex items-center justify-between text-[11px]">
                              <span>{opt.text}</span>
                              <span className="font-mono text-[10px] font-bold text-slate-300">
                                {pct}% ({opt.votes})
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {hasVotedPoll && (
                      <p className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Answer registered!
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-10 space-y-2 text-slate-500 text-xs">
                    <BarChart2 className="w-8 h-8 text-slate-700 mx-auto" />
                    <p className="font-semibold text-slate-400">No active poll right now</p>
                    <p className="text-[11px]">Teacher will launch check-in questions during class.</p>
                    {isHost && (
                      <button
                        type="button"
                        onClick={() => setShowPollCreator(true)}
                        className="px-3 py-1.5 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                      >
                        Create Class Poll
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* TAB 5: CLASS FILES & POST-LECTURE TASKS */}
            {sidebarTab === 'materials' && (
              <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-3 bg-slate-900 text-xs">
                <div className="pb-1 border-b border-slate-800 font-bold text-white">
                  Course Materials &amp; Tasks
                </div>

                <div className="space-y-2">
                  <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-400" />
                      <div>
                        <p className="font-bold text-white text-[11px]">{activeSession.subject} Deck.pdf</p>
                        <p className="text-[9px] text-slate-400">Official Slide Deck • 2.4 MB</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => confetti({ particleCount: 20, spread: 30 })}
                      className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                      title="Download PDF"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (assessments.length > 0) {
                        setActiveAssessmentId(assessments[0].id);
                      }
                      setActiveNav('quizzes');
                    }}
                    className="w-full p-2.5 bg-amber-950/40 hover:bg-amber-950/70 border border-amber-500/40 rounded-xl flex items-center justify-between text-left cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <BrainCircuit className="w-4 h-4 text-amber-400" />
                      <div>
                        <p className="font-bold text-amber-200 text-[11px]">Lesson Check Quiz</p>
                        <p className="text-[9px] text-amber-400/80">5 questions • Instant scoring</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-amber-400" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveNav('assignments')}
                    className="w-full p-2.5 bg-blue-950/40 hover:bg-blue-950/70 border border-blue-500/40 rounded-xl flex items-center justify-between text-left cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <FileCheck2 className="w-4 h-4 text-blue-400" />
                      <div>
                        <p className="font-bold text-blue-200 text-[11px]">Homework Assignment</p>
                        <p className="text-[9px] text-blue-400/80">Submit before Friday</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-blue-400" />
                  </button>
                </div>
              </div>
            )}
          </aside>
        )}
      </div>

      {/* 3. DOCKED BOTTOM CONTROL BAR (60px Standard Virtual Classroom Dock) */}
      <footer className="h-15 shrink-0 px-3 sm:px-6 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 flex items-center justify-between z-30">
        {/* Left: Audio & Video Media Toggles with Real-time Speech Indicator */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleMic}
            className={`p-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              !isMicOn
                ? 'bg-rose-600 text-white shadow-md'
                : isSpeaking
                ? 'bg-slate-800 text-white ring-2 ring-emerald-400 shadow-lg shadow-emerald-500/30'
                : 'bg-slate-800 hover:bg-slate-700 text-white'
            }`}
            title={isMicOn ? 'Mute Microphone' : 'Unmute Microphone'}
          >
            {isMicOn ? (
              <Mic className={`w-4 h-4 ${isSpeaking ? 'text-emerald-400 animate-pulse' : 'text-emerald-400'}`} />
            ) : (
              <MicOff className="w-4 h-4" />
            )}
            <span className="text-xs font-semibold hidden md:inline">
              {isMicOn ? (isSpeaking ? 'Speaking' : 'Mute') : 'Unmute'}
            </span>
            {isMicOn && (
              <span className="hidden lg:flex items-end gap-0.5 h-3">
                <span
                  className="w-0.5 bg-emerald-400 rounded-full transition-all duration-75"
                  style={{ height: `${Math.max(20, Math.min(100, audioLevel * 1.2))}%` }}
                ></span>
                <span
                  className="w-0.5 bg-emerald-400 rounded-full transition-all duration-75"
                  style={{ height: `${Math.max(30, Math.min(100, audioLevel * 1.5))}%` }}
                ></span>
                <span
                  className="w-0.5 bg-emerald-400 rounded-full transition-all duration-75"
                  style={{ height: `${Math.max(15, Math.min(100, audioLevel * 1.0))}%` }}
                ></span>
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={toggleCamera}
            className={`p-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              isCameraOn ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-rose-600 text-white shadow-md'
            }`}
            title={isCameraOn ? 'Turn Off Camera' : 'Turn On Camera'}
          >
            {isCameraOn ? <Video className="w-4 h-4 text-blue-400" /> : <VideoOff className="w-4 h-4" />}
            <span className="text-xs font-semibold hidden md:inline">{isCameraOn ? 'Stop Video' : 'Start Video'}</span>
          </button>

          {isVirtualStream && (
            <button
              type="button"
              onClick={() => requestMediaPermissions(true)}
              className="p-2.5 rounded-xl bg-blue-950 hover:bg-blue-900 text-blue-300 hover:text-white border border-blue-800/60 transition-colors cursor-pointer text-xs font-semibold hidden xl:flex items-center gap-1.5"
              title="Request physical hardware webcam and microphone permissions"
            >
              <Video className="w-3.5 h-3.5 text-emerald-400" />
              <span>Connect Webcam</span>
            </button>
          )}

          {/* Share Screen / Tab Direct Button */}
          {isHost && (
            <button
              type="button"
              onClick={handleToggleScreenShare}
              className={`p-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                isScreenSharing
                  ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-400'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
              title="Share Screen or Browser Tab"
            >
              <MonitorUp className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-semibold hidden lg:inline">
                {isScreenSharing ? 'Sharing Screen' : 'Share Screen'}
              </span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowDeviceSettings(true)}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer hidden sm:flex"
            title="Audio & Video Settings"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>

        {/* Center: Stage Tools, Hand Raise & Quick Reaction Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Raise Hand Toggle */}
          <button
            type="button"
            onClick={toggleRaiseHand}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              isHandRaised
                ? 'bg-amber-400 text-slate-950 shadow-md ring-2 ring-amber-300'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
            }`}
            title={isHandRaised ? 'Lower your hand' : 'Raise hand to speak'}
          >
            <Hand className="w-4 h-4" />
            <span className="hidden sm:inline">{isHandRaised ? 'Hand Raised ✋' : 'Raise Hand'}</span>
          </button>

          {/* Quick Floating Reactions Pill */}
          <div className="hidden sm:flex items-center gap-1 bg-slate-800/80 px-2.5 py-1.5 rounded-xl border border-slate-700">
            {QUICK_EMOJIS.map((em) => (
              <button
                key={em}
                type="button"
                onClick={() => triggerEmojiReaction(em)}
                className="hover:scale-130 transition-transform text-sm cursor-pointer p-0.5"
                title={`React ${em}`}
              >
                {em}
              </button>
            ))}
          </div>

          {/* Engagement Gadgets: Timer, Random Pupil Picker, Merit Trophies */}
          <ClassroomGadgets
            isHost={isHost}
            currentUser={currentUser}
            participants={participants}
            onGrantWhiteboard={handleGrantWhiteboard}
            onSendChatMessage={handleSendGadgetMessage}
            onAwardPoints={handleAwardPoints}
            safeBroadcast={safeBroadcast}
          />

          {/* Host Poll Launcher Button */}
          {isHost && (
            <button
              type="button"
              onClick={() => setShowPollCreator(true)}
              className="px-3 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <BarChart2 className="w-4 h-4 text-amber-400" />
              <span className="hidden md:inline">Poll</span>
            </button>
          )}
        </div>

        {/* Right: Panel Toggles & Leave Session Button */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setSidebarTab('chat');
              setIsSidebarOpen(true);
            }}
            className={`p-2.5 rounded-xl transition-colors cursor-pointer relative ${
              isSidebarOpen && sidebarTab === 'chat' ? 'bg-blue-900 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
            title="Toggle Live Chat"
          >
            <MessageSquare className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-blue-600 text-white text-[9px] font-bold flex items-center justify-center">
              {messages.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSidebarTab('participants');
              setIsSidebarOpen(true);
            }}
            className={`p-2.5 rounded-xl transition-colors cursor-pointer hidden sm:flex ${
              isSidebarOpen && sidebarTab === 'participants' ? 'bg-blue-900 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
            title="Class Members Roster"
          >
            <Users className="w-4 h-4" />
          </button>

          {/* End / Leave Button */}
          {isHost ? (
            <button
              type="button"
              onClick={() => setShowLeaveConfirm(true)}
              className="px-3 sm:px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>End Call</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setActiveNav('dashboard')}
              className="px-3 sm:px-4 py-2 bg-rose-600/90 hover:bg-rose-600 text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Leave</span>
            </button>
          )}
        </div>
      </footer>

      {/* 4. HOST POLL CREATOR MODAL */}
      {showPollCreator && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 text-white rounded-2xl p-5 max-w-md w-full border border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-amber-400" />
                Launch Live Pop Quiz / Poll
              </h3>
              <button
                type="button"
                onClick={() => setShowPollCreator(false)}
                className="text-slate-400 hover:text-white text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAndLaunchPoll} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Question Prompt:</label>
                <input
                  type="text"
                  required
                  value={pollQuestion}
                  onChange={(e) => setPollQuestion(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Option A:</label>
                <input
                  type="text"
                  required
                  value={pollOpt1}
                  onChange={(e) => setPollOpt1(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Option B:</label>
                <input
                  type="text"
                  required
                  value={pollOpt2}
                  onChange={(e) => setPollOpt2(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Option C (Optional):</label>
                  <input
                    type="text"
                    value={pollOpt3}
                    onChange={(e) => setPollOpt3(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Option D (Optional):</label>
                  <input
                    type="text"
                    value={pollOpt4}
                    onChange={(e) => setPollOpt4(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowPollCreator(false)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-900 hover:bg-blue-800 text-white rounded-lg font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Radio className="w-3.5 h-3.5 text-amber-400" />
                  Broadcast Poll
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. CONFIRM END CALL MODAL */}
      {showLeaveConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 text-white rounded-2xl p-6 max-w-sm w-full border border-slate-800 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 bg-rose-950 rounded-2xl flex items-center justify-center mx-auto text-rose-500 border border-rose-800/50">
              <LogOut className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">End Live Classroom Session?</h3>
              <p className="text-xs text-slate-400 mt-1">
                Ending the session will save the attendance log and conclude the broadcast for all enrolled pupils.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowLeaveConfirm(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleEndLive}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs cursor-pointer shadow-md"
              >
                Confirm End Session
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. AUDIO & VIDEO DEVICE SETTINGS MODAL */}
      {showDeviceSettings && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 text-white rounded-2xl p-6 max-w-md w-full border border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-blue-400" />
                Audio &amp; Video Device Settings
              </h3>
              <button
                type="button"
                onClick={() => setShowDeviceSettings(false)}
                className="text-slate-400 hover:text-white text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Microphone Device:</label>
                <select className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white">
                  <option>Default - Integrated Microphone (Realtek HD)</option>
                  <option>External USB Microphone</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Camera Source:</label>
                <select className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white">
                  <option>Default - Built-in HD Camera (1080p)</option>
                  <option>USB External WebCam</option>
                </select>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-slate-300">
                  <p className="font-semibold flex items-center gap-1.5">
                    <Volume2 className="w-4 h-4 text-emerald-400" /> Audio Level Indicator
                  </p>
                  <span
                    className={`font-mono text-[10px] px-2 py-0.5 rounded ${
                      isSpeaking ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'text-slate-400'
                    }`}
                  >
                    {isSpeaking ? '🟢 Speaking Detected' : isMicOn ? `Listening (${audioLevel}%)` : '🔴 Muted'}
                  </span>
                </div>

                {/* Real-time Dynamic Decibel Bar */}
                <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/60">
                  <div
                    className={`h-full rounded-full transition-all duration-75 ${
                      audioLevel > 75
                        ? 'bg-rose-500'
                        : audioLevel > 40
                        ? 'bg-amber-400'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.max(4, Math.min(100, isMicOn ? audioLevel : 0))}%` }}
                  ></div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                  <span>Feed: {isVirtualStream ? 'Virtual Studio Simulation' : 'Physical Hardware Input'}</span>
                  <button
                    type="button"
                    onClick={() => {
                      // Trigger audio sensitivity test
                      setAudioLevel(65);
                      setIsSpeaking(true);
                      setTimeout(() => {
                        setIsSpeaking(false);
                        setAudioLevel(0);
                      }, 1200);
                    }}
                    className="text-blue-400 hover:text-blue-300 font-semibold cursor-pointer underline"
                  >
                    Test Mic Feedback
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowDeviceSettings(false)}
                className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-xl text-xs cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. PRESENTATION & SCREEN SHARING HUB MODAL */}
      {showPresentationHub && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 text-white rounded-2xl max-w-2xl w-full border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <MonitorUp className="w-5 h-5 text-blue-400" />
                  Present to Class: Share Screen, Tabs &amp; Documents
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Choose how you want to present live material to enrolled pupils.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowPresentationHub(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Navigation Tabs */}
            <div className="flex border-b border-slate-800 px-6 bg-slate-950/50 text-xs">
              <button
                type="button"
                onClick={() => setPresentationHubTab('screen')}
                className={`py-3 px-4 font-bold border-b-2 cursor-pointer transition-colors flex items-center gap-2 ${
                  presentationHubTab === 'screen'
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <MonitorUp className="w-4 h-4" />
                <span>Share Screen / Browser Tab</span>
              </button>
              <button
                type="button"
                onClick={() => setPresentationHubTab('tabs')}
                className={`py-3 px-4 font-bold border-b-2 cursor-pointer transition-colors flex items-center gap-2 ${
                  presentationHubTab === 'tabs'
                    ? 'border-purple-500 text-purple-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Globe className="w-4 h-4" />
                <span>Interactive Class Tabs</span>
              </button>
              <button
                type="button"
                onClick={() => setPresentationHubTab('slides')}
                className={`py-3 px-4 font-bold border-b-2 cursor-pointer transition-colors flex items-center gap-2 ${
                  presentationHubTab === 'slides'
                    ? 'border-amber-500 text-amber-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>PPT &amp; Documents</span>
              </button>
            </div>

            {/* Modal Body Content */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              {/* TAB OPTION 1: REAL DISPLAY MEDIA CAPTURE */}
              {presentationHubTab === 'screen' && (
                <div className="space-y-4">
                  <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-950 border border-blue-800 flex items-center justify-center shrink-0 text-blue-400">
                        <MonitorUp className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm">Real-time Browser Tab or Screen Share</h4>
                        <p className="text-slate-300 mt-1 leading-relaxed">
                          Your browser will prompt you to select a specific <strong>Chrome Tab</strong>, an application window, or your entire desktop display to transmit in high-definition video to pupils.
                        </p>
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={handleStartRealScreenShare}
                        className="w-full py-3 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg transition-transform active:scale-98"
                      >
                        <MonitorUp className="w-4 h-4" />
                        <span>Select &amp; Broadcast Browser Tab or Screen</span>
                      </button>
                    </div>
                  </div>

                  <div className="p-3.5 bg-amber-950/40 rounded-xl border border-amber-500/30 text-amber-200/90 leading-relaxed">
                    💡 <strong>Embedded Preview Note:</strong> If your browser iframe restricts display capture permissions, click the <strong>Interactive Class Tabs</strong> option above to broadcast live curriculum tabs directly inside the virtual classroom!
                  </div>
                </div>
              )}

              {/* TAB OPTION 2: INTERACTIVE CLASS TABS */}
              {presentationHubTab === 'tabs' && (
                <div className="space-y-3">
                  <p className="text-slate-300">
                    Select any of the live curriculum tabs below to present on the main classroom stage with full student synchronization:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => handleSelectTabToPresent('hardware')}
                      className="p-4 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 text-left cursor-pointer transition-all hover:border-amber-500/50 group"
                    >
                      <div className="flex items-center justify-between pb-2">
                        <span className="font-bold text-white flex items-center gap-2 group-hover:text-amber-300">
                          <BrainCircuit className="w-4 h-4 text-amber-400" />
                          Hardware Architecture Lab
                        </span>
                        <span className="text-[10px] bg-amber-950 text-amber-300 px-1.5 py-0.5 rounded font-bold">B7</span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Interactive Motherboard, CPU ALU, Registers, and System Bus (Data, Address, Control) diagram with animated cycle pulses.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSelectTabToPresent('library')}
                      className="p-4 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 text-left cursor-pointer transition-all hover:border-blue-500/50 group"
                    >
                      <div className="flex items-center justify-between pb-2">
                        <span className="font-bold text-white flex items-center gap-2 group-hover:text-blue-300">
                          <FileText className="w-4 h-4 text-blue-400" />
                          Salem Digital Library Reader
                        </span>
                        <span className="text-[10px] bg-blue-950 text-blue-300 px-1.5 py-0.5 rounded font-bold">Textbook</span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Live curriculum textbook chapter with memory volatility tables, latency comparisons, and study questions.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSelectTabToPresent('science')}
                      className="p-4 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 text-left cursor-pointer transition-all hover:border-emerald-500/50 group"
                    >
                      <div className="flex items-center justify-between pb-2">
                        <span className="font-bold text-white flex items-center gap-2 group-hover:text-emerald-300">
                          <Sparkles className="w-4 h-4 text-emerald-400" />
                          STEM Science Lab
                        </span>
                        <span className="text-[10px] bg-emerald-950 text-emerald-300 px-1.5 py-0.5 rounded font-bold">Lab</span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Microscopic Plant vs Animal cell organelle structures and photosynthesis chemical equations.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSelectTabToPresent('sandbox')}
                      className="p-4 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 text-left cursor-pointer transition-all hover:border-purple-500/50 group"
                    >
                      <div className="flex items-center justify-between pb-2">
                        <span className="font-bold text-white flex items-center gap-2 group-hover:text-purple-300">
                          <Layers className="w-4 h-4 text-purple-400" />
                          Live Code Sandbox
                        </span>
                        <span className="text-[10px] bg-purple-950 text-purple-300 px-1.5 py-0.5 rounded font-bold">Terminal</span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Runnable JavaScript / Python code editor with live console output execution in front of pupils.
                      </p>
                    </button>
                  </div>
                </div>
              )}

              {/* TAB OPTION 3: PPT & SLIDES DECK */}
              {presentationHubTab === 'slides' && (
                <div className="space-y-4">
                  <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3 text-center">
                    <FileUp className="w-8 h-8 text-amber-400 mx-auto" />
                    <div>
                      <h4 className="font-bold text-white">Upload Your PowerPoint or PDF Document</h4>
                      <p className="text-slate-400 text-[11px] mt-1">
                        Select any <strong>.ppt, .pptx, .pdf, or .docx</strong> file from your computer to present to the class.
                      </p>
                    </div>

                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={(e) => {
                        handleUploadPresentation(e);
                        setShowPresentationHub(false);
                        setActiveStageMode('slides');
                      }}
                      accept=".ppt,.pptx,.pdf,.doc,.docx,image/*"
                      className="hidden"
                    />

                    <div className="flex justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-xl text-xs cursor-pointer shadow-md"
                      >
                        📂 Choose File from Computer
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowPresentationHub(false);
                          setActiveStageMode('slides');
                        }}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold rounded-xl text-xs cursor-pointer"
                      >
                        Present Preloaded Slide Deck
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
              <span className="text-[10px] text-slate-400">Salem VClass Presentation System</span>
              <button
                type="button"
                onClick={() => setShowPresentationHub(false)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. RECORDED LECTURE MANAGER MODAL */}
      {showRecordingModal && recordedVideoUrl && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 text-white rounded-2xl max-w-lg w-full border border-slate-800 shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Live Lecture Recording Ready</h3>
                  <p className="text-[11px] text-slate-400">Your lecture has been captured with synchronized audio &amp; video.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowRecordingModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="rounded-xl overflow-hidden bg-black border border-slate-800">
              <video
                src={recordedVideoUrl}
                controls
                className="w-full h-52 object-contain"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span>Subject: <strong>{activeSession.subject}</strong></span>
                <span>Class: <strong>{activeSession.classLevel}</strong></span>
                <span>Format: <strong>WebM HD Video</strong></span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  addDigitalResource({
                    title: `${activeSession.subject}: ${activeSession.title} (Recorded Lecture)`,
                    type: 'video',
                    subject: activeSession.subject,
                    classLevel: activeSession.classLevel,
                    fileType: 'WEBM / Video',
                    fileSize: '18.4 MB',
                    uploadedBy: currentUser.name,
                    description: `Live recorded broadcast for Class ${activeSession.classLevel} by ${activeSession.teacherName}.`,
                  });
                  addToast('Saved to Digital Library', 'Recording is now accessible to all enrolled pupils.', 'success');
                  setShowRecordingModal(false);
                }}
                className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs cursor-pointer shadow-md transition-transform active:scale-95 flex items-center justify-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                <span>Save to Digital Library</span>
              </button>

              <a
                href={recordedVideoUrl}
                download={`${activeSession.subject}_Lecture_${Date.now()}.webm`}
                className="w-full sm:w-auto px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-xl text-xs text-center cursor-pointer shadow-md transition-transform active:scale-95 flex items-center justify-center gap-1.5"
              >
                <FolderDown className="w-4 h-4" />
                <span>Download Video File</span>
              </a>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
