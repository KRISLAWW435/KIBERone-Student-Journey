import React from 'react';
import { AgeCategory, MediaAsset, ModuleItem } from '../../types/journal';
import { ModuleSvgIllustration, ModuleVectorIcon } from './JournalArtwork';

interface ModuleCardProps {
  module: ModuleItem;
  index: number;
  ageCategory: AgeCategory;
  mediaAssets?: MediaAsset[];
  compact?: boolean;
  isActive?: boolean;
  onClick?: () => void;
}

export function ModuleCard({
  module,
  index,
  ageCategory,
  mediaAssets,
  compact = false,
  isActive = false,
  onClick,
}: ModuleCardProps) {
  const tiltDeg =
    ageCategory === '14-15'
      ? 0
      : index % 3 === 0
      ? -1.1
      : index % 3 === 1
      ? 0.9
      : -0.9;

  const variant = module.layoutVariant ?? 'classic';
  const imgScale = module.imageScale ?? 1;
  const imgX = module.imagePosX ?? 0;
  const imgY = module.imagePosY ?? 0;

  const linkedMediaUrl =
    module.imageMediaId && mediaAssets
      ? mediaAssets.find((a) => a.id === module.imageMediaId)?.url
      : undefined;
  const resolvedImageUrl = linkedMediaUrl || module.customImageUrl;

  const effectiveMode =
    module.visualMode ?? (resolvedImageUrl ? 'image' : 'illustration');

  return (
    <div
      onClick={(e) => {
        if (!onClick) return;
        e.stopPropagation();
        onClick();
      }}
      style={{ transform: `rotate(${tiltDeg}deg)` }}
      className={`bg-white border-[1.5px] border-[#18181B] rounded-xl p-[12px] shadow-[0_4px_10px_rgba(0,0,0,0.08)] flex flex-col self-stretch ${
        onClick ? 'editable-block' : ''
      } ${isActive ? 'editable-block-active' : ''}`}
    >
      {/* Badge-top variant header */}
      {variant === 'badge-top' && (
        <div className="flex items-center justify-between px-[4px] mb-[6px] shrink-0">
          <span
            style={{ backgroundColor: module.cardBgColor }}
            className="text-[10px] font-bold px-[8px] py-[2px] rounded-full border border-black/15 text-[#111827]"
          >
            {module.subtitle || 'Модуль'}
          </span>
          <span className="font-mono text-[9.5px] text-zinc-500">
            0{index + 1}
          </span>
        </div>
      )}

      {/* Colored Graphic Container */}
      {variant !== 'minimal' && (
        <div
          style={{
            backgroundColor: module.cardBgColor,
            height: compact ? '70px' : '82px',
          }}
          className="self-stretch rounded-lg border border-black/10 overflow-hidden flex items-center justify-center mb-[10px] shrink-0 relative"
        >
          {effectiveMode === 'image' && resolvedImageUrl ? (
            <img
              src={resolvedImageUrl}
              alt={module.title}
              referrerPolicy="no-referrer"
              style={{
                transform: `translate(${imgX}px, ${imgY}px) scale(${imgScale})`,
              }}
              className="w-full h-full object-cover transition-transform duration-150"
            />
          ) : effectiveMode === 'icon' ? (
            <div
              style={{
                transform: `translate(${imgX}px, ${imgY}px) scale(${imgScale})`,
              }}
              className="flex items-center justify-center w-full h-full"
            >
              <div
                className={`${
                  compact ? 'w-[54px] h-[54px]' : 'w-[62px] h-[62px]'
                } rounded-2xl bg-white/65 border-[1.5px] border-[#18181B]/15 shadow-[0_3px_10px_rgba(24,24,27,0.08)] flex items-center justify-center`}
              >
                <ModuleVectorIcon
                  iconKey={module.iconKey}
                  className={compact ? 'w-[38px] h-[38px]' : 'w-[44px] h-[44px]'}
                />
              </div>
            </div>
          ) : (
            <div
              style={{
                transform: `translate(${imgX}px, ${imgY}px) scale(${imgScale})`,
              }}
              className="w-full h-full"
            >
              <ModuleSvgIllustration type={module.illustrationKey} />
            </div>
          )}
        </div>
      )}

      {/* Text Content (print-legible body copy, stretched card baseline) */}
      <div className="text-center px-[4px] flex-1 flex flex-col justify-start">
        <h3
          className={`font-extrabold ${
            compact ? 'text-[14px]' : 'text-[15px]'
          } leading-[1.18] text-[#111827]`}
        >
          {module.title}
        </h3>
        {variant !== 'badge-top' && module.subtitle && (
          <div className="font-bold text-[12px] leading-tight text-[#111827]/90 mt-[3px]">
            {module.subtitle}
          </div>
        )}
        <p
          className={`${
            compact ? 'text-[11.5px] leading-[1.34]' : 'text-[12px] leading-[1.38]'
          } text-[#27272A] mt-[5px] line-clamp-3`}
        >
          {module.description}
        </p>
      </div>
    </div>
  );
}
