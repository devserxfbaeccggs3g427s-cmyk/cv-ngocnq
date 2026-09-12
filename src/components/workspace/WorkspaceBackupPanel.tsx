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

interface WorkspaceBackupPanelProps {
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

export function WorkspaceBackupPanel({
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
}: WorkspaceBackupPanelProps) {
  return (
    <Card>
      <CardContent className="p-5 md:p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="mb-3 flex items-center gap-3">
              <span className="rule-short" />
              <span className="eyebrow">Backup</span>
            </div>
            <h2 className="font-serif text-2xl leading-tight text-[var(--fg)]">
              Backup dữ liệu Workspace
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--fg-muted)]">
              Export/Import JSON là lựa chọn an toàn nhất cho backup thủ công. File
              backup hiện bao gồm tiến độ roadmap, note, comment trong màn hình
              preview Markdown, flashcard/trắc nghiệm, comment trong flashcard/trắc nghiệm,
              lịch sử AI Context, lịch sử AI Image Analysis và file Markdown tự tạo.
              GitHub backup phù hợp khi dùng riêng; token nhập tay chỉ dùng trong phiên
              commit hiện tại và không được lưu lại.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={exportProgress}
              disabled={isExporting}
              className="btn btn-primary"
            >
              {isExporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Export JSON
            </button>

            <label className="btn btn-secondary cursor-pointer">
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
              className="btn btn-ghost"
            >
              {isResettingProgress ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              Reset Workspace
            </button>
          </div>
        </div>

        <div className="mt-6 border border-[var(--line)] bg-[var(--surface-2)] p-4 text-sm leading-6 text-[var(--fg-muted)]">
          <div className="flex gap-2">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--warn)]" />
            <p>
              Đánh giá tính năng commit GitHub: tiện cho single-user/private repo,
              nhưng không phù hợp public app nếu không có authentication riêng. Chỉ
              dùng fine-grained token có quyền Contents: Read/Write cho đúng repo.
              Khi nhập token, trình duyệt commit trực tiếp tới GitHub để tránh giới hạn
              request body của Vercel với backup lớn.
            </p>
          </div>
        </div>

        <details className="mt-6 overflow-hidden rounded-[var(--radius-card)] border border-[var(--line)] bg-[var(--surface)]">
          <summary className="flex cursor-pointer items-center gap-2 px-4 py-3 text-sm font-semibold text-[var(--fg)] transition-colors hover:bg-[var(--surface-2)]">
            <Github className="h-4 w-4" />
            Commit backup lên GitHub
          </summary>

          <div className="grid gap-4 border-t border-[var(--line)] p-4 md:grid-cols-2">
            <label className="block">
              <span className="eyebrow">GitHub token</span>
              <input
                type="password"
                value={githubToken}
                onChange={(event) => setGithubToken(event.target.value)}
                placeholder={hasServerGithubToken ? 'Đang dùng token từ env nếu để trống' : 'Fine-grained token'}
                className="input-modern mt-1.5 h-10"
              />
            </label>

            <label className="block">
              <span className="eyebrow">Repo URL</span>
              <input
                value={githubRepoUrl}
                onChange={(event) => setGithubRepoUrl(event.target.value)}
                placeholder="https://github.com/owner/repo"
                className="input-modern mt-1.5 h-10"
              />
            </label>

            <label className="block">
              <span className="eyebrow">Branch</span>
              <input
                value={githubBranch}
                onChange={(event) => setGithubBranch(event.target.value)}
                className="input-modern mt-1.5 h-10"
              />
            </label>

            <label className="block">
              <span className="eyebrow">File path</span>
              <input
                value={githubBackupPath}
                onChange={(event) => setGithubBackupPath(event.target.value)}
                className="input-modern mt-1.5 h-10"
              />
            </label>

            <label className="block md:col-span-2">
              <span className="eyebrow">Commit message</span>
              <input
                value={githubCommitMessage}
                onChange={(event) => setGithubCommitMessage(event.target.value)}
                className="input-modern mt-1.5 h-10"
              />
            </label>

            <div className="md:col-span-2">
              <button
                type="button"
                onClick={backupProgressToGithub}
                disabled={isBackingUpGithub || (!githubToken && !hasServerGithubToken) || !githubRepoUrl || !githubBranch || !githubBackupPath}
                className="btn btn-primary"
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
              'mt-4 border px-3 py-2 text-sm font-medium',
              backupError
                ? 'border-[var(--line-strong)] bg-[var(--surface-2)] text-[var(--fg)]'
                : 'border-[var(--line-strong)] bg-[var(--surface-2)] text-[var(--fg)]'
            )}
          >
            {backupError ?? backupMessage}
            {githubCommitUrl && (
              <a
                href={githubCommitUrl}
                target="_blank"
                rel="noreferrer"
                className="ml-2 font-semibold link-underline text-[var(--accent)]"
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
