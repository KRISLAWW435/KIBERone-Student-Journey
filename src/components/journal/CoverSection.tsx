import React from 'react';
import { AgeCategory, EditorSectionTarget, Page1Config, ResidentInfo } from '../../types/journal';
import { BearCharacter } from './BearCharacter';

interface CoverSectionProps {
  resident: ResidentInfo;
  config: Page1Config;
  ageCategory: AgeCategory;
  activeTarget?: EditorSectionTarget;
  onSelectTarget?: (target: EditorSectionTarget) => void;
}

export function CoverSection({
  resident,
  config,
  ageCategory,
  activeTarget,
  onSelectTarget,
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
        height: '336px',
        background: `linear-gradient(110deg, ${config.coverBgStart} 0%, ${config.coverBgEnd} 100%)`,
      }}
      className={`relative px-[40px] pt-[30px] pb-[26px] shrink-0 overflow-hidden ${
        onSelectTarget ? 'editable-block' : ''
      } ${isCoverActive ? 'editable-block-active' : ''}`}
    >
      {/* Soft organic background shape matching reference */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-[48px] right-[64px] w-[360px] h-[360px] rounded-full opacity-25"
        style={{ backgroundColor: '#FFFFFF' }}
      />

      {/* Age 8-10 playful decorative stars */}
      {ageCategory === '8-10' && (
        <svg
          aria-hidden="true"
          viewBox="0 0 120 80"
          className="pointer-events-none absolute left-[355px] top-[24px] w-[96px] h-[64px] opacity-60"
          fill="none"
        >
          <path d="M20 10L23 18L31 21L23 24L20 32L17 24L9 21L17 18L20 10Z" stroke="#18181B" strokeWidth="1.5" />
          <path d="M72 34L74 39L79 41L74 43L72 48L70 43L65 41L70 39L72 34Z" stroke="#18181B" strokeWidth="1.4" />
        </svg>
      )}

      {/* Left Column: Fixed width 442px so text never touches the mascot */}
      <div
        style={{ width: '442px', height: '280px' }}
        className="relative z-10 flex flex-col justify-between shrink-0"
      >
        {/* Original KIBERone Logo (untouched aspect ratio & colors) */}
        <div
          onClick={(e) => {
            if (!onSelectTarget) return;
            e.stopPropagation();
            onSelectTarget({ page: 1, block: 'logo' });
          }}
          className={`inline-flex self-start bg-white rounded-md p-[8px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-black/10 ${
            onSelectTarget ? 'editable-block' : ''
          } ${isLogoActive ? 'editable-block-active' : ''}`}
        >
          <img
            src={config.logoUrl}
            alt="KIBERone"
            referrerPolicy="no-referrer"
            className="h-[46px] w-auto object-contain block select-none"
          />
        </div>

        {/* Title & Subtitle */}
        <div className="my-auto pt-[12px]">
          <h1
            className={`font-extrabold text-[#111827] leading-[0.98] tracking-tight ${
              ageCategory === '14-15' ? 'text-[48px]' : 'text-[54px]'
            }`}
            style={{ fontFamily: 'var(--font-journal)' }}
          >
            {config.coverTitle}
          </h1>
          <div className="mt-[6px] text-[24px] font-bold text-[#111827] leading-tight">
            {config.coverSubtitle}
          </div>
        </div>

        {/* Metadata Block */}
        <div className="text-[14px] leading-[1.45] font-medium text-[#111827]/90">
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

      {/* Right Column: KIBERone Bear Mascot locked with fixed coordinates & safe right gutter */}
      {config.showCoverBear && (
        <div
          onClick={(e) => {
            if (!onSelectTarget) return;
            e.stopPropagation();
            onSelectTarget({ page: 1, block: 'coverBear' });
          }}
          style={{
            position: 'absolute',
            right: '26px',
            bottom: '0px',
            width: '252px',
            height: '296px',
          }}
          className={`z-20 flex items-end justify-center overflow-hidden ${
            onSelectTarget ? 'editable-block rounded-xl' : ''
          } ${isBearActive ? 'editable-block-active' : ''}`}
        >
          <BearCharacter
            src={config.bearImageUrl}
            alt="Медведь KIBERone"
            scale={boundedBearScale}
            offsetX={config.bearOffsetX}
            offsetY={config.bearOffsetY}
            cropTop={config.bearCropTop}
            className="w-[238px] h-[284px] drop-shadow-[0_12px_18px_rgba(17,24,39,0.22)]"
          />
        </div>
      )}
    </header>
  );
}
