# Finance Backend API

A RESTful backend API for a Finance Dashboard system built with Node.js, Express, and MongoDB. The system supports role-based access control, financial record management, dashboard analytics, and summary-level reporting.

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB Atlas
- **ODM**: Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Zod
- **Password Hashing**: Bcryptjs
- **Rate Limiting**: express-rate-limit

## Project Structure
```
finance-backend-mongo/
├── src/
│   ├── config/
│   │   ├── db.js              # MongoDB connection
│   │   └── env.js             # Environment variable loader
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
│   ├── app.js                  # Express app setup and middleware
│   └── server.js               # Entry point
├── .env
└── package.json
```

## Getting Started

### Prerequisites
- Node.js v18+
- A MongoDB Atlas account (free tier is sufficient)

### Installation
```bash
git clone <your-repo-url>
cd finance-backend-mongo
npm install
```

### Environment Variables

Create a `.env` file in the root directory:
```env
MONGODB_URI="your-mongodb-atlas-connection-string"
JWT_SECRET="your-jwt-secret-key"
JWT_EXPIRES_IN="7d"
PORT=3000
NODE_ENV=development
```

### Seed the Database

Populate the database with sample users and financial records:
```bash
npm run seed
```

This creates the following users automatically:

| Name | Email | Password | Role |
|------|-------|----------|------|
| Admin User | admin@finance.com | admin123 | ADMIN |
| Analyst User | analyst@finance.com | analyst123 | ANALYST |
| Viewer User | viewer@finance.com | viewer123 | VIEWER |

It also creates 6 sample financial records across two months for testing dashboard analytics.

### Run the Server
```bash
npm run dev
```

Server runs at `http://localhost:3000`

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

### Health Check
```
GET /api/health
```

---

### Auth

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/register | No | Create a new account |
| POST | /api/auth/login | No | Login and receive JWT |
| GET | /api/auth/me | Yes | Get current user profile |

**Register:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Login:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

---

### Financial Records

All routes require `Authorization: Bearer <token>`

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| GET | /api/records | ANALYST, ADMIN | List records with filters |
| GET | /api/records/:id | ANALYST, ADMIN | Get single record |
| POST | /api/records | ADMIN | Create a record |
| PATCH | /api/records/:id | ADMIN | Update a record |
| DELETE | /api/records/:id | ADMIN | Soft delete a record |

**Query parameters for GET /api/records:**

| Param | Type | Description |
|-------|------|-------------|
| type | string | INCOME or EXPENSE |
| category | string | Filter by category name |
| search | string | Search in category and notes |
| from | date | Start date (ISO format) |
| to | date | End date (ISO format) |
| page | number | Page number (default: 1) |
| limit | number | Results per page (default: 10) |

**Create record body:**
```json
{
  "amount": 75000,
  "type": "INCOME",
  "category": "Salary",
  "date": "2026-04-01T00:00:00.000Z",
  "notes": "April monthly salary"
}
```

---

### Dashboard

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| GET | /api/dashboard | ALL | Get financial summary |

**Response includes:**
- Total income, total expense, net balance
- Last 10 recent transactions
- Category wise breakdown with transaction counts
- Monthly trends for the last 6 months
- Weekly trends for the last 4 weeks

---

### Users

All routes require ADMIN role.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/users | List all users |
| GET | /api/users/:id | Get single user |
| PATCH | /api/users/:id/role | Update user role |
| PATCH | /api/users/:id/status | Toggle active/inactive |

**Update role body:**
```json
{
  "role": "ANALYST"
}
```

---

## Response Format

**Success:**
```json
{
  "success": true,
  "message": "Records fetched successfully",
  "data": {}
}
```

**Error:**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": ["amount: Amount must be a positive number"]
}
```

**Paginated response:**
```json
{
  "success": true,
  "message": "Records fetched successfully",
  "data": {
    "data": [],
    "meta": {
      "total": 20,
      "page": 1,
      "limit": 10,
      "totalPages": 2
    }
  }
}
```

---

## Key Design Decisions

### Role Based Access Control
Access control is enforced at the middleware level using a `requireRole(...roles)` factory function. Every protected route declares exactly which roles are allowed, making permissions explicit and easy to audit.

### Soft Deletes
Financial records are never permanently removed. Deleted records are marked `isDeleted: true` and excluded from all queries. This preserves data integrity for audit purposes while keeping the API behaviour clean.

### JWT Authentication
The JWT payload carries the user's id, email, and role. The auth middleware verifies the token and also checks that the user still exists and is active on every request — preventing deactivated users from continuing to use an old token.

### Password Security
Passwords are hashed using bcryptjs with a cost factor of 10. The User schema strips the password field from all JSON output at the schema level, so it is never accidentally returned in any response.

### Aggregation for Dashboard
The dashboard uses MongoDB's aggregation pipeline for all summary calculations — groupBy, sum, and date truncation — rather than loading records into memory and computing in application code. This keeps analytics efficient regardless of record count.

### Database Indexing
The FinancialRecord model defines compound indexes on `type`, `category`, and `date` fields to speed up the most common filter operations.

---

## Assumptions Made

1. New users register as VIEWER by default. An admin must manually promote users to ANALYST or ADMIN — this prevents accidental privilege escalation.

2. An admin cannot deactivate their own account. This prevents accidental lockout where no admin remains accessible.

3. Dashboard summary is accessible to all authenticated users regardless of role. Viewers can see high level numbers but cannot drill into individual records.

4. Deleted records are excluded from all listing and dashboard queries but remain in the database. This is intentional for audit trail purposes.

5. Search runs a case-insensitive match across both the category and notes fields simultaneously.

6. Monthly trend covers the last 6 months and weekly trend covers the last 4 weeks. Longer ranges were considered unnecessary for a dashboard context.

7. Pagination defaults to 10 records per page to keep response sizes manageable without requiring the client to always specify a limit.

---

## Tradeoffs

- **No refresh tokens** — JWTs expire after 7 days. A production system would implement refresh token rotation, but this was intentionally kept simple for the scope of this assignment.
- **No email verification** — Users are active immediately after registration. Adding email verification would require a mail service which is outside the scope.
- **MongoDB over relational** — Financial data with strict relationships might benefit from PostgreSQL in a production system, but MongoDB's flexibility made schema iteration faster for this scope and the aggregation pipeline handles all analytics requirements cleanly.
- **Rate limiting is global** — The current implementation applies rate limiting uniformly across all routes. A more granular approach would apply stricter limits specifically to auth endpoints.

---
## Optional Enhancements Implemented

All optional enhancements mentioned in the assignment have been implemented:

| Enhancement | Implementation |
|---|---|
| Authentication | JWT based with token expiry and active user verification |
| Pagination | All record listing endpoints support page and limit params |
| Search | Case insensitive search across category and notes fields |
| Soft Delete | Records marked isDeleted instead of permanently removed |
| Rate Limiting | 100 requests per 15 minutes per IP via express-rate-limit |
| Unit Tests | 27 tests across 3 test suites using Jest and Supertest |
| API Documentation | Full API reference included in this README |

## Tests

Unit and integration tests are written using **Jest** and **Supertest** with an in-memory MongoDB instance so no real database is needed to run tests.

Run all tests:
```bash
npm test
```

**Test coverage includes:**
- User registration and login
- JWT authentication and token validation
- Role based access control for all three roles
- Financial record CRUD operations
- Record filtering, search, and pagination
- Soft delete verification
- Dashboard summary and analytics
- Error handling and validation responses

**Test Suites: 3 | Tests: 27 | All Passing** ✅

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with auto-reload |
| `npm start` | Start production server |
| `npm run seed` | Seed database with sample data |