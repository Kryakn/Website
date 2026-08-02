const express = require("express");
const protect = require("../middleware/authMiddleware");
const {
    createSurvey,
    getUserSurveys,
    getSurveyById,
} = require("../controllers/surveyController");

const router = express.Router();

router.post("/", protect, createSurvey);
router.get("/", protect, getUserSurveys);
router.get("/:surveyId", protect, getSurveyById);

module.exports = router;