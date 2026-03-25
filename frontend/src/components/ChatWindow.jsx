import { useState, useEffect, useRef } from "react";
import API from "../api/axios";
import { useSocket } from "../context/SocketContext";
import { useAuth } from "../context/AuthContext";

const ChatWindow = ({ home, otherUser, onBack }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  
  const socket = useSocket();
  const { user } = useAuth();
  const messagesEndRef = useRef(null);

  // Deterministic room generation
  const currentUserId = user.id || user._id;
  const otherId = otherUser.id || otherUser._id;
  const [u1, u2] = [currentUserId, otherId].sort();
  const room = `${home._id || home.id}_${u1}_${u2}`;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    // 1. Fetch chat history
    API.get(`/messages/${home._id}/${otherUser._id}`)
      .then((res) => {
        setMessages(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching messages", err);
        setLoading(false);
      });

    // 2. Setup Socket listeners
    if (socket) {
      socket.emit("join_room", room);

      const handleReceiveMessage = (message) => {
        setMessages((prev) => [...prev, message]);
      };

      socket.on("receive_message", handleReceiveMessage);

      return () => {
        socket.off("receive_message", handleReceiveMessage);
      };
    }
  }, [home._id, otherUser._id, room, socket]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket) return;

    const messageData = {
      room,
      homeId: home._id || home.id,
      senderId: user.id || user._id, // Auth context uses id
      receiverId: otherUser._id || otherUser.id,
      content: newMessage,
    };

    // Emit via socket (which also saves to DB on the backend)
    socket.emit("send_message", messageData);
    setNewMessage("");
  };

  if (loading) {
    return (
      <div className="flex-1 flex justify-center items-center h-full">
        <div className="w-8 h-8 border-3 border-teal-100 border-t-teal-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Chat Header */}
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="md:hidden text-gray-500 hover:text-teal-600 mr-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" /></svg>
          </button>
          <div className="w-10 h-10 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center font-bold text-lg">
            {otherUser.firstName?.charAt(0) || "U"}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{otherUser.firstName} {otherUser.lastName}</h3>
            <p className="text-xs text-gray-500">Inquiry about {home.houseName}</p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 p-6 overflow-y-auto bg-slate-50 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-400 mt-10 italic">
            Start the conversation about {home.houseName}!
          </div>
        ) : (
          messages.map((msg, idx) => {
            // Check if sender is current user (API returns string comparison or object mapping)
            const senderIdVal = msg.senderId?._id || msg.senderId;
            const isMe = senderIdVal === user.id || senderIdVal === user._id;

            return (
              <div key={msg._id || idx} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[70%] px-4 py-3 rounded-2xl text-sm ${
                  isMe ? "bg-teal-600 text-white rounded-br-sm" : "bg-white text-gray-800 border border-gray-200 shadow-sm rounded-bl-sm"
                }`}>
                  <p>{msg.content}</p>
                  <span className={`text-[10px] mt-1 block ${isMe ? "text-teal-200" : "text-gray-400"}`}>
                    {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-100">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-3 rounded-full border border-gray-200 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 bg-gray-50 text-sm"
            autoFocus
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="w-12 h-12 rounded-full bg-teal-600 text-white flex items-center justify-center hover:bg-teal-700 disabled:opacity-50 disabled:hover:bg-teal-600 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 -ml-1"><path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.925A1.5 1.5 0 005.135 9.25h6.115a.75.75 0 010 1.5H5.135a1.5 1.5 0 00-1.442 1.086l-1.414 4.926a.75.75 0 00.826.95 28.896 28.896 0 0015.293-7.154.75.75 0 000-1.115A28.897 28.897 0 003.105 2.289z" /></svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;
