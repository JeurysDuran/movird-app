// src/components/Panels/ReportsPanel.js
import React from 'react';
import { useApp } from '../../context/AppContext';
import Card from '../Common/Card';
import { MdDirectionsCar, MdWarning, MdGroup, MdDirectionsTransit, MdLocalPolice, MdAttachMoney, MdConstruction } from 'react-icons/md';

const REPORT_TYPES = [
    { id: 'traffic', label: 'Tapón', icon: <MdDirectionsCar /> },
    { id: 'accident', label: 'Accidente', icon: <MdWarning /> },
    { id: 'strike', label: 'Huelga', icon: <MdConstruction /> },
    { id: 'closed', label: 'Ruta cerrada', icon: <MdConstruction /> },
    { id: 'police', label: 'Policía', icon: <MdLocalPolice /> },
    { id: 'price', label: 'Precio alto', icon: <MdAttachMoney /> },
    { id: 'nopass', label: 'No paró', icon: <MdDirectionsTransit /> },
    { id: 'theft', label: 'Robo', icon: <MdWarning /> },
    { id: 'empty', label: 'Poca gente', icon: <MdGroup /> }
];

const ReportsPanel = () => {
    const { activePanel, closePanel, addReport, reports } = useApp();
    const isOpen = activePanel === 'reports-panel';

    const handleReport = (typeId, label) => {
        addReport(typeId, label);
        closePanel();
    };

    const getReportIcon = (typeId) => {
        const type = REPORT_TYPES.find(t => t.id === typeId);
        // Reemplazar optional chaining con verificación tradicional
        return type ? type.icon : <MdWarning />;
    };

    return ( <
        div className = { `panel glass ${isOpen ? 'open' : ''}` }
        id = "reports-panel" >
        <
        div className = "panel-handle" > < /div> <
        div className = "panel-header" >
        <
        div className = "panel-title" > Reportar incidente < /div> <
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
        div className = "card-title text-muted mb-12" > ¿Qué está pasando en tu ruta ? < /div> <
        div className = "grid-3 mb-12" > {
            REPORT_TYPES.map(type => ( <
                button key = { type.id }
                className = "report-type-btn"
                onClick = {
                    () => handleReport(type.id, type.label) } >
                <
                span style = {
                    { fontSize: '20px' } } > { type.icon } < /span> { type.label } <
                /button>
            ))
        } <
        /div> <
        div className = "divider" > < /div> <
        div className = "card-title text-muted mt-12 mb-12" > Reportes recientes < /div> <
        div id = "recent-reports-list" > {
            reports.length === 0 ? ( <
                div className = "text-sm text-muted"
                style = {
                    { textAlign: 'center', padding: '18px' } } >
                Sin reportes recientes <
                /div>
            ) : (
                reports.slice(0, 8).map(r => ( <
                    div key = { r.id }
                    className = "list-item" >
                    <
                    div className = "list-icon"
                    style = {
                        { background: 'var(--surface3)', fontSize: '20px' } } > { getReportIcon(r.typeId) } <
                    /div> <
                    div style = {
                        { flex: 1 } } >
                    <
                    div className = "text-sm font-bold" > { r.label } < /div> <
                    div className = "text-xs text-muted" > { r.location }· { r.time } < /div> <
                    /div> {
                        r.verified ? ( <
                            span className = "chip chip-green" > Verificado < /span>
                        ) : ( <
                            span className = "chip"
                            style = {
                                { background: 'var(--surface3)', color: 'var(--text2)' } } >
                            Sin verificar <
                            /span>
                        )
                    } <
                    /div>
                ))
            )
        } <
        /div> <
        /div> <
        /div>
    );
};

export default ReportsPanel;