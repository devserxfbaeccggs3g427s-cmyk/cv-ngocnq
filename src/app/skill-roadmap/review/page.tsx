import type { Metadata } from 'next';
import { Container } from '@/components/ui';
import { SkillRoadmapReviewMinimap } from '@/components/roadmap/review-minimap';
import roadmap from '@/data/skill-roadmap.json';

export const metadata: Metadata = {
  title: 'Minimap ôn tập | Skill Roadmap',
  description:
    'Tổng quan dạng minimap cho các task ôn tập trong lộ trình học tập. Click vào task để preview note.',
};

export default function SkillRoadmapReviewPage() {
  return (
    <Container size="xl" className="py-10 md:py-12">
      <SkillRoadmapReviewMinimap roadmap={roadmap} />
    </Container>
  );
}
