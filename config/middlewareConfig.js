const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const compression = require("compression");
const express = require("express");
const requestLogger = require("../middlewares/requestLogger");

const middlewareConfig = (app) => {
  // Enable compression in production
  if (process.env.NODE_ENV === "production") {
    app.use(compression());
    console.log("Compression enabled!!");
  }

  // CORS config
  const corsOptions = {
    origin:
      process.env.NODE_ENV === "production"
        ? `${process.env.PRODUCTION_DOMAIN}`
        : "*",
  };
  app.use(cors(corsOptions));

  app.use(helmet());
  app.use(morgan("dev"));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Log requests in development
  if (process.env.NODE_ENV !== "production") {
    app.use(requestLogger);
  }

  // Static folders
  app.use("/image/products", express.static("public/products"));
  app.use("/image/category", express.static("public/category"));
  app.use("/image/poster", express.static("public/posters"));
};

module.exports = middlewareConfig;
