'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui';
import type { TaskContext, ProgressFile, NoteComment, QuizAttempt, QuizDeck } from '@/types';
import {
  progressStorageKey,
  commentsStorageKey,
  quizzesStorageKey,
  flattenTasks,
  storeProgress,
  storeComments,
  storeQuizzes,
  readStoredDuplicateDetectionConfig,
  storeDuplicateDetectionConfig,
} from '@/lib/roadmap';
import { QuizSessionPanel } from './QuizSessionPanel';
import { QuizResultPanel } from './QuizResultPanel';
import { QuizHistoryPanel } from './QuizHistoryPanel';
import { QuizHeader, QuizCreationCard } from './QuizCreationCard';
import {
  storeTaskQuizzes,
  normalizeSeedProgress,
  readSeedComments,
  readSeedQuizzes,
  normalizeQuizzesByTask,
  getQuizRequirement,
} from './quiz-helpers';

export function SkillRoadmapTaskQuiz({ task }: { task: TaskContext }) {
  const [progress, setProgress] = useState<ProgressFile | null>(null);
  const [noteComments, setNoteComments] = useState<NoteComment[]>([]);
  const [quizDecks, setQuizDecks] = useState<QuizDeck[]>([]);
  const [activeQuizId, setActiveQuizId] = useState<string | null>(null);
  const [aiConfirmPassword, setAiConfirmPassword] = useState('');
  const [generatingQuiz, setGeneratingQuiz] = useState(false);
  const [quizError, setQuizError] = useState<string | null>(null);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [activeAttemptId, setActiveAttemptId] = useState<string | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [reviewingAttemptId, setReviewingAttemptId] = useState<string | null>(null);
  const [duplicateDetectionEnabled, setDuplicateDetectionEnabledState] = useState(true);

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

    window.queueMicrotask(() => setDuplicateDetectionEnabledState(readStoredDuplicateDetectionConfig().quizzes));

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
      if (hasLocalProgress && hasLocalComments && hasLocalQuizzes) return;
      try {
        const response = await fetch('/api/skill-roadmap/progress', { cache: 'no-store' });
        if (!response.ok) return;
        const seed = await response.json();
        if (cancelled) return;

        if (!hasLocalProgress) {
          const seedProgress = normalizeSeedProgress(seed);
          if (seedProgress) { setProgress(seedProgress); storeProgress(seedProgress); }
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
      } catch { /* Browser-local data is enough */ }
    }

    hydrateMissingSeedData();
    return () => { cancelled = true; };
  }, [task.id]);

  const descendants = useMemo(() => flattenTasks(task.children ?? []), [task.children]);
  const item = progress?.items?.[task.id] ?? null;
  const completedDescendants = descendants.filter((c) => progress?.items?.[c.id]?.completed).length;
  const effectivelyCompleted =
    Boolean(item?.completed) || (descendants.length > 0 && completedDescendants === descendants.length);
  const hasNote = Boolean(item?.note.trim());
  const canCreateQuiz = effectivelyCompleted && hasNote;
  const requirement = getQuizRequirement({ completed: effectivelyCompleted, hasNote });
  const activeQuiz = quizDecks.find((q) => q.id === activeQuizId) ?? quizDecks[0] ?? null;
  const questions = activeQuiz?.questions ?? [];
  const activeAttempt = activeQuiz?.attempts.find((a) => a.id === activeAttemptId) ?? null;
  const isReviewingAttempt = Boolean(reviewingAttemptId);
  const answeredCount = questions.filter((q) => answers[q.id] !== undefined).length;
  const correctCount = questions.filter((q) => answers[q.id] === q.correctOptionIndex).length;
  const scorePercent = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;

  useEffect(() => {
    if (!quizStarted || submitted || remainingSeconds <= 0) return;
    const timer = window.setInterval(() => setRemainingSeconds((c) => Math.max(c - 1, 0)), 1000);
    return () => window.clearInterval(timer);
  }, [quizStarted, submitted, remainingSeconds]);

  async function createQuiz() {
    if (!canCreateQuiz || !item?.note.trim()) { setQuizError(requirement); return; }
    if (!aiConfirmPassword.trim()) {
      setQuizError('Vui lòng nhập mật khẩu xác nhận trước khi dùng AI cấu hình trong env.');
      return;
    }
    setGeneratingQuiz(true);
    setQuizError(null);
    try {
      const response = await fetch('/api/ai/quizzes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          confirmPassword: aiConfirmPassword,
          task: { id: task.id, title: task.title, level: task.level, deliverable: task.deliverable },
          note: item.note,
          comments: noteComments.map((c) => ({ author: c.author, body: c.body, createdAt: c.createdAt })),
          existingQuestions: duplicateDetectionEnabled ? quizDecks.flatMap((q) => q.questions.map((qq) => qq.question)) : [],
        }),
      });
      const body = (await response.json().catch(() => ({}))) as { quiz?: QuizDeck; error?: string };
      if (!response.ok || !body.quiz) throw new Error(body.error ?? 'Không tạo được trắc nghiệm.');
      const nextQuiz: QuizDeck = {
        ...body.quiz,
        id: body.quiz.id || crypto.randomUUID(),
        title: body.quiz.title || `Bài trắc nghiệm ${quizDecks.length + 1}`,
        durationMinutes: body.quiz.durationMinutes || Math.max(Math.ceil(body.quiz.questions.length * 1.5), 5),
        attempts: body.quiz.attempts ?? [],
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
    setActiveQuestionIndex(0); setAnswers({}); setSubmitted(false);
    setQuizStarted(false); setActiveAttemptId(null); setRemainingSeconds(0); setReviewingAttemptId(null);
  }

  function selectQuiz(quizId: string) { setActiveQuizId(quizId); restartQuiz(); }
  function setDuplicateDetectionEnabled(enabled: boolean) {
    const current = readStoredDuplicateDetectionConfig();
    const next = { ...current, quizzes: enabled };
    setDuplicateDetectionEnabledState(enabled);
    storeDuplicateDetectionConfig(next);
  }

  const persistQuiz = useCallback((nextQuiz: QuizDeck) => {
    const nextQuizzes = quizDecks.map((q) => (q.id === nextQuiz.id ? nextQuiz : q));
    storeTaskQuizzes(task.id, nextQuizzes);
    setQuizDecks(nextQuizzes);
  }, [quizDecks, task.id]);

  const updateAttempt = useCallback((quizId: string, attemptId: string | null, patch: Partial<QuizAttempt>) => {
    if (!attemptId) return;
    const quiz = quizDecks.find((q) => q.id === quizId);
    if (!quiz) return;
    persistQuiz({ ...quiz, attempts: quiz.attempts.map((a) => a.id === attemptId ? { ...a, ...patch } : a) });
  }, [persistQuiz, quizDecks]);

  const startQuiz = useCallback(() => {
    if (!activeQuiz) return;
    const confirmed = window.confirm(
      `Bắt đầu ${activeQuiz.title}? Thời gian làm bài là ${activeQuiz.durationMinutes} phút. Khi hết giờ hệ thống sẽ tự nộp bài.`
    );
    if (!confirmed) return;
    const attempt: QuizAttempt = {
      id: crypto.randomUUID(), startedAt: new Date().toISOString(), submittedAt: null,
      durationSeconds: activeQuiz.durationMinutes * 60, answers: {}, score: null,
      total: activeQuiz.questions.length, submittedBy: null,
    };
    persistQuiz({ ...activeQuiz, attempts: [...activeQuiz.attempts, attempt] });
    setActiveAttemptId(attempt.id); setAnswers({}); setSubmitted(false);
    setQuizStarted(true); setRemainingSeconds(attempt.durationSeconds);
    setActiveQuestionIndex(0); setReviewingAttemptId(null);
  }, [activeQuiz, persistQuiz]);

  function answerQuestion(questionId: string, optionIndex: number) {
    if (!activeQuiz || !quizStarted || submitted) return;
    const nextAnswers = { ...answers, [questionId]: optionIndex };
    setAnswers(nextAnswers);
    updateAttempt(activeQuiz.id, activeAttemptId, { answers: nextAnswers });
  }

  const submitQuiz = useCallback((submittedBy: 'user' | 'timeout') => {
    if (!activeQuiz || !activeAttemptId || submitted) return;
    const score = activeQuiz.questions.filter((q) => answers[q.id] === q.correctOptionIndex).length;
    updateAttempt(activeQuiz.id, activeAttemptId, {
      answers, submittedAt: new Date().toISOString(), score, total: activeQuiz.questions.length, submittedBy,
    });
    setSubmitted(true); setQuizStarted(false); setRemainingSeconds(0); setReviewingAttemptId(null);
  }, [activeAttemptId, activeQuiz, answers, submitted, updateAttempt]);

  function reviewAttempt(attempt: QuizAttempt) {
    setActiveAttemptId(attempt.id); setReviewingAttemptId(attempt.id);
    setAnswers(attempt.answers); setSubmitted(true);
    setQuizStarted(false); setRemainingSeconds(0); setActiveQuestionIndex(0);
  }

  useEffect(() => {
    if (quizStarted && !submitted && remainingSeconds === 0 && activeAttemptId) {
      window.queueMicrotask(() => submitQuiz('timeout'));
    }
  }, [activeAttemptId, quizStarted, remainingSeconds, submitted, submitQuiz]);

  return (
    <div className="space-y-6">
      <QuizHeader task={task} quizDecks={quizDecks} noteComments={noteComments} />
      <QuizCreationCard
        canCreateQuiz={canCreateQuiz} generatingQuiz={generatingQuiz}
        aiConfirmPassword={aiConfirmPassword} setAiConfirmPassword={setAiConfirmPassword}
        duplicateDetectionEnabled={duplicateDetectionEnabled}
        setDuplicateDetectionEnabled={setDuplicateDetectionEnabled}
        createQuiz={createQuiz} requirement={requirement} quizError={quizError}
        quizDecks={quizDecks} activeQuiz={activeQuiz} selectQuiz={selectQuiz}
      />
      {!activeQuiz ? (
        <Card>
          <CardContent className="p-5 text-sm leading-6 text-gray-600 dark:text-gray-300">
            Chưa có bài trắc nghiệm nào. Hãy tạo bài đầu tiên từ note và comment của task.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
          <QuizSessionPanel
            taskId={task.id} activeQuiz={activeQuiz} questions={questions}
            activeQuestionIndex={activeQuestionIndex} setActiveQuestionIndex={setActiveQuestionIndex}
            answers={answers} answerQuestion={answerQuestion}
            submitted={submitted} quizStarted={quizStarted}
            remainingSeconds={remainingSeconds} isReviewingAttempt={isReviewingAttempt}
            activeAttempt={activeAttempt} answeredCount={answeredCount}
            startQuiz={startQuiz} restartQuiz={restartQuiz} submitQuiz={submitQuiz}
          />
          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <QuizResultPanel
              questions={questions} answers={answers} submitted={submitted}
              answeredCount={answeredCount} correctCount={correctCount} scorePercent={scorePercent}
              activeQuestionIndex={activeQuestionIndex} setActiveQuestionIndex={setActiveQuestionIndex}
            />
            <QuizHistoryPanel
              activeQuiz={activeQuiz} reviewingAttemptId={reviewingAttemptId} reviewAttempt={reviewAttempt}
            />
          </aside>
        </div>
      )}
    </div>
  );
}
