import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowRightLeft,
  Calendar,
  Edit3,
  FolderArchive,
  FolderOpen,
  Image as ImageIcon,
  Loader2,
  MapPin,
  Plus,
  Search,
  Trash2,
  UserMinus,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import {
  AgeCategory,
  Branch,
  JournalDocument,
  ResidentRecord,
  StudentGroup,
} from '../../types/journal';
import {
  AnalyzedBackupImport,
  ConflictResolutionChoice,
} from '../../utils/backupMerge';
import {
  computeJournalProgress,
  formatGroupPeriod,
} from '../../utils/journalProgress';
import { AppHeader, WorkspaceTab } from '../AppHeader';
import { BackupRestoreModal } from '../BackupRestoreModal';

interface HomeViewProps {
  branches: Branch[];
  groups: StudentGroup[];
  residents: ResidentRecord[];
  journals: JournalDocument[];
  onNavigate: (tab: WorkspaceTab) => void;
  onOpenGroupEditor: (
    groupId: string,
    journalId?: string | null,
    studentId?: string | null
  ) => void;
  onSaveGroup: (group: StudentGroup) => Promise<void>;
  onDeleteGroup: (groupId: string) => Promise<void>;
  onSaveBranch: (branch: Branch) => Promise<void>;
  onDeleteBranch: (branchId: string) => Promise<void>;
  onQuickAddStudent: (
    groupId: string,
    fullName: string,
    age?: string
  ) => Promise<void>;
  onTransferStudent: (
    residentId: string,
    targetGroupId: string
  ) => Promise<void>;
  onDeleteStudent: (residentId: string) => Promise<void>;
  onOpenMediaLibrary: () => void;
  templatesCount: number;
  mediaCount: number;
  onExecuteImport: (
    analysis: AnalyzedBackupImport,
    conflictChoices: Record<string, ConflictResolutionChoice>
  ) => Promise<void>;
  onRollbackSafetyBackup: () => Promise<void>;
  onExportAllBackup: () => Promise<void>;
  onBatchExportGroupZip: (group: StudentGroup) => Promise<void> | void;
  batchProgress?: {
    active: boolean;
    current: number;
    total: number;
    groupName: string;
    groupId?: string;
  } | null;
  openCreateGroupSignal?: number;
  helpTrigger?: React.ReactNode;
}

const AVATAR_TONES = [
  'bg-[#CCFBF1] text-[#0F766E]',
  'bg-[#FEF3C7] text-[#92400E]',
  'bg-[#E0F2FE] text-[#0369A1]',
  'bg-[#FCE7F3] text-[#9D174D]',
  'bg-[#EDE9FE] text-[#5B21B6]',
];

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export function HomeView({
  branches,
  groups,
  residents,
  journals,
  onNavigate,
  onOpenGroupEditor,
  onSaveGroup,
  onDeleteGroup,
  onSaveBranch,
  onDeleteBranch,
  onQuickAddStudent,
  onTransferStudent,
  onDeleteStudent,
  onOpenMediaLibrary,
  templatesCount,
  mediaCount,
  onExecuteImport,
  onRollbackSafetyBackup,
  onExportAllBackup,
  onBatchExportGroupZip,
  batchProgress,
  openCreateGroupSignal = 0,
  helpTrigger,
}: HomeViewProps) {
  const [branchFilter, setBranchFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [branchesModalOpen, setBranchesModalOpen] = useState(false);

  // Create/Edit Group Modal
  const [groupModal, setGroupModal] = useState<StudentGroup | null>(null);

  // Quick Add Student state (per group card or modal)
  const [addStudentGroupId, setAddStudentGroupId] = useState<string | null>(null);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentAge, setNewStudentAge] = useState('');

  // Transfer Student Modal state
  const [transferModal, setTransferModal] = useState<{
    sourceGroupId: string;
    residentId: string;
    targetGroupId: string;
  } | null>(null);

  // Inline Delete Student confirmation state ("Удалить? Да/Нет")
  const [deleteStudentBar, setDeleteStudentBar] = useState<{
    groupId: string;
    residentId: string;
  } | null>(null);

  // Group delete confirmation state
  const [confirmDeleteGroupId, setConfirmDeleteGroupId] = useState<string | null>(
    null
  );

  // New Branch form state
  const [newBranchName, setNewBranchName] = useState('');
  const [newBranchAddress, setNewBranchAddress] = useState('');

  const branchById = useMemo(
    () => new Map(branches.map((b) => [b.id, b])),
    [branches]
  );

  const filteredGroups = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return groups.filter((grp) => {
      const matchesBranch =
        branchFilter === 'all' ? true : grp.branchId === branchFilter;
      const matchesSearch =
        !q ||
        grp.name.toLowerCase().includes(q) ||
        grp.mentorName.toLowerCase().includes(q);
      return matchesBranch && matchesSearch;
    });
  }, [groups, branchFilter, searchQuery]);

  const openCreateGroupModal = () => {
    const now = new Date().toISOString();
    const defaultBranch =
      branchFilter !== 'all' ? branchFilter : branches[0]?.id || 'branch-1';
    setGroupModal({
      id: `grp-${Date.now()}`,
      name: '',
      branchId: defaultBranch,
      mentorName: '',
      startDate: '2026-09-01',
      endDate: '2026-12-25',
      ageCategory: '9-11',
      createdAt: now,
      updatedAt: now,
    });
  };

  useEffect(() => {
    if (openCreateGroupSignal > 0) {
      openCreateGroupModal();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openCreateGroupSignal]);

  const findStudentJournal = (res: ResidentRecord): JournalDocument | undefined => {
    if (res.journalId) {
      const byId = journals.find((j) => j.id === res.journalId);
      if (byId) return byId;
    }
    return journals.find((j) => j.residentId === res.id);
  };

  return (
    <div className="min-h-screen bg-[#F6F6F3] text-[#18181B] flex flex-col">
      <AppHeader
        activeTab="home"
        onNavigate={onNavigate}
        onCreateGroup={openCreateGroupModal}
        onOpenMediaLibrary={onOpenMediaLibrary}
        onOpenSettings={() => setSettingsOpen(true)}
        helpTrigger={helpTrigger}
      />

      <main className="flex-1 max-w-[1360px] w-full mx-auto px-6 py-8 space-y-8">
        {/* TOP FILTER BAR: BRANCHES + GROUP SEARCH */}
        <section className="space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
                Дашборд наставника
              </h1>
              <p className="text-sm text-zinc-500 mt-1">
                Управляйте учебными группами, заполняйте общую программу и индивидуальные достижения учеников
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <div className="relative">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Поиск по названию группы..."
                  className="w-64 pl-9 pr-3 py-2 rounded-lg bg-white border border-zinc-200 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-[#0D9488]"
                />
              </div>

              <button
                type="button"
                onClick={() => setBranchesModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-xs font-medium text-zinc-700 transition-colors whitespace-nowrap shrink-0"
              >
                <MapPin className="w-3.5 h-3.5 text-[#0D9488]" />
                <span>Локации ({branches.length})</span>
              </button>
            </div>
          </div>

          {/* Branch Filter Segmented Bar */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex flex-wrap items-center gap-1 p-1 bg-white rounded-xl border border-zinc-200">
              <button
                type="button"
                onClick={() => setBranchFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                  branchFilter === 'all'
                    ? 'bg-[#0D9488] text-white'
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'
                }`}
              >
                Все локации ({groups.length})
              </button>
              {branches.map((branch) => {
                const count = groups.filter((g) => g.branchId === branch.id).length;
                const active = branchFilter === branch.id;
                return (
                  <button
                    key={branch.id}
                    type="button"
                    onClick={() => setBranchFilter(branch.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                      active
                        ? 'bg-[#0D9488] text-white'
                        : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'
                    }`}
                  >
                    <MapPin className="w-3 h-3" />
                    <span>{branch.name}</span>
                    <span className="tabular-nums opacity-80">({count})</span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* GROUP CARDS GRID */}
        <section>
          {filteredGroups.length === 0 ? (
            <div className="bg-white border border-zinc-200 rounded-2xl py-16 px-6 text-center">
              <p className="text-sm font-semibold text-zinc-800">
                Группы по выбранным параметрам не найдены
              </p>
              <p className="text-xs text-zinc-500 mt-1">
                Создайте новую учебную группу или сбросьте фильтр по локациям.
              </p>
              <button
                type="button"
                onClick={openCreateGroupModal}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0D9488] text-white text-xs font-semibold hover:bg-[#0F766E]"
              >
                <Plus className="w-4 h-4" />
                <span>Создать группу</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {filteredGroups.map((group, groupIndex) => {
                const branch = branchById.get(group.branchId);
                const groupStudents = residents.filter(
                  (r) => r.groupId === group.id
                );
                const activeStudents = groupStudents.filter(
                  (r) => r.status === 'active'
                );

                const readyCount = activeStudents.filter((st) => {
                  const j = findStudentJournal(st);
                  if (!j) return false;
                  const prog = computeJournalProgress(j);
                  return prog.statusLevel === 'ready';
                }).length;

                const totalCount = activeStudents.length;
                const progressPct =
                  totalCount > 0 ? Math.round((readyCount / totalCount) * 100) : 0;

                const isAddingHere = addStudentGroupId === group.id;
                const isDeletingHere = deleteStudentBar?.groupId === group.id;

                return (
                  <article
                    key={group.id}
                    data-tour-id={groupIndex === 0 ? 'home-group-card' : undefined}
                    className="bg-white border border-zinc-200 rounded-2xl p-5 flex flex-col justify-between gap-4 hover:border-zinc-300 transition-colors overflow-hidden min-w-0"
                  >
                    {/* Top: Group Info */}
                    <div className="space-y-3.5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h2
                            onClick={() => onOpenGroupEditor(group.id)}
                            className="text-base font-bold text-zinc-900 truncate cursor-pointer hover:text-[#0D9488] transition-colors"
                          >
                            {group.name}
                          </h2>

                          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-zinc-500">
                            <span className="inline-flex items-center gap-1 text-zinc-700 font-medium">
                              <MapPin className="w-3.5 h-3.5 text-[#0D9488] shrink-0" />
                              <span>{branch ? branch.name : 'Локация не указана'}</span>
                            </span>
                            {branch?.address && (
                              <>
                                <span aria-hidden="true">·</span>
                                <span>{branch.address}</span>
                              </>
                            )}
                          </div>

                          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-zinc-500">
                            <span className="inline-flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                              <span className="tabular-nums">
                                {formatGroupPeriod(group.startDate, group.endDate)}
                              </span>
                            </span>
                            <span aria-hidden="true">·</span>
                            <span>Наставник: {group.mentorName || 'Не указан'}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => setGroupModal({ ...group })}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-zinc-50 transition-colors"
                            title="Редактировать параметры группы"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          {confirmDeleteGroupId === group.id ? (
                            <div className="flex items-center gap-1 bg-red-50 border border-red-200 rounded-lg px-2 py-1 text-[11px]">
                              <span className="text-red-700 font-medium">Удалить?</span>
                              <button
                                type="button"
                                onClick={async () => {
                                  await onDeleteGroup(group.id);
                                  setConfirmDeleteGroupId(null);
                                }}
                                className="px-1.5 py-0.5 rounded bg-red-600 text-white font-semibold hover:bg-red-700"
                              >
                                Да
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteGroupId(null)}
                                className="px-1.5 py-0.5 rounded bg-white text-zinc-700 border border-zinc-200 hover:bg-zinc-50"
                              >
                                Нет
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteGroupId(group.id)}
                              className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                              title="Удалить группу"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="pt-2.5 border-t border-zinc-100 space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-zinc-600">
                            Готовность журналов
                          </span>
                          <span className="font-semibold text-zinc-900 tabular-nums">
                            Готово {readyCount} из {totalCount} журналов
                          </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-zinc-100 overflow-hidden">
                          <div
                            style={{ width: `${progressPct}%` }}
                            className="h-full rounded-full bg-[#0D9488] transition-all duration-200"
                          />
                        </div>
                      </div>

                      {/* Students List (Avatars + Names) */}
                      <div className="pt-2 border-t border-zinc-100 space-y-2">
                        <div className="flex items-center justify-between text-xs text-zinc-500">
                          <span className="font-medium">
                            Ученики в группе ({activeStudents.length})
                          </span>
                          <span className="tabular-nums text-[11px]">
                            Возраст: {group.ageCategory} лет
                          </span>
                        </div>

                        {activeStudents.length === 0 ? (
                          <div className="py-3 text-center rounded-xl bg-[#F6F6F3] text-xs text-zinc-500">
                            В группе пока нет учеников
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-1.5">
                            {activeStudents.slice(0, 8).map((student, idx) => {
                              const j = findStudentJournal(student);
                              const prog = j ? computeJournalProgress(j) : null;
                              const dotColor =
                                prog?.statusLevel === 'ready'
                                  ? 'bg-emerald-500'
                                  : prog?.statusLevel === 'in_progress'
                                  ? 'bg-amber-400'
                                  : 'bg-red-500';
                              return (
                                <button
                                  key={student.id}
                                  type="button"
                                  onClick={() =>
                                    onOpenGroupEditor(
                                      group.id,
                                      j?.id ?? null,
                                      student.id
                                    )
                                  }
                                  title={`${student.fullName} — ${
                                    prog ? prog.label : 'Не начат'
                                  }`}
                                  className="inline-flex items-center gap-1.5 pr-2.5 pl-1 py-1 rounded-lg bg-[#F6F6F3] hover:bg-[#ECFDF5] border border-zinc-200/80 text-xs text-zinc-800 transition-colors"
                                >
                                  <span
                                    className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0 ${
                                      AVATAR_TONES[idx % AVATAR_TONES.length]
                                    }`}
                                  >
                                    {getInitials(student.fullName)}
                                  </span>
                                  <span className="truncate max-w-[110px] font-medium">
                                    {student.fullName}
                                  </span>
                                  <span
                                    className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColor}`}
                                  />
                                </button>
                              );
                            })}
                            {activeStudents.length > 8 && (
                              <span className="inline-flex items-center px-2 py-1 text-xs text-zinc-500 tabular-nums">
                                +{activeStudents.length - 8} ещё
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Inline Quick Add Student Form */}
                      {isAddingHere && (
                        <form
                          onSubmit={async (e) => {
                            e.preventDefault();
                            if (!newStudentName.trim()) return;
                            await onQuickAddStudent(
                              group.id,
                              newStudentName.trim(),
                              newStudentAge.trim() || undefined
                            );
                            setNewStudentName('');
                            setNewStudentAge('');
                            setAddStudentGroupId(null);
                          }}
                          className="p-3 rounded-xl bg-[#F0FDFA] border border-[#99F6E4] space-y-2 text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-[#0F766E]">
                              Быстрое добавление ученика
                            </span>
                            <button
                              type="button"
                              onClick={() => setAddStudentGroupId(null)}
                              className="text-zinc-400 hover:text-zinc-700"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              required
                              autoFocus
                              value={newStudentName}
                              onChange={(e) => setNewStudentName(e.target.value)}
                              placeholder="Имя и фамилия ученика"
                              className="flex-1 rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#0D9488]"
                            />
                            <input
                              type="text"
                              value={newStudentAge}
                              onChange={(e) => setNewStudentAge(e.target.value)}
                              placeholder="Возраст"
                              className="w-20 rounded-lg border border-zinc-200 bg-white px-2 py-1.5 text-xs focus:outline-none focus:border-[#0D9488]"
                            />
                          </div>
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setAddStudentGroupId(null)}
                              className="px-2.5 py-1 rounded-md border border-zinc-200 bg-white text-zinc-600"
                            >
                              Отмена
                            </button>
                            <button
                              type="submit"
                              className="px-3 py-1 rounded-md bg-[#0D9488] text-white font-semibold hover:bg-[#0F766E]"
                            >
                              Добавить
                            </button>
                          </div>
                        </form>
                      )}

                      {/* Inline Delete Student Bar with Mandatory "Удалить? Да/Нет" */}
                      {isDeletingHere && activeStudents.length > 0 && (
                        <div className="p-3 rounded-xl bg-red-50 border border-red-200 space-y-2 text-xs">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-semibold text-red-800">
                              Удалить ученика из группы
                            </span>
                            <button
                              type="button"
                              onClick={() => setDeleteStudentBar(null)}
                              className="text-red-400 hover:text-red-700"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <select
                            value={deleteStudentBar.residentId}
                            onChange={(e) =>
                              setDeleteStudentBar({
                                groupId: group.id,
                                residentId: e.target.value,
                              })
                            }
                            className="w-full rounded-lg border border-red-200 bg-white px-2.5 py-1.5 text-xs text-zinc-900"
                          >
                            {activeStudents.map((st) => (
                              <option key={st.id} value={st.id}>
                                {st.fullName}
                              </option>
                            ))}
                          </select>
                          <div className="flex items-center justify-between gap-2 pt-0.5">
                            <span className="font-semibold text-red-800">
                              Удалить?
                            </span>
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={async () => {
                                  await onDeleteStudent(deleteStudentBar.residentId);
                                  setDeleteStudentBar(null);
                                }}
                                className="px-3 py-1 rounded-md bg-red-600 hover:bg-red-700 text-white font-semibold"
                              >
                                Да
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteStudentBar(null)}
                                className="px-3 py-1 rounded-md bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50 font-medium"
                              >
                                Нет
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Card Footer Actions */}
                    <div className="pt-3 border-t border-zinc-100 space-y-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => onOpenGroupEditor(group.id)}
                          className="w-full min-w-0 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-semibold transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">Открыть редактор группы</span>
                        </button>
                        <button
                          type="button"
                          disabled={Boolean(batchProgress?.active)}
                          onClick={() => onBatchExportGroupZip(group)}
                          className="w-full min-w-0 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 text-white text-xs font-semibold transition-colors"
                          title="Выгрузить готовые журналы группы в ZIP-архив"
                        >
                          {batchProgress?.active &&
                          batchProgress.groupId === group.id ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
                              <span className="tabular-nums truncate">
                                {batchProgress.current}/{batchProgress.total}
                              </span>
                            </>
                          ) : (
                            <>
                              <FolderArchive className="w-3.5 h-3.5 shrink-0" />
                              <span className="truncate">Выгрузить готовые (ZIP)</span>
                            </>
                          )}
                        </button>
                      </div>

                      <div className="grid grid-cols-3 gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setDeleteStudentBar(null);
                            setAddStudentGroupId(
                              isAddingHere ? null : group.id
                            );
                            setNewStudentName('');
                            setNewStudentAge('');
                          }}
                          className="inline-flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-[11px] font-medium text-zinc-700 whitespace-nowrap"
                          title="Добавить ученика по имени"
                        >
                          <UserPlus className="w-3.5 h-3.5 text-[#0D9488] shrink-0" />
                          <span className="truncate">Добавить ученика</span>
                        </button>

                        <button
                          type="button"
                          disabled={
                            activeStudents.length === 0 || groups.length < 2
                          }
                          onClick={() => {
                            const orderedFirst =
                              branches
                                .flatMap((br) =>
                                  groups.filter(
                                    (g) => g.id !== group.id && g.branchId === br.id
                                  )
                                )[0] ?? groups.find((g) => g.id !== group.id);
                            if (!orderedFirst || activeStudents.length === 0) return;
                            setTransferModal({
                              sourceGroupId: group.id,
                              residentId: activeStudents[0].id,
                              targetGroupId: orderedFirst.id,
                            });
                          }}
                          className="inline-flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 disabled:opacity-45 text-[11px] font-medium text-zinc-700 whitespace-nowrap"
                          title="Перевести ученика в другую группу"
                        >
                          <ArrowRightLeft className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                          <span className="truncate">Перевести</span>
                        </button>

                        <button
                          type="button"
                          disabled={activeStudents.length === 0}
                          onClick={() => {
                            if (activeStudents.length === 0) return;
                            setAddStudentGroupId(null);
                            setDeleteStudentBar(
                              isDeletingHere
                                ? null
                                : {
                                    groupId: group.id,
                                    residentId: activeStudents[0].id,
                                  }
                            );
                          }}
                          className="inline-flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg border border-zinc-200 bg-white hover:bg-red-50 hover:border-red-200 hover:text-red-700 disabled:opacity-45 text-[11px] font-medium text-zinc-700 whitespace-nowrap"
                          title="Удалить ученика из группы"
                        >
                          <UserMinus className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">Удалить ученика</span>
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* SECONDARY UTILITY STRIP */}
        <section className="pt-4 border-t border-zinc-200 grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-white border border-zinc-200 rounded-2xl p-5 flex items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0D9488]">
                <ImageIcon className="w-4 h-4" />
                <span>Медиатека школы</span>
              </div>
              <p className="text-xs text-zinc-500">
                Маскоты KIBERone, логотипы, иллюстрации модулей и скриншоты проектов учеников.
              </p>
            </div>
            <button
              type="button"
              onClick={onOpenMediaLibrary}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-zinc-200 bg-[#F6F6F3] hover:bg-zinc-100 text-xs font-semibold text-zinc-900 whitespace-nowrap shrink-0"
            >
              <FolderOpen className="w-4 h-4" />
              <span>Открыть медиатеку</span>
            </button>
          </div>

          <div className="bg-white border border-zinc-200 rounded-2xl p-5 flex items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0D9488]">
                <Users className="w-4 h-4" />
                <span>Учебная программа и шаблоны</span>
              </div>
              <p className="text-xs text-zinc-500">
                Каталог модулей KIBERone, навыки и палитры оформления для групповых журналов.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('modules')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-zinc-200 bg-[#F6F6F3] hover:bg-zinc-100 text-xs font-semibold text-zinc-900 whitespace-nowrap shrink-0"
            >
              <span>К программе</span>
            </button>
          </div>
        </section>
      </main>

      {/* CREATE / EDIT GROUP MODAL */}
      {groupModal && (
        <div className="fixed inset-0 z-50 bg-zinc-900/40 backdrop-blur-[2px] flex items-center justify-center p-6">
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!groupModal.name.trim()) return;
              const saved: StudentGroup = {
                ...groupModal,
                name: groupModal.name.trim(),
                mentorName: groupModal.mentorName.trim() || 'Наставник KIBERone',
                updatedAt: new Date().toISOString(),
              };
              await onSaveGroup(saved);
              setGroupModal(null);
            }}
            className="bg-white border border-zinc-200 rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4 text-xs"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-zinc-900">
                {groups.some((g) => g.id === groupModal.id)
                  ? 'Параметры учебной группы'
                  : 'Создать учебную группу'}
              </h2>
              <button
                type="button"
                onClick={() => setGroupModal(null)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <label className="block">
              <span className="font-semibold text-zinc-700">Название группы</span>
              <input
                type="text"
                required
                autoFocus
                value={groupModal.name}
                onChange={(e) =>
                  setGroupModal({ ...groupModal, name: e.target.value })
                }
                placeholder="Например: Python Start · Вт/Чт 16:00"
                className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 font-semibold focus:outline-none focus:border-[#0D9488]"
              />
            </label>

            <label className="block">
              <span className="font-semibold text-zinc-700">Локация (Филиал)</span>
              <select
                value={groupModal.branchId}
                onChange={(e) =>
                  setGroupModal({ ...groupModal, branchId: e.target.value })
                }
                className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 bg-white focus:outline-none focus:border-[#0D9488]"
              >
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.address})
                  </option>
                ))}
              </select>
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="font-semibold text-zinc-700">Дата начала</span>
                <input
                  type="date"
                  required
                  value={groupModal.startDate}
                  onChange={(e) =>
                    setGroupModal({ ...groupModal, startDate: e.target.value })
                  }
                  className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 focus:outline-none focus:border-[#0D9488]"
                />
              </label>
              <label className="block">
                <span className="font-semibold text-zinc-700">Дата окончания</span>
                <input
                  type="date"
                  required
                  value={groupModal.endDate}
                  onChange={(e) =>
                    setGroupModal({ ...groupModal, endDate: e.target.value })
                  }
                  className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 focus:outline-none focus:border-[#0D9488]"
                />
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="font-semibold text-zinc-700">Наставник</span>
                <input
                  type="text"
                  value={groupModal.mentorName}
                  onChange={(e) =>
                    setGroupModal({ ...groupModal, mentorName: e.target.value })
                  }
                  placeholder="Имя наставника"
                  className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 focus:outline-none focus:border-[#0D9488]"
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
                  className="mt-1 w-full rounded-lg border border-zinc-200 px-2.5 py-2 bg-white focus:outline-none focus:border-[#0D9488]"
                >
                  <option value="6-8">6–8 лет (Младшая)</option>
                  <option value="9-11">9–11 лет (Средняя)</option>
                  <option value="12-14">12–14 лет (Старшая)</option>
                  {(groupModal.ageCategory === '8-10' ||
                    groupModal.ageCategory === '11-13' ||
                    groupModal.ageCategory === '14-15') && (
                    <>
                      <option value="8-10">8–10 лет (архивная)</option>
                      <option value="11-13">11–13 лет (архивная)</option>
                      <option value="14-15">14–15 лет (архивная)</option>
                    </>
                  )}
                </select>
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setGroupModal(null)}
                className="px-4 py-2 rounded-lg border border-zinc-200 hover:bg-zinc-50 font-medium"
              >
                Отмена
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-[#0D9488] hover:bg-[#0F766E] text-white font-semibold"
              >
                Сохранить группу
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TRANSFER STUDENT MODAL */}
      {transferModal && (
        <div className="fixed inset-0 z-50 bg-zinc-900/40 backdrop-blur-[2px] flex items-center justify-center p-6">
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              await onTransferStudent(
                transferModal.residentId,
                transferModal.targetGroupId
              );
              setTransferModal(null);
            }}
            className="bg-white border border-zinc-200 rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4 text-xs"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-zinc-900">
                Перевести ученика в другую группу
              </h2>
              <button
                type="button"
                onClick={() => setTransferModal(null)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <label className="block">
              <span className="font-semibold text-zinc-700">Ученик</span>
              <select
                value={transferModal.residentId}
                onChange={(e) =>
                  setTransferModal({
                    ...transferModal,
                    residentId: e.target.value,
                  })
                }
                className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 bg-white"
              >
                {residents
                  .filter(
                    (r) =>
                      r.groupId === transferModal.sourceGroupId &&
                      r.status === 'active'
                  )
                  .map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.fullName} ({r.age})
                    </option>
                  ))}
              </select>
            </label>

            <label className="block">
              <span className="font-semibold text-zinc-700">Целевая группа</span>
              <select
                value={transferModal.targetGroupId}
                onChange={(e) =>
                  setTransferModal({
                    ...transferModal,
                    targetGroupId: e.target.value,
                  })
                }
                className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 bg-white"
              >
                {branches.map((br) => {
                  const branchGroups = groups.filter(
                    (g) => g.id !== transferModal.sourceGroupId && g.branchId === br.id
                  );
                  if (branchGroups.length === 0) return null;
                  const optgroupLabel = br.address
                    ? `${br.name} — ${br.address}`
                    : br.name;
                  return (
                    <optgroup key={br.id} label={optgroupLabel}>
                      {branchGroups.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.name}
                          {g.mentorName ? ` · Наставник: ${g.mentorName}` : ''}
                        </option>
                      ))}
                    </optgroup>
                  );
                })}
                {(() => {
                  const knownBranchIds = new Set(branches.map((b) => b.id));
                  const ungrouped = groups.filter(
                    (g) =>
                      g.id !== transferModal.sourceGroupId &&
                      !knownBranchIds.has(g.branchId)
                  );
                  if (ungrouped.length === 0) return null;
                  return (
                    <optgroup label="Другие локации">
                      {ungrouped.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.name}
                          {g.mentorName ? ` · Наставник: ${g.mentorName}` : ''}
                        </option>
                      ))}
                    </optgroup>
                  );
                })()}
              </select>
            </label>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setTransferModal(null)}
                className="px-4 py-2 rounded-lg border border-zinc-200 hover:bg-zinc-50"
              >
                Отмена
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-[#0D9488] hover:bg-[#0F766E] text-white font-semibold"
              >
                Перевести
              </button>
            </div>
          </form>
        </div>
      )}

      {/* BRANCHES DIRECTORY MODAL */}
      {branchesModalOpen && (
        <div className="fixed inset-0 z-50 bg-zinc-900/40 backdrop-blur-[2px] flex items-center justify-center p-6">
          <div className="bg-white border border-zinc-200 rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-zinc-900">
                Справочник локаций (филиалов)
              </h2>
              <button
                type="button"
                onClick={() => setBranchesModalOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {branches.map((br) => (
                <div
                  key={br.id}
                  className="p-3 rounded-xl border border-zinc-200 bg-[#F9F9F7] flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="font-bold text-zinc-900">{br.name}</div>
                    <div className="text-zinc-500">{br.address}</div>
                  </div>
                  {branches.length > 1 && (
                    <button
                      type="button"
                      onClick={() => onDeleteBranch(br.id)}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50"
                      title="Удалить локацию"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!newBranchName.trim()) return;
                const now = new Date().toISOString();
                await onSaveBranch({
                  id: `branch-${Date.now()}`,
                  name: newBranchName.trim(),
                  address: newBranchAddress.trim(),
                  createdAt: now,
                  updatedAt: now,
                });
                setNewBranchName('');
                setNewBranchAddress('');
              }}
              className="pt-3 border-t border-zinc-200 space-y-2.5"
            >
              <div className="font-semibold text-zinc-800">
                Добавить новый филиал
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  required
                  value={newBranchName}
                  onChange={(e) => setNewBranchName(e.target.value)}
                  placeholder="Название (например, Локация 3)"
                  className="rounded-lg border border-zinc-200 px-3 py-2"
                />
                <input
                  type="text"
                  value={newBranchAddress}
                  onChange={(e) => setNewBranchAddress(e.target.value)}
                  placeholder="Улица, дом"
                  className="rounded-lg border border-zinc-200 px-3 py-2"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0D9488] hover:bg-[#0F766E] text-white font-semibold"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Добавить локацию</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BACKUP, RESTORE & STORAGE MODAL */}
      {settingsOpen && (
        <BackupRestoreModal
          counts={{
            branches: branches.length,
            groups: groups.length,
            residents: residents.length,
            journals: journals.length,
            templates: templatesCount,
            media: mediaCount,
          }}
          onCreateBackup={onExportAllBackup}
          onExecuteImport={onExecuteImport}
          onRollbackSafetyBackup={onRollbackSafetyBackup}
          onClose={() => setSettingsOpen(false)}
        />
      )}
    </div>
  );
}
