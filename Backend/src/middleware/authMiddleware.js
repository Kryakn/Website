const jwt = require("jsonwebtoken");
const User = require("../models/User");

async function protect(request, response, next) {
    try {
        const authorizationHeader = request.headers.authorization;

        if (
            !authorizationHeader ||
            !authorizationHeader.startsWith("Bearer ")
        ) {
            return response.status(401).json({
                success: false,
                message: "Authentication token is required",
            });
        }

        const token = authorizationHeader.split(" ")[1];

        const decodedToken = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        const user = await User.findById(decodedToken.userId);

        if (!user) {
            return response.status(401).json({
                success: false,
                message: "User associated with this token no longer exists",
            });
        }

        request.user = user;

        next();
    } catch (error) {
        return response.status(401).json({
            success: false,
            message: "Invalid or expired authentication token",
        });
    }
}

module.exports = protect;