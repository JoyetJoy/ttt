import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function Bookings() {
  const { user, token } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/users/bookings`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => {
        setBookings(res.data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
    }
  }, [token]);

  if (loading) return <div className="pt-32 pb-32 text-center text-gray-500">Loading your bookings...</div>;

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
              <Link to="/dashboard" className="block px-4 py-2 text-gray-600 hover:bg-gray-50 rounded transition">Dashboard</Link>
              <Link to="/dashboard/bookings" className="block px-4 py-2 bg-red-50 text-red-600 font-bold rounded">My Bookings</Link>
              <Link to="/profile" className="block px-4 py-2 text-gray-600 hover:bg-gray-50 rounded transition">My Profile</Link>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="w-full md:w-3/4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-2xl font-bold mb-6">My Bookings</h2>
            
            {bookings.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b text-gray-500 bg-gray-50/50">
                      <th className="px-4 py-3 font-bold text-xs uppercase tracking-wider">Order #</th>
                      <th className="px-4 py-3 font-bold text-xs uppercase tracking-wider">Type</th>
                      <th className="px-4 py-3 font-bold text-xs uppercase tracking-wider">Date</th>
                      <th className="px-4 py-3 font-bold text-xs uppercase tracking-wider">Amount</th>
                      <th className="px-4 py-3 font-bold text-xs uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 font-bold text-xs uppercase tracking-wider text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map(booking => (
                      <tr key={booking.id} className="border-b last:border-0 hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-4 text-sm font-bold text-gray-900">{booking.order_number}</td>
                        <td className="px-4 py-4 text-sm capitalize">{booking.product_type}</td>
                        <td className="px-4 py-4 text-sm text-gray-600">
                           {booking.created_at ? new Date(booking.created_at).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-4 py-4 text-sm font-bold text-red-600">₹{booking.total_amount}</td>
                        <td className="px-4 py-4 text-sm">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${
                            booking.status === 1 ? 'bg-yellow-100 text-yellow-800' : 
                            booking.status === 3 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {booking.status === 1 ? 'Pending' : booking.status === 3 ? 'Approved' : 'Processing'}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm text-center">
                           <Link to={`/dashboard/bookings/${booking.id}`} className="text-gray-400 hover:text-red-600 transition-colors inline-block p-1 bg-white border border-gray-200 rounded shadow-sm hover:border-red-200">
                              <i className="bi bi-eye"></i>
                           </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="bi bi-calendar-x text-2xl text-gray-400"></i>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">No Bookings Yet</h3>
                <p className="text-gray-500 mb-6">Looks like you haven't made any bookings.</p>
                <Link to="/" className="inline-block bg-red-600 text-white font-bold px-6 py-2 rounded hover:bg-red-700 transition">Explore Tours</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
