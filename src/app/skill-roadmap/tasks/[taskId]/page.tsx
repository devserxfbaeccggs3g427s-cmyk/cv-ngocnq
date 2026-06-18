import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SkillRoadmapTaskDetail } from '@/components/roadmap/SkillRoadmapTaskDetail';
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
  parentTasks: Array<Pick<RoadmapTask, 'id' | 'title'>>;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ taskId: string }>;
}): Promise<Metadata> {
  const { taskId } = await params;
  const decodedTaskId = decodeURIComponent(taskId);
  const task = getTaskContexts().get(decodedTaskId);

  return {
    title: `${task?.title ?? decodedTaskId} | Chi tiết task`,
    description: 'Màn hình xem chi tiết task trong skill roadmap, bao gồm thông tin task và cây task con.',
  };
}

export default async function SkillRoadmapTaskDetailPage({
  params,
}: {
  params: Promise<{ taskId: string }>;
}) {
  const { taskId } = await params;
  const decodedTaskId = decodeURIComponent(taskId);
  const task = getTaskContexts().get(decodedTaskId);

  if (!task) {
    notFound();
  }

  return (
    <Container size="lg" className="py-10 md:py-12">
      <SkillRoadmapTaskDetail task={task} />
    </Container>
  );
}

function getTaskContexts(): Map<string, TaskContext> {
  const entries = roadmap.tracks.flatMap((track) =>
    track.modules.flatMap((roadmapModule) =>
      flattenTasks(roadmapModule.tasks, track.title, roadmapModule.title)
    )
  );

  return new Map(entries.map((task) => [task.id, task]));
}

function flattenTasks(
  tasks: RoadmapTask[],
  trackTitle: string,
  moduleTitle: string,
  depth = 0,
  parentTasks: Array<Pick<RoadmapTask, 'id' | 'title'>> = []
): TaskContext[] {
  return tasks.flatMap((task) => {
    const current = {
      ...task,
      trackTitle,
      moduleTitle,
      depth,
      parentTasks,
    };

    return [
      current,
      ...flattenTasks(
        task.children ?? [],
        trackTitle,
        moduleTitle,
        depth + 1,
        [...parentTasks, { id: task.id, title: task.title }]
      ),
    ];
  });
}
