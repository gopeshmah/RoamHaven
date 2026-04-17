import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";
import { useSocket } from "../context/SocketContext";
import toast from "react-hot-toast";

const Navbar = () => {
  const { user, isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const socket = useSocket();

  // Global Message Listener
  useEffect(() => {
    if (!socket) return;

    const handleGlobalMessageNotification = () => {
      // Only show the popup if the user is NOT already on the inbox page
      if (location.pathname !== "/inbox") {
        toast.success("You received a new message!", {
          icon: '💬',
          duration: 4000,
        });
      }
    };

    socket.on("new_message_notification", handleGlobalMessageNotification);

    return () => {
      socket.off("new_message_notification", handleGlobalMessageNotification);
    };
  }, [socket, location.pathname]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  const navLink = (path, label, icon) => (
    <Link
      to={path}
      className={`py-2 px-4 rounded-xl text-sm font-medium flex items-center gap-2 transition-all duration-300 ${
        isActive(path)
          ? "bg-white text-teal-700 shadow-sm"
          : "text-white/80 hover:text-white hover:bg-white/15"
      }`}
    >
      {icon}
      {label}
    </Link>
  );

  return (
    <header className="sticky top-0 z-50">
      {/* Main Nav */}
      <nav className="bg-gradient-to-r from-teal-600 via-teal-500 to-emerald-500 shadow-lg shadow-teal-500/15">
        <div className="container mx-auto px-4 lg:px-8">
          {/* Desktop */}
          <div className="hidden md:flex md:justify-between md:items-center h-16">
            <div className="flex items-center gap-1">
              <Link to="/" className="flex items-center gap-2.5 mr-6 group">
                <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/30 transition-all duration-300 shadow-inner">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-5 h-5">
                    <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z" />
                    <path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.43z" />
                  </svg>
                </div>
                <span className="text-xl font-bold text-white tracking-tight">Roam<span className="text-teal-100">Haven</span></span>
              </Link>

              {isLoggedIn && user?.userType === "guest" && (
                <>
                  {navLink("/homes", "Explore",
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" /></svg>
                  )}
                  {navLink("/favourites", "Favourites",
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="M9.653 16.915l-.005-.003-.019-.01a20.759 20.759 0 01-1.162-.682 22.045 22.045 0 01-2.765-2.085C4.006 12.553 2 10.085 2 7a4.5 4.5 0 018-2.828A4.5 4.5 0 0118 7c0 3.085-2.006 5.553-3.702 7.135a22.045 22.045 0 01-2.765 2.085 12.22 12.22 0 01-1.162.682l-.02.01-.005.003h-.002a.739.739 0 01-.69 0z" /></svg>
                  )}
                  {navLink("/bookings", "Bookings",
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75z" clipRule="evenodd" /></svg>
                  )}
                  {navLink("/inbox", "Messages",
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M2.5 4.5A1.5 1.5 0 014 3h12a1.5 1.5 0 011.5 1.5v11A1.5 1.5 0 0116 17H4a1.5 1.5 0 01-1.5-1.5v-11zm1.5-.04V4.5a.75.75 0 00.179.482L10 11.451l5.821-6.47a.75.75 0 00.179-.481v-.04A.46.46 0 0015.54 4H4.46a.46.46 0 00-.46.46z" clipRule="evenodd" /></svg>
                  )}
                </>
              )}

              {isLoggedIn && user?.userType === "host" && (
                <>
                  {navLink("/host/dashboard", "Dashboard",
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="M15.5 2A1.5 1.5 0 0014 3.5v13a1.5 1.5 0 001.5 1.5h1a1.5 1.5 0 001.5-1.5v-13A1.5 1.5 0 0016.5 2h-1zM9.5 6A1.5 1.5 0 008 7.5v9A1.5 1.5 0 009.5 18h1a1.5 1.5 0 001.5-1.5v-9A1.5 1.5 0 0010.5 6h-1zM3.5 10A1.5 1.5 0 002 11.5v5A1.5 1.5 0 003.5 18h1A1.5 1.5 0 006 16.5v-5A1.5 1.5 0 004.5 10h-1z" /></svg>
                  )}
                  {navLink("/host/requests", "Requests",
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M10 2a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 2zM10 15a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5a.75.75 0 01.75-.75zM4.929 4.929a.75.75 0 011.06 0l1.06 1.06a.75.75 0 01-1.06 1.06l-1.06-1.06a.75.75 0 010-1.06zm8.485 8.485a.75.75 0 011.06 0l1.06 1.06a.75.75 0 01-1.06 1.06l-1.06-1.06a.75.75 0 010-1.06zM2 10a.75.75 0 01.75-.75h1.5a.75.75 0 010 1.5h-1.5A.75.75 0 012 10zm13 0a.75.75 0 01.75-.75h1.5a.75.75 0 010 1.5h-1.5a.75.75 0 01-.75-.75zM3.985 14.125a.75.75 0 00-1.06 1.06l1.06 1.06a.75.75 0 001.06-1.06l-1.06-1.06zm10.97-10.97a.75.75 0 001.06-1.06l1.06 1.06a.75.75 0 00-1.06 1.06l-1.06-1.06z" clipRule="evenodd" /></svg>
                  )}
                  {navLink("/host/homes", "My Listings",
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M4.25 2A2.25 2.25 0 002 4.25v2.5A2.25 2.25 0 004.25 9h2.5A2.25 2.25 0 009 6.75v-2.5A2.25 2.25 0 006.75 2h-2.5zm0 9A2.25 2.25 0 002 13.25v2.5A2.25 2.25 0 004.25 18h2.5A2.25 2.25 0 009 15.75v-2.5A2.25 2.25 0 006.75 11h-2.5zm9-9A2.25 2.25 0 0011 4.25v2.5A2.25 2.25 0 0013.25 9h2.5A2.25 2.25 0 0018 6.75v-2.5A2.25 2.25 0 0015.75 2h-2.5zm0 9A2.25 2.25 0 0011 13.25v2.5A2.25 2.25 0 0013.25 18h2.5A2.25 2.25 0 0018 15.75v-2.5A2.25 2.25 0 0015.75 11h-2.5z" clipRule="evenodd" /></svg>
                  )}
                  {navLink("/host/add-home", "Add Listing",
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" /></svg>
                  )}
                  {navLink("/inbox", "Messages",
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M2.5 4.5A1.5 1.5 0 014 3h12a1.5 1.5 0 011.5 1.5v11A1.5 1.5 0 0116 17H4a1.5 1.5 0 01-1.5-1.5v-11zm1.5-.04V4.5a.75.75 0 00.179.482L10 11.451l5.821-6.47a.75.75 0 00.179-.481v-.04A.46.46 0 0015.54 4H4.46a.46.46 0 00-.46.46z" clipRule="evenodd" /></svg>
                  )}
                </>
              )}

              {isLoggedIn && user?.userType === "admin" && (
                <>
                  {navLink("/admin/dashboard", "Admin Portal",
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" /></svg>
                  )}
                </>
              )}
            </div>

            <div className="flex items-center gap-3">
              {!isLoggedIn ? (
                <>
                  <Link to="/signup" className="py-2 px-5 rounded-xl text-sm font-medium text-white/90 hover:text-white border border-white/30 hover:border-white/60 hover:bg-white/10 transition-all duration-300">Sign Up</Link>
                  <Link to="/login" className="py-2 px-5 rounded-xl text-sm font-semibold bg-white text-teal-700 hover:bg-teal-50 shadow-sm transition-all duration-300">Log In</Link>
                </>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 py-1.5 px-3 rounded-xl bg-white/15">
                    <div className="w-7 h-7 rounded-full bg-white text-teal-600 flex items-center justify-center text-xs font-bold shadow-sm">
                      {user?.firstName?.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-white">{user?.firstName}</span>
                  </div>
                  <button onClick={handleLogout} className="py-2 px-4 rounded-xl text-sm font-medium text-white/80 hover:text-white border border-white/25 hover:border-white/50 hover:bg-white/10 transition-all duration-300 flex items-center gap-2 cursor-pointer">
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile */}
          <div className="md:hidden">
            <div className="flex justify-between items-center h-14">
              <Link to="/" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-4 h-4">
                    <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z" />
                    <path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.43z" />
                  </svg>
                </div>
                <span className="text-lg font-bold text-white">Roam<span className="text-teal-100">Haven</span></span>
              </Link>
              <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 rounded-lg hover:bg-white/15 transition-all cursor-pointer text-white">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
                  {mobileOpen
                    ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    : <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                  }
                </svg>
              </button>
            </div>

            {mobileOpen && (
              <div className="pb-4 pt-2 border-t border-white/15 animate-fade-in-up">
                <div className="flex flex-col gap-1">
                  {isLoggedIn && user?.userType === "guest" && (
                    <>
                      <Link to="/homes" onClick={() => setMobileOpen(false)} className="py-2.5 px-4 rounded-xl text-white/90 hover:bg-white/15 text-sm font-medium">Explore</Link>
                      <Link to="/favourites" onClick={() => setMobileOpen(false)} className="py-2.5 px-4 rounded-xl text-white/90 hover:bg-white/15 text-sm font-medium">Favourites</Link>
                      <Link to="/bookings" onClick={() => setMobileOpen(false)} className="py-2.5 px-4 rounded-xl text-white/90 hover:bg-white/15 text-sm font-medium">Bookings</Link>
                      <Link to="/inbox" onClick={() => setMobileOpen(false)} className="py-2.5 px-4 rounded-xl text-white/90 hover:bg-white/15 text-sm font-medium">Messages</Link>
                    </>
                  )}
                  {isLoggedIn && user?.userType === "host" && (
                    <>
                      <Link to="/host/dashboard" onClick={() => setMobileOpen(false)} className="py-2.5 px-4 rounded-xl text-white/90 hover:bg-white/15 text-sm font-medium">Dashboard</Link>
                      <Link to="/host/requests" onClick={() => setMobileOpen(false)} className="py-2.5 px-4 rounded-xl text-white/90 hover:bg-white/15 text-sm font-medium">Requests</Link>
                      <Link to="/host/homes" onClick={() => setMobileOpen(false)} className="py-2.5 px-4 rounded-xl text-white/90 hover:bg-white/15 text-sm font-medium">My Listings</Link>
                      <Link to="/host/add-home" onClick={() => setMobileOpen(false)} className="py-2.5 px-4 rounded-xl text-white/90 hover:bg-white/15 text-sm font-medium">Add Listing</Link>
                      <Link to="/inbox" onClick={() => setMobileOpen(false)} className="py-2.5 px-4 rounded-xl text-white/90 hover:bg-white/15 text-sm font-medium">Messages</Link>
                    </>
                  )}
                  {isLoggedIn && user?.userType === "admin" && (
                    <>
                      <Link to="/admin/dashboard" onClick={() => setMobileOpen(false)} className="py-2.5 px-4 rounded-xl text-white/90 hover:bg-white/15 text-sm font-medium flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" /></svg>
                        Admin Portal
                      </Link>
                    </>
                  )}
                  <div className="border-t border-white/15 mt-2 pt-2">
                    {!isLoggedIn ? (
                      <div className="flex gap-2">
                        <Link to="/signup" onClick={() => setMobileOpen(false)} className="flex-1 text-center py-2.5 px-4 rounded-xl text-sm text-white border border-white/30 font-medium">Sign Up</Link>
                        <Link to="/login" onClick={() => setMobileOpen(false)} className="flex-1 text-center py-2.5 px-4 rounded-xl text-sm bg-white text-teal-700 font-semibold">Log In</Link>
                      </div>
                    ) : (
                      <button onClick={() => { handleLogout(); setMobileOpen(false); }} className="w-full py-2.5 px-4 rounded-xl text-sm text-white border border-white/30 hover:bg-white/10 cursor-pointer font-medium transition-all">Logout</button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
