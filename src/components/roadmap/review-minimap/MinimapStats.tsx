'use client';

import { CheckCircle2, Eye, Layers, StickyNote } from 'lucide-react';

interface MinimapStatsProps {
  total: number;
  completed: number;
  withNote: number;
  showing: number;
}

export function MinimapStats({ total, completed, withNote, showing }: MinimapStatsProps) {
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4">
      <StatCard
        icon={<Layers className="h-5 w-5 text-[var(--accent)]" />}
        label="Tổng task"
        value={total}
      />
      <StatCard
        icon={<CheckCircle2 className="h-5 w-5 text-[var(--success)]" />}
        label="Đã hoàn thành"
        value={`${completed} (${percent}%)`}
      />
      <StatCard
        icon={<StickyNote className="h-5 w-5 text-[var(--warn)]" />}
        label="Có note"
        value={withNote}
      />
      <StatCard
        icon={<Eye className="h-5 w-5 text-[var(--accent)]" />}
        label="Đang hiển thị"
        value={showing}
      />
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <div className="card flex min-w-0 items-center gap-3 px-3 py-3.5 sm:px-4 sm:py-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-[var(--line)] bg-[var(--surface-2)] sm:h-9 sm:w-9">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="eyebrow truncate">{label}</p>
        <p className="truncate font-serif text-base font-normal text-[var(--fg)] sm:text-sm">{value}</p>
      </div>
    </div>
  );
}
