'use client';

import type { FormEvent } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronDown, KeyRound, Send, SlidersHorizontal, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { type AiModelOption, type CommentDraft, providerOptions } from './utils';
import { AiProviderSettings } from './AiProviderSettings';
import { CommentSearchBar } from './CommentSearchBar';

function ModeButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-full px-4 py-2.5 text-lg font-bold transition sm:px-3 sm:py-1.5 sm:text-sm',
        active
          ? 'bg-[var(--fg)] text-[var(--bg)]'
          : 'text-[var(--fg-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--fg)]'
      )}
    >
      {children}
    </button>
  );
}

export function CommentForm({
  draft,
  isSubmitting,
  submitLabel,
  onSubmit,
  onChange,
  onCancel,
}: {
  draft: CommentDraft;
  isSubmitting: boolean;
  submitLabel: string;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onChange: (update: Partial<CommentDraft>) => void;
  onCancel?: () => void;
}) {
  const [modelOptions, setModelOptions] = useState<AiModelOption[]>([]);
  const [modelSearch, setModelSearch] = useState('');
  const [isModelPickerOpen, setIsModelPickerOpen] = useState(false);
  const [isAiSettingsOpen, setIsAiSettingsOpen] = useState(false);
  const [loadedModelKey, setLoadedModelKey] = useState('');
  const autoLoadedModelKeyRef = useRef('');
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [modelError, setModelError] = useState<{ key: string; message: string } | null>(null);
  const modelRequestKey = [
    draft.provider,
    draft.provider === 'custom' ? draft.baseUrl.trim() : '',
  ].join('|');
  const currentModelOptions = loadedModelKey === modelRequestKey ? modelOptions : [];
  const currentModelError = modelError?.key === modelRequestKey ? modelError.message : null;
  const normalizedModelSearch = modelSearch.trim().toLowerCase();
  const filteredModelOptions = normalizedModelSearch
    ? currentModelOptions.filter((model) =>
        [model.id, model.name, model.owner]
          .filter(Boolean)
          .some((value) => value?.toLowerCase().includes(normalizedModelSearch))
      )
    : currentModelOptions;
  const selectedModel = currentModelOptions.find((model) => model.id === draft.model);

  const canLoadModels =
    draft.mode === 'ai' &&
    (draft.provider !== 'custom' || Boolean(draft.baseUrl.trim())) &&
    Boolean(draft.apiKey.trim());

  const loadModels = useCallback(async () => {
    setModelError(null);
    setIsLoadingModels(true);

    try {
      const response = await fetch('/api/ai/models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: draft.provider,
          apiKey: draft.apiKey,
          baseUrl: draft.provider === 'custom' ? draft.baseUrl : undefined,
        }),
      });

      const responseBody = (await response.json().catch(() => ({}))) as {
        models?: AiModelOption[];
        defaultModel?: string;
        error?: string;
      };

      if (!response.ok || !Array.isArray(responseBody.models)) {
        throw new Error(responseBody.error ?? 'Không tải được danh sách model.');
      }

      setModelOptions(responseBody.models);
      setLoadedModelKey(modelRequestKey);
      setModelSearch('');
      setIsModelPickerOpen(true);

      const defaultModel = responseBody.defaultModel?.trim();
      const nextModel = defaultModel || responseBody.models[0]?.id || '';

      if (!draft.model && nextModel) {
        onChange({ model: nextModel });
      }
    } catch (error) {
      setModelOptions([]);
      setLoadedModelKey('');
      setModelError({
        key: modelRequestKey,
        message: error instanceof Error ? error.message : 'Không tải được danh sách model.',
      });
    } finally {
      setIsLoadingModels(false);
    }
  }, [
    draft.apiKey,
    draft.baseUrl,
    draft.model,
    draft.provider,
    modelRequestKey,
    onChange,
  ]);

  useEffect(() => {
    if (
      draft.mode !== 'ai' ||
      !isAiSettingsOpen ||
      !draft.apiKey.trim() ||
      loadedModelKey === modelRequestKey ||
      autoLoadedModelKeyRef.current === modelRequestKey ||
      isLoadingModels
    ) {
      return;
    }

    autoLoadedModelKeyRef.current = modelRequestKey;
    loadModels();
  }, [draft.mode, draft.apiKey, isAiSettingsOpen, isLoadingModels, loadModels, loadedModelKey, modelRequestKey]);

  useEffect(() => {
    if (draft.mode !== 'ai') {
      window.queueMicrotask(() => {
        setIsAiSettingsOpen(false);
        setIsModelPickerOpen(false);
      });
    }
  }, [draft.mode]);

  return (
    <form onSubmit={onSubmit} className="card p-3 sm:rounded-3xl">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="inline-flex w-fit rounded-full border border-[var(--line-strong)] bg-[var(--surface)] p-1">
          <ModeButton active={draft.mode === 'comment'} onClick={() => onChange({ mode: 'comment' })}>
            Comment thường
          </ModeButton>
          <ModeButton active={draft.mode === 'ai'} onClick={() => onChange({ mode: 'ai' })}>
            Hỏi AI
          </ModeButton>
        </div>

        {draft.mode === 'ai' && (
          <div className="flex flex-wrap items-center gap-2 text-base font-medium leading-7 text-[var(--fg-muted)] sm:text-xs sm:leading-normal">
            <KeyRound className="h-4 w-4" aria-hidden="true" />
            Token (API key) chỉ dùng cho request này, không lưu vào localStorage.
          </div>
        )}
      </div>

      {draft.mode === 'ai' && (
        <div className="mt-3 overflow-hidden rounded-[var(--radius-card)] border border-[var(--line)] bg-[var(--surface)]">
          <button
            type="button"
            onClick={() => setIsAiSettingsOpen((current) => !current)}
            className="flex w-full items-center justify-between gap-3 px-3 py-4 text-left transition hover:bg-[var(--surface-2)] sm:py-2"
            aria-expanded={isAiSettingsOpen}
          >
            <span className="flex min-w-0 items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 shrink-0 text-[var(--accent)]" aria-hidden="true" />
              <span className="min-w-0">
                <span className="block text-lg font-bold text-[var(--fg)] sm:text-sm">
                  Cấu hình AI
                </span>
                <span className="block truncate text-base text-[var(--fg-muted)] sm:text-xs">
                  {providerOptions.find((option) => option.value === draft.provider)?.label}
                  {draft.model ? ` · ${draft.model}` : ' · Chưa chọn model'}
                </span>
              </span>
            </span>
            <ChevronDown
              className={cn('h-4 w-4 shrink-0 text-[var(--fg-subtle)] transition', isAiSettingsOpen && 'rotate-180')}
              aria-hidden="true"
            />
          </button>

          {isAiSettingsOpen && (
            <div className="border-t border-[var(--line)] p-3">
              <AiProviderSettings
                draft={draft}
                onChange={onChange}
                currentModelOptions={currentModelOptions}
                selectedModel={selectedModel}
                isModelPickerOpen={isModelPickerOpen}
                setIsModelPickerOpen={setIsModelPickerOpen}
                filteredModelOptions={filteredModelOptions}
                modelSearch={modelSearch}
                setModelSearch={setModelSearch}
                canLoadModels={canLoadModels}
                isLoadingModels={isLoadingModels}
                loadModels={loadModels}
                currentModelError={currentModelError}
              />
            </div>
          )}
        </div>
      )}

      <label className="mt-3 block">
        <span className="sr-only">Nội dung comment</span>
        <textarea
          value={draft.body}
          onChange={(event) => onChange({ body: event.target.value })}
          rows={4}
          placeholder={draft.mode === 'ai' ? 'Nhập câu hỏi cho AI...' : 'Viết comment...'}
          className="input-modern w-full resize-y px-4 py-4 text-lg leading-8 placeholder:text-[var(--fg-subtle)] sm:px-3 sm:py-2 sm:text-sm sm:leading-6"
        />
      </label>

      <div className="mt-3 flex items-center justify-end gap-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-ghost"
          >
            <X className="h-4 w-4" aria-hidden="true" />
            Hủy
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn btn-primary"
        >
          <Send className="h-4 w-4" aria-hidden="true" />
          {isSubmitting ? 'Đang gửi...' : submitLabel}
        </button>
      </div>
    </form>
  );
}
