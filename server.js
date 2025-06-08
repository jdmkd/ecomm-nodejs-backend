require("dotenv").config();
const connectDB = require("./config/dbConfig");
const app = require("./app");

// Start server only after DB is connected
const PORT = process.env.PORT || 5000;

// Connect to Database
(async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`✅ Server running at http://127.0.0.1:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    process.exit(1);
  }
})();
