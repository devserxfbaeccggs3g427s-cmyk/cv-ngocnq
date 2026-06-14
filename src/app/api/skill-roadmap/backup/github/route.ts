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
const defaultGithubRepoUrl = process.env.GITHUB_BACKUP_REPO_URL ?? '';
const defaultGithubBranch = process.env.GITHUB_BACKUP_BRANCH ?? 'main';
const defaultGithubBackupPath =
  process.env.GITHUB_BACKUP_PATH ?? 'backups/skill-roadmap-progress.json';
const defaultGithubCommitMessage =
  process.env.GITHUB_BACKUP_COMMIT_MESSAGE ?? 'Backup skill roadmap progress';

type GithubBackupRequest = {
  token?: string;
  repoUrl?: string;
  branch?: string;
  backupPath?: string;
  commitMessage?: string;
  progress?: unknown;
};

type GithubErrorBody = {
  message?: string;
  documentation_url?: string;
};

function normalizeGithubErrorBody(body: unknown): GithubErrorBody {
  if (!body || typeof body !== 'object') {
    return {};
  }

  const errorBody = body as Record<string, unknown>;

  return {
    message: typeof errorBody.message === 'string' ? errorBody.message : undefined,
    documentation_url:
      typeof errorBody.documentation_url === 'string'
        ? errorBody.documentation_url
        : undefined,
  };
}

function parseGithubRepo(repoUrl: string): { owner: string; repo: string } | null {
  const trimmed = repoUrl.trim();
  const sshMatch = trimmed.match(/^git@github\.com:([^/]+)\/([^/]+?)(?:\.git)?$/);
  const shorthandMatch = trimmed.match(/^([^/\s]+)\/([^/\s]+?)(?:\.git)?$/);

  if (sshMatch) {
    return {
      owner: sshMatch[1],
      repo: sshMatch[2],
    };
  }

  const urlValue = trimmed.startsWith('github.com/')
    ? `https://${trimmed}`
    : trimmed;

  try {
    const url = new URL(urlValue);

    if (url.hostname === 'github.com') {
      const [owner, repo] = url.pathname
        .split('/')
        .filter(Boolean);

      if (owner && repo) {
        return {
          owner,
          repo: repo.replace(/\.git$/, ''),
        };
      }
    }
  } catch {
    // Fall through to owner/repo shorthand parsing.
  }

  const match = shorthandMatch;

  if (!match) {
    return null;
  }

  return {
    owner: match[1],
    repo: match[2],
  };
}

function normalizeGithubPath(filePath: string): string {
  return filePath
    .trim()
    .replace(/^\/+/, '')
    .replace(/\/{2,}/g, '/');
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

export async function GET() {
  return NextResponse.json({
    repoUrl: defaultGithubRepoUrl,
    branch: defaultGithubBranch,
    backupPath: normalizeGithubPath(defaultGithubBackupPath),
    commitMessage: defaultGithubCommitMessage,
    hasServerToken: Boolean(process.env.GITHUB_BACKUP_TOKEN?.trim()),
  });
}

function buildGithubError(
  response: Response,
  body: GithubErrorBody,
  fallback: string,
  context?: string
): string {
  const githubMessage = body.message ? ` GitHub: ${body.message}.` : '';
  const prefix = context ? `${context}: ` : '';

  if (response.status === 401) {
    return `${prefix}GitHub token không hợp lệ hoặc đã hết hạn.${githubMessage}`;
  }

  if (response.status === 403) {
    return `${prefix}GitHub token không có đủ quyền hoặc bị chặn bởi policy/rate limit. Hãy dùng fine-grained token có quyền Contents: Read and Write cho đúng repository.${githubMessage}`;
  }

  if (response.status === 404) {
    return `${prefix}GitHub trả về Not Found. Kiểm tra repo URL, branch và token có quyền vào private repo nếu repo private.${githubMessage}`;
  }

  if (response.status === 409) {
    return `${prefix}GitHub báo conflict khi ghi file. Hãy thử lại sau khi refresh tiến độ hoặc đổi đường dẫn backup.${githubMessage}`;
  }

  if (response.status === 422) {
    return `${prefix}GitHub từ chối dữ liệu commit. Kiểm tra branch tồn tại, file path hợp lệ và commit message không rỗng.${githubMessage}`;
  }

  return `${prefix}${fallback}.${githubMessage}`.trim();
}

async function fetchGithubJson<T>(
  url: string,
  {
    token,
    fallbackError,
  }: {
    token: string;
    fallbackError: string;
  }
): Promise<{ response: Response; body: T | GithubErrorBody }> {
  const response = await fetch(url, {
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });
  const body = (await response.json().catch(() => ({}))) as unknown;

  if (!response.ok) {
    throw new Error(
      buildGithubError(
        response,
        normalizeGithubErrorBody(body),
        fallbackError,
        fallbackError
      )
    );
  }

  return { response, body: body as T };
}

async function assertRepositoryAndBranchAccess({
  owner,
  repo,
  branch,
  token,
}: {
  owner: string;
  repo: string;
  branch: string;
  token: string;
}) {
  await fetchGithubJson(`https://api.github.com/repos/${owner}/${repo}`, {
    token,
    fallbackError: 'Không kiểm tra được repository GitHub',
  });

  await fetchGithubJson(
    `https://api.github.com/repos/${owner}/${repo}/branches/${encodeURIComponent(branch)}`,
    {
      token,
      fallbackError: 'Không kiểm tra được branch GitHub',
    }
  );
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
      buildGithubError(
        response,
        normalizeGithubErrorBody(body),
        'Không đọc được file backup hiện có trên GitHub',
        'Không đọc được file backup hiện có trên GitHub'
      )
    );
  }

  const data = (await response.json()) as { sha?: string };
  return data.sha;
}

export async function POST(request: Request) {
  let body: GithubBackupRequest;

  try {
    body = (await request.json()) as GithubBackupRequest;
  } catch {
    return NextResponse.json({ error: 'Request body không phải JSON hợp lệ' }, { status: 400 });
  }

  const repoUrl = body.repoUrl?.trim() || defaultGithubRepoUrl;
  const repo = repoUrl ? parseGithubRepo(repoUrl) : null;
  const token = body.token?.trim() || process.env.GITHUB_BACKUP_TOKEN?.trim();
  const branch = body.branch?.trim() || defaultGithubBranch;
  const backupPath = normalizeGithubPath(body.backupPath || defaultGithubBackupPath);
  const commitMessage =
    body.commitMessage?.trim() || defaultGithubCommitMessage;

  if (!token) {
    return NextResponse.json({ error: 'GitHub token is required' }, { status: 400 });
  }

  if (!repo) {
    return NextResponse.json(
      { error: 'GitHub repo URL phải có dạng https://github.com/owner/repo, git@github.com:owner/repo.git hoặc owner/repo' },
      { status: 400 }
    );
  }

  if (!backupPath || backupPath.endsWith('/')) {
    return NextResponse.json(
      { error: 'File path phải là đường dẫn tới file, ví dụ backups/skill-roadmap-progress.json' },
      { status: 400 }
    );
  }

  const progress = body.progress ?? await readProgress();
  const content = `${JSON.stringify(progress, null, 2)}\n`;
  const encodedContent = Buffer.from(content, 'utf8').toString('base64');

  try {
    await assertRepositoryAndBranchAccess({
      owner: repo.owner,
      repo: repo.repo,
      branch,
      token,
    });

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
      const errorBody = normalizeGithubErrorBody(
        await response.json().catch(() => ({}))
      );

      return NextResponse.json(
        {
          error: buildGithubError(response, errorBody, 'GitHub backup failed'),
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
