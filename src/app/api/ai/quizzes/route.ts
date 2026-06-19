import { NextResponse } from 'next/server';
import { validateEnvAiPassword } from '../env-confirmation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type QuizRequest = {
  confirmPassword?: unknown;
  task?: unknown;
  note?: unknown;
  comments?: unknown;
  existingQuestions?: unknown;
};

type QuizTask = {
  id: string;
  title: string;
  level: string;
  deliverable: string;
};

type QuizComment = {
  author?: string;
  body?: string;
  createdAt?: string;
};

type AiQuizQuestion = {
  question?: unknown;
  options?: unknown;
  correctOptionIndex?: unknown;
  explanation?: unknown;
  tag?: unknown;
};

type QuizQuestion = {
  id: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
  tag: string;
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

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function normalizeBaseUrl(value: string) {
  return value.trim().replace(/\/+$/, '');
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

function readTask(value: unknown): QuizTask | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const task = value as Record<string, unknown>;

  if (
    !isNonEmptyString(task.id) ||
    !isNonEmptyString(task.title) ||
    !isNonEmptyString(task.level) ||
    !isNonEmptyString(task.deliverable)
  ) {
    return null;
  }

  return {
    id: task.id.trim(),
    title: task.title.trim(),
    level: task.level.trim(),
    deliverable: task.deliverable.trim(),
  };
}

function readComments(value: unknown): QuizComment[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const comments: QuizComment[] = [];

  for (const comment of value) {
    if (!comment || typeof comment !== 'object') {
      continue;
    }

    const item = comment as Record<string, unknown>;
    const body = isNonEmptyString(item.body) ? item.body.trim() : '';

    if (!body) {
      continue;
    }

    comments.push({
      author: isNonEmptyString(item.author) ? item.author.trim() : 'user',
      body,
      createdAt: isNonEmptyString(item.createdAt) ? item.createdAt.trim() : undefined,
    });
  }

  return comments;
}

function readExistingQuestions(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((question) => {
      if (isNonEmptyString(question)) {
        return question.trim();
      }

      if (question && typeof question === 'object') {
        const item = question as Record<string, unknown>;
        return isNonEmptyString(item.question) ? item.question.trim() : '';
      }

      return '';
    })
    .filter(Boolean)
    .slice(0, 80);
}

function extractJson(content: string): unknown {
  try {
    return JSON.parse(content);
  } catch {
    const objectMatch = content.match(/\{[\s\S]*\}/);

    if (!objectMatch) {
      return null;
    }

    try {
      return JSON.parse(objectMatch[0]);
    } catch {
      return null;
    }
  }
}

function normalizeQuestions(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      const question = item as AiQuizQuestion;
      const text = isNonEmptyString(question.question) ? question.question.trim() : '';
      const options = Array.isArray(question.options)
        ? question.options
            .map((option) => (isNonEmptyString(option) ? option.trim() : ''))
            .filter(Boolean)
        : [];
      const limitedOptions = options.slice(0, 5);
      const correctOptionIndex =
        typeof question.correctOptionIndex === 'number' ? Math.trunc(question.correctOptionIndex) : -1;

      if (!text || limitedOptions.length < 3 || correctOptionIndex < 0 || correctOptionIndex >= limitedOptions.length) {
        return null;
      }

      return {
        id: crypto.randomUUID(),
        question: text,
        options: limitedOptions,
        correctOptionIndex,
        explanation: isNonEmptyString(question.explanation) ? question.explanation.trim() : '',
        tag: isNonEmptyString(question.tag) ? question.tag.trim() : 'Kiểm tra',
      };
    })
    .filter(
      (
        question
      ): question is {
        id: string;
        question: string;
        options: string[];
        correctOptionIndex: number;
        explanation: string;
        tag: string;
      } => Boolean(question)
    )
    .slice(0, 12);
}

function normalizeForSimilarity(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenSet(value: string) {
  return new Set(
    normalizeForSimilarity(value)
      .split(' ')
      .filter((token) => token.length > 2)
  );
}

function jaccardSimilarity(left: string, right: string) {
  const leftTokens = tokenSet(left);
  const rightTokens = tokenSet(right);

  if (leftTokens.size === 0 || rightTokens.size === 0) {
    return 0;
  }

  let intersection = 0;

  for (const token of leftTokens) {
    if (rightTokens.has(token)) {
      intersection += 1;
    }
  }

  return intersection / (leftTokens.size + rightTokens.size - intersection);
}

function isSimilarToExisting(question: string, existingQuestions: string[]) {
  return existingQuestions.some((existingQuestion) => jaccardSimilarity(question, existingQuestion) >= 0.5);
}

function hasTooMuchOverlap(questions: QuizQuestion[], existingQuestions: string[]) {
  if (questions.length === 0 || existingQuestions.length === 0) {
    return false;
  }

  const similarCount = questions.filter((question) =>
    isSimilarToExisting(question.question, existingQuestions)
  ).length;

  return similarCount / questions.length > 0.5;
}

export async function POST(request: Request) {
  let body: QuizRequest;

  try {
    body = (await request.json()) as QuizRequest;
  } catch {
    return jsonError('Payload không phải JSON hợp lệ.', 400);
  }

  const task = readTask(body.task);
  const note = isNonEmptyString(body.note) ? body.note.trim() : '';
  const comments = readComments(body.comments);
  const existingQuestions = readExistingQuestions(body.existingQuestions);

  if (!task) {
    return jsonError('Thiếu thông tin task để tạo trắc nghiệm.', 400);
  }

  if (!note) {
    return jsonError('Task cần có note trước khi tạo trắc nghiệm.', 400);
  }

  const passwordError = validateEnvAiPassword(body.confirmPassword);

  if (passwordError) {
    return jsonError(passwordError.message, passwordError.status);
  }

  const apiKey = process.env.AI_QUIZZ_API_KEY?.trim() ?? '';
  const baseUrl = normalizeBaseUrl(process.env.AI_QUIZZ_BASE_URL ?? '');
  const model = process.env.AI_QUIZZ_MODEL?.trim() ?? '';

  if (!apiKey || !baseUrl || !model) {
    return jsonError(
      'Chưa cấu hình AI_QUIZZ_API_KEY, AI_QUIZZ_BASE_URL hoặc AI_QUIZZ_MODEL trong env.',
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
  const previousQuestionContext = existingQuestions.length
    ? existingQuestions.map((question, index) => `${index + 1}. ${question}`).join('\n')
    : 'Chưa có bài trắc nghiệm trước đó.';

  const messages = [
    {
      role: 'system',
      content: [
        'Bạn là chuyên gia thiết kế bài kiểm tra trắc nghiệm cho kỹ sư phần mềm.',
        'Chỉ trả về JSON object hợp lệ dạng {"durationMinutes": number, "questions":[...]}, không markdown, không giải thích ngoài JSON.',
        'Mỗi câu có question, options, correctOptionIndex, explanation, tag.',
        'Mỗi options nên có 4 lựa chọn, correctOptionIndex là số 0-based.',
        'durationMinutes là thời gian làm bài hợp lý do bạn tự quyết định, trong khoảng 5 đến 90 phút.',
        'Câu hỏi phải kiểm tra hiểu bản chất, cơ chế, trade-off, lỗi dễ nhầm và tình huống áp dụng.',
        'Nếu có danh sách câu hỏi đã tạo trước đó, bài mới không được trùng hoặc tương tự quá 50% số câu với bất kỳ câu hỏi cũ nào.',
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
        '## Note cần kiểm tra',
        compactText(note, 14000),
        '',
        '## Toàn bộ comment của note',
        compactText(commentContext, 9000),
        '',
        '## Câu hỏi đã có trong các bài trắc nghiệm trước',
        compactText(previousQuestionContext, 7000),
        '',
        'Hãy tạo 8 đến 12 câu trắc nghiệm chất lượng cao bằng tiếng Việt. Không tạo câu hỏi quá hiển nhiên.',
        'Ưu tiên góc hỏi khác các câu đã có: đổi tình huống, đổi trọng tâm cơ chế, đổi trade-off, hoặc hỏi lỗi dễ nhầm khác.',
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
        temperature: 0.2,
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
    const parsed = extractJson(content);
    const questions = normalizeQuestions((parsed as { questions?: unknown } | null)?.questions);
    const rawDurationMinutes = (parsed as { durationMinutes?: unknown } | null)?.durationMinutes;
    const durationMinutes =
      typeof rawDurationMinutes === 'number'
        ? Math.min(Math.max(Math.trunc(rawDurationMinutes), 5), 90)
        : Math.min(Math.max(Math.ceil(questions.length * 1.5), 5), 90);

    if (questions.length === 0) {
      return jsonError('AI không trả về câu trắc nghiệm hợp lệ. Hãy thử model khác hoặc kiểm tra note.', 502);
    }

    if (hasTooMuchOverlap(questions, existingQuestions)) {
      return jsonError('Bài trắc nghiệm mới quá giống các bài đã có trên 50%. Hãy tạo lại để AI đổi góc hỏi.', 409);
    }

    return NextResponse.json({
      quiz: {
        id: crypto.randomUUID(),
        taskId: task.id,
        taskTitle: task.title,
        title: '',
        durationMinutes,
        createdAt: new Date().toISOString(),
        source: {
          noteCharacters: note.length,
          commentCount: comments.length,
        },
        questions,
      },
    });
  } catch (error) {
    console.error('AI quiz request failed:', error);
    return jsonError('Không kết nối được tới AI provider tạo trắc nghiệm.', 502);
  }
}
