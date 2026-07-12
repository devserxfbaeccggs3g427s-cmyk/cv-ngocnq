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
    <section id={id} className={cn('py-10 md:py-16 lg:py-20', className)}>
      {(title || subtitle) && (
        <div className="mb-8 md:mb-11">
          <div className="mb-4 h-1 w-14 rounded-full bg-gradient-to-r from-blue-600 via-violet-500 to-cyan-400 shadow-[0_0_30px_rgba(59,130,246,0.45)]" />
          {title && (
            <h2 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-3xl md:text-4xl">{title}</h2>
          )}
          {subtitle && (
            <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600 dark:text-slate-300 md:text-lg">{subtitle}</p>
          )}
        </div>
      )}
      {children}
    </section>
  );
}
