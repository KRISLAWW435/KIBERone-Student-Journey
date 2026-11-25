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
  isActive = false,
  activeTextField,
  onSelectTextField,
  onClick,
}: ModuleCardProps) {
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
      onClick={(e) => {
        if (!onClick) return;
        e.stopPropagation();
        onClick();
      }}
      style={{ transform: `rotate(${tiltDeg}deg)` }}
      className={`relative overflow-visible bg-white border-[1.7px] border-[#18181B] rounded-xl shadow-[0_8px_18px_rgba(17,24,39,0.13),0_2px_5px_rgba(17,24,39,0.08)] flex flex-col self-stretch ${
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

      {/* Clipped inner surface so top color block fills top edge cleanly and bottom text stays pure white */}
      <div className="rounded-[10px] overflow-hidden flex flex-col flex-1 bg-white">
        {/* Badge-top variant header */}
        {variant === 'badge-top' && (
          <div className="flex items-center justify-between px-[8px] pt-[6px] pb-[4px] bg-white border-b border-black/8 shrink-0">
            <span
              style={{ backgroundColor: headerBgColor }}
              className="text-[9.5px] font-bold px-[7px] py-[1px] rounded-full border border-black/15 text-[#111827] truncate"
            >
              {module.subtitle || 'Модуль'}
            </span>
            <span className="font-mono text-[9.5px] text-zinc-500">
              0{index + 1}
            </span>
          </div>
        )}

        {/* 4:3 Colored Upper Graphic Container (object-fit: contain) */}
        {variant !== 'minimal' && (
          <div
            style={{ backgroundColor: headerBgColor }}
            className={`w-full aspect-[4/3] ${
              compact ? 'max-h-[126px] p-[6px]' : 'max-h-[154px] p-[8px]'
            } border-b-[1.4px] border-[#18181B]/12 overflow-hidden flex items-center justify-center shrink-0 relative`}
          >
            {hasImage && resolvedImageUrl ? (
              <img
                src={resolvedImageUrl}
                alt={module.title}
                referrerPolicy="no-referrer"
                onError={() => setImgError(true)}
                style={{
                  transform: `translate(${imgX}px, ${imgY}px) scale(${imgScale})`,
                }}
                className="w-full h-full object-contain drop-shadow-[0_6px_12px_rgba(15,23,42,0.16)] transition-transform duration-150"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-[#F4F4F5] text-zinc-400">
                <ImageIcon
                  className={
                    compact ? 'w-[28px] h-[28px] stroke-[1.6]' : 'w-[34px] h-[34px] stroke-[1.6]'
                  }
                />
              </div>
            )}
          </div>
        )}

        {/* White Text Content Area */}
        <div
          className={`bg-white text-center flex-1 flex flex-col justify-start ${
            compact ? 'px-[7px] py-[6px]' : 'px-[10px] py-[8px]'
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
              compact ? 'text-[12px]' : 'text-[13.5px]'
            } leading-[1.16] text-[#111827] block`}
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
                compact ? 'text-[9.5px]' : 'text-[10.5px]'
              } leading-tight text-[#111827]/85 mt-[2px] block`}
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
              compact
                ? 'text-[9.5px] leading-[1.3] line-clamp-2 mt-[2px]'
                : 'text-[10.5px] leading-[1.38] line-clamp-3 mt-[4px]'
            } text-[#27272A] block`}
          />
        </div>
      </div>
    </div>
  );
}
