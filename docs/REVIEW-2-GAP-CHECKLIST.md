# Review 2 Gap Checklist (Implementation & Engineering)

## 1) Functional Implementation (6)
Current status: Strong
- Auth, questionnaire, recommendations, compare, community, profile, electives are implemented.
- Tests and build scripts are present.

Pending to maximize marks:
- Prepare a strict demo flow with one new-user journey and one returning-user journey.
- Keep one short bug log or known-issues note with fixes done.

## 2) Cloud & Hyperscaler Usage (4)
Current status: Partial
- Deployment config exists for Render with persistent disk.
- This may not fully satisfy explicit AWS/Azure/GCP usage requirement depending on evaluator.

Pending (high priority):
- Add one concrete hyperscaler story:
  - Option A: Azure App Service/Container Apps + managed storage.
  - Option B: AWS Elastic Beanstalk/ECS + EBS/S3.
  - Option C: GCP Cloud Run + Cloud Storage.
- Add architecture page section showing exact cloud resources used and why.

## 3) Data / ML / AI Workflow (4)
Current status: Partial-to-good
- Recommendation scoring workflow exists.
- Optional MLflow tracking integration exists via environment variable.

Pending (high priority):
- Add a simple pipeline evidence:
  - data source -> feature/scoring logic -> output recommendations -> tracking/metrics.
- Capture one screenshot/log where MLFLOW_TRACKING_URI is enabled and a run is recorded.
- Add short model-evaluation note (even rule-based): top score, avg score, latency.

## 4) DevOps Practices (3)
Current status: Good
- Dockerfile present.
- CI pipeline present in Bitbucket pipeline.

Pending to maximize marks:
- Add deployment stage/job (or document manual deploy pipeline).
- Add one architecture/deployment diagram for CI/CD flow.
- Keep one successful pipeline run screenshot.

## 5) Security Implementation (3)
Current status: Good baseline
- JWT auth, bcrypt hashing, protected APIs.

Pending to maximize marks:
- Add basic hardening items:
  - CORS allowlist by env in production.
  - Request rate limiting on auth endpoints.
  - Security headers (helmet).
- Add one-page threat handling note (token expiry, brute-force mitigation, validation).

## Fastest Path to 16+/20
1. Provide cloud mapping slide with explicit AWS/Azure/GCP services.
2. Show ML workflow evidence (tracked run + metrics snapshot).
3. Show CI run + Docker build proof.
4. Mention 2-3 security hardening controls and where they are implemented.

## Viva Talking Points (45-60 sec each)
- Functional: Why this solves elective-selection pain.
- Cloud: Which managed services were chosen and tradeoffs.
- ML: How recommendations are computed and monitored.
- DevOps: Build/test/deploy path and rollback thought.
- Security: Auth, hashing, token handling, abuse prevention.
