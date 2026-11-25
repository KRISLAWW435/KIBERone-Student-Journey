import React from 'react';
import {
  ActiveTextFieldTarget,
  AgeCategory,
  SkillItem,
} from '../../types/journal';
import { InlineEditableText } from './DecorLayer';
import { SkillCircleIcon } from './JournalArtwork';

interface SkillTagProps {
  skill: SkillItem;
  index?: number;
  compact?: boolean;
  ageCategory: AgeCategory;
  activeTextField?: ActiveTextFieldTarget;
  onSelectTextField?: (target: ActiveTextFieldTarget) => void;
  onChangeLabel?: (next: string) => void;
  onBeginEdit?: () => void;
  onEndEdit?: () => void;
}

const REFERENCE_SKILL_COLORS = ['#FFD426', '#7EB2EC', '#4ECDC4', '#F87B72'];

const LEGACY_PALE_COLORS = new Set([
  '#E6FAF8',
  '#CCFBF1',
  '#D1FAE5',
  '#E0F2FE',
  '#F1F5F9',
  '#FEF9C3',
]);

export function SkillTag({
  skill,
  index = 0,
  compact = false,
  activeTextField,
  onSelectTextField,
}: SkillTagProps) {
  const normalizedBg = (skill.bgColor || '').trim().toUpperCase();
  const cardBg =
    !normalizedBg || LEGACY_PALE_COLORS.has(normalizedBg)
      ? REFERENCE_SKILL_COLORS[index % REFERENCE_SKILL_COLORS.length]
      : skill.bgColor;

  return (
    <div className={compact ? 'pt-[12px] h-full flex' : 'pt-[14px] h-full flex'}>
      <div
        style={{ backgroundColor: cardBg }}
        className={`relative w-full rounded-[12px] ${
          compact
            ? 'pt-[16px] pb-[6px] px-[8px] min-h-[44px]'
            : 'pt-[19px] pb-[7px] px-[10px] min-h-[50px]'
        } flex items-center justify-center text-center shadow-[0_3px_8px_rgba(17,24,39,0.08)] border border-[#18181B]/10`}
      >
        {/* Protruding Top-Center White Circular Icon Badge */}
        <div
          className={`absolute left-1/2 -translate-x-1/2 rounded-full bg-white border-[1.6px] border-[#18181B] shadow-[0_2px_4px_rgba(0,0,0,0.08)] flex items-center justify-center ${
            compact
              ? '-top-[12px] w-[28px] h-[28px]'
              : '-top-[14px] w-[32px] h-[32px]'
          }`}
        >
          <SkillCircleIcon
            label={skill.label}
            index={index}
            className={compact ? 'w-[17px] h-[17px]' : 'w-[19px] h-[19px]'}
          />
        </div>

        <InlineEditableText
          value={skill.label}
          onSelectText={
            onSelectTextField
              ? () =>
                  onSelectTextField({
                    page: 1,
                    field: 'skillLabel',
                    itemId: skill.id,
                  })
              : undefined
          }
          isSelected={
            activeTextField?.page === 1 &&
            activeTextField.field === 'skillLabel' &&
            activeTextField.itemId === skill.id
          }
          as="span"
          className={`font-extrabold ${
            compact ? 'text-[11px]' : 'text-[12px]'
          } leading-[1.14] text-[#111827] text-center block w-full`}
        />
      </div>
    </div>
  );
}
