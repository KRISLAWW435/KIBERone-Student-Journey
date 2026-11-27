import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Compass,
  HelpCircle,
  Lightbulb,
  RotateCcw,
  Sparkles,
  X,
} from 'lucide-react';
import {
  ONBOARDING_STEPS,
  OnboardingStepConfig,
} from '../../data/onboardingTour';
import { ASSETS } from '../../data/presets';
import { resolveAssetUrl } from '../../utils/assetUrl';

interface OnboardingMascotProps {
  src?: string;
  alt?: string;
  className?: string;
}

export function OnboardingMascot({
  src = ASSETS.bearTourWave,
  alt = 'Фирменный 3D-мишка KIBERone',
  className = 'w-60 h-60 sm:w-64 sm:h-64',
}: OnboardingMascotProps) {
  const resolvedSrc = resolveAssetUrl(src);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [resolvedSrc]);

  if (failed || !resolvedSrc) {
    return (
      <div
        data-testid="onboarding-mascot-fallback"
        className={`${className} rounded-2xl bg-zinc-100 border border-zinc-200 flex flex-col items-center justify-center gap-2 text-zinc-500 p-4 text-center`}
      >
        <Sparkles className="w-8 h-8 text-[#0D9488]" />
        <span className="text-xs font-medium">3D-мишка KIBERone</span>
      </div>
    );
  }

  return (
    <img
      data-testid="onboarding-mascot-image"
      src={resolvedSrc}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={`${className} object-contain select-none drop-shadow-[0_16px_28px_rgba(15,23,42,0.14)]`}
    />
  );
}

interface WelcomeScreenProps {
  bearImageUrl?: string;
  onStartTour: () => void;
  onSkip: () => void;
}

export function WelcomeScreen({
  bearImageUrl = ASSETS.bearTourWave,
  onStartTour,
  onSkip,
}: WelcomeScreenProps) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onSkip();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onSkip]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-anna-heading"
      data-testid="onboarding-welcome-screen"
      className="fixed inset-0 z-[100] bg-[#F6F6F3]/95 backdrop-blur-xs flex items-center justify-center p-4 sm:p-8 overflow-y-auto"
    >
      <div className="w-full max-w-[940px] bg-white border border-zinc-200 rounded-2xl shadow-[0_24px_60px_rgba(15,23,42,0.12)] overflow-hidden">
        {/* Clean Brand Header */}
        <div className="px-6 sm:px-8 py-4 border-b border-zinc-200/80 flex items-center justify-between gap-4 bg-white">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={resolveAssetUrl(ASSETS.logo)}
              alt="KIBERone"
              referrerPolicy="no-referrer"
              className="h-7 w-auto object-contain block shrink-0"
            />
            <span className="text-zinc-300" aria-hidden="true">
              /
            </span>
            <span className="text-xs font-semibold text-zinc-600 truncate">
              Student Journey · Знакомство с сервисом
            </span>
          </div>

          <button
            type="button"
            onClick={onSkip}
            aria-label="Закрыть приветствие"
            title="Закрыть приветствие"
            className="p-2 rounded-lg text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100 transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 2-Column Welcome Body */}
        <div className="grid grid-cols-1 md:grid-cols-12 items-stretch">
          {/* Left: Professional Editorial Greeting & Actions */}
          <div className="md:col-span-7 p-7 sm:p-10 flex flex-col justify-between gap-8">
            <div className="space-y-4">
              <div className="text-xs font-semibold text-[#0F766E] tracking-wide">
                Рабочее пространство руководителя
              </div>

              <h1
                id="welcome-anna-heading"
                className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 font-journal-display leading-[1.12] [text-wrap:balance]"
              >
                Привет, Анна!
              </h1>

              <p className="text-[15px] text-zinc-600 leading-relaxed max-w-xl">
                Это интерактивный тур по KIBERone Student Journey. За пару минут мы пройдём весь рабочий маршрут: от организации групп и библиотеки модулей до дизайна страниц А4 и выгрузки готовых журналов в PDF.
              </p>

              <div className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-zinc-100">
                <div className="space-y-1">
                  <div className="text-xs font-bold text-zinc-900 tabular-nums">
                    01. Группы и программа
                  </div>
                  <p className="text-xs text-zinc-500 leading-snug">
                    Локации, списки резидентов и общие модули обучения
                  </p>
                </div>
                <div className="space-y-1">
                  <div className="text-xs font-bold text-zinc-900 tabular-nums">
                    02. Контент и дизайн А4
                  </div>
                  <p className="text-xs text-zinc-500 leading-snug">
                    Проекты, достижения, слово наставника и точная вёрстка
                  </p>
                </div>
                <div className="space-y-1">
                  <div className="text-xs font-bold text-zinc-900 tabular-nums">
                    03. Предпросмотр и PDF
                  </div>
                  <p className="text-xs text-zinc-500 leading-snug">
                    Проверка разворота, PNG, PDF и пакетный ZIP по группе
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onStartTour}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#0D9488] hover:bg-[#0F766E] text-white text-sm font-semibold transition-colors shadow-xs whitespace-nowrap cursor-pointer"
              >
                <span>Начать знакомство</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={onSkip}
                className="inline-flex items-center justify-center px-4 py-3 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 text-sm font-medium transition-colors whitespace-nowrap cursor-pointer"
              >
                Пропустить
              </button>
            </div>
          </div>

          {/* Right: Standalone Replaceable Mascot + Speech Bubble */}
          <div className="md:col-span-5 bg-[#F8FAFC] border-t md:border-t-0 md:border-l border-zinc-200/80 p-6 sm:p-8 flex flex-col items-center justify-center gap-3 relative">
            {/* Speech Bubble next to/above waving bear */}
            <div className="relative bg-white border border-zinc-200 rounded-2xl px-4 py-3 shadow-[0_6px_20px_rgba(15,23,42,0.06)] max-w-[270px] text-center">
              <p className="text-sm font-semibold text-zinc-800 leading-snug">
                Привет! Давай я покажу тебе, как здесь всё устроено
              </p>
              <div
                aria-hidden="true"
                className="w-3 h-3 bg-white border-r border-b border-zinc-200 rotate-45 absolute -bottom-1.5 left-1/2 -translate-x-1/2"
              />
            </div>

            {/* Standalone Bear Image Container (replaceable asset) */}
            <div className="pt-1 flex items-center justify-center">
              <OnboardingMascot
                src={bearImageUrl}
                className="w-52 h-52 sm:w-60 sm:h-60"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface SpotlightRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface OnboardingTourOverlayProps {
  stepIndex: number;
  steps?: OnboardingStepConfig[];
  hasGroupData: boolean;
  isMiniTutorial?: boolean;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
  onFinish: () => void;
}

export function OnboardingTourOverlay({
  stepIndex,
  steps = ONBOARDING_STEPS,
  hasGroupData,
  isMiniTutorial = false,
  onNext,
  onPrev,
  onSkip,
  onFinish,
}: OnboardingTourOverlayProps) {
  const step = steps[stepIndex] ?? steps[0];
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === steps.length - 1;

  const [rects, setRects] = useState<SpotlightRect[]>([]);
  const [viewport, setViewport] = useState<{ w: number; h: number }>({
    w: typeof window !== 'undefined' ? window.innerWidth : 1440,
    h: typeof window !== 'undefined' ? window.innerHeight : 900,
  });
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [cardSize, setCardSize] = useState<{ w: number; h: number }>({
    w: 380,
    h: 260,
  });

  const measureTargets = useCallback(() => {
    if (typeof window === 'undefined') return;
    setViewport({ w: window.innerWidth, h: window.innerHeight });

    const useFallback = Boolean(step.requiresExistingGroup && !hasGroupData);
    const selectors: string[] = [];

    if (useFallback && step.fallbackSelector) {
      selectors.push(step.fallbackSelector);
    } else {
      const primaryEl = document.querySelector(step.targetSelector);
      if (primaryEl) {
        selectors.push(step.targetSelector);
        if (step.secondarySelector && document.querySelector(step.secondarySelector)) {
          selectors.push(step.secondarySelector);
        }
      } else if (step.fallbackSelector && document.querySelector(step.fallbackSelector)) {
        selectors.push(step.fallbackSelector);
      }
    }

    const nextRects: SpotlightRect[] = [];
    const pad = 6;
    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (!el) continue;
      const r = el.getBoundingClientRect();
      if (r.width <= 0 || r.height <= 0) continue;
      const top = Math.max(4, r.top - pad);
      const left = Math.max(4, r.left - pad);
      const right = Math.min(window.innerWidth - 4, r.right + pad);
      const bottom = Math.min(window.innerHeight - 4, r.bottom + pad);
      nextRects.push({
        top,
        left,
        width: Math.max(24, right - left),
        height: Math.max(24, bottom - top),
      });
    }
    setRects(nextRects);
  }, [step, hasGroupData]);

  useEffect(() => {
    if (step.scrollIntoView) {
      const scrollTimer = window.setTimeout(() => {
        const el = document.querySelector(step.targetSelector);
        if (el && typeof el.scrollIntoView === 'function') {
          el.scrollIntoView({ block: 'center', behavior: 'instant' as ScrollBehavior });
        }
        measureTargets();
      }, 60);
      return () => window.clearTimeout(scrollTimer);
    }
    return undefined;
  }, [step, measureTargets]);

  useEffect(() => {
    measureTargets();
    const raf1 = window.requestAnimationFrame(measureTargets);
    const t1 = window.setTimeout(measureTargets, 80);
    const t2 = window.setTimeout(measureTargets, 220);

    const handleChange = () => measureTargets();
    window.addEventListener('resize', handleChange);
    window.addEventListener('scroll', handleChange, true);

    return () => {
      window.cancelAnimationFrame(raf1);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.removeEventListener('resize', handleChange);
      window.removeEventListener('scroll', handleChange, true);
    };
  }, [measureTargets, stepIndex]);

  useLayoutEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    if (r.width > 0 && r.height > 0) {
      setCardSize({ w: r.width, h: r.height });
    }
  }, [stepIndex, rects.length, hasGroupData]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onSkip();
      } else if (e.key === 'ArrowRight') {
        if (isLast) onFinish();
        else onNext();
      } else if (e.key === 'ArrowLeft' && !isFirst) {
        onPrev();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isFirst, isLast, onFinish, onNext, onPrev, onSkip]);

  // Compute smart tooltip coordinates near primary spotlight rect
  const primaryRect = rects[0] ?? null;
  const gap = 16;
  const margin = 16;
  const cw = Math.min(390, viewport.w - margin * 2);
  const ch = cardSize.h || 260;

  let cardTop = Math.round((viewport.h - ch) / 2);
  let cardLeft = Math.round((viewport.w - cw) / 2);

  if (primaryRect) {
    const spaceBelow = viewport.h - (primaryRect.top + primaryRect.height) - margin;
    const spaceAbove = primaryRect.top - margin;
    const spaceRight = viewport.w - (primaryRect.left + primaryRect.width) - margin;
    const spaceLeft = primaryRect.left - margin;

    const place = (dir: 'bottom' | 'top' | 'left' | 'right'): boolean => {
      if (dir === 'bottom' && spaceBelow >= ch + gap) {
        cardTop = primaryRect.top + primaryRect.height + gap;
        cardLeft = Math.min(
          viewport.w - cw - margin,
          Math.max(margin, primaryRect.left)
        );
        return true;
      }
      if (dir === 'top' && spaceAbove >= ch + gap) {
        cardTop = primaryRect.top - ch - gap;
        cardLeft = Math.min(
          viewport.w - cw - margin,
          Math.max(margin, primaryRect.left)
        );
        return true;
      }
      if (dir === 'left' && spaceLeft >= cw + gap) {
        cardLeft = primaryRect.left - cw - gap;
        cardTop = Math.min(
          viewport.h - ch - margin,
          Math.max(margin, primaryRect.top + 12)
        );
        return true;
      }
      if (dir === 'right' && spaceRight >= cw + gap) {
        cardLeft = primaryRect.left + primaryRect.width + gap;
        cardTop = Math.min(
          viewport.h - ch - margin,
          Math.max(margin, primaryRect.top + 12)
        );
        return true;
      }
      return false;
    };

    const order: Array<'bottom' | 'top' | 'left' | 'right'> = [
      step.preferredPlacement,
      'bottom',
      'left',
      'right',
      'top',
    ];
    let placed = false;
    for (const dir of order) {
      if (place(dir)) {
        placed = true;
        break;
      }
    }

    if (!placed) {
      cardTop = Math.min(
        viewport.h - ch - margin,
        Math.max(margin, primaryRect.top + primaryRect.height + gap)
      );
      if (cardTop + ch > viewport.h - margin) {
        cardTop = Math.max(margin, viewport.h - ch - margin);
      }
      cardLeft = Math.min(
        viewport.w - cw - margin,
        Math.max(margin, primaryRect.left)
      );
    }
  }

  const showEmptyNote = Boolean(step.requiresExistingGroup && !hasGroupData && step.emptyDataNote);
  const progressPct = Math.round(((stepIndex + 1) / steps.length) * 100);

  return (
    <div
      data-testid="onboarding-tour-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={`Обучение: ${step.title}`}
      className="fixed inset-0 z-[95] pointer-events-auto"
    >
      {/* SVG Spotlight Mask dimming the rest of the screen while keeping real UI crisp */}
      <svg
        aria-hidden="true"
        className="fixed inset-0 w-full h-full pointer-events-none"
      >
        <defs>
          <mask id="kiberone-tour-spotlight-mask">
            <rect width="100%" height="100%" fill="white" />
            {rects.map((r, idx) => (
              <rect
                key={idx}
                x={r.left}
                y={r.top}
                width={r.width}
                height={r.height}
                rx={12}
                ry={12}
                fill="black"
              />
            ))}
          </mask>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="rgba(15, 23, 42, 0.54)"
          mask="url(#kiberone-tour-spotlight-mask)"
        />
        {rects.map((r, idx) => (
          <rect
            key={`ring-${idx}`}
            x={r.left}
            y={r.top}
            width={r.width}
            height={r.height}
            rx={12}
            ry={12}
            fill="none"
            stroke="#0D9488"
            strokeWidth={2.5}
          />
        ))}
      </svg>

      {/* Tour Guidance Card */}
      <div
        ref={cardRef}
        data-testid="onboarding-tour-card"
        style={{
          top: `${cardTop}px`,
          left: `${cardLeft}px`,
          width: `${cw}px`,
        }}
        className="fixed z-[96] bg-white border border-zinc-200 rounded-2xl shadow-[0_20px_50px_rgba(15,23,42,0.22)] overflow-hidden transition-[top,left] duration-150 ease-out"
      >
        {/* Top Progress Strip */}
        <div className="h-1 w-full bg-zinc-100">
          <div
            style={{ width: `${progressPct}%` }}
            className="h-full bg-[#0D9488] transition-all duration-200"
          />
        </div>

        <div className="p-5 space-y-3.5">
          {/* Step Indicator & Close */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#0F766E] tabular-nums">
              <span data-testid="onboarding-step-counter">
                Шаг {step.stepNumber} из {steps.length}
              </span>
              <span className="text-zinc-300" aria-hidden="true">
                ·
              </span>
              <span className="text-zinc-500 font-medium truncate max-w-[200px]">
                {step.shortLabel}
              </span>
            </div>

            <button
              type="button"
              onClick={onSkip}
              aria-label="Закрыть обучение"
              title="Закрыть обучение"
              className="p-1 rounded-lg text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Step Title & Body */}
          <div className="space-y-1.5">
            <h3 className="text-base font-bold text-zinc-900 leading-snug">
              {step.title}
            </h3>
            <p className="text-xs text-zinc-600 leading-relaxed">
              {step.description}
            </p>
          </div>

          {/* Optional Extra Tip / Empty Data Fallback Note */}
          {(showEmptyNote || step.extraTip) && (
            <div className="rounded-xl bg-[#F8FAFC] border border-zinc-200/80 px-3 py-2.5 flex items-start gap-2">
              <Lightbulb className="w-3.5 h-3.5 text-[#0D9488] shrink-0 mt-0.5" />
              <p className="text-[11px] text-zinc-600 leading-snug">
                {showEmptyNote ? step.emptyDataNote : step.extraTip}
              </p>
            </div>
          )}

          {/* Tour Controls */}
          <div className="pt-2 border-t border-zinc-100 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={onSkip}
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-colors cursor-pointer"
            >
              {isMiniTutorial ? 'В центр помощи' : 'Пропустить'}
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={isFirst}
                onClick={onPrev}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-xs font-medium text-zinc-700 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Назад</span>
              </button>

              <button
                type="button"
                onClick={isLast ? onFinish : onNext}
                className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-lg bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-semibold transition-colors shadow-2xs cursor-pointer"
              >
                <span>
                  {isLast
                    ? isMiniTutorial
                      ? 'Завершить и вернуться'
                      : 'Завершить'
                    : 'Далее'}
                </span>
                {!isLast && <ArrowRight className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface HelpMenuButtonProps {
  variant?: 'light' | 'dark';
  compact?: boolean;
  onOpenHelpCenter?: () => void;
  onStartWelcome: () => void;
  onJumpToStep: (stepIndex: number) => void;
}

export function HelpMenuButton({
  variant = 'light',
  compact = false,
  onOpenHelpCenter,
  onStartWelcome,
  onJumpToStep,
}: HelpMenuButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        data-tour-id="help-trigger"
        onClick={() => {
          if (onOpenHelpCenter) {
            onOpenHelpCenter();
          } else {
            setOpen((v) => !v);
          }
        }}
        aria-label="Центр помощи и обучение"
        title="Открыть центр помощи"
        className={
          variant === 'dark'
            ? 'inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-xs font-semibold transition-colors cursor-pointer'
            : `inline-flex items-center justify-center gap-1.5 ${
                compact ? 'px-2.5 py-1.5' : 'px-3 py-2'
              } rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-xs font-medium text-zinc-700 transition-colors cursor-pointer whitespace-nowrap shrink-0`
        }
      >
        <HelpCircle
          className={`w-3.5 h-3.5 ${
            variant === 'dark' ? 'text-[#5EEAD4]' : 'text-[#0D9488]'
          }`}
        />
        <span className={compact ? 'hidden xl:inline' : 'hidden sm:inline'}>
          Помощь
        </span>
      </button>

      {open && !onOpenHelpCenter && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div
            role="menu"
            className="absolute right-0 mt-2 w-80 bg-white border border-zinc-200 rounded-xl shadow-xl z-50 p-2 text-left text-zinc-900"
          >
            <div className="px-2.5 py-1.5 flex items-center justify-between border-b border-zinc-100 mb-1.5">
              <span className="text-xs font-bold text-zinc-900">
                Обучение KIBERone
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="p-0.5 rounded text-zinc-400 hover:text-zinc-700"
                aria-label="Закрыть меню помощи"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onStartWelcome();
              }}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg bg-[#F0FDFA] hover:bg-[#CCFBF1]/70 text-[#0F766E] text-xs font-semibold transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 shrink-0" />
              <span>Повторить тур с приветствия</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onJumpToStep(0);
              }}
              className="w-full mt-1 flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-zinc-50 text-zinc-700 text-xs font-medium transition-colors cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5 text-[#0D9488] shrink-0" />
              <span>Запустить экскурсию (Шаг 1 из {ONBOARDING_STEPS.length})</span>
            </button>

            <div className="mt-2 pt-2 border-t border-zinc-100">
              <div className="px-2.5 pb-1 text-[11px] font-semibold text-zinc-400">
                Перейти к разделу тура
              </div>
              <div className="max-h-56 overflow-y-auto space-y-0.5">
                {ONBOARDING_STEPS.map((st, idx) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      onJumpToStep(idx);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-zinc-50 text-left text-xs text-zinc-700 transition-colors cursor-pointer"
                  >
                    <span className="w-4 text-[11px] font-mono text-zinc-400 tabular-nums shrink-0">
                      {st.stepNumber}.
                    </span>
                    <span className="truncate font-medium">{st.shortLabel}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

interface ContextualHintProps {
  title: string;
  text: string;
  align?: 'left' | 'right';
}

export function ContextualHint({
  title,
  text,
  align = 'right',
}: ContextualHintProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative inline-flex items-center">
      <button
        type="button"
        data-testid="contextual-hint-trigger"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        aria-label={`Подсказка: ${title}`}
        title={title}
        className="w-5 h-5 rounded-full border border-zinc-200 bg-white hover:border-[#0D9488] hover:text-[#0D9488] text-zinc-400 inline-flex items-center justify-center transition-colors cursor-pointer"
      >
        <HelpCircle className="w-3 h-3" />
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={(e) => {
              e.stopPropagation();
              setOpen(false);
            }}
          />
          <div
            onClick={(e) => e.stopPropagation()}
            className={`absolute top-full mt-1.5 ${
              align === 'right' ? 'right-0' : 'left-0'
            } w-64 bg-white border border-zinc-200 rounded-xl shadow-lg p-3 z-50 text-left space-y-1`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold text-zinc-900">
                {title}
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-zinc-400 hover:text-zinc-700"
                aria-label="Закрыть подсказку"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
            <p className="text-[11px] text-zinc-600 leading-relaxed">{text}</p>
          </div>
        </>
      )}
    </div>
  );
}
