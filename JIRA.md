# 📋 Project Board (Jira)

This document serves as a Kanban board to track the progress of the Atlas Academy project. You can modify it to log what has been done, what is currently in progress, and future improvements!

---

## 📌 To Do (Next Improvements)
*Log ideas and future features to enhance the project here.*

**🚌 Smart Transport System Module (Next Priority)**
- [ ] **Live GPS Tracking**: Real-time tracking of school buses on an interactive Leaflet map for parents (Parent Dashboard interface).
- [ ] **Automated Notifications (Push/SMS)**: Alerts such as "The bus is arriving in 5 minutes" simulated on the frontend.
- [ ] **QR Code Scanning (Bus Attendance)**: Scan students when boarding/exiting using an integrated html5-qrcode scanner UI.
- [ ] **Fleet & Driver Management**: Admin dashboard to track vehicle records, drivers, and assigned routes.
- [ ] **Finance Integration**: Automate the collection of transport fees linked to regular tuition.

**🤖 AI & Machine Learning Integrations**
- [ ] **AI-Powered Timetable Generator**: A smart algorithm to automatically generate conflict-free schedules for teachers, rooms, and classes.
- [ ] **Predictive Academic Analytics**: Analyze student grades to predict failure risks early and alert parents automatically.

**📹 Virtual Collaboration Module**
- [ ] **WebRTC Parent-Teacher Conferences**: Built-in video calling directly from the Messaging Hub to schedule and conduct 1-on-1 virtual remote meetings securely.
- [ ] **Interactive Whiteboard**: A digital canvas embedded in the E-Learning portal for live online classes.

**🛠️ Advanced Administration**
- [ ] **Dynamic RBAC System**: Fully customizable Role-Based Access Control allowing the admin to create custom roles (e.g. "Librarian", "Accountant") with granular permissions.
- [ ] **Automated Billing Engine**: Payment gateway integration (Stripe/PayPal) directly accessible in Parent Dashboard for 1-click tuition payments.

**Other Improvements**
- [ ] Create a global landing page (showcase website) for the school.
- [ ] Connect a payment gateway (e.g., Stripe) for tuition fees.
- [ ] Implement a fully dynamic roles and permissions system.

---

## ⏳ In Progress
*Features we are currently developing.*
- [ ] Writing the final project documentation.
- [ ] Refactoring UI components (code cleanup).

---

## 🔍 In Review / Testing
*Tasks that are almost finished but require final testing or validation.*
- [x] Direct password display upon account creation instead of email (Live interface UI validation).

---

## ✅ Done
*The complete journey from Day 1 to our Live Deployment.*

**🚀 1. Foundation & Cloud Deployments**
- [x] **MERN Architecture**: Initialized full-stack environment using Vite, React, Node.js, and Express.
- [x] **Database Setup**: Modeled MongoDB schemas for Users, Invoices, Messages, and Books.
- [x] **Server-to-Client Config**: Robust Render mapping, IPv4 database bypasses, and secure environment variable handling (VITE_API_URL).

**🔐 2. Secure Authentication & Logic**
- [x] **Custom JWT Controls**: Secured backend routes based on admin/teacher/parent/student roles.
- [x] **Account Generator Engine**: Automated creation of child accounts dynamically linked to parents via internal MongoDB referencing.
- [x] **UI Password Display**: Displaying system-generated passwords cleanly to bypass strict cloud SMTP limitations.

**🎨 3. Premium Interface Engineering**
- [x] **Smart Dark Mode**: Seamless Tailwind-powered toggle transforming the entire application aesthetically.
- [x] **Dynamic Navigation**: React-Router integrated sidebar adapting options precisely per user-role.
- [x] **Autocomplete Selects**: Replaced boring dropdowns with dynamic, searchable user data-lists.

**📊 4. Deep Role Modules**
- [x] **Admin & HR**: Real-time overview of staff metrics, payroll processing, and student counts.
- [x] **Finance Engine**: Auto-generating, printable receipts and invoice transaction logic.
- [x] **Academic Utilities**: Digital library inventory mapping and E-learning file structure.
- [x] **Grade Processing**: Teacher dashboards built to submit multi-subject metrics to respective student accounts.

**💬 5. Global Communication & Localization**
- [x] **Direct Messaging Hub**: Live messaging UI mimicking modern chat apps between all roles.
- [x] **Persistent Localization**: A powerful Context API dictionary rendering the entire app bilingual (FR/EN) instantly.
