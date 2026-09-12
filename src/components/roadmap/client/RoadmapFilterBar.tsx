'use client';

import {
  ChevronDown,
  ChevronRight,
  Search,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui';
import type { Roadmap, StudyStatusFilter } from '@/types';
import { studyStatusOptions } from '@/lib/roadmap';

interface RoadmapFilterBarProps {
  roadmap: Roadmap;
  query: string;
  setQuery: (value: string) => void;
  activeTrackId: string;
  setActiveTrackId: (value: string) => void;
  levelFilter: string;
  setLevelFilter: (value: string) => void;
  studyStatusFilter: StudyStatusFilter;
  setStudyStatusFilter: (value: StudyStatusFilter) => void;
  levels: string[];
  expandAllTasks: () => void;
  collapseAllTasks: () => void;
  loadError: string | null;
}

export function RoadmapFilterBar({
  roadmap,
  query,
  setQuery,
  activeTrackId,
  setActiveTrackId,
  levelFilter,
  setLevelFilter,
  studyStatusFilter,
  setStudyStatusFilter,
  levels,
  expandAllTasks,
  collapseAllTasks,
  loadError,
}: RoadmapFilterBarProps) {
  return (
    <Card>
      <CardContent className="p-4 md:p-5">
        <div className="grid gap-3 lg:grid-cols-[1fr_220px_180px_180px]">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--fg-subtle)]" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Tìm theo kỹ năng, task, deliverable..."
              className="input-modern h-11 w-full pl-10 pr-3 text-sm"
            />
          </label>

          <select
            value={activeTrackId}
            onChange={(event) => setActiveTrackId(event.target.value)}
            className="input-modern h-11 px-3 text-sm"
          >
            <option value="all">Tất cả nhóm kỹ năng</option>
            {roadmap.tracks.map((track) => (
              <option key={track.id} value={track.id}>
                {track.title}
              </option>
            ))}
          </select>

          <select
            value={levelFilter}
            onChange={(event) => setLevelFilter(event.target.value)}
            className="input-modern h-11 px-3 text-sm"
          >
            <option value="all">Tất cả cấp độ</option>
            {levels.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>

          <select
            value={studyStatusFilter}
            onChange={(event) => setStudyStatusFilter(event.target.value as StudyStatusFilter)}
            className="input-modern h-11 px-3 text-sm"
          >
            {studyStatusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={expandAllTasks}
            className="btn btn-secondary"
          >
            <ChevronDown className="h-4 w-4" />
            Mở tất cả
          </button>
          <button
            type="button"
            onClick={collapseAllTasks}
            className="btn btn-secondary"
          >
            <ChevronRight className="h-4 w-4" />
            Thu gọn tất cả
          </button>
        </div>

        {loadError && (
          <p className="mt-3 border border-[var(--line-strong)] bg-[var(--surface-2)] px-3 py-2 text-sm font-medium text-[var(--fg)]">
            {loadError}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
