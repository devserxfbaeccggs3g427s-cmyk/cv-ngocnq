'use client';

import { motion } from 'framer-motion';
import { Award, ExternalLink, Calendar } from 'lucide-react';
import { certifications } from '@/data/education';
import { Section, Card, CardContent, Badge } from '@/components/ui';
import { formatMonthYear } from '@/lib/date';

export function CertificationsSection() {
  return (
    <Section title="Chứng chỉ" subtitle="Chứng chỉ và năng lực bổ trợ">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {certifications.map((cert, index) => (
          <motion.div
            key={cert.id}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            viewport={{ once: true }}
          >
            <Card hover className="h-full">
              <CardContent className="p-6 flex flex-col h-full">
                <div className="mb-4 flex items-start gap-3">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-600/20">
                    <Award className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold leading-tight text-slate-950 dark:text-white">
                      {cert.name}
                    </h3>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                      {cert.issuer}
                    </p>
                  </div>
                </div>

                <div className="mb-4 flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Cấp {formatMonthYear(cert.date)}</span>
                  {cert.expirationDate && (
                    <span>· Hết hạn {formatMonthYear(cert.expirationDate)}</span>
                  )}
                </div>

                <div className="mt-auto">
                  {cert.credentialUrl ? (
                    <a
                      href={cert.credentialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm font-bold text-blue-700 transition hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-200"
                    >
                      Xem chứng chỉ
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  ) : (
                    cert.credentialId && (
                      <Badge variant="secondary" size="sm">
                        ID: {cert.credentialId}
                      </Badge>
                    )
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}
