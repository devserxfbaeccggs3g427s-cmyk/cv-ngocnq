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
  const trackRate = trackTasks.length ? Math.round((trackCompleted / trackTasks.length) * 100) : 0;

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-[var(--line)] bg-[var(--surface-2)] px-5 py-5 md:px-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Badge>{track.duration}</Badge>
              <Badge>{track.level}</Badge>
              <span className="text-sm font-medium text-[var(--fg-muted)]">
                {trackCompleted}/{trackTasks.length} task
              </span>
            </div>
            <h2 className="font-serif text-2xl font-normal leading-tight text-[var(--fg)]">
              {track.title}
            </h2>
            <p className="mt-2 max-w-4xl text-sm leading-6 text-[var(--fg-muted)]">
              {track.goal}
            </p>
          </div>

          <div className="min-w-32">
            <div className="stat-number mb-1 text-right text-2xl text-[var(--fg)]">
              {trackRate}%
            </div>
            <div className="progress-track">
              <div
                className="progress-fill"
                style={{ width: `${trackRate}%` }}
              />
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {track.skills.map((skill) => (
            <span
              key={skill}
              className="badge"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      <CardContent className="p-0">
        {track.modules.map((module) => {
          const moduleTasks = flattenTasks(module.tasks);
          const moduleCompleted = moduleTasks.filter(
            (task) => getTaskStudyState(task, progress).effectivelyCompleted
          ).length;
          const moduleRate = moduleTasks.length
            ? Math.round((moduleCompleted / moduleTasks.length) * 100)
            : 0;
          return (
            <div key={module.id} className="border-b border-[var(--line)] last:border-b-0">
              <div className="flex items-center justify-between gap-3 border-b border-[var(--line)] bg-[var(--bg)] px-5 py-3 md:px-6">
                <h3 className="eyebrow">
                  {module.title}
                </h3>
                <span className="badge badge-ghost text-[10px]">
                  {moduleCompleted}/{moduleTasks.length} task · {moduleRate}%
                </span>
              </div>

              {/* Top-level tasks render as cards with clear separation between them.
                  Each TaskNode now visually wraps its own children inside. */}
              <div className="flex flex-col gap-3 p-4 sm:gap-4 sm:p-5">
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
          );
        })}
      </CardContent>
    </Card>
  );
}
