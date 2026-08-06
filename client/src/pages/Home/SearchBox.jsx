import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function CustomDropdown({ name, placeholder, options, value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef(null);

  // Click outside to close
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const filtered = options.filter(o => o.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="position-relative w-100" ref={dropdownRef}>
      <input type="hidden" name={name} value={value || ''} />

      <div
        className="d-flex justify-content-between align-items-center"
        style={{ cursor: 'pointer' }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="fw-bold text-dark" style={{ fontSize: '14px' }}>
          {value || placeholder}
        </div>
        <i className={`bi bi-chevron-${isOpen ? 'up' : 'down'} text-dark`} style={{ fontSize: '12px' }}></i>
      </div>

      {isOpen && (
        <div
          className="position-absolute bg-white shadow-lg rounded-3"
          style={{ top: '100%', left: '-40px', width: '300px', zIndex: 1000, marginTop: '15px', overflow: 'hidden' }}
        >
          <div className="p-3 border-bottom d-flex align-items-center gap-2">
            <i className="bi bi-search" style={{ color: '#0081C9', fontSize: '18px' }}></i>
            <input
              type="text"
              className="border-0 w-100 shadow-none bg-transparent"
              placeholder={`Type Your ${placeholder.replace('Select ', '')}`}
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ outline: 'none', color: '#666', fontSize: '15px' }}
            />
          </div>
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {filtered.map((opt, idx) => (
              <div
                key={idx}
                className="d-flex justify-content-between align-items-center p-3 border-bottom"
                style={{ cursor: 'pointer', transition: 'background 0.2s' }}
                onClick={() => { onChange && onChange(opt.name); setIsOpen(false); setSearch(''); }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <div>
                  <div className="fw-bold text-dark" style={{ fontSize: '15px' }}>{opt.name}</div>
                  {opt.subtitle && <div style={{ fontSize: '13px', color: '#888' }}>{opt.subtitle}</div>}
                </div>
                {opt.badgeText ? (
                  <div
                    className="d-flex align-items-center justify-content-center text-white rounded-circle fw-bold"
                    style={{ background: '#0081C9', width: '40px', height: '40px', fontSize: '14px' }}
                  >
                    {opt.badgeText}
                  </div>
                ) : (
                  <div
                    className="d-flex flex-column align-items-center justify-content-center text-white rounded-circle"
                    style={{ background: '#0081C9', width: '40px', height: '40px', fontSize: '11px', lineHeight: 1.1 }}
                  >
                    <span className="fw-bold" style={{ fontSize: '14px' }}>{opt.tours || 1}</span>
                    <span>Tour</span>
                  </div>
                )}
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="p-4 text-center text-muted" style={{ fontSize: '14px' }}>
                No options found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
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

  // Helper to handle tab switching
  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setSearchValues({});
  };

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
    // Fetch destinations
    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/destinations`)
      .then(res => res.json())
      .then(data => {
        if (data && data.destinations) {
          const opts = data.destinations.map(d => ({
            name: d.title || d.name || 'Destination',
            subtitle: d.city || d.short_desc?.substring(0, 20) || d.title,
            tours: d.tours || 1,
            id: d.id
          }));
          if (opts.length > 0) setDestinationOptions(opts);
        }
      })
      .catch(err => console.error('Failed to fetch destinations for search:', err));

    // Fetch all tours to compute dynamic options
    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/tours`)
      .then(res => res.json())
      .then(data => setAllTours(data || []))
      .catch(err => console.error('Failed to fetch tours for search box:', err));

    // Fetch transport types
    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/transports/vehicle-types`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setTransportTypeOptions(data.map(t => ({ name: t.name, subtitle: 'Vehicle Type' })));
        }
      })
      .catch(err => console.error('Failed to fetch vehicle types:', err));

    // Fetch transport locations
    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/transports/locations`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setTransportLocationOptions(data.map(l => ({ name: l.name, subtitle: 'Transport Location' })));
        }
      })
      .catch(err => console.error('Failed to fetch transport locations:', err));
  }, []);

  // Build dynamic tour type options
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

  // Build dynamic month options from tour created_at dates
  const monthOptions = (() => {
    const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    const counts = {};
    allTours.forEach(t => {
      if (t.created_at) {
        const m = new Date(t.created_at).getMonth();
        counts[m] = (counts[m] || 0) + 1;
      }
    });
    const dynamic = Object.entries(counts).map(([m, c]) => ({
      name: monthNames[parseInt(m)],
      subtitle: `${c} tour${c > 1 ? 's' : ''} available`,
      tours: c
    }));
    if (dynamic.length > 0) return dynamic;
    return monthNames.map(name => ({ name, subtitle: 'Tours available' }));
  })();

  // Build dynamic duration options
  const durationOptions = (() => {
    const durations = [...new Set(allTours.map(t => t.duration).filter(Boolean))].sort((a, b) => parseInt(a) - parseInt(b));
    if (durations.length > 0) {
      return durations.map(d => ({
        name: `${d} ${parseInt(d) === 1 ? 'Day' : 'Days'}`,
        subtitle: `${allTours.filter(t => t.duration == d).length} tour(s)`,
        tours: allTours.filter(t => t.duration == d).length,
        value: d
      }));
    }
    return [
      { name: '1-3 Days', subtitle: 'Short weekend trips' },
      { name: '4-7 Days', subtitle: 'Standard week tours' },
      { name: '8+ Days', subtitle: 'Extended holidays' }
    ];
  })();

  return (
    <div className="home1-banner-bottom ">
      <div className="container-fluid">
        <div className="filter-wrapper">
          {/* ─── TABS ─── */}
          <div className="nav-buttons">
            <ul className="nav nav-pills d-flex align-items-end" role="tablist" style={{ borderBottom: 'none', margin: 0, padding: 0, gap: '2px' }}>
              <li className="nav-item" role="presentation">
                <button
                  className={`nav-link ${activeTab === 'transport' ? 'active' : ''}`}
                  onClick={() => handleTabClick('transport')}
                  type="button"
                  style={{
                    background: activeTab === 'transport' ? '#0081C9' : '#f5faeb',
                    color: activeTab === 'transport' ? '#fff' : '#111',
                    borderRadius: '8px 8px 0 0',
                    border: 'none',
                    padding: '12px 25px',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <i className="bx bx-car" style={{ fontSize: '20px' }}></i>
                  Transport
                </button>
              </li>
              <li className="nav-item" role="presentation">
                <button
                  className={`nav-link ${activeTab === 'tour' ? 'active' : ''}`}
                  onClick={() => handleTabClick('tour')}
                  type="button"
                  style={{
                    background: activeTab === 'tour' ? '#0081C9' : '#f5faeb',
                    color: activeTab === 'tour' ? '#fff' : '#111',
                    borderRadius: '8px 8px 0 0',
                    border: 'none',
                    padding: '12px 25px',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <i className="bi bi-geo-alt" style={{ fontSize: '18px' }}></i>
                  Tour
                </button>
              </li>
              <li className="nav-item" role="presentation">
                <button
                  className={`nav-link ${activeTab === 'activities' ? 'active' : ''}`}
                  onClick={() => handleTabClick('activities')}
                  type="button"
                  style={{
                    background: activeTab === 'activities' ? '#0081C9' : '#f5faeb',
                    color: activeTab === 'activities' ? '#fff' : '#111',
                    borderRadius: '8px 8px 0 0',
                    border: 'none',
                    padding: '12px 25px',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <i className="bx bx-target-lock" style={{ fontSize: '20px' }}></i>
                  Activities
                </button>
              </li>
              <li className="nav-item" role="presentation">
                <button
                  className={`nav-link ${activeTab === 'visa' ? 'active' : ''}`}
                  onClick={() => handleTabClick('visa')}
                  type="button"
                  style={{
                    background: activeTab === 'visa' ? '#0081C9' : '#f5faeb',
                    color: activeTab === 'visa' ? '#fff' : '#111',
                    borderRadius: '8px 8px 0 0',
                    border: 'none',
                    padding: '12px 25px',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <i className="bx bx-id-card" style={{ fontSize: '20px' }}></i>
                  Visa
                </button>
              </li>
            </ul>
          </div>

          {/* ─── TAB CONTENT (Search Form) ─── */}
          <div className="tab-content" style={{ background: '#f5faeb', padding: '15px', borderRadius: '0 8px 8px 8px' }}>
            <div className="tab-pane fade show active">
              <form onSubmit={handleSearch}>
                <div className="style-two">

                  {activeTab === 'tour' && (
                    <div className="search-box d-flex flex-column flex-md-row align-items-md-center" style={{ gap: '15px' }}>
                      {/* Destination */}
                      <div className="search-input flex-grow-1 d-flex align-items-center gap-3 w-100" style={{ borderRight: '1px solid rgba(0,0,0,0.08)', paddingRight: '15px' }}>
                        <div className="search-icon d-flex align-items-center">
                          <i className="bi bi-geo-alt" style={{ fontSize: '24px', color: '#0081C9' }}></i>
                        </div>
                        <div className="form-group mb-0 flex-grow-1">
                          <label style={{ fontSize: '11px', color: '#888', fontWeight: '500', marginBottom: '2px', display: 'block' }}>Destination</label>
                          <CustomDropdown name="destination" placeholder="Select Destination" options={destinationOptions} value={searchValues.destination} onChange={v => setField('destination', v)} />
                        </div>
                      </div>

                      {/* Tour Type */}
                      <div className="search-input flex-grow-1 d-flex align-items-center gap-3 w-100" style={{ borderRight: '1px solid rgba(0,0,0,0.08)', paddingRight: '15px' }}>
                        <div className="search-icon d-flex align-items-center">
                          <i className="bx bx-briefcase" style={{ fontSize: '24px', color: '#0081C9' }}></i>
                        </div>
                        <div className="form-group mb-0 flex-grow-1">
                          <label style={{ fontSize: '11px', color: '#888', fontWeight: '500', marginBottom: '2px', display: 'block' }}>Tour Type</label>
                          <CustomDropdown name="tour_type" placeholder="Select Tour Type" options={tourTypeOptions} value={searchValues.tour_type} onChange={v => setField('tour_type', v)} />
                        </div>
                      </div>

                      {/* When */}
                      <div className="search-input flex-grow-1 d-flex align-items-center gap-3 w-100" style={{ borderRight: '1px solid rgba(0,0,0,0.08)', paddingRight: '15px' }}>
                        <div className="search-icon d-flex align-items-center">
                          <i className="bi bi-clock" style={{ fontSize: '24px', color: '#0081C9' }}></i>
                        </div>
                        <div className="form-group mb-0 flex-grow-1">
                          <label style={{ fontSize: '11px', color: '#888', fontWeight: '500', marginBottom: '2px', display: 'block' }}>When</label>
                          <CustomDropdown name="month" placeholder="Select Month" options={monthOptions} value={searchValues.month} onChange={v => setField('month', v)} />
                        </div>
                      </div>

                      {/* Tour Duration */}
                      <div className="search-input flex-grow-1 d-flex align-items-center gap-3 w-100">
                        <div className="search-icon d-flex align-items-center">
                          <i className="bx bx-briefcase" style={{ fontSize: '24px', color: '#0081C9' }}></i>
                        </div>
                        <div className="form-group mb-0 flex-grow-1">
                          <label style={{ fontSize: '11px', color: '#888', fontWeight: '500', marginBottom: '2px', display: 'block' }}>Tour Duration</label>
                          <CustomDropdown name="duration" placeholder="Select Duration" options={durationOptions} value={searchValues.duration} onChange={v => setField('duration', v)} />
                        </div>
                      </div>

                      {/* Search Button */}
                      <div className="search-action w-100 d-flex justify-content-md-end mt-3 mt-md-0">
                        <button type="submit" className="primary-btn1 px-5 py-3 w-100" style={{ background: '#0081C9', border: 'none', borderRadius: '4px', fontWeight: '700', fontSize: '16px' }}>
                          Search
                        </button>
                      </div>
                    </div>
                  )}

                  {activeTab === 'activities' && (
                    <div className="search-box d-flex flex-column flex-md-row align-items-md-center" style={{ gap: '15px' }}>
                      {/* Location */}
                      <div className="search-input flex-grow-1 d-flex align-items-center gap-3 w-100" style={{ borderRight: '1px solid rgba(0,0,0,0.08)', paddingRight: '15px' }}>
                        <div className="search-icon d-flex align-items-center">
                          <i className="bi bi-geo-alt" style={{ fontSize: '24px', color: '#0081C9' }}></i>
                        </div>
                        <div className="form-group mb-0 flex-grow-1">
                          <label style={{ fontSize: '11px', color: '#888', fontWeight: '500', marginBottom: '2px', display: 'block' }}>Location</label>
                          <CustomDropdown name="location" placeholder="Select Location" options={destinationOptions} value={searchValues.location} onChange={v => setField('location', v)} />
                        </div>
                      </div>

                      {/* Activite Day */}
                      <div className="search-input flex-grow-1 d-flex align-items-center gap-3 w-100" style={{ borderRight: '1px solid rgba(0,0,0,0.08)', paddingRight: '15px' }}>
                        <div className="search-icon d-flex align-items-center">
                          <i className="bi bi-clock" style={{ fontSize: '24px', color: '#0081C9' }}></i>
                        </div>
                        <div className="form-group mb-0 flex-grow-1 position-relative">
                          <label style={{ fontSize: '11px', color: '#888', fontWeight: '500', marginBottom: '2px', display: 'block' }}>Activite Day</label>
                          <input
                            type="date"
                            name="date"
                            className="border-0 bg-transparent p-0 shadow-none fw-bold text-dark w-100"
                            style={{ fontSize: '14px', outline: 'none' }}
                          />
                        </div>
                      </div>

                      {/* Traveler */}
                      <div className="search-input flex-grow-1 d-flex align-items-center gap-3 w-100">
                        <div className="search-icon d-flex align-items-center">
                          <i className="bx bx-group" style={{ fontSize: '24px', color: '#0081C9' }}></i>
                        </div>
                        <div className="form-group mb-0 flex-grow-1 position-relative">
                          <label style={{ fontSize: '11px', color: '#888', fontWeight: '500', marginBottom: '2px', display: 'block' }}>Traveler</label>
                          <input
                            type="number"
                            name="travelers"
                            min="1"
                            defaultValue="2"
                            className="border-0 bg-transparent p-0 shadow-none fw-bold text-dark w-100"
                            style={{ fontSize: '14px', outline: 'none' }}
                          />
                        </div>
                      </div>

                      {/* Search Button */}
                      <div className="search-action w-100 d-flex justify-content-md-end mt-3 mt-md-0">
                        <button type="submit" className="primary-btn1 px-5 py-3 w-100" style={{ background: '#0081C9', border: 'none', borderRadius: '4px', fontWeight: '700', fontSize: '16px' }}>
                          Search
                        </button>
                      </div>
                    </div>
                  )}

                  {activeTab === 'visa' && (
                    <div className="search-box d-flex flex-column flex-md-row align-items-md-center" style={{ gap: '15px' }}>
                      {/* Country */}
                      <div className="search-input flex-grow-1 d-flex align-items-center gap-3 w-100" style={{ borderRight: '1px solid rgba(0,0,0,0.08)', paddingRight: '15px' }}>
                        <div className="search-icon d-flex align-items-center">
                          <i className="bi bi-geo-alt" style={{ fontSize: '24px', color: '#0081C9' }}></i>
                        </div>
                        <div className="form-group mb-0 flex-grow-1">
                          <label style={{ fontSize: '11px', color: '#888', fontWeight: '500', marginBottom: '2px', display: 'block' }}>Country</label>
                          <CustomDropdown name="country" placeholder="Select Country" options={[
                            { name: 'Bangladesh', badgeText: 'bd' },
                            { name: 'United States', badgeText: 'us' },
                            { name: 'United Kingdom', badgeText: 'uk' },
                            { name: 'Canada', badgeText: 'ca' }
                          ]} />
                        </div>
                      </div>

                      {/* Visa Type */}
                      <div className="search-input flex-grow-1 d-flex align-items-center gap-3 w-100" style={{ borderRight: '1px solid rgba(0,0,0,0.08)', paddingRight: '15px' }}>
                        <div className="search-icon d-flex align-items-center">
                          <i className="bx bx-briefcase" style={{ fontSize: '24px', color: '#0081C9' }}></i>
                        </div>
                        <div className="form-group mb-0 flex-grow-1">
                          <label style={{ fontSize: '11px', color: '#888', fontWeight: '500', marginBottom: '2px', display: 'block' }}>Visa Type</label>
                          <CustomDropdown name="visa_type" placeholder="Select Visa Type" options={[
                            { name: 'Tourist Visa', subtitle: 'Short term travel' },
                            { name: 'Business Visa', subtitle: 'Work & Meetings' },
                            { name: 'Student Visa', subtitle: 'Education' }
                          ]} />
                        </div>
                      </div>

                      {/* Visa Mode */}
                      <div className="search-input flex-grow-1 d-flex align-items-center gap-3 w-100">
                        <div className="search-icon d-flex align-items-center">
                          <i className="bx bx-group" style={{ fontSize: '24px', color: '#0081C9' }}></i>
                        </div>
                        <div className="form-group mb-0 flex-grow-1">
                          <label style={{ fontSize: '11px', color: '#888', fontWeight: '500', marginBottom: '2px', display: 'block' }}>Visa Mode</label>
                          <CustomDropdown name="visa_mode" placeholder="Select Visa Mode" options={[
                            { name: 'E-Visa', subtitle: 'Online processing' },
                            { name: 'Sticker Visa', subtitle: 'Embassy processing' }
                          ]} />
                        </div>
                      </div>

                      {/* Search Button */}
                      <div className="search-action w-100 d-flex justify-content-md-end mt-3 mt-md-0">
                        <button type="submit" className="primary-btn1 px-5 py-3 w-100" style={{ background: '#0081C9', border: 'none', borderRadius: '4px', fontWeight: '700', fontSize: '16px' }}>
                          Search
                        </button>
                      </div>
                    </div>
                  )}

                  {activeTab === 'transport' && (
                    <div className="search-box d-flex flex-column flex-md-row align-items-md-center" style={{ gap: '15px' }}>
                      {/* Location From */}
                      <div className="search-input flex-grow-1 d-flex align-items-center gap-3 w-100" style={{ borderRight: '1px solid rgba(0,0,0,0.08)', paddingRight: '15px' }}>
                        <div className="search-icon d-flex align-items-center">
                          <i className="bi bi-geo-alt" style={{ fontSize: '24px', color: '#0081C9' }}></i>
                        </div>
                        <div className="form-group mb-0 flex-grow-1">
                          <label style={{ fontSize: '11px', color: '#888', fontWeight: '500', marginBottom: '2px', display: 'block' }}>Location From</label>
                          <CustomDropdown name="location_from" placeholder="Select Location" options={transportLocationOptions} value={searchValues.location_from} onChange={v => setField('location_from', v)} />
                        </div>
                      </div>

                      {/* Location To */}
                      <div className="search-input flex-grow-1 d-flex align-items-center gap-3 w-100" style={{ borderRight: '1px solid rgba(0,0,0,0.08)', paddingRight: '15px' }}>
                        <div className="search-icon d-flex align-items-center">
                          <i className="bi bi-geo-alt" style={{ fontSize: '24px', color: '#0081C9' }}></i>
                        </div>
                        <div className="form-group mb-0 flex-grow-1">
                          <label style={{ fontSize: '11px', color: '#888', fontWeight: '500', marginBottom: '2px', display: 'block' }}>Location To</label>
                          <CustomDropdown name="location_to" placeholder="Select Location" options={transportLocationOptions} value={searchValues.location_to} onChange={v => setField('location_to', v)} />
                        </div>
                      </div>

                      {/* Transport Type */}
                      <div className="search-input flex-grow-1 d-flex align-items-center gap-3 w-100" style={{ borderRight: '1px solid rgba(0,0,0,0.08)', paddingRight: '15px' }}>
                        <div className="search-icon d-flex align-items-center">
                          <i className="bx bx-car" style={{ fontSize: '24px', color: '#0081C9' }}></i>
                        </div>
                        <div className="form-group mb-0 flex-grow-1">
                          <label style={{ fontSize: '11px', color: '#888', fontWeight: '500', marginBottom: '2px', display: 'block' }}>Transport Type</label>
                          <CustomDropdown name="transport_type" placeholder="Which Type?" options={transportTypeOptions} value={searchValues.transport_type} onChange={v => setField('transport_type', v)} />
                        </div>
                      </div>

                      {/* Reserve Date */}
                      <div className="search-input flex-grow-1 d-flex align-items-center gap-3 w-100">
                        <div className="search-icon d-flex align-items-center">
                          <i className="bi bi-clock" style={{ fontSize: '24px', color: '#0081C9' }}></i>
                        </div>
                        <div className="form-group mb-0 flex-grow-1 position-relative">
                          <label style={{ fontSize: '11px', color: '#888', fontWeight: '500', marginBottom: '2px', display: 'block' }}>Reserve Date</label>
                          <input
                            type="date"
                            name="date"
                            className="border-0 bg-transparent p-0 shadow-none fw-bold text-dark w-100"
                            style={{ fontSize: '14px', outline: 'none' }}
                          />
                        </div>
                      </div>

                      {/* Search Button */}
                      <div className="search-action w-100 d-flex justify-content-md-end mt-3 mt-md-0">
                        <button type="submit" className="primary-btn1 px-5 py-3 w-100" style={{ background: '#0081C9', border: 'none', borderRadius: '4px', fontWeight: '700', fontSize: '16px' }}>
                          Search
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
