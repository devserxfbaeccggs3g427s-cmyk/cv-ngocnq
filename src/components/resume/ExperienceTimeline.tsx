import { experience } from '@/data/experience';
import { ExperienceCard } from './ExperienceCard';
import { Section } from '@/components/ui';

export function ExperienceTimeline() {
  return (
    <Section
      id="experience"
      eyebrow="Experience"
      title="Kinh nghiệm làm việc"
      subtitle="Quá trình làm việc chuyên môn trong lĩnh vực ngân hàng, fintech và hệ thống backend"
    >
      <div className="space-y-6">
        {experience.map((exp) => (
          <ExperienceCard key={exp.id} experience={exp} />
        ))}
      </div>
    </Section>
  );
}