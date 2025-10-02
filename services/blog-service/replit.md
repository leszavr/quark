# BlogChat - Blog and Messenger Platform

## Overview

BlogChat is a modern web application that combines blogging and messaging functionality, inspired by platforms like Twitter/X, Telegram, WhatsApp, VC.ru, and Habr. The application features a main blog feed, an integrated messenger sidebar, and supports six customizable color themes with both light and dark modes.

The platform provides users with the ability to read and interact with blog posts through likes and comments, participate in real-time messaging via an integrated chat system, and customize their experience through multiple theme options and user profiles.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Library**: Radix UI components with shadcn/ui design system
- **Styling**: Tailwind CSS with CSS custom properties for theming
- **State Management**: React Context for theme and authentication state
- **Data Fetching**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing

### Component Structure
- **Layout Components**: Header, Footer, MainApp orchestrating the overall layout
- **Content Components**: BlogFeed, BlogPost for displaying blog content
- **Messaging Components**: MessengerSidebar, FullscreenChat, MessageInput for chat functionality  
- **Modal Components**: ThemeModal, ProfileModal for user interactions
- **UI Components**: Comprehensive set of reusable components based on Radix UI primitives

### Design System
- **Typography**: Inter font from Google Fonts
- **Color Themes**: Six predefined themes (Classic, Blue, Purple, Green, Orange, Indigo) with light/dark mode support
- **Spacing**: Tailwind's systematic spacing scale (2, 4, 6, 8 units)
- **Component Variants**: Consistent styling patterns using class-variance-authority
- **Animations**: Smooth transitions and hover effects throughout the interface

### Authentication System
- **Demo Mode**: Toggle between guest and authenticated user states
- **User Management**: In-memory storage with profile management capabilities
- **Session Handling**: Context-based authentication state management

### Backend Architecture
- **Server**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Session Management**: Connect-pg-simple for PostgreSQL session storage
- **API Design**: RESTful endpoints with /api prefix routing

### Data Storage
- **ORM**: Drizzle ORM with Zod schemas for validation
- **Database Schema**: User management with username/password authentication
- **Migration System**: Drizzle Kit for database schema migrations
- **Connection**: Neon Database serverless PostgreSQL connection

### Theme System
- **CSS Variables**: Dynamic theme switching using HSL color values
- **Theme Variants**: Six distinct color schemes with semantic color naming
- **Dark Mode**: System-wide dark/light mode toggle with smooth transitions
- **Component Theming**: Consistent theming across all UI components

### Development Workflow
- **Build System**: Vite for fast development and optimized production builds
- **Type Safety**: Full TypeScript coverage with strict configuration
- **Code Organization**: Clear separation between client, server, and shared code
- **Asset Management**: Centralized asset handling with proper path resolution

## External Dependencies

### Core Framework Dependencies
- **React 18**: Latest React with concurrent features and improved TypeScript support
- **Vite**: Modern build tool with fast hot module replacement and optimized bundling
- **Express.js**: Web application framework for the backend API server
- **TypeScript**: Type safety across the entire application stack

### UI and Styling Libraries
- **Radix UI**: Unstyled, accessible UI primitives for building the component library
- **Tailwind CSS**: Utility-first CSS framework for consistent styling and responsive design
- **Lucide React**: Icon library providing consistent iconography throughout the application
- **class-variance-authority**: Type-safe variant management for component styling

### Database and ORM
- **Drizzle ORM**: Type-safe SQL ORM with excellent TypeScript integration
- **Neon Database**: Serverless PostgreSQL database with connection pooling
- **Drizzle Kit**: Migration and introspection tools for database schema management
- **Zod**: Schema validation library integrated with Drizzle for type safety

### State Management and Data Fetching
- **TanStack Query**: Powerful data synchronization for server state management
- **React Hook Form**: Performant forms with minimal re-renders and built-in validation
- **Hookform Resolvers**: Integration between React Hook Form and Zod schemas

### Development and Build Tools
- **ESBuild**: Fast JavaScript bundler for production builds
- **PostCSS**: CSS processing with Autoprefixer for vendor prefix management
- **Date-fns**: Lightweight date utility library for timestamp formatting
- **TSX**: TypeScript execution environment for development server

### Additional Utilities
- **Wouter**: Minimalist routing library for single-page application navigation
- **clsx & tailwind-merge**: Utility functions for conditional CSS class management
- **Embla Carousel**: Touch-friendly carousel component for content display
- **CMDK**: Command palette interface for enhanced user interactions