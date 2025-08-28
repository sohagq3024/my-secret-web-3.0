# My Secret Web - E-Commerce Digital Content Platform

## Overview

My Secret Web is a premium e-commerce platform specializing in digital content delivery, including celebrity photos, albums, and videos. The application features a membership-based access model with user authentication, subscription management, and an admin panel for content management.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Full-Stack TypeScript Application
- **Frontend**: React with Vite, TypeScript, and Tailwind CSS
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **UI Components**: Shadcn/UI with Radix UI primitives
- **State Management**: TanStack Query for server state, React Context for authentication
- **Routing**: Wouter for client-side routing
- **Styling**: Tailwind CSS with custom design tokens

## Key Components

### Frontend Architecture
- **Component Structure**: Modular components in `/client/src/components/`
- **Pages**: Route-based pages in `/client/src/pages/`
- **Authentication**: Context-based auth with localStorage persistence
- **UI Library**: Comprehensive shadcn/ui component library
- **Responsive Design**: Mobile-first approach with Tailwind CSS

### Backend Architecture
- **API Routes**: RESTful endpoints in `/server/routes.ts`
- **Storage Layer**: Abstract storage interface with database operations
- **Authentication**: Username/password based with session management
- **Middleware**: Request logging and error handling

### Database Schema
- **Users**: Complete user profiles with role-based access
- **Memberships**: Subscription system with time-based access control
- **Content**: Celebrities, albums, videos, and slideshow images
- **Payments**: Membership requests with approval workflow

## Data Flow

### Authentication Flow
1. User registration/login through modal forms
2. Credentials validated against database
3. User session stored in localStorage
4. Role-based access control (user/admin)

### Content Access Flow
1. Content requires valid membership (except free items)
2. Membership validation on each protected request
3. Payment processing through membership requests
4. Admin approval workflow for membership activation

### Admin Operations
1. Dashboard with membership request management
2. Content management capabilities
3. User analytics and statistics
4. Approval/rejection workflow for subscriptions

## External Dependencies

### Media Storage
- **Cloudinary**: External media storage and CDN
- **Cloud Name**: dnewpzaeg
- **Auto-optimization**: Built-in image/video compression and resizing
- **Permanent URLs**: All media stored with permanent Cloudinary URLs

### Database Integration
- **Neon Database**: Serverless PostgreSQL hosting
- **Drizzle ORM**: Type-safe database operations
- **Connection Pooling**: Built-in with Neon serverless

### UI Framework
- **Radix UI**: Accessible primitive components
- **Lucide React**: Icon library
- **Class Variance Authority**: Styled component variants
- **React Hook Form**: Form validation and management

### Development Tools
- **Vite**: Fast development server and build tool
- **TypeScript**: Full type safety across frontend and backend
- **ESBuild**: Production bundle optimization
- **Replit Integration**: Development environment plugins

## Deployment Strategy

### Build Process
- Frontend built with Vite to `/dist/public`
- Backend compiled with ESBuild to `/dist/index.js`
- Shared schema accessible to both frontend and backend

### Environment Configuration
- Database URL required for Drizzle connection
- Development vs production environment handling
- Static file serving in production

### Database Management
- Schema migrations in `/migrations` directory
- Push command for development schema updates
- PostgreSQL dialect with Neon serverless compatibility

### Recent Updates

#### January 28, 2025
- **Cloudinary Integration**: Implemented permanent media storage solution
  - Added Cloudinary configuration for images and videos
  - Created upload endpoints (/api/upload/single, /api/upload/multiple)
  - Updated file upload system to use Cloudinary instead of temporary local URLs
  - All media files now stored permanently at Cloudinary URLs
  - Fixed image persistence issue where images disappeared after page refresh

#### July 18, 2025 
- **Migration Completed**: Successfully migrated from Replit Agent to Replit environment
- **Database Setup**: PostgreSQL database configured with all required tables
- **Security Implementation**: Proper client/server separation with robust security practices
- **Authentication System**: Login system verified and working correctly
- **API Functionality**: All endpoints responding correctly with proper data flow

### Hosting Considerations
- Node.js runtime required for Express server
- Static file serving for React frontend
- Environment variable configuration for database connection
- Session storage with PostgreSQL backend