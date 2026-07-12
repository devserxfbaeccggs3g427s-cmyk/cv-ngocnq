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
      <div className="premium-ring relative mb-6 overflow-hidden rounded-[2rem] border border-white/60 bg-white/75 p-5 shadow-[0_28px_100px_-70px_rgba(37,99,235,0.9)] backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/75 md:p-7">
        <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl" />

        <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(260px,0.8fr)] lg:items-end">
          <div>
            <Link
              href="/workspace"
              className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 transition hover:text-slate-950 dark:text-slate-300 dark:hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Workspace
            </Link>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200">
              <ShieldCheck className="h-3.5 w-3.5" />
              Dữ liệu cá nhân
            </div>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 dark:text-white md:text-4xl">
              Workspace Backup
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300 md:text-base md:leading-7">
              Backup đã được tách khỏi Roadmap vì dữ liệu hiện không chỉ còn là
              tiến độ học tập. File backup bao gồm roadmap, Markdown files, note
              comments, flashcards, quiz, AI Context và AI Image Analysis history.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200/80 bg-white/70 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200">
                <Download className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-black text-slate-950 dark:text-white">
                  Export / Import / GitHub
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                  Một nơi duy nhất cho dữ liệu local của workspace.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <WorkspaceBackupClient roadmap={roadmap} />
    </Container>
  );
}
