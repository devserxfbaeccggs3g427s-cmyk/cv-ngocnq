import type { Metadata } from 'next';
import Link from 'next/link';
import { MarkdownCommentThreadDetail } from '@/components/roadmap/MarkdownCommentThreads';
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

type TaskContext = RoadmapTask & {
  trackTitle: string;
  moduleTitle: string;
  depth: number;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ taskId: string; commentId: string }>;
}): Promise<Metadata> {
  const { taskId, commentId } = await params;

  return {
    title: `Thread ${decodeURIComponent(commentId)} | ${decodeURIComponent(taskId)}`,
    description: 'Chi tiết thread comment của Markdown note trong skill roadmap.',
  };
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

export default async function MarkdownCommentThreadPage({
  params,
}: {
  params: Promise<{ taskId: string; commentId: string }>;
}) {
  const { taskId, commentId } = await params;
  const decodedTaskId = decodeURIComponent(taskId);
  const decodedCommentId = decodeURIComponent(commentId);
  const task = getTaskContexts().get(decodedTaskId);
  const noteHref = `/skill-roadmap/notes/${encodeURIComponent(decodedTaskId)}`;

  return (
    <Container size="md" className="py-10 md:py-12">
      <div className="mb-6 flex min-w-0 flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
            Markdown Comment Thread
          </p>
          <h1 className="mt-1 text-2xl font-bold text-gray-950 [overflow-wrap:anywhere] dark:text-white sm:text-3xl">
            {task?.title ?? decodedTaskId}
          </h1>
          <p className="mt-2 text-sm text-gray-600 [overflow-wrap:anywhere] dark:text-gray-300">
            Thread `{decodedCommentId}` của note `{decodedTaskId}`.
          </p>
        </div>
        <Link
          href={noteHref}
          className="inline-flex items-center justify-center rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 transition hover:border-blue-300 hover:text-blue-700 dark:border-gray-700 dark:text-gray-300 dark:hover:border-blue-700 dark:hover:text-blue-300"
        >
          Quay lại note
        </Link>
      </div>

      <MarkdownCommentThreadDetail
        taskId={decodedTaskId}
        commentId={decodedCommentId}
        backHref={noteHref}
      />
    </Container>
  );
}
