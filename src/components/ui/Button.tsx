import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  href?: string;
  children: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', href, children, type, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-full font-semibold tracking-tight transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:ring-offset-2 focus:ring-offset-white disabled:pointer-events-none disabled:opacity-50 dark:focus:ring-offset-slate-950';
    
    const variants = {
      primary: 'bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white shadow-lg shadow-blue-600/20 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-600/25',
      secondary: 'border border-slate-200 bg-white/80 text-slate-900 shadow-sm hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50/70 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-100 dark:hover:border-blue-800 dark:hover:bg-blue-950/30',
      outline: 'border border-slate-300/80 bg-white/50 text-slate-700 shadow-sm hover:-translate-y-0.5 hover:border-blue-400 hover:bg-white hover:text-blue-700 dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-200 dark:hover:border-blue-500 dark:hover:bg-slate-900',
      ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800/80 dark:hover:text-white',
    };
    
    const sizes = {
      sm: 'px-3.5 py-2 text-sm',
      md: 'px-5 py-2.5 text-sm',
      lg: 'px-6 py-3.5 text-base',
    };

    if (href) {
      return (
        <a
          href={href}
          className={cn(baseStyles, variants[variant], sizes[size], className)}
        >
          {children}
        </a>
      );
    }

    return (
      <button
        ref={ref}
        type={type ?? 'button'}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
