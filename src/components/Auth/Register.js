// src/components/Auth/Register.js
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

const Register = ({ onSwitchToLogin }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('user');
    const { register } = useApp();

    const handleSubmit = (e) => {
        e.preventDefault();
        register(name, email, password, role);
    };

    const getRoleClass = (r) => `role-btn ${role === r ? 'active' : ''}`;

    return ( <
        div id = "auth-register-view" >
        <
        div className = "auth-title" > Crear cuenta < /div> <
        div className = "auth-sub" > Selecciona tu tipo de cuenta < /div> <
        div className = "role-grid" >
        <
        button type = "button"
        className = { getRoleClass('admin') }
        onClick = {
            () => setRole('admin') } >
        <
        svg viewBox = "0 0 24 24"
        fill = "currentColor" > < path d = "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z" / > < /svg>
        Administrador <
        /button> <
        button type = "button"
        className = { getRoleClass('driver') }
        onClick = {
            () => setRole('driver') } >
        <
        svg viewBox = "0 0 24 24"
        fill = "currentColor" > < path d = "M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99z" / > < /svg>
        Chofer <
        /button> <
        button type = "button"
        className = { getRoleClass('user') }
        onClick = {
            () => setRole('user') } >
        <
        svg viewBox = "0 0 24 24"
        fill = "currentColor" > < path d = "M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" / > < /svg>
        Usuario <
        /button> <
        /div> <
        form onSubmit = { handleSubmit } >
        <
        div className = "auth-input-group" >
        <
        label > Nombre completo < /label> <
        input className = "auth-input"
        placeholder = "Juan Perez"
        value = { name }
        onChange = {
            (e) => setName(e.target.value) }
        /> <
        /div> <
        div className = "auth-input-group" >
        <
        label > Correo electrónico < /label> <
        input className = "auth-input"
        type = "email"
        placeholder = "tu@correo.com"
        value = { email }
        onChange = {
            (e) => setEmail(e.target.value) }
        /> <
        /div> <
        div className = "auth-input-group" >
        <
        label > Contraseña < /label> <
        input className = "auth-input"
        type = "password"
        placeholder = "Mínimo 6 caracteres"
        value = { password }
        onChange = {
            (e) => setPassword(e.target.value) }
        /> <
        /div> <
        button type = "submit"
        className = "btn-main" > Crear cuenta < /button> <
        /form> <
        div className = "auth-switch" >
        <
        a onClick = { onSwitchToLogin } > Volver al inicio de sesión < /a> <
        /div> <
        /div>
    );
};

export default Register;