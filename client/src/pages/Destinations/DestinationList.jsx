import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function DestinationList() {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/destinations`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setDestinations(data);
        } else if (data && Array.isArray(data.destinations)) {
          setDestinations(data.destinations);
        } else if (data && Array.isArray(data.data)) {
          setDestinations(data.data);
        } else {
          setDestinations([]);
          console.error("API returned unexpected format:", data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="pt-32 text-center text-gray-500 font-medium">Loading destinations...</div>;

  return (
    <>
      {/* ── Hero Banner ── */}
      <div className="relative w-full h-[400px] flex flex-col items-center justify-center">
        <img src="/frontend/img/innerpage/banner.png" alt="Destinations Banner" className="absolute inset-0 w-full h-full object-cover" onError={(e) => e.target.style.display = 'none'} />
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative z-10 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="text-4xl md:text-[56px] font-extrabold text-white mb-4 tracking-tight">Destinations</h1>
          <div className="flex items-center justify-center gap-2 text-white text-base font-semibold">
            <Link to="/" className="text-[#0081C9] hover:text-[#0081C9] transition-colors">Home</Link>
            <span className="text-gray-300">➔</span>
            <span>Destinations</span>
          </div>
        </div>
      </div>

      {/* ── Main Layout ── */}
      <div className="bg-white py-20">
        <div className="container mx-auto px-4 lg:px-8 max-w-[1320px]">

          {/* Destination Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {destinations.map(destination => (
              <div key={destination.id} className="relative h-[220px] rounded-[14px] overflow-hidden group cursor-pointer shadow-sm border border-gray-100 hover:shadow-lg transition-shadow duration-300">

                {/* Background Image */}
                <img
                  src={destination.features_image || 'https://via.placeholder.com/600x400'}
                  alt={destination.name}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                />

                {/* Dark Gradient Overlay (Bottom half) */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

                {/* Tour Count Badge (Top Right) */}
                <div className="absolute top-4 right-4 bg-black/80 text-white text-[10px] font-bold px-3 py-1.5 rounded-sm uppercase tracking-wider backdrop-blur-sm">
                  {destination.tours?.length || 1} Tour
                </div>

                {/* Content (Bottom Left) */}
                <div className="absolute bottom-5 left-5 right-5 flex flex-col z-10">
                  <div className="text-[#0081C9] text-xs font-extrabold mb-1 tracking-wide">
                    Travel To
                  </div>
                  <h3 className="text-white text-[24px] font-bold capitalize leading-tight group-hover:text-gray-100 transition-colors">
                    {destination.title}
                  </h3>
                </div>

                {/* Link Overlay */}
                <Link to={`/destinations/${destination.id}`} className="absolute inset-0 z-20"></Link>
              </div>
            ))}
          </div>

        </div>
      </div>
    </>
  );
}
