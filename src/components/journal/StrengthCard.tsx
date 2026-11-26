import React from 'react';
import {
  ActiveTextFieldTarget,
  AgeCategory,
  StrengthItem,
} from '../../types/journal';
import { InlineEditableText } from './DecorLayer';
import { StrengthLineIcon } from './JournalArtwork';

interface StrengthCardProps {
  strength: StrengthItem;
  ageCategory: AgeCategory;
  compact?: boolean;
  activeTextField?: ActiveTextFieldTarget;
  onSelectTextField?: (target: ActiveTextFieldTarget) => void;
  onUpdateField?: (patch: Partial<StrengthItem>) => void;
  onBeginEdit?: () => void;
  onEndEdit?: () => void;
}

export function StrengthCard({
  strength,
  compact = false,
  activeTextField,
  onSelectTextField,
}: StrengthCardProps) {
  return (
    <div
      data-card-label={`Сильная сторона: ${strength.title}`}
      style={{ backgroundColor: strength.bgColor || '#CFEFF2' }}
      className={`rounded-2xl ${
        compact ? 'px-[12px] py-[9px]' : 'px-[14px] py-[12px]'
      } w-full min-w-0 box-border overflow-visible flex flex-col items-center justify-center text-center border-[1.6px] border-[#18181B] shadow-[0_7px_16px_rgba(17,24,39,0.12),0_2px_4px_rgba(17,24,39,0.08)] self-stretch min-h-full`}
    >
      <div
        style={{
          filter:
            'drop-shadow(2px 0 0 #ffffff) drop-shadow(-2px 0 0 #ffffff) drop-shadow(0 2px 0 #ffffff) drop-shadow(0 -2px 0 #ffffff) drop-shadow(0 3px 5px rgba(17,24,39,0.16))',
        }}
        className={`${compact ? 'mb-[5px]' : 'mb-[8px]'} shrink-0 flex items-center justify-center`}
      >
        <StrengthLineIcon type={strength.iconKey} size={compact ? 38 : 48} />
      </div>
      <InlineEditableText
        value={strength.title}
        onSelectText={
          onSelectTextField
            ? () =>
                onSelectTextField({
                  page: 2,
                  field: 'strengthTitle',
                  itemId: strength.id,
                })
            : undefined
        }
        isSelected={
          activeTextField?.page === 2 &&
          activeTextField.field === 'strengthTitle' &&
          activeTextField.itemId === strength.id
        }
        as="div"
        className={`font-journal-display font-extrabold ${
          compact ? 'text-[12.5px]' : 'text-[14px]'
        } leading-[1.2] text-[#111827] block w-full min-w-0 box-border whitespace-pre-wrap [overflow-wrap:anywhere]`}
      />
      {(strength.example || onSelectTextField) && (
        <InlineEditableText
          value={strength.example}
          placeholder="Описание сильной стороны"
          onSelectText={
            onSelectTextField
              ? () =>
                  onSelectTextField({
                    page: 2,
                    field: 'strengthExample',
                    itemId: strength.id,
                  })
              : undefined
          }
          isSelected={
            activeTextField?.page === 2 &&
            activeTextField.field === 'strengthExample' &&
            activeTextField.itemId === strength.id
          }
          as="p"
          className={`font-journal-body ${
            compact ? 'text-[10px]' : 'text-[10.5px]'
          } leading-[1.42] font-medium text-[#27272A] mt-[4px] block w-full min-w-0 break-words whitespace-pre-wrap [overflow-wrap:anywhere]`}
        />
      )}
    </div>
  );
}
