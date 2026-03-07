const express = require("express");
const router = express.Router();
const favouriteController = require("../controllers/favouriteController");
const auth = require("../middleware/auth");

router.use(auth);

router.get("/", favouriteController.getFavourites);
router.post("/:homeId", favouriteController.addFavourite);
router.delete("/:homeId", favouriteController.removeFavourite);

module.exports = router;
