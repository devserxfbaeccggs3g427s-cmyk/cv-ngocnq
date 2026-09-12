import Link from 'next/link';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { Container, Section } from '@/components/ui';
import {
  ProfileHeader,
  Summary,
  ExperienceTimeline,
  SkillsSection,
  EducationSection,
  CertificationsSection,
  LanguagesSection,
} from '@/components/resume';
import { ContactSection } from '@/components/contact';
import { ProjectGrid } from '@/components/portfolio';
import { workspaceFeatures } from '@/config';
import { profile } from '@/data/profile';
import { experience } from '@/data/experience';
import { projects } from '@/data/projects';
import { skills } from '@/data/skills';

function StatTile({
  value,
  label,
  sub,
  className,
}: {
  value: string;
  label: string;
  sub?: string;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-col justify-between rounded-[var(--radius-card)] border border-[var(--line)] bg-[var(--surface)] p-5 transition-colors duration-300 hover:border-[var(--fg)] sm:p-7 ${
        className ?? ''
      }`}
    >
      <span className="stat-number text-[var(--fg)] text-5xl sm:text-6xl md:text-7xl">
        {value}
      </span>
      <div className="mt-6">
        <p className="font-serif text-base leading-tight text-[var(--fg)]">{label}</p>
        {sub && (
          <p className="mt-1 text-xs text-[var(--fg-subtle)]">{sub}</p>
        )}
      </div>
    </div>
  );
}

export default function HomePage() {
  // Derived numbers
  const yearsExp = (() => {
    const earliest = experience
      .map((e) => e.startDate)
      .sort()[0];
    if (!earliest) return 0;
    const startYear = parseInt(earliest.slice(0, 4), 10);
    const startMonth = parseInt(earliest.slice(5, 7), 10);
    const now = new Date();
    const years = now.getFullYear() - startYear + (now.getMonth() + 1 >= startMonth ? 0 : -1);
    return years;
  })();

  const projectCount = projects.length;
  const techCount = new Set(skills.map((s) => s.name)).size;

  return (
    <Container size="lg" className="py-10 md:py-14">
      {/* HERO */}
      <ProfileHeader />
      <Summary />

      <div className="rule my-8 md:my-12" aria-hidden="true" />

      {/* BENTO STATS — At a glance */}
      <section className="mb-16 md:mb-24" aria-label="Tóm tắt nhanh">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="rule-short" />
            <span className="eyebrow">At a glance</span>
          </div>
          <span className="hidden text-xs text-[var(--fg-subtle)] sm:inline">
            Cập nhật {new Date().getFullYear()}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          <StatTile
            value={`${yearsExp}+`}
            label="Năm kinh nghiệm"
            sub="Production banking"
          />
          <StatTile
            value={`${projectCount}`}
            label="Dự án"
            sub="Trong nhiều lĩnh vực"
          />
          <StatTile
            value={`${techCount}`}
            label="Công nghệ"
            sub="Stack đã sử dụng"
          />
          <StatTile
            value="3"
            label="Vai trò"
            sub="Backend · Fullstack · Lead"
          />
        </div>
      </section>

      {/* EXPERIENCE */}
      <ExperienceTimeline />

      {/* SKILLS + LANGUAGES */}
      <section className="pb-16 md:pb-24">
        <SkillsSection />
        <LanguagesSection />
      </section>

      {/* EDUCATION + CERTIFICATIONS — 2-col on desktop */}
      <section className="grid grid-cols-1 gap-x-16 gap-y-12 pb-16 md:pb-24 lg:grid-cols-2">
        <EducationSection />
        <CertificationsSection />
      </section>

      {/* FEATURED PROJECTS */}
      <Section
        eyebrow="Selected work"
        title="Dự án tiêu biểu"
        subtitle="Một số dự án gần đây trong lĩnh vực ngân hàng, thanh toán và hệ thống backend"
      >
        <ProjectGrid featuredOnly limit={3} showFilters={false} />
        <div className="mt-12 flex items-center justify-between border-t border-[var(--line)] pt-6">
          <p className="text-sm text-[var(--fg-muted)]">
            Xem tất cả dự án và contribution mới nhất
          </p>
          <Link
            href="/portfolio"
            className="group inline-flex items-center gap-1.5 text-sm font-medium text-[var(--fg)]"
          >
            <span className="link-editorial">Tất cả dự án</span>
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      </Section>

      {/* WORKSPACE — Bento grid nav */}
      <Section
        id="workspace"
        eyebrow="Workspace"
        title="Học tập & AI tools"
        subtitle="Các workflow thao tác dài được gom riêng khỏi CV/portfolio để dễ tìm, dễ dùng và tối ưu hơn trên mobile."
      >
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
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-10 flex justify-center">
          <Link href="/workspace" className="btn btn-primary btn-lg">
            Mở Workspace
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </Section>

      {/* CONTACT */}
      <ContactSection />

      {/* FOOTER NOTE — colophon */}
      <div className="rule mt-12" aria-hidden="true" />
      <div className="mt-6 flex flex-col items-start justify-between gap-2 text-xs text-[var(--fg-subtle)] sm:flex-row sm:items-center">
        <span>
          {profile.name} — Backend / Full-Stack Engineer
        </span>
        <span>Last updated {new Date().toLocaleDateString('vi-VN')}</span>
      </div>
    </Container>
  );
}