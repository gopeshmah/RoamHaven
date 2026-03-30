import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";

const AdminBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await API.get("/admin/bookings");
        if (response.data.success) {
          setBookings(response.data.bookings);
        }
      } catch (error) {
        console.error("Failed to fetch bookings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Link to="/admin/dashboard" className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-all">
          ←
        </Link>
        <h1 className="text-3xl font-bold text-gray-800">Manage Bookings</h1>
      </div>

      {loading ? (
        <div className="text-center py-10 animate-pulse text-gray-500">Loading bookings...</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="py-4 px-6 font-semibold text-gray-600 text-sm">ID</th>
                  <th className="py-4 px-6 font-semibold text-gray-600 text-sm">Home</th>
                  <th className="py-4 px-6 font-semibold text-gray-600 text-sm">Guest Email</th>
                  <th className="py-4 px-6 font-semibold text-gray-600 text-sm">Dates</th>
                  <th className="py-4 px-6 font-semibold text-gray-600 text-sm">Amount</th>
                  <th className="py-4 px-6 font-semibold text-gray-600 text-sm">Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-6 text-xs text-gray-500 font-mono" title={booking._id}>
                      {booking._id.substring(0, 8)}...
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-800 font-medium">
                      {booking.homeId?.houseName || 'Home Deleted'}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600">{booking.guestId?.email || 'Unknown'}</td>
                    <td className="py-4 px-6 text-sm text-gray-500 whitespace-nowrap">
                      {new Date(booking.checkIn).toLocaleDateString()} - <br/>
                      {new Date(booking.checkOut).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6 text-sm font-semibold text-gray-700">₹{booking.totalPrice}</td>
                    <td className="py-4 px-6 text-sm">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {booking.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {bookings.length === 0 && (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-gray-500">No bookings found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBookingsPage;
