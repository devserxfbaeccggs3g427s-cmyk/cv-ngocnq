import type { LucideIcon } from 'lucide-react';
import {
  BotMessageSquare,
  Briefcase,
  Code,
  Download,
  FileImage,
  FileText,
  Folder,
  GraduationCap,
  ListChecks,
  Mail,
  User,
} from 'lucide-react';

export type NavigationItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  description?: string;
};

export type WorkspaceFeature = NavigationItem & {
  title: string;
  eyebrow: string;
  cta: string;
  accent: 'blue' | 'emerald' | 'violet' | 'cyan';
};

export const portfolioNavItems: NavigationItem[] = [
  {
    href: '/#about',
    label: 'Giới thiệu',
    icon: User,
    description: 'Thông tin cá nhân và định hướng nghề nghiệp.',
  },
  {
    href: '/#experience',
    label: 'Kinh nghiệm',
    icon: Briefcase,
    description: 'Các mốc công việc và dự án đã triển khai.',
  },
  {
    href: '/#skills',
    label: 'Kỹ năng',
    icon: Code,
    description: 'Backend, full-stack, banking/payment và DevOps.',
  },
  {
    href: '/portfolio',
    label: 'Dự án',
    icon: Folder,
    description: 'Danh sách dự án nổi bật và chi tiết triển khai.',
  },
  {
    href: '/#education',
    label: 'Học vấn',
    icon: GraduationCap,
    description: 'Bằng cấp, chứng chỉ và nền tảng đào tạo.',
  },
  {
    href: '/#contact',
    label: 'Liên hệ',
    icon: Mail,
    description: 'Form liên hệ và các kênh kết nối.',
  },
];

export const headerPortfolioNavItems = portfolioNavItems.filter(
  (item) => item.href !== '/#education'
);

export const workspaceFeatures: WorkspaceFeature[] = [
  {
    href: '/skill-roadmap',
    label: 'Roadmap',
    title: 'Skill Roadmap',
    eyebrow: 'Ôn tập kỹ năng',
    description:
      'Theo dõi lộ trình học, trạng thái task, note, flashcard, quiz và minimap review.',
    icon: ListChecks,
    accent: 'emerald',
    cta: 'Mở roadmap',
  },
  {
    href: '/markdown-files',
    label: 'Markdown',
    title: 'Markdown Files',
    eyebrow: 'Kho tài liệu',
    description:
      'Quản lý thư mục/file Markdown, viết note dài và preview bằng renderer dùng chung.',
    icon: FileText,
    accent: 'blue',
    cta: 'Mở tài liệu',
  },
  {
    href: '/ai-context',
    label: 'AI Context',
    title: 'AI Context',
    eyebrow: 'Hỏi AI theo nguồn',
    description:
      'Chọn Markdown file hoặc roadmap task làm context rồi chat AI theo thread có lịch sử.',
    icon: BotMessageSquare,
    accent: 'violet',
    cta: 'Mở AI Context',
  },
  {
    href: '/workspace/backup',
    label: 'Backup',
    title: 'Workspace Backup',
    eyebrow: 'Dữ liệu cá nhân',
    description:
      'Export, import, reset localStorage hoặc commit backup JSON cho toàn bộ dữ liệu workspace.',
    icon: Download,
    accent: 'emerald',
    cta: 'Mở backup',
  },
  {
    href: '/ai-image-analysis',
    label: 'AI Ảnh',
    title: 'AI Image Analysis',
    eyebrow: 'Phân tích ảnh',
    description:
      'Upload screenshot, biểu đồ, bảng hoặc tài liệu để AI phân tích và lưu lịch sử.',
    icon: FileImage,
    accent: 'cyan',
    cta: 'Mở phân tích ảnh',
  },
];

export function isWorkspacePath(pathname: string) {
  return pathname === '/workspace' || workspaceFeatures.some((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));
}
