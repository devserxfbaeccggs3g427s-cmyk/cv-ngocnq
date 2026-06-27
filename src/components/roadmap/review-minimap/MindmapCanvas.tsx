'use client';

import { useRef, useState, useCallback, useEffect, useMemo, memo } from 'react';
import {
  ChevronRight,
  Hand,
  Maximize2,
  Minus,
  Plus,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ProgressFile, TaskContext } from '@/types';
import { getTaskStudyState } from '@/lib/roadmap';

// ─── Layout Constants ────────────────────────────────────────────
const NODE_H = 36;
const TASK_H = 32;
const ROOT_W = 160;
const TRACK_W = 180;
const MODULE_W = 170;
const TASK_W = 200;
const H_GAP_1 = 180;
const H_GAP_2 = 160;
const H_GAP_3 = 150;
const V_GAP_TRACK = 50;
const V_GAP_MODULE = 28;
const V_GAP_TASK = 8;
const MIN_ZOOM = 0.3;
const MAX_ZOOM = 2.5;

// ─── Types ───────────────────────────────────────────────────────
type LayoutNode = {
  id: string;
  label: string;
  fullLabel: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'root' | 'track' | 'module' | 'task';
  taskId?: string;
  completed?: boolean;
  hasNote?: boolean;
  childCount?: number;
  completedCount?: number;
  collapsible?: boolean;
  side?: 'left' | 'right';
};

type LayoutEdge = {
  id: string;
  from: { x: number; y: number };
  to: { x: number; y: number };
  type: 'root-track' | 'track-module' | 'module-task';
};

type PointerPoint = {
  x: number;
  y: number;
};

interface MindmapCanvasProps {
  filteredTasks: TaskContext[];
  progress: ProgressFile;
  selectedTaskId: string | null;
  onSelectTask: (taskId: string) => void;
}

function truncate(text: string, max: number) {
  return text.length > max ? text.slice(0, max - 1) + '…' : text;
}

// ─── Layout Engine ───────────────────────────────────────────────
function buildLayout(
  filteredTasks: TaskContext[],
  progress: ProgressFile,
  collapsedTracks: Set<string>,
  collapsedModules: Set<string>
): { nodes: LayoutNode[]; edges: LayoutEdge[]; totalWidth: number; totalHeight: number } {
  const nodes: LayoutNode[] = [];
  const edges: LayoutEdge[] = [];

  const grouped = new Map<string, Map<string, TaskContext[]>>();
  for (const task of filteredTasks) {
    if (!grouped.has(task.trackTitle)) grouped.set(task.trackTitle, new Map());
    const modules = grouped.get(task.trackTitle)!;
    if (!modules.has(task.moduleTitle)) modules.set(task.moduleTitle, []);
    modules.get(task.moduleTitle)!.push(task);
  }

  const trackEntries = [...grouped.entries()];
  const rightTracks: typeof trackEntries = [];
  const leftTracks: typeof trackEntries = [];
  trackEntries.forEach((entry, i) => {
    if (i % 2 === 0) rightTracks.push(entry);
    else leftTracks.push(entry);
  });

  const sideWidth = TASK_W + H_GAP_3 + MODULE_W + H_GAP_2 + TRACK_W + H_GAP_1;
  const centerX = sideWidth + 60;

  function layoutSide(side: 'right' | 'left', tracks: typeof trackEntries, startY: number): number {
    let cursorY = startY;
    const trackNodesList: LayoutNode[] = [];
    const dir = side === 'right' ? 1 : -1;
    const trackX = centerX + dir * (H_GAP_1 + TRACK_W / 2) - TRACK_W / 2;
    const moduleX = centerX + dir * (H_GAP_1 + TRACK_W + H_GAP_2 + MODULE_W / 2) - MODULE_W / 2;
    const taskX = centerX + dir * (H_GAP_1 + TRACK_W + H_GAP_2 + MODULE_W + H_GAP_3 + TASK_W / 2) - TASK_W / 2;

    for (const [trackTitle, modules] of tracks) {
      const isTrackCollapsed = collapsedTracks.has(trackTitle);
      const trackStartY = cursorY;
      const moduleNodesList: LayoutNode[] = [];
      let trackTotal = 0, trackCompleted = 0;
      for (const tasks of modules.values()) {
        trackTotal += tasks.length;
        trackCompleted += tasks.filter((t) => getTaskStudyState(t, progress).effectivelyCompleted).length;
      }

      if (!isTrackCollapsed) {
        for (const [moduleTitle, tasks] of modules.entries()) {
          const moduleKey = `${trackTitle}::${moduleTitle}`;
          const isModuleCollapsed = collapsedModules.has(moduleKey);
          const moduleStartY = cursorY;
          const taskNodesList: LayoutNode[] = [];
          const moduleCompleted = tasks.filter((t) => getTaskStudyState(t, progress).effectivelyCompleted).length;

          if (!isModuleCollapsed) {
            for (const task of tasks) {
              const state = getTaskStudyState(task, progress);
              const item = progress.items[task.id];
              const taskNode: LayoutNode = {
                id: `task-${task.id}`, label: truncate(task.title, 24), fullLabel: task.title,
                x: taskX, y: cursorY, width: TASK_W, height: TASK_H,
                type: 'task', taskId: task.id,
                completed: state.effectivelyCompleted, hasNote: Boolean(item?.note?.trim()), side,
              };
              taskNodesList.push(taskNode);
              nodes.push(taskNode);
              cursorY += TASK_H + V_GAP_TASK;
            }
          }

          const moduleEndY = cursorY;
          const moduleMidY = isModuleCollapsed ? cursorY : moduleStartY + (moduleEndY - V_GAP_TASK - moduleStartY) / 2 - NODE_H / 2;
          const moduleNode: LayoutNode = {
            id: `module-${moduleKey}`, label: truncate(moduleTitle, 20), fullLabel: moduleTitle,
            x: moduleX, y: moduleMidY, width: MODULE_W, height: NODE_H,
            type: 'module', childCount: tasks.length, completedCount: moduleCompleted, collapsible: true, side,
          };
          moduleNodesList.push(moduleNode);
          nodes.push(moduleNode);

          if (!isModuleCollapsed) {
            for (const tNode of taskNodesList) {
              const fromX = side === 'right' ? moduleNode.x + MODULE_W : moduleNode.x;
              const toX = side === 'right' ? tNode.x : tNode.x + TASK_W;
              edges.push({ id: `e-${moduleNode.id}-${tNode.id}`, from: { x: fromX, y: moduleNode.y + NODE_H / 2 }, to: { x: toX, y: tNode.y + TASK_H / 2 }, type: 'module-task' });
            }
          }
          if (isModuleCollapsed) cursorY += NODE_H + V_GAP_TASK;
          cursorY += V_GAP_MODULE;
        }
      }

      const trackEndY = cursorY;
      const trackMidY = isTrackCollapsed ? cursorY : trackStartY + (trackEndY - V_GAP_MODULE - trackStartY) / 2 - NODE_H / 2;
      const trackNode: LayoutNode = {
        id: `track-${trackTitle}`, label: truncate(trackTitle, 22), fullLabel: trackTitle,
        x: trackX, y: trackMidY, width: TRACK_W, height: NODE_H,
        type: 'track', childCount: trackTotal, completedCount: trackCompleted, collapsible: true, side,
      };
      trackNodesList.push(trackNode);
      nodes.push(trackNode);

      if (!isTrackCollapsed) {
        for (const mNode of moduleNodesList) {
          const fromX = side === 'right' ? trackNode.x + TRACK_W : trackNode.x;
          const toX = side === 'right' ? mNode.x : mNode.x + MODULE_W;
          edges.push({ id: `e-${trackNode.id}-${mNode.id}`, from: { x: fromX, y: trackNode.y + NODE_H / 2 }, to: { x: toX, y: mNode.y + NODE_H / 2 }, type: 'track-module' });
        }
      }
      if (isTrackCollapsed) cursorY += NODE_H + V_GAP_TASK;
      cursorY += V_GAP_TRACK;
    }

    for (const tNode of trackNodesList) {
      const fromX = side === 'right' ? centerX + ROOT_W / 2 : centerX - ROOT_W / 2;
      const toX = side === 'right' ? tNode.x : tNode.x + TRACK_W;
      edges.push({ id: `e-root-${tNode.id}`, from: { x: fromX, y: 0 }, to: { x: toX, y: tNode.y + NODE_H / 2 }, type: 'root-track' });
    }
    return cursorY;
  }

  const startY = 60;
  const rightEndY = layoutSide('right', rightTracks, startY);
  const leftEndY = layoutSide('left', leftTracks, startY);
  const maxY = Math.max(rightEndY, leftEndY, 400);
  const rootY = startY + (maxY - startY) / 2 - NODE_H / 2;

  nodes.push({ id: 'root', label: 'Lộ trình ôn tập', fullLabel: 'Lộ trình ôn tập', x: centerX - ROOT_W / 2, y: rootY, width: ROOT_W, height: 44, type: 'root' });
  for (const edge of edges) { if (edge.type === 'root-track' && edge.from.y === 0) edge.from.y = rootY + 22; }

  return { nodes, edges, totalWidth: centerX * 2 + 60, totalHeight: maxY + 80 };
}

// ─── Main Component ──────────────────────────────────────────────
export function MindmapCanvas({ filteredTasks, progress, selectedTaskId, onSelectTask }: MindmapCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const zoomRef = useRef(1);
  const panRef = useRef({ x: 0, y: 0 });
  const isPanningRef = useRef(false);
  const panStartRef = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  const activePointersRef = useRef(new Map<number, PointerPoint>());
  const pinchStartRef = useRef<{
    distance: number;
    zoom: number;
    contentX: number;
    contentY: number;
  } | null>(null);
  const rafRef = useRef<number>(0);

  const [collapsedTracks, setCollapsedTracks] = useState<Set<string>>(() => new Set(filteredTasks.map((t) => t.trackTitle)));
  const [collapsedModules, setCollapsedModules] = useState<Set<string>>(new Set());

  const toggleTrack = useCallback((title: string) => {
    setCollapsedTracks((prev) => { const n = new Set(prev); n.has(title) ? n.delete(title) : n.add(title); return n; });
  }, []);
  const toggleModule = useCallback((key: string) => {
    setCollapsedModules((prev) => { const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n; });
  }, []);
  const expandAll = useCallback(() => { setCollapsedTracks(new Set()); setCollapsedModules(new Set()); }, []);
  const collapseAll = useCallback(() => { setCollapsedTracks(new Set(filteredTasks.map((t) => t.trackTitle))); setCollapsedModules(new Set()); }, [filteredTasks]);

  const { nodes, edges, totalWidth, totalHeight } = useMemo(
    () => buildLayout(filteredTasks, progress, collapsedTracks, collapsedModules),
    [filteredTasks, progress, collapsedTracks, collapsedModules]
  );

  // Apply transform directly to DOM for 60fps pan/zoom
  const applyTransform = useCallback((nextZoom = zoomRef.current) => {
    if (!canvasRef.current) return;
    canvasRef.current.style.transform = `translate3d(${panRef.current.x}px, ${panRef.current.y}px, 0) scale(${nextZoom})`;
  }, []);

  useEffect(() => { applyTransform(); }, [applyTransform, nodes]);
  useEffect(() => {
    zoomRef.current = zoom;
    applyTransform(zoom);
  }, [applyTransform, zoom]);

  const scheduleTransform = useCallback((nextZoom = zoomRef.current) => {
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => applyTransform(nextZoom));
  }, [applyTransform]);

  const updateZoomAroundPoint = useCallback((nextZoom: number, centerX: number, centerY: number) => {
    const clampedZoom = Math.max(MIN_ZOOM, Math.min(nextZoom, MAX_ZOOM));
    const currentZoom = zoomRef.current;
    const contentX = (centerX - panRef.current.x) / currentZoom;
    const contentY = (centerY - panRef.current.y) / currentZoom;
    zoomRef.current = clampedZoom;
    panRef.current = {
      x: centerX - contentX * clampedZoom,
      y: centerY - contentY * clampedZoom,
    };
    setZoom(clampedZoom);
    scheduleTransform(clampedZoom);
  }, [scheduleTransform]);

  const handleFit = useCallback(() => {
    if (!containerRef.current) return;
    const cw = containerRef.current.clientWidth;
    const ch = containerRef.current.clientHeight;
    const fitZoom = Math.min(cw / totalWidth, ch / totalHeight, 1.2) * 0.9;
    const clampedZoom = Math.max(MIN_ZOOM, Math.min(fitZoom, MAX_ZOOM));
    panRef.current = { x: (cw - totalWidth * clampedZoom) / 2, y: (ch - totalHeight * clampedZoom) / 2 };
    zoomRef.current = clampedZoom;
    setZoom(clampedZoom);
  }, [totalWidth, totalHeight]);

  const zoomFromCenter = useCallback((delta: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    updateZoomAroundPoint(zoomRef.current + delta, rect.width / 2, rect.height / 2);
  }, [updateZoomAroundPoint]);
  const handleZoomIn = useCallback(() => zoomFromCenter(0.15), [zoomFromCenter]);
  const handleZoomOut = useCallback(() => zoomFromCenter(-0.15), [zoomFromCenter]);

  // Wheel: scroll = pan, ctrl+scroll = zoom — no React state during pan for perf
  useEffect(() => {
    const currentElement = containerRef.current;
    if (!currentElement) return;
    const element: HTMLDivElement = currentElement;
    function onWheel(e: WheelEvent) {
      e.preventDefault();
      if (e.ctrlKey || e.metaKey) {
        const delta = e.deltaY > 0 ? -0.07 : 0.07;
        const rect = element.getBoundingClientRect();
        updateZoomAroundPoint(zoomRef.current + delta, e.clientX - rect.left, e.clientY - rect.top);
      } else {
        panRef.current.x -= e.deltaX * 0.8;
        panRef.current.y -= e.deltaY * 0.8;
        scheduleTransform();
      }
    }
    element.addEventListener('wheel', onWheel, { passive: false });
    return () => element.removeEventListener('wheel', onWheel);
  }, [scheduleTransform, updateZoomAroundPoint]);

  // Pointer pan and pinch zoom. This keeps mobile touch smooth without
  // forcing React state updates on every move event.
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    if ((e.target as HTMLElement).closest('[data-mindmap-node]')) return;
    activePointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);

    if (activePointersRef.current.size === 1) {
      isPanningRef.current = true;
      panStartRef.current = { x: e.clientX, y: e.clientY, panX: panRef.current.x, panY: panRef.current.y };
      pinchStartRef.current = null;
    }

    if (activePointersRef.current.size === 2) {
      const [a, b] = [...activePointersRef.current.values()];
      const centerX = (a.x + b.x) / 2;
      const centerY = (a.y + b.y) / 2;
      const distance = Math.hypot(a.x - b.x, a.y - b.y);
      pinchStartRef.current = {
        distance,
        zoom: zoomRef.current,
        contentX: (centerX - panRef.current.x) / zoomRef.current,
        contentY: (centerY - panRef.current.y) / zoomRef.current,
      };
      isPanningRef.current = false;
    }

    if (containerRef.current) containerRef.current.style.cursor = 'grabbing';
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!activePointersRef.current.has(e.pointerId)) return;
    activePointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (activePointersRef.current.size >= 2 && pinchStartRef.current) {
      const [a, b] = [...activePointersRef.current.values()];
      const centerX = (a.x + b.x) / 2;
      const centerY = (a.y + b.y) / 2;
      const distance = Math.hypot(a.x - b.x, a.y - b.y);
      const nextZoom = Math.max(
        MIN_ZOOM,
        Math.min((distance / pinchStartRef.current.distance) * pinchStartRef.current.zoom, MAX_ZOOM)
      );
      zoomRef.current = nextZoom;
      panRef.current = {
        x: centerX - pinchStartRef.current.contentX * nextZoom,
        y: centerY - pinchStartRef.current.contentY * nextZoom,
      };
      setZoom(nextZoom);
      scheduleTransform(nextZoom);
      return;
    }

    if (!isPanningRef.current) return;
    panRef.current.x = panStartRef.current.panX + (e.clientX - panStartRef.current.x);
    panRef.current.y = panStartRef.current.panY + (e.clientY - panStartRef.current.y);
    scheduleTransform();
  }, [scheduleTransform]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    activePointersRef.current.delete(e.pointerId);
    pinchStartRef.current = null;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }

    if (activePointersRef.current.size === 1) {
      const [remaining] = [...activePointersRef.current.values()];
      isPanningRef.current = true;
      panStartRef.current = { x: remaining.x, y: remaining.y, panX: panRef.current.x, panY: panRef.current.y };
    } else {
      isPanningRef.current = false;
      if (containerRef.current) containerRef.current.style.cursor = 'grab';
    }
  }, []);

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  useEffect(() => {
    const t = setTimeout(handleFit, 80);
    return () => clearTimeout(t);
  }, [handleFit]);

  const getTrackTitle = useCallback((id: string) => id.replace('track-', ''), []);
  const getModuleKey = useCallback((id: string) => id.replace('module-', ''), []);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-gray-200/80 bg-[radial-gradient(circle_at_1px_1px,rgba(100,116,139,0.18)_1px,transparent_0)] bg-[length:22px_22px] shadow-lg dark:border-gray-800 dark:bg-gray-950">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50/95 via-white/92 to-cyan-50/75 dark:from-gray-950/96 dark:via-slate-950/94 dark:to-cyan-950/20" />
      {/* Toolbar left */}
      <div className="absolute left-3 top-3 z-10 flex max-w-[calc(100%-1.5rem)] items-center gap-1 rounded-lg border border-gray-200/80 bg-white/95 px-1.5 py-1 shadow-sm backdrop-blur-sm dark:border-gray-700 dark:bg-gray-900/95">
        <button type="button" onClick={expandAll} className="inline-flex min-h-8 items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-gray-600 transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800" title="Mở rộng tất cả">
          <Plus className="h-3 w-3" /> Mở hết
        </button>
        <button type="button" onClick={collapseAll} className="inline-flex min-h-8 items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-gray-600 transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800" title="Thu gọn tất cả">
          <Minus className="h-3 w-3" /> Thu hết
        </button>
      </div>
      {/* Zoom controls */}
      <div className="absolute right-3 top-3 z-10 flex items-center gap-1 rounded-lg border border-gray-200/80 bg-white/95 p-1 shadow-sm backdrop-blur-sm dark:border-gray-700 dark:bg-gray-900/95">
        <button type="button" onClick={handleZoomIn} className="inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-600 transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800" aria-label="Phóng to"><ZoomIn className="h-3.5 w-3.5" /></button>
        <span className="min-w-[3.5ch] text-center text-[11px] font-semibold tabular-nums text-gray-500 dark:text-gray-400">{Math.round(zoom * 100)}%</span>
        <button type="button" onClick={handleZoomOut} className="inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-600 transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800" aria-label="Thu nhỏ"><ZoomOut className="h-3.5 w-3.5" /></button>
        <div className="mx-0.5 h-4 w-px bg-gray-200 dark:bg-gray-700" />
        <button type="button" onClick={handleFit} className="inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-600 transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800" aria-label="Fit to screen"><Maximize2 className="h-3.5 w-3.5" /></button>
      </div>

      {/* Canvas */}
      <div
        ref={containerRef}
        className="relative h-[68vh] min-h-[520px] w-full cursor-grab touch-none select-none sm:h-[72vh]"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <div
          ref={canvasRef}
          className="relative origin-top-left will-change-transform"
          style={{ width: totalWidth, height: totalHeight }}
        >
          {/* Edges SVG */}
          <svg className="pointer-events-none absolute inset-0" width={totalWidth} height={totalHeight} style={{ overflow: 'visible' }}>
            {edges.map((edge) => <EdgeLine key={edge.id} edge={edge} />)}
          </svg>
          {/* Nodes */}
          {nodes.map((node) => (
            <NodeEl
              key={node.id}
              node={node}
              isSelected={node.taskId === selectedTaskId}
              isCollapsed={node.type === 'track' ? collapsedTracks.has(getTrackTitle(node.id)) : node.type === 'module' ? collapsedModules.has(getModuleKey(node.id)) : false}
              onSelect={onSelectTask}
              onToggle={node.type === 'track' ? () => toggleTrack(getTrackTitle(node.id)) : node.type === 'module' ? () => toggleModule(getModuleKey(node.id)) : undefined}
            />
          ))}
        </div>
      </div>
      {/* Hint */}
      <div className="absolute bottom-3 left-3 right-3 z-10 flex flex-wrap items-center justify-center gap-1.5 rounded-xl border border-gray-200/70 bg-white/90 px-3 py-2 text-[10px] font-medium text-gray-500 shadow-sm backdrop-blur-sm dark:border-gray-700 dark:bg-gray-900/90 dark:text-gray-400 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 sm:rounded-full">
        <Hand className="h-3 w-3" />
        <span className="hidden sm:inline">Kéo chuột/trackpad để di chuyển · Ctrl/⌘ + scroll để zoom · Click task để preview</span>
        <span className="sm:hidden">Kéo canvas · Chụm hai ngón để zoom · Chạm task để preview</span>
      </div>
    </div>
  );
}

// ─── Edge ────────────────────────────────────────────────────────
const EdgeLine = memo(function EdgeLine({ edge }: { edge: LayoutEdge }) {
  const { from, to } = edge;
  const dx = to.x - from.x;
  const cp = Math.abs(dx) * 0.4;
  const cp1x = from.x + (dx > 0 ? cp : -cp);
  const cp2x = to.x + (dx > 0 ? -cp : cp);
  const d = `M${from.x},${from.y} C${cp1x},${from.y} ${cp2x},${to.y} ${to.x},${to.y}`;
  const color = edge.type === 'root-track' ? 'var(--edge-root)' : edge.type === 'track-module' ? 'var(--edge-track)' : 'var(--edge-module)';
  const w = edge.type === 'root-track' ? 2.5 : edge.type === 'track-module' ? 2 : 1.5;

  return <path d={d} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" opacity={0.6} className="mindmap-edge" />;
});

// ─── Node ────────────────────────────────────────────────────────
const NodeEl = memo(function NodeEl({
  node, isSelected, isCollapsed, onSelect, onToggle,
}: {
  node: LayoutNode; isSelected: boolean; isCollapsed: boolean;
  onSelect: (id: string) => void; onToggle?: () => void;
}) {
  const isTask = node.type === 'task';
  const isClickable = isTask && node.taskId;
  const canCollapse = node.collapsible && onToggle;
  const isLeft = node.side === 'left';

  function handleClick() {
    if (isClickable) onSelect(node.taskId!);
    else if (canCollapse) onToggle();
  }

  return (
    <div
      data-mindmap-node
      className={cn(
        'mindmap-node absolute flex items-center gap-2 rounded-xl border px-3 text-[11px] font-semibold shadow-sm select-none transition-[box-shadow,transform,border-color,background-color] duration-150 active:scale-[0.98]',
        node.type === 'root' && 'justify-center rounded-2xl border-blue-200/80 bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25 dark:border-blue-800 dark:from-blue-700 dark:to-indigo-800',
        node.type === 'track' && 'cursor-pointer border-violet-200 bg-gradient-to-r from-violet-50 to-fuchsia-50 text-violet-800 hover:shadow-md dark:border-violet-800/60 dark:from-violet-950/50 dark:to-fuchsia-950/30 dark:text-violet-200',
        node.type === 'module' && 'cursor-pointer border-slate-200 bg-white text-slate-700 hover:shadow-md dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200',
        isTask && !isSelected && node.completed && 'cursor-pointer border-emerald-200/80 bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-800 hover:shadow-md dark:border-emerald-800/60 dark:from-emerald-950/40 dark:to-teal-950/30 dark:text-emerald-200',
        isTask && !isSelected && !node.completed && node.hasNote && 'cursor-pointer border-amber-200/80 bg-gradient-to-r from-amber-50 to-orange-50 text-amber-800 hover:shadow-md dark:border-amber-800/60 dark:from-amber-950/40 dark:to-orange-950/30 dark:text-amber-200',
        isTask && !isSelected && !node.completed && !node.hasNote && 'cursor-pointer border-gray-200 bg-white text-gray-600 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300',
        isTask && isSelected && 'cursor-pointer border-blue-400 bg-blue-50 text-blue-900 shadow-lg shadow-blue-500/20 ring-2 ring-blue-400/40 dark:border-blue-500 dark:bg-blue-950/60 dark:text-blue-100',
      )}
      style={{ left: node.x, top: node.y, width: node.width, height: node.height }}
      onClick={handleClick}
      role={isClickable || canCollapse ? 'button' : undefined}
      tabIndex={isClickable || canCollapse ? 0 : undefined}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      aria-label={node.fullLabel}
      title={node.fullLabel}
    >
      {canCollapse && (
        <span className={cn('flex h-4 w-4 shrink-0 items-center justify-center transition-transform duration-200', isLeft && 'order-last', isCollapsed ? (isLeft ? 'rotate-180' : 'rotate-0') : (isLeft ? '-rotate-90' : 'rotate-90'))}>
          <ChevronRight className="h-3 w-3" />
        </span>
      )}
      {isTask && (
        <span className={cn('inline-block h-2.5 w-2.5 shrink-0 rounded-full ring-2 ring-white dark:ring-gray-900', node.completed ? 'bg-emerald-500' : node.hasNote ? 'bg-amber-400' : 'bg-gray-300 dark:bg-gray-500')} />
      )}
      <span className="min-w-0 truncate">{node.label}</span>
      {canCollapse && node.childCount != null && (
        <span className={cn('shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-bold leading-none', isLeft ? 'order-first' : 'ml-auto', node.type === 'track' ? 'bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400')}>
          {node.completedCount}/{node.childCount}
        </span>
      )}
    </div>
  );
});
