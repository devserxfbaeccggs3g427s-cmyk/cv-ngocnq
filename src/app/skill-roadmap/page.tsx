import type { Metadata } from 'next';
import { Container } from '@/components/ui';
import { SkillRoadmapClient } from '@/components/roadmap/client';
import roadmap from '@/data/skill-roadmap.json';

export const metadata: Metadata = {
  title: 'Lộ trình ôn tập kỹ năng | Nguyễn Quang Ngọc',
  description:
    'Todo list ôn tập toàn bộ kỹ năng Backend / Full-Stack từ cơ bản tới nâng cao, có trạng thái hoàn thành và note lưu JSON.',
};

export default function SkillRoadmapPage() {
  return (
    <Container size="lg" className="py-10 md:py-12">
      <SkillRoadmapClient roadmap={roadmap} />
    </Container>
  );
}
