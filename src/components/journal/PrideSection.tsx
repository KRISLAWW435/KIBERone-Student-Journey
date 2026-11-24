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
  const bearMultiplier = ageCategory === '8-10' ? 1.06 : ageCategory === '14-15' ? 0.92 : 1;

  return (
    <section className="flex flex-col h-full">
      <h3 className="font-extrabold text-[17px] tracking-tight uppercase text-[#111827] mb-2.5">
        МОЙ МОМЕНТ ГОРДОСТИ
      </h3>

      <div
        onClick={(e) => {
          if (!onSelectTarget) return;
          e.stopPropagation();
          onSelectTarget({ page: 2, block: 'pride' });
        }}
        style={{ backgroundColor: config.prideBgColor }}
        className={`relative flex-1 rounded-2xl p-4 flex flex-col justify-between overflow-hidden shadow-[0_6px_18px_rgba(255,138,117,0.3)] ${
          onSelectTarget ? 'editable-block' : ''
        } ${isPrideActive ? 'editable-block-active' : ''}`}
      >
        {/* Celebratory confetti/sparkle doodles matching reference */}
        {config.showPrideConfetti && ageCategory !== '14-15' && (
          <svg
            aria-hidden="true"
            viewBox="0 0 260 220"
            className="pointer-events-none absolute inset-x-0 top-14 w-full h-48 opacity-80"
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

        {/* Heading + Personal Achievement Text */}
        <div className="relative z-10 text-center">
          <h4 className="font-extrabold text-[19px] leading-[1.15] text-[#111827]">
            {config.prideTitle}
          </h4>
          {config.prideText && (
            <div className="mt-2.5 bg-white/88 backdrop-blur-[2px] border border-black/10 rounded-xl px-3 py-2 text-[11.5px] leading-[1.38] font-medium text-[#111827] shadow-sm">
              {config.prideText}
            </div>
          )}
        </div>

        {/* Trophy Bear Mascot */}
        <div
          onClick={(e) => {
            if (!onSelectTarget) return;
            e.stopPropagation();
            onSelectTarget({ page: 2, block: 'prideBear' });
          }}
          className={`relative z-10 flex items-end justify-center mt-2 h-[290px] ${
            onSelectTarget ? 'editable-block rounded-xl' : ''
          } ${isBearActive ? 'editable-block-active' : ''}`}
        >
          <BearCharacter
            src={config.prideBearUrl}
            alt="Медведь KIBERone с наградой"
            scale={config.prideBearScale * bearMultiplier}
            offsetX={config.prideBearOffsetX}
            offsetY={config.prideBearOffsetY}
            className="w-[248px] h-[288px] drop-shadow-[0_12px_18px_rgba(17,24,39,0.24)]"
          />
        </div>
      </div>
    </section>
  );
}
