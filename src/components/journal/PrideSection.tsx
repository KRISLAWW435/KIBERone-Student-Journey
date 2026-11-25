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
  const bearMultiplier = ageCategory === '8-10' ? 1.04 : ageCategory === '14-15' ? 0.96 : 1;

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
        className={`relative rounded-2xl px-[18px] pt-[20px] pb-[18px] flex flex-col justify-between overflow-hidden shrink-0 shadow-[0_8px_22px_rgba(255,138,117,0.34)] ${
          onSelectTarget ? 'editable-block' : ''
        } ${isPrideActive ? 'editable-block-active' : ''}`}
      >
        {/* Subtle radial highlight behind central bear */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-[43%] -translate-x-1/2 -translate-y-1/2 w-[264px] h-[264px] rounded-full bg-white/18 blur-[2px]"
        />

        {/* Celebratory fireworks, confetti, ribbons & stars around the bear */}
        {config.showPrideConfetti && ageCategory !== '14-15' && (
          <svg
            aria-hidden="true"
            viewBox="0 0 312 480"
            style={{ width: '312px', height: '480px' }}
            className="pointer-events-none absolute inset-x-0 top-[74px]"
            fill="none"
          >
            {/* Top-left firework burst */}
            <path d="M36 44L52 68" stroke="#18181B" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M62 28L68 56" stroke="#FACC15" strokeWidth="2.6" strokeLinecap="round" />
            <path d="M22 72L44 82" stroke="#38BDF8" strokeWidth="2.4" strokeLinecap="round" />
            <path d="M26 106C38 100 42 116 54 110" stroke="#38BDF8" strokeWidth="2.4" strokeLinecap="round" />
            <polygon points="34,54 44,50 40,61" fill="#A7F3D0" stroke="#18181B" strokeWidth="1.3" strokeLinejoin="round" />

            {/* Top-right firework burst */}
            <path d="M276 44L260 68" stroke="#18181B" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M250 28L244 56" stroke="#FACC15" strokeWidth="2.6" strokeLinecap="round" />
            <path d="M290 74L268 84" stroke="#5EEAD4" strokeWidth="2.4" strokeLinecap="round" />
            <path d="M258 96C268 90 274 106 286 100" stroke="#FACC15" strokeWidth="2.4" strokeLinecap="round" />
            <polygon points="274,56 283,64 270,66" fill="#FDE047" stroke="#18181B" strokeWidth="1.3" strokeLinejoin="round" />

            {/* Top center sparkle */}
            <path
              d="M156 12L160 22L170 25L160 28L156 38L152 28L142 25L152 22L156 12Z"
              fill="#FACC15"
              stroke="#18181B"
              strokeWidth="1.4"
              strokeLinejoin="round"
            />
            <path
              d="M104 34L106.5 40L113 42L106.5 44L104 50L101.5 44L95 42L101.5 40L104 34Z"
              fill="#FFFFFF"
              stroke="#18181B"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
            <path
              d="M210 32L212.5 38L219 40L212.5 42L210 48L207.5 42L201 40L207.5 38L210 32Z"
              fill="#FFFFFF"
              stroke="#18181B"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />

            {/* Side confetti & stars framing the bear */}
            <circle cx="28" cy="158" r="4.5" fill="#FACC15" stroke="#18181B" strokeWidth="1.3" />
            <circle cx="284" cy="148" r="4.5" fill="#5EEAD4" stroke="#18181B" strokeWidth="1.3" />
            <rect x="20" y="216" width="9" height="9" rx="2" transform="rotate(-18 20 216)" fill="#FFFFFF" stroke="#18181B" strokeWidth="1.3" />
            <rect x="280" y="206" width="9" height="9" rx="2" transform="rotate(22 280 206)" fill="#FDE047" stroke="#18181B" strokeWidth="1.3" />
            <path
              d="M34 274L37 281L44 283L37 285L34 292L31 285L24 283L31 281L34 274Z"
              fill="#5EEAD4"
              stroke="#18181B"
              strokeWidth="1.2"
            />
            <path
              d="M278 266L281 273L288 275L281 277L278 284L275 277L268 275L275 273L278 266Z"
              fill="#FACC15"
              stroke="#18181B"
              strokeWidth="1.2"
            />
            <path d="M22 328L34 316" stroke="#18181B" strokeWidth="1.7" strokeLinecap="round" />
            <path d="M290 324L278 314" stroke="#18181B" strokeWidth="1.7" strokeLinecap="round" />
          </svg>
        )}

        {/* Large Expressive Heading */}
        <div className="relative z-10 text-center shrink-0 px-[4px]">
          <h4 className="font-extrabold text-[24px] leading-[1.12] tracking-tight text-[#111827] drop-shadow-[0_1px_0_rgba(255,255,255,0.28)]">
            {config.prideTitle}
          </h4>
        </div>

        {/* Large Central Bear Mascot */}
        <div
          onClick={(e) => {
            if (!onSelectTarget) return;
            e.stopPropagation();
            onSelectTarget({ page: 2, block: 'prideBear' });
          }}
          className={`relative z-10 flex-1 flex items-center justify-center my-[4px] min-h-[260px] ${
            onSelectTarget ? 'editable-block rounded-xl' : ''
          } ${isBearActive ? 'editable-block-active' : ''}`}
        >
          <BearCharacter
            src={config.prideBearUrl}
            alt="Медведь KIBERone с наградой"
            scale={config.prideBearScale * bearMultiplier}
            offsetX={config.prideBearOffsetX}
            offsetY={config.prideBearOffsetY}
            className="w-[248px] h-[296px] drop-shadow-[0_14px_20px_rgba(17,24,39,0.24)]"
          />
        </div>

        {/* Crisp White Notebook-Style Plaque with Wavy Bottom Line */}
        {config.prideText && (
          <div className="relative z-10 shrink-0 pt-[4px]">
            {/* Small decorative sticker star on top of plaque */}
            <div
              aria-hidden="true"
              className="absolute -top-[7px] left-1/2 -translate-x-1/2 z-20 w-[24px] h-[24px] rounded-full bg-[#FACC15] border-[1.6px] border-[#18181B] flex items-center justify-center shadow-xs"
            >
              <svg viewBox="0 0 16 16" className="w-[12px] h-[12px]" fill="none">
                <path
                  d="M8 1.5L9.8 5.5L14 6.1L10.9 9L11.7 13.2L8 11.2L4.3 13.2L5.1 9L2 6.1L6.2 5.5L8 1.5Z"
                  fill="#18181B"
                />
              </svg>
            </div>

            <div className="relative bg-[#FFFDF9] border-[1.5px] border-[#18181B]/18 rounded-t-2xl rounded-b-lg shadow-[0_6px_16px_rgba(17,24,39,0.12)] overflow-hidden">
              {/* Subtle notebook rule accent */}
              <div className="px-[16px] pt-[18px] pb-[12px] text-center">
                <p className="m-0 text-[13.5px] leading-[1.42] font-semibold text-[#111827]">
                  {config.prideText}
                </p>
              </div>

              {/* Expressive Wavy Line at the bottom of the plaque */}
              <svg
                aria-hidden="true"
                viewBox="0 0 276 16"
                preserveAspectRatio="none"
                className="w-full h-[14px] block"
                fill="none"
              >
                <path
                  d="M0 7C11.5 2 23 2 34.5 7C46 12 57.5 12 69 7C80.5 2 92 2 103.5 7C115 12 126.5 12 138 7C149.5 2 161 2 172.5 7C184 12 195.5 12 207 7C218.5 2 230 2 241.5 7C253 12 264.5 12 276 7"
                  stroke="#0D9488"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                />
                <path
                  d="M0 11.5C11.5 6.5 23 6.5 34.5 11.5C46 16.5 57.5 16.5 69 11.5C80.5 6.5 92 6.5 103.5 11.5C115 16.5 126.5 16.5 138 11.5C149.5 6.5 161 6.5 172.5 11.5C184 16.5 195.5 16.5 207 11.5C218.5 6.5 230 6.5 241.5 11.5C253 16.5 264.5 16.5 276 11.5"
                  stroke="#FACC15"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  opacity="0.85"
                />
              </svg>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
