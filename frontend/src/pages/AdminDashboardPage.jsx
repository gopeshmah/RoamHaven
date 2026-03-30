import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";

const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await API.get("/admin/stats");
        if (response.data.success) {
          setStats(response.data.stats);
        }
      } catch (error) {
        console.error("Failed to fetch admin stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <div className="p-8 text-center animate-pulse">Loading dashboard...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Users" value={stats?.totalUsers || 0} icon="👥" color="bg-blue-500" />
        <StatCard title="Total Listings" value={stats?.totalHomes || 0} icon="🏠" color="bg-teal-500" />
        <StatCard title="Total Bookings" value={stats?.totalBookings || 0} icon="📅" color="bg-purple-500" />
        <StatCard title="Total Revenue" value={`₹ ${stats?.totalRevenue?.toLocaleString() || 0}`} icon="💰" color="bg-green-500" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/admin/users" className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all flex items-center justify-between group">
          <div className="text-lg font-semibold text-gray-700">Manage Users</div>
          <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">→</div>
        </Link>
        <Link to="/admin/homes" className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all flex items-center justify-between group">
          <div className="text-lg font-semibold text-gray-700">Manage Listings</div>
          <div className="w-10 h-10 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center group-hover:bg-teal-600 group-hover:text-white transition-all">→</div>
        </Link>
        <Link to="/admin/bookings" className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all flex items-center justify-between group">
          <div className="text-lg font-semibold text-gray-700">Manage Bookings</div>
          <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-all">→</div>
        </Link>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color }) => (
  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
    <div className={`w-14 h-14 rounded-xl ${color} text-white flex items-center justify-center text-2xl shadow-inner`}>
      {icon}
    </div>
    <div>
      <div className="text-sm font-medium text-gray-500">{title}</div>
      <div className="text-2xl font-bold text-gray-800">{value}</div>
    </div>
  </div>
);

export default AdminDashboardPage;
