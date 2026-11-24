import React from 'react';
import { EditorSectionTarget, Page2Config } from '../../types/journal';

interface MentorNoteProps {
  config: Page2Config;
  activeTarget?: EditorSectionTarget;
  onSelectTarget?: (target: EditorSectionTarget) => void;
}

export function MentorNote({
  config,
  activeTarget,
  onSelectTarget,
}: MentorNoteProps) {
  const { mentorNote } = config;
  const isActive = activeTarget?.page === 2 && activeTarget.block === 'mentorNote';

  return (
    <section className="flex flex-col">
      <h3 className="font-extrabold text-[17px] tracking-tight uppercase text-[#111827] mb-2.5">
        СЛОВО НАСТАВНИКА
      </h3>

      <div
        onClick={(e) => {
          if (!onSelectTarget) return;
          e.stopPropagation();
          onSelectTarget({ page: 2, block: 'mentorNote' });
        }}
        style={{ transform: `rotate(${mentorNote.tiltDeg}deg)` }}
        className={`relative mentor-notebook-paper rounded-md border border-zinc-300 shadow-[0_6px_18px_rgba(0,0,0,0.1)] pl-11 pr-5 pt-4 pb-4 min-h-[268px] flex flex-col justify-between ${
          onSelectTarget ? 'editable-block' : ''
        } ${isActive ? 'editable-block-active' : ''}`}
      >
        {/* Spiral Wire Binding on Left Edge matching reference */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-2 top-3 bottom-3 w-7 flex flex-col justify-between"
        >
          {Array.from({ length: 11 }).map((_, idx) => (
            <div key={idx} className="flex items-center">
              <span className="w-4 h-[4px] rounded-full bg-gradient-to-r from-zinc-500 via-zinc-300 to-zinc-600 shadow-xs block" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#D1D5DB] border border-zinc-500 -ml-1 block" />
            </div>
          ))}
        </div>

        {/* Letter Content */}
        <div
          style={{
            fontFamily:
              mentorNote.fontStyle === 'handwriting'
                ? 'var(--font-handwriting)'
                : 'var(--font-journal)',
            fontSize:
              mentorNote.fontStyle === 'handwriting'
                ? `${mentorNote.fontSize}px`
                : `${Math.max(12, mentorNote.fontSize - 5)}px`,
          }}
          className="text-[#111827] leading-[1.32]"
        >
          <div className="font-semibold">{mentorNote.greeting}</div>
          <p className="mt-1">{mentorNote.body}</p>
        </div>

        {/* Signature + Optional Mentor Photo */}
        <div className="mt-3 flex items-end justify-between gap-3">
          <div
            style={{
              fontFamily:
                mentorNote.fontStyle === 'handwriting'
                  ? 'var(--font-handwriting)'
                  : 'var(--font-journal)',
              fontSize:
                mentorNote.fontStyle === 'handwriting'
                  ? `${mentorNote.fontSize}px`
                  : '13px',
            }}
            className="font-semibold text-[#111827] pb-2"
          >
            {mentorNote.signature}
          </div>

          {mentorNote.mentorPhotoUrl && (
            <div className="w-[74px] h-[74px] rounded-full overflow-hidden border-2 border-zinc-200 shadow-sm shrink-0 bg-zinc-100">
              <img
                src={mentorNote.mentorPhotoUrl}
                alt={mentorNote.signature}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
