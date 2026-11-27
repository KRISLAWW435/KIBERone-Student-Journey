import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Database,
  Download,
  FileArchive,
  GitMerge,
  HardDrive,
  History,
  Laptop,
  Loader2,
  Monitor,
  RotateCcw,
  ShieldCheck,
  Upload,
  X,
} from 'lucide-react';
import {
  analyzeBackupImport,
  AnalyzedBackupImport,
  AutoSafetyBackupRecord,
  BackupImportMode,
  ConflictResolutionChoice,
  getLastAutoSafetyBackup,
} from '../utils/backupMerge';
import {
  formatStorageBytes,
  getStorageStatus,
  inspectBackupFile,
  InspectedBackupArchive,
  requestPersistentStorage,
  StorageStatusInfo,
} from '../utils/backupService';

interface BackupRestoreModalProps {
  counts: {
    branches: number;
    groups: number;
    residents: number;
    journals: number;
    templates: number;
    media: number;
  };
  onCreateBackup: () => Promise<void>;
  onExecuteImport: (
    analysis: AnalyzedBackupImport,
    conflictChoices: Record<string, ConflictResolutionChoice>
  ) => Promise<void>;
  onRollbackSafetyBackup: () => Promise<void>;
  onClose: () => void;
}

type UiImportMode = Extract<BackupImportMode, 'merge' | 'replace'>;

const IMPORT_MODE_OPTIONS: Array<{
  id: UiImportMode;
  label: string;
  badge?: string;
  description: string;
  icon: React.ReactNode;
}> = [
  {
    id: 'merge',
    label: 'Перенести и объединить данные',
    badge: 'Основной режим',
    description:
      'Для переноса между компьютерами. Добавит новые группы, учеников, журналы и фото, обновит изменившиеся записи и покажет спорные места. Всё, что уже есть здесь, сохранится.',
    icon: <GitMerge className="w-4 h-4 text-[#0D9488]" />,
  },
  {
    id: 'replace',
    label: 'Полностью восстановить базу',
    description:
      'Полностью заменит текущие данные на этом компьютере копией из файла. Используйте, если нужно целиком восстановить старую копию или перенести всё на чистый компьютер.',
    icon: <RotateCcw className="w-4 h-4 text-amber-600" />,
  },
];

function formatDateTime(iso?: string): string {
  if (!iso) return 'не указана';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatSourceOrigin(platform: string): string {
  return platform === 'electron'
    ? 'из программы на другом компьютере'
    : 'с другого компьютера (через сайт)';
}

export function BackupRestoreModal({
  counts,
  onCreateBackup,
  onExecuteImport,
  onRollbackSafetyBackup,
  onClose,
}: BackupRestoreModalProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [storageStatus, setStorageStatus] = useState<StorageStatusInfo | null>(
    null
  );
  const [requestingPersist, setRequestingPersist] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [inspecting, setInspecting] = useState(false);
  const [applying, setApplying] = useState(false);
  const [rollingBack, setRollingBack] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [selectedMode, setSelectedMode] = useState<UiImportMode>('merge');
  const [inspectedArchive, setInspectedArchive] =
    useState<InspectedBackupArchive | null>(null);
  const [analysis, setAnalysis] = useState<AnalyzedBackupImport | null>(null);
  const [conflictChoices, setConflictChoices] = useState<
    Record<string, ConflictResolutionChoice>
  >({});
  const [safetyBackup, setSafetyBackup] =
    useState<AutoSafetyBackupRecord | null>(() => getLastAutoSafetyBackup());

  const refreshStorageStatus = useCallback(async () => {
    const status = await getStorageStatus();
    setStorageStatus(status);
  }, []);

  useEffect(() => {
    void refreshStorageStatus();
  }, [refreshStorageStatus]);

  const runAnalysis = useCallback(
    async (archive: InspectedBackupArchive, mode: UiImportMode) => {
      setInspecting(true);
      setErrorMessage(null);
      try {
        const nextAnalysis = await analyzeBackupImport(archive, mode);
        setAnalysis(nextAnalysis);
        const initialChoices: Record<string, ConflictResolutionChoice> = {};
        for (const c of nextAnalysis.conflicts) {
          initialChoices[c.key] = 'unresolved';
        }
        setConflictChoices(initialChoices);
      } catch (err) {
        setErrorMessage(
          err instanceof Error
            ? err.message
            : 'Не удалось проверить изменения из резервной копии.'
        );
      } finally {
        setInspecting(false);
      }
    },
    []
  );

  const handleModeChange = async (mode: UiImportMode) => {
    setSelectedMode(mode);
    if (inspectedArchive) {
      await runAnalysis(inspectedArchive, mode);
    }
  };

  const handleRequestPersist = async () => {
    setRequestingPersist(true);
    try {
      const updated = await requestPersistentStorage();
      setStorageStatus(updated);
    } finally {
      setRequestingPersist(false);
    }
  };

  const handleExportClick = async () => {
    setErrorMessage(null);
    setExporting(true);
    try {
      await onCreateBackup();
      await refreshStorageStatus();
    } catch (err) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : 'Не удалось сохранить файл резервной копии.'
      );
    } finally {
      setExporting(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setErrorMessage(null);
    setInspecting(true);
    try {
      const inspected = await inspectBackupFile(file);
      setInspectedArchive(inspected);
      const nextAnalysis = await analyzeBackupImport(inspected, selectedMode);
      setAnalysis(nextAnalysis);
      const initialChoices: Record<string, ConflictResolutionChoice> = {};
      for (const c of nextAnalysis.conflicts) {
        initialChoices[c.key] = 'unresolved';
      }
      setConflictChoices(initialChoices);
    } catch (err) {
      setInspectedArchive(null);
      setAnalysis(null);
      setErrorMessage(
        err instanceof Error
          ? err.message
          : 'Не удалось открыть выбранный файл резервной копии.'
      );
    } finally {
      setInspecting(false);
    }
  };

  const unresolvedConflictsCount = analysis
    ? analysis.conflicts.filter(
        (c) => (conflictChoices[c.key] ?? 'unresolved') === 'unresolved'
      ).length
    : 0;

  const handleConfirmImport = async () => {
    if (!analysis) return;
    if (analysis.mode !== 'replace' && unresolvedConflictsCount > 0) {
      setErrorMessage(
        `Выберите, какую версию оставить для каждого совпадения (${unresolvedConflictsCount}).`
      );
      return;
    }

    setErrorMessage(null);
    setApplying(true);
    try {
      await onExecuteImport(analysis, conflictChoices);
      setSafetyBackup(getLastAutoSafetyBackup());
      setInspectedArchive(null);
      setAnalysis(null);
      await refreshStorageStatus();
      onClose();
    } catch (err) {
      setSafetyBackup(getLastAutoSafetyBackup());
      setErrorMessage(
        err instanceof Error
          ? err.message
          : 'При переносе возникла ошибка. Прежние данные автоматически сохранены без изменений.'
      );
    } finally {
      setApplying(false);
    }
  };

  const handleDownloadSafetyBackup = () => {
    if (!safetyBackup) return;
    const url = URL.createObjectURL(safetyBackup.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = safetyBackup.filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRollbackClick = async () => {
    setErrorMessage(null);
    setRollingBack(true);
    try {
      await onRollbackSafetyBackup();
      await refreshStorageStatus();
      onClose();
    } catch (err) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : 'Не удалось вернуть данные из запасной копии.'
      );
    } finally {
      setRollingBack(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-zinc-900/45 backdrop-blur-[2px] flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Резервное копирование и перенос данных"
    >
      <div className="bg-white border border-zinc-200 rounded-2xl shadow-xl w-full max-w-2xl p-6 space-y-5 max-h-[92vh] overflow-y-auto">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-zinc-900">
              Резервное копирование и перенос данных
            </h2>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              Сохраняет все группы, журналы и фото в один файл · подходит для сайта
              и программы на компьютере
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={applying || exporting || rollingBack}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 disabled:opacity-40"
            aria-label="Закрыть окно резервного копирования"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Browser Storage Status (navigator.storage.estimate & persist) */}
        <section className="rounded-xl border border-zinc-200 bg-[#F6F6F3] p-3.5 space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-800">
              <HardDrive className="w-3.5 h-3.5 text-[#0D9488]" />
              <span>Хранилище браузера</span>
            </div>

            {storageStatus?.persistSupported ? (
              storageStatus.persisted ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md px-2 py-0.5">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Защищено от автоочистки</span>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleRequestPersist}
                  disabled={requestingPersist}
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-md px-2 py-0.5 transition-colors disabled:opacity-60"
                >
                  <ShieldCheck className="w-3 h-3" />
                  <span>
                    {requestingPersist
                      ? 'Включение...'
                      : 'Защитить хранилище'}
                  </span>
                </button>
              )
            ) : (
              <span className="text-[11px] text-zinc-500">
                Дополнительная защита в этом браузере недоступна
              </span>
            )}
          </div>

          {storageStatus ? (
            storageStatus.estimateSupported ? (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-zinc-600 tabular-nums">
                  <span>
                    Занято:{' '}
                    <strong className="text-zinc-900">
                      {formatStorageBytes(storageStatus.usageBytes)}
                    </strong>
                  </span>
                  <span>
                    Доступно:{' '}
                    <strong className="text-zinc-900">
                      {formatStorageBytes(storageStatus.availableBytes)}
                    </strong>
                    {storageStatus.quotaBytes !== null && (
                      <span className="text-zinc-400">
                        {' '}
                        из {formatStorageBytes(storageStatus.quotaBytes)}
                      </span>
                    )}
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-zinc-200 overflow-hidden">
                  <div
                    className="h-full bg-[#0D9488] rounded-full transition-all"
                    style={{
                      width: `${Math.max(
                        storageStatus.usagePercent ?? 0,
                        (storageStatus.usageBytes ?? 0) > 0 ? 2 : 0
                      )}%`,
                    }}
                  />
                </div>
              </div>
            ) : (
              <p className="text-[11px] text-zinc-500">
                Размер занятого места не показывается в этом браузере.
              </p>
            )
          ) : (
            <p className="text-[11px] text-zinc-500">
              Проверка свободного места...
            </p>
          )}
        </section>

        {errorMessage && (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs text-red-800 flex items-start gap-2"
          >
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {analysis && inspectedArchive ? (
          /* PREVIEW & CONFLICT RESOLUTION BEFORE APPLYING */
          <section
            aria-label="Подтверждение восстановления из резервной копии"
            className="rounded-xl border border-zinc-200 bg-[#F6F6F3]/60 p-4 space-y-4"
          >
            <div className="flex items-start gap-2.5">
              <FileArchive className="w-5 h-5 text-[#0D9488] shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-zinc-900 truncate">
                  {inspectedArchive.fileName}
                </div>
                <div className="text-[11px] text-zinc-600 mt-0.5">
                  {inspectedArchive.kind === 'zip'
                    ? `ZIP-архив v${inspectedArchive.backupVersion}`
                    : 'Резервная копия JSON'}{' '}
                  · получено {formatSourceOrigin(inspectedArchive.sourcePlatform)} ·{' '}
                  {formatDateTime(inspectedArchive.exportedAt)}
                </div>
              </div>
            </div>

            {/* Two-mode Switcher right in preview */}
            <div className="space-y-1.5">
              <div className="text-[11px] font-semibold text-zinc-700">
                Как загрузить данные из файла
              </div>
              <div
                className="grid grid-cols-1 sm:grid-cols-2 gap-2"
                role="radiogroup"
                aria-label="Выбор действия при загрузке"
              >
                {IMPORT_MODE_OPTIONS.map((opt) => {
                  const active = selectedMode === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      disabled={inspecting || applying}
                      onClick={() => void handleModeChange(opt.id)}
                      className={`text-left p-2.5 rounded-xl border transition-colors ${
                        active
                          ? 'bg-white border-[#0D9488] ring-2 ring-[#0D9488]/15'
                          : 'bg-white/70 border-zinc-200 hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-900">
                        {opt.icon}
                        <span>{opt.label}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Preview Counters: New / Updated / Unchanged / Conflicts */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="bg-white rounded-lg border border-zinc-200 p-2.5">
                <div className="text-[10px] font-medium text-zinc-500">
                  Новые записи
                </div>
                <div className="text-base font-bold text-emerald-700 tabular-nums mt-0.5">
                  {analysis.summary.newCounts.total}
                </div>
                <div className="text-[10px] text-zinc-500 mt-0.5 tabular-nums">
                  групп: {analysis.summary.newCounts.groups} · учеников:{' '}
                  {analysis.summary.newCounts.residents} · журналов:{' '}
                  {analysis.summary.newCounts.journals}
                </div>
              </div>

              <div className="bg-white rounded-lg border border-zinc-200 p-2.5">
                <div className="text-[10px] font-medium text-zinc-500">
                  Обновления
                </div>
                <div className="text-base font-bold text-sky-700 tabular-nums mt-0.5">
                  {analysis.summary.updatedCounts.total}
                </div>
                <div className="text-[10px] text-zinc-500 mt-0.5 tabular-nums">
                  журналов: {analysis.summary.updatedCounts.journals} · групп:{' '}
                  {analysis.summary.updatedCounts.groups}
                </div>
              </div>

              <div className="bg-white rounded-lg border border-zinc-200 p-2.5">
                <div className="text-[10px] font-medium text-zinc-500">
                  Без изменений
                </div>
                <div className="text-base font-bold text-zinc-700 tabular-nums mt-0.5">
                  {analysis.summary.unchangedCount}
                </div>
                <div className="text-[10px] text-zinc-500 mt-0.5">
                  повторы пропущены
                </div>
              </div>

              <div className="bg-white rounded-lg border border-zinc-200 p-2.5">
                <div className="text-[10px] font-medium text-zinc-500">
                  Конфликты
                </div>
                <div
                  className={`text-base font-bold tabular-nums mt-0.5 ${
                    analysis.summary.conflictsCount > 0
                      ? 'text-amber-600'
                      : 'text-zinc-700'
                  }`}
                >
                  {analysis.summary.conflictsCount}
                </div>
                <div className="text-[10px] text-zinc-500 mt-0.5 tabular-nums">
                  проекты: +{analysis.summary.newCounts.projects} · фото: +
                  {analysis.summary.newCounts.images}
                </div>
              </div>
            </div>

            {analysis.mode !== 'replace' &&
              analysis.summary.localOnlyPreservedCount > 0 && (
                <div className="text-[11px] text-zinc-600 bg-white rounded-lg border border-zinc-200 px-3 py-2">
                  Записи, которые есть только на этом компьютере (
                  <strong className="text-zinc-900 tabular-nums">
                    {analysis.summary.localOnlyPreservedCount}
                  </strong>
                  ), останутся без изменений и не удалятся.
                </div>
              )}

            {/* Conflict Resolution List */}
            {analysis.conflicts.length > 0 && (
              <div className="space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>
                      Найдены изменения на обоих компьютерах ({analysis.conflicts.length}) — выберите, какую версию оставить
                    </span>
                  </div>
                  {analysis.conflicts.length > 1 && (
                    <div className="flex items-center gap-1.5 text-[11px]">
                      <button
                        type="button"
                        onClick={() => {
                          const all: Record<string, ConflictResolutionChoice> =
                            {};
                          analysis.conflicts.forEach((c) => {
                            all[c.key] = 'keep-local';
                          });
                          setConflictChoices(all);
                        }}
                        className="px-2 py-1 rounded border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 font-medium"
                      >
                        Все с этого компьютера
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const all: Record<string, ConflictResolutionChoice> =
                            {};
                          analysis.conflicts.forEach((c) => {
                            all[c.key] = 'use-incoming';
                          });
                          setConflictChoices(all);
                        }}
                        className="px-2 py-1 rounded border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 font-medium"
                      >
                        Все из файла
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {analysis.conflicts.map((conflict) => {
                    const choice =
                      conflictChoices[conflict.key] ?? 'unresolved';
                    return (
                      <div
                        key={conflict.key}
                        className="rounded-xl border border-amber-200 bg-white p-3 space-y-2.5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="text-xs font-bold text-zinc-900">
                              {conflict.title}
                            </div>
                            <div className="text-[11px] text-zinc-500">
                              {conflict.subtitle} · изменилось:{' '}
                              {conflict.changedAreas.join(', ')}
                            </div>
                          </div>
                          {choice === 'unresolved' && (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-800 shrink-0">
                              Нужен выбор
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setConflictChoices((prev) => ({
                                ...prev,
                                [conflict.key]: 'keep-local',
                              }))
                            }
                            className={`text-left p-2.5 rounded-lg border text-[11px] transition-colors ${
                              choice === 'keep-local'
                                ? 'border-[#0D9488] bg-[#CCFBF1]/35 text-zinc-900'
                                : 'border-zinc-200 hover:bg-zinc-50 text-zinc-700'
                            }`}
                          >
                            <div className="flex items-center gap-1.5 font-semibold text-zinc-900">
                              <Monitor className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                              <span>Версия на этом компьютере</span>
                            </div>
                            <div className="text-[10px] text-zinc-500 mt-1">
                              Уже сохранена здесь сейчас
                            </div>
                            <div className="text-[10px] text-zinc-600 font-medium mt-0.5 tabular-nums">
                              Изменена: {formatDateTime(conflict.localUpdatedAt)}
                            </div>
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              setConflictChoices((prev) => ({
                                ...prev,
                                [conflict.key]: 'use-incoming',
                              }))
                            }
                            className={`text-left p-2.5 rounded-lg border text-[11px] transition-colors ${
                              choice === 'use-incoming'
                                ? 'border-[#0D9488] bg-[#CCFBF1]/35 text-zinc-900'
                                : 'border-zinc-200 hover:bg-zinc-50 text-zinc-700'
                            }`}
                          >
                            <div className="flex items-center gap-1.5 font-semibold text-zinc-900">
                              <Laptop className="w-3.5 h-3.5 text-[#0D9488] shrink-0" />
                              <span>Версия из загруженного файла</span>
                            </div>
                            <div className="text-[10px] text-zinc-500 mt-1">
                              Поступила{' '}
                              {formatSourceOrigin(
                                inspectedArchive.sourcePlatform
                              )}
                            </div>
                            <div className="text-[10px] text-zinc-600 font-medium mt-0.5 tabular-nums">
                              Изменена:{' '}
                              {formatDateTime(conflict.incomingUpdatedAt)}
                            </div>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Warning / Auto-Safety Backup Note */}
            <div
              className={`text-xs leading-relaxed flex items-start gap-2 rounded-lg px-3 py-2.5 border ${
                analysis.mode === 'replace'
                  ? 'bg-amber-50 border-amber-200 text-amber-950'
                  : 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
              }`}
            >
              {analysis.mode === 'replace' ? (
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              ) : (
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              )}
              <span>
                {analysis.mode === 'replace'
                  ? 'Все текущие записи на этом компьютере будут заменены данными из выбранного файла. Перед заменой автоматически сохранится запасная копия.'
                  : 'Перед объединением автоматически сохранится запасная копия текущих данных. Если что-то пойдёт не так, прежнее состояние вернётся автоматически.'}
              </span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setInspectedArchive(null);
                  setAnalysis(null);
                  setErrorMessage(null);
                }}
                disabled={applying}
                className="px-3.5 py-2 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-xs font-semibold text-zinc-700 transition-colors disabled:opacity-50"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={handleConfirmImport}
                disabled={
                  applying ||
                  inspecting ||
                  (analysis.mode !== 'replace' && unresolvedConflictsCount > 0)
                }
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-semibold transition-colors disabled:opacity-50"
              >
                {applying ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                )}
                <span>
                  {applying
                    ? 'Выполнение...'
                    : analysis.mode === 'replace'
                    ? 'Подтвердить и восстановить'
                    : 'Подтвердить и объединить'}
                </span>
              </button>
            </div>
          </section>
        ) : (
          <>
            {/* Export current data */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-800">
                <Database className="w-3.5 h-3.5 text-[#0D9488]" />
                <span>Сохранить копию данных</span>
              </div>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Соберёт в один файл все локации ({counts.branches}), группы (
                {counts.groups}), учеников ({counts.residents}), журналы (
                {counts.journals}), шаблоны ({counts.templates}), загруженные
                фотографии ({counts.media}) и настройки.
              </p>

              <button
                type="button"
                onClick={handleExportClick}
                disabled={exporting || inspecting}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold transition-colors disabled:opacity-60"
              >
                {exporting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                <span>
                  {exporting
                    ? 'Подготовка файла...'
                    : 'Создать резервную копию'}
                </span>
              </button>
            </div>

            {/* 2 Clear Import Modes + File Picker */}
            <div className="pt-3 border-t border-zinc-200 space-y-3">
              <div className="text-xs font-semibold text-zinc-800">
                Загрузить данные из копии
              </div>

              <div
                className="space-y-2"
                role="radiogroup"
                aria-label="Выбор режима восстановления"
              >
                {IMPORT_MODE_OPTIONS.map((opt) => {
                  const active = selectedMode === opt.id;
                  return (
                    <label
                      key={opt.id}
                      className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                        active
                          ? 'bg-[#CCFBF1]/20 border-[#0D9488]'
                          : 'bg-white border-zinc-200 hover:bg-zinc-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="backup-import-mode"
                        value={opt.id}
                        checked={active}
                        onChange={() => void handleModeChange(opt.id)}
                        className="mt-0.5 accent-[#0D9488]"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold text-zinc-900">
                          {opt.icon}
                          <span>{opt.label}</span>
                          {opt.badge && (
                            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-[#CCFBF1] text-[#0F766E]">
                              {opt.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-zinc-500 mt-0.5 leading-relaxed">
                          {opt.description}
                        </p>
                      </div>
                    </label>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={exporting || inspecting}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-900 text-xs font-semibold transition-colors disabled:opacity-60"
              >
                {inspecting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
                <span>
                  {inspecting ? 'Проверка файла...' : 'Восстановить из копии'}
                </span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".zip,application/zip,application/x-zip-compressed,.json,application/json"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            {/* Automatic Pre-Merge Safety Backup Bar (if available in session) */}
            {safetyBackup && (
              <div className="rounded-xl border border-zinc-200 bg-[#F6F6F3] p-3 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-[11px] text-zinc-700">
                  <History className="w-3.5 h-3.5 text-[#0D9488] shrink-0" />
                  <span>
                    Запасная копия до переноса от{' '}
                    {formatDateTime(safetyBackup.createdAt)}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleDownloadSafetyBackup}
                    className="px-2.5 py-1 rounded-md border border-zinc-200 bg-white hover:bg-zinc-50 text-[11px] font-medium text-zinc-700"
                  >
                    Скачать копию
                  </button>
                  <button
                    type="button"
                    onClick={handleRollbackClick}
                    disabled={rollingBack}
                    className="px-2.5 py-1 rounded-md border border-amber-300 bg-amber-50 hover:bg-amber-100 text-[11px] font-semibold text-amber-900 disabled:opacity-50"
                  >
                    {rollingBack ? 'Возврат...' : 'Вернуть как было'}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
