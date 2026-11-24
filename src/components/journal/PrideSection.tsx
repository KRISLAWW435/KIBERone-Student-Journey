import React from 'react';
import { AgeCategory, EditorSectionTarget, Page2Config } from '../../types/journal';
import { BearCharacter } from './BearCharacter';

interface PrideSectionProps {
  config: Page2Config;
  ageCategory: AgeCategory;
  activeTarget?: EditorSectionTarget;
  onSelectTarget?: (target: EditorSectionTarget) => void;
}

export function PrideSection({
  config,
  ageCategory,
  activeTarget,
  onSelectTarget,
}: PrideSectionProps) {
  const isPrideActive = activeTarget?.page === 2 && activeTarget.block === 'pride';
  const isBearActive = activeTarget?.page === 2 && activeTarget.block === 'prideBear';
  const bearMultiplier = ageCategory === '8-10' ? 1.04 : ageCategory === '14-15' ? 0.94 : 1;

  return (
    <section
      style={{ width: '312px', height: '763px' }}
      className="flex flex-col shrink-0"
    >
      <h3 className="font-extrabold text-[17px] leading-[24px] tracking-tight uppercase text-[#111827] mb-[10px] shrink-0">
        МОЙ МОМЕНТ ГОРДОСТИ
      </h3>

      <div
        onClick={(e) => {
          if (!onSelectTarget) return;
          e.stopPropagation();
          onSelectTarget({ page: 2, block: 'pride' });
        }}
        style={{
          width: '312px',
          height: '729px',
          backgroundColor: config.prideBgColor,
        }}
        className={`relative rounded-2xl p-[18px] flex flex-col justify-between overflow-hidden shrink-0 shadow-[0_6px_18px_rgba(255,138,117,0.3)] ${
          onSelectTarget ? 'editable-block' : ''
        } ${isPrideActive ? 'editable-block-active' : ''}`}
      >
        {/* Celebratory confetti/sparkle doodles matching reference */}
        {config.showPrideConfetti && ageCategory !== '14-15' && (
          <svg
            aria-hidden="true"
            viewBox="0 0 260 220"
            style={{ width: '276px', height: '190px' }}
            className="pointer-events-none absolute left-[18px] top-[56px] opacity-80"
            fill="none"
          >
            <path d="M24 22L36 44" stroke="#18181B" strokeWidth="1.6" strokeLinecap="round" />
            <path d="M52 14L55 34" stroke="#FACC15" strokeWidth="2.2" strokeLinecap="round" />
            <path d="M214 18L202 42" stroke="#18181B" strokeWidth="1.6" strokeLinecap="round" />
            <path d="M238 28L222 48" stroke="#38BDF8" strokeWidth="2.2" strokeLinecap="round" />
            <path
              d="M132 10L135 16L141 18L135 20L132 26L129 20L123 18L129 16L132 10Z"
              fill="#FACC15"
              stroke="#18181B"
              strokeWidth="1.2"
            />
            <path
              d="M22 76C32 72 34 86 44 82"
              stroke="#38BDF8"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
            <circle cx="24" cy="112" r="3" fill="#FACC15" stroke="#18181B" strokeWidth="1" />
            <circle cx="236" cy="96" r="3" fill="#A7F3D0" stroke="#18181B" strokeWidth="1" />
          </svg>
        )}

        {/* Heading + Enlarged, Expressive Achievement Text */}
        <div className="relative z-10 text-center shrink-0">
          <h4 className="font-extrabold text-[20px] leading-[1.15] text-[#111827]">
            {config.prideTitle}
          </h4>
          {config.prideText && (
            <div className="mt-[14px] bg-white/95 border border-black/12 rounded-xl px-[16px] py-[14px] text-[14.5px] leading-[1.45] font-semibold text-[#111827] shadow-[0_3px_10px_rgba(0,0,0,0.06)]">
              {config.prideText}
            </div>
          )}
        </div>

        {/* Smaller Trophy Bear Mascot leaving room for achievement copy */}
        <div
          onClick={(e) => {
            if (!onSelectTarget) return;
            e.stopPropagation();
            onSelectTarget({ page: 2, block: 'prideBear' });
          }}
          style={{ width: '276px', height: '214px' }}
          className={`relative z-10 flex items-end justify-center mt-[8px] shrink-0 ${
            onSelectTarget ? 'editable-block rounded-xl' : ''
          } ${isBearActive ? 'editable-block-active' : ''}`}
        >
          <BearCharacter
            src={config.prideBearUrl}
            alt="Медведь KIBERone с наградой"
            scale={config.prideBearScale * bearMultiplier}
            offsetX={config.prideBearOffsetX}
            offsetY={config.prideBearOffsetY}
            className="w-[186px] h-[210px] drop-shadow-[0_12px_18px_rgba(17,24,39,0.24)]"
          />
        </div>
      </div>
    </section>
  );
}
