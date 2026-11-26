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
      className="min-w-0 box-border flex"
    >
      <div
        style={{ backgroundColor: cardBg }}
        className={`relative w-full min-w-[100px] max-w-[162px] box-border rounded-[11px] ${
          isUltra
            ? 'px-[6.5px] py-[3.5px] min-h-[32px] gap-[5px]'
            : isCompact
            ? 'px-[7px] py-[4px] min-h-[34px] gap-[5px]'
            : 'px-[8px] py-[4.5px] min-h-[36px] gap-[6px]'
        } flex items-center justify-start text-left shadow-[0_4px_10px_rgba(17,24,39,0.10),0_1.5px_3px_rgba(17,24,39,0.07)] border-[1.6px] border-[#18181B]`}
      >
        <div
          className={`shrink-0 rounded-full bg-white border-[1.4px] border-[#18181B] shadow-[0_2px_4px_rgba(17,24,39,0.12)] flex items-center justify-center ${
            isUltra
              ? 'w-[20px] h-[20px]'
              : isCompact
              ? 'w-[21px] h-[21px]'
              : 'w-[22px] h-[22px]'
          }`}
        >
          <SkillCircleIcon
            label={skill.label}
            index={index}
            className={
              isUltra
                ? 'w-[12px] h-[12px]'
                : isCompact
                ? 'w-[12.5px] h-[12.5px]'
                : 'w-[13px] h-[13px]'
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
            isUltra
              ? 'text-[9.5px] leading-[1.12]'
              : isCompact
              ? 'text-[9.5px] leading-[1.14]'
              : 'text-[10px] leading-[1.15]'
          } text-[#111827] text-left block min-w-0 flex-1 box-border whitespace-pre-wrap [overflow-wrap:anywhere]`}
        />
      </div>
    </div>
  );
}
