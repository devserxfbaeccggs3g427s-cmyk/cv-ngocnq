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
      {/* BACK LINK */}
      <div className="mb-10">
        <Link
          href="/workspace"
          className="group inline-flex items-center gap-2 text-sm font-medium text-[var(--fg-muted)] transition-colors hover:text-[var(--fg)]"
        >
          <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
          Quay lại Workspace
        </Link>
      </div>

      {/* HEADER */}
      <header className="mb-10 border-b border-[var(--line)] pb-10">
        <div className="mb-5 flex items-center gap-3">
          <span className="rule-short" />
          <span className="eyebrow">Roadmap</span>
        </div>

        <h1 className="font-serif text-4xl font-normal leading-[1.05] tracking-tight text-[var(--fg)] sm:text-5xl md:text-6xl">
          Lộ trình ôn tập
        </h1>

        <p className="mt-5 max-w-2xl text-base leading-7 text-[var(--fg-muted)] md:text-lg">
          Todo list ôn tập toàn bộ kỹ năng Backend / Full-Stack từ cơ bản tới
          nâng cao, có trạng thái hoàn thành và note lưu JSON.
        </p>
      </header>

      <SkillRoadmapClient roadmap={roadmap} />
    </Container>
  );
}