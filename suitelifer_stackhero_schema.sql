-- ============================================================================
-- SUITELIFER DATABASE SCHEMA - STACKHERO HOSTED
-- ============================================================================
-- 
-- Database: dev_SuiteLifer
-- Host: 42o7ch.stackhero-network.com
-- Port: 7432
-- Created: December 2024
-- 
-- This schema represents the complete database structure for the SuiteLifer
-- application hosted on Stackhero. All tables, constraints, and relationships
-- are accurately documented.
-- 
-- ============================================================================

-- ============================================================================
-- USER ACCOUNTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS `sl_user_accounts` (
  `user_id` char(36) NOT NULL,
  `user_email` varchar(100) NOT NULL,
  `user_password` varchar(100) NOT NULL,
  `user_type` enum('SUPER ADMIN','ADMIN','EMPLOYEE') NOT NULL DEFAULT 'EMPLOYEE',
  `first_name` varchar(50) NOT NULL,
  `middle_name` varchar(50) DEFAULT NULL,
  `last_name` varchar(50) NOT NULL,
  `profile_pic` text,
  `is_verified` tinyint(1) NOT NULL DEFAULT '0',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL,
  PRIMARY KEY (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
COMMENT='User account information and authentication';

-- ============================================================================
-- AUDIT LOGS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS `sl_audit_logs` (
  `log_id` char(36) NOT NULL,
  `description` text NOT NULL,
  `date` timestamp NOT NULL,
  `action` enum('CREATE','UPDATE','DELETE') NOT NULL,
  `user_id` char(36) NOT NULL,
  PRIMARY KEY (`log_id`),
  KEY `sl_audit_logs_ibfk_1_idx` (`user_id`),
  CONSTRAINT `sl_audit_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `sl_user_accounts` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
COMMENT='System audit trail for tracking user actions';

-- ============================================================================
-- VERIFICATION CODES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS `sl_verification_codes` (
  `code_id` char(36) NOT NULL,
  `user_id` char(36) NOT NULL,
  `verification_code` char(60) NOT NULL,
  `created_at` timestamp NOT NULL,
  `expires_at` timestamp NOT NULL,
  PRIMARY KEY (`code_id`),
  KEY `sl_email_verification_codes_ibfk_1_idx` (`user_id`),
  CONSTRAINT `sl_verification_codes_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `sl_user_accounts` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
COMMENT='Email verification codes for user registration';

-- ============================================================================
-- CONTENT MANAGEMENT TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS `sl_content` (
  `content_id` char(36) NOT NULL,
  `get_in_touch_image` text NOT NULL,
  `kickstart_video` text NOT NULL,
  `text_banner` text NOT NULL,
  `about_hero_image` text NOT NULL,
  `about_background_image` text NOT NULL,
  `about_video` text NOT NULL,
  `team_player_video` text NOT NULL,
  `understood_video` text NOT NULL,
  `focused_video` text NOT NULL,
  `upholds_video` text NOT NULL,
  `harmony_video` text NOT NULL,
  `mission_slogan` varchar(255) NOT NULL,
  `mission` text NOT NULL,
  `mission_video` text NOT NULL,
  `vision_slogan` varchar(255) NOT NULL,
  `vision` text NOT NULL,
  `vision_video` text NOT NULL,
  `day_in_pod_url` text NOT NULL,
  `careers_main_image` text NOT NULL,
  `careers_left_image` text NOT NULL,
  `careers_right_image` text NOT NULL,
  `created_at` timestamp NOT NULL,
  `created_by` char(36) NOT NULL,
  PRIMARY KEY (`content_id`),
  KEY `sl_content_ibfk_1_idx` (`created_by`),
  CONSTRAINT `sl_content_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `sl_user_accounts` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
COMMENT='Dynamic content management for website pages';

-- ============================================================================
-- EMPLOYEE BLOGS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS `sl_employee_blogs` (
  `eblog_id` char(36) NOT NULL,
  `title` varchar(70) NOT NULL,
  `description` text NOT NULL,
  `is_shown` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL,
  `created_by` char(36) NOT NULL,
  PRIMARY KEY (`eblog_id`),
  KEY `sl_employee_blogs_ibfk_1_idx` (`created_by`),
  CONSTRAINT `sl_employee_blogs_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `sl_user_accounts` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
COMMENT='Employee blog posts and articles';

-- ============================================================================
-- EMPLOYEE BLOG IMAGES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS `sl_employee_blog_images` (
  `eblog_image_id` char(36) NOT NULL,
  `image_url` text NOT NULL,
  `eblog_id` char(36) NOT NULL,
  PRIMARY KEY (`eblog_image_id`),
  KEY `sl_employee_blogs_ibfk_1_idx` (`eblog_id`),
  KEY `sl_employee_blog_images_ibfk_1_idx` (`eblog_id`),
  CONSTRAINT `sl_employee_blog_images_ibfk_1` FOREIGN KEY (`eblog_id`) REFERENCES `sl_employee_blogs` (`eblog_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
COMMENT='Images associated with employee blog posts';

-- ============================================================================
-- E-BLOG COMMENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS `sl_eblog_comments` (
  `comment_id` char(36) NOT NULL,
  `comment` varchar(100) NOT NULL,
  `content_id` char(36) NOT NULL,
  `created_at` timestamp NOT NULL,
  `created_by` char(36) NOT NULL,
  PRIMARY KEY (`comment_id`),
  KEY `content_id` (`content_id`),
  KEY `sl_eblog_comments_ibfk_2_idx` (`created_by`),
  CONSTRAINT `sl_eblog_comments_ibfk_1` FOREIGN KEY (`content_id`) REFERENCES `sl_employee_blogs` (`eblog_id`),
  CONSTRAINT `sl_eblog_comments_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `sl_user_accounts` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
COMMENT='Comments on employee blog posts';

-- ============================================================================
-- E-BLOG LIKES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS `sl_eblog_likes` (
  `like_id` char(36) NOT NULL,
  `eblog_id` char(36) NOT NULL,
  `user_id` char(36) NOT NULL,
  `created_at` timestamp NOT NULL,
  PRIMARY KEY (`like_id`),
  KEY `eblog_id` (`eblog_id`),
  KEY `sl_eblog_likes_ibfk_2_idx` (`created_at`),
  KEY `sl_eblog_likes_ibfk_2_idx1` (`user_id`),
  CONSTRAINT `sl_eblog_likes_ibfk_1` FOREIGN KEY (`eblog_id`) REFERENCES `sl_employee_blogs` (`eblog_id`),
  CONSTRAINT `sl_eblog_likes_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `sl_user_accounts` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
COMMENT='Likes on employee blog posts';

-- ============================================================================
-- EVENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS `sl_events` (
  `event_id` char(36) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `date_start` timestamp NOT NULL,
  `date_end` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL,
  `created_by` char(36) NOT NULL,
  PRIMARY KEY (`event_id`),
  KEY `sl_events_ibfk_1_idx` (`created_by`),
  CONSTRAINT `sl_events_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `sl_user_accounts` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
COMMENT='Company events and activities';

-- ============================================================================
-- FAQS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS `sl_faqs` (
  `faq_id` char(36) NOT NULL,
  `question` text NOT NULL,
  `answer` text NOT NULL,
  `is_shown` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL,
  `created_by` char(36) NOT NULL,
  PRIMARY KEY (`faq_id`),
  KEY `sl_faqs_ibfk_1_idx` (`created_by`),
  CONSTRAINT `sl_faqs_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `sl_user_accounts` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
COMMENT='Frequently asked questions';

-- ============================================================================
-- CONTACT INFORMATION TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS `sl_contact` (
  `contact_id` char(36) NOT NULL,
  `website_email` varchar(100) NOT NULL,
  `website_tel` varchar(30) NOT NULL,
  `website_phone` varchar(30) NOT NULL,
  `careers_email` varchar(100) NOT NULL,
  `internship_email` varchar(100) NOT NULL,
  `careers_phone` varchar(30) NOT NULL,
  `created_at` timestamp NOT NULL,
  `created_by` char(36) NOT NULL,
  PRIMARY KEY (`contact_id`),
  KEY `sl_contact_ibfk_1_idx` (`created_by`),
  CONSTRAINT `sl_contact_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `sl_user_accounts` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
COMMENT='Contact information for different departments';

-- ============================================================================
-- COURSES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS `sl_courses` (
  `course_id` char(36) NOT NULL,
  `title` varchar(50) NOT NULL,
  `description` text NOT NULL,
  `url` text NOT NULL,
  `created_at` timestamp NOT NULL,
  `created_by` char(36) NOT NULL,
  PRIMARY KEY (`course_id`),
  KEY `sl_courses_ibfk_1_idx` (`created_by`),
  CONSTRAINT `sl_courses_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `sl_user_accounts` (`user_id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
COMMENT='Training courses and educational content';

-- ============================================================================
-- CERTIFICATIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS `sl_certifications` (
  `cert_id` char(36) NOT NULL,
  `cert_img_url` text NOT NULL,
  `created_at` timestamp NOT NULL,
  `created_by` char(36) NOT NULL,
  PRIMARY KEY (`cert_id`),
  KEY `sl_certifications_ibfk_1_idx` (`created_by`),
  CONSTRAINT `sl_certifications_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `sl_user_accounts` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
COMMENT='Professional certifications and achievements';

-- ============================================================================
-- PERSONALITY TESTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS `sl_personality_tests` (
  `test_id` char(36) NOT NULL,
  `test_title` varchar(50) NOT NULL,
  `test_url` text NOT NULL,
  `test_description` text NOT NULL,
  `created_at` timestamp NOT NULL,
  `created_by` char(36) NOT NULL,
  PRIMARY KEY (`test_id`),
  KEY `sl_personality_tests_ibfk_1_idx` (`created_by`),
  CONSTRAINT `sl_personality_tests_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `sl_user_accounts` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
COMMENT='Personality assessment tests';

-- ============================================================================
-- SPOTIFY EMBEDS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS `sl_spotify_embeds` (
  `episode_id` char(36) NOT NULL,
  `spotify_id` char(22) NOT NULL,
  `embed_type` enum('EPISODE','PLAYLIST') NOT NULL,
  `created_at` timestamp NOT NULL,
  `created_by` char(36) NOT NULL,
  PRIMARY KEY (`episode_id`),
  KEY `sl_spotify_embeds_ibfk_1_idx` (`created_by`),
  CONSTRAINT `sl_spotify_embeds_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `sl_user_accounts` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
COMMENT='Spotify podcast episodes and playlists';

-- ============================================================================
-- PRIVACY POLICY TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS `sl_privacy_policy` (
  `policy_id` char(36) NOT NULL,
  `title` text NOT NULL,
  `description` text NOT NULL,
  `created_at` timestamp NOT NULL,
  `created_by` char(36) NOT NULL,
  PRIMARY KEY (`policy_id`),
  KEY `sl_privacy_policy_ibfk_1_idx` (`created_by`),
  CONSTRAINT `sl_privacy_policy_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `sl_user_accounts` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
COMMENT='Privacy policy content';

-- ============================================================================
-- TERMS OF USE TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS `sl_terms_of_use` (
  `terms_id` char(36) NOT NULL,
  `title` text NOT NULL,
  `description` text NOT NULL,
  `created_at` timestamp NOT NULL,
  `created_by` char(36) NOT NULL,
  PRIMARY KEY (`terms_id`),
  KEY `sl_terms_of_use_ibfk_1_idx` (`created_by`),
  CONSTRAINT `sl_terms_of_use_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `sl_user_accounts` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
COMMENT='Terms of use content';

-- ============================================================================
-- TESTIMONIALS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS `sl_testimonials` (
  `testimonial_id` char(36) NOT NULL,
  `employee_name` text NOT NULL,
  `position` text NOT NULL,
  `testimony` text NOT NULL,
  `is_shown` tinyint NOT NULL DEFAULT '1',
  `employee_image_url` text NOT NULL,
  `created_at` timestamp NOT NULL,
  `created_by` char(36) NOT NULL,
  PRIMARY KEY (`testimonial_id`),
  KEY `sl_testimonials_ibfk_1_idx` (`created_by`),
  CONSTRAINT `sl_testimonials_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `sl_user_accounts` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
COMMENT='Employee testimonials and reviews';

-- ============================================================================
-- JOB INDUSTRIES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS `sl_job_industries` (
  `job_ind_id` char(36) NOT NULL,
  `industry_name` varchar(50) NOT NULL,
  `company_id` char(36) NOT NULL,
  `image_url` text,
  `assessment_url` text NOT NULL,
  `created_at` timestamp NOT NULL,
  `created_by` char(36) NOT NULL,
  PRIMARY KEY (`job_ind_id`),
  KEY `created_by` (`created_by`),
  KEY `sl_job_industries_ibfk_1` (`company_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
COMMENT='Job industry classifications';

-- ============================================================================
-- COMPANY JOBS SETUPS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS `sl_company_jobs_setups` (
  `setup_id` char(36) NOT NULL,
  `setup_name` varchar(20) NOT NULL,
  `created_at` timestamp NOT NULL,
  `created_by` char(36) NOT NULL,
  PRIMARY KEY (`setup_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
COMMENT='Job setup configurations';

-- ============================================================================
-- COMPANY JOBS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS `sl_company_jobs` (
  `job_id` char(36) NOT NULL,
  `title` varchar(60) NOT NULL,
  `industry_id` char(36) NOT NULL,
  `employment_type` enum('Full-time','Part-time','Contract','Internship') NOT NULL,
  `setup_id` char(36) NOT NULL,
  `description` text NOT NULL,
  `salary_min` int DEFAULT '0',
  `salary_max` int DEFAULT '0',
  `responsibility` text,
  `requirement` text,
  `preferred_qualification` text,
  `is_open` tinyint(1) NOT NULL,
  `is_shown` tinyint(1) NOT NULL,
  `created_at` timestamp NOT NULL,
  `created_by` char(36) NOT NULL,
  `company_id` char(36) NOT NULL,
  PRIMARY KEY (`job_id`),
  KEY `company_id` (`company_id`),
  KEY `setup_id` (`setup_id`),
  KEY `industry_id` (`industry_id`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `sl_company_jobs_ibfk_2` FOREIGN KEY (`setup_id`) REFERENCES `sl_company_jobs_setups` (`setup_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `sl_company_jobs_ibfk_3` FOREIGN KEY (`industry_id`) REFERENCES `sl_job_industries` (`job_ind_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
COMMENT='Job postings and career opportunities';

-- ============================================================================
-- NEWSLETTER ISSUES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS `sl_newsletter_issues` (
  `issue_id` char(36) NOT NULL,
  `month` tinyint NOT NULL,
  `year` year NOT NULL,
  `is_published` tinyint NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL,
  `created_by` char(36) NOT NULL,
  PRIMARY KEY (`issue_id`),
  KEY `sl_issues_ibfk_1_idx` (`created_by`),
  CONSTRAINT `sl_newsletter_issues_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `sl_user_accounts` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
COMMENT='Newsletter issue management';

-- ============================================================================
-- NEWSLETTERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS `sl_newsletters` (
  `newsletter_id` char(36) NOT NULL,
  `title` varchar(150) NOT NULL,
  `article` text NOT NULL,
  `section` tinyint NOT NULL DEFAULT '0',
  `pseudonym` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL,
  `created_by` char(36) NOT NULL,
  `issue_id` char(36) NOT NULL,
  PRIMARY KEY (`newsletter_id`),
  KEY `sl_news_ibfk_1_idx` (`created_by`),
  KEY `sl_newsletters_ibfk_1_idx` (`issue_id`),
  CONSTRAINT `sl_newsletters_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `sl_user_accounts` (`user_id`),
  CONSTRAINT `sl_newsletters_ibfk_2` FOREIGN KEY (`issue_id`) REFERENCES `sl_newsletter_issues` (`issue_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
COMMENT='Newsletter articles and content';

-- ============================================================================
-- NEWSLETTER IMAGES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS `sl_newsletter_images` (
  `newsletter_image_id` char(36) NOT NULL,
  `image_url` text NOT NULL,
  `newsletter_id` char(36) NOT NULL,
  PRIMARY KEY (`newsletter_image_id`),
  KEY `sl_news_images_ibfk_1_idx` (`newsletter_id`),
  CONSTRAINT `sl_newsletter_images_ibfk_1` FOREIGN KEY (`newsletter_id`) REFERENCES `sl_newsletters` (`newsletter_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
COMMENT='Images associated with newsletter articles';

-- ============================================================================
-- SCHEMA SUMMARY
-- ============================================================================
-- 
-- Total Tables: 24
-- 
-- Core Tables:
-- - sl_user_accounts (User management)
-- - sl_audit_logs (System audit trail)
-- - sl_verification_codes (Email verification)
-- 
-- Content Management:
-- - sl_content (Dynamic website content)
-- - sl_employee_blogs (Blog posts)
-- - sl_employee_blog_images (Blog images)
-- - sl_eblog_comments (Blog comments)
-- - sl_eblog_likes (Blog likes)
-- 
-- Company & Careers:
-- - sl_company_jobs (Job postings)
-- - sl_company_jobs_setups (Job configurations)
-- - sl_job_industries (Industry classifications)
-- - sl_courses (Training courses)
-- - sl_certifications (Professional certifications)
-- - sl_personality_tests (Assessment tests)
-- 
-- Events & Activities:
-- - sl_events (Company events)
-- 
-- Support & Legal:
-- - sl_contact (Contact information)
-- - sl_faqs (Frequently asked questions)
-- - sl_testimonials (Employee testimonials)
-- - sl_privacy_policy (Privacy policy)
-- - sl_terms_of_use (Terms of use)
-- 
-- Media & Content:
-- - sl_spotify_embeds (Spotify content)
-- 
-- Newsletter System:
-- - sl_newsletter_issues (Newsletter issues)
-- - sl_newsletters (Newsletter articles)
-- - sl_newsletter_images (Newsletter images)
-- 
-- ============================================================================ 