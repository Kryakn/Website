const express = require("express");
const protect = require("../middleware/authMiddleware");
const {
    createSurvey,
    getUserSurveys,
    getSurveyById,
    updateDraftSurvey,
     publishSurvey,
} = require("../controllers/surveyController");

const router = express.Router();

router.post("/", protect, createSurvey);
router.get("/", protect, getUserSurveys);
router.get("/:surveyId", protect, getSurveyById);
router.patch("/:surveyId", protect, updateDraftSurvey);
router.patch("/:surveyId/publish", protect, publishSurvey);

module.exports = router;