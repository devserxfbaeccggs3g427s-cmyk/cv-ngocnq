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
  studyContextItems?: unknown;
  threadContext?: unknown;
};

type StudyContextItem = {
  sourceType: 'markdown-file' | 'roadmap-task' | 'context';
  title: string;
  content: string;
};

function readStudyContextItems(value: unknown): StudyContextItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const items: StudyContextItem[] = [];

  for (const entry of value) {
    if (!entry || typeof entry !== 'object') {
      continue;
    }

    const item = entry as Record<string, unknown>;
    const title = isNonEmptyString(item.title) ? item.title.trim() : '';
    const content = isNonEmptyString(item.content) ? item.content.trim() : '';
    const sourceType = isNonEmptyString(item.sourceType) ? item.sourceType.trim() : 'context';

    if (!title || !content) {
      continue;
    }

    items.push({
      sourceType:
        sourceType === 'markdown-file' || sourceType === 'roadmap-task'
          ? sourceType
          : 'context',
      title,
      content,
    });
  }

  return items;
}

function buildProviderHeaders(provider: string, apiKey: string) {
  return {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
    ...(provider === 'openrouter'
      ? {
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'CV Markdown Comment Preview',
        }
      : {}),
  };
}

async function summarizeContextItem(options: {
  apiKey: string;
  baseUrl: string;
  item: StudyContextItem;
  itemIndex: number;
  model: string;
  provider: string;
  question: string;
}) {
  const { apiKey, baseUrl, item, itemIndex, model, provider, question } = options;
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: buildProviderHeaders(provider, apiKey),
    body: JSON.stringify({
      model,
      messages: [
        {
          role: 'system',
          content: [
            'Bạn là trợ lý nén context trước khi trả lời câu hỏi cuối.',
            'Tóm lược bằng tiếng Việt, ngắn gọn nhưng giữ đủ thuật ngữ, số liệu, quyết định, trade-off, lỗi thường gặp và chi tiết liên quan đến câu hỏi.',
            'Không trả lời câu hỏi cuối ở bước này. Không bịa thông tin ngoài context.',
          ].join(' '),
        },
        {
          role: 'user',
          content: [
            `## Context ${itemIndex + 1}: ${item.title}`,
            `- Loại nguồn: ${item.sourceType}`,
            '',
            '## Câu hỏi người dùng sẽ hỏi sau bước tóm lược',
            question,
            '',
            '## Nội dung context cần tóm lược',
            compactText(item.content, 12000),
            '',
            'Hãy tóm lược context này trong tối đa 12 gạch đầu dòng. Nếu context không liên quan câu hỏi, vẫn ghi 1-2 dòng nói rõ phần nào có thể bỏ qua.',
          ].join('\n'),
        },
      ],
      temperature: 0.1,
      stream: false,
    }),
  });

  if (!response.ok) {
    const responseBody = (await response.json().catch(() => ({}))) as ChatCompletionResponse;
    throw new Error(
      responseBody.error?.message ??
        `Không tóm lược được context "${item.title}". HTTP status: ${response.status}.`
    );
  }

  const responseBody = (await response.json().catch(() => ({}))) as ChatCompletionResponse;
  const summary = responseBody.choices?.[0]?.message?.content?.trim();

  if (!summary) {
    return compactText(item.content, 2200);
  }

  return compactText(summary, 2500);
}

async function summarizeStudyContextItems(options: {
  apiKey: string;
  baseUrl: string;
  items: StudyContextItem[];
  model: string;
  omittedCount: number;
  provider: string;
  question: string;
}) {
  const summaries: string[] = [];

  for (const [index, item] of options.items.entries()) {
    const summary = await summarizeContextItem({
      apiKey: options.apiKey,
      baseUrl: options.baseUrl,
      item,
      itemIndex: index,
      model: options.model,
      provider: options.provider,
      question: options.question,
    });

    summaries.push(
      [
        `### Context ${index + 1}: ${item.title}`,
        `- Loại nguồn: ${item.sourceType}`,
        '',
        summary,
      ].join('\n')
    );
  }

  if (options.omittedCount > 0) {
    summaries.push(
      [
        '### Context chưa được tóm lược',
        `${options.omittedCount} nguồn context vượt quá giới hạn 20 nguồn mỗi lượt hỏi nên không được đưa vào câu trả lời này.`,
      ].join('\n')
    );
  }

  return summaries.join('\n\n---\n\n');
}

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

  const parsedStudyContextItems = readStudyContextItems(body.studyContextItems);
  const studyContextItems = parsedStudyContextItems.slice(0, 20);
  const omittedStudyContextCount = Math.max(parsedStudyContextItems.length - studyContextItems.length, 0);
  const hasSummarizableStudyContext = studyContextItems.length > 0;
  const hasStudyContext = hasSummarizableStudyContext || isNonEmptyString(body.studyContext);
  const rawFocusContext = isNonEmptyString(body.studyContext)
    ? body.studyContext
    : isNonEmptyString(body.markdownContext)
      ? body.markdownContext
      : 'Không có nội dung Markdown.';
  const compactFocusContext = compactText(rawFocusContext, hasStudyContext ? 5000 : 10000);
  const contextTitle = hasSummarizableStudyContext
    ? 'Tóm lược từng nguồn context đã chọn'
    : hasStudyContext
      ? 'Ngữ cảnh học tập hiện tại'
      : 'Tóm lược nội dung Markdown';
  const systemFocus = hasSummarizableStudyContext
    ? 'Bạn là trợ lý học tập trả lời dựa trên các context đã được tóm lược riêng từng nguồn.'
    : hasStudyContext
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

  try {
    const focusContext = hasSummarizableStudyContext
      ? await summarizeStudyContextItems({
          apiKey,
          baseUrl,
          items: studyContextItems,
          model,
          omittedCount: omittedStudyContextCount,
          provider,
          question,
        })
      : compactFocusContext;

    const messages = [
      {
        role: 'system',
        content: [
          systemFocus,
          'Trả lời bằng tiếng Việt, rõ ràng, có cấu trúc, tập trung đúng câu hỏi.',
          contextGuard,
          hasSummarizableStudyContext
            ? 'Các context bên dưới đã được AI tóm lược trước; hãy dựa vào các bản tóm lược đó và nói rõ nếu thiếu dữ kiện.'
            : '',
        ].filter(Boolean).join(' '),
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

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: buildProviderHeaders(provider, apiKey),
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
