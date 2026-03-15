import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import fs from "fs";
import path from "path";
import os from "os";

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "electifind-tests-"));
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

beforeAll(async () => {
  fs.writeFileSync(tmpDbPath, JSON.stringify(seedDb, null, 2));
  process.env.NODE_ENV = "test";
  process.env.DB_PATH = tmpDbPath;
  process.env.DATASET_PATH = path.resolve(process.cwd(), "electives_dataset.json");
  const mod = await import("../src/server.js");
  app = mod.default;
});

afterAll(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe("Auth API", () => {
  it("registers and logs in a user", async () => {
    const registerRes = await request(app)
      .post("/api/auth/register")
      .send({ name: "Test User", email: "test@example.com", password: "secret123" });

    expect(registerRes.status).toBe(201);
    expect(registerRes.body.token).toBeTruthy();
    expect(registerRes.body.user.email).toBe("test@example.com");

    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ email: "test@example.com", password: "secret123" });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body.token).toBeTruthy();
    expect(loginRes.body.user.name).toBe("Test User");
  });

  it("rejects invalid login", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "test@example.com", password: "wrong-password" });

    expect(res.status).toBe(401);
  });
});
