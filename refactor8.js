const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src/components/Panels/AdminPanel.js');
let text = fs.readFileSync(file, 'utf8');

// Añadir el import en la parte superior si no está
if(!text.includes("import ReportsTab")) {
    text = text.replace(/import { TRANSPORT_TYPES, RISK_LEVELS } from '\.\.\/\.\.\/data\/mockData';/, 
    "import { TRANSPORT_TYPES, RISK_LEVELS } from '../../data/mockData';\nimport ReportsTab from './ReportsTab';");
}

// Reemplazar la renderización de la pestaña de Reportes
const startStr = "{ /* ── TAB REPORTES ──────────────────────────── */ }";
const endStr = "        </div> </"; // donde termina el bloque 

const startIndex = text.indexOf(startStr);
if (startIndex !== -1) {
    // Buscar la llave final del bloque de reportes (antes de div div)
    // El string exacto de cierre del tag condicional era `} </div>` o parecido.
    // Usaremos replace sobre un string amplio.
    const oldReportTabRegex = /\{ \/\* ── TAB REPORTES[\s\S]*?tab === 'Reportes' && \([\s\S]*?transactions\.map\(t => \([\s\S]*?\)\)[\s\S]*?\}\s*<\/div>\s*\)\s*\}/;
    
    text = text.replace(oldReportTabRegex, "{ /* ── TAB REPORTES ── */ }\n            { tab === 'Reportes' && <ReportsTab /> }");
}

fs.writeFileSync(file, text);
