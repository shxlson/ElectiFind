import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import fs from "fs";
import path from "path";
import os from "os";

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "electifind-tests-rec-"));
const tmpDbPath = path.join(tmpDir, "db.json");

const seedDb = {
  users: [],
  questionnaires: [],
  recommendations: [],
  enrollments: [],
  posts: [],
  replies: [],
  passwordResetRequests: []
};

let app;
let token;

beforeAll(async () => {
  fs.writeFileSync(tmpDbPath, JSON.stringify(seedDb, null, 2));
  process.env.NODE_ENV = "test";
  process.env.DB_PATH = tmpDbPath;
  process.env.DATASET_PATH = path.resolve(process.cwd(), "electives_dataset.json");
  const mod = await import("../src/server.js");
  app = mod.default;

  const reg = await request(app)
    .post("/api/auth/register")
    .send({ name: "Rec User", email: "rec@example.com", password: "secret123" });
  token = reg.body.token;
});

afterAll(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe("Recommendations Flow", () => {
  it("generates recommendations after completed questionnaire", async () => {
    const createQ = await request(app)
      .post("/api/questionnaire")
      .set("Authorization", `Bearer ${token}`)
      .send({
        version: "v1",
        completed: true,
        step: 5,
        responses_json: {
          1: "Data & AI/ML",
          2: 4,
          3: "Data Scientist",
          4: { "Python / Coding": 4, "Statistics / Math": 4, "System Design": 3, "Communication": 3 },
          5: "Learn something deep and challenging"
        }
      });

    expect(createQ.status).toBe(201);

    const recs = await request(app)
      .get("/api/recommendations")
      .set("Authorization", `Bearer ${token}`);

    expect(recs.status).toBe(200);
    expect(Array.isArray(recs.body)).toBe(true);
    expect(recs.body.length).toBeGreaterThan(0);
    expect(recs.body[0].match_score).toBeGreaterThanOrEqual(0);
    expect(recs.body[0].match_score).toBeLessThanOrEqual(100);

    const history = await request(app)
      .get("/api/recommendations/history")
      .set("Authorization", `Bearer ${token}`);

    expect(history.status).toBe(200);
    expect(Array.isArray(history.body)).toBe(true);
    expect(history.body.length).toBeGreaterThan(0);
  });
});
