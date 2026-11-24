import React from 'react';
import { AgeCategory, MediaAsset, ModuleItem } from '../../types/journal';
import { ModuleLucideIcon, ModuleSvgIllustration } from './JournalArtwork';

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
      ? -1.2
      : index % 3 === 1
      ? 1.0
      : -1.0;

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
      className={`bg-white border-[1.5px] border-[#18181B] rounded-xl ${
        compact ? 'p-2' : 'p-2.5'
      } shadow-[0_4px_10px_rgba(0,0,0,0.08)] flex flex-col ${
        onClick ? 'editable-block' : ''
      } ${isActive ? 'editable-block-active' : ''}`}
    >
      {/* Badge-top variant header */}
      {variant === 'badge-top' && (
        <div className="flex items-center justify-between px-1 mb-1.5">
          <span
            style={{ backgroundColor: module.cardBgColor }}
            className="text-[9.5px] font-bold px-2 py-0.5 rounded-full border border-black/15 text-[#111827]"
          >
            {module.subtitle || 'Модуль'}
          </span>
          <span className="font-mono text-[9px] text-zinc-400">
            0{index + 1}
          </span>
        </div>
      )}

      {/* Colored Graphic Container */}
      {variant !== 'minimal' && (
        <div
          style={{ backgroundColor: module.cardBgColor }}
          className={`w-full ${
            compact ? 'h-[68px]' : 'h-[84px]'
          } rounded-lg border border-black/10 overflow-hidden flex items-center justify-center mb-2 shrink-0`}
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
              <div className="w-14 h-14 rounded-2xl bg-white/85 border-[1.5px] border-[#18181B] shadow-[0_2px_0_rgba(24,24,27,0.18)] flex items-center justify-center">
                <ModuleLucideIcon
                  iconKey={module.iconKey}
                  className="w-8 h-8 text-[#18181B]"
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

      {/* Text Content */}
      <div className="text-center px-1 pb-0.5 flex-1 flex flex-col justify-start">
        <h3
          className={`font-extrabold ${
            compact ? 'text-[13.5px]' : 'text-[15px]'
          } leading-[1.15] text-[#111827]`}
        >
          {module.title}
        </h3>
        {variant !== 'badge-top' && module.subtitle && (
          <div className="font-bold text-[12px] leading-tight text-[#111827]/90 mt-0.5">
            {module.subtitle}
          </div>
        )}
        <p
          className={`${
            compact ? 'text-[10px]' : 'text-[11px]'
          } leading-[1.3] text-[#374151] mt-1 line-clamp-3`}
        >
          {module.description}
        </p>
      </div>
    </div>
  );
}
