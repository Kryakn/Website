const bcrypt = require("bcryptjs");
const User = require("../models/User");

async function registerUser(request, response) {
    try {
        const { fullName, email, password, confirmPassword } = request.body;

        if (!fullName || !email || !password || !confirmPassword) {
            return response.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        if (password !== confirmPassword) {
            return response.status(400).json({
                success: false,
                message: "Passwords do not match",
            });
        }

        if (password.length < 8) {
            return response.status(400).json({
                success: false,
                message: "Password must contain at least 8 characters",
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const existingUser = await User.findOne({
            email: normalizedEmail,
        });

        if (existingUser) {
            return response.status(409).json({
                success: false,
                message: "An account with this email already exists",
            });
        }

        const passwordHash = await bcrypt.hash(password, 12);

        const user = await User.create({
            fullName: fullName.trim(),
            email: normalizedEmail,
            passwordHash,
        });

        return response.status(201).json({
            success: true,
            message: "Account created successfully",
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                createdAt: user.createdAt,
            },
        });
    } catch (error) {
        console.error("Registration failed:", error.message);

        if (error.name === "ValidationError") {
            const firstValidationError =
                Object.values(error.errors)[0];

            return response.status(400).json({
                success: false,
                message: firstValidationError.message,
            });
        }

        if (error.code === 11000) {
            return response.status(409).json({
                success: false,
                message: "An account with this email already exists",
            });
        }

        return response.status(500).json({
            success: false,
            message: "Unable to create account",
        });
    }
}

async function loginUser(request, response) {
    try {
        const { email, password } = request.body;

        if (!email || !password) {
            return response.status(400).json({
                success: false,
                message: "Email and password are required",
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const user = await User.findOne({
            email: normalizedEmail,
        }).select("+passwordHash");

        if (!user) {
            return response.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        const passwordMatches = await bcrypt.compare(
            password,
            user.passwordHash
        );

        if (!passwordMatches) {
            return response.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        return response.status(200).json({
            success: true,
            message: "Login successful",
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
            },
        });
    } catch (error) {
        console.error("Login failed:", error.message);

        return response.status(500).json({
            success: false,
            message: "Unable to log in",
        });
    }
}

module.exports = {
    registerUser,
    loginUser,
};