import { promises as fs } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';
import type { ProgressItem, ProgressFile } from '@/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type RoadmapBackupFile = {
  version: number;
  exportedAt: string;
  progress: ProgressFile;
  comments?: unknown;
  flashcards?: unknown;
  quizzes?: unknown;
  studyComments?: unknown;
};

const progressFilePath = path.join(
  process.cwd(),
  'src',
  'data',
  'skill-roadmap-progress.json'
);
const canWriteProgressFile = process.env.NODE_ENV !== 'production' && !process.env.VERCEL;

async function readProgressSeed(): Promise<unknown> {
  try {
    const raw = await fs.readFile(progressFilePath, 'utf8');
    return JSON.parse(raw) as unknown;
  } catch {
    return { updatedAt: null, items: {} };
  }
}

async function writeProgressSeed(seed: unknown) {
  await fs.writeFile(progressFilePath, `${JSON.stringify(seed, null, 2)}\n`, 'utf8');
}

function isRecord(input: unknown): input is Record<string, unknown> {
  return Boolean(input) && typeof input === 'object' && !Array.isArray(input);
}

function normalizeProgressItem(input: unknown): ProgressItem | null {
  if (!isRecord(input)) {
    return null;
  }

  return {
    completed: Boolean(input.completed),
    note: typeof input.note === 'string' ? input.note : '',
    completedAt: typeof input.completedAt === 'string' ? input.completedAt : null,
    updatedAt: typeof input.updatedAt === 'string' ? input.updatedAt : new Date().toISOString(),
  };
}

function normalizeProgress(input: unknown): ProgressFile | null {
  if (!isRecord(input)) {
    return null;
  }

  const value = isRecord(input.progress) ? input.progress : input;
  const rawItems = isRecord(value.items) ? value.items : value;

  if (!isRecord(rawItems)) {
    return null;
  }

  const items: Record<string, ProgressItem> = {};

  for (const [taskId, item] of Object.entries(rawItems)) {
    if (taskId === 'updatedAt') {
      continue;
    }

    const progressItem = normalizeProgressItem(item);

    if (!progressItem) {
      return null;
    }

    items[taskId] = progressItem;
  }

  return {
    updatedAt: typeof value.updatedAt === 'string' ? value.updatedAt : null,
    items,
  };
}

function isCombinedBackup(input: unknown): input is RoadmapBackupFile {
  return isRecord(input) && isRecord(input.progress);
}

function updateSeedProgress(seed: unknown, progress: ProgressFile): unknown {
  if (!isCombinedBackup(seed)) {
    return progress;
  }

  return {
    ...seed,
    version: typeof seed.version === 'number' ? seed.version : 3,
    exportedAt: new Date().toISOString(),
    progress,
  };
}

export async function GET() {
  const seed = await readProgressSeed();
  return NextResponse.json(seed);
}

export async function POST(request: Request) {
  if (!canWriteProgressFile) {
    return NextResponse.json(
      { error: 'Runtime production không hỗ trợ ghi vào file JSON. Hãy dùng localStorage/export/import hoặc database thật.' },
      { status: 501 }
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'File backup không phải JSON hợp lệ.' },
      { status: 400 }
    );
  }

  const progress = normalizeProgress(body);

  if (!progress) {
    return NextResponse.json(
      { error: 'File backup không đúng định dạng. File cần có object items chứa tiến độ theo task id.' },
      { status: 400 }
    );
  }

  const importedProgress = {
    ...progress,
    updatedAt: new Date().toISOString(),
  };

  await writeProgressSeed(updateSeedProgress(body, importedProgress));

  return NextResponse.json(importedProgress);
}

export async function PUT(request: Request) {
  if (!canWriteProgressFile) {
    return NextResponse.json(
      { error: 'Runtime production không hỗ trợ ghi vào file JSON. Hãy dùng localStorage/export/import hoặc database thật.' },
      { status: 501 }
    );
  }

  const body = (await request.json()) as {
    taskId?: string;
    completed?: boolean;
    note?: string;
    items?: Record<string, unknown>;
  };

  if (!body.taskId && !body.items) {
    return NextResponse.json({ error: 'taskId is required' }, { status: 400 });
  }

  const now = new Date().toISOString();
  const seed = await readProgressSeed();
  const progress = normalizeProgress(seed) ?? { updatedAt: null, items: {} };

  if (body.items) {
    const normalized = normalizeProgress({ items: body.items });

    if (!normalized) {
      return NextResponse.json(
        { error: 'items không đúng định dạng progress.' },
        { status: 400 }
      );
    }

    progress.items = normalized.items;
    progress.updatedAt = now;

    await writeProgressSeed(updateSeedProgress(seed, progress));

    return NextResponse.json(progress);
  }

  const taskId = body.taskId as string;
  const current = progress.items[taskId] ?? {
    completed: false,
    note: '',
    completedAt: null,
    updatedAt: now,
  };

  const completed = body.completed ?? current.completed;

  progress.items[taskId] = {
    completed,
    note: body.note ?? current.note,
    completedAt: completed ? current.completedAt ?? now : null,
    updatedAt: now,
  };
  progress.updatedAt = now;

  await writeProgressSeed(updateSeedProgress(seed, progress));

  return NextResponse.json(progress);
}
