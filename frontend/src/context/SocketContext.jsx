import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext();

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { isLoggedIn, user } = useAuth();

  useEffect(() => {
    // Only connect if the user is authenticated and data is loaded
    if (isLoggedIn && user) {
      const newSocket = io("http://localhost:5000", {
        withCredentials: true,
      });

      newSocket.on("connect", () => {
         const currentId = user.id || user._id;
         if (currentId) {
             newSocket.emit("join_user_room", currentId);
         }
      });

      setSocket(newSocket);

      return () => newSocket.close();
    } else {
      // Disconnect if user logs out
      if (socket) {
        socket.close();
        setSocket(null);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn, user]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
