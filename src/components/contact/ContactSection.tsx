import { Mail, Phone, MapPin, Calendar } from 'lucide-react';
import { profile } from '@/data/profile';
import { Section, Card, CardContent } from '@/components/ui';
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
    <Section id="contact" title="Liên hệ" subtitle="Sẵn sàng trao đổi về cơ hội và dự án phù hợp">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Contact Info */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardContent className="p-6 space-y-6">
              <h3 className="text-lg font-bold tracking-tight text-slate-950 dark:text-white">
                Thông tin liên hệ
              </h3>

              <div className="space-y-4">
                {contactInfo.map(({ icon: Icon, label, value, href }) => (
                  <div key={label} className="flex items-start gap-3 rounded-2xl border border-slate-200/70 bg-white/55 p-3 dark:border-slate-800 dark:bg-slate-950/35">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
                      {href ? (
                        <a
                          href={href}
                          className="font-semibold text-slate-950 transition-colors hover:text-blue-700 dark:text-white dark:hover:text-blue-300"
                        >
                          {value}
                        </a>
                      ) : (
                        <p className="font-semibold text-slate-950 dark:text-white">{value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-slate-200/70 pt-4 dark:border-slate-800">
                <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">
                  Kết nối với tôi
                </p>
                <SocialLinks size="md" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-6">
              <h3 className="mb-6 text-lg font-bold tracking-tight text-slate-950 dark:text-white">
                Gửi lời nhắn
              </h3>
              <ContactForm />
            </CardContent>
          </Card>
        </div>
      </div>
    </Section>
  );
}
