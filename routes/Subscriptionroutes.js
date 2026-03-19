const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const { getSubscription, renewSubscription, changePackage } = require("../controllers/SubcriptionController");

const isSuperAdmin = [authMiddleware, roleMiddleware("super_admin")];

// Hall owner can view their own subscription
router.get("/my", authMiddleware, (req, res, next) => {
  req.params.hall_id = req.user.hall_id;
  next();
}, getSubscription);

// Super admin manages subscriptions
router.get("/:hall_id", ...isSuperAdmin, getSubscription);
router.put("/:hall_id/renew", ...isSuperAdmin, renewSubscription);
router.patch("/:hall_id/change-package", ...isSuperAdmin, changePackage);

module.exports = router;