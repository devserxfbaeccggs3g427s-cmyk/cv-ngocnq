'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CircleHelp,
  Clock3,
  FileText,
  Loader2,
  RotateCcw,
  Sparkles,
  XCircle,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui';
import { cn } from '@/lib/utils';

type RoadmapTask = {
  id: string;
  title: string;
  level: string;
  estimateHours: number;
  deliverable: string;
  children?: RoadmapTask[];
};

type TaskContext = RoadmapTask & {
  trackTitle: string;
  moduleTitle: string;
  depth: number;
  parentTasks: Array<Pick<RoadmapTask, 'id' | 'title'>>;
};

type ProgressItem = {
  completed: boolean;
  note: string;
  completedAt: string | null;
  updatedAt: string;
};

type ProgressFile = {
  updatedAt: string | null;
  items: Record<string, ProgressItem>;
};

type NoteComment = {
  id: string;
  parentId: string | null;
  author: 'user' | 'ai';
  body: string;
  createdAt: string;
  model?: string;
  provider?: string;
};

type QuizQuestion = {
  id: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
  tag: string;
};

type QuizAttempt = {
  id: string;
  startedAt: string;
  submittedAt: string | null;
  durationSeconds: number;
  answers: Record<string, number>;
  score: number | null;
  total: number;
  submittedBy: 'user' | 'timeout' | null;
};

type QuizDeck = {
  id: string;
  taskId: string;
  taskTitle: string;
  title: string;
  durationMinutes: number;
  createdAt: string;
  source: {
    noteCharacters: number;
    commentCount: number;
  };
  questions: QuizQuestion[];
  attempts: QuizAttempt[];
};

const progressStorageKey = 'skill-roadmap-progress:v1';
const commentsStorageKey = 'skill-roadmap-note-comments:v1';
const quizzesStorageKey = 'skill-roadmap-quizzes:v1';

export function SkillRoadmapTaskQuiz({ task }: { task: TaskContext }) {
  const [progress, setProgress] = useState<ProgressFile | null>(null);
  const [noteComments, setNoteComments] = useState<NoteComment[]>([]);
  const [quizDecks, setQuizDecks] = useState<QuizDeck[]>([]);
  const [activeQuizId, setActiveQuizId] = useState<string | null>(null);
  const [generatingQuiz, setGeneratingQuiz] = useState(false);
  const [quizError, setQuizError] = useState<string | null>(null);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [activeAttemptId, setActiveAttemptId] = useState<string | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [reviewingAttemptId, setReviewingAttemptId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let hasLocalProgress = false;
    let hasLocalComments = false;
    let hasLocalQuizzes = false;

    try {
      const raw = window.localStorage.getItem(progressStorageKey);
      hasLocalProgress = raw !== null;
      const storedProgress = raw ? (JSON.parse(raw) as ProgressFile) : null;
      window.queueMicrotask(() => setProgress(storedProgress));
    } catch {
      window.queueMicrotask(() => setProgress(null));
    }

    try {
      const raw = window.localStorage.getItem(commentsStorageKey);
      hasLocalComments = raw !== null;
      const parsed = raw ? (JSON.parse(raw) as Record<string, NoteComment[]>) : {};
      window.queueMicrotask(() => setNoteComments(Array.isArray(parsed[task.id]) ? parsed[task.id] : []));
    } catch {
      window.queueMicrotask(() => setNoteComments([]));
    }

    try {
      const raw = window.localStorage.getItem(quizzesStorageKey);
      hasLocalQuizzes = raw !== null;
      const parsed = raw ? normalizeQuizzesByTask(JSON.parse(raw)) : {};
      const taskQuizzes = parsed[task.id] ?? [];
      window.queueMicrotask(() => {
        setQuizDecks(taskQuizzes);
        setActiveQuizId(taskQuizzes[0]?.id ?? null);
      });
    } catch {
      window.queueMicrotask(() => {
        setQuizDecks([]);
        setActiveQuizId(null);
      });
    }

    async function hydrateMissingSeedData() {
      if (hasLocalProgress && hasLocalComments && hasLocalQuizzes) {
        return;
      }

      try {
        const response = await fetch('/api/skill-roadmap/progress', { cache: 'no-store' });

        if (!response.ok) {
          return;
        }

        const seed = await response.json();

        if (cancelled) {
          return;
        }

        if (!hasLocalProgress) {
          const seedProgress = normalizeSeedProgress(seed);

          if (seedProgress) {
            setProgress(seedProgress);
            storeProgress(seedProgress);
          }
        }

        if (!hasLocalComments) {
          const seedComments = readSeedComments(seed);
          storeComments(seedComments);
          setNoteComments(seedComments[task.id] ?? []);
        }

        if (!hasLocalQuizzes) {
          const seedQuizzes = readSeedQuizzes(seed);
          storeQuizzes(seedQuizzes);
          const taskQuizzes = seedQuizzes[task.id] ?? [];
          setQuizDecks(taskQuizzes);
          setActiveQuizId(taskQuizzes[0]?.id ?? null);
        }
      } catch {
        // Browser-local data is enough for this screen.
      }
    }

    hydrateMissingSeedData();

    return () => {
      cancelled = true;
    };
  }, [task.id]);

  const descendants = useMemo(() => flattenTasks(task.children ?? []), [task.children]);
  const item = progress?.items?.[task.id] ?? null;
  const completedDescendants = descendants.filter((child) => progress?.items?.[child.id]?.completed).length;
  const effectivelyCompleted =
    Boolean(item?.completed) || (descendants.length > 0 && completedDescendants === descendants.length);
  const hasNote = Boolean(item?.note.trim());
  const canCreateQuiz = effectivelyCompleted && hasNote;
  const requirement = getQuizRequirement({
    completed: effectivelyCompleted,
    hasNote,
  });
  const activeQuiz = quizDecks.find((quiz) => quiz.id === activeQuizId) ?? quizDecks[0] ?? null;
  const questions = activeQuiz?.questions ?? [];
  const activeQuestion = questions[activeQuestionIndex] ?? null;
  const activeAttempt = activeQuiz?.attempts.find((attempt) => attempt.id === activeAttemptId) ?? null;
  const isReviewingAttempt = Boolean(reviewingAttemptId);
  const answeredCount = questions.filter((question) => answers[question.id] !== undefined).length;
  const correctCount = questions.filter((question) => answers[question.id] === question.correctOptionIndex).length;
  const scorePercent = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;

  useEffect(() => {
    if (!quizStarted || submitted || remainingSeconds <= 0) {
      return;
    }

    const timer = window.setInterval(() => {
      setRemainingSeconds((current) => Math.max(current - 1, 0));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [quizStarted, submitted, remainingSeconds]);

  async function createQuiz() {
    if (!canCreateQuiz || !item?.note.trim()) {
      setQuizError(requirement);
      return;
    }

    setGeneratingQuiz(true);
    setQuizError(null);

    try {
      const response = await fetch('/api/ai/quizzes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: {
            id: task.id,
            title: task.title,
            level: task.level,
            deliverable: task.deliverable,
          },
          note: item.note,
          comments: noteComments.map((comment) => ({
            author: comment.author,
            body: comment.body,
            createdAt: comment.createdAt,
          })),
          existingQuestions: quizDecks.flatMap((quiz) =>
            quiz.questions.map((question) => question.question)
          ),
        }),
      });

      const responseBody = (await response.json().catch(() => ({}))) as {
        quiz?: QuizDeck;
        error?: string;
      };

      if (!response.ok || !responseBody.quiz) {
        throw new Error(responseBody.error ?? 'Không tạo được trắc nghiệm.');
      }

      const nextQuiz: QuizDeck = {
        ...responseBody.quiz,
        id: responseBody.quiz.id || crypto.randomUUID(),
        title: responseBody.quiz.title || `Bài trắc nghiệm ${quizDecks.length + 1}`,
        durationMinutes: responseBody.quiz.durationMinutes || Math.max(Math.ceil(responseBody.quiz.questions.length * 1.5), 5),
        attempts: responseBody.quiz.attempts ?? [],
      };
      const nextQuizzes = [...quizDecks, nextQuiz];
      storeTaskQuizzes(task.id, nextQuizzes);
      setQuizDecks(nextQuizzes);
      setActiveQuizId(nextQuiz.id);
      restartQuiz();
    } catch (error) {
      setQuizError(error instanceof Error ? error.message : 'Không tạo được trắc nghiệm.');
    } finally {
      setGeneratingQuiz(false);
    }
  }

  function restartQuiz() {
    setActiveQuestionIndex(0);
    setAnswers({});
    setSubmitted(false);
    setQuizStarted(false);
    setActiveAttemptId(null);
    setRemainingSeconds(0);
    setReviewingAttemptId(null);
  }

  function selectQuiz(quizId: string) {
    setActiveQuizId(quizId);
    restartQuiz();
  }

  const persistQuiz = useCallback((nextQuiz: QuizDeck) => {
    const nextQuizzes = quizDecks.map((quiz) => (quiz.id === nextQuiz.id ? nextQuiz : quiz));
    storeTaskQuizzes(task.id, nextQuizzes);
    setQuizDecks(nextQuizzes);
  }, [quizDecks, task.id]);

  const updateAttempt = useCallback((quizId: string, attemptId: string | null, patch: Partial<QuizAttempt>) => {
    if (!attemptId) {
      return;
    }

    const quiz = quizDecks.find((item) => item.id === quizId);

    if (!quiz) {
      return;
    }

    const nextQuiz = {
      ...quiz,
      attempts: quiz.attempts.map((attempt) =>
        attempt.id === attemptId ? { ...attempt, ...patch } : attempt
      ),
    };

    persistQuiz(nextQuiz);
  }, [persistQuiz, quizDecks]);

  const startQuiz = useCallback(() => {
    if (!activeQuiz) {
      return;
    }

    const confirmed = window.confirm(
      `Bắt đầu ${activeQuiz.title}? Thời gian làm bài là ${activeQuiz.durationMinutes} phút. Khi hết giờ hệ thống sẽ tự nộp bài.`
    );

    if (!confirmed) {
      return;
    }

    const attempt: QuizAttempt = {
      id: crypto.randomUUID(),
      startedAt: new Date().toISOString(),
      submittedAt: null,
      durationSeconds: activeQuiz.durationMinutes * 60,
      answers: {},
      score: null,
      total: activeQuiz.questions.length,
      submittedBy: null,
    };

    const nextQuiz = {
      ...activeQuiz,
      attempts: [...activeQuiz.attempts, attempt],
    };

    persistQuiz(nextQuiz);
    setActiveAttemptId(attempt.id);
    setAnswers({});
    setSubmitted(false);
    setQuizStarted(true);
    setRemainingSeconds(attempt.durationSeconds);
    setActiveQuestionIndex(0);
    setReviewingAttemptId(null);
  }, [activeQuiz, persistQuiz]);

  function answerQuestion(questionId: string, optionIndex: number) {
    if (!activeQuiz || !quizStarted || submitted) {
      return;
    }

    const nextAnswers = {
      ...answers,
      [questionId]: optionIndex,
    };

    setAnswers(nextAnswers);
    updateAttempt(activeQuiz.id, activeAttemptId, { answers: nextAnswers });
  }

  const submitQuiz = useCallback((submittedBy: 'user' | 'timeout') => {
    if (!activeQuiz || !activeAttemptId || submitted) {
      return;
    }

    const score = activeQuiz.questions.filter(
      (question) => answers[question.id] === question.correctOptionIndex
    ).length;

    updateAttempt(activeQuiz.id, activeAttemptId, {
      answers,
      submittedAt: new Date().toISOString(),
      score,
      total: activeQuiz.questions.length,
      submittedBy,
    });
    setSubmitted(true);
    setQuizStarted(false);
    setRemainingSeconds(0);
    setReviewingAttemptId(null);
  }, [activeAttemptId, activeQuiz, answers, submitted, updateAttempt]);

  function reviewAttempt(attempt: QuizAttempt) {
    setActiveAttemptId(attempt.id);
    setReviewingAttemptId(attempt.id);
    setAnswers(attempt.answers);
    setSubmitted(true);
    setQuizStarted(false);
    setRemainingSeconds(0);
    setActiveQuestionIndex(0);
  }

  useEffect(() => {
    if (quizStarted && !submitted && remainingSeconds === 0 && activeAttemptId) {
      window.queueMicrotask(() => submitQuiz('timeout'));
    }
  }, [activeAttemptId, quizStarted, remainingSeconds, submitted, submitQuiz]);

  return (
    <div className="space-y-6">
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
            <button
              type="button"
              onClick={createQuiz}
              disabled={!canCreateQuiz || generatingQuiz}
              className={cn(
                'inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition',
                canCreateQuiz
                  ? 'bg-cyan-600 text-white hover:bg-cyan-700 disabled:cursor-wait disabled:bg-cyan-400'
                  : 'cursor-not-allowed bg-gray-200 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
              )}
            >
              {generatingQuiz ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {generatingQuiz ? 'Đang tạo' : quizDecks.length > 0 ? 'Tạo bài mới' : 'Tạo trắc nghiệm'}
            </button>
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

      {!activeQuiz ? (
        <Card>
          <CardContent className="p-5 text-sm leading-6 text-gray-600 dark:text-gray-300">
            Chưa có bài trắc nghiệm nào. Hãy tạo bài đầu tiên từ note và comment của task.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
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

                  <h2 className="mt-4 text-xl font-bold leading-8 text-gray-950 [overflow-wrap:anywhere] dark:text-white">
                    {activeQuestion.question}
                  </h2>

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
                          <span className="[overflow-wrap:anywhere]">{option}</span>
                        </button>
                      );
                    })}
                  </div>

                  {submitted && (
                    <div className="mt-5 rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm leading-6 text-gray-700 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-200">
                      <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                        Giải thích
                      </div>
                      <p className="mt-2">{activeQuestion.explanation || 'AI không trả về giải thích cho câu này.'}</p>
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

          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
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
          </aside>
        </div>
      )}
    </div>
  );
}

function flattenTasks(tasks: RoadmapTask[]): RoadmapTask[] {
  return tasks.flatMap((task) => [task, ...flattenTasks(task.children ?? [])]);
}

function storeProgress(progress: ProgressFile) {
  try {
    window.localStorage.setItem(progressStorageKey, JSON.stringify(progress));
  } catch {
    // The in-memory UI still works.
  }
}

function storeComments(comments: Record<string, NoteComment[]>) {
  try {
    window.localStorage.setItem(commentsStorageKey, JSON.stringify(comments));
  } catch {
    // The current screen can still render in-memory comments.
  }
}

function storeTaskQuizzes(taskId: string, decks: QuizDeck[]) {
  try {
    const raw = window.localStorage.getItem(quizzesStorageKey);
    const parsed = raw ? normalizeQuizzesByTask(JSON.parse(raw)) : {};
    parsed[taskId] = decks;
    window.localStorage.setItem(quizzesStorageKey, JSON.stringify(parsed));
  } catch {
    // The generated quizzes remain usable in memory for this screen.
  }
}

function storeQuizzes(quizzes: Record<string, QuizDeck[]>) {
  try {
    window.localStorage.setItem(quizzesStorageKey, JSON.stringify(quizzes));
  } catch {
    // The current screen can still render in-memory quizzes.
  }
}

function isRecord(input: unknown): input is Record<string, unknown> {
  return Boolean(input) && typeof input === 'object' && !Array.isArray(input);
}

function normalizeSeedProgress(input: unknown): ProgressFile | null {
  if (!isRecord(input)) {
    return null;
  }

  const value = isRecord(input.progress) ? input.progress : input;
  const rawItems = isRecord(value.items) ? value.items : null;

  if (!rawItems) {
    return null;
  }

  const items: Record<string, ProgressItem> = {};

  for (const [taskId, rawItem] of Object.entries(rawItems)) {
    if (!isRecord(rawItem)) {
      return null;
    }

    items[taskId] = {
      completed: Boolean(rawItem.completed),
      note: typeof rawItem.note === 'string' ? rawItem.note : '',
      completedAt: typeof rawItem.completedAt === 'string' ? rawItem.completedAt : null,
      updatedAt: typeof rawItem.updatedAt === 'string' ? rawItem.updatedAt : new Date().toISOString(),
    };
  }

  return {
    updatedAt: typeof value.updatedAt === 'string' ? value.updatedAt : null,
    items,
  };
}

function readSeedComments(input: unknown): Record<string, NoteComment[]> {
  if (!isRecord(input) || !isRecord(input.comments)) {
    return {};
  }

  const comments: Record<string, NoteComment[]> = {};

  for (const [taskId, rawComments] of Object.entries(input.comments)) {
    if (!Array.isArray(rawComments)) {
      continue;
    }

    const taskComments: NoteComment[] = [];

    for (const comment of rawComments) {
        if (!isRecord(comment) || typeof comment.id !== 'string' || typeof comment.body !== 'string') {
          continue;
        }

        taskComments.push({
          id: comment.id,
          parentId: typeof comment.parentId === 'string' ? comment.parentId : null,
          author: comment.author === 'ai' ? 'ai' : 'user',
          body: comment.body,
          createdAt: typeof comment.createdAt === 'string' ? comment.createdAt : new Date().toISOString(),
          model: typeof comment.model === 'string' ? comment.model : undefined,
          provider: typeof comment.provider === 'string' ? comment.provider : undefined,
        });
    }

    comments[taskId] = taskComments;
  }

  return comments;
}

function readSeedQuizzes(input: unknown): Record<string, QuizDeck[]> {
  if (!isRecord(input) || !isRecord(input.quizzes)) {
    return {};
  }

  return normalizeQuizzesByTask(input.quizzes);
}

function normalizeQuizDeck(input: unknown): QuizDeck | null {
  if (!isRecord(input) || !Array.isArray(input.questions) || !isRecord(input.source)) {
    return null;
  }

  const questions = input.questions
    .map((question) => {
      if (
        !isRecord(question) ||
        typeof question.id !== 'string' ||
        typeof question.question !== 'string' ||
        !Array.isArray(question.options) ||
        typeof question.correctOptionIndex !== 'number'
      ) {
        return null;
      }

      const options = question.options.filter((option): option is string => typeof option === 'string');

      if (options.length < 2 || question.correctOptionIndex < 0 || question.correctOptionIndex >= options.length) {
        return null;
      }

      return {
        id: question.id,
        question: question.question,
        options,
        correctOptionIndex: question.correctOptionIndex,
        explanation: typeof question.explanation === 'string' ? question.explanation : '',
        tag: typeof question.tag === 'string' ? question.tag : 'Kiểm tra',
      };
    })
    .filter((question): question is QuizQuestion => Boolean(question));

  if (questions.length === 0) {
    return null;
  }

  return {
    id: typeof input.id === 'string' ? input.id : crypto.randomUUID(),
    taskId: typeof input.taskId === 'string' ? input.taskId : '',
    taskTitle: typeof input.taskTitle === 'string' ? input.taskTitle : '',
    title: typeof input.title === 'string' ? input.title : '',
    durationMinutes: typeof input.durationMinutes === 'number' ? input.durationMinutes : 10,
    createdAt: typeof input.createdAt === 'string' ? input.createdAt : new Date().toISOString(),
    source: {
      noteCharacters: typeof input.source.noteCharacters === 'number' ? input.source.noteCharacters : 0,
      commentCount: typeof input.source.commentCount === 'number' ? input.source.commentCount : 0,
    },
    questions,
    attempts: Array.isArray(input.attempts)
      ? input.attempts.map(normalizeQuizAttempt).filter((attempt): attempt is QuizAttempt => Boolean(attempt))
      : [],
  };
}

function normalizeQuizAttempt(input: unknown): QuizAttempt | null {
  if (!isRecord(input) || !isRecord(input.answers)) {
    return null;
  }

  const answers: Record<string, number> = {};

  for (const [questionId, answer] of Object.entries(input.answers)) {
    if (typeof answer === 'number') {
      answers[questionId] = answer;
    }
  }

  return {
    id: typeof input.id === 'string' ? input.id : crypto.randomUUID(),
    startedAt: typeof input.startedAt === 'string' ? input.startedAt : new Date().toISOString(),
    submittedAt: typeof input.submittedAt === 'string' ? input.submittedAt : null,
    durationSeconds: typeof input.durationSeconds === 'number' ? input.durationSeconds : 600,
    answers,
    score: typeof input.score === 'number' ? input.score : null,
    total: typeof input.total === 'number' ? input.total : 0,
    submittedBy: input.submittedBy === 'user' || input.submittedBy === 'timeout' ? input.submittedBy : null,
  };
}

function normalizeQuizzesByTask(input: unknown): Record<string, QuizDeck[]> {
  if (!isRecord(input)) {
    return {};
  }

  const quizzes: Record<string, QuizDeck[]> = {};

  for (const [taskId, rawValue] of Object.entries(input)) {
    const rawDecks = Array.isArray(rawValue) ? rawValue : [rawValue];
    const decks = rawDecks
      .map((rawDeck, index) => {
        const deck = normalizeQuizDeck(rawDeck);

        if (!deck) {
          return null;
        }

        return {
          ...deck,
          taskId: deck.taskId || taskId,
          title: deck.title || `Bài trắc nghiệm ${index + 1}`,
        };
      })
      .filter((deck): deck is QuizDeck => Boolean(deck));

    if (decks.length > 0) {
      quizzes[taskId] = decks;
    }
  }

  return quizzes;
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

function formatDuration(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function countCorrectAnswers(questions: QuizQuestion[], answers: Record<string, number>) {
  return questions.filter((question) => answers[question.id] === question.correctOptionIndex).length;
}

function getQuizRequirement({
  completed,
  hasNote,
}: {
  completed: boolean;
  hasNote: boolean;
}) {
  if (!completed && !hasNote) {
    return 'Cần hoàn thành task và có note trước khi tạo trắc nghiệm.';
  }

  if (!completed) {
    return 'Cần hoàn thành task trước khi tạo trắc nghiệm.';
  }

  if (!hasNote) {
    return 'Cần ghi note trước khi tạo trắc nghiệm.';
  }

  return null;
}
