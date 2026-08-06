import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

export default function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, login, token } = useAuth();
  
  const bookingState = location.state;
  
  // Form State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    notes: ''
  });
  
  // Auth Flow State
  const [step, setStep] = useState(1); // 1: Details, 2: Password, 3: OTP, 4: New Password
  const [authData, setAuthData] = useState({
    password: '',
    otp: '',
    newPassword: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // If no booking state was passed, redirect back to home
    if (!bookingState || !bookingState.tour) {
      navigate('/');
      return;
    }

    // Pre-fill user data if logged in
    if (user) {
      setFormData(prev => ({
        ...prev,
        firstName: user.name?.split(' ')[0] || '',
        lastName: user.name?.split(' ').slice(1).join(' ') || '',
        email: user.email || '',
        phone: user.phone || ''
      }));
    }
  }, [user, bookingState, navigate]);

  if (!bookingState || !bookingState.tour) return null;

  const { tour, adultCount, childCount, totalAmount, displayPrice, childPrice } = bookingState;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAuthChange = (e) => {
    const { name, value } = e.target;
    setAuthData(prev => ({ ...prev, [name]: value }));
  };

  // Submits the actual order to the DB
  const submitOrder = async (overrideToken = null) => {
    try {
      const orderPayload = {
        merchant_id: tour.author_id || 1,
        product_id: tour.id,
        product_type: bookingState?.productType || 'tour',
        start_date: bookingState?.chosenDate?.start_date || new Date().toISOString().split('T')[0],
        end_date: bookingState?.chosenDate?.end_date || '',
        days: tour.duration?.toString() || '1',
        adult_unit_price: displayPrice,
        adult_qty: adultCount,
        adult_total_price: displayPrice * adultCount,
        child_unit_price: childPrice,
        child_qty: childCount,
        child_total_price: childPrice * childCount,
        total_amount: totalAmount,
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        notes: formData.notes
      };

      const currentToken = overrideToken || token;
      const headers = {};
      if (currentToken) {
        headers.Authorization = `Bearer ${currentToken}`;
      }

      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/orders`, orderPayload, { headers });
      
      if (response.status === 201) {
        setSuccess(true);
        window.scrollTo(0, 0);
      }
    } catch (error) {
      console.error('Error confirming booking:', error);
      alert('Failed to process booking. Please try again.');
      setIsSubmitting(false);
    }
  };

  // State Machine Handler
  const handleNextStep = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Step 1: Check if phone exists (if not logged in)
      if (step === 1) {
        if (user) {
          // Already logged in, skip auth and submit
          await submitOrder();
          return;
        }

        const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/auth/check-phone`, { phone: formData.phone });
        if (res.data.exists) {
          setStep(2); // Ask for password
        } else {
          setStep(3); // Ask for OTP
        }
        setIsSubmitting(false);
        return;
      }

      // Step 2: Login existing user with phone + password
      if (step === 2) {
        try {
          const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/auth/login-phone`, {
            phone: formData.phone,
            password: authData.password
          });
          login(res.data.token, res.data.user);
          await submitOrder(res.data.token);
        } catch (err) {
          alert('Invalid password. Please try again.');
          setIsSubmitting(false);
        }
        return;
      }

      // Step 3: Verify OTP
      if (step === 3) {
        if (authData.otp === '1234') {
          setStep(4); // Ask for new password
        } else {
          alert('Invalid OTP. Please use 1234.');
        }
        setIsSubmitting(false);
        return;
      }

      // Step 4: Register new user with phone + new password
      if (step === 4) {
        try {
          const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/auth/register-phone`, {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: formData.phone,
            password: authData.newPassword
          });
          login(res.data.token, res.data.user);
          await submitOrder(res.data.token);
        } catch (err) {
          alert(err.response?.data?.error || 'Registration failed');
          setIsSubmitting(false);
        }
        return;
      }

    } catch (error) {
      console.error(error);
      alert('An error occurred. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="pt-32 pb-32 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="bg-white p-12 rounded-xl shadow-lg max-w-lg text-center border border-gray-100">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="bi bi-check-lg text-4xl text-green-600"></i>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Booking Confirmed!</h2>
          <p className="text-gray-500 mb-8 leading-relaxed">Thank you, {formData.firstName}! Your booking for <strong>{tour.title}</strong> has been received. We have sent a confirmation email with details.</p>
          <Link to="/" className="inline-block bg-[#0081C9] hover:bg-[#006096] text-white font-bold px-8 py-3 rounded-lg transition-colors shadow-sm">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">First Name *</label>
                <input 
                  type="text" 
                  name="firstName"
                  required
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:border-[#0081C9] focus:ring-1 focus:ring-[#0081C9] bg-gray-50 focus:bg-white transition-colors"
                  placeholder="John"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Last Name</label>
                <input 
                  type="text" 
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:border-[#0081C9] focus:ring-1 focus:ring-[#0081C9] bg-gray-50 focus:bg-white transition-colors"
                  placeholder="Doe"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Email Address *</label>
                <input 
                  type="email" 
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:border-[#0081C9] focus:ring-1 focus:ring-[#0081C9] bg-gray-50 focus:bg-white transition-colors"
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number *</label>
                <input 
                  type="tel" 
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:border-[#0081C9] focus:ring-1 focus:ring-[#0081C9] bg-gray-50 focus:bg-white transition-colors"
                  placeholder="e.g. 9876543210"
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-bold text-gray-700 mb-2">Additional Notes (Optional)</label>
              <textarea 
                name="notes"
                rows="4"
                value={formData.notes}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:border-[#0081C9] focus:ring-1 focus:ring-[#0081C9] bg-gray-50 focus:bg-white transition-colors resize-none"
                placeholder="Any special requests or dietary requirements?"
              ></textarea>
            </div>
          </>
        );
      case 2:
        return (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="p-4 bg-blue-50 text-blue-800 rounded-lg text-sm mb-6 flex items-start gap-3">
              <i className="bi bi-person-check-fill text-lg mt-0.5"></i>
              <div>
                <div className="font-bold mb-1">Account Found</div>
                An account with the number <strong>{formData.phone}</strong> already exists. Please enter your password to log in and complete the booking.
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Password *</label>
              <input 
                type="password" 
                name="password"
                required
                value={authData.password}
                onChange={handleAuthChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-gray-50 focus:bg-white transition-colors"
                placeholder="Enter your password"
              />
            </div>
            <button type="button" onClick={() => setStep(1)} className="text-sm text-gray-500 mt-4 hover:text-gray-800 underline">Change Phone Number</button>
          </div>
        );
      case 3:
        return (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="p-4 bg-yellow-50 text-yellow-800 rounded-lg text-sm mb-6 flex items-start gap-3">
              <i className="bi bi-shield-lock-fill text-lg mt-0.5"></i>
              <div>
                <div className="font-bold mb-1">OTP Verification</div>
                Please enter the OTP sent to <strong>{formData.phone}</strong>. <br/>(Hint: use 1234)
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Enter OTP *</label>
              <input 
                type="text" 
                name="otp"
                required
                maxLength="4"
                value={authData.otp}
                onChange={handleAuthChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 bg-gray-50 focus:bg-white transition-colors text-center text-xl tracking-[1em]"
                placeholder="••••"
              />
            </div>
            <button type="button" onClick={() => setStep(1)} className="text-sm text-gray-500 mt-4 hover:text-gray-800 underline">Change Phone Number</button>
          </div>
        );
      case 4:
        return (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
             <div className="p-4 bg-green-50 text-green-800 rounded-lg text-sm mb-6 flex items-start gap-3">
              <i className="bi bi-check-circle-fill text-lg mt-0.5"></i>
              <div>
                <div className="font-bold mb-1">Number Verified!</div>
                Please create a password for your new account to complete the booking.
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Create Password *</label>
              <input 
                type="password" 
                name="newPassword"
                required
                value={authData.newPassword}
                onChange={handleAuthChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:border-[#0081C9] focus:ring-1 focus:ring-[#0081C9] bg-gray-50 focus:bg-white transition-colors"
                placeholder="Enter a secure password"
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const getButtonText = () => {
    if (isSubmitting) return <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Processing...</>;
    if (step === 1 && !user) return 'Verify & Continue';
    if (step === 1 && user) return 'Confirm Booking';
    if (step === 2) return 'Login & Confirm Booking';
    if (step === 3) return 'Verify OTP';
    if (step === 4) return 'Create Account & Confirm';
  };

  return (
    <>
      <div className="bg-gray-50 pt-24 pb-20 min-h-screen">
        <div className="container mx-auto px-4 lg:px-8 max-w-[1200px]">
          
          <div className="mb-10 text-center">
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">Checkout</h1>
            <p className="text-gray-500">Please review your booking details and provide your information.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* ── Left Column: Customer Details / Auth ── */}
            <div className="lg:col-span-7">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-8">
                
                {/* Progress Indicator */}
                {!user && (
                  <div className="flex items-center justify-between mb-8 pb-8 border-b border-gray-100">
                     <div className={`flex flex-col items-center flex-1 ${step >= 1 ? 'text-[#0081C9]' : 'text-gray-300'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mb-2 ${step >= 1 ? 'bg-[#0081C9] text-white' : 'bg-gray-100'}`}>1</div>
                        <span className="text-xs font-bold uppercase tracking-wider">Details</span>
                     </div>
                     <div className={`h-0.5 flex-1 ${step >= 2 ? 'bg-[#0081C9]' : 'bg-gray-100'}`}></div>
                     <div className={`flex flex-col items-center flex-1 ${step >= 2 ? 'text-[#0081C9]' : 'text-gray-300'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mb-2 ${step >= 2 ? 'bg-[#0081C9] text-white' : 'bg-gray-100'}`}>2</div>
                        <span className="text-xs font-bold uppercase tracking-wider">Auth</span>
                     </div>
                  </div>
                )}

                <h3 className="text-xl font-extrabold text-gray-900 mb-6 pb-4 border-b border-gray-100 hidden">Contact Information</h3>

                <form id="checkout-form" onSubmit={handleNextStep}>
                  {renderStepContent()}
                </form>
              </div>
            </div>

            {/* ── Right Column: Order Summary ── */}
            <div className="lg:col-span-5 relative">
              <div className="sticky top-24 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 bg-gray-50 border-b border-gray-100 flex items-start gap-4">
                  <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-gray-200 shadow-sm">
                    <img src={tour.features_image || "https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?w=300&h=300&fit=crop"} alt={tour.title} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <div className="text-xs font-bold tracking-wider text-[#0081C9] uppercase mb-1">
                      {bookingState?.productType === 'transport' ? 'Transport' : bookingState?.productType === 'activity' ? 'Activity' : `${tour.duration || 1} Days Tour`}
                    </div>
                    <h4 className="text-lg font-extrabold text-gray-900 leading-tight line-clamp-2">{tour.title}</h4>
                  </div>
                </div>

                <div className="p-6 space-y-4 text-sm">
                  <div className="flex justify-between items-center text-gray-600">
                    <span className="font-medium">{bookingState?.productType === 'transport' ? 'Vehicle' : 'Adult'} (×{adultCount})</span>
                    <span className="font-bold text-gray-900">₹{displayPrice * adultCount}</span>
                  </div>
                  {childCount > 0 && (
                    <div className="flex justify-between items-center text-gray-600">
                      <span className="font-medium">Child (×{childCount})</span>
                      <span className="font-bold text-gray-900">₹{childPrice * childCount}</span>
                    </div>
                  )}
                  
                  <hr className="border-dashed border-gray-200" />
                  
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-600">Subtotal</span>
                    <span className="font-bold text-gray-900">₹{totalAmount}</span>
                  </div>
                  <div className="flex justify-between items-center text-gray-500 text-xs">
                    <span>Taxes & Fees</span>
                    <span>Included</span>
                  </div>

                  <div className="pt-4 mt-4 border-t border-gray-100 flex justify-between items-end">
                    <span className="text-lg font-extrabold text-gray-900">Total Amount</span>
                    <span className="text-2xl font-extrabold text-[#0081C9]">₹{totalAmount}</span>
                  </div>
                </div>

                <div className="p-6 bg-gray-50 border-t border-gray-100">
                  <button 
                    type="submit"
                    form="checkout-form"
                    disabled={isSubmitting}
                    className="w-full bg-[#0081C9] text-white font-bold py-4 rounded-lg hover:bg-[#006096] transition-colors shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {getButtonText()}
                  </button>
                  <p className="text-center text-xs text-gray-500 mt-4">
                    <i className="bi bi-shield-lock-fill text-[#0081C9] mr-1"></i>
                    Your information is safe and secure.
                  </p>
                </div>

              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
