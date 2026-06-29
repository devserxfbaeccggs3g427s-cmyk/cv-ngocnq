'use client';

import { useState, useMemo, useCallback } from 'react';
import type { Roadmap } from '@/types';
import { getTaskContexts } from '@/lib/roadmap';
import { useProgress, useGithubBackup, useRoadmapFilters } from '@/hooks';
import { TaskPreviewSlidePanel } from '@/components/roadmap/review-minimap/TaskPreviewSlidePanel';
import { RoadmapHeroCard } from './RoadmapHeroCard';
import { RoadmapBackupPanel } from './RoadmapBackupPanel';
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
    resetProgress,
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

  const {
    backupMessage,
    backupError,
    githubCommitUrl,
    isExporting,
    isImporting,
    isBackingUpGithub,
    hasServerGithubToken,
    githubToken,
    setGithubToken,
    githubRepoUrl,
    setGithubRepoUrl,
    githubBranch,
    setGithubBranch,
    githubBackupPath,
    setGithubBackupPath,
    githubCommitMessage,
    setGithubCommitMessage,
    exportProgress,
    importProgress,
    backupProgressToGithub,
  } = useGithubBackup(progress, setProgress);

  const [isResettingProgress, setIsResettingProgress] = useState(false);
  const [previewTaskId, setPreviewTaskId] = useState<string | null>(null);

  const taskContextMap = useMemo(() => getTaskContexts(roadmap.tracks), [roadmap.tracks]);
  const previewTask = previewTaskId ? taskContextMap.get(previewTaskId) ?? null : null;

  const handleTitleClick = useCallback((taskId: string) => {
    setPreviewTaskId((prev) => (prev === taskId ? null : taskId));
  }, []);

  const handleClosePreview = useCallback(() => {
    setPreviewTaskId(null);
  }, []);

  async function resetProgressFromProject() {
    setIsResettingProgress(true);
    try {
      await resetProgress();
    } catch {
      // resetProgress handles the confirm dialog internally
    } finally {
      setIsResettingProgress(false);
    }
  }

  return (
    <div className="space-y-8">
      <RoadmapHeroCard roadmap={roadmap} progress={progress} allTasks={allTasks} />

      <RoadmapBackupPanel
        backupMessage={backupMessage}
        backupError={backupError}
        githubCommitUrl={githubCommitUrl}
        isExporting={isExporting}
        isImporting={isImporting}
        isBackingUpGithub={isBackingUpGithub}
        hasServerGithubToken={hasServerGithubToken}
        githubToken={githubToken}
        setGithubToken={setGithubToken}
        githubRepoUrl={githubRepoUrl}
        setGithubRepoUrl={setGithubRepoUrl}
        githubBranch={githubBranch}
        setGithubBranch={setGithubBranch}
        githubBackupPath={githubBackupPath}
        setGithubBackupPath={setGithubBackupPath}
        githubCommitMessage={githubCommitMessage}
        setGithubCommitMessage={setGithubCommitMessage}
        exportProgress={exportProgress}
        importProgress={importProgress}
        backupProgressToGithub={backupProgressToGithub}
        isResettingProgress={isResettingProgress}
        onResetProgress={resetProgressFromProject}
      />

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
