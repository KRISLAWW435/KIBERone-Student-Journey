import React from 'react';
import { ProjectItem } from '../../types/journal';
import { ProjectFallbackGraphic } from './JournalArtwork';

interface ProjectCardProps {
  project: ProjectItem;
  compact?: boolean;
  isActive?: boolean;
  onClick?: () => void;
}

export function ProjectCard({
  project,
  compact = false,
  isActive = false,
  onClick,
}: ProjectCardProps) {
  const imgScale = project.imageScale ?? 1;
  const imgX = project.imagePosX ?? 0;
  const imgY = project.imagePosY ?? 0;

  return (
    <div
      onClick={(e) => {
        if (!onClick) return;
        e.stopPropagation();
        onClick();
      }}
      className={`bg-white border-[1.5px] border-[#18181B] rounded-xl overflow-hidden shadow-[0_3px_8px_rgba(0,0,0,0.06)] flex flex-col self-stretch ${
        onClick ? 'editable-block' : ''
      } ${isActive ? 'editable-block-active' : ''}`}
    >
      {/* Slim Browser Window Header Bar */}
      <div className="h-[18px] bg-[#F1F5F9] border-b border-[#18181B]/15 px-[10px] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-[5px]">
          <span className="w-[6px] h-[6px] rounded-full bg-[#FB7185] border border-black/15" />
          <span className="w-[6px] h-[6px] rounded-full bg-[#FBBF24] border border-black/15" />
          <span className="w-[6px] h-[6px] rounded-full bg-[#34D399] border border-black/15" />
        </div>
        {!project.isRealScreenshot && !project.imageUrl && (
          <span className="text-[8px] font-mono text-zinc-400">макет</span>
        )}
      </div>

      {/* Edge-to-Edge Screenshot / Illustration (no wasted border padding) */}
      <div
        style={{ height: compact ? '96px' : '118px' }}
        className="self-stretch overflow-hidden border-b border-[#18181B]/12 bg-zinc-100 shrink-0"
      >
        {project.imageUrl ? (
          <img
            src={project.imageUrl}
            alt={project.title}
            referrerPolicy="no-referrer"
            style={{
              transform: `translate(${imgX}px, ${imgY}px) scale(${imgScale})`,
            }}
            className="w-full h-full object-cover transition-transform duration-150"
          />
        ) : (
          <ProjectFallbackGraphic theme={project.fallbackTheme} />
        )}
      </div>

      {/* Enlarged, Print-Legible Project Title & Caption */}
      <div className="px-[12px] py-[10px] text-center flex-1 flex flex-col justify-center">
        <div
          className={`font-extrabold ${
            compact ? 'text-[14px]' : 'text-[15.5px]'
          } leading-[1.2] text-[#111827] line-clamp-1`}
        >
          {project.title}
        </div>
        {project.caption && (
          <div className="text-[11px] leading-[1.3] text-[#3F3F46] mt-[3px] line-clamp-2">
            {project.caption}
          </div>
        )}
      </div>
    </div>
  );
}
