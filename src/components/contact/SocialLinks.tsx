import { Github, Linkedin, Twitter, Globe } from 'lucide-react';
import { profile } from '@/data/profile';
import { cn } from '@/lib/utils';

interface SocialLinksProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const socialIcons = {
  github: Github,
  linkedin: Linkedin,
  twitter: Twitter,
  website: Globe,
};

export function SocialLinks({ size = 'md', className }: SocialLinksProps) {
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
              'flex items-center justify-center rounded-2xl border border-slate-200/70 bg-white/70 text-slate-600 shadow-sm backdrop-blur transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-400 dark:hover:border-blue-800 dark:hover:bg-blue-950/30 dark:hover:text-blue-300',
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
