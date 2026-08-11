import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

export default function Profile() {
  const { user, token } = useAuth();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setLoading(false);
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name, phone })
      });

      if (!res.ok) throw new Error('Failed to update profile');
      setMessage('Profile updated successfully!');
    } catch (err) {
      setMessage(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="pt-32 text-center">Loading profile...</div>;

  return (
    <div className="pt-24 pb-32 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 flex flex-col md:flex-row gap-8">
        
        {/* Sidebar */}
        <div className="w-full md:w-1/4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-3 flex items-center justify-center text-gray-500 text-2xl font-bold">
                {user?.name?.charAt(0)}
              </div>
              <h3 className="font-bold text-lg">{user?.name}</h3>
              <p className="text-gray-500 text-sm">{user?.email}</p>
            </div>
            
            <nav className="space-y-2">
              <Link to="/dashboard" className="block px-4 py-2 text-gray-600 hover:bg-gray-50 rounded transition">Dashboard</Link>
              <Link to="/profile" className="block px-4 py-2 bg-red-50 text-red-600 font-bold rounded">My Profile</Link>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="w-full md:w-3/4">
          <h2 className="text-2xl font-bold mb-6">My Profile</h2>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            {message && (
              <div className={`p-4 rounded mb-6 text-sm ${message.includes('success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {message}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input 
                  type="text" 
                  className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-red-200 outline-none transition"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input 
                  type="email" 
                  disabled
                  className="w-full border p-3 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                  value={user?.email || ''}
                />
                <span className="text-xs text-gray-500 mt-1 block">Email address cannot be changed</span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input 
                  type="tel" 
                  className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-red-200 outline-none transition"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                />
              </div>

              <button 
                type="submit" 
                disabled={saving}
                className="bg-red-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-red-700 transition disabled:opacity-70"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
