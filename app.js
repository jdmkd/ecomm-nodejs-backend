const express = require("express");
const middlewareConfig = require("./config/middlewareConfig");
const routes = require("./routes");
const errorHandler = require("./middlewares/errorHandler");
const notFoundHandler = require("./middlewares/notFoundHandler");

const app = express();

console.log(`Starting server...`);

// Log environment info
if (process.env.NODE_ENV === "production") {
  console.log("Running in PRODUCTION mode");
} else {
  console.log("Running in DEVELOPMENT mode");
}

// Middleware
middlewareConfig(app);

// Mount routes
app.use("/", routes);

// 404 Route Handler
app.use(notFoundHandler);

// Global Error Handler
app.use(errorHandler);

module.exports = app;
