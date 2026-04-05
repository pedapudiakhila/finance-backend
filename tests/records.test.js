const request = require("supertest");
const app = require("../src/app");
const User = require("../src/models/User");
const bcrypt = require("bcryptjs");
require("./setup");

let adminToken;
let analystToken;
let viewerToken;

beforeEach(async () => {
  // Create admin user
  const adminPassword = await bcrypt.hash("admin123", 10);
  await User.create({
    name: "Admin User",
    email: "admin@test.com",
    password: adminPassword,
    role: "ADMIN",
  });

  // Create analyst user
  const analystPassword = await bcrypt.hash("analyst123", 10);
  await User.create({
    name: "Analyst User",
    email: "analyst@test.com",
    password: analystPassword,
    role: "ANALYST",
  });

  // Create viewer user
  const viewerPassword = await bcrypt.hash("viewer123", 10);
  await User.create({
    name: "Viewer User",
    email: "viewer@test.com",
    password: viewerPassword,
    role: "VIEWER",
  });

  // Login all users
  const adminRes = await request(app)
    .post("/api/auth/login")
    .send({ email: "admin@test.com", password: "admin123" });
  adminToken = adminRes.body.data.token;

  const analystRes = await request(app)
    .post("/api/auth/login")
    .send({ email: "analyst@test.com", password: "analyst123" });
  analystToken = analystRes.body.data.token;

  const viewerRes = await request(app)
    .post("/api/auth/login")
    .send({ email: "viewer@test.com", password: "viewer123" });
  viewerToken = viewerRes.body.data.token;
});

describe("Records API", () => {

  describe("POST /api/records", () => {
    it("should create a record successfully as admin", async () => {
      const res = await request(app)
        .post("/api/records")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          amount: 5000,
          type: "INCOME",
          category: "Salary",
          date: "2026-04-01T00:00:00.000Z",
          notes: "Monthly salary",
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.amount).toBe(5000);
      expect(res.body.data.type).toBe("INCOME");
    });

    it("should return 403 when analyst tries to create record", async () => {
      const res = await request(app)
        .post("/api/records")
        .set("Authorization", `Bearer ${analystToken}`)
        .send({
          amount: 5000,
          type: "INCOME",
          category: "Salary",
          date: "2026-04-01T00:00:00.000Z",
        });

      expect(res.statusCode).toBe(403);
    });

    it("should return 403 when viewer tries to create record", async () => {
      const res = await request(app)
        .post("/api/records")
        .set("Authorization", `Bearer ${viewerToken}`)
        .send({
          amount: 5000,
          type: "INCOME",
          category: "Salary",
          date: "2026-04-01T00:00:00.000Z",
        });

      expect(res.statusCode).toBe(403);
    });

    it("should return 422 for invalid record data", async () => {
      const res = await request(app)
        .post("/api/records")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          amount: -500,
          type: "INVALID",
          category: "",
        });

      expect(res.statusCode).toBe(422);
      expect(res.body.errors.length).toBeGreaterThan(0);
    });
  });

  describe("GET /api/records", () => {
    beforeEach(async () => {
      await request(app)
        .post("/api/records")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          amount: 5000,
          type: "INCOME",
          category: "Salary",
          date: "2026-04-01T00:00:00.000Z",
        });

      await request(app)
        .post("/api/records")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          amount: 2000,
          type: "EXPENSE",
          category: "Rent",
          date: "2026-04-02T00:00:00.000Z",
        });
    });

    it("should list all records for admin", async () => {
      const res = await request(app)
        .get("/api/records")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.data.length).toBe(2);
      expect(res.body.data.meta.total).toBe(2);
    });

    it("should filter records by type", async () => {
      const res = await request(app)
        .get("/api/records?type=INCOME")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.data.length).toBe(1);
      expect(res.body.data.data[0].type).toBe("INCOME");
    });

    it("should support pagination", async () => {
      const res = await request(app)
        .get("/api/records?page=1&limit=1")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.data.length).toBe(1);
      expect(res.body.data.meta.totalPages).toBe(2);
    });

    it("should allow analyst to view records", async () => {
      const res = await request(app)
        .get("/api/records")
        .set("Authorization", `Bearer ${analystToken}`);

      expect(res.statusCode).toBe(200);
    });

    it("should return 403 for viewer", async () => {
      const res = await request(app)
        .get("/api/records")
        .set("Authorization", `Bearer ${viewerToken}`);

      expect(res.statusCode).toBe(403);
    });

    it("should return 401 without token", async () => {
      const res = await request(app).get("/api/records");
      expect(res.statusCode).toBe(401);
    });
  });

  describe("PATCH /api/records/:id", () => {
    it("should update a record successfully", async () => {
      const createRes = await request(app)
        .post("/api/records")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          amount: 5000,
          type: "INCOME",
          category: "Salary",
          date: "2026-04-01T00:00:00.000Z",
        });

      const recordId = createRes.body.data._id;

      const res = await request(app)
        .patch(`/api/records/${recordId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ amount: 8000 });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.amount).toBe(8000);
    });
  });

  describe("DELETE /api/records/:id", () => {
    it("should soft delete a record", async () => {
      const createRes = await request(app)
        .post("/api/records")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          amount: 5000,
          type: "INCOME",
          category: "Salary",
          date: "2026-04-01T00:00:00.000Z",
        });

      const recordId = createRes.body.data._id;

      const deleteRes = await request(app)
        .delete(`/api/records/${recordId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(deleteRes.statusCode).toBe(200);

      // Verify record no longer appears in list
      const listRes = await request(app)
        .get("/api/records")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(listRes.body.data.data.length).toBe(0);
    });

    it("should return 404 for already deleted record", async () => {
      const createRes = await request(app)
        .post("/api/records")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          amount: 5000,
          type: "INCOME",
          category: "Salary",
          date: "2026-04-01T00:00:00.000Z",
        });

      const recordId = createRes.body.data._id;

      await request(app)
        .delete(`/api/records/${recordId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      const res = await request(app)
        .delete(`/api/records/${recordId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(404);
    });
  });
});