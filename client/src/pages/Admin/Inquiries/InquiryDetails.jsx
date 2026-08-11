import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

export default function InquiryDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [inquiry, setInquiry] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInquiry = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/admin/inquiries/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setInquiry(response.data);
      } catch (error) {
        console.error('Error fetching inquiry:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchInquiry();
  }, [id, token]);

  if (loading) {
    return <div className="p-8 text-center text-gray-500 font-medium">Loading inquiry details...</div>;
  }

  if (!inquiry) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500 font-medium mb-4">Inquiry not found.</p>
        <button onClick={() => navigate('/admin/inquiries')} className="text-indigo-600 font-bold hover:underline">
          &larr; Back to Inquiries
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => navigate('/admin/inquiries')}
          className="p-2 rounded-full hover:bg-gray-200 transition-colors bg-white shadow-sm border border-gray-200 text-gray-600"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Inquiry #{inquiry.id}</h1>
          <p className="mt-1 text-sm text-gray-500">
            Submitted on {new Date(inquiry.created_at || Date.now()).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        
        {/* Customer & Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-200 border-b border-gray-200">
          
          {/* Customer Info */}
          <div className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <i className="bi bi-person-circle text-indigo-500"></i> Customer Details
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Name</p>
                <p className="text-base font-medium text-gray-900">{inquiry.name}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Email</p>
                <a href={`mailto:${inquiry.email}`} className="text-base font-medium text-indigo-600 hover:underline">{inquiry.email}</a>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Phone</p>
                <p className="text-base font-medium text-gray-900">{inquiry.phone || 'Not provided'}</p>
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div className="p-6 bg-gray-50">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <i className="bi bi-box-seam text-emerald-500"></i> Product Inquired
            </h3>
            
            {inquiry.product ? (
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm flex flex-col sm:flex-row">
                {(() => {
                  let imgUrl = inquiry.product.image;
                  try {
                    const parsed = JSON.parse(imgUrl);
                    if (Array.isArray(parsed) && parsed.length > 0) imgUrl = parsed[0];
                  } catch(e) {}
                  
                  return imgUrl ? (
                    <div className="w-full sm:w-32 sm:min-h-full shrink-0 flex">
                      <img 
                        src={imgUrl} 
                        alt={inquiry.product.title} 
                        className="w-full h-40 sm:h-full object-cover bg-gray-100 shrink-0"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    </div>
                  ) : (
                    <div className="w-full sm:w-32 h-40 sm:h-full sm:min-h-[128px] bg-gray-100 flex items-center justify-center shrink-0">
                      <span className="text-gray-400 text-xs font-medium">No Image</span>
                    </div>
                  );
                })()}
                
                <div className="p-4 flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 inline-flex text-[10px] font-bold rounded bg-blue-100 text-blue-800">
                      {inquiry.type}
                    </span>
                    <span className="text-xs font-mono text-gray-400">ID: {inquiry.product_id}</span>
                  </div>
                  <h4 className="font-bold text-gray-900 leading-tight line-clamp-2">
                    {inquiry.product.title}
                  </h4>
                  {inquiry.product.slug && (
                    <a 
                      href={`/${inquiry.type.toLowerCase()}s/${inquiry.product.slug}`} 
                      target="_blank" 
                      rel="noreferrer"
                      className="text-indigo-600 hover:text-indigo-800 text-xs font-semibold mt-2 inline-flex items-center gap-1"
                    >
                      View Product <i className="bi bi-arrow-up-right"></i>
                    </a>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2.5 py-1 inline-flex text-xs font-bold rounded bg-blue-100 text-blue-800">
                    {inquiry.type}
                  </span>
                  <span className="text-sm font-mono text-gray-500">ID: {inquiry.product_id}</span>
                </div>
                <p className="text-sm text-red-500 font-medium bg-red-50 p-2 rounded">
                  Product details are no longer available in the database.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Message */}
        <div className="p-6 bg-white">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <i className="bi bi-chat-left-text text-amber-500"></i> Customer Message
          </h3>
          <div className="bg-amber-50/30 rounded-xl border border-amber-100 p-5">
            <p className="text-gray-800 text-base leading-relaxed whitespace-pre-wrap font-medium">
              {inquiry.message}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
