import type { NoteComment } from '@/types';
import { createComment } from './utils';

export type AiStreamCallbacks = {
  persistComments: (taskId: string, comments: NoteComment[]) => void;
  addStreamingId: (id: string) => void;
  removeStreamingId: (id: string) => void;
  onError: (message: string) => void;
  getComments: (taskId: string) => NoteComment[];
};

export type AiStreamOptions = {
  taskId: string;
  question: string;
  parentId: string | null;
  provider: string;
  model: string;
  apiKey: string;
  baseUrl: string;
  confirmPassword: string;
  markdownContext?: string;
  studyContext?: string;
  threadContext?: string | ((comments: NoteComment[], userComment: NoteComment) => string);
};

export async function streamAiComment(options: AiStreamOptions, callbacks: AiStreamCallbacks): Promise<void> {
  const currentComments = callbacks.getComments(options.taskId);
  const userComment = createComment({
    parentId: options.parentId,
    author: 'user',
    body: options.question,
  });
  const aiReply = createComment({
    parentId: userComment.id,
    author: 'ai',
    body: '',
    model: options.model,
    provider: options.provider,
  });
  const rollbackComments = [...currentComments, userComment];
  const threadContext = typeof options.threadContext === 'function'
    ? options.threadContext(rollbackComments, userComment)
    : options.threadContext;
  let nextComments = [...rollbackComments, aiReply];

  callbacks.persistComments(options.taskId, nextComments);
  callbacks.addStreamingId(aiReply.id);

  try {
    const response = await fetch('/api/ai/comment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider: options.provider,
        apiKey: options.apiKey,
        confirmPassword: options.confirmPassword,
        model: options.model,
        baseUrl: options.baseUrl,
        question: options.question,
        markdownContext: options.markdownContext,
        studyContext: options.studyContext,
        threadContext,
      }),
    });

    if (!response.ok || !response.body) {
      const body = (await response.json().catch(() => ({}))) as { error?: string };
      throw new Error(body.error ?? 'Không thể gọi AI.');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let answer = '';

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      answer += decoder.decode(value, { stream: true });
      nextComments = nextComments.map((comment) =>
        comment.id === aiReply.id ? { ...comment, body: answer } : comment
      );
      callbacks.persistComments(options.taskId, nextComments);
    }

    answer += decoder.decode();

    if (!answer.trim()) {
      throw new Error('AI provider không trả về nội dung trả lời.');
    }

    nextComments = nextComments.map((comment) =>
      comment.id === aiReply.id ? { ...comment, body: answer.trim() } : comment
    );
    callbacks.persistComments(options.taskId, nextComments);
  } catch (error) {
    callbacks.persistComments(options.taskId, rollbackComments);
    callbacks.onError(error instanceof Error ? error.message : 'Không thể gọi AI.');
  } finally {
    callbacks.removeStreamingId(aiReply.id);
  }
}
