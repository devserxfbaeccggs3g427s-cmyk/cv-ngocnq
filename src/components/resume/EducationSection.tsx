'use client';

import { motion } from 'framer-motion';
import { GraduationCap, MapPin, Award } from 'lucide-react';
import { education } from '@/data/education';
import { Section, Badge, Card, CardContent } from '@/components/ui';

export function EducationSection() {
  return (
    <Section id="education" title="Học vấn" subtitle="Nền tảng đào tạo và chuyên ngành">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2">
        {education.map((edu, index) => (
          <motion.div
            key={edu.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            viewport={{ once: true }}
          >
            <Card hover className="h-full">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 text-white shadow-lg shadow-blue-600/20">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold tracking-tight text-slate-950 dark:text-white">
                      {edu.degree} - {edu.field}
                    </h3>
                    <p className="font-semibold text-blue-700 dark:text-blue-300">
                      {edu.school}
                    </p>
                    <div className="mt-2 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                      <MapPin className="w-4 h-4" />
                      {edu.location} · {edu.startYear} - {edu.endYear}
                    </div>
                    {edu.gpa && (
                      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                        Điểm: {edu.gpa}
                      </p>
                    )}
                    {edu.honors && edu.honors.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {edu.honors.map((honor) => (
                          <Badge key={honor} variant="success" size="sm">
                            <Award className="w-3 h-3 mr-1" />
                            {honor}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}
