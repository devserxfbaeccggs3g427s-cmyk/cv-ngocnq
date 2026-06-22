'use client';

import { useState } from 'react';
import type { Roadmap, RoadmapTask } from '@/types';
import { buildLearningPrompt } from '@/lib/roadmap';
import { useProgress, useGithubBackup, useRoadmapFilters } from '@/hooks';
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
    setLoadError,
    saveTask,
    toggleTask,
    updateNote,
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

  const [visiblePromptIds, setVisiblePromptIds] = useState<Set<string>>(new Set());
  const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null);
  const [isResettingProgress, setIsResettingProgress] = useState(false);

  function togglePrompt(taskId: string) {
    setVisiblePromptIds((current) => {
      const next = new Set(current);
      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }
      return next;
    });
  }

  async function copyPrompt(task: RoadmapTask) {
    const prompt = buildLearningPrompt(task);
    try {
      await navigator.clipboard.writeText(prompt);
      setCopiedPromptId(task.id);
      window.setTimeout(() => setCopiedPromptId(null), 1400);
    } catch {
      setLoadError('Không copy được prompt tự động. Vui lòng mở prompt và copy thủ công.');
    }
  }

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
            visiblePromptIds={visiblePromptIds}
            copiedPromptId={copiedPromptId}
            savingTaskId={savingTaskId}
            onToggle={toggleTask}
            onToggleExpanded={toggleExpandedTask}
            onTogglePrompt={togglePrompt}
            onCopyPrompt={copyPrompt}
            onNoteChange={updateNote}
            onNoteBlur={(taskId, note) =>
              saveTask(taskId, { completed: true, note })
            }
          />
        ))}
      </div>
    </div>
  );
}
