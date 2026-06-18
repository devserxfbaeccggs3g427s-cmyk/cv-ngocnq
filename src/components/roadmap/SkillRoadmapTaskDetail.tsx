'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Circle,
  Clock3,
  Copy,
  Eye,
  EyeOff,
  FileText,
  GitBranch,
  Layers,
  Loader2,
  ListTree,
  Save,
  StickyNote,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui';
import { cn } from '@/lib/utils';

type RoadmapTask = {
  id: string;
  title: string;
  level: string;
  estimateHours: number;
  deliverable: string;
  children?: RoadmapTask[];
};

type TaskContext = RoadmapTask & {
  trackTitle: string;
  moduleTitle: string;
  depth: number;
  parentTasks: Array<Pick<RoadmapTask, 'id' | 'title'>>;
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

const progressStorageKey = 'skill-roadmap-progress:v1';
const shouldSyncProgressFile = process.env.NODE_ENV !== 'production';

const levelStyles: Record<string, string> = {
  'Cơ bản': 'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300',
  'Trung cấp': 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  'Nâng cao': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
  'Chuyên sâu': 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300',
};

export function SkillRoadmapTaskDetail({ task }: { task: TaskContext }) {
  const [progress, setProgress] = useState<ProgressFile | null>(null);
  const [savingNote, setSavingNote] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [expandedChildTaskIds, setExpandedChildTaskIds] = useState<Set<string>>(new Set());
  const [promptVisible, setPromptVisible] = useState(false);
  const [promptCopied, setPromptCopied] = useState(false);
  const [promptCopyError, setPromptCopyError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(progressStorageKey);
      const storedProgress = raw ? (JSON.parse(raw) as ProgressFile) : null;
      window.queueMicrotask(() => setProgress(storedProgress));
    } catch {
      window.queueMicrotask(() => setProgress(null));
    }
  }, [task.id]);

  const descendants = useMemo(() => flattenTasks(task.children ?? []), [task.children]);
  const item = progress?.items?.[task.id] ?? null;
  const completedDescendants = descendants.filter((child) => progress?.items?.[child.id]?.completed).length;
  const hasChildren = Boolean(task.children?.length);
  const hasNote = Boolean(item?.note.trim());
  const allChildrenCompleted = descendants.length > 0 && completedDescendants === descendants.length;
  const effectivelyCompleted = Boolean(item?.completed) || allChildrenCompleted;
  const childProgressing = !effectivelyCompleted && completedDescendants > 0;
  const totalChildHours = descendants.reduce((sum, child) => sum + child.estimateHours, 0);
  const learningPrompt = useMemo(() => buildLearningPrompt(task), [task]);

  function updateNote(note: string) {
    setProgress((current) => {
      const now = new Date().toISOString();
      const currentProgress = current ?? { updatedAt: null, items: {} };
      const currentItem = currentProgress.items[task.id];
      const next: ProgressFile = {
        updatedAt: now,
        items: {
          ...currentProgress.items,
          [task.id]: {
            completed: currentItem?.completed ?? true,
            completedAt: currentItem?.completedAt ?? now,
            note,
            updatedAt: now,
          },
        },
      };

      storeProgress(next);
      return next;
    });
  }

  async function saveNote() {
    const currentProgress = progress;

    if (!currentProgress) {
      return;
    }

    setSavingNote(true);
    setSaveError(null);

    try {
      if (shouldSyncProgressFile) {
        const response = await fetch('/api/skill-roadmap/progress', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: currentProgress.items,
          }),
        });

        if (!response.ok) {
          throw new Error('Save failed');
        }

        const saved = (await response.json()) as ProgressFile;
        setProgress(saved);
        storeProgress(saved);
      }
    } catch {
      setSaveError('Đã lưu note vào trình duyệt, nhưng không sync được vào file JSON local.');
    } finally {
      setSavingNote(false);
    }
  }

  function toggleChildTask(taskId: string) {
    setExpandedChildTaskIds((current) => {
      const next = new Set(current);

      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }

      return next;
    });
  }

  async function copyLearningPrompt() {
    setPromptCopyError(null);

    try {
      await navigator.clipboard.writeText(learningPrompt);
      setPromptCopied(true);
      window.setTimeout(() => setPromptCopied(false), 1400);
    } catch {
      setPromptCopyError('Không copy được prompt tự động. Vui lòng mở prompt và copy thủ công.');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <Link
            href="/skill-roadmap"
            className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 transition hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại roadmap
          </Link>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs font-semibold uppercase text-gray-400">{task.id}</span>
            <span className={cn('rounded-full px-2 py-0.5 text-xs font-semibold', levelStyles[task.level] ?? levelStyles['Trung cấp'])}>
              {task.level}
            </span>
            {task.parentTasks.length > 0 && (
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                Task con cấp {task.depth}
              </span>
            )}
          </div>
          <h1 className="mt-2 text-2xl font-bold leading-tight text-gray-950 [overflow-wrap:anywhere] dark:text-white sm:text-3xl">
            {task.title}
          </h1>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href={`/skill-roadmap/notes/${encodeURIComponent(task.id)}`}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 transition hover:border-blue-300 hover:text-blue-700 dark:border-gray-700 dark:text-gray-300 dark:hover:border-blue-700 dark:hover:text-blue-300"
          >
            <FileText className="h-4 w-4" />
            Mở note
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Metric
          icon={effectivelyCompleted ? CheckCircle2 : childProgressing ? GitBranch : Circle}
          label="Trạng thái"
          value={effectivelyCompleted ? 'Đã học' : childProgressing ? 'Đang học' : 'Chưa học'}
        />
        <Metric icon={Clock3} label="Thời lượng" value={`${task.estimateHours}h`} />
        <Metric icon={Layers} label="Task con" value={`${completedDescendants}/${descendants.length}`} />
        <Metric icon={StickyNote} label="Note" value={hasNote ? 'Đã có' : 'Chưa có'} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <Card>
            <CardContent className="p-5 md:p-6">
              <h2 className="flex items-center gap-2 text-lg font-bold text-gray-950 dark:text-white">
                <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                Thông tin task
              </h2>
              <dl className="mt-4 grid gap-4 text-sm md:grid-cols-2">
                <DetailItem label="Track" value={task.trackTitle} />
                <DetailItem label="Module" value={task.moduleTitle} />
                <DetailItem label="ID" value={task.id} mono />
                <DetailItem label="Cấp độ" value={task.level} />
                <DetailItem label="Ước tính" value={`${task.estimateHours} giờ`} />
                <DetailItem label="Tổng giờ task con" value={`${totalChildHours} giờ`} />
              </dl>

              <div className="mt-5 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-950">
                <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Kết quả cần có
                </div>
                <p className="mt-2 text-sm leading-6 text-gray-700 dark:text-gray-200">
                  {task.deliverable}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 md:p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <h2 className="flex items-center gap-2 text-lg font-bold text-gray-950 dark:text-white">
                    <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    Prompt AI hỗ trợ học
                  </h2>
                  <p className="mt-3 line-clamp-2 text-sm leading-6 text-gray-600 dark:text-gray-300">
                    {learningPrompt}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    onClick={() => setPromptVisible((visible) => !visible)}
                    className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 px-2.5 py-1.5 text-xs font-semibold text-gray-700 transition hover:border-blue-300 hover:text-blue-700 dark:border-gray-700 dark:text-gray-300 dark:hover:border-blue-700 dark:hover:text-blue-300"
                    aria-expanded={promptVisible}
                  >
                    {promptVisible ? (
                      <EyeOff className="h-3.5 w-3.5" />
                    ) : (
                      <Eye className="h-3.5 w-3.5" />
                    )}
                    {promptVisible ? 'Ẩn' : 'Xem'}
                  </button>
                  <button
                    type="button"
                    onClick={copyLearningPrompt}
                    className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 px-2.5 py-1.5 text-xs font-semibold text-gray-700 transition hover:border-emerald-300 hover:text-emerald-700 dark:border-gray-700 dark:text-gray-300 dark:hover:border-emerald-700 dark:hover:text-emerald-300"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    {promptCopied ? 'Đã copy' : 'Copy'}
                  </button>
                </div>
              </div>

              {promptVisible && (
                <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm leading-6 text-gray-700 [overflow-wrap:anywhere] dark:border-gray-800 dark:bg-gray-950 dark:text-gray-200">
                  {learningPrompt}
                </div>
              )}

              {promptCopyError && (
                <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">
                  {promptCopyError}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 md:p-6">
              <h2 className="flex items-center gap-2 text-lg font-bold text-gray-950 dark:text-white">
                <StickyNote className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                Note
              </h2>
              <textarea
                value={item?.note ?? ''}
                onChange={(event) => updateNote(event.target.value)}
                onBlur={saveNote}
                rows={8}
                placeholder="Ghi lại nội dung đã học, link tài liệu, lỗi gặp phải, checklist cần ôn lại..."
                className={cn(
                  'mt-4 min-h-48 w-full resize-y rounded-lg border bg-white p-3 text-sm text-gray-900 outline-none transition focus:ring-2 dark:bg-gray-900 dark:text-white',
                  hasNote
                    ? 'border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500/20 dark:border-emerald-800'
                    : 'border-red-300 focus:border-red-500 focus:ring-red-500/20 dark:border-red-800'
                )}
              />
              <div className="mt-2 flex flex-col gap-2 text-xs text-gray-500 dark:text-gray-400 sm:flex-row sm:items-center sm:justify-between">
                <span>Cập nhật: {formatDate(item?.updatedAt ?? null)}</span>
                <span className="inline-flex items-center gap-1">
                  {savingNote ? (
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
              {saveError && (
                <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">
                  {saveError}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 md:p-6">
              <h2 className="flex items-center gap-2 text-lg font-bold text-gray-950 dark:text-white">
                <ListTree className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                Task con
              </h2>
              {hasChildren ? (
                <div className="mt-4 divide-y divide-gray-100 rounded-lg border border-gray-200 dark:divide-gray-800 dark:border-gray-800">
                  {task.children?.map((child) => (
                    <ChildTaskRow
                      key={child.id}
                      task={child}
                      progress={progress}
                      depth={0}
                      expandedTaskIds={expandedChildTaskIds}
                      onToggleExpanded={toggleChildTask}
                    />
                  ))}
                </div>
              ) : (
                <p className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300">
                  Task này không có task con.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <Card>
            <CardContent className="p-5">
              <h2 className="text-sm font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Vị trí trong lộ trình
              </h2>
              <div className="mt-4 space-y-3 text-sm">
                <PathLine label="Track" value={task.trackTitle} />
                <PathLine label="Module" value={task.moduleTitle} />
                {task.parentTasks.map((parent, index) => (
                  <PathLine
                    key={parent.id}
                    label={`Cha cấp ${index + 1}`}
                    value={parent.title}
                    href={`/skill-roadmap/tasks/${encodeURIComponent(parent.id)}`}
                  />
                ))}
                <PathLine label="Task hiện tại" value={task.title} active />
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}

function ChildTaskRow({
  task,
  progress,
  depth,
  expandedTaskIds,
  onToggleExpanded,
}: {
  task: RoadmapTask;
  progress: ProgressFile | null;
  depth: number;
  expandedTaskIds: Set<string>;
  onToggleExpanded: (taskId: string) => void;
}) {
  const descendants = flattenTasks(task.children ?? []);
  const completedDescendants = descendants.filter((child) => progress?.items?.[child.id]?.completed).length;
  const completed = Boolean(progress?.items?.[task.id]?.completed) || (descendants.length > 0 && completedDescendants === descendants.length);
  const hasChildren = Boolean(task.children?.length);
  const isExpanded = expandedTaskIds.has(task.id);

  return (
    <div className="p-4" style={{ paddingLeft: `calc(1rem + ${depth * 1.25}rem)` }}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs font-semibold uppercase text-gray-400">{task.id}</span>
            <span className={cn('rounded-full px-2 py-0.5 text-xs font-semibold', levelStyles[task.level] ?? levelStyles['Trung cấp'])}>
              {task.level}
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              <Clock3 className="h-3.5 w-3.5" />
              {task.estimateHours}h
            </span>
            {descendants.length > 0 && (
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                {completedDescendants}/{descendants.length} mục con
              </span>
            )}
          </div>
          <div className="mt-2 flex items-start gap-2">
            {hasChildren ? (
              <button
                type="button"
                onClick={() => onToggleExpanded(task.id)}
                className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
                aria-label={isExpanded ? 'Thu gọn task con' : 'Mở task con'}
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
            <h3 className="text-sm font-semibold leading-6 text-gray-950 dark:text-white">
              {task.title}
            </h3>
          </div>
          <p className="mt-1 text-sm leading-6 text-gray-600 dark:text-gray-300">
            {task.deliverable}
          </p>
        </div>
        <Link
          href={`/skill-roadmap/tasks/${encodeURIComponent(task.id)}`}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 transition hover:border-blue-300 hover:text-blue-700 dark:border-gray-700 dark:text-gray-300 dark:hover:border-blue-700 dark:hover:text-blue-300"
        >
          <ListTree className="h-3.5 w-3.5" />
          Chi tiết
        </Link>
      </div>
      {completed && (
        <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Đã học
        </div>
      )}
      {hasChildren && isExpanded ? (
        <div className="mt-3 divide-y divide-gray-100 border-l border-gray-200 dark:divide-gray-800 dark:border-gray-800">
          {task.children?.map((child) => (
            <ChildTaskRow
              key={child.id}
              task={child}
              progress={progress}
              depth={depth + 1}
              expandedTaskIds={expandedTaskIds}
              onToggleExpanded={onToggleExpanded}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <Icon className="mb-3 h-5 w-5 text-blue-600 dark:text-blue-400" />
        <div className="text-xl font-bold text-gray-950 dark:text-white">{value}</div>
        <div className="mt-1 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
          {label}
        </div>
      </CardContent>
    </Card>
  );
}

function DetailItem({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">{label}</dt>
      <dd className={cn('mt-1 text-gray-900 [overflow-wrap:anywhere] dark:text-gray-100', mono && 'font-mono text-xs')}>
        {value}
      </dd>
    </div>
  );
}

function PathLine({
  label,
  value,
  href,
  active = false,
}: {
  label: string;
  value: string;
  href?: string;
  active?: boolean;
}) {
  const content = (
    <div
      className={cn(
        'rounded-lg border px-3 py-2',
        active
          ? 'border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-900/60 dark:bg-blue-950/30 dark:text-blue-100'
          : 'border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-200'
      )}
    >
      <div className="text-xs font-semibold uppercase tracking-wide text-gray-400">{label}</div>
      <div className="mt-1 leading-5 [overflow-wrap:anywhere]">{value}</div>
    </div>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}

function flattenTasks(tasks: RoadmapTask[]): RoadmapTask[] {
  return tasks.flatMap((task) => [
    task,
    ...flattenTasks(task.children ?? []),
  ]);
}

function buildLearningPrompt(task: RoadmapTask): string {
  return [
    'Bạn là mentor Backend/Senior Engineer, ưu tiên dạy lý thuyết và bản chất.',
    `Hãy giúp tôi học mục: "${task.title}".`,
    `Mục tiêu cần đạt: ${task.deliverable}.`,
    'Trình bày theo 6 phần: định nghĩa ngắn, cơ chế bên trong/nó xử lý thế nào, vì sao cần dùng, trade-off và khi không nên dùng, câu hỏi phỏng vấn đào sâu kèm đáp án, ví dụ nhỏ để kiểm chứng hiểu biết.',
  ].join(' ');
}

function storeProgress(progress: ProgressFile) {
  try {
    window.localStorage.setItem(progressStorageKey, JSON.stringify(progress));
  } catch {
    // The in-memory UI still reflects the note if localStorage is unavailable.
  }
}

function formatDate(value: string | null): string {
  if (!value) {
    return 'Chưa có dữ liệu';
  }

  return new Date(value).toLocaleString('vi-VN');
}
