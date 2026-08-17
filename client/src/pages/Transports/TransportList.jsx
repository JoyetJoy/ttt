import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import TransportCard from '../Home/TransportCard';

export default function TransportList() {
  const [transports, setTransports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 9;
  const [sortOpen, setSortOpen] = useState(false);
  const [sortOption, setSortOption] = useState('Default Sorting');
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState(10000);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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

  const getPrice = (transport) => {
    const sale = transport.sale_price || transport.car_sale_price;
    const base = transport.price || transport.car_price;
    return Number(sale > 0 ? sale : (base || 0));
  };

  const filteredTransports = transports.filter(transport => {
    const titleMatch = transport.title?.toLowerCase().includes(searchQuery.toLowerCase());
    const locationString = transport.address || transport.locations_transports_city_idTolocations?.name || transport.locations_transports_country_idTolocations?.name || '';
    const locationMatch = locationString.toLowerCase().includes(searchQuery.toLowerCase());
    const price = getPrice(transport);
    return (titleMatch || locationMatch) && price <= Number(priceRange);
  });

  const sortedTransports = [...filteredTransports].sort((a, b) => {
    const priceA = getPrice(a);
    const priceB = getPrice(b);
    if (sortOption === 'Price Low To High') return priceA - priceB;
    if (sortOption === 'Price High To Low') return priceB - priceA;
    return 0; // default
  });

  if (loading) return <div className="pt-32 text-center text-gray-500 font-medium">Loading transports...</div>;

  const paginatedData = sortedTransports.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

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
            {isSidebarOpen && <div className="fixed inset-0 bg-black/60 z-[9990] lg:hidden" onClick={() => setIsSidebarOpen(false)}></div>}
            <div className={`w-[300px] lg:w-[320px] flex-shrink-0 flex flex-col gap-6 fixed lg:relative top-0 left-0 h-full lg:h-auto bg-white lg:bg-transparent z-[9999] lg:z-auto p-6 lg:p-0 overflow-y-auto lg:overflow-visible transition-transform duration-300 shadow-2xl lg:shadow-none ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
              <div className="lg:hidden flex justify-between items-center mb-2 pb-4 border-b border-gray-100">
                <h3 className="text-xl font-extrabold text-gray-900">Filters</h3>
                <button onClick={() => setIsSidebarOpen(false)} className="text-gray-500 hover:text-red-500 text-3xl leading-none bg-gray-50 hover:bg-red-50 w-10 h-10 rounded-full flex items-center justify-center transition-colors">&times;</button>
              </div>

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
                    max="10000"
                    value={priceRange}
                    onChange={(e) => setPriceRange(e.target.value)}
                    className="w-full accent-[#0081C9]"
                  />
                </div>
                <div className="flex justify-between items-center mt-4 px-1">
                  <span className="text-sm font-semibold text-gray-500">₹1</span>
                  <span className="text-sm font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded">₹{priceRange}</span>
                  <span className="text-sm font-semibold text-gray-500">₹10000</span>
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
              <div className="flex flex-wrap gap-4 justify-between items-center mb-8 bg-white p-4 rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-gray-100/50">
                <div className="text-gray-500 font-medium text-sm flex items-center gap-3">
                  <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden border border-gray-200 text-sm font-medium text-gray-500 rounded-full px-4 py-2 bg-white hover:bg-gray-50 flex items-center gap-2">
                    <i className="bi bi-funnel"></i> Filters
                  </button>
                  <span>Showing <span className="font-extrabold text-gray-900">{sortedTransports.length}</span> Result</span>
                </div>
                <div className="relative w-full sm:w-[220px]">
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
                {paginatedData.map(transport => {
                  let imgUrl = transport.feature_img || transport.features_image || transport.image;
                  if (imgUrl && !imgUrl.startsWith('http')) {
                    imgUrl = `${import.meta.env.VITE_API_BASE_URL}/uploads/transports/${imgUrl}`;
                  }
                  const item = {
                    id: transport.id,
                    feature_img: imgUrl || null,
                    title: transport.title || transport.name,
                    vehicle_type: transport.car_type || 'CAR',
                    vehicle_name: transport.vehicle_name || '',
                    location: transport.locations_transports_city_idTolocations?.name || transport.transport_from || transport.address || 'LOCATION',
                    passengers: transport.car_person || 1,
                    distance: transport.distance_km || 500,
                    hr_km: transport.hr_km,
                    extra_price: transport.extra_price_per_km,
                    price: transport.price || transport.car_price || 0,
                    sale_price: transport.sale_price || transport.car_sale_price || 0,
                    currency: '₹'
                  };
                  return (
                    <div key={transport.id}>
                      <TransportCard item={item} />
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
