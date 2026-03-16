# ElectiFind

ElectiFind is a full-stack elective recommendation platform with:

- JWT authentication
- questionnaire-based recommendation engine
- explainable score breakdowns
- seat-aware ranking
- comparison, community, and electives tracking pages

Current deployment status:

- Azure App Service is live
- Render deployment config is also available

## Tech Stack

- Frontend: React + Vite + React Router
- Backend: Node.js + Express
- Security: Helmet + CORS allowlist + rate limiting
- Persistence: JSON data store (`backend/data/db.json`) and dataset file (`electives_dataset.json`)
- Testing: Vitest + Supertest + Testing Library
- Cloud: Azure App Service (active), Render (supported)

## Project Structure

- `src/` frontend app
- `backend/src/server.js` API server
- `backend/tests/` backend tests
- `electives_dataset.json` courses dataset

## Local Development

1. Install dependencies:

```bash
npm ci
```

2. Run frontend + backend together:

```bash
npm run dev:full
```

3. Or run them separately:

```bash
npm run dev      # frontend on Vite
npm run dev:api  # backend API
```

## Production Build and Run

Build frontend assets:

```bash
npm run build
```

Start server in production mode:

```bash
npm run start
```

The backend serves API routes under `/api/*` and also serves the built frontend from `dist/`.

## Environment Variables

- `PORT` (default: `4000`)
- `JWT_SECRET` (required in production)
- `DB_PATH` (default: `backend/data/db.json`)
- `DATASET_PATH` (default: `electives_dataset.json`)
- `FRONTEND_DIST_PATH` (default: `dist`)
- `CORS_ORIGIN` (optional comma-separated allowlist, e.g. `https://electifind.app`)
- `API_RATE_LIMIT_MAX` (optional, default `300` per 15 minutes)
- `AUTH_RATE_LIMIT_MAX` (optional, default `20` per 15 minutes)
- `MLFLOW_TRACKING_URI` (optional)
- `MLFLOW_EXPERIMENT_ID` (optional, default `0`)
- `RENDER_DEPLOY_HOOK_URL` (optional, for Bitbucket manual deploy pipeline)

Security-related environment variables:

- `CORS_ORIGIN` limits browser origins in production
- `API_RATE_LIMIT_MAX` controls global API request limit window
- `AUTH_RATE_LIMIT_MAX` controls stricter auth endpoint limits

## Testing

Unit + integration suite:

```bash
npm run test
```

End-to-end questionnaire to recommendation flow:

```bash
npm run test:e2e
```

Performance smoke test (API latency check):

```bash
# start API first in another terminal
npm run dev:api

# then run
npm run test:perf
```

Optional perf env vars:

- `PERF_API_BASE` (default `http://localhost:4000`)
- `PERF_ITERATIONS` (default `30`)
- `PERF_WARN_MS` (default `350`)

Initialize or validate production DB schema:

```bash
npm run db:prod:init
```

Demo preflight (build + tests + e2e):

```bash
npm run demo:prep
```

## Deployment

### Azure App Service (Live)

Active Azure resources:

- Resource Group: `electifind-rg`
- App Service Plan: `electifind-plan`
- Web App: `electifind-1773634591`
- App URL: `https://electifind-1773634591.azurewebsites.net`
- Health URL: `https://electifind-1773634591.azurewebsites.net/api/health`

Typical Azure deployment flow:

1. Select subscription:

```bash
az account set --subscription "Azure for Students"
```

2. Provision resources:

```bash
az group create --name electifind-rg --location centralindia
az appservice plan create --name electifind-plan --resource-group electifind-rg --is-linux --sku B1
az webapp create --resource-group electifind-rg --plan electifind-plan --name electifind-<unique-suffix> --runtime "NODE|20-lts"
```

3. Configure app settings and startup:

```bash
az webapp config appsettings set --resource-group electifind-rg --name electifind-<unique-suffix> --settings NODE_ENV=production PORT=8080 JWT_SECRET=<secret> DB_PATH=/home/site/data/db.json FRONTEND_DIST_PATH=dist DATASET_PATH=electives_dataset.json CORS_ORIGIN=https://electifind-<unique-suffix>.azurewebsites.net API_RATE_LIMIT_MAX=300 AUTH_RATE_LIMIT_MAX=20 SCM_DO_BUILD_DURING_DEPLOYMENT=false
az webapp config set --resource-group electifind-rg --name electifind-<unique-suffix> --startup-file "npm run start"
```

4. Deploy package:

```bash
az webapp deploy --resource-group electifind-rg --name electifind-<unique-suffix> --src-path <zip-package> --type zip --restart true --clean true
```

5. Verify:

```bash
curl -s https://electifind-<unique-suffix>.azurewebsites.net/api/health
```

### Docker

```bash
docker build -t electifind .
docker run -p 4000:4000 -e JWT_SECRET=change-me electifind
```

### Render

`render.yaml` is included for one-service deployment.

Production DB is configured to use a persistent disk mounted at `/var/data`, with `DB_PATH=/var/data/db.json`.

Required secret env var:

- `JWT_SECRET`

## CI/CD

### Bitbucket Pipelines

`bitbucket-pipelines.yml` runs install, tests, and frontend build on every push.

Manual deployment stage (Render webhook):

1. Add `RENDER_DEPLOY_HOOK_URL` as a secured repository variable.
2. In Bitbucket Pipelines, run custom pipeline `deploy-render`.
3. The pipeline sends a POST request to Render deploy hook and fails if hook is missing.

### Jenkins

This repository includes a declarative pipeline at `Jenkinsfile` with these stages:

1. Checkout
2. Install dependencies (`npm ci`)
3. Test suite (`npm run test`)
4. Frontend build (`npm run build`)
5. Docker image build (`docker build`)
6. Optional docker push (when `DOCKER_REGISTRY` and `DOCKER_CREDENTIALS_ID` are configured)
7. Optional deploy hook trigger (when `DEPLOY_HOOK_URL` is configured)

Recommended Jenkins configuration:

- Jenkins agent with Node.js and Docker installed
- Pipeline from SCM pointing to this repo
- Optional credentials for container registry (`DOCKER_CREDENTIALS_ID`)
- Optional environment variable: `DEPLOY_HOOK_URL`

## Documentation Note

Review/PRD/diagram draft documents are intentionally kept local and are not tracked in this repository.