import React, { useEffect, useRef, useState } from 'react';
import { Cpu, Rocket, RotateCw, Sparkles, Terminal } from 'lucide-react';
import {
  CanvasObjectTransform,
  DecorElement,
  PageBackgroundConfig,
} from '../../types/journal';
import { ModuleVectorIcon } from './JournalArtwork';

export interface SnapLine {
  pos: number;
  kind: 'center' | 'edge';
}

export interface SnapLinesState {
  vertical: SnapLine[];
  horizontal: SnapLine[];
}

export const EMPTY_SNAP_LINES: SnapLinesState = {
  vertical: [],
  horizontal: [],
};

export interface SnapTargets {
  vertical: SnapLine[];
  horizontal: SnapLine[];
}

const A4_WIDTH = 794;
const A4_HEIGHT = 1123;
const SNAP_THRESHOLD = 6;

export function collectCanvasSnapTargets(
  canvasEl: HTMLElement | null,
  excludeSnapId: string,
  scaleFactor = 1
): SnapTargets {
  const vertical: SnapLine[] = [
    { pos: Math.round(A4_WIDTH / 2), kind: 'center' }, // 397px center axis
    { pos: 40, kind: 'edge' }, // Left A4 margin
    { pos: A4_WIDTH - 40, kind: 'edge' }, // Right A4 margin (754px)
  ];
  const horizontal: SnapLine[] = [
    { pos: Math.round(A4_HEIGHT / 2), kind: 'center' }, // 562px center axis
    { pos: 30, kind: 'edge' }, // Top A4 margin
    { pos: A4_HEIGHT - 30, kind: 'edge' }, // Bottom A4 margin (1093px)
  ];

  if (!canvasEl) {
    return { vertical, horizontal };
  }

  const canvasRect = canvasEl.getBoundingClientRect();
  const safeScale = Math.max(0.2, scaleFactor);
  const excludedNode = canvasEl.querySelector<HTMLElement>(
    `[data-snap-id="${excludeSnapId.replace(/"/g, '\\"')}"]`
  );
  const nodes = canvasEl.querySelectorAll<HTMLElement>('[data-snap-id]');
  nodes.forEach((node) => {
    const snapId = node.dataset.snapId;
    if (!snapId || snapId === excludeSnapId) return;
    if (
      excludedNode &&
      (excludedNode.contains(node) || node.contains(excludedNode))
    ) {
      return;
    }

    const r = node.getBoundingClientRect();
    if (r.width <= 0 || r.height <= 0) return;

    const left = (r.left - canvasRect.left) / safeScale;
    const right = (r.right - canvasRect.left) / safeScale;
    const centerX = (left + right) / 2;
    const top = (r.top - canvasRect.top) / safeScale;
    const bottom = (r.bottom - canvasRect.top) / safeScale;
    const centerY = (top + bottom) / 2;

    vertical.push(
      { pos: Math.round(left), kind: 'edge' },
      { pos: Math.round(centerX), kind: 'edge' },
      { pos: Math.round(right), kind: 'edge' }
    );
    horizontal.push(
      { pos: Math.round(top), kind: 'edge' },
      { pos: Math.round(centerY), kind: 'edge' },
      { pos: Math.round(bottom), kind: 'edge' }
    );
  });

  return { vertical, horizontal };
}

export function computeSnappedBox(
  box: { x: number; y: number; width: number; height: number },
  targets: SnapTargets
): { x: number; y: number; lines: SnapLinesState } {
  let snappedX = box.x;
  let snappedY = box.y;
  const activeV: SnapLine[] = [];
  const activeH: SnapLine[] = [];

  // Check vertical alignment (left, centerX, right)
  const xAnchors = [
    { val: box.x, offset: 0 },
    { val: box.x + box.width / 2, offset: box.width / 2 },
    { val: box.x + box.width, offset: box.width },
  ];
  let bestDx = SNAP_THRESHOLD + 1;
  let bestTargetX: SnapLine | null = null;
  let bestAnchorOffsetX = 0;

  for (const anchor of xAnchors) {
    for (const target of targets.vertical) {
      const dist = Math.abs(anchor.val - target.pos);
      if (dist < bestDx) {
        bestDx = dist;
        bestTargetX = target;
        bestAnchorOffsetX = anchor.offset;
      }
    }
  }
  if (bestTargetX && bestDx <= SNAP_THRESHOLD) {
    snappedX = Math.round(bestTargetX.pos - bestAnchorOffsetX);
    activeV.push(bestTargetX);
  }

  // Check horizontal alignment (top, centerY, bottom)
  const yAnchors = [
    { val: box.y, offset: 0 },
    { val: box.y + box.height / 2, offset: box.height / 2 },
    { val: box.y + box.height, offset: box.height },
  ];
  let bestDy = SNAP_THRESHOLD + 1;
  let bestTargetY: SnapLine | null = null;
  let bestAnchorOffsetY = 0;

  for (const anchor of yAnchors) {
    for (const target of targets.horizontal) {
      const dist = Math.abs(anchor.val - target.pos);
      if (dist < bestDy) {
        bestDy = dist;
        bestTargetY = target;
        bestAnchorOffsetY = anchor.offset;
      }
    }
  }
  if (bestTargetY && bestDy <= SNAP_THRESHOLD) {
    snappedY = Math.round(bestTargetY.pos - bestAnchorOffsetY);
    activeH.push(bestTargetY);
  }

  return {
    x: snappedX,
    y: snappedY,
    lines: {
      vertical: activeV,
      horizontal: activeH,
    },
  };
}

export function SmartGuidesOverlay({ lines }: { lines: SnapLinesState }) {
  if (lines.vertical.length === 0 && lines.horizontal.length === 0) {
    return null;
  }

  return (
    <div
      aria-hidden="true"
      className="no-print pointer-events-none absolute inset-0 z-[999]"
    >
      {lines.vertical.map((line, idx) => (
        <div
          key={`v-${idx}-${line.pos}`}
          style={{
            left: `${line.pos}px`,
            top: 0,
            bottom: 0,
            width: '1px',
            backgroundColor: line.kind === 'center' ? '#EF4444' : '#0D9488',
            boxShadow:
              line.kind === 'center'
                ? '0 0 0 0.5px rgba(239,68,68,0.25)'
                : '0 0 0 0.5px rgba(13,148,136,0.25)',
          }}
          className="absolute"
        />
      ))}
      {lines.horizontal.map((line, idx) => (
        <div
          key={`h-${idx}-${line.pos}`}
          style={{
            top: `${line.pos}px`,
            left: 0,
            right: 0,
            height: '1px',
            backgroundColor: line.kind === 'center' ? '#EF4444' : '#0D9488',
            boxShadow:
              line.kind === 'center'
                ? '0 0 0 0.5px rgba(239,68,68,0.25)'
                : '0 0 0 0.5px rgba(13,148,136,0.25)',
          }}
          className="absolute"
        />
      ))}
    </div>
  );
}

interface PageGridAndBackgroundProps {
  background?: PageBackgroundConfig;
}

export function PageGridOverlay({ background }: PageGridAndBackgroundProps) {
  if (!background?.showGrid) return null;

  if (background.gridStyle === 'dots') {
    return (
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-0 -z-10"
        style={{
          width: '794px',
          height: '1123px',
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
      className="pointer-events-none absolute top-0 left-0 -z-10"
      style={{
        width: '794px',
        height: '1123px',
        backgroundImage:
          'linear-gradient(to right, rgba(17, 24, 39, 0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(17, 24, 39, 0.06) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }}
    />
  );
}

export interface InlineEditableTextProps {
  value: string;
  placeholder?: string;
  onSelectText?: () => void;
  isSelected?: boolean;
  onChange?: (next: string) => void;
  onBeginEdit?: () => void;
  onEndEdit?: () => void;
  multiline?: boolean;
  as?: 'span' | 'div' | 'p' | 'h1' | 'h2' | 'h3' | 'h4';
  className?: string;
  style?: React.CSSProperties;
}

export function InlineEditableText({
  value,
  placeholder = 'Введите текст…',
  onSelectText,
  isSelected = false,
  as: Tag = 'span',
  className = '',
  style,
}: InlineEditableTextProps) {
  const interactive = Boolean(onSelectText);

  return (
    <Tag
      onClick={
        onSelectText
          ? (e: React.MouseEvent) => {
              e.stopPropagation();
              onSelectText();
            }
          : undefined
      }
      title={interactive ? 'Нажмите, чтобы редактировать текст в правой панели' : undefined}
      style={style}
      className={`${className} ${
        interactive
          ? isSelected
            ? 'cursor-pointer outline outline-2 outline-[#0D9488] bg-[#F0FDFA]/45 rounded-[3px] transition-[outline,background-color]'
            : 'cursor-pointer hover:outline hover:outline-1 hover:outline-dashed hover:outline-[#0D9488]/65 rounded-[3px] transition-[outline]'
          : ''
      }`}
    >
      {value || placeholder}
    </Tag>
  );
}

interface DraggableDesignWrapperProps {
  id: string;
  transform?: CanvasObjectTransform;
  defaultZIndex?: number;
  designMode?: boolean;
  isActive?: boolean;
  scaleFactor?: number;
  onSelect?: () => void;
  onUpdateTransform?: (next: CanvasObjectTransform) => void;
  onSnapLinesChange?: (lines: SnapLinesState) => void;
  onInteractionStart?: () => void;
  onInteractionEnd?: () => void;
  style?: React.CSSProperties;
  className?: string;
  children: React.ReactNode;
}

export function DraggableDesignWrapper({
  id,
  transform,
  defaultZIndex,
  designMode = false,
  isActive = false,
  scaleFactor = 1,
  onSelect,
  onUpdateTransform,
  onSnapLinesChange,
  onInteractionStart,
  onInteractionEnd,
  style: externalStyle,
  className = '',
  children,
}: DraggableDesignWrapperProps) {
  const slotRef = useRef<HTMLDivElement | null>(null);
  const innerRef = useRef<HTMLDivElement | null>(null);
  const [slotSize, setSlotSize] = useState<{ w: number; h: number } | null>(
    null
  );
  const [liveBadge, setLiveBadge] = useState<string | null>(null);

  const x = transform?.x ?? 0;
  const y = transform?.y ?? 0;
  const scale = transform?.scale ?? 1;
  const rotation = transform?.rotation ?? 0;
  const resolvedZIndex =
    transform?.zIndex !== undefined ? transform.zIndex : defaultZIndex;
  const locked = Boolean(transform?.locked);
  const isMoved = x !== 0 || y !== 0;

  useEffect(() => {
    if (isMoved && !slotSize && slotRef.current) {
      const el = slotRef.current;
      if (el.offsetWidth > 0 && el.offsetHeight > 0) {
        setSlotSize({ w: el.offsetWidth, h: el.offsetHeight });
      }
    }
    if (!isMoved && slotSize) {
      setSlotSize(null);
    }
  }, [isMoved, slotSize]);

  if (transform?.hidden) return null;

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!designMode) {
      return;
    }
    if (e.button !== 0) return;
    const targetEl = e.target as HTMLElement | null;
    if (targetEl?.closest('textarea, input')) {
      return;
    }
    e.stopPropagation();
    onSelect?.();
    if (locked || !onUpdateTransform) return;

    const el = slotRef.current;
    const innerEl = innerRef.current;
    const measuredW = el?.offsetWidth || slotSize?.w;
    const measuredH = el?.offsetHeight || slotSize?.h;

    const canvasEl = innerEl?.closest('.a4-canvas') as HTMLElement | null;
    const safeScale = Math.max(0.2, scaleFactor);
    const snapTargets = collectCanvasSnapTargets(canvasEl, id, safeScale);

    const canvasRect = canvasEl?.getBoundingClientRect();
    const innerRect = innerEl?.getBoundingClientRect();
    const startBoxW = innerRect ? innerRect.width / safeScale : measuredW || 120;
    const startBoxH = innerRect ? innerRect.height / safeScale : measuredH || 80;
    const startBoxX =
      canvasRect && innerRect
        ? (innerRect.left - canvasRect.left) / safeScale
        : x;
    const startBoxY =
      canvasRect && innerRect
        ? (innerRect.top - canvasRect.top) / safeScale
        : y;

    const startX = e.clientX;
    const startY = e.clientY;
    const baseX = x;
    const baseY = y;
    const baseZ = resolvedZIndex ?? 10;
    let startedDrag = false;

    const handleMove = (moveEvent: PointerEvent) => {
      const rawDx = moveEvent.clientX - startX;
      const rawDy = moveEvent.clientY - startY;
      if (!startedDrag && Math.hypot(rawDx, rawDy) < 3) {
        return;
      }
      if (!startedDrag) {
        startedDrag = true;
        onInteractionStart?.();
        if (measuredW && measuredH && !slotSize) {
          setSlotSize({ w: measuredW, h: measuredH });
        }
      }
      const dx = rawDx / safeScale;
      const dy = rawDy / safeScale;

      const snapped = computeSnappedBox(
        {
          x: startBoxX + dx,
          y: startBoxY + dy,
          width: startBoxW,
          height: startBoxH,
        },
        snapTargets
      );
      onSnapLinesChange?.(snapped.lines);

      const snappedDeltaX = snapped.x - startBoxX;
      const snappedDeltaY = snapped.y - startBoxY;
      const clampedX = Math.max(
        -720,
        Math.min(720, Math.round(baseX + snappedDeltaX))
      );
      const clampedY = Math.max(
        -960,
        Math.min(960, Math.round(baseY + snappedDeltaY))
      );
      setLiveBadge(`x:${clampedX} y:${clampedY}`);
      onUpdateTransform({
        x: clampedX,
        y: clampedY,
        scale,
        rotation,
        zIndex: baseZ,
        hidden: transform?.hidden,
        locked,
      });
    };

    const handleUp = () => {
      setLiveBadge(null);
      onSnapLinesChange?.(EMPTY_SNAP_LINES);
      if (startedDrag) {
        onInteractionEnd?.();
      }
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
    };

    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
  };

  const handleScaleHandleDown = (
    e: React.PointerEvent<HTMLDivElement>,
    corner: 'nw' | 'ne' | 'sw' | 'se'
  ) => {
    if (!designMode || locked || !onUpdateTransform) return;
    e.stopPropagation();
    e.preventDefault();
    onInteractionStart?.();

    const safeScale = Math.max(0.2, scaleFactor);
    const innerRect = innerRef.current?.getBoundingClientRect();
    const boxW = Math.max(40, (innerRect?.width || 160) / safeScale);
    const startClientX = e.clientX;
    const startClientY = e.clientY;
    const startScale = scale;
    const baseZ = resolvedZIndex ?? 10;
    const dirX = corner === 'nw' || corner === 'sw' ? -1 : 1;
    const dirY = corner === 'nw' || corner === 'ne' ? -1 : 1;

    const onMove = (me: PointerEvent) => {
      const dx = ((me.clientX - startClientX) / safeScale) * dirX;
      const dy = ((me.clientY - startClientY) / safeScale) * dirY;
      const delta = (dx + dy) * 0.5;
      const nextScale = Number(
        Math.max(0.4, Math.min(2.2, startScale + delta / boxW)).toFixed(2)
      );
      setLiveBadge(`${Math.round(nextScale * 100)}%`);
      onUpdateTransform({
        x,
        y,
        scale: nextScale,
        rotation,
        zIndex: baseZ,
        hidden: transform?.hidden,
        locked,
      });
    };

    const onUp = () => {
      setLiveBadge(null);
      onInteractionEnd?.();
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  const handleRotateHandleDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!designMode || locked || !onUpdateTransform) return;
    e.stopPropagation();
    e.preventDefault();
    onInteractionStart?.();

    const rect = innerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const startPointerAngle =
      Math.atan2(e.clientY - cy, e.clientX - cx) * (180 / Math.PI);
    const startRotation = rotation;
    const baseZ = resolvedZIndex ?? 10;

    const onMove = (me: PointerEvent) => {
      const curAngle =
        Math.atan2(me.clientY - cy, me.clientX - cx) * (180 / Math.PI);
      let nextRot = startRotation + (curAngle - startPointerAngle);
      while (nextRot > 180) nextRot -= 360;
      while (nextRot < -180) nextRot += 360;
      if (me.shiftKey) {
        nextRot = Math.round(nextRot / 15) * 15;
      } else {
        nextRot = Math.round(nextRot);
      }
      setLiveBadge(`${nextRot}°`);
      onUpdateTransform({
        x,
        y,
        scale,
        rotation: nextRot,
        zIndex: baseZ,
        hidden: transform?.hidden,
        locked,
      });
    };

    const onUp = () => {
      setLiveBadge(null);
      onInteractionEnd?.();
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  const hasCustomTransform = scale !== 1 || rotation !== 0;

  return (
    <div
      ref={slotRef}
      style={{
        ...externalStyle,
        width:
          externalStyle?.width ??
          (isMoved && slotSize ? `${slotSize.w}px` : undefined),
        height:
          externalStyle?.height ??
          (isMoved && slotSize ? `${slotSize.h}px` : undefined),
        position: externalStyle?.position ?? 'relative',
        zIndex: isActive ? Math.max(resolvedZIndex ?? 10, 40) : resolvedZIndex,
      }}
      className={className}
    >
      <div
        ref={innerRef}
        data-snap-id={id}
        onPointerDown={handlePointerDown}
        onClick={(e) => {
          if (onSelect) {
            e.stopPropagation();
            onSelect();
          }
        }}
        style={{
          position: isMoved ? 'absolute' : 'relative',
          left: isMoved ? `${x}px` : undefined,
          top: isMoved ? `${y}px` : undefined,
          width:
            isMoved && slotSize
              ? `${slotSize.w}px`
              : externalStyle?.width ?? '100%',
          height:
            isMoved && slotSize ? `${slotSize.h}px` : externalStyle?.height,
          transform: hasCustomTransform
            ? `scale(${scale}) rotate(${rotation}deg)`
            : undefined,
          cursor: designMode
            ? locked
              ? 'not-allowed'
              : 'grab'
            : onSelect
            ? 'pointer'
            : undefined,
        }}
        className={`pointer-events-auto ${onSelect ? 'editable-block' : ''} ${
          isActive && !designMode ? 'editable-block-active' : ''
        }`}
      >
        {children}

        {/* Figma-style Blue Bounding Box, Rotation Handle & Corner Handles */}
        {designMode && isActive && (
          <div className="no-print pointer-events-none absolute -inset-[2px] border-[1.5px] border-[#2563EB] rounded-[4px] z-50">
            {!locked && (
              <>
                {/* Top Rotation Handle */}
                <div className="absolute -top-[24px] left-1/2 -translate-x-1/2 flex flex-col items-center">
                  <div
                    onPointerDown={handleRotateHandleDown}
                    title="Потяните, чтобы повернуть (Shift — шаг 15°)"
                    className="pointer-events-auto w-[16px] h-[16px] rounded-full bg-white border-[1.5px] border-[#2563EB] shadow-xs flex items-center justify-center cursor-grab active:cursor-grabbing hover:bg-[#2563EB] hover:text-white text-[#2563EB] transition-colors"
                  >
                    <RotateCw className="w-[9px] h-[9px]" />
                  </div>
                  <div className="w-[1.5px] h-[8px] bg-[#2563EB]" />
                </div>

                {(
                  [
                    { corner: 'nw', pos: '-top-[5px] -left-[5px]', cur: 'nwse-resize' },
                    { corner: 'ne', pos: '-top-[5px] -right-[5px]', cur: 'nesw-resize' },
                    { corner: 'sw', pos: '-bottom-[5px] -left-[5px]', cur: 'nesw-resize' },
                    { corner: 'se', pos: '-bottom-[5px] -right-[5px]', cur: 'nwse-resize' },
                  ] as const
                ).map((h) => (
                  <div
                    key={h.corner}
                    onPointerDown={(e) => handleScaleHandleDown(e, h.corner)}
                    style={{ cursor: h.cur }}
                    className={`pointer-events-auto absolute ${h.pos} w-[9px] h-[9px] bg-white border-[1.5px] border-[#2563EB] rounded-[1.5px] shadow-xs hover:bg-[#2563EB]`}
                  />
                ))}
              </>
            )}

            <span className="absolute -bottom-[22px] left-1/2 -translate-x-1/2 rounded bg-[#2563EB] px-1.5 py-0.5 text-[9px] font-mono font-semibold text-white shadow-xs whitespace-nowrap">
              {locked
                ? 'Закреплено'
                : liveBadge ||
                  `${Math.round(scale * 100)}%${
                    rotation ? ` · ${rotation}°` : ''
                  }`}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

interface DecorLayerProps {
  elements: DecorElement[];
  designMode?: boolean;
  activeDecorId?: string | null;
  scaleFactor?: number;
  onSelectDecor?: (id: string) => void;
  onMoveDecor?: (decorId: string, x: number, y: number) => void;
  onUpdateDecor?: (decorId: string, patch: Partial<DecorElement>) => void;
  onUpdateDecorText?: (decorId: string, text: string) => void;
  onSnapLinesChange?: (lines: SnapLinesState) => void;
  onInteractionStart?: () => void;
  onInteractionEnd?: () => void;
}

type ResizeHandleDir = 'nw' | 'ne' | 'sw' | 'se' | 'n' | 's' | 'w' | 'e';

export function DecorLayer({
  elements,
  designMode = false,
  activeDecorId = null,
  scaleFactor = 1,
  onSelectDecor,
  onMoveDecor,
  onUpdateDecor,
  onSnapLinesChange,
  onInteractionStart,
  onInteractionEnd,
}: DecorLayerProps) {
  const [interactingId, setInteractingId] = useState<string | null>(null);
  const layerHostRef = useRef<HTMLDivElement | null>(null);

  return (
    <div ref={layerHostRef} className="pointer-events-none absolute inset-0">
      {elements
        .filter((el) => !el.hidden)
        .map((el) => {
          const isActive = activeDecorId === el.id;
          const isInteracting = interactingId === el.id;

          const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
            if (!onSelectDecor) return;
            if (e.button !== 0) return;
            e.stopPropagation();
            onSelectDecor(el.id);
            if (!designMode || el.locked || !onMoveDecor) return;

            const canvasEl = layerHostRef.current?.closest(
              '.a4-canvas'
            ) as HTMLElement | null;
            const safeScale = Math.max(0.2, scaleFactor);
            const snapTargets = collectCanvasSnapTargets(
              canvasEl,
              el.id,
              safeScale
            );

            const startX = e.clientX;
            const startY = e.clientY;
            const baseX = el.x;
            const baseY = el.y;
            let started = false;

            const onMove = (me: PointerEvent) => {
              const rawDx = me.clientX - startX;
              const rawDy = me.clientY - startY;
              if (!started && Math.hypot(rawDx, rawDy) < 2) return;
              if (!started) {
                started = true;
                onInteractionStart?.();
              }
              setInteractingId(el.id);

              const dx = rawDx / safeScale;
              const dy = rawDy / safeScale;
              const candidateX = Math.max(
                0,
                Math.min(A4_WIDTH - Math.min(el.width, 80), Math.round(baseX + dx))
              );
              const candidateY = Math.max(
                0,
                Math.min(
                  A4_HEIGHT - Math.min(el.height, 60),
                  Math.round(baseY + dy)
                )
              );

              const snapped = computeSnappedBox(
                {
                  x: candidateX,
                  y: candidateY,
                  width: el.width,
                  height: el.height,
                },
                snapTargets
              );
              onSnapLinesChange?.(snapped.lines);

              const nextX = Math.max(
                0,
                Math.min(A4_WIDTH - Math.min(el.width, 80), snapped.x)
              );
              const nextY = Math.max(
                0,
                Math.min(A4_HEIGHT - Math.min(el.height, 60), snapped.y)
              );
              onMoveDecor(el.id, nextX, nextY);
            };
            const onUp = () => {
              setInteractingId(null);
              onSnapLinesChange?.(EMPTY_SNAP_LINES);
              if (started) {
                onInteractionEnd?.();
              }
              window.removeEventListener('pointermove', onMove);
              window.removeEventListener('pointerup', onUp);
            };
            window.addEventListener('pointermove', onMove);
            window.addEventListener('pointerup', onUp);
          };

          const handleRotatePointerDown = (
            e: React.PointerEvent<HTMLDivElement>
          ) => {
            if (!designMode || el.locked || !onUpdateDecor) return;
            e.stopPropagation();
            e.preventDefault();
            onInteractionStart?.();
            setInteractingId(el.id);

            const itemEl = e.currentTarget.closest(
              '[data-snap-id]'
            ) as HTMLElement | null;
            const rect = itemEl?.getBoundingClientRect();
            if (!rect) return;
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            const startPointerAngle =
              Math.atan2(e.clientY - cy, e.clientX - cx) * (180 / Math.PI);
            const startRotation = el.rotation ?? 0;

            const onMove = (me: PointerEvent) => {
              const curAngle =
                Math.atan2(me.clientY - cy, me.clientX - cx) * (180 / Math.PI);
              let nextRot = startRotation + (curAngle - startPointerAngle);
              while (nextRot > 180) nextRot -= 360;
              while (nextRot < -180) nextRot += 360;
              if (me.shiftKey) {
                nextRot = Math.round(nextRot / 15) * 15;
              } else {
                nextRot = Math.round(nextRot);
              }
              onUpdateDecor(el.id, { rotation: nextRot });
            };

            const onUp = () => {
              setInteractingId(null);
              onInteractionEnd?.();
              window.removeEventListener('pointermove', onMove);
              window.removeEventListener('pointerup', onUp);
            };

            window.addEventListener('pointermove', onMove);
            window.addEventListener('pointerup', onUp);
          };

          const handleResizePointerDown = (
            e: React.PointerEvent<HTMLDivElement>,
            dir: ResizeHandleDir
          ) => {
            if (!designMode || el.locked || !onUpdateDecor) return;
            e.stopPropagation();
            e.preventDefault();
            onInteractionStart?.();
            setInteractingId(el.id);

            const safeScale = Math.max(0.2, scaleFactor);
            const startClientX = e.clientX;
            const startClientY = e.clientY;
            const startX = el.x;
            const startY = el.y;
            const startW = Math.max(32, el.width);
            const startH = Math.max(28, el.height);
            const startFont = el.fontSize ?? 18;
            const aspect = startW / startH;
            const rad = ((el.rotation ?? 0) * Math.PI) / 180;
            const cosR = Math.cos(rad);
            const sinR = Math.sin(rad);
            const isCorner =
              dir === 'nw' || dir === 'ne' || dir === 'sw' || dir === 'se';

            const onMove = (me: PointerEvent) => {
              const rawDx = (me.clientX - startClientX) / safeScale;
              const rawDy = (me.clientY - startClientY) / safeScale;
              const dx = rawDx * cosR + rawDy * sinR;
              const dy = -rawDx * sinR + rawDy * cosR;

              if (isCorner) {
                // Proportional corner scaling for Images, Text, and Icons
                const signX = dir === 'nw' || dir === 'sw' ? -1 : 1;
                const signY = dir === 'nw' || dir === 'ne' ? -1 : 1;
                const projX = startW + dx * signX;
                const projY = startH + dy * signY;
                const scaleFromX = projX / startW;
                const scaleFromY = projY / startH;
                const uniformScale = Math.max(
                  0.25,
                  Math.abs(dx * signX) >= Math.abs(dy * signY)
                    ? scaleFromX
                    : scaleFromY
                );

                const nextW = Math.max(
                  40,
                  Math.min(740, Math.round(startW * uniformScale))
                );
                const nextH =
                  el.kind === 'text'
                    ? Math.max(28, Math.round(startH * (nextW / startW)))
                    : Math.max(32, Math.round(nextW / aspect));

                const nextX =
                  dir === 'nw' || dir === 'sw'
                    ? Math.round(startX + (startW - nextW))
                    : startX;
                const nextY =
                  dir === 'nw' || dir === 'ne'
                    ? Math.round(startY + (startH - nextH))
                    : startY;

                const patch: Partial<DecorElement> = {
                  x: Math.max(0, nextX),
                  y: Math.max(0, nextY),
                  width: nextW,
                  height: nextH,
                };

                if (el.kind === 'text') {
                  patch.fontSize = Math.max(
                    10,
                    Math.min(96, Math.round(startFont * (nextW / startW)))
                  );
                }

                onUpdateDecor(el.id, patch);
                return;
              }

              // Edge handles (w, e, n, s)
              let nextX = startX;
              let nextY = startY;
              let nextW = startW;
              let nextH = startH;

              if (dir === 'e') {
                nextW = Math.max(48, Math.min(760, Math.round(startW + dx)));
              } else if (dir === 'w') {
                const candidateW = Math.max(
                  48,
                  Math.min(760, Math.round(startW - dx))
                );
                nextX = Math.max(0, Math.round(startX + (startW - candidateW)));
                nextW = candidateW;
              } else if (dir === 's') {
                nextH = Math.max(32, Math.min(900, Math.round(startH + dy)));
              } else if (dir === 'n') {
                const candidateH = Math.max(
                  32,
                  Math.min(900, Math.round(startH - dy))
                );
                nextY = Math.max(0, Math.round(startY + (startH - candidateH)));
                nextH = candidateH;
              }

              onUpdateDecor(el.id, {
                x: nextX,
                y: nextY,
                width: nextW,
                height: nextH,
              });
            };

            const onUp = () => {
              setInteractingId(null);
              onInteractionEnd?.();
              window.removeEventListener('pointermove', onMove);
              window.removeEventListener('pointerup', onUp);
            };

            window.addEventListener('pointermove', onMove);
            window.addEventListener('pointerup', onUp);
          };

          const showSideHandles =
            el.kind === 'text' ||
            (el.kind === 'image' && Boolean(el.cropEnabled)) ||
            el.kind === 'sticker' ||
            el.kind === 'line' ||
            el.kind === 'blob' ||
            el.kind === 'tape';

          return (
            <div
              key={el.id}
              data-snap-id={el.id}
              onPointerDown={handlePointerDown}
              onClick={(e) => {
                if (onSelectDecor) {
                  e.stopPropagation();
                  onSelectDecor(el.id);
                }
              }}
              style={{
                position: 'absolute',
                left: `${el.x}px`,
                top: `${el.y}px`,
                width: `${el.width}px`,
                height: el.kind === 'text' ? 'auto' : `${el.height}px`,
                minHeight: el.kind === 'text' ? `${el.height}px` : undefined,
                transform: `rotate(${el.rotation}deg)`,
                opacity: el.opacity,
                zIndex:
                  designMode && isActive ? Math.max(el.zIndex, 45) : el.zIndex,
                cursor: designMode
                  ? el.locked
                    ? 'not-allowed'
                    : 'move'
                  : onSelectDecor
                  ? 'pointer'
                  : 'default',
              }}
              className={`${
                designMode || onSelectDecor
                  ? 'pointer-events-auto'
                  : 'pointer-events-none'
              }`}
            >
              <DecorGraphic element={el} />

              {/* Figma-style Blue Bounding Box with Rotation, Corner & Side Resize Handles */}
              {designMode && isActive && (
                <div className="no-print pointer-events-none absolute -inset-[1.5px] border-[1.5px] border-[#2563EB] rounded-[2px] z-50">
                  {!el.locked && (
                    <>
                      {/* Top Rotation Handle */}
                      <div className="absolute -top-[24px] left-1/2 -translate-x-1/2 flex flex-col items-center">
                        <div
                          onPointerDown={handleRotatePointerDown}
                          title="Потяните, чтобы повернуть (Shift — шаг 15°)"
                          className="pointer-events-auto w-[16px] h-[16px] rounded-full bg-white border-[1.5px] border-[#2563EB] shadow-xs flex items-center justify-center cursor-grab active:cursor-grabbing hover:bg-[#2563EB] hover:text-white text-[#2563EB] transition-colors"
                        >
                          <RotateCw className="w-[9px] h-[9px]" />
                        </div>
                        <div className="w-[1.5px] h-[8px] bg-[#2563EB]" />
                      </div>

                      {/* 4 Corner Proportional Handles */}
                      {(
                        [
                          {
                            dir: 'nw',
                            pos: '-top-[5px] -left-[5px]',
                            cur: 'nwse-resize',
                          },
                          {
                            dir: 'ne',
                            pos: '-top-[5px] -right-[5px]',
                            cur: 'nesw-resize',
                          },
                          {
                            dir: 'sw',
                            pos: '-bottom-[5px] -left-[5px]',
                            cur: 'nesw-resize',
                          },
                          {
                            dir: 'se',
                            pos: '-bottom-[5px] -right-[5px]',
                            cur: 'nwse-resize',
                          },
                        ] as const
                      ).map((h) => (
                        <div
                          key={h.dir}
                          onPointerDown={(e) => handleResizePointerDown(e, h.dir)}
                          style={{ cursor: h.cur }}
                          className={`pointer-events-auto absolute ${h.pos} w-[9px] h-[9px] bg-white border-[1.5px] border-[#2563EB] rounded-[1.5px] shadow-xs hover:bg-[#2563EB]`}
                        />
                      ))}

                      {/* Side Handles for Text Reflow or Cropped Image Framing */}
                      {showSideHandles && (
                        <>
                          <div
                            onPointerDown={(e) => handleResizePointerDown(e, 'w')}
                            style={{ cursor: 'ew-resize' }}
                            className="pointer-events-auto absolute top-1/2 -left-[4px] -translate-y-1/2 w-[7px] h-[16px] bg-white border-[1.5px] border-[#2563EB] rounded-[2px] shadow-xs hover:bg-[#2563EB]"
                          />
                          <div
                            onPointerDown={(e) => handleResizePointerDown(e, 'e')}
                            style={{ cursor: 'ew-resize' }}
                            className="pointer-events-auto absolute top-1/2 -right-[4px] -translate-y-1/2 w-[7px] h-[16px] bg-white border-[1.5px] border-[#2563EB] rounded-[2px] shadow-xs hover:bg-[#2563EB]"
                          />
                          {el.kind !== 'text' && (
                            <>
                              <div
                                onPointerDown={(e) =>
                                  handleResizePointerDown(e, 'n')
                                }
                                style={{ cursor: 'ns-resize' }}
                                className="pointer-events-auto absolute left-1/2 -top-[4px] -translate-x-1/2 w-[16px] h-[7px] bg-white border-[1.5px] border-[#2563EB] rounded-[2px] shadow-xs hover:bg-[#2563EB]"
                              />
                              <div
                                onPointerDown={(e) =>
                                  handleResizePointerDown(e, 's')
                                }
                                style={{ cursor: 'ns-resize' }}
                                className="pointer-events-auto absolute left-1/2 -bottom-[4px] -translate-x-1/2 w-[16px] h-[7px] bg-white border-[1.5px] border-[#2563EB] rounded-[2px] shadow-xs hover:bg-[#2563EB]"
                              />
                            </>
                          )}
                        </>
                      )}
                    </>
                  )}

                  {/* Dimension / Font / Angle Readout Pill */}
                  <span
                    className={`absolute -bottom-[22px] left-1/2 -translate-x-1/2 rounded px-1.5 py-0.5 text-[9px] font-mono font-semibold text-white shadow-xs whitespace-nowrap ${
                      isInteracting ? 'bg-[#1D4ED8]' : 'bg-[#2563EB]'
                    }`}
                  >
                    {el.locked
                      ? 'Закреплено'
                      : el.kind === 'text'
                      ? `${el.width}×${el.height} · ${el.fontSize ?? 18}px${
                          el.rotation ? ` · ${el.rotation}°` : ''
                        }`
                      : `${el.width}×${el.height}${
                          el.rotation ? ` · ${el.rotation}°` : ''
                        }`}
                  </span>
                </div>
              )}
            </div>
          );
        })}
    </div>
  );
}

function DecorGraphic({ element }: { element: DecorElement }) {
  switch (element.kind) {
    case 'text': {
      const hasBg = element.bgColor && element.bgColor !== 'transparent';
      return (
        <div
          style={{
            color: element.color || '#111827',
            fontSize: `${element.fontSize ?? 18}px`,
            fontFamily:
              element.fontFamily === 'handwriting'
                ? 'var(--font-handwriting)'
                : 'var(--font-journal)',
            fontWeight:
              element.fontWeight === 'extrabold'
                ? 800
                : element.fontWeight === 'bold'
                ? 700
                : 500,
            textAlign: element.textAlign ?? 'left',
            backgroundColor: hasBg ? element.bgColor : 'transparent',
            minHeight: `${element.height}px`,
          }}
          className={`w-full leading-snug whitespace-pre-wrap break-words ${
            hasBg
              ? 'px-3 py-2 rounded-xl border-[1.5px] border-[#18181B]/20 shadow-xs'
              : 'px-1 py-0.5'
          }`}
        >
          {element.text?.trim() ? element.text : 'Нажмите для ввода текста'}
        </div>
      );
    }

    case 'image':
      if (!element.imageUrl) {
        return (
          <div className="w-full h-full rounded-xl bg-zinc-100 border border-dashed border-zinc-400 flex items-center justify-center text-[11px] font-medium text-zinc-500">
            Изображение
          </div>
        );
      }
      if (element.cropEnabled) {
        return (
          <div className="w-full h-full rounded-xl overflow-hidden shadow-sm">
            <img
              src={element.imageUrl}
              alt={element.label || 'Изображение'}
              referrerPolicy="no-referrer"
              style={{
                objectPosition: `${element.cropPosX ?? 50}% ${
                  element.cropPosY ?? 50
                }%`,
              }}
              className="w-full h-full object-cover select-none pointer-events-none"
            />
          </div>
        );
      }
      {
        const isStickerAsset =
          element.imageUrl.includes('/assets/stickers/') ||
          element.id.startsWith('decor-p1-') ||
          element.id.startsWith('decor-p2-') ||
          element.id.startsWith('sticker-');
        return (
          <img
            src={element.imageUrl}
            alt={element.label || 'Изображение'}
            referrerPolicy="no-referrer"
            style={
              isStickerAsset
                ? {
                    filter:
                      'drop-shadow(1.5px 0 0 #ffffff) drop-shadow(-1.5px 0 0 #ffffff) drop-shadow(0 1.5px 0 #ffffff) drop-shadow(0 -1.5px 0 #ffffff) drop-shadow(0 4px 6px rgba(17, 24, 39, 0.18))',
                  }
                : undefined
            }
            className="w-full h-full object-contain select-none pointer-events-none drop-shadow-sm"
          />
        );
      }

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
              <circle
                key={`${cx}-${cy}`}
                cx={cx}
                cy={cy}
                r="3.5"
                fill={element.color}
              />
            ))
          )}
        </svg>
      );
    case 'star':
      return (
        <svg
          viewBox="0 0 60 60"
          style={{ filter: 'drop-shadow(0 2px 4px rgba(17,24,39,0.2))' }}
          className="w-full h-full"
          fill="none"
        >
          <path
            d="M30 4L36 22L54 24L40 36L44 54L30 44L16 54L20 36L6 24L24 22L30 4Z"
            fill={element.color}
            stroke="#18181B"
            strokeWidth="2.2"
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
    case 'tape':
      return (
        <svg
          viewBox="0 0 112 24"
          preserveAspectRatio="none"
          style={{
            filter: 'drop-shadow(0 2px 3px rgba(17, 24, 39, 0.16))',
          }}
          className="w-full h-full select-none pointer-events-none"
          fill="none"
        >
          <path
            d="M3 2 L109 2 L106.5 8 L110 14 L107.5 21 L2.5 21 L5 15 L1.5 9 Z"
            fill={element.color || '#FDE68A'}
            fillOpacity="0.86"
            stroke="rgba(180, 155, 60, 0.48)"
            strokeWidth="1"
            strokeLinejoin="round"
          />
          <line
            x1="10"
            y1="6.5"
            x2="102"
            y2="6.5"
            stroke="rgba(255,255,255,0.42)"
            strokeWidth="1"
          />
        </svg>
      );

    case 'icon':
    default:
      if (element.iconKey) {
        const hasBadgeBg = element.bgColor && element.bgColor !== 'transparent';
        return (
          <div
            style={
              hasBadgeBg ? { backgroundColor: element.bgColor } : undefined
            }
            className={`w-full h-full flex items-center justify-center ${
              hasBadgeBg
                ? 'rounded-2xl border-[1.5px] border-[#18181B] p-2 shadow-[0_3px_0_rgba(24,24,27,0.14)]'
                : ''
            }`}
          >
            <ModuleVectorIcon
              iconKey={element.iconKey}
              className="w-full h-full"
            />
          </div>
        );
      }
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
