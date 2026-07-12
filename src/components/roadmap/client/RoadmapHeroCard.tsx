'use client';

import Link from 'next/link';
import {
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Grid3X3,
  Layers,
  Target,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui';
import type { Roadmap, ProgressFile, RoadmapTask } from '@/types';
import { getLeafTasks } from '@/lib/roadmap';
import { Metric } from './Metric';

interface RoadmapHeroCardProps {
  roadmap: Roadmap;
  progress: ProgressFile;
  allTasks: RoadmapTask[];
}

export function RoadmapHeroCard({ roadmap, progress, allTasks }: RoadmapHeroCardProps) {
  const leafTasks = getLeafTasks(allTasks);
  const completedCount = leafTasks.filter(
    (task) => progress.items[task.id]?.completed
  ).length;
  const totalHours = leafTasks.reduce((sum, task) => sum + task.estimateHours, 0);
  const completedHours = leafTasks
    .filter((task) => progress.items[task.id]?.completed)
    .reduce((sum, task) => sum + task.estimateHours, 0);
  const completionRate = leafTasks.length
    ? Math.round((completedCount / leafTasks.length) * 100)
    : 0;

  return (
    <Card className="premium-ring relative overflow-hidden">
      <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
      <div className="absolute -bottom-28 left-1/3 h-72 w-72 rounded-full bg-violet-500/20 blur-3xl" />
      <CardContent className="relative p-6 md:p-8">
        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-200/70 bg-blue-50/80 px-3 py-1.5 text-sm font-bold text-blue-700 shadow-sm dark:border-blue-800/60 dark:bg-blue-950/40 dark:text-blue-300">
              <Target className="h-4 w-4" />
              {roadmap.meta.targetRole}
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-950 dark:text-white md:text-5xl">
              {roadmap.meta.title}
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600 dark:text-slate-300">
              Lộ trình được tổng hợp từ kỹ năng thật trong CV và các dự án ngân hàng,
              thanh toán, mobile banking, xử lý nợ, bảo hiểm và hệ thống Nhật Bản.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Metric icon={CheckCircle2} label="Hoàn thành" value={`${completionRate}%`} />
            <Metric icon={Layers} label="Task" value={`${completedCount}/${leafTasks.length}`} />
            <Metric icon={Clock3} label="Giờ đã ôn" value={`${completedHours}/${totalHours}`} />
            <Metric icon={CalendarDays} label="Lộ trình" value={`${roadmap.meta.durationWeeks} tuần`} />
          </div>
        </div>

        <div className="mt-6 h-3 overflow-hidden rounded-full bg-slate-200/80 shadow-inner dark:bg-slate-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-400 shadow-[0_0_24px_rgba(37,99,235,0.45)] transition-all"
            style={{ width: `${completionRate}%` }}
          />
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <div className="flex flex-1 flex-wrap items-start gap-x-6 gap-y-2 text-sm font-medium text-slate-600 dark:text-slate-300">
            <div className="flex items-start gap-2">
              <Clock3 className="mt-0.5 h-4 w-4 text-blue-700 dark:text-blue-300" />
              <span>Cam kết: {roadmap.meta.weeklyCommitment}</span>
            </div>
            <div className="flex items-start gap-2">
              <BookOpen className="mt-0.5 h-4 w-4 text-blue-700 dark:text-blue-300" />
              <span>{roadmap.meta.reviewCadence}</span>
            </div>
          </div>
          <Link
            href="/skill-roadmap/review"
            className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-bold text-blue-700 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-100 dark:border-blue-900/60 dark:bg-blue-950/30 dark:text-blue-300 dark:hover:border-blue-700 dark:hover:bg-blue-950/50"
          >
            <Grid3X3 className="h-4 w-4" /> Minimap ôn tập
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
