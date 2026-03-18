import { useEffect, useState } from "react";
import API from "../api/axios";
import HomeCard from "../components/HomeCard";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const HomePage = () => {
  const [homes, setHomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isLoggedIn, user } = useAuth();

  useEffect(() => {
    API.get("/homes")
      .then((res) => setHomes(res.data.homes))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-bg relative overflow-hidden py-20 md:py-28 px-4">
        <div className="absolute top-10 right-10 w-72 h-72 bg-teal-200/30 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-0 left-10 w-64 h-64 bg-emerald-200/30 rounded-full blur-3xl animate-float" style={{ animationDelay: "3s" }} />

        <div className="container mx-auto relative z-10 text-center">
          <div className="animate-fade-in-up">
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase bg-teal-100 text-teal-700 border border-teal-200 mb-6">
              ✨ Discover unique stays worldwide
            </span>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-gray-900 mb-6 leading-tight">
              Find Your Perfect
              <br />
              <span className="gradient-text">Haven to Roam</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
              Explore handpicked homes and unique stays for every kind of traveler.
              From cozy cabins to luxury villas, your next adventure awaits.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/homes"
                className="btn-primary px-8 py-4 rounded-2xl font-semibold text-lg flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" /></svg>
                Explore Stays
              </Link>
              {!isLoggedIn && (
                <Link
                  to="/signup"
                  className="btn-outline px-8 py-4 rounded-2xl font-semibold text-lg flex items-center justify-center gap-2"
                >
                  Join RoamHaven
                </Link>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 max-w-lg mx-auto gap-6 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-teal-100">
              <p className="text-2xl md:text-3xl font-bold text-teal-700">{homes.length}+</p>
              <p className="text-xs text-gray-500 mt-1">Listed Stays</p>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-teal-100">
              <p className="text-2xl md:text-3xl font-bold text-teal-700">50+</p>
              <p className="text-xs text-gray-500 mt-1">Locations</p>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-teal-100">
              <p className="text-2xl md:text-3xl font-bold text-teal-700">4.8</p>
              <p className="text-xs text-gray-500 mt-1">Avg Rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Stays */}
      <section className="px-4 py-16">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Featured Stays</h2>
              <p className="text-gray-500 mt-1">Handpicked homes for your next getaway</p>
            </div>
            <Link to="/homes" className="hidden md:flex items-center gap-2 text-teal-600 hover:text-teal-700 transition-colors text-sm font-semibold">
              View All
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" /></svg>
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="w-12 h-12 border-3 border-teal-100 border-t-teal-500 rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
              {homes.slice(0, 6).map((home) => (
                <HomeCard key={home._id} home={home}>
                  {user?.userType !== "host" && (
                    <Link to={`/homes/${home._id}`} className="btn-primary px-4 py-2 rounded-xl text-sm font-medium">
                      View Details
                    </Link>
                  )}
                </HomeCard>
              ))}
              {homes.length === 0 && (
                <div className="col-span-full text-center py-16">
                  <p className="text-gray-400 text-lg">No stays listed yet. Be the first host!</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
