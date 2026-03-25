const { Server } = require("socket.io");
const Message = require("./models/message");

const setupSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:5173", // React app
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log(`User Connected: ${socket.id}`);

    // Join a specific chat room defined by the Home and the Users involved
    socket.on("join_room", (room) => {
      socket.join(room);
      console.log(`User with ID: ${socket.id} joined room: ${room}`);
    });

    // Personal user room for global notifications (like Inbox updates)
    socket.on("join_user_room", (userId) => {
      socket.join(`user_${userId}`);
      console.log(`User joined their global notification room: user_${userId}`);
    });

    // Handle incoming messages
    socket.on("send_message", async (data) => {
      // data: { room: 'homeId_guestId', senderId: '...', receiverId: '...', homeId: '...', content: 'Hello!' }
      
      try {
        // 1. Save message to MongoDB so it persists
        const newMessage = new Message({
          senderId: data.senderId,
          receiverId: data.receiverId,
          homeId: data.homeId,
          content: data.content,
        });
        await newMessage.save();

        // Populate sender info before broadcasting (optional but helpful for UI)
        const populatedMessage = await Message.findById(newMessage._id).populate("senderId", "firstName photo");

        // 2. Broadcast the message only to the people in this specific room
        // We broadcast to everyone in the room (including the sender so their UI can confirm it was sent)
        io.to(data.room).emit("receive_message", populatedMessage);
        
        // Also broadcast a generic notification to the receiver's global room so their Inbox refreshes
        io.to(`user_${data.receiverId}`).emit("new_message_notification", populatedMessage);
        
      } catch (err) {
        console.error("Error saving message via socket:", err);
      }
    });

    socket.on("disconnect", () => {
      console.log("User Disconnected", socket.id);
    });
  });

  return io;
};

module.exports = setupSocket;
