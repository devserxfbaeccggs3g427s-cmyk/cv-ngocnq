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
          className="link-editorial inline-flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại chi tiết task
        </Link>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="eyebrow">{task.id}</span>
          <span className="badge badge-accent">
            Trắc nghiệm AI
          </span>
          {quizDecks.length > 0 && (
            <span className="badge badge-ghost">
              {quizDecks.length} bài
            </span>
          )}
        </div>
        <h1 className="mt-2 font-serif text-2xl font-normal leading-tight text-[var(--fg)] [overflow-wrap:anywhere] sm:text-3xl">
          {task.title}
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--fg-muted)]">
          Bài trắc nghiệm được tạo từ toàn bộ note hiện tại và {noteComments.length} comment của task.
        </p>
      </div>
      <Link
        href={`/skill-roadmap/notes/${encodeURIComponent(task.id)}`}
        className="btn btn-secondary w-fit"
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
  aiToken: string;
  setAiToken: (value: string) => void;
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
  aiToken,
  setAiToken,
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
            <span className="eyebrow text-[var(--accent)]">
              Tạo bài kiểm tra
            </span>
            <h2 className="mt-1 flex items-center gap-2 font-serif text-xl font-normal text-[var(--fg)]">
              <CircleHelp className="h-5 w-5 text-[var(--accent)]" />
              Nhiều bài trắc nghiệm từ note và comment
            </h2>
            <p className="mt-2 text-sm leading-6 text-[var(--fg-muted)]">
              Bạn có thể tạo nhiều bài khác nhau cho cùng task. Khi tạo bài mới, hệ thống gửi các câu đã có để AI đổi góc hỏi và chặn bài mới nếu trùng quá 50%.
            </p>
          </div>
          <div className="w-full shrink-0 space-y-2 md:w-72">
            <label className="flex items-center justify-between gap-3 rounded-[var(--radius-card)] border border-[var(--line)] bg-[var(--surface)] px-3 py-2">
              <span className="min-w-0">
                <span className="block text-xs font-semibold uppercase tracking-wide text-[var(--fg-muted)]">
                  Chặn câu trùng
                </span>
                <span className="block text-xs text-[var(--fg-muted)]">
                  Gửi câu đã có cho AI
                </span>
              </span>
              <input
                type="checkbox"
                checked={duplicateDetectionEnabled}
                onChange={(event) => setDuplicateDetectionEnabled(event.target.checked)}
                className="h-4 w-4 rounded border-[var(--line-strong)] accent-[var(--fg)]"
              />
            </label>
            <label className="block">
              <span className="eyebrow">
                Token (API key)
              </span>
              <input
                value={aiToken}
                onChange={(event) => setAiToken(event.target.value)}
                type="password"
                placeholder="Nhập token để dùng AI"
                autoComplete="off"
                className="input-modern mt-1 w-full text-sm"
              />
            </label>
            <button
              type="button"
              onClick={createQuiz}
              disabled={!canCreateQuiz || generatingQuiz}
              className={cn('btn w-full', canCreateQuiz ? 'btn-primary' : 'btn-secondary')}
            >
              {generatingQuiz ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {generatingQuiz ? 'Đang tạo' : quizDecks.length > 0 ? 'Tạo bài mới' : 'Tạo trắc nghiệm'}
            </button>
          </div>
        </div>

        {requirement && (
          <div className="card mt-4 border-[var(--warn)] px-4 py-3 text-sm font-medium text-[var(--warn)]">
            {requirement}
          </div>
        )}

        {quizError && (
          <div className="card mt-4 border-[var(--accent)] px-4 py-3 text-sm font-medium text-[var(--accent)]">
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
                  'card p-4 text-left transition',
                  activeQuiz?.id === quiz.id
                    ? 'border-[var(--fg)] bg-[var(--surface)]'
                    : 'hover:border-[var(--line-strong)]'
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-serif text-base font-semibold text-[var(--fg)]">
                    {quiz.title || `Bài trắc nghiệm ${index + 1}`}
                  </span>
                  <span className="badge badge-ghost">
                    {quiz.questions.length} câu
                  </span>
                </div>
                <div className="mt-2 text-xs font-medium text-[var(--fg-muted)]">
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
