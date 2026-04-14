const Booking = require("../models/booking");
const Home = require("../models/home");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const AppError = require("../utils/AppError");
const { sendBookingApprovedEmail, sendBookingRejectedEmail, sendPaymentConfirmationEmail } = require("../utils/sendEmail");

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

exports.createBooking = async (req, res, next) => {
  try {
    const { homeId, checkIn, checkOut, guests } = req.body;
    const guestId = req.user.id;

    if (!homeId || !checkIn || !checkOut) {
      return next(new AppError("Missing required booking fields", 400));
    }

    // Server-side price recalculation — never trust client-sent price
    const home = await Home.findById(homeId);
    if (!home) {
      return next(new AppError("Home not found", 404));
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));

    if (nights <= 0) {
      return next(new AppError("Check-out date must be after check-in date", 400));
    }

    // Validate guest count
    const guestCount = Number(guests) || 1;
    if (guestCount < 1 || guestCount > (home.maxGuests || 16)) {
      return next(new AppError(`Guest count must be between 1 and ${home.maxGuests || 16}`, 400));
    }

    const totalPrice = nights * home.price;

    const booking = new Booking({
      homeId,
      guestId,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      totalPrice,
      guests: guestCount,
      status: "pending"
    });

    await booking.save();
    res.status(201).json({ message: "Request sent to host successfully", booking });
  } catch (err) {
    next(err);
  }
};

exports.getMyBookings = async (req, res, next) => {
  try {
    const guestId = req.user.id;
    // Populate the home data so we can display the image/title on the bookings page
    const bookings = await Booking.find({ guestId }).populate("homeId").sort({ createdAt: -1 });
    res.status(200).json({ bookings });
  } catch (err) {
    next(err);
  }
};

exports.cancelBooking = async (req, res, next) => {
  try {
    const bookingId = req.params.id;
    const guestId = req.user.id;

    const booking = await Booking.findOne({ _id: bookingId, guestId: guestId });
    if (!booking) {
      return next(new AppError("Booking not found or you don't have permission to cancel it.", 404));
    }

    booking.status = "cancelled";
    await booking.save();

    res.status(200).json({ message: "Booking cancelled successfully" });
  } catch (err) {
    next(err);
  }
};

// Host gets all requests for their properties
exports.getHostRequests = async (req, res, next) => {
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
    next(err);
  }
};

// Host approves or rejects a booking
exports.updateBookingStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const hostId = req.user.id;

    if (!["approved_pending_payment", "rejected"].includes(status)) {
      return next(new AppError("Invalid status update.", 400));
    }

    const booking = await Booking.findById(id).populate("homeId").populate("guestId", "firstName email");
    if (!booking) return next(new AppError("Booking not found.", 404));

    // Verify it belongs to host
    if (booking.homeId.host.toString() !== hostId) {
       return next(new AppError("Not authorized to update this booking.", 403));
    }

    // Checking collision if approving: Is there already a paid_confirmed booking for these exact dates?
    if (status === "approved_pending_payment") {
       const conflictingBooking = await Booking.findOne({
          homeId: booking.homeId._id,
          status: "paid_confirmed",
          $or: [
            { checkIn: { $lt: booking.checkOut, $gte: booking.checkIn } },
            { checkOut: { $gt: booking.checkIn, $lte: booking.checkOut } }
          ]
       });
       if (conflictingBooking) {
         return next(new AppError("Cannot approve: A confirmed booking already exists for these dates.", 400));
       }
    }

    booking.status = status;
    await booking.save();

    // Send email notification to the guest
    const guestEmail = booking.guestId.email;
    const guestName = booking.guestId.firstName;
    const homeName = booking.homeId.houseName;

    if (status === "approved_pending_payment") {
      sendBookingApprovedEmail(guestEmail, guestName, homeName, booking.checkIn, booking.checkOut, booking.totalPrice);
    } else if (status === "rejected") {
      sendBookingRejectedEmail(guestEmail, guestName, homeName, booking.checkIn, booking.checkOut);
    }
    
    res.status(200).json({ message: `Booking ${status === 'rejected' ? 'rejected' : 'approved'}.`, booking });
  } catch (err) {
    next(err);
  }
};

// Guest creates a Razorpay order for an approved booking
exports.createRazorpayOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const guestId = req.user.id;

    const booking = await Booking.findOne({ _id: id, guestId }).populate("homeId");
    if (!booking) return next(new AppError("Booking not found.", 404));

    if (booking.status === "paid_confirmed") {
      return next(new AppError("This booking is already paid.", 400));
    }

    if (booking.status !== "approved_pending_payment") {
      return next(new AppError("Booking is not awaiting payment.", 400));
    }

    // If an order was already created, reuse it instead of creating a duplicate
    if (booking.razorpayOrderId) {
      try {
        const existingOrder = await razorpayInstance.orders.fetch(booking.razorpayOrderId);
        // If order is still in "created" or "attempted" state, reuse it
        if (existingOrder && (existingOrder.status === "created" || existingOrder.status === "attempted")) {
          return res.status(200).json({
            orderId: existingOrder.id,
            amount: existingOrder.amount,
            currency: existingOrder.currency,
          });
        }
        // If order is "paid", the payment already went through — update booking
        if (existingOrder && existingOrder.status === "paid") {
          booking.status = "paid_confirmed";
          await booking.save();
          return next(new AppError("This booking is already paid. Please refresh the page.", 400));
        }
      } catch (fetchErr) {
        // If we can't fetch the old order, create a new one
        console.warn("Could not fetch existing Razorpay order, creating new one:", fetchErr.message);
      }
    }

    const options = {
      amount: Math.round(booking.totalPrice * 100), // amount in paise
      currency: "INR",
      receipt: `receipt_${booking._id}`,
    };

    const order = await razorpayInstance.orders.create(options);

    // Save the order ID on the booking for future reference
    booking.razorpayOrderId = order.id;
    await booking.save();

    res.status(200).json({ 
      orderId: order.id, 
      amount: options.amount,
      currency: options.currency
    });
  } catch (err) {
    next(err);
  }
};

// Guest confirms successful payment (called by frontend on success handler)
exports.confirmRazorpayPayment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const guestId = req.user.id;

    const booking = await Booking.findOne({ _id: id, guestId }).populate("homeId").populate("guestId");
    if (!booking) return next(new AppError("Booking not found.", 404));

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return next(new AppError("Missing Razorpay payment details.", 400));
    }

    const text = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(text.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return next(new AppError("Invalid payment signature.", 400));
    }

    booking.status = "paid_confirmed";
    await booking.save();

    // Send payment confirmation email to the guest
    if (booking.guestId && booking.homeId) {
      sendPaymentConfirmationEmail(
        booking.guestId.email,
        booking.guestId.firstName,
        booking.homeId.houseName,
        booking.checkIn,
        booking.checkOut,
        booking.totalPrice
      );
    }

    res.status(200).json({ message: "Payment successful! Booking confirmed.", booking });
  } catch (err) {
    next(err);
  }
};
