/**
 * =============================================================================
 * PROFILE DATA - Personal Information
 * =============================================================================
 *
 * AI CUSTOMIZATION INSTRUCTIONS:
 * This file contains all personal information displayed on the resume.
 * 
 * TO CUSTOMIZE:
 * 1. Replace ALL placeholder values with real information
 * 2. Update the photo path or use empty string '' for no photo
 * 3. Add/remove social links as needed
 * 4. Keep the summary concise (2-4 sentences recommended)
 * 5. Highlights should be measurable achievements (numbers are good!)
 *
 * EXAMPLES FOR AI:
 * - To change name: profile.name = 'Your Full Name'
 * - To change title: profile.title = 'Your Job Title'
 * - To update email: profile.email = 'your.email@example.com'
 * - To add/remove highlights: modify the highlights array
 * =============================================================================
 */

/**
 * Profile type definition
 * All fields are required unless marked optional
 */
export interface Profile {
  /** Full name as it should appear on the resume */
  name: string;

  /** Professional title/headline (e.g., "Senior Software Engineer", "UX Designer") */
  title: string;

  /**
   * Profile photo path
   * - Use '/images/profile.jpg' for local image in public/images/
   * - Use full URL for external image
   * - Use '' (empty string) to hide the photo
   */
  photo: string;

  /** Professional email address */
  email: string;

  /**
   * Phone number (optional)
   * Format: Include country code for international (e.g., "+1 555-123-4567")
   */
  phone?: string;

  /**
   * Location
   * Format: "City, Country" or "City, State" or "Remote"
   */
  location: string;

  /** Personal website URL (optional) */
  website?: string;

  /** LinkedIn profile URL (optional) */
  linkedin?: string;

  /** GitHub profile URL (optional) */
  github?: string;

  /** Twitter/X profile URL (optional) */
  twitter?: string;

  /**
   * Professional summary
   * - Keep it 2-4 sentences
   * - Highlight years of experience, expertise areas, and what you're passionate about
   * - Use active voice and strong verbs
   */
  summary: string;

  /**
   * Key highlights/achievements (shown prominently on profile)
   * - Use 3-5 highlights
   * - Include metrics when possible (numbers, percentages, etc.)
   * - Start each with an action verb
   */
  highlights: string[];
}

/**
 * =============================================================================
 * YOUR PROFILE DATA - CUSTOMIZE BELOW
 * =============================================================================
 * 
 * Replace ALL values below with your actual information.
 * Delete or comment out any optional fields you don't want to use.
 */
export const profile: Profile = {
  // -------------------------------------------------------------------------
  // BASIC INFO (Required)
  // -------------------------------------------------------------------------
  name: 'Nguyễn Quang Ngọc',
  title: 'Lập trình viên Backend / Full-Stack',
  photo: '/images/profile.jpg', // Set to '' to hide photo
  email: 'quangngoc201197@gmail.com',
  location: 'Đa Phúc, Hà Nội, Việt Nam',

  // -------------------------------------------------------------------------
  // CONTACT & SOCIAL (Optional - remove or set to undefined if not needed)
  // -------------------------------------------------------------------------
  phone: '0346238899',

  // -------------------------------------------------------------------------
  // PROFESSIONAL SUMMARY
  // Keep this concise: 2-4 sentences that capture who you are professionally
  // -------------------------------------------------------------------------
  summary: `Lập trình viên Backend / Full-Stack với hơn 4 năm kinh nghiệm xây dựng hệ thống tài chính - ngân hàng, bảo hiểm và sản phẩm cho khách hàng Nhật Bản. Thế mạnh ở Java 17, Spring Boot 3, kiến trúc Microservices, Oracle/PostgreSQL, Redis, Kafka, tích hợp Core Banking/ESB, bảo mật JWT/OAuth2/OTP và thiết kế API phục vụ nghiệp vụ có độ tin cậy cao. Đã tham gia các nền tảng thực tế cho SHB, MBBank và Bảo Việt, bao gồm cổng thanh toán dịch vụ công, Mobile Banking Campuchia, cổng xử lý nợ, hệ thống định giá tài sản thế chấp và bảo hiểm trực tuyến.`,

  // ---------------------------------------------------------------------------
  // KEY HIGHLIGHTS
  // 3-5 achievement statements with metrics when possible
  // ---------------------------------------------------------------------------
  highlights: [
    'Xây dựng backend cổng thanh toán dịch vụ công với luồng tạo QR, truy vấn, hoàn tiền, chi hộ và đối soát',
    'Phát triển 3 Microservices cho SHB Mobile Banking Campuchia: Identity, Account, Fund Transfer',
    'Thiết kế Gateway, Maker-Checker Workflow, MinIO file service và report module cho SHB Debit Collection Portal',
    'Tích hợp AI giảm 60% khối lượng nhập tay trong hệ thống CMV MBBank',
    'Kinh nghiệm tích hợp Core Banking, ESB, Napas, Oracle Stored Procedures, Kafka và Signature Service',
  ],
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get profile social links as an array
 * Useful for iterating over social links in components
 */
export function getProfileSocialLinks(): Array<{ platform: string; url: string }> {
  const links: Array<{ platform: string; url: string }> = [];

  if (profile.github) links.push({ platform: 'github', url: profile.github });
  if (profile.linkedin) links.push({ platform: 'linkedin', url: profile.linkedin });
  if (profile.twitter) links.push({ platform: 'twitter', url: profile.twitter });
  if (profile.website) links.push({ platform: 'website', url: profile.website });

  return links;
}

/**
 * Check if profile has a photo
 */
export function hasProfilePhoto(): boolean {
  return Boolean(profile.photo && profile.photo.length > 0);
}

/**
 * Get profile initials (for avatar fallback)
 */
export function getProfileInitials(): string {
  return profile.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}
