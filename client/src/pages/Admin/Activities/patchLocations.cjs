const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'ActivityForm.jsx');
let content = fs.readFileSync(filePath, 'utf-8');

// 1. Rewrite fetchLocations and restore useEffects
const oldFetchLocations = `  const fetchLocations = async () => {
    try {
      const [cRes, sRes, ciRes] = await Promise.all([
        fetch('http://localhost:5000/api/locations/countries'),
        fetch('http://localhost:5000/api/locations/states'),
        fetch('http://localhost:5000/api/locations/cities')
      ]);
      setCountries(await cRes.json());
      setStates(await sRes.json());
      setCities(await ciRes.json());
    } catch (err) { console.error(err); }
  };`;

const newFetchLocations = `  const fetchLocations = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/locations/countries');
      setCountries(await res.json());
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    if (formData.country_id) {
      fetch(\`http://localhost:5000/api/locations/states/\${formData.country_id}\`)
        .then(res => res.json())
        .then(data => setStates(data))
        .catch(console.error);
    } else { setStates([]); }
  }, [formData.country_id]);

  useEffect(() => {
    if (formData.state_id) {
      fetch(\`http://localhost:5000/api/locations/cities/\${formData.state_id}\`)
        .then(res => res.json())
        .then(data => setCities(data))
        .catch(console.error);
    } else { setCities([]); }
  }, [formData.state_id]);`;

content = content.replace(oldFetchLocations, newFetchLocations);

// 2. Rewrite handleCreateLocation
const oldHandleCreateLocation = `  const handleCreateLocation = async (e) => {
    e.preventDefault();
    setModalSaving(true);
    try {
      const payload = { name: modalData.name, status: 1 };
      
      if (!locationModalEditId) {
        payload.country_id = (locationModalType === 'state' || locationModalType === 'city') ? formData.country_id : null;
        payload.state_id = locationModalType === 'city' ? formData.state_id : null;
      }
      
      let endpoint = 'countries';
      if (locationModalType === 'state') endpoint = 'states';
      if (locationModalType === 'city') endpoint = 'cities';

      const res = await fetch(\`http://localhost:5000/api/locations/\${endpoint}\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: \`Bearer \${token}\` },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        await fetchLocations();
        setShowLocationModal(false);
        setModalData({ name: '' });
      } else {
        alert('Failed to save location');
      }
    } catch (error) {
      console.error(error);
      alert('An error occurred');
    } finally {
      setModalSaving(false);
    }
  };`;

const newHandleCreateLocation = `  const handleCreateLocation = async (e) => {
    if (e) e.preventDefault();
    if (!locationModalInput.trim()) return;
    setLocationModalSaving(true);
    try {
      const isEdit = !!locationModalEditId;
      const url = isEdit ? \`http://localhost:5000/api/locations/\${locationModalEditId}\` : 'http://localhost:5000/api/locations';
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
          Authorization: \`Bearer \${token}\`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error(\`Failed to \${isEdit ? 'update' : 'create'} location\`);
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
      alert(\`Error \${locationModalEditId ? 'updating' : 'creating'} location\`);
    } finally {
      setLocationModalSaving(false);
    }
  };`;

content = content.replace(oldHandleCreateLocation, newHandleCreateLocation);

// Also need to remove the broken call `await fetchLocations();` from delete location button
// in the UI and replace with updateList equivalent.
const regexDeleteButton = /<button\s+onClick=\{async \(\) => \{\s*if\(!window.confirm\('Delete this location\?'\)\) return;\s*await fetch\(\`http:\/\/localhost:5000\/api\/locations\/\$\{loc\.id\}\`, \{ method: 'DELETE', headers: \{ Authorization: \`Bearer \$\{token\}\` \}\}\);\s*fetchLocations\(\);\s*\}\}/g;
const replaceDeleteButton = `<button 
                              onClick={async () => {
                                if(!window.confirm('Delete this location?')) return;
                                const res = await fetch(\`http://localhost:5000/api/locations/\${loc.id}\`, { method: 'DELETE', headers: { Authorization: \`Bearer \${token}\` }});
                                if (res.ok) {
                                  if (locationModalType === 'country') setCountries(prev => prev.filter(c => c.id !== loc.id));
                                  if (locationModalType === 'state') setStates(prev => prev.filter(s => s.id !== loc.id));
                                  if (locationModalType === 'city') setCities(prev => prev.filter(c => c.id !== loc.id));
                                }
                              }}`;
content = content.replace(regexDeleteButton, replaceDeleteButton);

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Location logic patched');
