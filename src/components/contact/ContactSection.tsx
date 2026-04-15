import { Mail, Phone, MapPin, Calendar } from 'lucide-react';
import { profile } from '@/data/profile';
import { Section, Card, CardContent } from '@/components/ui';
import { ContactForm } from './ContactForm';
import { SocialLinks } from './SocialLinks';

export function ContactSection() {
  const contactInfo = [
    { icon: Mail, label: 'Email', value: profile.email, href: `mailto:${profile.email}` },
    { icon: Phone, label: 'Phone', value: profile.phone, href: `tel:${profile.phone}` },
    { icon: MapPin, label: 'Location', value: profile.location },
    { icon: Calendar, label: 'Availability', value: 'Open to opportunities' },
  ];

  return (
    <Section id="contact" title="Get In Touch" subtitle="Let's discuss your next project">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contact Info */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-6 space-y-6">
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                Contact Information
              </h3>

              <div className="space-y-4">
                {contactInfo.map(({ icon: Icon, label, value, href }) => (
                  <div key={label} className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
                      {href ? (
                        <a
                          href={href}
                          className="font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                          {value}
                        </a>
                      ) : (
                        <p className="font-medium text-gray-900 dark:text-white">{value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                  Connect with me
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
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-6">
                Send a Message
              </h3>
              <ContactForm />
            </CardContent>
          </Card>
        </div>
      </div>
    </Section>
  );
}
