# Review 2 Cloud Mapping (Concrete Azure Resources)

This maps ElectiFind to concrete hyperscaler services for review presentation.

## Resource Mapping (Azure)
- Frontend + API hosting: Azure App Service (Linux, Node 20) or Azure Container Apps
- Container registry: Azure Container Registry (if using Docker deployment)
- Persistent data file for current scope: Azure Files mount or Azure Blob Storage mounted via App Service/Container volume
- Secrets and config: Azure Key Vault + App Service environment settings
- Monitoring: Azure Application Insights + Log Analytics
- CI/CD: Bitbucket Pipelines triggering deploy webhook or Azure DevOps/GitHub Actions

## Architecture Diagram
```mermaid
flowchart LR
  U[Student Browser] --> DNS[Azure Front Door or App Service URL]
  DNS --> APP[Azure App Service / Container Apps\nElectiFind Node + Express + React dist]
  APP --> FILE[(Azure Files or Blob-backed storage\ndb.json for project scope)]
  APP --> DATA[(electives_dataset.json)]
  APP --> KV[Azure Key Vault\nJWT_SECRET, CORS, limits]
  APP --> AI[Application Insights\nRequests, failures, latency]
  CI[Bitbucket Pipelines] --> DEPLOY[Deploy Hook / Release]
  DEPLOY --> APP
```

## Request/Processing Flow
```mermaid
sequenceDiagram
  participant User as Student
  participant FE as React Frontend
  participant API as Express API
  participant DS as elective dataset
  participant DB as db.json store
  participant MON as App Insights

  User->>FE: Login and submit questionnaire
  FE->>API: POST /api/questionnaire (JWT)
  API->>DS: Load course metadata
  API->>API: Score and rank recommendations
  API->>DB: Persist questionnaire, recommendations, run metrics
  API->>MON: Emit request telemetry
  FE->>API: GET /api/recommendations and /api/dashboard
  API-->>FE: Top recommendations + score breakdown + stats
```

## Why this is acceptable for Review 2
- Shows concrete hyperscaler services, not generic cloud terms.
- Shows how CI/CD connects to deployment.
- Includes observability and secret management.
- Keeps current project data model while describing upgrade path.

## Upgrade Path (Post-Review)
- Replace db.json with Azure Database for PostgreSQL.
- Store recommendation telemetry in Azure Monitor custom events.
- Add Azure API Management in front of API for policies and throttling.
