const app = require("./app");
const connectDB = require("./config/db");
const env = require("./config/env");

const start = async () => {
  await connectDB();
  app.listen(env.port, () => {
    console.log(`Server is running on port ${env.port} in ${env.nodeEnv} mode`);
  });
};

start().catch((err) => {
  console.error("Failed to start server:", err.message);
  process.exit(1);
});