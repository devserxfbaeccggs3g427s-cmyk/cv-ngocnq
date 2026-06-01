# Active Context: Live Resume Template

## Current State

**Template Status**: ✅ Complete and production-ready

The template is fully implemented with all core sections working. It's ready for AI-assisted customization.

## Recently Completed

- [x] Added C12 GOV Payment Service project entry (featured), timeline 2026-05 – present
- [x] Added current Alphaway/SHB C12 GOV Payment Service experience from May 2026
- [x] Corrected SHB Debit Collection Portal experience to Nov 2025 – Jan 2026, no longer current
- [x] Updated profile summary & highlights to emphasize payment gateway, VietQR/Napas EMVCo, refund, disbursement and reconciliation
- [x] Added C12-related skills: Spring Data JPA, JdbcTemplate, RestTemplate integration, VietQR/Napas EMVCo, Payment Gateway, idempotency/retry, digital signature, AOP logging, MDC tracing, Actuator and JUnit/Mockito
- [x] Added SHB Debit Collection Portal project entry (featured), timeline 2025-11 – 2026-01
- [x] Added SHB SAHA Mobile Banking Cambodia experience: Backend Developer at Alphaway/SHB (Jan 2026 – Apr 2026)
- [x] Added SHB SAHA Mobile Banking Cambodia project entry (featured)
- [x] Updated skills: Spring Security, Oracle PL/SQL, JWT/Nimbus JOSE, SMS Gateway
- [x] Updated profile summary & highlights to reflect SHB Mobile Banking Cambodia
- [x] Added new work experience: Alphaway (Onsite SHB Bank) — Backend Developer from Nov 2025
- [x] Updated MBBank experience: set end date Oct 2025, marked as not current
- [x] Updated profile summary & highlights to reflect SHB Debit Collection Portal project
- [x] Added new skills: Spring Cloud Gateway, Eureka, Keycloak OIDC, MinIO, Apache POI, iText, MapStruct, Kubernetes, GitLab CI/CD, reCAPTCHA v3
- [x] Profile header with photo support
- [x] Professional summary section
- [x] Experience timeline with animations
- [x] Skills section with visual progress bars
- [x] Education section with certifications and awards
- [x] Portfolio page with project filtering
- [x] Contact section with form
- [x] Print-optimized view
- [x] Side navigation for desktop
- [x] Dark mode support
- [x] Centralized configuration in site.config.ts
- [x] Memory bank migrated to .kilocode/rules/memory-bank/

## Components Implemented

| Component | File | Status |
|-----------|------|--------|
| Profile Header | `src/components/resume/ProfileHeader.tsx` | ✅ Complete |
| Summary | `src/components/resume/Summary.tsx` | ✅ Complete |
| Experience Timeline | `src/components/resume/ExperienceTimeline.tsx` | ✅ Complete |
| Skills Section | `src/components/resume/SkillsSection.tsx` | ✅ Complete |
| Education Section | `src/components/resume/EducationSection.tsx` | ✅ Complete |
| Certifications | `src/components/resume/CertificationsSection.tsx` | ✅ Complete |
| Languages | `src/components/resume/LanguagesSection.tsx` | ✅ Complete |
| Portfolio Grid | `src/components/portfolio/ProjectGrid.tsx` | ✅ Complete |
| Contact Form | `src/components/contact/ContactForm.tsx` | ✅ Complete |
| Header | `src/components/layout/Header.tsx` | ✅ Complete |
| Footer | `src/components/layout/Footer.tsx` | ✅ Complete |
| Side Nav | `src/components/layout/SideNav.tsx` | ✅ Complete |

## Current Focus

The resume has been fully customized for **Nguyễn Quang Ngọc** (Full-Stack Developer, Hà Nội):
- Profile: quangngoc201197@gmail.com, 0346238899, Đa Phúc Hà Nội
- 6 work experience entries: Alphaway/SHB C12 GOV Payment Service (current), SHB SAHA Mobile Banking Cambodia, SHB Debit Collection Portal, Paraline/MBBank, Bảo Việt, GMO Runsystem
- Skills in Java/Spring Boot, Spring Cloud, Microservices, Kafka, REST/ESB/Core Banking integration, VietQR/Napas EMVCo, OracleDB, PostgreSQL, Redis, Keycloak, MinIO, ELK, Docker, Kubernetes
- Education: UTT (2023–2025) and FPT Polytechnic (2020–2022)
- 8 projects: C12 GOV Payment Service, SHB Debit Collection Portal, SHB SAHA Mobile Banking Cambodia, CMV MBBank, MyBV Life, Veritas, Hywork, HR Management System

## Quick Customization Guide

### To change personal info:
Edit `src/data/profile.ts`:
- `profile.name` - Full name
- `profile.title` - Job title
- `profile.email` - Contact email
- `profile.summary` - Professional summary

### To change work experience:
Edit `src/data/experience.ts`:
- Add/modify entries in `experience` array
- Include title, company, dates, achievements

### To change skills:
Edit `src/data/skills.ts`:
- Add/modify entries in `skills` array
- Set `level` (0-100) for skill bars
- Organize by `category`

### To change theme color:
Edit `src/config/site.config.ts`:
- `theme.primaryColor` - HSL color value
- Popular options: Blue `220 92% 50%`, Purple `280 70% 50%`, Green `150 70% 45%`

### To toggle features:
Edit `src/config/site.config.ts` → `features`:
- `portfolio: boolean` - Show/hide portfolio
- `skillBars: boolean` - Show/hide skill bars
- `certifications: boolean` - Show/hide certifications
- `sideNav: boolean` - Show/hide side navigation

## Known Considerations

- Profile image expects `/images/profile.jpg` → Add real photo
- Project thumbnails expect `/projects/` images
- Contact form needs backend integration for email
- Avatar images use placeholders → Replace with real photos

## Pending Improvements (Optional)

- [ ] Add more theme color presets
- [ ] Add skills chart visualization
- [ ] Add testimonials/recommendations section
- [ ] Add blog/articles integration
- [ ] Add multi-language support

## Session History

| Date | Activity |
|------|----------|
| 2026-01-22 | Memory bank updated to match .kilocode standard structure |
| 2026-04-15 | Customized all data files for Nguyễn Quang Ngọc (Full-Stack Developer, Vietnam) |
| 2026-05-04 | Added Alphaway/SHB experience (Nov 2025–present), SHB Debit Collection Portal project, updated skills |
| 2026-05-05 | Added SHB SAHA Mobile Banking Cambodia experience & project (Jan–Apr 2026), updated skills & profile |
| 2026-05-05 | Added SHB Debit Collection Portal project entry (2025-11 – 2026-01) |
| 2026-06-01 | Added C12 GOV Payment Service current experience & featured project (May 2026–present), updated profile and skills |
