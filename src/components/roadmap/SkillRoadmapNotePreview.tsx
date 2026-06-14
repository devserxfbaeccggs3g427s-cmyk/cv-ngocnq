'use client';

import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';

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

function renderInlineMarkdown(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);

  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }

    return part;
  });
}

function MarkdownPreview({ content }: { content: string }) {
  const lines = content.trim() ? content.trim().split('\n') : ['_Chưa có note._'];
  const blocks: ReactNode[] = [];
  let codeBuffer: string[] = [];
  let inCode = false;

  lines.forEach((line, index) => {
    if (line.trim().startsWith('```')) {
      if (inCode) {
        blocks.push(
          <pre
            key={`code-${index}`}
            className="overflow-auto rounded-lg bg-gray-950 p-4 text-sm leading-6 text-gray-100"
          >
            <code>{codeBuffer.join('\n')}</code>
          </pre>
        );
        codeBuffer = [];
        inCode = false;
      } else {
        inCode = true;
      }

      return;
    }

    if (inCode) {
      codeBuffer.push(line);
      return;
    }

    const trimmed = line.trim();

    if (!trimmed) {
      blocks.push(<div key={`space-${index}`} className="h-3" />);
      return;
    }

    if (trimmed.startsWith('### ')) {
      blocks.push(
        <h3 key={index} className="mt-5 text-lg font-bold text-gray-950 dark:text-white">
          {renderInlineMarkdown(trimmed.slice(4))}
        </h3>
      );
      return;
    }

    if (trimmed.startsWith('## ')) {
      blocks.push(
        <h2 key={index} className="mt-6 text-xl font-bold text-gray-950 dark:text-white">
          {renderInlineMarkdown(trimmed.slice(3))}
        </h2>
      );
      return;
    }

    if (trimmed.startsWith('# ')) {
      blocks.push(
        <h1 key={index} className="text-2xl font-bold text-gray-950 dark:text-white">
          {renderInlineMarkdown(trimmed.slice(2))}
        </h1>
      );
      return;
    }

    if (trimmed.startsWith('- ')) {
      blocks.push(
        <div key={index} className="flex gap-2 text-sm leading-7 text-gray-700 dark:text-gray-200">
          <span className="mt-0.5 text-gray-400">-</span>
          <span>{renderInlineMarkdown(trimmed.slice(2))}</span>
        </div>
      );
      return;
    }

    if (trimmed.startsWith('> ')) {
      blocks.push(
        <blockquote
          key={index}
          className="border-l-4 border-blue-200 pl-4 text-sm leading-7 text-gray-600 dark:border-blue-900 dark:text-gray-300"
        >
          {renderInlineMarkdown(trimmed.slice(2))}
        </blockquote>
      );
      return;
    }

    blocks.push(
      <p key={index} className="text-sm leading-7 text-gray-700 dark:text-gray-200">
        {renderInlineMarkdown(trimmed)}
      </p>
    );
  });

  if (inCode && codeBuffer.length > 0) {
    blocks.push(
      <pre
        key="code-tail"
        className="overflow-auto rounded-lg bg-gray-950 p-4 text-sm leading-6 text-gray-100"
      >
        <code>{codeBuffer.join('\n')}</code>
      </pre>
    );
  }

  return <div className="space-y-2">{blocks}</div>;
}
