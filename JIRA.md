# 📋 Atlas Academy — Jira Project Board
> Format: Epic → Stories → Tasks | Priority: 🔴 Critical · 🟠 High · 🟡 Medium · 🟢 Low
> Last Updated: April 2026

---

# ✅ DONE — Completed Epics & Stories

---

## EPIC-01 · Project Foundation & Cloud Infrastructure
**Goal:** Set up the full-stack environment and deploy to production cloud services.

### STORY-01-01 · Initialize MERN Stack Project ✅
- **Type:** Task | **Priority:** 🔴 Critical
- Create Vite + React frontend project structure
- Initialize Node.js + Express backend with proper folder structure (`routes/`, `controllers/`, `models/`, `middleware/`)
- Configure `.env` files for local and production environments
- Set up `package.json` scripts for dev/prod modes

### STORY-01-02 · Configure MongoDB Atlas Database ✅
- **Type:** Task | **Priority:** 🔴 Critical
- Create MongoDB Atlas cluster (free tier)
- Configure network access with IPv4 CIDR bypass (0.0.0.0/0) to fix Render connectivity
- Create database user with read/write permissions
- Store `MONGODB_URI` securely in environment variables

### STORY-01-03 · Deploy Backend to Render ✅
- **Type:** Task | **Priority:** 🔴 Critical
- Push backend to GitHub and link to Render Web Service
- Configure environment variables on Render dashboard (`MONGODB_URI`, `JWT_SECRET`, `PORT`)
- Verify backend health endpoint is accessible publicly
- Document the live API base URL

### STORY-01-04 · Deploy Frontend to Vercel ✅
- **Type:** Task | **Priority:** 🔴 Critical
- Push frontend to GitHub and link to Vercel project
- Configure `VITE_API_URL` environment variable in Vercel to point to Render backend
- Fix 404 on route refresh by adding `vercel.json` with SPA rewrite rule
- Verify all protected routes load correctly after direct URL access

---

## EPIC-02 · Authentication & Role-Based Access Control
**Goal:** Secure the platform so each user role only sees what they are permitted to.

### STORY-02-01 · JWT Authentication System ✅
- **Type:** Feature | **Priority:** 🔴 Critical
- Build `/api/auth/login` endpoint that validates credentials and returns a signed JWT
- Store JWT in `localStorage` on the client
- Create `authMiddleware.js` to decode and verify JWT on every protected API route
- Implement token expiry (7 days) and auto-logout on expiry

### STORY-02-02 · Role-Based Routing (Frontend) ✅
- **Type:** Feature | **Priority:** 🔴 Critical
- Create `ProtectedRoute` component that checks JWT role before rendering
- Define allowed roles per route (e.g. `/finance` → admin only)
- Redirect unauthorized users to `/login` with appropriate message
- Redirect logged-in users away from `/login` to their dashboard

### STORY-02-03 · On-Screen Password Display (SMTP Workaround) ✅
- **Type:** Bug Fix | **Priority:** 🟠 High
- Render free tier blocks outgoing SMTP emails
- Display system-generated password directly in a success modal UI after account creation
- Admin copies and manually shares credentials with the new user
- Add clipboard copy button for convenience

### STORY-02-04 · Parent–Student Account Linking ✅
- **Type:** Feature | **Priority:** 🟠 High
- Add `parentId` reference field to Student MongoDB schema
- Create `hasLogin` boolean flag — students can exist without email/password credentials
- Update user creation form to show Parent selector when role = Student
- Fetch linked children list in Parent dashboard via `/api/dashboard/parent`

---

## EPIC-03 · Design System & UI Components
**Goal:** Build a premium, consistent, dark-mode-capable design system used across all pages.

### STORY-03-01 · Tailwind CSS Custom Theme ✅
- **Type:** Task | **Priority:** 🟠 High
- Extend Tailwind config with custom colors: `moroccan-green (#1a3c34)`, `moroccan-gold (#c29d6d)`, `deep-emerald (#0f2b22)`
- Fix PostCSS config errors (`@apply`, `@tailwind` directive issues)
- Add custom font (Inter/Outfit from Google Fonts) via `index.html`
- Configure `darkMode: 'class'` in Tailwind for manual dark mode toggle

### STORY-03-02 · Sidebar Navigation Component ✅
- **Type:** Feature | **Priority:** 🟠 High
- Build collapsible sidebar with Atlas Academy logo and branding
- Render different navigation links based on authenticated user role
- Highlight active route with subtle indicator bar
- Add hover animations and smooth transitions on nav items

### STORY-03-03 · Topbar Component ✅
- **Type:** Feature | **Priority:** 🟠 High
- Display current page context and user greeting
- Integrate Dark Mode toggle button with sun/moon icon
- Add notification bell with unread count badge and dropdown panel
- Add profile avatar dropdown: view profile, change password, logout
- Add FR / EN language toggle buttons

### STORY-03-04 · Dark Mode System ✅
- **Type:** Feature | **Priority:** 🟡 Medium
- Create `ThemeContext` with `toggleTheme()` function
- Persist theme preference in `localStorage`
- Apply `dark:` Tailwind variants across all pages consistently
- Ensure charts, modals, and all components respect the dark theme

---

## EPIC-04 · Admin Command Center
**Goal:** Give administrators full visibility and control over the school's operations.

### STORY-04-01 · Admin Dashboard Overview ✅
- **Type:** Feature | **Priority:** 🔴 Critical
- Display 4 KPI stat cards: Total Students, Teachers, Parents, Subjects
- Fetch live data from `/api/dashboard/admin`
- Quick-action buttons: navigate to Users, HR, Finance, Attendance, Messages
- Animate cards on load with `fade-in` transitions

### STORY-04-02 · User Management Module ✅
- **Type:** Feature | **Priority:** 🔴 Critical
- List all users filterable by role (Students / Teachers / Parents / All)
- Browse students by school cycle and grade level (CP → Terminale)
- Create new user modal with role-specific fields (grade for students, subject for teachers)
- Edit existing user data inline or via modal
- Delete user with confirmation dialog
- Display generated password in success modal after creation

### STORY-04-03 · HR & Staff Management Module ✅
- **Type:** Feature | **Priority:** 🟠 High
- List all staff members with role, department, and contact info
- Add new employee modal with first/last name, email, phone, role, salary
- Link to individual Personnel Profile page per staff member
- Display staff stats: total teachers, administrators, etc.

### STORY-04-04 · Personnel Profile Page ✅
- **Type:** Feature | **Priority:** 🟡 Medium
- Dedicated page per staff member at `/hr/:id`
- Show personal info, assigned subjects/classes, salary, and leave history
- Admin can approve or reject leave requests from this page

### STORY-04-05 · Leave Management (Admin View) ✅
- **Type:** Feature | **Priority:** 🟡 Medium
- Admin sees all pending leave requests from teachers
- Approve / Reject actions update the request status in the database
- Teacher sees the updated status in their own dashboard
- Color-coded status badges: Pending (amber), Approved (green), Rejected (red)

### STORY-04-06 · Admissions & Enrollment Tracking ✅
- **Type:** Feature | **Priority:** 🟡 Medium
- Track new student enrollment requests
- Display enrollment pipeline (Applied → Reviewed → Accepted)
- Admin can accept/reject and auto-create student account on acceptance

---

## EPIC-05 · Academic Modules
**Goal:** Digitize all academic operations — scheduling, grading, attendance, library, and learning.

### STORY-05-01 · Timetable Module ✅
- **Type:** Feature | **Priority:** 🟠 High
- Weekly schedule grid view (Mon–Sat) with time slots
- Color-coded subjects using consistent subject color system
- Teachers see their own schedule; Students see their class schedule
- Admin can create/edit timetable entries

### STORY-05-02 · Exams & Grades Module ✅
- **Type:** Feature | **Priority:** 🟠 High
- Teachers can create exams with subject, date, and title
- Teachers enter student grades per exam
- Students view their own grades and GPA in their dashboard
- Parents view their child's grades under the Academic tab

### STORY-05-03 · Academic Attendance Module ✅
- **Type:** Feature | **Priority:** 🟠 High
- Teachers select a class and mark each student Present / Absent
- Records stored per session (date + subject + class)
- Students and parents can view individual attendance records
- Admin has a global attendance overview

### STORY-05-04 · Library Management Module ✅
- **Type:** Feature | **Priority:** 🟡 Medium
- Catalog of all school books with title, author, category, and stock count
- Mark books as Borrowed / Available / Overdue
- Overdue badge alerts on student and parent dashboards
- Admin can add, edit, or remove books from the catalog

### STORY-05-05 · E-Learning Portal ✅
- **Type:** Feature | **Priority:** 🟡 Medium
- Online learning resources organized by subject
- Teachers can post materials (links, files, notes)
- Students can browse and access their subject resources

### STORY-05-06 · Events Calendar ✅
- **Type:** Feature | **Priority:** 🟢 Low
- School-wide events displayed on a monthly calendar view
- Admin can create events with title, date, description, and audience
- All roles can view upcoming events relevant to them

---

## EPIC-06 · Finance Module
**Goal:** Automate and track all financial operations including fees, invoices, and payroll.

### STORY-06-01 · Finance Dashboard ✅
- **Type:** Feature | **Priority:** 🟠 High
- KPI cards: Total Revenue, Pending Fees, Collection Rate, Approved Invoices
- Invoice list with student name, amount, type, date, and status
- Filter invoices by status (Paid / Pending / Overdue)

### STORY-06-02 · Invoice Generation ✅
- **Type:** Feature | **Priority:** 🟠 High
- Admin selects a student using an autocomplete searchable datalist
- Fills in invoice type (Tuition / Transport / Extra) and amount
- System generates invoice with unique invoice number
- Invoice saved to database and visible in parent's finance tab

### STORY-06-03 · Printable Receipt ✅
- **Type:** Feature | **Priority:** 🟡 Medium
- Parent clicks "Print Receipt" on any paid invoice
- New browser tab opens with a styled HTML receipt (Atlas Academy branding)
- Auto-triggers browser print dialog after 500ms
- Receipt includes: student name, grade, amount, invoice number, date

---

## EPIC-07 · Communication System
**Goal:** Enable seamless, secure messaging between all platform users.

### STORY-07-01 · Messaging Hub ✅
- **Type:** Feature | **Priority:** 🟠 High
- Chat-style UI with conversation list on the left, message thread on the right
- All roles can message each other based on permissions:
  - Admin: can message anyone
  - Teacher / Parent: can only message admins
- New conversation modal with user search
- Messages auto-refresh every 10 seconds via polling

---

## EPIC-08 · Multilingual System
**Goal:** Make 100% of the platform accessible in French and English.

### STORY-08-01 · Language Context & Dictionary ✅
- **Type:** Feature | **Priority:** 🟠 High
- Create `LanguageContext` with `lang` state, `setLang()`, and `t(key)` translation function
- Build bilingual dictionary with 100+ translation keys for FR and EN
- Store language preference in `localStorage`
- Apply `dir="rtl"` for Arabic-ready architecture (future use)

### STORY-08-02 · Translate All Pages ✅
- **Type:** Task | **Priority:** 🟠 High
- Replace all hardcoded French strings with `{t('key')}` across:
  - Admin, Teacher, Student, Parent Dashboards
  - Finance, HR, User Management, Messages pages
  - Teacher Dashboard action buttons, salary section, leave section
  - Student overdue library notices, attendance labels
- Fix 6 blank page crashes caused by missing `t` in `useLanguage()` destructure

---

# 📌 TO DO — Future Roadmap

---

## EPIC-09 · Smart Transport System 🚌
**Goal:** Provide real-time bus tracking, student safety, and automated transport billing.
**Priority:** 🔴 Critical (Next Sprint)

### STORY-09-01 · Backend: Bus & Route Data Models
- **Type:** Task | **Priority:** 🔴 Critical | **Estimate:** 3 pts
- Create `Bus` MongoDB schema: `plateNumber`, `capacity`, `driverId`, `status` (active/maintenance)
- Create `Route` MongoDB schema: `name`, `stops[]` (name, coordinates, order), `busId`, `scheduledTime`
- Create `BusAttendance` schema: `busId`, `date`, `records[]` (studentId, boardedAt, exitedAt, method: QR/manual)
- Build REST API: GET/POST/PUT/DELETE for buses and routes
- Seed dummy data for 3 buses and 2 routes for demo

### STORY-09-02 · Admin: Fleet Management Dashboard
- **Type:** Feature | **Priority:** 🔴 Critical | **Estimate:** 5 pts
- New page `/transport` visible to admin only in sidebar
- Tab 1 — **Fleet**: List all buses with plate, driver, status, and current route assignment
- Tab 2 — **Routes**: Visual list of all routes with stops and assigned bus
- Tab 3 — **Drivers**: List of users with role `driver` and their assigned vehicle
- Add / Edit / Delete modals for buses and routes
- Status badge: Active (green), Maintenance (amber), Inactive (red)

### STORY-09-03 · Admin: Route Builder
- **Type:** Feature | **Priority:** 🟠 High | **Estimate:** 8 pts
- Embed `react-leaflet` map in the route creation modal
- Admin clicks on the map to add stops with a name label
- Stops are ordered and saved as GPS coordinates array
- Display estimated travel time between stops
- Preview the full route as a polyline on the map

### STORY-09-04 · Parent: Live Bus Tracking Map
- **Type:** Feature | **Priority:** 🔴 Critical | **Estimate:** 8 pts
- Add "Transport" tab to Parent Dashboard
- Embed `react-leaflet` map showing child's bus location as a moving marker
- Bus location updated every 15 seconds via polling or WebSocket
- Display route stops as markers with estimated arrival times
- Show "Bus arrived at your stop" alert banner when bus is within 500m

### STORY-09-05 · Driver: QR Code Boarding System
- **Type:** Feature | **Priority:** 🟠 High | **Estimate:** 5 pts
- Create minimal Driver Dashboard `/driver` with today's student manifest
- Integrate `html5-qrcode` library for camera-based QR scanning
- Each student has a unique QR code (their `_id` encoded)
- Scan on boarding → marks `boardedAt` timestamp in `BusAttendance`
- Scan on exit → marks `exitedAt` timestamp
- Parent receives real-time notification: "Zineb has boarded Bus 3"

### STORY-09-06 · Automated Transport Notifications
- **Type:** Feature | **Priority:** 🟠 High | **Estimate:** 3 pts
- Trigger frontend toast notification when bus is 5 stops away
- Display notification in Parent Dashboard notification bell
- Log all transport events (boarding, arrival, delay) in notification history
- Admin can broadcast manual delay message to all parents on a route

### STORY-09-07 · Transport Fee Integration
- **Type:** Feature | **Priority:** 🟡 Medium | **Estimate:** 3 pts
- Add `Transport` as a fee type in invoice creation
- Admin can auto-generate monthly transport invoices for all enrolled students
- Transport fee amount configurable per route in settings
- Visible in Parent Dashboard under Finance tab alongside tuition fees

---

## EPIC-10 · AI & Smart Analytics 🤖
**Goal:** Use data-driven intelligence to improve outcomes for students and efficiency for admins.

### STORY-10-01 · AI Timetable Generator
- **Type:** Feature | **Priority:** 🟠 High | **Estimate:** 13 pts
- Admin provides: teachers, subjects, classes, available rooms, time slots
- Algorithm detects and prevents conflicts (teacher double-booking, room overlap)
- Auto-assign subjects to teachers based on their profile subject list
- Generated timetable displayed in the Timetable module for admin review
- Admin can override and re-run the generator

### STORY-10-02 · Predictive Academic Risk System
- **Type:** Feature | **Priority:** 🟠 High | **Estimate:** 8 pts
- Analyze each student's grade trend over last 3 exam sessions
- Flag students whose average drops below configurable threshold (default: 50%)
- Generate "At Risk" alert visible to admin and parent
- Weekly auto-report of at-risk students sent to admin
- Display risk indicator badge on student profile in User Management

### STORY-10-03 · Smart Attendance Anomaly Detector
- **Type:** Feature | **Priority:** 🟡 Medium | **Estimate:** 5 pts
- Track rolling 30-day absence rate per student
- Auto-flag students with >20% absence rate in any subject
- Send alert to parent dashboard and admin notification panel
- Export weekly absence anomaly report as CSV

### STORY-10-04 · Embedded FAQ Chatbot
- **Type:** Feature | **Priority:** 🟢 Low | **Estimate:** 5 pts
- Floating chat widget in bottom-right corner (all dashboards)
- Pre-programmed answers for common questions:
  - "When is the next exam?" → fetches next exam from DB
  - "What are my fees?" → links to Finance tab
  - "How do I contact the admin?" → opens Messages hub
- Fallback: "I'll connect you to an admin" → opens new chat thread

---

## EPIC-11 · Virtual Collaboration 📹
**Goal:** Enable remote teaching and parent-teacher communication through real-time media tools.

### STORY-11-01 · WebRTC Parent-Teacher Video Calls
- **Type:** Feature | **Priority:** 🟠 High | **Estimate:** 13 pts
- "Schedule a Meeting" button on Teacher Dashboard and Parent Dashboard
- Book available time slots shown on a mini-calendar
- At meeting time, browser-based video call launches using WebRTC (peer-to-peer)
- No third-party service required — fully integrated
- Call recording option (saved locally or to cloud storage)

### STORY-11-02 · Interactive Digital Whiteboard
- **Type:** Feature | **Priority:** 🟡 Medium | **Estimate:** 8 pts
- Canvas element embedded in E-Learning portal
- Teacher can draw, write text, upload images, and highlight in real time
- Students join the whiteboard session as viewers (can request draw access)
- Export whiteboard as PNG at end of session

### STORY-11-03 · Teacher Screen Sharing
- **Type:** Feature | **Priority:** 🟢 Low | **Estimate:** 5 pts
- During a live online class, teacher activates screen share via `getDisplayMedia()` API
- Student screens show the teacher's shared window in real time
- Teacher can pause/resume sharing and annotate over the shared screen

---

## EPIC-12 · Advanced Payments & Finance 💳
**Goal:** Automate billing, enable online payments, and add financial intelligence.

### STORY-12-01 · Stripe Online Payment Integration
- **Type:** Feature | **Priority:** 🟠 High | **Estimate:** 8 pts
- Integrate Stripe Checkout in Parent Dashboard Finance tab
- Parent clicks "Pay Now" on a pending invoice → opens Stripe payment modal
- On success: invoice status updates to "Paid" and receipt is generated
- Stripe webhook updates database asynchronously for reliability
- Test with Stripe sandbox cards before going live

### STORY-12-02 · Automated Payment Reminders
- **Type:** Feature | **Priority:** 🟡 Medium | **Estimate:** 3 pts
- Scheduled job (cron) checks invoices 7 days before due date
- Sends notification to parent: "Invoice #INV-045 of 3500 MAD is due in 7 days"
- Second reminder 1 day before
- Overdue notification the day after with late fee warning

### STORY-12-03 · Scholarship & Discount Management
- **Type:** Feature | **Priority:** 🟡 Medium | **Estimate:** 5 pts
- Admin can award a scholarship to a student (fixed amount or % discount)
- Scholarship applied automatically when generating invoices for that student
- Scholarship list visible in Finance module with beneficiary and expiry date

### STORY-12-04 · Annual Budget Forecasting Dashboard
- **Type:** Feature | **Priority:** 🟢 Low | **Estimate:** 5 pts
- Visual charts projecting revenue vs. expenses over 12 months
- Based on enrolled students × tuition rate + transport fees
- Compare actual collected vs. projected at each month
- Export financial forecast as Excel or PDF report

---

## EPIC-13 · Platform Administration & Scale 🛠️
**Goal:** Make the platform enterprise-ready with advanced admin controls and audit trails.

### STORY-13-01 · Dynamic Role & Permissions System (RBAC)
- **Type:** Feature | **Priority:** 🟠 High | **Estimate:** 13 pts
- Admin can create custom roles (e.g. `Librarian`, `Accountant`, `Counselor`)
- Each role has a permission matrix: which pages and actions are allowed
- Permissions stored in the database and enforced on both frontend and backend
- UI in Admin settings: drag-toggle permission matrix per role

### STORY-13-02 · Full Audit Log System
- **Type:** Feature | **Priority:** 🟡 Medium | **Estimate:** 5 pts
- Log every significant action with: user ID, action type, entity modified, timestamp
- Actions tracked: account creation, invoice generation, grade submission, leave approval
- Admin can view and filter audit logs in a dedicated `/admin/logs` page
- Export audit logs as CSV for compliance purposes

### STORY-13-03 · Bulk Import via CSV
- **Type:** Feature | **Priority:** 🟡 Medium | **Estimate:** 5 pts
- Admin uploads a CSV file with student or teacher data
- System validates headers and data format before importing
- Preview table shown before final confirmation
- Import results: success count, failed rows with reasons

### STORY-13-04 · Automated Report Cards (PDF)
- **Type:** Feature | **Priority:** 🟡 Medium | **Estimate:** 8 pts
- At end of semester, admin triggers "Generate Report Cards" for a class
- System compiles grades from all subjects into a formatted PDF per student
- PDF includes student photo placeholder, GPA, per-subject scores, teacher comments
- Email report card to parent automatically (or display download link)

---

## EPIC-14 · Public Platform & Growth 🌐
**Goal:** Expand Atlas Academy into a market-ready SaaS product.

### STORY-14-01 · Public Landing Page & Marketing Site
- **Type:** Feature | **Priority:** 🟡 Medium | **Estimate:** 8 pts
- Standalone marketing page at root domain (not behind login)
- Sections: Hero, Features showcase, Role previews, Testimonials, Pricing, CTA
- "Request a Demo" form that sends lead to admin email
- SEO-optimized with proper meta tags, structured data, and sitemap

### STORY-14-02 · React Native Mobile App
- **Type:** Feature | **Priority:** 🟢 Low | **Estimate:** 21 pts
- Cross-platform app for iOS and Android (React Native + Expo)
- Roles: Parent (primary) and Student
- Features: View grades, attendance, messages, finance, transport tracking
- Push notifications via Expo Notifications for real-time alerts

### STORY-14-03 · Multi-School SaaS Architecture
- **Type:** Feature | **Priority:** 🟢 Low | **Estimate:** 21 pts
- Add `schoolId` tenant field to all MongoDB collections
- Each school's data is fully isolated — no cross-tenant data leakage
- Super-admin role can manage multiple school instances
- Separate subdomain per school: `school-name.atlasacademy.app`
- Billing per school based on number of active students (Stripe subscription)

---

## 📊 Sprint Summary

| Epic | Status | Priority | Effort |
|------|--------|----------|--------|
| EPIC-01: Infrastructure | ✅ Done | 🔴 Critical | — |
| EPIC-02: Auth & Roles | ✅ Done | 🔴 Critical | — |
| EPIC-03: Design System | ✅ Done | 🟠 High | — |
| EPIC-04: Admin Modules | ✅ Done | 🔴 Critical | — |
| EPIC-05: Academic | ✅ Done | 🟠 High | — |
| EPIC-06: Finance | ✅ Done | 🟠 High | — |
| EPIC-07: Communication | ✅ Done | 🟠 High | — |
| EPIC-08: Multilingual | ✅ Done | 🟠 High | — |
| EPIC-09: Transport 🚌 | 📌 Next | 🔴 Critical | ~35 pts |
| EPIC-10: AI Analytics 🤖 | 📌 Q3 | 🟠 High | ~31 pts |
| EPIC-11: Video/Collab 📹 | 📌 Q3 | 🟡 Medium | ~26 pts |
| EPIC-12: Payments 💳 | 📌 Q3 | 🟠 High | ~21 pts |
| EPIC-13: Admin Scale 🛠️ | 📌 Q4 | 🟡 Medium | ~31 pts |
| EPIC-14: Growth 🌐 | 📌 Q4 | 🟢 Low | ~50 pts |
