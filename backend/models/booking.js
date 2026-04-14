const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    homeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Home",
      required: true,
    },
    guestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    checkIn: {
      type: Date,
      required: true,
    },
    checkOut: {
      type: Date,
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    guests: {
      type: Number,
      required: true,
      default: 1,
      min: 1,
    },
    status: {
      type: String,
      enum: ["pending", "approved_pending_payment", "paid_confirmed", "rejected", "cancelled"],
      default: "pending",
    },
    razorpayOrderId: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);
