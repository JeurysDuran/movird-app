const fs = require('fs');
const path = require('path');

const getCarSvg = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 14h16M4 14v4a2 2 0 0 0 2 2h1v2a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-2h2v2a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-2h1a2 2 0 0 0 2-2v-4M4 14V6a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v8M8 10h8M6 18h.01M18 18h.01" strokeLinecap="round"/></svg>`;
const getPinSvg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`;

function fixMapComponent() {
    const file = path.join(__dirname, 'src/components/Map/MapComponent.js');
    let text = fs.readFileSync(file, 'utf8');

    // Mapeo de TYPE_ICONS
    text = text.replace(/var TYPE_ICONS = \{[\s\S]*?\};/m, `var TYPE_ICONS = {
    'Metro': '<div style="background:var(--purple);border-radius:50%;width:30px;height:30px;display:flex;align-items:center;justify-content:center;color:#fff"><svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 22h16M12 2v20M5 8h14M5 14h14M16 4a4 4 0 0 0-8 0v18a4 4 0 0 0 8 0V4z"/></svg></div>',
    'OMSA': '<div style="background:var(--blue);border-radius:50%;width:30px;height:30px;display:flex;align-items:center;justify-content:center;color:#fff">'+'${getCarSvg}'+'</div>',
    'Concho': '<div style="background:var(--warn);border-radius:50%;width:30px;height:30px;display:flex;align-items:center;justify-content:center;color:#fff">'+'${getCarSvg}'+'</div>',
    'Teleferico': '<div style="background:var(--accent);border-radius:50%;width:30px;height:30px;display:flex;align-items:center;justify-content:center;color:#fff"><svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 10l14-4v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-8zM1 4h22M12 4v6"/></svg></div>',
};
var DEFAULT_ICON = '<div style="background:var(--text2);border-radius:50%;width:30px;height:30px;display:flex;align-items:center;justify-content:center;color:#fff">'+'${getCarSvg}'+'</div>';`);

    // Iconos de vehiculo en el create (var vIcon = L.divIcon...)
    text = text.replace(/html: '<div style="font-size:24px; filter:drop-shadow\(0 2px 4px rgba\(0,0,0,\.3\)\)">' \+ \(TYPE_ICONS\[v.type\] \|\| '🚌'\) \+ '<\/div>'/g, 
        `html: '<div style="filter:drop-shadow(0 4px 6px rgba(0,0,0,.15)); transition: transform .3s ease">' + (TYPE_ICONS[v.type] || DEFAULT_ICON) + '</div>'`);

    // Emoji search marker replacement en useEffect
    text = text.replace(/var pIcon = window\.L\.divIcon\(\{\s*className: '',\s*html: '<div style="font-size:30px;filter:drop-shadow\(0 4px 6px rgba\(0,0,0,\.3\)\)">📍<\/div>',\s*iconSize: \[30, 30\],\s*iconAnchor: \[15, 30\]\s*\}\);/m, 
`var pIcon = window.L.divIcon({ className: '', html: ('<div style="background:#fff;border-radius:50%;padding:4px;box-shadow:var(--shadow-sm);display:flex;align-items:center;justify-content:center;">' + \`${getPinSvg}\` + '</div>'), iconSize: [34, 34], iconAnchor: [17, 34] });`);

    fs.writeFileSync(file, text);
}

function fixSearchPanel() {
    const file = path.join(__dirname, 'src/components/Panels/SearchPanel.js');
    let text = fs.readFileSync(file, 'utf8');
    text = text.replace(/🚌 Ver guaguas y montarme/g, "Ver rutas y montarme");
    fs.writeFileSync(file, text);
}

function fixMockData() {
    const file = path.join(__dirname, 'src/data/mockData.js');
    let text = fs.readFileSync(file, 'utf8');
    text = text.replace(/logo: '🚌'/g, "logo: '🚐'"); // Se sustituirá más adelante en UI, por ahora lo dejamos como string unicode limpio sin depender tanto de svg in mock. Mock es solo data.
    text = text.replace(/icon: '🚌'/g, "icon: 'bus'");
    fs.writeFileSync(file, text);
}

fixMapComponent();
fixSearchPanel();
fixMockData();
