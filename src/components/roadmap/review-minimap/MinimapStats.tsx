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
        icon={<Layers className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
        label="Tổng task"
        value={total}
      />
      <StatCard
        icon={<CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />}
        label="Đã hoàn thành"
        value={`${completed} (${percent}%)`}
      />
      <StatCard
        icon={<StickyNote className="h-5 w-5 text-amber-600 dark:text-amber-400" />}
        label="Có note"
        value={withNote}
      />
      <StatCard
        icon={<Eye className="h-5 w-5 text-violet-600 dark:text-violet-400" />}
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
    <div className="flex min-w-0 items-center gap-3 rounded-xl border border-gray-200 bg-white px-3 py-3 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:px-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="truncate text-xs font-medium text-gray-500 dark:text-gray-400">{label}</p>
        <p className="truncate text-sm font-bold text-gray-900 dark:text-white">{value}</p>
      </div>
    </div>
  );
}
