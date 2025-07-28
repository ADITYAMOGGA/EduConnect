# Tejaswi High School - Progress Card & Certificate Portal

## Overview

This is a full-stack Single Page Application (SPA) for Tejaswi High School that allows authenticated staff to manage students, enter exam marks, and generate digital progress certificates. The application provides a comprehensive school management system with authentication, student data management, marks entry, and PDF certificate generation capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.

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