import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Eye } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

const TicketSvg = () => (
  <svg width="100" height="60" viewBox="0 0 100 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute right-4 bottom-4 opacity-[0.15] w-28 h-auto pointer-events-none">
    <rect x="2" y="2" width="96" height="56" rx="12" stroke="white" strokeWidth="4" />
    <circle cx="50" cy="30" r="12" stroke="white" strokeWidth="4" />
    <circle cx="20" cy="30" r="2" fill="white" />
    <circle cx="80" cy="30" r="2" fill="white" />
  </svg>
);

export default function InquiriesList() {
  const [inquiries, setInquiries] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('All');
  const navigate = useNavigate();
  const { token } = useAuth();

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    try {
      const [inqRes, statsRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/admin/inquiries`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/admin/dashboard`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setInquiries(inqRes.data);
      setStats(statsRes.data?.stats);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (inquiryId, newStatus) => {
    try {
      await axios.put(`${import.meta.env.VITE_API_BASE_URL}/api/admin/inquiries/${inquiryId}/status`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setInquiries(inquiries.map(inq => 
        inq.id === inquiryId ? { ...inq, status: newStatus } : inq
      ));
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status.');
    }
  };

  const safeInquiries = Array.isArray(inquiries) ? inquiries : [];
  const uniqueTypes = ['All', ...new Set(safeInquiries.map(i => i.type))];
  
  const filteredInquiries = filterType === 'All' 
    ? safeInquiries 
    : safeInquiries.filter(i => i.type === filterType);

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      
      {/* Metric Cards Row */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Destination */}
          <div className="relative overflow-hidden rounded-[16px] bg-[#13A3FB] p-6 shadow-sm hover:translate-y-[-2px] transition-transform duration-300">
            <div className="relative z-10 flex flex-col h-full justify-between">
              <h5 className="text-[14px] font-bold text-black/80 tracking-wide">Total Destination</h5>
              <h2 className="text-[36px] font-black mt-2 text-black">{stats.total_destinations || 0}</h2>
            </div>
            <TicketSvg />
          </div>

          {/* Total Active */}
          <div className="relative overflow-hidden rounded-[16px] bg-[#00D28A] p-6 shadow-sm hover:translate-y-[-2px] transition-transform duration-300">
            <div className="relative z-10 flex flex-col h-full justify-between">
              <h5 className="text-[14px] font-bold text-black/80 tracking-wide">Total Active</h5>
              <h2 className="text-[36px] font-black mt-2 text-black">{stats.total_active || 0}</h2>
            </div>
            <TicketSvg />
          </div>

          {/* Total Tours */}
          <div className="relative overflow-hidden rounded-[16px] bg-[#9B51E0] p-6 shadow-sm hover:translate-y-[-2px] transition-transform duration-300">
            <div className="relative z-10 flex flex-col h-full justify-between">
              <h5 className="text-[14px] font-bold text-black/80 tracking-wide">Total Tours</h5>
              <h2 className="text-[36px] font-black mt-2 text-black">{stats.total_tours || 0}</h2>
            </div>
            <TicketSvg />
          </div>

          {/* Total Bookings */}
          <div className="relative overflow-hidden rounded-[16px] bg-[#FF8A00] p-6 shadow-sm hover:translate-y-[-2px] transition-transform duration-300">
            <div className="relative z-10 flex flex-col h-full justify-between">
              <h5 className="text-[14px] font-bold text-black/80 tracking-wide">Total Bookings</h5>
              <h2 className="text-[36px] font-black mt-2 text-black">{stats.total_bookings || 0}</h2>
            </div>
            <TicketSvg />
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Inquiries</h1>
          <p className="mt-2 text-sm text-gray-500">View all customer inquiries and questions submitted via the website.</p>
        </div>
        
        {!loading && inquiries.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {uniqueTypes.map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                  filterType === type 
                    ? 'bg-indigo-600 text-white shadow-sm' 
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500 font-medium">Loading inquiries...</div>
        ) : inquiries.length === 0 ? (
          <div className="p-8 text-center text-gray-500 font-medium">No inquiries found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">Type / Product ID</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider w-1/3">Message</th>
                  <th className="px-6 py-4 text-center text-xs font-black text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-center text-xs font-black text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInquiries.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500 font-medium">
                      No inquiries found for type "{filterType}".
                    </td>
                  </tr>
                ) : (
                  filteredInquiries.map((inquiry) => (
                    <tr key={inquiry.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                        {new Date(inquiry.created_at || Date.now()).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold">
                        {inquiry.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>{inquiry.email}</div>
                        <div>{inquiry.phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-bold rounded-full bg-blue-100 text-blue-800">
                          {inquiry.type}
                        </span>
                        <div className="text-xs text-gray-500 mt-1 font-mono">{inquiry.product_id}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                        <div className="line-clamp-2">{inquiry.message}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <select
                          value={inquiry.status || 1}
                          onChange={(e) => handleStatusChange(inquiry.id, parseInt(e.target.value))}
                          className={`text-xs font-bold rounded-full px-3 py-1 cursor-pointer outline-none border-2 transition-colors ${
                            inquiry.status === 2 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                          }`}
                        >
                          <option value={1} className="text-gray-700">Pending</option>
                          <option value={2} className="text-gray-700">Resolved</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                        <button 
                          onClick={() => navigate(`/admin/inquiries/${inquiry.id}`)}
                          className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 p-2 rounded-full hover:bg-indigo-100 transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
