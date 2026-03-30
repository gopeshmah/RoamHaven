import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";

const AdminHomesPage = () => {
  const [homes, setHomes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomes = async () => {
      try {
        const response = await API.get("/admin/homes");
        if (response.data.success) {
          setHomes(response.data.homes);
        }
      } catch (error) {
        console.error("Failed to fetch homes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHomes();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Link to="/admin/dashboard" className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-all">
          ←
        </Link>
        <h1 className="text-3xl font-bold text-gray-800">Manage Listings</h1>
      </div>

      {loading ? (
        <div className="text-center py-10 animate-pulse text-gray-500">Loading listings...</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="py-4 px-6 font-semibold text-gray-600 text-sm">Listing ID</th>
                  <th className="py-4 px-6 font-semibold text-gray-600 text-sm">Title</th>
                  <th className="py-4 px-6 font-semibold text-gray-600 text-sm">Host</th>
                  <th className="py-4 px-6 font-semibold text-gray-600 text-sm">Price/Night</th>
                  <th className="py-4 px-6 font-semibold text-gray-600 text-sm font-center text-center">View</th>
                </tr>
              </thead>
              <tbody>
                {homes.map((home) => (
                  <tr key={home._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-6 text-sm text-gray-500 font-mono">{home._id}</td>
                    <td className="py-4 px-6 text-sm text-gray-800 font-medium max-w-[200px] truncate">{home.houseName}</td>
                    <td className="py-4 px-6 text-sm text-gray-600">{home.host?.email || 'Unknown'}</td>
                    <td className="py-4 px-6 text-sm font-semibold text-teal-600">₹{home.price}</td>
                    <td className="py-4 px-6 text-sm text-center">
                      <Link to={`/homes/${home._id}`} target="_blank" className="text-blue-500 hover:underline">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
                {homes.length === 0 && (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-gray-500">No listings found.</td>
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

export default AdminHomesPage;
