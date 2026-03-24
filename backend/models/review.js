const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
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
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

// Optional: Prevent a user from leaving multiple reviews for the same home
reviewSchema.index({ homeId: 1, guestId: 1 }, { unique: true });

module.exports = mongoose.model("Review", reviewSchema);
