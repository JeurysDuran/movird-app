// src/components/Auth/AuthScreen.js
import React, { useState } from 'react';
import Login from './Login';
import Register from './Register';

const AuthScreen = () => {
    const [isLogin, setIsLogin] = useState(true);

    return ( <
        div id = "auth-screen" >
        <
        div className = "auth-card" >
        <
        div className = "auth-logo" >
        <
        div className = "auth-logo-icon" >
        <
        svg viewBox = "0 0 24 24" > < path d = "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" / > < /svg> <
        /div> <
        div className = "auth-logo-text" > Movi < span > RD < /span></div >
        <
        /div> {
            isLogin ? ( <
                Login onSwitchToRegister = {
                    () => setIsLogin(false) }
                />
            ) : ( <
                Register onSwitchToLogin = {
                    () => setIsLogin(true) }
                />
            )
        } <
        /div> <
        /div>
    );
};

export default AuthScreen;