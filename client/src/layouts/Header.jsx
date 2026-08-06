import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Pages that are handled by hardcoded routes — shown first, always visible
const STATIC_NAV = [
  { label: 'Home', path: '/' },
  { label: 'Transport', path: '/transports' },
  { label: 'Destinations', path: '/destinations' },
];

// Pages that will be injected from DB between static and trailing items
// Any page whose slug matches a key below will be placed at the given position
const TRAILING_NAV = [
  { label: 'Blog', path: '/blogs' },
  { label: 'Contact Us', path: '/contact' },
];

// Slugs we never want to show in nav (they're handled by hardcoded routes or hidden)
const EXCLUDED_SLUGS = new Set([
  'home', 'tours', 'destinations', 'blogs', 'blog', 'contact', 'contact-us',
  'login', 'register', 'dashboard', 'profile',
]);

export default function Header() {
  const location = useLocation();
  const { user, logout } = useAuth() || {};
  const [mobileOpen, setMobileOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const servicesRef = useRef(null);
  const userDropdownRef = useRef(null);

  const SERVICES_NAV = [
    { label: 'Activities', path: '/activities' },
    { label: 'Tours', path: '/tours' },
    { label: 'All Visa', path: '/visas' },
  ];

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (servicesRef.current && !servicesRef.current.contains(e.target)) {
        setServicesOpen(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const hasServices = SERVICES_NAV.length > 0;

  return (
    <>
      <header className="header-area style-1">
        {/* ── Logo ── */}
        <div className="company-logo d-lg-flex d-none">
          <Link to="/">
            <img src="/frontend/logo.png" alt="GATEWAY" style={{ maxHeight: '50px', width: 'auto' }} />
          </Link>
        </div>

        {/* Mobile Logo */}
        <div className="header-logo d-lg-none d-flex">
          <Link to="/">
            <img className="img-fluid" src="/frontend/logo.jpeg" alt="Logo" style={{ maxHeight: '40px', width: 'auto' }} />
          </Link>
        </div>

        {/* ── Desktop Main Menu ── */}
        <div className={`main-menu d-none d-lg-block`}>
          {/* Mobile top bar */}
          <div className="mobile-logo-area d-lg-none d-flex justify-content-between align-items-center">
            <div className="mobile-logo-wrap">
              <Link to="/"><img src="/frontend/logo.jpeg" alt="Logo" style={{ maxHeight: '35px', width: 'auto' }} /></Link>
            </div>
            <div className="menu-close-btn" onClick={() => setMobileOpen(false)}>
              <i className="bi bi-x" />
            </div>
          </div>

          <ul className="menu-list">
            {/* Static items */}
            {STATIC_NAV.map(item => (
              <li key={item.path}>
                <Link to={item.path} className={`${isActive(item.path) ? 'active !text-[#0081C9]' : ''} hover:!text-[#0081C9] transition-colors`}>
                  {item.label}
                </Link>
              </li>
            ))}

            {/* About Us - always present */}
            <li>
              <Link to="/about" className={`${isActive('/about') ? 'active !text-[#0081C9]' : ''} hover:!text-[#0081C9] transition-colors`}>About Us</Link>
            </li>

            {/* Services dropdown — powered by dynamic DB pages */}
            {hasServices && (
              <li className="menu-item-has-children" ref={servicesRef} style={{ position: 'relative' }}>
                <a
                  href="#"
                  className={`${SERVICES_NAV.some(p => isActive(p.path)) ? 'active !text-[#0081C9]' : ''} hover:!text-[#0081C9] transition-colors`}
                  onClick={e => { e.preventDefault(); setServicesOpen(o => !o); }}
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                >
                  Services
                </a>
                {servicesOpen && (
                  <ul className="sub-menu" style={{ display: 'block' }}>
                    {SERVICES_NAV.map(page => (
                      <li key={page.path}>
                        <Link
                          to={page.path}
                          className={`${isActive(page.path) ? 'active !text-[#0081C9]' : ''} hover:!text-[#0081C9] transition-colors`}
                          onClick={() => { setServicesOpen(false); setMobileOpen(false); }}
                        >
                          {page.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            )}

            {/* Trailing static items */}
            {TRAILING_NAV.map(item => (
              <li key={item.path}>
                <Link to={item.path} className={`${isActive(item.path) ? 'active !text-[#0081C9]' : ''} hover:!text-[#0081C9] transition-colors`}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>


        </div>
        {/* ── Right side ── */}
        <div className="nav-right d-flex justify-content-end align-items-center gap-3">
          {user ? (
            <div ref={userDropdownRef} style={{ position: 'relative' }}>
              <div
                className="d-flex align-items-center gap-2"
                onClick={() => setUserDropdownOpen(o => !o)}
                style={{ textDecoration: 'none', cursor: 'pointer', userSelect: 'none' }}
              >
                <div className="d-flex flex-column justify-content-center">
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#666', lineHeight: 1 }}>Hello,</span>
                  <span style={{ color: '#111', fontSize: '16px', fontWeight: 900, lineHeight: 1.2, marginTop: '2px' }}>
                    {user.name?.split(' ')[0] || 'User'} <i className="bi bi-chevron-down" style={{ fontSize: '12px', marginLeft: '2px' }} />
                  </span>
                </div>
              </div>

              {userDropdownOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: '10px',
                    backgroundColor: 'white',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    minWidth: '160px',
                    zIndex: 9999
                  }}
                >
                  <Link to="/dashboard" onClick={() => setUserDropdownOpen(false)} style={{ display: 'block', padding: '10px 15px', color: '#333', textDecoration: 'none', fontWeight: 600, borderBottom: '1px solid #f1f1f1' }}>
                    Dashboard
                  </Link>
                  <Link to="/profile" onClick={() => setUserDropdownOpen(false)} style={{ display: 'block', padding: '10px 15px', color: '#333', textDecoration: 'none', fontWeight: 600, borderBottom: '1px solid #f1f1f1' }}>
                    Profile
                  </Link>
                  <a href="#" onClick={(e) => { e.preventDefault(); if (logout) logout(); setUserDropdownOpen(false); }} style={{ display: 'block', padding: '10px 15px', color: '#d32f2f', textDecoration: 'none', fontWeight: 600 }}>
                    Logout
                  </a>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="btn btn-sm" style={{
              backgroundColor: '#0081C9',
              color: 'white',
              padding: '8px 20px',
              fontSize: '14px',
              fontWeight: 'bold',
              borderRadius: '6px',
              textDecoration: 'none'
            }}>
              Login
            </Link>
          )}

          {/* Mobile hamburger */}
          <div className="sidebar-button mobile-menu-btn d-lg-none" onClick={() => setMobileOpen(true)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 25 25">
              <path d="M0 4.46439C0 4.70119 0.0940685 4.92829 0.261511 5.09574C0.428955 5.26318 0.656057 5.35725 0.892857 5.35725H24.1071C24.3439 5.35725 24.571 5.26318 24.7385 5.09574C24.9059 4.92829 25 4.70119 25 4.46439C25 4.22759 24.9059 4.00049 24.7385 3.83305C24.571 3.6656 24.3439 3.57153 24.1071 3.57153H0.892857C0.656057 3.57153 0.428955 3.6656 0.261511 3.83305C0.0940685 4.00049 0 4.22759 0 4.46439ZM4.46429 11.6072H24.1071C24.3439 11.6072 24.571 11.7013 24.7385 11.8688C24.9059 12.0362 25 12.2633 25 12.5001C25 12.7369 24.9059 12.964 24.7385 13.1315C24.571 13.2989 24.3439 13.393 24.1071 13.393H4.46429C4.22749 13.393 4.00038 13.2989 3.83294 13.1315C3.6655 12.964 3.57143 12.7369 3.57143 12.5001C3.57143 12.2633 3.6655 12.0362 3.83294 11.8688C4.00038 11.7013 4.22749 11.6072 4.46429 11.6072ZM12.5 19.643H24.1071C24.3439 19.643 24.571 19.737 24.7385 19.9045C24.9059 20.0719 25 20.299 25 20.5358C25 20.7726 24.9059 20.9997 24.7385 21.1672C24.571 21.3346 24.3439 21.4287 24.1071 21.4287H12.5C12.2632 21.4287 12.0361 21.3346 11.8687 21.1672C11.7012 20.9997 11.6071 20.7726 11.6071 20.5358C11.6071 20.299 11.7012 20.0719 11.8687 19.9045C12.0361 19.737 12.2632 19.643 12.5 19.643Z" />
            </svg>
          </div>
        </div>
      </header>

      {/* ── Premium Mobile Menu (Tailwind) ── */}
      <div
        className={`fixed inset-0 z-[1000] lg:hidden transition-all duration-500 ease-in-out ${mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-500 ${mobileOpen ? 'opacity-100' : 'opacity-0'
            }`}
          onClick={() => setMobileOpen(false)}
        />

        {/* Sidebar */}
        <div
          className={`absolute top-0 left-0 w-[85%] max-w-[360px] h-full bg-[#0f172a] border-r border-slate-800 shadow-2xl flex flex-col transition-transform duration-500 ease-in-out ${mobileOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-slate-800/60 bg-[#0f172a]">
            <Link to="/" onClick={() => setMobileOpen(false)}>
              <img src="/frontend/logo.jpeg" alt="Logo" className="w-[120px] rounded-sm" />
            </Link>
            <button
              onClick={() => setMobileOpen(false)}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
            >
              <i className="bi bi-x text-2xl" />
            </button>
          </div>

          {/* Links */}
          <div className="flex-1 overflow-y-auto py-6 px-4 scrollbar-dark">
            {user ? (
              <div className="mb-6 pb-6 border-b border-slate-800/60 flex items-center justify-between">
                <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 no-underline">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Hello,</span>
                    <span className="text-[14px] font-bold text-white">{user.name?.split(' ')[0] || 'User'}</span>
                  </div>
                </Link>
                <button
                  onClick={() => { if (logout) logout(); setMobileOpen(false); }}
                  className="bg-red-500/10 text-red-400 border border-red-500/20 px-3 py-1.5 rounded-lg text-xs font-bold"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="mb-6 pb-6 border-b border-slate-800/60">
                <Link to="/login" onClick={() => setMobileOpen(false)} className="w-full flex items-center justify-center gap-2 bg-[#0081C9] hover:bg-green-600 text-white py-3 px-4 rounded-xl font-bold transition-colors no-underline">
                  <i className="bi bi-box-arrow-in-right text-lg" />
                  <span>Login / Register</span>
                </Link>
              </div>
            )}
            <ul className="flex flex-col gap-2 m-0 p-0">
              {STATIC_NAV.map(item => (
                <li key={item.path} style={{ listStyle: 'none' }}>
                  <Link
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    className={`block px-4 py-3 rounded-xl text-base font-bold tracking-wide transition-all no-underline ${isActive(item.path)
                      ? 'bg-[#0081C9]/10 text-[#0081C9]'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}

              {/* About Us */}
              <li style={{ listStyle: 'none' }}>
                <Link
                  to="/about"
                  onClick={() => setMobileOpen(false)}
                  className={`block px-4 py-3 rounded-xl text-base font-bold tracking-wide transition-all no-underline ${isActive('/about')
                    ? 'bg-[#0081C9]/10 text-[#0081C9]'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                >
                  About Us
                </Link>
              </li>

              {/* Services */}
              {hasServices && (
                <li style={{ listStyle: 'none' }}>
                  <button
                    onClick={() => setServicesOpen(!servicesOpen)}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-base font-bold tracking-wide text-slate-300 hover:bg-slate-800 hover:text-white transition-all bg-transparent border-0"
                  >
                    <span>Services</span>
                    <i className={`bi bi-chevron-down transition-transform duration-300 ${servicesOpen ? 'rotate-180' : ''}`} />
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${servicesOpen ? 'max-h-96 opacity-100 mt-2' : 'max-h-0 opacity-0'
                      }`}
                  >
                    <ul className="flex flex-col gap-1 pl-4 pr-2 border-l-2 border-slate-800/80 ml-4 m-0 p-0">
                      {SERVICES_NAV.map(page => (
                        <li key={page.path} style={{ listStyle: 'none' }}>
                          <Link
                            to={page.path}
                            onClick={() => { setServicesOpen(false); setMobileOpen(false); }}
                            className={`block px-4 py-2 rounded-lg text-sm font-semibold transition-all no-underline ${isActive(page.path)
                              ? 'text-[#0081C9] bg-slate-800/50'
                              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                              }`}
                          >
                            {page.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </li>
              )}

              {/* Trailing items */}
              {TRAILING_NAV.map(item => (
                <li key={item.path} style={{ listStyle: 'none' }}>
                  <Link
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    className={`block px-4 py-3 rounded-xl text-base font-bold tracking-wide transition-all no-underline ${isActive(item.path)
                      ? 'bg-[#0081C9]/10 text-[#0081C9]'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Footer of Menu */}
          <div className="p-6 border-t border-slate-800/60 bg-slate-900/30">
            <p className="text-slate-500 text-xs font-semibold text-center m-0">© 2026 GATEWAY Tours & Travels.</p>
          </div>
        </div>
      </div>
    </>
  );
}
