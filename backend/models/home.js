const mongoose = require("mongoose");

const homeSchema = mongoose.Schema({
  houseName: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  coordinates: {
    lat: Number,
    lng: Number,
  },
  rating: {
    type: Number,
    required: true,
  },
  maxGuests: {
    type: Number,
    default: 1,
    min: 1,
    max: 16,
  },
  photo: String,
  photos: [String],
  description: String,
  host: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

module.exports = mongoose.model("Home", homeSchema);
