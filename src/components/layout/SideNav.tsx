'use client';

import Link from 'next/link';
import { User, Briefcase, Code, GraduationCap, Folder, Mail, ListChecks, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/#about', label: 'Giới thiệu', icon: User },
  { href: '/#experience', label: 'Kinh nghiệm', icon: Briefcase },
  { href: '/#skills', label: 'Kỹ năng', icon: Code },
  { href: '/#education', label: 'Học vấn', icon: GraduationCap },
  { href: '/#contact', label: 'Liên hệ', icon: Mail },
  { href: '/portfolio', label: 'Dự án', icon: Folder },
  { href: '/skill-roadmap', label: 'Ôn tập', icon: ListChecks },
  { href: '/markdown-files', label: 'Markdown', icon: FileText },
];

interface SideNavProps {
  className?: string;
}

export function SideNav({ className }: SideNavProps) {
  return (
    <nav
      className={cn(
        'fixed left-0 top-1/2 -translate-y-1/2 z-30 hidden lg:block',
        className
      )}
    >
      <ul className="flex flex-col gap-1 p-2 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md rounded-r-xl shadow-lg border border-l-0 border-gray-200 dark:border-gray-800">
        {navItems.map(({ href, label, icon: Icon }) => (
          <li key={href}>
            <Link
              href={href}
              className="flex items-center gap-3 p-3 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800 transition-colors group relative"
            >
              <Icon className="w-5 h-5" />
              <span className="absolute left-full ml-2 px-3 py-1 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-medium rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap">
                {label}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
