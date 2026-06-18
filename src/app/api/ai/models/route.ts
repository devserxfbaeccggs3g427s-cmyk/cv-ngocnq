import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type AiModelsRequest = {
  provider?: unknown;
  apiKey?: unknown;
  baseUrl?: unknown;
};

type AiModel = {
  id?: unknown;
  name?: unknown;
  owned_by?: unknown;
};

type ModelsResponse = {
  data?: AiModel[];
  error?: {
    message?: string;
  };
};

const providerBaseUrls: Record<string, string> = {
  kilo: 'https://api.kilo.ai/api/gateway',
  openrouter: 'https://openrouter.ai/api/v1',
};

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function normalizeBaseUrl(value: string) {
  return value.trim().replace(/\/+$/, '');
}

function resolveBaseUrl(provider: string, baseUrl: unknown) {
  if (provider === 'custom') {
    return isNonEmptyString(baseUrl) ? normalizeBaseUrl(baseUrl) : null;
  }

  return providerBaseUrls[provider] ?? null;
}

export async function POST(request: Request) {
  let body: AiModelsRequest;

  try {
    body = (await request.json()) as AiModelsRequest;
  } catch {
    return NextResponse.json({ error: 'Payload không phải JSON hợp lệ.' }, { status: 400 });
  }

  const provider = isNonEmptyString(body.provider) ? body.provider.trim() : 'openrouter';
  const apiKey = isNonEmptyString(body.apiKey) ? body.apiKey.trim() : '';
  const baseUrl = resolveBaseUrl(provider, body.baseUrl);

  if (!baseUrl) {
    return NextResponse.json(
      { error: 'Vui lòng nhập Base URL cho kênh AI tương thích OpenAI.' },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(`${baseUrl}/models`, {
      method: 'GET',
      headers: {
        ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
        'Content-Type': 'application/json',
        ...(provider === 'openrouter'
          ? {
              'HTTP-Referer': 'http://localhost:3000',
              'X-Title': 'CV Markdown Comment Preview',
            }
          : {}),
      },
    });

    const responseBody = (await response.json().catch(() => ({}))) as ModelsResponse;

    if (!response.ok) {
      return NextResponse.json(
        {
          error:
            responseBody.error?.message ??
            `Không tải được danh sách model. HTTP status: ${response.status}.`,
        },
        { status: 502 }
      );
    }

    const models = (responseBody.data ?? [])
      .map((model) => ({
        id: isNonEmptyString(model.id) ? model.id.trim() : '',
        name: isNonEmptyString(model.name) ? model.name.trim() : '',
        owner: isNonEmptyString(model.owned_by) ? model.owned_by.trim() : '',
      }))
      .filter((model) => model.id)
      .sort((left, right) => left.id.localeCompare(right.id));

    if (!models.length) {
      return NextResponse.json(
        { error: 'Provider không trả về model hợp lệ trong endpoint /models.' },
        { status: 502 }
      );
    }

    return NextResponse.json({ models });
  } catch (error) {
    console.error('AI models request failed:', error);
    return NextResponse.json(
      { error: 'Không kết nối được tới AI provider. Kiểm tra Base URL, API key hoặc mạng.' },
      { status: 502 }
    );
  }
}
