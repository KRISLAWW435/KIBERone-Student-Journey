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
  density?: 'spacious' | 'compact' | 'ultra';
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
  density,
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
    visibleProjects.length > 0
      ? visibleProjects.slice(0, 6)
      : STARTER_FALLBACK_PROJECTS;
  const isFallback = visibleProjects.length === 0;
  const count = itemsToRender.length;
  const resolvedDensity = density ?? (compact ? 'compact' : 'spacious');
  const isUltra = resolvedDensity === 'ultra';
  const layoutVariant: 'single' | 'double' | 'multi' =
    count === 1 ? 'single' : count === 2 || count === 4 ? 'double' : 'multi';
  const canStretch = stretchHeight && count <= 2 && resolvedDensity === 'spacious';

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
        data-card-label="Блок «Мои результаты»"
        style={{ width: '714px' }}
        className={`overflow-visible ${
          canStretch ? 'flex-1 min-h-0 flex flex-col' : 'block'
        }`}
      >
        <h2
          className={`font-journal-display font-black ${
            isUltra
              ? 'text-[15px] leading-[17px] mb-[6px]'
              : 'text-[17.5px] leading-[21px] mb-[12px]'
          } tracking-tight uppercase text-[#111827] shrink-0`}
        >
          МОИ РЕЗУЛЬТАТЫ
        </h2>
        <div
          data-projects-count={count}
          style={{ width: '714px' }}
          className={`grid items-stretch auto-rows-fr ${
            isUltra ? 'gap-[8px]' : count >= 4 ? 'gap-[10px]' : 'gap-[14px]'
          } ${canStretch ? 'flex-1 min-h-0' : ''} ${
            count === 1
              ? 'grid-cols-1'
              : count === 2 || count === 4
              ? 'grid-cols-2'
              : count === 5
              ? 'grid-cols-6'
              : 'grid-cols-3'
          }`}
        >
          {itemsToRender.map((proj, idx) => (
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
              className={`h-full min-w-0 ${
                count === 5
                  ? idx < 3
                    ? 'col-span-2'
                    : 'col-span-3'
                  : ''
              }`}
            >
              <ProjectCard
                project={proj}
                compact={resolvedDensity !== 'spacious'}
                density={resolvedDensity}
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
