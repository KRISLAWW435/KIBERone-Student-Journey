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
      className={`bg-white border-[1.5px] border-[#18181B] rounded-xl overflow-hidden shadow-[0_3px_8px_rgba(0,0,0,0.06)] flex flex-col ${
        onClick ? 'editable-block' : ''
      } ${isActive ? 'editable-block-active' : ''}`}
    >
      {/* Browser / App Window Header Bar */}
      <div className="h-[22px] bg-[#F8FAFC] border-b border-[#18181B]/20 px-2.5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#F87171] border border-black/15" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#FBBF24] border border-black/15" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#34D399] border border-black/15" />
        </div>
        {!project.isRealScreenshot && !project.imageUrl && (
          <span className="text-[8.5px] font-mono text-zinc-400">иллюстрация</span>
        )}
      </div>

      {/* Screenshot or Thematic Illustration */}
      <div className="p-2 pb-1.5 flex-1 flex flex-col">
        <div
          className={`w-full ${
            compact ? 'h-[82px]' : 'h-[104px]'
          } rounded-md overflow-hidden border border-black/10 bg-zinc-100 shrink-0`}
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

        <div className="pt-2 pb-1 text-center">
          <div className="font-bold text-[13px] leading-tight text-[#111827] truncate">
            {project.title}
          </div>
          {project.caption && (
            <div className="text-[10.5px] leading-tight text-zinc-600 mt-0.5 truncate">
              {project.caption}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
