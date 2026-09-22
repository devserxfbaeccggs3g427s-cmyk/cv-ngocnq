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
    sectionSummary: 'Hồ sơ',
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
    sectionSummary: 'Profile',
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
    lead: 'Lập trình viên Backend với gần 5 năm kinh nghiệm xây dựng hệ thống trong lĩnh vực Tài chính – Ngân hàng – Bảo hiểm.',
    body: 'Trực tiếp tham gia thiết kế và triển khai các nền tảng trọng điểm cho Ngân hàng SHB, MBBank và Bảo Việt — phục vụ khách hàng cá nhân và doanh nghiệp, tuân thủ quy trình vận hành chuẩn ngân hàng. Từng làm việc với kiến trúc vi dịch vụ (Microservices), hướng sự kiện (Event-Driven), tích hợp Core Banking và tối ưu hiệu năng hệ thống xử lý dữ liệu lớn.',
    strengths: [
      'Có kinh nghiệm thực tế với Sinh lời tự động (IBS), Cổng thanh toán dịch vụ công (Payment Gateway) và eBanking',
      'Đã tham gia tái cấu trúc pipeline tính lãi, giảm số bản ghi snapshot từ ~500K xuống ~10K mỗi ngày',
      'Có kinh nghiệm lead team nhỏ và đề xuất giải pháp kiến trúc cho hệ thống tải cao',
      'Tư duy thực dụng: cân nhắc ưu nhược điểm, cờ tính năng (feature flag), kế hoạch khôi phục, triển khai thử nghiệm (canary)',
    ],
  },
  en: {
    name: 'Nguyen Quang Ngoc',
    title: 'Senior Backend Engineer',
    email: 'quangngoc201197@gmail.com',
    phone: '+84 346 238 899',
    location: 'Hanoi, Vietnam',
    socialLink: 'fb.com/coding97',
    lead: 'Backend developer with nearly 5 years of hands-on experience building systems in Finance – Banking – Insurance.',
    body: 'Directly contributed to the design and rollout of flagship platforms for SHB Bank, MBBank and Bao Viet — serving individual and corporate customers under standard banking operations. Experience with Microservices architecture, Event-Driven design, Core Banking integration and performance tuning for large-scale data systems.',
    strengths: [
      'Hands-on experience with Automated Wealth Management (IBS), Government Service Payment Gateway and Core Banking',
      'Contributed to refactoring the daily interest pipeline, reducing snapshot rows from ~500K to ~10K per day',
      'Experience leading small teams and proposing architecture for high-load systems',
      'Pragmatic mindset: trade-off analysis, feature flags, rollback plans, canary rollout',
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
        'Tham gia tái cấu trúc pipeline tính lãi hàng ngày từ mô hình theo seri sang theo hợp đồng: giảm số bản ghi snapshot từ khoảng **500K xuống ~10K mỗi ngày**, thời gian chạy snapshot từ 5–10 phút xuống dưới 1 phút (đo từ log xử lý EOD).',
        'Đề xuất và áp dụng công thức tính giá bán dạng đóng cho KHDN — hạn chế sai số làm tròn cộng dồn qua nhiều kỳ, cải thiện tính nhất quán số liệu tài chính dài hạn.',
        'Tham gia thiết kế kiến trúc **cô lập 6 lớp** (topic / consumer group / DB table / Redis flag / stored procedure / listener) cho luồng KHCN và KHDN — sự cố ở một luồng không ảnh hưởng luồng còn lại, có cơ chế khôi phục an toàn.',
        'Tham gia thiết kế hệ thống tính lãi theo thời gian thực với cơ chế chống trùng lặp 2 lớp, khóa phân tán qua Redis, tự động thử lại và hàng đợi thư chết (DLT) — hỗ trợ vận hành liên tục.',
        'Xây dựng cổng thanh toán dịch vụ công với 7 API nghiệp vụ, tích hợp Napas, Citad, KBNN; hệ thống xử lý lượng lớn giao dịch mỗi ngày.',
        'Phát triển 3 dịch vụ backend cho Mobile Banking SHB Campuchia — đa ngôn ngữ (Anh – Việt – Khmer), đa tiền tệ (USD/KHR).',
        'Viết tài liệu chi tiết cho 7 hệ thống backend, hơn 40 luồng nghiệp vụ với Mermaid sequence diagram, phục vụ onboarding và bàn giao giữa các team.',
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
        'Tích hợp nền tảng AI để bóc tách dữ liệu pháp lý và phát hiện trùng lặp tài sản — hỗ trợ giảm nhập liệu thủ công cho chuyên viên quan hệ khách hàng (RM) và hỗ trợ phát hiện gian lận.',
        'Tham gia xây dựng API qua Apigee Gateway với mã hóa RSA cho đối tác ngoài MBBank.',
        'Phát triển 6 phân hệ nghiệp vụ cốt lõi: thẩm định, định giá lại, định giá hợp thửa, quản lý tài sản hàng hóa, kho giá.',
        'Xây dựng luồng ETL bằng Pentaho PDI đồng bộ dữ liệu CMV sang OCB (S600) với logic biến đổi phức tạp.',
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
        'Xây dựng API thanh toán hợp đồng bảo hiểm qua cổng Napas.',
        'Thiết kế API giao nhận hợp đồng điện tử (e-Contract) và đồng bộ với hệ thống lõi IMS; tối ưu hiệu năng truy vấn với hệ thống đối tác DCS.',
        'Đảm bảo an toàn và toàn vẹn dữ liệu theo tiêu chuẩn ngành tài chính.',
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
        'Quản lý tiến độ, phân chia công việc và ước lượng cho các dự án nhỏ theo phong cách kỷ luật – chính xác – tinh gọn kiểu Nhật.',
        'Phát triển Veritas (quản lý phòng khám thẩm mỹ) và Hywork (đặt chỗ làm việc) trên Spring Boot.',
        'Làm việc theo mô hình Agile và tích hợp liên tục (CI/CD), tiếp thu quy trình làm việc kỷ luật chuẩn Nhật Bản.',
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
        'Contributed to refactoring the daily interest pipeline from per-seri to per-contract: snapshot rows reduced from about **500K to ~10K per day**, snapshot time from 5–10 minutes down to under 1 minute (measured from End-of-Day processing logs).',
        'Proposed and applied a closed-form "sell price" formula for corporate customers — reducing cumulative rounding error across periods and improving long-term financial consistency.',
        'Contributed to the design of the **6-layer isolation architecture** (topic / consumer group / DB table / Redis flag / stored procedure / listener) for Retail vs Corporate flows — incidents in one flow do not affect the other, with safe rollback support.',
        'Contributed to the design of the real-time interest system with 2-layer idempotency, distributed lock via Redis, retry + Dead Letter Queue (DLT) pattern — supporting continuous operations.',
        'Built the Government Payment Gateway with 7 business APIs, integrated Napas, Citad and KBNN; the system handles a large volume of transactions per day.',
        'Developed 3 backend services for SHB Cambodia Mobile Banking — multi-language (English – Vietnamese – Khmer), multi-currency (USD/KHR).',
        'Authored detailed docs for 7 backend systems and more than 40 business flows with Mermaid sequence diagrams, supporting onboarding and cross-team handover.',
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
        'Integrated an AI platform to extract data from legal documents and detect duplicate assets — reduced manual data entry for Relationship Managers (RM) and supported fraud detection.',
        'Built and secured APIs for external partners through Apigee Gateway with RSA encryption.',
        'Developed 6 core business modules: collateral appraisal, revaluation, combined-parcel valuation, commodity-collateral management, price repositories.',
        'Built ETL pipelines with Pentaho PDI to sync data from CMV to the OCB (S600) system.',
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
        'Built insurance contract payment APIs via the Napas gateway.',
        'Designed e-Contract APIs and synchronized with IMS Core; optimized query performance with partner DCS.',
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
        'Managed schedule, task allocation and effort estimation for small projects in a disciplined – precise – lean Japanese style.',
        'Built Veritas (aesthetic clinic management) and Hywork (workspace booking) on Spring Boot.',
        'Worked in Agile and Continuous Integration (CI/CD) setup, internalizing Japanese-style engineering discipline.',
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
      body: 'Có kinh nghiệm dẫn dắt nhóm nhỏ 3–5 thành viên; phân chia công việc, ước lượng, review code; quản lý đa dự án song song với tiêu chí quyết định rõ ràng; viết đặc tả và truy vết theo phương pháp Spec-Driven Development.',
    },
    {
      icon: '🧠',
      title: 'Tư duy thiết kế',
      body: 'Tham gia thiết kế kiến trúc cho hệ thống tải cao, hạn chế thời gian chết; phân tích ưu nhược điểm khi đề xuất giải pháp; quản lý rủi ro với kế hoạch khôi phục, cờ tính năng (feature flag), triển khai thử nghiệm (canary); trao đổi với BA, DBA và Product về hướng kỹ thuật.',
    },
    {
      icon: '💼',
      title: 'Kinh nghiệm ngân hàng',
      body: 'Core Banking (Oracle, PL/SQL, Intellect); sản phẩm chứng chỉ tiền gửi (CD), tiết kiệm, tín dụng, thanh toán; tiêu chuẩn an toàn dữ liệu tài chính; tích hợp với Napas, KBNN, VietQR; xử lý cuối ngày (EOD), chốt số liệu và đối soát.',
    },
    {
      icon: '🏗️',
      title: 'Kiến trúc & Thiết kế hệ thống',
      body: 'Microservices, Event-Driven (Kafka); thiết kế hướng miền (DDD), phạm vi nghiệp vụ (Bounded Context), tách lệnh–truy vấn (CQRS); các mẫu đảm bảo độ tin cậy (chống trùng lặp hai lớp, khóa phân tán, ngắt mạch khi lỗi, hàng đợi thư chết DLT); thiết kế API theo RESTful, OpenAPI và hợp đồng trước (contract-first).',
    },
    {
      icon: '🛠️',
      title: 'Tech stack chính',
      body: 'Java 17, Spring Boot 3, Spring Cloud, Spring Security, Spring Data JPA; Oracle DB với package PL/SQL, thủ tục lưu trữ, REF CURSOR; Kafka, Redis, Quartz Scheduler.',
    },
    {
      icon: '📦',
      title: 'DevOps & Chất lượng',
      body: 'Docker, Kubernetes, GitLab CI/CD; JUnit 5, Mockito; log có cấu trúc, giám sát hệ thống; tích hợp các trợ lý lập trình AI vào quy trình làm việc (Claude Code, Kiro, Kilo Code).',
    },
  ],
  en: [
    {
      icon: '🎯',
      title: 'Leadership & Project Management',
      body: 'Experience leading small teams of 3–5 members; task allocation, effort estimation, code review; manage parallel projects with clear decision criteria; spec writing & traceability following Spec-Driven Development.',
    },
    {
      icon: '🧠',
      title: 'Design Thinking',
      body: 'Contributed to designing high-load systems with minimized downtime; trade-off analysis when proposing solutions; risk management with rollback plans, feature flags and canary rollout; discuss technical solutions with BA, DBA and Product stakeholders.',
    },
    {
      icon: '💼',
      title: 'Banking Experience',
      body: 'Core Banking (Oracle, PL/SQL, Intellect); Certificate of Deposit (CD), savings, credit and payment products; financial data safety standards; Napas, KBNN, VietQR integrations; End-of-Day (EOD), snapshot and reconciliation flows.',
    },
    {
      icon: '🏗️',
      title: 'Architecture & System Design',
      body: 'Microservices, Event-Driven (Kafka); Domain-Driven Design (DDD), Bounded Context, CQRS; reliability patterns (2-layer idempotency, distributed lock, circuit breaker, Dead Letter Queue); API design (RESTful, OpenAPI, contract-first).',
    },
    {
      icon: '🛠️',
      title: 'Core Tech Stack',
      body: 'Java 17, Spring Boot 3, Spring Cloud, Spring Security, Spring Data JPA; Oracle DB with PL/SQL packages, stored procedures, REF CURSOR; Kafka, Redis, Quartz Scheduler.',
    },
    {
      icon: '📦',
      title: 'DevOps & Quality',
      body: 'Docker, Kubernetes, GitLab CI/CD; JUnit 5, Mockito; structured logging, observability; integrate AI coding assistants into the development workflow (Claude Code, Kiro, Kilo Code).',
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