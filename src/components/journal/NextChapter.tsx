import React from 'react';
import { ASSETS } from '../../data/presets';
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
import { NextTopicLineIcon } from './JournalArtwork';

interface NextChapterProps {
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
  onUpdateTitle?: (next: string) => void;
  onUpdateTopicTitle?: (topicId: string, next: string) => void;
  onSnapLinesChange?: (lines: SnapLinesState) => void;
  onInteractionStart?: () => void;
  onInteractionEnd?: () => void;
}

const PIN_COLORS = ['#4ECDC4', '#FFD426', '#F87B72'];

function MapPinMarker({ color }: { color: string }) {
  return (
    <svg
      width="34"
      height="44"
      viewBox="0 0 24 32"
      fill="none"
      className="shrink-0 drop-shadow-[0_3px_4px_rgba(17,24,39,0.28)]"
    >
      <path
        d="M12 1.5C6.2 1.5 1.5 6.2 1.5 12C1.5 19.6 12 30.5 12 30.5C12 30.5 22.5 19.6 22.5 12C22.5 6.2 17.8 1.5 12 1.5Z"
        fill={color}
        stroke="#18181B"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <circle
        cx="12"
        cy="11.5"
        r="4.2"
        fill="#FFFFFF"
        stroke="#18181B"
        strokeWidth="1.5"
      />
    </svg>
  );
}

export function NextChapter({
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
}: NextChapterProps) {
  const { nextChapter } = config;
  const isActive =
    activeTarget?.page === 2 && activeTarget.block === 'nextChapter';
  const isBearActive =
    activeTarget?.page === 2 && activeTarget.block === 'nextBear';

  const topics = nextChapter.topics.slice(0, 3);

  // Exact (centerX, pinTipY) coordinates lying directly on the winding road centerline
  const stationPositions =
    topics.length <= 2
      ? [
          { centerX: 185, pinTipY: 212 },
          { centerX: 415, pinTipY: 158 },
        ]
      : [
          { centerX: 149, pinTipY: 224 },
          { centerX: 336, pinTipY: 178 },
          { centerX: 478, pinTipY: 144 },
        ];

  return (
    <section
      style={{ width: '794px', height: '266px' }}
      className="relative shrink-0 overflow-visible"
    >
      <div
        onClick={(e) => {
          if (!onSelectTarget) return;
          e.stopPropagation();
          onSelectTarget({ page: 2, block: 'nextChapter' });
        }}
        style={{ width: '794px', height: '266px' }}
        className={`relative overflow-visible ${
          onSelectTarget ? 'editable-block' : ''
        } ${isActive ? 'editable-block-active' : ''}`}
      >
        {/* Open Winding Road, Meadow Hill & Isometric 3D Figures Seated Cleanly on Green Grass */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <svg
            aria-hidden="true"
            width="794"
            height="266"
            viewBox="0 0 794 266"
            fill="none"
            className="w-full h-full"
          >
            <defs>
              <linearGradient
                id="next-meadow-grad"
                x1="0"
                y1="70"
                x2="794"
                y2="266"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%" stopColor="#86EFAC" />
                <stop offset="55%" stopColor="#4ADE80" />
                <stop offset="100%" stopColor="#22C55E" />
              </linearGradient>
              <filter id="iso-shadow" x="-20%" y="-20%" width="140%" height="150%">
                <feDropShadow
                  dx="0"
                  dy="3"
                  stdDeviation="2"
                  floodColor="#111827"
                  floodOpacity="0.22"
                />
              </filter>
            </defs>

            {/* Open Curved Green Meadow Terrain (No Container Box) */}
            <path
              d="M0 174 C 180 124, 470 52, 794 78 V266 H0 Z"
              fill="url(#next-meadow-grad)"
            />

            {/* Subtle Sunlit Meadow Highlight */}
            <path
              d="M0 206 C 195 164, 450 108, 794 122 V266 H0 Z"
              fill="#FFFFFF"
              opacity="0.12"
            />

            {/* Playful Purple Corner Hill Accent under Bear (Right Corner) */}
            <path
              d="M 554 266 C 598 202, 690 156, 794 142 V266 H554 Z"
              fill="#8B5CF6"
            />

            {/* Road Comic Dark Outer Edge */}
            <path
              d="M 58 278 C 145 204, 240 206, 336 178 C 420 154, 570 124, 804 82"
              stroke="#18181B"
              strokeWidth="44"
              strokeLinecap="round"
            />

            {/* Road Crisp White Outer Shoulders */}
            <path
              d="M 58 278 C 145 204, 240 206, 336 178 C 420 154, 570 124, 804 82"
              stroke="#FFFFFF"
              strokeWidth="39"
              strokeLinecap="round"
            />

            {/* Dark Slate Gray Asphalt Surface */}
            <path
              d="M 58 278 C 145 204, 240 206, 336 178 C 420 154, 570 124, 804 82"
              stroke="#475569"
              strokeWidth="32"
              strokeLinecap="round"
            />

            {/* White Dashed Road Centerline */}
            <path
              d="M 58 278 C 145 204, 240 206, 336 178 C 420 154, 570 124, 804 82"
              stroke="#FFFFFF"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray="11 9"
            />

            {/* ISOMETRIC 3D FIGURE 1: Red Cube + Small Yellow Cube Seated Inside Left Green Meadow (x=12..66, y=188..244) */}
            <g filter="url(#iso-shadow)">
              {/* Red Isometric Cube */}
              <polygon
                points="46,188 64,197 46,206 28,197"
                fill="#FDA4AF"
                stroke="#18181B"
                strokeWidth="1.4"
                strokeLinejoin="round"
              />
              <polygon
                points="28,197 46,206 46,227 28,218"
                fill="#FB7185"
                stroke="#18181B"
                strokeWidth="1.4"
                strokeLinejoin="round"
              />
              <polygon
                points="64,197 46,206 46,227 64,218"
                fill="#E11D48"
                stroke="#18181B"
                strokeWidth="1.4"
                strokeLinejoin="round"
              />

              {/* Small Yellow Isometric Cube */}
              <polygon
                points="23,220 34,225 23,230 12,225"
                fill="#FEF08A"
                stroke="#18181B"
                strokeWidth="1.3"
                strokeLinejoin="round"
              />
              <polygon
                points="12,225 23,230 23,244 12,239"
                fill="#FACC15"
                stroke="#18181B"
                strokeWidth="1.3"
                strokeLinejoin="round"
              />
              <polygon
                points="34,225 23,230 23,244 34,239"
                fill="#EAB308"
                stroke="#18181B"
                strokeWidth="1.3"
                strokeLinejoin="round"
              />
            </g>

            {/* ISOMETRIC 3D FIGURE 2: Twin Blue 3D Pillars Seated Inside Mid-Bottom Green Grass (x=336..378, y=208..254) */}
            <g filter="url(#iso-shadow)">
              {/* Tall Blue Pillar */}
              <polygon
                points="348,208 361,214 348,220 335,214"
                fill="#93C5FD"
                stroke="#18181B"
                strokeWidth="1.4"
                strokeLinejoin="round"
              />
              <polygon
                points="335,214 348,220 348,250 335,244"
                fill="#60A5FA"
                stroke="#18181B"
                strokeWidth="1.4"
                strokeLinejoin="round"
              />
              <polygon
                points="361,214 348,220 348,250 361,244"
                fill="#2563EB"
                stroke="#18181B"
                strokeWidth="1.4"
                strokeLinejoin="round"
              />

              {/* Shorter Front Blue Cube */}
              <polygon
                points="364,224 377,230 364,236 351,230"
                fill="#BFDBFE"
                stroke="#18181B"
                strokeWidth="1.4"
                strokeLinejoin="round"
              />
              <polygon
                points="351,230 364,236 364,254 351,248"
                fill="#60A5FA"
                stroke="#18181B"
                strokeWidth="1.4"
                strokeLinejoin="round"
              />
              <polygon
                points="377,230 364,236 364,254 377,248"
                fill="#3B82F6"
                stroke="#18181B"
                strokeWidth="1.4"
                strokeLinejoin="round"
              />
            </g>

            {/* ISOMETRIC 3D FIGURE 3: Yellow L-Step Block Seated Inside Green Grass Below Road (x=432..474, y=198..246) */}
            <g filter="url(#iso-shadow)">
              <polygon
                points="446,198 459,204 446,210 433,204"
                fill="#FEF08A"
                stroke="#18181B"
                strokeWidth="1.4"
                strokeLinejoin="round"
              />
              <polygon
                points="433,204 446,210 446,236 433,230"
                fill="#FACC15"
                stroke="#18181B"
                strokeWidth="1.4"
                strokeLinejoin="round"
              />
              <polygon
                points="459,204 446,210 446,236 459,230"
                fill="#CA8A04"
                stroke="#18181B"
                strokeWidth="1.4"
                strokeLinejoin="round"
              />

              <polygon
                points="461,216 474,222 461,228 448,222"
                fill="#FEF08A"
                stroke="#18181B"
                strokeWidth="1.4"
                strokeLinejoin="round"
              />
              <polygon
                points="448,222 461,228 461,246 448,240"
                fill="#FDE047"
                stroke="#18181B"
                strokeWidth="1.4"
                strokeLinejoin="round"
              />
              <polygon
                points="474,222 461,228 461,246 474,240"
                fill="#EAB308"
                stroke="#18181B"
                strokeWidth="1.4"
                strokeLinejoin="round"
              />
            </g>

            {/* ISOMETRIC 3D FIGURE 4: Teal Pyramid Seated Inside Green Grass (x=514..548, y=178..216) */}
            <g filter="url(#iso-shadow)">
              <polygon
                points="531,178 514,209 531,216"
                fill="#5EEAD4"
                stroke="#18181B"
                strokeWidth="1.4"
                strokeLinejoin="round"
              />
              <polygon
                points="531,178 548,209 531,216"
                fill="#0D9488"
                stroke="#18181B"
                strokeWidth="1.4"
                strokeLinejoin="round"
              />
            </g>
          </svg>
        </div>

        {/* Expressive Heading Directly Over Open Background */}
        <div
          style={{ left: '40px', top: '2px', maxWidth: '340px' }}
          className="absolute z-10"
        >
          <InlineEditableText
            value={nextChapter.title || 'ЧТО ИНТЕРЕСНОГО ВПЕРЕДИ?'}
            onSelectText={
              onSelectTextField
                ? () =>
                    onSelectTextField({
                      page: 2,
                      field: 'nextChapterTitle',
                    })
                : undefined
            }
            isSelected={
              activeTextField?.page === 2 &&
              activeTextField.field === 'nextChapterTitle'
            }
            as="h3"
            className="font-journal-display font-black text-[19px] leading-[1.08] tracking-tight uppercase text-[#111827] block"
          />
        </div>

        {/* Vertically Aligned Road Stations: [Module Icon] -> [High-Contrast Label] -> [Large Pin] */}
        {topics.map((topic, idx) => {
          const pos = stationPositions[idx] || stationPositions[0];
          const pinColor = PIN_COLORS[idx % PIN_COLORS.length];

          return (
            <div
              key={topic.id}
              style={{
                left: `${pos.centerX}px`,
                top: `${pos.pinTipY}px`,
                transform: 'translate(-50%, -100%)',
                width: '138px',
              }}
              className="absolute z-20 flex flex-col items-center text-center gap-[5px]"
            >
              {/* 1. Module Sticker Icon Centered Above Pin */}
              <div className="w-[48px] h-[48px] rounded-full bg-white border-[2px] border-[#18181B] ring-[2.5px] ring-white shadow-[0_5px_11px_rgba(17,24,39,0.22)] flex items-center justify-center shrink-0">
                <NextTopicLineIcon
                  type={topic.iconKey}
                  className="w-[29px] h-[29px]"
                />
              </div>

              {/* 2. High-Contrast Readable Label Pill Strictly Between Icon and Pin */}
              <div className="bg-white/95 border-[1.6px] border-[#18181B] rounded-lg px-[8px] py-[3px] shadow-[2px_2px_0_#18181B] max-w-[136px]">
                <InlineEditableText
                  value={topic.title}
                  onSelectText={
                    onSelectTextField
                      ? () =>
                          onSelectTextField({
                            page: 2,
                            field: 'nextTopicTitle',
                            itemId: topic.id,
                          })
                      : undefined
                  }
                  isSelected={
                    activeTextField?.page === 2 &&
                    activeTextField.field === 'nextTopicTitle' &&
                    activeTextField.itemId === topic.id
                  }
                  as="span"
                  className="font-journal-display text-[12px] font-extrabold leading-[1.15] text-[#111827] block"
                />
              </div>

              {/* 3. Large Map Pin Anchored Directly on Road Centerline */}
              <div className="pointer-events-none shrink-0 leading-none">
                <MapPinMarker color={pinColor} />
              </div>
            </div>
          );
        })}

        {/* Full-Body VR Bear Mascot Standing Cleanly on Right Meadow / Grass */}
        <DraggableDesignWrapper
          id="nextBear"
          transform={bearTransform}
          defaultZIndex={25}
          designMode={designMode}
          scaleFactor={scaleFactor}
          isActive={isBearActive}
          onSelect={
            onSelectTarget
              ? () => onSelectTarget({ page: 2, block: 'nextBear' })
              : undefined
          }
          onUpdateTransform={
            onUpdateTransform
              ? (next) => onUpdateTransform('nextBear', next)
              : undefined
          }
          onSnapLinesChange={onSnapLinesChange}
          onInteractionStart={onInteractionStart}
          onInteractionEnd={onInteractionEnd}
          style={{
            position: 'absolute',
            right: '14px',
            bottom: '8px',
            width: '184px',
            height: '226px',
          }}
          className="flex items-end justify-center"
        >
          <div
            style={{ width: '184px', height: '226px' }}
            className="flex items-end justify-center"
          >
            <BearCharacter
              src={
                !nextChapter.bearUrl ||
                nextChapter.bearUrl === '/assets/bear_vr.png'
                  ? ASSETS.bearVr
                  : nextChapter.bearUrl
              }
              alt="Медведь KIBERone в VR-очках приглашает к новому этапу"
              scale={
                (ageCategory === '6-8' || ageCategory === '8-10' ? 1.02 : 0.98) *
                nextChapter.bearScale
              }
              offsetX={nextChapter.bearOffsetX}
              offsetY={nextChapter.bearOffsetY}
              cropTop={false}
              className="w-[180px] h-[222px]"
            />
          </div>
        </DraggableDesignWrapper>
      </div>
    </section>
  );
}
