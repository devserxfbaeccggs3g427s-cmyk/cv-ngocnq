'use client';

import { ChevronDown, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { type AiModelOption, type AiProvider, type CommentDraft, providerOptions } from './utils';
import { CommentSearchBar } from './CommentSearchBar';

export function AiProviderSettings({
  draft,
  onChange,
  usesServerApiKey,
  currentModelOptions,
  selectedModel,
  isModelPickerOpen,
  setIsModelPickerOpen,
  filteredModelOptions,
  modelSearch,
  setModelSearch,
  canLoadModels,
  isLoadingModels,
  loadModels,
  currentModelError,
}: {
  draft: CommentDraft;
  onChange: (update: Partial<CommentDraft>) => void;
  usesServerApiKey: boolean;
  currentModelOptions: AiModelOption[];
  selectedModel: AiModelOption | undefined;
  isModelPickerOpen: boolean;
  setIsModelPickerOpen: (open: boolean) => void;
  filteredModelOptions: AiModelOption[];
  modelSearch: string;
  setModelSearch: (value: string) => void;
  canLoadModels: boolean;
  isLoadingModels: boolean;
  loadModels: () => void;
  currentModelError: string | null;
}) {
  return (
    <div className="mt-3 grid gap-3 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)]">
      <label className="block min-w-0">
        <span className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Kênh AI
        </span>
        <select
          value={draft.provider}
          onChange={(event) => {
            const provider = event.target.value as AiProvider;
            onChange({
              provider,
              model: '',
              apiKey: provider === 'kilo' ? '' : draft.apiKey,
              confirmPassword: provider === 'kilo' ? draft.confirmPassword : '',
            });
          }}
          className="input-modern mt-1 w-full rounded-2xl px-3 py-2 text-sm font-medium"
        >
          {providerOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <label className="block min-w-0">
        <span className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Model
        </span>
        {currentModelOptions.length > 0 ? (
          <div className="mt-1">
            <button
              type="button"
              onClick={() => setIsModelPickerOpen(!isModelPickerOpen)}
              className="input-modern flex min-h-10 w-full min-w-0 items-center justify-between gap-3 rounded-2xl px-3 py-2 text-left text-sm hover:border-blue-300"
              aria-expanded={isModelPickerOpen}
            >
              <span className="min-w-0 flex-1">
                <span className="block truncate font-semibold text-slate-900 dark:text-slate-100">
                  {selectedModel?.name || draft.model || 'Chọn model'}
                </span>
                <span className="mt-0.5 block truncate text-xs text-slate-500 dark:text-slate-400">
                  {selectedModel?.name ? selectedModel.id : selectedModel?.owner || `${currentModelOptions.length} model đã tải`}
                </span>
              </span>
              <ChevronDown
                className={cn('h-4 w-4 shrink-0 text-slate-400 transition', isModelPickerOpen && 'rotate-180')}
                aria-hidden="true"
              />
            </button>

            {isModelPickerOpen && (
              <CommentSearchBar
                modelSearch={modelSearch}
                setModelSearch={setModelSearch}
                filteredModelOptions={filteredModelOptions}
                currentModelOptions={currentModelOptions}
                selectedModel={selectedModel}
                draft={draft}
                onChange={onChange}
                setIsModelPickerOpen={setIsModelPickerOpen}
              />
            )}
          </div>
        ) : (
          <input
            value={draft.model}
            onChange={(event) => onChange({ model: event.target.value })}
            placeholder="Tải danh sách hoặc nhập model thủ công"
            className="input-modern mt-1 w-full rounded-2xl px-3 py-2 text-sm"
          />
        )}
      </label>

      {draft.provider === 'custom' && (
        <label className="block min-w-0 md:col-span-2">
          <span className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Base URL
          </span>
          <input
            value={draft.baseUrl}
            onChange={(event) => onChange({ baseUrl: event.target.value })}
            placeholder="https://.../v1"
            className="input-modern mt-1 w-full rounded-2xl px-3 py-2 text-sm"
          />
          <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">
            {providerOptions.find((option) => option.value === draft.provider)?.hint}
          </span>
        </label>
      )}

      {!usesServerApiKey && (
        <label className="block min-w-0 md:col-span-2">
          <span className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            API key
          </span>
          <input
            value={draft.apiKey}
            onChange={(event) => onChange({ apiKey: event.target.value })}
            type="password"
            placeholder="Nhập API key khi hỏi AI"
            autoComplete="off"
            className="input-modern mt-1 w-full rounded-2xl px-3 py-2 text-sm"
          />
        </label>
      )}

      {usesServerApiKey && (
        <label className="block min-w-0 md:col-span-2">
          <span className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Mật khẩu xác nhận
          </span>
          <input
            value={draft.confirmPassword}
            onChange={(event) => onChange({ confirmPassword: event.target.value })}
            type="password"
            placeholder="Nhập mật khẩu để dùng AI cấu hình trong env"
            autoComplete="off"
            className="input-modern mt-1 w-full rounded-2xl px-3 py-2 text-sm"
          />
        </label>
      )}

      <div className="flex flex-col gap-2 md:col-span-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {usesServerApiKey
            ? 'Kilo AI tự tải model bằng cấu hình env phía server; Base URL và API key không được đưa ra trình duyệt.'
            : 'Tải danh sách model do kênh AI cung cấp. API key chỉ cần khi gửi câu hỏi; Base URL chỉ cần nhập khi chọn Custom.'}
        </p>
        <button
          type="button"
          onClick={loadModels}
          disabled={!canLoadModels || isLoadingModels}
          className="inline-flex h-9 w-fit items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-3 text-sm font-bold text-slate-700 shadow-sm transition hover:border-blue-300 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-800 dark:bg-slate-950/55 dark:text-slate-200 dark:hover:border-blue-800 dark:hover:text-blue-300"
        >
          <RefreshCw className={cn('h-4 w-4', isLoadingModels && 'animate-spin')} aria-hidden="true" />
          {isLoadingModels ? 'Đang tải model...' : 'Tải danh sách model'}
        </button>
      </div>

      {currentModelError && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200 md:col-span-2">
          {currentModelError}
        </div>
      )}
    </div>
  );
}
