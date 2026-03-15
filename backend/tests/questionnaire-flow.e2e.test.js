import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../src/server.js";

describe("E2E: questionnaire to recommendation flow", () => {
  it("registers user, submits questionnaire, and gets recommendations", async () => {
    const email = `flow-${Date.now()}@electifind.local`;
    const password = "FlowPass123";

    const registerRes = await request(app)
      .post("/api/auth/register")
      .send({ name: "Flow User", email, password });

    expect(registerRes.status).toBe(201);
    expect(registerRes.body.token).toBeTruthy();

    const token = registerRes.body.token;

    const questionnaireRes = await request(app)
      .post("/api/questionnaire")
      .set("Authorization", `Bearer ${token}`)
      .send({
        version: "v1",
        completed: true,
        step: 5,
        responses_json: {
          1: "Data Science",
          2: 4,
          3: "Data Scientist",
          4: {
            python: 4,
            statistics: 4,
            systems: 3,
            communication: 4
          },
          5: "challenging"
        }
      });

    expect(questionnaireRes.status).toBe(201);
    expect(questionnaireRes.body.completed).toBe(true);

    const recommendationsRes = await request(app)
      .get("/api/recommendations")
      .set("Authorization", `Bearer ${token}`);

    expect(recommendationsRes.status).toBe(200);
    expect(Array.isArray(recommendationsRes.body)).toBe(true);
    expect(recommendationsRes.body.length).toBeGreaterThan(0);
    expect(recommendationsRes.body[0].match_score).toBeGreaterThanOrEqual(0);

    const explainRes = await request(app)
      .get(`/api/recommendations/${recommendationsRes.body[0].id}/explain`)
      .set("Authorization", `Bearer ${token}`);

    expect(explainRes.status).toBe(200);
    expect(explainRes.body.explanation).toBeTruthy();

    const historyRes = await request(app)
      .get("/api/recommendations/history")
      .set("Authorization", `Bearer ${token}`);

    expect(historyRes.status).toBe(200);
    expect(Array.isArray(historyRes.body)).toBe(true);
    expect(historyRes.body.length).toBeGreaterThan(0);
  });
});
