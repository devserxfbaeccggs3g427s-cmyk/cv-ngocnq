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
        'rounded-md px-3 py-1.5 text-sm font-semibold transition',
        active
          ? 'bg-gray-950 text-white shadow-sm dark:bg-white dark:text-gray-950'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-950 dark:text-gray-300 dark:hover:bg-gray-900 dark:hover:text-white'
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
  const usesServerApiKey = draft.provider === 'kilo';
  const modelRequestKey = [
    draft.provider,
    draft.provider === 'custom' ? draft.baseUrl.trim() : '',
    usesServerApiKey ? draft.confirmPassword : '',
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
    (!usesServerApiKey || Boolean(draft.confirmPassword.trim()));

  const loadModels = useCallback(async () => {
    setModelError(null);
    setIsLoadingModels(true);

    try {
      const response = await fetch('/api/ai/models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: draft.provider,
          apiKey: usesServerApiKey ? undefined : draft.apiKey,
          confirmPassword: usesServerApiKey ? draft.confirmPassword : undefined,
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
    draft.confirmPassword,
    draft.model,
    draft.provider,
    modelRequestKey,
    onChange,
    usesServerApiKey,
  ]);

  useEffect(() => {
    if (
      draft.mode !== 'ai' ||
      !isAiSettingsOpen ||
      draft.provider !== 'kilo' ||
      loadedModelKey === modelRequestKey ||
      autoLoadedModelKeyRef.current === modelRequestKey ||
      isLoadingModels
    ) {
      return;
    }

    autoLoadedModelKeyRef.current = modelRequestKey;
    loadModels();
  }, [draft.mode, draft.provider, isAiSettingsOpen, isLoadingModels, loadModels, loadedModelKey, modelRequestKey]);

  useEffect(() => {
    if (draft.mode !== 'ai') {
      window.queueMicrotask(() => {
        setIsAiSettingsOpen(false);
        setIsModelPickerOpen(false);
      });
    }
  }, [draft.mode]);

  return (
    <form onSubmit={onSubmit} className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-900/70">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="inline-flex w-fit rounded-lg border border-gray-200 bg-white p-1 dark:border-gray-800 dark:bg-gray-950">
          <ModeButton active={draft.mode === 'comment'} onClick={() => onChange({ mode: 'comment' })}>
            Comment thường
          </ModeButton>
          <ModeButton active={draft.mode === 'ai'} onClick={() => onChange({ mode: 'ai' })}>
            Hỏi AI
          </ModeButton>
        </div>

        {draft.mode === 'ai' && (
          <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <KeyRound className="h-4 w-4" aria-hidden="true" />
            {usesServerApiKey
              ? 'Kilo AI dùng API key cấu hình trong env, không hiển thị trên màn hình.'
              : 'API key chỉ dùng cho request này, không lưu vào localStorage.'}
          </div>
        )}
      </div>

      {draft.mode === 'ai' && (
        <div className="mt-3 rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
          <button
            type="button"
            onClick={() => setIsAiSettingsOpen((current) => !current)}
            className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left transition hover:bg-gray-50 dark:hover:bg-gray-900"
            aria-expanded={isAiSettingsOpen}
          >
            <span className="flex min-w-0 items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" aria-hidden="true" />
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Cấu hình AI
                </span>
                <span className="block truncate text-xs text-gray-500 dark:text-gray-400">
                  {providerOptions.find((option) => option.value === draft.provider)?.label}
                  {draft.model ? ` · ${draft.model}` : ' · Chưa chọn model'}
                </span>
              </span>
            </span>
            <ChevronDown
              className={cn('h-4 w-4 shrink-0 text-gray-400 transition', isAiSettingsOpen && 'rotate-180')}
              aria-hidden="true"
            />
          </button>

          {isAiSettingsOpen && (
            <div className="border-t border-gray-200 p-3 dark:border-gray-800">
              <AiProviderSettings
                draft={draft}
                onChange={onChange}
                usesServerApiKey={usesServerApiKey}
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
          className="w-full resize-y rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm leading-6 text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-blue-400 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-100"
        />
      </label>

      <div className="mt-3 flex items-center justify-end gap-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-gray-200 px-3 text-sm font-semibold text-gray-600 transition hover:bg-white hover:text-gray-950 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-gray-950 dark:hover:text-white"
          >
            <X className="h-4 w-4" aria-hidden="true" />
            Hủy
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex h-9 items-center gap-2 rounded-lg bg-gray-950 px-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-gray-950 dark:hover:bg-gray-200"
        >
          <Send className="h-4 w-4" aria-hidden="true" />
          {isSubmitting ? 'Đang gửi...' : submitLabel}
        </button>
      </div>
    </form>
  );
}
