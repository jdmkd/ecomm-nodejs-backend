const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const asyncHandler = require("express-async-handler");
require("dotenv").config();

const connectDB = require("./config/dbConfig.js"); // Database connection
const routes = require("./routes/index.js"); // Import all routes

const app = express();

// Connect to Database
connectDB();

// Middleware
app.use(cors({ origin: "*" }));
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Static File Serving
app.use("/image/products", express.static("public/products"));
app.use("/image/category", express.static("public/category"));
app.use("/image/poster", express.static("public/posters"));


// Routes
app.use("/", routes);


// Example route using asyncHandler directly in app.js
app.get('/', asyncHandler(async (req, res) => {
    res.json({ success: true, message: 'API working successfully', data: null });
}));

// Global error handler
app.use((error, req, res, next) => {
    res.status(500).json({ success: false, message: error.message, data: null });
});


app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
});


