# Overview

This is a comprehensive ERP system for travel agencies (Mondial Turismo) built with a modern full-stack architecture. The system manages sales/quotes, clients, suppliers, financial accounts, banking operations, and WhatsApp business communications with detailed flight and hotel booking capabilities. It features a React frontend with shadcn/ui components, an Express.js backend with PostgreSQL database, and integrates with external services for authentication and messaging.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for development
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state and caching
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation
- **Build Tool**: Vite with custom configuration for development and production

## Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database ORM**: Drizzle ORM with PostgreSQL
- **Authentication**: OpenID Connect (OIDC) with Replit's authentication service
- **Session Management**: Express sessions with PostgreSQL storage
- **API Design**: RESTful API with structured error handling and logging middleware
- **File Structure**: Modular route handlers with centralized storage layer

## Data Storage Solutions
- **Primary Database**: PostgreSQL with Neon serverless hosting
- **Schema Management**: Drizzle migrations with declarative schema definitions
- **Session Storage**: PostgreSQL sessions table for authentication state
- **Database Pooling**: Neon serverless connection pooling with WebSocket support

## Authentication and Authorization
- **Strategy**: OpenID Connect (OIDC) integration with Replit
- **Session Handling**: Express sessions with PostgreSQL persistence
- **Middleware Protection**: Route-level authentication guards
- **User Management**: User profiles stored in PostgreSQL with role-based access

## Key Domain Models
- **Sales Management**: Sales, services, passengers with complex relationships
- **Flight Booking System**: Comprehensive flight details with 10 specialized fields (flight number, airline, origin/destination, departure/arrival times, direction, class, observations)
- **Hotel Booking System**: Complete hotel accommodation management with 10 detailed fields (hotel name, location, check-in/out dates, meal plans, room categories, guests, observations)
- **Client/Supplier Management**: Complete contact and business information
- **Financial System**: Accounts payable/receivable with payment plans, chart of accounts, and DRE (Income Statement)
- **Banking Integration**: Bank accounts with transaction tracking and balance management
- **WhatsApp Business Integration**: External server integration for QR code authentication and business messaging

# External Dependencies

## Database Services
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **Database URL**: Environment-based configuration for database connections

## Authentication Services
- **Replit OIDC**: Integrated authentication provider for user management
- **Session Storage**: PostgreSQL-backed session management

## Development Tools
- **Drizzle Kit**: Database migrations and schema management
- **ESBuild**: Production bundling for server-side code
- **TSX**: TypeScript execution for development server

## UI/UX Libraries
- **Radix UI**: Accessible component primitives for form controls and overlays
- **Lucide React**: Icon library for consistent iconography
- **Tailwind CSS**: Utility-first styling with custom design system

## Third-party Integrations
- **WhatsApp Business**: External server integration with render.com for QR code authentication and messaging
- **File Storage**: Potential integration points for document attachments
- **Firebase**: Legacy service integration present in attached assets but not in main codebase

# Travel Booking Features

## Enhanced Flight Booking System
- **Comprehensive Flight Details**: 10 specialized fields for complete flight management
  - Flight number, airline, origin/destination airports
  - Flight date, departure/arrival times
  - Direction indicators (ida, volta, ida-volta)
  - Service class and detailed observations
- **Conditional UI**: Flight-specific fields appear only when "aereo" service type is selected
- **Professional Display**: Service listings show formatted flight information with aviation icons
- **Data Persistence**: Flight details stored in services.detalhes JSON field with Zod validation

## Enhanced Hotel Booking System  
- **Complete Hotel Management**: 10 detailed fields for accommodation bookings
  - Hotel name, city, full address
  - Check-in/check-out dates with Brazilian date formatting
  - Comprehensive meal plan options (café da manhã, meia pensão, pensão completa, all-inclusive, sem refeição)
  - Room categories, number of nights, number of guests
  - Hotel-specific observations and notes
- **Professional Interface**: Hotel details section with hospitality-focused design
- **Smart Display**: Service listings show comprehensive hotel information with hospitality icons
- **Full CRUD Support**: Create, read, update, and delete hotel bookings with preserved details

## Technical Implementation
- **Schema Integration**: Both flight and hotel details use existing services.detalhes JSONB column
- **Type Safety**: Full TypeScript typing with Zod schemas for validation
- **Form Management**: React Hook Form integration with conditional field rendering
- **Industry Standards**: Field coverage meets professional travel agency requirements

## Frontend Packages
- **TanStack Query**: Server state management and caching
- **React Hook Form**: Form state management and validation
- **Zod**: Runtime type validation and schema definition
- **Wouter**: Lightweight routing solution
- **Date-fns**: Date manipulation and formatting utilities