import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  Check,
  Columns2,
  Eye,
  EyeOff,
  Layers,
  Lock,
  Maximize2,
  Paintbrush,
  Palette,
  PenLine,
  Plus,
  Redo2,
  Save,
  Shapes,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  Undo2,
  Unlock,
} from 'lucide-react';
import { JOURNAL_STATUS_OPTIONS } from '../../data/curriculumCatalog';
import { ASSETS } from '../../data/presets';
import {
  AgeCategory,
  CanvasObjectTransform,
  DecorElement,
  DecorElementKind,
  EditorSectionTarget,
  JournalDocument,
  LibraryModule,
  MediaAsset,
  MediaCategory,
  ModuleCategoryConfig,
  SkillDefinition,
} from '../../types/journal';
import { ExportMenu } from '../ExportMenu';
import { JournalPageOne } from '../journal/JournalPageOne';
import { JournalPageTwo } from '../journal/JournalPageTwo';
import { ContextualInspector } from './ContextualInspector';
import { FillFormSidebar } from './FillFormSidebar';

interface EditorViewProps {
  doc: JournalDocument;
  libraryModules: LibraryModule[];
  categories?: ModuleCategoryConfig[];
  skillsCatalog?: SkillDefinition[];
  mediaAssets?: MediaAsset[];
  saveState: 'saved' | 'saving';
  onChange: (updated: JournalDocument) => void;
  onForceSave: () => void;
  onBackHome: () => void;
  onOpenPreview: () => void;
  onPrint: () => void;
  onExportSuccess?: () => void;
  getExportPageElements: () => {
    page1: HTMLElement | null;
    page2: HTMLElement | null;
  };
  onOpenMediaPicker: (
    category: MediaCategory | 'all',
    onSelect: (url: string, asset?: MediaAsset) => void
  ) => void;
}

type EditorMode = 'fill' | 'design' | 'preview';
type PageFocus = 1 | 2 | 'spread';

const PAGE1_LAYER_LABELS: Array<{ id: string; label: string }> = [
  { id: 'cover', label: 'Обложка и заголовок' },
  { id: 'modulesBlock', label: 'Блок «Мои открытия»' },
  { id: 'skills', label: 'Блок «Чему я научился»' },
  { id: 'projectsBlock', label: 'Блок «Мои результаты»' },
];

const PAGE2_LAYER_LABELS: Array<{ id: string; label: string }> = [
  { id: 'header', label: 'Шапка «Мои достижения»' },
  { id: 'strengths', label: 'Сильные стороны' },
  { id: 'pride', label: 'Момент гордости' },
  { id: 'mentorNote', label: 'Слово наставника' },
  { id: 'nextChapter', label: 'Что интересного впереди' },
];

export function EditorView({
  doc,
  libraryModules,
  categories,
  skillsCatalog,
  mediaAssets,
  saveState,
  onChange,
  onForceSave,
  onBackHome,
  onOpenPreview,
  onPrint,
  onExportSuccess,
  getExportPageElements,
  onOpenMediaPicker,
}: EditorViewProps) {
  const [pageFocus, setPageFocus] = useState<PageFocus>(1);
  const [mode, setMode] = useState<EditorMode>('fill');
  const [activeTarget, setActiveTarget] = useState<EditorSectionTarget>(null);
  const [zoom, setZoom] = useState<'auto' | number>('auto');
  const [autoScale, setAutoScale] = useState(0.7);

  const [blocksMenuOpen, setBlocksMenuOpen] = useState(false);
  const [decorMenuOpen, setDecorMenuOpen] = useState(false);
  const [layersDrawerOpen, setLayersDrawerOpen] = useState(false);

  // Undo / Redo history per journal session
  const [past, setPast] = useState<JournalDocument[]>([]);
  const [future, setFuture] = useState<JournalDocument[]>([]);
  const lastDocIdRef = useRef<string>(doc.id);

  useEffect(() => {
    if (lastDocIdRef.current !== doc.id) {
      lastDocIdRef.current = doc.id;
      setPast([]);
      setFuture([]);
      setActiveTarget(null);
    }
  }, [doc.id]);

  const applyChange = useCallback(
    (nextDoc: JournalDocument, recordHistory = true) => {
      if (recordHistory) {
        setPast((prev) => [...prev.slice(-39), doc]);
        setFuture([]);
      }
      onChange(nextDoc);
    },
    [doc, onChange]
  );

  const handleUndo = useCallback(() => {
    if (past.length === 0) return;
    const previous = past[past.length - 1];
    setPast((prev) => prev.slice(0, -1));
    setFuture((prev) => [doc, ...prev.slice(0, 39)]);
    onChange(previous);
  }, [past, doc, onChange]);

  const handleRedo = useCallback(() => {
    if (future.length === 0) return;
    const next = future[0];
    setFuture((prev) => prev.slice(1));
    setPast((prev) => [...prev.slice(-39), doc]);
    onChange(next);
  }, [future, doc, onChange]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const targetTag = (e.target as HTMLElement | null)?.tagName;
      if (targetTag === 'INPUT' || targetTag === 'TEXTAREA' || targetTag === 'SELECT') {
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleUndo, handleRedo]);

  const canvasStageRef = useRef<HTMLDivElement | null>(null);
  const effectiveSpread = mode === 'preview' || pageFocus === 'spread';
  const activeSinglePage: 1 | 2 = pageFocus === 2 ? 2 : 1;

  useEffect(() => {
    const el = canvasStageRef.current;
    if (!el) return;
    const recalc = () => {
      const availableW = el.clientWidth - 48;
      const availableH = el.clientHeight - 56;
      const targetW = effectiveSpread ? 794 * 2 + 16 : 794;
      const scaleW = availableW / targetW;
      const scaleH = availableH / 1123;
      const next = Math.min(1, Math.max(0.32, Math.min(scaleW, scaleH * 1.15)));
      setAutoScale(Number(next.toFixed(3)));
    };
    recalc();
    const obs = new ResizeObserver(recalc);
    obs.observe(el);
    return () => obs.disconnect();
  }, [mode, pageFocus, effectiveSpread]);

  const effectiveScale = zoom === 'auto' ? autoScale : zoom;
  const logicalW = effectiveSpread ? 794 * 2 + 12 : 794;

  const handleUpdateTransform = (
    pageNum: 1 | 2,
    blockId: string,
    next: CanvasObjectTransform
  ) => {
    if (pageNum === 1) {
      applyChange(
        {
          ...doc,
          page1: {
            ...doc.page1,
            objectLayouts: {
              ...(doc.page1.objectLayouts ?? {}),
              [blockId]: next,
            },
          },
        },
        false
      );
    } else {
      applyChange(
        {
          ...doc,
          page2: {
            ...doc.page2,
            objectLayouts: {
              ...(doc.page2.objectLayouts ?? {}),
              [blockId]: next,
            },
          },
        },
        false
      );
    }
  };

  const handleMoveDecor = (pageNum: 1 | 2, decorId: string, x: number, y: number) => {
    if (pageNum === 1) {
      applyChange(
        {
          ...doc,
          page1: {
            ...doc.page1,
            decorElements: (doc.page1.decorElements ?? []).map((el) =>
              el.id === decorId ? { ...el, x, y } : el
            ),
          },
        },
        false
      );
    } else {
      applyChange(
        {
          ...doc,
          page2: {
            ...doc.page2,
            decorElements: (doc.page2.decorElements ?? []).map((el) =>
              el.id === decorId ? { ...el, x, y } : el
            ),
          },
        },
        false
      );
    }
  };

  const handleAddDecor = (kind: DecorElementKind) => {
    const targetPage = activeSinglePage;
    const defaults: Record<
      DecorElementKind,
      { width: number; height: number; color: string; stickerText?: string; label?: string }
    > = {
      blob: { width: 110, height: 110, color: '#6CE3E2' },
      line: { width: 140, height: 28, color: '#18181B' },
      dots: { width: 84, height: 56, color: '#48C9D8' },
      star: { width: 58, height: 58, color: '#FFE14D' },
      sticker: { width: 108, height: 42, color: '#FFE14D', stickerText: 'TOP CODER' },
      icon: { width: 48, height: 48, color: '#C9F3EE', label: 'rocket' },
    };
    const cfg = defaults[kind];
    const newDecor: DecorElement = {
      id: `dec-${Date.now()}`,
      kind,
      label: cfg.label,
      stickerText: cfg.stickerText,
      x: 560,
      y: 380,
      width: cfg.width,
      height: cfg.height,
      rotation: 0,
      color: cfg.color,
      opacity: kind === 'blob' ? 0.55 : 0.95,
      zIndex: 25,
    };

    if (targetPage === 1) {
      applyChange({
        ...doc,
        page1: {
          ...doc.page1,
          decorElements: [...(doc.page1.decorElements ?? []), newDecor],
        },
      });
    } else {
      applyChange({
        ...doc,
        page2: {
          ...doc.page2,
          decorElements: [...(doc.page2.decorElements ?? []), newDecor],
        },
      });
    }
    setMode('design');
    setActiveTarget({ page: targetPage, block: 'decor', itemId: newDecor.id });
    setDecorMenuOpen(false);
  };

  const currentPageDecor =
    activeSinglePage === 1
      ? doc.page1.decorElements ?? []
      : doc.page2.decorElements ?? [];
  const currentPageLayouts =
    activeSinglePage === 1
      ? doc.page1.objectLayouts ?? {}
      : doc.page2.objectLayouts ?? {};
  const currentLayerList =
    activeSinglePage === 1 ? PAGE1_LAYER_LABELS : PAGE2_LAYER_LABELS;

  return (
    <div className="min-h-screen bg-[#F2F2EE] text-[#18181B] flex flex-col">
      {/* FULL-WIDTH EDITOR TOP BAR */}
      <header className="h-14 bg-white border-b border-zinc-200 px-5 flex items-center justify-between gap-4 sticky top-0 z-30">
        <div className="flex items-center gap-3 shrink-0">
          <img
            src={ASSETS.logo}
            alt="KIBERone"
            referrerPolicy="no-referrer"
            className="h-7 w-auto object-contain block"
          />
          <span className="hidden sm:inline text-sm font-bold text-zinc-900 whitespace-nowrap">
            Student Journey
          </span>
          <div className="h-4 w-px bg-zinc-200" />
          <button
            type="button"
            onClick={onBackHome}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-zinc-200 text-xs font-medium text-zinc-700 hover:bg-zinc-50 whitespace-nowrap"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>К списку</span>
          </button>
        </div>

        <div className="hidden lg:flex items-center gap-2.5 min-w-0">
          <span className="text-sm font-bold text-zinc-900 truncate max-w-[200px]">
            {doc.resident.fullName}
          </span>
          <span className="text-zinc-300">·</span>
          <span className="text-xs text-zinc-500 whitespace-nowrap">
            {doc.resident.period}
          </span>
          <span className="text-zinc-300">·</span>
          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 whitespace-nowrap">
            <Check className="w-3.5 h-3.5" />
            <span>{saveState === 'saving' ? 'Сохранение...' : 'Сохранено'}</span>
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onOpenPreview}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-xs font-medium text-zinc-700 whitespace-nowrap"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Разворот</span>
          </button>

          <ExportMenu
            doc={doc}
            getPageElements={getExportPageElements}
            onPrint={onPrint}
            onExportSuccess={onExportSuccess}
          />

          <button
            type="button"
            onClick={onForceSave}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold whitespace-nowrap"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Сохранить</span>
          </button>
        </div>
      </header>

      {/* SUB-BAR: MODE A (Заполнение) | MODE B (Дизайн) | PREVIEW + PAGE SWITCHER + TOOLS */}
      <div className="bg-white border-b border-zinc-200 px-5 py-2 flex flex-wrap items-center justify-between gap-3 sticky top-14 z-20">
        <div className="flex flex-wrap items-center gap-3">
          {/* 3-way Mode Switch */}
          <div className="flex items-center gap-1 p-1 bg-zinc-100 rounded-lg">
            <button
              type="button"
              onClick={() => {
                setMode('fill');
                setActiveTarget(null);
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
                mode === 'fill'
                  ? 'bg-white text-zinc-900 shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <PenLine className="w-3.5 h-3.5 text-[#0D9488]" />
              <span>Заполнение</span>
            </button>
            <button
              type="button"
              onClick={() => setMode('design')}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
                mode === 'design'
                  ? 'bg-white text-zinc-900 shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <Paintbrush className="w-3.5 h-3.5 text-[#0D9488]" />
              <span>Дизайн</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('preview');
                setActiveTarget(null);
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
                mode === 'preview'
                  ? 'bg-white text-zinc-900 shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Просмотр</span>
            </button>
          </div>

          {/* Page Thumbnails + Spread Toggle */}
          {mode !== 'preview' && (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setPageFocus(1);
                  setActiveTarget(null);
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium transition-colors whitespace-nowrap ${
                  pageFocus === 1
                    ? 'border-[#0D9488] bg-[#F0FDFA] text-[#0F766E]'
                    : 'border-zinc-200 bg-white text-zinc-600 hover:text-zinc-900'
                }`}
              >
                <span className="w-3 h-4 rounded-xs border border-current bg-[#6CE3E2]/45 block" />
                <span>Стр. 1: Мой путь</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setPageFocus(2);
                  setActiveTarget(null);
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium transition-colors whitespace-nowrap ${
                  pageFocus === 2
                    ? 'border-[#0D9488] bg-[#F0FDFA] text-[#0F766E]'
                    : 'border-zinc-200 bg-white text-zinc-600 hover:text-zinc-900'
                }`}
              >
                <span className="w-3 h-4 rounded-xs border border-current bg-[#FFE14D]/55 block" />
                <span>Стр. 2: Достижения</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setPageFocus('spread');
                  setActiveTarget(null);
                }}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium transition-colors whitespace-nowrap ${
                  pageFocus === 'spread'
                    ? 'border-[#0D9488] bg-[#F0FDFA] text-[#0F766E]'
                    : 'border-zinc-200 bg-white text-zinc-600 hover:text-zinc-900'
                }`}
                title="Показать обе страницы рядом"
              >
                <Columns2 className="w-3.5 h-3.5" />
                <span className="hidden xl:inline">Обе страницы</span>
              </button>
            </div>
          )}

          {/* DESIGN MODE TOOLBAR (Undo/Redo, Bg, Decor, Layers) */}
          {mode === 'design' && (
            <div className="flex items-center gap-1.5 pl-2 border-l border-zinc-200">
              <button
                type="button"
                disabled={past.length === 0}
                onClick={handleUndo}
                className="p-1.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 disabled:opacity-40"
                title="Отменить (Ctrl+Z)"
              >
                <Undo2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                disabled={future.length === 0}
                onClick={handleRedo}
                className="p-1.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 disabled:opacity-40"
                title="Повторить (Ctrl+Y)"
              >
                <Redo2 className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() =>
                  setActiveTarget({ page: activeSinglePage, block: 'background' })
                }
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-xs font-medium text-zinc-700"
              >
                <Palette className="w-3.5 h-3.5 text-[#0D9488]" />
                <span>Фон и палитра</span>
              </button>

              {/* Add Decor Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setDecorMenuOpen((v) => !v)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-semibold"
                >
                  <Shapes className="w-3.5 h-3.5" />
                  <span>+ Декор</span>
                </button>
                {decorMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-30"
                      onClick={() => setDecorMenuOpen(false)}
                    />
                    <div className="absolute left-0 mt-1.5 w-52 bg-white border border-zinc-200 rounded-xl shadow-lg p-1.5 z-40 text-xs space-y-0.5">
                      {(
                        [
                          { kind: 'star', label: 'Звезда исследователя' },
                          { kind: 'sticker', label: 'Стикер с текстом' },
                          { kind: 'blob', label: 'Фигурное пятно' },
                          { kind: 'line', label: 'Волнистая линия' },
                          { kind: 'dots', label: 'Декоративные точки' },
                          { kind: 'icon', label: 'Технологичный бейдж' },
                        ] as const
                      ).map((item) => (
                        <button
                          key={item.kind}
                          type="button"
                          onClick={() => handleAddDecor(item.kind)}
                          className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-zinc-100 font-medium text-zinc-800 flex items-center gap-2"
                        >
                          <Sparkles className="w-3 h-3 text-[#0D9488]" />
                          <span>{item.label}</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Layers Popover */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setLayersDrawerOpen((v) => !v)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-xs font-medium text-zinc-700"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Слои стр. {activeSinglePage}</span>
                </button>
                {layersDrawerOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-30"
                      onClick={() => setLayersDrawerOpen(false)}
                    />
                    <div className="absolute left-0 mt-1.5 w-72 bg-white border border-zinc-200 rounded-xl shadow-xl p-3 z-40 space-y-2 text-xs">
                      <div className="font-bold text-zinc-900">
                        Объекты страницы {activeSinglePage}
                      </div>
                      <div className="space-y-1 max-h-60 overflow-y-auto">
                        {currentLayerList.map((layer) => {
                          const tr = currentPageLayouts[layer.id];
                          const isHidden = Boolean(tr?.hidden);
                          const isLocked = Boolean(tr?.locked);
                          return (
                            <div
                              key={layer.id}
                              className="flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg bg-[#F9F9F7] border border-zinc-200"
                            >
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveTarget({
                                    page: activeSinglePage,
                                    block: layer.id as Exclude<EditorSectionTarget, null>['block'],
                                  } as EditorSectionTarget);
                                  setLayersDrawerOpen(false);
                                }}
                                className="truncate font-medium text-zinc-800 text-left flex-1 hover:text-[#0D9488]"
                              >
                                {layer.label}
                              </button>
                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleUpdateTransform(activeSinglePage, layer.id, {
                                      x: tr?.x ?? 0,
                                      y: tr?.y ?? 0,
                                      scale: tr?.scale ?? 1,
                                      rotation: tr?.rotation ?? 0,
                                      zIndex: tr?.zIndex ?? 10,
                                      locked: tr?.locked,
                                      hidden: !isHidden,
                                    })
                                  }
                                  className="p-1 rounded hover:bg-white text-zinc-500"
                                  title={isHidden ? 'Показать' : 'Скрыть'}
                                >
                                  {isHidden ? (
                                    <EyeOff className="w-3.5 h-3.5 text-red-500" />
                                  ) : (
                                    <Eye className="w-3.5 h-3.5" />
                                  )}
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleUpdateTransform(activeSinglePage, layer.id, {
                                      x: tr?.x ?? 0,
                                      y: tr?.y ?? 0,
                                      scale: tr?.scale ?? 1,
                                      rotation: tr?.rotation ?? 0,
                                      zIndex: tr?.zIndex ?? 10,
                                      hidden: tr?.hidden,
                                      locked: !isLocked,
                                    })
                                  }
                                  className="p-1 rounded hover:bg-white text-zinc-500"
                                  title={isLocked ? 'Разблокировать' : 'Заблокировать'}
                                >
                                  {isLocked ? (
                                    <Lock className="w-3.5 h-3.5 text-amber-600" />
                                  ) : (
                                    <Unlock className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              </div>
                            </div>
                          );
                        })}

                        {currentPageDecor.map((el) => (
                          <div
                            key={el.id}
                            className="flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg bg-[#F0FDFA] border border-[#99F6E4]"
                          >
                            <button
                              type="button"
                              onClick={() => {
                                setActiveTarget({
                                  page: activeSinglePage,
                                  block: 'decor',
                                  itemId: el.id,
                                });
                                setLayersDrawerOpen(false);
                              }}
                              className="truncate font-medium text-zinc-800 text-left flex-1"
                            >
                              Декор: {el.stickerText || el.kind}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const next = currentPageDecor.filter((d) => d.id !== el.id);
                                if (activeSinglePage === 1) {
                                  applyChange({
                                    ...doc,
                                    page1: { ...doc.page1, decorElements: next },
                                  });
                                } else {
                                  applyChange({
                                    ...doc,
                                    page2: { ...doc.page2, decorElements: next },
                                  });
                                }
                              }}
                              className="p-1 text-zinc-400 hover:text-red-600"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Utility Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Age Category Adapter */}
          <select
            value={doc.resident.ageCategory}
            onChange={(e) =>
              applyChange({
                ...doc,
                resident: {
                  ...doc.resident,
                  ageCategory: e.target.value as AgeCategory,
                },
              })
            }
            title="Возрастная адаптация дизайна"
            className="rounded-lg border border-zinc-200 bg-white px-2 py-1 text-xs font-medium text-zinc-700"
          >
            <option value="8-10">8–10 лет</option>
            <option value="11-13">11–13 лет</option>
            <option value="14-15">14–15 лет</option>
          </select>

          {/* Quick Blocks Visibility Popover */}
          {mode !== 'preview' && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setBlocksMenuOpen((v) => !v)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-xs font-medium text-zinc-700"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Блоки</span>
              </button>

              {blocksMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setBlocksMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-1.5 w-60 bg-white border border-zinc-200 rounded-xl shadow-lg p-3 z-40 space-y-2 text-xs">
                    {activeSinglePage === 1 ? (
                      <>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={doc.page1.showModules}
                            onChange={(e) =>
                              applyChange({
                                ...doc,
                                page1: { ...doc.page1, showModules: e.target.checked },
                              })
                            }
                          />
                          <span>Мои открытия (модули)</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={doc.page1.showSkills}
                            onChange={(e) =>
                              applyChange({
                                ...doc,
                                page1: { ...doc.page1, showSkills: e.target.checked },
                              })
                            }
                          />
                          <span>Чему я научился</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={doc.page1.showProjects}
                            onChange={(e) =>
                              applyChange({
                                ...doc,
                                page1: { ...doc.page1, showProjects: e.target.checked },
                              })
                            }
                          />
                          <span>Мои результаты</span>
                        </label>
                      </>
                    ) : (
                      <>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={doc.page2.showStrengths}
                            onChange={(e) =>
                              applyChange({
                                ...doc,
                                page2: { ...doc.page2, showStrengths: e.target.checked },
                              })
                            }
                          />
                          <span>Мои сильные стороны</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={doc.page2.showPride}
                            onChange={(e) =>
                              applyChange({
                                ...doc,
                                page2: { ...doc.page2, showPride: e.target.checked },
                              })
                            }
                          />
                          <span>Мой момент гордости</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={doc.page2.showMentorNote}
                            onChange={(e) =>
                              applyChange({
                                ...doc,
                                page2: { ...doc.page2, showMentorNote: e.target.checked },
                              })
                            }
                          />
                          <span>Слово наставника</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={doc.page2.showNextChapter}
                            onChange={(e) =>
                              applyChange({
                                ...doc,
                                page2: { ...doc.page2, showNextChapter: e.target.checked },
                              })
                            }
                          />
                          <span>Что интересного впереди</span>
                        </label>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Status Toggle */}
          <select
            value={doc.status}
            onChange={(e) =>
              applyChange({
                ...doc,
                status: e.target.value as JournalDocument['status'],
              })
            }
            className="rounded-lg border border-zinc-200 bg-white px-2 py-1 text-xs font-medium text-zinc-700"
          >
            {JOURNAL_STATUS_OPTIONS.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>

          {/* Zoom Controls */}
          <div className="flex items-center gap-1 p-0.5 bg-zinc-100 rounded-lg">
            {(
              [
                { v: 'auto', label: 'Авто' },
                { v: 0.75, label: '75%' },
                { v: 1, label: '100%' },
              ] as const
            ).map((z) => (
              <button
                key={String(z.v)}
                type="button"
                onClick={() => setZoom(z.v)}
                className={`px-2 py-1 rounded text-[11px] font-mono ${
                  zoom === z.v
                    ? 'bg-white text-zinc-900 shadow-xs font-semibold'
                    : 'text-zinc-500 hover:text-zinc-900'
                }`}
              >
                {z.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* MAIN DUAL-MODE WORKSPACE */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* MODE A LEFT SIDEBAR */}
        {mode === 'fill' && (
          <FillFormSidebar
            doc={doc}
            libraryModules={libraryModules}
            categories={categories}
            skillsCatalog={skillsCatalog}
            onChange={(next) => applyChange(next)}
            onFocusPage={(p) => {
              if (pageFocus !== 'spread') setPageFocus(p);
            }}
            onOpenMediaPicker={onOpenMediaPicker}
          />
        )}

        {/* CENTER A4 LIVE PREVIEW / DESIGN CANVAS */}
        <main
          ref={canvasStageRef}
          onClick={() => setActiveTarget(null)}
          className="flex-1 overflow-auto px-6 py-5 flex flex-col items-center justify-start relative"
        >
          {mode === 'design' && (
            <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-zinc-600 bg-white/85 px-3 py-1.5 rounded-full border border-zinc-200">
              <span>
                Перетаскивайте блоки и декор мышью по листу А4 · Клик по элементу открывает параметры справа
              </span>
              <span className="font-mono text-[11px] text-zinc-400">
                {Math.round(effectiveScale * 100)}%
              </span>
            </div>
          )}

          {mode === 'fill' && (
            <div className="mb-3 flex items-center gap-3 text-xs text-zinc-500">
              <span>
                Живой предпросмотр А4 · Также можно кликнуть на карточку прямо на странице
              </span>
              <span className="font-mono text-[11px] text-zinc-400">
                {Math.round(effectiveScale * 100)}%
              </span>
            </div>
          )}

          {/* Scaled Bounding Wrapper */}
          <div
            style={{
              width: `${logicalW * effectiveScale}px`,
              height: `${1123 * effectiveScale}px`,
            }}
            className="relative shrink-0"
          >
            <div
              style={{
                width: `${logicalW}px`,
                height: '1123px',
                transform: `scale(${effectiveScale})`,
                transformOrigin: 'top left',
              }}
              className={`flex items-start ${effectiveSpread ? 'gap-3' : ''}`}
            >
              {(effectiveSpread || pageFocus === 1) && (
                <div className="shadow-[0_18px_45px_rgba(0,0,0,0.16)] rounded-xs overflow-hidden">
                  <JournalPageOne
                    doc={doc}
                    mediaAssets={mediaAssets}
                    designMode={mode === 'design'}
                    scaleFactor={effectiveScale}
                    activeTarget={activeTarget}
                    onSelectTarget={mode === 'preview' ? undefined : setActiveTarget}
                    onUpdateTransform={(blockId, next) =>
                      handleUpdateTransform(1, blockId, next)
                    }
                    onMoveDecor={(decorId, x, y) =>
                      handleMoveDecor(1, decorId, x, y)
                    }
                  />
                </div>
              )}

              {(effectiveSpread || pageFocus === 2) && (
                <div className="shadow-[0_18px_45px_rgba(0,0,0,0.16)] rounded-xs overflow-hidden">
                  <JournalPageTwo
                    doc={doc}
                    designMode={mode === 'design'}
                    scaleFactor={effectiveScale}
                    activeTarget={activeTarget}
                    onSelectTarget={mode === 'preview' ? undefined : setActiveTarget}
                    onUpdateTransform={(blockId, next) =>
                      handleUpdateTransform(2, blockId, next)
                    }
                    onMoveDecor={(decorId, x, y) =>
                      handleMoveDecor(2, decorId, x, y)
                    }
                  />
                </div>
              )}
            </div>
          </div>

          {mode !== 'preview' && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenPreview();
              }}
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-900"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Открыть полноэкранный разворот</span>
            </button>
          )}
        </main>
      </div>

      {/* FLOATING CONTEXTUAL INSPECTOR (in Design mode or when a canvas element is clicked in Fill mode) */}
      {mode !== 'preview' && activeTarget && (
        <ContextualInspector
          doc={doc}
          target={activeTarget}
          mode={mode === 'design' ? 'design' : 'fill'}
          skillsCatalog={skillsCatalog}
          onChange={(next) => applyChange(next)}
          onClose={() => setActiveTarget(null)}
          onOpenMediaPicker={onOpenMediaPicker}
        />
      )}
    </div>
  );
}
