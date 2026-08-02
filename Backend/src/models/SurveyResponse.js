const mongoose = require("mongoose");

const answerSchema = new mongoose.Schema(
    {
        questionId: {
            type: mongoose.Schema.Types.ObjectId,
            required: [true, "Question ID is required"],
        },

        value: {
            type: mongoose.Schema.Types.Mixed,
            required: [true, "Answer value is required"],
        },
    },
    {
        _id: false,
    }
);

const surveyResponseSchema = new mongoose.Schema(
    {
        survey: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Survey",
            required: [true, "Survey is required"],
            index: true,
        },

        answers: {
            type: [answerSchema],
            required: [true, "Answers are required"],
        },
    },
    {
        timestamps: true,
    }
);

surveyResponseSchema.index({
    survey: 1,
    createdAt: -1,
});

const SurveyResponse = mongoose.model(
    "SurveyResponse",
    surveyResponseSchema
);

module.exports = SurveyResponse;