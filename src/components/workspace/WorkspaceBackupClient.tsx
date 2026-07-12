'use client';

import { useState } from 'react';
import { useGithubBackup, useProgress } from '@/hooks';
import type { Roadmap } from '@/types';
import { WorkspaceBackupPanel } from './WorkspaceBackupPanel';

export function WorkspaceBackupClient({ roadmap }: { roadmap: Roadmap }) {
  const { progress, setProgress, resetProgress } = useProgress(roadmap);
  const [isResettingProgress, setIsResettingProgress] = useState(false);

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

  async function resetWorkspaceData() {
    setIsResettingProgress(true);
    try {
      await resetProgress();
    } catch {
      // resetProgress owns the confirmation and error handling contract.
    } finally {
      setIsResettingProgress(false);
    }
  }

  return (
    <WorkspaceBackupPanel
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
      onResetProgress={resetWorkspaceData}
    />
  );
}
