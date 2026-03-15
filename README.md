# ElectiFind

ElectiFind is a full-stack elective recommendation platform with:

- JWT authentication
- questionnaire-based recommendation engine
- explainable score breakdowns
- seat-aware ranking
- comparison, community, and electives tracking pages

## Tech Stack

- Frontend: React + Vite + React Router
- Backend: Node.js + Express
- Persistence: JSON data store (`backend/data/db.json`) and dataset file (`electives_dataset.json`)
- Testing: Vitest + Supertest + Testing Library

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
- `MLFLOW_TRACKING_URI` (optional)
- `MLFLOW_EXPERIMENT_ID` (optional, default `0`)

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

## Deployment

### Docker

```bash
docker build -t electifind .
docker run -p 4000:4000 -e JWT_SECRET=change-me electifind
```

### Render

`render.yaml` is included for one-service deployment.

Required secret env var:

- `JWT_SECRET`

## CI

`bitbucket-pipelines.yml` runs install, tests, and frontend build on every push.