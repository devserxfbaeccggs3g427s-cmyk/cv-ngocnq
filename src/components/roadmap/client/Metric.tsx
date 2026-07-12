'use client';

import type { ComponentType } from 'react';
import { Card, CardContent } from '@/components/ui';

export type MetricVariant = 'default' | 'card';

interface MetricProps {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
  variant?: MetricVariant;
}

export function Metric({ icon: Icon, label, value, variant = 'default' }: MetricProps) {
  if (variant === 'card') {
    return (
      <Card>
        <CardContent className="flex items-center gap-3 p-4">
          <div className="rounded-2xl bg-blue-50 p-2 text-blue-700 shadow-sm dark:bg-blue-950/40 dark:text-blue-300">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xl font-black text-slate-950 dark:text-white">{value}</div>
            <div className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              {label}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white/70 p-4 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/65">
      <Icon className="mb-3 h-5 w-5 text-blue-700 dark:text-blue-300" />
      <div className="text-2xl font-black text-slate-950 dark:text-white">{value}</div>
      <div className="mt-1 text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {label}
      </div>
    </div>
  );
}
