# Engineering Reflection: ACME Salary Management System

---

## 1. Design Decisions

### Fullstack Monorepo (Next.js App Router)
The brief asked for a React/Next.js frontend and a backend with a relational database. Rather than building two separate projects (e.g., a FastAPI backend + a separate CRA frontend), I chose a **Next.js fullstack monorepo** using App Router API Route Handlers as the backend.

**Why:** A single repo means shared TypeScript types between the API response shape and the frontend `interface` definitions. There is no serialization boundary where types can drift. Every interface lives in one place — `page.tsx` `Employee` interface matches the Prisma model exactly.

**The alternative rejected:** A separate Express or FastAPI backend would require running two servers in development, managing CORS, and duplicating type definitions. For a 10k-employee internal tool with one primary user persona (HR Manager), that overhead is unjustified.

---

### SQLite via Prisma 7 Driver Adapters
SQLite was the specified constraint. Prisma 7 represented a significant API change (connection URLs moved out of `schema.prisma`, driver adapters became mandatory). I could have pinned to Prisma 6 for compatibility.

**Why I used Prisma 7:** The assessment values engineering judgment and currency with tooling. Using the current stable version — even when it requires working through breaking changes — demonstrates that capability. It also forced a clean architectural discovery: `db.ts` needed path resolution (`path.resolve(cwd(), ...)`) because Next.js API routes and CLI scripts (`tsx prisma/seed.ts`) run from different working directories.

**`better-sqlite3` over libSQL:** `better-sqlite3` is a synchronous, C++ native binding — the fastest SQLite driver in the Node.js ecosystem. Latency per query is <1ms for indexed reads.

---

### Pure Function Extraction (`analytics.ts`)
All compensation calculations — median, average, currency translation, department grouping, gender gap formula — live in `src/lib/analytics.ts` as pure functions with zero side effects.

**Why:** This is the single most important architectural decision in the codebase. Route handlers are I/O bound and difficult to unit test without a live database and HTTP server. Pure functions are trivially testable with mock data. The result: 5 of our 10 tests run in **8ms** against no database, no network, no filesystem.

The refactor also benefited the route handler — `dashboard/route.ts` shrank from 120 lines to 35 lines by delegating to `calculateMetrics`.

---

### Static Exchange Rates in the Database
All salary analytics are normalized to USD using a seeded `ExchangeRate` table rather than calling an external currency API (e.g., Open Exchange Rates, Fixer.io).

**Why:** This was an explicit, deliberate omission documented in `requirements.md`. External APIs introduce: network latency on every dashboard load, rate limiting, API key management, and non-deterministic test results. A seeded table makes the entire system self-contained, offline-capable, and makes every test result reproducible to the cent.

**The realistic upgrade path:** Replace the seeded table with a background job that refreshes rates nightly from an API. The `ExchangeRate` model is already structured for this — just swap the seed for a cron.

---

### Server-Side Pagination (Not Virtualization)
Rendering 10,000 DOM rows freezes the browser. The two standard solutions are: **virtual scrolling** (render only visible rows, window size ~20) or **server-side pagination** (never fetch more than `limit` rows at once).

**Why server-side:** Virtual scrolling still requires loading all 10k records into JavaScript memory on the first load (~2MB JSON payload). Server-side pagination with `SKIP`/`TAKE` in Prisma means the browser never receives more than 20 records per request. With the new indexes on `department` and `country`, each query is a bounded index scan — not a full table scan.

---

### Seeder as Realistic Simulation
The seeder (`prisma/seed.ts`) was built with deliberate realism:
- Country-specific surnames (Japanese names for Japan, etc.) to make demo data credible
- Cost-of-living multipliers per country (India: 0.35x, US: 1.0x) so salary distributions feel authentic
- A programmed gender pay gap in Sales/Marketing (~7%) to make the gender pay chart analytically interesting
- 25% of employees have `previousSalary` traces to make the directory table immediately informative

**Why it matters:** Realistic seed data means the analytics charts tell a story. A random data generator produces noise. A thoughtfully constructed dataset produces insight — which is the entire point of a compensation dashboard.

---

## 2. Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Browser (React SPA)                   │
│  page.tsx — single-page: Dashboard + Directory tabs      │
│  • useCallback with explicit dep arrays (no stale fetch) │
│  • Debounced search (sole owner of search-fetch)         │
│  • isMounted guard for SSR-safe Recharts                 │
└──────────────┬──────────────────────────────────────────┘
               │ fetch()
┌──────────────▼──────────────────────────────────────────┐
│              Next.js App Router (API Routes)             │
│  GET  /api/employees        — paginated, filtered list   │
│  POST /api/employees        — onboard employee           │
│  PATCH /api/employees/[id]  — salary adjustment + audit  │
│  DELETE /api/employees/[id] — termination                │
│  GET  /api/dashboard        — aggregated metrics         │
└──────────────┬──────────────────────────────────────────┘
               │ Prisma Client (adapter: better-sqlite3)
┌──────────────▼──────────────────────────────────────────┐
│                  src/lib/                                │
│  db.ts       — singleton PrismaClient, path resolution   │
│  analytics.ts — pure functions: median, avg, gap calc    │
└──────────────┬──────────────────────────────────────────┘
               │
┌──────────────▼──────────────────────────────────────────┐
│               SQLite (prisma/dev.db)                     │
│  Employee     — 10,000 records, 3 indexes                │
│  ExchangeRate — 5 static currency rates                  │
└─────────────────────────────────────────────────────────┘
```

**Data flow for dashboard load:**
1. `fetchDashboard()` → `GET /api/dashboard?country=X`
2. Route handler: `prisma.exchangeRate.findMany()` + `prisma.employee.findMany({ where, select: minimal fields })`
3. `calculateMetrics(employees, rateMap)` → pure JS aggregation
4. JSON response → React state → Recharts render

**Data flow for salary update:**
1. HR edits salary in modal → `PATCH /api/employees/:id`
2. Route fetches current record, compares salary values
3. If changed: `previousSalary = currentSalary`, `salaryUpdatedAt = now()`
4. Single atomic `prisma.employee.update()`
5. `fetchEmployees()` re-runs → table reflects updated row

---

## 3. AI Workflows

The AI (Antigravity) was used intentionally at each stage rather than blindly generating entire files.

### Stage 1 — Requirements & Planning
I used the AI to draft the `requirements.md` and `implementation_plan.md` before writing a single line of code. The plan specified the exact schema fields, API signatures, and chart types. This meant the implementation phase had clear acceptance criteria — I wasn't discovering requirements during coding.

**What I verified manually:** The scope boundaries (what's explicitly out of scope and why), the exchange rate strategy, and the pagination decision. These are judgment calls that need human reasoning, not generation.

### Stage 2 — Scaffolding Navigation
`create-next-app --help` was run first to inspect available flags before constructing the initialization command. This is the correct workflow for any rapidly-evolving CLI tool — never assume flag names from training data.

### Stage 3 — Prisma 7 Breaking Changes
When `prisma migrate dev` failed because `url` in `schema.prisma` was no longer valid in Prisma 7, I searched for the new configuration pattern rather than reverting to Prisma 6. This is a case where AI training data is stale — the tool surfaced the correct `prisma.config.ts` pattern by querying current documentation.

**Lesson:** Version-specific breaking changes are exactly the scenario where web search mid-implementation is more reliable than generation from memory.

### Stage 4 — Incremental Commits
Each logical unit of work was committed independently:
```
docs: requirements
feat: Next.js initialization
feat: Prisma schema + migration
feat: seeder (10k records)
feat: API route handlers
feat: frontend components + CSS
test: Vitest unit + integration tests
fix: Recharts TypeScript types
fix: DB indexes + double-fetch + KPI format
```
This commit history shows the evolution of thinking — not just the end state.

### Stage 5 — Self-Review Cycle
After implementation, a structured review was run against the codebase, identifying specific file paths, line numbers, and root causes — not vague "could be improved" commentary. The B+ items (missing indexes, double-fetch, raw KPI numbers) were fixed in a subsequent targeted pass.

---

## 4. Trade-offs Considered

### SQLite vs. PostgreSQL
| | SQLite | PostgreSQL |
|---|---|---|
| Setup | Zero-config, file-based | Requires server process |
| Performance at 10k | Excellent (<5ms queries) | Excellent |
| Concurrent writes | Poor (file-level locks) | Excellent (MVCC) |
| Deployment | Single binary | Separate managed service |

**Decision:** SQLite is specified in the brief and is genuinely appropriate for this use case. An HR Manager is the sole user — there is no concurrent write pressure. The correct upgrade trigger is: multiple simultaneous writers, or row counts above ~1M.

### In-Memory Aggregation vs. SQL GROUP BY
The dashboard currently fetches all matching employee rows and aggregates in JavaScript:
```ts
const employees = await prisma.employee.findMany({ where, select: minimal });
const metrics = calculateMetrics(employees, rateMap); // pure JS
```

**Why not SQL GROUP BY?**
- Prisma's query API doesn't support `MEDIAN` (SQL doesn't standardize it either)
- `AVG`, `COUNT`, `SUM` are achievable via `prisma.employee.aggregate()` / `groupBy()`, but median requires sorted arrays — impossible without fetching raw data
- For 10k records, the full select is ~1.2MB in memory — acceptable

**When to switch:** At 100k+ employees, fetching all rows for in-memory aggregation becomes a bottleneck. The solution is a hybrid: push `AVG`, `COUNT`, `SUM` to SQL `GROUP BY`, and compute median with a separate `PERCENTILE_CONT` approximation (or a sorted subsample).

### Single Page vs. Multi-Route App
The entire application is a single React component (`page.tsx`, 1000 lines). In production, this should be split into separate Next.js routes (`/dashboard`, `/employees`) with shared layout.

**Why single page here:** The brief asked for working software, not a production-scale codebase. A single page demonstrates all product requirements without routing complexity. The component state is complex enough to warrant splitting into custom hooks (`useDashboard`, `useDirectory`) in a follow-up.

### `where: any` Type Escape
```ts
const where: any = {};
```
This suppresses TypeScript for Prisma's `WhereInput` type. The correct type is `Prisma.EmployeeWhereInput`.

**Why it was left:** Adding the correct type requires importing `Prisma` namespace and handling the `OR` clause type (`Prisma.StringFilter`) correctly — it's ~5 lines of correct typing but introduces noise in a short review. The `any` was used to keep route handlers readable at 80 lines. This is explicitly documented as a known gap.

---

## 5. Possible Improvements

### High Priority (Production Blockers)

**Authentication & RBAC**
Currently the app has no auth. A production deployment needs at minimum: JWT sessions, role guards on API routes (HR Manager vs. read-only viewer), and audit logging of who changed which salary. NextAuth.js or Clerk integrate cleanly with App Router.

**SQL GROUP BY for dashboard at scale**
Replace the in-memory aggregation with Prisma `groupBy` for `AVG`, `COUNT`, `SUM`, and compute median server-side with a window function approximation. Reduces dashboard response payload from ~1.2MB to ~2KB.

**Input sanitization & rate limiting**
API routes currently do basic null checks but no length limits, no email format regex, no rate limiting. At minimum: `zod` schema validation on POST/PATCH bodies, and `next-rate-limit` on the API layer.

---

### Medium Priority (Quality of Life)

**Split `page.tsx` into custom hooks**
```
useDashboard(filters)   → { data, loading, refetch }
useDirectory(filters)   → { employees, page, search, ... }
useEmployeeActions()    → { add, updateSalary, terminate }
```
Each hook owns its fetch lifecycle, making the component a pure composition of UI blocks.

**Full-text search (FTS5)**
SQLite's `LIKE '%query%'` on unindexed string columns is O(n). SQLite FTS5 virtual tables support ranked full-text search on `firstName || ' ' || lastName || ' ' || email` with sub-millisecond performance on millions of rows.

**Salary History Table**
Replace `previousSalary Float?` with a proper `SalaryHistory` model:
```prisma
model SalaryHistory {
  id         String   @id @default(uuid())
  employeeId String
  salary     Float
  currency   String
  changedAt  DateTime @default(now())
  changedBy  String   // HR user ID
  reason     String?
  employee   Employee @relation(fields: [employeeId], references: [id])
}
```
This enables full compensation timeline charts, audit trails, and manager accountability.

**Export to CSV/Excel**
The most-requested feature in any tool that replaces spreadsheets. A `GET /api/employees/export?format=csv` endpoint streaming the full dataset via Node.js `stream` (avoiding loading all 10k into memory at once) would cover 80% of the "we need this in a spreadsheet" use cases.

---

### Low Priority (Nice to Have)

**Live exchange rate sync** — A background job (cron or Vercel CRON) refreshing `ExchangeRate` daily from a public API. The table structure already supports this.

**Salary benchmarking** — Integrate a public compensation dataset (e.g., Glassdoor API, Levels.fyi data) to show P25/P50/P75 market benchmarks alongside internal compensation. This directly answers "are we paying competitively?" — the most valuable HR question.

**Offer letter generation** — Use the employee record + department template to auto-generate PDF offer letters. `@react-pdf/renderer` integrates cleanly with Next.js API routes.

**Dark/light mode toggle** — The CSS design system already uses CSS custom properties (`var(--bg-main)`, etc.). Adding `data-theme="light"` overrides in `:root` is a one-hour addition.
