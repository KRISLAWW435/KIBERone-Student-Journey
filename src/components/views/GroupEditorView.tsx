import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  BookOpen,
  Check,
  Columns2,
  Eye,
  FolderArchive,
  Image as ImageIcon,
  Layers,
  Loader2,
  MapPin,
  Maximize2,
  Palette,
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
  MODULE_CATEGORIES,
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
  AgeCategory,
  Branch,
  EditorSectionTarget,
  GroupCommonCurriculum,
  GroupCurriculumTemplate,
  JournalDocument,
  LibraryModule,
  MediaAsset,
  MediaCategory,
  ModuleCategoryConfig,
  ModuleItem,
  NextTopicItem,
  ProjectItem,
  ResidentRecord,
  SkillDefinition,
  SkillItem,
  StrengthItem,
  StudentGroup,
  StudentStatus,
} from '../../types/journal';
import {
  buildDefaultCommonData,
  computeJournalProgress,
  formatGroupPeriod,
  getStudentStatusLabel,
} from '../../utils/journalProgress';
import { ExportMenu } from '../ExportMenu';
import { JournalPageOne } from '../journal/JournalPageOne';
import { JournalPageTwo } from '../journal/JournalPageTwo';

interface GroupEditorViewProps {
  group: StudentGroup;
  branches: Branch[];
  residents: ResidentRecord[];
  journals: JournalDocument[];
  libraryModules: LibraryModule[];
  categories?: ModuleCategoryConfig[];
  skillsCatalog?: SkillDefinition[];
  groupTemplates?: GroupCurriculumTemplate[];
  mediaAssets?: MediaAsset[];
  saveState: 'saved' | 'saving';
  batchProgress: {
    active: boolean;
    current: number;
    total: number;
    groupName: string;
  } | null;
  activeJournalId: string | null;
  onSelectActiveJournal: (journalId: string) => void;
  onChangeJournal: (updated: JournalDocument) => void;
  onSaveGroupAndApplyCommon: (
    updatedGroup: StudentGroup,
    commonData: GroupCommonCurriculum
  ) => Promise<void>;
  onQuickAddStudent: (
    groupId: string,
    fullName: string,
    age?: string
  ) => Promise<ResidentRecord | null>;
  onUpdateStudent: (updated: ResidentRecord) => Promise<void>;
  onDeleteStudent: (residentId: string) => Promise<void>;
  onBackHome: () => void;
  onOpenPreview: (journalId: string) => void;
  onPrint: () => void;
  onExportSuccess?: (journalId: string) => void;
  onBatchExportGroupZip: (group: StudentGroup) => Promise<void>;
  getExportPageElements: () => {
    page1: HTMLElement | null;
    page2: HTMLElement | null;
  };
  onOpenMediaPicker: (
    category: MediaCategory | 'all',
    onSelect: (url: string, asset?: MediaAsset) => void
  ) => void;
}

type EditorTab = 'individual' | 'common';
type PageFocus = 1 | 2 | 'spread';
type IndividualSection = 'profile' | 'projects' | 'pride' | 'mentorNote';

export function GroupEditorView({
  group,
  branches,
  residents,
  journals,
  libraryModules,
  categories = MODULE_CATEGORIES,
  skillsCatalog = UNIFIED_SKILLS_CATALOG,
  groupTemplates = [],
  mediaAssets,
  saveState,
  batchProgress,
  activeJournalId,
  onSelectActiveJournal,
  onChangeJournal,
  onSaveGroupAndApplyCommon,
  onQuickAddStudent,
  onUpdateStudent,
  onDeleteStudent,
  onBackHome,
  onOpenPreview,
  onPrint,
  onExportSuccess,
  onBatchExportGroupZip,
  getExportPageElements,
  onOpenMediaPicker,
}: GroupEditorViewProps) {
  const [editorTab, setEditorTab] = useState<EditorTab>('individual');
  const [pageFocus, setPageFocus] = useState<PageFocus>(1);
  const [zoom, setZoom] = useState<'auto' | number>('auto');
  const [autoScale, setAutoScale] = useState(0.75);
  const [activeSection, setActiveSection] = useState<IndividualSection>('profile');

  // Student list filters & quick add / delete confirmation
  const [showInactive, setShowInactive] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [quickName, setQuickName] = useState('');
  const [quickAge, setQuickAge] = useState('');
  const [confirmDeleteStudentId, setConfirmDeleteStudentId] = useState<
    string | null
  >(null);

  // Selected student in left panel
  const groupStudents = useMemo(
    () =>
      residents.filter(
        (r) =>
          r.groupId === group.id &&
          (showInactive ? true : r.status === 'active')
      ),
    [residents, group.id, showInactive]
  );

  const activeStudentsOnly = useMemo(
    () => residents.filter((r) => r.groupId === group.id && r.status === 'active'),
    [residents, group.id]
  );

  const findStudentJournal = useCallback(
    (res: ResidentRecord): JournalDocument | undefined => {
      if (res.journalId) {
        const byId = journals.find((j) => j.id === res.journalId);
        if (byId) return byId;
      }
      return journals.find((j) => j.residentId === res.id);
    },
    [journals]
  );

  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    () => groupStudents[0]?.id ?? ''
  );

  useEffect(() => {
    if (!groupStudents.some((s) => s.id === selectedStudentId)) {
      setSelectedStudentId(groupStudents[0]?.id ?? '');
    }
  }, [groupStudents, selectedStudentId]);

  const selectedStudent =
    groupStudents.find((s) => s.id === selectedStudentId) ??
    groupStudents[0] ??
    null;

  const activeDoc = selectedStudent
    ? findStudentJournal(selectedStudent) ?? null
    : null;

  useEffect(() => {
    if (activeDoc && activeDoc.id !== activeJournalId) {
      onSelectActiveJournal(activeDoc.id);
    }
  }, [activeDoc, activeJournalId, onSelectActiveJournal]);

  // Common group data draft state
  const [groupDraft, setGroupDraft] = useState<StudentGroup>(() => ({
    ...group,
  }));
  const [commonDraft, setCommonDraft] = useState<GroupCommonCurriculum>(() =>
    buildDefaultCommonData(group)
  );
  const [commonSearch, setCommonSearch] = useState('');
  const [commonCategory, setCommonCategory] = useState<string>('all');
  const [newCustomSkill, setNewCustomSkill] = useState('');
  const [newNextTopicTitle, setNewNextTopicTitle] = useState('');
  const [applyingCommon, setApplyingCommon] = useState(false);

  // Sync draft when switching groups
  useEffect(() => {
    setGroupDraft({ ...group });
    setCommonDraft(buildDefaultCommonData(group));
  }, [group.id]);

  // AI Mentor Note state
  const [aiBusy, setAiBusy] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [newStrengthTitle, setNewStrengthTitle] = useState('');

  // Canvas ResizeObserver for crisp auto-scaling without overlap
  const canvasStageRef = useRef<HTMLDivElement | null>(null);
  const effectiveSpread = pageFocus === 'spread';
  const logicalW = effectiveSpread ? 794 * 2 + 12 : 794;

  useEffect(() => {
    if (editorTab !== 'individual') return;
    const el = canvasStageRef.current;
    if (!el) return;
    const recalc = () => {
      const availableW = Math.max(300, el.clientWidth - 40);
      const availableH = Math.max(400, el.clientHeight - 56);
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
  }, [editorTab, pageFocus, effectiveSpread, selectedStudentId]);

  const effectiveScale = zoom === 'auto' ? autoScale : zoom;
  const branch = branches.find((b) => b.id === group.branchId);

  const activeDocProgress = useMemo(
    () => (activeDoc ? computeJournalProgress(activeDoc) : null),
    [activeDoc]
  );

  const groupReadyStats = useMemo(() => {
    let ready = 0;
    let inProgress = 0;
    let notStarted = 0;
    activeStudentsOnly.forEach((st) => {
      const j = findStudentJournal(st);
      if (!j) {
        notStarted += 1;
        return;
      }
      const p = computeJournalProgress(j);
      if (p.statusLevel === 'ready') ready += 1;
      else if (p.statusLevel === 'in_progress') inProgress += 1;
      else notStarted += 1;
    });
    return {
      ready,
      inProgress,
      notStarted,
      total: activeStudentsOnly.length,
    };
  }, [activeStudentsOnly, findStudentJournal]);

  const handleUploadImage = (
    file: File | undefined,
    cb: (url: string) => void
  ) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') cb(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSelectTargetOnA4 = (target: EditorSectionTarget) => {
    if (!target) return;
    if (target.page === 1) {
      if (target.block === 'cover' || target.block === 'logo' || target.block === 'coverBear') {
        setActiveSection('profile');
      } else if (target.block === 'project' || target.block === 'projectsBlock') {
        setActiveSection('projects');
      } else if (target.block === 'modulesBlock' || target.block === 'module' || target.block === 'skills') {
        setEditorTab('common');
      }
    } else {
      if (target.block === 'mentorNote') {
        setActiveSection('mentorNote');
      } else if (target.block === 'pride' || target.block === 'prideBear' || target.block === 'strengths') {
        setActiveSection('pride');
      } else if (target.block === 'nextChapter' || target.block === 'nextBear') {
        setEditorTab('common');
      }
    }
  };

  const handleGenerateAiMentorNote = async () => {
    if (!activeDoc) return;
    setAiBusy(true);
    setAiError(null);
    try {
      const res = await fetch('/api/generate-mentor-note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName: activeDoc.resident.fullName,
          studentAge: activeDoc.resident.age,
          period: activeDoc.resident.period,
          mentorName: activeDoc.resident.mentorName,
          modules: activeDoc.page1.modules
            .filter((m) => !m.hidden)
            .map((m) => m.title),
          skills: activeDoc.page1.skills.map((s) => s.label),
          projects: activeDoc.page1.projects
            .filter((p) => !p.hidden && p.title.trim())
            .map((p) => p.title),
          strengths: activeDoc.page2.strengths
            .filter((s) => !s.hidden)
            .map((s) => ({ title: s.title, example: s.example })),
          prideText: activeDoc.page2.prideText,
          observations: activeDoc.page2.mentorNote.observationsDraft,
        }),
      });
      const payload = await res.json();
      if (!res.ok) {
        setAiError(payload.error || 'Не удалось сгенерировать текст.');
        return;
      }
      onChangeJournal({
        ...activeDoc,
        page2: {
          ...activeDoc.page2,
          mentorNote: {
            ...activeDoc.page2.mentorNote,
            greeting: payload.greeting || activeDoc.page2.mentorNote.greeting,
            body: payload.body || activeDoc.page2.mentorNote.body,
            signature: payload.signature || activeDoc.page2.mentorNote.signature,
          },
        },
      });
    } catch {
      setAiError('Нет связи с сервером генерации.');
    } finally {
      setAiBusy(false);
    }
  };

  // Common Group Tab Helpers
  const filteredCatalogModules = useMemo(() => {
    const q = commonSearch.trim().toLowerCase();
    return libraryModules.filter((m) => {
      if (m.isActive === false) return false;
      const matchesCat =
        commonCategory === 'all' ||
        m.category === commonCategory ||
        Boolean(m.filterCategories?.includes(commonCategory));
      if (!matchesCat) return false;
      if (!q) return true;
      return (
        m.displayTitle.toLowerCase().includes(q) ||
        m.officialTitle.toLowerCase().includes(q) ||
        (m.code || '').toLowerCase().includes(q) ||
        m.subtitle.toLowerCase().includes(q)
      );
    });
  }, [libraryModules, commonSearch, commonCategory]);

  const toggleCommonModule = (lib: LibraryModule) => {
    const exists = commonDraft.modules.some(
      (m) => m.libraryModuleId === lib.id
    );
    if (exists) {
      setCommonDraft((prev) => ({
        ...prev,
        modules: prev.modules
          .filter((m) => m.libraryModuleId !== lib.id)
          .map((m, idx) => ({ ...m, order: idx + 1 })),
      }));
    } else {
      const nextMod: ModuleItem = {
        id: `grp-mod-${lib.id}-${Date.now()}`,
        libraryModuleId: lib.id,
        code: lib.code,
        officialTitle: lib.officialTitle || lib.title,
        title: lib.displayTitle || lib.title,
        subtitle: lib.subtitle,
        description: lib.description,
        category: lib.category,
        illustrationKey: lib.illustrationKey,
        iconKey: lib.iconKey,
        visualMode:
          lib.visualMode || (lib.customImageUrl ? 'image' : 'illustration'),
        imageMediaId: lib.imageMediaId ?? null,
        customImageUrl: lib.customImageUrl,
        cardBgColor: lib.cardBgColor,
        layoutVariant: 'classic',
        size: 'normal',
        order: commonDraft.modules.length + 1,
        suggestedSkills: [...(lib.suggestedSkills ?? [])],
      };
      setCommonDraft((prev) => ({
        ...prev,
        modules: [...prev.modules, nextMod],
      }));
    }
  };

  const moveCommonModule = (index: number, delta: -1 | 1) => {
    const targetIdx = index + delta;
    if (targetIdx < 0 || targetIdx >= commonDraft.modules.length) return;
    const copy = [...commonDraft.modules];
    [copy[index], copy[targetIdx]] = [copy[targetIdx], copy[index]];
    setCommonDraft((prev) => ({
      ...prev,
      modules: copy.map((m, i) => ({ ...m, order: i + 1 })),
    }));
  };

  const applyCommonGroupTemplate = (tplId: string) => {
    const tpl = groupTemplates.find((t) => t.id === tplId);
    if (!tpl) return;
    const mapped = tpl.moduleIds
      .map((id) => libraryModules.find((m) => m.id === id))
      .filter((m): m is LibraryModule => Boolean(m))
      .map((lib, idx) => ({
        id: `grp-mod-${lib.id}-${idx}`,
        libraryModuleId: lib.id,
        code: lib.code,
        officialTitle: lib.officialTitle || lib.title,
        title: lib.displayTitle || lib.title,
        subtitle: lib.subtitle,
        description: lib.description,
        category: lib.category,
        illustrationKey: lib.illustrationKey,
        iconKey: lib.iconKey,
        visualMode:
          lib.visualMode || (lib.customImageUrl ? 'image' : 'illustration'),
        imageMediaId: lib.imageMediaId ?? null,
        customImageUrl: lib.customImageUrl,
        cardBgColor: lib.cardBgColor,
        layoutVariant: 'classic' as const,
        size: 'normal' as const,
        order: idx + 1,
        suggestedSkills: [...(lib.suggestedSkills ?? [])],
      }));
    setCommonDraft((prev) => ({
      ...prev,
      paletteId: tpl.paletteId || prev.paletteId,
      modules: mapped,
    }));
  };

  const toggleCommonSkill = (def: SkillDefinition) => {
    const exists = commonDraft.skills.some(
      (s) =>
        s.skillId === def.id ||
        s.label.toLowerCase() === def.label.toLowerCase()
    );
    if (exists) {
      setCommonDraft((prev) => ({
        ...prev,
        skills: prev.skills.filter(
          (s) =>
            s.skillId !== def.id &&
            s.label.toLowerCase() !== def.label.toLowerCase()
        ),
      }));
    } else {
      const nextSkill: SkillItem = {
        id: `grp-sk-${def.id}-${Date.now()}`,
        skillId: def.id,
        label: def.label,
        bgColor: def.defaultColor,
        status: 'independent',
      };
      setCommonDraft((prev) => ({
        ...prev,
        skills: [...prev.skills, nextSkill],
      }));
    }
  };

  const recommendedSkillDefs = useMemo(() => {
    const ids = new Set<string>();
    commonDraft.modules.forEach((m) => {
      (m.suggestedSkills ?? []).forEach((sid) => ids.add(sid));
    });
    return Array.from(ids)
      .map((id) => skillsCatalog.find((s) => s.id === id))
      .filter((s): s is SkillDefinition => Boolean(s));
  }, [commonDraft.modules, skillsCatalog]);

  return (
    <div className="min-h-screen bg-[#F2F2EE] text-[#18181B] flex flex-col">
      {/* TOP BAR */}
      <header className="h-16 bg-white border-b border-zinc-200 px-5 flex items-center justify-between gap-4 sticky top-0 z-30">
        <div className="flex items-center gap-3 min-w-0">
          <img
            src={ASSETS.logo}
            alt="KIBERone"
            referrerPolicy="no-referrer"
            className="h-7 w-auto object-contain block shrink-0"
          />
          <button
            type="button"
            onClick={onBackHome}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-zinc-200 text-xs font-medium text-zinc-700 hover:bg-zinc-50 whitespace-nowrap shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>К группам</span>
          </button>

          <div className="h-5 w-px bg-zinc-200 hidden md:block" />

          <div className="min-w-0 hidden md:block">
            <div className="text-sm font-bold text-zinc-900 truncate">
              {group.name}
            </div>
            <div className="text-[11px] text-zinc-500 flex items-center gap-1.5 truncate">
              <MapPin className="w-3 h-3 text-[#0D9488] shrink-0" />
              <span>{branch?.name || 'Локация'}</span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">
                {formatGroupPeriod(group.startDate, group.endDate)}
              </span>
            </div>
          </div>
        </div>

        {/* Center Switch: Individual vs Common Group Data */}
        <div className="flex items-center gap-1 p-1 bg-[#F6F6F3] rounded-xl border border-zinc-200 shrink-0">
          <button
            type="button"
            onClick={() => setEditorTab('individual')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
              editorTab === 'individual'
                ? 'bg-white text-zinc-900 shadow-xs'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-[#0D9488]" />
            <span>Ученики и листы А4</span>
          </button>
          <button
            type="button"
            onClick={() => setEditorTab('common')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
              editorTab === 'common'
                ? 'bg-white text-zinc-900 shadow-xs'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-[#0D9488]" />
            <span>Общие данные группы</span>
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="hidden xl:inline-flex items-center gap-1 text-xs font-medium text-emerald-700 whitespace-nowrap mr-1">
            <Check className="w-3.5 h-3.5" />
            <span>{saveState === 'saving' ? 'Сохранение...' : 'Сохранено'}</span>
          </span>

          {activeDoc && (
            <>
              <button
                type="button"
                onClick={() => onOpenPreview(activeDoc.id)}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-xs font-medium text-zinc-700 whitespace-nowrap shrink-0"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Разворот</span>
              </button>

              <ExportMenu
                doc={activeDoc}
                getPageElements={getExportPageElements}
                onPrint={onPrint}
                onExportSuccess={() => onExportSuccess?.(activeDoc.id)}
              />
            </>
          )}

          <button
            type="button"
            disabled={
              activeStudentsOnly.length === 0 || Boolean(batchProgress?.active)
            }
            onClick={() => onBatchExportGroupZip(group)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold disabled:opacity-50 whitespace-nowrap shrink-0"
            title="Скачать журналы всех учеников группы одним ZIP-архивом"
          >
            {batchProgress?.active ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <FolderArchive className="w-3.5 h-3.5" />
            )}
            <span className="hidden md:inline">
              {batchProgress?.active
                ? `ZIP: ${batchProgress.current}/${batchProgress.total}`
                : 'ZIP группы'}
            </span>
          </button>
        </div>
      </header>

      {/* TWO-PANEL WORKSPACE */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* LEFT PANEL: STUDENTS LIST & PROGRESS */}
        <aside className="w-full lg:w-[280px] shrink-0 bg-white border-r border-zinc-200 flex flex-col lg:h-[calc(100vh-64px)]">
          <div className="p-4 border-b border-zinc-200 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h2 className="text-xs font-bold text-zinc-900">
                  Ученики группы ({activeStudentsOnly.length})
                </h2>
                <p className="text-[11px] text-zinc-500 tabular-nums mt-0.5">
                  Готово {groupReadyStats.ready} из {groupReadyStats.total} журналов
                </p>
              </div>
              <button
                type="button"
                onClick={() => setQuickAddOpen((v) => !v)}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#0D9488] hover:bg-[#0F766E] text-white text-[11px] font-semibold whitespace-nowrap shrink-0"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Добавить</span>
              </button>
            </div>

            {/* Overall Progress Bar */}
            <div className="h-1.5 w-full rounded-full bg-zinc-100 overflow-hidden">
              <div
                style={{
                  width: `${
                    groupReadyStats.total > 0
                      ? Math.round(
                          (groupReadyStats.ready / groupReadyStats.total) * 100
                        )
                      : 0
                  }%`,
                }}
                className="h-full bg-[#0D9488] rounded-full transition-all"
              />
            </div>

            {/* Status Legend */}
            <div className="flex items-center justify-between text-[10px] text-zinc-500">
              <span className="inline-flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                <span>Не начат</span>
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span>В процессе</span>
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Готов</span>
              </span>
            </div>

            {/* Quick Add Student Form */}
            {quickAddOpen && (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!quickName.trim()) return;
                  const created = await onQuickAddStudent(
                    group.id,
                    quickName.trim(),
                    quickAge.trim() || undefined
                  );
                  if (created) {
                    setSelectedStudentId(created.id);
                    setEditorTab('individual');
                  }
                  setQuickName('');
                  setQuickAge('');
                  setQuickAddOpen(false);
                }}
                className="p-2.5 rounded-xl bg-[#F0FDFA] border border-[#99F6E4] space-y-2 text-xs"
              >
                <input
                  type="text"
                  required
                  autoFocus
                  value={quickName}
                  onChange={(e) => setQuickName(e.target.value)}
                  placeholder="Имя и фамилия..."
                  className="w-full rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs"
                />
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={quickAge}
                    onChange={(e) => setQuickAge(e.target.value)}
                    placeholder="Возраст"
                    className="w-20 rounded-lg border border-zinc-200 bg-white px-2 py-1 text-xs"
                  />
                  <button
                    type="submit"
                    className="flex-1 px-2.5 py-1 rounded-lg bg-[#0D9488] text-white font-semibold"
                  >
                    Добавить
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickAddOpen(false)}
                    className="px-2 py-1 rounded-lg border border-zinc-200 bg-white text-zinc-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Vertical Student List */}
          <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5">
            {groupStudents.length === 0 ? (
              <div className="py-10 px-3 text-center text-xs text-zinc-500">
                В группе нет учеников. Нажмите «Добавить» выше.
              </div>
            ) : (
              groupStudents.map((st) => {
                const j = findStudentJournal(st);
                const prog = j ? computeJournalProgress(j) : null;
                const isSelected = selectedStudent?.id === st.id;
                const dotClass =
                  prog?.statusLevel === 'ready'
                    ? 'bg-emerald-500'
                    : prog?.statusLevel === 'in_progress'
                    ? 'bg-amber-400'
                    : 'bg-red-500';
                const statusTitle =
                  prog?.statusLevel === 'ready'
                    ? 'Готов к выгрузке'
                    : prog?.statusLevel === 'in_progress'
                    ? 'В процессе'
                    : 'Не начат';

                return (
                  <div
                    key={st.id}
                    className={`rounded-xl border transition-colors ${
                      isSelected
                        ? 'border-[#0D9488] bg-[#F0FDFA]/80'
                        : 'border-zinc-200 bg-white hover:border-zinc-300'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedStudentId(st.id);
                        setEditorTab('individual');
                      }}
                      className="w-full text-left p-2.5 flex items-start justify-between gap-2"
                    >
                      <div className="flex items-start gap-2.5 min-w-0">
                        <span
                          title={statusTitle}
                          className={`mt-1 w-2.5 h-2.5 rounded-full shrink-0 ${dotClass}`}
                        />
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-zinc-900 truncate">
                            {st.fullName}
                          </div>
                          <div className="text-[11px] text-zinc-500 tabular-nums mt-0.5">
                            {prog ? prog.label : 'Заполнено 0 из 5 блоков'}
                          </div>
                          {st.status !== 'active' && (
                            <div className="text-[10px] font-medium text-amber-700 mt-0.5">
                              Статус: {getStudentStatusLabel(st.status)}
                            </div>
                          )}
                        </div>
                      </div>
                    </button>

                    {/* Delete confirmation inline if triggered */}
                    {confirmDeleteStudentId === st.id && (
                      <div className="px-2.5 pb-2.5 pt-1 border-t border-red-100 flex items-center justify-between gap-2 text-[11px]">
                        <span className="font-semibold text-red-700">Удалить?</span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={async () => {
                              await onDeleteStudent(st.id);
                              setConfirmDeleteStudentId(null);
                            }}
                            className="px-2 py-0.5 rounded bg-red-600 text-white font-semibold"
                          >
                            Да
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteStudentId(null)}
                            className="px-2 py-0.5 rounded border border-zinc-200 bg-white text-zinc-700"
                          >
                            Нет
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          <div className="p-3 border-t border-zinc-200 bg-[#F9F9F7] flex items-center justify-between text-[11px] text-zinc-600">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={showInactive}
                onChange={(e) => setShowInactive(e.target.checked)}
              />
              <span>Показать выбывших/переведенных</span>
            </label>
          </div>
        </aside>

        {/* CENTRAL / RIGHT PANEL */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {editorTab === 'common' ? (
            /* COMMON GROUP DATA PANEL */
            <div className="flex-1 overflow-y-auto p-6 bg-[#F6F6F3]">
              <div className="max-w-4xl mx-auto space-y-6">
                <div className="bg-white border border-zinc-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-zinc-900">
                      Общие данные группы
                    </h2>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      Модули, общие навыки и раздел «Что интересного впереди?» применяются ко всем активным ученикам группы ({activeStudentsOnly.length}). Личные тексты и скриншоты учеников сохраняются.
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={applyingCommon}
                    onClick={async () => {
                      setApplyingCommon(true);
                      try {
                        await onSaveGroupAndApplyCommon(groupDraft, commonDraft);
                        setEditorTab('individual');
                      } finally {
                        setApplyingCommon(false);
                      }
                    }}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-semibold whitespace-nowrap shrink-0 disabled:opacity-60"
                  >
                    {applyingCommon ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                    <span>Применить ко всем ученикам</span>
                  </button>
                </div>

                {/* 1. Group Metadata & Palette */}
                <section className="bg-white border border-zinc-200 rounded-2xl p-5 space-y-4 text-xs">
                  <h3 className="text-sm font-bold text-zinc-900">
                    1. Параметры группы, локация и даты обучения
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <label className="block">
                      <span className="font-semibold text-zinc-700">Название группы</span>
                      <input
                        type="text"
                        value={groupDraft.name}
                        onChange={(e) =>
                          setGroupDraft({ ...groupDraft, name: e.target.value })
                        }
                        className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 font-semibold"
                      />
                    </label>
                    <label className="block">
                      <span className="font-semibold text-zinc-700">Локация (Филиал)</span>
                      <select
                        value={groupDraft.branchId}
                        onChange={(e) =>
                          setGroupDraft({ ...groupDraft, branchId: e.target.value })
                        }
                        className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 bg-white"
                      >
                        {branches.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.name} ({b.address})
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="block">
                      <span className="font-semibold text-zinc-700">Дата начала</span>
                      <input
                        type="date"
                        value={groupDraft.startDate}
                        onChange={(e) =>
                          setGroupDraft({ ...groupDraft, startDate: e.target.value })
                        }
                        className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2"
                      />
                    </label>
                    <label className="block">
                      <span className="font-semibold text-zinc-700">Дата окончания</span>
                      <input
                        type="date"
                        value={groupDraft.endDate}
                        onChange={(e) =>
                          setGroupDraft({ ...groupDraft, endDate: e.target.value })
                        }
                        className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2"
                      />
                    </label>
                    <label className="block">
                      <span className="font-semibold text-zinc-700">Наставник</span>
                      <input
                        type="text"
                        value={groupDraft.mentorName}
                        onChange={(e) =>
                          setGroupDraft({ ...groupDraft, mentorName: e.target.value })
                        }
                        className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2"
                      />
                    </label>
                    <label className="block">
                      <span className="font-semibold text-zinc-700">Возрастная категория</span>
                      <select
                        value={groupDraft.ageCategory}
                        onChange={(e) =>
                          setGroupDraft({
                            ...groupDraft,
                            ageCategory: e.target.value as AgeCategory,
                          })
                        }
                        className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 bg-white"
                      >
                        <option value="8-10">8–10 лет</option>
                        <option value="11-13">11–13 лет</option>
                        <option value="14-15">14–15 лет</option>
                      </select>
                    </label>
                  </div>

                  {/* Palette */}
                  <div className="pt-2 space-y-2">
                    <div className="inline-flex items-center gap-1.5 font-semibold text-zinc-700">
                      <Palette className="w-3.5 h-3.5 text-[#0D9488]" />
                      <span>Палитра оформления листов А4</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                      {DESIGN_PALETTES.map((pal) => (
                        <button
                          key={pal.id}
                          type="button"
                          onClick={() =>
                            setCommonDraft((prev) => ({
                              ...prev,
                              paletteId: pal.id,
                            }))
                          }
                          className={`p-2.5 rounded-xl border text-left space-y-1.5 transition-colors ${
                            commonDraft.paletteId === pal.id
                              ? 'border-[#0D9488] bg-[#F0FDFA]'
                              : 'border-zinc-200 bg-white hover:border-zinc-300'
                          }`}
                        >
                          <div className="font-semibold text-zinc-900 truncate">
                            {pal.name}
                          </div>
                          <div className="flex gap-1">
                            {[
                              pal.coverStart,
                              pal.p2Yellow,
                              pal.prideCoral,
                              pal.nextBg,
                            ].map((c, idx) => (
                              <span
                                key={idx}
                                style={{ backgroundColor: c }}
                                className="h-2.5 flex-1 rounded-full border border-black/10"
                              />
                            ))}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </section>

                {/* 2. Modules */}
                <section className="bg-white border border-zinc-200 rounded-2xl p-5 space-y-4 text-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-bold text-zinc-900">
                        2. Модули программы («Мои открытия», выбрано {commonDraft.modules.length})
                      </h3>
                      <p className="text-zinc-500 mt-0.5">
                        Выберите пройденные модули (Python, Kodu, Animaker и др.) или примените готовый набор.
                      </p>
                    </div>
                    {groupTemplates.length > 0 && (
                      <select
                        defaultValue=""
                        onChange={(e) => {
                          if (e.target.value) applyCommonGroupTemplate(e.target.value);
                        }}
                        className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs"
                      >
                        <option value="">Загрузить набор модулей...</option>
                        {groupTemplates.map((tpl) => (
                          <option key={tpl.id} value={tpl.id}>
                            {tpl.name} ({tpl.moduleIds.length})
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* Selected Modules Editable List */}
                  {commonDraft.modules.length > 0 && (
                    <div className="space-y-2">
                      {commonDraft.modules.map((mod, idx) => (
                        <div
                          key={mod.id}
                          className="p-3 rounded-xl border border-zinc-200 bg-[#F9F9F7] space-y-2"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-mono text-[11px] font-bold text-zinc-500">
                              #{idx + 1} · {mod.title}
                            </span>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() => moveCommonModule(idx, -1)}
                                className="p-1 rounded border border-zinc-200 bg-white disabled:opacity-40"
                              >
                                <ArrowUp className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                disabled={idx === commonDraft.modules.length - 1}
                                onClick={() => moveCommonModule(idx, 1)}
                                className="p-1 rounded border border-zinc-200 bg-white disabled:opacity-40"
                              >
                                <ArrowDown className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  setCommonDraft((prev) => ({
                                    ...prev,
                                    modules: prev.modules
                                      .filter((m) => m.id !== mod.id)
                                      .map((m, i) => ({ ...m, order: i + 1 })),
                                  }))
                                }
                                className="p-1 rounded text-zinc-400 hover:text-red-600"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <input
                              type="text"
                              value={mod.title}
                              onChange={(e) =>
                                setCommonDraft((prev) => ({
                                  ...prev,
                                  modules: prev.modules.map((m) =>
                                    m.id === mod.id ? { ...m, title: e.target.value } : m
                                  ),
                                }))
                              }
                              className="rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 font-semibold"
                            />
                            <input
                              type="text"
                              value={mod.subtitle}
                              onChange={(e) =>
                                setCommonDraft((prev) => ({
                                  ...prev,
                                  modules: prev.modules.map((m) =>
                                    m.id === mod.id ? { ...m, subtitle: e.target.value } : m
                                  ),
                                }))
                              }
                              className="rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5"
                            />
                          </div>
                          <input
                            type="text"
                            value={mod.description}
                            onChange={(e) =>
                              setCommonDraft((prev) => ({
                                ...prev,
                                modules: prev.modules.map((m) =>
                                  m.id === mod.id
                                    ? { ...m, description: e.target.value }
                                    : m
                                ),
                              }))
                            }
                            className="w-full rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Library Picker */}
                  <div className="pt-2 border-t border-zinc-100 space-y-2.5">
                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className="relative flex-1">
                        <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={commonSearch}
                          onChange={(e) => setCommonSearch(e.target.value)}
                          placeholder="Поиск модуля (Python, Kodu, Roblox...)"
                          className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-zinc-200 bg-white"
                        />
                      </div>
                      <select
                        value={commonCategory}
                        onChange={(e) => setCommonCategory(e.target.value)}
                        className="rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5"
                      >
                        <option value="all">Все категории</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.shortName}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-60 overflow-y-auto pr-1">
                      {filteredCatalogModules.map((lib) => {
                        const selected = commonDraft.modules.some(
                          (m) => m.libraryModuleId === lib.id
                        );
                        return (
                          <button
                            key={lib.id}
                            type="button"
                            onClick={() => toggleCommonModule(lib)}
                            className={`text-left p-2.5 rounded-xl border flex items-start justify-between gap-2 transition-colors ${
                              selected
                                ? 'border-[#0D9488] bg-[#F0FDFA]'
                                : 'border-zinc-200 bg-white hover:border-zinc-300'
                            }`}
                          >
                            <div className="min-w-0">
                              <div className="font-bold text-zinc-900 truncate">
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
                </section>

                {/* 3. Common Skills */}
                <section className="bg-white border border-zinc-200 rounded-2xl p-5 space-y-3 text-xs">
                  <h3 className="text-sm font-bold text-zinc-900">
                    3. Общие навыки группы («Чему я научился», выбрано {commonDraft.skills.length})
                  </h3>

                  {recommendedSkillDefs.length > 0 && (
                    <div className="p-3 rounded-xl bg-[#F0FDFA] border border-[#99F6E4] space-y-2">
                      <div className="font-semibold text-[#0F766E]">
                        Рекомендованы выбранными модулями:
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {recommendedSkillDefs.map((def) => {
                          const active = commonDraft.skills.some(
                            (s) =>
                              s.skillId === def.id ||
                              s.label.toLowerCase() === def.label.toLowerCase()
                          );
                          return (
                            <button
                              key={def.id}
                              type="button"
                              onClick={() => toggleCommonSkill(def)}
                              className={`px-2.5 py-1 rounded-lg border font-medium transition-colors ${
                                active
                                  ? 'bg-[#0D9488] text-white border-[#0D9488]'
                                  : 'bg-white text-zinc-800 border-zinc-200 hover:border-[#0D9488]'
                              }`}
                            >
                              {def.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto">
                    {skillsCatalog.map((def) => {
                      const active = commonDraft.skills.some(
                        (s) =>
                          s.skillId === def.id ||
                          s.label.toLowerCase() === def.label.toLowerCase()
                      );
                      return (
                        <button
                          key={def.id}
                          type="button"
                          onClick={() => toggleCommonSkill(def)}
                          className={`px-2.5 py-1 rounded-lg border font-medium transition-colors ${
                            active
                              ? 'bg-zinc-900 text-white border-zinc-900'
                              : 'bg-white text-zinc-700 border-zinc-200 hover:border-zinc-300'
                          }`}
                        >
                          {def.label}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex gap-2 pt-1">
                    <input
                      type="text"
                      value={newCustomSkill}
                      onChange={(e) => setNewCustomSkill(e.target.value)}
                      placeholder="Добавить свой навык..."
                      className="flex-1 rounded-lg border border-zinc-200 px-3 py-1.5"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!newCustomSkill.trim()) return;
                        setCommonDraft((prev) => ({
                          ...prev,
                          skills: [
                            ...prev.skills,
                            {
                              id: `sk-custom-${Date.now()}`,
                              label: newCustomSkill.trim(),
                              bgColor: '#48C9D8',
                              status: 'independent',
                            },
                          ],
                        }));
                        setNewCustomSkill('');
                      }}
                      className="px-3.5 py-1.5 rounded-lg bg-zinc-900 text-white font-semibold"
                    >
                      Добавить
                    </button>
                  </div>
                </section>

                {/* 4. Next Chapter */}
                <section className="bg-white border border-zinc-200 rounded-2xl p-5 space-y-3 text-xs">
                  <h3 className="text-sm font-bold text-zinc-900">
                    4. «Что интересного впереди?» (Стр. 2)
                  </h3>
                  <label className="block">
                    <span className="font-semibold text-zinc-700">Вводный текст</span>
                    <input
                      type="text"
                      value={commonDraft.nextChapterDescription}
                      onChange={(e) =>
                        setCommonDraft((prev) => ({
                          ...prev,
                          nextChapterDescription: e.target.value,
                        }))
                      }
                      className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2"
                    />
                  </label>

                  <div className="space-y-1.5">
                    <span className="font-semibold text-zinc-700 block">
                      Темы следующих модулей
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {NEXT_TOPIC_LIBRARY.map((item) => {
                        const active = commonDraft.nextChapterTopics.some(
                          (t) => t.title === item.title
                        );
                        return (
                          <button
                            key={item.title}
                            type="button"
                            onClick={() => {
                              setCommonDraft((prev) => {
                                const exists = prev.nextChapterTopics.some(
                                  (t) => t.title === item.title
                                );
                                return {
                                  ...prev,
                                  nextChapterTopics: exists
                                    ? prev.nextChapterTopics.filter(
                                        (t) => t.title !== item.title
                                      )
                                    : [
                                        ...prev.nextChapterTopics,
                                        {
                                          id: `nt-${Date.now()}-${item.iconKey}`,
                                          title: item.title,
                                          iconKey: item.iconKey,
                                        },
                                      ],
                                };
                              });
                            }}
                            className={`px-2.5 py-1 rounded-lg border font-medium transition-colors ${
                              active
                                ? 'bg-[#0D9488] text-white border-[#0D9488]'
                                : 'bg-white text-zinc-700 border-zinc-200 hover:border-zinc-300'
                            }`}
                          >
                            {item.title}
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex gap-2 pt-1">
                      <input
                        type="text"
                        value={newNextTopicTitle}
                        onChange={(e) => setNewNextTopicTitle(e.target.value)}
                        placeholder="Своя тема следующего модуля..."
                        className="flex-1 rounded-lg border border-zinc-200 px-3 py-1.5"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (!newNextTopicTitle.trim()) return;
                          const item: NextTopicItem = {
                            id: `nt-custom-${Date.now()}`,
                            title: newNextTopicTitle.trim(),
                            iconKey: 'ai',
                          };
                          setCommonDraft((prev) => ({
                            ...prev,
                            nextChapterTopics: [...prev.nextChapterTopics, item],
                          }));
                          setNewNextTopicTitle('');
                        }}
                        className="px-3.5 py-1.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 font-semibold"
                      >
                        Добавить тему
                      </button>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          ) : (
            /* INDIVIDUAL FILL + LIVE A4 PREVIEW */
            <>
              {/* Sub-toolbar above Individual workspace */}
              <div className="bg-white border-b border-zinc-200 px-5 py-2 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  {/* Page Switcher */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setPageFocus(1)}
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
                      onClick={() => setPageFocus(2)}
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
                      onClick={() => setPageFocus('spread')}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium transition-colors whitespace-nowrap ${
                        pageFocus === 'spread'
                          ? 'border-[#0D9488] bg-[#F0FDFA] text-[#0F766E]'
                          : 'border-zinc-200 bg-white text-zinc-600 hover:text-zinc-900'
                      }`}
                    >
                      <Columns2 className="w-3.5 h-3.5" />
                      <span className="hidden xl:inline">Обе страницы</span>
                    </button>
                  </div>

                  {activeDocProgress && (
                    <span className="text-xs font-medium text-zinc-600 tabular-nums pl-2 border-l border-zinc-200">
                      {activeDocProgress.label}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditorTab('common')}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-[#0D9488]/40 bg-[#F0FDFA] hover:bg-[#CCFBF1]/60 text-xs font-semibold text-[#0F766E] whitespace-nowrap"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Настроить общие данные группы</span>
                  </button>

                  {/* Zoom */}
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

              {!selectedStudent || !activeDoc ? (
                <div className="flex-1 flex items-center justify-center p-8">
                  <div className="bg-white border border-zinc-200 rounded-2xl p-8 text-center max-w-md space-y-3">
                    <p className="text-sm font-bold text-zinc-900">
                      Выберите ученика слева или добавьте первого ученика
                    </p>
                    <p className="text-xs text-zinc-500">
                      Для каждого ученика автоматически создаётся персональный журнал с общими данными группы.
                    </p>
                    <button
                      type="button"
                      onClick={() => setQuickAddOpen(true)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0D9488] text-white text-xs font-semibold"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Добавить ученика</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col xl:flex-row overflow-hidden">
                  {/* NON-OVERLAPPING INDIVIDUAL FIELDS COLUMN */}
                  <section className="w-full xl:w-[356px] shrink-0 bg-white border-r border-zinc-200 flex flex-col xl:h-[calc(100vh-110px)] overflow-hidden">
                    <div className="px-4 py-3 border-b border-zinc-200 bg-[#F9F9F7] flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-zinc-900 truncate">
                          {selectedStudent.fullName}
                        </div>
                        <div className="text-[11px] text-zinc-500">
                          Индивидуальные блоки журнала
                        </div>
                      </div>
                      <select
                        value={activeDoc.status}
                        onChange={(e) =>
                          onChangeJournal({
                            ...activeDoc,
                            status: e.target.value as JournalDocument['status'],
                          })
                        }
                        className="rounded-lg border border-zinc-200 bg-white px-2 py-1 text-[11px] font-semibold text-zinc-700"
                      >
                        <option value="not_started">Не начат</option>
                        <option value="draft">Черновик</option>
                        <option value="in_progress">В процессе</option>
                        <option value="ready">Готов к выгрузке</option>
                        <option value="exported">Экспортирован</option>
                      </select>
                    </div>

                    {/* Section Switch Pills (Interactive Tabs) */}
                    <div className="p-2 border-b border-zinc-200 grid grid-cols-2 gap-1 bg-zinc-50 text-[11px]">
                      {(
                        [
                          { id: 'profile', label: '1. Имя и статус', page: 1 as const },
                          { id: 'projects', label: '2. Проекты', page: 1 as const },
                          { id: 'pride', label: '3. Гордость', page: 2 as const },
                          { id: 'mentorNote', label: '4. Наставник', page: 2 as const },
                        ] as const
                      ).map((sec) => (
                        <button
                          key={sec.id}
                          type="button"
                          onClick={() => {
                            setActiveSection(sec.id);
                            if (pageFocus !== 'spread') setPageFocus(sec.page);
                          }}
                          className={`px-2.5 py-1.5 rounded-lg font-semibold text-left transition-colors truncate ${
                            activeSection === sec.id
                              ? 'bg-white text-[#0F766E] border border-[#0D9488]/40 shadow-2xs'
                              : 'text-zinc-600 hover:bg-white/70'
                          }`}
                        >
                          {sec.label}
                        </button>
                      ))}
                    </div>

                    {/* Active Individual Block Form */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
                      {activeSection === 'profile' && (
                        <div className="space-y-3">
                          <label className="block">
                            <span className="font-semibold text-zinc-700">
                              Имя и фамилия ученика
                            </span>
                            <input
                              type="text"
                              value={activeDoc.resident.fullName}
                              onChange={(e) => {
                                const fullName = e.target.value;
                                onChangeJournal({
                                  ...activeDoc,
                                  resident: { ...activeDoc.resident, fullName },
                                });
                                onUpdateStudent({
                                  ...selectedStudent,
                                  fullName,
                                  updatedAt: new Date().toISOString(),
                                });
                              }}
                              className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 font-semibold focus:outline-none focus:border-[#0D9488]"
                            />
                          </label>

                          <div className="grid grid-cols-2 gap-2.5">
                            <label className="block">
                              <span className="font-semibold text-zinc-700">Возраст</span>
                              <input
                                type="text"
                                value={activeDoc.resident.age}
                                onChange={(e) => {
                                  const age = e.target.value;
                                  onChangeJournal({
                                    ...activeDoc,
                                    resident: { ...activeDoc.resident, age },
                                  });
                                  onUpdateStudent({
                                    ...selectedStudent,
                                    age,
                                    updatedAt: new Date().toISOString(),
                                  });
                                }}
                                className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-1.5"
                              />
                            </label>
                            <label className="block">
                              <span className="font-semibold text-zinc-700">
                                Статус ученика
                              </span>
                              <select
                                value={selectedStudent.status}
                                onChange={(e) =>
                                  onUpdateStudent({
                                    ...selectedStudent,
                                    status: e.target.value as StudentStatus,
                                    archived: e.target.value === 'dropped',
                                    updatedAt: new Date().toISOString(),
                                  })
                                }
                                className="mt-1 w-full rounded-lg border border-zinc-200 px-2.5 py-1.5 bg-white"
                              >
                                <option value="active">Активен</option>
                                <option value="dropped">Выбыл</option>
                                <option value="transferred">Переведен</option>
                              </select>
                            </label>
                          </div>

                          {/* Checklist of 5 blocks */}
                          {activeDocProgress && (
                            <div className="pt-3 border-t border-zinc-100 space-y-2">
                              <div className="font-semibold text-zinc-700">
                                Прогресс заполнения ({activeDocProgress.label})
                              </div>
                              <div className="space-y-1.5">
                                {activeDocProgress.blocks.map((b) => (
                                  <div
                                    key={b.id}
                                    className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg bg-[#F9F9F7] border border-zinc-200/70"
                                  >
                                    <span className="text-zinc-700">{b.label}</span>
                                    <span
                                      className={`text-[11px] font-semibold ${
                                        b.completed
                                          ? 'text-emerald-700'
                                          : 'text-zinc-400'
                                      }`}
                                    >
                                      {b.completed ? 'Готово' : 'Пусто'}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="pt-2 border-t border-zinc-100 flex justify-between items-center">
                            {confirmDeleteStudentId === selectedStudent.id ? (
                              <div className="w-full flex items-center justify-between gap-2 p-2.5 rounded-xl bg-red-50 border border-red-200">
                                <span className="font-semibold text-red-800">
                                  Удалить ученика?
                                </span>
                                <div className="flex gap-1.5">
                                  <button
                                    type="button"
                                    onClick={async () => {
                                      await onDeleteStudent(selectedStudent.id);
                                      setConfirmDeleteStudentId(null);
                                    }}
                                    className="px-3 py-1 rounded-md bg-red-600 text-white font-semibold"
                                  >
                                    Да
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setConfirmDeleteStudentId(null)}
                                    className="px-3 py-1 rounded-md bg-white border border-zinc-200 text-zinc-700"
                                  >
                                    Нет
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() =>
                                  setConfirmDeleteStudentId(selectedStudent.id)
                                }
                                className="inline-flex items-center gap-1.5 text-red-600 hover:text-red-700 font-medium"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Удалить ученика из группы</span>
                              </button>
                            )}
                          </div>
                        </div>
                      )}

                      {activeSection === 'projects' && (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-zinc-700">
                              Проекты и скриншоты ({activeDoc.page1.projects.length})
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                const nextProj: ProjectItem = {
                                  id: `proj-${Date.now()}`,
                                  title: 'Новый проект',
                                  caption: 'Подпись проекта',
                                  description: 'Что было реализовано на занятии.',
                                  fallbackTheme: 'python',
                                  isRealScreenshot: false,
                                };
                                onChangeJournal({
                                  ...activeDoc,
                                  page1: {
                                    ...activeDoc.page1,
                                    showProjects: true,
                                    projects: [
                                      ...activeDoc.page1.projects,
                                      nextProj,
                                    ],
                                  },
                                });
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-900 text-white text-[11px] font-semibold"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Добавить</span>
                            </button>
                          </div>

                          {activeDoc.page1.projects.map((proj, idx) => (
                            <div
                              key={proj.id}
                              className="p-3 rounded-xl border border-zinc-200 bg-[#F9F9F7] space-y-2"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-mono text-[11px] font-bold text-zinc-500">
                                  Проект #{idx + 1}
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    onChangeJournal({
                                      ...activeDoc,
                                      page1: {
                                        ...activeDoc.page1,
                                        projects: activeDoc.page1.projects.filter(
                                          (p) => p.id !== proj.id
                                        ),
                                      },
                                    })
                                  }
                                  className="text-zinc-400 hover:text-red-600"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              <input
                                type="text"
                                value={proj.title}
                                onChange={(e) =>
                                  onChangeJournal({
                                    ...activeDoc,
                                    page1: {
                                      ...activeDoc.page1,
                                      projects: activeDoc.page1.projects.map((p) =>
                                        p.id === proj.id
                                          ? { ...p, title: e.target.value }
                                          : p
                                      ),
                                    },
                                  })
                                }
                                placeholder="Название проекта"
                                className="w-full rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 font-semibold"
                              />

                              <input
                                type="text"
                                value={proj.caption}
                                onChange={(e) =>
                                  onChangeJournal({
                                    ...activeDoc,
                                    page1: {
                                      ...activeDoc.page1,
                                      projects: activeDoc.page1.projects.map((p) =>
                                        p.id === proj.id
                                          ? { ...p, caption: e.target.value }
                                          : p
                                      ),
                                    },
                                  })
                                }
                                placeholder="Подпись (например: Игра в Kodu)"
                                className="w-full rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5"
                              />

                              <textarea
                                rows={2}
                                value={proj.description}
                                onChange={(e) =>
                                  onChangeJournal({
                                    ...activeDoc,
                                    page1: {
                                      ...activeDoc.page1,
                                      projects: activeDoc.page1.projects.map((p) =>
                                        p.id === proj.id
                                          ? { ...p, description: e.target.value }
                                          : p
                                      ),
                                    },
                                  })
                                }
                                placeholder="Короткое описание..."
                                className="w-full rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5"
                              />

                              <div className="flex items-center gap-1.5">
                                <label className="flex-1 inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#0D9488] hover:bg-[#0F766E] text-white font-semibold cursor-pointer">
                                  <Upload className="w-3 h-3" />
                                  <span>Загрузить скриншот</span>
                                  <input
                                    type="file"
                                    accept="image/png,image/jpeg,image/webp"
                                    className="hidden"
                                    onChange={(e) =>
                                      handleUploadImage(
                                        e.target.files?.[0],
                                        (url) =>
                                          onChangeJournal({
                                            ...activeDoc,
                                            page1: {
                                              ...activeDoc.page1,
                                              projects: activeDoc.page1.projects.map(
                                                (p) =>
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
                                      )
                                    }
                                  />
                                </label>
                                <button
                                  type="button"
                                  onClick={() =>
                                    onOpenMediaPicker('projects', (url) =>
                                      onChangeJournal({
                                        ...activeDoc,
                                        page1: {
                                          ...activeDoc.page1,
                                          projects: activeDoc.page1.projects.map(
                                            (p) =>
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
                                    )
                                  }
                                  className="px-2.5 py-1.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50"
                                  title="Выбрать из медиатеки"
                                >
                                  <ImageIcon className="w-3.5 h-3.5 text-zinc-700" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {activeSection === 'pride' && (
                        <div className="space-y-4">
                          <label className="block">
                            <span className="font-semibold text-zinc-700">
                              Момент гордости ученика
                            </span>
                            <textarea
                              rows={4}
                              value={activeDoc.page2.prideText}
                              onChange={(e) =>
                                onChangeJournal({
                                  ...activeDoc,
                                  page2: {
                                    ...activeDoc.page2,
                                    showPride: true,
                                    prideText: e.target.value,
                                  },
                                })
                              }
                              placeholder="Чем ученик может гордиться по итогам периода?"
                              className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2"
                            />
                          </label>

                          <div className="pt-2 border-t border-zinc-100 space-y-2.5">
                            <span className="font-semibold text-zinc-700 block">
                              Сильные стороны ({activeDoc.page2.strengths.length})
                            </span>

                            <div className="flex flex-wrap gap-1.5">
                              {STRENGTH_LIBRARY.map((preset) => {
                                const exists = activeDoc.page2.strengths.some(
                                  (s) => s.title === preset.title
                                );
                                return (
                                  <button
                                    key={preset.title}
                                    type="button"
                                    onClick={() => {
                                      if (exists) {
                                        onChangeJournal({
                                          ...activeDoc,
                                          page2: {
                                            ...activeDoc.page2,
                                            strengths:
                                              activeDoc.page2.strengths.filter(
                                                (s) => s.title !== preset.title
                                              ),
                                          },
                                        });
                                      } else {
                                        const nextStr: StrengthItem = {
                                          id: `str-${Date.now()}`,
                                          title: preset.title,
                                          example: preset.defaultExample,
                                          iconKey: preset.iconKey,
                                          bgColor: preset.bgColor,
                                        };
                                        onChangeJournal({
                                          ...activeDoc,
                                          page2: {
                                            ...activeDoc.page2,
                                            showStrengths: true,
                                            strengths: [
                                              ...activeDoc.page2.strengths,
                                              nextStr,
                                            ],
                                          },
                                        });
                                      }
                                    }}
                                    className={`px-2 py-1 rounded-lg border text-[11px] font-medium transition-colors ${
                                      exists
                                        ? 'bg-[#0D9488] text-white border-[#0D9488]'
                                        : 'bg-white text-zinc-700 border-zinc-200'
                                    }`}
                                  >
                                    {preset.title}
                                  </button>
                                );
                              })}
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
                                  if (!newStrengthTitle.trim()) return;
                                  const nextStr: StrengthItem = {
                                    id: `str-custom-${Date.now()}`,
                                    title: newStrengthTitle.trim(),
                                    example: 'Ярко проявил себя на практических заданиях.',
                                    iconKey: 'creativity',
                                    bgColor: '#B8F2F5',
                                  };
                                  onChangeJournal({
                                    ...activeDoc,
                                    page2: {
                                      ...activeDoc.page2,
                                      showStrengths: true,
                                      strengths: [
                                        ...activeDoc.page2.strengths,
                                        nextStr,
                                      ],
                                    },
                                  });
                                  setNewStrengthTitle('');
                                }}
                                className="px-3 py-1.5 rounded-lg bg-zinc-900 text-white font-semibold"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {activeSection === 'mentorNote' && (
                        <div className="space-y-3">
                          <label className="block">
                            <span className="font-semibold text-zinc-700">
                              Заметки/наблюдения наставника (для AI)
                            </span>
                            <textarea
                              rows={2}
                              value={activeDoc.page2.mentorNote.observationsDraft}
                              onChange={(e) =>
                                onChangeJournal({
                                  ...activeDoc,
                                  page2: {
                                    ...activeDoc.page2,
                                    mentorNote: {
                                      ...activeDoc.page2.mentorNote,
                                      observationsDraft: e.target.value,
                                    },
                                  },
                                })
                              }
                              placeholder="Короткие факты: помог группе, разобрался в циклах..."
                              className="mt-1 w-full rounded-lg border border-zinc-200 px-2.5 py-1.5"
                            />
                          </label>

                          <button
                            type="button"
                            disabled={aiBusy}
                            onClick={handleGenerateAiMentorNote}
                            className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#0D9488] hover:bg-[#0F766E] text-white font-semibold disabled:opacity-60"
                          >
                            {aiBusy ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Sparkles className="w-3.5 h-3.5" />
                            )}
                            <span>
                              {aiBusy
                                ? 'Формулируем обращение...'
                                : 'Сгенерировать тёплое письмо (AI)'}
                            </span>
                          </button>

                          {aiError && (
                            <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-800">
                              {aiError}
                            </div>
                          )}

                          <div className="flex flex-wrap gap-1">
                            {MENTOR_NOTE_TEMPLATES.map((tpl) => (
                              <button
                                key={tpl.id}
                                type="button"
                                onClick={() =>
                                  onChangeJournal({
                                    ...activeDoc,
                                    page2: {
                                      ...activeDoc.page2,
                                      mentorNote: {
                                        ...activeDoc.page2.mentorNote,
                                        greeting: `${
                                          activeDoc.resident.fullName.split(' ')[0]
                                        }, ${tpl.greeting.toLowerCase()}`,
                                        body: tpl.body,
                                        signature: `Твой наставник, ${
                                          activeDoc.resident.mentorName.split(' ')[0]
                                        }`,
                                      },
                                    },
                                  })
                                }
                                className="px-2 py-1 rounded border border-zinc-200 bg-[#F9F9F7] hover:bg-zinc-100 text-[10px] font-medium"
                              >
                                {tpl.title}
                              </button>
                            ))}
                          </div>

                          <label className="block">
                            <span className="font-semibold text-zinc-700">
                              Приветствие
                            </span>
                            <input
                              type="text"
                              value={activeDoc.page2.mentorNote.greeting}
                              onChange={(e) =>
                                onChangeJournal({
                                  ...activeDoc,
                                  page2: {
                                    ...activeDoc.page2,
                                    mentorNote: {
                                      ...activeDoc.page2.mentorNote,
                                      greeting: e.target.value,
                                    },
                                  },
                                })
                              }
                              placeholder="Саша, ты отлично поработал!"
                              className="mt-1 w-full rounded-lg border border-zinc-200 px-2.5 py-1.5"
                            />
                          </label>

                          <label className="block">
                            <span className="font-semibold text-zinc-700">
                              Основной текст
                            </span>
                            <textarea
                              rows={4}
                              value={activeDoc.page2.mentorNote.body}
                              onChange={(e) =>
                                onChangeJournal({
                                  ...activeDoc,
                                  page2: {
                                    ...activeDoc.page2,
                                    mentorNote: {
                                      ...activeDoc.page2.mentorNote,
                                      body: e.target.value,
                                    },
                                  },
                                })
                              }
                              placeholder="Личный отзыв наставника..."
                              className="mt-1 w-full rounded-lg border border-zinc-200 px-2.5 py-1.5"
                            />
                          </label>

                          <label className="block">
                            <span className="font-semibold text-zinc-700">
                              Подпись
                            </span>
                            <input
                              type="text"
                              value={activeDoc.page2.mentorNote.signature}
                              onChange={(e) =>
                                onChangeJournal({
                                  ...activeDoc,
                                  page2: {
                                    ...activeDoc.page2,
                                    mentorNote: {
                                      ...activeDoc.page2.mentorNote,
                                      signature: e.target.value,
                                    },
                                  },
                                })
                              }
                              className="mt-1 w-full rounded-lg border border-zinc-200 px-2.5 py-1.5"
                            />
                          </label>
                        </div>
                      )}
                    </div>
                  </section>

                  {/* LIVE A4 PREVIEW STAGE */}
                  <section
                    ref={canvasStageRef}
                    className="flex-1 overflow-auto px-6 py-5 flex flex-col items-center justify-start bg-[#F2F2EE]"
                  >
                    <div className="mb-3 flex items-center gap-3 text-xs text-zinc-500">
                      <span>
                        Живой предпросмотр А4 · {activeDoc.resident.fullName}
                      </span>
                      <span className="font-mono text-[11px] text-zinc-400 tabular-nums">
                        {Math.round(effectiveScale * 100)}%
                      </span>
                    </div>

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
                        className={`flex items-start ${
                          effectiveSpread ? 'gap-3' : ''
                        }`}
                      >
                        {(effectiveSpread || pageFocus === 1) && (
                          <div className="shadow-[0_18px_45px_rgba(0,0,0,0.16)] rounded-xs overflow-hidden">
                            <JournalPageOne
                              doc={activeDoc}
                              mediaAssets={mediaAssets}
                              scaleFactor={effectiveScale}
                              onSelectTarget={handleSelectTargetOnA4}
                            />
                          </div>
                        )}

                        {(effectiveSpread || pageFocus === 2) && (
                          <div className="shadow-[0_18px_45px_rgba(0,0,0,0.16)] rounded-xs overflow-hidden">
                            <JournalPageTwo
                              doc={activeDoc}
                              scaleFactor={effectiveScale}
                              onSelectTarget={handleSelectTargetOnA4}
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onOpenPreview(activeDoc.id)}
                      className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-900"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                      <span>Открыть полноэкранный разворот</span>
                    </button>
                  </section>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
