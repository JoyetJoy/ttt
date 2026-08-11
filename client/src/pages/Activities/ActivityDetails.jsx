import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import InquiryFormWidget from '../../components/InquiryFormWidget';
import toast from 'react-hot-toast';

export default function ActivityDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);

  // Booking Widget State
  const [adultCount, setAdultCount] = useState(1);
  const [childCount, setChildCount] = useState(0);
  const [activeTab, setActiveTab] = useState('online');
  const [selectedDate, setSelectedDate] = useState('');

  // Lightbox State
  const [modalOpen, setModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Accordion State
  const [openFaqIndex, setOpenFaqIndex] = useState(0);
  const [openPlanIndex, setOpenPlanIndex] = useState(0);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/activities/${id}`);
        setActivity(response.data);
      } catch (error) {
        console.error('Failed to fetch activity details:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchActivity();
  }, [id]);

  const handleBookNow = () => {
    if (!selectedDate) {
      toast.error('Please select a booking date');
      return;
    }
    const chosenDate = { start_date: selectedDate };
    
    navigate('/checkout', {
      state: {
        tour: {
          ...activity,
          title: activity.title || "Activity",
          duration: activity.days || 1
        },
        adultCount,
        childCount,
        totalAmount,
        displayPrice,
        childPrice,
        chosenDate,
        productType: 'activity'
      }
    });
  };

  if (loading) return <div className="pt-32 pb-32 flex justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0081C9]"></div></div>;
  if (!activity) return <div className="pt-32 pb-32 text-center text-gray-500">Activity not found</div>;

  // Derive display values with fallbacks
  const displayTitle = activity.title || "Hot Air Balloon Ride";
  const displayShoulder = activity.shoulder || "Adventure";
  const displayPrice = activity.sale_price > 0 ? activity.sale_price : (activity.price || 700);
  const childPrice = activity.child_price || 200;
  const totalAmount = (adultCount * displayPrice) + (childCount * childPrice);

  const parseJSON = (str) => {
    if (!str || str === 'null') return {};
    try { return JSON.parse(str); } catch { return {}; }
  };

  const faqs = Object.values(parseJSON(activity.faqs));
  const includes = Object.values(parseJSON(activity.includes)).map(i => i.item || i.title || (typeof i === 'string' ? i : ''));
  const excludes = Object.values(parseJSON(activity.excludes)).map(i => i.item || i.title || (typeof i === 'string' ? i : ''));
  const highlights = Object.values(parseJSON(activity.highlights)).map(i => i.item || i.title || (typeof i === 'string' ? i : ''));
  const gallery = activity.activities_galleries?.map(g => g.image) || [];

  const allImages = [
    activity.feature_img || "https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?w=800&h=600&fit=crop",
    ...(gallery.length > 0 ? gallery : [
      "https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1551632811-561732d1e306?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?w=400&h=600&fit=crop"
    ])
  ];

  const openModal = (index) => {
    setCurrentImageIndex(index);
    setModalOpen(true);
  };

  return (
    <>
      {/* ── Hero Banner ── */}
      <div className="relative w-full h-[400px] flex flex-col items-center justify-center">
        <img src="/frontend/img/innerpage/banner.png" alt="Activities Banner" className="absolute inset-0 w-full h-full object-cover" onError={(e) => e.target.style.display = 'none'} />
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative z-10 text-center animate-in fade-in slide-in-from-bottom-4 duration-700 px-4">
          <h1 className="text-4xl md:text-[56px] font-extrabold text-white mb-4 tracking-tight">{displayTitle}</h1>
          <div className="flex items-center justify-center gap-2 text-white text-base font-semibold">
            <Link to="/" className="text-[#0081C9] hover:text-[#0081C9] transition-colors">Home</Link>
            <span className="text-gray-300">➔</span>
            <span>{displayTitle}</span>
          </div>
        </div>
      </div>

      <div className="bg-[#fcfcfc] pb-24 mt-16">
        <div className="container mx-auto px-4 lg:px-8 max-w-[1320px]">

          {/* ── Image Gallery ── */}
          <div className="pt-12 mb-12">
            <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-1 gap-4 md:h-[400px]">
              {/* Large Image Left */}
              <div className="md:col-span-2 h-full rounded-xl overflow-hidden shadow-sm relative group cursor-pointer" onClick={() => openModal(0)}>
                <img src={allImages[0]} alt="Gallery 1" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
              </div>
              {/* Two Stacked Middle */}
              <div className="md:col-span-1 flex flex-col gap-4 h-full">
                <div className="flex-1 rounded-xl overflow-hidden shadow-sm relative group cursor-pointer" onClick={() => openModal(1)}>
                  <img src={allImages[1]} alt="Gallery 2" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                </div>
                <div className="flex-1 rounded-xl overflow-hidden shadow-sm relative group cursor-pointer" onClick={() => openModal(2)}>
                  <img src={allImages[2]} alt="Gallery 3" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                </div>
              </div>
              {/* Large Image Right */}
              <div className="md:col-span-1 h-full rounded-xl overflow-hidden shadow-sm relative group cursor-pointer" onClick={() => openModal(3)}>
                <img src={allImages[3]} alt="Gallery 4" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                {activity.youtube_video ? (
                  <a href={activity.youtube_video} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="absolute inset-0 bg-black/30 flex items-center justify-center hover:bg-black/40 transition-colors">
                    <span className="text-white font-bold tracking-wide">Watch Video</span>
                  </a>
                ) : (
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                )}
              </div>
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
                  {activity.sale_price > 0 && <span className="text-gray-400 line-through text-lg mb-1">₹{activity.price || displayPrice}</span>}
                  <span className="text-gray-500 font-medium mb-1 ml-1">/per person</span>
                </div>
                <div className="flex flex-wrap gap-6 text-sm font-bold text-gray-700 mb-8 border-b border-gray-100 pb-8">
                  <div className="flex items-center gap-2"><i className="bi bi-clock text-[#0081C9] text-lg"></i> {activity.days || 1} DAYS / {activity.nights || 1} Nights</div>
                  <div className="flex items-center gap-2"><i className="bi bi-person-fill text-[#0081C9] text-lg"></i> Max People : {activity.max_people || 15}</div>
                  <div className="flex items-center gap-2"><i className="bi bi-flag-fill text-[#0081C9] text-lg"></i> Group Tour</div>
                </div>



              {/* Include & Exclude */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
                <div>
                  <h3 className="text-2xl font-extrabold text-gray-900 mb-6">{activity.include_title || "Include Features"}</h3>
                  <ul className="space-y-4">
                    {(includes.length > 0 ? includes : [
                      'Ski Touring Involves Exploring Remote, Off-Piste Terrains Away From Ski Resorts.',
                      'A Full-Body Workout Combining Skiing, Hiking, And Endurance.'
                    ]).map((item, i) => (
                      <li key={i} className="flex gap-3 text-[15px] text-gray-500 leading-relaxed">
                        <i className="bi bi-check-lg text-[#0081C9] mt-1 flex-shrink-0"></i>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-2xl font-extrabold text-gray-900 mb-6">{activity.exclude_title || "Exclude Features"}</h3>
                  <ul className="space-y-4">
                    {(excludes.length > 0 ? excludes : [
                      'Ski Touring Typically Avoids The Amenities And Maintained Slopes Found In Ski Resorts.',
                      'It Steers Clear Of Crowded Slopes And Lift Systems.'
                    ]).map((item, i) => (
                      <li key={i} className="flex gap-3 text-[15px] text-gray-500 leading-relaxed">
                        <i className="bi bi-x-lg text-red-500 mt-1 flex-shrink-0"></i>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Highlights */}
              <div className="mb-12">
                <h3 className="text-2xl font-extrabold text-gray-900 mb-6">{activity.highlight_title || "Highlights Of the Activities"}</h3>
                <ul className="space-y-4 border border-gray-100 rounded-lg p-6 bg-white shadow-[0_2px_15px_rgba(0,0,0,0.02)]">
                  {(highlights.length > 0 ? highlights : [
                    'Immersion In Breathtaking, Untouched Landscapes Away From Crowded Ski Resorts.',
                    'Combining Endurance And Skill While Exploring Diverse Terrains.'
                  ]).map((item, i) => (
                    <li key={i} className="flex gap-3 text-[15px] text-gray-500 items-center border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                      <div className="w-5 h-5 rounded-full bg-[#0081C9]/10 flex items-center justify-center flex-shrink-0">
                        <i className="bi bi-check text-[#0081C9]"></i>
                      </div>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

                {/* Description */}
                <div className="prose max-w-none text-gray-500 leading-relaxed text-[15px] break-words" dangerouslySetInnerHTML={{ __html: activity.content }} />
              </div>

              {/* Location Map */}
              <div className="mb-12">
                <h3 className="text-2xl font-extrabold text-gray-900 mb-6">Location Map</h3>
                <div className="rounded-lg overflow-hidden border border-gray-200 h-[300px] bg-gray-200 relative">
                  <iframe
                    src={`https://maps.google.com/maps?q=${activity.map_lat || 20.5937},${activity.map_lng || 78.9629}&hl=en&z=6&output=embed`}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>
                </div>
              </div>

              {/* Itinerary */}
              {/* FAQ */}
              {faqs && faqs.length > 0 && (
                <div className="mb-16 mt-16">
                  <h3 className="text-3xl font-extrabold text-gray-900 mb-10">{activity.faq_title || "Frequently Asked Questions"}</h3>
                  <div className="space-y-2">
                    {faqs.map((item, i) => (
                      <div key={i} className="flex flex-col">
                        <div 
                          className="flex justify-between items-center cursor-pointer py-4 border-b border-gray-300 group"
                          onClick={() => setOpenFaqIndex(openFaqIndex === i ? null : i)}
                        >
                          <h5 className="font-extrabold text-gray-900 text-lg group-hover:text-[#0081C9] transition-colors">{item.question}</h5>
                          <i className={`bi ${openFaqIndex === i ? 'bi-dash-lg' : 'bi-plus-lg'} text-xl font-bold ${openFaqIndex === i ? 'text-[#0081C9]' : 'text-gray-900'}`}></i>
                        </div>
                        {openFaqIndex === i && (
                          <div className="py-4 text-[15px] text-gray-500 leading-relaxed">
                            {item.answer}
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
              <div className="pb-12">

                {/* Booking Widget */}
                <div className="bg-[#f5f8f2] rounded p-8 mb-8 border border-gray-100 shadow-sm">
                  <h3 className="text-[22px] font-extrabold text-gray-900 text-center mb-2">Reserve Your Activity</h3>
                  <p className="text-gray-500 text-xs text-center mb-8">Secure your spot for an unforgettable nature adventure now!</p>
                  
                  {/* Tabs */}
                  <div className="flex mb-8">
                    <button onClick={() => setActiveTab('online')} className={`flex-1 py-3 font-bold text-sm transition-colors ${activeTab === 'online' ? 'bg-[#0081C9] text-white' : 'bg-transparent text-[#0081C9] border border-gray-200'}`}>Online Booking</button>
                    <button onClick={() => setActiveTab('inquiry')} className={`flex-1 py-3 font-bold text-sm transition-colors ${activeTab === 'inquiry' ? 'bg-[#0081C9] text-white' : 'bg-transparent text-[#0081C9] border border-gray-200'}`}>Inquiry Form</button>
                  </div>

                  {activeTab === 'inquiry' ? (
                    <div className="mt-4">
                      <InquiryFormWidget itemType="Activity" itemId={activity.id} title="" subtitle="" />
                    </div>
                  ) : (
                    <>
                      {/* Booking Date */}
                      <div className="mb-6">
                         <h4 className="font-bold text-gray-900 text-sm mb-4">Select Your Booking Date:</h4>
                         <div className="space-y-4">
                           <input 
                             type="date" 
                             value={selectedDate} 
                             onChange={(e) => setSelectedDate(e.target.value)} 
                             min={new Date().toISOString().split('T')[0]}
                             className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0081C9] focus:border-transparent text-sm" 
                           />
                         </div>
                      </div>

                      <hr className="border-gray-200 my-8" />

                      {/* Quantity Controls */}
                      <div className="space-y-8 mb-8">
                        <div className="flex justify-between items-center">
                          <div className="font-bold text-gray-900 text-sm flex items-center gap-2">Adult: <span className="text-lg">₹{displayPrice}</span> {activity.sale_price > 0 && <span className="text-gray-400 line-through text-xs font-normal">₹{activity.price || displayPrice}</span>}</div>
                          <div className="flex items-center gap-3">
                            <button onClick={() => setAdultCount(Math.max(1, adultCount - 1))} className="w-8 h-8 rounded-full border border-[#0081C9] flex items-center justify-center text-[#0081C9] hover:bg-[#0081C9] hover:text-white transition-colors">-</button>
                            <span className="font-bold text-gray-900 w-6 text-center">{adultCount.toString().padStart(2, '0')}</span>
                            <button onClick={() => setAdultCount(adultCount + 1)} className="w-8 h-8 rounded-full border border-[#0081C9] flex items-center justify-center text-[#0081C9] hover:bg-[#0081C9] hover:text-white transition-colors">+</button>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="font-bold text-gray-900 text-sm flex items-center gap-2">Children: <span className="text-lg">₹{childPrice}</span></div>
                          <div className="flex items-center gap-3">
                            <button onClick={() => setChildCount(Math.max(0, childCount - 1))} className="w-8 h-8 rounded-full border border-[#0081C9] flex items-center justify-center text-[#0081C9] hover:bg-[#0081C9] hover:text-white transition-colors">-</button>
                            <span className="font-bold text-gray-900 w-6 text-center">{childCount.toString().padStart(2, '0')}</span>
                            <button onClick={() => setChildCount(childCount + 1)} className="w-8 h-8 rounded-full border border-[#0081C9] flex items-center justify-center text-[#0081C9] hover:bg-[#0081C9] hover:text-white transition-colors">+</button>
                          </div>
                        </div>
                      </div>

                      {/* Calculation Breakdown */}
                      <div className="border border-gray-200 px-4 py-5 mb-8 relative mt-6 bg-white/50">
                        <div className="absolute -top-[14px] left-4 bg-[#f5f8f2] px-2 text-sm font-bold text-gray-900">Adult</div>
                        <div className="flex items-center justify-between w-full">
                          <div className="flex flex-col items-center">
                            <span className="text-xl font-medium text-gray-700">₹{displayPrice}</span>
                            <span className="text-[10px] uppercase tracking-wider text-gray-400 mt-1">Price</span>
                          </div>
                          <span className="text-lg font-light pb-4 text-gray-400">×</span>
                          <div className="flex flex-col items-center">
                            <span className="text-xl font-medium text-gray-700">{adultCount.toString().padStart(2, '0')}</span>
                            <span className="text-[10px] uppercase tracking-wider text-gray-400 mt-1">QTY</span>
                          </div>
                          <span className="text-lg font-light pb-4 text-gray-400">×</span>
                          <div className="flex flex-col items-center">
                            <span className="text-xl font-medium text-gray-700">{activity.days || 1}</span>
                            <span className="text-[10px] uppercase tracking-wider text-gray-400 mt-1">DAYS</span>
                          </div>
                          <div className="pb-4 ml-2">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                          </div>
                          <span className="font-bold text-gray-900 text-xl pb-4">₹{displayPrice * adultCount}</span>
                        </div>
                      </div>

                      <hr className="border-gray-200 my-8" />

                      <div className="flex justify-center items-center font-bold text-gray-900 text-sm mb-6">
                        Total Amount: <span className="ml-2 text-[22px]">₹{totalAmount}</span>
                      </div>

                      <button onClick={handleBookNow} className="w-full bg-[#0081C9] text-white font-bold py-4 hover:bg-[#006096] transition-colors shadow-[0_4px_15px_rgba(0, 129, 201,0.3)]">
                        Book Now
                      </button>
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
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>

          {/* Prev Button */}
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setCurrentImageIndex(prev => (prev === 0 ? allImages.length - 1 : prev - 1));
            }} 
            className="absolute left-0 top-1/2 -translate-y-1/2 w-12 h-12 bg-[#222] hover:bg-black flex items-center justify-center text-white transition-colors z-50"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
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
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
          </button>
        </div>
      )}
    </>
  );
}
