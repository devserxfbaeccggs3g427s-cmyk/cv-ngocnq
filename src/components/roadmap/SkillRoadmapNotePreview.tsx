'use client';

import { useEffect, useState } from 'react';
import { MarkdownPreview } from '@/components/markdown/MarkdownPreview';

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

type TaskContext = {
  id: string;
  title: string;
  level: string;
  estimateHours: number;
  deliverable: string;
  trackTitle: string;
  moduleTitle: string;
  depth: number;
};

const progressStorageKey = 'skill-roadmap-progress:v1';

export function SkillRoadmapNotePreview({
  taskId,
  task,
}: {
  taskId: string;
  task?: TaskContext;
}) {
  const [item, setItem] = useState<ProgressItem | null>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(progressStorageKey);
      const progress = raw ? (JSON.parse(raw) as ProgressFile) : null;
      setItem(progress?.items?.[taskId] ?? null);
    } catch {
      setItem(null);
    }
  }, [taskId]);

  const note = item?.note?.trim() ?? '';

  return (
    <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
      <aside className="rounded-lg border border-gray-200 bg-white p-4 text-sm shadow-sm dark:border-gray-800 dark:bg-gray-950 lg:sticky lg:top-24 lg:self-start">
        <h2 className="font-bold text-gray-950 dark:text-white">Thông tin task</h2>
        <dl className="mt-3 space-y-3 text-gray-600 dark:text-gray-300">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-gray-400">ID</dt>
            <dd className="mt-1 break-all font-mono text-xs">{taskId}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-gray-400">Track</dt>
            <dd className="mt-1">{task?.trackTitle ?? 'N/A'}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-gray-400">Module</dt>
            <dd className="mt-1">{task?.moduleTitle ?? 'N/A'}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-gray-400">Trạng thái</dt>
            <dd className="mt-1">{item?.completed ? 'Đã hoàn thành' : 'Chưa hoàn thành'}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-gray-400">Cập nhật</dt>
            <dd className="mt-1">{formatDate(item?.updatedAt ?? null)}</dd>
          </div>
        </dl>
      </aside>

      <article className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <div className="border-b border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 dark:border-gray-800 dark:text-gray-200">
          {taskId}.md
        </div>
        <div className="p-5">
          <MarkdownPreview content={note} />
        </div>
      </article>
    </div>
  );
}

function formatDate(value: string | null) {
  if (!value) {
    return 'N/A';
  }

  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}
