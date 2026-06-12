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
import { ArrowRight } from 'lucide-react';

export default function HomePage() {
  return (
    <Container size="lg" className="py-12">
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
            className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
          >
            Xem tất cả dự án
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </Section>

      {/* Contact Section */}
      <ContactSection />
    </Container>
  );
}
