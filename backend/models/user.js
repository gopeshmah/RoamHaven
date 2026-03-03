const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  firstName: {
    type: String,
    required: [true, "First name is required"],
  },
  lastName: String,
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
  },
  // Handled by Firebase
  firebaseUid: {
    type: String,
    required: [true, "Firebase UID is required"],
    unique: true,
  },
  userType: {
    type: String,
    enum: ["guest", "host"],
    default: "guest",
  },
  favourites: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Home",
    },
  ],
});

module.exports = mongoose.model("User", userSchema);
