import type { Metadata } from 'next';
import { Container, Section } from '@/components/ui';
import { ProjectGrid } from '@/components/portfolio';
import { profile } from '@/data/profile';
import { projects } from '@/data/projects';

export const metadata: Metadata = {
  title: `Dự án | ${profile.name}`,
  description: `Các dự án và kinh nghiệm triển khai của ${profile.name}`,
};

export default function PortfolioPage() {
  const featuredCount = projects.filter((project) => project.featured).length;

  return (
    <Container size="lg" className="py-10 md:py-14">
      <div className="premium-ring relative overflow-hidden rounded-[2rem] border border-white/60 bg-white/70 p-6 shadow-[0_28px_100px_-70px_rgba(37,99,235,0.9)] backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/72 md:p-8">
        <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="relative grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <p className="mb-3 inline-flex rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-bold text-blue-700 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-300">
              Portfolio triển khai thực tế
            </p>
            <h1 className="text-4xl font-black tracking-tight text-slate-950 dark:text-white md:text-5xl">
              Dự án và hệ thống đã tham gia
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600 dark:text-slate-300">
              Tập trung vào backend, tích hợp ngân hàng/thanh toán, vận hành production và các hệ thống có yêu cầu ổn định cao.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="rounded-3xl border border-slate-200/80 bg-white/70 px-5 py-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
              <div className="text-3xl font-black text-slate-950 dark:text-white">{projects.length}</div>
              <div className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Dự án</div>
            </div>
            <div className="rounded-3xl border border-slate-200/80 bg-white/70 px-5 py-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
              <div className="text-3xl font-black text-slate-950 dark:text-white">{featuredCount}</div>
              <div className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Tiêu biểu</div>
            </div>
          </div>
        </div>
      </div>

      <Section
        title="Danh sách dự án"
        subtitle="Các hệ thống đã tham gia phát triển và triển khai"
      >
        <ProjectGrid showFilters />
      </Section>
    </Container>
  );
}
