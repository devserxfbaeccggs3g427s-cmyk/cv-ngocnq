'use client';

import { useState, useEffect, useCallback } from 'react';
import type { ChangeEvent } from 'react';
import type { ProgressFile, GithubBackupConfig } from '@/types';
import {
  shouldSyncProgressFile,
  storeProgress,
  storeComments,
  storeFlashcards,
  storeQuizzes,
  storeStudyComments,
  storeMarkdownFiles,
  normalizeRoadmapBackup,
  buildRoadmapBackup,
} from '@/lib/roadmap';

/**
 * GitHub backup config + push logic hook.
 * Manages backup/export/import state and GitHub commit functionality.
 */
export function useGithubBackup(
  progress: ProgressFile,
  setProgress: (p: ProgressFile) => void
) {
  const [backupMessage, setBackupMessage] = useState<string | null>(null);
  const [backupError, setBackupError] = useState<string | null>(null);
  const [githubCommitUrl, setGithubCommitUrl] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isBackingUpGithub, setIsBackingUpGithub] = useState(false);
  const [hasServerGithubToken, setHasServerGithubToken] = useState(false);
  const [githubToken, setGithubToken] = useState('');
  const [githubRepoUrl, setGithubRepoUrl] = useState('');
  const [githubBranch, setGithubBranch] = useState('main');
  const [githubBackupPath, setGithubBackupPath] = useState('backups/skill-roadmap-progress.json');
  const [githubCommitMessage, setGithubCommitMessage] = useState('Backup skill roadmap progress');

  useEffect(() => {
    let ignore = false;

    async function loadGithubBackupConfig() {
      try {
        const response = await fetch('/api/skill-roadmap/backup/github', {
          cache: 'no-store',
        });

        if (!response.ok) {
          return;
        }

        const config = (await response.json()) as Partial<GithubBackupConfig>;

        if (ignore) {
          return;
        }

        if (typeof config.repoUrl === 'string' && config.repoUrl) {
          setGithubRepoUrl(config.repoUrl);
        }

        if (typeof config.branch === 'string' && config.branch) {
          setGithubBranch(config.branch);
        }

        if (typeof config.backupPath === 'string' && config.backupPath) {
          setGithubBackupPath(config.backupPath);
        }

        if (typeof config.commitMessage === 'string' && config.commitMessage) {
          setGithubCommitMessage(config.commitMessage);
        }

        setHasServerGithubToken(Boolean(config.hasServerToken));
      } catch {
        setHasServerGithubToken(false);
      }
    }

    loadGithubBackupConfig();

    return () => {
      ignore = true;
    };
  }, []);

  const exportProgress = useCallback(async () => {
    setIsExporting(true);
    setBackupError(null);
    setBackupMessage(null);

    try {
      const backup = buildRoadmapBackup(progress);
      const blob = new Blob([`${JSON.stringify(backup, null, 2)}\n`], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `skill-roadmap-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      setBackupMessage('Đã export file backup JSON gồm tiến độ học tập, note comment, flashcard, trắc nghiệm, comment trong flashcard/trắc nghiệm, lịch sử AI Context độc lập và file Markdown tự tạo.');
    } catch (error) {
      setBackupError(error instanceof Error ? error.message : 'Không export được backup.');
    } finally {
      setIsExporting(false);
    }
  }, [progress]);

  const importProgress = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];

      if (!file) {
        return;
      }

      setIsImporting(true);
      setBackupError(null);
      setBackupMessage(null);

      try {
        const text = await file.text();
        const data = normalizeRoadmapBackup(JSON.parse(text));

        if (!data) {
          throw new Error('File backup không đúng định dạng. File cần có progress/items hoặc backup tổng hợp gồm progress, comments, flashcards, quizzes, studyComments và markdownFiles.');
        }

        const imported: ProgressFile = {
          ...data.progress,
          updatedAt: new Date().toISOString(),
        };

        setProgress(imported);
        storeProgress(imported);
        storeComments(data.comments);
        storeFlashcards(data.flashcards);
        storeQuizzes(data.quizzes);
        storeStudyComments(data.studyComments);
        storeMarkdownFiles(data.markdownFiles);

        if (shouldSyncProgressFile) {
          await fetch('/api/skill-roadmap/progress', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              version: 6,
              exportedAt: new Date().toISOString(),
              progress: imported,
              comments: data.comments,
              flashcards: data.flashcards,
              quizzes: data.quizzes,
              studyComments: data.studyComments,
              markdownFiles: data.markdownFiles,
            }),
          });
        }

        setBackupMessage('Đã import backup JSON vào trình duyệt, bao gồm tiến độ học tập, note comment, flashcard, trắc nghiệm, comment trong flashcard/trắc nghiệm, lịch sử AI Context độc lập và file Markdown tự tạo.');
      } catch (error) {
        setBackupError(
          error instanceof Error ? error.message : 'Không import được file backup.'
        );
      } finally {
        event.target.value = '';
        setIsImporting(false);
      }
    },
    [setProgress]
  );

  const backupProgressToGithub = useCallback(async () => {
    setIsBackingUpGithub(true);
    setBackupError(null);
    setBackupMessage(null);
    setGithubCommitUrl(null);

    try {
      const response = await fetch('/api/skill-roadmap/backup/github', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: githubToken,
          repoUrl: githubRepoUrl,
          branch: githubBranch,
          backupPath: githubBackupPath,
          commitMessage: githubCommitMessage,
          progress: buildRoadmapBackup(progress),
        }),
      });

      const result = (await response.json()) as {
        ok?: boolean;
        error?: string;
        commitUrl?: string | null;
        path?: string;
      };

      if (!response.ok || !result.ok) {
        throw new Error(result.error ?? 'Không backup được lên GitHub.');
      }

      setGithubToken('');
      setGithubCommitUrl(result.commitUrl ?? null);
      setBackupMessage(`Đã commit backup gồm tiến độ, comment, flashcard, trắc nghiệm, lịch sử AI Context và file Markdown lên GitHub: ${result.path ?? githubBackupPath}.`);
    } catch (error) {
      setBackupError(
        error instanceof Error ? error.message : 'Không backup được lên GitHub.'
      );
    } finally {
      setIsBackingUpGithub(false);
    }
  }, [githubToken, githubRepoUrl, githubBranch, githubBackupPath, githubCommitMessage, progress]);

  return {
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
  };
}
