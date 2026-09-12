import { profile } from '@/data/profile';
import { ArrowUpRight } from 'lucide-react';

export function Summary() {
  return (
    <section className="grid gap-10 pb-12 pt-4 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
      {/* Editorial quote */}
      <div className="relative">
        <span className="rule-short mb-5" aria-hidden="true" />
        <blockquote className="editorial-quote font-serif text-2xl leading-[1.18] text-[var(--fg)] sm:text-3xl md:text-[2rem]">
          {profile.summary}
        </blockquote>
      </div>

      {/* Highlights */}
      <div>
        <p className="eyebrow mb-5">Highlights</p>
        <ul className="space-y-4">
          {profile.highlights.map((highlight, index) => (
            <li
              key={index}
              className="flex items-baseline gap-4 border-b border-[var(--line)] pb-4 last:border-b-0"
            >
              <span className="numeral text-sm text-[var(--fg-subtle)]">
                {String(index + 1).padStart(2, '0')}
              </span>
              <span className="flex-1 text-base leading-6 text-[var(--fg)]">
                {highlight}
              </span>
              <ArrowUpRight className="h-4 w-4 shrink-0 text-[var(--fg-subtle)]" aria-hidden="true" />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}