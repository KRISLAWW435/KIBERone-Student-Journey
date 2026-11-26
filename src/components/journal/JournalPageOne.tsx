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
    .sort((a, b) => a.order - b.order)
    .slice(0, 6);
  const visibleProjects = page1.projects.filter((p) => !p.hidden).slice(0, 6);
  const visibleSkills = page1.skills.filter((s) => !s.hidden).slice(0, 8);

  const modulesCount = page1.showModules ? visibleModules.length : 0;
  const projectsCount =
    page1.showProjects === false
      ? 0
      : visibleProjects.length > 0
      ? visibleProjects.length
      : 2;
  const skillsCount = page1.showSkills ? visibleSkills.length : 0;

  const moduleRows = modulesCount === 0 ? 0 : modulesCount <= 3 ? 1 : 2;
  const projectRows = projectsCount === 0 ? 0 : projectsCount <= 3 ? 1 : 2;
  const skillRows = skillsCount === 0 ? 0 : skillsCount <= 4 ? 1 : 2;
  const totalCardRows = moduleRows + projectRows;

  const page1Density: 'spacious' | 'compact' | 'ultra' =
    totalCardRows >= 4 ? 'ultra' : totalCardRows === 3 ? 'compact' : 'spacious';

  const isUltra = page1Density === 'ultra';
  const isCompact = page1Density !== 'spacious';
  const layouts = page1.objectLayouts ?? {};

  const avgModuleDescLen =
    visibleModules.length > 0
      ? visibleModules.reduce(
          (sum, m) => sum + (m.description?.trim().length ?? 0),
          0
        ) / visibleModules.length
      : 0;

  const modulesGridColsClass =
    modulesCount === 1
      ? 'grid-cols-1'
      : modulesCount === 2 || modulesCount === 4
      ? 'grid-cols-2'
      : modulesCount === 5
      ? 'grid-cols-6'
      : 'grid-cols-3';

  const modulesGridMaxWidthPx =
    modulesCount === 1
      ? isUltra
        ? 204
        : isCompact
        ? 228
        : 246
      : modulesCount === 2
      ? isUltra
        ? 428
        : isCompact
        ? 456
        : 492
      : modulesCount === 3
      ? isUltra
        ? 618
        : isCompact
        ? 654
        : 678
      : modulesCount === 4
      ? isUltra
        ? 404
        : 440
      : isUltra
      ? 594
      : 648;

  const modulesGridGapPx = isUltra
    ? 9
    : isCompact
    ? modulesCount >= 4
      ? 11
      : 13
    : 16;

  const projectsGridMaxWidthPx =
    projectsCount === 1
      ? isUltra
        ? 212
        : isCompact
        ? 240
        : 272
      : projectsCount === 2
      ? isUltra
        ? 428
        : isCompact
        ? 456
        : 492
      : projectsCount === 3
      ? isUltra
        ? 618
        : isCompact
        ? 654
        : 678
      : projectsCount === 4
      ? isUltra
        ? 404
        : 440
      : isUltra
      ? 594
      : 648;

  const projectsGridGapPx = isUltra
    ? 9
    : isCompact
    ? projectsCount >= 4
      ? 11
      : 13
    : 16;

  const bodyPaddingTop = isUltra ? 8 : isCompact ? 14 : 18;
  const bodyPaddingBottom = isUltra ? 12 : isCompact ? 18 : 26;
  const sectionGapPx = isUltra
    ? 7
    : isCompact
    ? skillRows <= 1
      ? 16
      : 12
    : skillRows <= 1
    ? 32
    : 24;
  const headingMbPx = isUltra ? 5 : isCompact ? 7 : 8;

  const skillBonusUltra = skillRows <= 1 ? 10 : 0;
  const skillBonusCompact = skillRows <= 1 ? 10 : 0;
  const skillBonusSpacious =
    skillRows === 0 ? 20 : skillRows === 1 ? 12 : 0;

  const moduleImageHeightPx = isUltra
    ? (avgModuleDescLen > 112 ? 68 : 72) + skillBonusUltra
    : isCompact
    ? (moduleRows === 1 ? 110 : 86) + skillBonusCompact
    : (modulesCount === 1 ? 140 : modulesCount === 2 ? 124 : 104) +
      skillBonusSpacious;

  const projectImageHeightPx = isUltra
    ? (projectsCount === 1
        ? 114
        : projectsCount === 2 || projectsCount === 4
        ? 78
        : 76) + skillBonusUltra
    : isCompact
    ? (projectsCount === 1
        ? 158
        : projectsCount === 2
        ? 142
        : projectsCount === 3
        ? 122
        : projectsCount === 4
        ? 98
        : 90) + skillBonusCompact
    : (projectsCount === 1 ? 164 : projectsCount === 2 ? 150 : 128) +
      skillBonusSpacious;

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
          movementMode="vertical"
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

        {/* MAIN BODY (adaptive flow within 807px with balanced vertical distribution) */}
        <div
          data-a4-body="1"
          style={{
            width: '794px',
            height: '807px',
            paddingTop: `${bodyPaddingTop}px`,
            paddingBottom: `${bodyPaddingBottom}px`,
            gap: `${sectionGapPx}px`,
          }}
          className={`pointer-events-none relative z-[12] px-[40px] flex flex-col ${
            totalCardRows <= 2 ? 'justify-between' : 'justify-start'
          } shrink-0 overflow-visible box-border`}
        >
          {/* 2. МОИ ОТКРЫТИЯ */}
          {page1.showModules && modulesCount > 0 && (
            <DraggableDesignWrapper
              id="modulesBlock"
              movementMode="vertical"
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
              <section data-card-label="Блок «Мои открытия»" style={{ width: '714px' }}>
                <h2
                  style={{ marginBottom: `${headingMbPx}px` }}
                  className={`font-journal-display font-black ${
                    isUltra
                      ? 'text-[14.5px] leading-[17px]'
                      : isCompact
                      ? 'text-[16px] leading-[19px]'
                      : 'text-[17.5px] leading-[21px]'
                  } tracking-tight uppercase text-[#111827]`}
                >
                  МОИ ОТКРЫТИЯ
                </h2>
                <div
                  data-modules-count={modulesCount}
                  style={{
                    width: '100%',
                    maxWidth: `${modulesGridMaxWidthPx}px`,
                    gap: `${modulesGridGapPx}px`,
                  }}
                  className={`mx-auto grid items-stretch auto-rows-fr ${modulesGridColsClass}`}
                >
                  {visibleModules.map((mod, idx) => (
                    <DraggableDesignWrapper
                      key={mod.id}
                      id={`module-${mod.id}`}
                      movementMode="none"
                      transform={layouts[`module-${mod.id}`]}
                      designMode={designMode}
                      scaleFactor={scaleFactor}
                      stretchInnerHeight
                      isActive={
                        !designMode &&
                        activeTarget?.page === 1 &&
                        activeTarget.block === 'module' &&
                        activeTarget.itemId === mod.id
                      }
                      onSelect={
                        onSelectTarget
                          ? () =>
                              onSelectTarget(
                                designMode
                                  ? { page: 1, block: 'modulesBlock' }
                                  : {
                                      page: 1,
                                      block: 'module',
                                      itemId: mod.id,
                                    }
                              )
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
                      className={`h-full min-w-0 ${
                        modulesCount === 5
                          ? idx === 3
                            ? 'col-start-2 col-span-2'
                            : 'col-span-2'
                          : ''
                      }`}
                    >
                      <ModuleCard
                        module={mod}
                        index={idx}
                        mediaAssets={mediaAssets}
                        compact={isCompact}
                        density={page1Density}
                        singleRow={modulesCount <= 3}
                        itemCount={modulesCount}
                        imageHeightPx={moduleImageHeightPx}
                        wide={false}
                        ageCategory={resident.ageCategory}
                        isActive={
                          !designMode &&
                          activeTarget?.page === 1 &&
                          activeTarget.block === 'module' &&
                          activeTarget.itemId === mod.id
                        }
                        activeTextField={activeTextField}
                        onSelectTextField={onSelectTextField}
                        onClick={
                          onSelectTarget
                            ? () =>
                                onSelectTarget(
                                  designMode
                                    ? { page: 1, block: 'modulesBlock' }
                                    : {
                                        page: 1,
                                        block: 'module',
                                        itemId: mod.id,
                                      }
                                )
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
          {page1.showSkills && skillsCount > 0 && (
            <DraggableDesignWrapper
              id="skills"
              movementMode="vertical"
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
              <section data-card-label="Блок «Чему я научился»" style={{ width: '714px' }}>
                <div
                  style={{ marginBottom: `${headingMbPx}px` }}
                  className="flex items-baseline gap-[10px]"
                >
                  <h2
                    className={`font-journal-display font-black ${
                      isUltra
                        ? 'text-[14.5px] leading-[17px]'
                        : isCompact
                        ? 'text-[16px] leading-[19px]'
                        : 'text-[17.5px] leading-[21px]'
                    } tracking-tight uppercase text-[#111827]`}
                  >
                    ЧЕМУ Я НАУЧИЛСЯ
                  </h2>
                  <span className="font-journal-body text-[12px] font-semibold text-[#52525B] leading-none">
                    Важные навыки
                  </span>
                </div>
                <div
                  data-skills-count={skillsCount}
                  style={{ width: '714px' }}
                  className={`flex flex-wrap items-stretch justify-start ${
                    isUltra
                      ? 'gap-x-[8px] gap-y-[6px]'
                      : isCompact
                      ? 'gap-x-[9px] gap-y-[7px]'
                      : 'gap-x-[10px] gap-y-[8px]'
                  }`}
                >
                  {visibleSkills.map((skill, idx) => (
                    <SkillTag
                      key={skill.id}
                      skill={skill}
                      index={idx}
                      compact={isCompact}
                      density={page1Density}
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

          {/* 4. МОИ РЕЗУЛЬТАТЫ */}
          {page1.showProjects !== false && (
            <div className="shrink-0">
              <ProjectsSection
                projects={page1.projects}
                layouts={layouts}
                compact={isCompact}
                density={page1Density}
                gridMaxWidthPx={projectsGridMaxWidthPx}
                gridGapPx={projectsGridGapPx}
                imageHeightPx={projectImageHeightPx}
                headingMbPx={headingMbPx}
                stretchHeight={false}
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
