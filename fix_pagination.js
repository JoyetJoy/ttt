const fs = require('fs');
const path = require('path');

const config = [
  // Customer pages
  { file: 'client/src/pages/Activities/ActivityList.jsx', array: 'sortedActivities', limit: 9, depth: '../../' },
  { file: 'client/src/pages/Blogs/BlogList.jsx', array: 'filteredBlogs', limit: 9, depth: '../../' },
  { file: 'client/src/pages/Destinations/DestinationList.jsx', array: 'destinations', limit: 9, depth: '../../' },
  { file: 'client/src/pages/Hotels/HotelList.jsx', array: 'hotels', limit: 9, depth: '../../' },
  { file: 'client/src/pages/Tours/TourList.jsx', array: 'sortedTours', limit: 9, depth: '../../' },
  { file: 'client/src/pages/Transports/TransportList.jsx', array: 'sortedTransports', limit: 9, depth: '../../' },
  { file: 'client/src/pages/Visas/VisaList.jsx', array: 'visas', limit: 9, depth: '../../' },
  // Admin pages
  { file: 'client/src/pages/Admin/Activities/ActivityList.jsx', array: 'filteredActivities', limit: 10, depth: '../../../' },
  { file: 'client/src/pages/Admin/Blogs/BlogList.jsx', array: 'filteredBlogs', limit: 10, depth: '../../../' },
  { file: 'client/src/pages/Admin/Bookings/BookingList.jsx', array: 'filteredBookings', limit: 10, depth: '../../../' },
  { file: 'client/src/pages/Admin/Customers/AdminCustomerList.jsx', array: 'filteredCustomers', limit: 10, depth: '../../../' },
  { file: 'client/src/pages/Admin/Destinations/DestinationList.jsx', array: 'filteredDestinations', limit: 10, depth: '../../../' },
  { file: 'client/src/pages/Admin/Hotels/AdminHotelList.jsx', array: 'filteredHotels', limit: 10, depth: '../../../' },
  { file: 'client/src/pages/Admin/Hotels/HotelList.jsx', array: 'filteredHotels', limit: 10, depth: '../../../' },
  { file: 'client/src/pages/Admin/Inquiries/InquiriesList.jsx', array: 'filteredInquiries', limit: 10, depth: '../../../' },
  { file: 'client/src/pages/Admin/Pages/PageList.jsx', array: 'filteredPages', limit: 10, depth: '../../../' },
  { file: 'client/src/pages/Admin/Tours/TourList.jsx', array: 'filteredTours', limit: 10, depth: '../../../' },
  { file: 'client/src/pages/Admin/Transports/TransportList.jsx', array: 'filteredTransports', limit: 10, depth: '../../../' },
  { file: 'client/src/pages/Admin/Visas/VisaList.jsx', array: 'filteredVisas', limit: 10, depth: '../../../' }
];

config.forEach(({ file, array, limit, depth }) => {
  if (!fs.existsSync(file)) {
    console.log(`Skipping missing file: ${file}`);
    return;
  }
  
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // 1. Add Pagination import
  if (!content.includes('import Pagination')) {
    content = content.replace(/(import React.*?;\n)/, `$1import Pagination from '${depth}components/Pagination';\n`);
  }

  // 2. Add currentPage state
  if (!content.includes('currentPage')) {
    if (content.includes('const [loading, setLoading] = useState')) {
      content = content.replace(/(const \[loading, setLoading\] = useState.*?;\n)/, 
        `$1  const [currentPage, setCurrentPage] = useState(1);\n  const ITEMS_PER_PAGE = ${limit};\n`);
    } else {
      content = content.replace(/(const \[.*?\] = useState.*?;\n)/, 
        `$1  const [currentPage, setCurrentPage] = useState(1);\n  const ITEMS_PER_PAGE = ${limit};\n`);
    }
  }

  // 3. Slice paginatedData
  if (!content.includes('paginatedData')) {
    content = content.replace(/(return \()/g, 
      `const paginatedData = ${array}.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);\n\n  $1`);
  }

  // 4. Change array.map to paginatedData.map
  let mapRegex = new RegExp(`${array}\\.map\\(`, 'g');
  if (content.match(mapRegex)) {
    content = content.replace(mapRegex, `paginatedData.map(`);
  }

  // 5. Inject <Pagination />
  if (file.includes('/Admin/')) {
    if (!content.includes('<Pagination')) {
      content = content.replace(/(<\/tbody>\s*<\/table>\s*<\/div>)/, 
        `$1\n        <div className="p-4 border-t border-gray-100 flex justify-center bg-white"><Pagination currentPage={currentPage} totalPages={Math.ceil(${array}.length / ITEMS_PER_PAGE)} onPageChange={setCurrentPage} /></div>`);
    }
  } else {
    if (!content.includes('<Pagination')) {
      content = content.replace(/(paginatedData\.map[\s\S]*?\n\s*\}\)?\s*<\/div>)/, 
        `$1\n              <div className="w-full mt-8 flex justify-center"><Pagination currentPage={currentPage} totalPages={Math.ceil(${array}.length / ITEMS_PER_PAGE)} onPageChange={setCurrentPage} /></div>`);
    }
  }

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated: ${file}`);
  }
});
