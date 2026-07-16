import type { Metadata } from 'next';
import { MarkdownBookReader } from '@/components/markdown-files';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Đọc Markdown dạng sách | Nguyễn Quang Ngọc',
  description: 'Màn hình đọc Markdown preview dạng sách toàn màn hình.',
};

export default async function GenericMarkdownReaderPage({
  params,
}: {
  params: Promise<{ readerId: string }>;
}) {
  const { readerId } = await params;

  return <MarkdownBookReader readerId={decodeURIComponent(readerId)} />;
}
