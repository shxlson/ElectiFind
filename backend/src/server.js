import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = Number(process.env.PORT || 4000);
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";
const DB_PATH = path.resolve(process.cwd(), "backend/data/db.json");
const DATASET_PATH = path.resolve(process.cwd(), "electives_dataset.json");

function normalizeCourse(raw) {
  const totalSeats = Number(raw.intake_limit || 0);
  const filledSeats = Number(raw.current_enrollment || 0);
  const totalHours = Number(raw.total_hours || 0);
  const creditC = Number(raw?.credits?.C || 0);
  const tags = Array.isArray(raw.domain_tags)
    ? raw.domain_tags.map((t) => String(t).toLowerCase())
    : [];
  const units = Array.isArray(raw.units) ? raw.units : [];

  return {
    id: String(raw.course_code),
    code: String(raw.course_code),
    name: String(raw.course_name),
    credits: creditC,
    difficulty: raw.difficulty || "Intermediate",
    professor: "Faculty Assigned by Department",
    tags,
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

function seatsLeft(course) {
  return Math.max(course.seats_total - course.seats_filled, 0);
}

function seatScore(course) {
  return Math.round((seatsLeft(course) / course.seats_total) * 100);
}

function scoreCourse(course, questionnaire) {
  const responses = questionnaire?.responses_json || {};
  let score = 55;

  const focus = String(responses[1] || "").toLowerCase();
  const career = String(responses[3] || "").toLowerCase();
  const mathComfort = Number(responses[2] || 3);

  if (focus.includes("data") && course.tags.includes("ml")) score += 18;
  if (focus.includes("systems") && (course.tags.includes("systems") || course.tags.includes("cloud"))) score += 15;
  if (focus.includes("security") && course.tags.includes("security")) score += 18;
  if (focus.includes("design") && course.tags.includes("frontend")) score += 12;

  if (career.includes("data") && course.tags.includes("ml")) score += 10;
  if (career.includes("software") && (course.tags.includes("web") || course.tags.includes("backend"))) score += 8;

  if (mathComfort >= 4 && (course.tags.includes("ml") || course.tags.includes("crypto"))) score += 6;
  if (mathComfort <= 2 && course.tags.includes("crypto")) score -= 8;

  score += Math.round(seatScore(course) * 0.15);
  score += Math.round(course.rating * 2);

  if (score > 99) score = 99;
  if (score < 1) score = 1;

  return score;
}

function buildRecommendations(userId, questionnaire) {
  const ranked = COURSES
    .map((course) => {
      const match_score = scoreCourse(course, questionnaire);
      return {
        id: randomUUID(),
        user_id: userId,
        questionnaire_id: questionnaire?.id || null,
        course_id: course.id,
        match_score,
        explanation: `${course.name} aligns with your selected focus and workload preferences while accounting for current seat availability.`,
        created_at: new Date().toISOString()
      };
    })
    .sort((a, b) => b.match_score - a.match_score)
    .slice(0, 3);

  return ranked;
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
  if (String(password).length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters" });
  }

  const db = readDb();
  const exists = db.users.find((u) => u.email.toLowerCase() === String(email).toLowerCase());
  if (exists) {
    return res.status(409).json({ error: "User already exists" });
  }

  const password_hash = await bcrypt.hash(password, 10);
  const user = {
    id: randomUUID(),
    name,
    email,
    password_hash,
    roll_no: "",
    department: "Computer Science & Engineering",
    batch: "2021-2025",
    semester: "Sem 6",
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
  const db = readDb();
  const user = db.users.find((u) => u.email.toLowerCase() === String(email).toLowerCase());
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
  const db = readDb();
  db.passwordResetRequests.push({
    id: randomUUID(),
    email,
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
  const editableFields = ["name", "roll_no", "department", "batch", "semester", "advisor", "interests"];
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
    const recs = buildRecommendations(req.user.id, questionnaire);
    db.recommendations = db.recommendations.filter((r) => r.user_id !== req.user.id);
    db.recommendations.push(...recs);
  }

  writeDb(db);
  return res.status(201).json(questionnaire);
});

app.put("/api/questionnaire/:id", auth, (req, res) => {
  const db = readDb();
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
    const recs = buildRecommendations(req.user.id, db.questionnaires[idx]);
    db.recommendations = db.recommendations.filter((r) => r.user_id !== req.user.id);
    db.recommendations.push(...recs);
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

app.get("/api/courses/:id", auth, (req, res) => {
  const course = COURSES.find((c) => c.id === req.params.id || c.code === req.params.id);
  if (!course) {
    return res.status(404).json({ error: "Course not found" });
  }
  return res.json(course);
});

app.get("/api/recommendations", auth, (req, res) => {
  const db = readDb();
  const recs = db.recommendations
    .filter((r) => r.user_id === req.user.id)
    .sort((a, b) => b.match_score - a.match_score)
    .map((r) => {
      const course = COURSES.find((c) => c.id === r.course_id);
      return {
        ...r,
        course,
        seats_left: course ? seatsLeft(course) : 0
      };
    });
  return res.json(recs);
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
    breakdown: {
      interestAlignment: Math.min(rec.match_score + 2, 99),
      skillCompatibility: Math.max(rec.match_score - 8, 60),
      careerRelevance: Math.max(rec.match_score - 5, 65),
      workloadFit: Math.max(rec.match_score - 14, 55)
    }
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

  return res.json({
    stats: {
      recommended: mapped.length,
      avgSeats,
      interestMatch: `${avgMatch}%`,
      creditsTaken: 18
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
  const { course_id, semester, status = "ongoing", grade = "-", rating = null } = req.body;
  if (!course_id || !semester) {
    return res.status(400).json({ error: "course_id and semester are required" });
  }
  const db = readDb();
  const enrollment = {
    id: randomUUID(),
    user_id: req.user.id,
    course_id,
    semester,
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
  const posts = db.posts.map((p) => ({
    ...p,
    replies: db.replies.filter((r) => r.post_id === p.id)
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
  return res.status(201).json(post);
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
  return res.status(201).json(reply);
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

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`ElectiFind API running on http://localhost:${PORT}`);
});
