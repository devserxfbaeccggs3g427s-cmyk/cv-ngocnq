import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'secondary' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md';
  className?: string;
}

export function Badge({ children, variant = 'default', size = 'sm', className }: BadgeProps) {
  const variants = {
    default: 'border-blue-200/70 bg-blue-50/90 text-blue-800 dark:border-blue-800/60 dark:bg-blue-950/40 dark:text-blue-300',
    secondary: 'border-slate-200/80 bg-white/70 text-slate-700 dark:border-slate-700/80 dark:bg-slate-900/70 dark:text-slate-300',
    success: 'border-emerald-200/80 bg-emerald-50/90 text-emerald-800 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-300',
    warning: 'border-amber-200/80 bg-amber-50/90 text-amber-800 dark:border-amber-800/60 dark:bg-amber-950/40 dark:text-amber-300',
    error: 'border-red-200/80 bg-red-50/90 text-red-800 dark:border-red-800/60 dark:bg-red-950/40 dark:text-red-300',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border font-semibold shadow-sm backdrop-blur',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </span>
  );
}
