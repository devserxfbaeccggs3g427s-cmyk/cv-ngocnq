import { profile } from '@/data/profile';
import { CheckCircle } from 'lucide-react';

export function Summary() {
  return (
    <div className="mb-12 grid gap-6 lg:grid-cols-[1.1fr_1fr]">
      <div className="glass-panel rounded-3xl p-6 md:p-7">
        <p className="text-lg leading-8 text-slate-700 dark:text-slate-200">
          {profile.summary}
        </p>
      </div>

      {/* Highlights */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1">
        {profile.highlights.map((highlight, index) => (
          <div
            key={index}
            className="group flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white/70 p-4 text-slate-700 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-300 dark:hover:border-emerald-800"
          >
            <CheckCircle className="h-5 w-5 flex-shrink-0 text-emerald-500" />
            <span className="font-medium leading-6">{highlight}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
