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
      className={`bg-[#E6FAF8] border-[1.5px] border-[#0D9488]/45 px-[14px] py-[7px] text-center shadow-[0_1px_0_rgba(13,148,136,0.14)] flex items-center justify-center ${
        isTeen ? 'rounded-xl' : 'rounded-full'
      }`}
    >
      <span className="font-semibold text-[12px] leading-[1.2] text-[#0F172A]">
        {skill.label}
      </span>
    </div>
  );
}
