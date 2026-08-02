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
async function updateDraftSurvey(request, response) {
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

        if (survey.status !== "draft") {
            return response.status(409).json({
                success: false,
                message: "Only draft surveys can be updated",
            });
        }

        const editableFields = [
            "title",
            "description",
            "category",
            "questions",
        ];

        const suppliedFields = editableFields.filter((field) =>
            Object.prototype.hasOwnProperty.call(
                request.body || {},
                field
            )
        );

        if (suppliedFields.length === 0) {
            return response.status(400).json({
                success: false,
                message: "At least one editable field is required",
            });
        }

        for (const field of suppliedFields) {
            survey[field] = request.body[field];
        }

        await survey.save();

        return response.status(200).json({
            success: true,
            message: "Survey updated successfully",
            survey,
        });
    } catch (error) {
        console.error("Survey update failed:", error.message);

        if (error.name === "CastError") {
            return response.status(400).json({
                success: false,
                message: "Invalid survey ID",
            });
        }

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
            message: "Unable to update survey",
        });
    }
}
async function publishSurvey(request, response) {
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

        if (survey.status !== "draft") {
            return response.status(409).json({
                success: false,
                message: "Only draft surveys can be published",
            });
        }

        survey.status = "published";
        survey.publishedAt = new Date();

        await survey.save();

        return response.status(200).json({
            success: true,
            message: "Survey published successfully",
            survey,
        });
    } catch (error) {
        console.error("Survey publishing failed:", error.message);

        if (error.name === "CastError") {
            return response.status(400).json({
                success: false,
                message: "Invalid survey ID",
            });
        }

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
            message: "Unable to publish survey",
        });
    }
}
async function deleteDraftSurvey(request, response) {
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

        if (survey.status !== "draft") {
            return response.status(409).json({
                success: false,
                message: "Only draft surveys can be deleted",
            });
        }

        await survey.deleteOne();

        return response.status(200).json({
            success: true,
            message: "Survey deleted successfully",
        });
    } catch (error) {
        console.error("Survey deletion failed:", error.message);

        if (error.name === "CastError") {
            return response.status(400).json({
                success: false,
                message: "Invalid survey ID",
            });
        }

        return response.status(500).json({
            success: false,
            message: "Unable to delete survey",
        });
    }
}
async function getPublishedSurvey(request, response) {
    try {
        const survey = await Survey.findOne({
            _id: request.params.surveyId,
            status: "published",
        }).select("-owner");

        if (!survey) {
            return response.status(404).json({
                success: false,
                message: "Published survey not found",
            });
        }

        return response.status(200).json({
            success: true,
            survey,
        });
    } catch (error) {
        console.error(
            "Published survey retrieval failed:",
            error.message
        );

        if (error.name === "CastError") {
            return response.status(400).json({
                success: false,
                message: "Invalid survey ID",
            });
        }

        return response.status(500).json({
            success: false,
            message: "Unable to retrieve published survey",
        });
    }
}
module.exports = {
    createSurvey,
    getUserSurveys,
    getSurveyById,
    updateDraftSurvey,
    publishSurvey,
    deleteDraftSurvey,
    getPublishedSurvey,
};