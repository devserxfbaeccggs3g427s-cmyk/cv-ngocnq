'use client';

import { Card, CardContent } from '@/components/ui';
import { cn } from '@/lib/utils';
import type { QuizQuestion, QuizAttempt, QuizDeck } from '@/types';

interface QuizHistoryPanelProps {
  activeQuiz: QuizDeck;
  reviewingAttemptId: string | null;
  reviewAttempt: (attempt: QuizAttempt) => void;
}

export function QuizHistoryPanel({
  activeQuiz,
  reviewingAttemptId,
  reviewAttempt,
}: QuizHistoryPanelProps) {
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
          Lịch sử làm bài
        </p>
        {activeQuiz.attempts.length > 0 ? (
          <div className="mt-3 space-y-2">
            {activeQuiz.attempts.slice().reverse().map((attempt, index) => (
              <button
                key={attempt.id}
                type="button"
                onClick={() => reviewAttempt(attempt)}
                className={cn(
                  'w-full rounded-lg border p-3 text-left text-xs leading-5 transition',
                  reviewingAttemptId === attempt.id
                    ? 'border-blue-300 bg-blue-50 text-blue-900 dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-100'
                    : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-blue-300 hover:text-blue-800 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300 dark:hover:border-blue-800 dark:hover:text-blue-100'
                )}
              >
                <div className="font-semibold text-gray-900 dark:text-white">
                  Lượt {activeQuiz.attempts.length - index}: {attempt.score ?? countCorrectAnswers(activeQuiz.questions, attempt.answers)}/{attempt.total}
                </div>
                <div>Bắt đầu: {formatDate(attempt.startedAt)}</div>
                <div>
                  {attempt.submittedAt ? `Nộp: ${formatDate(attempt.submittedAt)}` : 'Đang làm/chưa nộp'}
                </div>
                <div>
                  {attempt.submittedBy === 'timeout' ? 'Tự nộp do hết giờ' : attempt.submittedBy === 'user' ? 'Người dùng nộp' : 'Chưa nộp'}
                </div>
              </button>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">Chưa có lượt làm nào.</p>
        )}
      </CardContent>
    </Card>
  );
}

function countCorrectAnswers(questions: QuizQuestion[], answers: Record<string, number>) {
  return questions.filter((question) => answers[question.id] === question.correctOptionIndex).length;
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
