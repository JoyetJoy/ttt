import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home/Home';
import About from './pages/About/About';
import TourList from './pages/Tours/TourList';
import TourDetails from './pages/Tours/TourDetails';
import DestinationList from './pages/Destinations/DestinationList';
import DestinationDetails from './pages/Destinations/DestinationDetails';
import HotelList from './pages/Hotels/HotelList';
import HotelDetails from './pages/Hotels/HotelDetails';
import ActivityList from './pages/Activities/ActivityList';
import ActivityDetails from './pages/Activities/ActivityDetails';
import VisaList from './pages/Visas/VisaList';
import VisaDetails from './pages/Visas/VisaDetails';
import TransportList from './pages/Transports/TransportList';
import TransportDetails from './pages/Transports/TransportDetails';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Checkout from './pages/Checkout/Checkout';
import Dashboard from './pages/User/Dashboard';
import Profile from './pages/User/Profile';
import UserBookings from './pages/User/Bookings';
import UserBookingDetails from './pages/User/BookingDetails';
import DynamicPage from './pages/DynamicPage';
import BlogList from './pages/Blogs/BlogList';
import Contact from './pages/Contact/Contact';
import SearchResults from './pages/Search/SearchResults';

import AdminLogin from './pages/Auth/AdminLogin';
import AdminRoute from './components/AdminRoute';
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/Admin/Dashboard/AdminDashboard';
import AdminTourList from './pages/Admin/Tours/TourList';
import AdminTourForm from './pages/Admin/Tours/TourForm';
import AdminHotelList from './pages/Admin/Hotels/HotelList';
import AdminHotelForm from './pages/Admin/Hotels/HotelForm';
import AdminDestinationList from './pages/Admin/Destinations/DestinationList';
import AdminDestinationForm from './pages/Admin/Destinations/DestinationForm';
import AdminPageList from './pages/Admin/Pages/PageList';
import PageForm from './pages/Admin/Pages/PageForm';
import AdminActivityList from './pages/Admin/Activities/ActivityList';
import AdminActivityForm from './pages/Admin/Activities/ActivityForm';
import AdminVisaList from './pages/Admin/Visas/VisaList';
import AdminVisaForm from './pages/Admin/Visas/VisaForm';
import AdminTransportList from './pages/Admin/Transports/TransportList';
import AdminTransportForm from './pages/Admin/Transports/TransportForm';
import AdminCustomerList from './pages/Admin/Customers/AdminCustomerList';
import AdminBlogList from './pages/Admin/Blogs/BlogList';
import AdminBlogForm from './pages/Admin/Blogs/BlogForm';
import AdminSettings from './pages/Admin/Settings/AdminSettings';
import AdminInquiriesList from './pages/Admin/Inquiries/InquiriesList';
import InquiryDetails from './pages/Admin/Inquiries/InquiryDetails';
import AdminBookingList from './pages/Admin/Bookings/BookingList';
import BookingDetails from './pages/Admin/Bookings/BookingDetails';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll to top on route navigation
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);

  useEffect(() => {
    // Scroll to top on page refresh / initial load
    if (window.history.scrollRestoration) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  return null;
}

function App() {
  useEffect(() => {
    // Fetch and apply dynamic primary color globally
    fetch(`${import.meta.env.VITE_API_URL}/settings/theme`)
      .then(res => res.json())
      .then(data => {
        if (data && data.color) {
          const color = data.color;
          document.documentElement.style.setProperty('--primary-color1', color);
          // Convert to RGB for opacity variable
          const hex = color.replace('#', '');
          const r = parseInt(hex.substring(0, 2), 16);
          const g = parseInt(hex.substring(2, 4), 16);
          const b = parseInt(hex.substring(4, 6), 16);
          document.documentElement.style.setProperty('--primary-color1-opc', `${r}, ${g}, ${b}`);
        }
      })
      .catch(err => console.error('Failed to load theme color on startup:', err));
  }, []);

  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <Toaster position="top-center" />
        <Routes>
          {/* Admin Login Route (standalone without MainLayout header/footer) */}
          <Route path="/admin/login" element={<AdminLogin />} />

          <Route path="/" element={<MainLayout />}>
            <Route index element={<DynamicPage isHome={true} />} />
            <Route path="about" element={<About />} />
            <Route path="contact" element={<Contact />} />
            
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            
            {/* Protected User Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="dashboard/bookings" element={<UserBookings />} />
              <Route path="dashboard/bookings/:id" element={<UserBookingDetails />} />
              <Route path="profile" element={<Profile />} />
            </Route>

            <Route path="tours" element={<TourList />} />
            <Route path="tours/:id" element={<TourDetails />} />
            <Route path="destinations" element={<DestinationList />} />
            <Route path="destinations/:id" element={<DestinationDetails />} />
            <Route path="hotels" element={<HotelList />} />
            <Route path="hotels/:id" element={<HotelDetails />} />
            <Route path="activities" element={<ActivityList />} />
            <Route path="activities/:id" element={<ActivityDetails />} />
            <Route path="visas" element={<VisaList />} />
            <Route path="visas/:id" element={<VisaDetails />} />
            <Route path="transports" element={<TransportList />} />
            <Route path="transports/:id" element={<TransportDetails />} />
            <Route path="blogs" element={<BlogList />} />
            <Route path="checkout" element={<Checkout />} />

            {/* Dynamic pages from DB — must be last to avoid shadowing static routes */}
            <Route path="search" element={<SearchResults />} />
            <Route path=":slug" element={<DynamicPage />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="dashboard" element={<AdminDashboard />} />
              
              <Route path="bookings" element={<AdminBookingList />} />
              <Route path="bookings/:id" element={<BookingDetails />} />
              
              <Route path="tours" element={<AdminTourList />} />
              <Route path="tours/create" element={<AdminTourForm />} />
              <Route path="tours/edit/:id" element={<AdminTourForm />} />
              <Route path="tours/view/:id" element={<AdminTourForm />} />
              
              <Route path="hotels" element={<AdminHotelList />} />
              <Route path="hotels/create" element={<AdminHotelForm />} />
              <Route path="hotels/edit/:id" element={<AdminHotelForm />} />
              <Route path="hotels/view/:id" element={<AdminHotelForm />} />
              
              <Route path="destinations" element={<AdminDestinationList />} />
              <Route path="destinations/create" element={<AdminDestinationForm />} />
              <Route path="destinations/edit/:id" element={<AdminDestinationForm />} />
              
              <Route path="activities" element={<AdminActivityList />} />
              <Route path="activities/create" element={<AdminActivityForm />} />
              <Route path="activities/edit/:id" element={<AdminActivityForm />} />
              <Route path="activities/view/:id" element={<AdminActivityForm />} />
              
              <Route path="visas" element={<AdminVisaList />} />
              <Route path="visas/create" element={<AdminVisaForm />} />
              <Route path="visas/edit/:id" element={<AdminVisaForm />} />
              <Route path="visas/view/:id" element={<AdminVisaForm />} />
              
              <Route path="transports" element={<AdminTransportList />} />
              <Route path="transports/create" element={<AdminTransportForm />} />
              <Route path="transports/edit/:id" element={<AdminTransportForm />} />
              <Route path="transports/view/:id" element={<AdminTransportForm />} />
              
              <Route path="customers" element={<AdminCustomerList />} />
              
              <Route path="inquiries" element={<AdminInquiriesList />} />
              <Route path="inquiries/:id" element={<InquiryDetails />} />
              
              <Route path="pages" element={<AdminPageList />} />
              <Route path="pages/edit/:id" element={<PageForm />} />
              
              <Route path="blogs" element={<AdminBlogList />} />
              <Route path="blogs/create" element={<AdminBlogForm />} />
              <Route path="blogs/edit/:id" element={<AdminBlogForm />} />
              
              <Route path="settings" element={<AdminSettings />} />
            </Route>
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
