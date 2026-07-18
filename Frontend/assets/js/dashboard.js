document.addEventListener("DOMContentLoaded", function () {
    const sidebar = document.querySelector(".app-sidebar");
    const sidebarToggle = document.querySelector(".sidebar-toggle");
    const sidebarOverlay = document.querySelector(".sidebar-overlay");
    const sidebarCloseButtons =
        document.querySelectorAll("[data-sidebar-close]");

    const recentSurveysList =
        document.querySelector("#recent-surveys-list");

    const sampleSurveys = [
        {
            id: "sample-1",
            title: "Student Feedback Survey",
            status: "active",
            responses: 128,
            createdAt: "Today"
        },
        {
            id: "sample-2",
            title: "Customer Experience Survey",
            status: "active",
            responses: 84,
            createdAt: "Yesterday"
        },
        {
            id: "sample-3",
            title: "Event Satisfaction Poll",
            status: "draft",
            responses: 0,
            createdAt: "2 days ago"
        }
    ];

    function openSidebar() {
        if (!sidebar || !sidebarToggle || !sidebarOverlay) {
            return;
        }

        sidebar.classList.add("is-open");
        sidebarOverlay.classList.add("is-visible");
        sidebarToggle.setAttribute("aria-expanded", "true");
        document.body.style.overflow = "hidden";
    }

    function closeSidebar() {
        if (!sidebar || !sidebarToggle || !sidebarOverlay) {
            return;
        }

        sidebar.classList.remove("is-open");
        sidebarOverlay.classList.remove("is-visible");
        sidebarToggle.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
    }

    sidebarToggle?.addEventListener("click", openSidebar);

    sidebarCloseButtons.forEach(function (button) {
        button.addEventListener("click", closeSidebar);
    });

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
            closeSidebar();
        }
    });

    window.addEventListener("resize", function () {
        if (window.innerWidth > 900) {
            closeSidebar();
        }
    });

    function getStoredSurveys() {
        try {
            const storedSurveys =
                JSON.parse(localStorage.getItem("voxintel_surveys"));

            return Array.isArray(storedSurveys)
                ? storedSurveys
                : [];
        } catch (error) {
            console.error("Unable to read stored surveys:", error);
            return [];
        }
    }

    function renderStatistics(surveys) {
        const totalSurveys = surveys.length;

        const activeSurveys = surveys.filter(function (survey) {
            return survey.status === "active";
        }).length;

        const totalResponses = surveys.reduce(function (total, survey) {
            return total + Number(survey.responses || 0);
        }, 0);

        const completedSurveys = surveys.filter(function (survey) {
            return Number(survey.responses || 0) > 0;
        }).length;

        const completionRate = totalSurveys
            ? Math.round((completedSurveys / totalSurveys) * 100)
            : 0;

        document.querySelector("#total-surveys").textContent =
            totalSurveys;

        document.querySelector("#total-responses").textContent =
            totalResponses;

        document.querySelector("#active-surveys").textContent =
            activeSurveys;

        document.querySelector("#completion-rate").textContent =
            `${completionRate}%`;
    }

    function renderRecentSurveys(surveys) {
        if (!recentSurveysList) {
            return;
        }

        if (surveys.length === 0) {
            recentSurveysList.innerHTML = `
                <div class="empty-surveys">
                    <i class="fa-regular fa-clipboard"></i>
                    <h3>No surveys yet</h3>
                    <p>Create your first survey to see it here.</p>
                    <a
                        href="create-survey.html"
                        class="dashboard-create-button"
                    >
                        Create Survey
                    </a>
                </div>
            `;

            return;
        }

        recentSurveysList.innerHTML = surveys
            .slice(0, 4)
            .map(function (survey) {
                const safeStatus =
                    survey.status === "active" ? "active" : "draft";

                return `
                    <div class="survey-list-item">

                        <div class="survey-information">
                            <h3>${survey.title}</h3>
                            <p>Created ${survey.createdAt || "recently"}</p>
                        </div>

                        <div class="survey-details">
                            <span class="survey-response-count">
                                ${Number(survey.responses || 0)} responses
                            </span>

                            <span class="survey-status ${safeStatus}">
                                ${safeStatus}
                            </span>

                            <a
                                href="results.html?id=${survey.id}"
                                class="survey-action"
                                aria-label="View ${survey.title}"
                            >
                                <i class="fa-solid fa-arrow-right"></i>
                            </a>
                        </div>

                    </div>
                `;
            })
            .join("");
    }

    const storedSurveys = getStoredSurveys();

    // Use sample data until the user creates real surveys.
    const dashboardSurveys =
        storedSurveys.length > 0 ? storedSurveys : sampleSurveys;

    renderStatistics(dashboardSurveys);
    renderRecentSurveys(dashboardSurveys);
});