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
          <div className="rounded-lg bg-blue-50 p-2 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-gray-950 dark:text-white">{value}</div>
            <div className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
              {label}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-950">
      <Icon className="mb-3 h-5 w-5 text-blue-600 dark:text-blue-400" />
      <div className="text-2xl font-bold text-gray-950 dark:text-white">{value}</div>
      <div className="mt-1 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
        {label}
      </div>
    </div>
  );
}
