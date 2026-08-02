document.addEventListener("DOMContentLoaded", async function () {
    if (!window.voxintelApi) {
        return;
    }

    const title = document.querySelector("#results-title");
    const description = document.querySelector("#results-description");
    const status = document.querySelector("#results-status");
    const questionCount = document.querySelector(
        "#results-question-count"
    );
    const publishedDate = document.querySelector(
        "#results-published-date"
    );
    const questionList = document.querySelector(
        "#results-question-list"
    );

    let surveyId = new URLSearchParams(window.location.search).get("id");

    function showError(message) {
        status.textContent = "Unavailable";
        title.textContent = "Results could not be loaded";
        description.textContent = message;
        questionList.innerHTML = `<p>${window.voxintelApi.escapeHtml(message)}</p>`;
    }

    try {
        if (!surveyId) {
            const listData = await window.voxintelApi.request("/surveys", {
                method: "GET",
                auth: true
            });
            const publishedSurvey = listData.surveys.find(function (survey) {
                return survey.status === "published";
            });

            if (!publishedSurvey) {
                showError("Publish a survey before opening Results.");
                return;
            }

            surveyId = publishedSurvey._id;
            window.history.replaceState(
                null,
                "",
                `results.html?id=${encodeURIComponent(surveyId)}`
            );
        }

        const data = await window.voxintelApi.request(
            `/surveys/${encodeURIComponent(surveyId)}`,
            { method: "GET", auth: true }
        );
        const survey = data.survey;

        title.textContent = survey.title;
        description.textContent = survey.description ||
            "No survey description provided.";
        status.textContent = survey.status === "published"
            ? "Published"
            : "Draft";
        questionCount.textContent = survey.questions.length;
        publishedDate.textContent = survey.publishedAt
            ? window.voxintelApi.formatDate(survey.publishedAt)
            : "Not yet";

        questionList.innerHTML = survey.questions
            .map(function (question, index) {
                const type = question.type.replaceAll("-", " ");
                return `
                    <div class="results-question-item">
                        <span>${index + 1}</span>
                        <div>
                            <strong>${window.voxintelApi.escapeHtml(question.text)}</strong>
                            <p>${window.voxintelApi.escapeHtml(type)}${question.required ? " · required" : " · optional"}</p>
                        </div>
                    </div>
                `;
            })
            .join("");
    } catch (error) {
        console.error("Unable to load results survey:", error);
        showError(error.message);
    }
});
