import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { Save, ArrowLeft, Image as ImageIcon, MapPin, Plus } from 'lucide-react';
import CategoryDrawer from './CategoryDrawer';
import { useAuth } from '../../../context/AuthContext';

export default function BlogForm() {
  const { token } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: '',
    enable_seo: '0',
    meta_title: '',
    meta_keyward: '',
    meta_description: '',
    category_id: '',
    status: 1
  });

  const [featureImage, setFeatureImage] = useState(null);
  const [featureImagePreview, setFeatureImagePreview] = useState(null);
  const [categories, setCategories] = useState([]);
  const [isCategoryDrawerOpen, setIsCategoryDrawerOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEditMode);
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    fetchCategories();
    if (isEditMode) {
      fetchBlogDetails();
    }
  }, [id]);

  const fetchCategories = async () => {
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/admin/blog-categories`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchBlogDetails = async () => {
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/admin/blogs/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFormData({
        title: data.title || '',
        description: data.description || '',
        tags: data.tags || '',
        enable_seo: data.enable_seo || '0',
        meta_title: data.meta_title || '',
        meta_keyward: data.meta_keyward || '',
        meta_description: data.meta_description || '',
        category_id: data.category_id?.toString() || '',
        status: data.status !== undefined ? data.status : 1
      });
      if (data.image) {
        setFeatureImagePreview(data.image);
      }
    } catch (error) {
      console.error('Error fetching blog details:', error);
      alert('Failed to load blog details');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setFormData({ ...formData, [name]: checked ? '1' : '0' });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleQuillChange = (value) => {
    setFormData({ ...formData, description: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFeatureImage(file);
      setFeatureImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        data.append(key, formData[key]);
      });

      if (featureImage) {
        data.append('image', featureImage);
      }

      if (isEditMode) {
        await axios.put(`${import.meta.env.VITE_API_BASE_URL}/api/admin/blogs/${id}`, data, {
          headers: { 
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
          }
        });
        alert('Blog updated successfully');
      } else {
        await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/admin/blogs`, data, {
          headers: { 
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
          }
        });
        alert('Blog created successfully');
      }
      navigate('/admin/blogs');
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.error || 'An error occurred');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading...</div>;
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 bg-[#F4F6F9] min-h-full font-['Inter',sans-serif]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-3">
          <Link to="/admin/blogs" className="p-2 bg-white rounded-lg border border-slate-200 hover:bg-slate-50 transition">
            <ArrowLeft size={18} className="text-slate-600" />
          </Link>
          <div>
            <h3 className="text-xl font-bold text-slate-800">
              {isEditMode ? 'Edit Blog' : 'Add New Blog'}
            </h3>
            <p className="text-sm text-slate-500 mt-1">Manage blog details, media, and SEO.</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={handleSave} 
            disabled={saving}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition shadow-sm disabled:opacity-50"
          >
            <Save size={16} />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Sidebar (Tabs) */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-2 flex flex-col gap-1 sticky top-6">
            <button
              onClick={() => setActiveTab('general')}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'general' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <MapPin size={18} />
              General Info
            </button>
            <button
              onClick={() => setActiveTab('media')}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'media' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <ImageIcon size={18} />
              Media & SEO
            </button>
          </div>
        </div>

        {/* Right Content Area */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            
            {/* GENERAL TAB */}
            {activeTab === 'general' && (
              <div className="space-y-5 animate-in fade-in duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Title <span className="text-red-500">*</span></label>
                    <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="Enter Title" className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none" required />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Category <span className="text-red-500">*</span></label>
                    <div className="flex items-center gap-2">
                      <select
                        name="category_id"
                        value={formData.category_id}
                        onChange={handleChange}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                        required
                      >
                        <option value="">Select Option</option>
                        {categories.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => setIsCategoryDrawerOpen(true)}
                        className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 flex items-center justify-center transition border border-indigo-100"
                        title="Manage Categories"
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tags</label>
                  <input type="text" name="tags" value={formData.tags} onChange={handleChange} placeholder="Enter Tags (comma separated)" className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Long Descriptions <span className="text-red-500">*</span></label>
                  <div className="h-64 mb-12">
                    <ReactQuill
                      value={formData.description}
                      onChange={handleQuillChange}
                      theme="snow"
                      placeholder="Write here.."
                      className="bg-white rounded-lg h-full"
                    />
                  </div>
                </div>
                
                <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" name="status" checked={formData.status === 1} onChange={(e) => setFormData(prev => ({...prev, status: e.target.checked ? 1 : 0}))} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                  <span className="text-sm font-medium text-slate-700">Published Status</span>
                </div>
              </div>
            )}

            {/* MEDIA & SEO TAB */}
            {activeTab === 'media' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Feature Image</label>
                  <input type="file" accept="image/*" onChange={handleImageChange} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
                  {featureImagePreview && (
                    <div className="mt-3 w-32 h-32 rounded-lg overflow-hidden border border-gray-200">
                      <img src={featureImagePreview} alt="Feature Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-3 mb-4">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" name="enable_seo" checked={formData.enable_seo === '1'} onChange={handleChange} className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
                    </label>
                    <span className="text-sm font-semibold text-slate-800">Allow SEO</span>
                  </div>

                  {formData.enable_seo === '1' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Meta Title <span className="text-red-500">*</span></label>
                        <input type="text" name="meta_title" value={formData.meta_title} onChange={handleChange} placeholder="Meta Title" className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Meta Keyward</label>
                        <input type="text" name="meta_keyward" value={formData.meta_keyward} onChange={handleChange} placeholder="Meta Keyward" className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Meta Description</label>
                        <textarea name="meta_description" value={formData.meta_description} onChange={handleChange} rows="3" placeholder="Meta Description" className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"></textarea>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <CategoryDrawer
        isOpen={isCategoryDrawerOpen}
        onClose={() => setIsCategoryDrawerOpen(false)}
        onCategoryAdded={(newCat) => {
          setCategories([newCat, ...categories]);
          setFormData(prev => ({ ...prev, category_id: newCat.id.toString() }));
        }}
      />
    </div>
  );
}
