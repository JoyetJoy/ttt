import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function HotelList() {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 9;

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/hotels`)
      .then(res => res.json())
      .then(data => {
        setHotels(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="pt-32 text-center">Loading hotels...</div>;

  const paginatedData = hotels.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="pt-24 pb-32 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4">
        
        <h1 className="text-4xl font-bold mb-10 text-center">Featured Hotels</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {hotels.map(hotel => (
            <div key={hotel.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow border border-gray-100 flex flex-col">
              <div className="h-56 bg-gray-200 relative">
                {hotel.feature_img && (
                  <img src={hotel.feature_img} alt={hotel.title} className="w-full h-full object-cover" />
                )}
              </div>
              <div className="p-6 flex-grow flex flex-col">
                <div className="text-sm text-gray-500 mb-2 font-medium uppercase tracking-wide">
                  {hotel.room_type} Room
                </div>
                <h3 className="text-xl font-bold mb-3 hover:text-red-600 transition-colors">
                  <Link to={`/hotels/${hotel.id}`}>{hotel.title}</Link>
                </h3>
                
                <div className="flex items-center gap-2 mb-4 text-sm text-gray-600">
                   <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/></svg>
                   {hotel.address || 'Location Unavailable'}
                </div>

                <div className="mt-auto pt-6 flex items-center justify-between border-t border-gray-100">
                  <div>
                     <div className="text-xs text-gray-500 mb-1">Per night</div>
                     <div className="text-lg font-bold text-red-600">
                       ₹{hotel.price}
                     </div>
                  </div>
                  <Link to={`/hotels/${hotel.id}`} className="px-5 py-2 bg-gray-900 text-white font-medium rounded hover:bg-red-600 transition-colors">
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
        
      </div>
    </div>
  );
}
