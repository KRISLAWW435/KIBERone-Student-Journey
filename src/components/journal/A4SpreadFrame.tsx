import React from 'react';

export const A4_PAGE_WIDTH = 794;
export const A4_PAGE_HEIGHT = 1123;
export const A4_SPREAD_GAP = 16;

interface A4PageSlotProps {
  className?: string;
  children: React.ReactNode;
}

/**
 * Rigid A4 portrait slot (794x1123px / aspect-ratio 210/297).
 * Guarantees JournalPageOne and JournalPageTwo are never flex-shrunk or re-laid out.
 */
export function A4PageSlot({ className = '', children }: A4PageSlotProps) {
  return (
    <div
      style={{
        width: `${A4_PAGE_WIDTH}px`,
        height: `${A4_PAGE_HEIGHT}px`,
        minWidth: `${A4_PAGE_WIDTH}px`,
        minHeight: `${A4_PAGE_HEIGHT}px`,
        maxWidth: `${A4_PAGE_WIDTH}px`,
        maxHeight: `${A4_PAGE_HEIGHT}px`,
        aspectRatio: '210 / 297',
      }}
      className={`shrink-0 overflow-hidden bg-white ${className}`}
    >
      {children}
    </div>
  );
}
