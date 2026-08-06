import React from 'react';
import { Link } from 'react-router-dom';
import AboutSection from '../Home/AboutSection';
import FeaturesSection from '../Home/FeaturesSection';

export default function About() {
  return (
    <>
      {/* ── Hero Banner ── */}
      <div className="relative w-full h-[400px] flex flex-col items-center justify-center">
        <img src="/frontend/img/innerpage/banner.png" alt="About Us Banner" className="absolute inset-0 w-full h-full object-cover" onError={(e) => e.target.style.display = 'none'} />
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative z-10 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="text-4xl md:text-[56px] font-extrabold text-white mb-4 tracking-tight">About Us</h1>
          <div className="flex items-center justify-center gap-2 text-white text-base font-semibold">
            <Link to="/" className="text-[#0081C9] hover:text-[#0081C9] transition-colors">Home</Link>
            <span className="text-gray-300">➔</span>
            <span>About Us</span>
          </div>
        </div>
      </div>

      {/* ── Our Journey Section (from Home) ── */}
      <AboutSection />

      {/* ── Stats Bar ── */}
      <div className="border-t border-gray-100 bg-white py-14">
        <div className="container mx-auto px-4 lg:px-8 max-w-[1320px]">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:divide-x divide-gray-200/60">
            {/* Stat 1 */}
            <div className="flex items-center justify-center gap-5">
              <i className="bi bi-backpack2 text-[40px] text-[#0081C9]"></i>
              <div>
                <div className="text-[28px] font-extrabold text-gray-900 mb-0.5 tracking-tight">3.5K+</div>
                <div className="text-gray-500 font-medium text-sm">Happy Traveler</div>
              </div>
            </div>
            {/* Stat 2 */}
            <div className="flex items-center justify-center gap-5">
              <i className="bi bi-star text-[40px] text-[#0081C9]"></i>
              <div>
                <div className="text-[28px] font-extrabold text-gray-900 mb-0.5 tracking-tight">2.5k+</div>
                <div className="text-gray-500 font-medium text-sm">Tours Success</div>
              </div>
            </div>
            {/* Stat 3 */}
            <div className="flex items-center justify-center gap-5">
              <i className="bi bi-hand-thumbs-up text-[40px] text-[#0081C9]"></i>
              <div>
                <div className="text-[28px] font-extrabold text-gray-900 mb-0.5 tracking-tight">99.5%</div>
                <div className="text-gray-500 font-medium text-sm">Positives Review</div>
              </div>
            </div>
            {/* Stat 4 */}
            <div className="flex items-center justify-center gap-5">
              <i className="bi bi-person-badge text-[40px] text-[#0081C9]"></i>
              <div>
                <div className="text-[28px] font-extrabold text-gray-900 mb-0.5 tracking-tight">55+</div>
                <div className="text-gray-500 font-medium text-sm">Travel Guide</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Why Choose Us (from Home) ── */}
      <div className='mb-10'>
        <FeaturesSection />
      </div>

    </>
  );
}
