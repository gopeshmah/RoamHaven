const User = require("../models/user");

exports.getFavourites = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("favourites");
    res.json({ favourites: user.favourites });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addFavourite = async (req, res) => {
  const homeId = req.params.homeId;

  try {
    const user = await User.findById(req.user.id);
    if (!user.favourites.includes(homeId)) {
      user.favourites.push(homeId);
      await user.save();
    }
    res.json({ message: "Added to favourites", favourites: user.favourites });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.removeFavourite = async (req, res) => {
  const homeId = req.params.homeId;

  try {
    const user = await User.findById(req.user.id);
    user.favourites = user.favourites.filter((fav) => fav.toString() !== homeId);
    await user.save();
    res.json({ message: "Removed from favourites", favourites: user.favourites });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
