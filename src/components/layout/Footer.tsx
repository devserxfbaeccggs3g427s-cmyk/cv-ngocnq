import Link from 'next/link';
import { Github, Linkedin, Twitter, Mail, Heart } from 'lucide-react';
import { profile } from '@/data/profile';

const socialLinks = [
  { href: profile.github, icon: Github, label: 'GitHub' },
  { href: profile.linkedin, icon: Linkedin, label: 'LinkedIn' },
  { href: profile.twitter, icon: Twitter, label: 'Twitter' },
  { href: `mailto:${profile.email}`, icon: Mail, label: 'Email' },
];

const footerLinks = [
  { href: '/', label: 'Trang chủ' },
  { href: '/portfolio', label: 'Dự án' },
  { href: '/workspace', label: 'Workspace' },
  { href: '/#contact', label: 'Liên hệ' },
  { href: '/print', label: 'Bản in PDF' },
];

export function Footer() {
  const version = '20260626.2';

  return (
    <footer className="relative max-w-full overflow-hidden border-t border-slate-200/70 bg-white/45 backdrop-blur dark:border-slate-800/80 dark:bg-slate-950/70">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
      <div className="mx-auto min-w-0 max-w-[88rem] px-4 py-12 sm:px-6 lg:px-8 xl:px-10">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-[1.3fr_0.8fr_0.9fr]">
          {/* Brand */}
          <div className="max-w-lg">
            <h3 className="mb-3 text-lg font-extrabold tracking-tight text-slate-950 dark:text-white">
              {profile.name}
            </h3>
            <p className="mb-4 text-sm leading-6 text-slate-600 dark:text-slate-300">
              {profile.title}
            </p>
            <p className="inline-flex rounded-full border border-slate-200 bg-white/70 px-3 py-1 text-sm font-medium text-slate-500 dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-400">
              {profile.location}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 font-semibold text-slate-950 dark:text-white">
              Liên kết nhanh
            </h3>
            <ul className="space-y-2">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm font-medium text-slate-600 transition-colors hover:text-blue-700 dark:text-slate-400 dark:hover:text-blue-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h3 className="mb-4 font-semibold text-slate-950 dark:text-white">
              Kết nối
            </h3>
            <div className="flex gap-4">
              {socialLinks.map(({ href, icon: Icon, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-2xl border border-slate-200/80 bg-white/70 p-2 text-slate-600 shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:text-blue-700 dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-400 dark:hover:border-blue-800 dark:hover:text-blue-300"
                  aria-label={label}
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 border-t border-slate-200/70 pt-8 dark:border-slate-800/80">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-slate-500 dark:text-slate-500">
              © {version} {profile.name}. Mọi quyền được bảo lưu.
            </p>
            <p className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-500">
              Xây dựng với <Heart className="w-4 h-4 text-red-500" /> Next.js
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
