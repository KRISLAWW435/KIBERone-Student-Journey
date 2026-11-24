import React from 'react';
import { AgeCategory, StrengthItem } from '../../types/journal';
import { StrengthLineIcon } from './JournalArtwork';

interface StrengthCardProps {
  strength: StrengthItem;
  ageCategory: AgeCategory;
  compact?: boolean;
}

export function StrengthCard({
  strength,
  ageCategory,
  compact = false,
}: StrengthCardProps) {
  return (
    <div
      style={{ backgroundColor: strength.bgColor }}
      className="rounded-xl px-[12px] py-[10px] flex flex-col items-center justify-center text-center border border-black/15 shadow-[0_2px_6px_rgba(0,0,0,0.04)] self-stretch"
    >
      <div className="mb-[6px] shrink-0">
        <StrengthLineIcon type={strength.iconKey} size={compact ? 30 : 34} />
      </div>
      <div className="font-extrabold text-[13px] leading-[1.2] text-[#111827]">
        {strength.title}
      </div>
      {!compact && strength.example && (
        <p className="text-[11px] leading-[1.3] font-medium text-[#111827] mt-[4px] line-clamp-2">
          {strength.example}
        </p>
      )}
    </div>
  );
}
