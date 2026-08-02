const mongoose = require("mongoose");
const Survey = require("../models/Survey");
const SurveyResponse = require("../models/SurveyResponse");

async function submitSurveyResponse(request, response) {
    try {
        const { surveyId } = request.params;
        const { answers } = request.body || {};

        if (!mongoose.isValidObjectId(surveyId)) {
            return response.status(400).json({
                success: false,
                message: "Invalid survey ID",
            });
        }

        const survey = await Survey.findOne({
            _id: surveyId,
            status: "published",
        });

        if (!survey) {
            return response.status(404).json({
                success: false,
                message: "Published survey not found",
            });
        }

        if (!Array.isArray(answers)) {
            return response.status(400).json({
                success: false,
                message: "Answers must be an array",
            });
        }

        const answerMap = new Map();

        for (const answer of answers) {
            const questionId = String(answer?.questionId || "");

            if (!mongoose.isValidObjectId(questionId)) {
                return response.status(400).json({
                    success: false,
                    message: "Invalid question ID",
                });
            }

            if (answerMap.has(questionId)) {
                return response.status(400).json({
                    success: false,
                    message: "A question cannot be answered more than once",
                });
            }

            answerMap.set(questionId, answer.value);
        }

        const validatedAnswers = [];

        for (const question of survey.questions) {
            const questionId = String(question._id);
            const hasAnswer = answerMap.has(questionId);
            let value = answerMap.get(questionId);

            if (!hasAnswer) {
                if (question.required) {
                    return response.status(400).json({
                        success: false,
                        message: `Answer required for: ${question.text}`,
                    });
                }

                continue;
            }

            if (
                question.type === "short-text" ||
                question.type === "long-text"
            ) {
                if (
                    typeof value !== "string" ||
                    value.trim().length === 0
                ) {
                    return response.status(400).json({
                        success: false,
                        message: `Invalid answer for: ${question.text}`,
                    });
                }

                value = value.trim();
            }

            if (question.type === "multiple-choice") {
                if (
                    typeof value !== "string" ||
                    !question.options.includes(value)
                ) {
                    return response.status(400).json({
                        success: false,
                        message: `Invalid option for: ${question.text}`,
                    });
                }
            }

            if (question.type === "rating") {
                if (
                    !Number.isInteger(value) ||
                    value < 1 ||
                    value > 5
                ) {
                    return response.status(400).json({
                        success: false,
                        message: `Rating must be between 1 and 5 for: ${question.text}`,
                    });
                }
            }

            validatedAnswers.push({
                questionId: question._id,
                value,
            });

            answerMap.delete(questionId);
        }

        if (answerMap.size > 0) {
            return response.status(400).json({
                success: false,
                message: "One or more questions do not belong to this survey",
            });
        }

        const submittedResponse = await SurveyResponse.create({
            survey: survey._id,
            answers: validatedAnswers,
        });

        return response.status(201).json({
            success: true,
            message: "Survey response submitted successfully",
            responseId: submittedResponse._id,
        });
    } catch (error) {
        console.error(
            "Survey response submission failed:",
            error.message
        );

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
            message: "Unable to submit survey response",
        });
    }
}

module.exports = {
    submitSurveyResponse,
};