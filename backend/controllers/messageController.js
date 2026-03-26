const Message = require('../models/message');
const AppError = require("../utils/AppError");

// Get chat history for a specific room (homeId between two users)
exports.getMessages = async (req, res, next) => {
  try {
    const { homeId, otherUserId } = req.params;
    const currentUserId = req.user.id;

    const messages = await Message.find({
      homeId,
      $or: [
        { senderId: currentUserId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: currentUserId }
      ]
    }).populate("senderId", "firstName photo").sort({ createdAt: 1 }); // Oldest first for chat UI

    res.status(200).json(messages);
  } catch (err) {
    next(err);
  }
};

// Get the user's Inbox (list of all unique conversations)
exports.getInbox = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Find all messages where the user is either the sender or receiver
    const messages = await Message.find({
      $or: [{ senderId: userId }, { receiverId: userId }]
    })
    .populate("homeId", "houseName photo photos")
    .populate("senderId", "firstName lastName photo")
    .populate("receiverId", "firstName lastName photo")
    .sort({ createdAt: -1 });

    // Group by unique conversation (homeId + otherUserId combination)
    const conversations = {};
    
    messages.forEach(msg => {
       const otherUser = msg.senderId._id.toString() === userId ? msg.receiverId : msg.senderId;
       const [u1, u2] = [userId, otherUser._id.toString()].sort();
       const conversationKey = `${msg.homeId._id}_${u1}_${u2}`;
       
       // Because messages are sorted newest first, the first one we see for a key is the latest
       if (!conversations[conversationKey]) {
          conversations[conversationKey] = {
             home: msg.homeId,
             otherUser: otherUser,
             latestMessage: msg.content,
             updatedAt: msg.createdAt,
             room: conversationKey // Unique identifier for the socket room
          };
       }
    });

    res.status(200).json(Object.values(conversations));
  } catch (err) {
    next(err);
  }
};
