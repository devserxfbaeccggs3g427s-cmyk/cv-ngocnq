'use client';

import { cn } from '@/lib/utils';

interface ProjectFiltersProps {
  categories: string[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

export function ProjectFilters({ categories, activeCategory, onCategoryChange }: ProjectFiltersProps) {
  const getCategoryLabel = (category: string) => (category === 'All' ? 'Tất cả' : category);

  return (
    <div className="mb-10 flex flex-wrap items-baseline gap-x-6 gap-y-2 border-b border-[var(--line)] pb-4">
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => onCategoryChange(category)}
          className={cn(
            'group relative pb-1 text-sm font-medium transition-colors',
            category === activeCategory
              ? 'text-[var(--fg)]'
              : 'text-[var(--fg-subtle)] hover:text-[var(--fg)]'
          )}
        >
          {getCategoryLabel(category)}
          {category === activeCategory && (
            <span
              className="absolute inset-x-0 -bottom-[calc(1rem+1px)] h-px bg-[var(--fg)]"
              aria-hidden="true"
            />
          )}
        </button>
      ))}
    </div>
  );
}