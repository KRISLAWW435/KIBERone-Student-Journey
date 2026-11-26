import React, { useEffect, useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';
import {
  ActiveTextFieldTarget,
  AgeCategory,
  MediaAsset,
  ModuleItem,
} from '../../types/journal';
import { InlineEditableText } from './DecorLayer';

interface ModuleCardProps {
  module: ModuleItem;
  index: number;
  ageCategory: AgeCategory;
  mediaAssets?: MediaAsset[];
  compact?: boolean;
  density?: 'spacious' | 'compact' | 'ultra';
  wide?: boolean;
  isActive?: boolean;
  activeTextField?: ActiveTextFieldTarget;
  onSelectTextField?: (target: ActiveTextFieldTarget) => void;
  onClick?: () => void;
  onUpdateField?: (patch: Partial<ModuleItem>) => void;
  onBeginEdit?: () => void;
  onEndEdit?: () => void;
}

export function ModuleCard({
  module,
  index,
  ageCategory,
  mediaAssets,
  compact = false,
  density,
  wide = false,
  isActive = false,
  activeTextField,
  onSelectTextField,
  onClick,
}: ModuleCardProps) {
  const resolvedDensity = density ?? (compact ? 'compact' : 'spacious');
  const isUltra = resolvedDensity === 'ultra';
  const isCompact = resolvedDensity === 'compact' || isUltra;
  const tiltDeg =
    ageCategory === '12-14' || ageCategory === '14-15'
      ? index % 3 === 0
        ? -0.6
        : index % 3 === 1
        ? 0.6
        : -0.5
      : index % 3 === 0
      ? -1.4
      : index % 3 === 1
      ? 1.2
      : -1.1;

  const variant = module.layoutVariant ?? 'classic';
  const imgScale = module.imageScale ?? 1;
  const imgX = module.imagePosX ?? 0;
  const imgY = module.imagePosY ?? 0;

  const linkedMediaUrl =
    module.imageMediaId && mediaAssets
      ? mediaAssets.find((a) => a.id === module.imageMediaId)?.url
      : undefined;
  const resolvedImageUrl = linkedMediaUrl || module.customImageUrl;

  const [imgError, setImgError] = useState(false);
  useEffect(() => {
    setImgError(false);
  }, [resolvedImageUrl]);

  const tapeCorner =
    index % 3 === 0
      ? { pos: '-top-[8px] -left-[16px]', rot: '-32deg' }
      : index % 3 === 1
      ? { pos: '-top-[8px] -right-[16px]', rot: '28deg' }
      : { pos: '-top-[8px] -left-[13px]', rot: '-22deg' };

  const hasImage = Boolean(resolvedImageUrl) && !imgError;
  const headerBgColor = hasImage ? module.cardBgColor || '#C9F3EE' : '#F4F4F5';

  return (
    <div
      data-card-label={`Модуль: ${module.title}`}
      onClick={(e) => {
        if (!onClick) return;
        e.stopPropagation();
        onClick();
      }}
      style={{ transform: `rotate(${tiltDeg}deg)` }}
      className={`relative w-full h-full min-w-0 box-border overflow-visible bg-white border-[1.7px] border-[#18181B] rounded-xl shadow-[0_8px_18px_rgba(17,24,39,0.13),0_2px_5px_rgba(17,24,39,0.08)] flex flex-col self-stretch ${
        onClick ? 'editable-block' : ''
      } ${isActive ? 'editable-block-active' : ''}`}
    >
      {/* Translucent Masking Tape ("Скотч") anchoring the card corner onto paper */}
      <svg
        aria-hidden="true"
        viewBox="0 0 64 20"
        style={{ transform: `rotate(${tapeCorner.rot})` }}
        className={`pointer-events-none absolute ${tapeCorner.pos} w-[52px] h-[17px] z-20 drop-shadow-[0_1px_2px_rgba(17,24,39,0.14)]`}
        fill="none"
      >
        <path
          d="M3 2 L61 1.5 L59 6.5 L62 11.5 L59.5 18 L2.5 18.5 L5 12 L2 6.5 Z"
          fill="rgba(254, 240, 138, 0.72)"
          stroke="rgba(180, 155, 60, 0.42)"
          strokeWidth="0.9"
        />
        <line
          x1="10"
          y1="6.5"
          x2="52"
          y2="6"
          stroke="rgba(255, 255, 255, 0.48)"
          strokeWidth="1.2"
        />
      </svg>

      {/* Inner surface: graphic rounded cleanly at top; text adapts height cleanly without clipping */}
      <div className="rounded-[10px] w-full min-w-0 box-border overflow-hidden flex flex-col flex-1 bg-white">
        {/* Badge-top variant header */}
        {variant === 'badge-top' && (
          <div className="flex items-center justify-between gap-1.5 px-[8px] pt-[6px] pb-[4px] bg-white border-b border-black/8 shrink-0 min-w-0">
            <span
              style={{ backgroundColor: headerBgColor }}
              className="text-[9.5px] font-bold px-[7px] py-[2px] rounded-full border border-black/15 text-[#111827] min-w-0 max-w-[82%] whitespace-pre-wrap [overflow-wrap:anywhere] text-left leading-tight"
            >
              {module.subtitle || 'Модуль'}
            </span>
            <span className="font-mono text-[9.5px] text-zinc-500 shrink-0">
              0{index + 1}
            </span>
          </div>
        )}

        {/* Inner content wrapper: horizontal when single wide module, vertical otherwise */}
        <div
          className={`flex flex-1 min-w-0 box-border ${
            wide ? 'flex-row items-stretch' : 'flex-col'
          }`}
        >
          {/* Colored Upper/Left Graphic Container (full uncropped object-contain + center scale/shift) */}
          {variant !== 'minimal' && (
            <div
              style={{ backgroundColor: headerBgColor }}
              className={`${
                wide
                  ? 'w-[220px] shrink-0 min-h-[138px] max-h-[164px] p-[8px] border-r-[1.4px] border-[#18181B]/12'
                  : isUltra
                  ? 'w-full h-[64px] p-[3px] border-b-[1.4px] border-[#18181B]/12 shrink-0'
                  : isCompact
                  ? 'w-full aspect-[4/3] max-h-[132px] p-[3px] border-b-[1.4px] border-[#18181B]/12 shrink-0'
                  : 'w-full aspect-[4/3] max-h-[164px] p-[4px] border-b-[1.4px] border-[#18181B]/12 shrink-0'
              } overflow-hidden flex items-center justify-center relative`}
            >
              {hasImage && resolvedImageUrl ? (
                <img
                  src={resolvedImageUrl}
                  alt={module.title}
                  referrerPolicy="no-referrer"
                  onError={() => setImgError(true)}
                  style={{
                    transform: `translate(${imgX}px, ${imgY}px) scale(${imgScale})`,
                    transformOrigin: 'center center',
                  }}
                  className="w-full h-full object-contain drop-shadow-[0_6px_12px_rgba(15,23,42,0.16)] transition-transform duration-150"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[#F4F4F5] text-zinc-400">
                  <ImageIcon
                    className={
                      isUltra
                        ? 'w-[22px] h-[22px] stroke-[1.6]'
                        : isCompact
                        ? 'w-[28px] h-[28px] stroke-[1.6]'
                        : 'w-[34px] h-[34px] stroke-[1.6]'
                    }
                  />
                </div>
              )}
            </div>
          )}

          {/* White Text Content Area */}
          <div
            className={`bg-white flex-1 flex flex-col w-full min-w-0 box-border ${
              wide
                ? 'text-left justify-center px-[16px] py-[12px]'
                : isUltra
                ? 'text-center justify-start px-[6px] py-[4px]'
                : isCompact
                ? 'text-center justify-start px-[7px] py-[6px]'
                : 'text-center justify-start px-[10px] py-[8px]'
            }`}
          >
            <InlineEditableText
              value={module.title}
              onSelectText={
                onSelectTextField
                  ? () =>
                      onSelectTextField({
                        page: 1,
                        field: 'moduleTitle',
                        itemId: module.id,
                      })
                  : undefined
              }
              isSelected={
                activeTextField?.page === 1 &&
                activeTextField.field === 'moduleTitle' &&
                activeTextField.itemId === module.id
              }
              as="h3"
              className={`font-journal-display font-extrabold ${
                wide
                  ? 'text-[16px] leading-[1.18]'
                  : isUltra
                  ? 'text-[11px] leading-[1.12]'
                  : isCompact
                  ? 'text-[12px] leading-[1.16]'
                  : 'text-[13.5px] leading-[1.16]'
              } text-[#111827] block w-full min-w-0 box-border whitespace-pre-wrap [overflow-wrap:anywhere]`}
            />
            {variant !== 'badge-top' && (module.subtitle || onSelectTextField) && (
              <InlineEditableText
                value={module.subtitle}
                placeholder="Подзаголовок"
                onSelectText={
                  onSelectTextField
                    ? () =>
                        onSelectTextField({
                          page: 1,
                          field: 'moduleSubtitle',
                          itemId: module.id,
                        })
                    : undefined
                }
                isSelected={
                  activeTextField?.page === 1 &&
                  activeTextField.field === 'moduleSubtitle' &&
                  activeTextField.itemId === module.id
                }
                as="div"
                className={`font-bold ${
                  wide
                    ? 'text-[11.5px] leading-tight mt-[3px]'
                    : isUltra
                    ? 'text-[8.5px] leading-tight mt-[1px]'
                    : isCompact
                    ? 'text-[9.5px] leading-tight mt-[2px]'
                    : 'text-[10.5px] leading-tight mt-[2px]'
                } text-[#111827]/85 block w-full min-w-0 box-border whitespace-pre-wrap [overflow-wrap:anywhere]`}
              />
            )}
            <InlineEditableText
              value={module.description}
              placeholder="Описание модуля"
              onSelectText={
                onSelectTextField
                  ? () =>
                      onSelectTextField({
                        page: 1,
                        field: 'moduleDescription',
                        itemId: module.id,
                      })
                  : undefined
              }
              isSelected={
                activeTextField?.page === 1 &&
                activeTextField.field === 'moduleDescription' &&
                activeTextField.itemId === module.id
              }
              as="p"
              className={`font-journal-body ${
                wide
                  ? 'text-[11.5px] leading-[1.4] mt-[6px]'
                  : isUltra
                  ? 'text-[8.5px] leading-[1.22] mt-[2px]'
                  : isCompact
                  ? 'text-[9.5px] leading-[1.3] mt-[2px]'
                  : 'text-[10.5px] leading-[1.38] mt-[4px]'
              } text-[#27272A] block w-full min-w-0 box-border whitespace-pre-wrap [overflow-wrap:anywhere]`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
