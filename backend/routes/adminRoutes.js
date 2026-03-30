const express = require("express");
const router = express.Router();

const adminController = require("../controllers/adminController");
const auth = require("../middleware/auth");
const isAdmin = require("../middleware/isAdmin");

// Protect all admin routes with auth and isAdmin middleware
router.use(auth, isAdmin);

// Admin Dashboard Stats
router.get("/stats", adminController.getDashboardStats);

// Admin Data Routes
router.get("/users", adminController.getAllUsers);
router.get("/homes", adminController.getAllHomes);
router.get("/bookings", adminController.getAllBookings);

module.exports = router;
