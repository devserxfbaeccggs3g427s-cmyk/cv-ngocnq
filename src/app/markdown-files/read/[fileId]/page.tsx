import type { Metadata } from 'next';
import { MarkdownBookReader } from '@/components/markdown-files';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Đọc Markdown dạng sách | Nguyễn Quang Ngọc',
  description: 'Màn hình đọc Markdown dạng sách toàn màn hình, tối ưu cho thiết bị di động.',
};

export default async function MarkdownBookReaderPage({
  params,
}: {
  params: Promise<{ fileId: string }>;
}) {
  const { fileId } = await params;

  return <MarkdownBookReader fileId={decodeURIComponent(fileId)} />;
}
