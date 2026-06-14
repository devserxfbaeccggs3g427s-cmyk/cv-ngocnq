import { promises as fs } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type ProgressItem = {
  completed: boolean;
  note: string;
  completedAt: string | null;
  updatedAt: string;
};

type ProgressFile = {
  updatedAt: string | null;
  items: Record<string, ProgressItem>;
};

const progressFilePath = path.join(
  process.cwd(),
  'src',
  'data',
  'skill-roadmap-progress.json'
);

async function readProgress(): Promise<ProgressFile> {
  try {
    const raw = await fs.readFile(progressFilePath, 'utf8');
    return JSON.parse(raw) as ProgressFile;
  } catch {
    return { updatedAt: null, items: {} };
  }
}

async function writeProgress(progress: ProgressFile) {
  await fs.writeFile(progressFilePath, `${JSON.stringify(progress, null, 2)}\n`, 'utf8');
}

function normalizeProgress(input: unknown): ProgressFile | null {
  if (!input || typeof input !== 'object') {
    return null;
  }

  const value = input as {
    updatedAt?: unknown;
    items?: unknown;
  };

  if (!value.items || typeof value.items !== 'object' || Array.isArray(value.items)) {
    return null;
  }

  const items: Record<string, ProgressItem> = {};

  for (const [taskId, item] of Object.entries(value.items)) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      return null;
    }

    const raw = item as Partial<ProgressItem>;

    items[taskId] = {
      completed: Boolean(raw.completed),
      note: typeof raw.note === 'string' ? raw.note : '',
      completedAt: typeof raw.completedAt === 'string' ? raw.completedAt : null,
      updatedAt: typeof raw.updatedAt === 'string' ? raw.updatedAt : new Date().toISOString(),
    };
  }

  return {
    updatedAt: typeof value.updatedAt === 'string' ? value.updatedAt : null,
    items,
  };
}

export async function GET() {
  const progress = await readProgress();
  return NextResponse.json(progress);
}

export async function POST(request: Request) {
  const body = await request.json();
  const progress = normalizeProgress(body);

  if (!progress) {
    return NextResponse.json({ error: 'Invalid progress backup format' }, { status: 400 });
  }

  const importedProgress = {
    ...progress,
    updatedAt: new Date().toISOString(),
  };

  await writeProgress(importedProgress);

  return NextResponse.json(importedProgress);
}

export async function PUT(request: Request) {
  const body = (await request.json()) as {
    taskId?: string;
    completed?: boolean;
    note?: string;
  };

  if (!body.taskId) {
    return NextResponse.json({ error: 'taskId is required' }, { status: 400 });
  }

  const now = new Date().toISOString();
  const progress = await readProgress();
  const current = progress.items[body.taskId] ?? {
    completed: false,
    note: '',
    completedAt: null,
    updatedAt: now,
  };

  const completed = body.completed ?? current.completed;

  progress.items[body.taskId] = {
    completed,
    note: body.note ?? current.note,
    completedAt: completed ? current.completedAt ?? now : null,
    updatedAt: now,
  };
  progress.updatedAt = now;

  await writeProgress(progress);

  return NextResponse.json(progress);
}
