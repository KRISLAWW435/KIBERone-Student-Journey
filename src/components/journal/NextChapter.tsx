import React from 'react';
import { AgeCategory, EditorSectionTarget, Page2Config } from '../../types/journal';
import { BearCharacter } from './BearCharacter';
import { NextTopicLineIcon } from './JournalArtwork';

interface NextChapterProps {
  config: Page2Config;
  ageCategory: AgeCategory;
  activeTarget?: EditorSectionTarget;
  onSelectTarget?: (target: EditorSectionTarget) => void;
}

interface RoadmapPoint {
  x: number;
  y: number;
  dotColor: string;
}

const STATION_PRESETS: Record<number, RoadmapPoint[]> = {
  1: [{ x: 248, y: 48, dotColor: '#FFE14D' }],
  2: [
    { x: 144, y: 54, dotColor: '#FFE14D' },
    { x: 350, y: 44, dotColor: '#FF8A75' },
  ],
  3: [
    { x: 84, y: 54, dotColor: '#FFE14D' },
    { x: 248, y: 44, dotColor: '#FF8A75' },
    { x: 412, y: 54, dotColor: '#5EEAD4' },
  ],
  4: [
    { x: 64, y: 54, dotColor: '#FFE14D' },
    { x: 186, y: 42, dotColor: '#FF8A75' },
    { x: 308, y: 56, dotColor: '#5EEAD4' },
    { x: 430, y: 44, dotColor: '#FDE047' },
  ],
};

function buildRoadmapPath(points: RoadmapPoint[]): string {
  if (points.length === 1) {
    const p = points[0];
    return `M 16 56 C 95 66, 170 42, ${p.x} ${p.y} C 325 54, 405 38, 478 44`;
  }
  if (points.length === 2) {
    const [p1, p2] = points;
    return `M 16 44 C 58 60, 102 58, ${p1.x} ${p1.y} C 208 48, 286 42, ${p2.x} ${p2.y} C 402 46, 444 54, 478 42`;
  }
  if (points.length === 4) {
    const [p1, p2, p3, p4] = points;
    return `M 14 44 C 34 56, 48 56, ${p1.x} ${p1.y} C 108 48, 144 40, ${p2.x} ${p2.y} C 228 44, 266 58, ${p3.x} ${p3.y} C 350 54, 388 42, ${p4.x} ${p4.y} C 452 45, 466 48, 480 38`;
  }
  const [p1, p2, p3] = points;
  return `M 16 42 C 42 56, 62 56, ${p1.x} ${p1.y} C 142 50, 192 42, ${p2.x} ${p2.y} C 304 46, 354 56, ${p3.x} ${p3.y} C 440 53, 462 46, 480 36`;
}

export function NextChapter({
  config,
  ageCategory,
  activeTarget,
  onSelectTarget,
}: NextChapterProps) {
  const { nextChapter } = config;
  const isActive = activeTarget?.page === 2 && activeTarget.block === 'nextChapter';
  const isBearActive = activeTarget?.page === 2 && activeTarget.block === 'nextBear';

  const topics = nextChapter.topics.slice(0, 4);
  const count = topics.length;
  const stations = STATION_PRESETS[count] ?? STATION_PRESETS[3];
  const roadPath = count > 0 ? buildRoadmapPath(stations) : '';

  return (
    <section
      onClick={(e) => {
        if (!onSelectTarget) return;
        e.stopPropagation();
        onSelectTarget({ page: 2, block: 'nextChapter' });
      }}
      style={{
        width: '714px',
        height: '168px',
        backgroundColor: nextChapter.bgColor,
      }}
      className={`relative rounded-2xl pl-[22px] pr-[184px] pt-[12px] pb-[10px] flex flex-col justify-between overflow-visible shrink-0 shadow-[0_4px_12px_rgba(0,0,0,0.06)] ${
        onSelectTarget ? 'editable-block' : ''
      } ${isActive ? 'editable-block-active' : ''}`}
    >
      {/* Header Row */}
      <div style={{ width: '496px' }} className="shrink-0 flex items-baseline justify-between gap-[10px]">
        <div className="min-w-0">
          <h3 className="font-extrabold text-[17.5px] leading-tight uppercase text-[#111827] truncate">
            {nextChapter.title}
          </h3>
          <p className="text-[12px] font-medium text-[#111827]/85 mt-[2px] truncate">
            {nextChapter.description}
          </p>
        </div>
      </div>

      {/* Adventure Roadmap Area */}
      <div
        style={{ width: '496px', height: '104px' }}
        className="relative shrink-0"
      >
        {count > 0 && (
          <>
            {/* Curved Adventure Trail SVG */}
            <svg
              aria-hidden="true"
              viewBox="0 0 496 104"
              style={{ width: '496px', height: '104px' }}
              className="absolute inset-0 pointer-events-none"
              fill="none"
            >
              {/* Soft bright path glow */}
              <path
                d={roadPath}
                stroke="rgba(255,255,255,0.65)"
                strokeWidth="8"
                strokeLinecap="round"
              />
              {/* Crisp dashed adventure trail */}
              <path
                d={roadPath}
                stroke="#18181B"
                strokeWidth="2.3"
                strokeDasharray="6 5"
                strokeLinecap="round"
              />
              {/* Start compass star on left */}
              <circle cx="14" cy="42" r="4.5" fill="#FFFFFF" stroke="#18181B" strokeWidth="1.6" />
              <circle cx="14" cy="42" r="1.6" fill="#18181B" />

              {/* Destination flag / arrow on right leading toward the Bear */}
              <path
                d="M475 30L487 35L478 44"
                stroke="#18181B"
                strokeWidth="2.1"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M487 22L489 26L493 27L489 28L487 32L485 28L481 27L485 26L487 22Z"
                fill="#FACC15"
                stroke="#18181B"
                strokeWidth="1.1"
              />
            </svg>

            {/* Stations on the Curved Path */}
            {topics.map((topic, idx) => {
              const pt = stations[idx] ?? stations[stations.length - 1];
              const labelMaxW = count === 4 ? 112 : 144;
              return (
                <div
                  key={topic.id}
                  style={{
                    left: `${pt.x}px`,
                    top: 0,
                    transform: 'translateX(-50%)',
                    width: `${labelMaxW}px`,
                  }}
                  className="absolute h-[104px] pointer-events-none"
                >
                  {/* Icon Badge floating directly above the station dot */}
                  <div
                    style={{
                      top: `${Math.max(0, pt.y - 44)}px`,
                    }}
                    className="absolute left-1/2 -translate-x-1/2 w-[38px] h-[38px] rounded-xl bg-white border-[1.7px] border-[#18181B] shadow-[0_3px_0_rgba(24,24,27,0.16)] flex items-center justify-center"
                  >
                    <NextTopicLineIcon
                      type={topic.iconKey}
                      className="w-[26px] h-[26px]"
                    />
                  </div>

                  {/* Station Dot positioned precisely on the curved path */}
                  <div
                    style={{
                      top: `${pt.y - 7}px`,
                      backgroundColor: pt.dotColor,
                    }}
                    className="absolute left-1/2 -translate-x-1/2 w-[14px] h-[14px] rounded-full border-[2.2px] border-[#18181B] shadow-xs flex items-center justify-center"
                  >
                    <span className="w-[4px] h-[4px] rounded-full bg-[#18181B]" />
                  </div>

                  {/* Short Topic Caption below the station dot */}
                  <div
                    style={{
                      top: `${pt.y + 11}px`,
                    }}
                    className="absolute inset-x-0 px-[2px] text-center"
                  >
                    <span className="inline-block text-[10.8px] font-extrabold leading-[1.15] text-[#111827] bg-white/65 px-[5px] py-[2px] rounded-md line-clamp-2">
                      {topic.title}
                    </span>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>

      {/* Peeking Bear on Bottom-Right */}
      <div
        onClick={(e) => {
          if (!onSelectTarget) return;
          e.stopPropagation();
          onSelectTarget({ page: 2, block: 'nextBear' });
        }}
        style={{
          position: 'absolute',
          right: '-10px',
          bottom: '-28px',
          width: '174px',
          height: '190px',
        }}
        className={`flex items-end justify-end z-20 ${
          onSelectTarget ? 'editable-block rounded-xl' : ''
        } ${isBearActive ? 'editable-block-active' : ''}`}
      >
        <BearCharacter
          src={nextChapter.bearUrl}
          alt="Медведь KIBERone приглашает к новому этапу"
          scale={(ageCategory === '8-10' ? 1.05 : 1) * nextChapter.bearScale}
          offsetX={nextChapter.bearOffsetX}
          offsetY={nextChapter.bearOffsetY}
          cropTop
          className="w-[168px] h-[186px] drop-shadow-[0_10px_14px_rgba(17,24,39,0.2)]"
        />
      </div>
    </section>
  );
}
