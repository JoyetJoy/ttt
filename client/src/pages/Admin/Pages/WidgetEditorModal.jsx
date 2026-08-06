import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

// ─── Widget-Specific Renderers ────────────────────────────────────────────────

function SliderEditor({ items, setItems, handleFileUpload, uploading }) {
  const handleChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const handleAddItem = () => {
    setItems([...items, { title: '', buttonText: '', buttonUrl: '', location: '', rating: '', description: '', image: '', ratingLogo: '' }]);
  };

  const handleRemoveItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      {items.map((item, index) => (
        <div key={index} className="bg-[#F8F9FA] border border-slate-100 rounded-xl p-6 md:p-8 space-y-6 relative shadow-sm">
          <button onClick={() => handleRemoveItem(index)} className="absolute -top-3 -right-3 h-[36px] w-[36px] flex items-center justify-center bg-red-100 text-red-500 rounded-full hover:bg-red-200 transition shadow-sm z-10">
            <Trash2 size={16} strokeWidth={2.5} />
          </button>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Title</label>
              <input type="text" value={item.title || ''} onChange={e => handleChange(index, 'title', e.target.value)} className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Button Text</label>
              <input type="text" value={item.buttonText || ''} onChange={e => handleChange(index, 'buttonText', e.target.value)} className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Button Url</label>
              <input type="text" value={item.buttonUrl || ''} onChange={e => handleChange(index, 'buttonUrl', e.target.value)} className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Image <span className="text-red-500">*</span></label>
              <div className="flex flex-col gap-2">
                <input type="file" accept="image/*" onChange={e => handleFileUpload(index, 'image', e.target.files[0])} className="text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer" />
                {item.image && <img src={item.image} alt="Preview" className="h-14 w-24 object-cover rounded-lg shadow-sm border border-slate-200" />}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Location</label>
              <input type="text" value={item.location || ''} onChange={e => handleChange(index, 'location', e.target.value)} className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Rating Logo <span className="text-red-500">*</span></label>
              <div className="flex flex-col gap-2">
                <input type="file" accept="image/*" onChange={e => handleFileUpload(index, 'ratingLogo', e.target.files[0])} className="text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer" />
                {item.ratingLogo && <img src={item.ratingLogo} alt="Preview" className="h-10 w-20 object-contain rounded-lg shadow-sm border border-slate-200 bg-slate-800 p-1" />}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Rating (Out of 5)</label>
              <input type="number" max="5" min="0" step="0.1" value={item.rating || ''} onChange={e => handleChange(index, 'rating', e.target.value)} className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
            <textarea rows="3" value={item.description || ''} onChange={e => handleChange(index, 'description', e.target.value)} className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none resize-y"></textarea>
          </div>
        </div>
      ))}
      <button onClick={handleAddItem} className="w-12 h-12 bg-indigo-600 text-white rounded-lg flex items-center justify-center hover:bg-indigo-700 transition shadow-sm">
        <Plus size={20} />
      </button>
    </div>
  );
}

function SearchEditor({ config, setConfig }) {
  const SEARCH_FIELDS = [
    { key: 'enable_tour_search',      label: 'Enable Tour Search' },
    { key: 'enable_hotel_search',     label: 'Enable Hotel Search' },
    { key: 'enable_activity_search',  label: 'Enable Activities Search' },
    { key: 'enable_visa_search',      label: 'Enable Visa Search' },
    { key: 'enable_transport_search', label: 'Enable Transport Search' },
  ];

  const toggle = (key) => {
    setConfig(prev => ({ ...prev, [key]: prev[key] ? 0 : 1 }));
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-5">
      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Enable Search</p>
      {SEARCH_FIELDS.map(({ key, label }) => (
        <div key={key} className="flex items-center gap-4">
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" checked={!!config[key]} onChange={() => toggle(key)} />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
          </label>
          <span className="text-sm font-medium text-slate-700">{label}</span>
        </div>
      ))}
    </div>
  );
}

function AboutUsEditor({ config, setConfig, handleFileSelect }) {
  const handleConfigChange = (field, value) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleTabChange = (index, field, value) => {
    const newTabs = [...(config.tabs || [])];
    newTabs[index] = { ...newTabs[index], [field]: value };
    setConfig(prev => ({ ...prev, tabs: newTabs }));
  };

  const handleAddTab = () => {
    setConfig(prev => ({
      ...prev,
      tabs: [...(prev.tabs || []), { name: '', class_icon: '', description: '' }]
    }));
  };

  const handleRemoveTab = (index) => {
    setConfig(prev => ({
      ...prev,
      tabs: (prev.tabs || []).filter((_, i) => i !== index)
    }));
  };

  const handleTopFileUpload = (field, file) => {
    if (!file) return;
    if (handleFileSelect) {
      handleFileSelect(field, file);
    }
  };

  const tabs = config.tabs || [];

  return (
    <div className="space-y-6">
      {/* Main Config */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 md:p-8 shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-[13px] font-bold text-slate-700 mb-2">Widget Title</label>
            <input type="text" value={config.widget_title || ''} onChange={e => handleConfigChange('widget_title', e.target.value)} className="w-full px-4 py-2.5 text-sm bg-white rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow shadow-sm" />
          </div>
          <div>
            <label className="block text-[13px] font-bold text-slate-700 mb-2">Title</label>
            <input type="text" value={config.title || ''} onChange={e => handleConfigChange('title', e.target.value)} className="w-full px-4 py-2.5 text-sm bg-white rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow shadow-sm" />
          </div>
        </div>
        <div>
          <label className="block text-[13px] font-bold text-slate-700 mb-2">Image</label>
          <div className="flex items-center gap-3 flex-wrap">
            <input type="file" accept="image/*" onChange={e => handleTopFileUpload('image', e.target.files[0])} className="text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer shadow-sm transition-colors" />
            {config.image && <img src={config.image} alt="Preview" className="h-14 w-20 object-cover rounded-xl shadow-sm border border-slate-200" />}
          </div>
        </div>
        <div>
          <label className="block text-[13px] font-bold text-slate-700 mb-2">Customer Image</label>
          <div className="flex items-center gap-3 flex-wrap">
            <input type="file" accept="image/*" onChange={e => handleTopFileUpload('customer_image', e.target.files[0])} className="text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer shadow-sm transition-colors" />
            {config.customer_image && <img src={config.customer_image} alt="Preview" className="h-12 w-12 object-cover rounded-full shadow-sm border border-slate-200" />}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-[13px] font-bold text-slate-700 mb-2">Number of Customers</label>
            <input type="number" value={config.number_of_customers || ''} onChange={e => handleConfigChange('number_of_customers', e.target.value)} className="w-full px-4 py-2.5 text-sm bg-white rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow shadow-sm" />
          </div>
          <div>
            <label className="block text-[13px] font-bold text-slate-700 mb-2">Button Text</label>
            <input type="text" value={config.button_text || ''} onChange={e => handleConfigChange('button_text', e.target.value)} className="w-full px-4 py-2.5 text-sm bg-white rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow shadow-sm" />
          </div>
          <div>
            <label className="block text-[13px] font-bold text-slate-700 mb-2">Button Url</label>
            <input type="text" value={config.button_url || ''} onChange={e => handleConfigChange('button_url', e.target.value)} className="w-full px-4 py-2.5 text-sm bg-white rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow shadow-sm" />
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <p className="text-sm font-bold text-indigo-600 mb-5 border-b border-slate-100 pb-3">Tab Content</p>
        <div className="space-y-5">
          {tabs.map((tab, index) => (
            <div key={index} className="bg-[#F8F9FA] border border-slate-100 rounded-xl p-6 md:p-8 space-y-6 relative">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[13px] font-bold text-slate-700 mb-2">Name</label>
                  <input type="text" value={tab.name || ''} onChange={e => handleTabChange(index, 'name', e.target.value)} className="w-full px-4 py-2.5 text-sm bg-white rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow shadow-sm" />
                </div>
                <div className="flex gap-4 items-start">
                  <div className="flex-1">
                    <label className="block text-[13px] font-bold text-slate-700 mb-2">
                      Class Icon <span className="font-normal text-slate-400 ml-1">- <a href="https://icons.getbootstrap.com/" target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">Bootstrap Icons</a></span>
                    </label>
                    <input type="text" value={tab.class_icon || ''} onChange={e => handleTabChange(index, 'class_icon', e.target.value)} placeholder="bi bi-patch-check" className="w-full px-4 py-2.5 text-sm bg-white rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow shadow-sm" />
                  </div>
                  <button onClick={() => handleRemoveTab(index)} className="mt-[28px] h-[42px] w-[42px] flex items-center justify-center bg-red-50/80 text-red-500 rounded-xl hover:bg-red-100 transition flex-shrink-0">
                    <Trash2 size={18} strokeWidth={2.5} />
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-[13px] font-bold text-slate-700 mb-2">Description</label>
                <textarea rows="3" value={tab.description || ''} onChange={e => handleTabChange(index, 'description', e.target.value)} className="w-full px-4 py-2.5 text-sm bg-white rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none resize-y transition-shadow shadow-sm"></textarea>
              </div>
            </div>
          ))}
        </div>
        <button onClick={handleAddTab} className="mt-5 w-12 h-12 bg-indigo-600 text-white rounded-lg flex items-center justify-center hover:bg-indigo-700 transition shadow-sm">
          <Plus size={20} />
        </button>
      </div>
    </div>
  );
}

function DestinationEditor({ config, setConfig }) {
  const handleChange = (field, value) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 md:p-8 shadow-sm space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-[13px] font-bold text-slate-700 mb-2">Shoulder</label>
          <input type="text" value={config.shoulder || ''} onChange={e => handleChange('shoulder', e.target.value)} className="w-full px-4 py-2.5 text-sm bg-white rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow shadow-sm" />
        </div>
        <div>
          <label className="block text-[13px] font-bold text-slate-700 mb-2">Title</label>
          <input type="text" value={config.title || ''} onChange={e => handleChange('title', e.target.value)} className="w-full px-4 py-2.5 text-sm bg-white rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow shadow-sm" />
        </div>
        <div>
          <label className="block text-[13px] font-bold text-slate-700 mb-2">Order By</label>
          <select value={config.order_by || 'Descending'} onChange={e => handleChange('order_by', e.target.value)} className="w-full px-4 py-2.5 text-sm bg-white rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow shadow-sm text-slate-700">
            <option value="Descending">Descending</option>
            <option value="Ascending">Ascending</option>
          </select>
        </div>
        <div>
          <label className="block text-[13px] font-bold text-slate-700 mb-2">Offer Text</label>
          <input type="text" value={config.offer_text || ''} onChange={e => handleChange('offer_text', e.target.value)} className="w-full px-4 py-2.5 text-sm bg-white rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow shadow-sm" />
        </div>
        <div>
          <label className="block text-[13px] font-bold text-slate-700 mb-2">Offer Title</label>
          <input type="text" value={config.offer_title || ''} onChange={e => handleChange('offer_title', e.target.value)} className="w-full px-4 py-2.5 text-sm bg-white rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow shadow-sm" />
        </div>
        <div>
          <label className="block text-[13px] font-bold text-slate-700 mb-2">Button Text</label>
          <input type="text" value={config.button_text || ''} onChange={e => handleChange('button_text', e.target.value)} className="w-full px-4 py-2.5 text-sm bg-white rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow shadow-sm" />
        </div>
        <div>
          <label className="block text-[13px] font-bold text-slate-700 mb-2">Button Link</label>
          <input type="text" value={config.button_link || ''} onChange={e => handleChange('button_link', e.target.value)} className="w-full px-4 py-2.5 text-sm bg-white rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow shadow-sm" />
        </div>
      </div>
    </div>
  );
}

function LatestProductEditor({ config, setConfig }) {
  const handleChange = (field, value) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const toggle = (key) => {
    setConfig(prev => ({ ...prev, [key]: prev[key] ? 0 : 1 }));
  };

  const rows = [
    { key: 'tour', label: 'Tour Details' },
    { key: 'hotel', label: 'Hotel Details' },
    { key: 'activities', label: 'Activities Details' },
    { key: 'transport', label: 'Transport Details' },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 md:p-8 shadow-sm space-y-8">
      {/* Top Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-[13px] font-bold text-slate-700 mb-2">Shoulder</label>
          <input type="text" value={config.shoulder || ''} onChange={e => handleChange('shoulder', e.target.value)} className="w-full px-4 py-2.5 text-sm bg-white rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow shadow-sm" />
        </div>
        <div>
          <label className="block text-[13px] font-bold text-slate-700 mb-2">Title</label>
          <input type="text" value={config.title || ''} onChange={e => handleChange('title', e.target.value)} className="w-full px-4 py-2.5 text-sm bg-white rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow shadow-sm" />
        </div>
      </div>

      {/* Rows Section */}
      <div className="space-y-6">
        {rows.map((row) => (
          <div key={row.key} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
            <div>
              <label className="block text-[13px] font-bold text-slate-700 mb-3">{row.label}</label>
              <div className="flex items-center gap-3 h-[42px]">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={!!config[`${row.key}_enable`]} onChange={() => toggle(`${row.key}_enable`)} />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
                <span className="text-sm font-medium text-slate-700">
                  {config[`${row.key}_enable`] ? 'Enable' : 'Disable'}
                </span>
              </div>
            </div>
            <div>
              <label className="block text-[13px] font-bold text-slate-700 mb-2">Total Display</label>
              <input type="number" value={config[`${row.key}_display`] || ''} onChange={e => handleChange(`${row.key}_display`, e.target.value)} className="w-full px-4 py-2.5 text-sm bg-white rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow shadow-sm" />
            </div>
            <div>
              <label className="block text-[13px] font-bold text-slate-700 mb-2">Order By</label>
              <select value={config[`${row.key}_order`] || 'Descending'} onChange={e => handleChange(`${row.key}_order`, e.target.value)} className="w-full px-4 py-2.5 text-sm bg-white rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow shadow-sm text-slate-700 appearance-none">
                <option value="Descending">Descending</option>
                <option value="Ascending">Ascending</option>
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FeaturedTourEditor({ config, setConfig }) {
  const handleChange = (field, value) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 md:p-8 shadow-sm space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-[13px] font-bold text-slate-700 mb-2">Shoulder</label>
          <input type="text" value={config.shoulder || ''} onChange={e => handleChange('shoulder', e.target.value)} className="w-full px-4 py-2.5 text-sm bg-white rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow shadow-sm" />
        </div>
        <div>
          <label className="block text-[13px] font-bold text-slate-700 mb-2">Title</label>
          <input type="text" value={config.title || ''} onChange={e => handleChange('title', e.target.value)} className="w-full px-4 py-2.5 text-sm bg-white rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow shadow-sm" />
        </div>
        <div>
          <label className="block text-[13px] font-bold text-slate-700 mb-2">Number of Display</label>
          <input type="number" value={config.number_of_display || ''} onChange={e => handleChange('number_of_display', e.target.value)} className="w-full px-4 py-2.5 text-sm bg-white rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow shadow-sm" />
        </div>
        <div>
          <label className="block text-[13px] font-bold text-slate-700 mb-2">Order By</label>
          <select value={config.order_by || 'Descending'} onChange={e => handleChange('order_by', e.target.value)} className="w-full px-4 py-2.5 text-sm bg-white rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow shadow-sm text-slate-700 appearance-none">
            <option value="Descending">Descending</option>
            <option value="Ascending">Ascending</option>
          </select>
        </div>
        <div>
          <label className="block text-[13px] font-bold text-slate-700 mb-2">Button Text</label>
          <input type="text" value={config.button_text || ''} onChange={e => handleChange('button_text', e.target.value)} className="w-full px-4 py-2.5 text-sm bg-white rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow shadow-sm" />
        </div>
        <div>
          <label className="block text-[13px] font-bold text-slate-700 mb-2">Button Link</label>
          <input type="text" value={config.button_link || ''} onChange={e => handleChange('button_link', e.target.value)} className="w-full px-4 py-2.5 text-sm bg-white rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow shadow-sm" />
        </div>
      </div>
    </div>
  );
}

function WhyChooseUsEditor({ config, setConfig }) {
  useEffect(() => {
    if (!config.items || config.items.length === 0) {
      setConfig(prev => ({
        ...prev,
        items: [{ name: '', icon: '', short_description: '' }]
      }));
    }
  }, [config.items, setConfig]);

  const handleConfigChange = (field, value) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...(config.items || [])];
    newItems[index] = { ...newItems[index], [field]: value };
    setConfig(prev => ({ ...prev, items: newItems }));
  };

  const handleAddItem = () => {
    setConfig(prev => ({
      ...prev,
      items: [...(prev.items || []), { name: '', icon: '', short_description: '' }]
    }));
  };

  const handleRemoveItem = (index) => {
    setConfig(prev => ({
      ...prev,
      items: (prev.items || []).filter((_, i) => i !== index)
    }));
  };

  const handleItemFileUpload = async (index, file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'widgets/why-choose-us');
    try {
      const token = localStorage.getItem('token') || (document.cookie.match(/token=([^;]+)/) || [])[1] || '';
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      handleItemChange(index, 'icon', data.url);
    } catch (err) {
      console.error(err);
      alert('Failed to upload file');
    }
  };

  const items = config.items || [];

  return (
    <div className="space-y-4">
      {/* Top Config */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <div>
          <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Title</label>
          <input type="text" value={config.title || ''} onChange={e => handleConfigChange('title', e.target.value)} className="w-full px-4 py-2.5 text-sm bg-white rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow shadow-sm" />
        </div>
        <div>
          <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Sub Title</label>
          <input type="text" value={config.sub_title || ''} onChange={e => handleConfigChange('sub_title', e.target.value)} className="w-full px-4 py-2.5 text-sm bg-white rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow shadow-sm" />
        </div>
      </div>

      {/* Items */}
      <div className="space-y-4">
        {items.map((item, index) => (
          <div key={index} className="bg-[#F8F9FA] border border-slate-100 rounded-xl p-5 space-y-4 relative">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Name</label>
                <input type="text" value={item.name || ''} onChange={e => handleItemChange(index, 'name', e.target.value)} className="w-full px-4 py-2.5 text-sm bg-white rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow shadow-sm" />
              </div>
              <div className="flex gap-3 items-start">
                <div className="flex-1">
                  <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Icon</label>
                  <div className="flex items-center gap-2 w-full bg-white rounded-xl border border-slate-200 pr-2 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-indigo-500 transition-shadow">
                    <input type="file" accept="image/*" onChange={e => handleItemFileUpload(index, e.target.files[0])} className="w-full text-sm text-slate-500 file:mr-2 file:py-2.5 file:px-4 file:border-0 file:border-r file:border-slate-200 file:text-sm file:font-medium file:bg-slate-50 file:text-slate-700 hover:file:bg-slate-100 cursor-pointer outline-none" />
                    {item.icon && <img src={item.icon} alt="Icon" className="h-8 w-8 object-contain flex-shrink-0" />}
                  </div>
                </div>
                <button onClick={() => handleRemoveItem(index)} className="mt-[26px] h-[40px] w-[40px] flex items-center justify-center bg-red-50/80 text-red-500 rounded-xl hover:bg-red-100 transition flex-shrink-0">
                  <Trash2 size={16} strokeWidth={2.5} />
                </button>
              </div>
            </div>
            <div>
              <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Short Description</label>
              <textarea rows="2" value={item.short_description || ''} onChange={e => handleItemChange(index, 'short_description', e.target.value)} className="w-full px-4 py-2 text-sm bg-white rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none resize-y transition-shadow shadow-sm"></textarea>
            </div>
          </div>
        ))}
      </div>
      <button onClick={handleAddItem} className="w-12 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center hover:bg-indigo-700 transition shadow-md">
        <Plus size={20} strokeWidth={2.5} />
      </button>
    </div>
  );
}

function TabActivitiesEditor({ config, setConfig }) {
  const handleConfigChange = (field, value) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleTabChange = (index, field, value) => {
    const newTabs = [...(config.tabs || [])];
    newTabs[index] = { ...newTabs[index], [field]: value };
    setConfig(prev => ({ ...prev, tabs: newTabs }));
  };

  const handleAddTab = () => {
    setConfig(prev => ({
      ...prev,
      tabs: [...(prev.tabs || []), { includes: [''], excludes: [''] }]
    }));
  };

  const handleRemoveTab = (index) => {
    setConfig(prev => ({
      ...prev,
      tabs: (prev.tabs || []).filter((_, i) => i !== index)
    }));
  };

  const handleStringArrayChange = (tabIndex, arrayField, itemIndex, value) => {
    const newTabs = [...(config.tabs || [])];
    const newArray = [...(newTabs[tabIndex][arrayField] || [])];
    newArray[itemIndex] = value;
    newTabs[tabIndex] = { ...newTabs[tabIndex], [arrayField]: newArray };
    setConfig(prev => ({ ...prev, tabs: newTabs }));
  };

  const handleAddStringArrayItem = (tabIndex, arrayField) => {
    const newTabs = [...(config.tabs || [])];
    const newArray = [...(newTabs[tabIndex][arrayField] || []), ''];
    newTabs[tabIndex] = { ...newTabs[tabIndex], [arrayField]: newArray };
    setConfig(prev => ({ ...prev, tabs: newTabs }));
  };

  const handleRemoveStringArrayItem = (tabIndex, arrayField, itemIndex) => {
    const newTabs = [...(config.tabs || [])];
    const newArray = (newTabs[tabIndex][arrayField] || []).filter((_, i) => i !== itemIndex);
    newTabs[tabIndex] = { ...newTabs[tabIndex], [arrayField]: newArray };
    setConfig(prev => ({ ...prev, tabs: newTabs }));
  };

  const handleFileUpload = async (index, field, file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'widgets/tab-activities');
    try {
      const token = localStorage.getItem('token') || (document.cookie.match(/token=([^;]+)/) || [])[1] || '';
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      handleTabChange(index, field, data.url);
    } catch (err) {
      console.error(err);
      alert('Failed to upload file');
    }
  };

  useEffect(() => {
    if (!config.tabs || config.tabs.length === 0) {
      handleAddTab();
    }
  }, []);

  const tabs = config.tabs || [];

  return (
    <div className="space-y-6">
      {/* Top Config */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div>
          <label className="block text-[13px] font-bold text-slate-700 mb-2">Title</label>
          <input type="text" value={config.title || ''} onChange={e => handleConfigChange('title', e.target.value)} className="w-full px-4 py-2.5 text-sm bg-white rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow shadow-sm" />
        </div>
        <div>
          <label className="block text-[13px] font-bold text-slate-700 mb-2">Shoulder</label>
          <input type="text" value={config.shoulder || ''} onChange={e => handleConfigChange('shoulder', e.target.value)} className="w-full px-4 py-2.5 text-sm bg-white rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow shadow-sm" />
        </div>
      </div>

      <hr className="border-slate-200 my-4" />

      {/* Tabs */}
      <div className="space-y-8">
        {tabs.map((tab, index) => (
          <div key={index} className="bg-[#F8F9FA] border border-slate-100 rounded-xl p-6 md:p-8 space-y-6 relative">
            <button onClick={() => handleRemoveTab(index)} className="absolute -top-3 -right-3 h-[36px] w-[36px] flex items-center justify-center bg-red-100 text-red-500 rounded-full hover:bg-red-200 transition shadow-sm z-10">
              <Trash2 size={16} strokeWidth={2.5} />
            </button>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[13px] font-bold text-slate-700 mb-2">Tab Title</label>
                <input type="text" value={tab.tab_title || ''} onChange={e => handleTabChange(index, 'tab_title', e.target.value)} className="w-full px-4 py-2.5 text-sm bg-white rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow shadow-sm" />
              </div>
              <div>
                <label className="block text-[13px] font-bold text-slate-700 mb-2">Tab Icon</label>
                <div className="flex items-center gap-3 w-full bg-white rounded-xl border border-slate-200 pr-3 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-indigo-500 transition-shadow">
                  <input type="file" accept="image/*" onChange={e => handleFileUpload(index, 'tab_icon', e.target.files[0])} className="w-full text-sm text-slate-500 file:mr-3 file:py-2.5 file:px-4 file:border-0 file:border-r file:border-slate-200 file:text-sm file:font-medium file:bg-slate-50 file:text-slate-700 hover:file:bg-slate-100 cursor-pointer outline-none" />
                  {tab.tab_icon && <img src={tab.tab_icon} alt="Icon" className="h-10 w-10 object-contain flex-shrink-0" />}
                </div>
              </div>
              
              <div>
                <label className="block text-[13px] font-bold text-slate-700 mb-2">Tab Label</label>
                <input type="text" value={tab.tab_label || ''} onChange={e => handleTabChange(index, 'tab_label', e.target.value)} className="w-full px-4 py-2.5 text-sm bg-white rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow shadow-sm" />
              </div>
              <div>
                <label className="block text-[13px] font-bold text-slate-700 mb-2">Main Title</label>
                <input type="text" value={tab.main_title || ''} onChange={e => handleTabChange(index, 'main_title', e.target.value)} className="w-full px-4 py-2.5 text-sm bg-white rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow shadow-sm" />
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-bold text-slate-700 mb-2">Description</label>
              <textarea rows="3" value={tab.description || ''} onChange={e => handleTabChange(index, 'description', e.target.value)} className="w-full px-4 py-2.5 text-sm bg-white rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none resize-y transition-shadow shadow-sm"></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[13px] font-bold text-slate-700 mb-2">Button Text</label>
                <input type="text" value={tab.button_text || ''} onChange={e => handleTabChange(index, 'button_text', e.target.value)} className="w-full px-4 py-2.5 text-sm bg-white rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow shadow-sm" />
              </div>
              <div>
                <label className="block text-[13px] font-bold text-slate-700 mb-2">Button Link</label>
                <input type="text" value={tab.button_link || ''} onChange={e => handleTabChange(index, 'button_link', e.target.value)} className="w-full px-4 py-2.5 text-sm bg-white rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow shadow-sm" />
              </div>
              <div>
                <label className="block text-[13px] font-bold text-slate-700 mb-2">Video Text</label>
                <input type="text" value={tab.video_text || ''} onChange={e => handleTabChange(index, 'video_text', e.target.value)} className="w-full px-4 py-2.5 text-sm bg-white rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow shadow-sm" />
              </div>
              <div>
                <label className="block text-[13px] font-bold text-slate-700 mb-2">Video Link</label>
                <input type="text" value={tab.video_link || ''} onChange={e => handleTabChange(index, 'video_link', e.target.value)} className="w-full px-4 py-2.5 text-sm bg-white rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow shadow-sm" />
              </div>
              
              <div>
                <label className="block text-[13px] font-bold text-slate-700 mb-2">Image 1</label>
                <div className="flex items-center gap-3 w-full bg-white rounded-xl border border-slate-200 pr-3 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-indigo-500 transition-shadow">
                  <input type="file" accept="image/*" onChange={e => handleFileUpload(index, 'image_1', e.target.files[0])} className="w-full text-sm text-slate-500 file:mr-3 file:py-2.5 file:px-4 file:border-0 file:border-r file:border-slate-200 file:text-sm file:font-medium file:bg-slate-50 file:text-slate-700 hover:file:bg-slate-100 cursor-pointer outline-none" />
                  {tab.image_1 && <img src={tab.image_1} alt="Img1" className="h-10 w-16 object-cover rounded flex-shrink-0" />}
                </div>
              </div>
              <div>
                <label className="block text-[13px] font-bold text-slate-700 mb-2">Image 2</label>
                <div className="flex items-center gap-3 w-full bg-white rounded-xl border border-slate-200 pr-3 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-indigo-500 transition-shadow">
                  <input type="file" accept="image/*" onChange={e => handleFileUpload(index, 'image_2', e.target.files[0])} className="w-full text-sm text-slate-500 file:mr-3 file:py-2.5 file:px-4 file:border-0 file:border-r file:border-slate-200 file:text-sm file:font-medium file:bg-slate-50 file:text-slate-700 hover:file:bg-slate-100 cursor-pointer outline-none" />
                  {tab.image_2 && <img src={tab.image_2} alt="Img2" className="h-10 w-16 object-cover rounded flex-shrink-0" />}
                </div>
              </div>
            </div>

            {/* Arrays: Includes / Excludes */}
            <div className="space-y-6 pt-4">
              <div>
                <label className="block text-[14px] font-bold text-slate-800 mb-3">Tab Package Include</label>
                <div className="space-y-3">
                  {(tab.includes || []).map((inc, iIdx) => (
                    <div key={iIdx} className="flex gap-2">
                      <input type="text" value={inc} onChange={e => handleStringArrayChange(index, 'includes', iIdx, e.target.value)} className="flex-1 px-4 py-2 text-sm bg-white rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow shadow-sm" />
                      <button onClick={() => handleRemoveStringArrayItem(index, 'includes', iIdx)} className="h-[38px] w-[38px] flex items-center justify-center bg-slate-100 text-slate-400 rounded-xl hover:bg-red-50 hover:text-red-500 transition flex-shrink-0">
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
                <button onClick={() => handleAddStringArrayItem(index, 'includes')} className="mt-4 w-10 h-8 bg-indigo-600 text-white rounded-lg flex items-center justify-center hover:bg-indigo-700 transition shadow-sm">
                  <Plus size={16} strokeWidth={2.5} />
                </button>
              </div>

              <div>
                <label className="block text-[14px] font-bold text-slate-800 mb-3">Plan Package Exclude</label>
                <div className="space-y-3">
                  {(tab.excludes || []).map((exc, eIdx) => (
                    <div key={eIdx} className="flex gap-2">
                      <input type="text" value={exc} onChange={e => handleStringArrayChange(index, 'excludes', eIdx, e.target.value)} className="flex-1 px-4 py-2 text-sm bg-white rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow shadow-sm" />
                      <button onClick={() => handleRemoveStringArrayItem(index, 'excludes', eIdx)} className="h-[38px] w-[38px] flex items-center justify-center bg-slate-100 text-slate-400 rounded-xl hover:bg-red-50 hover:text-red-500 transition flex-shrink-0">
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
                <button onClick={() => handleAddStringArrayItem(index, 'excludes')} className="mt-4 w-10 h-8 bg-indigo-600 text-white rounded-lg flex items-center justify-center hover:bg-indigo-700 transition shadow-sm">
                  <Plus size={16} strokeWidth={2.5} />
                </button>
              </div>
            </div>

          </div>
        ))}
      </div>
      <button onClick={handleAddTab} className="w-[52px] h-[42px] bg-indigo-600 text-white rounded-xl flex items-center justify-center hover:bg-indigo-700 transition shadow-md">
        <Plus size={20} strokeWidth={2.5} />
      </button>
    </div>
  );
}

function OffersEditor({ config, setConfig, handleFileSelect }) {
  const handleConfigChange = (field, value) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...(config.items || [])];
    newItems[index] = { ...newItems[index], [field]: value };
    setConfig(prev => ({ ...prev, items: newItems }));
  };

  const handleAddItem = () => {
    setConfig(prev => ({
      ...prev,
      items: [...(prev.items || []), { title: '', offer_discount: '', button_text: '', offer_link: '', image: '' }]
    }));
  };

  const handleRemoveItem = (index) => {
    setConfig(prev => ({
      ...prev,
      items: (prev.items || []).filter((_, i) => i !== index)
    }));
  };

  const handleItemFileUpload = (index, file) => {
    if (!file) return;
    if (handleFileSelect) handleFileSelect(`items[${index}][image]`, file);
  };

  useEffect(() => {
    if (!config.items || config.items.length === 0) {
      handleAddItem();
    }
  }, []);

  const items = config.items || [];

  return (
    <div className="space-y-6">
      {/* Top Config */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div>
          <label className="block text-[13px] font-bold text-slate-700 mb-2">Title</label>
          <input type="text" value={config.title || ''} onChange={e => handleConfigChange('title', e.target.value)} className="w-full px-4 py-2.5 text-sm bg-white rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow shadow-sm" />
        </div>
        <div>
          <label className="block text-[13px] font-bold text-slate-700 mb-2">Shoulder</label>
          <input type="text" value={config.shoulder || ''} onChange={e => handleConfigChange('shoulder', e.target.value)} className="w-full px-4 py-2.5 text-sm bg-white rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow shadow-sm" />
        </div>
      </div>

      <hr className="border-slate-200 my-4" />

      {/* Items */}
      <div className="space-y-6">
        {items.map((item, index) => (
          <div key={index} className="bg-[#F8F9FA] border border-slate-100 rounded-xl p-6 md:p-8 space-y-6 relative">
            <button onClick={() => handleRemoveItem(index)} className="absolute -top-3 -right-3 h-[36px] w-[36px] flex items-center justify-center bg-red-100 text-red-500 rounded-full hover:bg-red-200 transition shadow-sm z-10">
              <Trash2 size={16} strokeWidth={2.5} />
            </button>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[13px] font-bold text-slate-700 mb-2">Title</label>
                <input type="text" value={item.title || ''} onChange={e => handleItemChange(index, 'title', e.target.value)} className="w-full px-4 py-2.5 text-sm bg-white rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow shadow-sm" />
              </div>
              <div>
                <label className="block text-[13px] font-bold text-slate-700 mb-2">Offer Discount</label>
                <input type="text" value={item.offer_discount || ''} onChange={e => handleItemChange(index, 'offer_discount', e.target.value)} className="w-full px-4 py-2.5 text-sm bg-white rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow shadow-sm" />
              </div>
              <div>
                <label className="block text-[13px] font-bold text-slate-700 mb-2">Offer Button Text</label>
                <input type="text" value={item.button_text || ''} onChange={e => handleItemChange(index, 'button_text', e.target.value)} className="w-full px-4 py-2.5 text-sm bg-white rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow shadow-sm" />
              </div>
              <div>
                <label className="block text-[13px] font-bold text-slate-700 mb-2">Offer Link</label>
                <input type="text" value={item.offer_link || ''} onChange={e => handleItemChange(index, 'offer_link', e.target.value)} className="w-full px-4 py-2.5 text-sm bg-white rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow shadow-sm" />
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-bold text-slate-700 mb-2">Image</label>
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                <div className="flex-1 w-full bg-white rounded-xl border border-slate-200 pr-3 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-indigo-500 transition-shadow">
                  <input type="file" accept="image/*" onChange={e => handleItemFileUpload(index, e.target.files[0])} className="w-full text-sm text-slate-500 file:mr-3 file:py-3 file:px-4 file:border-0 file:border-r file:border-slate-200 file:text-sm file:font-medium file:bg-slate-50 file:text-slate-700 hover:file:bg-slate-100 cursor-pointer outline-none" />
                </div>
                {item.image && (
                  <div className="flex-shrink-0 h-32 w-24 rounded-lg overflow-hidden border border-slate-200 shadow-sm">
                    <img src={item.image} alt="Offer" className="h-full w-full object-cover" />
                  </div>
                )}
              </div>
            </div>
            
          </div>
        ))}
      </div>
      <button onClick={handleAddItem} className="w-[52px] h-[42px] bg-indigo-600 text-white rounded-xl flex items-center justify-center hover:bg-indigo-700 transition shadow-md">
        <Plus size={20} strokeWidth={2.5} />
      </button>
    </div>
  );
}

function LatestBlogEditor({ config, setConfig }) {
  const handleChange = (field, value) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 md:p-8 shadow-sm space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-[13px] font-bold text-slate-700 mb-2">Shoulder</label>
          <input type="text" value={config.shoulder || ''} onChange={e => handleChange('shoulder', e.target.value)} className="w-full px-4 py-2.5 text-sm bg-white rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow shadow-sm" />
        </div>
        <div>
          <label className="block text-[13px] font-bold text-slate-700 mb-2">Title</label>
          <input type="text" value={config.title || ''} onChange={e => handleChange('title', e.target.value)} className="w-full px-4 py-2.5 text-sm bg-white rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow shadow-sm" />
        </div>
        <div>
          <label className="block text-[13px] font-bold text-slate-700 mb-2">Total Display</label>
          <input type="number" value={config.total_display || ''} onChange={e => handleChange('total_display', e.target.value)} className="w-full px-4 py-2.5 text-sm bg-white rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow shadow-sm" />
        </div>
        <div>
          <label className="block text-[13px] font-bold text-slate-700 mb-2">Order By</label>
          <select value={config.order_by || ''} onChange={e => handleChange('order_by', e.target.value)} className="w-full px-4 py-2.5 text-sm bg-white rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow shadow-sm text-slate-700 appearance-none">
            <option value="">Select Option</option>
            <option value="Descending">Descending</option>
            <option value="Ascending">Ascending</option>
          </select>
        </div>
      </div>
    </div>
  );
}

function VisaProcessingEditor({ config, setConfig }) {
  const handleChange = (field, value) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 md:p-8 shadow-sm space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-[13px] font-bold text-slate-700 mb-2">Shoulder</label>
          <input type="text" value={config.shoulder || ''} onChange={e => handleChange('shoulder', e.target.value)} className="w-full px-4 py-2.5 text-sm bg-white rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow shadow-sm" />
        </div>
        <div>
          <label className="block text-[13px] font-bold text-slate-700 mb-2">Title</label>
          <input type="text" value={config.title || ''} onChange={e => handleChange('title', e.target.value)} className="w-full px-4 py-2.5 text-sm bg-white rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow shadow-sm" />
        </div>
        <div>
          <label className="block text-[13px] font-bold text-slate-700 mb-2">Number of Display</label>
          <input type="number" value={config.number_of_display || ''} onChange={e => handleChange('number_of_display', e.target.value)} className="w-full px-4 py-2.5 text-sm bg-white rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow shadow-sm" />
        </div>
        <div>
          <label className="block text-[13px] font-bold text-slate-700 mb-2">Order By</label>
          <select value={config.order_by || ''} onChange={e => handleChange('order_by', e.target.value)} className="w-full px-4 py-2.5 text-sm bg-white rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow shadow-sm text-slate-700 appearance-none">
            <option value="">Select Option</option>
            <option value="Descending">Descending</option>
            <option value="Ascending">Ascending</option>
          </select>
        </div>
      </div>
    </div>
  );
}

function FunFactsEditor({ config, setConfig, handleFileSelect }) {
  const handleItemChange = (index, field, value) => {
    const newItems = [...(config.items || [])];
    newItems[index] = { ...newItems[index], [field]: value };
    setConfig(prev => ({ ...prev, items: newItems }));
  };

  const handleAddItem = () => {
    setConfig(prev => ({
      ...prev,
      items: [...(prev.items || []), { title: '', number_count: '', icon: '' }]
    }));
  };

  const handleRemoveItem = (index) => {
    setConfig(prev => ({
      ...prev,
      items: (prev.items || []).filter((_, i) => i !== index)
    }));
  };

  const handleFileUpload = (index, file) => {
    if (!file) return;
    if (handleFileSelect) handleFileSelect(`items[${index}][icon]`, file);
  };

  useEffect(() => {
    if (!config.items || config.items.length === 0) {
      handleAddItem();
    }
  }, []);

  const items = config.items || [];

  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div key={index} className="flex flex-col md:flex-row items-start gap-4 bg-[#F8F9FA] border border-slate-100 rounded-xl p-4 relative shadow-sm">
          
          <div className="flex-1 w-full">
            <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Title</label>
            <input type="text" value={item.title || ''} onChange={e => handleItemChange(index, 'title', e.target.value)} className="w-full px-4 py-2.5 text-sm bg-white rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow shadow-sm" />
          </div>
          
          <div className="flex-1 w-full">
            <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Number Count</label>
            <input type="text" value={item.number_count || ''} onChange={e => handleItemChange(index, 'number_count', e.target.value)} className="w-full px-4 py-2.5 text-sm bg-white rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow shadow-sm" />
          </div>

          <div className="flex-[1.2] w-full flex items-start gap-3">
            <div className="flex-1">
              <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Icon</label>
              <div className="flex items-center gap-2 w-full bg-white rounded-xl border border-slate-200 pr-2 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-indigo-500 transition-shadow">
                <input type="file" accept="image/*" onChange={e => handleFileUpload(index, e.target.files[0])} className="w-full text-sm text-slate-500 file:mr-2 file:py-2.5 file:px-4 file:border-0 file:border-r file:border-slate-200 file:text-sm file:font-medium file:bg-slate-50 file:text-slate-700 hover:file:bg-slate-100 cursor-pointer outline-none" />
                {item.icon && <img src={item.icon} alt="Icon" className="h-8 w-8 object-contain flex-shrink-0" />}
              </div>
            </div>
            <button onClick={() => handleRemoveItem(index)} className="mt-[26px] h-[40px] w-[40px] flex items-center justify-center bg-red-50/80 text-red-500 rounded-xl hover:bg-red-100 transition flex-shrink-0">
              <Trash2 size={16} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      ))}
      <button onClick={handleAddItem} className="w-[52px] h-[42px] bg-indigo-600 text-white rounded-xl flex items-center justify-center hover:bg-indigo-700 transition shadow-md">
        <Plus size={20} strokeWidth={2.5} />
      </button>
    </div>
  );
}

function FaqEditor({ config, setConfig }) {
  const handleConfigChange = (field, value) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...(config.items || [])];
    newItems[index] = { ...newItems[index], [field]: value };
    setConfig(prev => ({ ...prev, items: newItems }));
  };

  const handleAddItem = () => {
    setConfig(prev => ({
      ...prev,
      items: [...(prev.items || []), { question: '', answer: '' }]
    }));
  };

  const handleRemoveItem = (index) => {
    setConfig(prev => ({
      ...prev,
      items: (prev.items || []).filter((_, i) => i !== index)
    }));
  };

  useEffect(() => {
    if (!config.items || config.items.length === 0) {
      handleAddItem();
    }
  }, []);

  const items = config.items || [];

  return (
    <div className="space-y-6">
      {/* Top Config */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <label className="block text-[13px] font-bold text-slate-700 mb-2">Main Title</label>
        <input type="text" value={config.title || ''} onChange={e => handleConfigChange('title', e.target.value)} placeholder="Main Title" className="w-full px-4 py-2.5 text-sm bg-white rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow shadow-sm" />
      </div>

      {/* FAQs */}
      <div className="space-y-6">
        {items.map((item, index) => (
          <div key={index} className="bg-[#F8F9FA] border border-slate-100 rounded-xl p-6 md:p-8 relative shadow-sm space-y-4">
            <button onClick={() => handleRemoveItem(index)} className="absolute -top-3 -right-3 h-[36px] w-[36px] flex items-center justify-center bg-red-100 text-red-500 rounded-full hover:bg-red-200 transition shadow-sm z-10">
              <Trash2 size={16} strokeWidth={2.5} />
            </button>
            <div>
              <label className="block text-[13px] font-bold text-slate-700 mb-2">Question</label>
              <input type="text" placeholder="Enter Question" value={item.question || ''} onChange={e => handleItemChange(index, 'question', e.target.value)} className="w-full px-4 py-2.5 text-sm bg-white rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow shadow-sm" />
            </div>
            <div>
              <label className="block text-[13px] font-bold text-slate-700 mb-2">Answer</label>
              <ReactQuill 
                theme="snow" 
                value={item.answer || ''} 
                onChange={(val) => handleItemChange(index, 'answer', val)} 
                className="bg-white rounded-xl overflow-hidden [&_.ql-toolbar]:border-slate-200 [&_.ql-toolbar]:rounded-t-xl [&_.ql-container]:border-slate-200 [&_.ql-container]:rounded-b-xl [&_.ql-editor]:min-h-[150px] [&_.ql-editor]:text-sm shadow-sm"
              />
            </div>
          </div>
        ))}
      </div>
      <button onClick={handleAddItem} className="w-[52px] h-[42px] bg-indigo-600 text-white rounded-xl flex items-center justify-center hover:bg-indigo-700 transition shadow-md">
        <Plus size={20} strokeWidth={2.5} />
      </button>
    </div>
  );
}

function CodeEditor({ config, setConfig }) {
  const handleConfigChange = (field, value) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
      <label className="block text-[13px] font-bold text-slate-700 mb-2">Code</label>
      <ReactQuill 
        theme="snow" 
        value={config.code || ''} 
        onChange={(val) => handleConfigChange('code', val)} 
        placeholder="Write here.."
        className="bg-white rounded-xl overflow-hidden [&_.ql-toolbar]:border-slate-200 [&_.ql-toolbar]:rounded-t-xl [&_.ql-container]:border-slate-200 [&_.ql-container]:rounded-b-xl [&_.ql-editor]:min-h-[250px] [&_.ql-editor]:text-sm shadow-sm"
      />
    </div>
  );
}

function ContactUsEditor({ config, setConfig }) {
  const handleConfigChange = (field, value) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleStringArrayChange = (field, index, value) => {
    const newArr = [...(config[field] || [])];
    newArr[index] = value;
    setConfig(prev => ({ ...prev, [field]: newArr }));
  };

  const handleAddStringArrayItem = (field) => {
    setConfig(prev => ({ ...prev, [field]: [...(prev[field] || []), ''] }));
  };

  const handleRemoveStringArrayItem = (field, index) => {
    setConfig(prev => ({ ...prev, [field]: (prev[field] || []).filter((_, i) => i !== index) }));
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 md:p-8 shadow-sm space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-[13px] font-bold text-slate-700 mb-2">Main Title</label>
          <input type="text" placeholder="Enter Main Title" value={config.main_title || ''} onChange={e => handleConfigChange('main_title', e.target.value)} className="w-full px-4 py-2.5 text-sm bg-white rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow shadow-sm" />
        </div>
        <div>
          <label className="block text-[13px] font-bold text-slate-700 mb-2">Sub Title</label>
          <input type="text" placeholder="Enter Sub Title" value={config.sub_title || ''} onChange={e => handleConfigChange('sub_title', e.target.value)} className="w-full px-4 py-2.5 text-sm bg-white rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow shadow-sm" />
        </div>
        <div>
          <label className="block text-[13px] font-bold text-slate-700 mb-2">Location</label>
          <input type="text" placeholder="Enter Location" value={config.location || ''} onChange={e => handleConfigChange('location', e.target.value)} className="w-full px-4 py-2.5 text-sm bg-white rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow shadow-sm" />
        </div>
        <div>
          <label className="block text-[13px] font-bold text-slate-700 mb-2">Map Iframe Code</label>
          <textarea rows="3" value={config.map_iframe_code || ''} onChange={e => handleConfigChange('map_iframe_code', e.target.value)} className="w-full px-4 py-2.5 text-sm bg-white rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none resize-y transition-shadow shadow-sm"></textarea>
        </div>
      </div>

      <div className="pt-2 space-y-6">
        {/* Contact Numbers */}
        <div className="flex flex-col md:flex-row md:items-start gap-4">
          <label className="w-32 text-[15px] font-bold text-slate-800 pt-2">Contact Number:</label>
          <div className="flex-1 space-y-3">
            {(config.contact_numbers || []).map((num, i) => (
              <div key={i} className="flex items-center gap-3">
                <input type="text" value={num} onChange={e => handleStringArrayChange('contact_numbers', i, e.target.value)} className="flex-1 px-4 py-2.5 text-sm bg-white rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow shadow-sm" />
                <button onClick={() => handleRemoveStringArrayItem('contact_numbers', i)} className="h-[40px] w-[40px] flex items-center justify-center bg-red-50/80 text-red-500 rounded-xl hover:bg-red-100 transition flex-shrink-0">
                  <Trash2 size={18} strokeWidth={2.5} />
                </button>
              </div>
            ))}
            <button onClick={() => handleAddStringArrayItem('contact_numbers')} className="w-[70px] h-[40px] bg-[#6f42c1] text-white rounded-xl flex items-center justify-center hover:bg-[#59339d] transition shadow-sm">
              <Plus size={20} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* Emails */}
        <div className="flex flex-col md:flex-row md:items-start gap-4">
          <label className="w-32 text-[15px] font-bold text-slate-800 pt-2">Email:</label>
          <div className="flex-1 space-y-3">
            {(config.emails || []).map((email, i) => (
              <div key={i} className="flex items-center gap-3">
                <input type="text" value={email} onChange={e => handleStringArrayChange('emails', i, e.target.value)} className="flex-1 px-4 py-2.5 text-sm bg-white rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow shadow-sm" />
                <button onClick={() => handleRemoveStringArrayItem('emails', i)} className="h-[40px] w-[40px] flex items-center justify-center bg-red-50/80 text-red-500 rounded-xl hover:bg-red-100 transition flex-shrink-0">
                  <Trash2 size={18} strokeWidth={2.5} />
                </button>
              </div>
            ))}
            <button onClick={() => handleAddStringArrayItem('emails')} className="w-[70px] h-[40px] bg-[#6f42c1] text-white rounded-xl flex items-center justify-center hover:bg-[#59339d] transition shadow-sm">
              <Plus size={20} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function TestimonialEditor({ config, setConfig, handleFileSelect }) {
  const categories = [
    { key: 'tripadvisor', label: 'Tripadvisor' },
    { key: 'facebook', label: 'Facebook' },
    { key: 'google', label: 'Google' }
  ];

  const handleConfigChange = (field, value) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleReviewChange = (category, index, field, value) => {
    const newReviews = [...(config[category] || [])];
    newReviews[index] = { ...newReviews[index], [field]: value };
    setConfig(prev => ({ ...prev, [category]: newReviews }));
  };

  const handleAddReview = (category) => {
    setConfig(prev => ({
      ...prev,
      [category]: [...(prev[category] || []), { name: '', country: '', rating: '', time: '', image: '', review: '' }]
    }));
  };

  const handleRemoveReview = (category, index) => {
    setConfig(prev => ({
      ...prev,
      [category]: (prev[category] || []).filter((_, i) => i !== index)
    }));
  };

  const handleReviewFileUpload = (category, index, file) => {
    if (!file) return;
    if (handleFileSelect) handleFileSelect(`${category}[${index}][image]`, file);
  };

  useEffect(() => {
    let needsUpdate = false;
    const initialConfig = { ...config };
    
    categories.forEach(cat => {
      if (!initialConfig[cat.key] || initialConfig[cat.key].length === 0) {
        initialConfig[cat.key] = [{ name: '', country: '', rating: '', time: '', image: '', review: '' }];
        needsUpdate = true;
      }
    });

    if (needsUpdate) {
      setConfig(prev => ({ ...prev, ...initialConfig }));
    }
  }, [config, setConfig]);

  return (
    <div className="space-y-8">
      {/* Top Config */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <div>
          <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Shoulder</label>
          <input type="text" value={config.shoulder || ''} onChange={e => handleConfigChange('shoulder', e.target.value)} className="w-full px-4 py-2.5 text-sm bg-white rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow shadow-sm" />
        </div>
        <div>
          <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Title</label>
          <input type="text" value={config.title || ''} onChange={e => handleConfigChange('title', e.target.value)} className="w-full px-4 py-2.5 text-sm bg-white rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow shadow-sm" />
        </div>
      </div>

      <hr className="border-slate-200 my-4" />

      {/* Categories */}
      {categories.map(cat => (
        <div key={cat.key} className="space-y-4">
          <h4 className="font-bold text-slate-800 text-base">{cat.label}</h4>
          
          <div className="space-y-4">
            {(config[cat.key] || []).map((review, index) => (
              <div key={index} className="bg-[#F8F9FA] border border-slate-100 rounded-xl p-5 relative shadow-sm space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Name</label>
                    <input type="text" value={review.name || ''} onChange={e => handleReviewChange(cat.key, index, 'name', e.target.value)} className="w-full px-4 py-2.5 text-sm bg-white rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow shadow-sm" />
                  </div>
                  <div>
                    <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Country</label>
                    <input type="text" value={review.country || ''} onChange={e => handleReviewChange(cat.key, index, 'country', e.target.value)} className="w-full px-4 py-2.5 text-sm bg-white rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow shadow-sm" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                  <div className="md:col-span-3">
                    <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Rating</label>
                    <input type="number" min="1" max="5" value={review.rating || ''} onChange={e => handleReviewChange(cat.key, index, 'rating', e.target.value)} className="w-full px-4 py-2.5 text-sm bg-white rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow shadow-sm" />
                  </div>
                  <div className="md:col-span-4">
                    <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Time</label>
                    <input type="text" placeholder="Enter Time" value={review.time || ''} onChange={e => handleReviewChange(cat.key, index, 'time', e.target.value)} className="w-full px-4 py-2.5 text-sm bg-white rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow shadow-sm" />
                  </div>
                  <div className="md:col-span-5 flex gap-3 items-start">
                    <div className="flex-1">
                      <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Image</label>
                      <div className="flex items-center gap-2 w-full bg-white rounded-xl border border-slate-200 pr-2 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-indigo-500 transition-shadow">
                        <input type="file" accept="image/*" onChange={e => handleReviewFileUpload(cat.key, index, e.target.files[0])} className="w-full text-sm text-slate-500 file:mr-2 file:py-2.5 file:px-4 file:border-0 file:border-r file:border-slate-200 file:text-sm file:font-medium file:bg-slate-50 file:text-slate-700 hover:file:bg-slate-100 cursor-pointer outline-none" />
                        {review.image && <img src={review.image} alt="Avatar" className="h-8 w-8 object-cover rounded flex-shrink-0" />}
                      </div>
                    </div>
                    <button onClick={() => handleRemoveReview(cat.key, index)} className="mt-[26px] h-[40px] w-[40px] flex items-center justify-center bg-red-50/80 text-red-500 rounded-xl hover:bg-red-100 transition flex-shrink-0">
                      <Trash2 size={16} strokeWidth={2.5} />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Review</label>
                  <textarea rows="3" value={review.review || ''} onChange={e => handleReviewChange(cat.key, index, 'review', e.target.value)} className="w-full px-4 py-2.5 text-sm bg-white rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none resize-y transition-shadow shadow-sm"></textarea>
                </div>
              </div>
            ))}
          </div>
          
          <button onClick={() => handleAddReview(cat.key)} className="w-[52px] h-[42px] bg-indigo-600 text-white rounded-xl flex items-center justify-center hover:bg-indigo-700 transition shadow-md">
            <Plus size={20} strokeWidth={2.5} />
          </button>
        </div>
      ))}
    </div>
  );
}

// ─── Determine which editor to show ──────────────────────────────────────────

function getWidgetType(slug = '') {
  const s = (slug || '').toLowerCase();
  if (s.includes('slider') || s.includes('banner')) return 'slider';
  if (s.includes('search')) return 'search';
  if (s.includes('about')) return 'about';
  if (s.includes('destination')) return 'destination';
  if (s.includes('product')) return 'product';
  if (s.includes('featured') || s.includes('tour')) return 'featured';
  if (s.includes('choose') || s.includes('features')) return 'choose';
  if (s.includes('tab-activities') || s.includes('activities')) return 'tab-activities';
  if (s.includes('offers') || s.includes('offer')) return 'offers';
  if (s.includes('blog') || s.includes('recent-news')) return 'blog';
  if (s.includes('testimonial')) return 'testimonial';
  if (s.includes('visa')) return 'visa';
  if (s.includes('fun-facts') || s.includes('counter')) return 'fun-facts';
  if (s.includes('faqs') || s.includes('faq')) return 'faq';
  if (s.includes('code')) return 'code';
  if (s.includes('contact')) return 'contact';
  return 'generic';
}

// ─── Main Modal ───────────────────────────────────────────────────────────────

export default function WidgetEditorModal({ isOpen, onClose, widget, onSave }) {
  const { token } = useAuth();
  // For array-based widgets (slider)
  const [items, setItems] = useState([]);
  // For object-based widgets (search, etc.)
  const [config, setConfig] = useState({});
  const [uploading, setUploading] = useState(false);
  // Pending file objects keyed by their FormData field name, e.g. 'items[0][image]'
  const [pendingFiles, setPendingFiles] = useState({});

  const widgetType = widget ? getWidgetType(widget.widget_slug) : 'generic';

  useEffect(() => {
    if (isOpen && widget) {
      setPendingFiles({});
      try {
        const parsed = widget.widget_content ? JSON.parse(widget.widget_content) : null;
        if (widgetType === 'slider') {
          const arr = Array.isArray(parsed) && parsed.length > 0 ? parsed : [{ title: '', buttonText: '', buttonUrl: '', location: '', rating: '', description: '', image: '', ratingLogo: '' }];
          setItems(arr);
        } else {
          setConfig(parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {});
        }
      } catch (e) {
        setItems([]);
        setConfig({});
      }
    }
  }, [isOpen, widget, widgetType]);

  if (!isOpen || !widget) return null;

  /**
   * Called by SliderEditor when a file is picked.
   * fieldName: e.g. 'items[0][image]'
   */
  const handleFileSelect = (fieldName, file) => {
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    // Inject preview URL into items/config so the UI shows it immediately
    const parts = fieldName.replace(/\]/g, '').split('[');
    if (widgetType === 'slider') {
      setItems(prev => {
        const n = JSON.parse(JSON.stringify(prev));
        let cursor = n;
        for (let i = 0; i < parts.length - 1; i++) {
          const k = isNaN(Number(parts[i])) ? parts[i] : Number(parts[i]);
          if (!cursor[k]) cursor[k] = {};
          cursor = cursor[k];
        }
        const last = parts[parts.length - 1];
        cursor[isNaN(Number(last)) ? last : Number(last)] = previewUrl;
        return n;
      });
    } else {
      setConfig(prev => {
        const n = JSON.parse(JSON.stringify(prev));
        let cursor = n;
        for (let i = 0; i < parts.length - 1; i++) {
          const k = isNaN(Number(parts[i])) ? parts[i] : Number(parts[i]);
          if (!cursor[k]) cursor[k] = {};
          cursor = cursor[k];
        }
        const last = parts[parts.length - 1];
        cursor[isNaN(Number(last)) ? last : Number(last)] = previewUrl;
        return n;
      });
    }
    setPendingFiles(prev => ({ ...prev, [fieldName]: file }));
  };

  // Legacy: still used by some sub-editors that haven't been migrated
  const handleFileUpload = async (index, field, file) => {
    if (!file) return;
    const fieldName = widgetType === 'slider' ? `${index}[${field}]` : `items[${index}][${field}]`;
    handleFileSelect(fieldName, file);
  };

  const handleSave = async () => {
    setUploading(true);
    try {
      const configJson = widgetType === 'slider'
        ? JSON.stringify(items)
        : JSON.stringify(config);

      const formData = new FormData();
      formData.append('config_json', configJson);

      // Attach all pending files using descriptive field names the backend can parse
      for (const [fieldName, file] of Object.entries(pendingFiles)) {
        formData.append(fieldName, file);
      }

      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/widget-content/${widget.unique_id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      if (!res.ok) throw new Error('Save failed');
      const data = await res.json();

      // Notify parent with the final persisted content
      if (onSave) onSave(widget.unique_id, JSON.stringify(data.config));
      onClose();
    } catch (err) {
      console.error(err);
      alert('Failed to save widget content. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      
      {/* Right Panel */}
      <div className="relative bg-white shadow-2xl w-full max-w-2xl h-full flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <h3 className="font-bold text-lg text-slate-800 capitalize">{widget.widget_name} Settings</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-slate-500 transition">
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50 space-y-6">
          {widgetType === 'slider' && (
            <SliderEditor items={items} setItems={setItems} handleFileUpload={handleFileUpload} uploading={uploading} />
          )}
          {widgetType === 'search' && (
            <SearchEditor config={config} setConfig={setConfig} />
          )}
          {widgetType === 'about' && (
            <AboutUsEditor config={config} setConfig={setConfig} handleFileSelect={handleFileSelect} uploading={uploading} />
          )}
          {widgetType === 'destination' && (
            <DestinationEditor config={config} setConfig={setConfig} />
          )}
          {widgetType === 'product' && (
            <LatestProductEditor config={config} setConfig={setConfig} />
          )}
          {widgetType === 'featured' && (
            <FeaturedTourEditor config={config} setConfig={setConfig} />
          )}
          {widgetType === 'choose' && (
            <WhyChooseUsEditor config={config} setConfig={setConfig} handleFileSelect={handleFileSelect} />
          )}
          {widgetType === 'tab-activities' && (
            <TabActivitiesEditor config={config} setConfig={setConfig} handleFileSelect={handleFileSelect} />
          )}
          {widgetType === 'offers' && (
            <OffersEditor config={config} setConfig={setConfig} handleFileSelect={handleFileSelect} />
          )}
          {widgetType === 'blog' && (
            <LatestBlogEditor config={config} setConfig={setConfig} />
          )}
          {widgetType === 'testimonial' && (
            <TestimonialEditor config={config} setConfig={setConfig} handleFileSelect={handleFileSelect} />
          )}
          {widgetType === 'visa' && (
            <VisaProcessingEditor config={config} setConfig={setConfig} />
          )}
          {widgetType === 'fun-facts' && (
            <FunFactsEditor config={config} setConfig={setConfig} handleFileSelect={handleFileSelect} />
          )}
          {widgetType === 'faq' && (
            <FaqEditor config={config} setConfig={setConfig} />
          )}
          {widgetType === 'code' && (
            <CodeEditor config={config} setConfig={setConfig} />
          )}
          {widgetType === 'contact' && (
            <ContactUsEditor config={config} setConfig={setConfig} />
          )}
          {widgetType === 'generic' && (
            <div className="text-center py-10 text-slate-500">
              <p className="font-medium">No specific editor available for this widget yet.</p>
              <p className="text-sm mt-1 opacity-70">Configuration will be added soon.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-white flex justify-end gap-3 shrink-0">
          <button onClick={onClose} className="px-5 py-2 rounded-lg text-slate-600 font-medium hover:bg-slate-50 border border-slate-200 transition">
            Cancel
          </button>
          <button onClick={handleSave} disabled={uploading} className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium shadow-sm transition disabled:opacity-50">
            {uploading ? 'Uploading...' : 'Update'}
          </button>
        </div>
      </div>
    </div>
  );
}
