const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Replace single quotes: 'http://localhost:5000/...' -> `${import.meta.env.VITE_API_BASE_URL}/...`
  content = content.replace(/'http:\/\/localhost:5000([^']*)'/g, '`${import.meta.env.VITE_API_BASE_URL}$1`');
  
  // Replace double quotes: "http://localhost:5000/..." -> `${import.meta.env.VITE_API_BASE_URL}/...`
  content = content.replace(/"http:\/\/localhost:5000([^"]*)"/g, '`${import.meta.env.VITE_API_BASE_URL}$1`');
  
  // Replace backticks: `http://localhost:5000/...` -> `${import.meta.env.VITE_API_BASE_URL}/...`
  content = content.replace(/http:\/\/localhost:5000/g, '${import.meta.env.VITE_API_BASE_URL}');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
}

function traverse(currentDir) {
  const files = fs.readdirSync(currentDir);
  for (const file of files) {
    const fullPath = path.join(currentDir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      traverse(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      processFile(fullPath);
    }
  }
}

traverse(dir);
console.log('Done!');
