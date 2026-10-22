import React, { useState, useRef, useEffect } from 'react';
import {
  PenTool,
  Sparkles,
  Eraser,
  Square,
  Circle,
  Minus,
  ArrowRight,
  Type,
  Undo2,
  Trash2,
  Download,
  Users,
  Lock,
  Unlock,
  Layers,
  ChevronLeft,
  ChevronRight,
  Presentation,
  Check,
  ShieldAlert,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { SlideItem } from '../../types';

export type WhiteboardTool =
  | 'pen'
  | 'highlighter'
  | 'eraser'
  | 'rect'
  | 'circle'
  | 'line'
  | 'arrow'
  | 'text';

interface CollaborativeWhiteboardProps {
  isHost: boolean;
  currentUserId: string;
  currentUserName: string;
  activeSubject: string;
  participants: { id: string; name: string; role: string; avatar: string }[];
  authorizedStudentIds: string[];
  onToggleStudentPermission?: (studentId: string) => void;
  safeBroadcast?: (msg: any) => void;
  // Slide overlay support
  activeSlides?: {
    title: string;
    subtitle?: string;
    points?: string[];
    diagram?: string;
    teacherNote?: string;
  }[];
  currentSlideIndex?: number;
  onNavigateSlide?: (newIndex: number) => void;
}

export const CollaborativeWhiteboard: React.FC<CollaborativeWhiteboardProps> = ({
  isHost,
  currentUserId,
  currentUserName,
  activeSubject,
  participants,
  authorizedStudentIds,
  onToggleStudentPermission,
  safeBroadcast,
  activeSlides,
  currentSlideIndex = 0,
  onNavigateSlide,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);

  // Active Drawing Tool & Properties
  const [tool, setTool] = useState<WhiteboardTool>('pen');
  const [color, setColor] = useState<string>('#38BDF8');
  const [size, setSize] = useState<number>(3);
  const [gridMode, setGridMode] = useState<'blank' | 'dots' | 'lines'>('blank');

  // Permission Mode (Teacher Master Control): 'teacher_only' | 'delegated' | 'all'
  const [permissionMode, setPermissionMode] = useState<'teacher_only' | 'delegated' | 'all'>('delegated');
  const [showPermissionMenu, setShowPermissionMenu] = useState<boolean>(false);

  // Slide Annotation Overlay Mode
  const [isAnnotatingSlide, setIsAnnotatingSlide] = useState<boolean>(false);

  // Shape drag tracking
  const startPosRef = useRef<{ x: number; y: number } | null>(null);
  const snapshotRef = useRef<ImageData | null>(null);

  // Undo History Stack
  const historyRef = useRef<ImageData[]>([]);

  // Text tool state
  const [textInputPos, setTextInputPos] = useState<{ x: number; y: number } | null>(null);
  const [textInputValue, setTextInputValue] = useState<string>('');

  // Check if current user has drawing permission
  const canDraw =
    isHost ||
    permissionMode === 'all' ||
    (permissionMode === 'delegated' && authorizedStudentIds.includes(currentUserId));

  // Save state to undo history
  const saveUndoState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    try {
      const state = ctx.getImageData(0, 0, canvas.width, canvas.height);
      historyRef.current.push(state);
      if (historyRef.current.length > 20) {
        historyRef.current.shift();
      }
    } catch {
      // Fallback
    }
  };

  const handleUndo = () => {
    if (!canDraw || historyRef.current.length === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const previousState = historyRef.current.pop();
    if (previousState) {
      ctx.putImageData(previousState, 0, 0);
      if (safeBroadcast) {
        safeBroadcast({ type: 'WHITEBOARD_UNDO' });
      }
    }
  };

  // Coordinate normalizer with touch support
  const getCoordinates = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX =
      'touches' in e && e.touches.length > 0
        ? e.touches[0].clientX
        : 'clientX' in e
        ? (e as React.MouseEvent).clientX
        : 0;
    const clientY =
      'touches' in e && e.touches.length > 0
        ? e.touches[0].clientY
        : 'clientY' in e
        ? (e as React.MouseEvent).clientY
        : 0;
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const handleStartDraw = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    if (!canDraw) return;
    if (e.cancelable) e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);

    // If using text tool, open text input at coords
    if (tool === 'text') {
      setTextInputPos({ x, y });
      return;
    }

    saveUndoState();
    setIsDrawing(true);
    startPosRef.current = { x, y };

    if (['rect', 'circle', 'line', 'arrow'].includes(tool)) {
      snapshotRef.current = ctx.getImageData(0, 0, canvas.width, canvas.height);
    } else {
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  };

  const handleDraw = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    if (!isDrawing || !canDraw) return;
    if (e.cancelable) e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    const startPos = startPosRef.current || { x, y };

    ctx.strokeStyle = tool === 'eraser' ? (isAnnotatingSlide ? 'rgba(0,0,0,1)' : '#020617') : color;
    ctx.lineWidth = tool === 'eraser' ? size * 7 : tool === 'highlighter' ? size * 5 : size * 2;
    ctx.globalAlpha = tool === 'highlighter' ? 0.35 : 1.0;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (tool === 'eraser' && isAnnotatingSlide) {
      ctx.globalCompositeOperation = 'destination-out';
    } else {
      ctx.globalCompositeOperation = 'source-over';
    }

    if (['rect', 'circle', 'line', 'arrow'].includes(tool)) {
      if (snapshotRef.current) {
        ctx.putImageData(snapshotRef.current, 0, 0);
      }
      ctx.beginPath();
      if (tool === 'rect') {
        ctx.strokeRect(startPos.x, startPos.y, x - startPos.x, y - startPos.y);
      } else if (tool === 'circle') {
        const radius = Math.sqrt(Math.pow(x - startPos.x, 2) + Math.pow(y - startPos.y, 2));
        ctx.arc(startPos.x, startPos.y, radius, 0, 2 * Math.PI);
        ctx.stroke();
      } else if (tool === 'line') {
        ctx.moveTo(startPos.x, startPos.y);
        ctx.lineTo(x, y);
        ctx.stroke();
      } else if (tool === 'arrow') {
        // Line with arrow head
        ctx.moveTo(startPos.x, startPos.y);
        ctx.lineTo(x, y);
        ctx.stroke();

        const angle = Math.atan2(y - startPos.y, x - startPos.x);
        const headLength = 15;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(
          x - headLength * Math.cos(angle - Math.PI / 6),
          y - headLength * Math.sin(angle - Math.PI / 6)
        );
        ctx.moveTo(x, y);
        ctx.lineTo(
          x - headLength * Math.cos(angle + Math.PI / 6),
          y - headLength * Math.sin(angle + Math.PI / 6)
        );
        ctx.stroke();
      }
    } else {
      // Freehand pen, highlighter, or eraser
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const handleEndDraw = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    startPosRef.current = null;
    snapshotRef.current = null;

    if (safeBroadcast && canvasRef.current) {
      safeBroadcast({
        type: 'WHITEBOARD_STROKE_FINISH',
      });
    }
  };

  const handleCommitText = () => {
    if (!textInputPos || !textInputValue.trim()) {
      setTextInputPos(null);
      setTextInputValue('');
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    saveUndoState();
    ctx.font = 'bold 20px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = color;
    ctx.fillText(textInputValue, textInputPos.x, textInputPos.y);

    setTextInputPos(null);
    setTextInputValue('');
  };

  const clearCanvas = () => {
    if (!canDraw) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    saveUndoState();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (safeBroadcast) {
      safeBroadcast({ type: 'WHITEBOARD_CLEAR' });
    }
  };

  const handleDownloadSnapshot = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Create export canvas with scholastic banner
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = canvas.width;
    exportCanvas.height = canvas.height + 40;
    const expCtx = exportCanvas.getContext('2d');
    if (!expCtx) return;

    // Background
    expCtx.fillStyle = '#020617';
    expCtx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

    // Draw main board
    expCtx.drawImage(canvas, 0, 0);

    // Scholastic Watermark Bar
    expCtx.fillStyle = '#0F172A';
    expCtx.fillRect(0, canvas.height, exportCanvas.width, 40);
    expCtx.fillStyle = '#94A3B8';
    expCtx.font = '12px "Plus Jakarta Sans", sans-serif';
    expCtx.fillText(
      `Salem Montessori VClass • ${activeSubject} Whiteboard Notes • Generated on ${new Date().toLocaleDateString()}`,
      16,
      canvas.height + 24
    );

    const link = document.createElement('a');
    link.download = `Salem-Montessori-${activeSubject}-Board.png`;
    link.href = exportCanvas.toDataURL('image/png');
    link.click();
    confetti({ particleCount: 30, spread: 45 });
  };

  const currentSlide = activeSlides && activeSlides[currentSlideIndex];

  return (
    <div className="w-full h-full bg-slate-950 relative flex flex-col select-none overflow-hidden text-white">
      {/* 1. TOP TOOLBAR */}
      <div className="bg-slate-900 border-b border-slate-800 p-2 flex flex-wrap items-center justify-between gap-2 text-xs shrink-0 z-20">
        {/* Left: Tools & Geometry */}
        <div className="flex items-center gap-1">
          {/* Pen */}
          <button
            type="button"
            disabled={!canDraw}
            onClick={() => setTool('pen')}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              tool === 'pen' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="Pen (Freehand)"
          >
            <PenTool className="w-3.5 h-3.5" />
          </button>

          {/* Highlighter */}
          <button
            type="button"
            disabled={!canDraw}
            onClick={() => setTool('highlighter')}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              tool === 'highlighter' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="Highlighter (Alpha Transparent)"
          >
            <Sparkles className="w-3.5 h-3.5" />
          </button>

          {/* Eraser */}
          <button
            type="button"
            disabled={!canDraw}
            onClick={() => setTool('eraser')}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              tool === 'eraser' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="Eraser"
          >
            <Eraser className="w-3.5 h-3.5" />
          </button>

          <div className="h-4 w-px bg-slate-800 mx-0.5"></div>

          {/* Geometric Rectangle */}
          <button
            type="button"
            disabled={!canDraw}
            onClick={() => setTool('rect')}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              tool === 'rect' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="Geometric Rectangle Box"
          >
            <Square className="w-3.5 h-3.5" />
          </button>

          {/* Geometric Circle */}
          <button
            type="button"
            disabled={!canDraw}
            onClick={() => setTool('circle')}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              tool === 'circle' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="Geometric Circle / Ellipse"
          >
            <Circle className="w-3.5 h-3.5" />
          </button>

          {/* Straight Ruler Line */}
          <button
            type="button"
            disabled={!canDraw}
            onClick={() => setTool('line')}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              tool === 'line' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="Straight Ruler Line"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>

          {/* Pointer Arrow */}
          <button
            type="button"
            disabled={!canDraw}
            onClick={() => setTool('arrow')}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              tool === 'arrow' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="Pointer Arrow"
          >
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          {/* Text Tool */}
          <button
            type="button"
            disabled={!canDraw}
            onClick={() => setTool('text')}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              tool === 'text' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="Text Label"
          >
            <Type className="w-3.5 h-3.5" />
          </button>

          <div className="h-4 w-px bg-slate-800 mx-0.5"></div>

          {/* Color Palette */}
          {['#38BDF8', '#F59E0B', '#10B981', '#F43F5E', '#A855F7', '#FFFFFF', '#22D3EE'].map((c) => (
            <button
              key={c}
              type="button"
              disabled={!canDraw}
              onClick={() => {
                setColor(c);
                if (tool === 'eraser') setTool('pen');
              }}
              className={`w-3.5 h-3.5 rounded-full border border-slate-700 transition-transform cursor-pointer ${
                color === c && tool !== 'eraser' ? 'scale-125 ring-2 ring-blue-400' : ''
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>

        {/* Center / Right: Permissions, Slide Overlay, Grid, Undo & Export */}
        <div className="flex items-center gap-2">
          {/* Stroke Width Slider */}
          <div className="hidden sm:flex items-center gap-1.5 text-[10px] text-slate-400">
            <span>Size:</span>
            <input
              type="range"
              min={1}
              max={8}
              value={size}
              disabled={!canDraw}
              onChange={(e) => setSize(Number(e.target.value))}
              className="w-12 h-1 accent-blue-500 cursor-pointer"
            />
          </div>

          {/* Grid Paper Style */}
          {!isAnnotatingSlide && (
            <button
              type="button"
              onClick={() =>
                setGridMode((prev) => (prev === 'blank' ? 'dots' : prev === 'dots' ? 'lines' : 'blank'))
              }
              className="px-2 py-0.5 bg-slate-800 border border-slate-700 rounded text-[10px] font-semibold text-slate-300 cursor-pointer hover:bg-slate-700"
              title="Toggle Blackboard Grid"
            >
              {gridMode.toUpperCase()}
            </button>
          )}

          {/* Slide Annotation Layer Toggle */}
          {activeSlides && activeSlides.length > 0 && (
            <button
              type="button"
              onClick={() => setIsAnnotatingSlide(!isAnnotatingSlide)}
              className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                isAnnotatingSlide
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-slate-800 text-slate-300 hover:text-white border border-slate-700'
              }`}
              title="Annotate directly over active presentation slides"
            >
              <Presentation className="w-3 h-3 text-purple-300" />
              <span>{isAnnotatingSlide ? 'Annotating Slide' : 'Slide Overlay'}</span>
            </button>
          )}

          {/* Host Permission Controls */}
          {isHost ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowPermissionMenu(!showPermissionMenu)}
                className="px-2.5 py-0.5 rounded-lg bg-blue-950/80 hover:bg-blue-900 border border-blue-700/60 text-blue-300 hover:text-white text-[11px] font-bold flex items-center gap-1.5 cursor-pointer"
                title="Manage Student Whiteboard Permissions"
              >
                <Users className="w-3 h-3" />
                <span>
                  {permissionMode === 'teacher_only'
                    ? '🔒 Locked (Host Only)'
                    : permissionMode === 'all'
                    ? '👥 Open to All'
                    : `✏️ Delegated (${authorizedStudentIds.length})`}
                </span>
              </button>

              {/* Permission Dropdown */}
              {showPermissionMenu && (
                <div className="absolute right-0 top-full mt-1.5 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2.5 z-50 text-xs space-y-2 animate-in fade-in zoom-in-95">
                  <div className="font-bold text-white text-[11px] pb-1 border-b border-slate-800">
                    Whiteboard Collaboration Mode
                  </div>
                  <div className="space-y-1">
                    <button
                      type="button"
                      onClick={() => {
                        setPermissionMode('teacher_only');
                        setShowPermissionMenu(false);
                      }}
                      className={`w-full p-1.5 rounded-lg text-left flex items-center justify-between cursor-pointer ${
                        permissionMode === 'teacher_only' ? 'bg-blue-900 text-white font-bold' : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <span>🔒 Host Only (Read-Only Students)</span>
                      {permissionMode === 'teacher_only' && <Check className="w-3 h-3 text-blue-400" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPermissionMode('delegated');
                        setShowPermissionMenu(false);
                      }}
                      className={`w-full p-1.5 rounded-lg text-left flex items-center justify-between cursor-pointer ${
                        permissionMode === 'delegated' ? 'bg-blue-900 text-white font-bold' : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <span>🎯 Delegated (Grant to Selected Pupils)</span>
                      {permissionMode === 'delegated' && <Check className="w-3 h-3 text-blue-400" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPermissionMode('all');
                        setShowPermissionMenu(false);
                      }}
                      className={`w-full p-1.5 rounded-lg text-left flex items-center justify-between cursor-pointer ${
                        permissionMode === 'all' ? 'bg-blue-900 text-white font-bold' : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <span>👥 Open (All Present Students Draw)</span>
                      {permissionMode === 'all' && <Check className="w-3 h-3 text-blue-400" />}
                    </button>
                  </div>

                  {permissionMode === 'delegated' && onToggleStudentPermission && (
                    <div className="pt-2 border-t border-slate-800 space-y-1 max-h-40 overflow-y-auto">
                      <span className="text-[10px] text-slate-400 block font-semibold">
                        Authorized Students:
                      </span>
                      {participants
                        .filter((p) => p.role === 'student')
                        .map((s) => {
                          const hasAccess = authorizedStudentIds.includes(s.id);
                          return (
                            <button
                              key={s.id}
                              type="button"
                              onClick={() => onToggleStudentPermission(s.id)}
                              className={`w-full p-1 rounded-md text-left flex items-center justify-between text-[11px] cursor-pointer ${
                                hasAccess
                                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                                  : 'text-slate-400 hover:bg-slate-800'
                              }`}
                            >
                              <span className="truncate">{s.name}</span>
                              <span className="text-[10px] font-bold">
                                {hasAccess ? '✓ Has Pen' : '+ Grant'}
                              </span>
                            </button>
                          );
                        })}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="px-2 py-0.5 rounded-lg bg-slate-800 text-[10px] font-semibold text-slate-300 flex items-center gap-1">
              {canDraw ? (
                <>
                  <Unlock className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-300">Drawing Allowed</span>
                </>
              ) : (
                <>
                  <Lock className="w-3 h-3 text-slate-500" />
                  <span className="text-slate-400">Read-Only Mode</span>
                </>
              )}
            </div>
          )}

          {/* Undo */}
          <button
            type="button"
            disabled={!canDraw}
            onClick={handleUndo}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            title="Undo Last Stroke"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>

          {/* Clear Board */}
          <button
            type="button"
            disabled={!canDraw}
            onClick={clearCanvas}
            className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            title="Clear Whiteboard Canvas"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          {/* Export PNG */}
          <button
            type="button"
            onClick={handleDownloadSnapshot}
            className="p-1.5 text-slate-400 hover:text-blue-400 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            title="Export High-Res Whiteboard PNG"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. SLIDE NAVIGATION HEADER (When Annotating Slide) */}
      {isAnnotatingSlide && activeSlides && activeSlides.length > 0 && onNavigateSlide && (
        <div className="bg-slate-900/90 border-b border-slate-800 px-3 py-1.5 flex items-center justify-between text-xs shrink-0 z-10">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold text-[10px]">
              Slide {currentSlideIndex + 1} of {activeSlides.length}
            </span>
            <span className="font-semibold text-slate-200 truncate max-w-sm">
              {currentSlide?.title}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={currentSlideIndex === 0}
              onClick={() => onNavigateSlide(Math.max(0, currentSlideIndex - 1))}
              className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-mono text-slate-400">
              {currentSlideIndex + 1} / {activeSlides.length}
            </span>
            <button
              type="button"
              disabled={currentSlideIndex === activeSlides.length - 1}
              onClick={() => onNavigateSlide(Math.min(activeSlides.length - 1, currentSlideIndex + 1))}
              className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 3. MAIN WORKSPACE: CANVAS & SLIDE LAYER */}
      <div
        className={`relative flex-1 overflow-hidden select-none ${
          canDraw ? 'cursor-crosshair' : 'cursor-default'
        } ${
          isAnnotatingSlide
            ? 'bg-slate-950'
            : gridMode === 'dots'
            ? 'bg-[radial-gradient(#334155_1.5px,transparent_1.5px)] [background-size:24px_24px] bg-slate-950'
            : gridMode === 'lines'
            ? 'bg-[linear-gradient(#1e293b_1px,transparent_1px)] [background-size:100%_32px] bg-slate-950'
            : 'bg-slate-950'
        }`}
      >
        {/* Underlay: Active Slide Content (When in Slide Annotation Mode) */}
        {isAnnotatingSlide && currentSlide && (
          <div className="absolute inset-0 p-8 flex flex-col justify-between pointer-events-none select-none z-0 overflow-y-auto">
            <div className="space-y-4 max-w-3xl">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                Interactive Lecture Slide Deck
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                {currentSlide.title}
              </h2>
              {currentSlide.subtitle && (
                <p className="text-sm text-slate-300 italic">{currentSlide.subtitle}</p>
              )}

              {currentSlide.points && currentSlide.points.length > 0 && (
                <ul className="space-y-2.5 pt-2">
                  {currentSlide.points.map((pt, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm sm:text-base text-slate-200">
                      <span className="w-2 h-2 rounded-full bg-blue-400 mt-2 shrink-0"></span>
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              )}

              {currentSlide.diagram && (
                <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-700 text-xs text-amber-300">
                  <span className="font-bold block mb-1">Architecture / Diagram Focus:</span>
                  <p className="text-slate-300">{currentSlide.diagram}</p>
                </div>
              )}
            </div>

            {currentSlide.teacherNote && (
              <div className="pt-4 border-t border-slate-800 text-xs text-slate-400">
                💡 <span className="font-semibold text-slate-300">Faculty Pacing Note:</span> {currentSlide.teacherNote}
              </div>
            )}
          </div>
        )}

        {/* Primary Interactive Drawing Canvas */}
        <canvas
          ref={canvasRef}
          width={1280}
          height={720}
          onMouseDown={handleStartDraw}
          onMouseMove={handleDraw}
          onMouseUp={handleEndDraw}
          onMouseLeave={handleEndDraw}
          onTouchStart={handleStartDraw}
          onTouchMove={handleDraw}
          onTouchEnd={handleEndDraw}
          className="w-full h-full block absolute inset-0 z-10"
        />

        {/* Text Tool Prompt Popover (When user clicks on canvas with Text Tool) */}
        {textInputPos && (
          <div
            className="absolute z-30 p-2 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl space-y-1.5"
            style={{ left: Math.min(window.innerWidth - 240, textInputPos.x * 0.7), top: Math.min(400, textInputPos.y * 0.7) }}
          >
            <input
              type="text"
              autoFocus
              value={textInputValue}
              onChange={(e) => setTextInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCommitText();
                if (e.key === 'Escape') setTextInputPos(null);
              }}
              placeholder="Type label text..."
              className="px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
            <div className="flex items-center justify-end gap-1.5">
              <button
                type="button"
                onClick={() => setTextInputPos(null)}
                className="px-2 py-0.5 text-[10px] text-slate-400 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCommitText}
                className="px-2.5 py-0.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-[10px] font-bold cursor-pointer"
              >
                Place Label
              </button>
            </div>
          </div>
        )}

        {/* Read-Only Notice Overlay for Pupils without pen rights */}
        {!canDraw && (
          <div className="absolute bottom-3 left-3 z-20 pointer-events-none">
            <span className="px-3 py-1 rounded-full bg-slate-900/90 border border-slate-800 text-[11px] text-slate-400 backdrop-blur-md flex items-center gap-1.5 shadow-lg">
              <Lock className="w-3 h-3 text-slate-500" />
              <span>Viewing Host's Stage Blackboard (Read-Only)</span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
