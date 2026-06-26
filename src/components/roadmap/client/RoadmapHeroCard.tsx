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
    <Card className="overflow-hidden">
      <CardContent className="p-6 md:p-8">
        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
              <Target className="h-4 w-4" />
              {roadmap.meta.targetRole}
            </div>
            <h1 className="text-3xl font-bold text-gray-950 dark:text-white md:text-4xl">
              {roadmap.meta.title}
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-gray-600 dark:text-gray-300">
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

        <div className="mt-6 h-3 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
          <div
            className="h-full rounded-full bg-blue-600 transition-all"
            style={{ width: `${completionRate}%` }}
          />
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <div className="flex flex-1 flex-wrap items-start gap-x-6 gap-y-2 text-sm text-gray-600 dark:text-gray-300">
            <div className="flex items-start gap-2">
              <Clock3 className="mt-0.5 h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span>Cam kết: {roadmap.meta.weeklyCommitment}</span>
            </div>
            <div className="flex items-start gap-2">
              <BookOpen className="mt-0.5 h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span>{roadmap.meta.reviewCadence}</span>
            </div>
          </div>
          <Link
            href="/skill-roadmap/review"
            className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 transition hover:border-blue-300 hover:bg-blue-100 dark:border-blue-900/60 dark:bg-blue-950/30 dark:text-blue-300 dark:hover:border-blue-700 dark:hover:bg-blue-950/50"
          >
            <Grid3X3 className="h-4 w-4" /> Minimap ôn tập
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
