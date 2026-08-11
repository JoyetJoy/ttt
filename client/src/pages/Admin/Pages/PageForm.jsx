import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { Save, ArrowLeft, FileText, Settings, List, Plus, Trash2, Edit, LayoutTemplate, GripVertical } from 'lucide-react';
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import WidgetEditorModal from './WidgetEditorModal';

function SortableWidgetRow({ widget, onRemove, onToggleStatus, onEdit }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: widget.unique_id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0,
    position: 'relative',
  };
  
  return (
    <div ref={setNodeRef} style={style} className={`bg-white border ${isDragging ? 'border-indigo-500 shadow-md' : 'border-slate-200 shadow-sm'} rounded-xl p-3 mb-3 flex items-center justify-between`}>
      <div className="flex items-center gap-4">
        <div {...attributes} {...listeners} className="cursor-grab hover:text-indigo-600 text-slate-400 focus:outline-none p-1">
          <GripVertical size={20} />
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center" dangerouslySetInnerHTML={{__html: widget.icon || '<i class="bi bi-layout-text-window"></i>'}} />
          <span className="font-semibold text-slate-700">{widget.widget_name}</span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <label className="relative inline-flex items-center cursor-pointer">
          <input type="checkbox" className="sr-only peer" checked={widget.status === 1} onChange={() => onToggleStatus(widget.unique_id)} />
          <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
        </label>
        <button type="button" onClick={() => onEdit(widget)} className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition">
          <Edit size={16} />
        </button>
        <button type="button" onClick={() => onRemove(widget.unique_id)} className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition">
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}

export default function PageForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { token } = useAuth();
  
  const [activeTab, setActiveTab] = useState('general');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const [availableWidgets, setAvailableWidgets] = useState([]);
  const [editingWidget, setEditingWidget] = useState(null);

  const [formData, setFormData] = useState({
    page_name: '',
    page_slug: '',
    meta_title: '',
    meta_keyward: '',
    meta_description: '',
    status: 1,
    enable_seo: '0',
    is_bread_crumb: 1,
    widgets: [] 
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const wRes = await fetch(`${import.meta.env.VITE_API_URL}/admin/widgets`, { headers: { Authorization: `Bearer ${token}` } });
        if (wRes.ok) {
          const wData = await wRes.json();
          setAvailableWidgets(wData);
        }

        if (isEdit) {
          const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/pages/${id}`, { headers: { Authorization: `Bearer ${token}` } });
          if (!res.ok) throw new Error('Failed to fetch page');
          const data = await res.json();
          
          setFormData({
            page_name: data.page_name || '',
            page_slug: data.page_slug || '',
            meta_title: data.meta_title || '',
            meta_keyward: data.meta_keyward || '',
            meta_description: data.meta_description || '',
            status: data.status !== undefined ? data.status : 1,
            enable_seo: data.enable_seo || '0',
            is_bread_crumb: data.is_bread_crumb !== undefined ? data.is_bread_crumb : 1,
            widgets: (data.widget_contents || []).map(w => ({
              ...w,
              unique_id: `db_${w.id}`,
              widget_name: w.widget_slug 
            }))
          });
        }
      } catch (error) {
        console.error(error);
        alert('Error loading page data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, isEdit, token]);

  useEffect(() => {
    if (availableWidgets.length > 0 && formData.widgets.length > 0) {
      setFormData(prev => {
        let changed = false;
        const mappedWidgets = prev.widgets.map(w => {
          const sourceWidget = availableWidgets.find(aw => aw.widget_slug === w.widget_slug);
          if (sourceWidget && (!w.widget_name || w.widget_name === w.widget_slug)) {
            changed = true;
            return { ...w, widget_name: sourceWidget.widget_name, icon: sourceWidget.icon };
          }
          return w;
        });
        if (changed) return { ...prev, widgets: mappedWidgets };
        return prev;
      });
    }
  }, [availableWidgets, formData.widgets]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (checked ? 1 : 0) : value
    }));
  };

  const handleContentChange = (content) => {
    setFormData(prev => ({ ...prev, meta_description: content }));
  };

  const handleAddWidget = (widget) => {
    setFormData(prev => ({
      ...prev,
      widgets: [
        ...prev.widgets, 
        { ...widget, unique_id: `new_${Date.now()}_${Math.random()}`, status: 1 }
      ]
    }));
  };

  const handleRemoveWidget = (unique_id) => {
    setFormData(prev => ({
      ...prev,
      widgets: prev.widgets.filter(w => w.unique_id !== unique_id)
    }));
  };

  const handleToggleWidgetStatus = (unique_id) => {
    setFormData(prev => ({
      ...prev,
      widgets: prev.widgets.map(w => 
        w.unique_id === unique_id ? { ...w, status: w.status === 1 ? 0 : 1 } : w
      )
    }));
  };

  const handleEditWidget = (widget) => {
    setEditingWidget(widget);
  };

  const handleSaveWidgetContent = (unique_id, content) => {
    setFormData(prev => ({
      ...prev,
      widgets: prev.widgets.map(w => 
        w.unique_id === unique_id ? { ...w, widget_content: content } : w
      )
    }));
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setFormData((prev) => {
        const oldIndex = prev.widgets.findIndex(w => w.unique_id === active.id);
        const newIndex = prev.widgets.findIndex(w => w.unique_id === over.id);
        return { ...prev, widgets: arrayMove(prev.widgets, oldIndex, newIndex) };
      });
    }
  };

  const handleSave = async () => {
    if (!formData.page_name.trim()) return alert('Menu Name is required.');
    
    setSaving(true);
    try {
      const url = isEdit 
        ? `${import.meta.env.VITE_API_URL}/admin/pages/${id}`
        : `${import.meta.env.VITE_API_URL}/admin/pages`;
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        throw new Error('Failed to save page');
      }

      if (!isEdit) {
        const data = await res.json();
        navigate(`/admin/pages/edit/${data.id}`);
      } else {
        navigate('/admin/pages');
      }
    } catch (err) {
      console.error(err);
      alert('Error saving page');
    } finally {
      setSaving(false);
    }
  };

  if (loading && isEdit) {
    return (
      <div className="flex h-[80vh] items-center justify-center bg-[#F4F6F9]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  const TABS = [
    { id: 'general', label: 'General Info', icon: List },
    { id: 'seo', label: 'SEO Settings', icon: Settings },
    { id: 'builder', label: 'Page Builder', icon: LayoutTemplate }
  ];

  return (
    <div className="bg-[#F4F6F9] min-h-full font-['Inter',sans-serif]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">{isEdit ? 'Edit Page' : 'Add New Page'}</h2>
          <p className="text-sm text-slate-500 mt-1">Configure your custom page content and settings.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/admin/pages" className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition text-sm font-medium flex items-center gap-2 shadow-sm">
            <ArrowLeft size={16} /> Back to List
          </Link>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition shadow-sm font-medium text-sm flex items-center gap-2 disabled:opacity-50"
          >
            <Save size={16} /> {saving ? 'Saving...' : 'Save Page'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        {isEdit && (
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-2 flex flex-col gap-1">
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
            
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 space-y-5">
              <h3 className="font-semibold text-slate-800 border-b border-slate-100 pb-2">Status & Config</h3>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">Page Status</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" name="status" className="sr-only peer" checked={formData.status === 1} onChange={handleChange} />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">Bread Crumb Enable</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" name="is_bread_crumb" className="sr-only peer" checked={formData.is_bread_crumb === 1} onChange={handleChange} />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Content Area */}
        <div className={`bg-white rounded-xl shadow-sm border border-slate-100 ${activeTab === 'builder' ? 'p-0 overflow-hidden bg-slate-50' : 'p-4 md:p-6'} ${!isEdit ? 'lg:col-span-4 max-w-3xl mx-auto w-full' : 'lg:col-span-3'}`}>
          
          {/* GENERAL INFO */}
          {activeTab === 'general' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <h3 className="font-bold text-lg text-slate-800 border-b border-slate-100 pb-3 mb-5">General Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Menu Name <span className="text-red-500">*</span></label>
                  <input type="text" name="page_name" value={formData.page_name} onChange={handleChange} placeholder="e.g. Home" className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none transition" required />
                </div>
                
                {isEdit && (
                  <>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Slug Name <span className="text-red-500">*</span></label>
                      <input type="text" name="page_slug" value={formData.page_slug} onChange={handleChange} placeholder="e.g. home" className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none transition" required />
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* SEO SETTINGS */}
          {activeTab === 'seo' && isEdit && (
            <div className="space-y-6 animate-in fade-in duration-300 p-6">
              <h3 className="font-bold text-lg text-slate-800 border-b border-slate-100 pb-3 mb-5">SEO Settings</h3>
              
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-slate-700 text-[15px]">Allow Page SEO</h4>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" name="enable_seo" className="sr-only peer" checked={Number(formData.enable_seo) === 1} onChange={handleChange} />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>

              {Number(formData.enable_seo) === 1 && (
                <div className="space-y-5 bg-slate-50 p-5 rounded-xl border border-slate-100">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Meta Title <span className="text-red-500">*</span></label>
                    <input type="text" name="meta_title" value={formData.meta_title} onChange={handleChange} placeholder="Discover Your Dream Journey..." className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none transition" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Meta Keyword</label>
                    <textarea name="meta_keyward" value={formData.meta_keyward} onChange={handleChange} placeholder="keyword1, keyword2, keyword3" rows="2" className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none transition"></textarea>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Meta Description</label>
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                      <ReactQuill theme="snow" value={formData.meta_description} onChange={handleContentChange} className="h-32 mb-10" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* PAGE BUILDER */}
          {activeTab === 'builder' && isEdit && (
            <div className="animate-in fade-in duration-300 flex min-h-[600px] bg-slate-50 rounded-xl overflow-hidden">
              
              {/* Available Widgets Sidebar */}
              <div className="w-64 bg-white border-r border-slate-200 flex flex-col p-4 overflow-hidden shrink-0 sticky top-6 max-h-[calc(100vh-3rem)] overflow-y-auto custom-scrollbar self-start">
                <h4 className="font-bold text-sm text-slate-800 mb-4 sticky top-0 bg-white z-10 pb-2 border-b border-slate-100">Available Widgets</h4>
                <div className="grid grid-cols-2 gap-3">
                  {availableWidgets.map(widget => (
                    <button 
                      key={widget.id}
                      type="button"
                      onClick={() => handleAddWidget(widget)}
                      className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-100 bg-slate-50 hover:border-indigo-300 hover:bg-indigo-50 transition gap-2 group"
                    >
                      <div className="text-indigo-500 group-hover:scale-110 transition-transform" dangerouslySetInnerHTML={{__html: widget.icon || '<i class="bi bi-layout-text-window"></i>'}} />
                      <span className="text-[11px] font-semibold text-slate-600 text-center leading-tight">{widget.widget_name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Active Sortable Widgets Area */}
              <div className="flex-1 p-6 bg-slate-50">
                <h4 className="font-bold text-lg text-slate-800 mb-6">Page Layout</h4>
                
                {formData.widgets.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-slate-300 rounded-2xl bg-white text-slate-400">
                    <LayoutTemplate size={48} className="mb-4 opacity-50" />
                    <p className="font-medium text-sm">No widgets added yet.</p>
                    <p className="text-xs mt-1 opacity-75">Click widgets from the sidebar to add them to your page.</p>
                  </div>
                ) : (
                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={formData.widgets.map(w => w.unique_id)} strategy={verticalListSortingStrategy}>
                      <div className="space-y-1">
                        {formData.widgets.map((widget) => (
                          <SortableWidgetRow 
                            key={widget.unique_id} 
                            widget={widget} 
                            onRemove={handleRemoveWidget} 
                            onToggleStatus={handleToggleWidgetStatus}
                            onEdit={handleEditWidget}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
      
      <WidgetEditorModal 
        isOpen={!!editingWidget} 
        onClose={() => setEditingWidget(null)} 
        widget={editingWidget} 
        onSave={handleSaveWidgetContent} 
      />
    </div>
  );
}
