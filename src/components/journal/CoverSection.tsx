import React from 'react';
import { DEFAULT_SPEECH_BUBBLE_TEXT } from '../../data/presets';
import {
  ActiveTextFieldTarget,
  AgeCategory,
  CanvasObjectTransform,
  EditorSectionTarget,
  Page1Config,
  ResidentInfo,
} from '../../types/journal';
import { BearCharacter } from './BearCharacter';
import {
  DraggableDesignWrapper,
  InlineEditableText,
  SnapLinesState,
} from './DecorLayer';

interface CoverSectionProps {
  resident: ResidentInfo;
  config: Page1Config;
  ageCategory: AgeCategory;
  designMode?: boolean;
  scaleFactor?: number;
  bearTransform?: CanvasObjectTransform;
  logoTransform?: CanvasObjectTransform;
  activeTarget?: EditorSectionTarget;
  activeTextField?: ActiveTextFieldTarget;
  onSelectTarget?: (target: EditorSectionTarget) => void;
  onSelectTextField?: (target: ActiveTextFieldTarget) => void;
  onUpdateTransform?: (blockId: string, next: CanvasObjectTransform) => void;
  onUpdateFields?: (patch: Partial<Page1Config>) => void;
  onSnapLinesChange?: (lines: SnapLinesState) => void;
  onInteractionStart?: () => void;
  onInteractionEnd?: () => void;
}

export function CoverSection({
  resident,
  config,
  ageCategory,
  designMode = false,
  scaleFactor = 1,
  bearTransform,
  logoTransform,
  activeTarget,
  activeTextField,
  onSelectTarget,
  onSelectTextField,
  onUpdateTransform,
  onSnapLinesChange,
  onInteractionStart,
  onInteractionEnd,
}: CoverSectionProps) {
  const isCoverActive = activeTarget?.page === 1 && activeTarget.block === 'cover';
  const isLogoActive = activeTarget?.page === 1 && activeTarget.block === 'logo';
  const isBearActive = activeTarget?.page === 1 && activeTarget.block === 'coverBear';

  const bearSizeMultiplier =
    ageCategory === '8-10' ? 1.03 : ageCategory === '14-15' ? 0.92 : 1;
  const boundedBearScale = Math.min(
    1.12,
    Math.max(0.75, (config.bearScale || 1) * bearSizeMultiplier)
  );

  const bubbleText =
    config.coverSpeechBubbleText !== undefined
      ? config.coverSpeechBubbleText
      : DEFAULT_SPEECH_BUBBLE_TEXT;
  const showSpeechBubble =
    config.showCoverBear &&
    (bubbleText.trim().length > 0 || Boolean(onSelectTextField));
  const isBubbleSelected =
    activeTextField?.page === 1 &&
    activeTextField.field === 'coverSpeechBubble';

  return (
    <header
      onClick={() => onSelectTarget?.({ page: 1, block: 'cover' })}
      style={{
        width: '794px',
        height: '316px',
      }}
      className={`relative px-[40px] pt-[24px] pb-[22px] shrink-0 overflow-visible ${
        onSelectTarget ? 'editable-block' : ''
      } ${isCoverActive ? 'editable-block-active' : ''}`}
    >
      {/* Smooth SVG wave cover backdrop at z-[1] so seam stars/stickers (z-[6]) sit cleanly on top of the cover plate */}
      <div className="pointer-events-none absolute inset-0 z-[1] overflow-visible">
        <svg
          aria-hidden="true"
          viewBox="0 0 794 328"
          width="794"
          height="328"
          preserveAspectRatio="none"
          className="block w-[794px] h-[328px]"
          fill="none"
        >
          <defs>
            <linearGradient
              id="cover-header-wave-grad"
              x1="0"
              y1="0"
              x2="794"
              y2="290"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor={config.coverBgStart} />
              <stop offset="100%" stopColor={config.coverBgEnd} />
            </linearGradient>
            <clipPath id="cover-wave-clip">
              <path d="M0 0H794V286C690 320 558 326 402 308C252 290 128 286 0 314V0Z" />
            </clipPath>
          </defs>
          <path
            d="M0 0H794V286C690 320 558 326 402 308C252 290 128 286 0 314V0Z"
            fill="url(#cover-header-wave-grad)"
          />
          <g clipPath="url(#cover-wave-clip)">
            <circle cx="550" cy="132" r="180" fill="#FFFFFF" opacity="0.24" />
          </g>
        </svg>
      </div>

      {/* Left Column: Fixed width 472px at z-[15] so text stays above cover backdrop and seam stars */}
      <div
        style={{ width: '472px', height: '270px' }}
        className="relative z-[15] flex flex-col justify-between shrink-0"
      >
        {/* Original KIBERone Logo (individually draggable in Design mode) */}
        <DraggableDesignWrapper
          id="logo"
          transform={logoTransform}
          designMode={designMode}
          scaleFactor={scaleFactor}
          isActive={isLogoActive}
          onSelect={
            onSelectTarget
              ? () => onSelectTarget({ page: 1, block: 'logo' })
              : undefined
          }
          onUpdateTransform={
            onUpdateTransform
              ? (next) => onUpdateTransform('logo', next)
              : undefined
          }
          onSnapLinesChange={onSnapLinesChange}
          onInteractionStart={onInteractionStart}
          onInteractionEnd={onInteractionEnd}
          className="self-start"
        >
          <div className="inline-flex bg-white rounded-lg p-[7px] shadow-[3px_3px_0_#18181B] border-[1.6px] border-[#18181B]">
            <img
              src={config.logoUrl}
              alt="KIBERone"
              referrerPolicy="no-referrer"
              className="h-[42px] w-auto object-contain block select-none"
            />
          </div>
        </DraggableDesignWrapper>

        {/* Title & Subtitle */}
        <div className="my-auto pt-[6px]">
          <InlineEditableText
            value={config.coverTitle}
            onSelectText={
              onSelectTextField
                ? () => onSelectTextField({ page: 1, field: 'coverTitle' })
                : undefined
            }
            isSelected={
              activeTextField?.page === 1 &&
              activeTextField.field === 'coverTitle'
            }
            as="h1"
            className={`font-journal-display font-black text-white leading-[0.96] tracking-tight block ${
              ageCategory === '14-15' ? 'text-[50px]' : 'text-[58px]'
            }`}
            style={{
              textShadow:
                '2px 0 0 #18181B, -2px 0 0 #18181B, 0 2px 0 #18181B, 0 -2px 0 #18181B, 2px 2px 0 #18181B, -2px 2px 0 #18181B, 2px -2px 0 #18181B, -2px -2px 0 #18181B, 4px 5px 0 rgba(24,24,27,0.85)',
            }}
          />
          <InlineEditableText
            value={config.coverSubtitle}
            onSelectText={
              onSelectTextField
                ? () => onSelectTextField({ page: 1, field: 'coverSubtitle' })
                : undefined
            }
            isSelected={
              activeTextField?.page === 1 &&
              activeTextField.field === 'coverSubtitle'
            }
            as="div"
            className="font-journal-display mt-[7px] text-[26px] font-extrabold text-[#111827] leading-tight block"
          />
        </div>

        {/* Metadata Block as crisp comic paper badge (location text removed) */}
        <div className="font-journal-body self-start bg-white/95 border-[1.6px] border-[#18181B] rounded-xl px-[12px] py-[7px] shadow-[3px_3px_0_#18181B] text-[12.5px] leading-[1.45] font-medium text-[#111827]">
          <div>
            <span className="font-bold">{resident.fullName}</span>
            {config.showAge && resident.age ? ` (${resident.age})` : ''}
            {resident.period ? ` | Период: ${resident.period}` : ''}
          </div>
          <div>
            Наставник: <span className="font-semibold">{resident.mentorName}</span>
          </div>
        </div>
      </div>

      {/* Comic Speech Bubble at Top Left of Cover Bear */}
      {showSpeechBubble && (
        <div
          onClick={(e) => {
            if (!onSelectTextField) return;
            e.stopPropagation();
            onSelectTextField({ page: 1, field: 'coverSpeechBubble' });
          }}
          style={{
            right: '264px',
            top: '16px',
            minWidth: '154px',
            maxWidth: '234px',
          }}
          className={`absolute z-[28] ${
            onSelectTextField
              ? 'pointer-events-auto cursor-pointer'
              : 'pointer-events-none'
          }`}
        >
          <div
            className={`relative bg-white border-[2.2px] border-[#18181B] rounded-2xl px-[15px] py-[10px] shadow-[3.5px_3.5px_0_#18181B] transition-shadow ${
              isBubbleSelected ? 'ring-2 ring-[#0D9488] ring-offset-2' : ''
            }`}
          >
            <p className="m-0 font-journal-display font-extrabold text-[15px] leading-[1.22] text-[#111827] text-center break-words">
              {bubbleText.trim() || 'Текст облачка…'}
            </p>

            {/* Seamless Comic Pointer Tail Pointing Right Toward Cover Bear */}
            <svg
              aria-hidden="true"
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              style={{ right: '-15px', bottom: '12px' }}
              className="pointer-events-none absolute"
            >
              <path d="M0 1.5 L16 10 L0 15 Z" fill="#FFFFFF" />
              <path
                d="M1.5 1.5 L16 10 L1.5 15"
                stroke="#18181B"
                strokeWidth="2.3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      )}

      {/* Right Column: KIBERone Bear Mascot strictly above cover wave and lower turquoise wave */}
      {config.showCoverBear && (
        <DraggableDesignWrapper
          id="coverBear"
          transform={bearTransform}
          defaultZIndex={25}
          designMode={designMode}
          scaleFactor={scaleFactor}
          isActive={isBearActive}
          onSelect={
            onSelectTarget
              ? () => onSelectTarget({ page: 1, block: 'coverBear' })
              : undefined
          }
          onUpdateTransform={
            onUpdateTransform
              ? (next) => onUpdateTransform('coverBear', next)
              : undefined
          }
          onSnapLinesChange={onSnapLinesChange}
          onInteractionStart={onInteractionStart}
          onInteractionEnd={onInteractionEnd}
          style={{
            position: 'absolute',
            right: '24px',
            bottom: '-8px',
            width: '246px',
            height: '296px',
          }}
          className="flex items-end justify-center overflow-visible"
        >
          <div className="w-[246px] h-[296px] flex items-end justify-center overflow-visible">
            <BearCharacter
              src={config.bearImageUrl}
              alt="Медведь KIBERone"
              scale={boundedBearScale}
              offsetX={config.bearOffsetX}
              offsetY={config.bearOffsetY}
              cropTop={false}
              className="w-[238px] h-[284px]"
            />
          </div>
        </DraggableDesignWrapper>
      )}
    </header>
  );
}
