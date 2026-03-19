const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const { createPackage, getPackages, updatePackage, deletePackage } = require("../controllers/packageController");

// Anyone logged in can view packages (hall owners need to see plans)
router.get("/", authMiddleware, getPackages);

// Only super admin can manage packages
const isSuperAdmin = [authMiddleware, roleMiddleware("super_admin")];
router.post("/", ...isSuperAdmin, createPackage);
router.put("/:id", ...isSuperAdmin, updatePackage);
router.delete("/:id", ...isSuperAdmin, deletePackage);

module.exports = router;