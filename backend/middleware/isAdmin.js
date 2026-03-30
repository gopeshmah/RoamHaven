const isAdmin = (req, res, next) => {
  if (req.user && req.user.userType === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Access denied. Admin resources only." });
  }
};

module.exports = isAdmin;
