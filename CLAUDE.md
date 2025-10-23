# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**DigitalDock** - A digital product marketplace platform where creators can sell templates, designs, and digital assets. Similar to Gumroad meets Creative Market, but focused exclusively on digital products.

**Status**: MVP development phase with core features implemented. See PLATFORM_PLAN.md for complete roadmap.

## Repository Structure

This is a **monorepo** containing two main applications:

1. **digitaldock/** - Next.js 15 frontend (TypeScript, Tailwind CSS)
2. **digitaldock-backend/** - Express.js REST API (TypeScript, MongoDB)

## Development Commands

### Frontend (digitaldock/)
```bash
cd digitaldock
npm run dev          # Start Next.js dev server (Turbopack) on port 3000
npm run build        # Build for production with Turbopack
npm start            # Start production server
npm run lint         # Run ESLint
```

### Backend (digitaldock-backend/)
```bash
cd digitaldock-backend
npm run dev          # Start Express server with hot reload on port 5000
npm run build        # Compile TypeScript to dist/
npm start            # Run compiled server from dist/
npm test             # Run all Jest tests
npm run test:watch   # Run Jest in watch mode
npm run test:coverage # Generate coverage report
npm run lint         # Run ESLint on src/**/*.ts
npm run format       # Format code with Prettier
```

### Important Notes
- Always use `npm run dev` with Turbopack for frontend (faster than standard Next.js)
- Backend API runs on port 5000, frontend on port 3000
- Swagger API docs available at `http://localhost:5000/api-docs` when backend is running

## Architecture Overview

### Frontend Architecture (digitaldock/)

**Framework**: Next.js 15 with App Router
**State Management**: React Context API (see src/contexts/)
**Authentication**: JWT tokens stored in cookies (js-cookie)
**API Communication**: Custom API client (src/lib/api/)

**Key Directories**:
- `src/app/` - Next.js App Router pages and layouts
  - `api/` - Next.js API routes (mainly for Swagger docs)
  - `marketplace/` - Product browsing and detail pages
  - `seller/` - Seller dashboard and product management
  - `dashboard/` - User dashboard
  - `login/`, `register/` - Authentication pages
- `src/components/` - Reusable React components
- `src/contexts/` - React Context providers (auth, etc.)
- `src/lib/` - Utility libraries
  - `api/` - API client and endpoint wrappers
  - `auth/` - JWT utilities, password hashing, middleware
  - `mongodb.ts` - MongoDB connection for Next.js API routes
- `src/models/` - Mongoose models (shared with backend structure)

**Authentication Flow**:
1. User logs in via `/login` → calls backend `/api/auth/login`
2. Backend returns JWT token
3. Frontend stores token in cookie and Context
4. API client includes token in Authorization header for protected requests

### Backend Architecture (digitaldock-backend/)

**Framework**: Express.js with TypeScript
**Database**: MongoDB with Mongoose ODM
**Authentication**: JWT Bearer tokens

**Key Directories**:
- `src/config/` - Configuration (database, Swagger)
- `src/controllers/` - Business logic for each entity
- `src/models/` - Mongoose schemas (User, Product, Purchase)
- `src/routes/` - Express route definitions
- `src/middleware/` - Express middleware (auth, validation)
- `src/utils/` - Utility functions (JWT, password hashing)
- `src/validators/` - Zod validation schemas
- `tests/` - Jest test files

**Core Models**:
1. **User** - BUYER, SELLER, or ADMIN roles. Sellers have additional fields (slug, earnings, etc.)
2. **Product** - 10 categories (Notion, Figma, Resume, etc.). Supports pricing, images, files, ratings
3. **Purchase** - Transaction records with payment details, download tokens, platform fees

**API Structure**:
- `/api/auth/*` - Register, login, password reset
- `/api/products/*` - CRUD for products, search, filtering
- `/api/purchases/*` - Create purchases, download products, seller payouts
- `/api/users/*` - User profiles, seller stats

**Authentication Middleware**:
- `authenticate` - Verifies JWT token, attaches user to req.user
- `authorize([roles])` - Restricts routes to specific roles (ADMIN, SELLER, etc.)

## Tech Stack Details

### Frontend
- **Next.js 15** (App Router, Turbopack)
- **TypeScript**
- **Tailwind CSS v4** with @tailwindcss/postcss
- **React 19**
- **NextAuth v5** (beta) - installed but JWT custom auth currently used
- **Zod** - Schema validation
- **js-cookie** - Cookie management

### Backend
- **Express.js**
- **TypeScript**
- **MongoDB** with Mongoose
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT auth
- **Zod** - Request validation
- **Swagger/OpenAPI** - API documentation
- **Jest + Supertest** - Testing
- **Helmet** - Security headers
- **express-rate-limit** - Rate limiting

### Deployment (Planned)
- Frontend: Vercel
- Backend: Railway
- Database: MongoDB Atlas
- File Storage: Cloudflare R2

## Database Schema

### User Model
```typescript
{
  email: string (unique)
  password: string (hashed with bcrypt)
  name?: string
  avatar?: string
  bio?: string
  role: 'BUYER' | 'SELLER' | 'ADMIN'
  isVerifiedSeller: boolean
  isPremium: boolean

  // Seller-specific fields
  sellerSlug?: string (unique, URL-friendly)
  website?: string
  twitter?: string
  instagram?: string
  totalEarnings: number
  totalSales: number
}
```

### Product Model
```typescript
{
  title: string
  slug: string (unique, URL-friendly)
  description: string
  category: 'NOTION_TEMPLATES' | 'FIGMA_ASSETS' | 'RESUME_TEMPLATES' | ...
  price: number
  isPWYW: boolean (Pay What You Want)
  minPrice?: number

  // Files
  fileUrl: string (main product file)
  fileSize: number
  previewUrl?: string
  images: string[] (up to 5)

  // Metadata
  tags: string[]
  downloadCount: number
  viewCount: number
  rating: number (0-5)
  reviewCount: number

  // Status
  status: 'DRAFT' | 'PENDING_REVIEW' | 'PUBLISHED' | 'UNLISTED' | 'REJECTED'
  isFeatured: boolean

  sellerId: ObjectId (ref: User)
}
```

### Purchase Model
```typescript
{
  buyerId: ObjectId (ref: User)
  productId: ObjectId (ref: Product)
  amount: number (price paid)
  platformFee: number (10% default)
  sellerEarnings: number
  paymentMethod: 'stripe' | 'paypal'
  status: 'PENDING' | 'COMPLETED' | 'REFUNDED' | 'FAILED'
  downloadToken: string (unique, secure download link)
  downloadCount: number
}
```

## Environment Variables

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:5000
MONGODB_URI=mongodb://localhost:27017/digitaldock
JWT_SECRET=your-secret-key
```

### Backend (.env)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/digitaldock
JWT_SECRET=your-secret-key (must match frontend)
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

## Search Patterns - IMPORTANT

**Do NOT use overly broad search patterns** like `**/register.tsx` that search the entire system including node_modules. Always scope searches to the codebase:

**Good patterns** (focused):
```
digitaldock/src/**/*.tsx
digitaldock-backend/src/**/*.ts
digitaldock/src/app/**/page.tsx
digitaldock-backend/src/models/*.ts
```

**Bad patterns** (too broad):
```
**/*.tsx           # Searches node_modules
**/User.ts         # Searches node_modules
**/register.tsx    # Searches node_modules
```

## Key Features & Implementation Status

### Completed (MVP)
- ✅ User authentication (register, login, JWT)
- ✅ User roles (BUYER, SELLER, ADMIN)
- ✅ Product CRUD operations
- ✅ Product categories (10 types)
- ✅ Product status workflow (draft → published)
- ✅ Marketplace browsing with filtering
- ✅ Seller dashboard
- ✅ Purchase/transaction system
- ✅ Download token system
- ✅ API documentation (Swagger)

### In Progress
- 🔨 File upload integration (Cloudflare R2)
- 🔨 Payment integration (Stripe)
- 🔨 Email notifications
- 🔨 Review/rating system
- 🔨 Search functionality

### Planned (Phase 2-3)
- Premium seller accounts ($19.99/month)
- Featured product placements
- Advanced analytics dashboard
- Buyer-seller messaging
- Product bundles & discounts
- Multi-currency support

See PLATFORM_PLAN.md for complete feature roadmap and revenue projections.

## Testing

### Backend Tests
Tests use **mongodb-memory-server** for in-memory database testing.

```bash
cd digitaldock-backend
npm test                    # Run all tests
npm run test:watch          # Watch mode
npm run test:coverage       # Coverage report
```

Test file location: `digitaldock-backend/tests/e2e/auth.test.ts`

### Frontend Tests
Not yet implemented. Planned: Jest + React Testing Library

## API Authentication

All protected endpoints require JWT Bearer token:

```bash
Authorization: Bearer <token>
```

**Public endpoints**:
- POST /api/auth/register
- POST /api/auth/login
- GET /api/products (browse marketplace)

**Protected endpoints**:
- GET /api/auth/me (authenticated user)
- POST /api/products (create - SELLER only)
- PUT /api/products/:id (update - SELLER/ADMIN only)
- DELETE /api/products/:id (delete - SELLER/ADMIN only)
- POST /api/purchases (create purchase)
- GET /api/users/profile (get own profile)

## Security Considerations

- Passwords hashed with bcrypt (12 salt rounds)
- JWT tokens expire after 7 days
- Rate limiting: 100 requests per 15 minutes per IP
- CORS restricted to FRONTEND_URL
- Helmet.js security headers enabled
- Input validation with Zod on all endpoints
- SQL injection prevention via Mongoose ODM

## Common Development Workflows

### Adding a New API Endpoint

1. Define Zod validator in `digitaldock-backend/src/validators/`
2. Create controller function in `digitaldock-backend/src/controllers/`
3. Add route in `digitaldock-backend/src/routes/`
4. Add Swagger JSDoc comments for documentation
5. Create API wrapper in `digitaldock/src/lib/api/`
6. Use in frontend components

### Adding a New Page

1. Create page.tsx in `digitaldock/src/app/[route]/`
2. Create components in `digitaldock/src/components/`
3. Add navigation links if needed
4. Ensure authentication check if protected route

### Modifying Database Schema

1. Update Mongoose model in `digitaldock-backend/src/models/`
2. Update TypeScript interfaces
3. Update validators in `digitaldock-backend/src/validators/`
4. Run migrations if needed (MongoDB is schemaless, but data shape matters)
5. Update API endpoints and frontend types

## Revenue Model

**Transaction Fees**: 10% platform fee on all sales (primary revenue)
**Premium Accounts**: $19.99/month for sellers (lower fees, unlimited products)
**Featured Placements**: $30-$50/week for product promotion
**Analytics Dashboard**: $9.99/month for advanced analytics

Target: $750K ARR by Month 12 (see PLATFORM_PLAN.md for projections)

## Product Categories (10 Types)

1. NOTION_TEMPLATES
2. FIGMA_ASSETS
3. RESUME_TEMPLATES
4. SPREADSHEET_TEMPLATES
5. SOCIAL_MEDIA_TEMPLATES
6. PRESENTATION_TEMPLATES
7. WEBSITE_TEMPLATES
8. ICON_PACKS
9. EBOOKS_GUIDES
10. CHEAT_SHEETS

These are enums in both frontend and backend models. Update both if adding new categories.

## Additional Resources

- **Complete Platform Plan**: See PLATFORM_PLAN.md (1000+ lines of detailed specs)
- **Backend README**: digitaldock-backend/README.md
- **Frontend README**: digitaldock/README.md
- **API Documentation**: http://localhost:5000/api-docs (when backend running)
- **Test Credentials**: TEST_CREDENTIALS.json in backend directory
