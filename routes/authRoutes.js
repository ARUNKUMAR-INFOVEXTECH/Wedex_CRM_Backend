const express = require("express");
const router = express.Router();
const { loginUser, refreshToken, getProfile, createSuperAdmin } = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/login", loginUser);
router.post("/refresh", refreshToken);
router.get("/profile", authMiddleware, getProfile);
router.post("/create-super-admin", createSuperAdmin); // bootstrap only

module.exports = router;