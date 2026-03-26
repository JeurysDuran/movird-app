// src/components/Layout/PanelOverlay.js
import React from 'react';
import { useApp } from '../../context/AppContext';

const PanelOverlay = () => {
    const { activePanel, activeSidePanel, closeAllPanels } = useApp();
    const isOpen = activePanel !== null || activeSidePanel !== null;

    return ( <
        div className = { `panel-overlay ${isOpen ? 'open' : ''}` }
        onClick = { closeAllPanels } > < /div>
    );
};

export default PanelOverlay;