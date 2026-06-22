import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SkillRoadmapTaskQuiz } from '@/components/roadmap/quiz';
import { Container } from '@/components/ui';
import roadmap from '@/data/skill-roadmap.json';
import { getTaskContexts } from '@/lib/roadmap/flatten-tasks';

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
    title: `${task?.title ?? decodedTaskId} | Trắc nghiệm`,
    description: 'Màn hình làm bài trắc nghiệm AI theo task, dùng note và comment làm nguồn câu hỏi.',
  };
}

export default async function SkillRoadmapTaskQuizPage({
  params,
}: {
  params: Promise<{ taskId: string }>;
}) {
  const { taskId } = await params;
  const decodedTaskId = decodeURIComponent(taskId);
  const task = getTaskContexts(roadmap.tracks).get(decodedTaskId);

  if (!task) {
    notFound();
  }

  return (
    <Container size="lg" className="py-10 md:py-12">
      <SkillRoadmapTaskQuiz task={task} />
    </Container>
  );
}
