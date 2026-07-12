import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
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
      <div className="mb-4">
        <Link
          href="/workspace"
          className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/70 px-3 py-1.5 text-sm font-bold text-slate-600 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:text-blue-700 dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-300 dark:hover:border-blue-800 dark:hover:text-blue-300"
        >
          <ArrowLeft className="h-4 w-4" />
          Workspace
        </Link>
      </div>
      <SkillRoadmapClient roadmap={roadmap} />
    </Container>
  );
}
