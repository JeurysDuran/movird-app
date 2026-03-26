// src/components/Panels/PaymentPanel.js
import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import Card from '../Common/Card';

const PaymentPanel = () => {
    const { activePanel, closePanel, currentUser, rechargeBalance, makePayment, transactions } = useApp();
    const [rechargeAmount, setRechargeAmount] = useState('');
    const [showQRScan, setShowQRScan] = useState(false);
    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const intervalRef = useRef(null);
    const isOpen = activePanel === 'payment-panel';

    useEffect(() => {
        if (!isOpen && showQRScan) {
            stopQRScan();
        }
    }, [isOpen, showQRScan]);

    const quickRecharge = (amount) => setRechargeAmount(amount.toString());

    const handleRecharge = () => {
        const amount = parseFloat(rechargeAmount);
        if (!isNaN(amount) && amount > 0) {
            rechargeBalance(amount);
            setRechargeAmount('');
        } else {
            alert('Ingresa un monto válido');
        }
    };

    const quickPay = (price, type) => {
        makePayment(price, type);
    };

    const startQRScan = () => {
        setShowQRScan(true);

        // Verificar si el navegador soporta la cámara
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            alert('Tu navegador no soporta la cámara. Usando pago simulado.');
            setTimeout(() => {
                makePayment(35, 'QR Simulado', 'Chofer');
                stopQRScan();
            }, 1500);
            return;
        }

        navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
            .then(stream => {
                streamRef.current = stream;
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.setAttribute('playsinline', true);
                    videoRef.current.play().catch(e => console.log('Error playing video:', e));
                }

                // Iniciar el escaneo
                intervalRef.current = setInterval(() => {
                    if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
                        const canvas = document.createElement('canvas');
                        const videoWidth = videoRef.current.videoWidth;
                        const videoHeight = videoRef.current.videoHeight;

                        if (videoWidth === 0 || videoHeight === 0) return;

                        canvas.width = videoWidth;
                        canvas.height = videoHeight;
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
                        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

                        // Verificar que jsQR esté disponible (cargado desde el HTML)
                        if (typeof window.jsQR !== 'undefined') {
                            const code = window.jsQR(imageData.data, imageData.width, imageData.height);
                            if (code && code.data) {
                                try {
                                    const data = JSON.parse(code.data);
                                    if (data.v === 'MOVIRD-PAY') {
                                        const price = 35;
                                        const driverName = data.driver || 'Chofer';
                                        makePayment(price, `QR - ${driverName}`, driverName);
                                        stopQRScan();
                                    }
                                } catch (e) {
                                    console.log('QR no válido:', e);
                                }
                            }
                        } else {
                            console.log('jsQR no está disponible, simulando...');
                        }
                    }
                }, 500);
            })
            .catch(err => {
                console.error('Error accediendo a la cámara:', err);
                alert('No se pudo acceder a la cámara. Usando pago simulado.');
                setTimeout(() => {
                    makePayment(35, 'QR Simulado', 'Chofer');
                    stopQRScan();
                }, 1500);
            });
    };

    const stopQRScan = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        setShowQRScan(false);
    };

    // Obtener transacciones del usuario actual
    const userTransactions = currentUser && currentUser.email ?
        transactions.filter(t => t.userEmail === currentUser.email).slice(0, 6) :
        [];

    const paymentOptions = [
        { name: 'OMSA', price: 35, tag: 'tag-omsa' },
        { name: 'Concho', price: 25, tag: 'tag-concho' },
        { name: 'Metro', price: 20, tag: 'tag-metro' },
        { name: 'Teleférico', price: 15, tag: 'tag-teleferico' },
        { name: 'Motoconcho', price: 30, tag: 'tag-moto' }
    ];

    return ( <
        >
        <
        div className = { `panel glass ${isOpen ? 'open' : ''}` }
        id = "payment-panel" >
        <
        div className = "panel-handle" > < /div> <
        div className = "panel-header" >
        <
        div className = "panel-title" > Pagos digitales < /div> <
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
        /div> <
        div className = "panel-body" >
        <
        div className = "balance-big" >
        <
        div className = "amount" > RD$ {
            (currentUser && currentUser.balance || 0).toLocaleString() } < /div> <
        div className = "label" > Saldo disponible < /div> <
        /div>

        <
        Card title = "Recargar saldo" >
        <
        div className = "grid-2 mb-12" > {
            [50, 100, 200, 500].map(a => ( <
                button key = { a }
                className = "btn btn-ghost"
                onClick = {
                    () => quickRecharge(a) } > RD$ { a } < /button>
            ))
        } <
        /div> <
        div className = "flex gap-8" >
        <
        input className = "input-field"
        type = "number"
        placeholder = "Otro monto..."
        value = { rechargeAmount }
        onChange = {
            (e) => setRechargeAmount(e.target.value) }
        style = {
            { flex: 2 } }
        /> <
        button className = "btn btn-accent"
        onClick = { handleRecharge }
        style = {
            { flex: 1 } } > Recargar < /button> <
        /div> <
        /Card>

        <
        Card title = "Pagar con QR" >
        <
        div className = "text-sm text-muted mb-12" >
        Escanea el QR del chofer para pagar tu pasaje directamente. <
        /div> <
        button className = "btn btn-blue btn-block"
        onClick = { startQRScan } >
        <
        svg viewBox = "0 0 24 24"
        fill = "none"
        stroke = "currentColor"
        strokeWidth = "2"
        style = {
            { width: '16px', height: '16px' } } >
        <
        rect x = "3"
        y = "3"
        width = "5"
        height = "5" / >
        <
        rect x = "16"
        y = "3"
        width = "5"
        height = "5" / >
        <
        rect x = "3"
        y = "16"
        width = "5"
        height = "5" / >
        <
        path d = "M21 16h-3v3M21 21v.01M16 16v.01M21 10V6" / >
        <
        /svg>
        Escanear QR del chofer <
        /button> <
        /Card>

        <
        Card title = "Pago rápido" >
        <
        div className = "grid-2" > {
            paymentOptions.map(opt => ( <
                button key = { opt.name }
                className = "btn btn-ghost"
                onClick = {
                    () => quickPay(opt.price, opt.name) }
                style = {
                    { flexDirection: 'column', padding: '13px', height: 'auto', gap: '5px' } } >
                <
                span className = { `transport-tag ${opt.tag}` } > { opt.name } < /span> <
                span className = "text-sm font-bold"
                style = {
                    { marginTop: '3px' } } > RD$ { opt.price } < /span> <
                /button>
            ))
        } <
        /div> <
        /Card>

        <
        Card title = "Historial de viajes" > {
            userTransactions.length === 0 ? ( <
                div className = "text-sm text-muted"
                style = {
                    { textAlign: 'center', padding: '14px' } } > Sin historial aún < /div>
            ) : (
                userTransactions.map(t => ( <
                    div key = { t.id }
                    className = "list-item" >
                    <
                    div style = {
                        { flex: 1 } } >
                    <
                    div className = "text-sm font-bold" > { t.type } < /div> <
                    div className = "text-xs text-muted" > { t.driver }· { t.time } < /div> <
                    /div> <
                    span className = "text-sm font-bold text-danger" > -RD$ { t.amount } < /span> <
                    /div>
                ))
            )
        } <
        /Card> <
        /div> <
        /div>

        { /* QR Scan Modal */ } {
            showQRScan && ( <
                div id = "qr-scan-modal"
                style = {
                    { display: 'flex', position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0, 0, 0, .92)', alignItems: 'center', justifyContent: 'center' } } >
                <
                div className = "glass"
                style = {
                    { width: '90%', maxWidth: '340px', borderRadius: '22px', padding: '22px', textAlign: 'center' } } >
                <
                div style = {
                    { fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: '700', marginBottom: '14px' } } > Escanear QR de pago < /div> <
                div className = "scan-area"
                style = {
                    { position: 'relative', width: '100%', aspectRatio: '1', maxWidth: '260px', margin: '0 auto', borderRadius: '16px', overflow: 'hidden', background: '#000' } } >
                <
                video ref = { videoRef }
                autoPlay playsInline muted style = {
                    { width: '100%', height: '100%', objectFit: 'cover' } }
                /> <
                div className = "scan-corners"
                style = {
                    { position: 'absolute', inset: 0, pointerEvents: 'none' } } >
                <
                svg width = "100%"
                height = "100%"
                viewBox = "0 0 100 100"
                fill = "none" >
                <
                path d = "M10,10 L10,25 M10,10 L25,10"
                stroke = "var(--accent)"
                strokeWidth = "3"
                strokeLinecap = "round" / >
                <
                path d = "M90,10 L75,10 M90,10 L90,25"
                stroke = "var(--accent)"
                strokeWidth = "3"
                strokeLinecap = "round" / >
                <
                path d = "M10,90 L10,75 M10,90 L25,90"
                stroke = "var(--accent)"
                strokeWidth = "3"
                strokeLinecap = "round" / >
                <
                path d = "M90,90 L75,90 M90,90 L90,75"
                stroke = "var(--accent)"
                strokeWidth = "3"
                strokeLinecap = "round" / >
                <
                /svg> <
                div className = "scan-line"
                style = {
                    { position: 'absolute', left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, transparent, var(--accent), transparent)', animation: 'sanim 2s linear infinite' } } > < /div> <
                /div> <
                /div> <
                div className = "text-sm text-muted mt-12" > Apunta al código QR del chofer < /div> <
                button className = "btn btn-ghost btn-block mt-12"
                onClick = { stopQRScan } > Cancelar < /button> <
                /div> <
                /div>
            )
        } <
        />
    );
};

export default PaymentPanel;