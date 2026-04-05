const request = require("supertest");
const app = require("../src/app");
require("./setup");

describe("Auth API", () => {

  describe("POST /api/auth/register", () => {
    it("should register a new user successfully", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({
          name: "Test User",
          email: "test@example.com",
          password: "password123",
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe("test@example.com");
      expect(res.body.data.role).toBe("VIEWER");
      expect(res.body.data).not.toHaveProperty("password");
    });

    it("should return 422 for invalid registration data", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({
          name: "A",
          email: "notanemail",
          password: "123",
        });

      expect(res.statusCode).toBe(422);
      expect(res.body.success).toBe(false);
      expect(res.body.errors.length).toBeGreaterThan(0);
    });

    it("should return 409 if email already exists", async () => {
      await request(app)
        .post("/api/auth/register")
        .send({
          name: "Test User",
          email: "test@example.com",
          password: "password123",
        });

      const res = await request(app)
        .post("/api/auth/register")
        .send({
          name: "Test User",
          email: "test@example.com",
          password: "password123",
        });

      expect(res.statusCode).toBe(409);
      expect(res.body.success).toBe(false);
    });
  });

  describe("POST /api/auth/login", () => {
    beforeEach(async () => {
      await request(app)
        .post("/api/auth/register")
        .send({
          name: "Test User",
          email: "test@example.com",
          password: "password123",
        });
    });

    it("should login successfully and return token", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({
          email: "test@example.com",
          password: "password123",
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty("token");
      expect(res.body.data.user.email).toBe("test@example.com");
    });

    it("should return 401 for wrong password", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({
          email: "test@example.com",
          password: "wrongpassword",
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it("should return 401 for non-existent email", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({
          email: "nobody@example.com",
          password: "password123",
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe("GET /api/auth/me", () => {
    it("should return current user profile", async () => {
      await request(app)
        .post("/api/auth/register")
        .send({
          name: "Test User",
          email: "test@example.com",
          password: "password123",
        });

      const loginRes = await request(app)
        .post("/api/auth/login")
        .send({
          email: "test@example.com",
          password: "password123",
        });

      const token = loginRes.body.data.token;

      const res = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.email).toBe("test@example.com");
      expect(res.body.data).not.toHaveProperty("password");
    });

    it("should return 401 without token", async () => {
      const res = await request(app).get("/api/auth/me");
      expect(res.statusCode).toBe(401);
    });
  });
});