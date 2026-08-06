import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import InquiryFormWidget from '../../components/InquiryFormWidget';

export default function HotelDetails() {
  const { id } = useParams();
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/hotels/${id}`)
      .then(res => res.json())
      .then(data => {
        setHotel(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="pt-32 text-center">Loading hotel details...</div>;
  if (!hotel) return <div className="pt-32 text-center">Hotel not found</div>;

  return (
    <div className="pt-32 pb-32">
      <div className="container mx-auto px-4">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8">
            {/* Gallery Placeholder */}
            <div className="mb-8 rounded-xl overflow-hidden shadow-lg h-96 bg-gray-200">
               {hotel.feature_img ? (
                 <img src={hotel.feature_img} alt={hotel.title} className="w-full h-full object-cover" />
               ) : (
                 <div className="flex items-center justify-center h-full text-gray-500">Feature Image</div>
               )}
            </div>

            {/* Title & Location */}
            <div className="mb-6">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">{hotel.title}</h2>
              <div className="flex items-center gap-2 mb-6 text-gray-600">
                <svg width="18" height="18" fill="currentColor" viewBox="0 0 16 16"><path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/></svg>
                <span>{hotel.address || 'Address not provided'}</span>
              </div>
              
              <div className="flex items-end gap-2 mb-6 border-b pb-6">
                <h3 className="text-3xl font-bold text-red-600">
                  ₹{hotel.price}
                </h3>
                <span className="text-gray-500 mb-1">/per night</span>
              </div>
              
              {/* Hotel Metadata */}
              <ul className="flex flex-wrap gap-6 text-gray-700 font-medium">
                <li className="flex items-center gap-2">
                  <span className="font-bold">Room:</span> {hotel.room_type}
                </li>
                <li className="flex items-center gap-2">
                  <span className="font-bold">Bed:</span> {hotel.bed_type}
                </li>
                <li className="flex items-center gap-2">
                  <span className="font-bold">Guests:</span> {hotel.guest_capability} Max
                </li>
                <li className="flex items-center gap-2">
                  <span className="font-bold">Check-in:</span> {hotel.check_in || 'Flexible'}
                </li>
              </ul>
            </div>

            {/* Content */}
            <div className="prose max-w-none text-gray-700 mb-8" dangerouslySetInnerHTML={{ __html: hotel.content }} />

            {/* Policies */}
            {hotel.policies && (
              <div className="bg-gray-50 p-8 rounded-xl">
                <h4 className="text-2xl font-bold mb-4">{hotel.policy_title || 'Policies'}</h4>
                <div className="prose text-gray-700" dangerouslySetInnerHTML={{ __html: hotel.policies }} />
              </div>
            )}
          </div>
          
          <div className="lg:col-span-4">
             {/* Booking Widget Placeholder */}
             <div className="bg-white rounded-xl shadow-xl p-6 border border-gray-100 sticky top-24">
                <h3 className="text-xl font-bold mb-4">Book Your Room</h3>
                <form>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Check-in Date</label>
                  <input type="date" className="w-full border p-3 rounded-lg mb-4 focus:ring focus:ring-red-200" />
                  
                  <label className="block text-sm font-bold text-gray-700 mb-2">Check-out Date</label>
                  <input type="date" className="w-full border p-3 rounded-lg mb-4 focus:ring focus:ring-red-200" />
                  
                  <input type="number" placeholder="Guests" min="1" max={hotel.guest_capability} className="w-full border p-3 rounded-lg mb-4 focus:ring focus:ring-red-200" />
                  <button className="w-full bg-red-600 text-white font-bold py-3 rounded-lg hover:bg-red-700 transition">Confirm Booking</button>
                </form>
             </div>
             
             <div className="mt-8">
               <InquiryFormWidget itemType="Hotel" itemId={hotel.id} title="Inquire About Room" subtitle="Need more information before booking? Drop us a message!" />
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
