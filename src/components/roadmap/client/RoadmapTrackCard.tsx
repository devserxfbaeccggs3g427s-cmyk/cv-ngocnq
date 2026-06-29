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
      <div className="border-b border-gray-200 bg-white px-5 py-5 dark:border-gray-800 dark:bg-gray-900 md:px-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <Badge>{track.duration}</Badge>
              <Badge variant="secondary">{track.level}</Badge>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {trackCompleted}/{trackTasks.length} task
              </span>
            </div>
            <h2 className="text-2xl font-bold text-gray-950 dark:text-white">
              {track.title}
            </h2>
            <p className="mt-2 max-w-4xl text-sm leading-6 text-gray-600 dark:text-gray-300">
              {track.goal}
            </p>
          </div>

          <div className="min-w-32">
            <div className="mb-1 text-right text-sm font-semibold text-gray-900 dark:text-white">
              {trackRate}%
            </div>
            <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-800">
              <div
                className="h-full rounded-full bg-blue-600"
                style={{ width: `${trackRate}%` }}
              />
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {track.skills.map((skill) => (
            <span
              key={skill}
              className="rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      <CardContent className="p-0">
        {track.modules.map((module) => (
          <div key={module.id} className="border-b border-gray-100 last:border-b-0 dark:border-gray-800">
            <div className="bg-gray-50 px-5 py-3 dark:bg-gray-950/70 md:px-6">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300">
                {module.title}
              </h3>
            </div>

            <div className="divide-y divide-gray-100 dark:divide-gray-800">
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
