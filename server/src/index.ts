import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import adminRoutes from './routes/adminRoutes';
import tourRoutes from './routes/tourRoutes';
import hotelRoutes from './routes/hotelRoutes';
import activityRoutes from './routes/activityRoutes';
import activityAttributeRoutes from './routes/activityAttributeRoutes';
import tourAttributeRoutes from './routes/tourAttributeRoutes';
import destinationAttributeRoutes from './routes/destinationAttributeRoutes';
import hotelAttributeRoutes from './routes/hotelAttributeRoutes';
import visaRoutes from './routes/visaRoutes';
import visaCategoryRoutes from './routes/visaCategoryRoutes';
import transportRoutes from './routes/transportRoutes';
import locationRoutes from './routes/locationRoutes';
import pagesRoutes from './routes/pagesRoutes';
import settingsRoutes from './routes/settingsRoutes';
import destinationRoutes from './routes/destinationRoutes';
import blogRoutes from './routes/blogRoutes';
import orderRoutes from './routes/orderRoutes';
import inquiryRoutes from './routes/inquiryRoutes';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/tours', tourRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/activity-attributes', activityAttributeRoutes);
app.use('/api/tour-attributes', tourAttributeRoutes);
app.use('/api/destination-attributes', destinationAttributeRoutes);
app.use('/api/hotel-attributes', hotelAttributeRoutes);
app.use('/api/visas', visaRoutes);
app.use('/api/visa-categories', visaCategoryRoutes);
app.use('/api/transports', transportRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/pages', pagesRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/destinations', destinationRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/inquiries', inquiryRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
