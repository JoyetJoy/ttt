import React from 'react';
import { Link } from 'react-router-dom';
import ContactSection from '../Home/ContactSection';

export default function Contact() {
  return (
    <>
      {/* ── Hero Banner ── */}
      <div className="relative w-full h-[400px] flex flex-col items-center justify-center ">
        <img
          src="/frontend/img/innerpage/banner.png"
          alt="Contact Us Banner"
          className="absolute inset-0 w-full h-full object-cover"
          onError={(e) => e.target.style.display = 'none'}
        />
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative z-10 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="text-4xl md:text-[56px] font-extrabold text-white mb-4 tracking-tight">Contact Us</h1>
          <div className="flex items-center justify-center gap-2 text-white text-base font-semibold">
            <Link to="/" className="text-[#0081C9] hover:text-[#0081C9] transition-colors">Home</Link>
            <span className="text-gray-300">➔</span>
            <span>Contact Us</span>
          </div>
        </div>
      </div>

      {/* ── Main Contact Section ── */}
      <div className="bg-[#fcfcfc] pb-24">
        {/* We use the pre-built ContactSection which already matches the design */}
        <ContactSection type={'contact'} />
      </div>
    </>
  );
}
