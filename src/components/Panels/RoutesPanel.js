// src/components/Panels/RoutesPanel.js
import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { MdLocationOn, MdCheckCircle, MdMap, MdWarning, MdSearch, MdDirectionsTransit, MdFlag } from 'react-icons/md';

var ROUTE_COLORS = {
    'Metro': '#00b4d8',
    'Teleferico': '#43aa8b',
    'OMSA': '#2a7fff',
    'Concho': '#ff9a3c',
    'Motoconcho': '#ff3b5c'
};

// ── Haversine ──────────────────────────────────────────────────────
function haversine(a, b) {
    var R = 6371,
        toR = Math.PI / 180;
    var dLat = (b.lat - a.lat) * toR;
    var dLng = (b.lng - a.lng) * toR;
    var x = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(a.lat * toR) * Math.cos(b.lat * toR) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

// ── Motor de planificación ─────────────────────────────────────────
function planRoutes(routes, originStop, destStop) {
    if (!originStop || !destStop) return [];
    var results = [];

    // 1. Directas
    routes.forEach(function(route) {
        var stops = route.stops || [];
        var oIdx = -1,
            dIdx = -1;
        stops.forEach(function(s, i) {
            if (s.name === originStop.name) oIdx = i;
            if (s.name === destStop.name) dIdx = i;
        });
        if (oIdx === -1 || dIdx === -1) return;

        var slice = oIdx < dIdx ?
            stops.slice(oIdx, dIdx + 1) :
            stops.slice(dIdx, oIdx + 1).reverse();

        var dist = 0;
        for (var i = 0; i < slice.length - 1; i++) dist += haversine(slice[i], slice[i + 1]);
        var speed = route.type === 'Metro' ? 40 : route.type === 'Teleferico' ? 15 : 20;
        var minutes = Math.round((dist / speed) * 60);

        results.push({
            type: 'direct',
            legs: [{ route: route, from: stops[oIdx], to: stops[dIdx], stops: slice }],
            totalPrice: route.price || 0,
            totalMinutes: minutes,
            totalDistance: dist
        });
    });

    // 2. Un transbordo si no hay directas
    if (results.length === 0) {
        routes.forEach(function(routeA) {
            var stopsA = routeA.stops || [];
            var oIdx = -1;
            stopsA.forEach(function(s, i) { if (s.name === originStop.name) oIdx = i; });
            if (oIdx === -1) return;

            routes.forEach(function(routeB) {
                if (routeB.id === routeA.id) return;
                var stopsB = routeB.stops || [];
                var dIdx = -1;
                stopsB.forEach(function(s, i) { if (s.name === destStop.name) dIdx = i; });
                if (dIdx === -1) return;

                stopsA.forEach(function(stopA) {
                    var tIdx = -1;
                    stopsB.forEach(function(s, i) { if (s.name === stopA.name) tIdx = i; });
                    if (tIdx === -1) return;

                    var aIdx2 = stopsA.indexOf(stopA);
                    if (aIdx2 === oIdx) return;

                    var segA = oIdx < aIdx2 ? stopsA.slice(oIdx, aIdx2 + 1) : stopsA.slice(aIdx2, oIdx + 1).reverse();
                    var segB = tIdx < dIdx ? stopsB.slice(tIdx, dIdx + 1) : stopsB.slice(dIdx, tIdx + 1).reverse();

                    var distA = 0,
                        distB = 0;
                    for (var i2 = 0; i2 < segA.length - 1; i2++) distA += haversine(segA[i2], segA[i2 + 1]);
                    for (var j = 0; j < segB.length - 1; j++) distB += haversine(segB[j], segB[j + 1]);
                    var speedA = routeA.type === 'Metro' ? 40 : 20;
                    var speedB = routeB.type === 'Metro' ? 40 : 20;
                    var mins = Math.round((distA / speedA + distB / speedB) * 60) + 5;

                    results.push({
                        type: 'transfer',
                        legs: [
                            { route: routeA, from: stopsA[oIdx], to: stopA, stops: segA },
                            { route: routeB, from: stopA, to: stopsB[dIdx], stops: segB }
                        ],
                        totalPrice: (routeA.price || 0) + (routeB.price || 0),
                        totalMinutes: mins,
                        totalDistance: distA + distB,
                        transferStop: stopA
                    });
                });
            });
        });
    }

    results.sort(function(a, b) {
        if (a.type !== b.type) return a.type === 'direct' ? -1 : 1;
        return a.totalMinutes - b.totalMinutes;
    });
    return results.slice(0, 4);
}

// ── Tarjeta de resultado ───────────────────────────────────────────
function PlanCard(props) {
    var plan = props.plan;
    var index = props.index;
    var onSelect = props.onSelect;
    var expandedState = useState(index === 0);
    var isExpanded = expandedState[0];
    var setExpanded = expandedState[1];

    return ( <
        div style = {
            {
                background: 'var(--surface2)',
                border: index === 0 ? '1.5px solid var(--accent)' : '1.5px solid var(--border)',
                borderRadius: 14,
                overflow: 'hidden',
                marginBottom: 10
            }
        } >
        <
        div style = {
            { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', cursor: 'pointer' } }
        onClick = {
            function() { setExpanded(function(x) { return !x; }); } } >
        <
        div style = {
            { display: 'flex', alignItems: 'center', gap: 8 } } > {
            index === 0 && ( <
                span style = {
                    { background: 'var(--accent)', color: '#fff', fontSize: 9, fontWeight: 800, padding: '2px 7px', borderRadius: 100, letterSpacing: .5 } } >
                MEJOR <
                /span>
            )
        } <
        span style = {
            { fontSize: 11, fontWeight: 700, color: plan.type === 'direct' ? '#00d4a0' : '#ff9a3c' } } > { plan.type === 'direct' ? '⚡ Directo' : '🔄 1 Transbordo' } <
        /span> <
        /div> <
        div style = {
            { display: 'flex', alignItems: 'center', gap: 10 } } >
        <
        span style = {
            { fontSize: 11, color: 'var(--text2)' } } > ⏱~{ plan.totalMinutes }
        min < /span> <
        span style = {
            { fontSize: 13, fontWeight: 800, color: 'var(--accent)' } } > RD$ { plan.totalPrice } < /span> <
        span style = {
            { color: 'var(--text2)', fontSize: 13 } } > { isExpanded ? '▲' : '▼' } < /span> <
        /div> <
        /div>

        {
            isExpanded && ( <
                div style = {
                    { borderTop: '1px solid var(--border)', padding: '12px 14px 14px' } } > {
                    plan.legs.map(function(leg, li) {
                        var color = ROUTE_COLORS[leg.route.type] || '#2a7fff';
                        return ( <
                            div key = { li } > {
                                li > 0 && ( <
                                    div style = {
                                        { display: 'flex', alignItems: 'center', gap: 8, margin: '10px 0', color: 'var(--text2)', fontSize: 11 } } >
                                    <
                                    div style = {
                                        { flex: 1, height: 1, background: 'var(--border)' } }
                                    />🔄
                                    Transbordo en < strong style = {
                                        { color: 'var(--text)' } } > { plan.transferStop && plan.transferStop.name } < /strong> <
                                    div style = {
                                        { flex: 1, height: 1, background: 'var(--border)' } }
                                    /> <
                                    /div>
                                )
                            } <
                            div style = {
                                { display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 } } >
                            <
                            span style = {
                                { background: color + '22', color: color, fontSize: 10, fontWeight: 700, padding: '2px 9px', borderRadius: 100 } } > { leg.route.type } < /span> <
                            span style = {
                                { fontSize: 12, fontWeight: 600, color: 'var(--text)' } } > { leg.route.name } < /span> <
                            span style = {
                                { fontSize: 11, color: 'var(--text2)', marginLeft: 'auto' } } > RD$ { leg.route.price } < /span> <
                            /div> <
                            div style = {
                                { paddingLeft: 12 } } > {
                                leg.stops.map(function(stop, si) {
                                    var isFirst = si === 0;
                                    var isLast = si === leg.stops.length - 1;
                                    var isMid = !isFirst && !isLast;
                                    return ( <
                                        div key = { si }
                                        style = {
                                            { display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: isLast ? 0 : 2 } } >
                                        <
                                        div style = {
                                            { display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 2 } } >
                                        <
                                        div style = {
                                            {
                                                width: (isFirst || isLast) ? 10 : 6,
                                                height: (isFirst || isLast) ? 10 : 6,
                                                borderRadius: '50%',
                                                background: (isFirst || isLast) ? color : 'var(--border)',
                                                border: (isFirst || isLast) ? ('2px solid ' + color) : 'none',
                                                flexShrink: 0
                                            }
                                        }
                                        /> {
                                            !isLast && ( <
                                                div style = {
                                                    { width: 2, flexGrow: 1, minHeight: isMid ? 10 : 14, background: color + '55', marginTop: 2 } }
                                                />
                                            )
                                        } <
                                        /div> <
                                        span style = {
                                            {
                                                fontSize: isMid ? 10 : 12,
                                                color: isMid ? 'var(--text2)' : 'var(--text)',
                                                fontWeight: (isFirst || isLast) ? 600 : 400,
                                                paddingBottom: isLast ? 0 : (isMid ? 6 : 10)
                                            }
                                        } > { stop.name } < /span> <
                                        /div>
                                    );
                                })
                            } <
                            /div> <
                            /div>
                        );
                    })
                } <
                div style = {
                    { marginTop: 12, padding: '8px 12px', background: 'var(--surface3)', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' } } >
                <
                span style = {
                    { fontSize: 11, color: 'var(--text2)' } } > 📏{ plan.totalDistance.toFixed(1) }
                km < /span> <
                button onClick = {
                    function() { onSelect && onSelect(plan); } }
                style = {
                    { background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, padding: '5px 14px', fontSize: 11, fontWeight: 700, cursor: 'pointer' } } >
                Ver en mapa→ <
                /button> <
                /div> <
                /div>
            )
        } <
        /div>
    );
}

// ── Pestaña Explorar ───────────────────────────────────────────────
function BrowseTab(props) {
    var routes = props.routes;
    var vehicles = props.vehicles;
    var closePanel = props.closePanel;
    var filterState = useState('all');
    var filter = filterState[0];
    var setFilter = filterState[1];

    var types = ['all'].concat(Array.from(new Set(routes.map(function(r) { return r.type; }))));
    var filtered = filter === 'all' ? routes : routes.filter(function(r) { return r.type === filter; });

    var getVehiclesOn = function(id) {
        return vehicles.filter(function(v) { return v.routeId === id && v.lat && v.lng; });
    };

    var getOcc = function(id) {
        var vs = vehicles.filter(function(v) { return v.routeId === id; });
        if (!vs.length) return { text: 'Sin servicio', color: '#8899bb', pct: '8%' };
        var order = { Lleno: 3, Medio: 2, Vacio: 1, Vacío: 1 };
        var worst = vs.sort(function(a, b) { return (order[b.occupancy] || 0) - (order[a.occupancy] || 0); })[0];
        if (worst.occupancy === 'Lleno') return { text: 'Lleno', color: '#ff3b5c', pct: '95%' };
        if (worst.occupancy === 'Medio') return { text: 'Medio', color: '#ff9a3c', pct: '55%' };
        return { text: 'Disponible', color: '#00d4a0', pct: '15%' };
    };

    return ( <
            >
            <
            div style = {
                { display: 'flex', gap: 6, padding: '8px 16px 0', overflowX: 'auto' } } > {
                types.map(function(t) {
                    return ( <
                        button key = { t }
                        onClick = {
                            function() { setFilter(t); } }
                        className = { 'btn ' + (filter === t ? 'btn-accent' : 'btn-ghost') }
                        style = {
                            { fontSize: 11, whiteSpace: 'nowrap' } } > { t === 'all' ? 'Todas' : t } <
                        /button>
                    );
                })
            } <
            /div>

            <
            div className = "panel-body" > {
                filtered.length === 0 && ( <
                    div style = {
                        { textAlign: 'center', padding: '40px 20px', color: 'var(--text2)' } } >
                    <
                    div style = {
                        { fontSize: 36, marginBottom: 12 } } > <MdMap style={{fontSize: 36}} /> < /div> <
                    div style = {
                        { fontWeight: 700, fontSize: 15, marginBottom: 6 } } > { routes.length === 0 ? 'Sin rutas disponibles' : 'Sin rutas de este tipo' } <
                    /div> <
                    div style = {
                        { fontSize: 13 } } > { routes.length === 0 ? 'Los administradores aún no han añadido rutas.' : 'Prueba otro filtro.' } <
                    /div> <
                    /div>
                )
            } {
                filtered.map(function(route) {
                        var lineColor = ROUTE_COLORS[route.type] || '#2a7fff';
                        var occ = getOcc(route.id);
                        var activeV = getVehiclesOn(route.id);
                        var stopNames = (route.stops || []).map(function(s) { return s.name; });

                        return ( <
                                div key = { route.id }
                                onClick = {
                                    function() { window.dispatchEvent(new CustomEvent('selectRoute', { detail: route }));
                                        closePanel(); } }
                                style = {
                                    { background: 'var(--surface2)', border: '1.5px solid var(--border)', borderLeft: '4px solid ' + lineColor, borderRadius: 14, padding: '14px 14px 12px', marginBottom: 10, cursor: 'pointer' } } >

                                <
                                div style = {
                                    { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 } } >
                                <
                                div style = {
                                    { display: 'flex', alignItems: 'center', gap: 7 } } >
                                <
                                span style = {
                                    { background: lineColor + '22', color: lineColor, padding: '2px 9px', borderRadius: 100, fontSize: 11, fontWeight: 700 } } > { route.type } < /span> {
                                    activeV.length > 0 && < span style = {
                                        { background: '#00d4a022', color: '#00d4a0', padding: '2px 8px', borderRadius: 100, fontSize: 10, fontWeight: 700 } } > 🟢{ activeV.length }
                                    en servicio < /span>} <
                                        /div> <
                                        span style = {
                                            { color: 'var(--accent)', fontSize: 13, fontWeight: 800 } } > RD$ { route.price } < /span> <
                                        /div>

                                    <
                                    div style = {
                                        { fontWeight: 700, fontSize: 13, marginBottom: 7, color: 'var(--text)' } } > { route.name } < /div>

                                    {
                                        stopNames.length > 0 && ( <
                                            div style = {
                                                { fontSize: 11, color: 'var(--text2)', marginBottom: 10, lineHeight: 1.5 } } > <MdLocationOn style={{display: 'inline', marginRight: 4}} />{ stopNames[0] } {
                                                stopNames.length > 2 && < span style = {
                                                    { opacity: .6 } } > ···{ stopNames.length - 2 }
                                                paradas < /span>} {
                                                    stopNames.length > 1 && < span > →<span style={{color: 'var(--accent)'}}></span>{ stopNames[stopNames.length - 1] } < /span>} <
                                                        /div>
                                                )
                                            }

                                            <
                                            div style = {
                                                { background: 'var(--surface3)', borderRadius: 100, height: 5, marginBottom: 8, overflow: 'hidden' } } >
                                            <
                                            div style = {
                                                { width: occ.pct, background: occ.color, height: '100%', borderRadius: 100 } }
                                            /> <
                                            /div>

                                            <
                                            div style = {
                                                { display: 'flex', alignItems: 'center', justifyContent: 'space-between' } } >
                                            <
                                            span style = {
                                                { fontSize: 11, color: occ.color, fontWeight: 700 } } > ●{ occ.text } < /span> <
                                            span style = {
                                                { fontSize: 11, color: 'var(--text2)' } } > {
                                                (route.stops || []).length }
                                            paradas· Ver en mapa→ < /span> <
                                            /div> <
                                            /div>
                                        );
                                    })
                            } <
                            /div> <
                            />
                    );
                }

                // ── Pestaña Planificar ─────────────────────────────────────────────
                function PlannerTab(props) {
                    var routes = props.routes;
                    var closePanel = props.closePanel;

                    var originState = useState(null);
                    var origin = originState[0];
                    var setOrigin = originState[1];

                    var destState = useState(null);
                    var dest = destState[0];
                    var setDest = destState[1];

                    var plansState = useState(null);
                    var plans = plansState[0];
                    var setPlans = plansState[1];

                    var loadingState = useState(false);
                    var loading = loadingState[0];
                    var setLoading = loadingState[1];

                    var errorState = useState('');
                    var error = errorState[0];
                    var setError = errorState[1];

                    // Escuchar eventos del mapa
                    useEffect(function() {
                        var onOriginSet = function(e) {
                            setOrigin(e.detail.stop);
                            setPlans(null);
                            setError('');
                        };
                        var onDestSet = function(e) {
                            setDest(e.detail.stop);
                            setPlans(null);
                            setError('');
                        };
                        window.addEventListener('plannerOriginSet', onOriginSet);
                        window.addEventListener('plannerDestSet', onDestSet);
                        return function() {
                            window.removeEventListener('plannerOriginSet', onOriginSet);
                            window.removeEventListener('plannerDestSet', onDestSet);
                        };
                    }, []);

                    // Auto-buscar cuando ambos listos
                    useEffect(function() {
                        if (!origin || !dest) return;
                        if (origin.name === dest.name) {
                            setError('El origen y el destino son el mismo punto.');
                            return;
                        }
                        setError('');
                        setLoading(true);
                        var t = setTimeout(function() {
                            var results = planRoutes(routes, origin, dest);
                            setPlans(results);
                            setLoading(false);
                        }, 500);
                        return function() { clearTimeout(t); };
                    }, [origin, dest, routes]);

                    var handlePickOrigin = function() {
                        window.dispatchEvent(new CustomEvent('plannerStartPickOrigin'));
                        closePanel();
                    };

                    var handlePickDest = function() {
                        window.dispatchEvent(new CustomEvent('plannerStartPickDest'));
                        closePanel();
                    };

                    var handleReset = function() {
                        setOrigin(null);
                        setDest(null);
                        setPlans(null);
                        setError('');
                        window.dispatchEvent(new CustomEvent('plannerCancel'));
                    };

                    var handleSelectPlan = function(plan) {
                        window.dispatchEvent(new CustomEvent('showRoutePlan', { detail: plan }));
                        closePanel();
                    };

                    return ( <
                        div className = "panel-body" >

                        { /* Selector de puntos */ } <
                        div style = {
                            { background: 'var(--surface2)', border: '1.5px solid var(--border)', borderRadius: 14, padding: 14, marginBottom: 10 } } >

                        <
                        div style = {
                            { fontSize: 10, fontWeight: 700, color: 'var(--text2)', marginBottom: 6, letterSpacing: .6 } } > ORIGEN < /div> <
                        button onClick = { handlePickOrigin }
                        style = {
                            {
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 10,
                                background: origin ? '#00d4a022' : 'var(--surface3)',
                                border: origin ? '1.5px solid #00d4a0' : '1.5px dashed var(--border)',
                                borderRadius: 10,
                                padding: '11px 14px',
                                cursor: 'pointer',
                                textAlign: 'left',
                                transition: 'all .2s'
                            }
                        } >
                        <
                        span style = {
                            { fontSize: 18 } } > <MdLocationOn /> < /span> <
                        div style = {
                            { flex: 1 } } >
                        <
                        div style = {
                            { fontSize: 13, fontWeight: origin ? 700 : 400, color: origin ? '#00d4a0' : 'var(--text2)' } } > { origin ? origin.name : 'Toca para marcar en el mapa' } <
                        /div> {
                            origin && ( <
                                div style = {
                                    { fontSize: 10, color: 'var(--text2)', marginTop: 2 } } > { origin.lat.toFixed(4) }, { origin.lng.toFixed(4) } <
                                /div>
                            )
                        } <
                        /div> <
                        span style = {
                            { fontSize: 10, fontWeight: 700, padding: '3px 8px', background: origin ? '#00d4a033' : 'var(--surface3)', color: origin ? '#00d4a0' : 'var(--text2)', borderRadius: 100 } } > { origin ? <MdCheckCircle style={{display: 'inline'}} /> : <MdMap style={{display: 'inline'}} /> } <
                        /span> <
                        /button>

                        { /* Flecha */ } <
                        div style = {
                            { display: 'flex', alignItems: 'center', gap: 8, margin: '10px 0' } } >
                        <
                        div style = {
                            { flex: 1, height: 1, background: 'var(--border)' } }
                        /> <
                        span style = {
                            { fontSize: 16, color: 'var(--text2)' } } > ⬇ < /span> <
                        div style = {
                            { flex: 1, height: 1, background: 'var(--border)' } }
                        /> <
                        /div>

                        <
                        div style = {
                            { fontSize: 10, fontWeight: 700, color: 'var(--text2)', marginBottom: 6, letterSpacing: .6 } } > DESTINO < /div> <
                        button onClick = { handlePickDest }
                        style = {
                            {
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 10,
                                background: dest ? '#ff3b5c22' : 'var(--surface3)',
                                border: dest ? '1.5px solid #ff3b5c' : '1.5px dashed var(--border)',
                                borderRadius: 10,
                                padding: '11px 14px',
                                cursor: 'pointer',
                                textAlign: 'left',
                                transition: 'all .2s'
                            }
                        } >
                        <
                        span style = {
                            { fontSize: 18 } } > <MdFlag /> < /span> <
                        div style = {
                            { flex: 1 } } >
                        <
                        div style = {
                            { fontSize: 13, fontWeight: dest ? 700 : 400, color: dest ? '#ff3b5c' : 'var(--text2)' } } > { dest ? dest.name : 'Toca para marcar en el mapa' } <
                        /div> {
                            dest && ( <
                                div style = {
                                    { fontSize: 10, color: 'var(--text2)', marginTop: 2 } } > { dest.lat.toFixed(4) }, { dest.lng.toFixed(4) } <
                                /div>
                            )
                        } <
                        /div> <
                        span style = {
                            { fontSize: 10, fontWeight: 700, padding: '3px 8px', background: dest ? '#ff3b5c33' : 'var(--surface3)', color: dest ? '#ff3b5c' : 'var(--text2)', borderRadius: 100 } } > { dest ? <MdCheckCircle style={{display: 'inline'}} /> : <MdMap style={{display: 'inline'}} /> } <
                        /span> <
                        /button> <
                        /div>

                        { /* Error */ } {
                            error && ( <
                                div style = {
                                    { background: '#ff3b5c22', border: '1px solid #ff3b5c55', borderRadius: 10, padding: '8px 12px', fontSize: 12, color: '#ff3b5c', marginBottom: 10 } } > <MdWarning style={{display: 'inline', marginRight: 4}} />{ error } <
                                /div>
                            )
                        }

                        { /* Limpiar */ } {
                            (origin || dest) && ( <
                                button onClick = { handleReset }
                                style = {
                                    {
                                        width: '100%',
                                        background: 'transparent',
                                        border: '1px solid var(--border)',
                                        borderRadius: 10,
                                        padding: '8px',
                                        fontSize: 12,
                                        color: 'var(--text2)',
                                        cursor: 'pointer',
                                        marginBottom: 10
                                    }
                                } > 🗑Limpiar selección <
                                /button>
                            )
                        }

                        { /* Loading */ } {
                            loading && ( <
                                div style = {
                                    { textAlign: 'center', padding: '20px', color: 'var(--text2)', fontSize: 13 } } > <MdSearch style={{display: 'inline', marginRight: 4}} />Buscando rutas... <
                                /div>
                            )
                        }

                        { /* Resultados */ } {
                            !loading && plans !== null && (
                                plans.length === 0 ?
                                ( <
                                    div style = {
                                        { textAlign: 'center', padding: '28px 20px', background: 'var(--surface2)', borderRadius: 14, border: '1.5px solid var(--border)' } } >
                                    <
                                    div style = {
                                        { fontSize: 30, marginBottom: 8 } } > 🤔 < /div> <
                                    div style = {
                                        { fontWeight: 700, fontSize: 13, marginBottom: 4 } } > Sin conexión encontrada < /div> <
                                    div style = {
                                        { fontSize: 12, color: 'var(--text2)', lineHeight: 1.5 } } >
                                    No hay rutas entre esos puntos. < br / >
                                    Intenta marcar puntos más cercanos a las paradas. <
                                    /div> <
                                    /div>
                                ) :
                                ( <
                                    >
                                    <
                                    div style = {
                                        { fontSize: 10, fontWeight: 700, color: 'var(--text2)', marginBottom: 10, letterSpacing: .6 } } > { plans.length }
                                    OPCION { plans.length > 1 ? 'ES' : '' }
                                    ENCONTRADA { plans.length > 1 ? 'S' : '' } <
                                    /div> {
                                        plans.map(function(plan, i) {
                                            return <PlanCard key = { i }
                                            plan = { plan }
                                            index = { i }
                                            onSelect = { handleSelectPlan }
                                            />;
                                        })
                                    } <
                                    />
                                )
                            )
                        }

                        { /* Estado vacío */ } {
                            !loading && plans === null && !error && ( <
                                div style = {
                                    { textAlign: 'center', padding: '28px 16px', color: 'var(--text2)', fontSize: 12, lineHeight: 1.8 } } >
                                <
                                div style = {
                                    { fontSize: 40, marginBottom: 12 } } > <MdMap style={{fontSize: 40}} /> < /div> <
                                div style = {
                                    { fontWeight: 700, fontSize: 14, color: 'var(--text)', marginBottom: 6 } } > ¿A dónde vas ? < /div> <
                                div > Toca los botones de arriba para < br / > marcar origen y destino en el mapa. < /div> <
                                /div>
                            )
                        } <
                        /div>
                    );
                }

                // ── Panel principal ────────────────────────────────────────────────
                var RoutesPanel = function() {
                    var ctx = useApp();
                    var activePanel = ctx.activePanel;
                    var closePanel = ctx.closePanel;
                    var routes = ctx.myRoutes || ctx.routes;
                    var vehicles = ctx.vehicles;

                    var tabState = useState('browse');
                    var tab = tabState[0];
                    var setTab = tabState[1];

                    var isOpen = activePanel === 'routes-panel';
                    if (!isOpen) return null;

                    var TABS = [
                        { id: 'browse', label: <><MdDirectionsTransit /> Rutas</> },
                        { id: 'planner', label: <><MdMap /> Planificar</> }
                    ];

                    return ( <
                        >
                        <
                        div className = "panel-overlay open"
                        onClick = { closePanel }
                        /> <
                        div className = "panel glass open"
                        id = "routes-panel" >
                        <
                        div className = "panel-handle" / >

                        <
                        div className = "panel-header" >
                        <
                        span className = "panel-title" > <MdDirectionsTransit /> Rutas de transporte < /span> <
                        button className = "panel-close"
                        onClick = { closePanel } >
                        <
                        svg viewBox = "0 0 24 24"
                        fill = "none"
                        stroke = "currentColor"
                        strokeWidth = "2" >
                        <
                        line x1 = "18"
                        y1 = "6"
                        x2 = "6"
                        y2 = "18" / >
                        <
                        line x1 = "6"
                        y1 = "6"
                        x2 = "18"
                        y2 = "18" / >
                        <
                        /svg> <
                        /button> <
                        /div>

                        { /* Tabs */ } <
                        div style = {
                            { display: 'flex', margin: '0 16px', borderRadius: 10, background: 'var(--surface3)', border: '1px solid var(--border)', overflow: 'hidden' } } > {
                            TABS.map(function(t) {
                                return ( <
                                    button key = { t.id }
                                    onClick = {
                                        function() { setTab(t.id); } }
                                    style = {
                                        {
                                            flex: 1,
                                            padding: '9px 0',
                                            border: 'none',
                                            cursor: 'pointer',
                                            fontFamily: 'inherit',
                                            fontSize: 12,
                                            fontWeight: 700,
                                            background: tab === t.id ? 'var(--accent)' : 'transparent',
                                            color: tab === t.id ? '#fff' : 'var(--text2)',
                                            transition: 'all .2s'
                                        }
                                    } > { t.label } <
                                    /button>
                                );
                            })
                        } <
                        /div>

                        {
                            tab === 'browse' ?
                                < BrowseTab routes = { routes }
                            vehicles = { vehicles }
                            closePanel = { closePanel }
                            />: < PlannerTab routes = { routes }
                            closePanel = { closePanel }
                            />
                        } <
                        /div> <
                        />
                    );
                };

                export default RoutesPanel;