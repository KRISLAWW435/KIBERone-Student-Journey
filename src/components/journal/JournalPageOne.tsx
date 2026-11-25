import React, { useState } from 'react';
import {
  ActiveTextFieldTarget,
  CanvasObjectTransform,
  DecorElement,
  EditorSectionTarget,
  JournalDocument,
  MediaAsset,
  ModuleItem,
  Page1Config,
  ProjectItem,
  SkillItem,
} from '../../types/journal';
import { CoverSection } from './CoverSection';
import {
  DecorLayer,
  DraggableDesignWrapper,
  EMPTY_SNAP_LINES,
  PageGridOverlay,
  SmartGuidesOverlay,
  SnapLinesState,
} from './DecorLayer';
import { ModuleCard } from './ModuleCard';
import { PageBackdropArtwork } from './PageBackdropArtwork';
import { ProjectsSection } from './ProjectsSection';
import { SkillTag } from './SkillTag';

interface JournalPageOneProps {
  doc: JournalDocument;
  mediaAssets?: MediaAsset[];
  designMode?: boolean;
  scaleFactor?: number;
  activeTarget?: EditorSectionTarget;
  activeTextField?: ActiveTextFieldTarget;
  onSelectTarget?: (target: EditorSectionTarget) => void;
  onSelectTextField?: (target: ActiveTextFieldTarget) => void;
  onUpdateTransform?: (blockId: string, next: CanvasObjectTransform) => void;
  onMoveDecor?: (decorId: string, x: number, y: number) => void;
  onUpdateDecor?: (decorId: string, patch: Partial<DecorElement>) => void;
  onUpdateDecorText?: (decorId: string, text: string) => void;
  onUpdatePage1?: (patch: Partial<Page1Config>) => void;
  onUpdateModule?: (moduleId: string, patch: Partial<ModuleItem>) => void;
  onUpdateSkill?: (skillId: string, patch: Partial<SkillItem>) => void;
  onUpdateProject?: (projectId: string, patch: Partial<ProjectItem>) => void;
  onInteractionStart?: () => void;
  onInteractionEnd?: () => void;
}

export function JournalPageOne({
  doc,
  mediaAssets,
  designMode = false,
  scaleFactor = 1,
  activeTarget,
  activeTextField,
  onSelectTarget,
  onSelectTextField,
  onUpdateTransform,
  onMoveDecor,
  onUpdateDecor,
  onUpdateDecorText,
  onUpdatePage1,
  onUpdateModule,
  onUpdateSkill,
  onUpdateProject,
  onInteractionStart,
  onInteractionEnd,
}: JournalPageOneProps) {
  const [snapLines, setSnapLines] = useState<SnapLinesState>(EMPTY_SNAP_LINES);
  const { page1, page2, resident } = doc;
  const visibleModules = [...page1.modules]
    .filter((m) => !m.hidden)
    .sort((a, b) => a.order - b.order);
  const visibleProjects = page1.projects.filter((p) => !p.hidden);
  const visibleSkills = page1.skills.filter((s) => !s.hidden).slice(0, 8);

  const isCompactModules = visibleModules.length > 3;
  const isCompactProjects = visibleProjects.length > 3;
  const isCompactSkills = visibleSkills.length > 4 || isCompactModules;
  const layouts = page1.objectLayouts ?? {};

  const skillsGridColsClass =
    visibleSkills.length === 1
      ? 'grid-cols-1'
      : visibleSkills.length === 2
      ? 'grid-cols-2'
      : visibleSkills.length === 3
      ? 'grid-cols-3'
      : visibleSkills.length <= 6 && visibleSkills.length >= 5
      ? 'grid-cols-3'
      : 'grid-cols-4';

  return (
    <article
      onClick={(e) => {
        if (!onSelectTarget) return;
        if (e.target === e.currentTarget) {
          onSelectTarget({ page: 1, block: 'background' });
        }
      }}
      style={{
        width: '794px',
        height: '1123px',
        minWidth: '794px',
        minHeight: '1123px',
        maxWidth: '794px',
        maxHeight: '1123px',
        aspectRatio: '210 / 297',
        flexShrink: 0,
        backgroundColor: page1.background?.color || '#ffffff',
      }}
      className="a4-canvas shrink-0 relative overflow-hidden isolate"
      aria-label="Страница 1: Мой путь в мире технологий"
    >
      {/* Background Grid */}
      <PageGridOverlay background={page1.background} />

      {/* Editorial Background Graphics (Waves, Stars, Sparkles, Dot Grids) */}
      <PageBackdropArtwork
        page={1}
        accentTeal={page1.coverBgStart || '#38C8D4'}
        accentYellow={page2.headerYellowColor || '#FFE14D'}
      />

      {/* Smart Alignment Guides */}
      {designMode && <SmartGuidesOverlay lines={snapLines} />}

      {/* Decorative Layer (Free-positioned Text, Images, Vector Icons, Stickers) */}
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
            ? (id) => {
                onSelectTarget({ page: 1, block: 'decor', itemId: id });
                const el = (page1.decorElements ?? []).find((d) => d.id === id);
                if (el?.kind === 'text' && onSelectTextField) {
                  onSelectTextField({ page: 1, field: 'decorText', itemId: id });
                }
              }
            : undefined
        }
        onMoveDecor={onMoveDecor}
        onUpdateDecor={onUpdateDecor}
        onUpdateDecorText={onUpdateDecorText}
        onSnapLinesChange={setSnapLines}
        onInteractionStart={onInteractionStart}
        onInteractionEnd={onInteractionEnd}
      />

      <div
        style={{ width: '794px', height: '1123px' }}
        className="flex flex-col pointer-events-none"
      >
        {/* 1. COVER SECTION (strict 794x316px) */}
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
          onSnapLinesChange={setSnapLines}
          onInteractionStart={onInteractionStart}
          onInteractionEnd={onInteractionEnd}
          className="shrink-0"
        >
          <CoverSection
            resident={resident}
            config={page1}
            ageCategory={resident.ageCategory}
            designMode={designMode}
            scaleFactor={scaleFactor}
            titleTransform={layouts.coverTitle}
            subtitleTransform={layouts.coverSubtitle}
            infoTransform={layouts.coverInfo}
            bubbleTransform={layouts.coverBubble}
            bearTransform={layouts.coverBear}
            logoTransform={layouts.logo}
            activeTarget={activeTarget}
            activeTextField={activeTextField}
            onSelectTarget={onSelectTarget}
            onSelectTextField={onSelectTextField}
            onUpdateTransform={onUpdateTransform}
            onUpdateFields={onUpdatePage1}
            onSnapLinesChange={setSnapLines}
            onInteractionStart={onInteractionStart}
            onInteractionEnd={onInteractionEnd}
          />
        </DraggableDesignWrapper>

        {/* MAIN BODY (balanced flow within 807px with generous breathing room) */}
        <div
          style={{
            width: '794px',
            height: '807px',
          }}
          className={`pointer-events-none relative z-[12] px-[40px] pb-[16px] flex flex-col justify-start shrink-0 overflow-visible ${
            isCompactModules || isCompactSkills
              ? 'pt-[28px] gap-[22px]'
              : 'pt-[40px] gap-[30px]'
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
              onSnapLinesChange={setSnapLines}
              onInteractionStart={onInteractionStart}
              onInteractionEnd={onInteractionEnd}
              className="shrink-0"
            >
              <section style={{ width: '714px' }}>
                <h2 className="font-journal-display font-black text-[17.5px] leading-[21px] tracking-tight uppercase text-[#111827] mb-[14px]">
                  МОИ ОТКРЫТИЯ
                </h2>
                <div
                  style={{
                    width: visibleModules.length === 1 ? '260px' : '714px',
                  }}
                  className={`grid items-stretch auto-rows-fr gap-[14px] ${
                    visibleModules.length === 1
                      ? 'grid-cols-1'
                      : visibleModules.length === 2 || visibleModules.length === 4
                      ? 'grid-cols-2'
                      : 'grid-cols-3'
                  }`}
                >
                  {visibleModules.slice(0, 6).map((mod, idx) => (
                    <DraggableDesignWrapper
                      key={mod.id}
                      id={`module-${mod.id}`}
                      transform={layouts[`module-${mod.id}`]}
                      designMode={designMode}
                      scaleFactor={scaleFactor}
                      isActive={
                        activeTarget?.page === 1 &&
                        activeTarget.block === 'module' &&
                        activeTarget.itemId === mod.id
                      }
                      onSelect={
                        onSelectTarget
                          ? () =>
                              onSelectTarget({
                                page: 1,
                                block: 'module',
                                itemId: mod.id,
                              })
                          : undefined
                      }
                      onUpdateTransform={
                        onUpdateTransform
                          ? (next) =>
                              onUpdateTransform(`module-${mod.id}`, next)
                          : undefined
                      }
                      onSnapLinesChange={setSnapLines}
                      onInteractionStart={onInteractionStart}
                      onInteractionEnd={onInteractionEnd}
                      className="h-full"
                    >
                      <ModuleCard
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
                        activeTextField={activeTextField}
                        onSelectTextField={onSelectTextField}
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
                        onUpdateField={
                          onUpdateModule
                            ? (patch) => onUpdateModule(mod.id, patch)
                            : undefined
                        }
                        onBeginEdit={onInteractionStart}
                        onEndEdit={onInteractionEnd}
                      />
                    </DraggableDesignWrapper>
                  ))}
                </div>
              </section>
            </DraggableDesignWrapper>
          )}

          {/* 3. ЧЕМУ Я НАУЧИЛСЯ */}
          {page1.showSkills && visibleSkills.length > 0 && (
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
              onSnapLinesChange={setSnapLines}
              onInteractionStart={onInteractionStart}
              onInteractionEnd={onInteractionEnd}
              className="shrink-0"
            >
              <section style={{ width: '714px' }}>
                <div className="mb-[10px] flex items-baseline gap-[10px]">
                  <h2 className="font-journal-display font-black text-[17.5px] leading-[21px] tracking-tight uppercase text-[#111827]">
                    ЧЕМУ Я НАУЧИЛСЯ
                  </h2>
                  <span className="font-journal-body text-[12px] font-semibold text-[#52525B] leading-none">
                    Важные навыки
                  </span>
                </div>
                <div
                  style={{
                    width: visibleSkills.length === 1 ? '220px' : '714px',
                  }}
                  className={`grid items-stretch gap-x-[12px] gap-y-[8px] ${skillsGridColsClass}`}
                >
                  {visibleSkills.map((skill, idx) => (
                    <SkillTag
                      key={skill.id}
                      skill={skill}
                      index={idx}
                      compact={isCompactSkills}
                      ageCategory={resident.ageCategory}
                      activeTextField={activeTextField}
                      onSelectTextField={onSelectTextField}
                      onChangeLabel={
                        onUpdateSkill
                          ? (label) => onUpdateSkill(skill.id, { label })
                          : undefined
                      }
                      onBeginEdit={onInteractionStart}
                      onEndEdit={onInteractionEnd}
                    />
                  ))}
                </div>
              </section>
            </DraggableDesignWrapper>
          )}

          {/* 4. МОИ РЕЗУЛЬТАТЫ (Extra top breathing room after Skills) */}
          {page1.showProjects !== false && (
            <div className={isCompactModules || isCompactSkills ? 'mt-[8px]' : 'mt-[14px]'}>
              <ProjectsSection
                projects={page1.projects}
                layouts={layouts}
                compact={isCompactProjects || isCompactModules}
                designMode={designMode}
                scaleFactor={scaleFactor}
                activeTarget={activeTarget}
                activeTextField={activeTextField}
                onSelectTarget={onSelectTarget}
                onSelectTextField={onSelectTextField}
                onUpdateTransform={onUpdateTransform}
                onUpdateProject={onUpdateProject}
                onSnapLinesChange={setSnapLines}
                onInteractionStart={onInteractionStart}
                onInteractionEnd={onInteractionEnd}
              />
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
