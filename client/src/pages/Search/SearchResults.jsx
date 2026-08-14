import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import TourCard from '../Home/TourCard';
import HomeTransportCard from '../Home/TransportCard';
import SearchBox from '../Home/SearchBox';

/* ─── Activity Card ─── */
function ActivityCard({ item }) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
      <div className="relative overflow-hidden h-52">
        <Link to={`/activities/${item.id}`}>
          <img
            src={item.feature_img || 'https://via.placeholder.com/400x250?text=Activity'}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={e => { e.target.src = 'https://via.placeholder.com/400x250?text=Activity'; }}
          />
        </Link>
        {item.days > 0 && (
          <span className="absolute top-3 left-3 bg-[#0081C9] text-white text-xs font-bold px-3 py-1 rounded-full">
            {item.days} Day{item.days > 1 ? 's' : ''}
          </span>
        )}
      </div>
      <div className="p-5">
        <div className="text-xs font-semibold text-[#0081C9] uppercase tracking-wider mb-2">{item.shoulder || 'Activity'}</div>
        <h5 className="font-extrabold text-base leading-snug mb-3" style={{ color: '#111' }}>
          <Link to={`/activities/${item.id}`} style={{ color: '#111' }} className="hover:text-[#0081C9] transition-colors">{item.title}</Link>
        </h5>
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div>
            <div className="text-xs text-gray-400 font-medium mb-1">Starting From:</div>
            {item.sale_price > 0 && item.sale_price < item.price ? (
              <span className="text-[#0081C9] font-extrabold text-lg">₹{item.sale_price} <del className="text-gray-400 text-sm font-normal">₹{item.price}</del></span>
            ) : (
              <span className="text-[#0081C9] font-extrabold text-lg">₹{item.price || '—'}</span>
            )}
          </div>
          <Link to={`/activities/${item.id}`} className="bg-[#0081C9] text-white text-sm font-bold px-4 py-2 rounded-lg hover:bg-[#006096] transition-colors">
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ─── Visa Card ─── */
function VisaCard({ item }) {
  const countryName = item.locations?.name || '';
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
      <div className="relative overflow-hidden h-52">
        <Link to={`/visas/${item.id}`}>
          <img
            src={item.features_image || item.banner_img || 'https://via.placeholder.com/400x250?text=Visa'}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={e => { e.target.src = 'https://via.placeholder.com/400x250?text=Visa'; }}
          />
        </Link>
        {countryName && (
          <span className="absolute top-3 left-3 bg-[#0081C9] text-white text-xs font-bold px-3 py-1 rounded-full">
            {countryName}
          </span>
        )}
        {item.visa_mode && (
          <span className="absolute top-3 right-3 bg-black/60 text-white text-xs font-semibold px-2 py-1 rounded">
            {item.visa_mode}
          </span>
        )}
      </div>
      <div className="p-5">
        <div className="text-xs font-semibold text-[#0081C9] uppercase tracking-wider mb-1">
          {item.visa_categories?.name || 'Visa'}
        </div>
        <h5 className="font-extrabold text-base leading-snug mb-2" style={{ color: '#111' }}>
          <Link to={`/visas/${item.id}`} style={{ color: '#111' }} className="hover:text-[#0081C9] transition-colors">{item.title}</Link>
        </h5>
        <div className="flex gap-4 text-xs text-gray-500 mb-3">
          {item.processing && <span>⏱ {item.processing}</span>}
          {item.validity && <span>📅 Valid: {item.validity}</span>}
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div>
            <div className="text-xs text-gray-400 font-medium mb-1">Processing Fee:</div>
            {item.cost ? (
              <span className="text-[#0081C9] font-extrabold text-lg">₹{item.cost}</span>
            ) : (
              <span className="text-gray-400 text-sm">Contact for price</span>
            )}
          </div>
          <Link to={`/visas/${item.id}`} className="bg-[#0081C9] text-white text-sm font-bold px-4 py-2 rounded-lg hover:bg-[#006096] transition-colors">
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}


/* ─── API Config ─── */
const API_MAP = {
  tour:       { url: `${import.meta.env.VITE_API_URL}/tours`,       label: 'Tour',       plural: 'Tours',       browseUrl: '/tours' },
  activities: { url: `${import.meta.env.VITE_API_URL}/activities`,  label: 'Activity',   plural: 'Activities',  browseUrl: '/activities' },
  visa:       { url: `${import.meta.env.VITE_API_URL}/visas`,       label: 'Visa',       plural: 'Visas',       browseUrl: '/visas' },
  transport:  { url: `${import.meta.env.VITE_API_URL}/transports`,  label: 'Transport',  plural: 'Transports',  browseUrl: '/transports' },
};

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortOption, setSortOption] = useState('Default');

  const type = searchParams.get('type') || 'tour';
  const destination = searchParams.get('destination') || '';
  const location = searchParams.get('location') || '';
  const locationFrom = searchParams.get('location_from') || '';
  const duration = searchParams.get('duration') || '';
  const month = searchParams.get('month') || '';
  const tourType = searchParams.get('tour_type') || '';
  const transportType = searchParams.get('transport_type') || '';
  const country = searchParams.get('country') || '';

  const api = API_MAP[type] || API_MAP['tour'];

  useEffect(() => {
    setLoading(true);
    setResults([]);
    fetch(api.url)
      .then(res => res.json())
      .then(data => {
        const list = Array.isArray(data) ? data : (data.data || data.results || data.visas || data.transports || []);
        setResults(list);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [type, api.url]);

  /* ── Filtering ── */
  const filtered = results.filter(item => {
    const searchableText = [
      item.address, item.location, item.title, item.shoulder, item.car_type, item.vehicle_name,
      item.locations?.name, item.locations_transports_country_idTolocations?.name,
      item.locations_transports_city_idTolocations?.name, item.transport_from
    ].join(' ').toLowerCase();

    const destQuery = destination || location || country || locationFrom;
    const destMatch = !destQuery || searchableText.includes(destQuery.toLowerCase());
    const typeQuery = tourType || transportType;
    const typeMatch = !typeQuery || searchableText.includes(typeQuery.toLowerCase());
    const durMatch = !duration || String(item.duration || item.days || '').includes(duration.replace(' Days', '').replace(' Day', ''));
    const monthMatch = !month || (() => {
      if (!item.created_at) return true;
      const names = ['January','February','March','April','May','June','July','August','September','October','November','December'];
      return names[new Date(item.created_at).getMonth()] === month;
    })();
    return destMatch && typeMatch && durMatch && monthMatch;
  });

  /* ── Sorting ── */
  const getPrice = (item) => {
    if (type === 'visa') return item.cost || 0;
    if (type === 'transport') return Math.min(...[item.car_price, item.train_price, item.bus_price].filter(p => p > 0).map(Number)) || 0;
    return (item.sale_price > 0 ? item.sale_price : item.price) || 0;
  };

  const sorted = [...filtered].sort((a, b) => {
    if (sortOption === 'Price: Low to High') return getPrice(a) - getPrice(b);
    if (sortOption === 'Price: High to Low') return getPrice(b) - getPrice(a);
    return 0;
  });

  /* ── Active Filter Chips ── */
  const activeFilters = [
    (destination || location || locationFrom) && { label: 'Location', value: destination || location || locationFrom, key: destination ? 'destination' : (locationFrom ? 'location_from' : 'location') },
    (tourType || transportType) && { label: 'Type', value: tourType || transportType, key: tourType ? 'tour_type' : 'transport_type' },
    month && { label: 'Month', value: month, key: 'month' },
    duration && { label: 'Duration', value: duration, key: 'duration' },
    country && { label: 'Country', value: country, key: 'country' },
  ].filter(Boolean);

  const removeFilter = (key) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete(key);
    navigate(`/search?${newParams.toString()}`);
  };

  /* ── Render Card by Type ── */
  const renderCard = (item) => {
    switch (type) {
      case 'activities': return <ActivityCard key={item.id} item={item} />;
      case 'visa':       return <VisaCard key={item.id} item={item} />;
      case 'transport': {
        // Map raw transport data to HomeTransportCard shape
        const mappedItem = {
          ...item,
          vehicle_name: item.vehicle_name || '',
          vehicle_type: item.car_type || 'CAR',
          location: item.locations_transports_city_idTolocations?.name || item.transport_from || '',
          passengers: item.car_person || 5,
          distance: item.distance_km || 500,
          hr_km: item.hr_km,
          extra_price: item.extra_price_per_km,
          price: item.car_price || 0,
          sale_price: item.car_sale_price || 0,
          currency: '₹',
        };
        return <HomeTransportCard key={item.id} item={mappedItem} />;
      }
      default:           return (
        <div key={item.id} className="col-lg-4 col-md-6">
          <TourCard item={{ ...item, feature_img: item.feature_img || item.features_image }} />
        </div>
      );
    }
  };

  const isGridLayout = type !== 'tour';

  return (
    <>
      {/* ── Hero Banner ── */}
      <div className="relative w-full h-[300px] flex flex-col items-center justify-center">
        <img src="/frontend/img/innerpage/banner.png" alt="Search Results" className="absolute inset-0 w-full h-full object-cover" onError={e => e.target.style.display = 'none'} />
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative z-10 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="text-4xl md:text-[52px] font-extrabold text-white mb-3 tracking-tight">{api.plural} Search</h1>
          <div className="flex items-center justify-center gap-2 text-white text-base font-semibold">
            <Link to="/" className="text-[#0081C9] hover:text-white transition-colors">Home</Link>
            <span className="text-gray-300">➔</span>
            <span>Search Results</span>
          </div>
        </div>
      </div>

      {/* ── Search Bar ── */}
      <SearchBox initialTab={type} />

      {/* ── Main Content ── */}
      <div className="bg-[#fcfaf7] py-14 min-h-[60vh]">
        <div className="container mx-auto px-4 lg:px-8 max-w-[1320px]">

          {/* Active Filters */}
          {activeFilters.length > 0 && (
            <div className="mb-8 flex flex-wrap items-center gap-3">
              <span className="text-sm font-semibold text-gray-500">Active Filters:</span>
              {activeFilters.map(f => (
                <span key={f.key} className="flex items-center gap-2 bg-white border border-[#0081C9]/30 text-[#0081C9] text-sm font-semibold rounded-full px-4 py-1.5 shadow-sm">
                  <span className="text-gray-400 text-xs uppercase tracking-wider">{f.label}:</span>
                  {f.value}
                  <button onClick={() => removeFilter(f.key)} className="ml-1 text-gray-400 hover:text-red-500 transition-colors font-bold text-base leading-none cursor-pointer">×</button>
                </span>
              ))}
              <button onClick={() => navigate('/search?type=' + type)} className="text-sm text-gray-400 hover:text-red-500 transition-colors font-medium underline cursor-pointer">Clear All</button>
            </div>
          )}

          {/* Results Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-extrabold text-gray-900">
                {loading ? 'Searching...' : `${sorted.length} ${sorted.length === 1 ? api.label : api.plural} Found`}
              </h2>
              {!loading && activeFilters.length > 0 && (
                <p className="text-gray-500 text-sm mt-1">{activeFilters.map(f => f.value).join(' · ')}</p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <label className="text-sm font-semibold text-gray-600">Sort By:</label>
              <select className="border border-gray-200 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0081C9]/30 cursor-pointer" value={sortOption} onChange={e => setSortOption(e.target.value)}>
                <option>Default</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Results */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse">
                  <div className="h-52 bg-gray-200"></div>
                  <div className="p-5 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/3 mt-4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : sorted.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-24 h-24 bg-[#0081C9]/10 rounded-full flex items-center justify-center mb-6">
                <i className="bi bi-search text-[#0081C9] text-4xl"></i>
              </div>
              <h3 className="text-2xl font-extrabold text-gray-800 mb-3">No {api.plural} Found</h3>
              <p className="text-gray-500 text-base max-w-md mb-8">We couldn't find any {api.plural.toLowerCase()} matching your search. Try adjusting your filters.</p>
              <div className="flex gap-4">
                <button onClick={() => navigate(-1)} className="px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer">Go Back</button>
                <Link to={api.browseUrl} className="px-6 py-3 bg-[#0081C9] text-white rounded-lg font-semibold hover:bg-[#006096] transition-colors">Browse All {api.plural}</Link>
              </div>
            </div>
          ) : isGridLayout ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sorted.map(item => renderCard(item))}
            </div>
          ) : (
            <div className="row g-4">
              {sorted.map(item => renderCard(item))}
            </div>
          )}

          {/* Browse All Link */}
          {!loading && sorted.length > 0 && (
            <div className="text-center mt-12">
              <Link to={api.browseUrl} className="inline-flex items-center gap-2 text-[#0081C9] hover:text-[#006096] font-semibold text-base transition-colors">
                <i className="bi bi-arrow-left"></i>
                Browse All {api.plural}
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
