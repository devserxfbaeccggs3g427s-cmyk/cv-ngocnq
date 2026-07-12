'use client';

import { motion } from 'framer-motion';
import { experience } from '@/data/experience';
import { ExperienceCard } from './ExperienceCard';
import { Section } from '@/components/ui';

export function ExperienceTimeline() {
  return (
    <Section id="experience" title="Kinh nghiệm làm việc" subtitle="Quá trình làm việc chuyên môn">
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute bottom-8 left-6 top-8 hidden w-0.5 rounded-full bg-gradient-to-b from-blue-500 via-violet-500 to-cyan-400 shadow-[0_0_30px_rgba(59,130,246,0.35)] md:block" />

        <div className="space-y-8">
          {experience.map((exp, index) => (
            <motion.div
              key={exp.id}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="relative md:pl-16"
            >
              {/* Timeline dot */}
              <div className="absolute left-[0.95rem] top-7 hidden h-5 w-5 rounded-full border-4 border-white bg-gradient-to-br from-blue-600 to-violet-600 shadow-lg shadow-blue-600/30 dark:border-slate-950 md:block" />

              <ExperienceCard experience={exp} />
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  );
}
