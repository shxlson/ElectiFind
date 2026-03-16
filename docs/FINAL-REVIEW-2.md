# ElectiFind Final Review 2 Document

## Implementation and Engineering Deliverables

### 1. Functional Implementation
Implemented and working:
- Auth, profile, questionnaire, recommendations, compare, community, electives, dashboard.
- Dynamic profile identity rendering in app navigation.
- No static recommendation fallback for new users.
- Dynamic dashboard credits from real enrollments.

Validation:
- Test suite passed
- Production build passed

### 2. Cloud and Hyperscaler Usage
Actual cloud deployment completed on Azure App Service.

Deployed resources:
- Subscription: Azure for Students
- Resource Group: electifind-rg
- App Service Plan: electifind-plan
- Web App: electifind-1773634591
- Live URL: https://electifind-1773634591.azurewebsites.net
- Health URL: https://electifind-1773634591.azurewebsites.net/api/health

Cloud runtime evidence:
- Health endpoint repeatedly returned: {"ok":true,"service":"electifind-api"}

Note: Use your Eraser AI cloud architecture diagram in viva.

### 3. Data / ML / AI Workflow
End-to-end flow implemented:
1. Questionnaire input saved
2. Rule-based scoring + ranking computed
3. Top recommendations returned
4. Metrics persisted in recommendation history and mlflowRuns

Workflow proof captured using live API run logs.

### 4. DevOps Practices
- Dockerfile present for containerized runtime
- Bitbucket pipeline has test and build stages
- Manual deploy pipeline stage added (deploy-render webhook)
- Azure deployment performed via Azure CLI (App Service deployment)

### 5. Security Implementation
Hardening applied:
- Helmet security middleware
- API-level rate limiting
- Strict auth endpoint rate limiting
- Env-based CORS allowlist for production
- JWT + bcrypt authentication baseline

## Viva Pointers (Concise)
- Functional: Show full flow from login to recommendations.
- Cloud: Show Azure portal resources and live health endpoint.
- ML: Explain questionnaire -> scoring -> recommendation pipeline.
- DevOps: Show CI steps and deployment command path.
- Security: Explain hardening controls and why they were added.

## Mandatory Screenshots to Include in Report
1. Azure resource group and app service overview
2. Live app URL and health endpoint output
3. Recommendation screen after questionnaire
4. Bitbucket pipeline configuration/runs
5. Security config references in code
