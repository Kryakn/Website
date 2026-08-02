const express = require("express");
const protect = require("../middleware/authMiddleware");
const {
    createSurvey,
} = require("../controllers/surveyController");

const router = express.Router();

router.post("/", protect, createSurvey);

module.exports = router;