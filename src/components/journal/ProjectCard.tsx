import React from 'react';
import { ActiveTextFieldTarget, ProjectItem } from '../../types/journal';
import { InlineEditableText } from './DecorLayer';
import { ProjectFallbackGraphic } from './JournalArtwork';

interface ProjectCardProps {
  project: ProjectItem;
  compact?: boolean;
  layoutVariant?: 'single' | 'double' | 'multi';
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
  layoutVariant = 'multi',
  stretchHeight = false,
  isActive = false,
  activeTextField,
  onSelectTextField,
  onClick,
}: ProjectCardProps) {
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
    layoutVariant === 'single'
      ? compact
        ? '132px'
        : '192px'
      : layoutVariant === 'double'
      ? compact
        ? '122px'
        : '184px'
      : compact
      ? '72px'
      : '108px';

  return (
    <div
      onClick={(e) => {
        if (!onClick) return;
        e.stopPropagation();
        onClick();
      }}
      className={`bg-white border-[1.6px] border-[#18181B] rounded-xl overflow-hidden shadow-[0_7px_16px_rgba(17,24,39,0.11),0_2px_4px_rgba(17,24,39,0.07)] flex flex-col self-stretch h-full ${
        onClick ? 'editable-block' : ''
      } ${isActive ? 'editable-block-active' : ''}`}
    >
      {/* Slim Browser Window Header Bar */}
      <div className="h-[16px] bg-[#F1F5F9] border-b border-[#18181B]/15 px-[10px] flex items-center justify-between shrink-0">
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
        style={stretchHeight ? undefined : { height: fixedImageHeight }}
        className={`self-stretch overflow-hidden border-b border-[#18181B]/12 ${
          imgFit === 'contain' ? 'bg-zinc-50 p-1' : 'bg-zinc-100'
        } ${
          stretchHeight ? 'flex-1 min-h-[150px] max-h-[250px]' : 'shrink-0'
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

      {/* Print-Legible Project Title & Caption */}
      <div
        className={`${
          compact ? 'px-[8px] py-[6px]' : 'px-[10px] py-[8px]'
        } text-center ${
          stretchHeight ? 'shrink-0' : 'flex-1 flex flex-col justify-center'
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
            compact
              ? 'text-[12.5px]'
              : layoutVariant === 'single'
              ? 'text-[15.5px]'
              : 'text-[14px]'
          } leading-[1.2] text-[#111827] block`}
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
            layoutVariant === 'single' ? 'text-[11px]' : 'text-[10px]'
          } leading-[1.4] text-[#3F3F46] mt-[4px] block`}
        />
      </div>
    </div>
  );
}
