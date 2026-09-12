'use client';

import { ChevronDown, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { type AiModelOption, type AiProvider, type CommentDraft, providerOptions } from './utils';
import { CommentSearchBar } from './CommentSearchBar';

export function AiProviderSettings({
  draft,
  onChange,
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
        <span className="eyebrow">
          Kênh AI
        </span>
        <select
          value={draft.provider}
          onChange={(event) => {
            const provider = event.target.value as AiProvider;
            onChange({
              provider,
              model: '',
              apiKey: draft.apiKey,
            });
          }}
          className="input-modern mt-1 w-full text-sm font-medium"
        >
          {providerOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <label className="block min-w-0">
        <span className="eyebrow">
          Model
        </span>
        {currentModelOptions.length > 0 ? (
          <div className="mt-1">
            <button
              type="button"
              onClick={() => setIsModelPickerOpen(!isModelPickerOpen)}
              className="input-modern flex min-h-10 w-full min-w-0 items-center justify-between gap-3 px-3 py-2 text-left text-sm"
              aria-expanded={isModelPickerOpen}
            >
              <span className="min-w-0 flex-1">
                <span className="block truncate font-semibold text-[var(--fg)]">
                  {selectedModel?.name || draft.model || 'Chọn model'}
                </span>
                <span className="mt-0.5 block truncate text-xs text-[var(--fg-muted)]">
                  {selectedModel?.name ? selectedModel.id : selectedModel?.owner || `${currentModelOptions.length} model đã tải`}
                </span>
              </span>
              <ChevronDown
                className={cn('h-4 w-4 shrink-0 text-[var(--fg-subtle)] transition', isModelPickerOpen && 'rotate-180')}
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
            className="input-modern mt-1 w-full text-sm"
          />
        )}
      </label>

      {draft.provider === 'custom' && (
        <label className="block min-w-0 md:col-span-2">
          <span className="eyebrow">
            Base URL
          </span>
          <input
            value={draft.baseUrl}
            onChange={(event) => onChange({ baseUrl: event.target.value })}
            placeholder="https://.../v1"
            className="input-modern mt-1 w-full text-sm"
          />
          <span className="mt-1 block text-xs text-[var(--fg-muted)]">
            {providerOptions.find((option) => option.value === draft.provider)?.hint}
          </span>
        </label>
      )}

      <label className="block min-w-0 md:col-span-2">
        <span className="eyebrow">
          Token (API key)
        </span>
        <input
          value={draft.apiKey}
          onChange={(event) => onChange({ apiKey: event.target.value })}
          type="password"
          placeholder="Nhập token để dùng AI"
          autoComplete="off"
          className="input-modern mt-1 w-full text-sm"
        />
      </label>

      <div className="flex flex-col gap-2 md:col-span-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-[var(--fg-muted)]">
          Tải danh sách model do kênh AI cung cấp. Token (API key) chỉ cần khi gửi câu hỏi; Base URL chỉ cần nhập khi chọn Custom.
        </p>
        <button
          type="button"
          onClick={loadModels}
          disabled={!canLoadModels || isLoadingModels}
          className="btn btn-secondary"
        >
          <RefreshCw className={cn('h-4 w-4', isLoadingModels && 'animate-spin')} aria-hidden="true" />
          {isLoadingModels ? 'Đang tải model...' : 'Tải danh sách model'}
        </button>
      </div>

      {currentModelError && (
        <div className="card border-[var(--warn)] px-3 py-2 text-xs font-medium text-[var(--warn)] md:col-span-2">
          {currentModelError}
        </div>
      )}
    </div>
  );
}
