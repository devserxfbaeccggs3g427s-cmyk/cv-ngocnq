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
    <div className="mb-8 flex flex-wrap gap-2 rounded-3xl border border-slate-200/80 bg-white/65 p-2 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/65">
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => onCategoryChange(category)}
          className={cn(
            'rounded-2xl px-4 py-2 text-sm font-semibold transition-all',
            category === activeCategory
              ? 'bg-slate-950 text-white shadow-md dark:bg-white dark:text-slate-950'
              : 'text-slate-600 hover:bg-white hover:text-slate-950 hover:shadow-sm dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
          )}
        >
          {getCategoryLabel(category)}
        </button>
      ))}
    </div>
  );
}
