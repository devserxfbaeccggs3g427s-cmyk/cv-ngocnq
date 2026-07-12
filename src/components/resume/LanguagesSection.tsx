import { Globe } from 'lucide-react';
import { getLanguageLevelLabel, languages } from '@/data/skills';
import { Badge } from '@/components/ui';

export function LanguagesSection() {
  const levelColors: Record<string, 'success' | 'default' | 'secondary'> = {
    Native: 'success',
    Professional: 'default',
    Basic: 'secondary',
  };

  return (
    <div className="glass-panel rounded-3xl p-6">
      <h3 className="mb-4 flex items-center gap-2 text-lg font-bold tracking-tight text-slate-950 dark:text-white">
        <Globe className="w-5 h-5 text-blue-600 dark:text-blue-300" />
        Ngôn ngữ
      </h3>
      <div className="flex flex-wrap gap-3">
        {languages.map((lang) => (
          <div
            key={lang.name}
            className="flex items-center gap-2 rounded-2xl border border-slate-200/80 bg-white/70 px-3 py-2 shadow-sm dark:border-slate-800 dark:bg-slate-900/70"
          >
            <span className="font-semibold text-slate-950 dark:text-white">
              {lang.name}
            </span>
            <Badge variant={levelColors[lang.level] || 'secondary'} size="sm">
              {getLanguageLevelLabel(lang.level)}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
}
