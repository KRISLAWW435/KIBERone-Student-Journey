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
    ageCategory === '8-10' ? 1.02 : ageCategory === '14-15' ? 0.94 : 1;

  // Migrate legacy coral background to sunny yellow matching the Page 2 spread
  const resolvedBgColor =
    !config.prideBgColor || config.prideBgColor.toUpperCase() === '#FF8A75'
      ? '#FFE14D'
      : config.prideBgColor;

  return (
    <section
      style={{ width: '345px' }}
      className="shrink-0 flex flex-col h-full"
    >
      <h3 className="font-extrabold text-[17px] leading-[20px] tracking-tight uppercase text-[#111827] mb-[8px] shrink-0">
        МОЙ МОМЕНТ ГОРДОСТИ
      </h3>

      <div
        onClick={(e) => {
          if (!onSelectTarget) return;
          e.stopPropagation();
          onSelectTarget({ page: 2, block: 'pride' });
        }}
        style={{
          width: '345px',
          minHeight: '376px',
          backgroundColor: resolvedBgColor,
          boxShadow:
            '0 0 0 2px #FF7B6B, -4px 5px 0 0 #FF7B6B, 0 8px 20px rgba(24,24,39,0.1)',
        }}
        className={`relative flex-1 rounded-2xl px-[16px] pt-[12px] pb-[14px] flex flex-col items-stretch justify-between gap-[6px] overflow-hidden ${
          onSelectTarget ? 'editable-block' : ''
        } ${isPrideActive ? 'editable-block-active' : ''}`}
      >
        {/* Soft decorative glow & celebratory confetti SVG behind the column flow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden z-0"
        >
          <div className="mx-auto mt-[58px] w-[224px] h-[224px] rounded-full bg-white/30 blur-[2px]" />

          {config.showPrideConfetti && ageCategory !== '14-15' && (
            <svg
              aria-hidden="true"
              viewBox="0 0 345 376"
              className="absolute inset-0 w-full h-full"
              fill="none"
            >
              <path
                d="M20 132C30 122 42 134 52 124C60 116 58 106 68 102"
                stroke="#38BDF8"
                strokeWidth="2.4"
                strokeLinecap="round"
              />
              <path
                d="M286 124C296 114 308 126 318 114C324 106 322 96 332 92"
                stroke="#6366F1"
                strokeWidth="2.4"
                strokeLinecap="round"
              />
              <path
                d="M40 86L43 93L50 95L43 97L40 104L37 97L30 95L37 93L40 86Z"
                fill="#FB7185"
                stroke="#18181B"
                strokeWidth="1.2"
                strokeLinejoin="round"
              />
              <path
                d="M302 78L305 85L312 87L305 89L302 96L299 89L292 87L299 85L302 78Z"
                fill="#5EEAD4"
                stroke="#18181B"
                strokeWidth="1.2"
                strokeLinejoin="round"
              />
              <circle
                cx="34"
                cy="176"
                r="4"
                fill="#A7F3D0"
                stroke="#18181B"
                strokeWidth="1.1"
              />
              <circle
                cx="312"
                cy="160"
                r="4"
                fill="#FB7185"
                stroke="#18181B"
                strokeWidth="1.1"
              />
              <rect
                x="52"
                y="156"
                width="7"
                height="7"
                rx="2"
                transform="rotate(-22 52 156)"
                fill="#60A5FA"
                stroke="#18181B"
                strokeWidth="1.1"
              />
              <rect
                x="280"
                y="144"
                width="7"
                height="7"
                rx="2"
                transform="rotate(24 280 144)"
                fill="#FFFFFF"
                stroke="#18181B"
                strokeWidth="1.1"
              />
            </svg>
          )}
        </div>

        {/* 1. Top Expressive Heading (Normal Flex Flow) */}
        <div className="relative z-10 text-center shrink-0 px-[4px]">
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
            className="font-extrabold text-[19px] leading-[1.12] tracking-tight uppercase text-[#111827] block"
          />
        </div>

        {/* 2. Centered Large Bear Mascot (Normal Flex Flow, Prominent Size) */}
        <div className="relative z-10 flex-1 flex items-center justify-center min-h-[204px]">
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
            style={{ width: '214px', height: '204px' }}
            className="mx-auto shrink-0 flex items-center justify-center"
          >
            <div
              style={{ width: '214px', height: '204px' }}
              className="flex items-center justify-center"
            >
              <BearCharacter
                src={config.prideBearUrl}
                alt="Медведь KIBERone с наградой"
                scale={config.prideBearScale * bearMultiplier}
                offsetX={config.prideBearOffsetX}
                offsetY={config.prideBearOffsetY}
                cropTop={false}
                className="w-[208px] h-[200px] drop-shadow-[0_10px_14px_rgba(17,24,39,0.18)]"
              />
            </div>
          </DraggableDesignWrapper>
        </div>

        {/* 3. White Achievement Plaque Below Bear in Normal Document Flow (No position: absolute) */}
        <div
          style={{
            boxShadow:
              '-3px 4px 0 0 #FF8A75, 0 5px 12px rgba(17, 24, 39, 0.12)',
          }}
          className="relative z-20 shrink-0 bg-white border-[1.5px] border-[#18181B]/25 rounded-xl px-[14px] py-[9px]"
        >
          <div
            className="text-[12px] leading-[20px] font-semibold text-[#111827]"
            style={{
              backgroundImage:
                'linear-gradient(to bottom, transparent 19px, rgba(148, 163, 184, 0.34) 19px, rgba(148, 163, 184, 0.34) 20px)',
              backgroundSize: '100% 20px',
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
              className="m-0 min-h-[58px] block"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
