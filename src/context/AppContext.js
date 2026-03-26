import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import {
    DEMO_ACCOUNTS,
    INITIAL_ROUTES,
    INITIAL_VEHICLES,
    generateVehicleId,
    generateRouteId
} from '../data/mockData';

import { collection, addDoc, onSnapshot, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

const AppContext = createContext();
export const useApp = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [users, setUsers] = useState(DEMO_ACCOUNTS);
    const [routes, setRoutes] = useState(INITIAL_ROUTES);
    const [vehicles, setVehicles] = useState(INITIAL_VEHICLES);
    const [dangerZones, setDangerZones] = useState([]); // ← Ahora viene de Firebase
    const [reports, setReports] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [activePanel, setActivePanel] = useState(null);
    const [activeSidePanel, setActiveSidePanel] = useState(null);
    const [toast, setToast] = useState({ message: '', type: '', show: false });
    const [loading, setLoading] = useState(true);
    const [map, setMap] = useState(null);
    const [userLocation, setUserLocation] = useState(null);
    const watchIdRef = useRef(null);

    // ───────── CARGA INICIAL ─────────
    useEffect(() => {
        setTimeout(() => setLoading(false), 1800);
    }, []);

    // ───────── FIREBASE: CARGAR ZONAS EN TIEMPO REAL ─────────
    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, "dangerZones"), (snapshot) => {
            const zones = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setDangerZones(zones);
        });

        return () => unsubscribe();
    }, []);

    // ───────── GPS TRACKING ─────────
    useEffect(() => {
        if (!currentUser) return;
        if (!navigator.geolocation) return;

        watchIdRef.current = navigator.geolocation.watchPosition(
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
            () => {}, { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
        );

        return () => {
            if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
        };
    }, [currentUser]);

    // ───────── TOAST ─────────
    const showToast = (message, type = 'accent') => {
        setToast({ message, type, show: true });
        setTimeout(() => setToast({ message: '', type: '', show: false }), 3000);
    };

    // ───────── AUTH ─────────
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
        setUsers(prev => ({...prev, [email]: newUser }));
        setCurrentUser({...newUser, email });
        showToast('Cuenta creada exitosamente', 'accent');
        return true;
    };

    // ───────── RUTAS ─────────
    const addRoute = (routeData) => {
        const newRoute = {
            id: generateRouteId(routes),
            name: routeData.name,
            type: routeData.type,
            price: Number(routeData.price) || 25,
            stops: routeData.stops || []
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
        setRoutes(prev => prev.filter(r => r.id !== routeId));
        showToast('Ruta eliminada', 'warn');
    };

    // ───────── VEHÍCULOS ─────────
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

    // ───────── ZONAS DE PELIGRO (FIREBASE) ─────────
    const addDangerZone = async(name, risk, lat, lng) => {
        if (!lat || !lng) {
            showToast('Se necesita una ubicación válida', 'danger');
            return false;
        }

        const newZone = {
            name: name || 'Zona peligrosa',
            risk: risk || 'Medio',
            incidents: 1,
            lat,
            lng,
            reportedBy: currentUser ? currentUser.email : 'anonimo',
            createdAt: Date.now()
        };

        try {
            await addDoc(collection(db, "dangerZones"), newZone);
            showToast(`Zona marcada: ${newZone.name}`, 'warn');
        } catch (error) {
            console.error(error);
            showToast('Error guardando zona', 'danger');
        }
    };

    const updateDangerZone = async(zoneId, changes) => {
        try {
            await updateDoc(doc(db, "dangerZones", zoneId), changes);
            showToast('Zona actualizada', 'accent');
        } catch (error) {
            console.error(error);
            showToast('Error actualizando zona', 'danger');
        }
    };

    const deleteDangerZone = async(zoneId) => {
        try {
            await deleteDoc(doc(db, "dangerZones", zoneId));
            showToast('Zona eliminada', 'warn');
        } catch (error) {
            console.error(error);
            showToast('Error eliminando zona', 'danger');
        }
    };

    // ───────── PANELS ─────────
    const openPanel = (panel) => setActivePanel(panel);
    const closePanel = () => setActivePanel(null);
    const openSidePanel = (panel) => setActiveSidePanel(panel);
    const closeSidePanel = () => setActiveSidePanel(null);
    const closeAllPanels = () => {
        setActivePanel(null);
        setActiveSidePanel(null);
    };

    return ( <
        AppContext.Provider value = {
            {
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

                setMap,

                showToast,
                login,
                logout,
                register,

                addRoute,
                updateRoute,
                deleteRoute,

                addVehicle,
                updateVehicle,
                deleteVehicle,

                addDangerZone,
                updateDangerZone,
                deleteDangerZone,

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