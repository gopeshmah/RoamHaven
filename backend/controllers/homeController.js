const Home = require("../models/home");

exports.getAllHomes = async (req, res) => {
  try {
    const { search, minPrice, maxPrice, minRating, location } = req.query;

    // Build dynamic filter
    const filter = {};

    // Text search on houseName (case-insensitive partial match)
    if (search) {
      filter.houseName = { $regex: search, $options: "i" };
    }

    // Location filter (case-insensitive partial match)
    if (location) {
      filter.location = { $regex: location, $options: "i" };
    }

    // Price range
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    // Minimum rating
    if (minRating) {
      filter.rating = { $gte: Number(minRating) };
    }

    const homes = await Home.find(filter).sort({ createdAt: -1 });
    res.json({ homes });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getHomeById = async (req, res) => {
  try {
    const home = await Home.findById(req.params.homeId).populate("host", "firstName lastName photo");
    if (!home) {
      return res.status(404).json({ message: "Home not found" });
    }
    res.json({ home });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
