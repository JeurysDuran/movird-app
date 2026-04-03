// src/components/Map/MapComponent.js
import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';

var OCCUPANCY_COLORS = {
    'Vacio': '#00d4a0',
    'Vacío': '#00d4a0',
    'Medio': '#ff9a3c',
    'Lleno': '#ff3b5c'
};

var TYPE_ICONS = {
    'Metro': '<div style="background:var(--purple);border-radius:50%;width:30px;height:30px;display:flex;align-items:center;justify-content:center;color:#fff"><svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 22h16M12 2v20M5 8h14M5 14h14M16 4a4 4 0 0 0-8 0v18a4 4 0 0 0 8 0V4z"/></svg></div>',
    'OMSA': '<div style="background:var(--blue);border-radius:50%;width:30px;height:30px;display:flex;align-items:center;justify-content:center;color:#fff">'+'<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 14h16M4 14v4a2 2 0 0 0 2 2h1v2a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-2h2v2a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-2h1a2 2 0 0 0 2-2v-4M4 14V6a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v8M8 10h8M6 18h.01M18 18h.01" strokeLinecap="round"/></svg>'+'</div>',
    'Concho': '<div style="background:var(--warn);border-radius:50%;width:30px;height:30px;display:flex;align-items:center;justify-content:center;color:#fff">'+'<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 14h16M4 14v4a2 2 0 0 0 2 2h1v2a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-2h2v2a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-2h1a2 2 0 0 0 2-2v-4M4 14V6a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v8M8 10h8M6 18h.01M18 18h.01" strokeLinecap="round"/></svg>'+'</div>',
    'Teleferico': '<div style="background:var(--accent);border-radius:50%;width:30px;height:30px;display:flex;align-items:center;justify-content:center;color:#fff"><svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 10l14-4v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-8zM1 4h22M12 4v6"/></svg></div>',
};
var DEFAULT_ICON = '<div style="background:var(--text2);border-radius:50%;width:30px;height:30px;display:flex;align-items:center;justify-content:center;color:#fff">'+'<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 14h16M4 14v4a2 2 0 0 0 2 2h1v2a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-2h2v2a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-2h1a2 2 0 0 0 2-2v-4M4 14V6a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v8M8 10h8M6 18h.01M18 18h.01" strokeLinecap="round"/></svg>'+'</div>';

var RISK_COLORS = {
    Alto: '#ff3b5c',
    Medio: '#ff9a3c',
    Bajo: '#00d4a0'
};

var ROUTE_COLORS = {
    'Metro': '#00b4d8',
    'Teleferico': '#43aa8b',
    'OMSA': '#2a7fff',
    'Concho': '#ff9a3c',
    'Motoconcho': '#ff3b5c'
};

// ── Haversine local ────────────────────────────────────────────────
function haversineDist(lat1, lng1, lat2, lng2) {
    var R = 6371,
        toR = Math.PI / 180;
    var dLat = (lat2 - lat1) * toR;
    var dLng = (lng2 - lng1) * toR;
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * toR) * Math.cos(lat2 * toR) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ── Encuentra la parada más cercana a un lat/lng ───────────────────
function nearestStop(routes, lat, lng, maxKm) {
    var best = null;
    var bestDist = maxKm || 0.8; // 800m por defecto
    routes.forEach(function(route) {
        (route.stops || []).forEach(function(stop) {
            var d = haversineDist(lat, lng, stop.lat, stop.lng);
            if (d < bestDist) {
                bestDist = d;
                best = { stop: stop, route: route, dist: d };
            }
        });
    });
    return best;
}

var MapComponent = function() {
    var ctx = useApp();
    var vehicles = ctx.myVehicles || ctx.vehicles;
    var dangerZones = ctx.dangerZones;
    var routes = ctx.myRoutes || ctx.routes;
    var setMap = ctx.setMap;
    var currentUser = ctx.currentUser;
    var userLocation = ctx.userLocation;
    var getETA = ctx.getETA;
    var showToast = ctx.showToast;

    var containerRef = useRef(null);
    var mapRef = useRef(null);
    var markersRef = useRef([]);
    var userMarkerRef = useRef(null);
    var routeLinesRef = useRef([]);
    var allRouteLinesRef = useRef([]);
    var isInitializedRef = useRef(false);

    var pendingDangerRef = useRef(false);
    var dangerState = useState(false);
    var pendingDangerMode = dangerState[0];
    var setPendingDangerMode = dangerState[1];

    var pointedPlaceRef = useRef(null);

    // ── Planner mode ───────────────────────────────────────────────
    // 'idle' | 'picking-origin' | 'picking-dest'
    var plannerModeRef = useRef('idle');
    var plannerState = useState('idle');
    var plannerMode = plannerState[0];
    var setPlannerMode = plannerState[1];

    var plannerPinsRef = useRef({ origin: null, dest: null });

    // ── Dibuja todas las rutas en el mapa ──────────────────────────
    var drawAllRoutes = function(map, routeList) {
        allRouteLinesRef.current.forEach(function(l) {
            try { map.removeLayer(l); } catch (e) {}
        });
        allRouteLinesRef.current = [];

        if (!routeList || !routeList.length) return;

        routeList.forEach(function(route) {
            if (!route.stops || route.stops.length < 2) return;
            var coords = route.geometry || route.stops.map(function(s) { return [s.lat, s.lng]; });
            var lineColor = ROUTE_COLORS[route.type] || '#2a7fff';

            try {
                var shadow = window.L.polyline(coords, {
                    color: lineColor,
                    weight: 9,
                    opacity: 0.12,
                    interactive: false
                }).addTo(map);
                allRouteLinesRef.current.push(shadow);

                var line = window.L.polyline(coords, {
                    color: lineColor,
                    weight: route.type === 'Metro' ? 5 : 4,
                    opacity: 0.8,
                    dashArray: (route.type === 'Concho' || route.type === 'OMSA') ? '10,5' : null
                }).addTo(map);
                line.bindPopup(
                    '<div style="font-family:\'DM Sans\',sans-serif;padding:4px 0;min-width:160px;">' +
                    '<div style="font-weight:800;font-size:14px;margin-bottom:6px;">' + route.name + '</div>' +
                    '<span style="background:' + lineColor + '22;color:' + lineColor + ';padding:2px 8px;border-radius:100px;font-size:11px;font-weight:700;">' + route.type + '</span>' +
                    '<span style="margin-left:8px;font-size:12px;color:#555;">RD$' + route.price + '</span>' +
                    '<div style="margin-top:6px;font-size:11px;color:#888;">' + route.stops.length + ' paradas</div>' +
                    '</div>'
                );
                allRouteLinesRef.current.push(line);

                var endpoints = [
                    { stop: route.stops[0], color: '#00d4a0', label: 'A' },
                    { stop: route.stops[route.stops.length - 1], color: '#ff3b5c', label: 'B' }
                ];
                endpoints.forEach(function(ep) {
                    var dotIcon = window.L.divIcon({
                        className: '',
                        html: '<div style="background:' + ep.color + ';color:#fff;width:14px;height:14px;border-radius:50%;border:2.5px solid #fff;box-shadow:0 1px 5px rgba(0,0,0,.3);display:flex;align-items:center;justify-content:center;font-size:7px;font-weight:800;">' + ep.label + '</div>',
                        iconSize: [14, 14],
                        iconAnchor: [7, 7]
                    });
                    var m = window.L.marker([ep.stop.lat, ep.stop.lng], { icon: dotIcon })
                        .addTo(map)
                        .bindPopup('<b>' + ep.stop.name + '</b><br><span style="font-size:11px;color:#888;">' + route.name + '</span>');
                    allRouteLinesRef.current.push(m);
                });
            } catch (e) {}
        });
    };

    // ── Poner pin de planificador en el mapa ───────────────────────
    var placePlannerPin = function(map, lat, lng, type, label, nearStop) {
        var isOrigin = type === 'origin';
        var color = isOrigin ? '#00d4a0' : '#ff3b5c';
        var emoji = isOrigin ? '📍' : '🏁';

        // Quitar pin anterior del mismo tipo
        if (plannerPinsRef.current[type]) {
            try { map.removeLayer(plannerPinsRef.current[type]); } catch (e) {}
        }

        var html = '<div style="' +
            'background:' + color + ';' +
            'color:#fff;' +
            'padding:6px 10px;' +
            'border-radius:12px;' +
            'font-size:12px;' +
            'font-weight:800;' +
            'white-space:nowrap;' +
            'box-shadow:0 3px 12px rgba(0,0,0,.35);' +
            'border:2.5px solid #fff;' +
            'display:flex;align-items:center;gap:5px;' +
            '">' +
            emoji + ' ' + label +
            '</div>' +
            '<div style="width:0;height:0;border-left:8px solid transparent;border-right:8px solid transparent;border-top:10px solid ' + color + ';margin:0 auto;"></div>';

        var icon = window.L.divIcon({
            className: '',
            html: html,
            iconAnchor: [60, 46],
            iconSize: [120, 46]
        });

        var pin = window.L.marker([lat, lng], { icon: icon, zIndexOffset: 1000 }).addTo(map);
        plannerPinsRef.current[type] = pin;
        return pin;
    };

    // ── Limpiar pins del planificador ──────────────────────────────
    var clearPlannerPins = function(map) {
        ['origin', 'dest'].forEach(function(t) {
            if (plannerPinsRef.current[t]) {
                try { map.removeLayer(plannerPinsRef.current[t]); } catch (e) {}
                plannerPinsRef.current[t] = null;
            }
        });
    };

    // ── Inicializar mapa ───────────────────────────────────────────
    var initializeMap = function() {
        if (typeof window.L === 'undefined') { setTimeout(initializeMap, 500); return; }
        var el = containerRef.current;
        if (!el) { setTimeout(initializeMap, 100); return; }
        if (mapRef.current || isInitializedRef.current) return;

        try {
            var map = window.L.map(el, {
                center: [18.479, -69.9],
                zoom: 13,
                zoomControl: false,
                attributionControl: false
            });

            window.L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
                attribution: '© OpenStreetMap © CARTO',
                subdomains: 'abcd',
                maxZoom: 19
            }).addTo(map);

            map.locate({ setView: true, maxZoom: 15 });
            map.on('locationerror', function() { map.setView([18.479, -69.9], 13); });

            map.on('click', function(e) {
                var lat = e.latlng.lat;
                var lng = e.latlng.lng;
                
                // Evento libre para AdminPanel u otros
                window.dispatchEvent(new CustomEvent('mapClickAnywhere', { detail: { lat: lat, lng: lng } }));

                // ── Modo zona peligrosa ──
                if (pendingDangerRef.current) {
                    window.dispatchEvent(new CustomEvent('openDangerZoneForm', { detail: { lat: lat, lng: lng } }));
                    pendingDangerRef.current = false;
                    setPendingDangerMode(false);
                    map.getContainer().style.cursor = '';
                    return;
                }

                // ── Modo planificador: origen ──
                if (plannerModeRef.current === 'picking-origin') {
                    var routesCurrent = window.__movird_routes || [];
                    var near = nearestStop(routesCurrent, lat, lng, 0.8);
                    var stopData, displayName;

                    if (near) {
                        stopData = near.stop;
                        displayName = near.stop.name;
                        placePlannerPin(map, near.stop.lat, near.stop.lng, 'origin', displayName, near);
                        map.flyTo([near.stop.lat, near.stop.lng], map.getZoom(), { duration: 0.5 });
                    } else {
                        // Ninguna parada cercana: usar coordenada libre
                        stopData = { name: 'Punto personalizado', lat: lat, lng: lng };
                        displayName = 'Origen';
                        placePlannerPin(map, lat, lng, 'origin', displayName, null);
                    }

                    plannerModeRef.current = 'picking-dest';
                    setPlannerMode('picking-dest');
                    map.getContainer().style.cursor = 'crosshair';

                    window.dispatchEvent(new CustomEvent('plannerOriginSet', {
                        detail: { stop: stopData, nearRoute: near ? near.route : null }
                    }));
                    return;
                }

                // ── Modo planificador: destino ──
                if (plannerModeRef.current === 'picking-dest') {
                    var routesCurrent2 = window.__movird_routes || [];
                    var near2 = nearestStop(routesCurrent2, lat, lng, 0.8);
                    var stopData2, displayName2;

                    if (near2) {
                        stopData2 = near2.stop;
                        displayName2 = near2.stop.name;
                        placePlannerPin(map, near2.stop.lat, near2.stop.lng, 'dest', displayName2, near2);
                        map.flyTo([near2.stop.lat, near2.stop.lng], map.getZoom(), { duration: 0.5 });
                    } else {
                        stopData2 = { name: 'Punto personalizado', lat: lat, lng: lng };
                        displayName2 = 'Destino';
                        placePlannerPin(map, lat, lng, 'dest', displayName2, null);
                    }

                    plannerModeRef.current = 'idle';
                    setPlannerMode('idle');
                    map.getContainer().style.cursor = '';

                    window.dispatchEvent(new CustomEvent('plannerDestSet', {
                        detail: { stop: stopData2, nearRoute: near2 ? near2.route : null }
                    }));
                    return;
                }
            });

            mapRef.current = map;
            isInitializedRef.current = true;
            if (setMap) setMap(map);

            if (routes && routes.length) {
                drawAllRoutes(map, routes);
            }
        } catch (err) {
            console.error('Error mapa:', err);
            isInitializedRef.current = false;
        }
    };

    useEffect(function() {
        var timer = setTimeout(initializeMap, 200);
        return function() {
            clearTimeout(timer);
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
            isInitializedRef.current = false;
        };
    }, []);

    // Exponer rutas al click handler via window (evita closure stale)
    useEffect(function() {
        window.__movird_routes = routes;
    }, [routes]);

    useEffect(function() {
        if (!mapRef.current) return;
        drawAllRoutes(mapRef.current, routes);
    }, [routes]);

    // ── Marcador usuario actual ────────────────────────────────────
    useEffect(function() {
        if (!mapRef.current || !userLocation) return;
        if (userMarkerRef.current) {
            try { mapRef.current.removeLayer(userMarkerRef.current); } catch (e) {}
        }
        var uIcon = window.L.divIcon({
            className: '',
            html: '<div style="width:16px;height:16px;border-radius:50%;background:#2a7fff;border:3px solid #fff;box-shadow:0 0 0 4px rgba(42,127,255,.25),0 2px 8px rgba(0,0,0,.3);"></div>',
            iconSize: [16, 16],
            iconAnchor: [8, 8]
        });
        userMarkerRef.current = window.L.marker([userLocation.lat, userLocation.lng], { icon: uIcon, zIndexOffset: 500 })
            .addTo(mapRef.current)
            .bindPopup('<b>Tu ubicación</b>');
    }, [userLocation]);

    // ── Marcadores vehículos / zonas ───────────────────────────────
    useEffect(function() {
        if (!mapRef.current) return;
        markersRef.current.forEach(function(m) {
            try { mapRef.current.removeLayer(m); } catch (e) {}
        });
        markersRef.current = [];

        // Vehículos
        (vehicles || []).forEach(function(v) {
            if (!v.lat || !v.lng) return;
            var vColor = OCCUPANCY_COLORS[v.occupancy] || '#8899bb';
            var vIcon = TYPE_ICONS[v.type] || '🚌';
            try {
                var divIcon = window.L.divIcon({
                    className: '',
                    html: '<div style="background:' + vColor + ';border:3px solid #fff;width:38px;height:38px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:20px;box-shadow:0 3px 10px rgba(0,0,0,.25);">' + vIcon + '</div>',
                    iconSize: [38, 38],
                    iconAnchor: [19, 19]
                });
                var marker = window.L.marker([v.lat, v.lng], { icon: divIcon })
                    .addTo(mapRef.current)
                    .bindPopup(
                        '<div style="font-family:\'DM Sans\',sans-serif;padding:4px 0;">' +
                        '<div style="font-weight:800;font-size:13px;margin-bottom:4px;">' + vIcon + ' ' + (v.type || '') + ' ' + (v.id || '') + '</div>' +
                        '<div style="font-size:12px;color:#555;">👤 ' + (v.driver || 'Sin chofer') + '</div>' +
                        '<div style="font-size:12px;color:' + vColor + ';font-weight:700;">● ' + (v.occupancy || '') + '</div>' +
                        '</div>'
                    );
                markersRef.current.push(marker);
            } catch (e) {}
        });

        // Zonas peligrosas
        (dangerZones || []).forEach(function(z) {
            if (!z.lat || !z.lng) return;
            var riskColor = RISK_COLORS[z.risk] || '#ff9a3c';
            try {
                var circle = window.L.circle([z.lat, z.lng], {
                    radius: 350,
                    fillColor: riskColor,
                    fillOpacity: 0.12,
                    color: riskColor,
                    weight: 2,
                    opacity: 0.6
                }).addTo(mapRef.current);
                circle.bindPopup(
                    '<div style="font-family:\'DM Sans\',sans-serif;padding:4px 0;">' +
                    '<div style="font-weight:800;font-size:14px;margin-bottom:4px;">⚠️ ' + z.name + '</div>' +
                    '<div style="color:' + riskColor + ';font-weight:700;font-size:12px;">Riesgo ' + z.risk + '</div>' +
                    '<div style="font-size:11px;color:#888;margin-top:2px;">' + z.incidents + ' incidente' + (z.incidents !== 1 ? 's' : '') + '</div>' +
                    '</div>'
                );
                markersRef.current.push(circle);
            } catch (e) {}
        });
    }, [vehicles, dangerZones, userLocation, routes, currentUser]);

    // ── Eventos globales ───────────────────────────────────────────
    useEffect(function() {
        if (!mapRef.current) return;

        var onLocateMe = function() {
            if (userLocation && mapRef.current) {
                mapRef.current.flyTo([userLocation.lat, userLocation.lng], 16, { duration: 1 });
            } else if (mapRef.current) {
                mapRef.current.locate({ setView: true, maxZoom: 16 });
            }
        };

        var onSelectRoute = function(e) {
            var route = e.detail;
            if (!mapRef.current || !route || !route.stops || !route.stops.length) return;

            routeLinesRef.current.forEach(function(l) {
                try { mapRef.current.removeLayer(l); } catch (err) {}
            });
            routeLinesRef.current = [];

            var coords = route.geometry || route.stops.map(function(s) { return [s.lat, s.lng]; });
            var lineColor = ROUTE_COLORS[route.type] || '#2a7fff';

            mapRef.current.flyTo(coords[0], 14, { duration: 1.2 });

            try {
                var line = window.L.polyline(coords, {
                    color: lineColor,
                    weight: 7,
                    opacity: 1,
                    dashArray: route.type === 'Metro' ? null : '12,5'
                }).addTo(mapRef.current);
                routeLinesRef.current.push(line);

                route.stops.forEach(function(stop, i) {
                    var isFirst = i === 0;
                    var isLast = i === route.stops.length - 1;
                    var bg = isFirst ? '#00d4a0' : isLast ? '#ff3b5c' : lineColor;
                    var size = (isFirst || isLast) ? 28 : 22;
                    var stopIcon = window.L.divIcon({
                        className: '',
                        html: '<div style="background:' + bg + ';color:#fff;width:' + size + 'px;height:' + size + 'px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:800;border:2.5px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.3);">' + (i + 1) + '</div>',
                        iconSize: [size, size],
                        iconAnchor: [size / 2, size / 2]
                    });
                    var sm = window.L.marker([stop.lat, stop.lng], { icon: stopIcon })
                        .addTo(mapRef.current)
                        .bindPopup('<b>Parada ' + (i + 1) + '</b><br>' + stop.name);
                    routeLinesRef.current.push(sm);
                });

                var activeOnRoute = vehicles ? vehicles.filter(function(v) {
                    return v.routeId === route.id && v.lat && v.lng;
                }) : [];
                activeOnRoute.forEach(function(v) {
                    var vColor = OCCUPANCY_COLORS[v.occupancy] || '#8899bb';
                    var vIcon = TYPE_ICONS[v.type] || '🚌';
                    var vm = window.L.divIcon({
                        className: '',
                        html: '<div style="background:' + vColor + ';border:3px solid #fff;width:42px;height:42px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:22px;box-shadow:0 0 0 3px ' + lineColor + ', 0 3px 14px rgba(0,0,0,.3);">' + vIcon + '</div>',
                        iconSize: [42, 42],
                        iconAnchor: [21, 21]
                    });
                    var vmarker = window.L.marker([v.lat, v.lng], { icon: vm })
                        .addTo(mapRef.current)
                        .bindPopup('<b>' + v.type + ' ' + v.id + '</b><br>👤 ' + v.driver + '<br>● ' + v.occupancy + ' · ' + (v.passengers ? v.passengers.length : 0) + ' a bordo');
                    routeLinesRef.current.push(vmarker);
                });
            } catch (err) {}
        };

        var onFocusZone = function(e) {
            var zone = e.detail;
            if (mapRef.current && zone && zone.lat && zone.lng) {
                mapRef.current.flyTo([zone.lat, zone.lng], 15, { duration: 1 });
                
                // Si viene como focusPlace, poner un pin temporal
                if (pointedPlaceRef.current) {
                    try { mapRef.current.removeLayer(pointedPlaceRef.current); } catch (err) {}
                }
                var pIcon = window.L.divIcon({
                    className: '',
                    html: '<div style="color:var(--danger); filter:drop-shadow(0 4px 6px rgba(0,0,0,.2))"><svg width="34" height="34" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z"/></svg></div>',
                    iconSize: [34, 34],
                    iconAnchor: [17, 34]
                });
                pointedPlaceRef.current = window.L.marker([zone.lat, zone.lng], { icon: pIcon })
                   .addTo(mapRef.current)
                   .bindPopup('<b>Lugar Buscado</b>');
            }
        };

        var onFocusVehicle = function(e) {
            var v = e.detail;
            if (mapRef.current && v && v.lat && v.lng) {
                mapRef.current.flyTo([v.lat, v.lng], 16, { duration: 1 });
            }
        };

        var onEnableDangerMode = function() {
            pendingDangerRef.current = true;
            setPendingDangerMode(true);
            if (mapRef.current) mapRef.current.getContainer().style.cursor = 'crosshair';
            showToast('Toca el mapa para marcar la zona', 'warn');
        };

        // ── Planner events desde RoutesPanel ──────────────────────
        var onStartPickOrigin = function() {
            clearPlannerPins(mapRef.current);
            plannerModeRef.current = 'picking-origin';
            setPlannerMode('picking-origin');
            if (mapRef.current) mapRef.current.getContainer().style.cursor = 'crosshair';
        };

        var onStartPickDest = function() {
            plannerModeRef.current = 'picking-dest';
            setPlannerMode('picking-dest');
            if (mapRef.current) mapRef.current.getContainer().style.cursor = 'crosshair';
        };

        var onCancelPlanner = function() {
            clearPlannerPins(mapRef.current);
            plannerModeRef.current = 'idle';
            setPlannerMode('idle');
            if (mapRef.current) mapRef.current.getContainer().style.cursor = '';
        };

        // Cuando el plan está listo: dibujar la ruta en el mapa
        var onShowRoutePlan = function(e) {
            var plan = e.detail;
            if (!mapRef.current || !plan) return;

            routeLinesRef.current.forEach(function(l) {
                try { mapRef.current.removeLayer(l); } catch (err) {}
            });
            routeLinesRef.current = [];

            plan.legs.forEach(function(leg) {
                var coords = (leg.route && leg.route.geometry) ? leg.route.geometry : leg.stops.map(function(s) { return [s.lat, s.lng]; });
                var lineColor = ROUTE_COLORS[leg.route.type] || '#2a7fff';

                try {
                    // Sombra
                    var shadow = window.L.polyline(coords, {
                        color: lineColor,
                        weight: 12,
                        opacity: 0.15,
                        interactive: false
                    }).addTo(mapRef.current);
                    routeLinesRef.current.push(shadow);

                    // Línea principal
                    var line = window.L.polyline(coords, {
                        color: lineColor,
                        weight: 6,
                        opacity: 1,
                        dashArray: leg.route.type === 'Metro' ? null : '10,5'
                    }).addTo(mapRef.current);
                    routeLinesRef.current.push(line);

                    // Paradas intermedias
                    leg.stops.forEach(function(stop, si) {
                        var isFirst = si === 0;
                        var isLast = si === leg.stops.length - 1;
                        if (isFirst || isLast) return; // los pins ya están
                        var dot = window.L.divIcon({
                            className: '',
                            html: '<div style="background:' + lineColor + ';width:8px;height:8px;border-radius:50%;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.25);"></div>',
                            iconSize: [8, 8],
                            iconAnchor: [4, 4]
                        });
                        var sm = window.L.marker([stop.lat, stop.lng], { icon: dot })
                            .addTo(mapRef.current)
                            .bindPopup('<b>' + stop.name + '</b>');
                        routeLinesRef.current.push(sm);
                    });
                } catch (err) {}
            });

            // Fit bounds del plan completo
            try {
                var allCoords = [];
                plan.legs.forEach(function(leg) {
                    leg.stops.forEach(function(s) { allCoords.push([s.lat, s.lng]); });
                });
                if (allCoords.length > 1) {
                    mapRef.current.fitBounds(allCoords, { padding: [50, 50], duration: 1 });
                }
            } catch (err) {}
        };

        window.addEventListener('locateMe', onLocateMe);
        window.addEventListener('selectRoute', onSelectRoute);
        window.addEventListener('focusZone', onFocusZone);
        window.addEventListener('focusVehicle', onFocusVehicle);
        window.addEventListener('enableDangerMode', onEnableDangerMode);
        window.addEventListener('plannerStartPickOrigin', onStartPickOrigin);
        window.addEventListener('plannerStartPickDest', onStartPickDest);
        window.addEventListener('plannerCancel', onCancelPlanner);
        window.addEventListener('showRoutePlan', onShowRoutePlan);

        return function() {
            window.removeEventListener('locateMe', onLocateMe);
            window.removeEventListener('selectRoute', onSelectRoute);
            window.removeEventListener('focusZone', onFocusZone);
            window.removeEventListener('focusVehicle', onFocusVehicle);
            window.removeEventListener('enableDangerMode', onEnableDangerMode);
            window.removeEventListener('plannerStartPickOrigin', onStartPickOrigin);
            window.removeEventListener('plannerStartPickDest', onStartPickDest);
            window.removeEventListener('plannerCancel', onCancelPlanner);
            window.removeEventListener('showRoutePlan', onShowRoutePlan);
        };
    }, [userLocation, showToast, vehicles, routes]);

    // ── Banner de modo planificador ────────────────────────────────
    var plannerBannerText = '';
    if (plannerMode === 'picking-origin') plannerBannerText = '📍 Toca el mapa para marcar el ORIGEN';
    if (plannerMode === 'picking-dest') plannerBannerText = '🏁 Toca el mapa para marcar el DESTINO';

    return (
        React.createElement(React.Fragment, null,
            React.createElement('div', {
                ref: containerRef,
                style: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, background: '#f0ece6' }
            }),

            // Banner modo zona peligrosa
            pendingDangerMode && React.createElement('div', {
                    style: {
                        position: 'fixed',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%,-50%)',
                        zIndex: 60,
                        background: 'rgba(255,59,92,.13)',
                        border: '2px dashed #ff3b5c',
                        borderRadius: 16,
                        padding: '14px 28px',
                        color: '#ff3b5c',
                        fontFamily: "'DM Sans',sans-serif",
                        fontSize: 14,
                        fontWeight: 700,
                        textAlign: 'center',
                        pointerEvents: 'none'
                    }
                },
                '⚠️ Toca el mapa para marcar la zona peligrosa',
                React.createElement('br'),
                React.createElement('button', {
                    onClick: function() {
                        setPendingDangerMode(false);
                        pendingDangerRef.current = false;
                        if (mapRef.current) mapRef.current.getContainer().style.cursor = '';
                    },
                    style: {
                        marginTop: 10,
                        padding: '5px 14px',
                        background: 'transparent',
                        border: '1px solid #ff3b5c',
                        borderRadius: 8,
                        color: '#ff3b5c',
                        fontSize: 12,
                        cursor: 'pointer',
                        pointerEvents: 'all'
                    }
                }, 'Cancelar')
            ),

            // Banner modo planificador
            plannerMode !== 'idle' && React.createElement('div', {
                    style: {
                        position: 'fixed',
                        bottom: 100,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        zIndex: 60,
                        background: 'rgba(0,0,0,.82)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: 16,
                        padding: '12px 24px',
                        color: '#fff',
                        fontFamily: "'DM Sans',sans-serif",
                        fontSize: 14,
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 14,
                        boxShadow: '0 4px 24px rgba(0,0,0,.4)',
                        whiteSpace: 'nowrap'
                    }
                },
                plannerBannerText,
                React.createElement('button', {
                    onClick: function() {
                        window.dispatchEvent(new CustomEvent('plannerCancel'));
                        window.dispatchEvent(new CustomEvent('plannerCancelledFromMap'));
                    },
                    style: {
                        background: 'rgba(255,255,255,.15)',
                        border: '1px solid rgba(255,255,255,.3)',
                        borderRadius: 8,
                        color: '#fff',
                        fontSize: 12,
                        fontWeight: 700,
                        padding: '4px 12px',
                        cursor: 'pointer'
                    }
                }, '✕ Cancelar')
            )
        )
    );
};

export default MapComponent;