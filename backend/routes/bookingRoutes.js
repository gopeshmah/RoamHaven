const express = require("express");
const bookingController = require("../controllers/bookingController");
const auth = require("../middleware/auth");

const router = express.Router();

// All booking routes require the user to be logged in
router.use(auth);

// POST /api/bookings/create
router.post("/create", bookingController.createBooking);

// GET /api/bookings/my-bookings
router.get("/my-bookings", bookingController.getMyBookings);

// GET /api/bookings/host-requests (For Hosts to see pending requests)
router.get("/host-requests", bookingController.getHostRequests);

// PUT /api/bookings/:id/status (For Hosts to approve/reject)
router.put("/:id/status", bookingController.updateBookingStatus);

// POST /api/bookings/:id/create-razorpay-order
router.post("/:id/create-razorpay-order", bookingController.createRazorpayOrder);

// POST /api/bookings/:id/confirm-razorpay-payment
router.post("/:id/confirm-razorpay-payment", bookingController.confirmRazorpayPayment);

// DELETE /api/bookings/:id (technically we are doing a soft delete / status update to cancelled via DELETE method semantics)
router.delete("/:id", bookingController.cancelBooking);

module.exports = router;
