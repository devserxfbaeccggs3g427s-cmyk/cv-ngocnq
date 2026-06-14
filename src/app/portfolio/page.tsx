import type { Metadata } from 'next';
import { Container, Section } from '@/components/ui';
import { ProjectGrid } from '@/components/portfolio';
import { profile } from '@/data/profile';

export const metadata: Metadata = {
  title: `Dự án | ${profile.name}`,
  description: `Các dự án và kinh nghiệm triển khai của ${profile.name}`,
};

export default function PortfolioPage() {
  return (
    <Container size="lg" className="py-12">
      <Section
        title="Danh sách dự án"
        subtitle="Các hệ thống đã tham gia phát triển và triển khai"
      >
        <ProjectGrid showFilters />
      </Section>
    </Container>
  );
}
