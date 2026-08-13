# OpsFlow

OpsFlow is a full-stack internal request and approval platform built for a Full-Stack Developer RBAC assessment. Employees create and track workplace requests, Managers review requests from their direct reports, and Admins manage organization users, request oversight, and audit history.

Frontend route guards make the UI feel role-aware, but the backend is the authorization authority. Every protected API verifies authentication, active-account status, permissions, resource scope, and workflow state before returning or mutating data.

## Live Application

| Target | URL |
| --- | --- |
| Frontend demo | `TBD` |
| Backend API | `TBD` |
| Local frontend | `http://localhost:3000` |
| Local backend | `http://localhost:5000` |

## Technology Stack

**Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, shadcn/ui-style primitives, Base UI, TanStack Query, React Hook Form, Zod, Recharts, Vitest, React Testing Library.

**Backend:** Node.js, Express 5, TypeScript, Prisma 7, PostgreSQL, Zod, JWT in HttpOnly cookies, bcryptjs, Winston, Helmet, CORS, compression, express-rate-limit, Vitest, Supertest.

## Architecture

```text
opsflow/
├── backend/
│   ├── prisma/                  # Prisma schema, migrations, deterministic seed data
│   ├── src/
│   │   ├── controllers/          # Thin action controllers
│   │   ├── services/             # Role/domain use cases
│   │   ├── repositories/         # Scoped Prisma access
│   │   ├── validators/           # Zod request schemas
│   │   ├── serializers/          # Explicit API response shaping
│   │   ├── permissions/          # Permission vocabulary and role map
│   │   ├── middleware/           # Auth, validation, request IDs, errors
│   │   ├── domain/               # Shared request workflow rules
│   │   └── routes/               # Route composition by scope
│   └── tests/
└── frontend/
    ├── src/
    │   ├── app/                  # Next.js App Router routes
    │   ├── features/             # admin, manager, employee, auth, shared domains
    │   ├── components/           # Shared UI/layout primitives
    │   ├── permissions/          # UX permission helpers
    │   ├── lib/                  # API client, query client, env
    │   └── navigation/           # Role-aware navigation
    └── tests/
```

The implementation follows a role-oriented plus domain-modular structure. Role-specific workflows stay in Admin, Manager, or Employee modules; shared infrastructure such as auth, Prisma, validation, API responses, permissions, pagination, logging, and request workflow rules stays centralized.

## Roles and Scope

| Capability | Employee | Manager | Admin |
| --- | :---: | :---: | :---: |
| Login/logout and change own password | Yes | Yes | Yes |
| Create requests | Yes | Yes | Yes |
| Read/edit/submit/cancel own eligible requests | Yes | Yes | Yes |
| Read and comment on accessible requests | Yes | Yes | Yes |
| Review team requests | No | Yes | No |
| Approve/reject team requests | No | Yes | No |
| Organization-wide request visibility | No | No | Yes |
| Soft delete requests | No | No | Yes |
| Manage users, roles, and account status | No | No | Yes |
| Read audit logs and organization analytics | No | No | Yes |

Manager team scope is explicit: a request is in a Manager's review scope only when `request.createdBy.managerId = manager.id`. Managers can see their own requests as requesters, but their own requests are not treated as team-review items.

## Request Workflow

```text
DRAFT
  └─ submit ─> PENDING
                 └─ start review ─> IN_REVIEW
                                      ├─ approve ─> APPROVED
                                      └─ reject  ─> REJECTED

DRAFT or PENDING may be cancelled by the requester -> CANCELLED
```

`POST /api/v1/requests` creates `DRAFT` by default. If the request body includes `submit: true`, the backend creates `PENDING` and sets `submittedAt`. Clients never set protected fields such as owner, request number, status, timestamps, reviewer, or soft-delete state.

## API Overview

Base URL:

```text
/api/v1
```

Core routes:

```text
GET  /health

POST  /auth/login
POST  /auth/logout
GET   /auth/me
PATCH /auth/password

GET    /requests
POST   /requests
GET    /requests/:id
PATCH  /requests/:id
PATCH  /requests/:id/submit
PATCH  /requests/:id/cancel
GET    /requests/:id/comments
POST   /requests/:id/comments
DELETE /requests/:id                 # Admin-only soft delete

GET   /employee/dashboard

GET   /manager/dashboard
GET   /manager/requests
GET   /manager/requests/:id
PATCH /manager/requests/:id/start-review
PATCH /manager/requests/:id/approve
PATCH /manager/requests/:id/reject

GET   /admin/dashboard
GET   /admin/users
POST  /admin/users
GET   /admin/users/:id
PATCH /admin/users/:id/role
PATCH /admin/users/:id/status
GET   /admin/requests
GET   /admin/requests/:id
GET   /admin/audit-logs
GET   /admin/audit-logs/:id
```

Responses are shaped by serializers and never expose password hashes. Unauthorized private resource lookups use privacy-preserving not-found behavior where appropriate.

## Security Decisions

- No public registration. Accounts are created by Admins or by controlled seed/bootstrap processes.
- Authentication uses short-lived JWTs stored in server-controlled HttpOnly cookies, not localStorage bearer tokens.
- Production cookies are configured with `HttpOnly`, `Secure`, and SameSite policy.
- Backend permissions are explicit; Admin is not a scattered bypass.
- Resource ownership and Manager team scope are checked server-side.
- Request workflow actions are explicit endpoints, not arbitrary status updates.
- Admin request deletion is soft deletion through `deletedAt`; request, comment, and audit history are preserved.
- Audit metadata is sanitized so passwords, tokens, cookies, auth headers, and secrets are not recorded or displayed.
- Production CORS must use an allowlist origin for authenticated APIs.

## Local Setup

Prerequisites:

```text
Node.js 20+
npm
PostgreSQL
Git
```

Install dependencies:

```bash
cd backend
npm install

cd ../frontend
npm install
```

## Environment Setup

Backend:

```bash
cd backend
cp .env.example .env
```

Configure `backend/.env`:

```env
NODE_ENV=development
PORT=5000
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/opsflow?schema=public"
JWT_SECRET="replace-with-a-secure-development-secret"
JWT_EXPIRES_IN="1h"
FRONTEND_ORIGIN="http://localhost:3000"
```

Frontend:

```bash
cd frontend
cp .env.example .env.local
```

Configure `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL="http://localhost:5000/api/v1"
```

Only `NEXT_PUBLIC_*` values are exposed to the browser. Keep database URLs, JWT secrets, and other server secrets in backend environment files only.

## Database Migration and Seed

Run from `backend/`:

```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

The seed creates deterministic demo users, manager-report relationships through `User.managerId`, realistic requests, comments, and audit entries. It is for reviewer/demo setup and is not run automatically on application startup.

If no demo Admin exists, create the first Admin through a controlled seed/bootstrap step. OpsFlow intentionally does not provide unauthenticated Admin self-registration.

## Demo Credentials

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@opsflow.demo` | `Admin@123` |
| Manager | `manager@opsflow.demo` | `Manager@123` |
| Employee | `employee@opsflow.demo` | `Employee@123` |

Additional seeded users exist for richer dashboards, including a second Manager team. Demo credentials are for local/demo environments only.

## Development

Start the backend:

```bash
cd backend
npm run dev
```

Start the frontend in another terminal:

```bash
cd frontend
npm run dev
```

Then open:

```text
http://localhost:3000/login
```

## Verification Commands

Backend:

```bash
cd backend
npm run prisma:validate
npm run typecheck
npm run lint
npm run test
npm run build
```

Frontend:

```bash
cd frontend
npm run typecheck
npm run lint
npm run test
npm run build
```

## Production Build

Backend:

```bash
cd backend
npm run build
npm start
```

Frontend:

```bash
cd frontend
npm run build
npm start
```

Set production environment variables before running production services. Use a strong `JWT_SECRET`, a production PostgreSQL `DATABASE_URL`, and an explicit `FRONTEND_ORIGIN`.

## Assessment Notes

- Backend is the final authority for authentication, authorization, resource ownership, and workflow validity.
- Frontend permissions are UX helpers only.
- Employee request data is scoped to the authenticated requester.
- Manager review data is scoped by `User.managerId`.
- Admin access is organization-wide but still uses explicit permissions and guarded actions.
- Request deletion is soft deletion.
- Audit logging is append-only and covers login, logout, password changes, request lifecycle events, comments, user creation, role changes, account status changes, and request archival.
- Search, filters, sorting, and pagination are server-backed; the frontend does not fetch broad datasets and filter unauthorized data client-side.

## Optional Demo Assets

Screenshots, deployment links, and a short demo video can be added here after deployment:

```text
Frontend deployment: TBD
Backend deployment: TBD
Demo video: TBD
Screenshots: TBD
```
