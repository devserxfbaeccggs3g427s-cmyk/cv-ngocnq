import { cn } from '@/lib/utils';

interface SectionProps {
  children: React.ReactNode;
  id?: string;
  title?: string;
  subtitle?: string;
  className?: string;
}

export function Section({ children, id, title, subtitle, className }: SectionProps) {
  return (
    <section id={id} className={cn('py-16', className)}>
      {(title || subtitle) && (
        <div className="mb-10">
          {title && (
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{title}</h2>
          )}
          {subtitle && (
            <p className="text-lg text-gray-600 dark:text-gray-400">{subtitle}</p>
          )}
        </div>
      )}
      {children}
    </section>
  );
}
