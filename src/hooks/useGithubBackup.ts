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

type GithubErrorBody = {
  message?: string;
  documentation_url?: string;
};

type GithubDirectCommitResult = {
  commitUrl: string | null;
  path: string;
};

function parseGithubRepo(repoUrl: string): { owner: string; repo: string } | null {
  const trimmed = repoUrl.trim();
  const sshMatch = trimmed.match(/^git@github\.com:([^/]+)\/([^/]+?)(?:\.git)?$/);
  const shorthandMatch = trimmed.match(/^([^/\s]+)\/([^/\s]+?)(?:\.git)?$/);

  if (sshMatch) {
    return {
      owner: sshMatch[1],
      repo: sshMatch[2],
    };
  }

  const urlValue = trimmed.startsWith('github.com/')
    ? `https://${trimmed}`
    : trimmed;

  try {
    const url = new URL(urlValue);

    if (url.hostname === 'github.com') {
      const [owner, repo] = url.pathname
        .split('/')
        .filter(Boolean);

      if (owner && repo) {
        return {
          owner,
          repo: repo.replace(/\.git$/, ''),
        };
      }
    }
  } catch {
    // Fall through to owner/repo shorthand parsing.
  }

  if (!shorthandMatch) {
    return null;
  }

  return {
    owner: shorthandMatch[1],
    repo: shorthandMatch[2],
  };
}

function normalizeGithubPath(filePath: string): string {
  return filePath
    .trim()
    .replace(/^\/+/, '')
    .replace(/\/{2,}/g, '/');
}

function encodeGithubPath(filePath: string): string {
  return filePath
    .split('/')
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join('/');
}

function normalizeGithubErrorBody(body: unknown): GithubErrorBody {
  if (!body || typeof body !== 'object') {
    return {};
  }

  const errorBody = body as Record<string, unknown>;

  return {
    message: typeof errorBody.message === 'string' ? errorBody.message : undefined,
    documentation_url:
      typeof errorBody.documentation_url === 'string'
        ? errorBody.documentation_url
        : undefined,
  };
}

function buildGithubError(
  response: Response,
  body: GithubErrorBody,
  fallback: string,
  context?: string
): string {
  const githubMessage = body.message ? ` GitHub: ${body.message}.` : '';
  const prefix = context ? `${context}: ` : '';

  if (response.status === 401) {
    return `${prefix}GitHub token không hợp lệ hoặc đã hết hạn.${githubMessage}`;
  }

  if (response.status === 403) {
    return `${prefix}GitHub token không có đủ quyền hoặc bị chặn bởi policy/rate limit. Hãy dùng fine-grained token có quyền Contents: Read and Write cho đúng repository.${githubMessage}`;
  }

  if (response.status === 404) {
    return `${prefix}GitHub trả về Not Found. Kiểm tra repo URL, branch và token có quyền vào private repo nếu repo private.${githubMessage}`;
  }

  if (response.status === 409) {
    return `${prefix}GitHub báo conflict khi ghi file. Hãy thử lại sau khi refresh tiến độ hoặc đổi đường dẫn backup.${githubMessage}`;
  }

  if (response.status === 422) {
    return `${prefix}GitHub từ chối dữ liệu commit. Kiểm tra branch tồn tại, file path hợp lệ và commit message không rỗng.${githubMessage}`;
  }

  if (response.status === 413) {
    return `${prefix}Payload backup quá lớn cho API route hiện tại. Hãy nhập GitHub token để browser commit trực tiếp lên GitHub, hoặc giảm dung lượng backup.${githubMessage}`;
  }

  return `${prefix}${fallback}.${githubMessage}`.trim();
}

async function readResponseBody(response: Response): Promise<unknown> {
  const contentType = response.headers.get('content-type') ?? '';

  if (contentType.includes('application/json')) {
    return response.json().catch(() => ({}));
  }

  const text = await response.text().catch(() => '');
  return text ? { message: text } : {};
}

async function fetchGithubJson<T>(
  url: string,
  {
    token,
    fallbackError,
  }: {
    token: string;
    fallbackError: string;
  }
): Promise<T> {
  const response = await fetch(url, {
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });
  const body = await readResponseBody(response);

  if (!response.ok) {
    throw new Error(
      buildGithubError(
        response,
        normalizeGithubErrorBody(body),
        fallbackError,
        fallbackError
      )
    );
  }

  return body as T;
}

function utf8ToBase64(value: string): string {
  const bytes = new TextEncoder().encode(value);
  let binary = '';
  const chunkSize = 0x8000;

  for (let index = 0; index < bytes.length; index += chunkSize) {
    const chunk = bytes.subarray(index, index + chunkSize);
    binary += String.fromCharCode(...chunk);
  }

  return btoa(binary);
}

async function commitBackupDirectlyToGithub({
  token,
  repoUrl,
  branch,
  backupPath,
  commitMessage,
  progress,
}: {
  token: string;
  repoUrl: string;
  branch: string;
  backupPath: string;
  commitMessage: string;
  progress: unknown;
}): Promise<GithubDirectCommitResult> {
  const repo = parseGithubRepo(repoUrl);

  if (!repo) {
    throw new Error('GitHub repo URL phải có dạng https://github.com/owner/repo, git@github.com:owner/repo.git hoặc owner/repo');
  }

  const normalizedBackupPath = normalizeGithubPath(backupPath);

  if (!normalizedBackupPath || normalizedBackupPath.endsWith('/')) {
    throw new Error('File path phải là đường dẫn tới file, ví dụ backups/skill-roadmap-progress.json');
  }

  await fetchGithubJson(`https://api.github.com/repos/${repo.owner}/${repo.repo}`, {
    token,
    fallbackError: 'Không kiểm tra được repository GitHub',
  });

  await fetchGithubJson(
    `https://api.github.com/repos/${repo.owner}/${repo.repo}/branches/${encodeURIComponent(branch)}`,
    {
      token,
      fallbackError: 'Không kiểm tra được branch GitHub',
    }
  );

  const existingResponse = await fetch(
    `https://api.github.com/repos/${repo.owner}/${repo.repo}/contents/${encodeGithubPath(normalizedBackupPath)}?ref=${encodeURIComponent(branch)}`,
    {
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${token}`,
        'X-GitHub-Api-Version': '2022-11-28',
      },
    }
  );

  let sha: string | undefined;

  if (existingResponse.status !== 404) {
    const existingBody = await readResponseBody(existingResponse);

    if (!existingResponse.ok) {
      throw new Error(
        buildGithubError(
          existingResponse,
          normalizeGithubErrorBody(existingBody),
          'Không đọc được file backup hiện có trên GitHub',
          'Không đọc được file backup hiện có trên GitHub'
        )
      );
    }

    sha =
      existingBody &&
      typeof existingBody === 'object' &&
      !Array.isArray(existingBody) &&
      typeof (existingBody as { sha?: unknown }).sha === 'string'
        ? (existingBody as { sha: string }).sha
        : undefined;
  }

  const content = `${JSON.stringify(progress, null, 2)}\n`;
  const response = await fetch(
    `https://api.github.com/repos/${repo.owner}/${repo.repo}/contents/${encodeGithubPath(normalizedBackupPath)}`,
    {
      method: 'PUT',
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
      body: JSON.stringify({
        message: commitMessage,
        content: utf8ToBase64(content),
        branch,
        ...(sha ? { sha } : {}),
      }),
    }
  );
  const result = await readResponseBody(response);

  if (!response.ok) {
    throw new Error(
      buildGithubError(
        response,
        normalizeGithubErrorBody(result),
        'GitHub backup failed'
      )
    );
  }

  const resultBody = result as {
    commit?: { html_url?: string };
    content?: { path?: string };
  };

  return {
    commitUrl: resultBody.commit?.html_url ?? null,
    path: resultBody.content?.path ?? normalizedBackupPath,
  };
}

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
      const backup = buildRoadmapBackup(progress);
      const enteredToken = githubToken.trim();
      let result: { commitUrl?: string | null; path?: string };

      if (enteredToken) {
        result = await commitBackupDirectlyToGithub({
          token: enteredToken,
          repoUrl: githubRepoUrl,
          branch: githubBranch,
          backupPath: githubBackupPath,
          commitMessage: githubCommitMessage,
          progress: backup,
        });
      } else {
        const response = await fetch('/api/skill-roadmap/backup/github', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            repoUrl: githubRepoUrl,
            branch: githubBranch,
            backupPath: githubBackupPath,
            commitMessage: githubCommitMessage,
            progress: backup,
          }),
        });

        const responseBody = await readResponseBody(response);
        const serverResult = responseBody as {
          ok?: boolean;
          error?: string;
          commitUrl?: string | null;
          path?: string;
        };

        if (!response.ok || !serverResult.ok) {
          throw new Error(
            serverResult.error ??
              normalizeGithubErrorBody(responseBody).message ??
              'Không backup được lên GitHub.'
          );
        }

        result = serverResult;
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
