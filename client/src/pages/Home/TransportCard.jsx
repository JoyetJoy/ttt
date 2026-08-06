import React from 'react';
import { Link } from 'react-router-dom';

export default function TransportCard({ item: transport }) {
  return (
    <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] overflow-hidden flex flex-col group border border-gray-100 hover:-translate-y-1 transition-all duration-300 h-full">

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
}
