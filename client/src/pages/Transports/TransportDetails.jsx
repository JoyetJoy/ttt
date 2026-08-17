import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import InquiryFormWidget from '../../components/InquiryFormWidget';

export default function TransportDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [transport, setTransport] = useState(null);
  const [loading, setLoading] = useState(true);

  // Booking Widget State
  const [vehicleCount, setVehicleCount] = useState(1);
  const [activeTab, setActiveTab] = useState('online'); // 'online' or 'inquiry'
  const [selectedDate, setSelectedDate] = useState('');

  // Lightbox State
  const [modalOpen, setModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Accordion State
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  useEffect(() => {
    const fetchTransport = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/transports/${id}`);
        setTransport(response.data);
      } catch (error) {
        console.error('Failed to fetch transport details:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTransport();
  }, [id]);

  if (loading) return <div className="pt-32 pb-32 flex justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0081C9]"></div></div>;
  if (!transport) return <div className="pt-32 pb-32 text-center text-gray-500">Transport not found</div>;

  const displayTitle = transport.title || "Transport Title";
  const displayShoulder = transport.vehicle_name || transport.car_type || "Vehicle";
  const displayPrice = transport.car_sale_price > 0 ? transport.car_sale_price : (transport.car_price || 0);
  const originalPrice = transport.car_price || displayPrice;
  const totalAmount = vehicleCount * displayPrice;

  const parseJSON = (str) => {
    if (!str || str === 'null') return {};
    try {
      let parsed = JSON.parse(str);
      if (typeof parsed === 'string') parsed = JSON.parse(parsed);
      if (Array.isArray(parsed) && typeof parsed[0] === 'string') {
        parsed = JSON.parse(parsed[0]);
      }
      return parsed;
    } catch { return {}; }
  };

  const includes = Object.values(parseJSON(transport.includes)).map(i => i?.title).filter(Boolean);
  const excludes = Object.values(parseJSON(transport.excludes)).map(i => i?.title).filter(Boolean);

  const faqsRaw = parseJSON(transport.faqs);
  const faqItems = Object.keys(faqsRaw)
    .filter(k => faqsRaw[k]?.title)
    .map(k => ({
      title: faqsRaw[k].title,
      content: faqsRaw[k].desc || faqsRaw[k].content
    }));

  const gallery = transport.transport_galleries?.map(g => g.image) || [];

  const allImages = [
    transport.feature_img || "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800&h=600&fit=crop",
    ...gallery
  ];

  const openModal = (index) => {
    setCurrentImageIndex(index);
    setModalOpen(true);
  };

  const handleBookNow = () => {
    if (!selectedDate) {
      toast.error('Please select a pick-up date');
      return;
    }
    navigate('/checkout', {
      state: {
        tour: {
          ...transport,
          title: transport.title || "Transport",
          duration: 1,
          features_image: transport.feature_img
        },
        adultCount: vehicleCount,
        childCount: 0,
        childPrice: 0,
        totalAmount,
        displayPrice,
        productType: 'transport',
        chosenDate: { start_date: selectedDate }
      }
    });
  };

  return (
    <>
      {/* ── Hero Banner ── */}
      <div className="relative w-full h-[400px] flex flex-col items-center justify-center">
        <img src="/frontend/img/innerpage/banner.png" alt="Transport Banner" className="absolute inset-0 w-full h-full object-cover" onError={(e) => e.target.style.display = 'none'} />
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative z-10 text-center animate-in fade-in slide-in-from-bottom-4 duration-700 px-4">
          <h1 className="text-4xl md:text-[56px] font-extrabold text-white mb-4 tracking-tight">{displayTitle}</h1>
          <div className="flex items-center justify-center gap-2 text-white text-base font-semibold">
            <Link to="/" className="text-[#0081C9] hover:text-[#0081C9] transition-colors">Home</Link>
            <span className="text-gray-300">➔</span>
            <Link to="/transports" className="text-[#0081C9] hover:text-[#0081C9] transition-colors">Transports</Link>
            <span className="text-gray-300">➔</span>
            <span>{displayTitle}</span>
          </div>
        </div>
      </div>

      <div className="bg-[#fcfcfc] pb-24">
        <div className="container mx-auto px-4 lg:px-8 max-w-[1320px]">

          {/* ── Image Gallery ── */}
          <div className="pt-8 mb-12">
            <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-1 gap-4 md:h-[400px]">
              {/* Large Image Left */}
              <div className="md:col-span-2 h-[250px] md:h-full rounded-xl overflow-hidden shadow-sm relative group cursor-pointer" onClick={() => openModal(0)}>
                <img src={allImages[0]} alt="Gallery 1" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
              </div>

              {/* Two Stacked Middle */}
              {(allImages[1] || allImages[2]) && (
                <div className="md:col-span-1 flex flex-col gap-4 h-full">
                  {allImages[1] && (
                    <div className="flex-1 rounded-xl overflow-hidden shadow-sm relative group cursor-pointer" onClick={() => openModal(1)}>
                      <img src={allImages[1]} alt="Gallery 2" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                    </div>
                  )}
                  {allImages[2] ? (
                    <div className="flex-1 rounded-xl overflow-hidden shadow-sm relative group cursor-pointer" onClick={() => openModal(2)}>
                      <img src={allImages[2]} alt="Gallery 3" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                    </div>
                  ) : (
                    <div className="flex-1"></div>
                  )}
                </div>
              )}

              {/* Large Image Right */}
              {allImages[3] && (
                <div className="md:col-span-1 h-[250px] md:h-full rounded-xl overflow-hidden shadow-sm relative group cursor-pointer" onClick={() => openModal(3)}>
                  <img src={allImages[3]} alt="Gallery 4" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  {allImages.length > 4 ? (
                    <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center hover:bg-black/60 transition-colors">
                      <span className="text-white text-xl font-bold tracking-widest mb-1">+{allImages.length - 4}</span>
                      <span className="text-white/80 text-xs uppercase tracking-widest font-bold">More</span>
                    </div>
                  ) : (
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative">

            {/* ── Left Content ── */}
            <div className="lg:col-span-8 min-w-0 overflow-hidden">

              {/* Title & Price Header */}
              <div className="mb-10">
                <div className="inline-block bg-[#333] text-white px-4 py-1 rounded text-sm font-bold tracking-wide mb-4 transform -skew-x-6">
                  <span className="inline-block transform skew-x-6 italic">{displayShoulder}</span>
                </div>
                <h2 className="text-[40px] font-extrabold text-gray-900 mb-4 leading-tight">{displayTitle}</h2>
                <div className="flex items-end gap-2 mb-4">
                  <span className="text-3xl font-extrabold text-[#0081C9]">₹{displayPrice}</span>
                  {displayPrice < originalPrice && <span className="text-gray-400 line-through text-lg mb-1">₹{originalPrice}</span>}
                </div>
                <div className="flex flex-wrap gap-6 text-sm font-bold text-gray-700 mb-8 border-b border-gray-100 pb-8">
                  <div className="flex items-center gap-2"><i className="bi bi-person-fill text-[#0081C9] text-lg"></i> Capacity : {transport.car_person || 1} Persons</div>
                  {transport.transport_from && <div className="flex items-center gap-2"><i className="bi bi-geo-alt-fill text-[#0081C9] text-lg"></i> Pickup Location: {transport.transport_from}</div>}
                  {(transport.hr_km || transport.distance_km) && (
                    <div className="flex items-center gap-2">
                      <i className="bi bi-signpost-split-fill text-[#0081C9] text-lg"></i> 
                      <span>
                        {transport.hr_km || `${transport.distance_km} KM`}
                        {transport.extra_price_per_km && (
                          <span className="ml-1 text-[11px] text-gray-500 font-medium">
                            (Extra: ₹{transport.extra_price_per_km}/km)
                          </span>
                        )}
                      </span>
                    </div>
                  )}
                </div>

                {/* Description */}
                <div className="prose max-w-none text-gray-500 leading-relaxed text-[15px] break-words" dangerouslySetInnerHTML={{ __html: transport.content || "Transport description here." }} />
              </div>

              {/* Include & Exclude */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12 mt-12">
                <div>
                  <h3 className="text-2xl font-extrabold text-gray-900 mb-6">{transport.include_title || "Include Features"}</h3>
                  <ul className="space-y-4">
                    {includes.length > 0 ? (
                      includes.map((item, i) => (
                        <li key={i} className="flex gap-3 text-[15px] text-gray-500 leading-relaxed">
                          <i className="bi bi-check-lg text-[#0081C9] mt-1 flex-shrink-0"></i>
                          <span>{item}</span>
                        </li>
                      ))
                    ) : (
                      <li className="flex gap-3 text-[15px] text-gray-500 leading-relaxed">
                        <i className="bi bi-check-lg text-[#0081C9] mt-1 flex-shrink-0"></i>
                        <span>Includes not specified.</span>
                      </li>
                    )}
                  </ul>
                </div>
                <div>
                  <h3 className="text-2xl font-extrabold text-gray-900 mb-6">{transport.exclude_title || "Exclude Features"}</h3>
                  <ul className="space-y-4">
                    {excludes.length > 0 ? (
                      excludes.map((item, i) => (
                        <li key={i} className="flex gap-3 text-[15px] text-gray-500 leading-relaxed">
                          <i className="bi bi-circle-fill text-[8px] text-red-500 mt-2 flex-shrink-0"></i>
                          <span>{item}</span>
                        </li>
                      ))
                    ) : (
                      <li className="flex gap-3 text-[15px] text-gray-500 leading-relaxed">
                        <i className="bi bi-circle-fill text-[8px] text-red-500 mt-2 flex-shrink-0"></i>
                        <span>Excludes not specified.</span>
                      </li>
                    )}
                  </ul>
                </div>
              </div>

              {/* FAQ (Desktop Only) */}
              {faqItems.length > 0 && (
                <div className="mb-16 mt-16 hidden lg:block">
                  <h3 className="text-3xl font-extrabold text-gray-900 mb-10">{transport.faq_title || 'Frequently Asked Questions'}</h3>
                  <div className="space-y-4">
                    {faqItems.map((item, i) => (
                      <div key={i} className="border border-gray-100 rounded shadow-[0_2px_15px_rgba(0,0,0,0.02)] overflow-hidden bg-white">
                        <div
                          className="flex items-center justify-between cursor-pointer group p-6"
                          onClick={() => setOpenFaqIndex(openFaqIndex === i ? null : i)}
                        >
                          <h5 className="font-extrabold text-gray-900 text-lg">{item.title}</h5>
                          <div className="text-gray-900">
                            <i className={`bi ${openFaqIndex === i ? 'bi-dash-lg' : 'bi-plus-lg'} text-xl font-bold transition-transform`}></i>
                          </div>
                        </div>
                        {openFaqIndex === i && (
                          <div className="px-6 pb-6 text-[15px] text-gray-500 leading-relaxed bg-white border-t border-gray-50 pt-4">
                            {item.content}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* ── Right Column: Booking Widget ── */}
            <div className="lg:col-span-4 relative">
              <div className="pb-12 sticky top-24">

                {/* Booking Widget */}
                <div className="bg-[#f5f8f2] rounded p-8 mb-8 border border-gray-100 shadow-sm">
                  <h3 className="text-[22px] font-extrabold text-gray-900 text-center mb-2">Book Your Transport</h3>
                  <p className="text-gray-500 text-xs text-center mb-8">Reserve a comfortable vehicle for your trip.</p>

                  {/* Tabs */}
                  <div className="flex mb-3">
                    <button onClick={() => setActiveTab('online')} className={`flex-1 py-3 font-bold text-sm transition-colors ${activeTab === 'online' ? 'bg-[#0081C9] text-white' : 'bg-transparent text-[#0081C9] border border-gray-200'}`}>Online Booking</button>
                    <button onClick={() => setActiveTab('inquiry')} className={`flex-1 py-3 font-bold text-sm transition-colors ${activeTab === 'inquiry' ? 'bg-[#0081C9] text-white' : 'bg-transparent text-[#0081C9] border border-gray-200'}`}>Inquiry Form</button>
                  </div>

                  {activeTab === 'inquiry' ? (
                    <div className="mt-2">
                      <InquiryFormWidget itemType="Transport" itemId={transport.id} title="" subtitle="" standalone={false} />
                    </div>
                  ) : (
                    <>
                  <div className="flex flex-col gap-3 mt-1">
                    {/* Booking Date */}
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm mb-1">Select Pick-up Date:</h4>00 text-sm mb-2">Select Pick-up Date:</h4>
                      <input 
                        type="date" 
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full border border-gray-200 p-2.5 rounded text-sm text-gray-600 focus:outline-none focus:border-[#0081C9]" 
                      />
                    </div>

                    {/* Quantity Controls */}
                    <div>
                      <div className="flex justify-between items-center">
                        <div className="font-bold text-gray-900 text-sm flex items-center gap-2">No of Days: <span className="text-lg">₹{displayPrice}</span> </div>
                        <div className="flex items-center gap-3">
                          <button onClick={() => setVehicleCount(Math.max(1, vehicleCount - 1))} className="w-8 h-8 rounded-full border border-[#0081C9] flex items-center justify-center text-[#0081C9] hover:bg-[#0081C9] hover:text-white transition-colors">-</button>
                          <span className="font-bold text-gray-900 w-6 text-center">{vehicleCount.toString().padStart(2, '0')}</span>
                          <button onClick={() => setVehicleCount(vehicleCount + 1)} className="w-8 h-8 rounded-full border border-[#0081C9] flex items-center justify-center text-[#0081C9] hover:bg-[#0081C9] hover:text-white transition-colors">+</button>
                        </div>
                      </div>
                    </div>

                    {/* Calculation Breakdown */}
                    <div className="border border-gray-200 px-4 pt-1.5 pb-2 relative bg-white/50 mt-1">
                      <div className="absolute -top-[14px] left-4 bg-[#f5f8f2] px-2 text-sm font-bold text-gray-900">Summary</div>
                      <div className="flex items-center justify-between w-full mt-2">
                        <div className="flex flex-col items-center">
                          <span className="text-[17px] font-medium text-gray-700">₹{displayPrice}</span>
                          <span className="text-[10px] uppercase tracking-wider text-gray-400 mt-0.5">Price</span>
                        </div>
                        <span className="text-lg font-light text-gray-400">×</span>
                        <div className="flex flex-col items-center">
                          <span className="text-[17px] font-medium text-gray-700">{vehicleCount.toString().padStart(2, '0')}</span>
                          <span className="text-[10px] uppercase tracking-wider text-gray-400 mt-0.5">NO. OF DAYS</span>
                        </div>
                        <div className="ml-1">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                        </div>
                        <span className="font-bold text-gray-900 text-lg">₹{displayPrice * vehicleCount}</span>
                      </div>
                    </div>

                    <div className="flex justify-center items-center font-bold text-gray-900 text-sm mt-1">
                      Total Amount: <span className="ml-2 text-xl">₹{totalAmount}</span>
                    </div>

                    <button onClick={handleBookNow} className="w-full bg-[#0081C9] text-white font-bold text-[15px] py-2.5 rounded shadow-[0_10px_20px_rgba(0,129,201,0.3)] hover:bg-[#006096] transition-colors">
                      Book Now
                    </button>
                  </div>
                    </>
                  )}
                </div>

                {/* Support Box */}
                <div className="rounded-xl overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.03)] group relative h-[250px]">
                  <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&h=400&fit=crop" alt="Support" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 bg-[#0081C9] p-5 text-white flex items-center gap-4 transform translate-y-2 group-hover:translate-y-0 transition-transform">
                    <div className="w-12 h-12 bg-white text-[#0081C9] rounded-full flex items-center justify-center flex-shrink-0 text-xl shadow-md">
                      <i className="bi bi-telephone"></i>
                    </div>
                    <div>
                      <div className="font-medium text-[15px] italic opacity-90 font-serif">To More Inquiry</div>
                      <div className="font-extrabold text-xl tracking-wide">+990-737 621 432</div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>

          {/* FAQ (Mobile Only) */}
          {faqItems.length > 0 && (
            <div className="mt-4 mb-12 block lg:hidden">
              <h3 className="text-3xl font-extrabold text-gray-900 mb-10">{transport.faq_title || 'Frequently Asked Questions'}</h3>
              <div className="space-y-4">
                {faqItems.map((item, i) => (
                  <div key={i} className="border border-gray-100 rounded shadow-[0_2px_15px_rgba(0,0,0,0.02)] overflow-hidden bg-white">
                    <div
                      className="flex items-center justify-between cursor-pointer group p-6"
                      onClick={() => setOpenFaqIndex(openFaqIndex === i ? null : i)}
                    >
                      <h5 className="font-extrabold text-gray-900 text-lg">{item.title}</h5>
                      <div className="text-gray-900">
                        <i className={`bi ${openFaqIndex === i ? 'bi-dash-lg' : 'bi-plus-lg'} text-xl font-bold transition-transform`}></i>
                      </div>
                    </div>
                    {openFaqIndex === i && (
                      <div className="px-6 pb-6 text-[15px] text-gray-500 leading-relaxed bg-white border-t border-gray-50 pt-4">
                        {item.content}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ── Lightbox Modal ── */}
      {modalOpen && (
        <div className="fixed inset-0 z-[9999] bg-[#1a1a1a]/95 flex items-center justify-center">
          {/* Image Counter */}
          <div className="absolute top-6 left-6 text-white z-50 text-sm font-medium tracking-widest bg-black/50 px-4 py-2 rounded-full">
            {currentImageIndex + 1} / {allImages.length}
          </div>

          {/* Close Button */}
          <button
            onClick={() => setModalOpen(false)}
            className="absolute top-4 right-4 md:top-6 md:right-6 w-12 h-12 bg-white/10 hover:bg-white/25 rounded-full flex items-center justify-center text-white transition-colors z-[10000]"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>

          {/* Prev Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setCurrentImageIndex(prev => (prev === 0 ? allImages.length - 1 : prev - 1));
            }}
            className="absolute left-0 top-1/2 -translate-y-1/2 w-12 h-12 bg-[#222] hover:bg-black flex items-center justify-center text-white transition-colors z-50"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
          </button>

          {/* Main Image */}
          <div className="relative w-full h-full flex items-center justify-center p-12">
            <img src={allImages[currentImageIndex]} alt={`Gallery view ${currentImageIndex + 1}`} className="w-full h-full object-contain shadow-2xl animate-in fade-in zoom-in-95 duration-300" />
          </div>

          {/* Next Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setCurrentImageIndex(prev => (prev === allImages.length - 1 ? 0 : prev + 1));
            }}
            className="absolute right-0 top-1/2 -translate-y-1/2 w-12 h-12 bg-[#222] hover:bg-black flex items-center justify-center text-white transition-colors z-50"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
          </button>
        </div>
      )}
    </>
  );
}
