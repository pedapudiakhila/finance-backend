const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const ApiError = require("./utils/ApiError");

const authRoutes = require("./modules/auth/auth.routes");
const usersRoutes = require("./modules/users/users.routes");
const recordsRoutes = require("./modules/records/records.routes");
const dashboardRoutes = require("./modules/dashboard/dashboard.routes");

const app = express();

app.use(helmet());
app.use(cors({
  origin: "*",
  credentials: false,
  methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json());

// health check
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Server is running" });
});

// v1 routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", usersRoutes);
app.use("/api/v1/records", recordsRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// global error handler
app.use((err, req, res, next) => {
  const statusCode = err instanceof ApiError ? err.statusCode : 500;
  const message = err.message || "Something went wrong";

  if (process.env.NODE_ENV === "development") {
    console.error(`[ERROR] ${statusCode} - ${message}`);
    console.error(err.stack);
  }

  res.status(statusCode).json({
    success: false,
    message,
    errors: Array.isArray(err.errors) ? err.errors : [],
  });
});

module.exports = app;
