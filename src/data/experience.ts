/**
 * =============================================================================
 * EXPERIENCE DATA - Work History
 * =============================================================================
 *
 * AI CUSTOMIZATION INSTRUCTIONS:
 * This file contains work history displayed in the Experience section.
 *
 * TO CUSTOMIZE:
 * 1. Replace the example entries with your actual work history
 * 2. List positions in reverse chronological order (newest first)
 * 3. Use action verbs for achievements (Led, Built, Increased, Reduced, etc.)
 * 4. Include metrics when possible (numbers, percentages, dollar amounts)
 * 5. List relevant technologies used at each position
 *
 * TO ADD A NEW EXPERIENCE:
 * Copy an existing entry and modify all fields. Example:
 * {
 *   id: 'exp-4',  // Unique identifier
 *   title: 'Your Job Title',
 *   company: 'Company Name',
 *   location: 'City, State/Country',
 *   type: 'full-time',  // Options: 'full-time' | 'part-time' | 'contract' | 'freelance'
 *   startDate: '2023-01',  // Format: YYYY-MM
 *   endDate: '2024-01',    // Format: YYYY-MM or omit for current position
 *   current: false,        // Set to true if this is your current job
 *   description: 'Brief description of your role...',
 *   achievements: ['Achievement 1', 'Achievement 2'],
 *   technologies: ['Tech 1', 'Tech 2'],
 * }
 *
 * TO REMOVE AN EXPERIENCE:
 * Delete the entire object from the array including its curly braces and comma.
 * =============================================================================
 */

/**
 * Experience entry type definition
 */
export interface Experience {
  /** Unique identifier (e.g., 'exp-1', 'exp-2') */
  id: string;

  /** Job title (e.g., "Senior Software Engineer", "Product Manager") */
  title: string;

  /** Company name */
  company: string;

  /**
   * Company logo path (optional)
   * - Use '/logos/company.png' for local image in public/logos/
   * - Use full URL for external image
   * - Omit or use undefined for no logo
   */
  companyLogo?: string;

  /**
   * Location
   * Format: "City, State/Country" or "Remote"
   */
  location: string;

  /**
   * Employment type
   * Options: 'full-time' | 'part-time' | 'contract' | 'freelance'
   */
  type: 'full-time' | 'part-time' | 'contract' | 'freelance';

  /**
   * Start date in YYYY-MM format
   * Example: '2023-01' for January 2023
   */
  startDate: string;

  /**
   * End date in YYYY-MM format (optional)
   * - Omit for current position
   * - Example: '2024-06' for June 2024
   */
  endDate?: string;

  /**
   * Is this your current position?
   * Set to true if still working here
   */
  current: boolean;

  /**
   * Brief description of the role
   * 1-2 sentences about what you did
   */
  description: string;

  /**
   * Key achievements/accomplishments in this role
   * - Use action verbs (Led, Built, Increased, Reduced, etc.)
   * - Include metrics when possible
   * - 3-5 bullet points recommended
   */
  achievements: string[];

  /**
   * Technologies/tools used in this role
   * List programming languages, frameworks, tools, etc.
   */
  technologies: string[];
}

/**
 * =============================================================================
 * YOUR WORK EXPERIENCE - CUSTOMIZE BELOW
 * =============================================================================
 *
 * Replace these example entries with your actual work history.
 * Keep positions in reverse chronological order (newest first).
 */
export const experience: Experience[] = [
  // ---------------------------------------------------------------------------
  // CURRENT POSITION — Alphaway / SHB (C12 GOV Payment Service)
  // ---------------------------------------------------------------------------
  {
    id: 'exp-0',
    title: 'Backend Developer',
    company: 'ALPHAWAY TECHNOLOGY (Outsourced cho Ngân hàng SHB)',
    location: 'Hà Nội, Việt Nam',
    type: 'full-time',
    startDate: '2026-05',
    current: true,
    description:
      'Backend Developer phát triển GOV Payment Service / Payment Gateway cho Cổng Dịch vụ công Quốc gia, hệ thống trung gian xử lý thanh toán giữa TTTT và SHB.',
    achievements: [
      'Thiết kế và phát triển 9 REST APIs theo đặc tả TTTT: tạo giao dịch/VietQR, truy vấn trạng thái, lấy biên lai, vấn tin tài khoản, hoàn tiền, chi hộ, đối soát và internal retry APIs',
      'Tích hợp ESB/Core Banking, Napas, Ebank, Oracle Core Banking schema và Signature Service với JWT token management, service header signing và retry khi lỗi xác thực',
      'Xây dựng luồng tạo tài khoản alias và sinh VietQR theo chuẩn Napas EMVCo với TLV encoding, CRC checksum, cấu hình bank/currency và idempotency theo x-request-id',
      'Thiết kế luồng hoàn tiền/chi hộ đa kênh qua Strategy + Template Method, hỗ trợ SHB nội bộ, Napas, Citad/Kho bạc, financial posting và reversal khi giao dịch lỗi',
      'Phát triển đối soát Type 1/Type 2: query Oracle/Core Banking, build file 22 cột pipe-delimited, Base64 parsing, checksum và lưu kết quả cần khớp',
      'Refactor PaymentService monolithic thành facade + use-case services, bổ sung custom validation, centralized error handling, AOP API logging, MDC tracing, masking log và unit test JUnit/Mockito',
    ],
    technologies: [
      'Java 17',
      'Spring Boot 3',
      'Spring Web MVC',
      'Spring Data JPA',
      'Hibernate',
      'JdbcTemplate',
      'Oracle DB',
      'Spring Kafka',
      'RestTemplate',
      'JWT',
      'Digital Signature',
      'Napas EMVCo / VietQR',
      'Spring AOP',
      'SpringDoc OpenAPI',
      'JUnit 5',
      'Mockito',
      'Maven',
    ],
  },

  // ---------------------------------------------------------------------------
  // Alphaway / SHB — Debit Collection Portal
  // ---------------------------------------------------------------------------
  {
    id: 'exp-0a',
    title: 'Backend Developer',
    company: 'ALPHAWAY TECHNOLOGY (Outsourced cho Ngân hàng SHB)',
    location: 'Hà Nội, Việt Nam',
    type: 'full-time',
    startDate: '2025-11',
    endDate: '2026-01',
    current: false,
    description:
      'Backend Developer phát triển Cổng Thông Tin Xử Lý Nợ Xấu SHB Debit Collection Portal, hệ thống quản lý & đấu giá tài sản xử lý nợ trên nền tảng Microservices.',
    achievements: [
      'Xây dựng Dynamic Filter Engine dựa trên JPA Specification Pattern, hỗ trợ tìm kiếm đa tiêu chí với cấu hình filter động từ DB',
      'Triển khai quy trình phê duyệt Maker-Checker (4 mắt) cho quản lý tài sản & thông báo đấu giá, đảm bảo Separation of Duties',
      'Thiết kế cơ chế bảo mật 3 lớp cho Lead Generation: Rate Limiting (Redis) + Google reCAPTCHA v3 + Duplicate Prevention',
      'Xây dựng kiến trúc Microservices với Spring Cloud Gateway, Eureka Service Discovery, OpenFeign giao tiếp liên service',
      'Phát triển tính năng Dynamic Field Display dùng Java Reflection, hiển thị trường linh hoạt theo từng loại tài sản (BĐS, PTVT, MMTB)',
      'Tích hợp Redis Cache cho danh mục & banner, tối ưu thời gian phản hồi; Atomic SQL UPDATE xử lý đồng thời lượt xem tài sản',
    ],
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
  },

  // ---------------------------------------------------------------------------
  // Alphaway / SHB — SHB SAHA Mobile Banking Cambodia
  // ---------------------------------------------------------------------------
  {
    id: 'exp-0b',
    title: 'Backend Developer',
    company: 'ALPHAWAY TECHNOLOGY (Outsourced cho Ngân hàng SHB)',
    location: 'Hà Nội, Việt Nam',
    type: 'full-time',
    startDate: '2026-01',
    endDate: '2026-04',
    current: false,
    description:
      'Backend Developer phát triển SHB SAHA Mobile Banking Cambodia – nền tảng ngân hàng di động phục vụ thị trường Campuchia, hỗ trợ 3 ngôn ngữ (EN/VI/KM) và 2 loại tiền tệ (USD/KHR) trên kiến trúc 3 Microservices Java Spring Boot.',
    achievements: [
      'Phát triển Identity Service: Xác thực JWT + RSA-4096, quản lý session Redis với sliding expiration (15 phút) & absolute timeout (8 giờ), Device Trust với device fingerprinting, OTP SMS Gateway tích hợp',
      'Phát triển Account Service: Quản lý danh sách tài khoản CASA/tiết kiệm/vay, tích hợp Core Banking Intellect qua Oracle Stored Procedures (PKG_MBBANKING), quản lý người thụ hưởng, hỗ trợ i18n đa ngôn ngữ động',
      'Phát triển Fund Transfer Service: Chuyển khoản nội bộ SELF/INTRA với Two-Phase Commit Pattern, tích hợp Core Banking TCP cho bút toán tài chính (Finance Posting), xử lý mapping phức tạp với FinancePostingMapper',
      'Thiết kế hệ thống validation phân tầng 4 lớp: Bean Validation → Custom Validators → Business Validators → Database Constraints, tất cả mã lỗi được mapping đa ngôn ngữ qua TBL_ERROR_MESSAGES',
      'Xây dựng JdbcCallStoreExecutor (Template Method Pattern) gọi Stored Procedures động với tham số linh hoạt, hỗ trợ REF CURSOR và OUT parameters',
      'Triển khai bảo mật đa lớp: JWT HS256 authentication, RSA-4096 mã hóa mật khẩu, session Redis, rate limiting OTP, device fingerprinting, password policy (8-20 ký tự, chữ hoa/thường/số/ký tự đặc biệt)',
    ],
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
      'REST API (OpenAPI 3.0)',
      'i18n (EN/VI/KM)',
    ],
  },

  // ---------------------------------------------------------------------------
  // PREVIOUS POSITION — MBBank
  // ---------------------------------------------------------------------------
  {
    id: 'exp-1',
    title: 'Full Stack Developer',
    company: 'Paraline Software (Outsourced cho MBBank)',
    location: 'Hà Nội, Việt Nam',
    type: 'full-time',
    startDate: '2023-05',
    endDate: '2025-10',
    current: false,
    description:
      'Fullstack Developer phụ trách hệ thống Collateral Management & Valuation (CMV) phục vụ nghiệp vụ thẩm định tài sản ngân hàng MBBank.',
    achievements: [
      'Thiết kế & triển khai kiến trúc Microservices và EDA (Apache Kafka), đảm bảo hiệu năng và khả năng mở rộng cao',
      'Tích hợp AI để tự động trích xuất dữ liệu, kiểm tra trùng lặp hình ảnh tài sản, giảm 60% khối lượng nhập tay',
      'Xây dựng & bảo mật API qua Apigee Gateway với ECDH Encryption cho trao đổi dữ liệu bảo mật',
      'Tích hợp kho hàng CMS để tự động đồng bộ dữ liệu, giảm thiểu thời gian nhập liệu của chuyên viên chi nhánh',
      'Xây dựng ETL Pipeline bằng Pentaho PDI để đồng bộ dữ liệu CMV MBBank sang CMV MBV (S600)',
      'Áp dụng ELK Stack để giám sát hoạt động hệ thống',
    ],
    technologies: [
      'Spring Boot',
      'ReactJS',
      'Hibernate',
      'OracleDB',
      'Apache Kafka',
      'Redis',
      'Apigee API Gateway',
      'Pentaho PDI',
      'Microservices',
      'ELK Stack',
      'Docker',
    ],
  },

  // ---------------------------------------------------------------------------
  // PREVIOUS POSITION
  // ---------------------------------------------------------------------------
  {
    id: 'exp-2',
    title: 'Backend Developer',
    company: 'Bảo Hiểm Bảo Việt',
    location: 'Hà Nội, Việt Nam',
    type: 'full-time',
    startDate: '2022-11',
    endDate: '2023-05',
    current: false,
    description:
      'Backend Developer trong dự án MyBV Life – Nền tảng bảo hiểm trực tuyến, phát triển API nghiệp vụ tài chính – bảo hiểm.',
    achievements: [
      'Xây dựng API thanh toán hợp đồng bảo hiểm qua Napas Gateway',
      'Thiết kế API giao nhận hợp đồng điện tử (e-Contract) và đồng bộ với hệ thống lõi IMS',
      'Tối ưu hiệu năng truy vấn và đồng bộ hóa dữ liệu hóa đơn với hệ thống đối tác DCS',
      'Đảm bảo tính an toàn, toàn vẹn và bảo mật dữ liệu theo chuẩn ngành tài chính',
    ],
    technologies: ['Spring Boot', 'AOP', 'Hibernate', 'Oracle'],
  },

  // ---------------------------------------------------------------------------
  // EARLIER POSITION
  // ---------------------------------------------------------------------------
  {
    id: 'exp-3',
    title: 'Full Stack Developer',
    company: 'GMO-Z.com RUNSYSTEM',
    location: 'Hà Nội, Việt Nam',
    type: 'full-time',
    startDate: '2021-11',
    endDate: '2022-11',
    current: false,
    description:
      'Fullstack Developer tham gia phát triển các sản phẩm cho khách hàng Nhật Bản, tiêu biểu là Veritas (quản lý phòng khám thẩm mỹ) và Hywork (đặt chỗ làm việc).',
    achievements: [
      'Phát triển module đặt lịch khám, phân công bác sĩ và quản lý lịch hẹn cho hệ thống Veritas',
      'Phát triển tính năng quản lý chỗ ngồi, đồng bộ nhân sự từ AMIS trong hệ thống Hywork',
      'Tối ưu SQL performance, xử lý các yêu cầu thay đổi dữ liệu từ phía khách hàng Nhật Bản',
      'Tạo báo cáo thống kê sử dụng (Export Excel) phục vụ quản lý vận hành',
      'Làm việc theo mô hình Agile – CI/CD, tiếp thu phong cách kỷ luật – chính xác – tinh gọn kiểu Nhật',
    ],
    technologies: [
      'Spring Boot',
      'MyBatis',
      'Hibernate',
      'PostgreSQL',
      'MySQL',
      'JSP',
      'Thymeleaf',
      'JavaScript',
      'JQuery',
    ],
  },
];

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get total years of professional experience
 */
export function getTotalYearsOfExperience(): number {
  if (experience.length === 0) return 0;

  const sortedByDate = [...experience].sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );

  const earliestStart = new Date(sortedByDate[0].startDate);
  const latestEnd = sortedByDate.some((exp) => exp.current)
    ? new Date()
    : new Date(
        Math.max(
          ...sortedByDate.map((exp) =>
            exp.endDate ? new Date(exp.endDate).getTime() : 0
          )
        )
      );

  const years = Math.floor(
    (latestEnd.getTime() - earliestStart.getTime()) / (1000 * 60 * 60 * 24 * 365)
  );
  return years;
}

/**
 * Get current position (if any)
 */
export function getCurrentPosition(): Experience | undefined {
  return experience.find((exp) => exp.current);
}

/**
 * Get all unique technologies across all experience
 */
export function getAllTechnologies(): string[] {
  const techSet = new Set<string>();
  experience.forEach((exp) => {
    exp.technologies.forEach((tech) => techSet.add(tech));
  });
  return Array.from(techSet).sort();
}

/**
 * Format date string (YYYY-MM) to readable format
 */
export function formatExperienceDate(dateString: string): string {
  const date = new Date(dateString + '-01');
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

/**
 * Get experience duration as string
 */
export function getExperienceDuration(exp: Experience): string {
  const start = new Date(exp.startDate);
  const end = exp.current ? new Date() : new Date(exp.endDate + '-01');

  const months =
    (end.getFullYear() - start.getFullYear()) * 12 +
    (end.getMonth() - start.getMonth());

  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;

  if (years === 0) {
    return `${remainingMonths} mo`;
  } else if (remainingMonths === 0) {
    return `${years} yr`;
  } else {
    return `${years} yr ${remainingMonths} mo`;
  }
}
