import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SkillRoadmapTaskDetail } from '@/components/roadmap/task-detail';
import { Container } from '@/components/ui';
import roadmap from '@/data/skill-roadmap.json';
import { getLeafTaskContexts, getTaskContexts } from '@/lib/roadmap/flatten-tasks';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ taskId: string }>;
}): Promise<Metadata> {
  const { taskId } = await params;
  const decodedTaskId = decodeURIComponent(taskId);
  const task = getTaskContexts(roadmap.tracks).get(decodedTaskId);

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
  const task = getTaskContexts(roadmap.tracks).get(decodedTaskId);
  const navigationTasks = getLeafTaskContexts(roadmap.tracks).map((leafTask) => ({
    id: leafTask.id,
    title: leafTask.title,
    trackTitle: leafTask.trackTitle,
    moduleTitle: leafTask.moduleTitle,
  }));

  if (!task) {
    notFound();
  }

  return (
    <Container size="lg" className="py-10 md:py-12">
      <SkillRoadmapTaskDetail task={task} navigationTasks={navigationTasks} />
    </Container>
  );
}
