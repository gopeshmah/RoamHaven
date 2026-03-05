const admin = require("../config/firebase-admin");
const User = require("../models/user");

const auth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided, authorization denied" });
  }

  const token = authHeader.split(" ")[1];
  try {
    // Verify the Firebase ID token uses Admin SDK
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Find the corresponding MongoDB user
    const user = await User.findOne({ firebaseUid: decodedToken.uid });
    
    if (!user) {
      // If user is not yet synced to MongoDB, we still allow the request 
      // but only attach the decoded Firebase credentials.
      req.user = { id: decodedToken.uid, firebaseUid: decodedToken.uid, email: decodedToken.email };
    } else {
      // Attach user info to request (casting _id to string for strict equality checks to pass in controllers)
      req.user = {
        id: user._id.toString(),
        firebaseUid: user.firebaseUid,
        email: user.email,
        userType: user.userType
      };
    }
    
    next();
  } catch (err) {
    return res.status(401).json({ message: "Firebase token is not valid", error: err.message });
  }
};

module.exports = auth;
