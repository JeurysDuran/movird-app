const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src/components/Panels/AdminPanel.js');
let text = fs.readFileSync(file, 'utf8');

// 1. Inyectar estado pickingMode
if(!text.includes('const [isPickingMap, setIsPickingMap] = useState(false);')) {
    text = text.replace(/const \[newZone, setNewZone\] = useState\(\{[\s\S]*?\}\);/m, `$&
    const [isPickingMap, setIsPickingMap] = useState(false);
    
    useEffect(() => {
        const handler = (e) => {
            if (isPickingMap) {
                setNewRoute(prev => {
                    const stops = [...prev.stops, { name: 'Parada ' + (prev.stops.length + 1), lat: Number(e.detail.lat.toFixed(5)), lng: Number(e.detail.lng.toFixed(5)) }];
                    return { ...prev, stops };
                });
                setIsPickingMap(false);
                showToast('Parada añadida desde el mapa', 'accent');
            }
        };
        window.addEventListener('mapClickAnywhere', handler);
        return () => window.removeEventListener('mapClickAnywhere', handler);
    }, [isPickingMap, showToast]);
    `);
}

// 2. Reemplazar inputs manuales con botón de map click en AdminPanel
text = text.replace(/< div style = \{\s*rowStyle\s*\} >\s*< input style = \{\s*\{\s*\.\.\.inputStyle, flex: 2, marginBottom: 0\s*\}\s*\}\s*placeholder = "Nombre de parada"\s*id = "stopName"/m,
`
                            {!isPickingMap ? (
                                <button className="btn btn-ghost btn-block" style={{border: '1px dashed var(--blue)', color: 'var(--blue)', marginBottom: 12}} onClick={() => { setIsPickingMap(true); closePanel(); showToast('Toca el mapa para añadir parada', 'info'); }}>
                                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight: 6, verticalAlign: 'middle'}}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                                    Añadir Parada en el Mapa
                                </button>
                            ) : (
                                <div style={{padding: 12, background: 'var(--blue-dim)', border: '1px solid var(--blue)', borderRadius: 8, color: 'var(--blue)', textAlign: 'center', marginBottom: 12}}>
                                    Selecciona un punto en el mapa... <button onClick={() => { setIsPickingMap(false); showToast('Cancelado', 'info'); }} style={{background:'none', border:'none', color:'var(--danger)', textDecoration:'underline', cursor:'pointer'}}>Cancelar</button>
                                </div>
                            )}

                            <div style={{rowStyle, display: 'none'}}>
                                <input style={{...inputStyle, flex: 2, marginBottom: 0}} placeholder="Nombre de parada" id="stopName"`);

fs.writeFileSync(file, text);
