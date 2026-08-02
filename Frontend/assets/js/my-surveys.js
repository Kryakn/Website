document.addEventListener("DOMContentLoaded", function () {
    const grid = document.querySelector("#surveys-grid");
    const searchInput = document.querySelector("#survey-search");
    const statusFilter = document.querySelector("#status-filter");

    if (!grid || !searchInput || !statusFilter || !window.voxintelApi) {
        return;
    }

    let surveys = [];
    grid.innerHTML = `
        <article class="survey-management-card">
            <div class="survey-card-content">
                <h2>Loading surveys...</h2>
                <p>Reading your latest surveys from VoxIntel.</p>
            </div>
        </article>
    `;

    function publicSurveyUrl(surveyId) {
        return new URL(
            `survey.html?id=${encodeURIComponent(surveyId)}`,
            window.location.href
        ).href;
    }

    function getVisibleSurveys() {
        const query = searchInput.value.trim().toLowerCase();
        const selectedStatus = statusFilter.value;

        return surveys.filter(function (survey) {
            const matchesQuery = survey.title
                .toLowerCase()
                .includes(query);
            const matchesStatus = selectedStatus === "all" ||
                survey.status === selectedStatus;

            return matchesQuery && matchesStatus;
        });
    }

    function renderSurveys() {
        const visibleSurveys = getVisibleSurveys();

        if (visibleSurveys.length === 0) {
            grid.innerHTML = `
                <article class="survey-management-card">
                    <div class="survey-card-content">
                        <div class="survey-card-icon">
                            <i class="fa-regular fa-clipboard"></i>
                        </div>
                        <h2>No surveys found</h2>
                        <p>Create a survey or change the current filters.</p>
                    </div>
                </article>
            `;
            return;
        }

        grid.innerHTML = visibleSurveys
            .map(function (survey) {
                const isPublished = survey.status === "published";
                const safeTitle = window.voxintelApi.escapeHtml(
                    survey.title
                );
                const safeDescription = window.voxintelApi.escapeHtml(
                    survey.description || "No description provided."
                );

                return `
                    <article class="survey-management-card" data-survey-id="${survey._id}">
                        <div class="survey-card-top">
                            <span class="survey-status ${isPublished ? "status-active" : "status-draft"}">
                                ${isPublished ? "Published" : "Draft"}
                            </span>
                        </div>
                        <div class="survey-card-content">
                            <div class="survey-card-icon">
                                <i class="fa-solid fa-clipboard-question"></i>
                            </div>
                            <h2>${safeTitle}</h2>
                            <p>${safeDescription}</p>
                        </div>
                        <div class="survey-card-statistics">
                            <div title="Available after owner analytics API integration">
                                <strong>—</strong>
                                <span>Responses</span>
                            </div>
                            <div>
                                <strong>${survey.questions.length}</strong>
                                <span>Questions</span>
                            </div>
                        </div>
                        <div class="survey-card-footer">
                            <span>Updated ${window.voxintelApi.formatDate(survey.updatedAt)}</span>
                            <div class="survey-card-actions">
                                ${isPublished ? `
                                    <a href="results.html?id=${encodeURIComponent(survey._id)}" aria-label="View results for ${safeTitle}">
                                        <i class="fa-solid fa-chart-column"></i>
                                    </a>
                                    <a href="survey.html?id=${encodeURIComponent(survey._id)}" target="_blank" aria-label="Open public survey ${safeTitle}">
                                        <i class="fa-solid fa-arrow-up-right-from-square"></i>
                                    </a>
                                    <button type="button" data-action="share" aria-label="Copy public link for ${safeTitle}">
                                        <i class="fa-solid fa-share-nodes"></i>
                                    </button>
                                ` : `
                                    <button type="button" data-action="publish" aria-label="Publish ${safeTitle}">
                                        <i class="fa-solid fa-paper-plane"></i>
                                    </button>
                                    <button type="button" data-action="delete" aria-label="Delete ${safeTitle}">
                                        <i class="fa-regular fa-trash-can"></i>
                                    </button>
                                `}
                            </div>
                        </div>
                    </article>
                `;
            })
            .join("");
    }

    async function loadSurveys() {
        try {
            const data = await window.voxintelApi.request("/surveys", {
                method: "GET",
                auth: true
            });

            surveys = Array.isArray(data.surveys) ? data.surveys : [];
            renderSurveys();
        } catch (error) {
            console.error("Unable to load surveys:", error);
            grid.innerHTML = `
                <article class="survey-management-card">
                    <div class="survey-card-content">
                        <h2>Unable to load surveys</h2>
                        <p>${window.voxintelApi.escapeHtml(error.message)}</p>
                    </div>
                </article>
            `;
        }
    }

    searchInput.addEventListener("input", renderSurveys);
    statusFilter.addEventListener("change", renderSurveys);

    grid.addEventListener("click", async function (event) {
        const actionButton = event.target.closest("[data-action]");

        if (!actionButton) {
            return;
        }

        const card = actionButton.closest("[data-survey-id]");
        const surveyId = card?.dataset.surveyId;
        const survey = surveys.find(function (item) {
            return item._id === surveyId;
        });

        if (!survey) {
            return;
        }

        if (actionButton.dataset.action === "share") {
            const url = publicSurveyUrl(surveyId);

            try {
                await navigator.clipboard.writeText(url);
                actionButton.title = "Link copied";
                actionButton.innerHTML = '<i class="fa-solid fa-check"></i>';
            } catch (error) {
                window.prompt("Copy this public survey link:", url);
            }

            return;
        }

        if (
            actionButton.dataset.action === "delete" &&
            !window.confirm(`Delete the draft “${survey.title}”?`)
        ) {
            return;
        }

        actionButton.disabled = true;

        try {
            if (actionButton.dataset.action === "publish") {
                await window.voxintelApi.request(
                    `/surveys/${surveyId}/publish`,
                    { method: "PATCH", auth: true }
                );
            } else if (actionButton.dataset.action === "delete") {
                await window.voxintelApi.request(
                    `/surveys/${surveyId}`,
                    { method: "DELETE", auth: true }
                );
            }

            await loadSurveys();
        } catch (error) {
            console.error("Survey action failed:", error);
            window.alert(error.message);
            actionButton.disabled = false;
        }
    });

    loadSurveys();
});
