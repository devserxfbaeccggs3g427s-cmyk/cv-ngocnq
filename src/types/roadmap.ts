export type RoadmapTask = {
  id: string;
  title: string;
  level: string;
  estimateHours: number;
  deliverable: string;
  children?: RoadmapTask[];
};

export type RoadmapModule = {
  id: string;
  title: string;
  tasks: RoadmapTask[];
};

export type RoadmapTrack = {
  id: string;
  title: string;
  level: string;
  duration: string;
  goal: string;
  skills: string[];
  modules: RoadmapModule[];
};

export type Roadmap = {
  meta: {
    owner: string;
    title: string;
    targetRole: string;
    durationWeeks: number;
    weeklyCommitment: string;
    reviewCadence: string;
  };
  tracks: RoadmapTrack[];
};

export type TaskContext = RoadmapTask & {
  trackTitle: string;
  moduleTitle: string;
  depth: number;
  parentTasks: Array<Pick<RoadmapTask, 'id' | 'title'>>;
};

export type TaskIndex = {
  taskById: Map<string, RoadmapTask>;
  ancestorIdsByTaskId: Map<string, string[]>;
};
