/**
 * =============================================================================
 * SKILLS DATA - Technical & Professional Skills
 * =============================================================================
 *
 * AI CUSTOMIZATION INSTRUCTIONS:
 * This file contains skills displayed in the Skills section.
 *
 * TO CUSTOMIZE:
 * 1. Replace example skills with your actual skills
 * 2. Set proficiency levels honestly (0-100)
 * 3. Organize skills by category
 * 4. Update spoken languages if applicable
 *
 * PROFICIENCY LEVEL GUIDE:
 * - 90-100: Expert (can teach others, deep knowledge)
 * - 70-89:  Advanced (proficient, used extensively)
 * - 50-69:  Intermediate (comfortable, moderate experience)
 * - 30-49:  Basic (familiar, some experience)
 * - 10-29:  Beginner (learning, minimal experience)
 *
 * TO ADD A NEW SKILL:
 * { name: 'Skill Name', level: 85, category: 'Category', yearsOfExperience: 3 }
 *
 * TO ADD A NEW CATEGORY:
 * 1. Add the category name to the skillCategories array
 * 2. Add skills with that category to the skills array
 * =============================================================================
 */

/**
 * Skill entry type definition
 */
export interface Skill {
  /** Skill name (e.g., "React", "Python", "Project Management") */
  name: string;

  /**
   * Proficiency level from 0-100
   * See guide above for recommended ranges
   */
  level: number;

  /**
   * Category for grouping skills
   * Must match one of the categories in skillCategories array
   */
  category: string;

  /**
   * Icon identifier (optional)
   * Can be used to display skill icons
   */
  icon?: string;

  /**
   * Years of experience with this skill (optional)
   */
  yearsOfExperience?: number;
}

/**
 * Spoken language type definition
 */
export interface Language {
  /** Language name (e.g., "English", "Spanish") */
  name: string;

  /**
   * Proficiency level
   * Options: 'Native' | 'Fluent' | 'Professional' | 'Intermediate' | 'Basic'
   */
  level: 'Native' | 'Fluent' | 'Professional' | 'Intermediate' | 'Basic';
}

/**
 * =============================================================================
 * SKILL CATEGORIES - CUSTOMIZE BELOW
 * =============================================================================
 *
 * These categories are used to group skills in the UI.
 * Add, remove, or rename categories as needed.
 */
export const skillCategories: string[] = [
  'Testing Process',    // Quy trình & phương pháp kiểm thử
  'API & Backend',      // Kiểm thử API và backend
  'Databases',          // Cơ sở dữ liệu & đối soát dữ liệu
  'Tools & Management', // Công cụ quản lý lỗi & dự án
  'Domain Knowledge',   // Nghiệp vụ chuyên ngành
  'Soft Skills',        // Kỹ năng mềm & tài liệu
];

/**
 * =============================================================================
 * YOUR SKILLS - CUSTOMIZE BELOW
 * =============================================================================
 *
 * Replace these example skills with your actual skills.
 * Group skills by category for better organization.
 */
export const skills: Skill[] = [
  // ---------------------------------------------------------------------------
  // TESTING PROCESS
  // ---------------------------------------------------------------------------
  {
    name: 'Manual Testing',
    level: 92,
    category: 'Testing Process',
    yearsOfExperience: 4,
  },
  {
    name: 'Test Plan / Test Case Design',
    level: 90,
    category: 'Testing Process',
    yearsOfExperience: 4,
  },
  {
    name: 'Regression Testing & Retest',
    level: 90,
    category: 'Testing Process',
    yearsOfExperience: 4,
  },
  {
    name: 'Requirement Analysis (SRS/Figma)',
    level: 85,
    category: 'Testing Process',
    yearsOfExperience: 4,
  },
  {
    name: 'Bug Reporting & Bug Lifecycle',
    level: 88,
    category: 'Testing Process',
    yearsOfExperience: 4,
  },
  {
    name: 'UAT Support & Production Issue',
    level: 82,
    category: 'Testing Process',
    yearsOfExperience: 3,
  },
  {
    name: 'Agile / Scrum',
    level: 80,
    category: 'Testing Process',
    yearsOfExperience: 4,
  },

  // ---------------------------------------------------------------------------
  // API & BACKEND TESTING
  // ---------------------------------------------------------------------------
  {
    name: 'Postman (API Testing)',
    level: 85,
    category: 'API & Backend',
    yearsOfExperience: 4,
  },
  {
    name: 'JSON Validation & Response Logic',
    level: 82,
    category: 'API & Backend',
    yearsOfExperience: 3,
  },
  {
    name: 'Backend Flow Verification',
    level: 78,
    category: 'API & Backend',
    yearsOfExperience: 3,
  },
  {
    name: 'Webhook Testing (Real-time Data)',
    level: 72,
    category: 'API & Backend',
    yearsOfExperience: 2,
  },

  // ---------------------------------------------------------------------------
  // DATABASES
  // ---------------------------------------------------------------------------
  {
    name: 'MySQL (SQL Query & Data Verify)',
    level: 82,
    category: 'Databases',
    yearsOfExperience: 4,
  },
  {
    name: 'MongoDB (Data Verification)',
    level: 70,
    category: 'Databases',
    yearsOfExperience: 2,
  },
  {
    name: 'Data Tracing & Reconciliation',
    level: 80,
    category: 'Databases',
    yearsOfExperience: 4,
  },

  // ---------------------------------------------------------------------------
  // TOOLS & MANAGEMENT
  // ---------------------------------------------------------------------------
  {
    name: 'Redmine (Bug Tracking)',
    level: 90,
    category: 'Tools & Management',
    yearsOfExperience: 4,
  },
  {
    name: 'Google Sheets (Report & Tracking)',
    level: 88,
    category: 'Tools & Management',
    yearsOfExperience: 4,
  },
  {
    name: 'Figma (UI/UX Review)',
    level: 75,
    category: 'Tools & Management',
    yearsOfExperience: 4,
  },
  {
    name: 'UltraViewer / AnyDesk (Remote)',
    level: 80,
    category: 'Tools & Management',
    yearsOfExperience: 3,
  },
  {
    name: 'Google Drive',
    level: 85,
    category: 'Tools & Management',
    yearsOfExperience: 4,
  },

  // ---------------------------------------------------------------------------
  // DOMAIN KNOWLEDGE
  // ---------------------------------------------------------------------------
  {
    name: 'HRM / Attendance Management',
    level: 90,
    category: 'Domain Knowledge',
    yearsOfExperience: 4,
  },
  {
    name: 'Access Control & Biometric',
    level: 88,
    category: 'Domain Knowledge',
    yearsOfExperience: 4,
  },
  {
    name: 'Multi-level Approval Workflow',
    level: 85,
    category: 'Domain Knowledge',
    yearsOfExperience: 3,
  },
  {
    name: 'Visitor Management (QR/CCCD)',
    level: 82,
    category: 'Domain Knowledge',
    yearsOfExperience: 2,
  },
  {
    name: 'Sync & Real-time Data Testing',
    level: 82,
    category: 'Domain Knowledge',
    yearsOfExperience: 4,
  },

  // ---------------------------------------------------------------------------
  // SOFT SKILLS
  // ---------------------------------------------------------------------------
  {
    name: 'User Guide & Training Materials',
    level: 85,
    category: 'Soft Skills',
    yearsOfExperience: 4,
  },
  {
    name: 'Customer Training & Handover',
    level: 82,
    category: 'Soft Skills',
    yearsOfExperience: 3,
  },
  {
    name: 'Time Estimation & Planning',
    level: 78,
    category: 'Soft Skills',
    yearsOfExperience: 4,
  },
];

/**
 * =============================================================================
 * SPOKEN LANGUAGES - CUSTOMIZE BELOW
 * =============================================================================
 *
 * List the languages you speak and your proficiency level.
 */
export const languages: Language[] = [
  { name: 'Tiếng Việt', level: 'Native' },
  { name: 'English', level: 'Basic' },
];

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get skills filtered by category
 */
export function getSkillsByCategory(category: string): Skill[] {
  return skills.filter((skill) => skill.category === category);
}

/**
 * Get top N skills sorted by proficiency level
 */
export function getTopSkills(count: number = 6): Skill[] {
  return [...skills].sort((a, b) => b.level - a.level).slice(0, count);
}

/**
 * Get all unique skill categories actually used in skills array
 */
export function getUsedCategories(): string[] {
  const categories = new Set(skills.map((skill) => skill.category));
  // Return in the order defined in skillCategories
  return skillCategories.filter((cat) => categories.has(cat));
}

/**
 * Get skills grouped by category
 */
export function getSkillsGroupedByCategory(): Record<string, Skill[]> {
  const grouped: Record<string, Skill[]> = {};

  skillCategories.forEach((category) => {
    const categorySkills = getSkillsByCategory(category);
    if (categorySkills.length > 0) {
      grouped[category] = categorySkills;
    }
  });

  return grouped;
}

/**
 * Calculate average skill level
 */
export function getAverageSkillLevel(): number {
  if (skills.length === 0) return 0;
  const total = skills.reduce((sum, skill) => sum + skill.level, 0);
  return Math.round(total / skills.length);
}

/**
 * Get proficiency label for a skill level
 */
export function getSkillProficiencyLabel(level: number): string {
  if (level >= 90) return 'Expert';
  if (level >= 70) return 'Advanced';
  if (level >= 50) return 'Intermediate';
  if (level >= 30) return 'Basic';
  return 'Beginner';
}
