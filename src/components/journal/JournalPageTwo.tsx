import React from 'react';
import {
  CanvasObjectTransform,
  EditorSectionTarget,
  JournalDocument,
} from '../../types/journal';
import {
  DecorLayer,
  DraggableDesignWrapper,
  PageGridOverlay,
} from './DecorLayer';
import { MentorNote } from './MentorNote';
import { NextChapter } from './NextChapter';
import { PrideSection } from './PrideSection';
import { StrengthCard } from './StrengthCard';

interface JournalPageTwoProps {
  doc: JournalDocument;
  designMode?: boolean;
  scaleFactor?: number;
  activeTarget?: EditorSectionTarget;
  onSelectTarget?: (target: EditorSectionTarget) => void;
  onUpdateTransform?: (blockId: string, next: CanvasObjectTransform) => void;
  onMoveDecor?: (decorId: string, x: number, y: number) => void;
}

export function JournalPageTwo({
  doc,
  designMode = false,
  scaleFactor = 1,
  activeTarget,
  onSelectTarget,
  onUpdateTransform,
  onMoveDecor,
}: JournalPageTwoProps) {
  const { page2, resident } = doc;
  const visibleStrengths = page2.strengths.filter((s) => !s.hidden);
  const effectiveCols =
    visibleStrengths.length > 4 ? 3 : page2.strengthsColumns;
  const strengthsToRender = visibleStrengths.slice(0, 6);
  const layouts = page2.objectLayouts ?? {};

  return (
    <article
      onClick={(e) => {
        if (!onSelectTarget) return;
        if (e.target === e.currentTarget) {
          onSelectTarget({ page: 2, block: 'background' });
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
        backgroundColor: page2.background?.color || '#ffffff',
      }}
      className="a4-canvas shrink-0 relative overflow-hidden"
      aria-label="Страница 2: Мои достижения"
    >
      {/* Background Grid */}
      <PageGridOverlay background={page2.background} />

      {/* Sunny Yellow Bottom-Left Background Wave matching reference */}
      <div
        aria-hidden="true"
        style={{ backgroundColor: page2.headerYellowColor }}
        className="pointer-events-none absolute -bottom-[96px] -left-[96px] w-[470px] h-[360px] rounded-tr-[240px] opacity-85"
      />

      {/* Decorative Layer */}
      <DecorLayer
        elements={page2.decorElements ?? []}
        designMode={designMode}
        scaleFactor={scaleFactor}
        activeDecorId={
          activeTarget?.page === 2 && activeTarget.block === 'decor'
            ? activeTarget.itemId
            : null
        }
        onSelectDecor={
          onSelectTarget
            ? (id) => onSelectTarget({ page: 2, block: 'decor', itemId: id })
            : undefined
        }
        onMoveDecor={onMoveDecor}
      />

      <div
        style={{ width: '794px', height: '1123px' }}
        className="relative z-10 flex flex-col overflow-hidden"
      >
        {/* TOP COLORFUL TEAL + YELLOW WAVE HEADER (strict 794x150px) */}
        <DraggableDesignWrapper
          id="header"
          transform={layouts.header}
          designMode={designMode}
          scaleFactor={scaleFactor}
          isActive={activeTarget?.page === 2 && activeTarget.block === 'header'}
          onSelect={
            onSelectTarget
              ? () => onSelectTarget({ page: 2, block: 'header' })
              : undefined
          }
          onUpdateTransform={
            onUpdateTransform
              ? (next) => onUpdateTransform('header', next)
              : undefined
          }
          className="shrink-0"
        >
          <header
            style={{ width: '794px', height: '150px' }}
            className="relative px-[40px] flex items-center justify-center overflow-hidden shrink-0"
          >
            <svg
              aria-hidden="true"
              width="794"
              height="150"
              viewBox="0 0 794 150"
              preserveAspectRatio="none"
              className="absolute top-0 left-0"
            >
              <path
                d="M0 0H540C510 55 460 112 310 122C160 132 70 124 0 138V0Z"
                fill={page2.headerTealColor}
              />
              <path
                d="M460 0H794V128C705 135 585 110 475 72C420 53 435 18 460 0Z"
                fill={page2.headerYellowColor}
              />
            </svg>

            {page2.showHeaderDecor && resident.ageCategory !== '14-15' && (
              <>
                <svg
                  aria-hidden="true"
                  viewBox="0 0 110 110"
                  className="pointer-events-none absolute left-[24px] top-[16px] w-[96px] h-[96px] opacity-75"
                  fill="none"
                >
                  <path d="M40 16L43 24L51 26L43 29L40 37L37 29L29 26L37 24L40 16Z" stroke="#18181B" strokeWidth="1.5" />
                  <path d="M84 12L86 17L91 18.5L86 20L84 25L82 20L77 18.5L82 17L84 12Z" stroke="#18181B" strokeWidth="1.3" />
                  <path d="M18 62L20 67L25 68.5L20 70L18 75L16 70L11 68.5L16 67L18 62Z" stroke="#18181B" strokeWidth="1.3" />
                  <path d="M46 78L49 86L57 88L49 91L46 99L43 91L35 88L43 86L46 78Z" stroke="#18181B" strokeWidth="1.5" />
                </svg>
                <svg
                  aria-hidden="true"
                  viewBox="0 0 120 90"
                  className="pointer-events-none absolute right-[24px] top-[12px] w-[112px] h-[80px] opacity-80"
                  fill="none"
                >
                  <path d="M22 20L24 25L29 26.5L24 28L22 33L20 28L15 26.5L20 25L22 20Z" stroke="#18181B" strokeWidth="1.3" />
                  <path d="M78 16L94 32L64 62L48 64L50 48L78 16Z" stroke="#18181B" strokeWidth="1.5" strokeLinejoin="round" />
                  <path d="M48 64C35 72 22 60 12 68" stroke="#18181B" strokeWidth="1.4" strokeLinecap="round" />
                  <path d="M92 64L94 69L99 70.5L94 72L92 77L90 72L85 70.5L90 69L92 64Z" stroke="#18181B" strokeWidth="1.3" />
                </svg>
              </>
            )}

            <h2
              className="relative z-10 font-extrabold text-[40px] leading-none tracking-tight text-[#111827] text-center"
              style={{ fontFamily: 'var(--font-journal)' }}
            >
              {page2.headerTitle}
            </h2>
          </header>
        </DraggableDesignWrapper>

        {/* MIDDLE & BOTTOM BODY (strict 794x973px, fixed pixel grid) */}
        <div
          style={{ width: '794px', height: '973px' }}
          className="px-[40px] pt-[10px] pb-[18px] flex flex-col justify-between gap-[14px] shrink-0"
        >
          {/* 2-COLUMN SPREAD: 378px Left + 24px Gap + 312px Right = 714px, Height = 763px */}
          <div
            style={{
              width: '714px',
              height: '763px',
              display: 'grid',
              gridTemplateColumns: '378px 312px',
              gap: '24px',
            }}
            className="items-stretch shrink-0"
          >
            {/* LEFT COLUMN: Strengths + Mentor Note */}
            <div
              style={{ width: '378px', height: '763px' }}
              className="flex flex-col justify-start gap-[20px] shrink-0"
            >
              {page2.showStrengths && strengthsToRender.length > 0 && (
                <DraggableDesignWrapper
                  id="strengths"
                  transform={layouts.strengths}
                  designMode={designMode}
                  scaleFactor={scaleFactor}
                  isActive={
                    activeTarget?.page === 2 &&
                    activeTarget.block === 'strengths'
                  }
                  onSelect={
                    onSelectTarget
                      ? () => onSelectTarget({ page: 2, block: 'strengths' })
                      : undefined
                  }
                  onUpdateTransform={
                    onUpdateTransform
                      ? (next) => onUpdateTransform('strengths', next)
                      : undefined
                  }
                  className="shrink-0"
                >
                  <section style={{ width: '378px' }} className="rounded-xl">
                    <h3 className="font-extrabold text-[17px] leading-[24px] tracking-tight uppercase text-[#111827] mb-[10px]">
                      МОИ СИЛЬНЫЕ СТОРОНЫ
                    </h3>
                    <div
                      style={{ width: '378px' }}
                      className={`grid items-stretch auto-rows-fr gap-[10px] ${
                        effectiveCols === 3 ? 'grid-cols-3' : 'grid-cols-2'
                      }`}
                    >
                      {strengthsToRender.map((item) => (
                        <StrengthCard
                          key={item.id}
                          strength={item}
                          ageCategory={resident.ageCategory}
                          compact={effectiveCols === 3}
                        />
                      ))}
                    </div>
                  </section>
                </DraggableDesignWrapper>
              )}

              {page2.showMentorNote && (
                <DraggableDesignWrapper
                  id="mentorNote"
                  transform={layouts.mentorNote}
                  designMode={designMode}
                  scaleFactor={scaleFactor}
                  isActive={
                    activeTarget?.page === 2 &&
                    activeTarget.block === 'mentorNote'
                  }
                  onSelect={
                    onSelectTarget
                      ? () => onSelectTarget({ page: 2, block: 'mentorNote' })
                      : undefined
                  }
                  onUpdateTransform={
                    onUpdateTransform
                      ? (next) => onUpdateTransform('mentorNote', next)
                      : undefined
                  }
                  className="shrink-0"
                >
                  <MentorNote
                    config={page2}
                    activeTarget={activeTarget}
                    onSelectTarget={onSelectTarget}
                  />
                </DraggableDesignWrapper>
              )}
            </div>

            {/* RIGHT COLUMN: Tall Coral Pride Card (strict 312x763px) */}
            {page2.showPride && (
              <DraggableDesignWrapper
                id="pride"
                transform={layouts.pride}
                designMode={designMode}
                scaleFactor={scaleFactor}
                isActive={
                  activeTarget?.page === 2 && activeTarget.block === 'pride'
                }
                onSelect={
                  onSelectTarget
                    ? () => onSelectTarget({ page: 2, block: 'pride' })
                    : undefined
                }
                onUpdateTransform={
                  onUpdateTransform
                    ? (next) => onUpdateTransform('pride', next)
                    : undefined
                }
                className="shrink-0"
              >
                <PrideSection
                  config={page2}
                  ageCategory={resident.ageCategory}
                  activeTarget={activeTarget}
                  onSelectTarget={onSelectTarget}
                />
              </DraggableDesignWrapper>
            )}
          </div>

          {/* BOTTOM TEAL BAND: NEXT CHAPTER (strict 714x168px) */}
          {page2.showNextChapter && (
            <DraggableDesignWrapper
              id="nextChapter"
              transform={layouts.nextChapter}
              designMode={designMode}
              scaleFactor={scaleFactor}
              isActive={
                activeTarget?.page === 2 &&
                activeTarget.block === 'nextChapter'
              }
              onSelect={
                onSelectTarget
                  ? () => onSelectTarget({ page: 2, block: 'nextChapter' })
                  : undefined
              }
              onUpdateTransform={
                onUpdateTransform
                  ? (next) => onUpdateTransform('nextChapter', next)
                  : undefined
              }
              className="shrink-0"
            >
              <NextChapter
                config={page2}
                ageCategory={resident.ageCategory}
                activeTarget={activeTarget}
                onSelectTarget={onSelectTarget}
              />
            </DraggableDesignWrapper>
          )}
        </div>
      </div>
    </article>
  );
}
