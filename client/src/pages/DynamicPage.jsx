import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// ─── Import all widget components ────────────────────────────────────────────
import HeroSlider from './Home/HeroSlider';
import SearchBox from './Home/SearchBox';
import AboutSection from './Home/AboutSection';
import DestinationsSection from './Home/DestinationsSection';
import FeaturesSection from './Home/FeaturesSection';
import AffordableVacations from './Home/AffordableVacations';
import DealsSection from './Home/DealsSection';
import ExploreActivities from './Home/ExploreActivities';
import LatestBlog from './Home/LatestBlog';
import UltimateTravelExperience from './Home/UltimateTravelExperience';
import Testimonials from './Home/Testimonials';
import VisaProcessing from './Home/VisaProcessing';
import ContactSection from './Home/ContactSection';

function extractSliders(content) {
  if (Array.isArray(content)) return content;
  if (content && typeof content === 'object') {
    if (content.slider && typeof content.slider === 'object') {
      return Object.values(content.slider);
    }
    if (content.sliders && typeof content.sliders === 'object') {
      return Object.values(content.sliders);
    }
    // if the content itself is the object map of sliders
    if (Object.keys(content).length > 0 && typeof Object.values(content)[0] === 'object') {
       // just in case
       if (Object.values(content)[0].title !== undefined) {
         return Object.values(content);
       }
    }
  }
  return [];
}

// ─── Widget Slug → Component Map ─────────────────────────────────────────────
//
// Keys should match the widget_slug values stored in the database.
// Each entry is a function that receives the parsed widget_content and returns JSX.
//
const WIDGET_RENDERERS = {
  // Slider / Hero Banner
  slider:       (content) => <HeroSlider sliders={extractSliders(content)} />,
  'hero-slider':(content) => <HeroSlider sliders={extractSliders(content)} />,
  banner:       (content) => <HeroSlider sliders={extractSliders(content)} />,

  // Search
  search:       (content) => <SearchBox config={content || {}} />,
  'search-box': (content) => <SearchBox config={content || {}} />,

  // About Us
  'about-us':   (content) => <AboutSection config={content || {}} />,
  about:        (content) => <AboutSection config={content || {}} />,

  // Destinations
  destination:  (content) => <DestinationsSection config={content || {}} />,
  destinations: (content) => <DestinationsSection config={content || {}} />,

  // Why Choose Us / Features
  'why-choose-us': (content) => <FeaturesSection config={content || {}} />,
  'features':   (content) => <FeaturesSection config={content || {}} />,

  // Offers / Affordable Vacations
  offers:       (content) => <AffordableVacations config={content || {}} />,
  'affordable': (content) => <AffordableVacations config={content || {}} />,

  // Deals / Featured Tours
  'featured-tour': (content) => <DealsSection config={content || {}} />,
  'featured-tours':(content) => <DealsSection config={content || {}} />,
  deals:        (content) => <DealsSection config={content || {}} />,

  // Tab Activities / Explore Activities
  'tab-activities': (content) => <ExploreActivities config={content || {}} />,
  activities:   (content) => <ExploreActivities config={content || {}} />,

  // Latest Product / Ultimate Travel Experience
  'latest-product': (content) => <UltimateTravelExperience config={content || {}} />,
  product:      (content) => <UltimateTravelExperience config={content || {}} />,
  ultimate:     (content) => <UltimateTravelExperience config={content || {}} />,

  // Blog
  'our-recent-news':(content) => <LatestBlog config={content || {}} />,
  blogs:        (content) => <LatestBlog config={content || {}} />,
  blog:         (content) => <LatestBlog config={content || {}} />,
  'latest-blog':(content) => <LatestBlog config={content || {}} />,

  // Testimonial
  testimonial:  (content) => <Testimonials config={content || {}} />,
  testimonials: (content) => <Testimonials config={content || {}} />,

  // Visa Processing
  'visa-processing': (content) => (
    <>
      <VisaProcessing config={content || {}} />
      <ContactSection />
    </>
  ),
  visa: (content) => (
    <>
      <VisaProcessing config={content || {}} />
      <ContactSection />
    </>
  ),
};

/**
 * Resolves a widget_slug to the correct renderer function.
 * Tries: exact slug, slug with dashes, slug without vendor prefixes.
 */
function resolveRenderer(slug = '') {
  const s = slug.toLowerCase().trim();
  if (WIDGET_RENDERERS[s]) return WIDGET_RENDERERS[s];

  // Try matching any key that is contained in the slug
  for (const key of Object.keys(WIDGET_RENDERERS)) {
    if (s.includes(key)) return WIDGET_RENDERERS[key];
  }
  return null;
}

// ─── Skeleton loader ─────────────────────────────────────────────────────────
function PageSkeleton() {
  return (
    <div className="animate-pulse space-y-6 py-10">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="mx-auto max-w-6xl px-4 space-y-3">
          <div className="h-8 bg-slate-200 rounded-lg w-1/3" />
          <div className="h-4 bg-slate-100 rounded w-2/3" />
          <div className="h-48 bg-slate-100 rounded-xl" />
        </div>
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function DynamicPage({ isHome = false }) {
  const params = useParams();
  const navigate = useNavigate();

  const slug = isHome ? 'home' : params.slug;

  const [page, setPage]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError(null);

    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/pages/slug/${slug}`)
      .then(res => {
        if (!res.ok) throw new Error(res.status === 404 ? 'not_found' : 'error');
        return res.json();
      })
      .then(data => setPage(data))
      .catch(err => {
        if (err.message === 'not_found') {
          // Redirect only if it's not the home page, otherwise just show empty/default
          if (!isHome) navigate('/404', { replace: true });
          else setError('Home page configuration not found. Please create a page with slug "home" in the admin panel.');
        } else {
          setError('Failed to load page. Please try again.');
        }
      })
      .finally(() => setLoading(false));
  }, [slug, isHome, navigate]);

  useEffect(() => {
    if (page && page.meta_title) {
      document.title = page.meta_title;
    }
  }, [page]);

  if (loading) return <PageSkeleton />;

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-slate-500">
        <p>{error}</p>
      </div>
    );
  }

  if (!page) return null;

  const widgets = (page.widget_contents || []).filter(w => w.status === 1);

  return (
    <>

      {widgets.length === 0 ? (
        <div className="flex items-center justify-center min-h-[50vh] text-slate-400">
          <p>No content available for this page yet.</p>
        </div>
      ) : (
        widgets.map((widget, idx) => {
          const renderer = resolveRenderer(widget.widget_slug);

          let content = null;
          try {
            content = widget.widget_content ? JSON.parse(widget.widget_content) : null;
          } catch {
            content = null;
          }

          if (!renderer) {
            // Unknown widget — skip silently in production
            return null;
          }

          return (
            <div key={widget.unique_id || idx}>
              {renderer(content)}
            </div>
          );
        })
      )}
    </>
  );
}
