'use client';

import { CheckCircle2, ChevronDown, ChevronRight, Circle, Clock3, Copy, Eye, EyeOff, FileText, ListTree, Loader2, Save, StickyNote } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { RoadmapTask, ProgressFile } from '@/types';
import { flattenTasks, buildLearningPrompt, getTaskStudyState, levelStyles } from '@/lib/roadmap';

interface TaskNodeProps {
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
  onTitleClick?: (taskId: string) => void;
}

function getTaskDepthStyle(depth: number): string {
  if (depth === 0) return 'border-transparent bg-white dark:bg-gray-900';
  if (depth === 1) return 'border-sky-200 bg-sky-50/55 dark:border-sky-900/70 dark:bg-sky-950/15';
  if (depth === 2) return 'border-violet-200 bg-violet-50/45 dark:border-violet-900/70 dark:bg-violet-950/15';
  return 'border-amber-200 bg-amber-50/40 dark:border-amber-900/70 dark:bg-amber-950/15';
}

export function TaskNode({
  task, depth, progress, expandedTaskIds, visiblePromptIds,
  copiedPromptId, savingTaskId, onToggle, onToggleExpanded,
  onTogglePrompt, onCopyPrompt, onNoteChange, onNoteBlur, onTitleClick,
}: TaskNodeProps) {
  const item = progress.items[task.id];
  const hasNote = Boolean(item?.note.trim());
  const saving = savingTaskId === task.id;
  const childTasks = task.children ?? [];
  const descendants = flattenTasks(childTasks);
  const childCount = childTasks.length;
  const hasChildren = childTasks.length > 0;
  const completed = Boolean(item?.completed);
  const completedChildren = childTasks.filter(
    (child) => getTaskStudyState(child, progress).effectivelyCompleted
  ).length;
  const completedDescendants = descendants.filter(
    (child) => getTaskStudyState(child, progress).effectivelyCompleted
  ).length;
  const hasStartedChildren = completedDescendants > 0;
  const allChildrenCompleted = childCount > 0 && completedChildren === childCount;
  const allDescendantsCompleted = descendants.length > 0 && completedDescendants === descendants.length;
  const effectivelyCompleted = hasChildren ? allDescendantsCompleted : completed;
  const childProgressing = !effectivelyCompleted && hasStartedChildren;
  const isChild = depth > 0;
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
          childProgressing && 'border-amber-300 bg-amber-50/75 dark:border-amber-800 dark:bg-amber-950/20',
          effectivelyCompleted && 'border-emerald-300 bg-emerald-50/70 dark:border-emerald-800 dark:bg-emerald-950/20'
        )}
        style={{ paddingLeft: `calc(1.25rem + ${depth * 1.5}rem)` }}
      >
        <button
          type="button"
          onClick={hasChildren ? undefined : () => onToggle(task)}
          disabled={hasChildren}
          className={cn(
            'mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-400 transition hover:border-blue-300 hover:text-blue-600 dark:border-gray-700 dark:hover:border-blue-700',
            isChild && 'h-8 w-8',
            hasChildren && 'cursor-default hover:border-gray-200 hover:text-gray-400 disabled:opacity-100 dark:hover:border-gray-700'
          )}
          aria-label={
            hasChildren
              ? 'Trạng thái task cha tự tính theo task con'
              : effectivelyCompleted
                ? 'Bỏ đánh dấu hoàn thành'
                : 'Đánh dấu hoàn thành'
          }
          title={hasChildren ? 'Task cha tự tính trạng thái theo task con' : undefined}
        >
          {saving ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : effectivelyCompleted ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          ) : (
            <Circle className="h-5 w-5" />
          )}
        </button>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-gray-400">{task.id.toUpperCase()}</span>
            {isChild && (
              <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs font-semibold text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                Mục con cấp {depth}
              </span>
            )}
            <span className={cn('rounded-full px-2 py-0.5 text-xs font-semibold', levelStyles[task.level] ?? levelStyles['Trung cấp'])}>
              {task.level}
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              <Clock3 className="h-3.5 w-3.5" />{task.estimateHours}h
            </span>
            {childCount > 0 && (
              <span className={cn(
                'rounded-full px-2 py-0.5 text-xs font-semibold',
                childProgressing ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300',
                effectivelyCompleted && 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200'
              )}>
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
                {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>
            ) : (
              <span className="h-6 w-6 shrink-0" />
            )}
            <h4 className={cn('font-semibold leading-6 text-gray-950 dark:text-white', isChild ? 'text-sm' : 'text-base')}>
              {onTitleClick ? (
                <button
                  type="button"
                  onClick={() => onTitleClick(task.id)}
                  className="text-left transition-colors hover:text-blue-600 dark:hover:text-blue-400"
                >
                  {task.title}
                </button>
              ) : (
                task.title
              )}
            </h4>
          </div>
          <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">
            <span className="font-semibold text-gray-800 dark:text-gray-100">Kết quả cần có:</span>{' '}
            {task.deliverable}
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            <a
              href={`/skill-roadmap/tasks/${encodeURIComponent(task.id)}`}
              className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 px-2.5 py-1.5 text-xs font-semibold text-gray-700 transition hover:border-blue-300 hover:text-blue-700 dark:border-gray-700 dark:text-gray-300 dark:hover:border-blue-700 dark:hover:text-blue-300"
            >
              <ListTree className="h-3.5 w-3.5" />Chi tiết task
            </a>
          </div>

          {!hasChildren && (
            <div className="mt-3 rounded-lg border border-gray-200 bg-white/70 p-3 dark:border-gray-800 dark:bg-gray-950/50">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Prompt AI hỗ trợ học</div>
                  <p className="mt-1 line-clamp-2 text-sm text-gray-600 dark:text-gray-300">{prompt}</p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    onClick={() => onTogglePrompt(task.id)}
                    className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 px-2.5 py-1.5 text-xs font-semibold text-gray-700 transition hover:border-blue-300 hover:text-blue-700 dark:border-gray-700 dark:text-gray-300 dark:hover:border-blue-700 dark:hover:text-blue-300"
                    aria-expanded={isPromptVisible}
                  >
                    {isPromptVisible ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    {isPromptVisible ? 'Ẩn' : 'Xem'}
                  </button>
                  <button
                    type="button"
                    onClick={() => onCopyPrompt(task)}
                    className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 px-2.5 py-1.5 text-xs font-semibold text-gray-700 transition hover:border-emerald-300 hover:text-emerald-700 dark:border-gray-700 dark:text-gray-300 dark:hover:border-emerald-700 dark:hover:text-emerald-300"
                  >
                    <Copy className="h-3.5 w-3.5" />{isPromptCopied ? 'Đã copy' : 'Copy'}
                  </button>
                </div>
              </div>
              {isPromptVisible && (
                <div className="mt-3 rounded-md bg-gray-50 p-3 text-sm leading-6 text-gray-700 dark:bg-gray-900 dark:text-gray-200">{prompt}</div>
              )}
            </div>
          )}

          {!hasChildren && effectivelyCompleted && (
            <div className={cn('mt-4 rounded-lg border bg-white p-3 dark:bg-gray-950', hasNote ? 'border-emerald-200 dark:border-emerald-900/60' : 'border-red-300 dark:border-red-800')}>
              <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-gray-100">
                  <StickyNote className={cn('h-4 w-4', hasNote ? 'text-emerald-600' : 'text-red-600')} />
                  Note sau khi đã thực hiện
                </label>
                <a
                  href={`/skill-roadmap/notes/${encodeURIComponent(task.id)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 px-2.5 py-1.5 text-xs font-semibold text-gray-700 transition hover:border-blue-300 hover:text-blue-700 dark:border-gray-700 dark:text-gray-300 dark:hover:border-blue-700 dark:hover:text-blue-300"
                >
                  <FileText className="h-3.5 w-3.5" />Xem note
                </a>
              </div>
              <textarea
                value={item?.note ?? ''}
                onChange={(event) => onNoteChange(task.id, event.target.value)}
                onBlur={(event) => onNoteBlur(task.id, event.target.value)}
                rows={3}
                placeholder="Ghi lại nội dung đã học, link tài liệu, lỗi gặp phải, checklist cần ôn lại..."
                className={cn(
                  'min-h-24 w-full resize-y rounded-lg border bg-white p-3 text-sm text-gray-900 outline-none transition focus:ring-2 dark:bg-gray-900 dark:text-white',
                  hasNote ? 'border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500/20 dark:border-emerald-800' : 'border-red-300 focus:border-red-500 focus:ring-red-500/20 dark:border-red-800'
                )}
              />
              <div className="mt-2 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>
                  {item?.completedAt ? `Hoàn thành: ${new Date(item.completedAt).toLocaleString('vi-VN')}` : 'Đã đánh dấu hoàn thành'}
                </span>
                <span className="inline-flex items-center gap-1">
                  {saving ? (<><Loader2 className="h-3.5 w-3.5 animate-spin" />Đang lưu</>) : (<><Save className="h-3.5 w-3.5" />Tự lưu khi rời ô note</>)}
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
              onTitleClick={onTitleClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}
