# Requirements Document: ACME Org Employee Salary Management Software

## Goal
To build a web-based employee salary management application that enables ACME Org's HR Manager to easily manage salary data for 10,000 employees across multiple countries, and answer key questions about organizational compensation patterns.

---

## Scope & Key Features

### 1. Interactive Analytics Dashboard (Answering payment questions)
*   **Organizational Metrics**: Total payroll cost, average salary, median salary, and employee headcounts.
*   **Cross-Border Insights**: Salary metrics grouped by country and department.
*   **Currency Standardization**: Normalized reporting in a single base currency (e.g., USD) alongside local currency representation to handle multi-country operations.
*   **Pay Equity & Distribution**: Salary distribution histogram and a basic gender pay gap or department distribution chart.

### 2. High-Performance Employee Directory
*   **Scalable Pagination**: A table UI that handles 10k employees efficiently using server-side pagination, sorting, and filtering.
*   **Search**: Search by employee ID, first/last name, or email.
*   **Filters**: Filter by department, country, and job title.

### 3. Salary & Employee Management (CRUD)
*   **Add Employee**: Form to onboard a new employee with country, department, role, salary, currency, and basic details.
*   **Update Salary**: Edit an employee's salary with audit tracking (tracking previous salary and change date).
*   **Terminate Employee**: Remove employees from active payroll.

### 4. Deterministic Data Seeding
*   **10,000 Records**: A robust seeder script generating 10,000 realistic employees distributed across 5 countries (e.g., US, UK, Germany, India, Japan) and 5-6 departments, with realistic salary bounds and gender representation.

---

## Out of Scope & Omission Justifications

1.  **Authentication & Multi-Role Authorization**
    *   *Decision*: Omitted, or limited to a mock selector ("Logged in as HR Manager").
    *   *Reasoning*: Implementing production-grade JWT/OAuth, MFA, and role-based permissions (RBAC) would increase the scope significantly without contributing to the core logic of salary management and compensation analysis.
2.  **Live/Real-Time Currency Conversion APIs**
    *   *Decision*: Omitted; use a static, seeded exchange-rate table in the database.
    *   *Reasoning*: Live APIs add external failure vectors, rate-limit issues, and slow down unit tests. A seeded exchange-rate table ensures tests are fast and 100% deterministic, while still demonstrating currency conversion logic.
3.  **Real Bank Payroll/Direct Deposit Integration**
    *   *Decision*: Omitted.
    *   *Reasoning*: Financial integrations require compliance, security auditing, and external sandbox environments which are outside the scope of a management UI.
4.  **Historical Salary Progression Chart**
    *   *Decision*: Omitted.
    *   *Reasoning*: Complete salary history tracking (e.g., full historical logs over 10 years for 10,000 employees) is simplified to recording only the "previous salary" and "current salary" to keep the schema clean and focused.

---

## Technical Stack & Constraints
*   **Framework**: Next.js (ReactJS, TypeScript) - allows building backend APIs and frontend UI in a single repository, making it efficient, type-safe, and easy to deploy.
*   **Database**: SQLite with Prisma ORM - relational, local, self-contained, and highly portable.
*   **Styling**: CSS Modules or Tailwind CSS (Vanilla CSS focus for premium styling). Let's use clean Vanilla CSS / CSS Modules for a highly customized and premium aesthetic.
*   **Component Library**: Radix UI primitives (headless) with custom CSS for maximum aesthetic control, or simple clean custom components to avoid dependency bloat.
*   **Testing**: Vitest/Jest for unit and integration testing.
