import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await API.get("/admin/users");
        if (response.data.success) {
          setUsers(response.data.users);
        }
      } catch (error) {
        console.error("Failed to fetch users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Link to="/admin/dashboard" className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-all">
          ←
        </Link>
        <h1 className="text-3xl font-bold text-gray-800">Manage Users</h1>
      </div>

      {loading ? (
        <div className="text-center py-10 animate-pulse text-gray-500">Loading users...</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="py-4 px-6 font-semibold text-gray-600 text-sm">User ID</th>
                  <th className="py-4 px-6 font-semibold text-gray-600 text-sm">Name</th>
                  <th className="py-4 px-6 font-semibold text-gray-600 text-sm">Email</th>
                  <th className="py-4 px-6 font-semibold text-gray-600 text-sm">Role</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-6 text-sm text-gray-500 font-mono">{user._id}</td>
                    <td className="py-4 px-6 text-sm text-gray-800 font-medium">{user.firstName} {user.lastName}</td>
                    <td className="py-4 px-6 text-sm text-gray-600">{user.email}</td>
                    <td className="py-4 px-6 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        user.userType === 'admin' ? 'bg-purple-100 text-purple-700' :
                        user.userType === 'host' ? 'bg-teal-100 text-teal-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {user.userType.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan="4" className="py-8 text-center text-gray-500">No users found.</td>
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

export default AdminUsersPage;
