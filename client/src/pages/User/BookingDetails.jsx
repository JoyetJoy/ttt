import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';

export default function BookingDetails() {
  const { id } = useParams();
  const { user, token } = useAuth();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token && id) {
      axios.get(`${import.meta.env.VITE_API_URL}/users/bookings/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => {
        setBooking(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
    }
  }, [token, id]);

  if (loading) return <div className="pt-32 pb-32 text-center text-gray-500">Loading booking details...</div>;

  if (!booking) {
    return (
      <div className="pt-32 pb-32 text-center">
        <h2 className="text-2xl font-bold mb-4">Booking Not Found</h2>
        <Link to="/dashboard/bookings" className="text-red-600 hover:underline">Return to My Bookings</Link>
      </div>
    );
  }

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
          
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold">Booking Details</h2>
            <Link to="/dashboard/bookings" className="text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors">
              <i className="bi bi-arrow-left mr-2"></i>Back to List
            </Link>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Header Section */}
            <div className="bg-gray-50 p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="text-sm text-gray-500 mb-1">Order Number</div>
                <div className="text-xl font-bold text-gray-900">{booking.order_number}</div>
              </div>
              <div className="flex gap-4">
                <div>
                  <div className="text-sm text-gray-500 mb-1">Date</div>
                  <div className="font-medium text-gray-900">
                    {booking.created_at ? new Date(booking.created_at).toLocaleDateString() : 'N/A'}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Status</div>
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    booking.status === 1 ? 'bg-yellow-100 text-yellow-800' : 
                    booking.status === 3 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {booking.status === 1 ? 'Pending' : booking.status === 3 ? 'Approved' : 'Processing'}
                  </span>
                </div>
              </div>
            </div>

            {/* Content Section */}
            <div className="p-6">
              
              {/* Product Info */}
              <div className="mb-8">
                <h3 className="text-lg font-bold border-b pb-2 mb-4">Product Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2 flex items-center gap-4">
                    {booking.product_image && (
                      <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100 shadow-sm">
                        <img src={booking.product_image} alt={booking.product_name} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div>
                      <div className="text-sm text-gray-500">Product Name</div>
                      <Link to={`/${booking.product_type === 'activity' ? 'activities' : booking.product_type + 's'}/${booking.product_id}`} className="font-bold text-lg text-blue-600 hover:text-blue-800 hover:underline">
                        {booking.product_name}
                      </Link>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Product Type</div>
                    <div className="font-medium capitalize">{booking.product_type}</div>
                  </div>
                  {booking.start_date && (
                    <div>
                      <div className="text-sm text-gray-500">Travel Date</div>
                      <div className="font-medium">{booking.start_date}</div>
                    </div>
                  )}
                  {booking.days && (
                    <div>
                      <div className="text-sm text-gray-500">{booking.product_type === 'transport' ? 'No of Days' : 'Duration'}</div>
                      <div className="font-medium">{booking.product_type === 'transport' ? booking.adult_qty : `${booking.days} Day(s)`}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Guests & Pricing */}
              <div className="mb-8">
                <h3 className="text-lg font-bold border-b pb-2 mb-4">Pricing Details</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b text-gray-500 text-sm">
                        <th className="pb-2 font-medium">{booking.product_type === 'transport' ? 'Type' : 'Passenger Type'}</th>
                        <th className="pb-2 font-medium">{booking.product_type === 'transport' ? 'No of Days' : 'Quantity'}</th>
                        <th className="pb-2 font-medium">Unit Price</th>
                        <th className="pb-2 font-medium text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {booking.adult_qty > 0 && (
                        <tr className="border-b border-gray-50 last:border-0">
                          <td className="py-3">{booking.product_type === 'transport' ? 'Vehicle' : 'Adult'}</td>
                          <td className="py-3">{booking.adult_qty}</td>
                          <td className="py-3">₹{booking.adult_unit_price}</td>
                          <td className="py-3 text-right font-medium">₹{booking.adult_total_price}</td>
                        </tr>
                      )}
                      {booking.child_qty > 0 && (
                        <tr className="border-b border-gray-50 last:border-0">
                          <td className="py-3">Child</td>
                          <td className="py-3">{booking.child_qty}</td>
                          <td className="py-3">₹{booking.child_unit_price}</td>
                          <td className="py-3 text-right font-medium">₹{booking.child_total_price}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end mt-4">
                  <div className="w-full md:w-1/2 lg:w-1/3 space-y-2">
                    {booking.tax_amount > 0 && (
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>Tax Amount</span>
                        <span>₹{booking.tax_amount}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-lg pt-2 border-t text-gray-900">
                      <span>Total Paid</span>
                      <span className="text-red-600">₹{booking.total_amount}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Customer Info */}
              <div>
                <h3 className="text-lg font-bold border-b pb-2 mb-4">Billing Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-4 rounded-lg">
                  <div>
                    <div className="text-sm text-gray-500">Name</div>
                    <div className="font-medium">{booking.first_name} {booking.last_name}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Email</div>
                    <div className="font-medium">{booking.email}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Phone</div>
                    <div className="font-medium">{booking.phone}</div>
                  </div>
                  {booking.notes && (
                    <div className="col-span-1 md:col-span-2">
                      <div className="text-sm text-gray-500">Special Notes</div>
                      <div className="font-medium italic">"{booking.notes}"</div>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
