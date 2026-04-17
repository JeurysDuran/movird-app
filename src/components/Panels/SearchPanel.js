// src/components/Panels/SearchPanel.js
import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { MdLocationOn, MdSearch, MdDirectionsTransit, MdMap } from 'react-icons/md';

const SearchPanel = () => {
    const { activePanel, closePanel, routes, vehicles, openPanel, haversine } = useApp();
    const [query, setQuery] = useState('');
    const [places, setPlaces] = useState([]);
    const [searchingPlaces, setSearchingPlaces] = useState(false);

    const isOpen = activePanel === 'search';

    // Búsqueda de rutas locales
    const filteredRoutes = useMemo(() => {
        if (!query.trim()) return routes;
        const q = query.toLowerCase();
        return routes.filter(r =>
            r.name.toLowerCase().includes(q) ||
            r.type.toLowerCase().includes(q) ||
            r.stops.some(s => s.name.toLowerCase().includes(q))
        );
    }, [query, routes]);

    // Búsqueda de lugares (Nominatim API)
    useEffect(() => {
        if (!query.trim() || query.length < 3) {
            setPlaces([]);
            return;
        }
        
        const timeoutId = setTimeout(() => {
            setSearchingPlaces(true);
            fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&countrycodes=do&limit=4`)
                .then(res => res.json())
                .then(data => {
                    setPlaces(data);
                    setSearchingPlaces(false);
                })
                .catch(() => {
                    setPlaces([]);
                    setSearchingPlaces(false);
                });
        }, 800); // 800ms debounce

        return () => clearTimeout(timeoutId);
    }, [query]);

    // Lógica para cuando se selecciona un lugar
    const handleSelectPlace = (place) => {
        const lat = parseFloat(place.lat);
        const lng = parseFloat(place.lon);
        
        // Enfocar en mapa
        window.dispatchEvent(new CustomEvent('focusZone', { detail: { lat, lng } }));

        // Buscar ruta más cercana al lugar
        let bestRoute = null;
        let bestDist = 2.0; // 2km max

        routes.forEach(route => {
            route.stops.forEach(stop => {
                const dist = haversine(lat, lng, stop.lat, stop.lng);
                if (dist < bestDist) {
                    bestDist = dist;
                    bestRoute = route;
                }
            });
        });

        if (bestRoute) {
            setTimeout(() => {
                window.dispatchEvent(new CustomEvent('selectRoute', { detail: bestRoute }));
            }, 600); // esperar vuelo del mapa
        }

        closePanel();
    };

    const handleSelectRoute = (route) => {
        window.dispatchEvent(new CustomEvent('selectRoute', { detail: route }));
        closePanel();
    };

    const vehiclesOnRoute = (routeId) => vehicles.filter(v => v.routeId === routeId);

    const typeTagClass = {
        OMSA: 'tag-omsa',
        Metro: 'tag-metro',
        Concho: 'tag-concho',
        Teleferico: 'tag-teleferico',
        Motoconcho: 'tag-moto'
    };

    const occColors = { Vacio: '#00d4a0', Medio: '#ff9a3c', Lleno: '#ff3b5c' };

    return (
        <>
            <div className={`panel-overlay ${isOpen ? 'open' : ''}`} onClick={closePanel} />
            <div className={`panel glass ${isOpen ? 'open' : ''}`}>
                <div className="panel-handle" />
                <div className="panel-header">
                    <span className="panel-title"><MdDirectionsTransit /> Rutas de Transporte</span>
                    <button className="panel-close" onClick={closePanel}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>
                
                <div style={{ padding: '10px 20px 0' }}>
                    <div className="input-wrap">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                        <input
                            className="input-field"
                            placeholder="Buscar ruta, parada o lugar..."
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            autoFocus={isOpen}
                        />
                    </div>
                </div>


                <div className="panel-body">
                    {/* Sección Lugares */}
                    {(places.length > 0 || searchingPlaces) && (
                        <div style={{ marginBottom: 20 }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text2)', marginBottom: 10, paddingLeft: 4 }}>LUGARES</div>
                            {searchingPlaces && <div style={{ fontSize: 12, color: 'var(--text2)', paddingLeft: 4 }}>Buscando lugares...</div>}
                            
                            {!searchingPlaces && places.map(place => (
                                <div key={place.place_id} className="card" style={{ cursor: 'pointer', marginBottom: 8, padding: '10px 14px' }} onClick={() => handleSelectPlace(place)}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <div style={{ fontSize: 20 }}><MdLocationOn /></div>
                                        <div>
                                            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>
                                                {place.display_name.split(',')[0]}
                                            </div>
                                            <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '240px' }}>
                                                {place.display_name}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Sección Rutas */}
                    {(filteredRoutes.length > 0) && (
                        <div>
                            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text2)', marginBottom: 10, paddingLeft: 4 }}>RUTAS DE TRANSPORTE</div>
                            {filteredRoutes.map(route => {
                                const routeVehicles = vehiclesOnRoute(route.id);
                                const busiest = routeVehicles.length > 0
                                    ? routeVehicles.sort((a, b) => {
                                        const order = { Lleno: 2, Medio: 1, Vacio: 0 };
                                        return (order[b.occupancy] || 0) - (order[a.occupancy] || 0);
                                    })[0]
                                    : null;

                                return (
                                    <div key={route.id} className="card" style={{ cursor: 'pointer', marginBottom: 10 }} onClick={() => handleSelectRoute(route)}>
                                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5 }}>
                                                    <span className={`transport-tag ${typeTagClass[route.type] || 'tag-omsa'}`}>{route.type}</span>
                                                    <span style={{ fontSize: 13, fontWeight: 700 }}>{route.name}</span>
                                                </div>

                                                <div style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 6 }}>
                                                    {route.stops.map(s => s.name).join(' → ')}
                                                </div>

                                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                    <span style={{ color: 'var(--accent)', fontSize: 12, fontWeight: 700 }}>RD${route.price}</span>
                                                    <span style={{ color: 'var(--text2)', fontSize: 11 }}>{route.stops.length} paradas</span>
                                                    {routeVehicles.length > 0 && (
                                                        <span style={{ fontSize: 11, color: 'var(--text2)' }}>
                                                            {routeVehicles.length} guagua{routeVehicles.length !== 1 ? 's' : ''}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {busiest && (
                                                <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                                                    <span style={{
                                                        fontSize: 10,
                                                        fontWeight: 700,
                                                        color: occColors[busiest.occupancy] || 'var(--text2)',
                                                        background: (occColors[busiest.occupancy] || '#8899bb') + '22',
                                                        padding: '2px 7px',
                                                        borderRadius: 100
                                                    }}>
                                                        {busiest.occupancy}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {routeVehicles.length > 0 && (
                                            <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                                                {routeVehicles.map(v => (
                                                    <span key={v.id} style={{
                                                        fontSize: 10,
                                                        fontWeight: 700,
                                                        background: 'var(--surface3)',
                                                        borderRadius: 6,
                                                        padding: '3px 7px',
                                                        color: occColors[v.occupancy] || 'var(--text2)'
                                                    }}>
                                                        {v.id} · {v.occupancy}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {!searchingPlaces && places.length === 0 && filteredRoutes.length === 0 && (
                        <div style={{ textAlign: 'center', marginTop: 32, padding: '0 20px' }}>
                            {query.trim() ? (
                                <>
                                    <div style={{ fontSize: 32, marginBottom: 10 }}><MdSearch /></div>
                                    <p style={{ color: 'var(--text2)', fontSize: 13 }}>
                                        No se encontraron resultados para <strong style={{ color: 'var(--text)' }}>"{query}"</strong>
                                    </p>
                                </>
                            ) : routes.length === 0 ? (
                                <>
                                    <div style={{ fontSize: 40, marginBottom: 12 }}><MdDirectionsTransit /></div>
                                    <p style={{ color: 'var(--text)', fontSize: 15, fontWeight: 700, marginBottom: 6 }}>No hay rutas disponibles aún</p>
                                    <p style={{ color: 'var(--text2)', fontSize: 12, lineHeight: 1.5 }}>
                                        El administrador aún no ha creado rutas de transporte. Cuando las cree, aparecerán aquí.
                                    </p>
                                </>
                            ) : (
                                <>
                                    <div style={{ fontSize: 32, marginBottom: 10 }}><MdMap /></div>
                                    <p style={{ color: 'var(--text2)', fontSize: 13 }}>
                                        Escribe el nombre de una ruta o lugar para buscar
                                    </p>
                                </>
                            )}
                        </div>
                    )}

                    {routes.length > 0 && !query.trim() && (
                        <button onClick={() => { closePanel(); setTimeout(() => openPanel('boarding'), 100); }} className="btn btn-accent btn-block" style={{ marginTop: 8 }}>
                            <MdDirectionsTransit style={{marginRight: 8, verticalAlign: 'middle'}} /> Montarme en una ruta
                        </button>
                    )}
                </div>
            </div>
        </>
    );
};

export default SearchPanel;