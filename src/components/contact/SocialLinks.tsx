import { Github, Linkedin, Twitter, Globe } from 'lucide-react';
import { profile } from '@/data/profile';
import { cn } from '@/lib/utils';

interface SocialLinksProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'inline';
  className?: string;
}

const socialIcons = {
  github: Github,
  linkedin: Linkedin,
  twitter: Twitter,
  website: Globe,
};

export function SocialLinks({ size = 'md', variant = 'default', className }: SocialLinksProps) {
  const links = [
    { href: profile.github, icon: 'github', label: 'GitHub' },
    { href: profile.linkedin, icon: 'linkedin', label: 'LinkedIn' },
    { href: profile.twitter, icon: 'twitter', label: 'Twitter' },
    { href: profile.website, icon: 'website', label: 'Website' },
  ].filter((link) => link.href);

  const sizes = {
    sm: 'p-1.5 w-8 h-8',
    md: 'p-2 w-10 h-10',
    lg: 'p-3 w-12 h-12',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  if (variant === 'inline') {
    return (
      <span className={cn('inline-flex items-center gap-3', className)}>
        {links.map(({ href, label }, i) => (
          <span key={label} className="inline-flex items-center gap-3">
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="link-editorial text-sm font-medium text-[var(--fg-muted)] hover:text-[var(--fg)]"
            >
              {label}
            </a>
            {i < links.length - 1 && (
              <span className="text-[var(--fg-subtle)]" aria-hidden="true">·</span>
            )}
          </span>
        ))}
      </span>
    );
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {links.map(({ href, icon, label }) => {
        const Icon = socialIcons[icon as keyof typeof socialIcons];
        return (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              'inline-flex items-center justify-center rounded-full border border-[var(--line)] text-[var(--fg-muted)] transition-colors duration-200 hover:border-[var(--fg)] hover:text-[var(--fg)]',
              sizes[size]
            )}
            aria-label={label}
          >
            <Icon className={iconSizes[size]} />
          </a>
        );
      })}
    </div>
  );
}