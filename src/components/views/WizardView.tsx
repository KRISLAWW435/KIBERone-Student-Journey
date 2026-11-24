import React, { useMemo, useState } from 'react';
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  BookOpen,
  Check,
  Image as ImageIcon,
  Plus,
  Search,
  Sparkles,
  Trash2,
  Upload,
} from 'lucide-react';
import {
  JOURNAL_STATUS_OPTIONS,
  MODULE_CATEGORIES,
  SKILL_MASTERY_OPTIONS,
  UNIFIED_SKILLS_CATALOG,
} from '../../data/curriculumCatalog';
import {
  ASSETS,
  NEXT_TOPIC_LIBRARY,
  STRENGTH_LIBRARY,
} from '../../data/presets';
import {
  AgeCategory,
  ConfirmedResidentSkill,
  JournalDocument,
  LibraryModule,
  MediaAsset,
  MediaCategory,
  ModuleCategoryConfig,
  ModuleIllustrationKey,
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

interface WizardViewProps {
  initialDoc: JournalDocument;
  libraryModules?: LibraryModule[];
  categories?: ModuleCategoryConfig[];
  skillsCatalog?: SkillDefinition[];
  onCancel: () => void;
  onFinish: (doc: JournalDocument) => void;
  onOpenMediaPicker: (
    category: MediaCategory | 'all',
    onSelect: (url: string, asset?: MediaAsset) => void
  ) => void;
}

const STEPS = [
  { id: 0, label: 'Резидент' },
  { id: 1, label: 'Модули' },
  { id: 2, label: 'Навыки' },
  { id: 3, label: 'Результаты' },
  { id: 4, label: 'Достижения' },
  { id: 5, label: 'Наставник' },
  { id: 6, label: 'Оформление' },
] as const;

export function WizardView({
  initialDoc,
  libraryModules = [],
  categories = MODULE_CATEGORIES,
  skillsCatalog = UNIFIED_SKILLS_CATALOG,
  onCancel,
  onFinish,
  onOpenMediaPicker,
}: WizardViewProps) {
  const [step, setStep] = useState(0);
  const [doc, setDoc] = useState<JournalDocument>(initialDoc);
  const [customSkillText, setCustomSkillText] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [libPickerOpen, setLibPickerOpen] = useState(false);
  const [libSearch, setLibSearch] = useState('');
  const [libCategory, setLibCategory] = useState('all');

  const progressPercent = Math.round(((step + 1) / STEPS.length) * 100);

  const handleFileToDataUrl = (file: File, callback: (dataUrl: string) => void) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        callback(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleGenerateMentorNote = async () => {
    setAiLoading(true);
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
          modules: doc.page1.modules.map((m) => m.title),
          skills: doc.page1.skills.map((s) => s.label),
          projects: doc.page1.projects.map((p) => p.title),
          strengths: doc.page2.strengths.map((s) => ({
            title: s.title,
            example: s.example,
          })),
          prideText: doc.page2.prideText,
          observations: doc.page2.mentorNote.observationsDraft,
        }),
      });
      const payload = await res.json();
      if (!res.ok) {
        setAiError(payload.error || 'Не удалось сгенерировать текст.');
        return;
      }
      setDoc((prev) => ({
        ...prev,
        page2: {
          ...prev.page2,
          mentorNote: {
            ...prev.page2.mentorNote,
            greeting: payload.greeting || prev.page2.mentorNote.greeting,
            body: payload.body || prev.page2.mentorNote.body,
            signature: payload.signature || prev.page2.mentorNote.signature,
          },
        },
      }));
    } catch {
      setAiError('Ошибка соединения с сервером генерации текста.');
    } finally {
      setAiLoading(false);
    }
  };

  const moveModule = (index: number, delta: -1 | 1) => {
    const sorted = [...doc.page1.modules].sort((a, b) => a.order - b.order);
    const targetIdx = index + delta;
    if (targetIdx < 0 || targetIdx >= sorted.length) return;
    const temp = sorted[index];
    sorted[index] = sorted[targetIdx];
    sorted[targetIdx] = temp;
    const reordered = sorted.map((m, i) => ({ ...m, order: i + 1 }));
    setDoc({ ...doc, page1: { ...doc.page1, modules: reordered } });
  };

  const sortedModules = [...doc.page1.modules].sort((a, b) => a.order - b.order);

  const confirmedList: ConfirmedResidentSkill[] = useMemo(() => {
    if (doc.page1.confirmedSkills) return doc.page1.confirmedSkills;
    return doc.page1.skills.map((s) => ({
      id: s.id,
      skillId: s.skillId,
      label: s.label,
      bgColor: s.bgColor,
      status: s.status ?? 'independent',
      confirmedAt: doc.updatedAt || doc.createdAt,
    }));
  }, [doc.page1.confirmedSkills, doc.page1.skills, doc.updatedAt, doc.createdAt]);

  const syncConfirmedSkills = (nextConfirmed: ConfirmedResidentSkill[]) => {
    setDoc((prev) => ({
      ...prev,
      page1: {
        ...prev.page1,
        confirmedSkills: nextConfirmed,
        skills: nextConfirmed.map((c) => ({
          id: c.id,
          skillId: c.skillId,
          label: c.label,
          bgColor: c.bgColor,
          status: c.status,
        })),
      },
    }));
  };

  const suggestedSkillCandidates = useMemo(() => {
    const rawIds = new Set<string>(doc.page1.suggestedSkillsPool ?? []);
    doc.page1.modules.forEach((m) => {
      (m.suggestedSkills ?? []).forEach((sid) => rawIds.add(sid));
      if (m.libraryModuleId) {
        const lib = libraryModules.find((l) => l.id === m.libraryModuleId);
        lib?.suggestedSkills.forEach((sid) => rawIds.add(sid));
      }
    });
    const confirmedIds = new Set(confirmedList.map((c) => c.skillId).filter(Boolean));
    const confirmedLabels = new Set(
      confirmedList.map((c) => c.label.trim().toLowerCase())
    );
    return Array.from(rawIds)
      .map((sid) => skillsCatalog.find((s) => s.id === sid))
      .filter(
        (def): def is SkillDefinition =>
          Boolean(def) &&
          !confirmedIds.has(def!.id) &&
          !confirmedLabels.has(def!.label.trim().toLowerCase())
      );
  }, [doc.page1.suggestedSkillsPool, doc.page1.modules, libraryModules, confirmedList, skillsCatalog]);

  const filteredLibraryModules = useMemo(() => {
    const q = libSearch.trim().toLowerCase();
    return libraryModules.filter((m) => {
      if (m.isActive === false) return false;
      const matchCat =
        libCategory === 'all' ||
        m.category === libCategory ||
        Boolean(m.filterCategories?.includes(libCategory));
      if (!matchCat) return false;
      if (!q) return true;
      return (
        m.displayTitle.toLowerCase().includes(q) ||
        m.officialTitle.toLowerCase().includes(q) ||
        (m.code || '').toLowerCase().includes(q) ||
        m.subtitle.toLowerCase().includes(q)
      );
    });
  }, [libraryModules, libSearch, libCategory]);

  const handleAddLibraryModule = (lib: LibraryModule) => {
    const nextSuggestedPool = Array.from(
      new Set([...(doc.page1.suggestedSkillsPool ?? []), ...lib.suggestedSkills])
    );
    setDoc({
      ...doc,
      page1: {
        ...doc.page1,
        showModules: true,
        suggestedSkillsPool: nextSuggestedPool,
        modules: [
          ...doc.page1.modules,
          {
            id: `mod-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            libraryModuleId: lib.id,
            code: lib.code,
            officialTitle: lib.officialTitle || lib.title,
            title: lib.displayTitle || lib.title,
            subtitle: lib.subtitle,
            description: lib.description,
            category: lib.category,
            illustrationKey: lib.illustrationKey,
            iconKey: lib.iconKey,
            visualMode: lib.visualMode || (lib.customImageUrl ? 'image' : 'illustration'),
            imageMediaId: lib.imageMediaId ?? null,
            customImageUrl: lib.customImageUrl,
            cardBgColor: lib.cardBgColor,
            layoutVariant: 'classic',
            size: 'normal',
            order: doc.page1.modules.length + 1,
            suggestedSkills: [...lib.suggestedSkills],
          },
        ],
      },
    });
  };

  return (
    <div className="min-h-screen bg-[#F6F6F3] text-[#18181B] flex flex-col">
      {/* TOP BAR */}
      <header className="h-16 bg-white border-b border-zinc-200 px-8 flex items-center justify-between gap-6 sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>К списку</span>
          </button>
          <span className="text-sm font-bold text-zinc-900">
            Создание журнала · {doc.resident.fullName}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-zinc-500 tabular-nums">
            Шаг {step + 1} из {STEPS.length} ({progressPercent}%)
          </span>
          <button
            type="button"
            onClick={() => onFinish(doc)}
            className="px-4 py-2 rounded-lg bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-semibold transition-colors"
          >
            Перейти в редактор
          </button>
        </div>
      </header>

      {/* HORIZONTAL STEPPER & PROGRESS BAR */}
      <div className="bg-white border-b border-zinc-200 px-8 py-3">
        <div className="max-w-4xl mx-auto space-y-2.5">
          <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#0D9488] transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <nav className="flex items-center justify-between gap-2 overflow-x-auto pb-1">
            {STEPS.map((s, idx) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setStep(idx)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  step === idx
                    ? 'bg-zinc-900 text-white'
                    : idx < step
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'
                }`}
              >
                <span className="font-mono text-[11px]">{idx + 1}.</span>
                <span>{s.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* STEP CONTENT */}
      <main className="flex-1 px-6 py-8">
        <div className="max-w-3xl mx-auto bg-white border border-zinc-200 rounded-2xl shadow-sm p-8 space-y-6">
          {/* STEP 0: RESIDENT */}
          {step === 0 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-bold text-zinc-900">
                  Данные резидента
                </h2>
                <p className="text-xs text-zinc-500 mt-1">
                  Основная информация для обложки и заголовка первой страницы.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-xs font-semibold text-zinc-700">
                    Имя и фамилия резидента
                  </span>
                  <input
                    type="text"
                    value={doc.resident.fullName}
                    onChange={(e) =>
                      setDoc({
                        ...doc,
                        resident: { ...doc.resident, fullName: e.target.value },
                      })
                    }
                    className="mt-1.5 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:border-[#0D9488] focus:outline-none"
                  />
                </label>

                <label className="block">
                  <span className="text-xs font-semibold text-zinc-700">
                    Возраст
                  </span>
                  <input
                    type="text"
                    value={doc.resident.age}
                    onChange={(e) =>
                      setDoc({
                        ...doc,
                        resident: { ...doc.resident, age: e.target.value },
                      })
                    }
                    placeholder="11 лет"
                    className="mt-1.5 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:border-[#0D9488] focus:outline-none"
                  />
                </label>

                <label className="block">
                  <span className="text-xs font-semibold text-zinc-700">
                    Возрастная категория (адаптация стиля)
                  </span>
                  <select
                    value={doc.resident.ageCategory}
                    onChange={(e) =>
                      setDoc({
                        ...doc,
                        resident: {
                          ...doc.resident,
                          ageCategory: e.target.value as AgeCategory,
                        },
                      })
                    }
                    className="mt-1.5 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm bg-white focus:border-[#0D9488] focus:outline-none"
                  >
                    <option value="8-10">8–10 лет (игровой и яркий)</option>
                    <option value="11-13">11–13 лет (баланс иллюстраций и техно)</option>
                    <option value="14-15">14–15 лет (строгий и технологичный)</option>
                  </select>
                </label>

                <label className="block">
                  <span className="text-xs font-semibold text-zinc-700">
                    Отчётный период
                  </span>
                  <input
                    type="text"
                    value={doc.resident.period}
                    onChange={(e) =>
                      setDoc({
                        ...doc,
                        resident: { ...doc.resident, period: e.target.value },
                      })
                    }
                    placeholder="III квартал 2026"
                    className="mt-1.5 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:border-[#0D9488] focus:outline-none"
                  />
                </label>

                <label className="block">
                  <span className="text-xs font-semibold text-zinc-700">
                    Имя наставника
                  </span>
                  <input
                    type="text"
                    value={doc.resident.mentorName}
                    onChange={(e) =>
                      setDoc({
                        ...doc,
                        resident: { ...doc.resident, mentorName: e.target.value },
                      })
                    }
                    className="mt-1.5 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:border-[#0D9488] focus:outline-none"
                  />
                </label>

                <label className="block">
                  <span className="text-xs font-semibold text-zinc-700">
                    Филиал (необязательно)
                  </span>
                  <input
                    type="text"
                    value={doc.resident.branch}
                    onChange={(e) =>
                      setDoc({
                        ...doc,
                        resident: { ...doc.resident, branch: e.target.value },
                      })
                    }
                    placeholder="Например: Центральный кампус"
                    className="mt-1.5 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:border-[#0D9488] focus:outline-none"
                  />
                </label>
              </div>
            </div>
          )}

          {/* STEP 1: MODULES */}
          {step === 1 && (
            <div className="space-y-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-zinc-900">
                    Мои открытия (учебные модули)
                  </h2>
                  <p className="text-xs text-zinc-500 mt-1">
                    Добавляйте модули, выбирайте цвет карточки и меняйте порядок отображения.
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {libraryModules.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setLibPickerOpen((v) => !v)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#0D9488] text-[#0F766E] bg-[#F0FDFA] text-xs font-semibold hover:bg-[#CCFBF1]/60"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Из программы KIBERone</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() =>
                      setDoc({
                        ...doc,
                        page1: {
                          ...doc.page1,
                          modules: [
                            ...doc.page1.modules,
                            {
                              id: `mod-${Date.now()}`,
                              title: 'Новый модуль',
                              subtitle: 'Направление',
                              description: 'Краткое описание освоенной темы.',
                              illustrationKey: 'web',
                              cardBgColor: '#DBEAFE',
                              size: 'normal',
                              order: doc.page1.modules.length + 1,
                            },
                          ],
                        },
                      })
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-zinc-900 text-white text-xs font-semibold hover:bg-zinc-800 shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Пустой модуль</span>
                  </button>
                </div>
              </div>

              {libPickerOpen && (
                <div className="p-3.5 rounded-xl border border-zinc-200 bg-[#F9F9F7] space-y-2.5">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-1">
                      <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={libSearch}
                        onChange={(e) => setLibSearch(e.target.value)}
                        placeholder="Поиск модуля..."
                        className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-zinc-200 bg-white text-xs"
                      />
                    </div>
                    <select
                      value={libCategory}
                      onChange={(e) => setLibCategory(e.target.value)}
                      className="rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs"
                    >
                      <option value="all">Все категории</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.shortName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-52 overflow-y-auto">
                    {filteredLibraryModules.map((lib) => (
                      <button
                        key={lib.id}
                        type="button"
                        onClick={() => handleAddLibraryModule(lib)}
                        className="text-left px-3 py-2 rounded-lg border border-zinc-200 bg-white hover:border-[#0D9488] flex items-center justify-between gap-2"
                      >
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-zinc-900 truncate">
                            {lib.code ? `${lib.code} · ` : ''}
                            {lib.displayTitle || lib.title}
                          </div>
                          <div className="text-[11px] text-zinc-500 truncate">
                            {lib.subtitle}
                          </div>
                        </div>
                        <Plus className="w-3.5 h-3.5 text-[#0D9488] shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {sortedModules.map((mod, idx) => (
                  <div
                    key={mod.id}
                    className="p-4 rounded-xl border border-zinc-200 bg-[#F9F9F7] space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-mono font-semibold text-zinc-500">
                          #{idx + 1}
                        </span>
                        <select
                          value={
                            mod.visualMode ??
                            (mod.customImageUrl || mod.imageMediaId
                              ? 'image'
                              : 'illustration')
                          }
                          onChange={(e) =>
                            setDoc({
                              ...doc,
                              page1: {
                                ...doc.page1,
                                modules: doc.page1.modules.map((m) =>
                                  m.id === mod.id
                                    ? {
                                        ...m,
                                        visualMode: e.target.value as ModuleVisualMode,
                                      }
                                    : m
                                ),
                              },
                            })
                          }
                          className="rounded-lg border border-zinc-200 bg-white px-2 py-1 text-xs"
                        >
                          <option value="illustration">SVG-иллюстрация</option>
                          <option value="icon">Большая иконка</option>
                          <option value="image">Картинка</option>
                        </select>
                        {(mod.visualMode ?? 'illustration') === 'icon' ? (
                          <select
                            value={mod.iconKey ?? 'blocks'}
                            onChange={(e) =>
                              setDoc({
                                ...doc,
                                page1: {
                                  ...doc.page1,
                                  modules: doc.page1.modules.map((m) =>
                                    m.id === mod.id
                                      ? {
                                          ...m,
                                          iconKey: e.target.value as ModuleLucideIconKey,
                                        }
                                      : m
                                  ),
                                },
                              })
                            }
                            className="rounded-lg border border-zinc-200 bg-white px-2.5 py-1 text-xs"
                          >
                            {MODULE_LUCIDE_ICON_OPTIONS.map((t) => (
                              <option key={t.key} value={t.key}>
                                {t.label}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <select
                            value={mod.illustrationKey}
                            onChange={(e) => {
                              const nextTheme = e.target.value as ModuleIllustrationKey;
                              const found = MODULE_ILLUSTRATION_OPTIONS.find(
                                (t) => t.key === nextTheme
                              );
                              setDoc({
                                ...doc,
                                page1: {
                                  ...doc.page1,
                                  modules: doc.page1.modules.map((m) =>
                                    m.id === mod.id
                                      ? {
                                          ...m,
                                          visualMode: 'illustration',
                                          illustrationKey: nextTheme,
                                          cardBgColor: found?.defaultColor || m.cardBgColor,
                                        }
                                      : m
                                  ),
                                },
                              });
                            }}
                            className="rounded-lg border border-zinc-200 bg-white px-2.5 py-1 text-xs"
                          >
                            {MODULE_ILLUSTRATION_OPTIONS.map((t) => (
                              <option key={t.key} value={t.key}>
                                {t.label}
                              </option>
                            ))}
                          </select>
                        )}
                        <input
                          type="color"
                          value={mod.cardBgColor}
                          onChange={(e) =>
                            setDoc({
                              ...doc,
                              page1: {
                                ...doc.page1,
                                modules: doc.page1.modules.map((m) =>
                                  m.id === mod.id
                                    ? { ...m, cardBgColor: e.target.value }
                                    : m
                                ),
                              },
                            })
                          }
                          title="Цвет фона иллюстрации"
                          className="w-7 h-7 rounded border border-zinc-200 cursor-pointer"
                        />
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => moveModule(idx, -1)}
                          disabled={idx === 0}
                          className="p-1.5 rounded border border-zinc-200 bg-white text-zinc-600 disabled:opacity-40"
                          title="Переместить выше"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveModule(idx, 1)}
                          disabled={idx === sortedModules.length - 1}
                          className="p-1.5 rounded border border-zinc-200 bg-white text-zinc-600 disabled:opacity-40"
                          title="Переместить ниже"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        {doc.page1.modules.length > 1 && (
                          <button
                            type="button"
                            onClick={() =>
                              setDoc({
                                ...doc,
                                page1: {
                                  ...doc.page1,
                                  modules: doc.page1.modules.filter(
                                    (m) => m.id !== mod.id
                                  ),
                                },
                              })
                            }
                            className="p-1.5 rounded text-zinc-400 hover:text-red-600"
                            title="Удалить модуль"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={mod.title}
                        onChange={(e) =>
                          setDoc({
                            ...doc,
                            page1: {
                              ...doc.page1,
                              modules: doc.page1.modules.map((m) =>
                                m.id === mod.id ? { ...m, title: e.target.value } : m
                              ),
                            },
                          })
                        }
                        placeholder="Название модуля"
                        className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold"
                      />
                      <input
                        type="text"
                        value={mod.subtitle}
                        onChange={(e) =>
                          setDoc({
                            ...doc,
                            page1: {
                              ...doc.page1,
                              modules: doc.page1.modules.map((m) =>
                                m.id === mod.id ? { ...m, subtitle: e.target.value } : m
                              ),
                            },
                          })
                        }
                        placeholder="Подзаголовок"
                        className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs"
                      />
                    </div>
                    <textarea
                      rows={2}
                      value={mod.description}
                      onChange={(e) =>
                        setDoc({
                          ...doc,
                          page1: {
                            ...doc.page1,
                            modules: doc.page1.modules.map((m) =>
                              m.id === mod.id
                                ? { ...m, description: e.target.value }
                                : m
                            ),
                          },
                        })
                      }
                      className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: SKILLS */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-bold text-zinc-900">
                  Чему я научился
                </h2>
                <p className="text-xs text-zinc-500 mt-1">
                  Подтвердите навыки из выбранных модулей или добавьте из единого справочника KIBERone. На странице печатаются только подтверждённые навыки.
                </p>
              </div>

              {suggestedSkillCandidates.length > 0 && (
                <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 space-y-2">
                  <div className="text-xs font-bold text-amber-900">
                    Рекомендовано модулями (нажмите, чтобы подтвердить):
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {suggestedSkillCandidates.map((def) => (
                      <button
                        key={def.id}
                        type="button"
                        onClick={() =>
                          syncConfirmedSkills([
                            ...confirmedList,
                            {
                              id: `skill-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
                              skillId: def.id,
                              label: def.label,
                              bgColor: def.defaultColor,
                              status: 'independent',
                              confirmedAt: new Date().toISOString(),
                            },
                          ])
                        }
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-amber-300 bg-white hover:bg-emerald-50 text-xs font-medium text-zinc-800"
                      >
                        <Plus className="w-3 h-3 text-[#0D9488]" />
                        <span>{def.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {confirmedList.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-zinc-700">
                    Подтверждённые навыки резидента ({confirmedList.length}):
                  </div>
                  <div className="space-y-2">
                    {confirmedList.map((sk) => (
                      <div
                        key={sk.id}
                        className="flex flex-wrap items-center gap-2 p-2.5 rounded-xl bg-[#F9F9F7] border border-zinc-200"
                      >
                        <span
                          style={{ backgroundColor: sk.bgColor }}
                          className="px-2.5 py-1 rounded-md text-xs font-semibold text-zinc-900"
                        >
                          {sk.label}
                        </span>
                        <select
                          value={sk.status}
                          onChange={(e) =>
                            syncConfirmedSkills(
                              confirmedList.map((c) =>
                                c.id === sk.id
                                  ? {
                                      ...c,
                                      status: e.target.value as SkillMasteryStatus,
                                    }
                                  : c
                              )
                            )
                          }
                          className="ml-auto rounded-lg border border-zinc-200 bg-white px-2.5 py-1 text-xs"
                        >
                          {SKILL_MASTERY_OPTIONS.map((opt) => (
                            <option key={opt.id} value={opt.id}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() =>
                            syncConfirmedSkills(
                              confirmedList.filter((c) => c.id !== sk.id)
                            )
                          }
                          className="p-1 text-zinc-400 hover:text-red-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <div className="text-xs font-semibold text-zinc-700">
                  Единый справочник навыков KIBERone
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto p-2 rounded-xl border border-zinc-200 bg-[#F9F9F7]">
                  {skillsCatalog.map((lib) => {
                    const exists = confirmedList.some(
                      (s) =>
                        s.skillId === lib.id ||
                        s.label.toLowerCase() === lib.label.toLowerCase()
                    );
                    return (
                      <button
                        key={lib.id}
                        type="button"
                        onClick={() => {
                          if (exists) {
                            syncConfirmedSkills(
                              confirmedList.filter(
                                (s) =>
                                  s.skillId !== lib.id &&
                                  s.label.toLowerCase() !== lib.label.toLowerCase()
                              )
                            );
                          } else {
                            syncConfirmedSkills([
                              ...confirmedList,
                              {
                                id: `skill-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
                                skillId: lib.id,
                                label: lib.label,
                                bgColor: lib.defaultColor,
                                status: 'independent',
                                confirmedAt: new Date().toISOString(),
                              },
                            ]);
                          }
                        }}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium transition-colors ${
                          exists
                            ? 'bg-zinc-900 text-white border-zinc-900'
                            : 'bg-white text-zinc-700 border-zinc-200 hover:border-zinc-400'
                        }`}
                      >
                        {exists && <Check className="w-3 h-3" />}
                        <span>{lib.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Add custom skill */}
              <div className="flex gap-2 pt-2">
                <input
                  type="text"
                  value={customSkillText}
                  onChange={(e) => setCustomSkillText(e.target.value)}
                  placeholder="Добавить собственный подтверждённый навык..."
                  className="flex-1 rounded-lg border border-zinc-200 px-3 py-2 text-xs"
                />
                <button
                  type="button"
                  onClick={() => {
                    const label = customSkillText.trim();
                    if (!label) return;
                    const colors = ['#FF8A75', '#48C9D8', '#FFE047', '#C4B5FD'];
                    syncConfirmedSkills([
                      ...confirmedList,
                      {
                        id: `skill-${Date.now()}`,
                        label,
                        bgColor: colors[confirmedList.length % colors.length],
                        status: 'independent',
                        confirmedAt: new Date().toISOString(),
                      },
                    ]);
                    setCustomSkillText('');
                  }}
                  className="px-4 py-2 rounded-lg bg-[#0D9488] text-white text-xs font-semibold hover:bg-[#0F766E]"
                >
                  Добавить
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: PROJECTS */}
          {step === 3 && (
            <div className="space-y-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-zinc-900">
                    Мои результаты (минимум 3 карточки)
                  </h2>
                  <p className="text-xs text-zinc-500 mt-1">
                    Прикрепите скриншоты работ резидента или выберите тематическую иллюстрацию.
                  </p>
                </div>
                {doc.page1.projects.length < 4 && (
                  <button
                    type="button"
                    onClick={() =>
                      setDoc({
                        ...doc,
                        page1: {
                          ...doc.page1,
                          projects: [
                            ...doc.page1.projects,
                            {
                              id: `proj-${Date.now()}`,
                              title: 'Новый проект',
                              caption: 'Краткая подпись',
                              description: '',
                              fallbackTheme: 'web',
                              isRealScreenshot: false,
                            },
                          ],
                        },
                      })
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-zinc-900 text-white text-xs font-semibold shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Добавить проект</span>
                  </button>
                )}
              </div>

              <div className="space-y-3">
                {doc.page1.projects.map((proj, idx) => (
                  <div
                    key={proj.id}
                    className="p-4 rounded-xl border border-zinc-200 bg-[#F9F9F7] space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-zinc-700">
                        Карточка #{idx + 1}
                      </span>
                      {doc.page1.projects.length > 3 && (
                        <button
                          type="button"
                          onClick={() =>
                            setDoc({
                              ...doc,
                              page1: {
                                ...doc.page1,
                                projects: doc.page1.projects.filter(
                                  (p) => p.id !== proj.id
                                ),
                              },
                            })
                          }
                          className="text-xs text-red-600 hover:underline"
                        >
                          Удалить
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={proj.title}
                        onChange={(e) =>
                          setDoc({
                            ...doc,
                            page1: {
                              ...doc.page1,
                              projects: doc.page1.projects.map((p) =>
                                p.id === proj.id ? { ...p, title: e.target.value } : p
                              ),
                            },
                          })
                        }
                        placeholder="Название проекта"
                        className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold"
                      />
                      <input
                        type="text"
                        value={proj.caption}
                        onChange={(e) =>
                          setDoc({
                            ...doc,
                            page1: {
                              ...doc.page1,
                              projects: doc.page1.projects.map((p) =>
                                p.id === proj.id ? { ...p, caption: e.target.value } : p
                              ),
                            },
                          })
                        }
                        placeholder="Подпись"
                        className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs"
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 bg-white text-xs font-medium cursor-pointer hover:bg-zinc-50">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Загрузить скриншот</span>
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          className="hidden"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) {
                              handleFileToDataUrl(f, (url) =>
                                setDoc({
                                  ...doc,
                                  page1: {
                                    ...doc.page1,
                                    projects: doc.page1.projects.map((p) =>
                                      p.id === proj.id
                                        ? {
                                            ...p,
                                            imageUrl: url,
                                            isRealScreenshot: true,
                                          }
                                        : p
                                    ),
                                  },
                                })
                              );
                            }
                          }}
                        />
                      </label>

                      <button
                        type="button"
                        onClick={() =>
                          onOpenMediaPicker('projects', (url) =>
                            setDoc({
                              ...doc,
                              page1: {
                                ...doc.page1,
                                projects: doc.page1.projects.map((p) =>
                                  p.id === proj.id
                                    ? { ...p, imageUrl: url, isRealScreenshot: true }
                                    : p
                                ),
                              },
                            })
                          )
                        }
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 bg-white text-xs font-medium hover:bg-zinc-50"
                      >
                        <ImageIcon className="w-3.5 h-3.5" />
                        <span>Из медиатеки</span>
                      </button>

                      <select
                        value={proj.fallbackTheme}
                        onChange={(e) =>
                          setDoc({
                            ...doc,
                            page1: {
                              ...doc.page1,
                              projects: doc.page1.projects.map((p) =>
                                p.id === proj.id
                                  ? {
                                      ...p,
                                      fallbackTheme: e.target
                                        .value as ProjectItem['fallbackTheme'],
                                      imageUrl: undefined,
                                      isRealScreenshot: false,
                                    }
                                  : p
                              ),
                            },
                          })
                        }
                        className="rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs"
                      >
                        <option value="minecraft">Иллюстрация: 3D-игра</option>
                        <option value="animation">Иллюстрация: Анимация</option>
                        <option value="web">Иллюстрация: Цифровой проект</option>
                        <option value="python">Иллюстрация: Код Python</option>
                        <option value="game3d">Иллюстрация: 3D-сцена</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4: ACHIEVEMENTS & STRENGTHS */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-zinc-900">
                  Сильные стороны и момент гордости
                </h2>
                <p className="text-xs text-zinc-500 mt-1">
                  Выберите качества резидента и добавьте короткие наблюдения наставника.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {STRENGTH_LIBRARY.map((lib) => {
                  const active = doc.page2.strengths.some(
                    (s) => s.title === lib.title
                  );
                  return (
                    <button
                      key={lib.title}
                      type="button"
                      onClick={() => {
                        if (active) {
                          setDoc({
                            ...doc,
                            page2: {
                              ...doc.page2,
                              strengths: doc.page2.strengths.filter(
                                (s) => s.title !== lib.title
                              ),
                            },
                          });
                        } else {
                          setDoc({
                            ...doc,
                            page2: {
                              ...doc.page2,
                              strengths: [
                                ...doc.page2.strengths,
                                {
                                  id: `str-${Date.now()}-${Math.random()}`,
                                  title: lib.title,
                                  example: lib.defaultExample,
                                  iconKey: lib.iconKey,
                                  bgColor: lib.bgColor,
                                },
                              ],
                            },
                          });
                        }
                      }}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium ${
                        active
                          ? 'bg-zinc-900 text-white border-zinc-900'
                          : 'bg-white text-zinc-700 border-zinc-200'
                      }`}
                    >
                      {active && <Check className="w-3 h-3" />}
                      <span>{lib.title}</span>
                    </button>
                  );
                })}
              </div>

              <div className="space-y-2">
                {doc.page2.strengths.map((str) => (
                  <div
                    key={str.id}
                    className="flex items-center gap-3 p-2.5 rounded-lg bg-[#F9F9F7] border border-zinc-200"
                  >
                    <span className="text-xs font-bold text-zinc-900 w-44 shrink-0">
                      {str.title}
                    </span>
                    <input
                      type="text"
                      value={str.example}
                      onChange={(e) =>
                        setDoc({
                          ...doc,
                          page2: {
                            ...doc.page2,
                            strengths: doc.page2.strengths.map((s) =>
                              s.id === str.id ? { ...s, example: e.target.value } : s
                            ),
                          },
                        })
                      }
                      placeholder="Короткий пример из наблюдений..."
                      className="flex-1 rounded border border-zinc-200 bg-white px-2.5 py-1.5 text-xs"
                    />
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-zinc-200 space-y-2">
                <label className="block">
                  <span className="text-xs font-bold text-zinc-900">
                    А вот чем ты можешь гордиться! (конкретное достижение)
                  </span>
                  <textarea
                    rows={3}
                    value={doc.page2.prideText}
                    onChange={(e) =>
                      setDoc({
                        ...doc,
                        page2: { ...doc.page2, prideText: e.target.value },
                      })
                    }
                    placeholder="Опишите конкретную задачу, проект или ситуацию самостоятельности..."
                    className="mt-1.5 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:border-[#0D9488] focus:outline-none"
                  />
                </label>
              </div>
            </div>
          )}

          {/* STEP 5: MENTOR NOTE + NEXT CHAPTER */}
          {step === 5 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-zinc-900">
                  Слово наставника и следующая глава
                </h2>
                <p className="text-xs text-zinc-500 mt-1">
                  Напишите обращение вручную или преобразуйте наблюдения в живой текст с помощью нейросети.
                </p>
              </div>

              {/* AI Observation Box */}
              <div className="p-4 rounded-xl bg-[#F0FDFA] border border-[#99F6E4] space-y-3">
                <label className="block">
                  <span className="text-xs font-semibold text-zinc-800">
                    Наблюдения наставника (факты для AI-помощника)
                  </span>
                  <textarea
                    rows={2}
                    value={doc.page2.mentorNote.observationsDraft}
                    onChange={(e) =>
                      setDoc({
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
                    placeholder="Например: сам нашёл ошибку в цикле, активно помогал группе, увлёкся 3D-графикой..."
                    className="mt-1.5 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs"
                  />
                </label>

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <button
                    type="button"
                    disabled={aiLoading}
                    onClick={handleGenerateMentorNote}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-semibold transition-colors disabled:opacity-60"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>
                      {aiLoading
                        ? 'Генерация текста...'
                        : 'Сформировать обращение по фактам'}
                    </span>
                  </button>
                  <span className="text-[11px] text-zinc-600">
                    Нейросеть использует только указанные модули и наблюдения
                  </span>
                </div>

                {aiError && (
                  <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
                    {aiError}
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <input
                  type="text"
                  value={doc.page2.mentorNote.greeting}
                  onChange={(e) =>
                    setDoc({
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
                  placeholder="Персональное обращение"
                  className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm font-medium"
                />
                <textarea
                  rows={3}
                  value={doc.page2.mentorNote.body}
                  onChange={(e) =>
                    setDoc({
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
                  placeholder="Текст личной записки..."
                  className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                  <input
                    type="text"
                    value={doc.page2.mentorNote.signature}
                    onChange={(e) =>
                      setDoc({
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
                    placeholder="Подпись наставника"
                    className="rounded-lg border border-zinc-200 px-3 py-2 text-sm"
                  />
                  <label className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-zinc-200 text-xs font-medium cursor-pointer hover:bg-zinc-50">
                    <Upload className="w-3.5 h-3.5" />
                    <span>
                      {doc.page2.mentorNote.mentorPhotoUrl
                        ? 'Заменить фото наставника'
                        : 'Фото наставника (опционально)'}
                    </span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) {
                          handleFileToDataUrl(f, (url) =>
                            setDoc({
                              ...doc,
                              page2: {
                                ...doc.page2,
                                mentorNote: {
                                  ...doc.page2.mentorNote,
                                  mentorPhotoUrl: url,
                                },
                              },
                            })
                          );
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              {/* Next Chapter */}
              <div className="pt-4 border-t border-zinc-200 space-y-3">
                <h3 className="text-sm font-bold text-zinc-900">
                  Следующая глава: «Что интересного впереди?»
                </h3>
                <input
                  type="text"
                  value={doc.page2.nextChapter.description}
                  onChange={(e) =>
                    setDoc({
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
                  className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-xs"
                />
                <div className="flex flex-wrap gap-2">
                  {NEXT_TOPIC_LIBRARY.map((t) => {
                    const active = doc.page2.nextChapter.topics.some(
                      (nt) => nt.title === t.title
                    );
                    return (
                      <button
                        key={t.title}
                        type="button"
                        onClick={() => {
                          if (active) {
                            setDoc({
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
                            setDoc({
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
                        className={`px-3 py-1.5 rounded-lg border text-xs font-medium ${
                          active
                            ? 'bg-zinc-900 text-white border-zinc-900'
                            : 'bg-white text-zinc-700 border-zinc-200'
                        }`}
                      >
                        {t.title}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: STYLING & BEAR */}
          {step === 6 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-zinc-900">
                  Оформление и выбор персонажей
                </h2>
                <p className="text-xs text-zinc-500 mt-1">
                  Настройте позы фирменного медведя и статус выпуска перед открытием визуального редактора.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-zinc-200 space-y-3">
                  <div className="text-xs font-bold text-zinc-900">
                    Медведь на обложке (Стр. 1)
                  </div>
                  <div className="h-32 bg-[#F6F6F3] rounded-lg flex items-center justify-center p-2">
                    <img
                      src={doc.page1.bearImageUrl}
                      alt="Медведь на обложке"
                      className="max-h-full object-contain"
                    />
                  </div>
                  <div className="flex gap-2">
                    {[
                      { label: 'С планшетом', url: ASSETS.bearTablet },
                      { label: 'Приветствие', url: ASSETS.bearWelcome },
                    ].map((pose) => (
                      <button
                        key={pose.label}
                        type="button"
                        onClick={() =>
                          setDoc({
                            ...doc,
                            page1: { ...doc.page1, bearImageUrl: pose.url },
                          })
                        }
                        className={`flex-1 py-1.5 px-2 rounded-lg border text-xs font-medium ${
                          doc.page1.bearImageUrl === pose.url
                            ? 'bg-zinc-900 text-white border-zinc-900'
                            : 'bg-white text-zinc-700 border-zinc-200'
                        }`}
                      >
                        {pose.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-zinc-200 space-y-3">
                  <div className="text-xs font-bold text-zinc-900">
                    Медведь в блоке гордости (Стр. 2)
                  </div>
                  <div className="h-32 bg-[#F6F6F3] rounded-lg flex items-center justify-center p-2">
                    <img
                      src={doc.page2.prideBearUrl}
                      alt="Медведь с наградой"
                      className="max-h-full object-contain"
                    />
                  </div>
                  <div className="flex gap-2">
                    {[
                      { label: 'С кубком', url: ASSETS.bearTrophy },
                      { label: 'С планшетом', url: ASSETS.bearTablet },
                    ].map((pose) => (
                      <button
                        key={pose.label}
                        type="button"
                        onClick={() =>
                          setDoc({
                            ...doc,
                            page2: { ...doc.page2, prideBearUrl: pose.url },
                          })
                        }
                        className={`flex-1 py-1.5 px-2 rounded-lg border text-xs font-medium ${
                          doc.page2.prideBearUrl === pose.url
                            ? 'bg-zinc-900 text-white border-zinc-900'
                            : 'bg-white text-zinc-700 border-zinc-200'
                        }`}
                      >
                        {pose.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-[#F9F9F7] border border-zinc-200">
                <div>
                  <div className="text-xs font-bold text-zinc-900">
                    Статус выпуска
                  </div>
                  <div className="text-[11px] text-zinc-500">
                    Отметьте «Готов», когда данные заполнены для печати
                  </div>
                </div>
                <select
                  value={doc.status}
                  onChange={(e) =>
                    setDoc({
                      ...doc,
                      status: e.target.value as JournalDocument['status'],
                    })
                  }
                  className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold"
                >
                  {JOURNAL_STATUS_OPTIONS.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* STEP NAVIGATION FOOTER */}
          <div className="pt-4 border-t border-zinc-200 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-zinc-200 text-xs font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-40"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Назад</span>
            </button>

            {step < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold"
              >
                <span>Далее</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onFinish(doc)}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-semibold"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Открыть в редакторе</span>
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
