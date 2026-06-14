import { profile } from '@/data/profile';
import { experience } from '@/data/experience';
import {
  skills,
  skillCategories,
  getLanguageLevelLabel,
  getSkillCategoryLabel,
  getSkillsByCategory,
  languages,
} from '@/data/skills';
import { education, certifications } from '@/data/education';
import { formatMonthYear } from '@/lib/date';

// Helper to format dates
export function formatDate(date: string): string {
  return formatMonthYear(date);
}

// Generate plain text resume for simple downloads
export function generateTextResume(): string {
  const lines: string[] = [];
  
  // Header
  lines.push(profile.name.toUpperCase());
  lines.push(profile.title);
  lines.push('');
  lines.push(`Email: ${profile.email} | Số điện thoại: ${profile.phone}`);
  lines.push(`Địa điểm: ${profile.location} | Trang cá nhân: ${profile.website || ''}`);
  lines.push('');
  lines.push('═'.repeat(60));
  lines.push('');
  
  // Summary
  lines.push('TÓM TẮT CHUYÊN MÔN');
  lines.push('-'.repeat(40));
  lines.push(profile.summary);
  lines.push('');
  
  // Experience
  lines.push('KINH NGHIỆM LÀM VIỆC');
  lines.push('-'.repeat(40));
  experience.forEach((exp) => {
    lines.push(`${exp.title} tại ${exp.company}`);
    lines.push(`${formatDate(exp.startDate)} - ${exp.current ? 'Hiện tại' : formatDate(exp.endDate!)}`);
    lines.push(`${exp.location} | ${exp.type}`);
    exp.achievements.forEach((achievement) => {
      lines.push(`  • ${achievement}`);
    });
    lines.push('');
  });
  
  // Skills
  lines.push('KỸ NĂNG');
  lines.push('-'.repeat(40));
  skillCategories.forEach((category) => {
    const categorySkills = getSkillsByCategory(category);
    if (categorySkills.length > 0) {
      lines.push(`${getSkillCategoryLabel(category)}: ${categorySkills.map((s) => s.name).join(', ')}`);
    }
  });
  lines.push('');
  
  // Education
  lines.push('HỌC VẤN');
  lines.push('-'.repeat(40));
  education.forEach((edu) => {
    lines.push(`${edu.degree} - ${edu.field}`);
    lines.push(`${edu.school}, ${edu.location} (${edu.endYear})`);
    if (edu.gpa) lines.push(`Điểm: ${edu.gpa}`);
    lines.push('');
  });
  
  // Certifications
  lines.push('CHỨNG CHỈ');
  lines.push('-'.repeat(40));
  certifications.forEach((cert) => {
    lines.push(`${cert.name} - ${cert.issuer} (${formatDate(cert.date)})`);
  });
  lines.push('');
  
  // Languages
  lines.push('NGÔN NGỮ');
  lines.push('-'.repeat(40));
  lines.push(languages.map((lang) => `${lang.name} (${getLanguageLevelLabel(lang.level)})`).join(', '));
  
  return lines.join('\n');
}

// Export resume data as JSON for external PDF services
export function getResumeData() {
  return {
    profile,
    experience,
    skills,
    skillCategories,
    education,
    certifications,
    languages,
  };
}
