import React from 'react';

export default function ContactSection({ type }) {
  return (
    <div className="contact-page my-8 lg:my-28 px-3 lg:px-26">
      <div className="container">
        <div className="row g-4 justify-content-center">
          {type === 'contact' ? '' : (
            <div className="col-12 section-title text-center mb-4">
              <span className="!text-[#0081C9] [&_svg]:!fill-[#0081C9]">
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="16" viewBox="0 0 15 16"><path fillRule="evenodd" clipRule="evenodd" d="M1.92556 7.69046C2.35744 7.63298 2.78906 7.57563 3.21925 7.51077C4.14925 7.37065 5.08588 7.29138 6.01763 7.21249L6.01888 7.21243C6.15888 7.20055 6.29875 7.18874 6.43844 7.17668C7.50663 6.968 8.58732 6.89083 9.66644 6.94628C10.7733 7.06837 11.8592 7.41421 12.8857 7.97163L12.8857 8.23655C11.8592 8.79397 10.7733 9.13981 9.66644 9.26191C8.58732 9.31735 7.50663 9.24018 6.43844 9.03151C5.36831 8.93932 4.29813 8.82412 3.21925 8.69742C2.14031 8.57065 1.07012 8.42092 -6.78702e-07 8.23655L-7.01862e-07 7.97163C0.639938 7.86135 1.28306 7.77588 1.92556 7.69046Z" /></svg>
                Contact Us
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="16" viewBox="0 0 15 16"><path fillRule="evenodd" clipRule="evenodd" d="M13.0744 8.30954C12.6426 8.36702 12.2109 8.42437 11.7807 8.48923C10.8507 8.62935 9.91412 8.70862 8.98237 8.78751L8.98112 8.78757C8.84112 8.79945 8.70125 8.81126 8.56156 8.82332C7.49337 9.032 6.41268 9.10917 5.33356 9.05372C4.22669 8.93163 3.14081 8.58578 2.11432 8.02837V7.76345C3.14081 7.20603 4.22669 6.86018 5.33356 6.73809C6.41268 6.68265 7.49337 6.75982 8.56156 6.96849C9.63169 7.06068 10.7019 7.17588 11.7807 7.30259C12.8597 7.42935 13.9299 7.57908 15 7.76345V8.02837C14.3601 8.13865 13.7169 8.22412 13.0744 8.30954Z" /></svg>
              </span>
              <h2>Get In Touch</h2>
            </div>
          )}

          {/* ── Contact Info ── */}
          <div className="col-lg-5 col-md-10">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

              {/* Phone */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: '#f8f9fa', borderRadius: '12px', padding: '16px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#0081C9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <i className="bx bx-phone-call" style={{ color: '#fff', fontSize: '22px' }} />
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: '11px', color: '#888', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Phone</p>
                  <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#111' }}>+91 8078000781</p>
                  <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#111' }}>+91 8078000783</p>
                </div>
              </div>

              {/* Email */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: '#f8f9fa', borderRadius: '12px', padding: '16px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#0081C9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <i className="bx bx-at" style={{ color: '#fff', fontSize: '22px' }} />
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: '11px', color: '#888', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Email</p>
                  <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#111' }}>info@trivandrumtoptaxi.com</p>
                  <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#111' }}>sales@trivandrumtoptaxi.com</p>
                </div>
              </div>

              {/* Location */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: '#f8f9fa', borderRadius: '12px', padding: '16px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#0081C9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <i className="bx bx-map" style={{ color: '#fff', fontSize: '22px' }} />
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: '11px', color: '#888', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Location</p>
                  <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#111' }}>14-16 Broad Street, Deal CT14 6ES</p>
                </div>
              </div>

            </div>
          </div>

          {/* ── Contact Form ── */}
          <div className="col-lg-7 col-md-10">
            <div className="contact-form-area">
              <h3>Reach Us Anytime</h3>
              <form onSubmit={(e) => e.preventDefault()}>
                <div className="row">
                  <div className="col-12 mb-3">
                    <label style={{ fontSize: '13px', fontWeight: '500', color: '#555', marginBottom: '6px', display: 'block' }}>Name *</label>
                    <input type="text" placeholder="Your Name" style={{ width: '100%', height: '48px', padding: '0 16px', border: '1px solid #eee', borderRadius: '8px', background: '#fff', outline: 'none' }} required />
                  </div>
                  <div className="col-6 mb-3">
                    <label style={{ fontSize: '13px', fontWeight: '500', color: '#555', marginBottom: '6px', display: 'block' }}>Phone</label>
                    <input type="text" placeholder="Phone Number" style={{ width: '100%', height: '48px', padding: '0 16px', border: '1px solid #eee', borderRadius: '8px', background: '#fff', outline: 'none' }} />
                  </div>
                  <div className="col-6 mb-3">
                    <label style={{ fontSize: '13px', fontWeight: '500', color: '#555', marginBottom: '6px', display: 'block' }}>Email</label>
                    <input type="email" placeholder="Your Email" style={{ width: '100%', height: '48px', padding: '0 16px', border: '1px solid #eee', borderRadius: '8px', background: '#fff', outline: 'none' }} />
                  </div>
                  <div className="col-12 mb-3">
                    <label style={{ fontSize: '13px', fontWeight: '500', color: '#555', marginBottom: '6px', display: 'block' }}>Subject *</label>
                    <input type="text" placeholder="Your Subject" style={{ width: '100%', height: '48px', padding: '0 16px', border: '1px solid #eee', borderRadius: '8px', background: '#fff', outline: 'none' }} required />
                  </div>
                  <div className="col-12 mb-4">
                    <label style={{ fontSize: '13px', fontWeight: '500', color: '#555', marginBottom: '6px', display: 'block' }}>Message *</label>
                    <textarea placeholder="What's on your mind..." style={{ width: '100%', height: '130px', padding: '14px 16px', border: '1px solid #eee', borderRadius: '8px', background: '#fff', resize: 'none', outline: 'none' }} required></textarea>
                  </div>
                  <div className="col-12">
                    <button type="submit" className="primary-btn1 !bg-[#0081C9] !text-white hover:!bg-[#006096] transition-colors" style={{ border: 'none', cursor: 'pointer', padding: '14px', width: '100%', borderRadius: '8px', fontSize: '16px', fontWeight: '700' }}>
                      Submit Now
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
