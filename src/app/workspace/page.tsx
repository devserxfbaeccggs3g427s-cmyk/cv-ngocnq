import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, Compass, Sparkles } from 'lucide-react';
import { Card, CardContent, Container } from '@/components/ui';
import { workspaceFeatures } from '@/config';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Workspace học tập & AI tools | Nguyễn Quang Ngọc',
  description:
    'Trung tâm truy cập các công cụ roadmap, Markdown, AI Context và AI Image Analysis.',
};

const accentClasses = {
  blue: {
    icon: 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-200',
    glow: 'bg-blue-500/20',
    chip: 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-200',
  },
  emerald: {
    icon: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200',
    glow: 'bg-emerald-500/20',
    chip: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200',
  },
  violet: {
    icon: 'border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-800 dark:bg-violet-950/40 dark:text-violet-200',
    glow: 'bg-violet-500/20',
    chip: 'border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-800 dark:bg-violet-950/40 dark:text-violet-200',
  },
  cyan: {
    icon: 'border-cyan-200 bg-cyan-50 text-cyan-700 dark:border-cyan-800 dark:bg-cyan-950/40 dark:text-cyan-200',
    glow: 'bg-cyan-500/20',
    chip: 'border-cyan-200 bg-cyan-50 text-cyan-700 dark:border-cyan-800 dark:bg-cyan-950/40 dark:text-cyan-200',
  },
};

export default function WorkspacePage() {
  return (
    <Container size="xl" className="py-10 md:py-14">
      <div className="premium-ring relative overflow-hidden rounded-[2rem] border border-white/60 bg-white/75 p-5 shadow-[0_28px_100px_-70px_rgba(37,99,235,0.9)] backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/75 md:p-8">
        <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute -bottom-28 left-1/4 h-72 w-72 rounded-full bg-violet-500/20 blur-3xl" />

        <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)] lg:items-end">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-200/70 bg-blue-50/80 px-3 py-1.5 text-sm font-bold text-blue-700 shadow-sm dark:border-blue-800/60 dark:bg-blue-950/40 dark:text-blue-300">
              <Compass className="h-4 w-4" />
              Workspace
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-4xl md:text-5xl">
              Trung tâm học tập và AI tools
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600 dark:text-slate-300 md:text-lg">
              Các tính năng thao tác chuyên sâu được gom vào một khu vực riêng để
              giữ portfolio gọn, còn workflow học tập/AI vẫn dễ tìm và dễ quay lại.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              [String(workspaceFeatures.length), 'Tính năng'],
              ['Local', 'Lưu dữ liệu'],
              ['AI', 'Hỗ trợ hỏi/ảnh'],
            ].map(([value, label]) => (
              <div
                key={label}
                className="rounded-3xl border border-slate-200/80 bg-white/70 px-3 py-3 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900/70"
              >
                <p className="text-lg font-black text-slate-950 dark:text-white">{value}</p>
                <p className="mt-1 text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {workspaceFeatures.map((feature) => {
          const Icon = feature.icon;
          const accent = accentClasses[feature.accent];

          return (
            <Link key={feature.href} href={feature.href} className="group block min-w-0">
              <Card hover className="relative h-full overflow-hidden">
                <div className={cn('absolute -right-16 -top-16 h-44 w-44 rounded-full blur-3xl', accent.glow)} />
                <CardContent className="relative flex h-full flex-col p-5 md:p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className={cn('flex h-12 w-12 items-center justify-center rounded-2xl border', accent.icon)}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className={cn('rounded-full border px-3 py-1 text-xs font-bold', accent.chip)}>
                      {feature.eyebrow}
                    </span>
                  </div>

                  <h2 className="mt-5 text-xl font-black tracking-tight text-slate-950 dark:text-white">
                    {feature.title}
                  </h2>
                  <p className="mt-2 flex-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
                    {feature.description}
                  </p>

                  <div className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-blue-700 transition group-hover:gap-3 dark:text-blue-300">
                    {feature.cta}
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <Card className="mt-6">
        <CardContent className="grid gap-4 p-5 md:grid-cols-[1fr_auto] md:items-center md:p-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Bố cục mới
            </div>
            <h2 className="mt-3 text-xl font-black tracking-tight text-slate-950 dark:text-white">
              Portfolio gọn hơn, công cụ có khu vực riêng
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
              Header chỉ giữ các mục tuyển dụng chính. Các workflow dài như ôn tập,
              tài liệu và AI được đưa vào Workspace để mobile dễ dùng hơn.
            </p>
          </div>
          <Link
            href="/#contact"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-2.5 text-sm font-bold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100 dark:hover:border-blue-800 dark:hover:text-blue-300"
          >
            <Sparkles className="h-4 w-4" />
            Quay về portfolio
          </Link>
        </CardContent>
      </Card>
    </Container>
  );
}
