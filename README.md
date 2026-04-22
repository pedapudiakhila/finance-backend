# FinanceOS — Finance Dashboard

A full-stack finance dashboard system with a React frontend and Node.js/Express/MongoDB backend. Supports role-based access control, financial record management, and real-time analytics.

---

## Live Demo

| Layer | URL |
|-------|-----|
| Frontend | https://finance-backend-indol.vercel.app |
| Backend API | https://finance-backend-production-09e7.up.railway.app |
| API Docs | https://documenter.getpostman.com/view/45889737/2sBXqFMhAE |

---

## Tech Stack

### Backend
- **Runtime** — Node.js
- **Framework** — Express.js
- **Database** — MongoDB Atlas
- **ODM** — Mongoose
- **Authentication** — JWT (JSON Web Tokens)
- **Validation** — Zod
- **Password Hashing** — Bcryptjs
- **Rate Limiting** — express-rate-limit
- **Testing** — Jest + Supertest

### Frontend
- **Framework** — React.js
- **Routing** — React Router v6
- **HTTP Client** — Axios
- **Charts** — Recharts
- **Animations** — Framer Motion
- **Notifications** — React Hot Toast

---

## Project Structure

```
finance-backend/
├── src/                        # Backend source
│   ├── config/
│   │   ├── db.js               # MongoDB connection
│   │   └── env.js              # Environment variable loader
│   ├── middleware/
│   │   ├── auth.middleware.js  # JWT verification + active user check
│   │   ├── role.middleware.js  # Role based access control guard
│   │   └── validate.js         # Zod request body validator
│   ├── models/
│   │   ├── User.js             # User schema with role and status
│   │   └── FinancialRecord.js  # Financial record schema with indexes
│   ├── modules/
│   │   ├── auth/               # Register, login, me
│   │   ├── users/              # User management (admin only)
│   │   ├── records/            # Financial records CRUD
│   │   └── dashboard/          # Aggregated analytics
│   ├── utils/
│   │   ├── ApiError.js         # Centralised error class
│   │   ├── ApiResponse.js      # Consistent response helpers
│   │   └── pagination.js       # Pagination utility
│   ├── seed.js                 # Database seeder
│   ├── app.js                  # Express app setup
│   └── server.js               # Entry point
├── client/                     # React frontend
│   ├── public/
│   └── src/
│       ├── api.js              # Axios instance with auth interceptor
│       ├── pages/
│       │   ├── Login.js        # Login page
│       │   ├── Register.js     # Registration page
│       │   ├── Dashboard.js    # Analytics dashboard
│       │   ├── Records.js      # Financial records CRUD
│       │   └── Users.js        # User management (admin only)
│       ├── components/
│       └── App.js              # Routes + layout
├── tests/                      # Jest test suites
│   ├── auth.test.js
│   ├── records.test.js
│   ├── dashboard.test.js
│   └── setup.js
└── README.md
```

---

## Getting Started

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (free tier is sufficient)

### Backend Setup

```bash
git clone https://github.com/pedapudiakhila/finance-backend.git
cd finance-backend
npm install
```

Create a `.env` file in the root:
```env
MONGODB_URI="your-mongodb-atlas-connection-string"
JWT_SECRET="your-jwt-secret-key"
JWT_EXPIRES_IN="7d"
PORT=3000
NODE_ENV=development
```

Seed the database:
```bash
npm run seed
```

Start the backend:
```bash
npm run dev
```

Backend runs at `http://localhost:3000`

### Frontend Setup

```bash
cd client
npm install
npm start
```

Frontend runs at `http://localhost:3000` (React dev server on port 3000, backend moves to 3001 or configure accordingly)

---

## Demo Credentials

After running `npm run seed`:

| Role | Email | Password | Access |
|------|-------|----------|--------|
| Admin | admin@finance.com | admin123 | Full access |
| Analyst | analyst@finance.com | analyst123 | View records + dashboard |
| Viewer | viewer@finance.com | viewer123 | Dashboard only |

---

## Roles and Permissions

| Action | VIEWER | ANALYST | ADMIN |
|--------|--------|---------|-------|
| Register / Login | ✅ | ✅ | ✅ |
| View own profile | ✅ | ✅ | ✅ |
| View dashboard summary | ✅ | ✅ | ✅ |
| View financial records | ❌ | ✅ | ✅ |
| Filter and search records | ❌ | ✅ | ✅ |
| Create records | ❌ | ❌ | ✅ |
| Update records | ❌ | ❌ | ✅ |
| Delete records | ❌ | ❌ | ✅ |
| View all users | ❌ | ❌ | ✅ |
| Update user roles | ❌ | ❌ | ✅ |
| Toggle user status | ❌ | ❌ | ✅ |

---

## API Reference

Base URL: `https://finance-backend-production-09e7.up.railway.app/api/v1`

Full documentation: https://documenter.getpostman.com/view/45889737/2sBXqFMhAE

### Health Check
```
GET /api/health
```

### Auth

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/v1/auth/register | No | Create a new account |
| POST | /api/v1/auth/login | No | Login and receive JWT |
| GET | /api/v1/auth/me | Yes | Get current user profile |

### Financial Records

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| GET | /api/v1/records | ANALYST, ADMIN | List records with filters |
| GET | /api/v1/records/:id | ANALYST, ADMIN | Get single record |
| POST | /api/v1/records | ADMIN | Create a record |
| PATCH | /api/v1/records/:id | ADMIN | Update a record |
| DELETE | /api/v1/records/:id | ADMIN | Soft delete a record |

**Query parameters:**

| Param | Description |
|-------|-------------|
| type | INCOME or EXPENSE |
| category | Filter by category name |
| search | Search in category and notes |
| from | Start date (ISO format) |
| to | End date (ISO format) |
| page | Page number (default: 1) |
| limit | Results per page (default: 10) |

### Dashboard

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| GET | /api/v1/dashboard | ALL | Get financial summary |

Response includes total income, expenses, net balance, recent activity, category breakdown, monthly and weekly trends.

### Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/v1/users | List all users |
| GET | /api/v1/users/:id | Get single user |
| PATCH | /api/v1/users/:id/role | Update user role |
| PATCH | /api/v1/users/:id/status | Toggle active/inactive |

---

## Key Design Decisions

### Role Based Access Control
Access control is enforced at the middleware level using a `requireRole(...roles)` factory function. Every protected route declares exactly which roles are allowed, making permissions explicit and easy to audit.

### Soft Deletes
Financial records are never permanently removed. Deleted records are marked `isDeleted: true` and excluded from all queries, preserving data integrity for audit purposes.

### JWT Authentication
The JWT payload carries the user's id, email, and role. The auth middleware verifies the token and checks that the user still exists and is active on every request — preventing deactivated users from using an old token.

### Password Security
Passwords are hashed using bcryptjs with a cost factor of 10. The User schema strips the password field from all JSON output at the schema level.

### Aggregation for Dashboard
The dashboard uses MongoDB's aggregation pipeline for all summary calculations rather than loading records into application memory. This keeps analytics efficient regardless of record count.

### Database Indexing
The FinancialRecord model defines compound indexes on `type`, `category`, and `date` fields to speed up common filter operations.

### API Versioning
All routes are prefixed with `/api/v1/` to support future version upgrades without breaking existing clients.

---

## Assumptions Made

1. New users register as VIEWER by default. An admin must manually promote users — this prevents privilege escalation.
2. An admin cannot deactivate their own account to prevent accidental lockout.
3. Dashboard is accessible to all authenticated users regardless of role.
4. Deleted records remain in the database for audit trail purposes.
5. Search runs case-insensitive across both category and notes fields.
6. Monthly trend covers 6 months and weekly trend covers 4 weeks.
7. Pagination defaults to 10 records per page.

---

## Tradeoffs

- **No refresh tokens** — JWTs expire after 7 days. A production system would implement refresh token rotation.
- **No email verification** — Users are active immediately. Adding verification requires a mail service outside this scope.
- **MongoDB over relational** — MongoDB's flexibility and aggregation pipeline suited this scope well. PostgreSQL would be preferred for strict relational data in production.
- **Global rate limiting** — Currently uniform across all routes. Production would apply stricter limits on auth endpoints specifically.
- **In-memory rate limiting** — Resets on server restart. Redis-based rate limiting would persist across restarts in production.

---

## Scalability Notes

- **Horizontal scaling** — The stateless JWT architecture allows multiple server instances behind a load balancer without session sharing.
- **Database indexing** — Compound indexes on frequently queried fields keep response times stable as record count grows.
- **Aggregation pipeline** — Dashboard analytics run entirely in MongoDB, offloading computation from the application layer.
- **Caching** — Dashboard summary results could be cached in Redis with a short TTL to reduce database load under high traffic.
- **Microservices** — The modular structure (auth, users, records, dashboard) makes it straightforward to split into separate services if scale demands it.

---

## Optional Enhancements Implemented

| Enhancement | Implementation |
|-------------|----------------|
| Authentication | JWT with token expiry and active user verification on every request |
| Pagination | All record listing endpoints support page and limit params |
| Search | Case insensitive search across category and notes fields |
| Soft Delete | Records marked isDeleted instead of permanently removed |
| Rate Limiting | 100 requests per 15 minutes per IP |
| Unit Tests | 27 tests across 3 test suites using Jest and Supertest |
| API Documentation | Postman collection published publicly |
| API Versioning | All routes prefixed with /api/v1/ |
| Frontend UI | Full React dashboard with charts, animations, RBAC-aware UI |

---

## Tests

```bash
npm test
```

Tests use an in-memory MongoDB instance — no real database needed.

**Coverage:**
- User registration and login
- JWT authentication and token validation
- Role based access control for all three roles
- Financial record CRUD operations
- Record filtering, search, and pagination
- Soft delete verification
- Dashboard summary and analytics
- Error handling and validation responses

**Test Suites: 3 | Tests: 27 | All Passing ✅**

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start backend development server |
| `npm start` | Start backend production server |
| `npm run seed` | Seed database with sample data |
| `npm test` | Run all tests |
