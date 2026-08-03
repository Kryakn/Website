document.addEventListener("DOMContentLoaded", async function () {
    if (!window.voxintelApi) {
        console.error("VoxIntel API helper is unavailable.");
        return;
    }

    const pageContent = document.querySelector(".app-content");
    const title = document.querySelector("#results-title");
    const description = document.querySelector("#results-description");
    const status = document.querySelector("#results-status");
    const responseCount = document.querySelector(
        "#results-response-count"
    );
    const questionCount = document.querySelector(
        "#results-question-count"
    );
    const publishedDate = document.querySelector(
        "#results-published-date"
    );
    const questionList = document.querySelector(
        "#results-question-list"
    );
    const analyticsState = document.querySelector(
        "#analytics-state"
    );
    const questionAnalyticsSection = document.querySelector(
        "#question-analytics-section"
    );
    const questionAnalyticsList = document.querySelector(
        "#question-analytics-list"
    );
    const completionRate = document.querySelector(
        "#results-completion-rate"
    );
    const responsesOverTimeSection = document.querySelector(
        "#responses-over-time-section"
    );
    const responsesOverTimeTotal = document.querySelector(
        "#responses-over-time-total"
    );
    const responsesOverTimeChart = document.querySelector(
        "#responses-over-time-chart"
    );

    function createTextElement(tagName, text, className) {
        const element = document.createElement(tagName);
        element.textContent = text;

        if (className) {
            element.className = className;
        }

        return element;
    }

    function replaceWithMessage(container, message) {
        const messageElement = createTextElement("p", message);
        container.replaceChildren(messageElement);
    }

    function showLoading() {
        pageContent?.setAttribute("aria-busy", "true");

        status.textContent = "Loading";
        title.textContent = "Loading survey...";
        description.textContent =
            "Reading survey details and analytics from VoxIntel.";

        responseCount.textContent = "—";
        questionCount.textContent = "—";
        publishedDate.textContent = "—";
        completionRate.textContent = "—";

        replaceWithMessage(
            questionList,
            "Loading survey questions..."
        );

        replaceWithMessage(
            analyticsState,
            "Loading response analytics..."
        );
    }

    function showError(message) {
        pageContent?.setAttribute("aria-busy", "false");

        status.textContent = "Unavailable";
        title.textContent = "Results could not be loaded";
        description.textContent = message;

        responseCount.textContent = "—";
        questionCount.textContent = "—";
        publishedDate.textContent = "—";
        completionRate.textContent = "—";

        replaceWithMessage(questionList, message);
        replaceWithMessage(analyticsState, message);
    }

    function renderQuestions(questions) {
        if (questions.length === 0) {
            replaceWithMessage(
                questionList,
                "This survey does not contain any questions."
            );
            return;
        }

        const fragment = document.createDocumentFragment();

        questions.forEach(function (question, index) {
            const item = document.createElement("div");
            item.className = "results-question-item";

            const questionNumber = createTextElement(
                "span",
                String(index + 1)
            );

            const questionDetails = document.createElement("div");

            const questionText = createTextElement(
                "strong",
                question.text || "Untitled question"
            );

            const questionType = String(
                question.type || "unknown"
            ).replaceAll("-", " ");

            const questionMeta = createTextElement(
                "p",
                `${questionType}${question.required
                    ? " · required"
                    : " · optional"
                }`
            );

            questionDetails.append(questionText, questionMeta);
            item.append(questionNumber, questionDetails);
            fragment.append(item);
        });

        questionList.replaceChildren(fragment);
    }
    function normalizeCount(value) {
        const count = Number(value);

        return Number.isFinite(count) && count > 0
            ? Math.trunc(count)
            : 0;
    }

    function normalizePercentage(value) {
        const percentage = Number(value);

        if (!Number.isFinite(percentage)) {
            return 0;
        }

        return Math.min(100, Math.max(0, percentage));
    }

    function formatPercentage(value) {
        const percentage = normalizePercentage(value);

        return Number.isInteger(percentage)
            ? String(percentage)
            : percentage.toFixed(2);
    }

    function formatQuestionType(type) {
        return String(type || "unknown").replaceAll("-", " ");
    }

    function createDistributionRow(label, count, percentage) {
        const safeCount = normalizeCount(count);
        const safePercentage = normalizePercentage(percentage);
        const formattedPercentage =
            formatPercentage(safePercentage);

        const row = document.createElement("div");
        row.className = "results-distribution-row";

        const labelElement = createTextElement(
            "span",
            `${label} · ${safeCount}`
        );

        const progress = document.createElement("progress");
        progress.className = "results-distribution-progress";
        progress.max = 100;
        progress.value = safePercentage;
        progress.setAttribute(
            "aria-label",
            `${label}: ${formattedPercentage}%`
        );

        const percentageElement = createTextElement(
            "strong",
            `${formattedPercentage}%`
        );

        row.append(
            labelElement,
            progress,
            percentageElement
        );

        return row;
    }

    function renderMultipleChoiceAnalytics(
        container,
        questionAnalytics
    ) {
        const options = Array.isArray(questionAnalytics.options)
            ? questionAnalytics.options
            : [];

        if (options.length === 0) {
            container.append(
                createTextElement(
                    "p",
                    "No multiple-choice options are available."
                )
            );
            return;
        }

        const distribution = document.createElement("div");
        distribution.className = "results-distribution";

        options.forEach(function (optionResult) {
            distribution.append(
                createDistributionRow(
                    String(optionResult.option || "Untitled option"),
                    optionResult.count,
                    optionResult.percentage
                )
            );
        });

        container.append(distribution);
    }

    function renderRatingAnalytics(
        container,
        questionAnalytics
    ) {
        const average = Number(
            questionAnalytics.averageRating
        );

        const safeAverage = Number.isFinite(average)
            ? Math.min(5, Math.max(0, average))
            : 0;

        const averageSummary = document.createElement("div");
        averageSummary.className = "results-rating-summary";

        averageSummary.append(
            createTextElement("span", "Average rating"),
            createTextElement(
                "strong",
                `${safeAverage.toFixed(2)} / 5`
            )
        );

        container.append(averageSummary);

        const distributionValues = Array.isArray(
            questionAnalytics.distribution
        )
            ? questionAnalytics.distribution
            : [];

        if (distributionValues.length === 0) {
            container.append(
                createTextElement(
                    "p",
                    "No rating distribution is available."
                )
            );
            return;
        }

        const distribution = document.createElement("div");
        distribution.className = "results-distribution";

        distributionValues.forEach(function (ratingResult) {
            const rating = normalizeCount(ratingResult.rating);
            const label =
                rating === 1 ? "1 star" : `${rating} stars`;

            distribution.append(
                createDistributionRow(
                    label,
                    ratingResult.count,
                    ratingResult.percentage
                )
            );
        });

        container.append(distribution);
    }

    function renderWrittenAnswers(
        container,
        questionAnalytics
    ) {
        const answers = Array.isArray(questionAnalytics.answers)
            ? questionAnalytics.answers
            : [];

        if (answers.length === 0) {
            container.append(
                createTextElement(
                    "p",
                    "No written answers were submitted."
                )
            );
            return;
        }

        const answerList = document.createElement("div");
        answerList.className = "results-written-answer-list";

        answers.forEach(function (answer) {
            const answerCard = document.createElement("article");
            answerCard.className = "results-written-answer";

            const answerText = createTextElement(
                "p",
                String(answer.value || "Empty response")
            );

            const submittedDate = document.createElement("time");
            submittedDate.textContent = answer.submittedAt
                ? window.voxintelApi.formatDate(
                    answer.submittedAt
                )
                : "Date unavailable";

            if (answer.submittedAt) {
                submittedDate.dateTime = String(
                    answer.submittedAt
                );
            }

            answerCard.append(answerText, submittedDate);
            answerList.append(answerCard);
        });

        container.append(answerList);
    }

    function renderQuestionAnalytics(
        questionAnalytics,
        totalResponses
    ) {
        questionAnalyticsList.replaceChildren();

        if (totalResponses === 0) {
            questionAnalyticsSection.hidden = true;
            return;
        }

        questionAnalyticsSection.hidden = false;

        if (questionAnalytics.length === 0) {
            replaceWithMessage(
                questionAnalyticsList,
                "No question analytics are available."
            );
            return;
        }

        const fragment = document.createDocumentFragment();

        questionAnalytics.forEach(function (
            analytics,
            index
        ) {
            const card = document.createElement("article");
            card.className =
                "results-panel results-question-analytics-card";

            const header = document.createElement("div");
            header.className =
                "results-question-analytics-header";

            const headingContent = document.createElement("div");

            const heading = createTextElement(
                "h3",
                `${index + 1}. ${analytics.text || "Untitled question"
                }`
            );

            const responseCount = normalizeCount(
                analytics.responseCount
            );
            const unansweredCount = normalizeCount(
                analytics.unansweredCount
            );

            const responseMeta = createTextElement(
                "p",
                `${responseCount} answered · ${unansweredCount} unanswered`
            );

            headingContent.append(heading, responseMeta);

            const typeBadge = createTextElement(
                "span",
                formatQuestionType(analytics.type),
                "results-question-type"
            );

            header.append(headingContent, typeBadge);
            card.append(header);

            const body = document.createElement("div");
            body.className =
                "results-question-analytics-body";

            if (analytics.type === "multiple-choice") {
                renderMultipleChoiceAnalytics(
                    body,
                    analytics
                );
            } else if (analytics.type === "rating") {
                renderRatingAnalytics(body, analytics);
            } else if (
                analytics.type === "short-text" ||
                analytics.type === "long-text"
            ) {
                renderWrittenAnswers(body, analytics);
            } else {
                body.append(
                    createTextElement(
                        "p",
                        "This question type does not have a supported analytics view."
                    )
                );
            }

            card.append(body);
            fragment.append(card);
        });

        questionAnalyticsList.append(fragment);
    }

    function calculateCompletionRate(
        questionAnalytics,
        totalResponses
    ) {
        if (
            totalResponses === 0 ||
            questionAnalytics.length === 0
        ) {
            return 0;
        }

        const totalPossibleAnswers =
            totalResponses * questionAnalytics.length;

        const totalAnswered = questionAnalytics.reduce(
            function (sum, analytics) {
                return (
                    sum +
                    normalizeCount(analytics.responseCount)
                );
            },
            0
        );

        const rate =
            (totalAnswered / totalPossibleAnswers) * 100;

        return Math.min(100, Math.max(0, rate));
    }

    function renderResponsesOverTime(
        responsesOverTime,
        totalResponses
    ) {
        responsesOverTimeChart.replaceChildren();

        const responseLabel =
            totalResponses === 1 ? "response" : "responses";

        responsesOverTimeTotal.textContent =
            `${totalResponses} ${responseLabel}`;

        if (totalResponses === 0) {
            responsesOverTimeSection.hidden = true;
            return;
        }

        responsesOverTimeSection.hidden = false;

        if (responsesOverTime.length === 0) {
            replaceWithMessage(
                responsesOverTimeChart,
                "No response timeline is available."
            );
            return;
        }

        const counts = responsesOverTime.map(function (entry) {
            return normalizeCount(entry.count);
        });

        const maximumCount = Math.max(...counts, 1);
        const fragment = document.createDocumentFragment();

        responsesOverTime.forEach(function (entry) {
            const count = normalizeCount(entry.count);
            const heightPercentage =
                (count / maximumCount) * 100;

            const column = document.createElement("div");
            column.className = "results-chart-column";

            const countElement = createTextElement(
                "strong",
                String(count)
            );

            const bar = document.createElement("div");
            bar.className = "results-bar";
            bar.style.height = `${heightPercentage}%`;

            bar.setAttribute("role", "progressbar");
            bar.setAttribute("aria-valuemin", "0");
            bar.setAttribute(
                "aria-valuemax",
                String(maximumCount)
            );
            bar.setAttribute("aria-valuenow", String(count));
            bar.setAttribute(
                "aria-label",
                `${count} responses received on ${entry.date}`
            );

            const dateElement = document.createElement("time");
            dateElement.textContent = entry.date
                ? window.voxintelApi.formatDate(entry.date)
                : "Unknown date";

            if (entry.date) {
                dateElement.dateTime = String(entry.date);
            }

            column.append(countElement, bar, dateElement);
            fragment.append(column);
        });

        responsesOverTimeChart.append(fragment);
    }
    function renderAnalyticsConnection(totalResponses) {
        const responseLabel =
            totalResponses === 1 ? "response" : "responses";

        if (totalResponses === 0) {
            const heading = createTextElement(
                "strong",
                "No responses yet"
            );

            const message = createTextElement(
                "p",
                "Analytics will appear after participants submit this survey."
            );

            analyticsState.replaceChildren(heading, message);
            return;
        }

        const heading = createTextElement(
            "strong",
            `${totalResponses} ${responseLabel} loaded`
        );

        const message = createTextElement(
            "p",
            "Real question-wise analytics were received successfully."
        );

        analyticsState.replaceChildren(heading, message);
    }

    function renderResults(survey, analyticsData) {
        const questions = Array.isArray(survey.questions)
            ? survey.questions
            : [];

        const totalResponses = Number.isFinite(
            analyticsData.totalResponses
        )
            ? analyticsData.totalResponses
            : 0;

        status.textContent =
            survey.status === "published"
                ? "Published"
                : "Draft";

        title.textContent = survey.title || "Untitled survey";

        description.textContent =
            survey.description ||
            "No survey description provided.";

        responseCount.textContent = String(totalResponses);
        questionCount.textContent = String(questions.length);

        publishedDate.textContent = survey.publishedAt
            ? window.voxintelApi.formatDate(survey.publishedAt)
            : "Not yet";

        renderQuestions(questions);
        renderAnalyticsConnection(totalResponses);
        renderQuestionAnalytics(
            analyticsData.questionAnalytics,
            totalResponses
        );
        const calculatedCompletionRate =
            calculateCompletionRate(
                analyticsData.questionAnalytics,
                totalResponses
            );

        completionRate.textContent =
            `${formatPercentage(calculatedCompletionRate)}%`;

        renderResponsesOverTime(
            analyticsData.responsesOverTime,
            totalResponses
        );

        pageContent?.setAttribute("aria-busy", "false");
    }

    showLoading();

    const surveyId = new URLSearchParams(
        window.location.search
    )
        .get("id")
        ?.trim();

    if (!surveyId) {
        showError(
            "Survey ID is missing. Open Results from the My Surveys page."
        );
        return;
    }

    try {
        const [surveyData, analyticsData] = await Promise.all([
            window.voxintelApi.request(
                `/surveys/${encodeURIComponent(surveyId)}`,
                {
                    method: "GET",
                    auth: true
                }
            ),
            window.voxintelApi.request(
                `/surveys/${encodeURIComponent(
                    surveyId
                )}/analytics`,
                {
                    method: "GET",
                    auth: true
                }
            )
        ]);

        const survey = surveyData.survey;
        const analyticsSurvey = analyticsData.survey;

        if (
            !survey ||
            !Array.isArray(survey.questions) ||
            !analyticsSurvey ||
            !Array.isArray(
                analyticsData.questionAnalytics
            ) ||
            !Array.isArray(
                analyticsData.responsesOverTime
            )
        ) {
            throw new Error(
                "The server returned incomplete results data."
            );
        }

        if (
            String(survey._id) !==
            String(analyticsSurvey._id)
        ) {
            throw new Error(
                "Survey details and analytics do not match."
            );
        }

        renderResults(survey, analyticsData);
    } catch (error) {
        if (error.status === 401 || error.status === 403) {
            return;
        }

        console.error(
            "Unable to load survey analytics:",
            error
        );

        showError(
            error.message ||
            "The survey results could not be loaded."
        );
    }
});