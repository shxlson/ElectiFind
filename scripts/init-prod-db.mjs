import fs from "fs";
import path from "path";

const dbPath = path.resolve(process.cwd(), process.env.DB_PATH || "backend/data/db.json");

const defaultDb = {
  users: [],
  questionnaires: [],
  recommendations: [],
  enrollments: [],
  posts: [],
  replies: [],
  passwordResetRequests: [],
  recommendationHistory: [],
  mlflowRuns: []
};

const dir = path.dirname(dbPath);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

if (!fs.existsSync(dbPath)) {
  fs.writeFileSync(dbPath, JSON.stringify(defaultDb, null, 2));
  console.log(`Created production DB at ${dbPath}`);
  process.exit(0);
}

const raw = fs.readFileSync(dbPath, "utf8");
const parsed = JSON.parse(raw);
const merged = { ...defaultDb, ...parsed };
fs.writeFileSync(dbPath, JSON.stringify(merged, null, 2));

console.log(`Validated production DB schema at ${dbPath}`);
