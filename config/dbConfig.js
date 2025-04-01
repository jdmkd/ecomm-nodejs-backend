const mongoose = require("mongoose");
require("dotenv").config();

// const URL = process.env.MONGODB_URL;
// const URL = "mongodb+srv://meet:meet12345@cluster0.bpmig.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
// const URL = "mongodb+srv://jdmkd49:iuV9ZnTqRhMcrJSw@cluster0.a2tq9.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("✅ Database connected successfully");
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    process.exit(1); // Exit the process if connection fails
  }
};

module.exports = connectDB;
