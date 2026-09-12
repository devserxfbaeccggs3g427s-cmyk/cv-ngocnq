'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Menu, X, Download } from 'lucide-react';
import { Button } from '@/components/ui';
import { headerPortfolioNavItems, isWorkspacePath, workspaceFeatures } from '@/config';
import { profile } from '@/data/profile';
import { cn } from '@/lib/utils';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const workspaceActive = isWorkspacePath(pathname);
  const mobileNavId = 'mobile-navigation';

  const isActive = (href: string) => {
    if (href.startsWith('/#')) return pathname === '/' && href === '/#about';
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  useEffect(() => {
    if (!isMenuOpen) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsMenuOpen(false);
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isMenuOpen]);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 4);
          ticking = false;
        });
        ticking = true;
      }
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={cn(
        'fixed left-0 right-0 top-0 z-40 max-w-full transition-colors duration-300',
        isScrolled || isMenuOpen
          ? 'border-b border-[var(--line)] bg-[var(--bg)]/95 shadow-sm backdrop-blur-md'
          : 'border-b border-transparent bg-transparent'
      )}
    >
      <div className="mx-auto min-w-0 max-w-[88rem] px-4 sm:px-6 lg:px-10">
        <div className="flex h-14 items-center justify-between gap-4 sm:h-16">
          {/* Logo / Name */}
          <Link href="/" className="group flex min-w-0 items-baseline gap-2">
            <span className="font-serif text-xl font-normal leading-none tracking-tight text-[var(--fg)] sm:text-2xl">
              {profile.name.split(' ')[0]}
            </span>
            <span className="hidden truncate text-xs font-medium uppercase tracking-[0.18em] text-[var(--fg-muted)] sm:inline">
              {profile.title}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav
            className="hidden items-center gap-1 lg:flex"
            aria-label="Điều hướng chính"
          >
            {headerPortfolioNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive(item.href) ? 'page' : undefined}
                className={cn(
                  'group relative px-3 py-2 text-sm font-medium transition-colors',
                  isActive(item.href)
                    ? 'text-[var(--fg)]'
                    : 'text-[var(--fg-muted)] hover:text-[var(--fg)]'
                )}
              >
                {item.label}
                {isActive(item.href) && (
                  <span className="absolute inset-x-3 -bottom-px h-px bg-[var(--fg)]" aria-hidden="true" />
                )}
              </Link>
            ))}
            <Link
              href="/workspace"
              aria-current={workspaceActive ? 'page' : undefined}
              className={cn(
                'group relative px-3 py-2 text-sm font-medium transition-colors',
                workspaceActive
                  ? 'text-[var(--accent)]'
                  : 'text-[var(--fg-muted)] hover:text-[var(--fg)]'
              )}
            >
              Workspace
              {workspaceActive && (
                <span className="absolute inset-x-3 -bottom-px h-px bg-[var(--accent)]" aria-hidden="true" />
              )}
            </Link>
          </nav>

          <div className="hidden items-center gap-2 lg:flex">
            <Button href="/print" variant="secondary" size="sm">
              <Download className="h-3.5 w-3.5" />
              CV
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="inline-flex h-10 w-10 items-center justify-center text-[var(--fg)] transition-opacity hover:opacity-70 lg:hidden"
            aria-label={isMenuOpen ? 'Đóng menu điều hướng' : 'Mở menu điều hướng'}
            aria-controls={mobileNavId}
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div
            id={mobileNavId}
            className="overflow-y-auto border-t border-[var(--line)] pb-6 pt-4 lg:hidden"
          >
            <nav className="space-y-6" aria-label="Điều hướng di động">
              <div>
                <p className="eyebrow mb-3">Portfolio</p>
                <div className="grid gap-1">
                  {headerPortfolioNavItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMenuOpen(false)}
                      aria-current={isActive(item.href) ? 'page' : undefined}
                      className={cn(
                        'block px-1 py-2 text-base font-medium transition-colors',
                        isActive(item.href)
                          ? 'text-[var(--fg)]'
                          : 'text-[var(--fg-muted)] hover:text-[var(--fg)]'
                      )}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>

              <div>
                <p className="eyebrow mb-3">Workspace</p>
                <div className="grid gap-1">
                  {workspaceFeatures.map(({ href, label }) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setIsMenuOpen(false)}
                      aria-current={isActive(href) ? 'page' : undefined}
                      className={cn(
                        'block px-1 py-2 text-base font-medium transition-colors',
                        isActive(href)
                          ? 'text-[var(--fg)]'
                          : 'text-[var(--fg-muted)] hover:text-[var(--fg)]'
                      )}
                    >
                      {label}
                    </Link>
                  ))}
                </div>
              </div>

              <div>
                <Button href="/print" variant="secondary" className="w-full">
                  <Download className="h-4 w-4" />
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