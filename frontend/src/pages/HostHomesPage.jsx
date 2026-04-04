import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";
import HomeCard from "../components/HomeCard";
import toast from "react-hot-toast";

const HostHomesPage = () => {
  const [homes, setHomes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/host/my-homes")
      .then((res) => setHomes(res.data.homes))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (homeId) => {
    if (!confirm("Are you sure you want to delete this listing?")) return;
    try {
      await API.delete(`/host/delete-home/${homeId}`);
      setHomes(homes.filter((h) => h._id !== homeId));
    } catch (err) {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="min-h-screen px-4 py-10 bg-gray-50">
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-10 gap-4 animate-fade-in-up">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">My Listings</h1>
            <p className="text-gray-500">Manage your properties on RoamHaven</p>
          </div>
          <Link to="/host/add-home" className="btn-primary px-6 py-3 rounded-xl font-medium flex items-center gap-2 w-fit">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" /></svg>
            Add New Listing
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-12 h-12 border-3 border-teal-100 border-t-teal-500 rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
            {homes.map((home) => (
              <HomeCard key={home._id} home={home}>
                <Link to={`/host/edit-home/${home._id}`} className="px-4 py-2 rounded-xl text-sm font-medium border-2 border-teal-200 text-teal-600 hover:bg-teal-50 transition-all flex items-center gap-1.5">
                  Edit
                </Link>
                <button onClick={() => handleDelete(home._id)} className="px-4 py-2 rounded-xl text-sm font-medium border-2 border-red-200 text-red-500 hover:bg-red-50 transition-all cursor-pointer flex items-center gap-1.5">
                  Delete
                </button>
              </HomeCard>
            ))}
            {homes.length === 0 && (
              <div className="col-span-full text-center py-20">
                <p className="text-6xl mb-4">🏡</p>
                <p className="text-gray-500 text-lg mb-4">You haven't added any listings yet.</p>
                <Link to="/host/add-home" className="btn-primary px-6 py-3 rounded-xl font-medium inline-flex items-center gap-2">Add Your First Listing</Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HostHomesPage;
