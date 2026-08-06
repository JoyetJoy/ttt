import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import InquiryFormWidget from '../../components/InquiryFormWidget';

export default function VisaDetails() {
  const { id } = useParams();
  const [visa, setVisa] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/visas/${id}`)
      .then(res => res.json())
      .then(data => {
        setVisa(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="pt-32 pb-32 text-center flex justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0081C9]"></div></div>;
  if (!visa) return <div className="pt-32 pb-32 text-center text-gray-500">Visa not found</div>;

  const parseJSON = (str) => {
    if (!str || str === 'null') return {};
    try {
      let parsed = JSON.parse(str);
      if (typeof parsed === 'string') parsed = JSON.parse(parsed);
      return parsed;
    } catch { return {}; }
  };

  const faqs = Object.values(parseJSON(visa.faqs)).filter(f => f?.title);

  return (
    <>
      {/* ── Hero Banner ── */}
      <div className="relative w-full h-[400px] flex flex-col items-center justify-center">
        <img src="/frontend/img/innerpage/banner.png" alt="Visa Banner" className="absolute inset-0 w-full h-full object-cover" onError={(e) => e.target.style.display = 'none'} />
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative z-10 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="text-4xl md:text-[56px] font-extrabold text-white mb-4 tracking-tight">{visa.title}</h1>
          <div className="flex items-center justify-center gap-2 text-white text-base font-semibold">
            <Link to="/" className="text-[#0081C9] hover:text-white transition-colors">Home</Link>
            <span className="text-gray-300">➔</span>
            <span>{visa.title}</span>
          </div>
        </div>
      </div>

      <div className="bg-white py-20">
        <div className="container mx-auto px-4 max-w-[1320px]">
          <div className="flex flex-col lg:flex-row gap-8">

            {/* ── Left Content (66%) ── */}
            <div className="lg:w-2/3">
              <div className="mb-10">
                <img src={visa.features_image || 'https://via.placeholder.com/800x500'} alt={visa.title} className="w-full h-auto object-cover rounded-md" />
              </div>

              <h2 className="text-[32px] font-extrabold text-gray-900 mb-8">{visa.title}</h2>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-y-6 mb-12 text-[14px]">
                <div>
                  <span className="font-extrabold text-gray-900">Country : </span>
                  <span className="text-gray-500 font-medium">{visa.locations?.name || 'N/A'}</span>
                </div>
                <div>
                  <span className="font-extrabold text-gray-900">Visa Type : </span>
                  <span className="text-gray-500 font-medium">{visa.visa_categories?.name || 'N/A'}</span>
                </div>
                <div>
                  <span className="font-extrabold text-gray-900">Maximum Stays : </span>
                  <span className="text-gray-500 font-medium">{visa.maximum_stay || 'N/A'}</span>
                </div>
                <div>
                  <span className="font-extrabold text-gray-900">Processing Time : </span>
                  <span className="text-gray-500 font-medium">{visa.processing || 'N/A'}</span>
                </div>
                <div>
                  <span className="font-extrabold text-gray-900">Validity : </span>
                  <span className="text-gray-500 font-medium">{visa.validity || 'N/A'}</span>
                </div>
                <div>
                  <span className="font-extrabold text-gray-900">Visa Mode : </span>
                  <span className="text-gray-500 font-medium">{visa.visa_mode || 'N/A'}</span>
                </div>
              </div>

              {/* FAQs */}
              {faqs.length > 0 && (
                <div className="mt-16">
                  <h3 className="text-[24px] font-extrabold text-gray-900 mb-8">FAQ - General Visa Information:</h3>
                  <div className="space-y-0">
                    {faqs.map((faq, index) => (
                      <div key={index} className="border-b border-gray-300">
                        <div
                          className="flex justify-between items-center cursor-pointer py-5"
                          onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                        >
                          <h5 className="font-extrabold text-gray-900 text-[15px]">{faq.title}</h5>
                          <div className="text-2xl font-bold text-gray-900 flex items-center justify-center w-6 h-6 leading-none pb-1">
                            {openFaqIndex === index ? '−' : '+'}
                          </div>
                        </div>
                        {openFaqIndex === index && (
                          <div className="pb-6 pt-2 text-[14px] text-gray-500 leading-relaxed pr-8 pl-4">
                            {faq.content}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ── Right Sidebar (33%) ── */}
            <div className="lg:w-1/3 flex flex-col gap-8">

              {/* Cost Summary Box */}
              <div className="bg-[#f8f9f2] rounded-xl p-10 text-center flex flex-col items-center justify-center">
                <h4 className="text-[26px] font-extrabold text-gray-900 mb-2">Cost Summary</h4>
                <div className="flex items-baseline gap-1 mb-3">
                  <span className="text-[22px] font-bold text-[#0081C9]">₹{visa.cost}</span>
                  <span className="text-[22px] font-bold text-[#0081C9]">/</span>
                  <span className="text-gray-500 text-[14px]">per person</span>
                </div>
                <p className="text-[12px] text-gray-400 font-medium tracking-wide">Arrange your trip in advance - book this room now!</p>
              </div>

              {/* Inquiry Form */}
              <div className="mt-4">
                <InquiryFormWidget itemType="Visa" itemId={visa.id} title="Inquiry Form" subtitle="Complete form for complaints or service inquiries; expect prompt response via phone/email." />
              </div>

              {/* Support Contact Box */}
              <div className="relative rounded-xl overflow-hidden group h-[400px]">
                <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&h=800&fit=crop" alt="Support" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />

                {/* Brush stroke overlay (using SVG for ragged top edge) */}
                <div className="absolute bottom-0 left-0 right-0 h-[120px] flex items-center">
                  <svg className="absolute top-[-30px] left-0 w-full h-[50px] text-[#0081C9]" preserveAspectRatio="none" viewBox="0 0 100 100" fill="currentColor">
                    <path d="M0,100 C20,70 40,90 60,60 C80,30 90,80 100,60 L100,100 L0,100 Z" opacity="0.8" />
                    <path d="M0,100 C15,80 35,95 55,75 C75,55 85,85 100,70 L100,100 L0,100 Z" />
                  </svg>
                  <div className="absolute inset-0 bg-[#0081C9]"></div>

                  <div className="relative z-10 flex gap-5 items-center px-8 w-full">
                    <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                      <i className="bi bi-telephone text-[#0081C9] text-2xl"></i>
                    </div>
                    <div>
                      <div className="font-['Caveat',cursive] italic text-2xl text-white mb-0.5 tracking-wide">To More Inquiry</div>
                      <div className="text-white font-extrabold text-[22px] tracking-wide">+990-737 621 432</div>
                    </div>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>
      </div>
    </>
  );
}
