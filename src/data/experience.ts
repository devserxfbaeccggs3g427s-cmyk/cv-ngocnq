import { formatMonthYear } from '@/lib/date';

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
  // CURRENT POSITION — Alphaway / SHB
  // ---------------------------------------------------------------------------
  {
    id: 'exp-0',
    title: 'Lập trình viên Backend',
    company: 'ALPHAWAY TECHNOLOGY (Outsourced cho Ngân hàng SHB)',
    location: 'Hà Nội, Việt Nam',
    type: 'full-time',
    startDate: '2025-11',
    current: true,
    description:
      'Lập trình viên Backend tham gia các nền tảng trọng điểm của SHB gồm cổng xử lý nợ, Mobile Banking Campuchia và cổng thanh toán dịch vụ công, tập trung vào Java/Spring Boot microservices, tích hợp Core Banking/ESB, bảo mật và vận hành backend.',
    achievements: [
      'Phát triển GOV Payment Service cho luồng tạo giao dịch, sinh VietQR/Napas QR, truy vấn trạng thái, biên lai, vấn tin tài khoản, hoàn tiền, chi hộ và đối soát',
      'Thiết kế service/use-case layer, transfer strategy và retry failed Kafka messages; tích hợp ESB, Core Banking Oracle, Napas, Ebank và Signature Service',
      'Phát triển SHB SAHA Mobile Banking Campuchia với 3 microservices: Identity, Account, Fund Transfer; xử lý JWT, Redis session, OTP/SMS, beneficiary và fund transfer',
      'Tích hợp Oracle Stored Procedures/REF CURSOR, TCP Core Banking và xử lý nghiệp vụ USD/KHR, i18n EN/VI/KM cho thị trường Cambodia',
      'Xây dựng SHB Debit Collection Portal với Gateway, Keycloak, Maker-Checker workflow, asset/search APIs, MinIO file service, Excel import/export và report module',
      'Triển khai Redis cache/rate limit, Resilience4j, Actuator/Prometheus metrics, Docker/Kubernetes/GitLab CI và logging theo request ID',
    ],
    technologies: [
      'Java 17',
      'Spring Boot 3',
      'Spring Cloud',
      'Spring Cloud Gateway',
      'Spring Security',
      'Oracle DB',
      'PostgreSQL',
      'Redis',
      'Kafka',
      'Keycloak',
      'JWT/OAuth2',
      'OpenFeign',
      'Eureka',
      'MinIO',
      'Apache POI',
      'JdbcTemplate',
      'Oracle Stored Procedures',
      'MapStruct',
      'Docker',
      'Kubernetes',
      'GitLab CI/CD',
      'Maven',
    ],
  },

  // ---------------------------------------------------------------------------
  // PREVIOUS POSITION — MBBank
  // ---------------------------------------------------------------------------
  {
    id: 'exp-1',
    title: 'Lập trình viên Full Stack',
    company: 'Paraline Software (Outsourced cho MBBank)',
    location: 'Hà Nội, Việt Nam',
    type: 'full-time',
    startDate: '2023-05',
    endDate: '2025-10',
    current: false,
    description:
      'Lập trình viên Full Stack phụ trách hệ thống Collateral Management & Valuation (CMV) phục vụ nghiệp vụ thẩm định tài sản ngân hàng MBBank.',
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
    title: 'Lập trình viên Backend',
    company: 'Bảo Hiểm Bảo Việt',
    location: 'Hà Nội, Việt Nam',
    type: 'full-time',
    startDate: '2022-11',
    endDate: '2023-05',
    current: false,
    description:
      'Lập trình viên Backend trong dự án MyBV Life – Nền tảng bảo hiểm trực tuyến, phát triển API nghiệp vụ tài chính – bảo hiểm.',
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
    title: 'Lập trình viên Full Stack',
    company: 'GMO-Z.com RUNSYSTEM',
    location: 'Hà Nội, Việt Nam',
    type: 'full-time',
    startDate: '2021-11',
    endDate: '2022-11',
    current: false,
    description:
      'Lập trình viên Full Stack tham gia phát triển các sản phẩm cho khách hàng Nhật Bản, tiêu biểu là Veritas (quản lý phòng khám thẩm mỹ) và Hywork (đặt chỗ làm việc).',
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
  return formatMonthYear(dateString);
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
