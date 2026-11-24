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
      style={{ backgroundColor: nextChapter.bgColor }}
      className={`relative rounded-2xl px-6 py-4 pr-44 flex flex-col justify-between min-h-[168px] overflow-visible shadow-[0_4px_12px_rgba(0,0,0,0.06)] ${
        onSelectTarget ? 'editable-block' : ''
      } ${isActive ? 'editable-block-active' : ''}`}
    >
      <div>
        <h3 className="font-extrabold text-[19px] leading-tight uppercase text-[#111827]">
          {nextChapter.title}
        </h3>
        <p className="text-[13px] font-medium text-[#111827]/90 mt-1">
          {nextChapter.description}
        </p>
      </div>

      {/* 2-3 Future Direction Icons */}
      <div className="mt-3 grid grid-cols-3 gap-3 max-w-[460px]">
        {nextChapter.topics.slice(0, 3).map((topic) => (
          <div key={topic.id} className="flex flex-col items-center text-center">
            <div className="mb-1">
              <NextTopicLineIcon type={topic.iconKey} />
            </div>
            <span className="text-[11.5px] font-bold leading-tight text-[#111827]">
              {topic.title}
            </span>
          </div>
        ))}
      </div>

      {/* Peeking Bear on Bottom-Right matching reference */}
      <div
        onClick={(e) => {
          if (!onSelectTarget) return;
          e.stopPropagation();
          onSelectTarget({ page: 2, block: 'nextBear' });
        }}
        className={`absolute -right-3 -bottom-8 w-[178px] h-[196px] flex items-end justify-end z-20 ${
          onSelectTarget ? 'editable-block rounded-xl' : ''
        } ${isBearActive ? 'editable-block-active' : ''}`}
      >
        <BearCharacter
          src={nextChapter.bearUrl}
          alt="Медведь KIBERone приглашает к новому этапу"
          scale={(ageCategory === '8-10' ? 1.06 : 1) * nextChapter.bearScale}
          offsetX={nextChapter.bearOffsetX}
          offsetY={nextChapter.bearOffsetY}
          cropTop
          className="w-[170px] h-[190px] drop-shadow-[0_10px_14px_rgba(17,24,39,0.2)]"
        />
      </div>
    </section>
  );
}
