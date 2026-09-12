'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Brain,
  CircleHelp,
  Copy,
  Eye,
  EyeOff,
  Loader2,
  Save,
  StickyNote,
  WandSparkles,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui';
import { Metric } from '@/components/roadmap/client/Metric';
import { formatDate, normalizeSeedProgress, readSeedComments } from '@/lib/roadmap';
import { cn } from '@/lib/utils';

export { Metric, formatDate, normalizeSeedProgress, readSeedComments };

export function DetailItem({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <dt className="eyebrow">{label}</dt>
      <dd className={cn('mt-1 text-[var(--fg)] [overflow-wrap:anywhere]', mono && 'font-mono text-xs')}>{value}</dd>
    </div>
  );
}

export function PathLine({
  label,
  value,
  href,
  active = false,
  onClick,
}: {
  label: string;
  value: string;
  href?: string;
  active?: boolean;
  onClick?: () => void;
}) {
  const content = (
    <div className={cn(
      'rounded-[var(--radius-card)] border px-3 py-2 text-sm transition',
      active
        ? 'border-[var(--fg)] bg-[var(--surface-2)] text-[var(--fg)]'
        : 'border-[var(--line)] bg-[var(--surface)] text-[var(--fg-muted)] hover:border-[var(--line-strong)] hover:text-[var(--fg)]'
    )}>
      <div className="eyebrow">{label}</div>
      <div className="mt-1 leading-5 [overflow-wrap:anywhere]">{value}</div>
    </div>
  );
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className="block w-full text-left">
        {content}
      </button>
    );
  }

  return href ? <Link href={href}>{content}</Link> : content;
}

export function QuizCard({ taskId, commentCount }: { taskId: string; commentCount: number }) {
  return (
    <Card>
      <CardContent className="p-5 md:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="eyebrow text-[var(--accent)]">AI Trắc nghiệm</p>
            <h2 className="mt-1 flex items-center gap-2 font-serif text-xl font-normal text-[var(--fg)]">
              <CircleHelp className="h-5 w-5 text-[var(--accent)]" /> Kiểm tra hiểu biết trên màn riêng
            </h2>
            <p className="mt-2 text-sm leading-6 text-[var(--fg-muted)]">Bài trắc nghiệm dùng toàn bộ note và {commentCount} comment của task này làm nguồn câu hỏi.</p>
          </div>
          <Link href={`/skill-roadmap/tasks/${encodeURIComponent(taskId)}/quiz`} className="btn btn-primary shrink-0">
            <CircleHelp className="h-4 w-4" /> Mở trắc nghiệm
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export function FlashcardCard({ taskId, commentCount }: { taskId: string; commentCount: number }) {
  return (
    <Card>
      <CardContent className="p-5 md:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="eyebrow text-[var(--accent)]">AI Flashcards</p>
            <h2 className="mt-1 flex items-center gap-2 font-serif text-xl font-normal text-[var(--fg)]">
              <Brain className="h-5 w-5 text-[var(--accent)]" /> Ôn tập trên màn riêng
            </h2>
            <p className="mt-2 text-sm leading-6 text-[var(--fg-muted)]">Flashcard dùng toàn bộ note và {commentCount} comment của task này, hỗ trợ tạo nhiều bộ thẻ theo các góc học khác nhau.</p>
          </div>
          <Link href={`/skill-roadmap/tasks/${encodeURIComponent(taskId)}/flashcards`} className="btn btn-primary shrink-0">
            <Brain className="h-4 w-4" /> Mở flashcard
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export function LearningPromptCard({
  learningPrompt,
  promptVisible,
  setPromptVisible,
  promptCopied,
  promptCopyError,
  onCopy,
}: {
  learningPrompt: string;
  promptVisible: boolean;
  setPromptVisible: React.Dispatch<React.SetStateAction<boolean>>;
  promptCopied: boolean;
  promptCopyError: string | null;
  onCopy: () => void;
}) {
  return (
    <Card>
      <CardContent className="p-5 md:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h2 className="flex items-center gap-2 font-serif text-xl font-normal text-[var(--fg)]">
              <BookOpen className="h-5 w-5 text-[var(--accent)]" /> Prompt AI hỗ trợ học
            </h2>
            <p className="mt-3 line-clamp-2 text-sm leading-6 text-[var(--fg-muted)]">{learningPrompt}</p>
          </div>
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={() => setPromptVisible((v) => !v)}
              className="btn btn-secondary btn-sm"
              aria-expanded={promptVisible}
            >
              {promptVisible ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              {promptVisible ? 'Ẩn' : 'Xem'}
            </button>
            <button
              type="button"
              onClick={onCopy}
              className="btn btn-secondary btn-sm"
            >
              <Copy className="h-3.5 w-3.5" /> {promptCopied ? 'Đã copy' : 'Copy'}
            </button>
          </div>
        </div>
        {promptVisible && (
          <div className="mt-4 card p-4 text-sm leading-6 text-[var(--fg)] [overflow-wrap:anywhere]">
            {learningPrompt}
          </div>
        )}
        {promptCopyError && (
          <p className="mt-3 card border-[var(--warn)] p-3 text-sm text-[var(--warn)]">
            {promptCopyError}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export function NoteCard({
  note,
  hasNote,
  updatedAt,
  savingNote,
  saveError,
  autoNoteStatus = 'idle',
  autoNoteMessage,
  onRetryAutoNote,
  onNoteChange,
  onNoteBlur,
  onRequestAiRewrite,
}: {
  note: string;
  hasNote: boolean;
  updatedAt: string | null;
  savingNote: boolean;
  saveError: string | null;
  autoNoteStatus?: 'idle' | 'generating' | 'saved' | 'skipped' | 'error';
  autoNoteMessage?: string | null;
  onRetryAutoNote?: () => void;
  onNoteChange: (note: string) => void;
  onNoteBlur: () => void;
  onRequestAiRewrite?: (payload: { editInstruction: string; token: string }) => Promise<void>;
}) {
  const [aiRewriteOpen, setAiRewriteOpen] = useState(false);
  const [editInstruction, setEditInstruction] = useState('');
  const [token, setToken] = useState('');
  const [aiRewriteStatus, setAiRewriteStatus] = useState<'idle' | 'rewriting' | 'saved' | 'error'>('idle');
  const [aiRewriteMessage, setAiRewriteMessage] = useState<string | null>(null);
  const canRetryAutoNote =
    !hasNote && Boolean(onRetryAutoNote) && (autoNoteStatus === 'skipped' || autoNoteStatus === 'error');
  const canRequestAiRewrite =
    Boolean(onRequestAiRewrite) &&
    hasNote &&
    editInstruction.trim().length > 0 &&
    token.trim().length > 0 &&
    aiRewriteStatus !== 'rewriting';

  async function handleAiRewrite() {
    if (!onRequestAiRewrite || !canRequestAiRewrite) {
      return;
    }

    setAiRewriteStatus('rewriting');
    setAiRewriteMessage('AI đang chỉnh sửa lại note...');

    try {
      await onRequestAiRewrite({
        editInstruction: editInstruction.trim(),
        token: token.trim(),
      });
      setEditInstruction('');
      setToken('');
      setAiRewriteStatus('saved');
      setAiRewriteMessage('Đã cập nhật note bằng AI.');
    } catch (error) {
      setAiRewriteStatus('error');
      setAiRewriteMessage(error instanceof Error ? error.message : 'Không chỉnh sửa được note bằng AI.');
    }
  }

  return (
    <Card>
      <CardContent className="p-5 md:p-6">
        <h2 className="flex items-center gap-2 font-serif text-xl font-normal text-[var(--fg)]">
          <StickyNote className="h-5 w-5 text-[var(--accent)]" /> Note
        </h2>
        <textarea
          value={note}
          onChange={(event) => onNoteChange(event.target.value)}
          onBlur={onNoteBlur}
          rows={8}
          placeholder="Ghi lại nội dung đã học, link tài liệu, lỗi gặp phải, checklist cần ôn lại..."
          className={cn(
            'mt-4 min-h-48 w-full resize-y rounded-[var(--radius-card)] border bg-[var(--surface)] p-3 text-sm text-[var(--fg)] outline-none transition focus:ring-2',
            hasNote
              ? 'border-[var(--success)] focus:border-[var(--success)] focus:ring-[var(--success)]/20'
              : 'border-[var(--line-strong)] focus:border-[var(--fg)] focus:ring-[var(--fg)]/20 focus:ring-offset-2 focus:ring-offset-[var(--surface)]'
          )}
        />
        <div className="mt-2 flex flex-col gap-2 text-xs text-[var(--fg-muted)] sm:flex-row sm:items-center sm:justify-between">
          <span>Cập nhật: {formatDate(updatedAt)}</span>
          <span className="inline-flex items-center gap-1">
            {savingNote ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Đang lưu
              </>
            ) : (
              <>
                <Save className="h-3.5 w-3.5" /> Tự lưu khi rời ô note
              </>
            )}
          </span>
        </div>
        {saveError && (
          <p className="mt-2 card border-[var(--warn)] p-3 text-sm text-[var(--warn)]">
            {saveError}
          </p>
        )}
        {onRequestAiRewrite && (
          <div className="mt-4 card">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-sm font-bold text-[var(--fg)]">Yêu cầu AI chỉnh sửa note</p>
                <p className="mt-1 text-xs leading-5 text-[var(--fg-muted)]">AI sẽ viết lại toàn bộ note hiện tại theo yêu cầu của bạn.</p>
              </div>
              <button
                type="button"
                onClick={() => setAiRewriteOpen((current) => !current)}
                className="btn btn-secondary shrink-0"
                aria-expanded={aiRewriteOpen}
              >
                <WandSparkles className="h-3.5 w-3.5" />
                {aiRewriteOpen ? 'Ẩn' : 'Mở yêu cầu'}
              </button>
            </div>
            {aiRewriteOpen && (
              <div className="mt-3 space-y-3 border-t border-[var(--line)] pt-3">
                <textarea
                  value={editInstruction}
                  onChange={(event) => setEditInstruction(event.target.value)}
                  rows={3}
                  placeholder="Ví dụ: rút gọn còn 5 ý chính, bổ sung ví dụ Java/Spring, làm rõ trade-off và thêm câu hỏi phỏng vấn..."
                  className="input-modern w-full resize-y p-3 text-sm"
                />
                <div className="flex flex-col gap-2 sm:flex-row">
                  <input
                    type="password"
                    value={token}
                    onChange={(event) => setToken(event.target.value)}
                    placeholder="Nhập token (API key) để dùng AI"
                    className="input-modern min-h-10 flex-1"
                  />
                  <button
                    type="button"
                    onClick={handleAiRewrite}
                    disabled={!canRequestAiRewrite}
                    className="btn btn-primary"
                  >
                    {aiRewriteStatus === 'rewriting' ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <WandSparkles className="h-4 w-4" />
                    )}
                    Chỉnh bằng AI
                  </button>
                </div>
                {!hasNote && (
                  <p className="text-xs text-[var(--warn)]">Cần có note hiện tại trước khi yêu cầu AI chỉnh sửa.</p>
                )}
              </div>
            )}
            {aiRewriteMessage && (
              <p
                className={cn(
                  'mt-3 rounded-md border px-3 py-2 text-sm',
                  aiRewriteStatus === 'saved'
                    ? 'border-[var(--success)] bg-[var(--surface-2)] text-[var(--success)]'
                    : aiRewriteStatus === 'error'
                      ? 'border-[var(--warn)] bg-[var(--surface-2)] text-[var(--warn)]'
                      : 'border-[var(--line)] bg-[var(--surface-2)] text-[var(--fg-muted)]'
                )}
              >
                {aiRewriteStatus === 'rewriting' && (
                  <Loader2 className="mr-1.5 inline h-3.5 w-3.5 animate-spin align-[-2px]" />
                )}
                {aiRewriteMessage}
              </p>
            )}
          </div>
        )}
        {autoNoteStatus !== 'idle' && autoNoteMessage && (
          <div
            className={cn(
              'mt-2 flex flex-col gap-3 rounded-md border px-3 py-2 text-sm sm:flex-row sm:items-center sm:justify-between',
              autoNoteStatus === 'saved'
                ? 'border-[var(--success)] bg-[var(--surface-2)] text-[var(--success)]'
                : autoNoteStatus === 'error'
                  ? 'border-[var(--warn)] bg-[var(--surface-2)] text-[var(--warn)]'
                  : 'border-[var(--line)] bg-[var(--surface-2)] text-[var(--fg-muted)]'
            )}
          >
            <span>
              {autoNoteStatus === 'generating' && (
                <Loader2 className="mr-1.5 inline h-3.5 w-3.5 animate-spin align-[-2px]" />
              )}
              {autoNoteMessage}
            </span>
            {canRetryAutoNote && onRetryAutoNote && (
              <button
                type="button"
                onClick={onRetryAutoNote}
                className="btn btn-secondary btn-sm shrink-0"
              >
                <WandSparkles className="h-3.5 w-3.5" />
                Thử lại auto note
              </button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
