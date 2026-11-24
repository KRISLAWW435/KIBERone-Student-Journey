import React, { useMemo, useState } from 'react';
import {
  Archive,
  ArchiveRestore,
  ArrowLeft,
  ArrowRight,
  Check,
  Edit3,
  FileSpreadsheet,
  FolderArchive,
  Layers,
  Loader2,
  Plus,
  Search,
  Sparkles,
  Trash2,
  Upload,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import {
  getJournalStatusMeta,
  JOURNAL_STATUS_OPTIONS,
  MODULE_CATEGORIES,
  UNIFIED_SKILLS_CATALOG,
} from '../../data/curriculumCatalog';
import { DESIGN_PALETTES } from '../../data/presets';
import {
  AgeCategory,
  GroupCurriculumTemplate,
  JournalDocument,
  JournalStatus,
  LibraryModule,
  ModuleCategoryConfig,
  ModuleCategoryId,
  ModuleLucideIconKey,
  ModuleVisualMode,
  ResidentRecord,
  SkillDefinition,
  StudentGroup,
} from '../../types/journal';
import { AppHeader, WorkspaceTab } from '../AppHeader';

export interface BulkGroupGenerationPayload {
  group: StudentGroup;
  residentIds: string[];
  period: string;
  mentorName: string;
  ageCategory: AgeCategory;
  paletteId: string;
  selectedModules: Array<{
    libraryModuleId: string;
    code?: string;
    officialTitle?: string;
    title: string;
    subtitle: string;
    description: string;
    category?: ModuleCategoryId;
    illustrationKey: LibraryModule['illustrationKey'];
    iconKey?: ModuleLucideIconKey;
    visualMode?: ModuleVisualMode;
    imageMediaId?: string | null;
    customImageUrl?: string;
    cardBgColor: string;
    suggestedSkills?: string[];
  }>;
  commonSkills: string[];
  updateExistingCommonModules: boolean;
}

interface GroupsViewProps {
  groups: StudentGroup[];
  residents: ResidentRecord[];
  journals: JournalDocument[];
  libraryModules: LibraryModule[];
  groupTemplates?: GroupCurriculumTemplate[];
  categories?: ModuleCategoryConfig[];
  skillsCatalog?: SkillDefinition[];
  batchProgress: { active: boolean; current: number; total: number; groupName: string } | null;
  onNavigate: (tab: WorkspaceTab) => void;
  onCreateNewJournal: () => void;
  onOpenMediaLibrary: () => void;
  onSaveGroup: (group: StudentGroup) => Promise<void>;
  onDeleteGroup: (groupId: string) => Promise<void>;
  onSaveResident: (resident: ResidentRecord) => Promise<void>;
  onDeleteResident: (residentId: string) => Promise<void>;
  onImportResidents: (records: ResidentRecord[]) => Promise<void>;
  onOpenJournalInEditor: (journalId: string) => void;
  onCreateSingleResidentJournal: (resident: ResidentRecord) => Promise<void>;
  onUpdateJournalStatus?: (journalId: string, status: JournalStatus) => Promise<void>;
  onBulkCreateGroupJournals: (payload: BulkGroupGenerationPayload) => Promise<void>;
  onBatchExportGroupZip: (group: StudentGroup) => Promise<void>;
}

const BULK_STEPS = [
  'Группа и состав',
  'Период обучения',
  'Наставник',
  'Выбор модулей',
  'Описания и навыки',
  'Возраст и палитра',
  'Создание журналов',
] as const;

export function GroupsView({
  groups,
  residents,
  journals,
  libraryModules,
  groupTemplates = [],
  categories = MODULE_CATEGORIES,
  skillsCatalog = UNIFIED_SKILLS_CATALOG,
  batchProgress,
  onNavigate,
  onCreateNewJournal,
  onOpenMediaLibrary,
  onSaveGroup,
  onDeleteGroup,
  onSaveResident,
  onDeleteResident,
  onImportResidents,
  onOpenJournalInEditor,
  onCreateSingleResidentJournal,
  onUpdateJournalStatus,
  onBulkCreateGroupJournals,
  onBatchExportGroupZip,
}: GroupsViewProps) {
  const [selectedGroupId, setSelectedGroupId] = useState<string>(
    groups[0]?.id ?? ''
  );
  const [showArchived, setShowArchived] = useState(false);

  // Modals state
  const [groupModal, setGroupModal] = useState<StudentGroup | null>(null);
  const [residentModal, setResidentModal] = useState<ResidentRecord | null>(null);
  const [csvModalOpen, setCsvModalOpen] = useState(false);
  const [csvText, setCsvText] = useState('');

  // 7-step Bulk Generator Modal state
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkStep, setBulkStep] = useState(0);
  const [bulkPeriod, setBulkPeriod] = useState('');
  const [bulkMentor, setBulkMentor] = useState('');
  const [bulkAgeCategory, setBulkAgeCategory] = useState<AgeCategory>('11-13');
  const [bulkPaletteId, setBulkPaletteId] = useState(DESIGN_PALETTES[0].id);
  const [bulkResidentIds, setBulkResidentIds] = useState<string[]>([]);
  const [bulkModules, setBulkModules] = useState<
    BulkGroupGenerationPayload['selectedModules']
  >([]);
  const [bulkSkills, setBulkSkills] = useState<string[]>([]);
  const [bulkUpdateExisting, setBulkUpdateExisting] = useState(true);
  const [bulkBusy, setBulkBusy] = useState(false);
  const [bulkModuleSearch, setBulkModuleSearch] = useState('');
  const [bulkModuleCategory, setBulkModuleCategory] = useState<string>('all');
  const [bulkSelectedTemplateId, setBulkSelectedTemplateId] = useState<string>('');

  const selectedGroup =
    groups.find((g) => g.id === selectedGroupId) ?? groups[0] ?? null;

  const groupResidents = useMemo(() => {
    if (!selectedGroup) return [];
    return residents.filter(
      (r) =>
        r.groupId === selectedGroup.id && (showArchived ? true : !r.archived)
    );
  }, [residents, selectedGroup, showArchived]);

  const activeGroupResidents = useMemo(() => {
    if (!selectedGroup) return [];
    return residents.filter(
      (r) => r.groupId === selectedGroup.id && !r.archived
    );
  }, [residents, selectedGroup]);

  const findResidentJournal = (res: ResidentRecord): JournalDocument | undefined => {
    if (res.journalId) {
      const byId = journals.find((j) => j.id === res.journalId);
      if (byId) return byId;
    }
    return journals.find((j) => j.residentId === res.id);
  };

  const openNewGroup = () => {
    const now = new Date().toISOString();
    setGroupModal({
      id: `grp-${Date.now()}`,
      name: 'Новая учебная группа',
      mentorName: 'Имя наставника',
      defaultPeriod: 'IV квартал 2026',
      ageCategory: '11-13',
      createdAt: now,
      updatedAt: now,
    });
  };

  const openNewResident = () => {
    if (!selectedGroup) return;
    const now = new Date().toISOString();
    setResidentModal({
      id: `res-${Date.now()}`,
      groupId: selectedGroup.id,
      fullName: '',
      age:
        selectedGroup.ageCategory === '8-10'
          ? '9 лет'
          : selectedGroup.ageCategory === '14-15'
          ? '14 лет'
          : '11 лет',
      ageCategory: selectedGroup.ageCategory,
      mentorName: selectedGroup.mentorName,
      period: selectedGroup.defaultPeriod,
      branch: '',
      archived: false,
      createdAt: now,
      updatedAt: now,
    });
  };

  const parsedCsvPreview = useMemo(() => {
    if (!csvText.trim() || !selectedGroup) return [];
    const lines = csvText
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);
    if (lines.length === 0) return [];
    const delimiter = lines[0].includes(';') ? ';' : ',';
    const rows = lines.map((line) =>
      line
        .split(delimiter)
        .map((cell) => cell.trim().replace(/^["']|["']$/g, ''))
    );

    const firstRowLower = rows[0].join(' ').toLowerCase();
    const startIdx =
      firstRowLower.includes('имя') ||
      firstRowLower.includes('фио') ||
      firstRowLower.includes('name')
        ? 1
        : 0;

    const now = new Date().toISOString();
    return rows.slice(startIdx).map((cols, i): ResidentRecord => {
      const fullName = cols[0] || `Резидент ${i + 1}`;
      const age = cols[1] || '11 лет';
      const rawCat = cols[2] || '';
      const ageCategory: AgeCategory = rawCat.includes('8')
        ? '8-10'
        : rawCat.includes('14') || rawCat.includes('15')
        ? '14-15'
        : selectedGroup.ageCategory;
      const mentorName = cols[3] || selectedGroup.mentorName;
      const period = cols[4] || selectedGroup.defaultPeriod;
      const branch = cols[5] || '';

      return {
        id: `res-csv-${Date.now()}-${i}`,
        groupId: selectedGroup.id,
        fullName,
        age,
        ageCategory,
        mentorName,
        period,
        branch,
        archived: false,
        createdAt: now,
        updatedAt: now,
      };
    });
  }, [csvText, selectedGroup]);

  const mapLibraryModuleToBulk = (m: LibraryModule) => ({
    libraryModuleId: m.id,
    code: m.code,
    officialTitle: m.officialTitle || m.title,
    title: m.displayTitle || m.title,
    subtitle: m.subtitle,
    description: m.description,
    category: m.category,
    illustrationKey: m.illustrationKey,
    iconKey: m.iconKey,
    visualMode: m.visualMode || (m.customImageUrl ? 'image' : 'illustration'),
    imageMediaId: m.imageMediaId ?? null,
    customImageUrl: m.customImageUrl,
    cardBgColor: m.cardBgColor,
    suggestedSkills: [...(m.suggestedSkills ?? [])],
  });

  const openBulkWizard = () => {
    if (!selectedGroup) return;
    setBulkStep(0);
    setBulkPeriod(selectedGroup.defaultPeriod);
    setBulkMentor(selectedGroup.mentorName);
    setBulkAgeCategory(selectedGroup.ageCategory);
    setBulkPaletteId(DESIGN_PALETTES[0].id);
    setBulkResidentIds(activeGroupResidents.map((r) => r.id));
    setBulkModuleSearch('');
    setBulkModuleCategory('all');
    setBulkSelectedTemplateId('');

    const activeLibs = libraryModules.filter((m) => m.isActive !== false);
    const defaultMods = activeLibs.slice(0, 3).map(mapLibraryModuleToBulk);
    setBulkModules(defaultMods);

    // Do NOT auto-confirm module skills on bulk journal creation; suggested skills go into mentor pool
    setBulkSkills([]);
    setBulkUpdateExisting(true);
    setBulkOpen(true);
  };

  const applyGroupCurriculumTemplate = (templateId: string) => {
    setBulkSelectedTemplateId(templateId);
    const tpl = groupTemplates.find((t) => t.id === templateId);
    if (!tpl) return;
    setBulkAgeCategory(tpl.ageCategory);
    if (tpl.paletteId) setBulkPaletteId(tpl.paletteId);
    const mapped = tpl.moduleIds
      .map((id) => libraryModules.find((m) => m.id === id))
      .filter((m): m is LibraryModule => Boolean(m))
      .map(mapLibraryModuleToBulk);
    setBulkModules(mapped);
  };

  const toggleBulkLibraryModule = (lib: LibraryModule) => {
    const exists = bulkModules.some((m) => m.libraryModuleId === lib.id);
    if (exists) {
      setBulkModules((prev) =>
        prev.filter((m) => m.libraryModuleId !== lib.id)
      );
    } else {
      setBulkModules((prev) => [...prev, mapLibraryModuleToBulk(lib)]);
    }
  };

  const activeBulkModulesCatalog = useMemo(() => {
    const q = bulkModuleSearch.trim().toLowerCase();
    return libraryModules.filter((m) => {
      if (m.isActive === false) return false;
      const matchesCat =
        bulkModuleCategory === 'all' ||
        m.category === bulkModuleCategory ||
        Boolean(m.filterCategories?.includes(bulkModuleCategory));
      if (!matchesCat) return false;
      if (!q) return true;
      return (
        m.displayTitle.toLowerCase().includes(q) ||
        m.officialTitle.toLowerCase().includes(q) ||
        (m.code || '').toLowerCase().includes(q) ||
        m.subtitle.toLowerCase().includes(q)
      );
    });
  }, [libraryModules, bulkModuleSearch, bulkModuleCategory]);

  const bulkAggregatedSuggestedSkills = useMemo(() => {
    const ids = new Set<string>();
    bulkModules.forEach((m) => {
      (m.suggestedSkills ?? []).forEach((sid) => ids.add(sid));
    });
    return Array.from(ids)
      .map((sid) => skillsCatalog.find((s) => s.id === sid))
      .filter((s): s is SkillDefinition => Boolean(s));
  }, [bulkModules, skillsCatalog]);

  const groupJournalsCount = activeGroupResidents.filter((r) =>
    Boolean(findResidentJournal(r))
  ).length;

  const groupStatusCounts = useMemo(() => {
    const counts: Record<JournalStatus | 'missing', number> = {
      missing: 0,
      not_started: 0,
      draft: 0,
      in_progress: 0,
      needs_review: 0,
      ready: 0,
      exported: 0,
    };
    activeGroupResidents.forEach((res) => {
      const j = findResidentJournal(res);
      if (!j) {
        counts.missing += 1;
      } else {
        counts[j.status] = (counts[j.status] ?? 0) + 1;
      }
    });
    return counts;
  }, [activeGroupResidents, journals]);

  return (
    <div className="min-h-screen bg-[#F6F6F3] text-[#18181B] flex flex-col">
      <AppHeader
        activeTab="groups"
        onNavigate={onNavigate}
        onCreateNew={onCreateNewJournal}
        onOpenMediaLibrary={onOpenMediaLibrary}
      />

      <main className="flex-1 max-w-[1320px] w-full mx-auto px-6 py-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
              Группы и резиденты
            </h1>
            <p className="text-sm text-zinc-500 mt-1">
              Управляйте учебными группами, импортируйте списки из CSV, создавайте журналы на всю группу и скачивайте PDF архивом
            </p>
          </div>
          <button
            type="button"
            onClick={openNewGroup}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold whitespace-nowrap self-start"
          >
            <Plus className="w-4 h-4" />
            <span>Новая группа</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[310px_1fr] gap-6 items-start">
          {/* LEFT: GROUPS LIST */}
          <section className="bg-white border border-zinc-200 rounded-2xl p-3 space-y-2">
            <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
              Учебные группы ({groups.length})
            </div>
            {groups.length === 0 ? (
              <div className="py-8 text-center text-xs text-zinc-500">
                Создайте первую группу
              </div>
            ) : (
              groups.map((grp) => {
                const count = residents.filter(
                  (r) => r.groupId === grp.id && !r.archived
                ).length;
                const active = selectedGroup?.id === grp.id;
                return (
                  <div
                    key={grp.id}
                    className={`rounded-xl border p-3 transition-colors cursor-pointer ${
                      active
                        ? 'border-[#0D9488] bg-[#F0FDFA]/60'
                        : 'border-zinc-200 bg-white hover:border-zinc-300'
                    }`}
                    onClick={() => setSelectedGroupId(grp.id)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-zinc-900 truncate">
                          {grp.name}
                        </div>
                        <div className="text-[11px] text-zinc-500 mt-0.5">
                          {grp.mentorName} · {grp.ageCategory} лет
                        </div>
                        <div className="text-[10px] text-zinc-400 mt-1">
                          {grp.defaultPeriod} · Резидентов: {count}
                        </div>
                      </div>
                      <div
                        className="flex items-center gap-0.5 shrink-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => setGroupModal({ ...grp })}
                          className="p-1 rounded text-zinc-400 hover:text-zinc-900"
                          title="Редактировать группу"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteGroup(grp.id)}
                          className="p-1 rounded text-zinc-400 hover:text-red-600"
                          title="Удалить группу"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </section>

          {/* RIGHT: SELECTED GROUP RESIDENTS & BULK ACTIONS */}
          {selectedGroup ? (
            <section className="bg-white border border-zinc-200 rounded-2xl p-6 space-y-5">
              <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-4 border-b border-zinc-100">
                <div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#0D9488]" />
                    <h2 className="text-lg font-bold text-zinc-900">
                      {selectedGroup.name}
                    </h2>
                  </div>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Наставник: {selectedGroup.mentorName} · Период:{' '}
                    {selectedGroup.defaultPeriod}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCsvModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-xs font-medium text-zinc-700"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>Импорт CSV</span>
                  </button>

                  <button
                    type="button"
                    onClick={openNewResident}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-xs font-medium text-zinc-700"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Добавить резидента</span>
                  </button>

                  <button
                    type="button"
                    disabled={activeGroupResidents.length === 0}
                    onClick={openBulkWizard}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-semibold disabled:opacity-50"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Массовое создание журналов</span>
                  </button>

                  <button
                    type="button"
                    disabled={
                      groupJournalsCount === 0 || Boolean(batchProgress?.active)
                    }
                    onClick={() => onBatchExportGroupZip(selectedGroup)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold disabled:opacity-50"
                  >
                    {batchProgress?.active ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <FolderArchive className="w-3.5 h-3.5" />
                    )}
                    <span>
                      {batchProgress?.active
                        ? `ZIP: ${batchProgress.current}/${batchProgress.total}...`
                        : `Экспорт PDF в ZIP (${groupJournalsCount})`}
                    </span>
                  </button>
                </div>
              </div>

              {/* Group Progress Summary */}
              {activeGroupResidents.length > 0 && (
                <div className="p-3.5 rounded-xl bg-[#F9F9F7] border border-zinc-200 space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="font-bold text-zinc-800">
                      Прогресс подготовки группы
                    </span>
                    <span className="text-[11px] font-medium text-zinc-600 tabular-nums">
                      Готово / экспортировано:{' '}
                      <strong>
                        {groupStatusCounts.ready + groupStatusCounts.exported}
                      </strong>{' '}
                      из {activeGroupResidents.length}
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-zinc-200 overflow-hidden flex">
                    {JOURNAL_STATUS_OPTIONS.map((opt) => {
                      const count = groupStatusCounts[opt.id] || 0;
                      if (count === 0) return null;
                      const pct = (count / activeGroupResidents.length) * 100;
                      return (
                        <div
                          key={opt.id}
                          style={{ width: `${pct}%` }}
                          className={`h-full ${opt.barClass}`}
                          title={`${opt.label}: ${count}`}
                        />
                      );
                    })}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {JOURNAL_STATUS_OPTIONS.map((opt) => {
                      const count = groupStatusCounts[opt.id] || 0;
                      if (count === 0) return null;
                      return (
                        <span
                          key={opt.id}
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${opt.badgeClass}`}
                        >
                          {opt.label}: {count}
                        </span>
                      );
                    })}
                    {groupStatusCounts.missing > 0 && (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded border border-zinc-200 bg-white text-zinc-500">
                        Без журнала: {groupStatusCounts.missing}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Filter Archived */}
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-zinc-600">
                  Список резидентов ({groupResidents.length})
                </span>
                <label className="flex items-center gap-2 cursor-pointer text-zinc-600">
                  <input
                    type="checkbox"
                    checked={showArchived}
                    onChange={(e) => setShowArchived(e.target.checked)}
                  />
                  <span>Показать архивных</span>
                </label>
              </div>

              {groupResidents.length === 0 ? (
                <div className="py-12 text-center border border-dashed border-zinc-200 rounded-xl text-xs text-zinc-500">
                  В группе пока нет резидентов. Добавьте вручную или загрузите CSV-файл.
                </div>
              ) : (
                <div className="divide-y divide-zinc-100 border border-zinc-200 rounded-xl overflow-hidden">
                  {groupResidents.map((res) => {
                    const journal = findResidentJournal(res);
                    return (
                      <div
                        key={res.id}
                        className={`px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          res.archived ? 'bg-zinc-50 opacity-70' : 'bg-white'
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-zinc-900 truncate">
                              {res.fullName}
                            </span>
                            {res.archived && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-200 text-zinc-600 font-medium">
                                Архив
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-zinc-500 mt-0.5">
                            {res.age} ({res.ageCategory}) · {res.period} · Наставник:{' '}
                            {res.mentorName}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {journal ? (
                            <>
                              {onUpdateJournalStatus ? (
                                <select
                                  value={journal.status}
                                  onChange={(e) =>
                                    onUpdateJournalStatus(
                                      journal.id,
                                      e.target.value as JournalStatus
                                    )
                                  }
                                  className={`text-[11px] font-semibold px-2 py-1 rounded-md border cursor-pointer ${
                                    getJournalStatusMeta(journal.status).badgeClass
                                  }`}
                                >
                                  {JOURNAL_STATUS_OPTIONS.map((opt) => (
                                    <option key={opt.id} value={opt.id}>
                                      {opt.label}
                                    </option>
                                  ))}
                                </select>
                              ) : (
                                <span
                                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${
                                    getJournalStatusMeta(journal.status).badgeClass
                                  }`}
                                >
                                  {getJournalStatusMeta(journal.status).label}
                                </span>
                              )}
                              <button
                                type="button"
                                onClick={() => onOpenJournalInEditor(journal.id)}
                                className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium"
                              >
                                Открыть журнал
                              </button>
                            </>
                          ) : (
                            <>
                              <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-500">
                                Нет журнала
                              </span>
                              <button
                                type="button"
                                onClick={() => onCreateSingleResidentJournal(res)}
                                className="px-3 py-1.5 rounded-lg border border-[#0D9488] text-[#0F766E] hover:bg-[#F0FDFA] text-xs font-semibold"
                              >
                                Создать журнал
                              </button>
                            </>
                          )}

                          <button
                            type="button"
                            onClick={() => setResidentModal({ ...res })}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100"
                            title="Редактировать"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              onSaveResident({ ...res, archived: !res.archived })
                            }
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100"
                            title={
                              res.archived
                                ? 'Восстановить из архива'
                                : 'В архив'
                            }
                          >
                            {res.archived ? (
                              <ArchiveRestore className="w-3.5 h-3.5" />
                            ) : (
                              <Archive className="w-3.5 h-3.5" />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteResident(res.id)}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50"
                            title="Удалить"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          ) : (
            <div className="bg-white border border-zinc-200 rounded-2xl p-12 text-center text-sm text-zinc-500">
              Выберите или создайте учебную группу.
            </div>
          )}
        </div>
      </main>

      {/* GROUP MODAL */}
      {groupModal && (
        <div className="fixed inset-0 z-50 bg-zinc-900/45 flex items-center justify-center p-6">
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!groupModal.name.trim()) return;
              const saved = {
                ...groupModal,
                updatedAt: new Date().toISOString(),
              };
              await onSaveGroup(saved);
              setSelectedGroupId(saved.id);
              setGroupModal(null);
            }}
            className="bg-white border border-zinc-200 rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4 text-xs"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-zinc-900">
                Параметры учебной группы
              </h3>
              <button
                type="button"
                onClick={() => setGroupModal(null)}
                className="p-1 text-zinc-400 hover:text-zinc-900"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <label className="block">
              <span className="font-semibold text-zinc-700">Название группы</span>
              <input
                type="text"
                required
                value={groupModal.name}
                onChange={(e) =>
                  setGroupModal({ ...groupModal, name: e.target.value })
                }
                className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 font-semibold"
              />
            </label>
            <label className="block">
              <span className="font-semibold text-zinc-700">Наставник</span>
              <input
                type="text"
                value={groupModal.mentorName}
                onChange={(e) =>
                  setGroupModal({ ...groupModal, mentorName: e.target.value })
                }
                className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2"
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="font-semibold text-zinc-700">Период по умолчанию</span>
                <input
                  type="text"
                  value={groupModal.defaultPeriod}
                  onChange={(e) =>
                    setGroupModal({ ...groupModal, defaultPeriod: e.target.value })
                  }
                  className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2"
                />
              </label>
              <label className="block">
                <span className="font-semibold text-zinc-700">Возрастная категория</span>
                <select
                  value={groupModal.ageCategory}
                  onChange={(e) =>
                    setGroupModal({
                      ...groupModal,
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
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setGroupModal(null)}
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

      {/* RESIDENT MODAL */}
      {residentModal && (
        <div className="fixed inset-0 z-50 bg-zinc-900/45 flex items-center justify-center p-6">
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!residentModal.fullName.trim()) return;
              await onSaveResident({
                ...residentModal,
                updatedAt: new Date().toISOString(),
              });
              setResidentModal(null);
            }}
            className="bg-white border border-zinc-200 rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4 text-xs"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-zinc-900">Карточка резидента</h3>
              <button
                type="button"
                onClick={() => setResidentModal(null)}
                className="p-1 text-zinc-400 hover:text-zinc-900"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <label className="block">
              <span className="font-semibold text-zinc-700">Имя и фамилия</span>
              <input
                type="text"
                required
                value={residentModal.fullName}
                onChange={(e) =>
                  setResidentModal({ ...residentModal, fullName: e.target.value })
                }
                placeholder="Иван Петров"
                className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 font-semibold"
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="font-semibold text-zinc-700">Возраст</span>
                <input
                  type="text"
                  value={residentModal.age}
                  onChange={(e) =>
                    setResidentModal({ ...residentModal, age: e.target.value })
                  }
                  className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2"
                />
              </label>
              <label className="block">
                <span className="font-semibold text-zinc-700">Возрастная группа</span>
                <select
                  value={residentModal.ageCategory}
                  onChange={(e) =>
                    setResidentModal({
                      ...residentModal,
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
            </div>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="font-semibold text-zinc-700">Наставник</span>
                <input
                  type="text"
                  value={residentModal.mentorName}
                  onChange={(e) =>
                    setResidentModal({
                      ...residentModal,
                      mentorName: e.target.value,
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2"
                />
              </label>
              <label className="block">
                <span className="font-semibold text-zinc-700">Период</span>
                <input
                  type="text"
                  value={residentModal.period}
                  onChange={(e) =>
                    setResidentModal({ ...residentModal, period: e.target.value })
                  }
                  className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2"
                />
              </label>
            </div>
            <label className="block">
              <span className="font-semibold text-zinc-700">Филиал</span>
              <input
                type="text"
                value={residentModal.branch}
                onChange={(e) =>
                  setResidentModal({ ...residentModal, branch: e.target.value })
                }
                className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2"
              />
            </label>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setResidentModal(null)}
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

      {/* CSV IMPORT MODAL */}
      {csvModalOpen && selectedGroup && (
        <div className="fixed inset-0 z-50 bg-zinc-900/45 flex items-center justify-center p-6">
          <div className="bg-white border border-zinc-200 rounded-2xl shadow-2xl w-full max-w-2xl p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-zinc-900">
                Импорт резидентов из CSV в «{selectedGroup.name}»
              </h3>
              <button
                type="button"
                onClick={() => setCsvModalOpen(false)}
                className="p-1 text-zinc-400 hover:text-zinc-900"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-zinc-500">
              Формат строк (разделитель <code>;</code> или <code>,</code>):{' '}
              <strong>ФИО; Возраст; Категория (8-10/11-13/14-15); Наставник; Период; Филиал</strong>.
              Обязательно только имя в первом столбце.
            </p>

            <div className="flex items-center gap-3">
              <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 bg-[#F9F9F7] hover:bg-zinc-100 cursor-pointer font-medium">
                <Upload className="w-3.5 h-3.5" />
                <span>Загрузить .csv файл</span>
                <input
                  type="file"
                  accept=".csv,text/csv,text/plain"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = () => {
                      if (typeof reader.result === 'string') {
                        setCsvText(reader.result);
                      }
                    };
                    reader.readAsText(file, 'utf-8');
                  }}
                />
              </label>
              <button
                type="button"
                onClick={() =>
                  setCsvText(
                    `ФИО;Возраст;Категория\nАртём Соколов;11 лет;11-13\nПолина Морозова;12 лет;11-13`
                  )
                }
                className="text-[#0D9488] hover:underline font-medium"
              >
                Вставить пример
              </button>
            </div>

            <textarea
              rows={5}
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              placeholder="Артём Соколов;11 лет;11-13"
              className="w-full rounded-xl border border-zinc-200 p-3 font-mono text-[11px]"
            />

            {parsedCsvPreview.length > 0 && (
              <div className="bg-[#F9F9F7] border border-zinc-200 rounded-xl p-3 space-y-1.5 max-h-36 overflow-y-auto">
                <div className="font-semibold text-zinc-700">
                  Найдено резидентов: {parsedCsvPreview.length}
                </div>
                {parsedCsvPreview.map((row) => (
                  <div key={row.id} className="text-[11px] text-zinc-600">
                    • <strong>{row.fullName}</strong> ({row.age}, {row.ageCategory}) —{' '}
                    {row.mentorName}
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setCsvModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-zinc-200"
              >
                Отмена
              </button>
              <button
                type="button"
                disabled={parsedCsvPreview.length === 0}
                onClick={async () => {
                  await onImportResidents(parsedCsvPreview);
                  setCsvText('');
                  setCsvModalOpen(false);
                }}
                className="px-4 py-2 rounded-lg bg-[#0D9488] text-white font-semibold disabled:opacity-50"
              >
                Импортировать ({parsedCsvPreview.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7-STEP BULK GROUP JOURNAL WIZARD */}
      {bulkOpen && selectedGroup && (
        <div className="fixed inset-0 z-50 bg-zinc-900/50 backdrop-blur-[2px] flex items-center justify-center p-6">
          <div className="bg-white border border-zinc-200 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden text-xs">
            <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between bg-[#F9F9F7]">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-[#0D9488]">
                  Шаг {bulkStep + 1} из {BULK_STEPS.length}
                </div>
                <h3 className="text-sm font-bold text-zinc-900">
                  Массовое создание журналов · {selectedGroup.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setBulkOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Stepper Header */}
            <div className="px-6 py-2.5 border-b border-zinc-200 flex items-center gap-1.5 overflow-x-auto">
              {BULK_STEPS.map((label, idx) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setBulkStep(idx)}
                  className={`px-2.5 py-1 rounded-lg whitespace-nowrap font-medium ${
                    bulkStep === idx
                      ? 'bg-zinc-900 text-white'
                      : idx < bulkStep
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'text-zinc-500 hover:bg-zinc-100'
                  }`}
                >
                  {idx + 1}. {label}
                </button>
              ))}
            </div>

            {/* Step Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {bulkStep === 0 && (
                <div className="space-y-3">
                  <div className="font-bold text-sm text-zinc-900">
                    1. Выберите резидентов группы «{selectedGroup.name}»
                  </div>
                  <p className="text-zinc-500">
                    Для каждого выбранного ученика будет создан персональный черновик журнала. Если журнал уже существует, личные комментарии наставника и скриншоты проектов не перезаписываются.
                  </p>
                  <div className="divide-y divide-zinc-100 border border-zinc-200 rounded-xl">
                    {activeGroupResidents.map((res) => {
                      const checked = bulkResidentIds.includes(res.id);
                      const existing = findResidentJournal(res);
                      return (
                        <label
                          key={res.id}
                          className="px-3.5 py-2.5 flex items-center justify-between gap-3 cursor-pointer hover:bg-zinc-50"
                        >
                          <div className="flex items-center gap-2.5">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={(e) =>
                                setBulkResidentIds((prev) =>
                                  e.target.checked
                                    ? [...prev, res.id]
                                    : prev.filter((id) => id !== res.id)
                                )
                              }
                            />
                            <span className="font-semibold text-zinc-900">
                              {res.fullName}
                            </span>
                            <span className="text-zinc-500">({res.age})</span>
                          </div>
                          <span className="text-[11px] text-zinc-500">
                            {existing
                              ? 'Есть индивидуальный журнал'
                              : 'Будет создан новый'}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {bulkStep === 1 && (
                <div className="space-y-3">
                  <div className="font-bold text-sm text-zinc-900">
                    2. Укажите период обучения
                  </div>
                  <input
                    type="text"
                    value={bulkPeriod}
                    onChange={(e) => setBulkPeriod(e.target.value)}
                    placeholder="IV квартал 2026"
                    className="w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-sm font-semibold"
                  />
                </div>
              )}

              {bulkStep === 2 && (
                <div className="space-y-3">
                  <div className="font-bold text-sm text-zinc-900">
                    3. Выберите наставника группы
                  </div>
                  <input
                    type="text"
                    value={bulkMentor}
                    onChange={(e) => setBulkMentor(e.target.value)}
                    placeholder="Имя наставника"
                    className="w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-sm font-semibold"
                  />
                </div>
              )}

              {bulkStep === 3 && (
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="font-bold text-sm text-zinc-900">
                      4. Выберите пройденные модули ({bulkModules.length} выбрано)
                    </div>
                    {groupTemplates.length > 0 && (
                      <select
                        value={bulkSelectedTemplateId}
                        onChange={(e) => applyGroupCurriculumTemplate(e.target.value)}
                        className="rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-medium"
                      >
                        <option value="">Применить групповой шаблон...</option>
                        {groupTemplates.map((tpl) => (
                          <option key={tpl.id} value={tpl.id}>
                            {tpl.name} ({tpl.moduleIds.length} мод.)
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-1">
                      <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={bulkModuleSearch}
                        onChange={(e) => setBulkModuleSearch(e.target.value)}
                        placeholder="Поиск по коду или названию модуля..."
                        className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-zinc-200 bg-white text-xs"
                      />
                    </div>
                    <select
                      value={bulkModuleCategory}
                      onChange={(e) => setBulkModuleCategory(e.target.value)}
                      className="rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs"
                    >
                      <option value="all">Все категории</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.shortName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-80 overflow-y-auto pr-1">
                    {activeBulkModulesCatalog.map((lib) => {
                      const selected = bulkModules.some(
                        (m) => m.libraryModuleId === lib.id
                      );
                      return (
                        <button
                          key={lib.id}
                          type="button"
                          onClick={() => toggleBulkLibraryModule(lib)}
                          className={`text-left p-3 rounded-xl border flex items-start justify-between gap-2 transition-colors ${
                            selected
                              ? 'border-[#0D9488] bg-[#F0FDFA]'
                              : 'border-zinc-200 bg-white hover:border-zinc-300'
                          }`}
                        >
                          <div className="min-w-0">
                            <div className="font-bold text-zinc-900 truncate">
                              {lib.code ? `${lib.code} · ` : ''}
                              {lib.displayTitle || lib.title}
                            </div>
                            <div className="text-[11px] text-zinc-500 truncate">
                              {lib.subtitle}
                            </div>
                          </div>
                          {selected && (
                            <Check className="w-4 h-4 text-[#0D9488] shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {bulkStep === 4 && (
                <div className="space-y-4">
                  <div className="font-bold text-sm text-zinc-900">
                    5. Отредактируйте описания модулей и пул навыков
                  </div>
                  <div className="space-y-2.5">
                    {bulkModules.map((mod) => (
                      <div
                        key={mod.libraryModuleId}
                        className="p-3 rounded-xl border border-zinc-200 bg-[#F9F9F7] space-y-2"
                      >
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={mod.title}
                            onChange={(e) =>
                              setBulkModules((prev) =>
                                prev.map((m) =>
                                  m.libraryModuleId === mod.libraryModuleId
                                    ? { ...m, title: e.target.value }
                                    : m
                                )
                              )
                            }
                            className="rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 font-semibold"
                          />
                          <input
                            type="text"
                            value={mod.subtitle}
                            onChange={(e) =>
                              setBulkModules((prev) =>
                                prev.map((m) =>
                                  m.libraryModuleId === mod.libraryModuleId
                                    ? { ...m, subtitle: e.target.value }
                                    : m
                                )
                              )
                            }
                            className="rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5"
                          />
                        </div>
                        <textarea
                          rows={2}
                          value={mod.description}
                          onChange={(e) =>
                            setBulkModules((prev) =>
                              prev.map((m) =>
                                m.libraryModuleId === mod.libraryModuleId
                                  ? { ...m, description: e.target.value }
                                  : m
                              )
                            )
                          }
                          className="w-full rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5"
                        />
                      </div>
                    ))}
                  </div>

                  {bulkAggregatedSuggestedSkills.length > 0 && (
                    <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 space-y-1.5">
                      <div className="font-semibold text-amber-900">
                        Предлагаемые навыки модулей ({bulkAggregatedSuggestedSkills.length}):
                      </div>
                      <p className="text-[11px] text-amber-800">
                        Они попадут в список для подтверждения наставником в каждом журнале и не будут автоматически отмечены как освоенные.
                      </p>
                      <div className="flex flex-wrap gap-1 pt-1">
                        {bulkAggregatedSuggestedSkills.map((sk) => (
                          <span
                            key={sk.id}
                            className="px-2 py-0.5 rounded bg-white border border-amber-200 text-[11px] text-zinc-700"
                          >
                            {sk.label}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-2 pt-2 border-t border-zinc-100">
                    <div className="font-semibold text-zinc-700">
                      Сразу подтвердить общие навыки (опционально, по умолчанию пусто):
                    </div>
                    <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
                      {skillsCatalog.map((sk) => {
                        const active = bulkSkills.includes(sk.label);
                        return (
                          <button
                            key={sk.id}
                            type="button"
                            onClick={() =>
                              setBulkSkills((prev) =>
                                active
                                  ? prev.filter((s) => s !== sk.label)
                                  : [...prev, sk.label]
                              )
                            }
                            className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium ${
                              active
                                ? 'bg-zinc-900 text-white border-zinc-900'
                                : 'bg-white text-zinc-700 border-zinc-200'
                            }`}
                          >
                            {sk.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {bulkStep === 5 && (
                <div className="space-y-4">
                  <div className="font-bold text-sm text-zinc-900">
                    6. Возрастная категория и визуальная тема
                  </div>

                  <label className="block">
                    <span className="font-semibold text-zinc-700">
                      Возрастной стиль оформления
                    </span>
                    <select
                      value={bulkAgeCategory}
                      onChange={(e) =>
                        setBulkAgeCategory(e.target.value as AgeCategory)
                      }
                      className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 bg-white text-xs font-medium"
                    >
                      <option value="8-10">8–10 лет (игровой и яркий)</option>
                      <option value="11-13">11–13 лет (баланс макета)</option>
                      <option value="14-15">14–15 лет (технологичный)</option>
                    </select>
                  </label>

                  <div className="space-y-2">
                    <span className="font-semibold text-zinc-700 block">
                      Цветовая палитра журналов группы
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {DESIGN_PALETTES.map((pal) => (
                        <button
                          key={pal.id}
                          type="button"
                          onClick={() => setBulkPaletteId(pal.id)}
                          className={`p-3 rounded-xl border flex items-center justify-between text-left ${
                            bulkPaletteId === pal.id
                              ? 'border-[#0D9488] bg-[#F0FDFA]'
                              : 'border-zinc-200 hover:border-zinc-300'
                          }`}
                        >
                          <span className="font-semibold text-zinc-900">
                            {pal.name}
                          </span>
                          <span className="flex items-center gap-1">
                            {[
                              pal.coverStart,
                              pal.p2Yellow,
                              pal.prideCoral,
                              pal.nextBg,
                            ].map((c, idx) => (
                              <span
                                key={idx}
                                style={{ backgroundColor: c }}
                                className="w-3.5 h-3.5 rounded-full border border-black/15"
                              />
                            ))}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {bulkStep === 6 && (
                <div className="space-y-4">
                  <div className="font-bold text-sm text-zinc-900">
                    7. Проверка перед генерацией журналов группы
                  </div>
                  <div className="p-4 rounded-xl bg-[#F9F9F7] border border-zinc-200 space-y-2">
                    <div>
                      <strong>Группа:</strong> {selectedGroup.name}
                    </div>
                    <div>
                      <strong>Резидентов выбрано:</strong> {bulkResidentIds.length}
                    </div>
                    <div>
                      <strong>Период:</strong> {bulkPeriod}
                    </div>
                    <div>
                      <strong>Наставник:</strong> {bulkMentor}
                    </div>
                    <div>
                      <strong>Модули:</strong>{' '}
                      {bulkModules.map((m) => m.title).join(', ') || 'Без модулей'}
                    </div>
                    <div>
                      <strong>Навыки:</strong> {bulkSkills.join(', ')}
                    </div>
                  </div>

                  <label className="flex items-start gap-2.5 p-3 rounded-xl border border-zinc-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={bulkUpdateExisting}
                      onChange={(e) => setBulkUpdateExisting(e.target.checked)}
                      className="mt-0.5"
                    />
                    <span>
                      <strong>Обновить общие модули и палитру в существующих черновиках</strong>
                      <span className="block text-[11px] text-zinc-500 mt-0.5">
                        Индивидуальные комментарии наставника, сильные стороны, момент гордости и загруженные скриншоты проектов всегда сохраняются без изменений.
                      </span>
                    </span>
                  </label>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-3.5 border-t border-zinc-200 bg-[#F9F9F7] flex items-center justify-between">
              <button
                type="button"
                disabled={bulkStep === 0}
                onClick={() => setBulkStep((s) => Math.max(0, s - 1))}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-zinc-200 bg-white disabled:opacity-40 font-medium"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Назад</span>
              </button>

              {bulkStep < BULK_STEPS.length - 1 ? (
                <button
                  type="button"
                  onClick={() =>
                    setBulkStep((s) => Math.min(BULK_STEPS.length - 1, s + 1))
                  }
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white font-semibold"
                >
                  <span>Далее</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  disabled={bulkBusy || bulkResidentIds.length === 0}
                  onClick={async () => {
                    setBulkBusy(true);
                    try {
                      await onBulkCreateGroupJournals({
                        group: selectedGroup,
                        residentIds: bulkResidentIds,
                        period: bulkPeriod,
                        mentorName: bulkMentor,
                        ageCategory: bulkAgeCategory,
                        paletteId: bulkPaletteId,
                        selectedModules: bulkModules,
                        commonSkills: bulkSkills,
                        updateExistingCommonModules: bulkUpdateExisting,
                      });
                      setBulkOpen(false);
                    } finally {
                      setBulkBusy(false);
                    }
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-[#0D9488] hover:bg-[#0F766E] text-white font-semibold disabled:opacity-50"
                >
                  {bulkBusy ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Layers className="w-4 h-4" />
                  )}
                  <span>Создать журналы группы</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
