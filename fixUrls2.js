const fs = require('fs');
const path = require('path');
const dir = 'd:/node-js-tutorial/perfume-project/front-end/material-dashboard-react-main/src';

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else if (file.endsWith('.js')) { 
      results.push(file);
    }
  });
  return results;
}

const files = walk(dir);

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  let changed = false;

  // 1) Replace const API_URL = "http://localhost:5000";
  if (content.includes('const API_URL = "http://localhost:5000";')) {
    content = content.replace('const API_URL = "http://localhost:5000";', 'const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";');
    changed = true;
  }
  
  // 2) Replace template literals `http://localhost:5000${...}`
  // We only replace exact match of http://localhost:5000 if it's not already replaced
  if (content.includes('`http://localhost:5000')) {
    content = content.split('`http://localhost:5000').join('`${process.env.REACT_APP_API_URL || "http://localhost:5000"}');
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(f, content, 'utf8');
  }
});
console.log('Fixed URLs correctly');
