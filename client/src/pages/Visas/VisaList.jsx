import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function VisaList() {
  const [visas, setVisas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 9;

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/visas`)
      .then(res => res.json())
      .then(data => {
        setVisas(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="pt-32 pb-32 text-center flex justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0081C9]"></div></div>;

  const paginatedData = visas.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <>
      {/* ── Hero Banner ── */}
      <div className="relative w-full h-[400px] flex flex-col items-center justify-center">
        <img src="/frontend/img/innerpage/banner.png" alt="All Visa Banner" className="absolute inset-0 w-full h-full object-cover" onError={(e) => e.target.style.display = 'none'} />
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative z-10 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="text-4xl md:text-[56px] font-extrabold text-white mb-4 tracking-tight">All Visa</h1>
          <div className="flex items-center justify-center gap-2 text-white text-base font-semibold">
            <Link to="/" className="text-[#0081C9] hover:text-white transition-colors">Home</Link>
            <span className="text-gray-300">➔</span>
            <span>All Visa</span>
          </div>
        </div>
      </div>

      <div className="bg-[#fcfaf7] py-20">
        <div className="container mx-auto px-4 max-w-[1320px]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {visas.map(visa => (
              <div key={visa.id} className="bg-white rounded shadow-[0_2px_15px_rgba(0,0,0,0.04)] overflow-hidden flex flex-col border border-gray-100/50 transition-all hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
                <div className="h-[260px] relative p-4 pb-0">
                  <img src={visa.features_image || 'https://via.placeholder.com/600x400'} alt={visa.title} className="w-full h-full object-cover rounded-t" />
                </div>
                
                <div className="p-6 flex flex-col flex-1">
                  <h3 className="text-xl font-extrabold text-gray-900 mb-6 line-clamp-1">
                    {visa.title}
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-y-4 text-[13px] mb-8">
                    <div>
                      <span className="font-extrabold text-gray-900">Country : </span>
                      <span className="text-gray-500 font-medium">{visa.locations?.name || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="font-extrabold text-gray-900">Visa Type : </span>
                      <span className="text-gray-500 font-medium">{visa.visa_categories?.name || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="font-extrabold text-gray-900">Visa Mode : </span>
                      <span className="text-gray-500 font-medium">{visa.visa_mode || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="font-extrabold text-gray-900">Validity : </span>
                      <span className="text-gray-500 font-medium">{visa.validity || 'N/A'}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="font-extrabold text-gray-900">Processing Time : </span>
                      <span className="text-gray-500 font-medium">{visa.processing || 'N/A'}</span>
                    </div>
                  </div>
                  
                  <div className="mt-auto pt-5 border-t border-gray-100 flex items-end justify-between">
                    <div>
                       <div className="text-[11px] font-bold text-gray-900 mb-0.5">Starting Form:</div>
                       <div className="flex items-baseline gap-1">
                         <span className="text-[22px] font-extrabold text-[#0081C9]">₹{visa.cost}</span>
                         <span className="text-[11px] font-bold text-gray-500">Per Person</span>
                       </div>
                    </div>
                    <Link to={`/visas/${visa.id}`} className="bg-[#0081C9] hover:bg-[#006096] text-white text-[13px] font-bold px-5 py-2.5 rounded flex items-center gap-2 transition-colors">
                      Apply Now 
                      <div className="w-4 h-4 rounded-full border border-white/60 flex items-center justify-center">
                         <i className="bi bi-arrow-up-right text-[9px]"></i>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
