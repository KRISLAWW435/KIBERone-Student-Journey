import React, { useState } from 'react';
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Copy,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Lock,
  Plus,
  RotateCcw,
  Sparkles,
  Trash2,
  Unlock,
  Upload,
  X,
} from 'lucide-react';
import {
  SKILL_MASTERY_OPTIONS,
  UNIFIED_SKILLS_CATALOG,
} from '../../data/curriculumCatalog';
import {
  ASSETS,
  DESIGN_PALETTES,
  MENTOR_NOTE_TEMPLATES,
  NEXT_TOPIC_LIBRARY,
  STRENGTH_LIBRARY,
} from '../../data/presets';
import {
  CanvasObjectTransform,
  ConfirmedResidentSkill,
  DecorElement,
  DecorElementKind,
  EditorSectionTarget,
  JournalDocument,
  MediaAsset,
  MediaCategory,
  ModuleIllustrationKey,
  ModuleItem,
  ModuleLucideIconKey,
  ModuleVisualMode,
  ProjectItem,
  SkillDefinition,
  SkillMasteryStatus,
} from '../../types/journal';
import {
  MODULE_ILLUSTRATION_OPTIONS,
  MODULE_LUCIDE_ICON_OPTIONS,
} from '../journal/JournalArtwork';

interface ContextualInspectorProps {
  doc: JournalDocument;
  target: Exclude<EditorSectionTarget, null>;
  mode: 'fill' | 'design';
  skillsCatalog?: SkillDefinition[];
  onChange: (updated: JournalDocument) => void;
  onClose: () => void;
  onOpenMediaPicker: (
    category: MediaCategory | 'all',
    onSelect: (url: string, asset?: MediaAsset) => void
  ) => void;
}

const DEFAULT_TRANSFORM: CanvasObjectTransform = {
  x: 0,
  y: 0,
  scale: 1,
  rotation: 0,
  zIndex: 10,
  hidden: false,
  locked: false,
};

export function ContextualInspector({
  doc,
  target,
  mode,
  skillsCatalog = UNIFIED_SKILLS_CATALOG,
  onChange,
  onClose,
  onOpenMediaPicker,
}: ContextualInspectorProps) {
  const [newSkill, setNewSkill] = useState('');
  const [aiBusy, setAiBusy] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const handleUpload = (file: File | undefined, cb: (url: string) => void) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') cb(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const getTitle = () => {
    if (target.page === 1) {
      switch (target.block) {
        case 'cover':
          return 'Обложка и данные резидента';
        case 'logo':
          return 'Логотип школы';
        case 'coverBear':
          return 'Маскот на обложке (Стр. 1)';
        case 'modulesBlock':
          return 'Секция «Мои открытия»';
        case 'module':
          return 'Карточка модуля';
        case 'skills':
          return 'Навыки «Чему я научился»';
        case 'projectsBlock':
          return 'Секция «Мои результаты»';
        case 'project':
          return 'Карточка проекта';
        case 'decor':
          return 'Декоративный элемент (Стр. 1)';
        case 'background':
          return 'Фон и сетка страницы 1';
      }
    } else {
      switch (target.block) {
        case 'header':
          return 'Верхняя композиция (Стр. 2)';
        case 'strengths':
          return 'Блок «Мои сильные стороны»';
        case 'pride':
          return 'Блок «Мой момент гордости»';
        case 'prideBear':
          return 'Медведь с наградой (Стр. 2)';
        case 'mentorNote':
          return 'Записка наставника';
        case 'nextChapter':
          return 'Блок «Что интересного впереди?»';
        case 'nextBear':
          return 'Медведь следующего этапа';
        case 'decor':
          return 'Декоративный элемент (Стр. 2)';
        case 'background':
          return 'Фон и сетка страницы 2';
      }
    }
  };

  const handleAiMentorNote = async () => {
    setAiBusy(true);
    setAiError(null);
    try {
      const res = await fetch('/api/generate-mentor-note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName: doc.resident.fullName,
          studentAge: doc.resident.age,
          period: doc.resident.period,
          mentorName: doc.resident.mentorName,
          modules: doc.page1.modules.filter((m) => !m.hidden).map((m) => m.title),
          skills: doc.page1.skills.map((s) => s.label),
          projects: doc.page1.projects.filter((p) => !p.hidden).map((p) => p.title),
          strengths: doc.page2.strengths
            .filter((s) => !s.hidden)
            .map((s) => ({ title: s.title, example: s.example })),
          prideText: doc.page2.prideText,
          observations: doc.page2.mentorNote.observationsDraft,
        }),
      });
      const payload = await res.json();
      if (!res.ok) {
        setAiError(payload.error || 'Ошибка генерации.');
        return;
      }
      onChange({
        ...doc,
        page2: {
          ...doc.page2,
          mentorNote: {
            ...doc.page2.mentorNote,
            greeting: payload.greeting || doc.page2.mentorNote.greeting,
            body: payload.body || doc.page2.mentorNote.body,
            signature: payload.signature || doc.page2.mentorNote.signature,
          },
        },
      });
    } catch {
      setAiError('Не удалось подключиться к серверу генерации.');
    } finally {
      setAiBusy(false);
    }
  };

  // Wrapper transform support for design mode on container blocks
  const transformBlockId: string | null =
    target.block === 'cover' ||
    target.block === 'modulesBlock' ||
    target.block === 'skills' ||
    target.block === 'projectsBlock' ||
    target.block === 'header' ||
    target.block === 'strengths' ||
    target.block === 'pride' ||
    target.block === 'mentorNote' ||
    target.block === 'nextChapter'
      ? target.block
      : null;

  const currentTransform: CanvasObjectTransform | null = transformBlockId
    ? (target.page === 1
        ? doc.page1.objectLayouts?.[transformBlockId]
        : doc.page2.objectLayouts?.[transformBlockId]) ?? DEFAULT_TRANSFORM
    : null;

  const updateTransform = (next: CanvasObjectTransform) => {
    if (!transformBlockId) return;
    if (target.page === 1) {
      onChange({
        ...doc,
        page1: {
          ...doc.page1,
          objectLayouts: {
            ...(doc.page1.objectLayouts ?? {}),
            [transformBlockId]: next,
          },
        },
      });
    } else {
      onChange({
        ...doc,
        page2: {
          ...doc.page2,
          objectLayouts: {
            ...(doc.page2.objectLayouts ?? {}),
            [transformBlockId]: next,
          },
        },
      });
    }
  };

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="fixed right-6 top-32 z-40 w-[370px] max-h-[calc(100vh-155px)] bg-white border border-zinc-200 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.14)] flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-zinc-100 flex items-center justify-between bg-[#F9F9F7]">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-[#0D9488]">
            {mode === 'design' ? 'Режим дизайна' : 'Редактор блока'} · Стр. {target.page}
          </div>
          <h3 className="text-sm font-bold text-zinc-900">{getTitle()}</h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-zinc-200/50"
          aria-label="Закрыть инспектор"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body */}
      <div className="p-4 overflow-y-auto space-y-4 text-xs">
        {/* BACKGROUND & PALETTE */}
        {target.block === 'background' && (() => {
          const bg =
            target.page === 1
              ? doc.page1.background ?? { color: '#FFFFFF', showGrid: false, gridStyle: 'dots' }
              : doc.page2.background ?? { color: '#FFFFFF', showGrid: false, gridStyle: 'dots' };

          const updateBg = (patch: Partial<typeof bg>) => {
            if (target.page === 1) {
              onChange({ ...doc, page1: { ...doc.page1, background: { ...bg, ...patch } } });
            } else {
              onChange({ ...doc, page2: { ...doc.page2, background: { ...bg, ...patch } } });
            }
          };

          return (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-zinc-700">Цвет бумаги (Стр. {target.page})</span>
                <input
                  type="color"
                  value={bg.color}
                  onChange={(e) => updateBg({ color: e.target.value })}
                  className="w-9 h-8 rounded border border-zinc-200 cursor-pointer"
                />
              </div>

              <div className="pt-2 border-t border-zinc-100 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer font-medium">
                  <input
                    type="checkbox"
                    checked={bg.showGrid}
                    onChange={(e) => updateBg({ showGrid: e.target.checked })}
                  />
                  <span>Фоновая сетка на странице</span>
                </label>

                {bg.showGrid && (
                  <div className="flex gap-1.5">
                    {([
                      { id: 'dots', label: 'Точки' },
                      { id: 'lines', label: 'Клетка' },
                    ] as const).map((g) => (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => updateBg({ gridStyle: g.id })}
                        className={`flex-1 py-1.5 rounded-lg border font-medium ${
                          bg.gridStyle === g.id
                            ? 'bg-zinc-900 text-white border-zinc-900'
                            : 'bg-white text-zinc-700 border-zinc-200'
                        }`}
                      >
                        {g.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-zinc-100 space-y-2">
                <div className="font-semibold text-zinc-700">
                  Цветовые палитры журнала (обе страницы)
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {DESIGN_PALETTES.map((pal) => (
                    <button
                      key={pal.id}
                      type="button"
                      onClick={() =>
                        onChange({
                          ...doc,
                          page1: {
                            ...doc.page1,
                            background: { ...bg, color: pal.pageBg },
                            coverBgStart: pal.coverStart,
                            coverBgEnd: pal.coverEnd,
                          },
                          page2: {
                            ...doc.page2,
                            background: {
                              ...(doc.page2.background ?? { showGrid: false, gridStyle: 'dots' }),
                              color: pal.pageBg,
                            },
                            headerTealColor: pal.p2Teal,
                            headerYellowColor: pal.p2Yellow,
                            prideBgColor: pal.prideCoral,
                            nextChapter: {
                              ...doc.page2.nextChapter,
                              bgColor: pal.nextBg,
                            },
                          },
                        })
                      }
                      className="flex items-center justify-between px-3 py-2 rounded-lg border border-zinc-200 hover:border-[#0D9488] text-left"
                    >
                      <span className="font-medium text-zinc-800">{pal.name}</span>
                      <span className="flex items-center gap-1">
                        {[pal.pageBg, pal.coverStart, pal.p2Yellow, pal.prideCoral].map((c, idx) => (
                          <span
                            key={idx}
                            style={{ backgroundColor: c }}
                            className="w-4 h-4 rounded-full border border-black/15"
                          />
                        ))}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          );
        })()}

        {/* DECOR ELEMENT */}
        {target.block === 'decor' && (() => {
          const list =
            target.page === 1
              ? doc.page1.decorElements ?? []
              : doc.page2.decorElements ?? [];
          const el = list.find((d) => d.id === target.itemId);
          if (!el) return null;

          const updateEl = (patch: Partial<DecorElement>) => {
            const nextList = list.map((item) =>
              item.id === el.id ? { ...item, ...patch } : item
            );
            if (target.page === 1) {
              onChange({ ...doc, page1: { ...doc.page1, decorElements: nextList } });
            } else {
              onChange({ ...doc, page2: { ...doc.page2, decorElements: nextList } });
            }
          };

          const deleteEl = () => {
            const nextList = list.filter((item) => item.id !== el.id);
            if (target.page === 1) {
              onChange({ ...doc, page1: { ...doc.page1, decorElements: nextList } });
            } else {
              onChange({ ...doc, page2: { ...doc.page2, decorElements: nextList } });
            }
            onClose();
          };

          const duplicateEl = () => {
            const copy: DecorElement = {
              ...el,
              id: `dec-${Date.now()}`,
              x: Math.min(720, el.x + 24),
              y: Math.min(1040, el.y + 24),
            };
            const nextList = [...list, copy];
            if (target.page === 1) {
              onChange({ ...doc, page1: { ...doc.page1, decorElements: nextList } });
            } else {
              onChange({ ...doc, page2: { ...doc.page2, decorElements: nextList } });
            }
          };

          return (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <label className="block">
                  <span className="font-semibold text-zinc-700">Тип декора</span>
                  <select
                    value={el.kind}
                    onChange={(e) => updateEl({ kind: e.target.value as DecorElementKind })}
                    className="mt-1 w-full rounded-lg border border-zinc-200 px-2 py-1.5 bg-white"
                  >
                    <option value="blob">Фигурное пятно</option>
                    <option value="line">Волнистая линия</option>
                    <option value="dots">Точки</option>
                    <option value="star">Звезда</option>
                    <option value="sticker">Стикер с текстом</option>
                    <option value="icon">Технологичный бейдж</option>
                  </select>
                </label>

                <label className="block">
                  <span className="font-semibold text-zinc-700">Цвет</span>
                  <input
                    type="color"
                    value={el.color}
                    onChange={(e) => updateEl({ color: e.target.value })}
                    className="mt-1 w-full h-8 rounded-lg border border-zinc-200 cursor-pointer"
                  />
                </label>
              </div>

              {el.kind === 'sticker' && (
                <label className="block">
                  <span className="font-semibold text-zinc-700">Текст стикера</span>
                  <input
                    type="text"
                    value={el.stickerText ?? 'TOP CODER'}
                    onChange={(e) => updateEl({ stickerText: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-zinc-200 px-2.5 py-1.5 font-bold"
                  />
                </label>
              )}

              {el.kind === 'icon' && (
                <label className="block">
                  <span className="font-semibold text-zinc-700">Иконка</span>
                  <select
                    value={el.label ?? 'sparkles'}
                    onChange={(e) => updateEl({ label: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-zinc-200 px-2 py-1.5 bg-white"
                  >
                    <option value="sparkles">Искры</option>
                    <option value="code">Терминал кода</option>
                    <option value="rocket">Ракета</option>
                    <option value="cpu">Микрочип</option>
                  </select>
                </label>
              )}

              <div className="grid grid-cols-2 gap-2">
                <label className="block">
                  <span className="text-[11px] font-semibold">Ширина ({el.width}px)</span>
                  <input
                    type="range"
                    min="24"
                    max="260"
                    value={el.width}
                    onChange={(e) => updateEl({ width: Number(e.target.value) })}
                    className="w-full accent-[#0D9488]"
                  />
                </label>
                <label className="block">
                  <span className="text-[11px] font-semibold">Высота ({el.height}px)</span>
                  <input
                    type="range"
                    min="20"
                    max="260"
                    value={el.height}
                    onChange={(e) => updateEl({ height: Number(e.target.value) })}
                    className="w-full accent-[#0D9488]"
                  />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <label className="block">
                  <span className="text-[11px] font-semibold">Поворот ({el.rotation}°)</span>
                  <input
                    type="range"
                    min="-180"
                    max="180"
                    value={el.rotation}
                    onChange={(e) => updateEl({ rotation: Number(e.target.value) })}
                    className="w-full accent-[#0D9488]"
                  />
                </label>
                <label className="block">
                  <span className="text-[11px] font-semibold">
                    Прозрачность ({Math.round(el.opacity * 100)}%)
                  </span>
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.05"
                    value={el.opacity}
                    onChange={(e) => updateEl({ opacity: Number(e.target.value) })}
                    className="w-full accent-[#0D9488]"
                  />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <label className="block">
                  <span className="text-[11px] font-semibold">X ({el.x}px)</span>
                  <input
                    type="range"
                    min="16"
                    max="740"
                    value={el.x}
                    onChange={(e) => updateEl({ x: Number(e.target.value) })}
                    className="w-full accent-[#0D9488]"
                  />
                </label>
                <label className="block">
                  <span className="text-[11px] font-semibold">Y ({el.y}px)</span>
                  <input
                    type="range"
                    min="16"
                    max="1060"
                    value={el.y}
                    onChange={(e) => updateEl({ y: Number(e.target.value) })}
                    className="w-full accent-[#0D9488]"
                  />
                </label>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-zinc-100">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => updateEl({ zIndex: Math.max(1, el.zIndex - 1) })}
                    className="p-1.5 rounded border border-zinc-200 hover:bg-zinc-50"
                    title="Ниже"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => updateEl({ zIndex: el.zIndex + 1 })}
                    className="p-1.5 rounded border border-zinc-200 hover:bg-zinc-50"
                    title="Выше"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => updateEl({ locked: !el.locked })}
                    className={`p-1.5 rounded border ${
                      el.locked ? 'border-amber-300 bg-amber-50 text-amber-700' : 'border-zinc-200'
                    }`}
                    title={el.locked ? 'Разблокировать' : 'Заблокировать'}
                  >
                    {el.locked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    type="button"
                    onClick={duplicateEl}
                    className="p-1.5 rounded border border-zinc-200 hover:bg-zinc-50"
                    title="Дублировать"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={deleteEl}
                  className="inline-flex items-center gap-1 text-red-600 hover:underline font-medium"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Удалить</span>
                </button>
              </div>
            </div>
          );
        })()}

        {/* PAGE 1: COVER */}
        {target.page === 1 && target.block === 'cover' && (
          <>
            <label className="block">
              <span className="font-semibold text-zinc-700">Заголовок обложки</span>
              <input
                type="text"
                value={doc.page1.coverTitle}
                onChange={(e) =>
                  onChange({
                    ...doc,
                    page1: { ...doc.page1, coverTitle: e.target.value },
                  })
                }
                className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-1.5 text-sm font-semibold"
              />
            </label>
            <label className="block">
              <span className="font-semibold text-zinc-700">Подзаголовок</span>
              <input
                type="text"
                value={doc.page1.coverSubtitle}
                onChange={(e) =>
                  onChange({
                    ...doc,
                    page1: { ...doc.page1, coverSubtitle: e.target.value },
                  })
                }
                className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-1.5 text-xs"
              />
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <label className="block">
                <span className="font-semibold text-zinc-700">Имя резидента</span>
                <input
                  type="text"
                  value={doc.resident.fullName}
                  onChange={(e) =>
                    onChange({
                      ...doc,
                      resident: { ...doc.resident, fullName: e.target.value },
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-zinc-200 px-2.5 py-1.5"
                />
              </label>
              <label className="block">
                <span className="font-semibold text-zinc-700">Возраст</span>
                <input
                  type="text"
                  value={doc.resident.age}
                  onChange={(e) =>
                    onChange({
                      ...doc,
                      resident: { ...doc.resident, age: e.target.value },
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-zinc-200 px-2.5 py-1.5"
                />
              </label>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <label className="block">
                <span className="font-semibold text-zinc-700">Период</span>
                <input
                  type="text"
                  value={doc.resident.period}
                  onChange={(e) =>
                    onChange({
                      ...doc,
                      resident: { ...doc.resident, period: e.target.value },
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-zinc-200 px-2.5 py-1.5"
                />
              </label>
              <label className="block">
                <span className="font-semibold text-zinc-700">Наставник</span>
                <input
                  type="text"
                  value={doc.resident.mentorName}
                  onChange={(e) =>
                    onChange({
                      ...doc,
                      resident: { ...doc.resident, mentorName: e.target.value },
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-zinc-200 px-2.5 py-1.5"
                />
              </label>
            </div>

            <div className="pt-2 border-t border-zinc-100 space-y-2.5">
              <div className="font-semibold text-zinc-700">Цвета градиента обложки</div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2">
                  <span>Начало</span>
                  <input
                    type="color"
                    value={doc.page1.coverBgStart}
                    onChange={(e) =>
                      onChange({
                        ...doc,
                        page1: { ...doc.page1, coverBgStart: e.target.value },
                      })
                    }
                    className="w-8 h-8 rounded border border-zinc-200 cursor-pointer"
                  />
                </label>
                <label className="flex items-center gap-2">
                  <span>Конец</span>
                  <input
                    type="color"
                    value={doc.page1.coverBgEnd}
                    onChange={(e) =>
                      onChange({
                        ...doc,
                        page1: { ...doc.page1, coverBgEnd: e.target.value },
                      })
                    }
                    className="w-8 h-8 rounded border border-zinc-200 cursor-pointer"
                  />
                </label>
              </div>
            </div>

            <div className="pt-2 border-t border-zinc-100 space-y-1.5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={doc.page1.showAge}
                  onChange={(e) =>
                    onChange({
                      ...doc,
                      page1: { ...doc.page1, showAge: e.target.checked },
                    })
                  }
                />
                <span>Показывать возраст</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={doc.page1.showCoverBear}
                  onChange={(e) =>
                    onChange({
                      ...doc,
                      page1: { ...doc.page1, showCoverBear: e.target.checked },
                    })
                  }
                />
                <span>Показывать маскота на обложке</span>
              </label>
            </div>
          </>
        )}

        {/* PAGE 1: LOGO */}
        {target.page === 1 && target.block === 'logo' && (
          <div className="space-y-3">
            <p className="text-zinc-500">
              Оригинальный логотип KIBERone используется без искажения пропорций и цветов.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() =>
                  onOpenMediaPicker('logo', (url) =>
                    onChange({ ...doc, page1: { ...doc.page1, logoUrl: url } })
                  )
                }
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-zinc-200 font-medium hover:bg-zinc-50"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Выбрать из медиатеки</span>
              </button>
              <button
                type="button"
                onClick={() =>
                  onChange({
                    ...doc,
                    page1: { ...doc.page1, logoUrl: ASSETS.logo },
                  })
                }
                className="px-3 py-2 rounded-lg bg-zinc-900 text-white font-medium"
              >
                Оригинал
              </button>
            </div>
          </div>
        )}

        {/* PAGE 1: MODULES BLOCK */}
        {target.page === 1 && target.block === 'modulesBlock' && (
          <div className="space-y-3">
            <p className="text-zinc-500">
              Нажмите на отдельную карточку модуля, чтобы изменить её текст и картинку, или переместите весь блок в режиме дизайна.
            </p>
            <button
              type="button"
              onClick={() =>
                onChange({
                  ...doc,
                  page1: {
                    ...doc.page1,
                    showModules: true,
                    modules: [
                      ...doc.page1.modules,
                      {
                        id: `mod-${Date.now()}`,
                        title: 'Новый модуль',
                        subtitle: 'Направление',
                        description: 'Краткое описание модуля.',
                        illustrationKey: 'web',
                        cardBgColor: '#DBEAFE',
                        layoutVariant: 'classic',
                        size: 'normal',
                        order: doc.page1.modules.length + 1,
                      },
                    ],
                  },
                })
              }
              className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#0D9488] text-white font-semibold"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Добавить модуль</span>
            </button>
          </div>
        )}

        {/* PAGE 1: PROJECTS BLOCK */}
        {target.page === 1 && target.block === 'projectsBlock' && (
          <div className="space-y-3">
            <p className="text-zinc-500">
              Секция результатов. Нажмите на отдельную карточку, чтобы загрузить скриншот проекта.
            </p>
            {doc.page1.projects.length < 4 && (
              <button
                type="button"
                onClick={() =>
                  onChange({
                    ...doc,
                    page1: {
                      ...doc.page1,
                      showProjects: true,
                      projects: [
                        ...doc.page1.projects,
                        {
                          id: `proj-${Date.now()}`,
                          title: 'Новый проект',
                          caption: 'Описание работы',
                          description: '',
                          fallbackTheme: 'web',
                          isRealScreenshot: false,
                        },
                      ],
                    },
                  })
                }
                className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#0D9488] text-white font-semibold"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Добавить проект</span>
              </button>
            )}
          </div>
        )}

        {/* BEAR EDITORS (Page 1 Cover, Page 2 Pride, Page 2 Next) */}
        {((target.page === 1 && target.block === 'coverBear') ||
          (target.page === 2 &&
            (target.block === 'prideBear' || target.block === 'nextBear'))) && (() => {
          const isP1 = target.page === 1;
          const isPride = target.page === 2 && target.block === 'prideBear';
          const currentUrl = isP1
            ? doc.page1.bearImageUrl
            : isPride
            ? doc.page2.prideBearUrl
            : doc.page2.nextChapter.bearUrl;
          const currentScale = isP1
            ? doc.page1.bearScale
            : isPride
            ? doc.page2.prideBearScale
            : doc.page2.nextChapter.bearScale;
          const currentX = isP1
            ? doc.page1.bearOffsetX
            : isPride
            ? doc.page2.prideBearOffsetX
            : doc.page2.nextChapter.bearOffsetX;
          const currentY = isP1
            ? doc.page1.bearOffsetY
            : isPride
            ? doc.page2.prideBearOffsetY
            : doc.page2.nextChapter.bearOffsetY;

          const updateBear = (patch: {
            url?: string;
            scale?: number;
            x?: number;
            y?: number;
            cropTop?: boolean;
          }) => {
            if (isP1) {
              onChange({
                ...doc,
                page1: {
                  ...doc.page1,
                  bearImageUrl: patch.url ?? doc.page1.bearImageUrl,
                  bearScale: patch.scale ?? doc.page1.bearScale,
                  bearOffsetX: patch.x ?? doc.page1.bearOffsetX,
                  bearOffsetY: patch.y ?? doc.page1.bearOffsetY,
                  bearCropTop: patch.cropTop ?? doc.page1.bearCropTop,
                },
              });
            } else if (isPride) {
              onChange({
                ...doc,
                page2: {
                  ...doc.page2,
                  prideBearUrl: patch.url ?? doc.page2.prideBearUrl,
                  prideBearScale: patch.scale ?? doc.page2.prideBearScale,
                  prideBearOffsetX: patch.x ?? doc.page2.prideBearOffsetX,
                  prideBearOffsetY: patch.y ?? doc.page2.prideBearOffsetY,
                },
              });
            } else {
              onChange({
                ...doc,
                page2: {
                  ...doc.page2,
                  nextChapter: {
                    ...doc.page2.nextChapter,
                    bearUrl: patch.url ?? doc.page2.nextChapter.bearUrl,
                    bearScale: patch.scale ?? doc.page2.nextChapter.bearScale,
                    bearOffsetX: patch.x ?? doc.page2.nextChapter.bearOffsetX,
                    bearOffsetY: patch.y ?? doc.page2.nextChapter.bearOffsetY,
                  },
                },
              });
            }
          };

          return (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'С планшетом', url: ASSETS.bearTablet },
                  { label: 'С кубком', url: ASSETS.bearTrophy },
                  { label: 'Приветствие', url: ASSETS.bearWelcome },
                ].map((pose) => (
                  <button
                    key={pose.label}
                    type="button"
                    onClick={() => updateBear({ url: pose.url })}
                    className={`p-2 rounded-lg border text-center ${
                      currentUrl === pose.url
                        ? 'border-[#0D9488] bg-[#F0FDFA]'
                        : 'border-zinc-200 hover:bg-zinc-50'
                    }`}
                  >
                    <img
                      src={pose.url}
                      alt={pose.label}
                      className="h-14 mx-auto object-contain mb-1"
                    />
                    <span className="text-[10px] font-medium block truncate">
                      {pose.label}
                    </span>
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() =>
                    onOpenMediaPicker('bear', (url) => updateBear({ url }))
                  }
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-zinc-200 font-medium hover:bg-zinc-50"
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Из медиатеки</span>
                </button>
                <label className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-zinc-900 text-white font-medium cursor-pointer">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Свой файл</span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={(e) =>
                      handleUpload(e.target.files?.[0], (url) =>
                        updateBear({ url })
                      )
                    }
                  />
                </label>
              </div>

              <div className="space-y-2.5 pt-2 border-t border-zinc-100">
                <label className="block">
                  <div className="flex justify-between mb-1">
                    <span className="font-semibold">Масштаб</span>
                    <span className="font-mono">{Math.round(currentScale * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.7"
                    max="1.35"
                    step="0.02"
                    value={currentScale}
                    onChange={(e) =>
                      updateBear({ scale: Number(e.target.value) })
                    }
                    className="w-full accent-[#0D9488]"
                  />
                </label>
                <label className="block">
                  <div className="flex justify-between mb-1">
                    <span className="font-semibold">Сдвиг по горизонтали</span>
                    <span className="font-mono">{currentX} px</span>
                  </div>
                  <input
                    type="range"
                    min="-40"
                    max="40"
                    step="1"
                    value={currentX}
                    onChange={(e) => updateBear({ x: Number(e.target.value) })}
                    className="w-full accent-[#0D9488]"
                  />
                </label>
                <label className="block">
                  <div className="flex justify-between mb-1">
                    <span className="font-semibold">Сдвиг по вертикали</span>
                    <span className="font-mono">{currentY} px</span>
                  </div>
                  <input
                    type="range"
                    min="-40"
                    max="40"
                    step="1"
                    value={currentY}
                    onChange={(e) => updateBear({ y: Number(e.target.value) })}
                    className="w-full accent-[#0D9488]"
                  />
                </label>
                {isP1 && (
                  <label className="flex items-center gap-2 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={doc.page1.bearCropTop}
                      onChange={(e) =>
                        updateBear({ cropTop: e.target.checked })
                      }
                    />
                    <span>Кадрировать по пояс (как в макете)</span>
                  </label>
                )}
              </div>
            </div>
          );
        })()}

        {/* PAGE 1: MODULE CARD */}
        {target.page === 1 && target.block === 'module' && (() => {
          const sorted = [...doc.page1.modules].sort((a, b) => a.order - b.order);
          const idx = sorted.findIndex((m) => m.id === target.itemId);
          const mod = sorted[idx];
          if (!mod) return null;

          const updateMod = (patch: Partial<ModuleItem>) =>
            onChange({
              ...doc,
              page1: {
                ...doc.page1,
                modules: doc.page1.modules.map((m) =>
                  m.id === mod.id ? { ...m, ...patch } : m
                ),
              },
            });

          return (
            <div className="space-y-3">
              <label className="block">
                <span className="font-semibold text-zinc-700">Название модуля</span>
                <input
                  type="text"
                  value={mod.title}
                  onChange={(e) => updateMod({ title: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-1.5 font-semibold"
                />
              </label>
              <label className="block">
                <span className="font-semibold text-zinc-700">Подзаголовок</span>
                <input
                  type="text"
                  value={mod.subtitle}
                  onChange={(e) => updateMod({ subtitle: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-1.5"
                />
              </label>
              <label className="block">
                <span className="font-semibold text-zinc-700">Описание</span>
                <textarea
                  rows={3}
                  value={mod.description}
                  onChange={(e) => updateMod({ description: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-1.5"
                />
              </label>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <label className="block">
                  <span className="font-semibold text-zinc-700">Стиль карточки</span>
                  <select
                    value={mod.layoutVariant ?? 'classic'}
                    onChange={(e) =>
                      updateMod({
                        layoutVariant: e.target.value as ModuleItem['layoutVariant'],
                      })
                    }
                    className="mt-1 w-full rounded-lg border border-zinc-200 px-2 py-1.5 bg-white"
                  >
                    <option value="classic">Классика</option>
                    <option value="badge-top">С бейджем</option>
                    <option value="minimal">Минимал</option>
                  </select>
                </label>

                <label className="block">
                  <span className="font-semibold text-zinc-700">Тип графики</span>
                  <select
                    value={
                      mod.visualMode ??
                      (mod.customImageUrl || mod.imageMediaId
                        ? 'image'
                        : 'illustration')
                    }
                    onChange={(e) =>
                      updateMod({
                        visualMode: e.target.value as ModuleVisualMode,
                      })
                    }
                    className="mt-1 w-full rounded-lg border border-zinc-200 px-2 py-1.5 bg-white"
                  >
                    <option value="illustration">SVG-иллюстрация</option>
                    <option value="icon">Большая иконка</option>
                    <option value="image">Картинка</option>
                  </select>
                </label>
              </div>

              <div className="grid grid-cols-[1fr_auto] gap-2 items-end">
                {(mod.visualMode ?? 'illustration') === 'icon' ? (
                  <label className="block">
                    <span className="font-semibold text-zinc-700">Иконка</span>
                    <select
                      value={mod.iconKey ?? 'blocks'}
                      onChange={(e) =>
                        updateMod({
                          visualMode: 'icon',
                          iconKey: e.target.value as ModuleLucideIconKey,
                        })
                      }
                      className="mt-1 w-full rounded-lg border border-zinc-200 px-2 py-1.5 bg-white"
                    >
                      {MODULE_LUCIDE_ICON_OPTIONS.map((opt) => (
                        <option key={opt.key} value={opt.key}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </label>
                ) : (
                  <label className="block">
                    <span className="font-semibold text-zinc-700">Иллюстрация</span>
                    <select
                      value={mod.illustrationKey}
                      onChange={(e) => {
                        const key = e.target.value as ModuleIllustrationKey;
                        const found = MODULE_ILLUSTRATION_OPTIONS.find((t) => t.key === key);
                        updateMod({
                          visualMode: 'illustration',
                          illustrationKey: key,
                          imageMediaId: null,
                          customImageUrl: undefined,
                          cardBgColor: found?.defaultColor || mod.cardBgColor,
                        });
                      }}
                      className="mt-1 w-full rounded-lg border border-zinc-200 px-2 py-1.5 bg-white"
                    >
                      {MODULE_ILLUSTRATION_OPTIONS.map((t) => (
                        <option key={t.key} value={t.key}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </label>
                )}

                <label className="block">
                  <span className="font-semibold text-zinc-700 block">Плашка</span>
                  <input
                    type="color"
                    value={mod.cardBgColor}
                    onChange={(e) => updateMod({ cardBgColor: e.target.value })}
                    className="mt-1 w-10 h-8 rounded-lg border border-zinc-200 cursor-pointer"
                  />
                </label>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() =>
                    onOpenMediaPicker('modules', (url, asset) =>
                      updateMod({
                        visualMode: 'image',
                        imageMediaId: asset?.id ?? null,
                        customImageUrl: url,
                      })
                    )
                  }
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 font-medium hover:bg-zinc-50"
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Медиатека</span>
                </button>
                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 text-white font-medium cursor-pointer">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Файл</span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={(e) =>
                      handleUpload(e.target.files?.[0], (url) =>
                        updateMod({
                          visualMode: 'image',
                          imageMediaId: null,
                          customImageUrl: url,
                        })
                      )
                    }
                  />
                </label>
                {(mod.customImageUrl || mod.imageMediaId) && (
                  <button
                    type="button"
                    onClick={() =>
                      updateMod({
                        visualMode: 'illustration',
                        imageMediaId: null,
                        customImageUrl: undefined,
                      })
                    }
                    className="px-2.5 py-1.5 rounded-lg border border-zinc-200 text-zinc-600"
                  >
                    Сброс
                  </button>
                )}
              </div>

              {/* Image Crop / Zoom */}
              <div className="p-2.5 rounded-lg bg-[#F9F9F7] border border-zinc-200 space-y-1.5">
                <div className="font-semibold text-zinc-700">Кадрирование картинки</div>
                <div className="grid grid-cols-3 gap-2">
                  <label className="block">
                    <span className="text-[10px]">Масштаб</span>
                    <input
                      type="range"
                      min="0.7"
                      max="1.8"
                      step="0.05"
                      value={mod.imageScale ?? 1}
                      onChange={(e) => updateMod({ imageScale: Number(e.target.value) })}
                      className="w-full accent-[#0D9488]"
                    />
                  </label>
                  <label className="block">
                    <span className="text-[10px]">Сдвиг X</span>
                    <input
                      type="range"
                      min="-30"
                      max="30"
                      value={mod.imagePosX ?? 0}
                      onChange={(e) => updateMod({ imagePosX: Number(e.target.value) })}
                      className="w-full accent-[#0D9488]"
                    />
                  </label>
                  <label className="block">
                    <span className="text-[10px]">Сдвиг Y</span>
                    <input
                      type="range"
                      min="-30"
                      max="30"
                      value={mod.imagePosY ?? 0}
                      onChange={(e) => updateMod({ imagePosY: Number(e.target.value) })}
                      className="w-full accent-[#0D9488]"
                    />
                  </label>
                </div>
              </div>

              {/* Position & Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-zinc-100">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => {
                      const next = [...sorted];
                      [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
                      onChange({
                        ...doc,
                        page1: {
                          ...doc.page1,
                          modules: next.map((m, i) => ({ ...m, order: i + 1 })),
                        },
                      });
                    }}
                    className="p-1.5 rounded border border-zinc-200 disabled:opacity-40"
                    title="Влево"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === sorted.length - 1}
                    onClick={() => {
                      const next = [...sorted];
                      [next[idx + 1], next[idx]] = [next[idx], next[idx + 1]];
                      onChange({
                        ...doc,
                        page1: {
                          ...doc.page1,
                          modules: next.map((m, i) => ({ ...m, order: i + 1 })),
                        },
                      });
                    }}
                    className="p-1.5 rounded border border-zinc-200 disabled:opacity-40"
                    title="Вправо"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => updateMod({ hidden: !mod.hidden })}
                    className="p-1.5 rounded border border-zinc-200"
                    title="Скрыть карточку"
                  >
                    {mod.hidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onChange({
                        ...doc,
                        page1: {
                          ...doc.page1,
                          modules: [
                            ...doc.page1.modules,
                            {
                              ...mod,
                              id: `mod-${Date.now()}`,
                              title: `${mod.title} (копия)`,
                              order: doc.page1.modules.length + 1,
                            },
                          ],
                        },
                      })
                    }
                    className="p-1.5 rounded border border-zinc-200"
                    title="Дублировать"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>

                {doc.page1.modules.length > 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      onChange({
                        ...doc,
                        page1: {
                          ...doc.page1,
                          modules: doc.page1.modules.filter(
                            (m) => m.id !== mod.id
                          ),
                        },
                      });
                      onClose();
                    }}
                    className="inline-flex items-center gap-1 text-red-600 hover:underline"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Удалить</span>
                  </button>
                )}
              </div>
            </div>
          );
        })()}

        {/* PAGE 1: SKILLS */}
        {target.page === 1 && target.block === 'skills' && (() => {
          const confirmedList: ConfirmedResidentSkill[] =
            doc.page1.confirmedSkills ??
            doc.page1.skills.map((s) => ({
              id: s.id,
              skillId: s.skillId,
              label: s.label,
              bgColor: s.bgColor,
              status: s.status ?? 'independent',
              confirmedAt: doc.updatedAt || doc.createdAt,
            }));

          const syncSkills = (nextConfirmed: ConfirmedResidentSkill[]) =>
            onChange({
              ...doc,
              page1: {
                ...doc.page1,
                confirmedSkills: nextConfirmed,
                skills: nextConfirmed.map((c) => ({
                  id: c.id,
                  skillId: c.skillId,
                  label: c.label,
                  bgColor: c.bgColor,
                  status: c.status,
                })),
              },
            });

          const rawPool = new Set<string>(doc.page1.suggestedSkillsPool ?? []);
          doc.page1.modules.forEach((m) =>
            (m.suggestedSkills ?? []).forEach((sid) => rawPool.add(sid))
          );
          const confirmedIds = new Set(confirmedList.map((c) => c.skillId).filter(Boolean));
          const confirmedLabels = new Set(
            confirmedList.map((c) => c.label.trim().toLowerCase())
          );
          const suggestedDefs = Array.from(rawPool)
            .map((sid) => skillsCatalog.find((s) => s.id === sid))
            .filter(
              (def): def is SkillDefinition =>
                Boolean(def) &&
                !confirmedIds.has(def!.id) &&
                !confirmedLabels.has(def!.label.trim().toLowerCase())
            );

          return (
            <div className="space-y-3">
              {suggestedDefs.length > 0 && (
                <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200 space-y-1.5">
                  <div className="text-[11px] font-bold text-amber-900">
                    Рекомендовано модулями (подтвердите вручную):
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {suggestedDefs.map((def) => (
                      <button
                        key={def.id}
                        type="button"
                        onClick={() =>
                          syncSkills([
                            ...confirmedList,
                            {
                              id: `sk-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
                              skillId: def.id,
                              label: def.label,
                              bgColor: def.defaultColor,
                              status: 'independent',
                              confirmedAt: new Date().toISOString(),
                            },
                          ])
                        }
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-amber-300 bg-white hover:bg-emerald-50 text-[11px] font-medium"
                      >
                        <Plus className="w-3 h-3 text-[#0D9488]" />
                        <span>{def.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <div className="font-semibold text-zinc-700">
                  Подтверждённые навыки ({confirmedList.length}):
                </div>
                {confirmedList.map((sk) => (
                  <div key={sk.id} className="p-2 rounded-lg border border-zinc-200 bg-[#F9F9F7] space-y-1.5">
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={sk.bgColor}
                        onChange={(e) =>
                          syncSkills(
                            confirmedList.map((c) =>
                              c.id === sk.id ? { ...c, bgColor: e.target.value } : c
                            )
                          )
                        }
                        className="w-7 h-7 rounded border border-zinc-200 shrink-0 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={sk.label}
                        onChange={(e) =>
                          syncSkills(
                            confirmedList.map((c) =>
                              c.id === sk.id ? { ...c, label: e.target.value } : c
                            )
                          )
                        }
                        className="flex-1 rounded border border-zinc-200 bg-white px-2.5 py-1 font-medium"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          syncSkills(confirmedList.filter((c) => c.id !== sk.id))
                        }
                        className="p-1 text-zinc-400 hover:text-red-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <select
                      value={sk.status}
                      onChange={(e) =>
                        syncSkills(
                          confirmedList.map((c) =>
                            c.id === sk.id
                              ? { ...c, status: e.target.value as SkillMasteryStatus }
                              : c
                          )
                        )
                      }
                      className="w-full rounded border border-zinc-200 bg-white px-2 py-1 text-[11px]"
                    >
                      {SKILL_MASTERY_OPTIONS.map((opt) => (
                        <option key={opt.id} value={opt.id}>
                          Уровень: {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-zinc-100 space-y-1.5">
                <div className="font-semibold text-zinc-700">Справочник навыков:</div>
                <div className="flex flex-wrap gap-1 max-h-36 overflow-y-auto">
                  {skillsCatalog.slice(0, 24).map((lib) => {
                    const exists = confirmedList.some(
                      (c) =>
                        c.skillId === lib.id ||
                        c.label.toLowerCase() === lib.label.toLowerCase()
                    );
                    return (
                      <button
                        key={lib.id}
                        type="button"
                        onClick={() => {
                          if (exists) {
                            syncSkills(
                              confirmedList.filter(
                                (c) =>
                                  c.skillId !== lib.id &&
                                  c.label.toLowerCase() !== lib.label.toLowerCase()
                              )
                            );
                          } else {
                            syncSkills([
                              ...confirmedList,
                              {
                                id: `sk-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
                                skillId: lib.id,
                                label: lib.label,
                                bgColor: lib.defaultColor,
                                status: 'independent',
                                confirmedAt: new Date().toISOString(),
                              },
                            ]);
                          }
                        }}
                        className={`px-2 py-1 rounded border text-[11px] font-medium ${
                          exists
                            ? 'bg-zinc-900 text-white border-zinc-900'
                            : 'bg-white text-zinc-700 border-zinc-200'
                        }`}
                      >
                        {lib.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Свой навык..."
                  className="flex-1 rounded-lg border border-zinc-200 px-2.5 py-1.5"
                />
                <button
                  type="button"
                  onClick={() => {
                    const label = newSkill.trim();
                    if (!label) return;
                    syncSkills([
                      ...confirmedList,
                      {
                        id: `sk-${Date.now()}`,
                        label,
                        bgColor: '#FFE047',
                        status: 'independent',
                        confirmedAt: new Date().toISOString(),
                      },
                    ]);
                    setNewSkill('');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-[#0D9488] text-white font-semibold"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })()}

        {/* PAGE 1: PROJECT CARD */}
        {target.page === 1 && target.block === 'project' && (() => {
          const proj = doc.page1.projects.find((p) => p.id === target.itemId);
          if (!proj) return null;

          const updateProj = (patch: Partial<ProjectItem>) =>
            onChange({
              ...doc,
              page1: {
                ...doc.page1,
                projects: doc.page1.projects.map((p) =>
                  p.id === proj.id ? { ...p, ...patch } : p
                ),
              },
            });

          return (
            <div className="space-y-3">
              <label className="block">
                <span className="font-semibold text-zinc-700">Название проекта</span>
                <input
                  type="text"
                  value={proj.title}
                  onChange={(e) => updateProj({ title: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-1.5 font-semibold"
                />
              </label>
              <label className="block">
                <span className="font-semibold text-zinc-700">Подпись</span>
                <input
                  type="text"
                  value={proj.caption}
                  onChange={(e) => updateProj({ caption: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-1.5"
                />
              </label>

              <div className="flex gap-2">
                <label className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-zinc-900 text-white font-medium cursor-pointer">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Загрузить скриншот</span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={(e) =>
                      handleUpload(e.target.files?.[0], (url) =>
                        updateProj({ imageUrl: url, isRealScreenshot: true })
                      )
                    }
                  />
                </label>
                <button
                  type="button"
                  onClick={() =>
                    onOpenMediaPicker('projects', (url) =>
                      updateProj({ imageUrl: url, isRealScreenshot: true })
                    )
                  }
                  className="px-3 py-2 rounded-lg border border-zinc-200 font-medium hover:bg-zinc-50"
                >
                  Медиатека
                </button>
              </div>

              {proj.imageUrl && (
                <div className="p-2.5 rounded-lg bg-[#F9F9F7] border border-zinc-200 space-y-1.5">
                  <div className="font-semibold text-zinc-700">Кадрирование скриншота</div>
                  <div className="grid grid-cols-3 gap-2">
                    <label className="block">
                      <span className="text-[10px]">Масштаб</span>
                      <input
                        type="range"
                        min="0.8"
                        max="1.8"
                        step="0.05"
                        value={proj.imageScale ?? 1}
                        onChange={(e) => updateProj({ imageScale: Number(e.target.value) })}
                        className="w-full accent-[#0D9488]"
                      />
                    </label>
                    <label className="block">
                      <span className="text-[10px]">Сдвиг X</span>
                      <input
                        type="range"
                        min="-30"
                        max="30"
                        value={proj.imagePosX ?? 0}
                        onChange={(e) => updateProj({ imagePosX: Number(e.target.value) })}
                        className="w-full accent-[#0D9488]"
                      />
                    </label>
                    <label className="block">
                      <span className="text-[10px]">Сдвиг Y</span>
                      <input
                        type="range"
                        min="-30"
                        max="30"
                        value={proj.imagePosY ?? 0}
                        onChange={(e) => updateProj({ imagePosY: Number(e.target.value) })}
                        className="w-full accent-[#0D9488]"
                      />
                    </label>
                  </div>
                </div>
              )}

              <label className="block">
                <span className="font-semibold text-zinc-700">
                  Тематическая иллюстрация (если нет скриншота)
                </span>
                <select
                  value={proj.fallbackTheme}
                  onChange={(e) =>
                    updateProj({
                      fallbackTheme: e.target
                        .value as ProjectItem['fallbackTheme'],
                      imageUrl: undefined,
                      isRealScreenshot: false,
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-zinc-200 px-2.5 py-1.5 bg-white"
                >
                  <option value="minecraft">3D-игра</option>
                  <option value="animation">Анимация</option>
                  <option value="web">Цифровой проект</option>
                  <option value="python">Код Python</option>
                  <option value="game3d">3D-локация</option>
                </select>
              </label>

              <div className="flex items-center justify-between pt-2 border-t border-zinc-100">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => updateProj({ hidden: !proj.hidden })}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded border border-zinc-200"
                  >
                    {proj.hidden ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    <span>{proj.hidden ? 'Скрыт' : 'Виден'}</span>
                  </button>
                  {doc.page1.projects.length < 4 && (
                    <button
                      type="button"
                      onClick={() =>
                        onChange({
                          ...doc,
                          page1: {
                            ...doc.page1,
                            projects: [
                              ...doc.page1.projects,
                              {
                                ...proj,
                                id: `proj-${Date.now()}`,
                                title: `${proj.title} (копия)`,
                              },
                            ],
                          },
                        })
                      }
                      className="p-1.5 rounded border border-zinc-200"
                      title="Дублировать"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {doc.page1.projects.length > 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      onChange({
                        ...doc,
                        page1: {
                          ...doc.page1,
                          projects: doc.page1.projects.filter(
                            (p) => p.id !== proj.id
                          ),
                        },
                      });
                      onClose();
                    }}
                    className="inline-flex items-center gap-1 text-red-600 hover:underline"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Удалить</span>
                  </button>
                )}
              </div>
            </div>
          );
        })()}

        {/* PAGE 2: HEADER */}
        {target.page === 2 && target.block === 'header' && (
          <div className="space-y-3">
            <label className="block">
              <span className="font-semibold text-zinc-700">Заголовок страницы</span>
              <input
                type="text"
                value={doc.page2.headerTitle}
                onChange={(e) =>
                  onChange({
                    ...doc,
                    page2: { ...doc.page2, headerTitle: e.target.value },
                  })
                }
                className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-1.5 font-bold"
              />
            </label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <span>Бирюзовый</span>
                <input
                  type="color"
                  value={doc.page2.headerTealColor}
                  onChange={(e) =>
                    onChange({
                      ...doc,
                      page2: { ...doc.page2, headerTealColor: e.target.value },
                    })
                  }
                  className="w-8 h-8 rounded border border-zinc-200 cursor-pointer"
                />
              </label>
              <label className="flex items-center gap-2">
                <span>Жёлтый</span>
                <input
                  type="color"
                  value={doc.page2.headerYellowColor}
                  onChange={(e) =>
                    onChange({
                      ...doc,
                      page2: { ...doc.page2, headerYellowColor: e.target.value },
                    })
                  }
                  className="w-8 h-8 rounded border border-zinc-200 cursor-pointer"
                />
              </label>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={doc.page2.showHeaderDecor}
                onChange={(e) =>
                  onChange({
                    ...doc,
                    page2: { ...doc.page2, showHeaderDecor: e.target.checked },
                  })
                }
              />
              <span>Показывать декоративные звёзды и рисунок</span>
            </label>
          </div>
        )}

        {/* PAGE 2: STRENGTHS */}
        {target.page === 2 && target.block === 'strengths' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-zinc-700">Сетка карточек</span>
              <div className="flex gap-1 p-0.5 bg-zinc-100 rounded-lg">
                {([2, 3] as const).map((cols) => (
                  <button
                    key={cols}
                    type="button"
                    onClick={() =>
                      onChange({
                        ...doc,
                        page2: { ...doc.page2, strengthsColumns: cols },
                      })
                    }
                    className={`px-2.5 py-1 rounded text-[11px] font-medium ${
                      doc.page2.strengthsColumns === cols
                        ? 'bg-white shadow-xs text-zinc-900'
                        : 'text-zinc-500'
                    }`}
                  >
                    {cols === 2 ? '2×2' : '3×2'}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {STRENGTH_LIBRARY.map((lib) => {
                const exists = doc.page2.strengths.some(
                  (s) => s.title === lib.title
                );
                return (
                  <button
                    key={lib.title}
                    type="button"
                    onClick={() =>
                      onChange({
                        ...doc,
                        page2: {
                          ...doc.page2,
                          strengths: exists
                            ? doc.page2.strengths.filter(
                                (s) => s.title !== lib.title
                              )
                            : [
                                ...doc.page2.strengths,
                                {
                                  id: `str-${Date.now()}`,
                                  title: lib.title,
                                  example: lib.defaultExample,
                                  iconKey: lib.iconKey,
                                  bgColor: lib.bgColor,
                                },
                              ],
                        },
                      })
                    }
                    className={`px-2 py-1 rounded-md border text-[11px] font-medium ${
                      exists
                        ? 'bg-zinc-900 text-white border-zinc-900'
                        : 'bg-white text-zinc-700 border-zinc-200'
                    }`}
                  >
                    {lib.title}
                  </button>
                );
              })}
            </div>

            <div className="space-y-2 pt-2 border-t border-zinc-100">
              {doc.page2.strengths.map((str) => (
                <div
                  key={str.id}
                  className="p-2 rounded-lg border border-zinc-200 bg-[#F9F9F7] space-y-1.5"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={str.bgColor}
                      onChange={(e) =>
                        onChange({
                          ...doc,
                          page2: {
                            ...doc.page2,
                            strengths: doc.page2.strengths.map((s) =>
                              s.id === str.id
                                ? { ...s, bgColor: e.target.value }
                                : s
                            ),
                          },
                        })
                      }
                      className="w-6 h-6 rounded border border-zinc-200 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={str.title}
                      onChange={(e) =>
                        onChange({
                          ...doc,
                          page2: {
                            ...doc.page2,
                            strengths: doc.page2.strengths.map((s) =>
                              s.id === str.id ? { ...s, title: e.target.value } : s
                            ),
                          },
                        })
                      }
                      className="flex-1 rounded border border-zinc-200 bg-white px-2 py-1 font-semibold"
                    />
                  </div>
                  <input
                    type="text"
                    value={str.example}
                    onChange={(e) =>
                      onChange({
                        ...doc,
                        page2: {
                          ...doc.page2,
                          strengths: doc.page2.strengths.map((s) =>
                            s.id === str.id ? { ...s, example: e.target.value } : s
                          ),
                        },
                      })
                    }
                    placeholder="Пример наблюдения..."
                    className="w-full rounded border border-zinc-200 bg-white px-2 py-1 text-[11px]"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PAGE 2: PRIDE SECTION */}
        {target.page === 2 && target.block === 'pride' && (
          <div className="space-y-3">
            <label className="block">
              <span className="font-semibold text-zinc-700">Заголовок карточки</span>
              <input
                type="text"
                value={doc.page2.prideTitle}
                onChange={(e) =>
                  onChange({
                    ...doc,
                    page2: { ...doc.page2, prideTitle: e.target.value },
                  })
                }
                className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-1.5 font-semibold"
              />
            </label>
            <label className="block">
              <span className="font-semibold text-zinc-700">
                Достижение резидента
              </span>
              <textarea
                rows={4}
                value={doc.page2.prideText}
                onChange={(e) =>
                  onChange({
                    ...doc,
                    page2: { ...doc.page2, prideText: e.target.value },
                  })
                }
                className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-1.5"
              />
            </label>
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2">
                <span>Коралловый фон</span>
                <input
                  type="color"
                  value={doc.page2.prideBgColor}
                  onChange={(e) =>
                    onChange({
                      ...doc,
                      page2: { ...doc.page2, prideBgColor: e.target.value },
                    })
                  }
                  className="w-8 h-8 rounded border border-zinc-200 cursor-pointer"
                />
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={doc.page2.showPrideConfetti}
                  onChange={(e) =>
                    onChange({
                      ...doc,
                      page2: {
                        ...doc.page2,
                        showPrideConfetti: e.target.checked,
                      },
                    })
                  }
                />
                <span>Конфетти</span>
              </label>
            </div>
          </div>
        )}

        {/* PAGE 2: MENTOR NOTE */}
        {target.page === 2 && target.block === 'mentorNote' && (
          <div className="space-y-3">
            <div className="p-2.5 rounded-xl bg-[#F0FDFA] border border-[#99F6E4] space-y-2">
              <textarea
                rows={2}
                value={doc.page2.mentorNote.observationsDraft}
                onChange={(e) =>
                  onChange({
                    ...doc,
                    page2: {
                      ...doc.page2,
                      mentorNote: {
                        ...doc.page2.mentorNote,
                        observationsDraft: e.target.value,
                      },
                    },
                  })
                }
                placeholder="Короткие заметки для AI-генерации..."
                className="w-full rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-[11px]"
              />
              <button
                type="button"
                disabled={aiBusy}
                onClick={handleAiMentorNote}
                className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0D9488] text-white font-semibold hover:bg-[#0F766E] disabled:opacity-60"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>
                  {aiBusy ? 'Генерация...' : 'Улучшить / сгенерировать с AI'}
                </span>
              </button>
              {aiError && (
                <div className="text-[11px] text-red-700 bg-red-50 border border-red-200 rounded p-2">
                  {aiError}
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-1">
              {MENTOR_NOTE_TEMPLATES.map((tpl) => (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() =>
                    onChange({
                      ...doc,
                      page2: {
                        ...doc.page2,
                        mentorNote: {
                          ...doc.page2.mentorNote,
                          greeting: `${doc.resident.fullName.split(' ')[0]}, ${tpl.greeting.toLowerCase()}`,
                          body: tpl.body,
                        },
                      },
                    })
                  }
                  className="px-2 py-1 rounded border border-zinc-200 hover:border-[#0D9488] text-[10px]"
                >
                  {tpl.title}
                </button>
              ))}
            </div>

            <label className="block">
              <span className="font-semibold text-zinc-700">Обращение</span>
              <input
                type="text"
                value={doc.page2.mentorNote.greeting}
                onChange={(e) =>
                  onChange({
                    ...doc,
                    page2: {
                      ...doc.page2,
                      mentorNote: {
                        ...doc.page2.mentorNote,
                        greeting: e.target.value,
                      },
                    },
                  })
                }
                className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-1.5"
              />
            </label>
            <label className="block">
              <span className="font-semibold text-zinc-700">Текст записки</span>
              <textarea
                rows={3}
                value={doc.page2.mentorNote.body}
                onChange={(e) =>
                  onChange({
                    ...doc,
                    page2: {
                      ...doc.page2,
                      mentorNote: {
                        ...doc.page2.mentorNote,
                        body: e.target.value,
                      },
                    },
                  })
                }
                className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-1.5"
              />
            </label>
            <label className="block">
              <span className="font-semibold text-zinc-700">Подпись</span>
              <input
                type="text"
                value={doc.page2.mentorNote.signature}
                onChange={(e) =>
                  onChange({
                    ...doc,
                    page2: {
                      ...doc.page2,
                      mentorNote: {
                        ...doc.page2.mentorNote,
                        signature: e.target.value,
                      },
                    },
                  })
                }
                className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-1.5"
              />
            </label>

            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <label className="block">
                <span className="font-semibold text-zinc-700">Шрифт</span>
                <select
                  value={doc.page2.mentorNote.fontStyle}
                  onChange={(e) =>
                    onChange({
                      ...doc,
                      page2: {
                        ...doc.page2,
                        mentorNote: {
                          ...doc.page2.mentorNote,
                          fontStyle: e.target.value as 'handwriting' | 'sans',
                        },
                      },
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-zinc-200 px-2 py-1.5 bg-white"
                >
                  <option value="handwriting">Рукописный</option>
                  <option value="sans">Печатный</option>
                </select>
              </label>

              <label className="block">
                <span className="font-semibold text-zinc-700">
                  Размер ({doc.page2.mentorNote.fontSize}px)
                </span>
                <input
                  type="range"
                  min="15"
                  max="24"
                  value={doc.page2.mentorNote.fontSize}
                  onChange={(e) =>
                    onChange({
                      ...doc,
                      page2: {
                        ...doc.page2,
                        mentorNote: {
                          ...doc.page2.mentorNote,
                          fontSize: Number(e.target.value),
                        },
                      },
                    })
                  }
                  className="mt-2.5 w-full accent-[#0D9488]"
                />
              </label>
            </div>

            <label className="block">
              <div className="flex justify-between mb-1">
                <span className="font-semibold text-zinc-700">Наклон листа</span>
                <span className="font-mono">{doc.page2.mentorNote.tiltDeg}°</span>
              </div>
              <input
                type="range"
                min="-3"
                max="3"
                step="0.2"
                value={doc.page2.mentorNote.tiltDeg}
                onChange={(e) =>
                  onChange({
                    ...doc,
                    page2: {
                      ...doc.page2,
                      mentorNote: {
                        ...doc.page2.mentorNote,
                        tiltDeg: Number(e.target.value),
                      },
                    },
                  })
                }
                className="w-full accent-[#0D9488]"
              />
            </label>

            <div className="flex items-center justify-between gap-2 pt-1">
              <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 font-medium cursor-pointer hover:bg-zinc-50">
                <Upload className="w-3.5 h-3.5" />
                <span>Фото наставника</span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={(e) =>
                    handleUpload(e.target.files?.[0], (url) =>
                      onChange({
                        ...doc,
                        page2: {
                          ...doc.page2,
                          mentorNote: {
                            ...doc.page2.mentorNote,
                            mentorPhotoUrl: url,
                          },
                        },
                      })
                    )
                  }
                />
              </label>
              {doc.page2.mentorNote.mentorPhotoUrl && (
                <button
                  type="button"
                  onClick={() =>
                    onChange({
                      ...doc,
                      page2: {
                        ...doc.page2,
                        mentorNote: {
                          ...doc.page2.mentorNote,
                          mentorPhotoUrl: undefined,
                        },
                      },
                    })
                  }
                  className="text-red-600 hover:underline"
                >
                  Удалить фото
                </button>
              )}
            </div>
          </div>
        )}

        {/* PAGE 2: NEXT CHAPTER */}
        {target.page === 2 && target.block === 'nextChapter' && (
          <div className="space-y-3">
            <label className="block">
              <span className="font-semibold text-zinc-700">Заголовок блока</span>
              <input
                type="text"
                value={doc.page2.nextChapter.title}
                onChange={(e) =>
                  onChange({
                    ...doc,
                    page2: {
                      ...doc.page2,
                      nextChapter: {
                        ...doc.page2.nextChapter,
                        title: e.target.value,
                      },
                    },
                  })
                }
                className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-1.5 font-semibold"
              />
            </label>
            <label className="block">
              <span className="font-semibold text-zinc-700">Описание</span>
              <input
                type="text"
                value={doc.page2.nextChapter.description}
                onChange={(e) =>
                  onChange({
                    ...doc,
                    page2: {
                      ...doc.page2,
                      nextChapter: {
                        ...doc.page2.nextChapter,
                        description: e.target.value,
                      },
                    },
                  })
                }
                className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-1.5"
              />
            </label>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {NEXT_TOPIC_LIBRARY.map((t) => {
                const exists = doc.page2.nextChapter.topics.some(
                  (nt) => nt.title === t.title
                );
                return (
                  <button
                    key={t.title}
                    type="button"
                    onClick={() => {
                      if (exists) {
                        onChange({
                          ...doc,
                          page2: {
                            ...doc.page2,
                            nextChapter: {
                              ...doc.page2.nextChapter,
                              topics: doc.page2.nextChapter.topics.filter(
                                (nt) => nt.title !== t.title
                              ),
                            },
                          },
                        });
                      } else if (doc.page2.nextChapter.topics.length < 3) {
                        onChange({
                          ...doc,
                          page2: {
                            ...doc.page2,
                            nextChapter: {
                              ...doc.page2.nextChapter,
                              topics: [
                                ...doc.page2.nextChapter.topics,
                                {
                                  id: `nt-${Date.now()}`,
                                  title: t.title,
                                  iconKey: t.iconKey,
                                },
                              ],
                            },
                          },
                        });
                      }
                    }}
                    className={`px-2.5 py-1 rounded border text-[11px] font-medium ${
                      exists
                        ? 'bg-zinc-900 text-white border-zinc-900'
                        : 'bg-white text-zinc-700 border-zinc-200'
                    }`}
                  >
                    {t.title}
                  </button>
                );
              })}
            </div>

            <label className="flex items-center gap-2 pt-1">
              <span>Бирюзовый фон</span>
              <input
                type="color"
                value={doc.page2.nextChapter.bgColor}
                onChange={(e) =>
                  onChange({
                    ...doc,
                    page2: {
                      ...doc.page2,
                      nextChapter: {
                        ...doc.page2.nextChapter,
                        bgColor: e.target.value,
                      },
                    },
                  })
                }
                className="w-8 h-8 rounded border border-zinc-200 cursor-pointer"
              />
            </label>
          </div>
        )}

        {/* DESIGN MODE TRANSFORM CONTROLS FOR ANY DRAGGABLE CONTAINER BLOCK */}
        {mode === 'design' && currentTransform && transformBlockId && (
          <div className="pt-3 border-t border-zinc-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-zinc-800">
                Положение и размер на холсте
              </span>
              <button
                type="button"
                onClick={() => updateTransform(DEFAULT_TRANSFORM)}
                className="inline-flex items-center gap-1 text-[11px] text-[#0D9488] hover:underline"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Сброс</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <label className="block">
                <span className="text-[11px] text-zinc-600">
                  Сдвиг X ({currentTransform.x}px)
                </span>
                <input
                  type="range"
                  min="-240"
                  max="240"
                  value={currentTransform.x}
                  onChange={(e) =>
                    updateTransform({
                      ...currentTransform,
                      x: Number(e.target.value),
                    })
                  }
                  className="w-full accent-[#0D9488]"
                />
              </label>
              <label className="block">
                <span className="text-[11px] text-zinc-600">
                  Сдвиг Y ({currentTransform.y}px)
                </span>
                <input
                  type="range"
                  min="-280"
                  max="280"
                  value={currentTransform.y}
                  onChange={(e) =>
                    updateTransform({
                      ...currentTransform,
                      y: Number(e.target.value),
                    })
                  }
                  className="w-full accent-[#0D9488]"
                />
              </label>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <label className="block">
                <span className="text-[11px] text-zinc-600">
                  Масштаб ({Math.round(currentTransform.scale * 100)}%)
                </span>
                <input
                  type="range"
                  min="0.75"
                  max="1.25"
                  step="0.02"
                  value={currentTransform.scale}
                  onChange={(e) =>
                    updateTransform({
                      ...currentTransform,
                      scale: Number(e.target.value),
                    })
                  }
                  className="w-full accent-[#0D9488]"
                />
              </label>
              <label className="block">
                <span className="text-[11px] text-zinc-600">
                  Поворот ({currentTransform.rotation}°)
                </span>
                <input
                  type="range"
                  min="-15"
                  max="15"
                  step="0.5"
                  value={currentTransform.rotation}
                  onChange={(e) =>
                    updateTransform({
                      ...currentTransform,
                      rotation: Number(e.target.value),
                    })
                  }
                  className="w-full accent-[#0D9488]"
                />
              </label>
            </div>

            <div className="flex items-center justify-between gap-2 pt-1">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() =>
                    updateTransform({
                      ...currentTransform,
                      zIndex: Math.max(1, currentTransform.zIndex - 1),
                    })
                  }
                  className="px-2 py-1 rounded border border-zinc-200 text-[11px]"
                >
                  Слой ↓
                </button>
                <button
                  type="button"
                  onClick={() =>
                    updateTransform({
                      ...currentTransform,
                      zIndex: currentTransform.zIndex + 1,
                    })
                  }
                  className="px-2 py-1 rounded border border-zinc-200 text-[11px]"
                >
                  Слой ↑
                </button>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() =>
                    updateTransform({
                      ...currentTransform,
                      locked: !currentTransform.locked,
                    })
                  }
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded border text-[11px] ${
                    currentTransform.locked
                      ? 'border-amber-300 bg-amber-50 text-amber-800'
                      : 'border-zinc-200'
                  }`}
                >
                  {currentTransform.locked ? (
                    <Lock className="w-3 h-3" />
                  ) : (
                    <Unlock className="w-3 h-3" />
                  )}
                  <span>{currentTransform.locked ? 'Заблокирован' : 'Блок'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
