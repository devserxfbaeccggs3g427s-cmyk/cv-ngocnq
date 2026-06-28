import type { Metadata } from 'next';
import { Container } from '@/components/ui';
import { MarkdownFilesClient } from '@/components/markdown-files';

export const metadata: Metadata = {
  title: 'Kho tài liệu Markdown | Nguyễn Quang Ngọc',
  description: 'Tạo thư mục cha con, lưu trữ, chỉnh sửa và preview file Markdown độc lập.',
};

export default function MarkdownFilesPage() {
  return (
    <Container size="lg" className="py-10 md:py-12">
      <MarkdownFilesClient />
    </Container>
  );
}
