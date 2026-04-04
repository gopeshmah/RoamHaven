import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";
import { format } from "date-fns";
import toast from "react-hot-toast";

const HostBookingsPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await API.get("/bookings/host-requests");
      setRequests(res.data.requests);
    } catch (err) {
      console.error("Error fetching requests:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await API.put(`/bookings/${id}/status`, { status });
      // update local state to reflect change without refetching immediately
      setRequests((prev) =>
        prev.map((req) => (req._id === id ? { ...req, status } : req))
      );
      if (status === "approved_pending_payment") {
         toast.success("Request approved! The guest has been notified to make the payment.");
      } else {
         toast.success("Request rejected.");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update booking status.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="w-12 h-12 border-3 border-teal-100 border-t-teal-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Separate active pending requests from resolved ones (for visual hierarchy)
  const pendingRequests = requests.filter(req => req.status === "pending");
  const otherRequests = requests.filter(req => req.status !== "pending");

  return (
    <div className="min-h-screen px-4 py-10 bg-gray-50">
      <div className="container mx-auto max-w-6xl animate-fade-in-up">
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-200 pb-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">Booking Requests</h1>
            <p className="text-gray-500 text-lg">Manage reservations for your properties here.</p>
          </div>
        </div>

        {requests.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
            <div className="text-7xl mb-6 animate-float">📨</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">No requests yet</h2>
            <p className="text-gray-500 text-lg mb-8 max-w-md mx-auto">When guests request to book your properties, they will appear here for your approval.</p>
            <Link to="/host/add-home" className="btn-primary px-8 py-3.5 rounded-xl font-bold text-lg inline-block">
              Create Another Listing
            </Link>
          </div>
        ) : (
          <div className="space-y-12">
            
            {/* Pending Requests Section */}
            {pendingRequests.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-amber-500 animate-pulse"></span>
                  Action Required ({pendingRequests.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {pendingRequests.map(req => <RequestCard key={req._id} booking={req} onUpdate={handleUpdateStatus} />)}
                </div>
              </section>
            )}

            {/* Other Requests Section */}
            {otherRequests.length > 0 && (
              <section className={pendingRequests.length > 0 ? "pt-10 border-t border-gray-200" : ""}>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Past & Resolved Requests</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 opacity-80 hover:opacity-100 transition-opacity">
                  {otherRequests.map(req => <RequestCard key={req._id} booking={req} onUpdate={handleUpdateStatus} />)}
                </div>
              </section>
            )}

          </div>
        )}
      </div>
    </div>
  );
};

// Subcomponent for the Request Card to keep the main component clean
const RequestCard = ({ booking, onUpdate }) => {
  const home = booking.homeId;
  const guest = booking.guestId;
  const checkInDate = new Date(booking.checkIn);
  const checkOutDate = new Date(booking.checkOut);
  const getImgSrc = (path) => path ? (path.startsWith("http") ? path : `${API_URL}${path}`) : "/placeholder.jpg";

  // Determine badge styling based on status
  let badgeProps = { text: booking.status.replace(/_/g, " ").toUpperCase(), color: "bg-gray-500" };
  if (booking.status === "pending") badgeProps = { text: "ACTION REQUIRED", color: "bg-amber-500" };
  else if (booking.status === "approved_pending_payment") badgeProps = { text: "AWAITING PAYMENT", color: "bg-blue-500" };
  else if (booking.status === "paid_confirmed") badgeProps = { text: "CONFIRMED", color: "bg-teal-500" };
  else if (booking.status === "rejected") badgeProps = { text: "REJECTED", color: "bg-red-500" };
  else if (booking.status === "cancelled") badgeProps = { text: "CANCELLED BY GUEST", color: "bg-gray-400" };

  return (
    <div className={`card overflow-hidden group border border-gray-100 transition-all duration-300 ${booking.status === 'pending' ? 'shadow-md ring-1 ring-amber-100' : 'hover:-translate-y-1 hover:shadow-xl'}`}>
      <div className="relative h-40 overflow-hidden">
        <img 
          src={home && home.photos && home.photos.length > 0 ? home.photos[0] : '/placeholder.jpg'} 
          alt={home?.houseName || "Deleted Property"} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <span className={`absolute top-4 right-4 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md backdrop-blur-sm ${badgeProps.color}`}>
          {badgeProps.text}
        </span>
      </div>
      
      <div className="p-5">
        <div className="mb-4">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
            Guest: {guest?.name || guest?.email || "Unknown User"}
          </p>
          <h2 className="text-xl font-bold text-gray-900 truncate">{home?.houseName || "Unknown Property"}</h2>
        </div>
        
        <div className="bg-gray-50 rounded-xl p-4 mb-4 border border-gray-100">
          <div className="flex justify-between items-center mb-2">
            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase">Check-in</p>
              <p className="font-semibold text-gray-900">{format(checkInDate, 'MMM dd, yyyy')}</p>
            </div>
            <div className="text-gray-300">➝</div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-gray-500 uppercase">Check-out</p>
              <p className="font-semibold text-gray-900">{format(checkOutDate, 'MMM dd, yyyy')}</p>
            </div>
          </div>
          <div className="pt-2 mt-2 border-t border-gray-200 flex justify-between items-center">
            <p className="text-xs font-medium text-gray-500">Total Earnings</p>
            <p className="font-bold text-teal-600">₹{booking.totalPrice}</p>
          </div>
        </div>
        
        {booking.status === "pending" && (
          <div className="flex gap-2">
            <button 
              onClick={() => onUpdate(booking._id, "rejected")}
              className="flex-1 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 font-medium rounded-xl text-sm transition-colors border border-red-100"
            >
              Reject
            </button>
            <button 
              onClick={() => onUpdate(booking._id, "approved_pending_payment")}
              className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-xl text-sm transition-colors shadow-sm"
            >
              Approve
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default HostBookingsPage;
