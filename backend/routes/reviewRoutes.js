const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/reviewController");
const auth = require("../middleware/auth");

// GET /api/reviews/:homeId (Publicly accessible to read reviews)
router.get("/:homeId", reviewController.getHomeReviews);

// POST /api/reviews (Requires authentication)
router.post("/", auth, reviewController.createReview);

module.exports = router;
