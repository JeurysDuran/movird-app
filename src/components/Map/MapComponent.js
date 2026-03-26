// src/components/Map/MapComponent.js
import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';

const OCCUPANCY_COLORS = {
    'Vacio': '#00d4a0',
    'Vacío': '#00d4a0',
    'Medio': '#ff9a3c',
    'Lleno': '#ff3b5c'
};

const TYPE_ICONS = {
    'OMSA': '🚌',
    'Concho': '🚕',
    'Metro': 'M',
    'Teleferico': '🚡',
    'Motoconcho': '🏍'
};

const RISK_COLORS = {
    Alto: '#ff3b5c',
    Medio: '#ff9a3c',
    Bajo: '#00d4a0'
};

const MapComponent = () => {
    const {
        vehicles,
        dangerZones,
        routes,
        setMap,
        currentUser,
        userLocation,
        getETA,
        addDangerZone,
        openPanel,
        showToast
    } = useApp();

    const containerRef = useRef(null);
    const mapRef = useRef(null);
    const markersRef = useRef([]);
    const userMarkerRef = useRef(null);
    const routeLineRef = useRef(null);
    const isInitializedRef = useRef(false);
    const [pendingDangerMode, setPendingDangerMode] = useState(false);
    const pendingDangerRef = useRef(false);

    // ── INICIALIZAR MAPA ───────────────────────────────────────────
    const initializeMap = () => {
        if (typeof window.L === 'undefined') {
            setTimeout(initializeMap, 500);
            return;
        }
        const mapElement = containerRef.current;
        if (!mapElement) { setTimeout(initializeMap, 100); return; }
        if (mapRef.current || isInitializedRef.current) return;

        try {
            const map = window.L.map(mapElement, {
                center: [18.479, -69.9],
                zoom: 13,
                zoomControl: false,
                attributionControl: false
            });

            window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap'
            }).addTo(map);

            map.locate({ setView: true, maxZoom: 15 });
            map.on('locationerror', () => map.setView([18.479, -69.9], 13));

            // Click en el mapa para añadir zona de peligro
            map.on('click', (e) => {
                if (!pendingDangerRef.current) return;
                const { lat, lng } = e.latlng;
                window._pendingDangerLatLng = { lat, lng };
                window.dispatchEvent(new CustomEvent('openDangerZoneForm', { detail: { lat, lng } }));
                pendingDangerRef.current = false;
                setPendingDangerMode(false);
                map.getContainer().style.cursor = '';
            });

            mapRef.current = map;
            isInitializedRef.current = true;
            if (setMap) setMap(map);
        } catch (err) {
            console.error('Error mapa:', err);
            isInitializedRef.current = false;
        }
    };

    useEffect(() => {
        const timer = setTimeout(initializeMap, 200);
        return () => {
            clearTimeout(timer);
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
            isInitializedRef.current = false;
        };
    }, []);

    // ── MARCADOR DEL USUARIO ACTUAL ────────────────────────────────
    useEffect(() => {
        if (!mapRef.current || !userLocation) return;

        if (userMarkerRef.current) {
            try { mapRef.current.removeLayer(userMarkerRef.current); } catch (e) {}
        }

        const isDriver = currentUser && currentUser.role === 'driver';
        const color = isDriver ? '#2a7fff' : '#9b6dff';
        const label = isDriver ? '🚌' : '📍';

        const icon = window.L.divIcon({
            className: '',
            html: `<div style="
                background:${color}33;border:2.5px solid ${color};
                width:36px;height:36px;border-radius:50%;
                display:flex;align-items:center;justify-content:center;
                font-size:16px;box-shadow:0 0 0 6px ${color}22;
                animation:pulse-user 2s infinite;
            ">${label}</div>`,
            iconSize: [36, 36],
            iconAnchor: [18, 18]
        });

        userMarkerRef.current = window.L.marker([userLocation.lat, userLocation.lng], { icon })
            .addTo(mapRef.current)
            .bindPopup(`<b>${currentUser ? currentUser.name : 'Tú'}</b><br>Tu ubicación actual`);
    }, [userLocation, currentUser]);

    // ── MARCADORES VEHÍCULOS + ZONAS PELIGRO ──────────────────────
    useEffect(() => {
        if (!mapRef.current) return;

        markersRef.current.forEach(m => {
            try { mapRef.current.removeLayer(m); } catch (e) {}
        });
        markersRef.current = [];

        // --- Vehículos ---
        vehicles.forEach(v => {
            if (!v.lat || !v.lng || !mapRef.current) return;
            const color = OCCUPANCY_COLORS[v.occupancy] || '#8899bb';
            const icon = window.L.divIcon({
                className: '',
                html: `<div style="
                    background:${color}22;border:2px solid ${color};color:${color};
                    width:34px;height:34px;border-radius:10px;
                    display:flex;align-items:center;justify-content:center;
                    font-size:16px;font-weight:800;backdrop-filter:blur(4px);
                    cursor:pointer;box-shadow:0 2px 12px rgba(0,0,0,.5);
                ">${TYPE_ICONS[v.type] || '🚌'}</div>`,
                iconSize: [34, 34],
                iconAnchor: [17, 17],
                popupAnchor: [0, -17]
            });

            const route = routes ? routes.find(r => r.id === v.routeId) : null;
            const routeName = route ? route.name : 'Sin ruta';

            // ETA al usuario actual
            let etaLine = '';
            if (userLocation) {
                const eta = getETA(v.id, userLocation.lat, userLocation.lng);
                if (eta !== null) {
                    etaLine = `<div style="margin-top:6px;padding:4px 8px;background:#00d4a022;border-radius:6px;color:#00d4a0;font-weight:700;font-size:12px;">🕐 ETA ~${eta} min</div>`;
                }
            }

            try {
                const marker = window.L.marker([v.lat, v.lng], { icon }).addTo(mapRef.current);
                marker.bindPopup(`
                    <div style="font-family:'DM Sans',sans-serif;min-width:170px;padding:4px 0;">
                        <div style="font-weight:800;font-size:14px;margin-bottom:6px;">${v.type} · ${v.id}</div>
                        <div style="font-size:12px;color:#8899bb;margin-bottom:2px;">🗺 ${routeName}</div>
                        <div style="font-size:12px;margin-bottom:2px;">👤 ${v.driver}</div>
                        <div style="font-size:12px;">
                            <span style="color:${color};font-weight:700;">● ${v.occupancy}</span>
                            · ${v.passengers ? v.passengers.length : 0} a bordo
                        </div>
                        ${etaLine}
                    </div>
                `);
                markersRef.current.push(marker);
            } catch (e) {}
        });

        // --- Zonas de peligro ---
        dangerZones.forEach(z => {
            if (!z.lat || !z.lng || !mapRef.current) return;
            const riskColor = RISK_COLORS[z.risk] || '#ff9a3c';

            try {
                const circle = window.L.circle([z.lat, z.lng], {
                    radius: 400,
                    fillColor: riskColor,
                    fillOpacity: 0.18,
                    color: riskColor,
                    weight: 2,
                    opacity: 0.7
                }).addTo(mapRef.current);

                circle.bindPopup(`
                    <div style="font-family:'DM Sans',sans-serif;padding:4px 0;">
                        <div style="font-weight:800;font-size:14px;margin-bottom:4px;">⚠️ ${z.name}</div>
                        <div style="color:${riskColor};font-weight:700;font-size:12px;">Riesgo ${z.risk}</div>
                        <div style="font-size:11px;color:#8899bb;margin-top:2px;">${z.incidents} incidente${z.incidents !== 1 ? 's' : ''} reportado${z.incidents !== 1 ? 's' : ''}</div>
                    </div>
                `);
                markersRef.current.push(circle);
            } catch (e) {}
        });

    }, [vehicles, dangerZones, userLocation, routes]);

    // ── EVENTOS GLOBALES ──────────────────────────────────────────
    useEffect(() => {
        if (!mapRef.current) return;

        const onLocateMe = () => {
            if (userLocation && mapRef.current) {
                mapRef.current.flyTo([userLocation.lat, userLocation.lng], 16, { duration: 1 });
            } else {
                mapRef.current && mapRef.current.locate({ setView: true, maxZoom: 16 });
            }
        };

        const onSelectRoute = (e) => {
            const route = e.detail;
            if (!mapRef.current || !route || !route.stops || !route.stops.length) return;

            if (routeLineRef.current) {
                try { mapRef.current.removeLayer(routeLineRef.current); } catch (err) {}
            }

            const coords = route.stops.map(s => [s.lat, s.lng]);
            mapRef.current.flyTo(coords[0], 14, { duration: 1.2 });

            try {
                routeLineRef.current = window.L.polyline(coords, {
                    color: '#2a7fff',
                    weight: 4,
                    opacity: 0.85,
                    dashArray: '8,4'
                }).addTo(mapRef.current);

                // Marcadores de paradas
                route.stops.forEach((stop, i) => {
                    const stopIcon = window.L.divIcon({
                        className: '',
                        html: `<div style="
                            background:#2a7fff;color:#fff;
                            width:22px;height:22px;border-radius:50%;
                            display:flex;align-items:center;justify-content:center;
                            font-size:10px;font-weight:800;border:2px solid #fff;
                        ">${i + 1}</div>`,
                        iconSize: [22, 22],
                        iconAnchor: [11, 11]
                    });
                    const sm = window.L.marker([stop.lat, stop.lng], { icon: stopIcon })
                        .addTo(mapRef.current)
                        .bindPopup(`<b>Parada ${i + 1}</b><br>${stop.name}`);
                    markersRef.current.push(sm);
                });
            } catch (err) {}
        };

        const onFocusZone = (e) => {
            const zone = e.detail;
            if (mapRef.current && zone && zone.lat && zone.lng) {
                mapRef.current.flyTo([zone.lat, zone.lng], 15, { duration: 1 });
            }
        };

        const onFocusVehicle = (e) => {
            const v = e.detail;
            if (mapRef.current && v && v.lat && v.lng) {
                mapRef.current.flyTo([v.lat, v.lng], 16, { duration: 1 });
            }
        };

        const onEnableDangerMode = () => {
            pendingDangerRef.current = true;
            setPendingDangerMode(true);
            if (mapRef.current) mapRef.current.getContainer().style.cursor = 'crosshair';
            showToast('Toca el mapa para marcar la zona', 'warn');
        };

        window.addEventListener('locateMe', onLocateMe);
        window.addEventListener('selectRoute', onSelectRoute);
        window.addEventListener('focusZone', onFocusZone);
        window.addEventListener('focusVehicle', onFocusVehicle);
        window.addEventListener('enableDangerMode', onEnableDangerMode);

        return () => {
            window.removeEventListener('locateMe', onLocateMe);
            window.removeEventListener('selectRoute', onSelectRoute);
            window.removeEventListener('focusZone', onFocusZone);
            window.removeEventListener('focusVehicle', onFocusVehicle);
            window.removeEventListener('enableDangerMode', onEnableDangerMode);
        };
    }, [userLocation, showToast]);

    return ( <
        >
        <
        div ref = { containerRef }
        style = {
            {
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 0,
                background: '#060d1a'
            }
        }
        />

        { /* Indicador modo zona peligro */ } {
            pendingDangerMode && ( <
                div style = {
                    {
                        position: 'fixed',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        zIndex: 60,
                        pointerEvents: 'none',
                        background: 'rgba(255,59,92,.15)',
                        border: '2px dashed #ff3b5c',
                        borderRadius: 16,
                        padding: '12px 24px',
                        color: '#ff3b5c',
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: 14,
                        fontWeight: 700,
                        textAlign: 'center'
                    }
                } > ⚠️Toca el mapa para marcar la zona peligrosa <
                br / >
                <
                button onClick = {
                    () => {
                        setPendingDangerMode(false);
                        pendingDangerRef.current = false;
                        if (mapRef.current) mapRef.current.getContainer().style.cursor = '';
                    }
                }
                style = {
                    {
                        marginTop: 8,
                        padding: '4px 12px',
                        background: 'transparent',
                        border: '1px solid #ff3b5c',
                        borderRadius: 8,
                        color: '#ff3b5c',
                        fontSize: 12,
                        cursor: 'pointer',
                        pointerEvents: 'all'
                    }
                } >
                Cancelar < /button> < /
                div >
            )
        } <
        />
    );
};

export default MapComponent;