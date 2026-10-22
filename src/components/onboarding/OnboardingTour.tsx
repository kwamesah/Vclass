import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { ONBOARDING_TOURS } from '../../data/onboardingData';
import {
  Compass,
  ChevronRight,
  ChevronLeft,
  X,
  Sparkles,
  RotateCcw,
  Target,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface TargetRect {
  top: number;
  left: number;
  width: number;
  height: number;
  bottom: number;
  right: number;
}

export const OnboardingTour: React.FC = () => {
  const {
    isTourActive,
    currentTourRole,
    currentTourStep,
    nextTourStep,
    prevTourStep,
    goToTourStep,
    closeTour,
    showTourWelcomeModal,
    startTour,
    dismissTourWelcome,
    currentUser,
    activeNav,
    setActiveNav,
  } = useApp();

  const [dontAskAgain, setDontAskAgain] = useState<boolean>(false);
  const [targetRect, setTargetRect] = useState<TargetRect | null>(null);
  const [popoverPos, setPopoverPos] = useState<{
    top: number;
    left: number;
    placement: 'top' | 'bottom' | 'left' | 'right';
    arrowOffset: number;
  }>({
    top: 100,
    left: 100,
    placement: 'bottom',
    arrowOffset: 50,
  });

  const popoverRef = useRef<HTMLDivElement>(null);
  const welcomePopoverRef = useRef<HTMLDivElement>(null);

  const tourConfig = ONBOARDING_TOURS[currentTourRole] || ONBOARDING_TOURS.student;
  const currentStep = tourConfig.steps[currentTourStep] || tourConfig.steps[0];
  const totalSteps = tourConfig.steps.length;
  const isLastStep = currentTourStep === totalSteps - 1;

  // Sync activeNav if currentStep specifies a targetNav that isn't active
  useEffect(() => {
    if (isTourActive && currentStep.targetNav && activeNav !== currentStep.targetNav) {
      setActiveNav(currentStep.targetNav);
    }
  }, [isTourActive, currentTourStep, currentStep.targetNav, activeNav, setActiveNav]);

  // Check if an element is visible in layout (not display:none, not 0x0)
  const isElementVisible = (el: HTMLElement | null): boolean => {
    if (!el) return false;
    const r = el.getBoundingClientRect();
    const style = window.getComputedStyle(el);
    return (
      style.display !== 'none' &&
      style.visibility !== 'hidden' &&
      style.opacity !== '0' &&
      r.width > 0 &&
      r.height > 0
    );
  };

  // Resolve target element with intelligent fallbacks (especially on mobile)
  const getTargetElement = useCallback((): HTMLElement | null => {
    if (!isTourActive && !showTourWelcomeModal) return null;

    const selector = isTourActive
      ? currentStep.targetSelector
      : '[data-tour="dashboard-greeting"], [data-tour="admin-header"], [data-tour="parent-header"], [data-tour="public-hero"], [data-tour="topbar-tour-btn"]';

    if (!selector) return null;

    // Check each comma-separated selector candidate
    const candidates = selector.split(',').map((s) => s.trim());
    for (const sel of candidates) {
      try {
        const el = document.querySelector<HTMLElement>(sel);
        if (el && isElementVisible(el)) {
          return el;
        }
      } catch {
        // ignore invalid selectors
      }
    }

    // On mobile devices, if sidebar navigation is targeted, fall back to mobile hamburger trigger
    const isMobile = window.innerWidth < 768;
    if (isMobile) {
      const mobileNav = document.querySelector<HTMLElement>('[data-tour="mobile-nav-trigger"]');
      if (mobileNav && isElementVisible(mobileNav)) {
        return mobileNav;
      }
    }

    // General visible fallback elements
    const fallbacks = [
      '[data-tour="dashboard-greeting"]',
      '[data-tour="admin-header"]',
      '[data-tour="parent-header"]',
      '[data-tour="public-hero"]',
      '[data-tour="topbar-tour-btn"]',
      '[data-tour="topbar-notifications"]',
    ];
    for (const fb of fallbacks) {
      const el = document.querySelector<HTMLElement>(fb);
      if (el && isElementVisible(el)) return el;
    }

    return null;
  }, [isTourActive, showTourWelcomeModal, currentStep]);

  // Position calculation (measuring only — no scrolling here to prevent jitter)
  const updatePosition = useCallback(() => {
    if (!isTourActive && !showTourWelcomeModal) return;

    const targetEl = getTargetElement();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const isMobile = vw < 640;

    const popoverEl = isTourActive ? popoverRef.current : welcomePopoverRef.current;
    const popWidth = popoverEl
      ? popoverEl.offsetWidth
      : isMobile
      ? Math.min(285, vw - 24)
      : 300;
    const popHeight = popoverEl ? popoverEl.offsetHeight : isMobile ? 85 : 105;

    const margin = 8;
    const padding = 10;

    if (!targetEl) {
      setTargetRect(null);
      setPopoverPos({
        top: Math.max(padding, vh / 2 - popHeight / 2),
        left: Math.max(padding, vw / 2 - popWidth / 2),
        placement: 'bottom',
        arrowOffset: popWidth / 2,
      });
      return;
    }

    const rect = targetEl.getBoundingClientRect();

    setTargetRect({
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
      bottom: rect.bottom,
      right: rect.right,
    });

    let top = 0;
    let computedPlacement: 'top' | 'bottom' | 'left' | 'right' = 'bottom';

    // Horizontal centering relative to target, clamped cleanly inside screen
    const left = Math.max(
      padding,
      Math.min(vw - popWidth - padding, rect.left + rect.width / 2 - popWidth / 2)
    );
    const arrowOffset = Math.max(
      14,
      Math.min(popWidth - 14, rect.left + rect.width / 2 - left)
    );

    const spaceAbove = rect.top - 60; // 60px safe area for TopBar
    const spaceBelow = vh - rect.bottom - padding;

    if (isMobile) {
      // ON PHONES 📱:
      // Strictly avoid covering the target element!
      if (spaceBelow >= popHeight + margin) {
        // Fits comfortably below target
        top = rect.bottom + margin;
        computedPlacement = 'bottom';
      } else if (spaceAbove >= popHeight + margin) {
        // Fits comfortably above target
        top = rect.top - popHeight - margin;
        computedPlacement = 'top';
      } else {
        // Tight space or very tall element: dock cleanly at bottom
        top = Math.max(padding, vh - popHeight - padding);
        computedPlacement = 'top';
      }
    } else {
      // DESKTOP & TABLETS (>= 640px)
      const preferred = currentStep.placement || 'bottom';

      if (preferred === 'right' && rect.right + margin + popWidth <= vw - padding) {
        computedPlacement = 'right';
        top = Math.max(
          padding,
          Math.min(vh - popHeight - padding, rect.top + rect.height / 2 - popHeight / 2)
        );
        setPopoverPos({
          top,
          left: rect.right + margin,
          placement: 'right',
          arrowOffset: Math.max(14, Math.min(popHeight - 14, rect.top + rect.height / 2 - top)),
        });
        return;
      } else if (preferred === 'left' && rect.left - margin - popWidth >= padding) {
        computedPlacement = 'left';
        top = Math.max(
          padding,
          Math.min(vh - popHeight - padding, rect.top + rect.height / 2 - popHeight / 2)
        );
        setPopoverPos({
          top,
          left: rect.left - margin - popWidth,
          placement: 'left',
          arrowOffset: Math.max(14, Math.min(popHeight - 14, rect.top + rect.height / 2 - top)),
        });
        return;
      } else if (preferred === 'top' && spaceAbove >= popHeight + margin) {
        computedPlacement = 'top';
        top = rect.top - popHeight - margin;
      } else if (spaceBelow >= popHeight + margin) {
        computedPlacement = 'bottom';
        top = rect.bottom + margin;
      } else if (spaceAbove >= popHeight + margin) {
        computedPlacement = 'top';
        top = rect.top - popHeight - margin;
      } else {
        computedPlacement = 'bottom';
        top = rect.bottom + margin;
      }

      top = Math.max(padding, Math.min(vh - popHeight - padding, top));
    }

    setPopoverPos({
      top,
      left,
      placement: computedPlacement,
      arrowOffset,
    });
  }, [isTourActive, showTourWelcomeModal, currentStep, getTargetElement]);

  // Smooth scroll to target ONCE on step change (no scroll loops)
  useEffect(() => {
    if (!isTourActive) return;

    const timer = setTimeout(() => {
      const targetEl = getTargetElement();
      if (!targetEl) return;

      const rect = targetEl.getBoundingClientRect();
      const vh = window.innerHeight;
      const isMobile = window.innerWidth < 640;

      const topSafe = isMobile ? 65 : 75;
      const bottomSafe = isMobile ? 95 : 120;

      const isWellPositioned =
        rect.top >= topSafe && rect.bottom + bottomSafe <= vh;

      if (!isWellPositioned) {
        targetEl.scrollIntoView({
          behavior: 'smooth',
          block: isMobile ? 'nearest' : 'center',
          inline: 'nearest',
        });
      }

      requestAnimationFrame(updatePosition);
      setTimeout(updatePosition, 100);
      setTimeout(updatePosition, 250);
    }, 30);

    return () => clearTimeout(timer);
  }, [currentTourStep, isTourActive, currentTourRole, getTargetElement, updatePosition]);

  // Recalculate position on resize and user scroll
  useEffect(() => {
    updatePosition();
    const t = setTimeout(updatePosition, 120);

    const handleScrollOrResize = () => {
      requestAnimationFrame(updatePosition);
    };

    window.addEventListener('resize', handleScrollOrResize, { passive: true });
    window.addEventListener('scroll', handleScrollOrResize, { passive: true, capture: true });

    return () => {
      clearTimeout(t);
      window.removeEventListener('resize', handleScrollOrResize);
      window.removeEventListener('scroll', handleScrollOrResize, true);
    };
  }, [updatePosition]);

  // Keyboard navigation support (ArrowRight, ArrowLeft, Escape)
  useEffect(() => {
    if (!isTourActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        nextTourStep();
      } else if (e.key === 'ArrowLeft') {
        prevTourStep();
      } else if (e.key === 'Escape') {
        closeTour(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isTourActive, nextTourStep, prevTourStep, closeTour]);

  // ==========================================
  // RENDER 1: COMPACT FIRST-TIME WELCOME PROMPT
  // ==========================================
  if (showTourWelcomeModal && !isTourActive) {
    const userName = currentUser?.name ? currentUser.name.split(' ')[0] : 'Scholar';

    return (
      <div className="fixed inset-0 z-50 pointer-events-auto">
        {/* Soft background overlay */}
        <div
          className="fixed inset-0 bg-slate-950/45 backdrop-blur-2xs transition-opacity duration-150"
          onClick={() => dismissTourWelcome(dontAskAgain)}
        />

        {/* Compact Anchored Welcome Popover */}
        <div
          ref={welcomePopoverRef}
          style={{
            top: `${popoverPos.top}px`,
            left: `${popoverPos.left}px`,
          }}
          className="fixed z-50 w-[calc(100vw-24px)] sm:w-[320px] max-w-[330px] bg-white rounded-xl shadow-2xl border border-blue-900/20 overflow-hidden text-left animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Header */}
          <div className="px-3 py-2 bg-slate-900 text-white flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <Compass className="w-3.5 h-3.5 text-amber-400 shrink-0 animate-spin-slow" />
              <p className="text-xs font-bold text-white truncate">
                Welcome, {userName}!
              </p>
            </div>
            <button
              type="button"
              onClick={() => dismissTourWelcome(dontAskAgain)}
              className="text-slate-400 hover:text-white p-0.5 rounded cursor-pointer"
              aria-label="Dismiss tour"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-3 space-y-2 text-xs">
            <p className="text-slate-600 leading-snug text-[11px] sm:text-xs">
              Quick <strong>1-minute guided tour</strong> showing what each button and menu does.
            </p>

            <label className="flex items-center gap-1.5 cursor-pointer text-[10px] text-slate-500 select-none">
              <input
                type="checkbox"
                checked={dontAskAgain}
                onChange={(e) => setDontAskAgain(e.target.checked)}
                className="rounded border-slate-300 text-blue-900 w-3 h-3"
              />
              <span>Don't show this prompt again</span>
            </label>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-0.5">
              <button
                type="button"
                onClick={() => startTour(currentTourRole, 0)}
                className="flex-1 py-1 px-2.5 bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs rounded-lg shadow-xs transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-95"
              >
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Start Tour (1m)</span>
              </button>
              <button
                type="button"
                onClick={() => dismissTourWelcome(dontAskAgain)}
                className="py-1 px-2 text-slate-500 hover:text-slate-800 text-xs font-medium rounded cursor-pointer"
              >
                Skip
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isTourActive) return null;

  // ==========================================
  // RENDER 2: ULTRA-COMPACT ON-SCREEN TOUR POPOVER
  // ==========================================
  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* Target Element Spotlight Backdrop Mask */}
      {targetRect && targetRect.width > 0 && targetRect.height > 0 && (
        <svg
          className="fixed inset-0 w-full h-full pointer-events-none transition-all duration-150"
          style={{ zIndex: 40 }}
        >
          <defs>
            <mask id="tour-spotlight-mask">
              <rect width="100%" height="100%" fill="white" />
              <rect
                x={Math.max(0, targetRect.left - 4)}
                y={Math.max(0, targetRect.top - 4)}
                width={targetRect.width + 8}
                height={targetRect.height + 8}
                rx="8"
                fill="black"
              />
            </mask>
          </defs>
          <rect
            width="100%"
            height="100%"
            fill="rgba(15, 23, 42, 0.45)"
            mask="url(#tour-spotlight-mask)"
          />
        </svg>
      )}

      {/* Target Highlight Ring & Beacon Pin */}
      {targetRect && targetRect.width > 0 && targetRect.height > 0 && (
        <div
          className="fixed pointer-events-none transition-all duration-150 rounded-lg"
          style={{
            top: `${Math.max(0, targetRect.top - 4)}px`,
            left: `${Math.max(0, targetRect.left - 4)}px`,
            width: `${targetRect.width + 8}px`,
            height: `${targetRect.height + 8}px`,
            zIndex: 45,
          }}
        >
          <div className="w-full h-full rounded-lg ring-2 ring-amber-400 ring-offset-1 ring-offset-transparent shadow-[0_0_12px_rgba(251,191,36,0.5)] animate-pulse" />
          <div className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-amber-400 text-blue-950 flex items-center justify-center font-bold text-[8px] shadow-sm animate-bounce">
            <Target className="w-2.5 h-2.5" />
          </div>
        </div>
      )}

      {/* Ultra-compact Anchored Popover Box */}
      <div
        ref={popoverRef}
        style={{
          top: `${popoverPos.top}px`,
          left: `${popoverPos.left}px`,
          zIndex: 50,
        }}
        className="fixed pointer-events-auto w-[calc(100vw-24px)] sm:w-[290px] max-w-[310px] bg-white rounded-xl shadow-xl border border-blue-900/30 overflow-hidden text-left animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Directional Arrow Pointer */}
        {targetRect && (
          <div
            className={`absolute w-2.5 h-2.5 bg-white border-blue-900/30 transform rotate-45 pointer-events-none ${
              popoverPos.placement === 'bottom'
                ? '-top-1.5 border-t border-l'
                : popoverPos.placement === 'top'
                ? '-bottom-1.5 border-b border-r'
                : popoverPos.placement === 'right'
                ? '-left-1.5 border-b border-l'
                : '-right-1.5 border-t border-r'
            }`}
            style={
              popoverPos.placement === 'bottom' || popoverPos.placement === 'top'
                ? { left: `${popoverPos.arrowOffset}px` }
                : { top: `${popoverPos.arrowOffset}px` }
            }
          />
        )}

        {/* Compact Header Bar */}
        <div className="px-2.5 py-1.5 bg-slate-900 text-white flex items-center justify-between gap-1.5">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-[9px] font-extrabold bg-amber-400 text-blue-950 px-1 py-0.2 rounded-xs uppercase tracking-wider shrink-0">
              {currentTourStep + 1}/{totalSteps}
            </span>
            <span className="text-xs font-bold text-white truncate">
              {currentStep.title}
            </span>
          </div>

          <div className="flex items-center gap-0.5 shrink-0">
            <button
              type="button"
              onClick={() => goToTourStep(0)}
              className="p-0.5 text-slate-400 hover:text-white rounded cursor-pointer"
              title="Restart"
            >
              <RotateCcw className="w-2.5 h-2.5" />
            </button>
            <button
              type="button"
              onClick={() => closeTour(false)}
              className="p-0.5 text-slate-400 hover:text-white rounded cursor-pointer"
              title="Exit"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Ultra-compact Body: 1 crisp line */}
        <div className="p-2 space-y-1.5">
          <p className="text-[11px] text-slate-700 leading-tight font-normal">
            {currentStep.description}
          </p>

          {/* Tiny Step Progress Bar */}
          <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
            <div
              className="bg-blue-900 h-full transition-all duration-200"
              style={{ width: `${((currentTourStep + 1) / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Ultra-compact Footer */}
        <div className="px-2.5 py-1 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-1">
          <button
            type="button"
            disabled={currentTourStep === 0}
            onClick={prevTourStep}
            className={`px-1.5 py-0.5 rounded text-[10px] font-medium flex items-center gap-0.5 transition-colors ${
              currentTourStep === 0
                ? 'text-slate-300 cursor-not-allowed'
                : 'text-slate-600 hover:text-slate-900 cursor-pointer'
            }`}
          >
            <ChevronLeft className="w-2.5 h-2.5" />
            <span>Back</span>
          </button>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => closeTour(false)}
              className="px-1 py-0.5 text-[10px] text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              Skip
            </button>

            <button
              type="button"
              onClick={() => {
                if (isLastStep) {
                  confetti({
                    particleCount: 45,
                    spread: 60,
                    origin: { y: 0.8 },
                  });
                }
                nextTourStep();
              }}
              className="px-2 py-0.5 bg-blue-900 hover:bg-blue-800 text-white rounded text-[10px] font-bold transition-all shadow-2xs flex items-center gap-1 cursor-pointer active:scale-95"
            >
              {isLastStep ? (
                <>
                  <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                  <span>Done</span>
                </>
              ) : (
                <>
                  <span>Next</span>
                  <ChevronRight className="w-2.5 h-2.5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
