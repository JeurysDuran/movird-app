// src/components/Auth/Login.js
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

const Login = ({ onSwitchToRegister }) => {
    const [email, setEmail] = useState('usuario@movird.com');
    const [password, setPassword] = useState('123456');
    const { login } = useApp();

    const handleSubmit = (e) => {
        e.preventDefault();
        login(email, password);
    };

    return ( <
        div id = "auth-login-view" >
        <
        div className = "auth-title" > Bienvenido < /div> <
        div className = "auth-sub" > Ingresa a tu cuenta para continuar < /div> <
        div className = "hint-box" >
        <
        b > Cuentas de prueba: < /b><br / >
        admin @movird.com / 123456 & nbsp;
        (Administrador) < br / >
        chofer @movird.com / 123456 & nbsp;
        (Chofer) < br / >
        usuario @movird.com / 123456 & nbsp;
        (Usuario) <
        /div> <
        form onSubmit = { handleSubmit } >
        <
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
        placeholder = "••••••••"
        value = { password }
        onChange = {
            (e) => setPassword(e.target.value) }
        /> <
        /div> <
        button type = "submit"
        className = "btn-main" > Entrar < /button> <
        /form> <
        div className = "auth-switch" > ¿No tienes cuenta ? < a onClick = { onSwitchToRegister } > Regístrate < /a> <
        /div> <
        /div>
    );
};

export default Login;