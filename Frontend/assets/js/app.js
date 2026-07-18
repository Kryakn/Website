document.addEventListener("DOMContentLoaded", function () {
    const sidebar = document.querySelector(".app-sidebar");
    const overlay = document.querySelector(".sidebar-overlay");
    const toggleButton = document.querySelector(".sidebar-toggle");
    const closeButtons = document.querySelectorAll("[data-sidebar-close]");

    if (!sidebar || !overlay || !toggleButton) {
        return;
    }

    function openSidebar() {
        sidebar.classList.add("is-open");
        overlay.classList.add("is-visible");
        toggleButton.setAttribute("aria-expanded", "true");
        document.body.classList.add("sidebar-open");
    }

    function closeSidebar() {
        sidebar.classList.remove("is-open");
        overlay.classList.remove("is-visible");
        toggleButton.setAttribute("aria-expanded", "false");
        document.body.classList.remove("sidebar-open");
    }

    toggleButton.addEventListener("click", openSidebar);

    closeButtons.forEach(function (button) {
        button.addEventListener("click", closeSidebar);
    });

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
            closeSidebar();
        }
    });
});