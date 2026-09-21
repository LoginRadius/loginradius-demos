# Setup

How to run this demo locally against your own LoginRadius tenant.

There is no sign-up flow in this app — accounts live entirely in LoginRadius, and
what a user may do is decided by the scopes in their access token. So most of the
work below happens in the LoginRadius dashboard, and only the last few steps touch
the code.

Budget about 20 minutes. Work through the parts in order: later steps reference
identifiers created in earlier ones.

**Conventions.** Everything below assumes the local ports this repo defaults to —
the server on `3000` and the web client on `5173`. The two API identifiers,
`http://localhost:3000/api` and `http://localhost:3000/mcp`, are used verbatim in
the dashboard, in `.env`, and as token audiences. They must match exactly in all
three places, including the scheme and the absence of a trailing slash.

---

## Prerequisites

- Node.js 22 or newer
- pnpm 11 (`corepack enable && corepack prepare pnpm@11.13.1 --activate`)
- A LoginRadius tenant with admin access to the dashboard

---

## Part 1 — LoginRadius dashboard

### 1.1 Create the OAuth application

**Applications → New Application.**

| Field | Value |
| ----- | ----- |
| Application name | `expense-mcp` (any name; it appears in the issuer URL) |
| Client type | **Confidential** |

Select all four of these grant types:

| Grant type in the UI | OAuth grant | Used for |
| -------------------- | ----------- | -------- |
| Sign in users via browser | `authorization_code` | the web client login |
| Refresh token renewal | `refresh_token` | keeping sessions alive |
| Machine-to-machine (M2M) authentication | `client_credentials` | the server's own service token |
| Token exchange delegation | `urn:ietf:params:oauth:grant-type:token-exchange` | MCP tools acting for a user |

Leave *Sign in on input-limited devices*, *Password grant* and *Implicit flow*
unchecked. Click **Create application**.

> The application name becomes part of the issuer URL
> (`…/service/oidc/<application-name>`), so pick something you are happy to see in
> configuration.

### 1.2 Configure the application

Open the application you just created.

**General tab**

- Copy the **Client ID** and **Client secret** — you need both in Part 2. The
  secret is shown once; regenerate it if you lose it.
- Leave **Token endpoint auth method** on `Client secret auto` unless you have a
  reason to change it. If you set it to `client_secret_basic`, you must also set
  `LR_TOKEN_ENDPOINT_AUTH_METHOD=client_secret_basic` in Part 2.
- Add `http://localhost:5173/callback` as an allowed **redirect URI**. Sign-in
  fails with a redirect-mismatch error without it.

**MCP client registration**

Enable both:

- **CIMD (Client ID Metadata Document)** — lets an MCP client identify itself by a
  hosted URL.
- **Dynamic Client Registration (DCR)** — lets MCP clients register themselves at
  runtime, which is how a client like Claude or MCP Inspector connects without you
  pre-creating credentials for it.

**Grant settings**

Confirm the four grants from step 1.1 are still selected, and enable **Enforce
PKCE**. The web client always sends a code verifier, so this costs nothing and
closes off code interception.

### 1.3 Create the two API resources

**Authorization → APIs → New API.** Create these two. The identifier is the token
audience — type it exactly.

#### `expense-api`

| Field | Value |
| ----- | ----- |
| Name | `expense-api` |
| Identifier | `http://localhost:3000/api` |

Under **Permissions**, add all six scopes:

| Scope | Description |
| ----- | ----------- |
| `expense:submit` | submit an expense |
| `expense:view:own` | view own expenses |
| `expense:view:team` | view team expenses |
| `expense:view:all` | view everyone's expenses |
| `expense:approve` | approve or reject an expense |
| `expense:report:generate` | generate expense reports |

> Copy these names character by character. `expense:report:generate` is easy to
> mistype as `expnse:…`, and a typo here is silent: the role still saves, the token
> still issues, and report generation simply returns 403 with no clue why.

Under **User access**, tick **Restrict access to roles**. This turns on RBAC, so a
user only receives these scopes if one of their roles grants them.

Under **Token settings**, tick **Allow token exchange**, and in **Trusted clients**
select the `expense-mcp` application from step 1.1. This is what permits the MCP
server to exchange a user's MCP token for a REST token that still carries their
identity.

#### `expense-mcp`

| Field | Value |
| ----- | ----- |
| Name | `expense-mcp` |
| Identifier | `http://localhost:3000/mcp` |

Under **Permissions**, add one scope:

| Scope | Description |
| ----- | ----------- |
| `mcp:tools` | access to all MCP tools |

Under **User access**, tick **Restrict access to roles**.

Token exchange is *not* needed on this resource — exchange happens from the MCP
token into the REST one, never the other way.

### 1.4 Create the three roles

**Authorization → Roles & Permissions → Add Role.** Create all three. For each,
open the **APIs** section and grant permissions per resource.

Every role gets `mcp:tools` on `http://localhost:3000/mcp` — without it that user
cannot use the MCP server at all.

| Role | `http://localhost:3000/mcp` | `http://localhost:3000/api` |
| ---- | --------------------------- | --------------------------- |
| `expense-employee` | `mcp:tools` | `expense:submit`, `expense:view:own` |
| `expense-manager` | `mcp:tools` | `expense:submit`, `expense:view:own`, `expense:view:team`, `expense:approve` |
| `expense-finance` | `mcp:tools` | all six `expense:*` scopes |

The app never reads these role names. It works out what someone may do purely from
the permissions in their token:

- holding `expense:view:all` or `expense:report:generate` ⇒ finance admin
- holding `expense:view:team` or `expense:approve` ⇒ manager
- neither ⇒ employee

So you may name the roles anything you like, as long as the permissions line up.
The names above are just what this guide refers to.

### 1.5 Grant the application access to both APIs

**Applications → `expense-mcp` → APIs tab → API access.**

Add both audiences and select **every** scope for each:

| Audience | Scopes |
| -------- | ------ |
| `http://localhost:3000/api` | all six `expense:*` |
| `http://localhost:3000/mcp` | `mcp:tools` |

This is the ceiling of what the application may ever request, not what any user
gets. RBAC narrows each user's token down from here to the scopes their roles
actually grant — so if a scope is missing from this list, no role can hand it out.

### 1.6 Add the email claim to access tokens

**Applications → `expense-mcp` → Tokens tab → Access Token Mapping Template.**

In the JSON editor, enter:

```json
{ "email": "{{Email.0.Value}}" }
```

The server creates a local profile the first time someone signs in, and it needs
the email claim to do that. Without this mapping, tokens carry no email, the
profile cannot be created, and sign-in fails with *"Token carries no email claim"*.

### 1.7 Create the first finance user

Somebody has to be able to assign departments and managers before anyone else can
do anything, and that is itself a finance-admin action. So the first one is created
by hand.

1. **Users → Manage Users → New User.** Create an account with an email you can
   receive at, and set a password.
2. Open that user, go to the **Roles** section, and under **Assigned Roles** add
   `expense-finance`. **Save.**
3. Copy the user's **email** and **UID** — both go into the seed script in Part 3.

### 1.8 Collect your configuration values

**Applications → `expense-mcp` → Endpoints tab → OIDC endpoint URLs.**

| Dashboard field | Goes into |
| --------------- | --------- |
| Issuer URL | `LR_ISSUER` |
| Authorization URL | `VITE_LR_AUTHORIZE_URL` |

Both look like
`https://<tenant>.hub.loginradius.com/service/oidc/<application-name>`.

You also need, from the **General** tab: **Client ID** and **Client secret**.

Everything else the server needs is derived from `LR_ISSUER` at startup — the JWKS,
the token endpoints and the protected-resource metadata are all built from it, so
there is nothing else to copy.

---

## Part 2 — Configure the project

```bash
git clone <this-repo>
cd expense-mcp
pnpm install
```

Copy both example files:

```bash
cp apps/expenses-server/.env.example apps/expenses-server/.env
cp apps/expense-client/.env.local.example apps/expense-client/.env.local
```

### Server — `apps/expenses-server/.env`

Set these six. Everything else in the file is already correct for local use.

| Variable | Where it comes from |
| -------- | ------------------- |
| `LR_ISSUER` | Endpoints tab → Issuer URL |
| `LR_SERVICE_ISSUER` | your tenant host + `/service/oauth/` — e.g. `https://<tenant>.hub.loginradius.com/service/oauth/` (**keep the trailing slash**) |
| `LR_CLIENT_ID` | General tab → Client ID |
| `LR_CLIENT_SECRET` | General tab → Client secret |
| `MCP_RESOURCE_URL` | `http://localhost:3000/mcp` — must equal the `expense-mcp` API identifier |
| `REST_RESOURCE_URL` | `http://localhost:3000/api` — must equal the `expense-api` API identifier |

`LR_SERVICE_ISSUER` is the issuer of the service tokens minted for token exchange.
It is compared against the token's `iss` claim byte for byte, trailing slash
included, and it is accepted only by the REST API — the MCP endpoint rejects it.

These have working defaults and only need changing if you move off the standard
ports:

| Variable | Default |
| -------- | ------- |
| `PORT` | `3000` |
| `NODE_ENV` | `development` |
| `DATABASE_PATH` | `./data/expense.db` |
| `CORS_ORIGIN` | `http://localhost:5173` |
| `LR_TOKEN_ENDPOINT_AUTH_METHOD` | `client_secret_post` |
| `OIDC_REDIRECT_URI` | `http://localhost:5173/callback` |
| `MCP_SERVER_NAME` / `MCP_SERVER_VERSION` / `MCP_SERVER_ACTOR_SCOPES` | sensible values |
| `COOKIE_NAME` | `expense_session` |

`CORS_ORIGIN` cannot be `*`. The client sends credentialed requests and browsers
refuse a wildcard origin on those, so the server rejects `*` at startup rather than
letting it fail later in the browser.

### Web client — `apps/expense-client/.env.local`

| Variable | Value |
| -------- | ----- |
| `VITE_LR_AUTHORIZE_URL` | Endpoints tab → Authorization URL |
| `VITE_LR_CLIENT_ID` | General tab → Client ID (same as the server's) |
| `VITE_LR_REDIRECT_URI` | `http://localhost:5173/callback` |
| `VITE_REST_RESOURCE_URL` | `http://localhost:3000/api` |

`VITE_REST_RESOURCE_URL` does double duty: it is the URL the browser calls, and it
is sent as the OAuth `resource` parameter, which becomes the token's audience. It
must match the server's `REST_RESOURCE_URL` exactly or every request 401s.

Sign-out also derives the LoginRadius hub origin from `VITE_LR_AUTHORIZE_URL`, so
that the identity-provider session ends too, not just the local cookie.

---

## Part 3 — Seed the database

Open `apps/expenses-server/src/db/seed.ts` and replace the placeholder entry in
`SEED_USERS` with the account from step 1.7:

```ts
const SEED_USERS: SeedUser[] = [
  {
    email: "you@example.com",                     // the email you created
    lrUserId: "0f0522a5ebfa46f7b25996170a5fbd8e", // that user's LoginRadius UID
    fullName: "Finance Admin",
    department: "Finance",
  },
]
```

Add more entries if you created more accounts — `managerEmail` links one to
another. Anyone you leave out can still sign in; they simply arrive with no
department until the finance admin assigns one.

Then, from the repo root:

```bash
pnpm --filter expenses-server run db:seed
```

This creates the SQLite database at `apps/expenses-server/data/expense.db`,
creating the `data/` directory if it is missing, applies the schema, inserts the
expense categories and adds the user(s) above. The database is not in version
control — it is built here, on your machine, and holds accounts that only your
tenant knows about.

The script refuses to run while the placeholder UID is still there, and is safe to
re-run: existing users are left untouched. To start over, delete
`apps/expenses-server/data/expense.db` and run it again.

---

## Part 4 — Run it

From the repo root:

```bash
pnpm run dev
```

Turborepo starts both in one terminal — the server on
<http://localhost:3000> and the web client on <http://localhost:5173>.

Open <http://localhost:5173> and sign in as the seeded finance account.

To run just one of them:

```bash
pnpm --filter expenses-server run dev
pnpm --filter expense-client run dev
```

### Onboarding everyone else

Any account in your tenant can sign in — the server creates a local profile on
first sight. But a new profile has **no department**, and until a finance admin
sets one that user cannot submit expenses, list team expenses, or approve
anything. They will see a banner telling them so.

As the finance admin, go to **Users**, click **Edit** on a user, and set their
department and manager. Note that naming someone a manager records the reporting
line only — it grants nothing. Whether they can actually view or approve their
reports' expenses depends on their LoginRadius role, which you assign in the
dashboard.

---

## Part 5 — Connect an MCP client

The MCP endpoint is `http://localhost:3000/mcp`. Because DCR is enabled, a client
such as MCP Inspector or Claude can register itself and walk the OAuth flow without
any pre-shared credentials.

> **A user must already hold a role before they can use the MCP server.** The MCP
> endpoint requires the `mcp:tools` scope for the `http://localhost:3000/mcp`
> audience, and RBAC only issues that scope if one of the user's roles grants it. A
> brand-new account with no role assigned will fail MCP authentication outright —
> the server rejects the token with *"Token missing required scope: mcp:tools"*.
>
> This is different from the web app, where a new user can sign in and simply sees
> a restricted UI. For MCP there is no partial state: no role means no access. Give
> every account one of the three roles from step 1.4 in the dashboard before
> pointing an MCP client at it.

---

## Troubleshooting

| Symptom | Cause |
| ------- | ----- |
| `Invalid environment variables` at startup | a required variable is missing, or `CORS_ORIGIN` is `*`. The message names the variable. |
| `LR_ISSUER must look like …/service/oidc/<app-name>` | `LR_ISSUER` is not the Issuer URL from the Endpoints tab. |
| Sign-in redirects back to the login page | `http://localhost:5173/callback` is not registered as a redirect URI on the application (step 1.2). |
| `Token carries no email claim` | the Access Token Mapping Template from step 1.6 is missing. |
| Every API call returns 401 | `VITE_REST_RESOURCE_URL` and `REST_RESOURCE_URL` disagree, so the token audience does not match. |
| Requests blocked by CORS in the browser | `CORS_ORIGIN` does not list `http://localhost:5173`. |
| `Token missing required scope: mcp:tools` | the user has no role, or their role lacks `mcp:tools` on the MCP audience (step 1.4). |
| Report generation returns 403 for a finance user | `expense:report:generate` is misspelled in the API permissions or in the role. |
| `Your profile has no department assigned yet` | expected for a new user — a finance admin assigns one from the Users screen. |

---

## Reference

- [LoginRadius documentation](https://www.loginradius.com/docs/overview/)
- [Roles and permissions](https://www.loginradius.com/docs/user-management/roles-and-permissions/)
- [Machine-to-machine (M2M) OAuth](https://www.loginradius.com/docs/authentication/machine-to-machine/)
- [OAuth 2.0 overview](https://www.loginradius.com/docs/single-sign-on/federated-sso/oauth-2.0/overview/)

`CLAUDE.md` in the repo root describes the architecture, the permission model and
how the pieces fit together.
