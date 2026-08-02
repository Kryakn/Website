document.addEventListener("DOMContentLoaded", function () {
    const questionsContainer = document.querySelector(
        "#questions-container"
    );

    const addQuestionButton = document.querySelector(
        "#add-question-button"
    );

    const surveyForm = document.querySelector(
        "#survey-builder-form"
    );

    const surveyTitleInput = document.querySelector(
        "#survey-title"
    );

    const formMessage = document.querySelector(
        "#builder-form-message"
    );

    const saveDraftButton = document.querySelector(
        ".builder-draft-button"
    );

    const publishButton = document.querySelector(
        ".builder-publish-button"
    );

    if (
        !questionsContainer ||
        !addQuestionButton ||
        !surveyForm ||
        !surveyTitleInput ||
        !formMessage ||
        !saveDraftButton ||
        !publishButton ||
        !window.voxintelApi
    ) {
        return;
    }

    /*
     * Creates the HTML for a new question.
     */
    function createQuestionCard(questionNumber) {
        return `
            <article class="question-card">

                <div class="question-card-header">
                    <span>Question ${questionNumber}</span>

                    <button
                        type="button"
                        class="remove-question-button"
                        aria-label="Remove question ${questionNumber}"
                    >
                        <i class="fa-regular fa-trash-can"></i>
                    </button>
                </div>

                <div class="builder-field">
                    <label for="question-${questionNumber}">
                        Question text
                    </label>

                    <input
                        type="text"
                        id="question-${questionNumber}"
                        placeholder="Enter your question"
                    >
                </div>

                <div class="builder-field">
                    <label for="question-type-${questionNumber}">
                        Question type
                    </label>

                    <select id="question-type-${questionNumber}">
                        <option value="short-text">
                            Short answer
                        </option>

                        <option value="long-text">
                            Long answer
                        </option>

                        <option value="multiple-choice">
                            Multiple choice
                        </option>

                        <option value="rating">
                            Rating
                        </option>
                    </select>
                </div>

                <label class="required-question-control">
                    <input type="checkbox" checked>
                    <span>Required question</span>
                </label>

            </article>
        `;
    }

    /*
     * Creates one multiple-choice option.
     */
    function createOptionRow(optionNumber) {
        return `
            <div class="choice-option-row">
                <span>${optionNumber}</span>

                <input
                    type="text"
                    class="choice-option-input"
                    placeholder="Option ${optionNumber}"
                >

                <button
                    type="button"
                    class="remove-option-button"
                    aria-label="Remove option ${optionNumber}"
                >
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>
        `;
    }

    /*
     * Creates the complete multiple-choice options editor.
     */
    function createOptionsEditor() {
        return `
            <div class="multiple-choice-editor">

                <div class="choice-editor-header">
                    <span>Answer options</span>

                    <button
                        type="button"
                        class="add-option-button"
                    >
                        <i class="fa-solid fa-plus"></i>
                        Add Option
                    </button>
                </div>

                <div class="choice-options-list">
                    ${createOptionRow(1)}
                    ${createOptionRow(2)}
                </div>

            </div>
        `;
    }

    /*
     * Renumbers multiple-choice options and controls
     * whether their remove buttons are enabled.
     */
    function updateOptionNumbers(optionsEditor) {
        const optionRows = optionsEditor.querySelectorAll(
            ".choice-option-row"
        );

        optionRows.forEach(function (row, index) {
            const optionNumber = index + 1;

            const number = row.querySelector(
                ".choice-option-row > span"
            );

            const input = row.querySelector(
                ".choice-option-input"
            );

            const removeButton = row.querySelector(
                ".remove-option-button"
            );

            number.textContent = optionNumber;
            input.placeholder = `Option ${optionNumber}`;

            removeButton.setAttribute(
                "aria-label",
                `Remove option ${optionNumber}`
            );

            removeButton.disabled = optionRows.length <= 2;
        });
    }

    /*
     * Displays or removes the multiple-choice editor
     * when the question type changes.
     */
    function handleQuestionTypeChange(typeSelect) {
        const questionCard = typeSelect.closest(
            ".question-card"
        );

        const existingEditor = questionCard.querySelector(
            ".multiple-choice-editor"
        );

        if (typeSelect.value === "multiple-choice") {
            if (existingEditor) {
                return;
            }

            const typeField = typeSelect.closest(
                ".builder-field"
            );

            typeField.insertAdjacentHTML(
                "afterend",
                createOptionsEditor()
            );

            const newEditor = questionCard.querySelector(
                ".multiple-choice-editor"
            );

            updateOptionNumbers(newEditor);

            const firstOptionInput = newEditor.querySelector(
                ".choice-option-input"
            );

            firstOptionInput.focus();

            return;
        }

        if (existingEditor) {
            existingEditor.remove();
        }
    }

    /*
     * Removes all previous validation messages and styles.
     */
    function clearValidationErrors() {
        const invalidFields = surveyForm.querySelectorAll(
            ".field-invalid"
        );

        invalidFields.forEach(function (field) {
            field.classList.remove("field-invalid");
            field.removeAttribute("aria-invalid");
        });

        const errorMessages = surveyForm.querySelectorAll(
            ".builder-field-error"
        );

        errorMessages.forEach(function (message) {
            message.remove();
        });

        formMessage.textContent = "";
        formMessage.className = "builder-form-message";
    }

    /*
     * Displays an error below one form field.
     */
    function showFieldError(field, message) {
        field.classList.add("field-invalid");
        field.setAttribute("aria-invalid", "true");

        const errorElement = document.createElement("p");

        errorElement.className = "builder-field-error";
        errorElement.textContent = message;

        field.insertAdjacentElement(
            "afterend",
            errorElement
        );
    }

    /*
     * Validates the survey title, questions and options.
     */
    function validateSurvey() {
        clearValidationErrors();

        let isValid = true;
        let firstInvalidField = null;

        if (surveyTitleInput.value.trim() === "") {
            showFieldError(
                surveyTitleInput,
                "Please enter a survey title."
            );

            firstInvalidField = surveyTitleInput;
            isValid = false;
        }

        const questionCards = questionsContainer.querySelectorAll(
            ".question-card"
        );

        questionCards.forEach(function (card, index) {
            const questionNumber = index + 1;

            const questionInput = card.querySelector(
                '.builder-field input[type="text"]'
            );

            const typeSelect = card.querySelector(
                'select[id^="question-type-"]'
            );

            if (questionInput.value.trim() === "") {
                showFieldError(
                    questionInput,
                    `Please enter text for question ${questionNumber}.`
                );

                if (!firstInvalidField) {
                    firstInvalidField = questionInput;
                }

                isValid = false;
            }

            if (typeSelect.value !== "multiple-choice") {
                return;
            }

            const optionInputs = card.querySelectorAll(
                ".choice-option-input"
            );

            optionInputs.forEach(
                function (optionInput, optionIndex) {
                    if (optionInput.value.trim() !== "") {
                        return;
                    }

                    showFieldError(
                        optionInput,
                        `Please enter text for option ${optionIndex + 1}.`
                    );

                    if (!firstInvalidField) {
                        firstInvalidField = optionInput;
                    }

                    isValid = false;
                }
            );
        });

        if (!isValid) {
            formMessage.textContent =
                "Please correct the highlighted fields.";

            formMessage.classList.add("is-error");

            if (firstInvalidField) {
                firstInvalidField.focus();

                firstInvalidField.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });
            }

            return false;
        }

        formMessage.textContent =
            "Survey information is valid and ready to save.";

        formMessage.classList.add("is-success");

        return true;
    }

    /*
     * Renumbers questions after adding or removing one.
     */
    function updateQuestionNumbers() {
        const questionCards = questionsContainer.querySelectorAll(
            ".question-card"
        );

        questionCards.forEach(function (card, index) {
            const questionNumber = index + 1;

            const heading = card.querySelector(
                ".question-card-header > span"
            );

            const removeButton = card.querySelector(
                ".remove-question-button"
            );

            const questionLabel = card.querySelector(
                'label[for^="question-"]:not([for^="question-type-"])'
            );

            const questionInput = card.querySelector(
                '.builder-field input[type="text"]'
            );

            const typeLabel = card.querySelector(
                'label[for^="question-type-"]'
            );

            const typeSelect = card.querySelector(
                'select[id^="question-type-"]'
            );

            heading.textContent =
                `Question ${questionNumber}`;

            removeButton.setAttribute(
                "aria-label",
                `Remove question ${questionNumber}`
            );

            questionLabel.setAttribute(
                "for",
                `question-${questionNumber}`
            );

            questionInput.id =
                `question-${questionNumber}`;

            typeLabel.setAttribute(
                "for",
                `question-type-${questionNumber}`
            );

            typeSelect.id =
                `question-type-${questionNumber}`;

            removeButton.disabled =
                questionCards.length === 1;
        });
    }

    /*
     * Add Question button.
     */
    addQuestionButton.addEventListener("click", function () {
        const questionNumber =
            questionsContainer.querySelectorAll(
                ".question-card"
            ).length + 1;

        questionsContainer.insertAdjacentHTML(
            "beforeend",
            createQuestionCard(questionNumber)
        );

        updateQuestionNumbers();

        const newQuestionInput = questionsContainer.querySelector(
            `#question-${questionNumber}`
        );

        newQuestionInput.focus();
    });

    /*
     * Question type change.
     */
    questionsContainer.addEventListener(
        "change",
        function (event) {
            const typeSelect = event.target.closest(
                'select[id^="question-type-"]'
            );

            if (!typeSelect) {
                return;
            }

            handleQuestionTypeChange(typeSelect);
        }
    );

    /*
     * Remove Question button.
     */
    questionsContainer.addEventListener(
        "click",
        function (event) {
            const removeQuestionButton = event.target.closest(
                ".remove-question-button"
            );

            if (!removeQuestionButton) {
                return;
            }

            const questionCards =
                questionsContainer.querySelectorAll(
                    ".question-card"
                );

            if (questionCards.length === 1) {
                return;
            }

            const questionCard =
                removeQuestionButton.closest(
                    ".question-card"
                );

            questionCard.remove();
            updateQuestionNumbers();
        }
    );

    /*
     * Add Option and Remove Option buttons.
     */
    questionsContainer.addEventListener(
        "click",
        function (event) {
            const addOptionButton = event.target.closest(
                ".add-option-button"
            );

            if (addOptionButton) {
                const optionsEditor =
                    addOptionButton.closest(
                        ".multiple-choice-editor"
                    );

                const optionsList =
                    optionsEditor.querySelector(
                        ".choice-options-list"
                    );

                const optionNumber =
                    optionsList.querySelectorAll(
                        ".choice-option-row"
                    ).length + 1;

                optionsList.insertAdjacentHTML(
                    "beforeend",
                    createOptionRow(optionNumber)
                );

                updateOptionNumbers(optionsEditor);

                const optionInputs =
                    optionsList.querySelectorAll(
                        ".choice-option-input"
                    );

                optionInputs[
                    optionInputs.length - 1
                ].focus();

                return;
            }

            const removeOptionButton = event.target.closest(
                ".remove-option-button"
            );

            if (!removeOptionButton) {
                return;
            }

            const optionsEditor =
                removeOptionButton.closest(
                    ".multiple-choice-editor"
                );

            const optionRows =
                optionsEditor.querySelectorAll(
                    ".choice-option-row"
                );

            if (optionRows.length <= 2) {
                return;
            }

            const optionRow =
                removeOptionButton.closest(
                    ".choice-option-row"
                );

            optionRow.remove();
            updateOptionNumbers(optionsEditor);
        }
    );

    function getSurveyPayload() {
        const questions = Array.from(
            questionsContainer.querySelectorAll(".question-card")
        ).map(function (card) {
            const type = card.querySelector(
                'select[id^="question-type-"]'
            ).value;

            const options = type === "multiple-choice"
                ? Array.from(
                    card.querySelectorAll(".choice-option-input")
                ).map(function (input) {
                    return input.value.trim();
                })
                : [];

            return {
                text: card.querySelector(
                    '.builder-field input[type="text"]'
                ).value.trim(),
                type,
                required: card.querySelector(
                    '.required-question-control input[type="checkbox"]'
                ).checked,
                options
            };
        });

        return {
            title: surveyTitleInput.value.trim(),
            description: document.querySelector(
                "#survey-description"
            ).value.trim(),
            category: document.querySelector(
                "#survey-category"
            ).value,
            questions
        };
    }

    function setSavingState(isSaving, action) {
        saveDraftButton.disabled = isSaving;
        publishButton.disabled = isSaving;

        saveDraftButton.textContent =
            isSaving && action === "draft" ? "Saving..." : "Save Draft";

        publishButton.innerHTML = isSaving && action === "publish"
            ? '<i class="fa-solid fa-spinner fa-spin"></i> Publishing...'
            : '<i class="fa-solid fa-paper-plane"></i> Publish Survey';
    }

    async function saveSurvey(action) {
        if (!validateSurvey()) {
            return;
        }

        setSavingState(true, action);
        formMessage.textContent = action === "publish"
            ? "Creating and publishing your survey..."
            : "Saving your survey as a draft...";
        formMessage.className = "builder-form-message";

        try {
            const created = await window.voxintelApi.request(
                "/surveys",
                {
                    method: "POST",
                    auth: true,
                    body: getSurveyPayload()
                }
            );

            let survey = created.survey;

            if (action === "publish") {
                const published = await window.voxintelApi.request(
                    `/surveys/${survey._id}/publish`,
                    {
                        method: "PATCH",
                        auth: true
                    }
                );

                survey = published.survey;
                formMessage.textContent =
                    "Survey published. Opening the public response page...";
                formMessage.className =
                    "builder-form-message is-success";

                window.setTimeout(function () {
                    window.location.assign(
                        `survey.html?id=${encodeURIComponent(survey._id)}`
                    );
                }, 900);

                return;
            }

            formMessage.textContent =
                "Draft saved. Opening My Surveys...";
            formMessage.className =
                "builder-form-message is-success";

            window.setTimeout(function () {
                window.location.assign(
                    `my-surveys.html?created=${encodeURIComponent(survey._id)}`
                );
            }, 700);
        } catch (error) {
            console.error("Unable to save survey:", error);
            formMessage.textContent = error.message;
            formMessage.className = "builder-form-message is-error";
            setSavingState(false, action);
        }
    }

    surveyForm.addEventListener("submit", function (event) {
        event.preventDefault();
        saveSurvey("publish");
    });

    saveDraftButton.addEventListener("click", function () {
        saveSurvey("draft");
    });

    /*
     * Initialize question numbering and button states.
     */
    updateQuestionNumbers();
});
