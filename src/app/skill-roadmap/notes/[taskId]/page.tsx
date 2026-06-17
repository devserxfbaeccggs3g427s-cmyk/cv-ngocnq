import type { Metadata } from 'next';
import Link from 'next/link';
import { SkillRoadmapNotePreview } from '@/components/roadmap/SkillRoadmapNotePreview';
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
  params: Promise<{ taskId: string }>;
}): Promise<Metadata> {
  const { taskId } = await params;

  return {
    title: `Preview note ${decodeURIComponent(taskId)} | Skill Roadmap`,
    description: 'Preview note của một task trong lộ trình học tập dưới dạng Markdown.',
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

export default async function TaskNotePreviewPage({
  params,
}: {
  params: Promise<{ taskId: string }>;
}) {
  const { taskId } = await params;
  const decodedTaskId = decodeURIComponent(taskId);
  const task = getTaskContexts().get(decodedTaskId);

  return (
    <Container size="lg" className="py-10 md:py-12">
      <div className="mb-6 flex min-w-0 flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
            Task Note Markdown Preview
          </p>
          <h1 className="mt-1 text-2xl font-bold text-gray-950 [overflow-wrap:anywhere] dark:text-white sm:text-3xl">
            {task?.title ?? decodedTaskId}
          </h1>
          <p className="mt-2 text-sm text-gray-600 [overflow-wrap:anywhere] dark:text-gray-300">
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

      <SkillRoadmapNotePreview taskId={decodedTaskId} task={task} />
    </Container>
  );
}
