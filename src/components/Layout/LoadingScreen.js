// src/components/Layout/LoadingScreen.js
import React from 'react';
import { useApp } from '../../context/AppContext';

const LoadingScreen = () => {
    const { loading } = useApp();

    if (!loading) return null;

    return ( <
        div id = "loading-screen" >
        <
        div className = "loader-logo" > Movi < span > RD < /span></div >
        <
        div className = "loader-bar" >
        <
        div className = "loader-bar-fill" > < /div> <
        /div> <
        div className = "text-muted text-sm"
        style = {
            { marginTop: '4px' } } > Iniciando plataforma... < /div> <
        /div>
    );
};

export default LoadingScreen;