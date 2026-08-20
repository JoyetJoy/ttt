import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <>
      {/* ─── Newsletter Top Box (Floating) ─── */}
      <div className="container position-relative" style={{ zIndex: 10 }}>
        <div
          className="newsletter-wrapper bg-white text-center shadow-lg mx-3 lg:mx-24 position-relative overflow-hidden"
          style={{
            borderRadius: '20px',
            padding: '60px 20px',
            marginBottom: '-120px', // Negative margin to pull the dark footer up behind it
          }}
        >
          {/* Leaf Background Images */}
          <img
            src="/frontend/img/leaf-left.png"
            alt=""
            style={{ position: 'absolute', top: 0, left: 0, height: '100%', objectFit: 'contain', opacity: 0.9, pointerEvents: 'none' }}
          />
          <img
            src="/frontend/img/leaf-right.png"
            alt=""
            style={{ position: 'absolute', top: 0, right: 0, height: '100%', objectFit: 'contain', opacity: 0.9, pointerEvents: 'none' }}
          />

          <div className="position-relative" style={{ zIndex: 1 }}>
            <h2 className="fw-bolder text-dark mb-2" style={{ fontSize: '36px' }}>Join The Newsletter</h2>
            <p className="text-dark mb-4" style={{ fontSize: '15px' }}>To receive our best monthly deals</p>

            <div className="mx-auto" style={{ maxWidth: '550px' }}>
              <div className="d-flex align-items-stretch" style={{ border: '1px solid #e0e0e0', borderRadius: '8px', overflow: 'hidden', background: '#fcfcfc' }}>
                <input
                  type="email"
                  className="form-control border-0 shadow-none px-3 py-3 w-100"
                  placeholder="Enter Your Email..."
                  style={{ background: 'transparent', fontSize: '15px' }}
                />
                <button
                  className="btn text-white px-4 d-flex align-items-center justify-content-center"
                  style={{ background: '#0081C9', border: 'none', borderRadius: 0, width: '60px' }}
                >
                  <i className="bi bi-arrow-right fs-5"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="footer-section m-0 px-4 lg:px-24" style={{ backgroundColor: '#011132', backgroundImage: 'none', color: '#c4c8c5', paddingTop: '180px', borderRadius: '0' }}>
        <div className="container">

          <div className="footer-top pb-5">
            <div className="row gy-5">

              {/* Column 1: Logo & CTA */}
              <div className="col-lg-3 col-md-6">
                <div className="footer-widget">
                  <div className="footer-logo mb-4">
                    <Link to="/">
                      <img
                        src="/frontend/logo.png"
                        alt="Trivandrum Top Taxi Logo"
                        style={{ width: '180px', borderRadius: '16px', padding: '4px' }}
                      />
                    </Link>
                  </div>
                  <h3 className="text-white fw-bold mb-4" style={{ fontSize: '26px', lineHeight: '1.4' }}>
                    Want To Take Tour<br />Packages?
                  </h3>
                  <Link to="/tours" className="primary-btn1 d-inline-block px-4 py-3 fw-bold" style={{ background: '#0081C9', borderRadius: '6px', color: '#fff', textDecoration: 'none' }}>
                    Explore Tours
                  </Link>
                </div>
              </div>

              {/* Column 2: Quick link */}
              <div className="col-lg-2 col-md-6">
                <div className="footer-widget">
                  <h5 className="text-white fw-bold mb-4">Quick link</h5>
                  <ul className="list-unstyled" style={{ lineHeight: '2.4' }}>
                    <li><Link to="/about" className="text-decoration-none" style={{ color: '#c4c8c5' }}>About Us</Link></li>
                    <li><Link to="/tours" className="text-decoration-none" style={{ color: '#c4c8c5' }}>Tours</Link></li>
                    <li><Link to="/visa" className="text-decoration-none" style={{ color: '#c4c8c5' }}>All Visa</Link></li>
                    <li><Link to="/terms" className="text-decoration-none" style={{ color: '#c4c8c5' }}>Terms and Conditions</Link></li>
                    <li><Link to="/contact" className="text-decoration-none" style={{ color: '#c4c8c5' }}>Contact Us</Link></li>
                  </ul>
                </div>
              </div>

              {/* Column 3: Contact Info */}
              <div className="col-lg-3 col-md-6">
                <div className="footer-widget">

                  <div className="mb-4">
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <i className="bx bxs-phone text-warning fs-5"></i>
                      <h5 className="text-white fw-bold mb-0" style={{ fontSize: '16px' }}>More Inquiry</h5>
                    </div>
                    <a href="tel:+918078000781" className="text-decoration-none d-block ms-4 ps-1" style={{ color: '#c4c8c5' }}>+91 8078000781</a>
                    <a href="tel:+918078000783" className="text-decoration-none d-block ms-4 ps-1" style={{ color: '#c4c8c5' }}>+91 8078000783</a>
                  </div>

                  <div className="mb-4">
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <i className="bx bxs-send text-warning fs-5"></i>
                      <h5 className="text-white fw-bold mb-0" style={{ fontSize: '16px' }}>Send Mail</h5>
                    </div>
                    <a href="mailto:info@trivandrumtoptaxi.com" className="text-decoration-none d-block ms-4 ps-1" style={{ color: '#c4c8c5' }}>info@trivandrumtoptaxi.com</a>
                  </div>

                  <div className="mb-4">
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <i className="bx bxs-map text-warning fs-5"></i>
                      <h5 className="text-white fw-bold mb-0" style={{ fontSize: '16px' }}>Address</h5>
                    </div>
                    <p className="ms-4 ps-1 mb-0" style={{ color: '#c4c8c5' }}>14-16 Broad Street, Deal CT14 6ES</p>
                  </div>

                </div>
              </div>

              {/* Column 4: About & Payments */}
              <div className="col-lg-4 col-md-6">
                <div className="footer-widget">
                  <h5 className="text-white fw-bold mb-4">Find About Trivandrum Top Taxi</h5>
                  <p style={{ color: '#c4c8c5', lineHeight: '1.8' }} className="mb-4">
                    Welcome to Trivandrum Top Taxi where every journey begins with a dream and ends with unforgettable memories. Our travel specialists have in-depth knowledge of destinations worldwide.
                  </p>

                  <div className="payment-partner mt-4">
                    <h5 className="text-white fw-bold mb-3">Payment Partner</h5>
                    <div className="d-flex align-items-center gap-2 flex-wrap">
                      {/* Assuming these are individual images or a single sprite block. Will use the existing single image if that's what's there, else text placeholders */}
                      <img src="/frontend/img/payment.png" alt="Payment Partners" style={{ maxWidth: '100%' }} />
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* ─── Footer Bottom Bar ─── */}
          <div className="footer-bottom py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <div className="row align-items-center">

              <div className="col-lg-4 col-md-12 mb-3 mb-lg-0 text-center text-lg-start">
                <ul className="list-inline mb-0 d-flex justify-content-center justify-content-lg-start gap-2">
                  <li className="list-inline-item">
                    <a href="#" className="d-flex align-items-center justify-content-center rounded-circle border border-secondary" style={{ width: '35px', height: '35px', color: '#c4c8c5', textDecoration: 'none' }}>
                      <i className="bx bxl-facebook"></i>
                    </a>
                  </li>
                  <li className="list-inline-item">
                    <a href="#" className="d-flex align-items-center justify-content-center rounded-circle border border-secondary" style={{ width: '35px', height: '35px', color: '#c4c8c5', textDecoration: 'none' }}>
                      <i className="bx bxl-twitter"></i>
                    </a>
                  </li>
                  <li className="list-inline-item">
                    <a href="#" className="d-flex align-items-center justify-content-center rounded-circle border border-secondary" style={{ width: '35px', height: '35px', color: '#c4c8c5', textDecoration: 'none' }}>
                      <i className="bx bxl-linkedin"></i>
                    </a>
                  </li>
                  <li className="list-inline-item">
                    <a href="#" className="d-flex align-items-center justify-content-center rounded-circle border border-secondary" style={{ width: '35px', height: '35px', color: '#c4c8c5', textDecoration: 'none' }}>
                      <i className="bx bxl-youtube"></i>
                    </a>
                  </li>
                  <li className="list-inline-item">
                    <a href="#" className="d-flex align-items-center justify-content-center rounded-circle border border-secondary" style={{ width: '35px', height: '35px', color: '#c4c8c5', textDecoration: 'none' }}>
                      <i className="bx bxl-instagram"></i>
                    </a>
                  </li>
                  <li className="list-inline-item">
                    <a href="#" className="d-flex align-items-center justify-content-center rounded-circle border border-secondary" style={{ width: '35px', height: '35px', color: '#c4c8c5', textDecoration: 'none' }}>
                      <i className="bx bxl-pinterest"></i>
                    </a>
                  </li>
                </ul>
              </div>

              <div className="col-lg-4 col-md-12 mb-3 mb-lg-0 text-center">
                <p className="mb-0" style={{ fontSize: '14px' }}>
                  Copyright 2026 Trivandrum Top Taxi | Powered by Eayila consulting
                </p>
              </div>

              <div className="col-lg-4 col-md-12 text-center text-lg-end">
                <p className="mb-0 fw-bold" style={{ fontSize: '14px', color: '#fff' }}>
                  Terms and Conditions &nbsp; &bull; &nbsp; Security Information
                </p>
              </div>

            </div>
          </div>

        </div>
      </footer>
    </>
  );
}
