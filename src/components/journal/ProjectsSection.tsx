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
  gridMaxWidthPx?: number;
  gridGapPx?: number;
  imageHeightPx?: number;
  headingMbPx?: number;
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
  gridMaxWidthPx,
  gridGapPx,
  imageHeightPx,
  headingMbPx,
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
  const isCompact = resolvedDensity !== 'spacious';
  const layoutVariant: 'single' | 'double' | 'multi' =
    count === 1 ? 'single' : count === 2 || count === 4 ? 'double' : 'multi';

  const gridMaxWidth =
    gridMaxWidthPx !== undefined
      ? `${gridMaxWidthPx}px`
      : count === 1
      ? isUltra
        ? '226px'
        : isCompact
        ? '252px'
        : '292px'
      : count === 2
      ? isUltra
        ? '460px'
        : isCompact
        ? '488px'
        : '540px'
      : count === 4
      ? isUltra
        ? '428px'
        : '468px'
      : isUltra
      ? '636px'
      : '714px';

  const resolvedGapPx =
    gridGapPx ?? (isUltra ? 9 : count >= 4 ? 10 : 14);
  const resolvedHeadingMbPx =
    headingMbPx ?? (isUltra ? 5 : isCompact ? 7 : 10);

  return (
    <DraggableDesignWrapper
      id="projectsBlock"
      movementMode="vertical"
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
      className="shrink-0 opacity-100 visible block"
    >
      <section
        data-card-label="Блок «Мои результаты»"
        style={{ width: '714px' }}
        className="overflow-visible block"
      >
        <h2
          style={{ marginBottom: `${resolvedHeadingMbPx}px` }}
          className={`font-journal-display font-black ${
            isUltra
              ? 'text-[14.5px] leading-[17px]'
              : isCompact
              ? 'text-[16px] leading-[19px]'
              : 'text-[17.5px] leading-[21px]'
          } tracking-tight uppercase text-[#111827] shrink-0`}
        >
          МОИ РЕЗУЛЬТАТЫ
        </h2>
        <div
          data-projects-count={count}
          style={{
            width: '100%',
            maxWidth: gridMaxWidth,
            gap: `${resolvedGapPx}px`,
          }}
          className={`mx-auto grid items-stretch auto-rows-fr ${
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
              movementMode="none"
              transform={layouts[`project-${proj.id}`]}
              designMode={designMode}
              scaleFactor={scaleFactor}
              stretchInnerHeight
              isActive={
                !designMode &&
                !isFallback &&
                activeTarget?.page === 1 &&
                activeTarget.block === 'project' &&
                activeTarget.itemId === proj.id
              }
              onSelect={
                onSelectTarget
                  ? () =>
                      onSelectTarget(
                        designMode || isFallback
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
                  ? idx === 3
                    ? 'col-start-2 col-span-2'
                    : 'col-span-2'
                  : ''
              }`}
            >
              <ProjectCard
                project={proj}
                compact={isCompact}
                density={resolvedDensity}
                layoutVariant={layoutVariant}
                singleRow={count <= 3}
                itemCount={count}
                imageHeightPx={imageHeightPx}
                stretchHeight={false}
                isActive={
                  !designMode &&
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
                          designMode || isFallback
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
