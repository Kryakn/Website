const express = require("express");
const protect = require("../middleware/authMiddleware");
const {
    createSurvey,
    getUserSurveys,
    getSurveyById,
    updateDraftSurvey,
    publishSurvey,
    deleteDraftSurvey,
    getPublishedSurvey,
} = require("../controllers/surveyController");

const router = express.Router();

router.post("/", protect, createSurvey);
router.get("/", protect, getUserSurveys);

router.get("/public/:surveyId", getPublishedSurvey);

router.get("/:surveyId", protect, getSurveyById);
router.patch("/:surveyId", protect, updateDraftSurvey);
router.patch("/:surveyId/publish", protect, publishSurvey);
router.delete("/:surveyId", protect, deleteDraftSurvey);


module.exports = router;