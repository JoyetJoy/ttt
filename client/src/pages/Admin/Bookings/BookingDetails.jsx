import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';
import toast from 'react-hot-toast';

export default function BookingDetails() {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchBookingDetails();
  }, [id]);

  const fetchBookingDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/orders/admin/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBooking(response.data);
    } catch (error) {
      console.error('Failed to fetch booking details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (field, value) => {
    try {
      const token = localStorage.getItem('token');
      const payload = { [field]: value };
      await axios.put(`${import.meta.env.VITE_API_URL}/orders/admin/${id}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update local state directly to reflect changes instantly
      setBooking(prev => ({
        ...prev,
        [field]: value
      }));
      
      toast.success(`${field === 'status' ? 'Booking' : 'Payment'} status updated successfully!`);
    } catch (error) {
      console.error('Failed to update status:', error);
      toast.error('Failed to update status.');
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center h-[50vh]">
        <div className="flex flex-col items-center justify-center">
           <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
           <p className="text-gray-500 font-medium">Loading Booking Details...</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="p-8 text-center text-gray-500">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Not Found</h2>
        <p>The booking you are looking for does not exist or you do not have permission to view it.</p>
        <Link to="/admin/bookings" className="text-blue-600 font-medium mt-4 inline-block hover:underline">
          &larr; Back to Bookings
        </Link>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-[1200px] mx-auto animate-in fade-in duration-500">
      {/* ── Header ── */}
      <div className="mb-8">
        <Link to="/admin/bookings" className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2 mb-4 w-fit">
          <i className="bi bi-arrow-left"></i> Back to Bookings
        </Link>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">Booking #{booking.order_number}</h1>
            <div className="flex items-center gap-3 mb-4">
              <select 
                value={booking.status}
                onChange={(e) => handleUpdateStatus('status', Number(e.target.value))}
                className={`px-3 py-1.5 rounded-full text-xs font-bold border-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                  booking.status === 3 ? 'bg-green-100 text-green-700 border-green-200 focus:ring-green-500' : 
                  booking.status === 1 ? 'bg-yellow-100 text-yellow-700 border-yellow-200 focus:ring-yellow-500' : 
                  'bg-red-100 text-red-700 border-red-200 focus:ring-red-500'
                }`}
              >
                <option value={1}>Pending</option>
                <option value={3}>Confirmed</option>
                <option value={0}>Cancelled</option>
              </select>
              <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                {booking.product_type} Booking
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-500">Payment Status:</div>
              <select
                value={booking.payment_status}
                onChange={(e) => handleUpdateStatus('payment_status', Number(e.target.value))}
                className="font-semibold text-gray-900 bg-white border border-gray-300 rounded-lg px-3 py-1 text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={1}>Unpaid</option>
                <option value={2}>Paid</option>
              </select>
            </div>
          </div>
          <div className="text-right">
             <div className="text-sm text-gray-500 font-medium mb-1">Total Amount</div>
             <div className="text-3xl font-extrabold text-[#0081C9]">₹{booking.total_amount}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Product & Customer Info */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Product Info */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-3">Product Details</h3>
            <div className="flex gap-4 items-start">
               <div className="w-16 h-16 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500 text-2xl flex-shrink-0">
                  <i className={`bi ${booking.product_type === 'hotel' ? 'bi-building' : booking.product_type === 'transport' ? 'bi-car-front' : 'bi-compass'}`}></i>
               </div>
               <div>
                  <h4 className="text-xl font-bold text-gray-900 mb-1">{booking.product_name}</h4>
                  <div className="grid grid-cols-2 gap-y-2 gap-x-8 mt-4 text-sm">
                     <div>
                       <span className="text-gray-400 block mb-1">Start Date</span>
                       <span className="font-semibold text-gray-900">{booking.start_date || 'N/A'}</span>
                     </div>
                     <div>
                       <span className="text-gray-400 block mb-1">End Date</span>
                       <span className="font-semibold text-gray-900">{booking.end_date || 'N/A'}</span>
                     </div>
                     {booking.days > 0 && (
                       <div>
                         <span className="text-gray-400 block mb-1">Duration</span>
                         <span className="font-semibold text-gray-900">{booking.days} Days</span>
                       </div>
                     )}
                  </div>
               </div>
            </div>
          </div>

          {/* Pricing Breakdown */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-3">Pricing Breakdown</h3>
            <div className="space-y-3 text-sm">
               {booking.adult_qty > 0 && (
                 <div className="flex justify-between items-center py-2">
                   <div className="text-gray-600 font-medium">Adults (x{booking.adult_qty}) <span className="text-gray-400 ml-1">@ ₹{booking.adult_unit_price}</span></div>
                   <div className="font-bold text-gray-900">₹{booking.adult_total_price}</div>
                 </div>
               )}
               {booking.child_qty > 0 && (
                 <div className="flex justify-between items-center py-2">
                   <div className="text-gray-600 font-medium">Children (x{booking.child_qty}) <span className="text-gray-400 ml-1">@ ₹{booking.child_unit_price}</span></div>
                   <div className="font-bold text-gray-900">₹{booking.child_total_price}</div>
                 </div>
               )}
               
               <div className="flex justify-between items-center py-3 mt-2 border-t border-gray-100">
                 <div className="text-gray-900 font-bold">Subtotal</div>
                 <div className="font-extrabold text-gray-900">₹{booking.total_amount}</div>
               </div>
            </div>
          </div>

        </div>

        {/* Right Column - Customer Info & Meta */}
        <div className="space-y-8">
           
          {/* Customer Details */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-3">Customer Information</h3>
            <div className="space-y-4 text-sm">
               <div>
                 <div className="text-gray-400 mb-1">Full Name</div>
                 <div className="font-semibold text-gray-900">{booking.first_name} {booking.last_name}</div>
               </div>
               <div>
                 <div className="text-gray-400 mb-1">Email Address</div>
                 <div className="font-semibold text-gray-900">{booking.email || 'N/A'}</div>
               </div>
               <div>
                 <div className="text-gray-400 mb-1">Phone Number</div>
                 <div className="font-semibold text-gray-900">{booking.phone || 'N/A'}</div>
               </div>
            </div>
          </div>

          {/* Additional Notes */}
          {booking.notes && (
            <div className="bg-orange-50 rounded-xl border border-orange-100 p-6">
              <h3 className="text-lg font-bold text-orange-900 mb-2">Special Request</h3>
              <p className="text-sm text-orange-800">{booking.notes}</p>
            </div>
          )}



        </div>
      </div>
    </div>
  );
}
