'use client';

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
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui';
import { Metric } from '@/components/roadmap/client/Metric';
import { formatDate, normalizeSeedProgress, readSeedComments } from '@/lib/roadmap';
import { cn } from '@/lib/utils';

export { Metric, formatDate, normalizeSeedProgress, readSeedComments };

export function DetailItem({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">{label}</dt>
      <dd className={cn('mt-1 text-gray-900 [overflow-wrap:anywhere] dark:text-gray-100', mono && 'font-mono text-xs')}>{value}</dd>
    </div>
  );
}

export function PathLine({ label, value, href, active = false }: { label: string; value: string; href?: string; active?: boolean }) {
  const content = (
    <div className={cn('rounded-lg border px-3 py-2', active ? 'border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-900/60 dark:bg-blue-950/30 dark:text-blue-100' : 'border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-200')}>
      <div className="text-xs font-semibold uppercase tracking-wide text-gray-400">{label}</div>
      <div className="mt-1 leading-5 [overflow-wrap:anywhere]">{value}</div>
    </div>
  );
  return href ? <Link href={href}>{content}</Link> : content;
}

export function QuizCard({ taskId, commentCount }: { taskId: string; commentCount: number }) {
  return (
    <Card>
      <CardContent className="p-5 md:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-cyan-600 dark:text-cyan-300">AI Trắc nghiệm</p>
            <h2 className="mt-1 flex items-center gap-2 text-lg font-bold text-gray-950 dark:text-white">
              <CircleHelp className="h-5 w-5 text-cyan-600 dark:text-cyan-300" /> Kiểm tra hiểu biết trên màn riêng
            </h2>
            <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">Bài trắc nghiệm dùng toàn bộ note và {commentCount} comment của task này làm nguồn câu hỏi.</p>
          </div>
          <Link href={`/skill-roadmap/tasks/${encodeURIComponent(taskId)}/quiz`} className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-cyan-600 px-4 text-sm font-semibold text-white transition hover:bg-cyan-700">
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
            <p className="text-xs font-semibold uppercase tracking-wide text-violet-600 dark:text-violet-300">AI Flashcards</p>
            <h2 className="mt-1 flex items-center gap-2 text-lg font-bold text-gray-950 dark:text-white">
              <Brain className="h-5 w-5 text-violet-600 dark:text-violet-300" /> Ôn tập trên màn riêng
            </h2>
            <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">Flashcard dùng toàn bộ note và {commentCount} comment của task này, hỗ trợ tạo nhiều bộ thẻ theo các góc học khác nhau.</p>
          </div>
          <Link href={`/skill-roadmap/tasks/${encodeURIComponent(taskId)}/flashcards`} className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 text-sm font-semibold text-white transition hover:bg-violet-700">
            <Brain className="h-4 w-4" /> Mở flashcard
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export function LearningPromptCard({ learningPrompt, promptVisible, setPromptVisible, promptCopied, promptCopyError, onCopy }: { learningPrompt: string; promptVisible: boolean; setPromptVisible: (fn: (v: boolean) => boolean) => void; promptCopied: boolean; promptCopyError: string | null; onCopy: () => void }) {
  return (
    <Card>
      <CardContent className="p-5 md:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h2 className="flex items-center gap-2 text-lg font-bold text-gray-950 dark:text-white">
              <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" /> Prompt AI hỗ trợ học
            </h2>
            <p className="mt-3 line-clamp-2 text-sm leading-6 text-gray-600 dark:text-gray-300">{learningPrompt}</p>
          </div>
          <div className="flex shrink-0 gap-2">
            <button type="button" onClick={() => setPromptVisible((v) => !v)} className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 px-2.5 py-1.5 text-xs font-semibold text-gray-700 transition hover:border-blue-300 hover:text-blue-700 dark:border-gray-700 dark:text-gray-300 dark:hover:border-blue-700 dark:hover:text-blue-300" aria-expanded={promptVisible}>
              {promptVisible ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              {promptVisible ? 'Ẩn' : 'Xem'}
            </button>
            <button type="button" onClick={onCopy} className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 px-2.5 py-1.5 text-xs font-semibold text-gray-700 transition hover:border-emerald-300 hover:text-emerald-700 dark:border-gray-700 dark:text-gray-300 dark:hover:border-emerald-700 dark:hover:text-emerald-300">
              <Copy className="h-3.5 w-3.5" /> {promptCopied ? 'Đã copy' : 'Copy'}
            </button>
          </div>
        </div>
        {promptVisible && (
          <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm leading-6 text-gray-700 [overflow-wrap:anywhere] dark:border-gray-800 dark:bg-gray-950 dark:text-gray-200">{learningPrompt}</div>
        )}
        {promptCopyError && (
          <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">{promptCopyError}</p>
        )}
      </CardContent>
    </Card>
  );
}

export function NoteCard({ note, hasNote, updatedAt, savingNote, saveError, onNoteChange, onNoteBlur }: { note: string; hasNote: boolean; updatedAt: string | null; savingNote: boolean; saveError: string | null; onNoteChange: (note: string) => void; onNoteBlur: () => void }) {
  return (
    <Card>
      <CardContent className="p-5 md:p-6">
        <h2 className="flex items-center gap-2 text-lg font-bold text-gray-950 dark:text-white">
          <StickyNote className="h-5 w-5 text-blue-600 dark:text-blue-400" /> Note
        </h2>
        <textarea
          value={note}
          onChange={(event) => onNoteChange(event.target.value)}
          onBlur={onNoteBlur}
          rows={8}
          placeholder="Ghi lại nội dung đã học, link tài liệu, lỗi gặp phải, checklist cần ôn lại..."
          className={cn(
            'mt-4 min-h-48 w-full resize-y rounded-lg border bg-white p-3 text-sm text-gray-900 outline-none transition focus:ring-2 dark:bg-gray-900 dark:text-white',
            hasNote ? 'border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500/20 dark:border-emerald-800' : 'border-red-300 focus:border-red-500 focus:ring-red-500/20 dark:border-red-800'
          )}
        />
        <div className="mt-2 flex flex-col gap-2 text-xs text-gray-500 dark:text-gray-400 sm:flex-row sm:items-center sm:justify-between">
          <span>Cập nhật: {formatDate(updatedAt)}</span>
          <span className="inline-flex items-center gap-1">
            {savingNote ? (<><Loader2 className="h-3.5 w-3.5 animate-spin" /> Đang lưu</>) : (<><Save className="h-3.5 w-3.5" /> Tự lưu khi rời ô note</>)}
          </span>
        </div>
        {saveError && (
          <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">{saveError}</p>
        )}
      </CardContent>
    </Card>
  );
}
