'use client';

import { useState, useMemo, useCallback } from 'react';
import type { Roadmap, RoadmapTrack, ProgressFile, StudyStatusFilter } from '@/types';
import {
  flattenTasks,
  filterTaskTree,
  matchesTaskStudyStatus,
  collectTaskSearchText,
} from '@/lib/roadmap';

/**
 * Filter/search/expand state hook for the roadmap view.
 * Manages track filter, level filter, study status filter, search query,
 * and task expansion state.
 */
export function useRoadmapFilters(roadmap: Roadmap, progress: ProgressFile) {
  const [activeTrackId, setActiveTrackId] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');
  const [studyStatusFilter, setStudyStatusFilter] = useState<StudyStatusFilter>('all');
  const [query, setQuery] = useState('');
  const [expandedTaskIds, setExpandedTaskIds] = useState<Set<string>>(
    () => new Set(roadmap.tracks.flatMap((track) =>
      track.modules.flatMap((module) =>
        module.tasks.filter((task) => task.children?.length).map((task) => task.id)
      )
    ))
  );

  const levels = useMemo(
    () => {
      const allTasks = roadmap.tracks.flatMap((track) =>
        track.modules.flatMap((module) => flattenTasks(module.tasks))
      );
      return Array.from(new Set(allTasks.map((task) => task.level)));
    },
    [roadmap.tracks]
  );

  const filteredTracks = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return roadmap.tracks
      .filter((track) => activeTrackId === 'all' || track.id === activeTrackId)
      .map((track) => ({
        ...track,
        modules: track.modules
          .map((module) => ({
            ...module,
            tasks: filterTaskTree(module.tasks, (task) => {
              const matchesLevel = levelFilter === 'all' || task.level === levelFilter;
              const matchesStudyStatus = matchesTaskStudyStatus(task, progress, studyStatusFilter);
              const searchable = collectTaskSearchText(task, module.title, track.title, track.skills);

              return matchesLevel
                && matchesStudyStatus
                && (!normalizedQuery || searchable.includes(normalizedQuery));
            }),
          }))
          .filter((module) => module.tasks.length > 0),
      }))
      .filter((track) => track.modules.length > 0);
  }, [activeTrackId, levelFilter, progress, query, roadmap.tracks, studyStatusFilter]);

  const toggleExpandedTask = useCallback(
    (taskId: string) => {
      setExpandedTaskIds((current) => {
        const next = new Set(current);

        if (next.has(taskId)) {
          next.delete(taskId);
        } else {
          next.add(taskId);
        }

        return next;
      });
    },
    []
  );

  const expandAllTasks = useCallback(() => {
    setExpandedTaskIds(new Set(collectExpandableTaskIds(filteredTracks)));
  }, [filteredTracks]);

  const collapseAllTasks = useCallback(() => {
    setExpandedTaskIds(new Set());
  }, []);

  return {
    activeTrackId,
    setActiveTrackId,
    levelFilter,
    setLevelFilter,
    studyStatusFilter,
    setStudyStatusFilter,
    query,
    setQuery,
    expandedTaskIds,
    levels,
    filteredTracks,
    toggleExpandedTask,
    expandAllTasks,
    collapseAllTasks,
  };
}

function collectExpandableTaskIds(tracks: RoadmapTrack[]): string[] {
  return tracks.flatMap((track) =>
    track.modules.flatMap((module) =>
      flattenTasks(module.tasks)
        .filter((task) => task.children?.length)
        .map((task) => task.id)
    )
  );
}
