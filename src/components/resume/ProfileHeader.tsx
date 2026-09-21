import { ArrowRight, Download, MapPin, Mail } from 'lucide-react';
import { profile } from '@/data/profile';
import { Button } from '@/components/ui';
import { SocialLinks } from '@/components/contact/SocialLinks';

export function ProfileHeader() {
  return (
    <header id="about" className="relative pt-4 pb-8 md:pb-12">
      <div className="mb-6 flex items-center gap-3">
        <span className="rule-short" />
        <span className="eyebrow">Profile</span>
        <span className="status-dot status-dot-live ml-2 hidden sm:inline-flex">
          Open to work
        </span>
      </div>

      <h1 className="font-serif text-5xl font-normal leading-[0.95] tracking-tight text-[var(--fg)] sm:text-6xl md:text-7xl lg:text-[5.5rem]">
        {profile.name}
      </h1>

      <p className="mt-5 max-w-2xl text-lg leading-7 text-[var(--fg-muted)] sm:text-xl">
        <span className="font-serif italic">{profile.title}</span> · {profile.location}
      </p>

      {/* Quick info row */}
      <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-[var(--fg-muted)]">
        <a
          href={`mailto:${profile.email}`}
          className="link-editorial inline-flex items-center gap-2 text-[var(--fg)]"
        >
          <Mail className="h-3.5 w-3.5 text-[var(--fg-subtle)]" />
          {profile.email}
        </a>
        <span className="inline-flex items-center gap-2">
          <MapPin className="h-3.5 w-3.5 text-[var(--fg-subtle)]" />
          {profile.location}
        </span>
        <SocialLinks variant="inline" />
      </div>

      {/* Actions */}
      <div className="mt-10 flex flex-wrap items-center gap-3">
        <Button href="/portfolio" size="lg">
          Xem dự án
          <ArrowRight className="h-4 w-4" />
        </Button>
        <Button href="/print-banking" variant="secondary" size="lg">
          <Download className="h-4 w-4" />
          Tải CV Senior Banking
        </Button>
      </div>
    </header>
  );
}