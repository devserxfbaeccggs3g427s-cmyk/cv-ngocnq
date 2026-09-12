'use client';

import { Card, CardContent } from '@/components/ui';
import { cn } from '@/lib/utils';
import type { QuizQuestion } from '@/types';

interface QuizResultPanelProps {
  questions: QuizQuestion[];
  answers: Record<string, number>;
  submitted: boolean;
  answeredCount: number;
  correctCount: number;
  scorePercent: number;
  activeQuestionIndex: number;
  setActiveQuestionIndex: (index: number) => void;
}

export function QuizResultPanel({
  questions,
  answers,
  submitted,
  answeredCount,
  correctCount,
  scorePercent,
  activeQuestionIndex,
  setActiveQuestionIndex,
}: QuizResultPanelProps) {
  return (
    <>
      <Card>
        <CardContent className="p-5">
          <p className="eyebrow">
            Kết quả
          </p>
          <div className="stat-number mt-3 text-3xl text-[var(--fg)]">
            {submitted ? `${correctCount}/${questions.length}` : `${answeredCount}/${questions.length}`}
          </div>
          <p className="mt-1 text-sm text-[var(--fg-muted)]">
            {submitted ? `Điểm tạm tính ${scorePercent}%` : 'Số câu đã chọn đáp án'}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5">
          <p className="eyebrow">
            Danh sách câu
          </p>
          <div className="mt-3 grid grid-cols-5 gap-2">
            {questions.map((question, index) => {
              const answered = answers[question.id] !== undefined;
              const correct = answers[question.id] === question.correctOptionIndex;

              return (
                <button
                  key={question.id}
                  type="button"
                  onClick={() => setActiveQuestionIndex(index)}
                  className={cn(
                    'inline-flex h-9 items-center justify-center rounded-md border text-sm font-semibold transition',
                    activeQuestionIndex === index
                      ? 'border-[var(--fg)] bg-[var(--surface)] text-[var(--fg)]'
                      : submitted && correct
                        ? 'border-[var(--success)] bg-[var(--surface-2)] text-[var(--success)]'
                        : submitted && answered
                          ? 'border-[var(--warn)] bg-[var(--surface-2)] text-[var(--warn)]'
                          : answered
                            ? 'border-[var(--line-strong)] bg-[var(--surface)] text-[var(--fg)]'
                            : 'border-[var(--line)] text-[var(--fg-muted)] hover:border-[var(--line-strong)] hover:text-[var(--fg)]'
                  )}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
