const express = require("express");
const mongoose = require("mongoose");

const router = express.Router();

router.get("/", function (request, response) {
    const databaseConnected = mongoose.connection.readyState === 1;

    const statusCode = databaseConnected ? 200 : 503;

    response.status(statusCode).json({
        success: databaseConnected,
        message: databaseConnected
            ? "VoxIntel API and database are healthy"
            : "VoxIntel API is running, but database is unavailable",
        services: {
            api: "running",
            database: databaseConnected
                ? "connected"
                : "disconnected",
        },
        timestamp: new Date().toISOString(),
    });
});

module.exports = router;