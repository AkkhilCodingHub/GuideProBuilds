# GuideProBuilds - PC Building Assistant

## Overview

GuideProBuilds is a full-stack web application that helps users build custom PCs by providing personalized hardware recommendations, component comparisons, and educational guides. The application uses AI-powered recommendations through Perplexity API to suggest optimal PC builds based on user requirements including budget, use case (gaming, content creation, office work, streaming), and performance preferences.

The application features a modern React frontend with a Node.js/Express backend, MongoDB database for persistence, and integrates external services for AI recommendations and email support.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- React 18.2.0 with TypeScript for type safety
- Vite as the build tool and development server
- Wouter for lightweight client-side routing
- TanStack React Query for server state management and caching
- Tailwind CSS v4 for styling with shadcn/ui component library
- Radix UI primitives for accessible, unstyled components

**Design Decisions:**
- **Component-based architecture**: Pages are organized in `client/src/pages/` with reusable UI components in `client/src/components/`
- **Styling approach**: Uses Tailwind CSS with a custom design system defined in `client/src/index.css` including CSS variables for theming
- **State management**: TanStack React Query handles all server state with custom query functions in `lib/queryClient.ts` that include credential handling and error management
- **Routing**: Wouter provides a minimal routing solution suitable for the application's simple navigation needs
- **Animation**: Previously used Framer Motion (noted as removed in package.json), suggesting a shift toward lighter-weight solutions

**Pros:**
- Type safety throughout the frontend reduces runtime errors
- React Query provides automatic caching, background refetching, and optimistic updates
- Tailwind CSS with component library enables rapid UI development with consistent design
- Vite offers fast HMR and optimized production builds

**Cons:**
- Large number of Radix UI dependencies increases bundle size
- Custom theming system requires maintenance of CSS variables

### Backend Architecture

**Technology Stack:**
- Node.js with Express.js framework
- TypeScript for type safety
- MongoDB with Mongoose ODM for data persistence
- Drizzle ORM configured but not actively used (MongoDB dialect)
- WebSocket support for real-time features
- bcryptjs for password hashing

**Design Decisions:**
- **Monorepo structure**: Shared types and schemas in `shared/` directory used by both frontend and backend
- **Session-based authentication**: Uses express-session with MongoDB session store
- **API design**: RESTful API endpoints under `/api` namespace, proxied through Vite dev server
- **Database abstraction**: Storage layer (`server/storage.ts`) provides interface-based abstraction over MongoDB operations
- **Seed data**: Comprehensive seed script (`server/seed.ts`) provides initial database population with PC parts and guides

**Pros:**
- Shared schema definitions ensure type consistency between frontend and backend
- Storage abstraction layer makes database operations testable and swappable
- Session-based auth is simple and suitable for the application's needs
- Comprehensive seed data enables quick development and testing

**Cons:**
- Drizzle ORM is configured but appears unused, creating confusion about actual ORM strategy
- Session storage requires careful configuration for production deployment
- Mixed ORM strategy (Mongoose models vs Drizzle schemas) in the codebase

### AI Integration Architecture

**Service:** Perplexity AI via `@ai-sdk/perplexity` package
**Model:** sonar-medium-online (specifically noted not to change without user request)

**Design Decisions:**
- **Recommendation engine**: `server/ai/recommendation-engine.ts` generates PC build recommendations using AI
- **Two main functions**:
  1. `generateRecommendation`: Takes user requirements (budget, use case, performance) and returns complete build with reasoning
  2. `compareParts`: Compares different hardware components
- **Prompt engineering**: Detailed prompts provide context about available parts and user requirements
- **Fallback handling**: Application warns but continues if AI API key is missing (development mode)

**Pros:**
- Perplexity's online model can access current pricing and availability information
- Separation of AI logic into dedicated module improves maintainability
- Provides both recommendations and detailed reasoning for educational value

**Cons:**
- Hard dependency on third-party AI service for core functionality
- No caching strategy for AI responses (potential cost concern)
- Limited error handling if AI service is unavailable

### Data Schema Architecture

**Database:** MongoDB with Mongoose ODM

**Core Entities:**
1. **User**: Authentication and profile data
2. **Part**: Hardware components with specs, pricing, compatibility, stock, regional pricing, ratings
3. **SavedBuild**: User-created PC configurations
4. **Guide**: Educational content and tutorials
5. **BookmarkedGuide**: User's saved guides
6. **PriceHistory**: Historical pricing data for parts
7. **Cart**: Shopping cart with session/user support, items, regional currency support

**Design Decisions:**
- **Schema validation**: Zod schemas defined alongside Mongoose schemas for runtime validation
- **Timestamps**: createdAt/updatedAt fields track entity lifecycle
- **References**: MongoDB ObjectId references between related entities (e.g., builds reference parts)
- **Indexes**: Strategic indexes on frequently queried fields (type, brand, user, createdAt)
- **Embedded data**: Parts in builds store denormalized data for performance

**Pros:**
- Zod schemas provide runtime validation and type inference
- Denormalization in builds prevents issues if parts are updated/deleted
- Indexes improve query performance for common access patterns

**Cons:**
- Denormalized data can become stale if not properly synchronized
- No explicit migration strategy for schema changes

## External Dependencies

### Third-Party APIs and Services

**Perplexity AI** (`@ai-sdk/perplexity`)
- Purpose: AI-powered PC build recommendations and component comparisons
- Model: sonar-medium-online
- Authentication: API key via PERPLEXITY_API_KEY environment variable
- Critical: Core feature dependency

**Resend** (Email Service)
- Purpose: Support email functionality for contact form submissions
- Authentication: API key via RESEND_API_KEY environment variable
- Configuration: Support email address via SUPPORT_EMAIL environment variable (currently set to ctechmtv@gmail.com)
- Note: The sending domain must be verified in Resend dashboard for emails to work. If using gmail.com, you need to verify that domain or use a custom domain.

**Support Page** (`/support`)
- Three-tab interface: FAQs, Troubleshooting, Contact Us
- Searchable FAQ accordion with 5 categories
- Troubleshooting quick reference cards and detailed guides
- Contact form with validation sends tickets to SUPPORT_EMAIL
- Optional confirmation email to users when they submit a ticket

**PC Part Picker** (Implicit Integration)
- Purpose: External links to PC Part Picker for builds and parts
- No direct API integration, uses URLs only

### Database

**MongoDB**
- Connection: Via MONGODB_URI environment variable
- ORM: Mongoose (primary), Drizzle configured but not used
- Connection handling: Cached connection pattern to prevent multiple connections in development
- Session store: Uses MongoDB for express-session persistence

### Development Tools

**Replit-specific Plugins**
- `@replit/vite-plugin-runtime-error-modal`: Development error overlay
- `@replit/vite-plugin-cartographer`: Development tool (conditional)
- `@replit/vite-plugin-dev-banner`: Development banner (conditional)

### UI Component Library

**shadcn/ui Components**
- Built on Radix UI primitives
- Extensive component set imported (50+ components from package.json)
- Tailwind CSS integration via `components.json` configuration
- Icon library: Lucide React

### Build and Development Tools

- **Vite**: Development server and build tool with HMR
- **esbuild**: Server-side bundling for production
- **TypeScript**: Type checking across entire codebase
- **Tailwind CSS**: Utility-first styling with custom configuration
- **PostCSS**: CSS processing with autoprefixer

### Environment Variables Required

**Production:**
- `MONGODB_URI`: MongoDB connection string (required)
- `PERPLEXITY_API_KEY`: Perplexity AI API key (required for AI features)
- `SUPPORT_EMAIL`: Support contact email (required for email features)
- `RESEND_API_KEY`: Resend email service API key (required for email features)

**Development:**
- Same as production, but application will run with warnings if AI/email variables are missing