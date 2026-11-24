import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  BookOpen,
  Check,
  ChevronDown,
  ChevronRight,
  Copy,
  Eye,
  EyeOff,
  FolderPlus,
  GripVertical,
  Image as ImageIcon,
  Layers,
  Plus,
  Search,
  Sparkles,
  Trash2,
  Upload,
} from 'lucide-react';
import {
  MODULE_CATEGORIES,
  SKILL_MASTERY_OPTIONS,
  UNIFIED_SKILLS_CATALOG,
} from '../../data/curriculumCatalog';
import {
  ASSETS,
  MENTOR_NOTE_TEMPLATES,
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

interface FillFormSidebarProps {
  doc: JournalDocument;
  libraryModules: LibraryModule[];
  categories?: ModuleCategoryConfig[];
  skillsCatalog?: SkillDefinition[];
  onChange: (updated: JournalDocument) => void;
  onFocusPage?: (page: 1 | 2) => void;
  onOpenMediaPicker: (
    category: MediaCategory | 'all',
    onSelect: (url: string, asset?: MediaAsset) => void
  ) => void;
}

type SectionKey =
  | 'resident'
  | 'modules'
  | 'skills'
  | 'strengths'
  | 'projects'
  | 'pride'
  | 'mentor'
  | 'next';

export function FillFormSidebar({
  doc,
  libraryModules,
  categories = MODULE_CATEGORIES,
  skillsCatalog = UNIFIED_SKILLS_CATALOG,
  onChange,
  onFocusPage,
  onOpenMediaPicker,
}: FillFormSidebarProps) {
  const [openSection, setOpenSection] = useState<SectionKey | null>('resident');
  const [newSkillText, setNewSkillText] = useState('');
  const [newStrengthTitle, setNewStrengthTitle] = useState('');
  const [aiBusy, setAiBusy] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [modulePickerOpen, setModulePickerOpen] = useState(false);
  const [pickerSearch, setPickerSearch] = useState('');
  const [pickerCategory, setPickerCategory] = useState<string>('all');
  const [draggedModuleId, setDraggedModuleId] = useState<string | null>(null);
  const [skillCatalogOpen, setSkillCatalogOpen] = useState(false);
  const [skillCatalogSearch, setSkillCatalogSearch] = useState('');

  const toggleSection = (key: SectionKey, page: 1 | 2) => {
    setOpenSection((prev) => (prev === key ? null : key));
    onFocusPage?.(page);
  };

  const handleUploadFile = (file: File | undefined, cb: (url: string) => void) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') cb(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const sortedModules = [...doc.page1.modules].sort((a, b) => a.order - b.order);
  const visibleModulesCount = doc.page1.modules.filter((m) => !m.hidden).length;
  const visibleProjectsCount = doc.page1.projects.filter((p) => !p.hidden).length;
  const visibleStrengthsCount = doc.page2.strengths.filter((s) => !s.hidden).length;
  const mentorLength =
    (doc.page2.mentorNote.greeting?.length || 0) +
    (doc.page2.mentorNote.body?.length || 0);

  const hasOverflowWarning =
    visibleModulesCount > 4 ||
    visibleProjectsCount > 4 ||
    visibleStrengthsCount > 6 ||
    mentorLength > 340;

  const skillDefById = useMemo(
    () => new Map(skillsCatalog.map((s) => [s.id, s])),
    [skillsCatalog]
  );

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

  const syncConfirmedSkills = (
    nextConfirmed: ConfirmedResidentSkill[],
    nextSuggestedPool?: string[]
  ) => {
    onChange({
      ...doc,
      page1: {
        ...doc.page1,
        confirmedSkills: nextConfirmed,
        suggestedSkillsPool:
          nextSuggestedPool ?? doc.page1.suggestedSkillsPool ?? [],
        skills: nextConfirmed.map((c) => ({
          id: c.id,
          skillId: c.skillId,
          label: c.label,
          bgColor: c.bgColor,
          status: c.status,
        })),
      },
    });
  };

  const suggestedSkillCandidates = useMemo(() => {
    const rawIds = new Set<string>(doc.page1.suggestedSkillsPool ?? []);
    doc.page1.modules.forEach((mod) => {
      (mod.suggestedSkills ?? []).forEach((sid) => rawIds.add(sid));
      if (mod.libraryModuleId) {
        const lib = libraryModules.find((l) => l.id === mod.libraryModuleId);
        lib?.suggestedSkills.forEach((sid) => rawIds.add(sid));
      }
    });
    const confirmedIds = new Set(
      confirmedList.map((c) => c.skillId).filter(Boolean)
    );
    const confirmedLabels = new Set(
      confirmedList.map((c) => c.label.trim().toLowerCase())
    );
    return Array.from(rawIds)
      .map((sid) => {
        const def = skillDefById.get(sid);
        if (!def) return null;
        if (confirmedIds.has(def.id)) return null;
        if (confirmedLabels.has(def.label.trim().toLowerCase())) return null;
        return def;
      })
      .filter((s): s is SkillDefinition => Boolean(s));
  }, [doc.page1.suggestedSkillsPool, doc.page1.modules, libraryModules, confirmedList, skillDefById]);

  const moveModule = (index: number, delta: -1 | 1) => {
    const targetIdx = index + delta;
    if (targetIdx < 0 || targetIdx >= sortedModules.length) return;
    const copy = [...sortedModules];
    [copy[index], copy[targetIdx]] = [copy[targetIdx], copy[index]];
    onChange({
      ...doc,
      page1: {
        ...doc.page1,
        modules: copy.map((m, i) => ({ ...m, order: i + 1 })),
      },
    });
  };

  const reorderModulesByDrop = (targetId: string) => {
    if (!draggedModuleId || draggedModuleId === targetId) return;
    const copy = [...sortedModules];
    const fromIdx = copy.findIndex((m) => m.id === draggedModuleId);
    const toIdx = copy.findIndex((m) => m.id === targetId);
    if (fromIdx === -1 || toIdx === -1) return;
    const [moved] = copy.splice(fromIdx, 1);
    copy.splice(toIdx, 0, moved);
    onChange({
      ...doc,
      page1: {
        ...doc.page1,
        modules: copy.map((m, i) => ({ ...m, order: i + 1 })),
      },
    });
    setDraggedModuleId(null);
  };

  const handleAddFromLibrary = (lib: LibraryModule) => {
    const newMod: ModuleItem = {
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
    };

    // IMPORTANT: Add module's suggestedSkills ONLY into suggestedSkillsPool for mentor confirmation,
    // NEVER auto-marking them as mastered/confirmed on page 1!
    const nextSuggestedPool = Array.from(
      new Set([...(doc.page1.suggestedSkillsPool ?? []), ...lib.suggestedSkills])
    );

    onChange({
      ...doc,
      page1: {
        ...doc.page1,
        showModules: true,
        modules: [...doc.page1.modules, newMod],
        suggestedSkillsPool: nextSuggestedPool,
      },
    });
    setModulePickerOpen(false);
  };

  const filteredLibraryModules = useMemo(() => {
    const q = pickerSearch.trim().toLowerCase();
    return libraryModules.filter((m) => {
      if (m.isActive === false) return false;
      if (
        pickerCategory !== 'all' &&
        m.category !== pickerCategory &&
        !m.filterCategories?.includes(pickerCategory)
      ) {
        return false;
      }
      if (!q) return true;
      return (
        (m.code || '').toLowerCase().includes(q) ||
        m.displayTitle.toLowerCase().includes(q) ||
        m.officialTitle.toLowerCase().includes(q) ||
        m.subtitle.toLowerCase().includes(q)
      );
    });
  }, [libraryModules, pickerSearch, pickerCategory]);

  const handleGenerateAiMentorNote = async () => {
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
        setAiError(payload.error || 'Не удалось сгенерировать текст.');
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
      setAiError('Нет связи с сервером генерации.');
    } finally {
      setAiBusy(false);
    }
  };

  return (
    <aside className="w-full lg:w-[376px] shrink-0 bg-white border-r border-zinc-200 flex flex-col lg:h-[calc(100vh-114px)] overflow-hidden">
      <div className="px-4 py-3 border-b border-zinc-200 bg-[#F9F9F7] flex items-center justify-between">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900">
            Заполнение данных
          </h2>
          <p className="text-[11px] text-zinc-500 mt-0.5">
            Все изменения сразу появляются на страницах А4
          </p>
        </div>
        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white border border-zinc-200 text-zinc-600">
          8 блоков
        </span>
      </div>

      {/* Overflow / Density Alert */}
      {hasOverflowWarning && (
        <div className="mx-3 mt-3 px-3 py-2 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2 text-[11px] text-amber-900">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Плотная вёрстка А4: </span>
            {visibleModulesCount > 6
              ? 'более 6 модулей на стр. 1 не помещаются.'
              : visibleModulesCount > 4
              ? 'включена компактная сетка модулей.'
              : visibleProjectsCount > 4
              ? 'на стр. 1 отображаются первые 4 проекта.'
              : visibleStrengthsCount > 6
              ? 'показаны первые 6 сильных сторон.'
              : 'текст записки наставника длиннее 340 знаков.'}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-3 space-y-2 text-xs">
        {/* 1. РЕЗИДЕНТ */}
        <AccordionSection
          title="1. Резидент"
          badge={doc.resident.fullName}
          open={openSection === 'resident'}
          onToggle={() => toggleSection('resident', 1)}
        >
          <div className="space-y-3">
            <label className="block">
              <span className="font-semibold text-zinc-700">Имя и фамилия</span>
              <input
                type="text"
                value={doc.resident.fullName}
                onChange={(e) =>
                  onChange({
                    ...doc,
                    resident: { ...doc.resident, fullName: e.target.value },
                  })
                }
                className="mt-1 w-full rounded-lg border border-zinc-200 px-2.5 py-1.5 font-semibold"
              />
            </label>

            <div className="grid grid-cols-2 gap-2.5">
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
              <label className="block">
                <span className="font-semibold text-zinc-700">Возрастная группа</span>
                <select
                  value={doc.resident.ageCategory}
                  onChange={(e) =>
                    onChange({
                      ...doc,
                      resident: {
                        ...doc.resident,
                        ageCategory: e.target.value as AgeCategory,
                      },
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-zinc-200 px-2 py-1.5 bg-white"
                >
                  <option value="8-10">8–10 лет</option>
                  <option value="11-13">11–13 лет</option>
                  <option value="14-15">14–15 лет</option>
                </select>
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

            <label className="block">
              <span className="font-semibold text-zinc-700">Филиал / локация</span>
              <input
                type="text"
                value={doc.resident.branch}
                onChange={(e) =>
                  onChange({
                    ...doc,
                    resident: { ...doc.resident, branch: e.target.value },
                  })
                }
                placeholder="Центральный кампус"
                className="mt-1 w-full rounded-lg border border-zinc-200 px-2.5 py-1.5"
              />
            </label>

            <div className="flex flex-wrap gap-4 pt-1">
              <label className="flex items-center gap-1.5 cursor-pointer">
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
                <span>Возраст на обложке</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={doc.page1.showBranch}
                  onChange={(e) =>
                    onChange({
                      ...doc,
                      page1: { ...doc.page1, showBranch: e.target.checked },
                    })
                  }
                />
                <span>Показывать филиал</span>
              </label>
            </div>
          </div>
        </AccordionSection>

        {/* 2. МОДУЛИ */}
        <AccordionSection
          title="2. Модули"
          badge={`${visibleModulesCount} активн.`}
          open={openSection === 'modules'}
          onToggle={() => toggleSection('modules', 1)}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <label className="flex items-center gap-1.5 cursor-pointer font-medium">
                <input
                  type="checkbox"
                  checked={doc.page1.showModules}
                  onChange={(e) =>
                    onChange({
                      ...doc,
                      page1: { ...doc.page1, showModules: e.target.checked },
                    })
                  }
                />
                <span>Показывать блок модулей</span>
              </label>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setModulePickerOpen((v) => !v)}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[#0D9488] text-[#0F766E] bg-[#F0FDFA] font-semibold hover:bg-[#CCFBF1]/60"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Из библиотеки модулей</span>
              </button>
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
                          description: 'Краткое описание освоенных навыков.',
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
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-900 text-white font-semibold"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Пустой</span>
              </button>
            </div>

            {modulePickerOpen && (
              <div className="p-2.5 rounded-xl border border-zinc-200 bg-[#F9F9F7] space-y-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={pickerSearch}
                    onChange={(e) => setPickerSearch(e.target.value)}
                    placeholder="Поиск по программе KIBERone..."
                    className="w-full pl-8 pr-2.5 py-1.5 rounded-lg bg-white border border-zinc-200 text-[11px]"
                  />
                </div>
                <select
                  value={pickerCategory}
                  onChange={(e) => setPickerCategory(e.target.value)}
                  className="w-full rounded-lg border border-zinc-200 bg-white px-2 py-1 text-[11px]"
                >
                  <option value="all">Все категории ({libraryModules.filter((m) => m.isActive !== false).length})</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.shortName}
                    </option>
                  ))}
                </select>
                <div className="space-y-1 max-h-52 overflow-y-auto pr-0.5">
                  {filteredLibraryModules.map((lib) => (
                    <button
                      key={lib.id}
                      type="button"
                      onClick={() => handleAddFromLibrary(lib)}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg bg-white border border-zinc-200 hover:border-[#0D9488] flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <div className="font-semibold text-zinc-900 truncate">
                          {lib.code ? `${lib.code} · ` : ''}
                          {lib.displayTitle}
                        </div>
                        <div className="text-[10px] text-zinc-500 truncate">
                          {lib.subtitle} · навыков к проверке: {lib.suggestedSkills.length}
                        </div>
                      </div>
                      <Plus className="w-3.5 h-3.5 text-[#0D9488] shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2.5">
              {sortedModules.map((mod, idx) => (
                <div
                  key={mod.id}
                  draggable
                  onDragStart={() => setDraggedModuleId(mod.id)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => reorderModulesByDrop(mod.id)}
                  onDragEnd={() => setDraggedModuleId(null)}
                  className={`p-2.5 rounded-xl border space-y-2 transition-colors ${
                    draggedModuleId === mod.id
                      ? 'border-[#0D9488] bg-[#F0FDFA]'
                      : mod.hidden
                      ? 'bg-zinc-50 border-zinc-200 opacity-65'
                      : 'bg-[#F9F9F7] border-zinc-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1 font-mono text-[11px] font-bold text-zinc-500 min-w-0 cursor-grab">
                      <GripVertical className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                      <span className="truncate">
                        #{idx + 1} · {mod.title || 'Без названия'}
                      </span>
                    </span>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => moveModule(idx, -1)}
                        className="p-1 rounded border border-zinc-200 bg-white disabled:opacity-40"
                        title="Выше"
                      >
                        <ArrowUp className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === sortedModules.length - 1}
                        onClick={() => moveModule(idx, 1)}
                        className="p-1 rounded border border-zinc-200 bg-white disabled:opacity-40"
                        title="Ниже"
                      >
                        <ArrowDown className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          onChange({
                            ...doc,
                            page1: {
                              ...doc.page1,
                              modules: doc.page1.modules.map((m) =>
                                m.id === mod.id ? { ...m, hidden: !m.hidden } : m
                              ),
                            },
                          })
                        }
                        className="p-1 rounded border border-zinc-200 bg-white text-zinc-600"
                        title={mod.hidden ? 'Показать' : 'Скрыть'}
                      >
                        {mod.hidden ? (
                          <EyeOff className="w-3 h-3" />
                        ) : (
                          <Eye className="w-3 h-3" />
                        )}
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
                        className="p-1 rounded border border-zinc-200 bg-white text-zinc-600"
                        title="Дублировать"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                      {doc.page1.modules.length > 1 && (
                        <button
                          type="button"
                          onClick={() =>
                            onChange({
                              ...doc,
                              page1: {
                                ...doc.page1,
                                modules: doc.page1.modules.filter(
                                  (m) => m.id !== mod.id
                                ),
                              },
                            })
                          }
                          className="p-1 rounded text-zinc-400 hover:text-red-600"
                          title="Удалить"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5">
                    <input
                      type="text"
                      value={mod.title}
                      onChange={(e) =>
                        onChange({
                          ...doc,
                          page1: {
                            ...doc.page1,
                            modules: doc.page1.modules.map((m) =>
                              m.id === mod.id ? { ...m, title: e.target.value } : m
                            ),
                          },
                        })
                      }
                      placeholder="Название"
                      className="rounded border border-zinc-200 bg-white px-2 py-1 font-semibold"
                    />
                    <input
                      type="text"
                      value={mod.subtitle}
                      onChange={(e) =>
                        onChange({
                          ...doc,
                          page1: {
                            ...doc.page1,
                            modules: doc.page1.modules.map((m) =>
                              m.id === mod.id
                                ? { ...m, subtitle: e.target.value }
                                : m
                            ),
                          },
                        })
                      }
                      placeholder="Подзаголовок"
                      className="rounded border border-zinc-200 bg-white px-2 py-1"
                    />
                  </div>

                  <textarea
                    rows={2}
                    value={mod.description}
                    onChange={(e) =>
                      onChange({
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
                    className="w-full rounded border border-zinc-200 bg-white px-2 py-1"
                  />

                  <div className="grid grid-cols-[1fr_1fr_auto] gap-1.5 items-center">
                    <select
                      value={
                        mod.visualMode ??
                        (mod.customImageUrl || mod.imageMediaId
                          ? 'image'
                          : 'illustration')
                      }
                      onChange={(e) =>
                        onChange({
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
                      className="rounded border border-zinc-200 bg-white px-1.5 py-1 text-[11px]"
                      title="Тип графики"
                    >
                      <option value="illustration">SVG-иллюстрация</option>
                      <option value="icon">Большая иконка</option>
                      <option value="image">Картинка</option>
                    </select>

                    {(mod.visualMode ?? 'illustration') === 'icon' ? (
                      <select
                        value={mod.iconKey ?? 'blocks'}
                        onChange={(e) =>
                          onChange({
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
                        className="rounded border border-zinc-200 bg-white px-1.5 py-1 text-[11px]"
                      >
                        {MODULE_LUCIDE_ICON_OPTIONS.map((opt) => (
                          <option key={opt.key} value={opt.key}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <select
                        value={mod.illustrationKey}
                        onChange={(e) => {
                          const key = e.target.value as ModuleIllustrationKey;
                          const theme = MODULE_ILLUSTRATION_OPTIONS.find(
                            (t) => t.key === key
                          );
                          onChange({
                            ...doc,
                            page1: {
                              ...doc.page1,
                              modules: doc.page1.modules.map((m) =>
                                m.id === mod.id
                                  ? {
                                      ...m,
                                      visualMode: 'illustration',
                                      illustrationKey: key,
                                      customImageUrl: undefined,
                                      imageMediaId: null,
                                      cardBgColor: theme?.defaultColor || m.cardBgColor,
                                    }
                                  : m
                              ),
                            },
                          });
                        }}
                        className="rounded border border-zinc-200 bg-white px-1.5 py-1 text-[11px]"
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
                        onChange({
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
                      className="w-7 h-7 rounded border border-zinc-200 cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() =>
                        onOpenMediaPicker('modules', (url, asset) =>
                          onChange({
                            ...doc,
                            page1: {
                              ...doc.page1,
                              modules: doc.page1.modules.map((m) =>
                                m.id === mod.id
                                  ? {
                                      ...m,
                                      visualMode: 'image',
                                      imageMediaId: asset?.id ?? null,
                                      customImageUrl: url,
                                    }
                                  : m
                              ),
                            },
                          })
                        )
                      }
                      className="flex-1 inline-flex items-center justify-center gap-1 px-2 py-1 rounded border border-zinc-200 bg-white hover:bg-zinc-50 text-[11px]"
                    >
                      <ImageIcon className="w-3 h-3" />
                      <span>Из медиатеки</span>
                    </button>
                    <label className="inline-flex items-center gap-1 px-2 py-1 rounded bg-zinc-800 text-white text-[11px] cursor-pointer">
                      <Upload className="w-3 h-3" />
                      <span>Файл</span>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        className="hidden"
                        onChange={(e) =>
                          handleUploadFile(e.target.files?.[0], (url) =>
                            onChange({
                              ...doc,
                              page1: {
                                ...doc.page1,
                                modules: doc.page1.modules.map((m) =>
                                  m.id === mod.id
                                    ? {
                                        ...m,
                                        visualMode: 'image',
                                        imageMediaId: null,
                                        customImageUrl: url,
                                      }
                                    : m
                                ),
                              },
                            })
                          )
                        }
                      />
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </AccordionSection>

        {/* 3. НАВЫКИ (ПРЕДЛАГАЕМЫЕ VS ПОДТВЕРЖДЁННЫЕ) */}
        <AccordionSection
          title="3. Навыки"
          badge={`${confirmedList.length} подтв.`}
          open={openSection === 'skills'}
          onToggle={() => toggleSection('skills', 1)}
        >
          <div className="space-y-3">
            <label className="flex items-center gap-1.5 cursor-pointer font-medium">
              <input
                type="checkbox"
                checked={doc.page1.showSkills}
                onChange={(e) =>
                  onChange({
                    ...doc,
                    page1: { ...doc.page1, showSkills: e.target.checked },
                  })
                }
              />
              <span>Показывать блок «Чему я научился»</span>
            </label>

            {/* Suggested skills from selected modules (NOT auto-mastered) */}
            {suggestedSkillCandidates.length > 0 && (
              <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-2">
                <div className="text-[11px] font-bold text-amber-900">
                  Рекомендовано модулями (нажмите для подтверждения):
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {suggestedSkillCandidates.map((def) => (
                    <button
                      key={def.id}
                      type="button"
                      onClick={() => {
                        const entry: ConfirmedResidentSkill = {
                          id: `sk-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
                          skillId: def.id,
                          label: def.label,
                          bgColor: def.defaultColor,
                          status: 'independent',
                          confirmedAt: new Date().toISOString(),
                        };
                        syncConfirmedSkills([...confirmedList, entry]);
                      }}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-amber-300 bg-white hover:bg-emerald-50 hover:border-emerald-400 text-[11px] font-medium text-zinc-800 transition-colors"
                    >
                      <Plus className="w-3 h-3 text-[#0D9488]" />
                      <span>{def.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Confirmed skills printed on journal page 1 */}
            <div className="space-y-2">
              <div className="font-semibold text-zinc-700">
                Подтверждённые навыки резидента ({confirmedList.length}):
              </div>
              {confirmedList.length === 0 ? (
                <div className="p-3 rounded-lg border border-dashed border-zinc-200 text-zinc-500 text-center text-[11px]">
                  Подтвердите навыки из списка модулей выше или добавьте из справочника ниже.
                </div>
              ) : (
                confirmedList.map((sk) => (
                  <div
                    key={sk.id}
                    className="p-2 rounded-xl border border-zinc-200 bg-[#F9F9F7] space-y-1.5"
                  >
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={sk.bgColor}
                        onChange={(e) =>
                          syncConfirmedSkills(
                            confirmedList.map((c) =>
                              c.id === sk.id ? { ...c, bgColor: e.target.value } : c
                            )
                          )
                        }
                        className="w-6 h-6 rounded border border-zinc-200 shrink-0 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={sk.label}
                        onChange={(e) =>
                          syncConfirmedSkills(
                            confirmedList.map((c) =>
                              c.id === sk.id ? { ...c, label: e.target.value } : c
                            )
                          )
                        }
                        className="flex-1 rounded border border-zinc-200 bg-white px-2 py-1 font-semibold"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          syncConfirmedSkills(
                            confirmedList.filter((c) => c.id !== sk.id)
                          )
                        }
                        className="p-1 text-zinc-400 hover:text-red-600"
                        title="Удалить навык"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 gap-1.5">
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
                        className="w-full rounded border border-zinc-200 bg-white px-2 py-1 text-[11px]"
                      >
                        {SKILL_MASTERY_OPTIONS.map((opt) => (
                          <option key={opt.id} value={opt.id}>
                            Уровень: {opt.label}
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        value={sk.example || ''}
                        onChange={(e) =>
                          syncConfirmedSkills(
                            confirmedList.map((c) =>
                              c.id === sk.id ? { ...c, example: e.target.value } : c
                            )
                          )
                        }
                        placeholder="Пример проявления (внутренняя заметка)..."
                        className="w-full rounded border border-zinc-200 bg-white px-2 py-1 text-[11px]"
                      />
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Expandable Full Unified Skills Catalog */}
            <div className="pt-1 border-t border-zinc-100 space-y-2">
              <button
                type="button"
                onClick={() => setSkillCatalogOpen((v) => !v)}
                className="text-[11px] font-semibold text-[#0D9488] hover:underline"
              >
                {skillCatalogOpen
                  ? 'Скрыть справочник навыков KIBERone'
                  : 'Выбрать из справочника навыков KIBERone'}
              </button>

              {skillCatalogOpen && (
                <div className="p-2 rounded-xl border border-zinc-200 bg-[#F9F9F7] space-y-2">
                  <input
                    type="text"
                    value={skillCatalogSearch}
                    onChange={(e) => setSkillCatalogSearch(e.target.value)}
                    placeholder="Поиск навыка в каталоге..."
                    className="w-full rounded-lg border border-zinc-200 bg-white px-2.5 py-1 text-[11px]"
                  />
                  <div className="flex flex-wrap gap-1 max-h-40 overflow-y-auto">
                    {skillsCatalog
                      .filter(
                        (s) =>
                          !skillCatalogSearch.trim() ||
                          s.label
                            .toLowerCase()
                            .includes(skillCatalogSearch.trim().toLowerCase())
                      )
                      .map((lib) => {
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
                                syncConfirmedSkills(
                                  confirmedList.filter(
                                    (c) =>
                                      c.skillId !== lib.id &&
                                      c.label.toLowerCase() !==
                                        lib.label.toLowerCase()
                                  )
                                );
                              } else {
                                syncConfirmedSkills([
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
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded border text-[11px] font-medium ${
                              exists
                                ? 'bg-zinc-900 text-white border-zinc-900'
                                : 'bg-white text-zinc-700 border-zinc-200'
                            }`}
                          >
                            {exists && <Check className="w-3 h-3" />}
                            <span>{lib.label}</span>
                          </button>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-1.5">
              <input
                type="text"
                value={newSkillText}
                onChange={(e) => setNewSkillText(e.target.value)}
                placeholder="Добавить свой подтверждённый навык..."
                className="flex-1 rounded-lg border border-zinc-200 px-2.5 py-1.5"
              />
              <button
                type="button"
                onClick={() => {
                  const label = newSkillText.trim();
                  if (!label) return;
                  syncConfirmedSkills([
                    ...confirmedList,
                    {
                      id: `sk-${Date.now()}`,
                      label,
                      bgColor: '#FFE047',
                      status: 'independent',
                      confirmedAt: new Date().toISOString(),
                    },
                  ]);
                  setNewSkillText('');
                }}
                className="px-3 py-1.5 rounded-lg bg-[#0D9488] text-white font-semibold"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </AccordionSection>

        {/* 4. СИЛЬНЫЕ СТОРОНЫ */}
        <AccordionSection
          title="4. Сильные стороны"
          badge={`${visibleStrengthsCount} активн.`}
          open={openSection === 'strengths'}
          onToggle={() => toggleSection('strengths', 2)}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-1.5 cursor-pointer font-medium">
                <input
                  type="checkbox"
                  checked={doc.page2.showStrengths}
                  onChange={(e) =>
                    onChange({
                      ...doc,
                      page2: { ...doc.page2, showStrengths: e.target.checked },
                    })
                  }
                />
                <span>Показывать блок</span>
              </label>

              <div className="flex gap-1 p-0.5 bg-zinc-100 rounded-md">
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
                    className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                      doc.page2.strengthsColumns === cols
                        ? 'bg-white shadow-xs text-zinc-900'
                        : 'text-zinc-500'
                    }`}
                  >
                    {cols === 2 ? '2 кол.' : '3 кол.'}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-1">
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
                    className={`px-2 py-1 rounded border text-[11px] font-medium ${
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

            <div className="space-y-2">
              {doc.page2.strengths.map((str) => (
                <div
                  key={str.id}
                  className="p-2 rounded-lg border border-zinc-200 bg-[#F9F9F7] space-y-1.5"
                >
                  <div className="flex items-center gap-1.5">
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
                      className="w-6 h-6 rounded border border-zinc-200 cursor-pointer shrink-0"
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
                    <button
                      type="button"
                      onClick={() =>
                        onChange({
                          ...doc,
                          page2: {
                            ...doc.page2,
                            strengths: doc.page2.strengths.map((s) =>
                              s.id === str.id
                                ? { ...s, hidden: !s.hidden }
                                : s
                            ),
                          },
                        })
                      }
                      className="p-1 text-zinc-500"
                    >
                      {str.hidden ? (
                        <EyeOff className="w-3.5 h-3.5" />
                      ) : (
                        <Eye className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        onChange({
                          ...doc,
                          page2: {
                            ...doc.page2,
                            strengths: doc.page2.strengths.filter(
                              (s) => s.id !== str.id
                            ),
                          },
                        })
                      }
                      className="p-1 text-zinc-400 hover:text-red-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
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
                            s.id === str.id
                              ? { ...s, example: e.target.value }
                              : s
                          ),
                        },
                      })
                    }
                    placeholder="Пример проявления на занятии..."
                    className="w-full rounded border border-zinc-200 bg-white px-2 py-1 text-[11px]"
                  />
                </div>
              ))}
            </div>

            <div className="flex gap-1.5">
              <input
                type="text"
                value={newStrengthTitle}
                onChange={(e) => setNewStrengthTitle(e.target.value)}
                placeholder="Своя сильная сторона..."
                className="flex-1 rounded-lg border border-zinc-200 px-2.5 py-1.5"
              />
              <button
                type="button"
                onClick={() => {
                  const title = newStrengthTitle.trim();
                  if (!title) return;
                  onChange({
                    ...doc,
                    page2: {
                      ...doc.page2,
                      strengths: [
                        ...doc.page2.strengths,
                        {
                          id: `str-${Date.now()}`,
                          title,
                          example: '',
                          iconKey: 'logic',
                          bgColor: '#B8F2F5',
                        },
                      ],
                    },
                  });
                  setNewStrengthTitle('');
                }}
                className="px-3 py-1.5 rounded-lg bg-[#0D9488] text-white font-semibold"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </AccordionSection>

        {/* 5. ПРОЕКТЫ */}
        <AccordionSection
          title="5. Проекты"
          badge={`${visibleProjectsCount} активн.`}
          open={openSection === 'projects'}
          onToggle={() => toggleSection('projects', 1)}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-1.5 cursor-pointer font-medium">
                <input
                  type="checkbox"
                  checked={doc.page1.showProjects}
                  onChange={(e) =>
                    onChange({
                      ...doc,
                      page1: { ...doc.page1, showProjects: e.target.checked },
                    })
                  }
                />
                <span>Показывать блок «Мои результаты»</span>
              </label>

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
                            caption: 'Описание результата',
                            description: '',
                            fallbackTheme: 'web',
                            isRealScreenshot: false,
                          },
                        ],
                      },
                    })
                  }
                  className="inline-flex items-center gap-1 px-2 py-1 rounded bg-zinc-900 text-white text-[11px] font-semibold"
                >
                  <FolderPlus className="w-3 h-3" />
                  <span>Добавить</span>
                </button>
              )}
            </div>

            {doc.page1.projects.map((proj, idx) => (
              <div
                key={proj.id}
                className={`p-2.5 rounded-xl border space-y-2 ${
                  proj.hidden
                    ? 'bg-zinc-50 border-zinc-200 opacity-65'
                    : 'bg-[#F9F9F7] border-zinc-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] font-bold text-zinc-500">
                    Проект #{idx + 1}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() =>
                        onChange({
                          ...doc,
                          page1: {
                            ...doc.page1,
                            projects: doc.page1.projects.map((p) =>
                              p.id === proj.id
                                ? { ...p, hidden: !p.hidden }
                                : p
                            ),
                          },
                        })
                      }
                      className="p-1 rounded border border-zinc-200 bg-white text-zinc-600"
                    >
                      {proj.hidden ? (
                        <EyeOff className="w-3 h-3" />
                      ) : (
                        <Eye className="w-3 h-3" />
                      )}
                    </button>
                    {doc.page1.projects.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          onChange({
                            ...doc,
                            page1: {
                              ...doc.page1,
                              projects: doc.page1.projects.filter(
                                (p) => p.id !== proj.id
                              ),
                            },
                          })
                        }
                        className="p-1 text-zinc-400 hover:text-red-600"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>

                <input
                  type="text"
                  value={proj.title}
                  onChange={(e) =>
                    onChange({
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
                  className="w-full rounded border border-zinc-200 bg-white px-2 py-1 font-semibold"
                />
                <input
                  type="text"
                  value={proj.caption}
                  onChange={(e) =>
                    onChange({
                      ...doc,
                      page1: {
                        ...doc.page1,
                        projects: doc.page1.projects.map((p) =>
                          p.id === proj.id ? { ...p, caption: e.target.value } : p
                        ),
                      },
                    })
                  }
                  placeholder="Короткая подпись"
                  className="w-full rounded border border-zinc-200 bg-white px-2 py-1"
                />

                <div className="flex gap-1.5">
                  <label className="flex-1 inline-flex items-center justify-center gap-1 px-2 py-1 rounded bg-zinc-900 text-white text-[11px] font-medium cursor-pointer">
                    <Upload className="w-3 h-3" />
                    <span>Скриншот</span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="hidden"
                      onChange={(e) =>
                        handleUploadFile(e.target.files?.[0], (url) =>
                          onChange({
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
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      onOpenMediaPicker('projects', (url) =>
                        onChange({
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
                    className="px-2.5 py-1 rounded border border-zinc-200 bg-white text-[11px]"
                  >
                    Медиатека
                  </button>
                  <select
                    value={proj.fallbackTheme}
                    onChange={(e) =>
                      onChange({
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
                    className="rounded border border-zinc-200 bg-white px-1.5 py-1 text-[11px]"
                  >
                    <option value="minecraft">3D-игра</option>
                    <option value="animation">Анимация</option>
                    <option value="web">Веб/Код</option>
                    <option value="python">Python</option>
                    <option value="game3d">3D-сцена</option>
                  </select>
                </div>

                {proj.imageUrl && (
                  <div className="pt-1 space-y-1 text-[10px] text-zinc-500">
                    <div className="flex items-center gap-2">
                      <span>Зум</span>
                      <input
                        type="range"
                        min="0.8"
                        max="1.8"
                        step="0.05"
                        value={proj.imageScale ?? 1}
                        onChange={(e) =>
                          onChange({
                            ...doc,
                            page1: {
                              ...doc.page1,
                              projects: doc.page1.projects.map((p) =>
                                p.id === proj.id
                                  ? { ...p, imageScale: Number(e.target.value) }
                                  : p
                              ),
                            },
                          })
                        }
                        className="flex-1 accent-[#0D9488]"
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </AccordionSection>

        {/* 6. ДОСТИЖЕНИЯ */}
        <AccordionSection
          title="6. Достижения"
          badge="Момент гордости"
          open={openSection === 'pride'}
          onToggle={() => toggleSection('pride', 2)}
        >
          <div className="space-y-3">
            <label className="flex items-center gap-1.5 cursor-pointer font-medium">
              <input
                type="checkbox"
                checked={doc.page2.showPride}
                onChange={(e) =>
                  onChange({
                    ...doc,
                    page2: { ...doc.page2, showPride: e.target.checked },
                  })
                }
              />
              <span>Показывать блок «Мой момент гордости»</span>
            </label>

            <label className="block">
              <span className="font-semibold text-zinc-700">Заголовок</span>
              <input
                type="text"
                value={doc.page2.prideTitle}
                onChange={(e) =>
                  onChange({
                    ...doc,
                    page2: { ...doc.page2, prideTitle: e.target.value },
                  })
                }
                className="mt-1 w-full rounded-lg border border-zinc-200 px-2.5 py-1.5 font-semibold"
              />
            </label>

            <label className="block">
              <span className="font-semibold text-zinc-700">
                Главное достижение резидента
              </span>
              <textarea
                rows={3}
                value={doc.page2.prideText}
                onChange={(e) =>
                  onChange({
                    ...doc,
                    page2: { ...doc.page2, prideText: e.target.value },
                  })
                }
                className="mt-1 w-full rounded-lg border border-zinc-200 px-2.5 py-1.5"
              />
            </label>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2">
                <span>Цвет карточки</span>
                <input
                  type="color"
                  value={doc.page2.prideBgColor}
                  onChange={(e) =>
                    onChange({
                      ...doc,
                      page2: { ...doc.page2, prideBgColor: e.target.value },
                    })
                  }
                  className="w-7 h-7 rounded border border-zinc-200 cursor-pointer"
                />
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer">
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
        </AccordionSection>

        {/* 7. СЛОВО НАСТАВНИКА */}
        <AccordionSection
          title="7. Слово наставника"
          badge={doc.page2.showMentorNote ? 'Вкл.' : 'Скрыто'}
          open={openSection === 'mentor'}
          onToggle={() => toggleSection('mentor', 2)}
        >
          <div className="space-y-3">
            <label className="flex items-center gap-1.5 cursor-pointer font-medium">
              <input
                type="checkbox"
                checked={doc.page2.showMentorNote}
                onChange={(e) =>
                  onChange({
                    ...doc,
                    page2: { ...doc.page2, showMentorNote: e.target.checked },
                  })
                }
              />
              <span>Показывать записку наставника</span>
            </label>

            {/* AI Assistant Box */}
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
                placeholder="Заметки для AI (напр.: сам отладил цикл, помог другу)..."
                className="w-full rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-[11px]"
              />
              <button
                type="button"
                disabled={aiBusy}
                onClick={handleGenerateAiMentorNote}
                className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0D9488] text-white font-semibold hover:bg-[#0F766E] disabled:opacity-60"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{aiBusy ? 'Генерация...' : 'Сформировать с AI'}</span>
              </button>
              {aiError && (
                <div className="text-[11px] text-red-700 bg-red-50 border border-red-200 rounded p-2">
                  {aiError}
                </div>
              )}
            </div>

            {/* Quick Phrase Presets */}
            <div>
              <div className="text-[11px] font-semibold text-zinc-500 mb-1">
                Быстрые шаблоны обращения:
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
                            signature: `Твой наставник, ${doc.resident.mentorName.split(' ')[0]}`,
                          },
                        },
                      })
                    }
                    className="px-2 py-1 rounded border border-zinc-200 bg-white hover:border-[#0D9488] text-[10px] font-medium text-zinc-700"
                  >
                    {tpl.title}
                  </button>
                ))}
              </div>
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
                className="mt-1 w-full rounded-lg border border-zinc-200 px-2.5 py-1.5"
              />
            </label>

            <label className="block">
              <span className="font-semibold text-zinc-700">Текст письма</span>
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
                className="mt-1 w-full rounded-lg border border-zinc-200 px-2.5 py-1.5"
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
                className="mt-1 w-full rounded-lg border border-zinc-200 px-2.5 py-1.5"
              />
            </label>

            <div className="flex items-center justify-between gap-2">
              <label className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-zinc-200 font-medium cursor-pointer hover:bg-zinc-50">
                <Upload className="w-3.5 h-3.5" />
                <span>Фото наставника</span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={(e) =>
                    handleUploadFile(e.target.files?.[0], (url) =>
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
                  className="text-red-600 hover:underline text-[11px]"
                >
                  Убрать фото
                </button>
              )}
            </div>
          </div>
        </AccordionSection>

        {/* 8. СЛЕДУЮЩАЯ ГЛАВА */}
        <AccordionSection
          title="8. Следующая глава"
          badge={`${doc.page2.nextChapter.topics.length}/3`}
          open={openSection === 'next'}
          onToggle={() => toggleSection('next', 2)}
        >
          <div className="space-y-3">
            <label className="flex items-center gap-1.5 cursor-pointer font-medium">
              <input
                type="checkbox"
                checked={doc.page2.showNextChapter}
                onChange={(e) =>
                  onChange({
                    ...doc,
                    page2: { ...doc.page2, showNextChapter: e.target.checked },
                  })
                }
              />
              <span>Показывать блок «Что интересного впереди?»</span>
            </label>

            <label className="block">
              <span className="font-semibold text-zinc-700">Заголовок</span>
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
                className="mt-1 w-full rounded-lg border border-zinc-200 px-2.5 py-1.5 font-semibold"
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
                className="mt-1 w-full rounded-lg border border-zinc-200 px-2.5 py-1.5"
              />
            </label>

            <div>
              <div className="font-semibold text-zinc-700 mb-1">
                Направления развития (до 3):
              </div>
              <div className="flex flex-wrap gap-1">
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
                      className={`px-2 py-1 rounded border text-[11px] font-medium ${
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
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <label className="block">
                <span className="font-semibold text-zinc-700">Сайт в подвале</span>
                <input
                  type="text"
                  value={doc.page1.footerWebsite}
                  onChange={(e) =>
                    onChange({
                      ...doc,
                      page1: { ...doc.page1, footerWebsite: e.target.value },
                      page2: { ...doc.page2, footerWebsite: e.target.value },
                    })
                  }
                  className="mt-1 w-full rounded border border-zinc-200 px-2 py-1"
                />
              </label>
              <label className="flex flex-col justify-end">
                <span className="font-semibold text-zinc-700 mb-1">Маскот стр. 1</span>
                <button
                  type="button"
                  onClick={() =>
                    onOpenMediaPicker('bear', (url) =>
                      onChange({
                        ...doc,
                        page1: {
                          ...doc.page1,
                          bearImageUrl: url || ASSETS.bearTablet,
                        },
                      })
                    )
                  }
                  className="inline-flex items-center justify-center gap-1 px-2 py-1 rounded border border-zinc-200 hover:bg-zinc-50 text-[11px]"
                >
                  <Layers className="w-3 h-3" />
                  <span>Сменить позу</span>
                </button>
              </label>
            </div>
          </div>
        </AccordionSection>
      </div>
    </aside>
  );
}

function AccordionSection({
  title,
  badge,
  open,
  onToggle,
  children,
}: {
  title: string;
  badge?: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-zinc-200 rounded-xl overflow-hidden bg-white">
      <button
        type="button"
        onClick={onToggle}
        className={`w-full px-3.5 py-2.5 flex items-center justify-between gap-2 text-left transition-colors ${
          open ? 'bg-[#F6F6F3] border-b border-zinc-200' : 'hover:bg-zinc-50'
        }`}
      >
        <div className="flex items-center gap-2 min-w-0">
          {open ? (
            <ChevronDown className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
          )}
          <span className="font-bold text-zinc-900 truncate">{title}</span>
        </div>
        {badge && (
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-white border border-zinc-200 text-zinc-500 truncate max-w-[120px] shrink-0">
            {badge}
          </span>
        )}
      </button>
      {open && <div className="p-3">{children}</div>}
    </div>
  );
}
