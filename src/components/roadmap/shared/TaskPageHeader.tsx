'use client';

import type { ComponentType, ReactNode } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Metric, type MetricVariant } from '@/components/roadmap/client/Metric';

export type MetricDef = {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
};

type TaskPageHeaderProps = {
  backHref: string;
  backLabel: string;
  title: string;
  taskId: string;
  deckCountBadge?: string;
  metrics: MetricDef[];
  metricVariant?: MetricVariant;
  actions?: ReactNode;
};

export function TaskPageHeader({
  backHref,
  backLabel,
  title,
  taskId,
  deckCountBadge,
  metrics,
  metricVariant = 'card',
  actions,
}: TaskPageHeaderProps) {
  return (
    <>
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <Link
            href={backHref}
            className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 transition hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            <ArrowLeft className="h-4 w-4" />
            {backLabel}
          </Link>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs font-semibold uppercase text-gray-400">{taskId}</span>
            {deckCountBadge ? (
              <span className="rounded-full bg-violet-100 px-2 py-0.5 text-xs font-semibold text-violet-800 dark:bg-violet-900/40 dark:text-violet-200">
                {deckCountBadge}
              </span>
            ) : null}
          </div>
          <h1 className="mt-2 text-2xl font-bold leading-tight text-gray-950 [overflow-wrap:anywhere] dark:text-white sm:text-3xl">
            {title}
          </h1>
        </div>
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <Metric
            key={`${metric.label}-${metric.value}`}
            icon={metric.icon}
            label={metric.label}
            value={metric.value}
            variant={metricVariant}
          />
        ))}
      </div>
    </>
  );
}
