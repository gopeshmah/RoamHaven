import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { differenceInDays } from "date-fns";

const HomeDetailPage = () => {
  const { homeId } = useParams();
  const navigate = useNavigate();
  const [home, setHome] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  
  // Review state
  const [reviews, setReviews] = useState([]);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  
  const { isLoggedIn, user } = useAuth();

  // Calculate total price based on dates
  const nights = checkIn && checkOut ? differenceInDays(checkOut, checkIn) : 0;
  const totalPrice = nights > 0 && home ? nights * home.price : 0;

  useEffect(() => {
    API.get(`/homes/${homeId}`)
      .then((res) => setHome(res.data.home))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));

    API.get(`/reviews/${homeId}`)
      .then((res) => setReviews(res.data))
      .catch((err) => console.error("Failed to load reviews:", err));
  }, [homeId]);

  const handleAddFavourite = async () => {
    try {
      if (!isLoggedIn) {
        alert("Please login to save favourites");
        return navigate("/login");
      }
      await API.post(`/favourites/${homeId}`);
      alert("Added to favourites! ❤️");
    } catch (err) {
      alert("Failed to add to favourites");
    }
  };

  const handleReserve = async () => {
    if (!isLoggedIn) {
      alert("Please login to book a stay.");
      navigate("/login");
      return;
    }
    if (!checkIn || !checkOut) {
      alert("Please select both check-in and check-out dates.");
      return;
    }
    if (nights <= 0) {
      alert("Check-out must be after Check-in.");
      return;
    }

    try {
      setBookingLoading(true);
      await API.post("/bookings/create", {
        homeId: home._id,
        checkIn,
        checkOut,
        totalPrice
      });
      alert("Request sent to host successfully! 🎉");
      navigate("/bookings"); // Redirect to their bookings page
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to create booking");
    } finally {
      setBookingLoading(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isLoggedIn) {
      alert("Please login to leave a review.");
      navigate("/login");
      return;
    }
    
    setSubmittingReview(true);
    try {
      const res = await API.post("/reviews", {
        homeId,
        rating: reviewRating,
        comment: reviewComment
      });
      alert("Review submitted successfully!");
      
      // Fetch fresh reviews to get the populated user data
      const refreshRes = await API.get(`/reviews/${homeId}`);
      setReviews(refreshRes.data);
      
      setReviewComment("");
      setReviewRating(5);
      setShowReviewForm(false);
      
      // Update local home rating
      if(home) {
         const newAvg = ((home.rating * reviews.length) + reviewRating) / (reviews.length + 1);
         setHome({...home, rating: newAvg.toFixed(1) });
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="w-12 h-12 border-3 border-teal-100 border-t-teal-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!home) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Stay not found</h2>
        <Link to="/homes" className="btn-primary px-6 py-3 rounded-xl font-medium">Browse Stays</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-10 bg-gray-50">
      <div className="container mx-auto max-w-5xl animate-fade-in-up">
        <Link to="/homes" className="inline-flex items-center gap-2 text-gray-500 hover:text-teal-600 transition-colors mb-6 text-sm font-medium">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" /></svg>
          Back to Stays
        </Link>

        {/* Image Gallery */}
        <div className="mb-8 rounded-2xl overflow-hidden shadow-sm">
          {home.photos && home.photos.length > 1 ? (
            <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 h-[400px] md:h-[500px] gap-2">
              {/* Main big image */}
              <div className="md:col-span-2 md:row-span-2 relative h-full group overflow-hidden">
                <img src={home.photos[0]} alt={`${home.houseName} 1`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 cursor-pointer" />
              </div>
              {/* 4 small images */}
              {home.photos.slice(1, 5).map((photo, index) => (
                <div key={index} className="hidden md:block relative h-full group overflow-hidden">
                  <img src={photo} alt={`${home.houseName} ${index + 2}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 cursor-pointer" />
                </div>
              ))}
              {/* If fewer than 5 photos, fill remaining areas with a gradient placeholder so grid doesn't break */}
              {Array.from({ length: 4 - (home.photos.length - 1) }).map((_, i) => (
                 <div key={`filler-${i}`} className="hidden md:block relative h-full bg-teal-50"></div>
              ))}
            </div>
          ) : (
            <div className="relative h-64 md:h-[400px] w-full">
              <img src={home.photos && home.photos.length > 0 ? home.photos[0] : "/placeholder.jpg"} alt={home.houseName} className="w-full h-full object-cover" />
            </div>
          )}
        </div>

        {/* Title & Info Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-2">{home.houseName}</h1>
            <div className="flex flex-wrap items-center gap-4 text-gray-600 font-medium">
              <span className="flex items-center gap-1.5 text-teal-600">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="m9.69 18.933.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.842 11.842 0 00.976.544l.062.029.018.008.006.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" clipRule="evenodd" /></svg>
                {home.location}
              </span>
              <span className="flex items-center gap-1.5 text-amber-500">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" clipRule="evenodd" /></svg>
                {home.rating} / 5
              </span>
            </div>
          </div>
          
          <div className="flex gap-2">
            {isLoggedIn && (
              <button onClick={handleAddFavourite} className="p-3 rounded-full hover:bg-pink-50 text-pink-500 transition-colors border border-pink-100 flex items-center gap-2 font-medium px-4">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M9.653 16.915l-.005-.003-.019-.01a20.759 20.759 0 01-1.162-.682 22.045 22.045 0 01-2.765-2.085C4.006 12.553 2 10.085 2 7a4.5 4.5 0 018-2.828A4.5 4.5 0 0118 7c0 3.085-2.006 5.553-3.702 7.135a22.045 22.045 0 01-2.765 2.085 12.22 12.22 0 01-1.162.682l-.02.01-.005.003h-.002a.739.739 0 01-.69 0z" /></svg>
                Save
              </button>
            )}
          </div>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main Content */}
          <div className="lg:col-span-2">
            
            {/* Host Profile */}
            {home.host && (
              <div className="mb-8 flex items-center justify-between pb-8 border-b border-gray-200">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center font-bold text-xl border border-gray-200 shadow-sm">
                    {home.host.firstName?.charAt(0) || "H"}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">Hosted by {home.host.firstName} {home.host.lastName}</h3>
                    <p className="text-sm text-gray-500">Superhost · Joined in 2024</p>
                  </div>
                </div>
                {user && user._id !== home.host._id && (
                  <button 
                    onClick={() => navigate("/inbox", { 
                      state: { newChat: { home: home, otherUser: home.host } } 
                    })}
                    className="py-2.5 px-5 bg-white text-teal-700 font-semibold rounded-xl border border-teal-200 hover:bg-teal-50 transition-colors flex items-center gap-2 shadow-sm"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M10 2c-5.523 0-10 4.029-10 9a8.68 8.68 0 004.28 7.37.75.75 0 01.352.68 5.766 5.766 0 01-.634 2.87.75.75 0 00.999 1.002 8.356 8.356 0 003.535-2.605 9.873 9.873 0 001.468.083c5.523 0 10-4.029 10-9s-4.477-9-10-9zm0 5.5a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm-4.5 1.5a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zm9 0a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z" clipRule="evenodd" /></svg>
                    Contact Host
                  </button>
                )}
              </div>
            )}

            <div className="mb-8">
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">About this stay</h3>
              <p className="text-gray-600 leading-relaxed text-lg">{home.description || "A beautiful and cozy stay waiting for you to explore. Perfect for travelers looking for comfort and adventure."}</p>
            </div>

            {/* Location Map */}
            {home.coordinates?.lat && home.coordinates?.lng && (
              <div className="mb-8 pt-8 border-t border-gray-200">
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">Where you'll be</h3>
                <p className="text-gray-600 mb-4">{home.location}</p>
                <div className="h-80 w-full rounded-2xl overflow-hidden shadow-inner border border-gray-200 z-0">
                  <MapContainer 
                    center={[home.coordinates.lat, home.coordinates.lng]} 
                    zoom={14} 
                    scrollWheelZoom={false} 
                    className="h-full w-full"
                  >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap contributors' />
                    <Marker position={[home.coordinates.lat, home.coordinates.lng]} />
                  </MapContainer>
                </div>
              </div>
            )}
            
            {/* Reviews Section */}
            <div className="mb-8 pt-8 border-t border-gray-200">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6 text-amber-500"><path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" clipRule="evenodd" /></svg>
                  {home.rating ? Number(home.rating).toFixed(1) : "New"} · {reviews.length} {reviews.length === 1 ? 'Review' : 'Reviews'}
                </h3>
                {isLoggedIn && !showReviewForm && (
                  <button onClick={() => setShowReviewForm(true)} className="text-teal-600 font-medium hover:underline">
                    Write a Review
                  </button>
                )}
              </div>

              {/* Review Form */}
              {showReviewForm && (
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 mb-8 animate-fade-in-up">
                  <div className="flex justify-between items-center mb-4">
                     <h4 className="font-semibold text-gray-900">Your Review</h4>
                     <button onClick={() => setShowReviewForm(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                  </div>
                  <form onSubmit={handleReviewSubmit}>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                      <select 
                        value={reviewRating} 
                        onChange={(e) => setReviewRating(Number(e.target.value))}
                        className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                      >
                        <option value="5">5 - Excellent</option>
                        <option value="4">4 - Good</option>
                        <option value="3">3 - Okay</option>
                        <option value="2">2 - Poor</option>
                        <option value="1">1 - Terrible</option>
                      </select>
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Comment</label>
                      <textarea 
                        required
                        rows="3"
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        placeholder="Share your experience staying here..."
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-teal-500 focus:border-teal-500 outline-none resize-none"
                      />
                    </div>
                    <div className="flex justify-end">
                      <button 
                        type="submit" 
                        disabled={submittingReview}
                        className="btn-primary px-6 py-2 rounded-xl font-medium disabled:opacity-50 flex items-center justify-center"
                      >
                        {submittingReview ? "Submitting..." : "Submit Review"}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Reviews List */}
              <div className="space-y-6">
                {reviews.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {reviews.map((review) => (
                      <div key={review._id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center font-bold text-lg">
                            {review.guestId?.firstName?.charAt(0) || "U"}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{review.guestId?.firstName} {review.guestId?.lastName}</p>
                            <p className="text-xs text-gray-500">{new Date(review.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
                          </div>
                        </div>
                        <div className="flex items-center mb-2 text-amber-500 text-sm">
                          {Array.from({ length: review.rating }).map((_, i) => (
                             <svg key={i} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" clipRule="evenodd" /></svg>
                          ))}
                        </div>
                        <p className="text-gray-600 text-sm leading-relaxed">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No reviews yet. Be the first to review if you've stayed here!</p>
                )}
              </div>
            </div>
            
          </div>

          {/* Sticky Booking/Price Card */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-24 border border-gray-100 shadow-xl">
              <div className="flex items-end gap-1 mb-4">
                <span className="text-3xl font-bold text-gray-900">₹{home.price}</span>
                <span className="text-gray-500 text-sm font-medium pb-1">/ night</span>
              </div>
              
              <div className="border border-gray-200 rounded-xl mb-4 relative z-50">
                <div className="grid grid-cols-2 border-b border-gray-200">
                  <div className="p-3 border-r border-gray-200">
                    <p className="text-[10px] font-bold uppercase text-gray-900 mb-1">Check-in</p>
                    <DatePicker
                      selected={checkIn}
                      onChange={(date) => setCheckIn(date)}
                      selectsStart
                      startDate={checkIn}
                      endDate={checkOut}
                      minDate={new Date()}
                      placeholderText="Add date"
                      className="w-full text-sm text-gray-700 outline-none bg-transparent cursor-pointer"
                    />
                  </div>
                  <div className="p-3">
                    <p className="text-[10px] font-bold uppercase text-gray-900 mb-1">Check-out</p>
                    <DatePicker
                      selected={checkOut}
                      onChange={(date) => setCheckOut(date)}
                      selectsEnd
                      startDate={checkIn}
                      endDate={checkOut}
                      minDate={checkIn || new Date()}
                      placeholderText="Add date"
                      className="w-full text-sm text-gray-700 outline-none bg-transparent cursor-pointer"
                    />
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-[10px] font-bold uppercase text-gray-900">Guests</p>
                  <p className="text-sm text-gray-500">1 guest</p>
                </div>
              </div>

              <button 
                onClick={handleReserve} 
                disabled={bookingLoading}
                className="w-full btn-primary py-4 rounded-xl font-bold text-lg disabled:opacity-50 flex justify-center items-center"
              >
                {bookingLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : "Request to Book"}
              </button>
              
              <p className="text-center text-gray-500 text-sm mt-4">You won't be charged yet</p>

              {nights > 0 && (
                <div className="mt-6 border-t border-gray-200 pt-4 space-y-3">
                  <div className="flex justify-between text-gray-600">
                    <span>₹{home.price} x {nights} nights</span>
                    <span>₹{totalPrice}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg text-gray-900 pt-3 border-t border-gray-100">
                    <span>Total</span>
                    <span>₹{totalPrice}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeDetailPage;
