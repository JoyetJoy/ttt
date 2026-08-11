import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate, useParams, useLocation, Link } from 'react-router-dom';
import { Save, ArrowLeft, Image as ImageIcon, FileText, HelpCircle, List, Settings, X, Plus, Trash2, Edit2 } from 'lucide-react';

const TABS = [
  { id: 'general', label: 'General Info', icon: List },
  { id: 'faqs', label: 'FAQs', icon: HelpCircle },
  { id: 'documents', label: 'Required Documents', icon: FileText },
  { id: 'media', label: 'Media & SEO', icon: ImageIcon },
];

export default function AdminVisaForm() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  
  const isEdit = Boolean(id);
  const isView = location.pathname.includes('/view/');

  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  const [categories, setCategories] = useState([]);
  const [countries, setCountries] = useState([]);

  // Category Modal State
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categoryForm, setCategoryForm] = useState({ id: null, name: '', status: 1 });
  const [savingCategory, setSavingCategory] = useState(false);

  // Country Modal State
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [countryForm, setCountryForm] = useState({ id: null, name: '' });
  const [savingCountry, setSavingCountry] = useState(false);

  const [featuresImageFile, setFeaturesImageFile] = useState(null);
  const [featuresImagePreview, setFeaturesImagePreview] = useState(null);

  const [metaImageFile, setMetaImageFile] = useState(null);
  const [metaImagePreview, setMetaImagePreview] = useState(null);

  const [faqs, setFaqs] = useState([]);
  const [includes, setIncludes] = useState([]);

  const [formData, setFormData] = useState({
    title: '',
    category_id: '',
    country_id: '',
    status: 1,
    maximum_stay: '',
    processing: '',
    validity: '',
    visa_mode: '',
    min_people: '',
    max_people: '',
    availability: '',
    cost: '',
    price_symbol: '',
    enable_seo: '0',
    meta_title: '',
    meta_desc: ''
  });

  const fetchCategories = () => {
    fetch(`${import.meta.env.VITE_API_URL}/visa-categories`)
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(console.error);
  };

  const fetchCountries = () => {
    fetch(`${import.meta.env.VITE_API_URL}/locations/countries`)
      .then(res => res.json())
      .then(data => setCountries(data))
      .catch(console.error);
  };

  useEffect(() => {
    fetchCategories();
    fetchCountries();

    if (isEdit) {
      fetch(`${import.meta.env.VITE_API_URL}/admin/visas/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        setFormData({
          title: data.title || '',
          category_id: data.category_id || '',
          country_id: data.country_id || '',
          status: data.status,
          maximum_stay: data.maximum_stay || '',
          processing: data.processing || '',
          validity: data.validity || '',
          visa_mode: data.visa_mode || '',
          min_people: data.min_people || '',
          max_people: data.max_people || '',
          availability: data.availability || '',
          cost: data.cost || '',
          price_symbol: data.price_symbol || '',
          enable_seo: data.enable_seo || '0',
          meta_title: data.meta_title || '',
          meta_desc: data.meta_desc || ''
        });
        
        const parseArray = (val) => {
          if (!val) return [];
          if (Array.isArray(val)) return val;
          if (typeof val === 'string') {
            try { const parsed = JSON.parse(val); return Array.isArray(parsed) ? parsed : []; } catch(e) { return []; }
          }
          return [];
        };

        if (data.faqs) {
          setFaqs(parseArray(data.faqs));
        }
        if (data.includes) {
          setIncludes(parseArray(data.includes));
        }

        if (data.features_image) setFeaturesImagePreview(data.features_image);
        if (data.meta_img) setMetaImagePreview(data.meta_img);
        
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
    }
  }, [id, token, isEdit]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (checked ? 1 : 0) : value
    }));
  };

  const handleListChange = (setter, index, field, value) => {
    setter(prev => {
      const newList = [...prev];
      newList[index][field] = value;
      return newList;
    });
  };

  const handleFileChange = (e, setFile, setPreview) => {
    const file = e.target.files[0];
    if (file) {
      setFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    if (!formData.title.trim()) return alert('Visa Title is required.');
    
    setSaving(true);
    try {
      const url = isEdit ? `${import.meta.env.VITE_API_URL}/admin/visas/${id}` : `${import.meta.env.VITE_API_URL}/admin/visas`;
      const method = isEdit ? 'PUT' : 'POST';
      
      const payload = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== undefined) {
          payload.append(key, formData[key]);
        }
      });
      
      payload.append('faqs', JSON.stringify(faqs));
      payload.append('includes', JSON.stringify(includes));

      if (featuresImageFile) payload.append('features_image', featuresImageFile);
      if (metaImageFile) payload.append('meta_img', metaImageFile);

      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: payload
      });

      if (!res.ok) throw new Error('Failed to save visa');
      navigate('/admin/visas');
    } catch (err) {
      console.error(err);
      alert('Error saving visa');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!categoryForm.name.trim()) return alert('Category name is required.');
    
    setSavingCategory(true);
    try {
      const url = categoryForm.id 
        ? `${import.meta.env.VITE_API_URL}/visa-categories/${categoryForm.id}`
        : `${import.meta.env.VITE_API_URL}/visa-categories`;
      const method = categoryForm.id ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(categoryForm)
      });
      if (res.ok) {
        setCategoryForm({ id: null, name: '', status: 1 });
        fetchCategories(); // Refresh list
      } else {
        alert('Failed to save category');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingCategory(false);
    }
  };

  const handleDeleteCategory = async (catId) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/visa-categories/${catId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchCategories(); // Refresh list
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveCountry = async (e) => {
    e.preventDefault();
    if (!countryForm.name.trim()) return alert('Country name is required.');
    
    setSavingCountry(true);
    try {
      const url = countryForm.id 
        ? `${import.meta.env.VITE_API_URL}/locations/${countryForm.id}`
        : `${import.meta.env.VITE_API_URL}/locations`;
      const method = countryForm.id ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name: countryForm.name })
      });
      if (res.ok) {
        setCountryForm({ id: null, name: '' });
        fetchCountries();
      } else {
        alert('Failed to save country');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingCountry(false);
    }
  };

  const handleDeleteCountry = async (id) => {
    if (!window.confirm('Are you sure you want to delete this country?')) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/locations/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchCountries();
      } else {
        alert('Failed to delete country. It might be in use.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading...</div>;

  return (
    <div className="p-4 md:p-6 lg:p-8 bg-[#F4F6F9] min-h-full font-['Inter',sans-serif]">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-3">
          <Link to="/admin/visas" className="p-2 bg-white rounded-lg border border-slate-200 hover:bg-slate-50 transition">
            <ArrowLeft size={18} className="text-slate-600" />
          </Link>
          <div>
            <h3 className="text-xl font-bold text-slate-800">{!isEdit ? 'Add New Visa' : isView ? 'Advanced Visa Details' : 'Edit Basic Info'}</h3>
            <p className="text-sm text-slate-500 mt-1">{isView ? 'Fill in the remaining details and policies.' : 'Enter the basic information. You can add pricing, media, and other details later.'}</p>
          </div>
        </div>
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition shadow-sm disabled:opacity-50">
          <Save size={16} /> {saving ? 'Saving...' : 'Save Visa'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Tabs */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-2 flex flex-col gap-1 sticky top-6">
            {TABS.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                    isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Icon size={16} className={isActive ? 'text-indigo-600' : 'text-slate-400'} />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Form Content Area */}
        <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-slate-100 p-4 md:p-6">
          
          {/* GENERAL INFO TAB */}
          {activeTab === 'general' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-2">
              <div>
                <h4 className="font-semibold text-slate-800 text-sm">Visa Status</h4>
                <p className="text-xs text-slate-500">Enable this to make the visa visible to users.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" name="status" className="sr-only peer" checked={formData.status === 1} onChange={handleChange} />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Name of the visa <span className="text-red-500">*</span></label>
                <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="e.g. Dubai Tourist Visa" className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none" required />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-slate-700">Visa Category <span className="text-red-500">*</span></label>
                  <button 
                    type="button" 
                    onClick={() => setShowCategoryModal(true)}
                    className="w-6 h-6 flex items-center justify-center bg-indigo-50 text-indigo-600 rounded-full hover:bg-indigo-100 transition-colors"
                    title="Manage Categories"
                  >
                    <Plus size={14} strokeWidth={2.5} />
                  </button>
                </div>
                <select name="category_id" value={formData.category_id} onChange={handleChange} className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-white">
                  <option value="">Select Category</option>
                  {categories
                    .filter(c => c.status === 1 || String(c.id) === String(formData.category_id))
                    .map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-slate-700">Country <span className="text-red-500">*</span></label>
                  <button 
                    type="button" 
                    onClick={() => setShowCountryModal(true)}
                    className="w-6 h-6 flex items-center justify-center bg-indigo-50 text-indigo-600 rounded-full hover:bg-indigo-100 transition-colors"
                    title="Manage Countries"
                  >
                    <Plus size={14} strokeWidth={2.5} />
                  </button>
                </div>
                <select name="country_id" value={formData.country_id} onChange={handleChange} className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-white">
                  <option value="">Select Country</option>
                  {countries.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Maximum Stays <span className="text-red-500">*</span></label>
                  <input type="text" name="maximum_stay" value={formData.maximum_stay} onChange={handleChange} placeholder="e.g. 30 Days" className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Processing Time <span className="text-red-500">*</span></label>
                  <input type="text" name="processing" value={formData.processing} onChange={handleChange} placeholder="e.g. 3-5 Working Days" className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Validity <span className="text-red-500">*</span></label>
                  <input type="text" name="validity" value={formData.validity} onChange={handleChange} placeholder="e.g. 60 Days" className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Visa Mode <span className="text-red-500">*</span></label>
                  <input type="text" name="visa_mode" value={formData.visa_mode} onChange={handleChange} placeholder="e.g. E-Visa" className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Minimum People</label>
                  <input type="text" name="min_people" value={formData.min_people} onChange={handleChange} placeholder="e.g. 1" className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Maximum People</label>
                  <input type="text" name="max_people" value={formData.max_people} onChange={handleChange} placeholder="e.g. 10" className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Availability</label>
                  <input type="text" name="availability" value={formData.availability} onChange={handleChange} placeholder="e.g. Daily" className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200" />
                </div>
                <div className="md:col-span-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Cost Summary <span className="text-red-500">*</span></label>
                  <input type="number" name="cost" value={formData.cost} onChange={handleChange} placeholder="e.g. 5000" className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200" required />
                </div>

              </div>
            </div>
            )}

            {/* FAQs TAB */}
            {activeTab === 'faqs' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <DynamicListSection title="FAQs" items={faqs} setItems={setFaqs} emptyItem={{question:'', answer:''}}>
                  {(item, idx) => (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input type="text" value={item.question} onChange={e => handleListChange(setFaqs, idx, 'question', e.target.value)} placeholder="Enter Question" className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200" />
                      <input type="text" value={item.answer} onChange={e => handleListChange(setFaqs, idx, 'answer', e.target.value)} placeholder="Enter Answer" className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200" />
                    </div>
                  )}
                </DynamicListSection>
              </div>
            )}

            {/* Required Documents TAB */}
            {activeTab === 'documents' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <DynamicListSection title="Required Documents" items={includes} setItems={setIncludes} emptyItem={{item:''}}>
                  {(item, idx) => (
                    <input type="text" value={item.item} onChange={e => handleListChange(setIncludes, idx, 'item', e.target.value)} placeholder="Enter required document" className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200" />
                  )}
                </DynamicListSection>
              </div>
            )}

            {/* MEDIA & SEO TAB */}
            {activeTab === 'media' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                {/* Feature Image */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">Feature Image (Required)</label>
                  <div className="border border-dashed border-gray-300 rounded-lg p-4 bg-gray-50 flex flex-col items-center justify-center">
                    {featuresImagePreview ? (
                      <div className="relative mb-3">
                        <img src={featuresImagePreview} alt="Feature" className="h-32 object-contain rounded-lg border border-gray-200 bg-white" />
                        <button type="button" onClick={() => { setFeaturesImageFile(null); setFeaturesImagePreview(null); }} className="absolute -top-2 -right-2 w-6 h-6 flex items-center justify-center bg-white text-red-500 border border-slate-200 hover:bg-red-50 rounded-full shadow-md transition-colors"><X size={14}/></button>
                      </div>
                    ) : (
                      <div className="text-gray-400 mb-3"><ImageIcon size={48} /></div>
                    )}
                    <label className="bg-white px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium cursor-pointer hover:bg-gray-50">
                      Choose File
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, setFeaturesImageFile, setFeaturesImagePreview)} />
                    </label>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-slate-800 text-[15px]">Allow SEO</h4>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" name="enable_seo" className="sr-only peer" checked={Number(formData.enable_seo) === 1} onChange={handleChange} />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>

                  {Number(formData.enable_seo) === 1 && (
                    <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Meta Title</label>
                        <input type="text" name="meta_title" value={formData.meta_title} onChange={handleChange} placeholder="Meta Title" className="w-full px-3 py-1.5 text-sm rounded-lg border border-gray-200" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Meta Description</label>
                        <textarea name="meta_desc" value={formData.meta_desc} onChange={handleChange} placeholder="Meta Description" rows="3" className="w-full px-3 py-1.5 text-sm rounded-lg border border-gray-200"></textarea>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-2">Meta Image</label>
                        <div className="border border-dashed border-gray-300 rounded-lg p-3 bg-white flex flex-col items-center justify-center">
                          {metaImagePreview ? (
                            <div className="relative mb-2">
                              <img src={metaImagePreview} alt="Meta" className="h-24 object-contain rounded-lg border border-gray-200" />
                              <button type="button" onClick={() => { setMetaImageFile(null); setMetaImagePreview(null); }} className="absolute -top-2 -right-2 w-6 h-6 flex items-center justify-center bg-white text-red-500 border border-slate-200 hover:bg-red-50 rounded-full shadow-md transition-colors"><X size={12}/></button>
                            </div>
                          ) : null}
                          <label className="bg-slate-100 px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium cursor-pointer hover:bg-slate-200">
                            Upload Meta Image
                            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, setMetaImageFile, setMetaImagePreview)} />
                          </label>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
        </div>
      </div>

      {/* Categories Modal Sidebar */}
      <div className={`fixed inset-y-0 right-0 w-full max-w-sm bg-white shadow-2xl transform transition-transform duration-300 z-50 flex flex-col ${showCategoryModal ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <h3 className="font-bold text-base text-slate-800">Manage Visa Categories</h3>
          <button onClick={() => setShowCategoryModal(false)} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 transition bg-slate-50 hover:bg-slate-100 rounded-full">
            <X size={18} />
          </button>
        </div>

        <div className="p-4 border-b border-slate-100 bg-slate-50">
          <form onSubmit={handleSaveCategory}>
            <div className="flex flex-col gap-3">
              <h4 className="text-xs font-semibold text-slate-700">{categoryForm.id ? 'Edit Category' : 'Add New Category'}</h4>
              <div>
                <input 
                  type="text" 
                  value={categoryForm.name} 
                  onChange={e => setCategoryForm({...categoryForm, name: e.target.value})}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-indigo-500 bg-white"
                  placeholder="Category Name (e.g. Tourist Visa)"
                  required
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="catStatus" 
                    checked={categoryForm.status === 1}
                    onChange={e => setCategoryForm({...categoryForm, status: e.target.checked ? 1 : 0})}
                    className="rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                  />
                  <label htmlFor="catStatus" className="text-xs font-medium text-slate-600">Active</label>
                </div>
                <div className="flex gap-2">
                  {categoryForm.id && (
                    <button 
                      type="button" 
                      onClick={() => setCategoryForm({ id: null, name: '', status: 1 })}
                      className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition shadow-sm hover:bg-slate-300"
                    >
                      Cancel
                    </button>
                  )}
                  <button 
                    type="submit" 
                    disabled={savingCategory}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition shadow-sm disabled:opacity-50"
                  >
                    {savingCategory ? (categoryForm.id ? 'Updating...' : 'Adding...') : (categoryForm.id ? 'Update' : 'Add')}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <h4 className="text-xs font-semibold text-slate-500 mb-3 uppercase tracking-wider">Existing Categories</h4>
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full text-left border-collapse bg-white">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="py-2 px-3 text-xs font-semibold text-slate-600">Category</th>
                  <th className="py-2 px-3 text-xs font-semibold text-slate-600 text-center">Status</th>
                  <th className="py-2 px-3 text-xs font-semibold text-slate-600 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="py-4 text-center text-sm text-slate-500">No categories found.</td>
                  </tr>
                ) : (
                  categories.map(cat => (
                    <tr key={cat.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition">
                      <td className="py-2 px-3 text-sm font-medium text-slate-700">{cat.name}</td>
                      <td className="py-2 px-3 text-center">
                        {cat.status === 1 ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-100 text-emerald-800">Active</span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-800">Inactive</span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-right">
                        <button 
                          onClick={() => setCategoryForm(cat)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition mr-1"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDeleteCategory(cat.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {/* Overlay */}
      {(showCategoryModal || showCountryModal) && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          onClick={() => { setShowCategoryModal(false); setShowCountryModal(false); }}
        />
      )}

      {/* Country Modal Sidebar */}
      <div className={`fixed inset-y-0 right-0 w-full max-w-sm bg-white shadow-2xl transform transition-transform duration-300 z-50 flex flex-col ${showCountryModal ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <h3 className="font-bold text-base text-slate-800">Manage Countries</h3>
          <button onClick={() => setShowCountryModal(false)} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 transition bg-slate-50 hover:bg-slate-100 rounded-full">
            <X size={18} />
          </button>
        </div>

        <div className="p-4 border-b border-slate-100 bg-slate-50">
          <form onSubmit={handleSaveCountry}>
            <div className="flex flex-col gap-3">
              <h4 className="text-xs font-semibold text-slate-700">{countryForm.id ? 'Edit Country' : 'Add New Country'}</h4>
              <div>
                <input 
                  type="text" 
                  value={countryForm.name} 
                  onChange={e => setCountryForm({ name: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-indigo-500 bg-white"
                  placeholder="Country Name (e.g. UAE)"
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                {countryForm.id && (
                  <button 
                    type="button" 
                    onClick={() => setCountryForm({ id: null, name: '' })}
                    className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition shadow-sm hover:bg-slate-300"
                  >
                    Cancel
                  </button>
                )}
                <button 
                  type="submit" 
                  disabled={savingCountry}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition shadow-sm disabled:opacity-50"
                >
                  {savingCountry ? (countryForm.id ? 'Updating...' : 'Adding...') : (countryForm.id ? 'Update' : 'Add')}
                </button>
              </div>
            </div>
          </form>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <h4 className="text-xs font-semibold text-slate-500 mb-3 uppercase tracking-wider">Existing Countries</h4>
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full text-left border-collapse bg-white">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="py-2 px-3 text-xs font-semibold text-slate-600">Country</th>
                  <th className="py-2 px-3 text-xs font-semibold text-slate-600 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {countries.length === 0 ? (
                  <tr>
                    <td colSpan="2" className="py-4 text-center text-sm text-slate-500">No countries found.</td>
                  </tr>
                ) : (
                  countries.map(country => (
                    <tr key={country.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition">
                      <td className="py-2 px-3 text-sm font-medium text-slate-700">{country.name}</td>
                      <td className="py-2 px-3 text-right">
                        <button 
                          onClick={() => setCountryForm(country)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition mr-1"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDeleteCountry(country.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  );
}

// Helper for dynamic lists
const DynamicListSection = ({ title, items = [], setItems, emptyItem, children }) => (
  <div>
    <div className="flex items-center justify-between mb-4">
      <h4 className="font-bold text-slate-800 text-[15px]">{title}</h4>
    </div>
    <div className="space-y-3 mb-4">
      {(Array.isArray(items) ? items : []).map((item, idx) => (
        <div key={idx} className="bg-white py-3 pl-4 pr-14 rounded-lg border border-gray-200 relative shadow-[0_1px_2px_rgb(0,0,0,0.02)]">
          <button type="button" onClick={() => setItems(prev => prev.filter((_, i) => i !== idx))} className="absolute top-1/2 -translate-y-1/2 right-3 w-8 h-8 flex items-center justify-center bg-gray-100 text-red-500 hover:bg-gray-200 rounded transition">
            <X size={14} strokeWidth={3} />
          </button>
          <div className="w-full">
            {children(item, idx)}
          </div>
        </div>
      ))}
    </div>
    <button type="button" onClick={() => setItems(prev => [...prev, emptyItem])} className="flex items-center gap-2 text-indigo-600 bg-indigo-50/80 px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-indigo-100 transition w-fit">
      <Plus size={16} strokeWidth={2.5} /> Add {title} Item
    </button>
  </div>
);
