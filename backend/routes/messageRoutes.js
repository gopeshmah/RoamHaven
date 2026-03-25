const express = require("express");
const router = express.Router();
const messageController = require("../controllers/messageController");
const auth = require("../middleware/auth");

// Fetch the user's Inbox
router.get("/inbox", auth, messageController.getInbox);

// Fetch chat history between current user and {otherUserId} for {homeId}
router.get("/:homeId/:otherUserId", auth, messageController.getMessages);

module.exports = router;
