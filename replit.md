# Overview

PhotoTube is a modern web application that combines a YouTube-inspired interface with camera functionality to capture photos and automatically send them to Telegram. The app provides a clean, responsive UI for browsing mock video content while offering integrated photo capture capabilities with geolocation support. Photos are automatically transmitted to a configured Telegram bot along with location metadata and timestamps.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

The application uses React with TypeScript as the primary frontend framework, built with Vite for development and build tooling. The architecture follows a component-based approach with:

- **UI Components**: Built using Radix UI primitives and shadcn/ui components for consistent, accessible design
- **Styling**: Tailwind CSS with custom CSS variables for theming and responsive design
- **State Management**: React Query (@tanstack/react-query) for server state management and data fetching
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation for type-safe form management

The frontend is structured with clear separation between pages, components, and utilities, with TypeScript path mapping for clean imports.

## Backend Architecture

The backend follows a minimal Express.js server architecture designed primarily for development support:

- **Server Framework**: Express.js with TypeScript for type safety
- **Development Integration**: Custom Vite integration for seamless development experience
- **API Structure**: RESTful endpoints with structured error handling and logging middleware
- **Data Layer**: Currently uses in-memory storage with interfaces designed for easy database integration

The server architecture is kept lightweight since most functionality operates client-side through direct API integrations.

## Database Design

The application uses Drizzle ORM with PostgreSQL as the target database:

- **Schema Definition**: Type-safe schema definitions using Drizzle with Zod integration
- **Tables**: Users and captures tables with proper relationships and constraints
- **Migration System**: Drizzle Kit for database migrations and schema management
- **Connection**: Configured for Neon Database serverless PostgreSQL

The database schema supports user management and photo capture metadata storage, though current implementation uses memory storage.

## Authentication & Authorization

Currently implements a basic user structure with:

- **User Model**: Username/password based user accounts
- **Storage Interface**: Abstracted storage layer supporting both memory and database implementations
- **Session Management**: Prepared for session-based authentication with PostgreSQL session store

## Camera & Media Integration

- **Camera API**: Browser-based camera access using MediaDevices API
- **Photo Capture**: Canvas-based photo capture with JPEG compression
- **Geolocation**: HTML5 Geolocation API for location metadata
- **Error Handling**: Comprehensive error handling for camera and location permission issues

## External Dependencies

- **Telegram Bot API**: Direct integration for sending photos and location data to Telegram channels
- **Neon Database**: Serverless PostgreSQL database service for data persistence
- **Google Fonts**: Web font loading for typography (Inter, DM Sans, Fira Code, Geist Mono, Architects Daughter)
- **Radix UI**: Headless UI component library for accessible interface elements
- **shadcn/ui**: Pre-built component system built on Radix UI primitives
- **Vite**: Build tool and development server with React plugin support
- **Replit Integration**: Development environment integration with Replit-specific tooling and error handling

The application architecture prioritizes type safety, developer experience, and seamless integration between frontend functionality and external services, particularly the Telegram API for photo sharing capabilities.