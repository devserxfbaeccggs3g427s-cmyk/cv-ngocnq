import { NextResponse } from 'next/server';
import { validateEnvAiPassword } from '../env-confirmation';
import {
  compactText,
  isNonEmptyString,
  jsonError,
  resolveApiKey,
  resolveBaseUrl,
  usesEnvApiKey,
} from '@/lib/api';
import type { ChatCompletionChunk, ChatCompletionResponse } from '@/lib/api';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type AiCommentRequest = {
  provider?: unknown;
  apiKey?: unknown;
  confirmPassword?: unknown;
  model?: unknown;
  baseUrl?: unknown;
  question?: unknown;
  markdownContext?: unknown;
  studyContext?: unknown;
  threadContext?: unknown;
};

export async function POST(request: Request) {
  let body: AiCommentRequest;

  try {
    body = (await request.json()) as AiCommentRequest;
  } catch {
    return jsonError('Payload không phải JSON hợp lệ.', 400);
  }

  const provider = isNonEmptyString(body.provider) ? body.provider.trim() : 'openrouter';
  const shouldValidateEnvPassword = usesEnvApiKey(provider, body.apiKey);
  const passwordError = shouldValidateEnvPassword
    ? validateEnvAiPassword(body.confirmPassword)
    : null;

  if (passwordError) {
    return jsonError(passwordError.message, passwordError.status);
  }

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

  const hasStudyContext = isNonEmptyString(body.studyContext);
  const rawFocusContext = isNonEmptyString(body.studyContext)
    ? body.studyContext
    : isNonEmptyString(body.markdownContext)
      ? body.markdownContext
      : 'Không có nội dung Markdown.';
  const focusContext = compactText(
    rawFocusContext,
    hasStudyContext ? 5000 : 10000
  );
  const contextTitle = hasStudyContext ? 'Ngữ cảnh học tập hiện tại' : 'Tóm lược nội dung Markdown';
  const systemFocus = hasStudyContext
    ? 'Bạn là trợ lý học tập trả lời câu hỏi theo đúng flashcard hoặc câu quiz đang xem.'
    : 'Bạn là trợ lý review và thảo luận nội dung note Markdown.';
  const contextGuard = hasStudyContext
    ? 'Chỉ dùng ngữ cảnh học tập được cung cấp; không suy diễn từ note hoặc thẻ/câu khác.'
    : 'Nếu cần giả định, hãy nói rõ. Không bịa thông tin ngoài context được cung cấp.';

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
        systemFocus,
        'Trả lời bằng tiếng Việt, rõ ràng, có cấu trúc, tập trung đúng câu hỏi.',
        contextGuard,
      ].join(' '),
    },
    {
      role: 'user',
      content: [
        `## ${contextTitle}`,
        hasStudyContext ? focusContext : markdownContext,
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
