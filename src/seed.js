require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
const FinancialRecord = require("./models/FinancialRecord");

const seed = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB");

  // clear existing data
  await User.deleteMany({});
  await FinancialRecord.deleteMany({});
  console.log("Cleared existing data");

  // create users
  const hashedPassword = await bcrypt.hash("admin123", 10);

  const admin = await User.create({
    name: "Admin User",
    email: "admin@finance.com",
    password: hashedPassword,
    role: "ADMIN",
  });

  const analyst = await User.create({
    name: "Analyst User",
    email: "analyst@finance.com",
    password: await bcrypt.hash("analyst123", 10),
    role: "ANALYST",
  });

  await User.create({
    name: "Viewer User",
    email: "viewer@finance.com",
    password: await bcrypt.hash("viewer123", 10),
    role: "VIEWER",
  });

  console.log("Users created");

  // create sample financial records
  await FinancialRecord.insertMany([
    {
      amount: 75000,
      type: "INCOME",
      category: "Salary",
      date: new Date("2026-04-01"),
      notes: "April monthly salary",
      createdBy: admin._id,
    },
    {
      amount: 15000,
      type: "INCOME",
      category: "Freelance",
      date: new Date("2026-04-05"),
      notes: "Website project payment",
      createdBy: admin._id,
    },
    {
      amount: 12000,
      type: "EXPENSE",
      category: "Rent",
      date: new Date("2026-04-02"),
      notes: "Monthly rent payment",
      createdBy: admin._id,
    },
    {
      amount: 3500,
      type: "EXPENSE",
      category: "Food",
      date: new Date("2026-04-03"),
      notes: "Grocery shopping",
      createdBy: admin._id,
    },
    {
      amount: 8000,
      type: "INCOME",
      category: "Freelance",
      date: new Date("2026-03-15"),
      notes: "Logo design project",
      createdBy: admin._id,
    },
    {
      amount: 2000,
      type: "EXPENSE",
      category: "Utilities",
      date: new Date("2026-03-20"),
      notes: "Electricity and water bill",
      createdBy: admin._id,
    },
  ]);

  console.log("Financial records created");
  console.log("Seed completed successfully");
  console.log("----------------------------");
  console.log("Admin:   admin@finance.com   / admin123");
  console.log("Analyst: analyst@finance.com / analyst123");
  console.log("Viewer:  viewer@finance.com  / viewer123");

  await mongoose.disconnect();
};

seed().catch((err) => {
  console.error("Seed failed:", err.message);
  process.exit(1);
});