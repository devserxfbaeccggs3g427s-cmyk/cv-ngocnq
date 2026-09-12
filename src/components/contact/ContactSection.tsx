import { Mail, Phone, MapPin, Calendar } from 'lucide-react';
import { profile } from '@/data/profile';
import { Section, Button } from '@/components/ui';
import { ContactForm } from './ContactForm';
import { SocialLinks } from './SocialLinks';

export function ContactSection() {
  const contactInfo = [
    { icon: Mail, label: 'Email', value: profile.email, href: `mailto:${profile.email}` },
    { icon: Phone, label: 'Số điện thoại', value: profile.phone, href: `tel:${profile.phone}` },
    { icon: MapPin, label: 'Địa điểm', value: profile.location },
    { icon: Calendar, label: 'Trạng thái', value: 'Sẵn sàng trao đổi cơ hội phù hợp' },
  ];

  return (
    <Section
      id="contact"
      eyebrow="Contact"
      title="Liên hệ"
      subtitle="Sẵn sàng trao đổi về cơ hội và dự án phù hợp"
    >
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
        {/* Contact Info */}
        <div className="flex flex-col gap-8">
          <dl className="space-y-6">
            {contactInfo.map(({ icon: Icon, label, value, href }) => (
              <div key={label} className="flex items-baseline gap-4 border-b border-[var(--line)] pb-4">
                <Icon className="h-4 w-4 shrink-0 text-[var(--fg-subtle)]" />
                <div className="min-w-0 flex-1">
                  <dt className="eyebrow mb-1">{label}</dt>
                  {href ? (
                    <a
                      href={href}
                      className="link-editorial text-base font-medium text-[var(--fg)]"
                    >
                      {value}
                    </a>
                  ) : (
                    <dd className="text-base text-[var(--fg)]">{value}</dd>
                  )}
                </div>
              </div>
            ))}
          </dl>

          <div>
            <p className="eyebrow mb-3">Elsewhere</p>
            <SocialLinks size="md" />
          </div>
        </div>

        {/* Contact Form */}
        <div>
          <h3 className="font-serif text-2xl text-[var(--fg)]">
            Gửi lời nhắn
          </h3>
          <p className="mt-2 mb-6 text-sm text-[var(--fg-muted)]">
            Mình sẽ phản hồi trong vòng 1–2 ngày làm việc.
          </p>
          <ContactForm />
        </div>
      </div>
    </Section>
  );
}