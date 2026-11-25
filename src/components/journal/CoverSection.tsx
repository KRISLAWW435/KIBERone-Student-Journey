import React from 'react';
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

  return (
    <header
      onClick={() => onSelectTarget?.({ page: 1, block: 'cover' })}
      style={{
        width: '794px',
        height: '316px',
        background: `linear-gradient(110deg, ${config.coverBgStart} 0%, ${config.coverBgEnd} 100%)`,
      }}
      className={`relative px-[40px] pt-[24px] pb-[22px] shrink-0 overflow-visible ${
        onSelectTarget ? 'editable-block' : ''
      } ${isCoverActive ? 'editable-block-active' : ''}`}
    >
      {/* Clean clipped backdrop */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute -top-[48px] right-[64px] w-[360px] h-[360px] rounded-full opacity-25"
          style={{ backgroundColor: '#FFFFFF' }}
        />
      </div>

      {/* Left Column: Fixed width 442px so text never touches the mascot */}
      <div
        style={{ width: '442px', height: '270px' }}
        className="relative flex flex-col justify-between shrink-0"
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
          <div className="inline-flex bg-white rounded-md p-[8px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-black/10">
            <img
              src={config.logoUrl}
              alt="KIBERone"
              referrerPolicy="no-referrer"
              className="h-[44px] w-auto object-contain block select-none"
            />
          </div>
        </DraggableDesignWrapper>

        {/* Title & Subtitle */}
        <div className="my-auto pt-[8px]">
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
            className={`font-extrabold text-[#111827] leading-[0.98] tracking-tight block ${
              ageCategory === '14-15' ? 'text-[46px]' : 'text-[52px]'
            }`}
            style={{ fontFamily: 'var(--font-journal)' }}
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
            className="mt-[6px] text-[23px] font-bold text-[#111827] leading-tight block"
          />
        </div>

        {/* Metadata Block */}
        <div className="text-[13.5px] leading-[1.4] font-medium text-[#111827]/90">
          <div>
            <span className="font-semibold">{resident.fullName}</span>
            {config.showAge && resident.age ? ` (${resident.age})` : ''}
            {resident.period ? ` | Период: ${resident.period}` : ''}
          </div>
          <div>
            Наставник: <span className="font-semibold">{resident.mentorName}</span>
            {config.showBranch && resident.branch ? ` · ${resident.branch}` : ''}
          </div>
        </div>
      </div>

      {/* Right Column: KIBERone Bear Mascot (individually draggable & layerable) */}
      {config.showCoverBear && (
        <DraggableDesignWrapper
          id="coverBear"
          transform={bearTransform}
          defaultZIndex={20}
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
            right: '26px',
            bottom: '0px',
            width: '246px',
            height: '282px',
          }}
          className="flex items-end justify-center"
        >
          <div className="w-[246px] h-[282px] flex items-end justify-center overflow-hidden rounded-xl">
            <BearCharacter
              src={config.bearImageUrl}
              alt="Медведь KIBERone"
              scale={boundedBearScale}
              offsetX={config.bearOffsetX}
              offsetY={config.bearOffsetY}
              cropTop={config.bearCropTop}
              className="w-[232px] h-[272px] drop-shadow-[0_12px_18px_rgba(17,24,39,0.22)]"
            />
          </div>
        </DraggableDesignWrapper>
      )}
    </header>
  );
}
