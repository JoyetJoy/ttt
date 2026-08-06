import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';
import { Search, Eye } from 'lucide-react';

const CardBgSvg = () => (
  <svg className="absolute right-0 bottom-0 opacity-10 pointer-events-none w-32 h-32 transform translate-x-4 translate-y-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="6" width="20" height="12" rx="2" />
    <circle cx="12" cy="12" r="2" />
    <path d="M6 12h.01M18 12h.01" />
  </svg>
);

export default function BookingList() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/orders/admin`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(response.data.orders);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = bookings.filter(b => 
    b.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.product_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalBookings = bookings.length;
  const activeBookings = bookings.filter(b => b.status === 3).length;
  const pendingBookings = bookings.filter(b => b.status === 1).length;
  const totalAmount = bookings.reduce((sum, b) => sum + (Number(b.total_amount) || 0), 0);

  return (
    <div className="bg-[#F4F6F9] min-h-full font-['Inter',sans-serif]">
      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-3">
        <div className="relative overflow-hidden rounded-[20px] bg-gradient-to-r from-orange-500 to-amber-500 p-6 shadow-[0_8px_20px_rgb(249,115,22,0.25)] text-white hover:translate-y-[-4px] transition-transform duration-300">
          <div className="relative z-10 flex flex-col h-full justify-between">
            <h5 className="text-[15px] font-medium opacity-90 tracking-wide">Total Bookings</h5>
            <h2 className="text-[32px] font-bold mt-3">{totalBookings}</h2>
          </div>
          <CardBgSvg />
        </div>

        <div className="relative overflow-hidden rounded-[20px] bg-gradient-to-r from-violet-600 to-purple-500 p-6 shadow-[0_8px_20px_rgb(124,58,237,0.25)] text-white hover:translate-y-[-4px] transition-transform duration-300">
          <div className="relative z-10 flex flex-col h-full justify-between">
            <h5 className="text-[15px] font-medium opacity-90 tracking-wide">Confirmed Bookings</h5>
            <h2 className="text-[32px] font-bold mt-3">{activeBookings}</h2>
          </div>
          <CardBgSvg />
        </div>

        <div className="relative overflow-hidden rounded-[20px] bg-gradient-to-r from-emerald-500 to-teal-400 p-6 shadow-[0_8px_20px_rgb(16,185,129,0.25)] text-white hover:translate-y-[-4px] transition-transform duration-300">
          <div className="relative z-10 flex flex-col h-full justify-between">
            <h5 className="text-[15px] font-medium opacity-90 tracking-wide">Pending Bookings</h5>
            <h2 className="text-[32px] font-bold mt-3">{pendingBookings}</h2>
          </div>
          <CardBgSvg />
        </div>

        <div className="relative overflow-hidden rounded-[20px] bg-gradient-to-r from-pink-500 to-rose-400 p-6 shadow-[0_8px_20px_rgb(236,72,153,0.25)] text-white hover:translate-y-[-4px] transition-transform duration-300">
          <div className="relative z-10 flex flex-col h-full justify-between">
            <h5 className="text-[15px] font-medium opacity-90 tracking-wide">Total Booking Amount</h5>
            <h2 className="text-[32px] font-bold mt-3">₹{totalAmount.toLocaleString()}</h2>
          </div>
          <CardBgSvg />
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-3 gap-4">
        <h3 className="text-xl font-bold text-slate-800">Booking List</h3>
        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search bookings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-4 pr-10 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64 text-sm"
            />
            <div className="absolute right-0 top-0 h-full w-10 flex items-center justify-center bg-indigo-600 text-white rounded-r-lg cursor-pointer hover:bg-indigo-700 transition">
              <Search size={16} />
            </div>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl shadow-[0_2px_12px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-indigo-600 text-white">
              <tr>
                <th className="px-6 py-3 font-semibold">S.N</th>
                <th className="px-6 py-3 font-semibold">Order ID</th>
                <th className="px-6 py-3 font-semibold">Customer</th>
                <th className="px-6 py-3 font-semibold">Product</th>
                <th className="px-6 py-3 font-semibold">Start Date</th>
                <th className="px-6 py-3 font-semibold">Amount</th>
                <th className="px-6 py-3 font-semibold">Status</th>
                <th className="px-6 py-3 font-semibold text-center">Option</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent mb-4"></div>
                      <p className="text-gray-500">Loading Bookings...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                    <p>No bookings found.</p>
                  </td>
                </tr>
              ) : (
                filteredBookings.map((b, index) => (
                  <tr key={b.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">{index + 1}</td>
                    <td className="px-6 py-4 font-medium">{b.order_number}</td>
                    <td className="px-6 py-4">
                      <div>{b.customer_name}</div>
                      <div className="text-xs text-gray-400">{b.customer_email || b.customer_phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="line-clamp-1">{b.product_name}</div>
                      <div className="text-xs text-gray-400 uppercase">{b.product_type}</div>
                    </td>
                    <td className="px-6 py-4">{b.start_date || 'N/A'}</td>
                    <td className="px-6 py-4">₹{b.total_amount}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        b.status === 3 ? 'bg-green-100 text-green-700' : 
                        b.status === 1 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {b.status === 3 ? 'Confirmed' : b.status === 1 ? 'Pending' : 'Cancelled'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Link to={`/admin/bookings/${b.id}`} className="flex h-8 w-8 items-center justify-center rounded bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors">
                          <Eye size={16} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
