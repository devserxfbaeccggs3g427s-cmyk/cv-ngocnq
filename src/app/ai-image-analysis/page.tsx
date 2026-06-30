import type { Metadata } from 'next';
import { AiImageAnalysisWorkspace } from '@/components/ai-image-analysis/AiImageAnalysisWorkspace';
import { Container } from '@/components/ui';

export const metadata: Metadata = {
  title: 'AI Image Analysis | Skill Roadmap',
  description: 'Upload hinh anh va yeu cau AI phan tich theo loai du lieu can tap trung.',
};

export default function AiImageAnalysisPage() {
  return (
    <Container size="xl" className="py-10 md:py-12">
      <AiImageAnalysisWorkspace />
    </Container>
  );
}
