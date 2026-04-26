# Mini Reading Platform

Final round assignment project for **Mini Reading Platform**, built as a full-stack reading platform where users can read, create, and manage stories with premium access via payments.

Reference inspiration: [MiReads](https://mireads.com/)

---

## Project Links

- Live Demo: [https://mini-reading-platform.vercel.app/](https://mini-reading-platform.vercel.app/)
- GitHub Repository: [https://github.com/deveshcse/mini-reading-platform.git](https://github.com/deveshcse/mini-reading-platform.git)

---

## Assignment Coverage

### Core Requirements (Mandatory)

- **Frontend**: Next.js (App Router) - implemented in `reading-platform-client`
- **Backend**: Node.js + Express REST API - implemented in `reading-platform-server`
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: Signup, login, protected routes, refresh token session handling
- **Story System**: Create, edit, list, view, soft delete stories
- **Payment Integration**: Razorpay subscription checkout + signature verification + payment/subscription persistence

### Feature Selection Implemented

#### Basic Features (2+ implemented)

- Story publishing (create/edit/publish/unpublish)
- Story feed (list view, filters, sorting by latest, pagination)
- Likes/reactions (toggle like and check like status)
- Search/filter (story filters by publish status/premium/author from API query params)

#### Advanced Backend Feature (1+ implemented)

- Role-based access control (ADMIN, AUTHOR, READER)
- Pagination API for stories, plans, likes
- Analytics (story `viewCount` increment on story detail reads)

> Note: I have completed all mandatory assignment requirements and also implemented additional features beyond the required scope.

---

## Project Structure

This repository contains two applications:

- `reading-platform-client` -> Next.js frontend
- `reading-platform-server` -> Express + Prisma backend

### Frontend Highlights

- Next.js App Router pages for:
  - Public landing page
  - Authentication (register/login/forgot/reset password)
  - Story feed, story detail, create/edit/my stories
  - Subscription checkout
  - Profile
  - Plan management (admin-oriented UI)
- React Query based data fetching and cache invalidation
- Axios API client with automatic token refresh handling
- Route guards:
  - `AuthGuard` for protected dashboard routes
  - `RoleGuard` and `Can` for role-aware UI access control

### Backend Highlights

- Express modular route architecture:
  - `/api/v1/auth`
  - `/api/v1/stories`
  - `/api/v1/stories/:storyId/like*`
  - `/api/v1/plans`
  - `/api/v1/payments`
- Middleware stack:
  - Authentication (JWT access token)
  - Authorization (RBAC policy checks)
  - Zod request validation
  - Centralized error handling
- OpenAPI/Swagger docs available at `/docs`

---

## Tech Stack

### Frontend (`reading-platform-client`)

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS + shadcn/ui
- React Query
- Axios
- TipTap editor
- Razorpay checkout script integration

### Backend (`reading-platform-server`)

- Node.js + Express 5
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT + bcrypt authentication
- Razorpay SDK
- Zod validation
- Swagger (swagger-jsdoc + swagger-ui-express)

---

## Database Design (Prisma)

Main entities:

- `User`
- `Account` (credentials + role + refresh/verification/reset token storage)
- `Story`
- `Like`
- `Comment` (present in schema, not fully wired in routes yet)
- `Bookmark` (present in schema)
- `Plan`
- `Subscription`
- `Payment`

Enums include:

- `Role`: `ADMIN`, `AUTHOR`, `READER`
- `PaymentStatus`: `PENDING`, `SUCCESS`, `FAILED`, `REFUNDED`
- `SubscriptionStatus`: `ACTIVE`, `EXPIRED`, `CANCELLED`, `PAST_DUE`
- `PlanInterval`: `MONTHLY`, `QUARTERLY`, `YEARLY`

---

## Authentication Flow

- Register/login returns `accessToken` and `refreshToken`
- Access token used for protected API requests
- Refresh token is rotated on `/auth/refresh`
- Logout invalidates stored refresh token in database
- Frontend API interceptor retries 401 requests after refresh when applicable

Additional supported auth features:

- Forgot password
- Reset password
- `/auth/me`, `/auth/me/subscriptions`, `/auth/me/payments`, `/auth/me/activity`

---

## Story and Access Model

- AUTHORS/ADMINS can create and update stories
- Stories support:
  - `title`, `description`, `content`, `coverImage`
  - `isPublished`, `isPremium`
- Feed returns paginated results + metadata (`total`, `page`, `pageSize`, `totalPages`, `hasNextPage`, `hasPrevPage`)
- Premium stories are locked for non-subscribed users:
  - API returns teaser content
  - `isLocked` flag indicates access state
- Story detail increments `viewCount` for analytics

---

## Payment and Subscription Flow (Razorpay)

Implemented model: **Subscription-based premium access**

1. Admin creates plans with `razorpayPlanId`
2. User selects plan on subscription page
3. Frontend calls `POST /payments/create-subscription`
4. Razorpay checkout opens with returned `subscription_id`
5. On success, frontend calls `POST /payments/verify-subscription`
6. Backend verifies HMAC signature and marks:
   - Payment -> `SUCCESS`
   - Subscription -> `ACTIVE` with computed `endDate`
7. Premium story access unlocks for active subscribers

Failure paths handled:

- Razorpay auth/config issues
- Invalid signature
- Missing plan mapping
- User payment cancellation and gateway failure events

---

## API Overview

Base URL (backend): `http://localhost:8080/api/v1` (default from client env example)

Key endpoints:

- Auth:
  - `POST /auth/register`
  - `POST /auth/login`
  - `POST /auth/refresh`
  - `POST /auth/logout`
  - `GET /auth/me`
  - `POST /auth/forgot-password`
  - `POST /auth/reset-password`
- Stories:
  - `POST /stories`
  - `GET /stories`
  - `GET /stories/:id`
  - `PATCH /stories/:id`
  - `DELETE /stories/:id`
- Likes:
  - `POST /stories/:storyId/like`
  - `GET /stories/:storyId/likes`
  - `GET /stories/:storyId/like-status`
- Plans:
  - `POST /plans`
  - `GET /plans`
  - `GET /plans/:id`
  - `PATCH /plans/:id`
  - `DELETE /plans/:id`
- Payments:
  - `POST /payments/create-subscription`
  - `POST /payments/verify-subscription`

Swagger docs:

- `GET /docs`

---

## Local Development Setup

## 1) Clone repository

```bash
git clone <your-repo-url>
cd mini-reading-platform
```

## 2) Setup backend

```bash
cd reading-platform-server
npm install
```

Create `.env` from `.env.example`:

```env
PORT=8080
DATABASE_URL=postgresql://<user>:<password>@<host>:<port>/<db>
NODE_ENV=development
JWT_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d
RESEND_API_KEY=your_resend_key
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret
FRONTEND_URL=http://localhost:3000
```

Run DB and server:

```bash
npx prisma migrate dev
npm run seed
npm run dev
```

## 3) Setup frontend

```bash
cd ../reading-platform-client
npm install
```

Create `.env.local` from `.env.example`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id
```

Run frontend:

```bash
npm run dev
```



## Deployment Notes

Recommended deployment split:

- Frontend -> Vercel (already has `vercel.json`)
- Backend -> Render/Railway/Fly/EC2 (Node server)
- Database -> managed PostgreSQL (AWS RDS is valid for assignment expectation)

Minimum production env setup:

- All backend secrets and DB URL
- Frontend `NEXT_PUBLIC_API_URL` pointing to deployed backend
- CORS/`FRONTEND_URL` aligned with deployed frontend domain
- Razorpay keys in live/test mode as needed

---

## Current Status and Scope

- Assignment-focused implementation with clean modular backend and working full-stack integration
- API-first architecture with validation and centralized error handling
- Payment, RBAC, and pagination implemented

---

## Submission Checklist Mapping

- GitHub repository: [https://github.com/deveshcse/mini-reading-platform.git](https://github.com/deveshcse/mini-reading-platform.git)
- Live deployed link: [https://mini-reading-platform.vercel.app/](https://mini-reading-platform.vercel.app/)
- README with features implemented: completed in this file
- Be ready to explain:
  - Modular backend structure
  - RBAC decisions
  - Subscription + signature verification workflow
  - Story locking and access strategy

