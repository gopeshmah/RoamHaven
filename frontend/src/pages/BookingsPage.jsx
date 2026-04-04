import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";
import { format } from "date-fns";
import toast from "react-hot-toast";
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const BookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payBookingId, setPayBookingId] = useState(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState("active");

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await API.get("/bookings/my-bookings");
      setBookings(res.data.bookings);
    } catch (err) {
      console.error("Error fetching bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    try {
      await API.delete(`/bookings/${bookingId}`);
      toast.success("Booking cancelled successfully.");
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to cancel booking");
    }
  };

  const handlePayment = async (booking) => {
    try {
      setPaymentProcessing(true);
      const res = await loadRazorpayScript();
      if (!res) {
        toast.error("Razorpay SDK failed to load. Are you online?");
        setPaymentProcessing(false);
        return;
      }

      // Create Order
      const result = await API.post(`/bookings/${booking._id}/create-razorpay-order`);
      if (!result) {
        toast.error("Server error. Please check if you are online.");
        setPaymentProcessing(false);
        return;
      }

      const { amount, orderId, currency } = result.data;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: amount,
        currency: currency,
        name: "RoamHaven",
        description: `Booking for ${booking.homeId.houseName}`,
        order_id: orderId,
        handler: async function (response) {
          try {
            await API.post(`/bookings/${booking._id}/confirm-razorpay-payment`, {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            });
            window.location.href = `/payment-success?booking_id=${booking._id}&type=razorpay`;
          } catch (err) {
            toast.error(err.response?.data?.message || "Payment verification failed.");
          }
        },
        prefill: {
          name: "Guest User",
          email: "guest@example.com",
          contact: "9999999999"
        },
        theme: {
          color: "#0d9488",
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.on("payment.failed", function (response) {
        toast.error("Payment Failed. " + response.error.description);
      });
      paymentObject.open();

    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Payment sequence failed. Please try again.");
    } finally {
      setPaymentProcessing(false);
    }
  };

  // Split bookings into active vs past/cancelled
  const activeBookings = bookings.filter(
    (b) => !["cancelled", "rejected"].includes(b.status)
  );
  const pastBookings = bookings.filter((b) =>
    ["cancelled", "rejected"].includes(b.status)
  );
  const displayedBookings = activeTab === "active" ? activeBookings : pastBookings;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="w-12 h-12 border-3 border-teal-100 border-t-teal-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-10 bg-gray-50">
      <div className="container mx-auto max-w-6xl animate-fade-in-up">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
              My Trips
            </h1>
            <p className="text-gray-500 text-lg">
              Manage your reservations and travel plans.
            </p>
          </div>
          <Link
            to="/homes"
            className="btn-primary px-6 py-2.5 rounded-xl font-medium text-sm"
          >
            Explore More Stays
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 bg-gray-100 p-1 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab("active")}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
              activeTab === "active"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Active ({activeBookings.length})
          </button>
          <button
            onClick={() => setActiveTab("past")}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
              activeTab === "past"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Cancelled ({pastBookings.length})
          </button>
        </div>

        {/* Content */}
        {displayedBookings.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
            <div className="text-7xl mb-6 animate-float">
              {activeTab === "active" ? "🏖️" : "📋"}
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {activeTab === "active"
                ? "No trips booked... yet!"
                : "No cancelled bookings"}
            </h2>
            <p className="text-gray-500 text-lg mb-8 max-w-md mx-auto">
              {activeTab === "active"
                ? "Time to dust off your bags and start planning your next great adventure."
                : "You haven't cancelled any bookings. Great travel track record!"}
            </p>
            {activeTab === "active" && (
              <Link
                to="/homes"
                className="btn-primary px-8 py-3.5 rounded-xl font-bold text-lg inline-block"
              >
                Start Searching
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedBookings.map((booking) => {
              const home = booking.homeId;
              if (!home) return null;

              const checkInDate = new Date(booking.checkIn);
              const checkOutDate = new Date(booking.checkOut);

              // Status config
              const statusConfig = {
                pending: {
                  label: "Pending Approval",
                  color: "bg-amber-100 text-amber-700",
                  dot: "bg-amber-500",
                },
                approved_pending_payment: {
                  label: "Approved – Pay Now",
                  color: "bg-blue-100 text-blue-700",
                  dot: "bg-blue-500",
                },
                paid_confirmed: {
                  label: "Confirmed",
                  color: "bg-emerald-100 text-emerald-700",
                  dot: "bg-emerald-500",
                },
                rejected: {
                  label: "Rejected",
                  color: "bg-red-100 text-red-600",
                  dot: "bg-red-500",
                },
                cancelled: {
                  label: "Cancelled",
                  color: "bg-gray-100 text-gray-500",
                  dot: "bg-gray-400",
                },
              };

              const status = statusConfig[booking.status] || statusConfig.pending;
              const isInactive =
                booking.status === "cancelled" || booking.status === "rejected";

              return (
                <div
                  key={booking._id}
                  className={`bg-white rounded-2xl overflow-hidden border flex flex-col h-full transition-all duration-300 ${
                    isInactive
                      ? "border-gray-200 opacity-65"
                      : "border-gray-100 hover:shadow-lg hover:-translate-y-1"
                  }`}
                >
                  {/* Image */}
                  <div className="relative h-44 overflow-hidden flex-shrink-0">
                    <img
                      src={home.photos && home.photos.length > 0 ? home.photos[0] : "/placeholder.jpg"}
                      alt={home.houseName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3">
                      <p className="text-white/80 text-xs font-medium">
                        {home.location}
                      </p>
                      <h3 className="text-white text-lg font-bold truncate">
                        {home.houseName}
                      </h3>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-4 flex flex-col flex-1">
                    {/* Status Pill */}
                    <div
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-4 ${status.color}`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${status.dot} ${
                          booking.status === "pending" ? "animate-pulse" : ""
                        }`}
                      ></span>
                      {status.label}
                    </div>

                    {/* Date Row */}
                    <div className="flex items-center justify-between bg-gray-50 rounded-xl p-3 mb-4">
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase">
                          Check-in
                        </p>
                        <p className="text-sm font-semibold text-gray-800">
                          {format(checkInDate, "MMM dd")}
                        </p>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-px bg-gray-300"></div>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-gray-400 uppercase">
                          Check-out
                        </p>
                        <p className="text-sm font-semibold text-gray-800">
                          {format(checkOutDate, "MMM dd")}
                        </p>
                      </div>
                      <div className="border-l border-gray-200 pl-3 ml-3">
                        <p className="text-[10px] font-bold text-gray-400 uppercase">
                          Total
                        </p>
                        <p className="text-sm font-bold text-teal-600">
                          ₹{booking.totalPrice}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 mt-auto pt-2">
                      <Link
                        to={`/homes/${home._id}`}
                        className="flex-1 text-center py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl text-sm transition-colors"
                      >
                        View Details
                      </Link>

                      {booking.status === "approved_pending_payment" && (
                        <button
                          onClick={() => handlePayment(booking)}
                          disabled={paymentProcessing}
                          className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition-colors shadow-sm disabled:opacity-70"
                        >
                          {paymentProcessing ? "Processing..." : "💳 Pay Now"}
                        </button>
                      )}

                      {!isInactive && booking.status !== "paid_confirmed" && (
                        <button
                          onClick={() => handleCancelBooking(booking._id)}
                          className="py-2.5 px-3 text-red-500 hover:bg-red-50 font-medium rounded-xl text-sm transition-colors"
                          title="Cancel booking"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};

export default BookingsPage;
