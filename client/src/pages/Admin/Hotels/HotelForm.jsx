import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Save, Image as ImageIcon, MapPin, Tag, List, Settings, X, Plus, Edit2, Trash2 } from 'lucide-react';
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';

const mapContainerStyle = { width: '100%', height: '300px', borderRadius: '0.5rem' };
const defaultCenter = { lat: 23.8103, lng: 90.4125 }; // Dhaka default

const TABS = [
  { id: 'general', label: 'General Info', icon: List },
  { id: 'pricing', label: 'Pricing & Policies', icon: Tag },
  { id: 'location', label: 'Location', icon: MapPin },
  { id: 'attributes', label: 'Attributes', icon: Settings },
  { id: 'media', label: 'Media & SEO', icon: ImageIcon },
];

export default function AdminHotelForm() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  
  const isEdit = Boolean(id);
  const isView = location.pathname.includes('/view/');

  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(isEdit);
  const [masterAttributes, setMasterAttributes] = useState([]);
  const [showAttributeModal, setShowAttributeModal] = useState(false);
  const [attributeModalData, setAttributeModalData] = useState({ id: null, name: '', termsString: '' });
  const [attributeSaving, setAttributeSaving] = useState(false);
  const [saving, setSaving] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('country');
  const [modalInput, setModalInput] = useState('');
  const [modalEditId, setModalEditId] = useState(null);
  const [modalSaving, setModalSaving] = useState(false);

  const [featureImageFile, setFeatureImageFile] = useState(null);
  const [featureImagePreview, setFeatureImagePreview] = useState(null);

  const [youtubeImageFile, setYoutubeImageFile] = useState(null);
  const [youtubeImagePreview, setYoutubeImagePreview] = useState(null);
  
  const [existingGalleries, setExistingGalleries] = useState([]);
  const [newGalleryFiles, setNewGalleryFiles] = useState([]);
  const [galleryPreviews, setGalleryPreviews] = useState([]);
  const [deletedGalleries, setDeletedGalleries] = useState([]);

  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [mapCenter, setMapCenter] = useState(defaultCenter);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: "AIzaSyAX_1lQpTBdnMvEOpeXdu9txMXrGU0mJy8",
    libraries: ['geometry', 'drawing', 'places']
  });

  const [formData, setFormData] = useState({
    title: '', content: '', youtube_video: '', policy_title: '',
    check_in: '', check_out: '', room_type: '', bed_type: '',
    guest_capability: 1, cancellation: '', min_advance_reservations: '',
    min_stay: '', breakfast: 2, price: 0, price_symbol: '', enable_service_fee: 2,
    address: '', country_id: '', state_id: '', city_id: '', zip_code: '',
    map_lat: '', map_lng: '', feature_img: '', meta_title: '', meta_desc: '', status: 0,
    policies: [], service_fees: [], attribute_terms: []
  });

  useEffect(() => {
    if (isEdit) {
      fetch(`${import.meta.env.VITE_API_URL}/admin/hotels/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        const parseArray = (val) => {
          if (!val) return [];
          if (Array.isArray(val)) return val;
          if (typeof val === 'string') {
            try { const parsed = JSON.parse(val); return Array.isArray(parsed) ? parsed : []; } catch(e) { return []; }
          }
          return [];
        };
        data.attribute_terms = parseArray(data.attribute_terms);
        data.policies = parseArray(data.policies);
        data.service_fees = parseArray(data.service_fees);
        setFormData({ ...data, slug: data.slug || '' });
        
        if (data.feature_img) {
          setFeatureImagePreview(data.feature_img);
        }
        if (data.youtube_image) {
          setYoutubeImagePreview(data.youtube_image);
        }
        if (data.hotel_galleries) {
          setExistingGalleries(data.hotel_galleries);
        }
        
        if (data.map_lat && data.map_lng) {
          setMapCenter({ lat: parseFloat(data.map_lat), lng: parseFloat(data.map_lng) });
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
    }
  }, [id, token, isEdit]);

  // Fetch countries & master attributes
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/locations/countries`)
      .then(res => res.json())
      .then(data => setCountries(data))
      .catch(console.error);
      
    fetchMasterAttributes();
  }, []);

  const fetchMasterAttributes = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/hotel-attributes`);
      if (res.ok) {
        const data = await res.json();
        setMasterAttributes(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenAttributeModal = (attr = null) => {
    if (attr) {
      setAttributeModalData({ id: attr.id, name: attr.name, termsString: attr.hotel_attribute_terms.map(t => t.name).join(', ') });
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
        ? `${import.meta.env.VITE_API_URL}/hotel-attributes/${attributeModalData.id}` 
        : `${import.meta.env.VITE_API_URL}/hotel-attributes`;
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
      await fetch(`${import.meta.env.VITE_API_URL}/hotel-attributes/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchMasterAttributes();
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch states
  useEffect(() => {
    if (formData.country_id) {
      fetch(`${import.meta.env.VITE_API_URL}/locations/states/${formData.country_id}`)
        .then(res => res.json())
        .then(data => setStates(data))
        .catch(console.error);
    } else {
      setStates([]);
    }
  }, [formData.country_id]);

  // Fetch cities
  useEffect(() => {
    if (formData.state_id) {
      fetch(`${import.meta.env.VITE_API_URL}/locations/cities/${formData.state_id}`)
        .then(res => res.json())
        .then(data => setCities(data))
        .catch(console.error);
    } else {
      setCities([]);
    }
  }, [formData.state_id]);

  // Geocode when location dropdowns change
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

  const handleMapClick = (e) => {
    setFormData(prev => ({
      ...prev,
      map_lat: e.latLng.lat().toString(),
      map_lng: e.latLng.lng().toString()
    }));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (checked ? 1 : 0) : value
    }));
  };

  const handleTimeChange = (e) => {
    const { name, value } = e.target;
    // Remove all non-digits
    let val = value.replace(/\D/g, '');
    
    // Auto-insert colon after 2 digits
    if (val.length > 2) {
      val = val.substring(0, 2) + ':' + val.substring(2, 4);
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: val
    }));
  };

  const handleFeatureImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFeatureImageFile(file);
      setFeatureImagePreview(URL.createObjectURL(file));
    }
  };

  const handleYoutubeImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setYoutubeImageFile(file);
      setYoutubeImagePreview(URL.createObjectURL(file));
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

  const removeExistingGalleryImage = (id) => {
    setDeletedGalleries(prev => [...prev, id]);
    setExistingGalleries(prev => prev.filter(img => img.id !== id));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { ...formData };
      if (!isEdit && payload.title) {
        payload.slug = payload.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      }

      const method = isEdit ? 'PUT' : 'POST';
      const url = isEdit ? `${import.meta.env.VITE_API_URL}/admin/hotels/${id}` : `${import.meta.env.VITE_API_URL}/admin/hotels`;
      
      const submitData = new FormData();
      Object.keys(payload).forEach(key => {
        const val = payload[key];
        if (val !== null && val !== undefined) {
          if (Array.isArray(val) || typeof val === 'object') {
            submitData.append(key, JSON.stringify(val));
          } else {
            submitData.append(key, val);
          }
        }
      });

      if (featureImageFile) {
        submitData.append('feature_img', featureImageFile);
      }
      
      if (youtubeImageFile) {
        submitData.append('youtube_image', youtubeImageFile);
      }
      
      newGalleryFiles.forEach(file => {
        submitData.append('gallery_images', file);
      });
      
      if (deletedGalleries.length > 0) {
        submitData.append('deleted_galleries', JSON.stringify(deletedGalleries));
      }

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`
          // Don't set Content-Type, browser will set it to multipart/form-data with boundary
        },
        body: submitData
      });
      
      if (!res.ok) throw new Error('Failed to save hotel');
      navigate('/admin/hotels');
    } catch (err) {
      console.error(err);
      alert('Error saving hotel. Check console.');
    } finally {
      setSaving(false);
    }
  };

  const handleOpenModal = (type) => {
    setModalType(type);
    setModalInput('');
    setModalEditId(null);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setModalInput('');
    setModalEditId(null);
  };

  const handleEditLocation = (loc) => {
    setModalInput(loc.name);
    setModalEditId(loc.id);
  };

  const handleDeleteLocation = async (id) => {
    if (!window.confirm(`Are you sure you want to delete this ${modalType}?`)) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/locations/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to delete');
      
      if (modalType === 'country') {
        setCountries(prev => prev.filter(c => c.id !== id));
        if (formData.country_id === id) setFormData(prev => ({ ...prev, country_id: '', state_id: '', city_id: '' }));
      } else if (modalType === 'state') {
        setStates(prev => prev.filter(s => s.id !== id));
        if (formData.state_id === id) setFormData(prev => ({ ...prev, state_id: '', city_id: '' }));
      } else if (modalType === 'city') {
        setCities(prev => prev.filter(c => c.id !== id));
        if (formData.city_id === id) setFormData(prev => ({ ...prev, city_id: '' }));
      }
    } catch (err) {
      console.error(err);
      alert('Error deleting location');
    }
  };




  const handleCreateLocation = async () => {
    if (!modalInput.trim()) return;
    setModalSaving(true);
    try {
      const isEdit = !!modalEditId;
      const url = isEdit ? `${import.meta.env.VITE_API_URL}/locations/${modalEditId}` : `${import.meta.env.VITE_API_URL}/locations`;
      const method = isEdit ? 'PUT' : 'POST';
      
      const payload = { name: modalInput.trim() };
      if (!isEdit) {
        payload.country_id = (modalType === 'state' || modalType === 'city') ? formData.country_id : null;
        payload.state_id = modalType === 'city' ? formData.state_id : null;
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

      if (modalType === 'country') {
        setCountries(updateList);
        if (!isEdit) setFormData(prev => ({ ...prev, country_id: newLoc.id, state_id: '', city_id: '' }));
      } else if (modalType === 'state') {
        setStates(updateList);
        if (!isEdit) setFormData(prev => ({ ...prev, state_id: newLoc.id, city_id: '' }));
      } else if (modalType === 'city') {
        setCities(updateList);
        if (!isEdit) setFormData(prev => ({ ...prev, city_id: newLoc.id }));
      }
      handleCloseModal();
    } catch (err) {
      console.error(err);
      alert(`Error ${modalEditId ? 'updating' : 'creating'} location`);
    } finally {
      setModalSaving(false);
    }
  };

  if (loading) return <div className="p-8 flex items-center justify-center">Loading form...</div>;

  return (
    <div className="font-['Inter',sans-serif]">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-800">{isView ? 'Advanced Hotel Details' : isEdit ? 'Edit Hotel Basics' : 'Add New Hotel'}</h2>
          <p className="text-slate-500 text-xs mt-1">{isView ? 'Fill in the remaining details and policies.' : 'Fill in the basic details below to publish a hotel listing.'}</p>
        </div>
        <button 
          onClick={handleSave} 
          disabled={saving}
          className="flex items-center gap-2 bg-[#0081C9] hover:bg-[#0069a6] text-white px-5 py-2 rounded-lg text-sm font-medium transition shadow-sm disabled:opacity-50"
        >
          <Save size={16} /> {saving ? 'Saving...' : 'Save Hotel'}
        </button>
      </div>

      {/* Conditional Layout: Simple form for ADD/EDIT, Tabbed form for VIEW */}
      {!isView ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 md:p-5 max-w-3xl space-y-4 animate-in fade-in duration-300">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Name of the hotel <span className="text-red-500">*</span></label>
            <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="Enter Title" className="w-full px-3 py-1.5 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#0081C9] outline-none" required />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Content</label>
            <div className="bg-white rounded-lg">
              <ReactQuill theme="snow" value={formData.content} onChange={(val) => setFormData(prev => ({ ...prev, content: val }))} placeholder="Write a short description.." className="h-40 mb-12" />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Hotel Price <span className="text-red-500">*</span></label>
              <input type="number" name="price" value={formData.price} onChange={handleChange} placeholder="e.g. 1500" className="w-full px-3 py-1.5 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#0081C9] outline-none" required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Room Type <span className="text-red-500">*</span></label>
              <input type="text" name="room_type" value={formData.room_type} onChange={handleChange} placeholder="e.g. Deluxe" className="w-full px-3 py-1.5 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#0081C9] outline-none" required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Bed Type <span className="text-red-500">*</span></label>
              <input type="text" name="bed_type" value={formData.bed_type} onChange={handleChange} placeholder="e.g. Double" className="w-full px-3 py-1.5 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#0081C9] outline-none" required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Guest Capability <span className="text-red-500">*</span></label>
              <input type="number" name="guest_capability" value={formData.guest_capability} onChange={handleChange} placeholder="e.g. 2" className="w-full px-3 py-1.5 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#0081C9] outline-none" required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Cancellation Policy (hours) <span className="text-red-500">*</span></label>
              <input type="text" name="cancellation" value={formData.cancellation} onChange={handleChange} placeholder="e.g. 24" className="w-full px-3 py-1.5 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#0081C9] outline-none" required />
            </div>
          </div>
          <p className="text-xs text-indigo-600 mt-4 italic">* Once created, you will be able to add pricing policies, location details, attributes, and media.</p>
        </div>
      ) : (
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
          <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-slate-100 p-4">
            
            {/* GENERAL INFO TAB */}
            {activeTab === 'general' && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h4 className="font-semibold text-slate-800 text-sm">Hotel Status</h4>
                  <p className="text-xs text-slate-500">Enable this to make the hotel visible to users.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" name="status" className="sr-only peer" checked={formData.status === 1} onChange={handleChange} />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Name of the hotel <span className="text-red-500">*</span></label>
                <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="Enter Title" className="w-full px-3 py-1.5 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#0081C9] outline-none" required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Content <span className="text-red-500">*</span></label>
                <div className="bg-white rounded-lg">
                  <ReactQuill theme="snow" value={formData.content} onChange={(val) => setFormData(prev => ({ ...prev, content: val }))} placeholder="Write here.." className="h-48 mb-12" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Time for check in</label>
                  <input type="text" name="check_in" value={formData.check_in} onChange={handleTimeChange} maxLength="5" placeholder="Ex: 12:00" className="w-full px-3 py-1.5 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#0081C9] outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Time for check out</label>
                  <input type="text" name="check_out" value={formData.check_out} onChange={handleTimeChange} maxLength="5" placeholder="Ex: 11:00" className="w-full px-3 py-1.5 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#0081C9] outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Room Type</label>
                  <input type="text" name="room_type" value={formData.room_type} onChange={handleChange} placeholder="Room Type" className="w-full px-3 py-1.5 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#0081C9] outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Bed Type</label>
                  <input type="text" name="bed_type" value={formData.bed_type} onChange={handleChange} placeholder="Bed Type" className="w-full px-3 py-1.5 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#0081C9] outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Guest Capability</label>
                  <input type="number" name="guest_capability" value={formData.guest_capability} onChange={handleChange} placeholder="1" className="w-full px-3 py-1.5 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#0081C9] outline-none" />
                </div>
              </div>
            </div>
          )}

          {/* PRICING & POLICIES TAB */}
          {activeTab === 'pricing' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Hotel Price *</label>
                  <input type="number" name="price" value={formData.price} onChange={handleChange} className="w-full px-3 py-1.5 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#0081C9] outline-none" required />
                </div>
                
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Breakfast</label>
                  <select name="breakfast" value={formData.breakfast} onChange={handleChange} className="w-full px-3 py-1.5 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#0081C9] outline-none bg-white">
                    <option value={1}>Breakfast included</option>
                    <option value={2}>No Breakfast</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Minimum advance reservations</label>
                  <input type="number" name="min_advance_reservations" value={formData.min_advance_reservations} onChange={handleChange} placeholder="Ex: 3" className="w-full px-3 py-1.5 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#0081C9] outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Minimum day stay requirements</label>
                  <input type="number" name="min_stay" value={formData.min_stay} onChange={handleChange} placeholder="Ex: 2" className="w-full px-3 py-1.5 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#0081C9] outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Cancellation (hours)</label>
                  <input type="text" name="cancellation" value={formData.cancellation} onChange={handleChange} placeholder="Cancellation hours" className="w-full px-3 py-1.5 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#0081C9] outline-none" />
                </div>
              </div>

              {/* Dynamic Policies */}
              <div className="border-t border-slate-100 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-slate-800 text-sm">Policies</h4>
                  <button 
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, policies: [...prev.policies, { title: '', content: '' }] }))}
                    className="text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1 rounded text-xs font-medium flex items-center gap-1 transition"
                  >
                    <Plus size={14} /> Add Policy
                  </button>
                </div>
                <div className="space-y-3 mb-4">
                  {(Array.isArray(formData.policies) ? formData.policies : []).map((policy, idx) => (
                    <div key={idx} className="flex gap-3 items-start bg-slate-50 p-3 rounded border border-slate-100 relative group">
                      <div className="flex-1">
                        <input type="text" placeholder="Enter Title" value={policy.title} onChange={(e) => {
                          const newPolicies = [...formData.policies];
                          newPolicies[idx].title = e.target.value;
                          setFormData({...formData, policies: newPolicies});
                        }} className="w-full px-3 py-1.5 text-sm rounded border border-gray-200 focus:ring-1 focus:ring-[#0081C9] outline-none mb-2" />
                        <textarea placeholder="Enter Content" value={policy.content} onChange={(e) => {
                          const newPolicies = [...formData.policies];
                          newPolicies[idx].content = e.target.value;
                          setFormData({...formData, policies: newPolicies});
                        }} className="w-full px-3 py-1.5 text-sm rounded border border-gray-200 focus:ring-1 focus:ring-[#0081C9] outline-none rows-2" />
                      </div>
                      <button type="button" onClick={() => {
                        const newPolicies = formData.policies.filter((_, i) => i !== idx);
                        setFormData({...formData, policies: newPolicies});
                      }} className="text-red-400 hover:text-red-600 bg-white rounded p-1 shadow-sm mt-1">
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  {formData.policies.length === 0 && <p className="text-xs text-slate-500 italic">No policies added yet.</p>}
                </div>
              </div>

              {/* Dynamic Service Fees */}
              <div className="border-t border-slate-100 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-slate-800 text-sm">Extra Service Fees</h4>
                  <button 
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, service_fees: [...prev.service_fees, { name: '', price: '', type: 'Fixed' }] }))}
                    className="text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1 rounded text-xs font-medium flex items-center gap-1 transition"
                  >
                    <Plus size={14} /> Add Service
                  </button>
                </div>
                <div className="space-y-3">
                  {formData.service_fees.map((service, idx) => (
                    <div key={idx} className="flex flex-col md:flex-row gap-3 items-start md:items-center bg-slate-50 p-3 rounded border border-slate-100">
                      <input type="text" placeholder="Service Name" value={service.name} onChange={(e) => {
                        const newServices = [...formData.service_fees];
                        newServices[idx].name = e.target.value;
                        setFormData({...formData, service_fees: newServices});
                      }} className="w-full md:flex-1 px-3 py-1.5 text-sm rounded border border-gray-200 outline-none" />
                      
                      <input type="number" placeholder="Price" value={service.price} onChange={(e) => {
                        const newServices = [...formData.service_fees];
                        newServices[idx].price = e.target.value;
                        setFormData({...formData, service_fees: newServices});
                      }} className="w-full md:w-24 px-3 py-1.5 text-sm rounded border border-gray-200 outline-none" />
                      
                      <select value={service.type} onChange={(e) => {
                        const newServices = [...formData.service_fees];
                        newServices[idx].type = e.target.value;
                        setFormData({...formData, service_fees: newServices});
                      }} className="w-full md:w-36 px-3 py-1.5 text-sm rounded border border-gray-200 outline-none bg-white">
                        <option value="Fixed">Fixed</option>
                        <option value="Price One Time">Price One Time</option>
                        <option value="Price Per Person">Price Per Person</option>
                      </select>
                      
                      <button type="button" onClick={() => {
                        const newServices = formData.service_fees.filter((_, i) => i !== idx);
                        setFormData({...formData, service_fees: newServices});
                      }} className="text-red-400 hover:text-red-600 bg-white rounded p-1 shadow-sm">
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  {formData.service_fees.length === 0 && <p className="text-xs text-slate-500 italic">No extra services added.</p>}
                </div>
              </div>
            </div>
          )}

          {/* LOCATION TAB */}
          {activeTab === 'location' && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Address</label>
                <input type="text" name="address" value={formData.address} onChange={handleChange} placeholder="Enter Hotel Address" className="w-full px-3 py-1.5 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#0081C9] outline-none" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                    <span>Country</span>
                    <button type="button" onClick={() => handleOpenModal('country')} className="w-5 h-5 flex items-center justify-center text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-full transition" title="Add New Country">
                      <Plus size={14} />
                    </button>
                  </label>
                  <select name="country_id" value={formData.country_id} onChange={handleChange} className="w-full px-3 py-1.5 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#0081C9] outline-none bg-white">
                    <option value="">Select Country</option>
                    {countries.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                    <span>State</span>
                    {formData.country_id && (
                      <button type="button" onClick={() => handleOpenModal('state')} className="w-5 h-5 flex items-center justify-center text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-full transition" title="Add New State">
                        <Plus size={14} />
                      </button>
                    )}
                  </label>
                  <select name="state_id" value={formData.state_id} onChange={handleChange} className="w-full px-3 py-1.5 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#0081C9] outline-none bg-white" disabled={!formData.country_id}>
                    <option value="">Select State</option>
                    {states.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                    <span>City</span>
                    {formData.state_id && (
                      <button type="button" onClick={() => handleOpenModal('city')} className="w-5 h-5 flex items-center justify-center text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-full transition" title="Add New City">
                        <Plus size={14} />
                      </button>
                    )}
                  </label>
                  <select name="city_id" value={formData.city_id} onChange={handleChange} className="w-full px-3 py-1.5 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#0081C9] outline-none bg-white" disabled={!formData.state_id}>
                    <option value="">Select City</option>
                    {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Zip/Postal</label>
                  <input type="text" name="zip_code" value={formData.zip_code} onChange={handleChange} placeholder="Zip/Postal" className="w-full px-3 py-1.5 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#0081C9] outline-none" />
                </div>
              </div>
              
              <div className="border-t border-slate-100 pt-4 mt-4">
                <h4 className="font-semibold text-slate-800 text-sm mb-1">Map Location</h4>
                <p className="text-xs text-slate-500 mb-3">Click on the map to drop a pin and set exact coordinates.</p>
                {isLoaded ? (
                  <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    center={mapCenter}
                    zoom={10}
                    onClick={handleMapClick}
                  >
                    {formData.map_lat && formData.map_lng && (
                      <Marker position={{ lat: parseFloat(formData.map_lat), lng: parseFloat(formData.map_lng) }} />
                    )}
                  </GoogleMap>
                ) : (
                  <div className="w-full h-[300px] bg-slate-100 rounded-lg flex items-center justify-center text-sm text-slate-400">Loading Map...</div>
                )}
                
                <div className="grid grid-cols-2 gap-4 mt-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Latitude</label>
                    <input type="text" name="map_lat" value={formData.map_lat} onChange={handleChange} placeholder="Latitude" className="w-full px-3 py-1.5 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#0081C9] outline-none bg-slate-50" readOnly />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Longitude</label>
                    <input type="text" name="map_lng" value={formData.map_lng} onChange={handleChange} placeholder="Longitude" className="w-full px-3 py-1.5 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#0081C9] outline-none bg-slate-50" readOnly />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ATTRIBUTES TAB */}
          {activeTab === 'attributes' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h3 className="text-lg font-bold text-slate-800">Master Attributes</h3>
                <button type="button" onClick={() => handleOpenAttributeModal()} className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-100 transition">
                  <Plus size={16} /> Manage Attributes
                </button>
              </div>

              {masterAttributes.map(attr => (
                <div key={attr.id} className="pt-4 border-t border-slate-100 first:border-0 first:pt-0">
                  <h4 className="font-semibold text-slate-800 text-sm mb-3">Attribute: {attr.name}</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {attr.hotel_attribute_terms.map(term => (
                      <label key={term.id} className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                        <input 
                          type="checkbox" 
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
                          className="rounded border-gray-300 text-indigo-600 focus:ring-[#0081C9]" 
                        />
                        {term.name}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* MEDIA & SEO TAB */}
          {activeTab === 'media' && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Feature Image</label>
                <input type="file" accept="image/*" onChange={handleFeatureImageChange} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
                {featureImagePreview && (
                  <div className="mt-3 w-32 h-32 rounded-lg overflow-hidden border border-gray-200">
                    <img src={featureImagePreview} alt="Feature Preview" className="w-full h-full object-cover" />
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
              
              <div className="pt-3 border-t border-slate-100">
                <label className="block text-xs font-semibold text-slate-700 mb-1">YouTube Video URL</label>
                <input type="text" name="youtube_video" value={formData.youtube_video} onChange={handleChange} placeholder="Paste YouTube URL" className="w-full px-3 py-1.5 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#0081C9] outline-none" />
                
                <label className="block text-xs font-semibold text-slate-700 mt-3 mb-1">YouTube Video Thumbnail</label>
                <input type="file" accept="image/*" onChange={handleYoutubeImageChange} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
                {youtubeImagePreview && (
                  <div className="mt-3 w-32 h-32 rounded-lg overflow-hidden border border-gray-200">
                    <img src={youtubeImagePreview} alt="YouTube Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100">
                <h4 className="font-semibold text-slate-800 text-sm mb-3">SEO Settings</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Meta Title</label>
                    <input type="text" name="meta_title" value={formData.meta_title} onChange={handleChange} placeholder="Meta Title" className="w-full px-3 py-1.5 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#0081C9] outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Meta Description</label>
                    <textarea name="meta_desc" value={formData.meta_desc} onChange={handleChange} rows="2" placeholder="Meta Description" className="w-full px-3 py-1.5 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#0081C9] outline-none"></textarea>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
      )}

      {/* Slide-over Modal for Locations */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity" onClick={handleCloseModal}></div>
          <div className="relative w-full max-w-sm bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 capitalize">Add New {modalType}</h3>
              <button onClick={handleCloseModal} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 transition bg-slate-50 hover:bg-slate-100 rounded-full">
                <X size={18} />
              </button>
            </div>
            
            <div className="p-3 flex-1 overflow-y-auto">
              {modalType === 'state' && formData.country_id && (
                <p className="text-xs text-indigo-600 bg-indigo-50 p-2 rounded mb-4 border border-indigo-100">
                  Adding to Country: <strong>{countries.find(c => c.id == formData.country_id)?.name}</strong>
                </p>
              )}
              {modalType === 'city' && formData.state_id && (
                <p className="text-xs text-indigo-600 bg-indigo-50 p-2 rounded mb-4 border border-indigo-100">
                  Adding to State: <strong>{states.find(s => s.id == formData.state_id)?.name}</strong>
                </p>
              )}

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 capitalize">Name of the {modalType}</label>
                  <input 
                    type="text" 
                    value={modalInput} 
                    onChange={e => setModalInput(e.target.value)} 
                    placeholder={`Enter ${modalType} name`} 
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#0081C9] outline-none" 
                    autoFocus
                  />
                </div>
              </div>
              
              {/* Location Listing */}
              <div className="border-t border-slate-100 pt-4">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Existing {modalType}s</h4>
                <div className="space-y-2">
                  {((modalType === 'country' ? countries : modalType === 'state' ? states : cities) || []).map((loc) => (
                    <div key={loc.id} className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50 transition group">
                      <span className="text-sm font-medium text-slate-700">{loc.name}</span>
                      <div className="flex items-center gap-2 transition-opacity">
                        <button onClick={() => handleEditLocation(loc)} className="w-8 h-8 flex items-center justify-center text-green-600 bg-green-100 hover:bg-green-200 rounded-full transition" title="Edit">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDeleteLocation(loc.id)} className="w-8 h-8 flex items-center justify-center text-red-500 bg-red-100 hover:bg-red-200 rounded-full transition" title="Delete">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {((modalType === 'country' ? countries : modalType === 'state' ? states : cities) || []).length === 0 && (
                    <p className="text-xs text-slate-500 text-center py-4 bg-slate-50 rounded">No items found</p>
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-2">
              <button 
                onClick={handleCloseModal}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition"
              >
                Cancel
              </button>
              <button 
                onClick={handleCreateLocation}
                disabled={modalSaving || !modalInput.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition disabled:opacity-50"
              >
                {modalSaving ? 'Saving...' : modalEditId ? 'Update Location' : 'Save Location'}
              </button>
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
                    <button type="submit" disabled={attributeSaving} className="px-4 py-2 bg-[#0081C9] hover:bg-[#0069a6] text-white rounded-lg text-sm font-medium transition shadow-sm disabled:opacity-50">
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
