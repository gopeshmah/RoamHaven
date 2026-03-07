const express = require("express");
const router = express.Router();
const homeController = require("../controllers/homeController");

router.get("/", homeController.getAllHomes);
router.get("/:homeId", homeController.getHomeById);

module.exports = router;
