'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  BookOpen,
  Brain,
  CheckCircle2,
  Circle,
  CircleHelp,
  Clock3,
  FileText,
  GitBranch,
  Layers,
  ListTree,
  StickyNote,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui';
import { cn } from '@/lib/utils';
import type { TaskContext, ProgressFile, NoteComment } from '@/types';
import {
  shouldSyncProgressFile,
  flattenTasks,
  storeProgress,
  buildLearningPrompt,
  getAdjacentLeafTasks,
  hydrateFromStorage,
  levelStyles,
  autoTaskNoteStorageKey,
  type RoadmapNavigationTask,
} from '@/lib/roadmap';
import { NoteLessonNavigation } from '@/components/roadmap/note-preview/NoteLessonNavigation';
import { ChildTaskRow } from './ChildTaskRow';
import {
  Metric,
  DetailItem,
  PathLine,
  QuizCard,
  FlashcardCard,
  LearningPromptCard,
  NoteCard,
} from './TaskDetailInfo';

type AutoTaskNoteRecord = {
  promptHash: string;
  status: 'in-flight' | 'succeeded' | 'failed' | 'skipped';
  updatedAt: string;
  message?: string;
};

type AutoTaskNoteStore = Record<string, AutoTaskNoteRecord>;

type AutoNoteStatus = 'idle' | 'generating' | 'saved' | 'skipped' | 'error';

const autoNoteInFlightCooldownMs = 10 * 60 * 1000;
const autoNoteFailedCooldownMs = 6 * 60 * 60 * 1000;

function getStableTextHash(value: string) {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) | 0;
  }

  return Math.abs(hash).toString(36);
}

function readAutoTaskNoteStore(): AutoTaskNoteStore {
  if (typeof window === 'undefined') {
    return {};
  }

  try {
    const parsed = JSON.parse(window.localStorage.getItem(autoTaskNoteStorageKey) ?? '{}') as unknown;
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? (parsed as AutoTaskNoteStore)
      : {};
  } catch {
    return {};
  }
}

function writeAutoTaskNoteRecord(taskId: string, record: AutoTaskNoteRecord) {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(
      autoTaskNoteStorageKey,
      JSON.stringify({
        ...readAutoTaskNoteStore(),
        [taskId]: record,
      })
    );
  } catch {
    // The network guard still protects the current render if localStorage is unavailable.
  }
}

function removeAutoTaskNoteRecord(taskId: string) {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const next = readAutoTaskNoteStore();
    delete next[taskId];
    window.localStorage.setItem(autoTaskNoteStorageKey, JSON.stringify(next));
  } catch {
    // If localStorage is unavailable, the retry still resets in-memory state for this render.
  }
}

function shouldSkipAutoTaskNote(taskId: string, promptHash: string) {
  const record = readAutoTaskNoteStore()[taskId];

  if (!record || record.promptHash !== promptHash) {
    return false;
  }

  const elapsedMs = Date.now() - new Date(record.updatedAt).getTime();

  if (record.status === 'succeeded') {
    return true;
  }

  if (record.status === 'in-flight' && elapsedMs < autoNoteInFlightCooldownMs) {
    return true;
  }

  return record.status === 'failed' && elapsedMs < autoNoteFailedCooldownMs;
}

export function SkillRoadmapTaskDetail({
  task,
  navigationTasks = [],
}: {
  task: TaskContext;
  navigationTasks?: RoadmapNavigationTask[];
}) {
  const [progress, setProgress] = useState<ProgressFile | null>(null);
  const [savingNote, setSavingNote] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [expandedChildTaskIds, setExpandedChildTaskIds] = useState<Set<string>>(new Set());
  const [promptVisible, setPromptVisible] = useState(false);
  const [promptCopied, setPromptCopied] = useState(false);
  const [promptCopyError, setPromptCopyError] = useState<string | null>(null);
  const [noteComments, setNoteComments] = useState<NoteComment[]>([]);
  const [autoNoteStatus, setAutoNoteStatus] = useState<AutoNoteStatus>('idle');
  const [autoNoteMessage, setAutoNoteMessage] = useState<string | null>(null);
  const [autoNoteRetryNonce, setAutoNoteRetryNonce] = useState(0);
  const progressRef = useRef<ProgressFile | null>(null);
  const autoNoteInFlightRef = useRef(false);

  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  useEffect(() => {
    return hydrateFromStorage({
      taskId: task.id,
      progressSetter: setProgress,
      commentsSetter: (_taskId, comments) => setNoteComments(comments),
    });
  }, [task.id]);

  const descendants = useMemo(() => flattenTasks(task.children ?? []), [task.children]);
  const item = progress?.items?.[task.id] ?? null;
  const completedDescendants = descendants.filter((c) => progress?.items?.[c.id]?.completed).length;
  const hasChildren = Boolean(task.children?.length);
  const hasNote = Boolean(item?.note.trim());
  const allChildrenCompleted = descendants.length > 0 && completedDescendants === descendants.length;
  const effectivelyCompleted = Boolean(item?.completed) || allChildrenCompleted;
  const childProgressing = !effectivelyCompleted && completedDescendants > 0;
  const totalChildHours = descendants.reduce((sum, child) => sum + child.estimateHours, 0);
  const learningPrompt = useMemo(() => buildLearningPrompt(task), [task]);
  const leafNavigation = useMemo(
    () => getAdjacentLeafTasks(task.id, navigationTasks),
    [navigationTasks, task.id]
  );
  const descendantSummary = useMemo(
    () =>
      descendants.length
        ? descendants
            .map((child) => {
              const childItem = progress?.items?.[child.id];
              return `- ${child.id}: ${child.title} (${childItem?.completed ? 'đã hoàn thành' : 'chưa hoàn thành'})`;
            })
            .join('\n')
        : '',
    [descendants, progress]
  );

  useEffect(() => {
    if (!progress || !hasChildren || !effectivelyCompleted || hasNote || autoNoteInFlightRef.current) {
      return;
    }

    const promptHash = getStableTextHash(learningPrompt);

    if (shouldSkipAutoTaskNote(task.id, promptHash)) {
      queueMicrotask(() => {
        setAutoNoteStatus('skipped');
        setAutoNoteMessage('Đã bỏ qua tự sinh note do đã có lần xử lý gần đây cho task này.');
      });
      return;
    }

    const controller = new AbortController();

    async function generateAndSaveTaskNote() {
      autoNoteInFlightRef.current = true;
      setAutoNoteStatus('generating');
      setAutoNoteMessage('Đang tự động sinh note cho task cha bằng AI...');
      writeAutoTaskNoteRecord(task.id, {
        promptHash,
        status: 'in-flight',
        updatedAt: new Date().toISOString(),
      });

      try {
        const response = await fetch('/api/ai/task-note', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            task: {
              id: task.id,
              title: task.title,
              level: task.level,
              deliverable: task.deliverable,
            },
            learningPrompt,
            isCompleted: effectivelyCompleted,
            hasChildren,
            hasNote,
            descendantSummary,
          }),
        });

        const payload = (await response.json().catch(() => ({}))) as {
          note?: unknown;
          error?: unknown;
        };

        if (!response.ok) {
          throw new Error(typeof payload.error === 'string' ? payload.error : 'Không tự động sinh được note.');
        }

        const generatedNote = typeof payload.note === 'string' ? payload.note.trim() : '';

        if (!generatedNote) {
          throw new Error('AI không trả về note hợp lệ.');
        }

        let nextProgressToSync: ProgressFile | null = null;
        const latestProgress = progressRef.current;
        const latestItem = latestProgress?.items?.[task.id];
        const latestHasNote = Boolean(latestItem?.note.trim());
        const latestCompleted =
          Boolean(latestItem?.completed) ||
          descendants.length > 0 &&
            descendants.every((child) => Boolean(latestProgress?.items?.[child.id]?.completed));

        if (!latestProgress || latestHasNote || !latestCompleted) {
          writeAutoTaskNoteRecord(task.id, {
            promptHash,
            status: 'skipped',
            updatedAt: new Date().toISOString(),
            message: 'Trạng thái task đã thay đổi trước khi lưu note.',
          });
          setAutoNoteStatus('skipped');
          setAutoNoteMessage('Đã bỏ qua vì task đã có note hoặc không còn đủ điều kiện lưu.');
          return;
        }

        const now = new Date().toISOString();
        nextProgressToSync = {
          ...latestProgress,
          updatedAt: now,
          items: {
            ...latestProgress.items,
            [task.id]: {
              completed: true,
              completedAt: latestItem?.completedAt ?? now,
              note: generatedNote,
              updatedAt: now,
            },
          },
        };

        setProgress(nextProgressToSync);
        storeProgress(nextProgressToSync);

        if (shouldSyncProgressFile) {
          const saveResponse = await fetch('/api/skill-roadmap/progress', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items: nextProgressToSync.items }),
          });

          if (!saveResponse.ok) {
            throw new Error('Đã lưu note vào trình duyệt, nhưng không sync được vào file JSON local.');
          }

          const saved = (await saveResponse.json()) as ProgressFile;
          setProgress(saved);
          storeProgress(saved);
        }

        writeAutoTaskNoteRecord(task.id, {
          promptHash,
          status: 'succeeded',
          updatedAt: new Date().toISOString(),
        });
        setAutoNoteStatus('saved');
        setAutoNoteMessage('Đã tự động sinh và lưu note cho task cha.');
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        const message = error instanceof Error ? error.message : 'Không tự động sinh được note.';
        writeAutoTaskNoteRecord(task.id, {
          promptHash,
          status: 'failed',
          updatedAt: new Date().toISOString(),
          message,
        });
        setAutoNoteStatus('error');
        setAutoNoteMessage(message);
      } finally {
        autoNoteInFlightRef.current = false;
      }
    }

    void generateAndSaveTaskNote();

    return () => {
      controller.abort();
      autoNoteInFlightRef.current = false;
    };
  }, [
    descendantSummary,
    descendants,
    autoNoteRetryNonce,
    effectivelyCompleted,
    hasChildren,
    hasNote,
    learningPrompt,
    progress,
    task.deliverable,
    task.id,
    task.level,
    task.title,
  ]);

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
    if (!currentProgress) return;
    setSavingNote(true);
    setSaveError(null);
    try {
      if (shouldSyncProgressFile) {
        const response = await fetch('/api/skill-roadmap/progress', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: currentProgress.items }),
        });
        if (!response.ok) throw new Error('Save failed');
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
      if (next.has(taskId)) { next.delete(taskId); } else { next.add(taskId); }
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

  function retryAutoNote() {
    if (autoNoteStatus === 'generating') {
      return;
    }

    removeAutoTaskNoteRecord(task.id);
    autoNoteInFlightRef.current = false;
    setAutoNoteStatus('idle');
    setAutoNoteMessage(null);
    setAutoNoteRetryNonce((current) => current + 1);
  }

  return (
    <div className="space-y-6 pb-24 sm:pb-0">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <Link href="/skill-roadmap" className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 transition hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
            <ArrowLeft className="h-4 w-4" /> Quay lại roadmap
          </Link>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs font-semibold uppercase text-gray-400">{task.id}</span>
            <span className={cn('rounded-full px-2 py-0.5 text-xs font-semibold', levelStyles[task.level] ?? levelStyles['Trung cấp'])}>{task.level}</span>
            {task.parentTasks.length > 0 && (
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-300">Task con cấp {task.depth}</span>
            )}
          </div>
          <h1 className="mt-2 text-2xl font-bold leading-tight text-gray-950 [overflow-wrap:anywhere] dark:text-white sm:text-3xl">{task.title}</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/skill-roadmap/tasks/${encodeURIComponent(task.id)}/flashcards`} className="inline-flex items-center justify-center gap-2 rounded-lg border border-violet-200 px-3 py-2 text-sm font-semibold text-violet-700 transition hover:border-violet-400 hover:text-violet-800 dark:border-violet-900/70 dark:text-violet-300 dark:hover:border-violet-700 dark:hover:text-violet-200">
            <Brain className="h-4 w-4" /> Flashcard
          </Link>
          <Link href={`/skill-roadmap/tasks/${encodeURIComponent(task.id)}/quiz`} className="inline-flex items-center justify-center gap-2 rounded-lg border border-cyan-200 px-3 py-2 text-sm font-semibold text-cyan-700 transition hover:border-cyan-400 hover:text-cyan-800 dark:border-cyan-900/70 dark:text-cyan-300 dark:hover:border-cyan-700 dark:hover:text-cyan-200">
            <CircleHelp className="h-4 w-4" /> Trắc nghiệm
          </Link>
          <Link href={`/skill-roadmap/notes/${encodeURIComponent(task.id)}`} className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 transition hover:border-blue-300 hover:text-blue-700 dark:border-gray-700 dark:text-gray-300 dark:hover:border-blue-700 dark:hover:text-blue-300">
            <FileText className="h-4 w-4" /> Mở note
          </Link>
        </div>
      </div>

      <NoteLessonNavigation
        previous={leafNavigation.previous}
        next={leafNavigation.next}
        hrefBuilder={(taskId) => `/skill-roadmap/tasks/${encodeURIComponent(taskId)}`}
        ariaLabel="Điều hướng chi tiết task con thấp nhất"
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Metric variant="card" icon={effectivelyCompleted ? CheckCircle2 : childProgressing ? GitBranch : Circle} label="Trạng thái" value={effectivelyCompleted ? 'Đã học' : childProgressing ? 'Đang học' : 'Chưa học'} />
        <Metric variant="card" icon={Clock3} label="Thời lượng" value={`${task.estimateHours}h`} />
        <Metric variant="card" icon={Layers} label="Task con" value={`${completedDescendants}/${descendants.length}`} />
        <Metric variant="card" icon={StickyNote} label="Note" value={hasNote ? 'Đã có' : 'Chưa có'} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <Card>
            <CardContent className="p-5 md:p-6">
              <h2 className="flex items-center gap-2 text-lg font-bold text-gray-950 dark:text-white">
                <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" /> Thông tin task
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
                <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Kết quả cần có</div>
                <p className="mt-2 text-sm leading-6 text-gray-700 dark:text-gray-200">{task.deliverable}</p>
              </div>
            </CardContent>
          </Card>

          <QuizCard taskId={task.id} commentCount={noteComments.length} />
          <FlashcardCard taskId={task.id} commentCount={noteComments.length} />
          <LearningPromptCard learningPrompt={learningPrompt} promptVisible={promptVisible} setPromptVisible={setPromptVisible} promptCopied={promptCopied} promptCopyError={promptCopyError} onCopy={copyLearningPrompt} />
          <NoteCard note={item?.note ?? ''} hasNote={hasNote} updatedAt={item?.updatedAt ?? null} savingNote={savingNote} saveError={saveError} autoNoteStatus={autoNoteStatus} autoNoteMessage={autoNoteMessage} onRetryAutoNote={retryAutoNote} onNoteChange={updateNote} onNoteBlur={saveNote} />

          <Card>
            <CardContent className="p-5 md:p-6">
              <h2 className="flex items-center gap-2 text-lg font-bold text-gray-950 dark:text-white">
                <ListTree className="h-5 w-5 text-blue-600 dark:text-blue-400" /> Task con
              </h2>
              {hasChildren ? (
                <div className="mt-4 divide-y divide-gray-100 rounded-lg border border-gray-200 dark:divide-gray-800 dark:border-gray-800">
                  {task.children?.map((child) => (
                    <ChildTaskRow key={child.id} task={child} progress={progress} depth={0} expandedTaskIds={expandedChildTaskIds} onToggleExpanded={toggleChildTask} />
                  ))}
                </div>
              ) : (
                <p className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300">Task này không có task con.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <Card>
            <CardContent className="p-5">
              <h2 className="text-sm font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">Vị trí trong lộ trình</h2>
              <div className="mt-4 space-y-3 text-sm">
                <PathLine label="Track" value={task.trackTitle} />
                <PathLine label="Module" value={task.moduleTitle} />
                {task.parentTasks.map((parent, index) => (
                  <PathLine key={parent.id} label={`Cha cấp ${index + 1}`} value={parent.title} href={`/skill-roadmap/tasks/${encodeURIComponent(parent.id)}`} />
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
