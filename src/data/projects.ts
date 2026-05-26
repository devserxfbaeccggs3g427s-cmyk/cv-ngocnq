/**
 * =============================================================================
 * PROJECTS DATA - Portfolio Projects
 * =============================================================================
 *
 * AI CUSTOMIZATION INSTRUCTIONS:
 * This file contains portfolio projects displayed in the Portfolio section.
 *
 * TO CUSTOMIZE:
 * 1. Replace example projects with your actual projects
 * 2. Mark your best projects as featured (featured: true)
 * 3. Include project images if available
 * 4. Add live demo and GitHub links where applicable
 *
 * TO ADD A NEW PROJECT:
 * Copy an existing entry and modify all fields. Make sure to:
 * - Use a unique ID (e.g., 'proj-6', 'proj-7')
 * - Create a URL-friendly slug (lowercase, hyphens, no spaces)
 * - Add at least a thumbnail image
 *
 * PROJECT CATEGORIES:
 * Choose from existing categories or add new ones to projectCategories array.
 *
 * IMAGES:
 * - Store images in /public/projects/
 * - Use paths like '/projects/project-name.jpg'
 * - Recommended size: 1200x630 for thumbnails
 * =============================================================================
 */

/**
 * Project entry type definition
 */
export interface Project {
  /** Unique identifier (e.g., 'proj-1', 'proj-2') */
  id: string;

  /**
   * URL-friendly slug for the project page
   * Format: lowercase, hyphens instead of spaces
   * Example: 'my-awesome-project'
   */
  slug: string;

  /** Project title */
  title: string;

  /**
   * Short description (1-2 sentences)
   * Displayed in project cards
   */
  description: string;

  /**
   * Detailed description (optional)
   * Displayed on the project detail page
   */
  longDescription?: string;

  /**
   * Thumbnail image path
   * - Use '/projects/thumb.jpg' for local image
   * - Use full URL for external image
   */
  thumbnail: string;

  /**
   * Additional project images (optional)
   * For project detail page gallery
   */
  images: string[];

  /**
   * Technologies used in the project
   * List frameworks, languages, and tools
   */
  technologies: string[];

  /**
   * Project category
   * Must match one from projectCategories array
   */
  category: string;

  /**
   * Your role in the project
   * Examples: "Lead Developer", "Frontend Developer", "Solo Project"
   */
  role: string;

  /**
   * Project duration
   * Examples: "3 months", "6 weeks", "Ongoing"
   */
  duration: string;

  /**
   * Live project URL (optional)
   * Link to deployed project
   */
  liveUrl?: string;

  /**
   * GitHub repository URL (optional)
   * Link to source code
   */
  githubUrl?: string;

  /**
   * Is this a featured project?
   * Featured projects are highlighted on the homepage
   */
  featured: boolean;

  /**
   * Key highlights/achievements
   * Use metrics when possible (numbers, percentages)
   */
  highlights: string[];
}

/**
 * =============================================================================
 * PROJECT CATEGORIES - CUSTOMIZE BELOW
 * =============================================================================
 *
 * Categories for filtering projects.
 * 'All' is required and should always be first.
 */
export const projectCategories: string[] = [
  'All',
  'HRM & Chấm công',
  'Kiểm soát truy cập',
  'Quản lý khách',
  'Đặt phòng & Sự kiện',
];

/**
 * =============================================================================
 * YOUR PROJECTS - CUSTOMIZE BELOW
 * =============================================================================
 *
 * Replace these example projects with your actual projects.
 * Mark your best 3-4 projects as featured.
 */
export const projects: Project[] = [
  // ---------------------------------------------------------------------------
  // PROJECT 1 – FaceX Core
  // ---------------------------------------------------------------------------
  {
    id: 'proj-1',
    slug: 'facex-core',
    title: 'FaceX Core – Hệ thống quản lý nhân sự & nhận diện khuôn mặt',
    description:
      'Hệ thống core quản lý nhân sự toàn diện, cấu hình ca làm việc, đồng bộ dữ liệu sinh trắc học nhận diện khuôn mặt đa nền tảng (Web, iOS, Android, Tablet).',
    longDescription: `FaceX Core (Version 2 & 3) là hệ thống quản lý nhân sự toàn diện bao gồm quản lý dữ liệu người dùng, cấu hình ca làm việc đa dạng (ca hành chính, ca gãy, ca linh hoạt), quản lý thiết bị ngoại vi và đồng bộ dữ liệu sinh trắc học nhận diện khuôn mặt theo thời gian thực. Team 14 thành viên. Kiểm thử toàn diện luồng đăng ký & đồng bộ khuôn mặt từ Mobile/Web đến Server, luồng cấu hình ca & phân ca nhân sự (Workshift Plan), tính toán bảng công (Timesheet) và xử lý thiết bị offline. API testing bằng Postman và đối soát dữ liệu với MySQL.`,
    thumbnail: '/projects/facex-thumb.jpg',
    images: [],
    technologies: [
      'Redmine',
      'Postman',
      'MySQL Workbench',
      'Google Sheets',
      'Figma',
      'Web Admin',
      'iOS',
      'Android',
      'Tablet',
    ],
    category: 'HRM & Chấm công',
    role: 'QA Engineer / Manual Tester',
    duration: '2022-07 – 2024-06',
    featured: true,
    highlights: [
      'Kiểm thử chu trình đồng bộ khuôn mặt khép kín: từ import nhân sự → đăng ký Face → Sync Real-time xuống thiết bị',
      'Kiểm thử luồng thiết lập ca làm việc đa dạng (ca hành chính, ca gãy, ca linh hoạt) và Workshift Plan',
      'Xác thực tính chính xác bảng công (Timesheet) qua đối soát dữ liệu MySQL',
      'Kiểm thử kịch bản thiết bị mất kết nối mạng (Offline) và cơ chế đồng bộ lại',
      'Team 14 thành viên, vận hành theo mô hình Agile/Scrum',
    ],
  },

  // ---------------------------------------------------------------------------
  // PROJECT 2 – SMC
  // ---------------------------------------------------------------------------
  {
    id: 'proj-2',
    slug: 'smc-attendance-parking',
    title: 'SMC – Hệ thống chấm công diện rộng & Bãi xe thông minh (ParkingX)',
    description:
      'Hệ thống quản lý nhân sự quy mô lớn, kết nối đồng thời nhiều thiết bị ngoại vi và tích hợp kiểm soát bãi xe thông minh (xác thực khuôn mặt + biển số xe, đóng/mở barie tự động).',
    longDescription: `SMC là hệ thống quản lý chấm công diện rộng, kết nối đồng thời số lượng lớn thiết bị ngoại vi. Kiểm thử tích hợp hệ thống bãi xe thông minh ParkingX: xác thực kép khuôn mặt + biển số xe, kích hoạt lệnh điều khiển phần cứng mở barie tự động. Kiểm thử Visitor Management (đăng ký, import khách, phê duyệt tự động) và Access Control (gán quyền truy cập thiết bị/phòng theo nhóm nhân sự, giới hạn khung giờ ra vào). Trace data để xác minh tính chính xác phân quyền.`,
    thumbnail: '/projects/smc-thumb.jpg',
    images: [],
    technologies: [
      'Redmine',
      'Postman',
      'MySQL Workbench',
      'AnyDesk',
      'Google Sheets',
      'Web Admin',
      'iOS',
      'Android',
      'Tablet',
    ],
    category: 'Kiểm soát truy cập',
    role: 'QA Engineer / Manual Tester',
    duration: '2023-01 – 2023-12',
    featured: true,
    highlights: [
      'Kiểm thử tích hợp hệ thống ParkingX: xác thực kép khuôn mặt + biển số xe + điều khiển barie tự động',
      'Kiểm thử Access Control: cấu hình gán quyền truy cập theo nhóm nhân sự và Time-frame Access Rule',
      'Trace data hệ thống kiểm soát truy cập, xác minh tính chính xác và đồng bộ phân quyền ra vào',
      'Kiểm thử Visitor Management: đăng ký, import khách và phê duyệt tự động',
      'Phát hiện lỗi sai lệch dữ liệu phân quyền trong luồng Sync User/Face quy mô lớn',
    ],
  },

  // ---------------------------------------------------------------------------
  // PROJECT 3 – TIA
  // ---------------------------------------------------------------------------
  {
    id: 'proj-3',
    slug: 'tia-access-control',
    title: 'TIA – Kiểm soát truy cập & Map ca thông minh (Sân bay TSN)',
    description:
      'Hệ thống quản lý nhân sự kết hợp ca làm việc thông minh và giám sát an ninh tại các khu vực trọng yếu. Triển khai thực tế tại Cảng Hàng không Tân Sơn Nhất.',
    longDescription: `TIA là hệ thống quản lý hồ sơ nhân viên kết hợp ánh xạ ca làm việc thông minh và giám sát an ninh tại các khu vực trọng yếu của doanh nghiệp, triển khai thực tế tại Cảng Hàng không Tân Sơn Nhất (TSN). Kiểm thử Employee Management, Attendance, Workshift Plan, Timesheet. Đặc biệt kiểm thử thuật toán tự động ánh xạ ca làm việc thông minh trong ngày và xử lý ca qua đêm (Overnight Shift). Phát hiện và giải quyết lỗi tính toán sai lệch giờ công của các ca đặc thù, đảm bảo Timesheet chính xác 100%.`,
    thumbnail: '/projects/tia-thumb.jpg',
    images: [],
    technologies: [
      'Redmine',
      'Postman',
      'MySQL Workbench',
      'UltraViewer',
      'Google Sheets',
      'Web Admin',
      'iOS',
      'Android',
    ],
    category: 'HRM & Chấm công',
    role: 'QA Engineer / Manual Tester',
    duration: '2023-06 – 2024-06',
    featured: true,
    highlights: [
      'Kiểm thử triệt để thuật toán ánh xạ ca thông minh tự động và xử lý ca qua đêm (Overnight Shift)',
      'Đảm bảo bảng chấm công (Timesheet) chính xác 100% sau khi giải quyết lỗi tính giờ công đặc thù',
      'Kiểm thử Employee Management và Workshift Plan tại môi trường triển khai thực tế – Sân bay TSN',
      'Đối soát dữ liệu SQL để xác minh tính chính xác bản ghi Attendance và Timesheet',
    ],
  },

  // ---------------------------------------------------------------------------
  // PROJECT 4 – HOYA
  // ---------------------------------------------------------------------------
  {
    id: 'proj-4',
    slug: 'hoya-approval-workflow',
    title: 'HOYA – Chấm công & Cấu hình phê duyệt đa tầng',
    description:
      'Giải pháp quản lý chấm công và kiểm soát an ninh nâng cao, tích hợp cơ chế phê duyệt đa cấp đặc thù bao gồm quyền phê duyệt vượt cấp (Skip-level approval).',
    longDescription: `HOYA là hệ thống quản lý chấm công và kiểm soát an ninh nâng cao. Kiểm thử Auto User Access Rule theo cấu trúc mã nhân viên, Time-frame Access Rule cho cá nhân/phòng ban, tích hợp Webhook truyền tải Log chấm công theo thời gian thực. Đặc biệt kiểm thử workflow phê duyệt đa tầng phức tạp (luồng song song/tuần tự – AND/OR) và tính năng phê duyệt vượt cấp (Skip-level approval) cho 10+ loại yêu cầu khác nhau (nghỉ phép, đăng ký khuôn mặt, truy cập, khách, làm việc từ xa...).`,
    thumbnail: '/projects/hoya-thumb.jpg',
    images: [],
    technologies: [
      'Redmine',
      'Postman',
      'MySQL Workbench',
      'UltraViewer',
      'Google Sheets',
      'Web Admin',
      'iOS',
      'Android',
    ],
    category: 'Kiểm soát truy cập',
    role: 'QA Engineer / Manual Tester',
    duration: '2023-06 – 2024-03',
    featured: false,
    highlights: [
      'Xây dựng kịch bản kiểm thử toàn diện cho workflow phê duyệt đa tầng phức tạp (AND/OR – song song/tuần tự)',
      'Kiểm thử thành công Skip-level approval hoạt động mượt mà cho hơn 10 loại yêu cầu',
      'Kiểm thử Auto User Access Rule và Time-frame Access Rule theo cá nhân/phòng ban',
      'Xác thực tích hợp Webhook: Log chấm công truyền tải chính xác theo thời gian thực',
    ],
  },

  // ---------------------------------------------------------------------------
  // PROJECT 5 – VietJet Air
  // ---------------------------------------------------------------------------
  {
    id: 'proj-5',
    slug: 'vietjet-visitor-meeting',
    title: 'VietJet Air – Quản lý phòng họp & Check-in khách tự động',
    description:
      'Hệ thống quản lý nhân sự nội bộ kết hợp đặt lịch phòng họp thông minh, quản lý thông tin khách (Visitor) và Tablet Check-in tự động tại sảnh tòa nhà.',
    longDescription: `VietJet Air là hệ thống quản lý nhân sự nội bộ kết hợp điều phối đặt lịch phòng họp thông minh và quản lý khách tại sảnh. Kiểm thử Meeting Management (đặt phòng, hiển thị lịch trên Tablet), Visitor Management (đăng ký lịch trình khách), Tablet Check-in tự động (quét QR/CCCD/Passport) và Delivery Management. Kết quả nổi bật: giảm thời gian check-in xuống dưới 10 giây/lượt, ngăn chặn 100% tình trạng trùng lịch phòng họp (Overbooking).`,
    thumbnail: '/projects/vietjet-thumb.jpg',
    images: [],
    technologies: [
      'Redmine',
      'Postman',
      'MySQL Workbench',
      'UltraViewer',
      'Google Sheets',
      'Web Admin',
      'iOS',
      'Android',
      'Tablet',
    ],
    category: 'Quản lý khách',
    role: 'QA Engineer / Manual Tester',
    duration: '2024-06 – 2025-06',
    featured: true,
    highlights: [
      'Kiểm thử Tablet Check-in tự động (QR/CCCD/Passport) – giảm thời gian check-in xuống dưới 10 giây/lượt',
      'Đảm bảo đồng bộ lịch phòng họp real-time trên Tablet, ngăn chặn 100% xung đột Overbooking',
      'Kiểm thử Visitor Management: đăng ký, import khách, phê duyệt tự động và quét định danh',
      'Kiểm thử Meeting Management: đặt phòng, xem lịch trực quan và Delivery Management nội bộ',
    ],
  },
];

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get featured projects
 */
export function getFeaturedProjects(): Project[] {
  return projects.filter((project) => project.featured);
}

/**
 * Get project by slug
 */
export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((project) => project.slug === slug);
}

/**
 * Get projects by category
 */
export function getProjectsByCategory(category: string): Project[] {
  if (category === 'All') return projects;
  return projects.filter((project) => project.category === category);
}

/**
 * Get all unique technologies used across projects
 */
export function getAllProjectTechnologies(): string[] {
  const techSet = new Set<string>();
  projects.forEach((project) => {
    project.technologies.forEach((tech) => techSet.add(tech));
  });
  return Array.from(techSet).sort();
}

/**
 * Get project count by category
 */
export function getProjectCountByCategory(): Record<string, number> {
  const counts: Record<string, number> = { All: projects.length };

  projectCategories.slice(1).forEach((category) => {
    counts[category] = projects.filter((p) => p.category === category).length;
  });

  return counts;
}

/**
 * Search projects by title, description, or technology
 */
export function searchProjects(query: string): Project[] {
  const lowerQuery = query.toLowerCase();
  return projects.filter(
    (project) =>
      project.title.toLowerCase().includes(lowerQuery) ||
      project.description.toLowerCase().includes(lowerQuery) ||
      project.technologies.some((tech) =>
        tech.toLowerCase().includes(lowerQuery)
      )
  );
}

/**
 * Get related projects (same category, excluding current)
 */
export function getRelatedProjects(
  currentSlug: string,
  limit: number = 3
): Project[] {
  const current = getProjectBySlug(currentSlug);
  if (!current) return [];

  return projects
    .filter((p) => p.slug !== currentSlug && p.category === current.category)
    .slice(0, limit);
}
