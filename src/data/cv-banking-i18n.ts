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
    lead: 'Lập trình viên Backend, gần 5 năm gắn với mảng Tài chính – Ngân hàng – Bảo hiểm.',
    body: 'Đã cùng team thiết kế và đưa vào vận hành một số nền tảng chính cho SHB, MBBank và Bảo Việt, phục vụ cả khách hàng cá nhân lẫn doanh nghiệp theo đúng quy trình ngân hàng. Phần lớn công việc xoay quanh Microservices, kiến trúc hướng sự kiện (Event-Driven), tích hợp Core Banking và tối ưu hiệu năng cho hệ thống xử lý lượng lớn dữ liệu.',
    strengths: [
      'Đã làm qua Sinh lời tự động (IBS), Cổng thanh toán dịch vụ công (Payment Gateway) và Mobile Banking Cambodia',
      'Từng cải tiến pipeline tính lãi, giảm số bản ghi snapshot từ khoảng 500K xuống còn ~10K mỗi ngày',
      'Có dẫn dắt team nhỏ, đồng thời đề xuất hướng kiến trúc cho hệ thống tải cao',
      'Tư duy thực dụng: cân nhắc ưu – nhược điểm, dùng feature flag, có kế hoạch rollback',
    ],
  },
  en: {
    name: 'Nguyen Quang Ngoc',
    title: 'Senior Backend Engineer',
    email: 'quangngoc201197@gmail.com',
    phone: '+84 346 238 899',
    location: 'Hanoi, Vietnam',
    socialLink: 'fb.com/coding97',
    lead: 'Backend developer with close to 5 years working mainly in Finance, Banking and Insurance.',
    body: 'Been part of teams that designed and rolled out some of the core platforms at SHB, MBBank and Bao Viet, serving both retail and corporate customers under standard banking operations. Most of the work is around Microservices, Event-Driven design, Core Banking integration and tuning performance for systems that handle large amounts of data.',
    strengths: [
      'Hands-on with Automated Wealth Management (IBS), the Government Service Payment Gateway and eBanking',
      'Helped refactor the daily interest pipeline, cutting snapshot rows from about 500K to ~10K per day',
      'Have led small teams and proposed architecture for high-load systems',
      'Pragmatic by default — trade-off analysis, feature flags, rollback plans, canary rollouts',
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
      intro: 'Tham gia 4 dự án lớn của SHB: Sinh Lời Tự Động (cá nhân + doanh nghiệp), Cổng Thanh toán Dịch vụ Công, Mobile Banking Cambodia và Cổng Thanh lý tài sản.',
      achievements: [
        'Cùng team refactor pipeline tính lãi hàng ngày từ theo seri sang theo hợp đồng — số bản ghi snapshot giảm từ khoảng 500K xuống ~10K mỗi ngày, thời gian chạy EOD từ 5–10 phút còn dưới 1 phút (số liệu lấy từ log vận hành).',
        'Đưa ra và áp dụng công thức giá bán dạng đóng cho khách hàng doanh nghiệp — bớt sai số làm tròn cộng dồn qua nhiều kỳ, số liệu dài hạn ổn định hơn.',
        'Thiết kế kiến trúc tách 6 lớp (topic / consumer group / DB table / Redis flag / stored procedure / listener) cho hai luồng KHCN và KHDN — lỗi một luồng không lan sang luồng kia, có sẵn cơ chế khôi phục.',
        'Thiết kế hệ thống tính lãi gần thời gian thực với chống trùng lặp 2 lớp, khóa phân tán qua Redis, có retry và DLT — chạy liên tục ổn định hơn.',
        'Làm cổng thanh toán dịch vụ công gồm 7 API nghiệp vụ, tích hợp Napas, Citad, KBNN; cổng này đang xử lý lượng lớn giao dịch mỗi ngày.',
        'Phát triển 3 service backend cho Mobile Banking SHB Campuchia — hỗ trợ đa ngôn ngữ (Anh – Việt – Khmer) và đa tiền tệ (USD/KHR).',
        'Viết tài liệu cho 7 hệ thống backend và hơn 40 luồng nghiệp vụ (kèm Mermaid sequence diagram) để team mới onboard nhanh và chuyển giao giữa các team.',
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
      intro: 'Tham gia xây dựng hệ thống Collateral Management & Valuation (CMV) của MBBank — phục vụ nghiệp vụ thẩm định tài sản trong quy trình tín dụng.',
      achievements: [
        'Thiết kế kiến trúc hướng sự kiện kết nối CMV với CMS qua Apache Kafka — thời gian phản hồi nhanh hơn, hệ thống ổn định hơn rõ rệt.',
        'Tích hợp nền tảng AI để bóc tách dữ liệu pháp lý và phát hiện tài sản trùng — giảm khá nhiều việc nhập liệu tay cho chuyên viên quan hệ khách hàng, đồng thời hỗ trợ thêm khâu phát hiện gian lận.',
        'Xây dựng API qua Apigee Gateway với mã hóa RSA, mở cho đối tác ngoài MBBank.',
        'Phát triển 6 phân hệ: thẩm định, định giá lại, định giá hợp thửa, quản lý tài sản hàng hóa, kho giá.',
        'Xây dựng ETL bằng Pentaho PDI để đồng bộ dữ liệu CMV sang OCB (S600), xử lý logic biến đổi khá phức tạp.',
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
      intro: 'Làm trên nền tảng bảo hiểm trực tuyến MyBV Life.',
      achievements: [
        'Làm API thanh toán hợp đồng bảo hiểm qua cổng Napas.',
        'Thiết kế API nhận hợp đồng điện tử (e-Contract) và đồng bộ với IMS Core; tối ưu truy vấn với hệ thống DCS của đối tác.',
        'Dữ liệu được xử lý theo tiêu chuẩn an toàn của ngành tài chính.',
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
      intro: 'Làm sản phẩm cho khách Nhật, quen với phong cách kỷ luật – chính xác – tinh gọn kiểu Nhật.',
      achievements: [
        'Phụ trách tiến độ, phân chia việc và ước lượng cho các dự án nhỏ theo phong cách kỷ luật – chính xác – tinh gọn kiểu Nhật.',
        'Phát triển Veritas (quản lý phòng khám thẩm mỹ) và Hywork (đặt chỗ làm việc) trên Spring Boot.',
        'Làm theo Agile + CI/CD, học thêm cách quản lý quy trình chuẩn Nhật.',
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
      intro: 'Working on 4 major projects at SHB: Automated Wealth Management (Retail + Corporate), the Government Payment Gateway, Cambodia Mobile Banking and the Debt Collection Portal.',
      achievements: [
        'Helped refactor the daily interest pipeline from per-seri to per-contract — snapshot rows dropped from about 500K to ~10K per day, EOD run time from 5–10 minutes down to under 1 minute (numbers from production logs).',
        'Came up with and rolled out a closed-form sell-price formula for corporate customers, cutting cumulative rounding error across periods and keeping long-term numbers consistent.',
        'Designed a 6-layer isolation architecture (topic / consumer group / DB table / Redis flag / stored procedure / listener) for Retail vs Corporate flows — incidents in one flow don\'t bleed into the other, with a safe rollback path.',
        'Designed the real-time interest system with 2-layer idempotency, Redis-based distributed lock, retry and a Dead Letter Queue — built to run continuously without breaking.',
        'Built the Government Payment Gateway with 7 business APIs, integrated Napas, Citad and KBNN; the gateway handles a large daily transaction volume.',
        'Developed 3 backend services for SHB Cambodia Mobile Banking — multi-language (English – Vietnamese – Khmer) and multi-currency (USD/KHR).',
        'Wrote docs for 7 backend systems and more than 40 business flows (with Mermaid sequence diagrams), used for onboarding and cross-team handover.',
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
      intro: 'Worked on the Collateral Management & Valuation (CMV) system at MBBank, supporting collateral appraisal in the credit workflow.',
      achievements: [
        'Designed an Event-Driven architecture connecting CMV to CMS through Apache Kafka — noticeably faster responses and a more stable system.',
        'Integrated an AI platform that pulls data out of legal documents and flags duplicate assets — saved Relationship Managers a lot of manual entry and gave the team another signal for fraud detection.',
        'Built and secured APIs for external partners through Apigee Gateway with RSA encryption.',
        'Built 6 core modules: collateral appraisal, revaluation, combined-parcel valuation, commodity collateral management, price repositories.',
        'Built ETL pipelines in Pentaho PDI to sync data from CMV into the OCB (S600) system, with some fairly involved transformation logic.',
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
      intro: 'Worked on the MyBV Life online insurance platform.',
      achievements: [
        'Built payment APIs for insurance contracts through the Napas gateway.',
        'Designed e-Contract APIs and synced them with IMS Core; tuned query performance through the partner\'s DCS system.',
        'Kept data handling to financial-industry safety standards.',
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
      intro: 'Built products for Japanese clients in a disciplined, precise and lean engineering style.',
      achievements: [
        'Ran schedule, task allocation and estimation for small projects, leaning into that disciplined, precise and lean Japanese style.',
        'Built Veritas (aesthetic clinic management) and Hywork (workspace booking) on Spring Boot.',
        'Worked in an Agile + CI/CD setup and picked up the Japanese-style engineering discipline along the way.',
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
      body: 'Có kinh nghiệm dẫn dắt nhóm nhỏ 3–5 người: phân việc, ước lượng, review code. Chạy nhiều dự án song song với tiêu chí quyết định rõ ràng. Viết đặc tả và truy vết theo hướng Spec-Driven Development.',
    },
    {
      icon: '🧠',
      title: 'Tư duy thiết kế',
      body: 'Tham gia thiết kế kiến trúc cho hệ thống tải cao, hạn chế downtime. Khi đề xuất giải pháp hay kèm phân tích ưu – nhược điểm. Quen quản lý rủi ro: kế hoạch rollback, feature flag. Trao đổi thường xuyên với BA, DBA, Product về hướng kỹ thuật.',
    },
    {
      icon: '💼',
      title: 'Kinh nghiệm ngân hàng',
      body: 'Core Banking (Oracle, PL/SQL, Intellect); các sản phẩm chứng chỉ tiền gửi (CD), tiết kiệm, tín dụng, thanh toán; tiêu chuẩn an toàn dữ liệu tài chính; tích hợp với Napas, KBNN, VietQR; chạy EOD, chốt số liệu và đối soát cuối ngày.',
    },
    {
      icon: '🏗️',
      title: 'Kiến trúc & Thiết kế hệ thống',
      body: 'Microservices, Event-Driven (Kafka); Domain-Driven Design, Bounded Context, CQRS. Quen các mẫu tăng độ tin cậy: idempotency 2 lớp, distributed lock, circuit breaker, DLT. Thiết kế API theo RESTful, OpenAPI và contract-first.',
    },
    {
      icon: '🛠️',
      title: 'Tech stack chính',
      body: 'Java 17, Spring Boot 3, Spring Cloud, Spring Security, Spring Data JPA; Oracle DB với package PL/SQL, stored procedure, REF CURSOR; Kafka, Redis, Quartz Scheduler.',
    },
    {
      icon: '📦',
      title: 'DevOps & Chất lượng',
      body: 'Docker, Kubernetes, GitLab CI/CD; test với JUnit 5, Mockito; log có cấu trúc, observability cơ bản; tích hợp các AI Agent (Claude Code, Kiro, Kilo Code) vào quy trình làm việc hằng ngày.',
    },
  ],
  en: [
    {
      icon: '🎯',
      title: 'Leadership & Project Management',
      body: 'Have led small teams of 3–5 people: task allocation, effort estimation, code review. Run several projects in parallel with clear decision criteria. Write specs and keep them traceable, in a Spec-Driven Development style.',
    },
    {
      icon: '🧠',
      title: 'Design Thinking',
      body: 'Designed parts of high-load systems where downtime really matters. When proposing solutions I tend to bring trade-off analysis along. Comfortable with rollback plans, feature flags and canary rollouts for risk control. Regular technical discussions with BA, DBA and Product.',
    },
    {
      icon: '💼',
      title: 'Banking Experience',
      body: 'Core Banking (Oracle, PL/SQL, Intellect); Certificate of Deposit (CD), savings, credit and payment products; financial data safety standards; Napas, KBNN, VietQR integrations; End-of-Day runs, snapshot and reconciliation.',
    },
    {
      icon: '🏗️',
      title: 'Architecture & System Design',
      body: 'Microservices and Event-Driven (Kafka), Domain-Driven Design, Bounded Context, CQRS. Comfortable with reliability patterns: 2-layer idempotency, distributed lock, circuit breaker, Dead Letter Queue. API design following RESTful, OpenAPI and contract-first.',
    },
    {
      icon: '🛠️',
      title: 'Core Tech Stack',
      body: 'Java 17, Spring Boot 3, Spring Cloud, Spring Security, Spring Data JPA; Oracle DB with PL/SQL packages, stored procedures, REF CURSOR; Kafka, Redis, Quartz Scheduler.',
    },
    {
      icon: '📦',
      title: 'DevOps & Quality',
      body: 'Docker, Kubernetes, GitLab CI/CD; tests with JUnit 5 and Mockito; structured logging and basic observability; use AI coding assistants (Claude Code, Kiro, Kilo Code) as part of the daily workflow.',
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
