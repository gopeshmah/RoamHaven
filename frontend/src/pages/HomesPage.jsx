import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import API from "../api/axios";
import HomeCard from "../components/HomeCard";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const HomesPage = () => {
  const [homes, setHomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isLoggedIn, user } = useAuth();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [urlParams] = useSearchParams();

  // Read initial values from URL (set by navbar search)
  const [search, setSearch] = useState(urlParams.get("search") || "");
  const [location, setLocation] = useState(urlParams.get("location") || "");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minRating, setMinRating] = useState("");

  // Re-sync from URL when params change (navbar search)
  useEffect(() => {
    const s = urlParams.get("search") || "";
    const l = urlParams.get("location") || "";
    if (s !== search) setSearch(s);
    if (l !== location) setLocation(l);
  }, [urlParams]);

  const fetchHomes = useCallback(() => {
    setLoading(true);
    const params = {};
    if (search) params.search = search;
    if (location) params.location = location;
    if (minPrice) params.minPrice = minPrice;
    if (maxPrice) params.maxPrice = maxPrice;
    if (minRating) params.minRating = minRating;

    API.get("/homes", { params })
      .then((res) => setHomes(res.data.homes))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [search, location, minPrice, maxPrice, minRating]);

  useEffect(() => {
    const timer = setTimeout(fetchHomes, 400);
    return () => clearTimeout(timer);
  }, [fetchHomes]);

  const handleAddFavourite = async (homeId) => {
    try {
      await API.post(`/favourites/${homeId}`);
      alert("Added to favourites! ❤️");
    } catch (err) {
      alert(err.response?.data?.message || "Please login to add favourites");
    }
  };

  const clearFilters = () => {
    setSearch(""); setLocation(""); setMinPrice(""); setMaxPrice(""); setMinRating("");
  };

  const hasFilters = search || location || minPrice || maxPrice || minRating;

  return (
    <div className="min-h-screen px-4 py-10 bg-gray-50">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-8 animate-fade-in-up">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Explore Stays</h1>
          <p className="text-gray-500">Discover unique places to stay around the world</p>
        </div>

        {/* Filters Card */}
        <div className="card p-4 md:p-6 mb-8 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" /></svg>
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by property name..." className="w-full pl-12 pr-4 py-3 rounded-xl input-field" />
            </div>
            <div className="flex-1 relative">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><path fillRule="evenodd" d="m9.69 18.933.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.842 11.842 0 00.976.544l.062.029.018.008.006.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" clipRule="evenodd" /></svg>
              <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Filter by location..." className="w-full pl-12 pr-4 py-3 rounded-xl input-field" />
            </div>
            <button onClick={() => setFiltersOpen(!filtersOpen)} className={`px-5 py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all cursor-pointer ${filtersOpen ? "bg-teal-50 text-teal-700 border-2 border-teal-200" : "btn-outline"}`}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M2.628 1.601C5.028 1.206 7.49 1 10 1s4.973.206 7.372.601a.75.75 0 01.628.74v2.288a2.25 2.25 0 01-.659 1.59l-4.682 4.683a2.25 2.25 0 00-.659 1.59v3.037c0 .684-.31 1.33-.844 1.757l-1.937 1.55A.75.75 0 018 18.25v-5.757a2.25 2.25 0 00-.659-1.591L2.659 6.22A2.25 2.25 0 012 4.629V2.34a.75.75 0 01.628-.74z" /></svg>
              Filters
              {hasFilters && <span className="w-2 h-2 bg-teal-500 rounded-full"></span>}
            </button>
          </div>

          {filtersOpen && (
            <div className="mt-4 pt-4 border-t border-gray-100 animate-fade-in-up">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Min Price (₹)</label>
                  <input type="number" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} placeholder="e.g. 500" className="w-full px-4 py-2.5 rounded-xl input-field text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Max Price (₹)</label>
                  <input type="number" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} placeholder="e.g. 10000" className="w-full px-4 py-2.5 rounded-xl input-field text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Min Rating</label>
                  <select value={minRating} onChange={(e) => setMinRating(e.target.value)} className="w-full px-4 py-2.5 rounded-xl input-field text-sm cursor-pointer">
                    <option value="">Any Rating</option>
                    <option value="3">⭐ 3+ Stars</option>
                    <option value="3.5">⭐ 3.5+ Stars</option>
                    <option value="4">⭐ 4+ Stars</option>
                    <option value="4.5">⭐ 4.5+ Stars</option>
                  </select>
                </div>
              </div>
              {hasFilters && (
                <button onClick={clearFilters} className="mt-4 text-sm text-red-500 hover:text-red-600 font-medium flex items-center gap-1 cursor-pointer transition-colors">
                  ✕ Clear all filters
                </button>
              )}
            </div>
          )}
        </div>

        {!loading && (
          <div className="mb-6"><p className="text-sm text-gray-500">{homes.length} {homes.length === 1 ? "stay" : "stays"} found{hasFilters && <span className="text-teal-600 font-medium"> (filtered)</span>}</p></div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64"><div className="w-12 h-12 border-3 border-teal-100 border-t-teal-500 rounded-full animate-spin"></div></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
            {homes.map((home) => (
              <HomeCard key={home._id} home={home}>
                {user?.userType !== "host" && (
                  <Link to={`/homes/${home._id}`} className="btn-primary px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-1.5">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75z" clipRule="evenodd" /></svg>
                    Book Now
                  </Link>
                )}
                {isLoggedIn && user?.userType !== "host" && (
                  <button onClick={() => handleAddFavourite(home._id)} className="px-4 py-2 rounded-xl text-sm font-medium border-2 border-pink-200 text-pink-500 hover:bg-pink-50 transition-all cursor-pointer flex items-center gap-1.5">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="M9.653 16.915l-.005-.003-.019-.01a20.759 20.759 0 01-1.162-.682 22.045 22.045 0 01-2.765-2.085C4.006 12.553 2 10.085 2 7a4.5 4.5 0 018-2.828A4.5 4.5 0 0118 7c0 3.085-2.006 5.553-3.702 7.135a22.045 22.045 0 01-2.765 2.085 12.22 12.22 0 01-1.162.682l-.02.01-.005.003h-.002a.739.739 0 01-.69 0z" /></svg>
                    Favourite
                  </button>
                )}
              </HomeCard>
            ))}
            {homes.length === 0 && (
              <div className="col-span-full text-center py-20">
                <p className="text-5xl mb-4">🔍</p>
                <p className="text-gray-600 text-lg font-medium mb-2">No stays match your filters</p>
                <p className="text-gray-400 text-sm mb-4">Try adjusting your search or filters</p>
                {hasFilters && <button onClick={clearFilters} className="btn-primary px-6 py-2.5 rounded-xl text-sm font-medium cursor-pointer">Clear Filters</button>}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomesPage;
