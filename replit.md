# Replit.md - RFID Habit Tracker

## Overview

This is a full-stack RFID habit tracking application built with React frontend and Express backend. The app allows users to track their habits using RFID cards, providing visual analytics and progress tracking. Users can tap RFID cards to check in/out of habits, view their progress through charts and heatmaps, and manage their cards and settings.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Framework**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom glassmorphism design system
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **API Design**: RESTful endpoints with JSON responses
- **Validation**: Zod schemas for request/response validation
- **Session Management**: In-memory storage for development

### Design System
- **Theme**: Dark mode with glassmorphism effects
- **Colors**: iOS-inspired blue accent colors
- **Typography**: Clean, modern font hierarchy
- **Components**: Consistent glass-effect cards and buttons
- **Navigation**: Floating bottom navigation bar

## Key Components

### Database Schema
- **Users**: Basic user management (currently defaulting to user ID 1)
- **Habits**: Habit definitions with icons, colors, and daily goals
- **RFID Cards**: Card-to-habit mappings
- **Habit Entries**: Check-in/check-out logs with timestamps
- **Settings**: User preferences and configuration

### Core Features
1. **Habit Management**: Create, edit, and delete habits with custom icons and colors
2. **RFID Card Management**: Associate cards with habits for easy tracking
3. **Activity Logging**: Automatic logging of check-ins and check-outs
4. **Analytics Dashboard**: Visual progress tracking with heatmaps and charts
5. **Settings**: User preferences and Google Sheets integration

### Page Structure
- **Home**: Overview with current status and greeting
- **Dashboard**: Analytics with heatmap calendar and progress charts
- **Log**: Activity history and entry details
- **Cards**: RFID card and habit management
- **Settings**: User preferences and data export

## Data Flow

1. **User Interaction**: User taps RFID card or uses web interface
2. **API Request**: Frontend sends requests to Express backend
3. **Data Processing**: Backend validates and processes data using Drizzle ORM
4. **Database Operations**: PostgreSQL stores/retrieves data
5. **Response**: Backend returns JSON response
6. **UI Update**: Frontend updates using React Query cache invalidation

### Storage Layer
- **Production**: PostgreSQL database via Neon
- **Development**: Memory storage implementation for testing
- **Interface**: IStorage interface allows switching between implementations

## External Dependencies

### Database & ORM
- **PostgreSQL**: Primary database (via Neon)
- **Drizzle ORM**: Type-safe database operations
- **Drizzle Kit**: Database migrations and management

### UI & Styling
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first styling
- **Lucide React**: Icon library
- **Class Variance Authority**: Component variant management

### Development Tools
- **TypeScript**: Type safety across the stack
- **Vite**: Fast build tool and dev server
- **ESBuild**: Production server bundling
- **React Query**: Server state management

### External Services
- **Google Sheets API**: Data export integration
- **FontAwesome**: Additional icons for habits

## Deployment Strategy

### Development
- **Environment**: Replit with Node.js 20
- **Database**: PostgreSQL 16 module
- **Dev Server**: Vite dev server with HMR
- **API Server**: Express with TypeScript via tsx

### Production
- **Build Process**: 
  1. Vite builds frontend to `dist/public`
  2. ESBuild bundles server to `dist/index.js`
- **Deployment**: Replit autoscale deployment
- **Database**: Neon PostgreSQL connection via DATABASE_URL
- **Static Files**: Served from `dist/public`

### Environment Variables
- `DATABASE_URL`: PostgreSQL connection string
- `NODE_ENV`: Environment mode (development/production)

## Changelog
- June 26, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.