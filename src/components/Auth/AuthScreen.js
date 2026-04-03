// src/components/Auth/AuthScreen.js
import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { SINDICATOS } from '../../data/mockData';

/* ── íconos ───────────────────────────────────────────────────── */
const EyeIcon = ({ open }) => open ? ( <
    svg width = "17"
    height = "17"
    viewBox = "0 0 24 24"
    fill = "none"
    stroke = "currentColor"
    strokeWidth = "2" >
    <
    path d = "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" / > < circle cx = "12"
    cy = "12"
    r = "3" / >
    <
    /svg>
) : ( <
    svg width = "17"
    height = "17"
    viewBox = "0 0 24 24"
    fill = "none"
    stroke = "currentColor"
    strokeWidth = "2" >
    <
    path d = "M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" / >
    <
    path d = "M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" / >
    <
    line x1 = "1"
    y1 = "1"
    x2 = "23"
    y2 = "23" / >
    <
    /svg>
);

/* ── constantes ───────────────────────────────────────────────── */
// Tres modos de acceso — cada uno es una pantalla distinta
const MODES = {
    SELECT: 'select', // pantalla inicial: elige tipo de acceso
    USER: 'user', // pasajero: login / registro
    COMPANY: 'company', // admin de compañía: seleccionar sindicato + login/registro
    DRIVER: 'driver', // chofer: usuario + contraseña
};

/* ════════════════════════════════════════════════════════════════
   Componente principal
═══════════════════════════════════════════════════════════════════ */
export default function AuthScreen() {
    const [mode, setMode] = useState(MODES.SELECT);

    return ( <
            div style = { styles.wrap } > { /* Fondo decorativo */ } <
            div style = { styles.bgBlob1 }
            /> <
            div style = { styles.bgBlob2 }
            />

            {
                mode === MODES.SELECT && < SelectScreen onSelect = { setMode }
                />} {
                    mode === MODES.USER && < UserScreen onBack = {
                        () => setMode(MODES.SELECT) }
                    />} {
                        mode === MODES.COMPANY && < CompanyScreen onBack = {
                            () => setMode(MODES.SELECT) }
                        />} {
                            mode === MODES.DRIVER && < DriverScreen onBack = {
                                () => setMode(MODES.SELECT) }
                            />} <
                            /div>
                        );
                    }

                    /* ════════════════════════════════════════════════════════════════
                       Pantalla 1 — Selección de tipo de acceso
                    ═══════════════════════════════════════════════════════════════════ */
                    function SelectScreen({ onSelect }) {
                        const tiles = [{
                                mode: MODES.USER,
                                icon: <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="7" r="4"/><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/></svg>,
                                label: 'Soy pasajero',
                                desc: 'Ver rutas, pagar y seguir guaguas en tiempo real',
                                color: '#9b6dff',
                            },
                            {
                                mode: MODES.COMPANY,
                                icon: <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><path d="M9 22v-4h6v4M8 6h.01M16 6h.01M12 6h.01M12 10h.01M16 10h.01M8 10h.01M8 14h.01M12 14h.01M16 14h.01" strokeLinecap="round" strokeLinejoin="round"/></svg>,
                                label: 'Soy compañía',
                                desc: 'Gestionar rutas, choferes y flota de tu sindicato',
                                color: 'var(--accent)',
                            },
                            {
                                mode: MODES.DRIVER,
                                icon: <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 14h16M4 14v4a2 2 0 0 0 2 2h1v2a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-2h2v2a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-2h1a2 2 0 0 0 2-2v-4M4 14V6a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v8M8 10h8M6 18h.01M18 18h.01" strokeLinecap="round"/></svg>,
                                label: 'Soy chofer',
                                desc: 'Ver tu ruta y los pasajeros esperando',
                                color: '#2a7fff',
                            },
                        ];

                        return ( <
                            div style = { styles.card } >
                            <
                            Logo / >
                            <
                            h2 style = { styles.title } > ¿Cómo quieres entrar ? < /h2> <
                            p style = {
                                {...styles.sub, marginBottom: 28 } } > Selecciona tu tipo de acceso < /p>

                            <
                            div style = {
                                { display: 'flex', flexDirection: 'column', gap: 12 } } > {
                                tiles.map(t => ( <
                                    button key = { t.mode }
                                    onClick = {
                                        () => onSelect(t.mode) }
                                    style = {
                                        {
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 16,
                                            padding: '16px 18px',
                                            borderRadius: 14,
                                            border: `1.5px solid rgba(255,255,255,.1)`,
                                            background: 'var(--surface)',
                                            cursor: 'pointer',
                                            textAlign: 'left',
                                            transition: 'all .2s',
                                            fontFamily: "'DM Sans', sans-serif",
                                        }
                                    }
                                    onMouseEnter = { e => { e.currentTarget.style.borderColor = t.color;
                                            e.currentTarget.style.background = t.color + '18'; } }
                                    onMouseLeave = { e => { e.currentTarget.style.borderColor = 'var(--border)';
                                            e.currentTarget.style.background = 'var(--surface)'; } } >
                                    <
                                    span style = {
                                        {
                                            fontSize: 28,
                                            width: 48,
                                            height: 48,
                                            borderRadius: 13,
                                            background: t.color + '22',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexShrink: 0
                                        }
                                    } > {t.icon} < /span> <
                                    div >
                                    <
                                    div style = {
                                        { fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 3 } } > { t.label } < /div> <
                                    div style = {
                                        { fontSize: 12, color: 'var(--text2)', lineHeight: 1.4 } } > { t.desc } < /div> <
                                    /div> <
                                    span style = {
                                        { marginLeft: 'auto', color: 'var(--text2)', fontSize: 18 } } > › < /span> <
                                    /button>
                                ))
                            } <
                            /div> <
                            /div>
                        );
                    }

                    /* ════════════════════════════════════════════════════════════════
                       Pantalla 2 — Pasajero (login / registro)
                    ═══════════════════════════════════════════════════════════════════ */
                    function UserScreen({ onBack }) {
                        const { login, registerUser } = useApp();
                        const [tab, setTab] = useState('login');
                        const [form, setForm] = useState({ name: '', email: '', pass: '', confirm: '' });
                        const [showPass, setShowPass] = useState(false);
                        const [errors, setErrors] = useState({});
                        const [busy, setBusy] = useState(false);

                        const set = f => e => { setForm(p => ({...p, [f]: e.target.value }));
                            setErrors(p => ({...p, [f]: '' })); };

                        const validate = () => {
                            const e = {};
                            if (tab === 'register' && !form.name.trim()) e.name = 'Nombre requerido';
                            if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Correo inválido';
                            if (!form.pass) e.pass = 'Contraseña requerida';
                            else if (tab === 'register' && form.pass.length < 6) e.pass = 'Mínimo 6 caracteres';
                            if (tab === 'register' && form.pass !== form.confirm) e.confirm = 'No coinciden';
                            setErrors(e);
                            return !Object.keys(e).length;
                        };

                        const submit = async() => {
                            if (!validate()) return;
                            setBusy(true);
                            await delay(500);
                            const ok = tab === 'login' ?
                                login(form.email, form.pass) :
                                registerUser(form.name, form.email, form.pass);
                            if (!ok) setErrors({ pass: tab === 'login' ? 'Correo o contraseña incorrectos' : 'Correo ya registrado' });
                            setBusy(false);
                        };

                        return ( <
                            div style = { styles.card } >
                            <
                            BackBtn onClick = { onBack }
                            /> <
                            Logo small / >
                            <
                            div style = {
                                { display: 'flex', gap: 6, marginBottom: 24, background: 'var(--surface2)', borderRadius: 10, padding: 4 } } > {
                                ['login', 'register'].map(t => ( <
                                    button key = { t }
                                    onClick = {
                                        () => { setTab(t);
                                            setErrors({}); } }
                                    style = {
                                        {
                                            flex: 1,
                                            padding: '9px 0',
                                            borderRadius: 7,
                                            border: 'none',
                                            background: tab === t ? 'var(--accent)' : 'transparent',
                                            color: tab === t ? '#ffffff' : 'var(--text2)',
                                            fontFamily: "'DM Sans', sans-serif",
                                            fontSize: 13,
                                            fontWeight: 700,
                                            cursor: 'pointer',
                                            transition: 'all .2s'
                                        }
                                    } > { t === 'login' ? 'Iniciar sesión' : 'Registrarse' } < /button>
                                ))
                            } <
                            /div>

                            { tab === 'register' && < Field label = "Nombre"
                                error = { errors.name } > < Input placeholder = "Tu nombre"
                                value = { form.name }
                                onChange = {set('name') }
                                /></Field > } <
                            Field label = "Correo"
                            error = { errors.email } > < Input type = "email"
                            placeholder = "tu@correo.com"
                            value = { form.email }
                            onChange = {set('email') }
                            /></Field >
                            <
                            Field label = "Contraseña"
                            error = { errors.pass } >
                            <
                            PasswordInput value = { form.pass }
                            onChange = {set('pass') }
                            show = { showPass }
                            onToggle = {
                                () => setShowPass(s => !s) }
                            placeholder = { tab === 'register' ? 'Mínimo 6 caracteres' : '••••••••' }
                            /> <
                            /Field> { tab === 'register' && < Field label = "Confirmar contraseña"
                                error = { errors.confirm } > < Input type = "password"
                                placeholder = "Repite"
                                value = { form.confirm }
                                onChange = {set('confirm') }
                                onKeyDown = { e => e.key === 'Enter' && submit() }
                                /></Field > }

                            <
                            SubmitBtn busy = { busy }
                            label = { tab === 'login' ? 'Entrar' : 'Crear cuenta' }
                            onClick = { submit }
                            /> <
                            /div>
                        );
                    }

                    /* ════════════════════════════════════════════════════════════════
                       Pantalla 3 — Compañía / Sindicato
                    ═══════════════════════════════════════════════════════════════════ */
                    function CompanyScreen({ onBack }) {
                        const { login, registerCompanyAdmin, showToast } = useApp();

                        const [step, setStep] = useState('pick'); // 'pick' | 'auth'
                        const [sindicato, setSindicato] = useState(null);
                        const [query, setQuery] = useState('');
                        const [tab, setTab] = useState('login');
                        const [form, setForm] = useState({ name: '', email: '', pass: '', confirm: '' });
                        const [showPass, setShowPass] = useState(false);
                        const [errors, setErrors] = useState({});
                        const [busy, setBusy] = useState(false);

                        const filtered = useMemo(() => {
                            if (!query.trim()) return SINDICATOS;
                            const q = query.toLowerCase();
                            return SINDICATOS.filter(s =>
                                s.name.toLowerCase().includes(q) || s.fullName.toLowerCase().includes(q)
                            );
                        }, [query]);

                        const pickSindicato = (s) => { setSindicato(s);
                            setStep('auth');
                            setQuery('');
                            setErrors({}); };

                        const set = f => e => { setForm(p => ({...p, [f]: e.target.value }));
                            setErrors(p => ({...p, [f]: '' })); };

                        const validate = () => {
                            const e = {};
                            if (tab === 'register' && !form.name.trim()) e.name = 'Nombre requerido';
                            if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Correo inválido';
                            if (!form.pass) e.pass = 'Contraseña requerida';
                            else if (tab === 'register' && form.pass.length < 6) e.pass = 'Mínimo 6 caracteres';
                            if (tab === 'register' && form.pass !== form.confirm) e.confirm = 'No coinciden';
                            setErrors(e);
                            return !Object.keys(e).length;
                        };

                        const submit = async() => {
                            if (!validate()) return;
                            setBusy(true);
                            await delay(500);
                            let ok;
                            if (tab === 'login') {
                                ok = login(form.email, form.pass);
                                // Verificar que el usuario es admin de este sindicato
                                // (lo verifica el contexto al cargar)
                            } else {
                                ok = registerCompanyAdmin(form.name, form.email, form.pass, sindicato.id);
                            }
                            if (!ok) setErrors({ pass: 'Credenciales incorrectas o correo ya registrado' });
                            setBusy(false);
                        };

                        if (step === 'pick') return ( <
                            div style = { styles.card } >
                            <
                            BackBtn onClick = { onBack }
                            /> <
                            Logo small / >
                            <
                            h2 style = { styles.title } > ¿Cuál es tu compañía ? < /h2> <
                            p style = {
                                {...styles.sub, marginBottom: 16 } } > Busca tu sindicato de transporte < /p>

                            <
                            div style = {
                                { position: 'relative', marginBottom: 12 } } >
                            <
                            span style = {
                                { position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 14 } } ><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="var(--text2)" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></span> <
                            input style = {
                                {...styles.input(), paddingLeft: 36, marginBottom: 0 } }
                            placeholder = "Escribe el nombre del sindicato..."
                            value = { query }
                            onChange = { e => setQuery(e.target.value) }
                            autoFocus /
                            >
                            <
                            /div>

                            <
                            div style = {
                                { maxHeight: 340, overflowY: 'auto' } } > {
                                filtered.length === 0 && ( <
                                    p style = {
                                        { color: 'var(--text2)', fontSize: 13, textAlign: 'center', padding: '20px 0' } } > Sin resultados < /p>
                                )
                            } {
                                filtered.map(s => ( <
                                    button key = { s.id }
                                    onClick = {
                                        () => pickSindicato(s) }
                                    style = {
                                        {
                                            width: '100%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 13,
                                            padding: '12px 14px',
                                            borderRadius: 12,
                                            marginBottom: 8,
                                            border: '1.5px solid rgba(255,255,255,.08)',
                                            background: 'var(--surface)',
                                            cursor: 'pointer',
                                            textAlign: 'left',
                                            fontFamily: "'DM Sans', sans-serif",
                                            transition: 'all .15s'
                                        }
                                    }
                                    onMouseEnter = { e => { e.currentTarget.style.borderColor = s.color;
                                            e.currentTarget.style.background = s.color + '18'; } }
                                    onMouseLeave = { e => { e.currentTarget.style.borderColor = 'var(--border)';
                                            e.currentTarget.style.background = 'var(--surface)'; } } >
                                    <
                                    span style = {
                                        {
                                            fontSize: 22,
                                            width: 42,
                                            height: 42,
                                            borderRadius: 10,
                                            background: s.color + '22',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexShrink: 0
                                        }
                                    } > { s.logo } < /span> <
                                    div style = {
                                        { flex: 1, minWidth: 0 } } >
                                    <
                                    div style = {
                                        { fontSize: 14, fontWeight: 700, color: 'var(--text)' } } > { s.name } < /div> <
                                    div style = {
                                        { fontSize: 11, color: 'var(--text2)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } } > { s.fullName } < /div> <
                                    /div> <
                                    span style = {
                                        { fontSize: 10, padding: '2px 8px', borderRadius: 100, background: s.color + '22', color: s.color, fontWeight: 700, flexShrink: 0 } } > { s.type } < /span> <
                                    /button>
                                ))
                            } <
                            /div> <
                            /div>
                        );

                        // Paso 2: login / registro del admin
                        return ( <
                            div style = { styles.card } >
                            <
                            BackBtn onClick = {
                                () => setStep('pick') }
                            />

                            { /* Header del sindicato seleccionado */ } <
                            div style = {
                                { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22, padding: '12px 14px', borderRadius: 12, background: sindicato.color + '15', border: `1.5px solid ${sindicato.color}40` } } >
                            <
                            span style = {
                                { fontSize: 26 } } > { sindicato.logo } < /span> <
                            div >
                            <
                            div style = {
                                { fontWeight: 800, fontSize: 15, color: 'var(--text)' } } > { sindicato.name } < /div> <
                            div style = {
                                { fontSize: 11, color: 'var(--text2)' } } > { sindicato.fullName } < /div> <
                            /div> <
                            /div>

                            <
                            div style = {
                                { display: 'flex', gap: 6, marginBottom: 20, background: 'var(--surface2)', borderRadius: 10, padding: 4 } } > {
                                ['login', 'register'].map(t => ( <
                                    button key = { t }
                                    onClick = {
                                        () => { setTab(t);
                                            setErrors({}); } }
                                    style = {
                                        {
                                            flex: 1,
                                            padding: '9px 0',
                                            borderRadius: 7,
                                            border: 'none',
                                            background: tab === t ? sindicato.color : 'transparent',
                                            color: tab === t ? '#ffffff' : 'var(--text2)',
                                            fontFamily: "'DM Sans', sans-serif",
                                            fontSize: 13,
                                            fontWeight: 700,
                                            cursor: 'pointer',
                                            transition: 'all .2s'
                                        }
                                    } > { t === 'login' ? 'Iniciar sesión' : 'Registrar cuenta' } < /button>
                                ))
                            } <
                            /div>

                            { tab === 'register' && < Field label = "Nombre del administrador"
                                error = { errors.name } > < Input placeholder = "Tu nombre completo"
                                value = { form.name }
                                onChange = {set('name') }
                                /></Field > } <
                            Field label = "Correo corporativo"
                            error = { errors.email } > < Input type = "email"
                            placeholder = "admin@empresa.com"
                            value = { form.email }
                            onChange = {set('email') }
                            /></Field >
                            <
                            Field label = "Contraseña"
                            error = { errors.pass } >
                            <
                            PasswordInput value = { form.pass }
                            onChange = {set('pass') }
                            show = { showPass }
                            onToggle = {
                                () => setShowPass(s => !s) }
                            placeholder = { tab === 'register' ? 'Mínimo 6 caracteres' : '••••••••' }
                            /> <
                            /Field> { tab === 'register' && < Field label = "Confirmar contraseña"
                                error = { errors.confirm } > < Input type = "password"
                                placeholder = "Repite"
                                value = { form.confirm }
                                onChange = {set('confirm') }
                                /></Field > }

                            <
                            SubmitBtn busy = { busy }
                            label = { tab === 'login' ? 'Entrar' : 'Crear cuenta' }
                            color = { sindicato.color }
                            onClick = { submit }
                            /> <
                            /div>
                        );
                    }

                    /* ════════════════════════════════════════════════════════════════
                       Pantalla 4 — Chofer (usuario + contraseña, sin email)
                    ═══════════════════════════════════════════════════════════════════ */
                    function DriverScreen({ onBack }) {
                        const { loginDriver } = useApp();
                        const [form, setForm] = useState({ username: '', pass: '' });
                        const [errors, setErrors] = useState({});
                        const [showPass, setShowPass] = useState(false);
                        const [busy, setBusy] = useState(false);

                        const set = f => e => { setForm(p => ({...p, [f]: e.target.value }));
                            setErrors(p => ({...p, [f]: '' })); };

                        const submit = async() => {
                            const e = {};
                            if (!form.username.trim()) e.username = 'Usuario requerido';
                            if (!form.pass) e.pass = 'Contraseña requerida';
                            if (Object.keys(e).length) { setErrors(e); return; }
                            setBusy(true);
                            await delay(500);
                            const ok = loginDriver(form.username, form.pass);
                            if (!ok) setErrors({ pass: 'Usuario o contraseña incorrectos' });
                            setBusy(false);
                        };

                        return ( <
                            div style = { styles.card } >
                            <
                            BackBtn onClick = { onBack }
                            /> <
                            div style = {
                                { textAlign: 'center', marginBottom: 24 } } >
                            <
                            span style = {
                                { fontSize: 42 } } ><svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="var(--blue)" strokeWidth="2"><path d="M4 14h16M4 14v4a2 2 0 0 0 2 2h1v2a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-2h2v2a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-2h1a2 2 0 0 0 2-2v-4M4 14V6a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v8M8 10h8M6 18h.01M18 18h.01" strokeLinecap="round"/></svg></span> <
                            h2 style = {
                                {...styles.title, marginTop: 8 } } > Acceso Chofer < /h2> <
                            p style = { styles.sub } > Usa el usuario y contraseña que te dio tu compañía < /p> <
                            /div>

                            <
                            Field label = "Usuario"
                            error = { errors.username } >
                            <
                            Input placeholder = "Ej: pedro.chofer"
                            value = { form.username }
                            onChange = {set('username') }
                            /> <
                            /Field> <
                            Field label = "Contraseña"
                            error = { errors.pass } >
                            <
                            PasswordInput value = { form.pass }
                            onChange = {set('pass') }
                            show = { showPass }
                            onToggle = {
                                () => setShowPass(s => !s) }
                            placeholder = "••••••••"
                            onKeyDown = { e => e.key === 'Enter' && submit() }
                            /> <
                            /Field>

                            <
                            SubmitBtn busy = { busy }
                            label = "Entrar"
                            color = "#2a7fff"
                            onClick = { submit }
                            />

                            <
                            p style = {
                                { textAlign: 'center', fontSize: 12, color: 'var(--text2)', marginTop: 16 } } >
                            Si no tienes usuario, contacta al administrador de tu compañía. <
                            /p> <
                            /div>
                        );
                    }

                    /* ════════════════════════════════════════════════════════════════
                       Sub-componentes reutilizables
                    ═══════════════════════════════════════════════════════════════════ */
                    function Logo({ small }) {
                        return ( <
                            div style = {
                                { display: 'flex', alignItems: 'center', gap: 10, marginBottom: small ? 22 : 28 } } >
                            <
                            div style={{ width: small ? 38 : 46, height: small ? 38 : 46, background: 'linear-gradient(135deg,var(--blue),var(--accent))', borderRadius: small ? 11 : 13, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}> <svg viewBox="0 0 24 24" width={small ? 20 : 26} height={small ? 20 : 26} fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 14h16M4 14v4a2 2 0 0 0 2 2h1v2a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-2h2v2a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-2h1a2 2 0 0 0 2-2v-4M4 14V6a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v8M8 10h8A1 1 0 0 1 8 10zM6 18h.01M18 18h.01" strokeLinecap="round"/></svg> </div> <
                            div style = {
                                { fontFamily: "'Syne',sans-serif", fontSize: small ? 18 : 22, fontWeight: 800, letterSpacing: -.5, color: 'var(--text)' } } >
                            Movi <span style={{ color: 'var(--accent)' }} > RD < /span> <
                            /div> <
                            /div>
                        );
                    }

                    function BackBtn({ onClick }) {
                        return ( <
                            button onClick = { onClick }
                            style = {
                                { background: 'none', border: 'none', color: 'var(--text2)', cursor: 'pointer', fontSize: 13, padding: '0 0 16px 0', fontFamily: "'DM Sans',sans-serif", display: 'flex', alignItems: 'center', gap: 5 } } > ‹Volver <
                            /button>
                        );
                    }

                    function Field({ label, error, children }) {
                        return ( <
                            div style = {
                                { marginBottom: 14 } } >
                            <
                            label style = {
                                { display: 'block', fontSize: 11, fontWeight: 600, color: error ? 'var(--danger)' : 'var(--text2)', marginBottom: 6, letterSpacing: .4, textTransform: 'uppercase' } } > { label } < /label> { children } {
                                error && < p style = {
                                        { fontSize: 11, color: 'var(--danger)', marginTop: 4 } } > ⚠{ error } < /p>} <
                                    /div>
                            );
                        }

                        function Input({ type = 'text', ...props }) {
                            return <input type = { type }
                            style = { styles.input() } {...props }
                            />;
                        }

                        function PasswordInput({ value, onChange, show, onToggle, placeholder, onKeyDown }) {
                            return ( <
                                div style = {
                                    { position: 'relative' } } >
                                <
                                input type = { show ? 'text' : 'password' }
                                value = { value }
                                onChange = { onChange }
                                placeholder = { placeholder }
                                onKeyDown = { onKeyDown }
                                style = {
                                    {...styles.input(), paddingRight: 44 } }
                                /> <
                                button onClick = { onToggle }
                                style = {
                                    { position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text2)', display: 'flex', alignItems: 'center' } } >
                                <
                                EyeIcon open = { show }
                                /> <
                                /button> <
                                /div>
                            );
                        }

                        function SubmitBtn({ busy, label, onClick, color = 'var(--accent)' }) {
                            const isDark = color === 'var(--accent)' || color === '#ff9a3c' || color === '#e9c46a';
                            const bg = color.startsWith('var') ? color : `linear-gradient(135deg,${color},${color}cc)`;
                            return ( <
                                button onClick = { onClick }
                                disabled = { busy }
                                style = {
                                    { width: '100%', padding: '13px 0', marginTop: 6, background: busy ? 'rgba(0,0,0,0.2)' : bg, border: 'none', borderRadius: 10, color: isDark ? '#ffffff' : '#fff', fontFamily: "'Syne',sans-serif", fontSize: 15, fontWeight: 700, cursor: busy ? 'not-allowed' : 'pointer', transition: 'all .2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 } } > {
                                    busy ? < > < Spinner / > { label }... < /> : `→ ${label}`} <
                                    /button>
                                );
                            }

                            function Spinner() {
                                return <span style = {
                                    { width: 15, height: 15, border: '2px solid rgba(0,0,0,.2)', borderTopColor: 'rgba(0,0,0,.7)', borderRadius: '50%', display: 'inline-block', animation: 'spin .7s linear infinite' } }
                                />;
                            }

                            /* ── helpers ──────────────────────────────────────────────────── */
                            const delay = ms => new Promise(r => setTimeout(r, ms));

                            /* ── estilos base ─────────────────────────────────────────────── */
                            const styles = {
                                wrap: {
                                    position: 'fixed',
                                    inset: 0,
                                    zIndex: 200,
                                    background: 'var(--bg)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontFamily: "'DM Sans',sans-serif",
                                    padding: 16,
                                    overflow: 'auto'
                                },
                                bgBlob1: {
                                    position: 'absolute',
                                    top: '-20%',
                                    left: '-10%',
                                    width: 500,
                                    height: 500,
                                    borderRadius: '50%',
                                    background: 'radial-gradient(circle,rgba(0,212,160,.06) 0%,transparent 70%)',
                                    pointerEvents: 'none'
                                },
                                bgBlob2: {
                                    position: 'absolute',
                                    bottom: '-15%',
                                    right: '-5%',
                                    width: 400,
                                    height: 400,
                                    borderRadius: '50%',
                                    background: 'radial-gradient(circle,rgba(42,127,255,.06) 0%,transparent 70%)',
                                    pointerEvents: 'none'
                                },
                                card: {
                                    width: '100%',
                                    maxWidth: 430,
                                    position: 'relative',
                                    background: 'var(--surface)',
                                    border: '1px solid rgba(255,255,255,.1)',
                                    borderRadius: 24,
                                    padding: '32px 28px',
                                    boxShadow: '0 32px 64px rgba(0,0,0,.08)',
                                    backdropFilter: 'blur(20px)',
                                    maxHeight: '92vh',
                                    overflowY: 'auto'
                                },
                                title: {
                                    fontFamily: "'Syne',sans-serif",
                                    fontSize: 19,
                                    fontWeight: 700,
                                    color: 'var(--text)',
                                    margin: '0 0 6px'
                                },
                                sub: { fontSize: 13, color: 'var(--text2)', margin: 0 },
                                input: (err) => ({
                                    width: '100%',
                                    padding: '11px 14px',
                                    background: 'var(--surface3)',
                                    border: `1.5px solid ${err ? 'var(--danger)' : 'var(--border)'}`,
                                    borderRadius: 10,
                                    color: 'var(--text)',
                                    fontFamily: "'DM Sans',sans-serif",
                                    fontSize: 14,
                                    outline: 'none',
                                    boxSizing: 'border-box',
                                    display: 'block'
                                }),
                            };

                            // CSS global para spinner y autofill
                            const globalCss = `
    @keyframes spin { to { transform: rotate(360deg); } }
    input::placeholder { color: #4a5a7a !important; }
    input:-webkit-autofill { -webkit-box-shadow: 0 0 0 100px var(--surface3) inset !important; -webkit-text-fill-color: var(--text) !important; }
`;
                            if (typeof document !== 'undefined' && !document.getElementById('auth-css')) {
                                const s = document.createElement('style');
                                s.id = 'auth-css';
                                s.textContent = globalCss;
                                document.head.appendChild(s);
                            }