const express = require("express");
const protect = require("../middleware/authMiddleware");
const {
    createSurvey,
    getUserSurveys,
} = require("../controllers/surveyController");

const router = express.Router();

router.post("/", protect, createSurvey);
router.get("/", protect, getUserSurveys);

module.exports = router;