const User = require("../models/user");

// ==================== SYNC USER ====================
// Called by frontend after Firebase login/signup
exports.syncUser = async (req, res) => {
  const { firebaseUid, email, firstName, lastName, userType } = req.body;

  if (!firebaseUid || !email) {
    return res.status(400).json({ message: "Firebase UID and Email are required" });
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
    res.status(500).json({ errors: [err.message] });
  }
};

// ==================== GET ME ====================
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found in database" });
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
    res.status(500).json({ message: err.message });
  }
};
