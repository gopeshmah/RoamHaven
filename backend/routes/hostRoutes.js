const express = require("express");
const router = express.Router();
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;
const hostController = require("../controllers/hostController");
const auth = require("../middleware/auth");

// Cloudinary upload middleware — only for routes that need file uploads
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "RoamHaven",
    allowed_formats: ["jpg", "png", "jpeg"],
  },
});
const upload = multer({ storage });

router.use(auth);

router.get("/my-homes", hostController.getHostHomes);
router.get("/dashboard", hostController.getDashboard);
router.post("/add-home", upload.array("photos", 5), hostController.addHome);
router.put("/edit-home/:homeId", upload.array("photos", 5), hostController.editHome);
router.delete("/delete-home/:homeId", hostController.deleteHome);

module.exports = router;
