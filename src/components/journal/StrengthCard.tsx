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
      style={{ backgroundColor: strength.bgColor || '#CFEFF2' }}
      className={`rounded-2xl ${
        compact ? 'px-[12px] py-[9px]' : 'px-[14px] py-[12px]'
      } flex flex-col items-center justify-center text-center border border-black/10 shadow-[0_2px_6px_rgba(0,0,0,0.04)] self-stretch h-full`}
    >
      <div className={`${compact ? 'mb-[5px]' : 'mb-[7px]'} shrink-0`}>
        <StrengthLineIcon type={strength.iconKey} size={compact ? 30 : 38} />
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
        className={`font-extrabold ${
          compact ? 'text-[13px]' : 'text-[14.5px]'
        } leading-[1.18] text-[#111827] block w-full`}
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
          className={`${
            compact ? 'text-[10.5px]' : 'text-[11px]'
          } leading-[1.3] font-medium text-[#27272A] mt-[4px] block w-full`}
        />
      )}
    </div>
  );
}
