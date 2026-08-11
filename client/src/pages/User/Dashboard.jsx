import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { user, token } = useAuth();
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetch(`${import.meta.env.VITE_API_URL}/users/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        setStats(data.stats);
        setBookings(data.recentBookings || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
    }
  }, [token]);

  if (loading) return <div className="pt-32 text-center">Loading dashboard...</div>;

  return (
    <div className="pt-24 pb-32 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 flex flex-col md:flex-row gap-8">
        
        {/* Sidebar */}
        <div className="w-full md:w-1/4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-3 flex items-center justify-center text-gray-500 text-2xl font-bold">
                {user?.name?.charAt(0)}
              </div>
              <h3 className="font-bold text-lg">{user?.name}</h3>
              <p className="text-gray-500 text-sm">{user?.email}</p>
            </div>
            
            <nav className="space-y-2">
              <Link to="/dashboard" className="block px-4 py-2 bg-red-50 text-red-600 font-bold rounded">Dashboard</Link>
              <Link to="/dashboard/bookings" className="block px-4 py-2 text-gray-600 hover:bg-gray-50 rounded transition">My Bookings</Link>
              <Link to="/profile" className="block px-4 py-2 text-gray-600 hover:bg-gray-50 rounded transition">My Profile</Link>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="w-full md:w-3/4">
          <h2 className="text-2xl font-bold mb-6">Dashboard Overview</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center">
              <div className="text-4xl font-bold text-red-600 mb-2">{stats?.tours || 0}</div>
              <div className="text-gray-500">Tour Bookings</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center">
              <div className="text-4xl font-bold text-red-600 mb-2">{stats?.hotels || 0}</div>
              <div className="text-gray-500">Hotel Bookings</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center">
              <div className="text-4xl font-bold text-red-600 mb-2">{stats?.transports || 0}</div>
              <div className="text-gray-500">Transport Bookings</div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold mb-4">Recent Bookings</h3>
            {bookings.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b text-gray-500">
                      <th className="pb-3 font-medium">Order #</th>
                      <th className="pb-3 font-medium">Type</th>
                      <th className="pb-3 font-medium">Date</th>
                      <th className="pb-3 font-medium">Status</th>
                      <th className="pb-3 font-medium text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map(booking => (
                      <tr key={booking.id} className="border-b last:border-0">
                        <td className="py-4 text-sm font-medium">{booking.order_number}</td>
                        <td className="py-4 text-sm capitalize">{booking.product_type}</td>
                        <td className="py-4 text-sm">
                          {booking.created_at ? new Date(booking.created_at).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="py-4 text-sm">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${
                            booking.status === 1 ? 'bg-yellow-100 text-yellow-800' : 
                            booking.status === 3 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {booking.status === 1 ? 'Pending' : booking.status === 3 ? 'Approved' : 'Processing'}
                          </span>
                        </td>
                        <td className="py-4 text-sm text-center">
                           <Link to={`/dashboard/bookings/${booking.id}`} className="text-gray-400 hover:text-red-600 transition-colors inline-block p-1">
                              <i className="bi bi-eye text-lg"></i>
                           </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No recent bookings found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
