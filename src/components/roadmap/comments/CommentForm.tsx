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
          ? 'bg-slate-950 text-white shadow-sm dark:bg-white dark:text-slate-950'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white'
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
    <form onSubmit={onSubmit} className="rounded-2xl border border-slate-200/80 bg-white/60 p-3 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/55 sm:rounded-3xl">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="inline-flex w-fit rounded-full border border-slate-200 bg-white p-1 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <ModeButton active={draft.mode === 'comment'} onClick={() => onChange({ mode: 'comment' })}>
            Comment thường
          </ModeButton>
          <ModeButton active={draft.mode === 'ai'} onClick={() => onChange({ mode: 'ai' })}>
            Hỏi AI
          </ModeButton>
        </div>

        {draft.mode === 'ai' && (
          <div className="flex flex-wrap items-center gap-2 text-base font-medium leading-7 text-slate-700 dark:text-slate-200 sm:text-xs sm:leading-normal sm:text-slate-500 sm:dark:text-slate-400">
            <KeyRound className="h-4 w-4" aria-hidden="true" />
            {usesServerApiKey
              ? 'Kilo AI dùng API key cấu hình trong env, không hiển thị trên màn hình.'
              : 'API key chỉ dùng cho request này, không lưu vào localStorage.'}
          </div>
        )}
      </div>

      {draft.mode === 'ai' && (
        <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200 bg-white/75 dark:border-slate-800 dark:bg-slate-950/70">
          <button
            type="button"
            onClick={() => setIsAiSettingsOpen((current) => !current)}
            className="flex w-full items-center justify-between gap-3 px-3 py-4 text-left transition hover:bg-slate-50 dark:hover:bg-slate-900 sm:py-2"
            aria-expanded={isAiSettingsOpen}
          >
            <span className="flex min-w-0 items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" aria-hidden="true" />
              <span className="min-w-0">
                <span className="block text-lg font-bold text-slate-900 dark:text-slate-100 sm:text-sm">
                  Cấu hình AI
                </span>
                <span className="block truncate text-base text-slate-700 dark:text-slate-200 sm:text-xs sm:text-slate-500 sm:dark:text-slate-400">
                  {providerOptions.find((option) => option.value === draft.provider)?.label}
                  {draft.model ? ` · ${draft.model}` : ' · Chưa chọn model'}
                </span>
              </span>
            </span>
            <ChevronDown
              className={cn('h-4 w-4 shrink-0 text-slate-400 transition', isAiSettingsOpen && 'rotate-180')}
              aria-hidden="true"
            />
          </button>

          {isAiSettingsOpen && (
            <div className="border-t border-slate-200 p-3 dark:border-slate-800">
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
          className="input-modern w-full resize-y rounded-2xl px-4 py-4 text-lg leading-8 placeholder:text-slate-400 sm:px-3 sm:py-2 sm:text-sm sm:leading-6"
        />
      </label>

      <div className="mt-3 flex items-center justify-end gap-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex min-h-14 items-center gap-2 rounded-full border border-slate-300 bg-white/70 px-5 py-3 text-lg font-bold text-slate-700 transition hover:bg-white hover:text-slate-950 dark:border-slate-700 dark:bg-slate-950/50 dark:text-slate-200 dark:hover:bg-slate-950 dark:hover:text-white sm:h-9 sm:min-h-0 sm:border-slate-200 sm:px-3 sm:py-0 sm:text-sm sm:text-slate-600 sm:dark:border-slate-800 sm:dark:text-slate-300"
          >
            <X className="h-4 w-4" aria-hidden="true" />
            Hủy
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex min-h-14 items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-5 py-3 text-lg font-bold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 sm:h-9 sm:min-h-0 sm:px-3.5 sm:py-0 sm:text-sm"
        >
          <Send className="h-4 w-4" aria-hidden="true" />
          {isSubmitting ? 'Đang gửi...' : submitLabel}
        </button>
      </div>
    </form>
  );
}
