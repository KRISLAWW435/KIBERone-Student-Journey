import React from 'react';
import {
  ActiveTextFieldTarget,
  AgeCategory,
  MediaAsset,
  ModuleItem,
} from '../../types/journal';
import { InlineEditableText } from './DecorLayer';
import { ModuleSvgIllustration, ModuleVectorIcon } from './JournalArtwork';

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
    ageCategory === '14-15'
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

  const effectiveMode =
    module.visualMode ?? (resolvedImageUrl ? 'image' : 'illustration');

  const tapeCorner =
    index % 3 === 0
      ? { pos: '-top-[8px] -left-[16px]', rot: '-32deg' }
      : index % 3 === 1
      ? { pos: '-top-[8px] -right-[16px]', rot: '28deg' }
      : { pos: '-top-[8px] -left-[13px]', rot: '-22deg' };

  return (
    <div
      onClick={(e) => {
        if (!onClick) return;
        e.stopPropagation();
        onClick();
      }}
      style={{ transform: `rotate(${tiltDeg}deg)` }}
      className={`relative overflow-visible bg-white border-[1.7px] border-[#18181B] rounded-xl ${
        compact ? 'p-[8px]' : 'p-[10px]'
      } shadow-[0_8px_18px_rgba(17,24,39,0.13),0_2px_5px_rgba(17,24,39,0.08)] flex flex-col self-stretch ${
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
      {/* Badge-top variant header */}
      {variant === 'badge-top' && (
        <div className="flex items-center justify-between px-[4px] mb-[5px] shrink-0">
          <span
            style={{ backgroundColor: module.cardBgColor }}
            className="text-[10px] font-bold px-[8px] py-[1.5px] rounded-full border border-black/15 text-[#111827]"
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
            height: compact ? '48px' : '64px',
          }}
          className="self-stretch rounded-lg border border-black/12 overflow-hidden flex items-center justify-center mb-[7px] shrink-0 relative"
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
                  compact ? 'w-[42px] h-[42px]' : 'w-[52px] h-[52px]'
                } rounded-2xl bg-white border-[1.6px] border-[#18181B] shadow-[0_4px_10px_rgba(24,24,27,0.14)] flex items-center justify-center`}
              >
                <ModuleVectorIcon
                  iconKey={module.iconKey}
                  className={compact ? 'w-[30px] h-[30px]' : 'w-[38px] h-[38px]'}
                />
              </div>
            </div>
          ) : (
            <div
              style={{
                transform: `translate(${imgX}px, ${imgY}px) scale(${imgScale})`,
                filter:
                  'drop-shadow(1.5px 0 0 rgba(255,255,255,0.85)) drop-shadow(-1.5px 0 0 rgba(255,255,255,0.85)) drop-shadow(0 1.5px 0 rgba(255,255,255,0.85)) drop-shadow(0 -1.5px 0 rgba(255,255,255,0.85))',
              }}
              className="w-full h-full"
            >
              <ModuleSvgIllustration type={module.illustrationKey} />
            </div>
          )}
        </div>
      )}

      {/* Text Content (print-legible body copy, stretched card baseline) */}
      <div className="text-center px-[3px] flex-1 flex flex-col justify-start">
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
            compact ? 'text-[12.5px]' : 'text-[14px]'
          } leading-[1.18] text-[#111827] block`}
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
            className="font-bold text-[10.5px] leading-tight text-[#111827]/90 mt-[2px] block"
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
              ? 'text-[10px] leading-[1.35] line-clamp-2'
              : 'text-[10.5px] leading-[1.42] line-clamp-3'
          } text-[#27272A] mt-[4px] block`}
        />
      </div>
    </div>
  );
}
