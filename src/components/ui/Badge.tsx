import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'accent' | 'inverse' | 'ghost';
  size?: 'sm' | 'md';
  className?: string;
}

export function Badge({ children, variant = 'default', size = 'sm', className }: BadgeProps) {
  const variants = {
    default: '',
    accent: 'badge-accent',
    inverse: 'badge-inverse',
    ghost: 'badge-ghost',
  };

  const sizes = {
    sm: '',
    md: 'px-3 py-1 text-sm',
  };

  return (
    <span className={cn('badge', variants[variant], sizes[size], className)}>
      {children}
    </span>
  );
}