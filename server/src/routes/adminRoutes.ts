import { Router } from 'express';
import multer from 'multer';
import { getAdminDashboardStats, getAdminCustomers } from '../controllers/adminController';
import { getAdminHotels, createHotel, updateHotel, deleteHotel, getHotelById } from '../controllers/hotelController';
import { getAdminDestinations, getDestinationById, createDestination, updateDestination, deleteDestination } from '../controllers/destinationController';
import { getAdminTours, getTourById, createTour, updateTour, deleteTour } from '../controllers/tourController';
import { getTourCategories, createTourCategory, updateTourCategory, deleteTourCategory } from '../controllers/tourCategoryController';
import { getAdminVisas, getVisaById, createVisa, updateVisa, deleteVisa } from '../controllers/visaController';
import { getAdminPages, getPageById, createPage, updatePage, deletePage } from '../controllers/pageController';
import { getAdminWidgets, updateWidgetContent } from '../controllers/widgetController';
import { uploadGenericFile } from '../controllers/uploadController';
import { getTransportAttributes, createTransportAttribute, updateTransportAttribute, deleteTransportAttribute } from '../controllers/transportAttributeController';
import { getAdminTransports, getTransportById, createTransport, updateTransport, deleteTransport } from '../controllers/transportController';
import { getAdminBlogs, getBlogById as getAdminBlogById, createBlog, updateBlog, deleteBlog } from '../controllers/blogController';
import { getCategories as getBlogCategories, createCategory as createBlogCategory, deleteCategory as deleteBlogCategory } from '../controllers/blogCategoryController';
import { getInquiries, getInquiryById, updateInquiryStatus } from '../controllers/inquiryController';
import { protect } from '../middleware/authMiddleware';
import { adminProtect } from '../middleware/adminMiddleware';
import vehicleRoutes from './admin/vehicleRoutes';
import transportLocationRoutes from './admin/transportLocationRoutes';

const router = Router();
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fieldSize: 25 * 1024 * 1024 } // 25MB limit for large rich text fields
});

// All admin routes are protected and require admin privileges
router.use(protect, adminProtect);

router.get('/dashboard', getAdminDashboardStats);
router.get('/customers', getAdminCustomers);
router.get('/inquiries', getInquiries);
router.get('/inquiries/:id', getInquiryById);
router.put('/inquiries/:id/status', updateInquiryStatus);

router.use('/vehicles', vehicleRoutes);
router.use('/transport-locations', transportLocationRoutes);

router.get('/destinations', getAdminDestinations);
router.get('/destinations/:id', getDestinationById);
router.post('/destinations', upload.fields([{ name: 'features_image', maxCount: 1 }, { name: 'gallery_images', maxCount: 20 }]), createDestination);
router.put('/destinations/:id', upload.fields([{ name: 'features_image', maxCount: 1 }, { name: 'gallery_images', maxCount: 20 }]), updateDestination);
router.delete('/destinations/:id', deleteDestination);

router.get('/hotels', getAdminHotels);
router.get('/hotels/:id', getHotelById);
router.post('/hotels', upload.fields([{ name: 'feature_img', maxCount: 1 }, { name: 'youtube_image', maxCount: 1 }, { name: 'gallery_images', maxCount: 20 }]), createHotel);
router.put('/hotels/:id', upload.fields([{ name: 'feature_img', maxCount: 1 }, { name: 'youtube_image', maxCount: 1 }, { name: 'gallery_images', maxCount: 20 }]), updateHotel);
router.delete('/hotels/:id', deleteHotel);

router.get('/tours', getAdminTours);
router.get('/tours/:id', getTourById);
router.post('/tours', upload.fields([{ name: 'features_image', maxCount: 1 }, { name: 'youtube_image', maxCount: 1 }, { name: 'gallery_images', maxCount: 20 }]), createTour);
router.put('/tours/:id', upload.fields([{ name: 'features_image', maxCount: 1 }, { name: 'youtube_image', maxCount: 1 }, { name: 'gallery_images', maxCount: 20 }]), updateTour);
router.delete('/tours/:id', deleteTour);

// Transport Routes
router.get('/transports', getAdminTransports);
router.get('/transports/:id', getTransportById);
router.post('/transports', upload.fields([{ name: 'feature_img', maxCount: 1 }, { name: 'meta_img', maxCount: 1 }, { name: 'gallery_images', maxCount: 20 }]), createTransport);
router.put('/transports/:id', upload.fields([{ name: 'feature_img', maxCount: 1 }, { name: 'meta_img', maxCount: 1 }, { name: 'gallery_images', maxCount: 20 }]), updateTransport);
router.delete('/transports/:id', deleteTransport);

router.get('/transport-attributes', getTransportAttributes);
router.post('/transport-attributes', createTransportAttribute);
router.put('/transport-attributes/:id', updateTransportAttribute);
router.delete('/transport-attributes/:id', deleteTransportAttribute);

router.get('/tour-categories', getTourCategories);
router.post('/tour-categories', createTourCategory);
router.put('/tour-categories/:id', updateTourCategory);
router.delete('/tour-categories/:id', deleteTourCategory);

// Visa Routes
router.get('/visas', getAdminVisas);
router.get('/visas/:id', getVisaById);
router.post('/visas', upload.fields([{ name: 'features_image', maxCount: 1 }, { name: 'meta_img', maxCount: 1 }]), createVisa);
router.put('/visas/:id', upload.fields([{ name: 'features_image', maxCount: 1 }, { name: 'meta_img', maxCount: 1 }]), updateVisa);
router.delete('/visas/:id', deleteVisa);

// Page Routes
router.get('/pages', getAdminPages);
router.get('/pages/:id', getPageById);
router.post('/pages', createPage);
router.put('/pages/:id', updatePage);
router.delete('/pages/:id', deletePage);

// Blog Routes
router.get('/blogs', getAdminBlogs);
router.get('/blogs/:id', getAdminBlogById);
router.post('/blogs', upload.fields([{ name: 'image', maxCount: 1 }]), createBlog);
router.put('/blogs/:id', upload.fields([{ name: 'image', maxCount: 1 }]), updateBlog);
router.delete('/blogs/:id', deleteBlog);

// Blog Categories Routes
router.get('/blog-categories', getBlogCategories);
router.post('/blog-categories', createBlogCategory);
router.delete('/blog-categories/:id', deleteBlogCategory);

// Widget Routes
router.get('/widgets', getAdminWidgets);
router.put('/widget-content/:unique_id', upload.any(), updateWidgetContent);

// Generic Upload Route
router.post('/upload', upload.single('file'), uploadGenericFile);

export default router;
