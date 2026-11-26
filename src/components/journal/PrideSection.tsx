import React from 'react';
import {
  ActiveTextFieldTarget,
  AgeCategory,
  CanvasObjectTransform,
  EditorSectionTarget,
  Page2Config,
} from '../../types/journal';
import { BearCharacter } from './BearCharacter';
import {
  DraggableDesignWrapper,
  InlineEditableText,
  SnapLinesState,
} from './DecorLayer';

interface PrideSectionProps {
  config: Page2Config;
  ageCategory: AgeCategory;
  designMode?: boolean;
  scaleFactor?: number;
  hasExplicitHeight?: boolean;
  bearTransform?: CanvasObjectTransform;
  activeTarget?: EditorSectionTarget;
  activeTextField?: ActiveTextFieldTarget;
  onSelectTarget?: (target: EditorSectionTarget) => void;
  onSelectTextField?: (target: ActiveTextFieldTarget) => void;
  onUpdateTransform?: (blockId: string, next: CanvasObjectTransform) => void;
  onUpdateFields?: (patch: Partial<Page2Config>) => void;
  onSnapLinesChange?: (lines: SnapLinesState) => void;
  onInteractionStart?: () => void;
  onInteractionEnd?: () => void;
}

export function PrideSection({
  config,
  ageCategory,
  designMode = false,
  scaleFactor = 1,
  hasExplicitHeight = false,
  bearTransform,
  activeTarget,
  activeTextField,
  onSelectTarget,
  onSelectTextField,
  onUpdateTransform,
  onSnapLinesChange,
  onInteractionStart,
  onInteractionEnd,
}: PrideSectionProps) {
  const isPrideActive =
    activeTarget?.page === 2 && activeTarget.block === 'pride';
  const isBearActive =
    activeTarget?.page === 2 && activeTarget.block === 'prideBear';
  const bearMultiplier =
    ageCategory === '6-8' || ageCategory === '8-10'
      ? 1.02
      : ageCategory === '12-14' || ageCategory === '14-15'
      ? 0.94
      : 1;

  // Migrate legacy coral background to sunny yellow matching the Page 2 spread
  const resolvedBgColor =
    !config.prideBgColor || config.prideBgColor.toUpperCase() === '#FF8A75'
      ? '#FFE14D'
      : config.prideBgColor;

  const backingColor =
    resolvedBgColor.toUpperCase() === '#FF7B6B' ? '#5EE2E4' : '#FF7B6B';

  return (
    <section
      data-card-label="Мой момент гордости"
      className="shrink-0 w-full min-w-0 box-border flex flex-col flex-1 min-h-full"
    >
      <h3 className="font-journal-display font-black text-[17.5px] leading-[21px] tracking-tight uppercase text-[#111827] mb-[10px] shrink-0">
        МОЙ МОМЕНТ ГОРДОСТИ
      </h3>

      <div
        onClick={(e) => {
          if (!onSelectTarget) return;
          e.stopPropagation();
          onSelectTarget({ page: 2, block: 'pride' });
        }}
        style={{
          minHeight: hasExplicitHeight ? undefined : '280px',
        }}
        className={`relative flex-1 w-full min-w-0 box-border overflow-visible flex flex-col ${
          onSelectTarget ? 'editable-block' : ''
        } ${isPrideActive ? 'editable-block-active' : ''}`}
      >
        {/* Decorative Offset Backing Card (shifted 5px, rotated -2deg) */}
        <div
          aria-hidden="true"
          style={{
            backgroundColor: backingColor,
            transform: 'translate(-5px, 5px) rotate(-2deg)',
          }}
          className="pointer-events-none absolute inset-0 rounded-2xl border-[1.7px] border-[#18181B] shadow-[0_8px_16px_rgba(17,24,39,0.12)] z-0"
        />

        {/* Neat Rounded Main Yellow Card */}
        <div
          style={{ backgroundColor: resolvedBgColor }}
          className="relative z-10 flex-1 w-full min-w-0 box-border rounded-2xl border-[1.8px] border-[#18181B] px-[18px] pt-[14px] pb-[14px] flex flex-col items-stretch justify-between gap-[6px] overflow-visible shadow-[0_6px_14px_rgba(17,24,39,0.12)]"
        >
          {/* Subtle Sunburst Rays + Confetti Clipped Inside Rounded Card */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-[14px]"
          >
            <svg
              viewBox="0 0 345 376"
              className="w-full h-full"
              preserveAspectRatio="none"
              fill="none"
            >
              <g opacity="0.32">
                <polygon points="172,164 30,0 92,0" fill="#FFFFFF" />
                <polygon points="172,164 148,0 202,0" fill="#FFFFFF" />
                <polygon points="172,164 260,0 324,0" fill="#FFFFFF" />
                <polygon points="172,164 345,52 345,112" fill="#FFFFFF" />
                <polygon points="172,164 345,174 345,232" fill="#FFFFFF" />
                <polygon points="172,164 345,294 316,376" fill="#FFFFFF" />
                <polygon points="172,164 224,376 156,376" fill="#FFFFFF" />
                <polygon points="172,164 86,376 22,376" fill="#FFFFFF" />
                <polygon points="172,164 0,276 0,214" fill="#FFFFFF" />
                <polygon points="172,164 0,142 0,80" fill="#FFFFFF" />
                <circle cx="172" cy="164" r="96" fill="#FFFFFF" opacity="0.52" />
              </g>

              {config.showPrideConfetti &&
                ageCategory !== '12-14' &&
                ageCategory !== '14-15' && (
                <g>
                  <path
                    d="M22 118C32 108 44 120 54 110C62 102 60 92 70 88"
                    stroke="#38BDF8"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M278 112C288 102 300 114 310 102C316 94 314 84 324 80"
                    stroke="#6366F1"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M36 74L39 81L46 83L39 85L36 92L33 85L26 83L33 81L36 74Z"
                    fill="#FB7185"
                    stroke="#18181B"
                    strokeWidth="1.3"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M304 68L307 75L314 77L307 79L304 86L301 79L294 77L301 75L304 68Z"
                    fill="#5EEAD4"
                    stroke="#18181B"
                    strokeWidth="1.3"
                    strokeLinejoin="round"
                  />
                  <circle
                    cx="32"
                    cy="168"
                    r="4"
                    fill="#A7F3D0"
                    stroke="#18181B"
                    strokeWidth="1.2"
                  />
                  <circle
                    cx="312"
                    cy="154"
                    r="4"
                    fill="#FB7185"
                    stroke="#18181B"
                    strokeWidth="1.2"
                  />
                  <rect
                    x="48"
                    y="142"
                    width="7"
                    height="7"
                    rx="2"
                    transform="rotate(-22 48 142)"
                    fill="#60A5FA"
                    stroke="#18181B"
                    strokeWidth="1.2"
                  />
                  <rect
                    x="284"
                    y="134"
                    width="7"
                    height="7"
                    rx="2"
                    transform="rotate(24 284 134)"
                    fill="#FFFFFF"
                    stroke="#18181B"
                    strokeWidth="1.2"
                  />
                </g>
              )}
            </svg>
          </div>

          {/* 1. Top Expressive Heading (Normal Flex Flow) */}
          <div className="relative z-10 text-center shrink-0 px-[6px] w-full min-w-0 box-border">
            <InlineEditableText
              value={config.prideTitle}
              onSelectText={
                onSelectTextField
                  ? () => onSelectTextField({ page: 2, field: 'prideTitle' })
                  : undefined
              }
              isSelected={
                activeTextField?.page === 2 &&
                activeTextField.field === 'prideTitle'
              }
              as="h4"
              className="font-journal-display font-black text-[18px] leading-[1.12] tracking-tight uppercase text-[#111827] block w-full min-w-0 box-border whitespace-pre-wrap [overflow-wrap:anywhere]"
            />
          </div>

          {/* 2. Enlarged Trophy Bear Strictly Above Text Plaque */}
          <div className="relative z-10 flex-1 flex items-center justify-center min-h-[110px] py-[2px]">
            <DraggableDesignWrapper
              id="prideBear"
              transform={bearTransform}
              defaultZIndex={20}
              designMode={designMode}
              scaleFactor={scaleFactor}
              isActive={isBearActive}
              onSelect={
                onSelectTarget
                  ? () => onSelectTarget({ page: 2, block: 'prideBear' })
                  : undefined
              }
              onUpdateTransform={
                onUpdateTransform
                  ? (next) => onUpdateTransform('prideBear', next)
                  : undefined
              }
              onSnapLinesChange={onSnapLinesChange}
              onInteractionStart={onInteractionStart}
              onInteractionEnd={onInteractionEnd}
              style={{ width: '232px', height: '214px' }}
              className="mx-auto shrink-0 flex items-center justify-center"
            >
              <div className="w-full h-full p-[2px] flex items-center justify-center">
                <BearCharacter
                  src={config.prideBearUrl}
                  alt="Медведь KIBERone с наградой"
                  scale={config.prideBearScale * bearMultiplier * 1.08}
                  offsetX={config.prideBearOffsetX}
                  offsetY={config.prideBearOffsetY}
                  cropTop={false}
                  className="w-full h-full"
                />
              </div>
            </DraggableDesignWrapper>
          </div>

          {/* 3. White Achievement Plaque Strictly Below Bear (Zero Overlap) */}
          <div
            style={{
              boxShadow:
                '-3px 4px 0 0 rgba(24, 24, 27, 0.14), 0 6px 14px rgba(17, 24, 39, 0.12)',
            }}
            className="relative z-20 shrink-0 w-full min-w-0 box-border bg-white border-[1.7px] border-[#18181B] rounded-xl px-[13px] py-[8px]"
          >
            <div
              className="font-journal-body text-[11.5px] leading-[19px] font-semibold text-[#111827] w-full min-w-0 box-border"
              style={{
                backgroundImage:
                  'linear-gradient(to bottom, transparent 18px, rgba(148, 163, 184, 0.34) 18px, rgba(148, 163, 184, 0.34) 19px)',
                backgroundSize: '100% 19px',
              }}
            >
              <InlineEditableText
                value={config.prideText}
                placeholder="Уверенная защита проекта и самостоятельное решение задач на занятиях!"
                onSelectText={
                  onSelectTextField
                    ? () => onSelectTextField({ page: 2, field: 'prideText' })
                    : undefined
                }
                isSelected={
                  activeTextField?.page === 2 &&
                  activeTextField.field === 'prideText'
                }
                as="p"
                className="m-0 min-h-[54px] block w-full min-w-0 box-border whitespace-pre-wrap [overflow-wrap:anywhere]"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
