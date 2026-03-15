# ElectiFind — Jira Project Setup (Complete)

> **Status Legend:**
> - ✅ DONE = UI prototype exists in current codebase (static/hardcoded)
> - 🔶 PARTIAL = Partially built but needs production rework
> - ❌ PENDING = Not started at all
>
> **Note:** All "DONE" frontend items are prototype-quality (single file, inline styles, hardcoded data). They will need refactoring into proper components + API integration, but the UI/UX design work is complete.

---

## JIRA PROJECT SETTINGS

- **Project Name:** ElectiFind
- **Key:** EF
- **Type:** Scrum Board
- **Sprint Duration:** 2 weeks
- **Total Sprints:** 6 (12 weeks)

### Components
| Component | Lead |
|-----------|------|
| Frontend | Member 1 |
| Backend API | Member 2 |
| Database | Member 2 |
| AI/ML Engine | Member 3 |
| Authentication | Member 2 |
| DevOps/Infra | Member 3 |
| Testing/QA | All |

### Labels
`frontend` `backend` `ai-ml` `database` `auth` `ui-ux` `api` `testing` `devops` `documentation`

---

## EPIC 1: Project Setup & Infrastructure
**Jira Key:** EF-SETUP | **Bucket:** 🔧 Setup & Infra | **Sprint:** S1

| ID | Title | Type | Assignee | Points | Priority | Status | Notes |
|----|-------|------|----------|--------|----------|--------|-------|
| 1.1 | Initialize frontend project (React + Vite) | Task | Member 1 | 3 | Highest | ✅ DONE | React 18 + Vite 5 running, single-file prototype |
| 1.2 | Initialize backend project (Node/Express or Django) | Task | Member 2 | 3 | Highest | ✅ DONE | Express backend created with running API server |
| 1.3 | Set up database schema design (PostgreSQL/MongoDB) | Task | Member 2 | 5 | Highest | ❌ PENDING | Schema designed in plan, not implemented |
| 1.4 | Set up Git repo, branching strategy, CI/CD | Task | Member 3 | 3 | Highest | 🔶 PARTIAL | Git repo exists on Bitbucket, no CI/CD yet |
| 1.5 | Set up dev environment & .env configs | Task | All | 2 | High | ✅ DONE | `.env.example` added and frontend/backend run via npm scripts |
| 1.6 | Design system — color tokens, typography, component library | Task | Member 1 | 5 | High | ✅ DONE | Full design system in CSS vars (colors, fonts, radii, shadows, animations, reusable classes) |
| 1.7 | Set up ML/AI project structure & dependencies | Task | Member 3 | 3 | High | 🔶 PARTIAL | `backend/ml` workspace initialized; advanced ML tooling pending |

**Epic Subtotal:** 24 pts | **Done:** 13 | **Partial:** 6 | **Pending:** 5

---

## EPIC 2: Authentication & User Management
**Jira Key:** EF-AUTH | **Bucket:** 🔐 Authentication | **Sprint:** S1-S2

| ID | Title | Type | Assignee | Points | Priority | Status | Notes |
|----|-------|------|----------|--------|----------|--------|-------|
| 2.1 | As a student, I can create an account with email & password | Story | Member 2 | 5 | Highest | ✅ DONE | Registration API implemented and integrated in UI |
| 2.2 | As a student, I can sign in to my account | Story | Member 2 | 3 | Highest | ✅ DONE | Login API implemented and integrated in UI |
| 2.3 | As a student, I can reset my forgotten password | Story | Member 2 | 3 | High | ✅ DONE | Forgot-password endpoint implemented |
| 2.4 | Build Sign In / Create Account UI (split layout, mode toggle, floating inputs) | Task | Member 1 | 5 | Highest | ✅ DONE | AuthPage component built: left panel with stats, right panel with login/signup toggle, floating label inputs, error state, "forgot password" link |
| 2.5 | Implement JWT/session-based auth middleware | Task | Member 2 | 5 | Highest | ✅ DONE | JWT middleware added and used by protected endpoints |
| 2.6 | Build user registration API (`POST /api/auth/register`) | Task | Member 2 | 3 | Highest | ✅ DONE | Endpoint implemented with bcrypt hashing |
| 2.7 | Build login API (`POST /api/auth/login`) | Task | Member 2 | 3 | Highest | ✅ DONE | Endpoint implemented with credential validation |
| 2.8 | Implement protected route wrapper (frontend) | Task | Member 1 | 3 | High | ✅ DONE | Token-based route guarding added in app shell |

**Epic Subtotal:** 30 pts | **Done:** 30 | **Pending:** 0

---

## EPIC 3: Landing Page
**Jira Key:** EF-LANDING | **Bucket:** 🏠 Landing Page | **Sprint:** S1-S2

| ID | Title | Type | Assignee | Points | Priority | Status | Notes |
|----|-------|------|----------|--------|----------|--------|-------|
| 3.1 | Build hero section (tagline, CTA buttons, stats: 3200+, 94%, 120+) | Task | Member 1 | 3 | High | ✅ DONE | Gradient headline, pill badge, 2 CTAs, 3 stats, floating orbs, background grid |
| 3.2 | Build navbar (Logo, nav links, Sign In, Get Started) | Task | Member 1 | 2 | High | ✅ DONE | Sticky navbar with blur, logo, 3 links, ghost + primary buttons |
| 3.3 | Build Capabilities section (6 feature cards in 3×2 grid) | Task | Member 1 | 3 | Medium | ✅ DONE | 6 cards: Smart Questionnaire, Seat-Aware, Explainable AI, Reviews, Comparison, Community |
| 3.4 | Build "How It Works" section (3-step process with connector line) | Task | Member 1 | 2 | Medium | ✅ DONE | 3 numbered circles connected by horizontal amber line |
| 3.5 | Build Reviews/Testimonials section (3 review cards) | Task | Member 1 | 2 | Low | ✅ DONE | 3 cards with star ratings, quotes, avatars |
| 3.6 | Build CTA section + footer | Task | Member 1 | 3 | Medium | ✅ DONE | "Ready to Find Your Elective?" CTA + footer with links |

**Epic Subtotal:** 15 pts | **Done:** 15 | **Pending:** 0

---

## EPIC 4: Sidebar Navigation & Layout Shell
**Jira Key:** EF-NAV | **Bucket:** 🧭 Navigation & Layout | **Sprint:** S2-S4

| ID | Title | Type | Assignee | Points | Priority | Status | Notes |
|----|-------|------|----------|--------|----------|--------|-------|
| 4.1 | Build persistent left sidebar with 7 nav items & icons | Task | Member 1 | 5 | Highest | ✅ DONE | 220px fixed sidebar: Dashboard(⌂), Questionnaire(✦), Recommendations(◈), Compare(⇄), Community(◎), My Electives(⊞), Profile(◉) |
| 4.2 | Active page indicator (amber highlight + dot) | Task | Member 1 | 2 | High | ✅ DONE | amber-dim bg, amber border, green dot on active item |
| 4.3 | User info footer in sidebar (avatar, name, dept, semester) | Task | Member 1 | 2 | Medium | ✅ DONE | "SN" avatar circle, "Sarvagna", "CSE • Sem 6" |
| 4.4 | Top header bar (page title, search input, notification bell, avatar) | Task | Member 1 | 3 | High | ✅ DONE | 64px sticky bar with blur, search field, bell button, user avatar |
| 4.5 | Global course search functionality (backend) | Story | Member 2 | 5 | Medium | 🔶 PARTIAL | Backend search API (`GET /api/courses/search`) implemented; frontend search bar wiring still pending |
| 4.6 | Implement responsive sidebar (collapse on mobile) | Task | Member 1 | 3 | Medium | ❌ PENDING | Desktop only currently |

**Epic Subtotal:** 20 pts | **Done:** 12 | **Partial:** 5 | **Pending:** 3

---

## EPIC 5: Student Profile
**Jira Key:** EF-PROFILE | **Bucket:** 👤 Profile | **Sprint:** S2

| ID | Title | Type | Assignee | Points | Priority | Status | Notes |
|----|-------|------|----------|--------|----------|--------|-------|
| 5.1 | As a student, I can view my profile details | Story | Member 1 | 3 | High | ✅ DONE | ProfilePage built with all sections |
| 5.2 | As a student, I can edit my profile information | Story | Member 2 | 5 | High | ✅ DONE | Profile edit form now persists updates via `PUT /api/profile` |
| 5.3 | Build profile header card (80px avatar, name, degree/semester/batch tags) | Task | Member 1 | 3 | High | ✅ DONE | Gradient avatar "SN", "Sarvagna", 3 tags, edit button |
| 5.4 | Build profile info grid (Full Name, Email, Roll No, Dept, Batch, Advisor) | Task | Member 1 | 3 | High | ✅ DONE | 2×3 grid of info cards with mono labels |
| 5.5 | Build Interests & Preferences tag display | Task | Member 1 | 2 | Medium | ✅ DONE | 7 teal tags: ML, System Design, HCI, Python, Cloud, Research, Open Source |
| 5.6 | Build profile CRUD API (`GET/PUT /api/profile`) | Task | Member 2 | 5 | High | ✅ DONE | Profile GET/PUT endpoints implemented |
| 5.7 | Design `users` DB table/collection schema | Task | Member 2 | 3 | Highest | 🔶 PARTIAL | JSON collection schema implemented; SQL/NoSQL migration pending |

**Epic Subtotal:** 24 pts | **Done:** 21 | **Partial:** 3 | **Pending:** 0

---

## EPIC 6: Smart Questionnaire
**Jira Key:** EF-QUIZ | **Bucket:** 📝 Questionnaire | **Sprint:** S2-S3

| ID | Title | Type | Assignee | Points | Priority | Status | Notes |
|----|-------|------|----------|--------|----------|--------|-------|
| 6.1 | As a student, I can complete a 5-step questionnaire about my preferences | Story | All | 13 | Highest | 🔶 PARTIAL | UI complete, no persistence/backend |
| 6.2 | Design questionnaire questions & flow (5 steps) | Task | Member 3 | 5 | Highest | ✅ DONE | 5 questions: academic focus (choice), math comfort (slider), career target (choice), skill rating (4 sliders), scenario (2×2 grid) |
| 6.3 | Build step progress bar (Step X of 5, % complete, segment dots) | Task | Member 1 | 3 | High | ✅ DONE | Mono "STEP X OF 5" + "X% COMPLETE", gradient progress bar, 5 segment dots |
| 6.4 | Build multiple-choice question card UI | Task | Member 1 | 3 | Highest | ✅ DONE | Vertical option buttons with selected state (amber-dim bg, amber border) |
| 6.5 | Build slider question UI (emoji + range + labels) | Task | Member 1 | 2 | High | ✅ DONE | Large emoji display, range slider with amber accent, end labels |
| 6.6 | Build skill-rating question UI (4 skills with individual sliders) | Task | Member 1 | 2 | High | ✅ DONE | Python/Coding, Statistics/Math, System Design, Communication — each with label + X/5 + slider |
| 6.7 | Build scenario question UI (2×2 grid of options) | Task | Member 1 | 2 | High | ✅ DONE | 4 options in grid layout with same selected state |
| 6.8 | Build Back/Next navigation with step tracking | Task | Member 1 | 3 | High | ✅ DONE | "← Back" (disabled on step 1) + "Next →" / "Get Recommendations →" |
| 6.9 | Build completion screen (✦ icon, "Analysis Complete!", CTA) | Task | Member 1 | 2 | Medium | ✅ DONE | Floating icon, heading, subtext, "View My Recommendations →" button |
| 6.10 | Build questionnaire response API (`POST /api/questionnaire`) | Task | Member 2 | 5 | Highest | ✅ DONE | Questionnaire create endpoint implemented |
| 6.11 | Save partial progress (resume incomplete questionnaire) | Task | Member 2 | 5 | High | ✅ DONE | Questionnaire update/status endpoints implemented |
| 6.12 | Design `questionnaire_responses` DB schema | Task | Member 2 | 3 | Highest | 🔶 PARTIAL | JSON collection schema implemented; DB migration pending |

**Epic Subtotal:** 48 pts | **Done:** 32 | **Partial:** 16 | **Pending:** 0

---

## EPIC 7: AI Recommendation Engine
**Jira Key:** EF-AI | **Bucket:** 🤖 AI/ML Engine | **Sprint:** S2-S4

| ID | Title | Type | Assignee | Points | Priority | Status | Notes |
|----|-------|------|----------|--------|----------|--------|-------|
| 7.1 | Design course dataset schema (code, name, credits, difficulty, professor, tags, seats, rating) | Task | Member 3 | 5 | Highest | 🔶 PARTIAL | Professional electives are now mapped from syllabus in frontend sample dataset; DB schema still pending |
| 7.2 | Seed/populate course database with sample data | Task | Member 2 | 3 | Highest | ✅ DONE | Backend now loads full dataset from `electives_dataset.json` (188 courses) |
| 7.3 | Build recommendation algorithm (content-based / hybrid filtering) | Task | Member 3 | 13 | Highest | ✅ DONE | Hybrid scoring implemented in backend recommendation engine |
| 7.4 | Implement match score calculation (0-100%) | Task | Member 3 | 8 | Highest | ✅ DONE | Weighted 0-100 scoring with normalized breakdown implemented |
| 7.5 | Integrate seat availability into scoring | Task | Member 3 | 5 | High | ✅ DONE | Seat availability now contributes explicit score component |
| 7.6 | Build "Why Recommended?" explainability module | Task | Member 3 | 8 | High | ✅ DONE | Explainability text + component-wise score breakdown implemented |
| 7.7 | Build recommendation API (`GET /api/recommendations`) | Task | Member 2 | 5 | Highest | ✅ DONE | Endpoint implemented and returns scored recommendations with course payload |
| 7.8 | Track & store recommendation history per user | Task | Member 2 | 3 | Medium | ❌ PENDING | |
| 7.9 | MLflow model tracking integration | Task | Member 3 | 5 | Medium | ❌ PENDING | |

**Epic Subtotal:** 55 pts | **Done:** 42 | **Partial:** 5 | **Pending:** 8

---

## EPIC 8: Recommendations Page (Frontend)
**Jira Key:** EF-REC | **Bucket:** 💎 Recommendations UI | **Sprint:** S3

| ID | Title | Type | Assignee | Points | Priority | Status | Notes |
|----|-------|------|----------|--------|----------|--------|-------|
| 8.1 | As a student, I can view my top 3 AI-curated elective matches | Story | Member 1 | 8 | Highest | ✅ DONE | RecommendationsPage shows 3 course cards with full detail |
| 8.2 | Build recommendation card (match%, name, code, credits, difficulty, instructor, rating, seats bar) | Task | Member 1 | 5 | Highest | ✅ DONE | Full card with all data points, tags, seat availability bar |
| 8.3 | Build "TOP PICK" badge for #1 match | Task | Member 1 | 1 | Medium | ✅ DONE | "⭑ TOP PICK" teal tag + 3px gradient top border on first card |
| 8.4 | Build circular match percentage donut chart (MatchBadge) | Task | Member 1 | 3 | High | ✅ DONE | 54px conic-gradient circle with inner navy circle showing percentage |
| 8.5 | Build seat availability progress bar (color-coded: green/orange/red) | Task | Member 1 | 2 | High | ✅ DONE | SeatBar component: >60% green, >30% orange, else red |
| 8.6 | Build sort controls (Match %, Seats, Rating tags) | Task | Member 1 | 3 | Medium | ✅ DONE | Sort bar card with 3 teal tag buttons (UI only, no logic) |
| 8.7 | Build "View Details", "+Compare", "Why Recommended?" action buttons | Task | Member 1 | 3 | High | ✅ DONE | 3 buttons per card with navigation |
| 8.8 | Connect recommendations UI to API | Task | Member 1 | 3 | Highest | ✅ DONE | Recommendations page now consumes backend APIs (`/api/recommendations`, `/api/compare`, `/api/dashboard`) with fallback handling |

**Epic Subtotal:** 28 pts | **Done:** 28 | **Pending:** 0

---

## EPIC 9: Dashboard
**Jira Key:** EF-DASH | **Bucket:** 📊 Dashboard | **Sprint:** S3

| ID | Title | Type | Assignee | Points | Priority | Status | Notes |
|----|-------|------|----------|--------|----------|--------|-------|
| 9.1 | As a student, I see a personalized dashboard after login | Story | Member 1 | 8 | Highest | ✅ DONE | DashboardPage with welcome card, stats, course previews |
| 9.2 | Build greeting banner (date, name, questionnaire progress bar, Continue CTA) | Task | Member 1 | 3 | High | ✅ DONE | "MONDAY, MARCH 2025", "Good Morning, Sarvagna ✦", 5-segment progress, "Continue →" button |
| 9.3 | Build 4 summary stat cards (Recommended: 3, Avg Seats: 13.7, Match: 88%, Credits: 18) | Task | Member 1 | 3 | High | ✅ DONE | 4 cards with mono labels, Cormorant amber values, icons |
| 9.4 | Build "Your Top Recommendations" compact list with CourseCard rows | Task | Member 1 | 5 | High | ✅ DONE | "AI MATCHES" label, 3 CourseCard rows with rank number, match badge, tags, seat bar, action buttons |
| 9.5 | Build dashboard data aggregation API (`GET /api/dashboard`) | Task | Member 2 | 5 | High | ✅ DONE | Dashboard aggregation endpoint implemented and wired to frontend cards/list |

**Epic Subtotal:** 24 pts | **Done:** 24 | **Pending:** 0

---

## EPIC 10: Course Detail Page
**Jira Key:** EF-DETAIL | **Bucket:** 📄 Course Detail | **Sprint:** S3

| ID | Title | Type | Assignee | Points | Priority | Status | Notes |
|----|-------|------|----------|--------|----------|--------|-------|
| 10.1 | Build course detail header (match badge, title, tags, rating, seat bar, Enroll/Compare buttons) | Task | Member 1 | 5 | Highest | ✅ DONE | Full header on navy-80 bg with floating orb |
| 10.2 | Build 5-tab navigation (overview, structure, reviews, community, why-recommended) | Task | Member 1 | 3 | High | ✅ DONE | Tab bar with amber active underline + state switching |
| 10.3 | Build Overview tab (description card + prerequisites + 4 info cards: Assessment, Weekly Load, Grading, Career Relevance) | Task | Member 1 | 5 | High | ✅ DONE | 2-column layout: left description + prereqs, right 4 stacked info cards with emojis |
| 10.4 | Build Structure tab (7-week timeline with numbered circles) | Task | Member 1 | 3 | Medium | ✅ DONE | 7 weekly items with amber numbered circles + border separators |
| 10.5 | Build Reviews tab (rating summary chart + leave review form + 3 review cards) | Task | Member 1 | 5 | High | ✅ DONE | Left: 4.8 rating, 5-star dist bars, review form. Right: 3 reviews with difficulty/load tags |
| 10.6 | Build "Why Recommended" tab (AI Insight panel) | Task | Member 1 | 5 | High | ✅ DONE | 2-col: AI explanation + seat impact | alignment breakdown bars + career tags |
| 10.7 | Build course detail API (`GET /api/courses/:id`) | Task | Member 2 | 3 | High | ✅ DONE | Course detail endpoint implemented over normalized dataset |

**Epic Subtotal:** 29 pts | **Done:** 29 | **Pending:** 0

---

## EPIC 11: Course Comparison
**Jira Key:** EF-COMPARE | **Bucket:** ⚖️ Compare | **Sprint:** S4

| ID | Title | Type | Assignee | Points | Priority | Status | Notes |
|----|-------|------|----------|--------|----------|--------|-------|
| 11.1 | As a student, I can compare up to 3 electives side by side | Story | Member 1 | 8 | High | ✅ DONE | ComparePage shows 3 courses in a grid |
| 11.2 | Build comparison header cards (match donut, course name, code) | Task | Member 1 | 3 | High | ✅ DONE | Card per course with amber top border, MatchBadge, Cormorant name, mono code |
| 11.3 | Build comparison table rows (8 metrics with alternating bg) | Task | Member 1 | 5 | High | ✅ DONE | Credits, Difficulty, Seats, Match Score, Rating, Credits, Weekly Load, Assessment |
| 11.4 | Highlight best values per row (amber text + ▲ icon) | Task | Member 1 | 2 | Medium | ✅ DONE | bestIdx function highlights max values |
| 11.5 | Build add/remove course from comparison logic | Task | Member 1 | 3 | High | ❌ PENDING | Currently shows all 3 hardcoded courses |
| 11.6 | Build comparison data API (`GET /api/compare?courses=X,Y,Z`) | Task | Member 2 | 3 | High | ✅ DONE | Compare endpoint implemented and now consumed by compare UI |

**Epic Subtotal:** 24 pts | **Done:** 21 | **Pending:** 3

---

## EPIC 12: My Electives
**Jira Key:** EF-ELECTIVES | **Bucket:** 📚 My Electives | **Sprint:** S4

| ID | Title | Type | Assignee | Points | Priority | Status | Notes |
|----|-------|------|----------|--------|----------|--------|-------|
| 12.1 | As a student, I can view my elective history and progress | Story | Member 1 | 5 | High | ✅ DONE | MyElectivesPage with all sections |
| 12.2 | Build summary bar (3 cards: Credits Earned: 10, Completed: 2, Ongoing: 1) | Task | Member 1 | 2 | High | ✅ DONE | 3-column grid with Cormorant amber values |
| 12.3 | Build elective history cards (status icon, course name, tags, grade, star rating) | Task | Member 1 | 5 | High | ✅ DONE | 3 cards: ✓ green (completed) or ⏳ amber (ongoing), grade display, star ratings |
| 12.4 | Build "Recommendation History" timeline | Task | Member 1 | 3 | Medium | ✅ DONE | 3 entries: Sep 2024, Mar 2024, Oct 2023 with mono amber dates |
| 12.5 | Build electives CRUD API (`GET/POST /api/electives`) | Task | Member 2 | 5 | High | ✅ DONE | Electives GET/POST endpoints implemented |
| 12.6 | Design `enrollments` DB schema | Task | Member 2 | 3 | High | 🔶 PARTIAL | JSON collection schema implemented; DB migration pending |

**Epic Subtotal:** 23 pts | **Done:** 20 | **Partial:** 3 | **Pending:** 0

---

## EPIC 13: Community Hub
**Jira Key:** EF-COMMUNITY | **Bucket:** 💬 Community | **Sprint:** S5

| ID | Title | Type | Assignee | Points | Priority | Status | Notes |
|----|-------|------|----------|--------|----------|--------|-------|
| 13.1 | As a student, I can browse course-specific discussion threads | Story | Member 1 | 5 | High | ✅ DONE | CommunityPage with 3 threads, filters, sort buttons |
| 13.2 | As a student, I can create a new discussion post | Story | Member 2 | 5 | High | 🔶 PARTIAL | Modal UI built, no backend persistence |
| 13.3 | As a student, I can upvote posts and reply to threads | Story | Member 2 | 5 | Medium | 🔶 PARTIAL | Upvote button + reply count shown, no functionality |
| 13.4 | Build course filter tabs (All Courses, CS601-ML, CS514-HCI, CS622-Blockchain) | Task | Member 1 | 3 | High | ✅ DONE | Row of teal tag buttons |
| 13.5 | Build sort filters (Latest, Top, Unanswered) | Task | Member 1 | 2 | Medium | ✅ DONE | 3 ghost buttons aligned right |
| 13.6 | Build thread card (upvote section, course tag, hashtags, title, body, author, reply count) | Task | Member 1 | 5 | High | ✅ DONE | Full card: ▲ button + count, tags, title, preview text, avatar + name, "💬 X Replies" |
| 13.7 | Build "+ New Post" modal (course dropdown, title input, body textarea) | Task | Member 1 | 3 | High | ✅ DONE | Overlay modal with blur backdrop, form fields, Cancel + Post buttons |
| 13.8 | Build community CRUD API (posts, replies, upvotes) | Task | Member 2 | 8 | High | ✅ DONE | Posts/replies/upvotes endpoints implemented |
| 13.9 | Design `posts` and `replies` DB schema | Task | Member 2 | 3 | High | 🔶 PARTIAL | JSON collection schemas implemented; DB migration pending |

**Epic Subtotal:** 39 pts | **Done:** 26 | **Partial:** 13 | **Pending:** 0

---

## EPIC 14: Testing & QA
**Jira Key:** EF-QA | **Bucket:** ✅ Testing & QA | **Sprint:** S5-S6

| ID | Title | Type | Assignee | Points | Priority | Status | Notes |
|----|-------|------|----------|--------|----------|--------|-------|
| 14.1 | Write unit tests for auth module | Task | Member 2 | 3 | High | ❌ PENDING | |
| 14.2 | Write unit tests for recommendation engine | Task | Member 3 | 5 | High | ❌ PENDING | |
| 14.3 | Write integration tests for API endpoints | Task | Member 2 | 5 | High | ❌ PENDING | |
| 14.4 | Frontend component testing | Task | Member 1 | 5 | Medium | ❌ PENDING | |
| 14.5 | End-to-end testing (questionnaire → recommendation flow) | Task | Member 3 | 5 | Highest | ❌ PENDING | |
| 14.6 | Cross-browser / responsive testing | Task | Member 1 | 3 | Medium | ❌ PENDING | |
| 14.7 | Performance & load testing | Task | Member 3 | 3 | Medium | ❌ PENDING | |

**Epic Subtotal:** 29 pts | **Done:** 0 | **Pending:** 29

---

## EPIC 15: Deployment & Polish
**Jira Key:** EF-DEPLOY | **Bucket:** 🚀 Deployment | **Sprint:** S6

| ID | Title | Type | Assignee | Points | Priority | Status | Notes |
|----|-------|------|----------|--------|----------|--------|-------|
| 15.1 | Set up production deployment (Vercel/AWS/Railway) | Task | Member 3 | 5 | Highest | ❌ PENDING | |
| 15.2 | Configure production database | Task | Member 2 | 3 | Highest | ❌ PENDING | |
| 15.3 | Set up environment variables for production | Task | Member 3 | 2 | Highest | ❌ PENDING | |
| 15.4 | Final UI polish & animation pass | Task | Member 1 | 5 | High | ❌ PENDING | Animations exist but need perf review |
| 15.5 | SEO & meta tags for landing page | Task | Member 1 | 2 | Low | ❌ PENDING | |
| 15.6 | Write README & documentation | Task | All | 3 | High | ❌ PENDING | Basic README exists |
| 15.7 | Demo preparation | Task | All | 3 | Highest | ❌ PENDING | |

**Epic Subtotal:** 23 pts | **Done:** 0 | **Pending:** 23

---

## EPIC 16: Frontend Refactoring (NEW — not in original plan)
> **This epic is critical.** The entire frontend is in a single 1,600-line file with inline styles. Before API integration, it needs refactoring.

**Jira Key:** EF-REFACTOR | **Bucket:** 🔧 Setup & Infra | **Sprint:** S2

| ID | Title | Type | Assignee | Points | Priority | Status | Notes |
|----|-------|------|----------|--------|----------|--------|-------|
| 16.1 | Split ElectiFind.jsx into separate page components | Task | Member 1 | 5 | Highest | ✅ DONE | App shell retained in `src/ElectiFind.jsx`; page/component module extracted to `src/pages/index.jsx` |
| 16.2 | Extract reusable components (MatchBadge, SeatBar, Stars, CourseCard, FloatingInput, etc.) | Task | Member 1 | 3 | High | ❌ PENDING | |
| 16.3 | Migrate inline styles to Tailwind CSS | Task | Member 1 | 8 | High | ❌ PENDING | All styling is inline JS objects |
| 16.4 | Set up React Router for page navigation | Task | Member 1 | 3 | Highest | ✅ DONE | BrowserRouter + URL-based page navigation with guarded routes implemented |
| 16.5 | Set up global state management (Context/Zustand) | Task | Member 1 | 3 | High | ❌ PENDING | |
| 16.6 | Replace hardcoded data with API service layer | Task | Member 1 | 5 | Highest | ❌ PENDING | courses[], threads[], etc. are JS constants |

**Epic Subtotal:** 27 pts | **Done:** 8 | **Pending:** 19

---

## SPRINT BREAKDOWN

### Sprint 1 (Weeks 1–2): Foundation
**Goal:** Users can see landing page, register, and log in

| Task ID | Title | Assignee | Status |
|---------|-------|----------|--------|
| 1.1 | Initialize frontend (React + Vite) | Member 1 | ✅ DONE |
| 1.2 | Initialize backend project | Member 2 | ✅ DONE |
| 1.3 | Database schema design | Member 2 | ❌ PENDING |
| 1.4 | Git repo + branching + CI/CD | Member 3 | 🔶 PARTIAL |
| 1.5 | Dev environment setup | All | ✅ DONE |
| 1.6 | Design system (tokens, typography, components) | Member 1 | ✅ DONE |
| 1.7 | ML/AI project structure | Member 3 | 🔶 PARTIAL |
| 2.4 | Auth UI (login/signup page) | Member 1 | ✅ DONE |
| 2.5 | JWT/session auth middleware | Member 2 | ✅ DONE |
| 2.6 | Registration API | Member 2 | ✅ DONE |
| 2.7 | Login API | Member 2 | ✅ DONE |
| 3.1 | Hero section | Member 1 | ✅ DONE |
| 3.2 | Navbar | Member 1 | ✅ DONE |
| 3.3 | Capabilities section | Member 1 | ✅ DONE |
| 5.7 | Users DB schema | Member 2 | 🔶 PARTIAL |

**Sprint 1 Status: 11/15 done, 3 partial, 1 pending**

---

### Sprint 2 (Weeks 3–4): Profile & Questionnaire
**Goal:** Users can fill profile and complete full questionnaire

| Task ID | Title | Assignee | Status |
|---------|-------|----------|--------|
| 3.4 | "How It Works" section | Member 1 | ✅ DONE |
| 3.5 | Testimonials section | Member 1 | ✅ DONE |
| 3.6 | CTA + Footer | Member 1 | ✅ DONE |
| 4.1 | Sidebar with 7 nav items | Member 1 | ✅ DONE |
| 4.2 | Active page indicator | Member 1 | ✅ DONE |
| 4.3 | Sidebar user footer | Member 1 | ✅ DONE |
| 4.4 | Top header bar | Member 1 | ✅ DONE |
| 5.1 | View profile page | Member 1 | ✅ DONE |
| 5.3 | Profile header card | Member 1 | ✅ DONE |
| 5.4 | Profile info grid | Member 1 | ✅ DONE |
| 5.5 | Interests tags | Member 1 | ✅ DONE |
| 5.6 | Profile CRUD API | Member 2 | ✅ DONE |
| 6.2 | Questionnaire question design | Member 3 | ✅ DONE |
| 6.3 | Step progress bar | Member 1 | ✅ DONE |
| 6.4 | Multiple-choice UI | Member 1 | ✅ DONE |
| 6.5 | Slider question UI | Member 1 | ✅ DONE |
| 6.6 | Skill-rating UI | Member 1 | ✅ DONE |
| 6.7 | Scenario question UI | Member 1 | ✅ DONE |
| 6.8 | Back/Next navigation | Member 1 | ✅ DONE |
| 6.9 | Completion screen | Member 1 | ✅ DONE |
| 6.10 | Questionnaire API | Member 2 | ✅ DONE |
| 6.12 | Questionnaire DB schema | Member 2 | 🔶 PARTIAL |
| 7.1 | Course dataset schema | Member 3 | 🔶 PARTIAL |
| 16.1 | Split into separate components | Member 1 | ✅ DONE |
| 16.4 | React Router setup | Member 1 | ✅ DONE |

**Sprint 2 Status: 23/25 done, 2 partial, 0 pending**

---

### Sprint 3 (Weeks 5–6): AI Engine & Recommendations
**Goal:** Questionnaire responses generate AI recommendations shown on dashboard

| Task ID | Title | Assignee | Status |
|---------|-------|----------|--------|
| 7.3 | Recommendation algorithm | Member 3 | ✅ DONE |
| 7.4 | Match score calculation | Member 3 | ✅ DONE |
| 7.5 | Seat availability scoring | Member 3 | ✅ DONE |
| 7.6 | Explainability module | Member 3 | ✅ DONE |
| 7.7 | Recommendations API | Member 2 | ✅ DONE |
| 8.1 | View top 3 matches | Member 1 | ✅ DONE |
| 8.2 | Recommendation card UI | Member 1 | ✅ DONE |
| 8.3 | TOP PICK badge | Member 1 | ✅ DONE |
| 8.4 | Match donut chart | Member 1 | ✅ DONE |
| 8.5 | Seat bar component | Member 1 | ✅ DONE |
| 8.6 | Sort controls | Member 1 | ✅ DONE |
| 8.7 | Action buttons | Member 1 | ✅ DONE |
| 8.8 | Connect recs UI to API | Member 1 | ✅ DONE |
| 9.1 | Dashboard page | Member 1 | ✅ DONE |
| 9.2 | Greeting banner | Member 1 | ✅ DONE |
| 9.3 | 4 stat cards | Member 1 | ✅ DONE |
| 9.4 | Top recs compact list | Member 1 | ✅ DONE |
| 9.5 | Dashboard API | Member 2 | ✅ DONE |
| 10.1-10.6 | Course detail page (all tabs) | Member 1 | ✅ DONE |
| 10.7 | Course detail API | Member 2 | ✅ DONE |

**Sprint 3 Status: 20/20 done, 0 pending**

---

### Sprint 4 (Weeks 7–8): Compare, Electives, Search
**Goal:** Full compare flow and elective tracking working

| Task ID | Title | Assignee | Status |
|---------|-------|----------|--------|
| 4.5 | Global search functionality | Member 2 | 🔶 PARTIAL |
| 4.6 | Responsive sidebar | Member 1 | ❌ PENDING |
| 7.8 | Recommendation history tracking | Member 2 | ❌ PENDING |
| 7.9 | MLflow integration | Member 3 | ❌ PENDING |
| 11.1 | Compare page (story) | Member 1 | ✅ DONE |
| 11.2 | Compare header cards | Member 1 | ✅ DONE |
| 11.3 | Compare table rows | Member 1 | ✅ DONE |
| 11.4 | Best value highlighting | Member 1 | ✅ DONE |
| 11.5 | Add/remove comparison logic | Member 1 | ❌ PENDING |
| 11.6 | Compare API | Member 2 | ✅ DONE |
| 12.1 | My Electives page (story) | Member 1 | ✅ DONE |
| 12.2 | Summary bar | Member 1 | ✅ DONE |
| 12.3 | Elective history cards | Member 1 | ✅ DONE |
| 12.4 | Recommendation history timeline | Member 1 | ✅ DONE |
| 12.5 | Electives API | Member 2 | ✅ DONE |
| 12.6 | Enrollments DB schema | Member 2 | 🔶 PARTIAL |
| 13.9 | Posts/replies DB schema | Member 2 | 🔶 PARTIAL |

**Sprint 4 Status: 10/17 done, 3 partial, 4 pending**

---

### Sprint 5 (Weeks 9–10): Community & Testing
**Goal:** Community hub live; core test coverage

| Task ID | Title | Assignee | Status |
|---------|-------|----------|--------|
| 13.1 | Browse discussion threads | Member 1 | ✅ DONE |
| 13.4 | Course filter tabs | Member 1 | ✅ DONE |
| 13.5 | Sort filters | Member 1 | ✅ DONE |
| 13.6 | Thread card UI | Member 1 | ✅ DONE |
| 13.7 | New Post modal | Member 1 | ✅ DONE |
| 13.8 | Community CRUD API | Member 2 | ✅ DONE |
| 6.11 | Save partial questionnaire progress | Member 2 | ✅ DONE |
| 14.1 | Auth unit tests | Member 2 | ❌ PENDING |
| 14.2 | AI/ML unit tests | Member 3 | ❌ PENDING |
| 14.3 | API integration tests | Member 2 | ❌ PENDING |
| 14.4 | Frontend component tests | Member 1 | ❌ PENDING |

**Sprint 5 Status: 7/11 done, 4 pending**

---

### Sprint 6 (Weeks 11–12): Polish & Deploy
**Goal:** Production-ready deployment, demo-able product

| Task ID | Title | Assignee | Status |
|---------|-------|----------|--------|
| 14.5 | E2E testing | Member 3 | ❌ PENDING |
| 14.6 | Cross-browser testing | Member 1 | ❌ PENDING |
| 14.7 | Performance testing | Member 3 | ❌ PENDING |
| 15.1 | Production deployment | Member 3 | ❌ PENDING |
| 15.2 | Production database | Member 2 | ❌ PENDING |
| 15.3 | Production env vars | Member 3 | ❌ PENDING |
| 15.4 | Final UI polish | Member 1 | ❌ PENDING |
| 15.5 | SEO & meta tags | Member 1 | ❌ PENDING |
| 15.6 | README & docs | All | ❌ PENDING |
| 15.7 | Demo preparation | All | ❌ PENDING |

**Sprint 6 Status: 0/10 done, 10 pending**

---

## OVERALL PROGRESS SUMMARY

| Metric | Value |
|--------|-------|
| Done | 321 pts |
| Partial | 51 pts |
| Pending | 90 pts |
| Total Planned | 462 pts |

**Overall: ~69% done, ~11% partial, ~19% pending (based on all epic subtotals above).**

---

## API ENDPOINTS REFERENCE

| Method | Endpoint | Status |
|--------|----------|--------|
| POST | `/api/auth/register` | ✅ |
| POST | `/api/auth/login` | ✅ |
| POST | `/api/auth/forgot-password` | ✅ |
| GET | `/api/profile` | ✅ |
| PUT | `/api/profile` | ✅ |
| POST | `/api/questionnaire` | ✅ |
| PUT | `/api/questionnaire/:id` | ✅ |
| GET | `/api/questionnaire/status` | ✅ |
| GET | `/api/recommendations` | ✅ |
| GET | `/api/recommendations/:id/explain` | ✅ |
| GET | `/api/dashboard` | ✅ |
| GET | `/api/compare?courses=X,Y,Z` | ✅ |
| GET | `/api/courses/search?q=keyword` | ✅ |
| GET | `/api/courses/:id` | ✅ |
| GET | `/api/electives` | ✅ |
| POST | `/api/electives` | ✅ |
| GET | `/api/posts` | ✅ |
| POST | `/api/posts` | ✅ |
| POST | `/api/posts/:id/reply` | ✅ |
| POST | `/api/posts/:id/upvote` | ✅ |

---

## DATABASE TABLES REFERENCE

```
users           → id, name, email, password_hash, roll_no, department, batch, semester, advisor, interests[], created_at
questionnaires  → id, user_id, version, responses_json, completed, step, created_at, updated_at
courses         → id, code, name, credits, difficulty, professor, tags[], seats_total, seats_filled, rating, weekly_hours, assessment_type
recommendations → id, user_id, questionnaire_id, course_id, match_score, explanation, created_at
enrollments     → id, user_id, course_id, semester, status, grade, rating, created_at
posts           → id, user_id, course_id, title, body, tags[], upvotes, created_at
replies         → id, post_id, user_id, body, created_at
```

All tables: 🔶 PARTIAL (implemented as JSON collections; migration to PostgreSQL/MongoDB pending)
