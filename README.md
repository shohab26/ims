# InvenTrack — Inventory Management System

A full-stack, role-based inventory management platform for small to mid-size operations. Track products, vendors, customers, stock, purchase orders, deliveries, and invoices from a single dashboard. Generate branded PDF invoices, control access per-user with a granular permission matrix, and never lose data — every delete is recoverable from the Trash tab.

---

## Tech stack

| Layer        | Technology                                                                                |
|--------------|-------------------------------------------------------------------------------------------|
| Frontend     | **Angular 17.3** (standalone components, lazy routing, reactive forms, HTTP interceptor) |
| UI library   | **Bootstrap 5**, **FontAwesome 6**, **ng2-charts** (Chart.js)                             |
| Backend      | **Node.js** + **Express 4** (REST API on port `3001`)                                     |
| Auth         | **JWT** (8h expiry), **bcryptjs**, **Nodemailer** (Gmail SMTP for first-login OTP)        |
| Documents    | **PDFKit** — server-side branded A4 PDF invoices                                          |
| Database     | **PostgreSQL** on **Supabase** (pooler, `aws-1-ap-northeast-2`)                           |
| DB driver    | `pg` (node-postgres)                                                                      |

The dev environment runs the API on `:3001` and the Angular dev server on `:4200` (with a proxy in place to avoid CORS hassle in production).

---

## Feature highlights

- **Granular RBAC** — roles, users, modules, and a per-module permission matrix (`can_view` / `can_create` / `can_update` / `can_delete`). Super-admin bypass is built in.
- **OTP-based first login** — new users receive a one-time code by email (Nodemailer + Gmail SMTP), bcrypt-hashed and 10-min expiry, force them to set their own password before they can use the system.
- **Paginated CRUD + keyword search** for every entity: products, vendors, customers, categories, warehouses, statuses, stocks, orders, deliveries, invoices. `MAX_LIMIT = 100` per page.
- **Stock auto-adjustment** — saving a purchase order increases stock; saving a delivery decreases it. Logic lives in `api/services/stockupdate.js`.
- **Invoice builder** — line items with quantity, unit price, subtotal, discount, tax %, and grand total. Save/update wrapped in `BEGIN / COMMIT / ROLLBACK` for atomicity. Statuses: `draft | sent | paid | overdue | cancelled`.
- **PDF export** — server-side PDFKit generation; clicking the PDF icon on an invoice row triggers an A4 download.
- **Dashboard with charts** — ng2-charts for latest orders and total sales KPIs.
- **Soft delete with Trash + Restore** — every list page has Active / Trash tabs. Deleting a row sets `is_deleted = TRUE` instead of removing it; a super-admin can restore from the Trash tab. See `SOFT_DELETE_README.md` for the full design.
- **Admin UI** — manage roles, users, and the permission matrix from the same portal. Users-management and roles are gated on `roleGuard` (super-admin only).

---

## Project layout

```
ims/
├── api/                    # Node / Express backend
│   ├── server.js           # entry — boots Express on :3001
│   ├── index.js            # app setup, CORS, route mounting
│   ├── connection.js       # pg Pool against Supabase
│   ├── controller/         # one file per resource (auth, products, invoices, …)
│   ├── routes/             # one router per resource; mounted in index.js
│   ├── middleware/         # auth.middleware.js — verifyToken, checkPermission, requireDeletePermission
│   ├── services/           # emailService, passwordSetupService, stockupdate
│   ├── utils/              # pagination, softDelete helpers
│   ├── model/              # server-side models (book_model.js)
│   ├── schema.sql          # full DB schema
│   ├── migration_*.sql     # 5 incremental migrations (RBAC, permissions, invoices, OTP, soft delete)
│   ├── run_migration*.js   # one runner per migration
│   ├── seed_superadmin.js  # bootstraps admin@inventory.com / Admin@1234
│   └── .env                # PG creds, JWT secret, Gmail creds (gitignored)
│
├── portal/                 # Angular 17 frontend
│   ├── angular.json
│   ├── package.json
│   └── src/app/
│       ├── app.module.ts
│       ├── app-routing.module.ts
│       ├── components/     # 10 list components + admin screens + login/register
│       ├── services/       # auth, admin (RBAC), product (REST client), toast
│       ├── guards/         # authGuard, roleGuard, permissionGuard
│       ├── interceptors/   # auth.interceptor — adds Authorization: Bearer
│       ├── model/          # inventory.model.ts
│       └── template/       # main-wrapper (dashboard layout)
│
├── db/                     # reference PostgreSQL dumps
│   ├── dump-inventory_db-202606020032.sql
│   └── inv.sql
│
├── SOFT_DELETE_README.md   # detailed doc for the Trash / Restore feature
└── README.md               # this file
```

---

## Database

The application schema lives in `api/schema.sql`. The DB is hosted on Supabase (PostgreSQL 15). Connection is configured in `api/.env`:

```
PG_HOST=aws-1-ap-northeast-2.pooler.supabase.com
PG_PORT=5432
PG_USER=...
PG_DATABASE=postgres
PG_PASSWORD=...
```

The base schema covers: `users`, `roles`, `modules`, `role_permissions`, `categories`, `warehouses`, `status`, `products`, `vendors`, `customers`, `stocks`, `order_details`, `delivery_details`, `invoices`, `invoice_items`, plus a legacy `book` table for the demo module.

Five migrations extend the schema over time; each is idempotent and has a one-file runner:

| Migration                          | Adds                                                             |
|------------------------------------|------------------------------------------------------------------|
| `migration_auth_rbac.sql`          | roles, modules, role_permissions, OTP columns on users          |
| `migration_permissions.sql`        | seeded default role permissions + dashboard module               |
| `migration_invoices.sql`           | `invoices` and `invoice_items` tables                            |
| `migration_user_first_login_otp.sql` | OTP hash + expiry columns on `users`                          |
| `migration_soft_delete.sql`        | `is_deleted`, `deleted_at`, `deleted_by` on every business table |

---

## Running it locally

### 1. Database

Either restore one of the dumps in `db/` or run the migrations on a fresh Supabase project:

```bash
cd api
node run_migration_auth_rbac.js
node run_migration_permissions.js
node run_migration_invoices.js
node run_migration_user_first_login_otp.js
node run_migration_soft_delete.js

# Bootstrap the super-admin
node seed_superadmin.js
```

Copy `.env.example` to `.env` and fill in the PG credentials, JWT secret, and Gmail SMTP credentials.

### 2. Backend

```bash
cd api
npm install
npm start        # nodemon server.js → :3001
```

### 3. Frontend

```bash
cd portal
npm install
npm start        # ng serve → :4200
```

Default super-admin login (after running the seed script):

- **Email:** `admin@inventory.com`
- **Password:** `Admin@1234`

You'll be prompted to change the password on first login via the OTP flow.

---

## Authentication and authorization

- **JWT** signed with `JWT_SECRET`, 8-hour expiry, payload contains `id`, `role_id`, and `role_name`.
- **bcryptjs** for password hashing. The `passwordSetupService` blocks re-use of the user's current password.
- **OTP** on first login: a random 6-character code is emailed via Nodemailer + Gmail SMTP, hashed with bcrypt, and stored on the user record with a 10-minute expiry. The user must verify it before they can set a new password.
- **Permissions** are computed from `role_permissions` joined to `modules`. The HTTP method maps to a column (`GET` → `can_view`, `POST` → `can_create`, `PATCH` → `can_update`, `DELETE` → `can_delete`). Super-admin bypasses all checks.
- A dedicated `requireDeletePermission('<module>')` middleware exists for endpoints where the verb doesn't match the semantic action (e.g. `POST /restore/:id` is a delete, not a create).
- **Frontend** stores the user's role and per-module permissions in `localStorage`; the `auth.interceptor` adds the `Authorization: Bearer …` header on every outgoing request. `permissionGuard` blocks routes the user doesn't have access to.

---

## REST API surface

| Method | Path                              | Notes                                  |
|--------|-----------------------------------|----------------------------------------|
| POST   | `/auth/login`                     | email + password → JWT                 |
| POST   | `/auth/setup-password`            | verify OTP + set new password          |
| GET    | `/auth/me`                        | current user (used to refresh perms)   |
| GET/POST/PATCH/DELETE | `/<resource>` / `/<resource>/:id` | one per resource: products, vendors, customers, categories, warehouses, status, stocks, orders, delivery, invoices |
| GET    | `/<resource>/search?value=…`      | keyword search (ILIKE across columns)  |
| GET    | `/<resource>/trash`               | soft-deleted rows                      |
| POST   | `/<resource>/restore/:id`         | restore from trash                     |
| GET    | `/orders/latest`, `/orders/total` | dashboard KPIs                         |
| GET    | `/delivery/latest`, `/delivery/total` | dashboard KPIs                      |
| GET    | `/invoices/:id/pdf`               | PDFKit-generated PDF                   |
| GET/POST/PATCH/DELETE | `/admin/roles`, `/admin/users` | super-admin only                |
| GET/PUT | `/admin/permissions`            | edit the role-permission matrix        |
| GET/POST/PATCH/DELETE | `/book/...`                  | legacy demo module, no permission gate |

`/book` is the only legacy route mounted **without** `checkPermission` — it's a demo module left in for backward compatibility.

---

## Frontend

- Built on **Angular 17.3** with the standalone-components style. Bootstrapped in `app.module.ts` and routed in `app-routing.module.ts`.
- **Routing guards:** `authGuard` (logged in?) → `roleGuard` (super-admin only for admin pages) → `permissionGuard` (per-module permission). All three are applied in the route tree.
- **HTTP interceptor** (`interceptors/auth.interceptor.ts`) attaches `Authorization: Bearer <token>` from localStorage and centralizes 401 handling.
- **State** is per-component; no NgRx — this is a CRUD-heavy admin app, and component state is the simplest fit.
- **Reactive forms** with `Validators` for every create/edit form. Forms are disabled (`.disable()`) when in view-only mode so the eye-icon "View" action can show the same modal as a read-only detail page.
- **Pagination** is a simple page-number navigator at the bottom of each list, with the page count returned in the API response (`{ data, total, page, totalPages }`).
- **Search** is a debounced-by-keystroke text input above each table; it calls the `/search?value=…` endpoint.
- **Bootstrap 5** is the base CSS; **FontAwesome 6** for icons; **ng2-charts** for the dashboard.

### Component pattern

Each list component follows the same shape:

- A toolbar with a search input and a "Create New" button (gated on `authService.hasPermission('<module>', 'create')`).
- A paginated table with view / edit / delete actions per row (gated per action).
- A modal containing a reactive form (the same modal handles view, create, and edit — `menuType` flag and `viewOnly` flag switch its mode).
- Toast feedback via `ToastService` on every save / delete.
- An `Active` ↔ `Trash` nav-pill tab strip with a `loadTrash()` and `restoreX()` method, for soft-deleted rows.

---

## Build order and what's next

The `ims.json` file at the repo root is the canonical gap-analysis. The recommended 8-week build order from that document is:

| Week | Build                                                                                    |
|------|------------------------------------------------------------------------------------------|
| 1    | Input validation + DB indexes + Soft delete                                              |
| 2    | Audit log + Stock movement history                                                       |
| 3    | Payment recording + Invoice status automation                                            |
| 4    | Returns module + Low-stock alerts                                                         |
| 5    | Reports module (sales, stock valuation)                                                  |
| 6    | Dashboard v2 with date filters                                                           |
| 7    | Swagger docs + Centralized error handling                                                |
| 8    | Product images + Bulk CSV import/export                                                  |

Status of the items above as of the current branch (`shohab`):

- ✅ Soft delete (this branch) — see `SOFT_DELETE_README.md`
- ⏳ Everything else from the gap-analysis is pending

---

## License

ISC.
