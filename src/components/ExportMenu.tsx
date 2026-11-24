import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  Download,
  FileImage,
  FileText,
  Loader2,
  Printer,
  ShieldAlert,
} from 'lucide-react';
import { JournalDocument } from '../types/journal';
import {
  exportFullPdf,
  exportHtmlEbook,
  exportPngPages,
  exportSinglePagePdf,
  runPreflightChecks,
} from '../utils/exportService';

interface ExportMenuProps {
  doc: JournalDocument;
  getPageElements: () => { page1: HTMLElement | null; page2: HTMLElement | null };
  onPrint?: () => void;
  onExportSuccess?: () => void;
}

export function ExportMenu({
  doc,
  getPageElements,
  onPrint,
  onExportSuccess,
}: ExportMenuProps) {
  const [open, setOpen] = useState(false);
  const [busyLabel, setBusyLabel] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showChecks, setShowChecks] = useState(false);

  const preflight = useMemo(() => runPreflightChecks(doc), [doc]);

  const runExport = async (
    label: string,
    fn: (p1: HTMLElement, p2: HTMLElement) => Promise<void>
  ) => {
    const { page1, page2 } = getPageElements();
    if (!page1 || !page2) {
      setErrorMsg('Не удалось подготовить страницы для экспорта.');
      return;
    }
    setErrorMsg(null);
    setBusyLabel(label);
    try {
      await fn(page1, page2);
      onExportSuccess?.();
      setOpen(false);
    } catch (err) {
      setErrorMsg(
        err instanceof Error
          ? `Ошибка экспорта: ${err.message}`
          : 'Не удалось выполнить экспорт.'
      );
    } finally {
      setBusyLabel(null);
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        disabled={Boolean(busyLabel)}
        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0 shadow-xs disabled:opacity-60"
      >
        {busyLabel ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Download className="w-3.5 h-3.5" />
        )}
        <span>{busyLabel || 'Скачать'}</span>
        {preflight.errorsCount > 0 ? (
          <span className="w-2 h-2 rounded-full bg-red-300" />
        ) : preflight.warningsCount > 0 ? (
          <span className="w-2 h-2 rounded-full bg-amber-300" />
        ) : null}
        <ChevronDown className="w-3.5 h-3.5 opacity-80" />
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-80 bg-white border border-zinc-200 rounded-xl shadow-xl z-50 p-2 text-left">
            {/* Preflight Check Summary */}
            <button
              type="button"
              onClick={() => setShowChecks((v) => !v)}
              className={`w-full mb-2 px-3 py-2 rounded-lg border text-left transition-colors flex items-center justify-between gap-2 ${
                preflight.errorsCount > 0
                  ? 'bg-red-50 border-red-200 text-red-800'
                  : preflight.warningsCount > 0
                  ? 'bg-amber-50 border-amber-200 text-amber-800'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-800'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                {preflight.errorsCount > 0 ? (
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                ) : preflight.warningsCount > 0 ? (
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                )}
                <div className="truncate text-[11px] font-semibold">
                  {preflight.errorsCount > 0
                    ? `Ошибки макета (${preflight.errorsCount})`
                    : preflight.warningsCount > 0
                    ? `Проверка А4: ${preflight.warningsCount} замеч.`
                    : 'Проверка А4 пройдена'}
                </div>
              </div>
              <span className="text-[10px] underline shrink-0">
                {showChecks ? 'Скрыть' : 'Детали'}
              </span>
            </button>

            {showChecks && (
              <div className="mb-2 max-h-40 overflow-y-auto space-y-1.5 px-1">
                {preflight.issues.map((issue) => (
                  <div
                    key={issue.id}
                    className={`text-[11px] leading-snug px-2.5 py-1.5 rounded-md border ${
                      issue.severity === 'error'
                        ? 'bg-red-50 border-red-200 text-red-700'
                        : issue.severity === 'warning'
                        ? 'bg-amber-50 border-amber-200 text-amber-800'
                        : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                    }`}
                  >
                    {issue.message}
                  </div>
                ))}
              </div>
            )}

            <div className="px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
              Формат выгрузки А4
            </div>

            <button
              type="button"
              disabled={Boolean(busyLabel)}
              onClick={() =>
                runExport('PDF (2 стр.)...', (p1, p2) =>
                  exportFullPdf(p1, p2, doc.resident.fullName)
                )
              }
              className="w-full flex items-start gap-2.5 px-3 py-2 rounded-lg hover:bg-zinc-50 text-left transition-colors"
            >
              <FileText className="w-4 h-4 text-[#0D9488] mt-0.5 shrink-0" />
              <div>
                <div className="text-xs font-semibold text-zinc-900">
                  Полный PDF
                </div>
                <div className="text-[11px] text-zinc-500">
                  Две страницы А4 в одном файле
                </div>
              </div>
            </button>

            <button
              type="button"
              disabled={Boolean(busyLabel)}
              onClick={() =>
                runExport('Стр. 1 PDF...', (p1) =>
                  exportSinglePagePdf(p1, 1, doc.resident.fullName)
                )
              }
              className="w-full flex items-start gap-2.5 px-3 py-2 rounded-lg hover:bg-zinc-50 text-left transition-colors"
            >
              <FileText className="w-4 h-4 text-zinc-500 mt-0.5 shrink-0" />
              <div>
                <div className="text-xs font-semibold text-zinc-900">
                  Страница 1 — PDF
                </div>
                <div className="text-[11px] text-zinc-500">
                  Только «Мой путь в мире технологий»
                </div>
              </div>
            </button>

            <button
              type="button"
              disabled={Boolean(busyLabel)}
              onClick={() =>
                runExport('Стр. 2 PDF...', (_p1, p2) =>
                  exportSinglePagePdf(p2, 2, doc.resident.fullName)
                )
              }
              className="w-full flex items-start gap-2.5 px-3 py-2 rounded-lg hover:bg-zinc-50 text-left transition-colors"
            >
              <FileText className="w-4 h-4 text-zinc-500 mt-0.5 shrink-0" />
              <div>
                <div className="text-xs font-semibold text-zinc-900">
                  Страница 2 — PDF
                </div>
                <div className="text-[11px] text-zinc-500">
                  Только «Мои достижения»
                </div>
              </div>
            </button>

            <button
              type="button"
              disabled={Boolean(busyLabel)}
              onClick={() =>
                runExport('PNG...', (p1, p2) =>
                  exportPngPages(p1, p2, doc.resident.fullName)
                )
              }
              className="w-full flex items-start gap-2.5 px-3 py-2 rounded-lg hover:bg-zinc-50 text-left transition-colors"
            >
              <FileImage className="w-4 h-4 text-zinc-600 mt-0.5 shrink-0" />
              <div>
                <div className="text-xs font-semibold text-zinc-900">
                  Страницы PNG
                </div>
                <div className="text-[11px] text-zinc-500">
                  Два изображения высокого качества
                </div>
              </div>
            </button>

            <button
              type="button"
              disabled={Boolean(busyLabel)}
              onClick={() =>
                runExport('HTML...', (p1, p2) =>
                  exportHtmlEbook(
                    p1,
                    p2,
                    doc.resident.fullName,
                    doc.resident.period
                  )
                )
              }
              className="w-full flex items-start gap-2.5 px-3 py-2 rounded-lg hover:bg-zinc-50 text-left transition-colors"
            >
              <BookOpen className="w-4 h-4 text-zinc-600 mt-0.5 shrink-0" />
              <div>
                <div className="text-xs font-semibold text-zinc-900">
                  Электронная книга HTML
                </div>
                <div className="text-[11px] text-zinc-500">
                  Автономный файл для любого браузера
                </div>
              </div>
            </button>

            {onPrint && (
              <div className="mt-1 pt-1 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    onPrint();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-zinc-50 text-left transition-colors"
                >
                  <Printer className="w-4 h-4 text-zinc-500 shrink-0" />
                  <span className="text-xs font-medium text-zinc-700">
                    Системная печать А4
                  </span>
                </button>
              </div>
            )}

            {errorMsg && (
              <div className="mx-2 my-1.5 px-2.5 py-1.5 rounded-lg bg-red-50 border border-red-200 text-[11px] text-red-700">
                {errorMsg}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
