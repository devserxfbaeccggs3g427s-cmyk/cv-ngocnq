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
    <div className="mt-2 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
      <div className="border-b border-gray-200 p-2 dark:border-gray-800">
        <div className="flex items-center gap-2 rounded-md border border-gray-200 bg-gray-50 px-2.5 py-2 focus-within:border-blue-400 focus-within:bg-white dark:border-gray-800 dark:bg-gray-900 dark:focus-within:border-blue-700 dark:focus-within:bg-gray-950">
          <Search className="h-4 w-4 shrink-0 text-gray-400" aria-hidden="true" />
          <input
            value={modelSearch}
            onChange={(event) => setModelSearch(event.target.value)}
            placeholder="Tìm model theo tên, id hoặc owner"
            className="min-w-0 flex-1 bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400 dark:text-gray-100"
          />
        </div>
        <div className="mt-2 flex items-center justify-between gap-2 text-xs text-gray-500 dark:text-gray-400">
          <span>{filteredModelOptions.length}/{currentModelOptions.length} model</span>
          {selectedModel && (
            <span className="truncate font-semibold text-blue-700 dark:text-blue-300">
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
                    ? 'bg-blue-50 text-blue-900 dark:bg-blue-950/50 dark:text-blue-100'
                    : 'text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-900'
                )}
              >
                <span
                  className={cn(
                    'mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border',
                    isSelected
                      ? 'border-blue-600 bg-blue-600 text-white dark:border-blue-400 dark:bg-blue-400 dark:text-blue-950'
                      : 'border-gray-300 text-transparent dark:border-gray-700'
                  )}
                >
                  <Check className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">
                    {model.name || model.id}
                  </span>
                  <span className="mt-0.5 block truncate text-xs text-gray-500 dark:text-gray-400">
                    {model.name ? model.id : model.owner || 'OpenAI-compatible model'}
                    {model.name && model.owner ? ` · ${model.owner}` : ''}
                  </span>
                </span>
              </button>
            );
          })
        ) : (
          <div className="px-3 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
            Không tìm thấy model phù hợp.
          </div>
        )}
      </div>
    </div>
  );
}
