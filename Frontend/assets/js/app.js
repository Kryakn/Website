document.addEventListener(
    "DOMContentLoaded",
    async function () {
        const appShell =
            document.querySelector(".app-shell");

        const token =
            localStorage.getItem("voxintelToken");

        if (!token) {
            window.location.replace("login.html");
            return;
        }

        try {
            const response = await fetch(
                "http://localhost:5000/api/auth/me",
                {
                    method: "GET",

                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (
                !response.ok ||
                !data.success ||
                !data.user
            ) {
                if (
                    response.status === 401 ||
                    response.status === 403
                ) {
                    localStorage.removeItem(
                        "voxintelToken"
                    );
                }

                window.location.replace("login.html");
                return;
            }

            const fullName =
                data.user.fullName.trim();

            const initials = fullName
                .split(/\s+/)
                .filter(Boolean)
                .slice(0, 2)
                .map(function (namePart) {
                    return namePart.charAt(0);
                })
                .join("")
                .toUpperCase();

            document
                .querySelectorAll(".user-avatar")
                .forEach(function (avatar) {
                    avatar.textContent = initials;
                });

            appShell?.removeAttribute("hidden");
        } catch (error) {
            console.error(
                "Session verification failed:",
                error
            );

            window.location.replace("login.html");
            return;
        }

        const sidebar =
            document.querySelector(".app-sidebar");

        const overlay =
            document.querySelector(".sidebar-overlay");

        const toggleButton =
            document.querySelector(".sidebar-toggle");

        const closeButtons =
            document.querySelectorAll(
                "[data-sidebar-close]"
            );

        const logoutLink =
            document.querySelector("[data-logout]");

        function logoutUser(event) {
            event.preventDefault();

            localStorage.removeItem(
                "voxintelToken"
            );

            window.location.replace("login.html");
        }

        logoutLink?.addEventListener(
            "click",
            logoutUser
        );

        if (!sidebar || !overlay || !toggleButton) {
            return;
        }

        function openSidebar() {
            sidebar.classList.add("is-open");
            overlay.classList.add("is-visible");

            toggleButton.setAttribute(
                "aria-expanded",
                "true"
            );

            document.body.classList.add(
                "sidebar-open"
            );
        }

        function closeSidebar() {
            sidebar.classList.remove("is-open");
            overlay.classList.remove("is-visible");

            toggleButton.setAttribute(
                "aria-expanded",
                "false"
            );

            document.body.classList.remove(
                "sidebar-open"
            );
        }

        toggleButton.addEventListener(
            "click",
            openSidebar
        );

        closeButtons.forEach(function (button) {
            button.addEventListener(
                "click",
                closeSidebar
            );
        });

        document.addEventListener(
            "keydown",
            function (event) {
                if (event.key === "Escape") {
                    closeSidebar();
                }
            }
        );
    }
);