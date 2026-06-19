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

type ChatCompletionChunk = {
  choices?: Array<{
    delta?: {
      content?: string;
    };
    message?: {
      content?: string;
    };
  }>;
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

  if (provider === 'kilo') {
    return normalizeBaseUrl(process.env.AI_COMMENT_KILO_BASE_URL ?? providerBaseUrls.kilo);
  }

  return providerBaseUrls[provider] ?? null;
}

function resolveApiKey(provider: string, apiKey: unknown) {
  if (isNonEmptyString(apiKey)) {
    return apiKey.trim();
  }

  if (provider === 'kilo') {
    return (
      process.env.AI_COMMENT_KILO_API_KEY?.trim() ??
      process.env.AI_COMMENT_API_KEY?.trim() ??
      process.env.AI_FLASHCARD_API_KEY?.trim() ??
      ''
    );
  }

  return '';
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

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: Request) {
  let body: AiCommentRequest;

  try {
    body = (await request.json()) as AiCommentRequest;
  } catch {
    return jsonError('Payload không phải JSON hợp lệ.', 400);
  }

  const provider = isNonEmptyString(body.provider) ? body.provider.trim() : 'openrouter';
  const apiKey = resolveApiKey(provider, body.apiKey);
  const model = isNonEmptyString(body.model) ? body.model.trim() : '';
  const question = isNonEmptyString(body.question) ? body.question.trim() : '';
  const baseUrl = resolveBaseUrl(provider, body.baseUrl);

  if (!apiKey) {
    return jsonError(
      provider === 'kilo'
        ? 'Chưa cấu hình API key Kilo AI trong env.'
        : 'Vui lòng nhập API key trước khi hỏi AI.',
      provider === 'kilo' ? 500 : 400
    );
  }

  if (!model) {
    return jsonError('Vui lòng nhập hoặc chọn model.', 400);
  }

  if (!question) {
    return jsonError('Vui lòng nhập câu hỏi cho AI.', 400);
  }

  if (!baseUrl) {
    return jsonError('Vui lòng nhập Base URL cho kênh AI tương thích OpenAI.', 400);
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
        stream: true,
      }),
    });

    if (!response.ok) {
      const responseBody = (await response.json().catch(() => ({}))) as ChatCompletionResponse;
      return jsonError(
        responseBody.error?.message ??
          `Không gọi được AI provider. HTTP status: ${response.status}.`,
        502
      );
    }

    if (!response.body) {
      return jsonError('AI provider không trả về stream nội dung.', 502);
    }

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        const reader = response.body?.getReader();

        if (!reader) {
          controller.error(new Error('Không đọc được stream từ AI provider.'));
          return;
        }

        let buffer = '';

        try {
          while (true) {
            const { done, value } = await reader.read();

            if (done) {
              break;
            }

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split(/\r?\n/);
            buffer = lines.pop() ?? '';

            for (const line of lines) {
              const trimmed = line.trim();

              if (!trimmed || !trimmed.startsWith('data:')) {
                continue;
              }

              const data = trimmed.slice(5).trim();

              if (data === '[DONE]') {
                controller.close();
                return;
              }

              try {
                const chunk = JSON.parse(data) as ChatCompletionChunk;
                const content =
                  chunk.choices?.[0]?.delta?.content ??
                  chunk.choices?.[0]?.message?.content ??
                  '';

                if (content) {
                  controller.enqueue(encoder.encode(content));
                }
              } catch {
                // Ignore malformed provider events and continue the stream.
              }
            }
          }

          controller.close();
        } catch (streamError) {
          console.error('AI comment stream failed:', streamError);
          controller.error(streamError);
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch (error) {
    console.error('AI comment request failed:', error);
    return jsonError('Không kết nối được tới AI provider. Kiểm tra Base URL, API key hoặc mạng.', 502);
  }
}
