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
          <div className="rounded-[var(--radius-card)] border border-[var(--line)] bg-[var(--surface-2)] p-2 text-[var(--fg-muted)]">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <div className="font-serif text-xl font-normal text-[var(--fg)]">{value}</div>
            <div className="eyebrow">
              {label}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="border border-[var(--line)] bg-[var(--surface)] p-4">
      <Icon className="mb-3 h-5 w-5 text-[var(--fg-muted)]" />
      <div className="font-serif text-2xl font-normal leading-none text-[var(--fg)]">{value}</div>
      <div className="mt-2 eyebrow">
        {label}
      </div>
    </div>
  );
}
