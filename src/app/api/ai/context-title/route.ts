import { NextResponse } from 'next/server';
import {
  compactText,
  isNonEmptyString,
  jsonError,
  resolveApiKey,
  resolveBaseUrl,
} from '@/lib/api';
import type { ChatCompletionChunk, ChatCompletionResponse } from '@/lib/api';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type AiContextTitleRequest = {
  question?: unknown;
  studyContext?: unknown;
};

function cleanTitle(value: string) {
  return value
    .replace(/<think[\s\S]*?<\/think>/gi, '')
    .replace(/<thinking[\s\S]*?<\/thinking>/gi, '')
    .replace(/^["'“”‘’\s]+|["'“”‘’\s]+$/g, '')
    .replace(/^tiêu đề\s*:\s*/i, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 90);
}

function fallbackTitle(question: string) {
  return cleanTitle(question)
    .replace(/[.!?。]+$/g, '')
    .slice(0, 72) || 'Thread AI Context';
}

export async function POST(request: Request) {
  let body: AiContextTitleRequest;

  try {
    body = (await request.json()) as AiContextTitleRequest;
  } catch {
    return jsonError('Payload không phải JSON hợp lệ.', 400);
  }

  const question = isNonEmptyString(body.question) ? body.question.trim() : '';
  const studyContext = compactText(
    isNonEmptyString(body.studyContext) ? body.studyContext : 'Không có context.',
    2500
  );
  const apiKey = resolveApiKey('kilo', undefined);
  const baseUrl = resolveBaseUrl('kilo', undefined);
  const model =
    process.env.AI_CONTEXT_TITLE_MODEL?.trim() ||
    process.env.AI_COMMENT_KILO_MODEL?.trim() ||
    process.env.AI_TASK_NOTE_MODEL?.trim() ||
    '';

  if (!question) {
    return jsonError('Thiếu nội dung chat để tạo tiêu đề.', 400);
  }

  if (!apiKey || !baseUrl || !model) {
    return NextResponse.json({
      title: fallbackTitle(question),
      generated: false,
      error: 'Chưa cấu hình AI_CONTEXT_TITLE_MODEL hoặc AI_COMMENT_KILO_MODEL/API key trong env.',
    });
  }

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content:
              'Bạn chỉ tạo tiêu đề ngắn cho lịch sử chat học tập. Trả về đúng một dòng tiếng Việt, không markdown, không giải thích, tối đa 8 từ.',
          },
          {
            role: 'user',
            content: [
              '## Context đã chọn',
              studyContext,
              '',
              '## Nội dung chat',
              compactText(question, 1200),
            ].join('\n'),
          },
        ],
        temperature: 0.2,
        stream: true,
      }),
    });

    if (!response.ok) {
      const responseBody = (await response.json().catch(() => ({}))) as ChatCompletionResponse;

      return NextResponse.json({
        title: fallbackTitle(question),
        generated: false,
        error:
          responseBody.error?.message ??
          `Không tạo được tiêu đề. HTTP status: ${response.status}.`,
      });
    }

    if (!response.body) {
      return NextResponse.json({
        title: fallbackTitle(question),
        generated: false,
        error: 'AI provider không trả về stream nội dung.',
      });
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let rawTitle = '';

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
          break;
        }

        try {
          const chunk = JSON.parse(data) as ChatCompletionChunk;
          rawTitle +=
            chunk.choices?.[0]?.delta?.content ??
            chunk.choices?.[0]?.message?.content ??
            '';
        } catch {
          // Ignore malformed provider events and continue reading.
        }
      }
    }

    const title = cleanTitle(rawTitle);

    if (!title) {
      return NextResponse.json({
        title: fallbackTitle(question),
        generated: false,
        error: 'AI không trả về tiêu đề hợp lệ.',
      });
    }

    return NextResponse.json({ title, generated: true });
  } catch (error) {
    console.error('AI context title request failed:', error);
    return NextResponse.json({
      title: fallbackTitle(question),
      generated: false,
      error: 'Không kết nối được tới AI để tạo tiêu đề.',
    });
  }
}
