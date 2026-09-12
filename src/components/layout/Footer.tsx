import Link from 'next/link';
import { Github, Linkedin, Twitter, Mail } from 'lucide-react';
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
  const version = '2026.09';

  return (
    <footer className="relative max-w-full overflow-hidden border-t border-[var(--line)] bg-[var(--bg)]">
      <div className="mx-auto min-w-0 max-w-[88rem] px-4 py-12 sm:px-6 lg:px-10">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          {/* Brand */}
          <div className="max-w-md">
            <div className="mb-3 flex items-center gap-2">
              <span className="rule-short" />
              <span className="eyebrow">Index</span>
            </div>
            <p className="font-serif text-2xl leading-tight text-[var(--fg)]">
              {profile.name}
            </p>
            <p className="mt-2 text-sm text-[var(--fg-muted)]">
              {profile.title}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <p className="eyebrow mb-4">Pages</p>
            <ul className="space-y-2">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="link-editorial text-sm font-medium text-[var(--fg-muted)] transition-colors hover:text-[var(--fg)]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect */}
          <div>
            <p className="eyebrow mb-4">Elsewhere</p>
            <div className="flex gap-2">
              {socialLinks.map(({ href, icon: Icon, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--line)] text-[var(--fg-muted)] transition-all duration-200 hover:border-[var(--fg)] hover:text-[var(--fg)]"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 flex flex-col items-start justify-between gap-2 border-t border-[var(--line)] pt-6 sm:flex-row sm:items-center">
          <p className="text-xs text-[var(--fg-subtle)]">
            © {version} · {profile.name}
          </p>
          <p className="text-xs text-[var(--fg-subtle)]">
            {profile.location}
          </p>
        </div>
      </div>
    </footer>
  );
}