# Expense MCP Demo

An expense-management app that exposes the same business logic through two
interfaces — a REST API for its web client, and an [MCP](https://modelcontextprotocol.io)
server for AI agents — with **[LoginRadius](https://www.loginradius.com)** as the
authorization server for both.

The point of the demo is the auth, not the expenses. It is a worked example of how
an MCP server behaves as a proper OAuth 2.1 protected resource: discovery, dynamic
client registration, audience-bound tokens, scope-based authorization, and token
exchange that keeps the acting user's identity intact when an agent calls an API on
their behalf.

> **Setting it up:** [SETUP.md](./SETUP.md) walks through the LoginRadius dashboard
> configuration and local install, end to end.

---

## What it demonstrates

**An MCP server as an OAuth resource server.** An unauthenticated call to `/mcp`
returns `401` with a `WWW-Authenticate` header pointing at
`/.well-known/oauth-protected-resource`. That document names the LoginRadius issuer
and the scopes on offer, which is enough for a client to discover the authorization
server, register itself, and complete the flow — no credentials shared out of band.

**Dynamic client registration.** DCR and CIMD are enabled on the LoginRadius
application, so a client such as MCP Inspector or Claude registers itself at
runtime.

**Two resources, two audiences, one tenant.** The REST API and the MCP server are
registered as separate API resources — `http://localhost:3000/api` and
`http://localhost:3000/mcp` — even though they run in the same process on the same
port. A token minted for one is rejected by the other, because each verifies the
`aud` claim against its own identifier.

**Token exchange that preserves identity.** MCP tools do not reach into the
database. A tool takes the user's MCP token, exchanges it
([RFC 8693](https://datatracker.ietf.org/doc/html/rfc8693)) for a token scoped to
the REST resource, and calls the REST API like any other client. The exchanged
token keeps the user as `sub` and records the service as `act`, so every rule is
enforced once, in one place, no matter which interface the request came through.

**An audit trail that can tell a human from an agent.** Because the `act` claim
survives the exchange, the Activity page shows, per action, whether a person did it
in the web app or an agent did it on their behalf.

**Authorization that lives in the identity provider.** The app holds no permission
table. What a user may do is decided entirely by the scopes in their access token,
which LoginRadius issues based on the roles assigned to them.

---

## How it works

```
                  ┌──────────────────────────────────────────┐
                  │            LoginRadius                   │
                  │  OIDC · RBAC · DCR/CIMD · token exchange  │
                  └────────┬────────────────────┬────────────┘
      authorization_code   │                    │  token exchange (RFC 8693)
                           │                    │
              ┌────────────▼─────────┐   ┌──────▼──────────────────┐
              │   React web client   │   │   MCP client (agent)    │
              └────────────┬─────────┘   └──────┬──────────────────┘
                 Bearer    │                    │  Bearer
                 aud=/api  │                    │  aud=/mcp
              ┌────────────▼────────────────────▼──────────────────┐
              │                 expenses-server                    │
              │   REST /api  ◄──── exchanged token ────  MCP /mcp  │
              │        └──────── services ─────────┘               │
              │                    SQLite                          │
              └───────────────────────────────────────────────────┘
```

A request arriving on either interface is verified against the LoginRadius JWKS,
checked for the right audience, and turned into a set of scopes. Roles are derived
from those scopes, and the service layer uses them to decide whose expenses the
caller may see and act on.

### The MCP tools

| Tool | Scope required |
| ---- | -------------- |
| `who_am_i` | — |
| `submit_expense` | `expense:submit` |
| `list_my_expenses` | `expense:view:own` |
| `list_team_expenses` | `expense:view:team` |
| `approve_expense` / `reject_expense` | `expense:approve` |
| `generate_report` | `expense:report:generate` |

Every tool additionally requires `mcp:tools` on the MCP audience — without it, the
MCP endpoint rejects the token before any tool runs.

---

## Authorization model

Three roles, none of which the code knows by name. A user's effective role is
derived from the permissions their token carries:

| Effective role | Derived from |
| -------------- | ------------ |
| `finance_admin` | `expense:view:all` or `expense:report:generate` |
| `manager` | `expense:view:team` or `expense:approve` |
| `employee` | neither |

Two things the app owns rather than the identity provider: a user's **department**
and who they **report to**. Those are org structure, not permissions — naming
someone a manager records a reporting line and grants nothing. Whether they can
actually approve anything still depends on the scopes LoginRadius puts in their
token.

There is no sign-up flow. Accounts live in LoginRadius, and the server creates a
local profile the first time one signs in.

---

## Tech stack

| | |
| --- | --- |
| **Identity** | LoginRadius — OIDC, RBAC, DCR/CIMD, RFC 8693 token exchange |
| **Server** | TypeScript, Express 5, `@modelcontextprotocol/sdk`, Zod, `ts-jose` |
| **Database** | SQLite via better-sqlite3 — direct SQL, repository pattern, no ORM |
| **Web client** | React 19, Vite, React Router |
| **Monorepo** | Turborepo, pnpm |
| **Deployment** | Docker Compose behind nginx on a single domain |

```
apps/expenses-server/   REST API + MCP server (one process)
apps/expense-client/    React SPA
packages/               shared ESLint and TypeScript configs
```

---

## Getting started

See **[SETUP.md](./SETUP.md)**. In short: create a LoginRadius application and two
API resources, define the roles, fill in two `.env` files, seed one administrator,
then:

```bash
pnpm install
pnpm run dev
```

---

## Further reading

- [LoginRadius MCP Auth guide](https://www.loginradius.com/docs/guides/single-sign-on/federated-sso/mcp-auth/overview/)
  — the specification this server implements: OAuth 2.1, PKCE, protected resource
  metadata, DCR and CIMD
- [LoginRadius documentation](https://www.loginradius.com/docs/overview/)
- [Roles and permissions](https://www.loginradius.com/docs/user-management/roles-and-permissions/)
- [Machine-to-machine (M2M) OAuth](https://www.loginradius.com/docs/authentication/machine-to-machine/)
- [Model Context Protocol](https://modelcontextprotocol.io)
- [RFC 8693 — OAuth 2.0 Token Exchange](https://datatracker.ietf.org/doc/html/rfc8693)

`CLAUDE.md` documents the architecture, permission model and conventions in more
depth.
