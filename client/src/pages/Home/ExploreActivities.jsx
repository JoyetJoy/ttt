import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function ExploreActivities() {
  const [tabs, setTabs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/activities`);
        const activities = (response.data.activities || response.data).slice(0, 6);

        const mappedTabs = activities.map((act, index) => ({
          id: act.id || index,
          tab_title: act.title || `Activity ${index + 1}`,
          tab_img: act?.icon, // Use a generic tab icon if not provided in DB
          label: "Activity",
          main_title: act.title,
          description: act.short_desc || "Experience an unforgettable adventure.",
          include: [
            { item: "Safety Measures" },
            { item: "Guided Tours" }
          ],
          button_text: "Check Availability",
          button_link: `/activities/${act.id}`,
          video_text: "Watch Adventure",
          video_link: act.video_link || "https://www.youtube.com/watch?v=1",
          img: act.activities_galleries,
          isAbsoluteUrl: !!act.feature_img
        }));

        setTabs(mappedTabs);
      } catch (error) {
        console.error('Failed to fetch activities:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  if (loading) return null;
  if (tabs.length === 0) return null;

  return (
    <div className="verticle-tab-section mt-28 px-26 pt-24">
      <img src="/frontend/img/home1/section-vector1.png" alt="" className="section-vector1" />
      <div className="container">
        <div className="row">
          <div className="col-lg-12">
            <div className="section-title text-center mb-18">
              <span className="!text-[#0081C9] [&_svg]:!fill-[#0081C9]">
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="16" viewBox="0 0 15 16">
                  <path fillRule="evenodd" clipRule="evenodd" d="M1.92556 7.69046C2.35744 7.63298 2.78906 7.57563 3.21925 7.51077C4.14925 7.37065 5.08588 7.29138 6.01763 7.21249L6.01888 7.21243C6.15888 7.20055 6.29875 7.18874 6.43844 7.17668C7.50663 6.968 8.58732 6.89083 9.66644 6.94628C10.7733 7.06837 11.8592 7.41421 12.8857 7.97163L12.8857 8.23655C11.8592 8.79397 10.7733 9.13981 9.66644 9.26191C8.58732 9.31735 7.50663 9.24018 6.43844 9.03151C5.36831 8.93932 4.29813 8.82412 3.21925 8.69742C2.14031 8.57065 1.07012 8.42092 -6.78702e-07 8.23655L-7.01862e-07 7.97163C0.639938 7.86135 1.28306 7.77588 1.92556 7.69046ZM10.7633 15.8502C10.9332 15.4596 11.12 15.0855 11.3061 14.7127C11.389 14.5468 11.4717 14.3811 11.5527 14.2144C11.8159 13.6729 12.1141 13.1545 12.4299 12.6477C12.5448 12.4632 12.64 12.2604 12.7336 12.061C12.8972 11.7124 13.056 11.3741 13.3071 11.1616C13.7816 10.7768 14.3283 10.5734 14.886 10.574L15 10.7353C14.9945 11.4677 14.8235 12.1813 14.5088 12.7859C14.3311 13.1802 14.0336 13.4059 13.7358 13.6317C13.6073 13.7292 13.4787 13.8268 13.3597 13.9379C12.965 14.3066 12.5615 14.6637 12.1492 15.0093C11.7369 15.3549 11.3159 15.689 10.8685 16L10.7633 15.8502ZM11.7543 0.665536C11.4882 0.436859 11.2226 0.208798 10.9388 -1.5523e-06L10.816 0.149784C11.0528 0.725784 11.3072 1.27877 11.5703 1.82018C11.8335 2.3616 12.1142 2.89157 12.3949 3.40997C12.4795 3.56628 12.5538 3.73514 12.628 3.90394C12.8 4.29501 12.9718 4.68572 13.2721 4.91908C13.7312 5.33563 14.2754 5.56049 14.8334 5.56418L14.9562 5.4144C14.9651 4.68055 14.8095 3.95951 14.5089 3.3408C14.3471 3.01108 14.0894 2.80252 13.824 2.58763C13.6722 2.46474 13.5178 2.33975 13.3773 2.1888C12.9914 1.77409 12.6142 1.3824 12.1931 1.0368C12.0446 0.91489 11.8994 0.790152 11.7543 0.665536Z" />
                </svg>
                Are you ready to travel?
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="16" viewBox="0 0 15 16">
                  <path fillRule="evenodd" clipRule="evenodd" d="M13.0744 8.30954C12.6426 8.36702 12.2109 8.42437 11.7807 8.48923C10.8507 8.62935 9.91412 8.70862 8.98237 8.78751L8.98112 8.78757C8.84112 8.79945 8.70125 8.81126 8.56156 8.82332C7.49337 9.032 6.41268 9.10917 5.33356 9.05372C4.22669 8.93163 3.14081 8.58578 2.11432 8.02837V7.76345C3.14081 7.20603 4.22669 6.86018 5.33356 6.73809C6.41268 6.68265 7.49337 6.75982 8.56156 6.96849C9.63169 7.06068 10.7019 7.17588 11.7807 7.30259C12.8597 7.42935 13.9299 7.57908 15 7.76345V8.02837C14.3601 8.13865 13.7169 8.22412 13.0744 8.30954ZM4.23673 0.14976C4.06677 0.540388 3.88 0.914468 3.69388 1.28726C3.61104 1.45317 3.52831 1.61887 3.44728 1.78561C3.18413 2.32705 2.88589 2.84546 2.57011 3.35234C2.45519 3.5368 2.36002 3.73958 2.26642 3.939C2.10282 4.28757 1.94402 4.62593 1.69294 4.83843C1.21844 5.2232 0.671682 5.42665 0.114031 5.42597L0 5.26468C0.00551875 4.53235 0.176481 3.81866 0.491219 3.2141C0.6689 2.81982 0.966407 2.59414 1.26418 2.36828C1.39271 2.27078 1.52129 2.17324 1.64031 2.06209C2.03504 1.69345 2.43853 1.33633 2.8508 0.990726C3.26307 0.645126 3.68411 0.31104 4.13147 0L4.23673 0.14976ZM3.24568 15.3345C3.51184 15.5631 3.77735 15.7912 4.06123 16L4.18404 15.8502C3.9472 15.2742 3.69281 14.7212 3.42966 14.1798C3.16651 13.6384 2.88581 13.1084 2.60511 12.59C2.52048 12.4337 2.44621 12.2649 2.37198 12.0961C2.19999 11.705 2.02816 11.3143 1.72794 11.0809C1.26879 10.6644 0.7246 10.4395 0.166563 10.4358L0.0437562 10.5856C0.0348937 11.3194 0.190456 12.0405 0.491113 12.6592C0.652919 12.9889 0.910556 13.1975 1.17597 13.4124C1.32782 13.5353 1.48222 13.6602 1.62268 13.8112C2.00863 14.2259 2.38582 14.6176 2.80686 14.9632C2.95538 15.0851 3.10063 15.2098 3.24568 15.3345Z" />
                </svg>
              </span>
              <h2>Explore Your Activities</h2>
            </div>
          </div>
        </div>
        <div className="verticle-tab-wrapper">
          <div className="row g-xl-4 gy-5">
            <div className="col-xl-5">
              <div className="verticle-tab-sidebar">
                <ul className="nav nav-pills" id="pills-tab5" role="tablist">
                  {tabs.map((menu, key) => (
                    <li className="nav-item" role="presentation" key={menu.id}>
                      <div className={`nav-link ${key === 0 ? 'active' : ''}`} id={`nature-tab${key}`} data-bs-toggle="pill"
                        data-bs-target={`#nature${key}`} role="tab" aria-controls={`nature${key}`}
                        aria-selected={key === 0}>
                        <div className="icon">
                          <img src={menu.isAbsoluteUrl ? menu.tab_img : menu.tab_img} width="70" alt={menu.tab_title} />
                        </div>
                        <h6>{menu.tab_title}</h6>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="col-xl-7 d-flex justify-content-xl-start justify-content-center">
              <div className="tab-content" id="pills-tab5Content">
                {tabs.map((tab, key) => (
                  <div className={`tab-pane fade ${key === 0 ? 'show active' : ''}`} id={`nature${key}`} role="tabpanel"
                    aria-labelledby={`nature-tab${key}`} key={tab.id}>
                    <div className="verticle-tab-content-wrap">
                      <div className="verticle-tab-content">
                        <div className="eg-tag2">
                          <span>{tab.label}</span>
                        </div>
                        <h2>{tab.main_title}</h2>
                        <p>{tab.description}</p>
                        <ul>
                          {tab.include.map((items, i) => (
                            <li key={i}>
                              <svg xmlns="http://www.w3.org/2000/svg" width="9" height="9" viewBox="0 0 9 9">
                                <circle cx="4.5" cy="4.5" r="4.5" className="!fill-[#0081C9]" />
                              </svg>
                              {items.item}
                            </li>
                          ))}
                        </ul>
                        <div className="content-bottom-area">
                          <Link to={tab.button_link} className="primary-btn1 !bg-[#0081C9] !text-white hover:!bg-[#006096] transition-colors border-none">{tab.button_text}</Link>
                          <a data-fancybox="popup-video" href={tab.video_link} className="video-area">
                            <div className="icon">
                              <svg className="video-circle" xmlns="http://www.w3.org/2000/svg"
                                xmlnsXlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
                                width="51px" viewBox="0 0 206 206"
                                style={{ enableBackground: 'new 0 0 206 206' }}
                                xmlSpace="preserve">
                                <circle className="circle" strokeMiterlimit="10" cx="103" cy="103" r="100"></circle>
                                <path className="circle-half top-half" strokeWidth="4" strokeMiterlimit="10"
                                  d="M16.4,53C44,5.2,105.2-11.2,153,16.4s64.2,88.8,36.6,136.6"></path>
                                <path className="circle-half bottom-half" strokeWidth="4" strokeMiterlimit="10"
                                  d="M189.6,153C162,200.8,100.8,217.2,53,189.6S-11.2,100.8,16.4,53"></path>
                              </svg>
                              <i className="bi bi-play"></i>
                            </div>
                            <h6>{tab.video_text}</h6>
                          </a>
                        </div>
                      </div>
                      <div className="verticle-tab-img">
                        <div className="verticle-tab-img1 mb-25 text-end">
                          <img src={tab.img[0]?.image} width="170" alt="image 1" />
                        </div>
                        <div className="verticle-tab-img2 text-end">
                          <img src={tab.img[1]?.image} width="170" alt="image 2" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
