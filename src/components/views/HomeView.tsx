import React, { useRef, useState } from 'react';
import {
  Copy,
  Download,
  Edit3,
  Eye,
  FolderOpen,
  Image as ImageIcon,
  Layers,
  Plus,
  Search,
  Trash2,
  Upload,
  Users,
  X,
} from 'lucide-react';
import {
  getJournalStatusMeta,
  JOURNAL_STATUS_OPTIONS,
} from '../../data/curriculumCatalog';
import {
  AgeCategory,
  JournalDocument,
  JournalStatus,
  StudentGroup,
} from '../../types/journal';
import { AppHeader, WorkspaceTab } from '../AppHeader';

interface HomeViewProps {
  journals: JournalDocument[];
  groups: StudentGroup[];
  onNavigate: (tab: WorkspaceTab) => void;
  onCreateNew: (ageCategory?: AgeCategory) => void;
  onOpenEditor: (id: string) => void;
  onOpenPreview: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onQuickDownload: (doc: JournalDocument) => void;
  onOpenMediaLibrary: () => void;
  onImportBackup: (file: File) => void;
  onExportAllBackup: () => void;
}

export function HomeView({
  journals,
  groups,
  onNavigate,
  onCreateNew,
  onOpenEditor,
  onOpenPreview,
  onDuplicate,
  onDelete,
  onQuickDownload,
  onOpenMediaLibrary,
  onImportBackup,
  onExportAllBackup,
}: HomeViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | JournalStatus>('all');
  const [groupFilter, setGroupFilter] = useState<string>('all');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const backupInputRef = useRef<HTMLInputElement | null>(null);

  const filtered = journals.filter((j) => {
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      j.resident.fullName.toLowerCase().includes(q) ||
      j.resident.mentorName.toLowerCase().includes(q);
    const matchesStatus =
      statusFilter === 'all' ? true : j.status === statusFilter;
    const matchesGroup =
      groupFilter === 'all' ? true : j.groupId === groupFilter;
    return matchesSearch && matchesStatus && matchesGroup;
  });

  const formatDate = (iso: string) => {
    try {
      return new Intl.DateTimeFormat('ru-RU', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }).format(new Date(iso));
    } catch {
      return '';
    }
  };

  const getGroupName = (groupId?: string) =>
    groupId ? groups.find((g) => g.id === groupId)?.name : undefined;

  return (
    <div className="min-h-screen bg-[#F6F6F3] text-[#18181B] flex flex-col">
      <AppHeader
        activeTab="home"
        onNavigate={onNavigate}
        onCreateNew={() => onCreateNew()}
        onOpenMediaLibrary={onOpenMediaLibrary}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      {/* MAIN CONTENT */}
      <main className="flex-1 max-w-[1320px] w-full mx-auto px-6 py-8 space-y-10">
        {/* Title + Search + Filters */}
        <section className="space-y-5">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
                Мои журналы
              </h1>
              <p className="text-sm text-zinc-500 mt-1">
                Персональные выпуски образовательного пути резидентов KIBERone
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Search by resident or mentor name */}
              <div className="relative">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Поиск резидента или наставника..."
                  className="w-60 pl-9 pr-3 py-2 rounded-lg bg-white border border-zinc-200 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-[#0D9488]"
                />
              </div>

              {/* Group filter */}
              {groups.length > 0 && (
                <select
                  value={groupFilter}
                  onChange={(e) => setGroupFilter(e.target.value)}
                  className="rounded-lg bg-white border border-zinc-200 px-3 py-2 text-xs text-zinc-700"
                >
                  <option value="all">Все группы</option>
                  {groups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>
              )}

              {/* Status filter */}
              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as 'all' | JournalStatus)
                }
                className="rounded-lg bg-white border border-zinc-200 px-3 py-2 text-xs font-medium text-zinc-700"
              >
                <option value="all">Все статусы</option>
                {JOURNAL_STATUS_OPTIONS.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Journals Grid */}
          {filtered.length === 0 ? (
            <div className="bg-white border border-zinc-200 rounded-2xl py-16 px-6 text-center">
              <p className="text-sm font-medium text-zinc-700">
                Журналы по вашему запросу не найдены
              </p>
              <p className="text-xs text-zinc-500 mt-1">
                Создайте новый выпуск или измените параметры поиска.
              </p>
              <button
                type="button"
                onClick={() => onCreateNew()}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0D9488] text-white text-xs font-semibold hover:bg-[#0F766E]"
              >
                <Plus className="w-4 h-4" />
                <span>Создать журнал</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((journal) => {
                const grpName = getGroupName(journal.groupId);
                return (
                  <div
                    key={journal.id}
                    className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:border-zinc-300 transition-colors flex flex-col justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h2 className="text-base font-bold text-zinc-900 truncate">
                            {journal.resident.fullName}
                          </h2>
                          <div className="text-xs text-zinc-500 mt-0.5 flex items-center gap-1.5">
                            <span>{journal.resident.period}</span>
                            <span aria-hidden="true">·</span>
                            <span>{journal.resident.ageCategory} лет</span>
                          </div>
                          {grpName && (
                            <div className="mt-1 inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded bg-[#F6F6F3] text-zinc-600">
                              <Users className="w-2.5 h-2.5" />
                              <span className="truncate max-w-[180px]">{grpName}</span>
                            </div>
                          )}
                        </div>

                        {(() => {
                          const statusMeta = getJournalStatusMeta(journal.status);
                          return (
                            <span
                              className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border whitespace-nowrap shrink-0 ${statusMeta.badgeClass}`}
                            >
                              {statusMeta.label}
                            </span>
                          );
                        })()}
                      </div>

                      <div className="mt-4 pt-3 border-t border-zinc-100 text-xs text-zinc-500 space-y-1">
                        <div>Наставник: {journal.resident.mentorName}</div>
                        <div className="flex items-center justify-between text-[11px] text-zinc-400">
                          <span>
                            Модулей: {journal.page1.modules.filter((m) => !m.hidden).length} · Проектов:{' '}
                            {journal.page1.projects.filter((p) => !p.hidden).length}
                          </span>
                          <span>Изменён: {formatDate(journal.updatedAt)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-zinc-100">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onOpenEditor(journal.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Открыть</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => onOpenPreview(journal.id)}
                          className="p-1.5 rounded-lg border border-zinc-200 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 transition-colors"
                          title="Предпросмотр"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => onQuickDownload(journal)}
                          className="p-1.5 rounded-lg text-zinc-500 hover:text-[#0D9488] hover:bg-zinc-50 transition-colors"
                          title="Скачать PDF"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDuplicate(journal.id)}
                          className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 transition-colors"
                          title="Дублировать"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        {confirmDeleteId === journal.id ? (
                          <button
                            type="button"
                            onClick={() => {
                              onDelete(journal.id);
                              setConfirmDeleteId(null);
                            }}
                            className="px-2 py-1 rounded-md bg-red-600 text-white text-[11px] font-medium hover:bg-red-700"
                          >
                            Удалить?
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(journal.id)}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors"
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
          )}
        </section>

        {/* QUICK WORKFLOW CARDS */}
        <section className="pt-4 border-t border-zinc-200 grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Groups & Bulk Workflow */}
          <div className="bg-white border border-zinc-200 rounded-2xl p-6 flex flex-col justify-between gap-4">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#0D9488]">
                <Users className="w-4 h-4" />
                <span>Групповая работа</span>
              </div>
              <h3 className="text-base font-bold text-zinc-900">
                Массовое создание и ZIP-выгрузка
              </h3>
              <p className="text-xs text-zinc-500">
                Создайте журналы сразу для всей группы за 7 шагов или выгрузите все PDF одним архивом.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('groups')}
              className="self-start inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-xs font-semibold text-zinc-900"
            >
              <span>Перейти к группам ({groups.length})</span>
            </button>
          </div>

          {/* Media Library Card */}
          <div className="bg-white border border-zinc-200 rounded-2xl p-6 flex flex-col justify-between gap-4">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#0D9488]">
                <ImageIcon className="w-4 h-4" />
                <span>Медиатека</span>
              </div>
              <h3 className="text-base font-bold text-zinc-900">
                Иллюстрации, маскоты и скриншоты
              </h3>
              <p className="text-xs text-zinc-500">
                Логотип KIBERone, позы медведя и ваши файлы PNG/JPG/WEBP с разбивкой по темам.
              </p>
            </div>
            <button
              type="button"
              onClick={onOpenMediaLibrary}
              className="self-start inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-xs font-semibold text-zinc-900"
            >
              <FolderOpen className="w-4 h-4" />
              <span>Открыть медиатеку</span>
            </button>
          </div>

          {/* Age Templates Card */}
          <div className="bg-white border border-zinc-200 rounded-2xl p-6 flex flex-col justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-700">
                <Layers className="w-4 h-4 text-[#0D9488]" />
                <span>Быстрый старт по возрасту</span>
              </div>
              <h3 className="text-base font-bold text-zinc-900">
                Создать с возрастной адаптацией
              </h3>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { id: '8-10', label: '8–10', note: 'Яркий' },
                  { id: '11-13', label: '11–13', note: 'Баланс' },
                  { id: '14-15', label: '14–15', note: 'Техно' },
                ] as const
              ).map((tpl) => (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => onCreateNew(tpl.id)}
                  className="text-left p-2.5 rounded-xl border border-zinc-200 hover:border-[#0D9488] hover:bg-[#0D9488]/4 transition-colors"
                >
                  <div className="text-xs font-bold text-zinc-900">{tpl.label}</div>
                  <div className="text-[10px] text-zinc-500">{tpl.note}</div>
                </button>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* SETTINGS & FULL JSON BACKUP MODAL */}
      {settingsOpen && (
        <div className="fixed inset-0 z-50 bg-zinc-900/40 backdrop-blur-[2px] flex items-center justify-center p-6">
          <div className="bg-white border border-zinc-200 rounded-2xl shadow-xl w-full max-w-md p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-zinc-900">
                Настройки и полное резервное копирование
              </h2>
              <button
                type="button"
                onClick={() => setSettingsOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-zinc-600 leading-relaxed">
              Все журналы, группы, резиденты, библиотека модулей, шаблоны и
              загруженные изображения хранятся локально в IndexedDB. Скачайте полную
              резервную копию JSON (включая встроенные изображения) для переноса на другой компьютер.
            </p>

            <div className="space-y-2.5">
              <button
                type="button"
                onClick={onExportAllBackup}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Скачать полный бэкап (JSON)</span>
              </button>

              <button
                type="button"
                onClick={() => backupInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-900 text-xs font-semibold transition-colors"
              >
                <Upload className="w-4 h-4" />
                <span>Восстановить базу из JSON</span>
              </button>
              <input
                ref={backupInputRef}
                type="file"
                accept="application/json"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    onImportBackup(file);
                    setSettingsOpen(false);
                  }
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
