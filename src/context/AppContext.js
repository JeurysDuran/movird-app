// src/context/AppContext.js
import React, { createContext, useState, useContext, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { INITIAL_STATE, SEED_ROUTES, generateVehicleId, generateRouteId } from '../data/mockData';

const AppContext = createContext();
export const useApp = () => useContext(AppContext);

// ── localStorage helpers ───────────────────────────────────────
const LS = {
    get: (key, fallback) => {
        try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
    },
    set: (key, val) => { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} },
    del: (key) => { try { localStorage.removeItem(key); } catch {} },
};

export const AppProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(() => LS.get('movird_session', null));
    const [users, setUsers] = useState(() => LS.get('movird_users', INITIAL_STATE.users));
    // Rutas: usar key v3 para forzar limpiado del cache de las que estaban rotas/rectas
    const [routes, setRoutes] = useState(() => {
        const saved = LS.get("movird_routes_v4", null);
        if (!saved || !saved.length) return SEED_ROUTES;
        const realAdminRoutes = saved.filter(function(r) { return !!r.createdAt; });
        return realAdminRoutes.length > 0 ? realAdminRoutes : SEED_ROUTES;
    });

    const [vehicles, setVehicles] = useState([]);
    const [dangerZones, setDangerZones] = useState(() => LS.get('movird_dzones', INITIAL_STATE.dangerZones));
    const [reports, setReports] = useState(() => LS.get('movird_reports', INITIAL_STATE.reports));
    const [transactions, setTransactions] = useState(() => LS.get('movird_txns', INITIAL_STATE.transactions));

        const [settings, setSettings] = useState(() => LS.get('movird_settings', {
        basePriceOMSA: 15,
        basePriceConcho: 50,
        basePriceMetro: 35,
        basePriceTeleferico: 20,
        simulationSpeed: 'Normal',
        enableTrafficAlerts: true
    }));
    useEffect(() => { LS.set('movird_settings', settings); }, [settings]);
    const updateSettings = useCallback((newConf) => setSettings(newConf), []);

    const [activePanel, setActivePanel] = useState(null);
    const [activeSidePanel, setActiveSidePanel] = useState(null);
    const [toast, setToast] = useState({ message: '', type: '', show: false });
    const [loading, setLoading] = useState(true);
    const [map, setMap] = useState(null);
    const [userLocation, setUserLocation] = useState(null);

    const watchRef = useRef(null);

    // Persistir
    useEffect(() => { LS.set('movird_session', currentUser); }, [currentUser]);
    useEffect(() => { LS.set('movird_users', users); }, [users]);
    useEffect(() => { LS.set('movird_routes_v4', routes); }, [routes]);
    useEffect(() => { LS.set('movird_vehicles_v4', vehicles); }, [vehicles]);
    useEffect(() => { LS.set('movird_dzones', dangerZones); }, [dangerZones]);
    useEffect(() => { LS.set('movird_reports', reports); }, [reports]);
    useEffect(() => { LS.set('movird_txns', transactions); }, [transactions]);

    useEffect(() => { setTimeout(() => setLoading(false), 1500); }, []);

    // GPS
    useEffect(() => {
        if (!currentUser || !navigator.geolocation) return;
        watchRef.current = navigator.geolocation.watchPosition(
            (pos) => {
                const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                setUserLocation(loc);
                if (currentUser.role === 'driver' && currentUser.vehicleId) {
                    setVehicles(prev => prev.map(v =>
                        v.id === currentUser.vehicleId ? {...v, lat: loc.lat, lng: loc.lng, lastUpdated: Date.now() } :
                        v
                    ));
                }
            },
            () => {}, { enableHighAccuracy: true, maximumAge: 4000, timeout: 10000 }
        );
        return () => { if (watchRef.current) navigator.geolocation.clearWatch(watchRef.current); };
    }, [currentUser]);

    // ── Local OSRM Fetching ────────────────────────────────────────
    useEffect(() => {
        const initializeRealRoutes = async () => {
            let changed = false;
            const newRoutes = await Promise.all(routes.map(async r => {
                if (r.geometry && r.geometry.length > 5) return r; // ya calculado
                changed = true;
                if (r.type === 'Metro' || r.type === 'Teleferico') {
                    return {...r, geometry: r.stops.map(s => [s.lat, s.lng]) };
                }
                try {
                    const coords = r.stops.map(s => `${s.lng},${s.lat}`).join(';');
                    const url = `http://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`;
                    const res = await fetch(url);
                    const data = await res.json();
                    if(data.code === 'Ok' && data.routes[0]) {
                        return {...r, geometry: data.routes[0].geometry.coordinates.map(c => [c[1], c[0]])};
                    }
                } catch(e) {}
                
                return {...r, geometry: r.stops.map(s => [s.lat, s.lng])};
            }));
            
            if (changed) setRoutes(newRoutes);
        };
        initializeRealRoutes();
    }, [routes]);

    // ── Local Simulation Loop ──────────────────────────────────────
    useEffect(() => {
        if (routes.length === 0) return;

        // Seeding vehicles
        if (vehicles.length === 0) {
            let genVehicles = [];
            routes.forEach(route => {
                if (!route.geometry || route.geometry.length < 2) return;
                const num = route.type === 'Metro' ? 2 : 3;
                for (let i = 0; i < num; i++) {
                    const startIdx = Math.floor(Math.random() * Math.max(1, (route.geometry.length - 10)));
                    const pt = route.geometry[startIdx];
                    if(!pt) continue;
                    genVehicles.push({
                        id: 'V-' + (Math.floor(Math.random() * 9000) + 1000),
                        routeId: route.id,
                        type: route.type,
                        occupancy: ['Vacio', 'Medio', 'Lleno'][Math.floor(Math.random() * 3)],
                        lat: pt[0],
                        lng: pt[1],
                        passengers: [],
                        _targetGeoIdx: startIdx + 1,
                        _forward: true,
                        sindicatoId: route.sindicatoId,
                    });
                }
            });
            setVehicles(genVehicles);
            return;
        }

        const interval = setInterval(() => {
            setVehicles(prev => prev.map(v => {
                const route = routes.find(r => r.id === v.routeId);
                if (!route || !route.geometry || route.geometry.length < 2) return v;

                const targetPoint = route.geometry[v._targetGeoIdx];
                if (!targetPoint) return v;

                const distLat = targetPoint[0] - v.lat;
                const distLng = targetPoint[1] - v.lng;
                const distanceToTarget = Math.sqrt(distLat*distLat + distLng*distLng);

                if (distanceToTarget < 0.0003) {
                    let nextIdx = v._forward ? v._targetGeoIdx + 1 : v._targetGeoIdx - 1;
                    let newForward = v._forward;
                    if (nextIdx >= route.geometry.length) { nextIdx = route.geometry.length - 2; newForward = false; } 
                    else if (nextIdx < 0) { nextIdx = 1; newForward = true; }
                    return {...v, lat: targetPoint[0], lng: targetPoint[1], _targetGeoIdx: nextIdx, _forward: newForward };
                }

                let stepSize = v.type === 'Metro' || v.type === 'Teleferico' ? 0.0020 : 0.0006; 

                // Si está demasiado cerca no sobrepasarse
                if (distanceToTarget <= stepSize) {
                    return {...v, lat: targetPoint[0], lng: targetPoint[1]};
                }

                const moveLat = (distLat / distanceToTarget) * stepSize;
                const moveLng = (distLng / distanceToTarget) * stepSize;

                return {...v, lat: v.lat + moveLat, lng: v.lng + moveLng};
            }));
        }, 1000);

        return () => clearInterval(interval);
    }, [routes]);


    // ── Toast ──────────────────────────────────────────────────────
    const showToast = useCallback((message, type) => {
        if (!type) type = 'accent';
        setToast({ message, type, show: true });
        setTimeout(() => setToast({ message: '', type: '', show: false }), 3000);
    }, []);

    // ── Auth ───────────────────────────────────────────────────────
    const login = useCallback((email, password) => {
        const key = email.toLowerCase().trim();
        const user = users[key];
        if (user && user.pass === password) {
            setCurrentUser({...user, email: key});
            LS.set('movird_token', 'local_token');
            showToast('Bienvenido, ' + user.name, 'accent');
            return true;
        }
        showToast('Credenciales incorrectas', 'danger');
        return false;
    }, [users, showToast]);

    const loginDriver = useCallback((username, password) => {
        const entry = Object.entries(users).find(
            function(e) { return e[1].role === 'driver' && e[1].username === username.trim(); }
        );
        if (!entry || entry[1].pass !== password) {
            showToast('Usuario o contraseña incorrectos', 'danger');
            return false;
        }
        setCurrentUser({...entry[1], email: entry[0] });
        showToast('Bienvenido, ' + entry[1].name, 'accent');
        return true;
    }, [users, showToast]);

    const logout = useCallback(() => {
        setCurrentUser(null);
        LS.del('movird_session');
        LS.del('movird_token');
        setActivePanel(null);
        setActiveSidePanel(null);
        setUserLocation(null);
        showToast('Sesión cerrada', 'accent');
    }, [showToast]);

    const registerUser = useCallback((name, email, password) => {
        const key = email.toLowerCase().trim();
        if (users[key]) {
            showToast('Ese correo ya está registrado', 'danger');
            return false;
        }
        const newUser = {
            pass: password, role: 'Passenger', name: name.trim(), balance: 0, trips: 0, reports: 0, createdAt: Date.now()
        };
        setUsers(prev => ({...prev, [key]: newUser }));
        setCurrentUser({...newUser, email: key });
        showToast('Cuenta creada con éxito', 'accent');
        return true;
    }, [users, showToast]);

    const registerCompanyAdmin = useCallback((name, email, password, sindicatoId) => {
        const key = email.toLowerCase().trim();
        if (users[key]) { showToast('Ese correo ya está registrado', 'danger'); return false; }
        const newAdmin = {
            pass: password,
            role: 'company_admin',
            name: name.trim(),
            sindicatoId,
            phone: '',
            balance: 0,
            trips: 0,
            reports: 0,
            createdAt: Date.now()
        };
        setUsers(prev => ({...prev, [key]: newAdmin }));
        setCurrentUser({...newAdmin, email: key });
        showToast('Cuenta de compañía creada', 'accent');
        return true;
    }, [users, showToast]);

    // ── Admin: chofer ──────────────────────────────────────────────
    const createDriver = useCallback((driverData) => {
        const isAuthorized = currentUser && (currentUser.role === 'company_admin' || currentUser.role === 'admin');
        if (!isAuthorized) return false;
        const username = driverData.username || driverData.name.toLowerCase().replace(/\s+/g, '.');
        const emailKey = 'driver.' + username + '@movird.internal';
        if (users[emailKey]) { showToast('Ese usuario ya existe', 'danger'); return false; }
        const newDriver = {
            pass: driverData.password,
            role: 'driver',
            username: username,
            name: driverData.name.trim(),
            phone: driverData.phone || '',
            sindicatoId: currentUser.sindicatoId || 'default',
            vehicleId: null,
            routeId: null,
            balance: 0,
            trips: 0,
            reports: 0,
            income: 0,
            passengers: 0,
            createdAt: Date.now(),
            createdBy: currentUser.email
        };
        setUsers(prev => ({...prev, [emailKey]: newDriver }));
        showToast('Chofer ' + driverData.name + ' creado ✅', 'accent');
        return {...newDriver, email: emailKey };
    }, [currentUser, users, showToast]);

    // ── Admin: rutas ───────────────────────────────────────────────
    const createRoute = useCallback(async (routeData) => {
        const isAuthorized = currentUser && (currentUser.role === 'company_admin' || currentUser.role === 'admin');
        if (!isAuthorized) return false;
        
        showToast('Calculando ruta trazada (OSRM Local)...', 'wait');
        
        let newRoute = {
            id: generateRouteId(routes),
            name: routeData.name.trim(),
            type: routeData.type || 'Concho',
            price: Number(routeData.price) || 25,
            stops: routeData.stops || [],
            sindicatoId: currentUser.sindicatoId,
            createdAt: Date.now()
        };

        try {
            const coordsStr = newRoute.stops.map(s => `${s.lng},${s.lat}`).join(';');
            const url = `http://router.project-osrm.org/route/v1/driving/${coordsStr}?overview=full&geometries=geojson`;
            const res = await fetch(url);
            const data = await res.json();
            if (data.code === 'Ok' && data.routes[0]) {
                 newRoute.geometry = data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
            }
        } catch(e) {}

        if (!newRoute.geometry) newRoute.geometry = newRoute.stops.map(s => [s.lat, s.lng]);

        setRoutes(prev => [...prev, newRoute]);

        // Generar un vehiculo atado a esta ruta nueva
        const pt = newRoute.geometry[0];
        if (pt) {
            setVehicles(prev => [...prev, {
                id: 'V-' + (Math.floor(Math.random() * 9000) + 1000),
                routeId: newRoute.id,
                type: newRoute.type,
                occupancy: 'Vacio',
                lat: pt[0],
                lng: pt[1],
                passengers: [],
                _targetGeoIdx: 1,
                _forward: true,
                sindicatoId: newRoute.sindicatoId,
            }]);
        }

        showToast('Ruta "' + newRoute.name + '" inyectada al mapa', 'accent');
        return newRoute;
    }, [currentUser, routes, showToast]);

    const deleteRoute = useCallback((routeId) => {
        // Eliminar también los vehículos asociados a esa ruta
        setVehicles(prev => prev.filter(function(v) { return v.routeId !== routeId; }));
        setRoutes(prev => prev.filter(function(r) { return r.id !== routeId; }));
        showToast('Ruta eliminada ✅', 'warn');
        return true;
    }, [showToast]);

    // ── Admin: vehículos ───────────────────────────────────────────
    const createVehicle = useCallback((vehicleData) => {
        const isAuthorized = currentUser && (currentUser.role === 'company_admin' || currentUser.role === 'admin');
        if (!isAuthorized) return false;
        const id = generateVehicleId();
        const newVehicle = {
            id: id,
            sindicatoId: currentUser.sindicatoId,
            routeId: vehicleData.routeId || null,
            type: vehicleData.type || 'Concho',
            occupancy: 'Vacio',
            lastUpdated: Date.now(),
            driverEmail: vehicleData.driverEmail || null,
            driver: vehicleData.driverName || 'Sin chofer',
            lat: null,
            lng: null,
            passengers: [],
            active: true
        };
        if (vehicleData.driverEmail && users[vehicleData.driverEmail]) {
            setUsers(prev => ({
                ...prev,
                [vehicleData.driverEmail]: {
                    ...prev[vehicleData.driverEmail],
                    vehicleId: id,
                    routeId: vehicleData.routeId || null
                }
            }));
        }
        setVehicles(prev => [...prev, newVehicle]);
        showToast('Vehículo ' + id + ' registrado', 'accent');
        return newVehicle;
    }, [currentUser, users, showToast]);

    const deleteVehicle = useCallback((vehicleId) => {
        setVehicles(prev => prev.filter(function(v) { return v.id !== vehicleId; }));
        showToast('Vehículo eliminado', 'warn');
    }, [showToast]);

    // ── Ocupación ──────────────────────────────────────────────────
    const updateOccupancy = useCallback((vehicleId, level) => {
        setVehicles(prev => prev.map(function(v) {
            return v.id === vehicleId ? {...v, occupancy: level, lastUpdated: Date.now() } : v;
        }));
        showToast('Ocupación: ' + level, 'accent');
    }, [showToast]);

    // ── Boarding ───────────────────────────────────────────────────
    const boardVehicle = useCallback((vehicleId) => {
        if (!currentUser) return false;
        const vehicle = vehicles.find(function(v) { return v.id === vehicleId; });
        if (!vehicle) return false;
        if (vehicle.passengers.includes(currentUser.email)) {
            showToast('Ya estás a bordo', 'warn');
            return false;
        }
        setVehicles(prev => prev.map(function(v) {
            return v.id === vehicleId ? {...v, passengers: [...v.passengers, currentUser.email], lastUpdated: Date.now() } :
                v;
        }));
        setCurrentUser(prev => ({...prev, onBoard: vehicleId }));
        showToast('Te montaste en la ruta', 'accent');
        return true;
    }, [currentUser, vehicles, showToast]);

    const alightVehicle = useCallback((vehicleId, occupancyLevel) => {
        if (!currentUser) return;
        setVehicles(prev => prev.map(function(v) {
            if (v.id !== vehicleId) return v;
            var updated = {...v, passengers: v.passengers.filter(function(e) { return e !== currentUser.email; }), lastUpdated: Date.now() };
            if (occupancyLevel) updated.occupancy = occupancyLevel;
            return updated;
        }));
        setCurrentUser(prev => ({...prev, onBoard: null }));
        showToast('Bajaste de la guagua', 'accent');
    }, [currentUser, showToast]);

    // ── ETA ────────────────────────────────────────────────────────
    const haversine = function(lat1, lng1, lat2, lng2) {
        var R = 6371,
            toR = Math.PI / 180;
        var dLat = (lat2 - lat1) * toR,
            dLng = (lng2 - lng1) * toR;
        var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * toR) * Math.cos(lat2 * toR) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    };

    const getETA = useCallback((vehicleId, targetLat, targetLng) => {
        var v = vehicles.find(function(v) { return v.id === vehicleId; });
        if (!v || v.lat == null || v.lng == null) return null;
        var dist = haversine(v.lat, v.lng, targetLat, targetLng);
        return Math.max(1, Math.round((dist / 20) * 60));
    }, [vehicles]);

    const getETAToUser = useCallback((vehicleId) => {
        if (!userLocation) return null;
        return getETA(vehicleId, userLocation.lat, userLocation.lng);
    }, [userLocation, getETA]);

    // ── Zonas peligro ──────────────────────────────────────────────
    const addDangerZone = useCallback((name, risk, lat, lng) => {
        if (!lat || !lng) { showToast('Ubicación inválida', 'danger'); return false; }
        var zone = {
            id: Date.now(),
            name: name || 'Zona peligrosa',
            risk: risk || 'Medio',
            incidents: 1,
            lat: lat,
            lng: lng,
            reportedBy: currentUser ? currentUser.email : 'anónimo',
            createdAt: Date.now()
        };
        setDangerZones(prev => [...prev, zone]);
        showToast('Zona marcada: ' + zone.name, 'warn');
        return zone;
    }, [currentUser, showToast]);

    const deleteDangerZone = useCallback((id) => {
        setDangerZones(prev => prev.filter(function(z) { return z.id !== id; }));
        showToast('Zona eliminada', 'warn');
    }, [showToast]);

    // ── Reportes ───────────────────────────────────────────────────
    const addReport = useCallback((typeId, label, lat, lng) => {
        var rep = {
            id: Date.now(),
            typeId: typeId,
            label: label,
            lat: lat || (userLocation ? userLocation.lat : null),
            lng: lng || (userLocation ? userLocation.lng : null),
            time: 'ahora mismo',
            user: currentUser ? currentUser.name : 'Anónimo',
            userEmail: currentUser ? currentUser.email : null,
            verified: false
        };
        setReports(prev => [rep, ...prev]);
        if (currentUser) {
            var upd = {...currentUser, reports: (currentUser.reports || 0) + 1 };
            setCurrentUser(upd);
            setUsers(prev => ({...prev, [currentUser.email]: upd }));
        }
        showToast('Reporte: ' + label, 'warn');
    }, [currentUser, userLocation, showToast]);

    // ── Pagos ──────────────────────────────────────────────────────
    const makePayment = useCallback((amount, type, driverName) => {
        if (!driverName) driverName = 'General';
        var bal = currentUser ? currentUser.balance || 0 : 0;
        if (bal < amount) { showToast('Saldo insuficiente. Faltan RD$' + (amount - bal), 'danger'); return false; }
        if (currentUser) {
            var upd = {...currentUser, balance: bal - amount, trips: (currentUser.trips || 0) + 1 };
            setCurrentUser(upd);
            setUsers(prev => ({...prev, [currentUser.email]: upd }));
        }
        setTransactions(prev => [{
            id: Date.now(),
            user: currentUser ? currentUser.name : 'Usuario',
            userEmail: currentUser ? currentUser.email : null,
            type: type,
            amount: amount,
            driver: driverName,
            time: 'ahora mismo'
        }, ...prev]);
        showToast('Pago RD$' + amount, 'accent');
        return true;
    }, [currentUser, showToast]);

    const rechargeBalance = useCallback((amount) => {
        if (amount < 1 || amount > 10000) { showToast('Monto inválido', 'danger'); return false; }
        if (currentUser) {
            var upd = {...currentUser, balance: (currentUser.balance || 0) + amount };
            setCurrentUser(upd);
            setUsers(prev => ({...prev, [currentUser.email]: upd }));
            showToast('Recarga: RD$' + amount, 'accent');
        }
        return true;
    }, [currentUser, showToast]);

    // \u2500\u2500 Pago real pasajero → chofer ──────────────────────────────────────────
    const payDriver = useCallback((driverCode, amount) => {
        if (!currentUser) { showToast('Debes iniciar sesión', 'danger'); return false; }
        // driverCode puede ser email o username del chofer (case-insensitive)
        const codeLower = driverCode.toLowerCase().trim();
        const driverEntry = Object.entries(users).find(([email, u]) =>
            u.role === 'driver' && (
                email.toLowerCase() === codeLower ||
                (u.username && u.username.toLowerCase() === codeLower) ||
                email.toLowerCase().startsWith('driver.' + codeLower + '@')
            )
        );
        if (!driverEntry) { showToast('Código de chofer no válido: ' + driverCode, 'danger'); return false; }
        const [driverEmail, driverUser] = driverEntry;
        const bal = currentUser.balance || 0;
        if (bal < amount) { showToast('Saldo insuficiente. Faltan RD$' + (amount - bal), 'danger'); return false; }
        // Descontar al pasajero
        const updPassenger = {...currentUser, balance: bal - amount, trips: (currentUser.trips || 0) + 1 };
        setCurrentUser(updPassenger);
        setUsers(prev => ({
            ...prev,
            [currentUser.email]: updPassenger,
            [driverEmail]: {...prev[driverEmail], balance: (prev[driverEmail].balance || 0) + amount, income: (prev[driverEmail].income || 0) + amount, passengers: (prev[driverEmail].passengers || 0) + 1 }
        }));
        setTransactions(prev => [{
            id: Date.now(),
            user: currentUser.name,
            userEmail: currentUser.email,
            type: 'Pago a chofer',
            amount: amount,
            driver: driverUser.name,
            driverEmail: driverEmail,
            time: new Date().toLocaleTimeString('es-DO', {hour: '2-digit', minute: '2-digit'})
        }, ...prev]);
        showToast('Pagaste RD$' + amount + ' a ' + driverUser.name, 'accent');
        return { driverName: driverUser.name };
    }, [currentUser, users, showToast]);

    // Código único del chofer = username sin el prefix
    const driverCode = currentUser && currentUser.role === 'driver'
        ? (currentUser.username || currentUser.email.replace('driver.', '').split('@')[0]).toUpperCase()
        : null;

    // ── Computed ───────────────────────────────────────────────────
    var myRoutes = routes.filter(function(r) {
        if (!currentUser) return false;
        if (currentUser.role === 'user' || currentUser.role === 'Passenger' || currentUser.role === 'admin') return true;
        if (currentUser.role === 'driver') return r.id === currentUser.routeId;
        return r.sindicatoId === currentUser.sindicatoId;
    });

    var myVehicles = vehicles.filter(function(v) {
        if (!currentUser) return false;
        if (currentUser.role === 'user' || currentUser.role === 'Passenger' || currentUser.role === 'admin') return true;
        if (currentUser.role === 'driver') return v.id === currentUser.vehicleId;
        return v.sindicatoId === currentUser.sindicatoId;
    });

    var myDrivers = Object.entries(users)
        .filter(function(e) { return e[1].role === 'driver' && currentUser && e[1].sindicatoId === currentUser.sindicatoId; })
        .map(function(e) { return {...e[1], email: e[0] }; });

    // ── Panels ─────────────────────────────────────────────────────
    const openPanel = (p) => setActivePanel(p);
    const closePanel = () => setActivePanel(null);
    const openSidePanel = (p) => setActiveSidePanel(p);
    const closeSidePanel = () => setActiveSidePanel(null);
    const closeAllPanels = () => {
        setActivePanel(null);
        setActiveSidePanel(null);
    };

    return (
        <AppContext.Provider value={{ settings, updateSettings, 
            currentUser,
            users,
            routes,
            vehicles,
            dangerZones,
            reports,
            transactions,
            activePanel,
            activeSidePanel,
            loading,
            map,
            toast,
            userLocation,
            myRoutes,
            myVehicles,
            myDrivers,
            driverCode,
            setMap,
            setVehicles,
            showToast,
            login,
            loginDriver,
            logout,
            registerUser,
            registerCompanyAdmin,
            createDriver,
            createRoute,
            deleteRoute,
            createVehicle,
            deleteVehicle,
            updateOccupancy,
            boardVehicle,
            alightVehicle,
            getETA,
            getETAToUser,
            haversine,
            addDangerZone,
            deleteDangerZone,
            addReport,
            makePayment,
            rechargeBalance,
            payDriver,
            openPanel,
            closePanel,
            openSidePanel,
            closeSidePanel,
            closeAllPanels,
        }}>
            {children}
        </AppContext.Provider>
    );
};