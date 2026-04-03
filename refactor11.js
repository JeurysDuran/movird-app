const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src/components/Panels/AdminPanel.js');
let text = fs.readFileSync(file, 'utf8');

// Añadir el import en la parte superior si no está
if(!text.includes("import ConfigTab")) {
    text = text.replace(/import ReportsTab from '\.\/ReportsTab';/, 
    "import ReportsTab from './ReportsTab';\nimport ConfigTab from './ConfigTab';");
}

// Modificar const TABS para añadir "Ajustes"
text = text.replace(/const TABS = \['Rutas', 'Vehículos', 'Choferes', 'Zonas', 'Reportes'\];/, "const TABS = ['Rutas', 'Vehículos', 'Choferes', 'Zonas', 'Reportes', 'Ajustes'];");

// Añadir la lógica de renderizado tab === 'Ajustes'
// Insertarlo justo después del tab de reportes.
const insertPoint = /\{ \/\* ── TAB REPORTES ── \*\/ \}\n\s*\{ tab === 'Reportes' && <ReportsTab \/> \}/;
text = text.replace(insertPoint, "{ /* ── TAB REPORTES ── */ }\n            { tab === 'Reportes' && <ReportsTab /> }\n            { tab === 'Ajustes' && <ConfigTab /> }");

fs.writeFileSync(file, text);
