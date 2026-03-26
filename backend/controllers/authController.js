const User = require("../models/user");
const AppError = require("../utils/AppError");

// ==================== SYNC USER ====================
// Called by frontend after Firebase login/signup
exports.syncUser = async (req, res, next) => {
  const { firebaseUid, email, firstName, lastName, userType } = req.body;

  if (!firebaseUid || !email) {
    return next(new AppError("Firebase UID and Email are required", 400));
  }

  try {
    // 1. Try to find user by Firebase UID
    let user = await User.findOne({ firebaseUid });

    if (!user) {
      // 2. Try to find user by Email (if they created an account before Firebase)
      user = await User.findOne({ email });
      if (user) {
        // Link their old account to the new Firebase UID
        user.firebaseUid = firebaseUid;
        await user.save();
      }
    }

    if (user) {
      // User exists (either by UID or linked by Email)
      return res.status(200).json({
        message: "User synced successfully",
        user: {
          id: user._id,
          firebaseUid: user.firebaseUid,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          userType: user.userType,
        },
      });
    }

    // Creating entirely new user in MongoDB
    user = new User({
      firebaseUid,
      email,
      firstName: firstName || "User",
      lastName: lastName || "",
      userType: userType || "guest",
    });

    await user.save();

    res.status(201).json({
      message: "New user synced to MongoDB",
      user: {
        id: user._id,
        firebaseUid: user.firebaseUid,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        userType: user.userType,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ==================== GET ME ====================
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return next(new AppError("User not found in database", 404));
    }
    res.json({
      user: {
        id: user._id,
        firebaseUid: user.firebaseUid,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        userType: user.userType,
      },
    });
  } catch (err) {
    next(err);
  }
};
