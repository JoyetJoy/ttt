import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import InquiryFormWidget from '../../components/InquiryFormWidget';

export default function TourDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);

  // Booking Widget State
  const [adultCount, setAdultCount] = useState(1);
  const [childCount, setChildCount] = useState(0);
  const [activeTab, setActiveTab] = useState('online'); // 'online' or 'inquiry'
  const [selectedDateIndex, setSelectedDateIndex] = useState(0);
  const [selectedCustomDate, setSelectedCustomDate] = useState('');

  // Lightbox State
  const [modalOpen, setModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [allAttrTerms, setAllAttrTerms] = useState([]);
  const [allDestinations, setAllDestinations] = useState([]);

  // Accordion State
  const [openFaqIndex, setOpenFaqIndex] = useState(0);
  const [openRealFaqIndex, setOpenRealFaqIndex] = useState(null);

  useEffect(() => {
    const fetchTour = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/tours/${id}`);
        setTour(response.data);
      } catch (error) {
        console.error('Failed to fetch tour details:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTour();
    // Fetch all attribute terms for dynamic display
    fetch(`${import.meta.env.VITE_API_URL}/tours/attribute-terms`)
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setAllAttrTerms(data); })
      .catch(err => console.error('Failed to fetch attribute terms:', err));

    // Fetch all destinations for dynamic display
    fetch(`${import.meta.env.VITE_API_URL}/destinations`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setAllDestinations(data);
        else if (data && Array.isArray(data.destinations)) setAllDestinations(data.destinations);
      })
      .catch(err => console.error('Failed to fetch destinations:', err));
  }, [id]);

  if (loading) return <div className="pt-32 pb-32 flex justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0081C9]"></div></div>;
  if (!tour) return <div className="pt-32 pb-32 text-center text-gray-500">Tour not found</div>;

  // Derive display values with fallbacks
  const displayTitle = tour.title || "Tour Title";
  const displayShoulder = tour.shoulder || "Exclusive";
  const displayPrice = tour.sale_price > 0 ? tour.sale_price : (tour.price || 700);
  const childPrice = tour.child_price || 200;
  const totalAmount = (adultCount * displayPrice) + (childCount * childPrice);

  const parseJSON = (str) => {
    if (!str || str === 'null') return {};
    try {
      // Handle double stringified JSON (like in the DB)
      let parsed = JSON.parse(str);
      if (typeof parsed === 'string') parsed = JSON.parse(parsed);
      if (Array.isArray(parsed) && typeof parsed[0] === 'string') {
        parsed = JSON.parse(parsed[0]);
      }
      return parsed;
    } catch { return {}; }
  };

  const parsedDatesObj = parseJSON(tour.fixed_dates);
  let parsedDates = [];
  if (Array.isArray(parsedDatesObj)) {
    parsedDates = parsedDatesObj;
  } else if (typeof parsedDatesObj === 'object' && parsedDatesObj !== null) {
    parsedDates = Object.values(parsedDatesObj);
  }

  const itineraryRaw = parseJSON(tour.itinerary);
  const itineraryItems = Object.keys(itineraryRaw)
    .filter(k => itineraryRaw[k]?.title)
    .map(k => ({
      day: `Day ${parseInt(k) + 1} :`,
      title: itineraryRaw[k].title,
      content: itineraryRaw[k].content
    }));

  const faqsRaw = parseJSON(tour.faqs);
  const faqItems = Object.keys(faqsRaw)
    .filter(k => faqsRaw[k]?.question)
    .map(k => ({
      question: faqsRaw[k].question,
      answer: faqsRaw[k].answer
    }));

  const includes = Object.values(parseJSON(tour.includes)).map(i => i?.item).filter(Boolean);
  const excludes = Object.values(parseJSON(tour.excludes)).map(i => i?.item).filter(Boolean);
  const highlights = Object.values(parseJSON(tour.highlights)).map(i => i?.item).filter(Boolean);
  const gallery = tour.tour_galleries?.map(g => g.image) || [];

  const allImages = [
    tour.features_image || "https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?w=800&h=600&fit=crop",
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

  const handleBookNow = () => {
    let chosenDate = null;
    if (tour.enable_fixed_dates === 1 && parsedDates.length > 0) {
      chosenDate = parsedDates[selectedDateIndex];
    } else {
      if (!selectedCustomDate) {
        toast.error('Please select a check-in date');
        return;
      }
      chosenDate = { start_date: selectedCustomDate };
    }

    navigate('/checkout', {
      state: {
        tour,
        adultCount,
        childCount,
        totalAmount,
        displayPrice,
        childPrice,
        chosenDate
      }
    });
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
              <div className="md:col-span-1 h-full rounded-xl overflow-hidden shadow-sm relative group cursor-pointer" onClick={() => openModal(3)}>
                <img src={allImages[3]} alt="Gallery 4" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                {tour.youtube_video ? (
                  <a href={tour.youtube_video} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="absolute inset-0 bg-black/30 flex items-center justify-center hover:bg-black/40 transition-colors">
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
                  <span className="text-gray-400 line-through text-lg mb-1">₹{tour.price || 850}</span>
                  <span className="text-gray-500 font-medium mb-1 ml-1">/per person</span>
                </div>
                <div className="flex flex-wrap gap-6 text-sm font-bold text-gray-700 mb-8 border-b border-gray-100 pb-8">
                  <div className="flex items-center gap-2"><i className="bi bi-clock text-[#0081C9] text-lg"></i> {tour.duration || 1} DAYS / {Math.max(1, (tour.duration || 1) - 1)} Nights</div>
                  <div className="flex items-center gap-2"><i className="bi bi-person-fill text-[#0081C9] text-lg"></i> Max People : {tour.max_people || 15}</div>
                  <div className="flex items-center gap-2"><i className="bi bi-flag-fill text-[#0081C9] text-lg"></i> Group Tour</div>
                </div>

                {/* Tour Planning */}
                {(() => {
                  let dests = [];
                  if (tour.destinations_array) {
                    try {
                      let p = JSON.parse(tour.destinations_array);
                      if (typeof p === 'string') p = JSON.parse(p);
                      if (Array.isArray(p)) dests = p;
                    } catch (e) { }
                  }

                  let subs = [];
                  if (tour.sub_destination) {
                    try {
                      let p = JSON.parse(tour.sub_destination);
                      if (typeof p === 'string') p = JSON.parse(p);
                      if (Array.isArray(p)) subs = p;
                    } catch (e) { }
                  }

                  if (dests.length === 0 && subs.length === 0) return null;

                  return (
                    <div className="border border-[#0081C9] rounded-lg p-6 mb-10 relative">
                      <div className="absolute left-[-1px] top-4 bottom-4 w-1.5 bg-[#0081C9] rounded-r"></div>
                      <h4 className="text-xl font-bold text-gray-900 mb-6 pl-4">Tour Planning</h4>

                      {dests.length > 0 && (
                        <div className="flex flex-wrap items-center gap-4 mb-6 pl-4">
                          {dests.map((destId, index) => {
                            const matched = allDestinations.find(d => String(d.id) === String(destId));
                            const name = matched ? (matched.name || matched.title) : `Destination ${destId}`;
                            return (
                              <React.Fragment key={index}>
                                <div className="border border-gray-200 rounded px-4 py-2 flex items-center gap-3 bg-white">
                                  <i className="bi bi-geo-alt-fill text-orange-500"></i>
                                  <div>
                                    <div className="text-[10px] text-gray-400 font-bold uppercase">Destination {index + 1}</div>
                                    <div className="font-bold text-gray-900 text-sm">{name}</div>
                                  </div>
                                </div>
                                {index < dests.length - 1 && <span className="text-[#0081C9]">→</span>}
                              </React.Fragment>
                            );
                          })}
                        </div>
                      )}

                      {subs.length > 0 && (
                        <div className="border border-purple-200 rounded-lg p-4 flex flex-wrap items-center gap-4 ml-4 bg-purple-50/30">
                          <div className="text-[11px] text-[#6151a6] font-bold uppercase">Sub Destinations:</div>
                          <div className="flex flex-wrap items-center gap-3 text-sm font-medium text-gray-600">
                            {subs.map((sub, idx) => (
                              <React.Fragment key={idx}>
                                <span className="bg-white px-3 py-1 rounded shadow-sm border border-gray-100">{sub}</span>
                                {idx < subs.length - 1 && <span className="text-purple-300 font-bold">→</span>}
                              </React.Fragment>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Description */}
                <div className="prose max-w-none text-gray-500 leading-relaxed text-[15px] break-words" dangerouslySetInnerHTML={{ __html: tour.content || "Tour content here." }} />
              </div>

              {/* Attributes (Dynamic) */}
              {(() => {
                if (!tour.attribute_terms) return null;
                let termIds = [];
                try {
                  termIds = JSON.parse(tour.attribute_terms);
                  if (!Array.isArray(termIds)) termIds = [];
                } catch { termIds = []; }

                // Match IDs to names via allAttrTerms; also support name strings saved directly
                const matched = termIds.map(t => {
                  const byId = allAttrTerms.find(a => String(a.id) === String(t));
                  if (byId) return byId;
                  // Fallback: it's stored as a name string
                  const byName = allAttrTerms.find(a => a.name === t);
                  if (byName) return byName;
                  return null;
                }).filter(Boolean);

                // Group by attribute_name
                const grouped = {};
                matched.forEach(t => {
                  const grp = t.attribute_name || 'Other';
                  if (!grouped[grp]) grouped[grp] = [];
                  grouped[grp].push(t);
                });

                const iconForGroup = (grp) => {
                  const g = grp.toLowerCase();
                  if (g.includes('facilit')) return 'bi bi-wifi';
                  if (g.includes('transport')) return 'bi bi-car-front';
                  if (g.includes('travel') || g.includes('style')) return 'bi bi-signpost-split';
                  return 'bi bi-check2-circle';
                };

                return Object.entries(grouped).map(([groupName, terms]) => (
                  <div key={groupName} className="mb-10">
                    <h3 className="text-2xl font-extrabold text-gray-900 mb-6">{groupName}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {terms.map((term, i) => (
                        <div key={i} className="flex items-center gap-3 border border-gray-100 rounded-md p-4 bg-white shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                          <i className={`${iconForGroup(groupName)} text-[#0081C9] text-lg`}></i>
                          <span className="text-gray-700 font-medium">{term.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ));
              })()}

              {/* Include & Exclude */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
                <div>
                  <h3 className="text-2xl font-extrabold text-gray-900 mb-6">{tour.include_title || "Include Features"}</h3>
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
                  <h3 className="text-2xl font-extrabold text-gray-900 mb-6">{tour.exclude_title || "Exclude Features"}</h3>
                  <ul className="space-y-4">
                    {excludes.length > 0 ? (
                      excludes.map((item, i) => (
                        <li key={i} className="flex gap-3 text-[15px] text-gray-500 leading-relaxed">
                          <i className="bi bi-x-lg text-red-500 mt-1 flex-shrink-0"></i>
                          <span>{item}</span>
                        </li>
                      ))
                    ) : (
                      <li className="flex gap-3 text-[15px] text-gray-500 leading-relaxed">
                        <i className="bi bi-x-lg text-red-500 mt-1 flex-shrink-0"></i>
                        <span>Excludes not specified.</span>
                      </li>
                    )}
                  </ul>
                </div>
              </div>

              {/* Highlights */}
              <div className="mb-12">
                <h3 className="text-2xl font-extrabold text-gray-900 mb-6">{tour.highlight_title || "Highlights Of the Tour"}</h3>
                <ul className="space-y-4 border border-gray-100 rounded-lg p-6 bg-white shadow-[0_2px_15px_rgba(0,0,0,0.02)]">
                  {highlights.length > 0 ? (
                    highlights.map((item, i) => (
                      <li key={i} className="flex gap-3 text-[15px] text-gray-500 items-center border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                        <div className="w-5 h-5 rounded-full bg-[#0081C9]/10 flex items-center justify-center flex-shrink-0">
                          <i className="bi bi-check text-[#0081C9]"></i>
                        </div>
                        <span>{item}</span>
                      </li>
                    ))
                  ) : (
                    <li className="flex gap-3 text-[15px] text-gray-500 items-center">
                      <div className="w-5 h-5 rounded-full bg-[#0081C9]/10 flex items-center justify-center flex-shrink-0">
                        <i className="bi bi-check text-[#0081C9]"></i>
                      </div>
                      <span>Highlights not specified.</span>
                    </li>
                  )}
                </ul>
              </div>

              {/* Location Map */}
              <div className="mb-12">
                <h3 className="text-2xl font-extrabold text-gray-900 mb-6">Location Map</h3>
                <div className="rounded-lg overflow-hidden border border-gray-200 h-[300px] bg-gray-200 relative">
                  <iframe
                    src={`https://maps.google.com/maps?q=${tour.map_lat || 20.5937},${tour.map_lng || 78.9629}&hl=en&z=6&output=embed`}
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
              <div className="mb-8 mt-12">
                <h3 className="text-2xl font-extrabold text-gray-900 mb-6">{tour.itinerary_title || "Itinerary"}</h3>
                <div className="space-y-4">
                  {itineraryItems.length > 0 ? (
                    itineraryItems.map((item, i) => (
                      <div key={i} className="mb-4">
                        <div
                          className="border border-gray-200 rounded shadow-sm overflow-hidden bg-white flex items-center justify-between cursor-pointer group"
                          onClick={() => setOpenFaqIndex(openFaqIndex === i ? null : i)}
                        >
                          <div className="flex items-center gap-6">
                            <div className="bg-[#0081C9] text-white font-bold px-6 py-4 min-w-[120px] text-center">{item.day}</div>
                            <div className="font-bold text-gray-900 text-lg">{item.title}</div>
                          </div>
                          <div className="px-6 text-[#101F46]">
                            <i className={`bi ${openFaqIndex === i ? 'bi-chevron-up' : 'bi-chevron-down'}`}></i>
                          </div>
                        </div>
                        {openFaqIndex === i && (
                          <div className="pt-4 pb-2 px-8 ml-8 text-[15px] text-gray-500">
                            {item.content}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-500">Itinerary not specified.</div>
                  )}
                </div>
              </div>

              {/* FAQ (Desktop Only) */}
              <div className="mb-16 mt-16 hidden lg:block">
                <h3 className="text-3xl font-extrabold text-gray-900 mb-10">{tour.faq_title || "Frequently Asked Questions"}</h3>
                <div className="space-y-2">
                  {faqItems.length > 0 ? (
                    faqItems.map((item, i) => (
                      <div key={i} className="flex flex-col">
                        <div 
                          className="flex justify-between items-center cursor-pointer py-4 border-b border-gray-300"
                          onClick={() => setOpenRealFaqIndex(openRealFaqIndex === i ? null : i)}
                        >
                          <h5 className="font-extrabold text-gray-900 text-lg">{item.question}</h5>
                          <i className={`bi ${openRealFaqIndex === i ? 'bi-dash-lg' : 'bi-plus-lg'} text-xl font-bold text-gray-900`}></i>
                        </div>
                        {openRealFaqIndex === i && (
                          <div className="py-4 text-[15px] text-gray-500">
                            {item.answer}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-500">FAQs not specified.</div>
                  )}
                </div>
              </div>

            </div>

            {/* ── Right Column: Booking Widget ── */}
            <div className="lg:col-span-4 relative">
              <div className="pb-12">

                {/* Booking Widget */}
                <div className="bg-[#f5f8f2] rounded p-8 mb-8 border border-gray-100 shadow-sm">
                  <h3 className="text-[22px] font-extrabold text-gray-900 text-center mb-2">Reserve Your Tour</h3>
                  <p className="text-gray-500 text-xs text-center mb-8">Secure your spot for an unforgettable nature adventure now!</p>

                  {/* Tabs */}
                  <div className="flex mb-3">
                    <button onClick={() => setActiveTab('online')} className={`flex-1 py-3 font-bold text-sm transition-colors ${activeTab === 'online' ? 'bg-[#0081C9] text-white' : 'bg-transparent text-[#0081C9] border border-gray-200'}`}>Online Booking</button>
                    <button onClick={() => setActiveTab('inquiry')} className={`flex-1 py-3 font-bold text-sm transition-colors ${activeTab === 'inquiry' ? 'bg-[#0081C9] text-white' : 'bg-transparent text-[#0081C9] border border-gray-200'}`}>Inquiry Form</button>
                  </div>

                  {activeTab === 'inquiry' ? (
                    <div className="mt-2">
                      <InquiryFormWidget itemType="Tour" itemId={tour.id} title="" subtitle="" />
                    </div>
                  ) : (
                    <>

                      {/* Booking Date */}
                      <div className="mb-4">
                        <h4 className="font-bold text-gray-900 text-sm mb-4">Select Your Booking Date:</h4>
                        {tour.enable_fixed_dates === 1 && parsedDates.length > 0 ? (
                          <div className="space-y-4">
                            {parsedDates.map((dateObj, idx) => (
                              <div key={idx} onClick={() => setSelectedDateIndex(idx)} className={`flex items-center justify-between cursor-pointer transition-opacity ${selectedDateIndex === idx ? 'opacity-100' : 'opacity-50 hover:opacity-75'}`}>
                                <div className="flex items-center gap-3">
                                  <input type="checkbox" checked={selectedDateIndex === idx} readOnly className="w-4 h-4 accent-green-500 cursor-pointer" />
                                  <div className="text-xs font-bold text-gray-900">Check in <br /><span className="text-gray-500 font-normal">{dateObj.start_date || dateObj.booking_date}</span></div>
                                </div>
                                <span className="text-green-500">→</span>
                                <div className="text-xs font-bold text-gray-900 text-right">Check out <br /><span className="text-gray-500 font-normal">{dateObj.end_date || 'N/A'}</span></div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-700">Check in Date</label>
                            <input type="date" value={selectedCustomDate} onChange={(e) => setSelectedCustomDate(e.target.value)} className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm text-gray-700 focus:outline-none focus:border-[#0081C9]" />
                          </div>
                        )}
                      </div>

                      {/* Quantity Controls */}
                      <div className="space-y-4 mb-4">
                        <div className="flex justify-between items-center">
                          <div className="font-bold text-gray-900 text-sm flex items-center gap-2">Adult: <span className="text-lg">₹{displayPrice}</span> <span className="text-gray-400 line-through text-xs font-normal">₹{tour.price || 850}</span></div>
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
                      <div className="border border-gray-200 px-4 pt-1.5 pb-2 mb-4 relative mt-3 bg-white/50">
                        <div className="absolute -top-[14px] left-4 bg-[#f5f8f2] px-2 text-sm font-bold text-gray-900">Adult</div>
                        <div className="flex items-center justify-between w-full mt-2">
                          <div className="flex flex-col items-center">
                            <span className="text-[17px] font-medium text-gray-700">₹{displayPrice}</span>
                            <span className="text-[10px] uppercase tracking-wider text-gray-400 mt-1">Price</span>
                          </div>
                          <span className="text-lg font-light pb-4 text-gray-400">×</span>
                          <div className="flex flex-col items-center">
                            <span className="text-xl font-medium text-gray-700">{adultCount.toString().padStart(2, '0')}</span>
                            <span className="text-[10px] uppercase tracking-wider text-gray-400 mt-1">QTY</span>
                          </div>
                          <span className="text-lg font-light pb-4 text-gray-400">×</span>
                          <div className="flex flex-col items-center">
                            <span className="text-xl font-medium text-gray-700">{tour.duration || 1}</span>
                            <span className="text-[10px] uppercase tracking-wider text-gray-400 mt-1">DAYS</span>
                          </div>
                          <div className="pb-4 ml-2">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                          </div>
                          <span className="font-bold text-gray-900 text-xl pb-4">₹{displayPrice * adultCount}</span>
                        </div>
                      </div>

                      <div className="flex justify-center items-center font-bold text-gray-900 text-sm mt-1">
                        Total Amount: <span className="ml-2 text-xl">₹{totalAmount}</span>
                      </div>

                      <button onClick={handleBookNow} className="w-full bg-[#0081C9] text-white font-bold text-[15px] py-2.5 rounded shadow-[0_10px_20px_rgba(0,129,201,0.3)] hover:bg-[#006096] transition-colors mt-2">
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

                {/* FAQ (Mobile Only) */}
                <div className="mt-8 mb-12 block lg:hidden">
                  <h3 className="text-3xl font-extrabold text-gray-900 mb-10">{tour.faq_title || "Frequently Asked Questions"}</h3>
                  <div className="space-y-2">
                    {faqItems.length > 0 ? (
                      faqItems.map((item, i) => (
                        <div key={i} className="flex flex-col">
                          <div 
                            className="flex justify-between items-center cursor-pointer py-4 border-b border-gray-300"
                            onClick={() => setOpenRealFaqIndex(openRealFaqIndex === i ? null : i)}
                          >
                            <h5 className="font-extrabold text-gray-900 text-lg">{item.question}</h5>
                            <i className={`bi ${openRealFaqIndex === i ? 'bi-dash-lg' : 'bi-plus-lg'} text-xl font-bold text-gray-900`}></i>
                          </div>
                          {openRealFaqIndex === i && (
                            <div className="py-4 text-[15px] text-gray-500">
                              {item.answer}
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-gray-500">FAQs not specified.</div>
                    )}
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
