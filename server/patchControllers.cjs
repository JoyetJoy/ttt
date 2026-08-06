const fs = require('fs');
const path = require('path');

const destCtrlPath = path.join(__dirname, 'src', 'controllers', 'destinationController.ts');
let destContent = fs.readFileSync(destCtrlPath, 'utf-8');

// destination create
destContent = destContent.replace(
  'enable_seo: data.enable_seo,',
  'enable_seo: data.enable_seo,\n        attribute_terms: data.attribute_terms || null,'
);

// destination update (find the update block)
destContent = destContent.replace(
  'enable_seo: data.enable_seo,',
  'enable_seo: data.enable_seo,\n        attribute_terms: data.attribute_terms || null,'
);

fs.writeFileSync(destCtrlPath, destContent, 'utf-8');


const hotelCtrlPath = path.join(__dirname, 'src', 'controllers', 'hotelController.ts');
let hotelContent = fs.readFileSync(hotelCtrlPath, 'utf-8');

// hotel create
hotelContent = hotelContent.replace(
  'enable_seo: data.enable_seo,',
  'enable_seo: data.enable_seo,\n        attribute_terms: data.attribute_terms || null,'
);

// hotel update
hotelContent = hotelContent.replace(
  'enable_seo: data.enable_seo,',
  'enable_seo: data.enable_seo,\n        attribute_terms: data.attribute_terms || null,'
);

fs.writeFileSync(hotelCtrlPath, hotelContent, 'utf-8');
console.log('Controllers patched!');
