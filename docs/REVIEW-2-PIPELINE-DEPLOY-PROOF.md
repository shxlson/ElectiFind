# Review 2 Pipeline and Deployment Evidence

Date: 2026-03-16

## CI Pipeline Proof
Bitbucket pipeline configuration includes:
- Test stage
- Build stage
- Manual deploy stage

Reference: bitbucket-pipelines.yml

## Successful Build/Test Evidence (Run Locally, Same Commands as CI)
- npm run test: PASS
  - Test Files: 4 passed
  - Tests: 6 passed
- npm run build: PASS
  - Vite build completed successfully

These are the exact commands in the default Bitbucket pipeline steps and demonstrate the pipeline path is healthy.

## Deploy Stage Evidence
A manual deploy stage was added:
- Custom pipeline name: deploy-render
- Behavior:
  - Validates RENDER_DEPLOY_HOOK_URL exists
  - Sends POST to deploy hook
  - Fails fast if URL is missing

This provides auditable deployment orchestration in CI/CD.

## Manual Deployment Runbook (if deploy hook is unavailable)
1. Build image:
   - docker build -t electifind .
2. Push image to registry (example: Azure Container Registry):
   - az acr login --name <acr-name>
   - docker tag electifind <acr-name>.azurecr.io/electifind:review2
   - docker push <acr-name>.azurecr.io/electifind:review2
3. Deploy container to host/service:
   - Update service image tag
   - Ensure env vars: JWT_SECRET, DB_PATH, DATASET_PATH, CORS_ORIGIN
4. Validate deployment:
   - GET /api/health returns { ok: true }
   - Login and recommendation workflow smoke test

## Suggested Demo Callout
- Show Bitbucket YAML with three stages.
- Show test/build logs.
- Show deploy-render custom stage script.
