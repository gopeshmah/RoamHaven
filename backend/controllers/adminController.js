const User = require("../models/user");
const Home = require("../models/home");
const Booking = require("../models/booking");

// Get comprehensive dashboard stats
exports.getDashboardStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalHomes = await Home.countDocuments();
    const totalBookings = await Booking.countDocuments();
    
    // Calculate total revenue only from completed/paid bookings
    const paidBookings = await Booking.find({ status: "paid_confirmed" });
    const totalRevenue = paidBookings.reduce((acc, curr) => acc + (curr.totalPrice || 0), 0);

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalHomes,
        totalBookings,
        totalRevenue
      }
    });
  } catch (err) {
    next(err);
  }
};

// Get all users
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({}).sort({ _id: -1 });
    res.status(200).json({ success: true, users });
  } catch (err) {
    next(err);
  }
};

// Get all homes
exports.getAllHomes = async (req, res, next) => {
  try {
    const homes = await Home.find({}).populate("host", "firstName lastName email").sort({ _id: -1 });
    res.status(200).json({ success: true, homes });
  } catch (err) {
    next(err);
  }
};

// Get all bookings
exports.getAllBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({})
      .populate("guestId", "firstName lastName email")
      .populate("homeId", "houseName price")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, bookings });
  } catch (err) {
    next(err);
  }
};
