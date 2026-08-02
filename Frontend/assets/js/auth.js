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

    function showFormError(form, message) {
    let errorElement = form.querySelector(
        ".form-api-error"
    );

    if (!errorElement) {
        errorElement = document.createElement("p");
        errorElement.className =
            "form-error form-api-error";
        errorElement.setAttribute("role", "alert");

        form.appendChild(errorElement);
    }

    errorElement.textContent = message;
}

function clearFormError(form) {
    const errorElement = form.querySelector(
        ".form-api-error"
    );

    if (errorElement) {
        errorElement.remove();
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

    signupForm.addEventListener(
        "submit",
        async function (event) {
            event.preventDefault();

            clearSuccess(signupForm);
            clearFormError(signupForm);

            const fullNameInput =
                signupForm.querySelector("#fullname");

            const emailInput =
                signupForm.querySelector("#email");

            const passwordInput =
                signupForm.querySelector("#password");

            const confirmPasswordInput =
                signupForm.querySelector(
                    "#confirm-password"
                );

            const submitButton =
                signupForm.querySelector(".auth-btn");

            const fullName = fullNameInput.value.trim();
            const email = emailInput.value.trim();
            const password = passwordInput.value;
            const confirmPassword =
                confirmPasswordInput.value;

            let formIsValid = true;

            clearError(fullNameInput);
            clearError(emailInput);
            clearError(passwordInput);
            clearError(confirmPasswordInput);

            if (fullName === "") {
                showError(
                    fullNameInput,
                    "Full name is required."
                );

                formIsValid = false;
            } else if (fullName.length < 2) {
                showError(
                    fullNameInput,
                    "Full name must contain at least 2 characters."
                );

                formIsValid = false;
            }

            if (email === "") {
                showError(
                    emailInput,
                    "Email address is required."
                );

                formIsValid = false;
            } else if (!isValidEmail(email)) {
                showError(
                    emailInput,
                    "Enter a valid email address."
                );

                formIsValid = false;
            }

            if (password === "") {
                showError(
                    passwordInput,
                    "Password is required."
                );

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

            if (!formIsValid) {
                return;
            }

            const originalButtonText =
                submitButton.textContent;

            submitButton.disabled = true;
            submitButton.textContent =
                "Creating Account...";

            try {
                const response = await fetch(
                    "http://localhost:5000/api/auth/register",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            fullName,
                            email,
                            password,
                            confirmPassword
                        })
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    const errorMessage =
                        data.message ||
                        "Unable to create your account.";

                    if (response.status === 409) {
                        showError(
                            emailInput,
                            errorMessage
                        );

                        emailInput.focus();
                    } else {
                        showFormError(
                            signupForm,
                            errorMessage
                        );
                    }

                    return;
                }

                showSuccess(
                    signupForm,
                    data.message ||
                        "Account created successfully. You can now sign in."
                );

                signupForm.reset();
            } catch (error) {
                console.error(
                    "Signup request failed:",
                    error
                );

                showFormError(
                    signupForm,
                    "Cannot connect to the server. Make sure the backend is running."
                );
            } finally {
                submitButton.disabled = false;
                submitButton.textContent =
                    originalButtonText;
            }
        }
    );
}
});