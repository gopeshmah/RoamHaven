import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";

const HostDashboardPage = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/host/dashboard")
      .then((res) => setData(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="w-12 h-12 border-3 border-teal-100 border-t-teal-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  const { stats, homes, locations } = data || { stats: {}, homes: [], locations: [] };

  return (
    <div className="min-h-screen px-4 py-10 bg-gray-50">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-10 animate-fade-in-up">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">
            Welcome back, <span className="gradient-text">{user?.firstName}</span> 👋
          </h1>
          <p className="text-gray-500">Here's an overview of your RoamHaven properties</p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-10 stagger-children">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-teal-600"><path fillRule="evenodd" d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 10.414V17a1 1 0 01-1 1h-2a1 1 0 01-1-1v-3a1 1 0 00-1-1H8a1 1 0 00-1 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1v-6.586a1 1 0 01.293-.707l7-7z" clipRule="evenodd" /></svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.totalListings}</p>
            <p className="text-sm text-gray-500 mt-1">Total Listings</p>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-green-600"><path d="M10.75 10.818v2.614A3.13 3.13 0 0011.888 13c.482-.315.612-.648.612-.875 0-.227-.13-.56-.612-.875a3.13 3.13 0 00-1.138-.432zM8.33 8.62c.053.055.115.11.184.164.208.16.46.284.736.363V6.603c-.086.04-.17.089-.246.145-.252.186-.371.399-.371.596 0 .197.12.41.371.596a2.21 2.21 0 00.326.28z" /><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-6a.75.75 0 01.75.75v.316a3.78 3.78 0 011.653.713c.426.33.744.74.925 1.2a.75.75 0 01-1.395.55 1.35 1.35 0 00-.447-.563 2.187 2.187 0 00-.736-.363V9.3c.514.1 1.01.27 1.459.519.56.31.97.706 1.2 1.173.23.468.259.99.046 1.49-.212.5-.606.892-1.13 1.153A4.12 4.12 0 0110.75 14.1v.316a.75.75 0 01-1.5 0v-.316a4.18 4.18 0 01-1.837-.82c-.503-.39-.843-.896-.994-1.458a.75.75 0 011.447-.394c.08.29.263.543.532.726.203.138.435.242.692.314V9.949a4.184 4.184 0 01-1.275-.441c-.532-.294-.913-.676-1.128-1.127a2.1 2.1 0 01-.04-1.505c.208-.504.593-.888 1.1-1.146A3.84 3.84 0 019.25 5.066V4.75A.75.75 0 0110 4z" clipRule="evenodd" /></svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">₹{stats.avgPrice}</p>
            <p className="text-sm text-gray-500 mt-1">Avg Price / Night</p>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-amber-500"><path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" clipRule="evenodd" /></svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.avgRating}</p>
            <p className="text-sm text-gray-500 mt-1">Avg Rating</p>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-emerald-600"><path fillRule="evenodd" d="M1 4a1 1 0 011-1h16a1 1 0 011 1v8a1 1 0 01-1 1H2a1 1 0 01-1-1V4zm12 4a3 3 0 11-6 0 3 3 0 016 0zM4 9a1 1 0 100-2 1 1 0 000 2zm13-1a1 1 0 11-2 0 1 1 0 012 0zM1.75 14.5a.75.75 0 000 1.5c4.417 0 8.693.603 12.75 1.73 1.111.309 2.251-.522 2.251-1.69V14.5H1.75z" clipRule="evenodd" /></svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">₹{stats.totalRevenue || 0}</p>
            <p className="text-sm text-gray-500 mt-1">Total Revenue</p>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-purple-600"><path fillRule="evenodd" d="M6 3.75A2.75 2.75 0 018.75 1h2.5A2.75 2.75 0 0114 3.75v.443c.572.055 1.14.122 1.706.2C17.053 4.582 18 5.75 18 7.07v3.469c0 1.126-.694 2.191-1.83 2.54-1.952.599-4.024.921-6.17.921s-4.219-.322-6.17-.921C2.694 12.73 2 11.665 2 10.539V7.07c0-1.321.947-2.489 2.294-2.676A41.047 41.047 0 016 4.193V3.75zm6.5 0v.325a41.622 41.622 0 00-5 0V3.75c0-.69.56-1.25 1.25-1.25h2.5c.69 0 1.25.56 1.25 1.25zM10 10a1 1 0 00-1 1v.01a1 1 0 001 1h.01a1 1 0 001-1V11a1 1 0 00-1-1H10z" clipRule="evenodd" /><path d="M3 15.055v-.684c.126.053.255.1.39.142 2.092.642 4.313.987 6.61.987 2.297 0 4.518-.345 6.61-.987.135-.041.264-.089.39-.142v.684c0 1.347-.985 2.53-2.363 2.686A41.454 41.454 0 0110 18c-1.572 0-3.118-.12-4.637-.359C3.985 17.585 3 16.402 3 15.055z" /></svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.totalBookings || 0}</p>
            <p className="text-sm text-gray-500 mt-1">Confirmed Bookings</p>
          </div>
        </div>

        {/* Locations Breakdown + Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          {/* Locations */}
          <div className="card p-6 lg:col-span-2">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Listings by Location</h2>
            {locations.length > 0 ? (
              <div className="space-y-3">
                {locations.map((loc) => (
                  <div key={loc.name} className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-gray-700">{loc.name}</span>
                        <span className="text-sm text-gray-500">{loc.count} {loc.count === 1 ? "listing" : "listings"}</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-teal-400 to-teal-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${(loc.count / stats.totalListings) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-sm">No listings yet</p>
            )}
          </div>

          {/* Quick Actions */}
          <div className="card p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link to="/host/add-home" className="flex items-center gap-3 p-3 rounded-xl hover:bg-teal-50 transition-all group">
                <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center group-hover:bg-teal-200 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-teal-600"><path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" /></svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">Add New Listing</p>
                  <p className="text-xs text-gray-400">List a new property</p>
                </div>
              </Link>
              <Link to="/host/homes" className="flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 transition-all group">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-blue-600"><path d="M2.695 14.763l-1.262 3.154a.5.5 0 00.65.65l3.155-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z" /></svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">Manage Listings</p>
                  <p className="text-xs text-gray-400">Edit or remove properties</p>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Listings */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Your Listings</h2>
            <Link to="/host/homes" className="text-sm font-semibold text-teal-600 hover:text-teal-700 transition-colors">View All →</Link>
          </div>
          {homes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
              {homes.slice(0, 6).map((home) => (
                <div key={home._id} className="card overflow-hidden flex flex-row h-28">
                  <img src={home.photos && home.photos.length > 0 ? home.photos[0] : "/placeholder.jpg"} alt={home.houseName} className="w-28 h-full object-cover" />
                  <div className="p-3 flex-1 flex flex-col justify-center min-w-0">
                    <h3 className="text-sm font-semibold text-gray-800 truncate">{home.houseName}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">{home.location}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs font-bold text-teal-600">₹{home.price}/night</span>
                      <span className="text-xs text-amber-500">⭐ {home.rating}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card p-10 text-center">
              <p className="text-5xl mb-4">🏡</p>
              <p className="text-gray-500 mb-4">You haven't listed any properties yet</p>
              <Link to="/host/add-home" className="btn-primary px-6 py-2.5 rounded-xl text-sm font-medium inline-flex items-center gap-2">Add Your First Listing</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HostDashboardPage;
