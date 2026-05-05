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
  'Tài chính – Ngân hàng',
  'Bảo hiểm',
  'Nhật Bản',
  'Đồ án',
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
  // FEATURED PROJECT 1 – CMV MBBank
  // ---------------------------------------------------------------------------
  {
    id: 'proj-1',
    slug: 'cmv-mbbank',
    title: 'Collateral Management & Valuation (CMV) – MBBank',
    description:
      'Hệ thống thẩm định và quản lý tài sản thế chấp ngân hàng MBBank theo kiến trúc Microservices, tích hợp AI và Kafka.',
    longDescription: `Hệ thống CMV phục vụ nghiệp vụ thẩm định tài sản thế chấp tại MBBank. Được xây dựng theo kiến trúc Microservices và Event-Driven Architecture (EDA) với Apache Kafka, đảm bảo hiệu năng cao và khả năng mở rộng linh hoạt. Tích hợp AI Platform để tự động trích xuất dữ liệu từ hồ sơ tài liệu pháp lý và hình ảnh, phát hiện trùng lặp tài sản, giúp giảm 60% khối lượng nhập tay. API được quản lý qua Apigee Gateway với ECDH Encryption. ETL Pipeline dùng Pentaho PDI để đồng bộ dữ liệu sang CMV MBV (S600). Giám sát hệ thống với ELK Stack.`,
    thumbnail: '/projects/cmv-thumb.jpg',
    images: [],
    technologies: [
      'Spring Boot',
      'ReactJS',
      'Apache Kafka',
      'OracleDB',
      'Redis',
      'Apigee API Gateway',
      'Pentaho PDI',
      'ELK Stack',
      'Microservices',
      'Docker',
    ],
    category: 'Tài chính – Ngân hàng',
    role: 'Fullstack Developer',
    duration: '2023-05 – Nay',
    featured: true,
    highlights: [
      'Giảm 60% khối lượng nhập tay nhờ tích hợp AI trích xuất dữ liệu',
      'Kiến trúc Microservices + EDA (Kafka) đảm bảo hiệu năng cao',
      'Bảo mật API qua Apigee Gateway với ECDH Encryption',
      'ETL Pipeline Pentaho PDI đồng bộ dữ liệu liên hệ thống',
      'Giám sát real-time với ELK Stack',
    ],
  },

  // ---------------------------------------------------------------------------
  // FEATURED PROJECT 2 – MyBV Life
  // ---------------------------------------------------------------------------
  {
    id: 'proj-2',
    slug: 'mybv-life',
    title: 'MyBV Life – Nền tảng bảo hiểm trực tuyến',
    description:
      'Nền tảng bảo hiểm trực tuyến của Bảo Việt Nhân Thọ với API thanh toán Napas, hợp đồng điện tử và tích hợp hệ thống lõi IMS.',
    longDescription: `MyBV Life là nền tảng bảo hiểm trực tuyến của Bảo Việt Nhân Thọ. Xây dựng API nghiệp vụ tài chính – bảo hiểm bao gồm quy trình thanh toán qua Napas Gateway, quản lý hợp đồng điện tử (e-Contract), đồng bộ dữ liệu với hệ thống lõi IMS và đối tác DCS. Tối ưu hiệu năng truy vấn cơ sở dữ liệu và đảm bảo tính an toàn, toàn vẹn dữ liệu theo chuẩn ngành tài chính.`,
    thumbnail: '/projects/mybv-thumb.jpg',
    images: [],
    technologies: ['Spring Boot', 'AOP', 'Hibernate', 'Oracle'],
    category: 'Bảo hiểm',
    role: 'Backend Developer',
    duration: '2022-11 – 2023-05',
    featured: true,
    highlights: [
      'API thanh toán hợp đồng bảo hiểm qua Napas Gateway',
      'Thiết kế API hợp đồng điện tử (e-Contract) + đồng bộ IMS',
      'Tối ưu truy vấn DB, đảm bảo an toàn và bảo mật dữ liệu tài chính',
      'Đồng bộ hóa dữ liệu hóa đơn với hệ thống đối tác DCS',
    ],
  },

  // ---------------------------------------------------------------------------
  // FEATURED PROJECT — SHB Debit Collection Portal (Xử Lý Nợ Xấu)
  // ---------------------------------------------------------------------------
  {
    id: 'proj-7',
    slug: 'shb-debit-collection-portal',
    title: 'SHB Debit Collection Portal – Cổng Thông Tin Xử Lý Nợ Xấu',
    description:
      'Hệ thống quản lý và đấu giá tài sản xử lý nợ trên nền tảng Microservices, phục vụ quy trình xử lý nợ xấu tại Ngân hàng SHB.',
    longDescription: `SHB Debit Collection Portal là hệ thống quản lý & đấu giá tài sản xử lý nợ xấu được xây dựng trên nền tảng Microservices với Spring Cloud. Hệ thống cung cấp Dynamic Filter Engine dựa trên JPA Specification Pattern hỗ trợ tìm kiếm đa tiêu chí với cấu hình filter động từ DB. Quy trình phê duyệt Maker-Checker (4 mắt) cho quản lý tài sản & thông báo đấu giá, đảm bảo Separation of Duties. Cơ chế bảo mật 3 lớp cho Lead Generation: Rate Limiting (Redis) + Google reCAPTCHA v3 + Duplicate Prevention. Hệ thống cũng có tính năng Dynamic Field Display dùng Java Reflection, hiển thị trường linh hoạt theo từng loại tài sản (BĐS, PTVT, MMTB).`,
    thumbnail: '/projects/shb-debit-thumb.jpg',
    images: [],
    technologies: [
      'Java 17',
      'Spring Boot 3',
      'Spring Cloud',
      'Spring Cloud Gateway',
      'PostgreSQL',
      'Redis',
      'Keycloak OIDC',
      'OpenFeign',
      'Eureka',
      'MinIO',
      'Apache POI',
      'iText',
      'MapStruct',
      'Docker',
      'Kubernetes',
      'GitLab CI/CD',
    ],
    category: 'Tài chính – Ngân hàng',
    role: 'Backend Developer',
    duration: '2025-11 – 2026-01',
    featured: true,
    highlights: [
      'Dynamic Filter Engine với JPA Specification Pattern, hỗ trợ tìm kiếm đa tiêu chí',
      'Quy trình phê duyệt Maker-Checker (4 mắt) cho quản lý tài sản & thông báo đấu giá',
      'Bảo mật 3 lớp: Rate Limiting (Redis) + Google reCAPTCHA v3 + Duplicate Prevention',
      'Kiến trúc Microservices: Spring Cloud Gateway, Eureka, OpenFeign',
      'Dynamic Field Display với Java Reflection, hiển thị linh hoạt theo loại tài sản',
      'Redis Cache danh mục & banner; Atomic SQL UPDATE xử lý đồng thời lượt xem',
    ],
  },

  // ---------------------------------------------------------------------------
  // FEATURED PROJECT — SHB SAHA Mobile Banking Cambodia
  // ---------------------------------------------------------------------------
  {
    id: 'proj-6',
    slug: 'shb-saha-mobile-banking-cambodia',
    title: 'SHB SAHA Mobile Banking – Campuchia',
    description:
      'Nền tảng ngân hàng di động phục vụ thị trường Campuchia với 3 microservices Spring Boot, hỗ trợ 3 ngôn ngữ và 2 loại tiền tệ, tích hợp Core Banking Intellect.',
    longDescription: `SHB SAHA Mobile Banking Cambodia là nền tảng ngân hàng di động phục vụ thị trường Campuchia, hỗ trợ 3 ngôn ngữ (tiếng Anh, tiếng Việt, tiếng Khmer) và 2 loại tiền tệ (USD, KHR). Hệ thống được phân tách thành 3 microservices: Identity Service (xác thực JWT + RSA-4096, quản lý session Redis, Device Trust, OTP SMS), Account Service (quản lý tài khoản CASA/tiết kiệm/vay, người thụ hưởng, tích hợp Core Banking Intellect qua Oracle Stored Procedures), và Fund Transfer Service (chuyển khoản nội bộ SELF/INTRA với Two-Phase Commit, tích hợp Core Banking TCP cho bút toán tài chính). Hệ thống validation phân tầng 4 lớp, bảo mật đa lớp với JWT HS256, RSA-4096, rate limiting OTP, device fingerprinting và password policy.`,
    thumbnail: '/projects/shb-saha-thumb.jpg',
    images: [],
    technologies: [
      'Java 17',
      'Spring Boot 3',
      'Spring Security',
      'Oracle DB',
      'PL/SQL',
      'Redis',
      'JWT (Nimbus JOSE)',
      'RSA-4096',
      'SMS Gateway',
      'Docker',
      'Maven',
      'GitLab CI/CD',
      'i18n (EN/VI/KM)',
    ],
    category: 'Tài chính – Ngân hàng',
    role: 'Backend Developer',
    duration: '2026-01 – 2026-04',
    featured: true,
    highlights: [
      '3 Microservices: Identity, Account, Fund Transfer với Spring Boot 3',
      'Xác thực JWT + RSA-4096, session Redis sliding expiration, Device Trust fingerprinting',
      'Tích hợp Core Banking Intellect qua Oracle Stored Procedures & TCP',
      'Two-Phase Commit Pattern cho chuyển khoản nội bộ SELF/INTRA',
      'Validation phân tầng 4 lớp + i18n đa ngôn ngữ động (EN/VI/KM)',
      'Bảo mật đa lớp: JWT HS256, RSA-4096, rate limiting, password policy',
    ],
  },

  // ---------------------------------------------------------------------------
  // PROJECT 3 – Veritas
  // ---------------------------------------------------------------------------
  {
    id: 'proj-3',
    slug: 'veritas-clinic',
    title: 'Veritas – Hệ thống quản lý phòng khám thẩm mỹ',
    description:
      'Hệ thống quản lý phòng khám thẩm mỹ cho khách hàng Nhật Bản: đặt lịch khám, phân công bác sĩ, quản lý lịch hẹn.',
    thumbnail: '/projects/veritas-thumb.jpg',
    images: [],
    technologies: ['Spring Boot', 'MyBatis', 'PostgreSQL', 'JSP', 'JavaScript', 'jQuery'],
    category: 'Nhật Bản',
    role: 'Fullstack Developer',
    duration: '2022-03 – 2022-11',
    featured: false,
    highlights: [
      'Module đặt lịch khám, phân công bác sĩ và quản lý lịch hẹn',
      'Tối ưu SQL performance theo yêu cầu khách hàng Nhật Bản',
      'Làm việc theo chuẩn Agile – kỷ luật và chính xác kiểu Nhật',
    ],
  },

  // ---------------------------------------------------------------------------
  // PROJECT 4 – Hywork
  // ---------------------------------------------------------------------------
  {
    id: 'proj-4',
    slug: 'hywork',
    title: 'Hywork – Hệ thống đặt chỗ làm việc',
    description:
      'Hệ thống đặt chỗ làm việc và đồng bộ nhân sự từ AMIS cho khách hàng Nhật Bản.',
    thumbnail: '/projects/hywork-thumb.jpg',
    images: [],
    technologies: ['Spring Boot', 'Hibernate', 'Thymeleaf', 'MySQL'],
    category: 'Nhật Bản',
    role: 'Fullstack Developer',
    duration: '2021-11 – 2022-03',
    featured: false,
    highlights: [
      'Tính năng quản lý chỗ ngồi và đồng bộ nhân sự từ AMIS',
      'Báo cáo thống kê sử dụng (Export Excel) phục vụ quản lý',
    ],
  },

  // ---------------------------------------------------------------------------
  // PROJECT 5 – Đồ án tốt nghiệp
  // ---------------------------------------------------------------------------
  {
    id: 'proj-5',
    slug: 'hr-management-system',
    title: 'Website Quản lý Nhân sự – Đồ án tốt nghiệp ĐH',
    description:
      'Hệ thống quản lý nhân sự xây dựng theo kiến trúc Microservices với Spring Boot, ReactJS, Kafka, Redis và Docker.',
    thumbnail: '/projects/hrms-thumb.jpg',
    images: [],
    technologies: [
      'Spring Boot',
      'ReactJS',
      'OracleDB',
      'Apache Kafka',
      'Redis',
      'Docker',
      'Microservices',
    ],
    category: 'Đồ án',
    role: 'Tác giả',
    duration: '2024 – 2025',
    featured: true,
    highlights: [
      'Kiến trúc Microservices + Kafka + Redis',
      'Containerized bằng Docker',
      'Đồ án tốt nghiệp Đại học Giao thông vận tải',
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
