const Home = require("../models/home");
const Booking = require("../models/booking");
const cloudinary = require("cloudinary").v2;

const deleteImage = async (imagePath) => {
  if (!imagePath || !imagePath.includes("cloudinary.com")) return;
  try {
    const parts = imagePath.split("/");
    const folderAndFile = parts.slice(-2).join("/"); // "RoamHaven/filename.jpg"
    const publicId = folderAndFile.substring(0, folderAndFile.lastIndexOf(".")); // handles dots in filenames
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.log("Error deleting from Cloudinary:", err.message);
  }
};

exports.getHostHomes = async (req, res) => {
  try {
    const homes = await Home.find({ host: req.user.id });
    res.json({ homes });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addHome = async (req, res) => {
  const { houseName, price, location, description } = req.body;
  
  // Parse coordinates if they exist (sent as JSON string from React FormData)
  let coordinates = {};
  if (req.body.coordinates) {
    try {
      coordinates = JSON.parse(req.body.coordinates);
    } catch (e) {
      console.log("Error parsing coordinates:", e);
    }
  }

  if (!req.files || req.files.length === 0) {
    return res.status(422).json({ message: "No images provided" });
  }

  const photos = req.files.map((file) => file.path);

  try {
    const home = new Home({
      houseName,
      price,
      location,
      coordinates,
      rating: 0, // Default to 0 for a new home
      photos,
      description,
      host: req.user.id,
    });
    await home.save();
    res.status(201).json({ message: "Home added successfully", home });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.editHome = async (req, res) => {
  const { houseName, price, location, description, existingPhotos } = req.body;
  const homeId = req.params.homeId;
  
  // Parse coordinates if they exist
  let coordinates = {};
  if (req.body.coordinates) {
    try {
      coordinates = JSON.parse(req.body.coordinates);
    } catch (e) {
      console.log("Error parsing coordinates:", e);
    }
  }

  try {
    const home = await Home.findById(homeId);
    if (!home) {
      return res.status(404).json({ message: "Home not found" });
    }

    home.houseName = houseName;
    home.price = price;
    home.location = location;
    if (Object.keys(coordinates).length > 0) {
      home.coordinates = coordinates;
    }
    home.description = description;

    // existingPhotos from frontend might be a string (if 1) or array (if multiple)
    let retainedPhotos = [];
    if (existingPhotos) {
      retainedPhotos = Array.isArray(existingPhotos) ? existingPhotos : [existingPhotos];
    }

    // Determine which previous photos were removed by the user
    // home.photos is the original array from the DB
    const oldPhotosToKeep = retainedPhotos;
    const photosToDelete = home.photos ? home.photos.filter((p) => !oldPhotosToKeep.includes(p)) : [];

    // Delete the photos the user removed
    await Promise.all(photosToDelete.map((photoPath) => deleteImage(photoPath)));

    // Map new uploaded files
    const newPhotos = req.files ? req.files.map((file) => file.path) : [];

    // Combine retained existing photos with newly uploaded photos
    home.photos = [...oldPhotosToKeep, ...newPhotos];

    await home.save();
    res.json({ message: "Home updated successfully", home });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteHome = async (req, res) => {
  const homeId = req.params.homeId;

  try {
    const home = await Home.findById(homeId);
    if (!home) {
      return res.status(404).json({ message: "Home not found" });
    }

    // Delete photo files
    if (home.photos && home.photos.length > 0) {
      await Promise.all(home.photos.map((photoPath) => deleteImage(photoPath)));
    }

    await Home.findByIdAndDelete(homeId);
    res.json({ message: "Home deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getDashboard = async (req, res) => {
  try {
    const homes = await Home.find({ host: req.user.id });
    const totalListings = homes.length;
    const avgPrice = totalListings > 0 ? Math.round(homes.reduce((sum, h) => sum + h.price, 0) / totalListings) : 0;
    const avgRating = totalListings > 0 ? (homes.reduce((sum, h) => sum + h.rating, 0) / totalListings).toFixed(1) : 0;
    const totalValue = homes.reduce((sum, h) => sum + h.price, 0);

    // Locations breakdown
    const locationMap = {};
    homes.forEach((h) => {
      locationMap[h.location] = (locationMap[h.location] || 0) + 1;
    });
    const locations = Object.entries(locationMap).map(([name, count]) => ({ name, count }));

    // Revenue from paid bookings
    const homeIds = homes.map((h) => h._id);
    const paidBookings = await Booking.find({
      homeId: { $in: homeIds },
      status: "paid_confirmed",
    });
    const totalRevenue = paidBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
    const totalBookings = paidBookings.length;

    res.json({
      stats: { totalListings, avgPrice, avgRating, totalValue, totalRevenue, totalBookings },
      homes,
      locations,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
