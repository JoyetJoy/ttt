import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Plus, Edit, Trash2, X } from 'lucide-react';

export default function AdminPageList() {
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [newPageName, setNewPageName] = useState('');
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();

  const fetchPages = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/pages`, {
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
    fetchPages();
  }, [token]);

  const handleStatusToggle = async (pageId, currentStatus) => {
    const newStatus = currentStatus === 1 ? 0 : 1;
    
    // Optimistic UI update
    setData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        pages: prev.pages.map(p => p.id === pageId ? { ...p, status: newStatus } : p)
      };
    });

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/pages/${pageId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!res.ok) {
        throw new Error('Failed to update status');
      }
      
      fetchPages(); // Refresh stats
    } catch (err) {
      console.error(err);
      alert('Error updating page status');
      fetchPages(); // Revert
    }
  };

  const handleCreateNew = async (e) => {
    e.preventDefault();
    if (!newPageName.trim()) return alert('Page Name is required.');
    
    setCreating(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/pages`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ page_name: newPageName })
      });

      if (!res.ok) throw new Error('Failed to create page');
      
      const resData = await res.json();
      navigate(`/admin/pages/edit/${resData.id}`);
    } catch (err) {
      console.error(err);
      alert('Error creating page');
      setCreating(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this page?')) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/pages/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchPages();
      } else {
        alert('Failed to delete page');
      }
    } catch (error) {
      console.error('Error deleting page:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center bg-[#F4F6F9]">
        <div className="flex flex-col items-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
          <p className="mt-4 text-sm font-medium text-gray-600">Loading Pages...</p>
        </div>
      </div>
    );
  }

  const pages = data?.pages || [];
  const stats = data?.stats || {};

  const filteredPages = pages.filter(p =>
    (p.page_name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const CardBgSvg = () => (
    <svg className="absolute right-0 bottom-0 opacity-10 pointer-events-none w-32 h-32 transform translate-x-4 translate-y-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <circle cx="12" cy="12" r="2" />
      <path d="M6 12h.01M18 12h.01" />
    </svg>
  );

  return (
    <div className=" bg-[#F4F6F9] min-h-full font-['Inter',sans-serif]">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-3">
        <div className="relative overflow-hidden rounded-[20px] bg-gradient-to-r from-blue-500 to-cyan-500 p-6 shadow-[0_8px_20px_rgb(59,130,246,0.25)] text-white hover:translate-y-[-4px] transition-transform duration-300">
          <div className="relative z-10 flex flex-col h-full justify-between">
            <h5 className="text-[15px] font-medium opacity-90 tracking-wide">Total Pages</h5>
            <h2 className="text-[32px] font-bold mt-3">{stats.total_pages || 0}</h2>
          </div>
          <CardBgSvg />
        </div>

        <div className="relative overflow-hidden rounded-[20px] bg-gradient-to-r from-emerald-500 to-teal-400 p-6 shadow-[0_8px_20px_rgb(16,185,129,0.25)] text-white hover:translate-y-[-4px] transition-transform duration-300">
          <div className="relative z-10 flex flex-col h-full justify-between">
            <h5 className="text-[15px] font-medium opacity-90 tracking-wide">Total Active</h5>
            <h2 className="text-[32px] font-bold mt-3">{stats.total_active_pages || 0}</h2>
          </div>
          <CardBgSvg />
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between mb-3 gap-4">
        <h3 className="text-xl font-bold text-slate-800">Pages List</h3>
        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search pages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-4 pr-10 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64 text-sm"
            />
            <div className="absolute right-0 top-0 h-full w-10 flex items-center justify-center bg-indigo-600 text-white rounded-r-lg cursor-pointer hover:bg-indigo-700 transition">
              <Search size={16} />
            </div>
          </div>
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition shadow-sm">
            <Plus size={16} /> Add New
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-[0_2px_12px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-indigo-600 text-white">
              <tr>
                <th className="px-6 py-3 font-semibold">S.N</th>
                <th className="px-6 py-3 font-semibold">Page Name</th>
                <th className="px-6 py-3 font-semibold">Status</th>
                <th className="px-6 py-3 font-semibold text-center">Option</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {filteredPages.length > 0 ? (
                filteredPages.map((page) => (
                  <tr key={page.id} className="hover:bg-gray-50/50 transition">
                    <td className="px-6 py-2">{page.sn}</td>
                    <td className="px-6 py-2 font-medium text-gray-900">{page.page_name}</td>
                    <td className="px-6 py-2">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={page.status === 1} 
                          onChange={() => handleStatusToggle(page.id, page.status)} 
                        />
                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                      </label>
                    </td>
                    <td className="px-6 py-2">
                      <div className="flex items-center justify-center gap-2">
                        <Link to={`/admin/pages/edit/${page.id}`} className="p-1.5 bg-amber-50 text-amber-600 rounded hover:bg-amber-100 transition shadow-sm" title="Edit">
                          <Edit size={16} />
                        </Link>
                        <button onClick={() => handleDelete(page.id)} className="p-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100 transition shadow-sm" title="Delete">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                    No pages found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Add Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-slate-800 text-lg">Add New Page</h3>
              <button 
                type="button"
                onClick={() => { setShowModal(false); setNewPageName(''); }}
                className="w-8 h-8 flex items-center justify-center text-slate-500 bg-slate-100 hover:bg-slate-200 hover:text-slate-700 rounded-full transition"
              >
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleCreateNew} className="p-5">
              <div className="mb-5">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Page Name <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  autoFocus
                  placeholder="e.g. Terms & Conditions" 
                  value={newPageName}
                  onChange={(e) => setNewPageName(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition shadow-sm" 
                  required 
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => { setShowModal(false); setNewPageName(''); }}
                  className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition shadow-sm disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center min-w-[100px]"
                >
                  {creating ? (
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    'Create'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
