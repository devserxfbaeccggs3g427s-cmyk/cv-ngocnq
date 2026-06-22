import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SkillRoadmapTaskFlashcards } from '@/components/roadmap/flashcards';
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
    title: `${task?.title ?? decodedTaskId} | Flashcard`,
    description: 'Màn hình học flashcard AI theo task, dùng note và comment làm nguồn thẻ ôn tập.',
  };
}

export default async function SkillRoadmapTaskFlashcardsPage({
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
      <SkillRoadmapTaskFlashcards task={task} />
    </Container>
  );
}
