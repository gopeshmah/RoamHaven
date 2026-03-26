const User = require("../models/user");
const AppError = require("../utils/AppError");

exports.getFavourites = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate("favourites");
    if (!user) {
      return next(new AppError("User not found", 404));
    }
    res.json({ favourites: user.favourites });
  } catch (err) {
    next(err);
  }
};

exports.addFavourite = async (req, res, next) => {
  const homeId = req.params.homeId;

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return next(new AppError("User not found", 404));
    }
    if (!user.favourites.includes(homeId)) {
      user.favourites.push(homeId);
      await user.save();
    }
    res.json({ message: "Added to favourites", favourites: user.favourites });
  } catch (err) {
    next(err);
  }
};

exports.removeFavourite = async (req, res, next) => {
  const homeId = req.params.homeId;

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return next(new AppError("User not found", 404));
    }
    user.favourites = user.favourites.filter((fav) => fav.toString() !== homeId);
    await user.save();
    res.json({ message: "Removed from favourites", favourites: user.favourites });
  } catch (err) {
    next(err);
  }
};
