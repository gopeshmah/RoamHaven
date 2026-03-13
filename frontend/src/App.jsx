import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import HomePage from "./pages/HomePage";
import HomesPage from "./pages/HomesPage";
import HomeDetailPage from "./pages/HomeDetailPage";
import FavouritesPage from "./pages/FavouritesPage";
import BookingsPage from "./pages/BookingsPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import HostHomesPage from "./pages/HostHomesPage";
import AddEditHomePage from "./pages/AddEditHomePage";
import HostDashboardPage from "./pages/HostDashboardPage";
import HostBookingsPage from "./pages/HostBookingsPage";
import NotFoundPage from "./pages/NotFoundPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import PaymentSuccessPage from "./pages/PaymentSuccessPage";
import PaymentCancelPage from "./pages/PaymentCancelPage";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/homes" element={<HomesPage />} />
            <Route path="/homes/:homeId" element={<HomeDetailPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />

            {/* Protected Guest Routes */}
            <Route path="/favourites" element={<ProtectedRoute><FavouritesPage /></ProtectedRoute>} />
            <Route path="/bookings" element={<ProtectedRoute><BookingsPage /></ProtectedRoute>} />
            <Route path="/payment-success" element={<ProtectedRoute><PaymentSuccessPage /></ProtectedRoute>} />
            <Route path="/payment-cancel" element={<ProtectedRoute><PaymentCancelPage /></ProtectedRoute>} />

            {/* Protected Host Routes */}
            <Route path="/host/dashboard" element={<ProtectedRoute><HostDashboardPage /></ProtectedRoute>} />
            <Route path="/host/requests" element={<ProtectedRoute><HostBookingsPage /></ProtectedRoute>} />
            <Route path="/host/homes" element={<ProtectedRoute><HostHomesPage /></ProtectedRoute>} />
            <Route path="/host/add-home" element={<ProtectedRoute><AddEditHomePage /></ProtectedRoute>} />
            <Route path="/host/edit-home/:homeId" element={<ProtectedRoute><AddEditHomePage /></ProtectedRoute>} />

            {/* 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
