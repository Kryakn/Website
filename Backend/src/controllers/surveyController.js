const Survey = require("../models/Survey");

async function createSurvey(request, response) {
    try {
        const {
            title,
            description,
            category,
            questions,
        } = request.body || {};

        const survey = await Survey.create({
            owner: request.user._id,
            title,
            description,
            category,
            questions,

            // New surveys must always begin as drafts.
            status: "draft",
            publishedAt: null,
        });

        return response.status(201).json({
            success: true,
            message: "Survey created successfully",
            survey,
        });
    } catch (error) {
        console.error("Survey creation failed:", error.message);

        if (error.name === "ValidationError") {
            const firstValidationError =
                Object.values(error.errors)[0];

            return response.status(400).json({
                success: false,
                message: firstValidationError.message,
            });
        }

        return response.status(500).json({
            success: false,
            message: "Unable to create survey",
        });
    }
}
async function getUserSurveys(request, response) {
    try {
        const surveys = await Survey.find({
            owner: request.user._id,
        }).sort({
            createdAt: -1,
        });

        return response.status(200).json({
            success: true,
            count: surveys.length,
            surveys,
        });
    } catch (error) {
        console.error("Survey listing failed:", error.message);

        return response.status(500).json({
            success: false,
            message: "Unable to retrieve surveys",
        });
    }
}
async function getSurveyById(request, response) {
    try {
        const survey = await Survey.findOne({
            _id: request.params.surveyId,
            owner: request.user._id,
        });

        if (!survey) {
            return response.status(404).json({
                success: false,
                message: "Survey not found",
            });
        }

        return response.status(200).json({
            success: true,
            survey,
        });
    } catch (error) {
        console.error("Survey retrieval failed:", error.message);

        if (error.name === "CastError") {
            return response.status(400).json({
                success: false,
                message: "Invalid survey ID",
            });
        }

        return response.status(500).json({
            success: false,
            message: "Unable to retrieve survey",
        });
    }
}

module.exports = {
    createSurvey,
    getUserSurveys,
    getSurveyById,
};