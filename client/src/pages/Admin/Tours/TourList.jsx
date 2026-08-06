import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { Link } from 'react-router-dom';
import { Search, Plus, Edit, Trash2, Eye } from 'lucide-react';

const CardBgSvg = () => (
  <svg className="absolute right-0 bottom-0 opacity-10 pointer-events-none w-32 h-32 transform translate-x-4 translate-y-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="6" width="20" height="12" rx="2" />
    <circle cx="12" cy="12" r="2" />
    <path d="M6 12h.01M18 12h.01" />
  </svg>
);

export default function AdminTourList() {
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchTours = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/tours`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch data');
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTours();
  }, [token]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this tour?')) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/tours/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchTours();
      } else {
        alert('Failed to delete tour');
      }
    } catch (error) {
      console.error('Error deleting tour:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center bg-[#F4F6F9]">
        <div className="flex flex-col items-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
          <p className="mt-4 text-sm font-medium text-gray-600">Loading Tours...</p>
        </div>
      </div>
    );
  }

  const tours = data?.tours || [];
  const stats = data?.stats || {};

  const filteredTours = tours.filter(t =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-[#F4F6F9] min-h-full font-['Inter',sans-serif]">

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-3">
        <div className="relative overflow-hidden rounded-[20px] bg-gradient-to-r from-orange-500 to-amber-500 p-6 shadow-[0_8px_20px_rgb(249,115,22,0.25)] text-white hover:translate-y-[-4px] transition-transform duration-300">
          <div className="relative z-10 flex flex-col h-full justify-between">
            <h5 className="text-[15px] font-medium opacity-90 tracking-wide">Total Tours</h5>
            <h2 className="text-[32px] font-bold mt-3">{stats.total_tours || 0}</h2>
          </div>
          <CardBgSvg />
        </div>

        <div className="relative overflow-hidden rounded-[20px] bg-gradient-to-r from-violet-600 to-purple-500 p-6 shadow-[0_8px_20px_rgb(124,58,237,0.25)] text-white hover:translate-y-[-4px] transition-transform duration-300">
          <div className="relative z-10 flex flex-col h-full justify-between">
            <h5 className="text-[15px] font-medium opacity-90 tracking-wide">Total Active Tours</h5>
            <h2 className="text-[32px] font-bold mt-3">{stats.total_active_tours || 0}</h2>
          </div>
          <CardBgSvg />
        </div>

        <div className="relative overflow-hidden rounded-[20px] bg-gradient-to-r from-emerald-500 to-teal-400 p-6 shadow-[0_8px_20px_rgb(16,185,129,0.25)] text-white hover:translate-y-[-4px] transition-transform duration-300">
          <div className="relative z-10 flex flex-col h-full justify-between">
            <h5 className="text-[15px] font-medium opacity-90 tracking-wide">Total Booking</h5>
            <h2 className="text-[32px] font-bold mt-3">{stats.total_booking || 0}</h2>
          </div>
          <CardBgSvg />
        </div>

        <div className="relative overflow-hidden rounded-[20px] bg-gradient-to-r from-pink-500 to-rose-400 p-6 shadow-[0_8px_20px_rgb(236,72,153,0.25)] text-white hover:translate-y-[-4px] transition-transform duration-300">
          <div className="relative z-10 flex flex-col h-full justify-between">
            <h5 className="text-[15px] font-medium opacity-90 tracking-wide">Total Booking Amount</h5>
            <h2 className="text-[32px] font-bold mt-3">${Number(stats.total_booking_amount || 0).toLocaleString()}</h2>
          </div>
          <CardBgSvg />
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between mb-3 gap-4">
        <h3 className="text-xl font-bold text-slate-800">Tour List</h3>
        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search tours..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-4 pr-10 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64 text-sm"
            />
            <div className="absolute right-0 top-0 h-full w-10 flex items-center justify-center bg-indigo-600 text-white rounded-r-lg cursor-pointer hover:bg-indigo-700 transition">
              <Search size={16} />
            </div>
          </div>
          <Link to="/admin/tours/create" className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition shadow-sm">
            <Plus size={16} /> Add New
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-[0_2px_12px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-indigo-600 text-white">
              <tr>
                <th className="px-6 py-3 font-semibold">S.N</th>
                <th className="px-6 py-3 font-semibold">Name</th>
                <th className="px-6 py-3 font-semibold">Category</th>
                <th className="px-6 py-3 font-semibold">Location</th>
                <th className="px-6 py-3 font-semibold">Price</th>
                <th className="px-6 py-3 font-semibold">Status</th>
                <th className="px-6 py-3 font-semibold text-center">Option</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {filteredTours.length > 0 ? (
                filteredTours.map((tour) => (
                  <tr key={tour.id} className="hover:bg-gray-50/50 transition">
                    <td className="px-6 py-2">{tour.sn}</td>
                    <td className="px-6 py-2 font-medium text-gray-900">{tour.name}</td>
                    <td className="px-6 py-2 text-gray-500">{tour.category}</td>
                    <td className="px-6 py-2 text-gray-500">{tour.location}</td>
                    <td className="px-6 py-2 font-medium">₹{tour.price?.toLocaleString()}</td>
                    <td className="px-6 py-2">
                      {tour.status === 1 ? (
                        <span className="text-emerald-600 bg-emerald-50 rounded px-2 py-1 text-xs font-semibold">Publish</span>
                      ) : (
                        <span className="text-amber-600 bg-amber-50 rounded px-2 py-1 text-xs font-semibold">Draft</span>
                      )}
                    </td>
                    <td className="px-6 py-2">
                      <div className="flex items-center justify-center gap-2">
                        <Link to={`/admin/tours/view/${tour.id}`} className="p-1.5 bg-emerald-50 text-emerald-600 rounded hover:bg-emerald-100 transition shadow-sm" title="View">
                          <Eye size={16} />
                        </Link>
                        <Link to={`/admin/tours/edit/${tour.id}`} className="p-1.5 bg-amber-50 text-amber-600 rounded hover:bg-amber-100 transition shadow-sm" title="Edit">
                          <Edit size={16} />
                        </Link>
                        <button onClick={() => handleDelete(tour.id)} className="p-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100 transition shadow-sm" title="Delete">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                    No tours found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
