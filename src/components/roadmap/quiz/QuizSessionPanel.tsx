'use client';

import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock3,
  RotateCcw,
  XCircle,
} from 'lucide-react';
import { MarkdownPreview } from '@/components/markdown/MarkdownPreview';
import { StudyCommentThread } from '@/components/roadmap/comments';
import { Card, CardContent } from '@/components/ui';
import { cn } from '@/lib/utils';
import type { QuizQuestion, QuizAttempt, QuizDeck } from '@/types';

interface QuizSessionPanelProps {
  taskId: string;
  activeQuiz: QuizDeck;
  questions: QuizQuestion[];
  activeQuestionIndex: number;
  setActiveQuestionIndex: (index: number | ((current: number) => number)) => void;
  answers: Record<string, number>;
  answerQuestion: (questionId: string, optionIndex: number) => void;
  submitted: boolean;
  quizStarted: boolean;
  remainingSeconds: number;
  isReviewingAttempt: boolean;
  activeAttempt: QuizAttempt | null;
  answeredCount: number;
  startQuiz: () => void;
  restartQuiz: () => void;
  submitQuiz: (submittedBy: 'user' | 'timeout') => void;
}

export function QuizSessionPanel({
  taskId,
  activeQuiz,
  questions,
  activeQuestionIndex,
  setActiveQuestionIndex,
  answers,
  answerQuestion,
  submitted,
  quizStarted,
  remainingSeconds,
  isReviewingAttempt,
  activeAttempt,
  answeredCount,
  startQuiz,
  restartQuiz,
  submitQuiz,
}: QuizSessionPanelProps) {
  const activeQuestion = questions[activeQuestionIndex] ?? null;

  return (
    <Card>
      <CardContent className="p-3 sm:p-5 md:p-6">
        <div className="flex flex-col gap-3 border-b border-[var(--line)] pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="eyebrow">
              {activeQuiz.title} · {isReviewingAttempt ? 'Xem lại' : 'Làm bài'} · Câu {Math.min(activeQuestionIndex + 1, questions.length)}/{questions.length}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <div className="progress-track h-3 w-64 max-w-full sm:h-2">
                <div
                  className="progress-fill h-full"
                  style={{ width: `${questions.length ? (answeredCount / questions.length) * 100 : 0}%` }}
                />
              </div>
              <span
                className={cn(
                  'badge',
                  quizStarted ? 'badge-accent' : 'badge-ghost'
                )}
              >
                <Clock3 className="h-3.5 w-3.5" />
                {isReviewingAttempt
                  ? 'Lượt đã lưu'
                  : quizStarted
                    ? formatDuration(remainingSeconds)
                    : `${activeQuiz.durationMinutes} phút`}
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {!quizStarted && !submitted && (
              <button
                type="button"
                onClick={startQuiz}
                className="btn btn-primary w-full sm:w-fit"
              >
                <Clock3 className="h-4 w-4" />
                Bắt đầu làm bài
              </button>
            )}
            <button
              type="button"
              onClick={restartQuiz}
              className="btn btn-secondary w-full sm:w-fit"
            >
              <RotateCcw className="h-4 w-4" />
              Đặt lại màn làm
            </button>
          </div>
        </div>

        {!quizStarted && !submitted && (
          <div className="card mt-5 border-[var(--accent)] px-4 py-4 text-lg leading-8 text-[var(--fg)] sm:py-3 sm:text-sm sm:leading-6">
            Bấm &quot;Bắt đầu làm bài&quot; để xác nhận vào lượt làm mới. Đồng hồ sẽ chạy ngay sau khi xác nhận và bài sẽ tự nộp khi hết giờ.
          </div>
        )}

        {submitted && activeAttempt?.submittedBy === 'timeout' && (
          <div className="card mt-5 border-[var(--warn)] px-4 py-4 text-lg font-medium leading-8 text-[var(--warn)] sm:py-3 sm:text-sm sm:leading-normal">
            Đã hết thời gian, hệ thống đã tự động nộp bài.
          </div>
        )}

        {isReviewingAttempt && activeAttempt && (
          <div className="card mt-5 border-[var(--accent)] px-4 py-4 text-lg leading-8 text-[var(--fg)] sm:py-3 sm:text-sm sm:leading-6">
            Đang xem lại lượt làm bắt đầu lúc {formatDate(activeAttempt.startedAt)}. Đáp án đã lưu được hiển thị kèm đúng/sai và giải thích.
          </div>
        )}

        {activeQuestion && (
          <div className="mt-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="badge">
                {activeQuestion.tag}
              </span>
              {submitted && answers[activeQuestion.id] !== undefined && (
                <span
                  className={cn(
                    'badge',
                    answers[activeQuestion.id] === activeQuestion.correctOptionIndex
                      ? 'border-[var(--success)] text-[var(--success)]'
                      : 'border-[var(--warn)] text-[var(--warn)]'
                  )}
                >
                  {answers[activeQuestion.id] === activeQuestion.correctOptionIndex ? (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  ) : (
                    <XCircle className="h-3.5 w-3.5" />
                  )}
                  {answers[activeQuestion.id] === activeQuestion.correctOptionIndex ? 'Đúng' : 'Sai'}
                </span>
              )}
            </div>

            <div className="quiz-markdown quiz-markdown-question mt-4 font-serif text-[var(--fg)]">
              <MarkdownPreview
                content={activeQuestion.question}
                enableBookReader
                bookReaderTitle={`Câu hỏi ${activeQuestionIndex + 1}`}
              />
            </div>

            <div className="mt-5 space-y-3">
              {activeQuestion.options.map((option, optionIndex) => {
                const selected = answers[activeQuestion.id] === optionIndex;
                const correct = activeQuestion.correctOptionIndex === optionIndex;

                return (
                  <button
                    key={`${activeQuestion.id}-${optionIndex}`}
                    type="button"
                    onClick={() => answerQuestion(activeQuestion.id, optionIndex)}
                    disabled={!quizStarted || submitted}
                    className={cn(
                      'flex w-full items-start gap-4 rounded-[var(--radius-card)] border px-4 py-5 text-left text-lg leading-8 transition sm:gap-3 sm:py-3 sm:text-sm sm:leading-6',
                      submitted && correct
                        ? 'border-[var(--success)] bg-[var(--surface-2)] text-[var(--fg)]'
                        : submitted && selected
                          ? 'border-[var(--warn)] bg-[var(--surface-2)] text-[var(--fg)]'
                          : selected
                            ? 'border-[var(--fg)] bg-[var(--surface)] text-[var(--fg)]'
                            : quizStarted
                              ? 'border-[var(--line)] bg-[var(--surface)] text-[var(--fg-muted)] hover:border-[var(--line-strong)] hover:text-[var(--fg)]'
                              : 'cursor-not-allowed border-[var(--line)] bg-[var(--surface-2)] text-[var(--fg-subtle)]'
                    )}
                  >
                    <span className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-current text-base font-bold sm:h-6 sm:w-6 sm:border sm:text-xs">
                      {String.fromCharCode(65 + optionIndex)}
                    </span>
                    <span className="quiz-markdown quiz-markdown-option min-w-0 flex-1 [overflow-wrap:anywhere]">
                      <MarkdownPreview content={option} />
                    </span>
                  </button>
                );
              })}
            </div>

            {submitted && (
              <div className="mt-5 rounded-[var(--radius-card)] border border-[var(--line)] bg-[var(--surface-2)] p-4 text-lg leading-8 text-[var(--fg)] sm:text-sm sm:leading-6">
                <span className="eyebrow">
                  Giải thích
                </span>
                <div className="quiz-markdown quiz-markdown-explanation mt-2">
                  <MarkdownPreview
                    content={activeQuestion.explanation || 'AI không trả về giải thích cho câu này.'}
                    enableBookReader
                    bookReaderTitle={`Giải thích câu ${activeQuestionIndex + 1}`}
                  />
                </div>
              </div>
            )}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={() => setActiveQuestionIndex((current) => Math.max(current - 1, 0))}
                disabled={activeQuestionIndex === 0}
                className="btn btn-secondary disabled:opacity-40"
              >
                <ArrowLeft className="h-4 w-4" />
                Câu trước
              </button>
              <div className="grid grid-cols-2 gap-2 sm:flex">
                {!submitted && (
                  <button
                    type="button"
                    onClick={() => submitQuiz('user')}
                    disabled={!quizStarted}
                    className="btn btn-primary disabled:opacity-50"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Nộp bài
                  </button>
                )}
                <button
                  type="button"
                  onClick={() =>
                    setActiveQuestionIndex((current) => Math.min(current + 1, questions.length - 1))
                  }
                  disabled={activeQuestionIndex >= questions.length - 1}
                  className="btn btn-primary disabled:opacity-40"
                >
                  Câu sau
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            <StudyCommentThread
              taskId={taskId}
              deckId={activeQuiz.id}
              contextType="quiz"
              contextId={activeQuestion.id}
              attemptId={activeAttempt?.id ?? null}
              contextContent={[
                `Câu hỏi: ${activeQuestion.question}`,
                'Phương án:',
                ...activeQuestion.options.map((option, index) => `${String.fromCharCode(65 + index)}. ${option}`),
                `Đáp án đúng: ${String.fromCharCode(65 + activeQuestion.correctOptionIndex)}`,
                activeQuestion.explanation ? `Giải thích: ${activeQuestion.explanation}` : '',
                `Tag: ${activeQuestion.tag}`,
              ].filter(Boolean).join('\n')}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function formatDuration(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function formatDate(value: string | null) {
  if (!value) {
    return 'Chưa có';
  }

  try {
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(value));
  } catch {
    return value;
  }
}
