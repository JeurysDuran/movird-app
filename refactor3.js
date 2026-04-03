const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src/components/Layout/BottomDock.js');

let text = fs.readFileSync(file, 'utf8');

text = text.replace(/return \( <\n\s*div id = "bottom-dock" >[\s\S]*\);\n\};/m, 
`return (
    <div id="bottom-dock">
        <div className="dock-inner glass">
            <button className={\`dock-btn \${activeView === 'map' ? 'active' : ''}\`} onClick={() => handleClick('map', null)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="3,6 9,3 15,6 21,3 21,18 15,21 9,18 3,21" />
                    <line x1="9" y1="3" x2="9" y2="18" />
                    <line x1="15" y1="6" x2="15" y2="21" />
                </svg>
                Mapa
            </button>
            <button className={\`dock-btn \${activeView === 'routes' ? 'active' : ''}\`} onClick={() => handleClick('routes', 'routes-panel')}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 12h18M3 6h18M3 18h18" />
                    <circle cx="6" cy="12" r="2" fill="currentColor" />
                </svg>
                Rutas
            </button>
            <button className={\`dock-btn \${activeView === 'pay' ? 'active' : ''}\`} onClick={() => handleClick('pay', 'payment-panel')}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="5" width="20" height="14" rx="2" />
                    <line x1="2" y1="10" x2="22" y2="10" />
                </svg>
                Pagos
            </button>
            <button className={\`dock-btn \${activeView === 'security' ? 'active' : ''}\`} onClick={() => handleClick('security', 'security-panel')}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                Seguridad
            </button>
            {(isAdmin || isDriver) && (
                <button className={\`dock-btn \${activeView === 'admin' ? 'active' : ''}\`} onClick={() => handleClick('admin', 'admin-panel')}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="7" height="7" />
                        <rect x="14" y="3" width="7" height="7" />
                        <rect x="14" y="14" width="7" height="7" />
                        <rect x="3" y="14" width="7" height="7" />
                    </svg>
                    Panel
                </button>
            )}
        </div>
    </div>
);
};`);

fs.writeFileSync(file, text);
