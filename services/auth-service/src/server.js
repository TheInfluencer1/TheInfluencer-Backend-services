"use strict";

const express = require("express");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const cors = require("cors");
const jwtRoutes = require("./routes/jwt_routes");
const {connectDB} = require('../../../config/db');
dotenv.config();

connectDB(process.env.AUTH_DB_URI);

const app = express();

// CORS Configuration (Allows Specific Origins)
app.use(cors({
    origin: process.env.WEB_URL || "*", 
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
}));

app.use(express.json()); 
app.use(cookieParser());

// API Routes
app.use("/v1", jwtRoutes);

// Handle 404 Errors for Unknown Routes
app.use((req, res) => {
    res.status(404).json({ error: "Route not found" });
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});
