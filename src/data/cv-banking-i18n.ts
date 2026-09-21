/**
 * =============================================================================
 * CV I18N — Banking Senior variant (Vietnamese + English)
 * =============================================================================
 *
 * Variant of cv-i18n.ts tuned for **Senior Backend / Senior Software Engineer**
 * applications at major banks. Tone is confident self-branding, focuses on
 * leadership, business impact and strategy rather than deep technical detail.
 *
 * Rendered by: `src/app/print-banking/page.tsx` -> `PrintBankingResume.tsx`
 *
 * Related source files:
 *   - src/data/cv-i18n.ts         — original bilingual CV (technical variant)
 *   - src/data/profile.ts         — homepage profile
 *   - src/data/experience.ts      — homepage experience
 * =============================================================================
 */

export type Language = 'vi' | 'en';

// ---------------------------------------------------------------------------
// UI label dictionary
// ---------------------------------------------------------------------------

export const ui: Record<
  Language,
  {
    pageTitle: string;
    pageDescription: string;
    sectionSummary: string;
    sectionStrengths: string;
    sectionExperience: string;
    sectionSkills: string;
    sectionEducation: string;
    sectionCertifications: string;
    editButton: string;
    finishEditingButton: string;
    savePdfButton: string;
    resetButton: string;
    editingHelp: string;
    idleHelp: string;
    printTip: string;
    present: string;
    languagesLabel: string;
    languageLabel: string;
    profileBadge: string;
    coreStrengthsLabel: string;
    leadershipSkillsLabel: string;
    strategicThinkingLabel: string;
    bankingDomainLabel: string;
    architectureLabel: string;
    techStackLabel: string;
    devopsLabel: string;
  }
> = {
  vi: {
    pageTitle: 'CV Senior Banking | Nguyễn Quang Ngọc',
    pageDescription: 'CV ứng tuyển vị trí Senior tại ngân hàng — phong cách leadership & business impact',
    sectionSummary: 'Hồ sơ chuyên gia',
    sectionStrengths: 'Năng lực cốt lõi',
    sectionExperience: 'Kinh nghiệm làm việc',
    sectionSkills: 'Năng lực kỹ thuật',
    sectionEducation: 'Học vấn',
    sectionCertifications: 'Chứng chỉ & Ngôn ngữ',
    editButton: 'Chỉnh sửa CV',
    finishEditingButton: 'Xong chỉnh sửa',
    savePdfButton: 'Lưu PDF',
    resetButton: 'Hoàn tác bản sửa',
    editingHelp: 'Đang chỉnh sửa: bấm trực tiếp vào nội dung, sau đó chọn Lưu PDF.',
    idleHelp: 'Bật Chỉnh sửa CV để điều chỉnh nội dung trước khi lưu PDF.',
    printTip:
      'Mẹo: trong hộp thoại in, tắt "Headers and footers" / "Tiêu đề và chân trang" để PDF sạch.',
    present: 'Hiện tại',
    languagesLabel: 'Ngôn ngữ',
    languageLabel: 'Ngôn ngữ',
    profileBadge: 'Banking Domain',
    coreStrengthsLabel: 'Năng lực cốt lõi',
    leadershipSkillsLabel: 'Lãnh đạo & Quản lý dự án',
    strategicThinkingLabel: 'Tư duy thiết kế',
    bankingDomainLabel: 'Kinh nghiệm ngân hàng',
    architectureLabel: 'Kiến trúc & Thiết kế hệ thống',
    techStackLabel: 'Tech stack chính',
    devopsLabel: 'DevOps & Chất lượng',
  },
  en: {
    pageTitle: 'Senior Banking CV | Nguyen Quang Ngoc',
    pageDescription: 'Senior banking CV — leadership & business impact focused',
    sectionSummary: 'Executive Profile',
    sectionStrengths: 'Core Capabilities',
    sectionExperience: 'Work Experience',
    sectionSkills: 'Technical Capabilities',
    sectionEducation: 'Education',
    sectionCertifications: 'Certifications & Languages',
    editButton: 'Edit CV',
    finishEditingButton: 'Done Editing',
    savePdfButton: 'Save PDF',
    resetButton: 'Reset Edits',
    editingHelp: 'Editing: click directly into the CV content, then choose Save PDF.',
    idleHelp: 'Turn on Edit CV to adjust content before saving as PDF.',
    printTip:
      'Tip: in the browser print dialog, turn off "Headers and footers" so the PDF stays clean.',
    present: 'Present',
    languagesLabel: 'Languages',
    languageLabel: 'Language',
    profileBadge: 'Banking Domain',
    coreStrengthsLabel: 'Core Capabilities',
    leadershipSkillsLabel: 'Leadership & Project Management',
    strategicThinkingLabel: 'Design Thinking',
    bankingDomainLabel: 'Banking Experience',
    architectureLabel: 'Architecture & System Design',
    techStackLabel: 'Core Tech Stack',
    devopsLabel: 'DevOps & Quality',
  },
};

// ---------------------------------------------------------------------------
// Date formatter
// ---------------------------------------------------------------------------

const EN_MONTH_ABBR = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

export function formatMonthYearI18n(date: string, lang: Language): string {
  const [year, month] = date.split('-');
  if (lang === 'vi') return `${month}-${year}`;
  const monthIdx = parseInt(month, 10) - 1;
  const monthLabel = EN_MONTH_ABBR[monthIdx] ?? month;
  return `${monthLabel} ${year}`;
}

// ---------------------------------------------------------------------------
// Profile
// ---------------------------------------------------------------------------

export interface LocalizedProfile {
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  socialLink?: string;
  lead: string;
  body: string;
  strengths: string[];
}

export const profileI18n: Record<Language, LocalizedProfile> = {
  vi: {
    name: 'Nguyễn Quang Ngọc',
    title: 'Senior Backend Engineer',
    email: 'quangngoc201197@gmail.com',
    phone: '0346 238 899',
    location: 'Hà Nội, Việt Nam',
    socialLink: 'fb.com/coding97',
    lead: 'Senior Backend Engineer với gần 5 năm kinh nghiệm xây dựng hệ thống trong lĩnh vực Tài chính – Ngân hàng – Bảo hiểm.',
    body: 'Trực tiếp tham gia thiết kế và triển khai các nền tảng trọng điểm cho Ngân hàng SHB, MBBank và Bảo Việt — phục vụ khách hàng cá nhân và doanh nghiệp với yêu cầu zero-downtime, tuân thủ chuẩn ngân hàng. Thế mạnh ở kiến trúc Microservices, Event-Driven, tích hợp Core Banking và tối ưu hiệu năng hệ thống xử lý dữ liệu lớn.',
    strengths: [
      'Có kinh nghiệm thực tế với Wealth Management, Payment Gateway và Core Banking',
      'Đã tham gia refactor pipeline tính lãi giảm từ ~500K xuống ~10K bản ghi/ngày',
      'Có kinh nghiệm lead team nhỏ và đề xuất giải pháp kiến trúc cho hệ thống tải cao',
      'Tư duy thực dụng: trade-off, feature flag, rollback plan, canary rollout',
    ],
  },
  en: {
    name: 'Nguyen Quang Ngoc',
    title: 'Senior Backend Engineer',
    email: 'quangngoc201197@gmail.com',
    phone: '+84 346 238 899',
    location: 'Hanoi, Vietnam',
    socialLink: 'fb.com/coding97',
    lead: 'Senior Backend Engineer with nearly 5 years of hands-on experience building systems in Finance – Banking – Insurance.',
    body: 'Directly contributed to the design and implementation of flagship platforms for SHB Bank, MBBank and Bao Viet — serving individual and corporate customers with zero-downtime requirements and full banking compliance. Strong background in Microservices architecture, Event-Driven design, Core Banking integration and large-scale system performance work.',
    strengths: [
      'Hands-on experience with Wealth Management, Payment Gateway and Core Banking',
      'Contributed to refactoring the interest pipeline from ~500K to ~10K records/day',
      'Experience leading small teams and proposing architecture for high-load systems',
      'Pragmatic mindset: trade-offs, feature flags, rollback plans, canary rollout',
    ],
  },
};

// ---------------------------------------------------------------------------
// Experience — leadership and impact focused
// ---------------------------------------------------------------------------

export interface LocalizedExperience {
  id: string;
  title: string;
  level: string;
  company: string;
  location: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  badge: string;
  intro: string;
  achievements: string[];
}

export const experienceI18n: Record<Language, LocalizedExperience[]> = {
  vi: [
    {
      id: 'exp-shb',
      title: 'Senior Backend Engineer',
      level: 'Senior Backend Engineer',
      company: 'ALPHAWAY TECHNOLOGY (Outsourced cho Ngân hàng SHB)',
      location: 'Hà Nội, Việt Nam',
      startDate: '2025-11',
      current: true,
      badge: 'Banking Core',
      intro: 'Tham gia 4 dự án trọng điểm của Ngân hàng SHB: Sinh Lời Tự Động (Retail + Corporate), Cổng Thanh toán Dịch vụ Công, Mobile Banking Campuchia và Cổng Xử lý Nợ.',
      achievements: [
        'Tham gia tái cấu trúc pipeline tính lãi hàng ngày từ mô hình per-seri sang per-contract: giảm số bản ghi snapshot từ khoảng **500K xuống ~10K mỗi ngày**, thời gian chạy snapshot từ 5-10 phút xuống dưới 1 phút (đo từ log batch EOD).',
        'Đề xuất và áp dụng công thức closed-form "giá bán" cho KHDN — loại bỏ hoàn toàn sai số rounding cộng dồn, đảm bảo tính chính xác tài chính dài hạn.',
        'Tham gia thiết kế kiến trúc **cô lập 6 lớp** (topic / consumer group / DB table / Redis flag / stored procedure / listener) cho luồng KHCN/KHDN — failure isolation tuyệt đối, rollback safety không ảnh hưởng luồng còn lại.',
        'Tham gia thiết kế hệ thống tính lãi real-time với idempotency 2 lớp, distributed lease (Redis), retry + DLT pattern — vận hành 24/7 zero-downtime.',
        'Xây dựng cổng thanh toán dịch vụ công với 7 API nghiệp vụ, tích hợp Napas, Citad, KBNN, xử lý triệu giao dịch/ngày.',
        'Phát triển 3 dịch vụ backend cho Mobile Banking SHB Campuchia — đa ngôn ngữ (Anh – Việt – Khmer), đa tiền tệ (USD/KHR).',
        'Viết tài liệu chi tiết cho 7 hệ thống backend, 40+ luồng nghiệp vụ với Mermaid sequence diagram, phục vụ onboarding và bàn giao giữa các team.',
      ],
    },
    {
      id: 'exp-mbbank',
      title: 'Full Stack Developer',
      level: 'Full Stack Developer',
      company: 'PARALINE SOFTWARE (Outsourced cho Ngân hàng MBBank)',
      location: 'Hà Nội, Việt Nam',
      startDate: '2023-05',
      endDate: '2025-10',
      current: false,
      badge: 'Banking',
      intro: 'Tham gia xây dựng hệ thống Collateral Management & Valuation (CMV) — phục vụ nghiệp vụ thẩm định tài sản ngân hàng MBBank với quy trình tín dụng phức tạp.',
      achievements: [
        'Tham gia thiết kế kiến trúc Event-Driven tích hợp CMV với CMS qua Apache Kafka — cải thiện thời gian phản hồi và độ ổn định hệ thống.',
        'Tích hợp AI Platform tự động bóc tách dữ liệu pháp lý và phát hiện trùng lặp tài sản — hỗ trợ giảm nhập liệu thủ công cho RM và hỗ trợ phát hiện gian lận.',
        'Tham gia xây dựng API qua Apigee Gateway với RSA Encryption cho đối tác ngoài MBBank.',
        'Phát triển 6 phân hệ nghiệp vụ cốt lõi: thẩm định, định giá lại, định giá hợp thửa, quản lý tài sản hàng hóa, kho giá.',
        'Xây dựng ETL Pentaho PDI đồng bộ dữ liệu CMV → OCB (S600) với logic biến đổi phức tạp.',
      ],
    },
    {
      id: 'exp-baoviet',
      title: 'Backend Developer',
      level: 'Backend Developer',
      company: 'BẢO HIỂM BẢO VIỆT',
      location: 'Hà Nội, Việt Nam',
      startDate: '2022-11',
      endDate: '2023-05',
      current: false,
      badge: 'Insurance',
      intro: 'Tham gia xây dựng nền tảng bảo hiểm trực tuyến MyBV Life.',
      achievements: [
        'Xây dựng API thanh toán hợp đồng bảo hiểm qua Napas Gateway.',
        'Thiết kế API giao nhận e-Contract và đồng bộ IMS Core, tối ưu hiệu năng truy vấn với DCS.',
        'Đảm bảo an toàn, toàn vẹn dữ liệu theo chuẩn ngành tài chính.',
      ],
    },
    {
      id: 'exp-gmo',
      title: 'Full Stack Developer',
      level: 'Full Stack Developer | Team Lead dự án nhỏ',
      company: 'GMO-Z.com RUNSYSTEM (Khách hàng Nhật)',
      location: 'Hà Nội, Việt Nam',
      startDate: '2021-11',
      endDate: '2022-11',
      current: false,
      badge: 'Japan Market',
      intro: 'Phát triển sản phẩm cho khách hàng Nhật Bản theo phong cách kỷ luật – chính xác – tinh gọn kiểu Nhật.',
      achievements: [
        'Quản lý tiến độ, phân chia task, estimate effort cho dự án nhỏ.',
        'Phát triển Veritas (quản lý phòng khám thẩm mỹ) và Hywork (đặt chỗ làm việc) trên Spring Boot.',
        'Làm việc theo mô hình Agile – CI/CD, tiếp thu quy trình kỷ luật chuẩn Nhật Bản.',
      ],
    },
  ],
  en: [
    {
      id: 'exp-shb',
      title: 'Senior Backend Engineer',
      level: 'Senior Backend Engineer',
      company: 'ALPHAWAY TECHNOLOGY (Outsourced to SHB Bank)',
      location: 'Hanoi, Vietnam',
      startDate: '2025-11',
      current: true,
      badge: 'Banking Core',
      intro: 'Contributed to 4 flagship projects for SHB Bank: Automated Wealth Management (Retail + Corporate), Government Payment Gateway, Cambodia Mobile Banking and Debt Collection Portal.',
      achievements: [
        'Contributed to refactoring the daily interest pipeline from per-seri to per-contract: snapshot rows reduced from about **500K to ~10K per day**, snapshot time from 5-10 minutes down to under 1 minute (measured from EOD batch logs).',
        'Proposed and applied the closed-form "sell price" formula for corporate customers — eliminated cumulative rounding error entirely, ensuring long-term financial accuracy.',
        'Contributed to the design of the **6-layer isolation architecture** (topic / consumer group / DB table / Redis flag / stored procedure / listener) for Retail vs Corporate flows — absolute failure isolation, rollback safety without cross-flow impact.',
        'Contributed to the design of the real-time interest system with 2-layer idempotency, distributed lease (Redis), retry + DLT pattern — operating 24/7 with zero downtime.',
        'Built the Government Payment Gateway with 7 business APIs, integrated Napas, Citad and KBNN, processing millions of transactions per day.',
        'Developed 3 backend services for SHB Cambodia Mobile Banking — multi-language (English – Vietnamese – Khmer), multi-currency (USD/KHR).',
        'Authored detailed docs for 7 backend systems and 40+ business flows with Mermaid sequence diagrams, supporting onboarding and cross-team handover.',
      ],
    },
    {
      id: 'exp-mbbank',
      title: 'Full Stack Developer',
      level: 'Full Stack Developer',
      company: 'PARALINE SOFTWARE (Outsourced to MBBank)',
      location: 'Hanoi, Vietnam',
      startDate: '2023-05',
      endDate: '2025-10',
      current: false,
      badge: 'Banking',
      intro: 'Contributed to the Collateral Management & Valuation (CMV) system supporting MBBank collateral appraisal workflows.',
      achievements: [
        'Designed Event-Driven architecture integrating CMV with CMS via Apache Kafka — significantly reduced response time, improved system stability.',
        'Integrated an AI platform to extract data from legal documents and detect duplicate assets — reduced manual data entry for Relationship Managers and improved fraud detection.',
        'Built and secured APIs for external partners through Apigee Gateway with RSA Encryption.',
        'Developed 6 core business modules: collateral appraisal, revaluation, combined-parcel valuation, commodity-collateral management, price repositories.',
        'Built ETL pipelines with Pentaho PDI to sync CMV data to the OCB (S600) system.',
      ],
    },
    {
      id: 'exp-baoviet',
      title: 'Backend Developer',
      level: 'Backend Developer',
      company: 'BAO VIET INSURANCE',
      location: 'Hanoi, Vietnam',
      startDate: '2022-11',
      endDate: '2023-05',
      current: false,
      badge: 'Insurance',
      intro: 'Contributed to the MyBV Life online insurance platform.',
      achievements: [
        'Built insurance contract payment APIs via Napas Gateway.',
        'Designed e-Contract APIs and synchronized with IMS Core, optimized query performance with DCS.',
        'Ensured data safety and integrity to financial-industry standards.',
      ],
    },
    {
      id: 'exp-gmo',
      title: 'Full Stack Developer',
      level: 'Full Stack Developer | Small Project Team Lead',
      company: 'GMO-Z.com RUNSYSTEM (Japanese clients)',
      location: 'Hanoi, Vietnam',
      startDate: '2021-11',
      endDate: '2022-11',
      current: false,
      badge: 'Japan Market',
      intro: 'Built products for Japanese clients following the disciplined, precise and lean style of Japanese engineering.',
      achievements: [
        'Managed schedule, task allocation and effort estimation for small project teams.',
        'Built Veritas (aesthetic clinic management) and Hywork (workspace booking) on Spring Boot.',
        'Worked in Agile – CI/CD setup, internalizing Japanese-style engineering discipline.',
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Skills — 6 strategic blocks focused on leadership + banking
// ---------------------------------------------------------------------------

export interface LocalizedSkillBlock {
  icon: string;
  title: string;
  body: string;
}

export const skillsI18n: Record<Language, LocalizedSkillBlock[]> = {
  vi: [
    {
      icon: '🎯',
      title: 'Lãnh đạo & Quản lý dự án',
      body: 'Có kinh nghiệm lead team nhỏ 3-5 thành viên; phân chia task, estimate effort, review code; quản lý đa dự án song song với Go/No-Go criteria; viết spec & traceability theo Spec-Driven Development.',
    },
    {
      icon: '🧠',
      title: 'Tư duy thiết kế',
      body: 'Tham gia thiết kế kiến trúc cho hệ thống tải cao, đảm bảo zero-downtime; phân tích trade-off khi đề xuất giải pháp; quản lý rủi ro với rollback plan, feature flag, canary rollout; trao đổi với BA/DBA/Product về giải pháp kỹ thuật.',
    },
    {
      icon: '💼',
      title: 'Kinh nghiệm ngân hàng',
      body: 'Core Banking (Oracle, PL/SQL, Intellect); sản phẩm CD, tiết kiệm, tín dụng, thanh toán; chuẩn an toàn dữ liệu tài chính; tích hợp Napas, KBNN, VietQR; EOD, snapshot, reconciliation.',
    },
    {
      icon: '🏗️',
      title: 'Kiến trúc & Thiết kế hệ thống',
      body: 'Microservices, Event-Driven (Kafka); DDD, Bounded Context, CQRS; reliability patterns (Idempotency 2 lớp, Distributed Lock, Circuit Breaker, DLT); API Design (RESTful, OpenAPI, contract-first).',
    },
    {
      icon: '🛠️',
      title: 'Tech stack chính',
      body: 'Java 17, Spring Boot 3, Spring Cloud, Spring Security, Spring Data JPA; Oracle DB + PL/SQL Packages, Stored Procedures, REF CURSOR; Kafka, Redis, Quartz Scheduler.',
    },
    {
      icon: '📦',
      title: 'DevOps & Chất lượng',
      body: 'Docker, Kubernetes, GitLab CI/CD; JUnit 5, Mockito, jqwik (Property-Based Testing); Structured Logging, Observability; sử dụng AI Coding Agents hỗ trợ workflow (Claude Code, Kiro, Kilo Code).',
    },
  ],
  en: [
    {
      icon: '🎯',
      title: 'Leadership & Project Management',
      body: 'Experience leading small squads of 3-5; task allocation, effort estimation, code review; manage parallel projects with Go/No-Go criteria; spec writing & traceability following Spec-Driven Development.',
    },
    {
      icon: '🧠',
      title: 'Design Thinking',
      body: 'Contributed to designing high-load systems with zero-downtime guarantees; trade-off analysis when proposing solutions; risk management with rollback plans, feature flags and canary rollout; discuss technical solutions with BA/DBA/Product stakeholders.',
    },
    {
      icon: '💼',
      title: 'Banking Experience',
      body: 'Core Banking (Oracle, PL/SQL, Intellect); CD, savings, credit and payment products; financial data safety standards; Napas, KBNN, VietQR integrations; EOD, snapshot, reconciliation flows.',
    },
    {
      icon: '🏗️',
      title: 'Architecture & System Design',
      body: 'Microservices, Event-Driven (Kafka); DDD, Bounded Context, CQRS; reliability patterns (2-layer idempotency, distributed lock, circuit breaker, DLT); API design (RESTful, OpenAPI, contract-first).',
    },
    {
      icon: '🛠️',
      title: 'Core Tech Stack',
      body: 'Java 17, Spring Boot 3, Spring Cloud, Spring Security, Spring Data JPA; Oracle DB + PL/SQL packages, stored procedures, REF CURSOR; Kafka, Redis, Quartz Scheduler.',
    },
    {
      icon: '📦',
      title: 'DevOps & Quality',
      body: 'Docker, Kubernetes, GitLab CI/CD; JUnit 5, Mockito, jqwik (Property-Based Testing); structured logging, observability; use AI coding agents to support workflow (Claude Code, Kiro, Kilo Code).',
    },
  ],
};

// ---------------------------------------------------------------------------
// Education & Certifications (reused from homepage data)
// ---------------------------------------------------------------------------

export interface LocalizedEducation {
  id: string;
  degree: string;
  field: string;
  school: string;
  startYear: number;
  endYear: number;
}

export const educationI18n: Record<Language, LocalizedEducation[]> = {
  vi: [
    {
      id: 'edu-1',
      degree: 'Cử nhân Công nghệ Thông tin',
      field: 'Phát triển phần mềm',
      school: 'Trường Đại học Giao thông vận tải',
      startYear: 2023,
      endYear: 2025,
    },
    {
      id: 'edu-2',
      degree: 'Cử nhân Công nghệ Thông tin',
      field: 'Ứng dụng phần mềm',
      school: 'Cao đẳng FPT Polytechnic',
      startYear: 2020,
      endYear: 2022,
    },
  ],
  en: [
    {
      id: 'edu-1',
      degree: 'Bachelor of Information Technology',
      field: 'Software Development',
      school: 'University of Transport and Communications',
      startYear: 2023,
      endYear: 2025,
    },
    {
      id: 'edu-2',
      degree: 'Associate of Information Technology',
      field: 'Software Applications',
      school: 'FPT Polytechnic College',
      startYear: 2020,
      endYear: 2022,
    },
  ],
};

export interface LocalizedCertification {
  id: string;
  name: string;
  issuer: string;
}

export const certificationsI18n: Record<Language, LocalizedCertification[]> = {
  vi: [
    { id: 'cert-1', name: 'Top Notch 2 – Tiếng Anh', issuer: 'FPT Polytechnic' },
    { id: 'cert-2', name: 'Chứng chỉ Tin học Văn phòng', issuer: 'FPT Polytechnic' },
  ],
  en: [
    { id: 'cert-1', name: 'Top Notch 2 – English', issuer: 'FPT Polytechnic' },
    { id: 'cert-2', name: 'Office Informatics Certificate', issuer: 'FPT Polytechnic' },
  ],
};

// ---------------------------------------------------------------------------
// Spoken languages
// ---------------------------------------------------------------------------

export const spokenLanguagesI18n: Record<
  Language,
  Array<{ name: string; level: 'Native' | 'Fluent' | 'Professional' | 'Intermediate' | 'Basic' }>
> = {
  vi: [
    { name: 'Tiếng Việt', level: 'Native' },
    { name: 'Tiếng Anh', level: 'Intermediate' },
  ],
  en: [
    { name: 'Vietnamese', level: 'Native' },
    { name: 'English', level: 'Intermediate' },
  ],
};