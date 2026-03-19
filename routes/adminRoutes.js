const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const {
  createHall,
  getAllHalls,
  getHallById,
  suspendHall,
  activateHall,
  deleteHall,
  getHallStats,
} = require("../controllers/adminController");

const isSuperAdmin = [authMiddleware, roleMiddleware("super_admin")];

router.get("/stats", ...isSuperAdmin, getHallStats);
router.post("/halls", ...isSuperAdmin, createHall);
router.get("/halls", ...isSuperAdmin, getAllHalls);
router.get("/halls/:id", ...isSuperAdmin, getHallById);
router.patch("/halls/:id/suspend", ...isSuperAdmin, suspendHall);
router.patch("/halls/:id/activate", ...isSuperAdmin, activateHall);
router.delete("/halls/:id", ...isSuperAdmin, deleteHall);

module.exports = router;