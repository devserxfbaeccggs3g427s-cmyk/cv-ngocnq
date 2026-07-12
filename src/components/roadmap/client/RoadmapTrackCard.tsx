'use client';

import { Badge, Card, CardContent } from '@/components/ui';
import type { RoadmapTrack, RoadmapTask, ProgressFile } from '@/types';
import { flattenTasks, getTaskStudyState } from '@/lib/roadmap';
import { TaskNode } from './TaskNode';

interface RoadmapTrackCardProps {
  track: RoadmapTrack;
  progress: ProgressFile;
  expandedTaskIds: Set<string>;
  savingTaskId: string | null;
  onToggle: (task: RoadmapTask) => void;
  onToggleExpanded: (taskId: string) => void;
  onTitleClick?: (taskId: string) => void;
}

export function RoadmapTrackCard({
  track,
  progress,
  expandedTaskIds,
  savingTaskId,
  onToggle,
  onToggleExpanded,
  onTitleClick,
}: RoadmapTrackCardProps) {
  const trackTasks = track.modules.flatMap((module) => flattenTasks(module.tasks));
  const trackCompleted = trackTasks.filter(
    (task) => getTaskStudyState(task, progress).effectivelyCompleted
  ).length;
  const trackRate = Math.round((trackCompleted / trackTasks.length) * 100);

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-slate-200/70 bg-white/55 px-5 py-5 dark:border-slate-800 dark:bg-slate-900/35 md:px-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <Badge>{track.duration}</Badge>
              <Badge variant="secondary">{track.level}</Badge>
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                {trackCompleted}/{trackTasks.length} task
              </span>
            </div>
            <h2 className="text-2xl font-black tracking-tight text-slate-950 dark:text-white">
              {track.title}
            </h2>
            <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-600 dark:text-slate-300">
              {track.goal}
            </p>
          </div>

          <div className="min-w-32">
            <div className="mb-1 text-right text-sm font-black text-slate-950 dark:text-white">
              {trackRate}%
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-200/80 dark:bg-slate-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-400"
                style={{ width: `${trackRate}%` }}
              />
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {track.skills.map((skill) => (
            <span
              key={skill}
              className="rounded-full border border-slate-200/70 bg-white/70 px-2.5 py-1 text-xs font-bold text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-300"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      <CardContent className="p-0">
        {track.modules.map((module) => (
          <div key={module.id} className="border-b border-slate-100/80 last:border-b-0 dark:border-slate-800">
            <div className="bg-slate-50/70 px-5 py-3 dark:bg-slate-950/45 md:px-6">
              <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-slate-700 dark:text-slate-300">
                {module.title}
              </h3>
            </div>

            <div className="divide-y divide-slate-100/80 dark:divide-slate-800">
              {module.tasks.map((task) => (
                <TaskNode
                  key={task.id}
                  task={task}
                  depth={0}
                  progress={progress}
                  expandedTaskIds={expandedTaskIds}
                  savingTaskId={savingTaskId}
                  onToggle={onToggle}
                  onToggleExpanded={onToggleExpanded}
                  onTitleClick={onTitleClick}
                />
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
