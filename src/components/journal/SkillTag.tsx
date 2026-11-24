import React from 'react';
import { AgeCategory, SkillItem } from '../../types/journal';

interface SkillTagProps {
  skill: SkillItem;
  ageCategory: AgeCategory;
}

export function SkillTag({ skill, ageCategory }: SkillTagProps) {
  const isTeen = ageCategory === '14-15';

  return (
    <div
      style={{ backgroundColor: skill.bgColor }}
      className={`border-[1.5px] border-[#18181B] px-4 py-2 text-center shadow-[0_2px_0_rgba(24,24,27,0.16)] flex items-center justify-center ${
        isTeen ? 'rounded-xl' : 'rounded-full'
      }`}
    >
      <span className="font-semibold text-[12px] leading-[1.18] text-[#111827]">
        {skill.label}
      </span>
    </div>
  );
}
