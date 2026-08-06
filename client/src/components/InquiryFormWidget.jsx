import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function InquiryFormWidget({ itemType, itemId, title = "Reserve Your Spot", subtitle = "Secure your spot for an unforgettable experience now!" }) {
  const { user, token } = useAuth() || {};
  
  const [inquiryForm, setInquiryForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  
  const [inquiryStatus, setInquiryStatus] = useState('');

  // Prefill when user is loaded
  useEffect(() => {
    if (user) {
      setInquiryForm(prev => ({
        ...prev,
        name: prev.name || (user.fname ? `${user.fname} ${user.lname || ''}`.trim() : ''),
        email: prev.email || user.email || '',
        phone: prev.phone || user.phone || ''
      }));
    }
  }, [user]);

  const handleInquirySubmit = async (e) => {
    e.preventDefault();
    setInquiryStatus('submitting');
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers.Authorization = `Bearer ${token}`;

      await axios.post('/api/inquiries', {
        type: itemType,
        product_id: itemId,
        ...inquiryForm
      }, { headers });
      
      setInquiryStatus('success');
      toast.success('Inquiry submitted successfully!');
      setInquiryForm(prev => ({ ...prev, message: '' }));
      setTimeout(() => setInquiryStatus(''), 3000);
    } catch (error) {
      console.error(error);
      setInquiryStatus('error');
      toast.error('Failed to submit inquiry. Please try again.');
    }
  };

  return (
    <div className="bg-[#f5f8f2] rounded p-8 mb-8 border border-gray-100 shadow-sm">
      <h3 className="text-[22px] font-extrabold text-gray-900 text-center mb-2">{title}</h3>
      <p className="text-gray-500 text-xs text-center mb-8">{subtitle}</p>
      
      <form onSubmit={handleInquirySubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Full Name <span className="text-red-500">*</span></label>
          <input type="text" required value={inquiryForm.name} onChange={e => setInquiryForm({...inquiryForm, name: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded outline-none focus:border-[#0081C9]" placeholder="Enter your full name" />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Email Address <span className="text-red-500">*</span></label>
          <input type="email" required value={inquiryForm.email} onChange={e => setInquiryForm({...inquiryForm, email: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded outline-none focus:border-[#0081C9]" placeholder="Enter your email address" />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Phone Number</label>
          <input type="tel" value={inquiryForm.phone} onChange={e => setInquiryForm({...inquiryForm, phone: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded outline-none focus:border-[#0081C9]" placeholder="Enter your phone number" />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Write Your Message <span className="text-red-500">*</span></label>
          <textarea required value={inquiryForm.message} onChange={e => setInquiryForm({...inquiryForm, message: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded outline-none focus:border-[#0081C9] min-h-[120px]" placeholder="Write your inquiry"></textarea>
        </div>
        <button type="submit" disabled={inquiryStatus === 'submitting'} className="w-full bg-[#0081C9] hover:bg-[#006096] text-white font-bold py-2.5 rounded transition-colors shadow-lg shadow-[#0081C9]/30 disabled:opacity-50">
          {inquiryStatus === 'submitting' ? 'Submitting...' : 'Submit Inquiry'}
        </button>
      </form>
    </div>
  );
}
