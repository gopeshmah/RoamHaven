const Review = require("../models/review");
const Booking = require("../models/booking");
const Home = require("../models/home");

// Create a new review
exports.createReview = async (req, res) => {
  try {
    const { homeId, rating, comment } = req.body;
    const guestId = req.user.id; // auth middleware sets req.user.id

    // 1. Check if the user has a valid paid booking and the check-in date has arrived/passed
    const hasValidBooking = await Booking.findOne({
      homeId,
      guestId,
      status: "paid_confirmed",
      checkIn: { $lte: new Date() } // Must be on or after check-in date
    });

    if (!hasValidBooking) {
      return res.status(403).json({
        message: "You can only review homes you have booked, securely paid for, and after your check-in date.",
      });
    }

    // 2. Check if user already reviewed this home
    const existingReview = await Review.findOne({ homeId, guestId });
    if (existingReview) {
      return res.status(400).json({
        message: "You have already reviewed this home.",
      });
    }

    // 3. Create the review
    const review = new Review({
      homeId,
      guestId,
      rating,
      comment,
    });
    await review.save();

    // 4. Update the Home's average rating
    const allReviews = await Review.find({ homeId });
    const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = totalRating / allReviews.length;

    await Home.findByIdAndUpdate(homeId, { rating: averageRating });

    res.status(201).json({ message: "Review added successfully", review });
  } catch (error) {
    console.error("Error creating review:", error);
    res.status(500).json({ message: "Server error creating review", error });
  }
};

// Get all reviews for a specific home
exports.getHomeReviews = async (req, res) => {
  try {
    const { homeId } = req.params;
    const reviews = await Review.find({ homeId })
      .populate("guestId", "firstName lastName photo") // Assuming User has these fields
      .sort({ createdAt: -1 }); // Newest first

    res.status(200).json(reviews);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ message: "Server error fetching reviews", error });
  }
};
