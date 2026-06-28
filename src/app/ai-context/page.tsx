import type { Metadata } from 'next';
import { AiContextWorkspace } from '@/components/ai-context/AiContextWorkspace';
import { Container } from '@/components/ui';
import roadmap from '@/data/skill-roadmap.json';

export const metadata: Metadata = {
  title: 'AI Context | Skill Roadmap',
  description: 'Màn hỏi AI độc lập với context từ file Markdown tự tạo hoặc task ôn tập đã chọn.',
};

export default function AiContextPage() {
  return (
    <Container size="xl" className="py-10 md:py-12">
      <AiContextWorkspace roadmap={roadmap} />
    </Container>
  );
}
