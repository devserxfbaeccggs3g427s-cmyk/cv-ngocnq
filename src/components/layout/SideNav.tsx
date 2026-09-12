'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { portfolioNavItems } from '@/config';
import { cn } from '@/lib/utils';

interface SideNavProps {
  className?: string;
}

export function SideNav({ className }: SideNavProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href.startsWith('/#')) return pathname === '/' && href === '/#about';
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <nav
      className={cn(
        'fixed right-3 top-1/2 z-30 hidden -translate-y-1/2 lg:block',
        className
      )}
      aria-label="Điều hướng nhanh"
    >
      <ul className="flex flex-col gap-3">
        {portfolioNavItems.map(({ href, label }) => (
          <li key={href}>
            <Link
              href={href}
              aria-label={label}
              aria-current={isActive(href) ? 'page' : undefined}
              className={cn(
                'group block text-right transition-colors',
                isActive(href) ? 'text-[var(--fg)]' : 'text-[var(--fg-subtle)] hover:text-[var(--fg)]'
              )}
            >
              <span className="block text-[0.625rem] font-medium uppercase tracking-[0.18em]">
                {label}
              </span>
              <span
                className={cn(
                  'mt-1 ml-auto block h-px transition-all duration-300',
                  isActive(href)
                    ? 'w-6 bg-[var(--fg)]'
                    : 'w-3 bg-[var(--line-strong)] group-hover:w-6 group-hover:bg-[var(--fg)]'
                )}
                aria-hidden="true"
              />
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}