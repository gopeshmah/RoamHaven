import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";
import HomeCard from "../components/HomeCard";
import toast from "react-hot-toast";

const FavouritesPage = () => {
  const [favourites, setFavourites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/favourites")
      .then((res) => setFavourites(res.data.favourites))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleRemove = async (homeId) => {
    try {
      await API.delete(`/favourites/${homeId}`);
      setFavourites(favourites.filter((fav) => fav._id !== homeId));
    } catch (err) {
      toast.error("Failed to remove");
    }
  };

  return (
    <div className="min-h-screen px-4 py-10 bg-gray-50">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-10 animate-fade-in-up">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <span className="text-pink-500">❤️</span> Your Favourites
          </h1>
          <p className="text-gray-500">Stays you've saved for later</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-12 h-12 border-3 border-teal-100 border-t-teal-500 rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
            {favourites.map((home) => (
              <HomeCard key={home._id} home={home}>
                <Link
                  to={`/homes/${home._id}`}
                  className="btn-primary px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-1.5"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75z" clipRule="evenodd" /></svg>
                  Book Now
                </Link>
                <button
                  onClick={() => handleRemove(home._id)}
                  className="px-4 py-2 rounded-xl text-sm font-medium border-2 border-red-200 text-red-500 hover:bg-red-50 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  Remove
                </button>
              </HomeCard>
            ))}
            {favourites.length === 0 && (
              <div className="col-span-full text-center py-20">
                <p className="text-6xl mb-4">💔</p>
                <p className="text-gray-500 text-lg">No favourites yet. Start exploring and save stays you love!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FavouritesPage;
