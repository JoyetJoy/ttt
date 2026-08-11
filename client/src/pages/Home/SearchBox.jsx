import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/* ─── Mobile-card dropdown ─── */
function MobileDropdown({ icon, label, placeholder, options, value, onChange, name }) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setIsOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <input type="hidden" name={name} value={value || ''} />
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          background: '#fff', borderRadius: '10px',
          padding: '12px 15px', cursor: 'pointer',
          boxShadow: '0 1px 4px rgba(0,0,0,0.07)', marginBottom: '10px'
        }}
      >
        <span style={{ color: '#0081C9', fontSize: '22px', lineHeight: 1 }}>{icon}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '11px', color: '#888', fontWeight: '500', lineHeight: 1 }}>{label}</div>
          <div style={{ fontSize: '14px', fontWeight: '700', color: '#222', marginTop: '2px' }}>{value || placeholder}</div>
        </div>
        <i className={`bi bi-chevron-${isOpen ? 'up' : 'down'}`} style={{ color: '#888', fontSize: '13px' }} />
      </div>

      {isOpen && (
        <div style={{
          position: 'absolute', left: 0, right: 0, top: '100%', background: '#fff',
          borderRadius: '10px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 2000,
          overflow: 'hidden', maxHeight: '260px', overflowY: 'auto', marginTop: '2px'
        }}>
          {options.map((opt, i) => (
            <div
              key={i}
              onClick={() => { onChange && onChange(opt.name); setIsOpen(false); }}
              style={{
                padding: '11px 15px', cursor: 'pointer',
                borderBottom: i < options.length - 1 ? '1px solid #f0f0f0' : 'none',
                fontSize: '14px', fontWeight: '600', color: '#222'
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#f8fffe'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              {opt.name}
              {opt.subtitle && <div style={{ fontSize: '12px', color: '#888', fontWeight: '400' }}>{opt.subtitle}</div>}
            </div>
          ))}
          {options.length === 0 && (
            <div style={{ padding: '16px', textAlign: 'center', color: '#aaa', fontSize: '13px' }}>No options found</div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Desktop inline dropdown ─── */
function DesktopDropdown({ name, placeholder, options, value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef(null);

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setIsOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const filtered = options.filter(o => o.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="position-relative w-100" ref={ref}>
      <input type="hidden" name={name} value={value || ''} />
      <div className="d-flex justify-content-between align-items-center" style={{ cursor: 'pointer' }} onClick={() => setIsOpen(!isOpen)}>
        <div className="fw-bold text-dark" style={{ fontSize: '14px' }}>{value || placeholder}</div>
        <i className={`bi bi-chevron-${isOpen ? 'up' : 'down'} text-dark`} style={{ fontSize: '12px' }} />
      </div>
      {isOpen && (
        <div className="position-absolute bg-white shadow-lg rounded-3"
          style={{ top: '100%', left: '-40px', width: '300px', zIndex: 1000, marginTop: '15px', overflow: 'hidden' }}>
          <div className="p-3 border-bottom d-flex align-items-center gap-2">
            <i className="bi bi-search" style={{ color: '#0081C9', fontSize: '18px' }} />
            <input type="text" className="border-0 w-100 shadow-none bg-transparent"
              placeholder={`Type Your ${placeholder.replace('Select ', '')}`}
              value={search} onChange={e => setSearch(e.target.value)}
              style={{ outline: 'none', color: '#666', fontSize: '15px' }} />
          </div>
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {filtered.map((opt, idx) => (
              <div key={idx}
                className="d-flex justify-content-between align-items-center p-3 border-bottom"
                style={{ cursor: 'pointer', transition: 'background 0.2s' }}
                onClick={() => { onChange && onChange(opt.name); setIsOpen(false); setSearch(''); }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                <div>
                  <div className="fw-bold text-dark" style={{ fontSize: '15px' }}>{opt.name}</div>
                  {opt.subtitle && <div style={{ fontSize: '13px', color: '#888' }}>{opt.subtitle}</div>}
                </div>
                {opt.badgeText ? (
                  <div className="d-flex align-items-center justify-content-center text-white rounded-circle fw-bold"
                    style={{ background: '#0081C9', width: '40px', height: '40px', fontSize: '14px' }}>
                    {opt.badgeText}
                  </div>
                ) : (
                  <div className="d-flex flex-column align-items-center justify-content-center text-white rounded-circle"
                    style={{ background: '#0081C9', width: '40px', height: '40px', fontSize: '11px', lineHeight: 1.1 }}>
                    <span className="fw-bold" style={{ fontSize: '14px' }}>{opt.tours || 1}</span>
                    <span>Tour</span>
                  </div>
                )}
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="p-4 text-center text-muted" style={{ fontSize: '14px' }}>No options found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Tab button styles ─── */
const TAB_GREEN = '#0081C9';
const TAB_BG = '#f5faeb';

function TabButton({ label, icon, active, onClick, borderRadius }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        flex: 1,
        background: active ? TAB_GREEN : TAB_BG,
        color: active ? '#fff' : '#333',
        border: 'none',
        padding: '10px 8px',
        fontWeight: '700',
        fontSize: '13px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        borderRadius: borderRadius || '0',
        cursor: 'pointer',
        transition: 'all 0.2s'
      }}
    >
      <span style={{ fontSize: '17px', lineHeight: 1 }}>{icon}</span>
      {label}
    </button>
  );
}

export default function SearchBox({ config, initialTab }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(initialTab || 'transport');
  const [searchValues, setSearchValues] = useState({});

  const setField = (field, val) => setSearchValues(prev => ({ ...prev, [field]: val }));

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    params.set('type', activeTab);
    Object.entries(searchValues).forEach(([k, v]) => { if (v) params.set(k, v); });
    navigate(`/search?${params.toString()}`);
  };

  const handleTabClick = (tab) => { setActiveTab(tab); setSearchValues({}); };

  const [destinationOptions, setDestinationOptions] = useState([
    { name: 'Japan', subtitle: 'Japan', tours: 15 },
    { name: 'France', subtitle: 'France', tours: 8 },
    { name: 'Italy', subtitle: 'Italy', tours: 12 },
    { name: 'Switzerland', subtitle: 'Switzerland', tours: 5 },
    { name: 'Argentina', subtitle: 'Argentina', tours: 2 }
  ]);
  const [transportTypeOptions, setTransportTypeOptions] = useState([
    { name: 'Bus', subtitle: 'Standard Bus' },
    { name: 'Private Car', subtitle: 'Luxury' },
    { name: 'Train', subtitle: 'Railway' }
  ]);
  const [transportLocationOptions, setTransportLocationOptions] = useState([]);
  const [allTours, setAllTours] = useState([]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/destinations`)
      .then(r => r.json()).then(data => {
        if (data?.destinations?.length > 0)
          setDestinationOptions(data.destinations.map(d => ({
            name: d.title || d.name || 'Destination',
            subtitle: d.city || d.short_desc?.substring(0, 20) || d.title,
            tours: d.tours || 1, id: d.id
          })));
      }).catch(() => {});

    fetch(`${import.meta.env.VITE_API_URL}/tours`)
      .then(r => r.json()).then(data => setAllTours(data || [])).catch(() => {});

    fetch(`${import.meta.env.VITE_API_URL}/transports/vehicle-types`)
      .then(r => r.json()).then(data => {
        if (Array.isArray(data) && data.length > 0)
          setTransportTypeOptions(data.map(t => ({ name: t.name, subtitle: 'Vehicle Type' })));
      }).catch(() => {});

    fetch(`${import.meta.env.VITE_API_URL}/transports/locations`)
      .then(r => r.json()).then(data => {
        if (Array.isArray(data) && data.length > 0)
          setTransportLocationOptions(data.map(l => ({ name: l.name, subtitle: 'Transport Location' })));
      }).catch(() => {});
  }, []);

  const tourTypeOptions = (() => {
    const types = [...new Set(allTours.map(t => t.tour_type).filter(Boolean))];
    if (types.length > 0) return types.map(t => ({ name: t, subtitle: t }));
    return [
      { name: 'Adventure', subtitle: 'Action packed' },
      { name: 'City Tour', subtitle: 'Urban exploration' },
      { name: 'Honeymoon', subtitle: 'Romantic getaways' },
      { name: 'Nature', subtitle: 'Wildlife & Scenery' }
    ];
  })();

  const monthOptions = (() => {
    const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    const counts = {};
    allTours.forEach(t => { if (t.created_at) { const m = new Date(t.created_at).getMonth(); counts[m] = (counts[m] || 0) + 1; } });
    const dynamic = Object.entries(counts).map(([m, c]) => ({ name: monthNames[parseInt(m)], subtitle: `${c} tour${c > 1 ? 's' : ''} available`, tours: c }));
    return dynamic.length > 0 ? dynamic : monthNames.map(name => ({ name, subtitle: 'Tours available' }));
  })();

  const durationOptions = (() => {
    const durations = [...new Set(allTours.map(t => t.duration).filter(Boolean))].sort((a, b) => parseInt(a) - parseInt(b));
    if (durations.length > 0) return durations.map(d => ({ name: `${d} ${parseInt(d) === 1 ? 'Day' : 'Days'}`, subtitle: `${allTours.filter(t => t.duration == d).length} tour(s)`, tours: allTours.filter(t => t.duration == d).length, value: d }));
    return [{ name: '1-3 Days', subtitle: 'Short weekend trips' }, { name: '4-7 Days', subtitle: 'Standard week tours' }, { name: '8+ Days', subtitle: 'Extended holidays' }];
  })();

  /* ── Content radius helper ── */
  const contentRadius = () => {
    if (activeTab === 'transport') return '0 8px 8px 8px';
    if (activeTab === 'visa') return '8px 0 8px 8px';
    return '8px 8px 8px 8px';
  };

  return (
    <div className="home1-banner-bottom">
      <div className="container-fluid px-0">
        <div className="filter-wrapper">

          {/* ─── DESKTOP TABS (hidden on mobile) ─── */}
          <div className="d-none d-md-block nav-buttons" style={{ marginBottom: 0 }}>
            <ul className="nav d-flex align-items-end" role="tablist" style={{ borderBottom: 'none', margin: '0 auto', padding: 0, gap: 0, width: 'fit-content' }}>
              {[
                { key: 'transport', label: 'Transport', icon: <i className="bx bx-car" /> },
                { key: 'tour', label: 'Tour', icon: <i className="bi bi-geo-alt" /> },
                { key: 'activities', label: 'Activities', icon: <i className="bx bx-target-lock" /> },
                { key: 'visa', label: 'Visa', icon: <i className="bx bx-id-card" /> },
              ].map((tab, idx, arr) => (
                <li key={tab.key} role="presentation" style={{ margin: 0, padding: 0 }}>
                  <button
                    className={`nav-link ${activeTab === tab.key ? 'active' : ''}`}
                    onClick={() => handleTabClick(tab.key)}
                    type="button"
                    style={{
                      background: activeTab === tab.key ? TAB_GREEN : '#f5faeb',
                      color: activeTab === tab.key ? '#fff' : '#111',
                      borderRadius: idx === 0 ? '8px 0 0 0' : idx === arr.length - 1 ? '0 8px 0 0' : '0',
                      border: 'none',
                      padding: '10px 28px',
                      fontWeight: '700',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '7px',
                      fontSize: '14px'
                    }}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* ─── MOBILE TABS 2×2 GRID (hidden on desktop) ─── */}
          <div className="d-md-none" style={{ marginBottom: 0 }}>
            {/* Row 1: Transport | Tour */}
            <div style={{ display: 'flex', gap: 0 }}>
              <TabButton
                label="Transport" icon={<i className="bx bx-car" />}
                active={activeTab === 'transport'}
                onClick={() => handleTabClick('transport')}
                borderRadius="8px 0 0 0"
              />
              <TabButton
                label="Tour" icon={<i className="bi bi-geo-alt" />}
                active={activeTab === 'tour'}
                onClick={() => handleTabClick('tour')}
                borderRadius="0 8px 0 0"
              />
            </div>
            {/* Row 2: Activities | Visa */}
            <div style={{ display: 'flex', gap: 0 }}>
              <TabButton
                label="Activities" icon={<i className="bx bx-target-lock" />}
                active={activeTab === 'activities'}
                onClick={() => handleTabClick('activities')}
                borderRadius="0"
              />
              <TabButton
                label="Visa" icon={<i className="bx bx-id-card" />}
                active={activeTab === 'visa'}
                onClick={() => handleTabClick('visa')}
                borderRadius="0"
              />
            </div>
          </div>

          {/* ─── TAB CONTENT ─── */}
          <div style={{
            background: '#f5faeb',
            padding: '16px',
            borderRadius: contentRadius(),
            marginTop: 0
          }}>

            {/* ── DESKTOP LAYOUT: horizontal row ── */}
            <div className="d-none d-md-block">
              <form onSubmit={handleSearch}>
                <div className="style-two">
                  {activeTab === 'tour' && (
                    <div className="search-box d-flex align-items-center" style={{ gap: '15px' }}>
                      <div className="search-input flex-grow-1 d-flex align-items-center gap-3 w-100" style={{ borderRight: '1px solid rgba(0,0,0,0.08)', paddingRight: '15px' }}>
                        <i className="bi bi-geo-alt" style={{ fontSize: '24px', color: TAB_GREEN }} />
                        <div className="form-group mb-0 flex-grow-1">
                          <label style={{ fontSize: '11px', color: '#888', fontWeight: '500', marginBottom: '2px', display: 'block' }}>Destination</label>
                          <DesktopDropdown name="destination" placeholder="Select Destination" options={destinationOptions} value={searchValues.destination} onChange={v => setField('destination', v)} />
                        </div>
                      </div>
                      <div className="search-input flex-grow-1 d-flex align-items-center gap-3 w-100" style={{ borderRight: '1px solid rgba(0,0,0,0.08)', paddingRight: '15px' }}>
                        <i className="bx bx-briefcase" style={{ fontSize: '24px', color: TAB_GREEN }} />
                        <div className="form-group mb-0 flex-grow-1">
                          <label style={{ fontSize: '11px', color: '#888', fontWeight: '500', marginBottom: '2px', display: 'block' }}>Tour Type</label>
                          <DesktopDropdown name="tour_type" placeholder="Select Tour Type" options={tourTypeOptions} value={searchValues.tour_type} onChange={v => setField('tour_type', v)} />
                        </div>
                      </div>
                      <div className="search-input flex-grow-1 d-flex align-items-center gap-3 w-100" style={{ borderRight: '1px solid rgba(0,0,0,0.08)', paddingRight: '15px' }}>
                        <i className="bi bi-clock" style={{ fontSize: '24px', color: TAB_GREEN }} />
                        <div className="form-group mb-0 flex-grow-1">
                          <label style={{ fontSize: '11px', color: '#888', fontWeight: '500', marginBottom: '2px', display: 'block' }}>When</label>
                          <DesktopDropdown name="month" placeholder="Select Month" options={monthOptions} value={searchValues.month} onChange={v => setField('month', v)} />
                        </div>
                      </div>
                      <div className="search-input flex-grow-1 d-flex align-items-center gap-3 w-100">
                        <i className="bx bx-briefcase" style={{ fontSize: '24px', color: TAB_GREEN }} />
                        <div className="form-group mb-0 flex-grow-1">
                          <label style={{ fontSize: '11px', color: '#888', fontWeight: '500', marginBottom: '2px', display: 'block' }}>Tour Duration</label>
                          <DesktopDropdown name="duration" placeholder="Select Duration" options={durationOptions} value={searchValues.duration} onChange={v => setField('duration', v)} />
                        </div>
                      </div>
                      <div className="search-action">
                        <button type="submit" className="primary-btn1 px-5 py-3" style={{ background: TAB_GREEN, border: 'none', borderRadius: '4px', fontWeight: '700', fontSize: '16px', whiteSpace: 'nowrap' }}>Search</button>
                      </div>
                    </div>
                  )}
                  {activeTab === 'activities' && (
                    <div className="search-box d-flex align-items-center" style={{ gap: '15px' }}>
                      <div className="search-input flex-grow-1 d-flex align-items-center gap-3 w-100" style={{ borderRight: '1px solid rgba(0,0,0,0.08)', paddingRight: '15px' }}>
                        <i className="bi bi-geo-alt" style={{ fontSize: '24px', color: TAB_GREEN }} />
                        <div className="form-group mb-0 flex-grow-1">
                          <label style={{ fontSize: '11px', color: '#888', fontWeight: '500', marginBottom: '2px', display: 'block' }}>Location</label>
                          <DesktopDropdown name="location" placeholder="Select Location" options={destinationOptions} value={searchValues.location} onChange={v => setField('location', v)} />
                        </div>
                      </div>
                      <div className="search-input flex-grow-1 d-flex align-items-center gap-3 w-100" style={{ borderRight: '1px solid rgba(0,0,0,0.08)', paddingRight: '15px' }}>
                        <i className="bi bi-clock" style={{ fontSize: '24px', color: TAB_GREEN }} />
                        <div className="form-group mb-0 flex-grow-1">
                          <label style={{ fontSize: '11px', color: '#888', fontWeight: '500', marginBottom: '2px', display: 'block' }}>Activity Day</label>
                          <input type="date" name="date" className="border-0 bg-transparent p-0 shadow-none fw-bold text-dark w-100" style={{ fontSize: '14px', outline: 'none' }} />
                        </div>
                      </div>
                      <div className="search-input flex-grow-1 d-flex align-items-center gap-3 w-100">
                        <i className="bx bx-group" style={{ fontSize: '24px', color: TAB_GREEN }} />
                        <div className="form-group mb-0 flex-grow-1">
                          <label style={{ fontSize: '11px', color: '#888', fontWeight: '500', marginBottom: '2px', display: 'block' }}>Traveler</label>
                          <input type="number" name="travelers" min="1" defaultValue="2" className="border-0 bg-transparent p-0 shadow-none fw-bold text-dark w-100" style={{ fontSize: '14px', outline: 'none' }} />
                        </div>
                      </div>
                      <div className="search-action">
                        <button type="submit" className="primary-btn1 px-5 py-3" style={{ background: TAB_GREEN, border: 'none', borderRadius: '4px', fontWeight: '700', fontSize: '16px', whiteSpace: 'nowrap' }}>Search</button>
                      </div>
                    </div>
                  )}
                  {activeTab === 'visa' && (
                    <div className="search-box d-flex align-items-center" style={{ gap: '15px' }}>
                      <div className="search-input flex-grow-1 d-flex align-items-center gap-3 w-100" style={{ borderRight: '1px solid rgba(0,0,0,0.08)', paddingRight: '15px' }}>
                        <i className="bi bi-geo-alt" style={{ fontSize: '24px', color: TAB_GREEN }} />
                        <div className="form-group mb-0 flex-grow-1">
                          <label style={{ fontSize: '11px', color: '#888', fontWeight: '500', marginBottom: '2px', display: 'block' }}>Country</label>
                          <DesktopDropdown name="country" placeholder="Select Country" options={[{ name: 'Bangladesh', badgeText: 'bd' }, { name: 'United States', badgeText: 'us' }, { name: 'United Kingdom', badgeText: 'uk' }, { name: 'Canada', badgeText: 'ca' }]} />
                        </div>
                      </div>
                      <div className="search-input flex-grow-1 d-flex align-items-center gap-3 w-100" style={{ borderRight: '1px solid rgba(0,0,0,0.08)', paddingRight: '15px' }}>
                        <i className="bx bx-briefcase" style={{ fontSize: '24px', color: TAB_GREEN }} />
                        <div className="form-group mb-0 flex-grow-1">
                          <label style={{ fontSize: '11px', color: '#888', fontWeight: '500', marginBottom: '2px', display: 'block' }}>Visa Type</label>
                          <DesktopDropdown name="visa_type" placeholder="Select Visa Type" options={[{ name: 'Tourist Visa', subtitle: 'Short term travel' }, { name: 'Business Visa', subtitle: 'Work & Meetings' }, { name: 'Student Visa', subtitle: 'Education' }]} />
                        </div>
                      </div>
                      <div className="search-input flex-grow-1 d-flex align-items-center gap-3 w-100">
                        <i className="bx bx-group" style={{ fontSize: '24px', color: TAB_GREEN }} />
                        <div className="form-group mb-0 flex-grow-1">
                          <label style={{ fontSize: '11px', color: '#888', fontWeight: '500', marginBottom: '2px', display: 'block' }}>Visa Mode</label>
                          <DesktopDropdown name="visa_mode" placeholder="Select Visa Mode" options={[{ name: 'E-Visa', subtitle: 'Online processing' }, { name: 'Sticker Visa', subtitle: 'Embassy processing' }]} />
                        </div>
                      </div>
                      <div className="search-action">
                        <button type="submit" className="primary-btn1 px-5 py-3" style={{ background: TAB_GREEN, border: 'none', borderRadius: '4px', fontWeight: '700', fontSize: '16px', whiteSpace: 'nowrap' }}>Search</button>
                      </div>
                    </div>
                  )}
                  {activeTab === 'transport' && (
                    <div className="search-box d-flex align-items-center" style={{ gap: '15px' }}>
                      <div className="search-input flex-grow-1 d-flex align-items-center gap-3 w-100" style={{ borderRight: '1px solid rgba(0,0,0,0.08)', paddingRight: '15px' }}>
                        <i className="bi bi-geo-alt" style={{ fontSize: '24px', color: TAB_GREEN }} />
                        <div className="form-group mb-0 flex-grow-1">
                          <label style={{ fontSize: '11px', color: '#888', fontWeight: '500', marginBottom: '2px', display: 'block' }}>Location From</label>
                          <DesktopDropdown name="location_from" placeholder="Select Location" options={transportLocationOptions} value={searchValues.location_from} onChange={v => setField('location_from', v)} />
                        </div>
                      </div>
                      <div className="search-input flex-grow-1 d-flex align-items-center gap-3 w-100" style={{ borderRight: '1px solid rgba(0,0,0,0.08)', paddingRight: '15px' }}>
                        <i className="bi bi-geo-alt" style={{ fontSize: '24px', color: TAB_GREEN }} />
                        <div className="form-group mb-0 flex-grow-1">
                          <label style={{ fontSize: '11px', color: '#888', fontWeight: '500', marginBottom: '2px', display: 'block' }}>Location To</label>
                          <DesktopDropdown name="location_to" placeholder="Select Location" options={transportLocationOptions} value={searchValues.location_to} onChange={v => setField('location_to', v)} />
                        </div>
                      </div>
                      <div className="search-input flex-grow-1 d-flex align-items-center gap-3 w-100" style={{ borderRight: '1px solid rgba(0,0,0,0.08)', paddingRight: '15px' }}>
                        <i className="bx bx-car" style={{ fontSize: '24px', color: TAB_GREEN }} />
                        <div className="form-group mb-0 flex-grow-1">
                          <label style={{ fontSize: '11px', color: '#888', fontWeight: '500', marginBottom: '2px', display: 'block' }}>Transport Type</label>
                          <DesktopDropdown name="transport_type" placeholder="Which Type?" options={transportTypeOptions} value={searchValues.transport_type} onChange={v => setField('transport_type', v)} />
                        </div>
                      </div>
                      <div className="search-input flex-grow-1 d-flex align-items-center gap-3 w-100">
                        <i className="bi bi-clock" style={{ fontSize: '24px', color: TAB_GREEN }} />
                        <div className="form-group mb-0 flex-grow-1">
                          <label style={{ fontSize: '11px', color: '#888', fontWeight: '500', marginBottom: '2px', display: 'block' }}>Reserve Date</label>
                          <input type="date" name="date" className="border-0 bg-transparent p-0 shadow-none fw-bold text-dark w-100" style={{ fontSize: '14px', outline: 'none' }} />
                        </div>
                      </div>
                      <div className="search-action">
                        <button type="submit" className="primary-btn1 px-5 py-3" style={{ background: TAB_GREEN, border: 'none', borderRadius: '4px', fontWeight: '700', fontSize: '16px', whiteSpace: 'nowrap' }}>Search</button>
                      </div>
                    </div>
                  )}
                </div>
              </form>
            </div>

            {/* ── MOBILE LAYOUT: card rows ── */}
            <div className="d-md-none">
              <form onSubmit={handleSearch}>
                {activeTab === 'tour' && (
                  <>
                    <MobileDropdown icon={<i className="bi bi-geo-alt" />} label="Destination" placeholder="Select Destination" options={destinationOptions} value={searchValues.destination} onChange={v => setField('destination', v)} name="destination" />
                    <MobileDropdown icon={<i className="bx bx-briefcase" />} label="Tour Type" placeholder="Select Tour Type" options={tourTypeOptions} value={searchValues.tour_type} onChange={v => setField('tour_type', v)} name="tour_type" />
                    <MobileDropdown icon={<i className="bi bi-clock" />} label="When" placeholder="Select Month" options={monthOptions} value={searchValues.month} onChange={v => setField('month', v)} name="month" />
                    <MobileDropdown icon={<i className="bx bx-briefcase" />} label="Tour Duration" placeholder="Select Duration" options={durationOptions} value={searchValues.duration} onChange={v => setField('duration', v)} name="duration" />
                  </>
                )}
                {activeTab === 'activities' && (
                  <>
                    <MobileDropdown icon={<i className="bi bi-geo-alt" />} label="Location" placeholder="Select Location" options={destinationOptions} value={searchValues.location} onChange={v => setField('location', v)} name="location" />
                    <MobileDropdown icon={<i className="bi bi-clock" />} label="Activity Day" placeholder="Select Date" options={[]} value={searchValues.date} onChange={v => setField('date', v)} name="date" />
                    <MobileDropdown icon={<i className="bx bx-group" />} label="Traveler" placeholder="Select Traveler Count" options={[{ name: '1 Person' }, { name: '2 People' }, { name: '3 People' }, { name: '4+ People' }]} value={searchValues.travelers} onChange={v => setField('travelers', v)} name="travelers" />
                  </>
                )}
                {activeTab === 'visa' && (
                  <>
                    <MobileDropdown icon={<i className="bi bi-geo-alt" />} label="Country" placeholder="Select Country" options={[{ name: 'Bangladesh' }, { name: 'United States' }, { name: 'United Kingdom' }, { name: 'Canada' }]} value={searchValues.country} onChange={v => setField('country', v)} name="country" />
                    <MobileDropdown icon={<i className="bx bx-briefcase" />} label="Visa Type" placeholder="Select Visa Type" options={[{ name: 'Tourist Visa' }, { name: 'Business Visa' }, { name: 'Student Visa' }]} value={searchValues.visa_type} onChange={v => setField('visa_type', v)} name="visa_type" />
                    <MobileDropdown icon={<i className="bx bx-group" />} label="Visa Mode" placeholder="Select Visa Mode" options={[{ name: 'E-Visa' }, { name: 'Sticker Visa' }]} value={searchValues.visa_mode} onChange={v => setField('visa_mode', v)} name="visa_mode" />
                  </>
                )}
                {activeTab === 'transport' && (
                  <>
                    <MobileDropdown icon={<i className="bi bi-geo-alt" />} label="Location From" placeholder="Select Location" options={transportLocationOptions} value={searchValues.location_from} onChange={v => setField('location_from', v)} name="location_from" />
                    <MobileDropdown icon={<i className="bi bi-geo-alt" />} label="Location To" placeholder="Select Location" options={transportLocationOptions} value={searchValues.location_to} onChange={v => setField('location_to', v)} name="location_to" />
                    <MobileDropdown icon={<i className="bx bx-car" />} label="Transport Type" placeholder="Which Type?" options={transportTypeOptions} value={searchValues.transport_type} onChange={v => setField('transport_type', v)} name="transport_type" />
                  </>
                )}
                <button
                  type="submit"
                  style={{
                    width: '100%', background: TAB_GREEN, color: '#fff',
                    border: 'none', borderRadius: '8px', padding: '14px',
                    fontWeight: '700', fontSize: '16px', marginTop: '4px',
                    cursor: 'pointer', letterSpacing: '0.3px'
                  }}
                >
                  Search
                </button>
              </form>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
