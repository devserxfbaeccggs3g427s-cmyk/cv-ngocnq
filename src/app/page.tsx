import { Container } from '@/components/ui';
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
import { Section } from '@/components/ui';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { workspaceFeatures } from '@/config';
import { cn } from '@/lib/utils';

const workspaceAccentClasses = {
  blue: 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-200',
  emerald:
    'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200',
  violet:
    'border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-800 dark:bg-violet-950/40 dark:text-violet-200',
  cyan: 'border-cyan-200 bg-cyan-50 text-cyan-700 dark:border-cyan-800 dark:bg-cyan-950/40 dark:text-cyan-200',
};

export default function HomePage() {
  return (
    <Container size="lg" className="py-10 md:py-14">
      {/* About Section */}
      <section id="about" className="mb-16">
        <ProfileHeader />
        <Summary />
      </section>

      {/* Experience Section */}
      <ExperienceTimeline />

      {/* Skills Section */}
      <SkillsSection />

      {/* Education Section */}
      <EducationSection />

      {/* Certifications Section */}
      <CertificationsSection />

      {/* Languages Section */}
      <LanguagesSection />

      {/* Featured Projects */}
      <Section 
        id="portfolio-preview" 
        title="Dự án tiêu biểu"
        subtitle="Một số dự án gần đây trong lĩnh vực ngân hàng, thanh toán và hệ thống backend"
      >
        <ProjectGrid featuredOnly limit={3} showFilters={false} />
        <div className="text-center mt-8">
          <Link
            href="/portfolio"
            className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-5 py-2.5 font-bold text-blue-700 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-300 dark:hover:border-blue-700"
          >
            Xem tất cả dự án
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </Section>

      <Section
        id="workspace-preview"
        title="Workspace học tập & AI tools"
        subtitle="Các workflow thao tác dài được gom riêng khỏi CV/portfolio để dễ tìm, dễ dùng và tối ưu hơn trên mobile."
        className="pt-4"
      >
        <div className="grid gap-3 md:grid-cols-2">
          {workspaceFeatures.map((feature) => {
            const Icon = feature.icon;

            return (
              <Link
                key={feature.href}
                href={feature.href}
                className="group rounded-3xl border border-slate-200/80 bg-white/70 p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-950/5 dark:border-slate-800 dark:bg-slate-950/55 dark:hover:border-blue-800"
              >
                <div className="flex items-start gap-3">
                  <span
                    className={cn(
                      'flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border',
                      workspaceAccentClasses[feature.accent]
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-base font-black text-slate-950 dark:text-white">
                      {feature.title}
                    </span>
                    <span className="mt-1 block text-sm leading-6 text-slate-600 dark:text-slate-300">
                      {feature.description}
                    </span>
                    <span className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-blue-700 transition group-hover:gap-3 dark:text-blue-300">
                      {feature.cta}
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/workspace"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-5 py-2.5 font-bold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-600/25"
          >
            <Sparkles className="h-4 w-4" />
            Mở Workspace
          </Link>
        </div>
      </Section>

      {/* Contact Section */}
      <ContactSection />
    </Container>
  );
}
