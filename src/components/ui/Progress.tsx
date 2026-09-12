'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ProgressProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export function Progress({
  value,
  max = 100,
  size = 'md',
  showLabel = false,
  className,
}: ProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const sizes = {
    sm: 'h-px',
    md: 'h-0.5',
    lg: 'h-1',
  };

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="mb-1.5 flex justify-between text-sm">
          <span className="text-[var(--fg-muted)]">{value}%</span>
        </div>
      )}
      <div className={cn('progress-track', sizes[size])}>
        <motion.div
          className="progress-fill h-full"
          initial={{ width: 0 }}
          whileInView={{ width: `${percentage}%` }}
          transition={{ duration: 1.2, ease: [0.2, 0, 0, 1] }}
          viewport={{ once: true, margin: '-50px' }}
        />
      </div>
    </div>
  );
}