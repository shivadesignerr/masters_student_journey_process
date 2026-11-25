# GVK Edutech — Masters Student & Counselor Management Platform

> Enterprise web-based Student and Counselor Management Platform purpose-built for overseas Masters Abroad education consultancies.

---

## 1. System Overview

The **GVK Masters Student Management Platform** digitizes and streamlines GVK Edutech's entire Masters Abroad operations. It unifies students and counselors on a shared, synchronized PostgreSQL database with strict role isolation and an algorithmic **Next-Action Engine**.

### Core Portals
1. **Student Portal (`/student/*`)**:
   - **Dashboard**: Features the dynamic **"YOUR NEXT ACTION"** card calculated automatically from pending deliverables.
   - **My Journey**: 22-Stage milestone timeline for UK, US, and international Masters programs.
   - **My Universities**: Multi-application manager tracking offers, deposit deadlines, conditions, and CAS status.
   - **Document Vault**: Centralized vault with private storage, validation, versioning, and counselor verification status.
   - **My Tasks**: Task tracking, action submissions, and counselor reviews.
   - **Mock Interviews**: Scheduled sessions with one-click Zoom launch and PASS/FAIL evaluation feedback scorecards.
   - **Loan Tracking**: 11-Stage education loan pipeline.
   - **Counselor Support**: Direct advisor messaging channel.
   - **Notifications**: In-app real-time activity and admission alerts.

2. **Counselor Portal (`/counselor/*`)**:
   - **Command Center Dashboard**: Real-time database metrics across assigned students, offers, and document reviews.
   - **Assigned Students Database**: Filterable, searchable candidate roster restricted to assigned candidates via Row-Level Security.
   - **11-Tab Deep-Dive Student Workspace (`/counselor/students/[id]`)**:
     1. Overview
     2. Personal Details
     3. Academic Details
     4. University Applications
     5. Document Verification Queue
     6. Student Journey (Official milestone management)
     7. Task Dispatcher
     8. Mock Interview Scheduler & PASS/FAIL Evaluator
     9. Education Loan Pipeline
     10. Communication (Student Q&A + strictly private counselor internal notes)
     11. Activity History (Immutable audit trail)
   - **Cross-Student Application Matrix (`/counselor/applications`)**: Global tracking across all applications.
   - **Document Verification Inbox (`/counselor/documents`)**: Review incoming uploads with Verify/Reject/Resubmit actions.
   - **Follow-up Workbench (`/counselor/follow-ups`)**: Monitor inactive candidates and upcoming deadlines.

3. **Future Admin Panel Readiness**:
   - Admin-only user provisioning endpoint: `/api/admin/provision-user`.
   - Complete append-only immutable activity log in `activity_logs`.
   - Zero public self-registration (Admin invitation activation tokens only).

---

## 2. Technology Stack & Design System

- **Framework**: Next.js 14+ App Router, React 18, TypeScript (Strict Mode)
- **Styling**: Tailwind CSS with official GVK Brand Tokens:
  - Primary Navy: `#253775`
  - Brand Red: `#FF0008`
  - Background: `#F7F8FC`
  - Primary Text: `#27324B`
  - Secondary Text: `#788196`
  - Border: `#E5E9F0`
  - Success: `#168653`
  - Warning: `#D89425`
  - Error: `#DC3545`
- **Database & Storage**: PostgreSQL via Supabase (24 normalized tables) + Private S3-compatible storage buckets.
- **Security**: Row-Level Security (RLS), custom JWT claims, zero client exposure of service-role keys.
- **Icons & UI Primitives**: Lucide Icons, Radix UI headless components.

---

## 3. Responsive Breakpoint & Mobile Support

The platform is designed mobile-first and fluidly adapts across all required viewports:
- **Desktop (1280px - 1920px)**: Persistent 260px Navy Sidebar, multi-column dashboard, split analytical workspaces.
- **Tablet (768px - 1024px)**: Collapsible sidebar / floating drawer, adaptive 2-column grids, horizontal table scrolling.
- **Mobile (320px - 430px)**: Compact header with hamburger navigation drawer, touch-friendly 44px minimum target sizes, card-based mobile lists, zero horizontal page overflow.

---

## 4. Getting Started & Local Development

### Prerequisites
- Node.js 18.17+ or 20.x
- npm 9+

### Installation
```bash
# 1. Install dependencies
npm install

# 2. Configure environment variables
cp .env.example .env.local

# 3. Run development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the portal entry selector.

### Production Build
```bash
npm run build
npm start
```

---

## 5. Quick Demo Credentials for Evaluation

For rapid evaluation, the login page (`/auth/login`) includes **One-Click Quick Fill** buttons:

| Role | Identifier (ID or Email) | Demo Password | Default Redirect |
| :--- | :--- | :--- | :--- |
| **Student** | `GVK-STU-2026-0042` or `rahul.sharma@gmail.com` | `GVKStudent@2026` | `/student/dashboard` |
| **Counselor** | `GVK-EMP-014` or `counselor.priya@gvkedutech.com` | `GVKCounselor@2026` | `/counselor/dashboard` |

---

## 6. Verification & Automated Acceptance Tests

Run the built-in end-to-end acceptance test suite covering all 8 criteria:
```bash
npx tsx scripts/test_acceptance_criteria.ts
```

### Verification Matrix (100% Passed)
- [x] **TEST 1**: Authentication & Role Boundary Isolation (Strict 403 / redirect protection).
- [x] **TEST 2**: Account Provisioning Guardrail (Admin-only invitation tokens; no self-registration).
- [x] **TEST 3**: Student Journey Milestone Sync & Audit (Counselor updates reflect instantly for student).
- [x] **TEST 4**: Multiple University Applications & Isolation (Independent status histories).
- [x] **TEST 5**: Document Upload & Counselor Verification Loop (Vault versioning & comments).
- [x] **TEST 6**: Mock Interview Scheduling, Zoom Launch & PASS Assessment (Scorecards & rubrics).
- [x] **TEST 7**: Task Lifecycle & Milestone Closure (Assign -> Submit -> Verify).
- [x] **TEST 8**: Immutable Activity Audit Trail for Future Management Oversight.

---

## 7. Database Migrations

Database definitions and RLS policies are available under `/supabase`:
- `supabase/migrations/20261117000001_initial_schema.sql` (24 normalized tables)
- `supabase/migrations/20261117000002_rls_policies.sql` (Row-Level Security rules)
- `supabase/seed.sql` (Development seed dataset)
