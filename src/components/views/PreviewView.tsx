import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Edit3, Maximize, Minimize } from 'lucide-react';
import { ASSETS } from '../../data/presets';
import { JournalDocument, MediaAsset } from '../../types/journal';
import { ExportMenu } from '../ExportMenu';
import {
  A4_PAGE_HEIGHT,
  A4_PAGE_WIDTH,
  A4_SPREAD_GAP,
  A4PageSlot,
} from '../journal/A4SpreadFrame';
import { JournalPageOne } from '../journal/JournalPageOne';
import { JournalPageTwo } from '../journal/JournalPageTwo';

interface PreviewViewProps {
  doc: JournalDocument;
  mediaAssets?: MediaAsset[];
  onBackToEditor: () => void;
  onBackHome: () => void;
  onPrint: () => void;
  onExportSuccess?: () => void;
  getExportPageElements: () => {
    page1: HTMLElement | null;
    page2: HTMLElement | null;
  };
  helpTrigger?: React.ReactNode;
  tourLayout?: PreviewLayout | null;
}

type PreviewLayout = 'spread' | 'page1' | 'page2';

export function PreviewView({
  doc,
  mediaAssets,
  onBackToEditor,
  onBackHome,
  onPrint,
  onExportSuccess,
  getExportPageElements,
  helpTrigger,
  tourLayout,
}: PreviewViewProps) {
  const [layout, setLayout] = useState<PreviewLayout>('spread');
  const [zoom, setZoom] = useState<'auto' | 0.75 | 1>('auto');

  useEffect(() => {
    if (tourLayout) {
      setLayout(tourLayout);
    }
  }, [tourLayout]);
  const [autoScale, setAutoScale] = useState(0.76);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);

  const logicalW =
    layout === 'spread' ? A4_PAGE_WIDTH * 2 + A4_SPREAD_GAP : A4_PAGE_WIDTH;

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const recalc = () => {
      const availableW = Math.max(240, el.clientWidth - 48);
      const availableH = Math.max(320, el.clientHeight - 84);
      const scaleW = availableW / logicalW;
      const scaleH = availableH / A4_PAGE_HEIGHT;
      const next = Math.min(1, Math.max(0.28, Math.min(scaleW, scaleH)));
      setAutoScale(Number(next.toFixed(3)));
    };
    recalc();
    const raf = window.requestAnimationFrame(recalc);
    const obs = new ResizeObserver(recalc);
    obs.observe(el);
    return () => {
      window.cancelAnimationFrame(raf);
      obs.disconnect();
    };
  }, [logicalW, isFullscreen]);

  useEffect(() => {
    const handler = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await containerRef.current?.requestFullscreen?.();
    } else {
      await document.exitFullscreen?.();
    }
  };

  const effectiveScale = zoom === 'auto' ? autoScale : zoom;

  return (
    <div
      ref={containerRef}
      className="h-screen overflow-hidden bg-[#18181B] text-zinc-100 flex flex-col"
    >
      {/* CLEAN PREVIEW TOP BAR */}
      <header className="h-16 shrink-0 bg-[#09090B] border-b border-zinc-800 px-6 flex items-center justify-between gap-6 z-30">
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onBackHome}
            className="flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-white"
          >
            <img
              src={ASSETS.logo}
              alt="KIBERone"
              referrerPolicy="no-referrer"
              className="h-7 w-auto rounded-xs bg-white p-0.5 object-contain"
            />
          </button>
          <button
            type="button"
            onClick={onBackToEditor}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-zinc-100"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Вернуться в редактор</span>
          </button>
        </div>

        {/* Layout & Zoom Controls */}
        <div
          data-tour-id="preview-controls"
          className="flex items-center gap-3"
        >
          <div className="flex items-center gap-1 p-1 bg-zinc-900 border border-zinc-800 rounded-lg">
            {(
              [
                { id: 'spread', label: 'Разворот (2 стр.)' },
                { id: 'page1', label: 'Страница 1' },
                { id: 'page2', label: 'Страница 2' },
              ] as const
            ).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setLayout(item.id)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                  layout === item.id
                    ? 'bg-zinc-700 text-white'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-1 p-1 bg-zinc-900 border border-zinc-800 rounded-lg">
            {(
              [
                { v: 'auto', label: `Авто (${Math.round(autoScale * 100)}%)` },
                { v: 0.75, label: '75%' },
                { v: 1, label: '100% (А4)' },
              ] as const
            ).map((z) => (
              <button
                key={String(z.v)}
                type="button"
                onClick={() => setZoom(z.v)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-mono ${
                  zoom === z.v
                    ? 'bg-zinc-700 text-white'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {z.label}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200"
            title={
              isFullscreen ? 'Выйти из полноэкранного режима' : 'На весь экран'
            }
          >
            {isFullscreen ? (
              <Minimize className="w-4 h-4" />
            ) : (
              <Maximize className="w-4 h-4" />
            )}
          </button>

          <button
            type="button"
            onClick={onBackToEditor}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-zinc-700 text-xs font-medium text-zinc-200 hover:bg-zinc-800"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Редактировать</span>
          </button>

          {helpTrigger}

          <ExportMenu
            doc={doc}
            getPageElements={getExportPageElements}
            onPrint={onPrint}
            onExportSuccess={onExportSuccess}
          />
        </div>
      </header>

      {/* DISTRACTION-FREE SPREAD VIEWPORT (UNIFORM TRANSFORM SCALE ON FIXED 794x1123 PAGES) */}
      <main ref={stageRef} className="flex-1 min-h-0 overflow-auto p-6 flex">
        <div className="m-auto flex flex-col items-center shrink-0">
          <div className="mb-3 text-xs font-mono text-zinc-400">
            {doc.resident.fullName} · {doc.resident.period} · Формат А4 (210 × 297 мм)
          </div>

          <div
            style={{
              width: `${logicalW * effectiveScale}px`,
              height: `${A4_PAGE_HEIGHT * effectiveScale}px`,
            }}
            className="relative shrink-0"
          >
            <div
              style={{
                width: `${logicalW}px`,
                height: `${A4_PAGE_HEIGHT}px`,
                gap: layout === 'spread' ? `${A4_SPREAD_GAP}px` : '0px',
                transform: `scale(${effectiveScale})`,
                transformOrigin: 'top left',
              }}
              className="flex items-start"
            >
              {(layout === 'spread' || layout === 'page1') && (
                <A4PageSlot className="shadow-[0_24px_60px_rgba(0,0,0,0.55)]">
                  <JournalPageOne doc={doc} mediaAssets={mediaAssets} />
                </A4PageSlot>
              )}
              {(layout === 'spread' || layout === 'page2') && (
                <A4PageSlot className="shadow-[0_24px_60px_rgba(0,0,0,0.55)]">
                  <JournalPageTwo doc={doc} />
                </A4PageSlot>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
