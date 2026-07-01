'use client';

import type { ChangeEvent } from 'react';
import {
  AlertTriangle,
  Download,
  Github,
  Loader2,
  Trash2,
  Upload,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui';
import { cn } from '@/lib/utils';

interface RoadmapBackupPanelProps {
  backupMessage: string | null;
  backupError: string | null;
  githubCommitUrl: string | null;
  isExporting: boolean;
  isImporting: boolean;
  isBackingUpGithub: boolean;
  hasServerGithubToken: boolean;
  githubToken: string;
  setGithubToken: (value: string) => void;
  githubRepoUrl: string;
  setGithubRepoUrl: (value: string) => void;
  githubBranch: string;
  setGithubBranch: (value: string) => void;
  githubBackupPath: string;
  setGithubBackupPath: (value: string) => void;
  githubCommitMessage: string;
  setGithubCommitMessage: (value: string) => void;
  exportProgress: () => void;
  importProgress: (event: ChangeEvent<HTMLInputElement>) => void;
  backupProgressToGithub: () => void;
  isResettingProgress: boolean;
  onResetProgress: () => void;
}

export function RoadmapBackupPanel({
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
  isResettingProgress,
  onResetProgress,
}: RoadmapBackupPanelProps) {
  return (
    <Card>
      <CardContent className="p-5 md:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-950 dark:text-white">
              Backup tiến độ học tập
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-600 dark:text-gray-300">
              Export/Import JSON là lựa chọn an toàn nhất cho backup thủ công. File
              backup hiện bao gồm cả tiến độ học tập, note, comment trong màn hình
              preview Markdown, flashcard/trắc nghiệm đã tạo, comment trong flashcard/trắc nghiệm, lịch sử AI Context độc lập và file Markdown tự tạo. GitHub backup phù hợp khi dùng riêng; token nhập tay chỉ dùng
              trong phiên commit hiện tại và không được lưu lại.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={exportProgress}
              disabled={isExporting}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
            >
              {isExporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Export JSON
            </button>

            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 transition hover:border-blue-300 hover:text-blue-700 dark:border-gray-700 dark:text-gray-300 dark:hover:border-blue-700 dark:hover:text-blue-300">
              {isImporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              Import JSON
              <input
                type="file"
                accept="application/json,.json"
                onChange={importProgress}
                disabled={isImporting}
                className="hidden"
              />
            </label>

            <button
              type="button"
              onClick={onResetProgress}
              disabled={isResettingProgress}
              className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 transition hover:border-red-300 hover:bg-red-50 disabled:opacity-60 dark:border-red-900/70 dark:text-red-300 dark:hover:border-red-800 dark:hover:bg-red-950/30"
            >
              {isResettingProgress ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              Clear localStorage
            </button>
          </div>
        </div>

        <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/25 dark:text-amber-100">
          <div className="flex gap-2">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>
              Đánh giá tính năng commit GitHub: tiện cho single-user/private repo,
              nhưng không phù hợp public app nếu không có authentication riêng. Chỉ
              dùng fine-grained token có quyền Contents: Read/Write cho đúng repo.
              Khi nhập token, trình duyệt commit trực tiếp tới GitHub để tránh giới hạn
              request body của Vercel với backup lớn.
            </p>
          </div>
        </div>

        <details className="mt-5 rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
          <summary className="flex cursor-pointer items-center gap-2 px-4 py-3 text-sm font-semibold text-gray-800 dark:text-gray-100">
            <Github className="h-4 w-4" />
            Commit backup lên GitHub
          </summary>

          <div className="grid gap-3 border-t border-gray-200 p-4 dark:border-gray-800 md:grid-cols-2">
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                GitHub token
              </span>
              <input
                type="password"
                value={githubToken}
                onChange={(event) => setGithubToken(event.target.value)}
                placeholder={hasServerGithubToken ? 'Đang dùng token từ env nếu để trống' : 'Fine-grained token'}
                className="mt-1 h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />
            </label>

            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Repo URL
              </span>
              <input
                value={githubRepoUrl}
                onChange={(event) => setGithubRepoUrl(event.target.value)}
                placeholder="https://github.com/owner/repo"
                className="mt-1 h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />
            </label>

            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Branch
              </span>
              <input
                value={githubBranch}
                onChange={(event) => setGithubBranch(event.target.value)}
                className="mt-1 h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />
            </label>

            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                File path
              </span>
              <input
                value={githubBackupPath}
                onChange={(event) => setGithubBackupPath(event.target.value)}
                className="mt-1 h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />
            </label>

            <label className="block md:col-span-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Commit message
              </span>
              <input
                value={githubCommitMessage}
                onChange={(event) => setGithubCommitMessage(event.target.value)}
                className="mt-1 h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />
            </label>

            <div className="md:col-span-2">
              <button
                type="button"
                onClick={backupProgressToGithub}
                disabled={isBackingUpGithub || (!githubToken && !hasServerGithubToken) || !githubRepoUrl || !githubBranch || !githubBackupPath}
                className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:opacity-60 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
              >
                {isBackingUpGithub ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Github className="h-4 w-4" />
                )}
                Commit backup
              </button>
            </div>
          </div>
        </details>

        {(backupMessage || backupError) && (
          <div
            className={cn(
              'mt-4 rounded-lg border px-3 py-2 text-sm',
              backupError
                ? 'border-red-200 bg-red-50 text-red-800 dark:border-red-900/60 dark:bg-red-950/25 dark:text-red-200'
                : 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/25 dark:text-emerald-200'
            )}
          >
            {backupError ?? backupMessage}
            {githubCommitUrl && (
              <a
                href={githubCommitUrl}
                target="_blank"
                rel="noreferrer"
                className="ml-2 font-semibold underline"
              >
                Xem commit
              </a>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
