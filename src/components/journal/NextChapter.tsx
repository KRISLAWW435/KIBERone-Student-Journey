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

export function NextChapter({
  config,
  ageCategory,
  activeTarget,
  onSelectTarget,
}: NextChapterProps) {
  const { nextChapter } = config;
  const isActive = activeTarget?.page === 2 && activeTarget.block === 'nextChapter';
  const isBearActive = activeTarget?.page === 2 && activeTarget.block === 'nextBear';

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
      className={`relative rounded-2xl px-[24px] py-[14px] pr-[184px] flex flex-col justify-between overflow-visible shrink-0 shadow-[0_4px_12px_rgba(0,0,0,0.06)] ${
        onSelectTarget ? 'editable-block' : ''
      } ${isActive ? 'editable-block-active' : ''}`}
    >
      <div style={{ width: '482px' }} className="shrink-0">
        <h3 className="font-extrabold text-[18.5px] leading-tight uppercase text-[#111827]">
          {nextChapter.title}
        </h3>
        <p className="text-[13px] font-medium text-[#111827]/90 mt-[3px]">
          {nextChapter.description}
        </p>
      </div>

      {/* 2-3 Future Direction Icons aligned on one strict horizontal axis */}
      <div
        style={{ width: '482px' }}
        className="mt-[8px] grid grid-cols-3 gap-[12px] items-start shrink-0"
      >
        {nextChapter.topics.slice(0, 3).map((topic) => (
          <div
            key={topic.id}
            className="flex flex-col items-center justify-start text-center"
          >
            <div className="w-[42px] h-[42px] rounded-xl bg-white/80 border border-[#18181B]/15 shadow-[0_2px_0_rgba(24,24,27,0.08)] flex items-center justify-center shrink-0 mb-[5px]">
              <NextTopicLineIcon type={topic.iconKey} />
            </div>
            <span className="text-[11.5px] font-bold leading-[1.2] text-[#111827] min-h-[28px] flex items-start justify-center">
              {topic.title}
            </span>
          </div>
        ))}
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
