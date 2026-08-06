const fs = require('fs');
const path = require('path');

const hotelFormPath = path.join(__dirname, 'Hotels', 'HotelForm.jsx');
let hotelContent = fs.readFileSync(hotelFormPath, 'utf-8');

// 1. Add states
const hotelStateSearch = `  const [loading, setLoading] = useState(isEdit);`;
const hotelStateReplace = `  const [loading, setLoading] = useState(isEdit);
  const [masterAttributes, setMasterAttributes] = useState([]);
  const [showAttributeModal, setShowAttributeModal] = useState(false);
  const [attributeModalData, setAttributeModalData] = useState({ id: null, name: '', terms: [] });
  const [attributeSaving, setAttributeSaving] = useState(false);`;
if(!hotelContent.includes('masterAttributes')) {
  hotelContent = hotelContent.replace(hotelStateSearch, hotelStateReplace);
}

// 2. Add fetchMasterAttributes
const hotelFetchSearch = `  useEffect(() => {
    fetchLocations();
    if (isEdit) fetchHotel();
    else setLoading(false);
  }, [id, isEdit]);`;

const hotelFetchReplace = `  const fetchMasterAttributes = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/hotel-attributes');
      if (res.ok) {
        const data = await res.json();
        setMasterAttributes(data);
      }
    } catch (err) { console.error('Failed to load attributes', err); }
  };

  useEffect(() => {
    fetchLocations();
    fetchMasterAttributes();
    if (isEdit) fetchHotel();
    else setLoading(false);
  }, [id, isEdit]);`;
if(!hotelContent.includes('fetchMasterAttributes')) {
  hotelContent = hotelContent.replace(hotelFetchSearch, hotelFetchReplace);
}

// 3. Attribute Handlers
const attrHandlers = `
  const handleOpenAttributeModal = (attr = null) => {
    if (attr) {
      setAttributeModalData({ id: attr.id, name: attr.name, terms: attr.hotel_attribute_terms.map(t => t.name) });
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
        ? \`http://localhost:5000/api/hotel-attributes/\${attributeModalData.id}\`
        : 'http://localhost:5000/api/hotel-attributes';
      
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
      const res = await fetch(\`http://localhost:5000/api/hotel-attributes/\${id}\`, {
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

  const handleCreateLocation = async () => {`;
hotelContent = hotelContent.replace('  const handleCreateLocation = async () => {', attrHandlers);

// 4. Attributes Tab Replacement
const attrTabSearchRegex = /\{\/\*\s*Facilities\s*\*\/\}.*?\{\/\*\s*Property type\s*\*\/\}/s;
const attrTabReplace = `{/* Dynamic Attributes */}
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg text-slate-800">Hotel Attributes</h3>
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
                      {attr.hotel_attribute_terms.map(term => (
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

              {/* Property type */}`;

if(hotelContent.match(attrTabSearchRegex)) {
  hotelContent = hotelContent.replace(attrTabSearchRegex, attrTabReplace);
}

// 5. Inject Attribute Modal
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
                      {attr.hotel_attribute_terms.map(t => (
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

hotelContent = hotelContent.replace("{/* Location Modal */}", attrModalUI + "\n      {/* Location Modal */}");

fs.writeFileSync(hotelFormPath, hotelContent, 'utf-8');
console.log('HotelForm patched');
