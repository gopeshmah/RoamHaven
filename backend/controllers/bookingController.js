const Booking = require("../models/booking");
const Razorpay = require("razorpay");
const crypto = require("crypto");

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

exports.createBooking = async (req, res) => {
  try {
    const { homeId, checkIn, checkOut, totalPrice } = req.body;
    const guestId = req.user.id;

    if (!homeId || !checkIn || !checkOut || !totalPrice) {
      return res.status(400).json({ message: "Missing required booking fields" });
    }

    const booking = new Booking({
      homeId,
      guestId,
      checkIn,
      checkOut,
      totalPrice,
      status: "pending"
    });

    await booking.save();
    res.status(201).json({ message: "Request sent to host successfully", booking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error creating booking." });
  }
};

exports.getMyBookings = async (req, res) => {
  try {
    const guestId = req.user.id;
    // Populate the home data so we can display the image/title on the bookings page
    const bookings = await Booking.find({ guestId }).populate("homeId").sort({ createdAt: -1 });
    res.status(200).json({ bookings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error fetching bookings." });
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const guestId = req.user.id;

    const booking = await Booking.findOne({ _id: bookingId, guestId: guestId });
    if (!booking) {
      return res.status(404).json({ message: "Booking not found or you don't have permission to cancel it." });
    }

    booking.status = "cancelled";
    await booking.save();

    res.status(200).json({ message: "Booking cancelled successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error cancelling booking." });
  }
};

// Host gets all requests for their properties
exports.getHostRequests = async (req, res) => {
  try {
    const hostId = req.user.id;

    // Find all homes belonging to this host
    const Home = require("../models/home");
    const hostHomes = await Home.find({ host: hostId }).select('_id');
    const homeIds = hostHomes.map(home => home._id);

    // Find all bookings for these homes
    const requests = await Booking.find({ homeId: { $in: homeIds } })
      .populate("homeId")
      .populate("guestId", "name email") // get guest details
      .sort({ createdAt: -1 });

    res.status(200).json({ requests });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error fetching host requests." });
  }
};

// Host approves or rejects a booking
exports.updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const hostId = req.user.id;

    if (!["approved_pending_payment", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status update." });
    }

    const booking = await Booking.findById(id).populate("homeId");
    if (!booking) return res.status(404).json({ message: "Booking not found." });

    // Verify it belongs to host
    if (booking.homeId.host.toString() !== hostId) {
       return res.status(403).json({ message: "Not authorized to update this booking." });
    }

    // Checking collision if approving: Is there already a paid_confirmed booking for these exact dates?
    if (status === "approved_pending_payment") {
       // A robust check would check overlapping dates. For simplicity, we just check exact overlaps of confirmed bookings.
       const conflictingBooking = await Booking.findOne({
          homeId: booking.homeId._id,
          status: "paid_confirmed",
          $or: [
            { checkIn: { $lt: booking.checkOut, $gte: booking.checkIn } },
            { checkOut: { $gt: booking.checkIn, $lte: booking.checkOut } }
          ]
       });
       if (conflictingBooking) {
         return res.status(400).json({ message: "Cannot approve: A confirmed booking already exists for these dates." });
       }
    }

    booking.status = status;
    await booking.save();
    
    res.status(200).json({ message: `Booking ${status === 'rejected' ? 'rejected' : 'approved'}.`, booking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error updating booking status." });
  }
};

// Guest creates a Razorpay order for an approved booking
exports.createRazorpayOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const guestId = req.user.id;

    const booking = await Booking.findOne({ _id: id, guestId }).populate("homeId");
    if (!booking) return res.status(404).json({ message: "Booking not found." });

    if (booking.status !== "approved_pending_payment") {
      return res.status(400).json({ message: "Booking is not awaiting payment." });
    }

    const options = {
      amount: Math.round(booking.totalPrice * 100), // amount in paise
      currency: "INR",
      receipt: `receipt_${booking._id}`,
    };

    const order = await razorpayInstance.orders.create(options);

    res.status(200).json({ 
      orderId: order.id, 
      amount: options.amount,
      currency: options.currency
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error creating Razorpay order." });
  }
};

// Guest confirms successful payment (called by frontend on success handler)
exports.confirmRazorpayPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const guestId = req.user.id;

    const booking = await Booking.findOne({ _id: id, guestId });
    if (!booking) return res.status(404).json({ message: "Booking not found." });

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: "Missing Razorpay payment details." });
    }

    const text = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(text.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Invalid payment signature." });
    }

    booking.status = "paid_confirmed";
    await booking.save();

    res.status(200).json({ message: "Payment successful! Booking confirmed.", booking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error confirming payment." });
  }
};
