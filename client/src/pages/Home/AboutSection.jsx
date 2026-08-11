import React from 'react';
import { Link } from 'react-router-dom';

export default function AboutSection({ config = {} }) {
  // Normalize tabs from legacy object format to array
  let tabs = [];
  if (Array.isArray(config.tabs)) {
    tabs = config.tabs;
  } else if (config.tabs && typeof config.tabs === 'object') {
    tabs = Object.values(config.tabs);
  }

  // Normalize main image
  let mainImage = config.image;
  if (!mainImage && config.about_img && config.about_img.img) {
    mainImage = `/uploads/about_content/${config.about_img.img}`;
  } else if (!mainImage && tabs[0] && tabs[0].image) {
    mainImage = tabs[0].image;
  } else if (!mainImage) {
    mainImage = "/uploads/about_content/egens-JzVvHh5RDb.png"; // Fallback
  }

  // Normalize customer image
  let customerImage = config.customer_image;
  if (!customerImage && config.customer_img && config.customer_img.img) {
    customerImage = `/frontend/img/innerpage/customer.webp`;
  } else if (!customerImage) {
    customerImage = "/frontend/img/innerpage/customer.webp"; // Fallback
  }

  // Normalize other fields
  const shoulder = config.shoulder || config.about_main_title || 'About Us';
  const title = config.title || config.about_title || "Let's know About Our Journey For Trivandrum Top Taxi.";
  const customerCount = config.number_of_customers || config.customer_number || '345';
  const buttonText = config.button_text || config.btn_text || 'More About';
  const buttonUrl = config.button_url || config.btn_url || '/about';

  return (
    <div className="home1-about-section mt-8 lg:mt-36 px-3 md:px-26">
      <img src="/frontend/img/home1/section-vector1.png" alt="bg" className="section-vector1" />
      <div className="container">
        <div className="row">
          <div className="col-lg-6">
            <div className="about-content">
              <div className="section-title mb-10">
                <span style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  color: '#0081C9', fontSize: '14px', fontWeight: '700',
                  marginBottom: '12px', letterSpacing: '0.5px'
                }}>
                  <span>→</span>
                  {shoulder}
                  <span>←</span>
                </span>
                <h2>{title}</h2>
              </div>

              <div style={{ marginBottom: '12px' }}>
                {tabs.length > 0 ? tabs.map((tab, idx) => (
                  <button key={idx}
                    className={idx === 0 ? 'active' : ''}
                    data-bs-toggle="pill" data-bs-target={`#tabs${idx}`}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '6px',
                      background: 'none', border: 'none', fontWeight: '700',
                      color: '#0081C9', padding: '4px 0', cursor: 'pointer', fontSize: '15px'
                    }}>
                    <i className={tab.tab_icon || tab.tabs_icon || 'bi bi-check-circle-fill'} style={{ color: '#0081C9' }} />
                    {tab.tab_label || tab.tab_title || tab.tabs_name || tab.name}
                  </button>
                )) : (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#0081C9', fontWeight: '700', fontSize: '15px' }}>
                    <i className="bi bi-check-circle-fill" style={{ color: '#0081C9' }} />
                    Focus On Customer
                  </div>
                )}
              </div>

              <div className="tab-content" id="pills-tab3Content">
                {tabs.length > 0 ? tabs.map((tab, idx) => {
                  const descHtml = tab.tabs_descriptions || tab.description || tab.tab_title || '';
                  return (
                    <div className={`tab-pane fade ${idx === 0 ? 'show active' : ''}`} id={`tabs${idx}`} role="tabpanel" key={idx}>
                      {tab.descriptions ? (
                        tab.descriptions.map((desc, i) => <p key={i}>{desc}</p>)
                      ) : (
                        <div dangerouslySetInnerHTML={{ __html: descHtml }}></div>
                      )}
                    </div>
                  );
                }) : (
                  <div className="tab-pane fade show active" id="tabs0" role="tabpanel">
                    <p>Welcome to Trivandrum Top Taxi where every journey begins with a dream and ends with unforgettable memories. Our travel specialists have in-depth knowledge of destinations worldwide, ensuring you get the best recommendations.</p>
                    <p>With a passion for exploration and a commitment to excellence, we specialize in crafting personalized travel experiences that cater to every traveler's needs.</p>
                    <p>Whether you're seeking a relaxing beach getaway, an adventurous expedition, or a cultural immersion, our expert team is dedicated to making your dream trip a reality. We tailor every trip to match your preferences, interests, and budget. Our partnerships with top airlines, hotels, and tour operators allow us to offer unbeatable prices.</p>
                  </div>
                )}
              </div>

              <div className="about-content-bottom">
                <Link to={buttonUrl.startsWith('/') ? buttonUrl : `/${buttonUrl}`} className="primary-btn1 !bg-[#0081C9] !text-white hover:!bg-[#006096] transition-colors border-none">{buttonText}</Link>
                <div className="counter-area">
                  <div className="customer-img-grp">
                    <img src={customerImage} alt="customer image" />
                  </div>
                  <div className="content">
                    <div className="number">
                      <h6 className="counter">{customerCount}</h6>
                      <span>+</span>
                    </div>
                    <p>Customer</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
          <div className="col-lg-6 d-flex justify-content-end">
            <div className="about-img">
              <img src='/frontend/img/innerpage/about.webp' alt="About" style={{ width: '100%', objectFit: 'contain' }} />
              {/* <img src="/frontend/img/innerpage/customer.webp" alt="" className="vector" /> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
