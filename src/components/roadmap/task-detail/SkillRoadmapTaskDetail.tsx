'use client';

import { useEffect, useMemo, useState } from 'react';
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
  progressStorageKey,
  commentsStorageKey,
  shouldSyncProgressFile,
  flattenTasks,
  storeProgress,
  storeComments,
  buildLearningPrompt,
} from '@/lib/roadmap';
import { ChildTaskRow } from './ChildTaskRow';
import {
  Metric,
  DetailItem,
  PathLine,
  QuizCard,
  FlashcardCard,
  LearningPromptCard,
  NoteCard,
  normalizeSeedProgress,
  readSeedComments,
} from './TaskDetailInfo';

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
  const [noteComments, setNoteComments] = useState<NoteComment[]>([]);

  useEffect(() => {
    let cancelled = false;
    let hasLocalProgress = false;
    let hasLocalComments = false;

    try {
      const raw = window.localStorage.getItem(progressStorageKey);
      hasLocalProgress = raw !== null;
      const storedProgress = raw ? (JSON.parse(raw) as ProgressFile) : null;
      window.queueMicrotask(() => setProgress(storedProgress));
    } catch {
      window.queueMicrotask(() => setProgress(null));
    }

    try {
      const raw = window.localStorage.getItem(commentsStorageKey);
      hasLocalComments = raw !== null;
      const parsed = raw ? (JSON.parse(raw) as Record<string, NoteComment[]>) : {};
      window.queueMicrotask(() => setNoteComments(Array.isArray(parsed[task.id]) ? parsed[task.id] : []));
    } catch {
      window.queueMicrotask(() => setNoteComments([]));
    }

    async function hydrateMissingSeedData() {
      if (hasLocalProgress && hasLocalComments) return;
      try {
        const response = await fetch('/api/skill-roadmap/progress', { cache: 'no-store' });
        if (!response.ok) return;
        const seed = await response.json();
        if (cancelled) return;

        if (!hasLocalProgress) {
          const seedProgress = normalizeSeedProgress(seed);
          if (seedProgress) { setProgress(seedProgress); storeProgress(seedProgress); }
        }
        if (!hasLocalComments) {
          const seedComments = readSeedComments(seed);
          storeComments(seedComments);
          setNoteComments(seedComments[task.id] ?? []);
        }
      } catch { /* browser-local data only */ }
    }

    hydrateMissingSeedData();
    return () => { cancelled = true; };
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

  return (
    <div className="space-y-6">
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Metric icon={effectivelyCompleted ? CheckCircle2 : childProgressing ? GitBranch : Circle} label="Trạng thái" value={effectivelyCompleted ? 'Đã học' : childProgressing ? 'Đang học' : 'Chưa học'} />
        <Metric icon={Clock3} label="Thời lượng" value={`${task.estimateHours}h`} />
        <Metric icon={Layers} label="Task con" value={`${completedDescendants}/${descendants.length}`} />
        <Metric icon={StickyNote} label="Note" value={hasNote ? 'Đã có' : 'Chưa có'} />
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
          <NoteCard note={item?.note ?? ''} hasNote={hasNote} updatedAt={item?.updatedAt ?? null} savingNote={savingNote} saveError={saveError} onNoteChange={updateNote} onNoteBlur={saveNote} />

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
