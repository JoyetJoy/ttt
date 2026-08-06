const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'ActivityForm.jsx');
let content = fs.readFileSync(filePath, 'utf-8');

// 1. Restore map useEffect
const mapEffect = `
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
`;
content = content.replace('  const handleChange = (e) => {', mapEffect + '\n  const handleChange = (e) => {');

// 2. Restore setters
const setters = `
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
`;
content = content.replace('  const handleSave = async (e) => {', setters + '\n  const handleSave = async (e) => {');

// 3. Restore general Status
const statusField = `
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                  <select name="status" value={formData.status} onChange={handleChange} className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 outline-none focus:border-indigo-500 bg-white">
                    <option value={1}>Active</option>
                    <option value={2}>Draft</option>
                  </select>
                </div>
              </div>
`;
content = content.replace('              </div>\n            </div>\n          )}\n\n          {activeTab === \'media\'', statusField + '              </div>\n            </div>\n          )}\n\n          {activeTab === \'media\'');

// 4. Restore pricing, details, itinerary, location
const tabsContent = `
          {activeTab === 'pricing' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Price</label>
                  <input type="number" name="price" value={formData.price} onChange={handleChange} className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Sale Price</label>
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

          {activeTab === 'details' && (
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
            </div>
          )}

          {activeTab === 'itinerary' && (
            <div className="space-y-6 animate-in fade-in duration-300">
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

          {activeTab === 'location' && (
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
`;

content = content.replace('          {activeTab === \'attributes\'', tabsContent + '\n          {activeTab === \'attributes\'');

// 5. Restore DynamicListSection Signature
const newDLS = `const DynamicListSection = ({ title, commonTitleField, commonTitleValue, onCommonTitleChange, items, setItems, emptyItem, children }) => {
  const showTitleInput = typeof commonTitleField === 'string' && commonTitleField.length > 0;
  return (
    <div className="pt-6 border-t border-slate-100 first:pt-0 first:border-0">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-bold text-slate-800 text-[15px]">{title}</h4>
        {showTitleInput && (
          <input type="text" name={commonTitleField} value={commonTitleValue} onChange={onCommonTitleChange} placeholder={\`Enter \${title} Title\`} className="w-1/2 px-4 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-white" />
        )}
      </div>`;

const regexDLS = /const DynamicListSection = \(\{ title, items, setItems, emptyItem, children \}\) => \{\s*return \(\s*<div className="pt-6 border-t border-slate-100 first:pt-0 first:border-0">\s*<div className="flex items-center justify-between mb-4">\s*<h4 className="font-bold text-slate-800 text-\[15px\]">\{title\}<\/h4>\s*<input type="text" name=\{commonTitleField\} value=\{commonTitleValue\} onChange=\{onCommonTitleChange\} placeholder=\{\`Enter \$\{title\} Title\`\} className="w-1\/2 px-4 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-white" \/>\s*\)\}\s*<\/div>/g;

content = content.replace(regexDLS, newDLS);

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Restored');
