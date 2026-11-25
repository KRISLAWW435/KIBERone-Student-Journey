import React, { useState } from 'react';
import {
  ActiveTextFieldTarget,
  CanvasObjectTransform,
  DecorElement,
  EditorSectionTarget,
  JournalDocument,
  Page2Config,
  StrengthItem,
} from '../../types/journal';
import {
  DecorLayer,
  DraggableDesignWrapper,
  EMPTY_SNAP_LINES,
  InlineEditableText,
  PageGridOverlay,
  SmartGuidesOverlay,
  SnapLinesState,
} from './DecorLayer';
import { MentorNote } from './MentorNote';
import { NextChapter } from './NextChapter';
import { PageBackdropArtwork } from './PageBackdropArtwork';
import { PrideSection } from './PrideSection';
import { StrengthCard } from './StrengthCard';

interface JournalPageTwoProps {
  doc: JournalDocument;
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
  onUpdatePage2?: (patch: Partial<Page2Config>) => void;
  onUpdateStrength?: (strengthId: string, patch: Partial<StrengthItem>) => void;
  onUpdateMentorNote?: (patch: Partial<Page2Config['mentorNote']>) => void;
  onUpdateNextChapterTitle?: (next: string) => void;
  onUpdateNextTopicTitle?: (topicId: string, next: string) => void;
  onInteractionStart?: () => void;
  onInteractionEnd?: () => void;
}

export function JournalPageTwo({
  doc,
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
  onUpdatePage2,
  onUpdateStrength,
  onUpdateMentorNote,
  onUpdateNextChapterTitle,
  onUpdateNextTopicTitle,
  onInteractionStart,
  onInteractionEnd,
}: JournalPageTwoProps) {
  const [snapLines, setSnapLines] = useState<SnapLinesState>(EMPTY_SNAP_LINES);
  const { page2, resident } = doc;
  const visibleStrengths = page2.strengths.filter((s) => !s.hidden);
  const strengthsToRender = visibleStrengths.slice(0, 6);
  const isCompactStrengths = strengthsToRender.length > 3;
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
      className="a4-canvas shrink-0 relative overflow-hidden isolate"
      aria-label="Страница 2: Мои достижения"
    >
      {/* Background Grid */}
      <PageGridOverlay background={page2.background} />

      {/* Editorial Background Graphics (Organic Corner Blobs, Stars, Sparkles, Dot Grids) */}
      <PageBackdropArtwork
        page={2}
        accentTeal={page2.headerTealColor || '#38C8D4'}
        accentYellow={page2.headerYellowColor || '#FFE14D'}
      />

      {/* Smart Alignment Guides */}
      {designMode && <SmartGuidesOverlay lines={snapLines} />}

      {/* Decorative Layer (Free-positioned Text, Images, Vector Icons, Stickers) */}
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
            ? (id) => {
                onSelectTarget({ page: 2, block: 'decor', itemId: id });
                const el = (page2.decorElements ?? []).find((d) => d.id === id);
                if (el?.kind === 'text' && onSelectTextField) {
                  onSelectTextField({ page: 2, field: 'decorText', itemId: id });
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
        {/* TOP CLEAN TEAL + YELLOW WAVE HEADER (794x128px) */}
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
          onSnapLinesChange={setSnapLines}
          onInteractionStart={onInteractionStart}
          onInteractionEnd={onInteractionEnd}
          className="shrink-0"
        >
          <header
            style={{ width: '794px', height: '128px' }}
            className="relative px-[40px] flex items-center justify-center overflow-hidden shrink-0"
          >
            <svg
              aria-hidden="true"
              width="794"
              height="128"
              viewBox="0 0 794 128"
              preserveAspectRatio="none"
              className="absolute top-0 left-0"
            >
              <path
                d="M0 0H540C510 47 460 96 310 104C160 112 70 106 0 118V0Z"
                fill={page2.headerTealColor}
              />
              <path
                d="M460 0H794V110C705 116 585 94 475 62C420 45 435 15 460 0Z"
                fill={page2.headerYellowColor}
              />
            </svg>

            <InlineEditableText
              value={page2.headerTitle}
              onSelectText={
                onSelectTextField
                  ? () =>
                      onSelectTextField({
                        page: 2,
                        field: 'page2HeaderTitle',
                      })
                  : undefined
              }
              isSelected={
                activeTextField?.page === 2 &&
                activeTextField.field === 'page2HeaderTitle'
              }
              as="h2"
              className="font-journal-display relative z-[15] font-black text-[46px] leading-none tracking-tight text-[#FF7B6B] text-center uppercase"
              style={{
                textShadow:
                  '2px 0 0 #18181B, -2px 0 0 #18181B, 0 2px 0 #18181B, 0 -2px 0 #18181B, 2px 2px 0 #18181B, -2px 2px 0 #18181B, 2px -2px 0 #18181B, -2px -2px 0 #18181B, 0 0 8px #FFFFFF, 4px 5px 0 rgba(24,24,27,0.85)',
              }}
            />
          </header>
        </DraggableDesignWrapper>

        {/* BODY: 3-column Strengths -> Fixed 50/50 Pride & MentorNote -> Open Winding-Road NextChapter */}
        <div
          style={{ width: '794px', height: '995px' }}
          className="pointer-events-none relative z-[12] px-[40px] pt-[12px] pb-0 flex flex-col justify-between gap-[10px] shrink-0"
        >
          {/* 1. МОИ СИЛЬНЫЕ СТОРОНЫ */}
          {page2.showStrengths && strengthsToRender.length > 0 && (
            <DraggableDesignWrapper
              id="strengths"
              transform={layouts.strengths}
              designMode={designMode}
              scaleFactor={scaleFactor}
              isActive={
                activeTarget?.page === 2 && activeTarget.block === 'strengths'
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
              onSnapLinesChange={setSnapLines}
              onInteractionStart={onInteractionStart}
              onInteractionEnd={onInteractionEnd}
              className="shrink-0"
            >
              <section style={{ width: '714px' }} className="rounded-xl">
                <h3 className="font-journal-display font-black text-[17.5px] leading-[21px] tracking-tight uppercase text-[#111827] mb-[10px]">
                  МОИ СИЛЬНЫЕ СТОРОНЫ
                </h3>
                <div
                  style={{ width: '714px' }}
                  className="grid grid-cols-3 items-stretch auto-rows-fr gap-[14px]"
                >
                  {strengthsToRender.map((item) => (
                    <DraggableDesignWrapper
                      key={item.id}
                      id={`strength-${item.id}`}
                      transform={layouts[`strength-${item.id}`]}
                      designMode={designMode}
                      scaleFactor={scaleFactor}
                      isActive={false}
                      onSelect={
                        onSelectTarget
                          ? () =>
                              onSelectTarget({ page: 2, block: 'strengths' })
                          : undefined
                      }
                      onUpdateTransform={
                        onUpdateTransform
                          ? (next) =>
                              onUpdateTransform(`strength-${item.id}`, next)
                          : undefined
                      }
                      onSnapLinesChange={setSnapLines}
                      onInteractionStart={onInteractionStart}
                      onInteractionEnd={onInteractionEnd}
                      className="h-full"
                    >
                      <StrengthCard
                        strength={item}
                        ageCategory={resident.ageCategory}
                        compact={isCompactStrengths}
                        activeTextField={activeTextField}
                        onSelectTextField={onSelectTextField}
                        onUpdateField={
                          onUpdateStrength
                            ? (patch) => onUpdateStrength(item.id, patch)
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

          {/* 2. MIDDLE 50/50 TWO-COLUMN SPREAD: Rigid 345px Columns with Natural Vertical Flow */}
          <div
            style={{
              width: '714px',
              display: 'grid',
              gridTemplateColumns: '345px 345px',
              gap: '24px',
            }}
            className="items-stretch shrink-0"
          >
            {page2.showPride ? (
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
                onSnapLinesChange={setSnapLines}
                onInteractionStart={onInteractionStart}
                onInteractionEnd={onInteractionEnd}
                style={{ width: '345px' }}
                className="shrink-0 h-full"
              >
                <PrideSection
                  config={page2}
                  ageCategory={resident.ageCategory}
                  designMode={designMode}
                  scaleFactor={scaleFactor}
                  bearTransform={layouts.prideBear}
                  activeTarget={activeTarget}
                  activeTextField={activeTextField}
                  onSelectTarget={onSelectTarget}
                  onSelectTextField={onSelectTextField}
                  onUpdateTransform={onUpdateTransform}
                  onUpdateFields={onUpdatePage2}
                  onSnapLinesChange={setSnapLines}
                  onInteractionStart={onInteractionStart}
                  onInteractionEnd={onInteractionEnd}
                />
              </DraggableDesignWrapper>
            ) : (
              <div style={{ width: '345px', minHeight: '376px' }} />
            )}

            {page2.showMentorNote ? (
              <DraggableDesignWrapper
                id="mentorNote"
                transform={layouts.mentorNote}
                designMode={designMode}
                scaleFactor={scaleFactor}
                isActive={
                  activeTarget?.page === 2 && activeTarget.block === 'mentorNote'
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
                onSnapLinesChange={setSnapLines}
                onInteractionStart={onInteractionStart}
                onInteractionEnd={onInteractionEnd}
                style={{ width: '345px' }}
                className="shrink-0 h-full"
              >
                <MentorNote
                  config={page2}
                  activeTarget={activeTarget}
                  activeTextField={activeTextField}
                  onSelectTarget={onSelectTarget}
                  onSelectTextField={onSelectTextField}
                  onUpdateMentorNote={onUpdateMentorNote}
                  onBeginEdit={onInteractionStart}
                  onEndEdit={onInteractionEnd}
                />
              </DraggableDesignWrapper>
            ) : (
              <div style={{ width: '345px', minHeight: '376px' }} />
            )}
          </div>

          {/* 3. BOTTOM WINDING ROAD MAP: ЧТО ИНТЕРЕСНОГО ВПЕРЕДИ? */}
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
              onSnapLinesChange={setSnapLines}
              onInteractionStart={onInteractionStart}
              onInteractionEnd={onInteractionEnd}
              style={{ width: '794px', height: '266px' }}
              className="shrink-0 -mx-[40px]"
            >
              <NextChapter
                config={page2}
                ageCategory={resident.ageCategory}
                designMode={designMode}
                scaleFactor={scaleFactor}
                bearTransform={layouts.nextBear}
                activeTarget={activeTarget}
                activeTextField={activeTextField}
                onSelectTarget={onSelectTarget}
                onSelectTextField={onSelectTextField}
                onUpdateTransform={onUpdateTransform}
                onUpdateTitle={onUpdateNextChapterTitle}
                onUpdateTopicTitle={onUpdateNextTopicTitle}
                onSnapLinesChange={setSnapLines}
                onInteractionStart={onInteractionStart}
                onInteractionEnd={onInteractionEnd}
              />
            </DraggableDesignWrapper>
          )}
        </div>
      </div>
    </article>
  );
}
