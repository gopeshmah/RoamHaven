import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import API from "../api/axios";
import ChatWindow from "../components/ChatWindow";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";

const InboxPage = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeConversation, setActiveConversation] = useState(null);
  const { user } = useAuth();
  const socket = useSocket();
  const location = useLocation();

  const fetchInbox = () => {
    API.get("/messages/inbox")
      .then((res) => {
        let loadedConvos = res.data;

        // Check if we came from a "Contact Host" button with a brand new chat
        if (location.state?.newChat && user) {
          const { home, otherUser } = location.state.newChat;
          const currentUserId = user.id || user._id;
          const otherId = otherUser.id || otherUser._id;
          const [u1, u2] = [currentUserId, otherId].sort();
          const targetRoom = `${home._id || home.id}_${u1}_${u2}`;
          
          // If this exact chat isn't in our history yet, inject it temporarily
          const exists = loadedConvos.find(c => {
             const cHomeId = c.home._id || c.home.id;
             const cUserId = c.otherUser._id || c.otherUser.id;
             return cHomeId === (home._id || home.id) && cUserId === otherId;
          });

          if (!exists) {
            const newConvoTemplate = {
              home,
              otherUser,
              latestMessage: "Start a conversation...",
              updatedAt: new Date().toISOString(),
              room: targetRoom
            };
            loadedConvos = [newConvoTemplate, ...loadedConvos];
          }
          
          // Automatically open this conversation
          const target = exists || loadedConvos[0];
          setActiveConversation(target);

          // Clear the location state so refreshing the page doesn't keep running this
          window.history.replaceState({}, document.title);
        }

        setConversations(loadedConvos);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load inbox", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchInbox();
  }, [location.state]);

  // Real-time inbox update listener
  useEffect(() => {
    if (!socket) return;
    
    // Refresh inbox if someone messages us globally
    const handleInboxRefresh = () => {
       fetchInbox();
    };

    socket.on("new_message_notification", handleInboxRefresh);
    socket.on("receive_message", handleInboxRefresh); // Also refresh if we are currently chatting

    return () => {
       socket.off("new_message_notification", handleInboxRefresh);
       socket.off("receive_message", handleInboxRefresh);
    };
  }, [socket]);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="w-12 h-12 border-3 border-teal-100 border-t-teal-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8 bg-gray-50 flex justify-center">
      <div className="w-full max-w-6xl animate-fade-in-up">
        
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Inbox</h1>
          <p className="text-gray-500 mt-1">Chat with hosts and guests</p>
        </div>

        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden flex h-[700px]">
          
          {/* Left Panel: Conversation List */}
          <div className={`${activeConversation ? "hidden md:flex" : "flex"} flex-col w-full md:w-1/3 border-r border-gray-100`}>
            {conversations.length === 0 ? (
              <div className="p-8 text-center text-gray-500 flex flex-col items-center justify-center h-full">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-gray-300 mb-4"><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" /></svg>
                <p>No messages yet.</p>
              </div>
            ) : (
              <div className="overflow-y-auto w-full h-full">
                {conversations.map((conv) => {
                  const isActive = activeConversation?.room === conv.room;
                  return (
                    <button
                      key={conv.room}
                      onClick={() => setActiveConversation(conv)}
                      className={`w-full text-left p-5 border-b border-gray-50 flex items-start gap-4 transition-colors ${
                        isActive ? "bg-teal-50 border-teal-100" : "hover:bg-gray-50"
                      }`}
                    >
                      <div className="relative shrink-0">
                        <img 
                          src={conv.home.photos?.[0] || conv.home.photo || "/placeholder.jpg"} 
                          alt="home" 
                          className="w-14 h-14 object-cover rounded-xl"
                        />
                        <div className="absolute -bottom-2 -right-2 w-7 h-7 bg-white rounded-full flex justify-center items-center shadow-sm">
                           <div className="w-6 h-6 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center font-bold text-[10px]">
                            {conv.otherUser.firstName?.charAt(0) || "U"}
                           </div>
                        </div>
                      </div>
                      
                      <div className="overflow-hidden w-full">
                        <div className="flex justify-between items-Baseline mb-1">
                          <h4 className="font-semibold text-gray-900 truncate pr-2">{conv.otherUser.firstName}</h4>
                          <span className="text-[10px] text-gray-400 shrink-0">
                            {new Date(conv.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                        <p className="text-xs text-teal-600 font-medium mb-1 truncate">{conv.home.houseName}</p>
                        <p className="text-sm text-gray-500 truncate">{conv.latestMessage}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Panel: Chat Window */}
          <div className={`${!activeConversation ? "hidden md:flex" : "flex"} flex-col w-full md:w-2/3 bg-slate-50 relative`}>
            {activeConversation ? (
              <ChatWindow 
                home={activeConversation.home} 
                otherUser={activeConversation.otherUser} 
                onBack={() => setActiveConversation(null)}
              />
            ) : (
              <div className="flex-1 flex flex-col justify-center items-center text-gray-400 p-8 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-20 h-20 text-gray-200 mb-6"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.84 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" /></svg>
                <h3 className="text-xl font-medium text-gray-800 mb-2">Your Messages</h3>
                <p>Select a conversation from the left to start chatting.</p>
              </div>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default InboxPage;
