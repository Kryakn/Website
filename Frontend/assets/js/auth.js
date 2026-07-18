document.addEventListener("DOMContentLoaded", function () {
    const toggleButtons = document.querySelectorAll(".toggle-password");

    toggleButtons.forEach(function (button) {
        button.addEventListener("click", function () {
            const passwordWrapper = button.closest(".password-wrapper");
            const passwordInput = passwordWrapper?.querySelector("input");
            const eyeIcon = button.querySelector("i");

            if (!passwordInput || !eyeIcon) {
                return;
            }

            const passwordIsHidden = passwordInput.type === "password";

            passwordInput.type = passwordIsHidden ? "text" : "password";

            eyeIcon.classList.toggle("fa-eye", !passwordIsHidden);
            eyeIcon.classList.toggle("fa-eye-slash", passwordIsHidden);

            button.setAttribute(
                "aria-label",
                passwordIsHidden ? "Hide password" : "Show password"
            );
        });
    });
});