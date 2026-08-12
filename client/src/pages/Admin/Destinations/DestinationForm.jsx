import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { Save, ArrowLeft, Image as ImageIcon, MapPin, Search, Plus, X, Settings } from 'lucide-react';
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

export default function DestinationForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { token } = useAuth();
  
  const [activeTab, setActiveTab] = useState('general');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEdit);
  const [masterAttributes, setMasterAttributes] = useState([]);
  const [showAttributeModal, setShowAttributeModal] = useState(false);
  const [attributeModalData, setAttributeModalData] = useState({ id: null, name: '', terms: [] });
  const [attributeSaving, setAttributeSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    population: '',
    city: '',
    language: '',
    currency: '',
    short_desc: '',
    enable_seo: '0',
    meta_title: '',
    meta_desc: '',
    destination: '',
    status: 1,
    attribute_terms: []
  });

  const [featuresImageFile, setFeaturesImageFile] = useState(null);
  const [featuresImagePreview, setFeaturesImagePreview] = useState(null);
  
  const [existingGalleries, setExistingGalleries] = useState([]);
  const [newGalleryFiles, setNewGalleryFiles] = useState([]);
  const [galleryPreviews, setGalleryPreviews] = useState([]);
  const [deletedGalleries, setDeletedGalleries] = useState([]);

  useEffect(() => {
    if (isEdit) {
      const fetchDestination = async () => {
        try {
          const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/destinations/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (!res.ok) throw new Error('Failed to fetch destination');
          const data = await res.json();
          
          setFormData({
            title: data.title || '',
            content: data.content || '',
            population: data.population || '',
            city: data.city || '',
            language: data.language || '',
            currency: data.currency || '',
            short_desc: data.short_desc || '',
            enable_seo: data.enable_seo || '0',
            attribute_terms: typeof data.attribute_terms === 'string' ? (()=>{try{return JSON.parse(data.attribute_terms)}catch(e){return []}})() : (data.attribute_terms || []),
            meta_title: data.meta_title || '',
            meta_desc: data.meta_desc || '',
            destination: data.destination || '',
            status: data.status !== undefined ? data.status : 1
          });

          if (data.features_image) {
            setFeaturesImagePreview(data.features_image);
          }
          if (data.destination_galleries) {
            setExistingGalleries(data.destination_galleries);
          }

        } catch (error) {
          console.error(error);
          alert('Error loading destination data');
        } finally {
          setLoading(false);
        }
      };
      fetchDestination();
    }
  }, [id, isEdit, token]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (checked ? '1' : '0') : value
    }));
  };

  const handleContentChange = (content) => {
    setFormData(prev => ({ ...prev, content }));
  };

  const handleFeaturesImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFeaturesImageFile(file);
      setFeaturesImagePreview(URL.createObjectURL(file));
    }
  };

  const handleGalleryImagesChange = (e) => {
    const files = Array.from(e.target.files);
    setNewGalleryFiles(prev => [...prev, ...files]);
    
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setGalleryPreviews(prev => [...prev, ...newPreviews]);
  };

  const removeNewGalleryImage = (index) => {
    setNewGalleryFiles(prev => prev.filter((_, i) => i !== index));
    setGalleryPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingGalleryImage = (imgId) => {
    setDeletedGalleries(prev => [...prev, imgId]);
    setExistingGalleries(prev => prev.filter(img => img.id !== imgId));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const submitData = new FormData();
      
      Object.keys(formData).forEach(key => {
        submitData.append(key, formData[key] === null ? '' : formData[key]);
      });

      if (featuresImageFile) {
        submitData.append('features_image', featuresImageFile);
      }
      
      newGalleryFiles.forEach(file => {
        submitData.append('gallery_images', file);
      });

      if (deletedGalleries.length > 0) {
        submitData.append('deletedGalleries', JSON.stringify(deletedGalleries));
      }

      const method = isEdit ? 'PUT' : 'POST';
      const url = isEdit 
        ? `${import.meta.env.VITE_API_URL}/admin/destinations/${id}`
        : `${import.meta.env.VITE_API_URL}/admin/destinations`;

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: submitData
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to save');
      }
      
      alert(`Destination ${isEdit ? 'updated' : 'created'} successfully!`);
      navigate('/admin/destinations');
    } catch (error) {
      console.error(error);
      alert(error.message || 'Error saving destination');
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
          <Link to="/admin/destinations" className="p-2 bg-white rounded-lg border border-slate-200 hover:bg-slate-50 transition">
            <ArrowLeft size={18} className="text-slate-600" />
          </Link>
          <div>
            <h3 className="text-xl font-bold text-slate-800">
              {isEdit ? 'Edit Destination' : 'Add New Destination'}
            </h3>
            <p className="text-sm text-slate-500 mt-1">Manage destination details, media, and SEO.</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={handleSave} 
            disabled={saving}
            className="flex items-center gap-2 bg-[#0081C9] hover:bg-[#0069a6] text-white px-5 py-2.5 rounded-lg text-sm font-medium transition shadow-sm disabled:opacity-50"
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
                    <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="Name of the tour" className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#0081C9] outline-none" required />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Destination</label>
                    <input type="text" name="destination" value={formData.destination} onChange={handleChange} placeholder="Destination" className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#0081C9] outline-none" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Capital City <span className="text-red-500">*</span></label>
                    <input type="text" name="city" value={formData.city} onChange={handleChange} placeholder="City" className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#0081C9] outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Population <span className="text-red-500">*</span></label>
                    <input type="text" name="population" value={formData.population} onChange={handleChange} placeholder="Population" className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#0081C9] outline-none" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Language <span className="text-red-500">*</span></label>
                    <input type="text" name="language" value={formData.language} onChange={handleChange} placeholder="Language" className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#0081C9] outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Currency <span className="text-red-500">*</span></label>
                    <input type="text" name="currency" value={formData.currency} onChange={handleChange} placeholder="Currency" className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#0081C9] outline-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Short Description</label>
                  <textarea name="short_desc" value={formData.short_desc} onChange={handleChange} rows="3" placeholder="Short description" className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#0081C9] outline-none"></textarea>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Content <span className="text-red-500">*</span></label>
                  <ReactQuill
                    value={formData.content}
                    onChange={handleContentChange}
                    theme="snow"
                    placeholder="Write here.."
                    className="bg-white rounded-lg"
                    modules={{
                      toolbar: [
                        [{ 'header': [1, 2, 3, false] }],
                        ['bold', 'italic', 'underline', 'strike'],
                        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                        ['link', 'clean']
                      ]
                    }}
                  />
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
            
          {activeTab === 'attributes' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg text-slate-800">Destination Attributes</h3>
                <button type="button" onClick={() => handleOpenAttributeModal()} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition">
                  <Plus size={16} /> Manage Attributes
                </button>
              </div>
              
              {masterAttributes.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <p className="text-slate-500 mb-2">No master attributes defined yet.</p>
                  <button type="button" onClick={() => handleOpenAttributeModal()} className="text-indigo-600 font-medium hover:underline">Create your first attribute</button>
                </div>
              ) : (
                masterAttributes.map(attr => (
                  <div key={attr.id} className="mb-6">
                    <h4 className="font-semibold text-slate-800 text-sm mb-3 pb-2 border-b border-slate-100">{attr.name}</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {attr.destination_attribute_terms.map(term => (
                        <label key={term.id} className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={formData.attribute_terms.includes(term.name)}
                            onChange={(e) => {
                              const newTerms = e.target.checked 
                                ? [...formData.attribute_terms, term.name] 
                                : formData.attribute_terms.filter(t => t !== term.name);
                              setFormData({...formData, attribute_terms: newTerms});
                            }}
                            className="rounded border-gray-300 text-indigo-600 focus:ring-[#0081C9]" 
                          />
                          {term.name}
                        </label>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'media' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Feature Image</label>
                  <input type="file" accept="image/*" onChange={handleFeaturesImageChange} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
                  {featuresImagePreview && (
                    <div className="mt-3 w-32 h-32 rounded-lg overflow-hidden border border-gray-200">
                      <img src={featuresImagePreview} alt="Feature Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Image Gallery</label>
                  <input type="file" accept="image/*" multiple onChange={handleGalleryImagesChange} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
                  
                  <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-4">
                    {/* Existing Galleries */}
                    {existingGalleries.map((img) => (
                      <div key={img.id} className="relative w-full aspect-square rounded-lg overflow-hidden border border-gray-200 group">
                        <img src={img.image} alt="Gallery" className="w-full h-full object-cover" />
                        <button type="button" onClick={() => removeExistingGalleryImage(img.id)} className="absolute top-2 right-2 bg-red-500 text-white w-7 h-7 flex items-center justify-center rounded-full transition shadow-sm hover:bg-red-600">
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                    
                    {/* New Gallery Previews */}
                    {galleryPreviews.map((src, idx) => (
                      <div key={`new-${idx}`} className="relative w-full aspect-square rounded-lg overflow-hidden border border-indigo-200 group">
                        <img src={src} alt="New Gallery Preview" className="w-full h-full object-cover" />
                        <button type="button" onClick={() => removeNewGalleryImage(idx)} className="absolute top-2 right-2 bg-red-500 text-white w-7 h-7 flex items-center justify-center rounded-full transition shadow-sm hover:bg-red-600">
                          <X size={14} />
                        </button>
                        <div className="absolute bottom-0 left-0 right-0 bg-indigo-500/80 text-white text-[10px] text-center py-1 font-medium">New</div>
                      </div>
                    ))}
                  </div>
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
                        <input type="text" name="meta_title" value={formData.meta_title} onChange={handleChange} placeholder="Meta Title" className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#0081C9] outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Meta Description</label>
                        <textarea name="meta_desc" value={formData.meta_desc} onChange={handleChange} rows="3" placeholder="Meta Description" className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#0081C9] outline-none"></textarea>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {showAttributeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowAttributeModal(false)}></div>
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h3 className="font-bold text-lg text-slate-800">{attributeModalData.id ? 'Edit Attribute' : 'Create New Attribute'}</h3>
              <button onClick={() => setShowAttributeModal(false)} className="text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 p-2 rounded-full transition">
                <X size={18} />
              </button>
            </div>
            
            <div className="p-5 overflow-y-auto flex-1">
              <form onSubmit={handleSaveAttribute} className="mb-8">
                <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Attribute Name <span className="text-red-500">*</span></label>
                    <input type="text" value={attributeModalData.name} onChange={e => setAttributeModalData({...attributeModalData, name: e.target.value})} placeholder="e.g. Dietary Requirements" className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 outline-none focus:border-indigo-500 bg-white" required />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Terms (List) <span className="text-red-500">*</span></label>
                    <DynamicListSection 
                      title="Term"
                      items={attributeModalData.terms} 
                      setItems={(updater) => setAttributeModalData(prev => ({ ...prev, terms: typeof updater === 'function' ? updater(prev.terms) : updater }))} 
                      emptyItem={{item:''}}
                    >
                      {(term, idx) => (
                        <input 
                          type="text" 
                          value={term.item || term} 
                          onChange={e => {
                            const newTerms = [...attributeModalData.terms];
                            newTerms[idx] = e.target.value;
                            setAttributeModalData({...attributeModalData, terms: newTerms});
                          }} 
                          placeholder="e.g. Vegan" 
                          className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200" 
                        />
                      )}
                    </DynamicListSection>
                  </div>
                  <div className="flex justify-end pt-2">
                    <button type="submit" disabled={attributeSaving} className="bg-[#0081C9] hover:bg-[#0069a6] text-white px-5 py-2 rounded-lg text-sm font-medium transition shadow-sm disabled:opacity-50">
                      {attributeSaving ? 'Saving...' : 'Save Attribute'}
                    </button>
                  </div>
                </div>
              </form>

              <div>
                <h4 className="font-bold text-sm text-slate-800 mb-3">Existing Attributes</h4>
                {masterAttributes.map(attr => (
                  <div key={attr.id} className="flex flex-col p-3 border border-slate-200 rounded-lg bg-white mb-2">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-sm text-slate-800">{attr.name}</span>
                      <div className="flex gap-2">
                        <button type="button" onClick={() => handleOpenAttributeModal(attr)} className="text-xs font-medium text-indigo-600 hover:text-indigo-800 px-2 py-1 bg-indigo-50 hover:bg-indigo-100 rounded transition">Edit</button>
                        <button type="button" onClick={() => handleDeleteAttribute(attr.id)} className="text-xs font-medium text-red-600 hover:text-red-800 px-2 py-1 bg-red-50 hover:bg-red-100 rounded transition">Delete</button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {attr.destination_attribute_terms.map(t => (
                        <span key={t.id} className="text-[11px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full border border-slate-200">{t.name}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const DynamicListSection = ({ title, commonTitleField, commonTitleValue, onCommonTitleChange, items = [], setItems, emptyItem, children }) => {
  const showTitleInput = typeof commonTitleField === 'string' && commonTitleField.length > 0;
  return (
    <div className="pt-6 border-t border-slate-100 first:pt-0 first:border-0">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-bold text-slate-800 text-[15px]">{title}</h4>
        {showTitleInput && (
          <input type="text" name={commonTitleField} value={commonTitleValue} onChange={onCommonTitleChange} placeholder={`Enter ${title} Title`} className="w-1/2 px-4 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#0081C9] outline-none bg-white" />
        )}
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
};
