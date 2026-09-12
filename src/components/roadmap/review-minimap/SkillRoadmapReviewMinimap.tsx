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
  studyStatusOptions,
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
      <div className="card flex flex-col gap-4 p-4 md:flex-row md:items-start md:justify-between md:p-5">
        <div className="min-w-0">
          <Link
            href="/skill-roadmap"
            className="link-editorial inline-flex min-h-10 items-center gap-2 sm:min-h-0 sm:text-sm"
          >
            <ArrowLeft className="h-4 w-4" /> Quay lại roadmap
          </Link>
          <h1 className="mt-3 flex items-center gap-2 font-serif text-[1.65rem] font-normal leading-tight text-[var(--fg)] sm:text-3xl">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-card)] border border-[var(--line)] bg-[var(--surface)] text-[var(--accent)]">
              <Grid3X3 className="h-5 w-5" />
            </span>
            <span className="min-w-0">Mindmap ôn tập</span>
          </h1>
          <p className="mt-2 max-w-2xl text-base leading-7 text-[var(--fg-muted)] sm:text-sm sm:leading-relaxed">
            Tổng quan toàn bộ lộ trình theo track, module và task. Trên mobile có thể kéo canvas, chụm hai ngón để zoom và chạm task để mở preview.
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-2 rounded-[var(--radius-card)] border border-[var(--line)] bg-[var(--surface-2)] px-3 py-2 text-sm text-[var(--fg-muted)] md:max-w-xs">
          <span className="font-semibold text-[var(--fg)]">Chú thích:</span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-5 rounded-full bg-[var(--success)]" />
            Hoàn thành
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-5 rounded-full bg-[var(--warn)]" />
            Có note
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-5 rounded-full bg-[var(--line-strong)]" />
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
      <div className="card grid gap-3 p-3 sm:grid-cols-[minmax(220px,1fr)_minmax(180px,auto)_minmax(180px,auto)]">
        <label className="relative min-w-0">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--fg-subtle)] sm:h-4 sm:w-4" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm task..."
            className="input-modern min-h-12 w-full py-2 pl-10 pr-3 text-base sm:min-h-11 sm:pl-9 sm:text-sm"
          />
        </label>

        <select
          value={trackFilter}
          onChange={(e) => setTrackFilter(e.target.value)}
          className="input-modern min-h-12 w-full px-3 py-2 text-base sm:min-h-11 sm:text-sm"
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
          className="input-modern min-h-12 w-full px-3 py-2 text-base sm:min-h-11 sm:text-sm"
        >
          {studyStatusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
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
