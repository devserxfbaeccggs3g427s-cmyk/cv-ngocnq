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
        <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
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
          className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-800 outline-none transition focus:border-blue-400 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-100"
        >
          {providerOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <label className="block min-w-0">
        <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
          Model
        </span>
        {currentModelOptions.length > 0 ? (
          <div className="mt-1">
            <button
              type="button"
              onClick={() => setIsModelPickerOpen(!isModelPickerOpen)}
              className="flex min-h-10 w-full min-w-0 items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white px-3 py-2 text-left text-sm transition hover:border-blue-300 focus:border-blue-400 focus:outline-none dark:border-gray-800 dark:bg-gray-950 dark:hover:border-blue-800 dark:focus:border-blue-700"
              aria-expanded={isModelPickerOpen}
            >
              <span className="min-w-0 flex-1">
                <span className="block truncate font-semibold text-gray-900 dark:text-gray-100">
                  {selectedModel?.name || draft.model || 'Chọn model'}
                </span>
                <span className="mt-0.5 block truncate text-xs text-gray-500 dark:text-gray-400">
                  {selectedModel?.name ? selectedModel.id : selectedModel?.owner || `${currentModelOptions.length} model đã tải`}
                </span>
              </span>
              <ChevronDown
                className={cn('h-4 w-4 shrink-0 text-gray-400 transition', isModelPickerOpen && 'rotate-180')}
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
            className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 outline-none transition focus:border-blue-400 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-100"
          />
        )}
      </label>

      {draft.provider === 'custom' && (
        <label className="block min-w-0 md:col-span-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Base URL
          </span>
          <input
            value={draft.baseUrl}
            onChange={(event) => onChange({ baseUrl: event.target.value })}
            placeholder="https://.../v1"
            className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 outline-none transition focus:border-blue-400 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-100"
          />
          <span className="mt-1 block text-xs text-gray-500 dark:text-gray-400">
            {providerOptions.find((option) => option.value === draft.provider)?.hint}
          </span>
        </label>
      )}

      {!usesServerApiKey && (
        <label className="block min-w-0 md:col-span-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            API key
          </span>
          <input
            value={draft.apiKey}
            onChange={(event) => onChange({ apiKey: event.target.value })}
            type="password"
            placeholder="Nhập API key khi hỏi AI"
            autoComplete="off"
            className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 outline-none transition focus:border-blue-400 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-100"
          />
        </label>
      )}

      {usesServerApiKey && (
        <label className="block min-w-0 md:col-span-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Mật khẩu xác nhận
          </span>
          <input
            value={draft.confirmPassword}
            onChange={(event) => onChange({ confirmPassword: event.target.value })}
            type="password"
            placeholder="Nhập mật khẩu để dùng AI cấu hình trong env"
            autoComplete="off"
            className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 outline-none transition focus:border-blue-400 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-100"
          />
        </label>
      )}

      <div className="flex flex-col gap-2 md:col-span-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {usesServerApiKey
            ? 'Kilo AI tự tải model bằng cấu hình env phía server; Base URL và API key không được đưa ra trình duyệt.'
            : 'Tải danh sách model do kênh AI cung cấp. API key chỉ cần khi gửi câu hỏi; Base URL chỉ cần nhập khi chọn Custom.'}
        </p>
        <button
          type="button"
          onClick={loadModels}
          disabled={!canLoadModels || isLoadingModels}
          className="inline-flex h-9 w-fit items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-700 transition hover:border-blue-300 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-200 dark:hover:border-blue-800 dark:hover:text-blue-300"
        >
          <RefreshCw className={cn('h-4 w-4', isLoadingModels && 'animate-spin')} aria-hidden="true" />
          {isLoadingModels ? 'Đang tải model...' : 'Tải danh sách model'}
        </button>
      </div>

      {currentModelError && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200 md:col-span-2">
          {currentModelError}
        </div>
      )}
    </div>
  );
}
