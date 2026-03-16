import express from "express";
import cors from "cors";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";

dotenv.config();
// Express API app setup and middleware wiring.
const app = express();
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

const allowedOrigins = String(process.env.CORS_ORIGIN || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    if (!allowedOrigins.length) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("Origin not allowed by CORS"));
  },
  credentials: true
};

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.API_RATE_LIMIT_MAX || 300),
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path === "/api/health"
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.AUTH_RATE_LIMIT_MAX || 20),
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many authentication attempts. Please try again later." }
});

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));
app.use(cors(corsOptions));
app.use(express.json());
app.use("/api", apiLimiter);
app.use(["/api/auth/register", "/api/auth/login", "/api/auth/forgot-password"], authLimiter);

const PORT = Number(process.env.PORT || 4000);
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";
const DB_PATH = path.resolve(process.cwd(), process.env.DB_PATH || "backend/data/db.json");
const DATASET_PATH = path.resolve(process.cwd(), process.env.DATASET_PATH || "electives_dataset.json");
const FRONTEND_DIST_PATH = path.resolve(process.cwd(), process.env.FRONTEND_DIST_PATH || "dist");
const MLFLOW_TRACKING_URI = process.env.MLFLOW_TRACKING_URI || "";
const MLFLOW_EXPERIMENT_ID = process.env.MLFLOW_EXPERIMENT_ID || "0";

const DEFAULT_DB = {
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

function ensureDbStorage() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify(DEFAULT_DB, null, 2));
    return;
  }

  try {
    const current = JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
    const merged = {
      ...DEFAULT_DB,
      ...current
    };
    fs.writeFileSync(DB_PATH, JSON.stringify(merged, null, 2));
  } catch {
    fs.writeFileSync(DB_PATH, JSON.stringify(DEFAULT_DB, null, 2));
  }
}

ensureDbStorage();

if (fs.existsSync(FRONTEND_DIST_PATH)) {
  app.use(express.static(FRONTEND_DIST_PATH));
}

function normalizeCourse(raw) {
  const totalSeats = Number(raw.intake_limit || 0);
  const filledSeats = Number(raw.current_enrollment || 0);
  const totalHours = Number(raw.total_hours || 0);
  const creditC = Number(raw?.credits?.C || 0);
  const tags = Array.isArray(raw.domain_tags)
    ? raw.domain_tags.map((t) => String(t).toLowerCase())
    : [];
  const tagTokens = normalizeTagTokens(raw.domain_tags || []);
  const units = Array.isArray(raw.units) ? raw.units : [];

  return {
    id: String(raw.course_code),
    code: String(raw.course_code),
    name: String(raw.course_name),
    credits: creditC,
    difficulty: raw.difficulty || "Intermediate",
    professor: "Faculty Assigned by Department",
    tags,
    tag_tokens: tagTokens,
    seats_total: totalSeats,
    seats_filled: filledSeats,
    rating: 4.2,
    weekly_hours: totalHours > 0 ? Math.round(totalHours / 5) : 8,
    assessment_type: raw.course_type || "Theory",
    departments: raw.departments || [],
    topics: raw.topics || [],
    units
  };
}

function normalizeTagTokens(rawTags) {
  const tags = Array.isArray(rawTags) ? rawTags.map((t) => String(t).toLowerCase()) : [];
  const tokens = new Set();

  for (const tag of tags) {
    const normalized = tag.replace(/&/g, " ").replace(/\//g, " ").replace(/[^a-z0-9\s-]/g, " ");
    normalized.split(/\s+/).filter(Boolean).forEach((word) => tokens.add(word));

    if (tag.includes("ai") || tag.includes("machine learning")) ["ml", "ai", "data"].forEach((t) => tokens.add(t));
    if (tag.includes("data science") || tag.includes("analytics")) ["data", "statistics", "ml"].forEach((t) => tokens.add(t));
    if (tag.includes("cloud")) ["cloud", "systems", "backend"].forEach((t) => tokens.add(t));
    if (tag.includes("cybersecurity")) ["security", "crypto", "systems"].forEach((t) => tokens.add(t));
    if (tag.includes("web")) ["web", "frontend", "backend"].forEach((t) => tokens.add(t));
    if (tag.includes("software engineering")) ["software", "systems", "backend"].forEach((t) => tokens.add(t));
    if (tag.includes("mathematics") || tag.includes("theory")) ["math", "theory", "algorithms"].forEach((t) => tokens.add(t));
    if (tag.includes("network")) ["networking", "systems"].forEach((t) => tokens.add(t));
    if (tag.includes("iot") || tag.includes("embedded")) ["iot", "systems"].forEach((t) => tokens.add(t));
    if (tag.includes("blockchain")) ["blockchain", "crypto", "security"].forEach((t) => tokens.add(t));
    if (tag.includes("ar") || tag.includes("vr")) ["design", "hci", "graphics"].forEach((t) => tokens.add(t));
    if (tag.includes("game")) ["game", "design", "graphics"].forEach((t) => tokens.add(t));
    if (tag.includes("nlp") || tag.includes("speech")) ["nlp", "ml"].forEach((t) => tokens.add(t));
    if (tag.includes("robotics")) ["robotics", "systems", "ml"].forEach((t) => tokens.add(t));
    if (tag.includes("business") || tag.includes("marketing")) ["business", "product"].forEach((t) => tokens.add(t));
  }

  return [...tokens];
}

function hasAnyTag(course, wantedTokens) {
  const tokenSet = new Set(Array.isArray(course?.tag_tokens) ? course.tag_tokens : []);
  return wantedTokens.some((token) => tokenSet.has(token));
}

function loadCourses() {
  const raw = JSON.parse(fs.readFileSync(DATASET_PATH, "utf8"));
  return raw.map(normalizeCourse);
}

const COURSES = loadCourses();

function readDb() {
  const raw = fs.readFileSync(DB_PATH, "utf8");
  return JSON.parse(raw);
}

function writeDb(db) {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

function ensureDbCollections(db) {
  if (!Array.isArray(db.recommendationHistory)) {
    db.recommendationHistory = [];
  }
  if (!Array.isArray(db.mlflowRuns)) {
    db.mlflowRuns = [];
  }
}

function seatsLeft(course) {
  return Math.max(course.seats_total - course.seats_filled, 0);
}

function seatScore(course) {
  if (!course?.seats_total) return 0;
  return Math.round((seatsLeft(course) / course.seats_total) * 100);
}

function clampScore(value) {
  if (!Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, Math.round(value)));
}

function contentAlignmentScore(course, focus) {
  if (!focus) return 55;
  if (focus.includes("data") && hasAnyTag(course, ["ml", "data", "statistics"])) return 95;
  if (focus.includes("systems") && hasAnyTag(course, ["systems", "cloud", "backend", "networking", "iot"])) return 90;
  if (focus.includes("security") && hasAnyTag(course, ["security", "crypto", "networking"])) return 92;
  if (focus.includes("design") && hasAnyTag(course, ["frontend", "hci", "design", "graphics"])) return 88;
  if (focus.includes("theory") && hasAnyTag(course, ["algorithms", "theory", "math"])) return 86;
  return 60;
}

function careerAlignmentScore(course, career) {
  if (!career) return 55;
  if (career.includes("data") && hasAnyTag(course, ["ml", "data", "statistics", "nlp"])) return 92;
  if (career.includes("software") && hasAnyTag(course, ["backend", "web", "cloud", "systems"])) return 86;
  if (career.includes("research") && hasAnyTag(course, ["ml", "systems", "security", "theory"])) return 84;
  if (career.includes("product") && hasAnyTag(course, ["frontend", "hci", "design", "business"])) return 78;
  return 58;
}

function skillCompatibilityScore(course, mathComfort, skillAverage) {
  const base = 52 + (skillAverage * 8);
  let modifier = 0;
  if (hasAnyTag(course, ["ml", "crypto", "theory", "math"])) {
    modifier += mathComfort >= 4 ? 10 : mathComfort <= 2 ? -12 : 0;
  }
  if (hasAnyTag(course, ["frontend", "hci", "design", "graphics"])) {
    modifier += mathComfort <= 2 ? 6 : 0;
  }
  return clampScore(base + modifier);
}

function workloadFitScore(course, scenarioChoice) {
  const weekly = Number(course.weekly_hours || 8);
  const normalized = clampScore(100 - Math.max(0, (weekly - 4) * 8));
  if (!scenarioChoice) return normalized;
  const scenario = String(scenarioChoice).toLowerCase();
  if (scenario.includes("manageable") || scenario.includes("gpa")) {
    return clampScore(normalized + (weekly <= 8 ? 10 : -10));
  }
  if (scenario.includes("challenging") || scenario.includes("deep")) {
    return clampScore(normalized + (weekly >= 8 ? 10 : -8));
  }
  return normalized;
}

function popularityScore(course, db) {
  const enrollments = db.enrollments.filter((e) => String(e.course_id) === String(course.id) || String(e.course_id) === String(course.code));
  const reviews = enrollments.filter((e) => Number.isFinite(Number(e.rating))).map((e) => Number(e.rating));
  const avgRating = reviews.length ? reviews.reduce((a, b) => a + b, 0) / reviews.length : Number(course.rating || 4.2);
  const posts = db.posts.filter((p) => String(p.course_id) === String(course.id) || String(p.course_id) === String(course.code));
  const upvotes = posts.reduce((sum, p) => sum + Number(p.upvotes || 0), 0);
  const socialLift = Math.min(20, upvotes / 5);
  const ratingComponent = clampScore((avgRating / 5) * 100);
  return clampScore(ratingComponent + socialLift);
}

function buildScoreBreakdown(course, questionnaire, db) {
  const responses = questionnaire?.responses_json || {};
  const focus = String(responses[1] || "").toLowerCase();
  const career = String(responses[3] || "").toLowerCase();
  const mathComfort = Number(responses[2] || 3);
  const skills = responses[4] && typeof responses[4] === "object"
    ? Object.values(responses[4]).map((v) => Number(v)).filter((v) => Number.isFinite(v))
    : [];
  const skillAverage = skills.length ? skills.reduce((a, b) => a + b, 0) / skills.length : 3;
  const scenarioChoice = responses[5] || "";

  const content = contentAlignmentScore(course, focus);
  const careerFit = careerAlignmentScore(course, career);
  const skillsFit = skillCompatibilityScore(course, mathComfort, skillAverage);
  const workload = workloadFitScore(course, scenarioChoice);
  const seats = seatScore(course);
  const popularity = popularityScore(course, db);

  const matchScore = clampScore(
    content * 0.34 +
    careerFit * 0.2 +
    skillsFit * 0.16 +
    workload * 0.12 +
    seats * 0.1 +
    popularity * 0.08
  );

  return {
    matchScore,
    breakdown: {
      interestAlignment: content,
      careerRelevance: careerFit,
      skillCompatibility: skillsFit,
      workloadFit: workload,
      seatAvailability: seats,
      peerSignal: popularity
    }
  };
}

function buildExplainabilityText(course, scorePayload) {
  const b = scorePayload.breakdown;
  const strengths = [
    ["interest alignment", b.interestAlignment],
    ["career relevance", b.careerRelevance],
    ["skill compatibility", b.skillCompatibility],
    ["workload fit", b.workloadFit],
    ["seat availability", b.seatAvailability],
    ["peer signal", b.peerSignal]
  ]
    .sort((a, b2) => b2[1] - a[1])
    .slice(0, 3)
    .map(([label]) => label);

  return `${course.name} scored ${scorePayload.matchScore}% based on strong ${strengths.join(", ")}. This ranking combines questionnaire fit with seat pressure and peer signals.`;
}

function buildRecommendations(userId, questionnaire, db) {
  const ranked = COURSES
    .map((course) => {
      const scorePayload = buildScoreBreakdown(course, questionnaire, db);
      return {
        id: randomUUID(),
        user_id: userId,
        questionnaire_id: questionnaire?.id || null,
        course_id: course.id,
        match_score: scorePayload.matchScore,
        score_breakdown: scorePayload.breakdown,
        explanation: buildExplainabilityText(course, scorePayload),
        created_at: new Date().toISOString()
      };
    })
    .sort((a, b) => b.match_score - a.match_score)
    .slice(0, 3);

  return ranked;
}

async function trackMlflowRun({ userId, questionnaireId, recommendations }) {
  if (!MLFLOW_TRACKING_URI) return;
  try {
    const payload = {
      experiment_id: MLFLOW_EXPERIMENT_ID,
      user_id: userId,
      questionnaire_id: questionnaireId,
      top_score: recommendations[0]?.match_score || 0,
      avg_score: recommendations.length
        ? Math.round(recommendations.reduce((acc, r) => acc + r.match_score, 0) / recommendations.length)
        : 0,
      recommendation_count: recommendations.length,
      timestamp: new Date().toISOString()
    };

    await fetch(`${MLFLOW_TRACKING_URI.replace(/\/$/, "")}/api/2.0/mlflow/runs/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        experiment_id: String(payload.experiment_id),
        tags: [
          { key: "source", value: "electifind" },
          { key: "user_id", value: String(payload.user_id) },
          { key: "questionnaire_id", value: String(payload.questionnaire_id || "") }
        ]
      })
    }).catch(() => {});
  } catch {
    // Non-blocking telemetry.
  }
}

function persistRecommendationRun(db, userId, questionnaireId, recs) {
  ensureDbCollections(db);
  const run = {
    id: randomUUID(),
    user_id: userId,
    questionnaire_id: questionnaireId,
    created_at: new Date().toISOString(),
    recommendations: recs.map((r) => ({
      course_id: r.course_id,
      match_score: r.match_score,
      explanation: r.explanation
    }))
  };
  db.recommendationHistory.push(run);
  db.mlflowRuns.push({
    id: randomUUID(),
    user_id: userId,
    questionnaire_id: questionnaireId,
    created_at: run.created_at,
    top_score: recs[0]?.match_score || 0,
    avg_score: recs.length ? Math.round(recs.reduce((acc, r) => acc + r.match_score, 0) / recs.length) : 0,
    tracked: Boolean(MLFLOW_TRACKING_URI)
  });
  return run;
}

function auth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) {
    return res.status(401).json({ error: "Missing token" });
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "electifind-api" });
});

app.post("/api/auth/register", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: "name, email and password are required" });
  }
  const normalizedEmail = String(email).trim().toLowerCase();
  const normalizedName = String(name).trim();
  if (String(password).length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters" });
  }

  const db = readDb();
  const exists = db.users.find((u) => u.email.toLowerCase() === normalizedEmail);
  if (exists) {
    return res.status(409).json({ error: "User already exists" });
  }

  const password_hash = await bcrypt.hash(password, 10);
  const user = {
    id: randomUUID(),
    name: normalizedName,
    email: normalizedEmail,
    password_hash,
    roll_no: "",
    department: "Computer Science & Engineering",
    batch: "2021-2025",
    advisor: "",
    interests: [],
    created_at: new Date().toISOString()
  };
  db.users.push(user);
  writeDb(db);

  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });
  return res.status(201).json({ token, user: { ...user, password_hash: undefined } });
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "email and password are required" });
  }
  const normalizedEmail = String(email).trim().toLowerCase();
  const db = readDb();
  const user = db.users.find((u) => u.email.toLowerCase() === normalizedEmail);
  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });
  return res.json({ token, user: { ...user, password_hash: undefined } });
});

app.post("/api/auth/forgot-password", (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "email is required" });
  }
  const normalizedEmail = String(email).trim().toLowerCase();
  const db = readDb();
  db.passwordResetRequests.push({
    id: randomUUID(),
    email: normalizedEmail,
    requested_at: new Date().toISOString(),
    status: "queued"
  });
  writeDb(db);
  return res.json({ message: "If an account exists, reset instructions are sent." });
});

app.get("/api/profile", auth, (req, res) => {
  const db = readDb();
  const user = db.users.find((u) => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  return res.json({ ...user, password_hash: undefined });
});

app.put("/api/profile", auth, (req, res) => {
  const db = readDb();
  const userIdx = db.users.findIndex((u) => u.id === req.user.id);
  if (userIdx < 0) {
    return res.status(404).json({ error: "User not found" });
  }
  const editableFields = ["name", "roll_no", "department", "batch", "advisor", "interests"];
  for (const field of editableFields) {
    if (field in req.body) {
      db.users[userIdx][field] = req.body[field];
    }
  }
  writeDb(db);
  return res.json({ ...db.users[userIdx], password_hash: undefined });
});

app.post("/api/questionnaire", auth, (req, res) => {
  const { version = "v1", responses_json = {}, completed = false, step = 1 } = req.body;
  const db = readDb();
  ensureDbCollections(db);
  const questionnaire = {
    id: randomUUID(),
    user_id: req.user.id,
    version,
    responses_json,
    completed,
    step,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  db.questionnaires.push(questionnaire);

  if (completed) {
    const recs = buildRecommendations(req.user.id, questionnaire, db);
    db.recommendations = db.recommendations.filter((r) => r.user_id !== req.user.id);
    db.recommendations.push(...recs);
    persistRecommendationRun(db, req.user.id, questionnaire.id, recs);
    trackMlflowRun({ userId: req.user.id, questionnaireId: questionnaire.id, recommendations: recs });
  }

  writeDb(db);
  return res.status(201).json(questionnaire);
});

app.put("/api/questionnaire/:id", auth, (req, res) => {
  const db = readDb();
  ensureDbCollections(db);
  const idx = db.questionnaires.findIndex((q) => q.id === req.params.id && q.user_id === req.user.id);
  if (idx < 0) {
    return res.status(404).json({ error: "Questionnaire not found" });
  }

  db.questionnaires[idx] = {
    ...db.questionnaires[idx],
    ...req.body,
    updated_at: new Date().toISOString()
  };

  if (db.questionnaires[idx].completed) {
    const recs = buildRecommendations(req.user.id, db.questionnaires[idx], db);
    db.recommendations = db.recommendations.filter((r) => r.user_id !== req.user.id);
    db.recommendations.push(...recs);
    persistRecommendationRun(db, req.user.id, db.questionnaires[idx].id, recs);
    trackMlflowRun({ userId: req.user.id, questionnaireId: db.questionnaires[idx].id, recommendations: recs });
  }

  writeDb(db);
  return res.json(db.questionnaires[idx]);
});

app.get("/api/questionnaire/status", auth, (req, res) => {
  const db = readDb();
  const latest = [...db.questionnaires]
    .filter((q) => q.user_id === req.user.id)
    .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))[0];
  if (!latest) {
    return res.json({ exists: false });
  }
  return res.json({
    exists: true,
    questionnaire_id: latest.id,
    step: latest.step,
    completed: latest.completed
  });
});

app.get("/api/courses/search", auth, (req, res) => {
  const q = String(req.query.q || "").toLowerCase();
  const results = COURSES.filter((c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q));
  res.json(results);
});

app.get("/api/courses", auth, (_req, res) => {
  res.json(COURSES);
});

app.get("/api/courses/:id", auth, (req, res) => {
  const course = COURSES.find((c) => c.id === req.params.id || c.code === req.params.id);
  if (!course) {
    return res.status(404).json({ error: "Course not found" });
  }
  return res.json(course);
});

app.get("/api/recommendations", auth, (req, res) => {
  const db = readDb();
  ensureDbCollections(db);
  const recs = db.recommendations
    .filter((r) => r.user_id === req.user.id)
    .sort((a, b) => b.match_score - a.match_score)
    .map((r) => {
      const course = COURSES.find((c) => c.id === r.course_id);
      return {
        ...r,
        course,
        score_breakdown: r.score_breakdown,
        seats_left: course ? seatsLeft(course) : 0
      };
    });
  return res.json(recs);
});

app.get("/api/recommendations/history", auth, (req, res) => {
  const db = readDb();
  ensureDbCollections(db);
  const history = db.recommendationHistory
    .filter((h) => h.user_id === req.user.id)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const resolved = history.map((entry) => ({
    ...entry,
    recommendations: (entry.recommendations || []).map((r) => ({
      ...r,
      course: COURSES.find((c) => c.id === r.course_id)
    }))
  }));

  return res.json(resolved);
});

app.get("/api/recommendations/:id/explain", auth, (req, res) => {
  const db = readDb();
  const rec = db.recommendations.find((r) => r.id === req.params.id && r.user_id === req.user.id);
  if (!rec) {
    return res.status(404).json({ error: "Recommendation not found" });
  }
  const course = COURSES.find((c) => c.id === rec.course_id);
  return res.json({
    recommendation_id: rec.id,
    course,
    match_score: rec.match_score,
    explanation: rec.explanation,
    breakdown: rec.score_breakdown || buildScoreBreakdown(course, null, db).breakdown
  });
});

app.get("/api/dashboard", auth, (req, res) => {
  const db = readDb();
  const recs = db.recommendations
    .filter((r) => r.user_id === req.user.id)
    .sort((a, b) => b.match_score - a.match_score)
    .slice(0, 3);

  const mapped = recs.map((r) => {
    const c = COURSES.find((x) => x.id === r.course_id);
    return {
      id: c?.id,
      name: c?.name,
      code: c?.code,
      credits: c?.credits,
      difficulty: c?.difficulty,
      rating: c?.rating,
      match: r.match_score,
      seats: c ? seatsLeft(c) : 0,
      totalSeats: c?.seats_total || 0,
      instructor: c?.professor,
      prereq: ["Data Structures", "Computer Networks"]
    };
  });

  const avgSeats = mapped.length
    ? (mapped.reduce((acc, x) => acc + x.seats, 0) / mapped.length).toFixed(1)
    : "0.0";

  const avgMatch = mapped.length
    ? Math.round(mapped.reduce((acc, x) => acc + x.match, 0) / mapped.length)
    : 0;

  const userEnrollments = db.enrollments.filter((e) => e.user_id === req.user.id);
  const creditsTaken = userEnrollments.reduce((sum, enrollment) => {
    const course = COURSES.find((c) => c.id === enrollment.course_id || c.code === enrollment.course_id);
    return sum + Number(course?.credits || 0);
  }, 0);

  return res.json({
    stats: {
      recommended: mapped.length,
      avgSeats,
      interestMatch: `${avgMatch}%`,
      creditsTaken
    },
    recommendations: mapped
  });
});

app.get("/api/compare", auth, (req, res) => {
  const query = String(req.query.courses || "").split(",").filter(Boolean);
  const selected = query.length
    ? COURSES.filter((c) => query.includes(c.code) || query.includes(c.id))
    : COURSES.slice(0, 3);
  return res.json(selected);
});

app.get("/api/electives", auth, (req, res) => {
  const db = readDb();
  const mine = db.enrollments.filter((e) => e.user_id === req.user.id);
  return res.json(mine);
});

app.post("/api/electives", auth, (req, res) => {
  const { course_id, status = "ongoing", grade = "-", rating = null } = req.body;
  if (!course_id) {
    return res.status(400).json({ error: "course_id is required" });
  }
  const db = readDb();
  const enrollment = {
    id: randomUUID(),
    user_id: req.user.id,
    course_id,
    status,
    grade,
    rating,
    created_at: new Date().toISOString()
  };
  db.enrollments.push(enrollment);
  writeDb(db);
  return res.status(201).json(enrollment);
});

app.get("/api/posts", auth, (req, res) => {
  const db = readDb();
  const usersById = new Map((db.users || []).map((u) => [u.id, u]));
  const posts = db.posts.map((p) => ({
    ...p,
    author_name: usersById.get(p.user_id)?.name || "Student",
    replies: db.replies
      .filter((r) => r.post_id === p.id)
      .map((r) => ({
        ...r,
        author_name: usersById.get(r.user_id)?.name || "Student"
      }))
  }));
  return res.json(posts);
});

app.post("/api/posts", auth, (req, res) => {
  const { course_id, title, body, tags = [] } = req.body;
  if (!course_id || !title || !body) {
    return res.status(400).json({ error: "course_id, title and body are required" });
  }
  const db = readDb();
  const post = {
    id: randomUUID(),
    user_id: req.user.id,
    course_id,
    title,
    body,
    tags,
    upvotes: 0,
    created_at: new Date().toISOString()
  };
  db.posts.push(post);
  writeDb(db);
  const user = db.users.find((u) => u.id === req.user.id);
  return res.status(201).json({ ...post, author_name: user?.name || "Student", replies: [] });
});

app.post("/api/posts/:id/reply", auth, (req, res) => {
  const { body } = req.body;
  if (!body) {
    return res.status(400).json({ error: "body is required" });
  }
  const db = readDb();
  const post = db.posts.find((p) => p.id === req.params.id);
  if (!post) {
    return res.status(404).json({ error: "Post not found" });
  }
  const reply = {
    id: randomUUID(),
    post_id: req.params.id,
    user_id: req.user.id,
    body,
    created_at: new Date().toISOString()
  };
  db.replies.push(reply);
  writeDb(db);
  const user = db.users.find((u) => u.id === req.user.id);
  return res.status(201).json({ ...reply, author_name: user?.name || "Student" });
});

app.post("/api/posts/:id/upvote", auth, (req, res) => {
  const db = readDb();
  const idx = db.posts.findIndex((p) => p.id === req.params.id);
  if (idx < 0) {
    return res.status(404).json({ error: "Post not found" });
  }
  db.posts[idx].upvotes += 1;
  writeDb(db);
  return res.json({ upvotes: db.posts[idx].upvotes });
});

if (fs.existsSync(FRONTEND_DIST_PATH)) {
  app.use((req, res, next) => {
    if (req.method !== "GET" || req.path.startsWith("/api/")) {
      return next();
    }
    return res.sendFile(path.join(FRONTEND_DIST_PATH, "index.html"));
  });
}

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`ElectiFind API running on http://localhost:${PORT}`);
  });
}

export default app;
