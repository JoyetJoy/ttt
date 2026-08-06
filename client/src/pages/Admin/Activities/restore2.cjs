const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'ActivityForm.jsx');
let content = fs.readFileSync(filePath, 'utf-8');

const locationModal = `
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
              <label className="block text-xs font-semibold text-slate-700 mb-1 capitalize">{locationModalEditId ? \`Edit \${locationModalType}\` : \`Add New \${locationModalType}\`}</label>
              <div className="flex flex-col gap-2">
                <input 
                  type="text" 
                  value={locationModalInput} 
                  onChange={(e) => setLocationModalInput(e.target.value)} 
                  placeholder={\`Enter \${locationModalType} name\`} 
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
                              title={\`Edit \${locationModalType}\`}
                            >
                              <Edit2 size={16} />
                            </button>
                            <button 
                              onClick={async () => {
                                if(!window.confirm('Delete this location?')) return;
                                await fetch(\`http://localhost:5000/api/locations/\${loc.id}\`, { method: 'DELETE', headers: { Authorization: \`Bearer \${token}\` }});
                                fetchLocations();
                              }}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition"
                              title={\`Delete \${locationModalType}\`}
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
`;

content = content.replace('{showAttributeModal && (', locationModal + '\n      {showAttributeModal && (');

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Restored Location Modal');
