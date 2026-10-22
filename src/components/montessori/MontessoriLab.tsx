import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Shapes,
  Volume2,
  VolumeX,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  RotateCcw,
  Award,
  Layers,
  Check,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const MontessoriLab: React.FC = () => {
  const {
    montessoriActivities,
    activeActivityId,
    setActiveActivityId,
    speakText,
    isSpeaking,
    stopSpeaking,
    currentUser,
  } = useApp();

  const currentActivity =
    montessoriActivities.find((a) => a.id === activeActivityId) ||
    montessoriActivities[0];

  if (!currentUser) return null;

  if (!currentActivity) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
        <Shapes className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-900">Montessori Lab Activities</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
          Interactive sensory apparatus, bead frames, and sorting modules will appear here when configured by faculty.
        </p>
      </div>
    );
  }

  // Identification Activity States
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [identifiedCount, setIdentifiedCount] = useState<number>(0);

  // Sorting Activity States (Living vs Non-Living)
  const [trayLiving, setTrayLiving] = useState<string[]>([]);
  const [trayNonLiving, setTrayNonLiving] = useState<string[]>([]);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; isError?: boolean } | null>(null);

  // Matching Activity States (Shapes)
  const [matchedPairs, setMatchedPairs] = useState<string[]>([]);
  const [selectedShapeId, setSelectedShapeId] = useState<string | null>(null);

  // Golden Beads & Decimal Powers States
  const [thousandsCount, setThousandsCount] = useState<number>(1);
  const [hundredsCount, setHundredsCount] = useState<number>(2);
  const [tensCount, setTensCount] = useState<number>(4);
  const [unitsCount, setUnitsCount] = useState<number>(8);
  const [binaryBits, setBinaryBits] = useState<number[]>([0, 1, 0, 0, 1, 0, 1, 0]);

  const toggleBit = (index: number) => {
    setBinaryBits((prev) => {
      const copy = [...prev];
      copy[index] = copy[index] === 1 ? 0 : 1;
      return copy;
    });
  };

  const triggerActivityAudio = (prompt: string) => {
    if (isSpeaking) {
      stopSpeaking();
    } else {
      speakText(prompt);
    }
  };

  const handleIdentifyItem = (item: any) => {
    setSelectedItemId(item.id);
    setIdentifiedCount((prev) => prev + 1);
    speakText(`${item.label}. ${item.hint}`);

    if (identifiedCount + 1 >= currentActivity.items.length) {
      confetti({ particleCount: 50, spread: 60 });
    }
  };

  // Sorting handlers
  const handleSortItem = (itemId: string, destination: 'living' | 'non_living') => {
    const item = currentActivity.items.find((i) => i.id === itemId);
    if (!item) return;

    if (item.category === destination) {
      if (destination === 'living') {
        if (!trayLiving.includes(itemId)) setTrayLiving((prev) => [...prev, itemId]);
      } else {
        if (!trayNonLiving.includes(itemId)) setTrayNonLiving((prev) => [...prev, itemId]);
      }

      setFeedbackMsg({
        text: `✓ Correct! ${item.label} belongs to ${
          destination === 'living' ? 'Living Things' : 'Non-Living Things'
        }. ${item.hint}`,
      });
      speakText(`Correct! ${item.label} is ${destination === 'living' ? 'living' : 'non living'}.`);

      // Check all items sorted
      const totalSorted = trayLiving.length + trayNonLiving.length + 1;
      if (totalSorted >= currentActivity.items.length) {
        confetti({ particleCount: 80, spread: 70 });
        setFeedbackMsg({ text: '🎉 Bravo! You sorted all Montessori specimens correctly!' });
      }
    } else {
      setFeedbackMsg({
        text: `❌ Try again! Does ${item.label} grow, breathe, and reproduce? Remember: ${item.hint}`,
        isError: true,
      });
      speakText(`Try again. Does ${item.label} grow or breathe?`);
    }
  };

  const resetSorting = () => {
    setTrayLiving([]);
    setTrayNonLiving([]);
    setFeedbackMsg(null);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-600 via-orange-500 to-amber-700 text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-200" />
              Hands-On Montessori Sensory Exploration
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-heading">
              Montessori Interactive Learning Lab
            </h1>
            <p className="text-xs sm:text-sm text-amber-100 max-w-2xl leading-relaxed">
              Tactile, self-correcting activities designed to cultivate deep concrete comprehension.
              Listen to spoken audio, inspect parts, and classify organisms.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => triggerActivityAudio(currentActivity.audioPrompt)}
              className="px-4 py-2.5 rounded-xl bg-white text-slate-900 hover:bg-amber-50 text-xs font-bold shadow-xs flex items-center gap-2 transition-transform hover:scale-105 cursor-pointer"
            >
              {isSpeaking ? (
                <>
                  <VolumeX className="w-4 h-4 text-rose-600 animate-pulse" />
                  <span>Stop Speech</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4 text-amber-600" />
                  <span>Read Instructions Aloud</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Activity Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {montessoriActivities.map((act) => (
          <button
            key={act.id}
            onClick={() => {
              setActiveActivityId(act.id);
              setSelectedItemId(null);
              setFeedbackMsg(null);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              currentActivity.id === act.id
                ? 'bg-blue-900 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Shapes className="w-3.5 h-3.5" />
            <span>{act.title}</span>
          </button>
        ))}
      </div>

      {/* ACTIVE ACTIVITY VIEWPORT */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
        {/* Activity Instruction Bar */}
        <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-900">{currentActivity.title}</h3>
            <p className="text-xs text-slate-600">{currentActivity.instruction}</p>
          </div>
          <button
            onClick={() => triggerActivityAudio(currentActivity.instruction)}
            className="text-amber-800 hover:text-amber-950 text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <Volume2 className="w-3.5 h-3.5" /> Listen
          </button>
        </div>

        {/* 1. TACTILE IDENTIFY MODE (Computer Parts) */}
        {currentActivity.type === 'identify' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {currentActivity.items.map((item) => {
                const isSelected = selectedItemId === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleIdentifyItem(item)}
                    className={`p-4 rounded-2xl border-2 text-center transition-all cursor-pointer group flex flex-col items-center justify-between min-h-[140px] ${
                      isSelected
                        ? 'border-blue-900 bg-blue-50 shadow-md scale-105'
                        : 'border-slate-200 hover:border-amber-400 bg-slate-50 hover:bg-white'
                    }`}
                  >
                    <span className="text-4xl group-hover:scale-110 transition-transform">
                      {item.icon}
                    </span>
                    <div className="mt-2">
                      <p className="text-xs font-bold text-slate-900">{item.label}</p>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-0.5">
                        {item.category}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Selected Item Detail Inspector */}
            {selectedItemId && (
              <div className="p-5 bg-blue-50/80 border border-blue-200 rounded-2xl flex flex-col sm:flex-row items-center gap-5 animate-fade-in">
                {(() => {
                  const itm = currentActivity.items.find((i) => i.id === selectedItemId);
                  if (!itm) return null;
                  return (
                    <>
                      <div className="w-20 h-20 rounded-2xl bg-white shadow-xs border border-blue-200 flex items-center justify-center text-4xl shrink-0">
                        {itm.icon}
                      </div>
                      <div className="space-y-1.5 text-left flex-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-sm bg-blue-900 text-white text-[10px] font-bold uppercase tracking-wider">
                            {itm.category}
                          </span>
                          <h4 className="text-base font-bold text-slate-900">{itm.label}</h4>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                          {itm.hint}
                        </p>
                      </div>
                      <button
                        onClick={() => speakText(`${itm.label}. ${itm.hint}`)}
                        className="px-3.5 py-2 bg-blue-900 text-white text-xs font-semibold rounded-xl hover:bg-blue-800 transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                      >
                        <Volume2 className="w-4 h-4" /> Listen Again
                      </button>
                    </>
                  );
                })()}
              </div>
            )}
          </div>
        )}

        {/* 2. TACTILE SORTING TRAYS MODE (Living vs Non-Living) */}
        {currentActivity.type === 'sort' && (
          <div className="space-y-6">
            {/* Feedback alert */}
            {feedbackMsg && (
              <div
                className={`p-3 rounded-xl text-xs font-semibold ${
                  feedbackMsg.isError
                    ? 'bg-rose-50 text-rose-800 border border-rose-200'
                    : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                }`}
              >
                {feedbackMsg.text}
              </div>
            )}

            {/* Unsorted Items Pool */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Montessori Specimen Deck (Tap to classify into a tray)
                </span>
                <button
                  onClick={resetSorting}
                  className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reset Trays
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
                {currentActivity.items.map((item) => {
                  const isSorted =
                    trayLiving.includes(item.id) || trayNonLiving.includes(item.id);
                  if (isSorted) return null;
                  return (
                    <div
                      key={item.id}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-2 hover:border-amber-400 transition-colors"
                    >
                      <span className="text-3xl">{item.icon}</span>
                      <p className="text-[11px] font-bold text-slate-900 leading-tight">
                        {item.label}
                      </p>
                      <div className="flex gap-1 pt-1">
                        <button
                          onClick={() => handleSortItem(item.id, 'living')}
                          className="flex-1 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold transition-colors cursor-pointer"
                          title="Place in Living Things"
                        >
                          🔵 Living
                        </button>
                        <button
                          onClick={() => handleSortItem(item.id, 'non_living')}
                          className="flex-1 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded text-[10px] font-bold transition-colors cursor-pointer"
                          title="Place in Non-Living Things"
                        >
                          🟡 Non-L
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* The Two Sorting Trays */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              {/* Tray A: Living Things */}
              <div className="bg-emerald-50/50 border-2 border-emerald-300 rounded-2xl p-5 space-y-3 min-h-[200px]">
                <div className="flex items-center justify-between pb-2 border-b border-emerald-200">
                  <h4 className="text-sm font-bold text-emerald-950 flex items-center gap-2">
                    🔵 Living Things Tray
                  </h4>
                  <span className="text-xs font-semibold text-emerald-800">
                    {trayLiving.length} Items Sorted
                  </span>
                </div>
                <p className="text-[11px] text-emerald-800">
                  Characteristics: Grow, breathe, eat, reproduce, and react to changes.
                </p>

                <div className="flex flex-wrap gap-2 pt-2">
                  {trayLiving.map((id) => {
                    const itm = currentActivity.items.find((i) => i.id === id);
                    if (!itm) return null;
                    return (
                      <div
                        key={id}
                        className="px-3 py-1.5 bg-white border border-emerald-300 rounded-xl shadow-2xs flex items-center gap-2 text-xs font-bold text-emerald-950 animate-pop"
                      >
                        <span>{itm.icon}</span>
                        <span>{itm.label}</span>
                      </div>
                    );
                  })}
                  {trayLiving.length === 0 && (
                    <p className="text-xs text-emerald-600/70 italic py-6 text-center w-full">
                      Tray is currently empty. Classify living specimens here!
                    </p>
                  )}
                </div>
              </div>

              {/* Tray B: Non-Living Things */}
              <div className="bg-amber-50/50 border-2 border-amber-300 rounded-2xl p-5 space-y-3 min-h-[200px]">
                <div className="flex items-center justify-between pb-2 border-b border-amber-200">
                  <h4 className="text-sm font-bold text-amber-950 flex items-center gap-2">
                    🟡 Non-Living Things Tray
                  </h4>
                  <span className="text-xs font-semibold text-amber-800">
                    {trayNonLiving.length} Items Sorted
                  </span>
                </div>
                <p className="text-[11px] text-amber-800">
                  Characteristics: Inanimate objects, do not breathe or produce offspring.
                </p>

                <div className="flex flex-wrap gap-2 pt-2">
                  {trayNonLiving.map((id) => {
                    const itm = currentActivity.items.find((i) => i.id === id);
                    if (!itm) return null;
                    return (
                      <div
                        key={id}
                        className="px-3 py-1.5 bg-white border border-amber-300 rounded-xl shadow-2xs flex items-center gap-2 text-xs font-bold text-amber-950 animate-pop"
                      >
                        <span>{itm.icon}</span>
                        <span>{itm.label}</span>
                      </div>
                    );
                  })}
                  {trayNonLiving.length === 0 && (
                    <p className="text-xs text-amber-600/70 italic py-6 text-center w-full">
                      Tray is currently empty. Classify non-living items here!
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. SHAPES SENSORY MATCHING (B4 Level) */}
        {currentActivity.type === 'matching' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {currentActivity.items.map((shape) => (
              <div
                key={shape.id}
                onClick={() => {
                  speakText(`${shape.label}. ${shape.category}`);
                  confetti({ particleCount: 20 });
                }}
                className="p-5 rounded-2xl border border-slate-200 hover:border-blue-900 hover:bg-blue-50/30 transition-all text-center space-y-3 cursor-pointer group shadow-2xs"
              >
                <div className="text-5xl group-hover:scale-110 transition-transform">
                  {shape.icon}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{shape.label}</h4>
                  <p className="text-xs text-slate-500 mt-1">{shape.category}</p>
                </div>
                <button className="text-[11px] font-semibold text-blue-900 group-hover:underline flex items-center justify-center gap-1 mx-auto">
                  <Volume2 className="w-3.5 h-3.5" /> Listen to property
                </button>
              </div>
            ))}
          </div>
        )}

        {/* 4. MONTESSORI GOLDEN BEADS & PROPORTIONAL BINARY MATH */}
        {currentActivity.type === 'counting' && (
          <div className="space-y-6">
            {/* Decimal Assembled Counter Banner */}
            <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">
                  Tactile Decimal Assembly
                </span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-3xl font-extrabold text-slate-900 font-mono tabular-nums">
                    {(thousandsCount * 1000 + hundredsCount * 100 + tensCount * 10 + unitsCount).toLocaleString()}
                  </span>
                  <span className="text-xs text-slate-600">
                    ({thousandsCount}k + {hundredsCount}h + {tensCount}t + {unitsCount}u)
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const total = thousandsCount * 1000 + hundredsCount * 100 + tensCount * 10 + unitsCount;
                    speakText(`Assembled decimal number: ${total}. That is ${thousandsCount} thousand, ${hundredsCount} hundred, ${tensCount} ten, and ${unitsCount} units.`);
                  }}
                  className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Volume2 className="w-4 h-4" /> Pronounce Value
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setThousandsCount(0);
                    setHundredsCount(0);
                    setTensCount(0);
                    setUnitsCount(0);
                  }}
                  className="px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reset
                </button>
              </div>
            </div>

            {/* 4 Golden Bead Columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Thousand-Cubes */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 text-center">
                <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                  <h4 className="text-xs font-bold text-slate-900">Thousand-Cubes</h4>
                  <span className="text-xs font-mono font-bold text-amber-700">1,000</span>
                </div>
                <div className="h-24 flex items-center justify-center text-4xl overflow-hidden flex-wrap gap-1">
                  {Array.from({ length: thousandsCount }).map((_, idx) => (
                    <span key={idx} className="animate-scale-in">📦</span>
                  ))}
                  {thousandsCount === 0 && <span className="text-xs text-slate-400 italic">0 Cubes</span>}
                </div>
                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setThousandsCount(Math.max(0, thousandsCount - 1))}
                    className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-100 cursor-pointer"
                  >
                    -
                  </button>
                  <span className="text-sm font-bold font-mono text-slate-900">{thousandsCount}</span>
                  <button
                    type="button"
                    onClick={() => setThousandsCount(Math.min(9, thousandsCount + 1))}
                    className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 font-bold hover:bg-amber-600 cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Hundred-Squares */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 text-center">
                <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                  <h4 className="text-xs font-bold text-slate-900">Hundred-Squares</h4>
                  <span className="text-xs font-mono font-bold text-amber-700">100</span>
                </div>
                <div className="h-24 flex items-center justify-center text-3xl overflow-hidden flex-wrap gap-1">
                  {Array.from({ length: hundredsCount }).map((_, idx) => (
                    <span key={idx} className="animate-scale-in">🟨</span>
                  ))}
                  {hundredsCount === 0 && <span className="text-xs text-slate-400 italic">0 Squares</span>}
                </div>
                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setHundredsCount(Math.max(0, hundredsCount - 1))}
                    className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-100 cursor-pointer"
                  >
                    -
                  </button>
                  <span className="text-sm font-bold font-mono text-slate-900">{hundredsCount}</span>
                  <button
                    type="button"
                    onClick={() => setHundredsCount(Math.min(9, hundredsCount + 1))}
                    className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 font-bold hover:bg-amber-600 cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Ten-Bars */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 text-center">
                <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                  <h4 className="text-xs font-bold text-slate-900">Ten-Bars (Rods)</h4>
                  <span className="text-xs font-mono font-bold text-amber-700">10</span>
                </div>
                <div className="h-24 flex items-center justify-center text-2xl overflow-hidden flex-wrap gap-1">
                  {Array.from({ length: tensCount }).map((_, idx) => (
                    <span key={idx} className="animate-scale-in">🪵</span>
                  ))}
                  {tensCount === 0 && <span className="text-xs text-slate-400 italic">0 Rods</span>}
                </div>
                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setTensCount(Math.max(0, tensCount - 1))}
                    className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-100 cursor-pointer"
                  >
                    -
                  </button>
                  <span className="text-sm font-bold font-mono text-slate-900">{tensCount}</span>
                  <button
                    type="button"
                    onClick={() => setTensCount(Math.min(9, tensCount + 1))}
                    className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 font-bold hover:bg-amber-600 cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Unit Beads */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 text-center">
                <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                  <h4 className="text-xs font-bold text-slate-900">Unit Beads</h4>
                  <span className="text-xs font-mono font-bold text-amber-700">1</span>
                </div>
                <div className="h-24 flex items-center justify-center text-xl overflow-hidden flex-wrap gap-1">
                  {Array.from({ length: unitsCount }).map((_, idx) => (
                    <span key={idx} className="animate-scale-in">🟡</span>
                  ))}
                  {unitsCount === 0 && <span className="text-xs text-slate-400 italic">0 Beads</span>}
                </div>
                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setUnitsCount(Math.max(0, unitsCount - 1))}
                    className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-100 cursor-pointer"
                  >
                    -
                  </button>
                  <span className="text-sm font-bold font-mono text-slate-900">{unitsCount}</span>
                  <button
                    type="button"
                    onClick={() => setUnitsCount(Math.min(9, unitsCount + 1))}
                    className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 font-bold hover:bg-amber-600 cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Computing Connection: 8-Bit Binary Switchboard */}
            <div className="p-5 bg-blue-950 text-white rounded-2xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-sm bg-blue-700 text-amber-300 text-[10px] font-bold uppercase tracking-wider">
                      B7 Computing Integration
                    </span>
                    <h4 className="text-sm font-bold font-heading">
                      8-Bit Binary Register &amp; Place Values
                    </h4>
                  </div>
                  <p className="text-xs text-slate-300 mt-1">
                    Just like Montessori beads use powers of 10 (1000, 100, 10, 1), computers store data in powers of 2!
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider">Computed Decimal Value</p>
                  <p className="text-2xl font-bold font-mono text-amber-400 tabular-nums">
                    {binaryBits.reduce((acc, bit, idx) => acc + (bit ? Math.pow(2, 7 - idx) : 0), 0)}
                  </p>
                </div>
              </div>

              {/* 8 Bits Grid */}
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                {[128, 64, 32, 16, 8, 4, 2, 1].map((weight, idx) => {
                  const isOn = binaryBits[idx] === 1;
                  return (
                    <button
                      key={weight}
                      type="button"
                      onClick={() => toggleBit(idx)}
                      className={`p-3 rounded-xl border transition-all text-center cursor-pointer ${
                        isOn
                          ? 'bg-amber-400 text-slate-950 border-amber-300 font-bold shadow-md scale-102'
                          : 'bg-white/10 text-slate-300 border-white/10 hover:bg-white/20'
                      }`}
                    >
                      <p className="text-[10px] opacity-70">2^{7 - idx}</p>
                      <p className="text-xs font-mono font-bold mt-0.5">{weight}</p>
                      <p className={`text-base font-extrabold font-mono mt-1 ${isOn ? 'text-slate-950' : 'text-slate-400'}`}>
                        {isOn ? '1' : '0'}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
