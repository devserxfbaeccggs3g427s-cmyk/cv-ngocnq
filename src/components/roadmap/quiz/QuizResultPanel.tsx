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
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Kết quả
          </p>
          <div className="mt-3 text-3xl font-bold text-gray-950 dark:text-white">
            {submitted ? `${correctCount}/${questions.length}` : `${answeredCount}/${questions.length}`}
          </div>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
            {submitted ? `Điểm tạm tính ${scorePercent}%` : 'Số câu đã chọn đáp án'}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
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
                    'inline-flex h-9 items-center justify-center rounded-lg border text-sm font-semibold transition',
                    activeQuestionIndex === index
                      ? 'border-cyan-500 bg-cyan-50 text-cyan-800 dark:bg-cyan-950/30 dark:text-cyan-100'
                      : submitted && correct
                        ? 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200'
                        : submitted && answered
                          ? 'border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950/30 dark:text-rose-200'
                          : answered
                            ? 'border-gray-300 bg-gray-100 text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100'
                            : 'border-gray-200 text-gray-500 hover:border-cyan-300 hover:text-cyan-700 dark:border-gray-800 dark:text-gray-400 dark:hover:border-cyan-800 dark:hover:text-cyan-200'
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
