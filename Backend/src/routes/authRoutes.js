const express = require("express");
const { registerUser,loginUser } = require("../controllers/authController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", protect, (request, response) => {
    return response.status(200).json({
        success: true,
        user: {
            id: request.user._id,
            fullName: request.user.fullName,
            email: request.user.email,
        },
    });
});
module.exports = router;
