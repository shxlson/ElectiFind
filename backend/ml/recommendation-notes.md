# ElectiFind Recommendation Engine Notes

This folder is the initial ML/AI workspace for Sprint 1.

Current implementation is a deterministic hybrid score in backend/src/server.js based on:
- questionnaire focus and career responses
- math comfort level
- seat availability
- course rating

Planned next steps (Sprint 3):
- move scoring to a dedicated service module
- add historical feedback loop from enrollments + ratings
- version recommendation strategies
- integrate experiment tracking (MLflow)
