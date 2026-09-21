/**
 * =============================================================================
 * CV I18N — bilingual content for the printable CV (Vietnamese + English)
 * =============================================================================
 *
 * Scoped to the print page (`/print`) only. The rest of the site stays
 * Vietnamese. This file is the single source of truth for every translatable
 * string consumed by `PrintResumeEditor`.
 *
 * Each export is keyed by `Language = 'vi' | 'en'` so the editor can swap the
 * rendered CV with one prop change. Names that are already in English
 * (technology names, company names without parentheticals) stay as-is across
 * both languages.
 *
 * Related source files (do NOT modify unless structure changes):
 *   - src/data/profile.ts        — homepage profile (Vietnamese)
 *   - src/data/experience.ts     — homepage experience (Vietnamese)
 *   - src/data/projects.ts       — homepage projects (Vietnamese)
 *   - src/data/education.ts      — homepage education (Vietnamese)
 *   - src/data/skills.ts         — homepage skills (mostly English names)
 * =============================================================================
 */

export type Language = 'vi' | 'en';

export type LanguageLevel = 'Native' | 'Fluent' | 'Professional' | 'Intermediate' | 'Basic';

// ---------------------------------------------------------------------------
// UI label dictionary
// ---------------------------------------------------------------------------

export const ui: Record<
  Language,
  {
    sectionSummary: string;
    sectionSkills: string;
    sectionExperience: string;
    sectionProjects: string;
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
    technologiesLabel: string;
    languagesLabel: string;
    pageTitle: string;
    pageDescription: string;
    languageLabel: string;
  }
> = {
  vi: {
    sectionSummary: 'Tóm tắt chuyên môn',
    sectionSkills: 'Kỹ năng cốt lõi',
    sectionExperience: 'Kinh nghiệm làm việc',
    sectionProjects: 'Kinh nghiệm dự án',
    sectionEducation: 'Học vấn',
    sectionCertifications: 'Chứng chỉ',
    editButton: 'Chỉnh sửa CV',
    finishEditingButton: 'Xong chỉnh sửa',
    savePdfButton: 'Lưu PDF',
    resetButton: 'Hoàn tác bản sửa',
    editingHelp:
      'Đang chỉnh sửa: bấm trực tiếp vào nội dung CV, sau đó chọn Lưu PDF.',
    idleHelp:
      'Bật Chỉnh sửa CV để thay đổi nội dung ngay trên bản in trước khi lưu PDF.',
    printTip:
      'Mẹo: Trong hộp thoại in của trình duyệt, tắt mục “Headers and footers” / “Tiêu đề và chân trang” để bản PDF không kèm đường link URL.',
    present: 'Hiện tại',
    technologiesLabel: 'Công nghệ',
    languagesLabel: 'Ngôn ngữ',
    pageTitle: 'CV | Nguyễn Quang Ngọc',
    pageDescription: 'Bản CV tối ưu để in hoặc lưu PDF',
    languageLabel: 'Ngôn ngữ',
  },
  en: {
    sectionSummary: 'Professional Summary',
    sectionSkills: 'Core Skills',
    sectionExperience: 'Work Experience',
    sectionProjects: 'Project Experience',
    sectionEducation: 'Education',
    sectionCertifications: 'Certifications',
    editButton: 'Edit CV',
    finishEditingButton: 'Done Editing',
    savePdfButton: 'Save PDF',
    resetButton: 'Reset Edits',
    editingHelp:
      'Editing: click directly into the CV content, then choose Save PDF.',
    idleHelp:
      'Turn on Edit CV to change the content directly on the printable layout.',
    printTip:
      'Tip: in the browser print dialog, turn off “Headers and footers” so the PDF does not include the URL footer.',
    present: 'Present',
    technologiesLabel: 'Technologies',
    languagesLabel: 'Languages',
    pageTitle: 'CV | Nguyen Quang Ngoc',
    pageDescription: 'Print-ready CV optimized for saving as PDF',
    languageLabel: 'Language',
  },
};

// ---------------------------------------------------------------------------
// Skill category labels (parallel to skillCategoryLabels in src/data/skills.ts)
// ---------------------------------------------------------------------------

export const skillCategoryLabelsI18n: Record<Language, Record<string, string>> = {
  vi: {
    Languages: 'Ngôn ngữ & Framework',
    Frontend: 'Frontend',
    Backend: 'Backend',
    Architecture: 'Kiến trúc hệ thống',
    Databases: 'Cơ sở dữ liệu',
    DevOps: 'DevOps',
    Security: 'Bảo mật',
    Monitoring: 'Giám sát & Logging',
    Tools: 'Công cụ lập trình',
    AI: 'Công cụ AI',
  },
  en: {
    Languages: 'Programming & Frameworks',
    Frontend: 'Frontend',
    Backend: 'Backend',
    Architecture: 'System Architecture',
    Databases: 'Databases',
    DevOps: 'DevOps',
    Security: 'Security',
    Monitoring: 'Monitoring & Logging',
    Tools: 'Development Tools',
    AI: 'AI Tools',
  },
};

// ---------------------------------------------------------------------------
// Language proficiency labels (parallel to languageLevelLabels in src/data/skills.ts)
// ---------------------------------------------------------------------------

export const languageLevelLabelsI18n: Record<
  Language,
  Record<LanguageLevel, string>
> = {
  vi: {
    Native: 'Bản ngữ',
    Fluent: 'Thành thạo',
    Professional: 'Chuyên nghiệp',
    Intermediate: 'Trung cấp',
    Basic: 'Cơ bản',
  },
  en: {
    Native: 'Native',
    Fluent: 'Fluent',
    Professional: 'Professional',
    Intermediate: 'Intermediate',
    Basic: 'Basic',
  },
};

// ---------------------------------------------------------------------------
// Spoken languages per locale
// ---------------------------------------------------------------------------

export const spokenLanguagesI18n: Record<
  Language,
  Array<{ name: string; level: LanguageLevel }>
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

// ---------------------------------------------------------------------------
// Date formatter — Vietnamese keeps "MM-YYYY", English uses "Mon YYYY"
// ---------------------------------------------------------------------------

const EN_MONTH_ABBR = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

export function formatMonthYearI18n(date: string, lang: Language): string {
  const [year, month] = date.split('-');
  if (lang === 'vi') {
    return `${month}-${year}`;
  }
  const monthIdx = parseInt(month, 10) - 1;
  const monthLabel = EN_MONTH_ABBR[monthIdx] ?? month;
  return `${monthLabel} ${year}`;
}

/**
 * Localize a project duration string of the form "MM-YYYY – MM-YYYY" or
 * "MM-YYYY – Nay". Each token is rewritten per language:
 *   - "Nay" → "Present" in English
 *   - "MM-YYYY" → "Mon YYYY" in English (Vietnamese keeps "MM-YYYY")
 * If the input doesn't match the expected shape, it's returned untouched.
 */
export function formatProjectDurationI18n(
  duration: string,
  lang: Language
): string {
  const tokens = duration.split(/\s*[–—\-]\s*/);
  const localized = tokens.map((token) => {
    const trimmed = token.trim();
    if (!trimmed) return trimmed;
    if (trimmed === 'Nay' || trimmed === 'nay') {
      return lang === 'vi' ? 'Nay' : 'Present';
    }
    if (/^\d{2}-\d{4}$/.test(trimmed)) {
      return formatMonthYearI18n(trimmed, lang);
    }
    return trimmed;
  });
  // Preserve the original dash style where possible — most of the source data
  // uses the en-dash "–"; fall back to a regular hyphen-with-spaces otherwise.
  const dash = duration.includes('–')
    ? ' – '
    : duration.includes('—')
      ? ' — '
      : ' - ';
  return localized.join(dash);
}

// ---------------------------------------------------------------------------
// Per-locale profile data (mirrors fields rendered by PrintResumeEditor)
// ---------------------------------------------------------------------------

export interface LocalizedProfile {
  name: string;
  title: string;
  email: string;
  phone?: string;
  location: string;
  summary: string;
}

export const profileI18n: Record<Language, LocalizedProfile> = {
  vi: {
    name: 'Nguyễn Quang Ngọc',
    title: 'Lập trình viên Backend / Full-Stack',
    email: 'quangngoc201197@gmail.com',
    phone: '0346238899',
    location: 'Đa Phúc, Hà Nội, Việt Nam',
    summary: `Lập trình viên Backend / Full-Stack với hơn 4 năm kinh nghiệm xây dựng hệ thống tài chính – ngân hàng, bảo hiểm và sản phẩm cho khách hàng Nhật Bản. Thế mạnh ở phát triển backend Java/Spring Boot theo kiến trúc Microservices và Event-Driven, tích hợp Core Banking, thiết kế API nghiệp vụ có độ tin cậy cao và tối ưu hiệu năng hệ thống xử lý dữ liệu lớn. Hiện đang phát triển nền tảng Sinh Lời Tự Động của Ngân hàng SHB cho cả khách hàng cá nhân (tính lãi sản phẩm tiết kiệm, chính sách lãi suất theo số dư bình quân, tái cấu trúc pipeline tính lãi) và khách hàng doanh nghiệp (tính lãi sản phẩm Chứng chỉ Tiền gửi, tổng hợp lãi dự trả tháng). Đã tham gia các nền tảng thực tế cho SHB, MBBank và Bảo Việt, bao gồm cổng thanh toán dịch vụ công, Mobile Banking Campuchia, cổng xử lý nợ, hệ thống định giá tài sản thế chấp và bảo hiểm trực tuyến.`,
  },
  en: {
    name: 'Nguyen Quang Ngoc',
    title: 'Backend / Full-Stack Engineer',
    email: 'quangngoc201197@gmail.com',
    phone: '+84 346 238 899',
    location: 'Da Phuc, Hanoi, Vietnam',
    summary: `Backend / Full-Stack Engineer with 4+ years of experience building systems for finance, banking, insurance and Japanese clients. Strong expertise in Java/Spring Boot backend development with Microservices and Event-Driven architecture, Core Banking integration, designing high-reliability business APIs, and optimizing the performance of large-data systems. Currently developing SHB Bank's Automated Wealth Management Platform for both individual customers (savings products with daily interest calculation, average-balance interest rate policies, restructured interest calculation pipeline) and corporate customers (Certificate of Deposit products with daily accrued interest and monthly prepaid interest aggregation). Has contributed to production platforms at SHB, MBBank and Bao Viet, including government payment gateways, Cambodia Mobile Banking, debt collection portals, collateral valuation systems and online insurance platforms.`,
  },
};

// ---------------------------------------------------------------------------
// Per-locale experience (parallel to src/data/experience.ts)
// ---------------------------------------------------------------------------

export interface LocalizedExperience {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  achievements: string[];
}

export const experienceI18n: Record<Language, LocalizedExperience[]> = {
  vi: [
    {
      id: 'exp-0',
      title: 'Lập trình viên Backend',
      company: 'ALPHAWAY TECHNOLOGY (Outsourced cho Ngân hàng SHB)',
      location: 'Hà Nội, Việt Nam',
      description:
        'Lập trình viên Backend tham gia các nền tảng trọng điểm của Ngân hàng SHB gồm hệ thống Sinh Lời Tự Động cho cả khách hàng cá nhân và khách hàng doanh nghiệp, cổng thanh toán dịch vụ công, Mobile Banking tại Campuchia và cổng xử lý nợ. Trọng tâm công việc là phát triển backend Java/Spring Boot theo kiến trúc Microservices, tích hợp Core Banking, xử lý nghiệp vụ tài chính – ngân hàng có độ tin cậy cao và tối ưu hiệu năng hệ thống.',
      achievements: [
        'Tham gia phát triển nền tảng Sinh Lời Tự Động của SHB áp dụng cho cả khách hàng cá nhân (sản phẩm tiết kiệm) và khách hàng doanh nghiệp (sản phẩm Chứng chỉ Tiền gửi CD); thiết kế hệ thống quản lý chính sách lãi suất theo số dư bình quân với quy trình tạo – phê duyệt – ban hành nhiều cấp, đảm bảo kiểm soát rủi ro và tính liên tục của nghiệp vụ',
        'Tham gia tái cấu trúc pipeline tính lãi hàng ngày của nền tảng Sinh Lời giúp xử lý hiệu quả và ổn định hơn; thiết kế cơ chế chuyển đổi có thể quay lại phiên bản cũ bất kỳ lúc nào mà không cần cập nhật hệ thống',
        'Tích hợp chính sách lãi suất theo số dư bình quân vào quy trình tính lãi tự động cho khách hàng cá nhân, giúp khách hàng nhận được mức lãi suất ưu đãi khi duy trì số dư tiết kiệm ổn định, đồng thời đảm bảo tính chính xác của lãi theo từng giai đoạn',
        'Thiết kế và triển khai các luồng tính lãi cho khách hàng doanh nghiệp: tính lãi dự chi ngày (daily accrued interest) và tổng hợp lãi dự trả tháng (monthly prepaid interest) tự động chạy vào ngày đầu tháng',
        'Thiết kế hai luồng KHCN và KHDN hoạt động cô lập hoàn toàn thông qua các kênh xử lý và vùng dữ liệu riêng biệt, đảm bảo mọi thay đổi hoặc sự cố ở một luồng không ảnh hưởng đến luồng còn lại',
        'Xây dựng cơ chế giám sát và tự động xử lý lỗi cho hệ thống tính lãi, tự động thử lại các giao dịch tính toán bị lỗi và có API cho phép vận hành viên xử lý thủ công khi cần, đảm bảo hệ thống vận hành liên tục 24/7',
        'Tích hợp cơ chế phối hợp xử lý phân tán với khóa tạm thời có thời hạn cho luồng doanh nghiệp, đảm bảo mỗi tác vụ chỉ được thực hiện bởi một tiến trình duy nhất; bổ sung cơ chế kiểm tra trùng lặp hai lớp và tự động thử lại cho các thông điệp lỗi',
        'Viết kịch bản xử lý dữ liệu lịch sử giúp tính toán lại số dư bình quân cho toàn bộ khách hàng đang tham gia chương trình, đảm bảo triển khai go-live an toàn và chính xác',
        'Viết tài liệu nghiệp vụ và tài liệu kỹ thuật chi tiết cho 7 hệ thống backend của nền tảng Sinh Lời, mô tả hơn 40 luồng xử lý bằng sơ đồ trực quan, phục vụ onboarding nhân sự mới và bàn giao giữa các đội phát triển',
        'Phát triển cổng thanh toán dịch vụ công với luồng tạo giao dịch, sinh mã QR ngân hàng, truy vấn trạng thái, tra cứu biên lai, hoàn tiền, chi hộ và đối soát giao dịch',
        'Thiết kế kiến trúc phân lớp service và use-case, tích hợp Core Banking, cổng Napas, hệ thống chữ ký số và cơ chế tự động thử lại các giao dịch lỗi',
        'Phát triển ứng dụng Mobile Banking SHB cho thị trường Campuchia, gồm 3 dịch vụ backend: xác thực người dùng, quản lý tài khoản và chuyển tiền, hỗ trợ đa ngôn ngữ Anh – Việt – Khmer và xử lý đa tiền tệ USD/KHR',
        'Tích hợp Core Banking Oracle qua stored procedures, xử lý xác thực OTP/SMS, quản lý phiên đăng nhập và danh sách người thụ hưởng',
        'Xây dựng cổng xử lý nợ và thanh lý tài sản với quy trình phê duyệt nhiều cấp, API tra cứu tài sản công khai, dịch vụ lưu trữ file và phân hệ xuất báo cáo',
        'Triển khai hệ thống giám sát và logging theo mã yêu cầu, áp dụng Docker/Kubernetes/GitLab CI cho triển khai tự động',
      ],
    },
    {
      id: 'exp-1',
      title: 'Lập trình viên Full Stack',
      company: 'Paraline Software (Outsourced cho MBBank)',
      location: 'Hà Nội, Việt Nam',
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
    },
    {
      id: 'exp-2',
      title: 'Lập trình viên Backend',
      company: 'Bảo Hiểm Bảo Việt',
      location: 'Hà Nội, Việt Nam',
      description:
        'Lập trình viên Backend trong dự án MyBV Life – Nền tảng bảo hiểm trực tuyến, phát triển API nghiệp vụ tài chính – bảo hiểm.',
      achievements: [
        'Xây dựng API thanh toán hợp đồng bảo hiểm qua Napas Gateway',
        'Thiết kế API giao nhận hợp đồng điện tử (e-Contract) và đồng bộ với hệ thống lõi IMS',
        'Tối ưu hiệu năng truy vấn và đồng bộ hóa dữ liệu hóa đơn với hệ thống đối tác DCS',
        'Đảm bảo tính an toàn, toàn vẹn và bảo mật dữ liệu theo chuẩn ngành tài chính',
      ],
    },
    {
      id: 'exp-3',
      title: 'Lập trình viên Full Stack',
      company: 'GMO-Z.com RUNSYSTEM',
      location: 'Hà Nội, Việt Nam',
      description:
        'Lập trình viên Full Stack tham gia phát triển các sản phẩm cho khách hàng Nhật Bản, tiêu biểu là Veritas (quản lý phòng khám thẩm mỹ) và Hywork (đặt chỗ làm việc).',
      achievements: [
        'Phát triển module đặt lịch khám, phân công bác sĩ và quản lý lịch hẹn cho hệ thống Veritas',
        'Phát triển tính năng quản lý chỗ ngồi, đồng bộ nhân sự từ AMIS trong hệ thống Hywork',
        'Tối ưu SQL performance, xử lý các yêu cầu thay đổi dữ liệu từ phía khách hàng Nhật Bản',
        'Tạo báo cáo thống kê sử dụng (Export Excel) phục vụ quản lý vận hành',
        'Làm việc theo mô hình Agile – CI/CD, tiếp thu phong cách kỷ luật – chính xác – tinh gọn kiểu Nhật',
      ],
    },
  ],
  en: [
    {
      id: 'exp-0',
      title: 'Backend Engineer',
      company: 'ALPHAWAY TECHNOLOGY (Outsourced to SHB Bank)',
      location: 'Hanoi, Vietnam',
      description:
        'Backend Engineer contributing to SHB Bank’s flagship platforms: the Automated Wealth Management system for both individual and corporate customers, the Government Payment Service, Mobile Banking in Cambodia, and the Debit Collection Portal. Day-to-day work focuses on Java/Spring Boot backend development following a Microservices architecture, Core Banking integration, building high-reliability financial APIs, and optimizing system performance.',
      achievements: [
        'Contributed to SHB’s Automated Wealth Management Platform covering both individual customers (savings products) and corporate customers (Certificate of Deposit products); designed an average-balance interest rate policy system with a multi-level create – approve – publish workflow that ensures business continuity',
        'Helped restructure the platform’s daily interest calculation pipeline for better efficiency and stability; designed a mechanism to roll back to any previous version at any time without a system upgrade',
        'Integrated the average-balance interest rate policy into the automated interest calculation flow for individual customers, ensuring customers receive preferential rates when they maintain stable savings balances and that interest is accurate across stages',
        'Designed and implemented interest calculation flows for corporate customers: daily accrued interest and monthly prepaid interest aggregation running automatically on the first day of each month',
        'Architected the individual and corporate flows to operate in full isolation through separate processing channels and data zones, so any change or incident in one flow never affects the other',
        'Built monitoring and auto-recovery for the interest calculation system: failed calculations are retried automatically and an API lets operators intervene manually when needed, ensuring 24/7 operation',
        'Integrated a distributed coordination mechanism with time-bounded leases for the corporate flow so each task runs in a single process; added a two-layer duplicate check and automatic retry for failed messages',
        'Wrote a historical data processing script to recalculate average balances for every customer enrolled in the program, ensuring a safe and accurate go-live',
        'Authored business and technical docs for 7 backend systems of the Wealth Management platform, describing 40+ flows with visual diagrams to support onboarding and cross-team handover',
        'Built the Government Payment Service with flows for transaction creation, bank QR generation, status query, receipt lookup, refund, pay-on-behalf and reconciliation',
        'Designed a layered service/use-case architecture, integrated Core Banking, Napas gateway, digital signature service and auto-retry for failed transactions',
        'Built SHB’s Mobile Banking backend for Cambodia with 3 services: identity, account management and fund transfer, supporting English – Vietnamese – Khmer i18n and multi-currency USD/KHR',
        'Integrated Oracle Core Banking via stored procedures, handled OTP/SMS authentication, login sessions and beneficiary management',
        'Built the Debit Collection Portal with multi-level approval workflows, public asset-lookup APIs, file storage services and reporting modules',
        'Set up request-code-driven monitoring and logging, with Docker/Kubernetes/GitLab CI for automated deployments',
      ],
    },
    {
      id: 'exp-1',
      title: 'Full Stack Engineer',
      company: 'Paraline Software (Outsourced to MBBank)',
      location: 'Hanoi, Vietnam',
      description:
        'Full Stack Engineer on the Collateral Management & Valuation (CMV) system supporting MBBank’s collateral appraisal workflows.',
      achievements: [
        'Contributed to the development and operation of a Microservices system serving MBBank’s credit and collateral appraisal workflows, meeting complex business requirements with high standards for performance and security',
        'Integrated with an AI platform to extract data from legal documents and images, reducing manual data entry for Relationship Managers; the same integration detects duplicate property images, increasing transparency of appraisal reports and improving fraud detection',
        'Designed and implemented an Event-Driven architecture connecting the collateral appraisal system (CMV) with the CMS warehouse via Apache Kafka for asynchronous processing, significantly reducing response time and improving stability',
        'Built and secured APIs for external partners through Apigee Gateway with strict security and access control policies; integrated RSA Encryption for file and sensitive-data exchange',
        'Built and optimized an ETL pipeline with Pentaho PDI to sync configuration data and price lists from CMV MBBank to the OCB system (S600), handling complex data transformations and ensuring consistency between the two systems',
        'Owned the development of core business modules: collateral appraisal workflow; revaluation module (supporting both automatic and expert-driven flows); combined-parcel valuation (grouping multiple sub-assets into a single entity); commodity-collateral management with inventory workflows and real-time integration from the CMS warehouse; shared and bespoke price repositories for valuation advice',
        'Used the ELK Stack for system monitoring',
      ],
    },
    {
      id: 'exp-2',
      title: 'Backend Engineer',
      company: 'Bao Viet Insurance',
      location: 'Hanoi, Vietnam',
      description:
        'Backend Engineer on the MyBV Life project – an online insurance platform, developing finance and insurance business APIs.',
      achievements: [
        'Built insurance contract payment APIs via Napas Gateway',
        'Designed electronic-contract (e-Contract) APIs and synchronized them with the core IMS system',
        'Optimized query performance and invoice data synchronization with the DCS partner system',
        'Ensured data safety, integrity and security to financial-industry standards',
      ],
    },
    {
      id: 'exp-3',
      title: 'Full Stack Engineer',
      company: 'GMO-Z.com RUNSYSTEM',
      location: 'Hanoi, Vietnam',
      description:
        'Full Stack Engineer building products for Japanese clients, notably Veritas (aesthetic clinic management) and Hywork (workspace booking).',
      achievements: [
        'Built appointment booking, doctor assignment and schedule management modules for the Veritas system',
        'Built seat management features and HR sync from AMIS in the Hywork system',
        'Optimized SQL performance and handled data-change requests from Japanese customers',
        'Created usage/statistics reports (Excel export) for operations teams',
        'Worked in an Agile – CI/CD setup, adopting the disciplined, precise and lean style of Japanese engineering',
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Education (parallel to src/data/education.ts)
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

// ---------------------------------------------------------------------------
// Certifications (parallel to certifications in src/data/education.ts)
// ---------------------------------------------------------------------------

export interface LocalizedCertification {
  id: string;
  name: string;
  issuer: string;
}

export const certificationsI18n: Record<Language, LocalizedCertification[]> = {
  vi: [
    {
      id: 'cert-1',
      name: 'Top Notch 2 – Tiếng Anh',
      issuer: 'Cao đẳng FPT Polytechnic',
    },
    {
      id: 'cert-2',
      name: 'Chứng chỉ Tin học Văn phòng',
      issuer: 'Cao đẳng FPT Polytechnic',
    },
  ],
  en: [
    {
      id: 'cert-1',
      name: 'Top Notch 2 – English',
      issuer: 'FPT Polytechnic College',
    },
    {
      id: 'cert-2',
      name: 'Office Informatics Certificate',
      issuer: 'FPT Polytechnic College',
    },
  ],
};

// ---------------------------------------------------------------------------
// Projects (parallel to src/data/projects.ts) — only the top 5 used by the
// print editor are translated here.
// ---------------------------------------------------------------------------

export interface LocalizedProject {
  id: string;
  title: string;
  role: string;
  description: string;
  highlights: string[];
}

export const projectsI18n: Record<Language, LocalizedProject[]> = {
  vi: [
    {
      id: 'proj-8',
      title: 'IBS - Nền tảng sinh lời tự động',
      role: 'Lập trình viên Backend',
      description:
        'Hệ thống quản lý sản phẩm tiết kiệm và tính lãi tự động áp dụng cho cả khách hàng cá nhân và khách hàng doanh nghiệp của Ngân hàng SHB, gồm tính lãi hàng ngày, chính sách lãi suất, ưu đãi theo số dư bình quân và tổng hợp lãi dự trả tháng cho doanh nghiệp.',
      highlights: [
        'Phát triển nền tảng Sinh Lời Tự Động cho cả khách hàng cá nhân (tính lãi sản phẩm tiết kiệm, ưu đãi lãi suất theo số dư bình quân) và khách hàng doanh nghiệp (tính lãi Chứng chỉ Tiền gửi, tổng hợp lãi dự trả tháng)',
        'Tham gia tái cấu trúc pipeline tính lãi hàng ngày của nền tảng Sinh Lời giúp xử lý hiệu quả và ổn định hơn; thiết kế cơ chế chuyển đổi có thể quay lại phiên bản cũ bất kỳ lúc nào mà không cần cập nhật hệ thống',
        'Xây dựng hệ thống quản lý chính sách lãi suất với quy trình tạo – phê duyệt – ban hành nhiều cấp, đảm bảo kiểm soát rủi ro và tính liên tục của nghiệp vụ',
        'Xây dựng luồng tổng hợp lãi dự trả tháng tự động cho khách hàng doanh nghiệp, đảm bảo dữ liệu lãi tổng hợp luôn sẵn sàng cho nghiệp vụ chi trả',
        'Tích hợp cơ chế giám sát và tự động xử lý lỗi cho hệ thống tính lãi, tự động thử lại các giao dịch tính toán bị lỗi và cung cấp công cụ cho phép vận hành viên xử lý thủ công khi cần, đảm bảo hệ thống vận hành liên tục 24/7',
        'Viết kịch bản xử lý dữ liệu lịch sử giúp tính toán lại số dư bình quân cho toàn bộ khách hàng đang tham gia chương trình, đảm bảo triển khai go-live an toàn và chính xác',
        'Viết tài liệu nghiệp vụ và tài liệu kỹ thuật chi tiết cho 7 hệ thống backend của nền tảng Sinh Lời, mô tả hơn 40 luồng xử lý bằng sơ đồ trực quan, phục vụ đào tạo nhân sự mới và bàn giao giữa các đội phát triển',
      ],
    },
    {
      id: 'proj-1',
      title: 'GOV Payment Service – Cổng thanh toán Dịch vụ công',
      role: 'Lập trình viên Backend',
      description:
        'Cổng thanh toán trung gian giữa Cổng Dịch vụ công Quốc gia và SHB, xử lý tạo giao dịch, QR, truy vấn, hoàn tiền, chi hộ và đối soát.',
      highlights: [
        'Triển khai các API thanh toán theo đặc tả TTTT: tạo giao dịch/QR, kiểm tra trạng thái, tra cứu biên lai, vấn tin ngân hàng, hoàn tiền, chi hộ và đối soát',
        'Thiết kế cơ chế idempotency bằng request ID, chống trùng hóa đơn, sinh tài khoản alias bằng Oracle sequence và ràng buộc duy nhất',
        'Tích hợp ESB/Core Banking/Napas/Ebank/Signature Service, xử lý JWT token cache, chữ ký dịch vụ và ký request/response',
        'Áp dụng Strategy + Template Method cho kênh chuyển tiền: SHB nội bộ, Napas và Citad/Kho bạc; hỗ trợ đảo giao dịch khi lỗi tích hợp',
        'Xây dựng cơ chế xử lý lại thông điệp Kafka lỗi, ghi log API bằng AOP, MDC correlation ID, che dữ liệu nhạy cảm và API kiểm tra sức khỏe Actuator',
      ],
    },
    {
      id: 'proj-2',
      title: 'SHB SAHA Mobile Banking – Campuchia',
      role: 'Lập trình viên Backend',
      description:
        'Nền tảng Mobile Banking cho thị trường Campuchia với 3 microservices Spring Boot: Identity, Account và Fund Transfer.',
      highlights: [
        'Phát triển luồng xác thực/phiên/thiết bị với JWT, refresh token, Redis session, ràng buộc thiết bị, khóa đăng nhập và trusted-device OTP',
        'Xây dựng OTP/SMS service cho xác thực thiết bị và xác nhận chuyển tiền, có thời hạn, số lần thử lại, giới hạn gửi lại và ghi log đã che dữ liệu',
        'Tích hợp Oracle Core Banking/EBANK bằng stored procedures, REF CURSOR, reusable executor và ánh xạ response chuẩn ngân hàng',
        'Thiết kế xử lý chuyển tiền bằng Strategy pattern cho self-transfer và intra-bank transfer, gồm kiểm tra tài khoản, FX, OTP và hạch toán Core',
        'Chuẩn hóa hợp đồng lỗi, thông báo đa ngôn ngữ EN/KM/VI, ánh xạ DTO bằng MapStruct và cache Redis cho dữ liệu ngân hàng',
      ],
    },
    {
      id: 'proj-3',
      title: 'SHB Debit Collection Portal – Xử Lý Nợ & Thanh Lý Tài Sản',
      role: 'Lập trình viên Backend',
      description:
        'Nền tảng microservices phục vụ nghiệp vụ xử lý nợ, thanh lý tài sản và quản trị nội dung website của SHB.',
      highlights: [
        'Xây dựng Spring Cloud Gateway với xác thực JWT qua Keycloak, chính sách công khai/quản trị, giới hạn tần suất bằng Redis/Bucket4j và Resilience4j',
        'Triển khai API tài sản: tìm kiếm/chi tiết công khai, CRUD quản trị, bộ lọc nâng cao, quy trình phê duyệt, file đính kèm và theo dõi lượt xem',
        'Thiết kế Maker-Checker workflow cho thông báo/nội dung với audit trail và kiểm soát phân tách nhiệm vụ',
        'Tích hợp lưu trữ đối tượng MinIO, lưu siêu dữ liệu, tải lên nhiều phần, xóa hàng loạt và sinh presigned URL',
        'Xây dựng nhập/xuất Excel, chiến lược báo cáo, Redis cache và cơ chế vô hiệu hóa cache, cấu hình triển khai Kubernetes/GitLab CI',
      ],
    },
    {
      id: 'proj-4',
      title: 'Collateral Management & Valuation (CMV) – MBBank',
      role: 'Lập trình viên Full Stack',
      description:
        'Hệ thống thẩm định và quản lý tài sản thế chấp ngân hàng MBBank theo kiến trúc Microservices, tích hợp AI và Kafka.',
      highlights: [
        'Tham gia phát triển và vận hành hệ thống Microservices phục vụ quy trình tín dụng và thẩm định tài sản của ngân hàng, đáp ứng yêu cầu nghiệp vụ phức tạp với tiêu chuẩn cao về hiệu năng và bảo mật',
        'Tích hợp với hệ thống AI để thực hiện bóc tách dữ liệu từ hồ sơ pháp lý và hình ảnh, giúp giảm thiểu quá trình nhập liệu của RM (Relationship Manager); đồng thời phát hiện trùng lặp hình ảnh tài sản, tăng tính minh bạch cho báo cáo thẩm định và nâng cao khả năng phát hiện gian lận',
        'Thiết kế và triển khai kiến trúc Event-Driven: tích hợp hệ thống thẩm định tài sản (CMV) với kho hàng CMS qua Apache Kafka để xử lý bất đồng bộ, giúp giảm đáng kể thời gian phản hồi và nâng cao độ ổn định cho hệ thống',
        'Xây dựng và bảo mật API cung cấp cho đối tác bên ngoài ngân hàng qua Apigee Gateway, áp dụng chính sách bảo mật và kiểm soát truy cập chặt chẽ; tích hợp RSA Encryption cho trao đổi file và dữ liệu nhạy cảm',
        'Xây dựng và tối ưu luồng ETL bằng Pentaho PDI để đồng bộ dữ liệu cấu hình và bảng giá từ hệ thống CMV sang hệ thống OCB (S600), giải quyết các bài toán biến đổi dữ liệu phức tạp và đảm bảo tính nhất quán giữa hai hệ thống',
        'Phụ trách phát triển các phân hệ nghiệp vụ cốt lõi, bao gồm: quy trình thẩm định tài sản; phân hệ định giá lại tài sản (hỗ trợ cả luồng tự động và luồng chuyên gia thẩm định); phân hệ định giá tài sản hợp thửa (gộp nhiều tài sản con thành một thực thể thống nhất); phân hệ quản lý tài sản hàng hoá với quy trình kiểm kê và tích hợp dữ liệu thời gian thực từ kho CMS; kho giá chung và kho giá cụ thể phục vụ tư vấn giá',
      ],
    },
  ],
  en: [
    {
      id: 'proj-8',
      title: 'IBS — Automated Wealth Management Platform',
      role: 'Backend Engineer',
      description:
        'Savings product and automated interest calculation system for both individual and corporate customers of SHB Bank, covering daily interest calculation, interest rate policies, average-balance preferential rates and monthly prepaid interest aggregation for corporate customers.',
      highlights: [
        'Developed the Automated Wealth Management Platform for individual customers (savings interest calculation, average-balance preferential rates) and corporate customers (Certificate of Deposit interest, monthly prepaid interest aggregation)',
        'Helped restructure the platform’s daily interest calculation pipeline for better efficiency and stability; designed a roll-back mechanism to any previous version at any time without a system upgrade',
        'Built an interest rate policy management system with a multi-level create – approve – publish workflow that ensures risk control and business continuity',
        'Built the automated monthly prepaid interest aggregation flow for corporate customers, ensuring the aggregated data is always ready for payout',
        'Built monitoring and auto-recovery for the interest calculation system: failed calculations are retried automatically and operators have manual-handling tools, ensuring 24/7 operation',
        'Wrote a historical data processing script to recalculate average balances for every enrolled customer, ensuring a safe and accurate go-live',
        'Authored detailed business and technical docs for 7 backend systems of the platform, describing 40+ flows with visual diagrams to support onboarding and cross-team handover',
      ],
    },
    {
      id: 'proj-1',
      title: 'GOV Payment Service — Government Services Payment Gateway',
      role: 'Backend Engineer',
      description:
        'An intermediary payment gateway between the National Government Services Portal and SHB, handling transaction creation, QR, status query, refund, pay-on-behalf and reconciliation.',
      highlights: [
        'Implemented payment APIs per TTTT specifications: transaction/QR creation, status check, receipt lookup, bank inquiry, refund, pay-on-behalf and reconciliation',
        'Designed idempotency via request ID to prevent duplicate invoices; generated alias accounts via Oracle sequence with uniqueness constraints',
        'Integrated ESB/Core Banking/Napas/Ebank/Signature services, handling JWT token cache, service signature and request/response signing',
        'Applied Strategy + Template Method for transfer channels: SHB internal, Napas and Citad/State Treasury; supports reversing transactions when integration fails',
        'Built Kafka error-message reprocessing, AOP-based API logging, MDC correlation IDs, sensitive-data masking and Actuator health endpoints',
      ],
    },
    {
      id: 'proj-2',
      title: 'SHB SAHA Mobile Banking — Cambodia',
      role: 'Backend Engineer',
      description:
        'Mobile Banking platform for the Cambodian market, built as 3 Spring Boot microservices: Identity, Account and Fund Transfer.',
      highlights: [
        'Built authentication/session/device flows with JWT, refresh tokens, Redis sessions, device binding, login lockout and trusted-device OTP',
        'Built an OTP/SMS service for device authentication and transfer confirmation with TTL, retry limits, resend limits and masked logging',
        'Integrated Oracle Core Banking/EBANK via stored procedures, REF CURSOR, reusable executor and standard banking response mapping',
        'Designed transfer flows with the Strategy pattern for self-transfer and intra-bank transfer, including account checks, FX, OTP and core booking',
        'Standardized error contracts, multi-language EN/KM/VI messages, MapStruct DTO mapping and Redis caching for banking data',
      ],
    },
    {
      id: 'proj-3',
      title: 'SHB Debit Collection Portal — Debt Resolution & Asset Liquidation',
      role: 'Backend Engineer',
      description:
        'A microservices platform powering SHB’s debt resolution, asset liquidation and website CMS workflows.',
      highlights: [
        'Built Spring Cloud Gateway with Keycloak JWT authentication, public/admin policy separation, Redis/Bucket4j rate-limiting and Resilience4j',
        'Implemented asset APIs: public search/detail, admin CRUD, advanced filters, approval workflows, attachments and view tracking',
        'Designed a Maker-Checker workflow for announcements/content with audit trails and segregation-of-duties enforcement',
        'Integrated MinIO object storage, metadata persistence, multipart upload, bulk deletion and presigned URL generation',
        'Built Excel import/export, reporting strategies, Redis caching and cache-invalidation mechanics, plus Kubernetes/GitLab CI deployment configs',
      ],
    },
    {
      id: 'proj-4',
      title: 'Collateral Management & Valuation (CMV) — MBBank',
      role: 'Full Stack Engineer',
      description:
        'Collateral appraisal and management system for MBBank built on a Microservices architecture with AI and Kafka integrations.',
      highlights: [
        'Contributed to the development and operation of a Microservices system serving the bank’s credit and collateral appraisal workflows, meeting complex business requirements with high standards for performance and security',
        'Integrated an AI platform to extract data from legal documents and images, reducing manual data entry for Relationship Managers; the same integration detects duplicate property images, increasing transparency of appraisal reports and improving fraud detection',
        'Designed and implemented an Event-Driven architecture connecting the collateral appraisal system (CMV) with the CMS warehouse via Apache Kafka for asynchronous processing, significantly reducing response time and improving stability',
        'Built and secured APIs for external partners through Apigee Gateway with strict security and access control policies; integrated RSA Encryption for file and sensitive-data exchange',
        'Built and optimized an ETL pipeline with Pentaho PDI to sync configuration data and price lists from CMV to the OCB system (S600), handling complex data transformations and ensuring consistency between the two systems',
        'Owned the development of core business modules: collateral appraisal workflow; revaluation module (supporting both automatic and expert-driven flows); combined-parcel valuation (grouping multiple sub-assets into a single entity); commodity-collateral management with inventory workflows and real-time integration from the CMS warehouse; shared and bespoke price repositories for valuation advice',
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Per-locale overrides for the few Vietnamese skill names in src/data/skills.ts.
// Anything not in this map falls through to the original skill.name (which is
// already English in most cases).
// ---------------------------------------------------------------------------

export const skillNameOverridesI18n: Record<Language, Record<string, string>> = {
  vi: {},
  en: {
    'Lập trình tiến trình chạy nền (Scheduler)': 'Background Job Scheduling',
    'Mẫu thiết kế (Design Patterns)': 'Design Patterns',
  },
};

export function localizeSkillName(name: string, lang: Language): string {
  return skillNameOverridesI18n[lang][name] ?? name;
}

// ---------------------------------------------------------------------------
// Project category labels (parallel to projectCategories in src/data/projects.ts)
// ---------------------------------------------------------------------------

export const projectCategoryLabelsI18n: Record<Language, Record<string, string>> = {
  vi: {
    'Tài chính – Ngân hàng': 'Tài chính – Ngân hàng',
    'Payment Gateway': 'Payment Gateway',
    'Bảo hiểm': 'Bảo hiểm',
    'Nhật Bản': 'Nhật Bản',
  },
  en: {
    'Tài chính – Ngân hàng': 'Finance – Banking',
    'Payment Gateway': 'Payment Gateway',
    'Bảo hiểm': 'Insurance',
    'Nhật Bản': 'Japan',
  },
};

export function localizeProjectCategory(
  category: string,
  lang: Language
): string {
  return projectCategoryLabelsI18n[lang][category] ?? category;
}

// ---------------------------------------------------------------------------
// Skill limits per category — same for both languages (printed numbers only).
// ---------------------------------------------------------------------------

export const skillLimitsByCategory: Record<string, number> = {
  Languages: 5,
  Frontend: 4,
  Backend: 8,
  Architecture: 6,
  Databases: 5,
  DevOps: 5,
  Security: 4,
  Monitoring: 4,
  Tools: 5,
  AI: 7,
};