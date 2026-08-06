const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'index.ts');
let content = fs.readFileSync(filePath, 'utf-8');

if (!content.includes('destinationAttributeRoutes')) {
  content = content.replace(
    "import activityAttributeRoutes from './routes/activityAttributeRoutes';",
    "import activityAttributeRoutes from './routes/activityAttributeRoutes';\nimport destinationAttributeRoutes from './routes/destinationAttributeRoutes';\nimport hotelAttributeRoutes from './routes/hotelAttributeRoutes';"
  );
}

if (!content.includes('/api/destination-attributes')) {
  content = content.replace(
    "app.use('/api/activity-attributes', activityAttributeRoutes);",
    "app.use('/api/activity-attributes', activityAttributeRoutes);\napp.use('/api/destination-attributes', destinationAttributeRoutes);\napp.use('/api/hotel-attributes', hotelAttributeRoutes);"
  );
}

fs.writeFileSync(filePath, content, 'utf-8');
console.log('index.ts patched!');
