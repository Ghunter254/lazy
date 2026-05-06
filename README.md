# Lazy — Your Personal BaaS

[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-blue?logo=docker)](https://docs.docker.com/compose/)
[![Status](https://img.shields.io/badge/status-production--ready-green)](#)

A lightweight, self-hosted Backend-as-a-Service you own completely. Built with **Express**, **Better Auth**, **Drizzle ORM**, **PostgreSQL**, and **Socket.io** — all wired together with Docker so any project can spin it up in minutes.

> Think Appwrite or Supabase, but yours. No monthly bills, no vendor lock-in, no surprises.

---

## Table of Contents

- [What's Inside](#whats-inside)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Core Systems](#core-systems)
  - [Authentication](#authentication)
  - [Database & Repositories](#database--repositories)
  - [Realtime](#realtime)
- [Adding a New Module (Feature Guide)](#adding-a-new-module-feature-guide)
- [API Reference](#api-reference)
- [Production Deployment](#production-deployment)
- [Contributing](#contributing)
- [Roadmap](#roadmap)

---

## What's Inside

| Layer | Technology | Purpose |
|---|---|---|
| Server | Express 5 | HTTP routing & middleware |
| Auth | Better Auth | Email/password sessions, cookie-based |
| Database | PostgreSQL 16 + Drizzle ORM | Type-safe queries, schema-as-code |
| Realtime | Socket.io | WebSocket broadcasts on data changes |
| Dev Tooling | tsx + TypeScript | Hot-reload during development |
| Infrastructure | Docker Compose | One-command setup for every service |
| DB GUI | Drizzle Studio | Visual database explorer at port 4983 |

---

## Project Structure

```
lazy/
├── src/
│   ├── index.ts                  # App entry point — wires everything together
│   │
│   ├── core/                     # Shared engine internals (don't touch unless extending core)
│   │   ├── auth/
│   │   │   └── auth.ts           # Better Auth configuration
│   │   ├── middleware/           # Express middleware (auth guards, etc.)
│   │   ├── realtime/
│   │   │   └── withRealtime.ts   # HOF that wraps any repo with Socket.io broadcasts
│   │   ├── socket/
│   │   │   └── socket.ts         # Socket.io server init + broadcast helper
│   │   └── utils/                # Shared utility functions
│   │
│   ├── infra/                    # Infrastructure layer
│   │   ├── db/
│   │   │   ├── index.ts          # Drizzle client instance (postgres connection)
│   │   │   ├── schema.ts         # All table definitions live here
│   │   │   └── repo.ts           # Base repository factory + all repos exported here
│   │   └── logger/               # Logging setup
│   │
│   ├── modules/                  # Feature modules — one folder per resource
│   │   └── student/              # Example module
│   │       ├── student.routes.ts     # Express router — defines endpoints
│   │       ├── student.controller.ts # Handles req/res, calls service
│   │       ├── student.service.ts    # Business logic
│   │       └── student.repo.ts       # Module-specific repo (optional overrides)
│   │
│   ├── types/                    # Global TypeScript type augmentations
│   └── utils/                    # App-level utilities
│
├── tests/                        # Test files
├── .env                          # Local environment (git-ignored)
├── .env.example                  # Env template — copy this to .env
├── .gitignore
├── docker-compose.yml
├── Dockerfile
├── drizzle.config.ts             # Drizzle ORM configuration
├── tsconfig.json
└── package.json
```

---

## Prerequisites

Make sure you have these installed on your machine:

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (includes Docker Compose)
- [Node.js 20+](https://nodejs.org/) — only needed for running scripts outside Docker
- [Git](https://git-scm.com/)

That's it. You don't need to install Postgres, or any Node packages locally — Docker handles everything.

---

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/Ghunter254/lazy.git lazy
cd lazy
```

### 2. Set up your environment

```bash
cp .env.example .env
```

Open `.env` and update the values if needed (the defaults work out of the box for local dev).

> 🔐 **Security Note**: Before deploying to production, generate a new `BETTER_AUTH_SECRET`:
> ```bash
> openssl rand -base64 32
> ```

### 3. Start everything

```bash
npm run dev
```

This builds the Docker image, starts Postgres, runs migrations, and boots the app with hot-reload. First run takes ~30 seconds while Docker pulls images.

### 4. Verify it's running

```
GET http://localhost:3000/
→ "Health check..."
```

### 5. Open Drizzle Studio (optional DB GUI)

```
http://localhost:4983
```

---

## Environment Variables

Copy `.env.example` to `.env`. The table below explains each variable.

```dotenv
DATABASE_URL=postgresql://admin:password123@db:5432/engine_db
BETTER_AUTH_SECRET=your-secret-here-generate-with-openssl
BETTER_AUTH_URL=http://localhost:3000
NODE_ENV=development
```

| Variable | Description | Example |
|---|---|---|
| `DATABASE_URL` | Full Postgres connection string. Uses the `db` Docker service hostname. | `postgresql://admin:password123@db:5432/engine_db` |
| `BETTER_AUTH_SECRET` | Random secret for signing auth tokens. **Generate a new one for production** using `openssl rand -base64 32`. | Any long random string |
| `BETTER_AUTH_URL` | The public URL of the API. Better Auth uses this for redirects. | `http://localhost:3000` |
| `NODE_ENV` | Environment flag. Affects logging and certain behaviours. | `development` or `production` |

> ⚠️ **Production note**: Never commit your real `.env` file. Add it to `.gitignore` if not already present.

---

## Available Scripts

All scripts are run from the project root via `npm run <script>`.

| Script | What it does |
|---|---|
| `dev` | Starts all Docker services with hot-reload (`--build` to rebuild on change) |
| `dev:down` | Stops and removes all containers |
| `db:up` | Starts only the Postgres container |
| `db:down` | Stops only the Postgres container |
| `db:push` | Pushes schema changes directly to the DB (no migration files) — **dev only** |
| `db:generate` | Generates SQL migration files from schema changes |
| `db:migrate` | Runs pending migrations — **use in production** |
| `db:studio` | Opens Drizzle Studio in the browser |
| `build` | Rebuilds the app Docker image |
| `start` | Starts the app container without rebuilding |

---

## Core Systems

### Authentication

Handled entirely by [Better Auth](https://better-auth.com) mounted at `/api/auth/*`.

**Register a user:**
```http
POST /api/auth/sign-up/email
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "John Doe"
}
```

**Sign in:**
```http
POST /api/auth/sign-in/email
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}
```

Auth sets an HTTP-only cookie (`lazy.*`). All protected routes use the `requireAuth` middleware from `src/core/middleware/`.

**Protecting a route** — add the middleware to any router:
```typescript
import { requireAuth } from "../../core/middleware/auth.middleware.js";

router.get("/me", requireAuth, controller.me);
```

After `requireAuth`, `req.user` is populated with the authenticated user object.

---

### Database & Repositories

The database layer has two parts: the **schema** and the **repository factory**.

**Schema** lives in `src/infra/db/schema.ts`. Every table is defined here using Drizzle's schema builder. Better Auth's tables (`user`, `session`, `account`, `verification`) are auto-generated on `db:push`.

**The base repository** (`createBaseRepo`) gives every table these methods for free:

```typescript
repo.myResource.list()              // SELECT * FROM table
repo.myResource.getById(id)         // SELECT ... WHERE id = ?
repo.myResource.create(data)        // INSERT INTO ... RETURNING *
repo.myResource.update(id, data)    // UPDATE ... WHERE id = ? RETURNING *
repo.myResource.delete(id)          // DELETE ... WHERE id = ? RETURNING *
```

Custom queries are added directly on the repo object (see `getByUserId` on the students repo as an example).

---

### Realtime

The `withRealtime` wrapper decorates any repo so that `create`, `update`, and `delete` automatically broadcast Socket.io events to all connected clients.

**Event naming convention:** `resource:action`

```
students:created   → { ...studentObject }
students:updated   → { ...studentObject }
students:deleted   → { id: "..." }
```

**Frontend example (any JS client):**
```javascript
import { io } from "socket.io-client";

const socket = io("http://localhost:3000");

socket.on("students:created", (student) => {
  console.log("New student:", student);
});
```

To add realtime to a module, wrap its repo with `withRealtime` in the service layer:
```typescript
import { withRealtime } from "../../core/realtime/withRealtime.js";
import { repo } from "../../infra/db/repo.js";

const studentsRepo = withRealtime(repo.students, "students");
```

---

## Adding a New Module (Feature Guide)

This is the pattern for every new feature. Follow these steps exactly and you won't break anything.

Let's say you're adding a **`posts`** module.

---

### Step 1 — Add the table to the schema

Open `src/infra/db/schema.ts` and add your new table. Follow the same conventions as existing tables.

```typescript
export const posts = pgTable("posts", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  title: text("title").notNull(),
  body: text("body").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
```

Then push the schema to the database:

```bash
npm run db:push
```

---

### Step 2 — Register the repo

Open `src/infra/db/repo.ts` and add your new resource to the exported `repo` object:

```typescript
export const repo = {
  students: { ... },   // existing
  users: { ... },      // existing

  // Add this:
  posts: {
    ...createBaseRepo(schema.posts as any),

    // Add any custom queries your module needs:
    async getByUserId(userId: string) {
      return await db
        .select()
        .from(schema.posts)
        .where(eq(schema.posts.userId, userId));
    },
  },
};
```

---

### Step 3 — Create the module folder

Create the folder `src/modules/posts/` and add four files:

**`posts.service.ts`** — business logic only, no req/res here:
```typescript
import { withRealtime } from "../../core/realtime/withRealtime.js";
import { repo } from "../../infra/db/repo.js";

const postsRepo = withRealtime(repo.posts, "posts");

export const postsService = {
  async createPost(userId: string, data: { title: string; body: string }) {
    return postsRepo.create({ ...data, userId });
  },

  async getAllPosts() {
    return postsRepo.list();
  },

  async getPost(id: string) {
    return postsRepo.getById(id);
  },

  async updatePost(id: string, data: Partial<{ title: string; body: string }>) {
    return postsRepo.update(id, data);
  },

  async deletePost(id: string) {
    return postsRepo.delete(id);
  },
};
```

**`posts.controller.ts`** — handles req/res, calls service:
```typescript
import type { Request, Response } from "express";
import { postsService } from "./posts.service.js";

export const postsController = {
  async create(req: Request, res: Response) {
    try {
      const post = await postsService.createPost(req.user!.id, req.body);
      return res.status(201).json(post);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  },

  async list(req: Request, res: Response) {
    const posts = await postsService.getAllPosts();
    return res.json(posts);
  },

  async getOne(req: Request, res: Response) {
    const post = await postsService.getPost(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });
    return res.json(post);
  },

  async update(req: Request, res: Response) {
    try {
      const post = await postsService.updatePost(req.params.id, req.body);
      return res.json(post);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  },

  async remove(req: Request, res: Response) {
    await postsService.deletePost(req.params.id);
    return res.status(204).send();
  },
};
```

**`posts.routes.ts`** — route definitions:
```typescript
import { Router } from "express";
import { postsController } from "./posts.controller.js";
import { requireAuth } from "../../core/middleware/auth.middleware.js";

const router = Router();

router.use(requireAuth); // protect all routes in this module

router.get("/", postsController.list);
router.post("/", postsController.create);
router.get("/:id", postsController.getOne);
router.patch("/:id", postsController.update);
router.delete("/:id", postsController.remove);

export default router;
```

---

### Step 4 — Register the routes in `index.ts`

Open `src/index.ts` and add two lines:

```typescript
// 1. Import at the top
import postRoutes from "./modules/posts/posts.routes.js";

// 2. Mount the router
app.use("/api/posts", postRoutes);
```

---

### Step 5 — Verify

```bash
# The app hot-reloads automatically, but if not:
npm run dev

# Test the endpoint
curl -X POST http://localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -d '{"title": "Hello", "body": "World"}'
```

Your frontend will also automatically receive `posts:created`, `posts:updated`, and `posts:deleted` events via Socket.io with no extra work.

---

## API Reference

### Health

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | No | Health check — returns `{"status":"ok","timestamp":"..."}` |

### Auth (handled by Better Auth)

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/sign-up/email` | No | Register with email + password |
| POST | `/api/auth/sign-in/email` | No | Sign in, sets session cookie |
| POST | `/api/auth/sign-out` | Yes | Clear session cookie |
| GET | `/api/auth/get-session` | No | Returns current session if active |

### Students (example module)

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/students` | Yes | Create student profile |
| GET | `/api/students/me` | Yes | Get own student profile |

---

## Production Deployment

> ⚠️ **Do not use `db:push` in production** — it can cause data loss. Use migrations instead.

### Production Checklist

Before deploying Lazy to production, complete these steps:

- [ ] **Generate secure secrets**
  ```bash
  # Better Auth secret
  openssl rand -base64 32
  ```
- [ ] **Set environment variables**
  ```dotenv
  NODE_ENV=production
  BETTER_AUTH_SECRET=your-new-secret-here
  BETTER_AUTH_URL=https://your-domain.com
  DATABASE_URL=postgresql://user:pass@your-db-host:5432/prod_db
  ```
- [ ] **Use migrations, not push**
  ```bash
  npm run db:generate   # Create migration files
  npm run db:migrate    # Apply to production DB
  ```
- [ ] **Configure reverse proxy** (nginx/Caddy) for:
  - SSL/TLS termination
  - WebSocket upgrades (`/socket.io`)
  - Rate limiting at the edge
- [ ] **Enable Docker volume persistence** for PostgreSQL data
- [ ] **Set up log aggregation** (e.g., Loki, Papertrail, or simple file rotation)
- [ ] **Add health check monitoring** at `/` endpoint
- [ ] **Restrict database access** to app container only (no public port exposure)

### Production Docker Tips

Consider using a multi-stage build for smaller images:

```dockerfile
# Dockerfile.prod (example)
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package.json ./
EXPOSE 3000
CMD ["node", "dist/index.js"]
```

Update `docker-compose.yml` to reference `Dockerfile.prod` in production environments.

---

## Contributing

There are two kinds of contributions: **module features** (adding a new resource like `posts` or `comments`) and **core features** (extending the shared engine — things like Socket.io rooms, file storage, a logger, rate limiting). Both are welcome. The rules are different for each.

The universal principle: **one concept per PR, always**. A PR that adds Socket.io rooms should not also add a new module. A PR that adds file storage should not also refactor the repo factory. Small and focused keeps this codebase mergeable.

---

### Type 1 — Module Contributions

Adding a brand new resource (a table, a set of CRUD endpoints, business logic). This is the most common contribution and the lowest risk — your code lives entirely in its own folder.

**Rules:**

1. **One module per PR.** Don't combine `posts` and `comments` into one PR even if they're related.
2. **Your module folder is your sandbox.** All your code goes in `src/modules/<your-module>/`. The only files outside your folder you should touch are `schema.ts` (add your table), `repo.ts` (register your repo), and `index.ts` (mount your router).
3. **Schema additions only — never modify existing columns.** You can add new tables. Do not rename, remove, or alter type of any existing column — it will break other modules.
4. **Use `createBaseRepo`.** Don't write raw Drizzle queries in your service or controller. All DB access goes through the repo layer.
5. **Wrap with `withRealtime`.** Any repo used for mutations must be wrapped so clients get live events for free.
6. **All routes require auth by default.** Apply `requireAuth` to your router. If you need a public endpoint, document why in the PR description.
7. **No new dependencies without a note.** If your module needs a new package, mention it in the PR and explain why the existing stack can't cover it.

**Branch naming:** `feature/<module-name>` — e.g. `feature/posts`

---

### Type 2 — Core Contributions

Extending or improving something inside `src/core/` or `src/infra/` — things that every module depends on. Examples: Socket.io rooms, a storage abstraction, a global logger, rate limiting middleware, auth plugins.

These PRs carry more risk because a bug here affects everything. The rules are stricter.

**Rules:**

1. **One capability per PR, strictly.** Adding Socket.io rooms is one PR. Adding a storage helper is a separate PR. Never combine two core changes.
2. **Additive only — don't rewrite what exists.** Add new exports, new files, new helpers. Do not change the signature of anything that modules already import (e.g. don't rename `broadcast`, don't change `withRealtime`'s interface, don't alter `createBaseRepo`). Existing code must keep working without any changes.
3. **New files over editing existing ones.** If you're adding rooms to Socket.io, add a `rooms.ts` file alongside `socket.ts` rather than rewriting `socket.ts`. Keep the diff as small as possible.
4. **Keep `infra/db/index.ts` read-only.** The database connection is shared infrastructure. Do not modify it.
5. **Open an issue or message the group chat first.** Before writing any code for a core change, describe what you want to add and why. Get a thumbs up before opening a PR. This avoids two people building the same thing in parallel.
6. **Document what you add.** Any new export in `core/` or `infra/` must have a comment explaining what it does and how to use it. Update this README if you're adding something other modules will consume.
7. **No new dependencies without strong justification.** Core dependencies affect the entire project. Be prepared to explain why there's no lighter alternative.

**Branch naming:** `core/<capability-name>` — e.g. `core/socket-rooms`, `core/storage`, `core/rate-limit`

**Examples of good core PRs:**
- Add `joinRoom(socketId, room)` and `broadcastToRoom(room, event, data)` helpers in a new `src/core/socket/rooms.ts` — exports two functions, touches nothing existing
- Add a `src/core/storage/storage.ts` abstraction with `save(file)` and `getUrl(key)` — new file only
- Add a `src/core/middleware/rateLimiter.ts` middleware — new file, modules opt in by importing it

**Examples of PRs that will be rejected:**
- Rewrites `socket.ts` to add rooms (modifies existing file unnecessarily)
- Adds rooms + storage in one PR (two concepts)
- Renames `broadcast` to `emit` across the codebase (breaks all existing callers)
- Adds a core feature bundled with a new module

---

### Workflow

```bash
# 1. Branch off main — use the right prefix
git checkout -b feature/posts       # for a module
git checkout -b core/socket-rooms   # for a core addition

# 2. Make your changes

# 3. Do a clean start to make sure nothing is broken
npm run dev:down
npm run dev

# 4. Test your endpoints or new exports

# 5. Commit with a clear message using conventional commits
git commit -m "feat: add posts module with CRUD and realtime"
git commit -m "feat(core): add socket room helpers"

# 6. Push and open a PR — fill in the PR description template
git push origin feature/posts
```

---

### PR Checklist — Module

- [ ] New table in `schema.ts` follows naming conventions (`id`, `userId`, `createdAt`, `updatedAt`)
- [ ] Repo registered in `repo.ts` using `createBaseRepo`
- [ ] Module folder has `routes.ts`, `controller.ts`, `service.ts`
- [ ] Service uses a `withRealtime`-wrapped repo for mutations
- [ ] Router mounted in `index.ts`
- [ ] `requireAuth` applied to the router
- [ ] `npm run dev` starts without errors after a clean `dev:down`
- [ ] Only changed files: your module folder + `schema.ts`, `repo.ts`, `index.ts`

### PR Checklist — Core

- [ ] Opened an issue or got a green light in the group chat before writing code
- [ ] Change is additive — no existing exports were renamed or removed
- [ ] Existing modules still work without any changes to their code
- [ ] New capability is in its own file where possible
- [ ] New exports have comments explaining usage
- [ ] README updated if the addition is something other modules should use
- [ ] `npm run dev` starts without errors after a clean `dev:down`
- [ ] PR touches only the single capability described — nothing else

---

### What to Build

Pick one and claim it in the group chat so nobody doubles up.

**Module features:**
- **`posts`** — Generic content/blog post module
- **`comments`** — Threaded comments linked to any resource
- **`tags`** — Tagging system usable across modules
- **`audit-log`** — Track all mutations with who did what and when

**Core features:**
- **Socket.io rooms** — `joinRoom`, `leaveRoom`, `broadcastToRoom` helpers in `core/socket/rooms.ts`
- **File storage** — Local disk (or S3-compatible) abstraction in `core/storage/`
- **In-app notifications** — Notification queue + Socket.io delivery in `core/notifications/`
- **Rate limiting** — Per-IP or per-user middleware in `core/middleware/rateLimiter.ts`
- **Role-based access** — Role guard middleware in `core/middleware/roles.ts`
- **Email sending** — Thin email helper in `core/mailer/` (SMTP or Resend)

---

## Roadmap

- [x] Express server
- [x] Better Auth (email + password)
- [x] Drizzle ORM + PostgreSQL
- [x] Base repository factory
- [x] Socket.io realtime broadcasts
- [x] `withRealtime` wrapper
- [x] Student module (example)
- [ ] File uploads
- [ ] Role-based access control
- [ ] Email notifications
- [ ] Rate limiting
- [ ] Audit logging
- [ ] Production Docker config (multi-stage build, no tsx)
- [ ] OpenAPI/Swagger documentation
- [ ] Automated test suite + CI pipeline

---

## License

ISC — use it, fork it, ship it. See [LICENSE](LICENSE) for details.
```
