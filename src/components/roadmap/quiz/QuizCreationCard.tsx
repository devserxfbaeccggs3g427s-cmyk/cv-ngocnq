'use client';

import Link from 'next/link';
import {
  ArrowLeft,
  CircleHelp,
  FileText,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui';
import { cn } from '@/lib/utils';
import type { TaskContext, NoteComment, QuizDeck } from '@/types';
import { formatDate } from './quiz-helpers';

interface QuizHeaderProps {
  task: TaskContext;
  quizDecks: QuizDeck[];
  noteComments: NoteComment[];
}

export function QuizHeader({ task, quizDecks, noteComments }: QuizHeaderProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
      <div className="min-w-0">
        <Link
          href={`/skill-roadmap/tasks/${encodeURIComponent(task.id)}`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 transition hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại chi tiết task
        </Link>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs font-semibold uppercase text-gray-400">{task.id}</span>
          <span className="rounded-full bg-cyan-100 px-2 py-0.5 text-xs font-semibold text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-200">
            Trắc nghiệm AI
          </span>
          {quizDecks.length > 0 && (
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-300">
              {quizDecks.length} bài
            </span>
          )}
        </div>
        <h1 className="mt-2 text-2xl font-bold leading-tight text-gray-950 [overflow-wrap:anywhere] dark:text-white sm:text-3xl">
          {task.title}
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-600 dark:text-gray-300">
          Bài trắc nghiệm được tạo từ toàn bộ note hiện tại và {noteComments.length} comment của task.
        </p>
      </div>
      <Link
        href={`/skill-roadmap/notes/${encodeURIComponent(task.id)}`}
        className="inline-flex h-10 w-fit items-center justify-center gap-2 rounded-lg border border-gray-200 px-3 text-sm font-semibold text-gray-700 transition hover:border-blue-300 hover:text-blue-700 dark:border-gray-700 dark:text-gray-300 dark:hover:border-blue-700 dark:hover:text-blue-300"
      >
        <FileText className="h-4 w-4" />
        Mở note
      </Link>
    </div>
  );
}

interface QuizCreationCardProps {
  canCreateQuiz: boolean;
  generatingQuiz: boolean;
  aiConfirmPassword: string;
  setAiConfirmPassword: (value: string) => void;
  duplicateDetectionEnabled: boolean;
  setDuplicateDetectionEnabled: (enabled: boolean) => void;
  createQuiz: () => void;
  requirement: string | null;
  quizError: string | null;
  quizDecks: QuizDeck[];
  activeQuiz: QuizDeck | null;
  selectQuiz: (quizId: string) => void;
}

export function QuizCreationCard({
  canCreateQuiz,
  generatingQuiz,
  aiConfirmPassword,
  setAiConfirmPassword,
  duplicateDetectionEnabled,
  setDuplicateDetectionEnabled,
  createQuiz,
  requirement,
  quizError,
  quizDecks,
  activeQuiz,
  selectQuiz,
}: QuizCreationCardProps) {
  return (
    <Card>
      <CardContent className="p-5 md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-cyan-600 dark:text-cyan-300">
              Tạo bài kiểm tra
            </p>
            <h2 className="mt-1 flex items-center gap-2 text-lg font-bold text-gray-950 dark:text-white">
              <CircleHelp className="h-5 w-5 text-cyan-600 dark:text-cyan-300" />
              Nhiều bài trắc nghiệm từ note và comment
            </h2>
            <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">
              Bạn có thể tạo nhiều bài khác nhau cho cùng task. Khi tạo bài mới, hệ thống gửi các câu đã có để AI đổi góc hỏi và chặn bài mới nếu trùng quá 50%.
            </p>
          </div>
          <div className="w-full shrink-0 space-y-2 md:w-72">
            <label className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white px-3 py-2 dark:border-gray-800 dark:bg-gray-950">
              <span className="min-w-0">
                <span className="block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Chặn câu trùng
                </span>
                <span className="block text-xs text-gray-500 dark:text-gray-400">
                  Gửi câu đã có cho AI
                </span>
              </span>
              <input
                type="checkbox"
                checked={duplicateDetectionEnabled}
                onChange={(event) => setDuplicateDetectionEnabled(event.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Mật khẩu xác nhận
              </span>
              <input
                value={aiConfirmPassword}
                onChange={(event) => setAiConfirmPassword(event.target.value)}
                type="password"
                placeholder="Password dùng AI env"
                autoComplete="off"
                className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 outline-none transition focus:border-cyan-400 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-100"
              />
            </label>
            <button
              type="button"
              onClick={createQuiz}
              disabled={!canCreateQuiz || generatingQuiz}
              className={cn(
                'inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition',
                canCreateQuiz
                  ? 'bg-cyan-600 text-white hover:bg-cyan-700 disabled:cursor-wait disabled:bg-cyan-400'
                  : 'cursor-not-allowed bg-gray-200 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
              )}
            >
              {generatingQuiz ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {generatingQuiz ? 'Đang tạo' : quizDecks.length > 0 ? 'Tạo bài mới' : 'Tạo trắc nghiệm'}
            </button>
          </div>
        </div>

        {requirement && (
          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">
            {requirement}
          </div>
        )}

        {quizError && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-200">
            {quizError}
          </div>
        )}

        {quizDecks.length > 0 && (
          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {quizDecks.map((quiz, index) => (
              <button
                key={quiz.id}
                type="button"
                onClick={() => selectQuiz(quiz.id)}
                className={cn(
                  'rounded-lg border p-4 text-left transition',
                  activeQuiz?.id === quiz.id
                    ? 'border-cyan-400 bg-cyan-50 text-cyan-950 dark:border-cyan-700 dark:bg-cyan-950/30 dark:text-cyan-100'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-cyan-300 hover:text-cyan-800 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-200 dark:hover:border-cyan-800 dark:hover:text-cyan-100'
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-semibold">{quiz.title || `Bài trắc nghiệm ${index + 1}`}</span>
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                    {quiz.questions.length} câu
                  </span>
                </div>
                <div className="mt-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                  Tạo lúc {formatDate(quiz.createdAt)} · {quiz.durationMinutes} phút · {quiz.attempts.length} lượt
                </div>
              </button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
