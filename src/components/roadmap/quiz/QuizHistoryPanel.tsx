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
        <p className="eyebrow">
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
                  'w-full rounded-[var(--radius-card)] border p-3 text-left text-xs leading-5 transition',
                  reviewingAttemptId === attempt.id
                    ? 'border-[var(--fg)] bg-[var(--surface)] text-[var(--fg)]'
                    : 'border-[var(--line)] bg-[var(--surface-2)] text-[var(--fg-muted)] hover:border-[var(--line-strong)] hover:text-[var(--fg)]'
                )}
              >
                <div className="font-semibold text-[var(--fg)]">
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
          <p className="mt-3 text-sm text-[var(--fg-muted)]">Chưa có lượt làm nào.</p>
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
