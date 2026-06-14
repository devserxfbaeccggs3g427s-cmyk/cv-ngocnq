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
  'Payment Gateway',
  'Bảo hiểm',
  'Nhật Bản',
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
  // FEATURED PROJECT 1 – GOV Payment Service
  // ---------------------------------------------------------------------------
  {
    id: 'proj-1',
    slug: 'gov-payment-service-c12',
    title: 'GOV Payment Service – Cổng thanh toán Dịch vụ công',
    description:
      'Cổng thanh toán trung gian giữa Cổng Dịch vụ công Quốc gia và SHB, xử lý tạo giao dịch, QR, truy vấn, hoàn tiền, chi hộ và đối soát.',
    longDescription: `GOV Payment Service là dịch vụ backend trung gian phục vụ thanh toán dịch vụ công giữa hệ thống TTTT/Cổng Dịch vụ công Quốc gia và ngân hàng SHB. Hệ thống tiếp nhận yêu cầu thanh toán, tạo giao dịch, sinh tài khoản alias, sinh VietQR/Napas QR, truy vấn trạng thái, tra cứu biên lai, vấn tin tài khoản, hoàn tiền, chi hộ, đối soát và xử lý lại các Kafka message lỗi. Kiến trúc được tái cấu trúc theo facade + use-case services, tách chiến lược chuyển tiền cho SHB nội bộ, Napas và Citad/Kho bạc, đồng thời áp dụng AOP logging, MDC request tracing, typed configuration và cơ chế tích hợp phòng thủ cho ESB/Core Banking.`,
    thumbnail: '/projects/gov-payment-thumb.jpg',
    images: [],
    technologies: [
      'Java 17',
      'Spring Boot 3',
      'Spring Web MVC',
      'Oracle DB',
      'Spring Data JPA',
      'JdbcTemplate',
      'Kafka',
      'RestTemplate',
      'ESB Integration',
      'Napas/VietQR',
      'JWT',
      'AOP Logging',
      'Actuator',
      'JUnit 5',
      'Mockito',
      'Maven',
    ],
    category: 'Payment Gateway',
    role: 'Lập trình viên Backend',
    duration: '05-2026 – Nay',
    featured: true,
    highlights: [
      'Implement các API thanh toán theo spec TTTT: tạo giao dịch/QR, check status, receipt, bank inquiry, refund, disbursement và reconciliation',
      'Thiết kế idempotency bằng request ID, duplicate bill prevention, alias account generation bằng Oracle sequence và unique constraint',
      'Tích hợp ESB/Core Banking/Napas/Ebank/Signature Service, xử lý JWT token cache, service signature và request/response signing',
      'Áp dụng Strategy + Template Method cho transfer channel: SHB nội bộ, Napas và Citad/Kho bạc; hỗ trợ reversal khi lỗi tích hợp',
      'Xây dựng cơ chế xử lý lại Kafka message lỗi, AOP API logging, MDC correlation ID, masking dữ liệu nhạy cảm và Actuator health endpoints',
    ],
  },

  // ---------------------------------------------------------------------------
  // FEATURED PROJECT 2 – SHB SAHA Mobile Banking Cambodia
  // ---------------------------------------------------------------------------
  {
    id: 'proj-2',
    slug: 'shb-saha-mobile-banking-cambodia',
    title: 'SHB SAHA Mobile Banking – Campuchia',
    description:
      'Nền tảng Mobile Banking cho thị trường Campuchia với 3 microservices Spring Boot: Identity, Account và Fund Transfer.',
    longDescription: `SHB SAHA Mobile Banking Campuchia là hệ thống backend mobile banking phục vụ thị trường Campuchia. Hệ thống gồm Identity Service, Account Service và Fund Transfer Service, xử lý đăng nhập, quản lý thiết bị, OTP/SMS, session Redis, tài khoản CASA, người thụ hưởng, lịch sử giao dịch, tỷ giá và chuyển tiền. Backend tích hợp Oracle Core Banking/EBANK qua stored procedures, REF CURSOR mapping, TCP Core Banking và HTTP client liên service. Hệ thống hỗ trợ đa ngôn ngữ tiếng Anh/Khmer/Việt và nghiệp vụ tiền tệ USD/KHR.`,
    thumbnail: '/projects/shb-saha-thumb.jpg',
    images: [],
    technologies: [
      'Java 17',
      'Spring Boot 3',
      'Spring Security',
      'Oracle DB',
      'PL/SQL',
      'JdbcTemplate',
      'Redis',
      'JWT (Nimbus JOSE)',
      'RSA',
      'SMS OTP',
      'Spring Integration TCP',
      'MapStruct',
      'Docker',
      'Maven',
      'OpenAPI',
      'i18n EN/KM/VI',
    ],
    category: 'Tài chính – Ngân hàng',
    role: 'Lập trình viên Backend',
    duration: '01-2026 – 06-2026',
    featured: true,
    highlights: [
      'Phát triển authentication/session/device flow với JWT, refresh token, Redis session, device binding, lockout và trusted-device OTP',
      'Xây dựng OTP/SMS service cho xác thực thiết bị và xác nhận chuyển tiền, có expiry, retry attempt, resend rate limit và masked logging',
      'Tích hợp Oracle Core Banking/EBANK bằng stored procedures, REF CURSOR, reusable executor và mapping response chuẩn banking',
      'Thiết kế fund transfer processing bằng Strategy pattern cho self-transfer và intra-bank transfer, gồm validate account, FX, OTP và Core posting',
      'Chuẩn hóa error contract, localized messages EN/KM/VI, DTO mapping bằng MapStruct và cache Redis cho dữ liệu ngân hàng',
    ],
  },

  // ---------------------------------------------------------------------------
  // FEATURED PROJECT 3 – SHB Debit Collection Portal
  // ---------------------------------------------------------------------------
  {
    id: 'proj-3',
    slug: 'shb-debit-collection-portal',
    title: 'SHB Debit Collection Portal – Xử Lý Nợ & Thanh Lý Tài Sản',
    description:
      'Nền tảng microservices phục vụ nghiệp vụ xử lý nợ, thanh lý tài sản và quản trị nội dung website của SHB.',
    longDescription: `SHB Debit Collection Portal là hệ thống microservices phục vụ nghiệp vụ xử lý nợ và thanh lý tài sản. Hệ thống cung cấp API public cho khách hàng tra cứu tài sản, đăng ký quan tâm, xem tin tức/thông báo/banner và tải file đính kèm; đồng thời cung cấp API quản trị cho nhân viên ngân hàng quản lý tài sản, danh mục, nội dung website, quy trình phê duyệt, upload file và xuất báo cáo. Kiến trúc gồm Gateway, Eureka, asset service, config/notification service và file/report service, triển khai với PostgreSQL, Redis, MinIO, Keycloak, Docker/Kubernetes và GitLab CI.`,
    thumbnail: '/projects/shb-debit-thumb.jpg',
    images: [],
    technologies: [
      'Java 17',
      'Spring Boot',
      'Spring Cloud Gateway',
      'Eureka',
      'OpenFeign',
      'Keycloak OIDC',
      'PostgreSQL',
      'Redis',
      'Bucket4j',
      'Resilience4j',
      'MinIO',
      'Apache POI',
      'Tika',
      'iText',
      'MapStruct',
      'Microservices',
      'Docker',
      'Kubernetes',
    ],
    category: 'Tài chính – Ngân hàng',
    role: 'Lập trình viên Backend',
    duration: '11-2025 – 01-2026',
    featured: true,
    highlights: [
      'Xây dựng Spring Cloud Gateway với Keycloak JWT validation, public/admin policy, Redis/Bucket4j rate limiting và Resilience4j',
      'Implement asset APIs: public search/detail, admin CRUD, advanced filters, approval workflow, file attachment và view tracking',
      'Thiết kế Maker-Checker workflow cho notice/content với audit trail và separation-of-duties validation',
      'Tích hợp MinIO object storage, metadata persistence, multipart upload, batch delete và presigned URL generation',
      'Xây dựng Excel import/export, report strategy, Redis cache/invalidation và Kubernetes/GitLab CI deployment assets',
    ],
  },

  // ---------------------------------------------------------------------------
  // PROJECT 4 – CMV MBBank
  // ---------------------------------------------------------------------------
  {
    id: 'proj-4',
    slug: 'cmv-mbbank',
    title: 'Collateral Management & Valuation (CMV) – MBBank',
    description:
      'Hệ thống thẩm định và quản lý tài sản thế chấp ngân hàng MBBank theo kiến trúc Microservices, tích hợp AI và Kafka.',
    longDescription: `CMV phục vụ nghiệp vụ thẩm định tài sản thế chấp tại MBBank. Hệ thống được xây dựng theo kiến trúc Microservices và Event-Driven Architecture với Apache Kafka, tích hợp AI Platform để tự động trích xuất dữ liệu từ hồ sơ pháp lý/hình ảnh và phát hiện trùng lặp tài sản. API được quản lý qua Apigee Gateway với ECDH Encryption; ETL Pipeline dùng Pentaho PDI để đồng bộ dữ liệu sang CMV MBV (S600); hệ thống được giám sát bằng ELK Stack.`,
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
    role: 'Lập trình viên Full Stack',
    duration: '05-2023 – 10-2025',
    featured: false,
    highlights: [
      'Giảm 60% khối lượng nhập tay nhờ tích hợp AI trích xuất dữ liệu và phát hiện trùng lặp hình ảnh',
      'Triển khai Microservices + Event-Driven Architecture với Kafka cho tích hợp CMS/kho hàng',
      'Bảo mật API qua Apigee Gateway với ECDH Encryption và quản lý dữ liệu ngân hàng nhạy cảm',
      'Xây dựng ETL Pipeline Pentaho PDI đồng bộ CMV MBBank sang CMV MBV',
      'Phát triển các module định giá tài sản, định giá lại, tư vấn giá, kho giá và tích hợp dữ liệu real-time',
    ],
  },

  // ---------------------------------------------------------------------------
  // PROJECT 5 – MyBV Life
  // ---------------------------------------------------------------------------
  {
    id: 'proj-5',
    slug: 'mybv-life',
    title: 'MyBV Life – Nền tảng bảo hiểm trực tuyến',
    description:
      'Nền tảng bảo hiểm trực tuyến của Bảo Việt Nhân Thọ với API thanh toán Napas, hợp đồng điện tử và tích hợp hệ thống lõi IMS.',
    longDescription: `MyBV Life là nền tảng bảo hiểm trực tuyến của Bảo Việt Nhân Thọ. Backend xử lý API nghiệp vụ tài chính - bảo hiểm, bao gồm thanh toán qua Napas Gateway, hợp đồng điện tử, đồng bộ dữ liệu với hệ thống lõi IMS và đối tác DCS. Công việc tập trung vào thiết kế API, xử lý giao dịch, tối ưu truy vấn và đảm bảo an toàn/toàn vẹn dữ liệu.`,
    thumbnail: '/projects/mybv-thumb.jpg',
    images: [],
    technologies: ['Spring Boot', 'AOP', 'Hibernate', 'Oracle', 'Napas Gateway'],
    category: 'Bảo hiểm',
    role: 'Lập trình viên Backend',
    duration: '11-2022 – 05-2023',
    featured: false,
    highlights: [
      'Xây dựng API thanh toán hợp đồng bảo hiểm qua Napas Gateway',
      'Thiết kế API giao nhận hợp đồng điện tử và đồng bộ với hệ thống lõi IMS',
      'Tối ưu truy vấn và đồng bộ hóa dữ liệu hóa đơn với hệ thống đối tác DCS',
      'Đảm bảo tính toàn vẹn, bảo mật và an toàn dữ liệu trong domain tài chính - bảo hiểm',
    ],
  },

  // ---------------------------------------------------------------------------
  // PROJECT 6 – Veritas
  // ---------------------------------------------------------------------------
  {
    id: 'proj-6',
    slug: 'veritas-clinic',
    title: 'Veritas – Hệ thống quản lý phòng khám thẩm mỹ',
    description:
      'Hệ thống quản lý phòng khám thẩm mỹ cho khách hàng Nhật Bản: đặt lịch khám, phân công bác sĩ và quản lý lịch hẹn.',
    thumbnail: '/projects/veritas-thumb.jpg',
    images: [],
    technologies: ['Spring Boot', 'MyBatis', 'PostgreSQL', 'JSP', 'JavaScript', 'jQuery'],
    category: 'Nhật Bản',
    role: 'Lập trình viên Full Stack',
    duration: '03-2022 – 11-2022',
    featured: false,
    highlights: [
      'Phát triển module đặt lịch khám, phân công bác sĩ và quản lý lịch hẹn',
      'Tối ưu SQL performance và xử lý yêu cầu thay đổi dữ liệu từ khách hàng Nhật Bản',
      'Làm việc theo Agile, chú trọng tính ổn định, kỷ luật và chất lượng bàn giao',
    ],
  },

  // ---------------------------------------------------------------------------
  // PROJECT 7 – Hywork
  // ---------------------------------------------------------------------------
  {
    id: 'proj-7',
    slug: 'hywork',
    title: 'Hywork – Hệ thống đặt chỗ làm việc',
    description:
      'Hệ thống đặt chỗ làm việc và đồng bộ nhân sự từ AMIS cho khách hàng Nhật Bản.',
    thumbnail: '/projects/hywork-thumb.jpg',
    images: [],
    technologies: ['Spring Boot', 'Hibernate', 'Thymeleaf', 'MySQL'],
    category: 'Nhật Bản',
    role: 'Lập trình viên Full Stack',
    duration: '11-2021 – 03-2022',
    featured: false,
    highlights: [
      'Phát triển tính năng quản lý chỗ ngồi và đồng bộ nhân sự từ AMIS',
      'Xây dựng báo cáo thống kê sử dụng, export Excel phục vụ quản lý vận hành',
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
