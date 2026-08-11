import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function TransportList() {
  const [transports, setTransports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortOpen, setSortOpen] = useState(false);
  const [sortOption, setSortOption] = useState('Default Sorting');
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState(900);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/transports`)
      .then(res => res.json())
      .then(data => {
        setTransports(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const filteredTransports = transports.filter(transport => {
    const titleMatch = transport.title?.toLowerCase().includes(searchQuery.toLowerCase());
    const locationMatch = transport.address?.toLowerCase().includes(searchQuery.toLowerCase());
    const price = transport.car_sale_price > 0 ? transport.car_sale_price : (transport.car_price || 0);
    return (titleMatch || locationMatch) && price <= priceRange;
  });

  const sortedTransports = [...filteredTransports].sort((a, b) => {
    const priceA = a.car_sale_price > 0 ? a.car_sale_price : (a.car_price || 0);
    const priceB = b.car_sale_price > 0 ? b.car_sale_price : (b.car_price || 0);
    if (sortOption === 'Price Low To High') return priceA - priceB;
    if (sortOption === 'Price High To Low') return priceB - priceA;
    return 0; // default
  });

  if (loading) return <div className="pt-32 text-center text-gray-500 font-medium">Loading transports...</div>;

  return (
    <>
      {/* ── Hero Banner ── */}
      <div className="relative w-full h-[400px] flex flex-col items-center justify-center ">
        <img src="/frontend/img/innerpage/banner.png" alt="Transports Banner" className="absolute inset-0 w-full h-full object-cover" onError={(e) => e.target.style.display = 'none'} />
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative z-10 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="text-4xl md:text-[56px] font-extrabold text-white mb-4 tracking-tight">Transports</h1>
          <div className="flex items-center justify-center gap-2 text-white text-base font-semibold">
            <Link to="/" className="text-[#0081C9] hover:text-white transition-colors">Home</Link>
            <span className="text-gray-300">➔</span>
            <span>Transports</span>
          </div>
        </div>
      </div>

      {/* ── Main Layout ── */}
      <div className="bg-[#fcfaf7] py-16">
        <div className="container mx-auto max-w-[1320px]">
          <div className="flex flex-col lg:flex-row gap-8">

            {/* ── Sidebar (Left) ── */}
            <div className="w-full lg:w-[320px] flex-shrink-0 flex flex-col gap-8">

              {/* Search Widget */}
              <div className="bg-white rounded-xl p-7 shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-gray-100/50">
                <div className="mb-6">
                  <h4 className="text-[22px] font-extrabold text-gray-900 inline-block border-b border-black pb-0.5">Search Here</h4>
                </div>
                <div className="flex w-full group">
                  <input
                    type="text"
                    placeholder="Search Here"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full flex-1 border border-r-0 border-[#0081C9]/30 rounded-none px-3 py-1 text-[15px] focus:outline-none focus:border-[#0081C9] transition-all bg-white text-gray-800 placeholder-gray-400"
                  />
                  <button className="bg-[#0081C9] text-white px-7 py-3.5 rounded-none hover:bg-[#006096] transition-colors flex items-center justify-center border border-[#0081C9] hover:border-[#006096]">
                    <i className="bi bi-search text-lg font-bold"></i>
                  </button>
                </div>
              </div>

              {/* Price Filter */}
              <div className="bg-white rounded-xl p-7 shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-gray-100/50">
                <div className="mb-6">
                  <h4 className="text-[22px] font-extrabold text-gray-900 inline-block border-b border-black pb-0.5">Price Filter</h4>
                </div>
                <div className="mt-8 mb-2 px-2">
                  <input
                    type="range"
                    min="1"
                    max="2000"
                    value={priceRange}
                    onChange={(e) => setPriceRange(e.target.value)}
                    className="w-full accent-[#0081C9]"
                  />
                </div>
                <div className="flex justify-between items-center mt-4 px-1">
                  <span className="text-sm font-semibold text-gray-500">₹1</span>
                  <span className="text-sm font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded">₹{priceRange}</span>
                  <span className="text-sm font-semibold text-gray-500">₹2000</span>
                </div>
              </div>

              {/* Destinations */}
              <div className="bg-white rounded-xl p-7 shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-gray-100/50">
                <div className="mb-6">
                  <h4 className="text-[22px] font-extrabold text-gray-900 inline-block border-b border-black pb-0.5">Destinations</h4>
                </div>
                <ul className="flex flex-col gap-4 m-0 p-0">
                  {['France', 'Spain', 'Switzerland', 'Canada'].map((d, i) => (
                    <li key={d} className="flex justify-between items-center" style={{ listStyle: 'none' }}>
                      <label className="flex items-center gap-3 cursor-pointer text-gray-600 font-medium text-sm hover:text-[#0081C9] transition-colors">
                        <input type="checkbox" className="w-4 h-4 accent-[#0081C9] border-gray-300 rounded cursor-pointer" />
                        {d}
                      </label>
                      <span className="text-xs font-bold text-gray-500 bg-white border border-gray-200 rounded-full w-6 h-6 flex items-center justify-center">1</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Most Popular */}
              <div className="bg-white rounded-xl p-7 shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-gray-100/50">
                <div className="mb-6">
                  <h4 className="text-[22px] font-extrabold text-gray-900 inline-block border-b border-black pb-0.5">Most Popular</h4>
                </div>
                <div className="flex flex-col gap-5">
                  {transports.slice(0, 4).map((transport, i) => (
                    <div key={`pop-${transport.id}`} className="flex gap-4 items-center group cursor-pointer">
                      <img src={transport.feature_img || 'https://via.placeholder.com/80'} className="w-20 h-16 rounded-lg object-cover shadow-sm group-hover:opacity-90 transition-opacity" alt={transport.title} />
                      <div className="flex-1">
                        <div className="text-[11px] text-gray-400 font-semibold mb-1">Vehicle</div>
                        <h5 className="text-[13px] font-bold leading-tight line-clamp-2">
                          <Link to={`/transports/${transport.id}`} className="!text-gray-800 hover:!text-[#0081C9] transition-colors">{transport.title}</Link>
                        </h5>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* ── Main Content (Right) ── */}
            <div className="flex-1">

              {/* Top Bar */}
              <div className="flex justify-between items-center mb-8 bg-white p-4 rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-gray-100/50">
                <div className="text-gray-500 font-medium text-sm">Showing <span className="font-extrabold text-gray-900">{sortedTransports.length}</span> Result</div>
                <div className="relative w-[220px]">
                  {/* Button */}
                  <button
                    onClick={() => setSortOpen(!sortOpen)}
                    className="w-full flex items-center justify-between border border-gray-200 text-sm font-medium text-gray-500 rounded-full px-5 py-2.5 bg-white cursor-pointer hover:border-gray-300 transition-colors focus:outline-none whitespace-nowrap"
                  >
                    <span>{sortOption}</span>
                    <i className={`bi bi-chevron-${sortOpen ? 'up' : 'down'} text-[#0081C9] text-sm font-bold transition-transform`}></i>
                  </button>

                  {/* Dropdown Menu */}
                  {sortOpen && (
                    <div className="absolute top-full right-0 mt-2 w-[220px] bg-white border border-gray-100 rounded-lg shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                      {['Default Sorting', 'Price Low To High', 'Price High To Low'].map((option, idx) => (
                        <div
                          key={idx}
                          onClick={() => {
                            setSortOption(option);
                            setSortOpen(false);
                          }}
                          className={`px-5 py-3 text-sm cursor-pointer transition-colors whitespace-nowrap ${sortOption === option
                            ? 'bg-[#0081C9] text-black font-bold'
                            : 'text-gray-500 hover:bg-gray-50 font-medium'
                            }`}
                        >
                          {option}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Transport Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
                {sortedTransports.map(transport => {
                  return (
                    <div key={transport.id} className="bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] overflow-hidden flex flex-col group border border-gray-100 hover:-translate-y-1 transition-all duration-300">

                      {/* Image Area */}
                      <div className="relative h-[260px] overflow-hidden">
                        <img src={transport.feature_img || 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=600&h=400&fit=crop'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" alt={transport.title} />

                        {/* Badges */}
                        <div className="absolute top-4 left-4 flex flex-col items-start z-10 shadow-sm">
                          <div className="bg-black text-white text-[10px] font-bold tracking-widest px-3 py-2 uppercase rounded-t-sm border border-black">
                            {transport.car_type || 'Vehicle'}
                          </div>
                          <div className="bg-white text-gray-800 text-[10px] font-bold tracking-widest px-3 py-2 uppercase flex items-center gap-1.5 rounded-b-sm border-l border-r border-b border-gray-100">
                            <i className="bi bi-geo-alt text-[#0081C9]"></i> {transport.address || 'LOCATION'}
                          </div>
                        </div>
                      </div>

                      {/* Content Area */}
                      <div className="p-6 flex-1 flex flex-col">
                        <h3 className="text-[20px] font-extrabold leading-snug cursor-pointer line-clamp-2 mb-2">
                          <Link to={`/transports/${transport.id}`} className="!text-gray-900 hover:!text-[#0081C9] transition-colors">{transport.title}</Link>
                        </h3>

                        {(transport.transport_from || transport.transport_to) && (
                          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4 font-medium">
                            <i className="bi bi-geo-alt text-[#0081C9]"></i>
                            <span>{transport.transport_from} {transport.transport_to ? `→ ${transport.transport_to}` : ''}</span>
                          </div>
                        )}

                        {/* Info Details */}
                        <div className={`text-[10px] !text-gray-500 font-bold uppercase tracking-widest flex items-center flex-wrap gap-4 ${(transport.transport_from || transport.transport_to) ? 'mb-6' : 'mb-6 mt-2'}`}>
                          <span className="flex items-center gap-1.5">
                            <i className="bi bi-person-fill text-[#0081C9] text-sm"></i>
                            {transport.car_person || '1'} PERSONS
                          </span>
                          {transport.distance_km && (
                            <span className="flex items-center gap-1.5 border-l border-gray-200 pl-4">
                              <i className="bi bi-signpost-split text-[#0081C9] text-sm"></i> {transport.distance_km} KM
                            </span>
                          )}
                        </div>

                        {/* Footer */}
                        <div className="mt-auto border-t border-gray-100 flex items-center justify-between gap-2 pt-4">
                          <div>
                            <div className="text-[11px] text-gray-500 font-bold uppercase tracking-wider mb-1">Starting From:</div>
                            <div className="flex items-center gap-2">
                              <span className="text-[20px] font-extrabold text-[#0081C9]">₹{transport.car_sale_price > 0 ? transport.car_sale_price : (transport.car_price || 0)}</span>
                              {transport.car_sale_price > 0 && <span className="text-[13px] font-bold text-gray-400 line-through">₹{transport.car_price}</span>}
                            </div>
                          </div>
                          <Link to={`/transports/${transport.id}`} className="bg-[#0081C9] !text-white px-4 py-2.5 rounded-lg text-[13px] font-bold flex items-center gap-1.5 whitespace-nowrap hover:bg-[#006096] transition-colors hover:shadow-lg hover:shadow-[#0081C9]/30">
                            Book Now <i className="bi bi-chevron-right text-base leading-none"></i>
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}
