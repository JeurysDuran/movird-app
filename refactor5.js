const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src/components/Panels/AdminPanel.js');
let text = fs.readFileSync(file, 'utf8');

// Replace "< \n [spaces] element"
text = text.replace(/<\s*\n\s*/g, '<');
// Replace "/ >" and "/ \n >"
text = text.replace(/\/\s*>/g, '/>');
text = text.replace(/\/\s*\n\s*>/g, '/>');
// Replace "> \n" that are broken? No, just the "<" and ">" spacing issues.
// Let's specifically target the common breakage:
text = text.replace(/<\s+([a-zA-Z\/])/g, '<$1');
text = text.replace(/<\s*\n\s*([a-zA-Z\/])/g, '<$1');

fs.writeFileSync(file, text);
console.log("Fixed AdminPanel tags");
