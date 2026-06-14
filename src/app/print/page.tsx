import type { Metadata } from 'next';
import { PrintResumeEditor } from '@/components/resume/PrintResumeEditor';
import { profile } from '@/data/profile';

export const metadata: Metadata = {
  title: `CV | ${profile.name}`,
  description: 'Bản CV tối ưu để in hoặc lưu PDF',
};

export default function PrintPage() {
  return <PrintResumeEditor />;
}
