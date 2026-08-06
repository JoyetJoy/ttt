const fs = require('fs');
const path = require('path');

const destFormPath = path.join(__dirname, 'Destinations', 'DestinationForm.jsx');
let destContent = fs.readFileSync(destFormPath, 'utf-8');

// 1. Add states to DestinationForm
const destStateSearch = `  const [loading, setLoading] = useState(isEdit);`;
const destStateReplace = `  const [loading, setLoading] = useState(isEdit);
  const [masterAttributes, setMasterAttributes] = useState([]);
  const [showAttributeModal, setShowAttributeModal] = useState(false);
  const [attributeModalData, setAttributeModalData] = useState({ id: null, name: '', terms: [] });
  const [attributeSaving, setAttributeSaving] = useState(false);`;
if(!destContent.includes('masterAttributes')) {
  destContent = destContent.replace(destStateSearch, destStateReplace);
}

// 2. Add attribute_terms to formData in DestinationForm
const destFormDataSearch = `status: 1\n  });`;
const destFormDataReplace = `status: 1,\n    attribute_terms: []\n  });`;
if(!destContent.includes('attribute_terms: []')) {
  destContent = destContent.replace(destFormDataSearch, destFormDataReplace);
}

// 3. Add fetchMasterAttributes and parse logic in DestinationForm
const destFetchSearch = `  useEffect(() => {
    if (isEdit) fetchDestination();
    else setLoading(false);
  }, [id, isEdit]);`;

const destFetchReplace = `  const fetchMasterAttributes = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/destination-attributes');
      if (res.ok) {
        const data = await res.json();
        setMasterAttributes(data);
      }
    } catch (err) { console.error('Failed to load attributes', err); }
  };

  useEffect(() => {
    fetchMasterAttributes();
    if (isEdit) fetchDestination();
    else setLoading(false);
  }, [id, isEdit]);`;
if(!destContent.includes('fetchMasterAttributes')) {
  destContent = destContent.replace(destFetchSearch, destFetchReplace);
}

// Parse logic inside fetchDestination
const parseLogicSearch = `setFormData({
        title: data.title || '',`;
const parseLogicReplace = `
        const parseJSON = (str) => {
          try { return str ? JSON.parse(str) : []; } 
          catch(e) { return []; }
        };
        setFormData({
        title: data.title || '',`;
if(!destContent.includes('parseJSON')) {
  destContent = destContent.replace(parseLogicSearch, parseLogicReplace);
}

const formDataSetSearch = `enable_seo: data.enable_seo || '0',`;
const formDataSetReplace = `enable_seo: data.enable_seo || '0',\n        attribute_terms: parseJSON(data.attribute_terms),`;
if(!destContent.includes('parseJSON(data.attribute_terms)')) {
  destContent = destContent.replace(formDataSetSearch, formDataSetReplace);
}

// 4. Attribute Modal Handlers
const destAttrHandlers = `
  const handleOpenAttributeModal = (attr = null) => {
    if (attr) {
      setAttributeModalData({ id: attr.id, name: attr.name, terms: attr.destination_attribute_terms.map(t => t.name) });
    } else {
      setAttributeModalData({ id: null, name: '', terms: [] });
    }
    setShowAttributeModal(true);
  };

  const handleSaveAttribute = async (e) => {
    e.preventDefault();
    if (!attributeModalData.name.trim()) return alert('Attribute name is required');
    if (attributeModalData.terms.length === 0) return alert('At least one term is required');
    
    setAttributeSaving(true);
    try {
      const isEdit = !!attributeModalData.id;
      const url = isEdit 
        ? \`http://localhost:5000/api/destination-attributes/\${attributeModalData.id}\`
        : 'http://localhost:5000/api/destination-attributes';
      
      const res = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: \`Bearer \${token}\` },
        body: JSON.stringify({ name: attributeModalData.name, terms: attributeModalData.terms.map(t => typeof t === 'string' ? t : t.item) })
      });

      if (res.ok) {
        await fetchMasterAttributes();
        setShowAttributeModal(false);
      } else {
        alert('Failed to save attribute');
      }
    } catch (err) {
      console.error(err);
      alert('Error saving attribute');
    } finally {
      setAttributeSaving(false);
    }
  };

  const handleDeleteAttribute = async (id) => {
    if (!window.confirm('Delete this attribute completely?')) return;
    try {
      const res = await fetch(\`http://localhost:5000/api/destination-attributes/\${id}\`, {
        method: 'DELETE',
        headers: { Authorization: \`Bearer \${token}\` }
      });
      if (res.ok) {
        setMasterAttributes(prev => prev.filter(a => a.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async (e) => {`;
destContent = destContent.replace('  const handleSave = async (e) => {', destAttrHandlers);


// 5. Sidebar Tab
const destSidebarSearch = `              <button 
                type="button" 
                onClick={() => setActiveTab('media')}
                className={\`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors \${
                  activeTab === 'media' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'
                }\`}
              >
                <ImageIcon size={18} /> Media & SEO
              </button>`;
const destSidebarReplace = `              <button 
                type="button" 
                onClick={() => setActiveTab('attributes')}
                className={\`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors \${
                  activeTab === 'attributes' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'
                }\`}
              >
                <Settings size={18} /> Attributes
              </button>\n` + destSidebarSearch;
if(!destContent.includes("setActiveTab('attributes')")) {
  destContent = destContent.replace(destSidebarSearch, destSidebarReplace);
  // Also import Settings icon
  destContent = destContent.replace('Plus, X } from \'lucide-react\'', 'Plus, X, Settings } from \'lucide-react\'');
}

// 6. Attributes Tab UI + Modal UI
const destAttrUI = `
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
                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" 
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

          {activeTab === 'media'`;

destContent = destContent.replace("{activeTab === 'media'", destAttrUI);

const attrModalUI = `
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
                    <button type="submit" disabled={attributeSaving} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition shadow-sm disabled:opacity-50">
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
    </div>`;

destContent = destContent.replace("    </div>\n  );\n}\n", attrModalUI + "\n    </div>\n  );\n}\n");

// 7. Inject DynamicListSection if missing
if (!destContent.includes('const DynamicListSection =')) {
  destContent += `
const DynamicListSection = ({ title, commonTitleField, commonTitleValue, onCommonTitleChange, items = [], setItems, emptyItem, children }) => {
  const showTitleInput = typeof commonTitleField === 'string' && commonTitleField.length > 0;
  return (
    <div className="pt-6 border-t border-slate-100 first:pt-0 first:border-0">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-bold text-slate-800 text-[15px]">{title}</h4>
        {showTitleInput && (
          <input type="text" name={commonTitleField} value={commonTitleValue} onChange={onCommonTitleChange} placeholder={\`Enter \${title} Title\`} className="w-1/2 px-4 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-white" />
        )}
      </div>
      <div className="space-y-3 mb-4">
        {items.map((item, idx) => (
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
`;
}

fs.writeFileSync(destFormPath, destContent, 'utf-8');
console.log('DestinationForm patched');
