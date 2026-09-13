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
      'Lập trình viên Backend tham gia các nền tảng trọng điểm của Ngân hàng SHB gồm hệ thống Sinh Lời Tự Động cho cả khách hàng cá nhân và khách hàng doanh nghiệp, cổng thanh toán dịch vụ công, Mobile Banking tại Campuchia và cổng xử lý nợ. Trọng tâm công việc là phát triển backend Java/Spring Boot theo kiến trúc Microservices, tích hợp Core Banking, xử lý nghiệp vụ tài chính – ngân hàng có độ tin cậy cao và tối ưu hiệu năng hệ thống.',
    achievements: [
      // ============================ Sinh Lời Tự Động – KHCN & KHDN (07/2026 – Nay) ============================
      'Tham gia phát triển nền tảng Sinh Lời Tự Động của SHB áp dụng cho cả khách hàng cá nhân (sản phẩm tiết kiệm) và khách hàng doanh nghiệp (sản phẩm Chứng chỉ Tiền gửi CD); thiết kế hệ thống quản lý chính sách lãi suất theo số dư bình quân với quy trình tạo – phê duyệt – ban hành nhiều cấp, đảm bảo kiểm soát rủi ro và tính liên tục của nghiệp vụ',
      'Tham gia tái cấu trúc pipeline tính lãi hàng ngày của nền tảng Sinh Lời giúp xử lý hiệu quả và ổn định hơn; thiết kế cơ chế chuyển đổi có thể quay lại phiên bản cũ bất kỳ lúc nào mà không cần cập nhật hệ thống',
      'Tích hợp chính sách lãi suất theo số dư bình quân vào quy trình tính lãi tự động cho khách hàng cá nhân, giúp khách hàng nhận được mức lãi suất ưu đãi khi duy trì số dư tiết kiệm ổn định, đồng thời đảm bảo tính chính xác của lãi theo từng giai đoạn',
      'Thiết kế và triển khai các luồng tính lãi cho khách hàng doanh nghiệp: tính lãi dự chi ngày (daily accrued interest) và tổng hợp lãi dự trả tháng (monthly prepaid interest) tự động chạy vào ngày đầu tháng',
      'Thiết kế hai luồng KHCN và KHDN hoạt động cô lập hoàn toàn thông qua các kênh xử lý và vùng dữ liệu riêng biệt, đảm bảo mọi thay đổi hoặc sự cố ở một luồng không ảnh hưởng đến luồng còn lại',
      'Xây dựng cơ chế giám sát và tự động xử lý lỗi cho hệ thống tính lãi, tự động thử lại các giao dịch tính toán bị lỗi và có API cho phép vận hành viên xử lý thủ công khi cần, đảm bảo hệ thống vận hành liên tục 24/7',
      'Tích hợp cơ chế phối hợp xử lý phân tán với khóa tạm thời có thời hạn cho luồng doanh nghiệp, đảm bảo mỗi tác vụ chỉ được thực hiện bởi một tiến trình duy nhất; bổ sung cơ chế kiểm tra trùng lặp hai lớp và tự động thử lại cho các thông điệp lỗi',
      'Viết kịch bản xử lý dữ liệu lịch sử giúp tính toán lại số dư bình quân cho toàn bộ khách hàng đang tham gia chương trình, đảm bảo triển khai go-live an toàn và chính xác',
      'Viết tài liệu nghiệp vụ và tài liệu kỹ thuật chi tiết cho 7 hệ thống backend của nền tảng Sinh Lời, mô tả hơn 40 luồng xử lý bằng sơ đồ trực quan, phục vụ onboarding nhân sự mới và bàn giao giữa các đội phát triển',

      // ============================ GOV Payment Service (05/2026 – Nay) ============================
      'Phát triển cổng thanh toán dịch vụ công với luồng tạo giao dịch, sinh mã QR ngân hàng, truy vấn trạng thái, tra cứu biên lai, hoàn tiền, chi hộ và đối soát giao dịch',
      'Thiết kế kiến trúc phân lớp service và use-case, tích hợp Core Banking, cổng Napas, hệ thống chữ ký số và cơ chế tự động thử lại các giao dịch lỗi',

      // ============================ SHB SAHA Mobile Banking (01/2026 – 06/2026) ============================
      'Phát triển ứng dụng Mobile Banking SHB cho thị trường Campuchia, gồm 3 dịch vụ backend: xác thực người dùng, quản lý tài khoản và chuyển tiền, hỗ trợ đa ngôn ngữ Anh – Việt – Khmer và xử lý đa tiền tệ USD/KHR',
      'Tích hợp Core Banking Oracle qua stored procedures, xử lý xác thực OTP/SMS, quản lý phiên đăng nhập và danh sách người thụ hưởng',

      // ============================ SHB Debit Collection Portal (11/2025 – 01/2026) ============================
      'Xây dựng cổng xử lý nợ và thanh lý tài sản với quy trình phê duyệt nhiều cấp, API tra cứu tài sản công khai, dịch vụ lưu trữ file và phân hệ xuất báo cáo',
      'Triển khai hệ thống giám sát và logging theo mã yêu cầu, áp dụng Docker/Kubernetes/GitLab CI cho triển khai tự động',
    ],
    technologies: [
      'Java 17',
      'Spring Boot 3',
      'Spring Cloud',
      'Spring Cloud Gateway',
      'Spring Security',
      'Spring Data JPA',
      'Oracle DB',
      'Oracle PL/SQL (Packages)',
      'Stored Procedures / REF CURSOR',
      'JdbcTemplate',
      'SimpleJdbcCall',
      'Quartz Scheduler',
      'Custom Bean Validation',
      'Strategy Pattern',
      'MapStruct',
      'Lombok',
      'Kafka',
      'PostgreSQL',
      'Redis',
      'Keycloak',
      'JWT/OAuth2',
      'OpenFeign',
      'Eureka',
      'MinIO',
      'Apache POI',
      'Docker',
      'Kubernetes',
      'GitLab CI/CD',
      'Maven',
      'JUnit 5 / Mockito / jqwik',
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
      'Tham gia phát triển và vận hành hệ thống Microservices phục vụ quy trình tín dụng và thẩm định tài sản của MBBank, đáp ứng yêu cầu nghiệp vụ phức tạp với tiêu chuẩn cao về hiệu năng và bảo mật',
      'Tích hợp với hệ thống AI để thực hiện bóc tách dữ liệu từ hồ sơ pháp lý và hình ảnh, giúp giảm thiểu quá trình nhập liệu của RM (Relationship Manager); đồng thời phát hiện trùng lặp hình ảnh tài sản, tăng tính minh bạch cho báo cáo thẩm định và nâng cao khả năng phát hiện gian lận',
      'Thiết kế và triển khai kiến trúc Event-Driven: tích hợp hệ thống thẩm định tài sản (CMV) với kho hàng CMS qua Apache Kafka để xử lý bất đồng bộ, giúp giảm đáng kể thời gian phản hồi và nâng cao độ ổn định',
      'Xây dựng và bảo mật API cung cấp cho đối tác bên ngoài MBBank qua Apigee Gateway, áp dụng chính sách bảo mật và kiểm soát truy cập chặt chẽ; tích hợp RSA Encryption cho trao đổi file và dữ liệu nhạy cảm',
      'Xây dựng và tối ưu luồng ETL bằng Pentaho PDI để đồng bộ dữ liệu cấu hình và bảng giá từ CMV MBBank sang hệ thống OCB (S600), giải quyết các bài toán biến đổi dữ liệu phức tạp và đảm bảo tính nhất quán giữa hai hệ thống',
      'Phụ trách phát triển các phân hệ nghiệp vụ cốt lõi: quy trình thẩm định tài sản; phân hệ định giá lại tài sản (hỗ trợ cả luồng tự động và luồng chuyên gia thẩm định); phân hệ định giá tài sản hợp thửa (gộp nhiều tài sản con thành một thực thể thống nhất); phân hệ quản lý tài sản hàng hoá với quy trình kiểm kê và tích hợp dữ liệu thời gian thực từ kho CMS; kho giá chung và kho giá cụ thể phục vụ tư vấn giá',
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
