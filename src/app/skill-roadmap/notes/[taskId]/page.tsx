import { promises as fs } from 'fs';
import path from 'path';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { Container } from '@/components/ui';
import roadmap from '@/data/skill-roadmap.json';

export const dynamic = 'force-dynamic';

type RoadmapTask = {
  id: string;
  title: string;
  level: string;
  estimateHours: number;
  deliverable: string;
  children?: RoadmapTask[];
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

type TaskContext = RoadmapTask & {
  trackTitle: string;
  moduleTitle: string;
  depth: number;
};

const progressFilePath = path.join(
  process.cwd(),
  'src',
  'data',
  'skill-roadmap-progress.json'
);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ taskId: string }>;
}): Promise<Metadata> {
  const { taskId } = await params;

  return {
    title: `Preview note ${decodeURIComponent(taskId)} | Skill Roadmap`,
    description: 'Preview note của một task trong lộ trình học tập dưới dạng Markdown.',
  };
}

async function readProgress(): Promise<ProgressFile> {
  try {
    const raw = await fs.readFile(progressFilePath, 'utf8');
    return JSON.parse(raw) as ProgressFile;
  } catch {
    return { updatedAt: null, items: {} };
  }
}

function flattenTasks(
  tasks: RoadmapTask[],
  trackTitle: string,
  moduleTitle: string,
  depth = 0
): TaskContext[] {
  return tasks.flatMap((task) => [
    {
      ...task,
      trackTitle,
      moduleTitle,
      depth,
    },
    ...flattenTasks(task.children ?? [], trackTitle, moduleTitle, depth + 1),
  ]);
}

function getTaskContexts(): Map<string, TaskContext> {
  const entries = roadmap.tracks.flatMap((track) =>
    track.modules.flatMap((module) =>
      flattenTasks(module.tasks, track.title, module.title)
    )
  );

  return new Map(entries.map((task) => [task.id, task]));
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

export default async function TaskNotePreviewPage({
  params,
}: {
  params: Promise<{ taskId: string }>;
}) {
  const { taskId } = await params;
  const decodedTaskId = decodeURIComponent(taskId);
  const progress = await readProgress();
  const task = getTaskContexts().get(decodedTaskId);
  const item = progress.items[decodedTaskId];
  const note = item?.note?.trim() ?? '';

  return (
    <Container size="lg" className="py-10 md:py-12">
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
            Task Note Markdown Preview
          </p>
          <h1 className="mt-1 text-3xl font-bold text-gray-950 dark:text-white">
            {task?.title ?? decodedTaskId}
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            Preview note riêng của task `{decodedTaskId}`.
          </p>
        </div>
        <Link
          href="/skill-roadmap"
          className="inline-flex items-center justify-center rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 transition hover:border-blue-300 hover:text-blue-700 dark:border-gray-700 dark:text-gray-300 dark:hover:border-blue-700 dark:hover:text-blue-300"
        >
          Quay lại roadmap
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <aside className="rounded-lg border border-gray-200 bg-white p-4 text-sm shadow-sm dark:border-gray-800 dark:bg-gray-950 lg:sticky lg:top-24 lg:self-start">
          <h2 className="font-bold text-gray-950 dark:text-white">Thông tin task</h2>
          <dl className="mt-3 space-y-3 text-gray-600 dark:text-gray-300">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-gray-400">ID</dt>
              <dd className="mt-1 break-all font-mono text-xs">{decodedTaskId}</dd>
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
            {decodedTaskId}.md
          </div>
          <div className="p-5">
            <MarkdownPreview content={note} />
          </div>
        </article>
      </div>
    </Container>
  );
}
