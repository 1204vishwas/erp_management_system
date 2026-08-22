import request from "supertest";
import mongoose from "mongoose";
import app from "../server.js";

/**
 * Basic auth flow test (Jest + Supertest).
 * Requires a running MongoDB (uses MONGO_URI or a test DB).
 * Run with:  npm test
 */
describe("Auth API", () => {
  const testUser = {
    name: "Test User",
    email: `test_${Date.now()}@example.com`,
    password: "secret123",
    role: "Sales",
  };

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it("registers a new user and returns a token", async () => {
    const res = await request(app).post("/api/register").send(testUser);
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("token");
    expect(res.body.user.email).toBe(testUser.email.toLowerCase());
  });

  it("logs in with valid credentials", async () => {
    const res = await request(app)
      .post("/api/login")
      .send({ email: testUser.email, password: testUser.password });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("token");
  });

  it("rejects invalid credentials", async () => {
    const res = await request(app)
      .post("/api/login")
      .send({ email: testUser.email, password: "wrongpass" });
    expect(res.statusCode).toBe(401);
  });

  it("blocks protected routes without a token", async () => {
    const res = await request(app).get("/api/dashboard");
    expect(res.statusCode).toBe(401);
  });
});
