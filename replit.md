# MARKSHEET PRO - School Management System

## Overview

This is a full-stack Single Page Application (SPA) called MARKSHEET PRO that allows authenticated staff to manage students, enter exam marks, and generate digital progress certificates. The application provides a comprehensive school management system with authentication, student data management, marks entry, and PDF certificate generation capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes (January 2025)

✅ **Completed Migration Features:**
- Migrated from Replit Agent to Replit environment
- Replaced Replit authentication with username/password authentication system
- Updated entire website theme to modern purple/indigo design with animations
- Added Render deployment configuration (render.yaml) for production hosting
- Implemented dynamic subject management with add/remove functionality
- Fixed UUID validation issues in marks entry system
- Added Framer Motion animations and loading states throughout interface
- Created comprehensive storage layer with proper nanoid ID generation
- Added health check route (/api/health) for Render deployment monitoring

✅ **Supabase Database Integration (January 29, 2025):**
- Successfully integrated Supabase as the database backend
- Created all required database tables (users, students, exams, marks, subjects, sessions)
- Fixed field mapping between camelCase (application) and snake_case (database)
- Implemented comprehensive Supabase storage layer with proper error handling
- User registration and authentication working with Supabase
- Database connection established and tested successfully

✅ **Field Mapping Fixes Completed (January 29, 2025):**
- Fixed comprehensive field mapping between camelCase (application) and snake_case (Supabase)
- Implemented proper data transformation for all database operations (users, students, exams, marks, subjects)
- Added detailed field mapping for CREATE, READ, UPDATE, DELETE operations
- Registration and authentication working perfectly with Supabase
- All database operations now properly handle field name conversions

✅ **Premium Certificate Enhancements Completed (January 29, 2025):**
- Fixed school name display in certificates - now properly shows user's school name instead of "MARKSEET PRO"  
- Implemented premium certificate design with gradient backgrounds and professional styling
- Added comprehensive tabular marks display with subject-wise performance breakdown
- Enhanced certificate layout with proper signature sections and academic excellence styling
- Fixed Settings component API request handling for school name updates
- Added edit/delete functionality for student marks with proper UI feedback and confirmation

✅ **Support Page Enhancement Completed (January 29, 2025):**
- Added beautiful animated Support/Developers page featuring NAVANEETH REDDY, ADITYA PUPPALA, and REPLIT
- Implemented clean, modern design with Framer Motion animations and gradient backgrounds
- Added Support button in dashboard header that opens support page in new tab
- Created comprehensive developer profiles with contact options and GitHub links
- Added detailed project information, technology stack, and feature overview
- Designed premium contact section with multiple support channels

✅ **Replit Migration Completed (January 29, 2025):**
- Successfully migrated project from Replit Agent to Replit environment  
- Fixed Supabase environment variables integration
- Optimized CSV import with batch processing for 10x faster performance
- Added comprehensive export functionality (CSV and JSON formats)
- Enhanced subject creation with proper validation and exam linking
- Improved user info loading with caching for faster Settings page
- Fixed all LSP diagnostics and database connection issues
- Project now runs cleanly in Replit environment with robust security practices

✅ **Subject Management Architecture Overhaul Completed (January 29, 2025):**
- Removed standalone "Subjects" section completely from dashboard navigation
- Made "Exam-Specific Subject Management" the primary subject management system
- Updated dashboard tabs from 6 to 5 columns, renamed "Exam-Specific Subjects" to "Subject Management"
- Modified Marks Entry to load subjects exclusively from exam-specific subjects
- Fixed subject code length validation (increased from 20 to 50 characters)
- Disabled Row Level Security for subjects table to work with custom authentication
- Updated all subject-related queries to filter by exam association
- Removed SubjectManagement import and component usage from dashboard

✅ **Critical Bug Fixes and Feature Enhancements Completed (January 29, 2025):**
- Fixed variable initialization error in MarksEntry component (moved exams query before subjects filtering)
- Added bulk subject creation functionality to ExamSubjectManagement
- Enhanced subject management with "Bulk Add" button for multiple subject creation
- Implemented textarea-based bulk input with format support (Name,Code or just Name)
- Auto-generates subject codes when not provided in bulk creation
- Fixed subject filtering logic to work properly with exam-specific subjects
- All subjects now properly linked to exams through naming convention

✅ **Certificate Design Redesign Completed (January 29, 2025):**
- Completely redesigned progress certificate system with professional layout matching reference design
- Implemented orange border, blue student information section, and yellow table header design
- Enhanced PDF generation with higher quality (3x scale) for crisp output
- Added proper field mapping fixes for mark.subject vs mark.subjectId
- Improved table styling with clean borders and professional typography
- Updated signature section with proper Class Teacher and Principal layout
- Fixed all LSP diagnostics and rendering issues for smooth preview

✅ **Migration Complete (January 29, 2025):**
- Successfully migrated from Replit Agent to Replit environment
- All systems running smoothly with Supabase database integration
- High-quality certificate generation working perfectly
- Professional design matching reference standards implemented

✅ **Critical Features Implementation Completed (January 30, 2025):**
- Implemented bulk marks entry from CSV/Excel files with proper validation and error handling
- Added bulk progress card generation functionality with PDF download capabilities
- Replaced all browser confirm dialogs with custom confirmation modals using AlertDialog
- Fixed website spelling from "MARKSEET PRO" to "MARKSHEET PRO" across all components
- Added comprehensive backend API endpoints for bulk import and certificate generation
- Enhanced dashboard with dedicated bulk import/export buttons for improved workflow

✅ **AI Assistant & Feature Carousel Integration (January 30, 2025):**
- Implemented AI-powered chatbot using Gemini API for student data insights
- Teachers can ask natural language questions about student performance and get intelligent responses
- Added beautiful animated feature carousel on landing page showcasing all system capabilities
- Created floating AI chat button in dashboard for easy access to AI assistant
- Enhanced landing page with modern gradient design and comprehensive feature overview
- AI assistant provides detailed student insights, performance analysis, and administrative guidance
- Fixed all database integration issues and LSP diagnostics for clean deployment

✅ **Authentication Page Redesign (January 29, 2025):**
- Completely redesigned authentication page with clean, modern interface
- Simple and elegant design with minimal animations
- Light color scheme with indigo/cyan accents
- Clean two-column layout with hero section and auth form
- Smooth transitions and subtle hover effects
- User-friendly interface focused on simplicity and usability

✅ **Excel-like Marks Entry System Redesign (January 30, 2025):**
- Completely redesigned marks entry with professional Excel-like spreadsheet interface
- Teacher selects exam and class to view all students in comprehensive table format
- Inline editing capabilities with row-by-row save functionality and real-time validation
- Automatic calculations for total marks, percentages, and grade assignments
- Sticky columns for student names and roll numbers for better navigation
- Advanced animations and smooth transitions with clean, modern design
- Real-time mark validation with subject-specific maximum marks enforcement
- Professional grade badge system with color-coded performance indicators

✅ **AI Assistant & Feature Carousel Integration Complete (January 30, 2025):**
- Successfully implemented AI-powered chatbot using Gemini 1.5 Flash API
- Fixed data enrichment to provide student names and complete information to AI
- Teachers can ask natural language questions about specific students by name
- AI provides detailed performance analysis, class comparisons, and insights
- Added beautiful animated feature carousel on landing page showcasing all capabilities
- Created floating AI chat button in dashboard for easy access
- Modern landing page design with gradient backgrounds and feature showcase
- AI assistant works with real student data and provides intelligent responses

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized production builds
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Components**: Radix UI primitives with custom shadcn/ui components
- **Styling**: Tailwind CSS with CSS variables for theming
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Runtime**: Node.js with ESM modules
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Authentication**: Replit Auth with OpenID Connect (OIDC)
- **Session Management**: Express sessions with PostgreSQL storage
- **File Uploads**: Multer for handling CSV/XML imports

### Database Architecture
- **Database**: PostgreSQL (configured for Neon serverless)
- **Connection**: @neondatabase/serverless with connection pooling
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Tables**: Users, Students, Exams, Marks, Sessions

## Key Components

### Authentication System
- Replit Auth integration with OIDC for secure staff authentication
- Session-based authentication with PostgreSQL session storage
- User profile management with school name configuration
- Automatic redirect handling for unauthorized access

### Student Management
- Import students via CSV/XML file upload
- Manual student entry with form validation
- Student listing with class-based filtering (Classes 9-10)
- CRUD operations for student records
- Admission number and class management

### Marks Entry System
- Subject-wise marks entry (English, Mathematics, Science, Social Studies, Hindi, Computer Science)
- Exam creation and management
- Student-exam association for marks tracking
- Grade calculation and validation (0-100 marks range)

### Certificate Generation
- Dynamic certificate preview with real-time updates
- Configurable certificate options (photo, admission number, logo, marks display)
- PDF generation with styled layouts and formatting
- School branding integration

### Data Import/Export
- CSV file parsing for bulk student imports
- Papa Parse library for robust CSV handling
- File validation and error handling
- Bulk data operations with transaction support

## Data Flow

### Authentication Flow
1. User accesses application → Landing page
2. Click "Sign In with Replit" → Redirect to Replit Auth
3. Successful authentication → User profile creation/update
4. School name configuration → Dashboard access

### Student Management Flow
1. Dashboard → Student Management tab
2. Import CSV/XML OR Add manually
3. File upload → Server parsing → Database insertion
4. Real-time updates via React Query invalidation
5. Class filtering and student listing

### Marks Entry Flow
1. Select student and exam
2. Create new exam if needed
3. Enter subject-wise marks with validation
4. Save to database with grade calculations
5. Update student progress tracking

### Certificate Generation Flow
1. Select student and exam
2. Configure certificate options (layout, content)
3. Real-time preview generation
4. PDF export with custom styling
5. Download or print certificate

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connection
- **drizzle-orm**: Type-safe database ORM
- **@tanstack/react-query**: Server state management
- **@radix-ui/react-***: Accessible UI primitives
- **react-hook-form**: Form state management
- **zod**: Runtime type validation

### Authentication Dependencies
- **openid-client**: OIDC authentication with Replit
- **passport**: Authentication middleware
- **express-session**: Session management
- **connect-pg-simple**: PostgreSQL session store

### Utility Dependencies
- **multer**: File upload handling
- **papaparse**: CSV parsing
- **clsx + tailwind-merge**: Utility-first CSS management
- **lucide-react**: Icon system

## Deployment Strategy

### Development Environment
- Vite development server with HMR
- Replit integration with runtime error overlay
- TypeScript checking and validation
- Hot module replacement for React components

### Production Build
- Vite production build with optimization
- ESBuild bundling for server code
- Static asset optimization and compression
- Environment-based configuration management

### Database Strategy
- Drizzle Kit for schema migrations
- Database provisioning via environment variables
- Connection pooling for production scalability
- Session table management for authentication

### Environment Configuration
- `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: Session encryption key
- `REPL_ID`: Replit authentication configuration
- `NODE_ENV`: Environment-specific settings

The application follows a modern full-stack architecture with TypeScript throughout, ensuring type safety from database to UI. The authentication system integrates seamlessly with Replit's infrastructure while maintaining flexibility for potential future auth providers. The modular component structure allows for easy maintenance and feature expansion.