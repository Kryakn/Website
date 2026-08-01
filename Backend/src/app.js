const express = require("express");

const healthRoutes = require("./routes/healthRoutes");

const authRoutes = require("./routes/authRoutes");
const app = express();

app.use(express.json());

app.use("/api/health", healthRoutes);

app.use("/api/auth", authRoutes);
module.exports = app;
