import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Compass } from 'lucide-react';
import { Container } from '@/components/ui';
import { workspaceFeatures } from '@/config';

export const metadata: Metadata = {
  title: 'Workspace học tập & AI tools | Nguyễn Quang Ngọc',
  description:
    'Trung tâm truy cập các công cụ roadmap, Markdown, AI Context và AI Image Analysis.',
};

export default function WorkspacePage() {
  return (
    <Container size="lg" className="py-10 md:py-14">
      {/* HEADER */}
      <header className="mb-16 md:mb-24">
        <div className="mb-6 flex items-center gap-3">
          <span className="rule-short" />
          <span className="eyebrow">Workspace</span>
        </div>

        <h1 className="font-serif text-4xl font-normal leading-[1.05] tracking-tight text-[var(--fg)] sm:text-5xl md:text-6xl lg:text-7xl">
          Trung tâm học tập và AI tools.
        </h1>

        <p className="mt-6 max-w-2xl text-lg leading-7 text-[var(--fg-muted)] md:text-xl">
          Các tính năng thao tác chuyên sâu được gom vào một khu vực riêng để
          giữ portfolio gọn, còn workflow học tập/AI vẫn dễ tìm và dễ quay lại.
        </p>

        {/* Stats row */}
        <dl className="mt-12 grid grid-cols-2 gap-x-8 gap-y-6 border-t border-[var(--line)] pt-8 md:grid-cols-4">
          {[
            [String(workspaceFeatures.length), 'Tính năng'],
            ['Local', 'Lưu dữ liệu'],
            ['AI', 'Hỏi đáp · Ảnh'],
            ['Roadmap', 'Ôn tập'],
          ].map(([value, label]) => (
            <div key={label}>
              <dt className="eyebrow mb-2">{label}</dt>
              <dd className="stat-number text-3xl text-[var(--fg)] sm:text-4xl">
                {value}
              </dd>
            </div>
          ))}
        </dl>
      </header>

      {/* FEATURES BENTO */}
      <section className="mb-16 md:mb-24" aria-label="Danh sách tính năng">
        <div className="mb-8 flex items-baseline justify-between">
          <h2 className="font-serif text-2xl text-[var(--fg)] sm:text-3xl">
            Tính năng
          </h2>
          <span className="numeral text-sm text-[var(--fg-subtle)]">
            0{workspaceFeatures.length}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-px overflow-hidden rounded-[var(--radius-card)] border border-[var(--line)] bg-[var(--line)] md:grid-cols-2">
          {workspaceFeatures.map((feature) => {
            const Icon = feature.icon;
            return (
              <Link
                key={feature.href}
                href={feature.href}
                className="group relative flex flex-col justify-between bg-[var(--bg)] p-6 transition-colors duration-300 hover:bg-[var(--surface)] sm:p-8"
              >
                <div className="mb-8 flex items-start justify-between gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--surface)] transition-colors duration-300 group-hover:border-[var(--fg)]">
                    <Icon className="h-4 w-4 text-[var(--fg)]" />
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-[var(--fg-subtle)] transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--fg)]" />
                </div>
                <div>
                  <p className="eyebrow mb-2">{feature.eyebrow}</p>
                  <h3 className="font-serif text-2xl leading-tight text-[var(--fg)]">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--fg-muted)]">
                    {feature.description}
                  </p>
                  <p className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--fg-muted)] transition-colors group-hover:text-[var(--fg)]">
                    {feature.cta}
                    <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* FOOTER NOTE — colophon style */}
      <section className="border-t border-[var(--line)] pt-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-2xl">
            <div className="mb-3 flex items-center gap-2">
              <span className="rule-short" />
              <span className="eyebrow">Note</span>
            </div>
            <h2 className="font-serif text-xl leading-tight text-[var(--fg)]">
              Portfolio gọn hơn, công cụ có khu vực riêng
            </h2>
            <p className="mt-2 text-sm leading-6 text-[var(--fg-muted)]">
              Header chỉ giữ các mục tuyển dụng chính. Các workflow dài như ôn tập,
              tài liệu và AI được đưa vào Workspace để mobile dễ dùng hơn.
            </p>
          </div>
          <Link
            href="/#contact"
            className="group inline-flex items-center gap-2 self-start text-sm font-medium text-[var(--fg)]"
          >
            <Compass className="h-4 w-4 text-[var(--fg-subtle)]" />
            <span className="link-editorial">Quay về portfolio</span>
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      </section>
    </Container>
  );
}