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
  'Languages',      // Programming languages & frameworks
  'Frontend',       // Frontend frameworks & libraries
  'Backend',        // Backend frameworks & technologies
  'Architecture',   // System architecture & distributed systems
  'Databases',      // Database technologies
  'DevOps',         // DevOps tools & practices
  'Security',       // Security & encryption
  'Monitoring',     // Monitoring & logging
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
  // PROGRAMMING LANGUAGES & FRAMEWORKS
  // ---------------------------------------------------------------------------
  {
    name: 'Java Core',
    level: 90,
    category: 'Languages',
    yearsOfExperience: 4,
  },
  {
    name: 'Spring Boot',
    level: 90,
    category: 'Languages',
    yearsOfExperience: 4,
  },
  {
    name: 'Spring Framework',
    level: 85,
    category: 'Languages',
    yearsOfExperience: 4,
  },
  {
    name: 'Hibernate',
    level: 85,
    category: 'Languages',
    yearsOfExperience: 4,
  },
  {
    name: 'MyBatis',
    level: 75,
    category: 'Languages',
    yearsOfExperience: 2,
  },
  {
    name: 'JavaScript',
    level: 80,
    category: 'Languages',
    yearsOfExperience: 4,
  },

  // ---------------------------------------------------------------------------
  // FRONTEND
  // ---------------------------------------------------------------------------
  {
    name: 'ReactJS',
    level: 85,
    category: 'Frontend',
    yearsOfExperience: 3,
  },
  {
    name: 'Thymeleaf',
    level: 75,
    category: 'Frontend',
    yearsOfExperience: 2,
  },
  {
    name: 'JSP / Servlet',
    level: 70,
    category: 'Frontend',
    yearsOfExperience: 2,
  },
  {
    name: 'HTML / CSS',
    level: 80,
    category: 'Frontend',
    yearsOfExperience: 4,
  },
  {
    name: 'jQuery',
    level: 70,
    category: 'Frontend',
    yearsOfExperience: 2,
  },

  // ---------------------------------------------------------------------------
  // BACKEND
  // ---------------------------------------------------------------------------
  {
    name: 'Spring Cloud',
    level: 80,
    category: 'Backend',
    yearsOfExperience: 2,
  },
  {
    name: 'Feign Client',
    level: 80,
    category: 'Backend',
    yearsOfExperience: 2,
  },
  {
    name: 'Pentaho PDI (ETL)',
    level: 75,
    category: 'Backend',
    yearsOfExperience: 1,
  },

  // ---------------------------------------------------------------------------
  // ARCHITECTURE
  // ---------------------------------------------------------------------------
  {
    name: 'Microservices',
    level: 85,
    category: 'Architecture',
    yearsOfExperience: 2,
  },
  {
    name: 'Event-Driven Architecture',
    level: 85,
    category: 'Architecture',
    yearsOfExperience: 2,
  },
  {
    name: 'Apache Kafka',
    level: 80,
    category: 'Architecture',
    yearsOfExperience: 2,
  },
  {
    name: 'API Gateway (Apigee)',
    level: 80,
    category: 'Architecture',
    yearsOfExperience: 2,
  },

  // ---------------------------------------------------------------------------
  // DATABASES
  // ---------------------------------------------------------------------------
  {
    name: 'OracleDB',
    level: 85,
    category: 'Databases',
    yearsOfExperience: 3,
  },
  {
    name: 'PostgreSQL',
    level: 80,
    category: 'Databases',
    yearsOfExperience: 2,
  },
  {
    name: 'MySQL',
    level: 75,
    category: 'Databases',
    yearsOfExperience: 2,
  },
  {
    name: 'SQL Server',
    level: 65,
    category: 'Databases',
    yearsOfExperience: 1,
  },
  {
    name: 'Redis',
    level: 75,
    category: 'Databases',
    yearsOfExperience: 2,
  },

  // ---------------------------------------------------------------------------
  // DEVOPS
  // ---------------------------------------------------------------------------
  {
    name: 'Docker',
    level: 75,
    category: 'DevOps',
    yearsOfExperience: 2,
  },
  {
    name: 'Jenkins',
    level: 70,
    category: 'DevOps',
    yearsOfExperience: 2,
  },
  {
    name: 'Git / GitHub / GitLab',
    level: 85,
    category: 'DevOps',
    yearsOfExperience: 4,
  },
  {
    name: 'CI/CD',
    level: 75,
    category: 'DevOps',
    yearsOfExperience: 2,
  },

  // ---------------------------------------------------------------------------
  // SECURITY
  // ---------------------------------------------------------------------------
  {
    name: 'ECDH Encryption',
    level: 75,
    category: 'Security',
    yearsOfExperience: 2,
  },
  {
    name: 'RSA Encryption',
    level: 70,
    category: 'Security',
    yearsOfExperience: 2,
  },

  // ---------------------------------------------------------------------------
  // MONITORING
  // ---------------------------------------------------------------------------
  {
    name: 'ELK Stack',
    level: 75,
    category: 'Monitoring',
    yearsOfExperience: 2,
  },
  {
    name: 'Elasticsearch',
    level: 70,
    category: 'Monitoring',
    yearsOfExperience: 2,
  },
  {
    name: 'Kibana',
    level: 70,
    category: 'Monitoring',
    yearsOfExperience: 2,
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
  { name: 'English', level: 'Intermediate' },
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
