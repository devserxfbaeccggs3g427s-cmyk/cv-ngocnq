/**
 * =============================================================================
 * EDUCATION DATA - Academic History & Certifications
 * =============================================================================
 *
 * AI CUSTOMIZATION INSTRUCTIONS:
 * This file contains education, certifications, and awards data.
 *
 * TO CUSTOMIZE:
 * 1. Replace example entries with your actual education
 * 2. List education in reverse chronological order (newest first)
 * 3. Add certifications if you have any professional certifications
 * 4. Include relevant awards and honors
 *
 * TO ADD A NEW EDUCATION ENTRY:
 * Copy an existing entry and modify all fields. Make sure to:
 * - Use a unique ID (e.g., 'edu-3', 'edu-4')
 * - Include start and end years
 * - GPA is optional (omit if you prefer not to share)
 *
 * TO REMOVE AN ENTRY:
 * Delete the entire object from the array including its curly braces and comma.
 * =============================================================================
 */

/**
 * Education entry type definition
 */
export interface Education {
  /** Unique identifier (e.g., 'edu-1', 'edu-2') */
  id: string;

  /**
   * Degree type
   * Examples: "Bachelor of Science", "Master of Arts", "Ph.D.", "Associate's"
   */
  degree: string;

  /**
   * Field of study
   * Examples: "Computer Science", "Business Administration", "Design"
   */
  field: string;

  /** School/University name */
  school: string;

  /**
   * School logo path (optional)
   * - Use '/logos/school.png' for local image
   * - Use full URL for external image
   */
  schoolLogo?: string;

  /** Location (City, State/Country) */
  location: string;

  /** Start year */
  startYear: number;

  /** End year (or expected graduation year) */
  endYear: number;

  /**
   * GPA (optional)
   * Format: "3.8/4.0" or "First Class Honours"
   */
  gpa?: string;

  /**
   * Academic honors (optional)
   * Examples: ["Magna Cum Laude", "Dean's List", "Valedictorian"]
   */
  honors?: string[];

  /**
   * Relevant courses (optional)
   * List courses relevant to your career
   */
  relevantCourses?: string[];
}

/**
 * Certification entry type definition
 */
export interface Certification {
  /** Unique identifier (e.g., 'cert-1', 'cert-2') */
  id: string;

  /** Certification name */
  name: string;

  /** Issuing organization */
  issuer: string;

  /**
   * Issuer logo path (optional)
   * - Use '/logos/issuer.png' for local image
   * - Use full URL for external image
   */
  issuerLogo?: string;

  /**
   * Date obtained in YYYY-MM format
   * Example: '2023-06'
   */
  date: string;

  /**
   * Expiration date in YYYY-MM format (optional)
   * Omit for certifications that don't expire
   */
  expirationDate?: string;

  /**
   * Credential ID (optional)
   * The unique identifier from the issuing organization
   */
  credentialId?: string;

  /**
   * Verification URL (optional)
   * Link to verify the certification
   */
  credentialUrl?: string;
}

/**
 * Award entry type definition
 */
export interface Award {
  /** Unique identifier (e.g., 'award-1', 'award-2') */
  id: string;

  /** Award title */
  title: string;

  /** Issuing organization or event */
  issuer: string;

  /** Date received (year or YYYY-MM format) */
  date: string;

  /** Description of the award (optional) */
  description?: string;
}

/**
 * =============================================================================
 * YOUR EDUCATION - CUSTOMIZE BELOW
 * =============================================================================
 *
 * Replace these example entries with your actual education.
 * List in reverse chronological order (most recent first).
 */
export const education: Education[] = [
  // ---------------------------------------------------------------------------
  // MOST RECENT DEGREE
  // ---------------------------------------------------------------------------
  {
    id: 'edu-1',
    degree: 'Cử nhân Công nghệ Thông tin',
    field: 'Phát triển phần mềm',
    school: 'Trường Đại học Giao thông vận tải',
    location: 'Hà Nội, Việt Nam',
    startYear: 2023,
    endYear: 2025,
    gpa: '2.7/4.0',
    relevantCourses: [
      'Phát triển phần mềm',
      'Kiến trúc hệ thống',
      'Cơ sở dữ liệu',
    ],
  },

  // ---------------------------------------------------------------------------
  // EARLIER DEGREE
  // ---------------------------------------------------------------------------
  {
    id: 'edu-2',
    degree: 'Cử nhân Công nghệ Thông tin',
    field: 'Ứng dụng phần mềm',
    school: 'Cao đẳng FPT Polytechnic',
    location: 'Hà Nội, Việt Nam',
    startYear: 2020,
    endYear: 2022,
    gpa: '8.8/10.0',
    relevantCourses: [
      'Lập trình hướng đối tượng',
      'Phát triển Web',
      'Cơ sở dữ liệu quan hệ',
    ],
  },
];

/**
 * =============================================================================
 * YOUR CERTIFICATIONS - CUSTOMIZE BELOW
 * =============================================================================
 *
 * Add your professional certifications here.
 * Remove this array or leave empty if you have no certifications.
 */
export const certifications: Certification[] = [
  {
    id: 'cert-1',
    name: 'Top Notch 2 – Tiếng Anh',
    issuer: 'Cao đẳng FPT Polytechnic',
    date: '2022-06',
  },
  {
    id: 'cert-2',
    name: 'Chứng chỉ Tin học Văn phòng',
    issuer: 'Cao đẳng FPT Polytechnic',
    date: '2022-06',
  },
];

/**
 * =============================================================================
 * YOUR AWARDS - CUSTOMIZE BELOW
 * =============================================================================
 *
 * Add awards, honors, or recognition you've received.
 * Remove this array or leave empty if you have no awards.
 */
export const awards: Award[] = [
  {
    id: 'award-1',
    title: 'Đồ án tốt nghiệp xuất sắc',
    issuer: 'Trường Đại học Giao thông vận tải',
    date: '2025',
    description: 'Xây dựng Website Quản lý nhân sự sử dụng Spring Boot, ReactJS, OracleDB, Kafka, Redis, Docker, Microservices',
  },
  {
    id: 'award-2',
    title: 'Đồ án tốt nghiệp xuất sắc',
    issuer: 'Cao đẳng FPT Polytechnic',
    date: '2022',
    description: 'Xây dựng Website bán hàng sử dụng Spring Boot, ReactJS, MySQL',
  },
];

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get highest/most recent education
 */
export function getLatestEducation(): Education | undefined {
  return education.length > 0 ? education[0] : undefined;
}

/**
 * Get active (non-expired) certifications
 */
export function getActiveCertifications(): Certification[] {
  const now = new Date();
  return certifications.filter((cert) => {
    if (!cert.expirationDate) return true;
    const expDate = new Date(cert.expirationDate + '-01');
    return expDate > now;
  });
}

/**
 * Get expired certifications
 */
export function getExpiredCertifications(): Certification[] {
  const now = new Date();
  return certifications.filter((cert) => {
    if (!cert.expirationDate) return false;
    const expDate = new Date(cert.expirationDate + '-01');
    return expDate <= now;
  });
}

/**
 * Check if any certifications exist
 */
export function hasCertifications(): boolean {
  return certifications.length > 0;
}

/**
 * Check if any awards exist
 */
export function hasAwards(): boolean {
  return awards.length > 0;
}

/**
 * Format education as a string
 */
export function formatEducation(edu: Education): string {
  return `${edu.degree} in ${edu.field} from ${edu.school} (${edu.endYear})`;
}

/**
 * Check if certification is expiring soon (within 6 months)
 */
export function isCertificationExpiringSoon(cert: Certification): boolean {
  if (!cert.expirationDate) return false;

  const now = new Date();
  const expDate = new Date(cert.expirationDate + '-01');
  const sixMonthsFromNow = new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000);

  return expDate <= sixMonthsFromNow && expDate > now;
}
