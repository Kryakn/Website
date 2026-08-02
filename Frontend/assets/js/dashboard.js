document.addEventListener("DOMContentLoaded", async function () {
    const appShell = document.querySelector(".app-shell");
    const recentSurveysList = document.querySelector(
        "#recent-surveys-list"
    );
    const token = localStorage.getItem("voxintelToken");

    if (!token || !window.voxintelApi) {
        window.location.replace("login.html");
        return;
    }

    try {
        const data = await window.voxintelApi.request("/auth/me", {
            method: "GET",
            auth: true
        });

        const fullName = data.user.fullName.trim();
        const initials = fullName
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map(function (part) {
                return part.charAt(0);
            })
            .join("")
            .toUpperCase();

        document.querySelector(".user-information strong").textContent =
            fullName;
        document.querySelector(".user-avatar").textContent = initials;
        appShell?.removeAttribute("hidden");
    } catch (error) {
        console.error("Session verification failed:", error);
        return;
    }

    const sidebar = document.querySelector(".app-sidebar");
    const sidebarToggle = document.querySelector(".sidebar-toggle");
    const sidebarOverlay = document.querySelector(".sidebar-overlay");
    const logoutLink = document.querySelector("[data-logout]");
    const sidebarCloseButtons = document.querySelectorAll(
        "[data-sidebar-close]"
    );

    function openSidebar() {
        sidebar?.classList.add("is-open");
        sidebarOverlay?.classList.add("is-visible");
        sidebarToggle?.setAttribute("aria-expanded", "true");
        document.body.style.overflow = "hidden";
    }

    function closeSidebar() {
        sidebar?.classList.remove("is-open");
        sidebarOverlay?.classList.remove("is-visible");
        sidebarToggle?.setAttribute("aria-expanded", "false");
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
    logoutLink?.addEventListener("click", function (event) {
        event.preventDefault();
        localStorage.removeItem("voxintelToken");
        window.location.replace("login.html");
    });

    function renderStatistics(surveys) {
        const publishedSurveys = surveys.filter(function (survey) {
            return survey.status === "published";
        }).length;

        document.querySelector("#total-surveys").textContent =
            surveys.length;
        document.querySelector("#active-surveys").textContent =
            publishedSurveys;

        const totalResponses = document.querySelector("#total-responses");
        const completionRate = document.querySelector("#completion-rate");
        totalResponses.textContent = "—";
        completionRate.textContent = "—";
        totalResponses.title =
            "Response totals require the owner analytics API.";
        completionRate.title =
            "Completion rate requires the owner analytics API.";
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
                    <a href="create-survey.html" class="dashboard-create-button">
                        Create Survey
                    </a>
                </div>
            `;
            return;
        }

        recentSurveysList.innerHTML = surveys
            .slice(0, 4)
            .map(function (survey) {
                const status = survey.status === "published"
                    ? "active"
                    : "draft";
                const destination = survey.status === "published"
                    ? `results.html?id=${encodeURIComponent(survey._id)}`
                    : `my-surveys.html?id=${encodeURIComponent(survey._id)}`;

                return `
                    <div class="survey-list-item">
                        <div class="survey-information">
                            <h3>${window.voxintelApi.escapeHtml(survey.title)}</h3>
                            <p>Created ${window.voxintelApi.formatDate(survey.createdAt)}</p>
                        </div>
                        <div class="survey-details">
                            <span class="survey-response-count" title="Available after analytics API integration">
                                Responses —
                            </span>
                            <span class="survey-status ${status}">
                                ${survey.status === "published" ? "published" : "draft"}
                            </span>
                            <a href="${destination}" class="survey-action" aria-label="View ${window.voxintelApi.escapeHtml(survey.title)}">
                                <i class="fa-solid fa-arrow-right"></i>
                            </a>
                        </div>
                    </div>
                `;
            })
            .join("");
    }

    try {
        const data = await window.voxintelApi.request("/surveys", {
            method: "GET",
            auth: true
        });

        const surveys = Array.isArray(data.surveys) ? data.surveys : [];
        renderStatistics(surveys);
        renderRecentSurveys(surveys);
    } catch (error) {
        console.error("Unable to load dashboard surveys:", error);
        renderStatistics([]);

        if (recentSurveysList) {
            recentSurveysList.innerHTML = `
                <div class="empty-surveys">
                    <i class="fa-solid fa-triangle-exclamation"></i>
                    <h3>Unable to load surveys</h3>
                    <p>${window.voxintelApi.escapeHtml(error.message)}</p>
                </div>
            `;
        }
    }
});
