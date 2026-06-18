import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type AiCommentRequest = {
  provider?: unknown;
  apiKey?: unknown;
  model?: unknown;
  baseUrl?: unknown;
  question?: unknown;
  markdownContext?: unknown;
  threadContext?: unknown;
};

type ChatCompletionResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
  error?: {
    message?: string;
  };
};

const providerBaseUrls: Record<string, string> = {
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

function compactText(value: string, maxLength: number) {
  const compacted = value
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  if (compacted.length <= maxLength) {
    return compacted;
  }

  return `${compacted.slice(0, maxLength).trim()}\n\n[Context đã được rút gọn để giới hạn payload.]`;
}

export async function POST(request: Request) {
  let body: AiCommentRequest;

  try {
    body = (await request.json()) as AiCommentRequest;
  } catch {
    return NextResponse.json({ error: 'Payload không phải JSON hợp lệ.' }, { status: 400 });
  }

  const provider = isNonEmptyString(body.provider) ? body.provider.trim() : 'openrouter';
  const apiKey = isNonEmptyString(body.apiKey) ? body.apiKey.trim() : '';
  const model = isNonEmptyString(body.model) ? body.model.trim() : '';
  const question = isNonEmptyString(body.question) ? body.question.trim() : '';
  const baseUrl = resolveBaseUrl(provider, body.baseUrl);

  if (!apiKey) {
    return NextResponse.json({ error: 'Vui lòng nhập API key trước khi hỏi AI.' }, { status: 400 });
  }

  if (!model) {
    return NextResponse.json({ error: 'Vui lòng nhập hoặc chọn model.' }, { status: 400 });
  }

  if (!question) {
    return NextResponse.json({ error: 'Vui lòng nhập câu hỏi cho AI.' }, { status: 400 });
  }

  if (!baseUrl) {
    return NextResponse.json(
      { error: 'Vui lòng nhập Base URL cho kênh AI tương thích OpenAI.' },
      { status: 400 }
    );
  }

  const markdownContext = compactText(
    isNonEmptyString(body.markdownContext) ? body.markdownContext : 'Không có nội dung Markdown.',
    10000
  );
  const threadContext = compactText(
    isNonEmptyString(body.threadContext) ? body.threadContext : 'Chưa có lịch sử trao đổi trong thread này.',
    6000
  );

  const messages = [
    {
      role: 'system',
      content: [
        'Bạn là trợ lý review và thảo luận nội dung note Markdown.',
        'Trả lời bằng tiếng Việt, rõ ràng, có cấu trúc, tập trung đúng câu hỏi.',
        'Nếu cần giả định, hãy nói rõ. Không bịa thông tin ngoài context được cung cấp.',
      ].join(' '),
    },
    {
      role: 'user',
      content: [
        '## Tóm lược nội dung Markdown',
        markdownContext,
        '',
        '## Context comment/reply hiện tại',
        threadContext,
        '',
        '## Câu hỏi mới',
        question,
      ].join('\n'),
    },
  ];

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        ...(provider === 'openrouter'
          ? {
              'HTTP-Referer': 'http://localhost:3000',
              'X-Title': 'CV Markdown Comment Preview',
            }
          : {}),
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.3,
      }),
    });

    const responseBody = (await response.json().catch(() => ({}))) as ChatCompletionResponse;

    if (!response.ok) {
      return NextResponse.json(
        {
          error:
            responseBody.error?.message ??
            `Không gọi được AI provider. HTTP status: ${response.status}.`,
        },
        { status: 502 }
      );
    }

    const answer = responseBody.choices?.[0]?.message?.content?.trim();

    if (!answer) {
      return NextResponse.json(
        { error: 'AI provider không trả về nội dung trả lời.' },
        { status: 502 }
      );
    }

    return NextResponse.json({ answer });
  } catch (error) {
    console.error('AI comment request failed:', error);
    return NextResponse.json(
      { error: 'Không kết nối được tới AI provider. Kiểm tra Base URL, API key hoặc mạng.' },
      { status: 502 }
    );
  }
}
