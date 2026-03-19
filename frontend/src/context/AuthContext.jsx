import { createContext, useContext, useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebase";
import API from "../api/axios";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Firebase listener for login/logout state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Firebase provided a token automatically. 
          // Our Axios interceptor attaches it, so we just call /me to get MongoDB data (like userType)
          const res = await API.get("/auth/me");
          setUser(res.data.user);
        } catch (err) {
          // If the user isn't in MongoDB yet (like during initial signup), we keep the Firebase base user
          setUser({ email: firebaseUser.email, firebaseUid: firebaseUser.uid });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  const isLoggedIn = !!user;

  return (
    <AuthContext.Provider value={{ user, setUser, isLoggedIn, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
