const express = require("express");
const cors = require("cors");

const healthRoutes = require("./routes/healthRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();

app.use(
    cors({
        origin: [
            "http://127.0.0.1:5500",
            "http://localhost:5500",
        ],
    })
);

app.use(express.json());

app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);

module.exports = app;