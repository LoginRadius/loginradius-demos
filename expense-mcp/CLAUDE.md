# CLAUDE.md

## Project Overview

Expense management system with dual REST API and MCP (Model Context Protocol) interfaces. Built as a Turborepo monorepo using TypeScript, Express 5, SQLite, and LoginRadius for authentication.

## Repository Structure

```
apps/expenses-server/src/   # Main backend server
  api/                      # REST routes, controllers, validators
  mcp/                      # MCP tool definitions (7 tools)
  db/                       # SQLite schema, seed, repositories
  services/                 # Business logic layer
  middleware/               # Auth (LoginRadius JWT), RBAC, audit, error handling
  config/                   # Env validation (Zod), derived LR endpoints, constants
  types/                    # TypeScript interfaces
  utils/                    # Errors, response helpers, JWT verification, token exchange
apps/expense-client/src/    # React SPA (Vite) driving the same REST API
packages/
  eslint-config/            # Shared ESLint configs
  typescript-config/        # Shared tsconfig bases
```

## Commands

```bash
# Root level (turbo)
pnpm run dev           # Start all packages in dev mode
pnpm run build         # Build all packages
pnpm run lint          # Lint all packages
pnpm run check-types   # Type check all packages
pnpm run format        # Prettier format

# Server level (apps/expenses-server)
pnpm run dev           # Dev server with tsx watch (port 3000)
pnpm run build         # Compile TS to dist/
pnpm run db:seed       # Seed database with test data
pnpm run db:reset      # Drop tables and reseed
pnpm run typecheck     # tsc --noEmit
```

Package manager is **pnpm**. Use `pnpm` instead of `npm`.

## Architecture

Layered architecture: Routes/MCP Tools → Controllers → Services → Repositories → SQLite

- **Auth**: LoginRadius JWT validation via middleware (OIDC/JWKS); OAuth 2.1 scopes for MCP
- **RBAC**: 3 roles (employee, manager, finance_admin) with scope-based authorization
- **Database**: better-sqlite3 with WAL mode, direct SQL (no ORM), repository pattern
- **Validation**: Zod schemas for all inputs
- **Dual interface**: REST API at `/api/*`, MCP server at `/mcp`

## Key Patterns

- Path alias: `@/*` maps to `./src/*` and is used for every intra-package import;
  there are no relative imports in `apps/expenses-server/src`. `tsc` type-checks the
  alias but does not rewrite it on emit, so `build` is `tsc && tsc-alias` — without the
  second step `node dist/index.js` fails with `ERR_MODULE_NOT_FOUND`.
- Repositories extend `BaseRepository` with prepared statement caching
- Custom error classes in `src/utils/errors.ts` (UnauthorizedError, ForbiddenError, ValidationError, NotFoundError, ConflictError)
- Expense status flow: `pending → approved → paid` or `pending → rejected`
- All mutations are audit-logged to `audit_log` table
- DB singleton with lazy initialization in `src/db/index.ts`

## Permissions & Authorization

### Roles

Three roles, derived from token scopes by `deriveRolesFromScopes()` in
`src/middleware/rbac.middleware.ts`:

| Role            | Description                               | Capabilities                                                   |
| --------------- | ----------------------------------------- | -------------------------------------------------------------- |
| `employee`      | Default role (assigned if no roles match) | Submit expenses, view own expenses                             |
| `manager`       | Department manager                        | All employee capabilities + view/approve/reject team expenses  |
| `finance_admin` | Finance administrator                     | All manager capabilities + view all expenses, generate reports |

Role hierarchy: `finance_admin` > `manager` > `employee`.

Roles are **not** a separate credential — they are computed from the scopes in the
token, so holding `expense:view:team` is what makes a caller a manager. Routes are
therefore gated on scopes (`requireScopes()` / `requireAnyScope()`); roles drive
*data scoping* inside the service layer via `isFinanceAdmin()` /
`isManagerOrHigher()`, which decide whose expenses a caller may see. The one
role-level route guard is `requireFinanceAdmin()`, on `POST /api/users/register`.

### OAuth 2.1 Scopes

Six scopes defined in `src/config/constants.ts` (`McpScopes`), enforced via `requireScopes()` / `requireAnyScope()` middlewares on both REST and MCP endpoints:

| Scope                     | Purpose                       | Used by                                                                                                           |
| ------------------------- | ----------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `expense:submit`          | Submit new expenses           | `POST /api/expenses`, `submit_expense` MCP tool                                                                   |
| `expense:view:own`        | View own submitted expenses   | `GET /api/expenses/me`, `list_my_expenses` MCP tool                                                               |
| `expense:view:team`       | View direct reports' expenses | `GET /api/expenses/team/:teamId`, `list_team_expenses` MCP tool                                                   |
| `expense:view:all`        | View all expenses system-wide | `GET /api/expenses/all` (finance_admin only)                                                                      |
| `expense:approve`         | Approve or reject expenses    | `POST /api/expenses/:id/approve`, `POST /api/expenses/:id/reject`, `approve_expense` / `reject_expense` MCP tools |
| `expense:report:generate` | Generate expense reports      | `POST /api/expenses/reports/generate`, `generate_report` MCP tool                                                  |

### Endpoint → Permission Matrix

| Endpoint                         | Role Guard        | Scope Guard                                                        |
| -------------------------------- | ----------------- | ------------------------------------------------------------------ |
| `POST /api/expenses`             | any authenticated | `expense:submit`                                                   |
| `GET /api/expenses/me`           | any authenticated | `expense:view:own`                                                 |
| `GET /api/expenses/team/:teamId` | any authenticated | `expense:view:team`                                                |
| `GET /api/expenses/all`          | any authenticated | `expense:view:all`                                                 |
| `GET /api/expenses/:id`          | any authenticated | any of `expense:view:own`, `expense:view:team`, `expense:view:all` |
| `POST /api/expenses/:id/approve` | any authenticated | `expense:approve`                                                  |
| `POST /api/expenses/:id/reject`  | any authenticated | `expense:approve`                                                  |
| `POST /api/expenses/reports/generate` | any authenticated | `expense:report:generate`                                          |
| `GET /api/categories`            | any authenticated | — (no scope required)                                              |
| `GET /api/users/me`              | any authenticated | — (no scope required)                                              |
| `GET /api/users`                 | finance_admin     | — (role guard only)                                                |
| `PATCH /api/users/:id`           | finance_admin     | — (role guard only)                                                |

### User Administration

The Users screen (finance admin only) lists everyone who has signed in and edits the
two fields this app owns: **department** and **manager**. It makes no calls to
LoginRadius.

Roles and permissions are assigned in the LoginRadius dashboard and reach the app only
as token scopes. Naming someone a manager therefore records reporting structure and
grants nothing: an employee-level user set as someone's manager still cannot list or
approve their reports' expenses, because their token lacks `expense:view:team` and
`expense:approve`. Access and org structure are deliberately kept separate.

The first finance admin needs no bootstrap code: assign a role carrying
`expense:view:all` in the LoginRadius dashboard, and that user's token scopes make them
finance on first login.

### Profile completeness and team scoping

A just-provisioned user has no department and no manager — those are set by a finance
admin afterwards. Two actions are therefore gated on the profile being complete:

| Action | Requires |
| ------ | -------- |
| `submitExpense` | a department on the submitter |
| `getTeamExpenses` | a department on the caller |
| `approveExpense` / `rejectExpense` | a department on the caller |

Finance admins are exempt from the caller-side checks: they are not scoped to a
department. Each check runs **before** the work it guards — ahead of payload
validation on submit, and ahead of the expense lookup on approve/reject — so an
ineligible caller gets the real reason instead of a receipt complaint or a hint about
whether some expense id exists.

The Submit page shows a banner and disables the button when the signed-in user has no
department, rather than letting the form be filled in and rejected.

**Team membership is `manager_id`, never department.** `listByTeam` filters on
`u.manager_id = ?` and `isTeamMember` on `WHERE user_id = ? AND manager_id = ?`, so:

- a manager sees and approves every direct report, including ones in another department
- a user in the manager's own department who does *not* report to them is excluded

Department is profile metadata; the reporting line is the authorization boundary.

### Errors reaching MCP clients

MCP tools call the REST API through token exchange, so every rule above is enforced in
one place and surfaces identically on both interfaces. `RestError` carries the API's
`code` and `details` alongside the message, and every tool funnels failures through a
single `toolErrorResponse()` helper, so an agent sees the same reason a REST caller
would:

```json
{ "error": "Your profile has no department assigned yet, so you cannot approve expenses...",
  "details": { "status": 403, "code": "FORBIDDEN" } }
```

with `isError: true` set on the result. Unrecognised failures are reported generically
so internals do not leak into the transcript.

### Sign-out

Signing out clears two separate sessions:

1. `POST /oidc/logout` clears this app's `expense_session` cookie.
2. `GET <hub>/ssologin/logout` ends the LoginRadius session itself. The hub origin is
   derived from `VITE_LR_AUTHORIZE_URL`.

Both are needed. Dropping only the local cookie leaves the IdP session intact, so the
next sign-in silently re-authenticates without a prompt and the user appears unable to
log out. The hub call is sent `no-cors` — it is cross-origin and the hub does not
allow this app's origin, so the response is opaque — and its failure never blocks the
local sign-out.

### Auth Flow

1. Client sends `Authorization: Bearer <JWT>` header
2. `authMiddleware` validates JWT via OIDC/JWKS from `LR_ISSUER` (LoginRadius)
3. Local profile resolved by `userService.resolveFromToken()` — matched on `sub`, then
   on `email` (backfilling `lr_user_id`), and **created on first sight** if neither hits.
   There is no sign-up flow; accounts live in LoginRadius. The local row holds only
   department and manager, so provisioning it grants nothing
4. Roles derived from scopes via `deriveRolesFromScopes()`
5. Scopes extracted from `scp` or `scope` claim in the token
6. `requireScopes()` / `requireAnyScope()` middlewares gate individual routes
7. `auditMiddleware` logs all mutations to the `audit_log` table

## Environment Variables

All environment access goes through the Zod-validated `config` object in
`src/config/index.ts` — that module is the only place the server reads
`process.env`, and it exits on a missing or malformed variable.

Required: `LR_ISSUER`, `LR_SERVICE_ISSUER`, `LR_CLIENT_ID`, `LR_CLIENT_SECRET`, `MCP_RESOURCE_URL`, `REST_RESOURCE_URL`, `OIDC_REDIRECT_URI`

Optional (with defaults): `PORT` (3000), `NODE_ENV` (`development`), `DATABASE_PATH` (`./data/expense.db`), `LR_TOKEN_ENDPOINT_AUTH_METHOD` (`client_secret_post`), `MCP_SERVER_NAME`, `MCP_SERVER_VERSION`, `MCP_SERVER_ACTOR_SCOPES` (all six `expense:*` scopes), `COOKIE_NAME` (`expense_session`), `CORS_ORIGIN` (`http://localhost:5173`)

Derived, never configured: the LoginRadius JWKS, authorization-code token, and
service-token endpoints — and the Management API base URL, which is the tenant
host rather than the global api.loginradius.com — are all built from `LR_ISSUER` (see
`deriveLoginRadiusEndpoints`), and the protected-resource metadata documents
are built from config in `well-known.routes.ts` and `api/index.ts`. Both REST
and MCP run on the same port; `REST_RESOURCE_URL` carries the `/api` path and
`MCP_RESOURCE_URL` carries `/mcp`, which is what separates the two audiences.

## Client → Server Communication

The React client calls the expenses server at the absolute URL in
`VITE_REST_RESOURCE_URL`; there is no Vite dev proxy, so development and
production take the same code path. The `/oidc/*` routes are derived from that
value's origin, since they are mounted at the root rather than under `/api`.

In development this is cross-origin (`:5173` → `:3000`), so the server's
`CORS_ORIGIN` must name the client origin. It defaults to `http://localhost:5173`,
so a fresh checkout works unchanged. It cannot be `*` — every client request carries
credentials and browsers reject a wildcard origin on those — and config validation
rejects `*` at startup rather than letting it fail later in the browser.

In production nginx serves the SPA and proxies `/api`, `/oidc`, `/mcp` and
`/.well-known` from a single domain, so `VITE_REST_RESOURCE_URL` is
`https://<domain>/api` and every request is same-origin. The browser never
reaches the server's container port directly — `localhost:3000` only exists
inside the compose network, where nginx forwards to it.

## Test Data (after db:seed)

Users: Carol (finance_admin), Bob (eng manager), Alice/Dave (eng employees), Eve (sales manager), Frank (sales employee). Categories: Meals ($100), Travel ($5000), Office Supplies ($500), Software ($1000), Training ($3000).

## Code Style

- TypeScript strict mode, ES2022 target, ESNext modules
- ESLint 9 flat config with Prettier integration
- Commit messages: lowercase, prefixed with phase or description (e.g., "phase-5: mcp tools")
