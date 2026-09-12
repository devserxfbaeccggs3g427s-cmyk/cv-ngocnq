import { cn } from '@/lib/utils';

interface TimelineProps {
  children: React.ReactNode;
  className?: string;
}

export function Timeline({ children, className }: TimelineProps) {
  return (
    <div className={cn('relative', className)}>
      <div className="space-y-12">{children}</div>
    </div>
  );
}

interface TimelineItemProps {
  children: React.ReactNode;
  date?: string;
  active?: boolean;
  className?: string;
}

export function TimelineItem({ children, date, active = false, className }: TimelineItemProps) {
  return (
    <div className={cn('relative', className)}>
      <div className="mb-3 flex items-center gap-3">
        <span
          className={cn(
            'inline-flex h-2 w-2 rounded-full',
            active ? 'bg-[var(--accent)]' : 'bg-[var(--line-strong)]'
          )}
          aria-hidden="true"
        />
        {date && (
          <span className="eyebrow text-[var(--fg-muted)]">{date}</span>
        )}
      </div>
      <div>{children}</div>
    </div>
  );
}