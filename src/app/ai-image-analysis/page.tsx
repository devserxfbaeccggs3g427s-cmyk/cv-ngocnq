import type { Metadata } from 'next';
import { AiImageAnalysisWorkspace } from '@/components/ai-image-analysis/AiImageAnalysisWorkspace';
import { Container } from '@/components/ui';

export const metadata: Metadata = {
  title: 'AI Image Analysis | Workspace Nguyễn Quang Ngọc',
  description: 'Upload hình ảnh và yêu cầu AI phân tích theo loại dữ liệu cần tập trung.',
};

export default function AiImageAnalysisPage() {
  return (
    <Container size="xl" className="py-10 md:py-12">
      <AiImageAnalysisWorkspace />
    </Container>
  );
}
