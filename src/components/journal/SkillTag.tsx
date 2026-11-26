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
  density?: 'spacious' | 'compact' | 'ultra';
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
  density,
  activeTextField,
  onSelectTextField,
}: SkillTagProps) {
  const resolvedDensity = density ?? (compact ? 'compact' : 'spacious');
  const isUltra = resolvedDensity === 'ultra';
  const isCompact = resolvedDensity === 'compact' || isUltra;
  const normalizedBg = (skill.bgColor || '').trim().toUpperCase();
  const cardBg =
    !normalizedBg || LEGACY_PALE_COLORS.has(normalizedBg)
      ? REFERENCE_SKILL_COLORS[index % REFERENCE_SKILL_COLORS.length]
      : skill.bgColor;

  return (
    <div
      data-card-label={`Навык: ${skill.label}`}
      className={`${
        isUltra ? 'pt-[9px]' : isCompact ? 'pt-[12px]' : 'pt-[14px]'
      } h-full min-w-0 box-border flex`}
    >
      <div
        style={{ backgroundColor: cardBg }}
        className={`relative w-full min-w-0 box-border rounded-[12px] ${
          isUltra
            ? 'pt-[12px] pb-[4px] px-[6px] min-h-[34px]'
            : isCompact
            ? 'pt-[16px] pb-[6px] px-[8px] min-h-[44px]'
            : 'pt-[19px] pb-[7px] px-[10px] min-h-[50px]'
        } flex items-center justify-center text-center shadow-[0_5px_12px_rgba(17,24,39,0.12),0_2px_4px_rgba(17,24,39,0.08)] border-[1.6px] border-[#18181B]`}
      >
        {/* Protruding Top-Center White Circular Icon Badge */}
        <div
          className={`absolute left-1/2 -translate-x-1/2 rounded-full bg-white border-[1.6px] border-[#18181B] shadow-[0_3px_6px_rgba(17,24,39,0.14)] flex items-center justify-center ${
            isUltra
              ? '-top-[9px] w-[22px] h-[22px]'
              : isCompact
              ? '-top-[12px] w-[28px] h-[28px]'
              : '-top-[14px] w-[32px] h-[32px]'
          }`}
        >
          <SkillCircleIcon
            label={skill.label}
            index={index}
            className={
              isUltra
                ? 'w-[13px] h-[13px]'
                : isCompact
                ? 'w-[17px] h-[17px]'
                : 'w-[19px] h-[19px]'
            }
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
            isUltra ? 'text-[10px] leading-[1.1]' : isCompact ? 'text-[11px] leading-[1.14]' : 'text-[12px] leading-[1.14]'
          } text-[#111827] text-center block w-full min-w-0 box-border whitespace-pre-wrap [overflow-wrap:anywhere]`}
        />
      </div>
    </div>
  );
}
