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
      width="24"
      height="32"
      viewBox="0 0 24 32"
      fill="none"
      className="shrink-0 drop-shadow-[0_2px_3px_rgba(17,24,39,0.22)]"
    >
      <path
        d="M12 1.5C6.2 1.5 1.5 6.2 1.5 12C1.5 19.6 12 30.5 12 30.5C12 30.5 22.5 19.6 22.5 12C22.5 6.2 17.8 1.5 12 1.5Z"
        fill={color}
        stroke="#18181B"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle
        cx="12"
        cy="11.5"
        r="4"
        fill="#FFFFFF"
        stroke="#18181B"
        strokeWidth="1.4"
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
  const legacyBgs = new Set(['#BCEFF4', '#BAE6FD', '#A5F3FC', '#E0F2FE']);
  const backdropColor =
    !nextChapter.bgColor || legacyBgs.has(nextChapter.bgColor.toUpperCase())
      ? '#EEF4FA'
      : nextChapter.bgColor;

  // Staggered coordinates matching the curving road path
  const stationPositions =
    topics.length <= 2
      ? [
          { left: 26, top: 126, pinRight: true },
          { left: 256, top: 68, pinRight: false },
        ]
      : [
          { left: 16, top: 128, pinRight: true },
          { left: 194, top: 70, pinRight: false },
          { left: 356, top: 44, pinRight: false },
        ];

  return (
    <section
      style={{ width: '714px', height: '254px' }}
      className="relative shrink-0"
    >
      <div
        onClick={(e) => {
          if (!onSelectTarget) return;
          e.stopPropagation();
          onSelectTarget({ page: 2, block: 'nextChapter' });
        }}
        style={{ width: '714px', height: '254px' }}
        className={`relative rounded-[26px] overflow-visible ${
          onSelectTarget ? 'editable-block' : ''
        } ${isActive ? 'editable-block-active' : ''}`}
      >
        {/* Clipped Curved Sky Backdrop & Winding Road */}
        <div className="pointer-events-none absolute inset-0 rounded-[26px] overflow-hidden bg-white border border-[#E2E8F0]">
          <svg
            aria-hidden="true"
            width="714"
            height="254"
            viewBox="0 0 714 254"
            fill="none"
            className="w-full h-full"
          >
            {/* Soft Sky-Blue Curved Hill Area */}
            <path
              d="M0 78C145 8 420 -8 714 28V254H0V78Z"
              fill={backdropColor}
            />

            {/* Road White Outer Shoulder */}
            <path
              d="M 102 268 C 176 184, 290 164, 416 142 C 524 124, 622 104, 728 84"
              stroke="#FFFFFF"
              strokeWidth="48"
              strokeLinecap="round"
            />

            {/* Dark Slate Road Surface */}
            <path
              d="M 102 268 C 176 184, 290 164, 416 142 C 524 124, 622 104, 728 84"
              stroke="#434A59"
              strokeWidth="36"
              strokeLinecap="round"
            />

            {/* Dashed White Road Center Line */}
            <path
              d="M 102 268 C 176 184, 290 164, 416 142 C 524 124, 622 104, 728 84"
              stroke="#FFFFFF"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeDasharray="10 9"
            />
          </svg>
        </div>

        {/* Expressive Section Heading */}
        <div
          style={{ left: '26px', top: '14px', maxWidth: '335px' }}
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
            className="font-extrabold text-[20px] leading-[1.08] tracking-tight uppercase text-[#111827] block"
          />
        </div>

        {/* Milestones with Map Pins & Circular Icons along the Road */}
        {topics.map((topic, idx) => {
          const pos = stationPositions[idx] || stationPositions[0];
          const pinColor = PIN_COLORS[idx % PIN_COLORS.length];

          if (pos.pinRight) {
            return (
              <div
                key={topic.id}
                style={{ left: `${pos.left}px`, top: `${pos.top}px` }}
                className="absolute z-10 flex items-center gap-[8px]"
              >
                <div className="flex flex-col items-center text-center w-[124px] gap-[5px]">
                  <div className="w-[48px] h-[48px] rounded-full bg-white border-[1.6px] border-[#18181B] shadow-[0_3px_8px_rgba(17,24,39,0.1)] flex items-center justify-center shrink-0">
                    <NextTopicLineIcon
                      type={topic.iconKey}
                      className="w-[30px] h-[30px]"
                    />
                  </div>
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
                    className="text-[14.5px] font-extrabold leading-[1.12] text-[#111827] block w-full"
                  />
                </div>
                <div className="mt-[28px]">
                  <MapPinMarker color={pinColor} />
                </div>
              </div>
            );
          }

          return (
            <div
              key={topic.id}
              style={{ left: `${pos.left}px`, top: `${pos.top}px` }}
              className="absolute z-10 flex flex-col items-center text-center w-[138px] gap-[5px]"
            >
              <div className="w-[48px] h-[48px] rounded-full bg-white border-[1.6px] border-[#18181B] shadow-[0_3px_8px_rgba(17,24,39,0.1)] flex items-center justify-center shrink-0">
                <NextTopicLineIcon
                  type={topic.iconKey}
                  className="w-[30px] h-[30px]"
                />
              </div>
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
                className="text-[14.5px] font-extrabold leading-[1.12] text-[#111827] block w-full"
              />
              <div className="mt-[1px]">
                <MapPinMarker color={pinColor} />
              </div>
            </div>
          );
        })}

        {/* Full-Body Bear Mascot Standing on Right of Road (Zero Foot Clipping!) */}
        <DraggableDesignWrapper
          id="nextBear"
          transform={bearTransform}
          defaultZIndex={20}
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
            right: '8px',
            bottom: '4px',
            width: '188px',
            height: '220px',
          }}
          className="flex items-end justify-center"
        >
          <div
            style={{ width: '188px', height: '220px' }}
            className="flex items-end justify-center"
          >
            <BearCharacter
              src={nextChapter.bearUrl}
              alt="Медведь KIBERone приглашает к новому этапу"
              scale={(ageCategory === '8-10' ? 1.02 : 0.98) * nextChapter.bearScale}
              offsetX={nextChapter.bearOffsetX}
              offsetY={nextChapter.bearOffsetY}
              cropTop={false}
              className="w-[184px] h-[216px] drop-shadow-[0_10px_14px_rgba(17,24,39,0.18)]"
            />
          </div>
        </DraggableDesignWrapper>
      </div>
    </section>
  );
}
