# ElectiFind Demo Checklist

## 1. Pre-Demo Setup

- Run `npm ci`
- Run `npm run demo:prep`
- Open two terminals:
  - Terminal A: `npm run dev:api`
  - Terminal B: `npm run dev`
- Open app at `http://localhost:5173`

## 2. Demo Story (Recommended Order)

1. Landing page:
   - show hero, capabilities, and CTA
2. Authentication:
   - create account or sign in
3. Questionnaire:
   - complete steps and submit
4. Recommendations:
   - explainability and seat-aware ranking
5. Course detail:
   - tabs and why-recommended panel
6. Compare:
   - add/remove courses and compare table
7. Community:
   - browse posts, create post, upvote/reply
8. My Electives:
   - history + recommendation timeline

## 3. Backup Plan

- If frontend fails to start: run `npm run build` then `npm run preview`
- If API fails: verify `.env` and run `npm run dev:api`
- If auth token issues occur: sign out and sign back in

## 4. Post-Demo Artifacts

- Capture screenshots of key pages
- Export terminal logs for test/perf runs
- Record follow-up tasks in Jira
