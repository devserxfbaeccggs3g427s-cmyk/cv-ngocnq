'use client';

import { useState, useMemo, useCallback } from 'react';
import type { Roadmap } from '@/types';
import { getTaskContexts } from '@/lib/roadmap';
import { useProgress, useRoadmapFilters } from '@/hooks';
import { TaskPreviewSlidePanel } from '@/components/roadmap/review-minimap/TaskPreviewSlidePanel';
import { RoadmapHeroCard } from './RoadmapHeroCard';
import { RoadmapFilterBar } from './RoadmapFilterBar';
import { RoadmapTrackCard } from './RoadmapTrackCard';

interface SkillRoadmapClientProps {
  roadmap: Roadmap;
}

export function SkillRoadmapClient({ roadmap }: SkillRoadmapClientProps) {
  const {
    progress,
    setProgress,
    allTasks,
    savingTaskId,
    loadError,
    toggleTask,
  } = useProgress(roadmap);

  const {
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
  } = useRoadmapFilters(roadmap, progress);

  const [previewTaskId, setPreviewTaskId] = useState<string | null>(null);

  const taskContextMap = useMemo(() => getTaskContexts(roadmap.tracks), [roadmap.tracks]);
  const previewTask = previewTaskId ? taskContextMap.get(previewTaskId) ?? null : null;

  const handleTitleClick = useCallback((taskId: string) => {
    setPreviewTaskId((prev) => (prev === taskId ? null : taskId));
  }, []);

  const handleClosePreview = useCallback(() => {
    setPreviewTaskId(null);
  }, []);

  return (
    <div className="space-y-8">
      <RoadmapHeroCard roadmap={roadmap} progress={progress} allTasks={allTasks} />

      <RoadmapFilterBar
        roadmap={roadmap}
        query={query}
        setQuery={setQuery}
        activeTrackId={activeTrackId}
        setActiveTrackId={setActiveTrackId}
        levelFilter={levelFilter}
        setLevelFilter={setLevelFilter}
        studyStatusFilter={studyStatusFilter}
        setStudyStatusFilter={setStudyStatusFilter}
        levels={levels}
        expandAllTasks={expandAllTasks}
        collapseAllTasks={collapseAllTasks}
        loadError={loadError}
      />

      <div className="space-y-6">
        {filteredTracks.map((track) => (
          <RoadmapTrackCard
            key={track.id}
            track={track}
            progress={progress}
            expandedTaskIds={expandedTaskIds}
            savingTaskId={savingTaskId}
            onToggle={toggleTask}
            onToggleExpanded={toggleExpandedTask}
            onTitleClick={handleTitleClick}
          />
        ))}
      </div>

      <TaskPreviewSlidePanel
        task={previewTask}
        progress={progress}
        onProgressChange={(nextProgress) => {
          setProgress((currentProgress) => {
            const resolvedProgress =
              typeof nextProgress === 'function' ? nextProgress(currentProgress) : nextProgress;

            return resolvedProgress ?? currentProgress;
          });
        }}
        onClose={handleClosePreview}
      />
    </div>
  );
}
