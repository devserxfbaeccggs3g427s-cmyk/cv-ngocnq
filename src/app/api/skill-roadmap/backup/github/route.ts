import { promises as fs } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const progressFilePath = path.join(
  process.cwd(),
  'src',
  'data',
  'skill-roadmap-progress.json'
);

type GithubBackupRequest = {
  token?: string;
  repoUrl?: string;
  branch?: string;
  backupPath?: string;
  commitMessage?: string;
  progress?: unknown;
};

function parseGithubRepo(repoUrl: string): { owner: string; repo: string } | null {
  const trimmed = repoUrl.trim();
  const httpsMatch = trimmed.match(/^https:\/\/github\.com\/([^/]+)\/([^/]+?)(?:\.git)?\/?$/);
  const sshMatch = trimmed.match(/^git@github\.com:([^/]+)\/([^/]+?)(?:\.git)?$/);

  const match = httpsMatch ?? sshMatch;

  if (!match) {
    return null;
  }

  return {
    owner: match[1],
    repo: match[2],
  };
}

function encodeGithubPath(filePath: string): string {
  return filePath
    .split('/')
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join('/');
}

async function readProgress() {
  try {
    const raw = await fs.readFile(progressFilePath, 'utf8');
    return JSON.parse(raw) as unknown;
  } catch {
    return { updatedAt: null, items: {} };
  }
}

async function getExistingFileSha({
  owner,
  repo,
  branch,
  backupPath,
  token,
}: {
  owner: string;
  repo: string;
  branch: string;
  backupPath: string;
  token: string;
}): Promise<string | undefined> {
  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${encodeGithubPath(backupPath)}?ref=${encodeURIComponent(branch)}`,
    {
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${token}`,
        'X-GitHub-Api-Version': '2022-11-28',
      },
    }
  );

  if (response.status === 404) {
    return undefined;
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(
      typeof body?.message === 'string'
        ? body.message
        : 'Cannot read existing GitHub file'
    );
  }

  const data = (await response.json()) as { sha?: string };
  return data.sha;
}

export async function POST(request: Request) {
  const body = (await request.json()) as GithubBackupRequest;
  const repo = body.repoUrl ? parseGithubRepo(body.repoUrl) : null;
  const token = body.token?.trim();
  const branch = body.branch?.trim() || 'main';
  const backupPath = body.backupPath?.trim() || 'backups/skill-roadmap-progress.json';
  const commitMessage =
    body.commitMessage?.trim() || 'Backup skill roadmap progress';

  if (!token) {
    return NextResponse.json({ error: 'GitHub token is required' }, { status: 400 });
  }

  if (!repo) {
    return NextResponse.json(
      { error: 'GitHub repo URL must be https://github.com/owner/repo or git@github.com:owner/repo.git' },
      { status: 400 }
    );
  }

  const progress = body.progress ?? await readProgress();
  const content = `${JSON.stringify(progress, null, 2)}\n`;
  const encodedContent = Buffer.from(content, 'utf8').toString('base64');

  try {
    const sha = await getExistingFileSha({
      owner: repo.owner,
      repo: repo.repo,
      branch,
      backupPath,
      token,
    });

    const response = await fetch(
      `https://api.github.com/repos/${repo.owner}/${repo.repo}/contents/${encodeGithubPath(backupPath)}`,
      {
        method: 'PUT',
        headers: {
          Accept: 'application/vnd.github+json',
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
        body: JSON.stringify({
          message: commitMessage,
          content: encodedContent,
          branch,
          ...(sha ? { sha } : {}),
        }),
      }
    );

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));

      return NextResponse.json(
        {
          error:
            typeof errorBody?.message === 'string'
              ? errorBody.message
              : 'GitHub backup failed',
        },
        { status: response.status }
      );
    }

    const result = (await response.json()) as {
      commit?: { html_url?: string };
      content?: { path?: string };
    };

    return NextResponse.json({
      ok: true,
      path: result.content?.path ?? backupPath,
      commitUrl: result.commit?.html_url ?? null,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'GitHub backup failed',
      },
      { status: 500 }
    );
  }
}
