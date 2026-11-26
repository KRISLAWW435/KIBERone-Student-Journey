import React from 'react';
import {
  ActiveTextFieldTarget,
  CanvasObjectTransform,
  EditorSectionTarget,
  ProjectItem,
} from '../../types/journal';
import { DraggableDesignWrapper, SnapLinesState } from './DecorLayer';
import { ProjectCard } from './ProjectCard';

interface ProjectsSectionProps {
  projects: ProjectItem[];
  layouts?: Record<string, CanvasObjectTransform>;
  compact?: boolean;
  stretchHeight?: boolean;
  designMode?: boolean;
  scaleFactor?: number;
  activeTarget?: EditorSectionTarget;
  activeTextField?: ActiveTextFieldTarget;
  onSelectTarget?: (target: EditorSectionTarget) => void;
  onSelectTextField?: (target: ActiveTextFieldTarget) => void;
  onUpdateTransform?: (blockId: string, next: CanvasObjectTransform) => void;
  onUpdateProject?: (projectId: string, patch: Partial<ProjectItem>) => void;
  onSnapLinesChange?: (lines: SnapLinesState) => void;
  onInteractionStart?: () => void;
  onInteractionEnd?: () => void;
}

const STARTER_FALLBACK_PROJECTS: ProjectItem[] = [
  {
    id: 'proj-fallback-1',
    title: 'Мой первый проект',
    caption: 'Практическая работа на модуле',
    description: 'Собственная игровая сцена и алгоритмы.',
    fallbackTheme: 'game3d',
    isRealScreenshot: false,
  },
  {
    id: 'proj-fallback-2',
    title: 'Учебный проект',
    caption: 'Создание программы и тестирование',
    description: 'Закрепление ключевых навыков модуля.',
    fallbackTheme: 'python',
    isRealScreenshot: false,
  },
];

export function ProjectsSection({
  projects,
  layouts = {},
  compact = false,
  stretchHeight = false,
  designMode = false,
  scaleFactor = 1,
  activeTarget,
  activeTextField,
  onSelectTarget,
  onSelectTextField,
  onUpdateTransform,
  onUpdateProject,
  onSnapLinesChange,
  onInteractionStart,
  onInteractionEnd,
}: ProjectsSectionProps) {
  const visibleProjects = projects.filter((p) => !p.hidden);
  const itemsToRender =
    visibleProjects.length > 0 ? visibleProjects.slice(0, 4) : STARTER_FALLBACK_PROJECTS;
  const isFallback = visibleProjects.length === 0;
  const count = itemsToRender.length;
  const layoutVariant: 'single' | 'double' | 'multi' =
    count === 1 ? 'single' : count === 2 ? 'double' : 'multi';
  const canStretch = stretchHeight && count <= 2 && !compact;

  return (
    <DraggableDesignWrapper
      id="projectsBlock"
      transform={layouts.projectsBlock}
      designMode={designMode}
      scaleFactor={scaleFactor}
      isActive={
        activeTarget?.page === 1 && activeTarget.block === 'projectsBlock'
      }
      onSelect={
        onSelectTarget
          ? () => onSelectTarget({ page: 1, block: 'projectsBlock' })
          : undefined
      }
      onUpdateTransform={
        onUpdateTransform
          ? (next) => onUpdateTransform('projectsBlock', next)
          : undefined
      }
      onSnapLinesChange={onSnapLinesChange}
      onInteractionStart={onInteractionStart}
      onInteractionEnd={onInteractionEnd}
      className={`shrink-0 opacity-100 visible ${
        canStretch ? 'flex-1 min-h-0 flex flex-col' : 'block'
      }`}
    >
      <section
        style={{ width: '714px' }}
        className={`overflow-visible ${
          canStretch ? 'flex-1 min-h-0 flex flex-col' : 'block'
        }`}
      >
        <h2 className="font-journal-display font-black text-[17.5px] leading-[21px] tracking-tight uppercase text-[#111827] mb-[12px] shrink-0">
          МОИ РЕЗУЛЬТАТЫ
        </h2>
        <div
          data-projects-count={count}
          style={{ width: '714px' }}
          className={`grid items-stretch auto-rows-fr gap-[14px] ${
            canStretch ? 'flex-1 min-h-0' : ''
          } ${
            count === 1
              ? 'grid-cols-1'
              : count === 2
              ? 'grid-cols-2'
              : count === 4
              ? 'grid-cols-4'
              : 'grid-cols-3'
          }`}
        >
          {itemsToRender.map((proj) => (
            <DraggableDesignWrapper
              key={proj.id}
              id={`project-${proj.id}`}
              transform={layouts[`project-${proj.id}`]}
              designMode={designMode}
              scaleFactor={scaleFactor}
              isActive={
                !isFallback &&
                activeTarget?.page === 1 &&
                activeTarget.block === 'project' &&
                activeTarget.itemId === proj.id
              }
              onSelect={
                onSelectTarget
                  ? () =>
                      onSelectTarget(
                        isFallback
                          ? { page: 1, block: 'projectsBlock' }
                          : { page: 1, block: 'project', itemId: proj.id }
                      )
                  : undefined
              }
              onUpdateTransform={
                !isFallback && onUpdateTransform
                  ? (next) => onUpdateTransform(`project-${proj.id}`, next)
                  : undefined
              }
              onSnapLinesChange={onSnapLinesChange}
              onInteractionStart={onInteractionStart}
              onInteractionEnd={onInteractionEnd}
              className="h-full"
            >
              <ProjectCard
                project={proj}
                compact={compact}
                layoutVariant={layoutVariant}
                stretchHeight={canStretch}
                isActive={
                  !isFallback &&
                  activeTarget?.page === 1 &&
                  activeTarget.block === 'project' &&
                  activeTarget.itemId === proj.id
                }
                activeTextField={activeTextField}
                onSelectTextField={!isFallback ? onSelectTextField : undefined}
                onClick={
                  onSelectTarget
                    ? () =>
                        onSelectTarget(
                          isFallback
                            ? { page: 1, block: 'projectsBlock' }
                            : { page: 1, block: 'project', itemId: proj.id }
                        )
                    : undefined
                }
                onUpdateField={
                  !isFallback && onUpdateProject
                    ? (patch) => onUpdateProject(proj.id, patch)
                    : undefined
                }
              />
            </DraggableDesignWrapper>
          ))}
        </div>
      </section>
    </DraggableDesignWrapper>
  );
}
