import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { Link } from 'react-router-dom';
import { Search, Plus, Edit, Eye, Trash2 } from 'lucide-react';

const CardBgSvg = () => (
  <svg className="absolute right-0 bottom-0 opacity-10 pointer-events-none w-32 h-32 transform translate-x-4 translate-y-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="6" width="20" height="12" rx="2" />
    <circle cx="12" cy="12" r="2" />
    <path d="M6 12h.01M18 12h.01" />
  </svg>
);

export default function AdminVisaList() {
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchVisas();
  }, [token]);

  const fetchVisas = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/visas`, {
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

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this visa?')) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/visas/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchVisas();
      } else {
        alert('Failed to delete visa');
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center bg-[#F4F6F9]">
        <div className="flex flex-col items-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
          <p className="mt-4 text-sm font-medium text-gray-600">Loading Visas...</p>
        </div>
      </div>
    );
  }

  const stats = data?.stats || {};
  const visas = data?.visas || [];

  const filteredVisas = visas.filter(v =>
    v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-[#F4F6F9] min-h-full font-['Inter',sans-serif]">
      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-3">
        <div className="relative overflow-hidden rounded-[20px] bg-gradient-to-r from-orange-500 to-amber-500 p-6 shadow-[0_8px_20px_rgb(249,115,22,0.25)] text-white hover:translate-y-[-4px] transition-transform duration-300">
          <div className="relative z-10 flex flex-col h-full justify-between">
            <h5 className="text-[15px] font-medium opacity-90 tracking-wide">Total Visas</h5>
            <h2 className="text-[32px] font-bold mt-3">{stats.total_visas || 0}</h2>
          </div>
          <CardBgSvg />
        </div>

        <div className="relative overflow-hidden rounded-[20px] bg-gradient-to-r from-violet-600 to-purple-500 p-6 shadow-[0_8px_20px_rgb(124,58,237,0.25)] text-white hover:translate-y-[-4px] transition-transform duration-300">
          <div className="relative z-10 flex flex-col h-full justify-between">
            <h5 className="text-[15px] font-medium opacity-90 tracking-wide">Active Visas</h5>
            <h2 className="text-[32px] font-bold mt-3">{stats.total_active_visas || 0}</h2>
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

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-3 gap-4">
        <h3 className="text-xl font-bold text-slate-800">Visa List</h3>
        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search visas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-4 pr-10 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64 text-sm"
            />
            <div className="absolute right-0 top-0 h-full w-10 flex items-center justify-center bg-indigo-600 text-white rounded-r-lg cursor-pointer hover:bg-indigo-700 transition">
              <Search size={16} />
            </div>
          </div>
          <Link to="/admin/visas/create" className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition shadow-sm">
            <Plus size={16} /> Add New
          </Link>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl shadow-[0_2px_12px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-indigo-600 text-white">
              <tr>
                <th className="px-6 py-3 font-semibold">S.N</th>
                <th className="px-6 py-3 font-semibold">Name</th>
                <th className="px-6 py-3 font-semibold">Country</th>
                <th className="px-6 py-3 font-semibold">Category</th>
                <th className="px-6 py-3 font-semibold">Cost</th>
                <th className="px-6 py-3 font-semibold">Status</th>
                <th className="px-6 py-3 font-semibold text-center">Option</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {filteredVisas.length > 0 ? (
                filteredVisas.map((visa) => (
                  <tr key={visa.id} className="hover:bg-gray-50/50 transition">
                    <td className="px-6 py-2">{visa.sn}</td>
                    <td className="px-6 py-2 font-medium text-gray-900">{visa.name}</td>
                    <td className="px-6 py-2 text-gray-500">{visa.country}</td>
                    <td className="px-6 py-2 text-gray-500">{visa.category}</td>
                    <td className="px-6 py-2 font-medium">₹{visa.cost?.toLocaleString()}</td>
                    <td className="px-6 py-2">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={visa.status === 1} readOnly />
                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                      </label>
                    </td>
                    <td className="px-6 py-2">
                      <div className="flex items-center justify-center gap-2">
                        <Link to={`/admin/visas/view/${visa.id}`} className="p-1.5 bg-emerald-50 text-emerald-600 rounded hover:bg-emerald-100 transition shadow-sm" title="View/Edit Advanced Options">
                          <Eye size={16} />
                        </Link>
                        <Link to={`/admin/visas/edit/${visa.id}`} className="p-1.5 bg-amber-50 text-amber-600 rounded hover:bg-amber-100 transition shadow-sm" title="Edit Basic Info">
                          <Edit size={16} />
                        </Link>
                        <button onClick={() => handleDelete(visa.id)} className="p-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100 transition shadow-sm" title="Delete">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                    No visas found matching your search.
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
