import React, { useState, useEffect } from 'react';

export default function AdminSettings() {
  const [primaryColor, setPrimaryColor] = useState('#0081C9');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // Fetch the current theme color on mount
  useEffect(() => {
    fetchColor();
  }, []);

  const fetchColor = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/settings/theme`);
      const data = await response.json();
      if (data && data.color) {
        setPrimaryColor(data.color);
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching theme color:', err);
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      // Admin token is usually attached via context or localStorage
      const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/settings/theme`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ color: primaryColor })
      });
      
      const data = await response.json();
      if (response.ok) {
        setMessage(data.message || 'Theme color saved successfully!');
        
        // Instantly apply the color to the admin panel itself just for preview
        document.documentElement.style.setProperty('--primary-color1', primaryColor);
        
        // Calculate RGB for opacity variable
        const hex = primaryColor.replace('#', '');
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        document.documentElement.style.setProperty('--primary-color1-opc', `${r}, ${g}, ${b}`);
      } else {
        setMessage(data.message || 'Failed to save theme color.');
      }
    } catch (err) {
      console.error('Error saving theme color:', err);
      setMessage('Failed to save theme color. Please make sure you have admin rights.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-4">Loading settings...</div>;
  }

  return (
    <div className="admin-settings-container p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Theme Settings</h2>
      </div>

      {message && (
        <div className={`alert ${message.includes('Failed') ? 'alert-danger' : 'alert-success'}`}>
          {message}
        </div>
      )}

      <div className="card shadow-sm">
        <div className="card-body">
          <form onSubmit={handleSave}>
            <div className="form-group mb-4">
              <label htmlFor="primaryColor" className="form-label fw-bold">Global Primary Color</label>
              <div className="d-flex align-items-center gap-3">
                <input 
                  type="color" 
                  id="primaryColor" 
                  className="form-control form-control-color" 
                  value={primaryColor} 
                  onChange={(e) => setPrimaryColor(e.target.value)} 
                  title="Choose your color"
                  style={{ width: '100px', height: '50px' }}
                />
                <span className="text-muted text-uppercase fw-bold">{primaryColor}</span>
              </div>
              <small className="form-text text-muted mt-2">
                This color will be used globally across the entire website for buttons, icons, highlights, and backgrounds.
              </small>
            </div>

            <button type="submit" className="btn btn-primary px-4" disabled={saving}>
              {saving ? 'Saving...' : 'Save Theme Settings'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
