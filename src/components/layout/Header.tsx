'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Menu, X, Download, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui';
import { headerPortfolioNavItems, isWorkspacePath, workspaceFeatures } from '@/config';
import { profile } from '@/data/profile';
import { cn } from '@/lib/utils';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const workspaceActive = isWorkspacePath(pathname);
  const mobileNavId = 'mobile-navigation';

  const isActive = (href: string) => {
    if (href.startsWith('/#')) return pathname === '/' && href === '/#about';
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMenuOpen]);

  return (
    <header className="fixed left-0 right-0 top-0 z-40 max-w-full border-b border-white/40 bg-white/75 shadow-[0_8px_40px_-28px_rgba(15,23,42,0.55)] backdrop-blur-2xl dark:border-slate-800/70 dark:bg-slate-950/72">
      <div className="mx-auto min-w-0 max-w-[88rem] px-3 sm:px-6 lg:px-8 xl:px-10">
        <div className="flex h-14 items-center justify-between gap-3 sm:h-16 sm:gap-4">
          {/* Logo / Name */}
          <Link href="/" className="group flex min-w-0 items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 text-xs font-black text-white shadow-lg shadow-blue-600/25 sm:h-10 sm:w-10 sm:text-sm">
              {profile.name.split(' ').slice(-2).map((part) => part[0]).join('')}
            </span>
            <span className="min-w-0">
              <span className="block max-w-[11rem] truncate text-sm font-extrabold tracking-tight text-slate-950 transition group-hover:text-blue-700 dark:text-white dark:group-hover:text-blue-300 sm:max-w-none sm:text-base">
                {profile.name}
              </span>
              <span className="hidden truncate text-xs font-medium text-slate-500 dark:text-slate-400 sm:block">
                {profile.title}
              </span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav
            className="hidden items-center gap-1 rounded-full border border-slate-200/70 bg-white/55 p-1 shadow-sm backdrop-blur dark:border-slate-800/80 dark:bg-slate-900/45 lg:flex"
            aria-label="Điều hướng chính"
          >
            {headerPortfolioNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive(item.href) ? 'page' : undefined}
                className={cn(
                  'rounded-full px-3 py-2 text-sm font-semibold text-slate-600 transition-all hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800/80 dark:hover:text-white',
                  isActive(item.href) && 'bg-slate-950 text-white shadow-sm hover:bg-slate-950 hover:text-white dark:bg-white dark:text-slate-950 dark:hover:bg-white dark:hover:text-slate-950'
                )}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/workspace"
              aria-current={workspaceActive ? 'page' : undefined}
              className={cn(
                'inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-bold text-blue-700 transition-all hover:bg-blue-50 hover:text-blue-800 dark:text-blue-300 dark:hover:bg-blue-950/40 dark:hover:text-blue-200',
                workspaceActive && 'bg-blue-600 text-white shadow-sm hover:bg-blue-600 hover:text-white dark:bg-blue-400 dark:text-slate-950 dark:hover:bg-blue-400 dark:hover:text-slate-950'
              )}
            >
              <Sparkles className="h-4 w-4" />
              Workspace
            </Link>
          </nav>

          <div className="hidden items-center gap-2 lg:flex">
            <Button href="/print" size="sm">
              <Download className="w-4 h-4 mr-2" />
              CV
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200/70 bg-white/70 text-slate-600 shadow-sm transition hover:border-blue-200 hover:text-slate-950 dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-300 dark:hover:border-blue-800 dark:hover:text-white lg:hidden"
            aria-label={isMenuOpen ? 'Đóng menu điều hướng' : 'Mở menu điều hướng'}
            aria-controls={mobileNavId}
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
        <div
          id={mobileNavId}
          className="overflow-y-auto pb-3 transition-all duration-300 lg:hidden sm:pb-4"
        >
          <nav
            className="space-y-3 rounded-3xl border border-slate-200/70 bg-white/90 p-3 shadow-xl shadow-slate-950/5 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/90"
            aria-label="Điều hướng di động"
          >
            <div>
              <p className="px-1 pb-2 text-xs font-black uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
                Portfolio
              </p>
              <div className="grid grid-cols-2 gap-2">
                {headerPortfolioNavItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    aria-current={isActive(item.href) ? 'page' : undefined}
                    className={cn(
                      'rounded-2xl px-3 py-2.5 text-center text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white',
                      isActive(item.href) && 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300'
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between gap-3 px-1 pb-2">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
                  Workspace
                </p>
                <Link
                  href="/workspace"
                  onClick={() => setIsMenuOpen(false)}
                  aria-current={workspaceActive ? 'page' : undefined}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold text-blue-700 hover:bg-blue-50 dark:text-blue-300 dark:hover:bg-blue-950/40',
                    workspaceActive && 'bg-blue-50 dark:bg-blue-950/40'
                  )}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Hub
                </Link>
              </div>

              <div className="grid gap-2">
                {workspaceFeatures.map(({ href, label, description, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setIsMenuOpen(false)}
                    aria-current={isActive(href) ? 'page' : undefined}
                    className={cn(
                      'flex items-start gap-3 rounded-2xl border border-slate-200/70 bg-white/60 px-3 py-3 text-left transition hover:border-blue-200 hover:bg-blue-50/60 dark:border-slate-800 dark:bg-slate-950/35 dark:hover:border-blue-900 dark:hover:bg-blue-950/30',
                      isActive(href) && 'border-blue-300 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-100'
                    )}
                  >
                    <Icon className="mt-0.5 h-4 w-4 shrink-0 text-blue-700 dark:text-blue-300" />
                    <span className="min-w-0">
                      <span className="block text-sm font-bold text-slate-900 dark:text-white">
                        {label}
                      </span>
                      <span className="mt-0.5 line-clamp-2 block text-xs leading-5 text-slate-500 dark:text-slate-400">
                        {description}
                      </span>
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="px-1 pt-1">
              <Button href="/print" size="sm" className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Xem bản in PDF
              </Button>
            </div>
          </nav>
        </div>
        )}
      </div>
    </header>
  );
}
