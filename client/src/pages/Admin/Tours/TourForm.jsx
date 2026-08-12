import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate, useParams, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { Save, ArrowLeft, Image as ImageIcon, MapPin, Tag, List, Settings, X, Plus, Edit2, Trash2 } from 'lucide-react';
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';

const mapContainerStyle = { width: '100%', height: '300px', borderRadius: '0.5rem' };
const defaultCenter = { lat: 20.5937, lng: 78.9629 }; 

const CustomMultiSelect = ({ options, selectedValues, onChange, placeholder, valueKey = 'id', labelKey = 'name' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (val) => {
    if (!selectedValues.includes(val)) {
      onChange([...selectedValues.filter(Boolean), val]);
    }
    setIsOpen(false);
  };

  const handleRemove = (e, valToRemove) => {
    e.stopPropagation();
    onChange(selectedValues.filter(v => v !== valToRemove));
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <div 
        className="min-h-[42px] w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white cursor-pointer flex flex-wrap gap-2 items-center hover:border-indigo-300 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedValues.filter(Boolean).length === 0 && (
          <span className="text-slate-400">{placeholder}</span>
        )}
        {selectedValues.filter(Boolean).map((val, idx) => {
          const opt = options.find(o => String(o[valueKey]) === String(val));
          const label = opt ? (opt[labelKey] || opt.title) : val;
          return (
            <span key={idx} className="flex items-center gap-1.5 bg-white text-slate-700 px-3 py-1 rounded-md text-sm font-medium border border-slate-200 shadow-sm">
              {label}
              <button 
                type="button" 
                onClick={(e) => handleRemove(e, val)}
                className="text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-sm p-0.5 transition"
              >
                <X size={14} />
              </button>
            </span>
          );
        })}
      </div>
      
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-1 duration-150">
          {options.filter(o => !selectedValues.includes(String(o[valueKey]))).length === 0 ? (
            <div className="px-4 py-3 text-sm text-slate-500 text-center">No more options</div>
          ) : (
            options
              .filter(o => !selectedValues.map(String).includes(String(o[valueKey])))
              .map(o => (
                <div 
                  key={o.id} 
                  className="px-4 py-2.5 text-sm hover:bg-indigo-50 cursor-pointer transition text-slate-700 border-b border-slate-50 last:border-0"
                  onClick={() => handleSelect(String(o[valueKey]))}
                >
                  {o[labelKey] || o.title}
                </div>
              ))
          )}
        </div>
      )}
    </div>
  );
};

export default function AdminTourForm() {
  const { id } = useParams();
  const location = useLocation();
  const isEdit = Boolean(id);
  const isView = location.pathname.includes('/view/');
  const { token, user } = useAuth();
  const navigate = useNavigate();

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: "AIzaSyAX_1lQpTBdnMvEOpeXdu9txMXrGU0mJy8",
    libraries: ['geometry', 'drawing', 'places']
  });

  const imageHandler = useCallback(function() {
    const editor = this.quill;
    
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      const file = input.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'tours/content');

      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/upload`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData
        });
        if (!res.ok) throw new Error('Upload failed');
        const data = await res.json();
        
        const range = editor.getSelection(true); // pass true to focus if needed
        editor.insertEmbed(range.index, 'image', data.url);
      } catch (err) {
        console.error('Image upload failed', err);
        alert('Image upload failed');
      }
    };
  }, [token]);

  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, false] }],
        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
        [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
        ['link', 'image'],
        ['clean']
      ],
      handlers: {
        image: imageHandler
      }
    }
  }), [imageHandler]);


  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [categorySaving, setCategorySaving] = useState(false);
  const [categoryEditId, setCategoryEditId] = useState(null);

  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [locationModalType, setLocationModalType] = useState('country');
  const [locationModalInput, setLocationModalInput] = useState('');
  const [locationModalEditId, setLocationModalEditId] = useState(null);
  const [locationModalSaving, setLocationModalSaving] = useState(false);

  const [destModalOpen, setDestModalOpen] = useState(false);
  const [destModalInput, setDestModalInput] = useState('');
  const [destModalImage, setDestModalImage] = useState(null);
  const [destModalEditId, setDestModalEditId] = useState(null);
  const [destModalSaving, setDestModalSaving] = useState(false);

  const [mapCenter, setMapCenter] = useState(defaultCenter);

  const [masterAttributes, setMasterAttributes] = useState([]);
  const [showAttributeModal, setShowAttributeModal] = useState(false);
  const [attributeModalData, setAttributeModalData] = useState({ id: null, name: '', termsString: '' });
  const [attributeSaving, setAttributeSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    shoulder: '',
    content: '',
    youtube_video: '',
    sub_destination: '',
    min_people: '',
    max_people: '',
    min_advance_reservations: '',
    cancellation: '',
    duration: '',
    itinerary: [],
    price_symbol: '',
    price: '',
    sale_price: '',
    child_price: '',
    starts_from: '',
    
    enable_service_fee: '0',
    service_fees: [],
    
    address: '',
    country_id: '',
    state_id: '',
    city_id: '',
    zip_code: '',
    map_lat: '',
    map_lng: '',
    
    enable_fixed_dates: '0',
    fixed_dates: [],
    
    enable_open_hours: '0',
    open_hours: {
      monday: { isOpen: false, start: '00:00', end: '00:00' },
      tuesday: { isOpen: false, start: '00:00', end: '00:00' },
      wednesday: { isOpen: false, start: '00:00', end: '00:00' },
      thursday: { isOpen: false, start: '00:00', end: '00:00' },
      friday: { isOpen: false, start: '00:00', end: '00:00' },
      saturday: { isOpen: false, start: '00:00', end: '00:00' },
      sunday: { isOpen: false, start: '00:00', end: '00:00' }
    },

    enable_seo: '0',
    meta_title: '',
    meta_desc: '',
    meta_keyward: '',
    
    faq_title: '',
    include_title: '',
    exclude_title: '',
    highlight_title: '',
    itinerary_title: '',

    category_id: '',
    destination_id: '',
    
    attribute_terms: [],
    status: 1
  });

  const [featuresImageFile, setFeaturesImageFile] = useState(null);
  const [featuresImagePreview, setFeaturesImagePreview] = useState(null);
  
  const [youtubeImageFile, setYoutubeImageFile] = useState(null);
  const [youtubeImagePreview, setYoutubeImagePreview] = useState(null);

  const [existingGalleries, setExistingGalleries] = useState([]);
  const [newGalleryFiles, setNewGalleryFiles] = useState([]);
  const [galleryPreviews, setGalleryPreviews] = useState([]);
  const [deletedGalleries, setDeletedGalleries] = useState([]);

  // Complex lists
  const [faqs, setFaqs] = useState([{ question: '', answer: '' }]);
  const [includes, setIncludes] = useState([{ item: '' }]);
  const [excludes, setExcludes] = useState([{ item: '' }]);
  const [highlights, setHighlights] = useState([{ item: '' }]);
  const [itinerary, setItinerary] = useState([{ title: '', content: '' }]);

  // Reference Data
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedDestinations, setSelectedDestinations] = useState(['']);
  const [subDestinations, setSubDestinations] = useState(['']);

  useEffect(() => {
    fetchCategories();
    fetchDestinations();
    fetchMasterAttributes();
    
    fetch(`${import.meta.env.VITE_API_URL}/locations/countries`)
      .then(res => res.json())
      .then(data => setCountries(data || []))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (formData.country_id) {
      fetch(`${import.meta.env.VITE_API_URL}/locations/states/${formData.country_id}`)
        .then(res => res.json())
        .then(data => setStates(data || []))
        .catch(console.error);
    } else {
      setStates([]);
    }
  }, [formData.country_id]);

  useEffect(() => {
    if (formData.state_id) {
      fetch(`${import.meta.env.VITE_API_URL}/locations/cities/${formData.state_id}`)
        .then(res => res.json())
        .then(data => setCities(data || []))
        .catch(console.error);
    } else {
      setCities([]);
    }
  }, [formData.state_id]);

  useEffect(() => {
    if (!isLoaded || !window.google) return;
    
    const country = countries.find(c => String(c.id) === String(formData.country_id))?.name || '';
    const state = states.find(s => String(s.id) === String(formData.state_id))?.name || '';
    const city = cities.find(c => String(c.id) === String(formData.city_id))?.name || '';

    const addressParts = [city, state, country].filter(Boolean);
    if (addressParts.length === 0) return;
    
    const address = addressParts.join(', ');
    const geocoder = new window.google.maps.Geocoder();
    
    geocoder.geocode({ address }, (results, status) => {
      if (status === 'OK' && results[0]) {
        const { lat, lng } = results[0].geometry.location;
        const newLat = lat();
        const newLng = lng();
        setMapCenter({ lat: newLat, lng: newLng });
        
        setFormData(prev => ({
          ...prev,
          map_lat: newLat.toString(),
          map_lng: newLng.toString()
        }));
      }
    });
  }, [formData.country_id, formData.state_id, formData.city_id, isLoaded]);

  useEffect(() => {
    if (isEdit) {
      fetch(`${import.meta.env.VITE_API_URL}/admin/tours/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          const safeParseArray = (val) => {
            if (Array.isArray(val)) return val;
            if (!val) return [];
            try { const parsed = JSON.parse(val); return Array.isArray(parsed) ? parsed : []; } catch(e) { return []; }
          };
          const safeParseObj = (val, fallback) => {
            if (val && typeof val === 'object' && !Array.isArray(val)) return val;
            if (!val) return fallback;
            try { return JSON.parse(val); } catch(e) { return fallback; }
          };

          setFormData(prev => ({
            ...prev,
            ...data,
            enable_service_fee: String(data.enable_service_fee || '0'),
            enable_fixed_dates: String(data.enable_fixed_dates || '0'),
            enable_open_hours: String(data.enable_open_hours || '0'),
            enable_seo: String(data.enable_seo || '0'),
            country_id: data.country_id || '',
            state_id: data.state_id || '',
            city_id: data.city_id || '',
            destination_id: data.destination_id || '',
            category_id: data.category_id || '',
            faq_title: data.faq_title || '',
            include_title: data.include_title || '',
            exclude_title: data.exclude_title || '',
            highlight_title: data.highlight_title || '',
            itinerary_title: data.itinerary_title || '',
            service_fees: safeParseArray(data.service_fees),
            fixed_dates: safeParseArray(data.fixed_dates),
            open_hours: safeParseObj(data.open_hours, prev.open_hours),
            attribute_terms: safeParseArray(data.attribute_terms)
          }));
          
          if (data.faqs) setFaqs(safeParseArray(data.faqs));
          if (data.includes) setIncludes(safeParseArray(data.includes));
          if (data.excludes) setExcludes(safeParseArray(data.excludes));
          if (data.highlights) setHighlights(safeParseArray(data.highlights));
          if (data.itinerary) setItinerary(safeParseArray(data.itinerary));

          // Populate sub destinations
          if (data.sub_destination) {
            try {
              let subArr = typeof data.sub_destination === 'string' ? JSON.parse(data.sub_destination) : data.sub_destination;
              if (Array.isArray(subArr) && subArr.length > 0) setSubDestinations(subArr);
            } catch { setSubDestinations([data.sub_destination]); }
          }
          
          if (data.features_image) setFeaturesImagePreview(data.features_image);
          if (data.youtube_image) setYoutubeImagePreview(data.youtube_image);
          if (data.tour_galleries) setExistingGalleries(data.tour_galleries);

          // Populate multi-destinations from destinations_array
          try {
            let destArr = data.destinations_array;
            if (typeof destArr === 'string') destArr = JSON.parse(destArr);
            if (Array.isArray(destArr) && destArr.length > 0) {
              setSelectedDestinations(destArr.map(String));
            } else if (data.destination_id) {
              setSelectedDestinations([String(data.destination_id)]);
            }
          } catch { if (data.destination_id) setSelectedDestinations([String(data.destination_id)]); }
          
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
  }, [id, isEdit, token]);

  const fetchDestinations = async () => {
    fetch(`${import.meta.env.VITE_API_URL}/admin/destinations`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => setDestinations(data.destinations || []))
      .catch(console.error);
  };

  const fetchCategories = async () => {
    fetch(`${import.meta.env.VITE_API_URL}/admin/tour-categories`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => setCategories(data || []))
      .catch(console.error);
  };

  const fetchMasterAttributes = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/tour-attributes`);
      if (res.ok) {
        const data = await res.json();
        setMasterAttributes(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

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

  const handleMapClick = (e) => {
    setFormData(prev => ({
      ...prev,
      map_lat: e.latLng.lat().toString(),
      map_lng: e.latLng.lng().toString()
    }));
  };

  const handleListChange = (setter, index, field, value) => {
    setter(prev => {
      const copy = [...prev];
      copy[index][field] = value;
      return copy;
    });
  };

  const handleServiceFeeChange = (index, field, value) => {
    setFormData(prev => {
      const fees = [...prev.service_fees];
      fees[index][field] = value;
      return { ...prev, service_fees: fees };
    });
  };
  const removeServiceFee = (index) => {
    setFormData(prev => ({ ...prev, service_fees: prev.service_fees.filter((_, i) => i !== index) }));
  };

  const handleFixedDateChange = (index, field, value) => {
    setFormData(prev => {
      const dates = [...prev.fixed_dates];
      dates[index][field] = value;
      return { ...prev, fixed_dates: dates };
    });
  };
  const removeFixedDate = (index) => {
    setFormData(prev => ({ ...prev, fixed_dates: prev.fixed_dates.filter((_, i) => i !== index) }));
  };
  const addFixedDate = (e) => {
    e.preventDefault();
    setFormData(prev => ({
      ...prev,
      fixed_dates: [...prev.fixed_dates, { start_date: '', end_date: '', last_booking_date: '' }]
    }));
  };

  const handleOpenAttributeModal = (attr = null) => {
    if (attr) {
      setAttributeModalData({ id: attr.id, name: attr.name, termsString: attr.tour_attribute_terms.map(t => t.name).join(', ') });
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
        ? `${import.meta.env.VITE_API_URL}/tour-attributes/${attributeModalData.id}` 
        : `${import.meta.env.VITE_API_URL}/tour-attributes`;
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
      await fetch(`${import.meta.env.VITE_API_URL}/tour-attributes/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchMasterAttributes();
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenHourChange = (day, field, value) => {
    setFormData(prev => ({
      ...prev,
      open_hours: {
        ...prev.open_hours,
        [day]: { ...prev.open_hours[day], [field]: value }
      }
    }));
  };

  const handleFileChange = (e, setFile, setPreview) => {
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

  const handleSave = async () => {
    setSaving(true);
    try {
      const submitData = new FormData();
      const skipKeys = ['faqs', 'includes', 'excludes', 'highlights', 'itinerary', 'sub_destination', 'destinations_array'];
      Object.keys(formData).forEach(key => {
        if (skipKeys.includes(key)) return;
        if (key === 'service_fees' || key === 'fixed_dates' || key === 'open_hours' || key === 'attribute_terms') {
          submitData.append(key, JSON.stringify(formData[key]));
        } else {
          submitData.append(key, formData[key] === null ? '' : formData[key]);
        }
      });

      // Override destination_id with first selected, and set destinations_array
      const validDests = selectedDestinations.filter(Boolean);
      if (validDests.length > 0) {
        submitData.set('destination_id', validDests[0]);
        submitData.set('destinations_array', JSON.stringify(validDests));
      }

      // Override sub_destination with the array
      const validSubs = subDestinations.filter(s => s.trim());
      submitData.set('sub_destination', JSON.stringify(validSubs));

      submitData.append('faqs', JSON.stringify(faqs));
      submitData.append('includes', JSON.stringify(includes));
      submitData.append('excludes', JSON.stringify(excludes));
      submitData.append('highlights', JSON.stringify(highlights));
      submitData.append('itinerary', JSON.stringify(itinerary));

      if (featuresImageFile) submitData.append('features_image', featuresImageFile);
      if (youtubeImageFile) submitData.append('youtube_image', youtubeImageFile);
      newGalleryFiles.forEach(file => submitData.append('gallery_images', file));
      if (deletedGalleries.length > 0) submitData.append('deletedGalleries', JSON.stringify(deletedGalleries));

      const method = isEdit ? 'PUT' : 'POST';
      const url = isEdit ? `${import.meta.env.VITE_API_URL}/admin/tours/${id}` : `${import.meta.env.VITE_API_URL}/admin/tours`;

      const res = await fetch(url, { method, headers: { Authorization: `Bearer ${token}` }, body: submitData });
      if (!res.ok) {
        let errMsg = 'Failed to save tour';
        try {
          const errData = await res.json();
          errMsg = errData.error || errMsg;
        } catch(e) {}
        throw new Error(errMsg);
      }
      
      alert(`Tour ${isEdit ? 'updated' : 'created'} successfully!`);
      navigate('/admin/tours');
    } catch (error) {
      console.error(error);
      alert(error.message || 'Error saving tour');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    setCategorySaving(true);
    try {
      if (categoryEditId) {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/tour-categories/${categoryEditId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ name: newCategoryName })
        });
        if (res.ok) {
          const updated = await res.json();
          setCategories(prev => prev.map(c => c.id === updated.id ? updated : c).sort((a,b) => a.name.localeCompare(b.name)));
          setNewCategoryName('');
          setCategoryEditId(null);
        }
      } else {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/tour-categories`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ name: newCategoryName })
        });
        if (res.ok) {
          const created = await res.json();
          setCategories(prev => [...prev, created].sort((a,b) => a.name.localeCompare(b.name)));
          setNewCategoryName('');
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCategorySaving(false);
    }
  };

  const handleEditCategory = (cat) => {
    setNewCategoryName(cat.name);
    setCategoryEditId(cat.id);
  };

  const handleDeleteCategory = async (catId) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/tour-categories/${catId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setCategories(prev => prev.filter(c => c.id !== catId));
        if (Number(formData.category_id) === Number(catId)) {
          setFormData(prev => ({ ...prev, category_id: '' }));
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

  const handleEditLocation = (loc) => {
    setLocationModalInput(loc.name);
    setLocationModalEditId(loc.id);
  };

  const handleDeleteLocation = async (id) => {
    if (!window.confirm(`Are you sure you want to delete this ${locationModalType}?`)) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/locations/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to delete');
      
      if (locationModalType === 'country') {
        setCountries(prev => prev.filter(c => c.id !== id));
        if (formData.country_id === id) setFormData(prev => ({ ...prev, country_id: '', state_id: '', city_id: '' }));
      } else if (locationModalType === 'state') {
        setStates(prev => prev.filter(s => s.id !== id));
        if (formData.state_id === id) setFormData(prev => ({ ...prev, state_id: '', city_id: '' }));
      } else if (locationModalType === 'city') {
        setCities(prev => prev.filter(c => c.id !== id));
        if (formData.city_id === id) setFormData(prev => ({ ...prev, city_id: '' }));
      }
    } catch (err) {
      console.error(err);
      alert('Error deleting location');
    }
  };

  const handleCreateLocation = async () => {
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
      handleCloseLocationModal();
    } catch (err) {
      console.error(err);
      alert(`Error ${locationModalEditId ? 'updating' : 'creating'} location`);
    } finally {
      setLocationModalSaving(false);
    }
  };

  const handleOpenDestModal = () => {
    setDestModalInput('');
    setDestModalImage(null);
    setDestModalEditId(null);
    setDestModalOpen(true);
  };

  const handleCloseDestModal = () => {
    setDestModalOpen(false);
    setDestModalInput('');
    setDestModalImage(null);
    setDestModalEditId(null);
  };

  const handleCreateDest = async () => {
    if (!destModalInput.trim()) return;
    setDestModalSaving(true);
    try {
      const isEdit = !!destModalEditId;
      const url = isEdit ? `${import.meta.env.VITE_API_URL}/admin/destinations/${destModalEditId}` : `${import.meta.env.VITE_API_URL}/admin/destinations`;
      const method = isEdit ? 'PUT' : 'POST';
      
      const payload = new FormData();
      payload.append('title', destModalInput.trim());
      payload.append('author_id', String(user?.id || 1));
      if (destModalImage) {
        payload.append('features_image', destModalImage);
      }

      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: payload
      });

      if (!res.ok) throw new Error(`Failed to ${isEdit ? 'update' : 'create'} destination`);
      
      await fetchDestinations();
      handleCloseDestModal();
    } catch (err) {
      console.error(err);
      alert(`Error ${destModalEditId ? 'updating' : 'creating'} destination`);
    } finally {
      setDestModalSaving(false);
    }
  };

  const handleEditDest = (dest) => {
    setDestModalInput(dest.name || dest.title);
    setDestModalEditId(dest.id);
  };

  const handleDeleteDest = async (id) => {
    if (!window.confirm('Are you sure you want to delete this destination?')) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/destinations/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to delete');
      await fetchDestinations();
      setDestinations(prev => prev.filter(d => d.id !== id));
    } catch (err) {
      console.error(err);
      alert('Error deleting destination');
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading...</div>;

  return (
    <div className="p-4 md:p-6 lg:p-8 bg-[#F4F6F9] min-h-full font-['Inter',sans-serif]">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-3">
          <Link to="/admin/tours" className="p-2 bg-white rounded-lg border border-slate-200 hover:bg-slate-50 transition">
            <ArrowLeft size={18} className="text-slate-600" />
          </Link>
          <div>
            <h3 className="text-xl font-bold text-slate-800">{!isEdit ? 'Add New Tour' : isView ? 'Manage Tour Details' : 'Edit Basic Info'}</h3>
            <p className="text-sm text-slate-500 mt-1">{isView ? 'Manage tour details, pricing, and locations.' : 'Enter the basic information. You can add pricing, media, and location details later.'}</p>
          </div>
        </div>
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-[#0081C9] hover:bg-[#0069a6] text-white px-5 py-2.5 rounded-lg text-sm font-medium transition shadow-sm disabled:opacity-50">
          <Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {isView && (
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-2 flex flex-col gap-1 sticky top-6">
              <TabButton active={activeTab === 'general'} onClick={() => setActiveTab('general')} icon={<List size={18} />} label="General Info" />
              <TabButton active={activeTab === 'details'} onClick={() => setActiveTab('details')} icon={<Settings size={18} />} label="Tour Details" />
              <TabButton active={activeTab === 'pricing'} onClick={() => setActiveTab('pricing')} icon={<Tag size={18} />} label="Pricing" />
              <TabButton active={activeTab === 'location'} onClick={() => setActiveTab('location')} icon={<MapPin size={18} />} label="Location" />
              <TabButton active={activeTab === 'media'} onClick={() => setActiveTab('media')} icon={<ImageIcon size={18} />} label="Media & SEO" />
              <TabButton active={activeTab === 'attributes'} onClick={() => setActiveTab('attributes')} icon={<List size={18} />} label="Attributes" />
            </div>
          </div>
        )}

        <div className={isView ? "lg:col-span-3" : "lg:col-span-4"}>
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            
            {activeTab === 'general' && (
              <div className="space-y-5 animate-in fade-in duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Title <span className="text-red-500">*</span></label>
                    <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="Name of the tour" className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#0081C9]" required />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Label <span className="text-red-500">*</span></label>
                    <input type="text" name="shoulder" value={formData.shoulder} onChange={handleChange} placeholder="Name of the Label" className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#0081C9]" required />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Content <span className="text-red-500">*</span></label>
                  <ReactQuill modules={modules} value={formData.content} onChange={handleContentChange} theme="snow" placeholder="Write here.." className="bg-white rounded-lg" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4 border-t border-slate-100">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">YouTube Video URL</label>
                    <input type="text" name="youtube_video" value={formData.youtube_video} onChange={handleChange} placeholder="Paste the YouTube video URL here" className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#0081C9]" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">YouTube Video Thumbnail</label>
                    <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, setYoutubeImageFile, setYoutubeImagePreview)} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700" />
                    {youtubeImagePreview && <img src={youtubeImagePreview} alt="Youtube Preview" className="mt-2 w-32 h-20 object-cover rounded-lg border border-gray-200" />}
                  </div>
                </div>
                

              
              {!isView && (
                <div className="mt-8 bg-indigo-50 rounded-xl p-4 border border-indigo-100 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-indigo-900">Need to add more details?</h4>
                    <p className="text-xs text-indigo-700 mt-1">After saving, you can click the "Eye" icon in the list to manage Pricing, Location, Media, and Details.</p>
                  </div>
                </div>
              )}
            </div>
            )}

            {isView && activeTab === 'details' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                {/* Destinations & Sub Destinations */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pb-2 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-bold text-slate-800 text-sm">Destinations</h4>
                      <button type="button" onClick={handleOpenDestModal} className="w-5 h-5 flex items-center justify-center rounded-md bg-green-500 text-white hover:bg-green-600 transition shadow-sm" title="Manage Destinations">
                        <Plus size={12} strokeWidth={3} />
                      </button>
                    </div>
                    <CustomMultiSelect 
                      options={destinations}
                      selectedValues={selectedDestinations}
                      onChange={setSelectedDestinations}
                      placeholder="Select Destinations..."
                      valueKey="id"
                    />
                  </div>

                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-bold text-slate-800 text-sm">Sub Destinations</h4>
                    </div>
                    <CreatableTagInput 
                      selectedValues={subDestinations}
                      onChange={setSubDestinations}
                      placeholder="Type and press Enter..."
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Tour Duration</label>
                    <input type="text" name="duration" value={formData.duration} onChange={handleChange} placeholder="Tour Duration" className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Tour Min People</label>
                    <input type="text" name="min_people" value={formData.min_people} onChange={handleChange} placeholder="Tour Min People" className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Tour Max People</label>
                    <input type="text" name="max_people" value={formData.max_people} onChange={handleChange} placeholder="Tour Max People" className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Minimum advance reservations</label>
                    <input type="number" name="min_advance_reservations" value={formData.min_advance_reservations} onChange={handleChange} placeholder="Ex: 3" className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200" />
                    <p className="text-[10px] text-gray-500 mt-1">Leave blank if you dont need to use the min day option</p>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Cancellation (hours)</label>
                    <input type="number" name="cancellation" value={formData.cancellation} onChange={handleChange} placeholder="Cancellation" className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200" />
                  </div>
                </div>

                <DynamicListSection title="FAQs" commonTitleField="faq_title" commonTitleValue={formData.faq_title} onCommonTitleChange={handleChange} items={faqs} setItems={setFaqs} emptyItem={{question:'', answer:''}}>
                  {(item, idx) => (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input type="text" value={item.question} onChange={e => handleListChange(setFaqs, idx, 'question', e.target.value)} placeholder="Enter Question" className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200" />
                      <textarea 
                        value={item.answer} 
                        onChange={e => handleListChange(setFaqs, idx, 'answer', e.target.value)} 
                        placeholder="Enter Answer" 
                        className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 min-h-[42px] resize-y" 
                      />
                    </div>
                  )}
                </DynamicListSection>

                <DynamicListSection title="Include" commonTitleField="include_title" commonTitleValue={formData.include_title} onCommonTitleChange={handleChange} items={includes} setItems={setIncludes} emptyItem={{item:''}}>
                  {(item, idx) => <input type="text" value={item.item} onChange={e => handleListChange(setIncludes, idx, 'item', e.target.value)} placeholder="Enter include item" className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200" />}
                </DynamicListSection>
                <DynamicListSection title="Exclude" commonTitleField="exclude_title" commonTitleValue={formData.exclude_title} onCommonTitleChange={handleChange} items={excludes} setItems={setExcludes} emptyItem={{item:''}}>
                  {(item, idx) => <input type="text" value={item.item} onChange={e => handleListChange(setExcludes, idx, 'item', e.target.value)} placeholder="Enter exclude item" className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200" />}
                </DynamicListSection>
                <DynamicListSection title="Highlights" commonTitleField="highlight_title" commonTitleValue={formData.highlight_title} onCommonTitleChange={handleChange} items={highlights} setItems={setHighlights} emptyItem={{item:''}}>
                  {(item, idx) => <input type="text" value={item.item} onChange={e => handleListChange(setHighlights, idx, 'item', e.target.value)} placeholder="Enter highlight item" className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200" />}
                </DynamicListSection>
                <DynamicListSection title="Itinerary" commonTitleField="itinerary_title" commonTitleValue={formData.itinerary_title} onCommonTitleChange={handleChange} items={itinerary} setItems={setItinerary} emptyItem={{title:'', content:''}}>
                  {(item, idx) => (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="self-start mt-2">
                        <input type="text" value={item.title} onChange={e => handleListChange(setItinerary, idx, 'title', e.target.value)} placeholder="Enter Title (e.g., Day 1)" className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200" />
                      </div>
                      <div className="w-full mt-2">
                        <textarea 
                          value={(item.content || '').replace(/<\/?p>|<br\s*\/?>/gi, '')} 
                          onChange={e => handleListChange(setItinerary, idx, 'content', e.target.value)} 
                          placeholder="Enter Itinerary Details here..." 
                          className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 min-h-[120px] resize-y" 
                        />
                      </div>
                    </div>
                  )}
                </DynamicListSection>
              </div>
            )}

            {isView && activeTab === 'pricing' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Adult Price <span className="text-red-500">*</span></label>
                    <input type="number" name="price" value={formData.price} onChange={handleChange} placeholder="Adult Price" className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200" required />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Adult Sale Price</label>
                    <input type="number" name="sale_price" value={formData.sale_price} onChange={handleChange} placeholder="Adult Sale Price" className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Child Price</label>
                    <input type="number" name="child_price" value={formData.child_price} onChange={handleChange} placeholder="Child Price" className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Tour Starts From</label>
                    <input type="text" name="starts_from" value={formData.starts_from} onChange={handleChange} placeholder="e.g., City Center, Airport, Hotel" className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200" />
                  </div>
                  
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <div className="mb-4">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" name="enable_service_fee" checked={formData.enable_service_fee === '1'} onChange={handleChange} className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
                      <span className="ml-3 text-sm font-semibold text-slate-800">Enable Service Fee</span>
                    </label>
                  </div>
                  
                  {formData.enable_service_fee === '1' && (
                    <div className="space-y-4">
                      {formData.service_fees.map((fee, idx) => (
                        <div key={idx} className="flex gap-4 items-center bg-gray-50 p-4 rounded-lg border border-gray-200 relative">
                          <input type="text" value={fee.name} onChange={e => handleServiceFeeChange(idx, 'name', e.target.value)} placeholder="Service Name" className="flex-1 px-3 py-2 text-sm rounded border border-gray-300" />
                          <input type="number" value={fee.price} onChange={e => handleServiceFeeChange(idx, 'price', e.target.value)} placeholder="Price" className="w-32 px-3 py-2 text-sm rounded border border-gray-300" />
                          <select value={fee.type} onChange={e => handleServiceFeeChange(idx, 'type', e.target.value)} className="w-36 px-3 py-2 text-sm rounded border border-gray-300">
                            <option>Fixed</option>
                            <option>Price One Time</option>
                            <option>Price Per Person</option>
                          </select>
                          <button onClick={() => removeServiceFee(idx)} className="text-red-500 p-2 hover:bg-red-50 rounded"><X size={16}/></button>
                        </div>
                      ))}
                      <button onClick={() => setFormData(p => ({...p, service_fees: [...p.service_fees, { name: '', price: '', type: 'Fixed' }]}))} className="flex items-center gap-2 text-indigo-600 bg-indigo-50 px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-100"><Plus size={16} /> Add Service Fee</button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {isView && activeTab === 'location' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Address</label>
                  <input type="text" name="address" value={formData.address} onChange={handleChange} placeholder="Address" className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Country <span className="text-red-500">*</span></label>
                    <select name="country_id" value={formData.country_id} onChange={handleChange} className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 bg-white" required>
                      <option value="">Select Country</option>
                      {countries.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-slate-700">State / Region <span className="text-red-500">*</span></label>
                      {formData.country_id && (
                        <button type="button" onClick={() => handleOpenLocationModal('state')} className="w-5 h-5 flex items-center justify-center rounded-md bg-indigo-50 text-indigo-600 hover:bg-indigo-100 hover:text-indigo-700 transition">
                          <Plus size={14} />
                        </button>
                      )}
                    </div>
                    <select name="state_id" value={formData.state_id} onChange={handleChange} className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 bg-white" required disabled={!formData.country_id}>
                      <option value="">Select State</option>
                      {states.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-slate-700">City <span className="text-red-500">*</span></label>
                      {formData.state_id && (
                        <button type="button" onClick={() => handleOpenLocationModal('city')} className="w-5 h-5 flex items-center justify-center rounded-md bg-indigo-50 text-indigo-600 hover:bg-indigo-100 hover:text-indigo-700 transition">
                          <Plus size={14} />
                        </button>
                      )}
                    </div>
                    <select name="city_id" value={formData.city_id} onChange={handleChange} className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 bg-white" required disabled={!formData.state_id}>
                      <option value="">Select City</option>
                      {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Zip/Postal <span className="text-red-500">*</span></label>
                    <input type="text" name="zip_code" value={formData.zip_code} onChange={handleChange} placeholder="Zip/Postal" className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200" required />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Latitude <span className="text-red-500">*</span></label>
                    <input type="text" name="map_lat" value={formData.map_lat} onChange={handleChange} placeholder="Latitude" className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 bg-slate-50" readOnly required />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Longitude <span className="text-red-500">*</span></label>
                    <input type="text" name="map_lng" value={formData.map_lng} onChange={handleChange} placeholder="Longitude" className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 bg-slate-50" readOnly required />
                  </div>
                </div>
                
                <h4 className="font-semibold text-slate-800 text-sm mb-1 mt-4">Map Location</h4>
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
              </div>
            )}

            {isView && activeTab === 'attributes' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <h3 className="text-lg font-bold text-slate-800">Master Attributes</h3>
                  <button type="button" onClick={() => handleOpenAttributeModal()} className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-100 transition">
                    <Plus size={16} /> Manage Attributes
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-slate-700">Category <span className="text-red-500">*</span></label>
                      <button type="button" onClick={() => setCategoryModalOpen(true)} className="w-5 h-5 flex items-center justify-center rounded-md bg-indigo-50 text-indigo-600 hover:bg-indigo-100 hover:text-indigo-700 transition">
                        <Plus size={14} />
                      </button>
                    </div>
                    <select name="category_id" value={formData.category_id} onChange={handleChange} className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 bg-white" required>
                      <option value="">Select Category</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                </div>


                {masterAttributes.map(attr => (
                  <div key={attr.id} className="pt-4 border-t border-slate-100">
                    <h4 className="font-semibold text-slate-800 mb-3 text-sm">Attribute: {attr.name}</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {attr.tour_attribute_terms.map(term => (
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
                            className="rounded text-indigo-600 focus:ring-[#0081C9]" 
                          /> {term.name}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
                
                <div className="pt-4 border-t border-slate-100">
                  <div className="mb-4">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" name="enable_fixed_dates" checked={formData.enable_fixed_dates === '1'} onChange={handleChange} className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
                      <span className="ml-3 text-sm font-semibold text-slate-800">Enable Fixed Date</span>
                    </label>
                  </div>
                  
                  {formData.enable_fixed_dates === '1' && (
                    <div className="space-y-4">
                      {formData.fixed_dates.map((dateObj, idx) => (
                        <div key={idx} className="flex flex-wrap gap-4 items-center bg-gray-50 p-4 rounded-lg border border-gray-200">
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Start Date</label>
                            <input type="date" value={dateObj.start_date} onChange={e => handleFixedDateChange(idx, 'start_date', e.target.value)} className="px-3 py-2 text-sm rounded border border-gray-300" />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">End Date</label>
                            <input type="date" value={dateObj.end_date} onChange={e => handleFixedDateChange(idx, 'end_date', e.target.value)} className="px-3 py-2 text-sm rounded border border-gray-300" />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Last Booking Date</label>
                            <input type="date" value={dateObj.last_booking_date} onChange={e => handleFixedDateChange(idx, 'last_booking_date', e.target.value)} className="px-3 py-2 text-sm rounded border border-gray-300" />
                          </div>
                          <button onClick={() => removeFixedDate(idx)} className="text-red-500 p-2 hover:bg-red-50 rounded mt-4"><X size={16}/></button>
                        </div>
                      ))}
                      <button onClick={addFixedDate} className="flex items-center gap-2 text-indigo-600 bg-indigo-50 px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-100"><Plus size={16} /> Add Date</button>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <div className="mb-4">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" name="enable_open_hours" checked={formData.enable_open_hours === '1'} onChange={handleChange} className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
                      <span className="ml-3 text-sm font-semibold text-slate-800">Enable Open Hours</span>
                    </label>
                  </div>
                  
                  {formData.enable_open_hours === '1' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {['monday','tuesday','wednesday','thursday','friday','saturday','sunday'].map(day => (
                        <div key={day} className={`flex items-center justify-between p-3.5 rounded-lg border transition ${formData.open_hours[day]?.isOpen ? 'bg-white border-indigo-200 shadow-sm' : 'bg-slate-50 border-gray-200 opacity-70'}`}>
                          <label className="flex items-center gap-3 cursor-pointer select-none">
                            <input 
                              type="checkbox" 
                              checked={!!formData.open_hours[day]?.isOpen} 
                              onChange={e => handleOpenHourChange(day, 'isOpen', e.target.checked)}
                              className="rounded border-gray-300 text-indigo-600 focus:ring-[#0081C9] w-4 h-4 cursor-pointer" 
                            />
                            <span className={`text-sm font-semibold capitalize ${formData.open_hours[day]?.isOpen ? 'text-indigo-900' : 'text-slate-500'}`}>{day}</span>
                          </label>
                          <div className={`flex items-center gap-2 ${!formData.open_hours[day]?.isOpen ? 'pointer-events-none opacity-40' : ''}`}>
                            <input type="time" value={formData.open_hours[day]?.start || '00:00'} onChange={e => handleOpenHourChange(day, 'start', e.target.value)} className="px-2.5 py-1.5 text-sm border border-gray-200 rounded-md focus:border-indigo-500 outline-none bg-white font-medium text-slate-700" />
                            <span className="text-gray-400 font-medium">-</span>
                            <input type="time" value={formData.open_hours[day]?.end || '00:00'} onChange={e => handleOpenHourChange(day, 'end', e.target.value)} className="px-2.5 py-1.5 text-sm border border-gray-200 rounded-md focus:border-indigo-500 outline-none bg-white font-medium text-slate-700" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {isView && activeTab === 'media' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Feature Image</label>
                  <input type="file" accept="image/*" onChange={e => handleFileChange(e, setFeaturesImageFile, setFeaturesImagePreview)} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700" />
                  {featuresImagePreview && <img src={featuresImagePreview} alt="Feature Preview" className="mt-3 w-32 h-32 object-cover rounded-lg border border-gray-200" />}
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Image Gallery</label>
                  <input type="file" accept="image/*" multiple onChange={handleGalleryChange} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700" />
                  
                  <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-4">
                    {existingGalleries.map((img) => (
                      <div key={img.id} className="relative w-full aspect-square rounded-lg overflow-hidden border border-gray-200 group">
                        <img src={img.image} alt="Gallery" className="w-full h-full object-cover" />
                        <button type="button" onClick={() => removeExistingGallery(img.id)} className="absolute top-2 right-2 bg-red-500 text-white w-7 h-7 flex items-center justify-center rounded-full transition shadow-sm hover:bg-red-600"><X size={14} /></button>
                      </div>
                    ))}
                    {galleryPreviews.map((src, idx) => (
                      <div key={`new-${idx}`} className="relative w-full aspect-square rounded-lg overflow-hidden border border-indigo-200 group">
                        <img src={src} alt="New Gallery Preview" className="w-full h-full object-cover" />
                        <button type="button" onClick={() => removeNewGallery(idx)} className="absolute top-2 right-2 bg-red-500 text-white w-7 h-7 flex items-center justify-center rounded-full transition shadow-sm hover:bg-red-600"><X size={14} /></button>
                        <div className="absolute bottom-0 left-0 right-0 bg-indigo-500/80 text-white text-[10px] text-center py-1 font-medium">New</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <div className="mb-4">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" name="enable_seo" checked={formData.enable_seo === '1'} onChange={handleChange} className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
                      <span className="ml-3 text-sm font-semibold text-slate-800">Allow SEO</span>
                    </label>
                  </div>

                  {formData.enable_seo === '1' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Meta Title <span className="text-red-500">*</span></label>
                        <input type="text" name="meta_title" value={formData.meta_title} onChange={handleChange} placeholder="Meta Title" className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#0081C9]" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Meta Description</label>
                        <textarea name="meta_desc" value={formData.meta_desc} onChange={handleChange} rows="3" placeholder="Meta Description" className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#0081C9]"></textarea>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Meta Keyward</label>
                        <input type="text" name="meta_keyward" value={formData.meta_keyward} onChange={handleChange} placeholder="Meta Keyward" className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#0081C9]" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Category Modal */}
      {categoryModalOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity" onClick={() => setCategoryModalOpen(false)}></div>
          <div className="relative w-full max-w-sm bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-800">Manage Categories</h3>
              <button onClick={() => setCategoryModalOpen(false)} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 transition bg-slate-50 hover:bg-slate-100 rounded-full">
                <X size={18} />
              </button>
            </div>
            
            <div className="p-4 border-b border-slate-100 bg-slate-50">
              <label className="block text-xs font-semibold text-slate-700 mb-1">{categoryEditId ? 'Edit Category' : 'Add New Category'}</label>
              <div className="flex flex-col gap-2">
                <input 
                  type="text" 
                  value={newCategoryName} 
                  onChange={(e) => setNewCategoryName(e.target.value)} 
                  placeholder="Category Name" 
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-indigo-500 bg-white" 
                />
                <div className="flex gap-2 justify-end">
                  {categoryEditId && (
                    <button 
                      onClick={() => {
                        setNewCategoryName('');
                        setCategoryEditId(null);
                      }}
                      className="px-4 py-2 bg-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-300 transition"
                    >
                      Cancel
                    </button>
                  )}
                  <button 
                    onClick={handleCreateCategory} 
                    disabled={!newCategoryName.trim() || categorySaving}
                    className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition"
                  >
                    {categorySaving ? 'Saving...' : categoryEditId ? 'Update' : 'Add'}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <h4 className="text-xs font-semibold text-slate-500 mb-3 uppercase tracking-wider">Existing Categories</h4>
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left border-collapse bg-white">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="py-2 px-3 text-xs font-semibold text-slate-600">Category Name</th>
                      <th className="py-2 px-3 text-xs font-semibold text-slate-600 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.length === 0 ? (
                      <tr>
                        <td colSpan="2" className="py-4 text-center text-sm text-slate-500">No categories added yet.</td>
                      </tr>
                    ) : (
                      categories.map((cat) => (
                        <tr key={cat.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition">
                          <td className="py-2 px-3 text-sm font-medium text-slate-700">{cat.name}</td>
                          <td className="py-2 px-3 text-right">
                            <button 
                              onClick={() => handleEditCategory(cat)}
                              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition mr-1"
                              title="Edit Category"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button 
                              onClick={() => handleDeleteCategory(cat.id)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition"
                              title="Delete Category"
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
      {/* Location Modal */}
      {locationModalOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity" onClick={handleCloseLocationModal}></div>
          <div className="relative w-full max-w-sm bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 capitalize">Manage {locationModalType === 'city' ? 'Cities' : locationModalType === 'state' ? 'States' : 'Countries'}</h3>
              <button onClick={handleCloseLocationModal} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 transition bg-slate-50 hover:bg-slate-100 rounded-full">
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
                              onClick={() => handleEditLocation(loc)}
                              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition mr-1"
                              title={`Edit ${locationModalType}`}
                            >
                              <Edit2 size={16} />
                            </button>
                            <button 
                              onClick={() => handleDeleteLocation(loc.id)}
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

      {/* Destination Modal */}
      {destModalOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity" onClick={handleCloseDestModal}></div>
          <div className="relative w-full max-w-sm bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-800">{destModalEditId ? 'Edit Destination' : 'Add New Destination'}</h3>
              <button onClick={handleCloseDestModal} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 transition bg-slate-50 hover:bg-slate-100 rounded-full">
                <X size={18} />
              </button>
            </div>
            
            <div className="p-4 border-b border-slate-100 bg-slate-50">
              <div className="flex flex-col gap-2">
                <input 
                  type="text" 
                  value={destModalInput} 
                  onChange={(e) => setDestModalInput(e.target.value)} 
                  placeholder="Destination Name" 
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-indigo-500 bg-white" 
                />
                {!destModalEditId && (
                  <div className="mt-1">
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Upload Image *</label>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => setDestModalImage(e.target.files[0])}
                      className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                    />
                  </div>
                )}
                <button 
                  type="button" 
                  onClick={handleCreateDest} 
                  disabled={destModalSaving || !destModalInput.trim() || (!destModalEditId && !destModalImage)}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-lg text-sm font-semibold transition"
                >
                  {destModalSaving ? 'Saving...' : destModalEditId ? 'Update' : 'Add Destination'}
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 bg-slate-50/50">
              <div className="bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="py-2.5 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Destination</th>
                      <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider w-28 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {destinations.map((dest) => (
                      <tr key={dest.id} className="hover:bg-slate-50/80 transition-colors group">
                        <td className="py-3 px-4 text-sm text-slate-700 font-medium">
                          {dest.name || dest.title}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => handleEditDest(dest)}
                              className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition"
                              title="Edit Destination"
                            >
                              <Edit2 size={15} />
                            </button>
                            <button 
                              onClick={() => handleDeleteDest(dest.id)}
                              className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-md transition"
                              title="Delete Destination"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
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

// Helpers
const TabButton = ({ active, onClick, icon, label }) => (
  <button onClick={onClick} className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${active ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}>
    {icon} {label}
  </button>
);

const CreatableTagInput = ({ selectedValues, onChange, placeholder }) => {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const val = inputValue.trim();
      if (val && !selectedValues.includes(val)) {
        onChange([...selectedValues.filter(Boolean), val]);
      }
      setInputValue('');
    }
  };

  const handleRemove = (e, valToRemove) => {
    e.stopPropagation();
    onChange(selectedValues.filter(v => v !== valToRemove));
  };

  return (
    <div className="min-h-[42px] w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white flex flex-wrap gap-2 items-center focus-within:border-indigo-500 transition-colors">
      {selectedValues.filter(Boolean).map((val, idx) => (
        <span key={idx} className="flex items-center gap-1.5 bg-white text-slate-700 px-3 py-1 rounded-md text-sm font-medium border border-slate-200 shadow-sm">
          {val}
          <button 
            type="button" 
            onClick={(e) => handleRemove(e, val)}
            className="text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-sm p-0.5 transition"
          >
            <X size={14} />
          </button>
        </span>
      ))}
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={selectedValues.filter(Boolean).length === 0 ? placeholder : "Add another..."}
        className="flex-1 outline-none min-w-[120px] bg-transparent text-sm text-slate-700"
      />
    </div>
  );
};

const DynamicListSection = ({ title, commonTitleField, commonTitleValue, onCommonTitleChange, items = [], setItems, emptyItem, children }) => (
  <div className="pt-6 mt-6 border-t border-slate-100">
    <div className="flex items-center justify-between mb-4">
      <h4 className="font-bold text-slate-800 text-[15px]">{title}</h4>
      <input type="text" name={commonTitleField} value={commonTitleValue} onChange={onCommonTitleChange} placeholder={`Enter ${title} Title`} className="w-1/2 px-4 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#0081C9] outline-none bg-white" />
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
