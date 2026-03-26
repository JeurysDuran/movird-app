// src/components/Common/Toast.js
import React, { useEffect } from 'react';
import { useApp } from '../../context/AppContext';

const Toast = () => {
    const { toast } = useApp();

    useEffect(() => {
        const el = document.getElementById('toast');
        if (el) {
            if (toast.show) {
                el.classList.add('show');
                el.style.background = toast.type === 'danger' ? 'var(--danger)' : 'var(--accent)';
                el.textContent = toast.message;
            } else {
                el.classList.remove('show');
            }
        }
    }, [toast]);

    return <div id = "toast"
    className = "glass" > < /div>;
};

export default Toast;