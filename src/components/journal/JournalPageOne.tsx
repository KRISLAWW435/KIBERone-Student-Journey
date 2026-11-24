import React from 'react';
import {
  CanvasObjectTransform,
  EditorSectionTarget,
  JournalDocument,
  MediaAsset,
} from '../../types/journal';
import { CoverSection } from './CoverSection';
import {
  DecorLayer,
  DraggableDesignWrapper,
  PageGridOverlay,
} from './DecorLayer';
import { ModuleCard } from './ModuleCard';
import { ProjectCard } from './ProjectCard';
import { SkillTag } from './SkillTag';

interface JournalPageOneProps {
  doc: JournalDocument;
  mediaAssets?: MediaAsset[];
  designMode?: boolean;
  scaleFactor?: number;
  activeTarget?: EditorSectionTarget;
  onSelectTarget?: (target: EditorSectionTarget) => void;
  onUpdateTransform?: (blockId: string, next: CanvasObjectTransform) => void;
  onMoveDecor?: (decorId: string, x: number, y: number) => void;
}

export function JournalPageOne({
  doc,
  mediaAssets,
  designMode = false,
  scaleFactor = 1,
  activeTarget,
  onSelectTarget,
  onUpdateTransform,
  onMoveDecor,
}: JournalPageOneProps) {
  const { page1, resident } = doc;
  const visibleModules = [...page1.modules]
    .filter((m) => !m.hidden)
    .sort((a, b) => a.order - b.order);
  const visibleProjects = page1.projects.filter((p) => !p.hidden);

  const isCompactModules = visibleModules.length > 3;
  const isCompactProjects = visibleProjects.length > 3;
  const layouts = page1.objectLayouts ?? {};

  return (
    <article
      onClick={(e) => {
        if (!onSelectTarget) return;
        if (e.target === e.currentTarget) {
          onSelectTarget({ page: 1, block: 'background' });
        }
      }}
      style={{
        backgroundColor: page1.background?.color || '#ffffff',
      }}
      className="a4-canvas relative flex flex-col justify-between overflow-hidden"
      aria-label="Страница 1: Мой путь в мире технологий"
    >
      {/* Background Grid */}
      <PageGridOverlay background={page1.background} />

      {/* Decorative Layer */}
      <DecorLayer
        elements={page1.decorElements ?? []}
        designMode={designMode}
        scaleFactor={scaleFactor}
        activeDecorId={
          activeTarget?.page === 1 && activeTarget.block === 'decor'
            ? activeTarget.itemId
            : null
        }
        onSelectDecor={
          onSelectTarget
            ? (id) => onSelectTarget({ page: 1, block: 'decor', itemId: id })
            : undefined
        }
        onMoveDecor={onMoveDecor}
      />

      <div className="relative z-10">
        {/* 1. COVER SECTION (30-33% height) */}
        <DraggableDesignWrapper
          id="cover"
          transform={layouts.cover}
          designMode={designMode}
          scaleFactor={scaleFactor}
          isActive={activeTarget?.page === 1 && activeTarget.block === 'cover'}
          onSelect={
            onSelectTarget
              ? () => onSelectTarget({ page: 1, block: 'cover' })
              : undefined
          }
          onUpdateTransform={
            onUpdateTransform
              ? (next) => onUpdateTransform('cover', next)
              : undefined
          }
        >
          <CoverSection
            resident={resident}
            config={page1}
            ageCategory={resident.ageCategory}
            activeTarget={activeTarget}
            onSelectTarget={onSelectTarget}
          />
        </DraggableDesignWrapper>

        {/* MAIN BODY */}
        <div
          className={`px-10 pt-4 pb-2 flex flex-col ${
            isCompactModules ? 'gap-3.5' : 'gap-4.5'
          }`}
        >
          {/* 2. МОИ ОТКРЫТИЯ */}
          {page1.showModules && visibleModules.length > 0 && (
            <DraggableDesignWrapper
              id="modulesBlock"
              transform={layouts.modulesBlock}
              designMode={designMode}
              scaleFactor={scaleFactor}
              isActive={
                activeTarget?.page === 1 &&
                activeTarget.block === 'modulesBlock'
              }
              onSelect={
                onSelectTarget
                  ? () => onSelectTarget({ page: 1, block: 'modulesBlock' })
                  : undefined
              }
              onUpdateTransform={
                onUpdateTransform
                  ? (next) => onUpdateTransform('modulesBlock', next)
                  : undefined
              }
            >
              <section>
                <h2 className="font-extrabold text-[18.5px] tracking-tight uppercase text-[#111827] mb-2.5">
                  МОИ ОТКРЫТИЯ
                </h2>
                <div
                  className={`grid gap-3.5 ${
                    visibleModules.length === 1
                      ? 'grid-cols-1 max-w-[260px]'
                      : visibleModules.length === 2 || visibleModules.length === 4
                      ? 'grid-cols-2'
                      : 'grid-cols-3'
                  }`}
                >
                  {visibleModules.slice(0, 6).map((mod, idx) => (
                    <ModuleCard
                      key={mod.id}
                      module={mod}
                      index={idx}
                      mediaAssets={mediaAssets}
                      compact={isCompactModules}
                      ageCategory={resident.ageCategory}
                      isActive={
                        activeTarget?.page === 1 &&
                        activeTarget.block === 'module' &&
                        activeTarget.itemId === mod.id
                      }
                      onClick={
                        onSelectTarget
                          ? () =>
                              onSelectTarget({
                                page: 1,
                                block: 'module',
                                itemId: mod.id,
                              })
                          : undefined
                      }
                    />
                  ))}
                </div>
              </section>
            </DraggableDesignWrapper>
          )}

          {/* 3. ЧЕМУ Я НАУЧИЛСЯ */}
          {page1.showSkills && page1.skills.length > 0 && (
            <DraggableDesignWrapper
              id="skills"
              transform={layouts.skills}
              designMode={designMode}
              scaleFactor={scaleFactor}
              isActive={
                activeTarget?.page === 1 && activeTarget.block === 'skills'
              }
              onSelect={
                onSelectTarget
                  ? () => onSelectTarget({ page: 1, block: 'skills' })
                  : undefined
              }
              onUpdateTransform={
                onUpdateTransform
                  ? (next) => onUpdateTransform('skills', next)
                  : undefined
              }
            >
              <section className="rounded-xl py-0.5">
                <h2 className="font-extrabold text-[18.5px] tracking-tight uppercase text-[#111827] mb-2">
                  ЧЕМУ Я НАУЧИЛСЯ
                </h2>
                <div className="flex flex-wrap items-center gap-2.5">
                  {page1.skills.slice(0, 8).map((skill) => (
                    <SkillTag
                      key={skill.id}
                      skill={skill}
                      ageCategory={resident.ageCategory}
                    />
                  ))}
                </div>
              </section>
            </DraggableDesignWrapper>
          )}

          {/* 4. МОИ РЕЗУЛЬТАТЫ */}
          {page1.showProjects && visibleProjects.length > 0 && (
            <DraggableDesignWrapper
              id="projectsBlock"
              transform={layouts.projectsBlock}
              designMode={designMode}
              scaleFactor={scaleFactor}
              isActive={
                activeTarget?.page === 1 &&
                activeTarget.block === 'projectsBlock'
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
            >
              <section>
                <h2 className="font-extrabold text-[18.5px] tracking-tight uppercase text-[#111827] mb-2.5">
                  МОИ РЕЗУЛЬТАТЫ
                </h2>
                <div
                  className={`grid gap-3.5 ${
                    visibleProjects.length === 1
                      ? 'grid-cols-1 max-w-[260px]'
                      : visibleProjects.length === 2
                      ? 'grid-cols-2'
                      : visibleProjects.length === 4
                      ? 'grid-cols-4'
                      : 'grid-cols-3'
                  }`}
                >
                  {visibleProjects.slice(0, 4).map((proj) => (
                    <ProjectCard
                      key={proj.id}
                      project={proj}
                      compact={isCompactProjects || isCompactModules}
                      isActive={
                        activeTarget?.page === 1 &&
                        activeTarget.block === 'project' &&
                        activeTarget.itemId === proj.id
                      }
                      onClick={
                        onSelectTarget
                          ? () =>
                              onSelectTarget({
                                page: 1,
                                block: 'project',
                                itemId: proj.id,
                              })
                          : undefined
                      }
                    />
                  ))}
                </div>
              </section>
            </DraggableDesignWrapper>
          )}
        </div>
      </div>

      {/* FOOTER WEBSITE */}
      <footer className="relative z-10 pb-4 pt-1 text-center">
        <span className="text-[16px] font-medium tracking-tight text-[#111827]">
          {page1.footerWebsite}
        </span>
      </footer>
    </article>
  );
}
