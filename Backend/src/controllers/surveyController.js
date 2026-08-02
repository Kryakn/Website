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

module.exports = {
    createSurvey,
};