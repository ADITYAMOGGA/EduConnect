# MARKSHEET PRO - School Management System

## Overview

MARKSHEET PRO is a full-stack Single Page Application (SPA) designed as a comprehensive multi-organization school management system. It enables authenticated staff to manage students, enter exam marks, and generate digital progress certificates. The application supports multiple schools/organizations, offering a robust platform for academic administration, student data management, marks entry, and PDF certificate generation. It aims to provide an efficient, scalable, and user-friendly solution for educational institutions.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Multi-Organization Platform Architecture
- **Platform Type**: Multi-tenant SaaS with organization-based data isolation.
- **Authentication**: Three-tier role-based system (Platform Admin, School Admin, Teacher) with separate login portals and specific dashboards.
- **Data Structure**: Hierarchical organization → users → students/teachers/subjects.
- **Indian Education Compatibility**: Supports CBSE/ICSE/State Board systems with IST timezone.

### Frontend Architecture
- **Framework**: React 18 with TypeScript.
- **Build Tool**: Vite.
- **Routing**: Wouter with role-based protection.
- **State Management**: TanStack Query (React Query) for server state.
- **UI Components**: Radix UI primitives with custom shadcn/ui components.
- **Styling**: Tailwind CSS with role-specific gradient themes, including a modern purple/indigo design.
- **Animations**: Framer Motion for smooth transitions and micro-interactions.
- **Form Handling**: React Hook Form with Zod validation.
- **UI/UX Decisions**: Employs gradient designs, smooth animations, role selector landing page, separate login portals for each role with unique branding, and a professional Excel-like marks entry interface with inline editing.

### Backend Architecture
- **Framework**: Express.js with TypeScript.
- **Runtime**: Node.js with ESM modules.
- **Database**: Supabase PostgreSQL with Row Level Security.
- **Authentication**: Custom username/password with bcrypt hashing and session management using PostgreSQL storage.
- **File Uploads**: Multer for handling CSV imports.
- **AI Integration**: Google Gemini API for intelligent data insights (e.g., student performance analysis).

### Database Schema (Multi-Organization)
- **Core Tables**: organizations, admins, org_admins, teachers, students.
- **Academic Tables**: subjects, exams, marks, teacher_subjects.
- **System Tables**: sessions for authentication.
- **Relationships**: Proper foreign keys with cascade deletion.
- **Security**: Row Level Security policies for data isolation.
- **Performance**: Comprehensive indexing for fast queries.

### Key Features and Technical Implementations
- **Authentication System**: Custom username/password authentication, supporting Platform Admin, School Admin, and Teacher roles with dedicated login portals.
- **Student Management**: CRUD operations, CSV import for bulk student data, class-based filtering, and admission number/class management.
- **Marks Entry System**: Subject-wise marks entry, exam creation, Excel-like inline editing with real-time validation, automatic calculations (totals, percentages), and grade assignments.
- **Certificate Generation**: Dynamic preview, configurable options (photo, admission number, logo, marks display), PDF generation with professional styling (e.g., gradient backgrounds, tabular displays), and school branding integration.
- **Data Import/Export**: CSV file parsing for bulk imports with format validation and preview; export functionality (CSV, JSON).
- **Admin & School Admin Panels**: Comprehensive dashboards for managing users, organizations, students, teachers, and subjects with CRUD operations, statistics, and search/filter capabilities. Includes account hold functionality for users.
- **AI Assistant**: Gemini API integration for an AI-powered chatbot to provide student data insights.
- **Theming**: Dynamic theme switching with localStorage persistence.

## External Dependencies

- **Database**: Supabase PostgreSQL, @neondatabase/serverless
- **ORM**: drizzle-orm
- **State Management**: @tanstack/react-query
- **UI Libraries**: @radix-ui/react-*, shadcn/ui
- **Form Handling**: react-hook-form, zod
- **Authentication**: openid-client, passport, express-session, connect-pg-simple
- **File Handling**: multer, papaparse
- **Styling Utilities**: clsx, tailwind-merge
- **Icon System**: lucide-react
- **AI**: Google Gemini API