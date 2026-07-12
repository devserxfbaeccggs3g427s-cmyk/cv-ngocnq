import { cn } from '@/lib/utils';

interface ContainerProps {
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
}

export function Container({ children, size = 'lg', className }: ContainerProps) {
  const sizes = {
    sm: 'max-w-2xl',
    md: 'max-w-4xl',
    lg: 'max-w-7xl',
    xl: 'max-w-[88rem]',
    full: 'max-w-full',
  };

  return (
    <div className={cn('mx-auto min-w-0 max-w-full px-3 sm:px-6 lg:px-8 xl:px-10', sizes[size], className)}>
      {children}
    </div>
  );
}
