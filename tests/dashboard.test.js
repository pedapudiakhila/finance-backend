const request = require("supertest");
const app = require("../src/app");
const User = require("../src/models/User");
const bcrypt = require("bcryptjs");
require("./setup");

let adminToken;
let viewerToken;

beforeEach(async () => {
  const adminPassword = await bcrypt.hash("admin123", 10);
  await User.create({
    name: "Admin User",
    email: "admin@test.com",
    password: adminPassword,
    role: "ADMIN",
  });

  const viewerPassword = await bcrypt.hash("viewer123", 10);
  await User.create({
    name: "Viewer User",
    email: "viewer@test.com",
    password: viewerPassword,
    role: "VIEWER",
  });

  const adminRes = await request(app)
    .post("/api/auth/login")
    .send({ email: "admin@test.com", password: "admin123" });
  adminToken = adminRes.body.data.token;

  const viewerRes = await request(app)
    .post("/api/auth/login")
    .send({ email: "viewer@test.com", password: "viewer123" });
  viewerToken = viewerRes.body.data.token;

  // Create sample records
  await request(app)
    .post("/api/records")
    .set("Authorization", `Bearer ${adminToken}`)
    .send({
      amount: 10000,
      type: "INCOME",
      category: "Salary",
      date: "2026-04-01T00:00:00.000Z",
    });

  await request(app)
    .post("/api/records")
    .set("Authorization", `Bearer ${adminToken}`)
    .send({
      amount: 3000,
      type: "EXPENSE",
      category: "Rent",
      date: "2026-04-02T00:00:00.000Z",
    });
});

describe("Dashboard API", () => {

  it("should return correct summary for admin", async () => {
    const res = await request(app)
      .get("/api/dashboard")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.summary.totalIncome).toBe(10000);
    expect(res.body.data.summary.totalExpense).toBe(3000);
    expect(res.body.data.summary.netBalance).toBe(7000);
  });

  it("should return recent activity", async () => {
    const res = await request(app)
      .get("/api/dashboard")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.body.data.recentActivity.length).toBeGreaterThan(0);
  });

  it("should return category breakdown", async () => {
    const res = await request(app)
      .get("/api/dashboard")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.body.data.categoryBreakdown.length).toBeGreaterThan(0);
  });

  it("should return monthly trend", async () => {
    const res = await request(app)
      .get("/api/dashboard")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.body.data.monthlyTrend.length).toBeGreaterThan(0);
  });

  it("should allow viewer to access dashboard", async () => {
    const res = await request(app)
      .get("/api/dashboard")
      .set("Authorization", `Bearer ${viewerToken}`);

    expect(res.statusCode).toBe(200);
  });

  it("should return 401 without token", async () => {
    const res = await request(app).get("/api/dashboard");
    expect(res.statusCode).toBe(401);
  });
});