document.addEventListener("DOMContentLoaded", function () {
    const questionsContainer = document.querySelector(
        "#questions-container"
    );

    const addQuestionButton = document.querySelector(
        "#add-question-button"
    );

    if (!questionsContainer || !addQuestionButton) {
        return;
    }

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
                'input[type="text"]'
            );

            const typeLabel = card.querySelector(
                'label[for^="question-type-"]'
            );

            const typeSelect = card.querySelector("select");

            heading.textContent = `Question ${questionNumber}`;

            removeButton.setAttribute(
                "aria-label",
                `Remove question ${questionNumber}`
            );

            questionLabel.setAttribute(
                "for",
                `question-${questionNumber}`
            );

            questionInput.id = `question-${questionNumber}`;

            typeLabel.setAttribute(
                "for",
                `question-type-${questionNumber}`
            );

            typeSelect.id = `question-type-${questionNumber}`;

            removeButton.disabled = questionCards.length === 1;
        });
    }

    addQuestionButton.addEventListener("click", function () {
        const questionNumber =
            questionsContainer.querySelectorAll(".question-card").length + 1;

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

    questionsContainer.addEventListener("click", function (event) {
        const removeButton = event.target.closest(
            ".remove-question-button"
        );

        if (!removeButton) {
            return;
        }

        const questionCards = questionsContainer.querySelectorAll(
            ".question-card"
        );

        if (questionCards.length === 1) {
            return;
        }

        const questionCard = removeButton.closest(".question-card");

        questionCard.remove();
        updateQuestionNumbers();
    });

    updateQuestionNumbers();
});