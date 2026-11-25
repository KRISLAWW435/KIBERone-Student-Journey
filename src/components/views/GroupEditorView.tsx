import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  BookOpen,
  Camera,
  Check,
  CheckSquare,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Columns2,
  Crop,
  Eye,
  EyeOff,
  FolderArchive,
  Hand,
  Image as ImageIcon,
  Layers,
  Lightbulb,
  Loader2,
  Lock,
  MapPin,
  Maximize2,
  Paintbrush,
  Palette,
  PenLine,
  Plus,
  Redo2,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Smile,
  Sparkles,
  Square,
  Trash2,
  Trophy,
  Type,
  Undo2,
  Unlock,
  Upload,
  User,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import {
  getModuleAgeCategories,
  MODULE_CATEGORIES,
  UNIFIED_SKILLS_CATALOG,
} from '../../data/curriculumCatalog';
import {
  ASSETS,
  DEFAULT_SPEECH_BUBBLE_TEXT,
  DESIGN_PALETTES,
  MENTOR_NOTE_TEMPLATES,
  NEXT_TOPIC_LIBRARY,
  SPEECH_BUBBLE_PRESETS,
  STICKER_PRESET_OPTIONS,
  StickerPresetOption,
  STRENGTH_LIBRARY,
} from '../../data/presets';
import {
  ActiveTextFieldTarget,
  AgeCategory,
  Branch,
  CanvasObjectTransform,
  DecorElement,
  EditorSectionTarget,
  GroupCommonCurriculum,
  GroupCurriculumTemplate,
  JournalDocument,
  LibraryModule,
  MediaAsset,
  MediaCategory,
  ModuleCategoryConfig,
  ModuleItem,
  ModuleLucideIconKey,
  NextTopicIconKey,
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
  getStudentStatusMeta,
  normalizeStudentStatus,
} from '../../utils/journalProgress';
import { ExportMenu } from '../ExportMenu';
import {
  A4_PAGE_HEIGHT,
  A4_PAGE_WIDTH,
  A4_SPREAD_GAP,
  A4PageSlot,
} from '../journal/A4SpreadFrame';
import { COVER_OBJECT_DEFAULTS } from '../journal/CoverSection';
import {
  MODULE_VECTOR_ICON_OPTIONS,
  ModuleSvgIllustration,
  ModuleVectorIcon,
  NextTopicLineIcon,
} from '../journal/JournalArtwork';
import { JournalPageOne } from '../journal/JournalPageOne';
import { JournalPageTwo } from '../journal/JournalPageTwo';

const flatInputClass =
  'w-full bg-transparent border-0 border-b border-zinc-200 rounded-none px-0.5 py-1.5 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-[#0D9488] transition-colors';
const flatSelectClass =
  'w-full bg-transparent border-0 border-b border-zinc-200 rounded-none px-0.5 py-1.5 text-xs text-zinc-900 focus:outline-none focus:border-[#0D9488] transition-colors cursor-pointer';
const flatTextareaClass =
  'w-full bg-transparent border-0 border-b border-zinc-200 rounded-none px-0.5 py-1.5 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-[#0D9488] transition-colors resize-none';

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
  initialTab?: EditorTab;
  initialJournalId?: string | null;
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
type IndividualSection =
  | 'profile'
  | 'curriculum'
  | 'projects'
  | 'pride'
  | 'mentorNote';
type InspectorMode = 'content' | 'design';
type CommonStep = 1 | 2 | 3 | 4;

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
  initialTab = 'common',
  initialJournalId = null,
  onSelectActiveJournal,
  onChangeJournal: onCommitJournalToStore,
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
  const [editorTab, setEditorTab] = useState<EditorTab>(initialTab);
  const [pageFocus, setPageFocus] = useState<PageFocus>(1);
  const [zoom, setZoom] = useState<'auto' | number>('auto');
  const [autoScale, setAutoScale] = useState(0.68);

  // Resizable & collapsible side panels (Figma-style)
  const [leftWidth, setLeftWidth] = useState(284);
  const [rightWidth, setRightWidth] = useState(364);
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);
  const [draggingSide, setDraggingSide] = useState<'left' | 'right' | null>(
    null
  );
  const dragSessionRef = useRef<{
    side: 'left' | 'right';
    startX: number;
    startWidth: number;
  } | null>(null);

  // Right Inspector state (Figma-style: Content vs Design tab + 5-step icon tab stepper)
  const [inspectorMode, setInspectorMode] = useState<InspectorMode>('content');
  const [activeTarget, setActiveTarget] = useState<EditorSectionTarget>(null);
  const [activeTextField, setActiveTextField] =
    useState<ActiveTextFieldTarget>(null);
  const textEditorRef = useRef<HTMLTextAreaElement | null>(null);
  const [designTargetPage, setDesignTargetPage] = useState<1 | 2>(1);
  const [designIconPickerOpen, setDesignIconPickerOpen] = useState(false);
  const [designStickerPickerOpen, setDesignStickerPickerOpen] = useState(false);
  const [activeInspectorStep, setActiveInspectorStep] =
    useState<IndividualSection>('profile');
  const [editingModuleVisual, setEditingModuleVisual] = useState<{
    scope: 'common' | 'individual';
    id: string;
  } | null>(null);
  const [editingTopicIconId, setEditingTopicIconId] = useState<string | null>(
    null
  );
  const [highlightedStudentModId, setHighlightedStudentModId] = useState<
    string | null
  >(null);

  // Safe inline deletion confirmation states
  const [confirmDeleteStudentId, setConfirmDeleteStudentId] = useState<
    string | null
  >(null);
  const [confirmDeleteProjectId, setConfirmDeleteProjectId] = useState<
    string | null
  >(null);
  const [confirmDeleteCommonModId, setConfirmDeleteCommonModId] = useState<
    string | null
  >(null);
  const [confirmDeleteCommonSkillId, setConfirmDeleteCommonSkillId] = useState<
    string | null
  >(null);
  const [confirmDeleteIndModId, setConfirmDeleteIndModId] = useState<
    string | null
  >(null);
  const [confirmDeleteIndSkillId, setConfirmDeleteIndSkillId] = useState<
    string | null
  >(null);

  // Per-student curriculum override UI state
  const [individualModPickerOpen, setIndividualModPickerOpen] = useState(false);
  const [individualModSearch, setIndividualModSearch] = useState('');
  const [customIndividualModTitle, setCustomIndividualModTitle] = useState('');
  const [customIndividualModSub, setCustomIndividualModSub] = useState('');
  const [newIndividualSkill, setNewIndividualSkill] = useState('');

  // Common Stepper state (1..4) & Quick Picker Modals
  const [commonStep, setCommonStep] = useState<CommonStep>(1);
  const [modulesModalOpen, setModulesModalOpen] = useState(false);
  const [modalModSearch, setModalModSearch] = useState('');
  const [modalModCategory, setModalModCategory] = useState<string>('all');
  const [modalAgeFilter, setModalAgeFilter] = useState<'group' | 'all'>(
    'group'
  );
  const [draftModalModuleIds, setDraftModalModuleIds] = useState<string[]>([]);

  const [skillsModalOpen, setSkillsModalOpen] = useState(false);
  const [modalSkillSearch, setModalSkillSearch] = useState('');
  const [draftModalSkillIds, setDraftModalSkillIds] = useState<string[]>([]);

  const [topicsModalOpen, setTopicsModalOpen] = useState(false);
  const [modalTopicSearch, setModalTopicSearch] = useState('');
  const [draftModalTopicTitles, setDraftModalTopicTitles] = useState<string[]>(
    []
  );

  // Student list filters & quick add
  const [onlyActive, setOnlyActive] = useState(true);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [quickName, setQuickName] = useState('');
  const [quickAge, setQuickAge] = useState('');

  const allGroupStudents = useMemo(
    () => residents.filter((r) => r.groupId === group.id),
    [residents, group.id]
  );

  const groupStudents = useMemo(
    () =>
      allGroupStudents.filter((r) =>
        onlyActive ? normalizeStudentStatus(r.status) === 'active' : true
      ),
    [allGroupStudents, onlyActive]
  );

  const activeStudentsOnly = useMemo(
    () =>
      allGroupStudents.filter(
        (r) => normalizeStudentStatus(r.status) === 'active'
      ),
    [allGroupStudents]
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

  const resolveStudentIdForJournal = useCallback(
    (jId: string | null | undefined): string => {
      if (!jId) return '';
      const matchedJournal = journals.find((j) => j.id === jId);
      const matchedStudent = allGroupStudents.find(
        (s) =>
          s.journalId === jId ||
          (matchedJournal?.residentId && s.id === matchedJournal.residentId)
      );
      return matchedStudent?.id ?? '';
    },
    [allGroupStudents, journals]
  );

  const [selectedStudentId, setSelectedStudentId] = useState<string>(() =>
    initialTab === 'individual'
      ? resolveStudentIdForJournal(initialJournalId ?? activeJournalId)
      : ''
  );
  const [expandedStudentIds, setExpandedStudentIds] = useState<
    Record<string, boolean>
  >({});

  const lastAppliedEntryRef = useRef<string>(
    `${initialTab}:${initialJournalId ?? ''}`
  );

  useEffect(() => {
    const entryKey = `${initialTab}:${initialJournalId ?? ''}`;
    if (lastAppliedEntryRef.current === entryKey) return;
    lastAppliedEntryRef.current = entryKey;
    if (initialTab === 'individual') {
      setEditorTab('individual');
      const targetStudentId = resolveStudentIdForJournal(
        initialJournalId ?? activeJournalId
      );
      if (targetStudentId) {
        setSelectedStudentId(targetStudentId);
        const matched = allGroupStudents.find((s) => s.id === targetStudentId);
        if (matched && normalizeStudentStatus(matched.status) !== 'active') {
          setOnlyActive(false);
        }
      }
    }
  }, [
    initialTab,
    initialJournalId,
    activeJournalId,
    resolveStudentIdForJournal,
    allGroupStudents,
  ]);

  useEffect(() => {
    if (
      selectedStudentId &&
      !allGroupStudents.some((s) => s.id === selectedStudentId)
    ) {
      setSelectedStudentId('');
    }
  }, [allGroupStudents, selectedStudentId]);

  const selectedStudent = selectedStudentId
    ? allGroupStudents.find((s) => s.id === selectedStudentId) ?? null
    : null;

  const activeDoc = selectedStudent
    ? findStudentJournal(selectedStudent) ?? null
    : null;

  useEffect(() => {
    if (activeDoc && activeDoc.id !== activeJournalId) {
      onSelectActiveJournal(activeDoc.id);
    }
  }, [activeDoc, activeJournalId, onSelectActiveJournal]);

  useEffect(() => {
    setActiveTextField(null);
    setActiveTarget(null);
  }, [activeDoc?.id]);

  const activeTextKey = activeTextField
    ? `${activeTextField.page}:${activeTextField.field}:${
        'itemId' in activeTextField ? activeTextField.itemId : ''
      }`
    : '';

  useEffect(() => {
    if (!activeTextKey) return;
    const raf = window.requestAnimationFrame(() => {
      const el = textEditorRef.current;
      if (el) {
        el.focus();
        const len = el.value.length;
        el.setSelectionRange(len, len);
      }
    });
    return () => window.cancelAnimationFrame(raf);
  }, [activeTextKey]);

  // Per-journal Undo / Redo history stack (up to 50 steps, coalesces drags & typing)
  const activeDocRef = useRef<JournalDocument | null>(activeDoc);
  activeDocRef.current = activeDoc;
  const historyRef = useRef<
    Record<string, { past: JournalDocument[]; future: JournalDocument[] }>
  >({});
  const [, setHistoryVersion] = useState(0);
  const gestureActiveRef = useRef(false);
  const gestureSnapshotRef = useRef<JournalDocument | null>(null);
  const lastHistoryPushRef = useRef<{ docId: string; ts: number }>({
    docId: '',
    ts: 0,
  });

  const onChangeJournal = useCallback(
    (updated: JournalDocument) => {
      const current = activeDocRef.current;
      if (gestureActiveRef.current) {
        activeDocRef.current = updated;
        onCommitJournalToStore(updated);
        return;
      }

      if (current && current.id === updated.id) {
        const now = Date.now();
        const bucket =
          historyRef.current[current.id] ??
          (historyRef.current[current.id] = { past: [], future: [] });
        const shouldCoalesce =
          lastHistoryPushRef.current.docId === current.id &&
          now - lastHistoryPushRef.current.ts < 420 &&
          bucket.past.length > 0;

        if (!shouldCoalesce) {
          bucket.past = [...bucket.past, current].slice(-50);
        }
        bucket.future = [];
        lastHistoryPushRef.current = { docId: current.id, ts: now };
        setHistoryVersion((v) => v + 1);
      }

      activeDocRef.current = updated;
      onCommitJournalToStore(updated);
    },
    [onCommitJournalToStore]
  );

  const handleBeginCanvasGesture = useCallback(() => {
    gestureActiveRef.current = true;
    gestureSnapshotRef.current = activeDocRef.current;
  }, []);

  const handleEndCanvasGesture = useCallback(() => {
    const startSnap = gestureSnapshotRef.current;
    gestureActiveRef.current = false;
    gestureSnapshotRef.current = null;
    const current = activeDocRef.current;
    if (startSnap && current && startSnap.id === current.id && startSnap !== current) {
      const bucket =
        historyRef.current[current.id] ??
        (historyRef.current[current.id] = { past: [], future: [] });
      bucket.past = [...bucket.past, startSnap].slice(-50);
      bucket.future = [];
      lastHistoryPushRef.current = { docId: '', ts: 0 };
      setHistoryVersion((v) => v + 1);
    }
  }, []);

  const currentHistory = activeDoc
    ? historyRef.current[activeDoc.id]
    : undefined;
  const canUndo = Boolean(currentHistory && currentHistory.past.length > 0);
  const canRedo = Boolean(currentHistory && currentHistory.future.length > 0);

  const handleUndo = useCallback(() => {
    const current = activeDocRef.current;
    if (!current) return;
    const bucket = historyRef.current[current.id];
    if (!bucket || bucket.past.length === 0) return;
    const previous = bucket.past[bucket.past.length - 1];
    bucket.past = bucket.past.slice(0, -1);
    bucket.future = [current, ...bucket.future].slice(0, 50);
    lastHistoryPushRef.current = { docId: '', ts: 0 };
    setHistoryVersion((v) => v + 1);
    activeDocRef.current = previous;
    onCommitJournalToStore(previous);
  }, [onCommitJournalToStore]);

  const handleRedo = useCallback(() => {
    const current = activeDocRef.current;
    if (!current) return;
    const bucket = historyRef.current[current.id];
    if (!bucket || bucket.future.length === 0) return;
    const next = bucket.future[0];
    bucket.future = bucket.future.slice(1);
    bucket.past = [...bucket.past, current].slice(-50);
    lastHistoryPushRef.current = { docId: '', ts: 0 };
    setHistoryVersion((v) => v + 1);
    activeDocRef.current = next;
    onCommitJournalToStore(next);
  }, [onCommitJournalToStore]);

  // Keyboard shortcuts Ctrl+Z / Cmd+Z (Undo) and Ctrl+Y / Cmd+Shift+Z (Redo)
  useEffect(() => {
    if (editorTab !== 'individual' || !activeDoc?.id) return;
    const isTypingTarget = (target: EventTarget | null) => {
      if (!(target instanceof HTMLElement)) return false;
      const tag = target.tagName;
      return (
        tag === 'INPUT' ||
        tag === 'TEXTAREA' ||
        tag === 'SELECT' ||
        target.isContentEditable
      );
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey) || e.altKey) return;
      if (isTypingTarget(e.target) || isTypingTarget(document.activeElement)) {
        return;
      }
      if (e.code === 'KeyZ' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      } else if (e.code === 'KeyY' || (e.code === 'KeyZ' && e.shiftKey)) {
        e.preventDefault();
        handleRedo();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [editorTab, activeDoc?.id, handleUndo, handleRedo]);

  // Common group data draft state
  const [groupDraft, setGroupDraft] = useState<StudentGroup>(() => ({
    ...group,
  }));
  const [commonDraft, setCommonDraft] = useState<GroupCommonCurriculum>(() =>
    buildDefaultCommonData(group)
  );
  const [commonSearch, setCommonSearch] = useState('');
  const [newCustomSkill, setNewCustomSkill] = useState('');
  const [newNextTopicTitle, setNewNextTopicTitle] = useState('');
  const [applyingCommon, setApplyingCommon] = useState(false);

  const topicsCatalogOptions = useMemo(() => {
    const mapCategoryToTopicIcon = (
      cat: string,
      title: string
    ): NextTopicIconKey => {
      const t = title.toLowerCase();
      if (cat === 'ai' || t.includes('ии') || t.includes('нейро')) return 'ai';
      if (cat === 'design-3d' || t.includes('3d') || t.includes('blender'))
        return 'cube3d';
      if (cat === 'web-mobile' && (t.includes('моб') || t.includes('android')))
        return 'mobile';
      if (cat === 'web-mobile' || t.includes('веб') || t.includes('html'))
        return 'web';
      if (cat === 'games' || t.includes('игр') || t.includes('roblox'))
        return 'gamepad';
      return 'python';
    };

    const items: Array<{
      id: string;
      title: string;
      subtitle: string;
      iconKey: NextTopicIconKey;
    }> = NEXT_TOPIC_LIBRARY.map((item, i) => ({
      id: `preset-topic-${i}`,
      title: item.title,
      subtitle: 'Рекомендуемое направление',
      iconKey: item.iconKey,
    }));

    const seen = new Set(items.map((x) => x.title.toLowerCase()));
    libraryModules.forEach((m) => {
      if (m.isActive === false) return;
      const title = (m.displayTitle || m.title).trim();
      if (!title || seen.has(title.toLowerCase())) return;
      seen.add(title.toLowerCase());
      items.push({
        id: m.id,
        title,
        subtitle: m.subtitle || 'Модуль из каталога',
        iconKey: m.iconKey || mapCategoryToTopicIcon(m.category, title),
      });
    });

    return items;
  }, [libraryModules]);

  const openTopicsPickerModal = () => {
    setDraftModalTopicTitles(commonDraft.nextChapterTopics.map((t) => t.title));
    setModalTopicSearch('');
    setTopicsModalOpen(true);
  };

  const confirmTopicsModal = () => {
    const existingByTitle = new Map(
      commonDraft.nextChapterTopics.map((t) => [t.title.toLowerCase(), t])
    );
    const catalogByTitle = new Map(
      topicsCatalogOptions.map((o) => [o.title.toLowerCase(), o])
    );
    const nextTopics: NextTopicItem[] = draftModalTopicTitles.map(
      (title, idx) => {
        const key = title.toLowerCase();
        const existing = existingByTitle.get(key);
        if (existing) return existing;
        const cat = catalogByTitle.get(key);
        return {
          id: `nt-${Date.now()}-${idx}`,
          title,
          iconKey: cat?.iconKey ?? 'ai',
        };
      }
    );
    setCommonDraft((prev) => ({
      ...prev,
      nextChapterTopics: nextTopics,
    }));
    setTopicsModalOpen(false);
  };

  const handleAddCustomNextTopic = () => {
    const trimmed = newNextTopicTitle.trim();
    if (!trimmed) return;
    if (
      commonDraft.nextChapterTopics.some(
        (t) => t.title.toLowerCase() === trimmed.toLowerCase()
      )
    ) {
      setNewNextTopicTitle('');
      return;
    }
    const item: NextTopicItem = {
      id: `nt-custom-${Date.now()}`,
      title: trimmed,
      iconKey: 'ai',
    };
    setCommonDraft((prev) => ({
      ...prev,
      nextChapterTopics: [...prev.nextChapterTopics, item],
    }));
    setNewNextTopicTitle('');
  };

  // When opening or switching groups, start on Group Common Data Step 1 with no student pre-selected
  useEffect(() => {
    setEditorTab('common');
    setCommonStep(1);
    setSelectedStudentId('');
    setExpandedStudentIds({});
    setActiveInspectorStep('profile');
    setEditingModuleVisual(null);
    setEditingTopicIconId(null);
    setHighlightedStudentModId(null);
  }, [group.id]);

  // Keep draft synced when group data updates
  useEffect(() => {
    setGroupDraft({ ...group });
    setCommonDraft(buildDefaultCommonData(group));
  }, [group.id, group.updatedAt]);

  // Global mouse drag listeners for Figma-style panel resizing
  const startResize = useCallback(
    (side: 'left' | 'right', e: React.MouseEvent) => {
      e.preventDefault();
      dragSessionRef.current = {
        side,
        startX: e.clientX,
        startWidth: side === 'left' ? leftWidth : rightWidth,
      };
      setDraggingSide(side);
    },
    [leftWidth, rightWidth]
  );

  useEffect(() => {
    if (!draggingSide) return;
    const handleMouseMove = (e: MouseEvent) => {
      const session = dragSessionRef.current;
      if (!session) return;
      const delta = e.clientX - session.startX;
      if (session.side === 'left') {
        const clamped = Math.min(400, Math.max(220, session.startWidth + delta));
        setLeftWidth(clamped);
      } else {
        const clamped = Math.min(540, Math.max(280, session.startWidth - delta));
        setRightWidth(clamped);
      }
    };
    const handleMouseUp = () => {
      dragSessionRef.current = null;
      setDraggingSide(null);
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingSide]);

  // AI Mentor Note state
  const [aiBusy, setAiBusy] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [newStrengthTitle, setNewStrengthTitle] = useState('');

  // Canvas ResizeObserver & Figma-style Pan + Cursor-anchored Zoom
  const canvasStageRef = useRef<HTMLDivElement | null>(null);
  const effectiveSpread = pageFocus === 'spread';
  const logicalW = effectiveSpread
    ? A4_PAGE_WIDTH * 2 + A4_SPREAD_GAP
    : A4_PAGE_WIDTH;

  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({
    x: 24,
    y: 20,
  });
  const [spacePressed, setSpacePressed] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const panOffsetRef = useRef(panOffset);
  panOffsetRef.current = panOffset;
  const panStartRef = useRef<{
    clientX: number;
    clientY: number;
    startX: number;
    startY: number;
  } | null>(null);

  const computeCenteredPan = useCallback(
    (scale: number, el: HTMLDivElement | null) => {
      if (!el) return { x: 24, y: 20 };
      const w = el.clientWidth;
      const h = el.clientHeight;
      const scaledW = logicalW * scale;
      const scaledH = A4_PAGE_HEIGHT * scale;
      return {
        x: Math.round((w - scaledW) / 2),
        y: Math.round(Math.max(16, (h - scaledH) / 2)),
      };
    },
    [logicalW]
  );

  const fitAndCenterCanvas = useCallback(() => {
    const el = canvasStageRef.current;
    if (!el) {
      setZoom('auto');
      return;
    }
    const availableW = Math.max(220, el.clientWidth - 48);
    const availableH = Math.max(320, el.clientHeight - 40);
    const targetW = effectiveSpread
      ? A4_PAGE_WIDTH * 2 + A4_SPREAD_GAP
      : A4_PAGE_WIDTH;
    const scaleW = availableW / targetW;
    const scaleH = availableH / A4_PAGE_HEIGHT;
    const fitted = Number(
      Math.min(1, Math.max(0.28, Math.min(scaleW, scaleH * 1.02))).toFixed(3)
    );
    setAutoScale(fitted);
    setZoom('auto');
    setPanOffset(computeCenteredPan(fitted, el));
  }, [computeCenteredPan, effectiveSpread]);

  useEffect(() => {
    if (editorTab !== 'individual' || !selectedStudentId) return;
    const el = canvasStageRef.current;
    if (!el) return;
    const recalc = () => {
      const availableW = Math.max(220, el.clientWidth - 48);
      const availableH = Math.max(320, el.clientHeight - 40);
      const targetW = effectiveSpread
        ? A4_PAGE_WIDTH * 2 + A4_SPREAD_GAP
        : A4_PAGE_WIDTH;
      const scaleW = availableW / targetW;
      const scaleH = availableH / A4_PAGE_HEIGHT;
      const next = Number(
        Math.min(1, Math.max(0.28, Math.min(scaleW, scaleH * 1.02))).toFixed(3)
      );
      setAutoScale(next);
      if (zoom === 'auto') {
        setPanOffset(computeCenteredPan(next, el));
      }
    };
    recalc();
    const raf = window.requestAnimationFrame(recalc);
    const obs = new ResizeObserver(recalc);
    obs.observe(el);
    return () => {
      window.cancelAnimationFrame(raf);
      obs.disconnect();
    };
  }, [
    editorTab,
    pageFocus,
    effectiveSpread,
    selectedStudentId,
    leftWidth,
    rightWidth,
    leftCollapsed,
    rightCollapsed,
    zoom,
    computeCenteredPan,
  ]);

  // Center canvas nicely when switching student or page mode
  useEffect(() => {
    if (editorTab !== 'individual' || !selectedStudentId) return;
    const raf = window.requestAnimationFrame(() => {
      fitAndCenterCanvas();
    });
    return () => window.cancelAnimationFrame(raf);
  }, [editorTab, selectedStudentId, pageFocus, fitAndCenterCanvas]);

  const effectiveScale = zoom === 'auto' ? autoScale : zoom;
  const effectiveScaleRef = useRef(effectiveScale);
  effectiveScaleRef.current = effectiveScale;

  // Native non-passive wheel listener for smooth zoom toward cursor
  useEffect(() => {
    if (editorTab !== 'individual' || !selectedStudentId) return;
    const el = canvasStageRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const prevScale = effectiveScaleRef.current;
      const sensitivity = e.ctrlKey ? 0.01 : 0.0022;
      const factor = Math.exp(-e.deltaY * sensitivity);
      const nextScale = Number(
        Math.min(2.2, Math.max(0.25, prevScale * factor)).toFixed(3)
      );
      if (nextScale === prevScale) return;

      const curPan = panOffsetRef.current;
      const contentX = (mouseX - curPan.x) / prevScale;
      const contentY = (mouseY - curPan.y) / prevScale;

      setZoom(nextScale);
      setPanOffset({
        x: Math.round(mouseX - contentX * nextScale),
        y: Math.round(mouseY - contentY * nextScale),
      });
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [editorTab, selectedStudentId]);

  // Spacebar hand mode (ignores inputs/textareas/selects/contentEditable)
  useEffect(() => {
    if (editorTab !== 'individual' || !selectedStudentId) {
      setSpacePressed(false);
      return;
    }
    const isTypingTarget = (target: EventTarget | null) => {
      if (!(target instanceof HTMLElement)) return false;
      const tag = target.tagName;
      return (
        tag === 'INPUT' ||
        tag === 'TEXTAREA' ||
        tag === 'SELECT' ||
        target.isContentEditable
      );
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code !== 'Space') return;
      if (isTypingTarget(e.target) || isTypingTarget(document.activeElement)) {
        return;
      }
      e.preventDefault();
      if (!e.repeat) setSpacePressed(true);
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') setSpacePressed(false);
    };
    const onBlur = () => {
      setSpacePressed(false);
      setIsPanning(false);
      panStartRef.current = null;
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
    };
  }, [editorTab, selectedStudentId]);

  // Mouse drag pan when Space+LMB or Middle Mouse Button is held
  useEffect(() => {
    if (!isPanning) return;
    const handleMouseMove = (e: MouseEvent) => {
      const s = panStartRef.current;
      if (!s) return;
      setPanOffset({
        x: Math.round(s.startX + (e.clientX - s.clientX)),
        y: Math.round(s.startY + (e.clientY - s.clientY)),
      });
    };
    const handleMouseUp = () => {
      panStartRef.current = null;
      setIsPanning(false);
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isPanning]);

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button === 1 || (e.button === 0 && spacePressed)) {
      e.preventDefault();
      panStartRef.current = {
        clientX: e.clientX,
        clientY: e.clientY,
        startX: panOffset.x,
        startY: panOffset.y,
      };
      setIsPanning(true);
    }
  };

  const applyPresetZoom = (preset: 'auto' | number) => {
    if (preset === 'auto') {
      fitAndCenterCanvas();
      return;
    }
    const el = canvasStageRef.current;
    if (el) {
      const cx = el.clientWidth / 2;
      const cy = el.clientHeight / 2;
      const prev = effectiveScale;
      const contentX = (cx - panOffset.x) / prev;
      const contentY = (cy - panOffset.y) / prev;
      setPanOffset({
        x: Math.round(cx - contentX * preset),
        y: Math.round(cy - contentY * preset),
      });
    }
    setZoom(preset);
  };

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

  const focusSection = (sec: IndividualSection, page?: 1 | 2) => {
    setInspectorMode('content');
    setActiveInspectorStep(sec);
    if (page && pageFocus !== 'spread') {
      setPageFocus(page);
    }
  };

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

  const effectiveDesignPage: 1 | 2 =
    pageFocus === 'spread'
      ? activeTarget?.page ?? designTargetPage
      : pageFocus;

  const getBlockIdFromTarget = (target: EditorSectionTarget): string | null => {
    if (!target || target.block === 'background' || target.block === 'decor') {
      return null;
    }
    if (target.block === 'module') return `module-${target.itemId}`;
    if (target.block === 'project') return `project-${target.itemId}`;
    return target.block;
  };

  const getDefaultZForBlock = (blockId: string): number => {
    if (blockId === 'coverBubble') return 28;
    if (blockId === 'coverBear') return 25;
    if (blockId === 'coverInfo') return 24;
    if (
      blockId === 'coverTitle' ||
      blockId === 'coverSubtitle' ||
      blockId === 'logo'
    ) {
      return 22;
    }
    if (blockId === 'prideBear' || blockId === 'nextBear') {
      return 20;
    }
    return 10;
  };

  const getBlockLabel = (t: EditorSectionTarget): string => {
    if (!t) return '';
    switch (t.block) {
      case 'cover':
        return 'Обложка (верхняя шапка)';
      case 'coverTitle':
        return 'Заголовок «МОЙ ПУТЬ»';
      case 'coverSubtitle':
        return 'Подзаголовок «в мире технологий»';
      case 'coverInfo':
        return 'Плашка с данными ученика';
      case 'coverBubble':
        return 'Облачко с репликой (Стр. 1)';
      case 'coverBear':
        return 'Мишка на обложке';
      case 'logo':
        return 'Логотип KIBERone';
      case 'modulesBlock':
        return 'Секция «Мои открытия»';
      case 'module':
        return (
          activeDoc?.page1.modules.find((m) => m.id === t.itemId)?.title ||
          'Карточка модуля'
        );
      case 'skills':
        return 'Блок «Чему я научился»';
      case 'projectsBlock':
        return 'Секция «Мои результаты»';
      case 'project':
        return (
          activeDoc?.page1.projects.find((p) => p.id === t.itemId)?.title ||
          'Карточка проекта'
        );
      case 'header':
        return 'Шапка «Мои достижения»';
      case 'strengths':
        return 'Секция «Мои сильные стороны»';
      case 'pride':
        return 'Блок «Мой момент гордости»';
      case 'prideBear':
        return 'Мишка в блоке гордости';
      case 'mentorNote':
        return 'Лист «Слово наставника»';
      case 'nextChapter':
        return 'Блок «Что интересного впереди?»';
      case 'nextBear':
        return 'Мишка внизу страницы 2';
      default:
        return 'Элемент макета';
    }
  };

  const handleUpdatePageTransform = (
    page: 1 | 2,
    blockId: string,
    next: CanvasObjectTransform
  ) => {
    if (!activeDoc) return;
    if (page === 1) {
      onChangeJournal({
        ...activeDoc,
        page1: {
          ...activeDoc.page1,
          objectLayouts: {
            ...(activeDoc.page1.objectLayouts ?? {}),
            [blockId]: next,
          },
        },
      });
    } else {
      onChangeJournal({
        ...activeDoc,
        page2: {
          ...activeDoc.page2,
          objectLayouts: {
            ...(activeDoc.page2.objectLayouts ?? {}),
            [blockId]: next,
          },
        },
      });
    }
  };

  const handleMoveDecor = (page: 1 | 2, decorId: string, x: number, y: number) => {
    if (!activeDoc) return;
    if (page === 1) {
      onChangeJournal({
        ...activeDoc,
        page1: {
          ...activeDoc.page1,
          decorElements: (activeDoc.page1.decorElements ?? []).map((el) =>
            el.id === decorId ? { ...el, x, y } : el
          ),
        },
      });
    } else {
      onChangeJournal({
        ...activeDoc,
        page2: {
          ...activeDoc.page2,
          decorElements: (activeDoc.page2.decorElements ?? []).map((el) =>
            el.id === decorId ? { ...el, x, y } : el
          ),
        },
      });
    }
  };

  const handleUpdateDecor = (
    page: 1 | 2,
    decorId: string,
    patch: Partial<DecorElement>
  ) => {
    if (!activeDoc) return;
    if (page === 1) {
      onChangeJournal({
        ...activeDoc,
        page1: {
          ...activeDoc.page1,
          decorElements: (activeDoc.page1.decorElements ?? []).map((el) =>
            el.id === decorId ? { ...el, ...patch } : el
          ),
        },
      });
    } else {
      onChangeJournal({
        ...activeDoc,
        page2: {
          ...activeDoc.page2,
          decorElements: (activeDoc.page2.decorElements ?? []).map((el) =>
            el.id === decorId ? { ...el, ...patch } : el
          ),
        },
      });
    }
  };

  const handleDeleteDecor = (page: 1 | 2, decorId: string) => {
    if (!activeDoc) return;
    if (page === 1) {
      onChangeJournal({
        ...activeDoc,
        page1: {
          ...activeDoc.page1,
          decorElements: (activeDoc.page1.decorElements ?? []).filter(
            (el) => el.id !== decorId
          ),
        },
      });
    } else {
      onChangeJournal({
        ...activeDoc,
        page2: {
          ...activeDoc.page2,
          decorElements: (activeDoc.page2.decorElements ?? []).filter(
            (el) => el.id !== decorId
          ),
        },
      });
    }
    lastHistoryPushRef.current.ts = 0;
    if (
      activeTarget?.page === page &&
      activeTarget.block === 'decor' &&
      activeTarget.itemId === decorId
    ) {
      setActiveTarget(null);
    }
  };

  const getNextMaxZIndex = (page: 1 | 2): number => {
    if (!activeDoc) return 25;
    const layouts =
      page === 1
        ? activeDoc.page1.objectLayouts ?? {}
        : activeDoc.page2.objectLayouts ?? {};
    const decors =
      page === 1
        ? activeDoc.page1.decorElements ?? []
        : activeDoc.page2.decorElements ?? [];
    const values = [
      10,
      20,
      ...Object.values(layouts).map((t) => t.zIndex ?? 10),
      ...decors.map((d) => d.zIndex ?? 20),
    ];
    return Math.max(...values) + 1;
  };

  const handleAddDecorElement = (
    page: 1 | 2,
    partial: Omit<DecorElement, 'id' | 'zIndex'>
  ) => {
    if (!activeDoc) return;
    const id = `decor-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const nextEl: DecorElement = {
      ...partial,
      id,
      zIndex: getNextMaxZIndex(page),
    };
    if (page === 1) {
      onChangeJournal({
        ...activeDoc,
        page1: {
          ...activeDoc.page1,
          decorElements: [...(activeDoc.page1.decorElements ?? []), nextEl],
        },
      });
    } else {
      onChangeJournal({
        ...activeDoc,
        page2: {
          ...activeDoc.page2,
          decorElements: [...(activeDoc.page2.decorElements ?? []), nextEl],
        },
      });
    }
    lastHistoryPushRef.current.ts = 0;
    setActiveTarget({ page, block: 'decor', itemId: id });
    if (partial.kind === 'text') {
      setActiveTextField({ page, field: 'decorText', itemId: id });
    }
  };

  const handleAddTextElement = (page: 1 | 2) => {
    handleAddDecorElement(page, {
      kind: 'text',
      label: 'Текстовый блок',
      text: 'Новый текстовый блок',
      x: 240,
      y: 430,
      width: 240,
      height: 64,
      rotation: 0,
      opacity: 1,
      color: '#111827',
      bgColor: 'rgba(255,255,255,0.92)',
      fontSize: 18,
      fontWeight: 'bold',
      fontFamily: 'journal',
      textAlign: 'left',
    });
  };

  const handleAddImageElement = (page: 1 | 2) => {
    onOpenMediaPicker('decor', (url, asset) => {
      const insertWithSize = (w: number, h: number) => {
        handleAddDecorElement(page, {
          kind: 'image',
          label: asset?.name || 'Изображение',
          imageUrl: url,
          cropEnabled: false,
          x: Math.round((794 - w) / 2),
          y: 360,
          width: w,
          height: h,
          rotation: 0,
          opacity: 1,
          color: '#111827',
        });
      };

      const probe = new window.Image();
      probe.onload = () => {
        const nw = probe.naturalWidth || 200;
        const nh = probe.naturalHeight || 200;
        const maxSide = 220;
        if (nw >= nh) {
          insertWithSize(maxSide, Math.max(48, Math.round((nh / nw) * maxSide)));
        } else {
          insertWithSize(Math.max(48, Math.round((nw / nh) * maxSide)), maxSide);
        }
      };
      probe.onerror = () => insertWithSize(200, 200);
      probe.src = url;
    });
  };

  const handleAddIconElement = (
    page: 1 | 2,
    iconKey: ModuleLucideIconKey,
    label: string
  ) => {
    handleAddDecorElement(page, {
      kind: 'icon',
      iconKey,
      label,
      x: 330,
      y: 440,
      width: 84,
      height: 84,
      rotation: 0,
      opacity: 1,
      color: '#111827',
      bgColor: '#FFFFFF',
    });
    setDesignIconPickerOpen(false);
  };

  const handleAddTapeElement = (page: 1 | 2) => {
    handleAddDecorElement(page, {
      kind: 'tape',
      label: 'Скотч (клейкая лента)',
      x: 528,
      y: 402,
      width: 108,
      height: 24,
      rotation: -2,
      color: '#FDE68A',
      opacity: 0.9,
    });
  };

  const handleAddStickerElement = (
    page: 1 | 2,
    preset: StickerPresetOption
  ) => {
    if (!activeDoc) return;
    const id = `sticker-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const nextEl: DecorElement = {
      id,
      kind: preset.kind,
      label: `Стикер: ${preset.label}`,
      imageUrl: preset.kind === 'image' ? preset.imageUrl : undefined,
      cropEnabled: false,
      x: Math.round((794 - preset.width) / 2),
      y: 380,
      width: preset.width,
      height: preset.height,
      rotation: -6,
      color: preset.color,
      opacity: 1,
      zIndex: 8,
    };
    if (page === 1) {
      onChangeJournal({
        ...activeDoc,
        page1: {
          ...activeDoc.page1,
          decorElements: [...(activeDoc.page1.decorElements ?? []), nextEl],
          decorSeeded: true,
        },
      });
    } else {
      onChangeJournal({
        ...activeDoc,
        page2: {
          ...activeDoc.page2,
          decorElements: [...(activeDoc.page2.decorElements ?? []), nextEl],
          decorSeeded: true,
        },
      });
    }
    lastHistoryPushRef.current.ts = 0;
    setActiveTarget({ page, block: 'decor', itemId: id });
    setDesignStickerPickerOpen(false);
  };

  const handleReplaceDecorWithSticker = (
    page: 1 | 2,
    decorId: string,
    preset: StickerPresetOption
  ) => {
    handleUpdateDecor(page, decorId, {
      kind: preset.kind,
      label: `Стикер: ${preset.label}`,
      imageUrl: preset.kind === 'image' ? preset.imageUrl : undefined,
      cropEnabled: false,
      color: preset.color,
      width: preset.width,
      height: preset.height,
    });
  };

  const handleSelectTextField = (target: ActiveTextFieldTarget) => {
    setActiveTextField(target);
    if (target && (target.page === 1 || target.page === 2)) {
      setDesignTargetPage(target.page);
    }
  };

  const handleSelectTargetOnA4 = (target: EditorSectionTarget) => {
    if (!target) return;
    setActiveTarget(target);
    if (target.block === 'background') {
      setActiveTextField(null);
      return;
    }
    if (target.page === 1 || target.page === 2) {
      setDesignTargetPage(target.page);
    }
    if (target.block === 'decor') {
      setInspectorMode('design');
      return;
    }
    if (inspectorMode === 'design') {
      return;
    }
    if (target.page === 1) {
      if (
        target.block === 'cover' ||
        target.block === 'coverTitle' ||
        target.block === 'coverSubtitle' ||
        target.block === 'coverInfo' ||
        target.block === 'coverBubble' ||
        target.block === 'logo' ||
        target.block === 'coverBear'
      ) {
        focusSection('profile', 1);
        if (target.block === 'coverTitle') {
          setActiveTextField({ page: 1, field: 'coverTitle' });
        } else if (target.block === 'coverSubtitle') {
          setActiveTextField({ page: 1, field: 'coverSubtitle' });
        } else if (target.block === 'coverBubble') {
          setActiveTextField({ page: 1, field: 'coverSpeechBubble' });
        } else if (target.block === 'coverInfo') {
          setActiveTextField(null);
        }
      } else if (
        target.block === 'project' ||
        target.block === 'projectsBlock'
      ) {
        focusSection('projects', 1);
      } else if (
        target.block === 'modulesBlock' ||
        target.block === 'module' ||
        target.block === 'skills'
      ) {
        focusSection('curriculum', 1);
        if (target.block === 'module') {
          setHighlightedStudentModId(target.itemId);
        }
      }
    } else {
      if (target.block === 'mentorNote') {
        focusSection('mentorNote', 2);
      } else if (
        target.block === 'pride' ||
        target.block === 'prideBear' ||
        target.block === 'strengths'
      ) {
        focusSection('pride', 2);
      } else if (target.block === 'nextBear') {
        focusSection('pride', 2);
      } else if (target.block === 'nextChapter') {
        setEditorTab('common');
        setCommonStep(4);
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
            signature:
              payload.signature || activeDoc.page2.mentorNote.signature,
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

  const handleApplyCommon = async () => {
    setApplyingCommon(true);
    try {
      await onSaveGroupAndApplyCommon(groupDraft, commonDraft);
      setEditorTab('individual');
    } finally {
      setApplyingCommon(false);
    }
  };

  // Modal Picker Helpers (Step 2 Modules & Step 3 Skills)
  const modalFilteredModules = useMemo(() => {
    const q = modalModSearch.trim().toLowerCase();
    return libraryModules.filter((m) => {
      if (m.isActive === false) return false;
      if (modalAgeFilter === 'group') {
        const ages = getModuleAgeCategories(m);
        if (!ages.includes(groupDraft.ageCategory)) return false;
      }
      const matchesCat =
        modalModCategory === 'all' ||
        m.category === modalModCategory ||
        Boolean(m.filterCategories?.includes(modalModCategory));
      if (!matchesCat) return false;
      if (!q) return true;
      return (
        m.displayTitle.toLowerCase().includes(q) ||
        m.officialTitle.toLowerCase().includes(q) ||
        (m.code || '').toLowerCase().includes(q) ||
        m.subtitle.toLowerCase().includes(q)
      );
    });
  }, [
    libraryModules,
    modalAgeFilter,
    groupDraft.ageCategory,
    modalModCategory,
    modalModSearch,
  ]);

  const openModulesPickerModal = () => {
    const existingIds = commonDraft.modules
      .map((m) => m.libraryModuleId)
      .filter((id): id is string => Boolean(id));
    setDraftModalModuleIds(existingIds);
    setModalAgeFilter('group');
    setModalModCategory('all');
    setModalModSearch('');
    setModulesModalOpen(true);
  };

  const confirmModulesModal = () => {
    const existingByLibId = new Map(
      commonDraft.modules
        .filter((m) => m.libraryModuleId)
        .map((m) => [m.libraryModuleId as string, m])
    );
    const customOnly = commonDraft.modules.filter((m) => !m.libraryModuleId);

    const selectedFromLib: ModuleItem[] = [];
    draftModalModuleIds.forEach((libId) => {
      const existing = existingByLibId.get(libId);
      if (existing) {
        selectedFromLib.push(existing);
        return;
      }
      const lib = libraryModules.find((m) => m.id === libId);
      if (!lib) return;
      selectedFromLib.push({
        id: `grp-mod-${lib.id}-${Date.now()}-${selectedFromLib.length}`,
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
        order: 1,
        suggestedSkills: [...(lib.suggestedSkills ?? [])],
      });
    });

    const combined = [...selectedFromLib, ...customOnly].map((m, idx) => ({
      ...m,
      order: idx + 1,
    }));
    setCommonDraft((prev) => ({ ...prev, modules: combined }));
    setModulesModalOpen(false);
  };

  const openSkillsPickerModal = () => {
    const selectedIds = skillsCatalog
      .filter((def) =>
        commonDraft.skills.some(
          (s) =>
            s.skillId === def.id ||
            s.label.toLowerCase() === def.label.toLowerCase()
        )
      )
      .map((def) => def.id);
    setDraftModalSkillIds(selectedIds);
    setModalSkillSearch('');
    setSkillsModalOpen(true);
  };

  const confirmSkillsModal = () => {
    const customSkills = commonDraft.skills.filter(
      (s) =>
        !s.skillId &&
        !skillsCatalog.some(
          (def) => def.label.toLowerCase() === s.label.toLowerCase()
        )
    );
    const selectedCatalogSkills: SkillItem[] = [];
    draftModalSkillIds.forEach((defId) => {
      const def = skillsCatalog.find((s) => s.id === defId);
      if (!def) return;
      const existing = commonDraft.skills.find(
        (s) =>
          s.skillId === def.id ||
          s.label.toLowerCase() === def.label.toLowerCase()
      );
      selectedCatalogSkills.push(
        existing ?? {
          id: `grp-sk-${def.id}-${Date.now()}-${selectedCatalogSkills.length}`,
          skillId: def.id,
          label: def.label,
          bgColor: def.defaultColor,
          status: 'independent',
        }
      );
    });
    setCommonDraft((prev) => ({
      ...prev,
      skills: [...selectedCatalogSkills, ...customSkills],
    }));
    setSkillsModalOpen(false);
  };

  const currentPalette =
    DESIGN_PALETTES.find((p) => p.id === commonDraft.paletteId) ??
    DESIGN_PALETTES[0];

  const commonSteps: Array<{
    step: CommonStep;
    title: string;
    count?: number;
  }> = [
    { step: 1, title: 'Параметры' },
    { step: 2, title: 'Модули', count: commonDraft.modules.length },
    { step: 3, title: 'Навыки', count: commonDraft.skills.length },
    {
      step: 4,
      title: 'Что впереди',
      count: commonDraft.nextChapterTopics.length,
    },
  ];

  // Block completion indicators for collapsible right panel sections
  const blockDoneMap = useMemo(() => {
    const map: Record<IndividualSection, boolean> = {
      profile: false,
      curriculum: false,
      projects: false,
      pride: false,
      mentorNote: false,
    };
    if (!activeDocProgress) return map;
    activeDocProgress.blocks.forEach((b) => {
      if (b.id === 'profile') map.profile = b.completed;
      if (b.id === 'curriculum') map.curriculum = b.completed;
      if (b.id === 'projects') map.projects = b.completed;
      if (b.id === 'pride') map.pride = b.completed;
      if (b.id === 'mentorNote') map.mentorNote = b.completed;
    });
    return map;
  }, [activeDocProgress]);

  const filteredIndividualCatalog = useMemo(() => {
    const q = individualModSearch.trim().toLowerCase();
    return libraryModules.filter((m) => {
      if (m.isActive === false) return false;
      if (!q) return true;
      return (
        (m.displayTitle || m.title).toLowerCase().includes(q) ||
        m.subtitle.toLowerCase().includes(q) ||
        (m.code || '').toLowerCase().includes(q)
      );
    });
  }, [libraryModules, individualModSearch]);

  const handleToggleStudentModule = (modId: string) => {
    if (!activeDoc) return;
    const nextModules = activeDoc.page1.modules.map((m) =>
      m.id === modId ? { ...m, hidden: !m.hidden } : m
    );
    onChangeJournal({
      ...activeDoc,
      page1: {
        ...activeDoc.page1,
        showModules: nextModules.some((m) => !m.hidden)
          ? true
          : activeDoc.page1.showModules,
        modules: nextModules,
      },
    });
  };

  const handleAddIndividualModuleFromLib = (lib: LibraryModule) => {
    if (!activeDoc) return;
    const nextMod: ModuleItem = {
      id: `ind-mod-${lib.id}-${Date.now()}`,
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
      order: activeDoc.page1.modules.length + 1,
      hidden: false,
      isIndividual: true,
      suggestedSkills: [...(lib.suggestedSkills ?? [])],
    };
    onChangeJournal({
      ...activeDoc,
      page1: {
        ...activeDoc.page1,
        showModules: true,
        modules: [...activeDoc.page1.modules, nextMod],
      },
    });
    setIndividualModPickerOpen(false);
    setIndividualModSearch('');
  };

  const handleAddCustomIndividualModule = () => {
    if (!activeDoc || !customIndividualModTitle.trim()) return;
    const nextMod: ModuleItem = {
      id: `ind-mod-custom-${Date.now()}`,
      title: customIndividualModTitle.trim(),
      subtitle: customIndividualModSub.trim() || 'Индивидуальный модуль',
      description: 'Освоен по индивидуальной программе.',
      category: 'programming',
      illustrationKey: 'python',
      iconKey: 'code',
      visualMode: 'illustration',
      cardBgColor: '#F6E8BF',
      layoutVariant: 'classic',
      size: 'normal',
      order: activeDoc.page1.modules.length + 1,
      hidden: false,
      isIndividual: true,
    };
    onChangeJournal({
      ...activeDoc,
      page1: {
        ...activeDoc.page1,
        showModules: true,
        modules: [...activeDoc.page1.modules, nextMod],
      },
    });
    setCustomIndividualModTitle('');
    setCustomIndividualModSub('');
    setIndividualModPickerOpen(false);
  };

  const handleRemoveIndividualModule = (modId: string) => {
    if (!activeDoc) return;
    const nextModules = activeDoc.page1.modules
      .filter((m) => m.id !== modId)
      .map((m, idx) => ({ ...m, order: idx + 1 }));
    onChangeJournal({
      ...activeDoc,
      page1: {
        ...activeDoc.page1,
        modules: nextModules,
      },
    });
  };

  const syncConfirmedSkills = (skills: SkillItem[]) =>
    skills
      .filter((s) => !s.hidden)
      .map((s) => ({
        id: s.id,
        skillId: s.skillId,
        label: s.label,
        bgColor: s.bgColor,
        status: s.status ?? 'independent',
        confirmedAt: new Date().toISOString(),
      }));

  const handleToggleStudentSkill = (skillId: string) => {
    if (!activeDoc) return;
    const nextSkills = activeDoc.page1.skills.map((s) =>
      s.id === skillId ? { ...s, hidden: !s.hidden } : s
    );
    onChangeJournal({
      ...activeDoc,
      page1: {
        ...activeDoc.page1,
        showSkills: nextSkills.some((s) => !s.hidden)
          ? true
          : activeDoc.page1.showSkills,
        skills: nextSkills,
        confirmedSkills: syncConfirmedSkills(nextSkills),
      },
    });
  };

  const handleAddIndividualSkill = () => {
    if (!activeDoc || !newIndividualSkill.trim()) return;
    const nextSkill: SkillItem = {
      id: `ind-sk-${Date.now()}`,
      label: newIndividualSkill.trim(),
      bgColor: '#48C9D8',
      status: 'independent',
      hidden: false,
      isIndividual: true,
    };
    const nextSkills = [...activeDoc.page1.skills, nextSkill];
    onChangeJournal({
      ...activeDoc,
      page1: {
        ...activeDoc.page1,
        showSkills: true,
        skills: nextSkills,
        confirmedSkills: syncConfirmedSkills(nextSkills),
      },
    });
    setNewIndividualSkill('');
  };

  const handleRemoveIndividualSkill = (skillId: string) => {
    if (!activeDoc) return;
    const nextSkills = activeDoc.page1.skills.filter((s) => s.id !== skillId);
    onChangeJournal({
      ...activeDoc,
      page1: {
        ...activeDoc.page1,
        skills: nextSkills,
        confirmedSkills: syncConfirmedSkills(nextSkills),
      },
    });
  };

  return (
    <div className="min-h-screen lg:h-screen bg-[#FAF9F6] text-[#18181B] flex flex-col lg:overflow-hidden">
      {/* TOP BAR (FIGMA-STYLE WORKSPACE HEADER) */}
      <header className="h-14 shrink-0 bg-white border-b border-zinc-200/80 px-4 flex items-center justify-between gap-4 z-30">
        <div className="flex items-center gap-2.5 min-w-0">
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

          <div className="h-4 w-px bg-zinc-200 hidden md:block shrink-0" />

          <div className="min-w-0 hidden md:block">
            <div className="text-xs font-bold text-zinc-900 truncate">
              {group.name}
            </div>
            <div className="text-[11px] text-zinc-500 flex items-center gap-1.5 truncate">
              <MapPin className="w-3 h-3 text-[#0D9488] shrink-0" />
              <span className="truncate">{branch?.name || 'Локация'}</span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums shrink-0">
                {formatGroupPeriod(group.startDate, group.endDate)}
              </span>
            </div>
          </div>
        </div>

        {/* Center Switch: Group Common Stepper FIRST, Individual Editor SECOND (Flat Underline Tabs) */}
        <div className="flex items-center gap-6 h-full shrink-0">
          <button
            type="button"
            onClick={() => setEditorTab('common')}
            className={`h-full inline-flex items-center gap-1.5 px-1 border-b-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
              editorTab === 'common'
                ? 'border-[#0D9488] text-zinc-900'
                : 'border-transparent text-zinc-500 hover:text-zinc-900'
            }`}
          >
            <Layers
              className={`w-3.5 h-3.5 ${
                editorTab === 'common' ? 'text-[#0D9488]' : 'text-zinc-400'
              }`}
            />
            <span>Общие данные группы</span>
          </button>
          <button
            type="button"
            onClick={() => setEditorTab('individual')}
            className={`h-full inline-flex items-center gap-1.5 px-1 border-b-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
              editorTab === 'individual'
                ? 'border-[#0D9488] text-zinc-900'
                : 'border-transparent text-zinc-500 hover:text-zinc-900'
            }`}
          >
            <Users
              className={`w-3.5 h-3.5 ${
                editorTab === 'individual' ? 'text-[#0D9488]' : 'text-zinc-400'
              }`}
            />
            <span>Редактор учеников</span>
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {saveState === 'saving' && editorTab === 'individual' && activeDoc && (
            <span className="hidden xl:inline-flex items-center gap-1 text-[11px] font-medium text-zinc-500 whitespace-nowrap mr-1">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#0D9488]" />
              <span>Сохранение...</span>
            </span>
          )}

          {editorTab === 'individual' && activeDoc && (
            <div className="inline-flex items-center gap-1 mr-1 border border-zinc-200 rounded-lg p-0.5 bg-zinc-50/70 shrink-0">
              <button
                type="button"
                disabled={!canUndo}
                onClick={handleUndo}
                title="Отменить последнее действие (Ctrl+Z)"
                aria-label="Отменить"
                className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium text-zinc-700 hover:bg-white hover:shadow-2xs disabled:opacity-35 disabled:hover:bg-transparent disabled:hover:shadow-none transition-colors whitespace-nowrap"
              >
                <Undo2 className="w-3.5 h-3.5" />
                <span className="hidden xl:inline">Отменить</span>
              </button>
              <button
                type="button"
                disabled={!canRedo}
                onClick={handleRedo}
                title="Вернуть действие (Ctrl+Y / Ctrl+Shift+Z)"
                aria-label="Вернуть"
                className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium text-zinc-700 hover:bg-white hover:shadow-2xs disabled:opacity-35 disabled:hover:bg-transparent disabled:hover:shadow-none transition-colors whitespace-nowrap"
              >
                <Redo2 className="w-3.5 h-3.5" />
                <span className="hidden xl:inline">Вернуть</span>
              </button>
            </div>
          )}

          {activeDoc && (
            <>
              <button
                type="button"
                onClick={() => onOpenPreview(activeDoc.id)}
                className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-xs font-medium text-zinc-700 whitespace-nowrap shrink-0"
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

      {/* THREE-COLUMN FIGMA WORKSPACE BODY */}
      <div
        style={
          {
            '--left-panel-w': `${leftWidth}px`,
            '--right-panel-w': `${rightWidth}px`,
          } as React.CSSProperties
        }
        className="flex-1 min-h-0 flex flex-col lg:flex-row overflow-hidden relative"
      >
        {draggingSide && (
          <div
            aria-hidden="true"
            className="fixed inset-0 z-50 cursor-col-resize select-none"
          />
        )}

        {/* 1. LEFT COLUMN: STUDENTS + INLINE PROGRESS + EXPANDABLE STATS CHECKLIST */}
        {leftCollapsed ? (
          <div className="hidden lg:flex w-9 shrink-0 bg-white border-r border-zinc-200/70 flex-col items-center py-3 gap-3 relative">
            <button
              type="button"
              onClick={() => setLeftCollapsed(false)}
              className="w-6 h-6 rounded-full border border-zinc-200 bg-white hover:bg-[#F0FDFA] hover:border-[#0D9488] text-zinc-600 hover:text-[#0D9488] flex items-center justify-center shadow-xs transition-colors"
              title="Развернуть список учеников"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-bold text-zinc-500 [writing-mode:vertical-rl] rotate-180 tracking-wide">
              Ученики ({activeStudentsOnly.length})
            </span>
          </div>
        ) : (
          <>
            <aside className="w-full lg:w-[var(--left-panel-w)] shrink-0 bg-white border-b lg:border-b-0 border-zinc-200 flex flex-col min-h-0 max-h-[360px] lg:max-h-none lg:h-full overflow-hidden">
              {/* Sticky Top Summary */}
              <div className="shrink-0 p-3.5 border-b border-zinc-200 space-y-2.5 bg-white">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <h2 className="text-xs font-bold text-zinc-900 truncate">
                      Ученики ({activeStudentsOnly.length})
                    </h2>
                    <p className="text-[11px] text-zinc-500 tabular-nums">
                      Готово {groupReadyStats.ready} из {groupReadyStats.total}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setQuickAddOpen((v) => !v)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#0D9488] hover:bg-[#0F766E] text-white text-[11px] font-semibold whitespace-nowrap shrink-0"
                    title="Добавить ученика"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Добавить</span>
                  </button>
                </div>

                <div className="h-1.5 w-full rounded-full bg-zinc-100 overflow-hidden">
                  <div
                    style={{
                      width: `${
                        groupReadyStats.total > 0
                          ? Math.round(
                              (groupReadyStats.ready / groupReadyStats.total) *
                                100
                            )
                          : 0
                      }%`,
                    }}
                    className="h-full bg-[#0D9488] rounded-full transition-all"
                  />
                </div>

                {allGroupStudents.length > 0 && (
                  <select
                    value={selectedStudentId}
                    onChange={(e) => {
                      const nextId = e.target.value;
                      if (!nextId) return;
                      setSelectedStudentId(nextId);
                      setExpandedStudentIds((prev) => ({
                        ...prev,
                        [nextId]: true,
                      }));
                      setEditorTab('individual');
                    }}
                    aria-label="Быстрый выбор ученика из всех статусов"
                    className="w-full rounded-md border border-zinc-200 bg-[#FAFAFA] px-2 py-1.5 text-[11px] font-medium text-zinc-700 focus:outline-none focus:border-[#0D9488]"
                  >
                    <option value="">
                      Перейти к ученику ({allGroupStudents.length})...
                    </option>
                    {allGroupStudents.map((st) => {
                      const stMeta = getStudentStatusMeta(st.status);
                      return (
                        <option key={st.id} value={st.id}>
                          {st.fullName}
                          {stMeta.status !== 'active'
                            ? ` (${stMeta.label})`
                            : ''}
                        </option>
                      );
                    })}
                  </select>
                )}

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
                        setExpandedStudentIds((prev) => ({
                          ...prev,
                          [created.id]: true,
                        }));
                        setEditorTab('individual');
                      }
                      setQuickName('');
                      setQuickAge('');
                      setQuickAddOpen(false);
                    }}
                    className="pt-2 border-t border-zinc-200/70 space-y-2 text-xs"
                  >
                    <input
                      type="text"
                      required
                      autoFocus
                      value={quickName}
                      onChange={(e) => setQuickName(e.target.value)}
                      placeholder="Имя и фамилия..."
                      className={flatInputClass}
                    />
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={quickAge}
                        onChange={(e) => setQuickAge(e.target.value)}
                        placeholder="Возраст"
                        className="w-20 bg-transparent border-0 border-b border-zinc-200 rounded-none px-0.5 py-1 text-xs focus:outline-none focus:border-[#0D9488]"
                      />
                      <button
                        type="submit"
                        className="flex-1 px-2.5 py-1.5 rounded-md bg-[#0D9488] hover:bg-[#0F766E] text-white text-[11px] font-semibold"
                      >
                        Создать
                      </button>
                      <button
                        type="button"
                        onClick={() => setQuickAddOpen(false)}
                        className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-800"
                        title="Отмена"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Scrollable Student List with Flat Hairline Dividers & Expandable Checklist */}
              <div className="flex-1 min-h-0 overflow-y-auto divide-y divide-zinc-100">
                {groupStudents.length === 0 ? (
                  <div className="py-10 px-3 text-center text-xs text-zinc-500">
                    В группе нет учеников.
                  </div>
                ) : (
                  groupStudents.map((st) => {
                    const j = findStudentJournal(st);
                    const prog = j ? computeJournalProgress(j) : null;
                    const filled = prog?.filledBlocks ?? 0;
                    const total = prog?.totalBlocks ?? 5;
                    const pct = Math.round((filled / total) * 100);
                    const isSelected = selectedStudent?.id === st.id;
                    const isExpanded = Boolean(expandedStudentIds[st.id]);

                    const barColor =
                      filled === total
                        ? 'bg-emerald-500'
                        : filled >= 2
                        ? 'bg-[#0D9488]'
                        : filled === 1
                        ? 'bg-amber-400'
                        : 'bg-zinc-300';

                    const checklistBlocks = prog?.blocks ?? [
                      {
                        id: 'profile' as const,
                        label: 'Имя и профиль',
                        completed: false,
                      },
                      {
                        id: 'curriculum' as const,
                        label: 'Модули и навыки',
                        completed: false,
                      },
                      {
                        id: 'projects' as const,
                        label: 'Проекты и скриншоты',
                        completed: false,
                      },
                      {
                        id: 'pride' as const,
                        label: 'Момент гордости',
                        completed: false,
                      },
                      {
                        id: 'mentorNote' as const,
                        label: 'Слово наставника',
                        completed: false,
                      },
                    ];

                    const shortLabels: Record<string, string> = {
                      profile: 'Имя и профиль',
                      curriculum: 'Модули и навыки',
                      projects: 'Проекты и скриншоты',
                      pride: 'Момент гордости',
                      mentorNote: 'Слово наставника',
                    };

                    return (
                      <div
                        key={st.id}
                        className={`group transition-colors border-l-2 ${
                          isSelected
                            ? 'border-l-[#0D9488] bg-[#F0FDFA]/60'
                            : 'border-l-transparent hover:bg-zinc-50/70'
                        }`}
                      >
                        <div className="flex items-start gap-1 px-3 py-2.5">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedStudentId(st.id);
                              setExpandedStudentIds((prev) => ({
                                ...prev,
                                [st.id]: true,
                              }));
                              setEditorTab('individual');
                            }}
                            className="flex-1 min-w-0 text-left space-y-1.5"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="inline-flex items-center gap-1.5 min-w-0">
                                <span
                                  className={`w-2 h-2 rounded-full shrink-0 ${
                                    getStudentStatusMeta(st.status).dotClass
                                  }`}
                                  title={getStudentStatusLabel(st.status)}
                                />
                                <span
                                  className={`text-xs truncate ${
                                    isSelected
                                      ? 'font-bold text-[#0F766E]'
                                      : 'font-semibold text-zinc-900'
                                  }`}
                                >
                                  {st.fullName}
                                </span>
                              </span>
                              {normalizeStudentStatus(st.status) !== 'active' && (
                                <span
                                  className={`text-[10px] font-medium px-1.5 py-0.5 rounded border shrink-0 ${
                                    getStudentStatusMeta(st.status).badgeClass
                                  }`}
                                >
                                  {getStudentStatusLabel(st.status)}
                                </span>
                              )}
                            </div>

                            {/* Inline Progress Bar beside/under name */}
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-1 rounded-full bg-zinc-100 overflow-hidden">
                                <div
                                  style={{ width: `${pct}%` }}
                                  className={`h-full rounded-full transition-all ${barColor}`}
                                />
                              </div>
                              <span className="text-[11px] font-semibold text-zinc-500 tabular-nums shrink-0">
                                {filled}/{total}
                              </span>
                            </div>
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setConfirmDeleteStudentId(st.id);
                            }}
                            className="p-1 rounded-md text-zinc-400 hover:text-red-600 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity shrink-0 mt-0.5"
                            title="Удалить ученика"
                            aria-label={`Удалить ученика ${st.fullName}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            aria-expanded={isExpanded}
                            aria-label={
                              isExpanded
                                ? 'Скрыть чек-лист заполнения'
                                : 'Показать чек-лист заполнения'
                            }
                            onClick={() =>
                              setExpandedStudentIds((prev) => ({
                                ...prev,
                                [st.id]: !prev[st.id],
                              }))
                            }
                            className="p-1 rounded-md text-zinc-400 hover:text-zinc-900 shrink-0 mt-0.5"
                            title="Чек-лист заполнения"
                          >
                            {isExpanded ? (
                              <ChevronDown className="w-3.5 h-3.5" />
                            ) : (
                              <ChevronRight className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>

                        {confirmDeleteStudentId === st.id && (
                          <div className="mx-3 mb-2.5 pt-2 border-t border-red-200 flex items-center justify-between gap-2">
                            <span className="text-[11px] font-semibold text-red-700">
                              Удалить?
                            </span>
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={async () => {
                                  await onDeleteStudent(st.id);
                                  setConfirmDeleteStudentId(null);
                                }}
                                className="px-2 py-0.5 rounded bg-red-600 hover:bg-red-700 text-white text-[11px] font-semibold"
                              >
                                Да
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteStudentId(null)}
                                className="px-2 py-0.5 rounded text-zinc-600 hover:text-zinc-900 text-[11px] font-medium"
                              >
                                Отмена
                              </button>
                            </div>
                          </div>
                        )}

                        {isExpanded && (
                          <div className="border-t border-zinc-100 px-3 py-1.5 space-y-0.5">
                            {checklistBlocks.map((b) => (
                              <button
                                key={b.id}
                                type="button"
                                onClick={() => {
                                  setSelectedStudentId(st.id);
                                  setEditorTab('individual');
                                  const sectionMap: Record<
                                    string,
                                    IndividualSection
                                  > = {
                                    profile: 'profile',
                                    curriculum: 'curriculum',
                                    projects: 'projects',
                                    pride: 'pride',
                                    mentorNote: 'mentorNote',
                                  };
                                  const targetSec =
                                    sectionMap[b.id] ?? 'profile';
                                  const page =
                                    targetSec === 'pride' ||
                                    targetSec === 'mentorNote'
                                      ? 2
                                      : 1;
                                  focusSection(targetSec, page);
                                }}
                                className="w-full flex items-center justify-between gap-2 px-1 py-1 rounded hover:bg-zinc-100/70 text-left transition-colors"
                              >
                                <span className="flex items-center gap-1.5 min-w-0">
                                  {b.completed ? (
                                    <CheckSquare className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                  ) : (
                                    <Square className="w-3.5 h-3.5 text-zinc-300 shrink-0" />
                                  )}
                                  <span
                                    className={`text-[11px] truncate ${
                                      b.completed
                                        ? 'text-zinc-800 font-medium'
                                        : 'text-zinc-500'
                                    }`}
                                  >
                                    {shortLabels[b.id] || b.label}
                                  </span>
                                </span>
                                <span
                                  className={`text-[10px] font-semibold shrink-0 ${
                                    b.completed
                                      ? 'text-emerald-700'
                                      : 'text-zinc-400'
                                  }`}
                                >
                                  {b.completed ? 'Готово' : 'Пусто'}
                                </span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Sticky Bottom Footer (Always Visible, Never Clipped) */}
              <div className="shrink-0 px-3.5 py-2.5 border-t border-zinc-200/80 bg-white flex items-center justify-between gap-2">
                <label className="flex items-center gap-2 cursor-pointer text-[11px] text-zinc-600 select-none min-w-0">
                  <input
                    type="checkbox"
                    checked={onlyActive}
                    onChange={(e) => setOnlyActive(e.target.checked)}
                    className="rounded border-zinc-300 text-[#0D9488]"
                  />
                  <span className="truncate font-medium">Только активные</span>
                </label>
                {allGroupStudents.length > activeStudentsOnly.length && (
                  <span className="text-[10px] text-zinc-400 tabular-nums shrink-0">
                    +{allGroupStudents.length - activeStudentsOnly.length} скрыто
                  </span>
                )}
              </div>
            </aside>

            {/* LEFT INVISIBLE FIGMA RESIZER (2px TEAL LINE + CIRCLE COLLAPSE ON HOVER) */}
            <div
              role="separator"
              aria-orientation="vertical"
              aria-label="Изменить ширину левой панели"
              onMouseDown={(e) => startResize('left', e)}
              className="hidden lg:flex w-2 -mx-1 shrink-0 cursor-col-resize items-center justify-center group select-none relative z-20"
              title="Потяните, чтобы изменить ширину панели"
            >
              <div
                className={`w-[2px] h-full transition-colors ${
                  draggingSide === 'left'
                    ? 'bg-[#0D9488]'
                    : 'bg-transparent group-hover:bg-[#0D9488]'
                }`}
              />
              <button
                type="button"
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  setLeftCollapsed(true);
                }}
                className="absolute top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white border border-zinc-200 hover:border-[#0D9488] hover:text-[#0D9488] text-zinc-500 flex items-center justify-center shadow-sm z-30 cursor-pointer opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                title="Свернуть список учеников"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            </div>
          </>
        )}

        {/* WORKSPACE RIGHT OF STUDENT NAVIGATION */}
        {editorTab === 'common' ? (
          /* COMPACT SINGLE-ROW STEPPER VIEW FOR GROUP COMMON DATA */
          <main className="flex-1 min-w-0 min-h-0 flex flex-col overflow-hidden bg-[#FAF9F6]">
            {/* Compact Top Single-Row Stepper Header */}
            <div className="shrink-0 bg-white border-b border-zinc-200/80 px-5 py-2.5">
              <div className="w-full max-w-6xl mx-auto flex flex-wrap lg:flex-nowrap items-center justify-between gap-3">
                <div className="min-w-0 shrink-0">
                  <h2 className="text-sm font-bold text-zinc-900 truncate">
                    {groupDraft.name || group.name}
                  </h2>
                </div>

                {/* Single-Row Compact Horizontal Stepper */}
                <nav
                  aria-label="Шаги настройки общих данных"
                  className="flex-1 min-w-0 flex items-center gap-1.5 overflow-x-auto py-0.5"
                >
                  {commonSteps.map((st, idx) => {
                    const isActive = commonStep === st.step;
                    const isDone = commonStep > st.step;
                    return (
                      <React.Fragment key={st.step}>
                        <button
                          type="button"
                          onClick={() => setCommonStep(st.step)}
                          className={`inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                            isActive
                              ? 'bg-[#0F766E] text-white shadow-2xs'
                              : isDone
                              ? 'bg-[#F0FDFA] text-[#0F766E] hover:bg-[#CCFBF1]/60'
                              : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
                          }`}
                        >
                          <span
                            className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold tabular-nums shrink-0 ${
                              isActive
                                ? 'bg-white text-[#0F766E]'
                                : isDone
                                ? 'bg-[#0D9488] text-white'
                                : 'bg-zinc-200/80 text-zinc-700'
                            }`}
                          >
                            {isDone ? (
                              <Check className="w-3 h-3" />
                            ) : (
                              st.step
                            )}
                          </span>
                          <span>{st.title}</span>
                          {typeof st.count === 'number' && (
                            <span
                              className={`text-[11px] tabular-nums ${
                                isActive ? 'text-teal-100' : 'text-zinc-400'
                              }`}
                            >
                              ({st.count})
                            </span>
                          )}
                        </button>
                        {idx < commonSteps.length - 1 && (
                          <div
                            aria-hidden="true"
                            className={`h-px flex-1 min-w-3 max-w-8 ${
                              isDone ? 'bg-[#0D9488]/40' : 'bg-zinc-200'
                            }`}
                          />
                        )}
                      </React.Fragment>
                    );
                  })}
                </nav>

                <button
                  type="button"
                  disabled={applyingCommon}
                  onClick={handleApplyCommon}
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#0F766E] hover:bg-[#0D9488] text-white text-xs font-semibold whitespace-nowrap shrink-0 disabled:opacity-60"
                >
                  {applyingCommon ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Check className="w-3.5 h-3.5" />
                  )}
                  <span>
                    Применить ко всем ({activeStudentsOnly.length})
                  </span>
                </button>
              </div>
            </div>

            {/* Scrollable Active Step Panel */}
            <div className="flex-1 min-h-0 overflow-y-auto bg-[#F8F8F6] px-6 lg:px-10 py-7">
              <div className="max-w-5xl mx-auto">
                {/* STEP 1: PARAMETERS (FLAT UI) */}
                {commonStep === 1 && (
                  <section className="space-y-7 text-xs">
                    <div className="pb-4 border-b border-zinc-200/80">
                      <h3 className="text-sm font-bold text-zinc-900">
                        Шаг 1. Параметры группы, локация и даты обучения
                      </h3>
                      <p className="text-zinc-500 mt-1">
                        Эти данные отображаются на обложке журнала каждого ученика группы.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                      <label className="block">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                          Название группы
                        </span>
                        <input
                          type="text"
                          value={groupDraft.name}
                          onChange={(e) =>
                            setGroupDraft({
                              ...groupDraft,
                              name: e.target.value,
                            })
                          }
                          className={`mt-1 ${flatInputClass} font-semibold text-sm`}
                        />
                      </label>

                      <label className="block">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                          Локация (Филиал)
                        </span>
                        <select
                          value={groupDraft.branchId}
                          onChange={(e) =>
                            setGroupDraft({
                              ...groupDraft,
                              branchId: e.target.value,
                            })
                          }
                          className={`mt-1 ${flatSelectClass}`}
                        >
                          {branches.map((b) => (
                            <option key={b.id} value={b.id}>
                              {b.name} ({b.address})
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="block">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                          Дата начала
                        </span>
                        <input
                          type="date"
                          value={groupDraft.startDate}
                          onChange={(e) =>
                            setGroupDraft({
                              ...groupDraft,
                              startDate: e.target.value,
                            })
                          }
                          className={`mt-1 ${flatInputClass}`}
                        />
                      </label>

                      <label className="block">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                          Дата окончания
                        </span>
                        <input
                          type="date"
                          value={groupDraft.endDate}
                          onChange={(e) =>
                            setGroupDraft({
                              ...groupDraft,
                              endDate: e.target.value,
                            })
                          }
                          className={`mt-1 ${flatInputClass}`}
                        />
                      </label>

                      <label className="block">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                          Наставник
                        </span>
                        <input
                          type="text"
                          value={groupDraft.mentorName}
                          onChange={(e) =>
                            setGroupDraft({
                              ...groupDraft,
                              mentorName: e.target.value,
                            })
                          }
                          className={`mt-1 ${flatInputClass}`}
                        />
                      </label>

                      <label className="block">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                          Возрастная категория
                        </span>
                        <select
                          value={groupDraft.ageCategory}
                          onChange={(e) =>
                            setGroupDraft({
                              ...groupDraft,
                              ageCategory: e.target.value as AgeCategory,
                            })
                          }
                          className={`mt-1 ${flatSelectClass}`}
                        >
                          <option value="8-10">8–10 лет</option>
                          <option value="11-13">11–13 лет</option>
                          <option value="14-15">14–15 лет</option>
                        </select>
                      </label>
                    </div>

                    <div className="pt-5 border-t border-zinc-200/80 space-y-3">
                      <div className="inline-flex items-center gap-1.5 font-semibold text-zinc-700">
                        <Palette className="w-3.5 h-3.5 text-[#0D9488]" />
                        <span>Палитра оформления листов А4</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
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
                            className={`py-2.5 px-3 rounded-lg border-b-2 text-left space-y-2 transition-colors ${
                              commonDraft.paletteId === pal.id
                                ? 'border-b-[#0D9488] bg-[#F0FDFA]/70'
                                : 'border-b-zinc-200 hover:bg-zinc-50'
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
                                  className="h-2 flex-1 rounded-full"
                                />
                              ))}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </section>
                )}

                {/* STEP 2: MODULES (2-COLUMN FLAT GRID + IMAGE THUMBNAIL & CROP/ZOOM) */}
                {commonStep === 2 && (
                  <section className="space-y-6 text-xs">
                    <div className="pb-4 border-b border-zinc-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-bold text-zinc-900">
                          Шаг 2. Модули программы («Мои открытия», выбрано{' '}
                          {commonDraft.modules.length})
                        </h3>
                        <p className="text-zinc-500 mt-1">
                          Возраст группы:{' '}
                          <span className="font-semibold text-zinc-700">
                            {groupDraft.ageCategory} лет
                          </span>
                          . Нажмите на миниатюру модуля, чтобы выбрать картинку и настроить кадрирование.
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                        {groupTemplates.length > 0 && (
                          <select
                            defaultValue=""
                            onChange={(e) => {
                              if (e.target.value)
                                applyCommonGroupTemplate(e.target.value);
                            }}
                            className="bg-white border border-zinc-200 hover:border-zinc-300 rounded-lg px-3 py-2 text-xs font-medium text-zinc-600 focus:outline-none focus:border-[#0D9488] transition-colors"
                          >
                            <option value="">Загрузить набор модулей...</option>
                            {groupTemplates.map((tpl) => (
                              <option key={tpl.id} value={tpl.id}>
                                {tpl.name} ({tpl.moduleIds.length})
                              </option>
                            ))}
                          </select>
                        )}
                        <button
                          type="button"
                          onClick={openModulesPickerModal}
                          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-bold shadow-sm transition-colors whitespace-nowrap shrink-0"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Выбрать модули</span>
                        </button>
                      </div>
                    </div>

                    {/* Search Selected Modules (Secondary) */}
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        value={commonSearch}
                        onChange={(e) => setCommonSearch(e.target.value)}
                        placeholder="Поиск по названию среди выбранных модулей..."
                        className="w-full bg-white/80 border border-zinc-200 rounded-lg pl-8 pr-3 py-2 text-xs text-zinc-700 placeholder:text-zinc-400 focus:outline-none focus:bg-white focus:border-[#0D9488] transition-colors"
                      />
                    </div>

                    {/* Selected Modules in 2-Column Clean White Cards */}
                    {commonDraft.modules.length === 0 ? (
                      <div className="py-10 rounded-xl bg-white border border-dashed border-zinc-300 text-center space-y-2.5">
                        <p className="text-xs font-medium text-zinc-600">
                          Пока не выбрано ни одного модуля.
                        </p>
                        <button
                          type="button"
                          onClick={openModulesPickerModal}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-semibold"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>
                            Выбрать модули ({groupDraft.ageCategory} лет)
                          </span>
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-1">
                        {commonDraft.modules
                          .filter((m) => {
                            const q = commonSearch.trim().toLowerCase();
                            if (!q) return true;
                            return (
                              m.title.toLowerCase().includes(q) ||
                              m.subtitle.toLowerCase().includes(q) ||
                              m.description.toLowerCase().includes(q)
                            );
                          })
                          .map((mod) => {
                            const idx = commonDraft.modules.findIndex(
                              (x) => x.id === mod.id
                            );
                            const linkedMediaUrl =
                              mod.imageMediaId && mediaAssets
                                ? mediaAssets.find(
                                    (a) => a.id === mod.imageMediaId
                                  )?.url
                                : undefined;
                            const resolvedUrl =
                              linkedMediaUrl || mod.customImageUrl;
                            const effectiveMode =
                              mod.visualMode ??
                              (resolvedUrl ? 'image' : 'illustration');
                            const imgScale = mod.imageScale ?? 1;
                            const imgX = mod.imagePosX ?? 0;
                            const imgY = mod.imagePosY ?? 0;

                            return (
                              <div
                                key={mod.id}
                                className="p-4 rounded-xl bg-white border border-zinc-200/80 shadow-[0_1px_3px_rgba(24,24,27,0.04)] space-y-2.5"
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <span className="font-mono text-[11px] font-bold text-zinc-400 truncate">
                                    #{idx + 1} · {mod.officialTitle || mod.title}
                                  </span>
                                  <div className="flex items-center gap-1 shrink-0">
                                    <button
                                      type="button"
                                      disabled={idx === 0}
                                      onClick={() => moveCommonModule(idx, -1)}
                                      className="p-1 rounded text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 disabled:opacity-30"
                                      title="Поднять выше"
                                    >
                                      <ArrowUp className="w-3 h-3" />
                                    </button>
                                    <button
                                      type="button"
                                      disabled={
                                        idx === commonDraft.modules.length - 1
                                      }
                                      onClick={() => moveCommonModule(idx, 1)}
                                      className="p-1 rounded text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 disabled:opacity-30"
                                      title="Опустить ниже"
                                    >
                                      <ArrowDown className="w-3 h-3" />
                                    </button>
                                    {confirmDeleteCommonModId === mod.id ? (
                                      <div className="inline-flex items-center gap-1 pl-1">
                                        <span className="text-[10px] font-semibold text-red-700">
                                          Удалить?
                                        </span>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setCommonDraft((prev) => ({
                                              ...prev,
                                              modules: prev.modules
                                                .filter((m) => m.id !== mod.id)
                                                .map((m, i) => ({
                                                  ...m,
                                                  order: i + 1,
                                                })),
                                            }));
                                            setConfirmDeleteCommonModId(null);
                                          }}
                                          className="px-1.5 py-0.5 rounded bg-red-600 text-white text-[10px] font-semibold"
                                        >
                                          Да
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() =>
                                            setConfirmDeleteCommonModId(null)
                                          }
                                          className="px-1.5 py-0.5 rounded text-zinc-600 hover:text-zinc-900 text-[10px]"
                                        >
                                          Отмена
                                        </button>
                                      </div>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setConfirmDeleteCommonModId(mod.id)
                                        }
                                        className="p-1 rounded text-zinc-400 hover:text-red-600"
                                        title="Удалить модуль"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-start gap-3.5">
                                  {/* Clickable Square Thumbnail */}
                                  <div className="shrink-0 flex flex-col items-center gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setEditingModuleVisual({
                                          scope: 'common',
                                          id: mod.id,
                                        })
                                      }
                                      style={{
                                        backgroundColor: mod.cardBgColor,
                                      }}
                                      className="w-16 h-16 shrink-0 rounded-xl border border-zinc-200 overflow-hidden relative group flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[#0D9488]"
                                      title="Настроить картинку или иконку модуля"
                                    >
                                      {effectiveMode === 'image' && resolvedUrl ? (
                                        <img
                                          src={resolvedUrl}
                                          alt={mod.title}
                                          referrerPolicy="no-referrer"
                                          style={{
                                            transform: `translate(${imgX}px, ${imgY}px) scale(${imgScale})`,
                                          }}
                                          className="w-full h-full object-cover"
                                        />
                                      ) : effectiveMode === 'icon' ? (
                                        <div
                                          style={{
                                            transform: `translate(${imgX}px, ${imgY}px) scale(${imgScale})`,
                                          }}
                                          className="flex items-center justify-center w-full h-full"
                                        >
                                          <ModuleVectorIcon
                                            iconKey={mod.iconKey}
                                            className="w-9 h-9"
                                          />
                                        </div>
                                      ) : (
                                        <div
                                          style={{
                                            transform: `translate(${imgX}px, ${imgY}px) scale(${imgScale})`,
                                          }}
                                          className="w-full h-full"
                                        >
                                          <ModuleSvgIllustration
                                            type={mod.illustrationKey}
                                          />
                                        </div>
                                      )}
                                      <span className="absolute inset-0 bg-zinc-900/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <Camera className="w-4 h-4 text-white" />
                                      </span>
                                    </button>
                                  </div>

                                  {/* Compact Underlined Title / Category + Multiline Description + Visual Mode Switcher */}
                                  <div className="flex-1 min-w-0 space-y-2">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                      <input
                                        type="text"
                                        value={mod.title}
                                        placeholder="Название модуля"
                                        onChange={(e) =>
                                          setCommonDraft((prev) => ({
                                            ...prev,
                                            modules: prev.modules.map((m) =>
                                              m.id === mod.id
                                                ? { ...m, title: e.target.value }
                                                : m
                                            ),
                                          }))
                                        }
                                        className={`${flatInputClass} font-semibold`}
                                      />
                                      <input
                                        type="text"
                                        value={mod.subtitle}
                                        placeholder="Категория / подзаголовок"
                                        onChange={(e) =>
                                          setCommonDraft((prev) => ({
                                            ...prev,
                                            modules: prev.modules.map((m) =>
                                              m.id === mod.id
                                                ? {
                                                    ...m,
                                                    subtitle: e.target.value,
                                                  }
                                                : m
                                            ),
                                          }))
                                        }
                                        className={`${flatInputClass} text-zinc-600`}
                                      />
                                    </div>
                                    <textarea
                                      rows={2}
                                      value={mod.description}
                                      placeholder="Описание модуля для листа А4..."
                                      onChange={(e) =>
                                        setCommonDraft((prev) => ({
                                          ...prev,
                                          modules: prev.modules.map((m) =>
                                            m.id === mod.id
                                              ? {
                                                  ...m,
                                                  description: e.target.value,
                                                }
                                              : m
                                          ),
                                        }))
                                      }
                                      className={`${flatTextareaClass} leading-relaxed text-zinc-600`}
                                    />
                                    <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
                                      <div className="inline-flex rounded-lg border border-zinc-200 bg-zinc-50 p-0.5 text-[11px] font-semibold">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setCommonDraft((prev) => ({
                                              ...prev,
                                              modules: prev.modules.map((m) =>
                                                m.id === mod.id
                                                  ? { ...m, visualMode: 'image' }
                                                  : m
                                              ),
                                            }));
                                            setEditingModuleVisual({
                                              scope: 'common',
                                              id: mod.id,
                                            });
                                          }}
                                          className={`px-2 py-0.5 rounded-md transition-colors ${
                                            effectiveMode === 'image'
                                              ? 'bg-white text-zinc-900 shadow-2xs'
                                              : 'text-zinc-500 hover:text-zinc-800'
                                          }`}
                                        >
                                          Своя картинка
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setCommonDraft((prev) => ({
                                              ...prev,
                                              modules: prev.modules.map((m) =>
                                                m.id === mod.id
                                                  ? {
                                                      ...m,
                                                      visualMode: 'icon',
                                                      iconKey:
                                                        m.iconKey || 'python',
                                                    }
                                                  : m
                                              ),
                                            }));
                                            setEditingModuleVisual({
                                              scope: 'common',
                                              id: mod.id,
                                            });
                                          }}
                                          className={`px-2 py-0.5 rounded-md transition-colors ${
                                            effectiveMode === 'icon'
                                              ? 'bg-[#0D9488] text-white shadow-2xs'
                                              : 'text-zinc-500 hover:text-zinc-800'
                                          }`}
                                        >
                                          Иконка
                                        </button>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setEditingModuleVisual({
                                            scope: 'common',
                                            id: mod.id,
                                          })
                                        }
                                        className="text-[11px] font-medium text-[#0D9488] hover:underline"
                                      >
                                        {effectiveMode === 'icon'
                                          ? 'Выбрать SVG-иконку'
                                          : 'Загрузить / медиатека'}
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </section>
                )}

                {/* STEP 3: COMMON SKILLS (FLAT UI) */}
                {commonStep === 3 && (
                  <section className="space-y-6 text-xs">
                    <div className="pb-4 border-b border-zinc-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-bold text-zinc-900">
                          Шаг 3. Общие навыки группы («Чему я научился», выбрано{' '}
                          {commonDraft.skills.length})
                        </h3>
                        <p className="text-zinc-500 mt-1">
                          Отметьте ключевые навыки через каталог или добавьте свои.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={openSkillsPickerModal}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-bold shadow-sm transition-colors whitespace-nowrap shrink-0"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Выбрать навыки</span>
                      </button>
                    </div>

                    {/* 3-State Chip Hierarchy: Selected / Recommended / Catalog Available */}
                    {(() => {
                      const recommendedIds = new Set(
                        recommendedSkillDefs.map((d) => d.id)
                      );
                      const isSkillSelected = (def: SkillDefinition) =>
                        commonDraft.skills.some(
                          (s) =>
                            s.skillId === def.id ||
                            s.label.toLowerCase() === def.label.toLowerCase()
                        );
                      const remainingCatalogDefs = skillsCatalog.filter(
                        (def) =>
                          !recommendedIds.has(def.id) && !isSkillSelected(def)
                      );

                      return (
                        <div className="space-y-4">
                          {/* 1. Selected Skills (Teal fill, white text) */}
                          <div className="p-4 rounded-xl bg-white border border-zinc-200/80 shadow-[0_1px_2px_rgba(24,24,27,0.03)] space-y-3">
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-bold text-zinc-800">
                                Выбранные навыки ({commonDraft.skills.length})
                              </span>
                              <span className="text-[11px] text-zinc-400">
                                Появятся в листе А4
                              </span>
                            </div>

                            {commonDraft.skills.length === 0 ? (
                              <div className="py-5 rounded-lg bg-[#F4F4F5]/70 border border-dashed border-zinc-300 text-center text-zinc-500">
                                Навыки ещё не выбраны. Отметьте рекомендованные или добавьте ниже.
                              </div>
                            ) : (
                              <div className="flex flex-wrap gap-2">
                                {commonDraft.skills.map((sk) => (
                                  <div
                                    key={sk.id}
                                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-[#0D9488] text-white border border-[#0D9488] shadow-[0_1px_2px_rgba(13,148,136,0.18)] text-xs font-medium"
                                  >
                                    <Check className="w-3 h-3 shrink-0" />
                                    <span>{sk.label}</span>
                                    {confirmDeleteCommonSkillId === sk.id ? (
                                      <span className="inline-flex items-center gap-1 pl-1 ml-1 border-l border-white/30">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setCommonDraft((prev) => ({
                                              ...prev,
                                              skills: prev.skills.filter(
                                                (s) => s.id !== sk.id
                                              ),
                                            }));
                                            setConfirmDeleteCommonSkillId(null);
                                          }}
                                          className="px-1.5 py-0.5 rounded bg-red-600 text-white text-[10px] font-bold hover:bg-red-700"
                                        >
                                          Удалить
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() =>
                                            setConfirmDeleteCommonSkillId(null)
                                          }
                                          className="px-1 py-0.5 text-[10px] text-white/85 hover:text-white"
                                        >
                                          Отмена
                                        </button>
                                      </span>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setConfirmDeleteCommonSkillId(sk.id)
                                        }
                                        className="ml-0.5 p-0.5 rounded text-white/75 hover:text-white hover:bg-white/15 transition-colors"
                                        title="Убрать навык"
                                      >
                                        <X className="w-3 h-3" />
                                      </button>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* 2. Recommended by Modules (White bg + Teal border + Dark text when unselected) */}
                          {recommendedSkillDefs.length > 0 && (
                            <div className="p-4 rounded-xl bg-white border border-zinc-200/80 shadow-[0_1px_2px_rgba(24,24,27,0.03)] space-y-2.5">
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-bold text-[#0F766E]">
                                  Рекомендованы выбранными модулями
                                </span>
                                <span className="text-[11px] text-zinc-400">
                                  Нажмите для быстрого выбора
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                {recommendedSkillDefs.map((def) => {
                                  const active = isSkillSelected(def);
                                  return (
                                    <button
                                      key={def.id}
                                      type="button"
                                      onClick={() => toggleCommonSkill(def)}
                                      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border font-medium transition-colors ${
                                        active
                                          ? 'bg-[#0D9488] text-white border-[#0D9488]'
                                          : 'bg-white text-zinc-900 border-[#0D9488] hover:bg-[#F0FDFA]'
                                      }`}
                                    >
                                      {active ? (
                                        <Check className="w-3 h-3 shrink-0" />
                                      ) : (
                                        <Plus className="w-3 h-3 text-[#0D9488] shrink-0" />
                                      )}
                                      <span>{def.label}</span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* 3. Available from Catalog (Muted gray #F4F4F5 bg + gray text) */}
                          {remainingCatalogDefs.length > 0 && (
                            <div className="p-4 rounded-xl bg-white border border-zinc-200/80 shadow-[0_1px_2px_rgba(24,24,27,0.03)] space-y-2.5">
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-semibold text-zinc-600">
                                  Доступные из каталога (
                                  {remainingCatalogDefs.length})
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                {remainingCatalogDefs.map((def) => (
                                  <button
                                    key={def.id}
                                    type="button"
                                    onClick={() => toggleCommonSkill(def)}
                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-[#F4F4F5] border border-transparent text-zinc-600 hover:border-zinc-300 hover:text-zinc-900 font-medium transition-colors"
                                  >
                                    <Plus className="w-3 h-3 text-zinc-400 shrink-0" />
                                    <span>{def.label}</span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    {/* Accented Add Custom Skill Zone */}
                    <div className="p-3 rounded-lg bg-[#F4F4F5] border border-dashed border-zinc-300 flex flex-col sm:flex-row sm:items-center gap-2.5">
                      <div className="relative flex-1 flex items-center">
                        <Plus className="w-4 h-4 text-[#0D9488] absolute left-3 pointer-events-none" />
                        <input
                          type="text"
                          value={newCustomSkill}
                          onChange={(e) => setNewCustomSkill(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
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
                            }
                          }}
                          placeholder="Добавить свой уникальный навык..."
                          className="w-full bg-white border border-zinc-200 rounded-lg pl-9 pr-3 py-2 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-[#0D9488] focus:ring-2 focus:ring-[#0D9488]/15"
                        />
                      </div>
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
                        disabled={!newCustomSkill.trim()}
                        className="px-4 py-2 rounded-lg bg-[#0D9488] hover:bg-[#0F766E] disabled:opacity-45 text-white font-semibold shrink-0 transition-colors"
                      >
                        Добавить навык
                      </button>
                    </div>
                  </section>
                )}

                {/* STEP 4: NEXT CHAPTER (INTERACTIVE CHIPS + CATALOG MODAL) */}
                {commonStep === 4 && (
                  <section className="space-y-6 text-xs">
                    <div className="pb-4 border-b border-zinc-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-bold text-zinc-900">
                          Шаг 4. «Что интересного впереди?» (Следующая глава)
                        </h3>
                        <p className="text-zinc-500 mt-1">
                          Этот блок размещается в нижней части второй страницы журнала А4.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={openTopicsPickerModal}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-bold shadow-sm transition-colors whitespace-nowrap shrink-0"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Выбрать из каталога</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5 p-4 rounded-xl bg-white border border-zinc-200/80 shadow-[0_1px_2px_rgba(24,24,27,0.03)]">
                      <label className="block">
                        <span className="text-[11px] font-medium text-zinc-500 mb-1 block">
                          Заголовок блока
                        </span>
                        <input
                          type="text"
                          value={commonDraft.nextChapterTitle}
                          onChange={(e) =>
                            setCommonDraft((prev) => ({
                              ...prev,
                              nextChapterTitle: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-2 rounded-md border border-zinc-200 bg-white text-xs font-semibold text-zinc-900 focus:outline-none focus:border-[#0D9488]"
                        />
                      </label>
                      <label className="block">
                        <span className="text-[11px] font-medium text-zinc-500 mb-1 block">
                          Вводный текст
                        </span>
                        <input
                          type="text"
                          value={commonDraft.nextChapterDescription}
                          onChange={(e) =>
                            setCommonDraft((prev) => ({
                              ...prev,
                              nextChapterDescription: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-2 rounded-md border border-zinc-200 bg-white text-xs text-zinc-900 focus:outline-none focus:border-[#0D9488]"
                        />
                      </label>
                    </div>

                    {/* Selected Interactive Topic Chips with (x) Delete */}
                    <div className="p-4 rounded-xl bg-white border border-zinc-200/80 shadow-[0_1px_2px_rgba(24,24,27,0.03)] space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-zinc-800">
                          Станции «Карты будущего» (
                          {commonDraft.nextChapterTopics.length})
                        </span>
                        {commonDraft.nextChapterTopics.length > 4 && (
                          <span className="text-[11px] text-amber-700 font-medium">
                            На карте отображаются первые 4 станции
                          </span>
                        )}
                      </div>

                      {commonDraft.nextChapterTopics.length === 0 ? (
                        <div className="py-5 rounded-lg bg-[#F4F4F5]/70 border border-dashed border-zinc-300 text-center text-zinc-500">
                          Темы ещё не выбраны. Добавьте свою тему ниже или выберите из каталога.
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex flex-wrap gap-2">
                            {commonDraft.nextChapterTopics.map((topic) => {
                              const isPickerOpen = editingTopicIconId === topic.id;
                              return (
                                <div
                                  key={topic.id}
                                  className="inline-flex items-center gap-1.5 pl-1.5 pr-2 py-1 rounded-lg bg-[#0D9488] text-white border border-[#0D9488] shadow-[0_1px_2px_rgba(13,148,136,0.18)] text-xs font-medium"
                                >
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setEditingTopicIconId(
                                        isPickerOpen ? null : topic.id
                                      )
                                    }
                                    className={`w-6 h-6 rounded-md bg-white flex items-center justify-center shrink-0 transition-transform hover:scale-105 ${
                                      isPickerOpen ? 'ring-2 ring-[#FACC15]' : ''
                                    }`}
                                    title="Сменить иконку станции на карте"
                                  >
                                    <NextTopicLineIcon
                                      type={topic.iconKey}
                                      className="w-4 h-4"
                                    />
                                  </button>
                                  <span>{topic.title}</span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setCommonDraft((prev) => ({
                                        ...prev,
                                        nextChapterTopics:
                                          prev.nextChapterTopics.filter(
                                            (t) => t.id !== topic.id
                                          ),
                                      }));
                                      if (editingTopicIconId === topic.id) {
                                        setEditingTopicIconId(null);
                                      }
                                    }}
                                    className="ml-0.5 p-0.5 rounded text-white/80 hover:text-white hover:bg-white/15 transition-colors"
                                    title={`Удалить тему «${topic.title}»`}
                                    aria-label={`Удалить тему ${topic.title}`}
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              );
                            })}
                          </div>

                          {/* Inline SVG Icon Picker for the selected Roadmap station */}
                          {editingTopicIconId &&
                            (() => {
                              const activeTopic =
                                commonDraft.nextChapterTopics.find(
                                  (t) => t.id === editingTopicIconId
                                );
                              if (!activeTopic) return null;
                              return (
                                <div className="p-3 rounded-xl bg-[#F8F8F6] border border-zinc-200 space-y-2">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[11px] font-bold text-zinc-700">
                                      Иконка для станции «{activeTopic.title}»
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => setEditingTopicIconId(null)}
                                      className="text-[11px] font-semibold text-[#0D9488] hover:underline"
                                    >
                                      Готово
                                    </button>
                                  </div>
                                  <div className="grid grid-cols-6 sm:grid-cols-9 gap-1.5">
                                    {MODULE_VECTOR_ICON_OPTIONS.map((opt) => {
                                      const selected =
                                        activeTopic.iconKey === opt.key;
                                      return (
                                        <button
                                          key={opt.key}
                                          type="button"
                                          onClick={() =>
                                            setCommonDraft((prev) => ({
                                              ...prev,
                                              nextChapterTopics:
                                                prev.nextChapterTopics.map((t) =>
                                                  t.id === activeTopic.id
                                                    ? { ...t, iconKey: opt.key }
                                                    : t
                                                ),
                                            }))
                                          }
                                          className={`p-1.5 rounded-lg border flex flex-col items-center justify-center gap-0.5 transition-colors ${
                                            selected
                                              ? 'border-[#0D9488] bg-[#F0FDFA] ring-1 ring-[#0D9488]'
                                              : 'border-zinc-200 bg-white hover:border-zinc-300'
                                          }`}
                                          title={opt.label}
                                        >
                                          <ModuleVectorIcon
                                            iconKey={opt.key}
                                            className="w-6 h-6"
                                          />
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            })()}
                        </div>
                      )}

                      {/* Quick Suggestions (Unselected Presets) */}
                      {NEXT_TOPIC_LIBRARY.some(
                        (item) =>
                          !commonDraft.nextChapterTopics.some(
                            (t) =>
                              t.title.toLowerCase() === item.title.toLowerCase()
                          )
                      ) && (
                        <div className="pt-3 border-t border-zinc-100 space-y-2">
                          <span className="text-[11px] font-medium text-zinc-500 block">
                            Быстрые подсказки:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {NEXT_TOPIC_LIBRARY.filter(
                              (item) =>
                                !commonDraft.nextChapterTopics.some(
                                  (t) =>
                                    t.title.toLowerCase() ===
                                    item.title.toLowerCase()
                                )
                            ).map((item) => (
                              <button
                                key={item.title}
                                type="button"
                                onClick={() =>
                                  setCommonDraft((prev) => ({
                                    ...prev,
                                    nextChapterTopics: [
                                      ...prev.nextChapterTopics,
                                      {
                                        id: `nt-${Date.now()}-${item.iconKey}`,
                                        title: item.title,
                                        iconKey: item.iconKey,
                                      },
                                    ],
                                  }))
                                }
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-[#0D9488]/60 bg-white text-zinc-800 hover:bg-[#F0FDFA] font-medium transition-colors"
                              >
                                <Plus className="w-3 h-3 text-[#0D9488] shrink-0" />
                                <span>{item.title}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Accented Custom Topic Input with (+) Button */}
                    <div className="p-3 rounded-lg bg-[#F4F4F5] border border-dashed border-zinc-300 flex items-center gap-2.5">
                      <div className="relative flex-1 flex items-center">
                        <input
                          type="text"
                          value={newNextTopicTitle}
                          onChange={(e) => setNewNextTopicTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddCustomNextTopic();
                            }
                          }}
                          placeholder="Своя тема..."
                          className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-[#0D9488] focus:ring-2 focus:ring-[#0D9488]/15"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleAddCustomNextTopic}
                        disabled={!newNextTopicTitle.trim()}
                        className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#0D9488] hover:bg-[#0F766E] disabled:opacity-45 text-white text-xs font-bold shrink-0 transition-colors"
                        title="Добавить тему"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Добавить</span>
                      </button>
                    </div>
                  </section>
                )}
              </div>
            </div>

            {/* Sticky Bottom Step Navigation */}
            <div className="shrink-0 bg-white border-t border-zinc-200 px-6 py-3 flex items-center justify-between gap-4">
              <button
                type="button"
                disabled={commonStep === 1}
                onClick={() =>
                  setCommonStep((s) => Math.max(1, s - 1) as CommonStep)
                }
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 disabled:opacity-45 text-xs font-semibold text-zinc-700"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Назад</span>
              </button>

              <span className="text-xs font-medium text-zinc-500 tabular-nums">
                Шаг {commonStep} из 4
              </span>

              <div className="flex items-center gap-2">
                {commonStep < 4 && (
                  <button
                    type="button"
                    onClick={() =>
                      setCommonStep((s) => Math.min(4, s + 1) as CommonStep)
                    }
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-zinc-200 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold"
                  >
                    <span>Далее</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setEditorTab('individual')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[#0D9488]/40 bg-[#F0FDFA] hover:bg-[#CCFBF1]/60 text-[#0F766E] text-xs font-semibold whitespace-nowrap"
                >
                  <span>Перейти в Редактор учеников</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </main>
        ) : !selectedStudent || !activeDoc ? (
          <main className="flex-1 flex items-center justify-center p-8 bg-[#FAF9F6]">
            <div className="bg-white border border-zinc-200/80 rounded-2xl p-8 text-center max-w-md space-y-4 shadow-2xs">
              {groupStudents.length > 0 ? (
                <>
                  <div className="w-11 h-11 rounded-2xl bg-[#F0FDFA] border border-[#99F6E4] text-[#0F766E] flex items-center justify-center mx-auto">
                    <Users className="w-5 h-5" />
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-sm font-bold text-zinc-900">
                      Выберите ученика слева, чтобы начать редактирование его журнала
                    </p>
                    <p className="text-xs text-zinc-500">
                      Нажмите на имя ученика в списке слева — откроются страницы А4 и индивидуальные настройки справа.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditorTab('common')}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-xs font-semibold text-zinc-700"
                  >
                    <Layers className="w-3.5 h-3.5 text-[#0D9488]" />
                    <span>Вернуться к общим данным группы</span>
                  </button>
                </>
              ) : (
                <>
                  <p className="text-sm font-bold text-zinc-900">
                    Добавьте первого ученика в группу
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
                </>
              )}
            </div>
          </main>
        ) : (
          /* CENTER FIGMA PAN/ZOOM CANVAS + RIGHT FIGMA INSPECTOR */
          <>
            {/* 2. CENTER COLUMN: FIGMA-STYLE PAN & ZOOM CANVAS (NO SCROLLBARS) */}
            <main className="flex-1 min-w-0 min-h-0 flex flex-col bg-[#FAF9F6] overflow-hidden">
              {/* Slim Canvas Controls Bar */}
              <div className="h-11 shrink-0 bg-white/95 border-b border-zinc-200/80 px-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setPageFocus(1)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-medium transition-colors whitespace-nowrap ${
                        pageFocus === 1
                          ? 'border-[#0D9488] bg-[#F0FDFA] text-[#0F766E]'
                          : 'border-zinc-200 bg-white text-zinc-600 hover:text-zinc-900'
                      }`}
                    >
                      <span className="w-2.5 h-3.5 rounded-xs border border-current bg-[#6CE3E2]/45 block" />
                      <span>Стр. 1</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPageFocus(2)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-medium transition-colors whitespace-nowrap ${
                        pageFocus === 2
                          ? 'border-[#0D9488] bg-[#F0FDFA] text-[#0F766E]'
                          : 'border-zinc-200 bg-white text-zinc-600 hover:text-zinc-900'
                      }`}
                    >
                      <span className="w-2.5 h-3.5 rounded-xs border border-current bg-[#FFE14D]/55 block" />
                      <span>Стр. 2</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPageFocus('spread')}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md border text-xs font-medium transition-colors whitespace-nowrap ${
                        pageFocus === 'spread'
                          ? 'border-[#0D9488] bg-[#F0FDFA] text-[#0F766E]'
                          : 'border-zinc-200 bg-white text-zinc-600 hover:text-zinc-900'
                      }`}
                    >
                      <Columns2 className="w-3.5 h-3.5" />
                      <span className="hidden xl:inline">Обе</span>
                    </button>
                  </div>

                  {activeDocProgress && (
                    <span className="hidden sm:inline text-xs font-medium text-zinc-500 tabular-nums pl-2 border-l border-zinc-200 truncate">
                      {activeDoc.resident.fullName} · {activeDocProgress.label}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setEditorTab('common')}
                    className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-[#0D9488]/40 bg-[#F0FDFA] hover:bg-[#CCFBF1]/60 text-[11px] font-semibold text-[#0F766E] whitespace-nowrap"
                  >
                    <BookOpen className="w-3 h-3" />
                    <span>Программа группы</span>
                  </button>

                  <div className="flex items-center gap-0.5 p-0.5 bg-[#F6F5F0] rounded-md border border-zinc-200/70">
                    <button
                      type="button"
                      onClick={() => applyPresetZoom('auto')}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono tabular-nums whitespace-nowrap ${
                        zoom === 'auto'
                          ? 'bg-white text-zinc-900 shadow-2xs font-semibold'
                          : 'text-zinc-600 hover:text-zinc-900'
                      }`}
                      title="Вписать лист в окно и центрировать"
                    >
                      <RotateCcw className="w-2.5 h-2.5" />
                      <span>
                        {zoom === 'auto'
                          ? `Авто ${Math.round(effectiveScale * 100)}%`
                          : `${Math.round(effectiveScale * 100)}%`}
                      </span>
                    </button>
                    {([0.75, 1] as const).map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => applyPresetZoom(preset)}
                        className={`px-2 py-0.5 rounded text-[11px] font-mono tabular-nums whitespace-nowrap ${
                          zoom === preset
                            ? 'bg-white text-zinc-900 shadow-2xs font-semibold'
                            : 'text-zinc-500 hover:text-zinc-900'
                        }`}
                      >
                        {Math.round(preset * 100)}%
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Infinite Figma-like Stage (Zero Scrollbars, Wheel Zoom to Cursor, Space/MMB Pan, Subtle Grid) */}
              <div
                ref={canvasStageRef}
                onMouseDown={handleCanvasMouseDown}
                onAuxClick={(e) => {
                  if (e.button === 1) e.preventDefault();
                }}
                style={{
                  backgroundColor: '#EDEDED',
                  backgroundImage:
                    'linear-gradient(to right, rgba(0, 0, 0, 0.035) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 0, 0, 0.035) 1px, transparent 1px)',
                  backgroundSize: '24px 24px',
                }}
                className={`flex-1 min-h-0 overflow-hidden relative select-none ${
                  isPanning
                    ? 'cursor-grabbing'
                    : spacePressed
                    ? 'cursor-grab'
                    : 'cursor-default'
                }`}
              >
                <div
                  style={{
                    width: `${logicalW}px`,
                    height: `${A4_PAGE_HEIGHT}px`,
                    gap: effectiveSpread ? `${A4_SPREAD_GAP}px` : '0px',
                    transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${effectiveScale})`,
                    transformOrigin: '0 0',
                  }}
                  className={`absolute top-0 left-0 flex items-start ${
                    spacePressed || isPanning ? 'pointer-events-none' : ''
                  }`}
                >
                  {(effectiveSpread || pageFocus === 1) && (
                    <A4PageSlot className="shadow-[0_12px_36px_rgba(24,24,27,0.09)] rounded-xs">
                      <JournalPageOne
                        doc={activeDoc}
                        mediaAssets={mediaAssets}
                        designMode={inspectorMode === 'design'}
                        activeTarget={activeTarget}
                        activeTextField={activeTextField}
                        scaleFactor={effectiveScale}
                        onSelectTarget={handleSelectTargetOnA4}
                        onSelectTextField={handleSelectTextField}
                        onUpdateTransform={(blockId, next) =>
                          handleUpdatePageTransform(1, blockId, next)
                        }
                        onMoveDecor={(decorId, x, y) =>
                          handleMoveDecor(1, decorId, x, y)
                        }
                        onUpdateDecor={(decorId, patch) =>
                          handleUpdateDecor(1, decorId, patch)
                        }
                        onUpdateDecorText={(decorId, text) =>
                          handleUpdateDecor(1, decorId, { text })
                        }
                        onUpdatePage1={(patch) =>
                          onChangeJournal({
                            ...activeDoc,
                            page1: { ...activeDoc.page1, ...patch },
                          })
                        }
                        onUpdateModule={(moduleId, patch) =>
                          onChangeJournal({
                            ...activeDoc,
                            page1: {
                              ...activeDoc.page1,
                              modules: activeDoc.page1.modules.map((m) =>
                                m.id === moduleId ? { ...m, ...patch } : m
                              ),
                            },
                          })
                        }
                        onUpdateSkill={(skillId, patch) =>
                          onChangeJournal({
                            ...activeDoc,
                            page1: {
                              ...activeDoc.page1,
                              skills: activeDoc.page1.skills.map((s) =>
                                s.id === skillId ? { ...s, ...patch } : s
                              ),
                            },
                          })
                        }
                        onUpdateProject={(projectId, patch) =>
                          onChangeJournal({
                            ...activeDoc,
                            page1: {
                              ...activeDoc.page1,
                              projects: activeDoc.page1.projects.map((p) =>
                                p.id === projectId ? { ...p, ...patch } : p
                              ),
                            },
                          })
                        }
                        onInteractionStart={handleBeginCanvasGesture}
                        onInteractionEnd={handleEndCanvasGesture}
                      />
                    </A4PageSlot>
                  )}

                  {(effectiveSpread || pageFocus === 2) && (
                    <A4PageSlot className="shadow-[0_12px_36px_rgba(24,24,27,0.09)] rounded-xs">
                      <JournalPageTwo
                        doc={activeDoc}
                        designMode={inspectorMode === 'design'}
                        activeTarget={activeTarget}
                        activeTextField={activeTextField}
                        scaleFactor={effectiveScale}
                        onSelectTarget={handleSelectTargetOnA4}
                        onSelectTextField={handleSelectTextField}
                        onUpdateTransform={(blockId, next) =>
                          handleUpdatePageTransform(2, blockId, next)
                        }
                        onMoveDecor={(decorId, x, y) =>
                          handleMoveDecor(2, decorId, x, y)
                        }
                        onUpdateDecor={(decorId, patch) =>
                          handleUpdateDecor(2, decorId, patch)
                        }
                        onUpdateDecorText={(decorId, text) =>
                          handleUpdateDecor(2, decorId, { text })
                        }
                        onUpdatePage2={(patch) =>
                          onChangeJournal({
                            ...activeDoc,
                            page2: { ...activeDoc.page2, ...patch },
                          })
                        }
                        onUpdateStrength={(strengthId, patch) =>
                          onChangeJournal({
                            ...activeDoc,
                            page2: {
                              ...activeDoc.page2,
                              strengths: activeDoc.page2.strengths.map((s) =>
                                s.id === strengthId ? { ...s, ...patch } : s
                              ),
                            },
                          })
                        }
                        onUpdateMentorNote={(patch) =>
                          onChangeJournal({
                            ...activeDoc,
                            page2: {
                              ...activeDoc.page2,
                              mentorNote: {
                                ...activeDoc.page2.mentorNote,
                                ...patch,
                              },
                            },
                          })
                        }
                        onUpdateNextChapterTitle={(title) =>
                          onChangeJournal({
                            ...activeDoc,
                            page2: {
                              ...activeDoc.page2,
                              nextChapter: {
                                ...activeDoc.page2.nextChapter,
                                title,
                              },
                            },
                          })
                        }
                        onUpdateNextTopicTitle={(topicId, title) =>
                          onChangeJournal({
                            ...activeDoc,
                            page2: {
                              ...activeDoc.page2,
                              nextChapter: {
                                ...activeDoc.page2.nextChapter,
                                topics: activeDoc.page2.nextChapter.topics.map(
                                  (t) =>
                                    t.id === topicId ? { ...t, title } : t
                                ),
                              },
                            },
                          })
                        }
                        onInteractionStart={handleBeginCanvasGesture}
                        onInteractionEnd={handleEndCanvasGesture}
                      />
                    </A4PageSlot>
                  )}
                </div>

                {/* Subtle Bottom Navigation Pill */}
                <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
                  <div className="pointer-events-auto inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/95 border border-zinc-200/90 shadow-xs text-[11px] text-zinc-500">
                    <Hand className="w-3 h-3 text-[#0D9488]" />
                    <span className="hidden sm:inline">
                      Space + ЛКМ / Колесо — рука и зум
                    </span>
                    <span className="text-zinc-300 hidden sm:inline">·</span>
                    <button
                      type="button"
                      onClick={() => fitAndCenterCanvas()}
                      className="font-semibold text-[#0F766E] hover:underline"
                    >
                      Вписать
                    </button>
                    <span className="text-zinc-300">·</span>
                    <button
                      type="button"
                      onClick={() => onOpenPreview(activeDoc.id)}
                      className="inline-flex items-center gap-1 font-medium text-zinc-700 hover:text-zinc-900"
                    >
                      <Maximize2 className="w-3 h-3" />
                      <span>Разворот</span>
                    </button>
                  </div>
                </div>
              </div>
            </main>

            {/* 3. RIGHT COLUMN: FIGMA-STYLE RESIZABLE INSPECTOR PANEL */}
            {rightCollapsed ? (
              <div className="hidden lg:flex w-9 shrink-0 bg-white border-l border-zinc-200/70 flex-col items-center py-3 gap-3">
                <button
                  type="button"
                  onClick={() => setRightCollapsed(false)}
                  className="w-6 h-6 rounded-full border border-zinc-200 bg-white hover:bg-[#F0FDFA] hover:border-[#0D9488] text-zinc-600 hover:text-[#0D9488] flex items-center justify-center shadow-xs transition-colors"
                  title="Развернуть панель настроек"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="text-[10px] font-bold text-zinc-500 [writing-mode:vertical-rl] tracking-wide">
                  Инспектор
                </span>
              </div>
            ) : (
              <>
                {/* RIGHT INVISIBLE FIGMA RESIZER (2px TEAL LINE + CIRCLE COLLAPSE ON HOVER) */}
                <div
                  role="separator"
                  aria-orientation="vertical"
                  aria-label="Изменить ширину правой панели"
                  onMouseDown={(e) => startResize('right', e)}
                  className="hidden lg:flex w-2 -mx-1 shrink-0 cursor-col-resize items-center justify-center group select-none relative z-20"
                  title="Потяните, чтобы изменить ширину панели"
                >
                  <div
                    className={`w-[2px] h-full transition-colors ${
                      draggingSide === 'right'
                        ? 'bg-[#0D9488]'
                        : 'bg-transparent group-hover:bg-[#0D9488]'
                    }`}
                  />
                  <button
                    type="button"
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.stopPropagation();
                      setRightCollapsed(true);
                    }}
                    className="absolute top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white border border-zinc-200 hover:border-[#0D9488] hover:text-[#0D9488] text-zinc-500 flex items-center justify-center shadow-sm z-30 cursor-pointer opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                    title="Свернуть правую панель"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <aside className="w-full lg:w-[var(--right-panel-w)] shrink-0 bg-white border-t lg:border-t-0 border-zinc-200 flex flex-col min-h-0 lg:h-full overflow-hidden">
                  {/* Inspector Mode Tabs Only: Контент | Дизайн */}
                  <div className="shrink-0 px-4 pt-1 border-b border-zinc-200/80 bg-white">
                    <div className="flex items-center gap-5">
                      <button
                        type="button"
                        onClick={() => setInspectorMode('content')}
                        className={`inline-flex items-center gap-1.5 py-2 border-b-2 text-xs font-semibold transition-colors whitespace-nowrap ${
                          inspectorMode === 'content'
                            ? 'border-[#0D9488] text-zinc-900'
                            : 'border-transparent text-zinc-400 hover:text-zinc-800'
                        }`}
                      >
                        <SlidersHorizontal
                          className={`w-3.5 h-3.5 ${
                            inspectorMode === 'content'
                              ? 'text-[#0D9488]'
                              : 'text-zinc-400'
                          }`}
                        />
                        <span>Контент</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setInspectorMode('design')}
                        className={`inline-flex items-center gap-1.5 py-2 border-b-2 text-xs font-semibold transition-colors whitespace-nowrap ${
                          inspectorMode === 'design'
                            ? 'border-[#0D9488] text-zinc-900'
                            : 'border-transparent text-zinc-400 hover:text-zinc-800'
                        }`}
                      >
                        <Paintbrush
                          className={`w-3.5 h-3.5 ${
                            inspectorMode === 'design'
                              ? 'text-[#0D9488]'
                              : 'text-zinc-400'
                          }`}
                        />
                        <span>Дизайн</span>
                      </button>
                    </div>
                  </div>

                  {/* Live Right-Panel Text Editor (Synced in Real Time with A4 Canvas) */}
                  {activeTextField && (() => {
                    let fieldLabel = 'Редактирование текста';
                    let currentValue = '';
                    let updateValue: (next: string) => void = () => {};
                    let companionNode: React.ReactNode = null;

                    if (activeTextField.page === 1) {
                      if (activeTextField.field === 'coverTitle') {
                        const curTitleSize =
                          activeDoc.page1.coverTitleSize ??
                          (activeDoc.resident.ageCategory === '14-15' ? 50 : 58);
                        const curTitleColor =
                          activeDoc.page1.coverTitleColor || '#FFFFFF';
                        fieldLabel = 'Обложка · Заголовок «МОЙ ПУТЬ»';
                        currentValue = activeDoc.page1.coverTitle;
                        updateValue = (val) =>
                          onChangeJournal({
                            ...activeDoc,
                            page1: { ...activeDoc.page1, coverTitle: val },
                          });
                        companionNode = (
                          <div className="pt-1.5 grid grid-cols-2 gap-2">
                            <label className="block">
                              <span className="text-[10px] text-zinc-500">
                                Размер шрифта (px)
                              </span>
                              <input
                                type="number"
                                min={22}
                                max={92}
                                value={curTitleSize}
                                onChange={(e) =>
                                  onChangeJournal({
                                    ...activeDoc,
                                    page1: {
                                      ...activeDoc.page1,
                                      coverTitleSize: Math.max(
                                        22,
                                        Math.min(92, Number(e.target.value) || 58)
                                      ),
                                    },
                                  })
                                }
                                className={flatInputClass}
                              />
                            </label>
                            <label className="block">
                              <span className="text-[10px] text-zinc-500">
                                Цвет текста
                              </span>
                              <div className="flex items-center gap-1.5 mt-1">
                                <input
                                  type="color"
                                  value={curTitleColor}
                                  onChange={(e) =>
                                    onChangeJournal({
                                      ...activeDoc,
                                      page1: {
                                        ...activeDoc.page1,
                                        coverTitleColor: e.target.value,
                                      },
                                    })
                                  }
                                  className="w-6 h-6 rounded border border-zinc-200 cursor-pointer bg-white p-0.5 shrink-0"
                                />
                                <input
                                  type="text"
                                  value={curTitleColor}
                                  onChange={(e) =>
                                    onChangeJournal({
                                      ...activeDoc,
                                      page1: {
                                        ...activeDoc.page1,
                                        coverTitleColor: e.target.value,
                                      },
                                    })
                                  }
                                  className={flatInputClass}
                                />
                              </div>
                            </label>
                          </div>
                        );
                      } else if (activeTextField.field === 'coverSubtitle') {
                        const curSubSize =
                          activeDoc.page1.coverSubtitleSize ?? 26;
                        const curSubColor =
                          activeDoc.page1.coverSubtitleColor || '#111827';
                        fieldLabel = 'Обложка · Подзаголовок';
                        currentValue = activeDoc.page1.coverSubtitle;
                        updateValue = (val) =>
                          onChangeJournal({
                            ...activeDoc,
                            page1: { ...activeDoc.page1, coverSubtitle: val },
                          });
                        companionNode = (
                          <div className="pt-1.5 grid grid-cols-2 gap-2">
                            <label className="block">
                              <span className="text-[10px] text-zinc-500">
                                Размер шрифта (px)
                              </span>
                              <input
                                type="number"
                                min={14}
                                max={54}
                                value={curSubSize}
                                onChange={(e) =>
                                  onChangeJournal({
                                    ...activeDoc,
                                    page1: {
                                      ...activeDoc.page1,
                                      coverSubtitleSize: Math.max(
                                        14,
                                        Math.min(54, Number(e.target.value) || 26)
                                      ),
                                    },
                                  })
                                }
                                className={flatInputClass}
                              />
                            </label>
                            <label className="block">
                              <span className="text-[10px] text-zinc-500">
                                Цвет текста
                              </span>
                              <div className="flex items-center gap-1.5 mt-1">
                                <input
                                  type="color"
                                  value={curSubColor}
                                  onChange={(e) =>
                                    onChangeJournal({
                                      ...activeDoc,
                                      page1: {
                                        ...activeDoc.page1,
                                        coverSubtitleColor: e.target.value,
                                      },
                                    })
                                  }
                                  className="w-6 h-6 rounded border border-zinc-200 cursor-pointer bg-white p-0.5 shrink-0"
                                />
                                <input
                                  type="text"
                                  value={curSubColor}
                                  onChange={(e) =>
                                    onChangeJournal({
                                      ...activeDoc,
                                      page1: {
                                        ...activeDoc.page1,
                                        coverSubtitleColor: e.target.value,
                                      },
                                    })
                                  }
                                  className={flatInputClass}
                                />
                              </div>
                            </label>
                          </div>
                        );
                      } else if (activeTextField.field === 'coverSpeechBubble') {
                        const curBubble =
                          activeDoc.page1.coverSpeechBubbleText !== undefined
                            ? activeDoc.page1.coverSpeechBubbleText
                            : DEFAULT_SPEECH_BUBBLE_TEXT;
                        const curBubbleSize =
                          activeDoc.page1.coverBubbleFontSize ?? 16.5;
                        const curBubbleColor =
                          activeDoc.page1.coverBubbleTextColor || '#111827';
                        fieldLabel = 'Обложка · Облачко мишки (Стр. 1)';
                        currentValue = curBubble;
                        updateValue = (val) =>
                          onChangeJournal({
                            ...activeDoc,
                            page1: {
                              ...activeDoc.page1,
                              coverSpeechBubbleText: val,
                            },
                          });
                        companionNode = (
                          <div className="pt-1 space-y-2">
                            <div className="grid grid-cols-2 gap-2">
                              <label className="block">
                                <span className="text-[10px] text-zinc-500">
                                  Шрифт (px)
                                </span>
                                <input
                                  type="number"
                                  min={11}
                                  max={30}
                                  step={0.5}
                                  value={curBubbleSize}
                                  onChange={(e) =>
                                    onChangeJournal({
                                      ...activeDoc,
                                      page1: {
                                        ...activeDoc.page1,
                                        coverBubbleFontSize: Math.max(
                                          11,
                                          Math.min(30, Number(e.target.value) || 16.5)
                                        ),
                                      },
                                    })
                                  }
                                  className={flatInputClass}
                                />
                              </label>
                              <label className="block">
                                <span className="text-[10px] text-zinc-500">
                                  Цвет текста
                                </span>
                                <div className="flex items-center gap-1.5 mt-1">
                                  <input
                                    type="color"
                                    value={curBubbleColor}
                                    onChange={(e) =>
                                      onChangeJournal({
                                        ...activeDoc,
                                        page1: {
                                          ...activeDoc.page1,
                                          coverBubbleTextColor: e.target.value,
                                        },
                                      })
                                    }
                                    className="w-6 h-6 rounded border border-zinc-200 cursor-pointer bg-white p-0.5 shrink-0"
                                  />
                                  <input
                                    type="text"
                                    value={curBubbleColor}
                                    onChange={(e) =>
                                      onChangeJournal({
                                        ...activeDoc,
                                        page1: {
                                          ...activeDoc.page1,
                                          coverBubbleTextColor: e.target.value,
                                        },
                                      })
                                    }
                                    className={flatInputClass}
                                  />
                                </div>
                              </label>
                            </div>
                            <span className="text-[10px] font-semibold text-zinc-500 block">
                              Готовые фразы (нажмите для выбора):
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {SPEECH_BUBBLE_PRESETS.map((preset) => {
                                const isMatched = curBubble.trim() === preset;
                                return (
                                  <button
                                    key={preset}
                                    type="button"
                                    onClick={() => updateValue(preset)}
                                    className={`px-2 py-1 rounded-md border text-[10px] font-medium transition-colors text-left ${
                                      isMatched
                                        ? 'border-[#0D9488] bg-[#0D9488] text-white'
                                        : 'border-zinc-200 bg-white text-zinc-700 hover:border-[#0D9488] hover:text-[#0F766E]'
                                    }`}
                                  >
                                    {preset}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      } else if (
                        activeTextField.field === 'moduleTitle' ||
                        activeTextField.field === 'moduleSubtitle' ||
                        activeTextField.field === 'moduleDescription'
                      ) {
                        const mod = activeDoc.page1.modules.find(
                          (m) => m.id === activeTextField.itemId
                        );
                        if (mod) {
                          const patchMod = (patch: Partial<ModuleItem>) =>
                            onChangeJournal({
                              ...activeDoc,
                              page1: {
                                ...activeDoc.page1,
                                modules: activeDoc.page1.modules.map((m) =>
                                  m.id === mod.id ? { ...m, ...patch } : m
                                ),
                              },
                            });
                          if (activeTextField.field === 'moduleTitle') {
                            fieldLabel = `Модуль «${mod.title || 'Без названия'}» · Заголовок`;
                            currentValue = mod.title;
                            updateValue = (val) => patchMod({ title: val });
                          } else if (activeTextField.field === 'moduleSubtitle') {
                            fieldLabel = `Модуль «${mod.title || 'Без названия'}» · Подзаголовок`;
                            currentValue = mod.subtitle;
                            updateValue = (val) => patchMod({ subtitle: val });
                          } else {
                            fieldLabel = `Модуль «${mod.title || 'Без названия'}» · Описание`;
                            currentValue = mod.description;
                            updateValue = (val) => patchMod({ description: val });
                          }
                        }
                      } else if (activeTextField.field === 'skillLabel') {
                        const sk = activeDoc.page1.skills.find(
                          (s) => s.id === activeTextField.itemId
                        );
                        if (sk) {
                          fieldLabel = 'Навык («Чему я научился»)';
                          currentValue = sk.label;
                          updateValue = (val) =>
                            onChangeJournal({
                              ...activeDoc,
                              page1: {
                                ...activeDoc.page1,
                                skills: activeDoc.page1.skills.map((s) =>
                                  s.id === sk.id ? { ...s, label: val } : s
                                ),
                              },
                            });
                        }
                      } else if (
                        activeTextField.field === 'projectTitle' ||
                        activeTextField.field === 'projectCaption' ||
                        activeTextField.field === 'projectDescription'
                      ) {
                        const proj = activeDoc.page1.projects.find(
                          (p) => p.id === activeTextField.itemId
                        );
                        if (proj) {
                          const patchProj = (patch: Partial<ProjectItem>) =>
                            onChangeJournal({
                              ...activeDoc,
                              page1: {
                                ...activeDoc.page1,
                                projects: activeDoc.page1.projects.map((p) =>
                                  p.id === proj.id ? { ...p, ...patch } : p
                                ),
                              },
                            });
                          if (activeTextField.field === 'projectTitle') {
                            fieldLabel = `Проект «${proj.title || 'Без названия'}» · Название`;
                            currentValue = proj.title;
                            updateValue = (val) => patchProj({ title: val });
                            companionNode = (
                              <label className="block pt-1">
                                <span className="text-[10px] text-zinc-500">
                                  Подпись проекта
                                </span>
                                <input
                                  type="text"
                                  value={proj.caption || proj.description}
                                  onChange={(e) =>
                                    patchProj({ caption: e.target.value })
                                  }
                                  className={flatInputClass}
                                />
                              </label>
                            );
                          } else if (activeTextField.field === 'projectCaption') {
                            fieldLabel = `Проект «${proj.title || 'Без названия'}» · Подпись`;
                            currentValue = proj.caption;
                            updateValue = (val) => patchProj({ caption: val });
                          } else {
                            fieldLabel = `Проект «${proj.title || 'Без названия'}» · Описание`;
                            currentValue = proj.description;
                            updateValue = (val) => patchProj({ description: val });
                          }
                        }
                      } else if (activeTextField.field === 'decorText') {
                        const dec = (activeDoc.page1.decorElements ?? []).find(
                          (d) => d.id === activeTextField.itemId
                        );
                        if (dec) {
                          fieldLabel = 'Свободный текстовый блок · Стр. 1';
                          currentValue = dec.text ?? '';
                          updateValue = (val) =>
                            handleUpdateDecor(1, dec.id, { text: val });
                        }
                      }
                    } else {
                      if (activeTextField.field === 'page2HeaderTitle') {
                        fieldLabel = 'Заголовок 2-й страницы';
                        currentValue = activeDoc.page2.headerTitle;
                        updateValue = (val) =>
                          onChangeJournal({
                            ...activeDoc,
                            page2: { ...activeDoc.page2, headerTitle: val },
                          });
                      } else if (
                        activeTextField.field === 'strengthTitle' ||
                        activeTextField.field === 'strengthExample'
                      ) {
                        const st = activeDoc.page2.strengths.find(
                          (s) => s.id === activeTextField.itemId
                        );
                        if (st) {
                          const patchStrength = (patch: Partial<StrengthItem>) =>
                            onChangeJournal({
                              ...activeDoc,
                              page2: {
                                ...activeDoc.page2,
                                strengths: activeDoc.page2.strengths.map((s) =>
                                  s.id === st.id ? { ...s, ...patch } : s
                                ),
                              },
                            });
                          if (activeTextField.field === 'strengthTitle') {
                            fieldLabel = 'Сильная сторона · Заголовок';
                            currentValue = st.title;
                            updateValue = (val) => patchStrength({ title: val });
                          } else {
                            fieldLabel = `Сильная сторона «${st.title}» · Описание`;
                            currentValue = st.example;
                            updateValue = (val) =>
                              patchStrength({ example: val });
                          }
                        }
                      } else if (activeTextField.field === 'prideTitle') {
                        fieldLabel = 'Момент гордости · Заголовок';
                        currentValue = activeDoc.page2.prideTitle;
                        updateValue = (val) =>
                          onChangeJournal({
                            ...activeDoc,
                            page2: { ...activeDoc.page2, prideTitle: val },
                          });
                      } else if (activeTextField.field === 'prideText') {
                        fieldLabel = 'Момент гордости · Текст достижения';
                        currentValue = activeDoc.page2.prideText;
                        updateValue = (val) =>
                          onChangeJournal({
                            ...activeDoc,
                            page2: { ...activeDoc.page2, prideText: val },
                          });
                      } else if (
                        activeTextField.field === 'mentorGreeting' ||
                        activeTextField.field === 'mentorBody' ||
                        activeTextField.field === 'mentorSignature'
                      ) {
                        const patchNote = (
                          patch: Partial<JournalDocument['page2']['mentorNote']>
                        ) =>
                          onChangeJournal({
                            ...activeDoc,
                            page2: {
                              ...activeDoc.page2,
                              mentorNote: {
                                ...activeDoc.page2.mentorNote,
                                ...patch,
                              },
                            },
                          });
                        if (activeTextField.field === 'mentorGreeting') {
                          fieldLabel = 'Слово наставника · Приветствие';
                          currentValue = activeDoc.page2.mentorNote.greeting;
                          updateValue = (val) => patchNote({ greeting: val });
                        } else if (activeTextField.field === 'mentorBody') {
                          fieldLabel = 'Слово наставника · Основной текст';
                          currentValue = activeDoc.page2.mentorNote.body;
                          updateValue = (val) => patchNote({ body: val });
                        } else {
                          fieldLabel = 'Слово наставника · Подпись';
                          currentValue = activeDoc.page2.mentorNote.signature;
                          updateValue = (val) => patchNote({ signature: val });
                        }
                      } else if (activeTextField.field === 'nextChapterTitle') {
                        fieldLabel = 'Карта будущего · Заголовок';
                        currentValue = activeDoc.page2.nextChapter.title;
                        updateValue = (val) =>
                          onChangeJournal({
                            ...activeDoc,
                            page2: {
                              ...activeDoc.page2,
                              nextChapter: {
                                ...activeDoc.page2.nextChapter,
                                title: val,
                              },
                            },
                          });
                      } else if (activeTextField.field === 'nextTopicTitle') {
                        const topic = activeDoc.page2.nextChapter.topics.find(
                          (t) => t.id === activeTextField.itemId
                        );
                        if (topic) {
                          fieldLabel = 'Карта будущего · Название темы';
                          currentValue = topic.title;
                          updateValue = (val) =>
                            onChangeJournal({
                              ...activeDoc,
                              page2: {
                                ...activeDoc.page2,
                                nextChapter: {
                                  ...activeDoc.page2.nextChapter,
                                  topics: activeDoc.page2.nextChapter.topics.map(
                                    (t) =>
                                      t.id === topic.id
                                        ? { ...t, title: val }
                                        : t
                                  ),
                                },
                              },
                            });
                        }
                      } else if (activeTextField.field === 'decorText') {
                        const dec = (activeDoc.page2.decorElements ?? []).find(
                          (d) => d.id === activeTextField.itemId
                        );
                        if (dec) {
                          fieldLabel = 'Свободный текстовый блок · Стр. 2';
                          currentValue = dec.text ?? '';
                          updateValue = (val) =>
                            handleUpdateDecor(2, dec.id, { text: val });
                        }
                      }
                    }

                    return (
                      <div className="shrink-0 border-b border-[#0D9488]/25 bg-[#F0FDFA]/70 px-3.5 py-3 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-[#0F766E]">
                              Редактирование текста · Стр. {activeTextField.page}
                            </div>
                            <div className="text-xs font-bold text-zinc-900 truncate">
                              {fieldLabel}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setActiveTextField(null)}
                            className="p-1 rounded-md text-zinc-400 hover:text-zinc-800 hover:bg-white transition-colors"
                            title="Закрыть редактор текста"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <textarea
                          ref={textEditorRef}
                          rows={4}
                          value={currentValue}
                          onChange={(e) => updateValue(e.target.value)}
                          placeholder="Введите текст — изменения сразу появятся на листе А4…"
                          className="w-full rounded-lg border border-[#0D9488]/40 bg-white px-2.5 py-2 text-xs leading-relaxed text-zinc-900 shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#0D9488]/25 focus:border-[#0D9488] resize-y"
                        />
                        {companionNode}
                      </div>
                    );
                  })()}

                  {/* Inspector Body */}
                  {inspectorMode === 'design' ? (
                    (() => {
                      const pageCfg =
                        effectiveDesignPage === 1
                          ? activeDoc.page1
                          : activeDoc.page2;
                      const decors = pageCfg.decorElements ?? [];

                      const selectedDecor =
                        activeTarget?.block === 'decor'
                          ? decors.find((d) => d.id === activeTarget.itemId) ??
                            null
                          : null;
                      const selectedBlockId = getBlockIdFromTarget(activeTarget);
                      const selectedBlockPage = activeTarget?.page ?? effectiveDesignPage;
                      const selectedBlockLayouts =
                        selectedBlockPage === 1
                          ? activeDoc.page1.objectLayouts ?? {}
                          : activeDoc.page2.objectLayouts ?? {};
                      const selectedBlockTransform: CanvasObjectTransform | null =
                        selectedBlockId
                          ? selectedBlockLayouts[selectedBlockId] ?? {
                              x: 0,
                              y: 0,
                              scale: 1,
                              rotation: 0,
                              zIndex: getDefaultZForBlock(selectedBlockId),
                            }
                          : null;

                      return (
                        <div className="flex-1 min-h-0 overflow-y-auto p-3.5 space-y-4 text-xs bg-[#FBFBFA]">
                          {/* Active Page Selector + Hint */}
                          <div className="bg-white border border-zinc-200 rounded-lg p-3 space-y-2.5 shadow-[0_1px_2px_rgba(24,24,27,0.03)]">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[11px] font-bold text-zinc-900">
                                Режим дизайна А4
                              </span>
                              <div className="inline-flex items-center p-0.5 rounded-md bg-zinc-100 text-[11px]">
                                {([1, 2] as const).map((pg) => (
                                  <button
                                    key={pg}
                                    type="button"
                                    onClick={() => {
                                      setDesignTargetPage(pg);
                                      if (pageFocus !== 'spread') {
                                        setPageFocus(pg);
                                      }
                                    }}
                                    className={`px-2 py-0.5 rounded font-semibold transition-colors ${
                                      effectiveDesignPage === pg
                                        ? 'bg-white text-zinc-900 shadow-2xs'
                                        : 'text-zinc-500 hover:text-zinc-900'
                                    }`}
                                  >
                                    Стр. {pg}
                                  </button>
                                ))}
                              </div>
                            </div>
                            <p className="text-[11px] text-zinc-500 leading-relaxed">
                              Кликните на блок на листе А4, чтобы перемещать, масштабировать или вращать его. Нажмите на любой текст на листе — справа откроется окно его редактирования.
                            </p>
                          </div>

                          {/* Add Elements Toolbar (+ Text, + Sticker, + Image, + Icon) */}
                          <div className="bg-white border border-zinc-200 rounded-lg p-3 space-y-2.5 shadow-[0_1px_2px_rgba(24,24,27,0.03)]">
                            <div className="text-[11px] font-bold text-zinc-800">
                              Добавить на страницу {effectiveDesignPage}
                            </div>
                            <div className="grid grid-cols-2 gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setDesignIconPickerOpen(false);
                                  setDesignStickerPickerOpen((prev) => !prev);
                                }}
                                className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg border transition-colors ${
                                  designStickerPickerOpen
                                    ? 'border-[#0D9488] bg-[#F0FDFA] text-[#0F766E]'
                                    : 'border-zinc-200 bg-zinc-50/70 hover:border-[#0D9488] hover:bg-[#F0FDFA] text-zinc-800'
                                }`}
                              >
                                <Sparkles className="w-3.5 h-3.5 text-[#0D9488]" />
                                <span className="text-[11px] font-semibold">
                                  + Стикер
                                </span>
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  handleAddTextElement(effectiveDesignPage)
                                }
                                className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg border border-zinc-200 bg-zinc-50/70 hover:border-[#0D9488] hover:bg-[#F0FDFA] text-zinc-800 transition-colors"
                              >
                                <Type className="w-3.5 h-3.5 text-[#0D9488]" />
                                <span className="text-[11px] font-semibold">
                                  + Текст
                                </span>
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  handleAddImageElement(effectiveDesignPage)
                                }
                                className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg border border-zinc-200 bg-zinc-50/70 hover:border-[#0D9488] hover:bg-[#F0FDFA] text-zinc-800 transition-colors"
                              >
                                <ImageIcon className="w-3.5 h-3.5 text-[#0D9488]" />
                                <span className="text-[11px] font-semibold">
                                  + Картинка
                                </span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setDesignStickerPickerOpen(false);
                                  setDesignIconPickerOpen((prev) => !prev);
                                }}
                                className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg border transition-colors ${
                                  designIconPickerOpen
                                    ? 'border-[#0D9488] bg-[#F0FDFA] text-[#0F766E]'
                                    : 'border-zinc-200 bg-zinc-50/70 hover:border-[#0D9488] hover:bg-[#F0FDFA] text-zinc-800'
                                }`}
                              >
                                <Smile className="w-3.5 h-3.5 text-[#0D9488]" />
                                <span className="text-[11px] font-semibold">
                                  + Иконка
                                </span>
                              </button>
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                handleAddTapeElement(effectiveDesignPage)
                              }
                              className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg border border-dashed border-amber-300 bg-amber-50/70 hover:bg-amber-100/70 text-amber-900 transition-colors"
                            >
                              <span className="w-4 h-2 rounded-[2px] bg-[#FDE68A] border border-amber-500/50 inline-block" />
                              <span className="text-[11px] font-semibold">
                                + Скотч (клейкая лента)
                              </span>
                            </button>

                            {designStickerPickerOpen && (
                              <div className="pt-2 border-t border-zinc-100 space-y-1.5">
                                <div className="flex items-center justify-between text-[10px] font-semibold text-zinc-500">
                                  <span>Выберите стикер (поверх фона, под текстом):</span>
                                  <button
                                    type="button"
                                    onClick={() => setDesignStickerPickerOpen(false)}
                                    className="text-zinc-400 hover:text-zinc-700"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                                <div className="grid grid-cols-4 gap-1.5">
                                  {STICKER_PRESET_OPTIONS.map((opt) => (
                                    <button
                                      key={opt.id}
                                      type="button"
                                      onClick={() =>
                                        handleAddStickerElement(
                                          effectiveDesignPage,
                                          opt
                                        )
                                      }
                                      title={opt.label}
                                      className="p-1.5 rounded-lg border border-zinc-200 hover:border-[#0D9488] hover:bg-[#F0FDFA] flex flex-col items-center gap-1 transition-colors"
                                    >
                                      {opt.kind === 'image' && opt.imageUrl ? (
                                        <img
                                          src={opt.imageUrl}
                                          alt={opt.label}
                                          className="w-7 h-7 object-contain"
                                        />
                                      ) : (
                                        <svg viewBox="0 0 60 60" className="w-7 h-7" fill="none">
                                          <path
                                            d="M30 4L36 22L54 24L40 36L44 54L30 44L16 54L20 36L6 24L24 22L30 4Z"
                                            fill={opt.color}
                                            stroke="#18181B"
                                            strokeWidth="2.4"
                                            strokeLinejoin="round"
                                          />
                                        </svg>
                                      )}
                                      <span className="text-[9px] text-zinc-600 truncate w-full text-center">
                                        {opt.label}
                                      </span>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}

                            {designIconPickerOpen && (
                              <div className="pt-2 border-t border-zinc-100 space-y-1.5">
                                <div className="flex items-center justify-between text-[10px] font-semibold text-zinc-500">
                                  <span>Выберите SVG-иконку:</span>
                                  <button
                                    type="button"
                                    onClick={() => setDesignIconPickerOpen(false)}
                                    className="text-zinc-400 hover:text-zinc-700"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                                <div className="grid grid-cols-5 gap-1.5 max-h-44 overflow-y-auto pr-0.5">
                                  {MODULE_VECTOR_ICON_OPTIONS.map((opt) => (
                                    <button
                                      key={opt.key}
                                      type="button"
                                      onClick={() =>
                                        handleAddIconElement(
                                          effectiveDesignPage,
                                          opt.key,
                                          opt.label
                                        )
                                      }
                                      title={opt.label}
                                      className="p-1.5 rounded-lg border border-zinc-200 hover:border-[#0D9488] hover:bg-[#F0FDFA] flex flex-col items-center gap-1 transition-colors"
                                    >
                                      <ModuleVectorIcon
                                        iconKey={opt.key}
                                        className="w-7 h-7"
                                      />
                                      <span className="text-[9px] text-zinc-600 truncate w-full text-center">
                                        {opt.label}
                                      </span>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Selected Element Controls (Layers, Position, Properties) */}
                          {selectedDecor && activeTarget ? (
                            <div className="bg-white border border-[#0D9488]/40 rounded-lg p-3 space-y-3 shadow-[0_1px_2px_rgba(24,24,27,0.03)]">
                              <div className="flex items-center justify-between gap-2 pb-2 border-b border-zinc-100">
                                <div className="min-w-0">
                                  <div className="text-[10px] font-semibold uppercase tracking-wider text-[#0D9488]">
                                    Выбран элемент · Стр. {activeTarget.page}
                                  </div>
                                  <div className="text-xs font-bold text-zinc-900 truncate">
                                    {selectedDecor.label ||
                                      (selectedDecor.kind === 'text'
                                        ? 'Текстовый блок'
                                        : selectedDecor.kind === 'image'
                                        ? 'Картинка'
                                        : selectedDecor.kind === 'tape'
                                        ? 'Скотч (наклейка)'
                                        : 'Иконка')}
                                  </div>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleUpdateDecor(
                                        activeTarget.page,
                                        selectedDecor.id,
                                        { locked: !selectedDecor.locked }
                                      )
                                    }
                                    className={`p-1.5 rounded-md border ${
                                      selectedDecor.locked
                                        ? 'border-amber-300 bg-amber-50 text-amber-700'
                                        : 'border-zinc-200 text-zinc-500 hover:text-zinc-900'
                                    }`}
                                    title={
                                      selectedDecor.locked
                                        ? 'Разблокировать'
                                        : 'Закрепить позицию'
                                    }
                                  >
                                    {selectedDecor.locked ? (
                                      <Lock className="w-3.5 h-3.5" />
                                    ) : (
                                      <Unlock className="w-3.5 h-3.5" />
                                    )}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleDeleteDecor(
                                        activeTarget.page,
                                        selectedDecor.id
                                      )
                                    }
                                    className="p-1.5 rounded-md border border-zinc-200 text-zinc-400 hover:text-red-600 hover:border-red-200"
                                    title="Удалить элемент"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>

                              {/* Coordinates & Dimensions */}
                              <div className="grid grid-cols-2 gap-2">
                                <label className="block">
                                  <span className="text-[10px] text-zinc-500">
                                    X (px)
                                  </span>
                                  <input
                                    type="number"
                                    value={selectedDecor.x}
                                    onChange={(e) =>
                                      handleUpdateDecor(
                                        activeTarget.page,
                                        selectedDecor.id,
                                        { x: Number(e.target.value) || 0 }
                                      )
                                    }
                                    className={flatInputClass}
                                  />
                                </label>
                                <label className="block">
                                  <span className="text-[10px] text-zinc-500">
                                    Y (px)
                                  </span>
                                  <input
                                    type="number"
                                    value={selectedDecor.y}
                                    onChange={(e) =>
                                      handleUpdateDecor(
                                        activeTarget.page,
                                        selectedDecor.id,
                                        { y: Number(e.target.value) || 0 }
                                      )
                                    }
                                    className={flatInputClass}
                                  />
                                </label>
                                <label className="block">
                                  <span className="text-[10px] text-zinc-500">
                                    Ширина (px)
                                  </span>
                                  <input
                                    type="number"
                                    min={32}
                                    max={760}
                                    value={selectedDecor.width}
                                    onChange={(e) =>
                                      handleUpdateDecor(
                                        activeTarget.page,
                                        selectedDecor.id,
                                        {
                                          width: Math.max(
                                            32,
                                            Number(e.target.value) || 80
                                          ),
                                        }
                                      )
                                    }
                                    className={flatInputClass}
                                  />
                                </label>
                                <label className="block">
                                  <span className="text-[10px] text-zinc-500">
                                    Поворот (°)
                                  </span>
                                  <input
                                    type="number"
                                    min={-180}
                                    max={180}
                                    value={selectedDecor.rotation}
                                    onChange={(e) =>
                                      handleUpdateDecor(
                                        activeTarget.page,
                                        selectedDecor.id,
                                        { rotation: Number(e.target.value) || 0 }
                                      )
                                    }
                                    className={flatInputClass}
                                  />
                                </label>
                              </div>

                              {/* Text-specific Controls */}
                              {selectedDecor.kind === 'text' && (
                                <div className="pt-2 border-t border-zinc-100 space-y-2.5">
                                  <label className="block">
                                    <span className="text-[10px] font-semibold text-zinc-600">
                                      Текст блока
                                    </span>
                                    <textarea
                                      rows={2}
                                      value={selectedDecor.text ?? ''}
                                      onChange={(e) =>
                                        handleUpdateDecor(
                                          activeTarget.page,
                                          selectedDecor.id,
                                          { text: e.target.value }
                                        )
                                      }
                                      className="mt-1 w-full rounded-md border border-zinc-200 px-2 py-1.5 text-xs focus:outline-none focus:border-[#0D9488]"
                                    />
                                  </label>
                                  <div className="grid grid-cols-2 gap-2">
                                    <label className="block">
                                      <span className="text-[10px] text-zinc-500">
                                        Шрифт
                                      </span>
                                      <select
                                        value={
                                          selectedDecor.fontFamily ?? 'journal'
                                        }
                                        onChange={(e) =>
                                          handleUpdateDecor(
                                            activeTarget.page,
                                            selectedDecor.id,
                                            {
                                              fontFamily: e.target.value as
                                                | 'journal'
                                                | 'handwriting',
                                            }
                                          )
                                        }
                                        className={flatSelectClass}
                                      >
                                        <option value="journal">Основной</option>
                                        <option value="handwriting">
                                          Рукописный
                                        </option>
                                      </select>
                                    </label>
                                    <label className="block">
                                      <span className="text-[10px] text-zinc-500">
                                        Размер (px)
                                      </span>
                                      <input
                                        type="number"
                                        min={10}
                                        max={64}
                                        value={selectedDecor.fontSize ?? 18}
                                        onChange={(e) =>
                                          handleUpdateDecor(
                                            activeTarget.page,
                                            selectedDecor.id,
                                            {
                                              fontSize: Math.max(
                                                10,
                                                Number(e.target.value) || 18
                                              ),
                                            }
                                          )
                                        }
                                        className={flatInputClass}
                                      />
                                    </label>
                                  </div>
                                  <div className="flex items-center justify-between gap-2">
                                    <label className="inline-flex items-center gap-1.5 text-[11px] text-zinc-600">
                                      <span>Цвет:</span>
                                      <input
                                        type="color"
                                        value={selectedDecor.color || '#111827'}
                                        onChange={(e) =>
                                          handleUpdateDecor(
                                            activeTarget.page,
                                            selectedDecor.id,
                                            { color: e.target.value }
                                          )
                                        }
                                        className="w-6 h-6 rounded border border-zinc-200 cursor-pointer"
                                      />
                                    </label>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleUpdateDecor(
                                          activeTarget.page,
                                          selectedDecor.id,
                                          {
                                            bgColor:
                                              selectedDecor.bgColor &&
                                              selectedDecor.bgColor !==
                                                'transparent'
                                                ? 'transparent'
                                                : 'rgba(255,255,255,0.92)',
                                          }
                                        )
                                      }
                                      className="px-2 py-1 rounded border border-zinc-200 text-[10px] font-semibold text-zinc-700 hover:bg-zinc-50"
                                    >
                                      {selectedDecor.bgColor &&
                                      selectedDecor.bgColor !== 'transparent'
                                        ? 'Убрать плашку'
                                        : 'Добавить плашку'}
                                    </button>
                                  </div>
                                </div>
                              )}

                              {/* Image-specific Controls (Contain default vs Crop frame) */}
                              {selectedDecor.kind === 'image' && (
                                <div className="pt-2 border-t border-zinc-100 space-y-2.5">
                                  <div className="flex items-center justify-between gap-2">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleUpdateDecor(
                                          activeTarget.page,
                                          selectedDecor.id,
                                          {
                                            cropEnabled:
                                              !selectedDecor.cropEnabled,
                                          }
                                        )
                                      }
                                      className={`flex-1 inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-md border text-[11px] font-semibold transition-colors ${
                                        selectedDecor.cropEnabled
                                          ? 'border-[#2563EB] bg-blue-50 text-[#1D4ED8]'
                                          : 'border-zinc-200 bg-white hover:border-[#0D9488] text-zinc-700'
                                      }`}
                                    >
                                      <Crop className="w-3.5 h-3.5" />
                                      <span>
                                        {selectedDecor.cropEnabled
                                          ? 'Кадрирование вкл.'
                                          : 'Кадрировать'}
                                      </span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        onOpenMediaPicker(
                                          'decor',
                                          (url, asset) => {
                                            handleUpdateDecor(
                                              activeTarget.page,
                                              selectedDecor.id,
                                              {
                                                imageUrl: url,
                                                label:
                                                  asset?.name ||
                                                  selectedDecor.label,
                                              }
                                            );
                                          }
                                        )
                                      }
                                      className="px-2.5 py-1.5 rounded-md border border-zinc-200 hover:border-[#0D9488] text-[11px] font-semibold text-zinc-700"
                                    >
                                      Заменить
                                    </button>
                                  </div>

                                  {selectedDecor.cropEnabled ? (
                                    <div className="grid grid-cols-2 gap-2">
                                      <label className="block">
                                        <span className="text-[10px] text-zinc-500">
                                          Фокус X ({selectedDecor.cropPosX ?? 50}
                                          %)
                                        </span>
                                        <input
                                          type="range"
                                          min={0}
                                          max={100}
                                          value={selectedDecor.cropPosX ?? 50}
                                          onChange={(e) =>
                                            handleUpdateDecor(
                                              activeTarget.page,
                                              selectedDecor.id,
                                              {
                                                cropPosX: Number(
                                                  e.target.value
                                                ),
                                              }
                                            )
                                          }
                                          className="w-full accent-[#2563EB] mt-1"
                                        />
                                      </label>
                                      <label className="block">
                                        <span className="text-[10px] text-zinc-500">
                                          Фокус Y ({selectedDecor.cropPosY ?? 50}
                                          %)
                                        </span>
                                        <input
                                          type="range"
                                          min={0}
                                          max={100}
                                          value={selectedDecor.cropPosY ?? 50}
                                          onChange={(e) =>
                                            handleUpdateDecor(
                                              activeTarget.page,
                                              selectedDecor.id,
                                              {
                                                cropPosY: Number(
                                                  e.target.value
                                                ),
                                              }
                                            )
                                          }
                                          className="w-full accent-[#2563EB] mt-1"
                                        />
                                      </label>
                                    </div>
                                  ) : (
                                    <div className="text-[10px] text-zinc-500">
                                      Картинка вписывается целиком без обрезки краёв.
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Icon-specific Controls */}
                              {selectedDecor.kind === 'icon' && (
                                <div className="pt-2 border-t border-zinc-100 flex items-center justify-between gap-2">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleUpdateDecor(
                                        activeTarget.page,
                                        selectedDecor.id,
                                        {
                                          bgColor:
                                            selectedDecor.bgColor &&
                                            selectedDecor.bgColor !==
                                              'transparent'
                                              ? 'transparent'
                                              : '#FFFFFF',
                                        }
                                      )
                                    }
                                    className="px-2.5 py-1.5 rounded-md border border-zinc-200 text-[10px] font-semibold text-zinc-700 hover:bg-zinc-50"
                                  >
                                    {selectedDecor.bgColor &&
                                    selectedDecor.bgColor !== 'transparent'
                                      ? 'Без рамки'
                                      : 'Белая карточка'}
                                  </button>
                                  <span className="text-[10px] text-zinc-400">
                                    Иконка: {selectedDecor.iconKey || 'custom'}
                                  </span>
                                </div>
                              )}

                              {/* Star Color Picker */}
                              {selectedDecor.kind === 'star' && (
                                <div className="pt-2 border-t border-zinc-100 flex items-center justify-between gap-2">
                                  <span className="text-[10px] font-semibold text-zinc-600">
                                    Цвет звезды
                                  </span>
                                  <div className="flex items-center gap-1.5">
                                    {['#FFE14D', '#5EE2E4', '#FF7B6B', '#A78BFA', '#4ADE80'].map(
                                      (hex) => (
                                        <button
                                          key={hex}
                                          type="button"
                                          onClick={() =>
                                            handleUpdateDecor(
                                              activeTarget.page,
                                              selectedDecor.id,
                                              { color: hex }
                                            )
                                          }
                                          style={{ backgroundColor: hex }}
                                          className={`w-5 h-5 rounded-full border ${
                                            selectedDecor.color === hex
                                              ? 'border-zinc-900 ring-2 ring-[#0D9488]/40'
                                              : 'border-zinc-300'
                                          }`}
                                        />
                                      )
                                    )}
                                    <input
                                      type="color"
                                      value={selectedDecor.color || '#FFE14D'}
                                      onChange={(e) =>
                                        handleUpdateDecor(
                                          activeTarget.page,
                                          selectedDecor.id,
                                          { color: e.target.value }
                                        )
                                      }
                                      className="w-6 h-6 rounded border border-zinc-200 cursor-pointer"
                                    />
                                  </div>
                                </div>
                              )}

                              {/* Layering Control (Below Text vs Above Blocks) */}
                              <div className="pt-2 border-t border-zinc-100 space-y-1.5">
                                <div className="flex items-center justify-between text-[10px] font-semibold text-zinc-600">
                                  <span>Порядок слоя (Z-index: {selectedDecor.zIndex})</span>
                                </div>
                                <div className="grid grid-cols-2 gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleUpdateDecor(
                                        activeTarget.page,
                                        selectedDecor.id,
                                        { zIndex: 8 }
                                      )
                                    }
                                    className={`px-2 py-1.5 rounded-md border text-[10px] font-semibold transition-colors ${
                                      selectedDecor.zIndex < 12
                                        ? 'border-[#0D9488] bg-[#F0FDFA] text-[#0F766E]'
                                        : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                                    }`}
                                  >
                                    Под текстом (z=8)
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleUpdateDecor(
                                        activeTarget.page,
                                        selectedDecor.id,
                                        { zIndex: 28 }
                                      )
                                    }
                                    className={`px-2 py-1.5 rounded-md border text-[10px] font-semibold transition-colors ${
                                      selectedDecor.zIndex >= 12
                                        ? 'border-[#0D9488] bg-[#F0FDFA] text-[#0F766E]'
                                        : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                                    }`}
                                  >
                                    Поверх блоков (z=28)
                                  </button>
                                </div>
                              </div>

                              {/* Masking Tape ("Скотч") Controls */}
                              {selectedDecor.kind === 'tape' && (
                                <div className="pt-2 border-t border-zinc-100 space-y-2.5">
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="text-[10px] font-semibold text-zinc-600">
                                      Цвет скотча
                                    </span>
                                    <div className="flex items-center gap-1.5">
                                      {[
                                        '#FDE68A',
                                        '#BAE6FD',
                                        '#BBF7D0',
                                        '#FECDD3',
                                        '#E4E4E7',
                                      ].map((hex) => (
                                        <button
                                          key={hex}
                                          type="button"
                                          onClick={() =>
                                            handleUpdateDecor(
                                              activeTarget.page,
                                              selectedDecor.id,
                                              { color: hex }
                                            )
                                          }
                                          style={{ backgroundColor: hex }}
                                          className={`w-5 h-5 rounded-full border ${
                                            selectedDecor.color === hex
                                              ? 'border-zinc-900 ring-2 ring-[#0D9488]/40'
                                              : 'border-zinc-300'
                                          }`}
                                        />
                                      ))}
                                      <input
                                        type="color"
                                        value={selectedDecor.color || '#FDE68A'}
                                        onChange={(e) =>
                                          handleUpdateDecor(
                                            activeTarget.page,
                                            selectedDecor.id,
                                            { color: e.target.value }
                                          )
                                        }
                                        className="w-6 h-6 rounded border border-zinc-200 cursor-pointer"
                                      />
                                    </div>
                                  </div>
                                  <label className="block">
                                    <span className="text-[10px] text-zinc-500">
                                      Прозрачность (
                                      {Math.round(
                                        (selectedDecor.opacity ?? 0.9) * 100
                                      )}
                                      %)
                                    </span>
                                    <input
                                      type="range"
                                      min={0.3}
                                      max={1}
                                      step={0.05}
                                      value={selectedDecor.opacity ?? 0.9}
                                      onChange={(e) =>
                                        handleUpdateDecor(
                                          activeTarget.page,
                                          selectedDecor.id,
                                          { opacity: Number(e.target.value) }
                                        )
                                      }
                                      className="w-full accent-[#0D9488] mt-1"
                                    />
                                  </label>
                                </div>
                              )}

                              {/* Quick Sticker Replacement Grid & Media Library Replace */}
                              {selectedDecor.kind !== 'text' &&
                                selectedDecor.kind !== 'tape' && (
                                <div className="pt-2 border-t border-zinc-100 space-y-2">
                                  <div className="text-[10px] font-semibold text-zinc-600">
                                    Заменить стикер
                                  </div>
                                  <div className="grid grid-cols-4 gap-1.5">
                                    {STICKER_PRESET_OPTIONS.map((opt) => (
                                      <button
                                        key={opt.id}
                                        type="button"
                                        onClick={() =>
                                          handleReplaceDecorWithSticker(
                                            activeTarget.page,
                                            selectedDecor.id,
                                            opt
                                          )
                                        }
                                        title={`Заменить на «${opt.label}»`}
                                        className={`p-1.5 rounded-lg border flex flex-col items-center gap-0.5 transition-colors ${
                                          (opt.imageUrl &&
                                            selectedDecor.imageUrl ===
                                              opt.imageUrl) ||
                                          (opt.kind === 'star' &&
                                            selectedDecor.kind === 'star' &&
                                            selectedDecor.color === opt.color)
                                            ? 'border-[#0D9488] bg-[#F0FDFA]'
                                            : 'border-zinc-200 hover:border-[#0D9488] hover:bg-zinc-50'
                                        }`}
                                      >
                                        {opt.kind === 'image' && opt.imageUrl ? (
                                          <img
                                            src={opt.imageUrl}
                                            alt={opt.label}
                                            className="w-6 h-6 object-contain"
                                          />
                                        ) : (
                                          <svg viewBox="0 0 60 60" className="w-6 h-6" fill="none">
                                            <path
                                              d="M30 4L36 22L54 24L40 36L44 54L30 44L16 54L20 36L6 24L24 22L30 4Z"
                                              fill={opt.color}
                                              stroke="#18181B"
                                              strokeWidth="2.4"
                                              strokeLinejoin="round"
                                            />
                                          </svg>
                                        )}
                                        <span className="text-[8.5px] text-zinc-600 truncate w-full text-center">
                                          {opt.label}
                                        </span>
                                      </button>
                                    ))}
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      onOpenMediaPicker('decor', (url, asset) => {
                                        handleUpdateDecor(
                                          activeTarget.page,
                                          selectedDecor.id,
                                          {
                                            kind: 'image',
                                            imageUrl: url,
                                            label:
                                              asset?.name || selectedDecor.label,
                                          }
                                        );
                                      })
                                    }
                                    className="w-full py-1.5 px-2.5 rounded-md border border-zinc-200 bg-zinc-50 hover:border-[#0D9488] hover:bg-[#F0FDFA] text-[11px] font-semibold text-zinc-700 transition-colors"
                                  >
                                    Выбрать другой из медиатеки…
                                  </button>
                                </div>
                              )}

                              {/* Explicit Delete Button */}
                              <div className="pt-2 border-t border-zinc-100">
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleDeleteDecor(
                                      activeTarget.page,
                                      selectedDecor.id
                                    )
                                  }
                                  className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-md border border-red-200 bg-red-50/70 hover:bg-red-100 text-[11px] font-semibold text-red-600 transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Удалить элемент</span>
                                </button>
                              </div>
                            </div>
                          ) : selectedBlockId &&
                            selectedBlockTransform &&
                            activeTarget ? (
                            <div className="bg-white border border-[#0D9488]/40 rounded-lg p-3 space-y-3 shadow-[0_1px_2px_rgba(24,24,27,0.03)]">
                              <div className="flex items-center justify-between gap-2 pb-2 border-b border-zinc-100">
                                <div className="min-w-0">
                                  <div className="text-[10px] font-semibold uppercase tracking-wider text-[#0D9488]">
                                    Выбран блок · Стр. {activeTarget.page}
                                  </div>
                                  <div className="text-xs font-bold text-zinc-900 truncate">
                                    {getBlockLabel(activeTarget)}
                                  </div>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleUpdatePageTransform(
                                        activeTarget.page,
                                        selectedBlockId,
                                        {
                                          ...selectedBlockTransform,
                                          locked: !selectedBlockTransform.locked,
                                        }
                                      )
                                    }
                                    className={`p-1.5 rounded-md border ${
                                      selectedBlockTransform.locked
                                        ? 'border-amber-300 bg-amber-50 text-amber-700'
                                        : 'border-zinc-200 text-zinc-500 hover:text-zinc-900'
                                    }`}
                                    title={
                                      selectedBlockTransform.locked
                                        ? 'Разблокировать блок'
                                        : 'Закрепить блок'
                                    }
                                  >
                                    {selectedBlockTransform.locked ? (
                                      <Lock className="w-3.5 h-3.5" />
                                    ) : (
                                      <Unlock className="w-3.5 h-3.5" />
                                    )}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleUpdatePageTransform(
                                        activeTarget.page,
                                        selectedBlockId,
                                        {
                                          x: 0,
                                          y: 0,
                                          scale: 1,
                                          rotation: 0,
                                          zIndex:
                                            getDefaultZForBlock(selectedBlockId),
                                          locked: false,
                                        }
                                      )
                                    }
                                    className="p-1.5 rounded-md border border-zinc-200 text-zinc-500 hover:text-zinc-900"
                                    title="Сбросить позицию и слой"
                                  >
                                    <RotateCcw className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>

                              {/* X / Y / Width / Height / Scale / Rotation */}
                              {(() => {
                                const coverDefaults =
                                  selectedBlockId === 'coverTitle' ||
                                  selectedBlockId === 'coverSubtitle' ||
                                  selectedBlockId === 'coverInfo' ||
                                  selectedBlockId === 'coverBubble'
                                    ? COVER_OBJECT_DEFAULTS[selectedBlockId]
                                    : null;
                                const displayX = coverDefaults
                                  ? coverDefaults.x + selectedBlockTransform.x
                                  : selectedBlockTransform.x;
                                const displayY = coverDefaults
                                  ? coverDefaults.y + selectedBlockTransform.y
                                  : selectedBlockTransform.y;

                                return (
                                  <div className="grid grid-cols-2 gap-2">
                                    <label className="block">
                                      <span className="text-[10px] text-zinc-500">
                                        {coverDefaults ? 'X (px)' : 'Смещение X (px)'}
                                      </span>
                                      <input
                                        type="number"
                                        value={displayX}
                                        onChange={(e) => {
                                          const rawVal = Number(e.target.value) || 0;
                                          handleUpdatePageTransform(
                                            activeTarget.page,
                                            selectedBlockId,
                                            {
                                              ...selectedBlockTransform,
                                              x: coverDefaults
                                                ? rawVal - coverDefaults.x
                                                : rawVal,
                                            }
                                          );
                                        }}
                                        className={flatInputClass}
                                      />
                                    </label>
                                    <label className="block">
                                      <span className="text-[10px] text-zinc-500">
                                        {coverDefaults ? 'Y (px)' : 'Смещение Y (px)'}
                                      </span>
                                      <input
                                        type="number"
                                        value={displayY}
                                        onChange={(e) => {
                                          const rawVal = Number(e.target.value) || 0;
                                          handleUpdatePageTransform(
                                            activeTarget.page,
                                            selectedBlockId,
                                            {
                                              ...selectedBlockTransform,
                                              y: coverDefaults
                                                ? rawVal - coverDefaults.y
                                                : rawVal,
                                            }
                                          );
                                        }}
                                        className={flatInputClass}
                                      />
                                    </label>

                                    {coverDefaults && (
                                      <>
                                        <label className="block">
                                          <span className="text-[10px] text-zinc-500">
                                            Ширина (px)
                                          </span>
                                          <input
                                            type="number"
                                            min={60}
                                            max={760}
                                            value={
                                              selectedBlockTransform.width ??
                                              coverDefaults.width
                                            }
                                            onChange={(e) =>
                                              handleUpdatePageTransform(
                                                activeTarget.page,
                                                selectedBlockId,
                                                {
                                                  ...selectedBlockTransform,
                                                  width: Math.max(
                                                    60,
                                                    Math.min(
                                                      760,
                                                      Number(e.target.value) ||
                                                        coverDefaults.width
                                                    )
                                                  ),
                                                }
                                              )
                                            }
                                            className={flatInputClass}
                                          />
                                        </label>
                                        <label className="block">
                                          <span className="text-[10px] text-zinc-500">
                                            Высота (px)
                                          </span>
                                          <input
                                            type="number"
                                            min={24}
                                            max={400}
                                            value={
                                              selectedBlockTransform.height ??
                                              coverDefaults.height
                                            }
                                            onChange={(e) =>
                                              handleUpdatePageTransform(
                                                activeTarget.page,
                                                selectedBlockId,
                                                {
                                                  ...selectedBlockTransform,
                                                  height: Math.max(
                                                    24,
                                                    Math.min(
                                                      400,
                                                      Number(e.target.value) ||
                                                        coverDefaults.height
                                                    )
                                                  ),
                                                }
                                              )
                                            }
                                            className={flatInputClass}
                                          />
                                        </label>
                                      </>
                                    )}

                                    <label className="block">
                                      <span className="text-[10px] text-zinc-500">
                                        Масштаб ({selectedBlockTransform.scale.toFixed(2)}x)
                                      </span>
                                      <input
                                        type="range"
                                        min={0.5}
                                        max={1.8}
                                        step={0.05}
                                        value={selectedBlockTransform.scale}
                                        onChange={(e) =>
                                          handleUpdatePageTransform(
                                            activeTarget.page,
                                            selectedBlockId,
                                            {
                                              ...selectedBlockTransform,
                                              scale: Number(e.target.value),
                                            }
                                          )
                                        }
                                        className="w-full accent-[#0D9488] mt-1.5"
                                      />
                                    </label>
                                    <label className="block">
                                      <span className="text-[10px] text-zinc-500">
                                        Поворот (°)
                                      </span>
                                      <input
                                        type="number"
                                        min={-180}
                                        max={180}
                                        value={selectedBlockTransform.rotation}
                                        onChange={(e) =>
                                          handleUpdatePageTransform(
                                            activeTarget.page,
                                            selectedBlockId,
                                            {
                                              ...selectedBlockTransform,
                                              rotation: Number(e.target.value) || 0,
                                            }
                                          )
                                        }
                                        className={flatInputClass}
                                      />
                                    </label>
                                  </div>
                                );
                              })()}

                              {/* Cover Title Settings in Design Mode */}
                              {selectedBlockId === 'coverTitle' && (
                                <div className="pt-2.5 border-t border-zinc-100 space-y-2.5">
                                  <div className="text-[11px] font-bold text-zinc-800">
                                    Текст и стиль заголовка
                                  </div>
                                  <label className="block">
                                    <span className="text-[10px] text-zinc-500">
                                      Текст заголовка
                                    </span>
                                    <input
                                      type="text"
                                      value={activeDoc.page1.coverTitle}
                                      onChange={(e) =>
                                        onChangeJournal({
                                          ...activeDoc,
                                          page1: {
                                            ...activeDoc.page1,
                                            coverTitle: e.target.value,
                                          },
                                        })
                                      }
                                      className={flatInputClass}
                                    />
                                  </label>
                                  <div className="grid grid-cols-2 gap-2">
                                    <label className="block">
                                      <span className="text-[10px] text-zinc-500">
                                        Размер шрифта (px)
                                      </span>
                                      <input
                                        type="number"
                                        min={22}
                                        max={92}
                                        value={
                                          activeDoc.page1.coverTitleSize ??
                                          (activeDoc.resident.ageCategory === '14-15'
                                            ? 50
                                            : 58)
                                        }
                                        onChange={(e) =>
                                          onChangeJournal({
                                            ...activeDoc,
                                            page1: {
                                              ...activeDoc.page1,
                                              coverTitleSize: Math.max(
                                                22,
                                                Math.min(
                                                  92,
                                                  Number(e.target.value) || 58
                                                )
                                              ),
                                            },
                                          })
                                        }
                                        className={flatInputClass}
                                      />
                                    </label>
                                    <label className="block">
                                      <span className="text-[10px] text-zinc-500">
                                        Цвет текста
                                      </span>
                                      <div className="flex items-center gap-1.5 mt-1">
                                        <input
                                          type="color"
                                          value={
                                            activeDoc.page1.coverTitleColor ||
                                            '#FFFFFF'
                                          }
                                          onChange={(e) =>
                                            onChangeJournal({
                                              ...activeDoc,
                                              page1: {
                                                ...activeDoc.page1,
                                                coverTitleColor: e.target.value,
                                              },
                                            })
                                          }
                                          className="w-6 h-6 rounded border border-zinc-200 cursor-pointer bg-white p-0.5 shrink-0"
                                        />
                                        <input
                                          type="text"
                                          value={
                                            activeDoc.page1.coverTitleColor ||
                                            '#FFFFFF'
                                          }
                                          onChange={(e) =>
                                            onChangeJournal({
                                              ...activeDoc,
                                              page1: {
                                                ...activeDoc.page1,
                                                coverTitleColor: e.target.value,
                                              },
                                            })
                                          }
                                          className={flatInputClass}
                                        />
                                      </div>
                                    </label>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    {['#FFFFFF', '#FFE14D', '#111827', '#0D9488', '#F43F5E'].map(
                                      (swatch) => (
                                        <button
                                          key={swatch}
                                          type="button"
                                          onClick={() =>
                                            onChangeJournal({
                                              ...activeDoc,
                                              page1: {
                                                ...activeDoc.page1,
                                                coverTitleColor: swatch,
                                              },
                                            })
                                          }
                                          style={{ backgroundColor: swatch }}
                                          className={`w-5 h-5 rounded-full border ${
                                            (activeDoc.page1.coverTitleColor ||
                                              '#FFFFFF') === swatch
                                              ? 'border-[#2563EB] ring-2 ring-[#2563EB]/30'
                                              : 'border-zinc-300'
                                          }`}
                                          title={swatch}
                                        />
                                      )
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Cover Subtitle Settings in Design Mode */}
                              {selectedBlockId === 'coverSubtitle' && (
                                <div className="pt-2.5 border-t border-zinc-100 space-y-2.5">
                                  <div className="text-[11px] font-bold text-zinc-800">
                                    Текст и стиль подзаголовка
                                  </div>
                                  <label className="block">
                                    <span className="text-[10px] text-zinc-500">
                                      Текст подзаголовка
                                    </span>
                                    <input
                                      type="text"
                                      value={activeDoc.page1.coverSubtitle}
                                      onChange={(e) =>
                                        onChangeJournal({
                                          ...activeDoc,
                                          page1: {
                                            ...activeDoc.page1,
                                            coverSubtitle: e.target.value,
                                          },
                                        })
                                      }
                                      className={flatInputClass}
                                    />
                                  </label>
                                  <div className="grid grid-cols-2 gap-2">
                                    <label className="block">
                                      <span className="text-[10px] text-zinc-500">
                                        Размер шрифта (px)
                                      </span>
                                      <input
                                        type="number"
                                        min={14}
                                        max={54}
                                        value={
                                          activeDoc.page1.coverSubtitleSize ?? 26
                                        }
                                        onChange={(e) =>
                                          onChangeJournal({
                                            ...activeDoc,
                                            page1: {
                                              ...activeDoc.page1,
                                              coverSubtitleSize: Math.max(
                                                14,
                                                Math.min(
                                                  54,
                                                  Number(e.target.value) || 26
                                                )
                                              ),
                                            },
                                          })
                                        }
                                        className={flatInputClass}
                                      />
                                    </label>
                                    <label className="block">
                                      <span className="text-[10px] text-zinc-500">
                                        Цвет текста
                                      </span>
                                      <div className="flex items-center gap-1.5 mt-1">
                                        <input
                                          type="color"
                                          value={
                                            activeDoc.page1.coverSubtitleColor ||
                                            '#111827'
                                          }
                                          onChange={(e) =>
                                            onChangeJournal({
                                              ...activeDoc,
                                              page1: {
                                                ...activeDoc.page1,
                                                coverSubtitleColor: e.target.value,
                                              },
                                            })
                                          }
                                          className="w-6 h-6 rounded border border-zinc-200 cursor-pointer bg-white p-0.5 shrink-0"
                                        />
                                        <input
                                          type="text"
                                          value={
                                            activeDoc.page1.coverSubtitleColor ||
                                            '#111827'
                                          }
                                          onChange={(e) =>
                                            onChangeJournal({
                                              ...activeDoc,
                                              page1: {
                                                ...activeDoc.page1,
                                                coverSubtitleColor: e.target.value,
                                              },
                                            })
                                          }
                                          className={flatInputClass}
                                        />
                                      </div>
                                    </label>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    {['#111827', '#FFFFFF', '#0F766E', '#1E293B', '#FFE14D'].map(
                                      (swatch) => (
                                        <button
                                          key={swatch}
                                          type="button"
                                          onClick={() =>
                                            onChangeJournal({
                                              ...activeDoc,
                                              page1: {
                                                ...activeDoc.page1,
                                                coverSubtitleColor: swatch,
                                              },
                                            })
                                          }
                                          style={{ backgroundColor: swatch }}
                                          className={`w-5 h-5 rounded-full border ${
                                            (activeDoc.page1.coverSubtitleColor ||
                                              '#111827') === swatch
                                              ? 'border-[#2563EB] ring-2 ring-[#2563EB]/30'
                                              : 'border-zinc-300'
                                          }`}
                                          title={swatch}
                                        />
                                      )
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Cover Student Info Plaque Settings in Design Mode */}
                              {selectedBlockId === 'coverInfo' && (
                                <div className="pt-2.5 border-t border-zinc-100 space-y-2.5">
                                  <div className="text-[11px] font-bold text-zinc-800">
                                    Данные ученика на плашке
                                  </div>
                                  <label className="block">
                                    <span className="text-[10px] text-zinc-500">
                                      Имя и фамилия
                                    </span>
                                    <input
                                      type="text"
                                      value={activeDoc.resident.fullName}
                                      onChange={(e) => {
                                        const fullName = e.target.value;
                                        onChangeJournal({
                                          ...activeDoc,
                                          resident: {
                                            ...activeDoc.resident,
                                            fullName,
                                          },
                                        });
                                        onUpdateStudent({
                                          ...selectedStudent,
                                          fullName,
                                          updatedAt: new Date().toISOString(),
                                        });
                                      }}
                                      className={flatInputClass}
                                    />
                                  </label>
                                  <div className="grid grid-cols-2 gap-2">
                                    <label className="block">
                                      <span className="text-[10px] text-zinc-500">
                                        Возраст
                                      </span>
                                      <input
                                        type="text"
                                        value={activeDoc.resident.age}
                                        onChange={(e) => {
                                          const age = e.target.value;
                                          onChangeJournal({
                                            ...activeDoc,
                                            resident: {
                                              ...activeDoc.resident,
                                              age,
                                            },
                                          });
                                          onUpdateStudent({
                                            ...selectedStudent,
                                            age,
                                            updatedAt: new Date().toISOString(),
                                          });
                                        }}
                                        className={flatInputClass}
                                      />
                                    </label>
                                    <label className="block">
                                      <span className="text-[10px] text-zinc-500">
                                        Период
                                      </span>
                                      <input
                                        type="text"
                                        value={activeDoc.resident.period}
                                        onChange={(e) =>
                                          onChangeJournal({
                                            ...activeDoc,
                                            resident: {
                                              ...activeDoc.resident,
                                              period: e.target.value,
                                            },
                                          })
                                        }
                                        className={flatInputClass}
                                      />
                                    </label>
                                  </div>
                                  <label className="block">
                                    <span className="text-[10px] text-zinc-500">
                                      Наставник
                                    </span>
                                    <input
                                      type="text"
                                      value={activeDoc.resident.mentorName}
                                      onChange={(e) => {
                                        const mentorName = e.target.value;
                                        onChangeJournal({
                                          ...activeDoc,
                                          resident: {
                                            ...activeDoc.resident,
                                            mentorName,
                                          },
                                        });
                                        onUpdateStudent({
                                          ...selectedStudent,
                                          mentorName,
                                          updatedAt: new Date().toISOString(),
                                        });
                                      }}
                                      className={flatInputClass}
                                    />
                                  </label>
                                </div>
                              )}

                              {(selectedBlockId === 'cover' ||
                                selectedBlockId === 'coverBear' ||
                                selectedBlockId === 'coverBubble') && (
                                <div className="pt-2.5 border-t border-zinc-100 space-y-2.5">
                                  <div className="text-[11px] font-bold text-zinc-800">
                                    Облачко мишки на обложке (Стр. 1)
                                  </div>
                                  <div className="flex flex-wrap gap-1.5">
                                    {SPEECH_BUBBLE_PRESETS.map((preset) => {
                                      const curVal =
                                        activeDoc.page1.coverSpeechBubbleText !==
                                        undefined
                                          ? activeDoc.page1
                                              .coverSpeechBubbleText
                                          : DEFAULT_SPEECH_BUBBLE_TEXT;
                                      const isMatched = curVal.trim() === preset;
                                      return (
                                        <button
                                          key={preset}
                                          type="button"
                                          onClick={() =>
                                            onChangeJournal({
                                              ...activeDoc,
                                              page1: {
                                                ...activeDoc.page1,
                                                coverSpeechBubbleText: preset,
                                              },
                                            })
                                          }
                                          className={`px-2 py-1 rounded-md border text-[10px] font-medium transition-colors text-left ${
                                            isMatched
                                              ? 'border-[#0D9488] bg-[#0D9488] text-white'
                                              : 'border-zinc-200 bg-white text-zinc-700 hover:border-[#0D9488] hover:text-[#0F766E]'
                                          }`}
                                        >
                                          {preset}
                                        </button>
                                      );
                                    })}
                                  </div>
                                  <textarea
                                    rows={2}
                                    value={
                                      activeDoc.page1.coverSpeechBubbleText !==
                                      undefined
                                        ? activeDoc.page1.coverSpeechBubbleText
                                        : DEFAULT_SPEECH_BUBBLE_TEXT
                                    }
                                    onChange={(e) =>
                                      onChangeJournal({
                                        ...activeDoc,
                                        page1: {
                                          ...activeDoc.page1,
                                          coverSpeechBubbleText: e.target.value,
                                        },
                                      })
                                    }
                                    placeholder="Свой текст для облачка (без имени)…"
                                    className="w-full rounded-md border border-zinc-200 bg-zinc-50/70 px-2.5 py-1.5 text-[11px] text-zinc-800 focus:outline-none focus:bg-white focus:border-[#0D9488] resize-none"
                                  />
                                  <div className="grid grid-cols-3 gap-2 pt-0.5">
                                    <label className="block">
                                      <span className="text-[10px] text-zinc-500">
                                        Шрифт (px)
                                      </span>
                                      <input
                                        type="number"
                                        min={11}
                                        max={30}
                                        step={0.5}
                                        value={
                                          activeDoc.page1.coverBubbleFontSize ??
                                          16.5
                                        }
                                        onChange={(e) =>
                                          onChangeJournal({
                                            ...activeDoc,
                                            page1: {
                                              ...activeDoc.page1,
                                              coverBubbleFontSize: Math.max(
                                                11,
                                                Math.min(
                                                  30,
                                                  Number(e.target.value) || 16.5
                                                )
                                              ),
                                            },
                                          })
                                        }
                                        className={flatInputClass}
                                      />
                                    </label>
                                    <label className="block">
                                      <span className="text-[10px] text-zinc-500">
                                        Цвет текста
                                      </span>
                                      <input
                                        type="color"
                                        value={
                                          activeDoc.page1
                                            .coverBubbleTextColor || '#111827'
                                        }
                                        onChange={(e) =>
                                          onChangeJournal({
                                            ...activeDoc,
                                            page1: {
                                              ...activeDoc.page1,
                                              coverBubbleTextColor:
                                                e.target.value,
                                            },
                                          })
                                        }
                                        className="mt-1 w-full h-7 rounded border border-zinc-200 cursor-pointer bg-white p-0.5"
                                      />
                                    </label>
                                    <label className="block">
                                      <span className="text-[10px] text-zinc-500">
                                        Фон облачка
                                      </span>
                                      <input
                                        type="color"
                                        value={
                                          activeDoc.page1.coverBubbleBgColor ||
                                          '#FFFFFF'
                                        }
                                        onChange={(e) =>
                                          onChangeJournal({
                                            ...activeDoc,
                                            page1: {
                                              ...activeDoc.page1,
                                              coverBubbleBgColor:
                                                e.target.value,
                                            },
                                          })
                                        }
                                        className="mt-1 w-full h-7 rounded border border-zinc-200 cursor-pointer bg-white p-0.5"
                                      />
                                    </label>
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="bg-white border border-dashed border-zinc-300 rounded-lg p-3 text-[11px] text-zinc-500 text-center">
                              Нажмите на любой объект на листе А4, чтобы перемещать, масштабировать, поворачивать или менять его порядок наложения.
                            </div>
                          )}

                          {/* Page Grid & Group Palette Shortcut */}
                          <div className="bg-white border border-zinc-200 rounded-lg p-3 space-y-2.5 shadow-[0_1px_2px_rgba(24,24,27,0.03)]">
                            <label className="flex items-center justify-between gap-2 cursor-pointer">
                              <span className="text-[11px] font-semibold text-zinc-700">
                                Сетка выравнивания на А4
                              </span>
                              <input
                                type="checkbox"
                                checked={Boolean(pageCfg.background?.showGrid)}
                                onChange={(e) => {
                                  const nextShow = e.target.checked;
                                  if (effectiveDesignPage === 1) {
                                    onChangeJournal({
                                      ...activeDoc,
                                      page1: {
                                        ...activeDoc.page1,
                                        background: {
                                          color:
                                            activeDoc.page1.background?.color ||
                                            '#FFFFFF',
                                          gridStyle:
                                            activeDoc.page1.background
                                              ?.gridStyle || 'dots',
                                          showGrid: nextShow,
                                        },
                                      },
                                    });
                                  } else {
                                    onChangeJournal({
                                      ...activeDoc,
                                      page2: {
                                        ...activeDoc.page2,
                                        background: {
                                          color:
                                            activeDoc.page2.background?.color ||
                                            '#FFFFFF',
                                          gridStyle:
                                            activeDoc.page2.background
                                              ?.gridStyle || 'dots',
                                          showGrid: nextShow,
                                        },
                                      },
                                    });
                                  }
                                }}
                                className="rounded border-zinc-300 text-[#0D9488]"
                              />
                            </label>
                            <div className="pt-2 border-t border-zinc-100 flex items-center justify-between gap-2">
                              <div className="flex items-center gap-1.5">
                                <Palette className="w-3.5 h-3.5 text-[#0D9488]" />
                                <span className="text-[11px] font-medium text-zinc-700 truncate">
                                  {currentPalette.name}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditorTab('common');
                                  setCommonStep(1);
                                }}
                                className="text-[11px] font-semibold text-[#0D9488] hover:underline shrink-0"
                              >
                                Палитра →
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })()
                  ) : (
                    (() => {
                      const inspectorSteps: Array<{
                        id: IndividualSection;
                        num: number;
                        shortLabel: string;
                        title: string;
                        page: 1 | 2;
                        Icon: React.ComponentType<{ className?: string }>;
                      }> = [
                        {
                          id: 'profile',
                          num: 1,
                          shortLabel: 'Профиль',
                          title: '1. Профиль ученика',
                          page: 1,
                          Icon: User,
                        },
                        {
                          id: 'curriculum',
                          num: 2,
                          shortLabel: 'Модули',
                          title: '2. Модули и навыки',
                          page: 1,
                          Icon: Lightbulb,
                        },
                        {
                          id: 'projects',
                          num: 3,
                          shortLabel: 'Проекты',
                          title: '3. Проекты',
                          page: 1,
                          Icon: ImageIcon,
                        },
                        {
                          id: 'pride',
                          num: 4,
                          shortLabel: 'Успехи',
                          title: '4. Достижения',
                          page: 2,
                          Icon: Trophy,
                        },
                        {
                          id: 'mentorNote',
                          num: 5,
                          shortLabel: 'Письмо',
                          title: '5. Слово наставника',
                          page: 2,
                          Icon: PenLine,
                        },
                      ];
                      const activeStepIdx = inspectorSteps.findIndex(
                        (s) => s.id === activeInspectorStep
                      );
                      const activeStepMeta =
                        inspectorSteps[
                          activeStepIdx >= 0 ? activeStepIdx : 0
                        ];

                      return (
                        <>
                          {/* 5-STEP HORIZONTAL ICON TAB STEPPER */}
                          <nav
                            aria-label="Разделы журнала ученика"
                            className="shrink-0 grid grid-cols-5 border-b border-zinc-200 bg-white"
                          >
                            {inspectorSteps.map((step) => {
                              const isActive =
                                activeInspectorStep === step.id;
                              const isDone = blockDoneMap[step.id];
                              const StepIcon = step.Icon;
                              return (
                                <button
                                  key={step.id}
                                  type="button"
                                  onClick={() =>
                                    focusSection(step.id, step.page)
                                  }
                                  title={`${step.title}${
                                    isDone ? ' — Готово' : ''
                                  }`}
                                  className={`relative py-2 px-1 flex flex-col items-center justify-center gap-1 border-b-2 transition-colors ${
                                    isActive
                                      ? 'border-[#0D9488] text-[#0F766E] bg-[#F0FDFA]/50'
                                      : 'border-transparent text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50/70'
                                  }`}
                                >
                                  <div className="relative">
                                    <StepIcon className="w-4 h-4" />
                                    {isDone && (
                                      <span
                                        aria-label="Готово"
                                        className="absolute -top-1 -right-2 w-3 h-3 rounded-full bg-emerald-500 text-white flex items-center justify-center"
                                      >
                                        <Check className="w-2 h-2 stroke-[3]" />
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[10px] font-semibold leading-none truncate max-w-full">
                                    {step.num}. {step.shortLabel}
                                  </span>
                                </button>
                              );
                            })}
                          </nav>

                          {/* Active Step Title & Quick Stepper Controls */}
                          <div className="shrink-0 px-4 py-2 border-b border-zinc-100 flex items-center justify-between gap-2 bg-white">
                            <div className="min-w-0 flex items-center gap-2">
                              <span className="text-xs font-bold text-zinc-900 truncate">
                                {activeStepMeta.title}
                              </span>
                              <span
                                className={`text-[10px] font-semibold shrink-0 ${
                                  blockDoneMap[activeStepMeta.id]
                                    ? 'text-emerald-600'
                                    : 'text-zinc-400'
                                }`}
                              >
                                {blockDoneMap[activeStepMeta.id]
                                  ? '· Готово'
                                  : '· Пусто'}
                              </span>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              {activeInspectorStep === 'projects' && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const nextProj: ProjectItem = {
                                      id: `proj-${Date.now()}`,
                                      title: 'Новый проект',
                                      caption: 'Подпись проекта',
                                      description:
                                        'Что было реализовано на занятии.',
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
                                    focusSection('projects', 1);
                                  }}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#0D9488] hover:bg-[#0F766E] text-white text-[10px] font-semibold mr-1"
                                  title="Добавить проект"
                                >
                                  <Plus className="w-3 h-3" />
                                  <span>Проект</span>
                                </button>
                              )}
                              <button
                                type="button"
                                disabled={activeStepIdx <= 0}
                                onClick={() => {
                                  const prevStep =
                                    inspectorSteps[activeStepIdx - 1];
                                  if (prevStep)
                                    focusSection(prevStep.id, prevStep.page);
                                }}
                                className="p-1 rounded text-zinc-400 hover:text-zinc-900 disabled:opacity-30"
                                title="Предыдущий шаг"
                              >
                                <ChevronLeft className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                disabled={
                                  activeStepIdx >= inspectorSteps.length - 1
                                }
                                onClick={() => {
                                  const nextStep =
                                    inspectorSteps[activeStepIdx + 1];
                                  if (nextStep)
                                    focusSection(nextStep.id, nextStep.page);
                                }}
                                className="p-1 rounded text-zinc-400 hover:text-zinc-900 disabled:opacity-30"
                                title="Следующий шаг"
                              >
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* SINGLE ACTIVE STEP CONTENT (STRUCTURED SEMANTIC CARDS) */}
                          <div className="flex-1 min-h-0 overflow-y-auto bg-[#F8F8F6] px-3.5 py-3.5 text-xs">
                            {/* STEP 1: ПРОФИЛЬ */}
                            {activeInspectorStep === 'profile' && (
                              <div className="bg-white border border-zinc-200 rounded-lg p-3.5 shadow-[0_1px_2px_rgba(24,24,27,0.03)] space-y-3.5">
                                <div className="pb-2 border-b border-zinc-100">
                                  <span className="text-[11px] font-bold text-zinc-800">
                                    Основные данные ученика
                                  </span>
                                </div>

                                <label className="block">
                                  <span className="text-[11px] font-medium text-zinc-500 mb-1 block">
                                    Имя и фамилия
                                  </span>
                                  <input
                                    type="text"
                                    value={activeDoc.resident.fullName}
                                    onChange={(e) => {
                                      const fullName = e.target.value;
                                      onChangeJournal({
                                        ...activeDoc,
                                        resident: {
                                          ...activeDoc.resident,
                                          fullName,
                                        },
                                      });
                                      onUpdateStudent({
                                        ...selectedStudent,
                                        fullName,
                                        updatedAt: new Date().toISOString(),
                                      });
                                    }}
                                    className="w-full px-3 py-2 rounded-md border border-zinc-200 bg-white text-sm font-semibold text-zinc-900 focus:outline-none focus:border-[#0D9488] focus:ring-2 focus:ring-[#0D9488]/15 transition-colors"
                                  />
                                </label>

                                <div className="grid grid-cols-2 gap-3">
                                  <label className="block">
                                    <span className="text-[11px] font-medium text-zinc-500 mb-1 block">
                                      Период
                                    </span>
                                    <input
                                      type="text"
                                      value={activeDoc.resident.period}
                                      onChange={(e) =>
                                        onChangeJournal({
                                          ...activeDoc,
                                          resident: {
                                            ...activeDoc.resident,
                                            period: e.target.value,
                                          },
                                        })
                                      }
                                      placeholder="с 01.09.2026 по 25.12.2026"
                                      className="w-full px-3 py-2 rounded-md border border-zinc-200 bg-white text-xs font-medium text-zinc-900 focus:outline-none focus:border-[#0D9488] focus:ring-2 focus:ring-[#0D9488]/15 transition-colors"
                                    />
                                  </label>
                                  <label className="block">
                                    <span className="text-[11px] font-medium text-zinc-500 mb-1 block">
                                      Наставник
                                    </span>
                                    <input
                                      type="text"
                                      value={activeDoc.resident.mentorName}
                                      onChange={(e) => {
                                        const mentorName = e.target.value;
                                        onChangeJournal({
                                          ...activeDoc,
                                          resident: {
                                            ...activeDoc.resident,
                                            mentorName,
                                          },
                                        });
                                        onUpdateStudent({
                                          ...selectedStudent,
                                          mentorName,
                                          updatedAt: new Date().toISOString(),
                                        });
                                      }}
                                      className="w-full px-3 py-2 rounded-md border border-zinc-200 bg-white text-xs font-medium text-zinc-900 focus:outline-none focus:border-[#0D9488] focus:ring-2 focus:ring-[#0D9488]/15 transition-colors"
                                    />
                                  </label>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                  <label className="block">
                                    <span className="text-[11px] font-medium text-zinc-500 mb-1 block">
                                      Возраст
                                    </span>
                                    <input
                                      type="text"
                                      value={activeDoc.resident.age}
                                      onChange={(e) => {
                                        const age = e.target.value;
                                        onChangeJournal({
                                          ...activeDoc,
                                          resident: {
                                            ...activeDoc.resident,
                                            age,
                                          },
                                        });
                                        onUpdateStudent({
                                          ...selectedStudent,
                                          age,
                                          updatedAt: new Date().toISOString(),
                                        });
                                      }}
                                      className="w-full px-3 py-2 rounded-md border border-zinc-200 bg-white text-xs font-medium text-zinc-900 focus:outline-none focus:border-[#0D9488] focus:ring-2 focus:ring-[#0D9488]/15 transition-colors"
                                    />
                                  </label>
                                  <label className="block">
                                    <span className="text-[11px] font-medium text-zinc-500 mb-1 block">
                                      Статус
                                    </span>
                                    <div className="relative flex items-center">
                                      <span
                                        className={`w-2.5 h-2.5 rounded-full absolute left-2.5 pointer-events-none ${
                                          getStudentStatusMeta(
                                            selectedStudent.status
                                          ).dotClass
                                        }`}
                                      />
                                      <select
                                        value={normalizeStudentStatus(
                                          selectedStudent.status
                                        )}
                                        onChange={(e) => {
                                          const nextStatus = e.target
                                            .value as StudentStatus;
                                          onUpdateStudent({
                                            ...selectedStudent,
                                            status: nextStatus,
                                            archived: nextStatus !== 'active',
                                            updatedAt: new Date().toISOString(),
                                          });
                                        }}
                                        className="w-full pl-7 pr-2.5 py-2 rounded-md border border-zinc-200 bg-white text-xs font-medium text-zinc-900 focus:outline-none focus:border-[#0D9488] focus:ring-2 focus:ring-[#0D9488]/15 transition-colors cursor-pointer"
                                      >
                                        <option value="active">Активен</option>
                                        <option value="paused">На паузе</option>
                                        <option value="completed">
                                          Завершил курс
                                        </option>
                                      </select>
                                    </div>
                                  </label>
                                </div>

                                {/* Contextual Cover Object Geometry & Typography Card in Content Mode */}
                                {activeTarget?.page === 1 &&
                                  (activeTarget.block === 'coverTitle' ||
                                    activeTarget.block === 'coverSubtitle' ||
                                    activeTarget.block === 'coverInfo' ||
                                    activeTarget.block === 'coverBubble') && (() => {
                                    const blockId = activeTarget.block;
                                    const defaults = COVER_OBJECT_DEFAULTS[blockId];
                                    const curT: CanvasObjectTransform =
                                      (activeDoc.page1.objectLayouts ?? {})[
                                        blockId
                                      ] ?? {
                                        x: 0,
                                        y: 0,
                                        scale: 1,
                                        rotation: 0,
                                        zIndex: defaults.zIndex,
                                      };
                                    return (
                                      <div className="pt-3 border-t border-zinc-100 space-y-2">
                                        <div className="flex items-center justify-between gap-2">
                                          <span className="text-[11px] font-bold text-zinc-800">
                                            Позиция и размер: {getBlockLabel(activeTarget)}
                                          </span>
                                          <button
                                            type="button"
                                            onClick={() =>
                                              setInspectorMode('design')
                                            }
                                            className="text-[10px] font-semibold text-[#0D9488] hover:underline"
                                          >
                                            В режим «Дизайн» →
                                          </button>
                                        </div>
                                        <div className="grid grid-cols-3 gap-2">
                                          <label className="block">
                                            <span className="text-[10px] text-zinc-500">
                                              X (px)
                                            </span>
                                            <input
                                              type="number"
                                              value={defaults.x + curT.x}
                                              onChange={(e) =>
                                                handleUpdatePageTransform(
                                                  1,
                                                  blockId,
                                                  {
                                                    ...curT,
                                                    x:
                                                      (Number(e.target.value) ||
                                                        0) - defaults.x,
                                                  }
                                                )
                                              }
                                              className={flatInputClass}
                                            />
                                          </label>
                                          <label className="block">
                                            <span className="text-[10px] text-zinc-500">
                                              Y (px)
                                            </span>
                                            <input
                                              type="number"
                                              value={defaults.y + curT.y}
                                              onChange={(e) =>
                                                handleUpdatePageTransform(
                                                  1,
                                                  blockId,
                                                  {
                                                    ...curT,
                                                    y:
                                                      (Number(e.target.value) ||
                                                        0) - defaults.y,
                                                  }
                                                )
                                              }
                                              className={flatInputClass}
                                            />
                                          </label>
                                          <label className="block">
                                            <span className="text-[10px] text-zinc-500">
                                              Поворот (°)
                                            </span>
                                            <input
                                              type="number"
                                              min={-180}
                                              max={180}
                                              value={curT.rotation}
                                              onChange={(e) =>
                                                handleUpdatePageTransform(
                                                  1,
                                                  blockId,
                                                  {
                                                    ...curT,
                                                    rotation:
                                                      Number(e.target.value) || 0,
                                                  }
                                                )
                                              }
                                              className={flatInputClass}
                                            />
                                          </label>
                                          <label className="block">
                                            <span className="text-[10px] text-zinc-500">
                                              Ширина (px)
                                            </span>
                                            <input
                                              type="number"
                                              min={60}
                                              max={760}
                                              value={curT.width ?? defaults.width}
                                              onChange={(e) =>
                                                handleUpdatePageTransform(
                                                  1,
                                                  blockId,
                                                  {
                                                    ...curT,
                                                    width: Math.max(
                                                      60,
                                                      Math.min(
                                                        760,
                                                        Number(e.target.value) ||
                                                          defaults.width
                                                      )
                                                    ),
                                                  }
                                                )
                                              }
                                              className={flatInputClass}
                                            />
                                          </label>
                                          <label className="block">
                                            <span className="text-[10px] text-zinc-500">
                                              Высота (px)
                                            </span>
                                            <input
                                              type="number"
                                              min={24}
                                              max={400}
                                              value={
                                                curT.height ?? defaults.height
                                              }
                                              onChange={(e) =>
                                                handleUpdatePageTransform(
                                                  1,
                                                  blockId,
                                                  {
                                                    ...curT,
                                                    height: Math.max(
                                                      24,
                                                      Math.min(
                                                        400,
                                                        Number(e.target.value) ||
                                                          defaults.height
                                                      )
                                                    ),
                                                  }
                                                )
                                              }
                                              className={flatInputClass}
                                            />
                                          </label>
                                          <label className="block">
                                            <span className="text-[10px] text-zinc-500">
                                              Масштаб
                                            </span>
                                            <input
                                              type="number"
                                              min={0.5}
                                              max={1.8}
                                              step={0.05}
                                              value={curT.scale}
                                              onChange={(e) =>
                                                handleUpdatePageTransform(
                                                  1,
                                                  blockId,
                                                  {
                                                    ...curT,
                                                    scale: Math.max(
                                                      0.5,
                                                      Math.min(
                                                        1.8,
                                                        Number(e.target.value) ||
                                                          1
                                                      )
                                                    ),
                                                  }
                                                )
                                              }
                                              className={flatInputClass}
                                            />
                                          </label>
                                        </div>
                                      </div>
                                    );
                                  })()}

                                {/* Cover Titles Quick Editor in Step 1 */}
                                <div className="pt-3 border-t border-zinc-100 space-y-2.5">
                                  <span className="text-[11px] font-bold text-zinc-800 block">
                                    Заголовки обложки (Стр. 1)
                                  </span>
                                  <div className="grid grid-cols-2 gap-2.5">
                                    <label className="block">
                                      <span className="text-[10px] text-zinc-500 mb-0.5 block">
                                        Заголовок
                                      </span>
                                      <input
                                        type="text"
                                        value={activeDoc.page1.coverTitle}
                                        onChange={(e) =>
                                          onChangeJournal({
                                            ...activeDoc,
                                            page1: {
                                              ...activeDoc.page1,
                                              coverTitle: e.target.value,
                                            },
                                          })
                                        }
                                        className="w-full px-2.5 py-1.5 rounded-md border border-zinc-200 bg-white text-xs font-semibold text-zinc-900 focus:outline-none focus:border-[#0D9488]"
                                      />
                                    </label>
                                    <label className="block">
                                      <span className="text-[10px] text-zinc-500 mb-0.5 block">
                                        Подзаголовок
                                      </span>
                                      <input
                                        type="text"
                                        value={activeDoc.page1.coverSubtitle}
                                        onChange={(e) =>
                                          onChangeJournal({
                                            ...activeDoc,
                                            page1: {
                                              ...activeDoc.page1,
                                              coverSubtitle: e.target.value,
                                            },
                                          })
                                        }
                                        className="w-full px-2.5 py-1.5 rounded-md border border-zinc-200 bg-white text-xs font-medium text-zinc-900 focus:outline-none focus:border-[#0D9488]"
                                      />
                                    </label>
                                  </div>
                                </div>

                                {/* Cover Bear Speech Bubble Card (Page 1 Top) */}
                                <div className="pt-3 border-t border-zinc-100 space-y-2.5">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[11px] font-bold text-zinc-800">
                                      Облачко мишки на обложке (Стр. 1)
                                    </span>
                                    <span className="text-[10px] text-zinc-400">
                                      Вверху у мишки
                                    </span>
                                  </div>

                                  <div className="space-y-1.5">
                                    <span className="text-[10px] font-medium text-zinc-500 block">
                                      Быстрые пресеты:
                                    </span>
                                    <div className="flex flex-col gap-1.5">
                                      {SPEECH_BUBBLE_PRESETS.map((preset) => {
                                        const curVal =
                                          activeDoc.page1
                                            .coverSpeechBubbleText !== undefined
                                            ? activeDoc.page1
                                                .coverSpeechBubbleText
                                            : DEFAULT_SPEECH_BUBBLE_TEXT;
                                        const isMatched =
                                          curVal.trim() === preset;
                                        return (
                                          <button
                                            key={preset}
                                            type="button"
                                            onClick={() =>
                                              onChangeJournal({
                                                ...activeDoc,
                                                page1: {
                                                  ...activeDoc.page1,
                                                  coverSpeechBubbleText: preset,
                                                },
                                              })
                                            }
                                            className={`w-full text-left px-2.5 py-1.5 rounded-md border text-[11px] font-medium transition-colors flex items-center justify-between gap-2 ${
                                              isMatched
                                                ? 'bg-[#0D9488] text-white border-[#0D9488] shadow-[0_1px_2px_rgba(13,148,136,0.18)]'
                                                : 'bg-zinc-50/70 text-zinc-700 border-zinc-200 hover:border-[#0D9488] hover:bg-white'
                                            }`}
                                          >
                                            <span>{preset}</span>
                                            {isMatched && (
                                              <Check className="w-3.5 h-3.5 shrink-0" />
                                            )}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </div>

                                  <label className="block pt-0.5">
                                    <span className="text-[10px] font-medium text-zinc-500 mb-1 block">
                                      Или свой текст (обновляется сразу на обложке):
                                    </span>
                                    <textarea
                                      rows={2}
                                      value={
                                        activeDoc.page1
                                          .coverSpeechBubbleText !== undefined
                                          ? activeDoc.page1
                                              .coverSpeechBubbleText
                                          : DEFAULT_SPEECH_BUBBLE_TEXT
                                      }
                                      onChange={(e) =>
                                        onChangeJournal({
                                          ...activeDoc,
                                          page1: {
                                            ...activeDoc.page1,
                                            coverSpeechBubbleText:
                                              e.target.value,
                                          },
                                        })
                                      }
                                      placeholder="Например: Вау, вот это результат!"
                                      className="w-full p-2.5 rounded-lg border border-zinc-200 bg-zinc-50/60 text-xs text-zinc-800 leading-relaxed placeholder:text-zinc-400 focus:outline-none focus:bg-white focus:border-[#0D9488] focus:ring-2 focus:ring-[#0D9488]/15 resize-none transition-colors"
                                    />
                                  </label>
                                </div>
                              </div>
                            )}

                            {/* STEP 2: МОДУЛИ И НАВЫКИ */}
                            {activeInspectorStep === 'curriculum' && (
                              <div className="space-y-4">
                                {/* Modules Section Container */}
                                <div className="bg-white border border-zinc-200 rounded-lg p-3.5 shadow-[0_1px_2px_rgba(24,24,27,0.03)] space-y-3">
                                  <div className="flex items-center justify-between gap-2 pb-2 border-b border-zinc-100">
                                    <div>
                                      <span className="text-[11px] font-bold text-zinc-800 block">
                                        Модули (Мои открытия)
                                      </span>
                                      <span className="text-[10px] text-zinc-400 tabular-nums">
                                        Активно{' '}
                                        {
                                          activeDoc.page1.modules.filter(
                                            (m) => !m.hidden
                                          ).length
                                        }{' '}
                                        из {activeDoc.page1.modules.length}
                                      </span>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEditorTab('common');
                                        setCommonStep(2);
                                      }}
                                      className="text-[11px] font-semibold text-[#0D9488] hover:underline whitespace-nowrap shrink-0"
                                    >
                                      К группе →
                                    </button>
                                  </div>

                                  {activeDoc.page1.modules.length === 0 ? (
                                    <div className="py-3 text-[11px] text-zinc-500">
                                      В журнале пока нет модулей. Выберите их в{' '}
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setEditorTab('common');
                                          setCommonStep(2);
                                        }}
                                        className="font-semibold text-[#0D9488] hover:underline"
                                      >
                                        «Общих данных группы»
                                      </button>{' '}
                                      или добавьте индивидуально ниже.
                                    </div>
                                  ) : (
                                    <div className="divide-y divide-zinc-100">
                                      {activeDoc.page1.modules.map((mod) => {
                                        const visible = !mod.hidden;
                                        const linkedUrl =
                                          mod.imageMediaId && mediaAssets
                                            ? mediaAssets.find(
                                                (a) => a.id === mod.imageMediaId
                                              )?.url
                                            : undefined;
                                        const resolvedUrl =
                                          linkedUrl || mod.customImageUrl;
                                        const effectiveMode =
                                          mod.visualMode ??
                                          (resolvedUrl ? 'image' : 'illustration');
                                        const isHighlighted =
                                          highlightedStudentModId === mod.id;

                                        const updateStudentMod = (
                                          patch: Partial<ModuleItem>
                                        ) => {
                                          onChangeJournal({
                                            ...activeDoc,
                                            page1: {
                                              ...activeDoc.page1,
                                              modules: activeDoc.page1.modules.map(
                                                (m) =>
                                                  m.id === mod.id
                                                    ? { ...m, ...patch }
                                                    : m
                                              ),
                                            },
                                          });
                                        };

                                        return (
                                          <div
                                            key={mod.id}
                                            className={`group py-2.5 px-2 -mx-2 rounded-lg transition-colors ${
                                              isHighlighted
                                                ? 'bg-[#F0FDFA] ring-1 ring-[#0D9488]/40'
                                                : 'hover:bg-zinc-50'
                                            } ${visible ? '' : 'opacity-60'}`}
                                          >
                                            <div className="flex items-start justify-between gap-2">
                                              <div className="flex items-start gap-2 min-w-0 flex-1">
                                                <input
                                                  type="checkbox"
                                                  checked={visible}
                                                  onChange={() =>
                                                    handleToggleStudentModule(
                                                      mod.id
                                                    )
                                                  }
                                                  className="mt-1 rounded border-zinc-300 text-[#0D9488] shrink-0 cursor-pointer"
                                                />

                                                {/* Clickable Module Thumbnail */}
                                                <button
                                                  type="button"
                                                  onClick={() =>
                                                    setEditingModuleVisual({
                                                      scope: 'individual',
                                                      id: mod.id,
                                                    })
                                                  }
                                                  style={{
                                                    backgroundColor:
                                                      mod.cardBgColor,
                                                  }}
                                                  className="w-9 h-9 rounded-lg border border-zinc-200 overflow-hidden shrink-0 flex items-center justify-center relative group/thumb"
                                                  title="Настроить картинку или иконку модуля"
                                                >
                                                  {effectiveMode === 'image' &&
                                                  resolvedUrl ? (
                                                    <img
                                                      src={resolvedUrl}
                                                      alt={mod.title}
                                                      referrerPolicy="no-referrer"
                                                      className="w-full h-full object-cover"
                                                    />
                                                  ) : effectiveMode === 'icon' ? (
                                                    <ModuleVectorIcon
                                                      iconKey={mod.iconKey}
                                                      className="w-6 h-6"
                                                    />
                                                  ) : (
                                                    <ModuleSvgIllustration
                                                      type={mod.illustrationKey}
                                                    />
                                                  )}
                                                </button>

                                                <div className="min-w-0 flex-1">
                                                  <div
                                                    className={`text-[11px] font-semibold leading-tight truncate ${
                                                      visible
                                                        ? 'text-zinc-900'
                                                        : 'line-through text-zinc-500'
                                                    }`}
                                                  >
                                                    {mod.title}
                                                  </div>
                                                  <div className="text-[10px] text-zinc-500 flex items-center gap-1.5 mt-0.5">
                                                    <span
                                                      className={
                                                        mod.isIndividual
                                                          ? 'text-[#0F766E] font-semibold'
                                                          : 'text-zinc-400'
                                                      }
                                                    >
                                                      {mod.isIndividual
                                                        ? 'Индивидуальный'
                                                        : 'Из группы'}
                                                    </span>
                                                    {mod.subtitle && (
                                                      <>
                                                        <span aria-hidden="true">
                                                          ·
                                                        </span>
                                                        <span className="truncate">
                                                          {mod.subtitle}
                                                        </span>
                                                      </>
                                                    )}
                                                  </div>

                                                  {/* Segmented Switcher: Своя картинка / Иконка */}
                                                  <div className="mt-1.5 flex items-center gap-1.5">
                                                    <div className="inline-flex rounded-md border border-zinc-200 bg-zinc-50 p-0.5 text-[10px] font-semibold">
                                                      <button
                                                        type="button"
                                                        onClick={() => {
                                                          updateStudentMod({
                                                            visualMode: 'image',
                                                          });
                                                          setEditingModuleVisual({
                                                            scope: 'individual',
                                                            id: mod.id,
                                                          });
                                                        }}
                                                        className={`px-1.5 py-0.5 rounded transition-colors ${
                                                          effectiveMode === 'image'
                                                            ? 'bg-white text-zinc-900 shadow-2xs'
                                                            : 'text-zinc-500 hover:text-zinc-800'
                                                        }`}
                                                      >
                                                        Своя картинка
                                                      </button>
                                                      <button
                                                        type="button"
                                                        onClick={() => {
                                                          updateStudentMod({
                                                            visualMode: 'icon',
                                                            iconKey:
                                                              mod.iconKey ||
                                                              'python',
                                                          });
                                                          setEditingModuleVisual({
                                                            scope: 'individual',
                                                            id: mod.id,
                                                          });
                                                        }}
                                                        className={`px-1.5 py-0.5 rounded transition-colors ${
                                                          effectiveMode === 'icon'
                                                            ? 'bg-[#0D9488] text-white shadow-2xs'
                                                            : 'text-zinc-500 hover:text-zinc-800'
                                                        }`}
                                                      >
                                                        Иконка
                                                      </button>
                                                    </div>
                                                  </div>
                                                </div>
                                              </div>

                                              {/* Hover-revealed Detach / Delete Control */}
                                              <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                                                {mod.isIndividual ? (
                                                  <button
                                                    type="button"
                                                    onClick={() =>
                                                      setConfirmDeleteIndModId(
                                                        mod.id
                                                      )
                                                    }
                                                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-red-50 text-red-600 hover:bg-red-100 text-[10px] font-medium"
                                                    title="Удалить индивидуальный модуль"
                                                  >
                                                    <Trash2 className="w-3 h-3" />
                                                    <span>Открепить</span>
                                                  </button>
                                                ) : (
                                                  <button
                                                    type="button"
                                                    onClick={() =>
                                                      handleToggleStudentModule(
                                                        mod.id
                                                      )
                                                    }
                                                    className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${
                                                      visible
                                                        ? 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900'
                                                        : 'bg-[#F0FDFA] text-[#0F766E] hover:bg-[#CCFBF1]'
                                                    }`}
                                                    title={
                                                      visible
                                                        ? 'Открепить модуль от этого ученика'
                                                        : 'Вернуть модуль в лист ученика'
                                                    }
                                                  >
                                                    {visible ? (
                                                      <>
                                                        <EyeOff className="w-3 h-3" />
                                                        <span>Открепить</span>
                                                      </>
                                                    ) : (
                                                      <>
                                                        <Eye className="w-3 h-3" />
                                                        <span>Вернуть</span>
                                                      </>
                                                    )}
                                                  </button>
                                                )}
                                              </div>
                                            </div>
                                            {confirmDeleteIndModId ===
                                              mod.id && (
                                              <div className="mt-1.5 pt-1.5 border-t border-red-200/70 flex items-center justify-between gap-2">
                                                <span className="text-[10px] font-semibold text-red-700">
                                                  Удалить?
                                                </span>
                                                <div className="flex gap-1.5">
                                                  <button
                                                    type="button"
                                                    onClick={() => {
                                                      handleRemoveIndividualModule(
                                                        mod.id
                                                      );
                                                      setConfirmDeleteIndModId(
                                                        null
                                                      );
                                                    }}
                                                    className="px-1.5 py-0.5 rounded bg-red-600 text-white text-[10px] font-semibold"
                                                  >
                                                    Да
                                                  </button>
                                                  <button
                                                    type="button"
                                                    onClick={() =>
                                                      setConfirmDeleteIndModId(
                                                        null
                                                      )
                                                    }
                                                    className="px-1.5 py-0.5 text-zinc-600 text-[10px]"
                                                  >
                                                    Отмена
                                                  </button>
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}

                                  {/* Add Individual Module Button & Inline Picker */}
                                  {!individualModPickerOpen ? (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setIndividualModPickerOpen(true)
                                      }
                                      className="w-full inline-flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-md bg-[#F4F4F5] border border-dashed border-zinc-300 hover:border-[#0D9488] hover:bg-[#F0FDFA] text-[#0F766E] text-[11px] font-semibold transition-colors"
                                    >
                                      <Plus className="w-3.5 h-3.5" />
                                      <span>
                                        Добавить индивидуальный модуль
                                      </span>
                                    </button>
                                  ) : (
                                    <div className="pt-3 border-t border-[#0D9488]/30 space-y-2.5">
                                      <div className="flex items-center justify-between gap-2">
                                        <span className="text-[11px] font-bold text-[#0F766E]">
                                          Добавить только этому ученику
                                        </span>
                                        <button
                                          type="button"
                                          onClick={() =>
                                            setIndividualModPickerOpen(false)
                                          }
                                          className="text-zinc-400 hover:text-zinc-900"
                                        >
                                          <X className="w-3.5 h-3.5" />
                                        </button>
                                      </div>

                                      <div className="relative">
                                        <Search className="w-3 h-3 text-zinc-400 absolute left-2 top-1/2 -translate-y-1/2" />
                                        <input
                                          type="text"
                                          value={individualModSearch}
                                          onChange={(e) =>
                                            setIndividualModSearch(
                                              e.target.value
                                            )
                                          }
                                          placeholder="Найти в библиотеке..."
                                          className="w-full bg-zinc-50 border border-zinc-200 rounded-md pl-7 pr-2 py-1.5 text-[11px] focus:outline-none focus:bg-white focus:border-[#0D9488]"
                                        />
                                      </div>

                                      <div className="max-h-32 overflow-y-auto divide-y divide-zinc-100 pr-0.5">
                                        {filteredIndividualCatalog
                                          .slice(0, 12)
                                          .map((lib) => (
                                            <button
                                              key={lib.id}
                                              type="button"
                                              onClick={() =>
                                                handleAddIndividualModuleFromLib(
                                                  lib
                                                )
                                              }
                                              className="w-full text-left py-1.5 px-1 hover:bg-[#F0FDFA] flex items-center justify-between gap-2"
                                            >
                                              <span className="text-[11px] font-semibold text-zinc-900 truncate">
                                                {lib.displayTitle || lib.title}
                                              </span>
                                              <Plus className="w-3 h-3 text-[#0D9488] shrink-0" />
                                            </button>
                                          ))}
                                      </div>

                                      <div className="pt-2 border-t border-zinc-100 space-y-2">
                                        <input
                                          type="text"
                                          value={customIndividualModTitle}
                                          onChange={(e) =>
                                            setCustomIndividualModTitle(
                                              e.target.value
                                            )
                                          }
                                          placeholder="Или свой модуль (название)..."
                                          className="w-full bg-zinc-50 border border-zinc-200 rounded-md px-2.5 py-1.5 text-[11px] focus:outline-none focus:bg-white focus:border-[#0D9488]"
                                        />
                                        <div className="flex items-center gap-2">
                                          <input
                                            type="text"
                                            value={customIndividualModSub}
                                            onChange={(e) =>
                                              setCustomIndividualModSub(
                                                e.target.value
                                              )
                                            }
                                            placeholder="Подзаголовок..."
                                            className="flex-1 bg-zinc-50 border border-zinc-200 rounded-md px-2.5 py-1.5 text-[11px] focus:outline-none focus:bg-white focus:border-[#0D9488]"
                                          />
                                          <button
                                            type="button"
                                            onClick={
                                              handleAddCustomIndividualModule
                                            }
                                            disabled={
                                              !customIndividualModTitle.trim()
                                            }
                                            className="px-2.5 py-1.5 rounded-md bg-[#0D9488] text-white text-[11px] font-semibold disabled:opacity-45"
                                          >
                                            Ок
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {/* Skills Section Container */}
                                <div className="bg-white border border-zinc-200 rounded-lg p-3.5 shadow-[0_1px_2px_rgba(24,24,27,0.03)] space-y-3">
                                  <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
                                    <span className="text-[11px] font-bold text-zinc-800">
                                      Навыки (Чему я научился)
                                    </span>
                                    <span className="text-[10px] text-zinc-400 tabular-nums">
                                      {
                                        activeDoc.page1.skills.filter(
                                          (s) => !s.hidden
                                        ).length
                                      }{' '}
                                      из {activeDoc.page1.skills.length}
                                    </span>
                                  </div>

                                  {activeDoc.page1.skills.length > 0 && (
                                    <div className="divide-y divide-zinc-100 max-h-44 overflow-y-auto pr-0.5">
                                      {activeDoc.page1.skills.map((sk) => {
                                        const visible = !sk.hidden;
                                        return (
                                          <div key={sk.id} className="py-1.5">
                                            <div className="flex items-center justify-between gap-2">
                                              <label className="flex items-center gap-2 cursor-pointer min-w-0 flex-1">
                                                <input
                                                  type="checkbox"
                                                  checked={visible}
                                                  onChange={() =>
                                                    handleToggleStudentSkill(
                                                      sk.id
                                                    )
                                                  }
                                                  className="rounded border-zinc-300 text-[#0D9488] shrink-0"
                                                />
                                                <span
                                                  className={`text-[11px] truncate ${
                                                    visible
                                                      ? 'text-zinc-800 font-medium'
                                                      : 'line-through text-zinc-400'
                                                  }`}
                                                >
                                                  {sk.label}
                                                </span>
                                              </label>
                                              {sk.isIndividual && (
                                                <button
                                                  type="button"
                                                  onClick={() =>
                                                    setConfirmDeleteIndSkillId(
                                                      sk.id
                                                    )
                                                  }
                                                  className="text-zinc-400 hover:text-red-600 shrink-0"
                                                  title="Удалить индивидуальный навык"
                                                >
                                                  <Trash2 className="w-3 h-3" />
                                                </button>
                                              )}
                                            </div>
                                            {confirmDeleteIndSkillId ===
                                              sk.id && (
                                              <div className="mt-1 pt-1 border-t border-red-200/70 flex items-center justify-between gap-2">
                                                <span className="text-[10px] font-semibold text-red-700">
                                                  Удалить?
                                                </span>
                                                <div className="flex gap-1.5">
                                                  <button
                                                    type="button"
                                                    onClick={() => {
                                                      handleRemoveIndividualSkill(
                                                        sk.id
                                                      );
                                                      setConfirmDeleteIndSkillId(
                                                        null
                                                      );
                                                    }}
                                                    className="px-1.5 py-0.5 rounded bg-red-600 text-white text-[10px] font-semibold"
                                                  >
                                                    Да
                                                  </button>
                                                  <button
                                                    type="button"
                                                    onClick={() =>
                                                      setConfirmDeleteIndSkillId(
                                                        null
                                                      )
                                                    }
                                                    className="px-1.5 py-0.5 text-zinc-600 text-[10px]"
                                                  >
                                                    Отмена
                                                  </button>
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}

                                  <div className="p-2 rounded-md bg-[#F4F4F5] border border-dashed border-zinc-300 flex items-center gap-2">
                                    <div className="relative flex-1 flex items-center">
                                      <Plus className="w-3.5 h-3.5 text-[#0D9488] absolute left-2 pointer-events-none" />
                                      <input
                                        type="text"
                                        value={newIndividualSkill}
                                        onChange={(e) =>
                                          setNewIndividualSkill(e.target.value)
                                        }
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleAddIndividualSkill();
                                          }
                                        }}
                                        placeholder="Индивидуальный навык..."
                                        className="w-full bg-white border border-zinc-200 rounded pl-7 pr-2 py-1 text-[11px] focus:outline-none focus:border-[#0D9488]"
                                      />
                                    </div>
                                    <button
                                      type="button"
                                      onClick={handleAddIndividualSkill}
                                      disabled={!newIndividualSkill.trim()}
                                      className="px-2.5 py-1 rounded bg-[#0D9488] hover:bg-[#0F766E] text-white text-[11px] font-semibold disabled:opacity-45 shrink-0"
                                    >
                                      Добавить
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* STEP 3: ПРОЕКТЫ */}
                            {activeInspectorStep === 'projects' && (
                              <div className="space-y-3">
                                {activeDoc.page1.projects.length === 0 ? (
                                  <div className="bg-white border border-dashed border-zinc-300 rounded-lg py-6 px-4 text-center space-y-2.5">
                                    <p className="text-[11px] text-zinc-500">
                                      Проекты ещё не добавлены.
                                    </p>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const nextProj: ProjectItem = {
                                          id: `proj-${Date.now()}`,
                                          title: 'Новый проект',
                                          caption: 'Подпись проекта',
                                          description:
                                            'Что было реализовано на занятии.',
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
                                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#0D9488] hover:bg-[#0F766E] text-white text-[11px] font-semibold"
                                    >
                                      <Plus className="w-3.5 h-3.5" />
                                      <span>Добавить первый проект</span>
                                    </button>
                                  </div>
                                ) : (
                                  <div className="space-y-3">
                                    {activeDoc.page1.projects.map(
                                      (proj, idx) => (
                                        <div
                                          key={proj.id}
                                          className="bg-white border border-zinc-200 rounded-lg p-3.5 shadow-[0_1px_2px_rgba(24,24,27,0.03)] space-y-2.5"
                                        >
                                          <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-zinc-100">
                                            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                                              Проект #{idx + 1}
                                            </span>
                                            {confirmDeleteProjectId ===
                                            proj.id ? (
                                              <div className="inline-flex items-center gap-1.5">
                                                <span className="text-[10px] font-semibold text-red-700">
                                                  Удалить?
                                                </span>
                                                <button
                                                  type="button"
                                                  onClick={() => {
                                                    onChangeJournal({
                                                      ...activeDoc,
                                                      page1: {
                                                        ...activeDoc.page1,
                                                        projects:
                                                          activeDoc.page1.projects.filter(
                                                            (p) =>
                                                              p.id !== proj.id
                                                          ),
                                                      },
                                                    });
                                                    setConfirmDeleteProjectId(
                                                      null
                                                    );
                                                  }}
                                                  className="px-1.5 py-0.5 rounded bg-red-600 text-white text-[10px] font-semibold"
                                                >
                                                  Да
                                                </button>
                                                <button
                                                  type="button"
                                                  onClick={() =>
                                                    setConfirmDeleteProjectId(
                                                      null
                                                    )
                                                  }
                                                  className="px-1.5 py-0.5 text-zinc-600 text-[10px]"
                                                >
                                                  Отмена
                                                </button>
                                              </div>
                                            ) : (
                                              <button
                                                type="button"
                                                onClick={() =>
                                                  setConfirmDeleteProjectId(
                                                    proj.id
                                                  )
                                                }
                                                className="text-zinc-400 hover:text-red-600 transition-colors"
                                                title="Удалить проект"
                                              >
                                                <Trash2 className="w-3.5 h-3.5" />
                                              </button>
                                            )}
                                          </div>

                                          {/* Clear Typographic Hierarchy: Title -> Caption -> Description */}
                                          <div className="space-y-2">
                                            <input
                                              type="text"
                                              value={proj.title}
                                              onChange={(e) =>
                                                onChangeJournal({
                                                  ...activeDoc,
                                                  page1: {
                                                    ...activeDoc.page1,
                                                    projects:
                                                      activeDoc.page1.projects.map(
                                                        (p) =>
                                                          p.id === proj.id
                                                            ? {
                                                                ...p,
                                                                title:
                                                                  e.target
                                                                    .value,
                                                              }
                                                            : p
                                                      ),
                                                  },
                                                })
                                              }
                                              placeholder="Название проекта"
                                              className="w-full bg-transparent border-0 border-b border-zinc-200 px-0 py-1 text-sm font-bold text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-[#0D9488]"
                                            />

                                            <input
                                              type="text"
                                              value={proj.caption}
                                              onChange={(e) =>
                                                onChangeJournal({
                                                  ...activeDoc,
                                                  page1: {
                                                    ...activeDoc.page1,
                                                    projects:
                                                      activeDoc.page1.projects.map(
                                                        (p) =>
                                                          p.id === proj.id
                                                            ? {
                                                                ...p,
                                                                caption:
                                                                  e.target
                                                                    .value,
                                                              }
                                                            : p
                                                      ),
                                                  },
                                                })
                                              }
                                              placeholder="Подпись (например: Игра в Kodu)"
                                              className="w-full bg-transparent border-0 border-b border-zinc-100 px-0 py-0.5 text-[11px] font-medium text-zinc-500 placeholder:text-zinc-400 focus:outline-none focus:border-[#0D9488]"
                                            />

                                            <textarea
                                              rows={2}
                                              value={proj.description}
                                              onChange={(e) =>
                                                onChangeJournal({
                                                  ...activeDoc,
                                                  page1: {
                                                    ...activeDoc.page1,
                                                    projects:
                                                      activeDoc.page1.projects.map(
                                                        (p) =>
                                                          p.id === proj.id
                                                            ? {
                                                                ...p,
                                                                description:
                                                                  e.target
                                                                    .value,
                                                              }
                                                            : p
                                                      ),
                                                  },
                                                })
                                              }
                                              placeholder="Короткое описание..."
                                              className="w-full bg-zinc-50/70 border border-zinc-200/80 rounded-md px-2.5 py-1.5 text-xs text-zinc-700 leading-relaxed placeholder:text-zinc-400 focus:outline-none focus:bg-white focus:border-[#0D9488] resize-none"
                                            />
                                          </div>

                                          {/* Unified Bottom Screenshot Upload Zone */}
                                          <div className="pt-2 border-t border-zinc-100 space-y-2">
                                            {proj.imageUrl && (
                                              <div className="flex items-center justify-between gap-2 px-2 py-1 rounded bg-[#F0FDFA] border border-[#CCFBF1] text-[10px] text-[#0F766E]">
                                                <div className="flex items-center gap-2 min-w-0">
                                                  <img
                                                    src={proj.imageUrl}
                                                    alt={proj.title}
                                                    className="w-5 h-5 rounded object-cover border border-teal-200 shrink-0"
                                                  />
                                                  <span className="font-medium truncate">
                                                    Скриншот загружен
                                                  </span>
                                                </div>
                                                <button
                                                  type="button"
                                                  onClick={() =>
                                                    onChangeJournal({
                                                      ...activeDoc,
                                                      page1: {
                                                        ...activeDoc.page1,
                                                        projects:
                                                          activeDoc.page1.projects.map(
                                                            (p) =>
                                                              p.id === proj.id
                                                                ? {
                                                                    ...p,
                                                                    imageUrl:
                                                                      undefined,
                                                                    isRealScreenshot:
                                                                      false,
                                                                  }
                                                                : p
                                                          ),
                                                      },
                                                    })
                                                  }
                                                  className="text-zinc-400 hover:text-red-600 shrink-0"
                                                  title="Убрать скриншот"
                                                >
                                                  <X className="w-3 h-3" />
                                                </button>
                                              </div>
                                            )}

                                            <div className="flex items-stretch rounded-lg border border-zinc-200 overflow-hidden divide-x divide-zinc-200">
                                              <label className="flex-1 inline-flex items-center justify-center gap-1.5 px-2.5 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white text-[11px] font-semibold cursor-pointer transition-colors whitespace-nowrap">
                                                <Upload className="w-3 h-3 shrink-0" />
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
                                                            projects:
                                                              activeDoc.page1.projects.map(
                                                                (p) =>
                                                                  p.id ===
                                                                  proj.id
                                                                    ? {
                                                                        ...p,
                                                                        imageUrl:
                                                                          url,
                                                                        isRealScreenshot:
                                                                          true,
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
                                                  onOpenMediaPicker(
                                                    'projects',
                                                    (url) =>
                                                      onChangeJournal({
                                                        ...activeDoc,
                                                        page1: {
                                                          ...activeDoc.page1,
                                                          projects:
                                                            activeDoc.page1.projects.map(
                                                              (p) =>
                                                                p.id === proj.id
                                                                  ? {
                                                                      ...p,
                                                                      imageUrl:
                                                                        url,
                                                                      isRealScreenshot:
                                                                        true,
                                                                    }
                                                                  : p
                                                            ),
                                                        },
                                                      })
                                                  )
                                                }
                                                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-white hover:bg-zinc-50 text-zinc-700 text-[11px] font-medium transition-colors whitespace-nowrap shrink-0"
                                                title="Выбрать из медиатеки"
                                              >
                                                <ImageIcon className="w-3.5 h-3.5 text-zinc-500" />
                                                <span>Медиатека</span>
                                              </button>
                                            </div>
                                          </div>
                                        </div>
                                      )
                                    )}
                                  </div>
                                )}
                              </div>
                            )}

                            {/* STEP 4: ДОСТИЖЕНИЯ */}
                            {activeInspectorStep === 'pride' && (
                              <div className="space-y-4">
                                {/* Pride Moment Card */}
                                <div className="bg-white border border-zinc-200 rounded-lg p-3.5 shadow-[0_1px_2px_rgba(24,24,27,0.03)] space-y-2.5">
                                  <div className="pb-1.5 border-b border-zinc-100">
                                    <span className="text-[11px] font-bold text-zinc-800 block">
                                      Момент гордости ученика
                                    </span>
                                  </div>
                                  <textarea
                                    rows={3}
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
                                    className="w-full p-3 rounded-lg border border-zinc-200 bg-zinc-50/60 text-xs text-zinc-800 leading-relaxed placeholder:text-zinc-400 focus:outline-none focus:bg-white focus:border-[#0D9488] focus:ring-2 focus:ring-[#0D9488]/15 resize-none transition-colors"
                                  />
                                </div>

                                {/* Strengths Card */}
                                <div className="bg-white border border-zinc-200 rounded-lg p-3.5 shadow-[0_1px_2px_rgba(24,24,27,0.03)] space-y-3">
                                  <div className="flex items-center justify-between pb-1.5 border-b border-zinc-100">
                                    <span className="text-[11px] font-bold text-zinc-800">
                                      Сильные стороны
                                    </span>
                                    <span className="text-[10px] font-semibold text-[#0F766E] tabular-nums">
                                      Выбрано:{' '}
                                      {activeDoc.page2.strengths.length}
                                    </span>
                                  </div>

                                  <div className="flex flex-wrap gap-1.5">
                                    {STRENGTH_LIBRARY.map((preset) => {
                                      const exists =
                                        activeDoc.page2.strengths.some(
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
                                                      (s) =>
                                                        s.title !== preset.title
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
                                                    ...activeDoc.page2
                                                      .strengths,
                                                    nextStr,
                                                  ],
                                                },
                                              });
                                            }
                                          }}
                                          className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md border text-[11px] font-medium transition-colors ${
                                            exists
                                              ? 'bg-[#0D9488] text-white border-[#0D9488] shadow-[0_1px_2px_rgba(13,148,136,0.18)]'
                                              : 'bg-white text-zinc-700 border-zinc-200 hover:border-[#0D9488] hover:text-zinc-900'
                                          }`}
                                        >
                                          {exists && (
                                            <Check className="w-3 h-3 shrink-0" />
                                          )}
                                          <span>{preset.title}</span>
                                        </button>
                                      );
                                    })}
                                    {activeDoc.page2.strengths
                                      .filter(
                                        (s) =>
                                          !STRENGTH_LIBRARY.some(
                                            (p) => p.title === s.title
                                          )
                                      )
                                      .map((customStr) => (
                                        <button
                                          key={customStr.id}
                                          type="button"
                                          onClick={() =>
                                            onChangeJournal({
                                              ...activeDoc,
                                              page2: {
                                                ...activeDoc.page2,
                                                strengths:
                                                  activeDoc.page2.strengths.filter(
                                                    (s) => s.id !== customStr.id
                                                  ),
                                              },
                                            })
                                          }
                                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md border bg-[#0D9488] text-white border-[#0D9488] shadow-[0_1px_2px_rgba(13,148,136,0.18)] text-[11px] font-medium"
                                          title="Нажмите, чтобы убрать"
                                        >
                                          <Check className="w-3 h-3 shrink-0" />
                                          <span>{customStr.title}</span>
                                        </button>
                                      ))}
                                  </div>

                                  <div className="p-2 rounded-md bg-[#F4F4F5] border border-dashed border-zinc-300 flex items-center gap-2">
                                    <div className="relative flex-1 flex items-center">
                                      <Plus className="w-3.5 h-3.5 text-[#0D9488] absolute left-2 pointer-events-none" />
                                      <input
                                        type="text"
                                        value={newStrengthTitle}
                                        onChange={(e) =>
                                          setNewStrengthTitle(e.target.value)
                                        }
                                        onKeyDown={(e) => {
                                          if (
                                            e.key === 'Enter' &&
                                            newStrengthTitle.trim()
                                          ) {
                                            e.preventDefault();
                                            const nextStr: StrengthItem = {
                                              id: `str-custom-${Date.now()}`,
                                              title: newStrengthTitle.trim(),
                                              example:
                                                'Ярко проявил себя на практических заданиях.',
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
                                          }
                                        }}
                                        placeholder="Своя сильная сторона..."
                                        className="w-full bg-white border border-zinc-200 rounded pl-7 pr-2 py-1 text-[11px] focus:outline-none focus:border-[#0D9488]"
                                      />
                                    </div>
                                    <button
                                      type="button"
                                      disabled={!newStrengthTitle.trim()}
                                      onClick={() => {
                                        if (!newStrengthTitle.trim()) return;
                                        const nextStr: StrengthItem = {
                                          id: `str-custom-${Date.now()}`,
                                          title: newStrengthTitle.trim(),
                                          example:
                                            'Ярко проявил себя на практических заданиях.',
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
                                      className="px-2.5 py-1 rounded bg-[#0D9488] hover:bg-[#0F766E] text-white text-[11px] font-semibold disabled:opacity-45 shrink-0"
                                    >
                                      Добавить
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* STEP 5: СЛОВО НАСТАВНИКА */}
                            {activeInspectorStep === 'mentorNote' && (
                              <div className="space-y-4">
                                {/* Card 1: AI Generation Zone */}
                                <div className="bg-white border border-zinc-200 rounded-lg p-3.5 shadow-[0_1px_2px_rgba(24,24,27,0.03)] space-y-3">
                                  <div className="flex items-center gap-1.5 pb-1.5 border-b border-zinc-100">
                                    <Sparkles className="w-3.5 h-3.5 text-[#0D9488]" />
                                    <span className="text-[11px] font-bold text-zinc-800">
                                      AI-генерация письма
                                    </span>
                                  </div>

                                  <label className="block">
                                    <span className="text-[11px] font-medium text-zinc-500 mb-1 block">
                                      Наблюдения наставника
                                    </span>
                                    <textarea
                                      rows={2}
                                      value={
                                        activeDoc.page2.mentorNote
                                          .observationsDraft
                                      }
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
                                      placeholder="Факты: помог группе, разобрался в циклах..."
                                      className="w-full p-2.5 rounded-md border border-zinc-200 bg-zinc-50/60 text-xs text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:bg-white focus:border-[#0D9488] focus:ring-2 focus:ring-[#0D9488]/15 resize-none"
                                    />
                                  </label>

                                  <button
                                    type="button"
                                    disabled={aiBusy}
                                    onClick={handleGenerateAiMentorNote}
                                    className="w-full inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-lg bg-gradient-to-r from-[#0D9488] to-[#0F766E] hover:from-[#0F766E] hover:to-[#115E59] text-white text-xs font-bold shadow-sm transition-all disabled:opacity-60"
                                  >
                                    {aiBusy ? (
                                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    ) : (
                                      <Sparkles className="w-3.5 h-3.5" />
                                    )}
                                    <span>
                                      {aiBusy
                                        ? 'Формулируем письмо...'
                                        : 'Сгенерировать тёплое письмо (AI)'}
                                    </span>
                                  </button>

                                  {aiError && (
                                    <div className="p-2 rounded bg-amber-50 border border-amber-200 text-[11px] text-amber-800">
                                      {aiError}
                                    </div>
                                  )}

                                  <div className="pt-1 space-y-1.5">
                                    <span className="text-[10px] font-medium text-zinc-400 block">
                                      Быстрые шаблоны:
                                    </span>
                                    <div className="flex flex-wrap gap-1.5">
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
                                                    activeDoc.resident.fullName.split(
                                                      ' '
                                                    )[0]
                                                  }, ${tpl.greeting.toLowerCase()}`,
                                                  body: tpl.body,
                                                  signature: `Твой наставник, ${
                                                    activeDoc.resident.mentorName.split(
                                                      ' '
                                                    )[0]
                                                  }`,
                                                },
                                              },
                                            })
                                          }
                                          className="px-2 py-1 rounded border border-zinc-200 bg-white hover:border-[#0D9488] hover:text-[#0F766E] text-[10px] font-medium text-zinc-700 transition-colors"
                                        >
                                          {tpl.title}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                </div>

                                {/* Card 2: Unified Letter Container */}
                                <div className="bg-white border border-zinc-200 rounded-lg p-3.5 shadow-[0_1px_2px_rgba(24,24,27,0.03)] space-y-3">
                                  <div className="pb-1.5 border-b border-zinc-100">
                                    <span className="text-[11px] font-bold text-zinc-800">
                                      Письмо ученику
                                    </span>
                                  </div>

                                  <label className="block">
                                    <span className="text-[11px] font-medium text-zinc-500 mb-1 block">
                                      Приветствие
                                    </span>
                                    <input
                                      type="text"
                                      value={
                                        activeDoc.page2.mentorNote.greeting
                                      }
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
                                      className="w-full px-2.5 py-1.5 rounded-md border border-zinc-200 bg-zinc-50/50 text-xs font-semibold text-zinc-900 focus:outline-none focus:bg-white focus:border-[#0D9488]"
                                    />
                                  </label>

                                  <label className="block">
                                    <span className="text-[11px] font-medium text-zinc-500 mb-1 block">
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
                                      className="w-full p-2.5 rounded-md border border-zinc-200 bg-zinc-50/50 text-xs text-zinc-800 leading-relaxed focus:outline-none focus:bg-white focus:border-[#0D9488] resize-none"
                                    />
                                  </label>

                                  <label className="block">
                                    <span className="text-[11px] font-medium text-zinc-500 mb-1 block">
                                      Подпись
                                    </span>
                                    <input
                                      type="text"
                                      value={
                                        activeDoc.page2.mentorNote.signature
                                      }
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
                                      className="w-full px-2.5 py-1.5 rounded-md border border-zinc-200 bg-zinc-50/50 text-xs font-medium text-zinc-700 focus:outline-none focus:bg-white focus:border-[#0D9488]"
                                    />
                                  </label>
                                </div>
                              </div>
                            )}
                          </div>
                        </>
                      );
                    })()
                  )}
                </aside>
            </>
            )}
          </>
        )}
      </div>

      {/* QUICK PICKER MODAL: AGE-FILTERED MODULES */}
      {modulesModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-zinc-900/40 backdrop-blur-[1px] flex items-center justify-center p-4"
          onClick={() => setModulesModalOpen(false)}
        >
          <div
            className="w-full max-w-3xl max-h-[85vh] bg-white rounded-2xl border border-zinc-200 shadow-xl flex flex-col overflow-hidden text-xs"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="shrink-0 px-5 py-3.5 border-b border-zinc-200 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-zinc-900">
                  Выбор модулей программы
                </h3>
                <p className="text-[11px] text-zinc-500">
                  По умолчанию показаны модули для возраста группы ({groupDraft.ageCategory} лет)
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModulesModalOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="shrink-0 px-5 py-3 border-b border-zinc-100 bg-[#FCFCFA] flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  autoFocus
                  value={modalModSearch}
                  onChange={(e) => setModalModSearch(e.target.value)}
                  placeholder="Поиск модуля (Python, Kodu, Roblox...)"
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-zinc-200 bg-white focus:outline-none focus:border-[#0D9488]"
                />
              </div>

              <select
                value={modalModCategory}
                onChange={(e) => setModalModCategory(e.target.value)}
                className="rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5"
              >
                <option value="all">Все категории</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.shortName}
                  </option>
                ))}
              </select>

              <div className="flex items-center p-0.5 rounded-lg border border-zinc-200 bg-white shrink-0">
                <button
                  type="button"
                  onClick={() => setModalAgeFilter('group')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                    modalAgeFilter === 'group'
                      ? 'bg-[#0D9488] text-white'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  {groupDraft.ageCategory} лет
                </button>
                <button
                  type="button"
                  onClick={() => setModalAgeFilter('all')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                    modalAgeFilter === 'all'
                      ? 'bg-zinc-900 text-white'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  Все возрасты
                </button>
              </div>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto p-5">
              {modalFilteredModules.length === 0 ? (
                <div className="py-12 text-center text-zinc-500 space-y-2">
                  <p>Модули по текущему фильтру не найдены.</p>
                  {modalAgeFilter === 'group' && (
                    <button
                      type="button"
                      onClick={() => setModalAgeFilter('all')}
                      className="text-[#0D9488] font-semibold hover:underline"
                    >
                      Показать все возрасты
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {modalFilteredModules.map((lib) => {
                    const checked = draftModalModuleIds.includes(lib.id);
                    const ages = getModuleAgeCategories(lib);
                    return (
                      <label
                        key={lib.id}
                        className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition-colors ${
                          checked
                            ? 'border-[#0D9488] bg-[#F0FDFA]'
                            : 'border-zinc-200 bg-white hover:border-zinc-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() =>
                            setDraftModalModuleIds((prev) =>
                              prev.includes(lib.id)
                                ? prev.filter((id) => id !== lib.id)
                                : [...prev, lib.id]
                            )
                          }
                          className="mt-0.5 rounded border-zinc-300 text-[#0D9488] shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <span
                              className={`font-bold truncate ${
                                checked ? 'text-[#0F766E]' : 'text-zinc-900'
                              }`}
                            >
                              {lib.displayTitle || lib.title}
                            </span>
                          </div>
                          <div className="text-[11px] text-zinc-500 truncate mt-0.5">
                            {lib.subtitle}
                          </div>
                          <div className="text-[10px] text-zinc-400 mt-1">
                            Возраст: {ages.join(', ')} лет
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="shrink-0 px-5 py-3 border-t border-zinc-200 bg-[#FCFCFA] flex items-center justify-between gap-3">
              <span className="text-[11px] font-semibold text-zinc-600 tabular-nums">
                Выбрано: {draftModalModuleIds.length}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setModulesModalOpen(false)}
                  className="px-3.5 py-2 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 font-semibold text-zinc-700"
                >
                  Отмена
                </button>
                <button
                  type="button"
                  onClick={confirmModulesModal}
                  className="px-4 py-2 rounded-lg bg-[#0F766E] hover:bg-[#0D9488] text-white font-semibold"
                >
                  Добавить ({draftModalModuleIds.length})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QUICK PICKER MODAL: GROUP SKILLS */}
      {skillsModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-zinc-900/40 backdrop-blur-[1px] flex items-center justify-center p-4"
          onClick={() => setSkillsModalOpen(false)}
        >
          <div
            className="w-full max-w-2xl max-h-[82vh] bg-white rounded-2xl border border-zinc-200 shadow-xl flex flex-col overflow-hidden text-xs"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="shrink-0 px-5 py-3.5 border-b border-zinc-200 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-zinc-900">
                  Выбор общих навыков группы
                </h3>
                <p className="text-[11px] text-zinc-500">
                  Отметьте навыки из каталога — они отобразятся на листе А4
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSkillsModalOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="shrink-0 px-5 py-3 border-b border-zinc-100 bg-[#FCFCFA]">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  autoFocus
                  value={modalSkillSearch}
                  onChange={(e) => setModalSkillSearch(e.target.value)}
                  placeholder="Поиск навыка..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-zinc-200 bg-white focus:outline-none focus:border-[#0D9488]"
                />
              </div>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto p-5 grid grid-cols-1 sm:grid-cols-2 gap-2 content-start">
              {skillsCatalog
                .filter((def) => {
                  const q = modalSkillSearch.trim().toLowerCase();
                  return !q || def.label.toLowerCase().includes(q);
                })
                .map((def) => {
                  const checked = draftModalSkillIds.includes(def.id);
                  const recommended = recommendedSkillDefs.some(
                    (r) => r.id === def.id
                  );
                  return (
                    <label
                      key={def.id}
                      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border cursor-pointer transition-colors ${
                        checked
                          ? 'border-[#0D9488] bg-[#F0FDFA]'
                          : 'border-zinc-200 bg-white hover:border-zinc-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() =>
                          setDraftModalSkillIds((prev) =>
                            prev.includes(def.id)
                              ? prev.filter((id) => id !== def.id)
                              : [...prev, def.id]
                          )
                        }
                        className="rounded border-zinc-300 text-[#0D9488] shrink-0"
                      />
                      <span
                        className={`font-medium flex-1 truncate ${
                          checked ? 'text-[#0F766E]' : 'text-zinc-800'
                        }`}
                      >
                        {def.label}
                      </span>
                      {recommended && (
                        <span className="text-[10px] font-semibold text-[#0F766E] shrink-0">
                          Реком.
                        </span>
                      )}
                    </label>
                  );
                })}
            </div>

            <div className="shrink-0 px-5 py-3 border-t border-zinc-200 bg-[#FCFCFA] flex items-center justify-between gap-3">
              <span className="text-[11px] font-semibold text-zinc-600 tabular-nums">
                Выбрано: {draftModalSkillIds.length}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSkillsModalOpen(false)}
                  className="px-3.5 py-2 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 font-semibold text-zinc-700"
                >
                  Отмена
                </button>
                <button
                  type="button"
                  onClick={confirmSkillsModal}
                  className="px-4 py-2 rounded-lg bg-[#0F766E] hover:bg-[#0D9488] text-white font-semibold"
                >
                  Добавить ({draftModalSkillIds.length})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QUICK PICKER MODAL: NEXT CHAPTER TOPICS CATALOG */}
      {topicsModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-zinc-900/40 backdrop-blur-[1px] flex items-center justify-center p-4"
          onClick={() => setTopicsModalOpen(false)}
        >
          <div
            className="w-full max-w-2xl max-h-[82vh] bg-white rounded-2xl border border-zinc-200 shadow-xl flex flex-col overflow-hidden text-xs"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="shrink-0 px-5 py-3.5 border-b border-zinc-200 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-zinc-900">
                  Выбор тем следующих модулей
                </h3>
                <p className="text-[11px] text-zinc-500">
                  Отметьте будущие направления (ИИ, Веб-разработка, 3D и др.) для блока «Что интересного впереди?»
                </p>
              </div>
              <button
                type="button"
                onClick={() => setTopicsModalOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="shrink-0 px-5 py-3 border-b border-zinc-100 bg-[#FCFCFA]">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  autoFocus
                  value={modalTopicSearch}
                  onChange={(e) => setModalTopicSearch(e.target.value)}
                  placeholder="Поиск темы (ИИ, Веб-разработка, 3D, Python...)"
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-zinc-200 bg-white focus:outline-none focus:border-[#0D9488]"
                />
              </div>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto p-5 grid grid-cols-1 sm:grid-cols-2 gap-2 content-start">
              {topicsCatalogOptions
                .filter((opt) => {
                  const q = modalTopicSearch.trim().toLowerCase();
                  return (
                    !q ||
                    opt.title.toLowerCase().includes(q) ||
                    opt.subtitle.toLowerCase().includes(q)
                  );
                })
                .map((opt) => {
                  const checked = draftModalTopicTitles.some(
                    (t) => t.toLowerCase() === opt.title.toLowerCase()
                  );
                  return (
                    <label
                      key={opt.id}
                      className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition-colors ${
                        checked
                          ? 'border-[#0D9488] bg-[#F0FDFA]'
                          : 'border-zinc-200 bg-white hover:border-zinc-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() =>
                          setDraftModalTopicTitles((prev) =>
                            checked
                              ? prev.filter(
                                  (t) =>
                                    t.toLowerCase() !== opt.title.toLowerCase()
                                )
                              : [...prev, opt.title]
                          )
                        }
                        className="mt-0.5 rounded border-zinc-300 text-[#0D9488] shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div
                          className={`font-bold truncate ${
                            checked ? 'text-[#0F766E]' : 'text-zinc-900'
                          }`}
                        >
                          {opt.title}
                        </div>
                        <div className="text-[11px] text-zinc-500 truncate mt-0.5">
                          {opt.subtitle}
                        </div>
                      </div>
                    </label>
                  );
                })}
            </div>

            <div className="shrink-0 px-5 py-3 border-t border-zinc-200 bg-[#FCFCFA] flex items-center justify-between gap-3">
              <span className="text-[11px] font-semibold text-zinc-600 tabular-nums">
                Выбрано: {draftModalTopicTitles.length}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setTopicsModalOpen(false)}
                  className="px-3.5 py-2 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 font-semibold text-zinc-700"
                >
                  Отмена
                </button>
                <button
                  type="button"
                  onClick={confirmTopicsModal}
                  className="px-4 py-2 rounded-lg bg-[#0F766E] hover:bg-[#0D9488] text-white font-semibold"
                >
                  Добавить ({draftModalTopicTitles.length})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODULE VISUAL MODAL: СВОЯ КАРТИНКА / ВЕКТОРНАЯ ИКОНКА (ДЛЯ ГРУППЫ И УЧЕНИКА) */}
      {editingModuleVisual &&
        (() => {
          const targetMod =
            editingModuleVisual.scope === 'common'
              ? commonDraft.modules.find((m) => m.id === editingModuleVisual.id)
              : activeDoc?.page1.modules.find(
                  (m) => m.id === editingModuleVisual.id
                );
          if (!targetMod) return null;
          const linkedUrl =
            targetMod.imageMediaId && mediaAssets
              ? mediaAssets.find((a) => a.id === targetMod.imageMediaId)?.url
              : undefined;
          const resolvedUrl = linkedUrl || targetMod.customImageUrl;
          const effectiveMode =
            targetMod.visualMode ?? (resolvedUrl ? 'image' : 'illustration');
          const imgScale = targetMod.imageScale ?? 1;
          const imgX = targetMod.imagePosX ?? 0;
          const imgY = targetMod.imagePosY ?? 0;

          const updateTargetMod = (patch: Partial<ModuleItem>) => {
            if (editingModuleVisual.scope === 'common') {
              setCommonDraft((prev) => ({
                ...prev,
                modules: prev.modules.map((m) =>
                  m.id === targetMod.id ? { ...m, ...patch } : m
                ),
              }));
            } else if (activeDoc) {
              onChangeJournal({
                ...activeDoc,
                page1: {
                  ...activeDoc.page1,
                  modules: activeDoc.page1.modules.map((m) =>
                    m.id === targetMod.id ? { ...m, ...patch } : m
                  ),
                },
              });
            }
          };

          const isIconTab = effectiveMode === 'icon';

          return (
            <div
              className="fixed inset-0 z-50 bg-zinc-900/40 backdrop-blur-[1px] flex items-center justify-center p-4"
              onClick={() => setEditingModuleVisual(null)}
            >
              <div
                className="w-full max-w-lg bg-white rounded-2xl border border-zinc-200 shadow-xl overflow-hidden text-xs flex flex-col max-h-[88vh]"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="shrink-0 px-5 py-3.5 border-b border-zinc-200 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-zinc-900 truncate">
                      Иллюстрация модуля
                    </h3>
                    <p className="text-[11px] text-zinc-500 truncate">
                      {targetMod.title}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditingModuleVisual(null)}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex-1 min-h-0 overflow-y-auto p-5 space-y-4">
                  {/* Live A4-aspect preview */}
                  <div
                    style={{ backgroundColor: targetMod.cardBgColor }}
                    className="w-[220px] h-[90px] mx-auto rounded-xl border border-black/10 overflow-hidden flex items-center justify-center"
                  >
                    {effectiveMode === 'image' && resolvedUrl ? (
                      <img
                        src={resolvedUrl}
                        alt={targetMod.title}
                        referrerPolicy="no-referrer"
                        style={{
                          transform: `translate(${imgX}px, ${imgY}px) scale(${imgScale})`,
                        }}
                        className="w-full h-full object-cover"
                      />
                    ) : effectiveMode === 'icon' ? (
                      <div
                        style={{
                          transform: `translate(${imgX}px, ${imgY}px) scale(${imgScale})`,
                        }}
                        className="flex items-center justify-center w-full h-full"
                      >
                        <div className="w-[60px] h-[60px] rounded-2xl bg-white/70 border-[1.5px] border-[#18181B]/15 shadow-xs flex items-center justify-center">
                          <ModuleVectorIcon
                            iconKey={targetMod.iconKey}
                            className="w-11 h-11"
                          />
                        </div>
                      </div>
                    ) : (
                      <div
                        style={{
                          transform: `translate(${imgX}px, ${imgY}px) scale(${imgScale})`,
                        }}
                        className="w-full h-full"
                      >
                        <ModuleSvgIllustration
                          type={targetMod.illustrationKey}
                        />
                      </div>
                    )}
                  </div>

                  {/* Primary Segmented Switcher: Своя картинка / Иконка */}
                  <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-zinc-100 border border-zinc-200/80">
                    <button
                      type="button"
                      onClick={() =>
                        updateTargetMod({
                          visualMode: 'image',
                        })
                      }
                      className={`py-2 px-3 rounded-lg text-xs font-bold transition-colors ${
                        !isIconTab && effectiveMode === 'image'
                          ? 'bg-white text-zinc-900 shadow-xs'
                          : 'text-zinc-600 hover:text-zinc-900'
                      }`}
                    >
                      Своя картинка
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        updateTargetMod({
                          visualMode: 'icon',
                          iconKey: targetMod.iconKey || 'python',
                          imageScale: 1,
                          imagePosX: 0,
                          imagePosY: 0,
                        })
                      }
                      className={`py-2 px-3 rounded-lg text-xs font-bold transition-colors ${
                        isIconTab
                          ? 'bg-[#0D9488] text-white shadow-xs'
                          : 'text-zinc-600 hover:text-zinc-900'
                      }`}
                    >
                      Иконка (SVG-библиотека)
                    </button>
                  </div>

                  {isIconTab ? (
                    /* Vector SVG Icon Library Grid */
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-zinc-700">
                          Выберите векторную иконку
                        </span>
                        <span className="text-[11px] text-zinc-400">
                          Python, 3D, Web, ИИ, Роботы и др.
                        </span>
                      </div>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-[250px] overflow-y-auto pr-1">
                        {MODULE_VECTOR_ICON_OPTIONS.map((opt) => {
                          const selected = targetMod.iconKey === opt.key;
                          return (
                            <button
                              key={opt.key}
                              type="button"
                              onClick={() =>
                                updateTargetMod({
                                  visualMode: 'icon',
                                  iconKey: opt.key as ModuleLucideIconKey,
                                })
                              }
                              className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1.5 text-center transition-all ${
                                selected
                                  ? 'border-[#0D9488] bg-[#F0FDFA] ring-2 ring-[#0D9488]/25'
                                  : 'border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50'
                              }`}
                            >
                              <ModuleVectorIcon
                                iconKey={opt.key}
                                className="w-8 h-8"
                              />
                              <span className="text-[10px] font-semibold leading-tight text-zinc-700 line-clamp-1">
                                {opt.label}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    /* Image Upload + Media Picker + Crop/Zoom */
                    <div className="space-y-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            onOpenMediaPicker('modules', (url, asset) =>
                              updateTargetMod({
                                visualMode: 'image',
                                customImageUrl: url,
                                imageMediaId: asset?.id ?? null,
                              })
                            )
                          }
                          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#0D9488] hover:bg-[#0F766E] text-white font-semibold whitespace-nowrap"
                        >
                          <ImageIcon className="w-3.5 h-3.5" />
                          <span>Выбрать из медиатеки</span>
                        </button>

                        <label className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-zinc-200 hover:bg-zinc-50 font-semibold text-zinc-700 cursor-pointer whitespace-nowrap">
                          <Upload className="w-3.5 h-3.5" />
                          <span>Загрузить файл</span>
                          <input
                            type="file"
                            accept="image/png,image/jpeg,image/webp"
                            className="hidden"
                            onChange={(e) =>
                              handleUploadImage(e.target.files?.[0], (url) =>
                                updateTargetMod({
                                  visualMode: 'image',
                                  customImageUrl: url,
                                  imageMediaId: null,
                                })
                              )
                            }
                          />
                        </label>

                        <button
                          type="button"
                          onClick={() =>
                            updateTargetMod({
                              visualMode: 'illustration',
                              customImageUrl: undefined,
                              imageMediaId: null,
                              imageScale: 1,
                              imagePosX: 0,
                              imagePosY: 0,
                            })
                          }
                          className="w-full py-1 text-[11px] font-medium text-zinc-500 hover:text-zinc-900 text-center"
                        >
                          Сбросить на встроенную иллюстрацию
                        </button>
                      </div>

                      {/* Crop & Zoom Sliders */}
                      <div className="pt-3 border-t border-zinc-100 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-zinc-700">
                            Масштаб и кадрирование
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              updateTargetMod({
                                imageScale: 1,
                                imagePosX: 0,
                                imagePosY: 0,
                              })
                            }
                            className="inline-flex items-center gap-1 text-[11px] font-medium text-[#0D9488] hover:underline"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Сбросить</span>
                          </button>
                        </div>

                        <label className="block space-y-1">
                          <div className="flex items-center justify-between text-[11px] text-zinc-500">
                            <span>Масштаб</span>
                            <span className="font-mono tabular-nums">
                              {Math.round(imgScale * 100)}%
                            </span>
                          </div>
                          <input
                            type="range"
                            min={0.7}
                            max={2.2}
                            step={0.05}
                            value={imgScale}
                            onChange={(e) =>
                              updateTargetMod({
                                imageScale: Number(e.target.value),
                              })
                            }
                            className="w-full accent-[#0D9488]"
                          />
                        </label>

                        <label className="block space-y-1">
                          <div className="flex items-center justify-between text-[11px] text-zinc-500">
                            <span>Смещение по X</span>
                            <span className="font-mono tabular-nums">
                              {imgX}px
                            </span>
                          </div>
                          <input
                            type="range"
                            min={-60}
                            max={60}
                            step={1}
                            value={imgX}
                            onChange={(e) =>
                              updateTargetMod({
                                imagePosX: Number(e.target.value),
                              })
                            }
                            className="w-full accent-[#0D9488]"
                          />
                        </label>

                        <label className="block space-y-1">
                          <div className="flex items-center justify-between text-[11px] text-zinc-500">
                            <span>Смещение по Y</span>
                            <span className="font-mono tabular-nums">
                              {imgY}px
                            </span>
                          </div>
                          <input
                            type="range"
                            min={-60}
                            max={60}
                            step={1}
                            value={imgY}
                            onChange={(e) =>
                              updateTargetMod({
                                imagePosY: Number(e.target.value),
                              })
                            }
                            className="w-full accent-[#0D9488]"
                          />
                        </label>
                      </div>
                    </div>
                  )}
                </div>

                <div className="shrink-0 px-5 py-3 border-t border-zinc-200 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setEditingModuleVisual(null)}
                    className="px-4 py-1.5 rounded-lg bg-[#0F766E] hover:bg-[#0D9488] text-white font-semibold"
                  >
                    Готово
                  </button>
                </div>
              </div>
            </div>
          );
        })()}
    </div>
  );
}
