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

export const COVER_OBJECT_DEFAULTS = {
  logo: { x: 40, y: 24, width: 108, height: 58, zIndex: 22 },
  coverTitle: { x: 40, y: 104, width: 340, height: 58, zIndex: 22 },
  coverSubtitle: { x: 40, y: 170, width: 310, height: 32, zIndex: 22 },
  coverInfo: { x: 40, y: 234, width: 360, height: 54, zIndex: 24 },
  coverBubble: { x: 302, y: 14, width: 254, height: 74, zIndex: 28 },
  coverBear: { x: 524, y: 28, width: 246, height: 296, zIndex: 25 },
} as const;

interface CoverSectionProps {
  resident: ResidentInfo;
  config: Page1Config;
  ageCategory: AgeCategory;
  designMode?: boolean;
  scaleFactor?: number;
  titleTransform?: CanvasObjectTransform;
  subtitleTransform?: CanvasObjectTransform;
  infoTransform?: CanvasObjectTransform;
  bubbleTransform?: CanvasObjectTransform;
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
  titleTransform,
  subtitleTransform,
  infoTransform,
  bubbleTransform,
  bearTransform,
  logoTransform,
  activeTarget,
  activeTextField,
  onSelectTarget,
  onSelectTextField,
  onUpdateTransform,
  onUpdateFields,
  onSnapLinesChange,
  onInteractionStart,
  onInteractionEnd,
}: CoverSectionProps) {
  const isCoverActive = activeTarget?.page === 1 && activeTarget.block === 'cover';
  const isLogoActive = activeTarget?.page === 1 && activeTarget.block === 'logo';
  const isTitleActive =
    activeTarget?.page === 1 && activeTarget.block === 'coverTitle';
  const isSubtitleActive =
    activeTarget?.page === 1 && activeTarget.block === 'coverSubtitle';
  const isInfoActive =
    activeTarget?.page === 1 && activeTarget.block === 'coverInfo';
  const isBubbleActive =
    activeTarget?.page === 1 && activeTarget.block === 'coverBubble';
  const isBearActive = activeTarget?.page === 1 && activeTarget.block === 'coverBear';

  const bearSizeMultiplier =
    ageCategory === '6-8' || ageCategory === '8-10'
      ? 1.03
      : ageCategory === '12-14' || ageCategory === '14-15'
      ? 0.92
      : 1;
  const boundedBearScale = Math.min(
    1.12,
    Math.max(0.75, (config.bearScale || 1) * bearSizeMultiplier)
  );

  const resolvedTitleSize =
    config.coverTitleSize ??
    (ageCategory === '12-14' || ageCategory === '14-15' ? 50 : 58);
  const resolvedTitleColor = config.coverTitleColor || '#FFFFFF';
  const resolvedSubtitleSize = config.coverSubtitleSize ?? 26;
  const resolvedSubtitleColor = config.coverSubtitleColor || '#111827';

  const bubbleText =
    config.coverSpeechBubbleText !== undefined
      ? config.coverSpeechBubbleText
      : DEFAULT_SPEECH_BUBBLE_TEXT;
  const showSpeechBubble =
    config.showCoverBear &&
    (bubbleText.trim().length > 0 || Boolean(onSelectTextField) || Boolean(onSelectTarget));
  const resolvedBubbleFontSize = config.coverBubbleFontSize ?? 16.5;
  const resolvedBubbleTextColor = config.coverBubbleTextColor || '#111827';
  const resolvedBubbleBgColor = config.coverBubbleBgColor || '#FFFFFF';
  const isBubbleTextSelected =
    activeTextField?.page === 1 &&
    activeTextField.field === 'coverSpeechBubble';

  return (
    <header
      onClick={() => onSelectTarget?.({ page: 1, block: 'cover' })}
      style={{
        width: '794px',
        height: '316px',
      }}
      className={`relative shrink-0 overflow-visible ${
        onSelectTarget ? 'editable-block' : ''
      } ${isCoverActive ? 'editable-block-active' : ''}`}
    >
      {/* Smooth SVG wave cover backdrop at z-[1] so seam stars/stickers (z-[6..8]) sit cleanly on top of the cover plate */}
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

      {/* 1. Original KIBERone Logo (individually draggable & transformable) */}
      <DraggableDesignWrapper
        id="logo"
        transform={logoTransform}
        defaultZIndex={COVER_OBJECT_DEFAULTS.logo.zIndex}
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
        style={{
          position: 'absolute',
          left: `${COVER_OBJECT_DEFAULTS.logo.x}px`,
          top: `${COVER_OBJECT_DEFAULTS.logo.y}px`,
        }}
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

      {/* 2. Independent Editable Title: «МОЙ ПУТЬ» */}
      <DraggableDesignWrapper
        id="coverTitle"
        transform={titleTransform}
        defaultZIndex={COVER_OBJECT_DEFAULTS.coverTitle.zIndex}
        designMode={designMode}
        scaleFactor={scaleFactor}
        isActive={isTitleActive}
        onSelect={
          onSelectTarget
            ? () => onSelectTarget({ page: 1, block: 'coverTitle' })
            : undefined
        }
        onUpdateTransform={
          onUpdateTransform
            ? (next) => onUpdateTransform('coverTitle', next)
            : undefined
        }
        onSnapLinesChange={onSnapLinesChange}
        onInteractionStart={onInteractionStart}
        onInteractionEnd={onInteractionEnd}
        style={{
          position: 'absolute',
          left: `${COVER_OBJECT_DEFAULTS.coverTitle.x}px`,
          top: `${COVER_OBJECT_DEFAULTS.coverTitle.y}px`,
          maxWidth: '472px',
        }}
      >
        <InlineEditableText
          value={config.coverTitle}
          onChange={
            onUpdateFields
              ? (next) => onUpdateFields({ coverTitle: next })
              : undefined
          }
          inlineEditOnDoubleClick
          designMode={designMode}
          onSelectText={
            onSelectTextField
              ? () => onSelectTextField({ page: 1, field: 'coverTitle' })
              : undefined
          }
          onBeginEdit={onInteractionStart}
          onEndEdit={onInteractionEnd}
          isSelected={
            !designMode &&
            activeTextField?.page === 1 &&
            activeTextField.field === 'coverTitle'
          }
          as="h1"
          className="font-journal-display font-black leading-[0.96] tracking-tight block"
          style={{
            fontSize: `${resolvedTitleSize}px`,
            color: resolvedTitleColor,
            textShadow:
              '2px 0 0 #18181B, -2px 0 0 #18181B, 0 2px 0 #18181B, 0 -2px 0 #18181B, 2px 2px 0 #18181B, -2px 2px 0 #18181B, 2px -2px 0 #18181B, -2px -2px 0 #18181B, 4px 5px 0 rgba(24,24,27,0.85)',
          }}
        />
      </DraggableDesignWrapper>

      {/* 3. Independent Editable Subtitle: «в мире технологий» */}
      <DraggableDesignWrapper
        id="coverSubtitle"
        transform={subtitleTransform}
        defaultZIndex={COVER_OBJECT_DEFAULTS.coverSubtitle.zIndex}
        designMode={designMode}
        scaleFactor={scaleFactor}
        isActive={isSubtitleActive}
        onSelect={
          onSelectTarget
            ? () => onSelectTarget({ page: 1, block: 'coverSubtitle' })
            : undefined
        }
        onUpdateTransform={
          onUpdateTransform
            ? (next) => onUpdateTransform('coverSubtitle', next)
            : undefined
        }
        onSnapLinesChange={onSnapLinesChange}
        onInteractionStart={onInteractionStart}
        onInteractionEnd={onInteractionEnd}
        style={{
          position: 'absolute',
          left: `${COVER_OBJECT_DEFAULTS.coverSubtitle.x}px`,
          top: `${COVER_OBJECT_DEFAULTS.coverSubtitle.y}px`,
          maxWidth: '472px',
        }}
      >
        <InlineEditableText
          value={config.coverSubtitle}
          onChange={
            onUpdateFields
              ? (next) => onUpdateFields({ coverSubtitle: next })
              : undefined
          }
          inlineEditOnDoubleClick
          designMode={designMode}
          onSelectText={
            onSelectTextField
              ? () => onSelectTextField({ page: 1, field: 'coverSubtitle' })
              : undefined
          }
          onBeginEdit={onInteractionStart}
          onEndEdit={onInteractionEnd}
          isSelected={
            !designMode &&
            activeTextField?.page === 1 &&
            activeTextField.field === 'coverSubtitle'
          }
          as="div"
          className="font-journal-display font-extrabold leading-tight block"
          style={{
            fontSize: `${resolvedSubtitleSize}px`,
            color: resolvedSubtitleColor,
          }}
        />
      </DraggableDesignWrapper>

      {/* 4. Independent Transformable Student Metadata Plaque (Имя, Период, Наставник) */}
      <DraggableDesignWrapper
        id="coverInfo"
        transform={infoTransform}
        defaultZIndex={COVER_OBJECT_DEFAULTS.coverInfo.zIndex}
        designMode={designMode}
        scaleFactor={scaleFactor}
        isActive={isInfoActive}
        onSelect={
          onSelectTarget
            ? () => onSelectTarget({ page: 1, block: 'coverInfo' })
            : undefined
        }
        onUpdateTransform={
          onUpdateTransform
            ? (next) => onUpdateTransform('coverInfo', next)
            : undefined
        }
        onSnapLinesChange={onSnapLinesChange}
        onInteractionStart={onInteractionStart}
        onInteractionEnd={onInteractionEnd}
        style={{
          position: 'absolute',
          left: `${COVER_OBJECT_DEFAULTS.coverInfo.x}px`,
          top: `${COVER_OBJECT_DEFAULTS.coverInfo.y}px`,
          maxWidth: '472px',
        }}
      >
        <div
          className={`font-journal-body h-full w-full bg-white/95 border-[1.6px] border-[#18181B] rounded-xl px-[12px] py-[7px] shadow-[3px_3px_0_#18181B] text-[12.5px] leading-[1.45] font-medium text-[#111827] flex flex-col justify-center ${
            !designMode && isInfoActive ? 'ring-2 ring-[#0D9488] ring-offset-1' : ''
          }`}
        >
          <div>
            <span className="font-bold">{resident.fullName}</span>
            {config.showAge && resident.age ? ` (${resident.age})` : ''}
            {resident.period ? ` | Период: ${resident.period}` : ''}
          </div>
          <div>
            Наставник: <span className="font-semibold">{resident.mentorName}</span>
          </div>
        </div>
      </DraggableDesignWrapper>

      {/* 5. Independent Transformable & Rotatable Comic Speech Bubble (shifted right & enlarged by default) */}
      {showSpeechBubble && (
        <DraggableDesignWrapper
          id="coverBubble"
          transform={bubbleTransform}
          defaultZIndex={COVER_OBJECT_DEFAULTS.coverBubble.zIndex}
          designMode={designMode}
          scaleFactor={scaleFactor}
          isActive={isBubbleActive}
          onSelect={
            onSelectTarget
              ? () => {
                  onSelectTarget({ page: 1, block: 'coverBubble' });
                }
              : undefined
          }
          onUpdateTransform={
            onUpdateTransform
              ? (next) => onUpdateTransform('coverBubble', next)
              : undefined
          }
          onSnapLinesChange={onSnapLinesChange}
          onInteractionStart={onInteractionStart}
          onInteractionEnd={onInteractionEnd}
          style={{
            position: 'absolute',
            left: `${COVER_OBJECT_DEFAULTS.coverBubble.x}px`,
            top: `${COVER_OBJECT_DEFAULTS.coverBubble.y}px`,
            width: `${COVER_OBJECT_DEFAULTS.coverBubble.width}px`,
          }}
        >
          <div
            style={{ backgroundColor: resolvedBubbleBgColor }}
            className={`relative h-full w-full min-h-[72px] border-[2.2px] border-[#18181B] rounded-2xl px-[18px] py-[12px] shadow-[3.5px_3.5px_0_#18181B] transition-shadow flex items-center justify-center ${
              !designMode && (isBubbleTextSelected || isBubbleActive)
                ? 'ring-2 ring-[#0D9488] ring-offset-2'
                : ''
            }`}
          >
            <InlineEditableText
              as="p"
              multiline
              inlineEditOnDoubleClick
              designMode={designMode}
              value={bubbleText}
              placeholder="Текст облачка…"
              onChange={
                onUpdateFields
                  ? (next) => onUpdateFields({ coverSpeechBubbleText: next })
                  : undefined
              }
              onSelectText={
                onSelectTextField
                  ? () =>
                      onSelectTextField({ page: 1, field: 'coverSpeechBubble' })
                  : undefined
              }
              onBeginEdit={onInteractionStart}
              onEndEdit={onInteractionEnd}
              className="m-0 w-full font-journal-display font-extrabold leading-[1.2] text-center break-words"
              style={{
                fontSize: `${resolvedBubbleFontSize}px`,
                color: resolvedBubbleTextColor,
              }}
            />

            {/* Seamless Comic Pointer Tail Pointing Right Toward Cover Bear */}
            <svg
              aria-hidden="true"
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              style={{ right: '-15px', bottom: '14px' }}
              className="pointer-events-none absolute"
            >
              <path d="M0 1.5 L16 10 L0 15 Z" fill={resolvedBubbleBgColor} />
              <path
                d="M1.5 1.5 L16 10 L1.5 15"
                stroke="#18181B"
                strokeWidth="2.3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </DraggableDesignWrapper>
      )}

      {/* 6. Right Column: KIBERone Bear Mascot strictly above cover wave and lower turquoise wave */}
      {config.showCoverBear && (
        <DraggableDesignWrapper
          id="coverBear"
          transform={bearTransform}
          defaultZIndex={COVER_OBJECT_DEFAULTS.coverBear.zIndex}
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
