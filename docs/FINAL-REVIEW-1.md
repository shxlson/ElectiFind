# ElectiFind Final Review 1 Document

## Project Details
- Course: 21IPE315P - Cloud Product and Platform Engineering
- Project: ElectiFind - AI Elective Recommendation Platform
- Team ID: Fill before submission

## Problem Relevance and Clarity
Students struggle to choose electives because information is scattered and decisions are often based on incomplete context.

ElectiFind addresses this by combining:
- questionnaire-based personalization,
- explainable recommendation scores,
- seat-availability awareness,
- peer discussion support.

## Product Scope Delivered for Review 1
- Authentication and profile management
- Questionnaire capture and status tracking
- Recommendation generation with score breakdown
- Dashboard and recommendation views
- Compare view
- Community posts/replies/upvotes
- My Electives tracking

## Architecture Summary
System components:
- Frontend: React + Vite
- Backend: Node.js + Express
- Auth: JWT
- Data: JSON persistence and elective dataset file
- Deployment-ready container and CI pipeline

Note: Use your Eraser AI cloud architecture diagram during presentation.

## Agile Plan and Backlog
### Epics
1. Identity and access
2. Recommendation intelligence
3. Decision support UX
4. Community and tracking

### Sprint Snapshot
- Sprint 1: Auth + profile + API baseline
- Sprint 2: Questionnaire + recommendation engine + dashboard
- Sprint 3: Compare + community + electives + test hardening

## Security and Reliability (Baseline)
- Password hashing with bcrypt
- JWT-protected APIs
- Health endpoint for service checks
- API error handling and protected route handling

## Review 1 Demo Flow
1. Login/Register
2. Open dashboard
3. Complete questionnaire
4. Show top recommendations
5. Show compare and community pages

## Review 1 Submission Checklist
- Problem statement and objective explained
- Scope and implemented features shown
- Agile backlog and sprint progress shown
- Security/reliability baseline explained
- Architecture diagram shown (Eraser AI)
