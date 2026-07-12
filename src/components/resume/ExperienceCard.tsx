import { Badge } from '@/components/ui';
import type { Experience } from '@/data/experience';
import { formatMonthYear } from '@/lib/date';
import { CheckCircle2 } from 'lucide-react';

interface ExperienceCardProps {
  experience: Experience;
}

export function ExperienceCard({ experience }: ExperienceCardProps) {
  const typeLabels: Record<Experience['type'], string> = {
    'full-time': 'Toàn thời gian',
    'part-time': 'Bán thời gian',
    contract: 'Hợp đồng',
    freelance: 'Tự do',
  };

  return (
    <div className="group glass-panel card-hover rounded-3xl p-6">
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-start">
        {/* Company Logo Placeholder */}
        <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-950 to-blue-900 shadow-lg shadow-slate-950/10 dark:from-blue-600 dark:to-violet-600 dark:shadow-blue-600/20">
          <span className="text-sm font-black tracking-wide text-white">
            {experience.company.substring(0, 2).toUpperCase()}
          </span>
        </div>

        <div className="flex-1">
          <h3 className="text-lg font-bold tracking-tight text-slate-950 dark:text-white">
            {experience.title}
          </h3>
          <p className="font-semibold text-blue-700 dark:text-blue-300">
            {experience.company}
          </p>
          <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
            {formatMonthYear(experience.startDate)} –{' '}
            {experience.current ? 'Hiện tại' : formatMonthYear(experience.endDate!)}
            {' · '}{experience.location}
            {' · '}<span>{typeLabels[experience.type]}</span>
          </p>
        </div>
      </div>

      <p className="mb-4 leading-7 text-slate-600 dark:text-slate-300">
        {experience.description}
      </p>

      {/* Achievements */}
      <ul className="mb-4 space-y-2 text-slate-700 dark:text-slate-300">
        {experience.achievements.map((achievement, i) => (
          <li key={i} className="flex gap-2 text-sm leading-6">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
            <span>{achievement}</span>
          </li>
        ))}
      </ul>

      {/* Technologies */}
      <div className="flex flex-wrap gap-2">
        {experience.technologies.map((tech) => (
          <Badge key={tech} variant="secondary" size="sm">
            {tech}
          </Badge>
        ))}
      </div>
    </div>
  );
}
