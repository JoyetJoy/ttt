import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Signpost } from 'lucide-react'; // Using lucide-react for icons similar to the screenshot

export default function TransportCard({ item }) {
  const navigate = useNavigate();

  return (
    <div 
      className="card border-0 shadow-sm cursor-pointer"
      style={{ borderRadius: '16px', overflow: 'hidden', height: '100%' }}
      onClick={(e) => {
        if (e.target.closest('a') || e.target.closest('button')) return;
        navigate(`/transports/${item.id}`);
      }}
    >
      {/* Image Area with Badges */}
      <div className="position-relative" style={{ height: '250px' }}>
        <Link to={`/transports/${item.id}`}>
          {item.feature_img ? (
            <img 
              src={item.feature_img} 
              alt={item.title} 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            />
          ) : (
            <img 
              src="/uploads/placeholder.jpg" 
              alt={item.title} 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            />
          )}
        </Link>
        
        {/* Top-Left: Vehicle Name */}
        <div className="position-absolute" style={{ top: '14px', left: '14px' }}>
          <div 
            className="bg-black text-white text-uppercase fw-bold"
            style={{ fontSize: '10px', letterSpacing: '1px', borderRadius: '4px', padding: '4px 10px' }}
          >
            {item.vehicle_name || item.vehicle_type || 'CAR'}
          </div>
        </div>

        {/* Bottom-Right: Location */}
        <div className="position-absolute" style={{ bottom: '14px', right: '14px' }}>
          <div 
            className="bg-white text-dark text-uppercase fw-bold d-flex align-items-center gap-1 shadow-sm"
            style={{ fontSize: '10px', letterSpacing: '0.5px', borderRadius: '4px', padding: '4px 10px' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 18 18" fill="none">
              <path d="M8.99939 0C5.40484 0 2.48047 2.92437 2.48047 6.51888C2.48047 10.9798 8.31426 17.5287 8.56264 17.8053C8.79594 18.0651 9.20326 18.0646 9.43613 17.8053C9.68451 17.5287 15.5183 10.9798 15.5183 6.51888C15.5182 2.92437 12.5939 0 8.99939 0ZM8.99939 9.79871C7.19088 9.79871 5.71959 8.32739 5.71959 6.51888C5.71959 4.71037 7.19091 3.23909 8.99939 3.23909C10.8079 3.23909 12.2791 4.71041 12.2791 6.51892C12.2791 8.32743 10.8079 9.79871 8.99939 9.79871Z" fill="#0081C9"></path>
            </svg>
            {item.location || 'MIRPUR DOHS'}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="card-body px-4 pt-3 pb-4 bg-white" style={{ display: 'flex', flexDirection: 'column' }}>
        <h4 className="fw-bolder mb-2">
          <Link to={`/transports/${item.id}`} className="text-dark hover:!text-[#0081C9] transition-colors text-decoration-none">
            {item.title}
          </Link>
        </h4>

        {/* Info Icons */}
        <div className="d-flex align-items-center mb-3">
          <div className="d-flex align-items-center gap-2" style={{ paddingRight: '20px', borderRight: '1px solid #eaeaea' }}>
            <User size={18} color="#0081C9" />
            <span className="text-muted fw-bold text-uppercase" style={{ fontSize: '12px' }}>
              {item.passengers || '5'} PERSONS
            </span>
          </div>
          <div className="d-flex align-items-center gap-1" style={{ paddingLeft: '20px' }}>
             <Signpost size={18} color="#0081C9" />
             <span className="text-muted fw-bold text-uppercase d-flex align-items-center gap-1 flex-wrap" style={{ fontSize: '12px' }}>
               <span>{item.hr_km || (item.distance ? `${item.distance} KM` : '500 KM')}</span>
               {item.extra_price && (
                 <span style={{ fontSize: '10px', color: '#888', textTransform: 'none' }}>
                   (Extra: {item.currency || '₹'}{item.extra_price}/km)
                 </span>
               )}
             </span>
           </div>
        </div>

        {/* Divider */}
        <hr className="m-0 mb-3" style={{ borderColor: '#f0f0f0' }} />

        {/* Footer (Price & Button) */}
        <div className="d-flex align-items-end justify-content-between mt-auto">
          <div>
            <span className="text-muted text-uppercase fw-bold d-block mb-1" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>
              STARTING FROM:
            </span>
            <div className="d-flex align-items-baseline gap-2">
              <span className="fw-bolder" style={{ color: '#0081C9', fontSize: '24px' }}>
                ₹{item.sale_price || item.price}
              </span>
              {item.sale_price > 0 && item.sale_price < item.price && (
                <del className="text-muted fw-bold" style={{ fontSize: '16px' }}>₹{item.price}</del>
              )}
            </div>
          </div>
          <Link 
            to={`/transports/${item.id}`} 
            className="btn px-4 py-2 text-white fw-bold d-flex align-items-center gap-2 shadow-sm"
            style={{ background: '#0081C9', borderRadius: '8px' }}
          >
            Book Now 
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
