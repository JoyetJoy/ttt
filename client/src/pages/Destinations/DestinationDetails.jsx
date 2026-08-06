import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import InquiryFormWidget from '../../components/InquiryFormWidget';

export default function DestinationDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [destination, setDestination] = useState(null);
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);

  // Lightbox State
  const [modalOpen, setModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchDestinationData = async () => {
      try {
        const destResponse = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/destinations/${id}`);
        setDestination(destResponse.data);

        // Fetch all tours and filter by destination_id
        const toursResponse = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/tours`);
        const allTours = toursResponse.data;
        const destTours = allTours.filter(t => t.destination_id === parseInt(id) || (t.destinations_array && t.destinations_array.includes(`"${id}"`)));
        setTours(destTours);
      } catch (error) {
        console.error('Failed to fetch destination details:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDestinationData();
  }, [id]);

  if (loading) return <div className="pt-32 pb-32 flex justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0081C9]"></div></div>;
  if (!destination) return <div className="pt-32 pb-32 text-center text-gray-500">Destination not found</div>;

  const displayTitle = destination.title || destination.destination || "Destination";
  const gallery = destination.destination_galleries?.map(g => g.image) || [];

  const allImages = [
    destination.features_image || "https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?w=800&h=600&fit=crop",
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
        <img src={allImages[0]} alt="Destination Banner" className="absolute inset-0 w-full h-full object-cover" onError={(e) => e.target.style.display = 'none'} />
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="relative z-10 text-center animate-in fade-in slide-in-from-bottom-4 duration-700 px-4">
          <h1 className="text-5xl md:text-[64px] font-extrabold text-white mb-4 tracking-tight">{displayTitle}</h1>
          <div className="flex items-center justify-center gap-2 text-white text-base font-semibold">
            <Link to="/" className="text-[#0081C9] hover:text-[#0081C9] transition-colors">Home</Link>
            <span className="text-gray-300">➔</span>
            <span>{displayTitle}</span>
          </div>
        </div>
      </div>

      <div className="bg-white pb-24 mt-16">
        <div className="container mx-auto px-4 lg:px-8 max-w-[1320px]">

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 relative">

            {/* ── Left Content ── */}
            <div className="lg:col-span-8 min-w-0 overflow-hidden">

              <h2 className="text-[40px] font-extrabold text-gray-900 mb-6 leading-tight">{displayTitle}</h2>

              {/* Description */}
              <div className="prose max-w-none text-gray-500 leading-relaxed text-[15px] break-words mb-10" dangerouslySetInnerHTML={{ __html: destination.content || `<p>${destination.short_desc || 'Explore this amazing destination.'}</p>` }} />

              {/* Image Gallery */}
              <div className="mb-10">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 h-[300px]">
                  {allImages.slice(1, 4).map((img, i) => (
                    <div key={i} className="rounded-xl overflow-hidden shadow-sm relative group cursor-pointer h-full" onClick={() => openModal(i + 1)}>
                      <img src={img} alt={`Gallery ${i}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Available Tours */}
              <div className="mt-16">
                <h3 className="text-[28px] font-extrabold text-gray-900 mb-2">Available Tours in {displayTitle}</h3>
                <p className="text-gray-500 text-[15px] mb-8">Explore the best tours available for this destination</p>

                {tours.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {tours.map((tour) => {
                      let subDests = [];
                      if (tour.sub_destination) {
                        try {
                          subDests = JSON.parse(tour.sub_destination);
                          if (typeof subDests === 'string') subDests = JSON.parse(subDests);
                        } catch (e) {
                          subDests = [];
                        }
                      }
                      if (!Array.isArray(subDests)) subDests = [];

                      return (
                      <div 
                        key={tour.id} 
                        className="bg-white rounded-xl shadow-[0_5px_20px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden group cursor-pointer"
                        onClick={(e) => {
                          if (e.target.closest('a') || e.target.closest('button')) return;
                          navigate(`/tours/${tour.id}`);
                        }}
                      >
                        <div className="relative h-[220px] overflow-hidden">
                          <img src={tour.features_image || "https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?w=600&h=400&fit=crop"} alt={tour.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                          <div className="absolute top-4 left-4 bg-[#222] text-white text-[11px] font-bold px-3 py-1.5 rounded uppercase tracking-wider">
                            {tour.duration || 1} DAYS / {Math.max(1, (tour.duration || 1) - 1)} NIGHTS
                          </div>
                        </div>
                        <div className="p-6 flex-1 flex flex-col">
                          <h4 className="font-extrabold text-[18px] text-gray-900 leading-snug mb-4 h-14 line-clamp-2">
                            {tour.title}
                          </h4>

                          <div className="text-[10px] !text-gray-500 font-bold uppercase tracking-widest flex items-center flex-wrap gap-2 mb-6">
                            {subDests.length > 0 ? (
                              subDests.map((dest, i) => (
                                <React.Fragment key={i}>
                                  <span>{dest}</span>
                                  {i < subDests.length - 1 && <span className="text-gray-300">➔</span>}
                                </React.Fragment>
                              ))
                            ) : (
                              <>
                                <span>{displayTitle}</span>
                                <span className="text-gray-300">➔</span>
                                <span>CITY</span>
                              </>
                            )}
                          </div>

                          <div className="flex items-end justify-between border-t border-gray-100 pt-6">
                            <div>
                              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Starting From:</div>
                              <div className="text-[28px] font-extrabold text-[#0081C9] leading-none mb-1">₹{tour.sale_price > 0 ? tour.sale_price : tour.price}</div>
                              <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Taxes Incl/Pers</div>
                            </div>
                            <Link to={`/tours/${tour.id}`} className="bg-[#0081C9] hover:bg-[#006096] text-white text-sm font-bold px-6 py-3 rounded transition-colors shadow-sm inline-flex items-center gap-2">
                              View Details ➔
                            </Link>
                          </div>
                        </div>
                      </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-gray-500 bg-gray-50 p-6 rounded-lg text-center border border-gray-100 mt-4">
                    No tours available for this destination yet.
                  </div>
                )}
              </div>

            </div>

            {/* ── Right Column: Sidebar ── */}
            <div className="lg:col-span-4 relative">
              <div className="pb-12">

                <div className="bg-white rounded-xl border border-gray-100 shadow-[0_5px_30px_rgba(0,0,0,0.04)] p-8">
                  <div className="space-y-6">

                    <div className="border-b border-gray-100 pb-6">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 rounded-full bg-[#0081C9]"></div>
                        <div className="text-[13px] font-medium text-gray-500 tracking-wide">Destination:</div>
                      </div>
                      <div className="text-[19px] font-extrabold text-gray-900 ml-5">{destination.destination || destination.title || 'N/A'}</div>
                    </div>

                    <div className="border-b border-gray-100 pb-6">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 rounded-full bg-[#0081C9]"></div>
                        <div className="text-[13px] font-medium text-gray-500 tracking-wide">Population:</div>
                      </div>
                      <div className="text-[19px] font-extrabold text-gray-900 ml-5">{destination.population || 'N/A'}</div>
                    </div>

                    <div className="border-b border-gray-100 pb-6">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 rounded-full bg-[#0081C9]"></div>
                        <div className="text-[13px] font-medium text-gray-500 tracking-wide">Capital City:</div>
                      </div>
                      <div className="text-[19px] font-extrabold text-gray-900 ml-5">{destination.city || 'N/A'}</div>
                    </div>

                    <div className="border-b border-gray-100 pb-6">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 rounded-full bg-[#0081C9]"></div>
                        <div className="text-[13px] font-medium text-gray-500 tracking-wide">Language:</div>
                      </div>
                      <div className="text-[19px] font-extrabold text-gray-900 ml-5">{destination.language || 'N/A'}</div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 rounded-full bg-[#0081C9]"></div>
                        <div className="text-[13px] font-medium text-gray-500 tracking-wide">Currency:</div>
                      </div>
                      <div className="text-[19px] font-extrabold text-gray-900 ml-5">{destination.currency || 'N/A'}</div>
                    </div>

                  </div>
                </div>

                <div className="mt-8">
                  <InquiryFormWidget itemType="Destination" itemId={destination.id} title="Inquire About Destination" subtitle="Have questions about this destination? Send us a message!" />
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
