document.addEventListener("DOMContentLoaded", function () {
    const menuToggle = document.querySelector(".menu-toggle");
    const navMenu = document.querySelector(".nav-menu");
    const menuIcon = menuToggle?.querySelector("i");

    if (!menuToggle || !navMenu || !menuIcon) {
        return;
    }

    function closeMenu() {
        navMenu.classList.remove("is-open");
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.setAttribute("aria-label", "Open navigation menu");

        menuIcon.classList.remove("fa-xmark");
        menuIcon.classList.add("fa-bars");
    }

    function openMenu() {
        navMenu.classList.add("is-open");
        menuToggle.setAttribute("aria-expanded", "true");
        menuToggle.setAttribute("aria-label", "Close navigation menu");

        menuIcon.classList.remove("fa-bars");
        menuIcon.classList.add("fa-xmark");
    }

    menuToggle.addEventListener("click", function () {
        if (navMenu.classList.contains("is-open")) {
            closeMenu();
        } else {
            openMenu();
        }
    });

    navMenu.addEventListener("click", function (event) {
        if (event.target.closest("a")) {
            closeMenu();
        }
    });

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
            closeMenu();
        }
    });

    window.addEventListener("resize", function () {
        if (window.innerWidth > 768) {
            closeMenu();
        }
    });
});