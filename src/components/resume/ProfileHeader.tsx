import { ArrowRight, Download, Globe, Mail, MapPin, Phone, ShieldCheck, Sparkles } from 'lucide-react';
import { profile } from '@/data/profile';
import { Button } from '@/components/ui';
import { SocialLinks } from '@/components/contact/SocialLinks';

export function ProfileHeader() {
  return (
    <header className="premium-ring relative mb-10 overflow-hidden rounded-[1.5rem] border border-white/60 bg-white/70 p-4 shadow-[0_32px_120px_-70px_rgba(37,99,235,0.9)] backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/72 sm:rounded-[2rem] sm:p-6 md:p-8 lg:mb-12 lg:p-10">
      <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
      <div className="absolute -bottom-28 left-1/3 h-72 w-72 rounded-full bg-violet-500/20 blur-3xl" />

      <div className="relative grid items-center gap-6 sm:gap-8 lg:grid-cols-[auto_1fr]">
        {/* Profile Photo */}
        <div className="relative mx-auto flex h-32 w-32 shrink-0 items-center justify-center rounded-[1.5rem] bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 p-1 shadow-2xl shadow-blue-600/25 sm:h-40 sm:w-40 sm:rounded-[2rem] lg:mx-0 lg:h-44 lg:w-44">
          <div className="flex h-full w-full items-center justify-center rounded-[1.25rem] bg-slate-950/92 text-4xl font-black tracking-tight text-white sm:rounded-[1.75rem] sm:text-5xl">
            {profile.name.split(' ').map((n) => n[0]).join('')}
          </div>
          <div className="absolute -bottom-3 -right-3 inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 shadow-lg dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Open
          </div>
        </div>

        <div className="min-w-0 text-center lg:text-left">
          <div className="mb-4 inline-flex max-w-full items-center gap-2 rounded-full border border-blue-200/70 bg-blue-50/80 px-3 py-1.5 text-xs font-semibold text-blue-700 shadow-sm dark:border-blue-800/60 dark:bg-blue-950/40 dark:text-blue-300 sm:text-sm">
            <Sparkles className="h-4 w-4" />
            <span className="truncate">Backend / Full-Stack Engineer cho hệ thống production</span>
          </div>

          <h1 className="text-balance text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-4xl md:text-6xl">
            {profile.name}
          </h1>
          <p className="mt-3 text-lg font-semibold text-blue-700 dark:text-blue-300 sm:text-xl md:text-2xl">
            {profile.title}
          </p>

          {/* Contact Info */}
          <div className="mt-6 flex flex-wrap justify-center gap-2 text-sm text-slate-600 dark:text-slate-300 sm:gap-3 lg:justify-start">
            <a
              href={`mailto:${profile.email}`}
              className="inline-flex w-full min-w-0 items-center justify-center gap-2 rounded-full border border-slate-200/80 bg-white/70 px-3 py-2 font-medium shadow-sm transition hover:border-blue-200 hover:text-blue-700 dark:border-slate-800 dark:bg-slate-900/70 dark:hover:border-blue-800 dark:hover:text-blue-300 sm:w-auto"
            >
              <Mail className="h-4 w-4 shrink-0" />
              <span className="min-w-0 break-all">{profile.email}</span>
            </a>
            <span className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-slate-200/80 bg-white/70 px-3 py-2 font-medium shadow-sm dark:border-slate-800 dark:bg-slate-900/70 sm:w-auto">
              <Phone className="h-4 w-4" />
              {profile.phone}
            </span>
            <span className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-slate-200/80 bg-white/70 px-3 py-2 font-medium shadow-sm dark:border-slate-800 dark:bg-slate-900/70 sm:w-auto">
              <MapPin className="h-4 w-4" />
              {profile.location}
            </span>
            <a
              href={profile.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-slate-200/80 bg-white/70 px-3 py-2 font-medium shadow-sm transition hover:border-blue-200 hover:text-blue-700 dark:border-slate-800 dark:bg-slate-900/70 dark:hover:border-blue-800 dark:hover:text-blue-300 sm:w-auto"
            >
              <Globe className="h-4 w-4" />
              Dự án
            </a>
          </div>

          <div className="mt-6 flex flex-wrap justify-center gap-2 lg:justify-start">
            {['Java/Spring', 'Banking Systems', 'Payment', 'Observability'].map((item) => (
              <span
                key={item}
                className="inline-flex items-center gap-1.5 rounded-full bg-slate-950 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-white shadow-sm dark:bg-white dark:text-slate-950"
              >
                <ShieldCheck className="h-3.5 w-3.5 text-cyan-300 dark:text-blue-600" />
                {item}
              </span>
            ))}
          </div>

          {/* Actions */}
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
            <Button href="/portfolio" size="lg" className="w-full sm:w-auto">
              Xem dự án
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button href="/print" variant="outline" size="lg" className="w-full sm:w-auto">
              <Download className="mr-2 h-4 w-4" />
              Bản in PDF
            </Button>
            <SocialLinks />
          </div>
        </div>
      </div>
    </header>
  );
}
