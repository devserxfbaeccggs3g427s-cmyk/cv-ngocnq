import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export function Card({ children, className, hover = false }: CardProps) {
  return (
    <div
      className={cn(
        'glass-panel rounded-2xl shadow-sm sm:rounded-3xl',
        hover && 'card-hover hover:border-blue-300/70 dark:hover:border-blue-700/70',
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('border-b border-slate-200/70 px-6 py-4 dark:border-slate-800/80', className)}>
      {children}
    </div>
  );
}

export function CardContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('px-4 py-4 sm:px-6 sm:py-5', className)}>{children}</div>;
}

export function CardFooter({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('border-t border-slate-200/70 px-6 py-4 dark:border-slate-800/80', className)}>
      {children}
    </div>
  );
}
