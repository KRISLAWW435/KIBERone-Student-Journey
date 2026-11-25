import React, { useMemo, useState } from 'react';
import {
  BookOpen,
  Check,
  Copy,
  Edit3,
  Eye,
  EyeOff,
  FolderOpen,
  Image as ImageIcon,
  Layers,
  Palette,
  Plus,
  Search,
  Sparkles,
  Tag,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import {
  getModuleAgeGroups,
  MODULE_AGE_GROUP_OPTIONS,
} from '../../data/curriculumCatalog';
import { DESIGN_PALETTES } from '../../data/presets';
import {
  AgeCategory,
  GroupCurriculumTemplate,
  LibraryModule,
  MediaAsset,
  MediaCategory,
  ModuleAgeGroup,
  ModuleCategoryConfig,
  ModuleIllustrationKey,
  ModuleLucideIconKey,
  ModuleVisualMode,
  SkillDefinition,
  SkillGroupName,
} from '../../types/journal';
import { AppHeader, WorkspaceTab } from '../AppHeader';
import {
  MODULE_ILLUSTRATION_OPTIONS,
  MODULE_LUCIDE_ICON_OPTIONS,
  ModuleLucideIcon,
  ModuleSvgIllustration,
} from '../journal/JournalArtwork';

interface ModulesLibraryViewProps {
  modules: LibraryModule[];
  categories: ModuleCategoryConfig[];
  skillsCatalog: SkillDefinition[];
  groupTemplates: GroupCurriculumTemplate[];
  mediaAssets: MediaAsset[];
  onNavigate: (tab: WorkspaceTab) => void;
  onCreateGroup: () => void;
  onOpenMediaLibrary: () => void;
  onSaveModule: (mod: LibraryModule) => Promise<void>;
  onDeleteModule: (id: string) => Promise<void>;
  onSaveCategory: (cat: ModuleCategoryConfig) => Promise<void>;
  onDeleteCategory: (id: string) => Promise<void>;
  onSaveSkill: (skill: SkillDefinition) => Promise<void>;
  onDeleteSkill: (id: string) => Promise<void>;
  onSaveGroupTemplate: (tpl: GroupCurriculumTemplate) => Promise<void>;
  onDeleteGroupTemplate: (id: string) => Promise<void>;
  onOpenMediaPicker: (
    category: MediaCategory | 'all',
    onSelect: (url: string, asset?: MediaAsset) => void
  ) => void;
}

type CurriculumSubTab =
  | 'catalog'
  | 'categories'
  | 'skills'
  | 'cards'
  | 'editor'
  | 'groupTemplates';

const SKILL_GROUPS: SkillGroupName[] = [
  'Алгоритмическое мышление',
  'Программирование',
  'Разработка игр',
  'Веб-разработка',
  'Дизайн и творчество',
  'Работа с AI',
  'Цифровая грамотность',
  'Проектная деятельность',
  'Личностные и универсальные навыки',
];

export function ModulesLibraryView({
  modules,
  categories,
  skillsCatalog,
  groupTemplates,
  mediaAssets,
  onNavigate,
  onCreateGroup,
  onOpenMediaLibrary,
  onSaveModule,
  onDeleteModule,
  onSaveCategory,
  onDeleteCategory,
  onSaveSkill,
  onDeleteSkill,
  onSaveGroupTemplate,
  onDeleteGroupTemplate,
  onOpenMediaPicker,
}: ModulesLibraryViewProps) {
  const [subTab, setSubTab] = useState<CurriculumSubTab>('catalog');
  const [search, setSearch] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<'all' | ModuleAgeGroup>('all');
  const [showHidden, setShowHidden] = useState(true);

  // Module Editor state (used in 'editor' tab or quick edit jump)
  const [editingModule, setEditingModule] = useState<LibraryModule | null>(
    modules[0] ?? null
  );
  const [skillPickerSearch, setSkillPickerSearch] = useState('');

  // Category modal/form state
  const [editingCategory, setEditingCategory] =
    useState<ModuleCategoryConfig | null>(null);

  // Skill catalog modal/form state
  const [skillsSearch, setSkillsSearch] = useState('');
  const [editingSkill, setEditingSkill] = useState<SkillDefinition | null>(null);

  // Cards preview mode override
  const [cardsPreviewMode, setCardsPreviewMode] = useState<
    'auto' | ModuleVisualMode
  >('auto');

  // Group curriculum template modal
  const [editingGroupTemplate, setEditingGroupTemplate] =
    useState<GroupCurriculumTemplate | null>(null);
  const [tplModSearch, setTplModSearch] = useState('');

  const skillById = useMemo(
    () => new Map(skillsCatalog.map((s) => [s.id, s])),
    [skillsCatalog]
  );

  const categoryById = useMemo(
    () => new Map(categories.map((c) => [c.id, c])),
    [categories]
  );

  const resolveModuleImageUrl = (mod: LibraryModule) => {
    if (mod.imageMediaId) {
      const found = mediaAssets.find((a) => a.id === mod.imageMediaId);
      if (found) return found.url;
    }
    return mod.customImageUrl;
  };

  const resolveModuleSkills = (mod: LibraryModule): SkillDefinition[] => {
    if (mod.suggestedSkills.length > 0) {
      return mod.suggestedSkills
        .map((sid) => skillById.get(sid))
        .filter((s): s is SkillDefinition => Boolean(s));
    }
    return mod.relatedSkills.map((label, i) => ({
      id: `legacy-${i}`,
      label,
      group: 'Проектная деятельность',
      defaultColor: '#E2E8F0',
    }));
  };

  const moduleMatchesCategory = (mod: LibraryModule, catId: string) => {
    if (catId === 'all') return true;
    return mod.category === catId || Boolean(mod.filterCategories?.includes(catId));
  };

  const filteredModules = useMemo(() => {
    const q = search.trim().toLowerCase();
    return modules.filter((m) => {
      if (!showHidden && !m.isActive) return false;
      if (!moduleMatchesCategory(m, selectedCategoryId)) return false;
      if (
        selectedAgeGroup !== 'all' &&
        !getModuleAgeGroups(m).includes(selectedAgeGroup)
      ) {
        return false;
      }
      if (!q) return true;
      const skillLabels = resolveModuleSkills(m)
        .map((s) => s.label.toLowerCase())
        .join(' ');
      return (
        m.officialTitle.toLowerCase().includes(q) ||
        (m.shortTitle || '').toLowerCase().includes(q) ||
        m.displayTitle.toLowerCase().includes(q) ||
        m.title.toLowerCase().includes(q) ||
        m.subtitle.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q) ||
        skillLabels.includes(q)
      );
    });
  }, [
    modules,
    search,
    selectedCategoryId,
    selectedAgeGroup,
    showHidden,
    skillById,
  ]);

  const moduleCountByCategory = useMemo(() => {
    const counts: Record<string, number> = {};
    categories.forEach((c) => {
      counts[c.id] = modules.filter((m) => moduleMatchesCategory(m, c.id)).length;
    });
    return counts;
  }, [modules, categories]);

  const moduleCountByAgeGroup = useMemo(() => {
    const counts: Record<ModuleAgeGroup, number> = {
      '6-8': 0,
      '9-11': 0,
      '12-14': 0,
    };
    modules.forEach((m) => {
      getModuleAgeGroups(m).forEach((ag) => {
        counts[ag] = (counts[ag] ?? 0) + 1;
      });
    });
    return counts;
  }, [modules]);

  const moduleCountBySkillId = useMemo(() => {
    const counts: Record<string, number> = {};
    modules.forEach((m) => {
      m.suggestedSkills.forEach((sid) => {
        counts[sid] = (counts[sid] ?? 0) + 1;
      });
    });
    return counts;
  }, [modules]);

  const createNewModuleDraft = (): LibraryModule => {
    const now = new Date().toISOString();
    const defaultCat = categories[0]?.id ?? 'algorithms';
    const catColor = categoryById.get(defaultCat)?.accentColor ?? '#C9F3EE';
    return {
      id: `module-${Date.now()}`,
      officialTitle: 'Новый учебный модуль KIBERone',
      displayTitle: 'Новый модуль',
      shortTitle: 'Новый модуль',
      title: 'Новый учебный модуль KIBERone',
      subtitle: 'Технологии и практика',
      description: 'Краткое понятное описание освоенных инструментов и результатов.',
      category: defaultCat,
      categoryId: defaultCat,
      filterCategories: [],
      ageGroups: ['9-11'],
      illustrationType: 'svg',
      illustrationValue: 'algorithms',
      illustrationKey: 'algorithms',
      iconKey: 'rocket',
      visualMode: 'illustration',
      visualNotes: '',
      imageMediaId: null,
      cardBgColor: catColor,
      accentColor: catColor,
      suggestedSkills: ['skill-algorithmization', 'skill-project-work'],
      relatedSkills: ['Алгоритмическое мышление', 'Проектная деятельность'],
      badgeLabel: 'Модуль',
      isActive: true,
      isEditable: true,
      createdAt: now,
      updatedAt: now,
    };
  };

  const openModuleInEditor = (mod: LibraryModule) => {
    setEditingModule({
      ...mod,
      ageGroups: getModuleAgeGroups(mod),
      shortTitle: mod.shortTitle || mod.displayTitle,
      categoryId: mod.categoryId || mod.category,
    });
    setSubTab('editor');
  };

  const handleSaveEditedModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingModule || !editingModule.displayTitle.trim()) return;
    const syncedLabels = editingModule.suggestedSkills.map(
      (sid) => skillById.get(sid)?.label ?? sid
    );
    const shortTitle = editingModule.displayTitle.trim();
    const officialTitle =
      editingModule.officialTitle.trim() || shortTitle;
    const isImage =
      editingModule.visualMode === 'image' &&
      Boolean(editingModule.customImageUrl);
    const saved: LibraryModule = {
      ...editingModule,
      shortTitle,
      displayTitle: shortTitle,
      title: officialTitle,
      officialTitle,
      categoryId: editingModule.category,
      ageGroups:
        editingModule.ageGroups.length > 0
          ? editingModule.ageGroups
          : ['9-11'],
      illustrationType: isImage ? 'image' : 'svg',
      illustrationValue: isImage
        ? editingModule.customImageUrl || ''
        : editingModule.illustrationKey,
      relatedSkills: syncedLabels,
      updatedAt: new Date().toISOString(),
    };
    await onSaveModule(saved);
    setEditingModule(saved);
  };

  const renderCardVisual = (
    mod: LibraryModule,
    forcedMode?: 'auto' | ModuleVisualMode
  ) => {
    const imgUrl = resolveModuleImageUrl(mod);
    const mode =
      forcedMode && forcedMode !== 'auto'
        ? forcedMode
        : mod.visualMode ?? (imgUrl ? 'image' : 'illustration');

    if (mode === 'image' && imgUrl) {
      return (
        <img
          src={imgUrl}
          alt={mod.displayTitle}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover"
        />
      );
    }
    if (mode === 'icon') {
      return (
        <div className="w-12 h-12 rounded-2xl bg-white/85 border-[1.5px] border-[#18181B] shadow-[0_2px_0_rgba(24,24,27,0.16)] flex items-center justify-center">
          <ModuleLucideIcon iconKey={mod.iconKey} className="w-7 h-7 text-[#18181B]" />
        </div>
      );
    }
    return (
      <div className="w-36 h-24">
        <ModuleSvgIllustration type={mod.illustrationKey} />
      </div>
    );
  };

  const subTabs: Array<{
    id: CurriculumSubTab;
    label: string;
    icon: React.ReactNode;
    count?: number;
  }> = [
    {
      id: 'catalog',
      label: 'Каталог модулей',
      icon: <BookOpen className="w-3.5 h-3.5" />,
      count: modules.length,
    },
    {
      id: 'categories',
      label: 'Категории модулей',
      icon: <FolderOpen className="w-3.5 h-3.5" />,
      count: categories.length,
    },
    {
      id: 'skills',
      label: 'Библиотека навыков',
      icon: <Tag className="w-3.5 h-3.5" />,
      count: skillsCatalog.length,
    },
    {
      id: 'cards',
      label: 'Визуальные карточки',
      icon: <Palette className="w-3.5 h-3.5" />,
    },
    {
      id: 'editor',
      label: 'Редактор модулей',
      icon: <Edit3 className="w-3.5 h-3.5" />,
    },
    {
      id: 'groupTemplates',
      label: 'Групповые шаблоны',
      icon: <Users className="w-3.5 h-3.5" />,
      count: groupTemplates.length,
    },
  ];

  return (
    <div className="min-h-screen bg-[#F6F6F3] text-[#18181B] flex flex-col">
      <AppHeader
        activeTab="modules"
        onNavigate={onNavigate}
        onCreateGroup={onCreateGroup}
        onOpenMediaLibrary={onOpenMediaLibrary}
      />

      <main className="flex-1 max-w-[1320px] w-full mx-auto px-6 py-8 space-y-6">
        {/* Page Heading */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
              Учебная программа KIBERone
            </h1>
            <p className="text-sm text-zinc-500 mt-1">
              Единая библиотека модулей, категорий, навыков, визуальных карточек и групповых шаблонов обучения
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => openModuleInEditor(createNewModuleDraft())}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Новый модуль</span>
            </button>
          </div>
        </div>

        {/* 6 Sub-tabs */}
        <div className="flex items-center gap-1.5 p-1.5 bg-white border border-zinc-200 rounded-xl overflow-x-auto">
          {subTabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setSubTab(t.id)}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                subTab === t.id
                  ? 'bg-zinc-900 text-white'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'
              }`}
            >
              {t.icon}
              <span>{t.label}</span>
              {typeof t.count === 'number' && (
                <span
                  className={`font-mono text-[10px] px-1.5 py-0.5 rounded ${
                    subTab === t.id
                      ? 'bg-white/15 text-white'
                      : 'bg-zinc-100 text-zinc-500'
                  }`}
                >
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* SUB-TAB 1: КАТАЛОГ МОДУЛЕЙ */}
        {subTab === 'catalog' && (
          <div className="space-y-5">
            <div className="bg-white border border-zinc-200 rounded-2xl p-4 space-y-3">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Поиск по названию, описанию или навыкам..."
                    className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#F9F9F7] border border-zinc-200 text-xs focus:outline-none focus:border-[#0D9488]"
                  />
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer text-zinc-600">
                    <input
                      type="checkbox"
                      checked={showHidden}
                      onChange={(e) => setShowHidden(e.target.checked)}
                    />
                    <span>Показывать скрытые</span>
                  </label>
                  <span className="font-mono text-[11px] text-zinc-500">
                    Найдено: {filteredModules.length}
                  </span>
                </div>
              </div>

              {/* Age Group Filter Strip */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[11px] font-semibold text-zinc-500 mr-1">
                  Возраст:
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedAgeGroup('all')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                    selectedAgeGroup === 'all'
                      ? 'bg-[#0D9488] text-white border-[#0D9488]'
                      : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50'
                  }`}
                >
                  Все возрасты ({modules.length})
                </button>
                {MODULE_AGE_GROUP_OPTIONS.map((ag) => (
                  <button
                    key={ag.id}
                    type="button"
                    onClick={() => setSelectedAgeGroup(ag.id)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                      selectedAgeGroup === ag.id
                        ? 'bg-[#0D9488] text-white border-[#0D9488]'
                        : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50'
                    }`}
                  >
                    <span>{ag.label}</span>
                    <span className="font-mono text-[10px] opacity-75">
                      {moduleCountByAgeGroup[ag.id] ?? 0}
                    </span>
                  </button>
                ))}
              </div>

              {/* 8 Category Filter Strip */}
              <div className="flex flex-wrap gap-1.5 pt-1 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setSelectedCategoryId('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    selectedCategoryId === 'all'
                      ? 'bg-zinc-900 text-white border-zinc-900'
                      : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50'
                  }`}
                >
                  Все ({modules.length})
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategoryId(cat.id)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      selectedCategoryId === cat.id
                        ? 'bg-zinc-900 text-white border-zinc-900'
                        : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50'
                    }`}
                  >
                    <span
                      style={{ backgroundColor: cat.accentColor }}
                      className="w-2.5 h-2.5 rounded-full border border-black/15 shrink-0"
                    />
                    <span>{cat.shortName}</span>
                    <span className="font-mono text-[10px] opacity-70">
                      {moduleCountByCategory[cat.id] ?? 0}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredModules.map((mod) => {
                const cat = categoryById.get(mod.category);
                const resolvedSkills = resolveModuleSkills(mod);
                const modAges = getModuleAgeGroups(mod);
                return (
                  <div
                    key={mod.id}
                    className={`bg-white border border-zinc-200 rounded-2xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.03)] flex flex-col justify-between gap-4 ${
                      !mod.isActive ? 'opacity-65' : ''
                    }`}
                  >
                    <div className="space-y-3">
                      <div
                        style={{ backgroundColor: mod.cardBgColor }}
                        className="h-28 rounded-xl border border-black/10 overflow-hidden flex items-center justify-center p-2 relative"
                      >
                        {renderCardVisual(mod)}
                        {!mod.isActive && (
                          <span className="absolute top-2 right-2 text-[10px] font-semibold px-2 py-0.5 rounded bg-zinc-900/80 text-white">
                            Скрыт
                          </span>
                        )}
                      </div>

                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h2 className="text-sm font-bold text-zinc-900 leading-snug">
                            {mod.officialTitle || mod.title}
                          </h2>
                          {mod.badgeLabel && (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#F6F6F3] border border-zinc-200 text-zinc-600 shrink-0">
                              {mod.badgeLabel}
                            </span>
                          )}
                        </div>
                        {(mod.shortTitle || mod.displayTitle) !==
                          (mod.officialTitle || mod.title) && (
                          <div className="text-[11px] text-zinc-500 mt-0.5">
                            Карточка: {mod.shortTitle || mod.displayTitle}
                          </div>
                        )}
                        <div className="text-xs font-medium text-[#0D9488] mt-1">
                          {mod.subtitle} {cat ? `· ${cat.shortName}` : ''}
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {modAges.map((ag) => (
                            <span
                              key={ag}
                              className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[#F0FDFA] text-[#0F766E] border border-[#99F6E4]"
                            >
                              {ag} лет
                            </span>
                          ))}
                        </div>
                        <p className="text-xs text-zinc-600 mt-1.5 line-clamp-2">
                          {mod.description}
                        </p>
                      </div>

                      {resolvedSkills.length > 0 && (
                        <div className="space-y-1 pt-1">
                          <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                            Предлагаемые навыки:
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {resolvedSkills.slice(0, 5).map((sk) => (
                              <span
                                key={sk.id}
                                className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-700"
                              >
                                {sk.label}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-zinc-100 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => openModuleInEditor(mod)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-xs font-medium text-zinc-800"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Редактировать</span>
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() =>
                            onSaveModule({
                              ...mod,
                              isActive: !mod.isActive,
                              updatedAt: new Date().toISOString(),
                            })
                          }
                          className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50"
                          title={mod.isActive ? 'Скрыть модуль' : 'Активировать модуль'}
                        >
                          {mod.isActive ? (
                            <Eye className="w-3.5 h-3.5" />
                          ) : (
                            <EyeOff className="w-3.5 h-3.5 text-amber-600" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const now = new Date().toISOString();
                            onSaveModule({
                              ...mod,
                              id: `module-${Date.now()}`,
                              displayTitle: `${mod.displayTitle} (копия)`,
                              shortTitle: `${mod.shortTitle || mod.displayTitle} (копия)`,
                              title: `${mod.officialTitle || mod.title} (копия)`,
                              officialTitle: `${mod.officialTitle} (копия)`,
                              createdAt: now,
                              updatedAt: now,
                            });
                          }}
                          className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50"
                          title="Дублировать"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteModule(mod.id)}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50"
                          title="Удалить"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SUB-TAB 2: КАТЕГОРИИ МОДУЛЕЙ */}
        {subTab === 'categories' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-zinc-500">
                Категории определяют группировку модулей в программе и цветовую палитру карточек по умолчанию.
              </p>
              <button
                type="button"
                onClick={() =>
                  setEditingCategory({
                    id: `cat-${Date.now()}`,
                    name: 'Новая категория',
                    shortName: 'Категория',
                    description: 'Описание направления.',
                    accentColor: '#E0F2FE',
                    isBuiltIn: false,
                    order: categories.length + 1,
                  })
                }
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-zinc-900 text-white text-xs font-semibold"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Добавить категорию</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="bg-white border border-zinc-200 rounded-2xl p-5 space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span
                          style={{ backgroundColor: cat.accentColor }}
                          className="w-6 h-6 rounded-lg border border-black/15 shrink-0"
                        />
                        <div>
                          <h3 className="text-sm font-bold text-zinc-900">
                            {cat.name}
                          </h3>
                          <div className="text-[11px] font-mono text-zinc-400">
                            {cat.shortName} · модулей: {moduleCountByCategory[cat.id] ?? 0}
                          </div>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-zinc-600">{cat.description}</p>
                  </div>

                  <div className="pt-3 border-t border-zinc-100 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCategoryId(cat.id);
                        setSubTab('catalog');
                      }}
                      className="text-xs font-semibold text-[#0D9488] hover:underline"
                    >
                      Показать модули
                    </button>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setEditingCategory({ ...cat })}
                        className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50"
                        title="Редактировать"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      {!cat.isBuiltIn && (
                        <button
                          type="button"
                          onClick={() => onDeleteCategory(cat.id)}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600"
                          title="Удалить"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SUB-TAB 3: БИБЛИОТЕКА НАВЫКОВ */}
        {subTab === 'skills' && (
          <div className="space-y-5">
            <div className="bg-white border border-zinc-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={skillsSearch}
                  onChange={(e) => setSkillsSearch(e.target.value)}
                  placeholder="Поиск навыка или группы..."
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#F9F9F7] border border-zinc-200 text-xs focus:outline-none focus:border-[#0D9488]"
                />
              </div>
              <button
                type="button"
                onClick={() =>
                  setEditingSkill({
                    id: `skill-custom-${Date.now()}`,
                    label: 'Новый навык',
                    group: 'Программирование',
                    defaultColor: '#7DD3FC',
                    isBuiltIn: false,
                  })
                }
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-zinc-900 text-white text-xs font-semibold"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Добавить навык</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {SKILL_GROUPS.map((groupName) => {
                const q = skillsSearch.trim().toLowerCase();
                const items = skillsCatalog.filter(
                  (s) =>
                    s.group === groupName &&
                    (!q ||
                      s.label.toLowerCase().includes(q) ||
                      s.group.toLowerCase().includes(q))
                );
                if (items.length === 0 && q) return null;
                return (
                  <div
                    key={groupName}
                    className="bg-white border border-zinc-200 rounded-2xl p-5 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-zinc-900">{groupName}</h3>
                      <span className="font-mono text-[11px] text-zinc-400">
                        {items.length} шт.
                      </span>
                    </div>
                    <div className="space-y-1.5">
                      {items.map((sk) => (
                        <div
                          key={sk.id}
                          className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl border border-zinc-100 bg-[#F9F9F7]"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span
                              style={{ backgroundColor: sk.defaultColor }}
                              className="w-3.5 h-3.5 rounded-full border border-black/15 shrink-0"
                            />
                            <span className="text-xs font-semibold text-zinc-900 truncate">
                              {sk.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[10px] font-mono text-zinc-500">
                              модулей: {moduleCountBySkillId[sk.id] ?? 0}
                            </span>
                            <button
                              type="button"
                              onClick={() => setEditingSkill({ ...sk })}
                              className="p-1 text-zinc-400 hover:text-zinc-900"
                              title="Редактировать"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            {!sk.isBuiltIn && (
                              <button
                                type="button"
                                onClick={() => onDeleteSkill(sk.id)}
                                className="p-1 text-zinc-400 hover:text-red-600"
                                title="Удалить"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SUB-TAB 4: БИБЛИОТЕКА ВИЗУАЛЬНЫХ КАРТОЧЕК */}
        {subTab === 'cards' && (
          <div className="space-y-5">
            <div className="bg-white border border-zinc-200 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="text-xs text-zinc-600">
                Предпросмотр карточек для первой страницы журнала. Выберите режим отображения или привяжите графику из медиатеки.
              </div>
              <div className="flex items-center gap-1 p-1 bg-zinc-100 rounded-lg shrink-0 text-xs">
                {(
                  [
                    { id: 'auto', label: 'Как в модуле' },
                    { id: 'illustration', label: 'SVG-иллюстрации' },
                    { id: 'icon', label: 'Иконки (SVG)' },
                    { id: 'image', label: 'Картинки из медиатеки' },
                  ] as const
                ).map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setCardsPreviewMode(m.id)}
                    className={`px-2.5 py-1 rounded-md font-medium whitespace-nowrap ${
                      cardsPreviewMode === m.id
                        ? 'bg-white text-zinc-900 shadow-xs'
                        : 'text-zinc-600'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {modules.map((mod) => {
                const imgUrl = resolveModuleImageUrl(mod);
                return (
                  <div
                    key={mod.id}
                    className="bg-white border-[1.5px] border-[#18181B] rounded-xl p-3 shadow-[0_3px_10px_rgba(0,0,0,0.06)] flex flex-col justify-between gap-3"
                  >
                    <div>
                      <div
                        style={{ backgroundColor: mod.cardBgColor }}
                        className="h-24 rounded-lg border border-black/10 overflow-hidden flex items-center justify-center mb-2.5"
                      >
                        {renderCardVisual(mod, cardsPreviewMode)}
                      </div>
                      <div className="text-center space-y-0.5">
                        <div className="text-sm font-extrabold text-[#111827] leading-tight">
                          {mod.displayTitle}
                        </div>
                        <div className="text-[11px] font-bold text-[#111827]/80">
                          {mod.subtitle}
                        </div>
                      </div>
                      {mod.visualNotes && (
                        <div className="mt-2 text-[10px] text-zinc-500 text-center line-clamp-2">
                          Идея графики: {mod.visualNotes}
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-zinc-100 flex items-center justify-between gap-1.5 text-[11px]">
                      <button
                        type="button"
                        onClick={() =>
                          onOpenMediaPicker('modules', (url, asset) => {
                            onSaveModule({
                              ...mod,
                              visualMode: 'image',
                              imageMediaId: asset?.id ?? null,
                              customImageUrl: url,
                              updatedAt: new Date().toISOString(),
                            });
                          })
                        }
                        className="flex-1 inline-flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-50 font-medium text-zinc-800"
                      >
                        <ImageIcon className="w-3 h-3" />
                        <span>{imgUrl ? 'Заменить фото' : 'Назначить фото'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => openModuleInEditor(mod)}
                        className="p-1.5 rounded-lg border border-zinc-200 text-zinc-600 hover:text-zinc-900"
                        title="Открыть в редакторе"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SUB-TAB 5: РЕДАКТОР МОДУЛЕЙ */}
        {subTab === 'editor' && (
          <div className="grid grid-cols-1 lg:grid-cols-[310px_1fr] gap-6 items-start">
            {/* Left Module Selector List */}
            <aside className="bg-white border border-zinc-200 rounded-2xl p-3 space-y-2 max-h-[75vh] flex flex-col">
              <div className="flex items-center justify-between px-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                  Модули ({modules.length})
                </span>
                <button
                  type="button"
                  onClick={() => setEditingModule(createNewModuleDraft())}
                  className="text-xs font-semibold text-[#0D9488] hover:underline"
                >
                  + Создать
                </button>
              </div>
              <div className="overflow-y-auto space-y-1 pr-1">
                {modules.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setEditingModule({ ...m })}
                    className={`w-full text-left px-3 py-2 rounded-xl border text-xs transition-colors ${
                      editingModule?.id === m.id
                        ? 'border-[#0D9488] bg-[#F0FDFA]'
                        : 'border-zinc-100 hover:border-zinc-200 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1.5">
                      <span className="font-bold text-zinc-900 truncate">
                        {m.displayTitle}
                      </span>
                    </div>
                    <div className="text-[11px] text-zinc-500 truncate">
                      {m.subtitle}
                    </div>
                  </button>
                ))}
              </div>
            </aside>

            {/* Right Module Form */}
            {editingModule ? (
              <form
                onSubmit={handleSaveEditedModule}
                className="bg-white border border-zinc-200 rounded-2xl p-6 space-y-5 text-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-100">
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-[#0D9488]">
                      Редактор модуля программы
                    </div>
                    <h2 className="text-lg font-bold text-zinc-900 mt-0.5">
                      {editingModule.displayTitle}
                    </h2>
                    <p className="text-[11px] text-zinc-500">
                      Изменения сохраняются в библиотеке и не меняют уже созданные журналы.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 cursor-pointer font-medium">
                      <input
                        type="checkbox"
                        checked={editingModule.isActive}
                        onChange={(e) =>
                          setEditingModule({
                            ...editingModule,
                            isActive: e.target.checked,
                          })
                        }
                      />
                      <span>Активен</span>
                    </label>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-lg bg-[#0D9488] hover:bg-[#0F766E] text-white font-semibold"
                    >
                      Сохранить изменения
                    </button>
                  </div>
                </div>

                {/* Live Card Preview + Core Fields */}
                <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-5 items-start">
                  <div className="space-y-2">
                    <div className="font-semibold text-zinc-700">
                      Вид на странице А4
                    </div>
                    <div className="bg-white border-[1.5px] border-[#18181B] rounded-xl p-2.5 shadow-[0_4px_10px_rgba(0,0,0,0.08)]">
                      <div
                        style={{ backgroundColor: editingModule.cardBgColor }}
                        className="h-24 rounded-lg border border-black/10 overflow-hidden flex items-center justify-center mb-2"
                      >
                        {renderCardVisual(editingModule)}
                      </div>
                      <div className="text-center px-1">
                        <div className="font-extrabold text-[14px] text-[#111827] leading-tight">
                          {editingModule.displayTitle}
                        </div>
                        <div className="font-bold text-[11px] text-[#111827]/85 mt-0.5">
                          {editingModule.subtitle}
                        </div>
                        <p className="text-[10px] text-[#374151] mt-1 line-clamp-3">
                          {editingModule.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <label className="block">
                        <span className="font-semibold text-zinc-700">
                          Короткое название (для карточки в журнале)
                        </span>
                        <input
                          type="text"
                          required
                          value={editingModule.displayTitle}
                          onChange={(e) =>
                            setEditingModule({
                              ...editingModule,
                              displayTitle: e.target.value,
                              shortTitle: e.target.value,
                            })
                          }
                          className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-1.5 font-semibold"
                        />
                      </label>
                      <label className="block">
                        <span className="font-semibold text-zinc-700">
                          Подзаголовок
                        </span>
                        <input
                          type="text"
                          value={editingModule.subtitle}
                          onChange={(e) =>
                            setEditingModule({
                              ...editingModule,
                              subtitle: e.target.value,
                            })
                          }
                          className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-1.5"
                        />
                      </label>
                    </div>

                    <label className="block">
                      <span className="font-semibold text-zinc-700">
                        Официальное название в программе KIBERone
                      </span>
                      <input
                        type="text"
                        value={editingModule.officialTitle}
                        onChange={(e) =>
                          setEditingModule({
                            ...editingModule,
                            officialTitle: e.target.value,
                            title: e.target.value,
                          })
                        }
                        className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-1.5"
                      />
                    </label>

                    <label className="block">
                      <span className="font-semibold text-zinc-700">
                        Описание для журнала (родителям и ученику)
                      </span>
                      <textarea
                        rows={3}
                        value={editingModule.description}
                        onChange={(e) =>
                          setEditingModule({
                            ...editingModule,
                            description: e.target.value,
                          })
                        }
                        className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-1.5"
                      />
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <label className="block">
                        <span className="font-semibold text-zinc-700">
                          Основная категория
                        </span>
                        <select
                          value={editingModule.category}
                          onChange={(e) =>
                            setEditingModule({
                              ...editingModule,
                              category: e.target.value,
                              categoryId: e.target.value,
                            })
                          }
                          className="mt-1 w-full rounded-lg border border-zinc-200 px-2.5 py-1.5 bg-white"
                        >
                          {categories.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="block">
                        <span className="font-semibold text-zinc-700">
                          Метка / тег карточки
                        </span>
                        <input
                          type="text"
                          value={editingModule.badgeLabel || ''}
                          onChange={(e) =>
                            setEditingModule({
                              ...editingModule,
                              badgeLabel: e.target.value,
                            })
                          }
                          className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-1.5"
                        />
                      </label>
                    </div>

                    {/* Age Groups Checkboxes */}
                    <div className="space-y-1.5">
                      <span className="font-semibold text-zinc-700 block">
                        Возрастные группы (из программы обучения)
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {MODULE_AGE_GROUP_OPTIONS.map((ag) => {
                          const currentAges = getModuleAgeGroups(editingModule);
                          const checked = currentAges.includes(ag.id);
                          return (
                            <label
                              key={ag.id}
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border cursor-pointer text-xs font-medium ${
                                checked
                                  ? 'border-[#0D9488] bg-[#F0FDFA] text-[#0F766E]'
                                  : 'border-zinc-200 bg-white text-zinc-700'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => {
                                  const nextAges = checked
                                    ? currentAges.filter((id) => id !== ag.id)
                                    : [...currentAges, ag.id];
                                  setEditingModule({
                                    ...editingModule,
                                    ageGroups: nextAges,
                                  });
                                }}
                              />
                              <span>{ag.label}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    {/* Visual Settings */}
                    <div className="p-3.5 rounded-xl bg-[#F9F9F7] border border-zinc-200 space-y-3">
                      <div className="font-semibold text-zinc-800">
                        Оформление визуальной карточки
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        <label className="block">
                          <span className="text-[11px] font-medium text-zinc-600">
                            Режим графики
                          </span>
                          <select
                            value={editingModule.visualMode ?? 'illustration'}
                            onChange={(e) =>
                              setEditingModule({
                                ...editingModule,
                                visualMode: e.target.value as ModuleVisualMode,
                              })
                            }
                            className="mt-1 w-full rounded-lg border border-zinc-200 px-2 py-1.5 bg-white"
                          >
                            <option value="illustration">SVG-иллюстрация</option>
                            <option value="icon">Иконка (SVG-библиотека)</option>
                            <option value="image">Своя картинка</option>
                          </select>
                        </label>

                        <label className="block">
                          <span className="text-[11px] font-medium text-zinc-600">
                            SVG-иллюстрация
                          </span>
                          <select
                            value={editingModule.illustrationKey}
                            onChange={(e) =>
                              setEditingModule({
                                ...editingModule,
                                illustrationKey: e.target
                                  .value as ModuleIllustrationKey,
                              })
                            }
                            className="mt-1 w-full rounded-lg border border-zinc-200 px-2 py-1.5 bg-white"
                          >
                            {MODULE_ILLUSTRATION_OPTIONS.map((opt) => (
                              <option key={opt.key} value={opt.key}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </label>

                        <label className="block">
                          <span className="text-[11px] font-medium text-zinc-600">
                            Векторная иконка
                          </span>
                          <select
                            value={editingModule.iconKey}
                            onChange={(e) =>
                              setEditingModule({
                                ...editingModule,
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

                        <label className="block">
                          <span className="text-[11px] font-medium text-zinc-600">
                            Цвет плашки
                          </span>
                          <input
                            type="color"
                            value={editingModule.cardBgColor}
                            onChange={(e) =>
                              setEditingModule({
                                ...editingModule,
                                cardBgColor: e.target.value,
                                accentColor: e.target.value,
                              })
                            }
                            className="mt-1 w-full h-8 rounded-lg border border-zinc-200 cursor-pointer"
                          />
                        </label>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            onOpenMediaPicker('modules', (url, asset) =>
                              setEditingModule((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      visualMode: 'image',
                                      imageMediaId: asset?.id ?? null,
                                      customImageUrl: url,
                                    }
                                  : null
                              )
                            )
                          }
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 font-medium"
                        >
                          <ImageIcon className="w-3.5 h-3.5" />
                          <span>Выбрать изображение из медиатеки</span>
                        </button>
                        {(editingModule.customImageUrl ||
                          editingModule.imageMediaId) && (
                          <button
                            type="button"
                            onClick={() =>
                              setEditingModule({
                                ...editingModule,
                                visualMode: 'illustration',
                                imageMediaId: null,
                                customImageUrl: undefined,
                              })
                            }
                            className="text-zinc-500 hover:underline"
                          >
                            Отвязать изображение
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Suggested Skills Assignment */}
                <div className="pt-4 border-t border-zinc-200 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="font-bold text-zinc-900">
                        Предлагаемые навыки модуля (для проверки наставником)
                      </div>
                      <p className="text-[11px] text-zinc-500">
                        При добавлении модуля в журнал эти навыки появятся в списке на подтверждение, но не отметятся как освоенные автоматически.
                      </p>
                    </div>
                    <input
                      type="text"
                      value={skillPickerSearch}
                      onChange={(e) => setSkillPickerSearch(e.target.value)}
                      placeholder="Фильтр навыков..."
                      className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs w-52"
                    />
                  </div>

                  <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto p-2 rounded-xl border border-zinc-200 bg-[#F9F9F7]">
                    {skillsCatalog
                      .filter(
                        (sk) =>
                          !skillPickerSearch.trim() ||
                          sk.label
                            .toLowerCase()
                            .includes(skillPickerSearch.trim().toLowerCase())
                      )
                      .map((sk) => {
                        const active = editingModule.suggestedSkills.includes(
                          sk.id
                        );
                        return (
                          <button
                            key={sk.id}
                            type="button"
                            onClick={() =>
                              setEditingModule({
                                ...editingModule,
                                suggestedSkills: active
                                  ? editingModule.suggestedSkills.filter(
                                      (id) => id !== sk.id
                                    )
                                  : [...editingModule.suggestedSkills, sk.id],
                              })
                            }
                            className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-colors ${
                              active
                                ? 'bg-zinc-900 text-white border-zinc-900'
                                : 'bg-white text-zinc-700 border-zinc-200 hover:border-zinc-400'
                            }`}
                          >
                            {sk.label}
                          </button>
                        );
                      })}
                  </div>
                </div>
              </form>
            ) : (
              <div className="bg-white border border-zinc-200 rounded-2xl p-12 text-center text-xs text-zinc-500">
                Выберите модуль слева или создайте новый.
              </div>
            )}
          </div>
        )}

        {/* SUB-TAB 6: ГРУППОВЫЕ ШАБЛОНЫ ОБУЧЕНИЯ */}
        {subTab === 'groupTemplates' && (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <p className="text-xs text-zinc-500">
                Готовые наборы модулей по возрастным трекам для быстрого массового создания журналов группы.
              </p>
              <button
                type="button"
                onClick={() => {
                  const now = new Date().toISOString();
                  setEditingGroupTemplate({
                    id: `gtpl-${Date.now()}`,
                    name: 'Новый групповой шаблон',
                    description: 'Набор модулей на учебный период.',
                    ageCategory: '11-13',
                    paletteId: DESIGN_PALETTES[0].id,
                    moduleIds: modules.slice(0, 3).map((m) => m.id),
                    isBuiltIn: false,
                    createdAt: now,
                    updatedAt: now,
                  });
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-zinc-900 text-white text-xs font-semibold shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Создать групповой шаблон</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {groupTemplates.map((tpl) => {
                const tplModules = tpl.moduleIds
                  .map((mid) => modules.find((m) => m.id === mid))
                  .filter((m): m is LibraryModule => Boolean(m));
                return (
                  <div
                    key={tpl.id}
                    className="bg-white border border-zinc-200 rounded-2xl p-5 space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="text-base font-bold text-zinc-900">
                            {tpl.name}
                          </h3>
                          <div className="text-[11px] font-medium text-[#0D9488] mt-0.5">
                            Возраст: {tpl.ageCategory} лет · Модулей: {tplModules.length}
                          </div>
                        </div>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-zinc-100 text-zinc-600">
                          {tpl.isBuiltIn ? 'Встроенный' : 'Пользовательский'}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-600">{tpl.description}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {tplModules.map((m) => (
                          <span
                            key={m.id}
                            style={{ backgroundColor: m.cardBgColor }}
                            className="text-[11px] font-semibold px-2.5 py-1 rounded-lg border border-black/10 text-zinc-900"
                          >
                            {m.displayTitle}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-zinc-100 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => onNavigate('home')}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-semibold"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Использовать в группах</span>
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setEditingGroupTemplate({ ...tpl })}
                          className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50"
                          title="Редактировать"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        {!tpl.isBuiltIn && (
                          <button
                            type="button"
                            onClick={() => onDeleteGroupTemplate(tpl.id)}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600"
                            title="Удалить"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* CATEGORY MODAL */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 bg-zinc-900/45 flex items-center justify-center p-6">
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!editingCategory.name.trim()) return;
              await onSaveCategory(editingCategory);
              setEditingCategory(null);
            }}
            className="bg-white border border-zinc-200 rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4 text-xs"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-zinc-900">Категория модулей</h3>
              <button
                type="button"
                onClick={() => setEditingCategory(null)}
                className="p-1 text-zinc-400 hover:text-zinc-900"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <label className="block">
              <span className="font-semibold text-zinc-700">Полное название</span>
              <input
                type="text"
                required
                value={editingCategory.name}
                onChange={(e) =>
                  setEditingCategory({ ...editingCategory, name: e.target.value })
                }
                className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 font-semibold"
              />
            </label>
            <div className="grid grid-cols-[1fr_72px] gap-3">
              <label className="block">
                <span className="font-semibold text-zinc-700">Короткое имя</span>
                <input
                  type="text"
                  required
                  value={editingCategory.shortName}
                  onChange={(e) =>
                    setEditingCategory({
                      ...editingCategory,
                      shortName: e.target.value,
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2"
                />
              </label>
              <label className="block">
                <span className="font-semibold text-zinc-700">Цвет</span>
                <input
                  type="color"
                  value={editingCategory.accentColor}
                  onChange={(e) =>
                    setEditingCategory({
                      ...editingCategory,
                      accentColor: e.target.value,
                    })
                  }
                  className="mt-1 w-full h-9 rounded-lg border border-zinc-200 cursor-pointer"
                />
              </label>
            </div>
            <label className="block">
              <span className="font-semibold text-zinc-700">Описание</span>
              <textarea
                rows={2}
                value={editingCategory.description}
                onChange={(e) =>
                  setEditingCategory({
                    ...editingCategory,
                    description: e.target.value,
                  })
                }
                className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2"
              />
            </label>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingCategory(null)}
                className="px-4 py-2 rounded-lg border border-zinc-200"
              >
                Отмена
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-[#0D9488] text-white font-semibold"
              >
                Сохранить
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SKILL DEFINITION MODAL */}
      {editingSkill && (
        <div className="fixed inset-0 z-50 bg-zinc-900/45 flex items-center justify-center p-6">
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!editingSkill.label.trim()) return;
              await onSaveSkill(editingSkill);
              setEditingSkill(null);
            }}
            className="bg-white border border-zinc-200 rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4 text-xs"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-zinc-900">Навык справочника</h3>
              <button
                type="button"
                onClick={() => setEditingSkill(null)}
                className="p-1 text-zinc-400 hover:text-zinc-900"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <label className="block">
              <span className="font-semibold text-zinc-700">Формулировка навыка</span>
              <input
                type="text"
                required
                value={editingSkill.label}
                onChange={(e) =>
                  setEditingSkill({ ...editingSkill, label: e.target.value })
                }
                className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 font-semibold"
              />
            </label>
            <div className="grid grid-cols-[1fr_72px] gap-3">
              <label className="block">
                <span className="font-semibold text-zinc-700">Тематическая группа</span>
                <select
                  value={editingSkill.group}
                  onChange={(e) =>
                    setEditingSkill({ ...editingSkill, group: e.target.value })
                  }
                  className="mt-1 w-full rounded-lg border border-zinc-200 px-2.5 py-2 bg-white"
                >
                  {SKILL_GROUPS.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="font-semibold text-zinc-700">Цвет</span>
                <input
                  type="color"
                  value={editingSkill.defaultColor}
                  onChange={(e) =>
                    setEditingSkill({
                      ...editingSkill,
                      defaultColor: e.target.value,
                    })
                  }
                  className="mt-1 w-full h-9 rounded-lg border border-zinc-200 cursor-pointer"
                />
              </label>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingSkill(null)}
                className="px-4 py-2 rounded-lg border border-zinc-200"
              >
                Отмена
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-[#0D9488] text-white font-semibold"
              >
                Сохранить
              </button>
            </div>
          </form>
        </div>
      )}

      {/* GROUP TEMPLATE MODAL */}
      {editingGroupTemplate && (
        <div className="fixed inset-0 z-50 bg-zinc-900/45 flex items-center justify-center p-6">
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!editingGroupTemplate.name.trim()) return;
              await onSaveGroupTemplate({
                ...editingGroupTemplate,
                updatedAt: new Date().toISOString(),
              });
              setEditingGroupTemplate(null);
            }}
            className="bg-white border border-zinc-200 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[88vh] flex flex-col overflow-hidden text-xs"
          >
            <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#0D9488]" />
                <h3 className="text-sm font-bold text-zinc-900">
                  Групповой шаблон обучения
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingGroupTemplate(null)}
                className="p-1 text-zinc-400 hover:text-zinc-900"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <label className="block">
                <span className="font-semibold text-zinc-700">Название шаблона</span>
                <input
                  type="text"
                  required
                  value={editingGroupTemplate.name}
                  onChange={(e) =>
                    setEditingGroupTemplate({
                      ...editingGroupTemplate,
                      name: e.target.value,
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 font-semibold"
                />
              </label>

              <label className="block">
                <span className="font-semibold text-zinc-700">Описание</span>
                <input
                  type="text"
                  value={editingGroupTemplate.description}
                  onChange={(e) =>
                    setEditingGroupTemplate({
                      ...editingGroupTemplate,
                      description: e.target.value,
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2"
                />
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="font-semibold text-zinc-700">
                    Возрастная группа
                  </span>
                  <select
                    value={editingGroupTemplate.ageCategory}
                    onChange={(e) =>
                      setEditingGroupTemplate({
                        ...editingGroupTemplate,
                        ageCategory: e.target.value as AgeCategory,
                      })
                    }
                    className="mt-1 w-full rounded-lg border border-zinc-200 px-2.5 py-2 bg-white"
                  >
                    <option value="8-10">8–10 лет</option>
                    <option value="11-13">11–13 лет</option>
                    <option value="14-15">14–15 лет</option>
                  </select>
                </label>

                <label className="block">
                  <span className="font-semibold text-zinc-700">
                    Палитра оформления
                  </span>
                  <select
                    value={editingGroupTemplate.paletteId}
                    onChange={(e) =>
                      setEditingGroupTemplate({
                        ...editingGroupTemplate,
                        paletteId: e.target.value,
                      })
                    }
                    className="mt-1 w-full rounded-lg border border-zinc-200 px-2.5 py-2 bg-white"
                  >
                    {DESIGN_PALETTES.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="space-y-2 pt-2 border-t border-zinc-100">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-zinc-700">
                    Модули шаблона ({editingGroupTemplate.moduleIds.length})
                  </span>
                  <input
                    type="text"
                    value={tplModSearch}
                    onChange={(e) => setTplModSearch(e.target.value)}
                    placeholder="Поиск модуля..."
                    className="rounded-lg border border-zinc-200 px-2.5 py-1 text-xs w-48"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-56 overflow-y-auto p-1">
                  {modules
                    .filter(
                      (m) =>
                        !tplModSearch.trim() ||
                        m.displayTitle
                          .toLowerCase()
                          .includes(tplModSearch.trim().toLowerCase()) ||
                        m.officialTitle
                          .toLowerCase()
                          .includes(tplModSearch.trim().toLowerCase())
                    )
                    .map((m) => {
                      const active = editingGroupTemplate.moduleIds.includes(
                        m.id
                      );
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() =>
                            setEditingGroupTemplate({
                              ...editingGroupTemplate,
                              moduleIds: active
                                ? editingGroupTemplate.moduleIds.filter(
                                    (id) => id !== m.id
                                  )
                                : [...editingGroupTemplate.moduleIds, m.id],
                            })
                          }
                          className={`text-left px-3 py-2 rounded-xl border flex items-center justify-between gap-2 ${
                            active
                              ? 'border-[#0D9488] bg-[#F0FDFA]'
                              : 'border-zinc-200 bg-white'
                          }`}
                        >
                          <div className="min-w-0">
                            <div className="font-semibold text-zinc-900 truncate">
                              {m.displayTitle}
                            </div>
                            <div className="text-[10px] text-zinc-500 truncate">
                              {m.subtitle}
                            </div>
                          </div>
                          {active && (
                            <Check className="w-3.5 h-3.5 text-[#0D9488] shrink-0" />
                          )}
                        </button>
                      );
                    })}
                </div>
              </div>
            </div>

            <div className="px-6 py-3.5 border-t border-zinc-200 bg-[#F9F9F7] flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingGroupTemplate(null)}
                className="px-4 py-2 rounded-lg border border-zinc-200 bg-white"
              >
                Отмена
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-[#0D9488] text-white font-semibold"
              >
                Сохранить шаблон
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
