import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Download, ShieldCheck } from 'lucide-react';
import { Container } from '@/components/ui';
import { WorkspaceBackupClient } from '@/components/workspace';
import roadmap from '@/data/skill-roadmap.json';

export const metadata: Metadata = {
  title: 'Workspace Backup | Nguyễn Quang Ngọc',
  description:
    'Export, import, reset localStorage và commit GitHub backup cho toàn bộ dữ liệu workspace.',
};

export default function WorkspaceBackupPage() {
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
      <header className="mb-12 border-b border-[var(--line)] pb-12">
        <div className="mb-5 flex items-center gap-3">
          <span className="rule-short" />
          <span className="eyebrow">Backup</span>
          <span className="badge ml-2">
            <ShieldCheck className="h-3 w-3" />
            Dữ liệu cá nhân
          </span>
        </div>

        <h1 className="font-serif text-4xl font-normal leading-[1.05] tracking-tight text-[var(--fg)] sm:text-5xl md:text-6xl">
          Workspace Backup
        </h1>

        <p className="mt-5 max-w-2xl text-base leading-7 text-[var(--fg-muted)] md:text-lg">
          Backup đã được tách khỏi Roadmap vì dữ liệu hiện không chỉ còn là
          tiến độ học tập. File backup bao gồm roadmap, Markdown files, note
          comments, flashcards, quiz, AI Context và AI Image Analysis history.
        </p>

        {/* Sub stats row */}
        <dl className="mt-10 grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-3">
          {[
            ['Export', 'Tải file .json về máy'],
            ['Import', 'Khôi phục từ file backup'],
            ['GitHub', 'Commit lên repository'],
          ].map(([label, sub]) => (
            <div key={label} className="flex items-baseline gap-3 border-t border-[var(--line)] pt-4">
              <Download className="h-3.5 w-3.5 shrink-0 text-[var(--fg-subtle)]" />
              <div>
                <dt className="text-sm font-semibold text-[var(--fg)]">{label}</dt>
                <dd className="mt-0.5 text-xs text-[var(--fg-subtle)]">{sub}</dd>
              </div>
            </div>
          ))}
        </dl>
      </header>

      <WorkspaceBackupClient roadmap={roadmap} />
    </Container>
  );
}