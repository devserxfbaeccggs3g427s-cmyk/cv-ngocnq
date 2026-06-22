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
import { Card, CardContent } from '@/components/ui';
import { cn } from '@/lib/utils';
import type { QuizQuestion, QuizAttempt, QuizDeck } from '@/types';

interface QuizSessionPanelProps {
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
      <CardContent className="p-5 md:p-6">
        <div className="flex flex-col gap-3 border-b border-gray-100 pb-4 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              {activeQuiz.title} · {isReviewingAttempt ? 'Xem lại' : 'Làm bài'} · Câu {Math.min(activeQuestionIndex + 1, questions.length)}/{questions.length}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <div className="h-2 w-64 max-w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                <div
                  className="h-full rounded-full bg-cyan-600 transition-all"
                  style={{ width: `${questions.length ? (answeredCount / questions.length) * 100 : 0}%` }}
                />
              </div>
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-semibold',
                  quizStarted
                    ? 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-200'
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
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
                className="inline-flex h-9 w-fit items-center justify-center gap-2 rounded-lg bg-cyan-600 px-3 text-sm font-semibold text-white transition hover:bg-cyan-700"
              >
                <Clock3 className="h-4 w-4" />
                Bắt đầu làm bài
              </button>
            )}
            <button
              type="button"
              onClick={restartQuiz}
              className="inline-flex h-9 w-fit items-center justify-center gap-2 rounded-lg border border-gray-200 px-3 text-sm font-semibold text-gray-700 transition hover:border-cyan-300 hover:text-cyan-700 dark:border-gray-700 dark:text-gray-300 dark:hover:border-cyan-700 dark:hover:text-cyan-300"
            >
              <RotateCcw className="h-4 w-4" />
              Đặt lại màn làm
            </button>
          </div>
        </div>

        {!quizStarted && !submitted && (
          <div className="mt-5 rounded-lg border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm leading-6 text-cyan-900 dark:border-cyan-900/60 dark:bg-cyan-950/30 dark:text-cyan-100">
            Bấm &quot;Bắt đầu làm bài&quot; để xác nhận vào lượt làm mới. Đồng hồ sẽ chạy ngay sau khi xác nhận và bài sẽ tự nộp khi hết giờ.
          </div>
        )}

        {submitted && activeAttempt?.submittedBy === 'timeout' && (
          <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">
            Đã hết thời gian, hệ thống đã tự động nộp bài.
          </div>
        )}

        {isReviewingAttempt && activeAttempt && (
          <div className="mt-5 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm leading-6 text-blue-900 dark:border-blue-900/60 dark:bg-blue-950/30 dark:text-blue-100">
            Đang xem lại lượt làm bắt đầu lúc {formatDate(activeAttempt.startedAt)}. Đáp án đã lưu được hiển thị kèm đúng/sai và giải thích.
          </div>
        )}

        {activeQuestion && (
          <div className="mt-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-cyan-100 px-2 py-0.5 text-xs font-semibold text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-200">
                {activeQuestion.tag}
              </span>
              {submitted && answers[activeQuestion.id] !== undefined && (
                <span
                  className={cn(
                    'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold',
                    answers[activeQuestion.id] === activeQuestion.correctOptionIndex
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200'
                      : 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-200'
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

            <div className="quiz-markdown quiz-markdown-question mt-4 text-gray-950 dark:text-white">
              <MarkdownPreview content={activeQuestion.question} />
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
                      'flex w-full items-start gap-3 rounded-lg border px-4 py-3 text-left text-sm leading-6 transition',
                      submitted && correct
                        ? 'border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-100'
                        : submitted && selected
                          ? 'border-rose-300 bg-rose-50 text-rose-900 dark:border-rose-800 dark:bg-rose-950/30 dark:text-rose-100'
                          : selected
                            ? 'border-cyan-400 bg-cyan-50 text-cyan-950 dark:border-cyan-700 dark:bg-cyan-950/30 dark:text-cyan-100'
                            : quizStarted
                              ? 'border-gray-200 bg-white text-gray-700 hover:border-cyan-300 hover:text-cyan-800 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-200 dark:hover:border-cyan-800 dark:hover:text-cyan-100'
                              : 'cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-500'
                    )}
                  >
                    <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-current text-xs font-bold">
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
              <div className="mt-5 rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm leading-6 text-gray-700 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-200">
                <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Giải thích
                </div>
                <div className="quiz-markdown quiz-markdown-explanation mt-2">
                  <MarkdownPreview content={activeQuestion.explanation || 'AI không trả về giải thích cho câu này.'} />
                </div>
              </div>
            )}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={() => setActiveQuestionIndex((current) => Math.max(current - 1, 0))}
                disabled={activeQuestionIndex === 0}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 text-sm font-semibold text-gray-700 transition hover:border-cyan-300 hover:text-cyan-700 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:text-gray-300 dark:hover:border-cyan-700 dark:hover:text-cyan-300"
              >
                <ArrowLeft className="h-4 w-4" />
                Câu trước
              </button>
              <div className="flex gap-2">
                {!submitted && (
                  <button
                    type="button"
                    onClick={() => submitQuiz('user')}
                    disabled={!quizStarted}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-cyan-600 px-4 text-sm font-semibold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:bg-gray-300 dark:disabled:bg-gray-800"
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
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-gray-950 px-4 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white dark:text-gray-950 dark:hover:bg-gray-200"
                >
                  Câu sau
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
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
