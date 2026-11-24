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
      className="rounded-xl px-3 py-2.5 flex flex-col items-center justify-center text-center border border-black/8 shadow-[0_2px_6px_rgba(0,0,0,0.04)]"
    >
      <div className="mb-1">
        <StrengthLineIcon type={strength.iconKey} />
      </div>
      <div className="font-bold text-[12.5px] leading-[1.2] text-[#111827]">
        {strength.title}
      </div>
      {!compact && strength.example && ageCategory !== '8-10' && (
        <p className="text-[9.5px] leading-[1.25] text-[#111827]/75 mt-1 line-clamp-2">
          {strength.example}
        </p>
      )}
    </div>
  );
}
