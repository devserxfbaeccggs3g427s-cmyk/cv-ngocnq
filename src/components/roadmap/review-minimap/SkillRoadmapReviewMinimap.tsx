'use client';

import { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Grid3X3,
  Search,
} from 'lucide-react';
import type { Roadmap, StudyStatusFilter, TaskContext } from '@/types';
import {
  getLeafTaskContexts,
  getTaskStudyState,
} from '@/lib/roadmap';
import { useProgress } from '@/hooks';
import { TaskPreviewSlidePanel } from './TaskPreviewSlidePanel';
import { MinimapStats } from './MinimapStats';
import { MindmapCanvas } from './MindmapCanvas';

export function SkillRoadmapReviewMinimap({ roadmap }: { roadmap: Roadmap }) {
  const { progress, setProgress } = useProgress(roadmap);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [trackFilter, setTrackFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<StudyStatusFilter>('all');

  const leafTasks = useMemo(
    () => getLeafTaskContexts(roadmap.tracks),
    [roadmap.tracks]
  );

  const filteredTasks = useMemo(() => {
    return leafTasks.filter((task) => {
      if (trackFilter !== 'all' && task.trackTitle !== trackFilter) return false;

      if (statusFilter !== 'all') {
        const state = getTaskStudyState(task, progress);
        const item = progress.items[task.id];
        if (statusFilter === 'completed' && !state.effectivelyCompleted) return false;
        if (statusFilter === 'incomplete' && state.effectivelyCompleted) return false;
        if (statusFilter === 'with-note' && !item?.note?.trim()) return false;
      }

      if (query.trim()) {
        const lowerQuery = query.toLowerCase();
        return (
          task.title.toLowerCase().includes(lowerQuery) ||
          task.id.toLowerCase().includes(lowerQuery) ||
          task.trackTitle.toLowerCase().includes(lowerQuery) ||
          task.moduleTitle.toLowerCase().includes(lowerQuery)
        );
      }

      return true;
    });
  }, [leafTasks, trackFilter, statusFilter, query, progress]);

  const tracks = useMemo(
    () => [...new Set(leafTasks.map((t) => t.trackTitle))],
    [leafTasks]
  );

  const selectedTask = useMemo(
    () => leafTasks.find((t) => t.id === selectedTaskId) ?? null,
    [leafTasks, selectedTaskId]
  );

  const handleSelectTask = useCallback((taskId: string) => {
    setSelectedTaskId((prev) => (prev === taskId ? null : taskId));
  }, []);

  const handleClosePanel = useCallback(() => {
    setSelectedTaskId(null);
  }, []);

  const completedCount = useMemo(
    () =>
      leafTasks.filter((task) => getTaskStudyState(task, progress).effectivelyCompleted).length,
    [leafTasks, progress]
  );

  const withNoteCount = useMemo(
    () => leafTasks.filter((task) => Boolean(progress.items[task.id]?.note?.trim())).length,
    [leafTasks, progress]
  );

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900/80 md:flex-row md:items-start md:justify-between md:p-5">
        <div className="min-w-0">
          <Link
            href="/skill-roadmap"
            className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 transition hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            <ArrowLeft className="h-4 w-4" /> Quay lại roadmap
          </Link>
          <h1 className="mt-3 flex items-center gap-2 text-2xl font-bold text-gray-950 dark:text-white sm:text-3xl">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-300">
              <Grid3X3 className="h-5 w-5" />
            </span>
            <span className="min-w-0">Mindmap ôn tập</span>
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-600 dark:text-gray-300">
            Tổng quan toàn bộ lộ trình theo track, module và task. Trên mobile có thể kéo canvas, chụm hai ngón để zoom và chạm task để mở preview.
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-600 dark:border-gray-700 dark:bg-gray-800/70 dark:text-gray-300 md:max-w-xs">
          <span className="font-semibold text-gray-500 dark:text-gray-400">Chú thích:</span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-5 rounded-full bg-emerald-500" />
            Hoàn thành
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-5 rounded-full bg-amber-400 dark:bg-amber-500" />
            Có note
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-5 rounded-full bg-gray-300 dark:bg-gray-600" />
            Chưa học
          </span>
        </div>
      </div>

      {/* Stats */}
      <MinimapStats
        total={leafTasks.length}
        completed={completedCount}
        withNote={withNoteCount}
        showing={filteredTasks.length}
      />

      {/* Filters */}
      <div className="grid gap-3 rounded-xl border border-gray-200 bg-white p-3 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:grid-cols-[minmax(220px,1fr)_minmax(180px,auto)_minmax(180px,auto)]">
        <div className="relative min-w-0">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm task..."
            className="min-h-11 w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm text-gray-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />
        </div>

        <select
          value={trackFilter}
          onChange={(e) => setTrackFilter(e.target.value)}
          className="min-h-11 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
        >
          <option value="all">Tất cả track</option>
          {tracks.map((track) => (
            <option key={track} value={track}>
              {track}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StudyStatusFilter)}
          className="min-h-11 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="completed">Đã hoàn thành</option>
          <option value="incomplete">Chưa hoàn thành</option>
          <option value="with-note">Có note</option>
        </select>
      </div>

      {/* Mindmap Canvas */}
      <MindmapCanvas
        filteredTasks={filteredTasks}
        progress={progress}
        selectedTaskId={selectedTaskId}
        onSelectTask={handleSelectTask}
      />

      {/* Slide-in Panel */}
      <TaskPreviewSlidePanel
        task={selectedTask}
        progress={progress}
        onProgressChange={(nextProgress) => {
          setProgress((currentProgress) => {
            const resolvedProgress =
              typeof nextProgress === 'function' ? nextProgress(currentProgress) : nextProgress;

            return resolvedProgress ?? currentProgress;
          });
        }}
        onClose={handleClosePanel}
      />
    </div>
  );
}
