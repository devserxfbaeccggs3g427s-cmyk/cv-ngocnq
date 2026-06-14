'use client';

import type { ChangeEvent, ComponentType } from 'react';
import { useEffect, useMemo, useState } from 'react';
import {
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Circle,
  Clock3,
  Copy,
  Download,
  Eye,
  EyeOff,
  FileText,
  Github,
  Layers,
  Loader2,
  Save,
  Search,
  StickyNote,
  Target,
  Upload,
  AlertTriangle,
} from 'lucide-react';
import { Badge, Card, CardContent } from '@/components/ui';
import { cn } from '@/lib/utils';

type RoadmapTask = {
  id: string;
  title: string;
  level: string;
  estimateHours: number;
  deliverable: string;
  children?: RoadmapTask[];
};

type RoadmapModule = {
  id: string;
  title: string;
  tasks: RoadmapTask[];
};

type RoadmapTrack = {
  id: string;
  title: string;
  level: string;
  duration: string;
  goal: string;
  skills: string[];
  modules: RoadmapModule[];
};

type Roadmap = {
  meta: {
    owner: string;
    title: string;
    targetRole: string;
    durationWeeks: number;
    weeklyCommitment: string;
    reviewCadence: string;
  };
  tracks: RoadmapTrack[];
};

type ProgressItem = {
  completed: boolean;
  note: string;
  completedAt: string | null;
  updatedAt: string;
};

type ProgressFile = {
  updatedAt: string | null;
  items: Record<string, ProgressItem>;
};

const emptyProgress: ProgressFile = {
  updatedAt: null,
  items: {},
};

const progressStorageKey = 'skill-roadmap-progress:v1';
const shouldSyncProgressFile = process.env.NODE_ENV !== 'production';

const levelStyles: Record<string, string> = {
  'Cơ bản': 'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300',
  'Trung cấp': 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  'Nâng cao': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
  'Chuyên sâu': 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300',
};

interface SkillRoadmapClientProps {
  roadmap: Roadmap;
}

export function SkillRoadmapClient({ roadmap }: SkillRoadmapClientProps) {
  const [progress, setProgress] = useState<ProgressFile>(emptyProgress);
  const [activeTrackId, setActiveTrackId] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [savingTaskId, setSavingTaskId] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [visiblePromptIds, setVisiblePromptIds] = useState<Set<string>>(new Set());
  const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null);
  const [backupMessage, setBackupMessage] = useState<string | null>(null);
  const [backupError, setBackupError] = useState<string | null>(null);
  const [githubCommitUrl, setGithubCommitUrl] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isBackingUpGithub, setIsBackingUpGithub] = useState(false);
  const [githubToken, setGithubToken] = useState('');
  const [githubRepoUrl, setGithubRepoUrl] = useState('');
  const [githubBranch, setGithubBranch] = useState('main');
  const [githubBackupPath, setGithubBackupPath] = useState('backups/skill-roadmap-progress.json');
  const [githubCommitMessage, setGithubCommitMessage] = useState('Backup skill roadmap progress');
  const [expandedTaskIds, setExpandedTaskIds] = useState<Set<string>>(
    () => new Set(roadmap.tracks.flatMap((track) =>
      track.modules.flatMap((module) =>
        module.tasks.filter((task) => task.children?.length).map((task) => task.id)
      )
    ))
  );

  const allTasks = useMemo(
    () =>
      roadmap.tracks.flatMap((track) =>
        track.modules.flatMap((module) => flattenTasks(module.tasks))
      ),
    [roadmap.tracks]
  );

  const levels = useMemo(
    () => Array.from(new Set(allTasks.map((task) => task.level))),
    [allTasks]
  );

  const completedCount = allTasks.filter(
    (task) => progress.items[task.id]?.completed
  ).length;
  const totalHours = allTasks.reduce((sum, task) => sum + task.estimateHours, 0);
  const completedHours = allTasks
    .filter((task) => progress.items[task.id]?.completed)
    .reduce((sum, task) => sum + task.estimateHours, 0);
  const completionRate = allTasks.length
    ? Math.round((completedCount / allTasks.length) * 100)
    : 0;

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
              const searchable = collectTaskSearchText(task, module.title, track.title, track.skills);

              return matchesLevel && (!normalizedQuery || searchable.includes(normalizedQuery));
            }),
          }))
          .filter((module) => module.tasks.length > 0),
      }))
      .filter((track) => track.modules.length > 0);
  }, [activeTrackId, levelFilter, query, roadmap.tracks]);

  useEffect(() => {
    let ignore = false;

    async function loadProgress() {
      const storedProgress = readStoredProgress();

      if (storedProgress) {
        setProgress(storedProgress);
        return;
      }

      try {
        const response = await fetch('/api/skill-roadmap/progress', {
          cache: 'no-store',
        });

        if (!response.ok) {
          throw new Error('Không đọc được file tiến độ');
        }

        const data = (await response.json()) as ProgressFile;
        if (!ignore) {
          setProgress(data);
          storeProgress(data);
        }
      } catch {
        if (!ignore) {
          setLoadError('Không tải được tiến độ seed từ file JSON. Tiến độ mới vẫn được lưu trong trình duyệt này.');
        }
      }
    }

    loadProgress();

    return () => {
      ignore = true;
    };
  }, []);

  async function saveTask(taskId: string, nextItem: Partial<ProgressItem>) {
    setSavingTaskId(taskId);

    const previous = progress;
    const current = previous.items[taskId] ?? {
      completed: false,
      note: '',
      completedAt: null,
      updatedAt: new Date().toISOString(),
    };
    const optimistic: ProgressFile = {
      updatedAt: new Date().toISOString(),
      items: {
        ...previous.items,
        [taskId]: {
          ...current,
          ...nextItem,
          updatedAt: new Date().toISOString(),
        },
      },
    };

    setProgress(optimistic);
    storeProgress(optimistic);

    try {
      if (shouldSyncProgressFile) {
        const response = await fetch('/api/skill-roadmap/progress', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            taskId,
            completed: optimistic.items[taskId].completed,
            note: optimistic.items[taskId].note,
          }),
        });

        if (!response.ok) {
          throw new Error('Save failed');
        }

        const saved = (await response.json()) as ProgressFile;
        setProgress(saved);
        storeProgress(saved);
      }

      setLoadError(null);
    } catch {
      setLoadError('Đã lưu vào trình duyệt, nhưng không sync được vào file JSON local.');
    } finally {
      setSavingTaskId(null);
    }
  }

  function toggleTask(task: RoadmapTask) {
    const current = progress.items[task.id];
    saveTask(task.id, {
      completed: !current?.completed,
      note: current?.note ?? '',
      completedAt: !current?.completed ? new Date().toISOString() : null,
    });
  }

  function updateNote(taskId: string, note: string) {
    setProgress((current) => {
      const next: ProgressFile = {
        ...current,
        updatedAt: new Date().toISOString(),
        items: {
          ...current.items,
          [taskId]: {
            completed: current.items[taskId]?.completed ?? true,
            completedAt: current.items[taskId]?.completedAt ?? new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            note,
          },
        },
      };

      storeProgress(next);
      return next;
    });
  }

  function toggleExpandedTask(taskId: string) {
    setExpandedTaskIds((current) => {
      const next = new Set(current);

      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }

      return next;
    });
  }

  function expandAllTasks() {
    setExpandedTaskIds(new Set(collectExpandableTaskIds(filteredTracks)));
  }

  function collapseAllTasks() {
    setExpandedTaskIds(new Set());
  }

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

  async function exportProgress() {
    setIsExporting(true);
    setBackupError(null);
    setBackupMessage(null);

    try {
      const blob = new Blob([`${JSON.stringify(progress, null, 2)}\n`], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `skill-roadmap-progress-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      setBackupMessage('Đã export file backup JSON.');
    } catch (error) {
      setBackupError(error instanceof Error ? error.message : 'Không export được backup.');
    } finally {
      setIsExporting(false);
    }
  }

  async function importProgress(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setIsImporting(true);
    setBackupError(null);
    setBackupMessage(null);

    try {
      const text = await file.text();
      const data = normalizeProgress(JSON.parse(text));

      if (!data) {
        throw new Error('File backup không đúng định dạng. File cần có object items chứa tiến độ theo task id.');
      }

      const imported = {
        ...data,
        updatedAt: new Date().toISOString(),
      };

      setProgress(imported);
      storeProgress(imported);

      if (shouldSyncProgressFile) {
        await fetch('/api/skill-roadmap/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(imported),
        });
      }

      setBackupMessage('Đã import backup JSON vào tiến độ trong trình duyệt.');
    } catch (error) {
      setBackupError(
        error instanceof Error ? error.message : 'Không import được file backup.'
      );
    } finally {
      event.target.value = '';
      setIsImporting(false);
    }
  }

  async function backupProgressToGithub() {
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
          progress,
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
      setBackupMessage(`Đã commit backup lên GitHub: ${result.path ?? githubBackupPath}.`);
    } catch (error) {
      setBackupError(
        error instanceof Error ? error.message : 'Không backup được lên GitHub.'
      );
    } finally {
      setIsBackingUpGithub(false);
    }
  }

  return (
    <div className="space-y-8">
      <Card className="overflow-hidden">
        <CardContent className="p-6 md:p-8">
          <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                <Target className="h-4 w-4" />
                {roadmap.meta.targetRole}
              </div>
              <h1 className="text-3xl font-bold text-gray-950 dark:text-white md:text-4xl">
                {roadmap.meta.title}
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-gray-600 dark:text-gray-300">
                Lộ trình được tổng hợp từ kỹ năng thật trong CV và các dự án ngân hàng,
                thanh toán, mobile banking, xử lý nợ, bảo hiểm và hệ thống Nhật Bản.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Metric icon={CheckCircle2} label="Hoàn thành" value={`${completionRate}%`} />
              <Metric icon={Layers} label="Task" value={`${completedCount}/${allTasks.length}`} />
              <Metric icon={Clock3} label="Giờ đã ôn" value={`${completedHours}/${totalHours}`} />
              <Metric icon={CalendarDays} label="Lộ trình" value={`${roadmap.meta.durationWeeks} tuần`} />
            </div>
          </div>

          <div className="mt-6 h-3 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
            <div
              className="h-full rounded-full bg-blue-600 transition-all"
              style={{ width: `${completionRate}%` }}
            />
          </div>

          <div className="mt-5 grid gap-3 text-sm text-gray-600 dark:text-gray-300 md:grid-cols-2">
            <div className="flex items-start gap-2">
              <Clock3 className="mt-0.5 h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span>Cam kết: {roadmap.meta.weeklyCommitment}</span>
            </div>
            <div className="flex items-start gap-2">
              <BookOpen className="mt-0.5 h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span>{roadmap.meta.reviewCadence}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5 md:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-950 dark:text-white">
                Backup tiến độ học tập
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-600 dark:text-gray-300">
                Export/Import JSON là lựa chọn an toàn nhất cho backup thủ công. GitHub
                backup phù hợp khi dùng riêng; token chỉ gửi một lần tới API server và
                không được lưu lại.
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
            </div>
          </div>

          <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/25 dark:text-amber-100">
            <div className="flex gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <p>
                Đánh giá tính năng commit GitHub: tiện cho single-user/private repo,
                nhưng không phù hợp public app nếu không có authentication riêng. Chỉ
                dùng fine-grained token có quyền Contents: Read/Write cho đúng repo.
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
                  placeholder="Fine-grained token"
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
                  disabled={isBackingUpGithub || !githubToken || !githubRepoUrl || !githubBranch || !githubBackupPath}
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

      <Card>
        <CardContent className="p-4 md:p-5">
          <div className="grid gap-3 lg:grid-cols-[1fr_220px_180px]">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Tìm theo kỹ năng, task, deliverable..."
                className="h-11 w-full rounded-lg border border-gray-200 bg-white pl-10 pr-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
              />
            </label>

            <select
              value={activeTrackId}
              onChange={(event) => setActiveTrackId(event.target.value)}
              className="h-11 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
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
              className="h-11 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
            >
              <option value="all">Tất cả cấp độ</option>
              {levels.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={expandAllTasks}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition hover:border-blue-300 hover:text-blue-700 dark:border-gray-700 dark:text-gray-300 dark:hover:border-blue-700 dark:hover:text-blue-300"
            >
              <ChevronDown className="h-4 w-4" />
              Mở tất cả
            </button>
            <button
              type="button"
              onClick={collapseAllTasks}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition hover:border-blue-300 hover:text-blue-700 dark:border-gray-700 dark:text-gray-300 dark:hover:border-blue-700 dark:hover:text-blue-300"
            >
              <ChevronRight className="h-4 w-4" />
              Thu gọn tất cả
            </button>
          </div>

          {loadError && (
            <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">
              {loadError}
            </p>
          )}
        </CardContent>
      </Card>

      <div className="space-y-6">
        {filteredTracks.map((track) => {
          const trackTasks = track.modules.flatMap((module) => flattenTasks(module.tasks));
          const trackCompleted = trackTasks.filter(
            (task) => progress.items[task.id]?.completed
          ).length;
          const trackRate = Math.round((trackCompleted / trackTasks.length) * 100);

          return (
            <Card key={track.id} className="overflow-hidden">
              <div className="border-b border-gray-200 bg-white px-5 py-5 dark:border-gray-800 dark:bg-gray-900 md:px-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <Badge>{track.duration}</Badge>
                      <Badge variant="secondary">{track.level}</Badge>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {trackCompleted}/{trackTasks.length} task
                      </span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-950 dark:text-white">
                      {track.title}
                    </h2>
                    <p className="mt-2 max-w-4xl text-sm leading-6 text-gray-600 dark:text-gray-300">
                      {track.goal}
                    </p>
                  </div>

                  <div className="min-w-32">
                    <div className="mb-1 text-right text-sm font-semibold text-gray-900 dark:text-white">
                      {trackRate}%
                    </div>
                    <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-800">
                      <div
                        className="h-full rounded-full bg-blue-600"
                        style={{ width: `${trackRate}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {track.skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <CardContent className="p-0">
                {track.modules.map((module) => (
                  <div key={module.id} className="border-b border-gray-100 last:border-b-0 dark:border-gray-800">
                    <div className="bg-gray-50 px-5 py-3 dark:bg-gray-950/70 md:px-6">
                      <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300">
                        {module.title}
                      </h3>
                    </div>

                    <div className="divide-y divide-gray-100 dark:divide-gray-800">
                      {module.tasks.map((task) => (
                        <TaskNode
                          key={task.id}
                          task={task}
                          depth={0}
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
                            saveTask(taskId, {
                              completed: true,
                              note,
                            })
                          }
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function readStoredProgress(): ProgressFile | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(progressStorageKey);
    return raw ? normalizeProgress(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

function storeProgress(progress: ProgressFile) {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(progressStorageKey, JSON.stringify(progress));
  } catch {
    // localStorage can fail in private browsing or full quota. The in-memory UI still works.
  }
}

function isRecord(input: unknown): input is Record<string, unknown> {
  return Boolean(input) && typeof input === 'object' && !Array.isArray(input);
}

function normalizeProgressItem(input: unknown): ProgressItem | null {
  if (!isRecord(input)) {
    return null;
  }

  return {
    completed: Boolean(input.completed),
    note: typeof input.note === 'string' ? input.note : '',
    completedAt: typeof input.completedAt === 'string' ? input.completedAt : null,
    updatedAt: typeof input.updatedAt === 'string' ? input.updatedAt : new Date().toISOString(),
  };
}

function normalizeProgress(input: unknown): ProgressFile | null {
  if (!isRecord(input)) {
    return null;
  }

  const value = isRecord(input.progress) ? input.progress : input;
  const rawItems = isRecord(value.items) ? value.items : value;

  if (!isRecord(rawItems)) {
    return null;
  }

  const items: Record<string, ProgressItem> = {};

  for (const [taskId, item] of Object.entries(rawItems)) {
    if (taskId === 'updatedAt') {
      continue;
    }

    const progressItem = normalizeProgressItem(item);

    if (!progressItem) {
      return null;
    }

    items[taskId] = progressItem;
  }

  return {
    updatedAt: typeof value.updatedAt === 'string' ? value.updatedAt : null,
    items,
  };
}

function TaskNode({
  task,
  depth,
  progress,
  expandedTaskIds,
  visiblePromptIds,
  copiedPromptId,
  savingTaskId,
  onToggle,
  onToggleExpanded,
  onTogglePrompt,
  onCopyPrompt,
  onNoteChange,
  onNoteBlur,
}: {
  task: RoadmapTask;
  depth: number;
  progress: ProgressFile;
  expandedTaskIds: Set<string>;
  visiblePromptIds: Set<string>;
  copiedPromptId: string | null;
  savingTaskId: string | null;
  onToggle: (task: RoadmapTask) => void;
  onToggleExpanded: (taskId: string) => void;
  onTogglePrompt: (taskId: string) => void;
  onCopyPrompt: (task: RoadmapTask) => void;
  onNoteChange: (taskId: string, note: string) => void;
  onNoteBlur: (taskId: string, note: string) => void;
}) {
  const item = progress.items[task.id];
  const completed = Boolean(item?.completed);
  const saving = savingTaskId === task.id;
  const childTasks = task.children ?? [];
  const childCount = flattenTasks(childTasks).length;
  const completedChildren = flattenTasks(childTasks).filter(
    (child) => progress.items[child.id]?.completed
  ).length;
  const isChild = depth > 0;
  const hasChildren = childTasks.length > 0;
  const isExpanded = expandedTaskIds.has(task.id);
  const depthStyle = getTaskDepthStyle(depth);
  const prompt = buildLearningPrompt(task);
  const isPromptVisible = visiblePromptIds.has(task.id);
  const isPromptCopied = copiedPromptId === task.id;

  return (
    <div className="divide-y divide-gray-100 dark:divide-gray-800">
      <div
        className={cn(
          'grid gap-4 border-l-4 px-5 py-5 transition md:grid-cols-[auto_1fr] md:px-6',
          depthStyle,
          completed && 'border-emerald-300 bg-emerald-50/70 dark:border-emerald-800 dark:bg-emerald-950/20'
        )}
        style={{ paddingLeft: `calc(1.25rem + ${depth * 1.5}rem)` }}
      >
        <button
          type="button"
          onClick={() => onToggle(task)}
          className={cn(
            'mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-400 transition hover:border-blue-300 hover:text-blue-600 dark:border-gray-700 dark:hover:border-blue-700',
            isChild && 'h-8 w-8'
          )}
          aria-label={completed ? 'Bỏ đánh dấu hoàn thành' : 'Đánh dấu hoàn thành'}
        >
          {saving ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : completed ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          ) : (
            <Circle className="h-5 w-5" />
          )}
        </button>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-gray-400">
              {task.id.toUpperCase()}
            </span>
            {isChild && (
              <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs font-semibold text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                Mục con cấp {depth}
              </span>
            )}
            <span
              className={cn(
                'rounded-full px-2 py-0.5 text-xs font-semibold',
                levelStyles[task.level] ?? levelStyles['Trung cấp']
              )}
            >
              {task.level}
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              <Clock3 className="h-3.5 w-3.5" />
              {task.estimateHours}h
            </span>
            {childCount > 0 && (
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                {completedChildren}/{childCount} mục con
              </span>
            )}
          </div>

          <div className="mt-2 flex items-start gap-2">
            {hasChildren ? (
              <button
                type="button"
                onClick={() => onToggleExpanded(task.id)}
                className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
                aria-label={isExpanded ? 'Thu gọn mục con' : 'Mở mục con'}
                aria-expanded={isExpanded}
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
            ) : (
              <span className="h-6 w-6 shrink-0" />
            )}
            <h4
              className={cn(
                'font-semibold leading-6 text-gray-950 dark:text-white',
                isChild ? 'text-sm' : 'text-base'
              )}
            >
              {task.title}
            </h4>
          </div>
          <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">
            <span className="font-semibold text-gray-800 dark:text-gray-100">
              Kết quả cần có:
            </span>{' '}
            {task.deliverable}
          </p>

          <div className="mt-3 rounded-lg border border-gray-200 bg-white/70 p-3 dark:border-gray-800 dark:bg-gray-950/50">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Prompt AI hỗ trợ học
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-gray-600 dark:text-gray-300">
                  {prompt}
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={() => onTogglePrompt(task.id)}
                  className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 px-2.5 py-1.5 text-xs font-semibold text-gray-700 transition hover:border-blue-300 hover:text-blue-700 dark:border-gray-700 dark:text-gray-300 dark:hover:border-blue-700 dark:hover:text-blue-300"
                  aria-expanded={isPromptVisible}
                >
                  {isPromptVisible ? (
                    <EyeOff className="h-3.5 w-3.5" />
                  ) : (
                    <Eye className="h-3.5 w-3.5" />
                  )}
                  {isPromptVisible ? 'Ẩn' : 'Xem'}
                </button>
                <button
                  type="button"
                  onClick={() => onCopyPrompt(task)}
                  className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 px-2.5 py-1.5 text-xs font-semibold text-gray-700 transition hover:border-emerald-300 hover:text-emerald-700 dark:border-gray-700 dark:text-gray-300 dark:hover:border-emerald-700 dark:hover:text-emerald-300"
                >
                  <Copy className="h-3.5 w-3.5" />
                  {isPromptCopied ? 'Đã copy' : 'Copy'}
                </button>
              </div>
            </div>

            {isPromptVisible && (
              <div className="mt-3 rounded-md bg-gray-50 p-3 text-sm leading-6 text-gray-700 dark:bg-gray-900 dark:text-gray-200">
                {prompt}
              </div>
            )}
          </div>

          {completed && (
            <div className="mt-4 rounded-lg border border-emerald-100 bg-white p-3 dark:border-emerald-900/50 dark:bg-gray-950">
              <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-gray-100">
                  <StickyNote className="h-4 w-4 text-emerald-600" />
                  Note sau khi đã thực hiện
                </label>
                <a
                  href={`/skill-roadmap/notes/${encodeURIComponent(task.id)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 px-2.5 py-1.5 text-xs font-semibold text-gray-700 transition hover:border-blue-300 hover:text-blue-700 dark:border-gray-700 dark:text-gray-300 dark:hover:border-blue-700 dark:hover:text-blue-300"
                >
                  <FileText className="h-3.5 w-3.5" />
                  Xem note
                </a>
              </div>
              <textarea
                value={item?.note ?? ''}
                onChange={(event) => onNoteChange(task.id, event.target.value)}
                onBlur={(event) => onNoteBlur(task.id, event.target.value)}
                rows={3}
                placeholder="Ghi lại nội dung đã học, link tài liệu, lỗi gặp phải, checklist cần ôn lại..."
                className="min-h-24 w-full resize-y rounded-lg border border-gray-200 bg-white p-3 text-sm text-gray-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />
              <div className="mt-2 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>
                  {item?.completedAt
                    ? `Hoàn thành: ${new Date(item.completedAt).toLocaleString('vi-VN')}`
                    : 'Đã đánh dấu hoàn thành'}
                </span>
                <span className="inline-flex items-center gap-1">
                  {saving ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Đang lưu
                    </>
                  ) : (
                    <>
                      <Save className="h-3.5 w-3.5" />
                      Tự lưu khi rời ô note
                    </>
                  )}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {hasChildren && isExpanded && (
        <div>
          {childTasks.map((child) => (
            <TaskNode
              key={child.id}
              task={child}
              depth={depth + 1}
              progress={progress}
              expandedTaskIds={expandedTaskIds}
              visiblePromptIds={visiblePromptIds}
              copiedPromptId={copiedPromptId}
              savingTaskId={savingTaskId}
              onToggle={onToggle}
              onToggleExpanded={onToggleExpanded}
              onTogglePrompt={onTogglePrompt}
              onCopyPrompt={onCopyPrompt}
              onNoteChange={onNoteChange}
              onNoteBlur={onNoteBlur}
            />
          ))}
        </div>
      )}
    </div>
  );
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

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-950">
      <Icon className="mb-3 h-5 w-5 text-blue-600 dark:text-blue-400" />
      <div className="text-2xl font-bold text-gray-950 dark:text-white">{value}</div>
      <div className="mt-1 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
        {label}
      </div>
    </div>
  );
}

function getTaskDepthStyle(depth: number): string {
  if (depth === 0) {
    return 'border-transparent bg-white dark:bg-gray-900';
  }

  if (depth === 1) {
    return 'border-sky-200 bg-sky-50/55 dark:border-sky-900/70 dark:bg-sky-950/15';
  }

  if (depth === 2) {
    return 'border-violet-200 bg-violet-50/45 dark:border-violet-900/70 dark:bg-violet-950/15';
  }

  return 'border-amber-200 bg-amber-50/40 dark:border-amber-900/70 dark:bg-amber-950/15';
}

function buildLearningPrompt(task: RoadmapTask): string {
  return [
    'Bạn là mentor Backend/Senior Engineer, ưu tiên dạy lý thuyết và bản chất.',
    `Hãy giúp tôi học mục: "${task.title}".`,
    `Mục tiêu cần đạt: ${task.deliverable}.`,
    'Trình bày theo 6 phần: định nghĩa ngắn, cơ chế bên trong/nó xử lý thế nào, vì sao cần dùng, trade-off và khi không nên dùng, câu hỏi phỏng vấn đào sâu kèm đáp án, ví dụ nhỏ để kiểm chứng hiểu biết.',
  ].join(' ');
}

function flattenTasks(tasks: RoadmapTask[]): RoadmapTask[] {
  return tasks.flatMap((task) => [
    task,
    ...flattenTasks(task.children ?? []),
  ]);
}

function filterTaskTree(
  tasks: RoadmapTask[],
  predicate: (task: RoadmapTask) => boolean
): RoadmapTask[] {
  return tasks.flatMap((task) => {
    const children = filterTaskTree(task.children ?? [], predicate);

    if (predicate(task) || children.length > 0) {
      return [{
        ...task,
        children,
      }];
    }

    return [];
  });
}

function collectTaskSearchText(
  task: RoadmapTask,
  moduleTitle: string,
  trackTitle: string,
  skills: string[]
): string {
  return [
    task.title,
    task.deliverable,
    task.level,
    moduleTitle,
    trackTitle,
    ...skills,
    ...flattenTasks(task.children ?? []).flatMap((child) => [
      child.title,
      child.deliverable,
      child.level,
    ]),
  ]
    .join(' ')
    .toLowerCase();
}
