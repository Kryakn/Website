document.addEventListener("DOMContentLoaded", async function () {
    const form = document.querySelector("#participation-form");
    const questionsContainer = document.querySelector(
        "#participation-questions"
    );
    const message = document.querySelector("#participation-message");
    const submitButton = form.querySelector(".participation-submit");
    const progressArea = document.querySelector("#survey-progress");
    const progressTrack = progressArea.querySelector(
        ".participation-progress-track"
    );
    const progressFill = progressArea.querySelector(
        ".participation-progress-fill"
    );
    const surveyId = new URLSearchParams(window.location.search).get("id");
    let survey = null;

    function showLoadError(text) {
        document.querySelector("#survey-category").textContent =
            "Unavailable";
        document.querySelector("#survey-title").textContent =
            "Survey could not be opened";
        document.querySelector("#survey-description").textContent = text;
    }

    function questionControl(question) {
        const safeId = window.voxintelApi.escapeHtml(question._id);
        const inputName = `question-${safeId}`;
        const required = question.required ? "required" : "";

        if (question.type === "short-text") {
            return `
                <label for="${inputName}" class="visually-hidden">${window.voxintelApi.escapeHtml(question.text)}</label>
                <input class="participation-text-input" id="${inputName}" name="${inputName}" type="text" ${required} placeholder="Type your answer">
            `;
        }

        if (question.type === "long-text") {
            return `
                <label for="${inputName}" class="visually-hidden">${window.voxintelApi.escapeHtml(question.text)}</label>
                <textarea id="${inputName}" name="${inputName}" rows="5" ${required} placeholder="Type your answer"></textarea>
            `;
        }

        if (question.type === "multiple-choice") {
            return `
                <div class="participation-options">
                    ${question.options.map(function (option) {
                        const safeOption = window.voxintelApi.escapeHtml(option);
                        return `
                            <label class="participation-option">
                                <input type="radio" name="${inputName}" value="${safeOption}" ${required}>
                                <span>${safeOption}</span>
                            </label>
                        `;
                    }).join("")}
                </div>
            `;
        }

        return `
            <div class="participation-rating">
                ${[1, 2, 3, 4, 5].map(function (rating) {
                    return `
                        <label>
                            <input type="radio" name="${inputName}" value="${rating}" ${required}>
                            <span>${rating}</span>
                        </label>
                    `;
                }).join("")}
            </div>
            <div class="participation-rating-labels">
                <span>Low</span><span>High</span>
            </div>
        `;
    }

    function renderSurvey() {
        const questionCount = survey.questions.length;
        document.title = `${survey.title} | VoxIntel`;
        document.querySelector("#survey-category").textContent =
            survey.category.charAt(0).toUpperCase() + survey.category.slice(1);
        document.querySelector("#survey-title").textContent = survey.title;
        document.querySelector("#survey-description").textContent =
            survey.description || "Please answer the questions below.";
        document.querySelector("#survey-duration").textContent =
            `${Math.max(1, Math.ceil(questionCount / 2))} minute${questionCount > 2 ? "s" : ""}`;
        document.querySelector("#survey-question-count").textContent =
            `${questionCount} question${questionCount === 1 ? "" : "s"}`;

        questionsContainer.innerHTML = survey.questions
            .map(function (question, index) {
                return `
                    <fieldset class="participation-question" data-question-id="${question._id}" data-question-type="${question.type}">
                        <legend>
                            <span>${index + 1}</span>
                            ${window.voxintelApi.escapeHtml(question.text)}
                            ${question.required ? '<strong aria-label="Required">*</strong>' : ""}
                        </legend>
                        ${questionControl(question)}
                    </fieldset>
                `;
            })
            .join("");

        document.querySelector("#survey-meta").removeAttribute("hidden");
        progressArea.removeAttribute("hidden");
        form.removeAttribute("hidden");
        updateProgress();
    }

    function getAnswer(question) {
        const name = `question-${question._id}`;

        if (
            question.type === "multiple-choice" ||
            question.type === "rating"
        ) {
            const selected = form.querySelector(
                `[name="${name}"]:checked`
            );

            if (!selected) {
                return undefined;
            }

            return question.type === "rating"
                ? Number(selected.value)
                : selected.value;
        }

        const value = form.elements[name].value.trim();
        return value || undefined;
    }

    function updateProgress() {
        if (!survey) {
            return;
        }

        const answered = survey.questions.filter(function (question) {
            return getAnswer(question) !== undefined;
        }).length;
        const percent = survey.questions.length
            ? Math.round((answered / survey.questions.length) * 100)
            : 0;

        document.querySelector("#survey-progress-text").textContent =
            `${answered} of ${survey.questions.length}`;
        progressTrack.setAttribute("aria-valuenow", String(percent));
        progressFill.style.width = `${percent}%`;
    }

    form.addEventListener("input", updateProgress);
    form.addEventListener("change", updateProgress);

    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        if (!form.reportValidity()) {
            return;
        }

        const answers = survey.questions
            .map(function (question) {
                return {
                    questionId: question._id,
                    value: getAnswer(question)
                };
            })
            .filter(function (answer) {
                return answer.value !== undefined;
            });

        submitButton.disabled = true;
        submitButton.innerHTML =
            '<i class="fa-solid fa-spinner fa-spin"></i> Submitting...';
        message.textContent = "";
        message.className = "participation-message";

        try {
            await window.voxintelApi.request(
                `/surveys/public/${surveyId}/responses`,
                { method: "POST", body: { answers } }
            );

            progressFill.style.width = "100%";
            progressTrack.setAttribute("aria-valuenow", "100");
            document.querySelector("#survey-progress-text").textContent =
                `${survey.questions.length} of ${survey.questions.length}`;
            form.innerHTML = `
                <div class="participation-introduction participation-success">
                    <span class="participation-category">Response saved</span>
                    <h2>Thank you for your feedback.</h2>
                    <p>Your answers were submitted successfully to VoxIntel.</p>
                </div>
            `;
        } catch (error) {
            console.error("Response submission failed:", error);
            message.textContent = error.message;
            message.className = "participation-message is-error";
            submitButton.disabled = false;
            submitButton.innerHTML =
                'Submit Response <i class="fa-solid fa-arrow-right"></i>';
        }
    });

    if (!surveyId) {
        showLoadError("This link does not contain a survey ID.");
        return;
    }

    try {
        const data = await window.voxintelApi.request(
            `/surveys/public/${encodeURIComponent(surveyId)}`,
            { method: "GET" }
        );

        survey = data.survey;
        renderSurvey();
    } catch (error) {
        console.error("Unable to load public survey:", error);
        showLoadError(error.message);
    }
});
