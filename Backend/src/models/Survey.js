const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
    text: {
        type: String,
        required: [true, "Question text is required"],
        trim: true,
        maxlength: [500, "Question cannot exceed 500 characters"],
    },

    type: {
        type: String,
        required: [true, "Question type is required"],
        enum: {
            values: [
                "short-text",
                "long-text",
                "multiple-choice",
                "rating",
            ],
            message: "{VALUE} is not a supported question type",
        },
    },

    required: {
        type: Boolean,
        default: true,
    },

    options: {
        type: [
            {
                type: String,
                trim: true,
                maxlength: [
                    200,
                    "An option cannot exceed 200 characters",
                ],
            },
        ],
        default: [],

        validate: {
            validator: function (options) {
                if (this.type !== "multiple-choice") {
                    return true;
                }

                return options.length >= 2 && options.length <= 20;
            },
            message:
                "Multiple-choice questions must contain between 2 and 20 options",
        },
    },
});

const surveySchema = new mongoose.Schema(
    {
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Survey owner is required"],
            index: true,
        },

        title: {
            type: String,
            required: [true, "Survey title is required"],
            trim: true,
            maxlength: [
                120,
                "Survey title cannot exceed 120 characters",
            ],
        },

        description: {
            type: String,
            trim: true,
            maxlength: [
                1000,
                "Survey description cannot exceed 1000 characters",
            ],
            default: "",
        },

        category: {
            type: String,
            enum: {
                values: [
                    "feedback",
                    "education",
                    "research",
                    "event",
                    "other",
                ],
                message: "{VALUE} is not a supported survey category",
            },
            default: "other",
        },

        status: {
            type: String,
            enum: {
                values: ["draft", "published"],
                message: "{VALUE} is not a valid survey status",
            },
            default: "draft",
        },

        questions: {
            type: [questionSchema],
            required: [true, "At least one question is required"],

            validate: {
                validator: function (questions) {
                    return (
                        questions.length >= 1 &&
                        questions.length <= 50
                    );
                },
                message:
                    "A survey must contain between 1 and 50 questions",
            },
        },

        publishedAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

surveySchema.index({
    owner: 1,
    createdAt: -1,
});

const Survey = mongoose.model("Survey", surveySchema);

module.exports = Survey;