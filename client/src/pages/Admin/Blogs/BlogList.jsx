import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { Link } from 'react-router-dom';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';
import axios from 'axios';

const CardBgSvg = () => (
  <svg className="absolute right-0 bottom-0 opacity-10 pointer-events-none w-24 h-24 transform translate-x-2 translate-y-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="6" width="20" height="12" rx="2" />
    <circle cx="12" cy="12" r="2" />
    <path d="M6 12h.01M18 12h.01" />
  </svg>
);

export default function BlogList() {
  const { token } = useAuth();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchBlogs = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/admin/blogs`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBlogs(res.data);
    } catch (err) {
      console.error(err);
      alert('Failed to load blogs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, [token]);

  const handleStatusToggle = async (blogId, currentStatus) => {
    const newStatus = currentStatus === 1 ? 0 : 1;
    
    setBlogs(prev => prev.map(b => b.id === blogId ? { ...b, status: newStatus } : b));

    try {
      const formData = new FormData();
      formData.append('status', newStatus.toString());

      await axios.put(`${import.meta.env.VITE_API_BASE_URL}/api/admin/blogs/${blogId}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      console.error(err);
      alert('Error updating status');
      fetchBlogs(); // Revert
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this blog?')) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/api/admin/blogs/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBlogs(blogs.filter(b => b.id !== id));
      alert('Blog deleted successfully');
    } catch (error) {
      console.error(error);
      alert('Failed to delete blog');
    }
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center bg-[#F4F6F9]">
        <div className="flex flex-col items-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
          <p className="mt-4 text-sm font-medium text-gray-600">Loading Blogs...</p>
        </div>
      </div>
    );
  }

  const safeBlogs = Array.isArray(blogs) ? blogs : [];
  
  const filteredBlogs = safeBlogs.filter(b =>
    b.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.blog_categories?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeCount = safeBlogs.filter(b => b.status === 1).length;
  const pendingCount = safeBlogs.filter(b => b.status === 0).length;
  const categoriesCount = new Set(safeBlogs.map(b => b.category_id)).size;

  return (
    <div className="min-h-full font-['Inter',sans-serif]">
      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Blogs */}
        <div className="relative overflow-hidden rounded-2xl bg-[#009efb] p-6 text-black shadow-sm">
          <div className="relative z-10 flex flex-col h-full justify-between">
            <h5 className="text-[15px] font-bold tracking-wide">Total Blogs</h5>
            <h2 className="text-[32px] font-bold mt-2">{blogs.length}</h2>
          </div>
          <CardBgSvg />
        </div>

        {/* Total Active */}
        <div className="relative overflow-hidden rounded-2xl bg-[#00d284] p-6 text-black shadow-sm">
          <div className="relative z-10 flex flex-col h-full justify-between">
            <h5 className="text-[15px] font-bold tracking-wide">Total Active</h5>
            <h2 className="text-[32px] font-bold mt-2">{activeCount}</h2>
          </div>
          <CardBgSvg />
        </div>

        {/* Total Categories */}
        <div className="relative overflow-hidden rounded-2xl bg-[#9a55ff] p-6 text-black shadow-sm">
          <div className="relative z-10 flex flex-col h-full justify-between">
            <h5 className="text-[15px] font-bold tracking-wide">Total Categories</h5>
            <h2 className="text-[32px] font-bold mt-2">{categoriesCount}</h2>
          </div>
          <CardBgSvg />
        </div>

        {/* Total Comments / Extra */}
        <div className="relative overflow-hidden rounded-2xl bg-[#ff9900] p-6 text-black shadow-sm">
          <div className="relative z-10 flex flex-col h-full justify-between">
            <h5 className="text-[15px] font-bold tracking-wide">Total Views</h5>
            <h2 className="text-[32px] font-bold mt-2">0</h2>
          </div>
          <CardBgSvg />
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
        <h3 className="text-2xl font-extrabold text-gray-900">Blog List</h3>
        <div className="flex items-center gap-3">
          <div className="flex bg-white rounded border border-gray-200 overflow-hidden shadow-sm">
            <input
              type="text"
              placeholder="Search blogs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 text-sm focus:outline-none w-56"
            />
            <div className="flex items-center justify-center bg-[#563bff] text-white px-3 cursor-pointer hover:bg-indigo-700 transition">
              <Search size={16} />
            </div>
          </div>
          <Link to="/admin/blogs/create" className="flex items-center gap-2 bg-[#9a55ff] hover:bg-purple-600 text-white px-5 py-2 rounded text-sm font-medium transition shadow-sm">
            <Plus size={16} /> Add New
          </Link>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-t-xl rounded-b-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[#563bff] text-white">
              <tr>
                <th className="px-6 py-4 font-semibold rounded-tl-xl">S.N</th>
                <th className="px-6 py-4 font-semibold">Image</th>
                <th className="px-6 py-4 font-semibold">Title</th>
                <th className="px-6 py-4 font-semibold">Category</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold rounded-tr-xl">Option</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {filteredBlogs.length > 0 ? (
                filteredBlogs.map((blog, index) => (
                  <tr key={blog.id} className="hover:bg-gray-50/50 transition bg-white">
                    <td className="px-6 py-4">{index + 1}</td>
                    <td className="px-6 py-4">
                      <div className="h-10 w-16 bg-gray-200 rounded overflow-hidden">
                        {blog.image && <img src={blog.image} alt={blog.title} className="h-full w-full object-cover" />}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-900">{blog.title}</td>
                    <td className="px-6 py-4 text-gray-500">{blog.blog_categories?.name || 'Uncategorized'}</td>
                    <td className="px-6 py-4">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={blog.status === 1} 
                          onChange={() => handleStatusToggle(blog.id, blog.status)} 
                        />
                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#a855f7]"></div>
                      </label>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Link to={`/admin/blogs/edit/${blog.id}`} className="text-blue-500 hover:text-blue-700 transition" title="Edit">
                          <Edit size={16} />
                        </Link>
                        <button onClick={() => handleDelete(blog.id)} className="p-1.5 bg-red-50 text-red-500 rounded hover:bg-red-100 transition shadow-sm" title="Delete">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    No blogs found.
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
