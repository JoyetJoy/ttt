import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function TourCard({ item }) {
  const navigate = useNavigate();
  return (
    <div 
      className="package-card cursor-pointer"
      onClick={(e) => {
        if (e.target.closest('a') || e.target.closest('button')) return;
        navigate(`${item.basePath || '/tours'}/${item.id}`);
      }}
    >
      <div className="package-card-img-wrap">
        <Link to={`${item.basePath || '/tours'}/${item.id}`} className="card-img">
          {item.feature_img ? (
            <img src={item.feature_img} alt={item.title} />
          ) : (
            <img src="/uploads/placeholder.jpg" alt={item.title} />
          )}
        </Link>

        <div className="batch">
          {item.days > 0 && (
            <span className="date">{item.days} Days / {item.days > 0 ? item.days - 1 : 0} Night</span>
          )}
          <div className="location !text-[#0081C9] [&_svg]:!fill-[#0081C9]">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18">
              <path d="M8.99939 0C5.40484 0 2.48047 2.92437 2.48047 6.51888C2.48047 10.9798 8.31426 17.5287 8.56264 17.8053C8.79594 18.0651 9.20326 18.0646 9.43613 17.8053C9.68451 17.5287 15.5183 10.9798 15.5183 6.51888C15.5182 2.92437 12.5939 0 8.99939 0ZM8.99939 9.79871C7.19088 9.79871 5.71959 8.32739 5.71959 6.51888C5.71959 4.71037 7.19091 3.23909 8.99939 3.23909C10.8079 3.23909 12.2791 4.71041 12.2791 6.51892C12.2791 8.32743 10.8079 9.79871 8.99939 9.79871Z"></path>
            </svg>
            <ul className="location-list">
              <li><Link to="#" className="!text-[#0081C9]">{item.location || 'Global'}</Link></li>
            </ul>
          </div>
        </div>
      </div>
      <div className="package-card-content">
        <div className="card-content-top">
          <h5><Link to={`${item.basePath || '/tours'}/${item.id}`} className="hover:!text-[#0081C9] transition-colors">{item.title}</Link></h5>
          {item.subDestinations && !String(item.subDestinations).toLowerCase().includes('undefined') && (
            <p className="mt-2 mb-0 text-muted text-uppercase" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>
              {item.subDestinations}
            </p>
          )}
        </div>
        <div className="card-content-bottom">
          <div className="price-area">
            <h6>Starting From:</h6>
            {item.sale_price > 0 ? (
              <span className="!text-[#0081C9]">₹{item.sale_price} <del className="!text-gray-400">₹{item.price}</del></span>
            ) : (
              <span className="!text-[#0081C9]">₹{item.price}</span>
            )}
            <p>TAXES INCL/PERS</p>
          </div>
          <Link to={`${item.basePath || '/tours'}/${item.id}`} className="primary-btn2 !bg-[#0081C9] !text-white hover:!bg-[#006096] transition-colors border-none [&_svg]:!fill-white">
            View Details
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M8.15624 10.2261L7.70276 12.3534L5.60722 18L6.85097 17.7928L12.6612 10.1948C13.4812 10.1662 14.2764 10.1222 14.9674 10.054C18.1643 9.73783 17.9985 8.99997 17.9985 8.99997C17.9985 8.99997 18.1643 8.26211 14.9674 7.94594C14.2764 7.87745 13.4811 7.8335 12.6611 7.80518L6.851 0.206972L5.60722 -5.41705e-07L7.70276 5.64663L8.15624 7.77386C7.0917 7.78979 6.37132 7.81403 6.37132 7.81403C6.37132 7.81403 4.90278 7.84793 2.63059 8.35988L0.778036 5.79016L0.000253424 5.79016L0.554115 8.91458C0.454429 8.94514 0.454429 9.05483 0.554115 9.08539L0.000253144 12.2098L0.778036 12.2098L2.63059 9.64035C4.90278 10.1523 6.37132 10.1857 6.37132 10.1857C6.37132 10.1857 7.0917 10.2102 8.15624 10.2261Z"></path>
              <path d="M12.0703 11.9318L12.0703 12.7706L8.97041 12.7706L8.97041 11.9318L12.0703 11.9318ZM12.0703 5.23292L12.0703 6.0714L8.97059 6.0714L8.97059 5.23292L12.0703 5.23292ZM9.97892 14.7465L9.97892 15.585L7.11389 15.585L7.11389 14.7465L9.97892 14.7465ZM9.97892 2.41846L9.97892 3.2572L7.11389 3.2572L7.11389 2.41846L9.97892 2.41846Z"></path>
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
