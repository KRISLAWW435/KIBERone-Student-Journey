import React from 'react';
import { ActiveTextFieldTarget, ProjectItem } from '../../types/journal';
import { InlineEditableText } from './DecorLayer';
import { ProjectFallbackGraphic } from './JournalArtwork';

interface ProjectCardProps {
  project: ProjectItem;
  compact?: boolean;
  density?: 'spacious' | 'compact' | 'ultra';
  layoutVariant?: 'single' | 'double' | 'multi';
  singleRow?: boolean;
  itemCount?: number;
  imageHeightPx?: number;
  stretchHeight?: boolean;
  isActive?: boolean;
  activeTextField?: ActiveTextFieldTarget;
  onSelectTextField?: (target: ActiveTextFieldTarget) => void;
  onClick?: () => void;
  onUpdateField?: (patch: Partial<ProjectItem>) => void;
  onBeginEdit?: () => void;
  onEndEdit?: () => void;
}

export function ProjectCard({
  project,
  compact = false,
  density,
  layoutVariant = 'multi',
  singleRow = false,
  itemCount,
  imageHeightPx,
  isActive = false,
  activeTextField,
  onSelectTextField,
  onClick,
}: ProjectCardProps) {
  const resolvedDensity = density ?? (compact ? 'compact' : 'spacious');
  const isUltra = resolvedDensity === 'ultra';
  const isCompact = resolvedDensity === 'compact' || isUltra;

  const imgScale = project.imageScale ?? 1;
  const imgX = project.imagePosX ?? 0;
  const imgY = project.imagePosY ?? 0;
  const imgFit = project.imageFit === 'contain' ? 'contain' : 'cover';

  const displayTitle = project.title?.trim() || 'Мой проект';
  const displayCaption =
    project.caption?.trim() ||
    project.description?.trim() ||
    'Краткое описание проекта';

  const fixedImageHeight =
    imageHeightPx !== undefined
      ? `${imageHeightPx}px`
      : layoutVariant === 'single'
      ? isUltra
        ? '132px'
        : isCompact
        ? '168px'
        : '214px'
      : layoutVariant === 'double'
      ? isUltra
        ? singleRow
          ? '128px'
          : '80px'
        : isCompact
        ? singleRow
          ? '152px'
          : '108px'
        : '188px'
      : isUltra
      ? singleRow
        ? '102px'
        : '78px'
      : isCompact
      ? singleRow
        ? '132px'
        : '104px'
      : '164px';

  return (
    <div
      data-card-label={`Проект: ${displayTitle}`}
      onClick={(e) => {
        if (!onClick) return;
        e.stopPropagation();
        onClick();
      }}
      className={`w-full h-full min-w-0 box-border bg-white border-[1.6px] border-[#18181B] rounded-xl overflow-hidden shadow-[0_7px_16px_rgba(17,24,39,0.11),0_2px_4px_rgba(17,24,39,0.07)] flex flex-col self-stretch min-h-full ${
        onClick ? 'editable-block' : ''
      } ${isActive ? 'editable-block-active' : ''}`}
    >
      {/* Slim Browser Window Header Bar */}
      <div
        className={`${
          isUltra ? 'h-[14px] px-[8px]' : 'h-[16px] px-[10px]'
        } bg-[#F1F5F9] border-b border-[#18181B]/15 flex items-center justify-between shrink-0`}
      >
        <div className="flex items-center gap-[5px]">
          <span className="w-[6px] h-[6px] rounded-full bg-[#FB7185] border border-black/15" />
          <span className="w-[6px] h-[6px] rounded-full bg-[#FBBF24] border border-black/15" />
          <span className="w-[6px] h-[6px] rounded-full bg-[#34D399] border border-black/15" />
        </div>
        {!project.isRealScreenshot && !project.imageUrl && (
          <span className="text-[8px] font-mono text-zinc-400">макет</span>
        )}
      </div>

      {/* Edge-to-Edge Screenshot / Illustration */}
      <div
        style={{ height: fixedImageHeight }}
        className={`self-stretch overflow-hidden border-b border-[#18181B]/12 shrink-0 ${
          imgFit === 'contain' ? 'bg-zinc-50 p-1' : 'bg-zinc-100'
        }`}
      >
        {project.imageUrl ? (
          <img
            src={project.imageUrl}
            alt={displayTitle}
            referrerPolicy="no-referrer"
            style={{
              transform: `translate(${imgX}px, ${imgY}px) scale(${imgScale})`,
              transformOrigin: 'center center',
            }}
            className={`w-full h-full transition-transform duration-150 ${
              imgFit === 'contain' ? 'object-contain' : 'object-cover'
            }`}
          />
        ) : (
          <ProjectFallbackGraphic theme={project.fallbackTheme} />
        )}
      </div>

      {/* Print-Legible Project Title, Caption & Description */}
      <div
        className={`w-full min-w-0 box-border flex-1 flex flex-col justify-center text-center ${
          isUltra
            ? 'px-[6px] py-[4px]'
            : isCompact
            ? 'px-[8px] py-[6px]'
            : 'px-[10px] py-[8px]'
        }`}
      >
        <InlineEditableText
          value={project.title}
          placeholder="Мой проект"
          onSelectText={
            onSelectTextField
              ? () =>
                  onSelectTextField({
                    page: 1,
                    field: 'projectTitle',
                    itemId: project.id,
                  })
              : undefined
          }
          isSelected={
            activeTextField?.page === 1 &&
            activeTextField.field === 'projectTitle' &&
            activeTextField.itemId === project.id
          }
          as="div"
          className={`font-journal-display font-extrabold ${
            isUltra
              ? 'text-[11px] leading-[1.12]'
              : isCompact
              ? 'text-[12.5px] leading-[1.18]'
              : itemCount === 1
              ? 'text-[15.5px] leading-[1.2]'
              : 'text-[14px] leading-[1.2]'
          } text-[#111827] block w-full min-w-0 box-border whitespace-pre-wrap [overflow-wrap:anywhere]`}
        />
        <InlineEditableText
          value={project.caption || project.description}
          placeholder={displayCaption}
          onSelectText={
            onSelectTextField
              ? () =>
                  onSelectTextField({
                    page: 1,
                    field: project.caption ? 'projectCaption' : 'projectDescription',
                    itemId: project.id,
                  })
              : undefined
          }
          isSelected={
            activeTextField?.page === 1 &&
            (activeTextField.field === 'projectCaption' ||
              activeTextField.field === 'projectDescription') &&
            activeTextField.itemId === project.id
          }
          as="div"
          className={`font-journal-body ${
            isUltra
              ? 'text-[8.5px] leading-[1.18] mt-[1.5px]'
              : isCompact
              ? 'text-[10px] leading-[1.3] mt-[3px]'
              : itemCount === 1
              ? 'text-[11px] leading-[1.38] mt-[4px]'
              : 'text-[10.5px] leading-[1.36] mt-[3.5px]'
          } text-[#3F3F46] block w-full min-w-0 box-border whitespace-pre-wrap [overflow-wrap:anywhere]`}
        />
        {project.caption?.trim() &&
          project.description?.trim() &&
          project.description.trim() !== project.caption.trim() && (
            <InlineEditableText
              value={project.description}
              onSelectText={
                onSelectTextField
                  ? () =>
                      onSelectTextField({
                        page: 1,
                        field: 'projectDescription',
                        itemId: project.id,
                      })
                  : undefined
              }
              isSelected={
                activeTextField?.page === 1 &&
                activeTextField.field === 'projectDescription' &&
                activeTextField.itemId === project.id
              }
              as="p"
              className={`font-journal-body m-0 ${
                isUltra
                  ? 'text-[8px] leading-[1.16] mt-[1px]'
                  : isCompact
                  ? 'text-[9.5px] leading-[1.28] mt-[2px]'
                  : itemCount === 1
                  ? 'text-[10.5px] leading-[1.35] mt-[3px]'
                  : 'text-[10px] leading-[1.32] mt-[2.5px]'
              } text-[#52525B] block w-full min-w-0 box-border whitespace-pre-wrap [overflow-wrap:anywhere]`}
            />
          )}
      </div>
    </div>
  );
}
