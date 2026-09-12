import { cn } from '@/lib/utils';

interface SectionProps {
  children: React.ReactNode;
  id?: string;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  className?: string;
}

export function Section({
  children,
  id,
  eyebrow,
  title,
  subtitle,
  className,
}: SectionProps) {
  return (
    <section id={id} className={cn('py-12 md:py-20', className)}>
      {(eyebrow || title || subtitle) && (
        <header className="mb-10 md:mb-14">
          <div className="mb-5 flex items-center gap-3">
            <span className="rule-short" />
            {eyebrow && <span className="eyebrow">{eyebrow}</span>}
          </div>
          {title && (
            <h2 className="font-serif text-3xl font-normal leading-[1.1] tracking-tight text-[var(--fg)] sm:text-4xl md:text-5xl">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--fg-muted)] md:text-lg">
              {subtitle}
            </p>
          )}
        </header>
      )}
      {children}
    </section>
  );
}