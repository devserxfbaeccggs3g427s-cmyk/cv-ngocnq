import { NextResponse } from 'next/server';
import { validateEnvAiPassword } from '../env-confirmation';
import {
  compactText,
  hasTooMuchOverlap,
  isNonEmptyString,
  jsonError,
  normalizeBaseUrl,
  readComments,
  readTask,
} from '@/lib/api';
import type { ChatCompletionResponse } from '@/lib/api';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type FlashcardRequest = {
  confirmPassword?: unknown;
  task?: unknown;
  note?: unknown;
  comments?: unknown;
  existingCards?: unknown;
};

type AiFlashcard = {
  front?: unknown;
  back?: unknown;
  hint?: unknown;
  tag?: unknown;
};

type NormalizedFlashcard = {
  id: string;
  front: string;
  back: string;
  hint: string;
  tag: string;
};

function readExistingCards(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((card) => {
      if (isNonEmptyString(card)) {
        return card.trim();
      }

      if (card && typeof card === 'object') {
        const item = card as Record<string, unknown>;
        return isNonEmptyString(item.front) ? item.front.trim() : '';
      }

      return '';
    })
    .filter(Boolean)
    .slice(0, 120);
}

function extractJsonArray(content: string): unknown {
  try {
    return JSON.parse(content);
  } catch {
    const match = content.match(/\[[\s\S]*\]/);

    if (!match) {
      return null;
    }

    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }
}

function normalizeFlashcards(value: unknown): NormalizedFlashcard[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      const card = item as AiFlashcard;
      const front = isNonEmptyString(card.front) ? card.front.trim() : '';
      const back = isNonEmptyString(card.back) ? card.back.trim() : '';

      if (!front || !back) {
        return null;
      }

      return {
        id: crypto.randomUUID(),
        front,
        back,
        hint: isNonEmptyString(card.hint) ? card.hint.trim() : '',
        tag: isNonEmptyString(card.tag) ? card.tag.trim() : 'Ôn tập',
      };
    })
    .filter((card): card is { id: string; front: string; back: string; hint: string; tag: string } => Boolean(card))
    .slice(0, 18);
}

export async function POST(request: Request) {
  let body: FlashcardRequest;

  try {
    body = (await request.json()) as FlashcardRequest;
  } catch {
    return jsonError('Payload không phải JSON hợp lệ.', 400);
  }

  const task = readTask(body.task);
  const note = isNonEmptyString(body.note) ? body.note.trim() : '';
  const comments = readComments(body.comments);
  const existingCards = readExistingCards(body.existingCards);

  if (!task) {
    return jsonError('Thiếu thông tin task để tạo flashcard.', 400);
  }

  if (!note) {
    return jsonError('Task cần có note trước khi tạo flashcard.', 400);
  }

  const passwordError = validateEnvAiPassword(body.confirmPassword);

  if (passwordError) {
    return jsonError(passwordError.message, passwordError.status);
  }

  const apiKey = process.env.AI_FLASHCARD_API_KEY?.trim() ?? '';
  const baseUrl = normalizeBaseUrl(process.env.AI_FLASHCARD_BASE_URL ?? '');
  const model = process.env.AI_FLASHCARD_MODEL?.trim() ?? '';

  if (!apiKey || !baseUrl || !model) {
    return jsonError(
      'Chưa cấu hình AI_FLASHCARD_API_KEY, AI_FLASHCARD_BASE_URL hoặc AI_FLASHCARD_MODEL trong env.',
      500
    );
  }

  const commentContext = comments.length
    ? comments
        .map((comment, index) => {
          const author = comment.author === 'ai' ? 'AI' : 'User';
          const time = comment.createdAt ? ` (${comment.createdAt})` : '';
          return `${index + 1}. ${author}${time}: ${comment.body}`;
        })
        .join('\n')
    : 'Không có comment.';
  const previousCardContext = existingCards.length
    ? existingCards.map((card, index) => `${index + 1}. ${card}`).join('\n')
    : 'Chưa có bộ flashcard trước đó.';

  const messages = [
    {
      role: 'system',
      content: [
        'Bạn là chuyên gia thiết kế flashcard học tập cho kỹ sư phần mềm.',
        'Chỉ trả về JSON object hợp lệ dạng {"flashcards":[...]}, không markdown, không giải thích ngoài JSON.',
        'Mỗi flashcard có front, back, hint, tag. front là câu hỏi ngắn; back là đáp án súc tích nhưng đủ ý; hint là gợi ý một dòng; tag là nhóm kiến thức.',
        'Ưu tiên active recall, câu hỏi phỏng vấn, bản chất/cơ chế, trade-off và lỗi dễ nhầm.',
        'Nếu có danh sách flashcard đã tạo trước đó, bộ mới không được trùng hoặc tương tự quá 50% số thẻ với bất kỳ thẻ cũ nào.',
      ].join(' '),
    },
    {
      role: 'user',
      content: [
        `Task: ${task.title}`,
        `ID: ${task.id}`,
        `Level: ${task.level}`,
        `Deliverable: ${task.deliverable}`,
        '',
        '## Note cần học',
        compactText(note, 14000),
        '',
        '## Toàn bộ comment của note',
        compactText(commentContext, 9000),
        '',
        '## Flashcard đã có trong các bộ trước',
        compactText(previousCardContext, 7000),
        '',
        'Hãy tạo 8 đến 14 flashcard chất lượng cao bằng tiếng Việt. Không tạo câu hỏi quá hiển nhiên.',
        'Ưu tiên đổi góc hỏi so với các flashcard đã có: đổi tình huống, đổi trọng tâm cơ chế, đổi trade-off, hoặc hỏi lỗi dễ nhầm khác.',
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

    if (!response.ok) {
      const responseBody = (await response.json().catch(() => ({}))) as ChatCompletionResponse;
      return jsonError(
        responseBody.error?.message ?? `Không gọi được AI provider. HTTP status: ${response.status}.`,
        502
      );
    }

    const responseBody = (await response.json()) as ChatCompletionResponse;
    const content = responseBody.choices?.[0]?.message?.content ?? '';
    const parsed = extractJsonArray(content);
    const cards = normalizeFlashcards(
      Array.isArray(parsed) ? parsed : (parsed as { flashcards?: unknown } | null)?.flashcards
    );

    if (cards.length === 0) {
      return jsonError('AI không trả về flashcard hợp lệ. Hãy thử model khác hoặc kiểm tra note.', 502);
    }

    if (hasTooMuchOverlap(cards, (card) => card.front, existingCards)) {
      return jsonError('Bộ flashcard mới quá giống các bộ đã có trên 50%. Hãy tạo lại để AI đổi góc hỏi.', 409);
    }

    return NextResponse.json({
      deck: {
        id: crypto.randomUUID(),
        taskId: task.id,
        taskTitle: task.title,
        title: '',
        createdAt: new Date().toISOString(),
        source: {
          noteCharacters: note.length,
          commentCount: comments.length,
        },
        cards,
      },
    });
  } catch (error) {
    console.error('AI flashcard request failed:', error);
    return jsonError('Không kết nối được tới AI provider tạo flashcard.', 502);
  }
}
