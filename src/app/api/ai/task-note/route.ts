import { NextResponse } from 'next/server';
import {
  compactText,
  isNonEmptyString,
  jsonError,
  normalizeBaseUrl,
  readTask,
} from '@/lib/api';
import { buildLearningPrompt } from '@/lib/roadmap';
import type { ChatCompletionResponse } from '@/lib/api';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type TaskNoteRequest = {
  task?: unknown;
  learningPrompt?: unknown;
  isCompleted?: unknown;
  hasChildren?: unknown;
  hasNote?: unknown;
  descendantSummary?: unknown;
};

function isAutoTaskNoteEnabled() {
  return process.env.AI_TASK_NOTE_ENABLED?.trim().toLowerCase() === 'true';
}

function firstNonEmptyEnv(...values: Array<string | undefined>) {
  return values.map((value) => value?.trim() ?? '').find(Boolean) ?? '';
}

function resolveTaskNoteConfig() {
  return {
    apiKey: firstNonEmptyEnv(
      process.env.AI_TASK_NOTE_API_KEY,
      process.env.AI_COMMENT_KILO_API_KEY,
      process.env.AI_COMMENT_API_KEY,
      process.env.AI_FLASHCARD_API_KEY
    ),
    baseUrl: normalizeBaseUrl(
      firstNonEmptyEnv(
        process.env.AI_TASK_NOTE_BASE_URL,
        process.env.AI_COMMENT_KILO_BASE_URL,
        'https://api.kilo.ai/api/gateway'
      )
    ),
    model: firstNonEmptyEnv(
      process.env.AI_TASK_NOTE_MODEL,
      process.env.AI_COMMENT_KILO_MODEL,
      process.env.AI_COMMENT_MODEL,
      process.env.AI_FLASHCARD_MODEL
    ),
  };
}

export async function POST(request: Request) {
  if (!isAutoTaskNoteEnabled()) {
    return jsonError('Tự động sinh note bằng AI chưa được bật. Cấu hình AI_TASK_NOTE_ENABLED=true để dùng.', 501);
  }

  let body: TaskNoteRequest;

  try {
    body = (await request.json()) as TaskNoteRequest;
  } catch {
    return jsonError('Payload không phải JSON hợp lệ.', 400);
  }

  const task = readTask(body.task);
  const learningPrompt = isNonEmptyString(body.learningPrompt) ? body.learningPrompt.trim() : '';
  const descendantSummary = isNonEmptyString(body.descendantSummary)
    ? compactText(body.descendantSummary, 5000)
    : 'Không có tóm tắt task con.';

  if (!task) {
    return jsonError('Thiếu thông tin task để sinh note.', 400);
  }

  if (!body.hasChildren) {
    return jsonError('Chỉ tự động sinh note cho task cha có task con.', 409);
  }

  if (!body.isCompleted) {
    return jsonError('Task cha phải hoàn thành trước khi tự động sinh note.', 409);
  }

  if (body.hasNote) {
    return jsonError('Task đã có note nên không tự động ghi đè.', 409);
  }

  if (!learningPrompt || learningPrompt !== buildLearningPrompt(task)) {
    return jsonError('Prompt sinh note không khớp với task hiện tại.', 400);
  }

  const { apiKey, baseUrl, model } = resolveTaskNoteConfig();

  if (!apiKey || !baseUrl || !model) {
    return jsonError(
      'Chưa cấu hình AI_TASK_NOTE_API_KEY, AI_TASK_NOTE_BASE_URL hoặc AI_TASK_NOTE_MODEL trong env.',
      500
    );
  }

  const messages = [
    {
      role: 'system',
      content: [
        'Bạn là mentor Backend/Senior Engineer tạo note học tập Markdown cho kỹ sư phần mềm.',
        'Trả lời bằng tiếng Việt, chỉ xuất Markdown note hoàn chỉnh, không bọc toàn bộ bằng code fence.',
        'Nội dung phải thực dụng, đúng trọng tâm task, có cấu trúc rõ, có ví dụ nhỏ và câu hỏi tự kiểm tra.',
        'Không thêm lời dẫn kiểu "Dưới đây là". Không bịa thông tin ngoài prompt và tóm tắt task con.',
      ].join(' '),
    },
    {
      role: 'user',
      content: [
        '## Prompt học tập của task cha',
        learningPrompt,
        '',
        '## Thông tin task cha',
        `ID: ${task.id}`,
        `Tiêu đề: ${task.title}`,
        `Cấp độ: ${task.level}`,
        `Deliverable: ${task.deliverable}`,
        '',
        '## Tóm tắt tiến độ task con',
        descendantSummary,
        '',
        'Hãy tạo note Markdown theo đúng prompt học tập ở trên.',
      ].join('\n'),
    },
  ];

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.25,
      }),
    });

    const responseBody = (await response.json().catch(() => ({}))) as ChatCompletionResponse;

    if (!response.ok) {
      return jsonError(
        responseBody.error?.message ?? `Không gọi được AI provider. HTTP status: ${response.status}.`,
        502
      );
    }

    const note = responseBody.choices?.[0]?.message?.content?.trim() ?? '';

    if (!note || note.length < 200) {
      return jsonError('AI không trả về note đủ nội dung để lưu.', 502);
    }

    return NextResponse.json({
      note,
      source: {
        taskId: task.id,
        model,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('AI task note request failed:', error);
    return jsonError('Không kết nối được tới AI provider sinh note.', 502);
  }
}
