import React, { useId } from 'react';
import {
  ASSETS,
  getNextPinPalette,
  NextPinColorOption,
} from '../../data/presets';
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

interface NextChapterProps {
  config: Page2Config;
  ageCategory: AgeCategory;
  designMode?: boolean;
  scaleFactor?: number;
  titleTransform?: CanvasObjectTransform;
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

function getStationLabelFontSize(
  title: string,
  labelWidth: number,
  isFourStations: boolean
): number {
  const trimmed = title.trim();
  const tokens = trimmed.split(/[\s-]+/).filter(Boolean);
  const maxWordLen = tokens.reduce((max, w) => Math.max(max, w.length), 0);
  const totalLen = trimmed.length;
  const innerWidth = Math.max(60, labelWidth - (isFourStations ? 14 : 16));

  let fontSize = isFourStations ? 11 : 12;
  if (totalLen > 28) {
    fontSize = isFourStations ? 9.2 : 10.2;
  } else if (totalLen > 20) {
    fontSize = isFourStations ? 9.8 : 10.8;
  } else if (totalLen > 14 && isFourStations) {
    fontSize = 10.4;
  }

  if (maxWordLen > 0) {
    const safeForWord = (innerWidth - 4) / (maxWordLen * 0.64);
    if (safeForWord < fontSize) {
      fontSize = Math.max(8.5, Number(safeForWord.toFixed(1)));
    }
  }

  return fontSize;
}

interface RoutePoint {
  x: number;
  y: number;
}

function buildSmoothRoutePath(points: RoutePoint[]): string {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
  let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  for (let i = 0; i < points.length - 1; i += 1) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d;
}

export function LocationPinIcon({
  color,
  size = 20,
}: {
  color?: string;
  size?: number;
}) {
  const palette = getNextPinPalette(color, 0);
  const h = Math.round((size * 56) / 44);
  return (
    <svg
      width={size}
      height={h}
      viewBox="0 0 44 56"
      fill="none"
      className="shrink-0"
      aria-hidden="true"
    >
      <path
        d="M22 3C11.5 3 3 11.4 3 21.8C3 34.4 18.2 49.4 21.1 52.2C21.6 52.7 22.4 52.7 22.9 52.2C25.8 49.4 41 34.4 41 21.8C41 11.4 32.5 3 22 3Z"
        fill={palette.hex}
        stroke="#18181B"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      <circle
        cx="22"
        cy="21"
        r="8.5"
        fill="#FFFFFF"
        stroke="#18181B"
        strokeWidth="2"
      />
      <circle cx="22" cy="21" r="3.6" fill={palette.dark} />
    </svg>
  );
}

function VolumetricLocationPin({
  palette,
  gradId,
  compact = false,
}: {
  palette: NextPinColorOption;
  gradId: string;
  compact?: boolean;
}) {
  const w = compact ? 40 : 44;
  const h = compact ? 51 : 56;
  return (
    <svg
      width={w}
      height={h}
      viewBox="0 0 44 56"
      fill="none"
      className="shrink-0 drop-shadow-[0_4px_6px_rgba(15,23,42,0.24)]"
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id={gradId}
          x1="8"
          y1="5"
          x2="37"
          y2="49"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor={palette.light} />
          <stop offset="52%" stopColor={palette.hex} />
          <stop offset="100%" stopColor={palette.dark} />
        </linearGradient>
      </defs>

      {/* Outer Volumetric Pin Body */}
      <path
        d="M22 3C11.5 3 3 11.4 3 21.8C3 34.4 18.2 49.4 21.1 52.2C21.6 52.7 22.4 52.7 22.9 52.2C25.8 49.4 41 34.4 41 21.8C41 11.4 32.5 3 22 3Z"
        fill={`url(#${gradId})`}
        stroke="#18181B"
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {/* 3D Specular Gloss Highlight */}
      <path
        d="M10.5 18.5C11.4 12.2 15.8 7.8 21.8 6.9"
        stroke="#FFFFFF"
        strokeWidth="2.4"
        strokeLinecap="round"
        opacity="0.7"
      />
      <circle cx="9.2" cy="23.2" r="1.4" fill="#FFFFFF" opacity="0.65" />

      {/* Center Recessed Medallion */}
      <circle
        cx="22"
        cy="21"
        r="9.2"
        fill="#FFFFFF"
        stroke="#18181B"
        strokeWidth="1.8"
      />
      <circle
        cx="22"
        cy="21"
        r="6.2"
        fill={palette.light}
        opacity="0.4"
      />
      <circle
        cx="22"
        cy="21"
        r="3.8"
        fill={palette.dark}
        stroke="#18181B"
        strokeWidth="1.2"
      />
    </svg>
  );
}

export function NextChapter({
  config,
  ageCategory,
  designMode = false,
  scaleFactor = 1,
  titleTransform,
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
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const { nextChapter } = config;
  const isActive =
    activeTarget?.page === 2 && activeTarget.block === 'nextChapter';
  const isTitleActive =
    activeTarget?.page === 2 && activeTarget.block === 'nextChapterTitle';
  const isBearActive =
    activeTarget?.page === 2 && activeTarget.block === 'nextBear';

  const topics = nextChapter.topics.slice(0, 4);
  const showDecor = nextChapter.showDecor !== false;
  const showRouteLine = nextChapter.showRouteLine !== false;
  const backdropColor = nextChapter.bgColor || '#BCEFF4';

  const stationPositions =
    topics.length <= 1
      ? [{ centerX: 280, pinTipY: 148, labelWidth: 224 }]
      : topics.length === 2
      ? [
          { centerX: 166, pinTipY: 162, labelWidth: 208 },
          { centerX: 404, pinTipY: 125, labelWidth: 208 },
        ]
      : topics.length === 3
      ? [
          { centerX: 108, pinTipY: 166, labelWidth: 172 },
          { centerX: 290, pinTipY: 138, labelWidth: 172 },
          { centerX: 472, pinTipY: 113, labelWidth: 172 },
        ]
      : [
          { centerX: 94, pinTipY: 168, labelWidth: 126 },
          { centerX: 226, pinTipY: 144, labelWidth: 126 },
          { centerX: 358, pinTipY: 125, labelWidth: 126 },
          { centerX: 490, pinTipY: 110, labelWidth: 126 },
        ];

  const routeAnchorPoints: RoutePoint[] = [
    { x: 14, y: 210 },
    ...stationPositions.map((s) => ({ x: s.centerX, y: s.pinTipY })),
    { x: 586, y: 94 },
    { x: 804, y: 68 },
  ];
  const smoothRouteD = buildSmoothRoutePath(routeAnchorPoints);
  const isFourStations = topics.length >= 4;

  return (
    <section
      data-card-label="Что интересного впереди?"
      data-next-stations-count={topics.length}
      className="relative w-full h-full flex-1 min-h-0 shrink-0 flex flex-col overflow-visible"
    >
      <div
        onClick={(e) => {
          if (!onSelectTarget) return;
          e.stopPropagation();
          onSelectTarget({ page: 2, block: 'nextChapter' });
        }}
        className={`relative w-full h-full flex-1 min-h-0 overflow-visible ${
          onSelectTarget ? 'editable-block' : ''
        } ${isActive ? 'editable-block-active' : ''}`}
      >
        {/* Route Backdrop, Curved Meadow, Dashed Discovery Trail & Subtle Decorative Accents */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <svg
            aria-hidden="true"
            viewBox="0 0 794 266"
            preserveAspectRatio="none"
            fill="none"
            className="w-full h-full"
          >
            <defs>
              <linearGradient
                id={`next-sky-grad-${uid}`}
                x1="0"
                y1="0"
                x2="0"
                y2="266"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%" stopColor={backdropColor} stopOpacity="0" />
                <stop offset="28%" stopColor={backdropColor} stopOpacity="0.58" />
                <stop offset="100%" stopColor={backdropColor} stopOpacity="0.92" />
              </linearGradient>
              <linearGradient
                id={`next-meadow-grad-${uid}`}
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
              <filter
                id={`iso-shadow-${uid}`}
                x="-20%"
                y="-20%"
                width="140%"
                height="150%"
              >
                <feDropShadow
                  dx="0"
                  dy="3"
                  stdDeviation="2"
                  floodColor="#111827"
                  floodOpacity="0.2"
                />
              </filter>
            </defs>

            {/* Soft Sky / Backdrop Tint Controlled by nextChapter.bgColor */}
            <rect
              x="0"
              y="0"
              width="794"
              height="266"
              fill={`url(#next-sky-grad-${uid})`}
            />

            {/* Soft Background Cloud / Horizon Hill Accent */}
            <path
              d="M0 140 C 190 88, 460 34, 794 52 V266 H0 Z"
              fill="#FFFFFF"
              opacity="0.32"
            />

            {/* Open Curved Green Meadow Terrain */}
            <path
              d="M0 160 C 180 110, 470 42, 794 66 V266 H0 Z"
              fill={`url(#next-meadow-grad-${uid})`}
            />

            {/* Subtle Sunlit Meadow Highlight */}
            <path
              d="M0 194 C 195 152, 450 96, 794 110 V266 H0 Z"
              fill="#FFFFFF"
              opacity="0.14"
            />

            {/* Playful Purple Corner Hill Accent under Bear */}
            <path
              d="M 554 266 C 598 196, 690 150, 794 136 V266 H554 Z"
              fill="#8B5CF6"
            />

            {/* Light Curved Trail Ribbon + Dashed Route Line Connecting All Pins */}
            {showRouteLine && (
              <g>
                {/* Soft Trail Shadow */}
                <path
                  d={smoothRouteD}
                  stroke="#18181B"
                  strokeWidth="22"
                  strokeLinecap="round"
                  opacity="0.14"
                  transform="translate(0, 3)"
                />
                {/* Crisp Trail Border */}
                <path
                  d={smoothRouteD}
                  stroke="#18181B"
                  strokeWidth="21"
                  strokeLinecap="round"
                />
                {/* Bright Light Discovery Trail Surface */}
                <path
                  d={smoothRouteD}
                  stroke="#F8FAFC"
                  strokeWidth="17"
                  strokeLinecap="round"
                />
                {/* Fine Dashed Route Line Along Centerline */}
                <path
                  d={smoothRouteD}
                  stroke="#0F766E"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeDasharray="7 7"
                />
              </g>
            )}

            {/* Waypoint Anchor Nodes Directly Under Each Location Pin Tip */}
            {topics.map((topic, idx) => {
              const pos = stationPositions[idx] || stationPositions[0];
              const palette = getNextPinPalette(topic.pinColor, idx);
              return (
                <g key={`wp-${topic.id}`}>
                  <ellipse
                    cx={pos.centerX}
                    cy={pos.pinTipY + 1}
                    rx="11"
                    ry="4.2"
                    fill="#18181B"
                    opacity="0.16"
                  />
                  <circle
                    cx={pos.centerX}
                    cy={pos.pinTipY}
                    r="5.5"
                    fill="#FFFFFF"
                    stroke="#18181B"
                    strokeWidth="1.6"
                  />
                  <circle
                    cx={pos.centerX}
                    cy={pos.pinTipY}
                    r="2.7"
                    fill={palette.hex}
                  />
                </g>
              );
            })}

            {/* Light Decorative Details (Non-cluttering Geometric Accents & Sparkles) */}
            {showDecor && (
              <g>
                {/* Open Sky 4-Point Sparkles & Route Dots */}
                <path
                  d="M424 38L426.4 44.6L433 47L426.4 49.4L424 56L421.6 49.4L415 47L421.6 44.6Z"
                  fill="#FACC15"
                  stroke="#18181B"
                  strokeWidth="1.1"
                  strokeLinejoin="round"
                />
                <path
                  d="M554 48L556 53L561 55L556 57L554 62L552 57L547 55L552 53Z"
                  fill="#5EEAD4"
                  stroke="#18181B"
                  strokeWidth="1.1"
                  strokeLinejoin="round"
                />
                <circle
                  cx="396"
                  cy="68"
                  r="3.2"
                  fill="#FB7185"
                  stroke="#18181B"
                  strokeWidth="1.1"
                />
                <circle
                  cx="526"
                  cy="34"
                  r="2.8"
                  fill="#8B5CF6"
                  stroke="#18181B"
                  strokeWidth="1.1"
                />
                <circle
                  cx="176"
                  cy="68"
                  r="2.8"
                  fill="#38BDF8"
                  stroke="#18181B"
                  strokeWidth="1.1"
                />

                {/* Left Margin Small Isometric 3D Cube (clear of raised station 1 pill) */}
                <g filter={`url(#iso-shadow-${uid})`}>
                  <polygon
                    points="20,218 30,223 20,228 10,223"
                    fill="#FEF08A"
                    stroke="#18181B"
                    strokeWidth="1.2"
                    strokeLinejoin="round"
                  />
                  <polygon
                    points="10,223 20,228 20,242 10,237"
                    fill="#FACC15"
                    stroke="#18181B"
                    strokeWidth="1.2"
                    strokeLinejoin="round"
                  />
                  <polygon
                    points="30,223 20,228 20,242 30,237"
                    fill="#CA8A04"
                    stroke="#18181B"
                    strokeWidth="1.2"
                    strokeLinejoin="round"
                  />
                </g>

                {/* Right Meadow Small Teal Pyramid Accent Near Bear */}
                <g filter={`url(#iso-shadow-${uid})`}>
                  <polygon
                    points="562,190 548,218 562,224"
                    fill="#5EEAD4"
                    stroke="#18181B"
                    strokeWidth="1.3"
                    strokeLinejoin="round"
                  />
                  <polygon
                    points="562,190 576,218 562,224"
                    fill="#0D9488"
                    stroke="#18181B"
                    strokeWidth="1.3"
                    strokeLinejoin="round"
                  />
                </g>
              </g>
            )}
          </svg>
        </div>

        {/* Independent 2D Editable Heading & Intro Block */}
        <DraggableDesignWrapper
          id="nextChapterTitle"
          movementMode="both"
          transform={titleTransform}
          defaultZIndex={26}
          designMode={designMode}
          scaleFactor={scaleFactor}
          isActive={isTitleActive}
          onSelect={
            onSelectTarget
              ? () => onSelectTarget({ page: 2, block: 'nextChapterTitle' })
              : undefined
          }
          onUpdateTransform={
            onUpdateTransform
              ? (next) => onUpdateTransform('nextChapterTitle', next)
              : undefined
          }
          onSnapLinesChange={onSnapLinesChange}
          onInteractionStart={onInteractionStart}
          onInteractionEnd={onInteractionEnd}
          style={{
            position: 'absolute',
            left: '40px',
            top: '2px',
            width: '340px',
          }}
        >
          <div
            data-card-label="Заголовок «Что интересного впереди?»"
            className="w-full h-full min-w-0 box-border flex flex-col justify-start"
          >
            <InlineEditableText
              value={nextChapter.title || 'ЧТО ИНТЕРЕСНОГО ВПЕРЕДИ?'}
              designMode={designMode}
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
                !designMode &&
                activeTextField?.page === 2 &&
                activeTextField.field === 'nextChapterTitle'
              }
              as="h3"
              className="font-journal-display font-black text-[19px] leading-[1.08] tracking-tight uppercase text-[#111827] block w-full min-w-0 box-border whitespace-pre-wrap [overflow-wrap:anywhere]"
            />
            {nextChapter.description?.trim() && (
              <p className="font-journal-body m-0 mt-[3px] text-[10.5px] leading-[1.28] font-semibold text-[#27272A] w-full min-w-0 box-border whitespace-pre-wrap [overflow-wrap:anywhere]">
                {nextChapter.description}
              </p>
            )}
          </div>
        </DraggableDesignWrapper>

        {/* Route Stations: [Bright Volumetric Location Pin] -> [Readable Direction Title Below] */}
        {topics.map((topic, idx) => {
          const pos = stationPositions[idx] || stationPositions[0];
          const palette = getNextPinPalette(topic.pinColor, idx);
          const pinHeightPx = isFourStations ? 51 : 56;
          const labelFontSize = getStationLabelFontSize(
            topic.title,
            pos.labelWidth,
            isFourStations
          );

          return (
            <div
              key={topic.id}
              data-next-station={topic.id}
              data-pin-color={palette.hex}
              style={{
                left: `${(pos.centerX / 794) * 100}%`,
                top: `${(pos.pinTipY / 266) * 100}%`,
                transform: 'translate(-50%, 0)',
                width: `${(pos.labelWidth / 794) * 100}%`,
              }}
              className="absolute z-20 flex flex-col items-center text-center"
            >
              {/* 1. Volumetric Location Pin Anchored Directly on Route Waypoint */}
              <div
                style={{ marginTop: `-${pinHeightPx}px` }}
                className="pointer-events-none shrink-0 leading-none"
              >
                <VolumetricLocationPin
                  palette={palette}
                  gradId={`pin-grad-${uid}-${idx}`}
                  compact={isFourStations}
                />
              </div>

              {/* 2. Readable Direction Label Strictly Below the Pin (No mid-word breaking, no truncation) */}
              <div
                style={{ borderTop: `3px solid ${palette.hex}` }}
                className={`mt-[6px] bg-white/95 border-[1.6px] border-[#18181B] rounded-xl ${
                  isFourStations ? 'px-[4px] py-[3.5px]' : 'px-[6px] py-[4px]'
                } shadow-[2px_2px_0_#18181B] w-full min-w-0 box-border`}
              >
                <InlineEditableText
                  value={topic.title}
                  designMode={designMode}
                  wrapMode="normal"
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
                  style={{
                    fontSize: `${labelFontSize}px`,
                    wordBreak: 'normal',
                    overflowWrap: 'normal',
                    hyphens: 'none',
                    textWrap: 'balance',
                  }}
                  className="font-journal-display font-extrabold leading-[1.15] text-[#111827] block w-full min-w-0 box-border"
                />
              </div>
            </div>
          );
        })}

        {/* Full-Body VR Bear Mascot Standing Cleanly on Right Meadow / Grass */}
        <DraggableDesignWrapper
          id="nextBear"
          movementMode="both"
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
            right: '8px',
            bottom: '4px',
            width: '218px',
            height: '100%',
          }}
          className="flex items-end justify-center"
        >
          <div className="w-full h-full p-[2px] flex items-end justify-center">
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
              className="w-full h-full"
            />
          </div>
        </DraggableDesignWrapper>
      </div>
    </section>
  );
}
