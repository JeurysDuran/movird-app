// src/context/AppContext.js
import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import {
    DEMO_ACCOUNTS,
    INITIAL_ROUTES,
    INITIAL_VEHICLES,
    INITIAL_DANGER_ZONES,
    generateVehicleId,
    generateRouteId
} from '../data/mockData';

const AppContext = createContext();
export const useApp = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [users, setUsers] = useState(DEMO_ACCOUNTS);
    const [routes, setRoutes] = useState(INITIAL_ROUTES);
    const [vehicles, setVehicles] = useState(INITIAL_VEHICLES);
    const [dangerZones, setDangerZones] = useState(INITIAL_DANGER_ZONES);
    const [reports, setReports] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [activePanel, setActivePanel] = useState(null);
    const [activeSidePanel, setActiveSidePanel] = useState(null);
    const [toast, setToast] = useState({ message: '', type: '', show: false });
    const [loading, setLoading] = useState(true);
    const [map, setMap] = useState(null);
    // Ubicación en tiempo real del usuario actual
    const [userLocation, setUserLocation] = useState(null);
    const watchIdRef = useRef(null);

    useEffect(() => {
        setTimeout(() => setLoading(false), 1800);
    }, []);

    // Rastreo de ubicación GPS cuando hay usuario logueado
    useEffect(() => {
        if (!currentUser) return;
        if (!navigator.geolocation) return;

        watchIdRef.current = navigator.geolocation.watchPosition(
            (pos) => {
                const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                setUserLocation(loc);

                // Si el usuario es chofer, actualizar posición de su vehículo
                if (currentUser.role === 'driver' && currentUser.vehicleId) {
                    setVehicles(prev => prev.map(v =>
                        v.id === currentUser.vehicleId ?
                        {...v, lat: loc.lat, lng: loc.lng, lastUpdated: Date.now() } :
                        v
                    ));
                }
            },
            () => {}, { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
        );

        return () => {
            if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
        };
    }, [currentUser]);

    // ── TOAST ──────────────────────────────────────────────────────
    const showToast = (message, type = 'accent') => {
        setToast({ message, type, show: true });
        setTimeout(() => setToast({ message: '', type: '', show: false }), 3000);
    };

    // ── AUTH ───────────────────────────────────────────────────────
    const login = (email, password) => {
        const user = users[email];
        if (!user || user.pass !== password) {
            showToast('Credenciales incorrectas', 'danger');
            return false;
        }
        setCurrentUser({...user, email });
        showToast(`Bienvenido, ${user.name}`, 'accent');
        return true;
    };

    const logout = () => {
        setCurrentUser(null);
        setUserLocation(null);
        setActivePanel(null);
        setActiveSidePanel(null);
        showToast('Sesión cerrada', 'accent');
    };

    const register = (name, email, password, role) => {
        if (users[email]) {
            showToast('El correo ya está registrado', 'danger');
            return false;
        }
        const newUser = {
            pass: password,
            role,
            name,
            phone: '---',
            balance: 0,
            trips: 0,
            reports: 0
        };
        if (role === 'driver') {
            newUser.vehicleId = null;
            newUser.routeId = null;
            newUser.income = 0;
            newUser.passengers = 0;
        }
        setUsers(prev => ({...prev, [email]: newUser }));
        setCurrentUser({...newUser, email });
        showToast('Cuenta creada exitosamente', 'accent');
        return true;
    };

    // ── ADMIN: GESTIÓN DE RUTAS ────────────────────────────────────
    const addRoute = (routeData) => {
        const newRoute = {
            id: generateRouteId(routes),
            name: routeData.name,
            type: routeData.type,
            price: Number(routeData.price) || 25,
            stops: routeData.stops || [] // [{ name, lat, lng }]
        };
        setRoutes(prev => [...prev, newRoute]);
        showToast(`Ruta "${newRoute.name}" creada`, 'accent');
        return newRoute;
    };

    const updateRoute = (routeId, changes) => {
        setRoutes(prev => prev.map(r => r.id === routeId ? {...r, ...changes } : r));
        showToast('Ruta actualizada', 'accent');
    };

    const deleteRoute = (routeId) => {
        const hasVehicles = vehicles.some(v => v.routeId === routeId);
        if (hasVehicles) {
            showToast('Hay vehículos asignados a esta ruta', 'danger');
            return false;
        }
        setRoutes(prev => prev.filter(r => r.id !== routeId));
        showToast('Ruta eliminada', 'warn');
        return true;
    };

    // ── ADMIN: GESTIÓN DE VEHÍCULOS ────────────────────────────────
    const addVehicle = (vehicleData) => {
        const newId = generateVehicleId();
        const newVehicle = {
            id: newId,
            routeId: vehicleData.routeId || null,
            type: vehicleData.type || 'OMSA',
            occupancy: 'Vacio',
            lastUpdated: Date.now(),
            driverEmail: vehicleData.driverEmail || null,
            driver: vehicleData.driverName || 'Sin chofer',
            lat: null,
            lng: null,
            passengers: [],
            active: true
        };

        // Si se asigna un chofer, actualizar su perfil
        if (vehicleData.driverEmail && users[vehicleData.driverEmail]) {
            setUsers(prev => ({
                ...prev,
                [vehicleData.driverEmail]: {
                    ...prev[vehicleData.driverEmail],
                    vehicleId: newId,
                    routeId: vehicleData.routeId || null
                }
            }));
        }

        setVehicles(prev => [...prev, newVehicle]);
        showToast(`Vehículo ${newId} registrado`, 'accent');
        return newVehicle;
    };

    const updateVehicle = (vehicleId, changes) => {
        setVehicles(prev => prev.map(v =>
            v.id === vehicleId ? {...v, ...changes, lastUpdated: Date.now() } : v
        ));
    };

    const deleteVehicle = (vehicleId) => {
        setVehicles(prev => prev.filter(v => v.id !== vehicleId));
        showToast('Vehículo eliminado', 'warn');
    };

    // ── ADMIN: CREAR CUENTA CHOFER ─────────────────────────────────
    const createDriverAccount = (name, email, password, phone) => {
        if (users[email]) {
            showToast('El correo ya está registrado', 'danger');
            return false;
        }
        const newDriver = {
            pass: password,
            role: 'driver',
            name,
            phone: phone || '---',
            balance: 0,
            trips: 0,
            reports: 0,
            vehicleId: null,
            routeId: null,
            income: 0,
            passengers: 0
        };
        setUsers(prev => ({...prev, [email]: newDriver }));
        showToast(`Chofer ${name} creado`, 'accent');
        return true;
    };

    // ── OCUPACIÓN (chofer o pasajero a bordo) ──────────────────────
    const updateOccupancy = (vehicleId, level) => {
        setVehicles(prev => prev.map(v =>
            v.id === vehicleId ? {...v, occupancy: level, lastUpdated: Date.now() } : v
        ));
        if (currentUser && currentUser.role === 'driver' && currentUser.vehicleId === vehicleId) {
            setCurrentUser(prev => ({...prev, occupancy: level }));
            setUsers(prev => ({
                ...prev,
                [currentUser.email]: {...prev[currentUser.email], occupancy: level }
            }));
        }
        showToast(`Ocupación: ${level}`, 'accent');
    };

    // ── BOARDING: usuario se monta/baja ───────────────────────────
    const boardVehicle = (vehicleId) => {
        if (!currentUser) return false;
        const vehicle = vehicles.find(v => v.id === vehicleId);
        if (!vehicle) return false;

        const alreadyOnBoard = vehicle.passengers.includes(currentUser.email);
        if (alreadyOnBoard) {
            showToast('Ya estás a bordo de esta guagua', 'warn');
            return false;
        }

        setVehicles(prev => prev.map(v =>
            v.id === vehicleId ?
            {...v, passengers: [...v.passengers, currentUser.email], lastUpdated: Date.now() } :
            v
        ));
        setCurrentUser(prev => ({...prev, onBoard: vehicleId }));
        showToast('Te montaste en la guagua 🚌', 'accent');
        return true;
    };

    const alightVehicle = (vehicleId, occupancyLevel) => {
        if (!currentUser) return;
        setVehicles(prev => prev.map(v => {
            if (v.id !== vehicleId) return v;
            const updated = {...v, passengers: v.passengers.filter(e => e !== currentUser.email), lastUpdated: Date.now() };
            if (occupancyLevel) updated.occupancy = occupancyLevel;
            return updated;
        }));
        setCurrentUser(prev => ({...prev, onBoard: null }));
        showToast('Bajaste de la guagua', 'accent');
    };

    // ── ETA: tiempo estimado de llegada ───────────────────────────
    // Calcula distancia en km entre dos puntos lat/lng (Haversine)
    const haversine = (lat1, lng1, lat2, lng2) => {
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLng = (lng2 - lng1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    };

    // Devuelve ETA en minutos para un vehículo hacia una parada (lat, lng)
    // Velocidad promedio urbana RD: ~20 km/h
    const getETA = (vehicleId, targetLat, targetLng) => {
        const vehicle = vehicles.find(v => v.id === vehicleId);
        if (!vehicle || vehicle.lat == null || vehicle.lng == null) return null;
        const dist = haversine(vehicle.lat, vehicle.lng, targetLat, targetLng);
        const speedKmH = 20;
        return Math.round((dist / speedKmH) * 60);
    };

    // ETA hacia la ubicación actual del usuario
    const getETAToUser = (vehicleId) => {
        if (!userLocation) return null;
        return getETA(vehicleId, userLocation.lat, userLocation.lng);
    };

    // ── ZONAS DE PELIGRO ──────────────────────────────────────────
    const addDangerZone = (name, risk, lat, lng) => {
        if (!lat || !lng) {
            showToast('Se necesita una ubicación válida', 'danger');
            return false;
        }
        const newZone = {
            id: Date.now(),
            name: name || 'Zona peligrosa',
            risk: risk || 'Medio',
            incidents: 1,
            lat,
            lng,
            reportedBy: currentUser ? currentUser.email : 'anónimo',
            createdAt: Date.now()
        };
        setDangerZones(prev => [...prev, newZone]);
        showToast(`Zona marcada: ${newZone.name}`, 'warn');
        return newZone;
    };

    const updateDangerZone = (zoneId, changes) => {
        setDangerZones(prev => prev.map(z => z.id === zoneId ? {...z, ...changes } : z));
    };

    const deleteDangerZone = (zoneId) => {
        setDangerZones(prev => prev.filter(z => z.id !== zoneId));
        showToast('Zona eliminada', 'warn');
    };

    // ── REPORTES ──────────────────────────────────────────────────
    const addReport = (reportType, label, lat, lng) => {
        const newReport = {
            id: Date.now(),
            typeId: reportType,
            label,
            lat: lat || (userLocation ? userLocation.lat : null),
            lng: lng || (userLocation ? userLocation.lng : null),
            location: 'Tu ubicación',
            time: 'ahora mismo',
            user: currentUser ? currentUser.name : 'Anónimo',
            userEmail: currentUser ? currentUser.email : null,
            verified: false
        };
        setReports(prev => [newReport, ...prev]);
        if (currentUser) {
            const updated = {...currentUser, reports: (currentUser.reports || 0) + 1 };
            setCurrentUser(updated);
            setUsers(prev => ({...prev, [currentUser.email]: updated }));
        }
        showToast(`Reporte: ${label}`, 'warn');
        return newReport;
    };

    // ── PAGOS ─────────────────────────────────────────────────────
    const makePayment = (amount, type, driverName = 'General') => {
        const balance = currentUser ? currentUser.balance || 0 : 0;
        if (balance < amount) {
            showToast(`Saldo insuficiente. Faltan RD$${amount - balance}`, 'danger');
            return false;
        }
        if (currentUser) {
            const updated = {...currentUser, balance: balance - amount, trips: (currentUser.trips || 0) + 1 };
            setCurrentUser(updated);
            setUsers(prev => ({...prev, [currentUser.email]: updated }));
        }
        setTransactions(prev => [{
            id: Date.now(),
            user: currentUser ? currentUser.name : 'Usuario',
            userEmail: currentUser ? currentUser.email : 'unknown',
            type,
            amount,
            driver: driverName,
            time: 'ahora mismo'
        }, ...prev]);
        showToast(`Pago RD$${amount} (${type})`, 'accent');
        return true;
    };

    const rechargeBalance = (amount) => {
        if (amount < 1 || amount > 10000) {
            showToast('Monto no válido (RD$1 – RD$10,000)', 'danger');
            return false;
        }
        if (currentUser) {
            const updated = {...currentUser, balance: (currentUser.balance || 0) + amount };
            setCurrentUser(updated);
            setUsers(prev => ({...prev, [currentUser.email]: updated }));
            showToast(`Recarga exitosa: RD$${amount}`, 'accent');
        }
        return true;
    };

    // ── PANELS ────────────────────────────────────────────────────
    const openPanel = (panel) => setActivePanel(panel);
    const closePanel = () => setActivePanel(null);
    const openSidePanel = (panel) => setActiveSidePanel(panel);
    const closeSidePanel = () => setActiveSidePanel(null);
    const closeAllPanels = () => { setActivePanel(null);
        setActiveSidePanel(null); };

    return ( <
        AppContext.Provider value = {
            {
                // State
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
                // Map
                setMap,
                // Auth
                showToast,
                login,
                logout,
                register,
                // Admin - rutas
                addRoute,
                updateRoute,
                deleteRoute,
                // Admin - vehículos
                addVehicle,
                updateVehicle,
                deleteVehicle,
                createDriverAccount,
                // Ocupación & boarding
                updateOccupancy,
                boardVehicle,
                alightVehicle,
                // ETA
                getETA,
                getETAToUser,
                haversine,
                // Zonas peligro
                addDangerZone,
                updateDangerZone,
                deleteDangerZone,
                // Reportes & pagos
                addReport,
                makePayment,
                rechargeBalance,
                // Panels
                openPanel,
                closePanel,
                openSidePanel,
                closeSidePanel,
                closeAllPanels
            }
        } > { children } <
        /AppContext.Provider>
    );
};