import React from 'react';
import {
  ActiveTextFieldTarget,
  EditorSectionTarget,
  Page2Config,
} from '../../types/journal';
import { InlineEditableText } from './DecorLayer';

interface MentorNoteProps {
  config: Page2Config;
  activeTarget?: EditorSectionTarget;
  activeTextField?: ActiveTextFieldTarget;
  onSelectTarget?: (target: EditorSectionTarget) => void;
  onSelectTextField?: (target: ActiveTextFieldTarget) => void;
  onUpdateMentorNote?: (patch: Partial<Page2Config['mentorNote']>) => void;
  onBeginEdit?: () => void;
  onEndEdit?: () => void;
}

export function MentorNote({
  config,
  activeTarget,
  activeTextField,
  onSelectTarget,
  onSelectTextField,
}: MentorNoteProps) {
  const { mentorNote } = config;
  const isActive =
    activeTarget?.page === 2 && activeTarget.block === 'mentorNote';
  const isHandwriting = mentorNote.fontStyle !== 'sans';
  const resolvedFontSize = isHandwriting
    ? Math.max(18, Math.min(23, mentorNote.fontSize + 1))
    : Math.max(12.5, mentorNote.fontSize - 4);

  return (
    <section
      style={{ width: '345px' }}
      className="shrink-0 flex flex-col h-full"
    >
      <h3 className="font-journal-display font-black text-[17.5px] leading-[21px] tracking-tight uppercase text-[#111827] mb-[10px] shrink-0">
        СЛОВО НАСТАВНИКА
      </h3>

      <div
        style={{ width: '345px', minHeight: '376px' }}
        className="relative flex-1 flex flex-col pt-[8px]"
      >
        {/* Stacked striped notebook backing sheet */}
        <div
          aria-hidden="true"
          style={{
            transform: 'rotate(1.8deg) translate(4px, 4px)',
            backgroundImage:
              'repeating-linear-gradient(135deg, #D9F2F5 0px, #D9F2F5 6px, #FFFFFF 6px, #FFFFFF 12px)',
          }}
          className="pointer-events-none absolute inset-0 top-[8px] rounded-md border-[1.5px] border-[#18181B]/75 shadow-[0_6px_14px_rgba(17,24,39,0.08)]"
        />

        {/* Foreground Ruled Notebook Sheet */}
        <div
          onClick={(e) => {
            if (!onSelectTarget) return;
            e.stopPropagation();
            onSelectTarget({ page: 2, block: 'mentorNote' });
          }}
          style={{
            transform: `rotate(${mentorNote.tiltDeg ?? -0.8}deg)`,
          }}
          className={`relative flex-1 min-h-0 mentor-notebook-paper rounded-md border-[1.7px] border-[#18181B] shadow-[0_8px_18px_rgba(17,24,39,0.12)] px-[20px] pt-[10px] pb-[12px] flex flex-col justify-between ${
            onSelectTarget ? 'editable-block' : ''
          } ${isActive ? 'editable-block-active' : ''}`}
        >
          {/* Realistic Metal Paperclip Binding at top-right */}
          <svg
            aria-hidden="true"
            viewBox="0 0 26 52"
            className="pointer-events-none absolute -top-[18px] right-[22px] w-[22px] h-[44px] z-20"
            fill="none"
          >
            <path
              d="M7 34V12C7 6.5 11.5 2 17 2C21.5 2 24 5.5 24 10V36C24 43 18.5 48 12 48C6.5 48 2 43.5 2 38V16"
              stroke="#18181B"
              strokeWidth="2.4"
              strokeLinecap="round"
            />
          </svg>

          {/* Spiral / Perforation dots on left margin */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-[6px] top-[24px] bottom-[20px] flex flex-col justify-between opacity-35"
          >
            {Array.from({ length: 10 }).map((_, idx) => (
              <span
                key={idx}
                className="w-[5px] h-[5px] rounded-full border border-[#18181B] bg-zinc-200 block"
              />
            ))}
          </div>

          {/* Handwritten Letter Body aligned to 28px notebook lines */}
          <div className="pl-[6px] flex-1 min-h-0 overflow-hidden">
            <div className="font-bold text-[14px] leading-[28px] text-[#111827]">
              Слово наставника:
            </div>
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
              {(mentorNote.greeting || onSelectTextField) && (
                <InlineEditableText
                  value={mentorNote.greeting}
                  placeholder="Приветствие ученику…"
                  onSelectText={
                    onSelectTextField
                      ? () =>
                          onSelectTextField({
                            page: 2,
                            field: 'mentorGreeting',
                          })
                      : undefined
                  }
                  isSelected={
                    activeTextField?.page === 2 &&
                    activeTextField.field === 'mentorGreeting'
                  }
                  as="div"
                  className="font-semibold block"
                />
              )}
              <InlineEditableText
                value={mentorNote.body}
                placeholder="Нажмите, чтобы написать слово наставника…"
                onSelectText={
                  onSelectTextField
                    ? () =>
                        onSelectTextField({
                          page: 2,
                          field: 'mentorBody',
                        })
                    : undefined
                }
                isSelected={
                  activeTextField?.page === 2 &&
                  activeTextField.field === 'mentorBody'
                }
                as="p"
                className="m-0 font-medium block"
              />
            </div>
          </div>

          {/* Handwritten Signature + Optional Mentor Photo */}
          <div className="mt-[8px] pl-[6px] flex items-end justify-between gap-[10px] shrink-0">
            <InlineEditableText
              value={mentorNote.signature}
              placeholder="Подпись наставника"
              onSelectText={
                onSelectTextField
                  ? () =>
                      onSelectTextField({
                        page: 2,
                        field: 'mentorSignature',
                      })
                  : undefined
              }
              isSelected={
                activeTextField?.page === 2 &&
                activeTextField.field === 'mentorSignature'
              }
              as="div"
              style={{
                fontFamily: isHandwriting
                  ? 'var(--font-handwriting)'
                  : 'var(--font-journal)',
                fontSize: isHandwriting ? `${resolvedFontSize}px` : '13px',
                lineHeight: '26px',
              }}
              className="font-semibold text-[#111827] block"
            />

            {mentorNote.mentorPhotoUrl && (
              <div className="w-[56px] h-[56px] rounded-full overflow-hidden border-2 border-zinc-300 shadow-xs shrink-0 bg-zinc-100">
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
      </div>
    </section>
  );
}
