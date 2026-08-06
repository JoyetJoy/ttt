import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const getPageTitle = (pathname) => {
  if (pathname.includes('/admin/dashboard')) return 'Dashboard';
  if (pathname.includes('/admin/hotels')) return 'Manage Hotels';
  if (pathname.includes('/admin/destinations')) return 'Manage Destinations';
  if (pathname.includes('/admin/tours')) return 'Manage Tours';
  if (pathname.includes('/admin/activities')) return 'Manage Activities';
  if (pathname.includes('/admin/visas')) return 'Manage Visas';
  if (pathname.includes('/admin/transports')) return 'Manage Transports';
  if (pathname.includes('/admin/bookings')) return 'Manage Bookings';
  if (pathname.includes('/admin/transactions')) return 'Transactions';
  if (pathname.includes('/admin/staff')) return 'Manage Staff';
  if (pathname.includes('/admin/advertisements')) return 'Advertisements';
  if (pathname.includes('/admin/customers')) return 'Manage Customers';
  if (pathname.includes('/admin/enquiries')) return 'Enquiries';
  if (pathname.includes('/admin/pages')) return 'Manage Pages';
  if (pathname.includes('/admin/menu')) return 'Menu Settings';
  if (pathname.includes('/admin/blogs')) return 'Manage Blogs';
  if (pathname.includes('/admin/email-templates')) return 'Email Templates';
  if (pathname.includes('/admin/tickets')) return 'Ticket / Support';
  if (pathname.includes('/admin/payment-methods')) return 'Payment Methods';
  if (pathname.includes('/admin/locations')) return 'Manage Locations';
  if (pathname.includes('/admin/contacts')) return 'Contacts';
  if (pathname.includes('/admin/settings/backend')) return 'Backend Settings';
  if (pathname.includes('/admin/settings/frontend')) return 'Frontend Settings';
  if (pathname.includes('/admin/settings')) return 'Theme Settings';
  if (pathname.includes('/admin/license')) return 'License Verify';

  return 'Admin Control Panel';
};

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const pageTitle = getPageTitle(location.pathname);

  return (
    <div className="flex h-screen bg-gray-100">

      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="px-4 py-3 bg-gray-800 text-center font-bold text-xl tracking-wider">
          GATEWAY Admin
        </div>
        <nav className="flex-1 overflow-y-auto py-1 scrollbar-dark">
          <ul className="space-y-1 text-[15px] tracking-wide">
            <li><Link to="/admin/dashboard" className="block px-5 py-2.5 hover:bg-gray-800 hover:text-indigo-400 transition">Dashboard</Link></li>
            {/* <li><Link to="/admin/hotels" className="block px-5 py-2.5 hover:bg-gray-800 hover:text-indigo-400 transition">Hotel</Link></li> */}
            <li><Link to="/admin/destinations" className="block px-5 py-2.5 hover:bg-gray-800 hover:text-indigo-400 transition">Destination</Link></li>
            <li><Link to="/admin/tours" className="block px-5 py-2.5 hover:bg-gray-800 hover:text-indigo-400 transition">Tour</Link></li>
            <li><Link to="/admin/activities" className="block px-5 py-2.5 hover:bg-gray-800 hover:text-indigo-400 transition">Activities</Link></li>
            <li><Link to="/admin/visas" className="block px-5 py-2.5 hover:bg-gray-800 hover:text-indigo-400 transition">Visa</Link></li>
            <li><Link to="/admin/transports" className="block px-5 py-2.5 hover:bg-gray-800 hover:text-indigo-400 transition">Transport</Link></li>
            <li><Link to="/admin/bookings" className="block px-5 py-2.5 hover:bg-gray-800 hover:text-indigo-400 transition">Booking</Link></li>
            {/* <li><Link to="/admin/transactions" className="block px-5 py-2.5 hover:bg-gray-800 hover:text-indigo-400 transition">Transaction</Link></li> */}
            {/* <li><Link to="/admin/staff" className="block px-5 py-2.5 hover:bg-gray-800 hover:text-indigo-400 transition">Staff</Link></li> */}
            {/* <li><Link to="/admin/advertisements" className="block px-5 py-2.5 hover:bg-gray-800 hover:text-indigo-400 transition">Advertisement</Link></li> */}
            <li><Link to="/admin/customers" className="block px-5 py-2.5 hover:bg-gray-800 hover:text-indigo-400 transition">Customer</Link></li>
            <li><Link to="/admin/inquiries" className="block px-5 py-2.5 hover:bg-gray-800 hover:text-indigo-400 transition">Inquiries</Link></li>
            {/* <li><Link to="/admin/enquiries" className="block px-5 py-2.5 hover:bg-gray-800 hover:text-indigo-400 transition">Enquiry</Link></li> */}
            {/* <li><Link to="/admin/pages" className="block px-5 py-2.5 hover:bg-gray-800 hover:text-indigo-400 transition">Pages</Link></li> */}
            {/* <li><Link to="/admin/menu" className="block px-5 py-2.5 hover:bg-gray-800 hover:text-indigo-400 transition">Menu</Link></li> */}
            <li><Link to="/admin/blogs" className="block px-5 py-2.5 hover:bg-gray-800 hover:text-indigo-400 transition">Blogs</Link></li>
            {/* <li><Link to="/admin/email-templates" className="block px-5 py-2.5 hover:bg-gray-800 hover:text-indigo-400 transition">Email Template</Link></li> */}
            {/* <li><Link to="/admin/tickets" className="block px-5 py-2.5 hover:bg-gray-800 hover:text-indigo-400 transition">Ticket/Support</Link></li> */}
            {/* <li><Link to="/admin/payment-methods" className="block px-5 py-2.5 hover:bg-gray-800 hover:text-indigo-400 transition">Payment Method</Link></li> */}
            {/* <li><Link to="/admin/locations" className="block px-5 py-2.5 hover:bg-gray-800 hover:text-indigo-400 transition">Location</Link></li> */}
            {/* <li><Link to="/admin/contacts" className="block px-5 py-2.5 hover:bg-gray-800 hover:text-indigo-400 transition">Contacts</Link></li> */}
            {/* <li><Link to="/admin/settings/backend" className="block px-5 py-2.5 hover:bg-gray-800 hover:text-indigo-400 transition">Backend Setting</Link></li> */}
            {/* <li><Link to="/admin/settings/frontend" className="block px-5 py-2.5 hover:bg-gray-800 hover:text-indigo-400 transition">Frontend Setting</Link></li> */}
            {/* <li><Link to="/admin/settings" className="block px-5 py-2.5 hover:bg-gray-800 hover:text-indigo-400 transition">Theme Setting</Link></li> */}
            {/* <li><Link to="/admin/license" className="block px-5 py-2.5 hover:bg-gray-800 hover:text-indigo-400 transition">License Verify</Link></li> */}
          </ul>
        </nav>
        <div className="p-4 bg-gray-800">
          <Link to="/" className="block text-center px-4 py-2 bg-gray-700 rounded hover:bg-gray-600 transition text-sm">Return to Main Site</Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white shadow-sm h-[84px] flex items-center justify-between px-6 z-10 border-b border-gray-100">
          <div className="flex flex-col justify-center">
            <h2 className="text-[22px] font-bold text-slate-800 tracking-tight leading-tight">{pageTitle}</h2>
            <div className="text-[14px] mt-1 flex items-center gap-2">
              <Link to="/admin/dashboard" className="text-indigo-600 hover:text-indigo-700 transition">Home</Link>
              <span className="text-slate-300">/</span>
              <span className="text-slate-600">{pageTitle}</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-600">Logged in as {user?.name} (Admin)</span>
            <button onClick={handleLogout} className="text-sm bg-red-50 text-red-600 px-3 py-1.5 rounded hover:bg-red-100 transition">
              Logout
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#F4F6F9] p-3 md:p-4 lg:p-5">
          <Outlet />
        </main>
      </div>

    </div>
  );
}
