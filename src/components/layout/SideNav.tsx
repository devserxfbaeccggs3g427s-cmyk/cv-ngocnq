'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sparkles } from 'lucide-react';
import { isWorkspacePath, portfolioNavItems, workspaceFeatures } from '@/config';
import { cn } from '@/lib/utils';

interface SideNavProps {
  className?: string;
}

export function SideNav({ className }: SideNavProps) {
  const pathname = usePathname();
  const workspaceActive = isWorkspacePath(pathname);

  const isActive = (href: string) => {
    if (href.startsWith('/#')) return pathname === '/' && href === '/#about';
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <nav
      className={cn(
        'fixed left-3 top-1/2 z-30 hidden -translate-y-1/2 lg:block',
        className
      )}
      aria-label="Điều hướng nhanh"
    >
      <ul className="glass-panel flex flex-col gap-1 rounded-3xl p-2 shadow-xl">
        {portfolioNavItems.map(({ href, label, icon: Icon }) => (
          <li key={href}>
            <Link
              href={href}
              aria-label={label}
              aria-current={isActive(href) ? 'page' : undefined}
              className={cn(
                'group relative flex items-center gap-3 rounded-2xl p-3 text-slate-500 transition-all hover:bg-white/75 hover:text-blue-700 hover:shadow-sm dark:text-slate-400 dark:hover:bg-slate-800/80 dark:hover:text-blue-300',
                isActive(href) && 'bg-white/80 text-blue-700 shadow-sm dark:bg-slate-800/80 dark:text-blue-300'
              )}
            >
              <Icon className="w-5 h-5" />
              <span aria-hidden="true" className="invisible absolute left-full ml-3 whitespace-nowrap rounded-xl bg-slate-950 px-3 py-1.5 text-sm font-semibold text-white opacity-0 shadow-xl transition-all group-hover:visible group-hover:translate-x-1 group-hover:opacity-100 dark:bg-white dark:text-slate-950">
                {label}
              </span>
            </Link>
          </li>
        ))}

        <li aria-hidden="true" className="my-1 h-px bg-slate-200/80 dark:bg-slate-800/90" />

        <li>
          <Link
            href="/workspace"
            aria-label="Workspace"
            aria-current={workspaceActive ? 'page' : undefined}
            className={cn(
              'group relative flex items-center gap-3 rounded-2xl p-3 text-blue-600 transition-all hover:bg-blue-50 hover:text-blue-700 hover:shadow-sm dark:text-blue-300 dark:hover:bg-blue-950/40 dark:hover:text-blue-200',
              workspaceActive && 'bg-blue-50 text-blue-700 shadow-sm dark:bg-blue-950/40 dark:text-blue-200'
            )}
          >
            <Sparkles className="w-5 h-5" />
            <span aria-hidden="true" className="invisible absolute left-full ml-3 whitespace-nowrap rounded-xl bg-slate-950 px-3 py-1.5 text-sm font-semibold text-white opacity-0 shadow-xl transition-all group-hover:visible group-hover:translate-x-1 group-hover:opacity-100 dark:bg-white dark:text-slate-950">
              Workspace
            </span>
          </Link>
        </li>

        {workspaceFeatures.map(({ href, label, icon: Icon }) => (
          <li key={href}>
            <Link
              href={href}
              aria-label={label}
              aria-current={isActive(href) ? 'page' : undefined}
              className={cn(
                'group relative flex items-center gap-3 rounded-2xl p-3 text-slate-500 transition-all hover:bg-blue-50 hover:text-blue-700 hover:shadow-sm dark:text-slate-400 dark:hover:bg-blue-950/40 dark:hover:text-blue-300',
                isActive(href) && 'bg-blue-50 text-blue-700 shadow-sm dark:bg-blue-950/40 dark:text-blue-300'
              )}
            >
              <Icon className="w-5 h-5" />
              <span aria-hidden="true" className="invisible absolute left-full ml-3 whitespace-nowrap rounded-xl bg-slate-950 px-3 py-1.5 text-sm font-semibold text-white opacity-0 shadow-xl transition-all group-hover:visible group-hover:translate-x-1 group-hover:opacity-100 dark:bg-white dark:text-slate-950">
                {label}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
