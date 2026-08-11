import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { Link } from 'react-router-dom';
import { Search, Plus, Edit, Trash2, Eye } from 'lucide-react';

export default function AdminActivityList() {
  const { token } = useAuth();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = () => {
    fetch(`${import.meta.env.VITE_API_URL}/activities`)
      .then(res => res.json())
      .then(data => {
        setActivities(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this activity?')) return;

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/activities/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setActivities(activities.filter(activity => activity.id !== id));
      } else {
        alert('Failed to delete activity');
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
          <p className="mt-4 text-sm font-medium text-gray-600">Loading Activities...</p>
        </div>
      </div>
    );
  }

  const filteredActivities = activities.filter(a =>
    a.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalActivities = activities.length;
  const totalActive = activities.filter(a => a.status === 1).length;
  const totalViews = activities.reduce((sum, a) => sum + (a.view || 0), 0);
  const totalBookings = 0; // Placeholder

  const CardBgSvg = () => (
    <svg className="absolute right-0 bottom-0 opacity-10 pointer-events-none w-32 h-32 transform translate-x-4 translate-y-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <circle cx="12" cy="12" r="2" />
      <path d="M6 12h.01M18 12h.01" />
    </svg>
  );

  return (
    <div className="bg-[#F4F6F9] min-h-full font-['Inter',sans-serif]">

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-3">
        <div className="relative overflow-hidden rounded-[20px] bg-gradient-to-r from-blue-500 to-cyan-500 p-6 shadow-[0_8px_20px_rgb(59,130,246,0.25)] text-white hover:translate-y-[-4px] transition-transform duration-300">
          <div className="relative z-10 flex flex-col h-full justify-between">
            <h5 className="text-[15px] font-medium opacity-90 tracking-wide">Total Activities</h5>
            <h2 className="text-[32px] font-bold mt-3">{totalActivities}</h2>
          </div>
          <CardBgSvg />
        </div>

        <div className="relative overflow-hidden rounded-[20px] bg-gradient-to-r from-emerald-500 to-teal-400 p-6 shadow-[0_8px_20px_rgb(16,185,129,0.25)] text-white hover:translate-y-[-4px] transition-transform duration-300">
          <div className="relative z-10 flex flex-col h-full justify-between">
            <h5 className="text-[15px] font-medium opacity-90 tracking-wide">Total Active</h5>
            <h2 className="text-[32px] font-bold mt-3">{totalActive}</h2>
          </div>
          <CardBgSvg />
        </div>

        <div className="relative overflow-hidden rounded-[20px] bg-gradient-to-r from-violet-600 to-purple-500 p-6 shadow-[0_8px_20px_rgb(124,58,237,0.25)] text-white hover:translate-y-[-4px] transition-transform duration-300">
          <div className="relative z-10 flex flex-col h-full justify-between">
            <h5 className="text-[15px] font-medium opacity-90 tracking-wide">Total Views</h5>
            <h2 className="text-[32px] font-bold mt-3">{totalViews}</h2>
          </div>
          <CardBgSvg />
        </div>

        <div className="relative overflow-hidden rounded-[20px] bg-gradient-to-r from-orange-500 to-amber-500 p-6 shadow-[0_8px_20px_rgb(249,115,22,0.25)] text-white hover:translate-y-[-4px] transition-transform duration-300">
          <div className="relative z-10 flex flex-col h-full justify-between">
            <h5 className="text-[15px] font-medium opacity-90 tracking-wide">Total Bookings</h5>
            <h2 className="text-[32px] font-bold mt-3">{totalBookings}</h2>
          </div>
          <CardBgSvg />
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between mb-3 gap-4">
        <h3 className="text-xl font-bold text-slate-800">Activity List</h3>
        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search activities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-4 pr-10 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64 text-sm"
            />
            <div className="absolute right-0 top-0 h-full w-10 flex items-center justify-center bg-indigo-600 text-white rounded-r-lg cursor-pointer hover:bg-indigo-700 transition">
              <Search size={16} />
            </div>
          </div>
          <Link to="/admin/activities/create" className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition shadow-sm">
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
                <th className="px-6 py-3 font-semibold">Title</th>
                <th className="px-6 py-3 font-semibold">Price</th>
                <th className="px-6 py-3 font-semibold">Status</th>
                <th className="px-6 py-3 font-semibold text-center">Option</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {filteredActivities.length > 0 ? (
                filteredActivities.map((activity, index) => (
                  <tr key={activity.id} className="hover:bg-gray-50/50 transition">
                    <td className="px-6 py-2">{index + 1}</td>
                    <td className="px-6 py-2 font-medium text-gray-900">{activity.title}</td>
                    <td className="px-6 py-2 text-gray-500">₹{activity.sale_price > 0 ? activity.sale_price : activity.price}</td>
                    <td className="px-6 py-2">
                      {activity.status === 1 ? (
                        <span className="text-emerald-600 bg-emerald-50 rounded px-2 py-1 text-xs font-semibold">Publish</span>
                      ) : (
                        <span className="text-amber-600 bg-amber-50 rounded px-2 py-1 text-xs font-semibold">Draft</span>
                      )}
                    </td>
                    <td className="px-6 py-2">
                      <div className="flex items-center justify-center gap-2">
                        <Link to={`/admin/activities/view/${activity.id}`} className="p-1.5 bg-emerald-50 text-emerald-600 rounded hover:bg-emerald-100 transition shadow-sm" title="View">
                          <Eye size={16} />
                        </Link>
                        <Link to={`/admin/activities/edit/${activity.id}`} className="p-1.5 bg-amber-50 text-amber-600 rounded hover:bg-amber-100 transition shadow-sm" title="Edit">
                          <Edit size={16} />
                        </Link>
                        <button onClick={() => handleDelete(activity.id)} className="p-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100 transition shadow-sm" title="Delete">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                    No activities found matching your search.
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
