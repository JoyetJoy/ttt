import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { Save, Image as ImageIcon, MapPin, Tag, List, Settings, X, Plus, Edit2, Trash2, FileText } from 'lucide-react';
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';

const mapContainerStyle = { width: '100%', height: '300px', borderRadius: '0.5rem' };
const defaultCenter = { lat: 20.5937, lng: 78.9629 }; 

export default function AdminActivityForm() {
  const { id } = useParams();
  const location = useLocation();
  const isEdit = Boolean(id);
  const isView = location.pathname.includes('/view/');
  const { token } = useAuth();
  const navigate = useNavigate();

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: "AIzaSyAX_1lQpTBdnMvEOpeXdu9txMXrGU0mJy8",
    libraries: ['geometry', 'drawing', 'places']
  });

  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [locationModalType, setLocationModalType] = useState('country');
  const [locationModalInput, setLocationModalInput] = useState('');
  const [locationModalEditId, setLocationModalEditId] = useState(null);
  const [locationModalSaving, setLocationModalSaving] = useState(false);

  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  const [featureImageFile, setFeatureImageFile] = useState(null);
  const [featureImagePreview, setFeatureImagePreview] = useState(null);
  
  const [youtubeImageFile, setYoutubeImageFile] = useState(null);
  const [youtubeImagePreview, setYoutubeImagePreview] = useState(null);

  const [iconImageFile, setIconImageFile] = useState(null);
  const [iconImagePreview, setIconImagePreview] = useState(null);

  const [existingGalleries, setExistingGalleries] = useState([]);
  const [newGalleryFiles, setNewGalleryFiles] = useState([]);
  const [galleryPreviews, setGalleryPreviews] = useState([]);
  const [deletedGalleries, setDeletedGalleries] = useState([]);

  const [masterAttributes, setMasterAttributes] = useState([]);
  const [showAttributeModal, setShowAttributeModal] = useState(false);
  const [attributeModalData, setAttributeModalData] = useState({ id: null, name: '', termsString: '' });
  const [attributeSaving, setAttributeSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: '', slug: '', shoulder: '', content: '',
    youtube_video: '',
    faq_title: 'FAQs', faqs: [],
    include_title: 'Includes', includes: [],
    exclude_title: 'Excludes', excludes: [],
    highlight_title: 'Highlights', highlights: [],
    plan_title: 'Activities Plan', activities_plan: [],
    days: '', nights: '', max_people: '', min_advance_reservations: '', min_stay: '',
    price: 0, sale_price: 0, child_price: 0, price_symbol: '', enable_service_fee: 2, service_fees: [],
    address: '', country_id: '', state_id: '', city_id: '', zip_code: '',
    map_lat: '', map_lng: '',
    meta_title: '', meta_desc: '', meta_keyward: '', meta_img: '',
    attribute_terms: [], enable_seo: '0', status: 1
  });


  const fetchLocations = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/locations/countries`);
      setCountries(await res.json());
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    if (formData.country_id) {
      fetch(`${import.meta.env.VITE_API_URL}/locations/states/${formData.country_id}`)
        .then(res => res.json())
        .then(data => setStates(data))
        .catch(console.error);
    } else { setStates([]); }
  }, [formData.country_id]);

  useEffect(() => {
    if (formData.state_id) {
      fetch(`${import.meta.env.VITE_API_URL}/locations/cities/${formData.state_id}`)
        .then(res => res.json())
        .then(data => setCities(data))
        .catch(console.error);
    } else { setCities([]); }
  }, [formData.state_id]);

  const fetchActivity = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/activities/${id}`);
      const data = await res.json();
      const parseJSON = (str) => {
        try { return str ? JSON.parse(str) : []; } 
        catch(e) { return []; }
      };

      setFormData({
        title: data.title || '', slug: data.slug || '', shoulder: data.shoulder || '',
        content: data.content || '', youtube_video: data.youtube_video || '',
        faq_title: data.faq_title || 'FAQs', faqs: parseJSON(data.faqs),
        include_title: data.include_title || 'Includes', includes: parseJSON(data.includes),
        exclude_title: data.exclude_title || 'Excludes', excludes: parseJSON(data.excludes),
        highlight_title: data.highlight_title || 'Highlights', highlights: parseJSON(data.highlights),
        plan_title: data.plan_title || 'Activities Plan', activities_plan: parseJSON(data.activities_plan),
        days: data.days || '', nights: data.nights || '', max_people: data.max_people || '',
        min_advance_reservations: data.min_advance_reservations || '', min_stay: data.min_stay || '',
        price: data.price || 0, sale_price: data.sale_price || 0, child_price: data.child_price || 0, price_symbol: data.price_symbol || '',
        enable_service_fee: data.enable_service_fee || 2, service_fees: parseJSON(data.service_fees),
        address: data.address || '', country_id: data.country_id || '', state_id: data.state_id || '',
        city_id: data.city_id || '', zip_code: data.zip_code || '',
        map_lat: data.map_lat || '', map_lng: data.map_lng || '',
        meta_title: data.meta_title || '', meta_desc: data.meta_desc || '', meta_keyward: data.meta_keyward || '',
        meta_img: data.meta_img || '', attribute_terms: parseJSON(data.attribute_terms),
        enable_seo: data.enable_seo || '0', status: data.status || 1
      });
      
      if (data.feature_img) setFeatureImagePreview(data.feature_img);
      if (data.youtube_image) setYoutubeImagePreview(data.youtube_image);
      if (data.icon) setIconImagePreview(data.icon);
      if (data.activities_galleries) setExistingGalleries(data.activities_galleries);
      
      if (data.map_lat && data.map_lng) {
        setMapCenter({ lat: parseFloat(data.map_lat), lng: parseFloat(data.map_lng) });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchMasterAttributes = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/activity-attributes`);
      if (res.ok) {
        const data = await res.json();
        setMasterAttributes(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchLocations();
    fetchMasterAttributes();
    if (isEdit) fetchActivity();
    else setLoading(false);
  }, [id, isEdit]);


  useEffect(() => {
    if (!isLoaded || !window.google) return;
    let addressParts = [];
    if (formData.city_id) {
      const city = cities.find(c => c.id == formData.city_id);
      if (city) addressParts.push(city.name);
    }
    if (formData.state_id) {
      const state = states.find(s => s.id == formData.state_id);
      if (state) addressParts.push(state.name);
    }
    if (formData.country_id) {
      const country = countries.find(c => c.id == formData.country_id);
      if (country) addressParts.push(country.name);
    }
    if (addressParts.length > 0) {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address: addressParts.join(', ') }, (results, status) => {
        if (status === 'OK' && results[0]) {
          const loc = results[0].geometry.location;
          setMapCenter({ lat: loc.lat(), lng: loc.lng() });
        }
      });
    }
  }, [formData.country_id, formData.state_id, formData.city_id, countries, states, cities, isLoaded]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox' && (name.startsWith('attr_facility_') || name.startsWith('attr_transport_'))) {
      const attrName = value;
      setFormData(prev => {
        const terms = [...prev.attribute_terms];
        if (checked) {
          if (!terms.includes(attrName)) terms.push(attrName);
        } else {
          const index = terms.indexOf(attrName);
          if (index > -1) terms.splice(index, 1);
        }
        return { ...prev, attribute_terms: terms };
      });
      return;
    }
    setFormData(prev => ({
      ...prev,
      [name]: (name === 'price' || name === 'sale_price' || name === 'child_price' || name === 'status' || name === 'enable_service_fee' || name === 'days' || name === 'nights' || name === 'max_people' || name === 'min_advance_reservations' || name === 'min_stay') && value !== '' ? Number(value) : value
    }));
  };

  const handleImageChange = (e, setFile, setPreview) => {
    const file = e.target.files[0];
    if (file) {
      setFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleGalleryChange = (e) => {
    const files = Array.from(e.target.files);
    setNewGalleryFiles(prev => [...prev, ...files]);
    const previews = files.map(file => URL.createObjectURL(file));
    setGalleryPreviews(prev => [...prev, ...previews]);
  };

  const removeNewGallery = (idx) => {
    setNewGalleryFiles(prev => prev.filter((_, i) => i !== idx));
    setGalleryPreviews(prev => prev.filter((_, i) => i !== idx));
  };

  const removeExistingGallery = (id) => {
    setDeletedGalleries(prev => [...prev, id]);
    setExistingGalleries(prev => prev.filter(g => g.id !== id));
  };

  const handleMapClick = (e) => {
    setFormData(prev => ({
      ...prev,
      map_lat: e.latLng.lat().toString(),
      map_lng: e.latLng.lng().toString()
    }));
  };

  const handleOpenLocationModal = (type) => {
    setLocationModalType(type);
    setShowLocationModal(true);
  };

  const handleCreateLocation = async (e) => {
    if (e) e.preventDefault();
    if (!locationModalInput.trim()) return;
    setLocationModalSaving(true);
    try {
      const isEdit = !!locationModalEditId;
      const url = isEdit ? `${import.meta.env.VITE_API_URL}/locations/${locationModalEditId}` : `${import.meta.env.VITE_API_URL}/locations`;
      const method = isEdit ? 'PUT' : 'POST';
      
      const payload = { name: locationModalInput.trim() };
      if (!isEdit) {
        payload.country_id = (locationModalType === 'state' || locationModalType === 'city') ? formData.country_id : null;
        payload.state_id = locationModalType === 'city' ? formData.state_id : null;
      }

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error(`Failed to ${isEdit ? 'update' : 'create'} location`);
      const newLoc = await res.json();
      
      const updateList = (prev) => {
        if (isEdit) {
          return prev.map(item => item.id === newLoc.id ? newLoc : item).sort((a,b) => a.name.localeCompare(b.name));
        }
        return [...prev, newLoc].sort((a,b) => a.name.localeCompare(b.name));
      };

      if (locationModalType === 'country') {
        setCountries(updateList);
        if (!isEdit) setFormData(prev => ({ ...prev, country_id: newLoc.id, state_id: '', city_id: '' }));
      } else if (locationModalType === 'state') {
        setStates(updateList);
        if (!isEdit) setFormData(prev => ({ ...prev, state_id: newLoc.id, city_id: '' }));
      } else if (locationModalType === 'city') {
        setCities(updateList);
        if (!isEdit) setFormData(prev => ({ ...prev, city_id: newLoc.id }));
      }
      setLocationModalOpen(false);
      setLocationModalInput('');
      setLocationModalEditId(null);
    } catch (err) {
      console.error(err);
      alert(`Error ${locationModalEditId ? 'updating' : 'creating'} location`);
    } finally {
      setLocationModalSaving(false);
    }
  };

  const handleOpenAttributeModal = (attr = null) => {
    if (attr) {
      setAttributeModalData({ id: attr.id, name: attr.name, termsString: attr.activities_attribute_terms.map(t => t.name).join(', ') });
    } else {
      setAttributeModalData({ id: null, name: '', termsString: '' });
    }
    setShowAttributeModal(true);
  };

  const handleSaveAttribute = async (e) => {
    e.preventDefault();
    setAttributeSaving(true);
    try {
      const url = attributeModalData.id 
        ? `${import.meta.env.VITE_API_URL}/activity-attributes/${attributeModalData.id}` 
        : `${import.meta.env.VITE_API_URL}/activity-attributes`;
      const method = attributeModalData.id ? 'PUT' : 'POST';
      
      const termsArray = attributeModalData.termsString.split(',').map(t => t.trim()).filter(Boolean);
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: attributeModalData.name, terms: termsArray })
      });
      if (res.ok) {
        await fetchMasterAttributes();
        setShowAttributeModal(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAttributeSaving(false);
    }
  };

  const handleDeleteAttribute = async (id) => {
    if(!window.confirm('Delete this attribute?')) return;
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/activity-attributes/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchMasterAttributes();
    } catch (err) {
      console.error(err);
    }
  };


  const handleListChange = (setter, index, field, value) => {
    setter(prev => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
  };

  const setFaqs = (updater) => setFormData(prev => ({ ...prev, faqs: typeof updater === 'function' ? updater(prev.faqs) : updater }));
  const setIncludes = (updater) => setFormData(prev => ({ ...prev, includes: typeof updater === 'function' ? updater(prev.includes) : updater }));
  const setExcludes = (updater) => setFormData(prev => ({ ...prev, excludes: typeof updater === 'function' ? updater(prev.excludes) : updater }));
  const setHighlights = (updater) => setFormData(prev => ({ ...prev, highlights: typeof updater === 'function' ? updater(prev.highlights) : updater }));
  const setActivitiesPlan = (updater) => setFormData(prev => ({ ...prev, activities_plan: typeof updater === 'function' ? updater(prev.activities_plan) : updater }));
  const setServiceFees = (updater) => setFormData(prev => ({ ...prev, service_fees: typeof updater === 'function' ? updater(prev.service_fees) : updater }));

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      const submitData = new FormData();
      const jsonFields = ['faqs', 'includes', 'excludes', 'highlights', 'activities_plan', 'service_fees', 'attribute_terms'];
      Object.entries(formData).forEach(([key, value]) => {
        if (!jsonFields.includes(key)) {
          submitData.append(key, value);
        }
      });
      submitData.append('faqs', JSON.stringify(formData.faqs));
      submitData.append('includes', JSON.stringify(formData.includes));
      submitData.append('excludes', JSON.stringify(formData.excludes));
      submitData.append('highlights', JSON.stringify(formData.highlights));
      submitData.append('activities_plan', JSON.stringify(formData.activities_plan));
      submitData.append('service_fees', JSON.stringify(formData.service_fees));
      submitData.append('attribute_terms', JSON.stringify(formData.attribute_terms));

      if (featureImageFile) submitData.append('feature_img', featureImageFile);
      if (youtubeImageFile) submitData.append('youtube_image', youtubeImageFile);
      if (iconImageFile) submitData.append('icon', iconImageFile);

      newGalleryFiles.forEach(file => submitData.append('gallery_images', file));
      if (deletedGalleries.length > 0) submitData.append('deletedGalleries', JSON.stringify(deletedGalleries));

      const res = await fetch(`${import.meta.env.VITE_API_URL}/activities${isEdit ? `/${id}` : ''}`, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: submitData
      });
      if (res.ok) {
        navigate('/admin/activities');
      } else {
        const errorData = await res.json();
        alert(errorData.error || 'Failed to save activity');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred');
    } finally {
      setSaving(false);
    }
  };

  const TABS = [
    { id: 'general', label: 'General Info', icon: List },
    { id: 'media', label: 'Media & Gallery', icon: ImageIcon },
    { id: 'pricing', label: 'Pricing & Extra', icon: Tag },
    { id: 'details_itinerary', label: 'Details', icon: FileText },
    { id: 'location', label: 'Location', icon: MapPin },
    { id: 'attributes', label: 'Attributes & SEO', icon: Settings },
  ];

  if (loading) return <div className="p-8 text-center text-slate-500">Loading...</div>;

  return (
    <div className="font-['Inter',sans-serif] max-w-7xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">{!isEdit ? 'Add New Activity' : isView ? 'Manage Activity Details' : 'Edit Basic Info'}</h2>
          <p className="text-slate-500 text-sm mt-1">{isView ? 'Configure your activity details, pricing, itinerary and more.' : 'Enter the basic information. You can add pricing, media, and location details later.'}</p>
        </div>
        <div className="flex gap-3">
          <Link to="/admin/activities" className="px-5 py-2.5 text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-sm font-medium transition">
            Cancel
          </Link>
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition shadow-sm disabled:opacity-50">
            <Save size={16} /> {saving ? 'Saving...' : 'Save Activity'}
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {isEdit && (
          <div className="w-full lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-2 flex lg:flex-col gap-1 overflow-x-auto sticky top-4">
              {TABS.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium whitespace-nowrap transition ${
                    isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Icon size={18} className={isActive ? 'text-indigo-600' : 'text-slate-400'} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
        )}

        <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-100 p-6 md:p-8 min-h-[600px]">
          {activeTab === 'general' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Title <span className="text-red-500">*</span></label>
                  <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="Activity Title" className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 outline-none focus:border-indigo-500" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Slug</label>
                  <input type="text" name="slug" value={formData.slug} onChange={handleChange} placeholder="activity-slug" className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 outline-none focus:border-indigo-500" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Label (Shoulder) <span className="text-red-500">*</span></label>
                <input type="text" name="shoulder" value={formData.shoulder} onChange={handleChange} placeholder="e.g. Best Seller" className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 outline-none focus:border-indigo-500" required />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Content <span className="text-red-500">*</span></label>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <ReactQuill theme="snow" value={formData.content} onChange={(val) => setFormData(prev => ({ ...prev, content: val }))} className="h-48" />
                </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                  <select name="status" value={formData.status} onChange={handleChange} className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 outline-none focus:border-indigo-500 bg-white">
                    <option value={1}>Active</option>
                    <option value={2}>Draft</option>
                  </select>
                </div>
              </div>
              </div>
              
              {!isEdit && (
                <div className="mt-8 bg-indigo-50 rounded-xl p-4 border border-indigo-100 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-indigo-900">Need to add more details?</h4>
                    <p className="text-xs text-indigo-700 mt-1">After saving, you can click the "Eye" icon in the list to manage Pricing, Location, Media, and Itinerary.</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {isEdit && activeTab === 'media' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">YouTube Video URL</label>
                    <input type="text" name="youtube_video" value={formData.youtube_video} onChange={handleChange} placeholder="https://youtube.com/..." className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 outline-none focus:border-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">YouTube Video Thumbnail</label>
                    <input type="file" accept="image/*" onChange={(e) => handleImageChange(e, setYoutubeImageFile, setYoutubeImagePreview)} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700" />
                    {youtubeImagePreview && (
                      <div className="mt-3 w-40 h-24 rounded-lg overflow-hidden border border-slate-200">
                        <img src={youtubeImagePreview} alt="YouTube Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Feature Image</label>
                    <input type="file" accept="image/*" onChange={(e) => handleImageChange(e, setFeatureImageFile, setFeatureImagePreview)} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700" />
                    {featureImagePreview && (
                      <div className="mt-3 w-40 h-24 rounded-lg overflow-hidden border border-slate-200">
                        <img src={featureImagePreview} alt="Feature Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Icon Image</label>
                    <input type="file" accept="image/*" onChange={(e) => handleImageChange(e, setIconImageFile, setIconImagePreview)} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700" />
                    {iconImagePreview && (
                      <div className="mt-3 w-40 h-24 rounded-lg overflow-hidden border border-slate-200">
                        <img src={iconImagePreview} alt="Icon Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Image Gallery</label>
                <input type="file" accept="image/*" multiple onChange={handleGalleryChange} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700" />
                
                <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-4">
                  {existingGalleries.map((img) => (
                    <div key={img.id} className="relative w-full aspect-square rounded-lg overflow-hidden border border-slate-200 group">
                      <img src={img.image} alt="Gallery" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => removeExistingGallery(img.id)} className="absolute top-2 right-2 bg-red-500 text-white w-7 h-7 flex items-center justify-center rounded-full transition shadow-sm hover:bg-red-600"><X size={14} /></button>
                    </div>
                  ))}
                  {galleryPreviews.map((src, idx) => (
                    <div key={`new-${idx}`} className="relative w-full aspect-square rounded-lg overflow-hidden border border-indigo-200 group">
                      <img src={src} alt="New Gallery Preview" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => removeNewGallery(idx)} className="absolute top-2 right-2 bg-red-500 text-white w-7 h-7 flex items-center justify-center rounded-full transition shadow-sm hover:bg-red-600"><X size={14} /></button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'pricing' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <h3 className="font-bold text-lg text-slate-800 border-b pb-2 mb-4">Pricing</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Adult Price <span className="text-red-500">*</span></label>
                  <input type="number" name="price" value={formData.price} onChange={handleChange} className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Adult Sale Price</label>
                  <input type="number" name="sale_price" value={formData.sale_price} onChange={handleChange} className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Child Price</label>
                  <input type="number" name="child_price" value={formData.child_price} onChange={handleChange} className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200" />
                </div>
              </div>

              <div className="mt-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="checkbox" checked={formData.enable_service_fee === 1} onChange={e => handleChange({ target: { name: 'enable_service_fee', value: e.target.checked ? 1 : 2 } })} className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                  <span className="text-sm font-semibold text-slate-700">Enable Service Fee</span>
                </label>
              </div>

              {formData.enable_service_fee === 1 && (
                <DynamicListSection title="Service Fees" commonTitleField="" commonTitleValue="" onCommonTitleChange={()=>{}} items={formData.service_fees} setItems={setServiceFees} emptyItem={{name:'', price:0, type:'Fixed'}}>
                  {(item, idx) => (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <input type="text" value={item.name} onChange={e => handleListChange(setServiceFees, idx, 'name', e.target.value)} placeholder="Service Name" className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200" />
                      <input type="number" value={item.price} onChange={e => handleListChange(setServiceFees, idx, 'price', e.target.value)} placeholder="Price" className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200" />
                      <select value={item.type} onChange={e => handleListChange(setServiceFees, idx, 'type', e.target.value)} className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 bg-white">
                        <option>Fixed</option>
                        <option>Price One Time</option>
                        <option>Price Per Person</option>
                      </select>
                    </div>
                  )}
                </DynamicListSection>
              )}

              <h3 className="font-bold text-lg text-slate-800 border-b pb-2 mt-8 mb-4">Extra Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Days</label>
                  <input type="number" name="days" value={formData.days} onChange={handleChange} className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nights</label>
                  <input type="number" name="nights" value={formData.nights} onChange={handleChange} className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Max People</label>
                  <input type="number" name="max_people" value={formData.max_people} onChange={handleChange} className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Min Advance Reservations</label>
                  <input type="number" name="min_advance_reservations" value={formData.min_advance_reservations} onChange={handleChange} className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Min Stay Requirements</label>
                  <input type="number" name="min_stay" value={formData.min_stay} onChange={handleChange} className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200" />
                </div>
              </div>
            </div>
          )}

          {isEdit && activeTab === 'details_itinerary' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <DynamicListSection title="Includes" commonTitleField="include_title" commonTitleValue={formData.include_title} onCommonTitleChange={handleChange} items={formData.includes} setItems={setIncludes} emptyItem={{item:''}}>
                {(item, idx) => <input type="text" value={item.item} onChange={e => handleListChange(setIncludes, idx, 'item', e.target.value)} placeholder="Enter include item" className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200" />}
              </DynamicListSection>

              <DynamicListSection title="Excludes" commonTitleField="exclude_title" commonTitleValue={formData.exclude_title} onCommonTitleChange={handleChange} items={formData.excludes} setItems={setExcludes} emptyItem={{item:''}}>
                {(item, idx) => <input type="text" value={item.item} onChange={e => handleListChange(setExcludes, idx, 'item', e.target.value)} placeholder="Enter exclude item" className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200" />}
              </DynamicListSection>

              <DynamicListSection title="Highlights" commonTitleField="highlight_title" commonTitleValue={formData.highlight_title} onCommonTitleChange={handleChange} items={formData.highlights} setItems={setHighlights} emptyItem={{item:''}}>
                {(item, idx) => <input type="text" value={item.item} onChange={e => handleListChange(setHighlights, idx, 'item', e.target.value)} placeholder="Enter highlight item" className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200" />}
              </DynamicListSection>

              <DynamicListSection title="Activities Plan" commonTitleField="activities_plan_title" commonTitleValue={formData.activities_plan_title} onCommonTitleChange={handleChange} items={formData.activities_plan} setItems={setActivitiesPlan} emptyItem={{day:'', title:'', morning:'', midday:'', afternoon:'', evening:'', night:''}}>
                {(item, idx) => (
                  <div className="grid grid-cols-1 gap-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input type="text" value={item.day} onChange={e => handleListChange(setActivitiesPlan, idx, 'day', e.target.value)} placeholder="Day No (e.g. Day 1)" className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200" />
                      <input type="text" value={item.title} onChange={e => handleListChange(setActivitiesPlan, idx, 'title', e.target.value)} placeholder="Day Title" className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200" />
                    </div>
                    <textarea value={item.morning} onChange={e => handleListChange(setActivitiesPlan, idx, 'morning', e.target.value)} placeholder="Morning Activities" className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200" rows="1"></textarea>
                    <textarea value={item.midday} onChange={e => handleListChange(setActivitiesPlan, idx, 'midday', e.target.value)} placeholder="Midday Activities" className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200" rows="1"></textarea>
                    <textarea value={item.afternoon} onChange={e => handleListChange(setActivitiesPlan, idx, 'afternoon', e.target.value)} placeholder="Afternoon Activities" className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200" rows="1"></textarea>
                    <textarea value={item.evening} onChange={e => handleListChange(setActivitiesPlan, idx, 'evening', e.target.value)} placeholder="Evening Activities" className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200" rows="1"></textarea>
                    <textarea value={item.night} onChange={e => handleListChange(setActivitiesPlan, idx, 'night', e.target.value)} placeholder="Night Activities" className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200" rows="1"></textarea>
                  </div>
                )}
              </DynamicListSection>

              <DynamicListSection title="FAQs" commonTitleField="faq_title" commonTitleValue={formData.faq_title} onCommonTitleChange={handleChange} items={formData.faqs} setItems={setFaqs} emptyItem={{question:'', answer:''}}>
                {(item, idx) => (
                  <div className="grid grid-cols-1 gap-3">
                    <input type="text" value={item.question} onChange={e => handleListChange(setFaqs, idx, 'question', e.target.value)} placeholder="Enter Question" className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200" />
                    <textarea value={item.answer} onChange={e => handleListChange(setFaqs, idx, 'answer', e.target.value)} placeholder="Enter Answer" className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200" rows="2"></textarea>
                  </div>
                )}
              </DynamicListSection>
            </div>
          )}

          {isEdit && activeTab === 'location' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700">Country <span className="text-red-500">*</span></label>
                    <button type="button" onClick={() => handleOpenLocationModal('country')} className="w-5 h-5 flex items-center justify-center rounded-md bg-indigo-50 text-indigo-600 hover:bg-indigo-100 hover:text-indigo-700 transition">
                      <Plus size={14} />
                    </button>
                  </div>
                  <select name="country_id" value={formData.country_id} onChange={handleChange} className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 bg-white" required>
                    <option value="">Select Country</option>
                    {countries.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700">State / Region <span className="text-red-500">*</span></label>
                    <button type="button" onClick={() => handleOpenLocationModal('state')} className="w-5 h-5 flex items-center justify-center rounded-md bg-indigo-50 text-indigo-600 hover:bg-indigo-100 hover:text-indigo-700 transition">
                      <Plus size={14} />
                    </button>
                  </div>
                  <select name="state_id" value={formData.state_id} onChange={handleChange} className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 bg-white" required disabled={!formData.country_id}>
                    <option value="">Select State</option>
                    {states.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700">City <span className="text-red-500">*</span></label>
                    <button type="button" onClick={() => handleOpenLocationModal('city')} className="w-5 h-5 flex items-center justify-center rounded-md bg-indigo-50 text-indigo-600 hover:bg-indigo-100 hover:text-indigo-700 transition">
                      <Plus size={14} />
                    </button>
                  </div>
                  <select name="city_id" value={formData.city_id} onChange={handleChange} className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 bg-white" required disabled={!formData.state_id}>
                    <option value="">Select City</option>
                    {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Zip / Postal Code</label>
                  <input type="text" name="zip_code" value={formData.zip_code} onChange={handleChange} placeholder="Zip Code" className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 outline-none focus:border-indigo-500" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Address <span className="text-red-500">*</span></label>
                <input type="text" name="address" value={formData.address} onChange={handleChange} placeholder="Enter full address" className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 outline-none focus:border-indigo-500" required />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Latitude</label>
                  <input type="text" name="map_lat" value={formData.map_lat} onChange={handleChange} placeholder="e.g. 23.8103" className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 bg-slate-50 text-slate-500" readOnly />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Longitude</label>
                  <input type="text" name="map_lng" value={formData.map_lng} onChange={handleChange} placeholder="e.g. 90.4125" className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 bg-slate-50 text-slate-500" readOnly />
                </div>
              </div>

              {isLoaded && (
                <div className="border border-slate-200 rounded-xl overflow-hidden mt-4">
                  <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 text-xs font-medium text-slate-500">
                    Click on the map to set the exact coordinates
                  </div>
                  <GoogleMap mapContainerStyle={{width: '100%', height: '300px'}} center={mapCenter} zoom={13} onClick={(e) => {
                    setFormData(prev => ({...prev, map_lat: e.latLng.lat(), map_lng: e.latLng.lng()}));
                    setMapCenter({lat: e.latLng.lat(), lng: e.latLng.lng()});
                  }}>
                    {formData.map_lat && formData.map_lng && (
                      <Marker position={{ lat: parseFloat(formData.map_lat), lng: parseFloat(formData.map_lng) }} />
                    )}
                  </GoogleMap>
                </div>
              )}
            </div>
          )}

          {isEdit && activeTab === 'attributes' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h3 className="text-lg font-bold text-slate-800">Master Attributes</h3>
                <button type="button" onClick={() => handleOpenAttributeModal()} className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-100 transition">
                  <Plus size={16} /> Manage Attributes
                </button>
              </div>

              {masterAttributes.map(attr => (
                <div key={attr.id}>
                  <h4 className="font-bold text-sm text-slate-800 mb-3">{attr.name}</h4>
                  <div className="flex flex-wrap gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
                    {attr.activities_attribute_terms.map(term => (
                      <label key={term.id} className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          value={term.name} 
                          checked={formData.attribute_terms.includes(term.name)} 
                          onChange={(e) => {
                            const val = term.name;
                            setFormData(prev => ({
                              ...prev,
                              attribute_terms: e.target.checked 
                                ? [...prev.attribute_terms, val]
                                : prev.attribute_terms.filter(t => t !== val)
                            }));
                          }} 
                          className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500" 
                        />
                        <span className="text-sm font-medium text-slate-700">{term.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      
      {/* Location Modal */}
      {locationModalOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity" onClick={() => setLocationModalOpen(false)}></div>
          <div className="relative w-full max-w-sm bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 capitalize">Manage {locationModalType === 'city' ? 'Cities' : locationModalType === 'state' ? 'States' : 'Countries'}</h3>
              <button onClick={() => setLocationModalOpen(false)} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 transition bg-slate-50 hover:bg-slate-100 rounded-full">
                <X size={18} />
              </button>
            </div>
            
            <div className="p-4 border-b border-slate-100 bg-slate-50">
              <label className="block text-xs font-semibold text-slate-700 mb-1 capitalize">{locationModalEditId ? `Edit ${locationModalType}` : `Add New ${locationModalType}`}</label>
              <div className="flex flex-col gap-2">
                <input 
                  type="text" 
                  value={locationModalInput} 
                  onChange={(e) => setLocationModalInput(e.target.value)} 
                  placeholder={`Enter ${locationModalType} name`} 
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-indigo-500 bg-white" 
                />
                <div className="flex gap-2 justify-end">
                  {locationModalEditId && (
                    <button 
                      onClick={() => {
                        setLocationModalInput('');
                        setLocationModalEditId(null);
                      }}
                      className="px-4 py-2 bg-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-300 transition"
                    >
                      Cancel
                    </button>
                  )}
                  <button 
                    onClick={handleCreateLocation} 
                    disabled={!locationModalInput.trim() || locationModalSaving}
                    className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition"
                  >
                    {locationModalSaving ? 'Saving...' : locationModalEditId ? 'Update' : 'Add'}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <h4 className="text-xs font-semibold text-slate-500 mb-3 uppercase tracking-wider">
                Existing {locationModalType === 'city' ? 'Cities' : locationModalType === 'state' ? 'States' : 'Countries'}
              </h4>
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left border-collapse bg-white">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="py-2 px-3 text-xs font-semibold text-slate-600 capitalize">{locationModalType} Name</th>
                      <th className="py-2 px-3 text-xs font-semibold text-slate-600 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(locationModalType === 'country' ? countries : locationModalType === 'state' ? states : cities).length === 0 ? (
                      <tr>
                        <td colSpan="2" className="py-4 text-center text-sm text-slate-500">No {locationModalType === 'city' ? 'cities' : locationModalType === 'state' ? 'states' : 'countries'} found.</td>
                      </tr>
                    ) : (
                      (locationModalType === 'country' ? countries : locationModalType === 'state' ? states : cities).map((loc) => (
                        <tr key={loc.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition">
                          <td className="py-2 px-3 text-sm font-medium text-slate-700">{loc.name}</td>
                          <td className="py-2 px-3 text-right">
                            <button 
                              onClick={() => {
                                setLocationModalInput(loc.name);
                                setLocationModalEditId(loc.id);
                              }}
                              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition mr-1"
                              title={`Edit ${locationModalType}`}
                            >
                              <Edit2 size={16} />
                            </button>
                            <button 
                              onClick={async () => {
                                if(!window.confirm('Delete this location?')) return;
                                const res = await fetch(`${import.meta.env.VITE_API_URL}/locations/${loc.id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` }});
                                if (res.ok) {
                                  if (locationModalType === 'country') setCountries(prev => prev.filter(c => c.id !== loc.id));
                                  if (locationModalType === 'state') setStates(prev => prev.filter(s => s.id !== loc.id));
                                  if (locationModalType === 'city') setCities(prev => prev.filter(c => c.id !== loc.id));
                                }
                              }}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition"
                              title={`Delete ${locationModalType}`}
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
      )}

      {/* Attribute Modal */}
      {showAttributeModal && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity" onClick={() => setShowAttributeModal(false)}></div>
          <div className="relative w-full max-w-sm bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-800">{attributeModalData.id ? 'Edit Attribute' : 'Add New Attribute'}</h3>
              <button onClick={() => setShowAttributeModal(false)} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 transition bg-slate-50 hover:bg-slate-100 rounded-full">
                <X size={18} />
              </button>
            </div>
            
            <div className="p-4 border-b border-slate-100 bg-slate-50">
              <form onSubmit={handleSaveAttribute}>
                <div className="flex flex-col gap-2">
                  <input 
                    type="text" 
                    value={attributeModalData.name} 
                    onChange={(e) => setAttributeModalData(prev => ({...prev, name: e.target.value}))} 
                    placeholder="Attribute Name" 
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-indigo-500 bg-white" 
                    required 
                  />
                  <textarea 
                    value={attributeModalData.termsString} 
                    onChange={(e) => setAttributeModalData(prev => ({...prev, termsString: e.target.value}))} 
                    placeholder="Attribute Terms (Comma separated)" 
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-indigo-500 bg-white min-h-[60px]"
                    required
                  ></textarea>
                  <div className="flex gap-2 justify-end mt-1">
                    {attributeModalData.id && (
                      <button 
                        type="button"
                        onClick={() => setAttributeModalData({ id: null, name: '', termsString: '' })}
                        className="px-4 py-2 bg-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-300 transition"
                      >
                        Cancel
                      </button>
                    )}
                    <button type="submit" disabled={attributeSaving} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition shadow-sm disabled:opacity-50">
                      {attributeSaving ? 'Saving...' : attributeModalData.id ? 'Update' : 'Add'}
                    </button>
                  </div>
                </div>
              </form>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <h4 className="text-xs font-semibold text-slate-500 mb-3 uppercase tracking-wider">Existing Attributes</h4>
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left border-collapse bg-white">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="py-2 px-3 text-xs font-semibold text-slate-600">Attribute Name</th>
                      <th className="py-2 px-3 text-xs font-semibold text-slate-600 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {masterAttributes.length === 0 ? (
                      <tr>
                        <td colSpan="2" className="py-4 text-center text-sm text-slate-500">No attributes added yet.</td>
                      </tr>
                    ) : (
                      masterAttributes.map((attr) => (
                        <tr key={attr.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition">
                          <td className="py-2 px-3 text-sm font-medium text-slate-700">{attr.name}</td>
                          <td className="py-2 px-3 text-right">
                            <button 
                              type="button" 
                              onClick={() => handleOpenAttributeModal(attr)}
                              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition mr-1"
                              title="Edit Attribute"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button 
                              type="button" 
                              onClick={() => handleDeleteAttribute(attr.id)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition"
                              title="Delete Attribute"
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
          <input type="text" name={commonTitleField} value={commonTitleValue} onChange={onCommonTitleChange} placeholder={`Enter ${title} Title`} className="w-1/2 px-4 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-white" />
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
      <button type="button" onClick={() => setItems(prev => [...(Array.isArray(prev) ? prev : []), emptyItem])} className="flex items-center gap-2 text-indigo-600 bg-indigo-50/80 px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-indigo-100 transition w-fit">
        <Plus size={16} strokeWidth={2.5} /> Add {title} Item
      </button>
    </div>
  );
};
