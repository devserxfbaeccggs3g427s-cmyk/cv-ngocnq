import { certifications } from '@/data/education';
import { Section } from '@/components/ui';
import { formatMonthYear } from '@/lib/date';
import { ArrowUpRight } from 'lucide-react';

export function CertificationsSection() {
  return (
    <Section
      id="certifications"
      eyebrow="Credentials"
      title="Chứng chỉ"
      subtitle="Chứng chỉ và năng lực bổ trợ"
    >
      <ul className="divide-y divide-[var(--line)] border-y border-[var(--line)]">
        {certifications.map((cert, index) => (
          <li
            key={cert.id}
            className="flex items-baseline gap-6 py-5 transition-colors duration-200 hover:bg-[var(--surface-2)]"
          >
            <span className="numeral shrink-0 text-sm text-[var(--fg-subtle)]">
              {String(index + 1).padStart(2, '0')}
            </span>
            <div className="min-w-0 flex-1">
              <h3 className="font-serif text-lg leading-tight text-[var(--fg)]">
                {cert.name}
              </h3>
              <p className="mt-1 text-sm text-[var(--fg-muted)]">
                {cert.issuer} · {formatMonthYear(cert.date)}
                {cert.expirationDate && (
                  <span className="text-[var(--fg-subtle)]">
                    {' '}— Hết hạn {formatMonthYear(cert.expirationDate)}
                  </span>
                )}
              </p>
            </div>
            {cert.credentialUrl ? (
              <a
                href={cert.credentialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="link-editorial shrink-0 text-sm font-medium text-[var(--fg-muted)] hover:text-[var(--fg)]"
              >
                Xem <ArrowUpRight className="inline h-3.5 w-3.5" />
              </a>
            ) : cert.credentialId ? (
              <span className="numeral shrink-0 text-xs text-[var(--fg-subtle)]">
                ID {cert.credentialId}
              </span>
            ) : null}
          </li>
        ))}
      </ul>
    </Section>
  );
}