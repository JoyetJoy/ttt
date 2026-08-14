import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate, useParams, Link, useLocation } from 'react-router-dom';
import { Plus, X, UploadCloud, MapPin, Image as ImageIcon, FileText, Settings, DollarSign, Tag, CheckSquare, Save, Check, Edit2, Trash2 } from 'lucide-react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';

const mapContainerStyle = { width: '100%', height: '300px', borderRadius: '0.5rem' };
const defaultCenter = { lat: 20.5937, lng: 78.9629 };

export default function AdminTransportForm() {
  const { id } = useParams();
  const location = useLocation();
  const isEdit = Boolean(id);
  const isView = location.pathname.includes('/view/');
  const { token } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('content');
  const [mapCenter, setMapCenter] = useState(defaultCenter);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: "AIzaSyAX_1lQpTBdnMvEOpeXdu9txMXrGU0mJy8",
    libraries: ['geometry', 'drawing', 'places']
  });

  // Locations data
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  
  const [transportLocations, setTransportLocations] = useState([]);
  const [showTransportLocModal, setShowTransportLocModal] = useState(false);
  const [newLocationName, setNewLocationName] = useState('');
  const [editLocationId, setEditLocationId] = useState(null);
  const [editLocationName, setEditLocationName] = useState('');
  // Master Attributes & Vehicles
  const [destinations, setDestinations] = useState([]);
  const [transportAttributes, setTransportAttributes] = useState([]);
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [allVehicles, setAllVehicles] = useState([]);

  // Modals
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [newTypeName, setNewTypeName] = useState('');
  const [editVehicleId, setEditVehicleId] = useState(null);
  
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [locationModalType, setLocationModalType] = useState('country');
  const [locationModalInput, setLocationModalInput] = useState('');
  const [locationModalEditId, setLocationModalEditId] = useState(null);
  const [locationModalSaving, setLocationModalSaving] = useState(false);
  const [editTypeId, setEditTypeId] = useState(null);
  const [editTypeName, setEditTypeName] = useState('');
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [newVehicleName, setNewVehicleName] = useState('');
  const [selectedTypeForVehicle, setSelectedTypeForVehicle] = useState('');

  // Images
  const [featureImageFile, setFeatureImageFile] = useState(null);
  const [featureImagePreview, setFeatureImagePreview] = useState(null);
  const [metaImageFile, setMetaImageFile] = useState(null);
  const [metaImagePreview, setMetaImagePreview] = useState(null);
  const [existingGalleries, setExistingGalleries] = useState([]);
  const [newGalleryFiles, setNewGalleryFiles] = useState([]);
  const [galleryPreviews, setGalleryPreviews] = useState([]);
  const [deletedGalleries, setDeletedGalleries] = useState([]);

  const [formData, setFormData] = useState({
    title: '', slug: '', content: '', youtube_video: '', car_type: '', meta_title: '', meta_desc: '', meta_keyward: '', meta_img: '', include_title: '', exclude_title: '',
    enable_service_fee: 2, distance_km: '',
    address: '', transport_from: '', transport_to: '', country_id: '', state_id: '', city_id: '', zip_code: '',
    map_lat: '', map_lng: '',
    enable_seo: '2', status: 1, view: 0,
    faqs: [], includes: [], excludes: [], service_fees: [], attribute_terms: [],
    pricing_vehicles: [{ type_id: '', vehicle_id: '', capacity: '', price: '', sale_price: '' }]
  });

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/locations/countries`).then(res => res.json()).then(setCountries).catch(console.error);
    fetch(`${import.meta.env.VITE_API_URL}/destinations`).then(res => res.json()).then(setDestinations).catch(console.error);
    fetch(`${import.meta.env.VITE_API_URL}/admin/transport-attributes`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(setTransportAttributes)
      .catch(console.error);
    fetch(`${import.meta.env.VITE_API_URL}/admin/vehicles/types`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json()).then(setVehicleTypes).catch(console.error);
    fetch(`${import.meta.env.VITE_API_URL}/admin/vehicles/list`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json()).then(setAllVehicles).catch(console.error);
    fetch(`${import.meta.env.VITE_API_URL}/admin/transport-locations`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json()).then(setTransportLocations).catch(console.error);

    if (isEdit) {
      fetch(`${import.meta.env.VITE_API_URL}/admin/transports/${id}`, { headers: { Authorization: `Bearer ${token}` } })
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

          const legacyFields = ['car_price', 'car_sale_price', 'train_price', 'train_sale_price', 'train_child_price', 'bus_price', 'bus_sale_price', 'bus_child_price', 'boat_price', 'boat_sale_price', 'boat_child_price', 'min_advance_reservations', 'min_stay', 'car_type', 'car_person'];
          legacyFields.forEach(f => delete data[f]);

          setFormData({
            ...data,
            slug: data.slug || '',
            include_title: data.include_title || '',
            exclude_title: data.exclude_title || '',
            faqs: parseArray(data.faqs),
            includes: parseArray(data.includes),
            excludes: parseArray(data.excludes),
            service_fees: parseArray(data.service_fees),
            attribute_terms: parseArray(data.attribute_terms),
            pricing_vehicles: parseArray(data.pricing_vehicles).length > 0 ? parseArray(data.pricing_vehicles) : [{ type_id: '', vehicle_id: '', capacity: '', price: '', sale_price: '' }]
          });

          if (data.feature_img) setFeatureImagePreview(data.feature_img);
          if (data.meta_img) setMetaImagePreview(data.meta_img);
          if (data.transport_galleries) setExistingGalleries(data.transport_galleries);
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
  }, [isEdit, id, token]);

  useEffect(() => {
    if (formData.country_id) {
      fetch(`${import.meta.env.VITE_API_URL}/locations/states/${formData.country_id}`)
        .then(res => res.json()).then(setStates).catch(console.error);
    } else {
      setStates([]);
    }
  }, [formData.country_id]);

  useEffect(() => {
    if (formData.state_id) {
      fetch(`${import.meta.env.VITE_API_URL}/locations/cities/${formData.state_id}`)
        .then(res => res.json()).then(setCities).catch(console.error);
    } else {
      setCities([]);
    }
  }, [formData.state_id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? (checked ? 1 : 0) : value }));

    if (name === 'city_id' && value && isLoaded && window.google) {
      const city = cities.find(c => String(c.id) === String(value));
      const state = states.find(s => String(s.id) === String(formData.state_id));
      const country = countries.find(c => String(c.id) === String(formData.country_id));
      
      if (city) {
        const searchAddress = `${city.name}${state ? `, ${state.name}` : ''}${country ? `, ${country.name}` : ''}`;
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ address: searchAddress }, (results, status) => {
          if (status === 'OK' && results[0]) {
            const lat = results[0].geometry.location.lat();
            const lng = results[0].geometry.location.lng();
            setFormData(prev => ({ ...prev, map_lat: lat, map_lng: lng }));
            setMapCenter({ lat, lng });
          }
        });
      }
    }
  };

  const handleQuillChange = (value) => {
    setFormData(prev => ({ ...prev, content: value }));
  };

  const handleArrayChange = (field, index, subfield, value) => {
    const newArray = [...formData[field]];
    newArray[index][subfield] = value;
    setFormData(prev => ({ ...prev, [field]: newArray }));
  };

  const addArrayItem = (field, defaultObj) => {
    setFormData(prev => ({ ...prev, [field]: [...prev[field], defaultObj] }));
  };

  const removeArrayItem = (field, index) => {
    setFormData(prev => ({ ...prev, [field]: prev[field].filter((_, i) => i !== index) }));
  };

  const handleAttributeChange = (termId) => {
    setFormData(prev => {
      const exists = prev.attribute_terms.includes(termId);
      return {
        ...prev,
        attribute_terms: exists ? prev.attribute_terms.filter(id => id !== termId) : [...prev.attribute_terms, termId]
      };
    });
  };

  const handleImageChange = (e, setter, previewSetter) => {
    const file = e.target.files[0];
    if (file) {
      setter(file);
      previewSetter(URL.createObjectURL(file));
    }
  };

  const handleGalleryChange = (e) => {
    const files = Array.from(e.target.files);
    setNewGalleryFiles(prev => [...prev, ...files]);
    const previews = files.map(file => URL.createObjectURL(file));
    setGalleryPreviews(prev => [...prev, ...previews]);
  };

  const removeExistingGallery = (galleryId) => {
    setDeletedGalleries(prev => [...prev, galleryId]);
    setExistingGalleries(prev => prev.filter(g => g.id !== galleryId));
  };

  const removeNewGallery = (index) => {
    setNewGalleryFiles(prev => prev.filter((_, i) => i !== index));
    setGalleryPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const submitData = new FormData();
      Object.keys(formData).forEach(key => {
        if (['faqs', 'includes', 'excludes', 'service_fees', 'attribute_terms', 'pricing_vehicles'].includes(key)) {
          submitData.append(key, JSON.stringify(formData[key]));
        } else if (formData[key] !== null && formData[key] !== undefined) {
          submitData.append(key, formData[key]);
        }
      });

      if (deletedGalleries.length > 0) {
        submitData.append('deletedGalleries', JSON.stringify(deletedGalleries));
      }

      if (featureImageFile) submitData.append('feature_img', featureImageFile);
      if (metaImageFile) submitData.append('meta_img', metaImageFile);
      newGalleryFiles.forEach(file => submitData.append('gallery_images', file));

      const res = await fetch(isEdit ? `${import.meta.env.VITE_API_URL}/admin/transports/${id}` : `${import.meta.env.VITE_API_URL}/admin/transports`, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: submitData
      });

      if (res.ok) {
        navigate('/admin/transports');
      } else {
        const errorData = await res.json();
        alert(errorData.error || 'Failed to save transport');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading...</div>;

  const handleAddType = async () => {
    if (!newTypeName) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/vehicles/types`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: newTypeName })
      });
      if (res.ok) {
        const data = await res.json();
        setVehicleTypes(prev => [data, ...prev]);
        setNewTypeName('');
      }
    } catch (error) { console.error(error); }
  };

  const handleUpdateType = async () => {
    if (!editTypeName || !editTypeId) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/vehicles/types/${editTypeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: editTypeName })
      });
      if (res.ok) {
        const data = await res.json();
        setVehicleTypes(prev => prev.map(t => t.id === editTypeId ? data : t));
        setEditTypeId(null);
        setEditTypeName('');
      }
    } catch (error) { console.error(error); }
  };

  const handleDeleteType = async (id) => {
    if (!window.confirm("Are you sure you want to delete this vehicle type?")) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/vehicles/types/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setVehicleTypes(prev => prev.filter(t => t.id !== id));
      } else {
        alert("Cannot delete this type, it might be in use.");
      }
    } catch (error) { console.error(error); }
  };

  const handleAddVehicle = async () => {
    if (!newVehicleName || !selectedTypeForVehicle) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/vehicles/list`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: newVehicleName, type_id: selectedTypeForVehicle })
      });
      if (res.ok) {
        const data = await res.json();
        setAllVehicles(prev => [data, ...prev]);
        setNewVehicleName('');
        setShowVehicleModal(false);
      }
    } catch (error) { console.error(error); }
  };

  const handleAddLocation = async () => {
    if (!newLocationName) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/transport-locations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: newLocationName })
      });
      if (res.ok) {
        const data = await res.json();
        setTransportLocations(prev => [data, ...prev]);
        setNewLocationName('');
      }
    } catch (error) { console.error(error); }
  };

  const handleUpdateLocation = async () => {
    if (!editLocationName || !editLocationId) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/transport-locations/${editLocationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: editLocationName })
      });
      if (res.ok) {
        const data = await res.json();
        setTransportLocations(prev => prev.map(t => t.id === editLocationId ? data : t));
        setEditLocationId(null);
        setEditLocationName('');
      }
    } catch (error) { console.error(error); }
  };

  const handleDeleteLocation = async (id) => {
    if (!window.confirm('Are you sure you want to delete this location?')) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/transport-locations/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setTransportLocations(prev => prev.filter(t => t.id !== id));
        if (editLocationId === id) {
          setEditLocationId(null);
          setEditLocationName('');
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenLocationModal = (type) => {
    setLocationModalType(type);
    setLocationModalInput('');
    setLocationModalEditId(null);
    setLocationModalOpen(true);
  };

  const handleCloseLocationModal = () => {
    setLocationModalOpen(false);
    setLocationModalInput('');
    setLocationModalEditId(null);
  };

  const handleEditLocationModal = (loc) => {
    setLocationModalInput(loc.name);
    setLocationModalEditId(loc.id);
  };

  const handleSaveLocationModal = async (e) => {
    e.preventDefault();
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
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Failed to save location');
      const newLoc = await res.json();
      
      const updateList = (prev) => {
        if (isEdit) return prev.map(item => item.id === newLoc.id ? newLoc : item).sort((a,b) => a.name.localeCompare(b.name));
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
      handleCloseLocationModal();
    } catch (err) {
      console.error(err);
      alert('Failed to save location. ' + err.message);
    } finally {
      setLocationModalSaving(false);
    }
  };

  const handleDeleteGlobalLocation = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this location?')) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/locations/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to delete location');
      
      if (locationModalType === 'country') setCountries(prev => prev.filter(c => c.id !== id));
      else if (locationModalType === 'state') setStates(prev => prev.filter(s => s.id !== id));
      else if (locationModalType === 'city') setCities(prev => prev.filter(c => c.id !== id));
      
      if (locationModalEditId === id) handleCloseLocationModal();
    } catch (err) {
      console.error(err);
      alert('Failed to delete location. It might be in use.');
    }
  };

  const tabs = [
    { id: 'content', label: 'General Info', icon: FileText },
    { id: 'pricing', label: 'Pricing & Extra', icon: Tag },
    { id: 'location', label: 'Location', icon: MapPin },
    { id: 'attributes', label: 'Attributes & Policy', icon: CheckSquare },
    { id: 'seo', label: 'Media & SEO', icon: Settings },
  ];

  return (
    <div className="font-['Inter',sans-serif] max-w-7xl mx-auto p-6 lg:p-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">{!isEdit ? 'Add New Transport' : isView ? 'Manage Transport Details' : 'Edit Basic Info'}</h2>
          <p className="text-slate-500 text-sm mt-1">{isView ? 'Configure your transport details, pricing, location and more.' : 'Enter the basic information. You can add pricing, media, and location details later.'}</p>
        </div>
        <div className="flex gap-3">
          <Link to="/admin/transports" className="px-5 py-2.5 text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-sm font-medium transition">
            Cancel
          </Link>
          <button onClick={handleSubmit} disabled={saving} className="flex items-center gap-2 bg-[#0081C9] hover:bg-[#0069a6] text-white px-5 py-2.5 rounded-lg text-sm font-medium transition shadow-sm disabled:opacity-50">
            <Save size={16} /> {saving ? 'Saving...' : 'Save Transport'}
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {isEdit && (
          <div className="w-full lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-2 flex lg:flex-col gap-1 overflow-x-auto sticky top-4">
              {tabs.map(tab => {
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

        {/* Main Content Area */}
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-100 p-6 md:p-8 min-h-[600px]">
            <form className="space-y-8">
              
              {/* TAB: CONTENT */}
              {activeTab === 'content' && (
                <div className="space-y-6 animate-fadeIn">
                  <h3 className="text-lg font-semibold text-slate-800 border-b pb-2 mb-4">Transport Content</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Title *</label>
                      <input type="text" name="title" value={formData.title} onChange={handleChange} required placeholder="Name of the Transport" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#0081C9] outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">URL Slug</label>
                      <input type="text" name="slug" value={formData.slug} onChange={handleChange} placeholder="e.g. airport-taxi-transfer" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#0081C9] outline-none bg-slate-50" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Content *</label>
                    <div className="h-64 mb-12 border border-gray-200 rounded-lg overflow-hidden">
                      <ReactQuill theme="snow" value={formData.content} onChange={handleQuillChange} className="h-full border-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">YouTube Video Link</label>
                    <input type="text" name="youtube_video" value={formData.youtube_video} onChange={handleChange} placeholder="https://www.youtube.com/watch?v=..." className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#0081C9] outline-none" />
                  </div>

                  {/* FAQs */}
                  <div className="border border-slate-200 rounded-lg overflow-hidden mt-6">
                    <div className="bg-slate-50 px-4 py-3 flex justify-between items-center border-b border-slate-200">
                      <h4 className="font-semibold text-slate-800">FAQs</h4>
                      <button type="button" onClick={() => addArrayItem('faqs', { title: '', desc: '' })} className="text-indigo-600 bg-indigo-100 hover:bg-indigo-200 px-3 py-1.5 rounded text-sm font-medium flex items-center gap-1 transition">
                        <Plus size={16} /> Add FAQ
                      </button>
                    </div>
                    <div className="p-4 space-y-4">
                      {formData.faqs.map((faq, idx) => (
                        <div key={idx} className="flex gap-4 p-4 border border-slate-200 rounded bg-white">
                          <div className="flex-1 flex flex-col gap-4">
                            <input type="text" placeholder="Enter Question" value={faq.title} onChange={(e) => handleArrayChange('faqs', idx, 'title', e.target.value)} className="w-full px-3 py-2 border rounded text-sm focus:ring-1 focus:ring-[#0081C9] outline-none" />
                            <textarea placeholder="Enter Answer" value={faq.desc} onChange={(e) => handleArrayChange('faqs', idx, 'desc', e.target.value)} className="w-full px-3 py-2 border rounded text-sm focus:ring-1 focus:ring-[#0081C9] outline-none" rows="2" />
                          </div>
                          <button type="button" onClick={() => removeArrayItem('faqs', idx)} className="text-red-500 hover:text-red-700 h-fit p-1 bg-red-50 rounded">
                            <X size={18} />
                          </button>
                        </div>
                      ))}
                      {formData.faqs.length === 0 && <p className="text-sm text-slate-500 text-center py-4">No FAQs added yet.</p>}
                    </div>
                  </div>
                  
                  {!isEdit && (
                    <div className="mt-8 bg-indigo-50 rounded-xl p-4 border border-indigo-100 flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-semibold text-indigo-900">Need to add more details?</h4>
                        <p className="text-xs text-indigo-700 mt-1">After saving, you can click the "Eye" or "Edit" icon in the list to manage Pricing, Location, Media, and Details.</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB: PRICING */}
              {activeTab === 'pricing' && (
                <div className="space-y-6 animate-fadeIn">
                  <h3 className="text-lg font-semibold text-slate-800 border-b pb-2 mb-4">Pricing</h3>

                  {(() => {
                    const pv = formData.pricing_vehicles[0] || { type_id: '', vehicle_id: '', capacity: '', price: '', sale_price: '' };
                    return (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1">Type</label>
                          <div className="flex items-center gap-2">
                            <select value={pv.type_id || ''} onChange={(e) => handleArrayChange('pricing_vehicles', 0, 'type_id', e.target.value)} className="w-full px-3 py-2 text-sm rounded border border-gray-300 bg-white outline-none">
                              <option value="">Select Type</option>
                              {vehicleTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                            <button type="button" onClick={() => setShowTypeModal(true)} className="p-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded transition flex-shrink-0"><Plus size={16} /></button>
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1">Vehicle</label>
                          <div className="flex items-center gap-2">
                            <select value={pv.vehicle_id || ''} onChange={(e) => handleArrayChange('pricing_vehicles', 0, 'vehicle_id', e.target.value)} className="w-full px-3 py-2 text-sm rounded border border-gray-300 bg-white outline-none">
                              <option value="">Select Vehicle</option>
                              {allVehicles.filter(v => String(v.type_id) === String(pv.type_id)).map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                            </select>
                            <button type="button" onClick={() => { setSelectedTypeForVehicle(pv.type_id); setShowVehicleModal(true); }} disabled={!pv.type_id} className={`p-2 rounded transition flex-shrink-0 ${pv.type_id ? 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}><Plus size={16} /></button>
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1">Capacity</label>
                          <input type="number" placeholder="Persons" value={pv.capacity || ''} onChange={(e) => handleArrayChange('pricing_vehicles', 0, 'capacity', e.target.value)} className="w-full px-3 py-2 text-sm rounded border border-gray-300 outline-none" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1">Price/Hr</label>
                          <input type="number" placeholder="Price" value={pv.price || ''} onChange={(e) => handleArrayChange('pricing_vehicles', 0, 'price', e.target.value)} className="w-full px-3 py-2 text-sm rounded border border-gray-300 outline-none" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1">Sale Price/Hr</label>
                          <input type="number" placeholder="Sale Price" value={pv.sale_price || ''} onChange={(e) => handleArrayChange('pricing_vehicles', 0, 'sale_price', e.target.value)} className="w-full px-3 py-2 text-sm rounded border border-gray-300 outline-none" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1">Hr/Km</label>
                          <input type="text" placeholder="e.g. 5 Hr / 50 Km" value={pv.hr_km_value || ''} onChange={(e) => handleArrayChange('pricing_vehicles', 0, 'hr_km_value', e.target.value)} className="w-full px-3 py-2 text-sm rounded border border-gray-300 outline-none" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1">Extra Price/Km</label>
                          <input type="number" placeholder="Extra Price" value={pv.extra_price_per_km || ''} onChange={(e) => handleArrayChange('pricing_vehicles', 0, 'extra_price_per_km', e.target.value)} className="w-full px-3 py-2 text-sm rounded border border-gray-300 outline-none" />
                        </div>
                      </div>
                    );
                  })()}

                  {/* Extra Services Removed */}

                </div>
              )}

              {/* TAB: LOCATION */}
              {activeTab === 'location' && (
                <div className="space-y-6 animate-fadeIn">
                  <h3 className="text-lg font-semibold text-slate-800 border-b pb-2 mb-4">Location</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Country *</label>
                      <div className="flex gap-2">
                        <select name="country_id" value={formData.country_id} onChange={handleChange} required className="flex-1 px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#0081C9] bg-white text-sm">
                          <option value="">Select Country</option>
                          {countries.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                        <button type="button" onClick={() => handleOpenLocationModal('country')} className="w-10 flex-shrink-0 flex items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition border border-indigo-100">
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">State *</label>
                      <div className="flex gap-2">
                        <select name="state_id" value={formData.state_id} onChange={handleChange} required className="flex-1 px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#0081C9] bg-white text-sm">
                          <option value="">Select State</option>
                          {states.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                        <button type="button" onClick={() => handleOpenLocationModal('state')} className="w-10 flex-shrink-0 flex items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition border border-indigo-100">
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">City *</label>
                      <div className="flex gap-2">
                        <select name="city_id" value={formData.city_id} onChange={handleChange} required className="flex-1 px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#0081C9] bg-white text-sm">
                          <option value="">Select City</option>
                          {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                        <button type="button" onClick={() => handleOpenLocationModal('city')} className="w-10 flex-shrink-0 flex items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition border border-indigo-100">
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Zip / Postal Code</label>
                      <input type="text" name="zip_code" value={formData.zip_code} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#0081C9] text-sm" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Full Address</label>
                    <textarea name="address" value={formData.address} onChange={handleChange} rows="2" className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#0081C9] text-sm"></textarea>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 border border-slate-200 rounded-lg bg-slate-50">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Latitude *</label>
                      <input type="text" name="map_lat" value={formData.map_lat} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#0081C9] text-sm bg-white" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Longitude *</label>
                      <input type="text" name="map_lng" value={formData.map_lng} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#0081C9] text-sm bg-white" />
                    </div>
                  </div>

                  {isLoaded && (
                    <div className="border border-slate-200 rounded-xl overflow-hidden mt-4">
                      <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 text-xs font-medium text-slate-500">
                        Click on the map to set the exact coordinates
                      </div>
                      <GoogleMap mapContainerStyle={mapContainerStyle} center={mapCenter} zoom={13} onClick={(e) => {
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

              {/* TAB: ATTRIBUTES */}
              {activeTab === 'attributes' && (
                <div className="space-y-8 animate-fadeIn">
                  <h3 className="text-lg font-semibold text-slate-800 border-b pb-2 mb-4">Attributes & Policy</h3>
                  
                  {/* Includes & Excludes */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="border border-green-200 rounded-lg overflow-hidden">
                      <div className="bg-green-50 px-4 py-3 flex justify-between items-center border-b border-green-200">
                        <h4 className="font-semibold text-green-800">Includes</h4>
                      </div>
                      <div className="p-4 space-y-3">
                        <input type="text" name="include_title" value={formData.include_title} onChange={handleChange} placeholder="Custom Header Title (optional)" className="w-full px-3 py-2 text-sm rounded border border-green-300 outline-none focus:ring-1 focus:ring-green-500 mb-2" />
                        
                        {formData.includes.map((inc, idx) => (
                          <div key={idx} className="flex gap-2 items-center">
                            <input type="text" placeholder="Enter include item" value={inc.title} onChange={(e) => handleArrayChange('includes', idx, 'title', e.target.value)} className="flex-1 px-3 py-1.5 border border-green-300 rounded text-sm outline-none focus:ring-1 focus:ring-green-500" />
                            <button type="button" onClick={() => removeArrayItem('includes', idx)} className="w-8 h-8 flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-500 rounded transition flex-shrink-0"><X size={16} /></button>
                          </div>
                        ))}
                        
                        <button type="button" onClick={() => addArrayItem('includes', { title: '' })} className="w-full mt-2 text-green-700 bg-green-100 hover:bg-green-200 px-3 py-2 rounded-lg text-sm font-medium transition">
                          + Add Include Item
                        </button>
                      </div>
                    </div>
                    <div className="border border-red-200 rounded-lg overflow-hidden">
                      <div className="bg-red-50 px-4 py-3 flex justify-between items-center border-b border-red-200">
                        <h4 className="font-semibold text-red-800">Extra charges</h4>
                      </div>
                      <div className="p-4 space-y-3">
                        <input type="text" name="exclude_title" value={formData.exclude_title} onChange={handleChange} placeholder="Custom Header Title (optional)" className="w-full px-3 py-2 text-sm rounded border border-red-300 outline-none focus:ring-1 focus:ring-red-500 mb-2" />
                        
                        {formData.excludes.map((exc, idx) => (
                          <div key={idx} className="flex gap-2 items-center">
                            <input type="text" placeholder="Enter extra charge item" value={exc.title} onChange={(e) => handleArrayChange('excludes', idx, 'title', e.target.value)} className="flex-1 px-3 py-1.5 border border-red-300 rounded text-sm outline-none focus:ring-1 focus:ring-red-500" />
                            <button type="button" onClick={() => removeArrayItem('excludes', idx)} className="w-8 h-8 flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-500 rounded transition flex-shrink-0"><X size={16} /></button>
                          </div>
                        ))}
                        
                        <button type="button" onClick={() => addArrayItem('excludes', { title: '' })} className="w-full mt-2 text-red-700 bg-red-100 hover:bg-red-200 px-3 py-2 rounded-lg text-sm font-medium transition">
                          + Add Extra Charge
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-md font-semibold text-slate-800 mb-3">Attributes</h4>
                    <div className="space-y-6">
                      {transportAttributes.map(attr => (
                        <div key={attr.id} className="p-4 border rounded-lg bg-white shadow-sm">
                          <h5 className="font-medium text-slate-700 mb-3 uppercase tracking-wider text-sm">{attr.name}</h5>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {attr.transport_attribute_terms?.map(term => (
                              <label key={term.id} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-slate-50 p-2 rounded transition">
                                <input 
                                  type="checkbox" 
                                  checked={formData.attribute_terms.includes(String(term.id))} 
                                  onChange={() => handleAttributeChange(String(term.id))} 
                                  className="w-4 h-4 text-indigo-600 rounded border-gray-300"
                                />
                                {term.name}
                              </label>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 border border-slate-200 rounded-lg bg-white mt-6">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-sm font-medium text-slate-700">Transport From</label>
                        <button type="button" onClick={() => setShowTransportLocModal(true)} className="bg-indigo-100 text-indigo-600 hover:bg-indigo-600 hover:text-white w-6 h-6 flex items-center justify-center rounded-full transition"><Plus size={14} /></button>
                      </div>
                      <select name="transport_from" value={formData.transport_from || ''} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-[#0081C9] bg-white">
                        <option value="">Select Location</option>
                        {transportLocations.map(l => <option key={l.id} value={l.name}>{l.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-sm font-medium text-slate-700">Transport To</label>
                        <button type="button" onClick={() => setShowTransportLocModal(true)} className="bg-indigo-100 text-indigo-600 hover:bg-indigo-600 hover:text-white w-6 h-6 flex items-center justify-center rounded-full transition"><Plus size={14} /></button>
                      </div>
                      <select name="transport_to" value={formData.transport_to || ''} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-[#0081C9] bg-white">
                        <option value="">Select Location</option>
                        {transportLocations.map(l => <option key={l.id} value={l.name}>{l.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Distance (km)</label>
                      <input type="text" name="distance_km" value={formData.distance_km || ''} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-[#0081C9]" placeholder="e.g. 500" />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: SEO & MEDIA */}
              {activeTab === 'seo' && (
                <div className="space-y-8 animate-fadeIn">
                  <h3 className="text-lg font-semibold text-slate-800 border-b pb-2 mb-4">Media Images</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Feature Image */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Feature Image *</label>
                      <label className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-indigo-300 bg-indigo-50/50 rounded-xl cursor-pointer hover:bg-indigo-50 transition overflow-hidden">
                        {featureImagePreview ? (
                          <img src={featureImagePreview} alt="Feature" className="w-full h-full object-cover" />
                        ) : (
                          <div className="flex flex-col items-center">
                            <UploadCloud size={36} className="text-indigo-400 mb-2" />
                            <span className="text-sm font-medium text-indigo-600">Click to upload</span>
                            <span className="text-xs text-slate-400 mt-1">PNG, JPG up to 5MB</span>
                          </div>
                        )}
                        <input type="file" accept="image/*" onChange={e => handleImageChange(e, setFeatureImageFile, setFeatureImagePreview)} className="hidden" />
                      </label>
                    </div>

                    {/* Meta Image */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">SEO Meta Image</label>
                      <label className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-slate-300 bg-slate-50/50 rounded-xl cursor-pointer hover:bg-slate-100 transition overflow-hidden">
                        {metaImagePreview ? (
                          <img src={metaImagePreview} alt="Meta" className="w-full h-full object-cover" />
                        ) : (
                          <div className="flex flex-col items-center">
                            <UploadCloud size={36} className="text-slate-400 mb-2" />
                            <span className="text-sm font-medium text-slate-600">Click to upload</span>
                          </div>
                        )}
                        <input type="file" accept="image/*" onChange={e => handleImageChange(e, setMetaImageFile, setMetaImagePreview)} className="hidden" />
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Gallery Images</label>
                    <label className="flex justify-center w-full h-24 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50 transition items-center text-slate-500 gap-2 mb-4">
                      <ImageIcon size={20} /> <span>Choose image files or drag them here</span>
                      <input type="file" multiple accept="image/*" onChange={handleGalleryChange} className="hidden" />
                    </label>

                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                      {existingGalleries.map(gallery => (
                        <div key={gallery.id} className="relative group rounded-lg overflow-hidden border shadow-sm h-24">
                          <img src={gallery.image} alt="Gallery" className="w-full h-full object-cover" />
                          <button type="button" onClick={() => removeExistingGallery(gallery.id)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition shadow-sm z-10"><X size={14}/></button>
                        </div>
                      ))}
                      {galleryPreviews.map((url, index) => (
                        <div key={index} className="relative group rounded-lg overflow-hidden border border-indigo-200 shadow-sm h-24">
                          <img src={url} alt="New Gallery" className="w-full h-full object-cover" />
                          <button type="button" onClick={() => removeNewGallery(index)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition shadow-sm z-10"><X size={14}/></button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold text-slate-800 border-b pb-2 mb-4 mt-12">Search Engine Optimization</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Allow SEO</label>
                      <select name="enable_seo" value={formData.enable_seo} onChange={handleChange} className="w-full lg:w-1/3 px-4 py-2 border rounded-lg bg-white outline-none">
                        <option value="1">Yes</option>
                        <option value="2">No</option>
                      </select>
                    </div>

                    {formData.enable_seo === '1' && (
                      <div className="grid grid-cols-1 gap-6 p-5 border border-slate-200 rounded-lg bg-slate-50">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Meta Title</label>
                          <input type="text" name="meta_title" value={formData.meta_title} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg outline-none" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Meta Description</label>
                          <textarea name="meta_desc" value={formData.meta_desc} onChange={handleChange} rows="3" className="w-full px-4 py-2 border rounded-lg outline-none"></textarea>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Meta Keywords</label>
                          <input type="text" name="meta_keyward" value={formData.meta_keyward} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg outline-none" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

            </form>
        </div>
      </div>

      {/* Slide-over Modals */}
      {showTypeModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex justify-end">
          <div className="bg-white w-full max-w-sm h-full shadow-2xl p-6 flex flex-col animate-fade-in-right">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-800">Add Vehicle Type</h3>
              <button onClick={() => setShowTypeModal(false)} className="text-slate-500 hover:bg-slate-100 p-2 rounded-full"><X size={20} /></button>
            </div>
            <div className="flex-1 flex flex-col min-h-0">
              <div className="mb-6 flex-shrink-0">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Type Name</label>
                <input type="text" value={newTypeName} onChange={(e) => setNewTypeName(e.target.value)} placeholder="E.g., Luxury SUV, Sedan" className="w-full border border-slate-300 rounded-lg px-4 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 mb-4 transition" />
                <button onClick={handleAddType} className="w-full bg-[#0081C9] hover:bg-[#0069a6] text-white font-medium py-2.5 rounded-lg transition shadow-md hover:shadow-lg">Save Type</button>
              </div>

              <div className="flex-1 overflow-y-auto border-t pt-4">
                <h4 className="text-sm font-bold text-slate-700 mb-3">Existing Types</h4>
                <div className="space-y-3 pb-4">
                  {vehicleTypes.map(t => (
                    <div key={t.id} className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg p-3">
                      {editTypeId === t.id ? (
                        <input type="text" value={editTypeName} onChange={(e) => setEditTypeName(e.target.value)} className="flex-1 border border-indigo-300 rounded px-2 py-1 outline-none focus:border-indigo-500 text-sm mr-2" />
                      ) : (
                        <span className="text-sm font-medium text-slate-700">{t.name}</span>
                      )}
                      
                      <div className="flex items-center gap-2">
                        {editTypeId === t.id ? (
                          <>
                            <button onClick={handleUpdateType} className="text-green-600 hover:bg-green-50 p-1.5 rounded transition"><Check size={14} /></button>
                            <button onClick={() => { setEditTypeId(null); setEditTypeName(''); }} className="text-slate-400 hover:bg-slate-200 p-1.5 rounded transition"><X size={14}/></button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => { setEditTypeId(t.id); setEditTypeName(t.name); }} className="text-indigo-600 hover:bg-indigo-50 p-1.5 rounded transition"><Edit2 size={14} /></button>
                            <button onClick={() => handleDeleteType(t.id)} className="text-red-500 hover:bg-red-50 p-1.5 rounded transition"><Trash2 size={14} /></button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showVehicleModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex justify-end">
          <div className="bg-white w-full max-w-sm h-full shadow-2xl p-6 flex flex-col animate-fade-in-right">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-800">Add Vehicle Name</h3>
              <button onClick={() => setShowVehicleModal(false)} className="text-slate-500 hover:bg-slate-100 p-2 rounded-full"><X size={20} /></button>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Parent Type</label>
              <select value={selectedTypeForVehicle} onChange={(e) => setSelectedTypeForVehicle(e.target.value)} className="w-full border border-slate-300 rounded-lg px-4 py-2 outline-none bg-slate-50 text-slate-600 mb-4 cursor-not-allowed" disabled>
                {vehicleTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
              
              <label className="block text-sm font-semibold text-slate-700 mb-2">Vehicle Name</label>
              <input type="text" value={newVehicleName} onChange={(e) => setNewVehicleName(e.target.value)} placeholder="E.g., Range Rover, Mercedes" className="w-full border border-slate-300 rounded-lg px-4 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 mb-6 transition" />
              
              <button onClick={handleAddVehicle} className="w-full bg-[#0081C9] hover:bg-[#0069a6] text-white font-medium py-2.5 rounded-lg transition shadow-md hover:shadow-lg">Save Vehicle</button>
            </div>
          </div>
        </div>
      )}
      {showTransportLocModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setShowTransportLocModal(false)}></div>
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-800">Add Transport Location</h3>
              <button onClick={() => setShowTransportLocModal(false)} className="text-slate-500 hover:bg-slate-100 p-2 rounded-full"><X size={20} /></button>
            </div>
            <div className="flex-1 flex flex-col min-h-0 p-6">
              <div className="mb-6 flex-shrink-0">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Location Name</label>
                <input type="text" value={newLocationName} onChange={(e) => setNewLocationName(e.target.value)} placeholder="E.g., Kannur, Sajek" className="w-full border border-slate-300 rounded-lg px-4 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 mb-4 transition" />
                <button onClick={handleAddLocation} className="w-full bg-[#0081C9] hover:bg-[#0069a6] text-white font-medium py-2.5 rounded-lg transition shadow-md hover:shadow-lg">Save Location</button>
              </div>

              <div className="flex-1 overflow-y-auto border-t pt-4">
                <h4 className="text-sm font-bold text-slate-700 mb-3">Existing Locations</h4>
                <div className="space-y-3 pb-4">
                  {transportLocations.map(l => (
                    <div key={l.id} className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg p-3">
                      {editLocationId === l.id ? (
                        <input type="text" value={editLocationName} onChange={(e) => setEditLocationName(e.target.value)} className="flex-1 border border-indigo-300 rounded px-2 py-1 outline-none focus:border-indigo-500 text-sm mr-2" />
                      ) : (
                        <span className="text-sm font-medium text-slate-700">{l.name}</span>
                      )}
                      
                      <div className="flex items-center gap-2">
                        {editLocationId === l.id ? (
                          <>
                            <button onClick={handleUpdateLocation} className="text-green-600 hover:bg-green-50 p-1.5 rounded transition"><Check size={14} /></button>
                            <button onClick={() => { setEditLocationId(null); setEditLocationName(''); }} className="text-slate-400 hover:bg-slate-200 p-1.5 rounded transition"><X size={14}/></button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => { setEditLocationId(l.id); setEditLocationName(l.name); }} className="text-indigo-600 hover:bg-indigo-50 p-1.5 rounded transition"><Edit2 size={14} /></button>
                            <button onClick={() => handleDeleteLocation(l.id)} className="text-red-500 hover:bg-red-50 p-1.5 rounded transition"><Trash2 size={14} /></button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {locationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity" onClick={handleCloseLocationModal}></div>
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-scale-in">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-semibold text-slate-800 capitalize flex items-center gap-2">
                <MapPin size={16} className="text-indigo-600" />
                Add {locationModalType}
              </h3>
              <button onClick={handleCloseLocationModal} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 transition bg-slate-50 hover:bg-slate-100 rounded-full">
                <X size={16} />
              </button>
            </div>
            
            <form onSubmit={handleSaveLocationModal} className="p-5">
              <div className="mb-5">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">{locationModalType} Name <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  value={locationModalInput} 
                  onChange={(e) => setLocationModalInput(e.target.value)} 
                  placeholder={`Enter ${locationModalType} name...`}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all shadow-sm"
                  autoFocus
                  required
                />
              </div>

              <div className="flex justify-end gap-2 mt-2">
                <button 
                  type="button" 
                  onClick={handleCloseLocationModal}
                  className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition"
                  disabled={locationModalSaving}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition shadow-sm flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  disabled={locationModalSaving || !locationModalInput.trim()}
                >
                  {locationModalSaving ? (
                    <><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Saving...</>
                  ) : (
                    <><Save size={14} /> Save {locationModalType}</>
                  )}
                </button>
              </div>
            </form>
            
            <div className="bg-slate-50 border-t border-slate-100 p-4 max-h-48 overflow-y-auto">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Existing {locationModalType}s</h4>
              <div className="space-y-1">
                {(locationModalType === 'country' ? countries : locationModalType === 'state' ? states : cities).length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-1">No {locationModalType}s found.</p>
                ) : (
                  (locationModalType === 'country' ? countries : locationModalType === 'state' ? states : cities).map(item => (
                    <div key={item.id} className="flex items-center justify-between group py-1.5 px-2 hover:bg-white rounded border border-transparent hover:border-slate-200 transition">
                      <span className="text-sm text-slate-700">{item.name}</span>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                        <button type="button" onClick={() => handleEditLocationModal(item)} className="p-1 text-slate-400 hover:text-indigo-600 transition" title="Edit">
                          <Edit2 size={12} />
                        </button>
                        <button type="button" onClick={(e) => handleDeleteGlobalLocation(item.id, e)} className="p-1 text-slate-400 hover:text-red-500 transition" title="Delete">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
