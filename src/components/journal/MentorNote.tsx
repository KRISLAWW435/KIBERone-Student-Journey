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
  const isHandwriting = mentorNote.fontStyle === 'handwriting';
  const resolvedFontSize = isHandwriting
    ? Math.max(21, mentorNote.fontSize + 2)
    : Math.max(14, mentorNote.fontSize - 3);

  return (
    <section style={{ width: '378px' }} className="flex flex-col shrink-0">
      <h3 className="font-extrabold text-[17px] leading-[24px] tracking-tight uppercase text-[#111827] mb-[10px] shrink-0">
        СЛОВО НАСТАВНИКА
      </h3>

      <div
        onClick={(e) => {
          if (!onSelectTarget) return;
          e.stopPropagation();
          onSelectTarget({ page: 2, block: 'mentorNote' });
        }}
        style={{
          width: '378px',
          minHeight: '306px',
          transform: `rotate(${mentorNote.tiltDeg}deg)`,
        }}
        className={`relative mentor-notebook-paper rounded-md border border-zinc-300 shadow-[0_6px_18px_rgba(0,0,0,0.1)] pl-[44px] pr-[20px] pt-[18px] pb-[18px] flex flex-col justify-between shrink-0 ${
          onSelectTarget ? 'editable-block' : ''
        } ${isActive ? 'editable-block-active' : ''}`}
      >
        {/* Spiral Wire Binding on Left Edge matching reference */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-[8px] top-[12px] bottom-[12px] w-[28px] flex flex-col justify-between"
        >
          {Array.from({ length: 11 }).map((_, idx) => (
            <div key={idx} className="flex items-center">
              <span className="w-[16px] h-[4px] rounded-full bg-gradient-to-r from-zinc-500 via-zinc-300 to-zinc-600 shadow-xs block" />
              <span className="w-[10px] h-[10px] rounded-full bg-[#D1D5DB] border border-zinc-500 -ml-[4px] block" />
            </div>
          ))}
        </div>

        {/* Letter Content locked strictly to 28px notebook rules */}
        <div
          style={{
            fontFamily: isHandwriting
              ? 'var(--font-handwriting)'
              : 'var(--font-journal)',
            fontSize: `${resolvedFontSize}px`,
            lineHeight: '28px',
          }}
          className="text-[#111827]"
        >
          <div className="font-semibold">{mentorNote.greeting}</div>
          <p className="m-0 font-medium">{mentorNote.body}</p>
        </div>

        {/* Signature + Optional Mentor Photo */}
        <div className="mt-[28px] flex items-end justify-between gap-[12px]">
          <div
            style={{
              fontFamily: isHandwriting
                ? 'var(--font-handwriting)'
                : 'var(--font-journal)',
              fontSize: isHandwriting ? `${resolvedFontSize}px` : '14px',
              lineHeight: '28px',
            }}
            className="font-semibold text-[#111827]"
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
