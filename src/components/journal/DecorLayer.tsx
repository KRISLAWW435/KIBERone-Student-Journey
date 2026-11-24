import React from 'react';
import { Cpu, Rocket, Sparkles, Terminal } from 'lucide-react';
import {
  CanvasObjectTransform,
  DecorElement,
  PageBackgroundConfig,
} from '../../types/journal';

interface PageGridAndBackgroundProps {
  background?: PageBackgroundConfig;
}

export function PageGridOverlay({ background }: PageGridAndBackgroundProps) {
  if (!background?.showGrid) return null;

  if (background.gridStyle === 'dots') {
    return (
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          backgroundImage:
            'radial-gradient(rgba(17, 24, 39, 0.14) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      />
    );
  }

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0"
      style={{
        backgroundImage:
          'linear-gradient(to right, rgba(17, 24, 39, 0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(17, 24, 39, 0.06) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }}
    />
  );
}

interface DraggableDesignWrapperProps {
  id: string;
  transform?: CanvasObjectTransform;
  designMode?: boolean;
  isActive?: boolean;
  scaleFactor?: number;
  onSelect?: () => void;
  onUpdateTransform?: (next: CanvasObjectTransform) => void;
  className?: string;
  children: React.ReactNode;
}

export function DraggableDesignWrapper({
  transform,
  designMode = false,
  isActive = false,
  scaleFactor = 1,
  onSelect,
  onUpdateTransform,
  className = '',
  children,
}: DraggableDesignWrapperProps) {
  if (transform?.hidden) return null;

  const x = transform?.x ?? 0;
  const y = transform?.y ?? 0;
  const scale = transform?.scale ?? 1;
  const rotation = transform?.rotation ?? 0;
  const zIndex = transform?.zIndex ?? 10;
  const locked = Boolean(transform?.locked);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!designMode) {
      onSelect?.();
      return;
    }
    e.stopPropagation();
    onSelect?.();
    if (locked || !onUpdateTransform) return;

    const startX = e.clientX;
    const startY = e.clientY;
    const baseX = x;
    const baseY = y;

    const handleMove = (moveEvent: PointerEvent) => {
      const dx = (moveEvent.clientX - startX) / Math.max(0.2, scaleFactor);
      const dy = (moveEvent.clientY - startY) / Math.max(0.2, scaleFactor);
      // Keep offsets bounded inside A4 safe margins
      const clampedX = Math.max(-240, Math.min(240, Math.round(baseX + dx)));
      const clampedY = Math.max(-280, Math.min(280, Math.round(baseY + dy)));
      onUpdateTransform({
        x: clampedX,
        y: clampedY,
        scale,
        rotation,
        zIndex,
        hidden: transform?.hidden,
        locked,
      });
    };

    const handleUp = () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
    };

    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
  };

  return (
    <div
      onPointerDown={handlePointerDown}
      onClick={(e) => {
        if (onSelect) e.stopPropagation();
      }}
      style={{
        transform: `translate(${x}px, ${y}px) scale(${scale}) rotate(${rotation}deg)`,
        zIndex,
        cursor: designMode ? (locked ? 'not-allowed' : 'grab') : onSelect ? 'pointer' : undefined,
      }}
      className={`relative ${
        onSelect ? 'editable-block' : ''
      } ${isActive ? 'editable-block-active' : ''} ${className}`}
    >
      {children}
      {designMode && isActive && (
        <span className="no-print pointer-events-none absolute -top-2.5 right-1 rounded bg-[#0D9488] px-1.5 py-0.5 text-[9px] font-mono text-white shadow-xs">
          {locked ? 'Заблокирован' : 'Перетащите мышью'}
        </span>
      )}
    </div>
  );
}

interface DecorLayerProps {
  elements: DecorElement[];
  designMode?: boolean;
  activeDecorId?: string | null;
  scaleFactor?: number;
  onSelectDecor?: (id: string) => void;
  onMoveDecor?: (id: string, x: number, y: number) => void;
}

export function DecorLayer({
  elements,
  designMode = false,
  activeDecorId = null,
  scaleFactor = 1,
  onSelectDecor,
  onMoveDecor,
}: DecorLayerProps) {
  return (
    <>
      {elements
        .filter((el) => !el.hidden)
        .map((el) => {
          const isActive = activeDecorId === el.id;

          const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
            if (!onSelectDecor) return;
            e.stopPropagation();
            onSelectDecor(el.id);
            if (!designMode || el.locked || !onMoveDecor) return;

            const startX = e.clientX;
            const startY = e.clientY;
            const baseX = el.x;
            const baseY = el.y;

            const onMove = (me: PointerEvent) => {
              const dx = (me.clientX - startX) / Math.max(0.2, scaleFactor);
              const dy = (me.clientY - startY) / Math.max(0.2, scaleFactor);
              const nextX = Math.max(16, Math.min(794 - el.width - 16, Math.round(baseX + dx)));
              const nextY = Math.max(16, Math.min(1123 - el.height - 16, Math.round(baseY + dy)));
              onMoveDecor(el.id, nextX, nextY);
            };
            const onUp = () => {
              window.removeEventListener('pointermove', onMove);
              window.removeEventListener('pointerup', onUp);
            };
            window.addEventListener('pointermove', onMove);
            window.addEventListener('pointerup', onUp);
          };

          return (
            <div
              key={el.id}
              onPointerDown={handlePointerDown}
              onClick={(e) => {
                if (onSelectDecor) e.stopPropagation();
              }}
              style={{
                position: 'absolute',
                left: `${el.x}px`,
                top: `${el.y}px`,
                width: `${el.width}px`,
                height: `${el.height}px`,
                transform: `rotate(${el.rotation}deg)`,
                opacity: el.opacity,
                zIndex: el.zIndex,
                cursor: designMode
                  ? el.locked
                    ? 'not-allowed'
                    : 'move'
                  : onSelectDecor
                  ? 'pointer'
                  : 'default',
              }}
              className={`${designMode || onSelectDecor ? 'pointer-events-auto' : 'pointer-events-none'} ${
                isActive ? 'outline-2 outline-[#0D9488] outline-offset-2 rounded-lg' : ''
              }`}
            >
              <DecorGraphic element={el} />
            </div>
          );
        })}
    </>
  );
}

function DecorGraphic({ element }: { element: DecorElement }) {
  switch (element.kind) {
    case 'blob':
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
          <path
            d="M46 8C67 5 91 21 94 44C97 67 80 92 54 94C28 96 6 77 7 50C8 23 25 11 46 8Z"
            fill={element.color}
          />
        </svg>
      );
    case 'line':
      return (
        <svg viewBox="0 0 140 24" className="w-full h-full" fill="none">
          <path
            d="M4 12C28 4 46 20 70 12C94 4 112 20 136 12"
            stroke={element.color}
            strokeWidth="3.5"
            strokeLinecap="round"
          />
        </svg>
      );
    case 'dots':
      return (
        <svg viewBox="0 0 80 56" className="w-full h-full" fill="none">
          {[12, 30, 48, 66].map((cx) =>
            [12, 28, 44].map((cy) => (
              <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="3.5" fill={element.color} />
            ))
          )}
        </svg>
      );
    case 'star':
      return (
        <svg viewBox="0 0 60 60" className="w-full h-full" fill="none">
          <path
            d="M30 4L36 22L54 24L40 36L44 54L30 44L16 54L20 36L6 24L24 22L30 4Z"
            fill={element.color}
            stroke="#18181B"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </svg>
      );
    case 'sticker':
      return (
        <div
          style={{ backgroundColor: element.color }}
          className="w-full h-full rounded-xl border-2 border-[#18181B] shadow-[0_3px_0_#18181B] flex items-center justify-center px-2 text-center font-extrabold text-[11px] leading-tight text-[#18181B]"
        >
          {element.stickerText || 'SUPER!'}
        </div>
      );
    case 'icon':
    default:
      return (
        <div
          style={{ backgroundColor: element.color }}
          className="w-full h-full rounded-full border-[1.5px] border-[#18181B] flex items-center justify-center text-[#18181B]"
        >
          {element.label === 'code' ? (
            <Terminal className="w-1/2 h-1/2" />
          ) : element.label === 'rocket' ? (
            <Rocket className="w-1/2 h-1/2" />
          ) : element.label === 'cpu' ? (
            <Cpu className="w-1/2 h-1/2" />
          ) : (
            <Sparkles className="w-1/2 h-1/2" />
          )}
        </div>
      );
  }
}
