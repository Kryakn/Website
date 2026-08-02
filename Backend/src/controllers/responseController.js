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

async function getSurveyResponses(request, response) {
    try {
        const { surveyId } = request.params;

        if (!mongoose.isValidObjectId(surveyId)) {
            return response.status(400).json({
                success: false,
                message: "Invalid survey ID",
            });
        }

        const survey = await Survey.findOne({
            _id: surveyId,
            owner: request.user._id,
        }).select("_id title status questions");

        if (!survey) {
            return response.status(404).json({
                success: false,
                message: "Survey not found",
            });
        }

        const responses = await SurveyResponse.find({
            survey: survey._id,
        }).sort({
            createdAt: -1,
        });

        return response.status(200).json({
            success: true,
            count: responses.length,
            survey,
            responses,
        });
    } catch (error) {
        console.error(
            "Survey response retrieval failed:",
            error.message
        );

        return response.status(500).json({
            success: false,
            message: "Unable to retrieve survey responses",
        });
    }
}
async function getSurveyAnalytics(request, response) {
    try {
        const { surveyId } = request.params;

        if (!mongoose.isValidObjectId(surveyId)) {
            return response.status(400).json({
                success: false,
                message: "Invalid survey ID",
            });
        }

        const survey = await Survey.findOne({
            _id: surveyId,
            owner: request.user._id,
        }).select("_id title status questions");

        if (!survey) {
            return response.status(404).json({
                success: false,
                message: "Survey not found",
            });
        }

        const [aggregationResult] = await SurveyResponse.aggregate([
            {
                $match: {
                    survey: survey._id,
                },
            },
            {
                $facet: {
                    summary: [
                        {
                            $count: "totalResponses",
                        },
                    ],

                    answerRows: [
                        {
                            $unwind: "$answers",
                        },
                        {
                            $project: {
                                _id: 0,
                                questionId: "$answers.questionId",
                                value: "$answers.value",
                                submittedAt: "$createdAt",
                            },
                        },
                    ],

                    responsesOverTime: [
                        {
                            $group: {
                                _id: {
                                    $dateToString: {
                                        format: "%Y-%m-%d",
                                        date: "$createdAt",
                                    },
                                },
                                count: {
                                    $sum: 1,
                                },
                            },
                        },
                        {
                            $sort: {
                                _id: 1,
                            },
                        },
                    ],
                },
            },
        ]);

        const analyticsData = aggregationResult || {
            summary: [],
            answerRows: [],
            responsesOverTime: [],
        };

        const totalResponses =
            analyticsData.summary[0]?.totalResponses || 0;

        const questionAnalytics = survey.questions.map(
            (question) => {
                const questionRows =
                    analyticsData.answerRows.filter(
                        (row) =>
                            String(row.questionId) ===
                            String(question._id)
                    );

                const analytics = {
                    questionId: question._id,
                    text: question.text,
                    type: question.type,
                    responseCount: questionRows.length,
                    unansweredCount:
                        totalResponses - questionRows.length,
                };

                if (question.type === "multiple-choice") {
                    const optionCounts = new Map(
                        question.options.map((option) => [
                            option,
                            0,
                        ])
                    );

                    for (const row of questionRows) {
                        const selectedOption = String(row.value);

                        if (optionCounts.has(selectedOption)) {
                            optionCounts.set(
                                selectedOption,
                                optionCounts.get(selectedOption) + 1
                            );
                        }
                    }

                    analytics.options = question.options.map(
                        (option) => {
                            const count =
                                optionCounts.get(option) || 0;

                            const percentage =
                                questionRows.length === 0
                                    ? 0
                                    : Number(
                                          (
                                              (count /
                                                  questionRows.length) *
                                              100
                                          ).toFixed(2)
                                      );

                            return {
                                option,
                                count,
                                percentage,
                            };
                        }
                    );
                }

                if (question.type === "rating") {
                    const ratings = questionRows
                        .map((row) => Number(row.value))
                        .filter(
                            (rating) =>
                                Number.isInteger(rating) &&
                                rating >= 1 &&
                                rating <= 5
                        );

                    const ratingTotal = ratings.reduce(
                        (sum, rating) => sum + rating,
                        0
                    );

                    analytics.averageRating =
                        ratings.length === 0
                            ? 0
                            : Number(
                                  (
                                      ratingTotal / ratings.length
                                  ).toFixed(2)
                              );

                    analytics.distribution = [1, 2, 3, 4, 5].map(
                        (rating) => {
                            const count = ratings.filter(
                                (value) => value === rating
                            ).length;

                            const percentage =
                                ratings.length === 0
                                    ? 0
                                    : Number(
                                          (
                                              (count /
                                                  ratings.length) *
                                              100
                                          ).toFixed(2)
                                      );

                            return {
                                rating,
                                count,
                                percentage,
                            };
                        }
                    );
                }

                if (
                    question.type === "short-text" ||
                    question.type === "long-text"
                ) {
                    analytics.answers = questionRows.map((row) => ({
                        value: String(row.value),
                        submittedAt: row.submittedAt,
                    }));
                }

                return analytics;
            }
        );

        const responsesOverTime =
            analyticsData.responsesOverTime.map((item) => ({
                date: item._id,
                count: item.count,
            }));

        return response.status(200).json({
            success: true,
            survey: {
                _id: survey._id,
                title: survey.title,
                status: survey.status,
            },
            totalResponses,
            questionAnalytics,
            responsesOverTime,
        });
    } catch (error) {
        console.error(
            "Survey analytics retrieval failed:",
            error.message
        );

        return response.status(500).json({
            success: false,
            message: "Unable to retrieve survey analytics",
        });
    }
}

module.exports = {
    submitSurveyResponse,
    getSurveyResponses,
    getSurveyAnalytics,
};