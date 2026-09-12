'use client';

import { Check, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { type AiModelOption, type CommentDraft } from './utils';

export function CommentSearchBar({
  modelSearch,
  setModelSearch,
  filteredModelOptions,
  currentModelOptions,
  selectedModel,
  draft,
  onChange,
  setIsModelPickerOpen,
}: {
  modelSearch: string;
  setModelSearch: (value: string) => void;
  filteredModelOptions: AiModelOption[];
  currentModelOptions: AiModelOption[];
  selectedModel: AiModelOption | undefined;
  draft: CommentDraft;
  onChange: (update: Partial<CommentDraft>) => void;
  setIsModelPickerOpen: (open: boolean) => void;
}) {
  return (
    <div className="mt-2 overflow-hidden rounded-[var(--radius-card)] border border-[var(--line)] bg-[var(--surface)]">
      <div className="border-b border-[var(--line)] p-2">
        <div className="flex items-center gap-2 rounded-md border border-[var(--line)] bg-[var(--surface-2)] px-2.5 py-2 focus-within:border-[var(--fg)] focus-within:bg-[var(--bg)]">
          <Search className="h-4 w-4 shrink-0 text-[var(--fg-subtle)]" aria-hidden="true" />
          <input
            value={modelSearch}
            onChange={(event) => setModelSearch(event.target.value)}
            placeholder="Tìm model theo tên, id hoặc owner"
            className="min-w-0 flex-1 bg-transparent text-sm text-[var(--fg)] outline-none placeholder:text-[var(--fg-subtle)]"
          />
        </div>
        <div className="mt-2 flex items-center justify-between gap-2 text-xs text-[var(--fg-muted)]">
          <span>{filteredModelOptions.length}/{currentModelOptions.length} model</span>
          {selectedModel && (
            <span className="truncate font-semibold text-[var(--accent)]">
              Đang chọn: {selectedModel.name || selectedModel.id}
            </span>
          )}
        </div>
      </div>

      <div className="max-h-56 overflow-y-auto p-1">
        {filteredModelOptions.length > 0 ? (
          filteredModelOptions.map((model) => {
            const isSelected = model.id === draft.model;

            return (
              <button
                key={model.id}
                type="button"
                onClick={() => {
                  onChange({ model: model.id });
                  setModelSearch('');
                  setIsModelPickerOpen(false);
                }}
                className={cn(
                  'flex w-full min-w-0 items-start gap-2 rounded-md px-2.5 py-2 text-left transition',
                  isSelected
                    ? 'bg-[var(--surface-2)] text-[var(--fg)]'
                    : 'text-[var(--fg-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--fg)]'
                )}
              >
                <span
                  className={cn(
                    'mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border',
                    isSelected
                      ? 'border-[var(--fg)] bg-[var(--fg)] text-[var(--bg)]'
                      : 'border-[var(--line-strong)] text-transparent'
                  )}
                >
                  <Check className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">
                    {model.name || model.id}
                  </span>
                  <span className="mt-0.5 block truncate text-xs text-[var(--fg-muted)]">
                    {model.name ? model.id : model.owner || 'OpenAI-compatible model'}
                    {model.name && model.owner ? ` · ${model.owner}` : ''}
                  </span>
                </span>
              </button>
            );
          })
        ) : (
          <div className="px-3 py-6 text-center text-sm text-[var(--fg-muted)]">
            Không tìm thấy model phù hợp.
          </div>
        )}
      </div>
    </div>
  );
}
