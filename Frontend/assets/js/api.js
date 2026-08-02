(function () {
    const API_BASE_URL = "http://localhost:5000/api";

    async function parseResponse(response) {
        const contentType = response.headers.get("content-type") || "";

        if (!contentType.includes("application/json")) {
            return {};
        }

        return response.json();
    }

    async function request(path, options = {}) {
        const {
            auth = false,
            headers = {},
            body,
            ...fetchOptions
        } = options;

        const requestHeaders = { ...headers };

        if (body !== undefined) {
            requestHeaders["Content-Type"] = "application/json";
        }

        if (auth) {
            const token = localStorage.getItem("voxintelToken");

            if (!token) {
                window.location.replace("login.html");
                throw new Error("Authentication required");
            }

            requestHeaders.Authorization = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE_URL}${path}`, {
            ...fetchOptions,
            headers: requestHeaders,
            body: body === undefined ? undefined : JSON.stringify(body)
        });

        const data = await parseResponse(response);

        if (auth && (response.status === 401 || response.status === 403)) {
            localStorage.removeItem("voxintelToken");
            window.location.replace("login.html");
        }

        if (!response.ok) {
            const error = new Error(
                data.message || "The request could not be completed."
            );

            error.status = response.status;
            error.data = data;
            throw error;
        }

        return data;
    }

    function escapeHtml(value) {
        const element = document.createElement("div");
        element.textContent = String(value ?? "");
        return element.innerHTML;
    }

    function formatDate(value) {
        if (!value) {
            return "Recently";
        }

        return new Intl.DateTimeFormat("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric"
        }).format(new Date(value));
    }

    window.voxintelApi = {
        request,
        escapeHtml,
        formatDate
    };
})();
