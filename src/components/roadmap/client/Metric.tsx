'use client';

import type { ComponentType } from 'react';

interface MetricProps {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
}

export function Metric({ icon: Icon, label, value }: MetricProps) {
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
