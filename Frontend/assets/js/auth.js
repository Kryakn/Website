document.addEventListener("DOMContentLoaded", function () {
    const toggleButtons = document.querySelectorAll(".toggle-password");
    const loginForm = document.querySelector("#login-form");
    const signupForm = document.querySelector("#signup-form");

    // ==========================================
    // Password visibility
    // ==========================================

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

    // ==========================================
    // Validation helpers
    // ==========================================

    function showError(input, message) {
        const formGroup = input.closest(".form-group");

        if (!formGroup) {
            return;
        }

        let errorElement = formGroup.querySelector(".form-error");

        if (!errorElement) {
            errorElement = document.createElement("small");
            errorElement.className = "form-error";
            errorElement.id = `${input.id}-error`;
            errorElement.setAttribute("role", "alert");
            formGroup.appendChild(errorElement);
        }

        errorElement.textContent = message;

        input.classList.add("input-error");
        input.setAttribute("aria-invalid", "true");
        input.setAttribute("aria-describedby", errorElement.id);
    }

    function clearError(input) {
        const formGroup = input.closest(".form-group");
        const errorElement = formGroup?.querySelector(".form-error");

        if (errorElement) {
            errorElement.remove();
        }

        input.classList.remove("input-error");
        input.removeAttribute("aria-invalid");
        input.removeAttribute("aria-describedby");
    }

    function isValidEmail(email) {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailPattern.test(email);
    }

    function showSuccess(form, message) {
        let successElement = form.querySelector(".form-success");

        if (!successElement) {
            successElement = document.createElement("p");
            successElement.className = "form-success";
            successElement.setAttribute("role", "status");
            form.appendChild(successElement);
        }

        successElement.textContent = message;
    }

    function clearSuccess(form) {
        const successElement = form.querySelector(".form-success");

        if (successElement) {
            successElement.remove();
        }
    }

    function enableLiveErrorClearing(form) {
        const inputs = form.querySelectorAll("input");

        inputs.forEach(function (input) {
            input.addEventListener("input", function () {
                clearError(input);
                clearSuccess(form);
            });
        });
    }

    // ==========================================
    // Login validation
    // ==========================================

    if (loginForm) {
        enableLiveErrorClearing(loginForm);

        loginForm.addEventListener("submit", function (event) {
            event.preventDefault();
            clearSuccess(loginForm);

            const emailInput = loginForm.querySelector("#email");
            const passwordInput = loginForm.querySelector("#password");

            const email = emailInput.value.trim();
            const password = passwordInput.value;

            let formIsValid = true;

            clearError(emailInput);
            clearError(passwordInput);

            if (email === "") {
                showError(emailInput, "Email address is required.");
                formIsValid = false;
            } else if (!isValidEmail(email)) {
                showError(emailInput, "Enter a valid email address.");
                formIsValid = false;
            }

            if (password === "") {
                showError(passwordInput, "Password is required.");
                formIsValid = false;
            } else if (password.length < 8) {
                showError(
                    passwordInput,
                    "Password must contain at least 8 characters."
                );
                formIsValid = false;
            }

            if (formIsValid) {
                showSuccess(
                    loginForm,
                    "Login validation passed. Backend authentication will be connected later."
                );
            }
        });
    }

    // ==========================================
    // Signup validation
    // ==========================================

    if (signupForm) {
        enableLiveErrorClearing(signupForm);

        signupForm.addEventListener("submit", function (event) {
            event.preventDefault();
            clearSuccess(signupForm);

            const fullNameInput = signupForm.querySelector("#fullname");
            const emailInput = signupForm.querySelector("#email");
            const passwordInput = signupForm.querySelector("#password");
            const confirmPasswordInput =
                signupForm.querySelector("#confirm-password");

            const fullName = fullNameInput.value.trim();
            const email = emailInput.value.trim();
            const password = passwordInput.value;
            const confirmPassword = confirmPasswordInput.value;

            let formIsValid = true;

            clearError(fullNameInput);
            clearError(emailInput);
            clearError(passwordInput);
            clearError(confirmPasswordInput);

            if (fullName === "") {
                showError(fullNameInput, "Full name is required.");
                formIsValid = false;
            } else if (fullName.length < 2) {
                showError(
                    fullNameInput,
                    "Full name must contain at least 2 characters."
                );
                formIsValid = false;
            }

            if (email === "") {
                showError(emailInput, "Email address is required.");
                formIsValid = false;
            } else if (!isValidEmail(email)) {
                showError(emailInput, "Enter a valid email address.");
                formIsValid = false;
            }

            if (password === "") {
                showError(passwordInput, "Password is required.");
                formIsValid = false;
            } else if (password.length < 8) {
                showError(
                    passwordInput,
                    "Password must contain at least 8 characters."
                );
                formIsValid = false;
            }

            if (confirmPassword === "") {
                showError(
                    confirmPasswordInput,
                    "Please confirm your password."
                );
                formIsValid = false;
            } else if (confirmPassword !== password) {
                showError(
                    confirmPasswordInput,
                    "Passwords do not match."
                );
                formIsValid = false;
            }

            if (formIsValid) {
                showSuccess(
                    signupForm,
                    "Signup validation passed. Account creation will be connected to the backend later."
                );
            }
        });
    }
});