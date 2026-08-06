import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      if (data.user.role !== 3 && data.user.role !== 4) {
        throw new Error('Access denied. Admin credentials required.');
      }

      login(data.token, data.user);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#080D1A] flex items-center justify-center p-4 relative overflow-hidden font-['Poppins',sans-serif]">
      {/* Background Radial Arcs & Grid Overlay */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden">
        <svg
          className="w-[1400px] h-[1400px] text-slate-800/25 opacity-35"
          viewBox="0 0 1000 1000"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="500" cy="500" r="180" stroke="currentColor" strokeWidth="0.8" strokeDasharray="3 3" />
          <circle cx="500" cy="500" r="300" stroke="currentColor" strokeWidth="0.8" />
          <circle cx="500" cy="500" r="420" stroke="currentColor" strokeWidth="0.8" strokeDasharray="5 5" />
          <circle cx="500" cy="500" r="540" stroke="currentColor" strokeWidth="0.8" />
          <circle cx="500" cy="500" r="660" stroke="currentColor" strokeWidth="0.8" strokeDasharray="7 7" />

          <path d="M-200 500 Q 500 120 1200 500" stroke="currentColor" strokeWidth="0.8" fill="none" />
          <path d="M-200 500 Q 500 880 1200 500" stroke="currentColor" strokeWidth="0.8" fill="none" />
          <path d="M500 -200 Q 120 500 500 1200" stroke="currentColor" strokeWidth="0.8" fill="none" />
          <path d="M500 -200 Q 880 500 500 1200" stroke="currentColor" strokeWidth="0.8" fill="none" />
        </svg>
      </div>

      {/* Main Container with Pure White Stacked Card Backdrop */}
      <div className="relative w-full max-w-[560px] my-8 sm:my-12 px-2 sm:px-0">
        {/* Layer 1: Top & Bottom Vertical White Stacking Backdrop */}
        <div className="absolute -top-3.5 -bottom-3.5 left-5 right-5 bg-white rounded-[24px] pointer-events-none"></div>

        {/* Layer 2: Left & Right Horizontal White Stacking Backdrop */}
        <div className="absolute top-4 bottom-4 -left-4 -right-4 bg-white rounded-[24px] pointer-events-none"></div>

        {/* Main Foreground Pure White Card */}
        <div className="relative bg-white rounded-[20px] px-6 py-9 sm:px-12 sm:py-11 shadow-2xl z-10 w-full">
          {/* Header Title with Soft Floating Accent Confetti */}
          <div className="text-center mb-8 relative">
            <span className="absolute -top-3 left-8 sm:left-14 text-amber-400 text-xs select-none">★</span>
            <span className="absolute top-0 right-10 sm:right-16 text-purple-400 text-xs select-none">✦</span>
            <span className="absolute -bottom-2 left-14 sm:left-20 text-teal-400 text-[10px] select-none">✦</span>
            <span className="absolute -bottom-1 right-12 sm:right-18 text-rose-400 text-xs select-none">★</span>

            <h1 className="flex items-baseline justify-center gap-1.5 text-center font-['Poppins',sans-serif] sm:whitespace-nowrap">
              <span className="text-[20px] sm:text-[22px] font-semibold text-[#1E293B]">Wellcome To</span>
              <span className="text-[22px] sm:text-[26px] font-bold text-[#6D28D9]">{"GATEWAY Tours &amp; Travels"}</span>
            </h1>
            <p className="text-gray-400 text-xs sm:text-sm font-medium mt-2">
              Admin &amp; Merchant Login
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2.5 rounded-lg mb-6 text-xs sm:text-sm text-center font-medium">
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Field: Username or Email */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">
                Username or Email <span className="text-red-500">*</span>
              </label>
              <div className="relative flex items-center border border-gray-200 rounded-xl focus-within:border-purple-600 focus-within:ring-2 focus-within:ring-purple-100 transition-all bg-white p-1.5">
                <input
                  type="text"
                  required
                  placeholder="admin@gmail.com"
                  className="w-full px-3 py-2 text-gray-800 text-sm focus:outline-none bg-transparent placeholder-gray-400"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <div className="w-9 h-9 sm:w-10 sm:h-10 min-w-9 sm:min-w-10 bg-[#F3E8FF] text-[#7C3AED] rounded-lg flex items-center justify-center ml-1">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Field: Password */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative flex items-center border border-purple-400 ring-2 ring-purple-50 rounded-xl transition-all bg-white p-1.5">
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full px-3 py-2 text-gray-800 text-sm focus:outline-none bg-transparent placeholder-gray-400"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <div className="w-9 h-9 sm:w-10 sm:h-10 min-w-9 sm:min-w-10 bg-[#F3E8FF] text-[#7C3AED] rounded-lg flex items-center justify-center ml-1">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-3 bg-[#6C2BD9] hover:bg-[#5B21B6] active:bg-[#4C1D95] text-[#FFFFFF] font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition duration-200 shadow-sm disabled:opacity-70 cursor-pointer text-sm sm:text-base"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>{loading ? 'Logging in...' : 'Login'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
